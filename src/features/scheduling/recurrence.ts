import { nextLocalDate, parseUtcInstant, stockholmLocalToUtc, validateLocalDate, weekdayForDate } from "./time-zone";
import type { PersistedRecurrenceSlot, RecurrenceExpansion, RecurrenceRule, RecurrenceSlot } from "./recurrence-types";

/** Transport admission, not a performance certification. No partial expansion is returned.
 * 128 occurrences leave room for complete facts and warning receipts; byte limits are
 * enforced again on the actual serialized command/receipt by the server adapter.
 */
export const recurrenceLimits = Object.freeze({ maxOccurrences: 128, maxCommandBytes: 3 * 1024 * 1024,
  maxReceiptBytes: 750_000, maxCalendarDays: 36_600, maxEndDayOffset: 31 });
const fields = new Set(["preset", "startDate", "startTime", "endTime", "endDayOffset", "allDay", "timeZone", "weekdays", "count", "untilDate"]);
const clock = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?$/;
function dayNumber(date: string): number { return Date.parse(`${date}T00:00:00Z`) / 86_400_000; }
function clockMicroseconds(value: string): number {
  const [whole, fraction = ""] = value.split(".");
  const [hour, minute, second] = whole!.split(":").map(Number);
  return ((hour! * 60 + minute!) * 60 + second!) * 1_000_000 + Number(fraction.padEnd(6, "0"));
}
export function validateRecurrenceRule(raw: unknown): RecurrenceRule | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (Object.keys(r).some(key => !fields.has(key)) || !["daily", "weekly", "biweekly", "monthly"].includes(String(r.preset)) ||
    r.timeZone !== "Europe/Stockholm" || typeof r.allDay !== "boolean" ||
    typeof r.startDate !== "string" || typeof r.startTime !== "string" || typeof r.endTime !== "string" ||
    !clock.test(r.startTime) || !clock.test(r.endTime) || !Number.isSafeInteger(r.endDayOffset) ||
    (r.endDayOffset as number) < 0 || (r.endDayOffset as number) > recurrenceLimits.maxEndDayOffset) return null;
  try { validateLocalDate(r.startDate); if (r.untilDate !== undefined) validateLocalDate(r.untilDate as string); } catch { return null; }
  if ((r.count === undefined) === (r.untilDate === undefined) ||
    (r.count !== undefined && (!Number.isSafeInteger(r.count) || (r.count as number) < 1)) ||
    (r.untilDate !== undefined && (typeof r.untilDate !== "string" || r.untilDate < r.startDate))) return null;
  if (r.preset === "weekly" || r.preset === "biweekly") {
    if (!Array.isArray(r.weekdays) || r.weekdays.length === 0 || r.weekdays.length > 7 ||
      r.weekdays.some(n => !Number.isInteger(n) || n < 1 || n > 7) || new Set(r.weekdays).size !== r.weekdays.length) return null;
  } else if (r.weekdays !== undefined) return null;
  if (r.allDay && (r.startTime !== "00:00:00" || r.endTime !== "00:00:00" || r.endDayOffset === 0)) return null;
  if (r.endDayOffset === 0 && clockMicroseconds(r.endTime) <= clockMicroseconds(r.startTime)) return null;
  return { ...r, ...(Array.isArray(r.weekdays) ? { weekdays: [...r.weekdays].sort((a, b) => a - b) } : {}) } as RecurrenceRule;
}
export function expandRecurrence(raw: unknown): RecurrenceExpansion {
  const rule = validateRecurrenceRule(raw);
  if (!rule) return { ok: false, code: "INVALID_RECURRENCE" };
  if ((rule.count ?? 0) > recurrenceLimits.maxOccurrences ||
    (rule.untilDate && dayNumber(rule.untilDate) - dayNumber(rule.startDate) > recurrenceLimits.maxCalendarDays)) return { ok: false, code: "RECURRENCE_LIMIT" };
  const occurrences: RecurrenceSlot[] = [];
  const anchor = dayNumber(rule.startDate) - weekdayForDate(rule.startDate) + 1;
  let date = rule.startDate;
  try {
    for (let scanned = 0; scanned <= recurrenceLimits.maxCalendarDays; scanned++, date = nextLocalDate(date)) {
      if (rule.untilDate && date > rule.untilDate) break;
      const eligible = rule.preset === "daily" || (rule.preset === "monthly" ? date.slice(8) === rule.startDate.slice(8) :
        rule.weekdays!.includes(weekdayForDate(date)) && (rule.preset === "weekly" || Math.floor((dayNumber(date) - anchor) / 7) % 2 === 0));
      if (!eligible) continue;
      let endDate = date;
      for (let offset = 0; offset < rule.endDayOffset; offset++) endDate = nextLocalDate(endDate);
      const startsAt = stockholmLocalToUtc(`${date}T${rule.startTime}`);
      const endsAt = stockholmLocalToUtc(`${endDate}T${rule.endTime}`);
      if (parseUtcInstant(endsAt) <= parseUtcInstant(startsAt)) return { ok: false, code: "NONPOSITIVE_OCCURRENCE", localDate: date };
      occurrences.push({ nominalDate: date, startsAt, endsAt });
      if (occurrences.length > recurrenceLimits.maxOccurrences) return { ok: false, code: "RECURRENCE_LIMIT" };
      if (rule.count && occurrences.length === rule.count) return { ok: true, occurrences, preview: occurrences.slice(0, 10) };
    }
  } catch { return { ok: false, code: "INVALID_RECURRENCE" }; }
  if (!occurrences.length || (rule.count && occurrences.length !== rule.count)) return { ok: false, code: "RECURRENCE_LIMIT" };
  return { ok: true, occurrences, preview: occurrences.slice(0, 10) };
}

