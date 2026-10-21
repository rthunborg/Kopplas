import { CommandError } from "../command-errors";
import type { CommandExecuteContext } from "../envelope-core";
import type { CommandDbClient } from "../envelope";
import type { JobUpgradeInput } from "@/features/jobs/job-upgrade-domain";
export async function upgradeJobDb(ctx: CommandExecuteContext<JobUpgradeInput,CommandDbClient>): Promise<{jobId: string; type: "projekt"}> {
  const {jobId,commandId,expectedState} = ctx.input;
  const {data,error} = await (ctx.db as unknown as import("@/server/read-models/my-jobs").JobCardRpcClient).rpc("upgrade_job_to_projekt_with_audit", {
    p_tenant_id:ctx.tenantContext.tenantId,p_actor_user_id:ctx.tenantContext.userId,p_command_id:commandId,
    p_correlation_id:ctx.correlationId,p_job_id:jobId,p_expected_state:expectedState});
  if(error) {
    const code = (error as {code?:string}).code;
    if(code === "JT409") throw new CommandError("JOB_TYPE_DOWNGRADE_FORBIDDEN");
    if(code === "42501" || code === "23503") throw new CommandError("TENANT_ACCESS_DENIED");
    if(code === "BK409") throw new CommandError("PREVIEW_STALE");
    if(code === "23514" || code === "22P02") throw new CommandError("VALIDATION_FAILED");
    throw new Error("job upgrade failed");
  }
  if(!data || typeof data !== "object" || (data as {jobId:unknown}).jobId !== jobId || (data as {type:unknown}).type !== "projekt") throw new Error("job upgrade result invalid");
  return {jobId,type:"projekt"};
}
