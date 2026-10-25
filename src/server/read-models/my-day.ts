import { createHash } from "node:crypto";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { SCOPE_MANIFEST } from "@/scope/manifest";
import { myDayAgenda, myDayPeriod, myDayToday, validateMyDaySelection } from "@/features/my-day/domain";
import { localDateForInstant, parseUtcInstant } from "@/features/scheduling/time-zone";
import { reportMinutesBetween } from "@/features/time-reports/domain";
import type { MyDayBooking, MyDayJob, MyDayNotice, MyDayQuery, MyDayReadResult } from "@/features/my-day/types";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Row = Record<string, unknown>;
type Options = { readonly client?: Client; readonly isModuleActive?: (module: string) => boolean;
  readonly noticeLimit?: number; readonly resolveCapability?: typeof resolveCapability };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const failure = (code: "DENIED" | "UNAVAILABLE" | "INVALID_INPUT"): MyDayReadResult => ({ ok: false, code,
  message: code === "UNAVAILABLE" ? "Anslutning krävs" : code === "DENIED" ? "Du har inte behörighet att visa sidan." : "Välj ett giltigt datum." });
function row(value: unknown): Row { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid projection"); return value as Row; }
function id(value: unknown): string { if (typeof value !== "string" || !UUID.test(value)) throw new Error("Invalid identity"); return value; }
function text(value: unknown): string | null { if (value === null) return null; if (typeof value !== "string") throw new Error("Invalid text"); return value; }
function instant(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid instant");
  const micros = parseUtcInstant(value);
  return micros % BigInt(1000) === BigInt(0) ? new Date(Number(micros / BigInt(1000))).toISOString() : value;
}
function list(value: unknown): unknown[] { if (!Array.isArray(value)) throw new Error("Invalid list"); return value; }
function unique<T extends { id: string }>(rows: T[]): T[] { if (new Set(rows.map(r => r.id)).size !== rows.length) throw new Error("Duplicate projection"); return rows; }

/** Filter BEFORE the cap. Existing recipient RLS is retained; never infer a booking
 * from logical_subject_id, which belongs to the producer's audit event. */
export async function readMyDayBookingNotices(client: Client, tenantId: string, userId: string, limit = 5, page = 1) {
  try {
    const cap = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 20) : 5;
    const { data, error } = await client.from("notifications").select("id,title,body,route,created_at")
      .eq("tenant_id", tenantId).eq("recipient_user_id", userId).eq("category", "booking.changed").is("read_at", null)
      .order("created_at", { ascending: false }).order("id", { ascending: true }).range((page - 1) * cap, page * cap);
    if (error || !Array.isArray(data)) throw new Error("Notice read failed");
    const notices = unique(data.slice(0, cap).map((value: unknown): MyDayNotice => {
      const r = row(value);
      if (r.route !== "/scheduling") throw new Error("Invalid notice route");
      const title = text(r.title), body = text(r.body);
      if (title === null || body === null) throw new Error("Invalid notice copy");
      return { id: id(r.id), title, body, route: "/scheduling", createdAt: instant(r.created_at) };
    }));
    return { notices, noticesHasMore: data.length > cap, noticesMoreHref: null, noticePage: page, noticesUnavailable: false };
  } catch { return { notices: [], noticesHasMore: false, noticesMoreHref: null, noticePage: page, noticesUnavailable: true }; }
}

/** One ordinary cookie-bound request; injected dependencies are server-test seams.
 * Input provides a date/mode only. Client tenant, actor, roles and includeJobs
 * properties are never read, forwarded or serialized. */
