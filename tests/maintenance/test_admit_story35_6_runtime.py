"""Disposable Git/SQLite admission contracts; no live claims or provider calls."""
import base64
import copy
import contextlib
import io
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '.agents/skills/auto-bmad/scripts/tests'))
import test_parallel_run as fixture

SCRIPT = ROOT / 'scripts/maintenance/admit_story35_6_runtime.py'
spec = importlib.util.spec_from_file_location('runtime_admission', SCRIPT)
adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(adapter)
engine = fixture.engine


class RuntimeAdmission(fixture.StoriesPrFixture, unittest.TestCase):
    folders = {'a': adapter.FOLDER, 'b': '_bmad-output/specs/other-producer'}

    def setUp(self):
        super().setUp()
        self.foreign_template = copy.deepcopy(self.item('b'))
        item = self.item('a')
        old_spec = self.repo / item['spec_path']
        new_spec = self.repo / adapter.OLD_PATHS[6]
        old_spec.rename(new_spec)
        self.write(self.repo, adapter.FOLDER + '/stories.yaml', '- id: "35-6"\n  title: Fixture\n  description: Approved synthetic behavior.\n  done_checkpoint: true\n')
        item.update(id=adapter.STORY, spec_path=adapter.OLD_PATHS[6], write_paths=adapter.OLD_PATHS.copy())
        item['source'].update(story_id='35-6', story_key=adapter.STORY, done_checkpoint=True)
        item['source']['files'][1]['sha256'] = hashlib.sha256((self.repo / adapter.FOLDER / 'stories.yaml').read_bytes().replace(b'\r\n', b'\n')).hexdigest()
        self.plan.update(run_id=adapter.RUN, epic='spec-design-35-6', repository=adapter.REPOSITORY, stories=[item])
        # The separately committed adapter is outside the unchanged workflow digest.
        self.write(self.repo, 'scripts/maintenance/admit_story35_6_runtime.py', SCRIPT.read_text(encoding='utf-8'))
        self.base = self.commit(self.repo, 'synthetic exact-story and separately reviewed tooling')
        self.plan['base_sha'] = self.base
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', self.base)
        for wt in [self.a, self.b, self.c]:
            self.git(wt, 'merge', '--ff-only', self.base)
        self.save_plan()
        self.call('init')
        self.assignment = self.call('claim', run=adapter.RUN, story=adapter.STORY, worker='worker-a',
                                    branch='codex/worker-a', worktree=self.a, expected_head=self.base)
        identity = {'run_id': adapter.RUN, 'repository': adapter.REPOSITORY, 'story_key': adapter.STORY,
                    'branch': 'codex/worker-a', 'worktree': str(self.a), 'base_revision': self.base, 'base_branch': 'main'}
        operation = {'pr_url': 'https://github.com/rthunborg/Kopplas/pull/127', 'base': 'main', 'head': self.base,
                     'evidence': 'synthetic confirmed provider observation', 'story_key': adapter.STORY,
                     'repository': adapter.REPOSITORY, 'run_id': adapter.RUN, 'pr_number': 127,
                     'operation': 'push', 'status': 'confirmed', 'branch': 'codex/worker-a'}
        self.state = {'story_key': adapter.STORY, 'story_source': 'stories', 'story_id': '35-6',
                      'spec_folder': str(self.a / adapter.FOLDER), 'branch': 'codex/worker-a', 'status': 'in-progress',
                      'parallel_run_id': adapter.RUN, 'merge_state': 'not-requested', 'pr_number': 127,
                      'publication_identity_json': json.dumps(identity), 'publication_operation_json': json.dumps(operation)}
        self.save_state()
        self.checkpoint_sha = self.commit(self.a, 'synthetic reviewed blocked checkpoint')
        self.call('block', run=adapter.RUN, story=adapter.STORY, worker='worker-a', reason='runtime file not yet admitted')
        self.patches = self.tooling_identity_patches(self.c)
        for item_patch in self.patches:
            item_patch.start()
            self.addCleanup(item_patch.stop)
        self.request = self.make_request()

    def tooling_identity_patches(self, root):
        # Match production ROOT = Path(__file__).resolve().parents[2], including
        # Windows short-name/reparse aliases returned by the tempfile parent.
        return [patch.object(adapter, 'ROOT', root.resolve()),
                patch.object(adapter, '__file__', str(root / 'scripts/maintenance/admit_story35_6_runtime.py'))]

    def save_state(self):
        self.write(self.a, adapter.OWN_STATE, '\n'.join(key + ': ' + json.dumps(value) for key, value in self.state.items()) + '\n')

    def call(self, command, **kwargs):
        if command not in {'plan', 'version', 'init'}:
            kwargs.setdefault('run', adapter.RUN)
        return super().call(command, **kwargs)

    def raw(self, name, value):
        path = self.file(name, value)
        return {'path': str(path.resolve()), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}

    def refresh_review(self):
        r = self.request
        r['admission_review'] = {'review': {**self.review(self.checkpoint_sha, 'high'), 'reviewer': 'independent-admission-reviewer'},
                                 'request_digest': engine.digest({k: v for k, v in r.items() if k != 'admission_review'})}

    def inventory(self, reservations=None):
        with engine.database(self.repo) as db:
            snapshot = adapter.store_snapshot(db, self.repo)
        return {'schema_version': 1, 'coordinator': 'coordinator-session', 'attested': True, 'complete': True,
                'snapshot': snapshot, 'reservations': reservations or []}

    def make_request(self):
        tooling_sha = engine.sha(self.c, 'HEAD')
        writers = {'schema_version': 1, 'run_id': adapter.RUN, 'story_id': adapter.STORY, 'worker': 'worker-a',
                   'generation': 1, 'branch': 'codex/worker-a', 'worktree': str(self.a), 'checkpoint_sha': self.checkpoint_sha,
                   'writers': [{'identity': 'worker-a', 'role': 'worker', 'state': 'stopped', 'evidence_ref': 'synthetic-terminal-status'}]}
        writer_ref = self.raw('writers', writers)
        ci = {'schema_version': 1, 'repository': adapter.REPOSITORY, 'workflow': '.github/workflows/auto-bmad-parallel.yml',
              'commit': tooling_sha, 'result': 'passed', 'source_ref': 'synthetic-native-CI',
              'checks': [self.check(tooling_sha, name) for name in adapter.CI_JOBS]}
        pub = {'repository': adapter.REPOSITORY, 'pr_number': 127, 'pr_url': 'https://github.com/rthunborg/Kopplas/pull/127',
               'head_branch': 'codex/worker-a', 'base_branch': 'main', 'head_sha': self.base,
               'state': 'open', 'merged': False, 'observation_ref': 'synthetic-provider-PR127'}
        state_path = self.a / adapter.OWN_STATE
        return {'schema_version': 1, 'request_id': 'admission-one', 'run_id': adapter.RUN, 'story_id': adapter.STORY,
                'owner': 'coordinator-session', 'worker': 'worker-a', 'expected_generation': 1,
                'expected_plan_hash': engine.digest(self.plan), 'expected_integration_sha': engine.sha(self.repo, 'HEAD'),
                'checkpoint_sha': self.checkpoint_sha, 'qualified_main_sha': engine.sha(self.repo, 'refs/remotes/origin/main'),
                'workflow_version': self.plan['workflow_version'], 'add_write_paths': [adapter.RUNTIME],
                'add_conflict_domains': [adapter.DOMAIN], 'reason': 'required existing proxy CI proof',
                'scope_approval_ref': 'synthetic-approved-exact-story-runtime', 'reviewed_tooling_sha': tooling_sha,
                'tool_sha256': adapter.tool_hash(), 'tooling_author': 'independent-tooling-author',
                'tooling_review': self.review(tooling_sha, 'high'), 'tooling_ci': self.raw('tooling-ci', ci),
                'quiescence': {'coordinator': 'coordinator-session', 'attested': True, 'complete_writer_inventory': True,
                               'evidence_path': writer_ref['path'], 'evidence_sha256': writer_ref['sha256']},
                'ownership_inventory': self.raw('inventory', self.inventory()),
                'own_state': {'path': str(state_path), 'sha256': hashlib.sha256(state_path.read_bytes()).hexdigest()},
                'publication': self.raw('publication', pub)}

    def args_for_admit(self):
        self.refresh_review()
        return adapter.parser().parse_args(['--repo', str(self.repo), '--run', adapter.RUN, '--owner', 'coordinator-session',
                                            '--story', adapter.STORY, '--worker', 'worker-a', '--generation', '1',
                                            '--request', str(self.file('request', self.request))])

    def admit(self):
        return adapter.admit(self.args_for_admit())

    def snapshot(self):
        with engine.database(self.repo) as db:
            return {table: [tuple(row) for row in db.execute('SELECT * FROM ' + table)]
                    for table in ['runs', 'claims', 'claim_amendments']}

    def refused(self, message=None):
        before = self.snapshot()
        with self.assertRaisesRegex(adapter.engine.Refusal, message or '.'):
            self.admit()
        self.assertEqual(self.snapshot(), before)

    def blob_ref(self, commit, path):
        data = adapter.source_bytes(self.repo, {'commit': commit, 'path': path, 'sha256': '0' * 64})
        return {'commit': commit, 'path': path, 'sha256': hashlib.sha256(data).hexdigest()}

    def yaml(self, wt, path, state):
        self.write(wt, path, '\n'.join(key + ': ' + json.dumps(value) for key, value in state.items()) + '\n')

    def anchor_ref(self, wt, part):
        path = adapter.state_path(part)
        head = engine.sha(wt, 'HEAD')
        return {'worktree': str(wt), 'branch': engine.branch(wt), 'head': head, 'path': path,
                'sha256': hashlib.sha256((wt / path).read_bytes()).hexdigest(), 'subject_part': part,
                'blob_commit': head, 'blob_sha256': self.blob_ref(head, path)['sha256']}

    def scoped_graph(self, subject, scope):
        # Native wrappers retain unrelated active work. Only bound historical
        # turns form this task's recursive graph; the explicit no-reopen flag
        # and independent request review attest complete scoped selection.
        owners = [subject['owner']]
        refs, writers = [], []
        for identity, parent in [(owners[0], None), ('historical-fixer', owners[0])]:
            closure = 'closed-' + identity
            native = {'source': 'codex_app.read_thread', 'threadId': identity,
                      'page': {'order': 'newest_first'}, 'turns': [
                          {'id': 'unrelated-current', 'status': 'inProgress', 'finals': [], 'children': []},
                          {'id': closure, 'status': 'completed',
                           'finals': ['Synthetic exact task scope closed; no edits/claims/services remain.'],
                           'children': ([{'type': 'subAgentActivity', 'agentThreadId': 'historical-fixer'}]
                                        if parent is None else [])}]}
            projection = {'schema_version': 1, 'identity': identity,
                          'subject_digest': engine.digest(subject), 'scope_digest': engine.digest(scope),
                          'scoped_turn_ids': [closure], 'native_ref': self.raw('native-' + identity, native)}
            ref = self.raw('scoped-' + identity, projection)
            refs.append(ref)
            writers.append({'identity': identity, 'parent': parent, 'role': 'owner' if parent is None else 'fixer',
                            'closure_turn_id': closure, 'observation_ref': ref, 'state': 'terminal-for-scope'})
        return {'coordinator': self.plan['coordinator'], 'subject_digest': engine.digest(subject),
                'scope_digest': engine.digest(scope), 'complete_writer_inventory': True,
                'no_reopen_attested': True, 'owners': owners, 'writers': writers, 'raw_observations': refs}

    def historical_publication(self, number, branch, merged):
        parents = engine.git(self.repo, 'rev-list', '--parents', '-n', '1', merged).split()[1:]
        pub = {'repository': adapter.REPOSITORY, 'pr_number': number,
               'pr_url': 'https://github.com/' + adapter.REPOSITORY + '/pull/' + str(number),
               'head_branch': branch, 'base_branch': 'main', 'base_sha': parents[0], 'head_sha': parents[1],
               'merged': True, 'merge_sha': merged}
        return {**pub, 'observation_ref': self.raw('historical-publication-' + str(number), pub)}

    def legacy_fixture(self, key='spec-design-35-4-35-4', allocation_pin=None):
        kind, folder, stories, number = adapter.LEGACY[key]
        branch = ('codex/epic-15-scheduling-time-calendar' if number == 108 else
                  'codex/story-' + ('35-2-foundations-login' if number == 115 else '35-4-dialogs-feedback-files'))
        owner = '01a120bb-ec6d-7611-9dde-ca64bc8e280f' if number == 108 else 'historical-owner'
        subject = {'key': key, 'owner': owner, 'source_kind': kind, 'source_folder': folder,
                   'story_keys': stories.copy(), 'branch': branch}
        parts = stories + (['epic-15'] if number == 108 else [])
        books = [adapter.state_path(part) for part in parts]
        if folder:
            books.append(folder + '/source-binding.json')
        # Preserve the original complete allocation, including diagnostic and
        # test paths rather than deriving a minimum from changed Git paths.
        allocation = {'write_paths': ['src/historical/', adapter.RUNTIME, 'diagnostic.txt'] + books,
                      'bookkeeping_paths': books, 'conflict_domains': ['historical:full-scope']}
        allocation_path = ('docs/quality/story-35-2-approved-admission-2026-10-28.json' if number == 115 else
                           'historical-allocation.json')
        if number == 115:
            allocation['allocation'] = {'ownerChat': owner, 'branch': branch,
                                        'paths': ['src/historical/', adapter.RUNTIME]}
        allocation_file = self.root / allocation_path
        allocation_file.parent.mkdir(parents=True, exist_ok=True)
        allocation_file.write_text(json.dumps(allocation), encoding='utf-8')
        if allocation_pin is not None:
            self.assertEqual(number, 115)
            self.assertIn(allocation_pin, ['raw', 'lf'])
            allocation_bytes = (json.dumps(allocation, indent=2) + '\n').replace('\n', '\r\n').encode()
            allocation_file.write_bytes(allocation_bytes)
            # Separate committed LF provenance cannot impersonate the original
            # raw-pinned CRLF FileRef, even though parsed values are identical.
            blob_file = self.b / allocation_path
            blob_file.parent.mkdir(parents=True, exist_ok=True)
            blob_file.write_bytes(allocation_bytes.replace(b'\r\n', b'\n'))
        allocation_ref = {'path': str(allocation_file.resolve()), 'sha256': hashlib.sha256(allocation_file.read_bytes()).hexdigest()}
        if number == 115:
            pinned_bytes = allocation_file.read_bytes()
            if allocation_pin != 'raw':
                pinned_bytes = pinned_bytes.replace(b'\r\n', b'\n')
            binding = {'executionId': '35-2', 'sourceFiles': {
                allocation_path: hashlib.sha256(pinned_bytes).hexdigest()}}
        else:
            binding = {'story_id': '35-4', 'owner_chat': owner, 'branch': branch,
                       'production_write_paths': ['src/historical/'], 'test_write_paths': [adapter.RUNTIME]}
        states = {}
        for part in parts:
            state = {'story_key': part, 'story_source': kind, 'branch': branch, 'status': 'in-progress',
                     'pr_url': 'https://github.com/' + adapter.REPOSITORY + '/pull/' + str(number),
                     'pr_merged': False, 'merge_commit': None}
            if folder:
                state.update(story_id='35-2' if number == 115 else '35-4', spec_folder=str(self.b.resolve() / folder))
            else:
                state['epic_num'] = '15'
                if part == 'epic-15':
                    state['ownership_reservation'] = {'shared_domains': ['historical:full-scope']}
            states[part] = state
            self.yaml(self.b, adapter.state_path(part), state)
        if folder:
            self.write(self.b, folder + '/source-binding.json', json.dumps(binding))
        candidate = self.commit(self.b, 'synthetic legacy product checkpoint')
        product = self.main_merge(candidate)
        closeout = self.root / 'legacy-closeout'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/legacy-process-closeout', str(closeout), product)
        for part, state in states.items():
            terminal = {**state, 'status': 'done'}
            if folder:
                terminal.update(spec_folder=str(closeout.resolve() / folder), pr_merged=True, merge_commit=product)
            if number == 121:
                terminal['overrides'] = {'process_closeout_branch': 'codex/legacy-process-closeout'}
            self.yaml(closeout, adapter.state_path(part), terminal)
        closed = self.commit(closeout, 'synthetic main terminal counterparts')
        main = self.main_merge(closed)
        # A copied marker can be committed on an unmerged debug HEAD. This
        # actual Git identity is deliberately different from the task branch.
        self.write(self.b, 'diagnostic.txt', 'unmerged diagnostic metadata\n')
        self.commit(self.b, 'synthetic archived diagnostics')
        self.assertFalse(engine.ancestor(self.repo, engine.sha(self.b, 'HEAD'), main))
        binding_ref = self.blob_ref(main, folder + '/source-binding.json' if folder else adapter.state_path('epic-15'))
        scope = {'write_paths': allocation['write_paths'], 'conflict_domains': allocation['conflict_domains'],
                 'bookkeeping_paths': books, 'authorities': [{'role': 'binding', 'ref': binding_ref},
                                                           {'role': 'allocation', 'ref': allocation_ref}],
                 'coordinator': self.plan['coordinator'], 'complete': True}
        publications = [self.historical_publication(number, branch, product)]
        if number == 121:
            publications.append(self.historical_publication(122, 'codex/legacy-process-closeout', main))
        proof = {'main_sha': main, 'terminal_states': [{'subject_part': part, 'ref': self.blob_ref(main, adapter.state_path(part))}
                                                      for part in parts],
                 'source_bindings': [{'ref': binding_ref, 'source_folder': folder,
                                      'locations': [str(wt.resolve() / folder) if folder else str(wt.resolve())
                                                    for wt in [self.b, closeout]], 'owner': owner}],
                 'publications': publications, 'terminal_scope': self.scoped_graph(subject, scope)}
        return {'id': 'closed-legacy', 'kind': 'legacy-main', 'subject': subject, 'scope': scope,
                'anchors': [self.anchor_ref(self.b, part) for part in parts], 'proof': proof}

    def finalized_fixture(self):
        plan = copy.deepcopy(self.v1_plan)
        plan.update(run_id='documents-e20-readiness-2026-10-09', epic='20', base_sha=self.base,
                    integration_branch='codex/historical-e20', integration_worktree=str(self.root / 'old-renamed-control'),
                    shared_paths=['_bmad-output/e20-shared.md', '_bmad-output/e20-summary.md'])
        # This external E15 reservation stays fully distinct from E20 closure.
        plan['legacy_reservations'] = [{'epic': '15', 'stories': ['15-1'], 'reason': 'historical external allocation',
                                       'worktree': str(self.root / 'external-e15'), 'write_paths': ['src/e15/'],
                                       'conflict_domains': ['external:e15']}]
        plan['stories'] = []
        commits, previous = [], self.base
        for i in range(1, 4):
            story = self.story('a' if i != 2 else 'b')
            story['id'] = '20.' + str(i)
            path = adapter.state_path(story['id'])
            story['write_paths'] = ['src/e20-' + str(i) + '/', path]
            story['conflict_domains'] = ['historical:e20-' + str(i)]
            plan['stories'].append(story)
            self.yaml(self.b, path, {'status': 'in-progress', 'story_id': story['id'], 'parallel_run_id': plan['run_id']})
            self.yaml(self.b, adapter.state_path('epic-20'), {'status': 'in-progress', 'epic_num': '20',
                                                           'parallel_run_id': plan['run_id'], 'variant': i})
            result = self.commit(self.b, 'synthetic integrated E20 story ' + str(i))
            commits.append((previous, result)); previous = result
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', previous)
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?,?)', (plan['run_id'], '20', plan['coordinator'],
                       engine.canonical(plan), engine.digest(plan), 'finalized', previous))
            for story, (base, result) in zip(plan['stories'], commits):
                db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
                           (plan['run_id'], story['id'], 'old-' + story['id'], 1, 'codex/historical-' + story['id'],
                            str(self.root / ('archived-' + story['id'])), base, 0, 'integrated', '{}', result, result, None))
                db.execute('INSERT INTO verifications VALUES(?,?,?,?)', (plan['run_id'], story['id'], result, '{}'))
                db.execute('INSERT INTO journal VALUES(?,?,?,?,?,?)', (plan['run_id'], story['id'], base, result, result, 'merged'))
            db.execute('INSERT INTO verifications VALUES(?,?,?,?)', (plan['run_id'], '__final__', previous, '{}'))
        copy_wt = self.root / 'e20-copy'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/e20-copy', str(copy_wt), commits[0][1])
        subject = {'key': plan['run_id'], 'owner': plan['coordinator'], 'source_kind': 'parallel-run',
                   'source_folder': None, 'story_keys': [s['id'] for s in plan['stories']], 'branch': plan['integration_branch']}
        paths = sorted(set(plan['shared_paths']) | {p for s in plan['stories'] for p in s['write_paths']})
        scope = {'write_paths': paths, 'conflict_domains': sorted(d for s in plan['stories'] for d in s['conflict_domains']),
                 'bookkeeping_paths': sorted(p for p in paths if p.startswith('_bmad-output/')),
                 'authorities': [{'role': 'plan', 'ref': self.raw('historical-plan', plan)}],
                 'coordinator': self.plan['coordinator'], 'complete': True}
        return {'id': 'closed-e20', 'kind': 'finalized-run', 'subject': subject, 'scope': scope,
                'anchors': [self.anchor_ref(self.b, part) for part in subject['story_keys'] + ['epic-20']] +
                           [self.anchor_ref(copy_wt, part) for part in [subject['story_keys'][0], 'epic-20']],
                'proof': {'run_id': plan['run_id'], 'plan_hash': engine.digest(plan),
                          'final_sha': previous, 'verification_sha': previous}}

    def bind_closed(self, entries):
        self.request = self.make_request()
        inventory = json.loads(Path(self.request['ownership_inventory']['path']).read_text(encoding='utf-8'))
        inventory.update(schema_version=2, closed_anchors=entries)
        self.request['ownership_inventory'] = self.raw('inventory', inventory)
        return inventory

    def custody_fixture(self):
        entry = self.legacy_fixture('epic-15')
        entry['kind'] = 'legacy-main-current-custody'
        del entry['proof']['terminal_scope']
        entry['proof']['current_custody'] = {}
        return entry

    def bind_custody(self, entry, transform=None, reservations=None):
        inventory = self.bind_closed([entry])
        inventory['reservations'] = reservations or []
        now = adapter.time.time()
        identities = [entry['subject']['owner'], 'known-failed-e15-writer']
        records = []
        for identity in identities:
            native = {'source': 'codex_app.read_thread', 'threadId': identity, 'thread_status': 'notLoaded',
                      'turns': [{'id': 'old-failed', 'status': 'failed', 'completedAt': 1, 'finals': []}]}
            records.append({'identity': identity, 'kind': 'actor', 'owner': identity, 'host': 'fixture-host',
                            'state': 'non-writing', 'write_paths': [], 'conflict_domains': [], 'queued': False,
                            'background': False, 'allocation': None, 'native_ref': self.raw('current-' + identity, native)})
        for i, reservation in enumerate(inventory['reservations']):
            identity = 'current-producer-' + str(i)
            res = reservation['reservation']
            native = {'source': 'codex_app.read_thread', 'threadId': identity, 'thread_status': 'running',
                      'turns': [{'id': 'actual-current-producer', 'status': 'inProgress', 'finals': []}]}
            records.append({'identity': identity, 'kind': 'actor', 'owner': identity, 'host': 'fixture-host',
                            'state': 'live-reserved', 'write_paths': res['write_paths'], 'conflict_domains': res['conflict_domains'],
                            'queued': False, 'background': True,
                            'allocation': engine.digest({'kind': 'legacy-reservation', 'reservation': res}),
                            'native_ref': self.raw('current-' + identity, native)})
        # Actual stopped execution, accounted for separately from actor metadata.
        records.append({'identity': 'known-old-execution', 'kind': 'execution', 'owner': identities[1],
                        'host': 'fixture-host', 'state': 'non-writing', 'write_paths': [], 'conflict_domains': [],
                        'queued': False, 'background': False, 'allocation': None, 'native_ref': None})
        historical = [self.raw('failed-history', {'source': 'codex_app.read_thread', 'threadId': identities[1],
                       'turns': [{'id': 'actual-historical-failure', 'status': 'failed', 'finals': [],
                                  'observation': 'Historical writes are possible; failure is not a no-write proof.'}]}),
                      self.raw('unreadable-history', {'source': 'historical-page-error', 'cursor': '71750',
                                'result': 'unreadable; not repaired or relabeled'})]
        facts = [{k: v for k, v in record.items() if k != 'native_ref'} for record in records]
        checked = []
        for purpose, kind in [('assignments', 'actor'), ('executions', 'execution'), ('external-writers', 'external-writer')]:
            observed_rows = [fact for fact in facts if fact['kind'] == kind]
            raw = self.raw('actual-host-' + purpose, {'source': 'synthetic-existing-host-task-records',
                           'purpose': purpose, 'host': 'fixture-host', 'rows': observed_rows})
            projection = {'source': 'coordinator.current-custody-inventory-projection', 'purpose': purpose,
                          'operator': 'actual-host-operator', 'host': 'fixture-host', 'observed_at': now,
                          'raw_refs': [raw], 'records': observed_rows, 'uncertainties': []}
            checked.append({'purpose': purpose, 'ref': self.raw('host-projection-' + purpose, projection)})
        host = {'source': 'coordinator.host-operator-custody-observation', 'operator': 'actual-host-operator',
                'host': 'fixture-host', 'observed_at': now,
                'knowledge': 'Synthetic operator checked actual assignments, tracked executions and known external writers; no unaccounted source task.',
                'checked_sources': checked, 'facts': facts, 'uncertainties': []}
        attestation = {'schema_version': 1, 'coordinator': self.plan['coordinator'], 'repository': adapter.REPOSITORY,
                       'common_git': str(engine.common(self.repo)), 'qualified_main_sha': self.request['qualified_main_sha'],
                       'request_id': self.request['request_id'], 'run_id': adapter.RUN, 'story_id': adapter.STORY,
                       'worker': 'worker-a', 'generation': 1, 'checkpoint_sha': self.checkpoint_sha,
                       'subject_digest': engine.digest(entry['subject']), 'scope_digest': engine.digest(entry['scope']),
                       'inventory_digest': engine.digest(inventory['snapshot']), 'anchors_digest': engine.digest(entry['anchors']),
                       'observed_at': now, 'valid_until': now + 900, 'no_new_overlapping_work_through_cas': True,
                       'operators': [{'identity': 'actual-host-operator', 'host': 'fixture-host', 'observation_ref': self.raw('host-facts', host)}],
                       'records': records, 'historical_refs': historical, 'uncertainties': []}
        if transform:
            transform(attestation)
        entry['proof']['current_custody'] = {'coordinator': self.plan['coordinator'],
            'subject_digest': engine.digest(entry['subject']), 'scope_digest': engine.digest(entry['scope']),
            'attested': True, 'complete_writer_inventory': True, 'no_reopen_attested': True,
            'evidence_ref': self.raw('current-custody-attestation', attestation)}
        inventory['closed_anchors'] = [entry]
        self.request['ownership_inventory'] = self.raw('inventory', inventory)
        return attestation

    def validate_closed(self, entry):
        inventory = self.bind_closed([entry])
        self.refresh_review()
        with engine.database(self.repo) as db:
            return adapter.closed_classifications(db, self.repo, inventory, self.plan, self.request, adapter.Captures())

    def closed_refused(self, entry, message):
        # Pure proof-validation negatives use the same production validator;
        # end-to-end success, custody, mutation and CAS rollback stay below.
        before = self.snapshot()
        with self.assertRaisesRegex(adapter.engine.Refusal, message):
            self.validate_closed(entry)
        self.assertEqual(self.snapshot(), before)

    def test_closed_legacy_full_scope_audit_and_unchanged_helper_continuation(self):
        entry = self.legacy_fixture()
        self.assertIn(adapter.RUNTIME, entry['scope']['write_paths'])
        self.assertNotEqual(entry['anchors'][0]['branch'], entry['subject']['branch'])
        self.bind_closed([entry])
        self.test_success_only_exact_additions_and_unchanged_helper_continuation()
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        self.assertEqual(receipt['closed_classifications'][0]['scope'], entry['scope'])
        self.assertEqual(receipt['closed_classifications'][0]['proof']['historical_writers'], ['historical-fixer', 'historical-owner'])
        for artifact in receipt['raw_artifacts']:
            data = base64.b64decode(artifact['base64'], validate=True)
            self.assertEqual(hashlib.sha256(data).hexdigest(), artifact['reference']['sha256'])
            self.assertEqual(data, adapter.source_bytes(self.repo, artifact['reference']))

    def test_closed_e20_all_integrated_copied_variants_preserve_external_reservation(self):
        entry = self.finalized_fixture()
        self.bind_closed([entry])
        self.assertEqual(self.admit()['generation'], 2)
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        proof = receipt['closed_classifications'][0]['proof']
        self.assertEqual(proof['external_legacy_reservations'], proof['plan']['legacy_reservations'])
        self.assertNotIn('src/e15/', entry['scope']['write_paths'])
        self.assertEqual(len(entry['anchors']), 6)

    def test_closed_35_2_allocation_without_binding_paths(self):
        entry = self.legacy_fixture('spec-design-35-2-35-2')
        self.bind_closed([entry])
        self.assertEqual(self.admit()['generation'], 2)

    def test_closed_35_2_raw_crlf_pin_admission_preserves_exact_audit_bytes(self):
        entry = self.legacy_fixture('spec-design-35-2-35-2', allocation_pin='raw')
        allocation_ref = entry['scope']['authorities'][1]['ref']
        original = Path(allocation_ref['path']).read_bytes()
        self.assertIn(b'\r\n', original)
        self.assertNotEqual(hashlib.sha256(original.replace(b'\r\n', b'\n')).hexdigest(), allocation_ref['sha256'])
        binding = json.loads(adapter.source_bytes(self.repo, entry['proof']['source_bindings'][0]['ref']))
        self.assertEqual(binding['sourceFiles']['docs/quality/story-35-2-approved-admission-2026-10-28.json'], allocation_ref['sha256'])
        self.bind_closed([entry])
        self.assertEqual(self.admit()['generation'], 2)
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        artifact = next(item for item in receipt['raw_artifacts'] if item['reference'] == allocation_ref)
        self.assertEqual(base64.b64decode(artifact['base64'], validate=True), original)

    def test_closed_35_2_existing_lf_pin_accepts_crlf_source(self):
        entry = self.legacy_fixture('spec-design-35-2-35-2', allocation_pin='lf')
        allocation_ref = entry['scope']['authorities'][1]['ref']
        original = Path(allocation_ref['path']).read_bytes()
        binding = json.loads(adapter.source_bytes(self.repo, entry['proof']['source_bindings'][0]['ref']))
        pin = binding['sourceFiles']['docs/quality/story-35-2-approved-admission-2026-10-28.json']
        self.assertNotEqual(pin, allocation_ref['sha256'])
        self.assertEqual(pin, hashlib.sha256(original.replace(b'\r\n', b'\n')).hexdigest())
        self.bind_closed([entry])
        self.assertEqual(self.admit()['generation'], 2)

    def test_closed_35_2_raw_pin_rejects_refreshed_changed_bytes_and_lf_blob(self):
        entry = self.legacy_fixture('spec-design-35-2-35-2', allocation_pin='raw')
        allocation_ref = entry['scope']['authorities'][1]['ref']
        original = Path(allocation_ref['path']).read_bytes()
        changed = original + b' '
        self.assertEqual(json.loads(changed), json.loads(original))
        Path(allocation_ref['path']).write_bytes(changed)
        changed_ref = {**allocation_ref, 'sha256': hashlib.sha256(changed).hexdigest()}
        lf_ref = self.blob_ref(entry['proof']['main_sha'], 'docs/quality/story-35-2-approved-admission-2026-10-28.json')
        self.assertEqual(adapter.source_bytes(self.repo, lf_ref), original.replace(b'\r\n', b'\n'))
        for ref in [changed_ref, lf_ref]:
            with self.subTest(ref=ref):
                item = copy.deepcopy(entry)
                item['scope']['authorities'][1]['ref'] = ref
                item['proof']['terminal_scope'] = self.scoped_graph(item['subject'], item['scope'])
                self.bind_closed([item])
                self.refused('35.2 full initial allocation authority missing or mismatched')

    def test_closed_e15_legacy_defaults_all_six_and_unmerged_debug_head(self):
        entry = self.legacy_fixture('epic-15')
        self.bind_closed([entry])
        self.assertEqual(self.admit()['generation'], 2)
        self.assertEqual(len(entry['proof']['terminal_states']), 7)
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        self.assertTrue(all(s['pr_merged'] is False for s in receipt['closed_classifications'][0]['proof']['terminal_states'].values()))

    def test_current_custody_preserves_failed_history_and_active_full_producer(self):
        entry = self.custody_fixture()
        res = {'epic': 'actual-producer', 'stories': ['known-task'], 'reason': 'full allocated producer task',
               'worktree': str(self.c), 'write_paths': ['src/producer/', 'package.json', 'tests/e2e/producer-a.ts',
                                                      'tests/e2e/producer-b.ts'], 'conflict_domains': ['producer:full']}
        reservation = {'reservation': res, 'head': engine.sha(self.c, 'HEAD'), 'source_status': 'active',
                       'evidence_ref': 'actual-producer-state', 'independent': True,
                       'independence_ref': 'actual-current-source-independence', 'anchors': []}
        attestation = self.bind_custody(entry, reservations=[reservation])
        self.assertEqual(self.admit()['generation'], 2)
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        decision = receipt['closed_classifications'][0]
        self.assertEqual(decision['kind'], 'legacy-main-current-custody')
        self.assertNotIn('historical_writers', decision['proof'])
        self.assertEqual(decision['proof']['current_custody']['attestation'], attestation)
        self.assertEqual(receipt['ownership_inventory']['reservations'], [reservation])
        self.assertIn(adapter.RUNTIME, decision['scope']['write_paths'])
        for ref in attestation['historical_refs']:
            item = next(x for x in receipt['raw_artifacts'] if x['reference'] == ref)
            self.assertEqual(base64.b64decode(item['base64']), Path(ref['path']).read_bytes())
        failed = json.loads(Path(attestation['historical_refs'][0]['path']).read_bytes())
        self.assertEqual(failed['turns'][0]['status'], 'failed')
        self.assertEqual(failed['turns'][0]['finals'], [])

    def test_current_custody_unknown_queued_background_and_partial_coverage_refuse(self):
        entry = self.custody_fixture()
        variants = [
            (lambda a: a['records'][1].update(state='unknown'), 'identity or state is unknown'),
            (lambda a: a['records'][1].update(write_paths=None), 'actual current write paths'),
            (lambda a: a['records'][1].update(queued=True), 'assignment/queued/background'),
            (lambda a: a['records'][1].update(background=True), 'assignment/queued/background'),
            (lambda a: a['records'].pop(1), 'omitted known actor'),
            (lambda a: a.update(operators=[]), 'Complete actual current custody'),
            (lambda a: a.update(uncertainties=['identified external writer has unknown assignment']), 'Complete actual current custody'),
            (lambda a: a.update(historical_refs=[]), 'Complete actual current custody'),
            (lambda a: a.update(no_new_overlapping_work_through_cas=False), 'quiet interval'),
            (lambda a: a.update(observed_at=a['observed_at']-1000, valid_until=a['observed_at']-1), 'quiet interval'),
            (lambda a: a.update(scope_digest='0'*64), 'identity/scope/inventory'),
        ]
        for transform, message in variants:
            with self.subTest(message=message):
                self.bind_custody(entry, transform)
                self.refused(message)

    def test_current_custody_refreshed_host_projection_and_metadata_alone_refuse(self):
        entry = self.custody_fixture()
        def change_host(a, mode):
            operator = a['operators'][0]
            host = json.loads(Path(operator['observation_ref']['path']).read_bytes())
            if mode == 'metadata-alone':
                host['checked_sources'] = []
            elif mode == 'facts':
                host['facts'][0]['queued'] = True
            elif mode == 'queued-execution':
                checked = host['checked_sources'][1]
                projection = json.loads(Path(checked['ref']['path']).read_bytes())
                projection['records'].append({'identity': 'identified-queued-task', 'queued': True})
                checked['ref'] = self.raw('refreshed-queued-source', projection)
            elif mode == 'reviewer':
                operator['identity'] = host['operator'] = 'independent-admission-reviewer'
                for checked in host['checked_sources']:
                    projection = json.loads(Path(checked['ref']['path']).read_bytes())
                    projection['operator'] = operator['identity']
                    checked['ref'] = self.raw('reviewer-' + checked['purpose'], projection)
            operator['observation_ref'] = self.raw('refreshed-host-facts', host)
        for mode, message in [('metadata-alone', 'inventory coverage'), ('facts', 'operational facts'),
                              ('queued-execution', 'omitted/unknown/queued custody'),
                              ('reviewer', 'Admission reviewer owns current custody evidence')]:
            with self.subTest(mode=mode):
                self.bind_custody(entry, lambda a: change_host(a, mode))
                self.refused(message)

    def test_current_custody_identity_scope_anchor_pin_and_publication_guards(self):
        entry = self.custody_fixture()
        variants = []
        item = copy.deepcopy(entry); item['scope']['write_paths'].remove(adapter.RUNTIME)
        variants.append((item, 'scope arrays/bookkeeping were reduced'))
        item = copy.deepcopy(entry); item['anchors'][0]['blob_sha256'] = '0'*64
        variants.append((item, 'Raw source hash mismatch'))
        item = copy.deepcopy(entry); item['subject']['owner'] = 'wrong-owner'
        variants.append((item, 'Legacy authoritative binding identity mismatch'))
        item = copy.deepcopy(entry); item['proof']['publications'][0]['head_sha'] = self.base
        variants.append((item, 'publication observation mismatch'))
        for item, message in variants:
            with self.subTest(message=message):
                self.bind_custody(item)
                self.refused(message)
        self.bind_custody(entry, lambda a: a.update(generation=2))
        self.refused('identity/scope/inventory')

    def test_current_custody_mode_is_exact_e15_not_another_legacy_profile(self):
        entry = self.legacy_fixture()
        entry['kind'] = 'legacy-main-current-custody'
        del entry['proof']['terminal_scope']
        entry['proof']['current_custody'] = {}
        self.bind_closed([entry])
        self.refused('Current custody mode is exact E15 only')

    def test_current_custody_cannot_override_live_overlap_reopening_or_prepared_custody(self):
        entry = self.custody_fixture()
        def reservation(epic, path):
            return {'reservation': {'epic': epic, 'stories': ['task'], 'reason': 'actual live allocation',
                    'worktree': str(self.c), 'write_paths': [path], 'conflict_domains': []},
                    'head': engine.sha(self.c, 'HEAD'), 'source_status': 'active', 'evidence_ref': 'actual-source',
                    'independent': True, 'independence_ref': 'actual-independent', 'anchors': []}
        self.bind_custody(entry, reservations=[reservation('actual-producer', adapter.RUNTIME)])
        self.refused('Admission conflicts with legacy reservation')
        self.bind_custody(entry, reservations=[reservation('15', 'src/unrelated/')])
        self.refused('Closed subject has live legacy reservation')
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO journal VALUES(?,?,?,?,?,?)', ('other', 'task', self.base, self.base, None, 'prepared'))
        self.bind_custody(entry)
        self.refused('repository integration custody')

    def test_current_custody_last_recheck_and_atomic_rollback(self):
        entry = self.custody_fixture()
        self.bind_custody(entry)
        before = self.snapshot()
        with patch.object(adapter, 'checkpoint', side_effect=RuntimeError('synthetic custody crash')), self.assertRaises(RuntimeError):
            self.admit()
        self.assertEqual(self.snapshot(), before)
        original = adapter.source_bytes
        ref = entry['proof']['current_custody']['evidence_ref']
        reads = 0
        def change_final(repo, candidate):
            nonlocal reads
            data = original(repo, candidate)
            if candidate == ref:
                reads += 1
                return data if reads == 1 else data + b' '
            return data
        with patch.object(adapter, 'source_bytes', side_effect=change_final):
            self.refused('Bound evidence changed immediately before CAS')
        self.assertEqual(reads, 2)
        self.bind_custody(entry)
        window, calls = adapter.custody_window, 0
        def expire_at_cas(attestation):
            nonlocal calls
            calls += 1
            if calls == 2:
                with patch.object(adapter.time, 'time', return_value=attestation['valid_until'] + 1):
                    return window(attestation)
            return window(attestation)
        with patch.object(adapter, 'custody_window', side_effect=expire_at_cas):
            self.refused('quiet interval')
        self.assertEqual(calls, 2)

    def test_closed_scope_graph_no_reopen_and_reviewer_checks_fail_closed(self):
        entry = self.legacy_fixture()
        self.validate_closed(entry)
        variants = []
        for field in ['no_reopen_attested', 'complete_writer_inventory']:
            item = copy.deepcopy(entry); item['proof']['terminal_scope'][field] = False
            variants.append((item, 'no-reopen'))
        item = copy.deepcopy(entry); item['proof']['terminal_scope']['writers'].pop()
        item['proof']['terminal_scope']['raw_observations'].pop()
        variants.append((item, 'descendant omitted'))
        item = copy.deepcopy(entry); item['proof']['terminal_scope']['writers'][0]['parent'] = 'historical-fixer'
        variants.append((item, 'graph root'))
        item = copy.deepcopy(entry); item['scope']['write_paths'].remove(adapter.RUNTIME)
        variants.append((item, 'scope arrays'))
        item = copy.deepcopy(entry); item['proof']['publications'].pop()
        variants.append((item, 'publications'))
        item = copy.deepcopy(entry); item['proof']['source_bindings'][0]['locations'] = [str(self.b.resolve() / entry['subject']['source_folder'])]
        variants.append((item, 'closeout source location'))
        item = copy.deepcopy(entry); item['anchors'][0]['branch'] = entry['subject']['branch']
        variants.append((item, 'checkout/anchor identity'))
        item = copy.deepcopy(entry); item['proof']['main_sha'] = self.base
        variants.append((item, 'closure main changed'))
        item = copy.deepcopy(entry); item['proof']['publications'][0]['pr_number'] = 999
        variants.append((item, 'publication identity'))
        item = copy.deepcopy(entry); item['anchors'][0]['sha256'] = '0' * 64
        variants.append((item, 'checkout/anchor identity'))
        item = copy.deepcopy(entry); item['anchors'][0]['worktree'] = str(self.root / 'unregistered-copy')
        variants.append((item, 'checkout/anchor identity'))
        for item, message in variants:
            with self.subTest(message=message):
                self.closed_refused(item, message)
        self.bind_closed([entry]); args = self.args_for_admit()
        self.request['admission_review']['review']['reviewer'] = 'historical-fixer'
        args.request = str(self.file('request', self.request))
        before = self.snapshot()
        with self.assertRaisesRegex(adapter.engine.Refusal, 'reviewer owns historical'):
            adapter.admit(args)
        self.assertEqual(self.snapshot(), before)

    def test_closed_native_observations_require_actual_terminal_scoped_turns_and_children(self):
        entry = self.legacy_fixture()
        for change, message in [('active', 'nonterminal'), ('missing-child', 'descendant'), ('not-loaded', 'native actor'),
                                ('wrong-turn', 'Missing or duplicate'), ('no-finals', 'closure turn')]:
            item = copy.deepcopy(entry)
            terminal = item['proof']['terminal_scope']
            ref = terminal['raw_observations'][0]
            projection = json.loads(Path(ref['path']).read_text())
            native = json.loads(Path(projection['native_ref']['path']).read_text())
            if change == 'active': native['turns'][1]['status'] = 'inProgress'
            if change == 'missing-child': native['turns'][1]['children'].append({'agentThreadId': 'unlisted-nested-fixer'})
            if change == 'not-loaded': native = {'status': 'notLoaded'}
            if change == 'wrong-turn': projection['scoped_turn_ids'] = ['unrelated-missing-turn']
            if change == 'no-finals': native['turns'][1]['finals'] = []
            projection['native_ref'] = self.raw('changed-native', native)
            changed_ref = self.raw('changed-projection', projection)
            terminal['raw_observations'][0] = changed_ref
            terminal['writers'][0]['observation_ref'] = changed_ref
            with self.subTest(change=change):
                self.closed_refused(item, message)

    def test_closed_proofs_reject_mutation_duplicate_keys_and_rollback_replay(self):
        entry = self.legacy_fixture()
        allocation = entry['scope']['authorities'][1]['ref']
        path = Path(allocation['path']); raw = path.read_bytes()
        # BOM/CRLF raw proof bytes are preserved without a lossy JSON round-trip.
        path.write_bytes(b'\xef\xbb\xbf' + raw.replace(b'\r\n', b'\n').replace(b'\n', b'\r\n') + b'\r\n')
        allocation['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
        entry['proof']['terminal_scope'] = self.scoped_graph(entry['subject'], entry['scope'])
        self.bind_closed([entry]); before = self.snapshot()
        projection_ref = entry['proof']['terminal_scope']['raw_observations'][0]
        projection_path = Path(projection_ref['path'])
        projection_raw = projection_path.read_bytes()
        projection_path.write_bytes(projection_raw.replace(b'"schema_version": 1', b'"schema_version": 1, "schema_version": 1'))
        duplicate_ref = {**projection_ref, 'sha256': hashlib.sha256(projection_path.read_bytes()).hexdigest()}
        duplicate = copy.deepcopy(entry)
        duplicate['proof']['terminal_scope']['raw_observations'][0] = duplicate_ref
        duplicate['proof']['terminal_scope']['writers'][0]['observation_ref'] = duplicate_ref
        self.bind_closed([duplicate]); self.refused('Duplicate JSON key: schema_version')
        projection_path.write_bytes(projection_raw)
        self.bind_closed([entry])
        with patch.object(adapter, 'checkpoint', side_effect=RuntimeError('synthetic historical crash')), self.assertRaises(RuntimeError):
            self.admit()
        self.assertEqual(self.snapshot(), before)
        original = adapter.source_bytes
        reads = 0
        def changed_final(repo, ref):
            nonlocal reads
            data = original(repo, ref)
            if ref == allocation:
                reads += 1
                return data if reads == 1 else data + b' '
            return data
        with patch.object(adapter, 'source_bytes', side_effect=changed_final):
            self.refused('Bound evidence changed')
        self.assertEqual(reads, 2)
        self.assertFalse(self.admit()['replayed'])
        self.assertTrue(self.admit()['replayed'])
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        audited = next(x for x in receipt['raw_artifacts'] if x['reference'] == allocation)
        self.assertEqual(base64.b64decode(audited['base64']), path.read_bytes())
        self.assertTrue(path.read_bytes().startswith(b'\xef\xbb\xbf'))
        self.assertIn(b'\r\n', path.read_bytes())

    def test_closed_marker_mutation_and_reopened_legacy_reservation_refuse(self):
        entry = self.legacy_fixture()
        inventory = self.bind_closed([entry])
        reservation = {'epic': '35.4', 'stories': ['35-4'], 'reason': 'reopened historical task',
                       'worktree': str(self.b), 'write_paths': ['src/reopened/'], 'conflict_domains': []}
        inventory['reservations'] = [{'reservation': reservation, 'head': engine.sha(self.b, 'HEAD'),
                                     'source_status': 'active', 'evidence_ref': 'synthetic-reopened-owner', 'independent': True,
                                     'independence_ref': 'synthetic-source-independence', 'anchors': []}]
        self.request['ownership_inventory'] = self.raw('inventory', inventory)
        self.refused('Closed subject has live legacy reservation')
        self.bind_closed([entry])
        original = adapter.qualify_tooling
        calls = 0
        anchor = self.b / entry['anchors'][0]['path']
        raw = anchor.read_bytes()
        def mutate_after_closed_validation(*args):
            nonlocal calls
            calls += 1
            result = original(*args)
            if calls == 2:
                anchor.write_bytes(raw + b'# changed historical marker\n')
            return result
        try:
            with patch.object(adapter, 'qualify_tooling', side_effect=mutate_after_closed_validation):
                self.refused('Ownership changed immediately before CAS')
        finally:
            anchor.write_bytes(raw)

    def test_closed_finalized_missing_verification_claim_scope_and_provenance_refuse(self):
        entry = self.finalized_fixture()
        with engine.database(self.repo) as db:
            row = dict(db.execute('SELECT * FROM verifications WHERE run=? AND story=?', (entry['subject']['key'], '20.2')).fetchone())
            db.execute('DELETE FROM verifications WHERE run=? AND story=?', (row['run'], row['story']))
        self.bind_closed([entry]); self.refused('not integrated/verified')
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO verifications VALUES(?,?,?,?)', tuple(row.values()))
            claim = dict(db.execute("SELECT * FROM claims WHERE run=? AND story='20.2'", (entry['subject']['key'],)).fetchone())
            db.execute("DELETE FROM claims WHERE run=? AND story='20.2'", (entry['subject']['key'],))
        self.bind_closed([entry]); self.refused('Missing finalized claims')
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)', tuple(claim.values()))
            db.execute("UPDATE claims SET result_sha=? WHERE run=? AND story='20.2'", (self.checkpoint_sha, entry['subject']['key']))
        self.bind_closed([entry]); self.refused('claim ancestry mismatch')
        with engine.database(self.repo) as db:
            db.execute("UPDATE claims SET result_sha=? WHERE run=? AND story='20.2'", (claim['result_sha'], entry['subject']['key']))
            db.execute("UPDATE journal SET result_sha=? WHERE run=? AND story='20.2'", (self.base, entry['subject']['key']))
        self.bind_closed([entry]); self.refused('journal lacks integrated backing')
        with engine.database(self.repo) as db:
            db.execute("UPDATE journal SET result_sha=? WHERE run=? AND story='20.2'", (claim['result_sha'], entry['subject']['key']))
        item = copy.deepcopy(entry); item['scope']['write_paths'].pop()
        self.bind_closed([item]); self.refused('exactly conserve')
        item = copy.deepcopy(entry); item['anchors'].append(copy.deepcopy(item['anchors'][0]))
        self.bind_closed([item]); self.refused('Duplicate or live-reserved')
        path = self.b / entry['anchors'][0]['path']
        path.write_bytes(path.read_bytes() + b'# later marker not in finalized run provenance\n')
        self.commit(self.b, 'synthetic unauthorized historical marker revision')
        item = copy.deepcopy(entry)
        item['anchors'][:4] = [self.anchor_ref(self.b, part) for part in entry['subject']['story_keys'] + ['epic-20']]
        self.bind_closed([item]); self.refused('inherited marker provenance missing')
        with engine.database(self.repo) as db:
            db.execute("UPDATE claims SET state='blocked' WHERE run=? AND story='20.2'", (entry['subject']['key'],))
        self.bind_closed([entry]); self.refused('Live claim has no active plan')

    def test_closed_finalized_cannot_override_reopened_epic_in_another_run(self):
        entry = self.finalized_fixture()
        plan = copy.deepcopy(self.v1_plan)
        plan.update(run_id='new-e20-task', epic='20', base_sha=self.base,
                    integration_worktree=str(self.c.resolve()), integration_branch='codex/worker-c',
                    stories=[self.story('a')], shared_paths=[])
        plan['stories'][0].update(id='20.4', write_paths=['src/new-e20/'])
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?,?)', (plan['run_id'], '20', plan['coordinator'],
                       engine.canonical(plan), engine.digest(plan), 'active', None))
            db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
                       (plan['run_id'], '20.4', 'reopened-worker', 1, 'codex/worker-b', str(self.b), self.base,
                        0, 'claimed', None, None, None, None))
        self.bind_closed([entry]); self.refused('Finalized subject has outstanding/reopened epic claim')

    def test_closed_annotation_cannot_override_live_runtime_reservation_or_repository_custody(self):
        entry = self.legacy_fixture()
        # Current ownership validation executes before historical classification.
        reservation = {'epic': 'unrelated-current', 'stories': ['current-task'], 'reason': 'current allocation',
                       'worktree': str(self.b), 'write_paths': [adapter.RUNTIME], 'conflict_domains': []}
        inventory = self.bind_closed([entry])
        inventory['reservations'] = [{'reservation': reservation, 'head': engine.sha(self.b, 'HEAD'),
                                     'source_status': 'active', 'evidence_ref': 'synthetic-current-owner', 'independent': True,
                                     'independence_ref': 'synthetic-independent-source', 'anchors': []}]
        self.request['ownership_inventory'] = self.raw('inventory', inventory)
        self.refused('Admission conflicts with legacy reservation')
        self.bind_closed([entry])
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO journal VALUES(?,?,?,?,?,?)', ('unrelated-run', 'current-task', self.base, self.base, None, 'prepared'))
        self.bind_closed([entry]); self.refused('repository integration custody')

    def test_closed_legacy_reopened_source_casefold_is_the_only_matching_identity(self):
        original_folder = Path(adapter.LEGACY['spec-design-35-4-35-4'][1])
        folder = original_folder.parent.as_posix() + '/' + original_folder.name.upper()
        control = self.root / 'reopened-control'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/reopened-control', str(control), self.base)
        story_path = folder + '/stories/2-fixture.md'
        spec_text = '# Synthetic independently allocated reopened source\n'
        manifest = '- id: "2"\n  title: Fixture\n  description: Approved synthetic behavior.\n'
        story_text = '---\ntitle: Fixture\ntype: feature\nstatus: ready-for-dev\n---\n\n## Tasks & Acceptance\n\n- Persist synthetic result.\n'
        for path, value in [(folder + '/SPEC.md', spec_text), (folder + '/stories.yaml', manifest), (story_path, story_text)]:
            self.write(control, path, value)
        source_head = self.commit(control, 'synthetic differently cased reopened legacy source')
        main = self.main_merge(source_head)
        resolved, code = engine.story_pr_module('story_plan').build_stories_resolve_result(str(control / folder), '2')
        self.assertEqual(code, 0)
        item = copy.deepcopy(self.foreign_template)
        item.update(id=resolved['story_key'], spec_path=story_path, spec_revision=hashlib.sha256(story_text.encode()).hexdigest(),
                    write_paths=['src/reopened/', story_path, adapter.state_path(resolved['story_key']),
                                 '_bmad-output/auto-bmad/reports/' + resolved['story_key'] + '.md'])
        item['source'].update({key: resolved[key] for key in ['story_id', 'story_key', 'position', 'spec_checkpoint', 'done_checkpoint']})
        item['source'].update(spec_folder=folder, files=[
            {'path': folder + '/SPEC.md', 'sha256': hashlib.sha256(spec_text.encode()).hexdigest()},
            {'path': folder + '/stories.yaml', 'sha256': hashlib.sha256(manifest.encode()).hexdigest()}])
        plan = copy.deepcopy(self.plan)
        plan.update(run_id='reopened-legacy-source', epic='reopened-source', coordinator='reopened-coordinator',
                    integration_branch='codex/reopened-control', integration_worktree=str(control.resolve()),
                    base_sha=source_head, stories=[item])
        engine.execute(engine.parser().parse_args(['--repo', str(control), 'init', '--owner', 'reopened-coordinator',
                                                   '--plan', str(self.file('reopened-plan', plan))]))
        worker = self.root / 'reopened-worker'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/reopened-worker', str(worker), main)
        engine.execute(engine.parser().parse_args(['--repo', str(control), 'claim', '--run', plan['run_id'],
                                                   '--owner', plan['coordinator'], '--story', item['id'],
                                                   '--worker', 'reopened-worker', '--branch', 'codex/reopened-worker',
                                                   '--worktree', str(worker), '--expected-head', main]))
        # Admit the current claim through the unchanged helper before old
        # copied markers appear; then capture complete closure at the new M.
        # No run/key/branch or ordinary runtime overlap masks casefold.
        entry = self.legacy_fixture()
        self.assertNotEqual(folder, entry['subject']['source_folder'])
        self.assertEqual(folder.casefold(), entry['subject']['source_folder'].casefold())
        self.assertNotIn(item['id'], entry['subject']['story_keys'])
        self.assertNotEqual(plan['run_id'], entry['subject']['key'])
        self.assertNotEqual('codex/reopened-worker', entry['subject']['branch'])
        self.assertFalse(engine.conflicts({**self.item('a'), 'write_paths': adapter.OLD_PATHS + [adapter.RUNTIME],
                                           'conflict_domains': self.item('a')['conflict_domains'] + [adapter.DOMAIN]}, item))
        self.bind_closed([entry]); self.refused('^Closed subject has outstanding/reopened claim$')

    def test_closed_legacy_reversed_publication_parents_with_matching_raw_observation_refuse(self):
        entry = self.legacy_fixture()
        publication = entry['proof']['publications'][0]
        publication['base_sha'], publication['head_sha'] = publication['head_sha'], publication['base_sha']
        publication['observation_ref'] = self.raw('reversed-historical-publication',
                                                 {key: value for key, value in publication.items() if key != 'observation_ref'})
        self.bind_closed([entry]); self.refused('^Historical publication merge ancestry mismatch$')

    def test_closed_legacy_schema1_short_ids_and_source_spec_cannot_reopen(self):
        entry = self.legacy_fixture()
        worker = self.root / 'schema1-reopened-worker'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/schema1-reopened-worker', str(worker), self.base)
        for story_id, spec_path in [('35.4', 'spec/b.md'), ('35-4', 'spec/b.md'),
                                    ('other-id', entry['subject']['source_folder'] + '/stories/old.md')]:
            item = self.story('b')
            base = self.base
            if spec_path != 'spec/b.md':
                body = 'Approved reopened legacy source\n'
                self.write(self.b, spec_path, body)
                base = self.commit(self.b, 'synthetic schema1 reopened source spec')
                item['spec_revision'] = hashlib.sha256(body.encode()).hexdigest()
                entry['anchors'] = [self.anchor_ref(self.b, entry['subject']['key'])]
            item.update(id=story_id, write_paths=['src/reopened-schema1/', spec_path], spec_path=spec_path)
            plan = copy.deepcopy(self.v1_plan)
            plan.update(run_id='schema1-reopened-legacy', epic='other-epic', base_sha=base,
                        integration_worktree=str(self.b.resolve()), integration_branch='codex/worker-b', stories=[item])
            engine.validate_plan(self.b, plan)
            with engine.database(self.repo) as db:
                db.execute('INSERT OR REPLACE INTO runs VALUES(?,?,?,?,?,?,?)', (plan['run_id'], plan['epic'], plan['coordinator'],
                           engine.canonical(plan), engine.digest(plan), 'active', None))
                db.execute('DELETE FROM claims WHERE run=?', (plan['run_id'],))
                db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
                           (plan['run_id'], story_id, 'schema1-reopened-worker', 1, 'codex/schema1-reopened-worker',
                            str(worker), base, 0, 'claimed', None, None, None, None))
            self.assertNotEqual(plan['run_id'], entry['subject']['key'])
            self.assertNotIn(story_id, entry['subject']['story_keys'])
            self.assertFalse(engine.conflicts({**self.item('a'), 'write_paths': adapter.OLD_PATHS + [adapter.RUNTIME]}, item))
            with self.subTest(story_id=story_id):
                self.bind_closed([entry]); self.refused('^Closed subject has outstanding/reopened claim$')

    def test_fixture_canonicalizes_tooling_alias_without_weakening_identity_guards(self):
        # A lexical parent traversal provides the same noncanonical input on
        # every OS, even where native Windows short-name creation is disabled.
        alias = self.c / '..' / 'c'
        canonical = engine.top(alias)
        self.assertNotEqual(alias, canonical)
        self.assertEqual(alias.resolve(), canonical)
        self.assertIn(canonical, engine.worktrees(self.repo))
        self.assertEqual(engine.common(canonical), engine.common(self.repo))
        # Preserve the original exact-root refusal; canonicalize the fixture
        # input rather than accepting a lexical alias inside the qualifier.
        with patch.object(adapter, 'ROOT', alias):
            self.refused('Tooling must be its registered same-repository checkout')
        other = self.root / 'unrelated-repository'
        other.mkdir()
        self.git(other, 'init', '-b', 'codex/unrelated')
        self.git(other, 'config', 'user.name', 'Synthetic identity regression')
        self.git(other, 'config', 'user.email', 'identity@example.invalid')
        self.write(other, 'fixture.txt', 'unrelated common Git directory\n')
        self.commit(other, 'synthetic unrelated repository')
        self.assertNotIn(other.resolve(), engine.worktrees(self.repo))
        self.assertNotEqual(engine.common(other), engine.common(self.repo))
        for root, message in [(self.c / 'scripts', 'registered same-repository checkout'),
                              (other.resolve(), 'registered same-repository checkout'),
                              (self.repo.resolve(), 'separate from live checkouts')]:
            with self.subTest(root=str(root)), patch.object(adapter, 'ROOT', root):
                self.refused(message)
        patches = self.tooling_identity_patches(alias)
        for identity_patch in patches:
            identity_patch.start()
        try:
            self.assertEqual(adapter.ROOT, canonical)
            self.assertEqual(self.admit()['generation'], 2)
        finally:
            for identity_patch in reversed(patches):
                identity_patch.stop()

    def test_tooling_lands_on_main_after_unchanged_blocked_checkpoints(self):
        heads = [engine.sha(path, 'HEAD') for path in [self.repo, self.a]]
        self.write(self.c, 'scripts/maintenance/admit_story35_6_runtime.py',
                   SCRIPT.read_text(encoding='utf-8') + '\n# Later independently reviewed synthetic tooling revision.\n')
        tooling = self.commit(self.c, 'synthetic tooling lands after live checkpoints')
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', tooling)
        self.request = self.make_request()
        self.assertNotEqual(tooling, self.base)
        self.assertNotEqual(tooling, self.checkpoint_sha)
        self.assertTrue(engine.ancestor(self.repo, self.base, tooling))
        self.assertEqual([engine.sha(path, 'HEAD') for path in [self.repo, self.a]], heads)
        self.test_success_only_exact_additions_and_unchanged_helper_continuation()

    def test_all_raw_audit_artifacts_reconstruct_exact_bytes_including_bom(self):
        # BOM own state starts with a comment, preserving existing load_state parsing.
        own = self.a / adapter.OWN_STATE
        own.write_bytes(b'\xef\xbb\xbf# synthetic BOM state\n' + own.read_bytes())
        self.checkpoint_sha = self.commit(self.a, 'synthetic BOM checkpoint')
        self.request = self.make_request()
        references = [self.request[key] for key in ['tooling_ci', 'publication', 'ownership_inventory']]
        q = self.request['quiescence']
        references.append({'path': q['evidence_path'], 'sha256': q['evidence_sha256']})
        for ref in references:
            path = Path(ref['path'])
            path.write_bytes(b'\xef\xbb\xbf' + path.read_bytes())
            ref['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
        q['evidence_sha256'] = references[-1]['sha256']
        self.admit()
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        artifacts = receipt['raw_artifacts']
        self.assertEqual({item['reference']['path'] for item in artifacts},
                         {ref['path'] for ref in references} | {str(own)})
        for item in artifacts:
            data = base64.b64decode(item['base64'], validate=True)
            self.assertTrue(data.startswith(b'\xef\xbb\xbf'))
            self.assertEqual(data, Path(item['reference']['path']).read_bytes())
            self.assertEqual(hashlib.sha256(data).hexdigest(), item['reference']['sha256'])

    def test_request_parses_only_initial_raw_bytes_and_rejects_duplicate_keys(self):
        args = self.args_for_admit()
        original = Path.read_bytes
        request_path = Path(args.request)
        initial = original(request_path)
        reads = 0

        def read_once_then_changed(path):
            nonlocal reads
            if path == request_path:
                reads += 1
                return initial if reads == 1 else b'{}'
            return original(path)

        original_text = Path.read_text

        def no_request_text_parse(path, *args, **kwargs):
            self.assertNotEqual(path, request_path, 'Request must not be reopened for parsing')
            return original_text(path, *args, **kwargs)

        before = self.snapshot()
        with patch.object(Path, 'read_bytes', read_once_then_changed), patch.object(Path, 'read_text', no_request_text_parse), self.assertRaisesRegex(adapter.engine.Refusal, 'Request changed'):
            adapter.admit(args)
        self.assertEqual(reads, 2)  # Initial capture and final byte recheck only.
        self.assertEqual(self.snapshot(), before)
        request_path.write_bytes(b'{"schema_version":1,"schema_version":1}')
        with self.assertRaisesRegex(adapter.engine.Refusal, 'Duplicate JSON key'):
            adapter.admit(args)
        self.assertEqual(self.snapshot(), before)

    def test_success_only_exact_additions_and_unchanged_helper_continuation(self):
        original_plan = copy.deepcopy(self.plan)
        response = self.admit()
        self.assertEqual((response['generation'], response['schema_version'], response['base_sha']), (2, 2, self.checkpoint_sha))
        self.assertEqual(response['story']['write_paths'], adapter.OLD_PATHS + [adapter.RUNTIME])
        self.assertEqual(response['story']['conflict_domains'], original_plan['stories'][0]['conflict_domains'] + [adapter.DOMAIN])
        for key in ['source', 'spec_revision', 'required_checks', 'risk_domains', 'concurrency_approval_ref']:
            self.assertEqual(response['story'][key], original_plan['stories'][0][key])
        self.assertEqual(json.loads(self.planfile.read_text()), original_plan)
        self.assertEqual(engine.sha(self.a, 'HEAD'), self.checkpoint_sha)
        self.assertEqual(engine.sha(self.repo, 'HEAD'), self.base)
        self.call('heartbeat', story=adapter.STORY, worker='worker-a', generation=2)
        self.write(self.a, adapter.RUNTIME, 'synthetic existing proxy configuration fix\n')
        result = self.commit(self.a, 'synthetic admitted runtime fix')
        evidence = {'schema_version': 2, 'run_id': adapter.RUN, 'story_id': adapter.STORY, 'worker': 'worker-a',
                    'generation': 2, 'base_sha': self.checkpoint_sha, 'result_sha': result,
                    'workflow_version': self.plan['workflow_version'], 'spec_revision': self.item('a')['spec_revision'],
                    'changed_paths': [adapter.RUNTIME], 'checks': [self.check(result)], 'review': self.review(result),
                    'routes': [{'phase': 'build', 'model': 'gpt-6.1-sol', 'effort': 'low', 'risk_domains': ['ordinary'], 'reason': 'fixture'}],
                    'publication': {**self.publication('a', result), 'repository': adapter.REPOSITORY,
                                    'pr_number': 127, 'pr_url': 'https://github.com/rthunborg/Kopplas/pull/127'}}
        evidence['checks'][0]['skipped'] = 1
        with self.assertRaises(engine.Refusal):
            self.call('submit', story=adapter.STORY, worker='worker-a', generation=2, evidence=self.file('submit', evidence))
        evidence['checks'][0]['skipped'] = 0
        accepted = self.call('submit', story=adapter.STORY, worker='worker-a', generation=2, evidence=self.file('submit', evidence))
        self.assertEqual(accepted['state'], 'pr-ready')
        with engine.database(self.repo) as db:
            audit = dict(db.execute('SELECT * FROM claim_amendments').fetchone())
            self.assertEqual(json.loads(audit['before_plan']), original_plan)
            self.assertEqual(json.loads(audit['before_claim'])['block_reason'], 'runtime file not yet admitted')
            self.assertIn('raw_artifacts', json.loads(audit['stopped_writers']))
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute('DELETE FROM claim_amendments')

    def test_old_generation_rejected_for_heartbeat_block_and_submit(self):
        self.admit()
        for command in ['heartbeat', 'block', 'submit']:
            with self.subTest(command=command), self.assertRaises(engine.Refusal):
                self.call(command, story=adapter.STORY, worker='worker-a', generation=1,
                          **({'reason': 'stale'} if command == 'block' else {'evidence': self.file('stale', {})} if command == 'submit' else {}))

    def test_replay_is_historical_and_changed_payload_refuses(self):
        response = self.admit()
        before = self.snapshot()
        replay = self.admit()
        self.assertEqual(replay, {**response, 'replayed': True})
        self.assertEqual(self.snapshot(), before)
        self.request['reason'] = 'changed'
        self.refused()

    def test_competing_token_and_stale_generation_refuse(self):
        self.admit()
        self.request['request_id'] = 'another-token'
        self.refused()

    def test_failure_after_cas_rolls_back_all_three_records(self):
        before = self.snapshot()
        with patch.object(adapter, 'checkpoint', side_effect=RuntimeError('synthetic crash')), self.assertRaises(RuntimeError):
            self.admit()
        self.assertEqual(self.snapshot(), before)

    def test_bound_bytes_are_rechecked_immediately_before_cas(self):
        original = adapter.qualify_tooling
        calls = 0

        def change_after_validation(*args):
            nonlocal calls
            calls += 1
            original(*args)
            if calls == 2:
                Path(self.request['publication']['path']).write_text('{}')

        with patch.object(adapter, 'qualify_tooling', side_effect=change_after_validation):
            self.refused()
        self.assertEqual(calls, 2)

    def test_blocked_claim_cannot_retain_prior_submission_evidence(self):
        with engine.database(self.repo) as db:
            db.execute('UPDATE claims SET evidence=?,result_sha=? WHERE run=? AND story=?',
                       ('{}', self.checkpoint_sha, adapter.RUN, adapter.STORY))
        self.refused()

    def test_wrong_identity_scope_heads_hashes_and_tooling_refuse(self):
        for field, value in [('run_id', 'different-run'), ('story_id', '35-7'), ('owner', 'different-owner'),
                             ('worker', 'different-worker'), ('expected_generation', True),
                             ('expected_plan_hash', '0' * 64), ('checkpoint_sha', self.base),
                             ('add_write_paths', ['playwright.config.ts', 'package.json']),
                             ('add_conflict_domains', ['broader-runtime']), ('tool_sha256', '0' * 64),
                             ('reviewed_tooling_sha', self.checkpoint_sha), ('workflow_version', '0' * 64)]:
            with self.subTest(field=field), patch.dict(self.request, {field: value}):
                self.refused()

    def test_tooling_and_admission_reviews_are_independent_high_and_bound(self):
        for change in [{'effort': 'low'}, {'reviewer': 'worker-a'}, {'reviewer': 'independent-tooling-author'}, {'unresolved': ['serious']}]:
            with self.subTest(change=change), patch.dict(self.request['tooling_review'], change):
                self.refused()
        args = self.args_for_admit()
        altered = json.loads(Path(args.request).read_text())
        altered['reason'] = 'unreviewed edit'
        Path(args.request).write_text(json.dumps(altered))
        with self.assertRaises(adapter.engine.Refusal):
            adapter.admit(args)

    def test_admission_review_rejects_every_writer_and_invalid_review_field(self):
        q = self.request['quiescence']
        writers = json.loads(Path(q['evidence_path']).read_text())
        writers['writers'].append({'identity': 'nested-stopped-fixer', 'role': 'fixer', 'state': 'stopped',
                                   'evidence_ref': 'synthetic-terminal-nested-fixer'})
        ref = self.raw('writers-with-fixer', writers)
        q.update(evidence_path=ref['path'], evidence_sha256=ref['sha256'])
        cases = [({'reviewer': identity}, 'Independent review|independent of claim writers')
                 for identity in ['independent-tooling-author', 'worker-a', 'coordinator-session', 'nested-stopped-fixer']]
        cases += [({'model': 'different-model'}, 'Invalid review model'),
                  ({'effort': 'low'}, 'Sensitive review requires high'),
                  ({'commit': self.base}, 'Independent review is incomplete'),
                  ({'approved': False}, 'Independent review is incomplete'),
                  ({'unresolved': ['consequential finding']}, 'Independent review is incomplete')]
        for changed, message in cases:
            with self.subTest(changed=changed):
                args = self.args_for_admit()
                request = json.loads(Path(args.request).read_text())
                request['admission_review']['review'].update(changed)
                self.assertEqual(request['admission_review']['request_digest'],
                                 engine.digest({k: v for k, v in request.items() if k != 'admission_review'}))
                Path(args.request).write_text(json.dumps(request))
                before = self.snapshot()
                with self.assertRaisesRegex(adapter.engine.Refusal, message):
                    adapter.admit(args)
                self.assertEqual(self.snapshot(), before)
        # The same stopped fixer cannot qualify the tooling review either.
        with patch.dict(self.request['tooling_review'], {'reviewer': 'nested-stopped-fixer'}):
            self.refused('independent of claim writers')

    def test_ci_requires_both_zero_skip_exact_sha_os_jobs(self):
        ci = json.loads(Path(self.request['tooling_ci']['path']).read_text())
        for label in ['missing-os', 'skipped', 'wrong-sha']:
            changed = copy.deepcopy(ci)
            if label == 'missing-os':
                changed['checks'].pop()
            elif label == 'skipped':
                changed['checks'][0]['skipped'] = 1
            else:
                changed['commit'] = self.checkpoint_sha
            with self.subTest(label=label), patch.dict(self.request, {'tooling_ci': self.raw('bad-ci', changed)}):
                self.refused()

    def test_live_writer_or_changed_raw_bytes_refuse(self):
        q = self.request['quiescence']
        receipt = json.loads(Path(q['evidence_path']).read_text())
        receipt['writers'][0]['state'] = 'running'
        ref = self.raw('running-writers', receipt)
        with patch.dict(q, {'evidence_path': ref['path'], 'evidence_sha256': ref['sha256']}):
            self.refused()
        Path(self.request['publication']['path']).write_text('{}')
        self.refused()

    def test_dirty_checkout_or_old_scope_violation_refuse(self):
        self.write(self.a, adapter.RUNTIME, 'unadmitted')
        self.refused()
        self.checkpoint_sha = self.commit(self.a, 'unadmitted runtime before admission')
        self.request = self.make_request()
        self.refused('Changed paths outside assigned ownership')

    def test_publication_unknown_identity_closed_or_divergent_head_refuse(self):
        pub = json.loads(Path(self.request['publication']['path']).read_text())
        for changed in [{'pr_number': 128}, {'state': 'closed'}, {'merged': True}, {'head_branch': 'replacement-branch'}]:
            with self.subTest(changed=changed), patch.dict(self.request, {'publication': self.raw('bad-pub', {**pub, **changed})}):
                self.refused()
        self.state['publication_operation_json'] = self.state['publication_operation_json'].replace('confirmed', 'unknown')
        self.save_state()
        self.checkpoint_sha = self.commit(self.a, 'unknown publication outcome')
        self.request = self.make_request()
        self.refused()
        # Match durable/provider head to a genuine sibling commit, then refresh
        # every checkpoint-bound artifact so only the ancestry guard can refuse.
        self.write(self.b, 'src/producer/divergent.txt', 'synthetic sibling publication\n')
        divergent = self.commit(self.b, 'synthetic divergent published head')
        operation = json.loads(self.state['publication_operation_json'])
        operation.update(status='confirmed', head=divergent)
        self.state['publication_operation_json'] = json.dumps(operation)
        self.save_state()
        self.checkpoint_sha = self.commit(self.a, 'synthetic matching durable divergent head')
        self.request = self.make_request()
        self.request['publication'] = self.raw('divergent-publication', {**pub, 'head_sha': divergent})
        self.refused('Published head/checkpoint ancestry mismatch')
        # Restore valid publication before isolating immutable identity mismatch.
        operation['head'] = self.base
        self.state['publication_operation_json'] = json.dumps(operation)
        identity = json.loads(self.state['publication_identity_json'])
        identity['branch'] = 'codex/replacement-identity'
        self.state['publication_identity_json'] = json.dumps(identity)
        self.save_state()
        self.checkpoint_sha = self.commit(self.a, 'synthetic immutable identity mismatch')
        self.request = self.make_request()
        self.refused('Immutable publication identity mismatch')

    def test_stale_inventory_and_unknown_anchor_refuse(self):
        self.write(self.b, 'producer.txt', 'producer changed since inventory')
        self.refused()
        self.write(self.b, '_bmad-output/auto-bmad/state/producer.yaml', 'status: in-progress\nstory_id: producer\n')
        self.request['ownership_inventory'] = self.raw('refreshed-inventory', self.inventory())
        self.refused()

    def reservation(self, path= 'src/producer/', domains=None):
        return {'reservation': {'epic': 'producer', 'stories': [], 'reason': 'synthetic active producer',
                                 'worktree': str(self.b), 'write_paths': [path], 'conflict_domains': domains or []},
                'head': engine.sha(self.b, 'HEAD'), 'source_status': 'active', 'evidence_ref': 'synthetic-current-producer-status',
                'independent': True, 'independence_ref': 'synthetic-independent-source-assessment', 'anchors': []}

    def test_nonconflicting_active_producer_allowed_but_conflicts_preserve_reservation(self):
        for entry in [self.reservation(adapter.RUNTIME), self.reservation(domains=[adapter.DOMAIN]),
                      {**self.reservation(), 'source_status': 'unknown'}]:
            with self.subTest(entry=entry):
                self.request['ownership_inventory'] = self.raw('producer-inventory', self.inventory([entry]))
                self.refused()
        self.request['ownership_inventory'] = self.raw('producer-inventory', self.inventory([self.reservation()]))
        self.assertEqual(self.admit()['generation'], 2)

    def test_actual_concurrent_claim_collision_refuses_without_changing_its_reservation(self):
        producer = self.root / 'producer-worker'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/producer-worker', str(producer), self.base)
        plan = copy.deepcopy(self.v1_plan)
        item = self.story('b')
        item['write_paths'] = [adapter.RUNTIME, 'spec/b.md']
        plan.update(run_id='producer-run', epic='producer-epic', coordinator='producer-coordinator',
                    integration_branch='codex/worker-b', integration_worktree=str(self.b), base_sha=self.base, stories=[item])
        self.call('init', owner='producer-coordinator', plan=self.file('producer-plan', plan))
        self.call('claim', run='producer-run', owner='producer-coordinator', story='b', worker='producer-worker',
                  branch='codex/producer-worker', worktree=producer)
        self.request['ownership_inventory'] = self.raw('claim-inventory', self.inventory())
        self.refused()

    def test_foreign_schema2_source_uses_its_authoritative_checkout_and_independence(self):
        folder = '_bmad-output/specs/foreign-only'
        key = 'spec-foreign-only-1'
        story_path = folder + '/stories/1-fixture.md'
        spec_text = '# Synthetic foreign-only source\n'
        manifest = '- id: "1"\n  title: Fixture\n  description: Approved synthetic behavior.\n'
        story_text = '---\ntitle: Fixture\ntype: feature\nstatus: ready-for-dev\n---\n\n## Tasks & Acceptance\n\n- Persist synthetic result.\n'
        for path, value in [(folder + '/SPEC.md', spec_text), (folder + '/stories.yaml', manifest), (story_path, story_text)]:
            self.write(self.b, path, value)
        foreign_base = self.commit(self.b, 'synthetic foreign source lands on later main')
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', foreign_base)
        self.assertFalse((self.repo / folder).exists())
        item = copy.deepcopy(self.foreign_template)
        item.update(id=key, spec_path=story_path, spec_revision=hashlib.sha256(story_text.encode()).hexdigest(),
                    write_paths=['src/foreign/', story_path, '_bmad-output/auto-bmad/state/' + key + '.yaml',
                                 '_bmad-output/auto-bmad/reports/' + key + '.md'])
        item['source'].update(spec_folder=folder, story_key=key,
                              files=[{'path': folder + '/SPEC.md', 'sha256': hashlib.sha256(spec_text.encode()).hexdigest()},
                                     {'path': folder + '/stories.yaml', 'sha256': hashlib.sha256(manifest.encode()).hexdigest()}])
        plan = copy.deepcopy(self.plan)
        plan.update(run_id='foreign-run', epic='spec-foreign-only', coordinator='foreign-coordinator',
                    integration_branch='codex/worker-b', integration_worktree=str(self.b), base_sha=foreign_base, stories=[item])
        engine.execute(engine.parser().parse_args(['--repo', str(self.b), 'init', '--owner', 'foreign-coordinator',
                                                   '--plan', str(self.file('foreign-plan', plan))]))
        foreign_worker = self.root / 'foreign-worker'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/foreign-worker', str(foreign_worker), foreign_base)
        engine.execute(engine.parser().parse_args(['--repo', str(self.b), 'claim', '--run', 'foreign-run',
                                                   '--owner', 'foreign-coordinator', '--story', key,
                                                   '--worker', 'foreign-worker', '--branch', 'codex/foreign-worker',
                                                   '--worktree', str(foreign_worker), '--expected-head', foreign_base]))
        self.request = self.make_request()
        # Preserve the existing concurrent-source independence requirement.
        nonindependent = copy.deepcopy(plan)
        nonindependent['stories'][0]['independent_of_pending'] = False
        with engine.database(self.repo) as db:
            db.execute('UPDATE runs SET plan=?,plan_hash=? WHERE run=?',
                       (engine.canonical(nonindependent), engine.digest(nonindependent), 'foreign-run'))
        self.request['ownership_inventory'] = self.raw('foreign-not-independent', self.inventory())
        self.refused('Reviewed concurrent source independence required')
        with engine.database(self.repo) as db:
            db.execute('UPDATE runs SET plan=?,plan_hash=? WHERE run=?', (engine.canonical(plan), engine.digest(plan), 'foreign-run'))
        self.request['ownership_inventory'] = self.raw('foreign-independent', self.inventory())
        self.assertEqual(self.admit()['generation'], 2)

    def test_declared_reservation_cannot_be_omitted_from_inventory(self):
        reservation = self.reservation()['reservation']
        revised_plan = copy.deepcopy(self.plan)
        revised_plan['legacy_reservations'] = [reservation]
        with engine.database(self.repo) as db:
            db.execute('UPDATE runs SET plan=?,plan_hash=? WHERE run=?',
                       (engine.canonical(revised_plan), engine.digest(revised_plan), adapter.RUN))
        self.request['expected_plan_hash'] = engine.digest(revised_plan)
        self.request['ownership_inventory'] = self.raw('omitted-reservation-inventory', self.inventory())
        self.refused()

    def test_target_submission_journal_verification_and_repository_custody_refuse(self):
        cases = [
            ('INSERT INTO journal VALUES(?,?,?,?,?,?)', (adapter.RUN, adapter.STORY, self.base, self.base, None, 'failed'), 'Target journal or repository integration custody exists'),
            ('INSERT INTO journal VALUES(?,?,?,?,?,?)', ('other', 'producer', self.base, self.base, None, 'prepared'), 'Target journal or repository integration custody exists'),
            ('INSERT INTO verifications VALUES(?,?,?,?)', (adapter.RUN, adapter.STORY, self.base, '{}'), 'Target verification already exists'),
            ('INSERT INTO story_pr_publications VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
             (adapter.RUN, adapter.STORY, adapter.REPOSITORY, 127, 'url', 'branch', 'main', self.base, 'pr-ready', None, '{}', None, None), 'Publication submission or repository merge custody exists'),
            ('INSERT INTO story_pr_publications VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
             ('other', 'producer', adapter.REPOSITORY, 128, 'url', 'branch', 'main', self.base, 'merge-prepared', '{}', '{}', None, None), 'Publication submission or repository merge custody exists'),
        ]
        for sql, values, message in cases:
            with self.subTest(sql=sql, values=values):
                with engine.database(self.repo) as db:
                    db.execute(sql, values)
                self.request['ownership_inventory'] = self.raw('fresh-custody-inventory', self.inventory())
                self.refused(message)
                with engine.database(self.repo) as db:
                    table = sql.split()[2]
                    db.execute('DELETE FROM ' + table)


    def union_producer_reservations(self):
        # Two actual grants for ONE active producer; original54 is never shrunk.
        original = ['src/producer/file-' + str(i) + '.ts' for i in range(52)] + [
                    'tests/e2e/producer-a.ts', 'tests/e2e/producer-b.ts']
        reservations = []
        for name, paths, domains in [('original54', original, ['producer:original']),
                                     ('package1', ['package.json'], ['producer:package'])]:
            res = {'epic': 'actual-producer-' + name, 'stories': ['same-active-task'],
                   'reason': 'Synthetic full approved producer ' + name, 'worktree': str(self.c),
                   'write_paths': paths, 'conflict_domains': domains}
            reservations.append({'reservation': res, 'head': engine.sha(self.c, 'HEAD'),
                'source_status': 'active', 'evidence_ref': 'approved-' + name,
                'independent': True, 'independence_ref': 'reviewed-full-' + name, 'anchors': []})
        return reservations

    def bind_union_custody(self, entry, reservations, transform=None):
        def one_actual_producer(a):
            grants = [item['reservation'] for item in reservations]
            producer = {'identity': 'one-active-producer', 'kind': 'actor', 'owner': 'one-active-producer',
                'host': 'fixture-host', 'state': 'live-reserved',
                'write_paths': sorted({path for grant in grants for path in grant['write_paths']}),
                'conflict_domains': sorted({domain for grant in grants for domain in grant['conflict_domains']}),
                'queued': False, 'background': True,
                'allocation': [engine.digest({'kind': 'legacy-reservation', 'reservation': grant}) for grant in grants],
                'native_ref': self.raw('one-active-producer', {'source': 'codex_app.read_thread',
                    'threadId': 'one-active-producer', 'thread_status': 'running',
                    'turns': [{'id': 'same-still-active-task', 'status': 'inProgress', 'finals': []}]})}
            # Replace fixture scaffolding before evidence capture: no second
            # writer or execution impersonates the actual producer's supplement.
            a['records'] = [row for row in a['records'] if row['state'] != 'live-reserved'] + [producer]
            if transform:
                transform(a, producer)
            # Every negative refreshes ALL host facts/projections/raw references;
            # a stale corroboration digest cannot mask the union/owner guard.
            facts = [{k: v for k, v in row.items() if k != 'native_ref'} for row in a['records']]
            checked = []
            for purpose, kind in [('assignments', 'actor'), ('executions', 'execution'), ('external-writers', 'external-writer')]:
                rows = [fact for fact in facts if fact['kind'] == kind]
                raw = self.raw('union-actual-' + purpose, {'source': 'synthetic-existing-host-task-records', 'rows': rows})
                projection = {'source': 'coordinator.current-custody-inventory-projection', 'purpose': purpose,
                    'operator': 'actual-host-operator', 'host': 'fixture-host', 'observed_at': a['observed_at'],
                    'raw_refs': [raw], 'records': rows, 'uncertainties': []}
                checked.append({'purpose': purpose, 'ref': self.raw('union-projection-' + purpose, projection)})
            host = {'source': 'coordinator.host-operator-custody-observation', 'operator': 'actual-host-operator',
                'host': 'fixture-host', 'observed_at': a['observed_at'],
                'knowledge': 'Synthetic direct current facts preserve both full grants for one active producer.',
                'checked_sources': checked, 'facts': facts, 'uncertainties': []}
            a['operators'][0]['observation_ref'] = self.raw('union-host-facts', host)
        return self.bind_custody(entry, one_actual_producer, reservations)

    def test_current_custody_one_active_producer_full54_plus_package1(self):
        entry = self.custody_fixture()
        reservations = self.union_producer_reservations()
        self.assertEqual([len(item['reservation']['write_paths']) for item in reservations], [54, 1])
        a = self.bind_union_custody(entry, reservations)
        producer = next(row for row in a['records'] if row['state'] == 'live-reserved')
        self.assertEqual(len(producer['allocation']), 2)
        self.assertEqual(len(producer['write_paths']), 55)
        self.assertIn('package.json', producer['write_paths'])
        self.assertTrue(producer['background'])
        self.assertEqual([row['identity'] for row in a['records'] if row['state'] == 'live-reserved'], ['one-active-producer'])
        self.assertEqual(self.admit()['generation'], 2)
        with engine.database(self.repo) as db:
            audit = db.execute('SELECT * FROM claim_amendments').fetchone()
            receipt = json.loads(audit['stopped_writers'])
        self.assertEqual(receipt['ownership_inventory']['reservations'], reservations)
        self.assertEqual(receipt['closed_classifications'][0]['proof']['current_custody']['attestation'], a)
        self.assertTrue(all(item['source_status'] == 'active' for item in receipt['ownership_inventory']['reservations']))
        self.assertEqual(json.loads(audit['before_plan']), self.plan)

    def test_current_custody_allocation_union_refusals_preserve_store(self):
        entry = self.custody_fixture()
        reservations = self.union_producer_reservations()
        complete = 'Current writing/queued execution lacks complete live reservation'
        def omit_supplement(a, producer):
            producer['allocation'].pop()
            producer['write_paths'].remove('package.json')
            producer['conflict_domains'].remove('producer:package')
        variants = [
            ('missing-id-with-full-scope', lambda a, p: p['allocation'].pop(), complete),
            ('omitted-supplement-entirely', omit_supplement, 'Current custody omitted known actor or live allocation'),
            ('reduced-original', lambda a, p: p['write_paths'].pop(0), complete),
            ('reduced-domain', lambda a, p: p['conflict_domains'].pop(), complete),
            ('unknown-digest', lambda a, p: p['allocation'].__setitem__(1, '0'*64), complete),
            ('extra-path', lambda a, p: p['write_paths'].append('src/unallocated.ts'), complete),
            ('extra-domain', lambda a, p: p['conflict_domains'].append('unallocated:domain'), complete),
            ('duplicate-digest', lambda a, p: p['allocation'].append(p['allocation'][0]), 'current live allocation references contains duplicates'),
            ('empty-list', lambda a, p: p.update(allocation=[]), 'Current live allocation references cannot be empty'),
            ('non-string-id', lambda a, p: p.update(allocation=[None]), 'current live allocation references must be an array of nonempty strings'),
            ('duplicate-writer', lambda a, p: a['records'].append(copy.deepcopy(p)), 'Actual current writer/execution identity or state is unknown'),
        ]
        for name, transform, message in variants:
            with self.subTest(name=name):
                self.bind_union_custody(entry, reservations, transform)
                self.refused('^' + message + '$')

    def test_current_custody_allocation_union_checks_each_native_owner(self):
        # The full legacy54+1 grants remain present; a distinct real native
        # claim cannot be folded into the producer by merely extending its scope.
        worker = self.root / 'different-native-owner'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/different-native-owner', str(worker), self.base)
        item = self.story('b')
        item.update(id='native-other-task', write_paths=['src/other-native/', 'spec/b.md'],
                    conflict_domains=['producer:native-other'])
        plan = copy.deepcopy(self.v1_plan)
        plan.update(run_id='native-other-allocation', epic='other-native', base_sha=self.base,
                    integration_worktree=str(self.repo.resolve()), integration_branch=engine.branch(self.repo), stories=[item])
        engine.validate_plan(self.repo, plan)
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?,?)', (plan['run_id'], plan['epic'], plan['coordinator'],
                       engine.canonical(plan), engine.digest(plan), 'active', None))
            db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
                       (plan['run_id'], item['id'], 'different-native-owner', 1, 'codex/different-native-owner',
                        str(worker), self.base, 0, 'claimed', None, None, None, None))
            row = dict(db.execute('SELECT * FROM claims WHERE run=?', (plan['run_id'],)).fetchone())
        entry = self.custody_fixture()
        reservations = self.union_producer_reservations()
        digest = engine.digest({'kind': 'native-claim', 'claim': row})
        def mixed_owner(a, producer):
            producer['allocation'].insert(0, digest)
            producer['write_paths'] = sorted(set(producer['write_paths']) | set(item['write_paths']))
            producer['conflict_domains'] = sorted(set(producer['conflict_domains']) | set(item['conflict_domains']))
        self.bind_union_custody(entry, reservations, mixed_owner)
        self.refused('^Current writing/queued execution lacks complete live reservation$')


    def test_current_custody_overlapping_full54_grants_keep_generated_scope_and_domains(self):
        entry = self.custody_fixture()
        original = self.union_producer_reservations()[0]
        generated = 'tmp/private/producer-generated-evidence/'
        original['reservation']['write_paths'][0] = generated
        original['reservation']['conflict_domains'] += ['schema:migrations']
        effective = copy.deepcopy(original)
        effective['reservation'].update(epic='actual-producer-effective54',
            reason='Synthetic evidenced effective54 supplement; original54 remains active',
            write_paths=original['reservation']['write_paths'][:1] + original['reservation']['write_paths'][2:] + ['package.json'],
            conflict_domains=['registry:scope-manifest', 'auth:command-enrollment', 'tests:shared-fixtures-resources'])
        effective.update(evidence_ref='approved-effective54', independence_ref='reviewed-full-effective54')
        reservations = [original, effective]
        left, right = (set(row['reservation']['write_paths']) for row in reservations)
        self.assertEqual((len(left), len(right), len(left & right), len(left | right)), (54, 54, 53, 55))
        for transform in [lambda a, p: p['write_paths'].remove(generated),
                          lambda a, p: p['conflict_domains'].remove('auth:command-enrollment')]:
            self.bind_union_custody(entry, reservations, transform)
            self.refused('^Current writing/queued execution lacks complete live reservation$')
        attestation = self.bind_union_custody(entry, reservations)
        producer = next(row for row in attestation['records'] if row['state'] == 'live-reserved')
        self.assertEqual(set(producer['write_paths']), left | right)
        self.assertIn(generated, producer['write_paths'])
        self.assertEqual(set(producer['conflict_domains']), {'producer:original', 'schema:migrations',
            'registry:scope-manifest', 'auth:command-enrollment', 'tests:shared-fixtures-resources'})
        self.assertEqual(len(producer['allocation']), 2)
        self.assertEqual(sum(row['state'] == 'live-reserved' for row in attestation['records']), 1)
        self.assertEqual(self.admit()['generation'], 2)
        with engine.database(self.repo) as db:
            receipt = json.loads(db.execute('SELECT stopped_writers FROM claim_amendments').fetchone()[0])
        self.assertEqual(receipt['ownership_inventory']['reservations'], reservations)
        self.assertEqual(receipt['closed_classifications'][0]['proof']['current_custody']['attestation'], attestation)


    def readonly_state(self):
        with adapter.readonly_database(self.repo) as db:
            return list(db.iterdump())

    def readonly_refused(self, message):
        before = self.readonly_state()
        with self.assertRaisesRegex(adapter.engine.Refusal, message):
            adapter.validate_only(self.args_for_admit())
        self.assertEqual(self.readonly_state(), before)

    def test_validate_only_complete_current_request_all_handles_ro_no_mutation(self):
        entry = self.custody_fixture()
        self.bind_custody(entry)
        args = self.args_for_admit()
        before = self.readonly_state()
        original, connections, statements = sqlite3.connect, [], []
        def observe(*values, **options):
            self.assertTrue(options.get('uri'))
            self.assertTrue(str(values[0]).endswith('?mode=ro'))
            db = original(*values, **options)
            db.set_trace_callback(statements.append)
            connections.append(str(values[0]))
            return db
        argv = [value for name in ['repo', 'run', 'owner', 'story', 'worker', 'generation', 'request']
                for value in ['--' + name, str(getattr(args, name))]] + ['--validate-only']
        output = io.StringIO()
        with (patch.object(adapter.engine, 'database', side_effect=AssertionError('No schema initializer')),
              patch.object(adapter.engine, 'registered_parallel_anchor', side_effect=AssertionError('No default-RW recognizer')),
              patch.object(sqlite3, 'connect', side_effect=observe), contextlib.redirect_stdout(output)):
            exit_code = adapter.main(argv)
        self.assertEqual(exit_code, 0, output.getvalue())
        result = json.loads(output.getvalue())
        self.assertTrue(result['ok'] and result['validated'])
        self.assertFalse(result['admitted'] or result['replayed'])
        self.assertEqual((result['mode'], result['writes']), ('validate-only', 0))
        self.assertEqual(result['request_sha256'], hashlib.sha256(Path(args.request).read_bytes()).hexdigest())
        self.assertEqual(result['reviewed_request_digest'], self.request['admission_review']['request_digest'])
        self.assertGreater(result['captured_artifacts'], 10)
        self.assertNotIn('generation', result)
        self.assertNotIn('assignment', result)
        self.assertGreater(len(connections), 1)  # Includes real pinned schema2 nested recognizers.
        self.assertTrue(all(sql.lstrip().upper().startswith(('SELECT ', 'BEGIN', 'PRAGMA QUERY_ONLY=ON'))
                            for sql in statements), statements)
        self.assertEqual(self.readonly_state(), before)

    def test_validate_only_finalized_schema1_e20_is_supported(self):
        entry = self.finalized_fixture()
        self.bind_closed([entry])
        before = self.readonly_state()
        with (patch.object(adapter.engine, 'database', side_effect=AssertionError('No schema initializer')),
              patch.object(adapter.engine, 'registered_parallel_anchor', side_effect=AssertionError('No default-RW recognizer'))):
            result = adapter.validate_only(self.args_for_admit())
        self.assertTrue(result['validated'])
        self.assertEqual(self.readonly_state(), before)

    def test_validate_only_fresh_schema1_guard_precedes_shared_path_live_admit_preserved(self):
        plan = copy.deepcopy(self.v1_plan)
        plan.update(run_id='actual-other-schema1', base_sha=self.v1_plan['base_sha'])
        for value, message in [(plan, 'does not support nonfinalized schema-1 runs'),
                               ({**plan, 'schema_version': '2'}, 'does not support nonfinalized schema-1 runs'),
                               ([], 'Other plan integrity failure')]:
            with engine.database(self.repo) as db:
                db.execute('INSERT OR REPLACE INTO runs VALUES(?,?,?,?,?,?,?)',
                           (plan['run_id'], plan['epic'], plan['coordinator'], engine.canonical(value), engine.digest(value), 'active', None))
            self.request = self.make_request()
            with (patch.object(adapter, 'validate_request', side_effect=AssertionError('Capability must refuse first')),
                  patch.object(adapter.engine, 'registered_parallel_anchor', side_effect=AssertionError('No default-RW recognizer'))):
                self.readonly_refused(message)
        with engine.database(self.repo) as db:
            db.execute('UPDATE runs SET plan=?,plan_hash=? WHERE run=?',
                       (engine.canonical(plan), engine.digest(plan), plan['run_id']))
        self.request = self.make_request()
        # The new RO-only capability restriction does not affect live admission.
        self.assertEqual(self.admit()['generation'], 2)

    def test_validate_only_uri_connection_rejects_dml_and_ddl(self):
        before = self.readonly_state()
        with adapter.readonly_database(self.repo) as db:
            self.assertEqual(db.execute('PRAGMA query_only').fetchone()[0], 1)
            for sql in ['UPDATE runs SET state=state', 'CREATE TABLE forbidden_fixture_table(value TEXT)']:
                with self.assertRaises(sqlite3.OperationalError):
                    db.execute(sql)
            # URI mode, rather than query_only alone, still forbids writes.
            db.execute('PRAGMA query_only=OFF')
            with self.assertRaises(sqlite3.OperationalError):
                db.execute('UPDATE runs SET state=state')
        self.assertEqual(self.readonly_state(), before)

    def test_validate_only_never_waives_qualification_or_current_window(self):
        entry = self.custody_fixture()
        self.bind_custody(entry)
        self.request['tool_sha256'] = '0'*64
        self.readonly_refused('Reviewed adapter hash mismatch')
        self.bind_custody(entry)
        self.request['tooling_review']['approved'] = False
        self.readonly_refused('review')
        self.bind_custody(entry)
        self.request['qualified_main_sha'] = self.base
        self.readonly_refused('Qualified main changed')
        self.bind_custody(entry, lambda a: a.update(observed_at=a['observed_at']-1000, valid_until=a['observed_at']-1))
        self.readonly_refused('quiet interval')

    def test_validate_only_final_raw_and_window_rechecks_remain_strict(self):
        entry = self.custody_fixture()
        self.bind_custody(entry)
        ref = entry['proof']['current_custody']['evidence_ref']
        original, reads = adapter.source_bytes, 0
        def changed(repo, candidate):
            nonlocal reads
            data = original(repo, candidate)
            if candidate == ref:
                reads += 1
                return data if reads == 1 else data + b' '
            return data
        with patch.object(adapter, 'source_bytes', side_effect=changed):
            self.readonly_refused('Bound evidence changed immediately before CAS')
        self.assertEqual(reads, 2)
        self.bind_custody(entry)
        window, calls = adapter.custody_window, 0
        def expire(a):
            nonlocal calls
            calls += 1
            if calls == 2:
                with patch.object(adapter.time, 'time', return_value=a['valid_until']+1):
                    return window(a)
            return window(a)
        with patch.object(adapter, 'custody_window', side_effect=expire):
            self.readonly_refused('quiet interval')
        self.assertEqual(calls, 2)

    def test_validate_only_success_is_not_cached_admission_or_fresh_replay(self):
        self.assertTrue(adapter.validate_only(self.args_for_admit())['validated'])
        ref = self.request['tooling_ci']
        path = Path(ref['path']); before_bytes = path.read_bytes()
        path.write_bytes(before_bytes + b' ')
        self.refused('Raw source hash mismatch')  # Fresh admission re-reads exact evidence.
        path.write_bytes(before_bytes)
        self.assertEqual(self.admit()['generation'], 2)
        before = self.readonly_state()
        with self.assertRaisesRegex(adapter.engine.Refusal, 'Historical admission replay is not fresh'):
            adapter.validate_only(self.args_for_admit())
        self.assertEqual(self.readonly_state(), before)
        self.assertTrue(self.admit()['replayed'])  # Existing historical replay stays operative.


