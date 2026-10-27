import ast,hashlib,json,sys
from pathlib import Path
BASE=Path(r'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas')
OUT=Path(__file__).resolve().parent
P=BASE/'.env.epic15.mail-runtime/story-15-5-preparation/post-f1-targeted-terminal-diagnostic-preparation'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_bytes())
def checkref(r):
 raw=(BASE/r['path']).read_bytes();assert len(raw)==r['bytes'] and sha(raw)==r['sha256'];return r
expected={'manifest.json':(1590,'fe8c36df94f39e4e48905390bec4791b148d4c14659bd971fbb0ec1e1e279b98'),'targeted-diagnostic-operator.py':(24060,'560b3accc66323a853b36a57d09fc12c1cc4dbc97059b705c15b79da59b4c559'),'test_targeted_diagnostic.py':(14937,'8c7bd578b913adbdcf12b3e7462623d831966373ad906c606473240cab9534b0'),'preparation.json':(11742,'c93f6894b7350bc132efc2912e96f1417c687702960c4e6f143d58018da43021'),'bindings.json':(41758,'f7333652de4238ee8ce984df97d6e7afc5bfc2c2bc30f8e65c7e4b9024c51741'),'delta-proof.json':(3463,'1a9b5134cbc7aac9f852f95f1d91c1a39a508dd07041f2c788b149ff7fc3d471')}
prepared=[]
for name,(size,digest) in expected.items():prepared.append(checkref({'path':(P/name).relative_to(BASE).as_posix(),'bytes':size,'sha256':digest}))
manifest=read(P/'manifest.json');assert len(manifest['files'])==5
for r in manifest['files']:checkref(r)
b=read(P/'bindings.json');refs=[checkref(r) for r in b['input_refs']]
rows=b['rows'];assert len(rows)==74 and len({r['path']for r in rows})==74
for row in rows:
 raw=(BASE/row['path']).read_bytes();clean=raw.replace(b'\r\n',b'\n')
 assert len(raw)==row['raw_bytes'] and sha(raw)==row['raw_sha256']
 assert len(clean)==row['clean_bytes'] and sha(clean)==row['clean_sha256']
 assert hashlib.sha1(b'blob '+str(len(clean)).encode()+b'\0'+clean).hexdigest()==row['git_blob_source_and_metadata_HEAD']
 assert len(raw.decode('utf8').splitlines())==row['line_count']
nudge=rows[-1];assert nudge['path']=='tests/integration/notifications/time-report-nudge-producer.int.test.ts' and nudge['line_count']==497 and nudge['raw_sha256']=='5a8eb88f239a71d4a4f9754d36c8a264c640b533a779d0fa68ec81d0440c95cb'
old=(BASE/b['input_refs'][0]['path']).read_text(encoding='utf8');new=(P/'targeted-diagnostic-operator.py').read_text(encoding='utf8')
def spans(s):return {n.name:ast.get_source_segment(s,n) for n in ast.parse(s).body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
a,c=spans(old),spans(new);ds=read(P/'delta-proof.json')['byte_identical_spans'];assert len(ds)==10
for d in ds:
 n=d['name'];assert a[n]==c[n] and len(c[n].encode())==d['utf8_bytes'] and sha(c[n].encode())==d['sha256']==b['spans_reused'][n]['source_sha256']
packet=BASE/'.env.epic15.mail-runtime/story-15-5-preparation/checkpoint-ce1943e0-ci-independent';pm=read(packet/'manifest.json');assert len(pm['files'])==21
for r in pm['files']:checkref(r)
ns=next(n for n in ast.parse(new).body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name)and t.id=='ARTIFACTS'for t in n.targets));specs=ast.literal_eval(ns.value)
listing=read(packet/'artifact-list-projection.json')['artifacts']
for spec in specs:
 p=read(packet/(spec['name']+'-projection.json'));art=next(x for x in listing if x['id']==spec['id'])
 assert all(p[k]==spec[k] for k in ('archive_bytes','archive_sha256','member','member_bytes','member_sha256'))
 assert art['name']==spec['name'] and art['qualified_for_single_download'] is True and art['run_head_bound'] is True and art['expired'] is False and art['digest']=='sha256:'+spec['archive_sha256'] and art['advertised_bytes']==spec['archive_bytes']
prior=BASE/'_bmad-output/auto-bmad/preparation/story-15-5/post-f1-terminal-operator-source-review'
checkref({'path':(prior/'manifest.json').relative_to(BASE).as_posix(),'bytes':1842,'sha256':'1fbb88ac7b8b6d58faf89322c396fa9f6247eac1de8fdd4d719def65abd07e23'})
for r in read(prior/'manifest.json')['members']:checkref({**r,'path':(prior/r['path']).relative_to(BASE).as_posix()})
activation=BASE/'.env.epic15.mail-runtime/story-15-5-preparation/post-f1-targeted-terminal-diagnostic-activation.json';future=BASE/'.env.epic15.mail-runtime/story-15-5-preparation/checkpoint-ce1943e0-targeted-diagnostic'
assert not activation.exists() and not future.exists()
record={'status':'PASS_BINDINGS','phase':sys.argv[1],'prepared':prepared,'input_refs_verified':len(refs),'current_source_rows':74,'raw_clean_computed_blob_checks':222,'Git_object_source_pushed_current_checks_reused_from_bound_author_proof':b['read_only_Git_check'],'reused_spans':ds,'old_packet_members_including_manifest':22,'prior_review_manifest_reverified':True,'exact_artifact_specs_match_old_qualified_projections':True,'activation_absent':True,'future_output_absent':True,'API_GETs':0,'native_acquisition':0}
with (OUT/('bindings-'+sys.argv[1]+'.json')).open('x',encoding='utf8')as f:json.dump(record,f,indent=2);f.write('\n')
print(json.dumps({k:v for k,v in record.items()if k not in ['prepared','reused_spans']}))