import { createHash } from "node:crypto";
import { defineCommand, type CommandConfig } from "../envelope";
import { CommandError } from "../command-errors";
import { validateJobCardInput, type JobCardInput } from "@/features/jobs/job-card-domain";
import { conflictClaims, type BookingRpcClient } from "@/server/bookings/conflict-facts";
import { jobCardRpc } from "./card-db";
import { deriveJobCardConflicts, parseJobCardSnapshot } from "./card-facts";
import { jobCardKeyFromEnv, signJobCardOutput } from "./card-proof";
function stableCandidate(tenantId: string, commandId: string): string {
  const hex = createHash("sha256").update(JSON.stringify(["job-card-v1", tenantId, commandId])).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
function configuration(operation: "create" | "update"): Omit<CommandConfig<JobCardInput, {jobId: string}>, "command"> {
  return {
    auditable: false, eventType: operation === "create" ? "job.created" : "job.updated", targetType: "job",
    validateInput: (raw) => { const result = validateJobCardInput(raw, operation);
      return result.valid ? {ok: true, data: result.value} : {ok: false, code: "VALIDATION_FAILED"}; },
    execute: async (ctx) => {
      const {commandId, candidateId, id, ...payload} = ctx.input;
      const args = { p_tenant_id: ctx.tenantContext.tenantId, p_actor_id: ctx.tenantContext.userId,
        p_correlation_id: ctx.correlationId, p_command_id: commandId, p_job_id: id ?? null,
        p_candidate_id: id ?? candidateId ?? stableCandidate(ctx.tenantContext.tenantId, commandId), p_payload: payload };
      const client = ctx.db as unknown as BookingRpcClient;
      const snapshot = parseJobCardSnapshot(await jobCardRpc(client, "snapshot_job_card", {...args,
        p_key_id: process.env.BOOKING_CONFLICT_ATTESTATION_KEY_ID ?? "unconfigured"}));
      if (snapshot.kind === "replay") return snapshot.result;
      const key = jobCardKeyFromEnv();
      if (key.keyId !== snapshot.keyId) throw new Error("job card proof configuration changed");
      const output = JSON.stringify(deriveJobCardConflicts(snapshot));
      const result = await jobCardRpc(client, "finalize_job_card", {...args, p_claims: conflictClaims(snapshot), p_output: output,
        p_signature: signJobCardOutput(snapshot, output, key.secret)});
      if (result && typeof result === "object" && (result as {kind?: string}).kind === "stale") throw new CommandError("PREVIEW_STALE");
      if (!result || typeof result !== "object" || (result as {kind?: string}).kind !== "committed"
        || typeof (result as {jobId?: string}).jobId !== "string") throw new Error("job card result invalid");
      return {jobId: (result as {jobId: string}).jobId};
    },
  };
}
export const createJobCard = defineCommand<JobCardInput, {jobId: string}>({...configuration("create"), command: "job.card.create"});
export const updateJobCard = defineCommand<JobCardInput, {jobId: string}>({...configuration("update"), command: "job.card.update"});
