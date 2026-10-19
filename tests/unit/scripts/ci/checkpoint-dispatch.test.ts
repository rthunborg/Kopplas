import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkpoint, checkpointTitle, parseArgs, validateRequest } from "../../../../scripts/ci/checkpoint-dispatch.mjs";

const sha = "a".repeat(40);
const request = { repo: "owner/repo", ref: "codex/checkpoint", sha };
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "checkpoint-unit-"));
  const state = join(directory, "state.json");
  const calls: { method: string; endpoint: string; body: unknown }[] = [];
  let runs: Record<string, unknown>[] = [];
  let failDispatch = false;
  let failCancel = false;
  let permission = "write";
  let remoteSha = sha;
  let actor = "owner";
  let fullPage = false;
  const api = (method: string, endpoint: string, body?: unknown) => {
    calls.push({ method, endpoint, body });
    if (endpoint === "user") return { login: actor };
    if (endpoint.endsWith("/permission")) return { permission };
    if (endpoint.includes("/branches/")) return { commit: { sha: remoteSha } };
    if (endpoint.endsWith("/workflows/ci.yml")) return { id: 42, path: ".github/workflows/ci.yml", state: "active" };
    if (endpoint.endsWith("/dispatches")) { if (failDispatch) throw new Error("secret response"); return null; }
    if (endpoint.includes("/runs?")) return { workflow_runs: fullPage ? Array.from({ length: 100 }, () => ({ display_title: "unrelated" })) : runs };
    if (endpoint.endsWith("/cancel")) { if (failCancel) throw new Error("secret response"); return null; }
    if (endpoint.includes("/actions/runs/")) return runs.find((run) => endpoint.endsWith(`/${run.id}`));
    throw new Error(`Unexpected test endpoint ${endpoint}`);
  };
  const dependencies = { api, now: () => new Date("2026-10-19T12:00:00Z") };
  const dispatch = () => checkpoint("dispatch", { ...request, state }, dependencies);
  const status = () => checkpoint("status", { state }, dependencies);
  const cancel = () => checkpoint("cancel", { state }, dependencies);
  const record = () => JSON.parse(readFileSync(state, "utf8"));
  const run = (changes = {}) => {
    const current = record();
    return { id: 123, repository: { full_name: request.repo }, workflow_id: 42,
      path: ".github/workflows/ci.yml", event: "workflow_dispatch", head_branch: request.ref,
      head_sha: sha, display_title: checkpointTitle(current.checkpoint_id, sha),
      actor: { login: "owner" }, triggering_actor: { login: "owner" }, run_attempt: 1,
      status: "queued", conclusion: null, ...changes };
  };
  return { state, calls, dependencies, dispatch, status, cancel, record, run,
    setRuns(value: Record<string, unknown>[]) { runs = value; },
    failDispatch() { failDispatch = true; }, failCancel() { failCancel = true; },
    permission(value: string) { permission = value; }, remoteSha(value: string) { remoteSha = value; },
    actor(value: string) { actor = value; }, fullPage() { fullPage = true; },
    cleanup() { rmSync(directory, { recursive: true, force: true }); } };
}
function withFixture(body: (value: ReturnType<typeof fixture>) => void) {
  const value = fixture();
  try { body(value); } finally { value.cleanup(); }
}
const mutations = (f: ReturnType<typeof fixture>) => f.calls.filter((call) => call.method === "POST");

test("dispatch persists unique intent before its only POST and sends immutable inputs", () => withFixture((f) => {
  const baseApi = f.dependencies.api;
  f.dependencies.api = (method, endpoint, body) => {
    if (method === "POST") assert.equal(f.record().phase, "dispatch-uncertain");
    return baseApi(method, endpoint, body);
  };
  f.dispatch();
  const state = f.record();
  assert.equal(state.phase, "dispatched");
  assert.equal(state.actor, "owner");
  assert.deepEqual(mutations(f)[0].body, { ref: request.ref, inputs: { expected_sha: sha, checkpoint_id: state.checkpoint_id } });
  assert.throws(f.dispatch, /already exists/);
  assert.equal(mutations(f).length, 1);
}));

