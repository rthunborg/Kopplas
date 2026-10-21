import { CommandError } from "../command-errors";
import type { CommandExecuteContext } from "../envelope-core";
import type { CommandDbClient } from "../envelope";
import type { JobMemberInput } from "@/features/jobs/job-members-domain";
type MemberRpc = "assign_job_member_with_audit" | "remove_job_member_with_audit" | "set_job_lead_with_audit" | "update_job_plan_dates_with_audit";
/** SQL owns the business write and its single audit event in the same transaction. */
export async function jobMemberMutation(ctx: CommandExecuteContext<JobMemberInput, CommandDbClient>, name: MemberRpc): Promise<{jobId: string}> {
  const {commandId, jobId, expectedState, ...payload} = ctx.input;
  const {data, error} = await (ctx.db as unknown as import("@/server/read-models/my-jobs").JobCardRpcClient).rpc(name, {p_tenant_id: ctx.tenantContext.tenantId,
    p_actor_user_id: ctx.tenantContext.userId, p_command_id: commandId, p_correlation_id: ctx.correlationId,
    p_job_id: jobId, p_expected_state: expectedState, p_payload: payload});
  if (error) {
    const code = (error as {code?: string}).code;
    if (code === "42501" || code === "23503") throw new CommandError("TENANT_ACCESS_DENIED");
    if (["23514", "22P02", "22007", "22008"].includes(code ?? "")) throw new CommandError("VALIDATION_FAILED");
    if (code === "BK409") throw new CommandError("PREVIEW_STALE");
    throw new Error("job member mutation failed");
  }
  if (!data || typeof data !== "object" || (data as {jobId?: unknown}).jobId !== jobId) throw new Error("invalid job member result");
  return {jobId};
}
