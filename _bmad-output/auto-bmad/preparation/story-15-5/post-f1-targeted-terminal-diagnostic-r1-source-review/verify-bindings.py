import json,hashlib,ast,sys
from pathlib import Path
b=Path(r"C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas");o=Path(__file__).resolve().parent;p=b/".env.epic15.mail-runtime/story-15-5-preparation/post-f1-targeted-terminal-diagnostic-preparation";r=p/"r1"
sha=lambda x:hashlib.sha256(x).hexdigest()
def read(p):return json.loads(p.read_bytes())
def check(x):
 raw=(b/x['path']).read_bytes();assert len(raw)==x['bytes']and sha(raw)==x['sha256'];return x
expected={'manifest.json':(1367,'6e2697886267ca13db8c3755ac1cb7c9f4e04728401e7a9b823c4e03da0aad9c'),'targeted-diagnostic-r1-operator.py':(29866,'c06fc230aa63feecc1fa076596e4e819e9ed32c96c9c8b81c08310f034377732'),'test_targeted_diagnostic_r1.py':(23398,'d36598e9cc285f851b3e38181a02cab984e5948050c2d07a803f790c7df4530b'),'compact-proof.json':(11028,'035392efac01097760c0bc1bcd7dd9edcf46f4d7e6e1c6bb82d92b56e456b2b2'),'preparation.json':(8342,'a8e135e86fb6d6a71af2ae5b4a4c20b74a2c5c21e20ce91b5d1a47b18323a29a')}
prepared=[check({'path':(r/n).relative_to(b).as_posix(),'bytes':sz,'sha256':h})for n,(sz,h)in expected.items()]
for x in read(r/'manifest.json')['files']:check(x)
proof=read(r/'compact-proof.json')
for x in proof['assessment_refs']:check(x)
for item in proof['old_immutable_verification']:
 check(item['manifest']);m=read(b/item['manifest']['path']);assert len(m['files'])==item['listed_hashes_verified']
 for x in m['files']:check(x)
bind=read(p/'bindings.json')
for x in bind['input_refs']:check(x)
for x in bind['rows']:
 raw=(b/x['path']).read_bytes();clean=raw.replace(b'\r\n',b'\n');assert len(raw)==x['raw_bytes']and sha(raw)==x['raw_sha256']and len(clean)==x['clean_bytes']and sha(clean)==x['clean_sha256'];assert hashlib.sha1(b'blob '+str(len(clean)).encode()+b'\0'+clean).hexdigest()==x['git_blob_source_and_metadata_HEAD']
assert len(bind['rows'])==74
old=(p/'targeted-diagnostic-operator.py').read_text();new=(r/'targeted-diagnostic-r1-operator.py').read_text()
def spans(t):return {n.name:ast.get_source_segment(t,n)for n in ast.parse(t).body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
a,c=spans(old),spans(new)
for x in proof['span_reuse']:assert a[x['name']]==c[x['name']]and len(c[x['name']].encode())==x['bytes']and sha(c[x['name']].encode())==x['sha256']
changed=[n for n in a if a[n]!=c[n]];added=sorted(set(c)-set(a));assert set(changed)=={'error_facts','browser_projection','validate_activation','acquire','main'}
prior=b/'_bmad-output/auto-bmad/preparation/story-15-5/post-f1-targeted-terminal-diagnostic-operator-source-review';raw=(prior/'manifest.json').read_bytes();assert len(raw)==3865 and sha(raw)=='76176fdf2a31b465f3c0237b130f108c50bc2503c0ab863542d5fe9e195d90e9'
for x in read(prior/'manifest.json')['files']:check(x)
check(proof['retry_source']['ref']);assert 'retries: process.env.CI ? 1 : 0'in(b/'playwright.config.ts').read_text()
for n in ['post-f1-targeted-terminal-diagnostic-r1-activation.json','checkpoint-ce1943e0-targeted-diagnostic-r1']:assert not(b/'.env.epic15.mail-runtime/story-15-5-preparation'/n).exists()
result={'status':'PASS_BINDINGS','phase':sys.argv[1],'prepared':prepared,'original_six_and_consumed_nine_and_normal_22_preserved':True,'prior_source_review_preserved':True,'current_source_rows':74,'raw_clean_computed_blob_checks':222,'ten_helper_spans':10,'old_input_refs':len(bind['input_refs']),'changed_functions':changed,'added_functions':added,'retry_config_bound':True,'fresh_Root_222_Git_object_check_required':True,'r1_activation_and_output_absent':True,'API_GETs':0,'native_acquisition':0}
with(o/('bindings-'+sys.argv[1]+'.json')).open('x',encoding='utf8')as f:json.dump(result,f,indent=2);f.write('\n')
print(json.dumps({k:v for k,v in result.items()if k!='prepared'}))
