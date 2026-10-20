import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5", folder = `${prep}/native-owned-origin-review`;
const before = "6dad688ec6a51143bfee902618bb88647a81c940", head = "380c3e720d5caaa1dc2181d70737b9320337f451";
const paths = ["_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md", "tests/integration/rls/calendar-feed.rls.test.ts", "tests/support/calendar-feed-atdd.ts", "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts"];
const git = (args, input) => execFileSync("git", args, { input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const read = p => fs.readFileSync(p), sha = b => crypto.createHash("sha256").update(b).digest("hex"), lf = b => Buffer.from(b.toString().replaceAll("\r\n", "\n"));
const ref = p => { const b = read(p); return { path: p, bytes: b.length, sha256: sha(b) }; };
const write = (name, value) => fs.writeFileSync(`${folder}/${name}`, value, { flag: "wx" });
if (git(["rev-parse", "HEAD"]).toString().trim() !== head || git(["rev-parse", `${head}^`]).toString().trim() !== before) throw Error("Exact append-only committed head required");
if (git(["diff", "--name-only", before, head]).toString().trim() !== paths.join("\n") || git(["diff", head, "--", ...paths]).length || git(["diff", "--cached"]).length) throw Error("Exact four source paths/index required");
const bindings = paths.map(path => {
  const raw = read(path), cleanOid = git(["hash-object", `--path=${path}`, "--stdin"], raw).toString().trim();
  const oid = git(["rev-parse", `${head}:${path}`]).toString().trim(), blob = git(["cat-file", "blob", oid]);
  const oldOid = git(["rev-parse", `${before}:${path}`]).toString().trim(), old = git(["cat-file", "blob", oldOid]);
  if (cleanOid !== oid || !lf(raw).equals(blob) || git(["hash-object", "--no-filters", "--stdin"], lf(raw)).toString().trim() !== cleanOid) throw Error("Actual raw/clean/blob mismatch");
  return { path, raw_bytes: raw.length, raw_sha256: sha(raw), actual_git_clean_oid: cleanOid, normalized_bytes: blob.length, normalized_sha256: sha(blob), head_blob_oid: oid, head_blob_bytes: blob.length, head_blob_sha256: sha(blob), raw_equals_normalized: raw.equals(blob), baseline_blob_oid: oldOid, baseline_bytes: old.length, baseline_sha256: sha(old) };
});
const allocation = ref(`${prep}/accepted-native-owned-origin-diagnostic-repair.json`);
if (allocation.bytes !== 4462 || allocation.sha256 !== "76a6c87a3e87fac2b36b3b231b4de09461a691ae5ad2ca480e3f090d47a09d0a") throw Error("Root allocation mismatch");
const nativeDir = ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-6dad688e-ci-independent";
const nativeManifest = ref(`${nativeDir}/manifest.json`), nativeAdmission = ref(".env.epic15.mail-runtime/story-15-5-preparation/root-failed-6dad688e-packet-admission.json");
if (nativeManifest.sha256 !== "50188e3faffbd79f2c7797c2e02a19d13e170eac3b6eaf694368c0c36263d3a5" || nativeAdmission.bytes !== 1227 || nativeAdmission.sha256 !== "1e15decb78fc9060562b7b0c2a0862c407440ec7224ca54896e54845dee02fb3") throw Error("Ninth failed packet mismatch");
const spec = git(["cat-file", "blob", `${head}:${paths[0]}`]).toString();
const kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0], section = spec.split("## Suggested Review Order\n");
if (!kernel || Buffer.byteLength(kernel) !== 5760 || sha(kernel) !== "0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977" || section.length !== 2) throw Error("Kernel/one author trail mismatch");
const checks = { kind: "actual-bounded-owned-origin-controls", source: head, baseline: before, commands: [
  { command: "node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=tap tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", passed: 67, failed: 0, skipped: 0, cancelled: 0, receipt_start: "765598", receipt_completion: "29d9c4", actual_count_receipt: "98d3fc", output: ref(".env.epic15.mail-runtime/story-15-5-preparation/owned-origin-unit-final.tap"), limits: "61 retained plus six live-source controls. Exact first callbacks/guard/matcher/HTTP source with injected stopping fixtures and actual installed failTask/processError/public JsonReporter in memory; no native acceptance credit." },
  { command: "pnpm exec tsc --noEmit --incremental false", exit_code: 0, receipt_start: "223473", receipt_completion: "6d2951" },
  { command: "pnpm exec eslint tests/support/calendar-feed-atdd.ts tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts tests/integration/rls/calendar-feed.rls.test.ts", exit_code: 0, errors: 0, warnings: 0, receipt: "cd1d5e" },
  { command: "node scripts/verify/check-review-order.mjs <authorSpec>", exit_code: 0, sections: 1, literal_stops: 58, receipt: "cd1d5e" },
  { command: "intent-contract exact LF bytes/SHA256", bytes: 5760, sha256: sha(kernel), receipt: "db52fc" },
  { command: "git diff --check -- <exact4>; git diff --cached --check; exact4 staged paths; append-only commit", exit_code: 0, receipts: ["3ddf61", "6a71c1", "78ba4c", "b96014"], source_index_clean_receipt: "f39c1a" }
], initial_harness_failures: "New extraction harness first had a file-parser parenthesis error, then an HTTP source stripping top-level-return error. Corrected before final successful67 execution; the intermediate66 pass and aborted attempts are not substituted for the final count. Removed the now-unused SubjectName import before final lint.", dependency_limits: "After final67 run only Spec evidence/review-stop refresh occurred before commit; no source/Spec edits after commit. No broad check, build, SSR, Vitest runner/collection/globalSetup, DB/auth/browser, resource or native execution. Earlier SSR4/component4/nativeINT015 and key cleanup keep historical scope, not a whole-current-feature acceptance claim.", current_native: "UNEXECUTED_PENDING_ROOT_EXACT_HEAD_CI", actual43causes: "UNKNOWN", native_credit: 0 };
write("local-checks.json", JSON.stringify(checks, null, 2) + "\n");
const route = { kind: "author-postimplementation-route-binding", baseline: before, source: head, root_implementation_route_recorded_before_handoff: "build-native-owned-origin-diagnostic-repair/build-author-bounded-owned-issuance-and-assertion-origins", root_review_route_recorded_before_dispatch: "review-native-owned-origin-latest-four/independent-context-free-owned-origin-and-rls-assertion-reviewer", model: "gpt-6.1-sol", effort: "high", exact_paths: paths, allocation, authored_after_implementation: true, does_not_claim_preedit_artifact_bytes: true, completed_broad_rounds: 3, cap: 3, latest_serious_fix_only: true, fourth_broad_review: false, scope: "Compile-time matcher/token/HTTP origins; already-consumed issuance enum classification; four RLS001 allowed-subject assertions through synchronous once-call wrapper; six bounded controls and author trail. No native error/matcher argument inspection, operation/query/RPC/client/then/pool/principal/authority/result/settlement/custody/sharedcase/UI change. All43 causes and first actual branches unknown. Outcomes localize failed contracts only; ambiguous/uninstrumented outcomes require targeted cause-proof proposal, never assumed opaque retry." };
write("author-route.json", JSON.stringify(route, null, 2) + "\n");
const diff = lf(git(["diff", "--no-ext-diff", "--binary", "--unified=18", before, head, "--", ...paths]));
const chunks = [Buffer.from(`EXACT COMMITTED FOUR-PATH LATEST-SERIOUS-FIX-ONLY REVIEW. Completed broad rounds3/cap3; no fourth broad.\nSource ${head}; baseline ${before}; exact committed source/Spec held, no postcommit verdict drift.\nReview closed compile-time owned origins, classification of ONLY already-consumed issuance outcomes, ordinary newly-created safe source frames, four existing RLS001 allowed-subject assertions, and caller-faithful once/value/order/privacy controls. No native message/error/stack/cause/payload or generic matcher actual/expected inspection; no new operations/queries/RPC/client/then/pool/principal/authority/result/settlement/custody effect.\nNinth run39498246931 attempt1 FAIL: fullDB1944P43F52skip; story51=8P43F0skip (HTTP1P19F,commands1P14F,RLS2P10F,components4P). Sharedpolicy andINT015PASS. API019/RLS010FAIL with no later assertion credit. Reporter now exposes44 ordered leaves across43 failures, ALL scenario/unknown/unavailable; first original branches and all43 causes UNKNOWN. Safe await frames are not causal evidence. Browser17otherP14storyF28attempts, child1/teardownunverified/keycustody,28errorcontextrefs0body/contentNULLunqualified. Setup7/privacy4/DBreadychildren[0,1]/keydeletedconfirmed/closed/custodynull are separate positive observations.\nFinite unavailable/denied labels distinguish failed contracts, NOT collapsed backend SQL/proof/auth causes. Pre-guard seed/authority and upstream erased/swallowed/masked/unmapped failures may remain UNKNOWN. Ambiguous remaining outcome needs targeted cause-proof proposal, not opaque retry.\nActual67 boundedNodePASS0F0skip0cancel; type/lint0errors0warnings, kernel5760 unchanged, SRO58. Injected fixtures/extracted live source and synthetic installedJSON transport have0native acceptance credit. Current source runtime UNEXECUTED.\n\nCOMPLETE EXACT FOUR-PATH COMMITTED DELTA:\n`), diff];
const contexts = [];
function addSource(path, first = 1, last) {
  const oid = git(["rev-parse", `${head}:${path}`]).toString().trim(), blob = git(["cat-file", "blob", oid]), lines = blob.toString().split("\n");
  last ??= lines.length; const excerpt = Buffer.from(lines.slice(first - 1, last).join("\n") + "\n");
  chunks.push(Buffer.from(`\nEXACT COMMITTED SOURCE ${path} lines${first}-${last}:\n`), excerpt);
  contexts.push({ path, commit: head, blob_oid: oid, full_blob_bytes: blob.length, full_blob_sha256: sha(blob), included_lines: [first, last], included_lf_bytes: excerpt.length, included_lf_sha256: sha(excerpt) });
}
addSource(paths[2]);
const unit = git(["cat-file", "blob", `${head}:${paths[3]}`]).toString().split("\n");
const first = unit.findIndex(line => line.startsWith("let fixtureDiagnostics:")), last = unit.findIndex(line => line.startsWith('test("the actual allocated policy case rejects'));
if (first < 0 || last <= first) throw Error("Actual unit context boundary drift");
addSource(paths[3], first + 1, last);
for (const path of ["tests/integration/commands/calendar-feed.int.test.ts", "tests/integration/calendar-feed/public-feed.int.test.ts", paths[1]]) {
  const lines = git(["cat-file", "blob", `${head}:${path}`]).toString().split("\n"), start = lines.findIndex(line => line.startsWith('  test("[P0] 15.5-'));
  const end = lines.findIndex((line, index) => index > start && line === "  });");
  if (start < 0 || end <= start) throw Error("Actual first callback boundary drift"); addSource(path, 1, end + 1);
}
addSource("tests/support/bookings-atdd.ts", 187, 211);
for (const path of ["src/server/commands/calendar-feed/calendar-feed-db.ts", "src/server/commands/calendar-feed/manage-calendar-feed.ts"]) addSource(path);
const installed = [["node_modules/.pnpm/@vitest+runner@4.1.9/node_modules/@vitest/runner/dist/chunk-artifact.js", 3055, 3074], ["node_modules/.pnpm/@vitest+utils@4.1.9/node_modules/@vitest/utils/dist/error.js", 1, 44], ["node_modules/.pnpm/@vitest+utils@4.1.9/node_modules/@vitest/utils/dist/serialize.js", 1, 118], ["node_modules/.pnpm/vitest@4.1.9_@types+node@20_dd0c506e006b7a7a7c5015e13867d163/node_modules/vitest/dist/chunks/index.UpGiHP7g.js", 3522, 3629]].map(([path, first, last]) => {
  const raw = read(path), excerpt = Buffer.from(lf(raw).toString().split("\n").slice(first - 1, last).join("\n") + "\n");
  chunks.push(Buffer.from(`\nINSTALLED4.1.9 TRANSPORT ${path} lines${first}-${last}:\n`), excerpt);
  return { ...ref(path), included_lines: [first, last], included_lf_bytes: excerpt.length, included_lf_sha256: sha(excerpt) };
});
const boundMetadata = [`${folder}/local-checks.json`, `${folder}/author-route.json`, allocation.path].map(path => {
  const content = lf(read(path)); chunks.push(Buffer.from(`\nBOUND LOCAL CHECK/ROUTE/ROOT SCOPE ${path}:\n`), content);
  return { ...ref(path), included_lf_bytes: content.length, included_lf_sha256: sha(content) };
});
const statePath = "_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml", state = read(statePath), lines = lf(state).toString().split("\n");
const at = lines.findIndex(line => line.startsWith("selected_phase:")), end = lines.findIndex((line, i) => i >= at && line.startsWith("escalation_reason:"));
if (at < 0 || end < at || end - at > 12 || !lines[at].includes("review-native-owned-origin-latest-four")) throw Error("Root route unavailable");
const routeExcerpt = Buffer.from(lines.slice(at, end + 1).join("\n") + "\n");
chunks.push(Buffer.from(`\nROOT RECORDED REVIEW ROUTE; mutable raw snapshot UNVERIFIED_UNCREDITED, source excluded ${statePath}:\n`), routeExcerpt);
const input = Buffer.concat(chunks);
if (input.includes(Buffer.from("\r")) || input.length > 250_000) throw Error("Bounded LF packet required");
for (const binding of bindings) if (sha(read(binding.path)) !== binding.raw_sha256) throw Error("Source drift during freeze");
write("latest-fix-input.diff", input);
const frozen = { kind: "exact-committed-owned-origin-four-path-latest-fix-only", source_head: head, baseline: before, source_state: "EXACT_COMMITTED_APPEND_ONLY_FOUR_PATH_NO_SPEC_DRIFT", paths, bindings, input_bytes: input.length, input_sha256: sha(input), diff_bytes: diff.length, diff_sha256: sha(diff), contexts, installed, bound_metadata: boundMetadata, root_route: { path: statePath, mutable_raw_bytes_unverified_uncredited: state.length, mutable_raw_sha256_unverified_uncredited: sha(state), included_lines: [at + 1, end + 1], included_lf_bytes: routeExcerpt.length, included_lf_sha256: sha(routeExcerpt), source_commit_excluded: true }, ninth_failure: { run: 39498246931, attempt: 1, checkpoint: before, conclusion: "FAILURE", manifest: nativeManifest, Root_integrity_only_receipt: nativeAdmission, actual43causes: "UNKNOWN", valid_leaves: 44, actual_leaf_stage: "scenario", actual_leaf_category: "unknown", actual_leaf_sqlstate: null, current_native: "UNEXECUTED_PENDING_ROOT_EXACT_HEAD_CI", no_raw_native_output_included: true }, prior_capsule_immutable: ref(`${prep}/source-freeze-native-fixture-report-transport.json`), review_route: { model: "gpt-6.1-sol", effort: "high", distinct_context_free: true, completed_broad_rounds: 3, cap: 3, latest_serious_fix_only: true, fourth_broad_review: false }, kernel_bytes: Buffer.byteLength(kernel), kernel_sha256: sha(kernel), suggested_review_order_body_lf_sha256: sha(section[1]), literal_stops: 58, actual_separate_node_cases: 67, native_credit_for_controls: 0, local_checks: ref(`${folder}/local-checks.json`), preparation_generator: ref(`${folder}/prepare-input.mjs`), normalization: "Actual raw bytes, native Git --path clean OID, actual normalized/HEAD blob bytes separately checked; no assumed CRLF equality.", raw_input_single_0x20_context_lines: input.toString().split("\n").filter(line => line === " ").length, source_edits_after_freeze_allowed: false };
write("input-binding.json", JSON.stringify(frozen, null, 2) + "\n");
console.log(JSON.stringify({ source: head, input: ref(`${folder}/latest-fix-input.diff`), binding: ref(`${folder}/input-binding.json`), checks: ref(`${folder}/local-checks.json`), route: ref(`${folder}/author-route.json`), raw_input_single_0x20_context_lines: frozen.raw_input_single_0x20_context_lines }));
