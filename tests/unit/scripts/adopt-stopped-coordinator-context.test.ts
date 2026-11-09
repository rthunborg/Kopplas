import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const sourceRoot = process.cwd();
const tool = resolve(sourceRoot, "scripts/maintenance/adopt_stopped_coordinator_context.py");
const python = process.platform === "win32" ? "python" : "python3";
const canonical = (v: unknown): string => JSON.stringify(v, (_, value) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(Object.keys(value).sort().map(k => [k, value[k]])) : value);
const hash = (v: string | Buffer) => createHash("sha256").update(v).digest("hex");
const importTool = `import importlib.util,json,sys,sqlite3,pathlib,time,os,contextlib
spec=importlib.util.spec_from_file_location('adoption',sys.argv[1]); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
`;
function py(code: string, args: string[] = []) {
  const r = spawnSync(python, ["-B", "-c", importTool + code, tool, ...args], { cwd: sourceRoot, encoding: "utf8", timeout: 180000 });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  return JSON.parse(r.stdout.trim());
}
type Fixture = { root: string; request: string; repo: string; integration: string; worker: string;
  base: string; main: string; checkpoint: string; published: string; candidate: string; private: string; store: string };
const setup = String.raw`
import re,uuid,subprocess,shutil
src=pathlib.Path(sys.argv[2]); dest=src/'tmp/private/adoption-fixtures'/str(uuid.uuid4()); dest.mkdir(parents=True)
repo=dest/'repository'; repo.mkdir(); private=dest/'private'; private.mkdir()
integration=dest/'integration'; worker=dest/'worker'; stage=dest/'integration-staging'
def g(*args):
    return subprocess.check_output(['git','-c','core.hooksPath='+str(dest/'no-hooks'),'-C',str(repo),*args],stderr=subprocess.PIPE).decode().strip()
def put(name,data):
    p=repo/name; p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(data)
g('init','-b','main'); g('config','user.name','Synthetic fixture'); g('config','user.email','fixture@example.invalid'); g('config','core.autocrlf','false'); g('config','core.longpaths','true'); g('config','core.hooksPath',str(dest/'no-hooks'))
spec=importlib.util.spec_from_file_location('native',src/m.HELPER); h=importlib.util.module_from_spec(spec); spec.loader.exec_module(h)
paths=subprocess.check_output(['git','-C',str(src),'ls-files','--',*h.WORKFLOW_PATHS]).decode().splitlines()
assert len(paths)==100
for name in paths:
    data=(src/name).read_bytes().replace(b'\r\n',b'\n')
    if name in ['_bmad/custom/bmad-build.toml','_bmad/custom/bmad-build-auto.toml']:
        data=data.replace(b'"file:{project-root}/docs/process/bounded-workflow-operating-policy.md", ',b'')
    put(name,data)
folder='_bmad-output/specs/spec-design-35-6'; storyfile=folder+'/stories/35-6-crm-record-journeys.md'
for name in [folder+'/SPEC.md',folder+'/stories.yaml']: put(name,(src/name).read_bytes().replace(b'\r\n',b'\n'))
# Keep the synthetic story eligible independently of the live story's status.
story_data=(src/storyfile).read_bytes().replace(b'\r\n',b'\n')
opening=b'---\n'
assert story_data.startswith(opening), 'Expected story frontmatter at the start of the fixture source'
frontmatter,closing,body=story_data[len(opening):].partition(b'\n---\n')
assert closing, 'Expected a closing story frontmatter delimiter'
frontmatter,replacements=re.subn(rb'(?m)^status:[^\n]*$',b'status: ready-for-dev',frontmatter)
assert replacements==1, 'Expected exactly one status field in the story frontmatter'
put(storyfile,opening+frontmatter+closing+body)
owned=['src/app/(app)/customers/[customerId]/page.tsx','src/components/crm/CustomerDetail.tsx','src/components/crm/FacilityDialog.tsx','src/components/crm/ContactDialog.tsx','src/components/crm/ArchiveButton.tsx','tests/e2e/crm/customers.e2e.spec.ts',storyfile,m.STATE,'_bmad-output/auto-bmad/reports/'+m.STORY+'.md','_bmad-output/auto-bmad/delivery/'+m.STORY+'.json','_bmad-output/test-artifacts/atdd-checklist-35-6-crm-record-journeys.md']
for name in owned:
    if name not in {storyfile,m.STATE}: put(name,b'synthetic original\n')
g('add','.'); g('commit','-m','Synthetic old workflow and exact frozen sources'); base=g('rev-parse','HEAD')
assert h.workflow_version(repo)==m.BEFORE_PIN
g('branch','codex/e35-6-coordinator',base); g('branch','codex/story-35-6-crm-record-journeys',base)
for name in ['_bmad/custom/bmad-build.toml','_bmad/custom/bmad-build-auto.toml','docs/process/bounded-workflow-operating-policy.md','docs/process/templates/current-work-packet.md']:
    put(name,(src/name).read_bytes().replace(b'\r\n',b'\n'))
variant=sys.argv[3] if len(sys.argv)>3 else ''
if variant=='policy-drift': put('docs/process/bounded-workflow-operating-policy.md',b'SYNTHETIC POLICY DRIFT\n')
if variant=='source-drift': put(folder+'/SPEC.md',(repo/folder/'SPEC.md').read_bytes()+b'\nSYNTHETIC SOURCE DRIFT\n')
put('incoming-main.txt',b'exact incoming main content\n'); g('add','.'); g('commit','-m','Synthetic exact current workflow'); main=g('rev-parse','HEAD'); g('update-ref','refs/remotes/origin/main',main)
assert h.workflow_version(repo)==m.AFTER_PIN
g('worktree','add',str(integration),'codex/e35-6-coordinator'); g('worktree','add',str(worker),'codex/story-35-6-crm-record-journeys')
def wg(*args): return subprocess.check_output(['git','-C',str(worker),*args],stderr=subprocess.PIPE).decode().strip()
identity=dict(base_branch='main',base_revision=base,branch=wg('branch','--show-current'),repository='rthunborg/Kopplas',run_id=m.RUN,story_key=m.STORY,worktree=str(worker))
state=('parallel_run_id: '+m.RUN+'\nstatus: in-progress\nstory_key: '+m.STORY+'\npublication_identity_json: '+json.dumps(json.dumps(identity,sort_keys=True))+'\npr_number: 127\npr_url: "https://github.com/rthunborg/Kopplas/pull/127"\npublication_operation_json: "immutable old receipt"\n').encode()
(worker/m.STATE).parent.mkdir(parents=True,exist_ok=True); (worker/m.STATE).write_bytes(state)
(worker/owned[0]).write_bytes(b'synthetic retained product\n'); wg('add','.'); wg('commit','-m','Synthetic published product'); published=wg('rev-parse','HEAD')
(worker/owned[-1]).write_bytes(b'synthetic checkpoint evidence\n'); wg('add','.'); wg('commit','-m','Synthetic retained checkpoint'); checkpoint=wg('rev-parse','HEAD')
# Candidate is a real merge, preserving distinct published/checkpoint ancestry.
wg('checkout','-b','codex/candidate'); wg('merge','--no-ff','--no-edit',main)
(worker/m.STATE).write_bytes(m.reassessed(state,base,main)); wg('add',m.STATE); wg('commit','-m','Synthetic reviewed publication-base reassessment'); candidate=wg('rev-parse','HEAD')
wg('checkout','codex/story-35-6-crm-record-journeys')
g('worktree','add','-b','codex/staged-integration',str(stage),main)
story=dict(id=m.STORY,approved=True,spec_path=storyfile,spec_revision=m.rawhash(m.blob(repo,base,storyfile)),prerequisites=[],write_paths=owned,conflict_domains=['presentation:crm-record-journeys','test:e2e-crm-customers'],contracts=[],requires_contracts=[],risk_domains=['tenant-isolation','transactional-integrity'],required_checks=['unit'],source=dict(spec_folder=folder,story_id='35-6',story_key=m.STORY,position=0,spec_checkpoint=False,done_checkpoint=True,files=[dict(path=name,sha256=m.rawhash(m.blob(repo,base,name))) for name in [folder+'/SPEC.md',folder+'/stories.yaml']]))
plan=dict(schema_version=2,story_source='stories',publication_strategy='story-pr',repository='rthunborg/Kopplas',base_branch='main',run_id=m.RUN,epic='spec-design-35-6',coordinator=m.OLD,integration_branch='codex/e35-6-coordinator',integration_worktree=str(integration),base_sha=base,workflow_version=m.BEFORE_PIN,max_workers=1,stories=[story],integrated_prerequisites=[],legacy_reservations=[],shared_paths=[],final_required_checks=['unit'])
with h.database(repo) as db:
    db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?,NULL)',(m.RUN,plan['epic'],m.OLD,h.canonical(plan),h.digest(plan),'active'))
    db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,NULL,NULL,NULL,?)',(m.RUN,m.STORY,m.WORKER,1,'codex/story-35-6-crm-record-journeys',str(worker),base,123456.0,'blocked','synthetic original hold'))
    db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?,?)',('unrelated-finalized','other-epic','other-owner','UNRELATED_SENTINEL_SECRET','unrelated','finalized',base))
    if variant.startswith('audit-extra'):
        for statement in m.DDL: db.execute(statement)
        trigger='sqliteevil_audit_side_effect' if variant=='audit-extra-prefix' else 'unexpected_audit_side_effect'
        db.execute('CREATE TRIGGER '+trigger+' AFTER INSERT ON coordinator_successions BEGIN UPDATE claims SET generation=2; END')
store=repo/'.git/auto-bmad-parallel.sqlite3'
with m.database(store) as db: snap=m.snapshot(db)
def ev(name,value):
    f=private/(name+'.json'); f.write_text(m.canonical(value),encoding='utf-8'); return dict(path=str(f),sha256=m.rawhash(f.read_bytes()))
now=time.time()-(901 if variant=='expired' else 0); request_id=str(uuid.uuid4()); toolhash=m.rawhash(pathlib.Path(m.__file__).read_bytes())
after=plan.copy(); after.update(coordinator=m.NEW,base_sha=main,workflow_version=m.AFTER_PIN)
proposal=dict(environment='fixture',private_root=str(private),repository=str(repo),integration=str(integration),worker=str(worker),integration_staging=str(stage),before_integration=base,before_worker=checkpoint,integration_candidate=main,worker_candidate=candidate,checkpoint=checkpoint,published_head=published,selected_checkpoint=checkpoint,old_base=base,main=main,expected_snapshot=m.digest(snap),after_plan_hash=m.digest(after),original_plan=ev('original-plan',plan),exclusion_register=ev('exclusions',dict(synthetic=True,tokens=57,domains=7,allocations=3,provenance='SYNTHETIC historical exclusions, never current clearance')),main_observation=ev('main-observation',dict(kind='current-provider-main-observation',repository=plan['repository'],branch='main',head=main,issued=now-1,expires=now+899,provenance='SYNTHETIC fixture; no provider queried')),custody=ev('custody',dict(kind='current-stopped-custody',run=m.RUN,story=m.STORY,coordinator=m.NEW,worker=m.WORKER,old_archived=True,writers_stopped=[m.OLD,m.NEW,m.WORKER,m.PRODUCER],no_reopen=True,delegates=[],queued_operations=[],native_operations=[],holds=['35.6','35.7'],issued=now-1,expires=now+899,provenance='SYNTHETIC fixture; no live custody')),tool_sha256=toolhash,tool_revision=main,tool_author='synthetic-author')
proposal['qualification']=ev('qualification',dict(kind='qualified-cold-adoption-tool',environment='fixture',tool_sha256=toolhash,tool_revision=main,workflow=m.AFTER_PIN,model='gpt-6.1-sol',effort='high',status='passed',evidence='SYNTHETIC fixture, never live qualification',provenance='fixture'))
q=dict(schema_version=1,request_id=request_id,proposal=proposal)
d=m.digest(q); q['owner_approval']=dict(proposal_digest=d,evidence=ev('owner',dict(kind='trusted-channel-owner-decision',proposal_digest=d,decision='authorize-exact-cold-context-adoption',provenance='SYNTHETIC fixture; no owner authorization')))
d=m.digest(q); q['admission_review']=dict(request_digest=d,reviewer='synthetic-independent-reviewer',model='gpt-6.1-sol',effort='high',evidence=ev('review',dict(kind='independent-exact-request-review',request_digest=d,reviewer='synthetic-independent-reviewer',status='passed',provenance='SYNTHETIC fixture; no live review')))
request=private/'request.json'; request.write_text(m.canonical(q),encoding='utf-8')
print(json.dumps(dict(root=str(dest),request=str(request),repo=str(repo),integration=str(integration),worker=str(worker),base=base,main=main,checkpoint=checkpoint,published=published,candidate=candidate,private=str(private),store=str(store))))
`;
function fixture(variant = ""): Fixture { return py(setup, [sourceRoot, variant]); }
function cli(f: Fixture, operation = "validate", request = f.request) {
  const r = spawnSync(python, ["-B", tool, operation, "--request", request], { cwd: sourceRoot, encoding: "utf8", timeout: 180000 });
  assert.equal(r.signal, null, r.stderr);
  assert.ok(r.status === 0 || r.status === 2, r.stderr);
  return { code: r.status, result: JSON.parse(r.stdout.trim()), stdout: r.stdout, stderr: r.stderr };
}
function native(f: Fixture, operation: string, owner: string, more: string[] = []) {
  const r = spawnSync(python, ["-B", resolve(f.integration, ".agents/skills/auto-bmad/scripts/parallel_run.py"), "--repo", f.integration,
    operation, "--run", "e35-6-20261102", "--owner", owner, ...more], { cwd: sourceRoot, encoding: "utf8", timeout: 180000 });
  return r;
}
const old = "01a1160d-b5b1-7623-a8e8-54ef3dc537ed", successor = "01a1afde-34b5-7bb2-976e-de71b7f6a94c";
const outgoing = "01a1a644-140e-7f83-bbf3-045a642e7ee1";
const worker = "01a19c88-3c36-76f1-918b-88a00e4d222f", story = "spec-design-35-6-35-6";
function state(f: Fixture) {
  return py(`store=pathlib.Path(sys.argv[2])
with m.database(store) as db:
 s=m.snapshot(db); audit=m.audit_schema(db)
 rows=[dict(r) for r in db.execute('SELECT * FROM coordinator_successions')] if audit else []
print(m.canonical(dict(snapshot=s,audit=rows)))`, [f.store]);
}
function disk(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of readdirSync(dir)) {
    const file = resolve(dir, name);
    if (statSync(file).isDirectory()) Object.assign(out, disk(file));
    else out[file] = hash(readFileSync(file));
  }
  return out;
}
type Request = { schema_version: unknown; proposal: Record<string, unknown>; owner_approval: Record<string, unknown>; [key: string]: unknown };
function change(f: Fixture, mutate: (value: Request) => void): string {
  const q = JSON.parse(readFileSync(f.request, "utf8")); mutate(q);
  const name = resolve(f.private, "changed-request.json"); writeFileSync(name, canonical(q)); return name;
}

