"""Bounded iteration1 recalculation from recorded membership-removal evidence.
No product execution: preserve dirty-base+hash provenance and join compact catalog.
Run after original generation, before compact-artifacts.py.
"""
import json,pathlib,re,hashlib,datetime,subprocess,tempfile
O=pathlib.Path(__file__).resolve().parent;R=O.parents[3];E=R/'_bmad-output/test-artifacts/epic-20-e8-iter1'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,v):
 def fmt(x,n=0):
  if isinstance(x,dict):return '{\n'+',\n'.join('  '*(n+1)+json.dumps(k)+': '+fmt(v,n+1)for k,v in x.items())+'\n'+'  '*n+'}' if x else '{}'
  if isinstance(x,list):return '[\n'+',\n'.join('  '*(n+1)+json.dumps(v,ensure_ascii=False,separators=(',',':'))for v in x)+'\n'+'  '*n+']' if x and any(isinstance(v,(dict,list))for v in x)else json.dumps(x,ensure_ascii=False,separators=(',',':'))
  return json.dumps(x,ensure_ascii=False)
 p.write_text(fmt(v)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=R,text=True).strip()
head=git('rev-parse','HEAD');commit='80fdaef70b9145ff0ecf6de5865a894a5eb4b6a2';changed='tests/integration/commands/documents-signed-access.int.test.ts';file=R/changed;expected='eab6b291f0eb8bee1c6269a8563fa1619105a983a0e8058eb6bea23a0151c90c'
assert sha(file)==expected
assert git('rev-parse',commit+':'+changed)==git('hash-object',changed)
assert not git('diff','--name-only','c65c18649ac5641f9520b12e03a8b3f20af8f610',head,'--','src/','supabase/')
receipt=read(E/'documents-authorization-races.native.json');runtime=read(E/'documents-authorization-races.vitest.json');review=read(E/'narrow-review.json')
assert receipt['native_exit']==0 and receipt['counts']=={'executed':166,'passed':166,'failed':0,'skipped':0,'todo':0}
assert receipt['environment']['SUPABASE_TEST_REQUIRED']=='1' and receipt['tested_sources_stable']
assert receipt['before']['changed_test_sha256']==receipt['after']['changed_test_sha256']==expected
assert review['result']=='cleared' and review['effort']=='high' and review['changed_test_sha256']==expected
assert sha(E/'documents-authorization-races.log')==receipt['raw_log_sha256']
fullpath=pathlib.Path(receipt['full_native_receipt']['local_path'].replace('\\\\','/'));assert sha(fullpath)==receipt['full_native_receipt']['sha256']
newcase=[a for suite in runtime['testResults']for a in suite['assertionResults']if '20-P0-02-MEMBERSHIP-REMOVE-001' in a['title']]
assert len(newcase)==1 and newcase[0]['status']=='passed';title=newcase[0]['title'];line=next(n for n,s in enumerate(file.read_text(encoding='utf-8-sig').splitlines(),1)if 'it("'+title+'"' in s)
caseid='E20-API-'+hashlib.sha256((changed+'::'+title).encode()).hexdigest()[:12];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
prov={'execution_base_sha':receipt['before']['commit'],'execution_tree':'dirty-test-tree','tested_file_sha256':expected,'tested_file_hashes_sha256':receipt['before']['tested_file_hashes_sha256'],'committed_identical_blob_sha':git('rev-parse',commit+':'+changed),'committed_identical_at_sha':commit,'clean_committed_sha_replay':False,'required_counts':receipt['counts'],'native_exit':0,'test_duration_ms':newcase[0]['duration'],'native_receipt_ref':str((E/'documents-authorization-races.native.json').relative_to(R)).replace('\\','/'),'native_receipt_sha256':sha(E/'documents-authorization-races.native.json'),'vitest_ref':str((E/'documents-authorization-races.vitest.json').relative_to(R)).replace('\\','/'),'vitest_sha256':sha(E/'documents-authorization-races.vitest.json'),'raw_log_sha256':receipt['raw_log_sha256'],'full_native_receipt':receipt['full_native_receipt'],'narrow_review_ref':str((E/'narrow-review.json').relative_to(R)).replace('\\','/'),'narrow_review_sha256':sha(E/'narrow-review.json'),'assessor':'/root/epic20_trace/sensitive_trace','assessor_model':'gpt-6.1-sol','assessor_effort':'high','coverage_disposition':'20-P0-02 FULL; previously missing same-token active membership DELETE variant is executed'}
catalog=read(O/'discovered-tests.json');mapping=read(O/'mapping-input.json');matrix=read(O/'coverage-matrix.json');gate=read(O/'gate-decision.json');summary=read(O/'e2e-trace-summary.json');integrity=read(O/'evidence-integrity.json')
oldgate=gate.copy();already=any(t['id']==caseid for t in catalog['tests'])
# Preserve earlier test identities and historical c65 lines; only the new case gets iter1 execution provenance.
evidence_ref='E8ITER1';catalog['evidence_index'][evidence_ref]=str((E/'documents-authorization-races.vitest.json').relative_to(R)).replace('\\','/')
if not already:catalog['tests'].append({'id':caseid,'title':title,'file':changed,'line':line,'level':'api','status':'active','execution_status':'passed','skipped':False,'pending':False,'fixme':False,'evidence_ref':evidence_ref,'project':'','execution_provenance_ref':'iteration1'})
catalog['source_sha']=head;catalog['execution_provenance_index']={'baseline':{'tested_product_sha':catalog['tested_product_sha']},'iteration1':prov};catalog['default_execution_provenance_ref']='baseline';catalog['inventory_scope']='607 unique mapped Epic20 test cases; original676-case discovery excludes70unmapped records, then iteration1 adds exactly one scoped regression.'
catalog['identity_rule']='Full canonical identity fields stored once. Resolve evidence_ref through evidence_index and execution_provenance_ref through execution_provenance_index; old cases inherit baseline c65 execution, new case uses dirty b7f01bb3 plus verified hash.'
closed_note='Iteration1 same-token ACTIVE membership DELETE regression passes: before-state authorized data/signing; one committed active membership removed; unchanged unexpired token still authenticates; subsequent global/context/entity reads and separate open/refresh deny without new URL/data/audit. Actual dirty b7f01bb3 plus eab6b291 test hash matches committed80fdaef7 bytes; no clean-SHA/browser replay claimed.'
def update(req):
 if req['id'] in ['20-P0-02','20.1-AC3','20.1-AC7','20.1-AC10']:
  if not any(t['id']==caseid for t in req['tests']):req['tests'].append({'id':caseid,'level':'api'})
  req['evidence_notes']=closed_note
 if req['id']=='20-P0-02':req['coverage']='FULL';req['gap']=''
