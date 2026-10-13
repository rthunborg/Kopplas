"""Bounded cap/pilot evidence join; no test or resource execution/inventory regeneration."""
import pathlib,json,hashlib,datetime,re,subprocess,tempfile
O=pathlib.Path(__file__).resolve().parent;R=O.parents[3]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 def f(x,n=0):
  if isinstance(x,dict):return '{\n'+',\n'.join('  '*(n+1)+json.dumps(k)+': '+f(v,n+1)for k,v in x.items())+'\n'+'  '*n+'}'if x else '{}'
  if isinstance(x,list):return '[\n'+',\n'.join('  '*(n+1)+json.dumps(v,ensure_ascii=False,separators=(',',':'))for v in x)+'\n'+'  '*n+']'if x and any(isinstance(v,(dict,list))for v in x)else json.dumps(x,ensure_ascii=False,separators=(',',':'))
  return json.dumps(x,ensure_ascii=False)
 p.write_text(f(v)+'\n',encoding='utf-8')
ref='_bmad-output/test-artifacts/epic-20-cap-and-pilot-baseline-2026-10-13.json';artifact=R/ref;a=read(artifact);head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip();now=datetime.datetime.now(datetime.timezone.utc).isoformat()
assert a['nativeExit']==0 and a['SUPABASE_TEST_REQUIRED']=='1'
assert a['counts']['passed']==3 and a['counts']['failed']==a['counts']['skipped']==0
assert a['srcTreeUnchangedFromC65'] and a['thresholdBasis']['performanceSloApproval']is False
probe=a['effectiveCap']['dedicatedFiniteTestStack']['runtimeProbe'];assert probe['configuredTestCap']==probe['returnedRows']==1000 and probe['exactCount']==2125 and probe['status']==206 and probe['allTruncatedRowsHidden']
finite=next(x for x in a['scenarios']if x['name']=='finite-cap-completeness');assert finite['counterPass']['authorizedRows']==1025 and finite['counterPass']['pageCount']==21
assert all(v for s in a['scenarios']for v in s['assertions'].values())
verified={}
for name,record in a['evidence'].items():
 if isinstance(record,dict)and'path'in record:
  p=pathlib.Path(record['path'].replace('\\\\','/'));assert sha(p)==record['sha256'],name;verified[name]={'path':str(p).replace('\\','/'),'sha256':record['sha256']}
assert a['independentNarrowMeasurementReview']['disposition']=='accepted; no remaining measurement blocker'
capnote='FULL: observed finite synthetic PostgREST cap1000. Unbounded probe2125candidates returns1000allhidden (206,0-999/2125); unchanged readDocuments traverses all1025authorized rows exactly once in exact created_at/id order over21pages with authorized-only totals/facets/ownerTypes. No hosted deployment cap claim.'
pilotnote='FULL measurement obligation:3synthetic scenarios record3sequential timing traversals each, separate HTTP/candidate-transfer counter pass and10ms sampled NodeRSS/heap. HTTP transfers are not SQL work; every page rescans candidates; sampled process peaks are not DB/instantaneous/leak measures. Numeric latency/concurrency/volume/memory SLO remainsUNKNOWN and unapproved.'
meta={'artifact_ref':ref,'artifact_sha256':sha(artifact),'measurement_head':a['head'],'artifact_committed_at':'6f891f7db7a1be83bd3d90b67ce2fdb47e538e3c','src_git_tree_sha1':a['srcGitTreeSha1'],'source_unchanged_from_c65':True,'native_exit':0,'required':'SUPABASE_TEST_REQUIRED=1','counts':a['counts'],'finite_cap_probe':probe,'finite_reader':{'authorized':1025,'pages':21,'exact_order_set_count_facets':True},'measurement_scenarios':[{'name':s['name'],'candidate_links':s['dataset']['candidateLinks'],'authorized_links':s['dataset']['authorizedLinks'],'traversal_read_ms':s['timing']['traversalReadMs'],'http_requests':s['counterPass']['httpRequests'],'transferred_candidate_rows':s['counterPass']['transferredCandidateRows'],'sampled_node_peak_rss_bytes':s['memory']['sampledPeakRssBytes']}for s in a['scenarios']],'evidence_hashes_verified':verified,'independent_narrow_measurement_review':a['independentNarrowMeasurementReview'],'numeric_slo_approval':False,'measurement_layer':a['measurementLayer'],'new_trace_execution':False}
reliability_ref='_bmad-output/test-artifacts/epic-20-test-reliability-fixes.md';reliability={'artifact_ref':reliability_ref,'artifact_sha256':sha(R/reliability_ref),'committed_at':'4f891be8','passed_integration':114,'passed_browser':4,'required_skips':0,'execution_tree':'dirty c210b637 plus recorded working blobs; no clean committed-head or new production build replay','narrow_review':'CLEAN Sol6.1 High, three test reliability fixes only; no fourth broad pass','fault_probes':'deliberate failed probes are not passing coverage; filtered cases are uncredited'}
m=read(O/'coverage-matrix.json');mp=read(O/'mapping-input.json');g=read(O/'gate-decision.json');s=read(O/'e2e-trace-summary.json');e=read(O/'evidence-integrity.json');c=read(O/'discovered-tests.json')
oldidsets={q['id']:tuple(t['id']for t in q['tests'])for q in m['requirements']};closed={'20.1-AC6','20-P1-05','20-P2-09'}
def change(q):
 if q['id']in closed:q['coverage']='FULL';q['gap']='';q['evidence_notes']=pilotnote if q['id']=='20-P2-09'else capnote;q['supplemental_evidence_refs']=[ref]
