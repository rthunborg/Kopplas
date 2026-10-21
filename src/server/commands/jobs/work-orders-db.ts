import { CommandError } from "../command-errors";
import type { CommandExecuteContext } from "../envelope-core";
import type { CommandDbClient } from "../envelope";
import type { WorkOrderInput } from "@/features/jobs/work-orders-domain";
export type WorkOrderRpc = "create_work_order_with_audit" | "update_work_order_with_audit" | "set_work_order_assignees_with_audit"
  | "set_work_order_status_with_audit" | "set_work_order_dependencies_with_audit" | "set_job_work_order_dependencies_with_audit";
/** Checked SQL owns both the mutation and its one durable audit outcome. */
export async function workOrderMutation(ctx: CommandExecuteContext<WorkOrderInput, CommandDbClient>, name: WorkOrderRpc): Promise<{jobId: string; workOrderId?: string}> {
  const {commandId, jobId, expectedState, ...rest} = ctx.input;
  const {workOrderId, ...payload} = rest as Record<string, unknown>;
  const client = ctx.db as unknown as import("@/server/read-models/my-jobs").JobCardRpcClient;
  const args = {
    p_tenant_id: ctx.tenantContext.tenantId, p_actor_user_id: ctx.tenantContext.userId, p_command_id: commandId,
    p_correlation_id: ctx.correlationId, p_job_id: jobId, p_work_order_id: workOrderId ?? null,
    p_expected_state: expectedState, p_payload: payload,
  };
  let {data, error} = await client.rpc(name, args);
  if (name === "create_work_order_with_audit" && (error as {code?: string} | null)?.code === "BK409") {
    // Only recover the original durable identity; newer child/job state stays untouched.
    const recovered = await client.rpc("reconcile_work_order_create", args);
    data = recovered.data; error = recovered.error;
  }
  if (error) {
    const code = (error as {code?: string}).code;
    if (code === "42501" || code === "23503") throw new CommandError("TENANT_ACCESS_DENIED");
    if (["23514", "23505", "22P02", "22007", "22008"].includes(code ?? "")) throw new CommandError("VALIDATION_FAILED");
    if (name === "create_work_order_with_audit" && code === "BK404") throw new CommandError("COMMAND_CONFLICT");
    if (code === "BK409") throw new CommandError("PREVIEW_STALE");
    throw new Error("work order mutation failed");
  }
  if (!data || typeof data !== "object" || (data as {jobId?: unknown}).jobId !== jobId) throw new Error("invalid work order result");
  const child = (data as {workOrderId?: unknown}).workOrderId;
  if (name === "create_work_order_with_audit" && typeof child !== "string") throw new Error("missing work order result");
  return {jobId, ...(typeof child === "string" ? {workOrderId: child} : {})};
}
