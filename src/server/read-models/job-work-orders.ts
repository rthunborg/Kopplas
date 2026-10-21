import type { JobCardRpcClient } from "./my-jobs";

export type WorkOrderStatus = "created" | "in_progress" | "done" | "cancelled";
export type WorkOrderEndpoint = { readonly jobId: string; readonly workOrderId: string | null };
export type WorkOrderRow = {
  readonly id: string; readonly jobId: string; readonly title: string; readonly description: string | null;
  readonly status: WorkOrderStatus; readonly plannedStartDate: string | null; readonly plannedEndDate: string | null;
  readonly assignees: readonly { readonly id: string; readonly label: string }[];
};
export type WorkOrderDependencyWarning = {
  readonly state: "delay" | "clear" | "unknown";
  readonly dependent?: WorkOrderEndpoint; readonly prerequisite?: WorkOrderEndpoint;
  readonly prerequisiteEndDate?: string | null; readonly dependentStartDate?: string | null; readonly label?: string;
};
export type JobWorkOrdersProjection = {
  readonly rows: readonly WorkOrderRow[]; readonly expectedState: string;
  readonly canEditWorkOrders: boolean; readonly canReopenWorkOrders: boolean; readonly canEditJobDependencies: boolean;
  readonly eligiblePeople: readonly { readonly id: string; readonly label: string }[];
  readonly prerequisiteOptions: readonly (WorkOrderEndpoint & { readonly label: string })[];
  readonly dependencies: readonly { readonly dependent: WorkOrderEndpoint; readonly prerequisite: WorkOrderEndpoint }[];
  readonly dependencyWarnings: readonly WorkOrderDependencyWarning[];
};
const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid work order projection");
  return value as Record<string, unknown>;
};
const string = (value: unknown): string => {
  if (typeof value !== "string") throw new Error("invalid work order field");
  return value;
};
const nullable = (value: unknown): string | null => value === null ? null : string(value);
const array = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) throw new Error("invalid work order list");
  return value;
};
const person = (value: unknown) => { const p = record(value); return {id: string(p.id), label: string(p.label)}; };
const endpoint = (value: unknown): WorkOrderEndpoint => {
  const p = record(value); return {jobId: string(p.jobId), workOrderId: nullable(p.workOrderId)};
};
/** Construct only the checked, display-safe DTO. No raw persistence/auth/profile/CRM keys cross this boundary. */
export async function readJobWorkOrders(client: JobCardRpcClient | undefined, jobId: string): Promise<JobWorkOrdersProjection> {
  const resolved = client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
  const {data, error} = await resolved.rpc("read_job_work_orders", {p_job_id: jobId});
  if (error) throw new Error("work orders unavailable");
  const p = record(data), expectedState = string(p.expectedState);
  if (!/^[a-f0-9]{64}$/.test(expectedState)) throw new Error("invalid work order state");
  return {
    expectedState, canEditWorkOrders: p.canEditWorkOrders === true, canReopenWorkOrders: p.canReopenWorkOrders === true,
    canEditJobDependencies: p.canEditJobDependencies === true,
    rows: array(p.rows).map((value) => {
      const r = record(value), status = string(r.status) as WorkOrderStatus;
      if (r.jobId !== jobId || !["created", "in_progress", "done", "cancelled"].includes(status)) throw new Error("invalid work order parent/status");
      return {id: string(r.id), jobId, title: string(r.title), description: nullable(r.description), status,
        plannedStartDate: nullable(r.plannedStartDate), plannedEndDate: nullable(r.plannedEndDate), assignees: array(r.assignees).map(person)};
    }),
    eligiblePeople: array(p.eligiblePeople).map(person),
    prerequisiteOptions: array(p.prerequisiteOptions).map((value) => ({...endpoint(value), label: string(record(value).label)})),
    dependencies: array(p.dependencies ?? []).map((value) => {
      const r = record(value); return {dependent: endpoint(r.dependent), prerequisite: endpoint(r.prerequisite)};
    }),
    dependencyWarnings: array(p.dependencyWarnings).map((value) => {
      const w = record(value);
      if (w.state !== "delay" && w.state !== "clear" && w.state !== "unknown") throw new Error("invalid warning");
      // Unknown prerequisites deliberately carry no invented endpoint or timing metadata.
      return {state: w.state, ...(w.dependent ? {dependent: endpoint(w.dependent)} : {}),
        ...(w.prerequisite ? {prerequisite: endpoint(w.prerequisite)} : {}),
        ...(w.prerequisiteEndDate !== undefined ? {prerequisiteEndDate: nullable(w.prerequisiteEndDate)} : {}),
        ...(w.dependentStartDate !== undefined ? {dependentStartDate: nullable(w.dependentStartDate)} : {}),
        ...(typeof w.label === "string" ? {label: w.label} : {})};
    }),
  };
}
export type JobWorkOrdersReadResult = { readonly ok: true; readonly projection: JobWorkOrdersProjection }
  | { readonly ok: false; readonly message: string };
export async function readJobWorkOrdersForPage(client: JobCardRpcClient | undefined, jobId: string): Promise<JobWorkOrdersReadResult> {
  try { return {ok: true, projection: await readJobWorkOrders(client, jobId)}; }
  catch { return {ok: false, message: "Arbetsorder kunde inte hämtas. Försök igen."}; }
}