test("uncertain dispatch retains durable identity and status never retries", () => withFixture((f) => {
  f.failDispatch();
  assert.throws(f.dispatch, /outcome uncertain/);
  assert.equal(f.record().phase, "dispatch-uncertain");
  assert.equal(f.status().phase, "dispatch-uncertain");
  assert.throws(f.dispatch, /already exists/);
  assert.equal(mutations(f).length, 1);
  f.setRuns([f.run()]);
  assert.equal(f.status().run_id, 123);
  assert.equal(mutations(f).length, 1);
}));

test("remote head drift and insufficient authorization reject before dispatch", () => {
  withFixture((f) => { f.remoteSha("b".repeat(40)); assert.throws(f.dispatch, /differs/); assert.equal(mutations(f).length, 0); });
  withFixture((f) => { f.permission("read"); assert.throws(f.dispatch, /write permission/); assert.equal(mutations(f).length, 0); });
});

test("distinct checkpoint records get independent immutable identities", () => {
  const first = fixture(); const second = fixture();
  try { first.dispatch(); second.dispatch(); assert.notEqual(first.record().checkpoint_id, second.record().checkpoint_id); }
  finally { first.cleanup(); second.cleanup(); }
});

test("status reports native completed failures and queued deadline without mutations", () => withFixture((f) => {
  f.dispatch(); f.setRuns([f.run()]);
  const late = checkpoint("status", { state: f.state }, { ...f.dependencies, now: () => new Date("2026-10-19T14:00:00Z") });
  assert.equal(late.phase, "queued"); assert.equal(late.deadline_exceeded, true);
  f.setRuns([f.run({ status: "completed", conclusion: "failure" })]);
  assert.equal(f.status().conclusion, "failure");
  assert.equal(f.cancel().phase, "completed");
  assert.equal(mutations(f).length, 1);
}));

test("cancellation is bounded to the proven run and never repeats uncertain POST", () => withFixture((f) => {
  f.dispatch(); f.setRuns([f.run()]); f.failCancel();
  assert.throws(f.cancel, /Cancellation outcome uncertain/);
  assert.ok(f.record().cancel_requested_at);
  assert.throws(f.cancel, /already requested/);
  assert.equal(mutations(f).filter((call) => call.endpoint.endsWith("/cancel")).length, 1);
  assert.equal(f.status().phase, "queued");
}));

for (const [field, value] of Object.entries({ repository: { full_name: "other/repo" }, workflow_id: 99, path: ".github/workflows/other.yml", event: "push", head_branch: "main", head_sha: "b".repeat(40), actor: { login: "other" }, triggering_actor: { login: "other" }, run_attempt: 2 })) {
  test(`cancellation refuses mismatched ${field}`, () => withFixture((f) => {
    f.dispatch(); f.setRuns([f.run({ [field]: value })]);
    assert.throws(f.cancel, /ownership mismatch/);
    assert.equal(mutations(f).length, 1);
  }));
}

test("cancellation refuses arbitrary checkpoint title, duplicate runs and changed recorded run", () => {
  withFixture((f) => { f.dispatch(); f.setRuns([f.run({ display_title: "different" })]); assert.equal(f.cancel().phase, "dispatch-uncertain"); assert.equal(mutations(f).length, 1); });
  withFixture((f) => { f.dispatch(); f.setRuns([f.run(), f.run({ id: 124 })]); assert.throws(f.cancel, /Duplicate/); assert.equal(mutations(f).length, 1); });
  withFixture((f) => { f.dispatch(); f.setRuns([f.run()]); f.status(); f.setRuns([f.run({ id: 124 })]); assert.throws(f.cancel, /ownership mismatch/); assert.equal(mutations(f).length, 1); });
});

test("discovery has a fixed page bound and never guesses on truncated history", () => withFixture((f) => {
  f.dispatch(); f.fullPage(); assert.throws(f.cancel, /five-page bound/);
  assert.equal(f.calls.filter((call) => call.endpoint.includes("/runs?")).length, 5);
  assert.equal(mutations(f).length, 1);
}));

test("local ownership lock and current authenticated actor prevent competing operations", () => withFixture((f) => {
  f.dispatch(); f.setRuns([f.run()]); f.actor("other");
  assert.throws(f.cancel, /actor differs/);
  writeFileSync(`${f.state}.lock`, "owned");
  assert.throws(f.status, /locked/);
  assert.equal(mutations(f).length, 1);
}));