export async function readMyDay(input: MyDayQuery = {}, options: Options = {}): Promise<MyDayReadResult> {
  let renderContextKey: string | undefined;
  const fail = (code: "DENIED" | "UNAVAILABLE" | "INVALID_INPUT"): MyDayReadResult => ({ ...failure(code), ...(renderContextKey ? { renderContextKey } : {}) });
  try {
    const client = options.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await resolveTenantContext({ client });
    if (!context.ok) return context.code === "SERVER_ERROR" ? fail("UNAVAILABLE") : { ...failure("DENIED"), renderContextKey: "denied" };
    // Presentation lifetime only. This digest is never accepted as read/write authority.
    renderContextKey = createHash("sha256").update(JSON.stringify([context.data.userId, context.data.tenantId])).digest("hex");
    const active = options.isModuleActive ?? ((name: string) => SCOPE_MANIFEST.modules.some(m => m.id === name && m.status === "active"));
    const capability = options.resolveCapability ?? resolveCapability;
    const roles = context.data.roles ?? [context.data.role];
    if (!active("scheduling") || !capability({ roles, module: "scheduling", capability: "Bookings.View" }).granted) return fail("DENIED");
    const date = input.date ?? myDayToday(), mode = input.mode ?? "day";
    let period: ReturnType<typeof myDayPeriod>;
    try { validateMyDaySelection(date); period = myDayPeriod(date, mode); } catch { return fail("INVALID_INPUT"); }
    const noticePage = input.noticePage ?? 1;
    if (!Number.isSafeInteger(noticePage) || noticePage < 1 || noticePage > 1000000) return fail("INVALID_INPUT");
    const jobsActive = active("jobs"), canReportOwn = capability({ roles, module: "scheduling", capability: "TimeReports.ReportOwn" }).granted;
    const { data, error } = await client.rpc("read_my_day", { p_tenant_id: context.data.tenantId,
      p_start: period.start, p_end: period.end, p_include_jobs: jobsActive });
    if (error) return fail((error as { code?: string }).code === "42501" ? "DENIED" : "UNAVAILABLE");
    const projection = row(data);
    // Validate the linked own-profile evidence, but never send these identities.
    list(projection.ownSelfPersonIds).map(id);
    const bookings = unique(list(projection.bookings).map((value): MyDayBooking => {
      const r = row(value), bookingId = id(r.id), startsAt = instant(r.startsAt), endsAt = instant(r.endsAt);
      if (parseUtcInstant(endsAt) <= parseUtcInstant(startsAt) || typeof r.allDay !== "boolean" || typeof r.canReportBooking !== "boolean") throw new Error("Invalid booking");
      const jobId = jobsActive ? r.jobId === null ? null : id(r.jobId) : null;
      const jobLabel = jobsActive ? text(r.jobLabel) : null;
      const prefill = canReportOwn && r.canReportBooking ? { bookingId, startsAt, endsAt, jobId,
        ...(jobLabel !== null ? { jobLabel } : {}), minutes: reportMinutesBetween(startsAt, endsAt), date: localDateForInstant(parseUtcInstant(startsAt)) } : null;
      return { id: bookingId, startsAt, endsAt, allDay: r.allDay, description: text(r.description), ownAssignment: text(r.ownAssignment),
        ...(jobsActive ? { jobId, jobLabel } : {}), customerLabel: text(r.customerLabel), address: text(r.address), timeReportPrefill: prefill };
    }));
    const activeJobs = jobsActive ? unique(list(projection.activeJobs).map((value): MyDayJob => {
      const r = row(value), title = text(r.title), customerLabel = text(r.customerLabel);
      if (title === null || (r.status !== "created" && r.status !== "in_progress") || !["arbetsledare", "member", "booking_assignee"].includes(String(r.myRole))) throw new Error("Invalid job");
      return { id: id(r.id), title, customerLabel, status: r.status, myRole: r.myRole as MyDayJob["myRole"] };
    })) : undefined;
    // Even suppressed job payload must be structurally valid at the RPC boundary.
    if (!jobsActive && list(projection.activeJobs).length !== 0) throw new Error("Unexpected pending jobs");
    const notices = await readMyDayBookingNotices(client, context.data.tenantId, context.data.userId, options.noticeLimit, noticePage);
    return { ok: true, renderContextKey, data: { date, mode, dates: period.dates, bookings: myDayAgenda(bookings, period),
      ...(jobsActive ? { activeJobs } : {}), jobsActive, canReportOwn, ...notices } };
  } catch { return fail("UNAVAILABLE"); }
}
