import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { chunkValues, readAllPages } from "./pagination";
import { schedulingPeriod, validateSchedulingReadInput } from "@/features/scheduling/view-model";
import { DEFAULT_SCHEDULING_RULES } from "@/features/scheduling/types";
import { bookingRange } from "@/features/scheduling/capacity";
import { buildScheduleReadShifts } from "@/features/resources/schedule-read";
import { validateWorkHoursInput } from "@/features/resources/work-hours";
import { validateCapacityInputs } from "@/features/resources/capacity-inputs";
import type { SchedulingReadInput, SchedulingReadResult, SchedulingBookingSummary } from "@/features/scheduling/view-types";
import { defaultSchedulingInput } from "@/features/scheduling/view-preferences";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Row = Record<string, unknown>;
type Query = ReturnType<ReturnType<Client["from"]>["select"]>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RETRY = "Planeringen kunde inte läsas. Försök igen.";
const DENIED = "Du har inte behörighet att läsa planeringen.";
const INVALID = "Planeringens val är ogiltiga. Återställ och försök igen.";
const WITHHELD = ["options", "roster", "workRoles", "capacity", "openConflictCount", "bookings.needsReassignment"];
class ReadFailure extends Error { constructor(readonly code: string) { super("Scheduling read failed"); } }
const nullable = (value: unknown) => typeof value === "string" ? value : null;
function uuid(value: unknown): string { if (typeof value !== "string" || !UUID.test(value)) throw new ReadFailure("IO"); return value; }
function failure(message: string, actorId = "", tenantId = "", authority = {canView:false,canManage:false}): SchedulingReadResult {
  return { data: { canView:false,canManage:false, actorId, tenantId, bookings: [], ownSelfPersonIds: [], error: message,
    errorKind:message===RETRY?"retryable":message===DENIED?"denied":"invalid",
    ...(message===RETRY && authority.canView ? {confirmedAuthority:{canView:true as const,canManage:authority.canManage}} : {}) }, entitlements: { withheld: WITHHELD } };
}

/** Every page is collected before anything is published; no nested relation cap. */
async function rows(client: Client, table: string, columns: string, tenantId: string,
  predicate?: (query: Query) => Query): Promise<Row[]> {
  const result = await readAllPages<Row>(async (from, to) => {
    let query = client.from(table).select(columns).eq("tenant_id", tenantId) as unknown as Query;
    if (predicate) query = predicate(query);
    const reply = await query.order("id", { ascending: true }).range(from, to);
    return {data:Array.isArray(reply.data) ? reply.data as Row[] : null,error:reply.error ?? (!Array.isArray(reply.data) ? new ReadFailure("IO") : null)};
  });
  if (result.error) throw new ReadFailure((result.error as { code?: string }).code === "42501" ? "42501" : "IO");
  return result.data;
}

/** JSON avoids server row caps; validate exact ordered two-key completeness per batch. */
export async function readBookingReassignmentFlags(client: Pick<Client, "rpc">, tenantId: string, bookingIds: readonly string[]): Promise<ReadonlyMap<string, boolean>> {
  if (new Set(bookingIds).size !== bookingIds.length) throw new ReadFailure("IO");
  const flags = new Map<string, boolean>();
  for (const ids of chunkValues(bookingIds)) {
    const reply = await client.rpc("booking_reassignment_flags", { p_tenant_id: tenantId, p_booking_ids: ids });
    if (reply.error) throw new ReadFailure(reply.error.code === "42501" ? "42501" : reply.error.code === "23514" ? "23514" : "IO");
    if (!Array.isArray(reply.data) || reply.data.length !== ids.length) throw new ReadFailure("IO");
    for (const [index, value] of reply.data.entries()) {
      if (!value || typeof value !== "object" || Array.isArray(value)
        || Object.keys(value).sort().join(",") !== "bookingId,needsReassignment"
        || value.bookingId !== ids[index] || !UUID.test(value.bookingId)
        || typeof value.needsReassignment !== "boolean" || flags.has(value.bookingId)) throw new ReadFailure("IO");
      flags.set(value.bookingId, value.needsReassignment);
    }
  }
  return flags;
}

