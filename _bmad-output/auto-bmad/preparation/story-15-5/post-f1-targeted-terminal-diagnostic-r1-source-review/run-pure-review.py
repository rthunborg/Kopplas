import sys,runpy,io,contextlib,json,hashlib,importlib.util,os
from pathlib import Path
b=Path(r"C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas");o=Path(__file__).resolve().parent;p=b/".env.epic15.mail-runtime/story-15-5-preparation/post-f1-targeted-terminal-diagnostic-preparation/r1"
blocked=[]
def audit(event,args):
 if event in ['subprocess.Popen','os.system','os.posix_spawn','os.spawn','socket.connect','socket.connect_ex','socket.getaddrinfo']:
  blocked.append(event);raise RuntimeError('LIVE_EFFECT_FORBIDDEN')
 if event=='open':
  path,mode,flags=args
  writable=(isinstance(mode,str)and any(x in mode for x in 'wax+'))or(isinstance(flags,int)and flags&(os.O_WRONLY|os.O_RDWR|os.O_CREAT|os.O_TRUNC|os.O_APPEND))
  if writable and isinstance(path,(str,bytes)) and not Path(path).resolve().is_relative_to(o.resolve()):raise RuntimeError('OUTSIDE_REVIEW_WRITE_FORBIDDEN')
sys.addaudithook(audit)
stdout,stderr=io.StringIO(),io.StringIO();exitcode=None
with contextlib.redirect_stdout(stdout),contextlib.redirect_stderr(stderr):
 try:runpy.run_path(str(p/'test_targeted_diagnostic_r1.py'),run_name='__main__')
 except SystemExit as e:exitcode=e.code
assert exitcode==0 and not blocked
for n,data in [('pure-tests.stdout.txt',stdout.getvalue().encode()),('pure-tests.stderr.txt',stderr.getvalue().encode()),('pure-tests.exit',str(exitcode).encode())]:
 with(o/n).open('xb')as f:f.write(data)
sp=importlib.util.spec_from_file_location('independent_r1_source',p/'targeted-diagnostic-r1-operator.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def deny(*a,**k):raise AssertionError('NO_TRANSPORT_OR_PERSISTENCE_IN_PREFLIGHT')
m.get=deny;m.write=deny
lines=m.source_lines(json.loads(m.BINDINGS.read_bytes()));maxresult=m.worst_case_result(lines);maxraw=m.diagnostic_bytes(maxresult);proof=m.budget_admission(lines)
assert len(maxraw)==30983 and hashlib.sha256(maxraw).hexdigest()=='7e1008b85969eabf5ef14f03913ce4fa7accfc099036daf5d10f644cdc5aa7ba'and proof['margin']==1785
errors=maxresult['reports'][0]['projection']['cases'][0]['errors'];e=errors[0];w=lambda x:len(m.diagnostic_bytes(x))
checks={
'error_kind':all(w(x)<=w(e['error_kind'])for x in ['ASSERTION','TIMEOUT','DATABASE','TRANSPORT','CANCELLED','AGGREGATE','UNKNOWN']),
'sqlstate':all(w(x)<=w(e['sqlstate'])for x in m.SQLSTATES|{'NONE_OR_UNKNOWN'}),
'code':all(w(x)<=w(e['transport_code'])for x in m.TRANSPORT|{'NONE_OR_UNKNOWN'}),
'error_reason':all(w(x)<=w(e['unknown_reason'])for x in ['UNRECOGNIZED_ERROR','SOURCE_MAPPING_REJECTED','REDACTED_UPSTREAM',None]),
'vocabulary':all(w(x)<=w(e['closed_tuples'][0]['vocabulary'])for x in ['fixture','browser']),
'stage':all(w(x)<=w(e['closed_tuples'][0]['stage'])for x in m.FIXTURE_STAGES|m.BROWSER_STAGES),
'category':all(w(x)<=w(e['closed_tuples'][0]['category'])for x in m.FIXTURE_CATS|m.BROWSER_CATS),
'location_kind':all(w(x)<=w(e['source_location_candidates'][0]['location_kind'])for x in ['DECLARATION','STRUCTURED_ERROR','STACK_CANDIDATE']),
'paths':all(w(x)<=w(e['source_location_candidates'][0]['path'])for x in lines),
'booleans':w(False)>=w(True),
'nullable_int':w(m.INT_MAX)>=w(None),
'global_reason':all(w(x)<=w(maxresult['unknown_reason'])for x in [None,'NO_SOURCE_LOCATION','REDACTED_UPSTREAM']),
'browser_status':w('unexpected')>=w('flaky'),
'attempt_status':all(w(x)<=w('interrupted')for x in ['failed','timedOut','interrupted']),
'signed32_nonnegative_width':all(w(x)<=w(m.INT_MAX)for x in [0,1,2,16,17,64,65536,m.INT_MAX]),
}
assert all(checks.values())and not blocked
# List/key overhead is fixed by3DB +4*2browser containers. Grouping16 errors maximizes commas (15), all11 arrays remain present.
containers=[]
for report in maxresult['reports']:
 for case in report['projection']['cases']:
  if 'errors'in case:containers.append(case['errors'])
  else:containers.extend(a['errors']for a in case['failed_attempts'])
assert len(containers)==11 and sum(map(len,containers))==16
assert sum(len(x['closed_tuples'])for x in errors)==64 and sum(len(x['source_location_candidates'])for x in errors)==64
record={'status':'PASS_INDEPENDENT_ENVELOPE','production_preflight':proof,'scalar_domain_checks':checks,'containers':11,'errors':16,'locations':64,'tuples':64,'serialization_same_exact_ASCII_LF':True,'live_effect_sentinel_calls':blocked,'API_GETs':0,'native_acquisition':0,'all_accepted_shape_argument':'Every variable-length array is bounded by production selectors and one shared budget. All11 containers persist. The single16-error list maximizes separator overhead; maximum-width per-error fields, four tuples, four locations, all finite scalar domains, longest escaped pinned path and signed32 counters overapproximate every production projection. Fixed identities/hash lengths/header/member metadata remain production literals.'}
with(o/'independent-envelope.json').open('x',encoding='utf8')as f:json.dump(record,f,indent=2);f.write('\n')
print(stdout.getvalue());print(stderr.getvalue());print(json.dumps(record))
