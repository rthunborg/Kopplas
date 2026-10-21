import { defineCommand } from "../envelope";
import { validatePlannedDatesInput, type PlannedDatesInput } from "@/features/jobs/job-members-domain";
import { jobMemberMutation } from "./job-members-db";
export const updateJobPlanDates = defineCommand<PlannedDatesInput, {jobId: string}>({
  command: "job.plan_dates.update", auditable: false, eventType: "job.plan_dates.update", targetType: "job",
  validateInput: (raw) => {const r = validatePlannedDatesInput(raw); return r.valid ? {ok: true, data: r.value} : {ok: false, code: "VALIDATION_FAILED"};},
  ownership: (input) => ({table: "jobs", id: input.jobId}),
  execute: (ctx) => jobMemberMutation(ctx, "update_job_plan_dates_with_audit"),
});
