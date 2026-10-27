import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { EVIDENCE_MARKER, evidenceDigest, evaluateFrontend, hash, inspectPng } from "../../../scripts/quality/frontend-gate.mjs";
import { renderPrScreenshots, publicationPath, presentationFeedback, feedbackScopeDigest } from "../../../scripts/quality/frontend-presentation.mjs";
import { assessPr, reportPrAssessment, verifyTrustedSources } from "../../../scripts/quality/frontend-controller.mjs";
import { guardedCompletion } from "../../../scripts/quality/completion-gate.mjs";
import { selectFeedback } from "../../../scripts/pr-feedback/policy.mjs";
import { monitor } from "../../../scripts/pr-feedback/runtime.mjs";

const head = "a".repeat(40);
const file = "src/components/dashboard/WidgetCard.tsx";
const owner = { id: 53317458, login: "owner", type: "User" };
function png(width: number, height: number, color: number) {
  function chunk(name: string, data: Buffer) {
    const type = Buffer.from(name); let crc = 0xffffffff;
    for (const b of Buffer.concat([type, data])) { crc ^= b; for (let n = 0; n < 8; n++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
    const sum = Buffer.alloc(4); sum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([size, type, data, sum]);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const pixels = Buffer.alloc((width * 3 + 1) * height, color);
  for (let row = 0; row < height; row++) pixels[row * (width * 3 + 1)] = 0;
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", header), chunk("IDAT", deflateSync(pixels)), chunk("IEND", Buffer.alloc(0))]);
}
function fixture() {
  const blobs = new Map<string, Buffer>();
  const image = (width: number, height: number, color: number) => {
    const bytes = png(width, height, color);
    const oid = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
    blobs.set(oid, bytes); return { gitBlob: oid, sha256: hash(bytes) };
  };
  const captures = [{ width: 360, height: 640 }, { width: 1280, height: 720 }].map((viewport, index) => ({ id: `finished-${index}`, surface: "widget", state: "finished", viewport, fullViewport: true, actual: image(viewport.width, viewport.height, 200), reference: image(viewport.width, viewport.height, 220) }));
  const policy = { schemaVersion: 1, source: { id: "DT-2026-10-23", version: "2026-10-26", hashes: { "DESIGN.md": "b".repeat(64) } }, references: {} as Record<string, Record<string, Record<string, string>>>, trustedVisionReviewers: [] as {userId: number; appId: number; provider: string; model: string}[], sharedConsumers: ["auth", "records", "scheduling"] };
  const evidence = { schemaVersion: 1, candidateSha: head, kind: "frontend", changedPaths: [file], source: policy.source, runtime: { server: "next start", buildSha: head, synthetic: true, fixture: "Synthetic dashboard entity fixtures", command: "pnpm build followed by pnpm start", result: "Browser captured required states after server-confirmed setup" }, surfaces: [{ id: "widget", component: "WidgetCard", route: "/dashboard", files: [file], referenceId: "widget-v1", referenceSetting: true, notApplicable: { loading: "No loading branch in this standalone presentation", error: "No error branch in this standalone presentation", empty: "No empty branch in this standalone presentation" } }], captures, presentation: { schemaVersion: 1, dataPolicy: "synthetic-no-pii", evidenceCommit: "d".repeat(40), evidenceRef: "codex/visual-evidence/pr-1", feedback: [] as {kind: string; id: number; rootId: number; sourceFingerprint: string; disposition: string; reason: string}[], exceptions: [] }, deviations: [] as {id: string; category: string; description: string}[] };
  const comment = { id: 1, user: owner, created_at: "2026-10-26T10:00:00Z", body: "" };
  const input = { headSha: head, repo: "o/r", prNumber: 1, prBody: "", loadPublication: async ({path}: {path: string}) => ({retained: true, gitBlob: captures.find(c => publicationPath(head, c) === path)!.actual.gitBlob}), files: [file], labels: ["agent-fix"], comments: [comment], permissions: { owner: "admin" }, policy, authorId: 123, loadBlob: async (oid: string) => { const bytes = blobs.get(oid); if (!bytes) throw new Error("Blob unavailable"); return bytes; } };
  function submit(manual = true) {
    input.prBody = renderPrScreenshots(evidence, head, evidenceDigest(evidence));
    input.comments = [{ ...comment, user: { id: 123, login: "author", type: "User" }, body: `${EVIDENCE_MARKER}\n\`\`\`json\n${JSON.stringify(evidence)}\n\`\`\`` }];
    if (manual) input.comments.push({ ...comment, id: 2, body: `/visual-accept ${head} ${evidenceDigest(evidence)}` });
    return input;
  }
  function establish() {
    evidence.surfaces[0].referenceSetting = false;
    policy.references["widget-v1"] = { finished: Object.fromEntries(captures.map((c) => [`${c.viewport.width}x${c.viewport.height}`, c.reference.sha256])) };
  }
  function independent(status = "passed", userId = 456, appId = 99, hashes?: string[]) {
    policy.trustedVisionReviewers = [{ userId: 456, appId: 99, provider: "fixture-provider", model: "fixture-vision-model" }];
    const receipt = { status, verdict: "PASS", provider: "fixture-provider", model: "fixture-vision-model", capability: { status: "passed", tool: "actual-image-input", observation: "Reference and actual image bytes were opened and compared" }, inputHashes: hashes ?? [...new Set(captures.flatMap((c) => [c.actual.sha256, c.reference.sha256]))], findings: [] };
    input.comments.push({ ...comment, id: 3, user: { id: userId, login: "vision", type: "Bot" }, body: `/visual-review ${head} ${evidenceDigest(evidence)}\n<!-- kopplas-vision-review-v1 -->\n\`\`\`json\n${JSON.stringify(receipt)}\n\`\`\``, ...{ performed_via_github_app: { id: appId } } });
  }
  return { input, evidence, policy, blobs, submit, establish, independent };
}

test("docs/backend tooling gets explicit N/A from complete path inventory", async () => {
  const f = fixture(); f.input.files = ["docs/process/example.md", "scripts/tool.mjs"];
  const result = await evaluateFrontend(f.input); assert.equal(result.status, "not-applicable"); assert.match(result.reason!, /No frontend/);
});
test("missing and stale visual packages never pass", async () => {
  const f = fixture(); await assert.rejects(evaluateFrontend(f.input), /Missing current-head/);
  f.submit(); f.input.headSha = "b".repeat(40); await assert.rejects(evaluateFrontend(f.input), /Missing current-head/);
});
test("valid owner manual acceptance with initial references", async () => {
  const f = fixture(); assert.equal((await evaluateFrontend(f.submit())).mode, "owner-manual");
});
test("self-authored evidence and revoked owner permission cannot accept", async () => {
  const f = fixture(); await assert.rejects(evaluateFrontend(f.submit(false)), /owner acceptance/);
  f.submit(); f.input.permissions.owner = "read"; await assert.rejects(evaluateFrontend(f.input), /owner acceptance/);
});
test("genuine configured independent image review accepts established references", async () => {
  const f = fixture(); f.establish(); f.submit(false); f.independent(); assert.equal((await evaluateFrontend(f.input)).mode, "independent-vision");
});
test("initial reference setting still needs owner after independent PASS", async () => {
  const f = fixture(); f.submit(false); f.independent(); await assert.rejects(evaluateFrontend(f.input), /owner acceptance/);
});
for (const outcome of ["error", "unavailable", "skipped", "failed"]) test(`provider ${outcome} never becomes PASS`, async () => {
  const f = fixture(); f.establish(); f.submit(false); f.independent(outcome); await assert.rejects(evaluateFrontend(f.input), /unavailable\/failed\/skipped/);
});
test("manual fallback after provider error is explicitly manual", async () => {
  const f = fixture(); f.establish(); f.submit(); f.independent("error"); assert.equal((await evaluateFrontend(f.input)).mode, "owner-manual");
});
test("vision receipt requires actual input hashes and trusted App identity", async () => {
  const f = fixture(); f.establish(); f.submit(false); f.independent("passed", 456, 99, []); await assert.rejects(evaluateFrontend(f.input), /Independent vision/);
  f.submit(false); f.independent("passed", 456, 100); await assert.rejects(evaluateFrontend(f.input), /Independent vision/);
  f.input.authorId = 456; f.submit(false); f.independent(); await assert.rejects(evaluateFrontend(f.input), /Independent vision/);
});
test("new candidate and any package fix invalidate earlier acceptance", async () => {
  const f = fixture(); f.submit(); f.evidence.runtime.result += " changed after review";
  f.input.comments[0].body = `${EVIDENCE_MARKER}\n\`\`\`json\n${JSON.stringify(f.evidence)}\n\`\`\``;
  await assert.rejects(evaluateFrontend(f.input), /owner acceptance/);
  f.input.headSha = "c".repeat(40); await assert.rejects(evaluateFrontend(f.input), /Missing current-head/);
});
test("source/reference self-rebaseline, missing bytes and bad image content block", async () => {
  const f = fixture(); f.establish(); f.submit(); f.evidence.captures[0].reference.sha256 = "e".repeat(64); f.submit();
  await assert.rejects(evaluateFrontend(f.input), /Image input hash mismatch/);
  const g = fixture(); g.submit(); g.blobs.clear(); await assert.rejects(evaluateFrontend(g.input), /Blob unavailable/);
  assert.throws(() => inspectPng(Buffer.alloc(100)), /invalid PNG/);
});
test("finished state, mobile/desktop and source/component coverage are mandatory", async () => {
  const f = fixture(); f.evidence.captures.pop(); await assert.rejects(evaluateFrontend(f.submit()), /actual\/reference captures/);
  const g = fixture(); delete (g.evidence.surfaces[0].notApplicable as Partial<{loading: string}>).loading; await assert.rejects(evaluateFrontend(g.submit()), /loading evidence/);
  const h = fixture(); h.input.files.push("src/app/globals.css"); h.evidence.changedPaths.push("src/app/globals.css"); await assert.rejects(evaluateFrontend(h.submit()), /omitted/);
});
test("named aesthetic waivers require current trusted human and protect critical categories", async () => {
  const f = fixture(); f.evidence.deviations.push({ id: "D1", category: "visual", description: "Temporary neutral illustration alignment" }); f.submit();
  const waiver = { id: 5, user: { id: 999, login: "stranger", type: "User" }, created_at: "2026-10-26T11:00:00Z", body: `/visual-waive ${head} ${evidenceDigest(f.evidence)} D1\nAccept temporary neutral illustration alignment` };
  f.input.comments.push(waiver); await assert.rejects(evaluateFrontend(f.input), /named owner waiver/);
  waiver.user = owner; assert.equal((await evaluateFrontend(f.input)).status, "accepted");
  for (const category of ["security", "money", "scope", "accessibility", "integrity"]) { f.evidence.deviations[0].category = category; f.submit(); await assert.rejects(evaluateFrontend(f.input), /cannot be waived/); }
});
test("owner revocation invalidates existing acceptance", async () => {
  const f = fixture(); f.submit(); f.input.comments.push({ id: 6, user: owner, created_at: "2026-10-26T12:00:00Z", body: `/visual-revoke ${head} ${evidenceDigest(f.evidence)}` });
  await assert.rejects(evaluateFrontend(f.input), /revoked/);
});
test("trusted API verifies complete file list and rechecks exact head", async () => {
  let reads = 0;
  const api = async (path: string) => {
    if (path === "/repos/o/r/pulls/1") return { state: "open", head: { sha: ++reads === 1 ? head : "b".repeat(40) }, changed_files: 1, user: { id: 123 } };
    if (path.includes("/files?")) return [{ filename: "docs/example.md" }];
    if (path.includes("/comments?") || path.includes("/reviews?")) return [];
    throw new Error(`Unexpected path ${path}`);
  };
  await assert.rejects(assessPr({ api, repo: "o/r", prNumber: 1, expectedHead: head }), /changed during/);
});
test("fixer readiness stays blocked after all five CI jobs until visual acceptance", async () => {
  let reviewers = 0;
  const state = { prNumber: 1, published: { headSha: head, notified: false }, reviewerLogins: ["reviewer"] };
  const pr = { number: 1, state: "open", head: { sha: head }, user: { login: "author" }, changed_files: 1 };
  const api = async (path: string) => {
    if (path.includes("/runs?")) return { workflow_runs: [{ id: 10, event: "pull_request", head_sha: head, path: ".github/workflows/ci.yml", status: "completed", conclusion: "success", pull_requests: [{ number: 1, head: { sha: head } }] }] };
    if (path.includes("/jobs?")) return { jobs: ["checkpoint-admission", "verify", "db", "recovery-storage-loader", "e2e"].map((name) => ({ name, status: "completed", conclusion: "success" })) };
    if (path === "/repos/o/r/pulls/1") return pr;
    if (path.includes("/files?")) return [{ filename: file }];
    if (path.includes("/comments?") || path.includes("/reviews?")) return [];
    if (path.includes("requested_reviewers")) { reviewers++; return {}; }
    if (path.endsWith("/comments") || path.includes("/issues/comments/")) return { id: 99 };
    throw new Error(`Unexpected path ${path}`);
  };
  const result = await monitor(api, { repo: "o/r" }, pr, state, true);
  assert.equal(result.phase, "visual-pending"); assert.equal(result.published.notified, false); assert.equal(reviewers, 0);
  const moved = await monitor(api, { repo: "o/r" }, { ...pr, head: { sha: "b".repeat(40) } }, result, true);
  assert.equal(moved.phase, "superseded"); assert.equal(moved.visualAcceptance?.status, "invalidated");
});
test("hosted checker never executes or checks out candidate code", () => {
  const workflow = readFileSync(new URL("../../../.github/workflows/frontend-quality-gate.yml", import.meta.url), "utf8");
  assert.match(workflow, /pull_request_target:/); assert.match(workflow, /ref: \$\{\{ github.sha \}\}/); assert.match(workflow, /checks: write/);
  assert.match(workflow, /statuses: write/);
  assert.doesNotMatch(workflow, /npm install|pnpm install|secrets\.|pull_request.head.sha/);
});

function reporterFixture() {
  const calls: { path: string; method: string; body?: Record<string, unknown> }[] = [];
  const f = { calls, failAt: "", finalFailureUnavailable: false, reads: 0, assessments: 0, storedStatus: "old-success", checks: [{ id: 90, conclusion: "failure" }],
    pr: { state: "open", base: { ref: "main" }, head: { sha: head }, body: "unchanged", labels: [{ name: "agent-fix" }] } };
  const api: Parameters<typeof reportPrAssessment>[0]["api"] = async (path, options) => {
    const body = options?.body as Record<string, unknown> | undefined;
    calls.push({ path, method: options?.method ?? "GET", body });
    if (!options?.method) { f.reads++; return structuredClone(f.pr); }
    if (path.includes("/statuses/")) {
      if (body!.state === "pending" && f.failAt === "pending-status") throw new Error("pending transport unknown");
      if (body!.state === "success" && f.failAt === "success-status") throw new Error("terminal status transport unknown");
      if (body!.state === "failure" && f.finalFailureUnavailable) throw new Error("failure report unavailable");
      f.storedStatus = String(body!.state);
      return { id: 12, context: f.failAt === "status-response" && body!.state === "pending" ? "wrong context" : body!.context, state: body!.state };
    }
    if (options.method === "POST") {
      if (f.failAt === "check-create") throw new Error("CheckRun creation unknown");
      f.checks.push({ id: 91, conclusion: "in_progress" });
      return { id: 91, name: "Frontend visual acceptance", head_sha: head, app: { id: f.failAt === "check-source" ? 9 : 15368 } };
    }
    if (body!.conclusion === "success" && f.failAt === "check-complete") throw new Error("CheckRun completion unknown");
    if (body!.conclusion === "failure" && f.finalFailureUnavailable) throw new Error("Check failure unavailable");
    f.checks.at(-1)!.conclusion = String(body!.conclusion);
    if (body!.conclusion === "success" && f.failAt === "head-after-check") f.pr.head.sha = "b".repeat(40);
    return { id: 91, name: "Frontend visual acceptance", head_sha: head, app: { id: 15368 }, status: "completed", conclusion: f.failAt === "completion-response" && body!.conclusion === "success" ? "failure" : body!.conclusion };
  };
  const assess = async () => {
    calls.push({ path: "ASSESS", method: "READ" }); f.assessments++;
    if (f.failAt === "assessment") throw new Error("Missing current-head screenshot evidence");
    if (f.failAt === "head-before-check") f.pr.head.sha = "b".repeat(40);
    if (f.failAt === "body-before-check") f.pr.body = "changed evidence";
    if (f.failAt === "labels-before-check") f.pr.labels = [];
    return { status: f.failAt === "unknown-result" ? "unknown" : "not-applicable", headSha: head };
  };
  return { f, run: (override = assess) => reportPrAssessment({ api, repo: "o/r", prNumber: 1, runId: "123", assess: override }) };
}

test("one assessment drives ordered same-head CheckRun and commit status, retaining legacy history", async () => {
  const { f, run } = reporterFixture(); await run();
  assert.equal(f.assessments, 1); assert.equal(f.storedStatus, "success");
  assert.deepEqual(f.checks, [{ id: 90, conclusion: "failure" }, { id: 91, conclusion: "success" }]);
  const transitions = f.calls.filter(c => c.method !== "GET").map(c => c.path === "ASSESS" ? "assessment" : c.path.includes("/statuses/") ? `status:${c.body!.state}` : `check:${c.body!.conclusion ?? c.body!.status}`);
  assert.deepEqual(transitions, ["status:pending", "check:in_progress", "assessment", "check:success", "status:success"]);
  for (const c of f.calls.filter(c => c.path.includes("/statuses/"))) {
    assert.equal(c.path, `/repos/o/r/statuses/${head}`); assert.equal(c.body!.context, "Frontend visual acceptance");
    assert.equal(c.body!.target_url, "https://github.com/o/r/actions/runs/123");
    assert.equal(Object.hasOwn(c.body!, "app_id"), false);
  }
});

for (const phase of ["pending-status", "status-response", "check-create", "check-source", "assessment", "unknown-result", "head-before-check", "body-before-check", "labels-before-check", "check-complete", "completion-response", "head-after-check"]) test(`dual reporting ${phase} failure never sends terminal success status`, async () => {
  const { f, run } = reporterFixture(); f.failAt = phase;
  await assert.rejects(run());
  assert.equal(f.calls.some(c => c.path.includes("/statuses/") && c.body?.state === "success"), false);
  assert.equal(f.storedStatus, "failure");
  if (phase === "check-source") assert.equal(f.calls.some(c => c.method === "PATCH"), false, "never patch an unexpected source's check");
});

test("unknown terminal status outcome fails and corrects both reporters without retrying success", async () => {
  const { f, run } = reporterFixture(); f.failAt = "success-status";
  await assert.rejects(run(), /transport unknown/);
  assert.equal(f.calls.filter(c => c.path.includes("/statuses/") && c.body?.state === "success").length, 1);
  assert.equal(f.storedStatus, "failure"); assert.equal(f.checks.at(-1)!.conclusion, "failure");
});

test("unavailable failure finalization leaves known pending status and rejects", async () => {
  const { f, run } = reporterFixture(); f.failAt = "check-complete"; f.finalFailureUnavailable = true;
  await assert.rejects(run(), /CheckRun completion unknown/);
  assert.equal(f.storedStatus, "pending");
  assert.equal(f.calls.some(c => c.path.includes("/statuses/") && c.body?.state === "success"), false);
});

for (const outcome of ["owner-manual", "independent-vision"]) test(`actual ${outcome} assessment drives both reporters`, async () => {
  const real = fixture(); real.establish(); real.submit(outcome === "owner-manual");
  if (outcome === "independent-vision") real.independent();
  const { f, run } = reporterFixture();
  const result = await run(async () => evaluateFrontend(real.input));
  assert.equal(result.status, "accepted"); assert.equal(result.mode, outcome);
  assert.equal(f.storedStatus, "success"); assert.equal(f.assessments, 0);
});

for (const reason of ["missing", "stale", "revoked", "provider-unavailable", "provider-failed"]) test(`genuine ${reason} visual evidence blocks both reporters`, async () => {
  const real = fixture(); real.establish();
  if (reason !== "missing") real.submit(false);
  if (reason === "stale") real.input.headSha = "b".repeat(40);
  if (reason === "revoked") { real.submit(); real.input.comments.push({ id: 8, user: owner, created_at: "2026-10-26T12:00:00Z", body: `/visual-revoke ${head} ${evidenceDigest(real.evidence)}` }); }
  if (reason.startsWith("provider")) real.independent(reason === "provider-failed" ? "failed" : "unavailable");
  const { f, run } = reporterFixture(); await assert.rejects(run(async () => evaluateFrontend(real.input)));
  assert.equal(f.storedStatus, "failure"); assert.equal(f.checks.at(-1)!.conclusion, "failure");
});

const hostedCases = [
  ...["pull_request_target", "issue_comment", "schedule", "workflow_dispatch"].flatMap(event => [true, false].map(valid => ({ event, valid, fault: "" }))),
  ...["pending-status", "check-create", "check-complete", "status-success"].map(fault => ({ event: "workflow_dispatch", valid: true, fault })),
];
for (const { event, valid, fault } of hostedCases) test(`${event} local hosted-entry CLI with mocked API ${fault || (valid ? "N/A succeeds" : "missing evidence fails")} without candidate execution`, () => {
  const root = mkdtempSync(join(tmpdir(), "kopplas-dual-report-"));
  try {
    const eventPath = join(root, "event.json"), callsPath = join(root, "calls.json"), hook = join(root, "mock.mjs");
    const pr = { number: 1, state: "open", base: { ref: "main" }, head: { sha: head }, user: { id: 999 }, labels: [], body: "", commits: 1, changed_files: 1 };
    writeFileSync(eventPath, JSON.stringify(event === "pull_request_target" ? { pull_request: { number: 1, base: { ref: "main" } } } : event === "issue_comment" ? { issue: { number: 1, pull_request: {} } } : event === "workflow_dispatch" ? { inputs: { pr_number: "1" } } : {}));
    writeFileSync(hook, `import fs from 'node:fs';const calls=[];const pr=${JSON.stringify(pr)},fault=${JSON.stringify(fault)};globalThis.fetch=async(input,opt={})=>{const u=new URL(String(input));if(u.origin!=='https://api.github.com')throw Error('No external requests');const p=u.pathname,b=opt.body?JSON.parse(opt.body):undefined;calls.push({path:p,method:opt.method,body:b});fs.writeFileSync(${JSON.stringify(callsPath)},JSON.stringify(calls));if(fault==='pending-status'&&b?.state==='pending'||fault==='status-success'&&b?.state==='success'||fault==='check-create'&&opt.method==='POST'&&p.endsWith('/check-runs')||fault==='check-complete'&&b?.conclusion==='success')throw Error('Mock reporter transport unknown');let v;if(p==='/repos/o/r/pulls')v=[pr];else if(p==='/repos/o/r/pulls/1')v=pr;else if(p.endsWith('/files'))v=[{filename:${JSON.stringify(valid ? "docs/example.md" : file)}}];else if(p.endsWith('/commits'))v=[{author:{id:999},committer:{id:999}}];else if(p.endsWith('/comments')||p.endsWith('/reviews'))v=[];else if(p.includes('/statuses/'))v={id:12,...b};else if(p.endsWith('/check-runs'))v={id:91,name:b.name,head_sha:b.head_sha,app:{id:15368}};else if(p.endsWith('/check-runs/91'))v={id:91,head_sha:pr.head.sha,app:{id:15368},...b};else throw Error('Unexpected mock route '+p);return new Response(JSON.stringify(v),{status:200});};`);
    const result = spawnSync(process.execPath, ["--import", pathToFileURL(hook).href, "scripts/quality/frontend-controller.mjs", "hosted"], { cwd: fileURLToPath(new URL("../../..", import.meta.url)), encoding: "utf8", timeout: 10000, env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, NODE_ENV: "test", GITHUB_TOKEN: "fixture-only", GITHUB_REPOSITORY: "o/r", GITHUB_SHA: "c".repeat(40), GITHUB_REF: "refs/heads/main", GITHUB_RUN_ID: "123", GITHUB_EVENT_NAME: event, GITHUB_EVENT_PATH: eventPath } });
    assert.equal(result.status, valid && !fault ? 0 : 1, result.stderr);
    const calls = JSON.parse(readFileSync(callsPath, "utf8")) as {path: string; body?: {state?: string; context?: string}}[];
    const statuses = calls.filter(c => c.path.includes("/statuses/"));
    assert.deepEqual(statuses.map(c => c.body!.state), fault === "status-success" ? ["pending", "success", "failure"] : ["pending", valid && !fault ? "success" : "failure"]);
    assert.ok(statuses.every(c => c.path.endsWith(head) && c.body!.context === "Frontend visual acceptance"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("visual protocol comments cannot spend remediation attempts", () => {
  const commands = ["accept", "waive", "revoke", "review", "opt-out", "not-applicable"].map((name, id) => ({ id, user: owner, body: `/visual-${name} ${head} ${"b".repeat(64)}`, updated_at: new Date().toISOString() }));
  const evidence = { ...commands[0], id: 10, body: `${EVIDENCE_MARKER}\n{}` };
  assert.deepEqual(selectFeedback({ comments: [...commands, evidence], permissions: {owner: "admin"}, headSha: head }), []);
});
test("frontend opt-in label or exact authorized owner opt-out is mandatory", async () => {
  const f = fixture(); f.input.labels = []; f.submit(); await assert.rejects(evaluateFrontend(f.input), /requires agent-fix/);
  f.input.comments.push({ id: 9, user: owner, created_at: "2026-10-26T12:00:00Z", body: `/visual-opt-out ${head} ${evidenceDigest(f.evidence)}` });
  assert.equal((await evaluateFrontend(f.input)).status, "accepted");
});

test("headless UI state/formatters/config cannot silently become N/A", async () => {
  for (const path of ["src/lib/datetime/business-date.ts", "src/features/settings/vat-display.ts", "src/features/scheduling/conflict-resolver-state.ts", "src/features/jobs/action-state.ts", "next.config.ts"]) {
    const f = fixture(); f.input.files = [path]; await assert.rejects(evaluateFrontend(f.input), /Missing current-head/);
  }
});
test("backend-only ambiguous source needs explicit trusted scoped N/A", async () => {
  const f = fixture(); f.input.files = ["src/lib/domain/server.ts"];
  const e = { schemaVersion: 1, candidateSha: head, kind: "not-applicable", changedPaths: f.input.files, reason: "Reviewed backend-only integrity change has no rendered/UI state or formatting effect" };
  f.input.comments = [{id: 1, user: owner, created_at: "2026-10-26T10:00:00Z", body: `${EVIDENCE_MARKER}\n\`\`\`json\n${JSON.stringify(e)}\n\`\`\``}];
  await assert.rejects(evaluateFrontend(f.input), /authenticated impact/);
  f.input.comments.push({id: 2, user: owner, created_at: "2026-10-26T10:00:00Z", body: `/visual-not-applicable ${head} ${evidenceDigest(e)}`});
  assert.equal((await evaluateFrontend(f.input)).status, "not-applicable");
});

test("completion wrapper blocks original state/status/finalization helper before writes", () => {
  for (const entry of ["delivery_gate.py", "state_update.py", "state_plan.py", "story_plan.py"]) {
    const calls: string[][] = [];
    const run = (command: string, args: string[]) => { calls.push([command, ...args]); return {status: 1}; };
    assert.equal(guardedCompletion({ baseline: head, entry, args: ["unchanged", "arguments"], run }), 1);
    assert.equal(calls.length, 1); assert.match(calls[0][1], /frontend-controller\.mjs$/);
  }
});
test("completion wrapper invokes original helper unchanged only after accepted/N/A gate", () => {
  const calls: string[][] = [];
  const run = (command: string, args: string[]) => { calls.push([command, ...args]); return {status: 0}; };
  assert.equal(guardedCompletion({baseline: head, entry: "state_update.py", args: ["update", "--phase", "done"], run}), 0);
  assert.equal(calls.length, 2); assert.equal(calls[1][0], "python"); assert.deepEqual(calls[1].slice(2), ["update", "--phase", "done"]);
  assert.throws(() => guardedCompletion({baseline: head, entry: "other.py", run}), /supported completion/);
});
test("later failed trusted image receipt invalidates earlier independent PASS", async () => {
  const f = fixture(); f.establish(); f.submit(false); f.independent(); f.independent("error");
  await assert.rejects(evaluateFrontend(f.input), /Independent vision/);
});
test("trusted unresolved critical image finding cannot use manual fallback", async () => {
  const f = fixture(); f.establish(); f.submit(); f.independent();
  const comment = f.input.comments.at(-1)!;
  comment.body = comment.body.replace('"findings":[]', '"findings":[{"id":"A11Y-1","category":"accessibility","status":"open"}]');
  await assert.rejects(evaluateFrontend(f.input), /critical findings cannot be waived/);
});
test("source and established reference identities cannot be silently replaced", async () => {
  const f = fixture(); f.establish(); f.policy.references["widget-v1"].finished["360x640"] = "e".repeat(64); f.submit();
  await assert.rejects(evaluateFrontend(f.input), /Reference was changed/);
  const g = fixture(); g.evidence.source = {...g.evidence.source, version: "unapproved"}; g.submit();
  await assert.rejects(evaluateFrontend(g.input), /source identity/);
});

test("review-origin owner acceptance can be revoked by later issue comment", async () => {
  const f = fixture(); f.submit();
  const acceptance = f.input.comments[1] as typeof f.input.comments[1] & {submitted_at?: string};
  delete (acceptance as Partial<typeof acceptance>).created_at; acceptance.submitted_at = "2026-10-26T10:00:00Z";
  f.input.comments.push({id: 4, user: owner, created_at: "2026-10-26T12:00:00Z", body: `/visual-revoke ${head} ${evidenceDigest(f.evidence)}`});
  await assert.rejects(evaluateFrontend(f.input), /revoked/);
});
test("authenticated invalid order timestamps fail closed", async () => {
  const f = fixture(); f.submit(); f.input.comments[1].created_at = "invalid";
  await assert.rejects(evaluateFrontend(f.input), /ordering timestamp/);
});
test("edited older provider receipt overrides PASS by updated time", async () => {
  const f = fixture(); f.establish(); f.submit(false); f.independent();
  const pass = f.input.comments.at(-1)!; pass.id = 10; pass.created_at = "2026-10-26T11:00:00Z";
  f.independent("error"); const failed = f.input.comments.at(-1)!; failed.id = 9;
  (failed as typeof failed & {updated_at: string}).updated_at = "2026-10-26T12:00:00Z";
  await assert.rejects(evaluateFrontend(f.input), /Independent vision/);
});
test("later clean provider review supersedes older critical issue finding", async () => {
  const f = fixture(); f.establish(); f.submit(false); f.independent();
  const old = f.input.comments.at(-1)!; old.id = 100; old.created_at = "2026-10-26T10:00:00Z";
  old.body = old.body.replace('"findings":[]', '"findings":[{"id":"A11Y-1","category":"accessibility","status":"open"}]');
  f.independent(); const clean = f.input.comments.at(-1)!; clean.id = 2;
  delete (clean as Partial<typeof clean>).created_at;
  (clean as typeof clean & {submitted_at: string}).submitted_at = "2026-10-26T12:00:00Z";
  assert.equal((await evaluateFrontend(f.input)).mode, "independent-vision");
});
test("candidate authors and committers cannot independently accept their work", async () => {
  const f = fixture(); f.establish(); f.submit(false); f.independent();
  const input = {...f.input, authorIds: [456, 789]};
  await assert.rejects(evaluateFrontend(input), /Independent vision/);
  await assert.rejects(evaluateFrontend({...f.input, authorsComplete: false}), /Independent vision/);
  assert.equal((await evaluateFrontend({...f.input, authorIds: [789, 999]})).mode, "independent-vision");
});
test("trusted canonical source bytes must exist and match committed authority", () => {
  const bytes = Buffer.from("canonical approved source bytes\n");
  const policy = {source: {hashes: {"DESIGN.md": hash(bytes)}}};
  assert.equal(verifyTrustedSources(policy, () => bytes), true);
  assert.throws(() => verifyTrustedSources(policy, () => Buffer.from("different source")), /source bytes unavailable or mismatched/);
  assert.throws(() => verifyTrustedSources(policy, () => {throw new Error("Canonical source unavailable");}), /Canonical source unavailable/);
});
function controllerApi(f: ReturnType<typeof fixture>, actors = [{author: {id: 777}, committer: {id: 888}}]) {
  return async (path: string) => {
    if (path === "/repos/o/r/pulls/1") return {number: 1, state: "open", head: {sha: head}, changed_files: f.input.files.length, commits: actors.length, user: {id: 123}, body: f.input.prBody, labels: [{name: "agent-fix"}]};
    if (path.includes("/files?")) return f.input.files.map((filename) => ({filename}));
    if (path.includes("/commits?")) return actors;
    if (path.includes("/issues/1/comments?")) return f.input.comments;
    if (path.includes("/reviews?") || path.includes("/pulls/1/comments?")) return [];
    if (path.endsWith("/permission")) return {permission: "admin"};
    if (path.includes("/git/ref/heads/")) return {ref: "refs/heads/codex/visual-evidence/pr-1", object: {type: "commit", sha: f.evidence.presentation.evidenceCommit}};
    if (path.includes("/contents/screenshots/")) { const filePath = path.split("/contents/")[1].split("?")[0], capture = f.evidence.captures.find(c => publicationPath(head, c) === filePath)!; return {type: "file", path: filePath, size: 100, sha: capture.actual.gitBlob}; }
    if (path.includes("/git/blobs/")) { const oid = path.split("/").at(-1)!; const bytes = f.blobs.get(oid)!; return {sha: oid, size: bytes.length, encoding: "base64", content: bytes.toString("base64")}; }
    throw new Error(`Unexpected path ${path}`);
  };
}
test("API-authenticated manual acceptance still blocks missing or mismatched canonical sources", async () => {
  const f = fixture(); const bytes = Buffer.from("approved source"); f.policy.source.hashes["DESIGN.md"] = hash(bytes); f.submit();
  const args = {api: controllerApi(f), repo: "o/r", prNumber: 1, expectedHead: head, policy: f.policy};
  assert.equal((await assessPr({...args, readSource: () => bytes})).status, "accepted");
  await assert.rejects(assessPr({...args, readSource: () => Buffer.from("stale source")}), /source bytes unavailable or mismatched/);
  await assert.rejects(assessPr({...args, readSource: () => {throw new Error("Canonical source unavailable");}}), /Canonical source unavailable/);
});
test("API derives reviewer identity exclusion from human-opened PR commit authors/committers", async () => {
  const f = fixture(); const bytes = Buffer.from("approved source"); f.policy.source.hashes["DESIGN.md"] = hash(bytes); f.establish(); f.submit(false); f.independent();
  const args = {repo: "o/r", prNumber: 1, expectedHead: head, policy: f.policy, readSource: () => bytes};
  await assert.rejects(assessPr({...args, api: controllerApi(f, [{author: {id: 456}, committer: {id: 888}}])}), /Independent vision/);
  await assert.rejects(assessPr({...args, api: controllerApi(f, [{author: {id: 777}, committer: {id: 456}}])}), /Independent vision/);
  assert.equal((await assessPr({...args, api: controllerApi(f)})).mode, "independent-vision");
});
test("signal/null helper outcomes never report completion success", () => {
  for (const outcome of [{status: null, signal: "SIGTERM"}, {status: 0, signal: "SIGTERM"}, {status: null}]) {
    let calls = 0;
    assert.equal(guardedCompletion({baseline: head, entry: "state_update.py", run: () => ++calls === 1 ? {status: 0} : outcome}), 1);
    assert.equal(calls, 2);
  }
});

test("real completion subprocess refuses failing gate before helper can write", () => {
  const root = mkdtempSync(join(tmpdir(), "frontend-completion-fixture-"));
  try {
    const gateDir = join(root, "scripts", "quality");
    const helperDir = join(root, ".agents", "skills", "auto-bmad", "scripts");
    mkdirSync(gateDir, {recursive: true}); mkdirSync(helperDir, {recursive: true});
    writeFileSync(join(gateDir, "frontend-controller.mjs"), "process.exitCode = 1;\n");
    writeFileSync(join(helperDir, "state_update.py"), "from pathlib import Path\nPath('unexpected-helper-write').write_text('should never execute')\n");
    assert.equal(guardedCompletion({baseline: head, entry: "state_update.py", root}), 1);
    assert.equal(existsSync(join(root, "unexpected-helper-write")), false);
  } finally {
    assert.equal(dirname(resolve(root)), resolve(tmpdir()));
    assert.match(root.split(/[\\/]/).at(-1)!, /^frontend-completion-fixture-/);
    rmSync(root, {recursive: true, force: true});
  }
});


test("unrelated feedback triage needs authenticated scope acceptance, never author assertion alone", async () => {
  const f = fixture(); f.establish();
  const remark = {id: 40, user: owner, created_at: "2026-10-26T10:00:00Z", body: "Coordination note: review will follow tomorrow."};
  const feedback = presentationFeedback({comments: [remark], permissions: f.input.permissions});
  f.evidence.presentation.feedback = feedback.map((item: {kind: string; id: number; rootId: number; sourceFingerprint: string}) => ({...item, disposition: "not-change-feedback", reason: "Coordination only; no implementation change was requested."}));
  f.submit(false); f.input.comments.push(remark); f.independent();
  await assert.rejects(evaluateFrontend({...f.input, feedback}), /Independent vision/);
  const receipt = f.input.comments.at(-1)!;
  receipt.body = receipt.body.replace('"findings":[]', `"feedbackScopeDigest":"${feedbackScopeDigest(f.evidence.presentation.feedback)}","findings":[]`);
  assert.equal((await evaluateFrontend({...f.input, feedback})).mode, "independent-vision");
  f.submit(); f.input.comments.push(remark);
  assert.equal((await evaluateFrontend({...f.input, feedback})).mode, "owner-manual");
});

test("trusted checker rejects body removal or feedback edits during accepted assessment", async () => {
  for (const mutation of ["body", "feedback"]) {
    const f = fixture(), bytes = Buffer.from("approved source"); f.policy.source.hashes["DESIGN.md"] = hash(bytes); f.submit();
    const base = controllerApi(f); let prReads = 0, feedbackReads = 0;
    const api = async (path: string) => {
      const value = await base(path);
      if (path === "/repos/o/r/pulls/1" && ++prReads === 2 && mutation === "body") return {...value, body: "Screenshots removed"};
      if (path.includes("/issues/1/comments?") && ++feedbackReads === 2 && mutation === "feedback") return [...value as typeof f.input.comments, {id: 99, user: owner, created_at: "2026-10-26T13:00:00Z", body: "Please revise the actual mobile layout."}];
      return value;
    };
    await assert.rejects(assessPr({api, repo: "o/r", prNumber: 1, expectedHead: head, policy: f.policy, readSource: () => bytes}), /body or feedback\/replies changed/);
  }
});
