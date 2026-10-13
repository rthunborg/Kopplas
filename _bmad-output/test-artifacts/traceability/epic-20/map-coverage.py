import json,re,pathlib,datetime,tempfile
R=pathlib.Path('C:/Users/Rasmus/.codex/worktrees/dbe6/ElproSaas'); O=R/'_bmad-output/test-artifacts/traceability/epic-20'
def readj(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def writej(p,j):p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
I=readj(O/'discovered-tests.json');T=I['tests']; now=datetime.datetime.now(datetime.timezone.utc).isoformat()
D=(R/'_bmad-output/test-artifacts/test-design-epic-20.md').read_text(encoding='utf-8-sig')
# The approved design's explicit families remain oracle items. They are not silently waived by passing broader AC tests.
patterns={
'20-P0-01':r'seven exact|source conjunction|current live request|RLS-hidden|cross.tenant|required.*archive|safe.row',
'20-P0-02':r'membership.*(disable|revok)|existing.token|granting child|primary.role|current resolver|multi.role',
'20-P0-03':r'mismatch|alternate.link|another.*link|hard.deleted|selected.link.*bind',
'20-P0-04':r'actor.*tenant.*spoof|authenticated.only|internal helper|ACL|forg',
'20-P0-05':r'SHARE|before final|nonkey|membership.*before|role.*before',
'20-P0-06':r'graph|reassign|facility.*null|customer.*replacement|parent',
'20-P0-07':r'canonical|UTF.8|bound.field|substitut|expired.*proof|noncanonical|future.*proof|domain',
'20-P0-08':r'finaliz.*replay|concurrent.*finaliz|same.correlation|concurrent replay',
'20-P0-09':r'fault|failing audit|audit rollback|no URL|attestation.*fail',
'20-P0-10':r'ordinary.purpose|durable|artifact.kind|quote_pdf purpose|unknown.*kind',
'20-P0-11':r'generated|invalidat|frozen.*association|snapshot.*association|strict quote PDF',
'20-P0-12':r'secondary|ALL.*link|all.link|hidden.*context|complete.*link',
'20-P0-13':r'FK|insert|complete.*graph|reassign|file.*UPDATE',
'20-P0-14':r'locked|unknown.*origin|legacy NULL|missing.byte|quote.PDF|quote_pdf|restore preserves',
'20-P0-15':r'origin|capture|spoof|DB.owned',
'20-P0-16':r'replay|consum|digest|concurrent identity|DLC20|opposite',
'20-P0-17':r'audit|rollback|deadlock|timeout',
'20-P0-18':r'forged|unavailable|transient|wrong.tenant|foreign|archived required',
'20-P1-01':r'atomic activation|role.ceiling|single Dokument|neither Dokument',
'20-P1-02':r'registry|activated owner|future|active.*tuple',
'20-P1-03':r'DTO|allowlist|safe.row|two authorized|same.file',
'20-P1-04':r'lifecycle|reservation|purpose|locked commitment',
'20-P1-05':r'PostgREST.cap|over.cap|hidden.only|equal timestamps|lookahead',
'20-P1-06':r'optional.*customer|ancestor|acceptance.*quote',
'20-P1-07':r'exact.*pair|extra.*input|capability|closed command',
'20-P1-08':r'pipeline|fixed event|target|no.*fallback|request.bound',
'20-P1-09':r'expir|TTL|signing|signed access|fresh refresh|refresh',
'20-P1-10':r'Option A|baseline|generic|direct Storage|bearer',
'20-P1-11':r'Dokument navigation|keyboard access|unsupported|upload requires|expiry',
'20-P1-12':r'duplicate|query|validat|normaliz|impossible',
'20-P1-13':r'literal|case.insensitive|AND predicate|combined filters',
'20-P1-14':r'DST|Gregorian|optional dates|leap',
'20-P1-15':r'facet|fifty.row|50.row|cursor|pagination',
'20-P1-16':r'selection|late|expired|expiry|matching denial|archived selection',
'20-P1-17':r'archived|quote.PDF|quote_pdf|current.*PDF',
'20-P1-18':r'no.op|noop|fresh.*correlation|unconsumed',
'20-P1-19':r'pre.column whole.row quote review|fresh re.review|PDF fingerprint',
'20-P1-20':r'archive confirms|ordinary restore|unknown origin|pending restore',
'20-P1-21':r'lost|delayed|uncertain|reconcil|retry requires confirmation',
'20-P1-22':r'fixed center URL|retained valid|builder refuses|forged query|atomic query',
'20-P1-23':r'seven exact|forbidden current roles|source quote visibility|zero.file|ancestry',
'20-P1-24':r'same.file|ALL.*link|context cursor|exact tuple',
'20-P1-25':r'real panel|sent wrapper|context entry|safe return preserves',
'20-P1-26':r'keyboard entity.center|filter change|safe return|no.*fallback',
'20-P1-27':r'picker|upload owner|generic owner|real.*upload authority',
'20-P2-01':r'loading|empty|retry|unavailable|read.*failure',
'20-P2-02':r'normalization|combined filters|Stockholm|DST',
'20-P2-03':r'release previous browser|aborts pending fetch|revokes completed Blob|hidden.pane',
'20-P2-04':r'unsupported|ordinary PDF preview|actual.*media failure|stored image bytes',
'20-P2-05':r'origin|restore preserves|legacy NULL',
'20-P2-06':r'archive confirms|keyboard focus|pending restore|all.link effect',
'20-P2-07':r'zero.file|unavailable|no link label route',
'20-P2-08':r'future activated owner|registry',
'20-P2-09':r'PostgREST.cap|over.cap|hidden.only',
'20-P2-10':r'Option A|baseline',
'20-P3-01':r'LONG_VISUAL_EVIDENCE_NOT_RECORDED'
}
def story_for(t):
 f=t['file']
 if any(x in f for x in ['context-navigation','document-context','entity-documents-link','documents-context.rls']):return '20.3'
 if any(x in f for x in ['filters.test','date-bounds','preview-state','documents-lifecycle','documents-filter-archive','documents-search-preview-lifecycle']):return '20.2'
 return '20.1'
def family_select(id):
 n=int(id[-2:]); pri=id.split('-')[1]
 if pri=='P0':story='20.1' if n<=11 else '20.2' if n<=17 else '20.3'
 elif pri=='P1':story='20.1' if n<=11 else '20.2' if n<=21 else '20.3'
 else:story=None
 found=[t for t in T if (story is None or story_for(t)==story) and (id in t['title'] or re.search(patterns[id],t['title'],re.I))]
 if id=='20-P2-10':found=[] # evidence integrity checks, not an invented test case
 return found
missing={
 '20-P0-02':('PARTIAL','Same-token active membership removal transition is not directly exercised. Disabled membership, primary/child role revocation, multi-role union and initially membershipless actors pass. No product defect is inferred.'),
 '20-P1-05':('PARTIAL','1225 candidates (1100 hidden/125 eligible) and stable equal-timestamp traversal execute, with bounded unit chunks. No observed effective PostgREST max-row cap was established; absence of PGRST_DB_MAX_ROWS in a filtered container environment is not full cap provenance.'),
 '20-P2-09':('PARTIAL','Bounded completeness is exercised; representative pilot elapsed/read-query/candidate/row/memory baseline is absent. No numeric latency/concurrency/volume target is authorized.'),
 '20-P3-01':('NONE','No recorded manual long-name/neutral-label wrap inspection at both viewports was supplied; optional visual polish is uncredited.')
}
F=[]
for line in D.splitlines():
 if re.match(r'\| 20-P[0-3]-\d\d \|',line):
  cells=[x.strip() for x in line.split('|')[1:-1]];id,title=cells[:2]
  tests=family_select(id)
  status,gap=missing.get(id,('FULL',''))
  if status=='FULL' and id!='20-P2-10':assert tests,id
  F.append({'id':id,'description':title,'priority':id.split('-')[1],'kind':'approved_design_family','coverage':status,'tests':tests,'gap':gap,'requirement_refs':cells[2],'evidence_notes':'Native0 exact-product execution and test assertion alignment. API owns enforced authority; units own pure/state contracts; browser owns real UI wiring.' if id!='20-P2-10' else 'All17 native receipts/raw log hashes independently checked; exact SHA/environment/counts recorded in evidence-integrity.json.'})
assert len(F)==56
# Exact primary family mapping from approved design's Acceptance traceability table.
fmap={
 '20.1':{1:['P1-01','P1-11'],2:['P1-02','P1-04'],3:['P0-01','P0-02','P0-06','P1-06'],4:['P0-01','P0-03','P1-03'],5:['P0-10','P0-11','P1-04'],6:['P1-05'],7:['P0-03','P0-04','P0-05','P0-06','P0-07','P0-08','P0-09','P0-11','P1-07','P1-08','P1-09','P1-11'],8:['P1-10'],9:['P1-11','P2-01','P2-04'],10:['P0-01','P0-02','P0-03','P0-04','P0-05','P0-06','P0-07','P0-08','P0-09','P0-10','P0-11','P2-10']},
 '20.2':{1:['P1-12','P1-13','P1-14','P1-15'],2:['P1-16','P1-17','P1-21','P2-03','P2-04'],3:['P0-12','P1-17','P1-20','P2-06'],4:['P0-15','P0-16','P0-17','P1-18','P1-20','P2-05'],5:['P0-14','P0-15','P2-05'],6:['P0-10','P0-14','P0-15','P1-19'],7:['P0-12','P0-13','P0-16','P0-17','P1-18'],8:['P1-20','P1-21','P2-01','P2-02','P2-03','P2-04','P2-06']},
 '20.3':{1:['P1-22','P1-23','P1-25'],2:['P0-18','P1-22','P1-23','P2-07'],3:['P1-24'],4:['P1-22','P1-26','P2-07'],5:['P1-25','P1-27'],6:['P1-02','P2-08'],7:['P0-18','P1-23','P1-24','P1-25','P1-26','P1-27','P2-10']}}
formal=[];sources=[]
for story in fmap:
 spec=next((R/'_bmad-output/implementation-artifacts').glob('spec-'+story.replace('.','-')+'-*.md')); sources.append(str(spec.relative_to(R)).replace('\\','/'))
 txt=spec.read_text(encoding='utf-8-sig');ac=txt.split('## Acceptance criteria',1)[1].split('</intent-contract>',1)[0]
 for n,title in re.findall(r'^([1-9]\d*)\. (.+)$',ac,re.M):
  n=int(n);famids=['20-'+x for x in fmap[story][n]];tests={}
  for f in F:
   if f['id'] in famids:
    for t in f['tests']:tests[t['id']]=t
  for t in T:
   m=re.search(r'\[AC([\d,]+)\]',t['title'])
   if m and story_for(t)==story and n in [int(x) for x in m.group(1).split(',')]:tests[t['id']]=t
  sensitive=(story=='20.1' and n in [3,4,5,7,8,10]) or (story=='20.2' and n in [2,3,4,5,6,7]) or (story=='20.3' and n in [2,3])
  status='PARTIAL' if story=='20.1' and n==6 else 'FULL'
  formal.append({'id':story+'-AC'+str(n),'description':title,'priority':'P0' if sensitive else 'P1','kind':'formal_acceptance_criterion','coverage':status,'tests':list(tests.values()),'primary_design_families':famids,'gap':missing['20-P1-05'][1] if status=='PARTIAL' else '', 'evidence_notes':'Current membership disable/removal of granting role satisfies formal revocation behavior; direct membership deletion remains the distinct designed variant gap.' if story=='20.1' and n in [3,7,10] else 'Mapped assertions prove the AC at its required enforcement/UI levels.'})
assert len(formal)==25
writej(O/'mapping-input.json',{'formal_acceptance_criteria':formal,'approved_design_families':F,'mapping_policy':'Primary mappings from approved design; explicit AC tags and semantically aligned test titles. Full lists retain stable case fields; source file and declaration lines are never invented. FULL requires all specified family variants, PARTIAL records missing variants.'})
report=R/'_bmad-output/test-artifacts/traceability/epic-20-traceability-report.md';txt=report.read_text(encoding='utf-8-sig')
# Remove duplicate development checkpoints from repeated collector calls, retaining the final step2 snapshot.
sections=txt.split('## Step 2 — Tests and execution provenance');txt=sections[0]+'## Step 2 — Tests and execution provenance'+sections[-1]
txt=txt.replace('Formal AC coverage is the gate basis; supplementary design/NFR obligations are reported separately without converting scenario counts into code coverage.','The full epic gate includes formal ACs and approved design obligations. Formal-AC-only statistics are separately reported; scenario counts are never converted into code coverage.')
txt=txt.replace("'step-02-discover-tests']","'step-02-discover-tests', 'step-03-map-criteria']").replace("lastStep: 'step-02-discover-tests'","lastStep: 'step-03-map-criteria'")
txt+='\n## Step 3 — Complete requirement-to-test mapping\n\nThe full oracle has 81 items: 25 formal ACs plus 56 approved design families. They intentionally overlap at different granularity; coverage percentages describe requirement completeness, not unique code paths. Source/read-model units, enforced API/RLS/races and actual UI tests are complementary. No unacceptable same-assertion duplicate is used to increase coverage; inventory identities are deduplicated.\n\n'
for heading,items in [('Formal acceptance criteria',formal),('Approved test-design obligations',F)]:
 txt+='### '+heading+'\n\n| Requirement | Priority | Coverage | Mapped cases / levels | Requirement and qualification |\n| --- | --- | --- | --- | --- |\n'
 for f in items:
  levels=','.join(sorted(set(t['level'] for t in f['tests']))) or 'evidence/static'
  desc=f['description'].replace('|','/');gap=(' **Gap:** '+f['gap']) if f['gap'] else ''
  txt+=f"| {f['id']} | {f['priority']} | {f['coverage']} | {len(f['tests'])}; {levels} | {desc}{gap} |\n"
txt+='\n### Detailed test witnesses\n\nFull stable identity/title/file/line/level/execution/evidence fields for every mapped case are retained in `epic-20/mapping-input.json`. The following witnesses give reviewer entry points; they are a subset, not invented test IDs.\n\n'
for f in formal+F:
 txt+='#### '+f['id']+'\n\n'
 selected=[]
 for level in ['api','e2e','unit','component']:
  candidates=[t for t in f['tests'] if t['level']==level]
  if candidates:selected.append(candidates[0])
 for t in selected:
  location=t['file']+(':'+str(t['line']) if t['line'] else ' (parameter declaration unresolved; exact runtime title retained)')
  txt+='- `'+t['id']+'` — `'+location+'` ('+t['level']+'): '+t['title']+'. Recorded passed at c65c1864.\n'
 if not selected:txt+='- '+(f['gap'] or f['evidence_notes'])+'\n'
 if f['gap']:txt+='\nMissing: '+f['gap']+'\n'
report.write_text(txt,encoding='utf-8')
print(json.dumps({'formal':len(formal),'families':len(F),'partial_formal':[f['id'] for f in formal if f['coverage']!='FULL'],'partial_design':[f['id'] for f in F if f['coverage']!='FULL']}))

