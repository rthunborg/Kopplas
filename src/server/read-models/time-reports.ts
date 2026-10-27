import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { readAllPages } from "./pagination";
import type { TimeReport, TimeReportActionDescriptor, TimeReportBookingPrefill, TimeReportQuery, TimeReportReadResult } from "@/features/time-reports/types";
import { isReportDate } from "@/features/time-reports/validation";
import { personalWeek, reportMinutesBetween, reportedBookedDelta, reportToday, reportWeekStart, shiftReportDate } from "@/features/time-reports/domain";
import { datesForRange, localDateForInstant, parseUtcInstant, stockholmLocalToUtc } from "@/features/scheduling/time-zone";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Row = Record<string, unknown>;
type Query = ReturnType<ReturnType<Client["from"]>["select"]>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUBLIC_COLUMNS = "id,user_id,report_date,duration_minutes,booking_id,job_id,note,status,booked_minutes_at_filing,created_at,review_note,reviewed_by,reviewed_at,review_revision";
const failure = (code: string): TimeReportReadResult => ({ ok: false, status: "error", code, message: code === "READ_FAILED" ? "Anslutning krävs. Försök igen." : "Tidrapporterna kan inte visas." });
function id(value: unknown): string { if (typeof value !== "string" || !UUID.test(value)) throw new Error("Invalid report projection"); return value; }
function nullableId(value: unknown): string | null { return value === null ? null : id(value); }
function text(value: unknown): string | null { if (value === null) return null; if (typeof value !== "string") throw new Error("Invalid report projection"); return value; }
function integer(value: unknown, minimum: number): number { if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new Error("Invalid report projection"); return value; }
function instant(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid report instant");
  const micros = parseUtcInstant(value);
  // Preserve authoritative microseconds; regular Postgres timestamps have the
  // familiar ISO millisecond representation consumed by existing browser inputs.
  return micros % BigInt(1000) === BigInt(0) ? new Date(Number(micros / BigInt(1000))).toISOString() : value;
}
async function allRows(client: Client, table: string, columns: string, tenantId: string,
  filter?: (query: Query) => Query): Promise<Row[]> {
  const result = await readAllPages<Row>(async (from, to) => {
    let query = client.from(table).select(columns).eq("tenant_id", tenantId) as unknown as Query;
    if (filter) query = filter(query);
    const reply = await query.order("id", { ascending: true }).range(from, to);
    return { data: Array.isArray(reply.data) ? reply.data as Row[] : null, error: reply.error ?? (!Array.isArray(reply.data) ? new Error("Read unavailable") : null) };
  });
  if (result.error) throw new Error("Report read unavailable");
  if (new Set(result.data.map(row => id(row.id))).size !== result.data.length) throw new Error("Duplicate report projection");
  return result.data;
}
async function ownContext(client: Client, tenantId: string, start: string, end: string): Promise<{ ownSelfPersonIds: string[]; bookings: TimeReportBookingPrefill[] }> {
  const { data, error } = await client.rpc("time_report_own_context", { p_tenant_id: tenantId, p_start: start, p_end: end });
  if (error || !data || !Array.isArray(data.ownSelfPersonIds) || !Array.isArray(data.bookings)) throw new Error("Own report context unavailable");
  const ownSelfPersonIds = data.ownSelfPersonIds.map(id);
  const bookings = data.bookings.map((row: Row): TimeReportBookingPrefill => {
    const startsAt = instant(row.startsAt), endsAt = instant(row.endsAt), minutes = reportMinutesBetween(startsAt, endsAt);
    // Null marks an interval that needs an explicit whole-minute declaration;
    // it does not erase the genuine booking or turn an own week into failure.
    return { bookingId: id(row.bookingId), startsAt, endsAt, jobId: nullableId(row.jobId), minutes,
      date: localDateForInstant(parseUtcInstant(startsAt)) };
  });
  return { ownSelfPersonIds, bookings };
}

/** Minimal descriptor for the three reusable BookingEntry hosts. Own IDs come
 * from the checked own-only selector; manager visibility never implies ownership.
 */
export async function readTimeReportActionDescriptor(options: { readonly client?: Client } = {}): Promise<TimeReportActionDescriptor> {
  try {
    const client = options.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await resolveTenantContext({ client });
    if (!context.ok || !resolveCapability({ roles: context.data.roles ?? [context.data.role], module: "scheduling", capability: "TimeReports.ReportOwn" }).granted) return { canReportOwn: false, ownSelfPersonIds: [] };
    const day = reportToday(), own = await ownContext(client, context.data.tenantId, stockholmLocalToUtc(`${day}T00:00:00`), stockholmLocalToUtc(`${shiftReportDate(day, 1)}T00:00:00`));
    return { canReportOwn: true, ownSelfPersonIds: own.ownSelfPersonIds };
  } catch { return { canReportOwn: false, ownSelfPersonIds: [] }; }
}

/** Cookie-bound ordinary client, all pages collected before publishing totals.
 * The injected client is a server-test seam, never an action-selectable identity.
 */
