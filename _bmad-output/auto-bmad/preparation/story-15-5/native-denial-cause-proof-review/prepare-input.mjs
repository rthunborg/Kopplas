import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const folder = dirname(fileURLToPath(import.meta.url)), root = resolve(folder, "../../../../..");
const prep = "_bmad-output/auto-bmad/preparation/story-15-5/";
const source = "cb8d696d19c53e63be05ecb1ae273449af60efaf", base = "56324120f8e08de995e8cc7432ab27f2d0c98635";
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const git = (...args) => execFileSync("git", args, { cwd: root, windowsHide: true, timeout: 15000, maxBuffer: 12 * 1024 * 1024 });
if (git("rev-parse", "HEAD").toString().trim() !== source) throw new Error("Review source HEAD mismatch");
const grantPath = prep + "accepted-native-denial-cause-proof-allocation.json", grantRaw = readFileSync(resolve(root, grantPath));
if (sha(grantRaw) !== "99bcc94753e87bb3efcf7fec730c88da4059ca450a4548286f47dbf20fdc63d3") throw new Error("Allocation mismatch");
const paths = JSON.parse(grantRaw).exact_proposed_hunk_paths;
const changed = git("diff", "--name-only", base, source).toString().trim().split(/\r?\n/).sort();
if (paths.length !== 14 || JSON.stringify(changed) !== JSON.stringify([...paths].sort())) throw new Error("Latest delta is not exact14");
if (git("diff", "--cached", "--name-only").toString().trim() || git("diff", "--name-only", "HEAD", "--", ...paths).toString().trim()) throw new Error("Source/index not frozen");
const buffers = new Map();
function binding(path) {
  const raw = readFileSync(resolve(root, path));
  const oid = git("rev-parse", `${source}:${path}`).toString().trim(), baselineOid = git("rev-parse", `${base}:${path}`).toString().trim();
  const blob = git("cat-file", "blob", oid), baseline = git("cat-file", "blob", baselineOid);
  const clean = git("hash-object", `--path=${path}`, path).toString().trim();
  if (clean !== oid) throw new Error(`Frozen source bytes drifted: ${path}`);
  buffers.set(path, blob.toString("utf8"));
  return { path, raw: { bytes: raw.length, sha256: sha(raw) }, actual_git_clean_oid: clean,
    committed: { oid, bytes: blob.length, sha256: sha(blob) }, baseline: { oid: baselineOid, bytes: baseline.length, sha256: sha(baseline) },
    baseline_equal: oid === baselineOid, raw_equals_committed_blob: raw.equals(blob) };
}
const bindings = paths.map(binding);
const contextPaths = ["supabase/migrations/20261020220000_personal_calendar_feed.sql", "src/server/commands/envelope.ts", "src/server/commands/envelope-core.ts", "src/server/auth/resolve-tenant-context.ts", "src/server/auth/resolve-tenant-context-core.ts", "src/server/authz/permission-matrix.ts", "src/server/calendar-feed/attestation.ts", "tests/support/bookings-atdd.ts"];
const contexts = contextPaths.map(binding);
const installedPath = "node_modules/pg/lib/client.js", installedRaw = readFileSync(resolve(root, installedPath));
const pgManifest = readFileSync(resolve(root, "node_modules/pg/package.json"));
const installed = { path: installedPath, resolved_path: realpathSync(resolve(root, installedPath)), bytes: installedRaw.length, sha256: sha(installedRaw),
  manifest_path: "node_modules/pg/package.json", manifest_bytes: pgManifest.length, manifest_sha256: sha(pgManifest), version: JSON.parse(pgManifest).version,
  scope: "Current installed source READONLY context; no connect/query/driver operation executed by preparation." };
