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


def stopped_receipt(r, c, p, snapshots):
    q = r['quiescence']
    keys(q, ['coordinator', 'attested', 'complete_writer_inventory', 'evidence_path', 'evidence_sha256'])
    data = engine.hashed_artifact({'path': q['evidence_path'], 'sha256': q['evidence_sha256']}, snapshots)
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
    ci = engine.artifact_json(r['tooling_ci'], snapshots)
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


def ownership(db, repo, p, c, revised_story, r, snapshots):
    inventory = engine.artifact_json(r['ownership_inventory'], snapshots)
    keys(inventory, ['schema_version', 'coordinator', 'attested', 'complete', 'snapshot', 'reservations'])
    require(type(inventory['schema_version']) is int and inventory['schema_version'] == 1 and
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
            require(recognized or any(Path(entry['reservation']['worktree']).resolve() == wt and
                                     ref['path'] in entry['anchors'] for entry in reservations),
                    'Unregistered live anchor omitted from ownership reservations')
    return inventory


def publication(repo, p, c, r, snapshots):
    own = Path(c['worktree']).resolve() / OWN_STATE
    require(Path(r['own_state']['path']).resolve() == own, 'Own state must be the actual worker anchor')
    engine.hashed_artifact(r['own_state'], snapshots)
    state = state_api.load_state(own)
    require(own.read_bytes() == snapshots[-1][1], 'Own state changed while parsing')
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
    observed = engine.artifact_json(r['publication'], snapshots)
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
        snapshots = []
        stopped = stopped_receipt(r, c, p, snapshots)
        forbidden = {p['coordinator']} | {writer['identity'] for writer in stopped['writers']}
        independent_review(admission['review'], r['checkpoint_sha'], r['tooling_author'], forbidden)
        qualify_tooling(repo, p, c, r, snapshots, forbidden)
        pub = publication(repo, p, c, r, snapshots)
        inventory = ownership(db, repo, p, c, revised_story, r, snapshots)
        # Recheck every external fact immediately before the transaction CAS.
        git_facts()
        qualify_tooling(repo, p, c, r, [], forbidden)
        require(inventory['snapshot'] == store_snapshot(db, repo), 'Ownership changed immediately before CAS')
        require(engine.stopped_writers(r, c, p) == stopped, 'Stopped-writer evidence changed')
        require(request_path.read_bytes() == raw_request, 'Request changed during admission')
        for ref, data in snapshots:
            require(Path(ref['path']).read_bytes() == data, 'Bound evidence changed immediately before CAS')
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
                   'ownership_inventory': inventory, 'raw_artifacts': [{'reference': ref, 'base64': base64.b64encode(data).decode('ascii')} for ref, data in snapshots]}
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
