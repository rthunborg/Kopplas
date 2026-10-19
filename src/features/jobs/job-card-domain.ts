/** Pure partial card core: no persistence, eligibility, or backend wire contract. */
export type JobPriority = "low" | "normal" | "high" | "urgent";
export interface JobCardValue {
  readonly priority: JobPriority;
  readonly durationMinutes?: number | null;
  readonly travelMinutes?: number | null;
  readonly crewSize?: number | null;
  readonly earliestDate?: string | null;
  readonly desiredDate?: string | null;
  readonly latestDate?: string | null;
}
export interface JobCardIssue {
  readonly field: string;
  readonly code: "invalid" | "unknown" | "date-order";
}
export type JobCardValidation =
  | { readonly valid: true; readonly value: JobCardValue }
  | { readonly valid: false; readonly issues: readonly JobCardIssue[] };

const keys = ["priority", "durationMinutes", "travelMinutes", "crewSize", "earliestDate", "desiredDate", "latestDate"] as const;

// Calendar arithmetic only: no Date parsing, timezone, clock, or date defaults.
function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1];
}

/** No coercion. Omitted optional fields stay omitted; explicit null stays null.
 * Priority alone defaults to normal when omitted. Explicit undefined is invalid.
 */
export function validateJobCard(input: unknown): JobCardValidation {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, issues: [{ field: "$", code: "invalid" }] };
  }
  const source = input as Record<string, unknown>;
  const issues: JobCardIssue[] = [];
  for (const key of Reflect.ownKeys(source)) {
    if (typeof key !== "string" || !keys.includes(key as typeof keys[number])) {
      issues.push({ field: String(key), code: "unknown" });
    }
  }
  const value: Record<string, unknown> = { priority: "normal" };
  for (const key of keys) {
    if (!Object.hasOwn(source, key)) continue;
    const item = source[key];
    let valid: boolean;
    if (key === "priority") {
      valid = item === "low" || item === "normal" || item === "high" || item === "urgent";
    } else if (key.endsWith("Date")) {
      valid = item === null || isCalendarDate(item);
    } else {
      valid = item === null || (typeof item === "number" && Number.isInteger(item) && item >= (key === "travelMinutes" ? 0 : 1));
    }
    if (valid) value[key] = item;
    else issues.push({ field: key, code: "invalid" });
  }
  if (typeof value.earliestDate === "string" && typeof value.latestDate === "string" && value.earliestDate > value.latestDate) {
    issues.push({ field: "latestDate", code: "date-order" });
  }
  return issues.length
    ? { valid: false, issues }
    : { valid: true, value: Object.freeze(value) as unknown as JobCardValue };
}

/** Flat editable scalar input may contain invalid values while the user edits. */
export type JobCardDraftInput = Readonly<Record<string, string | number | null | undefined>>;
export interface JobCardSubmission {
  readonly candidateId: string;
  readonly commandId: string;
  readonly revision: number;
  readonly input: JobCardDraftInput;
  readonly value: JobCardValue;
  readonly status: "submitting" | "failed" | "confirmed";
}
export interface JobCardDraftState {
  readonly input: JobCardDraftInput;
  readonly revision: number;
  readonly status: "editing" | "submitting" | "failed" | "persisted";
  readonly submission: JobCardSubmission | null;
}
export type JobCardDraftEvent =
  | { readonly type: "edit"; readonly input: JobCardDraftInput }
  | { readonly type: "submit"; readonly candidateId: string; readonly commandId: string }
  | { readonly type: "retry" }
  | { readonly type: "failed" | "confirmed"; readonly candidateId: string; readonly commandId: string; readonly revision: number };

export function createJobCardDraft(input: JobCardDraftInput = { priority: "normal" }): JobCardDraftState {
  return Object.freeze({ input: Object.freeze({ ...input }), revision: 0, status: "editing", submission: null });
}

/** IDs are caller-supplied correlation only, never proof of server authority.
 * The caller dispatches confirmed only after actual server-confirmed persistence.
 * One unresolved submission is retained; retry always uses its exact snapshot,
 * even if newer draft input exists. Invalid submission leaves input untouched.
 */
export function transitionJobCardDraft(state: JobCardDraftState, event: JobCardDraftEvent): JobCardDraftState {
  if (event.type === "edit") {
    return Object.freeze({ ...state, input: Object.freeze({ ...event.input }), revision: state.revision + 1, status: "editing" });
  }
  if (event.type === "submit") {
    if (state.submission && state.submission.status !== "confirmed") return state;
    const result = validateJobCard(state.input);
    if (!result.valid) return state;
    const submission: JobCardSubmission = Object.freeze({
      candidateId: event.candidateId, commandId: event.commandId, revision: state.revision,
      input: state.input, value: result.value, status: "submitting",
    });
    return Object.freeze({ ...state, status: "submitting", submission });
  }
  const current = state.submission;
  if (!current || current.status === "confirmed") return state;
  if (event.type === "retry") {
    if (current.status !== "failed") return state;
    return Object.freeze({ ...state, status: current.revision === state.revision ? "submitting" : "editing",
      submission: Object.freeze({ ...current, status: "submitting" }) });
  }
  if (event.candidateId !== current.candidateId || event.commandId !== current.commandId || event.revision !== current.revision) return state;
  return Object.freeze({ ...state,
    status: current.revision === state.revision ? (event.type === "confirmed" ? "persisted" : "failed") : "editing",
    submission: Object.freeze({ ...current, status: event.type }),
  });
}
