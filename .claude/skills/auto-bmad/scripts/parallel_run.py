#!/usr/bin/env python3
"""Opt-in one-host/shared-repository sprint coordinator; no shell evidence execution."""
import argparse
import contextlib
import copy
import hashlib
import importlib.util
import json
from pathlib import Path, PurePosixPath
import re
import sqlite3
import subprocess
import sys
import time

VERSION = 1
MODEL = 'gpt-6.1-sol'
SENSITIVE = {'tenant-isolation','tenancy','provisioning','rbac','permissions','authentication','authorization','security','rls','secrets','public-tokens','money-tax','transactional-integrity','critical-conflict'}
WORKFLOW_PATHS = ['.agents/skills/auto-bmad/', '.claude/skills/auto-bmad/', '_bmad/custom/', '_bmad-output/auto-bmad/config.yaml', '_bmad/bmm/config.yaml', '_bmad/core/config.yaml', '.codex/config.toml', '.claude/settings.json']
AGGREGATE = ['_bmad-output/auto-bmad/state/epic/', '_bmad-output/auto-bmad/reports/epic-', '_bmad-output/implementation-artifacts/sprint-status.yaml', '_bmad-output/implementation-artifacts/deferred-work.md', '_bmad-output/implementation-artifacts/deferred-work-resolved.md', '_bmad-output/auto-bmad/deferred/', '_bmad-output/deferred/', 'docs/deferred/'] + WORKFLOW_PATHS

def workflow_version(repo,ref=None):
    paths = git(repo,'ls-tree','-r','--name-only',ref,'--',*WORKFLOW_PATHS).splitlines() if ref else git(repo,'ls-files','--',*WORKFLOW_PATHS).splitlines()
    require(paths,'No tracked Auto-BMAD workflow to pin')
    hashes=[]
    for path in sorted(paths):
        if ref:
            data=subprocess.run(['git','-C',str(repo),'show',ref+':'+path],capture_output=True,timeout=30)
            require(data.returncode==0,'Cannot read pinned workflow: '+path)
            content=data.stdout
        else:
            content=(Path(repo)/path).read_bytes()
        hashes.append([path,hashlib.sha256(content.replace(b'\r\n',b'\n')).hexdigest()])
    return digest(hashes)

class Refusal(Exception):
    pass

def require(condition, message):
    if not condition:
        raise Refusal(message)

def keys(value, required, optional=()):
    require(isinstance(value, dict), 'Expected JSON object')
    require(set(required) <= set(value), 'Missing fields: ' + ', '.join(sorted(set(required)-set(value))))
    require(set(value) <= set(required)|set(optional), 'Unknown fields: ' + ', '.join(sorted(set(value)-set(required)-set(optional))))

def strings(value, label):
    require(isinstance(value, list) and all(isinstance(x,str) and x.strip() for x in value), label+' must be an array of nonempty strings')
    require(len(value)==len(set(value)), label+' contains duplicates')
    return value

def read_json(path):
    def unique(pairs):
        out = {}
        for k,v in pairs:
            require(k not in out, 'Duplicate JSON key: '+k)
            out[k] = v
        return out
    return json.loads(Path(path).read_text(encoding='utf-8-sig'), object_pairs_hook=unique)

def canonical(value):
    return json.dumps(value,sort_keys=True,separators=(',',':'))

def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()

def git(repo,*args,check=True):
    proc = subprocess.run(['git','-C',str(repo),*args],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=120)
    if check:
        require(proc.returncode==0,'Git operation failed: '+ ' '.join(args[:2]) + ': '+proc.stderr.strip())
    return proc.stdout.strip() if check else proc

def common(repo):
    return Path(git(repo,'rev-parse','--path-format=absolute','--git-common-dir')).resolve()

def top(repo):
    return Path(git(repo,'rev-parse','--show-toplevel')).resolve()

def sha(repo,ref):
    require(isinstance(ref,str) and not ref.startswith('-') and ref.strip(), 'Invalid Git ref')
    result = git(repo,'rev-parse','--verify',ref+'^{commit}')
    require(re.fullmatch('[0-9a-f]{40,64}',result) is not None, 'Invalid resolved commit')
    return result

def ancestor(repo,old,new):
    return git(repo,'merge-base','--is-ancestor',old,new,check=False).returncode == 0

def clean(repo):
    require(not git(repo,'status','--porcelain'), 'Worktree must be completely clean: '+str(repo))
    require(not (Path(git(repo,'rev-parse','--absolute-git-dir'))/'MERGE_HEAD').exists(),'Unfinished Git merge')

def branch(repo):
    return git(repo,'symbolic-ref','--quiet','--short','HEAD')

def path_token(token):
    # Brackets are literal filename characters (for example Next.js route segments).
    # Ownership comparisons below use equality/prefix checks, never glob matching.
    require(isinstance(token,str) and token and '\\' not in token and not any(c in token for c in '*?\n\r\x00'), 'Paths must be exact relative POSIX paths or trailing-slash prefixes')
    p = PurePosixPath(token)
    require(not p.is_absolute() and '..' not in p.parts and '.' not in p.parts and ':' not in token and p.parts[0] != '.git','Unsafe path: '+token)
    require(str(p)+( '/' if token.endswith('/') else '')==token,'Noncanonical path: '+token)
    return token

def covers(token,path):
    token,path=token.casefold(),path.casefold()
    return path.startswith(token) if token.endswith('/') or token.endswith('epic-') else path==token

def overlap(a,b):
    a,b=a.casefold(),b.casefold()
    return covers(a,b.rstrip('/')) or covers(b,a.rstrip('/')) or (a.endswith('/') and b.startswith(a)) or (b.endswith('/') and a.startswith(b))

def worktrees(repo):
    raw = git(repo,'worktree','list','--porcelain','-z')
    return [Path(x[9:]).resolve() for x in raw.split('\x00') if x.startswith('worktree ')]

def scalar(text,key):
    match = re.search(r'^'+re.escape(key)+r':[ \t]*(.*?)[ \t]*$',text,re.M)
    value=match.group(1).strip().strip('\"\'') if match else None
    return None if value in {None,'','null','Null','NULL','~'} else value

def registered_parallel_anchor(repo,p,wt,anchor,target):
    store=common(repo)/'auto-bmad-parallel.sqlite3'
    if not store.is_file(): return False
    with contextlib.closing(sqlite3.connect(store)) as conn:
        run=conn.execute('SELECT plan FROM runs WHERE run=?',(p['run_id'],)).fetchone()
        if not run: return False
        stored=json.loads(run[0])
        if anchor.parent.name=='epic':
            if str(scalar(anchor.read_text(encoding='utf-8-sig'),'epic_num') or anchor.stem.removeprefix('epic-'))!=str(stored['epic']): return False
            if Path(stored['integration_worktree']).resolve()==wt: return True
            # Clean worker worktrees inherit the coordinator's committed anchor.
            # It conveys no ownership there: accept only its exact immutable base blob.
            claim=next((row for row in conn.execute('SELECT worktree,base_sha FROM claims WHERE run=?',(p['run_id'],)) if Path(row[0]).resolve()==wt),None)
            base=claim[1] if claim else sha(stored['integration_worktree'],'HEAD')
            if not claim and sha(wt,'HEAD')!=base: return False
            relative=anchor.relative_to(wt).as_posix()
            blob=subprocess.run(['git','-C',str(wt),'show',base+':'+relative],capture_output=True,timeout=30)
            return blob.returncode==0 and blob.stdout.replace(b'\r\n',b'\n')==anchor.read_bytes().replace(b'\r\n',b'\n') and scalar(blob.stdout.decode('utf-8-sig'),'parallel_run_id')==p['run_id']
        relative=anchor.relative_to(wt).as_posix()
        for row in conn.execute('SELECT worktree,story,base_sha,result_sha FROM claims WHERE run=?',(p['run_id'],)):
            if not (target==row[1] or anchor.stem.startswith(row[1]+'-')): continue
            contract=story(stored,row[1])
            if not any(covers(token,relative) for token in contract['write_paths']): continue
            if Path(row[0]).resolve()==wt: return True
            if not row[3]: continue
            # A merged worker's state remains an owned artifact in the coordinator.
            # The claim/store, rather than its review/done text, grants that identity.
            if Path(stored['integration_worktree']).resolve()==wt:
                if ancestor(repo,row[3],sha(wt,'HEAD')): return True
                continue
            own=next((x for x in conn.execute('SELECT worktree,base_sha FROM claims WHERE run=?',(p['run_id'],)) if Path(x[0]).resolve()==wt),None)
            base=own[1] if own else sha(stored['integration_worktree'],'HEAD')
            if not own and sha(wt,'HEAD')!=base: continue
            if not ancestor(repo,row[3],base): continue
            blob=subprocess.run(['git','-C',str(wt),'show',base+':'+relative],capture_output=True,timeout=30)
            if blob.returncode==0 and blob.stdout.replace(b'\r\n',b'\n')==anchor.read_bytes().replace(b'\r\n',b'\n'): return True
        return False

def legacy_conflicts(repo,plan,s=None):
    collisions = []
    ids = {s['id']} if s else {x['id'] for x in plan['stories']}
    for reservation in plan['legacy_reservations']:
        targets=[s] if s else plan['stories']
        if str(reservation['epic'])==str(plan['epic']) or ids.intersection(reservation['stories']) or any(conflicts(x,reservation) for x in targets):
            collisions.append({'source':'reservation','path':reservation['worktree'],'reason':reservation['reason']})
    for wt in worktrees(repo):
        require(wt.is_dir(),'Registered worktree missing; cannot scan legacy ownership: '+str(wt))
        state = wt/'_bmad-output'/'auto-bmad'/'state'
        for anchor in list(state.glob('*.yaml'))+list((state/'epic').glob('*.yaml')):
            text = anchor.read_text(encoding='utf-8-sig')
            if scalar(text,'status') in {'done','completed','abandoned'}:
                continue
            epic = scalar(text,'epic_num') or scalar(text,'epic')
            if anchor.parent.name=='epic' and epic is None:
                epic = anchor.stem.removeprefix('epic-')
            target = scalar(text,'story_id') or scalar(text,'active_story') or anchor.stem
            # This coordinator's worker state files are recognized by explicit run identity.
            if scalar(text,'parallel_run_id')==plan['run_id'] and registered_parallel_anchor(repo,plan,wt,anchor,target):
                continue
            if str(epic)==str(plan['epic']) or target in ids or any(anchor.stem.startswith(x+'-') for x in ids):
                collisions.append({'source':'legacy-anchor','path':str(anchor),'reason':'In-flight legacy ownership'})
    return collisions

