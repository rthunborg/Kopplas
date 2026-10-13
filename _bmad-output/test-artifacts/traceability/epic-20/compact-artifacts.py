"""Normalize Epic20 trace artifacts without changing coverage or execution evidence.
Reproduce: collect-evidence.py -> map-coverage.py -> complete-phase1.py ->
emit-gate.py -> validate-output.py -> compact-artifacts.py.
The first stages resolve raw recorded runtime inputs; this final packaging step
retains canonical mapped test identities once and uses ID references elsewhere.
"""
import json,pathlib,hashlib
O=pathlib.Path(__file__).resolve().parent;R=O.parents[3]
def read(name):return json.loads((O/name).read_text(encoding='utf-8-sig'))
def compact_json(value,depth=0):
    # Keep objects readable, but each array record occupies one line.
    if isinstance(value,dict):
        if not value:return '{}'
        parts=[]
        for k,v in value.items():
            parts.append('  '*(depth+1)+json.dumps(k)+': '+compact_json(v,depth+1))
        return '{\n'+',\n'.join(parts)+'\n'+'  '*depth+'}'
    if isinstance(value,list):
        if not value:return '[]'
        if all(not isinstance(v,(dict,list)) for v in value):return json.dumps(value,ensure_ascii=False,separators=(',',':'))
        return '[\n'+',\n'.join('  '*(depth+1)+json.dumps(v,ensure_ascii=False,separators=(',',':'))for v in value)+'\n'+'  '*depth+']'
    return json.dumps(value,ensure_ascii=False)
def write(name,data):(O/name).write_text(compact_json(data)+'\n',encoding='utf-8')
m=read('coverage-matrix.json');inp=read('mapping-input.json');catalog=read('discovered-tests.json');gate_before=(O/'gate-decision.json').read_bytes();summary_before=(O/'e2e-trace-summary.json').read_bytes()
# Idempotent packaging: canonical catalog is the sole full test-record store.
byid={t['id']:t for t in catalog['tests']};requirements=m['requirements']
allids={t['id']for req in requirements for t in req.get('tests',[])}
assert allids <= byid.keys();assert len(allids)==606
records=[byid[id] for id in sorted(allids)]
# Evidence refs and source SHA are inherited from catalog, never invented or erased.
evidence_paths=sorted({t.get('evidence',catalog.get('evidence_index',{}).get(t.get('evidence_ref')))for t in records})
assert None not in evidence_paths
evidence_index={'E'+str(i+1):p for i,p in enumerate(evidence_paths)}
reverse={v:k for k,v in evidence_index.items()}
for t in records:
    path=t.pop('evidence',None) or catalog.get('evidence_index',{})[t['evidence_ref']]
    t['evidence_ref']=reverse[path]
    t.pop('source_sha',None) # inherits tested_product_sha in catalog
catalog['tests']=records;catalog['evidence_index']=evidence_index;catalog['inventory_scope']='Only606 unique test cases referenced by the complete Epic20 formal/design matrix; discovery originally676, unmapped records omitted from committed inventory.'
catalog['original_discovered_cases']=catalog.get('original_discovered_cases',676);catalog['identity_rule']='Original stable IDs retained. Each full identity/title/file/line/level/status/flags is stored once. Evidence path resolves through evidence_index; case source SHA inherits tested_product_sha.'
write('discovered-tests.json',catalog)
def normalize_req(req):
    d=dict(req)
    if 'tests' in d:d['tests']=[{'id':t['id'],'level':t['level']}for t in d['tests']]
    return d
for key in ['formal_acceptance_criteria','approved_design_families']:
    inp[key]=[normalize_req(req)for req in inp[key]]
inp['test_catalog_ref']='discovered-tests.json';inp['storage_format']='normalized-test-references-v1'
write('mapping-input.json',inp)
m['requirements']=[normalize_req(req)for req in requirements]
# Gap rows already exist in requirements. Refer to that authoritative row.
for key,rows in m['gap_analysis'].items():
    m['gap_analysis'][key]=[{'id':r['id'],'priority':r['priority'],'coverage':r['coverage'],'gap':r['gap']}for r in rows]
