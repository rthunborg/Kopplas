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
const head = 'e74cae6cbb8ce21a5f65e74d21f3c60fbfb09314';
const historicalFixHead = 'e3f1c2e1c5db81947a48233da617ff8535fd24aa';
const prior = '33b595a8b7c001bd89788fb1c0e8cd9c626e03ec';
const base = '3a1c3bc9fbf22b13c926179288a8b6eefe440c12';
const raw = read(`${prep}/source-freeze-native-feature-five-path-repair.json`), f = JSON.parse(raw);
assert(raw.length === 547268 && sha(raw) === '496ecf7db6c475f26d4afbace6af8912d640c04e2043cf6840099920e95e9f78', 'Eighth capsule identity');
assert(f.schema_version === 8 && f.git.source_head === head && git(['rev-parse', 'HEAD']).toString().trim() === head, 'Current source/schema');
const predecessors = [
  ['source-freeze.json', '2d1e982a10701831a71b8da9cf13ac03234b41499ad525bb8d84464910094e03'],
  ['source-freeze-ci-repair.json', '8c6a67b9d4ba912311d888a2a63b1e7e628803395b791367e0b68c31d25072a7'],
  ['source-freeze-native-sql-repair.json', '3a4391820a34d7b9feca705d329e19eb2d7a5060f29edcfe53d5a7294c7a4c65'],
  ['source-freeze-native-setup-diagnostic.json', '0665da8a44b228583e2dfbd81be3266d6d7cfcd465b6558b7295c1ebfaeb7ee5'],
  ['source-freeze-native-privacy-preflight.json', '2ffc1ee4b9bebb6e1531467bc919a7c779a58befc1c1333cdba656179b1db68e'],
  ['source-freeze-native-authority-transport.json', '53868286b715fe0dc076db934d75a280b0b5d2c82d3b4aabab6505237504474c'],
  ['source-freeze-native-settlement-browser.json', '7c4a768acd75f470b9f101f5a8af96b37f19efcf058b293ef9dcf79065e57d7d'],
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
const expected = [...json(`${prep}/source-freeze-native-settlement-browser.json`).git.source_paths, 'tests/integration/rls/acceptance-tables-migration-reset.int.test.ts'].sort();
assert(expected.length === 68 && JSON.stringify([...f.git.source_paths].sort()) === JSON.stringify(expected), 'Source path union');
const union = new Set();
for (const c of f.git.source_commits) {
  for (const p of git(['diff-tree', '--no-commit-id', '--name-only', '-r', c.commit]).toString().trim().split('\n').filter(Boolean)) union.add(p);
  const message = git(['show', '-s', '--format=%B', c.commit]).toString();
  assert(/^[a-z]+\(story-15-5\): .+\n\n\S/.test(message), 'Author commit scope/body');
}
assert(f.git.source_commits.length === 13 && JSON.stringify([...union].sort()) === JSON.stringify(expected), 'Author attribution');
assert(JSON.stringify(f.git.root_bookkeeping_commits_excluded.map(x => x.commit).sort()) === JSON.stringify(historical.map(x => x[0]).sort()) && !f.git.root_metadata_in_author_source_commits, 'Root attribution');
const ancestors = git(['rev-list', `${base}..${head}`]).toString().trim().split('\n');
assert(ancestors.length === 20 && ancestors.every(x => f.git.source_commits.some(c => c.commit === x) || historical.some(c => c[0] === x)), 'Complete ancestry attribution');
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
assert(f.git.bindings.length === 68 && rawDifferences === 41, 'Source counts');
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
walk(f); assert(references === 332, 'Artifact reference count');
let snapshots = 0;
assert(f.git.root_metadata_snapshot.schema === 'observations-not-frozen-raw-artifacts', 'Mutable metadata schema');
for (const rows of Object.values(f.git.root_metadata_snapshot).filter(Array.isArray)) for (const row of rows) {
  const rev = row.historical_baseline_head ?? row.baseline_head;
  const rawNotCredited = row.status.startsWith('UNVERIFIED_UNCREDITED') || (row.status === 'BASELINE_OBJECT_ONLY_NO_CURRENT_RAW_OBSERVATION' && row.current_raw_not_resampled === true);
  assert(rawNotCredited && row.raw_bytes_durably_captured === false && row.baseline_blob_only_credited === true && (tree(rev).get(row.metadata_path) ?? null) === row.baseline_blob_oid_verified, 'Mutable raw snapshot/baseline distinction'); snapshots++;
}
assert(snapshots === 15, 'Mutable observation count');
let equalities = 0;
assert(f.failed_checkpoint_histories.length === 7, 'Seven failed histories');
for (const [checkpoint, source, count, sourceKey, failedKey, total, passed, failed] of historical) {
  const h = f.failed_checkpoint_histories.find(x => x.head === checkpoint);
  assert(h && h.source_equality_bindings.length === count && h.unit.total === total && h.unit.passed === passed && h.unit.failed === failed && h.unit.skipped === 0, 'Failed historical native truth');
  for (const b of h.source_equality_bindings) { assert(tree(source).get(b.path) === b[sourceKey] && tree(checkpoint).get(b.path) === b[failedKey] && b[sourceKey] === b[failedKey] && sha(object(b[sourceKey])) === b.sha256, 'Actual failed-head source equality'); equalities++; }
}
assert(equalities === 461, 'Failed-head equality count');
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
const currentReview = f.independent_review.native_feature_five_path_latest_delta_only;
assert(currentReview.source_head === head && currentReview.before === historical[6][0] && currentReview.verdict === 'PASS' && currentReview.finding_count === 0 && currentReview.model === 'gpt-6.1-sol' && currentReview.effort === 'high' && currentReview.context_free && currentReview.distinct_from_author && currentReview.latest_delta_only && currentReview.not_fourth_broad && currentReview.exact_current_spec_reviewed && !currentReview.post_review_spec_delta && !currentReview.runtime_credit, 'Current five-path code review');
const currentBinding = json(currentReview.input_binding.path);
assert(currentBinding.bindings.length === 5, 'Current five path count'); verifyReviewBinding(currentBinding, head);
for (const b of currentBinding.bindings) assert(read(b.path).length === b.raw_bytes && sha(read(b.path)) === b.raw_sha256, 'Current reviewed raw bytes');
const seventh = f.failed_checkpoint_histories[6];
assert(seventh.full_db.registered === 2039 && seventh.full_db.passed === 1942 && seventh.full_db.failed === 45 && seventh.full_db.skipped_pending === 52 && seventh.feature95.attempted === 95 && seventh.feature95.passed === 37 && seventh.feature95.failed === 58 && seventh.feature95.unexecuted === 0 && seventh.first_fixture_failure_cause === 'UNKNOWN_LEAF_SQLSTATE_STAGE_RPCREACH_NOT_IN_NATIVE_REPORT', 'Seventh actual failure/unknown preservation');
assert(f.inventory.feature_source_blobs_unchanged_since_previous_freeze === false && f.inventory.feature_source_blobs_unchanged_since611 === false, 'Whole feature reuse invalidated');
const localSSR = f.actual_verification.current_isolated_ssr;
assert(localSSR.passed === 4 && localSSR.failed === 0 && localSSR.skipped === 0 && localSSR.config === false && localSSR.globalSetup.length === 0 && !localSSR.fixture_or_database && !localSSR.DOM_browser_focus_or_persistence_proof && localSSR.current_application_bytes && localSSR.required_full_native_CI_still_pending, 'Bounded local SSR vs pending managed CI');
const provenance = f.git.original_pre_review_commit_provenance;
assert(git(['rev-parse', provenance.root_local_retention_ref]).toString().trim() === provenance.original && !ancestors.includes(provenance.original) && !provenance.original_is_additional_author_commit && !provenance.original_reviewed_or_native_qualified, 'Original nonancestry/local retention');
for (const row of provenance.native_payloads) assert(git(['cat-file', row.git_object_type, row.git_object_oid]).equals(read(row.path)), 'Original native Git payload');
assert(git(['diff', '--binary', provenance.original, prior, '--', 'tests/e2e/support/calendar-feed-atdd.ts']).equals(read(provenance.comment_only_diff.path)), 'Original comment-only diff binding');
assert(f.inventory.current_feature_cases === 95 && f.inventory.node_unit === 30 && f.inventory.native_vitest === 51 && f.inventory.browser === 14 && f.inventory.bootstrap_unit_cases_separate.count === 58 && f.pending_native_execution.all_current_head_native_unexecuted && !f.development_complete && !f.release_ready && f.not_delivery_record, 'Current inventory/pending completion');
const result = { kind: 'independent-build-parent-eighth-source-freeze-check', status: 'PASS', source_head: head, capsule_bytes: raw.length, capsule_sha256: sha(raw), source_bindings: 68, raw_normalized_differences: rawDifferences, author_commits: 13, root_checkpoints_excluded: 7, attributed_ancestry: 20, prior_capsules_unchanged: 7, frozen_artifact_reference_occurrences: references, unique_frozen_artifact_paths: unique.size, historical_migrations: 109, protected_consumers: 37, historical_preparation: 69, failed_native_histories: 7, failed_checkpoint_actual_source_equalities: equalities, native_blob_batch_objects: objects.size, uncredited_mutable_raw_observations_baseline_only: snapshots, composite_review: 'Historical33b NOTPASS resolved by historicale3 three-path PASS; historical objects reverified. Current exacte74 five-path High PASS, no post-review Spec drift', original_a84_retention_and_native_payloads: true, historical3383_spec_inversion_and_e472_4562_review_objects: true, kernel_sha256: sha(kernel), completed_broad_rounds: 3, inventory: { feature: 95, node: 30, vitest: 51, browser: 14, separate_injected_unit: 58, isolated_local_SSR: 4 }, source_worktree_and_index_clean: true, global_clean_not_claimed: true, native_execution_by_parent: false, development_complete: false, release_ready: false, limits: 'Mechanical bindings/provenance only. Seven qualified failed native histories retain their bounded positive facts; currente74 managed native CI pending; 58 Node and four isolated SSR are bounded local evidence. Attachment content remains unavailable/unqualified. Pure-source tests do not prove full helper import/native caller behavior. No fourth broad review, delivery or DONE.', errors: [] };
fs.writeFileSync(path.join(root, prep, 'source-freeze-native-feature-five-path-repair-parent-check.json'), JSON.stringify(result, null, 2) + '\n');
process.stdout.write(JSON.stringify(result) + '\n');