for req in matrix['requirements']:update(req)
for key in ['formal_acceptance_criteria','approved_design_families']:
 for req in mapping[key]:update(req)
def stats(items):
 return {'total_requirements':len(items),'fully_covered':sum(x['coverage']=='FULL'for x in items),'partially_covered':sum(x['coverage']=='PARTIAL'for x in items),'uncovered':sum(x['coverage']=='NONE'for x in items),'overall_coverage_percentage':round(sum(x['coverage']=='FULL'for x in items)/len(items)*100),'priority_breakdown':{p:{'total':sum(x['priority']==p for x in items),'covered':sum(x['priority']==p and x['coverage']=='FULL'for x in items),'percentage':round(sum(x['priority']==p and x['coverage']=='FULL'for x in items)/sum(x['priority']==p for x in items)*100)if any(x['priority']==p for x in items)else 100}for p in ['P0','P1','P2','P3']}}
matrix['coverage_statistics']=stats(matrix['requirements']);matrix['formal_ac_statistics']=stats(mapping['formal_acceptance_criteria']);matrix['design_family_statistics']=stats(mapping['approved_design_families'])
for key,items in matrix['gap_analysis'].items():matrix['gap_analysis'][key]=[r for r in items if r['id']!='20-P0-02']
matrix['blockers']=[x for x in matrix['blockers']if x['id']!='20-P0-02'];matrix['recommendations']=[x for x in matrix['recommendations']if x['requirements']!=['20-P0-02']]
heur=matrix['coverage_heuristics'];heur['auth_negative_path_gaps']=[];heur['counts']['auth_missing_negative_paths']=0
if not any(t['id']==caseid for t in matrix['test_inventory']['tests']):matrix['test_inventory']['tests'].append({'id':caseid,'level':'api'})
matrix['test_inventory']['summary']['cases']=607;matrix['test_inventory']['summary']['by_level']['api']['tests']=184
matrix['source_sha']=head;matrix['live_evidence']['current_source_sha']=head;matrix['generated_at']=now;matrix['iteration']=1;matrix['iteration1_evidence']=prov
s=matrix['coverage_statistics'];p=s['priority_breakdown'];decision='FAIL'if p['P0']['percentage']<100 or s['overall_coverage_percentage']<80 or p['P1']['percentage']<80 else 'PASS'if p['P1']['percentage']>=90 else 'CONCERNS'
assert decision=='PASS'
coverage={'inventory':{'covered':s['fully_covered'],'total':s['total_requirements'],'pct':s['overall_coverage_percentage']},'priority_breakdown':{k:{'total':v['total'],'covered':v['covered'],'pct':v['percentage']}for k,v in p.items()},'by_level':matrix['test_inventory']['summary']['by_level']}
rationale='P0 FULL coverage32/32 (100%), P1 FULL36/38 (95%), overall77/81 (95%) meet installed100%/90%/80% thresholds. Iteration1 closes20-P0-02 using the passing same-token active membership DELETE read/open/refresh regression. Actual166/166 REQUIRED integration0skip and narrow High clearance bind dirty b7f01bb3 plus test SHA256eab6b291, identical to the committed80fdaef7 blob; no clean committed-SHA replay is claimed. Four remaining partial/optional items remain explicit; coverage PASS grants no release/review clearance or waiver.'
criteria={'p0_coverage_required':'100%','p0_coverage_actual':'100%','p0_status':'MET','p1_coverage_target':'90%','p1_coverage_minimum':'80%','p1_coverage_actual':'95%','p1_status':'MET','overall_coverage_minimum':'80%','overall_coverage_actual':'95%','overall_status':'MET'}
remaining=[x['id']for x in matrix['requirements']if x['coverage']!='FULL'];assert remaining==['20.1-AC6','20-P1-05','20-P2-09','20-P3-01']
progression=gate.get('gate_progression') or [{'iteration':0,'gate_status':oldgate['gate_status'],'evaluated_at':oldgate['evaluated_at'],'coverage':{'P0':'31/32','P1':'36/38','overall':'76/81'},'critical_gap_ids':['20-P0-02']}]
progression=[x for x in progression if x['iteration']!=1]+[{'iteration':1,'gate_status':'PASS','evaluated_at':now,'coverage':{'P0':'32/32','P1':'36/38','overall':'77/81'},'closed_gap_ids':['20-P0-02'],'execution_provenance':prov}]
gate.update({'evaluated_at':now,'gate_status':decision,'rationale':rationale,'p0_status':'MET','critical_open':0,'coverage':coverage,'uncovered_requirements':remaining,'critical_gap_ids':[],'supplementary_gap_ids':['20-P1-05','20-P2-09','20-P3-01'],'source_sha':head,'gate_iteration':1,'gate_progression':progression,'iteration1_evidence':prov})
summary.update({'snapshot_at':now,'source_sha':head,'coverage':coverage,'gate_status':decision,'gate_criteria':criteria,'risk_summary':{'critical_open':0,'high_open':2,'medium_open':1,'low_open':1},'blockers':matrix['blockers'],'recommendations':matrix['recommendations'],'formal_ac_statistics':matrix['formal_ac_statistics'],'approved_design_statistics':matrix['design_family_statistics'],'gate_iteration':1,'iteration1_evidence':prov})
summary['tests']['cases']=607;summary['heuristics']['auth_negative_path_status']='present';summary['live_evidence']['current_source_sha']=head
integrity['iteration1']=prov;integrity['current_snapshot_sha']=head;integrity['original_snapshot_sha']=integrity['snapshot_sha']
for name,data in [('discovered-tests.json',catalog),('mapping-input.json',mapping),('coverage-matrix.json',matrix),('gate-decision.json',gate),('e2e-trace-summary.json',summary),('evidence-integrity.json',integrity)]:write(O/name,data)
# Retain exact Phase1 checkpoint for deterministic recalculation provenance; normalized joins resolve to catalog.
temp=pathlib.Path(tempfile.gettempdir())/'tea-trace-coverage-matrix-epic20-iteration1.json';write(temp,matrix)
report=O.parent/'epic-20-traceability-report.md';text=report.read_text(encoding='utf-8');front,body=text.split('\n---\n',1)
front=re.sub(r"sourceSha: '[^']*'", "sourceSha: '"+head+"'",front);lines=front.splitlines();seen=set();lines=[x for x in lines if not(x.startswith(('sourceSha:','collectionStatus:'))and(x.split(':',1)[0]in seen or seen.add(x.split(':',1)[0])))]
front='\n'.join(lines).replace("lastStep: 'step-05-gate-decision'","lastStep: 'step-02-apply-edit'")
front=front.replace("'step-05-gate-decision']","'step-05-gate-decision', 'step-01-assess', 'step-02-apply-edit']");front=re.sub(r"tempCoverageMatrixPath: '[^']*'","tempCoverageMatrixPath: '"+str(temp).replace('\\','/')+"'",front)
body=re.sub(r'\*\*Gate: FAIL\.\*\*[^\n]*','**Gate: PASS (iteration1).** '+rationale,body,count=1)
body=body.replace('## Step 2 — Tests and execution provenance','## Step 2 — Original iteration0 tests and execution provenance')
# Current table row replaces missing variant qualification; full historical disposition stays in progression JSON.
body=re.sub(r'\| 20-P0-02 \| P0 \| PARTIAL \|[^\n]*',lambda _: '| 20-P0-02 | P0 | FULL | Current mapping includes '+caseid+'; api/unit/browser | Same-token active membership removal now passes at the checked command/read-model boundary. See iteration1 evidence qualification. |',body)
oldgap='Same-token active membership removal transition is not directly exercised. Disabled membership, primary/child role revocation, multi-role union and initially membershipless actors pass. No product defect is inferred.'
body=body.replace('Missing: '+oldgap,'Iteration1 closure: '+closed_note)
start=body.index('## Step 4 —');end=body.index('### Preserved review and boundary history',start)
body=body[:start]+'''## Iteration1 — Bounded Edit assessment and recalculation

Target confirmed by coordinator: the existing Epic20 report and normalized machine companions. Requested change is only20-P0-02 membership-removal coverage, dependent statistics and gate decision. Sol6.1 High sensitive evidence assessor reused synchronously; no new broad review, test/resource launch, product edit or unrelated inventory expansion.

'''+closed_note+'\n\n'+f"New case `{caseid}` — `{changed}:{line}`; recorded passed1.564s within166/166 REQUIRED integration,0fail/0skip/native0. New case uses explicit iteration1 execution provenance; old cases retain c65c1864 attribution and historical declaration lines. Catalog607cases, including184API; counts overlap with the earlier17-check evidence and are not summed into unique assertions. Scoped lint/nonincremental typecheck pass; their receipts remain in the automation evidence directory.\n\n"+'''| Priority | Total | FULL | Percent |
| --- | ---: | ---: | ---: |
| P0 |32|32|100%|
| P1 |38|36|95%|
| P2 |10|9|90%|
| P3 |1|0|0%|

Full oracle77/81FULL (95%);3PARTIAL,1NONE. Formal24/25 (P0 14/14,P1 10/11) and design53/56 (P0 18/18,P1 26/27) retain separate granularity. Installed deterministic gate: **PASS**. No release/review clearance, waiver, clean80fdaef7 test replay or whole-epic approval is granted.

Remaining gaps are unchanged:20.1-AC6 /20-P1-05 actual effective PostgREST-cap provenance;20-P2-09 representative pilot elapsed/query/candidate/row/memory baseline; optional20-P3-01long-label wrap inspection. Observed1225candidate traversal and bounded queries pass, but do not establish an effective1000row cap. Numeric SLO/code-coverage/burn-in/NFR/test-quality assessments remain unclaimed. Initial iteration0FAIL (P0 31/32) is retained in gate_progression, not erased.

Phase1normalized matrix saved before recalculation; complete mappings and canonical identities remain. Execution evidence is re-runnable static test evidence, not live-only observation, so no live-only cap applies.

'''+body[end:]
body=body.replace('1. Coordinator routes bounded20-P0-02 membership-removal regression through a High test author, executes REQUIRED read/open/refresh checks with the retained token and reruns trace.','1. Membership-removal gap is closed by bounded iteration1; coordinator retains responsibility for any required final committed-revision replay.')
body=body.replace('All files are local uncommitted trace artifacts.','Earlier trace artifacts are committed history; this bounded update remains uncommitted.')
body=body.replace('and deterministicFAIL were checked.','and original deterministicFAIL were checked; iteration1 recalculation now validatesPASS.')
body=body.replace('only606unique mapped Epic20 cases','607unique mapped Epic20 cases').replace('but70unmapped records are omitted.','70unmapped records are omitted and iteration1 adds one scoped regression.').replace('and76/81FULL statistics are unchanged.','and original76/81FAIL history are retained; iteration1 is77/81FULL/PASS.')
body=body.replace('run the five generation/validation scripts in their documented order, then compact-artifacts.py.','run the original generation/validation scripts, update-iteration1.py, then compact-artifacts.py.')
report.write_text(front+'\n---\n'+body,encoding='utf-8')
check=O/'validation-checklist.md';ct=check.read_text(encoding='utf-8');ct+='\n## Iteration1 bounded Edit validation\n\n- [x] Existing target/change confirmed by root; Edit steps loaded and only requested coverage recalculation applied.\n- [x] New single test ID/catalog record mapped to20-P0-02 and20.1AC3/7/10; all other mappings/gaps preserved.\n- [x] Dirty tested hash equals committed80fdaef7 blob/current file; native/raw/full-receipt hashes and166/166 REQUIRED0skip verified.\n- [x] Sol6.1 High assessor confirms closure; no clean-SHA/browser/whole-epic claim.\n- [x] PASS:32/32P0,36/38P1,77/81overall; initialFAIL history retained; no waiver.\n'
if '## Iteration1 bounded Edit validation'not in check.read_text(encoding='utf-8'):check.write_text(ct,encoding='utf-8')
assert len(catalog['tests'])==607 and len(matrix['requirements'])==81
print(json.dumps({'gate':decision,'coverage':coverage['inventory'],'P0':coverage['priority_breakdown']['P0'],'remaining':remaining,'new_case':caseid,'current_source':head,'evidence_tree':'dirty b7f01bb3 + verified eab6b291 hash, not clean80fdaef7 execution'}))
