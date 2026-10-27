import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5", folder = `${prep}/native-poll-query-settlement-review`;
const before = "33b595a8b7c001bd89788fb1c0e8cd9c626e03ec", source = "e3f1c2e1c5db81947a48233da617ff8535fd24aa";
const paths = ["_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md", "tests/e2e/support/calendar-feed-atdd.ts", "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts"];
const git = (args, input) => execFileSync("git", args, { input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const read = path => fs.readFileSync(path), sha = data => crypto.createHash("sha256").update(data).digest("hex"), lf = data => Buffer.from(data.toString().replaceAll("\r\n", "\n"));
const artifact = path => { const bytes = read(path); return { path, bytes: bytes.length, sha256: sha(bytes) }; };
if (git(["rev-parse", "HEAD"]).toString().trim() !== source) throw new Error("Exact committed source required");
if (git(["diff", "--name-only", before, source]).toString().trim().split("\n").sort().join("\n") !== [...paths].sort().join("\n")) throw new Error("Exact three paths required");
if (git(["diff", source, "--", ...paths]).length || git(["diff", "--cached", "--", ...paths]).length) throw new Error("Source changed after commit");
for (const name of ["latest-fix-input.diff", "input-binding.json", "local-checks.json"]) if (fs.existsSync(`${folder}/${name}`)) throw new Error("Preserve immutable input");
const sourceBinding = path => {
  const raw = read(path), normalized = lf(raw), clean = git(["hash-object", `--path=${path}`, "--stdin"], raw).toString().trim();
  const oid = git(["rev-parse", `${source}:${path}`]).toString().trim(), blob = git(["cat-file", "blob", oid]), baseline = git(["cat-file", "blob", `${before}:${path}`]);
  if (clean !== oid || git(["hash-object", "--no-filters", "--stdin"], normalized).toString().trim() !== clean || !blob.equals(normalized)) throw new Error("Raw/actual clean/blob mismatch");
  return { path, raw_bytes: raw.length, raw_sha256: sha(raw), actual_git_clean_oid: clean, git_clean_normalized_bytes: blob.length, git_clean_normalized_sha256: sha(blob),
    head_blob_oid: oid, head_blob_bytes: blob.length, head_blob_sha256: sha(blob), raw_equals_normalized: raw.equals(blob), baseline_blob_oid: git(["rev-parse", `${before}:${path}`]).toString().trim(), baseline_bytes: baseline.length, baseline_sha256: sha(baseline) };
};
const bindings = paths.map(sourceBinding), unchanged = ["scripts/ci/with-calendar-feed-runtime.mjs", "tests/support/calendar-feed-ci-contract.ts", "tests/e2e/calendar-feed.e2e.spec.ts"].map(path => {
  const row = sourceBinding(path); if (row.head_blob_oid !== row.baseline_blob_oid) throw new Error("Unallocated source changed"); return row;
});
const spec = git(["cat-file", "blob", `${source}:${paths[0]}`]).toString(), kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0], section = spec.split("## Suggested Review Order\n");
if (!kernel || sha(kernel) !== "0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977" || section.length !== 2) throw new Error("Frozen kernel/single trail required");
const checks = { kind: "actual-poll-query-settlement-author-checks", before, source, state: "Exact committed three-path append-only fix; no post-commit Spec/verdict mutation; Root metadata excluded.",
  commands: [
    { command: "node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=spec tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", passed: 51, failed: 0, skipped: 0, cancelled: 0, receipt_start: "81b2a1", receipt_completion: "12520e", limit: "47 retained +4 new pure/injected regressions, including actual installed1.61.1 polling helper with injected promises. No real SQL/browser/process signals/resources. Module-type and experimental-strip warnings emitted." },
    { command: "pnpm exec tsc --noEmit --incremental false", exit_code: 0, receipt_start: "54a242", receipt_completion: "83851c" },
    { command: "pnpm exec eslint tests/e2e/support/calendar-feed-atdd.ts tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", exit_code: 0, errors: 0, warnings: 0, receipt: "f23db9" },
    { command: "node scripts/verify/check-review-order.mjs <authorSpec>", exit_code: 0, sections: 1, literal_stops: 42, observed_errors: [] },
    { command: "git diff --check -- <exact3> / git diff --cached --check", exit_code: 0, receipts: ["fadd4e", "d1abb2"], unchanged_wrapper_pin_browserSpec: "0a8131" }
  ], intermediate: "Initial51 run50P1F only expected cancellation category after outer entry already removed. Corrected regression to require actual callback completion and original timeout retention; independent actual query drain remained enforced. No implementation relaxation. Final51/type/lint passed.",
  historical: { source: before, targeted_consumer_suite_actual: { passed: 326, failed: 0, skipped: 0, cancelled: 0, includes_bootstrap47: true, other_contracts: 279 }, reuse: "279 consumers unchanged; not rerun because wrapper/pin/workflow/enrollment unchanged. Do not infer330 or current native counts." },
  feature_inventory: { total: 95, node: 30, vitest: 51, browser: 14, bootstrap_separate_current: 51 }, kernel_sha256: sha(kernel), suggested_review_order_body_lf_sha256: sha(section[1]),
  SRO_normalization: "Body after exact heading LF through EOF; heading excluded, no trim, final newline retained.",
  limits: "Only pure helper source uniquely extracted with TypeScript stripping and installed polling helper execute locally. Full-helper alias plumbing/native DB/SQL/browser unexecuted. Six failed native histories preserved: latest14browserF/28attempts,51DBunexecuted,contentNULL/unavailable.33b preflight7+4/recovery1 old-head facts only. No app/privilege/workflow/INT015/key/lifecycle authority change; no native inference, build rerun, fourth broad review, push/runtime/DONE/delivery." };
fs.writeFileSync(`${folder}/local-checks.json`, JSON.stringify(checks, null, 2) + "\n", { flag: "wx" });
const diff = lf(git(["diff", "--no-ext-diff", "--binary", "--unified=18", before, source, "--", ...paths]));
const chunks = [Buffer.from(`LATEST-FINDING-ONLY EXACT COMMITTED THREE-PATH FIX; completed broad rounds3/cap3, no fourth broad.\nSource ${source}; baseline ${before}.\nPrior33b six-path High assessment found oneP2 actual-SQL-settlement defect and is NOTPASS; retained immutable input/report. Reuse unchanged assessment parts explicitly; this is not a new whole-source pass.\nReview only actual callback/query ownership beyond installed expect.poll deadline, synchronous registration/immediate returned-promise observers, close-before-snapshot/late factory denial, actual20sdrain/custody/noSQLAuthcleanup while pending, primary+allerrors. Preserve15spoll/matchers/physicalattempt/hash/audit assertions/HTTP completion/custody.\nWrapper/SHA-pin/browserSpec unchanged; no application/principal/privilege/newscope/runtime.51boundedunitsPASS0F0S0cancel,typePASS,lint0err0warn,SRO42/kernelPASS.326historical33b includes47+279; no330/nativecount inference.\nSix native failed histories preserved,14browserfailed/28attempts and51DBunexecuted; no contentprivacy/childkey lifecycle PASS.\n\nEXACT COMMITTED THREE-PATH DELTA:\n`), diff];
const helper = git(["cat-file", "blob", `${source}:tests/e2e/support/calendar-feed-atdd.ts`]);
chunks.push(Buffer.from("\nCOMPLETE CURRENT HELPER CONTEXT, retained caller/cleanup boundaries only, not a broad re-review:\n"), helper);
const contexts = [`${prep}/author-native-poll-query-settlement-route.json`, `${folder}/local-checks.json`, `${prep}/native-settlement-browser-review/original-review.md`,
  `${prep}/native-settlement-browser-review/original-review-attestation.json`, `${prep}/native-settlement-browser-review/input-binding.json`].map(path => {
  const raw = read(path), included = lf(raw); chunks.push(Buffer.from(`\nBOUND ROUTE/PRIOR NOTPASS FINDING/CHECKS CONTEXT: ${path}\n`), included);
  return { path, raw_bytes: raw.length, raw_sha256: sha(raw), included_lf_bytes: included.length, included_lf_sha256: sha(included) };
});
const installed = [["node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/lib/coreBundle.js", 4408, 4442], ["node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/matchers/expect.js", 12949, 12974]].map(([path, first, last]) => {
  const raw = read(path), excerpt = Buffer.from(lf(raw).toString().split("\n").slice(first - 1, last).join("\n") + "\n");
  chunks.push(Buffer.from(`\nACTUAL INSTALLED1.61.1 DEADLINE SEMANTICS: ${path} lines${first}-${last}\n`), excerpt);
  return { path, raw_bytes: raw.length, raw_sha256: sha(raw), included_lines: [first, last], included_lf_bytes: excerpt.length, included_lf_sha256: sha(excerpt) };
});
const statePath = "_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml", state = read(statePath), lines = lf(state).toString().split("\n");
const first = lines.findIndex(line => line.startsWith("selected_phase:")), last = lines.findIndex((line, i) => i >= first && line.startsWith("escalation_reason:"));
if (first < 0 || last < first || last - first > 12) throw new Error("Root route unavailable");
const route = Buffer.from(lines.slice(first, last + 1).join("\n") + "\n"); chunks.push(Buffer.from(`\nROOT ROUTE SNAPSHOT; raw mutable metadata unverified/uncredited, own pre-edit route separately bound: ${statePath}\n`), route);
const input = Buffer.concat(chunks); if (input.includes(Buffer.from("\r")) || input.length > 180_000) throw new Error("Bounded LF input required");
for (const row of bindings) if (sha(read(row.path)) !== row.raw_sha256) throw new Error("Source drift during freeze");
fs.writeFileSync(`${folder}/latest-fix-input.diff`, input, { flag: "wx" });
const binding = { kind: "post-cap-exact-committed-actual-query-settlement-finding-only", before, source_head: source, source_state: "EXACT_COMMITTED_THREE_PATH_APPEND_ONLY_FIX", completed_broad_rounds: 3, cap: 3, fourth_broad_review: false,
  input_bytes: input.length, input_sha256: sha(input), diff_bytes: diff.length, diff_sha256: sha(diff), paths, bindings, unchanged_prior_paths: unchanged, contexts, installed,
  complete_helper: { bytes: helper.length, sha256: sha(helper) }, composite: { prior_source: before, prior_assessment: "NOTPASS_ONE_P2", reused: "Unchanged portions of exact six-path assessment; no retrospective fullPASS.", current_scope: "Only3fixpaths and latest serious-finding/consequential regressions, not whole final source rereview." },
  root_route: { path: statePath, raw_bytes_unverified_uncredited_snapshot: state.length, raw_sha256_unverified_uncredited_snapshot: sha(state), included_lines: [first + 1, last + 1], included_lf_bytes: route.length, included_lf_sha256: sha(route), source_commit_excluded: true },
  review_route: { model: "gpt-6.1-sol", effort: "high", context_free: true, distinct_from_author: true, scope: "Actual-SQL-settlement latestfinding/fix-only follow-up; no fourth broad review." },
  normalization: "Raw actual bytes separately bound; actual --path clean OID equals unfiltered LF OID, HEAD OID and byte-equal native blob. No CRLF sameness assumed.", kernel_sha256: sha(kernel), suggested_review_order_body_lf_sha256: sha(section[1]), local_checks: artifact(`${folder}/local-checks.json`), native_limits: checks.limits };
fs.writeFileSync(`${folder}/input-binding.json`, JSON.stringify(binding, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ source, input: artifact(`${folder}/latest-fix-input.diff`), binding: artifact(`${folder}/input-binding.json`), checks: artifact(`${folder}/local-checks.json`) }));
