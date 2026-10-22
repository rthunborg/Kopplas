import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
import { checkpoint, checkpointTitle, parseArgs, validateRequest, assertCauseProofWorkflow, assertDefaultDispatchWorkflow } from "../../../../scripts/ci/checkpoint-dispatch.mjs";
import { createHash } from "node:crypto";

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
  let defaultWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
  const api = (method: string, endpoint: string, body?: unknown) => {
    calls.push({ method, endpoint, body });
    if (endpoint === "user") return { login: actor };
    if (endpoint === "repos/owner/repo") return { default_branch: "main" };
    if (endpoint.includes("/contents/.github/workflows/ci.yml?ref=")) {
      const text = endpoint.endsWith("ref=main") ? defaultWorkflow : readFileSync(".github/workflows/ci.yml", "utf8");
      const bytes = Buffer.from(text);
      return { encoding: "base64", content: bytes.toString("base64"), sha: createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") };
    }
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
      head_sha: sha, display_title: checkpointTitle(current.checkpoint_id, sha, current.verification_mode),
      actor: { login: "owner" }, triggering_actor: { login: "owner" }, run_attempt: 1,
      status: "queued", conclusion: null, ...changes };
  };
  return { state, calls, dependencies, dispatch, status, cancel, record, run,
    setRuns(value: Record<string, unknown>[]) { runs = value; },
    failDispatch() { failDispatch = true; }, failCancel() { failCancel = true; },
    permission(value: string) { permission = value; }, remoteSha(value: string) { remoteSha = value; },
    actor(value: string) { actor = value; }, fullPage() { fullPage = true; }, defaultWorkflow(value: string) { defaultWorkflow = value; },
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
  assert.deepEqual(mutations(f)[0].body, { ref: request.ref, inputs: { expected_sha: sha, checkpoint_id: state.checkpoint_id, release_validation: "false" } });
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

test("workflow binds admission and preserves consequential gates with broad UI diagnostics optional", () => {
  const workflow = projectCalendarFeedCiCommands(readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8"));
  const ordinaryJobs = ["checkpoint-admission", "verify", "db", "recovery-storage-loader", "e2e", "dashboard-e2e"];
  const separateDiagnostics = ["native-stream-probe", "fixed-chromium-paired-probe", "fixed-chromium-application-verification"];
  const jobsStart = workflow.indexOf("\njobs:\n");
  assert.ok(jobsStart > 0);
  const jobMatches = [...workflow.slice(jobsStart).matchAll(/^  ([a-z][a-z0-9-]*):\n/gm)];
  assert.deepEqual(jobMatches.map(match => match[1]), [...ordinaryJobs, ...separateDiagnostics]);
  const jobs = new Map(jobMatches.map((match, index) => [match[1], workflow.slice(jobsStart + match.index!, index + 1 < jobMatches.length ? jobsStart + jobMatches[index + 1].index! : undefined)]));
  assert.equal(jobs.size, ordinaryJobs.length + separateDiagnostics.length);
  const ordinaryWorkflow = workflow.slice(0, jobsStart) + ordinaryJobs.map(name => jobs.get(name)!).join("");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /run-name:.*checkpoint:\{0\}:\{1\}/);
  assert.match(workflow, /test "\$EXPECTED_SHA" = "\$GITHUB_SHA"/);
  assert.match(workflow, /test "\$GITHUB_RUN_ATTEMPT" = 1/);
  assert.match(workflow, /verify:\s+needs: \[checkpoint-admission\]/);
  assert.match(workflow, /group: ci-.*inputs.checkpoint_id \|\| github.ref/);
  assert.doesNotMatch(ordinaryWorkflow, /vars\.|secrets\./);
  for (const job of ["db", "recovery-storage-loader", "e2e", "dashboard-e2e"]) assert.match(workflow, new RegExp(`  ${job}:[\\s\\S]*?needs: \\[verify\\]`));
  for (const command of ["pnpm audit --audit-level=high", "pnpm run verify:service-role-containment", "pnpm typecheck", "pnpm lint", "pnpm build", "pnpm run verify:bundle-containment", "pnpm run test:smoke", "pnpm run test:e2e --reporter=list,json", "--config tests/e2e/dashboard/playwright.ci.config.ts"]) assert.ok(workflow.includes(command), command);
  assert.match(workflow, /release_validation:\s+description:[^\n]+\s+type: boolean\s+required: false\s+default: false/);
  assert.match(workflow, /dashboard-e2e:\s+if: \$\{\{ github.event_name == 'workflow_dispatch' && inputs.release_validation \}\}/);
  const recovery = workflow.split("  recovery-storage-loader:")[1].split("  e2e:")[0];
  assert.doesNotMatch(recovery, /inputs\.release_validation/);
  assert.doesNotMatch(workflow, /--max-seconds/);
  assert.equal((ordinaryWorkflow.match(/persist-credentials: false/g) ?? []).length, 5);
  // Preserve the pre-existing PR source-head policy; dispatch uses github.sha.
  assert.equal((ordinaryWorkflow.match(/ref: \$\{\{ github.event.pull_request.head.sha \|\| github.sha \}\}/g) ?? []).length, 5);
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
    ORIGINAL_INT009: "0", CAUSE_PROOF: "false", RELEASE_VALIDATION: "false", OTHER_DIAGNOSTICS: "false",
    CHECKPOINT_ID: "12345678-1234-4123-8123-123456789abc", GITHUB_RUN_ATTEMPT: "1", GITHUB_REF_TYPE: "branch" };
  const cases: [string, Record<string, string>, boolean][] = [
    ["valid dispatch", {}, true],
    ["valid original INT009", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug" }, true],
    ["original INT009 wrong repository", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "other/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug" }, false],
    ["original INT009 wrong actor", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "other", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug" }, false],
    ["original INT009 wrong triggering actor", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "other", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug" }, false],
    ["original INT009 wrong ref", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/main" }, false],
    ["original INT009 cause proof conflict", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug", CAUSE_PROOF: "true" }, false],
    ["original INT009 release conflict", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug", RELEASE_VALIDATION: "true" }, false],
    ["original INT009 other probe conflict", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug", OTHER_DIAGNOSTICS: "true" }, false],
    ["original INT009 PR refused", { ORIGINAL_INT009: "true", GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_ACTOR: "rthunborg", GITHUB_TRIGGERING_ACTOR: "rthunborg", GITHUB_REF: "refs/heads/codex/epic-15-int009-debug", GITHUB_EVENT_NAME: "pull_request" }, false],
    ["valid diagnostic", { CAUSE_PROOF: "true" }, true],
    ["diagnostic release conflict", { CAUSE_PROOF: "true", RELEASE_VALIDATION: "true" }, false],
    ["diagnostic other probe conflict", { CAUSE_PROOF: "true", OTHER_DIAGNOSTICS: "true" }, false],
    ["diagnostic PR refused", { CAUSE_PROOF: "true", GITHUB_EVENT_NAME: "pull_request" }, false],
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

test("release validation is explicit and persisted in the only dispatch", () => withFixture((f) => {
  const result = checkpoint("dispatch", { ...request, state: f.state, release_validation: "true" }, f.dependencies);
  assert.equal(result.release_validation, true);
  assert.equal(f.record().release_validation, true);
  assert.equal((mutations(f)[0].body as {inputs: {release_validation: string}}).inputs.release_validation, "true");
}));

test("validation selection cannot introduce arbitrary workflow inputs", () => withFixture((f) => {
  assert.throws(() => checkpoint("dispatch", { ...request, state: f.state, release_validation: "anything" }, f.dependencies), /true or false/);
  assert.equal(mutations(f).length, 0);
  assert.deepEqual(parseArgs(["dispatch", "--release-validation", "true"]).options, { release_validation: "true" });
  assert.throws(() => parseArgs(["dispatch", "--release-validation", "true", "--release-validation", "false"]));
}));


test("diagnostic selection is durable before the only POST and status remains zero acceptance", () => withFixture(f => {
  const api = f.dependencies.api;
  f.dependencies.api=(method,endpoint,body)=>{
    if(method==="POST") { assert.equal(f.record().verification_mode,"calendar-feed-cause-proof"); assert.equal(f.record().phase,"dispatch-uncertain"); }
    return api(method,endpoint,body);
  };
  const result=checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies);
  assert.equal(result.evidence_class,"diagnostic-only"); assert.equal(result.acceptance_credit,0);
  assert.deepEqual((mutations(f)[0].body as {inputs:unknown}).inputs,{expected_sha:sha,checkpoint_id:f.record().checkpoint_id,release_validation:"false",calendar_feed_cause_proof:"true"});
  f.setRuns([f.run({status:"completed",conclusion:"success"})]);
  assert.equal(f.status().evidence_class,"diagnostic-only"); assert.equal(f.status().acceptance_credit,0);
  assert.throws(f.dispatch,/already exists/); assert.equal(mutations(f).length,1);
}));
test("diagnostic availability or mode conflicts refuse before POST and cannot fall back",()=>{
  withFixture(f=>{f.defaultWorkflow("name: old workflow");assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/unavailable/);assert.equal(mutations(f).length,0);});
  for(const options of [{cause_proof:"other"},{cause_proof:"true",release_validation:"true"}])withFixture(f=>{assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,...options},f.dependencies));assert.equal(mutations(f).length,0);});
  assert.deepEqual(parseArgs(["dispatch","--cause-proof","true"]).options,{cause_proof:"true"});
  assert.throws(()=>parseArgs(["dispatch","--cause-proof","true","--cause-proof","false"]));
  assert.throws(()=>parseArgs(["status","--cause-proof","true"]));
  const availabilityWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
  const causeProofInputs = [...availabilityWorkflow.matchAll(/^      calendar_feed_cause_proof:\r?\n(?:        [^\r\n]*\r?\n)+/gm)];
  assert.equal(causeProofInputs.length, 1, "mutate exactly the named cause-proof input");
  const causeProofInput = causeProofInputs[0][0];
  assert.equal((causeProofInput.match(/default: false/g) ?? []).length, 1);
  assert.throws(() => assertCauseProofWorkflow(availabilityWorkflow.replace(causeProofInput, causeProofInput.replace("default: false", "default: true"))));
});
test("diagnostic uncertain dispatch and wrong-mode title never select or resend normal work",()=>withFixture(f=>{
  f.failDispatch(); assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/uncertain/);
  f.setRuns([f.run({display_title:checkpointTitle(f.record().checkpoint_id,sha)})]);
  assert.equal(f.status().phase,"dispatch-uncertain"); assert.equal(f.status().evidence_class,"diagnostic-only");assert.equal(mutations(f).length,1);
}));
test("legacy mode-less records remain normal and corrupt diagnostic selections fail closed",()=>withFixture(f=>{
  f.dispatch();const old=f.record();delete old.verification_mode;delete old.cause_proof;writeFileSync(f.state,JSON.stringify(old));f.setRuns([f.run()]);
  assert.equal(f.status().verification_mode,"normal");
  const corrupt=f.record();corrupt.cause_proof=true;corrupt.verification_mode="normal";writeFileSync(f.state,JSON.stringify(corrupt));
  assert.throws(f.status,/verification mode/);assert.equal(mutations(f).length,1);
}));


test("default dispatch presence is structural and accepts registered default without candidate-only inputs",()=>withFixture(f=>{
  const source="name: CI\non:\n  workflow_dispatch:\n  push:\n    branches: [main]\njobs:\n  verify: {}\n";
  assertDefaultDispatchWorkflow(source);f.defaultWorkflow(source);
  checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies);assert.equal(mutations(f).length,1);
  assert.deepEqual(f.calls.map(call=>call.method+" "+call.endpoint),["GET user","GET repos/owner/repo/collaborators/owner/permission","GET repos/owner/repo/branches/codex%2Fcheckpoint","GET repos/owner/repo/actions/workflows/ci.yml","GET repos/owner/repo/contents/.github/workflows/ci.yml?ref="+sha,"GET repos/owner/repo","GET repos/owner/repo/contents/.github/workflows/ci.yml?ref=main","POST repos/owner/repo/actions/workflows/42/dispatches"]);
  assert.equal(f.record().verification_mode,"calendar-feed-cause-proof");assert.equal(f.record().release_validation,false);assert.ok(f.record().workflow_availability.default_workflow_oid);assert.equal(f.record().phase,"dispatched");
}));
test("default recognizer refuses comments strings block scalars nested duplicate ambiguous and malformed event declarations",()=>{
  const bad=[
    "# on:\n#   workflow_dispatch:\nname: CI", "name: workflow_dispatch\non: push", "on: [workflow_dispatch]", "on: workflow_dispatch", '"on":\n  workflow_dispatch:',
    "description: |\n  on:\n    workflow_dispatch:", "on: |\n  workflow_dispatch:", "on: >\n  workflow_dispatch:", "on:\n  push:\n    workflow_dispatch:",
    "on:\n  workflow_dispatch: false", "on:\n  workflow_dispatch: {}", "on:\n  workflow_dispatch: &dispatch", "on:\n  workflow_dispatch: *dispatch",
    "on:\n  workflow_dispatch:\n  workflow_dispatch:", "on:\n  workflow_dispatch:\non:\n  push:", "on:\n   workflow_dispatch:", "on:\n\tworkflow_dispatch:",
    "on:\n  workflow_dispatch:\n    inputs: |\n      dummy: true", "on:\n  workflow_dispatch:\n    inputs:\n      x:\n        default: true\n        default: false",
    "on:\n  workflow_dispatch:\n    inputs: [bad", "on:\n  workflow_dispatch:\n    inputs: 'unclosed", "on:\n  workflow_dispatch:\n    inputs:\n      x: *alias",
    "on:\n  workflow_dispatch:\n  push:\n    branches: [*alias]", "on:\n  workflow_dispatch:\n  push:\n    branches:\n      - *alias",
    "on:\n  workflow_dispatch:\n    inputs:\n       bad: true", "on:\n  workflow_dispatch:\n    inputs: false\n      extra: true"
  ];
  for(const source of bad){assert.throws(()=>assertDefaultDispatchWorkflow(source),/unavailable/);withFixture(f=>{f.defaultWorkflow(source);assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies));assert.equal(mutations(f).length,0);assert.equal(existsSync(f.state),false);});}
  assertDefaultDispatchWorkflow("# leading comment\nname: CI\non: # manual dispatch\n  workflow_dispatch: # empty declaration\n  pull_request:\n    branches:\n      - main\n      - codex/story\njobs:\n  x: {}\n");
});
test("candidate diagnostic capability cannot be replaced by default presence and object/ref checks still precede POST",()=>{
  const current=readFileSync(".github/workflows/ci.yml","utf8");
  assert.equal((current.match(/test "\$RELEASE_VALIDATION" = false/g) ?? []).length, 2, "both fixed release guards are present before the global-absence inverse");
  for(const source of [current.replace("calendar_feed_cause_proof:","other_input:"),current.replace("checkpoint:cause-proof:{0}:{1}","checkpoint:other:{0}:{1}"),current.replaceAll('test "$RELEASE_VALIDATION" = false','test "$RELEASE_VALIDATION" = true'),current.replace("node scripts/ci/with-calendar-feed-runtime.mjs cause-proof","pnpm run test:int")]){
    assert.throws(()=>assertCauseProofWorkflow(source));withFixture(f=>{const old=f.dependencies.api;f.dependencies.api=(method,endpoint,body)=>{const reply=old(method,endpoint,body);if(endpoint.includes("/contents/")&&!endpoint.endsWith("ref=main")){const bytes=Buffer.from(source);return{encoding:"base64",content:bytes.toString("base64"),sha:createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex")};}return reply;};assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies));assert.equal(mutations(f).length,0);});
  }
  for(const change of ["blob","disabled","path"]){withFixture(f=>{const old=f.dependencies.api;f.dependencies.api=(method,endpoint,body)=>{const reply=old(method,endpoint,body);if(change==="blob"&&endpoint.endsWith("ref=main"))return{...(reply as object),sha:"b".repeat(40)};if(endpoint.endsWith("/workflows/ci.yml"))return{...(reply as object),...(change==="disabled"?{state:"disabled_manually"}:change==="path"?{path:"other.yml"}:{})};return reply;};assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies));assert.equal(mutations(f).length,0);});}
});


test("F3 actual default plain-scalar syntax refusal precedes durable intent and the sole POST",()=>{
  const actualCandidate=readFileSync(".github/workflows/ci.yml","utf8");
  assertDefaultDispatchWorkflow(actualCandidate);assertCauseProofWorkflow(actualCandidate);
  const document=(value:string)=>"name: CI\non:\n  workflow_dispatch:\n    inputs: "+value+"\njobs:\n  verify: {}\n";
  for(const value of ["x: y","x:","x:  y","? mapping","- sequence",": mapping","@reserved","%TAG","\u0060reserved",",flow"]){
    const source=document(value);assert.throws(()=>assertDefaultDispatchWorkflow(source),/unavailable/);
    withFixture(f=>{f.defaultWorkflow(source);assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/unavailable/);assert.equal(existsSync(f.state),false);assert.equal(mutations(f).length,0);assert.equal(f.calls.at(-1)?.endpoint,"repos/owner/repo/contents/.github/workflows/ci.yml?ref=main");});
  }
  // Colons not followed by separation are valid plain content; comment syntax
  // never supplies an event or makes invalid scalar content valid.
  for(const value of ["https://example.invalid","description:value","# comment: not scalar data"]){assertDefaultDispatchWorkflow(document(value));}
  assert.throws(()=>assertDefaultDispatchWorkflow(document("x: y # comment")),/unavailable/);
  assertDefaultDispatchWorkflow("name: CI\non: # event: mapping\n  workflow_dispatch: # empty: declaration\n    inputs: # empty: mapping\njobs:\n  verify: {}\n");
});


const preselectedId="2c7241ac-d51e-4a6f-8f85-533739b3e472";
test("preselected and legacy generated checkpoint identity are durable at POST and propagate through payload title and ownership",()=>{
  for(const supplied of [true,false])for(const mode of ["normal","diagnostic","release"]){withFixture(f=>{
    const options={...request,state:f.state,...(supplied?{checkpoint_id:preselectedId}:{}),...(mode==="diagnostic"?{cause_proof:"true"}:mode==="release"?{release_validation:"true"}:{})};
    const api=f.dependencies.api;let atPost:string|undefined;
    f.dependencies.api=(method,endpoint,body)=>{if(method==="POST"){
      const durable=f.record();atPost=durable.checkpoint_id;assert.equal(durable.phase,"dispatch-uncertain");assert.match(atPost!,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
      if(supplied)assert.equal(atPost,preselectedId);else assert.notEqual(atPost,preselectedId);
      assert.deepEqual(body,{ref:request.ref,inputs:{expected_sha:sha,checkpoint_id:atPost,release_validation:String(mode==="release"),...(mode==="diagnostic"?{calendar_feed_cause_proof:"true"}:{})}});
    }return api(method,endpoint,body);};
    const result=checkpoint("dispatch",options,f.dependencies);assert.equal(result.checkpoint_id,atPost);assert.equal(f.record().checkpoint_id,atPost);
    const run=f.run();assert.equal(run.display_title,checkpointTitle(atPost!,sha,f.record().verification_mode));f.setRuns([run]);assert.equal(f.status().phase,"queued");assert.equal(f.record().checkpoint_id,atPost);
    const before=f.calls.length;assert.throws(()=>checkpoint("dispatch",options,f.dependencies),/already exists/);assert.equal(f.calls.length,before);assert.equal(mutations(f).length,1);
  });}
});
test("invalid programmatic checkpoint IDs and status or cancel selection refuse before every API",()=>{
  const bad:unknown[]=[undefined,null,17,true,{},[],"",preselectedId.toUpperCase(),preselectedId.replace("-4a6f-","-1a6f-"),preselectedId.replace("-8f85-","-7f85-"),preselectedId+" "," "+preselectedId,"not-a-uuid"];
  for(const command of ["dispatch","status","cancel"]){for(const value of [...bad,...(command==="dispatch"?[]:[preselectedId])])withFixture(f=>{
    assert.throws(()=>checkpoint(command,{...request,state:f.state,checkpoint_id:value},f.dependencies),/checkpoint-id/);assert.equal(f.calls.length,0);assert.equal(existsSync(f.state),false);assert.equal(existsSync(f.state+".lock"),false);
  });}
});
test("checkpoint-id CLI accepts only one dispatch UUIDv4 and rejects missing duplicate malformed or non-dispatch options",()=>{
  assert.deepEqual(parseArgs(["dispatch","--state","private.json","--checkpoint-id",preselectedId]),{command:"dispatch",options:{state:"private.json",checkpoint_id:preselectedId}});
  for(const args of [["dispatch","--checkpoint-id"],["dispatch","--checkpoint-id",""],["dispatch","--checkpoint-id","--state","x"],["dispatch","--checkpoint-id",preselectedId,"--checkpoint-id",preselectedId],["status","--state","x","--checkpoint-id",preselectedId],["cancel","--state","x","--checkpoint-id",preselectedId],...[preselectedId.toUpperCase(),preselectedId.replace("-4a6f-","-5a6f-"),preselectedId.replace("-8f85-","-cf85-"),"bad"].map(id=>["dispatch","--checkpoint-id",id])])assert.throws(()=>parseArgs(args));
});
test("preselected nonce is correlation only and uncertain dispatch retains its original identity with zero redispatch",()=>withFixture(f=>{
  f.failDispatch();const options={...request,state:f.state,cause_proof:"true",checkpoint_id:preselectedId};assert.throws(()=>checkpoint("dispatch",options,f.dependencies),/uncertain/);
  const durable=f.record();assert.equal(durable.checkpoint_id,preselectedId);assert.equal(durable.phase,"dispatch-uncertain");assert.equal(mutations(f).length,1);
  assert.equal(f.status().phase,"dispatch-uncertain");assert.equal(f.record().checkpoint_id,preselectedId);const before=f.calls.length;
  assert.throws(()=>checkpoint("dispatch",options,f.dependencies),/already exists/);assert.equal(f.calls.length,before);assert.equal(mutations(f).length,1);
  for(const command of ["status","cancel"]){const count=f.calls.length;assert.throws(()=>checkpoint(command,{state:f.state,checkpoint_id:preselectedId},f.dependencies),/dispatch-only/);assert.equal(f.calls.length,count);}
  f.setRuns([f.run({display_title:checkpointTitle("6d5651ea-6abf-432e-a1a2-a4c76c641f69",sha,"calendar-feed-cause-proof")})]);assert.equal(f.status().phase,"dispatch-uncertain");assert.equal(mutations(f).length,1);
}));
