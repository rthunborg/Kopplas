import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = 'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas';
const prep = '_bmad-output/auto-bmad/preparation/story-15-5';
const capsulePath = prep + '/source-freeze-native-denial-cause-proof.json';
const receiptPath = prep + '/source-freeze-native-denial-cause-proof-parent-check.json';
const verifierPath = prep + '/verify-source-freeze-native-denial-cause-proof-parent.mjs';
const head = 'af5af69fd5018795a963a28c1ad367147b4a9bc3';
const base = '3a1c3bc9fbf22b13c926179288a8b6eefe440c12';
const start = Date.now();
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = name => fs.readFileSync(path.isAbsolute(name) ? name : path.join(root, name));
const json = name => JSON.parse(read(name));
const assert = (ok, label) => { if (!ok) throw new Error(label); };
const git = (args, input) => execFileSync('git', args, { cwd: root, input, windowsHide: true, timeout: 30000, maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
const identity = (bytes, ref) => assert(bytes.length === ref.bytes && sha(bytes) === ref.sha256, 'Bound artifact identity: ' + ref.path);
const raw = read(capsulePath), f = JSON.parse(raw);
assert(raw.length === 852019 && sha(raw) === '23b1751be315acab911ae84bc864a0d9005513a4b9419332c50b3f2465b4fac9', 'Frozen twelfth capsule');
assert(f.schema_version === 12 && f.git.source_head === head && git(['rev-parse', 'HEAD']).toString().trim() === head, 'Current source and schema');
const trees = new Map();
const tree = rev => {
  if (!trees.has(rev)) {
    const rows = new Map();
    for (const row of git(['ls-tree', '-r', '-z', rev]).toString().split('\0').filter(Boolean)) {
      const at = row.indexOf('\t'); rows.set(row.slice(at + 1), row.slice(0, at).split(' ')[2]);
    }
    trees.set(rev, rows);
  }
  return trees.get(rev);
};

const old = json(prep + '/source-freeze-native-dependency-audit-repair.json');
const expectedPaths = [...old.git.source_paths, 'scripts/ci/checkpoint-dispatch.mjs'].sort();
assert(expectedPaths.length === 70 && JSON.stringify([...f.git.source_paths].sort()) === JSON.stringify(expectedPaths), 'Exact owned source union');
assert(f.git.bindings.length === 70 && f.git.source_commits.length === 19 && f.git.root_bookkeeping_commits_excluded.length === 11, 'Source attribution counts');
const authorUnion = new Set();
for (const row of f.git.source_commits) {
  const message = git(['show', '-s', '--format=%B', row.commit]).toString();
  assert(/^[a-z]+\(story-15-5\): .+\n\n\S/.test(message), 'Conventional author commit with body');
  for (const name of git(['diff-tree', '--no-commit-id', '--name-only', '-r', row.commit]).toString().trim().split('\n').filter(Boolean)) authorUnion.add(name);
}
assert(JSON.stringify([...authorUnion].sort()) === JSON.stringify(expectedPaths), 'Actual author commit union');
const ancestors = git(['rev-list', base + '..' + head]).toString().trim().split('\n');
const attributed = new Set([...f.git.source_commits, ...f.git.root_bookkeeping_commits_excluded].map(x => x.commit));
assert(ancestors.length === 30 && attributed.size === 30 && ancestors.every(x => attributed.has(x)) && !f.git.root_metadata_in_author_source_commits, 'Complete 19-author/11-Root ancestry');

const historical = [
  ['611c86295540161d31169110bf2139cf1d85d708', '9487c0d9dc6f622b472780587e20e834abf98595', 60],
  ['2674b3f7fa5e7853314923a0ceed52d84fcf0677', 'c57580580217e34a0b933a23f7c36737306333b7', 66],
  ['a76fc492a5273da776ba807559b2eb81d41bfe10', '1cea5c4caa4996566ca95f5b872c6623da22f807', 67],
  ['3383a1eb4607ddea035e79fb8433dc89a5137530', 'e91b366b8b362f8ffbd867940dfe1cd2d817e72b', 67],
  ['e472741a91f58c5ef9e623720e2bba0d1164c360', 'c7570096435dfbae2f6a535be46e61daaf9e28dc', 67],
  ['4562cfd0031b32b6921f668cd953384b64116973', 'fae644b5349744a531008e2224ca3a08d596836e', 67],
  ['e3f1c2e1c5db81947a48233da617ff8535fd24aa', 'cba60486b5e695b9796ef39d4492bc7f569d517b', 67],
  ['e74cae6cbb8ce21a5f65e74d21f3c60fbfb09314', '3e7b6131a00e6c7b4d25c49373d8ba1c1eefe42f', 68],
  ['906f80f301d8034f8efe510018137195f3e4c4eb', '6dad688ec6a51143bfee902618bb88647a81c940', 68],
  ['380c3e720d5caaa1dc2181d70737b9320337f451', 'be2c1a535dff0e58b1579fe3db5890c7819916ab', 68],
  ['55db468eef3106ca1b02dc846ba12967a28dc238', '56324120f8e08de995e8cc7432ab27f2d0c98635', 69],
];
const objects = new Set(f.git.bindings.map(x => x.head_blob.oid));
for (const h of f.failed_checkpoint_histories) for (const row of h.source_equality_bindings) for (const [key, value] of Object.entries(row)) if (key.endsWith('_blob')) objects.add(value);
const composite = f.independent_review.native_denial_cause_proof_composite;
for (const key of ['initial_cb8', 'corrective520', 'latest_F3']) for (const row of composite[key].path_coverage) objects.add(row.reviewed_oid);
const payload = git(['cat-file', '--batch'], [...objects].join('\n') + '\n'), blobs = new Map();
let offset = 0;
for (const oid of objects) {
  const at = payload.indexOf(10, offset), match = /^([a-f0-9]{40}) blob (\d+)$/.exec(payload.subarray(offset, at).toString());
  assert(match && match[1] === oid, 'Actual native object batch header');
  const size = Number(match[2]), from = at + 1;
  blobs.set(oid, payload.subarray(from, from + size)); assert(payload[from + size] === 10, 'Actual native object batch boundary'); offset = from + size + 1;
}
assert(offset === payload.length, 'Native object batch complete');
let differences = 0;
for (const row of f.git.bindings) {
  const bytes = read(row.path), oid = git(['hash-object', '--path=' + row.path, '--stdin'], bytes).toString().trim();
  identity(bytes, { path: row.path, ...row.raw_worktree });
  assert(oid === row.head_blob.oid && oid === row.git_clean_normalized.blob_oid && oid === tree(head).get(row.path), 'Actual clean/current source OID');
  identity(blobs.get(oid), { path: row.path, ...row.head_blob });
  identity(blobs.get(oid), { path: row.path, ...row.git_clean_normalized });
  if (sha(bytes) !== sha(blobs.get(oid))) differences++;
}
assert(differences === 41 && f.git.raw_normalized_difference_paths.length === 41, 'Actual raw/clean difference count');
for (const args of [['diff', '--name-only'], ['diff', '--cached', '--name-only']]) assert(!git(args).toString().trim().split('\n').some(x => expectedPaths.includes(x)), 'Source remains unstaged and unchanged');
let equalities = 0;
assert(f.failed_checkpoint_histories.length === 11, 'Eleven failed histories');
for (const [source, checkpoint, count] of historical) {
  const h = f.failed_checkpoint_histories.find(x => x.head === checkpoint);
  assert(h && h.source_equality_bindings.length === count, 'Exact failed source/checkpoint count');
  for (const row of h.source_equality_bindings) {
    const oids = Object.entries(row).filter(([key]) => key.endsWith('_blob')).map(([, value]) => value);
    assert(oids.length === 2 && oids[0] === oids[1] && tree(source).get(row.path) === oids[0] && tree(checkpoint).get(row.path) === oids[0] && sha(blobs.get(oids[0])) === row.sha256, 'Historical actual source/checkpoint equality'); equalities++;
  }
}
assert(equalities === 734, 'Historical equality total');
let migrations = 0, preparation = 0;
for (const [name, oid] of tree(base)) {
  if (name.startsWith('supabase/migrations/')) { assert(tree(head).get(name) === oid, 'Immutable historical SQL'); migrations++; }
  if (name.startsWith(prep + '/')) { assert(tree(head).get(name) === oid, 'Immutable original preparation'); preparation++; }
}
assert(migrations === 109 && preparation === 69 && f.ownership.protected_scheduling_and_consumer_paths.length === 37, 'Protected inventories');
for (const row of f.ownership.protected_scheduling_and_consumer_paths) assert(tree(base).get(row.path) === row.baseline_blob_oid && tree(head).get(row.path) === row.head_blob_oid && row.baseline_blob_oid === row.head_blob_oid, 'Protected consumer actual Git identity');

let refs = 0; const unique = new Set();
function walk(value, location = '') {
  if (location === 'git.root_metadata_snapshot') return;
  if (Array.isArray(value)) { value.forEach((item, index) => walk(item, location + '[' + index + ']')); return; }
  if (!value || typeof value !== 'object') return;
  if (typeof value.path === 'string' && typeof value.bytes === 'number' && typeof value.sha256 === 'string') {
    identity(read(value.path), value); refs++; unique.add(path.resolve(root, value.path));
  }
  for (const [key, child] of Object.entries(value)) walk(child, location ? location + '.' + key : key);
}
walk(f);
assert(refs === 631 && unique.size === 530 && f.preparation_integrity.frozen_artifact_reference_occurrences_verified === refs && f.preparation_integrity.unique_frozen_artifact_paths_verified === unique.size, 'All full recursive 631/530 references');
const rows = Object.values(f.git.root_metadata_snapshot).filter(Array.isArray).flat();
let rawUncredited = 0, baselineOnly = 0;
for (const row of rows) {
  const rev = row.historical_baseline_head ?? row.baseline_head;
  assert(row.raw_bytes_durably_captured === false && row.baseline_blob_only_credited === true && (tree(rev).get(row.metadata_path) ?? null) === row.baseline_blob_oid_verified, 'Separate actual baseline snapshot object');
  if (row.status.startsWith('UNVERIFIED_UNCREDITED')) rawUncredited++;
  else {
    assert(['BASELINE_OBJECT_ONLY_NO_CURRENT_RAW_OBSERVATION', 'HISTORICAL_BASELINE_OBJECT_ONLY_NO_RAW_OBSERVATION'].includes(row.status) && row.current_raw_not_resampled === true && !Object.keys(row).some(x => x.startsWith('observed_raw')), 'No invented baseline-only raw observation'); baselineOnly++;
  }
}
assert(rows.length === 27 && rawUncredited === 12 && baselineOnly === 15, 'Actual 27 raw-uncredited/baseline-only snapshots');
assert(f.immutable_predecessors.length === 11, 'Eleven immutable capsules');
for (const ref of f.immutable_predecessors) identity(read(ref.path), ref);
assert(f.predecessor_ninth_full_count_qualification.stored_core_occurrences === 384 && f.predecessor_ninth_full_count_qualification.actual_full_occurrences === 385 && f.predecessor_tenth_full_count_qualification.full_occurrences === 442 && f.predecessor_eleventh_full_count_qualification.full_occurrences === 500, 'Exact historical reference count qualifications');

assert(f.independent_review.completed_broad_rounds === 3 && f.independent_review.fourth_broad_round_permitted === false && composite.old_reviews_remain_NOTPASS && composite.no_retroactive_whole_PASS && composite.native_credit === 0, 'Cap and historical review preservation');
for (const [key, verdict, count] of [['initial_cb8', 'NOTPASS', 14], ['corrective520', 'NOTPASS', 7], ['latest_F3', 'PASS', 3]]) {
  const review = composite[key]; assert(review.verdict === verdict && review.path_coverage.length === count, 'Composite verdict/path counts');
  const attestation = json(review.original_attestation.path); assert(attestation.verdict === verdict && (attestation.source ?? attestation.head) === review.source, 'Original review identity/verdict');
  for (const row of review.path_coverage) assert(tree(review.source).get(row.path) === row.reviewed_oid && tree(head).get(row.path) === row.current_oid && sha(blobs.get(row.reviewed_oid)) === row.reviewed_sha256 && row.applies_to_current_bytes === (row.reviewed_oid === row.current_oid), 'Honest temporal composite coverage');
}
assert(composite.F1.startsWith('CLOSED at520') && composite.F2.startsWith('CLOSED at520') && composite.F3.startsWith('CLOSED by distinct current af5') && composite.current_closed_four_paths.length === 4, 'F1/F2/F3 explicit composite closure');
for (const name of composite.current_closed_four_paths) assert(tree(composite.corrective520.source).get(name) === tree(head).get(name), 'F1/F2 unchanged current actual bytes');
const spec = read(f.approved_intent.spec).toString().replace(/\r\n/g, '\n'), kernel = spec.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];
assert(Buffer.byteLength(kernel ?? '') === 5760 && sha(kernel ?? '') === '0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977' && (spec.match(/^## Suggested Review Order$/gm) ?? []).length === 1 && f.author_trail.verified_stops === 89, 'Approved kernel and single SRO89');
for (const stop of f.author_trail.stops) assert(read(stop.path).toString().replace(/\r\n/g, '\n').split('\n')[stop.line - 1]?.includes(stop.literal_anchor), 'Actual verified SRO anchor');
assert(f.inventory.current_feature_cases === 95 && f.inventory.node_unit === 30 && f.inventory.native_vitest === 51 && f.inventory.browser === 14 && f.actual_verification.current_dispatcher31_passed === true && f.actual_verification.current_combined117_or375_run === false && f.actual_verification.new_native_ci_dispatched === false, 'No fabricated aggregate/native credit');
assert(f.development_complete === false && f.release_ready === false && f.not_delivery_record === true, 'No premature completion');
const last = f.failed_checkpoint_histories.at(-1);
assert(last.conclusion === 'FAILURE' && last.run_id === 39507120872 && last.feature95.passed_cases === 38 && last.feature95.failed_cases === 57 && last.diagnostic_contract_localization.all_sqlstates_unavailable && last.browser.body_content === null && last.diagnostic_lane.startsWith('UNEXECUTED'), 'Eleventh actual failure remains unresolved');
const lines = [];
for (const input of f.preparation_integrity.raw_review_input_single_0x20_context_lines) {
  for (const ref of [input.artifact, { path: path.posix.join(path.posix.dirname(input.artifact.path), 'latest.diff') }]) {
    const bytes = read(ref.path), count = bytes.toString().split(/\r?\n/).filter(x => x === ' ').length;
    assert(count === input.count, 'Frozen raw input/diff context count'); lines.push({ path: ref.path, bytes: bytes.length, sha256: sha(bytes), single_space_context_lines: count });
  }
}
assert(lines.reduce((sum, x) => sum + x.single_space_context_lines, 0) === 88, 'Actual six frozen review inputs 88 context lines');
assert(!git(['diff', '--cached', '--name-only']).toString().trim(), 'Index remains empty');
const receipt = {
  schema_version: 1, kind: 'PARENT_INDEPENDENT_METADATA_IDENTITY_AND_PROVENANCE_CHECK', status: 'PASS',
  source: head, capsule: { path: capsulePath, bytes: raw.length, sha256: sha(raw) },
  verifier: { path: verifierPath, bytes: read(verifierPath).length, sha256: sha(read(verifierPath)) },
  actual: { source_paths: 70, raw_clean_differences: differences, author_commits: 19, root_commits: 11, ancestry: ancestors.length, full_recursive_refs: refs, unique_ref_paths: unique.size, historical_equalities: equalities, protected_SQL: migrations, protected_consumers: 37, original_preparation_blobs: preparation, snapshots: rows.length, historical_raw_uncredited: rawUncredited, baseline_only: baselineOnly, failed_histories: 11, prior_capsules: 11, native_object_batch_count: objects.size },
  review: { composite: 'cb8 NOTPASS;520 F1/F2 CLOSED but F3 NOTPASS;af5 F3 PASS', no_retroactive_whole_PASS: true, completed_broad_rounds: 3, fourth_broad: false, kernel_bytes: 5760, SRO_stops: 89 },
  raw_review_inputs: lines, producer_lint: f.targeted_new_producer_lint,
  reused_historical_proof: f.predecessor_eleventh_full_count_qualification,
  exact_recursive_skip: 'git.root_metadata_snapshot ONLY; actual baseline objects separately verified',
  archive_member_limit: 'member_* descriptor is not a physical loose-file reference; exact extraction and qualification refs verified',
  native_exit: 0, elapsed_ms: Date.now() - start, initial_parent_reader_failures: [],
  source_index_unchanged: true, global_clean_not_claimed: true, semantic_tests_rerun: false,
  native_or_diagnostic_credit: 0, private_consumer_created: false, source_edits: false, development_complete: false,
};
fs.writeFileSync(path.join(root, receiptPath), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ status: 'PASS', receipt: receiptPath, actual: receipt.actual, elapsed_ms: receipt.elapsed_ms }));