/** Immutable nominal slots protect exceptions even after their actual time moves.
 * Callers add payload/defaults to generated slots, assigning IDs once per attempt.
 */
export function reconcileOccurrences(input: { existing: readonly PersistedRecurrenceSlot[]; proposed: readonly RecurrenceSlot[];
  sourceSeriesId: string; successorSeriesId?: string; pivotOccurrenceId?: string }) {
  const existing = input.existing.filter(row => row.seriesId === input.sourceSeriesId);
  if (new Set(existing.map(row => row.nominalDate)).size !== existing.length ||
    new Set(input.proposed.map(row => row.nominalDate)).size !== input.proposed.length) throw new Error("Duplicate nominal slot");
  const pivot = input.pivotOccurrenceId ? existing.find(row => row.id === input.pivotOccurrenceId) : null;
  if (input.pivotOccurrenceId && (!pivot || !input.successorSeriesId)) throw new Error("Invalid recurrence pivot");
  const prefix = pivot ? existing.filter(row => row.nominalDate < pivot.nominalDate) : [];
  const owned = existing.filter(row => !pivot || row.nominalDate >= pivot.nominalDate);
  const retained: PersistedRecurrenceSlot[] = [];
  const tombstones: PersistedRecurrenceSlot[] = [];
  const generated: RecurrenceSlot[] = [];
  const consumed = new Set<string>();
  const target = input.successorSeriesId ?? input.sourceSeriesId;
  for (const row of owned) {
    const proposed = input.proposed.find(slot => slot.nominalDate === row.nominalDate);
    if (row.isException || row.status === "cancelled") {
      retained.push(target === row.seriesId ? row : { ...row, seriesId: target }); consumed.add(row.nominalDate);
    } else if (proposed) {
      // Same nominal slot updates in place, including changed time. No UUID churn.
      retained.push({ ...row, ...proposed, seriesId: target }); consumed.add(row.nominalDate);
    } else tombstones.push({ ...row, seriesId: target, isException: true, status: "cancelled" });
  }
  for (const slot of input.proposed) if ((!pivot || slot.nominalDate >= pivot.nominalDate) && !consumed.has(slot.nominalDate)) generated.push(slot);
  return { retained, generated, tombstones, prefix, suffix: pivot ? [...retained, ...tombstones].sort((a, b) => a.nominalDate.localeCompare(b.nominalDate)) : [] };
}
