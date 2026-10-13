"""Quiesced finalization tests: disposable Git/SQLite only; synthetic evidence."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import unittest
from unittest.mock import patch

from test_parallel_run import PilotFixture, engine, SCRIPT


class FinalizationFixture(PilotFixture):
    def setUp(self):
        super().setUp()
        self.plan['epic']='20'
        self.plan['final_required_checks']=sorted(engine.FINALIZATION_CHECKS)
        self.init()
        for id in ['a','b']: self.claim(id)
        # Seed already-completed synthetic history; never access a live store.
        with engine.database(self.repo) as db:
            for id in ['a','b']:
                evidence={'review':self.review(self.base)}
                db.execute("UPDATE claims SET state='integrated',result_sha=?,integration_sha=?,evidence=? WHERE run=? AND story=?",(self.base,self.base,json.dumps(evidence),'pilot',id))
                db.execute('INSERT INTO verifications VALUES(?,?,?,?)',('pilot',id,self.base,json.dumps(self.combined(self.base))))
        # Actual separately committed maintenance executable, no identity mocking.
        self.write(self.c,'.gitignore','__pycache__/\n')
        self.write(self.c,'.agents/skills/auto-bmad/scripts/parallel_run.py',SCRIPT.read_text())
        self.toolsha=self.commit(self.c,'synthetic reviewed maintenance tooling')
        self.entry=self.c/'.agents/skills/auto-bmad/scripts/parallel_run.py'
        spec=importlib.util.spec_from_file_location('synthetic_finalization',self.entry)
        self.maintenance=importlib.util.module_from_spec(spec); spec.loader.exec_module(self.maintenance)
        self.log=self.root/'synthetic.log'; self.log.write_text('Synthetic completed check\n')
        self.final=self.combined(self.base,True)
        self.final['review']=self.review(self.base,'high')
        self.final['checks']=[self.check(self.base,name) for name in sorted(engine.FINALIZATION_CHECKS)]
        for c in self.final['checks']:
            c['executed']=1
            if 'integration' in c['name'] or c['name'].endswith('-db'):
                c['environment']={'SUPABASE_TEST_REQUIRED':'1'}
            if c['name'] in engine.FINALIZATION_SKIPS: c['skipped']=len(engine.FINALIZATION_SKIPS[c['name']])
            if c['name']=='isolated-storage-recovery-integration': c['environment']['ISOLATED_RECOVERY_STORAGE_PROOF']='1'
        self.native={}; self.raw={}; receipts={}
        for c in self.final['checks']:
            name=c['name']; framework='command'; report=None
            if name in {'full-integration-rls','isolated-storage-recovery-integration'}:
                framework='vitest'
                cases=[(*engine.RECOVERY_SKIP,'skipped' if name=='full-integration-rls' else 'passed')]
                if name=='full-integration-rls': cases.append(('tests/integration/ordinary.int.test.ts','ordinary coverage','passed'))
                self.raw[name]=self.vitest(cases)
            if name=='general-browser':
                framework='playwright'
                cases=[(f,t,'skipped') for f,t in engine.FINALIZATION_SKIPS[name]]+[('tests/e2e/ordinary.e2e.spec.ts','ordinary coverage','passed')]
                self.raw[name]=self.playwright(cases)
            if name in self.raw: report=self.ref(self.file('raw-'+name,self.raw[name]))
            self.native[name]={'schema_version':1,'name':name,'commit':self.base,'execution_sha':self.base,'source_tree':self.git(self.repo,'rev-parse',self.base+'^{tree}'),'argv':c['argv'],'environment':c.get('environment',{}),'native_exit':0,'execution_state':'completed','executed':c['executed'],'skipped':c['skipped'],'failed':0,'framework':framework,'report':report,'log':self.ref(self.log),'case_files':[],'report_worktree':str(self.repo)}
            receipts[name]=self.ref(self.file('native-'+name,self.native[name]))
        q={'schema_version':1,'run_id':'pilot','owner':self.plan['coordinator'],'plan_hash':engine.digest(self.plan),'integration_sha':self.base,'workflow_version':self.plan['workflow_version'],'complete_writer_inventory':True,'includes_subsequent_authors_and_verifiers':True,'inventory_source_refs':['synthetic full chat inventory'],'writers':[{'identity':id,'role':role,'state':'stopped','evidence_ref':'synthetic terminal status'} for id,role in [(self.plan['coordinator'],'coordinator'),('worker-a','worker'),('worker-b','worker'),('independent-reviewer','verifier'),('later-repair-author','repair-author')]]}
        self.qfile=self.file('quiescence',q)
        tooling_ci={'schema_version':1,'commit':self.toolsha,'result':'passed','required_checks':['helper-unit'],'checks':[self.check(self.toolsha,'helper-unit')],'source_ref':'synthetic CI run'}
        self.r={'schema_version':1,'request_id':'final-one','run_id':'pilot','owner':self.plan['coordinator'],'expected_plan_hash':engine.digest(self.plan),'expected_integration_sha':self.base,'workflow_version':self.plan['workflow_version'],'reviewed_tooling_sha':self.toolsha,'tool_sha256':self.maintenance.recovery_tool_sha256(),'tooling_author':'synthetic-tool-author','tooling_review':self.review(self.toolsha,'high'),'tooling_ci':self.ref(self.file('tooling-ci',tooling_ci)),'human_decision':{'decision_id':'synthetic-owner-approval','human':'synthetic owner','date':'2026-10-13','reason':'Synthetic identified inherited skips, no coverage credit','accepted_skips':{k:[{'file':f,'full_name':t} for f,t in v] for k,v in engine.FINALIZATION_SKIPS.items()}},'quiescence':self.ref(self.qfile),'evidence':self.ref(self.file('final',self.final)),'receipts':receipts}
        self.sign()

    def sign(self):
        self.r['adoption_review']={**self.review(self.base,'high'),'adoption_digest':engine.digest({k:v for k,v in self.r.items() if k!='adoption_review'})}

    def ref(self,path): return {'path':str(path.resolve()),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

    def vitest(self,cases):
        groups={}
        for f,t,status in cases:
            ancestor,title=([t.rsplit(' ',1)[0]],t.rsplit(' ',1)[1]) if ' ' in t else ([],t)
            groups.setdefault(f,[]).append({'ancestorTitles':ancestor,'title':title,'fullName':t,'status':status,'failureMessages':[]})
        passed=sum(x[2]=='passed' for x in cases); skipped=len(cases)-passed
        return {'success':True,'numFailedTests':0,'numFailedTestSuites':0,'numPendingTestSuites':0,'numTodoTests':0,'numPassedTests':passed,'numPendingTests':skipped,'numTotalTests':len(cases),'testResults':[{'name':str(self.repo/f),'status':'passed','message':'','assertionResults':values} for f,values in groups.items()]}

    def playwright(self,cases):
        return {'config':{'rootDir':str(self.repo)},'errors':[],'stats':{'expected':sum(x[2]=='passed' for x in cases),'skipped':sum(x[2]=='skipped' for x in cases),'unexpected':0,'flaky':0},'suites':[{'title':f,'file':f,'specs':[{'title':t,'file':f,'ok':True,'tests':[{'status':'skipped' if status=='skipped' else 'expected','expectedStatus':status,'results':[{'status':status,'retry':0,'errors':[]}]}]}]} for f,t,status in cases]}

    def refresh(self,name):
        if name in self.raw:
            self.native[name]['report']=self.ref(self.file('raw-'+name,self.raw[name]))
        self.r['receipts'][name]=self.ref(self.file('native-'+name,self.native[name])); self.sign()

    def final_call(self):
        a=engine.parser().parse_args(self.args('finalize-exceptions',request=self.file('request',self.r)))
        return self.maintenance.execute(a)

    def snapshot(self):
        with engine.database(self.repo) as db:
            return {name:[tuple(row) for row in db.execute('SELECT * FROM '+name)] for name in ['runs','claims','verifications','journal','claim_amendments','finalization_adoptions']}

    def refuses_unchanged(self,pattern=None):
        before=self.snapshot()
        with self.assertRaisesRegex(engine.Refusal if self.maintenance is engine else self.maintenance.Refusal,pattern or '.'):
            self.final_call()
        self.assertEqual(before,self.snapshot())


class FinalizationExceptions(FinalizationFixture,unittest.TestCase):
    def test_retained_atomic_adoption_preserves_plan_claims_counts_and_history(self):
        before=self.snapshot(); head=self.git(self.repo,'rev-parse','HEAD')
        result=self.final_call(); after=self.snapshot()
        self.assertEqual(result['state'],'finalized'); self.assertFalse(result['skips_have_coverage_credit'])
        self.assertEqual(before['claims'],after['claims']); self.assertEqual(before['journal'],after['journal'])
        self.assertEqual(before['runs'][0][3:5],after['runs'][0][3:5]); self.assertEqual(head,self.git(self.repo,'rev-parse','HEAD'))
        self.assertEqual(len(after['finalization_adoptions']),1)
        audit=after['finalization_adoptions'][0]
        self.assertEqual(json.loads(audit[6]),self.final)
        retained=json.loads(audit[5]); self.assertEqual(retained['checks']['full-integration-rls']['native']['skipped'],1)
        self.assertEqual(retained['checks']['general-browser']['native']['skipped'],3)
        with engine.database(self.repo) as db:
            for sql in ["UPDATE finalization_adoptions SET request_hash='bad'",'DELETE FROM finalization_adoptions']:
                with self.assertRaises(sqlite3.IntegrityError): db.execute(sql)

    def test_strict_default_still_rejects_and_has_no_adoption(self):
        with self.assertRaisesRegex(engine.Refusal,'zero skips'):
            self.call('finalize',evidence=self.file('strict',self.final))
        self.assertEqual(self.snapshot()['finalization_adoptions'],[])
        with self.assertRaisesRegex(engine.Refusal,'Unknown fields'):
            self.call('finalize',evidence=self.file('strict-extra',{**self.final,'exceptions':True}))

    def test_exact_retry_replays_once_conflicting_and_competing_token_refuse(self):
        self.final_call(); before=self.snapshot(); self.assertTrue(self.final_call()['replayed']); self.assertEqual(before,self.snapshot())
        self.r['human_decision']['reason']='Changed'; self.sign(); self.refuses_unchanged('different inputs')
        self.r['request_id']='final-two'; self.sign(); self.refuses_unchanged('already finalized')

    def test_mid_transaction_failure_rolls_back_all_then_retry_succeeds(self):
        before=self.snapshot()
        with patch.object(self.maintenance,'finalization_checkpoint',side_effect=RuntimeError('synthetic crash')):
            with self.assertRaises(RuntimeError): self.final_call()
        self.assertEqual(before,self.snapshot()); self.assertEqual(self.final_call()['state'],'finalized')

    def test_stale_binding_and_missing_gate_cases_refuse(self):
        baseline=copy.deepcopy(self.r)
        for field in ['run_id','owner','expected_plan_hash','expected_integration_sha','workflow_version','reviewed_tooling_sha','tool_sha256']:
            with self.subTest(field=field):
                self.r=copy.deepcopy(baseline); self.r[field]='0'*64; self.sign(); self.refuses_unchanged()
        self.r=copy.deepcopy(baseline); del self.r['receipts']['documents-browser']; self.sign(); self.refuses_unchanged('40')
        self.r=copy.deepcopy(baseline); self.r['adoption_review']['adoption_digest']='0'*64; self.refuses_unchanged('bind')

    def test_failed_aborted_native_and_raw_reports_cannot_be_waived(self):
        baseline=copy.deepcopy(self.native['full-integration-rls'])
        for field,value in [('native_exit',1),('execution_state','aborted-invalidated'),('failed',1),('commit','0'*40),('executed',3),('skipped',2)]:
            with self.subTest(field=field):
                self.native['full-integration-rls']=copy.deepcopy(baseline); self.native['full-integration-rls'][field]=value; self.refresh('full-integration-rls'); self.refuses_unchanged()
        self.native['full-integration-rls']=baseline
        self.raw['full-integration-rls']['numPendingTestSuites']=1; self.refresh('full-integration-rls'); self.refuses_unchanged('incomplete')
        self.raw['full-integration-rls']['numPendingTestSuites']=0
        self.raw['full-integration-rls']['success']=False; self.refresh('full-integration-rls'); self.refuses_unchanged('failed')

    def test_added_renamed_duplicate_skips_and_wrong_raw_hash_refuse(self):
        baseline=copy.deepcopy(self.raw['general-browser'])
        for kind in ['renamed','wrong-file','added','duplicate']:
            with self.subTest(kind=kind):
                self.raw['general-browser']=copy.deepcopy(baseline)
                if kind=='renamed': self.raw['general-browser']['suites'][0]['specs'][0]['title']+=' changed'
                elif kind=='wrong-file': self.raw['general-browser']['suites'][0]['specs'][0]['file']='tests/e2e/quotes/other.e2e.spec.ts'
                else:
                    extra=copy.deepcopy(self.raw['general-browser']['suites'][0])
                    if kind=='added': extra['specs'][0]['title']='additional skipped case'
                    self.raw['general-browser']['suites'].append(extra); self.raw['general-browser']['stats']['skipped']+=1
                self.refresh('general-browser'); self.refuses_unchanged()
        self.raw['general-browser']=baseline; self.refresh('general-browser')
        self.native['general-browser']['report']['sha256']='0'*64
        self.r['receipts']['general-browser']=self.ref(self.file('native-general-browser',self.native['general-browser'])); self.sign(); self.refuses_unchanged('hash')

    def test_recovery_missing_skipped_or_wrong_title_refuse(self):
        for kind in ['missing-report','skipped','renamed']:
            with self.subTest(kind=kind):
                self.raw['isolated-storage-recovery-integration']=self.vitest([(*engine.RECOVERY_SKIP,'passed')])
                self.refresh('isolated-storage-recovery-integration')
                if kind=='missing-report':
                    self.native['isolated-storage-recovery-integration']['framework']='command'; self.native['isolated-storage-recovery-integration']['report']=None
                elif kind=='skipped': self.raw['isolated-storage-recovery-integration']=self.vitest([(*engine.RECOVERY_SKIP,'skipped')])
                else:
                    cases=self.raw['isolated-storage-recovery-integration']['testResults'][0]['assertionResults']; cases[0]['fullName']='wrong recovery case'; cases[0]['ancestorTitles']=[]; cases[0]['title']='wrong recovery case'
                self.refresh('isolated-storage-recovery-integration'); self.refuses_unchanged()

    def test_no_documents_or_unit_gate_skip_exceptions(self):
        for name in ['documents-browser','unit']:
            with self.subTest(name=name):
                self.raw[name]=self.vitest([('tests/integration/unrelated.test.ts','unrelated skip','skipped'),('tests/integration/unrelated.test.ts','passed','passed')])
                self.native[name]['framework']='vitest'; self.native[name]['skipped']=1
                c=next(c for c in self.final['checks'] if c['name']==name); c['skipped']=1
                self.r['evidence']=self.ref(self.file('final',self.final)); self.refresh(name); self.refuses_unchanged('No exceptions')
                c['skipped']=0; self.native[name]['skipped']=0; self.native[name]['framework']='command'; del self.raw[name]; self.native[name]['report']=None
                self.r['evidence']=self.ref(self.file('final',self.final)); self.refresh(name)

    def test_incomplete_writers_and_unfinished_claims_refuse(self):
        q=json.loads(self.qfile.read_text()); baseline=copy.deepcopy(q)
        for mode in ['omit-worker','omit-verifier','active-repair','missing-attestation']:
            with self.subTest(mode=mode):
                q=copy.deepcopy(baseline)
                if mode.startswith('omit'):
                    identity='worker-a' if mode=='omit-worker' else 'independent-reviewer'; q['writers']=[w for w in q['writers'] if w['identity']!=identity]
                if mode=='active-repair': q['writers'][-1]['state']='running'
                if mode=='missing-attestation': q['includes_subsequent_authors_and_verifiers']=False
                self.r['quiescence']=self.ref(self.file('quiescence',q)); self.sign(); self.refuses_unchanged()
        self.r['quiescence']=self.ref(self.file('quiescence',baseline)); self.sign()
        with engine.database(self.repo) as db: db.execute("UPDATE claims SET state='awaiting-verification' WHERE story='a'")
        self.refuses_unchanged('unfinished')

    def test_frozen_head_and_raw_bytes_rechecked_before_cas(self):
        original=self.maintenance.maintenance_identity; calls=0
        def race(*args):
            nonlocal calls
            calls+=1
            result=original(*args)
            if calls==2: self.log.write_text('changed after validation')
            return result
        with patch.object(self.maintenance,'maintenance_identity',side_effect=race): self.refuses_unchanged('changed before')

    def test_executor_tree_and_candidate_head_staleness_refuse(self):
        self.native['full-integration-rls']['source_tree']='0'*40; self.refresh('full-integration-rls'); self.refuses_unchanged('tree')
        self.native['full-integration-rls']['source_tree']=self.git(self.repo,'rev-parse',self.base+'^{tree}'); self.refresh('full-integration-rls')
        self.write(self.repo,'final-report.txt','later candidate change'); self.commit(self.repo,'later clean candidate')
        self.refuses_unchanged('HEAD')

    def test_subsequent_verifier_from_repair_record_must_be_stopped(self):
        extra=self.combined(self.base); extra['review']['reviewer']='subsequent-verifier'
        with engine.database(self.repo) as db:
            db.execute('INSERT INTO verifications VALUES(?,?,?,?)',('pilot','__repair__a',self.base,json.dumps(extra)))
        self.refuses_unchanged('Incomplete')

    def test_request_known_final_and_adoption_verifier_omissions_refuse(self):
        self.final['review']['reviewer']='fresh-final-verifier'
        self.r['evidence']=self.ref(self.file('final',self.final)); self.sign(); self.refuses_unchanged('Incomplete')
        self.final['review']['reviewer']='independent-reviewer'
        self.r['evidence']=self.ref(self.file('final',self.final)); self.sign()
        self.r['adoption_review']['reviewer']='fresh-adoption-verifier'; self.refuses_unchanged('Incomplete')

    def test_live_executable_and_low_reviews_refuse(self):
        oldfile=self.maintenance.__file__
        self.maintenance.__file__=str(self.repo/'.agents/skills/auto-bmad/SKILL.md')
        self.refuses_unchanged('separate maintenance'); self.maintenance.__file__=oldfile
        self.r['tooling_review']['effort']='low'; self.sign(); self.refuses_unchanged('high effort')
        self.r['tooling_review']['effort']='high'; self.sign(); self.r['adoption_review']['effort']='low'; self.refuses_unchanged('high effort')

    def test_dirty_maintenance_refuse(self):
        self.write(self.c,'untracked.txt','dirty'); self.refuses_unchanged('clean')

    def test_real_cli_concurrent_requests_one_atomic_winner(self):
        req=copy.deepcopy(self.r); req['request_id']='final-competing'; req['adoption_review']['adoption_digest']=engine.digest({k:v for k,v in req.items() if k!='adoption_review'})
        files=[self.file('request-one',self.r),self.file('request-two',req)]
        commands=[[sys.executable,'-X','utf8',str(self.entry),*self.args('finalize-exceptions',request=file)] for file in files]
        procs=[subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True) for cmd in commands]
        outputs=[p.communicate(timeout=60) for p in procs]
        self.assertEqual(sorted(p.returncode for p in procs),[0,1],outputs)
        self.assertTrue(all(not err for out,err in outputs)); self.assertEqual(len(self.snapshot()['finalization_adoptions']),1)
        self.assertTrue(all(len(out.splitlines())==1 for out,err in outputs))

    def test_mirror_is_identical(self):
        root=SCRIPT.parents[4]; mirror=root/'.claude/skills/auto-bmad/scripts/tests/test_parallel_finalization.py'
        self.assertEqual(Path(__file__).read_bytes(),mirror.read_bytes())


class FrameworkReports(unittest.TestCase):
    def test_playwright_describe_title_is_full_identity(self):
        raw={'config':{'rootDir':'C:/synthetic'},'errors':[],'stats':{'expected':1,'skipped':0,'unexpected':0,'flaky':0},'suites':[{'title':'a.spec.ts','file':'tests/e2e/a.spec.ts','suites':[{'title':'describe title','file':'tests/e2e/a.spec.ts','specs':[{'file':'tests/e2e/a.spec.ts','title':'case title','ok':True,'tests':[{'status':'expected','expectedStatus':'passed','results':[{'status':'passed','errors':[],'retry':0}]}]}]}]}]}
        self.assertEqual(engine.framework_cases(raw,'playwright','C:/synthetic'),[('tests/e2e/a.spec.ts','describe title case title','passed')])
        raw['suites'][0]['suites'][0]['specs'][0]['tests'][0]['results'][0]['status']='interrupted'
        with self.assertRaises(engine.Refusal): engine.framework_cases(raw,'playwright','C:/synthetic')

    def test_linux_playwright_root_relative_files_and_exact_case(self):
        root='/home/runner/work/Kopplas/Kopplas'
        raw={'config':{'rootDir':root+'/tests/e2e'},'errors':[],'stats':{'expected':0,'skipped':1,'unexpected':0,'flaky':0},'suites':[{'title':'quotes/a.spec.ts','file':'quotes/a.spec.ts','specs':[{'title':'skip title','file':'quotes/a.spec.ts','ok':True,'tests':[{'status':'skipped','expectedStatus':'skipped','results':[{'status':'skipped','retry':0,'errors':[]}]}]}]}]}
        self.assertEqual(engine.framework_cases(raw,'playwright',root),[('tests/e2e/quotes/a.spec.ts','skip title','skipped')])
        raw['config']['rootDir']='/home/other/repository/tests/e2e'
        with self.assertRaises(engine.Refusal): engine.framework_cases(raw,'playwright',root)

    def test_same_counts_wrong_physical_file_refuses_allowlist(self):
        self.assertEqual(len(engine.FINALIZATION_CHECKS),40)
        self.assertEqual(len(engine.FINALIZATION_SKIPS['full-integration-rls']),1)
        self.assertEqual(len(engine.FINALIZATION_SKIPS['general-browser']),3)


if __name__=='__main__': unittest.main()