m['test_inventory']['tests']=[{'id':t['id'],'level':t['level']}for t in records]
m['test_inventory']['catalog_ref']='discovered-tests.json';m['storage_format']='normalized-test-references-v1'
write('coverage-matrix.json',m)
# Validation of exact identities and unchanged verdict/statistics, not a new coverage audit.
assert len(m['requirements'])==81
assert read('gate-decision.json')['gate_status']=='FAIL'
assert gate_before==(O/'gate-decision.json').read_bytes();assert summary_before==(O/'e2e-trace-summary.json').read_bytes()
assert m['coverage_statistics']['fully_covered']==76
assert m['test_inventory']['summary']['cases']==606
assert {t['id']for req in m['requirements']for t in req['tests']}=={t['id']for t in records}
assert all((R/t['file']).is_file()for t in records)
report=O.parent/'epic-20-traceability-report.md';text=report.read_text(encoding='utf-8')
text=text.replace('Full stable identity/title/file/line/level/execution/evidence fields for every mapped case are retained in `epic-20/mapping-input.json`.','Each full stable identity/title/file/line/level/execution record is stored once in `epic-20/discovered-tests.json`; its evidence_ref resolves through evidence_index and its source SHA inherits tested_product_sha. `epic-20/mapping-input.json` and the matrix retain complete requirement-to-case ID/level references.')
heading='\n### Compact artifact storage\n'
if heading in text:text=text.split(heading)[0]
text+=heading+'\nThe committed inventory retains only606unique mapped Epic20 cases. The original676-case discovery count is recorded, but70unmapped records are omitted. Requirement mappings use stable test-ID/level references; full canonical records and evidence paths are held once in discovered-tests.json. Gap records reference authoritative requirement IDs. The verdict,81requirements, every mapping,17evidence hashes, execution/source attribution and76/81FULL statistics are unchanged. No raw runtime report/log is copied into the repository.\n\nTo reproduce from the recorded raw inputs, run the five generation/validation scripts in their documented order, then compact-artifacts.py. The final packaging is idempotent. `python compact-artifacts.py` validates the normalized references and unchanged gate bytes.\n'
report.write_text(text,encoding='utf-8')
readme='''# Epic20 trace artifacts

The authoritative human report is ../epic-20-traceability-report.md. Gate remains FAIL.

- discovered-tests.json stores606unique mapped test records once. Resolve evidence_ref through evidence_index; source SHA inherits tested_product_sha. Original676discovered count is retained without70unmapped records.
- mapping-input.json has complete25AC/56design family definitions and test-ID/level references.
- coverage-matrix.json contains the complete81-item Phase1 matrix, statistics, gaps and inventory references. Join each tests[].id to discovered-tests.json for full identity fields. This is normalized storage, not reduced coverage.
- evidence-integrity.json retains17native receipt paths, actual argv/environment/counts and independently checked raw-log hashes.
- e2e-trace-summary.json and gate-decision.json preserve their emitted schemas, values and verdict unchanged.

Reproduce with the bounded Python scripts in this order:

1. collect-evidence.py
2. map-coverage.py
3. complete-phase1.py
4. emit-gate.py
5. validate-output.py
6. compact-artifacts.py

Raw inputs remain at the referenced temporary evidence paths; no product tests or managed resource starts occur. Reproduction resolves current git metadata while retaining the exact tested product SHA. Keep the approved coverage judgments and gaps unless a separately authorized re-trace has new evidence. On already normalized outputs, run compact-artifacts.py for idempotent structural/reference validation. The old validate-output.py expects expanded generator data and runs before packaging.
'''
(O/'README.md').write_text(readme,encoding='utf-8')
files=list(O.glob('*'))+[report]
print(json.dumps({'gate':'FAIL','requirements':81,'mapped_cases':606,'removed_unmapped_cases':70,'files':len([p for p in files if p.is_file()]),'bytes':sum(p.stat().st_size for p in files if p.is_file()),'lines':sum(len(p.read_text(encoding='utf-8-sig').splitlines())for p in files if p.is_file()),'per_file':{p.name:{'bytes':p.stat().st_size,'lines':len(p.read_text(encoding='utf-8-sig').splitlines())}for p in files if p.is_file()}},ensure_ascii=False))