test("V01 V02 V12 P01: physical RO validation, exact native refusals and strict private input", { timeout: 240000 }, async t => {
  const f = fixture();
  await t.test("valid dry-run creates no schema, file, lock, journal or native mutation", () => {
    const before = disk(f.root); const r = cli(f); assert.equal(r.code, 0, r.stdout);
    assert.equal(r.result.writes, 0); assert.equal(r.result.admitted, false); assert.deepEqual(disk(f.root), before);
    assert.equal(r.result.old_owner, old); assert.equal(r.result.successor, successor);
    assert.equal(r.result.worker, worker); assert.equal(r.result.generation, 1); assert.equal(r.result.state, "blocked");
    assert.equal(state(f).audit.length, 0);
    assert.equal(py(`with m.database(pathlib.Path(sys.argv[2])) as db:
 try: db.execute('CREATE TABLE forbidden(value)'); value=False
 except sqlite3.OperationalError: value=True
print(json.dumps(value))`, [f.store]), true);
  });
  await t.test("the same RO route accepts an empty exact audit schema without writing", () => {
    py(`with m.database(pathlib.Path(sys.argv[2]),write=True) as db:
 for sql in m.DDL: db.execute(sql)
print(json.dumps(True))`, [f.store]);
    const before = disk(f.root), r = cli(f); assert.equal(r.code, 0, r.stdout); assert.deepEqual(disk(f.root), before);
  });
  await t.test("native current-main check refuses old pin; pin-only refuses base; old claim base refuses candidate diff", () => {
    const r = native(f, "status", old); assert.notEqual(r.status, 0); assert.match(r.stdout, /Qualified main workflow differs/);
    assert.equal(py(`q=m.decode(m.read(sys.argv[2])); p=m.evidence(q['proposal']['original_plan'],pathlib.Path(q['proposal']['private_root']))
spec=importlib.util.spec_from_file_location('h',pathlib.Path(q['proposal']['integration'])/m.HELPER); h=importlib.util.module_from_spec(spec); spec.loader.exec_module(h)
results=[]
p['workflow_version']=m.AFTER_PIN
try: h.validate_plan(q['proposal']['repository'],p); results.append('BAD')
except h.Refusal as e: results.append(str(e))
with m.database(pathlib.Path(sys.argv[3])) as db: c=m.target(m.snapshot(db))[1]
try: h.validate_diff(q['proposal']['repository'],p,c,q['proposal']['old_base'],q['proposal']['worker_candidate']); results.append('BAD')
except h.Refusal as e: results.append(str(e))
assert 'committed base workflow' in results[0] and 'outside assigned ownership' in results[1]
print(json.dumps(True))`, [f.request, f.store]), true);
  });
  for (const [label, mutate] of [
    ["unknown field", (q: Request) => { q.extra = "SENTINEL-SECRET"; }],
    ["caller-selected successor", (q: Request) => { q.proposal.successor = outgoing; }],
    ["wrong type", (q: Request) => { q.schema_version = true; }],
    ["wrong after hash", (q: Request) => { q.proposal.after_plan_hash = "0".repeat(64); }],
    ["changed approval digest", (q: Request) => { q.owner_approval.proposal_digest = "0".repeat(64); }],
    ["unsafe unrelated path", (q: Request) => { q.proposal.integration = sourceRoot; }],
  ] as const) await t.test(label, () => {
    const file = change(f, mutate); const before = state(f); const r = cli(f, "validate", file);
    assert.equal(r.code, 2); assert.doesNotMatch(r.stdout + r.stderr, /SENTINEL-SECRET|C:\\|\/home\//); assert.deepEqual(state(f), before);
    if (label === "caller-selected successor") assert.equal(r.result.reason, "REQUEST_SHAPE");
  });
  for (const target of [outgoing, "synthetic-unappointed-successor"]) await t.test(`custody cannot substitute fixed successor ${target}`, () => {
    const file = py(`q=m.decode(m.read(sys.argv[2])); private=pathlib.Path(q['proposal']['private_root'])
custody=m.evidence(q['proposal']['custody'],private); custody['coordinator']=sys.argv[3]
custody['writers_stopped']=[m.OLD,sys.argv[3],m.WORKER,m.PRODUCER]
e=private/'changed-custody.json'; e.write_text(m.canonical(custody),encoding='utf-8')
q['proposal']['custody']=dict(path=str(e),sha256=m.rawhash(e.read_bytes()))
request=private/'changed-custody-request.json'; request.write_text(m.canonical(q),encoding='utf-8')
print(json.dumps(str(request)))`, [f.request, target]);
    const physical = disk(f.root), before = state(f), r = cli(f, "validate", file);
    assert.equal(r.code, 2); assert.equal(r.result.reason, "CUSTODY_INCOMPLETE");
    assert.deepEqual(state(f), before); assert.deepEqual(disk(f.root), physical);
  });
  await t.test("duplicate key and missing store refuse without creation", () => {
    const file = resolve(f.private, "duplicate.json"); writeFileSync(file, '{"schema_version":1,"schema_version":1}');
    assert.equal(cli(f, "validate", file).result.reason, "DUPLICATE_KEY");
    const missing = resolve(f.root, "missing.sqlite3");
    assert.equal(py(`try:
 with m.database(pathlib.Path(sys.argv[2])): pass
except m.Refusal as e: print(json.dumps(str(e)))`, [missing]), "MISSING_STORE");
    assert.equal(existsSync(missing), false);
  });
});

test("V03 V05 V06 V07 V13 P02 P03 P04 P05 P09: one native commit, conserved Git/product/history and old packet refusal", { timeout: 240000 }, async t => {
  const f = fixture(), before = state(f);
  await t.test("prepare is private and apply atomically adopts only declared effective fields", () => {
    assert.equal(cli(f, "prepare").code, 0); assert.deepEqual(state(f), before);
    const r = cli(f, "apply"); assert.equal(r.code, 0, r.stdout); assert.equal(r.result.admitted, false);
    assert.equal(r.result.status, "locally-adopted-publication-pending");
    const after = state(f); assert.equal(after.audit.length, 1);
    assert.doesNotMatch(JSON.stringify(after.audit), /UNRELATED_SENTINEL_SECRET/);
    const br = before.snapshot.tables.runs[0], ar = after.snapshot.tables.runs[0];
    const bc = before.snapshot.tables.claims[0], ac = after.snapshot.tables.claims[0];
    assert.deepEqual({ ...ac, base_sha: bc.base_sha }, bc); assert.equal(ac.base_sha, f.main);
    assert.deepEqual({ ...ar, owner: br.owner, plan: br.plan, plan_hash: br.plan_hash }, br);
    const bp = JSON.parse(br.plan), ap = JSON.parse(ar.plan);
    assert.equal(br.owner, old); assert.equal(bp.coordinator, old); assert.equal(ap.coordinator, successor);
    assert.deepEqual({ ...ap, coordinator: bp.coordinator, base_sha: bp.base_sha, workflow_version: bp.workflow_version }, bp);
    assert.equal(ar.owner, successor); assert.equal(ac.generation, 1); assert.equal(ac.state, "blocked");
    assert.equal(after.snapshot.unrelated_state_digest, before.snapshot.unrelated_state_digest);
    assert.deepEqual(JSON.parse(after.audit[0].before_snapshot), before.snapshot);
    const response = JSON.parse(after.audit[0].response); assert.equal(response.packet.owner, successor);
    assert.equal(response.packet.worker, worker); assert.equal(response.packet.generation, 1); assert.equal(response.packet.state, "blocked");
    assert.equal(response.packet.base_sha, f.main); assert.equal(response.packet.effective_plan_hash, ar.plan_hash);
    assert.equal(py(`q=m.decode(m.read(sys.argv[2])); p=q['proposal']; repo=pathlib.Path(p['repository'])
assert m.head(pathlib.Path(p['integration']))==p['integration_candidate']
assert m.head(pathlib.Path(p['worker']))==p['worker_candidate']
for a in ['checkpoint','published_head','main']: m.ancestor(repo,p[a],p['worker_candidate'])
old=m.blob(repo,p['selected_checkpoint'],m.STATE); new=m.blob(repo,p['worker_candidate'],m.STATE)
assert new==m.reassessed(old,p['old_base'],p['main'])
print(json.dumps(True))`, [f.request]), true);
  });
  await t.test("real pinned helper rejects old owner entry paths and outgoing Coordinator before claim mutation", () => {
    for (const op of ["status", "heartbeat", "block", "submit", "prepare-pr-merge"]) {
      const more = op === "status" ? [] : ["--story", story];
      if (["heartbeat", "block", "submit"].includes(op)) more.push("--worker", worker, "--generation", "1");
      if (op === "block") more.push("--reason", "unused");
      if (op === "submit" || op === "prepare-pr-merge") more.push("--evidence", resolve(f.private, "absent.json"));
      if (op === "prepare-pr-merge") more.push("--expected-head", f.candidate, "--expected-main", f.main);
      const beforeCall = state(f); const r = native(f, op, old, more);
      assert.notEqual(r.status, 0, `${op}: ${r.stdout}`); assert.match(r.stdout, /Exact coordinator owner required/); assert.deepEqual(state(f), beforeCall);
    }
    const beforeOutgoing = state(f), departed = native(f, "status", outgoing);
    assert.notEqual(departed.status, 0); assert.match(departed.stdout, /Exact coordinator owner required/);
    assert.deepEqual(state(f), beforeOutgoing);
    for (const more of [["--worker", "wrong", "--generation", "1"], ["--worker", worker, "--generation", "2"]]) {
      const r = native(f, "heartbeat", successor, ["--story", story, ...more]);
      assert.notEqual(r.status, 0); assert.match(r.stdout, /Stale generation or wrong worker/);
    }
    const r = native(f, "status", successor); assert.equal(r.status, 0, r.stdout);
  });
  await t.test("identical request replays historical result; fresh validation refuses; immutable audit rejects mutation", () => {
    const beforeReplay = state(f); const r = cli(f, "recover"); assert.equal(r.code, 0, r.stdout);
    assert.equal(r.result.replayed, true); assert.equal(r.result.admitted, false); assert.deepEqual(state(f), beforeReplay);
    assert.equal(cli(f).code, 2);
    assert.equal(py(`db=sqlite3.connect(sys.argv[2])
try: db.execute('DELETE FROM coordinator_successions'); result=False
except sqlite3.IntegrityError: result=True
db.close(); print(json.dumps(result))`, [f.store]), true);
  });
  await t.test("generic publication path still rejects silent identity base replacement", () => {
    assert.equal(py(`spec=importlib.util.spec_from_file_location('pr',pathlib.Path(sys.argv[2])/'.agents/skills/auto-bmad/scripts/pr_strategy.py'); pr=importlib.util.module_from_spec(spec); spec.loader.exec_module(pr)
errors=pr.transition_errors({'publication_identity_json':'old'},{'publication_identity_json':'new'})
print(json.dumps(bool(errors) and 'immutable' in errors[0]))`, [f.integration]), true);
  });
});

async function crash(f: Fixture, marker: string, mode: "phase" | "sql" | "beforephase" | "spill-sql" = "phase") {
  const code = importTool + String.raw`
mark=sys.argv[3]; mode=sys.argv[4]
def stop():
 print('AT_CRASH_POINT',flush=True); time.sleep(45)
if mode in {'phase','beforephase'}:
 original=m.append
 def patched(j,d,p):
  if mode=='beforephase' and p==mark: stop()
  original(j,d,p)
  if mode=='phase' and p==mark: stop()
 m.append=patched
else:
 original=m.database
 @contextlib.contextmanager
 def patched(*a,**kw):
  with original(*a,**kw) as db:
   if mode=='spill-sql' and kw.get('write'): db.execute('PRAGMA cache_size=1')
   class Proxy:
    def execute(self,sql,*args):
     r=db.execute(sql,*args)
     if sql.startswith(mark): stop()
     return r
    def __getattr__(self,key): return getattr(db,key)
   yield Proxy()
 m.database=patched
sys.argv=[sys.argv[0],'apply','--request',sys.argv[2]]
sys.exit(m.main())
`;
  const child = spawn(python, ["-B", "-c", code, tool, f.request, marker, mode], { cwd: sourceRoot, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  const reached = new Promise<void>((yes, no) => {
    const timer = setTimeout(() => no(new Error("crash point timeout: " + stdout + stderr)), 180000);
    child.stdout.on("data", data => { stdout += data.toString(); if (stdout.includes("AT_CRASH_POINT")) { clearTimeout(timer); yes(); } });
    child.stderr.on("data", data => { stderr += data.toString(); });
    child.once("exit", () => { if (!stdout.includes("AT_CRASH_POINT")) { clearTimeout(timer); no(new Error(stdout + stderr)); } });
  });
  await reached; child.kill("SIGKILL"); await new Promise<void>(yes => child.once("close", () => yes()));
}

for (const phase of ["prepared", "integration-intent", "integration-done", "worker-intent", "worker-done", "native-intent", "native-done"]) {
  test(`V04 P06: actual process kill after durable ${phase} recovers only recorded state`, { timeout: 240000 }, async () => {
    const f = fixture(), before = state(f); await crash(f, phase);
    if (phase !== "native-done") assert.deepEqual(state(f), before);
    const r = cli(f, "recover"); assert.equal(r.code, 0, r.stdout); assert.equal(state(f).audit.length, 1);
    assert.equal(state(f).snapshot.tables.claims[0].generation, 1);
  });
}
for (const sql of ["CREATE TABLE coordinator_successions", "UPDATE runs SET owner", "UPDATE claims SET base_sha", "INSERT INTO coordinator_successions"]) {
  test(`V04 P06: actual process kill after SQL ${sql} rolls back entire native transaction`, { timeout: 240000 }, async () => {
    const f = fixture(), before = state(f); await crash(f, sql, "sql"); assert.deepEqual(state(f), before);
    const r = cli(f, "recover"); assert.equal(r.code, 0, r.stdout); assert.equal(state(f).audit.length, 1);
  });
}

test("V04 P06: kill after SQLite commit before final journal/response replays one committed audit", { timeout: 240000 }, async () => {
  const f = fixture(); await crash(f, "native-done", "beforephase"); assert.equal(state(f).audit.length, 1);
  const r = cli(f, "recover"); assert.equal(r.code, 0, r.stdout); assert.equal(r.result.replayed, true); assert.equal(state(f).audit.length, 1);
});

test("V08 P07: concurrent real adoption processes settle at most one request under the operation lock", { timeout: 240000 }, async () => {
  const f = fixture();
  const code = importTool + String.raw`
original=m.append
def patched(j,d,p):
 original(j,d,p)
 if p=='prepared':
  import threading
  timer=threading.Timer(60,lambda:os._exit(88)); timer.daemon=True; timer.start()
  print('WAITING_WITH_OPERATION_LOCK',flush=True)
  if sys.stdin.readline().strip()!='continue': raise RuntimeError('test gate closed')
  timer.cancel()
m.append=patched
sys.argv=[sys.argv[0],'apply','--request',sys.argv[2]]; sys.exit(m.main())
`;
  const first = spawn(python, ["-B", "-c", code, tool, f.request], { cwd: sourceRoot, stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  try {
    await new Promise<void>((yes, no) => {
      const timeout = setTimeout(() => no(new Error(stdout + stderr)), 180000);
      first.stdout.on("data", chunk => { stdout += chunk.toString(); if (stdout.includes("WAITING_WITH_OPERATION_LOCK")) { clearTimeout(timeout); yes(); } });
      first.stderr.on("data", chunk => { stderr += chunk.toString(); });
      first.once("exit", () => { if (!stdout.includes("WAITING_WITH_OPERATION_LOCK")) { clearTimeout(timeout); no(new Error(stdout + stderr)); } });
    });
    const second = cli(f, "apply"); assert.equal(second.code, 2); assert.equal(second.result.reason, "OPERATION_BUSY");
    first.stdin.end("continue\n");
    const code = await new Promise<number | null>(yes => first.once("close", yes));
    assert.equal(code, 0, stdout + stderr); assert.equal(state(f).audit.length, 1);
  } finally { if (first.exitCode === null) first.kill("SIGKILL"); }
});

test("V08 V09 P07: independent writer changes snapshot before CAS; unknown Git state and missing journal fail closed", { timeout: 240000 }, async t => {
  const f = fixture(); assert.equal(cli(f, "prepare").code, 0);
  await crash(f, "native-intent");
  await t.test("a separate writer changes unrelated native state; full-snapshot CAS refuses without losing it", () => {
    // Keep target claim/context exact so this reaches the whole-store CAS.
    // The separate real pinned-helper test covers the earlier heartbeat fence.
    py(`db=sqlite3.connect(sys.argv[2]); db.execute('BEGIN IMMEDIATE'); db.execute("UPDATE runs SET plan=plan||'-changed' WHERE run='unrelated-finalized'"); db.commit(); db.close(); print(json.dumps(True))`, [f.store]);
    const changed = state(f), r = cli(f, "recover"); assert.equal(r.code, 2); assert.equal(r.result.reason, "NATIVE_SNAPSHOT_CHANGED");
    assert.deepEqual(state(f), changed); assert.equal(changed.audit.length, 0);
  });
  await t.test("dirty external file refuses; absent recovery journal never initiates a new operation", () => {
    writeFileSync(resolve(f.worker, "unknown-private-file.txt"), "SENTINEL-SECRET");
    const r = cli(f, "recover"); assert.equal(r.code, 2); assert.equal(r.result.reason, "DIRTY_CHECKOUT"); assert.doesNotMatch(r.stdout, /SENTINEL/);
    const g = fixture(); const missing = cli(g, "recover"); assert.equal(missing.code, 2); assert.equal(missing.result.reason, "JOURNAL_REQUIRED");
  });
});

test("V02 V09 P03 P07: narrow path, lock, policy, source and fresh-window boundaries", { timeout: 240000 }, async t => {
  await t.test("UNC and real filesystem redirect ancestors refuse before resolution", () => {
    const f = fixture();
    assert.equal(py(`try: m.path(chr(92)*2+'invalid-host'+chr(92)+'share')
except m.Refusal as e: print(json.dumps(str(e)))`, []), "UNSAFE_PATH");
    assert.equal(py(`root=pathlib.Path(sys.argv[2]); target=root/'link-target'; target.mkdir(); link=root/'redirect'
if os.name=='nt':
 import subprocess
 script=root/'make-junction.ps1'; script.write_text('param([string]$link,[string]$target)\\nNew-Item -ItemType Junction -Path $link -Target $target | Out-Null\\n')
 powershell=pathlib.Path(os.environ['WINDIR'])/'System32/WindowsPowerShell/v1.0/powershell.exe'
 subprocess.check_call([str(powershell),'-NoProfile','-NonInteractive','-File',str(script),str(link),str(target)],stdout=subprocess.DEVNULL)
else: os.symlink(target,link,target_is_directory=True)
try: m.path(str(link/'uncreated-child'))
except m.Refusal as e: print(json.dumps(str(e)))`, [f.private]), "UNSAFE_PATH");
  });
  await t.test("private journal root cannot overlap a retained checkout", () => {
    const f = fixture();
    const file = py(`q=m.decode(m.read(sys.argv[2])); private=pathlib.Path(q['proposal']['worker'])/'tmp/private'; private.mkdir(parents=True)
q['proposal']['private_root']=str(private); file=private/'request.json'; file.write_text(m.canonical(q)); print(json.dumps(str(file)))`, [f.request]);
    const r = cli(f, "prepare", file); assert.equal(r.code, 2); assert.equal(r.result.reason, "PRIVATE_ROOT_BOUNDARY");
    assert.equal(state(f).audit.length, 0);
  });
  await t.test("an unrecognized lock artifact refuses without writing its bytes", () => {
    const f = fixture(), q = JSON.parse(readFileSync(f.request, "utf8"));
    const lock = resolve(f.private, `cold-adoption-${q.request_id}.lock`); writeFileSync(lock, "SENTINEL-SECRET");
    const r = cli(f, "prepare"); assert.equal(r.code, 2); assert.equal(r.result.reason, "LOCK_STATE_UNKNOWN");
    assert.equal(readFileSync(lock, "utf8"), "SENTINEL-SECRET"); assert.doesNotMatch(r.stdout, /SENTINEL/);
  });
  for (const [variant, reason] of [["policy-drift", "CANONICAL_POLICY_CHANGED"], ["source-drift", "NATIVE_OPERATION_REFUSED"], ["expired", "CUSTODY_EXPIRED"]]) {
    await t.test(`fully bound synthetic request refuses ${variant}`, () => {
      const f = fixture(variant), before = state(f), r = cli(f);
      assert.equal(r.code, 2); assert.equal(r.result.reason, reason); assert.deepEqual(state(f), before);
    });
  }
});

test("V04 P06: forced SQLite cache-spill hot journal stays physically RO, then same native-intent recovery settles", { timeout: 300000 }, async () => {
  const f = fixture(), before = state(f); await crash(f, "INSERT INTO coordinator_successions", "spill-sql");
  const readonly = py(`try:
 with m.database(pathlib.Path(sys.argv[2])) as db: m.snapshot(db)
 result=None
except sqlite3.OperationalError as e: result=dict(code=e.sqlite_errorcode,name=e.sqlite_errorname)
print(json.dumps(result))`, [f.store]);
  assert.equal(readonly?.name, "SQLITE_READONLY_ROLLBACK");
  const physical = disk(f.root), dry = cli(f); assert.equal(dry.code, 2); assert.deepEqual(disk(f.root), physical);
  const recovered = cli(f, "recover"); assert.equal(recovered.code, 0, recovered.stdout);
  const after = state(f); assert.equal(after.audit.length, 1); assert.deepEqual(JSON.parse(after.audit[0].before_snapshot), before.snapshot);
});

test("V08 P07: actual pinned-helper heartbeat validated before cold staging cannot lose its later committed update", { timeout: 240000 }, async () => {
  const f = fixture();
  const code = importTool + String.raw`
spec=importlib.util.spec_from_file_location('h',pathlib.Path(sys.argv[2])/m.HELPER); h=importlib.util.module_from_spec(spec); spec.loader.exec_module(h)
original=h.database
@contextlib.contextmanager
def gated(repo):
 with original(repo) as db:
  class Proxy:
   def execute(self,sql,*args):
    if sql.startswith('UPDATE claims SET heartbeat'):
     import threading
     timer=threading.Timer(100,lambda:os._exit(88)); timer.daemon=True; timer.start()
     print('NATIVE_HEARTBEAT_VALIDATED_WITH_DB_LOCK',flush=True)
     if sys.stdin.readline().strip()!='continue': raise RuntimeError('test gate closed')
     timer.cancel()
    return db.execute(sql,*args)
   def __getattr__(self,key): return getattr(db,key)
  yield Proxy()
h.database=gated
sys.argv=[sys.argv[0],'--repo',sys.argv[2],'heartbeat','--run',m.RUN,'--owner',m.OLD,'--story',m.STORY,'--worker',m.WORKER,'--generation','1']
sys.exit(h.main())
`;
  const child = spawn(python, ["-B", "-c", code, tool, f.integration], { cwd: sourceRoot, stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  try {
    await new Promise<void>((yes, no) => {
      const timeout = setTimeout(() => no(new Error(stdout + stderr)), 180000);
      child.stdout.on("data", data => { stdout += data.toString(); if (stdout.includes("NATIVE_HEARTBEAT_VALIDATED_WITH_DB_LOCK")) { clearTimeout(timeout); yes(); } });
      child.stderr.on("data", data => { stderr += data.toString(); });
      child.once("exit", () => { if (!stdout.includes("NATIVE_HEARTBEAT_VALIDATED_WITH_DB_LOCK")) { clearTimeout(timeout); no(new Error(stdout + stderr)); } });
    });
    const adoption = cli(f, "apply"); assert.equal(adoption.code, 2); assert.equal(state(f).audit.length, 0);
    child.stdin.end("continue\n"); const exit = await new Promise<number | null>(yes => child.once("close", yes)); assert.equal(exit, 0, stdout + stderr);
    const committed = state(f); assert.notEqual(committed.snapshot.tables.claims[0].heartbeat, 123456);
    const retry = cli(f, "recover"); assert.equal(retry.code, 2); assert.deepEqual(state(f), committed);
  } finally { if (child.exitCode === null) child.kill("SIGKILL"); }
});

for (const [variant, reason] of [["main", "MAIN_CHANGED"], ["clock", "CUSTODY_EXPIRED"]]) {
  test(`V09 P07: late before-CAS ${variant} drift refuses inside native custody without row mutation`, { timeout: 240000 }, () => {
    const f = fixture(), before = state(f);
    const code = importTool + String.raw`
q=m.decode(m.read(sys.argv[2])); variant=sys.argv[3]; original=m.recheck; calls=0
def gated(ctx,request):
 global calls
 calls+=1
 if calls==6:
  if variant=='main':
   m.git(ctx['repository'],'commit','--allow-empty','-m','Synthetic main advancement')
   m.git(ctx['repository'],'update-ref','refs/remotes/origin/main',m.head(ctx['repository']))
  else:
   real=m.time.time; m.time.time=lambda:real()+901
 return original(ctx,request)
m.recheck=gated
sys.argv=[sys.argv[0],'apply','--request',sys.argv[2]]; sys.exit(m.main())
`;
    const r = spawnSync(python, ["-B", "-c", code, tool, f.request, variant], { cwd: sourceRoot, encoding: "utf8", timeout: 180000 });
    assert.equal(r.status, 2, r.stdout + r.stderr); assert.equal(JSON.parse(r.stdout.trim()).reason, reason); assert.deepEqual(state(f), before);
  });
}

test("R1 D2: PREPARED stale native snapshot refuses before either Git head or journal advances", { timeout: 180000 }, () => {
  const f = fixture(); assert.equal(cli(f, "prepare").code, 0);
  const q = JSON.parse(readFileSync(f.request, "utf8")), journal = resolve(f.private, `cold-adoption-${q.request_id}.json`);
  const bytes = readFileSync(journal);
  py(`db=sqlite3.connect(sys.argv[2]); db.execute("UPDATE runs SET plan=plan||'-changed' WHERE run='unrelated-finalized'"); db.commit(); db.close(); print(json.dumps(True))`, [f.store]);
  const committed = state(f), r = cli(f, "recover"); assert.equal(r.code, 2); assert.equal(r.result.reason, "NATIVE_SNAPSHOT_CHANGED");
  assert.deepEqual(readFileSync(journal), bytes); assert.deepEqual(state(f), committed);
  assert.equal(py(`print(json.dumps([m.head(pathlib.Path(sys.argv[2])),m.head(pathlib.Path(sys.argv[3]))]))`, [f.integration, f.worker]).join(","), `${f.base},${f.checkpoint}`);
});

for (const variant of ["audit-extra", "audit-extra-prefix"]) test(`R1 V05: ${variant} is conflicting schema in an exact-bound request and refuses without mutation`, { timeout: 180000 }, () => {
  const f = fixture(variant);
  const physical = disk(f.root), r = cli(f, "apply"); assert.equal(r.code, 2); assert.equal(r.result.reason, "AUDIT_SCHEMA_CONFLICT");
  assert.deepEqual(disk(f.root), physical);
  assert.equal(py(`db=sqlite3.connect(sys.argv[2]); print(json.dumps(db.execute('SELECT generation FROM claims WHERE run=?',(m.RUN,)).fetchone()[0])); db.close()`, [f.store]), 1);
});

test("R1 conservation: actual unexpected row write after audit INSERT rolls back schema, owner, claim and audit", { timeout: 240000 }, () => {
  const f = fixture(), before = state(f);
  const code = importTool + String.raw`
original=m.database
@contextlib.contextmanager
def injected(*a,**kw):
 with original(*a,**kw) as db:
  class Proxy:
   def execute(self,sql,*args):
    result=db.execute(sql,*args)
    if sql.startswith('INSERT INTO coordinator_successions'):
     db.execute('UPDATE claims SET generation=2 WHERE run=?',(m.RUN,))
    return result
   def __getattr__(self,key): return getattr(db,key)
  yield Proxy()
m.database=injected
sys.argv=[sys.argv[0],'apply','--request',sys.argv[2]]; sys.exit(m.main())
`;
  const r = spawnSync(python, ["-B", "-c", code, tool, f.request], { cwd: sourceRoot, encoding: "utf8", timeout: 180000 });
  assert.equal(r.status, 2, r.stdout + r.stderr); assert.equal(JSON.parse(r.stdout.trim()).reason, "CONSERVATION_FAILED");
  assert.deepEqual(state(f), before); assert.equal(state(f).audit.length, 0);
  const recovered = cli(f, "recover"); assert.equal(recovered.code, 0, recovered.stdout); assert.equal(state(f).audit.length, 1);
});

test("V07 P05 P09: new owner rejects old-base evidence and wrong branch/pin through unchanged helper", { timeout: 240000 }, () => {
  const f = fixture(), adopted = cli(f, "apply"); assert.equal(adopted.code, 0, adopted.stdout);
  const before = state(f);
  const evidence = py(`q=m.decode(m.read(sys.argv[2])); p=q['proposal']
with m.database(pathlib.Path(sys.argv[3])) as db: r,c,plan=m.target(m.snapshot(db))
e=dict(schema_version=2,run_id=m.RUN,story_id=m.STORY,worker=m.WORKER,generation=1,base_sha=p['old_base'],result_sha=p['worker_candidate'],workflow_version=plan['workflow_version'],spec_revision=plan['stories'][0]['spec_revision'],changed_paths=[],checks=[],review={},routes=[],publication={})
file=pathlib.Path(p['private_root'])/'old-base-evidence.json'; file.write_text(m.canonical(e)); print(json.dumps(str(file)))`, [f.request, f.store]);
  const stale = native(f, "submit", successor, ["--story", story, "--worker", worker, "--generation", "1", "--evidence", evidence]);
  assert.notEqual(stale.status, 0); assert.match(stale.stdout, /Evidence base_sha mismatch/); assert.deepEqual(state(f), before);
  py(`repo=pathlib.Path(sys.argv[2]); m.git(repo,'checkout','-b','codex/wrong-branch'); print(json.dumps(True))`, [f.worker]);
  const wrongBranch = native(f, "heartbeat", successor, ["--story", story, "--worker", worker, "--generation", "1"]);
  assert.notEqual(wrongBranch.status, 0); assert.match(wrongBranch.stdout, /Worker branch identity changed/); assert.deepEqual(state(f), before);
  py(`repo=pathlib.Path(sys.argv[2]); m.git(repo,'checkout','codex/story-35-6-crm-record-journeys'); p=repo/'_bmad/custom/bmad-build.toml'; p.write_bytes(p.read_bytes()+b'\\n# synthetic pin drift\\n'); print(json.dumps(True))`, [f.worker]);
  const wrongPin = native(f, "heartbeat", successor, ["--story", story, "--worker", worker, "--generation", "1"]);
  assert.notEqual(wrongPin.status, 0); assert.match(wrongPin.stdout, /Worker workflow changed since assignment/); assert.deepEqual(state(f), before);
});

test("V10: native pending, unknown, finalized, extra-author and nonnull-evidence states refuse before writes", { timeout: 180000 }, async t => {
  const cases = [
    ["finalized run", "UPDATE runs SET state='finalized',final_sha='synthetic' WHERE run='e35-6-20261102'", "RUN_STATE"],
    ["unknown run", "DELETE FROM runs WHERE run='e35-6-20261102'", "TARGET_CARDINALITY"],
    ["nonnull evidence", "UPDATE claims SET evidence='{}' WHERE run='e35-6-20261102'", "CLAIM_STATE"],
    ["nonnull result", "UPDATE claims SET result_sha='synthetic' WHERE run='e35-6-20261102'", "CLAIM_STATE"],
    ["extra retained claim", "INSERT INTO claims VALUES('e35-6-20261102','extra','other',1,'codex/extra','synthetic-extra','base',1,'blocked',NULL,NULL,NULL,'hold')", "TARGET_CARDINALITY"],
    ["target journal", "INSERT INTO journal VALUES('e35-6-20261102','spec-design-35-6-35-6','before','result',NULL,'prepared')", "TARGET_PENDING_OPERATION"],
    ["target publication", "INSERT INTO story_pr_publications(run,story,repository,pr_number,pr_url,branch,base_branch,head_sha,state,observation_json) VALUES('e35-6-20261102','spec-design-35-6-35-6','rthunborg/Kopplas',127,'url','branch','main','head','pr-ready','{}')", "TARGET_PENDING_OPERATION"],
    ["foreign prepared operation", "INSERT INTO journal VALUES('foreign','foreign','before','result',NULL,'prepared')", "REPOSITORY_PENDING_OPERATION"],
    ["other active author", "INSERT INTO claims VALUES('foreign','foreign','other',1,'codex/foreign','synthetic-foreign','base',1,'blocked',NULL,NULL,NULL,'hold')", "OTHER_ACTIVE_AUTHOR"],
  ];
  for (const [name, sql, reason] of cases) await t.test(name, () => {
    const f = fixture();
    py(`db=sqlite3.connect(sys.argv[2]); db.execute(sys.argv[3]); db.commit(); db.close(); print(json.dumps(True))`, [f.store, sql]);
    const physical = disk(f.root), result = cli(f, "apply");
    assert.equal(result.code, 2); assert.equal(result.result.reason, reason); assert.deepEqual(disk(f.root), physical);
  });
});