export async function readTimeReports(input: TimeReportQuery, options: { readonly client?: Client } = {}): Promise<TimeReportReadResult> {
  try {
    const client = options.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await resolveTenantContext({ client });
    if (!context.ok) return failure(context.code === "SERVER_ERROR" ? "READ_FAILED" : "ACCESS_DENIED");
    const { tenantId, userId } = context.data, roles = context.data.roles ?? [context.data.role];
    const canReportOwn = resolveCapability({ roles, module: "scheduling", capability: "TimeReports.ReportOwn" }).granted;
    const canReview = resolveCapability({ roles, module: "scheduling", capability: "TimeReports.Review" }).granted;
    if (!canReportOwn || (input.mode === "review" && !canReview)) return failure("ACCESS_DENIED");
    if (![undefined, "own", "review"].includes(input.mode) || (input.mode !== "review" && (input.personId || input.jobId))) return failure("ACCESS_DENIED");
    const date = input.week ?? input.weekStart ?? reportToday();
    if (!isReportDate(date) || [input.personId, input.jobId, input.prefillBookingId].some(value => value !== undefined && !UUID.test(value))) return failure("INVALID_INPUT");
    const weekStart = reportWeekStart(date), endDate = shiftReportDate(weekStart, 7);
    const start = stockholmLocalToUtc(`${weekStart}T00:00:00`), end = stockholmLocalToUtc(`${endDate}T00:00:00`);
    const own = await ownContext(client, tenantId, start, end);
    const reportRows = await allRows(client, "time_reports", PUBLIC_COLUMNS, tenantId, q => {
      let query = q.gte("report_date", weekStart).lt("report_date", endDate);
      if (input.mode !== "review") query = query.eq("user_id", userId);
      return query;
    });
    const jobRows = await allRows(client, "jobs", "id,title", tenantId);
    const jobs = jobRows.map(row => { if (typeof row.title !== "string") throw new Error("Invalid job projection"); return { id: id(row.id), label: row.title }; });
    const allReports: TimeReport[] = reportRows.map(row => {
      if (row.status !== "submitted" || !isReportDate(row.report_date)) throw new Error("Invalid report projection");
      const minutes = integer(row.duration_minutes, 1), bookedMinutesAtFiling = row.booked_minutes_at_filing === null ? null : row.booked_minutes_at_filing;
      if (bookedMinutesAtFiling !== null && (typeof bookedMinutesAtFiling !== "number" || !Number.isFinite(bookedMinutesAtFiling) || bookedMinutesAtFiling <= 0)) throw new Error("Invalid booked comparison");
      const report: TimeReport = { id: id(row.id), userId: id(row.user_id), date: row.report_date, minutes, bookingId: nullableId(row.booking_id), jobId: nullableId(row.job_id),
        note: text(row.note), status: "submitted", bookedMinutesAtFiling, createdAt: instant(row.created_at), reviewNote: text(row.review_note), reviewRevision: integer(row.review_revision, 0),
        reviewedBy: nullableId(row.reviewed_by), reviewedAt: row.reviewed_at === null ? null : instant(row.reviewed_at),
        ...(jobs.some(job => job.id === row.job_id) ? { jobLabel: jobs.find(job => job.id === row.job_id)!.label } : {}) };
      return { ...report, deltaMinutes: reportedBookedDelta(report) };
    });
    // Keep this week's authorized filter options stable while selecting a person
    // or job. Filtering a complete authorized week avoids a disappearing selector.
    const reports = allReports.filter(report => (!input.personId || report.userId === input.personId) && (!input.jobId || report.jobId === input.jobId));
    const people = [...new Set(allReports.map(report => report.userId))].sort().map(person => ({ id: person, label: `Person ${person.slice(0, 8)}` }));
    if (input.mode === "review" && people.length) {
      const [{ readBookingPeople }, memberships, profiles] = await Promise.all([
        import("@/features/resources/bookings-read"),
        allRows(client, "tenant_memberships", "id,user_id", tenantId),
        allRows(client, "person_profiles", "id,membership_id", tenantId),
      ]);
      const identities = await readBookingPeople(client, tenantId, userId);
      for (const person of people) {
        const membership = memberships.find(row => row.user_id === person.id), profile = profiles.find(row => row.membership_id === membership?.id);
        const identity = identities.find(row => row.id === profile?.id);
        if (typeof identity?.label === "string" && identity.label.trim()) person.label = identity.label.trim();
      }
    }
    const bookings = own.bookings.map(booking => ({ ...booking, ...(jobs.some(job => job.id === booking.jobId) ? { jobLabel: jobs.find(job => job.id === booking.jobId)!.label } : {}) }));
    const periodStart = parseUtcInstant(start), periodEnd = parseUtcInstant(end);
    const bookedDates = [...new Set(bookings.flatMap(booking => {
      const bookingStart = parseUtcInstant(booking.startsAt), bookingEnd = parseUtcInstant(booking.endsAt);
      return datesForRange({ start: bookingStart > periodStart ? bookingStart : periodStart, end: bookingEnd < periodEnd ? bookingEnd : periodEnd });
    }))].sort();
    const personal = personalWeek({ weekStart, userId, reports, bookedDates });
    const totalMinutes = reports.reduce((total, row) => total + row.minutes, 0);
    if (!Number.isSafeInteger(totalMinutes)) throw new Error("Report total overflow");
    const byPerson = [...new Set(reports.map(row => row.userId))].sort().map(person => ({ userId: person, minutes: reports.filter(row => row.userId === person).reduce((sum, row) => sum + row.minutes, 0) }));
    const byJob = [...new Set(reports.map(row => row.jobId))].map(job => ({ jobId: job, minutes: reports.filter(row => row.jobId === job).reduce((sum, row) => sum + row.minutes, 0) }));
    return { ok: true, status: "success", data: { userId, canReportOwn, canReview, weekStart, reports, bookedDates, jobs,
      people: input.mode === "review" ? people : [],
      bookings, prefill: bookings.find(booking => booking.bookingId === input.prefillBookingId) ?? null,
      totalMinutes, missingDates: personal.missingDates, byPerson, byJob } };
  } catch { return failure("READ_FAILED"); }
}
