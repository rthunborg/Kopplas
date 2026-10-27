# Committed F3-only default parser corrective review

{
  "phase": "review-native-cause-proof-parser-f3-latest3",
  "role": "independent-sensitive-latest3-default-parser-regression-reviewer",
  "model": "gpt-6.1-sol",
  "effort": "high",
  "recorded_by_root_before_dispatch": true,
  "dispatch_owner": "Parent; author does not dispatch",
  "source": "af5af69fd5018795a963a28c1ad367147b4a9bc3",
  "base": "52007b760ff10f056ac75c5ed5b7dcdf49f99036",
  "scope": "Only latest F3 three-path correction and consequential regressions; not fourth broad review",
  "completed_broad_rounds": 3,
  "current_verdict": "PENDING",
  "original520_verdict": "NOTPASS, F1/F2 CLOSED, F3 OPEN; immutable historical report",
  "review_composite": "Reused unchanged four-path F1/F2 closure plus pending current three-path F3 correction; not new whole-seven PASS",
  "source_spec_index_frozen": true,
  "root_metadata_identity_only": {
    "current70": 70,
    "current_normalization": 41,
    "delta_normalization": 2,
    "unchanged67": 67,
    "author_commits": 19,
    "root_commits": 11,
    "ancestry": 30,
    "raw_root_state_not_resampled": true,
    "root_dirty_excluded": true
  },
  "invariants": [
    "Strict structural subset only; no new parser dependency or broader syntax contract",
    "Malformed scalar must fail before durable state and sole POST",
    "Actual current candidate and supported default/comment/colon content preserved",
    "Same fixed GET/solePOST/ref/SHA/candidate/default/nonce/mode gates",
    "F1/F2 helper/wrapper/CIpin/runtime controls unchanged",
    "All43 DB and14 browser causes unresolved; DIAG001 unexecuted; hosted availability UNKNOWN; private consumer UNBORN"
  ],
  "native_credit": 0
}

## Actual native three-path delta (untrimmed)

