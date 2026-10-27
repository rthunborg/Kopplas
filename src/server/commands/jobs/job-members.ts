import { defineCommand } from "../envelope";
import { validateAssignMemberInput, validateRemoveMemberInput, validateSetLeadInput,
  type AssignMemberInput, type RemoveMemberInput, type SetLeadInput } from "@/features/jobs/job-members-domain";
import { jobMemberMutation } from "./job-members-db";
export const assignJobMember = defineCommand<AssignMemberInput, {jobId: string}>({
  command: "job.member.assign", auditable: false, eventType: "job.member.assign", targetType: "job",
  validateInput: (raw) => {const r = validateAssignMemberInput(raw); return r.valid ? {ok: true, data: r.value} : {ok: false, code: "VALIDATION_FAILED"};},
  ownership: (input) => ({table: "jobs", id: input.jobId}),
  execute: (ctx) => jobMemberMutation(ctx, "assign_job_member_with_audit"),
});
export const removeJobMember = defineCommand<RemoveMemberInput, {jobId: string}>({
  command: "job.member.remove", auditable: false, eventType: "job.member.remove", targetType: "job",
  validateInput: (raw) => {const r = validateRemoveMemberInput(raw); return r.valid ? {ok: true, data: r.value} : {ok: false, code: "VALIDATION_FAILED"};},
  ownership: (input) => ({table: "jobs", id: input.jobId}),
  execute: (ctx) => jobMemberMutation(ctx, "remove_job_member_with_audit"),
});
export const setJobLead = defineCommand<SetLeadInput, {jobId: string}>({
  command: "job.lead.set", auditable: false, eventType: "job.lead.set", targetType: "job",
  validateInput: (raw) => {const r = validateSetLeadInput(raw); return r.valid ? {ok: true, data: r.value} : {ok: false, code: "VALIDATION_FAILED"};},
  ownership: (input) => ({table: "jobs", id: input.jobId}),
  execute: (ctx) => jobMemberMutation(ctx, "set_job_lead_with_audit"),
});