def validate_plan(repo,p):
    if isinstance(p,dict) and p.get('schema_version')==2: return stories_pr_plan(repo,p)
    keys(p,['schema_version','story_source','run_id','epic','coordinator','integration_branch','integration_worktree','base_sha','workflow_version','max_workers','stories','integrated_prerequisites','legacy_reservations','shared_paths','final_required_checks'])
    require(p['schema_version']==VERSION and type(p['schema_version']) is int,'Unsupported plan schema')
    require(p['story_source']=='sprint','Only explicit sprint story plans are supported; stories/cross-host/clones are unsupported')
    for field in ['run_id','epic','coordinator','integration_branch','integration_worktree','base_sha','workflow_version']:
        require(isinstance(p[field],str) and p[field].strip(),field+' must be a nonempty string')
    require(type(p['max_workers']) is int and 1 <= p['max_workers'] <= 2,'max_workers must be 1 or 2')
    require(p['integration_branch'].startswith('codex/'),'Integration branch must use codex/')
    require(isinstance(p['stories'],list) and p['stories'],'stories must be nonempty')
    require(isinstance(p['integrated_prerequisites'],list) and isinstance(p['legacy_reservations'],list),'Prerequisites and reservations must be arrays')
    for token in strings(p['shared_paths'],'shared_paths'): path_token(token)
    require(strings(p['final_required_checks'],'final_required_checks'),'Final epic gate check names required')
    ids = set()
    for s in p['stories']:
        keys(s,['id','approved','spec_path','spec_revision','prerequisites','write_paths','conflict_domains','contracts','requires_contracts','risk_domains','required_checks'])
        require(isinstance(s['id'],str) and re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*',s['id']) and s['id'] not in ids,'Invalid/duplicate story ID')
        ids.add(s['id'])
        require(s['approved'] is True,'Unapproved story: '+s['id'])
        path_token(s['spec_path'])
        require(not s['spec_path'].endswith('/'),'spec_path must be a file')
        require(isinstance(s['spec_revision'],str) and re.fullmatch('[0-9a-f]{64}',s['spec_revision']),'spec_revision must be SHA256')
        for field in ['prerequisites','write_paths','conflict_domains','contracts','risk_domains','required_checks']: strings(s[field],field)
        require(s['write_paths'] and s['required_checks'],'Ownership and required checks cannot be empty')
        for token in s['write_paths']:
            path_token(token)
            require(not any(overlap(token,x) for x in AGGREGATE+p['shared_paths']),'Worker ownership includes aggregate/shared state: '+token)
        if any(overlap(x,'supabase/migrations/') for x in s['write_paths']):
            require('schema:migrations' in s['conflict_domains'],'Migration ownership requires schema:migrations conflict domain; migrations are serialized')
        require(set(s['risk_domains']) <= SENSITIVE|{'ordinary'},'Unknown risk domain')
        require(isinstance(s['requires_contracts'],list),'requires_contracts must be an array')
        for c in s['requires_contracts']:
            keys(c,['story','contract'])
            require(c['story'] in s['prerequisites'] and isinstance(c['contract'],str),'Required contract must name a prerequisite')
    external = {}
    for e in p['integrated_prerequisites']:
        keys(e,['id','commit','checks_passed','contracts'])
        require(isinstance(e['id'],str) and e['id'] not in external and e['id'] not in ids,'Duplicate prerequisite ID')
        require(e['checks_passed'] is True,'Prerequisite has no passing gates')
        require(sha(repo,e['commit'])==e['commit'],'Prerequisite commit must be exact SHA')
        strings(e['contracts'],'contracts'); external[e['id']]=e
    byid = {s['id']:s for s in p['stories']}
    def visit(id,stack,seen):
        require(id not in stack,'Dependency cycle: '+id)
        if id in seen: return
        for dep in byid[id]['prerequisites']:
            require(dep in byid or dep in external,'Unknown prerequisite: '+dep)
            if dep in byid: visit(dep,stack|{id},seen)
        seen.add(id)
    seen = set()
    for id in byid: visit(id,set(),seen)
    for s in p['stories']:
        for c in s['requires_contracts']:
            require(c['contract'] in (byid.get(c['story']) or external[c['story']])['contracts'],'Missing prerequisite contract: '+c['contract'])
    for r in p['legacy_reservations']:
        keys(r,['epic','stories','reason','worktree','write_paths','conflict_domains']); strings(r['stories'],'reservation stories')
        require(all(isinstance(r[x],str) and r[x] for x in ['epic','reason','worktree']),'Incomplete legacy reservation')
        for token in strings(r['write_paths'],'reservation paths'): path_token(token)
        strings(r['conflict_domains'],'reservation domains')
        require(Path(r['worktree']).resolve() in worktrees(repo),'Legacy reservation worktree is not registered')
    require(sha(repo,p['base_sha'])==p['base_sha'],'base_sha must be exact commit SHA')
    require(workflow_version(repo,p['base_sha'])==p['workflow_version'],'workflow_version does not match committed base workflow')
    integration = Path(p['integration_worktree']).resolve()
    require(integration in worktrees(repo) and common(integration)==common(repo),'Integration worktree must be registered in the same repository')
    require(branch(integration)==p['integration_branch'],'Integration worktree branch mismatch')
    require(ancestor(repo,p['base_sha'],sha(integration,'HEAD')),'Plan base is not integration ancestor')
    for config_path in ['_bmad-output/auto-bmad/config.yaml','_bmad/bmm/config.yaml','_bmad/core/config.yaml']:
        configuration=integration/config_path
        if configuration.is_file():
            config=configuration.read_text(encoding='utf-8-sig')
            for field,expected in [('output_folder','_bmad-output'),('implementation_artifacts','_bmad-output/implementation-artifacts'),('planning_artifacts','_bmad-output/planning-artifacts')]:
                value=scalar(config,field)
                require(value is None or value in {expected,'{project-root}/'+expected},'Custom '+field+' is unsupported by parallel v1')
    for s in p['stories']:
        blob = subprocess.run(['git','-C',str(repo),'show',p['base_sha']+':'+s['spec_path']],capture_output=True,timeout=30)
        require(blob.returncode==0 and hashlib.sha256(blob.stdout.replace(b'\r\n',b'\n')).hexdigest()==s['spec_revision'],'Approved spec revision mismatch: '+s['id'])
    return p

def conflicts(a,b):
    return bool({x.casefold() for x in a['conflict_domains']} & {x.casefold() for x in b['conflict_domains']}) or any(overlap(x,y) for x in a['write_paths'] for y in b['write_paths'])

def report(repo,p,claims=None):
    if p.get('schema_version')==2: return stories_pr_report(repo,p,claims)
    head = sha(p['integration_worktree'],'HEAD')
    claims = claims or {}
    ready,blocked = [],{}
    external = {x['id']:x for x in p['integrated_prerequisites']}
    collisions=[]
    for s in p['stories']:
        reasons=[]
        legacy=legacy_conflicts(repo,p,s); collisions.extend(legacy)
        if legacy: reasons.append('legacy ownership collision')
        if s['id'] in claims: reasons.append('already claimed: '+claims[s['id']]['state'])
        for dep in s['prerequisites']:
            e = external.get(dep) or claims.get(dep)
            commit = e.get('commit') if dep in external else e.get('integration_sha') if e and e['state']=='integrated' else None
            if not commit or not ancestor(repo,commit,head): reasons.append('prerequisite not verified integration ancestor: '+dep)
        if reasons: blocked[s['id']]=reasons
        else: ready.append(s['id'])
    stories = {s['id']:s for s in p['stories']}
    pairs = [[a,b] for i,a in enumerate(ready) for b in ready[i+1:] if not conflicts(stories[a],stories[b])]
    return {'schema_version':VERSION,'run_id':p['run_id'],'integration_head':head,'ready':ready,'ready_pairs':pairs,'blocked':blocked,'legacy_conflicts':collisions}

SCHEMA = '''
CREATE TABLE IF NOT EXISTS runs(run TEXT PRIMARY KEY, epic TEXT NOT NULL, owner TEXT NOT NULL, plan TEXT NOT NULL, plan_hash TEXT NOT NULL, state TEXT NOT NULL, final_sha TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS active_epic ON runs(epic) WHERE state != 'finalized';
CREATE TABLE IF NOT EXISTS claims(run TEXT NOT NULL, story TEXT NOT NULL, worker TEXT NOT NULL, generation INTEGER NOT NULL, branch TEXT NOT NULL, worktree TEXT NOT NULL, base_sha TEXT NOT NULL, heartbeat REAL NOT NULL, state TEXT NOT NULL, evidence TEXT, result_sha TEXT, integration_sha TEXT, block_reason TEXT, PRIMARY KEY(run,story));
CREATE UNIQUE INDEX IF NOT EXISTS occupied_worktree ON claims(worktree) WHERE state != 'integrated';
CREATE UNIQUE INDEX IF NOT EXISTS occupied_branch ON claims(branch) WHERE state != 'integrated';
CREATE TABLE IF NOT EXISTS journal(run TEXT NOT NULL, story TEXT NOT NULL, before_sha TEXT NOT NULL, result_sha TEXT NOT NULL, after_sha TEXT, state TEXT NOT NULL, PRIMARY KEY(run,story));
CREATE TABLE IF NOT EXISTS verifications(run TEXT NOT NULL, story TEXT NOT NULL, sha TEXT NOT NULL, evidence TEXT NOT NULL, PRIMARY KEY(run,story));
CREATE TABLE IF NOT EXISTS claim_amendments(request_id TEXT PRIMARY KEY, run TEXT NOT NULL, story TEXT NOT NULL, request_hash TEXT NOT NULL, before_plan TEXT NOT NULL, before_plan_hash TEXT NOT NULL, after_plan TEXT NOT NULL, after_plan_hash TEXT NOT NULL, before_claim TEXT NOT NULL, after_claim TEXT NOT NULL, request TEXT NOT NULL, stopped_writers TEXT NOT NULL, response TEXT NOT NULL, created REAL NOT NULL);
CREATE TRIGGER IF NOT EXISTS immutable_claim_amendments_update BEFORE UPDATE ON claim_amendments BEGIN SELECT RAISE(ABORT, 'Claim amendment audit is append-only'); END;
CREATE TRIGGER IF NOT EXISTS immutable_claim_amendments_delete BEFORE DELETE ON claim_amendments BEGIN SELECT RAISE(ABORT, 'Claim amendment audit is append-only'); END;
CREATE TABLE IF NOT EXISTS finalization_adoptions(request_id TEXT PRIMARY KEY, run TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL, before_snapshot TEXT NOT NULL, request TEXT NOT NULL, receipts TEXT NOT NULL, final_evidence TEXT NOT NULL, response TEXT NOT NULL, created REAL NOT NULL);
CREATE TRIGGER IF NOT EXISTS immutable_finalization_adoptions_update BEFORE UPDATE ON finalization_adoptions BEGIN SELECT RAISE(ABORT, 'Finalization adoption audit is append-only'); END;
CREATE TRIGGER IF NOT EXISTS immutable_finalization_adoptions_delete BEFORE DELETE ON finalization_adoptions BEGIN SELECT RAISE(ABORT, 'Finalization adoption audit is append-only'); END;
CREATE TABLE IF NOT EXISTS story_pr_publications(run TEXT NOT NULL, story TEXT NOT NULL, repository TEXT NOT NULL, pr_number INTEGER NOT NULL, pr_url TEXT NOT NULL, branch TEXT NOT NULL, base_branch TEXT NOT NULL, head_sha TEXT NOT NULL, state TEXT NOT NULL, intent_json TEXT, observation_json TEXT NOT NULL, merge_sha TEXT, verification_json TEXT, PRIMARY KEY(run,story));
'''

@contextlib.contextmanager
def database(repo):
    path=common(repo)/'auto-bmad-parallel.sqlite3'
    conn=sqlite3.connect(path,timeout=30,isolation_level=None)
    conn.row_factory=sqlite3.Row
    try:
        conn.execute('PRAGMA foreign_keys=ON')
        conn.executescript(SCHEMA)
        conn.execute('BEGIN IMMEDIATE')
        yield conn
        conn.execute('COMMIT')
    except Exception:
        if conn.in_transaction: conn.execute('ROLLBACK')
        raise
    finally: conn.close()

def rows(db,run):
    return {r['story']:dict(r) for r in db.execute('SELECT * FROM claims WHERE run=?',(run,))}

def get_run(db,a):
    row=db.execute('SELECT * FROM runs WHERE run=?',(a.run,)).fetchone()
    require(row is not None,'Unknown run')
    require(row['owner']==a.owner,'Exact coordinator owner required')
    require(row['state']!='finalized' or a.command=='status','Run already finalized')
    p=json.loads(row['plan'])
    require(digest(p)==row['plan_hash'],'Stored plan integrity failure')
    require(workflow_version(p['integration_worktree'])==p['workflow_version'],'Integration workflow changed since run admission')
    return p

def get_claim(db,a,worker=False):
    row=db.execute('SELECT * FROM claims WHERE run=? AND story=?',(a.run,a.story)).fetchone()
    require(row is not None,'Unknown claim')
    c=dict(row)
    if worker:
        require(c['worker']==a.worker and c['generation']==a.generation,'Stale generation or wrong worker')
    require(Path(c['worktree']).resolve() in worktrees(a.repo) and common(c['worktree'])==common(a.repo),'Worker repository/worktree identity changed')
    require(branch(c['worktree'])==c['branch'],'Worker branch identity changed')
    return c

def story(p,id):
    found=next((s for s in p['stories'] if s['id']==id),None)
    require(found is not None,'Unknown story')
    return found

def assignment(p,c):
    return {'schema_version':VERSION,'run_id':p['run_id'],'epic':p['epic'],'owner':p['coordinator'],'repo':p['integration_worktree'],'story':story(p,c['story']),'worker':c['worker'],'generation':c['generation'],'branch':c['branch'],'worktree':c['worktree'],'base_sha':c['base_sha'],'workflow_version':p['workflow_version'],'state':c['state'],'model':MODEL,'required_effort':'high' if set(story(p,c['story'])['risk_domains']) & SENSITIVE else 'low','worker_phases':['test','build','independent-review','review-fix'],'forbidden_phases':['epic-reconciliation','epic-finalization','publish-pr','merge-base']}

def changed(repo,base,result):
    return sorted(set(x for x in git(repo,'diff','--name-only','-z','--no-renames',base,result,'--').split('\x00') if x))

def validate_diff(repo,p,c,base,result,repair=False):
    paths=changed(repo,base,result)
    tokens=story(p,c['story'])['write_paths']+(p['shared_paths'] if repair else [])
    require(paths and all(any(covers(token,path) for token in tokens) for path in paths),'Changed paths outside assigned ownership')
    if not repair:
        require(not any(covers(token,path) for token in AGGREGATE+p['shared_paths'] for path in paths),'Worker modified aggregate/shared state')
    for commit in [base,result]:
        tree=git(repo,'ls-tree','-r','-z',commit,'--',*paths)
        require(not any(x.startswith('120000 ') or x.startswith('160000 ') for x in tree.split('\x00')),'Symlink/submodule changes are unsupported')
    return paths

def checks(e,required,commit):
    require(isinstance(e,list),'checks must be an array')
    names=[]
    for check in e:
        keys(check,['name','argv','result','executed','skipped','commit'],['environment'])
        require(check['commit']==commit and check['result']=='passed','Check failed or evidence commit mismatch')
        require(type(check['executed']) is int and check['executed']>0 and type(check['skipped']) is int and check['skipped']==0,'Required checks must execute with zero skips')
        require(isinstance(check['argv'],list) and check['argv'] and all(isinstance(x,str) and x for x in check['argv']),'Check argv must be nonempty string array')
        require(isinstance(check['name'],str),'Invalid check name'); names.append(check['name'])
        if 'environment' in check: require(isinstance(check['environment'],dict),'Check environment must be data object')
        if re.search(r'(^|[-_:])(rls|integration|database|db)([-_:]|$)',check['name'],re.I):
            require(check.get('environment',{}).get('SUPABASE_TEST_REQUIRED')=='1','Required database/RLS check needs SUPABASE_TEST_REQUIRED=1 evidence')
    require(len(names)==len(set(names)) and set(required)<=set(names),'Missing or duplicate required checks')

def review(e,commit,worker,domains):
    keys(e,['approved','reviewer','commit','model','effort','unresolved'])
    require(e['approved'] is True and isinstance(e['reviewer'],str) and e['reviewer'].strip() and e['reviewer']!=worker and e['commit']==commit and e['unresolved']==[],'Independent review is incomplete, stale or has unresolved findings')
    require(e['model']==MODEL and e['effort'] in {'low','medium','high'},'Invalid review model/effort')
    require(not set(domains)&SENSITIVE or e['effort']=='high','Sensitive review requires high effort')

def validate_evidence(repo,p,c,e):
    keys(e,['schema_version','run_id','story_id','worker','generation','base_sha','result_sha','workflow_version','spec_revision','changed_paths','checks','review','routes'])
    s=story(p,c['story'])
    require(workflow_version(c['worktree'])==p['workflow_version'],'Worker workflow changed since assignment')
    require(e['schema_version']==VERSION and type(e['schema_version']) is int and type(e['generation']) is int,'Unsupported evidence schema/generation')
    for field,expected in [('run_id',p['run_id']),('story_id',c['story']),('worker',c['worker']),('generation',c['generation']),('base_sha',c['base_sha']),('workflow_version',p['workflow_version']),('spec_revision',s['spec_revision'])]: require(e[field]==expected,'Evidence '+field+' mismatch')
    result=sha(repo,e['result_sha']); require(result==e['result_sha'],'Result requires exact commit SHA')
    require(sha(c['worktree'],'HEAD')==result and sha(repo,c['branch'])==result,'Result is not exact worker branch HEAD')
    require(ancestor(repo,c['base_sha'],result) and result!=c['base_sha'],'Result is not committed work atop assignment base')
    paths=validate_diff(repo,p,c,c['base_sha'],result)
    require(e['changed_paths']==paths,'Evidence changed_paths do not match Git diff')
    require(paths and all(any(covers(token,path) for token in s['write_paths']) for path in paths),'Worker changed paths outside assigned ownership')
    require(not any(covers(token,path) for token in AGGREGATE+p['shared_paths'] for path in paths),'Worker modified aggregate/shared state')
    checks(e['checks'],s['required_checks'],result)
    review(e['review'],result,c['worker'],s['risk_domains'])
    require(isinstance(e['routes'],list) and e['routes'],'Missing recorded routes')
    require(any(isinstance(r,dict) and r.get('phase')=='build' for r in e['routes']),'Missing build routing decision')
    for r in e['routes']:
        keys(r,['phase','model','effort','risk_domains','reason'])
        require(isinstance(r['phase'],str) and r['phase'] and r['model']==MODEL and r['effort'] in {'low','medium','high'} and isinstance(r['reason'],str) and r['reason'],'Invalid route')
        strings(r['risk_domains'],'route risk_domains')
        require(set(s['risk_domains']) <= set(r['risk_domains']) and set(r['risk_domains']) <= SENSITIVE|{'ordinary'},'Risk domains omitted or unknown')
        require(not set(r['risk_domains'])&SENSITIVE or r['effort']=='high','Sensitive route requires high effort')
    return result

def combined_evidence(p,c,e,head,final=False):
    keys(e,['schema_version','run_id','integration_sha','checks','review','unresolved'])
    require(e['schema_version']==VERSION and type(e['schema_version']) is int and e['run_id']==p['run_id'] and e['integration_sha']==head and e['unresolved']==[],'Combined evidence identity mismatch or unresolved findings')
    required=sorted({x for s in p['stories'] for x in s['required_checks']}|set(p['final_required_checks'])) if final else story(p,c['story'])['required_checks']
    domains=sorted({x for s in p['stories'] for x in s['risk_domains']}) if final else story(p,c['story'])['risk_domains']
    checks(e['checks'],required,head)
    review(e['review'],head,p['coordinator'],domains)

def integrate(a):
    # Journal admission commits before Git mutation, which cannot join a SQLite transaction.
    with database(a.repo) as db:
        p=get_run(db,a); c=get_claim(db,a); target=p['integration_worktree']
        require(not legacy_conflicts(a.repo,p,story(p,a.story)),'Legacy ownership appeared during run')
        clean(target); clean(c['worktree'])
        require(branch(target)==p['integration_branch'],'Integration branch identity changed')
        journal=db.execute('SELECT * FROM journal WHERE run=? AND story=?',(a.run,a.story)).fetchone()
        head=sha(target,'HEAD')
        require(not db.execute("SELECT 1 FROM journal WHERE run=? AND story!=? AND state='prepared'",(a.run,a.story)).fetchone(),'Another integration requires recovery')
        if journal:
            j=dict(journal)
            require(c['result_sha']==j['result_sha'],'Integration result changed')
            if j['state']=='merged':
                require(head==j['after_sha'],'Integration HEAD changed since journal completion')
                return {'state':c['state'],'integration_sha':head,'recovered':True}
            parents=git(target,'rev-list','--parents','-n','1',head).split()[1:]
            if parents==[j['before_sha'],j['result_sha']]:
                validate_diff(a.repo,p,c,j['before_sha'],head)
                db.execute("UPDATE journal SET after_sha=?,state='merged' WHERE run=? AND story=?",(head,a.run,a.story))
                db.execute("UPDATE claims SET integration_sha=?,state='awaiting-verification' WHERE run=? AND story=?",(head,a.run,a.story))
                return {'state':'awaiting-verification','integration_sha':head,'recovered':True}
            require(head==j['before_sha'],'Uncertain integration: HEAD differs from journal; inspect without resetting')
            before=j['before_sha']; result=j['result_sha']
        else:
            require(c['state']=='ready-for-integration','Worker result not ready')
            require(a.expected_head==head,'Integration HEAD changed; refresh expected-head')
            require(not db.execute("SELECT 1 FROM claims WHERE run=? AND state='awaiting-verification'",(a.run,)).fetchone(),'Verify previous integration before merging another result')
            validate_evidence(a.repo,p,c,json.loads(c['evidence']))
            before=head; result=c['result_sha']
            db.execute('INSERT INTO journal VALUES(?,?,?,?,NULL,?)',(a.run,a.story,before,result,'prepared'))
            db.execute("UPDATE claims SET state='integrating' WHERE run=? AND story=?",(a.run,a.story))
    with database(a.repo) as db:
        p=get_run(db,a); c=get_claim(db,a); target=p['integration_worktree']
        require(sha(target,'HEAD')==before,'Integration HEAD changed before merge')
        clean(target); clean(c['worktree'])
        validate_evidence(a.repo,p,c,json.loads(c['evidence']))
        require(branch(target)==p['integration_branch'],'Integration branch changed')
        proc=git(target,'merge','--no-ff','--no-edit','-m','Auto-BMAD '+a.run+' '+a.story,result,check=False)
        require(proc.returncode==0,'Integration merge failed; journal retained, resolve/abort explicitly: '+proc.stderr.strip())
        head=sha(target,'HEAD')
        require(git(target,'rev-list','--parents','-n','1',head).split()[1:]==[before,result],'Unexpected merge shape')
        validate_diff(a.repo,p,c,before,head)
        integration_checkpoint()
        db.execute("UPDATE journal SET after_sha=?,state='merged' WHERE run=? AND story=?",(head,a.run,a.story))
        db.execute("UPDATE claims SET integration_sha=?,state='awaiting-verification' WHERE run=? AND story=?",(head,a.run,a.story))
        return {'state':'awaiting-verification','integration_sha':head,'recovered':False}

def integration_checkpoint():
    """No-op, patched only by synthetic tests to simulate commit-before-journal crash."""

def recovery_tool_sha256():
    """Pin the separately invoked recovery executable, not the active workflow."""
    return hashlib.sha256(Path(__file__).read_bytes().replace(b'\r\n',b'\n')).hexdigest()

def stopped_writers(request,c,p):
    q=request['quiescence']
    keys(q,['coordinator','attested','complete_writer_inventory','evidence_path','evidence_sha256'])
    require(q['coordinator']==p['coordinator'] and q['attested'] is True and q['complete_writer_inventory'] is True,'Explicit coordinator quiescence and complete writer inventory attestation required')
    require(isinstance(q['evidence_path'],str) and Path(q['evidence_path']).is_absolute(),'Stopped-writer evidence must be an absolute file reference')
    data=Path(q['evidence_path']).read_bytes()
    require(isinstance(q['evidence_sha256'],str) and hashlib.sha256(data).hexdigest()==q['evidence_sha256'],'Stopped-writer evidence digest mismatch')
    e=read_json(q['evidence_path'])
    # Bind the parsed evidence to the bytes hashed above, even if its file changes.
    require(Path(q['evidence_path']).read_bytes()==data,'Stopped-writer evidence changed during validation')
    keys(e,['schema_version','run_id','story_id','worker','generation','branch','worktree','checkpoint_sha','writers'])
    require(type(e['schema_version']) is int and e['schema_version']==1 and type(e['generation']) is int,'Unsupported stopped-writer evidence schema/generation')
    for field,expected in [('run_id',p['run_id']),('story_id',c['story']),('worker',c['worker']),('generation',c['generation']),('branch',c['branch']),('checkpoint_sha',request['checkpoint_sha'])]:
        require(e[field]==expected,'Stopped-writer evidence '+field+' mismatch')
    require(isinstance(e['worktree'],str) and Path(e['worktree']).is_absolute() and Path(e['worktree']).resolve()==Path(c['worktree']).resolve(),'Stopped-writer worktree mismatch')
    require(isinstance(e['writers'],list) and e['writers'],'Stopped-writer evidence needs the worker and all write-capable delegates')
    identities=[]
    for w in e['writers']:
        keys(w,['identity','role','state','evidence_ref'])
        require(all(isinstance(w[x],str) and w[x].strip() for x in ['identity','role','evidence_ref']) and w['state']=='stopped','Every writer needs stopped status and a source evidence reference')
        identities.append(w['identity'])
    require(len(identities)==len(set(identities)) and any(w['identity']==c['worker'] and w['role']=='worker' for w in e['writers']),'Stopped-writer inventory must uniquely include the assigned worker')
    return e

def amendment_checkpoint():
    """No-op, patched only by synthetic tests to simulate transactional failure."""

def amend_blocked(a):
    """Explicit additive readmission at a stopped-writer checkpoint; no Git mutation."""
    require((common(a.repo)/'auto-bmad-parallel.sqlite3').is_file(),'Recovery requires an existing shared run store')
    r=read_json(a.request)
    keys(r,['schema_version','request_id','run_id','story_id','owner','worker','expected_generation','expected_plan_hash','expected_integration_sha','checkpoint_sha','add_write_paths','add_conflict_domains','reason','scope_approval_ref','recovery_tool_sha256','quiescence'])
    require(type(r['schema_version']) is int and r['schema_version']==1,'Unsupported amendment request schema')
    require(type(r['expected_generation']) is int and r['expected_generation']>0,'Expected generation must be a positive integer')
    for field,expected in [('run_id',a.run),('story_id',a.story),('owner',a.owner),('worker',a.worker),('expected_generation',a.generation)]:
        require(r[field]==expected,'Amendment request '+field+' mismatch')
    for field in ['request_id','reason','scope_approval_ref']:
        require(isinstance(r[field],str) and r[field].strip(),'Amendment '+field+' required')
    require(re.fullmatch('[A-Za-z0-9][A-Za-z0-9._-]{0,127}',r['request_id']) is not None,'Invalid amendment request ID')
    require(r['recovery_tool_sha256']==recovery_tool_sha256(),'Recovery executable does not match approved tooling digest')
    additions=strings(r['add_write_paths'],'add_write_paths')
    domains=strings(r['add_conflict_domains'],'add_conflict_domains')
    require(additions,'At least one exact additional path required')
    for token in additions:
        path_token(token); require(not token.endswith('/') and not token.casefold().endswith('epic-'),'Amendment additions must be exact files, not directory/report prefixes')
    require(len({x.casefold() for x in additions})==len(additions) and len({x.casefold() for x in domains})==len(domains),'Case-insensitive amendment duplicates')
    with database(a.repo) as db:
        p=get_run(db,a)
        prior=db.execute('SELECT * FROM claim_amendments WHERE request_id=?',(r['request_id'],)).fetchone()
        if prior:
            require(prior['run']==a.run and prior['story']==a.story and prior['request_hash']==digest(r),'Amendment request ID already used with different inputs')
            return {**json.loads(prior['response']),'replayed':True}
        run=db.execute('SELECT * FROM runs WHERE run=?',(a.run,)).fetchone()
        require(run['state']=='active' and run['plan_hash']==r['expected_plan_hash'],'Run state or expected plan hash changed')
        c=get_claim(db,a,worker=True)
        require(c['state']=='blocked' and c['block_reason'],'Only deliberately blocked claims can be amended')
        require(c['integration_sha'] is None,'A merged claim cannot be amended')
        require(not db.execute("SELECT 1 FROM journal WHERE (run=? AND story=?) OR state='prepared'",(a.run,a.story)).fetchone(),'Integration journal must be reconciled before claim amendment')
        require(not db.execute('SELECT 1 FROM verifications WHERE run=? AND story IN (?,?)',(a.run,a.story,'__repair__'+a.story)).fetchone(),'Existing verification prevents claim amendment')
        target=p['integration_worktree']; wt=Path(c['worktree']).resolve()
        require(not any(Path(__file__).resolve().is_relative_to(Path(root).resolve()) for root in [target,wt]),'Invoke recovery tooling from a separate maintenance checkout')
        require(branch(target)==p['integration_branch'],'Integration branch identity changed')
        clean(target); clean(wt)
        require(branch(target)==p['integration_branch'] and branch(wt)==c['branch'],'Checkpoint branch identity changed during amendment')
        require(sha(target,'HEAD')==r['expected_integration_sha'],'Integration checkpoint HEAD mismatch')
        require(sha(wt,'HEAD')==r['checkpoint_sha'] and sha(a.repo,c['branch'])==r['checkpoint_sha'],'Worker checkpoint HEAD mismatch')
        require(workflow_version(wt)==p['workflow_version'],'Worker workflow changed since assignment')
        require(ancestor(a.repo,c['base_sha'],r['checkpoint_sha']),'Worker checkpoint lost pinned base ancestry')
        validate_plan(a.repo,p)
        if r['checkpoint_sha']!=c['base_sha']:
            validate_diff(a.repo,p,c,c['base_sha'],r['checkpoint_sha'])
        receipt=stopped_writers(r,c,p)
        revised=copy.deepcopy(p); s=story(revised,a.story)
        for token in additions:
            require(not any(covers(old,token) for old in s['write_paths']),'Additional path is already owned: '+token)
            for root,head in [(wt,r['checkpoint_sha']),(Path(target).resolve(),r['expected_integration_sha'])]:
                require((root/token).resolve().is_relative_to(root),'Additional path follows symlink outside worktree')
                parts=PurePosixPath(token).parts
                prefixes=['/'.join(parts[:n]) for n in range(1,len(parts)+1)]
                tree=git(root,'ls-tree','-z',head,'--',*prefixes)
                require(not any(x.startswith('120000 ') or x.startswith('160000 ') for x in tree.split('\x00')),'Symlink/submodule ownership is unsupported')
                require(not (root/token).is_dir(),'Additional ownership must name a file')
        require(not {x.casefold() for x in domains}&{x.casefold() for x in s['conflict_domains']},'Additional conflict domain is already declared')
        s['write_paths']+=additions; s['conflict_domains']+=domains
        validate_plan(a.repo,revised)
        require(not legacy_conflicts(a.repo,revised,s),'Legacy ownership collision during amendment')
        for other in db.execute("SELECT c.*,r.plan,r.plan_hash FROM claims c JOIN runs r ON c.run=r.run WHERE c.state!='integrated'"):
            if other['run']==a.run and other['story']==a.story: continue
            op=json.loads(other['plan']); require(digest(op)==other['plan_hash'],'Other run plan integrity failure')
            require(not conflicts(s,story(op,other['story'])),'Amendment conflicts with repository claim ownership')
        for other in db.execute("SELECT plan,plan_hash FROM runs WHERE state!='finalized'"):
            op=json.loads(other['plan']); require(digest(op)==other['plan_hash'],'Other run plan integrity failure')
            require(not any(overlap(token,shared) for token in s['write_paths'] for shared in op['shared_paths']),'Amendment overlaps coordinator shared ownership')
            require(not any(conflicts(s,reservation) for reservation in op['legacy_reservations']),'Amendment conflicts with declared legacy reservation')
        # Git cannot join the database transaction. Recheck the quiesced checkpoints
        # immediately before CAS; coordinator attestation covers continued silence.
        clean(target); clean(wt)
        require(branch(target)==p['integration_branch'] and branch(wt)==c['branch'],'Checkpoint branch identity changed during amendment')
        require(sha(target,'HEAD')==r['expected_integration_sha'] and sha(wt,'HEAD')==r['checkpoint_sha'],'Checkpoint changed during amendment')
        require(stopped_writers(r,c,p)==receipt,'Stopped-writer evidence changed during amendment')
        revised_hash=digest(revised); now=time.time()
        updated=db.execute("UPDATE runs SET plan=?,plan_hash=? WHERE run=? AND owner=? AND state='active' AND plan_hash=?",(canonical(revised),revised_hash,a.run,a.owner,r['expected_plan_hash']))
        require(updated.rowcount==1,'Plan compare-and-swap failed')
        # The unchanged v1 submit validator enforces descent from claims.base_sha.
        # Anchor the next generation at the fully validated checkpoint so an old
        # worker cannot discard its reviewed history by branching from the old base.
        updated=db.execute("UPDATE claims SET generation=?,base_sha=?,state='claimed',evidence=NULL,result_sha=NULL,block_reason=NULL,heartbeat=? WHERE run=? AND story=? AND worker=? AND generation=? AND base_sha=? AND state='blocked'",(c['generation']+1,r['checkpoint_sha'],now,a.run,a.story,a.worker,a.generation,c['base_sha']))
        require(updated.rowcount==1,'Claim generation compare-and-swap failed')
        amended=get_claim(db,a)
        response={**assignment(revised,amended),'amendment_request_id':r['request_id'],'plan_hash':revised_hash,'checkpoint_sha':r['checkpoint_sha'],'previous_base_sha':c['base_sha'],'replayed':False}
        db.execute('INSERT INTO claim_amendments VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(r['request_id'],a.run,a.story,digest(r),canonical(p),digest(p),canonical(revised),revised_hash,canonical(c),canonical(amended),canonical(r),canonical(receipt),canonical(response),now))
        amendment_checkpoint()
        return response


# Owner-authorized inherited skips only. A test identity is (repository file,
# complete framework title), never a count, substring, short ID or basename.
RECOVERY_SKIP = ('tests/integration/ops/recovery-storage-immutability.int.test.ts',
    'isolated recovery Storage physical-loader proof serves loader-materialized bytes without mutating logical rows and rejects generic plus quote-PDF overwrite attempts')
FINALIZATION_SKIPS = {
    'full-integration-rls': [RECOVERY_SKIP],
    'general-browser': [
        ('tests/e2e/quotes/quote-lost-reason-retry-safety.e2e.spec.ts', '[P1][10.5-E2E-01] each retry uses a fresh lost-reason target and still proves the terminal result'),
        ('tests/e2e/quotes/quote-follow-up-retry-safety.e2e.spec.ts', '[P1][10.5-E2E-02] a retry plans a follow-up on its own untouched sent quote and proves the chip'),
        ('tests/e2e/quotes/quote-follow-up-retry-safety.e2e.spec.ts', '[P1][10.5-E2E-03] a retry completes its own open follow-up and retains decide-here assertions'),
    ],
}
FINALIZATION_CHECKS = set('documents-source-unit documents-integration-rls files-signed-access-integration documents-browser unit typecheck lint production-build service-role-containment bundle-containment lockfiles documents-baseline-storage-boundary documents-selected-link-unit documents-selected-link-lock-races-integration documents20-2-filter-unit documents20-2-lifecycle-integration documents20-2-browser documents20-3-context-unit documents20-3-context-integration documents20-3-browser full-integration-rls empty-migration-seed-reset isolated-storage-recovery-integration general-browser dashboard-browser epic11-pilot-performance scope-manifest-coherence epic20-trace-gate epic20-nfr epic20-test-review epic20-deferred-reconciliation epic20-deferred-archive epic20-retrospective epic20-completion-report exact-head-required-ci ci-verify ci-db ci-recovery-storage-loader ci-e2e ci-dashboard-e2e'.split())

def hashed_artifact(ref, snapshots):
    keys(ref,['path','sha256'])
    require(isinstance(ref['path'],str) and Path(ref['path']).is_absolute(),'Receipt needs an absolute file path')
    require(isinstance(ref['sha256'],str) and re.fullmatch('[0-9a-f]{64}',ref['sha256']),'Receipt needs a raw SHA256')
    data=Path(ref['path']).read_bytes()
    require(hashlib.sha256(data).hexdigest()==ref['sha256'],'Raw receipt hash mismatch')
    snapshots.append((ref.copy(),data))
    return data

def artifact_json(ref,snapshots):
    data=hashed_artifact(ref,snapshots)
    parsed=read_json(ref['path'])
    require(Path(ref['path']).read_bytes()==data,'Receipt changed during parsing')
    return parsed

def source_root(value):
    # Source paths belong to the executor, which may be Linux CI while adoption
    # runs on Windows. Compare lexical paths; never resolve foreign paths locally.
    require(isinstance(value,str) and value,'Execution source root required')
    value=value.replace('\\','/').rstrip('/')
    require(value.startswith('/') or re.match(r'^[A-Za-z]:/',value),'Execution source root must be absolute')
    require(str(PurePosixPath(value))==value and '..' not in PurePosixPath(value).parts,'Noncanonical execution source root')
    return value

def receipt_path(file,root):
    require(isinstance(file,str) and file,'Framework case file required')
    file=file.replace('\\','/'); root=source_root(root)
    if file.startswith('/') or re.match(r'^[A-Za-z]:/',file):
        compare_file=file.casefold() if re.match(r'^[A-Za-z]:/',root) else file
        compare_root=root.casefold() if re.match(r'^[A-Za-z]:/',root) else root
        require(compare_file.startswith(compare_root+'/'),'Framework case file outside report worktree')
        file=file[len(root)+1:]
    return path_token(file)

def framework_cases(raw,framework,root):
    """Parse all physical cases before any partition; reject failures/duplicates."""
    cases=[]
    if framework=='vitest':
        require(raw.get('success') is True and raw.get('numFailedTests')==0 and raw.get('numFailedTestSuites')==0 and raw.get('numPendingTestSuites')==0 and raw.get('numTodoTests',0)==0,'Raw Vitest report failed or incomplete')
        require(isinstance(raw.get('testResults'),list) and raw['testResults'],'Missing Vitest test results')
        for suite in raw['testResults']:
            require(suite.get('status')=='passed' and not suite.get('message'),'Raw Vitest suite failed or incomplete')
            file=receipt_path(suite['name'],root)
            for case in suite['assertionResults']:
                status=case['status']
                require(status in {'passed','pending','skipped'} and not case.get('failureMessages'),'Raw Vitest case failed or incomplete')
                full=case['fullName']
                require(full==' '.join(case['ancestorTitles']+[case['title']]),'Vitest full title mismatch')
                cases.append((file,full,'skipped' if status in {'pending','skipped'} else 'passed'))
        passed=sum(x[2]=='passed' for x in cases); skipped=len(cases)-passed
        require(raw.get('numPassedTests')==passed and raw.get('numPendingTests')==skipped and raw.get('numTotalTests')==len(cases),'Vitest raw counters disagree with physical cases')
    elif framework=='playwright':
        require(raw.get('errors')==[] and isinstance(raw.get('suites'),list),'Raw Playwright errors or missing suites')
        test_root=source_root(raw.get('config',{}).get('rootDir'))
        require(test_root==source_root(root) or receipt_path(test_root,root),'Playwright test root outside report worktree')
        def visit(suite,titles,top_file=False):
            # The top file suite is represented by file separately, not title.
            nested=[] if top_file else titles+[suite['title']]
            for spec in suite.get('specs',[]):
                require(spec.get('ok') is True,'Raw Playwright spec not successful')
                file=receipt_path(test_root+'/'+path_token(spec['file'].replace('\\','/')),root)
                tests=spec['tests']
                require(isinstance(tests,list) and tests,'Missing Playwright physical cases')
                for case in tests:
                    require(case['status'] in {'expected','skipped'},'Raw Playwright failed, interrupted or flaky case')
                    results=case['results']
                    require(isinstance(results,list) and results,'Missing Playwright result')
                    expected='skipped' if case['status']=='skipped' else 'passed'
                    require(case.get('expectedStatus')==expected,'Playwright expected-failure evidence is not passing coverage')
                    require(len(results)==1 and results[0]['status']==expected and not results[0].get('errors') and results[0].get('retry',0)==0,'Playwright retries/failures/incomplete results not accepted')
                    cases.append((file,' '.join(nested+[spec['title']]),expected))
            for child in suite.get('suites',[]): visit(child,nested)
        for suite in raw['suites']: visit(suite,[],top_file=True)
        stats=raw['stats']; passed=sum(x[2]=='passed' for x in cases); skipped=len(cases)-passed
        require(stats.get('unexpected')==0 and stats.get('flaky')==0 and stats.get('expected')==passed and stats.get('skipped')==skipped,'Playwright raw counters disagree with physical cases')
    else: raise Refusal('Unsupported framework report')
    require(cases and len({(x[0],x[1]) for x in cases})==len(cases),'Missing or duplicate physical test identity')
    require(all(isinstance(x[1],str) and x[1].strip() for x in cases),'Empty physical test title')
    return cases

def final_receipt(ref,check,head,target,snapshots):
    native=artifact_json(ref,snapshots)
    keys(native,['schema_version','name','commit','execution_sha','source_tree','argv','environment','native_exit','execution_state','executed','skipped','failed','framework','report','log','case_files','report_worktree'])
    require(type(native['schema_version']) is int and native['schema_version']==1,'Unsupported native receipt schema')
    require(type(native['native_exit']) is int and native['native_exit']==0 and native['execution_state']=='completed' and type(native['failed']) is int and native['failed']==0,'Native receipt failed, aborted or incomplete')
    for field in ['name','argv','executed','skipped']:
        require(native[field]==check[field] and type(native[field]) is type(check[field]),'Native receipt '+field+' mismatch')
    require(native['commit']==head==check['commit'] and native['environment']==check.get('environment',{}),'Native receipt identity mismatch')
    require(set(native['environment'])<={'SUPABASE_TEST_REQUIRED','ISOLATED_RECOVERY_STORAGE_PROOF'},'Receipt environment must contain only non-secret verification flags')
    executor=sha(target,native['execution_sha'])
    require(executor==native['execution_sha'] and ancestor(target,head,executor),'Execution checkout must retain candidate ancestry')
    require(git(target,'rev-parse',executor+'^{tree}')==native['source_tree']==git(target,'rev-parse',head+'^{tree}'),'Execution checkout tree differs from final candidate')
    source_root(native['report_worktree'])
    # CI can use another physical checkout path; its exact root is reviewed data.
    hashed_artifact(native['log'],snapshots)
    files=strings(native['case_files'],'case_files')
    for file in files: path_token(file)
    if native['framework']=='command':
        require(native['report'] is None and files==[] and check['skipped']==0,'Command receipts cannot admit skips or case partitions')
        return {'native':native,'cases':[]}
    cases=framework_cases(artifact_json(native['report'],snapshots),native['framework'],native['report_worktree'])
    if check['name'] in FINALIZATION_SKIPS or check['name']=='isolated-storage-recovery-integration':
        require(files==[],'Exception and recovery receipts must cover their complete physical report')
    if files:
        require(set(files)<=set(x[0] for x in cases),'Case partition contains absent files')
        cases=[x for x in cases if x[0] in files]
    require(check['executed']==sum(x[2]=='passed' for x in cases) and check['skipped']==sum(x[2]=='skipped' for x in cases),'Physical receipt counts mismatch')
    return {'native':native,'cases':cases}

def final_writers(db,p,claims,q,head,snapshots,final_verifiers):
    e=artifact_json(q,snapshots)
    keys(e,['schema_version','run_id','owner','plan_hash','integration_sha','workflow_version','complete_writer_inventory','includes_subsequent_authors_and_verifiers','inventory_source_refs','writers'])
    require(type(e['schema_version']) is int and e['schema_version']==1,'Unsupported final writer inventory schema')
    for field,expected in [('run_id',p['run_id']),('owner',p['coordinator']),('plan_hash',digest(p)),('integration_sha',head),('workflow_version',p['workflow_version'])]:
        require(e[field]==expected,'Final writer inventory '+field+' mismatch')
    require(e['complete_writer_inventory'] is True and e['includes_subsequent_authors_and_verifiers'] is True and strings(e['inventory_source_refs'],'inventory_source_refs'),'Complete subsequent author/verifier inventory attestation required')
    known={p['coordinator']}|{c['worker'] for c in claims.values()}|set(final_verifiers)
    for c in claims.values():
        if c['evidence']: known.add(json.loads(c['evidence'])['review']['reviewer'])
    for row in db.execute('SELECT evidence FROM verifications WHERE run=?',(p['run_id'],)):
        known.add(json.loads(row['evidence'])['review']['reviewer'])
    for row in db.execute('SELECT stopped_writers FROM claim_amendments WHERE run=?',(p['run_id'],)):
        known.update(w['identity'] for w in json.loads(row['stopped_writers'])['writers'])
    require(isinstance(e['writers'],list) and e['writers'],'Final stopped writers required')
    identities=[]
    for w in e['writers']:
        keys(w,['identity','role','state','evidence_ref'])
        require(all(isinstance(w[x],str) and w[x].strip() for x in ['identity','role','evidence_ref']) and w['state']=='stopped','Every final writer must be stopped with terminal source evidence')
        identities.append(w['identity'])
    require(len(identities)==len(set(identities)) and known<=set(identities),'Incomplete or duplicate final writer inventory')
    require(any(w['identity']==p['coordinator'] and w['role']=='coordinator' for w in e['writers']),'Stopped coordinator identity required')
    require(all(any(w['identity']==c['worker'] and w['role']=='worker' for w in e['writers']) for c in claims.values()),'Stopped assigned worker identities required')
    return e

def maintenance_identity(repo,p,claims,r):
    root=top(Path(__file__).resolve().parent)
    require(root in worktrees(repo) and common(root)==common(repo),'Maintenance executable must belong to a registered same-repository checkout')
    require(root not in {Path(p['integration_worktree']).resolve()}|{Path(c['worktree']).resolve() for c in claims.values()},'Invoke finalization tooling from a separate maintenance checkout')
    clean(root)
    require(sha(root,'HEAD')==r['reviewed_tooling_sha'],'Maintenance HEAD must equal independently reviewed tooling SHA')
    require(r['tool_sha256']==recovery_tool_sha256(),'Finalization executable digest mismatch')
    # Dirty source or untracked replacement is already refused by clean(root).
    require(branch(root).startswith('codex/'),'Maintenance checkout requires codex/ branch')
    return str(root)

def finalization_checkpoint():
    """No-op, patched only by synthetic tests to prove atomic rollback."""

def finalize_exceptions(a):
    """Quiesced adoption+finalization only; no workflow/claim/Git mutation."""
    r=read_json(a.request)
    keys(r,['schema_version','request_id','run_id','owner','expected_plan_hash','expected_integration_sha','workflow_version','reviewed_tooling_sha','tool_sha256','tooling_author','tooling_review','tooling_ci','human_decision','quiescence','evidence','receipts','adoption_review'])
    require(type(r['schema_version']) is int and r['schema_version']==1,'Unsupported finalization request schema')
    require(isinstance(r['request_id'],str) and re.fullmatch('[A-Za-z0-9][A-Za-z0-9._-]{0,127}',r['request_id']),'Invalid finalization request ID')
    require(r['run_id']==a.run and r['owner']==a.owner,'Finalization run/coordinator mismatch')
    require(isinstance(r['tooling_author'],str) and r['tooling_author'].strip(),'Tooling author identity required')
    review(r['tooling_review'],r['reviewed_tooling_sha'],r['tooling_author'],['transactional-integrity'])
    d=r['human_decision']; keys(d,['decision_id','human','date','reason','accepted_skips'])
    require(all(isinstance(d[x],str) and d[x].strip() for x in ['decision_id','human','date','reason']),'Recorded human decision and reason required')
    expected={k:[{'file':file,'full_name':title} for file,title in value] for k,value in FINALIZATION_SKIPS.items()}
    require(d['accepted_skips']==expected,'Human decision must identify exactly the supported inherited skips')
    with database(a.repo) as db:
        row=db.execute('SELECT * FROM runs WHERE run=?',(a.run,)).fetchone()
        require(row is not None and row['owner']==a.owner,'Unknown run or wrong coordinator')
        prior=db.execute('SELECT * FROM finalization_adoptions WHERE request_id=?',(r['request_id'],)).fetchone()
        if prior:
            require(prior['run']==a.run and prior['request_hash']==digest(r),'Finalization request token already used with different inputs')
            return {**json.loads(prior['response']),'replayed':True}
        p=get_run(db,a); claims=rows(db,a.run); head=r['expected_integration_sha']; target=p['integration_worktree']
        require(row['state']=='active' and row['plan_hash']==r['expected_plan_hash'] and r['workflow_version']==p['workflow_version'],'Finalization plan/state/workflow identity changed')
        required=set(p['final_required_checks'])|{x for s in p['stories'] for x in s['required_checks']}
        require(p['epic']=='20' and required==FINALIZATION_CHECKS,'Exception operation requires all 40 authorized Epic 20 gates')
        require(set(claims)=={s['id'] for s in p['stories']} and all(c['state']=='integrated' for c in claims.values()),'Required claims remain unfinished or unintegrated')
        require(not db.execute("SELECT 1 FROM journal WHERE state='prepared'").fetchone(),'Prepared repository integration prevents finalization adoption')
        for c in claims.values():
            verified=db.execute('SELECT sha FROM verifications WHERE run=? AND story=?',(a.run,c['story'])).fetchone()
            require(verified and verified['sha']==c['integration_sha'] and ancestor(a.repo,c['integration_sha'],head) and ancestor(a.repo,c['result_sha'],head),'Missing verified integration ancestry')
        for prerequisite in p['integrated_prerequisites']:
            require(ancestor(a.repo,prerequisite['commit'],head),'Prerequisite history missing from final candidate')
        maintenance=maintenance_identity(a.repo,p,claims,r)
        snapshots=[]
        tooling_ci=artifact_json(r['tooling_ci'],snapshots)
        keys(tooling_ci,['schema_version','commit','result','required_checks','checks','source_ref'])
        require(type(tooling_ci['schema_version']) is int and tooling_ci['schema_version']==1 and tooling_ci['commit']==r['reviewed_tooling_sha'] and tooling_ci['result']=='passed' and isinstance(tooling_ci['source_ref'],str) and tooling_ci['source_ref'].strip(),'Reviewed tooling CI must pass at the exact tooling SHA')
        require(strings(tooling_ci['required_checks'],'tooling required checks'),'Required tooling CI check names missing')
        checks(tooling_ci['checks'],tooling_ci['required_checks'],r['reviewed_tooling_sha'])
        e=artifact_json(r['evidence'],snapshots)
        keys(e,['schema_version','run_id','integration_sha','checks','review','unresolved'])
        require(type(e['schema_version']) is int and e['schema_version']==1 and e['run_id']==a.run and e['integration_sha']==head and e['unresolved']==[],'Final evidence stale or unresolved')
        review(e['review'],head,p['coordinator'],['transactional-integrity'])
        review_data=r['adoption_review']; keys(review_data,['approved','reviewer','commit','model','effort','unresolved','adoption_digest'])
        review({k:v for k,v in review_data.items() if k!='adoption_digest'},head,p['coordinator'],['transactional-integrity'])
        require(review_data['adoption_digest']==digest({k:v for k,v in r.items() if k!='adoption_review'}),'Independent High adoption review must bind the complete request and raw receipt hashes')
        q=final_writers(db,p,claims,r['quiescence'],head,snapshots,[e['review']['reviewer'],review_data['reviewer']])
        require(isinstance(r['receipts'],dict) and set(r['receipts'])==required,'Exactly all 40 native receipt references required')
        require(isinstance(e['checks'],list) and len(e['checks'])==len(required) and {c['name'] for c in e['checks']}==required,'Exactly all 40 final checks required')
        receipts={}
        for check in e['checks']:
            # Validate standard shapes/identities without changing the strict
            # default validator. Only the private copy has skips normalized.
            copied=copy.deepcopy(check); copied['skipped']=0
            checks([copied],[check['name']],head)
            require(type(check['skipped']) is int and check['skipped']>=0,'Invalid actual skip count')
            receipt=final_receipt(r['receipts'][check['name']],check,head,target,snapshots)
            skipped=[(x[0],x[1]) for x in receipt['cases'] if x[2]=='skipped']
            if check['name'] in FINALIZATION_SKIPS:
                require(sorted(skipped)==sorted(FINALIZATION_SKIPS[check['name']]),'Added, renamed, duplicate or missing inherited skip identity')
            else: require(check['skipped']==0 and skipped==[],'No exceptions for this required gate')
            receipts[check['name']]=receipt
        recovery=receipts['isolated-storage-recovery-integration']
        require(recovery['native']['framework']=='vitest' and recovery['native']['environment'].get('ISOLATED_RECOVERY_STORAGE_PROOF')=='1' and recovery['cases']==[(*RECOVERY_SKIP,'passed')],'Separate exact recovery-loader passing receipt required')
        require(receipts['full-integration-rls']['native']['framework']=='vitest' and receipts['general-browser']['native']['framework']=='playwright','Exception receipts require their real framework reports')
        before={'run':dict(row),'claims':claims,'verifications':[dict(x) for x in db.execute('SELECT * FROM verifications WHERE run=?',(a.run,))]}
        # Git and external writer status cannot join SQLite: maintain quiescence,
        # recheck all frozen facts/bytes immediately before CAS and audit insertion.
        clean(target); require(branch(target)==p['integration_branch'] and sha(target,'HEAD')==head,'Final candidate HEAD or branch changed')
        require(workflow_version(target)==p['workflow_version'],'Final workflow pin changed')
        maintenance_identity(a.repo,p,claims,r)
        for ref,data in snapshots:
            require(Path(ref['path']).read_bytes()==data,'Raw receipt changed before finalization')
        updated=db.execute("UPDATE runs SET state='finalized',final_sha=? WHERE run=? AND owner=? AND state='active' AND plan_hash=?",(head,a.run,a.owner,r['expected_plan_hash']))
        require(updated.rowcount==1,'Finalization compare-and-swap failed')
        db.execute('INSERT INTO verifications VALUES(?,?,?,?)',(a.run,'__final__',head,canonical(e)))
        response={'state':'finalized','integration_sha':head,'epic':p['epic'],'adoption_request_id':r['request_id'],'plan_hash':row['plan_hash'],'workflow_version':p['workflow_version'],'reviewed_tooling_sha':r['reviewed_tooling_sha'],'replayed':False,'skips_have_coverage_credit':False,'next':'Continue existing publication/merge approvals; no Git, pins, claims or sprint status changed'}
        retained={'quiescence':q,'tooling_ci':tooling_ci,'maintenance_checkout':maintenance,'checks':receipts,'raw_hashes':[ref for ref,data in snapshots]}
        db.execute('INSERT INTO finalization_adoptions VALUES(?,?,?,?,?,?,?,?,?)',(r['request_id'],a.run,digest(r),canonical(before),canonical(r),canonical(retained),canonical(e),canonical(response),time.time()))
        finalization_checkpoint()
        return response

_STORY_PR_MODULES = {}

def story_pr_module(name):
    if name not in _STORY_PR_MODULES:
        spec=importlib.util.spec_from_file_location('parallel_adapter_'+name,Path(__file__).with_name(name+'.py'))
        module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
        _STORY_PR_MODULES[name]=module
    return _STORY_PR_MODULES[name]

def stories_pr_requested(a):
    if a.command in {'plan','init'}:
        return read_json(a.plan).get('schema_version')==2
    store=common(a.repo)/'auto-bmad-parallel.sqlite3'
    if a.command=='version' or not store.is_file(): return False
    with contextlib.closing(sqlite3.connect(store.as_uri()+'?mode=ro',uri=True)) as db:
        row=db.execute('SELECT plan FROM runs WHERE run=?',(a.run,)).fetchone()
        return bool(row and json.loads(row[0]).get('schema_version')==2)

def story_pr_main(repo):
    return sha(repo,'refs/remotes/origin/main')

def story_pr_current_main(repo,p):
    head=story_pr_main(repo)
    require(workflow_version(repo,head)==p['workflow_version'],'Qualified main workflow differs from pinned workflow')
    source_pins(repo,p,False,head)
    return head

def source_identity(s):
    return (s['source']['spec_folder'].casefold(),s['source']['story_id'])

def source_blob(repo,commit,path):
    result=subprocess.run(['git','-C',str(repo),'show',commit+':'+path],capture_output=True,timeout=30)
    require(result.returncode==0,'Missing committed source: '+path)
    return result.stdout.replace(b'\r\n',b'\n')

def source_pins(repo,p,include_specs=False,commit=None):
    for s in p['stories']:
        refs=s['source']['files']+([{'path':s['spec_path'],'sha256':s['spec_revision']}] if include_specs else [])
        for ref in refs:
            path=Path(repo)/ref['path']
            require(path.resolve().is_relative_to(top(repo)),'Source path escapes worktree')
            content=source_blob(repo,commit,ref['path']) if commit else path.read_bytes().replace(b'\r\n',b'\n')
            require(hashlib.sha256(content).hexdigest()==ref['sha256'],'Frozen source revision mismatch: '+ref['path'])

def stories_pr_plan(repo,p):
    required=['schema_version','story_source','run_id','epic','coordinator','integration_branch','integration_worktree','base_sha','workflow_version','max_workers','stories','integrated_prerequisites','legacy_reservations','shared_paths','final_required_checks','publication_strategy','repository','base_branch']
    keys(p,required)
    require(type(p['schema_version']) is int and p['schema_version']==2 and p['story_source']=='stories' and p['publication_strategy']=='story-pr','Schema 2 requires stories / story-pr')
    require(p['base_branch']=='main' and isinstance(p['repository'],str) and re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',p['repository']),'Explicit repository and main target required')
    # Reuse the complete v1 ownership/contracts/base validator as an internal
    # projection. No stored v1 plan, evidence, assignment or dispatch is migrated.
    projection={k:copy.deepcopy(p[k]) for k in required if k not in {'publication_strategy','repository','base_branch'}}
    projection['schema_version']=1; projection['story_source']='sprint'
    folders={}; identities=set(); artifact_keys=set(); planner=story_pr_module('story_plan')
    require(isinstance(p['stories'],list) and p['stories'],'stories must be nonempty')
    for s,projected in zip(p['stories'],projection['stories']):
        keys(s,['id','approved','spec_path','spec_revision','prerequisites','write_paths','conflict_domains','contracts','requires_contracts','risk_domains','required_checks','source'],['independent_of_pending','concurrency_approval_ref'])
        src=s['source']; keys(src,['spec_folder','story_id','story_key','position','spec_checkpoint','done_checkpoint','files'])
        folder=path_token(src['spec_folder']); require(not folder.endswith('/'),'Source folder must have no trailing slash')
        path=(Path(repo)/folder).resolve()
        require(path.is_relative_to(top(repo)) and path.relative_to(top(repo)).as_posix().casefold()==folder.casefold(),'Noncanonical or escaping source folder')
        require(isinstance(src['story_id'],str) and src['story_id'] and s['id']==src['story_key'],'Original source ID/key required')
        identity=source_identity(s)
        require(identity not in identities,'Duplicate canonical source story identity'); identities.add(identity)
        require(s['id'].casefold() not in artifact_keys,'Source artifact key collision'); artifact_keys.add(s['id'].casefold())
        require(folder.casefold() not in folders,'Schema 2 supports one story per source folder')
        folders[folder.casefold()]=folder
        require(type(src['position']) is int and type(src['spec_checkpoint']) is bool and type(src['done_checkpoint']) is bool,'Invalid source order/checkpoint types')
        require(isinstance(src['files'],list) and len(src['files'])==2,'SPEC.md and stories.yaml pins required')
        for ref in src['files']:
            keys(ref,['path','sha256']); path_token(ref['path'])
            require(isinstance(ref['sha256'],str) and re.fullmatch('[0-9a-f]{64}',ref['sha256']),'Invalid source hash')
        require({r['path'] for r in src['files']}=={folder+'/SPEC.md',folder+'/stories.yaml'},'Source pins must name exact SPEC.md and stories.yaml')
        info,reason,_=planner.load_spec_folder(str(path)); require(not reason,'Invalid source: '+str(reason))
        require(len(info['stories'])==1,'Schema 2 supports one-story folders; multi-entry continuation is unsupported')
        resolved,code=planner.build_stories_resolve_result(str(path),src['story_id'])
        require(code==0 and not resolved['hard_stop'],'Invalid source story: '+str(resolved.get('hard_stop_reason')))
        require(not resolved['warnings'],'Source parser warnings require reconciliation: '+canonical(resolved['warnings']))
        for field in ['story_id','story_key','position','spec_checkpoint','done_checkpoint']:
            require(src[field]==resolved[field],'Source '+field+' does not match story_plan provenance')
        require(not src['spec_checkpoint'],'Unfulfilled source spec_checkpoint; use existing approved checkpoint route')
        require(resolved['story_file'] and Path(resolved['story_file']).resolve()==(Path(repo)/s['spec_path']).resolve(),'Approved spec must be exact folder+ID story file')
        require(resolved['current_status'] in {'ready-for-dev','in-progress','review','done'},'Source story is not ready for development')
        require(type(s.get('independent_of_pending',False)) is bool,'independent_of_pending must be boolean')
        require(not s.get('independent_of_pending',False) or isinstance(s.get('concurrency_approval_ref'),str) and s['concurrency_approval_ref'].strip(),'Concurrent independence requires reviewed permission')
        own={'_bmad-output/auto-bmad/state/'+s['id']+'.yaml','_bmad-output/auto-bmad/reports/'+s['id']+'.md',s['spec_path']}
        require(own<=set(s['write_paths']),'Worker must own exact own spec/state/report paths')
        for token in s['write_paths']:
            if overlap(token,folder+'/'): require(token==s['spec_path'],'Worker may only own exact own story spec within source folder')
            for prefix in ['_bmad-output/auto-bmad/state/','_bmad-output/auto-bmad/reports/']:
                if overlap(token,prefix): require(token in own,'Worker ownership includes sibling or aggregate bookkeeping')
        for field in ['source','independent_of_pending','concurrency_approval_ref']: projected.pop(field,None)
    validate_plan(repo,projection)
    slugs=set()
    for folder in folders.values():
        slug=planner.spec_slug_for(folder).casefold()
        require(slug not in slugs,'Different source folders collide on aggregate artifact paths'); slugs.add(slug)
    for s in p['stories']:
        for other in p['stories']:
            if other is s: continue
            require(not any(overlap(token,other['source']['spec_folder']+'/') for token in s['write_paths']),'Worker ownership includes another source folder')
    source_pins(repo,p,True,p['base_sha']); source_pins(repo,p,True)
    head=story_pr_main(repo)
    require(ancestor(repo,p['base_sha'],head),'Approved source base must already be on qualified main')
    source_pins(repo,p,True,head)
    require(workflow_version(repo,head)==p['workflow_version'],'Qualified main workflow differs from pinned workflow')
    return p

def story_pr_registered_anchor(repo,p,wt,anchor):
    store=common(repo)/'auto-bmad-parallel.sqlite3'
    if not store.is_file(): return False
    with contextlib.closing(sqlite3.connect(store.as_uri()+'?mode=ro',uri=True)) as db:
        row=db.execute('SELECT plan FROM runs WHERE run=?',(p['run_id'],)).fetchone()
        if not row or digest(json.loads(row[0]))!=digest(p): return False
        relative=anchor.relative_to(wt).as_posix()
        claims=[dict(zip(['story','worktree','base_sha','result_sha'],x)) for x in db.execute('SELECT story,worktree,base_sha,result_sha FROM claims WHERE run=?',(p['run_id'],))]
        own=next((c for c in claims if Path(c['worktree']).resolve()==wt),None)
        aggregate={p['epic']}|{'spec-'+story_pr_module('story_plan').spec_slug_for(s['source']['spec_folder']) for s in p['stories']}
        if anchor.parent.name=='epic' and anchor.stem in aggregate:
            if wt==Path(p['integration_worktree']).resolve(): return True
        elif own and relative=='_bmad-output/auto-bmad/state/'+own['story']+'.yaml': return True
        elif not any(relative=='_bmad-output/auto-bmad/state/'+c['story']+'.yaml' and c['result_sha'] and own and ancestor(repo,c['result_sha'],own['base_sha']) for c in claims): return False
        base=own['base_sha'] if own else story_pr_main(repo)
        if not own and sha(wt,'HEAD')!=base: return False
        try: content=source_blob(repo,base,relative)
        except Refusal: return False
        return content==anchor.read_bytes().replace(b'\r\n',b'\n') and scalar(content.decode('utf-8-sig'),'parallel_run_id')==p['run_id']

def story_pr_legacy_conflicts(repo,p,s):
    collisions=[]; identity=source_identity(s)
    for r in p['legacy_reservations']:
        if str(r['epic'])==p['epic'] or s['id'] in r['stories'] or s['source']['story_id'] in r['stories'] or conflicts(s,r):
            collisions.append({'source':'reservation','path':r['worktree'],'reason':r['reason']})
    for wt in worktrees(repo):
        require(wt.is_dir(),'Registered worktree missing; cannot scan legacy ownership: '+str(wt))
        state=wt/'_bmad-output/auto-bmad/state'
        for anchor in list(state.glob('*.yaml'))+list((state/'epic').glob('*.yaml')):
            content=anchor.read_text(encoding='utf-8-sig')
            if scalar(content,'status') in {'done','completed','abandoned'}: continue
            if scalar(content,'parallel_run_id')==p['run_id'] and story_pr_registered_anchor(repo,p,wt,anchor): continue
            source=scalar(content,'spec_folder'); matching=False
            if source:
                path=Path(source); path=path if path.is_absolute() else wt/path
                try: matching=path.resolve().relative_to(wt).as_posix().casefold()==identity[0]
                except ValueError: matching=False
            target=scalar(content,'story_key') or scalar(content,'active_story') or anchor.stem
            if matching or target==s['id'] or scalar(content,'epic_num')==p['epic'] or scalar(content,'epic')==p['epic']:
                collisions.append({'source':'legacy-anchor','path':str(anchor),'reason':'In-flight legacy ownership'})
    return collisions

def stories_pr_report(repo,p,claims=None):
    claims=claims or {}; head=story_pr_current_main(repo,p); ready=[]; blocked={}; collisions=[]
    external={e['id']:e for e in p['integrated_prerequisites']}
    for s in p['stories']:
        reasons=[]; old=story_pr_legacy_conflicts(repo,p,s); collisions.extend(old)
        if old: reasons.append('legacy ownership collision')
        if s['id'] in claims: reasons.append('already claimed: '+claims[s['id']]['state'])
        for dep in s['prerequisites']:
            item=external.get(dep) or claims.get(dep)
            commit=item.get('commit') if dep in external else item.get('integration_sha') if item and item['state']=='integrated' else None
            if not commit or not ancestor(repo,commit,head): reasons.append('prerequisite not verified main ancestor: '+dep)
        if reasons: blocked[s['id']]=reasons
        else: ready.append(s['id'])
    byid={s['id']:s for s in p['stories']}
    pairs=[[a,b] for i,a in enumerate(ready) for b in ready[i+1:] if not conflicts(byid[a],byid[b]) and byid[a].get('independent_of_pending',False) and byid[b].get('independent_of_pending',False)]
    return {'schema_version':2,'run_id':p['run_id'],'qualified_main_sha':head,'ready':ready,'ready_pairs':pairs,'blocked':blocked,'legacy_conflicts':collisions}

def story_pr_assignment(p,c):
    result=assignment(p,c); s=story(p,c['story'])
    result.update(schema_version=2,story_source='stories',publication_strategy='story-pr',repository=p['repository'],base_branch='main',source=copy.deepcopy(s['source']),source_namespace=s['source']['spec_folder'].casefold(),worker_phases=['test','build','independent-review','review-fix','publish-story-pr'],forbidden_phases=['epic-reconciliation','epic-finalization','merge-base'])
    return result

def story_pr_publication(p,c,observation,head,merging=False):
    require(isinstance(observation,dict),'Publication observation required')
    for field,expected in [('repository',p['repository']),('head_branch',c['branch']),('base_branch','main'),('head',head)]:
        require(observation.get(field)==expected,'Publication '+field+' mismatch')
    require(type(observation.get('pr_number')) is int and observation['pr_number']>0,'Observed PR number required')
    require(observation.get('pr_url')=='https://github.com/'+p['repository']+'/pull/'+str(observation['pr_number']),'Observed PR URL/repository mismatch')
    require(isinstance(observation.get('observation_ref'),str) and observation['observation_ref'].strip(),'Independent provider observation reference required')
    require(type(observation.get('visible_ui')) is bool,'Actual intended visible scope observation required')
    api=story_pr_module('pr_strategy'); errors=(api.merge_errors if merging else api.publish_errors)({'visible_ui':observation['visible_ui']},observation)
    require(not errors,'Existing story PR gate: '+'; '.join(errors))

def story_pr_evidence(repo,p,c,e):
    keys(e,['schema_version','run_id','story_id','worker','generation','base_sha','result_sha','workflow_version','spec_revision','changed_paths','checks','review','routes','publication'])
    require(type(e['schema_version']) is int and e['schema_version']==2,'Unsupported schema 2 evidence')
    projected={k:v for k,v in e.items() if k!='publication'}; projected['schema_version']=1
    result=validate_evidence(repo,p,c,projected)
    source_pins(c['worktree'],p); story_pr_publication(p,c,e['publication'],result)
    return result

def story_pr_combined(p,c,e,head,final=False):
    require(e.get('schema_version')==2 and type(e.get('schema_version')) is int,'Unsupported schema 2 combined evidence')
    combined_evidence(p,c,{**e,'schema_version':1},head,final)

def story_pr_merge_checkpoint():
    """Synthetic crash hook after durable intent; never calls a provider."""

def execute_story_pr(a):
    require(a.command not in {'integrate','repair','amend-blocked','finalize-exceptions'},'Schema 2 does not support legacy integration or maintenance APIs')
    if a.command=='plan': return stories_pr_report(a.repo,stories_pr_plan(a.repo,read_json(a.plan)))
    with database(a.repo) as db:
        if a.command=='init':
            p=stories_pr_plan(a.repo,read_json(a.plan)); require(a.owner==p['coordinator'],'Plan coordinator mismatch')
            clean(p['integration_worktree']); require(sha(p['integration_worktree'],'HEAD')==p['base_sha'],'Init requires exact plan base HEAD')
            existing=db.execute('SELECT * FROM runs WHERE run=?',(p['run_id'],)).fetchone()
            if existing: require(existing['owner']==a.owner and existing['plan_hash']==digest(p),'Run already owned or plan changed')
            else:
                own_sources={source_identity(s) for s in p['stories']}
                own_keys={s['id'].casefold() for s in p['stories']}
                own_folders={story_pr_module('story_plan').spec_slug_for(s['source']['spec_folder']).casefold() for s in p['stories']}
                for row in db.execute("SELECT plan FROM runs WHERE state!='finalized'"):
                    other=json.loads(row[0])
                    require(other['integration_branch']!=p['integration_branch'] and Path(other['integration_worktree']).resolve()!=Path(p['integration_worktree']).resolve(),'Coordinator branch/worktree already owned')
                    if other.get('schema_version')==2:
                        require(not own_sources.intersection(source_identity(s) for s in other['stories']),'Canonical source already owned')
                        require(not own_keys.intersection(s['id'].casefold() for s in other['stories']),'Source artifact key already owned')
                        require(not own_folders.intersection(story_pr_module('story_plan').spec_slug_for(s['source']['spec_folder']).casefold() for s in other['stories']),'Source aggregate artifact namespace already owned')
                require(not db.execute("SELECT 1 FROM claims WHERE worktree=? AND state!='integrated'",(str(Path(p['integration_worktree']).resolve()),)).fetchone(),'Coordinator checkout owned by worker')
                db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?,NULL)',(p['run_id'],p['epic'],a.owner,canonical(p),digest(p),'active'))
            return {'schema_version':2,'run_id':p['run_id'],'state':'active','store':str(common(a.repo)/'auto-bmad-parallel.sqlite3')}
        p=get_run(db,a); require(p['schema_version']==2,'Wrong protocol dispatch')
        source_pins(p['integration_worktree'],p)
        claims=rows(db,a.run)
        if a.command=='status':
            return {'schema_version':2,'run_id':a.run,'claims':[dict(story_pr_assignment(p,c),result_sha=c['result_sha'],integration_sha=c['integration_sha'],block_reason=c['block_reason'],heartbeat_age_seconds=round(time.time()-c['heartbeat'],2)) for c in claims.values()],'admission':stories_pr_report(a.repo,p,claims),'publications':[dict(r) for r in db.execute('SELECT * FROM story_pr_publications WHERE run=?',(a.run,))]}
        require(branch(p['integration_worktree'])==p['integration_branch'],'Coordinator branch identity changed')
        if a.command=='claim':
            require(a.worker and a.generation==1,'New claims require worker and generation 1; automatic transfers are unsupported')
            s=story(p,a.story); admission=stories_pr_report(a.repo,p,claims)
            require(a.story in admission['ready'],'Story not ready: '+canonical(admission['blocked'].get(a.story,[])))
            active=[dict(r) for r in db.execute("SELECT c.*,r.plan FROM claims c JOIN runs r ON c.run=r.run WHERE c.state!='integrated'")]
            require(sum(c['run']==a.run for c in active)<p['max_workers'] and len(active)<2,'Worker capacity reached; pending and blocked claims retain ownership')
            for other in active:
                op=json.loads(other['plan']); os=story(op,other['story'])
                require(not conflicts(s,os),'Ownership path or semantic conflict')
                require(other['worker']!=a.worker,'Worker already owns active assignment')
                if op.get('schema_version')==2:
                    require(source_identity(s)!=source_identity(os),'Canonical source already claimed')
                    require(s.get('independent_of_pending',False) and os.get('independent_of_pending',False),'Concurrent assignments require reviewed independence')
            wt=Path(a.worktree).resolve()
            require(wt in worktrees(a.repo) and common(wt)==common(a.repo),'Worker must use registered same-repository worktree')
            require(not any(Path(json.loads(r[0])['integration_worktree']).resolve()==wt for r in db.execute("SELECT plan FROM runs WHERE state!='finalized'")),'Worker worktree owned by coordinator')
            require(a.branch.startswith('codex/') and a.branch!=p['integration_branch'] and branch(wt)==a.branch,'Worker branch identity mismatch')
            clean(wt); head=story_pr_current_main(a.repo,p)
            require(a.expected_head==head and sha(wt,'HEAD')==head,'Worker must start at exact expected qualified main HEAD')
            require(ancestor(a.repo,p['base_sha'],head),'Approved source base no longer main ancestor')
            require(workflow_version(wt)==p['workflow_version'] and workflow_version(a.repo,head)==p['workflow_version'],'Worker or main workflow differs from pin')
            source_pins(wt,p); source_pins(wt,p,False,head)
            require(hashlib.sha256((wt/s['spec_path']).read_bytes().replace(b'\r\n',b'\n')).hexdigest()==s['spec_revision'],'Worker approved story spec changed')
            for token in s['write_paths']: require((wt/token.rstrip('/')).resolve().is_relative_to(wt),'Owned path escapes worker checkout')
            db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,NULL,NULL,NULL,NULL)',(a.run,a.story,a.worker,1,a.branch,str(wt),head,time.time(),'claimed'))
            return story_pr_assignment(p,get_claim(db,a))
        if a.command in {'heartbeat','block','submit'}:
            c=get_claim(db,a,worker=True)
            require(c['state'] in {'claimed','running','blocked','pr-ready'},'Worker frozen during merge custody or after integration')
            require(workflow_version(c['worktree'])==p['workflow_version'],'Worker workflow changed since assignment')
            source_pins(c['worktree'],p)
            require(ancestor(a.repo,c['base_sha'],sha(c['worktree'],'HEAD')),'Worker no longer descends from claimed base')
            if a.command=='heartbeat': db.execute('UPDATE claims SET heartbeat=?,state=? WHERE run=? AND story=?',(time.time(),'running' if c['state']=='claimed' else c['state'],a.run,a.story))
            elif a.command=='block':
                require(a.reason and a.reason.strip(),'Block needs reason')
                db.execute("UPDATE claims SET state='blocked',block_reason=?,heartbeat=? WHERE run=? AND story=?",(a.reason,time.time(),a.run,a.story))
            else:
                clean(c['worktree']); e=read_json(a.evidence); result=story_pr_evidence(a.repo,p,c,e); obs=e['publication']
                old=db.execute('SELECT * FROM story_pr_publications WHERE run=? AND story=?',(a.run,a.story)).fetchone()
                if old:
                    require(old['state']=='pr-ready','Publication frozen during merge custody')
                    require(all(old[k]==obs[j] for k,j in [('repository','repository'),('pr_number','pr_number'),('pr_url','pr_url'),('branch','head_branch'),('base_branch','base_branch')]),'PR identity is immutable; reconcile existing artifacts')
                    db.execute('UPDATE story_pr_publications SET head_sha=?,observation_json=?,verification_json=NULL WHERE run=? AND story=?',(result,canonical(obs),a.run,a.story))
                else: db.execute('INSERT INTO story_pr_publications VALUES(?,?,?,?,?,?,?,?,?,NULL,?,NULL,NULL)',(a.run,a.story,p['repository'],obs['pr_number'],obs['pr_url'],c['branch'],'main',result,'pr-ready',canonical(obs)))
                db.execute("UPDATE claims SET state='pr-ready',result_sha=?,evidence=?,heartbeat=?,block_reason=NULL WHERE run=? AND story=?",(result,canonical(e),time.time(),a.run,a.story))
            return story_pr_assignment(p,get_claim(db,a))
        if a.command=='prepare-pr-merge':
            c=get_claim(db,a); pub=db.execute('SELECT * FROM story_pr_publications WHERE run=? AND story=?',(a.run,a.story)).fetchone()
            require(c['state']=='pr-ready' and pub and pub['state']=='pr-ready','Story PR is not ready for merge preparation')
            require(not db.execute("SELECT 1 FROM story_pr_publications WHERE state IN ('merge-prepared','merged')").fetchone(),'Repository has unresolved merge custody')
            require(not db.execute("SELECT 1 FROM journal WHERE state='prepared'").fetchone(),'Repository has uncertain legacy integration')
            clean(c['worktree']); head=sha(c['worktree'],'HEAD'); main=story_pr_current_main(a.repo,p)
            require(a.expected_head==head==c['result_sha']==pub['head_sha'] and a.expected_main==main,'Candidate or qualified main changed before merge')
            story_pr_evidence(a.repo,p,c,json.loads(c['evidence']))
            e=read_json(a.evidence); keys(e,['schema_version','run_id','story_id','worker','generation','request_id','publication','quiescence'])
            require(type(e['schema_version']) is int and e['schema_version']==2 and e['run_id']==a.run and e['story_id']==a.story and e['worker']==c['worker'] and type(e['generation']) is int and e['generation']==c['generation'],'Merge intent identity mismatch')
            require(isinstance(e['request_id'],str) and e['request_id'].strip(),'Once-created merge request token required')
            obs=e['publication']; story_pr_publication(p,c,obs,head,True)
            require(obs['pr_number']==pub['pr_number'] and obs['pr_url']==pub['pr_url'],'Prepared PR differs from stored immutable identity')
            q=e['quiescence']; keys(q,['complete_writer_inventory','writers'])
            require(q['complete_writer_inventory'] is True and isinstance(q['writers'],list) and q['writers'],'Complete stopped writer inventory required')
            identities=[]
            for writer in q['writers']:
                keys(writer,['identity','state','evidence_ref'])
                require(all(isinstance(writer[k],str) and writer[k].strip() for k in ['identity','evidence_ref']) and writer['state']=='stopped','Merge requires stopped writers with evidence')
                identities.append(writer['identity'])
            require(c['worker'] in identities and len(identities)==len(set(identities)),'Claim worker missing or duplicate writer inventory')
            intent={**e,'expected_head':head,'expected_main':main,'repository':p['repository'],'pr_number':pub['pr_number'],'pr_url':pub['pr_url'],'head_branch':c['branch'],'base_branch':'main'}
            db.execute("UPDATE story_pr_publications SET state='merge-prepared',intent_json=? WHERE run=? AND story=?",(canonical(intent),a.run,a.story))
            db.execute("UPDATE claims SET state='merge-prepared' WHERE run=? AND story=?",(a.run,a.story))
            response={'state':'merge-prepared','request_id':e['request_id'],'expected_head':head,'expected_main':main,'next':'Use the existing authorized provider merge route once; reconcile uncertain outcomes before any retry'}
        elif a.command=='observe-pr-merge':
            c=get_claim(db,a); pub=db.execute('SELECT * FROM story_pr_publications WHERE run=? AND story=?',(a.run,a.story)).fetchone()
            require(pub and pub['state'] in {'merge-prepared','merged'},'No unresolved prepared PR merge')
            clean(c['worktree'])
            intent=json.loads(pub['intent_json']); r=read_json(a.request)
            keys(r,['schema_version','request_id','run_id','story_id','generation','repository','pr_number','pr_url','head_branch','base_branch','head_sha','merged','merge_sha','observation_ref','qualified_main_sha'])
            require(type(r['schema_version']) is int and r['schema_version']==2 and r['merged'] is True and type(r['generation']) is int and type(r['pr_number']) is int,'Provider must confirm actual merged PR')
            for field in ['request_id','run_id','story_id','generation','repository','pr_number','pr_url','head_branch','base_branch']:
                require(r[field]==intent[field],'Merge observation '+field+' mismatch')
            require(r['head_sha']==intent['expected_head'] and sha(c['worktree'],'HEAD')==r['head_sha'],'Observed candidate drifted from frozen head')
            require(isinstance(r['observation_ref'],str) and r['observation_ref'].strip(),'Independent actual provider merge observation required')
            main=story_pr_current_main(a.repo,p); require(r['qualified_main_sha']==main,'Qualified main changed during merge observation')
            merge=sha(a.repo,r['merge_sha']); require(merge==r['merge_sha'],'Exact provider merge SHA required')
            require(git(a.repo,'rev-list','--parents','-n','1',merge).split()[1:]==[intent['expected_main'],intent['expected_head']],'Provider merge has wrong head/base parents; reconcile custody')
            require(ancestor(a.repo,merge,main),'Provider merge is not current qualified main ancestor')
            if pub['merge_sha']: require(pub['merge_sha']==merge,'Observed merge identity changed')
            db.execute("UPDATE story_pr_publications SET state='merged',merge_sha=?,observation_json=? WHERE run=? AND story=?",(merge,canonical(r),a.run,a.story))
            db.execute("UPDATE claims SET state='awaiting-verification',integration_sha=? WHERE run=? AND story=?",(merge,a.run,a.story))
            return {'state':'awaiting-verification','merge_sha':merge,'qualified_main_sha':main}
        elif a.command=='verify':
            c=get_claim(db,a); pub=db.execute('SELECT * FROM story_pr_publications WHERE run=? AND story=?',(a.run,a.story)).fetchone()
            require(c['state']=='awaiting-verification' and pub and pub['state']=='merged','Story has no provider merge awaiting verification')
            clean(c['worktree']); main=story_pr_current_main(a.repo,p); require(ancestor(a.repo,pub['merge_sha'],main),'Observed merge missing from qualified main')
            intent=json.loads(pub['intent_json'])
            require(git(a.repo,'rev-list','--parents','-n','1',pub['merge_sha']).split()[1:]==[intent['expected_main'],intent['expected_head']],'Stored merge parent identity changed')
            require(sha(c['worktree'],'HEAD')==intent['expected_head'],'Frozen branch changed after provider merge')
            e=read_json(a.evidence); story_pr_combined(p,c,e,main)
            db.execute('INSERT OR REPLACE INTO verifications VALUES(?,?,?,?)',(a.run,a.story,main,canonical(e)))
            db.execute("UPDATE story_pr_publications SET state='verified',verification_json=? WHERE run=? AND story=?",(canonical(e),a.run,a.story))
            db.execute("UPDATE claims SET state='integrated',integration_sha=? WHERE run=? AND story=?",(main,a.run,a.story))
            return {'state':'integrated','merge_sha':pub['merge_sha'],'integration_sha':main}
        elif a.command=='finalize':
            require(all(s['id'] in claims and claims[s['id']]['state']=='integrated' for s in p['stories']),'Required story PRs remain pending, blocked or unintegrated')
            require(not db.execute("SELECT 1 FROM story_pr_publications WHERE state IN ('merge-prepared','merged')").fetchone(),'Repository has unresolved merge custody')
            main=story_pr_current_main(a.repo,p); pubs=list(db.execute('SELECT * FROM story_pr_publications WHERE run=?',(a.run,)))
            require(len(pubs)==len(p['stories']) and all(r['state']=='verified' and ancestor(a.repo,r['merge_sha'],main) for r in pubs),'Required verified PR merge ancestry missing')
            require(all(ancestor(a.repo,c['integration_sha'],main) for c in claims.values()),'Verified integrated history missing from main')
            e=read_json(a.evidence); story_pr_combined(p,None,e,main,True)
            db.execute("UPDATE runs SET state='finalized',final_sha=? WHERE run=?",(main,a.run))
            db.execute('INSERT INTO verifications VALUES(?,?,?,?)',(a.run,'__final__',main,canonical(e)))
            return {'state':'finalized','integration_sha':main,'next':'Complete existing coordinator closeout bookkeeping; no epic product PR or deployment is created'}
        else: raise Refusal('Unsupported schema 2 operation')
    # The merge intent transaction is durable before the caller can perform the
    # separately authorized provider operation. No Git/provider mutation occurs here.
    story_pr_merge_checkpoint()
    return response

def execute(a):
    a.repo=str(top(a.repo))
    if stories_pr_requested(a): return execute_story_pr(a)
    if a.command=='version': return {'schema_version':VERSION,'workflow_version':workflow_version(a.repo)}
    if a.command=='plan':
        return report(a.repo,validate_plan(a.repo,read_json(a.plan)))
    if a.command=='integrate': return integrate(a)
    if a.command=='amend-blocked': return amend_blocked(a)
    if a.command=='finalize-exceptions': return finalize_exceptions(a)
    with database(a.repo) as db:
        if a.command=='init':
            p=validate_plan(a.repo,read_json(a.plan)); require(a.owner==p['coordinator'],'Plan coordinator mismatch')
            clean(p['integration_worktree']); require(sha(p['integration_worktree'],'HEAD')==p['base_sha'],'Init requires exact plan base HEAD')
            existing=db.execute('SELECT * FROM runs WHERE run=?',(p['run_id'],)).fetchone()
            if existing:
                require(existing['owner']==a.owner and existing['plan_hash']==digest(p),'Run already owned or plan changed')
            else:
                for other in db.execute("SELECT plan FROM runs WHERE state!='finalized'"):
                    other=json.loads(other['plan'])
                    require(other['integration_branch']!=p['integration_branch'] and Path(other['integration_worktree']).resolve()!=Path(p['integration_worktree']).resolve(),'Integration branch/worktree already owned')
                require(not any(Path(x['worktree']).resolve()==Path(p['integration_worktree']).resolve() for x in db.execute("SELECT worktree FROM claims WHERE state!='integrated'")),'Integration worktree already owned by worker')
                db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?,NULL)',(p['run_id'],p['epic'],a.owner,canonical(p),digest(p),'active'))
            return {'run_id':p['run_id'],'state':'active','store':str(common(a.repo)/'auto-bmad-parallel.sqlite3')}
        p=get_run(db,a)
        if a.command=='status':
            claims=rows(db,a.run)
            return {'run_id':a.run,'claims':[{**assignment(p,c),'heartbeat_age_seconds':round(time.time()-c['heartbeat'],2),'stale':time.time()-c['heartbeat']>300,'result_sha':c['result_sha'],'integration_sha':c['integration_sha'],'block_reason':c['block_reason']} for c in claims.values()], 'admission':report(a.repo,p,claims),'journals':[dict(x) for x in db.execute('SELECT * FROM journal WHERE run=?',(a.run,))]}
        require(branch(p['integration_worktree'])==p['integration_branch'],'Integration branch identity changed')
        if a.command=='claim':
            require(a.worker and a.generation==1,'New claims require worker and generation 1; automatic transfers are unsupported')
            s=story(p,a.story); claims=rows(db,a.run)
            admission=report(a.repo,p,claims); require(a.story in admission['ready'],'Story not ready: '+canonical(admission['blocked'].get(a.story,[])))
            all_claims=[dict(x) for x in db.execute("SELECT c.*, r.plan FROM claims c JOIN runs r ON c.run=r.run WHERE c.state!='integrated'")]
            require(sum(x['run']==a.run for x in all_claims)<p['max_workers'],'Worker capacity reached; blocked claims retain ownership')
            require(len(all_claims)<2,'Repository worker capacity reached')
            for other in all_claims:
                require(other['story']!=a.story,'Story already owned across repository')
                require(not conflicts(s,story(json.loads(other['plan']),other['story'])),'Ownership path or semantic conflict')
                require(other['worker']!=a.worker,'Worker already owns an active assignment')
            wt=Path(a.worktree).resolve()
            require(not any(Path(json.loads(r['plan'])['integration_worktree']).resolve()==wt for r in db.execute("SELECT plan FROM runs WHERE state!='finalized'")),'Worker worktree owned by a coordinator')
            require(wt!=Path(p['integration_worktree']).resolve() and wt in worktrees(a.repo),'Worker needs a separate registered worktree')
            require(common(wt)==common(a.repo) and branch(wt)==a.branch,'Worker branch/common-dir mismatch')
            require(a.branch.startswith('codex/') and a.branch!=p['integration_branch'],'Worker requires isolated codex/ branch')
            clean(wt); base=sha(p['integration_worktree'],'HEAD'); require(sha(wt,'HEAD')==base,'Worker must start at exact current integration HEAD')
            for token in s['write_paths']:
                require((wt/token.rstrip('/')).resolve().is_relative_to(wt),'Owned path follows symlink outside worktree')
            require(hashlib.sha256((wt/s['spec_path']).read_bytes().replace(b'\r\n',b'\n')).hexdigest()==s['spec_revision'],'Worker spec drifted from approved revision')
            db.execute('INSERT INTO claims VALUES(?,?,?,?,?,?,?,?,?,NULL,NULL,NULL,NULL)',(a.run,a.story,a.worker,1,a.branch,str(wt),base,time.time(),'claimed'))
            return assignment(p,get_claim(db,a))
        if a.command in {'heartbeat','block','submit'}:
            c=get_claim(db,a,worker=True)
            require(c['state'] in {'claimed','running','blocked','ready-for-integration'},'Worker cannot mutate after integration starts')
            if a.command=='heartbeat':
                require(workflow_version(c['worktree'])==p['workflow_version'],'Worker workflow changed since assignment')
                require(ancestor(a.repo,c['base_sha'],sha(c['worktree'],'HEAD')),'Worker no longer descends from pinned base')
                state='running' if c['state']=='claimed' else c['state']
                db.execute('UPDATE claims SET heartbeat=?,state=? WHERE run=? AND story=?',(time.time(),state,a.run,a.story))
            elif a.command=='block':
                require(a.reason and a.reason.strip(),'Block needs reason')
                db.execute("UPDATE claims SET state='blocked',block_reason=?,heartbeat=? WHERE run=? AND story=?",(a.reason,time.time(),a.run,a.story))
            else:
                clean(c['worktree']); e=read_json(a.evidence); result=validate_evidence(a.repo,p,c,e)
                db.execute("UPDATE claims SET state='ready-for-integration',result_sha=?,evidence=?,heartbeat=?,block_reason=NULL WHERE run=? AND story=?",(result,canonical(e),time.time(),a.run,a.story))
            return assignment(p,get_claim(db,a))
        if a.command=='repair':
            c=get_claim(db,a); require(c['state']=='awaiting-verification','Only pending combined verification permits coordinator repair')
            require(a.expected_head==c['integration_sha'],'Repair expected-head must match recorded integration SHA')
            clean(p['integration_worktree']); head=sha(p['integration_worktree'],'HEAD')
            require(head!=c['integration_sha'] and ancestor(a.repo,c['integration_sha'],head),'Repair must be committed descendant of recorded integration')
            require(not git(a.repo,'rev-list','--merges',c['integration_sha']+'..'+head),'Repair cannot integrate unassigned branches')
            validate_diff(a.repo,p,c,c['integration_sha'],head,repair=True)
            e=read_json(a.evidence); combined_evidence(p,c,e,head)
            db.execute('INSERT OR REPLACE INTO verifications VALUES(?,?,?,?)',(a.run,'__repair__'+a.story,head,canonical(e)))
            db.execute('UPDATE claims SET integration_sha=? WHERE run=? AND story=?',(head,a.run,a.story))
            db.execute('UPDATE journal SET after_sha=? WHERE run=? AND story=?',(head,a.run,a.story))
            return {'state':'awaiting-verification','integration_sha':head,'repair_recorded':True}
        if a.command=='verify':
            c=get_claim(db,a); require(c['state']=='awaiting-verification','Story has no merge awaiting checks')
            clean(p['integration_worktree']); head=sha(p['integration_worktree'],'HEAD'); require(head==c['integration_sha'],'Combined integration HEAD changed')
            e=read_json(a.evidence); combined_evidence(p,c,e,head)
            db.execute('INSERT OR REPLACE INTO verifications VALUES(?,?,?,?)',(a.run,a.story,head,canonical(e)))
            db.execute("UPDATE claims SET state='integrated' WHERE run=? AND story=?",(a.run,a.story))
            return {'state':'integrated','integration_sha':head}
        if a.command=='finalize':
            claims=rows(db,a.run)
            require(all(s['id'] in claims and claims[s['id']]['state']=='integrated' for s in p['stories']),'Required stories remain unintegrated or blocked')
            clean(p['integration_worktree']); head=sha(p['integration_worktree'],'HEAD')
            require(all(ancestor(a.repo,c['integration_sha'],head) for c in claims.values()),'Integrated history missing from final HEAD')
            e=read_json(a.evidence); combined_evidence(p,None,e,head,final=True)
            db.execute("UPDATE runs SET state='finalized',final_sha=? WHERE run=?",(head,a.run))
            db.execute('INSERT INTO verifications VALUES(?,?,?,?)',(a.run,'__final__',head,canonical(e)))
            return {'state':'finalized','integration_sha':head,'epic':p['epic'],'next':'Continue existing E_final publication, CI and merge approvals; helper does not publish or change sprint status'}
    raise Refusal('Unsupported operation')