class NativeAllocationMetadata(unittest.TestCase):
    def test_complete_immutable_e15_blob_is_parsed_and_entirely_collected(self):
        # HEAD's existing tracked Git blob works in shallow CI checkouts too.
        data = subprocess.check_output(['git', '-C', str(ROOT), 'show', 'HEAD:' + adapter.state_path('epic-15')])
        self.assertEqual(len(data), 553474)
        self.assertEqual(hashlib.sha256(data).hexdigest(), 'b3cb9cbfc804b652777d9499a969cc98a3008fc80bec1dd2e523e6dabbfd2e11')
        state = adapter.state_bytes(data)  # Unchanged native reader, COMPLETE input.
        pointers = ['q_checkpoint', 'r_checkpoint', 'reviewed_ten_path_checkpoint']
        for name in pointers:
            self.assertIs(type(state[name]['bookkeeping_paths']), int)
            self.assertEqual(state[name]['bookkeeping_paths'], 3)
        actual = adapter.allocation_arrays(state, e15_main=True)  # ENTIRE parsed state.
        with self.assertRaisesRegex(adapter.engine.Refusal, 'original allocation paths'):
            adapter.allocation_arrays(state)
        # The complete state remains the comparison corpus: remove only the
        # count metadata, then the original strict array traversal must agree.
        arrays_only = copy.deepcopy(state)
        for name in pointers:
            del arrays_only[name]['bookkeeping_paths']
        self.assertEqual(actual, adapter.allocation_arrays(arrays_only))
        self.assertEqual(actual[0], set())  # Native state has domains/counts, not write grants.
        self.assertEqual(actual[1], {'migrations', 'scope/nav registries', 'permission matrix',
                                     'command enrollment', 'shared fixtures', 'sprint-status'})
        self.assertEqual(hashlib.sha256(data).hexdigest(), 'b3cb9cbfc804b652777d9499a969cc98a3008fc80bec1dd2e523e6dabbfd2e11')

    def test_count_context_pointer_types_and_real_arrays_remain_strict(self):
        for name in ['q_checkpoint', 'r_checkpoint', 'reviewed_ten_path_checkpoint']:
            for value in [4, True, False, '3', 3.0, None, {}]:
                with self.subTest(name=name, value=value), self.assertRaisesRegex(adapter.engine.Refusal, 'original allocation paths'):
                    adapter.allocation_arrays({name: {'bookkeeping_paths': value}}, e15_main=True)
            with self.assertRaisesRegex(adapter.engine.Refusal, 'original allocation paths'):
                adapter.allocation_arrays({name: {'bookkeeping_paths': 3}})
            with self.assertRaisesRegex(adapter.engine.Refusal, 'original allocation paths'):
                adapter.allocation_arrays({'nested': {name: {'bookkeeping_paths': 3}}}, e15_main=True)
            paths, domains = adapter.allocation_arrays({name: {'bookkeeping_paths': ['actual/bookkeeping.md'],
                'write_paths': ['actual/full/'], 'shared_domains': ['actual:scope']},
                'allocation': {'paths': ['actual/amendment.ts']}}, e15_main=True)
            self.assertEqual(paths, {'actual/bookkeeping.md', 'actual/full/', 'actual/amendment.ts'})
            self.assertEqual(domains, {'actual:scope'})
        for value in [{'write_paths': 3}, {'allocation': {'paths': 3}}, {'other': {'bookkeeping_paths': 3}},
                      {'production_write_paths': ['valid.ts', 3]}, {'test_write_paths': 'valid.ts'},
                      {'conflict_domains': 3}, {'shared_domains': [False]}]:
            with self.subTest(value=value), self.assertRaises(adapter.engine.Refusal):
                adapter.allocation_arrays(value, e15_main=True)


if __name__ == '__main__':
    unittest.main()
