import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, generateKeyPairSync } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { capture, collect, createApi, finalize, monitor, pilotRecoveryStage, publish, recoveryProof, validateProposal, validateResult } from "../../../scripts/pr-feedback/runtime.mjs";
import { PILOT_RECOVERY, signJournal, verifyJournal, STATE_MARKER, selectFeedback, fingerprintFeedback } from "../../../scripts/pr-feedback/policy.mjs";

// Local temporary repositories only. No remote writes, credentials or model calls.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "kopplas-pr-feedback-test-"));
  const trustedDir = join(root, "trusted");
  const workspaceDir = join(root, "workspace");
  for (const dir of [trustedDir, workspaceDir]) mkdirSync(join(dir, "src/components/crm"), { recursive: true });
  const path = "src/components/crm/FormField.tsx";
  for (const dir of [trustedDir, workspaceDir]) writeFileSync(join(dir, path), "export const label = 'Old';\n");
  const git = (args: string[]) => execFileSync("git", args, { cwd: trustedDir, encoding: "utf8" });
  git(["init", "--quiet"]);
  git(["add", "--", path]);
  git(["-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Fixture"]);
  const headSha = git(["rev-parse", "HEAD"]).trim();
  const plan = { schemaVersion: 1, repo: "rthunborg/Kopplas", prNumber: 101, runId: "123", runAttempt: 1, headSha, dryRun: true };
  const planPath = join(root, "plan.json");
  const proposalPath = join(root, "proposal.json");
  writeFileSync(planPath, JSON.stringify(plan));
  return { root, trustedDir, workspaceDir, path, headSha, plan, planPath, proposalPath, resultPath: undefined };
}

function recoveryFixture(count = 2) {
  const r = PILOT_RECOVERY;
  const ctx = { repo: r.repo, runId: "9003", runAttempt: 1, controllerSha: "e".repeat(40) };
  const feedbackIds = [{ kind: "review-comment", id: 4390637595 }];
  const quota = { schemaVersion: 1, repo: r.repo, prNumber: 112, fingerprint: r.fingerprint, headSha: r.headSha, runId: r.quotaRunId, runAttempt: 1, controllerSha: r.quotaControllerSha, dryRun: true, feedbackIds };
  const second = { ...quota, runId: "9002", controllerSha: ctx.controllerSha };
  // The production caller obtains these only from signature/origin-checked history.
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const journals = (count === 1 ? [quota] : [quota, second]).map(p => verifyJournal(signJournal(p, privateKey), publicKey));
  const content = Buffer.from("test('mixed markup', () => {});\n");
  const proposal = { schemaVersion: 1, plan: second, files: [{ path: "tests/unit/components/dashboard/widget-state.test.ts", beforeOid: "d".repeat(40), content: content.toString("base64"), sha256: createHash("sha256").update(content).digest("hex"), mode: "100644" }], result: { outcome: "changed", addressedIds: ["review-comment:4390637595"], unresolvedIds: [] } };
  const proposalDigest = createHash("sha256").update(JSON.stringify(proposal)).digest("hex");
  return { ctx, plan: { prNumber: 112, fingerprint: r.fingerprint, headSha: r.headSha, dryRun: count === 1 }, state: { batches: { [r.fingerprint]: count } }, journals, manual: true, pilot: 112 as number | undefined,
    proof: { run: { id: 9002, run_attempt: 1, workflow_id: 384363087, event: "workflow_dispatch", head_branch: "main", head_sha: ctx.controllerSha, path: ".github/workflows/pr-feedback.yml", status: "completed", conclusion: "success" },
      jobs: ["collect", "code", "validate", "publish"].map(name => ({ name, run_id: 9002, run_attempt: 1, status: "completed", conclusion: "success" })),
      proposal, proposalDigest, beforeOid: "d".repeat(40), attestation: { schemaVersion: 1, digest: proposalDigest, headSha: r.headSha, runId: "9002" } } };
}

test("quota1 is counted: only dry2, then proven nonempty validated dry2 permits live3", () => {
  const dry = recoveryFixture(1);
  assert.doesNotThrow(() => pilotRecoveryStage(dry));
  dry.plan.dryRun = false; assert.throws(() => pilotRecoveryStage(dry), /not proven/);
  const live = recoveryFixture(); assert.doesNotThrow(() => pilotRecoveryStage(live));
  live.plan.dryRun = true; assert.throws(() => pilotRecoveryStage(live), /not proven/);
});

for (const mismatch of ["latest-attempt", "failed-run", "artifact-missing", "artifact-duplicate", "artifact-expired", "artifact-size", "artifact-run", "artifact-controller", "artifact-branch", "artifact-time"]) test(`dry2 artifact reader fails closed on ${mismatch} without downloading unproven evidence`, async () => {
  const f = recoveryFixture(); let downloads = 0;
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => { downloads++; throw new Error("Unproven evidence must not be downloaded"); };
  try {
    const run = { ...f.proof.run, run_started_at: "2026-10-27T17:00:00Z", updated_at: "2026-10-27T17:05:00Z" };
    const artifact = { id: 1, name: "pr-feedback-proposal", expired: false, size_in_bytes: 100, created_at: "2026-10-27T17:04:00Z", workflow_run: { id: 9002, head_sha: f.ctx.controllerSha, head_branch: "main" } };
    if (mismatch === "latest-attempt") run.run_attempt = 2;
    if (mismatch === "failed-run") run.conclusion = "failure";
    if (mismatch === "artifact-expired") artifact.expired = true;
    if (mismatch === "artifact-size") artifact.size_in_bytes = 262145;
    if (mismatch === "artifact-run") artifact.workflow_run.id = 9001;
    if (mismatch === "artifact-controller") artifact.workflow_run.head_sha = "f".repeat(40);
    if (mismatch === "artifact-branch") artifact.workflow_run.head_branch = "codex/forged";
    if (mismatch === "artifact-time") artifact.created_at = "2026-10-27T16:59:00Z";
    const api = async (path: string) => {
      if (path.endsWith("/attempts/1/jobs?per_page=100&page=1")) return { jobs: f.proof.jobs };
      if (path.endsWith("/artifacts?per_page=100&page=1")) return { artifacts: mismatch === "artifact-missing" ? [] : mismatch === "artifact-duplicate" ? [artifact, artifact] : [artifact] };
      if (path.endsWith("/actions/runs/9002")) return run;
      throw new Error(`Unexpected proof route ${path}`);
    };
    await assert.rejects(recoveryProof(api, f.ctx, f.journals, "unused-fixture-path"));
    assert.equal(downloads, 0);
  } finally { globalThis.fetch = oldFetch; }
});