test("argument validation excludes arbitrary cancellation IDs, malformed refs and abbreviated hashes", () => {
  assert.deepEqual(parseArgs(["status", "--state", "local.json"]), { command: "status", options: { state: "local.json" } });
  for (const args of [["cancel", "--run-id", "123"], ["dispatch", "--state"], ["status", "--state", "a", "--state", "b"]]) assert.throws(() => parseArgs(args));
  for (const ref of ["-main", "refs/heads/main", "a..b", "a b", "a.lock", "a@{b", "a?b"]) assert.throws(() => validateRequest({ ...request, ref }));
  assert.throws(() => validateRequest({ ...request, sha: "aaaa" }));
});

test("workflow binds admission and preserves all required gate commands and budgets", () => {
  const workflow = readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /run-name:.*checkpoint:\{0\}:\{1\}/);
  assert.match(workflow, /test "\$EXPECTED_SHA" = "\$GITHUB_SHA"/);
  assert.match(workflow, /test "\$GITHUB_RUN_ATTEMPT" = 1/);
  assert.match(workflow, /verify:\s+needs: \[checkpoint-admission\]/);
  assert.match(workflow, /group: ci-.*inputs.checkpoint_id \|\| github.ref/);
  assert.doesNotMatch(workflow, /vars\.|secrets\./);
  for (const job of ["db", "recovery-storage-loader", "e2e", "dashboard-e2e"]) assert.match(workflow, new RegExp(`  ${job}:[\\s\\S]*?needs: \\[verify\\]`));
  for (const command of ["pnpm audit --audit-level=high", "pnpm run verify:service-role-containment", "pnpm typecheck", "pnpm lint", "--max-seconds 180", "pnpm build", "pnpm run verify:bundle-containment", "--max-seconds 420", "pnpm run test:e2e", "--config tests/e2e/dashboard/playwright.ci.config.ts"]) assert.ok(workflow.includes(command), command);
  assert.equal((workflow.match(/persist-credentials: false/g) ?? []).length, 5);
  // Preserve the pre-existing PR source-head policy; dispatch uses github.sha.
  assert.equal((workflow.match(/ref: \$\{\{ github.event.pull_request.head.sha \|\| github.sha \}\}/g) ?? []).length, 5);
});

test("native workflow admission executes exact source binding and preserves PR/push behavior", (t) => {
  const bash = process.platform === "win32"
    ? join(process.env.ProgramFiles ?? "C:/Program Files", "Git", "bin", "bash.exe")
    : "bash";
  if (process.platform === "win32" && !existsSync(bash)) {
    t.skip("Git Bash unavailable locally; Linux hosted CI executes this admission contract.");
    return;
  }
  const workflow = readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8");
  const block = workflow.match(/      - name: Bind dispatch to its immutable source revision[\s\S]*?        run: \|\r?\n([\s\S]*?)(?=^  verify:)/m);
  assert.ok(block, "extract the checked-in admission block, not a duplicate implementation");
  const script = block[1].split(/\r?\n/).map((line) => line.slice(10)).join("\n");
  const base = { GITHUB_EVENT_NAME: "workflow_dispatch", EXPECTED_SHA: sha, GITHUB_SHA: sha,
    CHECKPOINT_ID: "12345678-1234-4123-8123-123456789abc", GITHUB_RUN_ATTEMPT: "1", GITHUB_REF_TYPE: "branch" };
  const cases: [string, Record<string, string>, boolean][] = [
    ["valid dispatch", {}, true],
    ["head drift", { GITHUB_SHA: "b".repeat(40) }, false],
    ["malformed SHA", { EXPECTED_SHA: "aaaa" }, false],
    ["malformed UUID", { CHECKPOINT_ID: "not-a-checkpoint" }, false],
    ["rerun", { GITHUB_RUN_ATTEMPT: "2" }, false],
    ["tag", { GITHUB_REF_TYPE: "tag" }, false],
    ["PR unchanged", { GITHUB_EVENT_NAME: "pull_request", EXPECTED_SHA: "", CHECKPOINT_ID: "" }, true],
    ["push unchanged", { GITHUB_EVENT_NAME: "push", EXPECTED_SHA: "", CHECKPOINT_ID: "" }, true],
  ];
  for (const [label, change, passes] of cases) {
    const result = spawnSync(bash, ["--noprofile", "--norc", "-s"], {
      input: script, env: { ...process.env, ...base, ...change },
      encoding: "utf8", timeout: 5_000, windowsHide: true,
    });
    assert.ifError(result.error);
    assert.equal(result.status === 0, passes, label);
  }
});
