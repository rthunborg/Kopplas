import { defineCommand } from "../envelope";
import { validateJobUpgradeInput, type JobUpgradeInput } from "@/features/jobs/job-upgrade-domain";
import { upgradeJobDb } from "./job-upgrade-db";
export const upgradeJobToProjekt = defineCommand<JobUpgradeInput,{jobId:string;type:"projekt"}>({
  command:"job.upgrade_to_projekt",auditable:false,eventType:"job.upgraded_to_projekt",targetType:"job",
  validateInput:(raw) => {const r=validateJobUpgradeInput(raw);return r.valid && typeof r.value.expectedState === "string" ? {ok:true,data:r.value} : {ok:false,code:"VALIDATION_FAILED"};},
  ownership:input=>({table:"jobs",id:input.jobId}),execute:upgradeJobDb,
});