for (const mutation of ["zero", "fourth", "missing-quota", "wrong-quota-attempt", "duplicate", "automatic", "guard-absent", "other-guard", "moved-head", "rerun", "old-controller", "other-controller"] as const) test(`pilot recovery rejects ${mutation} before another attempt`, () => {
  const f = recoveryFixture();
  if (mutation === "zero") f.state.batches[PILOT_RECOVERY.fingerprint] = 0;
  if (mutation === "fourth") f.state.batches[PILOT_RECOVERY.fingerprint] = 3;
  if (mutation === "missing-quota") f.journals.shift();
  if (mutation === "wrong-quota-attempt") f.journals[0].runAttempt = 2;
  if (mutation === "duplicate") f.journals[1] = f.journals[0];
  if (mutation === "automatic") f.manual = false;
  if (mutation === "guard-absent") f.pilot = undefined;
  if (mutation === "other-guard") f.pilot = 113;
  if (mutation === "moved-head") f.plan.headSha = "f".repeat(40);
  if (mutation === "rerun") f.ctx.runAttempt = 2;
  if (mutation === "old-controller") f.ctx.controllerSha = PILOT_RECOVERY.quotaControllerSha;
  if (mutation === "other-controller") f.ctx.controllerSha = "f".repeat(40);
  assert.throws(() => pilotRecoveryStage(f), /not proven/);
});

test("a claimed changed dry proposal containing identical before-image bytes is a no-op", () => {
  const f = recoveryFixture();
  const bytes = Buffer.from(f.proof.proposal.files[0].content, "base64");
  const beforeOid = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  f.proof.beforeOid = beforeOid; f.proof.proposal.files[0].beforeOid = beforeOid;
  assert.throws(() => pilotRecoveryStage(f), /not proven/);
});

for (const outcome of ["failure", "skipped", "cancelled", "pending", "unknown"]) test(`dry2 ${outcome} cannot fund live3`, () => {
  const f = recoveryFixture(); f.proof.run.conclusion = outcome;
  assert.throws(() => pilotRecoveryStage(f), /not proven/);
});

for (const name of ["collect", "code", "validate", "publish"]) test(`each exact dry2 job ${name} must pass at the signed attempt`, () => {
  for (const field of ["failure", "skipped", "wrong-attempt", "wrong-run", "missing", "duplicate"]) {
    const f = recoveryFixture(); const job = f.proof.jobs.find(j => j.name === name)!;
    if (field === "failure" || field === "skipped") job.conclusion = field;
    if (field === "wrong-attempt") job.run_attempt = 2;
    if (field === "wrong-run") job.run_id = 9001;
    if (field === "missing") f.proof.jobs = f.proof.jobs.filter(j => j !== job);
    if (field === "duplicate") f.proof.jobs.push({ ...job });
    assert.throws(() => pilotRecoveryStage(f), /not proven/);
  }
});

for (const mutation of ["noop", "unaddressed", "plan-fingerprint", "plan-attempt", "plan-controller", "attestation-run", "attestation-head", "digest", "before-image", "other-file", "run-attempt", "run-workflow", "run-controller"] as const) test(`dry2 proof rejects ${mutation}`, () => {
  const f = recoveryFixture();
  if (mutation === "noop") f.proof.proposal.files = [];
  if (mutation === "unaddressed") f.proof.proposal.result.addressedIds = [];
  if (mutation === "plan-fingerprint") f.proof.proposal.plan = { ...f.proof.proposal.plan, fingerprint: "a".repeat(64) };
  if (mutation === "plan-attempt") f.proof.proposal.plan = { ...f.proof.proposal.plan, runAttempt: 2 };
  if (mutation === "plan-controller") f.proof.proposal.plan = { ...f.proof.proposal.plan, controllerSha: "f".repeat(40) };
  if (mutation === "attestation-run") f.proof.attestation.runId = "9001";
  if (mutation === "attestation-head") f.proof.attestation.headSha = "f".repeat(40);
  if (mutation === "digest") f.proof.attestation.digest = "f".repeat(64);
  if (mutation === "before-image") f.proof.beforeOid = "f".repeat(40);
  if (mutation === "other-file") f.proof.proposal.files[0].path = "tests/unit/components/other.test.ts";
  if (mutation === "run-attempt") f.proof.run.run_attempt = 2;
  if (mutation === "run-workflow") f.proof.run.workflow_id = 9;
  if (mutation === "run-controller") f.proof.run.head_sha = "f".repeat(40);
  assert.throws(() => pilotRecoveryStage(f));
});