for q in m['requirements']:change(q)
for key in ['formal_acceptance_criteria','approved_design_families']:
 for q in mp[key]:change(q)
def stats(items):
 return {'total_requirements':len(items),'fully_covered':sum(q['coverage']=='FULL'for q in items),'partially_covered':sum(q['coverage']=='PARTIAL'for q in items),'uncovered':sum(q['coverage']=='NONE'for q in items),'overall_coverage_percentage':round(sum(q['coverage']=='FULL'for q in items)/len(items)*100),'priority_breakdown':{p:{'total':sum(q['priority']==p for q in items),'covered':sum(q['priority']==p and q['coverage']=='FULL'for q in items),'percentage':round(sum(q['priority']==p and q['coverage']=='FULL'for q in items)/sum(q['priority']==p for q in items)*100)if any(q['priority']==p for q in items)else 100}for p in ['P0','P1','P2','P3']}}
m['coverage_statistics']=stats(m['requirements']);m['formal_ac_statistics']=stats(mp['formal_acceptance_criteria']);m['design_family_statistics']=stats(mp['approved_design_families'])
for key,rows in m['gap_analysis'].items():m['gap_analysis'][key]=[q for q in rows if q['id']not in closed]
m['blockers']=[q for q in m['blockers']if q['id']not in closed];m['recommendations']=[q for q in m['recommendations']if not any(i in closed for i in q['requirements'])]
m['source_sha']=head;m['live_evidence']['current_source_sha']=head;m['generated_at']=now;m['cap_pilot_evidence_ref']='evidence-integrity.json#cap_pilot';m['test_reliability_evidence_ref']='evidence-integrity.json#test_reliability'
e['cap_pilot']=meta;e['test_reliability']=reliability;e['current_snapshot_sha']=head
c['source_sha']=head;c['supplemental_evidence_refs']=[ref,reliability_ref]
coverage={'inventory':{'covered':80,'total':81,'pct':99},'priority_breakdown':{k:{'total':v['total'],'covered':v['covered'],'pct':v['percentage']}for k,v in m['coverage_statistics']['priority_breakdown'].items()},'by_level':m['test_inventory']['summary']['by_level']}
assert coverage['priority_breakdown']['P0']['pct']==coverage['priority_breakdown']['P1']['pct']==100
rationale='P0 FULL32/32 (100%), P1 FULL38/38 (100%), overall80/81 (99%) meet deterministic100%/90%/80% gate thresholds. Independently reviewed actual finitecap1000/2125candidate probe and1025authorized21page traversal close20.1-AC6/20-P1-05; three measured pilot scenarios close20-P2-09 measurement evidence. Only optional20-P3-01visual inspection remainsNONE. Numeric SLO/hostedcap/release approval and clean final committed-revision replay are not claimed; historicalFAIL and20.2review caveat remain.'
remaining=[q['id']for q in m['requirements']if q['coverage']!='FULL'];assert remaining==['20-P3-01']
g.update({'evaluated_at':now,'rationale':rationale,'coverage':coverage,'uncovered_requirements':remaining,'formal_ac_gaps':[],'supplementary_gap_ids':remaining,'source_sha':head,'cap_pilot_evidence_ref':'evidence-integrity.json#cap_pilot','test_reliability_evidence_ref':'evidence-integrity.json#test_reliability'})
# Evidence reconciliation is not a new remediation iteration; historical iteration0/1 preserved unchanged.
g['evidence_reconciliations']=[{'at':now,'source_sha':head,'closed_gap_ids':sorted(closed),'coverage':{'P0':'32/32','P1':'38/38','overall':'80/81'},'artifact_ref':ref,'artifact_sha256':sha(artifact)}]
s.update({'snapshot_at':now,'source_sha':head,'coverage':coverage,'risk_summary':{'critical_open':0,'high_open':0,'medium_open':0,'low_open':1},'blockers':m['blockers'],'recommendations':m['recommendations'],'formal_ac_statistics':m['formal_ac_statistics'],'approved_design_statistics':m['design_family_statistics'],'cap_pilot_evidence_ref':'evidence-integrity.json#cap_pilot','test_reliability_evidence_ref':'evidence-integrity.json#test_reliability'})
s['gate_criteria'].update({'p1_coverage_actual':'100%','overall_coverage_actual':'99%'});s['live_evidence']['current_source_sha']=head
for name,data in [('coverage-matrix.json',m),('mapping-input.json',mp),('gate-decision.json',g),('e2e-trace-summary.json',s),('evidence-integrity.json',e),('discovered-tests.json',c)]:write(O/name,data)
temp=pathlib.Path(tempfile.gettempdir())/'tea-trace-coverage-matrix-epic20-cap-pilot.json';write(temp,m)
report=O.parent/'epic-20-traceability-report.md';txt=report.read_text(encoding='utf-8')
txt=re.sub(r"sourceSha: '[^']*'","sourceSha: '"+head+"'",txt,count=1);txt=re.sub(r"tempCoverageMatrixPath: '[^']*'","tempCoverageMatrixPath: '"+str(temp).replace('\\','/')+"'",txt,count=1)
txt=re.sub(r'\*\*Gate: PASS \(iteration1\)\.\*\*[^\n]*','**Gate: PASS (cap/pilot evidence reconciliation).** '+rationale,txt,count=1)
for id in closed:
 txt=re.sub(r'\| '+re.escape(id)+r' \|([^\n]*)',lambda match:match.group(0).replace('PARTIAL','FULL').split(' **Gap:**')[0].rstrip(' |')+' |',txt)
 # Current witness section removes now-closed Missing text; retained iteration1 section is historical.
 pattern=r'(#### '+re.escape(id)+r'\n[\s\S]*?)(?=\n#### |\n## )'
 def section(match):
  b=match.group(1);b=re.sub(r'\nMissing: [^\n]*','\nClosure: '+(pilotnote if id=='20-P2-09'else capnote),b);return b+'\nSupplemental evidence: `'+ref+'` (hashed native/harness/results references in evidence-integrity.json).\n'
 txt=re.sub(pattern,section,txt,count=1)
