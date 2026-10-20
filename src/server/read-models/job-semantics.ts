import type { JobCardRpcClient } from "./my-jobs";
import type { JobCardData } from "@/features/jobs/job-card-domain";
import { readJobMembers } from "./job-members";
import { readJobWorkOrders } from "./job-work-orders";
/** Safe operational composition. Each checked reader independently enforces current access. */
export async function readJobSemantics(client: JobCardRpcClient, jobId: string) {
  const {data,error}=await client.rpc("read_job_cards",{p_personal:false,p_job_id:jobId});
  if(error || !Array.isArray(data) || data.length !== 1) throw new Error("job unavailable");
  const row=data[0] as {id:string;type:"order"|"projekt";card:JobCardData;entitlement:{canEdit:boolean}};
  const [members,orders]=await Promise.all([readJobMembers(client,jobId),readJobWorkOrders(client,jobId)]);
  return {id:row.id,type:row.type,card:row.card,expectedState:members.expectedState,leadPersonProfileId:members.leadPersonProfileId,
    workOrders:orders.rows.map(({id,plannedStartDate,plannedEndDate})=>({id,plannedStartDate,plannedEndDate})),
    dependencies:orders.dependencies.map(({dependent,prerequisite})=>({dependentJobId:dependent.jobId,dependentWorkOrderId:dependent.workOrderId,prerequisiteJobId:prerequisite.jobId,prerequisiteWorkOrderId:prerequisite.workOrderId})),
    canUpgrade:row.entitlement.canEdit && row.type === "order",canEditCard:row.entitlement.canEdit};
}