```text
diff --git a/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md b/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md
index bf3cb98a..046d41ef 100644
--- a/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md
+++ b/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md
@@ -1187,6 +1187,41 @@ Kernel5760 bytes is unchanged; status stays in-review, ARR warnings and all11
 failed native histories remain. All43 DB/14 browser causes remain unresolved.
 No development-complete, release, delivery or diagnostic acceptance is claimed.
 
+## F3 default plain-scalar refusal — 2026-10-21
+
+The independent latest-seven review at52007b76 closed F1 and F2 but is preserved
+as NOTPASS for one new P2 recognizer defect. A default event descendant such as
+`inputs: x: y` passed the prior bounded subset even though colon followed by
+separation is not valid plain YAML scalar content. Active registration/blob
+identity and full candidate checks do not validate that default scalar. The
+required pre-POST refusal therefore needed correction; no hosted execution,
+acceptance or key-cleanup bypass is inferred. The exact report/attestation and
+all prior input bytes remain immutable.
+
+Under Root's recorded sensitive Sol6.1 High F3 route and existing exact-seven
+allocation, only dispatcher, its existing unit file and this author trail change.
+The same narrow structural recognizer now treats separated # as comment syntax,
+then refuses colon-whitespace/end and adjacent unsupported plain-scalar mapping,
+sequence/reserved leading indicators. It still accepts supported colon-without-
+separation content and comments, and keeps existing quote/block/alias/duplicate/
+nesting/sequence checks. No parser dependency, broader YAML capability, provider
+GET/POST, durable intent, ref/SHA/capability, retry or default-branch change is
+introduced. Malformed defaults stop before BOTH state creation and the sole POST.
+F1 helper, F2 wrapper, CI pin and all their closed-review evidence are unchanged.
+
+Actual affected dispatcher run passed31/31 with0fail/skip/cancel on its first
+execution, including the actual reviewed recognizer and real checkpoint caller
+against malformed defaults. Original30 controls remain. Whole TypeScript and
+affected two-file ESLint passed0errors/0warnings. These pure/injected provider
+controls are not hosted availability or native cause proof. Earlier374-before-
+late plus30-after/344-unchanged remains historical composite evidence, not a new
+combined suite at this fix. No additional broad unit/build/native run is claimed.
+Single author SRO and5760-byte approved kernel are preserved; status stays
+in-review and current ARR warnings remain. Fresh distinct High committed latest-
+three review is pending within the completed three-round cap. All43 DB causes,
+14 browser failures,11 failed native packets, unborn private qualifier and later
+Root availability/admission/execution gates remain unresolved or pending.
+
 ## Suggested Review Order
 
 Author: Story 15.5 implementation/fix author (gpt-6.1-sol High), incorporating
@@ -1366,7 +1401,7 @@ and the43DB/14browser gaps remain failed/unresolved; no whole-native reuse.
 - `tests/support/calendar-feed-atdd.ts:750` — `export async function calendarCauseProofIdle`: a pg timeout is not actual protocol settlement.
 - `tests/support/calendar-feed-atdd.ts:762` — `export async function runCalendarFeedCauseProof`: one ordinary command, qualified restricted original baseline, rollback/fresh verification and conditional custody cleanup.
 - `tests/integration/commands/calendar-feed.int.test.ts:21` — `test("15.5-DIAG001"`: explicit-mode-only diagnostic inventory; normal95/INT015 are not replaced.
-- `scripts/ci/checkpoint-dispatch.mjs:79` — `function diagnosticAvailability`: candidate/default availability refusal before the sole POST.
+- `scripts/ci/checkpoint-dispatch.mjs:83` — `function diagnosticAvailability`: candidate/default availability refusal before the sole POST.
 - `scripts/ci/checkpoint-dispatch.mjs:15` — `function verificationMode`: persisted diagnostic/legacy mode cannot downgrade to normal acceptance.
 - `scripts/ci/with-calendar-feed-runtime.mjs:14` — `export const CAUSE_PROOF_ARGS`: fixed single-case serial argv/reporters/output without a Next/browser child.
 - `scripts/ci/with-calendar-feed-runtime.mjs:50` — `export async function finishCauseProof`: validated distinct report upload on test failure as well as success, with private custody redaction.
@@ -1405,3 +1440,16 @@ focused ESLint passed. Actual source seams,
 synthetic SQL rows, simulated spawn events and temp-FS reports are not native
 SQL/Auth/child/hosted acceptance. The new schema's future private consumer,
 hosted availability, fresh committed High and Root execution remain pending.
+
+### Refuse malformed default scalars before consuming the intent
+
+The bounded default-event subset rejects colon-separation mapping syntax rather
+than claiming default syntax validity from registration or a different candidate.
+
+- `scripts/ci/checkpoint-dispatch.mjs:64` — `|| /:\s|:$/.test(value)`: malformed plain values cannot reach durable intent or POST.
+- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:309` — `F3 actual default plain-scalar syntax refusal`: actual recognizer/caller negatives prove no state and no POST.
+
+Evidence:31 affected dispatcher controls passed, whole TypeScript and two-file
+ESLint passed. Closed F1/F2 and unchanged344 control bindings are reused with
+historical scope, not rerun or summed into a new execution. Hosted availability,
+private consumer adoption and diagnostic/native acceptance remain pending.
diff --git a/scripts/ci/checkpoint-dispatch.mjs b/scripts/ci/checkpoint-dispatch.mjs
index b5430f80..6325d7fa 100644
--- a/scripts/ci/checkpoint-dispatch.mjs
+++ b/scripts/ci/checkpoint-dispatch.mjs
@@ -56,8 +56,12 @@ export function assertDefaultDispatchWorkflow(source) {
     const match = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(text);
     if (!match || parent.sequence || parent.keys.has(match[1])) refuse();
     parent.keys.add(match[1]);
-    const value = (match[2] ?? "").trim();
+    // Within this unquoted subset, a separated # starts a YAML comment.
+    // A colon before whitespace/end is mapping syntax, never a plain value.
+    const rawValue = (match[2] ?? "").trim();
+    const value = rawValue.startsWith("#") ? "" : rawValue.replace(/\s+#.*$/, "").trim();
     if (/^[|>&*!{"']/.test(value) || /[\r\n]/.test(value)
+      || /:\s|:$/.test(value) || /^[?:-](?:\s|$)|^[,@`%]/.test(value)
       || (/[\[\]{}]/.test(value) && !/^\[(?:[A-Za-z0-9_./-]+(?:,\s*[A-Za-z0-9_./-]+)*)?\]$/.test(value))) refuse();
     // A root event must be a mapping; null dispatch is represented by an empty value.
     if (indent === 2 && value && !value.startsWith("#")) refuse();
diff --git a/tests/unit/scripts/ci/checkpoint-dispatch.test.ts b/tests/unit/scripts/ci/checkpoint-dispatch.test.ts
index 2c1c16a3..fb0f9d9b 100644
--- a/tests/unit/scripts/ci/checkpoint-dispatch.test.ts
+++ b/tests/unit/scripts/ci/checkpoint-dispatch.test.ts
@@ -304,3 +304,19 @@ test("candidate diagnostic capability cannot be replaced by default presence and
   }
   for(const change of ["blob","disabled","path"]){withFixture(f=>{const old=f.dependencies.api;f.dependencies.api=(method,endpoint,body)=>{const reply=old(method,endpoint,body);if(change==="blob"&&endpoint.endsWith("ref=main"))return{...(reply as object),sha:"b".repeat(40)};if(endpoint.endsWith("/workflows/ci.yml"))return{...(reply as object),...(change==="disabled"?{state:"disabled_manually"}:change==="path"?{path:"other.yml"}:{})};return reply;};assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies));assert.equal(mutations(f).length,0);});}
 });
+
+
+test("F3 actual default plain-scalar syntax refusal precedes durable intent and the sole POST",()=>{
+  const actualCandidate=readFileSync(".github/workflows/ci.yml","utf8");
+  assertDefaultDispatchWorkflow(actualCandidate);assertCauseProofWorkflow(actualCandidate);
+  const document=(value:string)=>"name: CI\non:\n  workflow_dispatch:\n    inputs: "+value+"\njobs:\n  verify: {}\n";
+  for(const value of ["x: y","x:","x:  y","? mapping","- sequence",": mapping","@reserved","%TAG","\u0060reserved",",flow"]){
+    const source=document(value);assert.throws(()=>assertDefaultDispatchWorkflow(source),/unavailable/);
+    withFixture(f=>{f.defaultWorkflow(source);assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/unavailable/);assert.equal(existsSync(f.state),false);assert.equal(mutations(f).length,0);assert.equal(f.calls.at(-1)?.endpoint,"repos/owner/repo/contents/.github/workflows/ci.yml?ref=main");});
+  }
+  // Colons not followed by separation are valid plain content; comment syntax
+  // never supplies an event or makes invalid scalar content valid.
+  for(const value of ["https://example.invalid","description:value","# comment: not scalar data"]){assertDefaultDispatchWorkflow(document(value));}
+  assert.throws(()=>assertDefaultDispatchWorkflow(document("x: y # comment")),/unavailable/);
+  assertDefaultDispatchWorkflow("name: CI\non: # event: mapping\n  workflow_dispatch: # empty: declaration\n    inputs: # empty: mapping\njobs:\n  verify: {}\n");
+});

```

## Actual structural recognizer/candidate availability; current line numbers

```text
1: import { spawnSync } from "node:child_process";
2: import { randomUUID } from "node:crypto";
3: import { createHash } from "node:crypto";
4: import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
5: import { dirname, resolve } from "node:path";
6: import { fileURLToPath } from "node:url";
7: 
8: export const WORKFLOW = "ci.yml";
9: export const WORKFLOW_PATH = ".github/workflows/ci.yml";
10: const SHA = /^[a-f0-9]{40}$/;
11: const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
12: const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
13: const ACTOR = /^[A-Za-z0-9-]+(?:\[bot\])?$/;
14: export const checkpointTitle = (id, sha, mode = "normal") => mode === "calendar-feed-cause-proof" ? `checkpoint:cause-proof:${id}:${sha}` : `checkpoint:${id}:${sha}`;
15: function verificationMode(state) {
16:   if (state.verification_mode === undefined && state.cause_proof === undefined) return state.release_validation === true ? "release" : "normal";
17:   const expected = state.cause_proof === true ? "calendar-feed-cause-proof" : state.release_validation === true ? "release" : "normal";
18:   if (typeof state.cause_proof !== "boolean" || state.verification_mode !== expected || (state.cause_proof && state.release_validation)) throw new Error("Invalid checkpoint verification mode.");
19:   return expected;
20: }
21: const modeReceipt = state => ({ verification_mode: verificationMode(state), evidence_class: verificationMode(state) === "calendar-feed-cause-proof" ? "diagnostic-only" : "normal-gates-pending", acceptance_credit: 0 });
22: 
23: /** Deliberately narrow block-mapping recognizer, not a permissive YAML parser.
24:  * Unsupported declarations stop before POST. Default presence does not require
25:  * candidate-only diagnostic inputs; it still requires a real root event. */
26: export function assertDefaultDispatchWorkflow(source) {
27:   const refuse = () => { throw new Error("Default workflow_dispatch declaration unavailable; no dispatch sent."); };
28:   if (typeof source !== "string" || source.length > 512_000 || /[\t\0]/.test(source)) refuse();
29:   const lines = source.replaceAll("\r\n", "\n").split("\n");
30:   const roots = new Map();
31:   for (let i = 0; i < lines.length; i++) {
32:     const line = lines[i];
33:     if (!line.trim() || line.trimStart().startsWith("#") || line.startsWith(" ")) continue;
34:     const key = /^([A-Za-z_][\w-]*):(?:\s|$)/.exec(line);
35:     if (!key || roots.has(key[1])) refuse();
36:     roots.set(key[1], i);
37:   }
38:   const start = roots.get("on");
39:   if (start === undefined || !/^on:\s*(?:#.*)?$/.test(lines[start])) refuse();
40:   const end = [...roots.values()].find(i => i > start) ?? lines.length;
41:   const levels = [{ indent: 0, keys: new Set(), canNest: true, sequence: false }];
42:   let found = false;
43:   for (const line of lines.slice(start + 1, end)) {
44:     if (!line.trim() || line.trimStart().startsWith("#")) continue;
45:     const indent = line.length - line.trimStart().length;
46:     if (indent < 2 || indent % 2 !== 0) refuse();
47:     while (levels.length > 1 && levels.at(-1).indent >= indent) levels.pop();
48:     const parent = levels.at(-1);
49:     if (indent !== parent.indent + 2 || !parent.canNest) refuse();
50:     const text = line.trimStart();
51:     if (text.startsWith("- ")) {
52:       // Only simple branch-name sequences; aliases/flow/mapping/scalar syntax is refused.
53:       if (indent <= 2 || parent.keys.size || !/^- [A-Za-z0-9_./-][A-Za-z0-9_./*-]*\s*$/.test(text)) refuse();
54:       parent.sequence = true; continue;
55:     }
56:     const match = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(text);
57:     if (!match || parent.sequence || parent.keys.has(match[1])) refuse();
58:     parent.keys.add(match[1]);
59:     // Within this unquoted subset, a separated # starts a YAML comment.
60:     // A colon before whitespace/end is mapping syntax, never a plain value.
61:     const rawValue = (match[2] ?? "").trim();
62:     const value = rawValue.startsWith("#") ? "" : rawValue.replace(/\s+#.*$/, "").trim();
63:     if (/^[|>&*!{"']/.test(value) || /[\r\n]/.test(value)
64:       || /:\s|:$/.test(value) || /^[?:-](?:\s|$)|^[,@`%]/.test(value)
65:       || (/[\[\]{}]/.test(value) && !/^\[(?:[A-Za-z0-9_./-]+(?:,\s*[A-Za-z0-9_./-]+)*)?\]$/.test(value))) refuse();
66:     // A root event must be a mapping; null dispatch is represented by an empty value.
67:     if (indent === 2 && value && !value.startsWith("#")) refuse();
68:     if (match[1] === "workflow_dispatch") { if (indent !== 2) refuse(); found = true; }
69:     levels.push({ indent, keys: new Set(), canNest: value === "" || value.startsWith("#"), sequence: false });
70:   }
71:   if (!found) refuse();
72: }
73: 
74: /** A workflow ID being active does not prove candidate diagnostic capability. */
75: export function assertCauseProofWorkflow(source) {
76:   assertDefaultDispatchWorkflow(source);
77:   if (typeof source !== "string" || source.length > 512_000) throw new Error("Diagnostic workflow availability unverified.");
78:   const text = source.replaceAll("\r\n", "\n");
79:   if (!text.includes("      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n")
80:     || !text.includes("checkpoint:cause-proof:{0}:{1}") || !text.includes('test "$RELEASE_VALIDATION" = false')
81:     || !text.includes("node scripts/ci/with-calendar-feed-runtime.mjs cause-proof")) throw new Error("Diagnostic workflow input/admission is unavailable; no dispatch sent.");
82: }
83: function diagnosticAvailability(api, options) {
84:   const read = ref => {
85:     const value = api("GET", `repos/${options.repo}/contents/${WORKFLOW_PATH}?ref=${encodeURIComponent(ref)}`);
86:     if (value?.encoding !== "base64" || typeof value.content !== "string" || value.content.length > 700_000 || !/^[a-f0-9]{40}$/.test(value.sha ?? "")) throw new Error("Diagnostic workflow source unavailable; no dispatch sent.");
87:     const bytes = Buffer.from(value.content, "base64");
88:     if (createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") !== value.sha) throw new Error("Diagnostic workflow object mismatch; no dispatch sent.");
89:     const text = bytes.toString("utf8");
90:     return { text, oid: value.sha };
91:   };
92:   const candidate = read(options.sha);
93:   assertCauseProofWorkflow(candidate.text);
94:   if (candidate.text.replaceAll("\r\n", "\n") !== readFileSync(resolve(WORKFLOW_PATH), "utf8").replaceAll("\r\n", "\n")) throw new Error("Diagnostic candidate workflow differs from reviewed checkout; no dispatch sent.");
95:   const repository = api("GET", `repos/${options.repo}`);
96:   validateRequest({ ...options, ref: repository?.default_branch });
97:   const primary = read(repository.default_branch);
98:   assertDefaultDispatchWorkflow(primary.text);
99:   return { candidate_workflow_oid: candidate.oid, default_workflow_oid: primary.oid };
100: }
101: 
102: export function validateRequest({ repo, ref, sha }) {
103:   if (!REPO.test(repo ?? "") || repo.includes("..")) throw new Error("Use an explicit owner/repository.");
```

## Actual caller gates, durable intent and sole POST

```text
176: export function checkpoint(command, options, { api = githubApi, now = () => new Date() } = {}) {
177:   if (!["dispatch", "status", "cancel"].includes(command)) throw new Error("Use dispatch, status or cancel.");
178:   if (!options.state) throw new Error("--state is required; use an ignored private local path.");
179:   const path = resolve(options.state);
180:   mkdirSync(dirname(path), { recursive: true });
181:   const lockPath = `${path}.lock`;
182:   let lock;
183:   try { lock = openSync(lockPath, "wx", 0o600); } catch { throw new Error("Checkpoint record is locked; inspect its owner before recovery."); }
184:   try {
185:     if (command === "dispatch") {
186:       if (existsSync(path)) throw new Error("Checkpoint record already exists. Use status; never retry dispatch from this record.");
187:       validateRequest(options);
188:       if (options.release_validation !== undefined && !["true", "false"].includes(options.release_validation)) throw new Error("--release-validation must be true or false.");
189:       if (options.cause_proof !== undefined && !["true", "false"].includes(options.cause_proof)) throw new Error("--cause-proof must be true or false.");
190:       if (options.cause_proof === "true" && options.release_validation === "true") throw new Error("Diagnostic and release modes are mutually exclusive.");
191:       const actor = api("GET", "user").login;
192:       if (!ACTOR.test(actor ?? "")) throw new Error("Cannot establish authenticated actor.");
193:       const permission = api("GET", `repos/${options.repo}/collaborators/${encodeURIComponent(actor)}/permission`).permission;
194:       if (!["admin", "maintain", "write"].includes(permission)) throw new Error("Checkpoint dispatch requires repository write permission.");
195:       const branch = api("GET", `repos/${options.repo}/branches/${encodeURIComponent(options.ref)}`);
196:       if (branch.commit?.sha !== options.sha) throw new Error("Remote branch differs from the requested SHA; no dispatch sent.");
197:       const workflow = api("GET", `repos/${options.repo}/actions/workflows/${WORKFLOW}`);
198:       if (workflow.path !== WORKFLOW_PATH || workflow.state !== "active" || !Number.isSafeInteger(workflow.id) || workflow.id < 1) throw new Error("Expected active CI workflow is unavailable on the default branch.");
199:       const availability = options.cause_proof === "true" ? diagnosticAvailability(api, options) : undefined;
200:       const created = now();
201:       const state = {
202:         version: 1, repo: options.repo, ref: options.ref, sha: options.sha,
203:         actor, workflow_id: workflow.id, checkpoint_id: randomUUID(),
204:         release_validation: options.release_validation === "true",
205:         cause_proof: options.cause_proof === "true",
206:         verification_mode: options.cause_proof === "true" ? "calendar-feed-cause-proof" : options.release_validation === "true" ? "release" : "normal",
207:         ...(availability ? { workflow_availability: availability } : {}),
208:         created_at: created.toISOString(), deadline_at: new Date(created.getTime() + 60 * 60 * 1000).toISOString(),
209:         phase: "dispatch-uncertain", run_id: null,
210:       };
211:       // Exclusive durable intent precedes the only dispatch POST. The GitHub
212:       // checkpoint ID correlates requests; GitHub does not make it idempotent.
213:       const fd = openSync(path, "wx", 0o600);
214:       try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
215:       try {
216:         api("POST", `repos/${state.repo}/actions/workflows/${state.workflow_id}/dispatches`, {
217:           ref: state.ref, inputs: { expected_sha: state.sha, checkpoint_id: state.checkpoint_id, release_validation: String(state.release_validation), ...(state.cause_proof ? { calendar_feed_cause_proof: "true" } : {}) },
218:         });
219:       } catch {
220:         throw new Error("Dispatch outcome uncertain. Ownership record retained; use status, never repeat dispatch.");
221:       }
222:       state.phase = "dispatched";
223:       save(path, state);
224:       return { phase: state.phase, checkpoint_id: state.checkpoint_id, sha: state.sha, release_validation: state.release_validation, ...modeReceipt(state), next: "Use status with this same --state record." };
225:     }
```

## Actual provider fixture and parser/caller controls

```text
1: import assert from "node:assert/strict";
2: import { spawnSync } from "node:child_process";
3: import { test } from "node:test";
4: import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
5: import { tmpdir } from "node:os";
6: import { join } from "node:path";
7: import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
8: import { checkpoint, checkpointTitle, parseArgs, validateRequest, assertCauseProofWorkflow, assertDefaultDispatchWorkflow } from "../../../../scripts/ci/checkpoint-dispatch.mjs";
9: import { createHash } from "node:crypto";
10: 
11: const sha = "a".repeat(40);
12: const request = { repo: "owner/repo", ref: "codex/checkpoint", sha };
13: function fixture() {
14:   const directory = mkdtempSync(join(tmpdir(), "checkpoint-unit-"));
15:   const state = join(directory, "state.json");
16:   const calls: { method: string; endpoint: string; body: unknown }[] = [];
17:   let runs: Record<string, unknown>[] = [];
18:   let failDispatch = false;
19:   let failCancel = false;
20:   let permission = "write";
21:   let remoteSha = sha;
22:   let actor = "owner";
23:   let fullPage = false;
24:   let defaultWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
25:   const api = (method: string, endpoint: string, body?: unknown) => {
26:     calls.push({ method, endpoint, body });
27:     if (endpoint === "user") return { login: actor };
28:     if (endpoint === "repos/owner/repo") return { default_branch: "main" };
29:     if (endpoint.includes("/contents/.github/workflows/ci.yml?ref=")) {
30:       const text = endpoint.endsWith("ref=main") ? defaultWorkflow : readFileSync(".github/workflows/ci.yml", "utf8");
31:       const bytes = Buffer.from(text);
32:       return { encoding: "base64", content: bytes.toString("base64"), sha: createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") };
33:     }
34:     if (endpoint.endsWith("/permission")) return { permission };
35:     if (endpoint.includes("/branches/")) return { commit: { sha: remoteSha } };
36:     if (endpoint.endsWith("/workflows/ci.yml")) return { id: 42, path: ".github/workflows/ci.yml", state: "active" };
37:     if (endpoint.endsWith("/dispatches")) { if (failDispatch) throw new Error("secret response"); return null; }
38:     if (endpoint.includes("/runs?")) return { workflow_runs: fullPage ? Array.from({ length: 100 }, () => ({ display_title: "unrelated" })) : runs };
39:     if (endpoint.endsWith("/cancel")) { if (failCancel) throw new Error("secret response"); return null; }
40:     if (endpoint.includes("/actions/runs/")) return runs.find((run) => endpoint.endsWith(`/${run.id}`));
41:     throw new Error(`Unexpected test endpoint ${endpoint}`);
42:   };
43:   const dependencies = { api, now: () => new Date("2026-10-19T12:00:00Z") };
44:   const dispatch = () => checkpoint("dispatch", { ...request, state }, dependencies);
45:   const status = () => checkpoint("status", { state }, dependencies);
46:   const cancel = () => checkpoint("cancel", { state }, dependencies);
47:   const record = () => JSON.parse(readFileSync(state, "utf8"));
48:   const run = (changes = {}) => {
49:     const current = record();
50:     return { id: 123, repository: { full_name: request.repo }, workflow_id: 42,
51:       path: ".github/workflows/ci.yml", event: "workflow_dispatch", head_branch: request.ref,
52:       head_sha: sha, display_title: checkpointTitle(current.checkpoint_id, sha, current.verification_mode),
53:       actor: { login: "owner" }, triggering_actor: { login: "owner" }, run_attempt: 1,
54:       status: "queued", conclusion: null, ...changes };
55:   };
56:   return { state, calls, dependencies, dispatch, status, cancel, record, run,
57:     setRuns(value: Record<string, unknown>[]) { runs = value; },
58:     failDispatch() { failDispatch = true; }, failCancel() { failCancel = true; },
59:     permission(value: string) { permission = value; }, remoteSha(value: string) { remoteSha = value; },
60:     actor(value: string) { actor = value; }, fullPage() { fullPage = true; }, defaultWorkflow(value: string) { defaultWorkflow = value; },
61:     cleanup() { rmSync(directory, { recursive: true, force: true }); } };
62: }
63: function withFixture(body: (value: ReturnType<typeof fixture>) => void) {
64:   const value = fixture();
65:   try { body(value); } finally { value.cleanup(); }
66: }
67: const mutations = (f: ReturnType<typeof fixture>) => f.calls.filter((call) => call.method === "POST");
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
  for(const source of [current.replace("calendar_feed_cause_proof:","other_input:"),current.replace("checkpoint:cause-proof:{0}:{1}","checkpoint:other:{0}:{1}"),current.replace('test "$RELEASE_VALIDATION" = false','test "$RELEASE_VALIDATION" = true'),current.replace("node scripts/ci/with-calendar-feed-runtime.mjs cause-proof","pnpm run test:int")]){
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

```

## Current F3 author trail

```text
## F3 default plain-scalar refusal — 2026-10-21

The independent latest-seven review at52007b76 closed F1 and F2 but is preserved
as NOTPASS for one new P2 recognizer defect. A default event descendant such as
`inputs: x: y` passed the prior bounded subset even though colon followed by
separation is not valid plain YAML scalar content. Active registration/blob
identity and full candidate checks do not validate that default scalar. The
required pre-POST refusal therefore needed correction; no hosted execution,
acceptance or key-cleanup bypass is inferred. The exact report/attestation and
all prior input bytes remain immutable.

Under Root's recorded sensitive Sol6.1 High F3 route and existing exact-seven
allocation, only dispatcher, its existing unit file and this author trail change.
The same narrow structural recognizer now treats separated # as comment syntax,
then refuses colon-whitespace/end and adjacent unsupported plain-scalar mapping,
sequence/reserved leading indicators. It still accepts supported colon-without-
separation content and comments, and keeps existing quote/block/alias/duplicate/
nesting/sequence checks. No parser dependency, broader YAML capability, provider
GET/POST, durable intent, ref/SHA/capability, retry or default-branch change is
introduced. Malformed defaults stop before BOTH state creation and the sole POST.
F1 helper, F2 wrapper, CI pin and all their closed-review evidence are unchanged.

Actual affected dispatcher run passed31/31 with0fail/skip/cancel on its first
execution, including the actual reviewed recognizer and real checkpoint caller
against malformed defaults. Original30 controls remain. Whole TypeScript and
affected two-file ESLint passed0errors/0warnings. These pure/injected provider
controls are not hosted availability or native cause proof. Earlier374-before-
late plus30-after/344-unchanged remains historical composite evidence, not a new
combined suite at this fix. No additional broad unit/build/native run is claimed.
Single author SRO and5760-byte approved kernel are preserved; status stays
in-review and current ARR warnings remain. Fresh distinct High committed latest-
three review is pending within the completed three-round cap. All43 DB causes,
14 browser failures,11 failed native packets, unborn private qualifier and later
Root availability/admission/execution gates remain unresolved or pending.


```

## Current local evidence and explicit historical composite limits

```text
{
  "source": "af5af69fd5018795a963a28c1ad367147b4a9bc3",
  "base": "52007b760ff10f056ac75c5ed5b7dcdf49f99036",
  "actual_changed_unit": {
    "command": "node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/ci/checkpoint-dispatch.test.ts",
    "total": 31,
    "pass": 31,
    "fail": 0,
    "skip": 0,
    "cancel": 0,
    "exit": 0,
    "first_run": true,
    "initial_failures": 0,
    "scope": "Actual recognizer and checkpoint caller with injected provider; malformed source refused before state creation/POST; no provider requests"
  },
  "whole_typecheck": {
    "command": "pnpm exec tsc --noEmit --incremental false",
    "exit": 0
  },
  "affected_lint": {
    "command": "pnpm exec eslint scripts/ci/checkpoint-dispatch.mjs tests/unit/scripts/ci/checkpoint-dispatch.test.ts --max-warnings 0",
    "exit": 0,
    "errors": 0,
    "warnings": 0
  },
  "native_git_hygiene": {
    "working_diffcheck": 0,
    "staged_diffcheck": 0,
    "exact_staged_paths": 3,
    "post_commit_source_and_index_clean": true
  },
  "historical_composite_only": {
    "seven_file374_before_late": true,
    "dispatcher30_after_late": true,
    "other344_bindings_unchanged": true,
    "current_new_combined374": false
  },
  "no_build_rerun": true,
  "no_native_SQL_Auth_RPC_browser_child_hosted_execution": true,
  "no_preparation_test_rerun": true,
  "native_credit": 0,
  "author_trail": {
    "stops": 89,
    "kernel_bytes": 5760,
    "kernel_sha256": "0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977",
    "status": "in-review",
    "ARR_warnings_preserved": true
  }
}
```

## Hash-bound previous F1/F2 closure and immutable contexts; read-only reuse

```text
{
  "references": [
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-corrective-review/review-input.md",
      "bytes": 143357,
      "sha256": "08d47625a44b1e4546fdaf411098cbcaadc9dd8676fb96be6e88550794e36d4a"
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-corrective-review/input-binding.json",
      "bytes": 33636,
      "sha256": "375634ad2bd8e0025ab16641eab6b77bd97a70c78c2fb3756b233300e55dbae8"
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-corrective-review/original-report.md",
      "bytes": 8610,
      "sha256": "5b480c25b39069f3fff270ce90977e272dee7a3b0f9d7b12c8bb3926f4ecdcbf"
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-corrective-review/original-attestation.json",
      "bytes": 27077,
      "sha256": "1a537514b5a9b2750cd95f0c12d4ac1f68266311d95c63dc004a43c739dd998f"
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-corrective-review/result.json",
      "bytes": 1549,
      "sha256": "1fcecf86670d8eb265d173f5d8f968ffcfe4bd60bb13002f6e03b078c59e9778"
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/accepted-native-denial-cause-proof-corrective-allocation.json",
      "bytes": 4261,
      "sha256": "956b92aaaeda0d028a4c53e2b48c00b8f86916bae2523f069f28ce2363451079"
    },
    {
      "path": ".env.epic15.mail-runtime/story-15-5-preparation/root-52007b76-original-review-admission.json",
      "bytes": 1010,
      "sha256": "8ef05c7aa146df5abce18f15aa3917e5ea65c1eeb3c230d3bcb79e05c405a325"
    },
    {
      "path": ".env.epic15.mail-runtime/story-15-5-preparation/root-af5af69f-source-path-admission.json",
      "bytes": 38719,
      "sha256": "4f6e76c81f594a697e75cf2bd3c54700b8a2bbc508410693e005aa846efa8277"
    }
  ],
  "reused": [
    {
      "path": "tests/support/calendar-feed-atdd.ts",
      "source_oid": "7eb081cc2a8f8ed9848319cdb0693d04fbec97b2",
      "baseline_oid": "7eb081cc2a8f8ed9848319cdb0693d04fbec97b2",
      "unchanged": true,
      "review_scope": "F1/F2 closure reused, no new whole-current-seven review claim"
    },
    {
      "path": "scripts/ci/with-calendar-feed-runtime.mjs",
      "source_oid": "ecbcaa951a4656ad5fe99b59bf2a0a8cb3c1599d",
      "baseline_oid": "ecbcaa951a4656ad5fe99b59bf2a0a8cb3c1599d",
      "unchanged": true,
      "review_scope": "F1/F2 closure reused, no new whole-current-seven review claim"
    },
    {
      "path": "tests/support/calendar-feed-ci-contract.ts",
      "source_oid": "0d2e0e0743dbc0d42d13e58de6a10b541589c925",
      "baseline_oid": "0d2e0e0743dbc0d42d13e58de6a10b541589c925",
      "unchanged": true,
      "review_scope": "F1/F2 closure reused, no new whole-current-seven review claim"
    },
    {
      "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
      "source_oid": "911ed4e0d01053011d3850d9250593b05265cc66",
      "baseline_oid": "911ed4e0d01053011d3850d9250593b05265cc66",
      "unchanged": true,
      "review_scope": "F1/F2 closure reused, no new whole-current-seven review claim"
    }
  ]
}
```

Review only F3 correction and latest-line regressions. Original520 NOTPASS and closure facts remain unchanged; do not relabel old review PASS. No provider/default mutation, source change, tests, native execution or acceptance occurred during this preparation. Parent dispatches a fresh context-free High reviewer.