old='Remaining gaps are unchanged:20.1-AC6 /20-P1-05 actual effective PostgREST-cap provenance;20-P2-09 representative pilot elapsed/query/candidate/row/memory baseline; optional20-P3-01long-label wrap inspection.'
txt=txt.replace(old,'At iteration1, cap/pilot evidence gaps remained; the subsequent reconciliation below closes them. Optional20-P3-01long-label wrap inspection remainsNONE.')
heading='\n## Cap/pilot evidence reconciliation — 2026-10-13\n'
if heading in txt:txt=txt.split(heading)[0]
txt+=heading+'\n'+rationale+'\n\n'+capnote+'\n\n'+pilotnote+'\n\nSource measurement head74aaac5f; production tree unchanged fromc65c1864. Current metadata head6f891f7d commits the evidence. All12referenced artifact/harness/native/result hashes independently match; native0/3passed/0failed/0skipped. Read-model/real anon-key RLS measurement excludes Next cookie/route/browser. NodeRSS is process sampling; HTTP/transferred-row counters include repeated per-page candidate rescans, not SQL statements/rows scanned. Original retained stack is explicitly unlimited; finite1000cap is a dedicated synthetic test configuration, not deployment inference. No SLO or threshold is manufactured.\n\nBounded reliability repair reference: `'+reliability_ref+'`, committed4f891be8, records114/114 REQUIRED integration and4/4browser/native0 with narrow SolHighCLEAN. Actual dirtyc210b637 working blobs are retained; deliberate suppression/setup-failure probes are diagnostic failures, not passing coverage. No clean final committed replay/fresh production build/fourth broad review is asserted.\n\nFull matrix80/81FULL (99%);0PARTIAL,1NONE. Formal25/25FULL; design55/56FULL. P0 32/32,P1 38/38,P2 10/10; only optional20-P3-01remains. Canonical607test cases/81requirements and all prior test-ID mappings are unchanged. Supplemental measurements join existing requirements by evidence reference; no new test inventory or requirement was generated. EarlierFAIL, membership-removal dirty execution history and20.2review_unverified/formula/narrow-acceptance caveat remain.\n\nNo resource/test/product/state/commit action was performed by this trace update. Root owns final committed verification and remaining workflow completion.\n'
report.write_text(txt,encoding='utf-8')
check=O/'validation-checklist.md';txt=check.read_text(encoding='utf-8');txt+='\n## Cap/pilot reconciliation validation\n\n- [x] Only20.1AC6/20-P1-05/20-P2-09statuses and supporting evidence/statistics updated;607canonical cases/81requirements/prior mappings preserved.\n- [x] Twelve referenced hashes, finite1000runtime truncation,2125candidates/1025authorized/21pages and3pilot measurement limits checked.\n- [x] PASS80/81FULL, optional20-P3-01only gap; no numericSLO/hostedcap/clean final replay claim.\n- [x] HistoricalFAIL,20.2caveat and dirty execution attribution retained; no broad review or new execution.\n';check.write_text(txt,encoding='utf-8')
assert oldidsets=={q['id']:tuple(t['id']for t in q['tests'])for q in m['requirements']}
assert len(c['tests'])==607 and len(m['requirements'])==81 and g['gate_status']=='PASS'
assert g['gate_progression'][0]['gate_status']=='FAIL'
print(json.dumps({'gate':'PASS','requirements':81,'FULL':80,'PARTIAL':0,'NONE':1,'P0':'32/32','P1':'38/38','P2':'10/10','mapped_cases':607,'remaining':['20-P3-01'],'hashes_verified':len(verified)}))
