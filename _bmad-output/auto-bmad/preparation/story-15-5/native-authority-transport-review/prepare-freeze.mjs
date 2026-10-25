import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const root = "C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas", prep = "_bmad-output/auto-bmad/preparation/story-15-5";
const privatePrep = ".env.epic15.mail-runtime/story-15-5-preparation", reviewDir = `${prep}/native-authority-transport-review`;
const source = "4562cfd0031b32b6921f668cd953384b64116973", previousSource = "e472741a91f58c5ef9e623720e2bba0d1164c360";
const checkpoint = "c7570096435dfbae2f6a535be46e61daaf9e28dc", base = "3a1c3bc9fbf22b13c926179288a8b6eefe440c12";
const output = `${prep}/source-freeze-native-authority-transport.json`;
const read = p => fs.readFileSync(path.isAbsolute(p) ? p : path.join(root, p)), json = p => JSON.parse(read(p));
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const git = (args, input) => execFileSync("git", args, { cwd: root, input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const assert = (ok, label) => { if (!ok) throw new Error(label); };
const ref = p => { const bytes = read(p); return { path: p, bytes: bytes.length, sha256: sha(bytes) }; };
const treeCache = new Map(), objectCache = new Map();
function tree(rev) {
  if (!treeCache.has(rev)) treeCache.set(rev, new Map(git(["ls-tree", "-r", "-z", rev]).toString().split("\0").filter(Boolean).map(row => {
    const tab = row.indexOf("\t"); return [row.slice(tab + 1), row.slice(0, tab).split(" ")[2]];
  })));
  return treeCache.get(rev);
}
const oid = (rev, p) => tree(rev).get(p) ?? null;
const blob = id => { if (!objectCache.has(id)) objectCache.set(id, git(["cat-file", "blob", id])); return objectCache.get(id); };
const commit = rev => ({ commit: rev, subject: git(["show", "-s", "--format=%s", rev]).toString().trim(), changed_paths: git(["diff-tree", "--no-commit-id", "--name-only", "-r", rev]).toString().trim().split("\n").filter(Boolean) });
assert(!fs.existsSync(path.join(root, output)), "Preserve immutable sixth capsule");
assert(git(["rev-parse", "HEAD"]).toString().trim() === source, "Held source mismatch");
const predecessorNames = [
  ["source-freeze.json", "2d1e982a10701831a71b8da9cf13ac03234b41499ad525bb8d84464910094e03"],
  ["source-freeze-ci-repair.json", "8c6a67b9d4ba912311d888a2a63b1e7e628803395b791367e0b68c31d25072a7"],
  ["source-freeze-native-sql-repair.json", "3a4391820a34d7b9feca705d329e19eb2d7a5060f29edcfe53d5a7294c7a4c65"],
  ["source-freeze-native-setup-diagnostic.json", "0665da8a44b228583e2dfbd81be3266d6d7cfcd465b6558b7295c1ebfaeb7ee5"],
  ["source-freeze-native-privacy-preflight.json", "2ffc1ee4b9bebb6e1531467bc919a7c779a58befc1c1333cdba656179b1db68e"],
];
const predecessors = predecessorNames.map(([name, hash]) => { const item = ref(`${prep}/${name}`); assert(item.sha256 === hash, "Prior capsule mutated"); return item; });
const f = json(predecessors[4].path);
f.schema_version = 6; f.kind = "author-source-freeze-native-authority-transport-checkpoint-admission-candidate"; f.prepared_at_utc = new Date().toISOString();
f.schema_changes = ["v6 binds exact committed five-path setup authority transport review, tenth author/fifth excluded Root commit and fifth failed native history.",
  "Historical e472 committed four-path review is reverified against actual e472 Git objects;3383 working review/Spec inversion remains verified against actual3383 objects. Current4562 objects are never substituted for either historical proof.",
  "Mutable Root raw observations remain baseline-only UNVERIFIED_UNCREDITED; current frozen admission/review artifacts are separate.",
  "Feature95 case inventory retained despite INT015-only transport source change; bootstrap33 and current35-stop author trail have bounded local evidence, no native setup/auth/privacy success."];
f.immutable_predecessors = predecessors;
f.git.source_head = source; f.git.source_tree_oid = git(["rev-parse", `${source}^{tree}`]).toString().trim();
f.git.source_commits.push(commit(source)); f.git.root_bookkeeping_commits_excluded.push(commit(checkpoint));
const sourcePaths = [...new Set(f.git.source_commits.flatMap(c => commit(c.commit).changed_paths))].sort();
assert(sourcePaths.length === 67 && JSON.stringify(sourcePaths) === JSON.stringify([...f.git.source_paths].sort()), "67-path author union mismatch");
assert(f.git.source_commits.length === 10 && f.git.root_bookkeeping_commits_excluded.length === 5, "10/5 attribution mismatch");
for (const c of f.git.root_bookkeeping_commits_excluded) assert(!commit(c.commit).changed_paths.some(p => sourcePaths.includes(p)), "Root metadata overlaps author paths");
const ancestry = git(["rev-list", `${base}..${source}`]).toString().trim().split("\n").sort();
assert(JSON.stringify(ancestry) === JSON.stringify([...f.git.source_commits, ...f.git.root_bookkeeping_commits_excluded].map(c => c.commit).sort()), "Full ancestry not exactly attributed");
for (const command of [["diff", "--name-only"], ["diff", "--cached", "--name-only"]]) assert(!git(command).toString().trim().split("\n").some(p => sourcePaths.includes(p)), "Author source/index dirty");
f.git.bindings = sourcePaths.map(p => {
  const raw = read(p), clean = git(["hash-object", `--path=${p}`, "--stdin"], raw).toString().trim();
  assert(clean === oid(source, p), "Actual clean object differs from held HEAD");
  const normal = blob(clean), baselineOid = oid(base, p), baseline = baselineOid ? blob(baselineOid) : null;
  const crlf = (raw.toString().match(/\r\n/g) ?? []).length, lf = (raw.toString().match(/\n/g) ?? []).length;
  return { path: p, raw_worktree: { bytes: raw.length, sha256: sha(raw), crlf_count: crlf, bare_lf_count: lf - crlf },
    git_clean_normalized: { bytes: normal.length, sha256: sha(normal), blob_oid: clean, matches_head: true }, head_blob: { oid: clean, bytes: normal.length, sha256: sha(normal) },
    baseline_blob: baseline ? { oid: baselineOid, bytes: baseline.length, sha256: sha(baseline) } : null,
    git_attributes: git(["check-attr", "--all", "--", p]).toString().trim().split("\n").filter(Boolean) };
});
const sourceBindings = new Map(f.git.bindings.map(b => [b.path, b]));
f.git.source_paths = sourcePaths; f.git.raw_normalized_difference_paths = f.git.bindings.filter(b => b.raw_worktree.sha256 !== b.head_blob.sha256).map(b => b.path);
for (const [key, field] of [["normalized_source_path_set_sha256", "head_blob"], ["raw_source_path_set_sha256", "raw_worktree"]]) f.git[key] = sha(JSON.stringify(f.git.bindings.map(b => ({ path: b.path, bytes: b[field].bytes, sha256: b[field].sha256 }))));
f.git.new_source_paths_since_previous_freeze = []; f.git.source_worktree_and_index_clean = true; f.git.global_tracked_worktree_clean = false;
f.git.observed_root_owned_dirty_or_untracked = git(["status", "--short"]).toString().trimEnd().split("\n");
const snapshots = f.git.root_metadata_snapshot;
for (const row of snapshots.historical_fourth_capsule) assert(oid(row.historical_baseline_head, row.metadata_path) === row.baseline_blob_oid_verified, "Historical fourth Root baseline mismatch");
snapshots.historical_fifth_capsule = snapshots.current.map(row => { assert(oid(row.baseline_head, row.metadata_path) === row.baseline_blob_oid_verified, "Historical fifth Root baseline mismatch"); return { ...row, status: "UNVERIFIED_UNCREDITED_HISTORICAL_MUTABLE_RAW_OBSERVATION" }; });
snapshots.current = snapshots.current.map(row => ({ ...row, baseline_head: source, baseline_blob_oid_verified: oid(source, row.metadata_path), observed_raw_bytes_uncredited: read(row.metadata_path).length,
  observed_raw_sha256_uncredited: sha(read(row.metadata_path)), status: "UNVERIFIED_UNCREDITED_MUTABLE_RAW_OBSERVATION" }));
for (const rows of [f.ownership.historical_migrations.bindings, f.ownership.protected_scheduling_and_consumer_paths]) for (const b of rows)
  assert(oid(base, b.path) === b.baseline_blob_oid && oid(source, b.path) === b.head_blob_oid && b.baseline_blob_oid === b.head_blob_oid, "Historical/protected source changed");
const historicalPrep = [...tree(base)].filter(([p]) => p.startsWith(`${prep}/`));
assert(historicalPrep.length === 69 && historicalPrep.every(([p, id]) => oid(source, p) === id), "Historical69 prep changed");
assert(f.ownership.historical_migrations.bindings.length === 109 && f.ownership.protected_scheduling_and_consumer_paths.length === 37, "Protected109/37 mismatch");
const ownership = f.ownership.successor_revalidation; ownership.source_head = source;
ownership.authenticated_setup_transport_allocation = ref(`${prep}/accepted-native-authority-boundary-allocation.json`);
assert(ownership.authenticated_setup_transport_allocation.sha256 === "91097d8da439a9a88d99453e52416dcfa4799ccf3a3b5d834d86acd44a22df13", "Accepted setup allocation changed");
ownership.authenticated_setup_transport_author_route = ref(`${prep}/author-native-authority-transport-route.json`);
ownership.authenticated_setup_proposal = ref(`${prep}/native-authority-boundary-proposal.md`);
ownership.authenticated_setup_design_review = ref(`${prep}/native-authority-boundary-proposal-review/original-review.md`);
ownership.authenticated_setup_design_attestation = ref(`${prep}/native-authority-boundary-proposal-review/original-review-attestation.json`);
for (const row of ownership.shared_additive_reuse_bindings) { assert(oid(source, row.path) === row.current_blob, "Shared additive source changed"); row.sourcee472_blob = oid(previousSource, row.path); }
const specPath = f.approved_intent.spec, spec = blob(oid(source, specPath)).toString();
const kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];
assert(sha(kernel ?? "") === f.approved_intent.kernel_sha256 && (spec.match(/^## Suggested Review Order$/gm) ?? []).length === 1, "Kernel/one SRO mismatch");
const sro = spec.split("## Suggested Review Order\n")[1];
const stops = [...sro.matchAll(/^- `([^`]+):(\d+)` — `([^`]+)`/gm)].map(([, p, line, anchor]) => {
  assert(read(p).toString().replaceAll("\r\n", "\n").split("\n")[Number(line) - 1]?.includes(anchor), "Author literal stop mismatch"); return { path: p, line: Number(line), literal_anchor: anchor, verified: true };
});
assert(stops.length === 35, "Expected35 author stops");
//3383 historical working review: original reviewed raw bytes were LF for the
// three changed files; verify those actual committed objects and Spec inversion.
const oldWorking = f.independent_review.native_setup_diagnostic_latest_delta_only;
const workingBinding = json(oldWorking.input_binding.path), metadata = json(oldWorking.spec_post_review_metadata.artifact.path);
const historical3383 = oldWorking.committed_source_head;
for (const b of workingBinding.bindings.filter(b => b.path !== specPath)) {
  const id = oid(historical3383, b.path), data = blob(id);
  assert(id === b.git_clean_oid && sha(data) === b.git_clean_normalized_sha256 && sha(data) === b.raw_sha256, "Historical3383 code binding mismatch");
}
const historicalSpec = blob(oid(historical3383, specPath)).toString();
assert(historicalSpec.split(metadata.added_text).length === 2 && sha(historicalSpec) === metadata.final_spec_raw_sha256
  && sha(historicalSpec.replace(metadata.added_text, "")) === metadata.reviewed_spec_raw_sha256
  && sha(historicalSpec.split("## Suggested Review Order\n")[1]) === metadata.suggested_review_order_sha256, "Historical3383 Spec inversion mismatch");
// e472 exact committed four-path review must never compare changed4562 files.
const oldCommitted = f.independent_review.native_privacy_preflight_latest_delta_only, committedBinding = json(oldCommitted.input_binding.path);
oldCommitted.historical_e472_binding_verification = committedBinding.bindings.map(b => {
  const id = oid(previousSource, b.path), data = blob(id);
  assert(id === b.head_blob_oid && id === b.actual_git_clean_oid && sha(data) === b.head_blob_sha256 && sha(data) === b.raw_sha256 && data.length === b.raw_bytes, "Historicale472 committed review mismatch");
  return { path: b.path, historical_source: previousSource, historical_blob_oid: id, historical_blob_sha256: sha(data), reviewed_raw_sha256: b.raw_sha256,
    original_raw_equals_historical_clean: true, current_file_not_used: true, verified: true };
});
oldCommitted.applies_to_current_source = false;
oldCommitted.temporal_limit = "Exact committed four-path PASS belongs toe472; all bindings reverified against ACTUALe472 objects, not changed4562 files. No historical-current equality assertion.";
const binding = json(`${reviewDir}/input-binding.json`), report = ref(`${reviewDir}/original-review.md`), attestation = ref(`${reviewDir}/original-review-attestation.json`), review = json(attestation.path);
assert(report.bytes === 2425 && report.sha256 === "4615e8a8fd1610da8e70e704d375b5745fffd9eb1c0141d3684abc290fa9604e" && attestation.bytes === 3607 && attestation.sha256 === "28f3705f9b969bc3c0dd6b6dd75e2896f13b5aa1e694f09bd65ccf7485ca0113", "Current High originals mismatch");
assert(review.result === "PASS_SOURCE_REVIEW_ONLY" && review.source_head === source && binding.source_head === source && binding.bindings.length === 5, "Current exact review provenance mismatch");
for (const b of binding.bindings) { const current = sourceBindings.get(b.path); assert(current.raw_worktree.sha256 === b.raw_sha256 && current.head_blob.oid === b.head_blob_oid && current.head_blob.sha256 === b.head_blob_sha256, "Current five-path review bytes differ"); }
f.independent_review.native_authority_transport_latest_delta_only = { committed_source_head: source, baseline_head: checkpoint, reviewed_source_state: "EXACT_COMMITTED_FIVE_PATH_DELTA",
  reviewed_source_is_head: true, verdict: "PASS", findings: 0, model: "gpt-6.1-sol", effort: "high", context_free: true, distinct_from_author: true, not_a_fourth_broad_round: true,
  input: ref(`${reviewDir}/latest-delta-input.diff`), input_binding: ref(`${reviewDir}/input-binding.json`), original_report: report, attestation,
  all_five_committed_path_bindings_match: true, post_review_spec_metadata_delta: false, exact_current_spec_byte_review_claim: true, runtime_credit: false };
f.author_trail = { path: specPath, exactly_one_section: true, verified_stops: 35, stops, section_hash_definition: f.author_trail.section_hash_definition,
  suggested_review_order_sha256: sha(sro), temporal_note: "Current exact committed five-path High review includes Spec/SRO. No post-review source/Spec mutation. Historicale472/3383 provenance separately bound to actual historical objects." };
const changedFeatureFiles = [];
for (const item of f.inventory.files) {
  if (oid(source, item.path) !== oid(previousSource, item.path)) changedFeatureFiles.push(item.path);
  for (const id of item.prepared_literal_case_ids) assert(read(item.path).includes(id), "Prepared feature ID missing");
}
assert(JSON.stringify(changedFeatureFiles) === JSON.stringify(["tests/integration/commands/calendar-feed.int.test.ts"]), "Unexpected feature file delta");
const bootstrap = f.inventory.bootstrap_unit_cases_separate; bootstrap.count = 33;
bootstrap.boundary = "Injected lifecycle/DB facts plus real unconnected pg runtime/proof/absence constructor/startup serialization; no native auth/DB/lifecycle proof.";
bootstrap.new_authority_transport_cases = ["same-source credential/target refusals with no guesses/fallback", "actual LOGIN+SUPER/session identity strict negatives before secrets", "no new privileged child configuration"];
delete bootstrap.actual_latest_focused_batch_includes_all30; bootstrap.actual_latest_focused_batch_includes_all33 = true;
assert((read(bootstrap.path).toString().match(/^test\(/gm) ?? []).length === 33, "Bootstrap33 declaration mismatch");
f.inventory.feature_source_blobs_unchanged_since_previous_freeze = false;
f.inventory.source_changes_since_previous_freeze = changedFeatureFiles;
f.inventory.declaration_count_reuse = "Feature95 case inventory retained, original83/prepared IDs revalidated. Only existingINT015 source transport and independent setup qualification changed; case/role/oracle counts unchanged. Bootstrap30->33 separate and locally executed.65native feature bodies unexecuted.";
f.actual_verification = { current_checks_artifact: ref(`${reviewDir}/local-checks.json`), current_checks: json(`${reviewDir}/local-checks.json`).checks,
  source_during_checks: "Exact final five-path working code/test delta againstc757 committed4562 before review; evidence prose/SRO refreshed before commit; no post-review drift.", historical_local_checks_reference: predecessors[4],
  historical_reuse_limit: "Application code unchanged; earlier build/Node/full native receipts remain historical only. Current wrapper/pin/unit/INT015 source changed. No whole-scope prior PASS/current-head native success. No unrelated broad/build rerun.",
  new_native_ci_dispatched: false, local_sql_or_native_runtime_executed: false, no_resources_or_runtime_qualification_commands_executed: true };
const packet = `${privatePrep}/checkpoint-c7570096-ci-independent`, manifest = json(`${packet}/manifest.json`);
assert(manifest.count === 18 && manifest.files.length === 18, "Fifth packet18 inventory mismatch");
const packetFiles = manifest.files.map(row => { const item = ref(path.join(root, packet, row.path).replaceAll("\\", "/")); assert(item.bytes === row.bytes && item.sha256 === row.sha256, "Fifth packet hash mismatch"); return item; });
const manifestRef = ref(path.join(root, packet, "manifest.json").replaceAll("\\", "/"));
assert(manifestRef.bytes === 3039 && manifestRef.sha256 === "dc8bee5066b45e02ae8305e3873fb035e942fa5f6b3f4f2bf7d667a07220c8dc", "Fifth manifest mismatch");
const sourceEquality = sourcePaths.map(p => { const old = oid(previousSource, p), failed = oid(checkpoint, p); assert(old === failed, "Fifth checkpoint not source-equal toe472"); return { path: p, sourcee472_blob: old, failedc757_blob: failed, sha256: sha(blob(old)) }; });
const runtime = json(`${packet}/native-runtime-log-extracts.json`), runtimeJobs = runtime.jobs.filter(job => ["db", "e2e"].includes(job.job));
assert(runtimeJobs.length === 2 && runtimeJobs.every(job => job.lifecycle.length === 1 && job.lifecycle[0].keyOutcome === "not-attempted" && job.lifecycle[0].failures[0] === "privacy-preflight-refused"), "Fifth failure classification mismatch");
for (const job of runtimeJobs) {
  const facts = job.lifecycle[0].privacyPreflight;
  assert(facts.controls.length === 4 && facts.controls.filter(c => c.matchesRequired).length === 1 && facts.controls.find(c => c.matchesRequired)?.name === "log_parameter_max_length_on_error"
    && facts.controls.every(c => c.canSet === false) && facts.principal.session_is_postgres === true && facts.principal.current_is_postgres === true && facts.principal.same_identity === true
    && facts.principal.session_superuser === false && facts.principal.current_superuser === false && facts.principal.session_bypass_rls === true && facts.principal.current_bypass_rls === true, "Fifth actual privacy/principal facts mismatch");
}
const rootAdmission = ref(path.join(root, privatePrep, "root-failed-c757-packet-admission.json").replaceAll("\\", "/"));
assert(rootAdmission.sha256 === "bc57e48417de15ba5f0911e4ec1cdc1d207b6954a5f1f4404a9b8b9924299c76", "Fifth Root integrity receipt mismatch");
f.failed_checkpoint_histories.push({ head: checkpoint, source_equal_toe472: true, source_equality_bindings: sourceEquality, run_id: 39468849461, attempt: 1, conclusion: "FAILURE",
  unit: { total: 3102, passed: 3102, failed: 0, skipped: 0, cancelled: 0 }, other_verify: { python_passed: 43, build: "PASS", containment: "PASS" }, feature_node_subset: { passed: 30, failed: 0, skipped: 0 },
  bootstrap_subset_separate: { passed: 30, failed: 0, skipped: 0 }, all_three_starts_resets_migration_compile: "PASS_ENGINE_REACH",
  recovery_separate_from_feature95: { cases: 1, passed: 1, failed: 0, pending: 0, same_restored_target_effective_public_CREATE: false, physical_storage_bytes_info_protected_rows_overwrite_denial: "QUALIFIED_NATIVE_PASS", artifact_receipt: ref(path.join(root, packet, "artifact-native-isolated-storage-recovery-extraction.json").replaceAll("\\", "/")) },
  db_browser_wrapper: { outcome: "FAILED_NATIVE_PRIVACY_PREFLIGHT", stage: "privacy-preflight", category: "guard-refusal", keyOutcome: "not-attempted", observations: runtimeJobs.map(job => ({ job: job.job, lifecycle: job.lifecycle[0] })),
    inference_limit: "Only USERSET on_error matched;canSet booleans are not actualSET trials. Existing postgres is not super; no source SupAdmin credential mapping/auth/privacy or INT015 execution inferred." },
  remaining_feature_native: { vitest: 51, browser: 14, total_unexecuted: 65 }, api_execution_artifact_count: 0,
  absolute_packet_directory: path.join(root, packet).replaceAll("\\", "/"), manifest: manifestRef, packet_files: packetFiles, root_admission: rootAdmission,
  qualified_assertion_reach_artifact: ref(path.join(root, packet, "native-assertion-reach.json").replaceAll("\\", "/")), whole_scope_reuse: false,
  limit: "Fifth run remainsFAIL despite verify3102/Python43/build/recovery1 bounded passes. Native setup authority selection is not executed/qualified.65bodies pending. Earlier generic/42501 causes preserved separately." });
// Revalidate every failed-head equality against its immutable historical objects.
const historicSources = ["611c86295540161d31169110bf2139cf1d85d708", "2674b3f7fa5e7853314923a0ceed52d84fcf0677", "a76fc492a5273da776ba807559b2eb81d41bfe10", "3383a1eb4607ddea035e79fb8433dc89a5137530", previousSource];
let equalityCount = 0;
f.failed_checkpoint_histories.forEach((history, index) => {
  assert(history.conclusion === "FAILURE", "Failed history silently reclassified");
  for (const b of history.source_equality_bindings) { const keys = Object.keys(b).filter(key => key.endsWith("_blob")); const actual = oid(historicSources[index], b.path);
    assert(keys.length === 2 && keys.every(key => b[key] === actual) && oid(history.head, b.path) === actual && sha(blob(actual)) === b.sha256, "Historical failed source equality mismatch"); equalityCount++; }
});
const rootIdentity = ref(path.join(root, privatePrep, "root-4562-source-path-admission.json").replaceAll("\\", "/"));
assert(rootIdentity.sha256 === "f67fea7132ef6393cc8ca76f28467d3d3ab927c8fae5d73e04c48f17d1130f28", "Root4562 identity receipt mismatch");
f.current_frozen_artifact_references = [rootIdentity, ...["latest-delta-input.diff", "input-binding.json", "original-review.md", "original-review-attestation.json", "local-checks.json"].map(name => ref(`${reviewDir}/${name}`)),
  ...["author-native-authority-transport-route.json", "accepted-native-authority-boundary-allocation.json", "native-authority-boundary-proposal.md"].map(name => ref(`${prep}/${name}`)),
  ref(`${prep}/native-authority-boundary-proposal-review/original-review.md`), ref(`${prep}/native-authority-boundary-proposal-review/original-review-attestation.json`)];
f.pending_native_execution.new_head = source;
f.pending_native_execution.note = "Current4562 nativeCI not dispatched. Sole source-container password/SupAdmin TCP/authenticatedLOGIN+SUPER/sameclient privacy UNVERIFIED until exact-head CI. Fifth c757 bounded3102/Python43/build/recovery1/installed3contracts are failed-head history only; all65feature bodies/sourceRLS010/INT015/feedHTTP/browser unexecuted.";
f.pending_native_execution.setup_authority_prerequisites = { credential_mapping: "UNVERIFIED", fixed_TCP_authentication: "UNVERIFIED", actual_SupAdmin_LOGIN_SUPER: "UNVERIFIED", same_client_native_privacy: "UNVERIFIED", fallback_authorized: false };
f.pending_native_execution.lanes.forEach(lane => { if (lane.name.includes("recovery Storage")) lane.prior_c757_qualified_cases = 1; if (lane.name.includes("six-file")) lane.prior_c757_installed_contracts_passed = 3; });
f.root_checkpoint_admission = { state: "CANDIDATE_AWAITING_ROOT_INDEPENDENT_CAPSULE_PATH_HASH_CHECK", source_head: source,
  root_must: ["Verify67 raw/actualGitclean/HEADblob source paths,10authorvs5Root commits/full attributed ancestry, five immutable predecessors/nativeFAIL histories, actualhistoricale472 and3383 review provenance, new exactcommitted5path HighPASS.",
    "Commit Root bookkeeping only; prove next checkpoint metadata source-equal to4562 and operate one logical exact-head CI without blind retries.", "Require actual fixed source admin credential authentication/LOGIN+SUPER/privacy before mutation; do not repair/fallback on refusal.", "Capture native counts and independent truth qualification before delivery/DONE."],
  author_effects: "Bounded file/Git/hash observations only. No source/Spec drift, push, dispatch, DB/Docker/Supabase/browser/native probe, managed resource or hosted mutation.",
  capsule_handling: "Sixth immutable prep artifact left uncommitted for Root; five predecessors and failed packets preserved. Not delivery JSON." };
let artifactCount = 0;
function verifyArtifacts(v) { if (!v || typeof v !== "object") return;
  if (typeof v.path === "string" && typeof v.bytes === "number" && typeof v.sha256 === "string") { const actual = ref(v.path); assert(actual.bytes === v.bytes && actual.sha256 === v.sha256, `Frozen artifact mismatch ${v.path}`); artifactCount++; }
  for (const child of Object.values(v)) verifyArtifacts(child);
}
verifyArtifacts(f);
f.preparation_integrity = { frozen_artifact_reference_occurrences_verified: artifactCount, protected_historical_migrations: 109, protected_consumers: 37, historical_preparation_blobs: 69,
  historical3383_objects_and_spec_inversion_verified: true, historicale472_four_committed_objects_verified: true, current_committed_review_bindings_verified: 5,
  prior_capsules_verified: 5, failed_packet_listed_files_verified: 11 + 13 + 17 + 18 + 18, failed_manifest_self_refs_verified: 5, failed_checkpoint_historical_source_equalities: equalityCount,
  no_test_or_runtime_rerun: true, source_clean_global_clean_not_claimed: true };
const encoded = Buffer.from(JSON.stringify(f, null, 2) + "\n");
fs.writeFileSync(path.join(root, output), encoded, { flag: "wx" });
process.stdout.write(JSON.stringify({ path: output, bytes: encoded.length, sha256: sha(encoded), source, source_paths: 67, author_commits: 10, root_commits_excluded: 5,
  raw_clean_differences: f.git.raw_normalized_difference_paths.length, artifact_occurrences: artifactCount, historical_source_equalities: equalityCount, feature: 95, bootstrap: 33, SRO: 35, native: "UNVERIFIED_CURRENT_CI_PENDING" }) + "\n");
