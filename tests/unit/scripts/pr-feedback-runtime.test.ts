import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { capture, collect, createApi, publish, validateProposal, validateResult } from "../../../scripts/pr-feedback/runtime.mjs";
import { signJournal, STATE_MARKER, selectFeedback, fingerprintFeedback } from "../../../scripts/pr-feedback/policy.mjs";

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
  let concurrentMutation = false;
  let foreignRef = false;
  const state = { schemaVersion: 1, prNumber: 101, lifetimeAttempts: 1, batches: { [plan.fingerprint]: 1 }, reservation: { runId: "123", runAttempt: 1, headSha: f.headSha, fingerprint: plan.fingerprint } };
  const api = async (path: string, options: { method?: string; body?: unknown } = {}) => {
    calls.push(`${options.method ?? "GET"} ${path}`);
    if (path.includes("actions/variables")) return { variables: [{ name: "PR_FIX_ENABLED", value: switchesEnabled ? "true" : "false" }, { name: "PR_FIX_PUBLISH", value: "true" }] };
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
