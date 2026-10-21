/** Story 16.4 AC01–02. RED contracts; proposed pure bindings are replaceable.
 * Authority, same-row persistence and audit atomicity require the integration suite.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

const JOB = "16400000-0000-4000-8000-000000000001";
const COMMAND = "16400000-0000-4000-8000-000000000002";
type Request = { jobId: string; commandId: string };
type Draft = { jobId: string; revision: number; status: string;
  submission: null | { commandId: string; jobId: string; revision: number; status: string } };
type UpgradeContract = {
  validateJobUpgradeInput(raw: unknown): { valid: boolean; value?: Request };
  validateJobTypeTransition(from: string, to: string): { allowed: boolean; code?: string };
  createJobUpgradeDraft(jobId: string): Draft;
  transitionJobUpgradeDraft(state: Draft, event: Record<string, unknown>): Draft;
};

// Provider: future src/features/jobs/job-upgrade-domain.ts; no import until activated.
test("[P0][16.4-U01] upgrade input is closed and reverse kind transition has the exact error", async () => {
  const modulePath = new URL("../../../../src/features/jobs/job-upgrade-domain.ts", import.meta.url).href;
  const domain = await import(modulePath) as UpgradeContract;
  assert.deepEqual(domain.validateJobUpgradeInput({ jobId: JOB, commandId: COMMAND }),
    { valid: true, value: { jobId: JOB, commandId: COMMAND } });
  for (const raw of [null, [], { jobId: JOB }, { jobId: "invalid", commandId: COMMAND },
    { jobId: JOB, commandId: COMMAND, type: "projekt" },
    { jobId: JOB, commandId: COMMAND, actorId: JOB },
    { jobId: JOB, commandId: COMMAND, projectOnlyFields: {} }]) {
    assert.equal(domain.validateJobUpgradeInput(raw).valid, false);
  }
  assert.deepEqual(domain.validateJobTypeTransition("order", "projekt"), { allowed: true });
  assert.deepEqual(domain.validateJobTypeTransition("projekt", "projekt"), { allowed: true });
  assert.deepEqual(domain.validateJobTypeTransition("projekt", "order"),
    { allowed: false, code: "JOB_TYPE_DOWNGRADE_FORBIDDEN" });
});

// Provider: future headless confirmation state; a confirmed event requires server persistence.
test("[P0][16.4-U02] failed upgrade retains exact retry identity and ignores stale confirmation", async () => {
  const modulePath = new URL("../../../../src/features/jobs/job-upgrade-domain.ts", import.meta.url).href;
  const domain = await import(modulePath) as UpgradeContract;
  const initial = domain.createJobUpgradeDraft(JOB);
  const submitting = domain.transitionJobUpgradeDraft(initial, { type: "submit", commandId: COMMAND });
  assert.equal(submitting.status, "submitting");
  assert.equal(submitting.jobId, JOB);
  const submitted = structuredClone(submitting.submission);
  const stale = domain.transitionJobUpgradeDraft(submitting,
    { type: "confirmed", commandId: "16400000-0000-4000-8000-000000000099", jobId: JOB, revision: 0 });
  assert.deepEqual(stale, submitting);
  const failed = domain.transitionJobUpgradeDraft(submitting,
    { type: "failed", commandId: COMMAND, jobId: JOB, revision: 0 });
  assert.equal(failed.status, "failed");
  const retry = domain.transitionJobUpgradeDraft(failed, { type: "retry" });
  assert.deepEqual(retry.submission, { ...submitted, status: "submitting" });
  assert.equal(retry.status, "submitting");
  const persisted = domain.transitionJobUpgradeDraft(retry,
    { type: "confirmed", commandId: COMMAND, jobId: JOB, revision: 0 });
  assert.equal(persisted.status, "persisted");
  assert.equal(persisted.jobId, JOB);
});


test("[P0][16.4-F01] definitive upgrade rejection dismisses, unresolved retries retain identity, stale refresh cannot reset a newer outcome",async()=>{
 const d=await import("@/features/jobs/job-upgrade-domain");
 const initial=d.createJobUpgradeDraft(JOB), submitting=d.transitionJobUpgradeDraft(initial,{type:"submit",commandId:COMMAND});
 const refused=d.transitionJobUpgradeDraft(submitting,{type:"failed",commandId:COMMAND,jobId:JOB,revision:0,code:"VALIDATION_FAILED"});
 assert.equal(d.canDismissJobUpgradeDraft(refused),true);
 const unknown=d.transitionJobUpgradeDraft(submitting,{type:"failed",commandId:COMMAND,jobId:JOB,revision:0,code:"SERVER_ERROR"});
 assert.equal(d.canDismissJobUpgradeDraft(unknown),false);
 const retry=d.transitionJobUpgradeDraft(unknown,{type:"retry"});
 const revoked=d.transitionJobUpgradeDraft(retry,{type:"failed",commandId:COMMAND,jobId:JOB,revision:0,code:"PERMISSION_DENIED"});
 assert.equal(d.canDismissJobUpgradeDraft(revoked),false,"a denied retry cannot resolve an earlier uncertain commit");
 const refreshing=d.transitionJobUpgradeDraft(refused,{type:"begin-refetch"});
 assert.equal(d.canDismissJobUpgradeDraft(refreshing),false);
 assert.equal(d.transitionJobUpgradeDraft(refreshing,{type:"refetched",revision:refreshing.revision-1}),refreshing);
 const fresh=d.transitionJobUpgradeDraft(refreshing,{type:"refetched",revision:refreshing.revision});
 const next=d.transitionJobUpgradeDraft(fresh,{type:"submit",commandId:COMMAND});
 const persisted=d.transitionJobUpgradeDraft(next,{type:"confirmed",commandId:COMMAND,jobId:JOB,revision:next.revision});
 assert.equal(d.transitionJobUpgradeDraft(persisted,{type:"refetched",revision:refreshing.revision}),persisted);
 assert.equal(d.transitionJobUpgradeDraft(refreshing,{type:"refetch-failed",revision:refreshing.revision}).status,"failed");
});
