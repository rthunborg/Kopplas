/** A finite local-calendar rule. UTC instants are derived, never caller authority. */
export type RecurrenceRule = {
  readonly preset: "daily" | "weekly" | "biweekly" | "monthly";
  readonly startDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly endDayOffset: number;
  readonly allDay: boolean;
  readonly timeZone: "Europe/Stockholm";
  readonly weekdays?: readonly number[];
  readonly count?: number;
  readonly untilDate?: string;
};
export type RecurrenceSlot = { readonly nominalDate: string; readonly startsAt: string; readonly endsAt: string };
export type RecurrenceExpansion = { readonly ok: true; readonly occurrences: RecurrenceSlot[]; readonly preview: RecurrenceSlot[] } |
  { readonly ok: false; readonly code: "INVALID_RECURRENCE" | "RECURRENCE_LIMIT" | "NONPOSITIVE_OCCURRENCE"; readonly localDate?: string };
export type PersistedRecurrenceSlot = RecurrenceSlot & {
  readonly id: string; readonly seriesId: string; readonly isException: boolean;
  readonly status: "planned" | "cancelled"; readonly description: string;
};
