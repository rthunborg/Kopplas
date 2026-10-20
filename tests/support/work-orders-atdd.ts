/** Story 16.3 actual seam over committed 16.1/16.2 fixtures. No DB work on import.
 * Activate after checked SQL/read projections exist and reconcile ONLY these
 * replaceable export/RPC/DTO spellings. They are not additional product policy.
 * Calls forward real commands/normal JWT RPCs; there are no synthetic replies.
 * Playwright-utils flag true/package absent; Vitest remains the existing runner.
 */
import type { TestServerClient } from "../factories/tenants";
import type { JobsDepthFixture } from "./jobs-depth-atdd";
import type { DurableRow } from "./bookings-atdd";

export type WorkOrderStatus = "created" | "in_progress" | "done" | "cancelled";
export type WorkOrderEndpoint = { jobId: string; workOrderId: string | null };
export type WorkOrderOperation = "create" | "update" | "assignees" | "status" | "dependencies" | "jobDependencies";
export const workOrderBindings = {
  create: { export: "createWorkOrder", rpc: "create_work_order_with_audit" },
  update: { export: "updateWorkOrder", rpc: "update_work_order_with_audit" },
  assignees: { export: "setWorkOrderAssignees", rpc: "set_work_order_assignees_with_audit" },
  status: { export: "setWorkOrderStatus", rpc: "set_work_order_status_with_audit" },
  dependencies: { export: "setWorkOrderDependencies", rpc: "set_work_order_dependencies_with_audit" },
  jobDependencies: { export: "setJobWorkOrderDependencies", rpc: "set_job_work_order_dependencies_with_audit" },
} as const;
export type WorkOrderInput = { commandId: string; jobId: string; workOrderId?: string;
  expectedState: unknown; title?: string; description?: string | null;
  planned_start_date?: string | null; planned_end_date?: string | null;
  personProfileIds?: readonly string[]; status?: WorkOrderStatus; prerequisites?: readonly WorkOrderEndpoint[] };
export type WorkOrderResult = { ok: true; data: { jobId: string; workOrderId?: string } }
  | { ok: false; code: string; message?: string };
export type WorkOrderRow = { id: string; tenant_id: string; job_id: string; title: string;
  description: string | null; status: WorkOrderStatus; planned_start_date: string | null; planned_end_date: string | null };
export type WorkOrderProjection = { rows: { id: string; jobId: string; title: string; description: string | null;
  status: WorkOrderStatus; plannedStartDate: string | null; plannedEndDate: string | null;
  assignees: { id: string; label: string }[] }[]; expectedState: unknown;
  canEditWorkOrders: boolean; canReopenWorkOrders: boolean;
  eligiblePeople: { id: string; label: string }[];
  prerequisiteOptions: { jobId: string; workOrderId: string | null; label: string }[];
  dependencyWarnings: { state: "delay" | "clear" | "unknown";
    dependent?: WorkOrderEndpoint; prerequisite?: WorkOrderEndpoint;
    prerequisiteEndDate?: string | null; dependentStartDate?: string | null; label?: string }[] };

