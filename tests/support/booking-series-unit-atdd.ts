/**
 * TEST-OWNED normalized pure contract, not a prescribed public product API.
 * Bind named exports/projections to the future real modules during T1/T5.
 * No recurrence arithmetic, command success or state transitions are implemented here.
 * Missing production modules/exports must fail loudly when a scaffold is activated.
 */
export type Rule = {
  preset: "daily" | "weekly" | "biweekly" | "monthly";
  startDate: string; startTime: string; endTime: string; endDayOffset: number;
  allDay: boolean; timeZone: "Europe/Stockholm"; count?: number; untilDate?: string;
  weekdays?: number[];
};
export type Slot = { nominalDate: string; startsAt: string; endsAt: string };
export type Expansion = { ok: true; occurrences: Slot[]; preview: Slot[] } |
  { ok: false; localDate?: string; code: string; occurrences?: never };
export type PersistedSlot = Slot & { id: string; seriesId: string; isException: boolean; status: "planned" | "cancelled"; description: string };
export type Reconciliation = {
  retained: PersistedSlot[]; generated: Slot[]; tombstones: PersistedSlot[];
  prefix: PersistedSlot[]; suffix: PersistedSlot[];
};
export type RecurrenceBindings = {
  expandRecurrence(input: unknown): Expansion;
  recurrenceLimits: { maxOccurrences: number; maxCommandBytes: number; maxReceiptBytes: number };
  reconcileOccurrences(input: { existing: PersistedSlot[]; proposed: Slot[]; sourceSeriesId: string; successorSeriesId?: string; pivotOccurrenceId?: string }): Reconciliation;
};
export async function loadRecurrenceBindings(): Promise<RecurrenceBindings> {
  const target = new URL("../../src/features/scheduling/recurrence.ts", import.meta.url).href;
  const actual = await import(target);
  for (const name of ["expandRecurrence", "reconcileOccurrences"]) {
    if (typeof actual[name] !== "function") throw new Error("ATDD T1: bind real recurrence export " + name);
  }
  if (!actual.recurrenceLimits) throw new Error("ATDD T1: bind documented shared recurrence admission limits");
  return actual as RecurrenceBindings;
}
export const baseRule = (patch: Record<string, unknown> = {}): Record<string, unknown> => ({
  preset: "daily", startDate: "2026-10-12", startTime: "07:00:00", endTime: "08:00:00",
  endDayOffset: 0, allDay: false, timeZone: "Europe/Stockholm", count: 3, ...patch,
});
export function persistedSlot(patch: Partial<PersistedSlot> = {}): PersistedSlot {
  return { id: crypto.randomUUID(), seriesId: "source-series", nominalDate: "2026-10-12",
    startsAt: "2026-10-12T05:00:00.000000Z", endsAt: "2026-10-12T06:00:00.000000Z",
    isException: false, status: "planned", description: "Recurring workshop lighting", ...patch };
}
export type Attempt = { commandId: string; seriesId: string; proposedIds: string[]; input: Record<string, unknown> };
export type Preview = { requestId: number; candidateKey: string; receipt: string; seriesVersion: number; warnings: string[] };
export type SeriesState = {
  candidateKey: string; latestRequestId: number; seriesVersion: number;
  preview: Preview | null; selected: string[]; reason: string;
  previewStatus: "idle" | "pending" | "ready" | "failed";
  attempt: Attempt | null; persistence: "unsent" | "saving" | "unknown" | "confirmed";
};
export type StateBindings = {
  applySeriesEvent(state: SeriesState, event: Record<string, unknown>): SeriesState;
  canSaveSeries(state: SeriesState): boolean;
  seriesRetryAttempt(state: SeriesState): Attempt;
};
export async function loadSeriesStateBindings(): Promise<StateBindings> {
  const target = new URL("../../src/features/resources/booking-series-state.ts", import.meta.url).href;
  const actual = await import(target);
  for (const name of ["applySeriesEvent", "canSaveSeries", "seriesRetryAttempt"]) {
    if (typeof actual[name] !== "function") throw new Error("ATDD T5: bind real headless state export " + name);
  }
  return actual as StateBindings;
}
export function seriesState(patch: Partial<SeriesState> = {}): SeriesState {
  return { candidateKey: "candidate-A", latestRequestId: 1, seriesVersion: 1,
    preview: { requestId: 1, candidateKey: "candidate-A", receipt: "opaque-server-receipt", seriesVersion: 1, warnings: [] },
    selected: [], reason: "", previewStatus: "ready", attempt: null, persistence: "unsent", ...patch };
}