function reference(path, expected) {
  const b = readFileSync(resolve(root, path)); if (expected && sha(b) !== expected) throw new Error(`Dependency reference mismatch: ${path}`);
  return { path, bytes: b.length, sha256: sha(b), metadata_only_not_runtime_credit: true };
}
const references = [
  reference(grantPath),
  reference(prep + "accepted-native-denial-cause-proof-private-consumer-allocation.json", "3b6cb5ddbdc847ca9dfbd2e7ceb2b2e2418227b661b9d14447016a1aea530c00"),
  ...["manifest.json", "proposal.md", "contract-and-bindings.json", "result.json"].map(name => reference(prep + "native-denial-cause-proof-proposal-revision-1/" + name)),
  ...["original-report.md", "original-attestation.json", "result.json"].map(name => reference(prep + "native-denial-cause-proof-challenge/" + name)),
  ...["original-report.md", "original-attestation.json", "result.json"].map(name => reference(prep + "native-denial-cause-proof-revision-1-challenge/" + name)),
  ...["manifest.json", "plan.md", "result.json"].map(name => reference(prep + "native-denial-cause-proof-qualification-plan/" + name)),
  reference(".env.epic15.mail-runtime/story-15-5-preparation/root-cb8d696d-source-path-admission.json", "2de3f6130cf5bd78e0110f0618d74f2557cd51c9cdb0d09467cd36b67ae7fa88"),
  reference(".env.epic15.mail-runtime/story-15-5-preparation/root-failed-56324120-packet-admission.json", "34785381fc18743aeeb67f23517683c48e790509b0c0b15e3fc683bd927f2a0a"),
  reference(".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/native-qualification.json", "9fab0c5db825a7f2d2d49384a9f420c0ae246fb43a3d1476f4d760708c8883da"),
  reference(prep + "source-freeze-native-dependency-audit-repair.json", "fdf228c001e59f666cf362c5ee847513a90b101fb2c0188f5d8932a0d27912cd"),
];
const specPath = paths.find(path => path.endsWith(".md")), spec = buffers.get(specPath);
const kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];
if (!kernel || Buffer.byteLength(kernel) !== 5760 || sha(kernel) !== "0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977") throw new Error("Approved kernel mismatch");
const heading = "## Suggested Review Order";
if (spec.split(heading).length !== 2) throw new Error("Author review order not unique");
const reviewStops = [...spec.slice(spec.indexOf(heading)).matchAll(/`([^`]+):(\d+)` — `([^`]+)`/g)].map(match => {
  const text = readFileSync(resolve(root, match[1]), "utf8").replaceAll("\r\n", "\n");
  if (!text.split("\n")[Number(match[2]) - 1]?.includes(match[3])) throw new Error("Unverified Suggested Review Order stop");
  return { path: match[1], line: Number(match[2]), literal_anchor: match[3] };
});
if (reviewStops.length !== 79) throw new Error("Review stop inventory drift");
const commandPath = "tests/integration/commands/calendar-feed.int.test.ts", command = buffers.get(commandPath);
const normalAnchor = 'describe("15.5 authenticated lifecycle, atomic audit and commit-order"';
const baselineCommands = git("show", `${base}:${commandPath}`).toString("utf8");
const normalBodyUnchanged = command.slice(command.indexOf(normalAnchor)) === baselineCommands.slice(baselineCommands.indexOf(normalAnchor));
if (!normalBodyUnchanged) throw new Error("Ordinary15 command body/INT015 changed");
const route = {
  schema_version: 1, phase: "review-native-denial-cause-proof-committed-delta", role: "independent-sensitive-committed-native-cause-proof-delta-reviewer",
  model: "gpt-6.1-sol", effort: "high", recorded_by_root_before_dispatch: true, dispatch_owner: "Parent; author does not dispatch reviewer",
  source, base, scope: "Latest committed14 changed paths and consequential regressions; not a fourth broad story review", completed_broad_rounds: 3,
  requested_independence: "Fresh context-free reviewer; no author/reviewer role reuse", source_and_spec_frozen: true, verdict: "PENDING",
  no_source_or_spec_verdict_write_after_review: true, native_credit: 0,
};
const commonCommand = "node --experimental-strip-types --import ./tests/support/register.mjs --test ";
const seven = ["tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", "tests/unit/scripts/ci/checkpoint-dispatch.test.ts", "tests/unit/scripts/verify/ci-native-test-reports.test.ts", "tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts", "tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts", "tests/unit/docs/acceptance-gate-report-validators.test.ts", "tests/unit/server/authz/command-enrollment.test.ts"];
const checks = {
  kind: "AUTHOR_ACTUAL_LOCAL_CHECKS_NOT_NATIVE", source, base, checks_were_working_tree_before_commit: true,
  sequence: [
    { check: "initial wholeTypeScript", command: "pnpm exec tsc --noEmit --incremental false", exit: 1, errors: 4, reason: "Dispatcher result union inference after mode fields; explicit return-record annotation corrected it." },
    { check: "initial seven-file Node", command: commonCommand + seven.join(" "), exit: 1, total: 359, passed: 358, failed: 1, skipped: 0, cancelled: 0, reason: "Existing admitted actual-Bash harness lacked the3new false env defaults under set-u; corrected only checkpoint-dispatch.test.ts." },
    { check: "seven-file Node after correction", command: commonCommand + seven.join(" "), exit: 0, total: 361, passed: 361, failed: 0, skipped: 0, cancelled: 0, temporal_limit: "Precedes final status/envelope and source-registration controls. Other6consumer files unchanged afterward." },
    { check: "changed-file final Node", command: commonCommand + seven[0], exit: 0, total: 79, passed: 79, failed: 0, skipped: 0, cancelled: 0, retained_prior_controls: 67, native_credit: 0 },
    { check: "final wholeTypeScript", command: "pnpm exec tsc --noEmit --incremental false", exit: 0 },
    { check: "focused12 source ESLint", command: "pnpm exec eslint <12 allocated JS/TS files> --max-warnings 0", exit: 0, errors: 0, warnings: 0, later_affected3_lint: "helper/command-case/unit controls repeated after final changes, exit0/0warnings" },
    { check: "production build", command: "pnpm run build", exit: 0, scope: "Working-tree Next16.3.8 production build, no server. The3production modules did not change afterward; later diagnostic test/helper/Spec changes do not claim a new build run. No independently captured pre-build whole-source raw snapshot is invented." },
    { check: "incorrect bundle command", command: "pnpm run verify:no-service-role-client-bundle", exit: 1, reason: "No such script; no verification executed under that name." },
    { check: "actual built bundle gate", command: "pnpm run verify:bundle-containment", exit: 0 },
    { check: "native working and staged Git diffcheck", commands: ["git diff --check", "git diff --cached --check"], exit: 0, exact14_index_checked: true },
  ],
  no_inferred_combined_run: true, full_current_seven_file_364_run_executed: false,
  evidence_limits: ["Node controls use actual source regions/injected dependencies/installed reporter/driver construction and owned temporaryFS, not PG/JWT/HTTP/browser native acceptance.", "No native test collection/globalSetup/baseline/services/CI executed.", "No new audit or canonical whole lint scan; unchanged Vite/dependency graph and native11 audit/lint positives keep historical scope.", "Current diagnostic availability/private qualifier adoption and baseline native semantics remain unverified.", "No newly born private consumer is referenced or credited."],
  author_order: { section_count: 1, stop_count: 79, verified_stops: reviewStops, kernel_bytes: 5760, kernel_sha256: sha(kernel), status: "in-review" },
};
const context = {
  route, root_identity_metadata_only: { current_source_count: 70, current_raw_normalized_difference_count: 41, unchanged_paths_since_checkpoint: 56, changed: 14, delta_raw_normalized_differences: 5, author_commits: 17, root_commits: 11, ancestry: 28,
    receipt: references.find(row => row.path.endsWith("root-cb8d696d-source-path-admission.json")), not_runtime_or_semantic_proof: true },
  provenance: { source, base, exact14: paths, ordinary_command_body_and_INT015_unchanged: normalBodyUnchanged, raw_and_actual_git_blob_bindings_separate: true,
    root_report_state_dirty_excluded: true, global_worktree_clean_claim: false, mutable_root_raw_snapshot_not_resampled: true },
  acceptance: { diagnostic: "ZERO_ACCEPTANCE", current_managed_native: "UNEXECUTED", actual_DIAG001: "UNEXECUTED", former_43_db_causes: "UNPROVEN", former_14_browser_failures: "UNRESOLVED", all_11_failed_histories_preserved: true,
    no_engine_phase_claim: true, direct_SQL_is_new_controlled_call_not_original_JWT_session_proof: true,
    runtime_prerequisites: ["Fresh committed-delta High PASS", "Root freeze/push", "Separately born/reviewed private qualifier after pushed head", "Hosted default AND candidate input availability before sole POST", "Root-admitted exact run identity"],
    original_normal95_INT015_and_required_normal_gates_preserved: true },
  focus: ["Actual ALS erasure dataflow; same output/error/once-call behavior; absent-store privacy and closed context lifetime", "Actual command/SQL/HTTP/timer/child settlement versus driver timeout/outer test deadline; conditional fixture/key custody", "Qualified original setup and same-client restricted identity/owned claims/privacy before one selected UNMODIFIED baseline", "Unconditional rollback/reset, independent fresh qualification and source/owned-state comparison; all reaching primary/cleanup failures", "Exact single diagnostic case versus unchanged normal15/INT015; no skipped-normal-case artifact masquerade", "Mode/title/nonce/SHA/actor/attempt/status/legacy compatibility and default/candidate availability before POST", "Actual artifact report/receipt/missing/sensitive-content failure fences; full normal/pilot/recovery/browser/inverse preservation", "No native acceptance or SQL inner-cause inference from a label, setup authority, controlled replay or zero-acceptance run"],
  references, checks: "local-checks.json", no_author_source_changes_in_preparation: true,
};
const diff = git("diff", "--no-ext-diff", "--no-color", base, source, "--", ...paths);
const chunks = ["# Fresh committed latest14 cause-proof review\n\nRead the entire exact diff and relevant source context. Report consequential introduced reachable defects and unresolved serious gaps only. Verify downstream enforcement before alleging a missing guard. This is an independent latest-delta review after3completed broad rounds, not a fourth broad review. No source writes, native execution, queries/probes/resources/CI actions or acceptance claims.\n\n", "## Review route/context\n\n", JSON.stringify(context, null, 2), "\n\n## Recorded actual check limits\n\n", JSON.stringify(checks, null, 2), "\n\n## Exact native Git committed diff (untrimmed)\n\n", diff];
function add(label, text) { chunks.push(`\n\n## ${label}\n\n`, text); }
function full(path) { add(`Full committed source: ${path}`, buffers.get(path)); }
function range(path, from, to, text = buffers.get(path)) {
  const rows = text.split("\n"); add(`Committed source context ${path}:${from}-${Math.min(rows.length,to)}`, rows.slice(from - 1, to).map((line,i) => `${from+i}: ${line}`).join("\n") + "\n");
}
for (const path of ["src/server/commands/calendar-feed/calendar-feed-db.ts", "src/server/commands/calendar-feed/manage-calendar-feed.ts", "src/server/read-models/calendar-feed.ts", "tests/support/calendar-feed-atdd.ts", commandPath, "scripts/ci/with-calendar-feed-runtime.mjs", "scripts/ci/checkpoint-dispatch.mjs", "tests/support/calendar-feed-ci-contract.ts", "tests/unit/scripts/ci/checkpoint-dispatch.test.ts", "tests/unit/scripts/verify/ci-native-test-reports.test.ts", "tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts"]) full(path);
range(".github/workflows/ci.yml",1,310); range(".github/workflows/ci.yml",470,595); range(".github/workflows/ci.yml",675,810);
const unit = "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts", unitText = buffers.get(unit);
range(unit,1,124); range(unit,660,746);
const newControlLine = unitText.slice(0,unitText.indexOf("const diagnosticEnv=")).split("\n").length;
range(unit,newControlLine,unitText.split("\n").length);
add("Approved unchanged intent",kernel);
add("Full current staged author trail and single Suggested Review Order",spec.slice(spec.indexOf("## Staged denial cause-proof implementation")));
full("supabase/migrations/20261020220000_personal_calendar_feed.sql");
range("src/server/commands/envelope-core.ts",150,290); range("src/server/commands/envelope.ts",215,285);
range("src/server/auth/resolve-tenant-context.ts",76,245); range("src/server/auth/resolve-tenant-context-core.ts",50,180);
full("src/server/calendar-feed/attestation.ts"); range("src/server/authz/permission-matrix.ts",1,160);
range("tests/support/bookings-atdd.ts",187,213);
range(installedPath,368,439,installedRaw.toString("utf8")); range(installedPath,603,625,installedRaw.toString("utf8")); range(installedPath,734,770,installedRaw.toString("utf8"));
add("Frozen revised design (not implementation or native credit)",readFileSync(resolve(root,prep+"native-denial-cause-proof-proposal-revision-1/proposal.md"),"utf8").replaceAll("\r\n","\n"));
add("Frozen qualification plan (private consumer unborn until later gates)",readFileSync(resolve(root,prep+"native-denial-cause-proof-qualification-plan/plan.md"),"utf8").replaceAll("\r\n","\n"));
const input = Buffer.concat(chunks.map(chunk => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk,"utf8")));
if (input.length > 650_000) throw new Error(`Preparation size stop: ${input.length}; no review credit`);
const write = (name, data) => writeFileSync(resolve(folder,name),Buffer.isBuffer(data) ? data : typeof data === "string" ? data : JSON.stringify(data,null,2)+"\n",{flag:"wx"});
write("latest.diff",diff); write("review-input.md",input); write("local-checks.json",checks); write("route-context.json",context);
const prepareRaw = readFileSync(fileURLToPath(import.meta.url));
const inputs = ["review-input.md","latest.diff","local-checks.json","route-context.json"].map(name => { const b = readFileSync(resolve(folder,name)); return {path:relative(root,resolve(folder,name)).replaceAll("\\","/"),bytes:b.length,sha256:sha(b)}; });
const bindingRecord = { schema_version:1,kind:"EXACT_COMMITTED_REVIEW_INPUT_BINDING",source,base,route,bindings,context_bindings:contexts,installed_context:installed,
  input_files:inputs,preparation_producer:{path:relative(root,fileURLToPath(import.meta.url)).replaceAll("\\","/"),bytes:prepareRaw.length,sha256:sha(prepareRaw)},
  producer_lint:{command:"pnpm exec eslint "+relative(root,fileURLToPath(import.meta.url)).replaceAll("\\","/")+" --max-warnings 0",exit:0,errors:0,warnings:0},
  context_encoding:"Committed actual Git blob UTF8/LF source, numbered ranges where stated; native Git diff untrimmed. Raw worktree bytes are separately bound and are not assumed equal.",
  raw_input_single_0x20_lines:input.toString("utf8").split("\n").filter(line=>line===" ").length,
  normal_command_body_unchanged:normalBodyUnchanged, references, verdict:"PENDING", native_credit:0 };
write("input-binding.json",bindingRecord);
for (const row of [...inputs, {path:relative(root,resolve(folder,"input-binding.json")).replaceAll("\\","/"),bytes:readFileSync(resolve(folder,"input-binding.json")).length,sha256:sha(readFileSync(resolve(folder,"input-binding.json")))}]) console.log(JSON.stringify(row));
console.log(JSON.stringify({raw_input_single_0x20_lines:bindingRecord.raw_input_single_0x20_lines,exact_changed_paths:bindings.length,delta_raw_normalized_differences:bindings.filter(row=>!row.raw_equals_committed_blob).length,normal15_INT015_body_unchanged:normalBodyUnchanged,source_and_index_still_frozen:!git("diff","--cached","--name-only").toString().trim()&&!git("diff","--name-only","HEAD","--",...paths).toString().trim()}));
