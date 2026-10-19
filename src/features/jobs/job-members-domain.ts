import { isCalendarDate } from "./job-card-domain";
/** Closed job-scoped inputs. These validators grant no authority; SQL checks current facts. */
export type MemberBase = { readonly commandId: string; readonly jobId: string; readonly expectedState: string };
export type AssignMemberInput = MemberBase & { readonly personProfileId: string };
export type RemoveMemberInput = MemberBase & { readonly personProfileId: string };
export type SetLeadInput = MemberBase & { readonly personProfileId: string | null };
export type PlannedDatesInput = MemberBase & { readonly planned_start_date: string | null; readonly planned_end_date: string | null };
export type JobMemberInput = AssignMemberInput | RemoveMemberInput | SetLeadInput | PlannedDatesInput;
type Valid<T> = { readonly valid: true; readonly value: T } | { readonly valid: false };
const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v);
function base(raw: unknown, fields: readonly string[]): raw is Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const r = raw as Record<string, unknown>;
  const keys = ["commandId", "jobId", "expectedState", ...fields];
  return Reflect.ownKeys(r).length === keys.length && Reflect.ownKeys(r).every((k) => typeof k === "string" && keys.includes(k))
    && uuid(r.commandId) && uuid(r.jobId) && typeof r.expectedState === "string" && /^[0-9a-f]{64}$/.test(r.expectedState);
}
export function validateAssignMemberInput(raw: unknown): Valid<AssignMemberInput> {
  return base(raw, ["personProfileId"]) && uuid(raw.personProfileId) ? {valid: true, value: raw as AssignMemberInput} : {valid: false};
}
export function validateRemoveMemberInput(raw: unknown): Valid<RemoveMemberInput> {
  return base(raw, ["personProfileId"]) && uuid(raw.personProfileId) ? {valid: true, value: raw as RemoveMemberInput} : {valid: false};
}
export function validateSetLeadInput(raw: unknown): Valid<SetLeadInput> {
  return base(raw, ["personProfileId"]) && (raw.personProfileId === null || uuid(raw.personProfileId))
    ? {valid: true, value: raw as SetLeadInput} : {valid: false};
}
export function validatePlannedDatesInput(raw: unknown): Valid<PlannedDatesInput> {
  if (!base(raw, ["planned_start_date", "planned_end_date"])) return {valid: false};
  const {planned_start_date: start, planned_end_date: end} = raw;
  if ((start !== null && !isCalendarDate(start)) || (end !== null && !isCalendarDate(end))
    || (typeof start === "string" && typeof end === "string" && start > end)) return {valid: false};
  return {valid: true, value: raw as PlannedDatesInput};
}
export type JobMembersDraftInput = Readonly<Record<string, unknown>>;
export type JobMembersDraft = {
  readonly input: JobMembersDraftInput;
  readonly status: "editing" | "submitting" | "uncertain" | "refetch-required" | "persisted";
  readonly current: JobMembersDraftInput | null;
  readonly submission: { readonly commandId: string; readonly input: JobMembersDraftInput } | null;
};
export type JobMembersDraftEvent =
  | {type: "submit"; commandId: string} | {type: "edit"; input: JobMembersDraftInput}
  | {type: "uncertain"; commandId: string} | {type: "retry"}
  | {type: "stale"; commandId: string} | {type: "refetched"; current: JobMembersDraftInput}
  | {type: "persisted"; commandId: string};
export function createJobMembersDraft(_operation: "assign" | "remove" | "set-lead" | "planned-dates", input: JobMembersDraftInput): JobMembersDraft {
  return {input: structuredClone(input), status: "editing", current: null, submission: null};
}
/** An uncertain request keeps its immutable identity/snapshot; stale requests require a refetch. */
export function transitionJobMembersDraft(state: JobMembersDraft, event: JobMembersDraftEvent): JobMembersDraft {
  if (event.type === "edit") return {...state, input: structuredClone(event.input)};
  if (event.type === "refetched") return {...state, current: structuredClone(event.current), status: "editing", submission: null};
  if (event.type === "retry") return state.status === "uncertain" && state.submission ? {...state, status: "submitting"} : state;
  if (event.type === "submit") return state.status === "uncertain" || state.status === "submitting" || state.status === "refetch-required" ? state
    : {...state, status: "submitting", submission: {commandId: event.commandId, input: structuredClone(state.input)}};
  if (state.submission?.commandId !== event.commandId) return state;
  return {...state, status: event.type === "stale" ? "refetch-required" : event.type === "persisted" ? "persisted" : "uncertain"};
}


/** A visible draft owns its compare-and-set baseline, independent of other controls. */
export type JobMemberField<T> = {readonly value: T; readonly baseline: T; readonly expectedState: string};
export function createJobMemberField<T>(value: T, expectedState: string): JobMemberField<T> {
  return {value, baseline: value, expectedState};
}
export function editJobMemberField<T>(field: JobMemberField<T>, value: T): JobMemberField<T> { return {...field, value}; }
const sameFieldValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
/** Pristine controls follow server state; unrelated refreshes cannot authorize a dirty draft. */
export function receiveJobMemberField<T>(field: JobMemberField<T>, value: T, expectedState: string): JobMemberField<T> {
  return sameFieldValue(field.value, field.baseline) ? createJobMemberField(value, expectedState) : field;
}
/** Explicit refetch/consent updates only that operation's baseline, retaining its visible draft. */
export function consentJobMemberField<T>(field: JobMemberField<T>, current: T, expectedState: string): JobMemberField<T> {
  return {...field, baseline: current, expectedState};
}
/** A confirmed older submission never consumes or reauthorizes newer unsent field edits. */
export function confirmJobMemberField<T>(field: JobMemberField<T>, submitted: T, current: T, expectedState: string): JobMemberField<T> {
  return sameFieldValue(field.value, submitted) ? createJobMemberField(current, expectedState) : receiveJobMemberField(field, current, expectedState);
}