test("controller-only changes do not become protected seed deletions during capture and validation", () => {
  const f = fixture();
  try {
    const git = (args: string[]) => execFileSync("git", args, { cwd: f.trustedDir, encoding: "utf8" });
    mkdirSync(join(f.trustedDir, "scripts/pr-feedback"), { recursive: true });
    writeFileSync(join(f.trustedDir, "scripts/pr-feedback/policy.mjs"), "// new controller only\n");
    git(["add", "--", "scripts/pr-feedback/policy.mjs"]);
    git(["-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "--quiet", "-m", "Controller update"]);
    assert.notEqual(git(["rev-parse", "HEAD"]).trim(), f.headSha);
    writeFileSync(join(f.workspaceDir, f.path), "export const label = 'Fixed';\n");
    const captured = capture({ ...f, outputPath: f.proposalPath }); assert.equal(captured.changed, true);
    const validated = validateProposal(f); assert.deepEqual(validated.proposal.files.map((x: { path: string }) => x.path), [f.path]);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

// Actual collector orchestration with synthetic GitHub responses. Counter assertions
// distinguish an audit result from App minting, attempt history and reservation.
async function collectionFixture(run: (f: {
  root: string; out: string; counts: Record<string, number>;
  freshPublish: string[]; freshEnabled: string[]; variablesFailure: boolean;
  freshPilot: Array<string | undefined>; published: boolean;
  staleReservation: boolean;
  optedIn: boolean; protectedPath: boolean; permission: string; exhausted: boolean;
  recoveryPilot: boolean;
}) => Promise<void>, patch: Record<string, string | undefined> = {}) {
  const root = mkdtempSync(join(tmpdir(), "kopplas-pr-feedback-collection-"));
  const previousEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const headSha = "b".repeat(40);
  const actor = { id: 53317458, login: "rthunborg", type: "User" };
  const f = { root, out: join(root, "out"), counts: { requests: 0, tokens: 0, variables: 0, history: 0, reservations: 0, stateUpdates: 0 },
    freshPublish: ["false"], freshEnabled: ["true"], variablesFailure: false,
    freshPilot: [undefined] as Array<string | undefined>, published: false, staleReservation: false,
    optedIn: true, protectedPath: false, permission: "admin", exhausted: false, recoveryPilot: false };
  let authoritativeBody: string | undefined;
  try {
    Object.assign(process.env, {
      GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_REF: "refs/heads/main", GITHUB_SHA: "a".repeat(40),
      GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_EVENT_NAME: "workflow_dispatch",
      GITHUB_EVENT_PATH: join(root, "event.json"), GITHUB_TOKEN: "read-fixture",
      PR_FIX_ENABLED: "true", PR_FIX_PUBLISH: "false", PR_FIX_DRY_RUN: "true",
      PR_FIX_PILOT_PR: "", PR_FIX_MONITOR_ONLY: "false",
      PR_FIX_APP_ID: "600", PR_FIX_APP_USER_ID: "500", PR_FIX_APP_PRIVATE_KEY: privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
    });
    for (const [name, value] of Object.entries(patch)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    writeFileSync(process.env.GITHUB_EVENT_PATH!, JSON.stringify({ sender: actor, inputs: { pr_number: "101", dry_run: "true" }, issue: { number: 101, pull_request: {} } }));
    globalThis.fetch = async (input, options) => {
      const url = new URL(String(input)), path = f.recoveryPilot ? url.pathname.replace(/\/112(?=\/|$)/g, "/101") : url.pathname;
      assert.equal(url.origin, "https://api.github.com");
      f.counts.requests++;
      const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
      if (path.endsWith("/installation")) return response({ id: 700, permissions: { contents: "write", pull_requests: "write", issues: "write", actions: "read", actions_variables: "read" } });
      if (path === "/app/installations/700/access_tokens") { f.counts.tokens++; return response({ token: "app-fixture" }, 201); }
      if (path.endsWith("/actions/variables")) {
        const index = f.counts.variables++;
        if (f.variablesFailure) return response({}, 503);
        const pilot = f.freshPilot[Math.min(index, f.freshPilot.length - 1)];
        return response({ variables: [{ name: "PR_FIX_ENABLED", value: f.freshEnabled[Math.min(index, f.freshEnabled.length - 1)] },
          { name: "PR_FIX_PUBLISH", value: f.freshPublish[Math.min(index, f.freshPublish.length - 1)] },
          ...(pilot === undefined ? [] : [{ name: "PR_FIX_PILOT_PR", value: pilot }])] });
      }
      if (path.includes("/collaborators/")) return response({ permission: f.permission });
      const pr = { number: f.recoveryPilot ? 112 : 101, state: "open", draft: false, created_at: new Date().toISOString(), title: "Synthetic label defect", body: "Synthetic fixture only",
        user: actor, head: { sha: f.recoveryPilot ? PILOT_RECOVERY.headSha : headSha, ref: "codex/pilot", repo: { full_name: "rthunborg/Kopplas" } },
        base: { ref: "main", repo: { full_name: "rthunborg/Kopplas" } }, labels: f.optedIn ? [{ name: "agent-fix" }] : [] };
      if (path === "/repos/rthunborg/Kopplas/pulls") return response([pr]);
      if (path === "/repos/rthunborg/Kopplas/pulls/101") return response(pr);
      if (path.endsWith("/actions/workflows/pr-feedback.yml")) { f.counts.history++; return response({ id: 77 }); }
      if (path.endsWith("/actions/artifacts")) return response({ artifacts: [] });
      if (path.endsWith("/issues/101/comments")) {
        if (f.recoveryPilot) return response([]);
        if (options?.method === "POST") { f.counts.reservations++; authoritativeBody = JSON.parse(String(options.body)).body; return response({ id: 88 }, 201); }
        const feedback = { id: 10, body: "Restore the accessible field label.", user: actor, updated_at: new Date().toISOString() };
        const state = { schemaVersion: 1, prNumber: 101, lifetimeAttempts: f.exhausted ? 6 : 1, batches: {},
          ...(f.published ? { published: { headSha, notified: false }, reviewerLogins: [] } : {}),
          ...(f.staleReservation ? { phase: "reserved", reservation: { runId: "122", headSha, fingerprint: "c".repeat(64) } } : {}) };
        return response(authoritativeBody || f.exhausted || f.published || f.staleReservation ? [feedback, { id: 88, user: { id: 500 }, performed_via_github_app: { id: 600 },
          body: authoritativeBody ?? `${STATE_MARKER}\n\`\`\`json\n${JSON.stringify(state)}\n\`\`\`` }] : [feedback]);
      }
      if (path.endsWith("/issues/comments/88")) { f.counts.stateUpdates++; return response({ id: 88 }); }
      if (path.endsWith("/pulls/101/comments") && f.recoveryPilot) return response([{ id: 4390637595, body: "Restore plain()’s & decoding and add a regression in this test file covering mixed HTML, the entity and whitespace; <p> Plan &amp; <strong>klart</strong> </p> should produce Plan & klart.", user: actor, updated_at: "2026-10-27T15:33:29Z", commit_id: PILOT_RECOVERY.headSha, position: 5, path: "tests/unit/components/dashboard/widget-state.test.ts", pull_request_review_id: 5669780235 }]);
      if (path.endsWith("/pulls/101/reviews") || path.endsWith("/pulls/101/comments")) return response([]);
      if (path === "/graphql") return response({ data: { repository: { pullRequest: { reviewThreads: { nodes: f.recoveryPilot ? [{ isResolved: false, isOutdated: false, comments: { pageInfo: { hasNextPage: false }, nodes: [{ databaseId: 4390637595 }] } }] : [], pageInfo: { hasNextPage: false } } } } } });
      if (path.endsWith("/pulls/101/files")) return response([{ filename: f.protectedPath ? "src/server/auth/guard.ts" : "src/components/crm/FormField.tsx", status: "modified", patch: "synthetic" }]);
      if (path.endsWith("/actions/workflows/ci.yml/runs")) return response({ workflow_runs: f.published ? [{ id: 900, event: "pull_request", head_sha: headSha,
        path: ".github/workflows/ci.yml", status: "completed", conclusion: "failure", pull_requests: [{ number: 101, head: { sha: headSha } }] }] : [] });
      if (path.endsWith("/actions/runs/900/jobs")) return response({ jobs: [{ name: "db", status: "completed", conclusion: "failure" }] });
      if (path.endsWith("/actions/runs/122")) return response({ status: "completed", conclusion: "failure" });
      throw new Error(`Unexpected collection route: ${path}`);
    };
    await run(f);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of Object.keys(process.env)) if (!(name in previousEnv)) delete process.env[name];
    Object.assign(process.env, previousEnv);
    rmSync(root, { recursive: true, force: true });
  }
}

test("real collector refuses recovery count0/missing signed quota before journal or reservation", async () => {
  const previousNow = Date.now;
  Date.now = () => Date.parse("2026-10-27T16:00:00Z");
  try {
    await collectionFixture(async f => {
      f.recoveryPilot = true; f.freshPilot = ["112"]; f.freshPublish = ["true"];
      writeFileSync(process.env.GITHUB_EVENT_PATH!, JSON.stringify({ sender: { id: 53317458, login: "rthunborg", type: "User" }, inputs: { pr_number: "112" } }));
      await assert.rejects(collect(f.out), /recovery sequence is not proven/);
      assert.equal(existsSync(join(f.out, "journal.json")), false);
      assert.equal(f.counts.reservations, 0);
    }, { PR_FIX_PILOT_PR: "112", PR_FIX_PUBLISH: "true" });
  } finally { Date.now = previousNow; }
});

for (const event of ["schedule", "issue_comment"]) test(`publication hold audits ${event} before App/history/attempt side effects`, async () => {
  await collectionFixture(async f => {
    assert.deepEqual(await collect(f.out), { eligible: false, dryRun: true });
    assert.deepEqual(f.counts, { requests: 0, tokens: 0, variables: 0, history: 0, reservations: 0, stateUpdates: 0 });
    assert.equal(existsSync(join(f.out, "journal.json")), false);
    assert.equal(existsSync(join(f.out, "plan.json")), false);
    assert.equal(existsSync(join(f.out, "prompt.txt")), false);
  }, { GITHUB_EVENT_NAME: event });
});

test("publication hold admits an authorized explicit manual dry run through the existing journal and policy", async () => {
  await collectionFixture(async f => {
    const result = await collect(f.out);
    assert.equal(result.eligible, true); assert.equal(result.dryRun, true);
    assert.equal(f.counts.tokens, 1); assert.equal(f.counts.history, 1); assert.equal(f.counts.variables, 2);
    assert.equal(f.counts.reservations, 0);
    assert.equal(JSON.parse(readFileSync(join(f.out, "plan.json"), "utf8")).headSha, "b".repeat(40));
    assert.equal(JSON.parse(readFileSync(join(f.out, "journal.json"), "utf8")).plan.dryRun, true);
    assert.equal(existsSync(join(f.out, "prompt.txt")), true);
  });
});

for (const requested of ["false", undefined]) test(`publication hold rejects a non-explicit manual dry request (${requested}) without App effects`, async () => {
  await collectionFixture(async f => {
    assert.deepEqual(await collect(f.out), { eligible: false, dryRun: true });
    assert.equal(f.counts.requests, 0); assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { PR_FIX_DRY_RUN: requested });
});

for (const event of ["schedule", "issue_comment"]) test(`fresh publication hold stops stale-true ${event} before history/journal`, async () => {
  await collectionFixture(async f => {
    assert.deepEqual(await collect(f.out), { eligible: false, dryRun: true });
    assert.equal(f.counts.tokens, 1); assert.equal(f.counts.variables, 1);
    assert.equal(f.counts.history, 0); assert.equal(f.counts.reservations, 0);
    assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { GITHUB_EVENT_NAME: event, PR_FIX_PUBLISH: "true" });
});

test("publication hold refreshed during collection stops before a live reservation or journal", async () => {
  await collectionFixture(async f => {
    f.freshPublish = ["true", "false"];
    assert.deepEqual(await collect(f.out), { eligible: false, dryRun: true });
    assert.equal(f.counts.variables, 2); assert.equal(f.counts.history, 1); assert.equal(f.counts.reservations, 0);
    assert.equal(existsSync(join(f.out, "journal.json")), false);
    assert.equal(existsSync(join(f.out, "prompt.txt")), false);
  }, { GITHUB_EVENT_NAME: "schedule", PR_FIX_PUBLISH: "true" });
});

for (const changed of ["publication-hold", "pilot-restriction", "disabled"]) test(`actual collector denies stale reservation reconciliation after ${changed}`, async () => {
  await collectionFixture(async f => {
    f.staleReservation = true; f.freshPublish = changed === "publication-hold" ? ["true", "false"] : ["true"];
    if (changed === "pilot-restriction") f.freshPilot = [undefined, "101"];
    if (changed === "disabled") f.freshEnabled = ["true", "false"];
    assert.deepEqual(await collect(f.out), { eligible: false, dryRun: true });
    assert.equal(f.counts.variables, 2); assert.equal(f.counts.stateUpdates, 0); assert.equal(f.counts.reservations, 0);
    assert.equal(existsSync(join(f.out, "journal.json")), false); assert.equal(existsSync(join(f.out, "prompt.txt")), false);
  }, { GITHUB_EVENT_NAME: "schedule", PR_FIX_PUBLISH: "true" });
});

test("publication true retains normal automatic live reservation and signed plan", async () => {
  await collectionFixture(async f => {
    f.freshPublish = ["true"];
    const result = await collect(f.out);
    assert.equal(result.eligible, true); assert.equal(result.dryRun, false);
    assert.equal(f.counts.reservations, 1); assert.equal(f.counts.variables, 2);
    assert.equal(JSON.parse(readFileSync(join(f.out, "journal.json"), "utf8")).plan.dryRun, false);
  }, { GITHUB_EVENT_NAME: "schedule", PR_FIX_PUBLISH: "true" });
});

for (const blocked of ["disabled-snapshot", "disabled-current", "not-opted-in", "protected-path", "unauthorized-actor", "exhausted-budget"]) test(`manual pilot retains ${blocked} refusal`, async () => {
  await collectionFixture(async f => {
    if (blocked === "disabled-snapshot") process.env.PR_FIX_ENABLED = "false";
    if (blocked === "disabled-current") f.freshEnabled = ["false"];
    if (blocked === "not-opted-in") f.optedIn = false;
    if (blocked === "protected-path") f.protectedPath = true;
    if (blocked === "unauthorized-actor") f.permission = "read";
    if (blocked === "exhausted-budget") f.exhausted = true;
    if (blocked === "unauthorized-actor") await assert.rejects(collect(f.out), /not authorized/);
    else assert.equal((await collect(f.out)).eligible, false);
    assert.equal(f.counts.reservations, 0); assert.equal(existsSync(join(f.out, "journal.json")), false);
  });
});

for (const failure of ["api", "unknown-value"]) test(`uncertain current switches (${failure}) fail before journal/model admission`, async () => {
  await collectionFixture(async f => {
    if (failure === "api") f.variablesFailure = true; else f.freshPublish = ["unknown"];
    await assert.rejects(collect(f.out), failure === "api" ? /503/ : /unavailable or ambiguous/);
    assert.equal(f.counts.history, 0); assert.equal(f.counts.reservations, 0);
    assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { GITHUB_EVENT_NAME: "schedule", PR_FIX_PUBLISH: "true" });
});

for (const event of ["schedule", "issue_comment"]) test(`designated pilot rejects automatic ${event} even with publication true`, async () => {
  await collectionFixture(async f => {
    assert.deepEqual(await collect(f.out), { eligible: false, dryRun: true });
    assert.equal(f.counts.requests, 0); assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { GITHUB_EVENT_NAME: event, PR_FIX_PUBLISH: "true", PR_FIX_PILOT_PR: "101" });
});

for (const pilot of ["0", "-1", "101.5", "not-a-pr", "9007199254740993"]) test(`malformed pilot admission ${pilot} fails before App or attempts`, async () => {
  await collectionFixture(async f => {
    await assert.rejects(collect(f.out), /configuration is invalid|positive identifier/);
    assert.equal(f.counts.requests, 0); assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { PR_FIX_PILOT_PR: pilot });
});

test("designated pilot rejects a different manual PR before App or attempt side effects", async () => {
  await collectionFixture(async f => {
    assert.equal((await collect(f.out)).eligible, false);
    assert.equal(f.counts.requests, 0); assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { PR_FIX_PILOT_PR: "102" });
});

for (const live of [false, true]) test(`matching designated manual pilot preserves ${live ? "live" : "dry"} checks and signed history`, async () => {
  await collectionFixture(async f => {
    f.freshPilot = ["101"]; f.freshPublish = [live ? "true" : "false"];
    const result = await collect(f.out);
    assert.equal(result.eligible, true); assert.equal(result.dryRun, !live);
    assert.equal(f.counts.reservations, live ? 1 : 0); assert.equal(f.counts.history, 1);
    const journal = JSON.parse(readFileSync(join(f.out, "journal.json"), "utf8"));
    assert.equal(journal.plan.prNumber, 101); assert.equal(journal.plan.dryRun, !live);
    assert.equal(Object.hasOwn(journal.plan, "pilot"), false, "existing signed journal schema remains unchanged");
  }, { PR_FIX_PILOT_PR: "101", PR_FIX_PUBLISH: live ? "true" : "false", PR_FIX_DRY_RUN: live ? "false" : "true" });
});

for (const stage of ["initial", "late"]) test(`fresh pilot restriction at ${stage} collection blocks an automatic attempt`, async () => {
  await collectionFixture(async f => {
    f.freshPublish = ["true"]; f.freshPilot = stage === "initial" ? ["101"] : [undefined, "101"];
    assert.equal((await collect(f.out)).eligible, false);
    assert.equal(f.counts.history, stage === "initial" ? 0 : 1);
    assert.equal(f.counts.reservations, 0); assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { GITHUB_EVENT_NAME: "schedule", PR_FIX_PUBLISH: "true" });
});

test("an empty current pilot variable is malformed rather than normal-mode admission", async () => {
  await collectionFixture(async f => {
    f.freshPilot = [""];
    await assert.rejects(collect(f.out), /configuration is invalid/);
    assert.equal(f.counts.history, 0); assert.equal(f.counts.reservations, 0);
  });
});

test("pilot monitor-only uses the existing exact-head CI monitor without reserving an attempt", async () => {
  await collectionFixture(async f => {
    f.freshPilot = ["101"]; f.freshPublish = ["true"]; f.published = true; f.exhausted = true;
    assert.deepEqual(await collect(f.out), { eligible: false, dryRun: false });
    assert.equal(f.counts.history, 0); assert.equal(f.counts.reservations, 0); assert.equal(f.counts.stateUpdates, 1);
    assert.equal(existsSync(join(f.out, "journal.json")), false); assert.equal(existsSync(join(f.out, "prompt.txt")), false);
    assert.match(JSON.parse(readFileSync(join(f.out, "report.json"), "utf8")).reason, /Monitor-only/);
  }, { PR_FIX_PILOT_PR: "101", PR_FIX_PUBLISH: "true", PR_FIX_DRY_RUN: "false", PR_FIX_MONITOR_ONLY: "true" });
});

test("pilot monitor-only cannot bypass whole-PR policy", async () => {
  await collectionFixture(async f => {
    f.freshPilot = ["101"]; f.freshPublish = ["true"]; f.published = true; f.protectedPath = true;
    await assert.rejects(collect(f.out), /Protected/);
    assert.equal(f.counts.stateUpdates, 0); assert.equal(f.counts.history, 0); assert.equal(f.counts.reservations, 0);
  }, { PR_FIX_PILOT_PR: "101", PR_FIX_PUBLISH: "true", PR_FIX_DRY_RUN: "false", PR_FIX_MONITOR_ONLY: "true" });
});

test("pilot monitor-only rechecks admission before writing a completed CI outcome", async () => {
  await collectionFixture(async f => {
    f.freshPilot = ["101", "101", "102"]; f.freshPublish = ["true"]; f.published = true;
    assert.equal((await collect(f.out)).eligible, false);
    assert.equal(f.counts.stateUpdates, 0); assert.equal(f.counts.reservations, 0); assert.equal(f.counts.history, 0);
    assert.equal(existsSync(join(f.out, "journal.json")), false);
  }, { PR_FIX_PILOT_PR: "101", PR_FIX_PUBLISH: "true", PR_FIX_DRY_RUN: "false", PR_FIX_MONITOR_ONLY: "true" });
});

test("a pilot restriction changed before failure finalization prevents state writes", async () => {
  await collectionFixture(async f => {
    f.freshPilot = ["101"]; f.freshPublish = ["true"];
    assert.equal((await collect(f.out)).eligible, true);
    f.freshPilot = ["102"];
    await assert.rejects(finalize({ planPath: join(f.out, "plan.json"), journalPath: join(f.out, "journal.json") }), /do not admit failure finalization/);
    assert.equal(f.counts.stateUpdates, 0); assert.equal(f.counts.reservations, 1);
  }, { PR_FIX_PILOT_PR: "101", PR_FIX_PUBLISH: "true", PR_FIX_DRY_RUN: "false" });
});

function readinessMonitorFixture() {
  const headSha = "b".repeat(40);
  const f = { writes: 0, posts: 0, uncertainPost: false, persisted: undefined as { prNumber: number; published: { headSha: string; notified: boolean }; reviewerLogins: string[] } | undefined };
  const state = { prNumber: 101, published: { headSha, notified: false }, reviewerLogins: ["reviewer"] };
  const pr = { number: 101, state: "open", head: { sha: headSha }, user: { login: "author", id: 123 }, changed_files: 1 };
  const api = async (path: string, options: { method?: string; body?: unknown } = {}) => {
    if (path.includes("/runs?")) return { workflow_runs: [{ id: 900, event: "pull_request", head_sha: headSha, path: ".github/workflows/ci.yml",
      status: "completed", conclusion: "success", pull_requests: [{ number: 101, head: { sha: headSha } }] }] };
    if (path.includes("/jobs?")) return { jobs: ["checkpoint-admission", "verify", "db", "recovery-storage-loader", "e2e"].map(name => ({ name, status: "completed", conclusion: "success" })) };
    if (path === "/repos/o/r/pulls/101") return pr;
    if (path.includes("/files?")) return [{ filename: "README.md" }];
    if (path.includes("/comments?") || path.includes("/reviews?")) return [];
    if (path.endsWith("/issues/101/comments")) {
      f.writes++;
      const body = (options.body as { body: string }).body;
      f.persisted = JSON.parse(body.split("```json\n")[1].split("\n```")[0]);
      return { id: 88 };
    }
    if (path.endsWith("/requested_reviewers")) {
      f.posts++;
      if (f.uncertainPost) throw new Error("Synthetic unknown notification transport outcome");
      return {};
    }
    throw new Error(`Unexpected readiness route ${path}`);
  };
  return { f, state, pr, api };
}

test("actual monitor denial leaves known-not-sent intent resumable and completes one later admitted pair", async () => {
  const { f, state, pr, api } = readinessMonitorFixture();
  const denied = await monitor(api, { repo: "o/r" }, pr, state, true, async () => false);
  assert.equal(denied.published.notified, false); assert.equal(f.writes, 0); assert.equal(f.posts, 0);
  let admissions = 0;
  const resumed = await monitor(api, { repo: "o/r" }, pr, denied, true, async () => ++admissions === 1);
  assert.equal(admissions, 1, "durable intent and its one POST share one admission");
  assert.equal(resumed.phase, "ci-passed"); assert.equal(resumed.published.notified, true);
  assert.equal(f.writes, 1); assert.equal(f.posts, 1);
  await monitor(api, { repo: "o/r" }, pr, resumed, true, async () => false);
  assert.equal(f.posts, 1, "completed intent never repeats its notification");
});

test("actual monitor never blindly retries a notification after an uncertain POST", async () => {
  const { f, state, pr, api } = readinessMonitorFixture(); f.uncertainPost = true;
  await assert.rejects(monitor(api, { repo: "o/r" }, pr, state, true), /unknown notification transport/);
  assert.equal(f.writes, 1); assert.equal(f.posts, 1); assert.equal(f.persisted?.published.notified, true);
  await monitor(api, { repo: "o/r" }, pr, f.persisted!, true, async () => false);
  assert.equal(f.posts, 1);
});

test("capture and validation independently bind regular-file contents to exact base tree", () => {
  const f = fixture();
  try {
    writeFileSync(join(f.workspaceDir, f.path), "export const label = 'Fixed';\n");
    const captured = capture({ ...f, outputPath: f.proposalPath });
    assert.equal(captured.changed, true);
    const validated = validateProposal({ ...f, targetDir: undefined });
    assert.equal(validated.digest, captured.digest);
    assert.equal(validated.proposal.files.length, 1);
    assert.equal(validated.proposal.plan.headSha, f.headSha);
    const content = validated.proposal.files[0].content;
    assert.ok(typeof content === "string");
    assert.equal(Buffer.from(content, "base64").toString(), "export const label = 'Fixed';\n");
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test("no-change is a zero-file proposal rather than fabricated success", () => {
  const f = fixture();
  try {
    assert.equal(capture({ ...f, outputPath: f.proposalPath }).changed, false);
    assert.equal(validateProposal({ ...f, targetDir: undefined }).proposal.files.length, 0);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test("publication eligibility rejects forged plan and changed before-image", () => {
  const f = fixture();
  try {
    writeFileSync(join(f.workspaceDir, f.path), "export const label = 'Fixed';\n");
    capture({ ...f, outputPath: f.proposalPath });
    const original = JSON.parse(readFileSync(f.proposalPath, "utf8"));
    writeFileSync(f.proposalPath, JSON.stringify({ ...original, plan: { ...original.plan, headSha: "b".repeat(40) } }));
    assert.throws(() => validateProposal({ ...f, targetDir: undefined }), /origin/);
    writeFileSync(f.proposalPath, JSON.stringify({ ...original, files: [{ ...original.files[0], beforeOid: "c".repeat(40) }] }));
    assert.throws(() => validateProposal({ ...f, targetDir: undefined }), /before-image/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test("capture rejects protected file additions before any publisher runs", () => {
  const f = fixture();
  try {
    mkdirSync(join(f.workspaceDir, ".github/workflows"), { recursive: true });
    writeFileSync(join(f.workspaceDir, ".github/workflows/ci.yml"), "permissions: write-all\n");
    assert.throws(() => capture({ ...f, outputPath: f.proposalPath }), /Protected/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test("validator applies the precise proposal in a separate no-secret checkout", () => {
  const f = fixture();
  try {
    writeFileSync(join(f.workspaceDir, f.path), "export const label = 'Fixed';\n");
    capture({ ...f, outputPath: f.proposalPath });
    const targetDir = join(f.root, "validation");
    execFileSync("git", ["clone", "--quiet", "--no-hardlinks", f.trustedDir, targetDir]);
    validateProposal({ ...f, targetDir });
    assert.equal(readFileSync(join(targetDir, f.path), "utf8"), "export const label = 'Fixed';\n");
    assert.equal(readFileSync(join(f.trustedDir, f.path), "utf8"), "export const label = 'Old';\n");
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test("API errors for rate limits/quota fail without echoing credential values", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("no", { status: 429 });
  try {
    await assert.rejects(createApi("test-secret-never-log")("/repos/rthunborg/Kopplas"), (error: Error) => {
      assert.match(error.message, /429/);
      assert.doesNotMatch(error.message, /test-secret-never-log/);
      return true;
    });
    await assert.rejects(createApi("test")("https://attacker.invalid"), /relative/);
  } finally { globalThis.fetch = originalFetch; }
});

test("missing protected credentials yields audit-only with no API or inference request", async () => {
  const root = mkdtempSync(join(tmpdir(), "kopplas-pr-feedback-credentials-"));
  const values: Record<string, string | undefined> = {
    GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_REF: "refs/heads/main", GITHUB_SHA: "a".repeat(40),
    GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_EVENT_NAME: "schedule", PR_FIX_ENABLED: "true",
    PR_FIX_APP_PRIVATE_KEY: undefined, PR_FIX_APP_ID: undefined, PR_FIX_APP_USER_ID: undefined,
    GITHUB_EVENT_PATH: join(root, "event.json"),
  };
  const previous = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Unexpected external request"); };
  try {
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    writeFileSync(values.GITHUB_EVENT_PATH!, "{}");
    const result = await collect(join(root, "out"));
    assert.equal(result.eligible, false);
    assert.match(JSON.parse(readFileSync(join(root, "out/report.json"), "utf8")).reason, /Audit only/);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    rmSync(root, { recursive: true, force: true });
  }
});

test("structured model outcomes cover every feedback ID without forcing changes", () => {
  const feedbackIds = [{ kind: "review-comment", id: 11 }, { kind: "review", id: 12 }];
  for (const outcome of ["no-change", "needs-human"]) {
    assert.equal(validateResult({ outcome, addressedIds: [], unresolvedIds: ["review-comment:11", "review:12"], summary: "Requires a product decision." }, feedbackIds).outcome, outcome);
  }
  assert.throws(() => validateResult({ outcome: "changed", addressedIds: ["review-comment:99"], unresolvedIds: ["review:12"] }, feedbackIds));
  assert.throws(() => validateResult({ outcome: "no-change", addressedIds: ["review-comment:11"], unresolvedIds: ["review:12"] }, feedbackIds));
  assert.throws(() => validateResult({ outcome: "changed", addressedIds: ["review-comment:11"], unresolvedIds: [] }, feedbackIds));
});

test("publisher rejects stale revision/failed attestation and pushes before notifications", async () => {
  const f = fixture();
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const key = privateKey.export({ format: "pem", type: "pkcs8" }).toString();
  const values = {
    GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_REF: "refs/heads/main", GITHUB_SHA: "a".repeat(40),
    GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_EVENT_NAME: "schedule",
    PR_FIX_PUBLISH: "true", PR_FIX_ENABLED: "true", PR_FIX_APP_ID: "600", PR_FIX_APP_USER_ID: "500", PR_FIX_APP_PRIVATE_KEY: key,
  };
  const previous = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  const inline = { id: 11, body: "Fix the label.", user: { id: 53317458, login: "rthunborg", type: "User" }, updated_at: new Date().toISOString(), commit_id: f.headSha, position: 2, path: f.path };
  const feedback = selectFeedback({ reviewComments: [inline], permissions: { rthunborg: "admin" }, headSha: f.headSha });
  const plan = { ...f.plan, dryRun: false, controllerSha: values.GITHUB_SHA, headRef: "codex/pilot", stateCommentId: 77, fingerprint: fingerprintFeedback(feedback), feedback, feedbackIds: [{ kind: "review-comment", id: 11 }] };
  const resultPath = join(f.root, "model.json");
  const attestationPath = join(f.root, "attestation.json");
  const journalPath = join(f.root, "journal.json");
  const calls: string[] = [];
  let stale = false;
  let staleDuringPush = false;
  let prReads = 0;
  let currentPermission = "admin";
  let switchesEnabled = true;
  let pilotPr: string | undefined;
  let concurrentMutation = false;
  let foreignRef = false;
  let disableDuringBranchLookup = false;
  const state = { schemaVersion: 1, prNumber: 101, lifetimeAttempts: 1, batches: { [plan.fingerprint]: 1 }, reservation: { runId: "123", runAttempt: 1, headSha: f.headSha, fingerprint: plan.fingerprint } };
  const api = async (path: string, options: { method?: string; body?: unknown } = {}) => {
    calls.push(`${options.method ?? "GET"} ${path}`);
    if (path.includes("actions/variables")) return { variables: [{ name: "PR_FIX_ENABLED", value: switchesEnabled ? "true" : "false" }, { name: "PR_FIX_PUBLISH", value: "true" }, ...(pilotPr === undefined ? [] : [{ name: "PR_FIX_PILOT_PR", value: pilotPr }])] };
    if (path.endsWith("/pulls/101")) {
      prReads++;
      return { number: 101, state: "open", draft: false, base: { ref: "main" }, head: { sha: stale || staleDuringPush && prReads > 1 ? "b".repeat(40) : f.headSha, ref: plan.headRef, repo: { full_name: values.GITHUB_REPOSITORY } }, labels: [{ name: "agent-fix" }] };
    }
    if (path.includes("/pulls/101/reviews")) return [];
    if (path.includes("/pulls/101/comments")) return [inline];
    if (path.includes("/collaborators/rthunborg/permission")) return { permission: currentPermission };
    if (path.includes("issues/101/comments")) return [{ id: 77, user: { id: 500 }, performed_via_github_app: { id: 600 }, body: `${STATE_MARKER}\n\`\`\`json\n${JSON.stringify(state)}\n\`\`\`` }];
    if (path === "/graphql") {
      const body = options.body as { query: string; variables: { input: Record<string, unknown> } };
      if (body.query.includes("createCommitOnBranch")) {
        calls.push("COMMIT");
        assert.equal(body.variables.input.expectedHeadOid, f.headSha);
        assert.deepEqual(body.variables.input.branch, { id: "REF_fixture" });
        assert.deepEqual(body.variables.input.fileChanges, { additions: [{ path: f.path, contents: Buffer.from("export const label = 'Fixed';\n").toString("base64") }], deletions: [] });
        assert.equal("force" in body.variables.input, false);
        if (concurrentMutation) return { errors: [{ message: "Head changed after precheck." }] };
        return { data: { createCommitOnBranch: { commit: { oid: "e".repeat(40), parents: { nodes: [{ oid: f.headSha }] } }, ref: { id: "REF_fixture", target: { oid: "e".repeat(40) } } } } };
      }
      if (disableDuringBranchLookup) switchesEnabled = false;
      return { data: { repository: { pullRequest: { headRef: { id: "REF_fixture", name: plan.headRef, target: { oid: f.headSha }, repository: { nameWithOwner: foreignRef ? "attacker/Kopplas" : values.GITHUB_REPOSITORY } } } } } };
    }
    if (path.endsWith("/issues/comments/77")) return { id: 77 };
    if (path.endsWith("/pulls/comments/11")) return { pull_request_url: "https://api.github.com/repos/rthunborg/Kopplas/pulls/101" };
    if (path.endsWith("/comments/11/replies")) return { id: 80 };
    throw new Error(`Unexpected mocked route: ${path}`);
  };
  try {
    Object.assign(process.env, values);
    writeFileSync(f.planPath, JSON.stringify(plan));
    writeFileSync(journalPath, JSON.stringify(signJournal(plan, privateKey)));
    writeFileSync(resultPath, JSON.stringify({ outcome: "changed", addressedIds: ["review-comment:11"], unresolvedIds: [], summary: "Fixed label." }));
    writeFileSync(join(f.workspaceDir, f.path), "export const label = 'Fixed';\n");
    const captured = capture({ ...f, outputPath: f.proposalPath, resultPath });
    const attestation = { schemaVersion: 1, digest: captured.digest, headSha: f.headSha, runId: "123" };
    writeFileSync(attestationPath, JSON.stringify({ ...attestation, digest: "invalid" }));
    const args = { ...f, attestationPath, journalPath, api, unresolvedIds: new Set([11]) };
    await assert.rejects(publish(args), /attestation/);
    assert.equal(calls.length, 0);
    writeFileSync(attestationPath, JSON.stringify(attestation));
    stale = true;
    await assert.rejects(publish(args), /PR changed/);
    assert.equal(calls.includes("COMMIT"), false);
    calls.length = 0;
    stale = false;
    currentPermission = "read";
    await assert.rejects(publish(args), /authorization changed/);
    assert.equal(calls.includes("COMMIT"), false);
    currentPermission = "admin";
    switchesEnabled = false;
    await assert.rejects(publish(args), /switches have been disabled/);
    switchesEnabled = true;
    pilotPr = "101";
    await assert.rejects(publish(args), /Pilot admission/);
    assert.equal(calls.includes("COMMIT"), false, "automatic publication cannot enter a designated manual pilot");
    process.env.GITHUB_EVENT_NAME = "workflow_dispatch";
    pilotPr = "102";
    await assert.rejects(publish(args), /Pilot admission/);
    assert.equal(calls.includes("COMMIT"), false, "fresh pilot target changes prevent publication");
    pilotPr = undefined;
    process.env.GITHUB_EVENT_NAME = "schedule";
    staleDuringPush = true;
    prReads = 0;
    await assert.rejects(publish(args), /PR changed during publication/);
    assert.equal(calls.includes("COMMIT"), false);
    staleDuringPush = false;
    foreignRef = true;
    await assert.rejects(publish(args), /branch identity changed/);
    assert.equal(calls.includes("COMMIT"), false);
    foreignRef = false;
    concurrentMutation = true;
    await assert.rejects(publish(args), /Atomic commit publication failed/);
    assert.equal(calls.some((call) => call.includes("/replies")), false);
    concurrentMutation = false;
    calls.length = 0;
    disableDuringBranchLookup = true;
    await assert.rejects(publish(args), /switches have been disabled/);
    assert.equal(calls.includes("COMMIT"), false, "a hold after intermediate reads blocks the first mutation");
    disableDuringBranchLookup = false;
    switchesEnabled = true;
    calls.length = 0;
    prReads = 0;
    assert.equal((await publish(args)).phase, "published");
    const push = calls.indexOf("COMMIT");
    const notification = calls.findIndex((call) => call.includes("/replies"));
    assert.ok(push >= 0 && notification > push);
    assert.equal(calls.some((call) => call.includes("requested_reviewers")), false, "re-review waits for CI");
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    rmSync(f.root, { recursive: true, force: true });
  }
});
