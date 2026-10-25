import { localDateForInstant, parseUtcInstant, stockholmLocalToUtc, validateLocalDate } from "@/features/scheduling/time-zone";
import { reportWeekStart, shiftReportDate } from "@/features/time-reports/domain";

export function myDayToday(asOf = new Date().toISOString()): string { return localDateForInstant(parseUtcInstant(asOf)); }
export const MY_DAY_MIN_DATE = "0001-01-08";
export const MY_DAY_MAX_DATE = "9999-12-26";

/** Complete Stockholm weeks and their exclusive UTC endpoint stay four-digit. */
export function validateMyDaySelection(date: string): void {
  validateLocalDate(date);
  if (date < MY_DAY_MIN_DATE || date > MY_DAY_MAX_DATE) throw new Error("Unsupported my day date");
  myDayPeriod(date, "week");
}
export function shiftMyDayWeek(date: string, offset: number): string {
  validateLocalDate(date); if (!Number.isSafeInteger(offset)) throw new Error("Invalid week offset");
  const destination = shiftReportDate(date, offset * 7);
  validateMyDaySelection(destination); return destination;
}
export function myDayPeriod(date: string, mode: "day" | "week") {
  validateLocalDate(date); if (mode !== "day" && mode !== "week") throw new Error("Invalid period");
  const first = mode === "week" ? reportWeekStart(date) : date, count = mode === "week" ? 7 : 1;
  const endDate = shiftReportDate(first, count);
  validateLocalDate(first); validateLocalDate(endDate);
  const dates = Array.from({ length: count }, (_, i) => shiftReportDate(first, i));
  dates.forEach(validateLocalDate);
  return { start: new Date(stockholmLocalToUtc(`${first}T00:00:00`)).toISOString(),
    end: new Date(stockholmLocalToUtc(`${endDate}T00:00:00`)).toISOString(), dates };
}
export function myDayAgenda<T extends { id: string; startsAt: string; endsAt: string; status?: string }>(rows: readonly T[], period: { start: string; end: string }): T[] {
  const start = parseUtcInstant(period.start), end = parseUtcInstant(period.end);
  return [...new Map(rows.filter(row => (!row.status || row.status === "planned") && parseUtcInstant(row.startsAt) < end && parseUtcInstant(row.endsAt) > start).map(row => [row.id, row])).values()]
    .sort((a, b) => { const x = parseUtcInstant(a.startsAt), y = parseUtcInstant(b.startsAt); return x < y ? -1 : x > y ? 1 : a.id.localeCompare(b.id); });
}
export function myDayMapUrl(address: string | null): string | null {
  if (!address?.trim()) return null;
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: address }).toString()}`;
}
// Selection keys are transient request identity only, never server authorization.
export type MyDaySelection = { readonly date: string; readonly mode?: "day" | "week"; readonly tenantKey?: string; readonly userKey?: string };
type Lists<B, J, N> = { readonly bookings: readonly B[]; readonly activeJobs: readonly J[]; readonly notices: readonly N[] };
export type MyDayState<B = unknown, J = unknown, N = unknown> = Lists<B, J, N> & { readonly selection: MyDaySelection;
  readonly requestId: number; readonly status: "loading" | "ready" | "denied" | "unavailable"; readonly isEmpty: boolean };
type Event<B, J, N> = { readonly requestId: number; readonly selection: MyDaySelection } &
  ({ readonly type: "request" } | { readonly type: "success"; readonly data: Lists<B, J, N> } | { readonly type: "failure"; readonly kind: "denied" | "retryable" });
export function createMyDayState<B = unknown, J = unknown, N = unknown>(selection: MyDaySelection): MyDayState<B, J, N> {
  return { selection, requestId: 0, status: "loading", isEmpty: false, bookings: [], activeJobs: [], notices: [] };
}
export function isCurrentMyDayRequest(currentRequestId: number, incomingRequestId: number, currentSelection: MyDaySelection, incomingSelection: MyDaySelection): boolean {
  return currentRequestId === incomingRequestId && JSON.stringify(currentSelection) === JSON.stringify(incomingSelection);
}
export function reduceMyDayState<B, J, N>(state: MyDayState<B, J, N>, event: Event<B, J, N>): MyDayState<B, J, N> {
  if (event.type === "request") return event.requestId > state.requestId ? { ...createMyDayState<B, J, N>(event.selection), requestId: event.requestId } : state;
  if (!isCurrentMyDayRequest(state.requestId, event.requestId, state.selection, event.selection)) return state;
  if (event.type === "failure") return { ...createMyDayState<B, J, N>(state.selection), requestId: state.requestId, status: event.kind === "denied" ? "denied" : "unavailable" };
  return { ...state, ...event.data, status: "ready", isEmpty: event.data.bookings.length === 0 };
}

