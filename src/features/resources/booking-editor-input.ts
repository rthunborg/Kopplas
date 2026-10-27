import type { BookingFacts } from "./booking-types";
import { stockholmLocalToUtc, parseUtcInstant, formatUtcInstant } from "@/features/scheduling/time-zone";
import type { RecurrenceRule } from "@/features/scheduling/recurrence-types";

/** Local endpoints become a finite rule before UTC expansion. */
export function recurrenceRuleFromEditor(input: { preset: string; endMode: string; count: number; untilDate?: string; weekdays: readonly number[];
  start: string; end: string; allDay: boolean }): RecurrenceRule {
  const date = (value: string) => value.slice(0, 10);
  const time = (value: string) => input.allDay ? "00:00:00" : value.length === 16 ? `${value.slice(11)}:00` : value.slice(11);
  return { preset: input.preset as RecurrenceRule["preset"], startDate: date(input.start), startTime: time(input.start), endTime: time(input.end),
    endDayOffset: (Date.parse(`${date(input.end)}T00:00:00Z`) - Date.parse(`${date(input.start)}T00:00:00Z`)) / 86400000,
    allDay: input.allDay, timeZone: "Europe/Stockholm", ...(input.preset === "weekly" || input.preset === "biweekly" ? { weekdays: input.weekdays } : {}),
    ...(input.endMode === "count" ? { count: input.count } : { untilDate: input.untilDate ?? "" }) };
}

/** Following edits retain the stored local clock, including fractional seconds. */
export function recurrenceEditorEndpoints(rule: RecurrenceRule, nominalDate: string): { start: string; end: string } {
  const endDate = new Date(Date.parse(`${nominalDate}T00:00:00Z`) + rule.endDayOffset * 86400000).toISOString().slice(0, 10);
  return { start: `${nominalDate}T${rule.startTime}`, end: `${endDate}T${rule.endTime}` };
}
/** Presentation proposal only; never authority or persisted occurrence linkage. */
export type BookingEditProposal = Partial<Pick<BookingFacts, "startsAt" | "endsAt" | "assigneeIds">>;
/** Stored defaults exclude exception overrides; only explicit gestures override them. */
export function followingBookingDraft(template: BookingFacts, rule: RecurrenceRule, nominalDate: string, proposal: BookingEditProposal = {}) {
  const endpoints = recurrenceEditorEndpoints(rule, nominalDate);
  const local = (value: string) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {timeZone:"Europe/Stockholm",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date(value)).map(p=>[p.type,p.value]));
    const fraction = formatUtcInstant(parseUtcInstant(value)).slice(20,26);
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${fraction === "000000" ? "" : `.${fraction}`}`;
  };
  return {facts:{...template,...proposal},start:proposal.startsAt ? local(proposal.startsAt) : endpoints.start,
    end:proposal.endsAt ? local(proposal.endsAt) : endpoints.end};
}
/** Minute controls keep full stored clocks until that endpoint is edited. */
export function recurrenceEndpointWithClock(display: string, retainedClock: string | null): string {
  return retainedClock && display.includes("T") ? `${display.slice(0, 10)}T${retainedClock}` : display;
}

/** Human business decision only; receipt/signature are separate transport. */
export type BookingDecision = { readonly acknowledged: boolean; readonly reviewedLogicalIds: readonly string[];
  readonly selectedLogicalIds: readonly string[]; readonly reason: string };
export type BookingEditorReview = { readonly receipt: string; readonly decision: BookingDecision };
export function normalizeBookingDecision(raw: unknown): { ok: true; data: BookingDecision } | { ok: false; code: "VALIDATION_FAILED" } {
  const invalid = { ok: false, code: "VALIDATION_FAILED" } as const;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return invalid;
  const value = raw as Record<string, unknown>;
  if (Object.keys(value).length !== 4 || Object.keys(value).some((key) => !["acknowledged", "reviewedLogicalIds", "selectedLogicalIds", "reason"].includes(key)) ||
    typeof value.acknowledged !== "boolean" || typeof value.reason !== "string" || value.reason.length > 2000) return invalid;
  const lists = [value.reviewedLogicalIds, value.selectedLogicalIds];
  if (lists.some((list) => !Array.isArray(list) || list.some((id) => typeof id !== "string" || id.length === 0) || new Set(list).size !== list.length)) return invalid;
  const reviewed = [...value.reviewedLogicalIds as string[]].sort();
  const selected = [...value.selectedLogicalIds as string[]].sort();
  const reason = value.reason.trim();
  if (selected.some((id) => !reviewed.includes(id)) || (reviewed.length > 0 && value.acknowledged && !reason) ||
    (reviewed.length === 0 && (value.acknowledged || selected.length > 0 || reason !== ""))) return invalid;
  return { ok: true, data: { acknowledged: value.acknowledged, reviewedLogicalIds: reviewed, selectedLogicalIds: selected, reason } };
}
export const EMPTY_BOOKING_DECISION: BookingDecision = Object.freeze({ acknowledged: false, reviewedLogicalIds: [], selectedLogicalIds: [], reason: "" });
/** A denied retry cannot resolve a previously unknown committed outcome. */
export function retainUnresolvedBookingAttempt(code: string, wasUnresolved: boolean): boolean {
  return code === "SERVER_ERROR" || (wasUnresolved && ["UNAUTHENTICATED", "TENANT_MEMBERSHIP_REQUIRED", "PERMISSION_DENIED", "TENANT_ACCESS_DENIED"].includes(code));
}
export function prepareBookingTimes(input: { original: Pick<BookingFacts, "startsAt" | "endsAt">;
  startChanged: boolean; endChanged: boolean; allDay: boolean; startsAtLocal: string; endsAtLocal: string }): Pick<BookingFacts, "startsAt" | "endsAt"> {
  const local = (value: string) => input.allDay ? `${value.slice(0, 10)}T00:00:00` : value.length === 16 ? `${value}:00` : value;
  return { startsAt: input.startChanged ? stockholmLocalToUtc(local(input.startsAtLocal)) : input.original.startsAt,
    endsAt: input.endChanged ? stockholmLocalToUtc(local(input.endsAtLocal)) : input.original.endsAt };
}
