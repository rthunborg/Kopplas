import type { BookingFacts } from "@/features/resources/booking-types";
import type { RecurrenceRule } from "@/features/scheduling/recurrence-types";
import { expandRecurrence, recurrenceLimits, validateRecurrenceRule } from "@/features/scheduling/recurrence";
import type { BookingEditorReview } from "@/features/resources/booking-editor-input";
import { validateCreateBooking } from "./validation";
import type { ValidationResult } from "../envelope-core";
import { bookingActionFitsTransport } from "@/features/resources/booking-transport";

export type BookingSeriesInput = {
  readonly commandId: string; readonly seriesId: string; readonly sourceSeriesId: string | null;
  readonly expectedVersion: number | null; readonly pivotOccurrenceId: string | null;
  readonly rule: RecurrenceRule; readonly template: BookingFacts; readonly editorReview?: BookingEditorReview;
};
export type BookingSeriesResult = { readonly seriesId: string; readonly successorSeriesId: string | null; readonly occurrenceIds: readonly string[] };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function validateBookingSeries(raw: unknown, update = false): ValidationResult<BookingSeriesInput> {
  const invalid = { ok: false, code: "VALIDATION_FAILED" } as const;
  if (!bookingActionFitsTransport(raw)) return invalid;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return invalid;
  const v = raw as Record<string, unknown>;
  if (Object.keys(v).some(k => !["commandId", "seriesId", "sourceSeriesId", "expectedVersion", "pivotOccurrenceId", "rule", "template", "editorReview"].includes(k)) ||
    typeof v.commandId !== "string" || !uuid.test(v.commandId) || typeof v.seriesId !== "string" || !uuid.test(v.seriesId) ||
    (update ? typeof v.sourceSeriesId !== "string" || !uuid.test(v.sourceSeriesId) || !Number.isSafeInteger(v.expectedVersion) || (v.expectedVersion as number) < 1 :
      (v.sourceSeriesId !== null && v.sourceSeriesId !== undefined) || (v.expectedVersion !== null && v.expectedVersion !== undefined)) ||
    (v.pivotOccurrenceId != null && (typeof v.pivotOccurrenceId !== "string" || !uuid.test(v.pivotOccurrenceId))) ||
    (!update && v.pivotOccurrenceId != null)) return invalid;
  const rule = validateRecurrenceRule(v.rule);
  // Updates acquire their effective anchor/end from the current signed snapshot.
  // Expanding the submitted count here can include dates outside that suffix.
  if (!rule || (rule.count ?? 0) > recurrenceLimits.maxOccurrences ||
    (rule.untilDate && (Date.parse(`${rule.untilDate}T00:00:00Z`) - Date.parse(`${rule.startDate}T00:00:00Z`)) / 86_400_000 > recurrenceLimits.maxCalendarDays) ||
    (!update && !expandRecurrence(rule).ok)) return invalid;
  if (!v.template || typeof v.template !== "object") return invalid;
  const template = validateCreateBooking({ ...v.template, commandId: v.commandId, ...(v.editorReview ? { editorReview: v.editorReview } : {}) });
  if (!template.ok) return invalid;
  const { commandId: _command, editorReview, proposedBookingId: _proposed, ...facts } = template.data;
  void _command; void _proposed;
  if (facts.allDay !== rule.allDay) return invalid;
  const result: BookingSeriesInput = { commandId: v.commandId, seriesId: v.seriesId, sourceSeriesId: update ? v.sourceSeriesId as string : null,
    expectedVersion: update ? v.expectedVersion as number : null, pivotOccurrenceId: v.pivotOccurrenceId as string | undefined ?? null,
    rule, template: facts, ...(editorReview ? { editorReview } : {}) };
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > recurrenceLimits.maxCommandBytes) return invalid;
  return { ok: true, data: result };
}
export function seriesCommandPayload(input: BookingSeriesInput) {
  const { commandId: _command, editorReview: _review, ...payload } = input;
  void _command; void _review;
  return payload;
}
