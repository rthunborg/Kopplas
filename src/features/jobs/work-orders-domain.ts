import { isCalendarDate } from "./job-card-domain";
import { createJobMembersDraft, transitionJobMembersDraft, createJobMemberField, editJobMemberField,
  receiveJobMemberField, consentJobMemberField, confirmJobMemberField } from "./job-members-domain";
export const WORK_ORDER_STATUSES = ["created", "in_progress", "done", "cancelled"] as const;
export type WorkOrderStatus = typeof WORK_ORDER_STATUSES[number];
export type WorkOrderEndpoint = { readonly jobId: string; readonly workOrderId: string | null };
export type WorkOrderBase = { readonly commandId: string; readonly jobId: string; readonly expectedState: string };
export type WorkOrderFields = { readonly title: string; readonly description: string | null; readonly planned_start_date: string | null; readonly planned_end_date: string | null };
export type CreateWorkOrderInput = WorkOrderBase & WorkOrderFields;
export type UpdateWorkOrderInput = CreateWorkOrderInput & { readonly workOrderId: string };
export type WorkOrderAssigneesInput = WorkOrderBase & {readonly workOrderId: string; readonly personProfileIds: readonly string[]};
export type WorkOrderStatusInput = WorkOrderBase & {readonly workOrderId: string; readonly status: WorkOrderStatus};
export type WorkOrderDependenciesInput = WorkOrderBase & {readonly workOrderId: string; readonly prerequisites: readonly WorkOrderEndpoint[]};
export type JobWorkOrderDependenciesInput = WorkOrderBase & {readonly prerequisites: readonly WorkOrderEndpoint[]};
export type WorkOrderInput = CreateWorkOrderInput | UpdateWorkOrderInput | WorkOrderAssigneesInput | WorkOrderStatusInput | WorkOrderDependenciesInput | JobWorkOrderDependenciesInput;
type Valid<T> = {valid: true; value: T} | {valid: false};
const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v);
function closed(raw: unknown, fields: readonly string[]): raw is Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const r = raw as Record<string, unknown>, keys = ["commandId", "jobId", "expectedState", ...fields];
  return Reflect.ownKeys(r).length === keys.length && Reflect.ownKeys(r).every(k => typeof k === "string" && keys.includes(k))
    && uuid(r.commandId) && uuid(r.jobId) && typeof r.expectedState === "string" && /^[0-9a-f]{64}$/.test(r.expectedState)
    && (!fields.includes("workOrderId") || uuid(r.workOrderId));
}
function fields(raw: unknown, update: boolean): Valid<CreateWorkOrderInput | UpdateWorkOrderInput> {
  if (!closed(raw, [...(update ? ["workOrderId"] : []), "title", "description", "planned_start_date", "planned_end_date"])) return {valid: false};
  const {title, description, planned_start_date: start, planned_end_date: end} = raw;
  if (typeof title !== "string" || !title.trim() || title.trim().length > 256 || (description !== null && (typeof description !== "string" || description.length > 10000))
    || (start !== null && !isCalendarDate(start)) || (end !== null && !isCalendarDate(end))
    || (typeof start === "string" && typeof end === "string" && start > end)) return {valid: false};
  return {valid: true, value: {...raw, title: title.trim()} as CreateWorkOrderInput | UpdateWorkOrderInput};
}
export const validateCreateWorkOrderInput = (raw: unknown) => fields(raw, false) as Valid<CreateWorkOrderInput>;
export const validateUpdateWorkOrderInput = (raw: unknown) => fields(raw, true) as Valid<UpdateWorkOrderInput>;
export function validateWorkOrderAssigneesInput(raw: unknown): Valid<WorkOrderAssigneesInput> {
  return closed(raw, ["workOrderId", "personProfileIds"]) && Array.isArray(raw.personProfileIds)
    && raw.personProfileIds.every(uuid) && new Set(raw.personProfileIds).size === raw.personProfileIds.length
    ? {valid: true, value: raw as WorkOrderAssigneesInput} : {valid: false};
}
export function validateWorkOrderStatusInput(raw: unknown): Valid<WorkOrderStatusInput> {
  return closed(raw, ["workOrderId", "status"]) && WORK_ORDER_STATUSES.includes(raw.status as WorkOrderStatus)
    ? {valid: true, value: raw as WorkOrderStatusInput} : {valid: false};
}
function dependencies(raw: unknown, child: boolean): Valid<WorkOrderDependenciesInput | JobWorkOrderDependenciesInput> {
  if (!closed(raw, [...(child ? ["workOrderId"] : []), "prerequisites"]) || !Array.isArray(raw.prerequisites)) return {valid: false};
  const seen = new Set<string>();
  for (const p of raw.prerequisites) {
    if (!p || typeof p !== "object" || Array.isArray(p) || Reflect.ownKeys(p).length !== 2 || !Object.hasOwn(p,"jobId") || !Object.hasOwn(p,"workOrderId")
      || !uuid(p.jobId) || !(p.workOrderId === null || uuid(p.workOrderId)) || (!child && p.workOrderId === null)
      || (p.jobId === raw.jobId && p.workOrderId === (child ? raw.workOrderId : null))) return {valid: false};
    const key = `${p.jobId}:${p.workOrderId}`;
    if (seen.has(key)) return {valid: false};
    seen.add(key);
  }
  return {valid: true, value: raw as WorkOrderDependenciesInput | JobWorkOrderDependenciesInput};
}
export const validateWorkOrderDependenciesInput = (raw: unknown) => dependencies(raw, true) as Valid<WorkOrderDependenciesInput>;
export const validateJobWorkOrderDependenciesInput = (raw: unknown) => dependencies(raw, false) as Valid<JobWorkOrderDependenciesInput>;
export function canTransitionWorkOrderStatus(from: WorkOrderStatus, to: WorkOrderStatus, authority: {canReopen: boolean}): boolean {
  return ["created:in_progress", "created:cancelled", "in_progress:done", "in_progress:cancelled"].includes(`${from}:${to}`)
    || (authority.canReopen && ["done:in_progress", "cancelled:created"].includes(`${from}:${to}`));
}
export function evaluateWorkOrderDependency({dependent, prerequisite}: {dependent: WorkOrderEndpoint & {readable: boolean; plannedStartDate: string | null}; prerequisite: WorkOrderEndpoint & {readable: boolean; plannedEndDate: string | null}}):
  {state: "delay" | "clear" | "unknown"; prerequisiteEndDate?: string; dependentStartDate?: string} {
  if (!dependent.readable || !prerequisite.readable || !dependent.plannedStartDate || !prerequisite.plannedEndDate) return {state: "unknown"};
  return {state: prerequisite.plannedEndDate > dependent.plannedStartDate ? "delay" : "clear", prerequisiteEndDate: prerequisite.plannedEndDate, dependentStartDate: dependent.plannedStartDate};
}
/** Reuse the established immutable submission and per-control comparison baseline semantics. */
export const createWorkOrderDraft = (_operation: string, input: Readonly<Record<string, unknown>>) => createJobMembersDraft("planned-dates", input);
export function transitionWorkOrderDraft(state: Parameters<typeof transitionJobMembersDraft>[0], event: Parameters<typeof transitionJobMembersDraft>[1]) {
  const next = transitionJobMembersDraft(state, event);
  return event.type === "persisted" && state.submission?.commandId === event.commandId && JSON.stringify(state.input) !== JSON.stringify(state.submission.input)
    ? {...next, status: "editing" as const, submission: null} : next;
}
export const createWorkOrderField = createJobMemberField;
export const editWorkOrderField = editJobMemberField;
export const receiveWorkOrderField = receiveJobMemberField;
export const consentWorkOrderField = consentJobMemberField;
export function confirmWorkOrderField<T>(field: ReturnType<typeof createJobMemberField<T>>, submitted: T, current: T, expectedState: string) {
  // A newer edit can equal the original baseline; compare with the submitted snapshot.
  if (JSON.stringify(field.value) === JSON.stringify(submitted)) return confirmJobMemberField(field, submitted, current, expectedState);
  return JSON.stringify(field.value) === JSON.stringify(field.baseline) ? {...field, baseline: current} : field;
}



