"""Disposable Git/SQLite admission contracts; no live claims or provider calls."""
import base64
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
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
        self.patches = [patch.object(adapter, 'ROOT', self.c), patch.object(adapter, '__file__', str(self.c / 'scripts/maintenance/admit_story35_6_runtime.py'))]
        for item_patch in self.patches:
            item_patch.start()
            self.addCleanup(item_patch.stop)
        self.request = self.make_request()

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


if __name__ == '__main__':
    unittest.main()
