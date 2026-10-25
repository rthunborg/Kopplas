import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const root = "C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5";
const privatePrep = ".env.epic15.mail-runtime/story-15-5-preparation";
const source = "e472741a91f58c5ef9e623720e2bba0d1164c360";
const previousSource = "3383a1eb4607ddea035e79fb8433dc89a5137530";
const checkpoint = "e91b366b8b362f8ffbd867940dfe1cd2d817e72b";
const base = "3a1c3bc9fbf22b13c926179288a8b6eefe440c12";
const output = `${prep}/source-freeze-native-privacy-preflight.json`;
const read = p => fs.readFileSync(path.isAbsolute(p) ? p : path.join(root, p));
const json = p => JSON.parse(read(p));
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const git = (args, input) => execFileSync("git", args, { cwd: root, input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const assert = (condition, label) => { if (!condition) throw new Error(label); };
const ref = p => { const data = read(p); return { path: p, bytes: data.length, sha256: sha(data) }; };
const treeCache = new Map();
const blobOid = (rev, p) => {
  if (!treeCache.has(rev)) treeCache.set(rev, new Map(git(["ls-tree", "-r", "-z", rev]).toString().split("\0").filter(Boolean).map(row => {
    const tab = row.indexOf("\t"); return [row.slice(tab + 1), row.slice(0, tab).split(" ")[2]];
  })));
  return treeCache.get(rev).get(p) ?? null;
};
const blobCache = new Map();
const blob = oid => { if (!blobCache.has(oid)) blobCache.set(oid, git(["cat-file", "blob", oid])); return blobCache.get(oid); };
const commit = rev => ({ commit: rev, subject: git(["show", "-s", "--format=%s", rev]).toString().trim(),
  changed_paths: git(["diff-tree", "--no-commit-id", "--name-only", "-r", rev]).toString().trim().split("\n").filter(Boolean) });
assert(!fs.existsSync(path.join(root, output)), "Immutable fifth capsule already exists");
assert(git(["rev-parse", "HEAD"]).toString().trim() === source, "Expected held source HEAD");
const predecessorNames = [
  ["source-freeze.json", "2d1e982a10701831a71b8da9cf13ac03234b41499ad525bb8d84464910094e03"],
  ["source-freeze-ci-repair.json", "8c6a67b9d4ba912311d888a2a63b1e7e628803395b791367e0b68c31d25072a7"],
  ["source-freeze-native-sql-repair.json", "3a4391820a34d7b9feca705d329e19eb2d7a5060f29edcfe53d5a7294c7a4c65"],
  ["source-freeze-native-setup-diagnostic.json", "0665da8a44b228583e2dfbd81be3266d6d7cfcd465b6558b7295c1ebfaeb7ee5"],
];
const predecessors = predecessorNames.map(([name, hash]) => { const item = ref(`${prep}/${name}`); assert(item.sha256 === hash, "Immutable predecessor changed"); return item; });
const f = json(predecessors[3].path);
const historicalFourthRootSnapshot = f.git.root_metadata_snapshot;
f.schema_version = 5;
f.kind = "author-source-freeze-native-privacy-preflight-checkpoint-admission-candidate";
f.prepared_at_utc = new Date().toISOString();
f.schema_changes = [
  "v5 separates historical mutable Root raw observations (UNVERIFIED_UNCREDITED, baseline Git blobs only) from independently frozen artifact references.",
  "v5 verifies3383 working-tree review and declared Spec metadata against actual historical3383 Git objects, never against current changed files.",
  "Current e472 review covers the exact committed four-path delta including Spec; no post-review Spec metadata drift.",
  "Adds fourth failed native packet and source equality, ninth author commit/fourth excluded Root commit, wrapper30 and current31-stop trail; all prior capsules immutable.",
];
f.immutable_predecessors = predecessors;
f.git.source_head = source;
f.git.source_tree_oid = git(["rev-parse", `${source}^{tree}`]).toString().trim();
f.git.source_commits.push(commit(source));
f.git.root_bookkeeping_commits_excluded.push(commit(checkpoint));
const sourcePaths = [...new Set(f.git.source_commits.flatMap(c => commit(c.commit).changed_paths))].sort();
assert(sourcePaths.length === 67 && JSON.stringify(sourcePaths) === JSON.stringify([...f.git.source_paths].sort()), "67-path/9-commit union mismatch");
assert(f.git.source_commits.length === 9 && f.git.root_bookkeeping_commits_excluded.length === 4, "Commit attribution count mismatch");
for (const c of f.git.root_bookkeeping_commits_excluded) assert(!commit(c.commit).changed_paths.some(p => sourcePaths.includes(p)), "Root commit overlaps author source set");
for (const command of [["diff", "--name-only"], ["diff", "--cached", "--name-only"]])
  assert(!git(command).toString().trim().split("\n").some(p => sourcePaths.includes(p)), "Author source not clean");
f.git.bindings = sourcePaths.map(p => {
  const raw = read(p), oid = git(["hash-object", `--path=${p}`, "--stdin"], raw).toString().trim();
  assert(oid === blobOid(source, p), "Actual Git clean source differs from HEAD");
  const normalized = blob(oid), baselineOid = blobOid(base, p), baseline = baselineOid ? blob(baselineOid) : null;
  const crlf = (raw.toString().match(/\r\n/g) ?? []).length, lf = (raw.toString().match(/\n/g) ?? []).length;
  return { path: p, raw_worktree: { bytes: raw.length, sha256: sha(raw), crlf_count: crlf, bare_lf_count: lf - crlf },
    git_clean_normalized: { bytes: normalized.length, sha256: sha(normalized), blob_oid: oid, matches_head: true },
    head_blob: { oid, bytes: normalized.length, sha256: sha(normalized) },
    baseline_blob: baseline ? { oid: baselineOid, bytes: baseline.length, sha256: sha(baseline) } : null,
    git_attributes: git(["check-attr", "--all", "--", p]).toString().trim().split("\n").filter(Boolean) };
});
f.git.source_paths = sourcePaths;
f.git.raw_normalized_difference_paths = f.git.bindings.filter(b => b.raw_worktree.sha256 !== b.head_blob.sha256).map(b => b.path);
for (const [key, field] of [["normalized_source_path_set_sha256", "head_blob"], ["raw_source_path_set_sha256", "raw_worktree"]])
  f.git[key] = sha(JSON.stringify(f.git.bindings.map(b => ({ path: b.path, bytes: b[field].bytes, sha256: b[field].sha256 }))));
f.git.source_path_set_hash_encoding = "UTF8 JSON.stringify of sorted [{path,bytes,sha256}], no newline; raw and actual-clean HEADblob manifests separate.";
f.git.new_source_paths_since_previous_freeze = [];
f.git.source_worktree_and_index_clean = true;
f.git.global_tracked_worktree_clean = false;
f.git.observed_root_owned_dirty_or_untracked = git(["status", "--short"]).toString().trimEnd().split("\n");
f.git.root_metadata_snapshot = {
  schema: "observations-not-frozen-raw-artifacts", owner: "Root bookkeeping; excluded from author commits",
  historical_fourth_capsule: historicalFourthRootSnapshot.files.map(row => {
    assert(blobOid(previousSource, row.path) === row.head_blob, "Historical Root baseline blob mismatch");
    return { metadata_path: row.path, observed_raw_bytes_uncredited: row.bytes, observed_raw_sha256_uncredited: row.sha256,
      status: "UNVERIFIED_UNCREDITED_HISTORICAL_MUTABLE_RAW_OBSERVATION", historical_baseline_head: previousSource,
      baseline_blob_oid_verified: row.head_blob, baseline_blob_only_credited: true, raw_bytes_durably_captured: false };
  }),
  current: ["_bmad-output/auto-bmad/state/15-5-personal-calendar-feed-adr-b004-surface-1.yaml", "_bmad-output/auto-bmad/state/epic/epic-15.yaml", "_bmad-output/auto-bmad/reports/epic-15.md"].map(p => ({
    metadata_path: p, observed_raw_bytes_uncredited: read(p).length, observed_raw_sha256_uncredited: sha(read(p)),
    status: "UNVERIFIED_UNCREDITED_MUTABLE_RAW_OBSERVATION", baseline_head: source, baseline_blob_oid_verified: blobOid(source, p),
    baseline_blob_only_credited: true, raw_bytes_durably_captured: false })),
  limit: "Mutable working Root bytes are observations only, not artifact integrity claims. Frozen current authorization excerpts/receipts have separate artifact refs. No global clean-tree claim.",
};
const sourceBindings = new Map(f.git.bindings.map(b => [b.path, b]));
for (const section of [f.ownership.historical_migrations.bindings, f.ownership.protected_scheduling_and_consumer_paths])
  for (const row of section) { assert(blobOid(base, row.path) === row.baseline_blob_oid && blobOid(source, row.path) === row.head_blob_oid && row.baseline_blob_oid === row.head_blob_oid, "Protected historical source changed"); }
const baseTree = git(["ls-tree", "-r", "-z", base]).toString().split("\0").filter(Boolean).map(row => { const tab = row.indexOf("\t"); return { path: row.slice(tab + 1), oid: row.slice(0, tab).split(" ")[2] }; });
const oldPrep = baseTree.filter(row => row.path.startsWith(`${prep}/`));
assert(oldPrep.length === 69 && oldPrep.every(row => blobOid(source, row.path) === row.oid), "Historical69 preparation changed");
assert(f.ownership.historical_migrations.bindings.length === 109 && f.ownership.protected_scheduling_and_consumer_paths.length === 37, "Protected counts mismatch");
f.ownership.successor_revalidation.source_head = source;
f.ownership.successor_revalidation.privacy_preflight_author_route = ref(`${prep}/author-native-privacy-preflight-route.json`);
f.ownership.successor_revalidation.shared_additive_reuse_bindings = f.ownership.successor_revalidation.shared_additive_reuse_bindings.map(row => {
  const current = blobOid(source, row.path); assert(current === row.current_blob, "Shared additive source changed");
  return { ...row, source3383_blob: blobOid(previousSource, row.path), current_blob: current, unchanged: true };
});
const specPath = f.approved_intent.spec, spec = blob(sourceBindings.get(specPath).head_blob.oid).toString();
const kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];
assert(sha(kernel ?? "") === f.approved_intent.kernel_sha256 && (spec.match(/^## Suggested Review Order$/gm) ?? []).length === 1, "Frozen kernel/one author SRO mismatch");
const sro = spec.split("## Suggested Review Order\n")[1];
const stops = [...sro.matchAll(/^- `([^`]+):(\d+)` — `([^`]+)`/gm)].map(([, p, line, anchor]) => {
  assert(read(p).toString().replaceAll("\r\n", "\n").split("\n")[Number(line) - 1]?.includes(anchor), "Author stop mismatch");
  return { path: p, line: Number(line), literal_anchor: anchor, verified: true };
});
assert(stops.length === 31, "Author31 stops mismatch");
// Historical review applies to historical3383 objects, not changed e472 files.
const oldReview = f.independent_review.native_setup_diagnostic_latest_delta_only;
const oldBinding = json(oldReview.input_binding.path), oldMetadata = json(oldReview.spec_post_review_metadata.artifact.path);
const oldCodeProofs = oldBinding.bindings.filter(b => b.path !== specPath).map(b => {
  const oid = blobOid(previousSource, b.path), data = blob(oid);
  assert(oid === b.git_clean_oid && sha(data) === b.git_clean_normalized_sha256 && sha(data) === b.raw_sha256, "Historical3383 reviewed code binding mismatch");
  return { path: b.path, historical_source: previousSource, reviewed_raw_sha256: b.raw_sha256, historical_blob_oid: oid,
    historical_blob_sha256: sha(data), historical_raw_equals_clean_for_these_three: true, verified: true, current_file_not_used: true };
});
const historicalSpec = blob(blobOid(previousSource, specPath)).toString();
assert(historicalSpec.split(oldMetadata.added_text).length === 2, "Historical3383 Spec metadata not uniquely invertible");
const reviewedSpec = historicalSpec.replace(oldMetadata.added_text, "");
assert(sha(historicalSpec) === oldMetadata.final_spec_raw_sha256 && sha(reviewedSpec) === oldMetadata.reviewed_spec_raw_sha256
  && sha(historicalSpec.split("## Suggested Review Order\n")[1]) === oldMetadata.suggested_review_order_sha256, "Historical3383 Spec inversion failed");
delete oldReview.committed_three_code_paths_match_reviewed_working_bindings;
oldReview.historical_three_code_paths_verified_against3383_objects = oldCodeProofs;
oldReview.historical_spec_metadata_inversion_verified = { source: previousSource, final_blob_oid: blobOid(previousSource, specPath), final_sha256: sha(historicalSpec), reviewed_sha256: sha(reviewedSpec), current_spec_not_used: true };
oldReview.temporal_limit = "Historical working-tree review applies only to3383-era reviewed bytes plus separately declared Spec metadata. No equality claim to current changed e472 files.";
const reviewDir = `${prep}/native-privacy-preflight-review`;
const binding = json(`${reviewDir}/input-binding.json`), attestation = json(`${reviewDir}/original-review-attestation.json`);
const report = ref(`${reviewDir}/original-review.json`);
assert(report.bytes === 4496 && report.sha256 === "b5e330883edfa94091f1ce74487cc15c36f93377f2a2d13c55eb1e8b693b8f16", "Exact original High review mismatch");
assert(ref(`${reviewDir}/original-review-attestation.json`).sha256 === "e975d0072995385a496f776854e19b3b2e3bf129c813145b6cd445dfe69604e6", "Exact High attestation mismatch");
assert(binding.source_head === source && attestation.original_review_route.verdict === "PASS" && attestation.original_review_route.findings === 0 && attestation.source_head_observed_at_original_review_end === source, "Current exact committed review verdict mismatch");
for (const b of binding.bindings) { const current = sourceBindings.get(b.path); assert(current.raw_worktree.sha256 === b.raw_sha256 && current.head_blob.oid === b.head_blob_oid && current.head_blob.sha256 === b.head_blob_sha256, "Current committed review byte mismatch"); }
f.independent_review.native_privacy_preflight_latest_delta_only = { committed_source_head: source, baseline_head: checkpoint,
  reviewed_source_state: "EXACT_COMMITTED_FOUR_PATH_DELTA", reviewed_source_is_head: true, verdict: "PASS", findings: 0,
  model: "gpt-6.1-sol", effort: "high", context_free: true, distinct_from_author: true, not_a_fourth_broad_round: true,
  input: ref(`${reviewDir}/latest-delta-input.diff`), input_binding: ref(`${reviewDir}/input-binding.json`), original_report: report,
  attestation: ref(`${reviewDir}/original-review-attestation.json`), all_four_committed_path_bindings_match: true,
  post_review_spec_metadata_delta: false, exact_current_spec_byte_review_claim: true, runtime_credit: false };
f.author_trail = { path: specPath, exactly_one_section: true, verified_stops: 31, stops,
  section_hash_definition: "UTF8 LF bytes after exact heading plus terminating LF; no trim, preserve all section/EOF newlines", suggested_review_order_sha256: sha(sro),
  temporal_note: "Current exact committed four-path High review includes this Spec/SRO. No post-review source/Spec mutation. Prior3383 working-tree review and Spec inversion separately historical." };
for (const item of f.inventory.files) { const p = item.path; assert(blobOid(source, p) === blobOid(previousSource, p), "Feature source changed during wrapper-only repair"); for (const id of item.prepared_literal_case_ids) assert(read(p).includes(id), "Prepared feature ID dropped"); }
const bootstrap = f.inventory.bootstrap_unit_cases_separate;
bootstrap.count = 30;
bootstrap.boundary = "Injected process/DB lifecycle plus real installed unconnected pg client startup serialization; no native connection/lifecycle proof.";
bootstrap.new_privacy_preflight_cases = ["explicit USERSET startup excludes ambient PGOPTIONS", "malformed/unsafe exact-four facts block all secrets", "same client gating with diagnostic-only principal/SET authority", "sanitized query/close failures preserve both outcomes"];
delete bootstrap.actual_latest_focused_batch_includes_all26;
bootstrap.actual_latest_focused_batch_includes_all30 = true;
assert((read(bootstrap.path).toString().match(/^test\(/gm) ?? []).length === 30, "Actual bootstrap30 declarations mismatch");
f.inventory.declaration_count_reuse = "Feature95 source unchanged sincea76/3383; original83/prepared IDs retained. Four new separate bootstrap cases26->30 executed locally. Native65 feature bodies remain unexecuted.";
f.inventory.feature_source_blobs_unchanged_since_previous_freeze = true;
const priorChecks = f.actual_verification;
f.actual_verification = { current_checks_artifact: ref(`${reviewDir}/local-checks.json`), current_checks: json(`${reviewDir}/local-checks.json`).checks,
  source_during_checks: "Exact final four-path working code/test delta againste91b, committed toe472 before review. Spec-only author trail change after static code checks; review validates final committed Spec; no post-review drift.",
  historical_local_checks_reference: predecessors[3], historical_reuse_limit: "Prior local302/build/type/lint and four native packets remain only at recorded sources. App/feature source unchanged by wrapper repair; current wrapper/pin/tests changed. No whole-scope PASS or current-head fullunit/build/native claim. Exact-head CI required.",
  prior_current_check_count: priorChecks.current_checks.length, new_native_ci_dispatched: false, local_sql_or_native_runtime_executed: false, no_resources_or_runtime_qualification_commands_executed: true };
const packet = `${privatePrep}/checkpoint-e91b366b-ci-independent`, manifest = json(`${packet}/manifest.json`);
assert(manifest.count === 18 && manifest.files.length === 18, "Fourth packet18 inventory mismatch");
const packetFiles = manifest.files.map(row => { const item = ref(path.join(root, packet, row.path).replaceAll("\\", "/")); assert(item.bytes === row.bytes && item.sha256 === row.sha256, "Fourth failed packet file mismatch"); return item; });
const equality = sourcePaths.map(p => { const old = blobOid(previousSource, p), failed = blobOid(checkpoint, p); assert(old === failed, "Fourth failed checkpoint source equality mismatch"); return { path: p, source3383_blob: old, failede91b_blob: failed, sha256: sha(blob(old)) }; });
const native = json(`${packet}/native-runtime-log-extracts.json`);
const failedRuntimeJobs = native.jobs.filter(job => ["db", "e2e"].includes(job.job));
assert(failedRuntimeJobs.length === 2 && failedRuntimeJobs.every(job => job.lifecycle.length === 1 && job.lifecycle[0].diagnostics[0].stage === "database-connect" && job.lifecycle[0].diagnostics[0].sqlState === "42501" && job.lifecycle[0].keyOutcome === "not-attempted"), "Fourth native diagnostic mismatch");
f.failed_checkpoint_histories.push({ head: checkpoint, source_equal_to3383: true, source_equality_bindings: equality,
  run_id: 39464940677, attempt: 1, conclusion: "FAILURE", unit: { total: 3098, passed: 3098, failed: 0, skipped: 0, cancelled: 0 },
  other_verify: { python_passed: 43, build: "PASS", bundle_guard: "PASS" }, feature_node_subset: { passed: 30, failed: 0, skipped: 0 },
  bootstrap_subset_separate: { passed: 26, failed: 0, skipped: 0 }, all_three_starts_resets_migration_compile: "PASS_ENGINE_REACH",
  recovery_separate_from_feature95: { cases: 1, passed: 1, failed: 0, pending: 0, same_restored_target_effective_public_CREATE: false,
    physical_storage_bytes_info_protected_rows_overwrite_denial: "QUALIFIED_NATIVE_PASS", artifact_receipt: ref(path.join(root, packet, "artifact-native-isolated-storage-recovery-extraction.json").replaceAll("\\", "/")) },
  db_browser_wrapper: { outcome: "FAILED_NATIVE_DATABASE_CONNECT_PRIVILEGE", stage: "database-connect", category: "insufficient-privilege", sqlState: "42501", keyOutcome: "not-attempted", ready: false, childExitCodes: [], dbClosed: true, denied_parameter: "UNKNOWN", connected_principal_and_effective_settings: "UNOBSERVED" },
  remaining_feature_native: { vitest: 51, browser: 14, total_unexecuted: 65 }, api_execution_artifact_count: 0,
  absolute_packet_directory: path.join(root, packet).replaceAll("\\", "/"), manifest: ref(path.join(root, packet, "manifest.json").replaceAll("\\", "/")), packet_files: packetFiles,
  root_admission: ref(path.join(root, privatePrep, "root-failed-e91b-packet-admission.json").replaceAll("\\", "/")),
  qualified_assertion_reach_artifact: ref(path.join(root, packet, "native-assertion-reach.json").replaceAll("\\", "/")),
  whole_scope_reuse: false, limit: "Actual42501 applies only to this fourth run. It identifies no denied parameter or effective settings. Separate recovery1/installed3partition passes are bounded;65 feature bodies unexecuted. Earlier generic native failures remain generic." });
const rootIdentity = ref(path.join(root, privatePrep, "root-e472-source-path-admission.json").replaceAll("\\", "/"));
assert(rootIdentity.sha256 === "15bba4a76c4f0c339d69f4b08fd574aca0246eabf83ee78c46ac4a3e9630dcb4", "Root e472 identity receipt mismatch");
f.current_frozen_artifact_references = [rootIdentity, ...["latest-delta-input.diff", "input-binding.json", "original-review.json", "original-review-attestation.json", "local-checks.json"].map(name => ref(`${reviewDir}/${name}`)), ref(`${prep}/author-native-privacy-preflight-route.json`)];
f.pending_native_execution.new_head = source;
f.pending_native_execution.note = "Currente472 native CI not dispatched. Fourth e91b verify3098/Python43/build/recovery1 and installed3partition contracts qualified only within their exact recorded limits. All65 feature bodies/sourceRLS010/INT015/feedHTTP/privacy/browser remain unexecuted. Same-client privacy preflight has no native execution or current-head successful outcome yet.";
f.pending_native_execution.actual_source_and_recovery_public_schema_qualification = "Real source migration engine reached grants/owner transfers/revoke in third/fourth starts/resets; separate recovery1 real-target effectiveCREATE=false proved. SourceRLS010 and restricted-session INT015 bodies remain pending. UUIDfixture never substitutes for actual source/recovery schema prerequisites.";
f.pending_native_execution.lanes.forEach(lane => { if (lane.name.includes("recovery Storage")) lane.prior_e91b_qualified_cases = 1; if (lane.name.includes("six-file")) lane.prior_e91b_installed_contracts_passed = 3; });
f.root_checkpoint_admission = { state: "CANDIDATE_AWAITING_ROOT_INDEPENDENT_CAPSULE_PATH_HASH_CHECK", source_head: source,
  root_must: ["Verify67raw/actualGitnormalized/blob paths,9authorcommits vs4Rootcommits, four prior capsules/failedpackets, all original review provenance and historical3383 Spec inversion.", "Commit Root bookkeeping/capsule only and prove next checkpoint metadata source-equal toe472.", "Push and qualify one logical exact-head CI under standing ownership/admission; no blind mutation retry.", "Capture exact native counts and independent truth qualification before delivery/DONE."],
  author_effects: "Only bounded files/Git/hash observations; no push/dispatch/runtime/qualification/managed or hosted mutation.", capsule_handling: "Fifth new immutable author prep artifact, left uncommitted for Root bookkeeping. No source/Spec mutation; all four predecessors immutable. Not delivery JSON." };
// Every artifact-style triple in the new capsule must name actual frozen bytes.
// Historical mutable raw observations use explicitly uncredited field names.
let artifactCount = 0;
function verifyArtifacts(v) {
  if (!v || typeof v !== "object") return;
  if (typeof v.path === "string" && typeof v.bytes === "number" && typeof v.sha256 === "string") {
    const actual = ref(v.path); assert(actual.bytes === v.bytes && actual.sha256 === v.sha256, `Immutable artifact mismatch ${v.path}`); artifactCount++;
  }
  for (const child of Object.values(v)) verifyArtifacts(child);
}
verifyArtifacts(f);
f.preparation_integrity = { frozen_artifact_reference_occurrences_verified: artifactCount, protected_historical_migrations: 109,
  protected_consumers: 37, historical_preparation_blobs: 69, historical3383_objects_and_spec_inversion_verified: true,
  current_committed_review_bindings_verified: 4, prior_capsules_verified: 4, failed_packet_files_verified: 11 + 13 + 17 + 18,
  no_test_or_runtime_rerun: true, source_clean_global_clean_not_claimed: true };
const encoded = Buffer.from(JSON.stringify(f, null, 2) + "\n");
fs.writeFileSync(path.join(root, output), encoded, { flag: "wx" });
process.stdout.write(JSON.stringify({ path: output, bytes: encoded.length, sha256: sha(encoded), source,
  source_paths: sourcePaths.length, author_commits: 9, root_commits_excluded: 4, raw_clean_differences: f.git.raw_normalized_difference_paths.length,
  artifact_occurrences: artifactCount, feature: 95, bootstrap: 30, sro_stops: 31, native65: "UNEXECUTED_CURRENT_CI_PENDING" }) + "\n");
