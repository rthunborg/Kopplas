import {formatUtcInstant, parseUtcInstant} from "@/features/scheduling/time-zone";
/** Pure card values/state: no persistence, eligibility, or authorization. */
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
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1];
}

export type JobLocation = { readonly street: string; readonly postalCode: string | null; readonly city: string; readonly countryCode: string };
export interface JobCardData {
  readonly type: "order" | "projekt";
  readonly title: string | null;
  readonly customer_id: string;
  readonly facility_id: string | null;
  readonly contact_id: string | null;
  readonly priority: JobPriority;
  readonly estimated_duration_minutes: number | null;
  readonly planned_travel_minutes: number | null;
  readonly crew_size: number | null;
  readonly earliest_date: string | null; readonly desired_date: string | null; readonly latest_date: string | null;
  readonly planned_start_date: string | null; readonly planned_end_date: string | null;
  readonly customer_presence_required: boolean | null;
  readonly responsible_project_manager_id: string | null;
  readonly locationOverride: JobLocation | null;
  readonly requiredWorkRoleIds: readonly string[] | null;
  readonly accessWindows: readonly { readonly startsAt: string; readonly endsAt: string }[] | null;
  readonly dependencyJobIds: readonly string[];
}
export type JobCardInput = JobCardData & { readonly commandId: string; readonly candidateId?: string; readonly id?: string };
const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v);
const cardKeys = ["type", "title", "customer_id", "facility_id", "contact_id", "priority", "estimated_duration_minutes",
  "planned_travel_minutes", "crew_size", "earliest_date", "desired_date", "latest_date", "planned_start_date", "planned_end_date",
  "customer_presence_required", "responsible_project_manager_id", "locationOverride", "requiredWorkRoleIds", "accessWindows", "dependencyJobIds", "commandId", "candidateId", "id"];
/** Full enriched workflow only. The original create/update validators retain their signatures. */
export function validateJobCardInput(raw: unknown, operation: "create" | "update"):
  { readonly valid: true; readonly value: JobCardInput } | { readonly valid: false } {
  const fail = { valid: false as const };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fail;
  const r = raw as Record<string, unknown>;
  if (Reflect.ownKeys(r).some((key) => typeof key !== "string" || !cardKeys.includes(key)) || !uuid(r.commandId)
    || (r.candidateId !== undefined && !uuid(r.candidateId)) || (operation === "update" ? !uuid(r.id) : r.id !== undefined)
    || !uuid(r.customer_id) || !uuid(r.facility_id) || !uuid(r.contact_id)
    || (r.type !== undefined && r.type !== "order" && r.type !== "projekt") || (operation === "create" && r.type === "projekt")) return fail;
  const scalar = validateJobCard({ ...(r.priority !== undefined ? { priority: r.priority } : {}),
    durationMinutes: r.estimated_duration_minutes ?? null, travelMinutes: r.planned_travel_minutes ?? null,
    crewSize: r.crew_size ?? null, earliestDate: r.earliest_date ?? null,
    desiredDate: r.desired_date ?? null, latestDate: r.latest_date ?? null });
  if (!scalar.valid || [r.planned_start_date, r.planned_end_date].some((v) => v != null && !isCalendarDate(v))
    || (typeof r.planned_start_date === "string" && typeof r.planned_end_date === "string" && r.planned_start_date > r.planned_end_date)
    || (r.title != null && (typeof r.title !== "string" || r.title.trim().length > 256))
    || (r.customer_presence_required != null && typeof r.customer_presence_required !== "boolean")
    || (r.responsible_project_manager_id != null && !uuid(r.responsible_project_manager_id))) return fail;
  const ids = (v: unknown): v is string[] => Array.isArray(v) && v.length <= 500 && v.every(uuid) && new Set(v).size === v.length;
  if ((r.requiredWorkRoleIds != null && !ids(r.requiredWorkRoleIds)) || !ids(r.dependencyJobIds ?? [])
    || (Array.isArray(r.dependencyJobIds) && r.dependencyJobIds.includes(r.id))) return fail;
  let windows: { startsAt: string; endsAt: string }[] | null = null;
  if (r.accessWindows != null) {
    if (!Array.isArray(r.accessWindows) || r.accessWindows.length > 500) return fail;
    windows = [];
    for (const item of r.accessWindows) {
      if (!item || typeof item !== "object" || Object.keys(item).sort().join() !== "endsAt,startsAt"
        || typeof item.startsAt !== "string" || typeof item.endsAt !== "string"
        || !/^\d{4}-\d\d-\d\dT.*Z$/.test(item.startsAt) || !/^\d{4}-\d\d-\d\dT.*Z$/.test(item.endsAt)) return fail;
      try {
        const start = parseUtcInstant(item.startsAt); const end = parseUtcInstant(item.endsAt);
        if (end <= start) return fail;
        windows.push({ startsAt: formatUtcInstant(start), endsAt: formatUtcInstant(end) });
      } catch { return fail; }
    }
    windows = [...new Map(windows.map((w) => [JSON.stringify(w), w])).values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.endsAt.localeCompare(b.endsAt));
  }
  let location: JobLocation | null = null;
  if (r.locationOverride != null) {
    const l = r.locationOverride as Record<string, unknown>;
    if (!l || typeof l !== "object" || Array.isArray(l) || Object.keys(l).some((k) => !["street", "postalCode", "city", "countryCode"].includes(k))
      || typeof l.street !== "string" || !l.street.trim() || l.street.length > 256
      || typeof l.city !== "string" || !l.city.trim() || l.city.length > 128
      || typeof l.countryCode !== "string" || !/^[A-Z]{2}$/.test(l.countryCode)
      || (l.postalCode != null && (typeof l.postalCode !== "string" || l.postalCode.length > 32))) return fail;
    location = { street: l.street.trim(), postalCode: typeof l.postalCode === "string" ? l.postalCode.trim() || null : null,
      city: l.city.trim(), countryCode: l.countryCode };
  }
  return { valid: true, value: {
    commandId: r.commandId, ...(uuid(r.candidateId) ? { candidateId: r.candidateId } : {}), ...(uuid(r.id) ? { id: r.id } : {}),
    type: r.type === "projekt" ? "projekt" : "order", title: typeof r.title === "string" ? r.title.trim() || null : null,
    customer_id: r.customer_id, facility_id: r.facility_id, contact_id: r.contact_id, priority: scalar.value.priority,
    estimated_duration_minutes: scalar.value.durationMinutes ?? null, planned_travel_minutes: scalar.value.travelMinutes ?? null,
    crew_size: scalar.value.crewSize ?? null, earliest_date: scalar.value.earliestDate ?? null,
    desired_date: scalar.value.desiredDate ?? null, latest_date: scalar.value.latestDate ?? null,
    planned_start_date: (r.planned_start_date as string) ?? null, planned_end_date: (r.planned_end_date as string) ?? null,
    customer_presence_required: (r.customer_presence_required as boolean) ?? null,
    responsible_project_manager_id: (r.responsible_project_manager_id as string) ?? null,
    locationOverride: location, requiredWorkRoleIds: r.requiredWorkRoleIds == null ? null : [...r.requiredWorkRoleIds as string[]].sort(),
    accessWindows: windows, dependencyJobIds: [...(r.dependencyJobIds ?? []) as string[]].sort(),
  } };
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
