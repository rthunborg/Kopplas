"""Behavioral synthetic Git pilot. No live repository, services or worker launch."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1]/'parallel_run.py'
spec = importlib.util.spec_from_file_location('parallel_run',SCRIPT)
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)

class PathTokens(unittest.TestCase):
    def test_nextjs_route_paths_are_literal_exact_tokens(self):
        for token in ['src/app/(app)/customers/[customerId]/page.tsx',
                      'src/app/(app)/calculations/[calculationId]/page.tsx',
                      'src/app/(app)/jobs/[jobId]/page.tsx',
                      'src/app/docs/[...slug]/page.tsx']:
            with self.subTest(token=token):
                self.assertEqual(engine.path_token(token),token)
                self.assertTrue(engine.covers(token,token))
                self.assertFalse(engine.covers(token,token.replace('[','').replace(']','')))
                self.assertFalse(engine.overlap(token,token.replace('[','').replace(']','')))
        token='src/[ab]/page.tsx'
        self.assertFalse(engine.covers(token,'src/a/page.tsx'))
        self.assertFalse(engine.overlap(token,'src/b/page.tsx'))
        self.assertTrue(engine.overlap('src/[ab]/',token))

    def test_unsafe_and_noncanonical_tokens_remain_rejected(self):
        for token in ['', '/src/[id]/page.tsx', 'C:/src/[id]/page.tsx',
                      '../src/[id]/page.tsx', 'src/[id]/../page.tsx',
                      'src/./[id]/page.tsx', 'src//[id]/page.tsx',
                      'src\\[id]\\page.tsx', '.git/[id]',
                      'src/[id]/*.tsx', 'src/[id]/page?.tsx',
                      'src/[id]/page.tsx\n', 'src/[id]/page.tsx\r',
                      'src/[id]/page.tsx\x00']:
            with self.subTest(token=token),self.assertRaises(engine.Refusal):
                engine.path_token(token)

class PilotFixture:
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='parallel-bmad-')
        self.root=Path(self.temp.name)
        self.repo=self.root/'integration'; self.repo.mkdir()
        self.git(self.repo,'init','-b','codex/integration')
        self.git(self.repo,'config','user.name','Synthetic Pilot')
        self.git(self.repo,'config','user.email','pilot@example.invalid')
        self.git(self.repo,'config','core.autocrlf','false')
        self.write(self.repo,'spec/a.md','Approved A\n')
        self.write(self.repo,'spec/b.md','Approved B\n')
        self.write(self.repo,'.agents/skills/auto-bmad/SKILL.md','Synthetic frozen workflow\n')
        self.commit(self.repo,'approved fixture')
        self.base=engine.sha(self.repo,'HEAD')
        self.a=self.root/'a'; self.b=self.root/'b'; self.c=self.root/'c'
        for path,name in [(self.a,'a'),(self.b,'b'),(self.c,'c')]:
            self.git(self.repo,'worktree','add','-b','codex/worker-'+name,str(path),self.base)
        self.plan={'schema_version':1,'story_source':'sprint','run_id':'pilot','epic':'99','coordinator':'coordinator-session','integration_branch':'codex/integration','integration_worktree':str(self.repo),'base_sha':self.base,'workflow_version':engine.workflow_version(self.repo),'max_workers':2,'stories':[self.story('a'),self.story('b')],'integrated_prerequisites':[],'legacy_reservations':[],'shared_paths':[],'final_required_checks':['epic-gates','retrospective','deferred-reconciliation','completion-report']}
        self.planfile=self.root/'plan.json'; self.save_plan()

    def tearDown(self):
        # Only tempfile-owned synthetic repositories are removed by TemporaryDirectory.
        self.temp.cleanup()

    def git(self,repo,*args):
        proc=subprocess.run(['git','-C',str(repo),*args],capture_output=True,text=True,timeout=30)
        self.assertEqual(proc.returncode,0,proc.stderr)
        return proc.stdout.strip()

    def write(self,repo,path,data):
        target=repo/path; target.parent.mkdir(parents=True,exist_ok=True); target.write_text(data,encoding='utf-8')

    def commit(self,repo,message):
        self.git(repo,'add','--all'); self.git(repo,'commit','-m',message)
        return engine.sha(repo,'HEAD')

    def story(self,id):
        return {'id':id,'approved':True,'spec_path':'spec/'+id+'.md','spec_revision':hashlib.sha256(('Approved '+id.upper()+'\n').encode()).hexdigest(),'prerequisites':[],'write_paths':['src/'+id+'/','spec/'+id+'.md'],'conflict_domains':[],'contracts':['contract-'+id],'requires_contracts':[],'risk_domains':['ordinary'],'required_checks':['unit']}

    def save_plan(self): self.planfile.write_text(json.dumps(self.plan),encoding='utf-8')

    def args(self,command,**kwargs):
        argv=['--repo',str(self.repo),command]
        if command not in {'plan','version'}: argv+=['--owner',kwargs.pop('owner','coordinator-session')]
        if command not in {'plan','version','init'}: argv+=['--run',kwargs.pop('run','pilot')]
        if command in {'plan','init'}: argv+=['--plan',str(kwargs.pop('plan',self.planfile))]
        for key,value in kwargs.items(): argv+=['--'+key.replace('_','-'),str(value)]
        return argv

    def call(self,command,**kwargs): return engine.execute(engine.parser().parse_args(self.args(command,**kwargs)))

    def init(self): self.save_plan(); return self.call('init')

    def claim(self,id,path=None,worker=None):
        return self.call('claim',story=id,worker=worker or 'worker-'+id,branch='codex/worker-'+(path.name if path else id),worktree=path or getattr(self,id))

    def check(self,commit,name='unit'):
        return {'name':name,'argv':['python','-m','unittest'],'result':'passed','executed':3,'skipped':0,'commit':commit}

    def review(self,commit,effort='low'):
        return {'approved':True,'reviewer':'independent-reviewer','commit':commit,'model':'gpt-6.1-sol','effort':effort,'unresolved':[]}

    def evidence(self,id,extra=None):
        path=getattr(self,id); self.write(path,'src/'+id+'/result.txt',id+' complete\n')
        if extra: self.write(path,extra,'unauthorized\n')
        result=self.commit(path,'worker '+id)
        return {'schema_version':1,'run_id':'pilot','story_id':id,'worker':'worker-'+id,'generation':1,'base_sha':self.base,'result_sha':result,'workflow_version':self.plan['workflow_version'],'spec_revision':self.story(id)['spec_revision'],'changed_paths':engine.changed(self.repo,self.base,result),'checks':[self.check(result)],'review':self.review(result),'routes':[{'phase':'build','model':'gpt-6.1-sol','effort':'low','risk_domains':['ordinary'],'reason':'Ordinary fixture change'}]}

    def file(self,name,data):
        path=self.root/(name+'.json'); path.write_text(json.dumps(data),encoding='utf-8'); return path

    def submit(self,id,e): return self.call('submit',story=id,worker='worker-'+id,evidence=self.file('evidence-'+id,e))

    def merge(self,id): return self.call('integrate',story=id,expected_head=engine.sha(self.repo,'HEAD'))

    def combined(self,head,final=False):
        names=['unit']+(self.plan['final_required_checks'] if final else [])
        return {'schema_version':1,'run_id':'pilot','integration_sha':head,'checks':[self.check(head,x) for x in names],'review':self.review(head),'unresolved':[]}

    def verify(self,id):
        head=engine.sha(self.repo,'HEAD'); return self.call('verify',story=id,evidence=self.file('combined-'+id,self.combined(head)))

class Pilot(PilotFixture,unittest.TestCase):
    def test_plan_read_only_ready_pair_and_version(self):
        before=self.git(self.repo,'status','--porcelain')
        result=self.call('plan')
        self.assertEqual(result['ready_pairs'],[['a','b']])
        self.assertFalse((engine.common(self.repo)/'auto-bmad-parallel.sqlite3').exists())
        self.assertEqual(before,self.git(self.repo,'status','--porcelain'))
        self.assertEqual(self.call('version')['workflow_version'],self.plan['workflow_version'])

    def test_two_workers_pilot_block_and_serial_verification(self):
        started=time.monotonic(); self.init(); aa=self.claim('a'); bb=self.claim('b')
        self.assertEqual(aa['base_sha'],bb['base_sha'])
        self.call('block',story='a',worker='worker-a',reason='Waiting for resource')
        eb=self.evidence('b'); self.submit('b',eb)
        merged_b=self.merge('b'); self.assertEqual(merged_b['state'],'awaiting-verification')
        status=self.call('status'); self.assertEqual({x['story']['id']:x['state'] for x in status['claims']},{'a':'blocked','b':'awaiting-verification'})
        with self.assertRaisesRegex(engine.Refusal,'unintegrated'): self.call('finalize',evidence=self.file('premature',self.combined(merged_b['integration_sha'],True)))
        self.verify('b'); ea=self.evidence('a'); self.submit('a',ea); self.merge('a'); self.verify('a')
        head=engine.sha(self.repo,'HEAD'); final=self.call('finalize',evidence=self.file('final',self.combined(head,True)))
        self.assertEqual(final['state'],'finalized')
        self.assertTrue(engine.ancestor(self.repo,ea['result_sha'],head)); self.assertTrue(engine.ancestor(self.repo,eb['result_sha'],head))
        with self.assertRaisesRegex(engine.Refusal,'already finalized'): self.call('finalize',evidence=self.file('repeat',self.combined(head,True)))
        self.assertLess(time.monotonic()-started,120)

    def test_real_concurrent_claims_one_winner_shared_worktrees(self):
        self.init()
        # Distinct processes contend on the actual common-dir SQLite store.
        commands=[self.args('claim',story='a',worker='one',branch='codex/worker-a',worktree=self.a),self.args('claim',story='a',worker='two',branch='codex/worker-c',worktree=self.c)]
        processes=[subprocess.Popen([sys.executable,str(SCRIPT),*cmd],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True) for cmd in commands]
        outputs=[p.communicate(timeout=60) for p in processes]
        self.assertEqual(sorted(p.returncode for p in processes),[0,1],outputs)
        self.assertEqual(len(self.call('status')['claims']),1)
        a=engine.parser().parse_args(self.args('status')); a.repo=str(self.b)
        self.assertEqual(len(engine.execute(a)['claims']),1)

    def test_crash_after_git_commit_before_state_update_recovers_once(self):
        self.init(); self.claim('a'); self.submit('a',self.evidence('a'))
        with patch.object(engine,'integration_checkpoint',side_effect=RuntimeError('synthetic process death')):
            with self.assertRaises(RuntimeError): self.merge('a')
        head=engine.sha(self.repo,'HEAD')
        self.assertEqual(self.call('status')['claims'][0]['state'],'integrating')
        recovered=self.merge('a'); self.assertTrue(recovered['recovered']); self.assertEqual(recovered['integration_sha'],head)
        self.assertEqual(self.merge('a')['integration_sha'],head)
        self.verify('a'); self.assertEqual(self.call('status')['claims'][0]['state'],'integrated')

    def test_dependencies_require_verified_ancestor_and_contract(self):
        self.plan['stories'][1]['prerequisites']=['a']; self.plan['stories'][1]['requires_contracts']=[{'story':'a','contract':'contract-a'}]
        self.init(); self.assertEqual(self.call('status')['admission']['ready'],['a'])
        self.claim('a'); self.submit('a',self.evidence('a')); self.merge('a')
        with self.assertRaisesRegex(engine.Refusal,'not ready'): self.claim('b')
        self.verify('a')
        self.assertEqual(self.call('status')['admission']['ready'],['b'])
        with self.assertRaisesRegex(engine.Refusal,'exact current'): self.claim('b')
        self.git(self.b,'merge','--ff-only',engine.sha(self.repo,'HEAD'))
        self.assertEqual(self.claim('b')['base_sha'],engine.sha(self.repo,'HEAD'))

    def test_cycles_unknown_prerequisites_and_contract_fail_closed(self):
        for mode in ['cycle','unknown','contract']:
            p=copy.deepcopy(self.plan)
            p['stories'][1]['prerequisites']=['a']
            if mode=='cycle': p['stories'][0]['prerequisites']=['b']
            if mode=='unknown': p['stories'][1]['prerequisites']=['missing']
            if mode=='contract': p['stories'][1]['requires_contracts']=[{'story':'a','contract':'missing'}]
            with self.subTest(mode=mode), self.assertRaises(engine.Refusal): engine.validate_plan(self.repo,p)

    def test_external_prerequisite_must_be_ancestor(self):
        self.write(self.c,'external.txt','prerequisite\n'); external=self.commit(self.c,'external')
        self.plan['stories'][0]['prerequisites']=['external']; self.plan['integrated_prerequisites']=[{'id':'external','commit':external,'checks_passed':True,'contracts':[]}]
        self.save_plan(); self.assertNotIn('a',self.call('plan')['ready'])
        self.assertEqual(self.call('plan')['ready'],['b'])

    def test_path_and_semantic_conflicts_not_independent(self):
        for field,value in [('write_paths',['src/a/']),('conflict_domains',['schema:booking'])]:
            with self.subTest(field=field):
                p=copy.deepcopy(self.plan)
                p['stories'][1][field]=value
                if field=='conflict_domains': p['stories'][0][field]=value
                self.assertFalse(engine.report(self.repo,engine.validate_plan(self.repo,p))['ready_pairs'])
        self.plan['stories'][0]['conflict_domains']=['rpc:shared']; self.plan['stories'][1]['conflict_domains']=['rpc:shared']
        self.init(); self.claim('a')
        with self.assertRaisesRegex(engine.Refusal,'semantic conflict'): self.claim('b')

    def test_invalid_evidence_cannot_land(self):
        self.init(); self.claim('a'); e=self.evidence('a')
        mutations=[('generation',2),('changed_paths',[]),('result_sha',self.base),('workflow_version','stale'),('spec_revision','0'*64)]
        for field,value in mutations:
            bad=copy.deepcopy(e); bad[field]=value
            with self.subTest(field=field),self.assertRaises(engine.Refusal): self.submit('a',bad)
        for skip in [1,-1]:
            bad=copy.deepcopy(e); bad['checks'][0]['skipped']=skip
            with self.assertRaises(engine.Refusal): self.submit('a',bad)
        bad=copy.deepcopy(e); bad['review']['reviewer']='worker-a'
        with self.assertRaises(engine.Refusal): self.submit('a',bad)
        self.assertEqual(self.call('status')['claims'][0]['state'],'claimed')

    def test_sensitive_model_effort_policy(self):
        self.plan['stories'][0]['risk_domains']=['rls']; self.init(); self.assertEqual(self.claim('a')['required_effort'],'high')
        e=self.evidence('a')
        with self.assertRaisesRegex(engine.Refusal,'high effort'): self.submit('a',e)
        e['review']['effort']='high'; e['routes'][0]['risk_domains']=['rls']
        with self.assertRaisesRegex(engine.Refusal,'high effort'): self.submit('a',e)
        e['routes'][0]['effort']='high'; self.submit('a',e)

    def test_out_of_scope_and_aggregate_changes_rejected(self):
        self.init(); self.claim('a')
        e=self.evidence('a',extra='_bmad-output/implementation-artifacts/sprint-status.yaml')
        with self.assertRaisesRegex(engine.Refusal,'outside assigned'): self.submit('a',e)
        for path in ['_bmad-output/implementation-artifacts/deferred-work.md','_bmad-output/auto-bmad/state/epic/epic-99.yaml','.agents/skills/auto-bmad/SKILL.md']:
            p=copy.deepcopy(self.plan); p['stories'][0]['write_paths'].append(path)
            with self.assertRaisesRegex(engine.Refusal,'aggregate/shared'): engine.validate_plan(self.repo,p)

    def test_literal_route_ownership_admits_only_declared_file(self):
        route='src/app/(app)/customers/[customerId]/page.tsx'
        self.plan['stories'][0]['write_paths'].append(route)
        self.init(); self.claim('a')
        self.write(self.a,route,'Authorized route\n')
        e=self.evidence('a')
        self.submit('a',e)
        unauthorized=route.replace('[customerId]','customerId')
        self.assertFalse(any(engine.covers(x,unauthorized) for x in self.plan['stories'][0]['write_paths']))

    def test_literal_route_ownership_rejects_glob_like_sibling(self):
        self.plan['stories'][0]['write_paths'].append('src/[cd]/page.tsx')
        self.init(); self.claim('a')
        e=self.evidence('a',extra='src/c/page.tsx')
        with self.assertRaisesRegex(engine.Refusal,'outside assigned'): self.submit('a',e)

    def test_dirty_worktrees_and_wrong_owner_fail(self):
        self.init()
        with self.assertRaisesRegex(engine.Refusal,'coordinator owner'): self.call('status',owner='impostor')
        self.write(self.a,'dirty.txt','dirty')
        with self.assertRaisesRegex(engine.Refusal,'clean'): self.claim('a')
        (self.a/'dirty.txt').unlink(); self.claim('a')
        self.write(self.a,'dirty.txt','dirty')
        with self.assertRaisesRegex(engine.Refusal,'clean'): engine.clean(self.a)

    def test_scoped_coordinator_repair_and_reverification(self):
        self.init(); self.claim('a'); self.submit('a',self.evidence('a')); original=self.merge('a')['integration_sha']
        self.write(self.repo,'src/a/repair.txt','Targeted reviewed repair\n'); head=self.commit(self.repo,'repair combined check')
        e=self.combined(head)
        with self.assertRaisesRegex(engine.Refusal,'HEAD changed'): self.call('verify',story='a',evidence=self.file('repair-verify',e))
        result=self.call('repair',story='a',expected_head=original,evidence=self.file('repair',e))
        self.assertEqual(result['integration_sha'],head); self.verify('a')
        self.assertEqual(self.call('status')['claims'][0]['state'],'integrated')

    def test_coordinator_repair_rejects_unassigned_paths(self):
        self.init(); self.claim('a'); self.submit('a',self.evidence('a')); original=self.merge('a')['integration_sha']
        self.write(self.repo,'src/b/unassigned.txt','unassigned\n'); head=self.commit(self.repo,'unassigned repair')
        with self.assertRaisesRegex(engine.Refusal,'outside assigned'):
            self.call('repair',story='a',expected_head=original,evidence=self.file('bad-repair',self.combined(head)))

    def test_recovered_two_parent_merge_rejects_extra_paths(self):
        self.init(); self.claim('a'); e=self.evidence('a'); self.submit('a',e)
        with patch.object(engine,'integration_checkpoint',side_effect=RuntimeError('synthetic death')):
            with self.assertRaises(RuntimeError): self.merge('a')
        # Amend only this temporary synthetic merge to emulate unsafe manual resolution.
        self.write(self.repo,'src/b/unassigned.txt','unassigned\n'); self.git(self.repo,'add','--all'); self.git(self.repo,'commit','--amend','--no-edit')
        with self.assertRaisesRegex(engine.Refusal,'outside assigned'): self.merge('a')
        self.assertEqual(self.call('status')['claims'][0]['state'],'integrating')

    def test_worker_coordinator_cross_run_ownership(self):
        self.init(); self.claim('a')
        p=copy.deepcopy(self.plan); p.update(run_id='other',epic='100',coordinator='other-owner',integration_branch='codex/worker-a',integration_worktree=str(self.a))
        with self.assertRaisesRegex(engine.Refusal,'owned by worker'):
            self.call('init',plan=self.file('worker-coordinator',p),owner='other-owner')
        p.update(integration_branch='codex/worker-c',integration_worktree=str(self.c))
        self.call('init',plan=self.file('other-run',p),owner='other-owner')
        with self.assertRaisesRegex(engine.Refusal,'coordinator'):
            self.call('claim',story='b',worker='worker-b',branch='codex/worker-c',worktree=self.c)

    def test_spoofed_parallel_marker_does_not_hide_legacy_owner(self):
        self.write(self.c,'_bmad-output/auto-bmad/state/epic/epic-99.yaml','status: running\nepic_num: 99\nparallel_run_id: pilot\n')
        self.assertFalse(self.call('plan')['ready'])
        self.init(); self.assertFalse(self.call('status')['admission']['ready'])

    def test_coordinator_anchor_inherited_by_clean_worker_is_not_legacy_owner(self):
        self.init()
        self.write(self.repo,'_bmad-output/auto-bmad/state/epic/epic-99.yaml','status: running\nepic_num: 99\nparallel_run_id: pilot\n')
        head=self.commit(self.repo,'coordinator anchor')
        self.git(self.a,'merge','--ff-only',head)
        result=self.claim('a'); self.assertEqual(result['base_sha'],head)
        self.call('heartbeat',story='a',worker='worker-a')
        self.assertEqual(self.call('status')['claims'][0]['state'],'running')

    def test_state_bearing_worker_results_do_not_block_sibling_integration(self):
        for s in self.plan['stories']:
            s['write_paths'].append('_bmad-output/auto-bmad/state/'+s['id']+'.yaml')
        self.init(); self.claim('a'); self.claim('b')
        evidence={}
        for id in ['a','b']:
            self.write(getattr(self,id),'_bmad-output/auto-bmad/state/'+id+'.yaml','status: review\nepic_num: 99\nstory_id: '+id+'\nparallel_run_id: pilot\n')
            evidence[id]=self.evidence(id); self.submit(id,evidence[id])
        self.merge('a'); self.verify('a')
        self.assertFalse(self.call('status')['admission']['legacy_conflicts'])
        self.merge('b'); self.verify('b')
        head=engine.sha(self.repo,'HEAD')
        self.assertEqual(self.call('finalize',evidence=self.file('state-final',self.combined(head,True)))['state'],'finalized')

    def test_required_database_check_needs_required_environment(self):
        self.init(); self.claim('a'); e=self.evidence('a'); e['checks'].append(self.check(e['result_sha'],'integration'))
        with self.assertRaisesRegex(engine.Refusal,'SUPABASE_TEST_REQUIRED'): self.submit('a',e)
        e['checks'][-1]['environment']={'SUPABASE_TEST_REQUIRED':'1'}; self.submit('a',e)

    def test_stale_heartbeat_does_not_steal_and_capacity(self):
        self.init(); self.claim('a'); self.claim('b')
        with engine.database(self.repo) as db: db.execute('UPDATE claims SET heartbeat=0 WHERE story=?',('a',))
        self.assertTrue(self.call('status')['claims'][0]['stale'])
        with self.assertRaisesRegex(engine.Refusal,'not ready'): self.claim('a',self.c,'replacement')
        with self.assertRaisesRegex(engine.Refusal,'generation'): self.call('heartbeat',story='a',worker='worker-a',generation=2)
        self.call('block',story='a',worker='worker-a',reason='Still owned')
        self.assertEqual(len(self.call('status')['claims']),2)

    def test_duplicate_coordinator_and_worktree_admission(self):
        self.init()
        p=copy.deepcopy(self.plan); p['run_id']='another'; p['coordinator']='another-owner'
        with self.assertRaisesRegex(engine.Refusal,'already owned'): self.call('init',plan=self.file('another',p),owner='another-owner')
        with self.assertRaisesRegex(engine.Refusal,'coordinator'): self.call('claim',story='a',worker='worker-a',branch='codex/integration',worktree=self.repo)

    def test_combined_checks_exact_merge_sha_and_previous_verification(self):
        self.init(); self.claim('a'); self.claim('b'); ea=self.evidence('a'); self.submit('a',ea); self.submit('b',self.evidence('b')); self.merge('a')
        with self.assertRaisesRegex(engine.Refusal,'previous integration'): self.merge('b')
        with self.assertRaisesRegex(engine.Refusal,'mismatch'): self.call('verify',story='a',evidence=self.file('stale-combined',self.combined(ea['result_sha'])))
        self.verify('a'); self.merge('b'); self.verify('b')

    def test_legacy_anchor_and_manual_maintenance_reservation(self):
        self.write(self.c,'_bmad-output/auto-bmad/state/epic/epic-99.yaml','status: running\nepic_num: 99\nactive_story: a\n')
        self.assertFalse(self.call('plan')['ready'])
        self.init()
        with self.assertRaisesRegex(engine.Refusal,'not ready'): self.claim('a')
        anchor=self.c/'_bmad-output/auto-bmad/state/epic/epic-99.yaml'; anchor.unlink()
        p=copy.deepcopy(self.plan); p['legacy_reservations']=[{'epic':'13','stories':[],'reason':'Maintenance current session','worktree':str(self.c),'write_paths':['src/a/'],'conflict_domains':[]}]
        result=self.call('plan',plan=self.file('reserved',p)); self.assertEqual(result['ready'],['b'])

    def test_workflow_upgrade_rejected(self):
        self.init(); self.claim('a')
        self.write(self.a,'.agents/skills/auto-bmad/SKILL.md','Changed workflow\n')
        with self.assertRaisesRegex(engine.Refusal,'workflow changed'): self.call('heartbeat',story='a',worker='worker-a')

    def test_migration_reservations_and_unsupported_mode(self):
        p=copy.deepcopy(self.plan); p['stories'][0]['write_paths'].append('supabase/migrations/')
        with self.assertRaisesRegex(engine.Refusal,'schema:migrations'): engine.validate_plan(self.repo,p)
        p['stories'][0]['conflict_domains']=['schema:migrations']; engine.validate_plan(self.repo,p)
        p['story_source']='stories'
        with self.assertRaisesRegex(engine.Refusal,'Only explicit sprint'): engine.validate_plan(self.repo,p)

    def test_evidence_argv_is_data_never_executed(self):
        self.init(); self.claim('a'); e=self.evidence('a'); target=self.root/'must-not-exist'
        e['checks'][0]['argv']=[sys.executable,'-c','open('+repr(str(target))+', "w").write("bad")']
        self.submit('a',e); self.assertFalse(target.exists())

    def test_json_duplicate_keys_rejected(self):
        path=self.root/'duplicate.json'; path.write_text('{"schema_version":1,"schema_version":2}',encoding='utf-8')
        with self.assertRaisesRegex(engine.Refusal,'Duplicate JSON'): engine.read_json(path)

    def test_custom_bmad_output_configuration_refused(self):
        self.write(self.repo,'_bmad/bmm/config.yaml','output_folder: "{project-root}/custom-output"\n')
        with self.assertRaisesRegex(engine.Refusal,'Custom output_folder'): self.call('plan')
        self.write(self.repo,'_bmad/bmm/config.yaml','output_folder: "{project-root}/_bmad-output"\nimplementation_artifacts: custom-impl\n')
        with self.assertRaisesRegex(engine.Refusal,'Custom implementation_artifacts'): self.call('plan')

    def test_mirrored_engine_and_test(self):
        root=SCRIPT.parents[4]
        mirror=root/'.claude/skills/auto-bmad/scripts/parallel_run.py'
        self.assertEqual(SCRIPT.read_bytes(),mirror.read_bytes())
        mirror_test=mirror.parent/'tests/test_parallel_run.py'
        self.assertEqual(Path(__file__).read_bytes(),mirror_test.read_bytes())

class Amendments(PilotFixture,unittest.TestCase):
    def prepare(self,submit_first=False):
        self.init(); self.claim('a')
        self.old_evidence=self.evidence('a')
        if submit_first: self.submit('a',self.old_evidence)
        self.call('block',story='a',worker='worker-a',reason='Necessary exact paths not declared')
        self.checkpoint=self.old_evidence['result_sha']
        return self.request()

    def request(self):
        receipt={'schema_version':1,'run_id':'pilot','story_id':'a','worker':'worker-a','generation':1,'branch':'codex/worker-a','worktree':str(self.a),'checkpoint_sha':self.checkpoint,'writers':[{'identity':'worker-a','role':'worker','state':'stopped','evidence_ref':'synthetic-chat/completed-worker-checkpoint'},{'identity':'author-a','role':'author','state':'stopped','evidence_ref':'synthetic-agent/completed-author'}]}
        receipt_path=self.file('stopped-writers',receipt)
        return {'schema_version':1,'request_id':'amendment-one','run_id':'pilot','story_id':'a','owner':'coordinator-session','worker':'worker-a','expected_generation':1,'expected_plan_hash':engine.digest(self.plan),'expected_integration_sha':engine.sha(self.repo,'HEAD'),'checkpoint_sha':self.checkpoint,'add_write_paths':['src/shared/required.txt'],'add_conflict_domains':['contract:shared-required'],'reason':'Missing path required by frozen approved fixture scope','scope_approval_ref':'synthetic-independent-scope-assessment','recovery_tool_sha256':engine.recovery_tool_sha256(),'quiescence':{'coordinator':'coordinator-session','attested':True,'complete_writer_inventory':True,'evidence_path':str(receipt_path.resolve()),'evidence_sha256':hashlib.sha256(receipt_path.read_bytes()).hexdigest()}}

    def amend(self,request,**overrides):
        options={'story':'a','worker':'worker-a','generation':1,'request':self.file('amendment-request',request)}
        options.update(overrides)
        return self.call('amend-blocked',**options)

    def store(self):
        with engine.database(self.repo) as db:
            return {table:[dict(row) for row in db.execute('SELECT * FROM '+table)] for table in ['runs','claims','journal','verifications','claim_amendments']}

    def test_additive_amendment_preserves_pins_original_artifact_and_audit(self):
        r=self.prepare(submit_first=True); before=self.store(); artifact=self.planfile.read_bytes()
        aa=self.amend(r); after=self.store()
        self.assertEqual(aa['generation'],2); self.assertEqual(aa['state'],'claimed')
        self.assertEqual(aa['workflow_version'],self.plan['workflow_version']); self.assertEqual(aa['base_sha'],self.checkpoint)
        self.assertEqual(aa['previous_base_sha'],self.base)
        expected=copy.deepcopy(self.plan)
        expected['stories'][0]['write_paths']+=r['add_write_paths']; expected['stories'][0]['conflict_domains']+=r['add_conflict_domains']
        self.assertEqual(json.loads(after['runs'][0]['plan']),expected)
        self.assertEqual(self.planfile.read_bytes(),artifact)
        self.assertEqual(json.loads(after['claim_amendments'][0]['before_plan']),self.plan)
        self.assertEqual(json.loads(after['claim_amendments'][0]['before_claim']),before['claims'][0])
        for field in ['worker','branch','worktree','integration_sha']:
            self.assertEqual(after['claims'][0][field],before['claims'][0][field])
        self.assertIsNone(after['claims'][0]['evidence']); self.assertIsNone(after['claims'][0]['result_sha'])
        self.assertEqual(after['claims'][0]['base_sha'],self.checkpoint)
        for repo in [self.repo,self.a]:
            self.assertEqual(engine.workflow_version(repo),self.plan['workflow_version'])
            engine.clean(repo)
        self.assertEqual(engine.sha(self.a,'HEAD'),self.checkpoint)
        self.assertEqual(after['journal'],before['journal']); self.assertEqual(after['verifications'],before['verifications'])

    def test_old_generation_cannot_heartbeat_block_or_submit(self):
        r=self.prepare(); self.amend(r)
        for command,extra in [('heartbeat',{}),('block',{'reason':'obsolete writer'}),('submit',{'evidence':self.file('old-evidence',self.old_evidence)})]:
            with self.subTest(command=command),self.assertRaisesRegex(engine.Refusal,'Stale generation'):
                self.call(command,story='a',worker='worker-a',generation=1,**extra)
        self.assertEqual(self.call('heartbeat',story='a',worker='worker-a',generation=2)['generation'],2)

    def test_exact_retry_is_idempotent_and_changed_payload_is_refused(self):
        r=self.prepare(); aa=self.amend(r); before=self.store()
        retried=self.amend(r)
        self.assertTrue(retried['replayed']); self.assertEqual(retried['generation'],aa['generation']); self.assertEqual(self.store(),before)
        r['reason']='Changed logical request'
        with self.assertRaisesRegex(engine.Refusal,'different inputs'): self.amend(r)
        self.assertEqual(self.store(),before)

    def test_transactional_failure_rolls_back_plan_claim_and_audit(self):
        r=self.prepare(); before=self.store()
        with patch.object(engine,'amendment_checkpoint',side_effect=RuntimeError('synthetic interrupted transaction')):
            with self.assertRaisesRegex(RuntimeError,'synthetic'): self.amend(r)
        self.assertEqual(self.store(),before)
        self.assertEqual(self.amend(r)['generation'],2)

    def test_nonblocked_claim_and_identity_generation_hash_heads_fail_closed(self):
        r=self.prepare(); before=self.store()
        changes=[('owner','impostor'),('worker','impostor'),('expected_generation',2),('expected_plan_hash','0'*64),('expected_integration_sha',self.checkpoint),('checkpoint_sha',self.base),('recovery_tool_sha256','0'*64)]
        for field,value in changes:
            bad=copy.deepcopy(r); bad[field]=value
            with self.subTest(field=field),self.assertRaises(engine.Refusal): self.amend(bad)
            self.assertEqual(self.store(),before)
        with engine.database(self.repo) as db: db.execute("UPDATE claims SET state='running' WHERE story='a'")
        with self.assertRaisesRegex(engine.Refusal,'deliberately blocked'): self.amend(r)

    def test_additions_cannot_widen_prefixes_aggregate_or_existing_ownership(self):
        r=self.prepare(); before=self.store()
        for additions in [[],['src/shared/'],['src/sharedepic-'],['src/shared/*.txt'],['../outside'],['src/a/already-owned.txt'],['_bmad-output/implementation-artifacts/sprint-status.yaml'],['.agents/skills/auto-bmad/SKILL.md'],['src/shared/Required.txt','src/shared/required.txt']]:
            bad=copy.deepcopy(r); bad['add_write_paths']=additions
            with self.subTest(additions=additions),self.assertRaises(engine.Refusal): self.amend(bad)
            self.assertEqual(self.store(),before)
        bad=copy.deepcopy(r); bad['required_checks']=[]
        with self.assertRaisesRegex(engine.Refusal,'Unknown fields'): self.amend(bad)

    def test_dirty_checkpoint_and_undeclared_committed_changes_fail(self):
        r=self.prepare(); before=self.store()
        for repo in [self.repo,self.a]:
            self.write(repo,'dirty.txt','still writing')
            with self.assertRaisesRegex(engine.Refusal,'clean'): self.amend(r)
            (repo/'dirty.txt').unlink()
            self.assertEqual(self.store(),before)
        self.write(self.a,'src/shared/required.txt','Not admitted yet')
        self.checkpoint=self.commit(self.a,'premature out-of-scope modification'); r=self.request()
        with self.assertRaisesRegex(engine.Refusal,'outside assigned'): self.amend(r)
        self.assertEqual(self.store(),before)

    def test_structured_stopped_writer_receipt_and_attestation_are_required(self):
        r=self.prepare(); before=self.store()
        for field,value in [('attested',False),('complete_writer_inventory',False),('coordinator','wrong'),('evidence_sha256','0'*64),('evidence_path','relative.json')]:
            bad=copy.deepcopy(r); bad['quiescence'][field]=value
            with self.subTest(field=field),self.assertRaises(engine.Refusal): self.amend(bad)
            self.assertEqual(self.store(),before)
        e=engine.read_json(r['quiescence']['evidence_path'])
        for mutation in ['writing','missing-worker','wrong-head','no-reference']:
            bad=copy.deepcopy(e)
            if mutation=='writing': bad['writers'][1]['state']='running'
            if mutation=='missing-worker': bad['writers']=bad['writers'][1:]
            if mutation=='wrong-head': bad['checkpoint_sha']=self.base
            if mutation=='no-reference': bad['writers'][1]['evidence_ref']=''
            path=self.file('bad-receipt',bad); bad_r=copy.deepcopy(r)
            bad_r['quiescence'].update(evidence_path=str(path.resolve()),evidence_sha256=hashlib.sha256(path.read_bytes()).hexdigest())
            with self.subTest(mutation=mutation),self.assertRaises(engine.Refusal): self.amend(bad_r)
            self.assertEqual(self.store(),before)

    def test_repository_claim_path_and_semantic_conflicts_are_refused(self):
        r=self.prepare(); self.claim('b'); before=self.store()
        bad=copy.deepcopy(r); bad['add_write_paths']=['src/b/required.txt']
        with self.assertRaisesRegex(engine.Refusal,'repository claim'): self.amend(bad)
        self.assertEqual(self.store(),before)
        with engine.database(self.repo) as db:
            p=json.loads(db.execute('SELECT plan FROM runs').fetchone()[0]); p['stories'][1]['conflict_domains']=['contract:shared-required']
            db.execute('UPDATE runs SET plan=?,plan_hash=?',(engine.canonical(p),engine.digest(p)))
        r['expected_plan_hash']=engine.digest(p)
        with self.assertRaisesRegex(engine.Refusal,'repository claim'): self.amend(r)

    def test_legacy_shared_and_migration_ownership_checks_remain_enforced(self):
        r=self.prepare()
        self.write(self.c,'_bmad-output/auto-bmad/state/epic/epic-99.yaml','status: running\nepic_num: 99\n')
        with self.assertRaisesRegex(engine.Refusal,'Legacy ownership'): self.amend(r)
        (self.c/'_bmad-output/auto-bmad/state/epic/epic-99.yaml').unlink()
        bad=copy.deepcopy(r); bad['add_write_paths']=['supabase/migrations/20261012000000_fixture.sql']
        with self.assertRaisesRegex(engine.Refusal,'schema:migrations'): self.amend(bad)
        with engine.database(self.repo) as db:
            p=json.loads(db.execute('SELECT plan FROM runs').fetchone()[0]); p['shared_paths']=['src/shared/']
            db.execute('UPDATE runs SET plan=?,plan_hash=?',(engine.canonical(p),engine.digest(p)))
        r['expected_plan_hash']=engine.digest(p)
        with self.assertRaisesRegex(engine.Refusal,'aggregate/shared'): self.amend(r)

    def test_any_target_journal_or_prepared_repository_operation_blocks_recovery(self):
        r=self.prepare(); before=self.store()
        for run,story,state in [('pilot','a','merged'),('other-run','other-story','prepared')]:
            with engine.database(self.repo) as db: db.execute('INSERT INTO journal VALUES(?,?,?,?,?,?)',(run,story,self.base,self.checkpoint,None,state))
            with self.assertRaisesRegex(engine.Refusal,'journal'): self.amend(r)
            with engine.database(self.repo) as db: db.execute('DELETE FROM journal')
            self.assertEqual(self.store(),before)

    def test_audit_is_append_only_and_new_generation_fresh_checks_are_required(self):
        r=self.prepare(); aa=self.amend(r)
        for statement in ['UPDATE claim_amendments SET request_hash=\'tampered\'','DELETE FROM claim_amendments']:
            with self.assertRaisesRegex(sqlite3.IntegrityError,'append-only'),engine.database(self.repo) as db:
                db.execute(statement)
        e=copy.deepcopy(self.old_evidence); e['generation']=aa['generation']; e['base_sha']=aa['base_sha']
        self.write(self.a,'src/shared/required.txt','required addition\n'); result=self.commit(self.a,'admitted fix')
        e['result_sha']=result; e['changed_paths']=engine.changed(self.repo,aa['base_sha'],result)
        with self.assertRaisesRegex(engine.Refusal,'evidence commit mismatch'): self.call('submit',story='a',worker='worker-a',generation=2,evidence=self.file('stale-checks',e))
        e['checks']=[self.check(result)]; e['review']=self.review(result)
        self.call('submit',story='a',worker='worker-a',generation=2,evidence=self.file('fresh-checks',e))
        self.merge('a'); self.verify('a')
        self.assertTrue(engine.ancestor(self.repo,self.checkpoint,engine.sha(self.repo,'HEAD')))



class StoriesPrFixture(PilotFixture):
    """Independent native stories-source fixture; all custody is disposable."""
    folders = {'a': '_bmad-output/specs/spec-alpha',
               'b': '_bmad-output/specs/nested/spec-beta'}

    def setUp(self):
        super().setUp()
        self.v1_plan = copy.deepcopy(self.plan)
        stories = []
        for label in ['a', 'b']:
            folder = self.folders[label]
            key = 'spec-' + ('alpha' if label == 'a' else 'beta') + '-1'
            manifest = '- id: "1"\n  title: Fixture\n  description: Approved synthetic behavior.\n'
            spec_text = '# Approved ' + label + ' source\n'
            story_text = "---\ntitle: Fixture\ntype: feature\nstatus: ready-for-dev\n---\n\n## Tasks & Acceptance\n\n- Persist the synthetic result.\n"
            self.write(self.repo, folder + '/SPEC.md', spec_text)
            self.write(self.repo, folder + '/stories.yaml', manifest)
            story_path = folder + '/stories/1-fixture.md'
            self.write(self.repo, story_path, story_text)
            item = self.story(label)
            item.update(id=key, spec_path=story_path,
                        independent_of_pending=True,
                        concurrency_approval_ref='synthetic-reviewed-independent-stories',
                        spec_revision=hashlib.sha256(story_text.encode()).hexdigest(),
                        write_paths=['src/' + label + '/', story_path,
                                     '_bmad-output/auto-bmad/state/' + key + '.yaml',
                                     '_bmad-output/auto-bmad/reports/' + key + '.md'],
                        source={'spec_folder': folder, 'story_id': '1',
                                'story_key': key, 'position': 0,
                                'spec_checkpoint': False, 'done_checkpoint': False,
                                'files': [{'path': folder + '/SPEC.md',
                                           'sha256': hashlib.sha256(spec_text.encode()).hexdigest()},
                                          {'path': folder + '/stories.yaml',
                                           'sha256': hashlib.sha256(manifest.encode()).hexdigest()}]})
            stories.append(item)
        self.base = self.commit(self.repo, 'approved native source fixtures')
        self.git(self.repo, 'branch', 'main', self.base)
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', self.base)
        for path in [self.a, self.b, self.c]:
            self.git(path, 'merge', '--ff-only', self.base)
        self.plan.update(schema_version=2, story_source='stories',
                         publication_strategy='story-pr', repository='fixture/project',
                         base_branch='main', base_sha=self.base, stories=stories)
        self.save_plan()
        self.assignments = {}

    def item(self, label):
        return self.plan['stories'][0 if label == 'a' else 1]

    def claim(self, label, path=None, worker=None, **options):
        assignment = self.call('claim', story=self.item(label)['id'],
                               worker=worker or 'worker-' + label,
                               branch='codex/worker-' + (path.name if path else label),
                               worktree=path or getattr(self, label),
                               expected_head=options.pop('expected_head', self.base), **options)
        self.assignments[label] = assignment
        return assignment

    def publication(self, label, head):
        number = 101 if label == 'a' else 102
        return {'repository': 'fixture/project', 'pr_number': number,
                'pr_url': 'https://github.com/fixture/project/pull/' + str(number),
                'head_branch': 'codex/worker-' + label, 'base_branch': 'main',
                'head': head, 'observation_ref': 'synthetic-provider-observation/' + head,
                'qualified_main': True, 'exclusive_writer': True,
                'scope_matches': True, 'actual_frontend': False,
                'visible_ui': False, 'visual_na_reason': 'Synthetic backend-only text fixture'}

    def evidence(self, label, extra=None):
        path = getattr(self, label)
        self.write(path, 'src/' + label + '/result.txt', label + ' complete\n')
        if extra: self.write(path, extra, 'Unauthorized synthetic result\n')
        result = self.commit(path, 'worker ' + label + ' reviewed result')
        assignment = self.assignments[label]
        return {'schema_version': 2, 'run_id': 'pilot',
                'story_id': self.item(label)['id'], 'worker': 'worker-' + label,
                'generation': assignment['generation'], 'base_sha': assignment['base_sha'],
                'result_sha': result, 'workflow_version': self.plan['workflow_version'],
                'spec_revision': self.item(label)['spec_revision'],
                'changed_paths': engine.changed(self.repo, assignment['base_sha'], result),
                'checks': [self.check(result)], 'review': self.review(result),
                'routes': [{'phase': 'build', 'model': 'gpt-6.1-sol', 'effort': 'low',
                            'risk_domains': ['ordinary'], 'reason': 'Synthetic ordinary fixture'}],
                'publication': self.publication(label, result)}

    def submit(self, label, evidence):
        return self.call('submit', story=self.item(label)['id'], worker='worker-' + label,
                         generation=self.assignments[label]['generation'],
                         evidence=self.file('worker-' + label, evidence))

    def merge_evidence(self, label, candidate, request_id=None):
        publication = self.publication(label, candidate)
        publication.update(merge_method='merge', retain_branch=True)
        for gate in ['development', 'ci', 'coordinator_review', 'acceptance', 'merge_authorization']:
            publication[gate] = {'revision': candidate, 'status': 'passed',
                                 'evidence': 'synthetic-independent-' + gate + '/' + candidate}
        return {'schema_version': 2, 'run_id': 'pilot', 'story_id': self.item(label)['id'],
                'worker': 'worker-' + label, 'generation': self.assignments[label]['generation'],
                'request_id': request_id or 'merge-intent-' + label, 'publication': publication,
                'quiescence': {'complete_writer_inventory': True,
                               'writers': [{'identity': 'worker-' + label, 'state': 'stopped',
                                            'evidence_ref': 'synthetic-stopped-worker/' + label}]}}

    def prepare(self, label, candidate, evidence=None, expected_main=None):
        return self.call('prepare-pr-merge', story=self.item(label)['id'],
                         expected_head=candidate,
                         expected_main=expected_main or engine.sha(self.repo, 'refs/remotes/origin/main'),
                         evidence=self.file('prepare-' + label, evidence or self.merge_evidence(label, candidate)))

    def main_merge(self, candidate):
        merge_worktree = self.root / 'qualified-main'
        if not merge_worktree.exists():
            self.git(self.repo, 'worktree', 'add', str(merge_worktree), 'main')
        self.git(merge_worktree, 'merge', '--no-ff', '--no-edit', candidate)
        merged = engine.sha(merge_worktree, 'HEAD')
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', merged)
        return merged

    def observation(self, label, candidate, merged):
        pub = self.publication(label, candidate)
        return {'schema_version': 2, 'request_id': 'merge-intent-' + label,
                'run_id': 'pilot', 'story_id': self.item(label)['id'],
                'generation': self.assignments[label]['generation'],
                'repository': pub['repository'], 'pr_number': pub['pr_number'],
                'pr_url': pub['pr_url'], 'head_branch': pub['head_branch'],
                'base_branch': 'main', 'head_sha': candidate, 'merged': True,
                'merge_sha': merged, 'observation_ref': 'synthetic-provider-merged/' + merged,
                'qualified_main_sha': engine.sha(self.repo, 'refs/remotes/origin/main')}

    def observe(self, label, observation):
        return self.call('observe-pr-merge', story=self.item(label)['id'],
                         request=self.file('observe-' + label, observation))

    def combined(self, head, final=False):
        evidence = super().combined(head, final)
        evidence['schema_version'] = 2
        return evidence

    def verify(self, label):
        head = engine.sha(self.repo, 'refs/remotes/origin/main')
        return self.call('verify', story=self.item(label)['id'],
                         evidence=self.file('verify-' + label, self.combined(head)))

    def assert_clean_store(self, before):
        self.assertEqual(self.git(self.repo, 'rev-parse', 'HEAD'), before)
        self.assertEqual(self.git(self.repo, 'status', '--porcelain'), '')


class StoriesPrAdmission(StoriesPrFixture, unittest.TestCase):
    def test_two_folders_keep_full_namespace_original_id_and_key_read_only(self):
        before = self.git(self.repo, 'rev-parse', 'HEAD')
        report = self.call('plan')
        self.assertEqual(report['ready_pairs'], [['spec-alpha-1', 'spec-beta-1']])
        self.assertFalse((engine.common(self.repo) / 'auto-bmad-parallel.sqlite3').exists())
        self.assert_clean_store(before)
        self.init()
        for label in ['a', 'b']:
            assignment = self.claim(label)
            self.assertEqual(assignment['schema_version'], 2)
            self.assertEqual(assignment['story']['source'], self.item(label)['source'])
            self.assertEqual(assignment['story']['source']['story_id'], '1')
            self.assertEqual(assignment['story']['id'], self.item(label)['id'])
            self.assertEqual(assignment['base_sha'], self.base)

    def test_basename_alias_and_source_identity_forgery_fail_closed(self):
        for field, value in [('spec_folder', '_bmad-output/specs/other/spec-alpha'),
                             ('story_id', '2'), ('story_key', 'spec-beta-1'),
                             ('position', 1)]:
            bad = copy.deepcopy(self.plan)
            bad['stories'][0]['source'][field] = value
            with self.subTest(field=field), self.assertRaises(engine.Refusal):
                engine.validate_plan(self.repo, bad)
        # Two real folders with the same basename would collide in the existing
        # key-derived state/report route even though their canonical sources differ.
        folder = '_bmad-output/specs/other/spec-alpha'
        for suffix in ['SPEC.md', 'stories.yaml', 'stories/1-fixture.md']:
            self.write(self.repo, folder + '/' + suffix,
                       (self.repo / (self.folders['a'] + '/' + suffix)).read_text(encoding='utf-8'))
        duplicate = copy.deepcopy(self.item('a'))
        duplicate['source']['spec_folder'] = folder
        duplicate['source']['files'] = [dict(x, path=x['path'].replace(self.folders['a'], folder))
                                         for x in duplicate['source']['files']]
        duplicate['spec_path'] = folder + '/stories/1-fixture.md'
        bad = copy.deepcopy(self.plan)
        bad['stories'][1] = duplicate
        with self.assertRaises(engine.Refusal):
            engine.validate_plan(self.repo, bad)

    def test_lf_equivalent_source_is_pinned_and_content_mutation_is_refused(self):
        for suffix in ['SPEC.md', 'stories.yaml', 'stories/1-fixture.md']:
            path = self.repo / (self.folders['a'] + '/' + suffix)
            original = path.read_bytes()
            path.write_bytes(original.replace(b'\r\n', b'\n').replace(b'\n', b'\r\n'))
            engine.validate_plan(self.repo, self.plan)
            path.write_bytes(original + b'Changed frozen source\n')
            with self.subTest(suffix=suffix), self.assertRaises(engine.Refusal):
                engine.validate_plan(self.repo, self.plan)
            path.write_bytes(original)

    def test_source_approval_checkpoint_and_manifest_coverage_are_not_invented(self):
        for mutation in ['approval', 'checkpoint', 'missing-manifest-entry']:
            bad = copy.deepcopy(self.plan)
            if mutation == 'approval': bad['stories'][0]['approved'] = False
            if mutation == 'checkpoint': bad['stories'][0]['source']['spec_checkpoint'] = True
            if mutation == 'missing-manifest-entry': bad['stories'][0]['source']['files'] = bad['stories'][0]['source']['files'][:1]
            with self.subTest(mutation=mutation), self.assertRaises(engine.Refusal):
                engine.validate_plan(self.repo, bad)

    def test_multi_entry_source_is_refused_and_terminal_done_checkpoint_is_preserved(self):
        folder = self.folders['a']
        manifest = self.repo / (folder + '/stories.yaml')
        original = manifest.read_bytes()
        multiple = original + b'- id: "2"\n  title: Second\n  description: Out of adapter scope.\n'
        manifest.write_bytes(multiple)
        bad = copy.deepcopy(self.plan)
        bad['stories'][0]['source']['files'][1]['sha256'] = hashlib.sha256(multiple.replace(b'\r\n', b'\n')).hexdigest()
        with self.assertRaises(engine.Refusal): engine.validate_plan(self.repo, bad)
        terminal = original + b'  done_checkpoint: true\n'
        manifest.write_bytes(terminal)
        self.plan['stories'][0]['source']['done_checkpoint'] = True
        self.plan['stories'][0]['source']['files'][1]['sha256'] = hashlib.sha256(terminal.replace(b'\r\n', b'\n')).hexdigest()
        self.base = self.commit(self.repo, 'approved terminal per-story checkpoint')
        self.plan['base_sha'] = self.base
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', self.base)
        self.git(self.repo, 'update-ref', 'refs/heads/main', self.base)
        for path in [self.a, self.b, self.c]: self.git(path, 'merge', '--ff-only', self.base)
        self.init()
        self.assertTrue(self.claim('a')['story']['source']['done_checkpoint'])

    def test_native_spec_checkpoint_does_not_create_implicit_approval(self):
        path = self.repo / (self.folders['a'] + '/stories.yaml')
        content = path.read_bytes().replace(b'\r\n', b'\n') + b'  spec_checkpoint: true\n'
        path.write_bytes(content)
        self.plan['stories'][0]['source']['spec_checkpoint'] = True
        self.plan['stories'][0]['source']['files'][1]['sha256'] = hashlib.sha256(content).hexdigest()
        self.plan['base_sha'] = self.commit(self.repo, 'unapproved source checkpoint')
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', self.plan['base_sha'])
        with self.assertRaises(engine.Refusal): engine.validate_plan(self.repo, self.plan)

    def test_claim_uses_qualified_main_instead_of_control_checkout_head(self):
        self.init()
        self.write(self.repo, 'coordinator-note.txt', 'Control-only bookkeeping\n')
        control_head = self.commit(self.repo, 'control bookkeeping after enrollment')
        self.assertNotEqual(control_head, self.base)
        self.assertEqual(self.claim('a')['base_sha'], self.base)
        self.assertEqual(engine.sha(self.a, 'HEAD'), self.base)

    def test_blocked_v2_and_active_v1_share_the_same_repository_cap(self):
        self.init(); self.claim('a')
        self.call('block', story=self.item('a')['id'], worker='worker-a',
                  generation=1, reason='Stopped pending approved input')
        legacy = copy.deepcopy(self.v1_plan)
        legacy.update(run_id='legacy-pilot', epic='100', base_sha=self.base,
                      integration_branch='codex/worker-c', integration_worktree=str(self.c))
        legacy['stories'] = [self.story('b')]
        legacy['stories'][0]['write_paths'] = ['src/legacy-b/', 'spec/b.md']
        self.call('init', plan=self.file('legacy-plan', legacy))
        worker = self.root / 'legacy-worker'
        self.git(self.repo, 'worktree', 'add', '-b', 'codex/legacy-worker', str(worker), self.base)
        self.call('claim', run='legacy-pilot', story='b', worker='legacy-worker',
                  branch='codex/legacy-worker', worktree=worker)
        with self.assertRaisesRegex(engine.Refusal, 'capacity'): self.claim('b')
        with engine.database(self.repo) as db:
            active = db.execute("SELECT COUNT(*) FROM claims WHERE state!='integrated'").fetchone()[0]
        self.assertEqual(active, 2)

    def test_unregistered_legacy_spec_anchor_blocks_related_source(self):
        anchor = '_bmad-output/auto-bmad/state/epic/spec-alpha.yaml'
        self.write(self.c, anchor, 'status: running\nstory_source: stories\nspec_folder: '
                   + str(self.c / self.folders['a']) + '\n')
        self.save_plan()
        report = self.call('plan')
        self.assertNotIn(self.item('a')['id'], report['ready'])
        self.assertTrue(report['legacy_conflicts'])

    def test_active_run_reserves_full_source_namespace_before_worker_dispatch(self):
        self.init()
        other = copy.deepcopy(self.plan)
        other.update(run_id='other-run', integration_branch='codex/worker-c',
                     integration_worktree=str(self.c))
        with self.assertRaises(engine.Refusal):
            self.call('init', plan=self.file('duplicate-source-plan', other))
        with engine.database(self.repo) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM runs').fetchone()[0], 1)

    def test_main_base_worker_cleanliness_and_workflow_pin_are_enforced(self):
        self.init()
        with self.assertRaises(engine.Refusal): self.claim('a', expected_head='0' * 40)
        self.write(self.a, 'dirty.txt', 'Uncommitted fixture\n')
        with self.assertRaisesRegex(engine.Refusal, 'clean'): self.claim('a')
        (self.a / 'dirty.txt').unlink()
        self.git(self.a, 'checkout', '-b', 'codex/wrong-worker')
        with self.assertRaises(engine.Refusal): self.claim('a')
        self.git(self.a, 'checkout', 'codex/worker-a')
        self.claim('a')
        self.write(self.a, '.agents/skills/auto-bmad/SKILL.md', 'Changed workflow\n')
        with self.assertRaises(engine.Refusal):
            self.call('heartbeat', story=self.item('a')['id'], worker='worker-a', generation=1)

    def test_worker_owner_generation_and_blocked_custody_remain_bound(self):
        self.init(); self.claim('a')
        for options in [{'owner': 'impostor'}, {'worker': 'impostor'}, {'generation': 2}]:
            args = {'story': self.item('a')['id'], 'worker': 'worker-a', 'generation': 1}
            args.update(options)
            with self.subTest(options=options), self.assertRaises(engine.Refusal):
                self.call('heartbeat', **args)
        blocked = self.call('block', story=self.item('a')['id'], worker='worker-a',
                            generation=1, reason='Waiting for approved continuation')
        self.assertEqual(blocked['state'], 'blocked')
        with self.assertRaises(engine.Refusal): self.claim('a', path=self.c, worker='replacement')
        self.assertEqual(self.call('status')['claims'][0]['state'], 'blocked')

    def test_path_and_semantic_independence_are_required(self):
        for field, value in [('write_paths', ['src/a/']),
                             ('conflict_domains', ['contract:shared'])]:
            bad = copy.deepcopy(self.plan)
            if field == 'write_paths': bad['stories'][1][field].append(value[0])
            else:
                bad['stories'][0][field] = value
                bad['stories'][1][field] = value
            with self.subTest(field=field):
                self.assertEqual(engine.report(self.repo, engine.validate_plan(self.repo, bad))['ready_pairs'], [])
        self.plan['stories'][0]['conflict_domains'] = ['contract:shared']
        self.plan['stories'][1]['conflict_domains'] = ['contract:shared']
        self.init(); self.claim('a')
        with self.assertRaisesRegex(engine.Refusal, 'semantic conflict'): self.claim('b')

    def test_source_and_sibling_bookkeeping_never_become_worker_ownership(self):
        own = self.folders['a']
        paths = [own + '/SPEC.md', own + '/stories.yaml', own + '/.memlog.md',
                 own + '/RETROSPECTIVE.md',
                 '_bmad-output/auto-bmad/reports/spec-alpha.md',
                 '_bmad-output/auto-bmad/state/epic/spec-alpha.yaml',
                 '_bmad-output/auto-bmad/state/spec-beta-1.yaml',
                 '_bmad-output/auto-bmad/reports/spec-beta-1.md',
                 self.item('b')['spec_path']]
        for path in paths:
            bad = copy.deepcopy(self.plan)
            bad['stories'][0]['write_paths'].append(path)
            with self.subTest(path=path), self.assertRaises(engine.Refusal):
                engine.validate_plan(self.repo, bad)

class StoriesPrCustody(StoriesPrFixture, unittest.TestCase):
    def ready(self, *labels):
        self.init()
        results = {}
        for label in labels:
            self.claim(label)
            evidence = self.evidence(label)
            self.assertEqual(self.submit(label, evidence)['state'], 'pr-ready')
            results[label] = evidence['result_sha']
        return results

    def test_pr_ready_keeps_custody_and_cannot_use_epic_integration(self):
        result = self.ready('a')['a']
        before = engine.sha(self.repo, 'HEAD')
        self.assertEqual(self.call('status')['claims'][0]['state'], 'pr-ready')
        self.assertFalse(engine.ancestor(self.repo, result,
                                       engine.sha(self.repo, 'refs/remotes/origin/main')))
        with self.assertRaises(engine.Refusal):
            self.call('integrate', story=self.item('a')['id'], expected_head=before)
        with self.assertRaises(engine.Refusal): self.claim('a', path=self.c, worker='replacement')
        with self.assertRaises(engine.Refusal):
            self.call('finalize', evidence=self.file('premature-final', self.combined(before, True)))
        self.assert_clean_store(before)

    def test_publication_identity_and_revision_bound_checks_are_required(self):
        self.init(); self.claim('a'); evidence = self.evidence('a')
        for field, value in [('repository', 'other/project'), ('head', self.base),
                             ('head_branch', 'codex/worker-b'), ('base_branch', 'feature'),
                             ('pr_number', 0), ('observation_ref', '')]:
            bad = copy.deepcopy(evidence); bad['publication'][field] = value
            with self.subTest(field=field), self.assertRaises(engine.Refusal): self.submit('a', bad)
        self.submit('a', evidence)
        original_number = evidence['publication']['pr_number']
        self.write(self.a, 'src/a/revision.txt', 'Reviewed candidate fix\n')
        fixed = self.evidence('a')
        fixed['publication']['pr_number'] = original_number + 5
        fixed['publication']['pr_url'] = 'https://github.com/fixture/project/pull/106'
        with self.assertRaises(engine.Refusal): self.submit('a', fixed)
        fixed['publication'] = self.publication('a', fixed['result_sha'])
        self.assertEqual(self.submit('a', fixed)['state'], 'pr-ready')

    def test_durable_repository_wide_merge_intent_freezes_workers_until_verified(self):
        results = self.ready('a', 'b')
        self.prepare('a', results['a'])
        # The committed SQLite intent survives closing/reopening the connection.
        with engine.database(self.repo) as db:
            row = dict(db.execute('SELECT * FROM story_pr_publications WHERE story=?',
                                  (self.item('a')['id'],)).fetchone())
        self.assertIn('merge-intent-a', row['intent_json'])
        with self.assertRaises(engine.Refusal): self.prepare('b', results['b'])
        for command, options in [('heartbeat', {}), ('block', {'reason': 'late writer'}),
                                 ('submit', {'evidence': self.root / 'worker-a.json'})]:
            with self.subTest(command=command), self.assertRaises(engine.Refusal):
                self.call(command, story=self.item('a')['id'], worker='worker-a', generation=1, **options)
        merged = self.main_merge(results['a'])
        self.observe('a', self.observation('a', results['a'], merged))
        with self.assertRaises(engine.Refusal): self.prepare('b', results['b'])
        self.verify('a')
        self.assertEqual(self.call('status')['claims'][0]['state'], 'integrated')
        self.prepare('b', results['b'])

    def test_crash_after_preparation_commit_retains_one_recoverable_intent(self):
        candidate = self.ready('a')['a']
        with patch.object(engine, 'story_pr_merge_checkpoint',
                          side_effect=RuntimeError('synthetic process death after durable intent')):
            with self.assertRaisesRegex(RuntimeError, 'synthetic process death'):
                self.prepare('a', candidate)
        self.assertEqual(self.call('status')['claims'][0]['state'], 'merge-prepared')
        with self.assertRaises(engine.Refusal): self.prepare('a', candidate)
        with engine.database(self.repo) as db:
            rows = list(db.execute('SELECT intent_json FROM story_pr_publications'))
        self.assertEqual(len(rows), 1)
        self.assertEqual(json.loads(rows[0][0])['request_id'], 'merge-intent-a')
        merged = self.main_merge(candidate)
        self.observe('a', self.observation('a', candidate, merged))
        self.verify('a')
        self.assertEqual(self.call('status')['claims'][0]['state'], 'integrated')

    def test_merge_gates_quiescence_and_exact_main_are_required(self):
        candidate = self.ready('a')['a']
        for mutation in ['head', 'main', 'authorization', 'quiescence', 'owner', 'generation']:
            evidence = self.merge_evidence('a', candidate)
            expected_main = self.base
            if mutation == 'head': evidence['publication']['head'] = self.base
            if mutation == 'main': expected_main = candidate
            if mutation == 'authorization': evidence['publication']['merge_authorization']['status'] = 'pending'
            if mutation == 'quiescence': evidence['quiescence']['writers'][0]['state'] = 'running'
            if mutation == 'owner': evidence['worker'] = 'impostor'
            if mutation == 'generation': evidence['generation'] = 2
            with self.subTest(mutation=mutation), self.assertRaises(engine.Refusal):
                self.prepare('a', candidate, evidence, expected_main=expected_main)
        self.assertEqual(self.call('status')['claims'][0]['state'], 'pr-ready')
        self.prepare('a', candidate)

    def test_open_wrong_identity_and_arbitrary_ancestor_do_not_release_intent(self):
        candidate = self.ready('a')['a']; self.prepare('a', candidate)
        observation = self.observation('a', candidate, self.base)
        for field, value in [('merged', False), ('repository', 'other/project'),
                             ('pr_number', 999), ('head_sha', self.base),
                             ('base_branch', 'feature'), ('request_id', 'wrong-intent'),
                             ('generation', 2), ('merge_sha', self.base)]:
            bad = copy.deepcopy(observation); bad[field] = value
            with self.subTest(field=field), self.assertRaises(engine.Refusal): self.observe('a', bad)
        with engine.database(self.repo) as db:
            self.assertIsNotNone(db.execute('SELECT intent_json FROM story_pr_publications').fetchone()[0])
        merged = self.main_merge(candidate)
        self.observe('a', self.observation('a', candidate, merged))
        self.assertEqual(self.call('status')['claims'][0]['state'], 'awaiting-verification')

    def test_changed_main_parent_blocks_reconciliation_and_retains_custody(self):
        candidate = self.ready('a')['a']; self.prepare('a', candidate)
        merge_worktree = self.root / 'qualified-main'
        self.git(self.repo, 'worktree', 'add', str(merge_worktree), 'main')
        self.write(merge_worktree, 'main-change.txt', 'Concurrent qualified main change\n')
        drift = self.commit(merge_worktree, 'unrelated main advance')
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', drift)
        merged = self.main_merge(candidate)
        with self.assertRaises(engine.Refusal): self.observe('a', self.observation('a', candidate, merged))
        with self.assertRaises(engine.Refusal):
            self.call('heartbeat', story=self.item('a')['id'], worker='worker-a', generation=1)

    def test_actual_merge_and_current_main_verification_are_required(self):
        candidate = self.ready('a')['a']; self.prepare('a', candidate)
        merged = self.main_merge(candidate)
        parents = self.git(self.repo, 'rev-list', '--parents', '-n', '1', merged).split()[1:]
        self.assertEqual(parents, [self.base, candidate])
        self.observe('a', self.observation('a', candidate, merged))
        old = self.combined(merged)
        main_worktree = self.root / 'qualified-main'
        self.write(main_worktree, 'main-change.txt', 'Main advanced after merge\n')
        current = self.commit(main_worktree, 'later main commit')
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/main', current)
        with self.assertRaises(engine.Refusal):
            self.call('verify', story=self.item('a')['id'], evidence=self.file('stale-main', old))
        bad = self.combined(current); bad['checks'][0]['skipped'] = 1
        with self.assertRaises(engine.Refusal):
            self.call('verify', story=self.item('a')['id'], evidence=self.file('skipped-check', bad))
        self.verify('a')
        self.assertEqual(self.call('status')['claims'][0]['state'], 'integrated')
        self.assertEqual(engine.sha(self.repo, 'HEAD'), self.base,
                         'Main integration must not invent a coordinator-branch merge')

    def test_finalization_requires_both_verified_main_merges_and_current_final_gates(self):
        results = self.ready('a', 'b')
        for label in ['a', 'b']:
            self.prepare(label, results[label])
            merged = self.main_merge(results[label])
            self.observe(label, self.observation(label, results[label], merged))
            if label == 'b':
                with self.assertRaises(engine.Refusal):
                    self.call('finalize', evidence=self.file('unverified-final', self.combined(merged, True)))
            self.verify(label)
        current = engine.sha(self.repo, 'refs/remotes/origin/main')
        missing = self.combined(current, True)
        missing['checks'] = missing['checks'][:-1]
        with self.assertRaises(engine.Refusal):
            self.call('finalize', evidence=self.file('missing-final-gate', missing))
        final = self.call('finalize', evidence=self.file('final-main', self.combined(current, True)))
        self.assertEqual(final['state'], 'finalized')
        self.assertEqual(final['integration_sha'], current)
        for candidate in results.values(): self.assertTrue(engine.ancestor(self.repo, candidate, current))

    def test_prerequisite_requires_verified_main_ancestry_and_refreshed_worker_base(self):
        self.item('b')['prerequisites'] = [self.item('a')['id']]
        self.item('b')['requires_contracts'] = [{'story': self.item('a')['id'], 'contract': 'contract-a'}]
        self.init(); self.claim('a')
        evidence = self.evidence('a'); candidate = evidence['result_sha']
        self.submit('a', evidence)
        with self.assertRaises(engine.Refusal): self.claim('b')
        self.prepare('a', candidate)
        merged = self.main_merge(candidate)
        self.observe('a', self.observation('a', candidate, merged))
        with self.assertRaises(engine.Refusal): self.claim('b', expected_head=merged)
        self.verify('a')
        with self.assertRaises(engine.Refusal): self.claim('b', expected_head=merged)
        self.git(self.b, 'merge', '--ff-only', merged)
        self.assertEqual(self.claim('b', expected_head=merged)['base_sha'], merged)


if __name__=='__main__': unittest.main()