class JsonParser(argparse.ArgumentParser):
    def error(self,message): raise Refusal('CLI usage: '+message)

def parser():
    p=JsonParser(description=__doc__)
    p.add_argument('--repo',default='.')
    sub=p.add_subparsers(dest='command',required=True)
    for name in ['version','plan','init','status','claim','heartbeat','block','submit','integrate','repair','verify','finalize','amend-blocked','finalize-exceptions','prepare-pr-merge','observe-pr-merge']:
        cmd=sub.add_parser(name)
        if name in {'plan','init'}: cmd.add_argument('--plan',required=True)
        if name not in {'version','plan'}: cmd.add_argument('--owner',required=True)
        if name not in {'version','plan','init'}: cmd.add_argument('--run',required=True)
        if name in {'claim','heartbeat','block','submit','integrate','repair','verify','amend-blocked','prepare-pr-merge','observe-pr-merge'}: cmd.add_argument('--story',required=True)
        if name=='finalize-exceptions': cmd.add_argument('--request',required=True)
        if name=='amend-blocked':
            cmd.add_argument('--worker',required=True); cmd.add_argument('--generation',type=int,required=True); cmd.add_argument('--request',required=True)
        if name in {'claim','heartbeat','block','submit'}:
            cmd.add_argument('--worker',required=True); cmd.add_argument('--generation',type=int,default=1)
        if name=='claim':
            cmd.add_argument('--branch',required=True); cmd.add_argument('--worktree',required=True)
            cmd.add_argument('--expected-head')
        if name=='block': cmd.add_argument('--reason',required=True)
        if name in {'submit','repair','verify','finalize'}: cmd.add_argument('--evidence',required=True)
        if name in {'integrate','repair'}: cmd.add_argument('--expected-head',required=True)
        if name=='prepare-pr-merge':
            cmd.add_argument('--expected-head',required=True); cmd.add_argument('--expected-main',required=True); cmd.add_argument('--evidence',required=True)
        if name=='observe-pr-merge': cmd.add_argument('--request',required=True)
    return p

def main(argv=None):
    try:
        result=execute(parser().parse_args(argv))
        print(json.dumps({'ok':True,**result},sort_keys=True)); return 0
    except (Refusal,OSError,ValueError,sqlite3.Error,subprocess.SubprocessError,TypeError,KeyError) as e:
        print(json.dumps({'ok':False,'error':str(e),'error_type':type(e).__name__},sort_keys=True)); return 1

if __name__=='__main__': sys.exit(main())
