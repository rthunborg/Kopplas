import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5", folder = `${prep}/native-settlement-browser-review`;
const before = "fae644b5349744a531008e2224ca3a08d596836e", source = "33b595a8b7c001bd89788fb1c0e8cd9c626e03ec";
const original = "a84d2a521cfe055ea39d0f783d12571f6c14bb21";
const paths = ["_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md", "scripts/ci/with-calendar-feed-runtime.mjs",
  "tests/e2e/calendar-feed.e2e.spec.ts", "tests/e2e/support/calendar-feed-atdd.ts", "tests/support/calendar-feed-ci-contract.ts", "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts"];
const git = (args, input) => execFileSync("git", args, { input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const sha = value => crypto.createHash("sha256").update(value).digest("hex"), lf = value => Buffer.from(value.toString().replaceAll("\r\n", "\n"));
const read = path => fs.readFileSync(path), bind = path => { const raw = read(path); return { path, bytes: raw.length, sha256: sha(raw) }; };
const persist = (path, value) => {
  const bytes = Buffer.from(value);
  if (fs.existsSync(path)) { if (!read(path).equals(bytes)) throw new Error("Partial preparation changed: " + path); }
  else fs.writeFileSync(path, bytes, { flag: "wx" });
};
if (git(["rev-parse", "HEAD"]).toString().trim() !== source) throw new Error("Exact committed source required");
if (git(["diff", "--name-only", before, source]).toString().trim().split("\n").sort().join("\n") !== [...paths].sort().join("\n")) throw new Error("Six-path delta required");
if (git(["diff", source, "--", ...paths]).length || git(["diff", "--cached", "--", ...paths]).length) throw new Error("Source changed after commit");
for (const name of ["latest-delta-input.diff", "input-binding.json"]) if (fs.existsSync(`${folder}/${name}`)) throw new Error("Preserve immutable input");
const bindings = paths.map(path => {
  const raw = read(path), normalized = lf(raw), clean = git(["hash-object", `--path=${path}`, "--stdin"], raw).toString().trim();
  const oid = git(["rev-parse", `${source}:${path}`]).toString().trim(), blob = git(["cat-file", "blob", oid]), base = git(["cat-file", "blob", `${before}:${path}`]);
  if (clean !== oid || git(["hash-object", "--no-filters", "--stdin"], normalized).toString().trim() !== clean || !blob.equals(normalized)) throw new Error("Raw/actual clean/blob mismatch");
  return { path, raw_bytes: raw.length, raw_sha256: sha(raw), actual_git_clean_oid: clean, git_clean_normalized_bytes: blob.length, git_clean_normalized_sha256: sha(blob),
    head_blob_oid: oid, head_blob_bytes: blob.length, head_blob_sha256: sha(blob), source_committed: true, raw_equals_normalized: raw.equals(blob),
    baseline_blob_oid: git(["rev-parse", `${before}:${path}`]).toString().trim(), baseline_bytes: base.length, baseline_sha256: sha(base) };
});
const helper = "tests/e2e/support/calendar-feed-atdd.ts", oldHelper = git(["cat-file", "blob", `${original}:${helper}`]), finalHelper = git(["cat-file", "blob", `${source}:${helper}`]);
const oldComment = "Reuses withBookingFixture/FixtureUser/adminQuery; no host env file or", newComment = "Composes canonical role/profile/client fixtures locally; no host env file or";
if (finalHelper.toString().split(newComment).length !== 2 || finalHelper.toString().replace(newComment, oldComment) !== oldHelper.toString()) throw new Error("Only requested comment may differ after checks");
if (git(["rev-parse", "refs/heads/codex/epic-15-pre-review-a84d2a52"]).toString().trim() !== original) throw new Error("Root original retention ref mismatch");
const retained = [];
for (const [label, type, ref] of [["commit", "commit", original], ["root-tree", "tree", `${original}^{tree}`], ["tests-tree", "tree", `${original}:tests`],
  ["e2e-tree", "tree", `${original}:tests/e2e`], ["support-tree", "tree", `${original}:tests/e2e/support`], ["helper", "blob", `${original}:${helper}`]]) {
  const oid = git(["rev-parse", ref]).toString().trim(), payload = git(["cat-file", type, oid]), path = `${folder}/original-${label}-payload.bin`;
  const actualOid = crypto.createHash("sha1").update(Buffer.from(`${type} ${payload.length}\0`)).update(payload).digest("hex");
  if (actualOid !== oid) throw new Error("Native object payload binding failed");
  persist(path, payload); retained.push({ ...bind(path), git_object_type: type, git_object_oid: oid });
}
const commentDiff = git(["diff", "--no-ext-diff", "--binary", original, source, "--", helper]);
persist(`${folder}/original-to-final-comment.diff`, commentDiff);
const provenance = { original, original_committer_time: "2026-10-20T21:02:35+02:00", amended_source: source, amended_committer_time: "2026-10-20T21:03:07+02:00",
  sequence: "Parent explicitly agreed comment-only amend before freeze; amend completed before newer Root append-only instruction. No rewrite after that instruction. Root retained original via local branch only; no checkout/remote change.",
  retention_ref: "refs/heads/codex/epic-15-pre-review-a84d2a52", original_on_current_ancestry: false, original_reviewed: false, original_native_qualified: false,
  current_review_source_only: source, original_additional_author_commit_credit: false, exact_comment_only_equality: true, retained, comment_diff: bind(`${folder}/original-to-final-comment.diff`) };
persist(`${folder}/original-commit-provenance.json`, JSON.stringify(provenance, null, 2) + "\n");
const integration = JSON.parse(read(`${folder}/browser-integration-source-check.json`));
integration.comment_only_integration_after_checks = { final_helper: bindings.find(row => row.path === helper), normalized_executable_source_equal_after_single_comment_inversion: true, provenance: `${folder}/original-commit-provenance.json` };
fs.writeFileSync(`${folder}/browser-integration-source-check.json`, JSON.stringify(integration, null, 2) + "\n");
const spec = git(["cat-file", "blob", `${source}:${paths[0]}`]).toString(), kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];
if (!kernel || sha(kernel) !== "0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977") throw new Error("Kernel changed");
const section = spec.split("## Suggested Review Order\n"); if (section.length !== 2) throw new Error("One author trail required");
const checks = { kind: "author-bounded-settlement-browser-checks", source, before, source_state: "Exact committed six-path source; Root metadata separately dirty/excluded; no post-commit Spec verdict delta.",
  checks: [
    { command: "node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=spec tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", passed: 47, failed: 0, skipped: 0, cancelled: 0, receipt_start: "7d4d7d", receipt_completion: "4e8757", limit: "Actual injected stopper/full-wrapper and exact pure helper source-region execution, no managed resources/real signals/DB/browser. Node module-type and experimental strip warnings emitted." },
    { command: "node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=spec tests/unit/docs/acceptance-gate-report-validators.test.ts tests/unit/scripts/ci/checkpoint-dispatch.test.ts tests/unit/scripts/verify/ci-native-test-reports.test.ts tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts tests/unit/server/authz/command-enrollment.test.ts tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", passed: 326, failed: 0, skipped: 0, cancelled: 0, receipt_start: "d43535", receipt_completion: "e02b56", revision: source, limit: "Includes same47 wrapper cases, not additive;279 other contract-consumer cases. No story95 native acceptance credit." },
    { command: "pnpm exec tsc --noEmit --incremental false", exit_code: 0, receipt_start: "5a05f0", receipt_completion: "f831d0", dependency_reuse: "Executed before sole helper comment correction; actual executable source equality independently proved." },
    { command: "pnpm exec eslint scripts/ci/with-calendar-feed-runtime.mjs tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts tests/support/calendar-feed-ci-contract.ts tests/e2e/calendar-feed.e2e.spec.ts tests/e2e/support/calendar-feed-atdd.ts", exit_code: 0, errors: 0, warnings: 0, receipt: "ec4ae7", dependency_reuse: "Executed before sole helper comment correction; no executable source delta." },
    { command: "node scripts/verify/check-review-order.mjs <authorSpec>", exit_code: 0, sections: 1, stops: 40, receipt: "2beb44" },
    { command: "git diff --check -- <exact6> / git diff --cached --check", exit_code: 0, receipts: ["c5089d", "8c0233", "aaf5a5", "d10e83"], exact_index: "Original exact6 then sole requested helper comment before amend; Root metadata never staged." }
  ], kernel_sha256: sha(kernel), suggested_review_order_body_lf_sha256: sha(section[1]), suggested_review_order_hash_normalization: "Exclude heading line; body after exact ## Suggested Review Order LF delimiter through EOF; no trim, final newline retained.",
  intermediates: "Initial39cases37P2F arose from fake probe sequence assumptions; corrected fixtures without weakening implementation. Full helper import unsupported by existing alias hook directory shadow; no shared hook edits. @types/node20 lacks installed Node22 strip API; explicit typed namespace access fixed. One stale SRO line after final test insertion refreshed. Final47/type/lint and40stops passed.",
  counts: { feature: 95, feature_node: 30, feature_vitest: 51, feature_browser: 14, bootstrap_separate: 47, contract_suite_including_bootstrap: 326 },
  limits: "Pure source extraction uniquely bounded and TypeScript stripping only; no copied implementation/mocks. Full-helper plumbing and native caller behavior unexecuted locally. App/privilege/workflow/INT015 unchanged, no build rerun. Old native3105/Python43/recovery1 and setup7/privacy4 are bounded failed-head facts. Browser14F/28attempts,DB51unexecuted,body contentNULL/unavailable remain. No fourth broad review, push/runtime/DONE/delivery." };
persist(`${folder}/local-checks.json`, JSON.stringify(checks, null, 2) + "\n");
const diff = lf(git(["diff", "--no-ext-diff", "--binary", "--unified=16", before, source, "--", ...paths]));
const chunks = [Buffer.from(`POST-CAP EXACT COMMITTED SETTLEMENT/BROWSER DIAGNOSTIC DELTA ONLY; not a fourth broad review.\nSource ${source}; baseline ${before}; exact six admitted paths.\nLatest serious fixes only: valid captured identity/current-missing passive actual group absence within existing15/5/5 budgets; no anonymous signaling, latch absence, bounded done/output, reuse/mismatch/persistent group and COMMIT/cleanup/custody retained.\nBrowser same action predicates/physical assertions: immediately observed cancellable event/outer promises, independently joined native HTTP body completion+actual readback, released faults before settlement before SQL/Auth cleanup, canonical local fixture composition, closed diagnostics and all primary/cleanup failures. Timeout/cancel is not real settlement.\nNo app/principal/privilege/INT015/workflow/global recorder/attachment deletion changes. Preserve browser nonzero teardown fence and key custody.\nActual sixth native run39474891873 remainsFAIL: verify3105/Python43/recovery1 separatePASS, original source SupAdmin7+privacy4 nativepreflightPASS; DB build0 then identity/cleanup guard failure, native cause not proved. Browser14failed/28attempts+17otherpass,51DBcases unexecuted.28attachmentmetadata,0availablebodies/contentNULL,privacyunqualified.\n47boundedNodePASS0skip;326targetedincluding47PASS0skip;typePASS/lint0errors0warnings/kernel+SRO40PASS. Pure exact source-region tests are not full-helper or native browser proof. Current-source CI pending.\nOriginal a84 retained locally by Root and as native payload provenance, not reviewed/current/nativequalified/additionalancestry; current33b only. No Spec verdict drift after commit.\n\nEXACT SIX-PATH COMMITTED DIFF:\n`), diff];
const complete = [];
for (const path of ["scripts/ci/with-calendar-feed-runtime.mjs", helper, "tests/e2e/calendar-feed.e2e.spec.ts"]) {
  const blob = git(["cat-file", "blob", `${source}:${path}`]); chunks.push(Buffer.from(`\nCOMPLETE COMMITTED CHANGED-SCOPE CONTEXT: ${path}\n`), blob); complete.push({ path, bytes: blob.length, sha256: sha(blob) });
}
const packet = ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-fae644b5-ci-independent";
const contexts = [`${prep}/native-settlement-browser-author-route.json`, `${folder}/local-checks.json`, `${folder}/browser-integration-source-check.json`, `${folder}/original-commit-provenance.json`,
  `${packet}/native-qualification.md`, `${packet}/native-runtime-log-extracts.json`, `${packet}/native-browser-failure-reach.json`, `${packet}/native-browser-attachment-custody.json`, `${packet}/manifest.json`,
  ".env.epic15.mail-runtime/story-15-5-preparation/root-failed-fae644b5-packet-admission.json"].map(path => {
  if (path.endsWith("/native-browser-failure-reach.json")) {
    const record = { ...bind(path), included: false, reason: "Full bounded per-attempt catalog retained externally; safe aggregate native facts included in qualification/runtime summaries." };
    chunks.push(Buffer.from(`\nHASH-BOUND NATIVE FAILURE-REACH REFERENCE: ${JSON.stringify(record)}\n`)); return record;
  }
  const raw = read(path), included = lf(raw); chunks.push(Buffer.from(`\nBOUND CHECKS/ROUTE/SANITIZED NATIVE CONTEXT: ${path}\n`), included);
  return { path, raw_bytes: raw.length, raw_sha256: sha(raw), included_lf_bytes: included.length, included_lf_sha256: sha(included) };
});
const statePath = "_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml", state = read(statePath), lines = lf(state).toString().split("\n");
const first = lines.indexOf("selected_phase: review-native-settlement-browser-latest-delta"), last = lines.findIndex((line, index) => index >= first && line.startsWith("escalation_reason:"));
if (first < 0 || last < first || last - first > 12) throw new Error("Recorded Root High latest-delta route absent");
const route = Buffer.from(lines.slice(first, last + 1).join("\n") + "\n"); chunks.push(Buffer.from(`\nROOT LATEST-DELTA ROUTE SNAPSHOT: ${statePath} lines${first + 1}-${last + 1}; mutable raw observation not ownership/native proof\n`), route);
const input = Buffer.concat(chunks); if (input.includes(Buffer.from("\r")) || input.length > 330_000) throw new Error("Bounded LF input required");
for (const row of bindings) if (sha(read(row.path)) !== row.raw_sha256) throw new Error("Source changed during freeze");
fs.writeFileSync(`${folder}/latest-delta-input.diff`, input, { flag: "wx" });
const binding = { kind: "post-cap-exact-committed-owned-settlement-browser-diagnostic-delta-only", completed_review_rounds: 3, cap: 3, fourth_broad_review: false, before, source_head: source,
  source_state: "EXACT_COMMITTED_SIX_PATH_DELTA", paths, bindings, input_bytes: input.length, input_sha256: sha(input), diff_bytes: diff.length, diff_sha256: sha(diff), complete_contexts: complete, contexts,
  kernel_sha256: sha(kernel), suggested_review_order_body_lf_sha256: sha(section[1]), normalization: "Raw actual bytes separate; actual --path clean OID equals unfiltered LF OID, HEAD OID and actual byte-equal Git blob. No CRLF equivalence assumed.",
  root_route: { path: statePath, raw_bytes_unverified_uncredited_mutable_snapshot: state.length, raw_sha256_unverified_uncredited_mutable_snapshot: sha(state), included_lines: [first + 1, last + 1], included_lf_bytes: route.length, included_lf_sha256: sha(route), owner: "Root", source_commit_excluded: true },
  review_route: { model: "gpt-6.1-sol", effort: "high", context_free: true, distinct_from_author: true, scope: "Latest exact six-path delta/consequential regressions only, no fourth broad review." },
  provenance: bind(`${folder}/original-commit-provenance.json`), local_checks: bind(`${folder}/local-checks.json`), native_limits: checks.limits };
fs.writeFileSync(`${folder}/input-binding.json`, JSON.stringify(binding, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ source, input: bind(`${folder}/latest-delta-input.diff`), binding: bind(`${folder}/input-binding.json`), local_checks: bind(`${folder}/local-checks.json`), paths }));