export async function readWorkOrders(client: TestServerClient, jobId: string): Promise<WorkOrderProjection> {
  const path = "@/server/read-models/job-work-orders";
  const bindings = await import(path) as { readJobWorkOrders: (client: TestServerClient, id: string) => Promise<WorkOrderProjection> };
  return bindings.readJobWorkOrders(client, jobId);
}
export async function workOrderInput(client: TestServerClient, jobId: string,
  patch: Partial<WorkOrderInput> = {}): Promise<WorkOrderInput> {
  const projection = await readWorkOrders(client, jobId);
  const row = projection.rows.find(r => r.id === patch.workOrderId);
  const fields = patch.title !== undefined || patch.description !== undefined || patch.planned_start_date !== undefined || patch.planned_end_date !== undefined;
  return { commandId: crypto.randomUUID(), jobId, expectedState: projection.expectedState,
    ...(fields ? {title: row?.title ?? "Work order", description: row?.description ?? null,
      planned_start_date: row?.plannedStartDate ?? null, planned_end_date: row?.plannedEndDate ?? null} : {}), ...patch };
}
export async function workOrderCommand(operation: WorkOrderOperation, client: TestServerClient,
  input: WorkOrderInput | Record<string, unknown>, correlationId = crypto.randomUUID()): Promise<WorkOrderResult> {
  const { runCommand } = await import("@/server/commands/envelope");
  const path = "@/server/commands/jobs/work-orders";
  const bindings = await import(path) as Record<string, Parameters<typeof runCommand>[0]>;
  return runCommand(bindings[workOrderBindings[operation].export], { client: client as never, input, correlationId }) as Promise<WorkOrderResult>;
}
/** Bypasses envelope/TypeScript validation; SQL must bind the current JWT actor. */
export function checkedWorkOrderCall(operation: WorkOrderOperation, client: TestServerClient, tenantId: string,
  actorId: string, input: WorkOrderInput | Record<string, unknown>, correlationId = crypto.randomUUID()) {
  const { commandId, jobId, workOrderId, expectedState, ...payload } = input;
  return client.rpc(workOrderBindings[operation].rpc, { p_tenant_id: tenantId, p_actor_user_id: actorId,
    p_command_id: commandId, p_correlation_id: correlationId, p_job_id: jobId,
    p_work_order_id: workOrderId ?? null, p_expected_state: expectedState, p_payload: payload });
}
export async function createWorkOrder(client: TestServerClient, jobId: string,
  patch: Partial<WorkOrderInput> = {}): Promise<string> {
  const reply = await workOrderCommand("create", client, await workOrderInput(client, jobId, {
    title: "Install distribution board", description: "Label circuits and verify isolation",
    planned_start_date: null, planned_end_date: null, ...patch }));
  if (!reply.ok || !reply.data.workOrderId) throw new Error(`Real work-order fixture refused: ${reply.ok ? "missing ID" : reply.code}`);
  return reply.data.workOrderId;
}
/** Whole durable tenant state: old dependencies, bookings/conflicts, accepted
 * provenance, actor facts and audit remain visible alongside all three new tables.
 */
export async function workOrdersSnapshot(f: JobsDepthFixture) {
  const { memberSnapshot } = await import("./job-members-atdd");
  const { adminQuery } = await import("../factories/admin-sql");
  const rows = async (table: string) => (await adminQuery<{ row: DurableRow }>(
    `select to_jsonb(t) as row from public.${table} t where tenant_id=any($1::uuid[]) order by to_jsonb(t)::text`,
    [f.fx.tenantIds])).map((r) => r.row);
  return { ...(await memberSnapshot(f)), workOrders: await rows("work_orders"),
    workOrderAssignees: await rows("work_order_assignees"), workOrderDependencies: await rows("work_order_dependencies") };
}
export async function workOrderRows(f: JobsDepthFixture, jobId: string): Promise<WorkOrderRow[]> {
  const { adminQuery } = await import("../factories/admin-sql");
  return adminQuery<WorkOrderRow>("select * from public.work_orders where tenant_id=$1 and job_id=$2 order by id", [f.fx.base.tenantA.id, jobId]);
}
export function workOrderAudit(snapshot: Awaited<ReturnType<typeof workOrdersSnapshot>>, correlationId: string) {
  return snapshot.audit.filter((row) => row.correlation_id === correlationId);
}
/** Observe the real final call; never return success from this observer. */
export function observeWorkOrderClient(client: TestServerClient) {
  const calls: { name: string; args: Record<string, unknown>; data: unknown; error: unknown }[] = [];
  const proxy = new Proxy(client, { get(target, key) {
    if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
      const reply = await target.rpc(name, args);
      calls.push({ name, args, data: reply.data, error: reply.error });
      return reply;
    };
    const value = Reflect.get(target, key, target);
    return typeof value === "function" ? value.bind(target) : value;
  } });
  return { client: proxy, calls };
}


