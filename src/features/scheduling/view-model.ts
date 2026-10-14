import type { SchedulingBookingSummary, SchedulingFilters, SchedulingPeriodMode, SchedulingReadInput, SchedulingView } from "./view-types";
import { bookingRange } from "./capacity";
import { datesForRange, formatUtcInstant, intersectRanges, localDayRange, nextLocalDate, parseUtcInstant, validateLocalDate, weekdayForDate } from "./time-zone";
export const EMPTY_SCHEDULING_FILTERS: SchedulingFilters = {personIds: [], workRoleIds: [], jobIds: [], customerIds: [], status: "planned"};
export const viewModes = (view: SchedulingView): readonly SchedulingPeriodMode[] => view === "team" ? ["week"] : view === "resources" || view === "personal" ? ["day", "week"] : ["day", "week", "month"];
export function shiftDate(date: string, days: number): string { validateLocalDate(date); return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0,10); }
/** Calendar months preserve the selected day where possible and clamp month ends. */
export function navigateSchedulingDate(date: string, mode: SchedulingPeriodMode, direction: -1 | 1): string {
  validateLocalDate(date);
  if (mode !== "month") return shiftDate(date, direction * (mode === "week" ? 7 : 1));
  const target = new Date(Date.UTC(Number(date.slice(0,4)), Number(date.slice(5,7))-1+direction, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth()+1, 0)).getUTCDate();
  target.setUTCDate(Math.min(Number(date.slice(8,10)), last));
  return target.toISOString().slice(0,10);
}
export function schedulingPeriod(date: string, mode: SchedulingPeriodMode) {
  validateLocalDate(date);
  const first = mode === "week" ? shiftDate(date, 1-weekdayForDate(date)) : mode === "month" ? `${date.slice(0,7)}-01` : date;
  const after = mode === "week" ? shiftDate(first,7) : mode === "month" ? new Date(Date.UTC(Number(date.slice(0,4)), Number(date.slice(5,7)),1)).toISOString().slice(0,10) : nextLocalDate(first);
  const range = {start: localDayRange(first).start, end: localDayRange(after).start};
  return {start: formatUtcInstant(range.start), end: formatUtcInstant(range.end), dates: datesForRange(range)};
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
