#!/usr/bin/env python3
"""Exact-story, separately qualified blocked readmission. No Git/provider writes.

Evidence is data, never commands. External status authenticity and the complete
writer inventory remain the coordinator's responsibility. See the contract.
"""
import base64
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
HELPERS = ROOT / '.agents/skills/auto-bmad/scripts'


def local_module(name):
    spec = importlib.util.spec_from_file_location('runtime_admission_' + name, HELPERS / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


engine = local_module('parallel_run')
state_api = local_module('state_update')
require, keys = engine.require, engine.keys
RUN = 'e35-6-20261102'
STORY = 'spec-design-35-6-35-6'
FOLDER = '_bmad-output/specs/spec-design-35-6'
REPOSITORY = 'rthunborg/Kopplas'
PR = 127
RUNTIME = 'playwright.config.ts'
DOMAIN = 'test:general-browser-runtime'
OWN_STATE = '_bmad-output/auto-bmad/state/' + STORY + '.yaml'
OLD_PATHS = [
    'src/app/(app)/customers/[customerId]/page.tsx',
    'src/components/crm/CustomerDetail.tsx', 'src/components/crm/FacilityDialog.tsx',
    'src/components/crm/ContactDialog.tsx', 'src/components/crm/ArchiveButton.tsx',
    'tests/e2e/crm/customers.e2e.spec.ts',
    FOLDER + '/stories/35-6-crm-record-journeys.md', OWN_STATE,
    '_bmad-output/auto-bmad/reports/' + STORY + '.md',
    '_bmad-output/auto-bmad/delivery/' + STORY + '.json',
    '_bmad-output/test-artifacts/atdd-checklist-35-6-crm-record-journeys.md',
]
CI_JOBS = ['contracts (ubuntu-latest)', 'contracts (windows-latest)']
FIELDS = ['schema_version', 'request_id', 'run_id', 'story_id', 'owner', 'worker',
          'expected_generation', 'expected_plan_hash', 'expected_integration_sha',
          'checkpoint_sha', 'qualified_main_sha', 'workflow_version', 'add_write_paths',
          'add_conflict_domains', 'reason', 'scope_approval_ref', 'reviewed_tooling_sha',
          'tool_sha256', 'tooling_author', 'tooling_review', 'tooling_ci', 'quiescence',
          'ownership_inventory', 'own_state', 'publication', 'admission_review']


def tool_hash():
    return hashlib.sha256(Path(__file__).read_bytes().replace(b'\r\n', b'\n')).hexdigest()


def text(value):
    return isinstance(value, str) and bool(value.strip())


def parse_raw_json(data):
    """Parse exactly the captured byte sequence, rejecting duplicate object keys."""
    def unique(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, 'Duplicate JSON key: ' + key)
            result[key] = value
        return result
    return json.loads(data.decode('utf-8-sig'), object_pairs_hook=unique)


class Captures(list):
    """One initial byte capture/parse per reference, plus independent final reads."""
    def __init__(self):
        super().__init__()
        self.parsed = {}


def source_bytes(repo, ref):
    if 'commit' not in ref:
        keys(ref, ['path', 'sha256'])
        require(text(ref['path']) and Path(ref['path']).is_absolute(), 'Source needs an absolute file path')
        return Path(ref['path']).read_bytes()
    keys(ref, ['commit', 'path', 'sha256'])
    exact_sha(repo, ref['commit'])
    engine.path_token(ref['path'])
    require(not ref['path'].endswith('/'), 'Source blob must name a file')
    result = subprocess.run(['git', '-C', str(repo), 'show', ref['commit'] + ':' + ref['path']],
                            capture_output=True, timeout=30)
    require(result.returncode == 0, 'Missing bound source blob')
    return result.stdout


def capture(repo, ref, snapshots):
    require(isinstance(ref, dict) and isinstance(ref.get('sha256'), str) and
            re.fullmatch('[0-9a-f]{64}', ref['sha256']), 'Source needs a raw SHA256')
    for previous, data in snapshots:
        if previous == ref:
            return data
    data = source_bytes(repo, ref)
    require(hashlib.sha256(data).hexdigest() == ref['sha256'], 'Raw source hash mismatch')
    snapshots.append((copy.deepcopy(ref), data))
    return data


def artifact_json(ref, snapshots, repo=None):
    token = ('json', engine.canonical(ref))
    cache = getattr(snapshots, 'parsed', {})
    if token not in cache:
        cache[token] = parse_raw_json(capture(repo, ref, snapshots))
    return cache[token]


def state_bytes(data):
    class CapturedState:
        def read_text(self, encoding):
            return data.decode(encoding)
    return state_api.load_state(CapturedState())


def artifact_state(repo, ref, snapshots):
    token = ('state', engine.canonical(ref))
    cache = getattr(snapshots, 'parsed', {})
    if token not in cache:
        cache[token] = state_bytes(capture(repo, ref, snapshots))
    return cache[token]


def stopped_receipt(r, c, p, snapshots):
    q = r['quiescence']
    keys(q, ['coordinator', 'attested', 'complete_writer_inventory', 'evidence_path', 'evidence_sha256'])
    data = capture(None, {'path': q['evidence_path'], 'sha256': q['evidence_sha256']}, snapshots)
    stopped = engine.stopped_writers(r, c, p)
    require(stopped == parse_raw_json(data), 'Stopped-writer receipt differs from captured raw bytes')
    return stopped


def exact_sha(repo, value):
    require(isinstance(value, str) and re.fullmatch('[0-9a-f]{40,64}', value), 'Exact commit SHA required')
    require(engine.sha(repo, value) == value, 'Commit SHA mismatch')


def independent_review(value, commit, author, forbidden=()):
    engine.review(value, commit, author, ['transactional-integrity'])
    require(value['reviewer'] not in forbidden, 'Review must be independent of claim writers/coordinator')


def qualify_tooling(repo, p, c, r, snapshots, forbidden):
    root = engine.top(ROOT)
    require(root == ROOT and root in engine.worktrees(repo) and engine.common(root) == engine.common(repo),
            'Tooling must be its registered same-repository checkout')
    require(root not in {Path(p['integration_worktree']).resolve(), Path(c['worktree']).resolve()},
            'Tooling must be separate from live checkouts')
    engine.clean(root)
    require(engine.branch(root).startswith('codex/') and engine.sha(root, 'HEAD') == r['reviewed_tooling_sha'],
            'Tooling HEAD must equal independently reviewed SHA')
    require(r['tool_sha256'] == tool_hash(), 'Reviewed adapter hash mismatch')
    require(engine.workflow_version(root) == p['workflow_version'] ==
            engine.workflow_version(root, r['reviewed_tooling_sha']), 'Tooling changed the pinned workflow')
    require(engine.ancestor(repo, r['reviewed_tooling_sha'], r['qualified_main_sha']),
            'Reviewed tooling must already be on qualified main')
    require(text(r['tooling_author']), 'Tooling author required')
    independent_review(r['tooling_review'], r['reviewed_tooling_sha'], r['tooling_author'], forbidden)
    ci = artifact_json(r['tooling_ci'], snapshots)
    keys(ci, ['schema_version', 'repository', 'workflow', 'commit', 'result', 'checks', 'source_ref'])
    require(type(ci['schema_version']) is int and ci['schema_version'] == 1 and
            ci['repository'] == REPOSITORY and ci['workflow'] == '.github/workflows/auto-bmad-parallel.yml' and
            ci['commit'] == r['reviewed_tooling_sha'] and ci['result'] == 'passed' and text(ci['source_ref']),
            'Exact tooling-SHA contract CI evidence required')
    engine.checks(ci['checks'], CI_JOBS, r['reviewed_tooling_sha'])
    require(sorted(x['name'] for x in ci['checks']) == sorted(CI_JOBS), 'Both existing contract OS jobs required')


def store_snapshot(db, repo):
    """Public read-only snapshot builder; collect under the admission transaction.

    Includes raw anchor hashes and dirty status, so an inventory cannot silently
    omit a registered checkout or use stale producer/legacy ownership evidence.
    """
    store = {}
    for table in ['runs', 'claims', 'journal', 'verifications', 'story_pr_publications', 'claim_amendments']:
        values = [dict(row) for row in db.execute('SELECT * FROM ' + table)]
        store[table] = sorted(values, key=engine.canonical)
    trees = []
    for wt in sorted(engine.worktrees(repo), key=str):
        require(wt.is_dir() and engine.common(wt) == engine.common(repo), 'Registered checkout missing or common Git mismatch')
        state = wt / '_bmad-output/auto-bmad/state'
        anchors = []
        for path in sorted(list(state.glob('*.yaml')) + list((state / 'epic').glob('*.yaml'))):
            anchors.append({'path': path.relative_to(wt).as_posix(),
                            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
        trees.append({'worktree': str(wt), 'head': engine.sha(wt, 'HEAD'),
                      'branch': engine.git(wt, 'symbolic-ref', '--quiet', '--short', 'HEAD', check=False).stdout.strip(),
                      'status': engine.git(wt, 'status', '--porcelain'), 'anchors': anchors})
    return {'common_git': str(engine.common(repo)), 'store': store, 'worktrees': trees}


E15_KEYS = ['15-1-the-five-scheduling-views',
            '15-2-recurring-bookings-series-materialized-occurrences-exceptions',
            '15-3-conflict-resolver', '15-4-time-reporting-filing-timesheet-review',
            '15-5-personal-calendar-feed-adr-b004-surface-1', '15-6-min-dag-the-field-landing']
LEGACY = {
    'spec-design-35-2-35-2': ('stories', '_bmad-output/specs/spec-design-35-2', ['spec-design-35-2-35-2'], 115),
    'spec-design-35-4-35-4': ('stories', '_bmad-output/specs/spec-design-35-4', ['spec-design-35-4-35-4'], 121),
    'epic-15': ('sprint', None, E15_KEYS, 108),
}


def state_path(part):
    return '_bmad-output/auto-bmad/state/' + ('epic/' if part.startswith('epic-') else '') + part + '.yaml'


def scope_authorities(repo, scope, p, snapshots):
    keys(scope, ['write_paths', 'conflict_domains', 'bookkeeping_paths', 'authorities', 'coordinator', 'complete'])
    require(scope['coordinator'] == p['coordinator'] and scope['complete'] is True, 'Complete historical scope attestation required')
    for field in ['write_paths', 'bookkeeping_paths']:
        for path in engine.strings(scope[field], field):
            engine.path_token(path)
    require(scope['write_paths'] and set(scope['bookkeeping_paths']) <= set(scope['write_paths']), 'Full historical/bookkeeping scope required')
    engine.strings(scope['conflict_domains'], 'historical domains')
    require(isinstance(scope['authorities'], list) and scope['authorities'], 'Historical scope authorities required')
    authorities = []
    for source in scope['authorities']:
        keys(source, ['role', 'ref'])
        require(source['role'] in {'plan', 'binding', 'allocation', 'amendment', 'spec', 'bookkeeping'}, 'Unknown scope authority role')
        data = capture(repo, source['ref'], snapshots)
        value = artifact_json(source['ref'], snapshots, repo) if data.lstrip(b'\xef\xbb\xbf \r\n\t').startswith(b'{') else None
        authorities.append((source, value))
    require(len({engine.canonical(source) for source, _ in authorities}) == len(authorities), 'Duplicate scope authority')
    return authorities


def scoped_observation(repo, ref, subject, scope, snapshots):
    """Strict scoped projection over preserved native read_thread observations."""
    projection = artifact_json(ref, snapshots, repo)
    keys(projection, ['schema_version', 'identity', 'subject_digest', 'scope_digest', 'scoped_turn_ids', 'native_ref'])
    require(type(projection['schema_version']) is int and projection['schema_version'] == 1 and
            projection['subject_digest'] == engine.digest(subject) and projection['scope_digest'] == engine.digest(scope),
            'Scoped actor observation identity/digests mismatch')
    ids = engine.strings(projection['scoped_turn_ids'], 'scoped turn IDs')
    require(ids, 'Historical scoped turns required')
    native = artifact_json(projection['native_ref'], snapshots, repo)
    require(isinstance(native, dict) and native.get('source') == 'codex_app.read_thread' and
            native.get('threadId') == projection['identity'] and isinstance(native.get('turns'), list) and
            all(isinstance(turn, dict) for turn in native['turns']) and
            isinstance(native.get('page'), dict) and native['page'].get('order') == 'newest_first',
            'Actual native actor/turn observation required')
    selected = [turn for turn in native['turns'] if turn.get('id') in ids]
    require(len(selected) == len(ids) and {turn.get('id') for turn in selected} == set(ids), 'Missing or duplicate scoped actor turn')
    require(all(turn.get('status') in {'completed', 'failed', 'interrupted'} for turn in selected), 'Scoped actor has a nonterminal turn')
    children = set()
    for turn in selected:
        require(isinstance(turn.get('children'), list), 'Complete scoped descendant observation required')
        for event in turn['children']:
            require(isinstance(event, dict), 'Invalid scoped child observation')
            if event.get('type') == 'subAgentActivity' or 'agentThreadId' in event:
                require(text(event.get('agentThreadId')), 'Scoped descendant identity missing')
                children.add(event['agentThreadId'])
    return projection['identity'], selected, children


def terminal_scope(repo, proof, subject, scope, binding_owners, p, r, snapshots):
    keys(proof, ['coordinator', 'subject_digest', 'scope_digest', 'complete_writer_inventory',
                 'no_reopen_attested', 'owners', 'writers', 'raw_observations'])
    require(proof['coordinator'] == p['coordinator'] and proof['subject_digest'] == engine.digest(subject) and
            proof['scope_digest'] == engine.digest(scope) and proof['complete_writer_inventory'] is True and
            proof['no_reopen_attested'] is True, 'Complete scoped no-reopen attestation required')
    owners = engine.strings(proof['owners'], 'historical owners')
    require(set(owners) == binding_owners and subject['owner'] in owners, 'Every bound source owner must be a graph root')
    require(isinstance(proof['writers'], list) and proof['writers'] and
            isinstance(proof['raw_observations'], list) and proof['raw_observations'], 'Complete recursive historical writer graph required')
    observations = {}
    for ref in proof['raw_observations']:
        key = engine.canonical(ref)
        require(key not in observations, 'Duplicate scoped observation')
        observations[key] = scoped_observation(repo, ref, subject, scope, snapshots)
    nodes = {}
    for writer in proof['writers']:
        keys(writer, ['identity', 'parent', 'role', 'closure_turn_id', 'observation_ref', 'state'])
        identity = writer['identity']
        require(text(identity) and identity not in nodes and text(writer['role']) and writer['state'] == 'terminal-for-scope',
                'Historical writer identity/state invalid')
        key = engine.canonical(writer['observation_ref'])
        require(key in observations, 'Historical writer lacks raw scoped observation')
        observed, turns, _ = observations[key]
        closure = next((turn for turn in turns if turn['id'] == writer['closure_turn_id']), None)
        require(observed == identity and closure is not None and closure['status'] == 'completed' and
                isinstance(closure.get('finals'), list) and closure['finals'] and all(text(x) for x in closure['finals']),
                'Actual completed historical closure turn/statement required')
        require(turns[0]['id'] == writer['closure_turn_id'], 'Closure is not the latest selected scoped turn')
        require((writer['parent'] is None) == (identity in owners), 'Every bound owner, and only owners, must be a graph root')
        nodes[identity] = writer
    require(set(nodes) >= set(owners) and len(observations) == len(nodes), 'Scoped graph owner/observation coverage mismatch')
    for identity, writer in nodes.items():
        _, _, children = observations[engine.canonical(writer['observation_ref'])]
        require(all(child in nodes and nodes[child]['parent'] == identity for child in children), 'Observed scoped descendant omitted or reparented')
        if writer['parent'] is not None:
            parent = nodes.get(writer['parent'])
            require(parent is not None and identity in observations[engine.canonical(parent['observation_ref'])][2], 'Unobserved historical writer edge')
        seen, current = set(), identity
        while current is not None:
            require(current not in seen, 'Historical writer graph cycle')
            seen.add(current)
            require(current in nodes, 'Historical writer parent missing')
            current = nodes[current]['parent']
    require(r['admission_review']['review']['reviewer'] not in nodes, 'Admission reviewer owns historical closure evidence')
    return sorted(nodes)


def finalized_closure(db, repo, entry, authorities, main, snapshots):
    proof, subject, scope = entry['proof'], entry['subject'], entry['scope']
    keys(proof, ['run_id', 'plan_hash', 'final_sha', 'verification_sha'])
    row = db.execute('SELECT * FROM runs WHERE run=?', (proof['run_id'],)).fetchone()
    require(row is not None and row['state'] == 'finalized', 'Historical run is not finalized')
    plan = parse_raw_json(row['plan'].encode())
    require(engine.digest(plan) == row['plan_hash'] == proof['plan_hash'], 'Historical plan integrity failure')
    require(subject == {'key': row['run'], 'owner': row['owner'], 'source_kind': 'parallel-run',
                        'source_folder': None, 'story_keys': [s['id'] for s in plan['stories']], 'branch': plan['integration_branch']},
            'Finalized subject identity mismatch')
    require(any(source['role'] == 'plan' and value == plan for source, value in authorities), 'Entire original stored plan authority required')
    paths = sorted(set(plan['shared_paths']) | {path for story in plan['stories'] for path in story['write_paths']})
    domains = sorted({domain for story in plan['stories'] for domain in story['conflict_domains']})
    books = sorted({path for path in paths if path.startswith('_bmad-output/')} | set(plan['shared_paths']))
    require(scope['write_paths'] == paths and scope['conflict_domains'] == domains and scope['bookkeeping_paths'] == books,
            'Finalized full scope must exactly conserve plan stories/shared paths')
    final = row['final_sha']
    exact_sha(repo, final)
    require(final == proof['final_sha'] == proof['verification_sha'] and engine.ancestor(repo, final, main), 'Finalized main ancestry mismatch')
    checks = {v['story']: v['sha'] for v in db.execute('SELECT * FROM verifications WHERE run=?', (row['run'],))}
    claims = engine.rows(db, row['run'])
    require(set(claims) == set(subject['story_keys']) and checks.get('__final__') == final, 'Missing finalized claims/final verification')
    commits = {plan['base_sha'], final}
    require(engine.workflow_version(repo, plan['base_sha']) == plan['workflow_version'], 'Historical workflow pin mismatch')
    for story in plan['stories']:
        content = engine.source_blob(repo, plan['base_sha'], story['spec_path'])
        require(hashlib.sha256(content).hexdigest() == story['spec_revision'], 'Historical approved spec pin mismatch')
        claim = claims[story['id']]
        require(claim['state'] == 'integrated' and checks.get(story['id']) == claim['integration_sha'], 'Historical claim not integrated/verified')
        for field in ['base_sha', 'result_sha', 'integration_sha']:
            exact_sha(repo, claim[field])
            commits.add(claim[field])
        require(claim['result_sha'] != claim['base_sha'] and engine.ancestor(repo, plan['base_sha'], claim['base_sha']) and
                engine.ancestor(repo, claim['base_sha'], claim['result_sha']) and
                engine.ancestor(repo, claim['result_sha'], claim['integration_sha']) and engine.ancestor(repo, claim['integration_sha'], final),
                'Historical claim ancestry mismatch')
    require(not db.execute("SELECT 1 FROM journal WHERE run=? AND state!='merged'", (row['run'],)).fetchone() and
            not db.execute("SELECT 1 FROM story_pr_publications WHERE run=? AND state!='verified'", (row['run'],)).fetchone(),
            'Historical finalized operation remains unresolved')
    for journal in db.execute('SELECT * FROM journal WHERE run=?', (row['run'],)):
        claim = claims.get(journal['story'])
        require(claim is not None and journal['result_sha'] == claim['result_sha'] and
                journal['after_sha'] == claim['integration_sha'], 'Historical merged journal lacks integrated backing')
    return {'plan': plan, 'provenance_commits': sorted(commits),
            'external_legacy_reservations': copy.deepcopy(plan['legacy_reservations'])}


def legacy_closure(repo, entry, authorities, p, r, snapshots):
    subject, proof, scope = entry['subject'], entry['proof'], entry['scope']
    require(subject['key'] in LEGACY, 'Unsupported historical legacy subject')
    kind, folder, story_keys, number = LEGACY[subject['key']]
    require(subject['source_kind'] == kind and subject['source_folder'] == folder and subject['story_keys'] == story_keys,
            'Legacy source identity mismatch')
    keys(proof, ['main_sha', 'terminal_states', 'source_bindings', 'publications', 'terminal_scope'])
    require(proof['main_sha'] == r['qualified_main_sha'], 'Legacy closure main changed')
    parts = story_keys + (['epic-15'] if kind == 'sprint' else [])
    require(isinstance(proof['terminal_states'], list) and len(proof['terminal_states']) == len(parts), 'Complete terminal main counterparts required')
    states = {}
    for item in proof['terminal_states']:
        keys(item, ['subject_part', 'ref'])
        part, ref = item['subject_part'], item['ref']
        require(isinstance(ref, dict) and part in parts and part not in states and ref.get('commit') == proof['main_sha'] and ref.get('path') == state_path(part),
                'Wrong or duplicate terminal main counterpart')
        state = artifact_state(repo, ref, snapshots)
        require(state.get('status') == 'done' and state.get('story_key') == part and state.get('branch') == subject['branch'] and
                state.get('story_source') == kind, 'Legacy main state identity/status mismatch')
        if kind == 'stories':
            require(state.get('story_id') == ('35-2' if number == 115 else '35-4'), 'Legacy original story ID mismatch')
        else:
            require(str(state.get('epic_num')) == '15', 'Legacy epic identity mismatch')
        require(state.get('pr_url') == 'https://github.com/' + REPOSITORY + '/pull/' + str(number), 'Legacy main publication identity mismatch')
        states[part] = state
    require(isinstance(proof['source_bindings'], list) and proof['source_bindings'], 'Legacy source binding required')
    owners, locations, bindings, binding_refs = set(), set(), [], set()
    for binding in proof['source_bindings']:
        keys(binding, ['ref', 'source_folder', 'locations', 'owner'])
        ref = binding['ref']
        expected_path = folder + '/source-binding.json' if folder else state_path('epic-15')
        require(isinstance(ref, dict) and ref.get('commit') == proof['main_sha'] and ref.get('path') == expected_path and binding['source_folder'] == folder and
                binding['owner'] == subject['owner'], 'Legacy authoritative binding identity mismatch')
        token = engine.canonical(ref)
        require(token not in binding_refs, 'Duplicate legacy source binding')
        binding_refs.add(token)
        require(any(source['role'] == 'binding' and source['ref'] == ref for source, _ in authorities), 'Full source binding omitted from scope authority')
        value = artifact_json(ref, snapshots, repo) if folder else artifact_state(repo, ref, snapshots)
        bindings.append(value)
        owners.add(binding['owner'])
        require(binding['locations'], 'Explicit original/closeout source locations required')
        for location in engine.strings(binding['locations'], 'source locations'):
            locations.add(engine.source_root(location))
    require(subject['owner'] in owners, 'Historical source owner missing')
    required_paths, required_domains = set(), set()
    def allocations(value):
        if isinstance(value, dict):
            for key, val in value.items():
                if key in {'write_paths', 'production_write_paths', 'test_write_paths', 'bookkeeping_paths'}:
                    required_paths.update(engine.strings(val, 'original allocation paths'))
                if key in {'conflict_domains', 'shared_domains'}:
                    required_domains.update(engine.strings(val, 'original semantic domains'))
                if key == 'allocation' and isinstance(val, dict) and 'paths' in val:
                    required_paths.update(engine.strings(val['paths'], 'original allocation paths'))
                allocations(val)
        elif isinstance(value, list):
            for val in value:
                allocations(val)
    for _, value in authorities:
        allocations(value)
    if number == 115:
        binding = next((value for value in bindings if value.get('executionId') == '35-2'), None)
        require(binding is not None and isinstance(binding.get('sourceFiles'), dict), '35.2 original source binding required')
        allocation_path = 'docs/quality/story-35-2-approved-admission-2026-10-28.json'
        allocation = next(((source, value) for source, value in authorities if source['role'] == 'allocation' and
                           source['ref'].get('path', '').replace('\\', '/').endswith(allocation_path)), None)
        allocation_bytes = capture(repo, allocation[0]['ref'], snapshots) if allocation is not None else b''
        require(allocation is not None and allocation[1].get('allocation', {}).get('ownerChat') == subject['owner'] and
                allocation[1]['allocation'].get('branch') == subject['branch'] and
                binding['sourceFiles'].get(allocation_path) in {
                    hashlib.sha256(allocation_bytes).hexdigest(),
                    hashlib.sha256(allocation_bytes.replace(b'\r\n', b'\n')).hexdigest()},
                '35.2 full initial allocation authority missing or mismatched')
    elif number == 121:
        require(any(value.get('story_id') == '35-4' and value.get('owner_chat') == subject['owner'] and
                    value.get('branch') == subject['branch'] and value.get('production_write_paths') and
                    RUNTIME in value.get('test_write_paths', []) for value in bindings), '35.4 full production/test binding required')
    else:
        require(subject['owner'] == '01a120bb-ec6d-7611-9dde-ca64bc8e280f', 'E15 historical owner mismatch')
        allocations(states['epic-15'])
    require(required_paths and required_paths <= set(scope['write_paths']) and required_domains <= set(scope['conflict_domains']) and
            {state_path(part) for part in parts} <= set(scope['bookkeeping_paths']), 'Historical scope arrays/bookkeeping were reduced')
    require(any(source['role'] == 'allocation' and isinstance(value, dict) for source, value in authorities), 'Full legacy allocation register required')
    if folder:
        require(all(text(state.get('spec_folder')) and engine.source_root(state['spec_folder']) in locations for state in states.values()),
                'Legacy closeout source location not bound')
    publications = proof['publications']
    require(isinstance(publications, list) and len(publications) == (2 if number == 121 else 1), 'Complete historical publications required')
    branches = {subject['branch']}
    if number == 121:
        branches.add(states[subject['key']].get('overrides', {}).get('process_closeout_branch'))
        require(len(branches) == 2 and all(text(x) for x in branches), 'Recorded historical closeout branch required')
    seen = set()
    for publication in publications:
        keys(publication, ['repository', 'pr_number', 'pr_url', 'head_branch', 'base_branch', 'base_sha', 'head_sha',
                           'merged', 'merge_sha', 'observation_ref'])
        branch_name = publication['head_branch']
        expected_number = number if branch_name == subject['branch'] else 122
        require(branch_name in branches and branch_name not in seen and publication['repository'] == REPOSITORY and
                type(publication['pr_number']) is int and publication['pr_number'] == expected_number and
                publication['pr_url'] == 'https://github.com/' + REPOSITORY + '/pull/' + str(expected_number) and
                publication['base_branch'] == 'main' and publication['merged'] is True, 'Historical publication identity mismatch')
        seen.add(branch_name)
        observed = artifact_json(publication['observation_ref'], snapshots, repo)
        require(isinstance(observed, dict) and all(observed.get(k) == publication[k] for k in ['repository', 'pr_number', 'pr_url', 'head_branch', 'base_branch',
                                                               'head_sha', 'merged', 'merge_sha']), 'Actual merged publication observation mismatch')
        for field in ['base_sha', 'head_sha', 'merge_sha']:
            exact_sha(repo, publication[field])
        require(engine.git(repo, 'rev-list', '--parents', '-n', '1', publication['merge_sha']).split()[1:] ==
                [publication['base_sha'], publication['head_sha']] and engine.ancestor(repo, publication['merge_sha'], proof['main_sha']),
                'Historical publication merge ancestry mismatch')
        if branch_name == subject['branch'] and folder:
            require(states[subject['key']].get('pr_merged') is True and
                    states[subject['key']].get('merge_commit') == publication['merge_sha'], 'Legacy merged state fields mismatch')
    writers = terminal_scope(repo, proof['terminal_scope'], subject, scope, owners, p, r, snapshots)
    return {'terminal_states': states, 'source_locations': sorted(locations), 'historical_writers': writers}


def closed_classifications(db, repo, inventory, p, r, snapshots):
    entries = inventory.get('closed_anchors', [])
    require(isinstance(entries, list), 'closed_anchors must be an array')
    seen_ids, seen_subjects, refs, decisions = set(), set(), {}, []
    for entry in entries:
        keys(entry, ['id', 'kind', 'subject', 'scope', 'anchors', 'proof'])
        subject = entry['subject']
        keys(subject, ['key', 'owner', 'source_kind', 'source_folder', 'story_keys', 'branch'])
        require(text(entry['id']) and re.fullmatch('[A-Za-z0-9][A-Za-z0-9._-]{0,127}', entry['id']) and entry['id'] not in seen_ids,
                'Invalid/duplicate closed classification ID')
        require(text(subject['key']) and subject['key'] not in seen_subjects and text(subject['owner']) and text(subject['branch']),
                'Invalid/duplicate closed subject')
        engine.strings(subject['story_keys'], 'closed subject stories')
        seen_ids.add(entry['id']); seen_subjects.add(subject['key'])
        aliases = {subject['key']} | set(subject['story_keys'])
        if subject['key'] in LEGACY:
            aliases.update(({'15', 'epic-15'} | {f'15.{i}' for i in range(1, 7)} | {f'15-{i}' for i in range(1, 7)})
                           if subject['key'] == 'epic-15' else
                           {'35-2', '35.2'} if LEGACY[subject['key']][3] == 115 else {'35-4', '35.4'})
        aliases = {value.casefold() for value in aliases}
        # No closed annotation can override a current/reopened native or legacy owner.
        for claim in inventory['snapshot']['store']['claims']:
            if claim['state'] == 'integrated':
                continue
            row = next((row for row in inventory['snapshot']['store']['runs'] if row['run'] == claim['run']), None)
            require(row is not None, 'Live claim lacks run')
            op = parse_raw_json(row['plan'].encode()); story = engine.story(op, claim['story'])
            folder = subject['source_folder'].casefold() if subject['source_kind'] == 'stories' else None
            same_source = folder is not None and (
                story.get('source', {}).get('spec_folder', '').casefold() == folder or
                story['spec_path'].casefold().startswith(folder + '/'))
            same_epic = subject['key'] == 'epic-15' and op.get('story_source') == 'sprint' and str(op['epic']) == '15'
            require(claim['run'] != subject['key'] and claim['story'].casefold() not in aliases and
                    str(op['epic']).casefold() not in aliases and
                    not same_source and not same_epic and claim['branch'] != subject['branch'], 'Closed subject has outstanding/reopened claim')
        for reservation in inventory['reservations']:
            value = reservation['reservation']
            require(str(value['epic']).casefold() not in aliases and
                    not {story.casefold() for story in value['stories']}.intersection(aliases),
                    'Closed subject has live legacy reservation')
        authorities = scope_authorities(repo, entry['scope'], p, snapshots)
        if entry['kind'] == 'finalized-run':
            decision = finalized_closure(db, repo, entry, authorities, r['qualified_main_sha'], snapshots)
            for claim in inventory['snapshot']['store']['claims']:
                row = next(row for row in inventory['snapshot']['store']['runs'] if row['run'] == claim['run'])
                other_plan = parse_raw_json(row['plan'].encode())
                require(claim['state'] == 'integrated' or str(other_plan['epic']) != str(decision['plan']['epic']),
                        'Finalized subject has outstanding/reopened epic claim')
            require(not any(str(res['reservation']['epic']) == str(decision['plan']['epic'])
                            for res in inventory['reservations']), 'Finalized subject has live legacy reservation')
        elif entry['kind'] == 'legacy-main':
            decision = legacy_closure(repo, entry, authorities, p, r, snapshots)
        else:
            raise engine.Refusal('Unsupported closed classification kind')
        require(isinstance(entry['anchors'], list) and entry['anchors'], 'Exact historical anchor references required')
        for anchor in entry['anchors']:
            keys(anchor, ['worktree', 'branch', 'head', 'path', 'sha256', 'subject_part', 'blob_commit', 'blob_sha256'])
            wt = Path(anchor['worktree']).resolve(); engine.path_token(anchor['path'])
            tree = next((tree for tree in inventory['snapshot']['worktrees'] if Path(tree['worktree']).resolve() == wt), None)
            require(tree is not None and tree['head'] == anchor['head'] == anchor['blob_commit'] and tree['branch'] == anchor['branch'] and
                    {'path': anchor['path'], 'sha256': anchor['sha256']} in tree['anchors'] and wt in engine.worktrees(repo) and
                    engine.common(wt) == engine.common(repo), 'Historical registered checkout/anchor identity changed')
            key = (str(wt), anchor['path'])
            require(key not in refs and not any(Path(res['reservation']['worktree']).resolve() == wt and anchor['path'] in res['anchors']
                                               for res in inventory['reservations']), 'Duplicate or live-reserved closed anchor')
            raw_ref = {'path': str(wt / anchor['path']), 'sha256': anchor['sha256']}
            content = capture(repo, raw_ref, snapshots); state = artifact_state(repo, raw_ref, snapshots)
            blob = capture(repo, {'commit': anchor['blob_commit'], 'path': anchor['path'], 'sha256': anchor['blob_sha256']}, snapshots)
            require(content.replace(b'\r\n', b'\n') == blob.replace(b'\r\n', b'\n') and
                    state.get('status') not in {'done', 'completed', 'abandoned'}, 'Historical marker must be exact committed nonterminal bytes')
            part = anchor['subject_part']
            if entry['kind'] == 'finalized-run':
                plan = decision['plan']
                is_epic = part == 'epic-' + str(plan['epic']) and anchor['path'] == state_path(part)
                declared = part in subject['story_keys'] and anchor['path'] in engine.story(plan, part)['write_paths']
                require(state.get('parallel_run_id') == subject['key'] and (is_epic or declared), 'Historical finalized marker source mismatch')
                require(any(engine.git(repo, 'cat-file', '-e', commit + ':' + anchor['path'], check=False).returncode == 0 and
                            engine.source_blob(repo, commit, anchor['path']) == content.replace(b'\r\n', b'\n')
                            for commit in decision['provenance_commits']), 'Historical inherited marker provenance missing')
            else:
                require(part in decision['terminal_states'] and anchor['path'] == state_path(part) and state.get('story_key') == part and
                        state.get('branch') == subject['branch'] and state.get('story_source') == subject['source_kind'], 'Historical legacy marker source mismatch')
                if subject['source_folder']:
                    location = engine.source_root(str(wt / subject['source_folder']))
                    require(engine.source_root(state.get('spec_folder', '')) == location and location in decision['source_locations'] and
                            state.get('story_id') == decision['terminal_states'][part].get('story_id'), 'Historical execution source location mismatch')
                else:
                    require(str(state.get('epic_num')) == '15', 'Historical legacy epic marker mismatch')
            refs[key] = entry['id']
        decisions.append({'id': entry['id'], 'kind': entry['kind'], 'subject': subject, 'scope': entry['scope'], 'proof': decision})
    return refs, decisions


def ownership(db, repo, p, c, revised_story, r, snapshots):
    inventory = artifact_json(r['ownership_inventory'], snapshots)
    require(isinstance(inventory, dict), 'Expected ownership inventory object')
    version = inventory.get('schema_version')
    keys(inventory, ['schema_version', 'coordinator', 'attested', 'complete', 'snapshot', 'reservations'] +
         (['closed_anchors'] if type(version) is int and version == 2 else []))
    require(type(version) is int and version in {1, 2} and
            inventory['coordinator'] == p['coordinator'] and inventory['attested'] is True and inventory['complete'] is True,
            'Complete coordinator-attested ownership inventory required')
    require(inventory['snapshot'] == store_snapshot(db, repo), 'Ownership inventory/store/worktrees changed')
    plans = []
    for row in inventory['snapshot']['store']['runs']:
        op = json.loads(row['plan'])
        require(engine.digest(op) == row['plan_hash'], 'Other plan integrity failure')
        if row['state'] != 'finalized':
            authority = Path(op['integration_worktree']).resolve()
            require(authority in engine.worktrees(repo) and engine.common(authority) == engine.common(repo),
                    'Other plan authoritative checkout must be registered in the same repository')
            engine.validate_plan(authority, op)
            plans.append(op)
            require(not any(engine.overlap(x, y) for x in revised_story['write_paths'] for y in op['shared_paths']),
                    'Admission overlaps coordinator shared paths')
    byrun = {op['run_id']: op for op in plans}
    for other in inventory['snapshot']['store']['claims']:
        if other['state'] == 'integrated' or (other['run'], other['story']) == (RUN, STORY):
            continue
        require(other['run'] in byrun, 'Live claim has no active plan')
        op = byrun[other['run']]
        os = engine.story(op, other['story'])
        require(not engine.conflicts(revised_story, os), 'Admission conflicts with repository claim')
        require(other['worker'] != c['worker'] and Path(other['worktree']).resolve() != Path(c['worktree']).resolve(),
                'Worker identity already reserved elsewhere')
        if op.get('schema_version') == 2:
            require(engine.source_identity(revised_story) != engine.source_identity(os) and
                    revised_story.get('independent_of_pending') is True and os.get('independent_of_pending') is True,
                    'Reviewed concurrent source independence required')
    reservations = inventory['reservations']
    require(isinstance(reservations, list), 'Ownership reservations must be an array')
    declared = [res for op in plans for res in op['legacy_reservations']]
    require(all(any(entry.get('reservation') == res for entry in reservations) for res in declared),
            'Inventory omitted declared legacy reservation')
    seen = set()
    for entry in reservations:
        keys(entry, ['reservation', 'head', 'source_status', 'evidence_ref', 'independent', 'independence_ref', 'anchors'])
        res = entry['reservation']
        keys(res, ['epic', 'stories', 'reason', 'worktree', 'write_paths', 'conflict_domains'])
        require(all(text(res[field]) for field in ['epic', 'reason', 'worktree']) and Path(res['worktree']).is_absolute(),
                'Reservation identity/reason and absolute checkout required')
        engine.strings(res['stories'], 'reservation stories')
        engine.strings(res['conflict_domains'], 'reservation domains')
        require(engine.strings(res['write_paths'], 'reservation paths'), 'Reservation scope cannot be empty')
        for token in res['write_paths']:
            engine.path_token(token)
        wt = Path(res['worktree']).resolve()
        require(wt in engine.worktrees(repo) and engine.sha(wt, 'HEAD') == entry['head'], 'Reservation checkpoint changed')
        key = engine.digest(res)
        require(key not in seen, 'Duplicate inventory reservation')
        seen.add(key)
        require(entry['source_status'] in {'active', 'stopped'} and text(entry['evidence_ref']) and
                entry['independent'] is True and text(entry['independence_ref']), 'Uncertain reservation source status/independence')
        require(not engine.conflicts(revised_story, res) and str(res['epic']) != p['epic'] and
                not {STORY, '35-6'}.intersection(res['stories']), 'Admission conflicts with legacy reservation')
        engine.strings(entry['anchors'], 'reservation anchors')
    # Existing anchor recognition MUST use the old authoritative plan, because
    # schema-2 recognition binds the supplied plan digest to the stored plan.
    require(not engine.story_pr_legacy_conflicts(repo, p, revised_story), 'Legacy source ownership collision')
    closed, decisions = closed_classifications(db, repo, inventory, p, r, snapshots)
    used_closed = set()
    for tree in inventory['snapshot']['worktrees']:
        wt = Path(tree['worktree'])
        for ref in tree['anchors']:
            path = wt / ref['path']
            content = path.read_text(encoding='utf-8-sig')
            if engine.scalar(content, 'status') in {'done', 'completed', 'abandoned'}:
                continue
            run = engine.scalar(content, 'parallel_run_id')
            op = byrun.get(run)
            recognized = op and (engine.story_pr_registered_anchor(repo, op, wt, path) if op.get('schema_version') == 2
                                else engine.registered_parallel_anchor(repo, op, wt, path, engine.scalar(content, 'story_id') or path.stem))
            key = (str(wt.resolve()), ref['path'])
            require(not (recognized and key in closed), 'Live-owned anchor cannot be classified historical')
            if key in closed:
                used_closed.add(key)
            require(recognized or key in closed or any(Path(entry['reservation']['worktree']).resolve() == wt and
                                     ref['path'] in entry['anchors'] for entry in reservations),
                    'Unregistered live anchor omitted from ownership reservations')
    require(used_closed == set(closed), 'Closed classification contains unmatched anchor')
    return inventory, decisions


def publication(repo, p, c, r, snapshots):
    own = Path(c['worktree']).resolve() / OWN_STATE
    require(Path(r['own_state']['path']).resolve() == own, 'Own state must be the actual worker anchor')
    state = artifact_state(repo, r['own_state'], snapshots)
    for key, expected in [('story_key', STORY), ('story_id', '35-6'), ('story_source', 'stories'),
                          ('branch', c['branch']), ('parallel_run_id', RUN)]:
        require(state.get(key) == expected, 'Own state ' + key + ' mismatch')
    require(Path(state.get('spec_folder', '')).resolve() == Path(c['worktree']).resolve() / FOLDER,
            'Own state source folder mismatch')
    require(state.get('merge_state') == 'not-requested', 'Own state has merge custody')
    identity = json.loads(state.get('publication_identity_json', 'null'))
    expected = {'run_id': RUN, 'repository': REPOSITORY, 'story_key': STORY, 'branch': c['branch'],
                'worktree': str(Path(c['worktree']).resolve()), 'base_revision': p['base_sha'], 'base_branch': 'main'}
    require(isinstance(identity, dict), 'Immutable publication identity required')
    normalized = {**identity, 'worktree': str(Path(identity.get('worktree', '')).resolve())}
    require(normalized == expected, 'Immutable publication identity mismatch')
    operation = json.loads(state.get('publication_operation_json', 'null'))
    keys(operation, ['pr_url', 'base', 'head', 'evidence', 'story_key', 'repository', 'run_id',
                     'pr_number', 'operation', 'status', 'branch'])
    require(operation['status'] == 'confirmed' and operation['operation'] in {'create', 'push'} and text(operation['evidence']),
            'Publication operation must be durably confirmed')
    observed = artifact_json(r['publication'], snapshots)
    keys(observed, ['repository', 'pr_number', 'pr_url', 'head_branch', 'base_branch', 'head_sha',
                    'state', 'merged', 'observation_ref'])
    require(observed['state'] == 'open' and observed['merged'] is False and text(observed['observation_ref']),
            'Provider must observe the same open PR')
    for key, value in [('repository', REPOSITORY), ('pr_number', PR), ('pr_url', 'https://github.com/' + REPOSITORY + '/pull/127'),
                       ('head_branch', c['branch']), ('base_branch', 'main')]:
        require(observed[key] == value, 'Provider ' + key + ' mismatch')
    require(type(observed['pr_number']) is int and type(operation['pr_number']) is int and state.get('pr_number') == PR,
            'Actual immutable PR127 required')
    for key, value in [('repository', REPOSITORY), ('pr_number', PR), ('pr_url', observed['pr_url']),
                       ('branch', c['branch']), ('base', 'main'), ('run_id', RUN), ('story_key', STORY), ('head', observed['head_sha'])]:
        require(operation[key] == value, 'Durable operation ' + key + ' mismatch')
    exact_sha(repo, observed['head_sha'])
    require(engine.ancestor(repo, observed['head_sha'], r['checkpoint_sha']) and
            engine.ancestor(repo, c['base_sha'], observed['head_sha']), 'Published head/checkpoint ancestry mismatch')
    return {'identity': identity, 'operation': operation, 'observed': observed}


def checkpoint():
    """Synthetic rollback hook after both CAS writes and audit insertion."""


def admit(a):
    repo = engine.top(a.repo)
    require((engine.common(repo) / 'auto-bmad-parallel.sqlite3').is_file(), 'Existing run store required')
    request_path = Path(a.request)
    raw_request = request_path.read_bytes()
    r = parse_raw_json(raw_request)
    keys(r, FIELDS)
    require(type(r['schema_version']) is int and r['schema_version'] == 1, 'Unsupported request schema')
    require(text(r['request_id']) and re.fullmatch('[A-Za-z0-9][A-Za-z0-9._-]{0,127}', r['request_id']), 'Invalid request token')
    require((a.run, a.story, r['run_id'], r['story_id']) == (RUN, STORY, RUN, STORY), 'Only the approved 35.6 assignment may be admitted')
    require(type(r['expected_generation']) is int and r['expected_generation'] > 0 and
            r['expected_generation'] == a.generation and r['owner'] == a.owner and r['worker'] == a.worker,
            'Request/CLI identity or generation mismatch')
    require(r['add_write_paths'] == [RUNTIME] and r['add_conflict_domains'] == [DOMAIN], 'Only the exact runtime path/domain are approved')
    require(text(r['reason']) and text(r['scope_approval_ref']), 'Frozen-scope reason/authorization reference required')
    for field in ['checkpoint_sha', 'expected_integration_sha', 'qualified_main_sha', 'reviewed_tooling_sha']:
        exact_sha(repo, r[field])
    admission = r['admission_review']
    keys(admission, ['review', 'request_digest'])
    require(admission['request_digest'] == engine.digest({k: v for k, v in r.items() if k != 'admission_review'}),
            'Independent admission review must bind the entire request')
    with engine.database(repo) as db:
        prior = db.execute('SELECT * FROM claim_amendments WHERE request_id=?', (r['request_id'],)).fetchone()
        if prior:
            require(prior['run'] == RUN and prior['story'] == STORY and prior['request_hash'] == engine.digest(r), 'Request token already used with different payload')
            return {**json.loads(prior['response']), 'replayed': True}
        p = engine.get_run(db, a)
        require(p['schema_version'] == 2 and p['repository'] == REPOSITORY and len(p['stories']) == 1, 'Exact schema-2 repository assignment required')
        s = engine.story(p, STORY)
        require(engine.source_identity(s) == (FOLDER, '35-6') and s['write_paths'] == OLD_PATHS and DOMAIN not in s['conflict_domains'],
                'Original source/eleven-path ownership required')
        row = db.execute('SELECT * FROM runs WHERE run=?', (RUN,)).fetchone()
        require(row['state'] == 'active' and row['plan_hash'] == r['expected_plan_hash'] and p['workflow_version'] == r['workflow_version'], 'Run plan/workflow changed')
        c = engine.get_claim(db, a, worker=True)
        require(c['state'] == 'blocked' and text(c['block_reason']) and
                all(c[k] is None for k in ['evidence', 'result_sha', 'integration_sha']), 'Exact blocked unpublished claim checkpoint required')
        require(not db.execute('SELECT 1 FROM story_pr_publications WHERE (run=? AND story=?) OR state IN (\'merge-prepared\',\'merged\')', (RUN, STORY)).fetchone(), 'Publication submission or repository merge custody exists')
        require(not db.execute('SELECT 1 FROM journal WHERE (run=? AND story=?) OR state=\'prepared\'', (RUN, STORY)).fetchone(), 'Target journal or repository integration custody exists')
        require(not db.execute('SELECT 1 FROM verifications WHERE run=? AND story IN (?,?)', (RUN, STORY, '__repair__' + STORY)).fetchone(), 'Target verification already exists')
        engine.validate_plan(repo, p)
        target, wt = Path(p['integration_worktree']).resolve(), Path(c['worktree']).resolve()

        def git_facts():
            engine.clean(target)
            engine.clean(wt)
            require(engine.top(repo) == target and engine.branch(target) == p['integration_branch'] and
                    engine.branch(wt) == c['branch'], 'Coordinator/worker branch or checkout changed')
            require(engine.sha(target, 'HEAD') == r['expected_integration_sha'] and
                    engine.sha(wt, 'HEAD') == engine.sha(repo, c['branch']) == r['checkpoint_sha'], 'Exact blocked checkpoint changed')
            require(engine.story_pr_current_main(repo, p) == r['qualified_main_sha'], 'Qualified main changed')
            require(engine.workflow_version(wt) == p['workflow_version'] and
                    engine.ancestor(repo, c['base_sha'], r['checkpoint_sha']), 'Worker workflow/base ancestry changed')
            engine.source_pins(wt, p)

        git_facts()
        # Validate checkpoint against OLD ownership before constructing the new plan.
        if c['base_sha'] != r['checkpoint_sha']:
            engine.validate_diff(repo, p, c, c['base_sha'], r['checkpoint_sha'])
        revised = copy.deepcopy(p)
        revised_story = engine.story(revised, STORY)
        revised_story['write_paths'].append(RUNTIME)
        revised_story['conflict_domains'].append(DOMAIN)
        for root, head in [(target, r['expected_integration_sha']), (wt, r['checkpoint_sha'])]:
            require((root / RUNTIME).resolve().is_relative_to(root) and not (root / RUNTIME).is_dir(), 'Runtime ownership must be an in-checkout file')
            tree = engine.git(root, 'ls-tree', '-z', head, '--', RUNTIME)
            require(not any(x.startswith(('120000 ', '160000 ')) for x in tree.split('\x00')), 'Runtime symlink/submodule ownership refused')
        engine.validate_plan(repo, revised)
        snapshots = Captures()
        stopped = stopped_receipt(r, c, p, snapshots)
        forbidden = {p['coordinator']} | {writer['identity'] for writer in stopped['writers']}
        independent_review(admission['review'], r['checkpoint_sha'], r['tooling_author'], forbidden)
        qualify_tooling(repo, p, c, r, snapshots, forbidden)
        pub = publication(repo, p, c, r, snapshots)
        inventory, classifications = ownership(db, repo, p, c, revised_story, r, snapshots)
        # Recheck every external fact immediately before the transaction CAS.
        git_facts()
        qualify_tooling(repo, p, c, r, snapshots, forbidden)
        require(inventory['snapshot'] == store_snapshot(db, repo), 'Ownership changed immediately before CAS')
        require(engine.stopped_writers(r, c, p) == stopped, 'Stopped-writer evidence changed')
        require(request_path.read_bytes() == raw_request, 'Request changed during admission')
        for ref, data in snapshots:
            require(source_bytes(repo, ref) == data, 'Bound evidence changed immediately before CAS')
        now = time.time()
        revised_hash = engine.digest(revised)
        updated = db.execute('UPDATE runs SET plan=?,plan_hash=? WHERE run=? AND owner=? AND state=\'active\' AND plan_hash=?',
                             (engine.canonical(revised), revised_hash, RUN, a.owner, r['expected_plan_hash']))
        require(updated.rowcount == 1, 'Plan CAS failed')
        updated = db.execute('UPDATE claims SET generation=?,base_sha=?,state=\'claimed\',block_reason=NULL,heartbeat=? WHERE run=? AND story=? AND worker=? AND generation=? AND base_sha=? AND state=\'blocked\' AND evidence IS NULL AND result_sha IS NULL AND integration_sha IS NULL',
                             (c['generation'] + 1, r['checkpoint_sha'], now, RUN, STORY, a.worker, a.generation, c['base_sha']))
        require(updated.rowcount == 1, 'Claim CAS failed')
        amended = engine.get_claim(db, a)
        response = {**engine.story_pr_assignment(revised, amended), 'amendment_request_id': r['request_id'],
                    'plan_hash': revised_hash, 'checkpoint_sha': r['checkpoint_sha'], 'previous_base_sha': c['base_sha'], 'replayed': False}
        receipt = {'writers': stopped['writers'], 'quiescence': stopped, 'publication': pub,
                   'ownership_inventory': inventory, 'closed_classifications': classifications,
                   'raw_artifacts': [{'reference': ref, 'base64': base64.b64encode(data).decode('ascii')} for ref, data in snapshots]}
        db.execute('INSERT INTO claim_amendments VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                   (r['request_id'], RUN, STORY, engine.digest(r), engine.canonical(p), engine.digest(p),
                    engine.canonical(revised), revised_hash, engine.canonical(c), engine.canonical(amended),
                    engine.canonical(r), engine.canonical(receipt), engine.canonical(response), now))
        checkpoint()
        return response


def parser():
    result = engine.JsonParser(description=__doc__)
    for field in ['repo', 'run', 'owner', 'story', 'worker', 'request']:
        result.add_argument('--' + field, required=True)
    result.add_argument('--generation', required=True, type=int)
    result.set_defaults(command='admit-story35-6-runtime')
    return result


def main(argv=None):
    try:
        response = admit(parser().parse_args(argv))
        print(json.dumps({'ok': True, **response}, sort_keys=True))
        return 0
    except (engine.Refusal, OSError, ValueError, TypeError, KeyError, sqlite3.Error) as error:
        print(json.dumps({'ok': False, 'error': str(error)}))
        return 1


if __name__ == '__main__':
    sys.exit(main())
