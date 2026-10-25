import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = 'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas';
const prep = '_bmad-output/auto-bmad/preparation/story-15-5';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = name => fs.readFileSync(path.isAbsolute(name) ? name : path.join(root, name));
const json = name => JSON.parse(read(name));
const assert = (ok, label) => { if (!ok) throw new Error(label); };
const git = (args, input) => execFileSync('git', args, { cwd: root, input, windowsHide: true, maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
const head = '55db468eef3106ca1b02dc846ba12967a28dc238';
const historicalFixHead = 'e3f1c2e1c5db81947a48233da617ff8535fd24aa';
const prior = '33b595a8b7c001bd89788fb1c0e8cd9c626e03ec';
const base = '3a1c3bc9fbf22b13c926179288a8b6eefe440c12';
const raw = read(`${prep}/source-freeze-native-dependency-audit-repair.json`), f = JSON.parse(raw);
assert(raw.length === 720807 && sha(raw) === 'fdf228c001e59f666cf362c5ee847513a90b101fb2c0188f5d8932a0d27912cd', 'Eleventh capsule identity');
assert(f.schema_version === 11 && f.git.source_head === head && git(['rev-parse', 'HEAD']).toString().trim() === head, 'Current source/schema');
const predecessors = [
  ['source-freeze.json', '2d1e982a10701831a71b8da9cf13ac03234b41499ad525bb8d84464910094e03'],
  ['source-freeze-ci-repair.json', '8c6a67b9d4ba912311d888a2a63b1e7e628803395b791367e0b68c31d25072a7'],
  ['source-freeze-native-sql-repair.json', '3a4391820a34d7b9feca705d329e19eb2d7a5060f29edcfe53d5a7294c7a4c65'],
  ['source-freeze-native-setup-diagnostic.json', '0665da8a44b228583e2dfbd81be3266d6d7cfcd465b6558b7295c1ebfaeb7ee5'],
  ['source-freeze-native-privacy-preflight.json', '2ffc1ee4b9bebb6e1531467bc919a7c779a58befc1c1333cdba656179b1db68e'],
  ['source-freeze-native-authority-transport.json', '53868286b715fe0dc076db934d75a280b0b5d2c82d3b4aabab6505237504474c'],
  ['source-freeze-native-settlement-browser.json', '7c4a768acd75f470b9f101f5a8af96b37f19efcf058b293ef9dcf79065e57d7d'],
  ['source-freeze-native-feature-five-path-repair.json', '496ecf7db6c475f26d4afbace6af8912d640c04e2043cf6840099920e95e9f78'],
  ['source-freeze-native-fixture-report-transport.json', '019864c1fa982730868a3bf25c14b5b6d6464c64659c5e4b963319cc56e3c198'],
  ['source-freeze-native-owned-origin.json', '9e962d4d40d5962370ce461c282f93927f6e779cbde6af514bbfdeef892d9c3e'],
];
for (const [name, hash] of predecessors) assert(sha(read(`${prep}/${name}`)) === hash, 'Immutable predecessor');
const historical = [
  ['9487c0d9dc6f622b472780587e20e834abf98595', '611c86295540161d31169110bf2139cf1d85d708', 60, 'source611_blob', 'failed948_blob', 3094, 3086, 8],
  ['c57580580217e34a0b933a23f7c36737306333b7', '2674b3f7fa5e7853314923a0ceed52d84fcf0677', 66, 'source2674_blob', 'failedc575_blob', 3095, 3095, 0],
  ['1cea5c4caa4996566ca95f5b872c6623da22f807', 'a76fc492a5273da776ba807559b2eb81d41bfe10', 67, 'sourcea76_blob', 'failed1cea_blob', 3095, 3095, 0],
  ['e91b366b8b362f8ffbd867940dfe1cd2d817e72b', '3383a1eb4607ddea035e79fb8433dc89a5137530', 67, 'source3383_blob', 'failede91b_blob', 3098, 3098, 0],
  ['c7570096435dfbae2f6a535be46e61daaf9e28dc', 'e472741a91f58c5ef9e623720e2bba0d1164c360', 67, 'sourcee472_blob', 'failedc757_blob', 3102, 3102, 0],
  ['fae644b5349744a531008e2224ca3a08d596836e', '4562cfd0031b32b6921f668cd953384b64116973', 67, 'source4562_blob', 'failedfae_blob', 3105, 3105, 0],
  ['cba60486b5e695b9796ef39d4492bc7f569d517b', 'e3f1c2e1c5db81947a48233da617ff8535fd24aa', 67, 'sourcee3_blob', 'failedcba_blob', 3123, 3123, 0],
  ['3e7b6131a00e6c7b4d25c49373d8ba1c1eefe42f', 'e74cae6cbb8ce21a5f65e74d21f3c60fbfb09314', 68, 'sourcee74_blob', 'failed3e7_blob', 3130, 3130, 0],
  ['6dad688ec6a51143bfee902618bb88647a81c940', '906f80f301d8034f8efe510018137195f3e4c4eb', 68, 'source906_blob', 'failed6dad_blob', 3133, 3133, 0],
  ['be2c1a535dff0e58b1579fe3db5890c7819916ab', '380c3e720d5caaa1dc2181d70737b9320337f451', 68, 'source380_blob', 'failedbe2_blob', null, null, null],
];
const trees = new Map();
const tree = rev => {
  if (!trees.has(rev)) {
    const rows = new Map();
    for (const row of git(['ls-tree', '-r', '-z', rev]).toString().split('\0').filter(Boolean)) { const tab = row.indexOf('\t'); rows.set(row.slice(tab + 1), row.slice(0, tab).split(' ')[2]); }
    trees.set(rev, rows);
  }
  return trees.get(rev);
};
const expected = [...json(`${prep}/source-freeze-native-owned-origin.json`).git.source_paths, 'pnpm-lock.yaml'].sort();
assert(expected.length === 69 && JSON.stringify([...f.git.source_paths].sort()) === JSON.stringify(expected), 'Source path union');
const union = new Set();
for (const c of f.git.source_commits) {
  for (const p of git(['diff-tree', '--no-commit-id', '--name-only', '-r', c.commit]).toString().trim().split('\n').filter(Boolean)) union.add(p);
  const message = git(['show', '-s', '--format=%B', c.commit]).toString();
  assert(/^[a-z]+\(story-15-5\): .+\n\n\S/.test(message), 'Author commit scope/body');
}
assert(f.git.source_commits.length === 16 && JSON.stringify([...union].sort()) === JSON.stringify(expected), 'Author attribution');
assert(JSON.stringify(f.git.root_bookkeeping_commits_excluded.map(x => x.commit).sort()) === JSON.stringify(historical.map(x => x[0]).sort()) && !f.git.root_metadata_in_author_source_commits, 'Root attribution');
const ancestors = git(['rev-list', `${base}..${head}`]).toString().trim().split('\n');
assert(ancestors.length === 26 && ancestors.every(x => f.git.source_commits.some(c => c.commit === x) || historical.some(c => c[0] === x)), 'Complete ancestry attribution');
const objects = new Set(f.git.bindings.map(b => b.head_blob.oid));
for (const h of f.failed_checkpoint_histories) for (const b of h.source_equality_bindings) for (const [key, value] of Object.entries(b)) if (key.endsWith('_blob')) objects.add(value);
const payload = git(['cat-file', '--batch'], [...objects].join('\n') + '\n'), cache = new Map();
let offset = 0;
for (const oid of objects) {
  const end = payload.indexOf(10, offset), match = /^([a-f0-9]{40}) blob (\d+)$/.exec(payload.subarray(offset, end).toString());
  assert(match && match[1] === oid, 'Native object batch header');
  const size = Number(match[2]), start = end + 1; cache.set(oid, payload.subarray(start, start + size));
  assert(payload[start + size] === 10, 'Native object batch boundary'); offset = start + size + 1;
}
assert(offset === payload.length, 'Native object batch trailing bytes');
const object = oid => { if (!cache.has(oid)) cache.set(oid, git(['cat-file', 'blob', oid])); return cache.get(oid); };
let rawDifferences = 0;
for (const b of f.git.bindings) {
  const data = read(b.path), oid = git(['hash-object', `--path=${b.path}`, '--stdin'], data).toString().trim(), clean = object(oid);
  assert(data.length === b.raw_worktree.bytes && sha(data) === b.raw_worktree.sha256, `Raw source ${b.path}`);
  assert(oid === tree(head).get(b.path) && oid === b.head_blob.oid && oid === b.git_clean_normalized.blob_oid, `Clean source OID ${b.path}`);
  assert(clean.length === b.head_blob.bytes && clean.length === b.git_clean_normalized.bytes && sha(clean) === b.head_blob.sha256 && sha(clean) === b.git_clean_normalized.sha256, `Actual source bytes ${b.path}`);
  if (sha(data) !== sha(clean)) rawDifferences++;
}
assert(f.git.bindings.length === 69 && rawDifferences === 42, 'Source counts');
for (const args of [['diff', '--name-only'], ['diff', '--cached', '--name-only']]) assert(!git(args).toString().trim().split('\n').some(p => expected.includes(p)), 'Source dirty/staged');
let migrations = 0, prepCount = 0;
for (const [p, oid] of tree(base)) {
  if (p.startsWith('supabase/migrations/')) { assert(tree(head).get(p) === oid, 'Historical migration changed'); migrations++; }
  if (p.startsWith(`${prep}/`)) { assert(tree(head).get(p) === oid, 'Historical preparation changed'); prepCount++; }
}
assert(migrations === 109 && prepCount === 69, 'Historical inventories');
for (const b of f.ownership.protected_scheduling_and_consumer_paths) assert(tree(base).get(b.path) === b.baseline_blob_oid && tree(head).get(b.path) === b.head_blob_oid && b.baseline_blob_oid === b.head_blob_oid, 'Protected path');
assert(f.ownership.protected_scheduling_and_consumer_paths.length === 37, 'Protected count');
let references = 0; const unique = new Set();
function walk(value) {
  if (Array.isArray(value)) { value.forEach(walk); return; }
  if (!value || typeof value !== 'object') return;
  if (typeof value.path === 'string' && typeof value.bytes === 'number' && typeof value.sha256 === 'string') { const bytes = read(value.path); assert(bytes.length === value.bytes && sha(bytes) === value.sha256, `Frozen artifact ${value.path}`); references++; unique.add(path.resolve(root, value.path)); }
  Object.values(value).forEach(walk);
}
walk(f); assert(references === 500 && unique.size === 421 && f.preparation_integrity.frozen_artifact_reference_occurrences_verified === references, 'Eleventh full500/unique421 reference count');
const nq = f.predecessor_ninth_full_count_qualification;
assert(nq.stored_core_occurrences === 384 && nq.actual_full_occurrences === 385 && nq.unique_paths === 329 && nq.capsule.sha256 === '019864c1fa982730868a3bf25c14b5b6d6464c64659c5e4b963319cc56e3c198' && nq.parent_final_receipt.bytes === 3268 && nq.parent_final_receipt.sha256 === 'b0433dbc7cbc4e5582960789f1a434a101c0c031e1e9c0ada97cd95c467a4bce' && nq.parent_final_verifier.sha256 === '88a9efe8add223cdd768166400168823208e66f1051cf353b85c6c35e61e8a16', 'Ninth exact full/core qualification retained');
let snapshots = 0;
assert(f.git.root_metadata_snapshot.schema === 'observations-not-frozen-raw-artifacts', 'Mutable metadata schema');
for (const rows of Object.values(f.git.root_metadata_snapshot).filter(Array.isArray)) for (const row of rows) {
  const rev = row.historical_baseline_head ?? row.baseline_head;
  const rawNotCredited = row.status.startsWith('UNVERIFIED_UNCREDITED') || (['BASELINE_OBJECT_ONLY_NO_CURRENT_RAW_OBSERVATION', 'HISTORICAL_BASELINE_OBJECT_ONLY_NO_RAW_OBSERVATION'].includes(row.status) && row.current_raw_not_resampled === true && !Object.hasOwn(row, 'observed_raw_sha256_uncredited'));
  assert(rawNotCredited && row.raw_bytes_durably_captured === false && row.baseline_blob_only_credited === true && (tree(rev).get(row.metadata_path) ?? null) === row.baseline_blob_oid_verified, 'Mutable raw snapshot/baseline distinction'); snapshots++;
}
assert(snapshots === 24, 'Mutable observation count');
const snapshotRows = Object.values(f.git.root_metadata_snapshot).filter(Array.isArray).flat();
assert(snapshotRows.filter(x => x.status.startsWith('UNVERIFIED_UNCREDITED')).length === 12 && snapshotRows.filter(x => x.status.includes('BASELINE_OBJECT_ONLY')).length === 12, 'Twelve historical raw observations/twelve baseline-only');
let equalities = 0;
assert(f.failed_checkpoint_histories.length === 10, 'Ten failed histories');
for (const [checkpoint, source, count, sourceKey, failedKey, total, passed, failed] of historical) {
  const h = f.failed_checkpoint_histories.find(x => x.head === checkpoint);
  assert(h && h.source_equality_bindings.length === count, 'Failed history identity/count');
  if (total === null) assert(h.node_unit_execution === 'UNEXECUTED_NO_TOTAL_OR_PASS_INVENTED' && !Object.hasOwn(h, 'unit') && h.later_checks === 'UNEXECUTED', 'Audit-stopped history has no invented test counts');
  else assert(h.unit.total === total && h.unit.passed === passed && h.unit.failed === failed && h.unit.skipped === 0, 'Executed historical native truth');
  for (const b of h.source_equality_bindings) { assert(tree(source).get(b.path) === b[sourceKey] && tree(checkpoint).get(b.path) === b[failedKey] && b[sourceKey] === b[failedKey] && sha(object(b[sourceKey])) === b.sha256, 'Actual failed-head source equality'); equalities++; }
}
assert(equalities === 665, 'Failed-head equality count');
const sixth = f.failed_checkpoint_histories[5];
assert(sixth.db_wrapper.first_child_exit === 0 && sixth.db_wrapper.keyOutcome === 'unverified' && sixth.db_wrapper.custody_present && sixth.browser.story_failed === 14 && sixth.browser.failed_attempts_including_retries === 28 && sixth.remaining_feature_native.vitest_unexecuted === 51 && sixth.browser_artifact_privacy.content_checks === null, 'Sixth bounded failure/privacy facts');
const specPath = f.approved_intent.spec, spec = read(specPath).toString().replace(/\r\n/g, '\n'), kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];
assert(sha(kernel ?? '') === '0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977' && (spec.match(/^\*\*Round [123] of 3\*\*$/gm) ?? []).length === 3 && (spec.match(/^## Suggested Review Order$/gm) ?? []).length === 1, 'Kernel/cap/SRO');
function verifyReviewBinding(binding, rev) {
  for (const b of binding.bindings) { const oid = tree(rev).get(b.path), data = object(oid); assert(oid === (b.actual_git_clean_oid ?? b.git_clean_oid) && oid === b.head_blob_oid && data.length === b.head_blob_bytes && sha(data) === b.head_blob_sha256 && sha(data) === (b.git_clean_normalized_sha256 ?? b.normalized_sha256), 'Historical/current actual review blob'); }
}
for (const [key, source] of [['native_privacy_preflight_latest_delta_only', historical[4][1]], ['native_authority_transport_latest_delta_only', historical[5][1]]]) {
  const review = f.independent_review[key]; assert(review.applies_to_current_source === false && review.current_file_not_used === true, 'Historical temporal scope'); verifyReviewBinding(json(review.input_binding.path), source);
}
const oldReview = f.independent_review.native_setup_diagnostic_latest_delta_only, oldBinding = json(oldReview.input_binding.path), oldHead = historical[3][1];
for (const b of oldBinding.bindings.filter(b => b.path !== specPath)) { const data = object(tree(oldHead).get(b.path)); assert(tree(oldHead).get(b.path) === b.git_clean_oid && sha(data) === (b.git_clean_normalized_sha256 ?? b.normalized_sha256) && sha(data) === b.raw_sha256, 'Historical3383 code'); }
const metadata = json(oldReview.spec_post_review_metadata.artifact.path), oldSpec = object(tree(oldHead).get(specPath)).toString();
assert(oldSpec.split(metadata.added_text).length === 2 && sha(oldSpec) === metadata.final_spec_raw_sha256 && sha(oldSpec.replace(metadata.added_text, '')) === metadata.reviewed_spec_raw_sha256 && sha(oldSpec.split('## Suggested Review Order\n')[1]) === metadata.suggested_review_order_sha256 && sha(metadata.unified_diff) === metadata.unified_diff_sha256, 'Historical3383 explicit Spec inversion');
const composite = f.independent_review.native_settlement_browser_composite;
assert(composite.prior_source === prior && composite.prior_assessment === 'NOTPASS_ONE_P2_HISTORICAL' && composite.latest_source === historicalFixHead && composite.latest_baseline === prior && composite.latest_verdict === 'PASS_LATEST_FINDING_ONLY' && composite.latest_findings === 0 && composite.model === 'gpt-6.1-sol' && composite.effort === 'high' && composite.context_free && composite.distinct_from_author && composite.exact_current_spec_reviewed === false && composite.historical_all_three_e3_bindings_match === true && !composite.post_review_spec_delta, 'Composite review provenance');
const priorBinding = json(composite.prior_binding.path), latestBinding = json(composite.latest_binding.path);
verifyReviewBinding(priorBinding, prior); verifyReviewBinding(latestBinding, historicalFixHead);
assert(priorBinding.bindings.length === 6 && latestBinding.bindings.length === 3, 'Composite review path counts');
assert(composite.applies_to_current_source === false || composite.current_file_not_used === true || composite.temporal_limit, 'Historical e3 temporal scope');
for (const row of composite.prior_unchanged_path_coverage) assert(row.unchanged && row.prior_assessment_portion_applies_to_current_source && !row.new_whole_source_review_claim && tree(prior).get(row.path) === row.historical33b_blob && tree(head).get(row.path) === row.current_blob && row.historical33b_blob === row.current_blob, 'Explicit unchanged review reuse');
assert(composite.prior_unchanged_path_coverage.length === 3, 'Unchanged composite count');
const e74Review = f.independent_review.native_feature_five_path_latest_delta_only;
assert(e74Review.source_head === historical[7][1] && e74Review.verdict === 'PASS' && e74Review.finding_count === 0 && e74Review.applies_to_current_source === false && e74Review.current_file_not_used && !e74Review.all_five_current_bindings_match && !e74Review.exact_current_spec_reviewed && e74Review.historical_all_five_e74_bindings_match, 'Historical e74 temporal review scope');
verifyReviewBinding(json(e74Review.input_binding.path), historical[7][1]);
let reusedE74 = 0, supersededE74 = 0;
for (const row of e74Review.current_path_coverage) {
  const old = tree(historical[7][1]).get(row.path), now = tree(head).get(row.path);
  assert(old === row.historical_e74_blob && now === row.current_blob && row.unchanged === (old === now) && row.review_dependency_only && row.superseded_by_current_four_path_review === (old !== now), 'Exact e74 unchanged/superseded review coverage');
  if (row.unchanged) reusedE74++; else supersededE74++;
}
assert(reusedE74 === 2 && supersededE74 === 3, 'Two unchanged e74 paths/three superseded');
const old906 = f.independent_review.native_fixture_report_transport_latest_delta_only;
assert(old906.source_head === historical[8][1] && old906.verdict === 'PASS' && old906.findings === 0 && old906.applies_to_current_source === false && old906.current_file_not_used && old906.historical_all_three906_bindings_match && !old906.all_three_current_bindings_match && !old906.exact_current_spec_reviewed, 'Historical906 temporal review scope');
verifyReviewBinding(json(old906.input_binding.path), historical[8][1]);
for (const row of old906.current_path_coverage) assert(tree(historical[8][1]).get(row.path) === row.historical906_blob && tree(head).get(row.path) === row.current_blob && !row.unchanged && row.superseded_by_current_four_path_review, 'Three historical906 paths superseded');
assert(old906.current_path_coverage.length === 3, 'Three historical906 coverage rows');
const old380 = f.independent_review.native_owned_origin_latest_delta_only;
assert(old380.source_head === historical[9][1] && old380.verdict === 'PASS' && old380.findings === 0 && old380.applies_to_current_source === false && old380.current_file_not_used && !old380.all_four_current_bindings_match && !old380.exact_current_spec_reviewed, 'Historical380 temporal review scope');
verifyReviewBinding(json(old380.input_binding.path), historical[9][1]);
let reused380 = 0, superseded380 = 0;
for (const row of old380.current_path_coverage) {
  const old = tree(historical[9][1]).get(row.path), now = tree(head).get(row.path);
  assert(old === row.historical380_blob && now === row.current_blob && row.unchanged === (old === now) && row.unchanged_code_review_only_no_new_installed_runtime_credit === row.unchanged && row.superseded_by_current_dependency_review === !row.unchanged, 'Historical380 exact unchanged code/dependency Spec scope');
  if (row.unchanged) reused380++; else superseded380++;
}
assert(reused380 === 3 && superseded380 === 1, 'Three unchanged380 code paths/Spec superseded');
const currentReview = f.independent_review.native_dependency_audit_latest_delta_only;
assert(currentReview.source_head === head && currentReview.before === historical[9][0] && currentReview.verdict === 'PASS' && currentReview.findings === 0 && currentReview.model === 'gpt-6.1-sol' && currentReview.effort === 'high' && currentReview.context_free && currentReview.distinct_from_author && currentReview.latest_fix_only && currentReview.not_fourth_broad && currentReview.exact_current_spec_reviewed && !currentReview.post_review_spec_delta && !currentReview.runtime_credit && currentReview.all_three_current_bindings_match, 'Current dependency three-path code review');
const currentBinding = json(currentReview.input_binding.path);
assert(currentBinding.bindings.length === 3 && currentBinding.literal_stops === 61 && currentBinding.actual_separate_node_controls === 67 && currentBinding.native_credit_for_controls === 0 && currentBinding.baseline === historical[9][0], 'Current dependency three path/count scope'); verifyReviewBinding(currentBinding, head);
for (const b of currentBinding.bindings) assert(read(b.path).length === b.raw_bytes && sha(read(b.path)) === b.raw_sha256, 'Current reviewed raw bytes');
const graph = json(currentBinding.semantic_graph.path);
assert(graph.source === head && graph.baseline === historical[9][0] && graph.package_only_vite_pin_changed && graph.scripts_and_all_other_manifest_values_unchanged && graph.no_unrelated_semantic_nodes && graph.all15_platform_bindings.length === 15 && graph.installed.vite.version === '8.1.6' && graph.installed.vitest.version === '4.1.9' && graph.installed.vitest.resolved_vite_version === '8.1.6', 'Bound installed dependency graph/required peer closure');
for (const item of [graph.parser, ...Object.values(graph.installed)]) if (item.path && item.bytes && item.sha256) { const bytes = read(item.path); assert(bytes.length === item.bytes && sha(bytes) === item.sha256, 'Current installed metadata/bundle identity'); }
const canonical = f.actual_verification.canonical_local_lint, audit = f.actual_verification.current_high_audit;
assert(canonical.status === 'INCOMPLETE_TERMINATED_NOT_PASS' && canonical.exit_code === 1 && audit.exit_code === 0 && audit.high === 0 && audit.moderate === 2 && audit.no_threshold_change_or_ignore && f.actual_verification.whole_prior_installed_runtime_scope_reuse === false, 'Local audit vs incomplete canonical lint/runtime reuse');
const producerLint = json(f.targeted_new_producer_lint.path);
assert(producerLint.exit_code === 0 && producerLint.errors === 0 && producerLint.warnings === 0 && producerLint.producers.length === 3, 'Targeted new producer lint evidence');
for (const producer of producerLint.producers) { const bytes = read(producer.path); assert(bytes.length === producer.bytes && sha(bytes) === producer.sha256, 'Exact linted producer bytes'); }
assert(sha(spec.split('## Suggested Review Order\n')[1]) === currentBinding.suggested_review_order_body_lf_sha256, 'Exact reviewed SRO body');
const rawInput = read(currentReview.input.path), contextLines = rawInput.toString().split('\n').map((line, i) => line === ' ' ? i + 1 : null).filter(Boolean);
assert(contextLines.length === 99 && JSON.stringify(contextLines) === JSON.stringify(f.preparation_integrity.raw_review_input_single_0x20_context_lines.one_based_lines) && f.preparation_integrity.raw_review_input_single_0x20_context_lines.all_within_exact_diff, 'Raw frozen input context format only');
const tenth = f.failed_checkpoint_histories[9];
assert(tenth.conclusion === 'FAILURE' && tenth.dependency_audit.exit_code === 1 && tenth.dependency_audit.high === 1 && tenth.dependency_audit.moderate === 4 && tenth.dependency_audit.public_advisory_id === 'GHSA-587h-7wmj-h5pm' && tenth.feature95.attempted === 0 && tenth.feature95.unexecuted === 95 && tenth.bootstrap67_separate.attempted === 0 && tenth.bootstrap67_separate.unexecuted === 67 && tenth.managed_runtime === 'UNEXECUTED' && tenth.prior43DB14browser === 'UNRESOLVED' && !tenth.whole_scope_reuse, 'Tenth early audit native truth/no borrowed tests');
const ninth = f.failed_checkpoint_histories[8];
assert(ninth.full_db.registered === 2039 && ninth.full_db.passed === 1944 && ninth.full_db.failed === 43 && ninth.full_db.skipped === 52 && ninth.full_db.files === 165 && ninth.full_db.story.attempted === 51 && ninth.full_db.story.passed === 8 && ninth.full_db.story.failed === 43 && ninth.full_db.story.skipped === 0 && ninth.full_db.non_story_failures === 0 && ninth.full_db.allocated_shared_policy_case === 'PASS', 'Ninth actual native counts');
const nt = ninth.fixture_report_transport;
assert(nt.failed_cases === 43 && nt.valid_closed_leaves === 44 && nt.ordered_single_leaf_cases === 42 && nt.ordered_two_leaf_case === 'INT009' && nt.all_stages === 'scenario' && nt.all_categories === 'unknown' && nt.sqlstate === null && nt.invalid === 0 && nt.known_sqlstates === 0 && nt.actual_cause_and_first_branch === 'UNKNOWN' && nt.safe_await_frames_not_original_origin && ninth.browser_artifact_privacy.content_checks === null && ninth.browser.story_failed === 14 && ninth.browser.failed_attempts_with_retries === 28 && ninth.db_wrapper.exact_key_deleted_confirmed && ninth.db_wrapper.custody === null, 'Ninth observed transport/UNKNOWN/cleanup/privacy limits');
const eighth = f.failed_checkpoint_histories[7];
assert(eighth.full_db.registered === 2039 && eighth.full_db.passed === 1944 && eighth.full_db.failed === 43 && eighth.full_db.skipped_pending === 52 && eighth.full_db.story.attempted === 51 && eighth.full_db.story.passed === 8 && eighth.full_db.story.failed === 43 && eighth.full_db.story.skipped === 0 && eighth.full_db.components.passed === 4 && eighth.full_db.components.failed === 0 && eighth.full_db.allocated_shared_policy_case === 'PASS' && eighth.feature95.attempted === 95 && eighth.feature95.passed === 38 && eighth.feature95.failed === 57 && eighth.feature95.unexecuted === 0, 'Eighth actual native failure counts');
assert(eighth.fixture_report_transport.leaf_availability === 'NOT_SERIALIZED' && eighth.fixture_report_transport.actual_cause === 'UNKNOWN_NOT_OBSERVABLE_IN_REPORT' && eighth.fixture_report_transport.valid_outer_group_markers === 43 && eighth.fixture_report_transport.leaf_prefix_candidates === 0 && eighth.fixture_report_transport.collector_positive_synthetic === 2 && eighth.fixture_report_transport.collector_negative_invalid_stage === 1 && eighth.fixture_report_transport.native_credit_for_collector_controls === 0 && eighth.browser_artifact_privacy.content_checks === null && eighth.browser.story_failed === 14 && eighth.browser.failed_attempts_with_retries === 28 && eighth.db_wrapper.exact_key_deleted_confirmed && eighth.db_wrapper.custody === null, 'Eighth bounded serialization/cleanup/privacy truth');
const seventh = f.failed_checkpoint_histories[6];
assert(seventh.full_db.registered === 2039 && seventh.full_db.passed === 1942 && seventh.full_db.failed === 45 && seventh.full_db.skipped_pending === 52 && seventh.feature95.attempted === 95 && seventh.feature95.passed === 37 && seventh.feature95.failed === 58 && seventh.feature95.unexecuted === 0 && seventh.first_fixture_failure_cause === 'UNKNOWN_LEAF_SQLSTATE_STAGE_RPCREACH_NOT_IN_NATIVE_REPORT', 'Seventh actual failure/unknown preservation');
assert(f.inventory.feature_source_blobs_unchanged_since_previous_freeze === false && f.inventory.feature_source_blobs_unchanged_since611 === false, 'Whole feature reuse invalidated');
const localSSR = f.actual_verification.historical_e74_isolated_ssr;
assert(localSSR.passed === 4 && localSSR.failed === 0 && localSSR.skipped === 0 && localSSR.config === false && localSSR.globalSetup.length === 0 && !localSSR.fixture_or_database && !localSSR.DOM_browser_focus_or_persistence_proof && !localSSR.current_application_bytes && !localSSR.current_run && localSSR.required_full_native_CI_still_pending, 'Bounded local SSR vs pending managed CI');
const provenance = f.git.original_pre_review_commit_provenance;
assert(git(['rev-parse', provenance.root_local_retention_ref]).toString().trim() === provenance.original && !ancestors.includes(provenance.original) && !provenance.original_is_additional_author_commit && !provenance.original_reviewed_or_native_qualified, 'Original nonancestry/local retention');
for (const row of provenance.native_payloads) assert(git(['cat-file', row.git_object_type, row.git_object_oid]).equals(read(row.path)), 'Original native Git payload');
assert(git(['diff', '--binary', provenance.original, prior, '--', 'tests/e2e/support/calendar-feed-atdd.ts']).equals(read(provenance.comment_only_diff.path)), 'Original comment-only diff binding');
assert(f.inventory.current_feature_cases === 95 && f.inventory.node_unit === 30 && f.inventory.native_vitest === 51 && f.inventory.browser === 14 && f.inventory.bootstrap_unit_cases_separate.count === 67 && f.pending_native_execution.all_current_head_native_unexecuted && !f.development_complete && !f.release_ready && f.not_delivery_record, 'Current inventory/pending completion');
const result = { kind: 'independent-build-parent-eleventh-source-freeze-check', status: 'PASS', source_head: head, capsule_bytes: raw.length, capsule_sha256: sha(raw), source_bindings: 69, raw_normalized_differences: rawDifferences, author_commits: 16, root_checkpoints_excluded: 10, attributed_ancestry: 26, prior_capsules_unchanged: 10, frozen_artifact_reference_occurrences: references, current_full_reference_count_matches_capsule: true, predecessor_ninth_count_qualification: { reported_core: 384, full: 385, unique: 329, exact_duplicate_location: 'preparation_integrity.raw_review_input_single_0x20_context_lines.artifact', old_capsule_sha256: nq.capsule.sha256, preserved: true }, parent_reader_stops: [], author_generator_reader_stops: [], prior_tenth_full_reference_count: 442, targeted_new_producer_lint: 'PASS_ZERO_ERRORS_WARNINGS_EXACT3', unique_frozen_artifact_paths: unique.size, historical_migrations: 109, protected_consumers: 37, historical_preparation: 69, failed_native_histories: 10, failed_checkpoint_actual_source_equalities: equalities, native_blob_batch_objects: objects.size, mutable_snapshot_rows: snapshots, historical_raw_uncredited_rows: 12, baseline_object_only_rows: 12, raw_frozen_context_lines: contextLines.length, composite_review: 'Historical33b NOTPASS resolved by historicale3 three-path PASS; historical objects reverified. Historicale74 five-path actual objects/two unchanged path dependencies; historical906 three-path actual objects superseded; historical380 four-path actual objects/three unchanged code paths; current exact55 dependency three-path High PASS, no post-review Spec drift', original_a84_retention_and_native_payloads: true, historical3383_spec_inversion_and_e472_4562_review_objects: true, kernel_sha256: sha(kernel), completed_broad_rounds: 3, inventory: { feature: 95, node: 30, vitest: 51, browser: 14, separate_injected_unit: 67, historical_isolated_local_SSR: 4 }, source_worktree_and_index_clean: true, global_clean_not_claimed: true, native_execution_by_parent: false, development_complete: false, release_ready: false, limits: 'Mechanical bindings/provenance only. Ten qualified failed native histories retain bounded positives; current55 managed native CI pending;67 in-memory Node controls have zero native case credit. Historical isolated SSR4 remains historical. Ninth transport is PRESENT with44valid scenario/unknown leaves across43cases; all backend causes/first branches remain UNKNOWN. Tenth audit failed before all later checks/runtime; current local highaudit0HIGH2MODERATE, fullcanonical lintINCOMPLETEexit1/cleanCIrequired. Dependency bytes invalidate whole old installed/runtime reuse. Dependency repair does not fix prior43DB14browser failures. Attachment content remains unavailable/unqualified. Pure-source tests do not prove full helper import/native caller behavior. No fourth broad review, delivery or DONE.', errors: [] };
fs.writeFileSync(path.join(root, prep, 'source-freeze-native-dependency-audit-repair-parent-check.json'), JSON.stringify(result, null, 2) + '\n');
process.stdout.write(JSON.stringify(result) + '\n');