/** Pane generations arbitrate asynchronous create outcomes without replacing newer selection/drafts. */
export type WorkOrderPaneSelection = {readonly id: string | null; readonly key: string} | null;
export function resolveWorkOrderCreateSelection(current: WorkOrderPaneSelection, originKey: string, createdId: string):
  {readonly selection: WorkOrderPaneSelection; readonly adopted: boolean} {
  if (!current || current.key !== originKey || current.id !== null) return {selection: current, adopted: false};
  return {selection: {...current, id: createdId}, adopted: true};
}
/** An unreadable prerequisite can be anonymous while its readable dependent remains exact. */
export function selectWorkOrderDependencyWarnings<T extends {readonly state: string; readonly dependent?: WorkOrderEndpoint}>(warnings: readonly T[], dependent: WorkOrderEndpoint): readonly T[] {
  return warnings.filter(warning => warning.dependent?.jobId === dependent.jobId
    && warning.dependent.workOrderId === dependent.workOrderId);
}


/** Reject abandoned child generations before their snapshot can replace the current pane. */
export function canReceiveWorkOrderPaneProjection(current: WorkOrderPaneSelection, originKey?: string): boolean {
  return originKey === undefined || current?.key === originKey;
}
/** Only a definite first-submission rejection plus serialized absence permits a new consent baseline. */
export function workOrderCreateRecovery(code: string, unresolved: boolean): "stale" | "uncertain" | null {
  if (unresolved) return "uncertain";
  if (code === "COMMAND_CONFLICT") return "stale";
  return code === "PREVIEW_STALE" || code === "SERVER_ERROR" ? "uncertain" : null;
}