/** Cookie-bound production default; injected authenticated client is solely a test seam. */
export async function readScheduling(input: SchedulingReadInput, options: { readonly client?: Client; readonly initial?: boolean } = {}): Promise<SchedulingReadResult> {
  let actorId = "", tenantId = "";
  let authority = {canView:false,canManage:false};
  try {
    const client = options.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await resolveTenantContext({ client });
    if (!context.ok) return failure(context.code === "SERVER_ERROR" ? RETRY : DENIED);
    ({ userId: actorId, tenantId } = context.data);
    const roles = context.data.roles ?? [context.data.role];
    if (!resolveCapability({ roles, module: "scheduling", capability: "Bookings.View" }).granted) return failure(DENIED, actorId, tenantId);
    const canManage = resolveCapability({ roles, module: "resources", capability: "Bookings.Manage" }).granted;
    authority = {canView:true,canManage};
    // Server-only initial route selection, after current capability resolution.
    if (options.initial && !canManage) input = defaultSchedulingInput("personal", input.date);
    try {
      validateSchedulingReadInput(input);
      if ([input.filters.personIds,input.filters.workRoleIds,input.filters.jobIds,input.filters.customerIds].some(ids => ids.some(id => !UUID.test(id)))) throw new Error();
    } catch { return failure(INVALID, actorId, tenantId); }
    if (!canManage && (input.view !== "personal" || [input.filters.personIds,input.filters.workRoleIds,input.filters.jobIds,input.filters.customerIds].some(ids => ids.length))) return failure(DENIED, actorId, tenantId);
    const period = schedulingPeriod(input.date, input.mode);
    const bookingRows = await rows(client, "bookings", "id,starts_at,ends_at,all_day,work_role_id,job_id,customer_id,facility_id,contact_id,description,status,series_id,occurrence_index,is_exception,nominal_date", tenantId,
      q => q.lt("starts_at", period.end).gt("ends_at", period.start));
    const ids = bookingRows.map(row => uuid(row.id));
    if (new Set(ids).size !== ids.length) throw new ReadFailure("IO");
    const assignments: Row[] = [];
    for (const batch of chunkValues(ids)) assignments.push(...await rows(client, "booking_assignees", "id,booking_id,person_profile_id", tenantId, q => q.in("booking_id", batch)));
    const summaries: SchedulingBookingSummary[] = bookingRows.map(row => {
      if (!['planned','cancelled'].includes(String(row.status)) || typeof row.all_day !== "boolean" || typeof row.description !== "string") throw new ReadFailure("IO");
      const booking: SchedulingBookingSummary = { id: uuid(row.id), startsAt: String(row.starts_at), endsAt: String(row.ends_at), allDay: row.all_day,
        workRoleId: nullable(row.work_role_id), jobId: nullable(row.job_id), customerId: nullable(row.customer_id), facilityId: nullable(row.facility_id), contactId: nullable(row.contact_id),
        description: row.description, status: row.status as "planned" | "cancelled", assigneeIds: [...new Set(assignments.filter(a => a.booking_id === row.id).map(a => uuid(a.person_profile_id)))].sort(),
        seriesId: nullable(row.series_id), occurrenceIndex: typeof row.occurrence_index === "number" ? row.occurrence_index : null,
        isException: row.is_exception === true, nominalDate: nullable(row.nominal_date), openConflictCount: 0 };
      bookingRange(booking);
      if (!booking.assigneeIds.length) throw new ReadFailure("IO");
      return booking;
    }).sort((a,b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id));
    const { openBookingConflictCounts } = await import("@/features/resources/bookings-read");
    const conflicts: Row[] = [];
    // Keep each request at <=50 ID terms; an OR would duplicate the bounded batch.
    for (const batch of chunkValues(ids)) {
      for (const column of ["booking_id", "related_booking_id"] as const) {
        conflicts.push(...await rows(client, "booking_conflicts", "id,booking_id,related_booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key,status", tenantId,
          q => q.in(column, batch)));
      }
    }
    let counts = openBookingConflictCounts([...new Map(conflicts.map(r => [uuid(r.id),r])).values()] as never, ids);
    if(canManage){
      const scan=await (await import("./booking-conflicts")).scanBookingConflicts(client,tenantId,actorId);
      const groups=scan.groups.filter(g=>g.status==="open"&&g.bookingIds.some(id=>ids.includes(id)));
      counts={count:groups.length,byBooking:new Map(ids.map(id=>[id,groups.filter(g=>g.bookingIds.includes(id)).length]))};
    }
    const counted = summaries.map(b => ({...b,openConflictCount:counts.byBooking.get(b.id) ?? 0}));
    if (!canManage) {
      // The RLS association slice is own-only, including shared bookings. No profile lookup.
      const ownSelfPersonIds = [...new Set(summaries.flatMap(b => b.assigneeIds))];
      return { data: { canView: true, canManage: false, actorId, tenantId, bookings: counted, ownSelfPersonIds, error: null }, entitlements: { withheld: WITHHELD } };
    }
    const { readBookingPeople, readBookingEditorOptions, bookingPersonLabel } = await import("@/features/resources/bookings-read");
    const [flags, profiles, hours, calendar, people, editorOptions, ownMemberships, historicalRoles] = await Promise.all([
      readBookingReassignmentFlags(client, tenantId, ids),
      rows(client, "person_profiles", "id,membership_id,default_work_role_id", tenantId),
      rows(client, "person_work_hours", "id,person_profile_id,entry_kind,weekday,starts_at,ends_at,local_date,exception_kind", tenantId),
      rows(client, "tenant_calendar_days", "id,local_date,variant,reduction_percent", tenantId),
      readBookingPeople(client, tenantId, actorId),
      readBookingEditorOptions({client}),
      rows(client, "tenant_memberships", "id", tenantId, q => q.eq("user_id", actorId).eq("status", "active")),
      rows(client, "work_roles", "id,display_name", tenantId),
    ]);
    const bookings = summaries.map(b => ({...b, needsReassignment: flags.get(b.id)!, openConflictCount: counts.byBooking.get(b.id) ?? 0}));
    const labels = new Map(people.map(p => [uuid(p.id), bookingPersonLabel(uuid(p.id), p.label)]));
    const roster = profiles.map(p => ({id: uuid(p.id),label: labels.get(uuid(p.id)) ?? bookingPersonLabel(uuid(p.id)),workRoleIds: typeof p.default_work_role_id === "string" ? [p.default_work_role_id] : []}));
    const workRoles = historicalRoles.map(role => { if (typeof role.display_name !== "string" || !role.display_name.trim()) throw new ReadFailure("IO"); return {id:uuid(role.id),label:role.display_name}; });
    const ownSelfPersonIds = profiles.filter(p => ownMemberships.some(m => m.id === p.membership_id)).map(p => uuid(p.id));
    const defaultShifts = buildScheduleReadShifts(hours.filter(h => h.person_profile_id === null));
    for (const hour of hours) {
      if (!['weekly_shift','weekly_break','exception'].includes(String(hour.entry_kind))
        || (hour.entry_kind !== 'exception' && (typeof hour.weekday !== 'number' || typeof hour.starts_at !== 'string' || typeof hour.ends_at !== 'string')))
        throw new ReadFailure("IO");
    }
    const calendarDays = calendar.map(c => ({date: String(c.local_date),variant: String(c.variant),...(c.reduction_percent !== null ? {reductionPercent: Number(c.reduction_percent)} : {})}));
    if (calendarDays.some(c => !validateCapacityInputs({calendarDay:c}).ok)) throw new ReadFailure("IO");
    const capacityPeople = profiles.map(p => {
      const owned = hours.filter(h => h.person_profile_id === p.id);
      const weekly = owned.filter(h => h.entry_kind !== "exception");
      const shifts = weekly.length ? buildScheduleReadShifts(weekly) : defaultShifts;
      const exceptions = owned.filter(h => h.entry_kind === "exception").map(h => ({kind:String(h.exception_kind),date:String(h.local_date),...(h.starts_at !== null ? {start:String(h.starts_at),end:String(h.ends_at)} : {})}));
      if (!validateWorkHoursInput({shifts}).ok || !validateCapacityInputs({exceptions}).ok) throw new ReadFailure("IO");
      return {id:uuid(p.id),shifts,exceptions};
    });
    const { schedulingCapacityCells } = await import("@/features/scheduling/view-capacity");
    const capacity = schedulingCapacityCells({calendarDays,rules:DEFAULT_SCHEDULING_RULES}, capacityPeople, bookings, period.dates);
    if (editorOptions.error) throw new ReadFailure("IO");
    if (!editorOptions.canManage) throw new ReadFailure("42501");
    return { data: {canView:true,canManage:true,actorId,tenantId,bookings,ownSelfPersonIds,error:null,roster,workRoles,capacity,openConflictCount:counts.count,...(editorOptions ? {options:editorOptions} : {})},entitlements:{withheld:[]} };
  } catch (error) {
    const message = error instanceof ReadFailure && error.code === "42501" ? DENIED : error instanceof ReadFailure && error.code === "23514" ? INVALID : RETRY;
    return failure(message, actorId, tenantId, message===RETRY?authority:undefined);
  }
}
