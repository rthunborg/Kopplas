import type { SchedulingReadData, SchedulingReadResult, SchedulingBookingSummary, SchedulingFilters, SchedulingPeriodMode, SchedulingReadInput, SchedulingView } from "./view-types";
import { bookingRange } from "./capacity";
import { formatUtcInstant, intersectRanges, localDateForInstant, nextLocalDate, parseUtcInstant, stockholmLocalToUtc, validateLocalDate, weekdayForDate } from "./time-zone";
export const EMPTY_SCHEDULING_FILTERS: SchedulingFilters = {personIds: [], workRoleIds: [], jobIds: [], customerIds: [], status: "planned"};
export const viewModes = (view: SchedulingView): readonly SchedulingPeriodMode[] => view === "team" ? ["week"] : view === "resources" || view === "personal" ? ["day", "week"] : ["day", "week", "month"];
function dateString(value: Date): string {
  const date = value.toISOString().split("T")[0]!;
  validateLocalDate(date); // Reject an unrepresentable navigation edge before publishing it.
  return date;
}
function calendarDate(year: number, month: number, day: number): Date {
  const value = new Date(0);
  value.setUTCFullYear(year, month, day); // Date.UTC remaps years 0–99 into 1900–1999.
  return value;
}
export function shiftDate(date: string, days: number): string { validateLocalDate(date); return dateString(new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000)); }
/** Calendar months preserve the selected day where possible and clamp month ends. */
export function navigateSchedulingDate(date: string, mode: SchedulingPeriodMode, direction: -1 | 1): string {
  validateLocalDate(date);
  if (mode !== "month") return shiftDate(date, direction * (mode === "week" ? 7 : 1));
  const target = calendarDate(Number(date.slice(0,4)), Number(date.slice(5,7))-1+direction, 1);
  const last = calendarDate(target.getUTCFullYear(), target.getUTCMonth()+1, 0).getUTCDate();
  target.setUTCDate(Math.min(Number(date.slice(8,10)), last));
  return dateString(target);
}
export function schedulingPeriod(date: string, mode: SchedulingPeriodMode) {
  validateLocalDate(date);
  const first = mode === "week" ? shiftDate(date, 1-weekdayForDate(date)) : mode === "month" ? `${date.slice(0,7)}-01` : date;
  const after = mode === "week" ? shiftDate(first,7) : mode === "month" ? dateString(calendarDate(Number(date.slice(0,4)), Number(date.slice(5,7)),1)) : shiftDate(first,1);
  const days = (Date.parse(`${after}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86400000;
  if (!Number.isInteger(days) || days < 1 || days > 31) throw new Error("Invalid scheduling period");
  const range = {start: parseUtcInstant(stockholmLocalToUtc(`${first}T00:00:00`)), end: parseUtcInstant(stockholmLocalToUtc(`${after}T00:00:00`))};
  if (range.end <= range.start) throw new Error("Invalid scheduling period");
  return {start: formatUtcInstant(range.start), end: formatUtcInstant(range.end), dates: Array.from({length:days},(_,index)=>shiftDate(first,index))};
}
export function validateSchedulingReadInput(input: SchedulingReadInput): SchedulingReadInput {
  if (!input || !["schema","resources","team","capacity","personal"].includes(input.view) || !viewModes(input.view).includes(input.mode)) throw new Error("Invalid scheduling view");
  schedulingPeriod(input.date,input.mode);
  const f = input.filters;
  if (!f || !["planned","cancelled","all"].includes(f.status) || [f.personIds,f.workRoleIds,f.jobIds,f.customerIds].some(ids => !Array.isArray(ids) || ids.length > 500 || ids.some(id => typeof id !== "string" || !id) || new Set(ids).size !== ids.length)) throw new Error("Invalid scheduling filters");
  return input;
}
export function eligibleBookings(bookings: readonly SchedulingBookingSummary[], input: SchedulingReadInput): SchedulingBookingSummary[] {
  const period = schedulingPeriod(input.date,input.mode), range = {start: parseUtcInstant(period.start),end: parseUtcInstant(period.end)}, f=input.filters;
  const match = (ids: readonly string[], value: string | null) => !ids.length || value !== null && ids.includes(value);
  return bookings.filter(b => intersectRanges(bookingRange(b),range) && (f.status === "all" || b.status === f.status) && (!f.personIds.length || b.assigneeIds.some(id=>f.personIds.includes(id))) && match(f.workRoleIds,b.workRoleId) && match(f.jobIds,b.jobId) && match(f.customerIds,b.customerId)).sort((a,b)=>parseUtcInstant(a.startsAt)<parseUtcInstant(b.startsAt)?-1:parseUtcInstant(a.startsAt)>parseUtcInstant(b.startsAt)?1:a.id.localeCompare(b.id));
}
export function projectScheduling(bookings: readonly SchedulingBookingSummary[], input: SchedulingReadInput, selfIds: readonly string[]) {
  const eligible=eligibleBookings(bookings,input), resources: Record<string,SchedulingBookingSummary[]>={}, team: Record<string,SchedulingBookingSummary[]>={};
  for(const b of eligible) { for(const id of new Set(b.assigneeIds)) (resources[id]??=[]).push(b); (team[b.workRoleId??"unassigned"]??=[]).push(b); }
  return {schema:eligible,resources,team,personal:eligible.filter(b=>b.assigneeIds.some(id=>selfIds.includes(id))),uniqueCount:eligible.length,reassignment:eligible.filter(b=>b.status === "planned" && b.needsReassignment === true)};
}
export function normalizeSlotSelection(first: string,last: string,personId?: string) { const a=parseUtcInstant(first),b=parseUtcInstant(last);return {startsAt:formatUtcInstant(a<b?a:b),endsAt:formatUtcInstant((a>b?a:b)+BigInt(1800000000)),...(personId?{personId}:{})}; }
export function resourceMoveAssignees(ids: readonly string[], from: string, to: string): string[] {return [...new Set(ids.map(id=>id===from?to:id))];}

/** All-day proposals preserve civil days, not elapsed hours across Stockholm DST. */
export function calendarDropTimes(booking: Pick<SchedulingBookingSummary,"startsAt"|"endsAt"|"allDay">,
  start: string, end: string, resize: boolean): {startsAt?:string;endsAt:string} | null {
  const originalStart = parseUtcInstant(booking.startsAt), originalEnd = parseUtcInstant(booking.endsAt);
  if (!booking.allDay) return resize ? (parseUtcInstant(end)>originalStart ? {endsAt:end} : null) :
    {startsAt:start,endsAt:formatUtcInstant(parseUtcInstant(start)+originalEnd-originalStart)};
  if (resize) {
    const after = nextLocalDate(localDateForInstant(parseUtcInstant(end)-BigInt(1)));
    const endsAt = stockholmLocalToUtc(`${after}T00:00:00`);
    return parseUtcInstant(endsAt)>originalStart ? {endsAt} : null;
  }
  const days = (Date.parse(`${localDateForInstant(originalEnd)}T00:00:00Z`) - Date.parse(`${localDateForInstant(originalStart)}T00:00:00Z`))/86400000;
  if (!Number.isInteger(days) || days<1) throw new Error("Invalid all-day booking");
  const date = localDateForInstant(parseUtcInstant(start));
  return {startsAt:stockholmLocalToUtc(`${date}T00:00:00`),endsAt:stockholmLocalToUtc(`${shiftDate(date,days)}T00:00:00`)};
}

export const SCHEDULING_READ_RETRY = "Planeringen kunde inte läsas. Försök igen.";

/** UI metadata only: never retain bookings, capacity, counts or editor drafts on failure. */
export function schedulingToolbarData(previous: SchedulingReadData, current: SchedulingReadData): SchedulingReadData {
  if (current.errorKind!=="retryable" || !current.confirmedAuthority?.canView || !previous.canView ||
      !current.actorId || !current.tenantId || current.actorId!==previous.actorId || current.tenantId!==previous.tenantId ||
      current.confirmedAuthority.canManage!==previous.canManage) return current;
  return {...current,...current.confirmedAuthority, ...(current.confirmedAuthority.canManage ? {roster:previous.roster,workRoles:previous.workRoles,options:previous.options} : {})};
}

export function schedulingReadException(): SchedulingReadResult {
  return {data:{canView:false,canManage:false,actorId:"",tenantId:"",bookings:[],ownSelfPersonIds:[],error:SCHEDULING_READ_RETRY,errorKind:"retryable"},entitlements:{withheld:[]}};
}

/** The workspace uses this exact sequence guard for both the first and reconciled read. */
export async function runSchedulingRead(requested: SchedulingReadInput, ports: {
  sequence:{current:number}; read:(input:SchedulingReadInput)=>Promise<SchedulingReadResult>;
  start:()=>void; reconcile:(value:SchedulingReadResult,input:SchedulingReadInput)=>SchedulingReadInput | undefined;
  publish:(value:SchedulingReadResult)=>void; failed:()=>void; finish:()=>void;
}): Promise<void> {
  const ticket=++ports.sequence.current;
  const latest=()=>ticket===ports.sequence.current;
  ports.start();
  try {
    let value=await ports.read(requested);
    if (!latest()) return;
    const revised=ports.reconcile(value,requested);
    if (revised) {
      value=await ports.read(revised);
      if (!latest()) return;
    }
    ports.publish(value);
  } catch { if (latest()) ports.failed(); }
  finally { if (latest()) ports.finish(); }
}
