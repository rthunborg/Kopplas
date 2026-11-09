#!/usr/bin/env python3
"""One stopped assignment's cold context adoption; no provider/runtime admission.

The request and journal are restricted operator artifacts. Public output contains
fixed codes and digests only. Caller-supplied identities are not authentication.
"""
import argparse
import base64
import contextlib
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import time
import uuid

RUN = 'e35-6-20261102'
STORY = 'spec-design-35-6-35-6'
OLD = '01a1160d-b5b1-7623-a8e8-54ef3dc537ed'
NEW = '01a1afde-34b5-7bb2-976e-de71b7f6a94c'
WORKER = '01a19c88-3c36-76f1-918b-88a00e4d222f'
PRODUCER = '01a19bf5-183b-7ae1-ab86-8bd5804dcb6f'
BASE = '824bed4a92eb388db669ffb60492a7b1dd9fc038'
MAIN = '4411cdc412f01ee023440525ff1e17bb824ef383'
BEFORE_PIN = 'f2463d540f4c2d0829224eb48d619e772a8916334c9f80fa8704b1309e14b612'
AFTER_PIN = '5becc80779ea11da28a00af4471e73461013a6b9bdf4c79a271725e5d0680998'
HELPER = '.agents/skills/auto-bmad/scripts/parallel_run.py'
ENGINE = 'deb1a82e14b2cff0d2025174b8e0a75802b0fb19'
EXCLUSIONS = '38295be6a28463205ae1cd37ae5d9d933bdf85319796dfc87e1123698f620d23'
POLICIES = {
    'docs/process/bounded-workflow-operating-policy.md': '6b94eb4495053ad018ccf8961226db1618a5284374d1cb0af5069fe095dfc41e',
    'docs/process/templates/current-work-packet.md': 'c8b31e05794e349d15d8e64c3638398375a04e409ec8cadc3cef118da80f29f9',
}
STATE = '_bmad-output/auto-bmad/state/' + STORY + '.yaml'
AUDIT = 'coordinator_successions'
MAX_FILE = 4 * 1024 * 1024
DDL = [
    'CREATE TABLE coordinator_successions(request_id TEXT PRIMARY KEY, run TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL, before_snapshot TEXT NOT NULL, after_snapshot TEXT NOT NULL, request TEXT NOT NULL, context TEXT NOT NULL, response TEXT NOT NULL, created REAL NOT NULL)',
    "CREATE TRIGGER immutable_coordinator_successions_update BEFORE UPDATE ON coordinator_successions BEGIN SELECT RAISE(ABORT, 'Coordinator succession audit is append-only'); END",
    "CREATE TRIGGER immutable_coordinator_successions_delete BEFORE DELETE ON coordinator_successions BEGIN SELECT RAISE(ABORT, 'Coordinator succession audit is append-only'); END",
]


class Refusal(Exception):
    pass


def need(value, code):
    if not value:
        raise Refusal(code)


def exact(value, fields):
    need(type(value) is dict and set(value) == set(fields.split()), 'REQUEST_SHAPE')


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False)


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


def rawhash(value):
    return hashlib.sha256(value).hexdigest()


def unique(pairs):
    result = {}
    for key, value in pairs:
        need(key not in result, 'DUPLICATE_KEY')
        result[key] = value
    return result


def decode(data):
    return json.loads(data.decode('utf-8-sig'), object_pairs_hook=unique,
                      parse_constant=lambda _: (_ for _ in ()).throw(Refusal('NONFINITE_JSON')))


def read(path):
    path = Path(path)
    need(path.is_file() and not path.is_symlink(), 'MISSING_OR_UNSAFE_FILE')
    with path.open('rb') as stream:
        data = stream.read(MAX_FILE + 1)
    need(len(data) <= MAX_FILE, 'FILE_TOO_LARGE')
    return data


def environment():
    env = {k: v for k, v in os.environ.items()
           if not k.upper().startswith(('GIT_', 'PYTHON'))}
    env.update(GIT_TERMINAL_PROMPT='0', GIT_OPTIONAL_LOCKS='0', GIT_NO_REPLACE_OBJECTS='1', PYTHONDONTWRITEBYTECODE='1')
    return env


def command(argv, data=None):
    proc = subprocess.run(argv, input=data, capture_output=True, timeout=120, env=environment())
    need(proc.returncode == 0, 'NATIVE_OPERATION_REFUSED')
    return proc.stdout


def git(repo, *args):
    return command(['git', '-c', 'core.hooksPath=' + str(Path(repo)/'.no-adoption-hooks'),
                    '-c', 'core.fsmonitor=false', '-c', 'gc.auto=0', '-c', 'maintenance.auto=false', '-C', str(repo), *args])


def gittext(repo, *args):
    return git(repo, *args).decode('utf-8').strip()


def path(value):
    need(type(value) is str and value and '\x00' not in value and Path(value).is_absolute(), 'UNSAFE_PATH')
    need(not value.startswith(('//', chr(92)*2)), 'UNSAFE_PATH')
    result = Path(value)
    # Every existing ancestor must be a real directory, not a redirected link.
    need(not any(redirected(p) for p in [result, *result.parents]), 'UNSAFE_PATH')
    return result.resolve()


def redirected(p):
    return p.is_symlink() or (hasattr(p, 'is_junction') and p.is_junction())


def sha(value):
    need(type(value) is str and re.fullmatch('[0-9a-f]{40}', value), 'COMMIT_TYPE')
    return value


def regular(repo, relative):
    result = path(str(repo / relative))
    need(result.is_relative_to(repo), 'UNSAFE_PATH')
    return result


def head(repo):
    return gittext(repo, 'rev-parse', 'HEAD')


def branch(repo):
    return gittext(repo, 'symbolic-ref', '--short', 'HEAD')


def clean(repo):
    need(not git(repo, 'status', '--porcelain=v1', '--untracked-files=all'), 'DIRTY_CHECKOUT')
    gd = path(gittext(repo, 'rev-parse', '--absolute-git-dir'))
    need(not any((gd / name).exists() for name in
                 ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'index.lock', 'rebase-apply', 'rebase-merge']),
         'PENDING_GIT_OPERATION')
    # status may trust stat caches: independently compare HEAD/index and bytes.
    git(repo, 'diff', '--exit-code', '--cached', '--no-ext-diff', '--no-textconv', 'HEAD', '--')
    git(repo, 'diff', '--exit-code', '--no-ext-diff', '--no-textconv', '--')
    flags = git(repo, 'ls-files', '-v', '-z').split(b'\0')
    need(all(not x or x.startswith(b'H ') for x in flags), 'UNSUPPORTED_INDEX_FLAGS')


def ancestor(repo, old, new):
    git(repo, 'merge-base', '--is-ancestor', sha(old), sha(new))


def blob(repo, commit, relative):
    return git(repo, 'show', sha(commit) + ':' + relative)


def tree(repo, commit):
    entries = {}
    for item in git(repo, 'ls-tree', '-rz', sha(commit)).split(b'\0'):
        if item:
            meta, name = item.split(b'\t', 1)
            mode, kind, oid = meta.decode().split()
            need(mode in {'100644', '100755'} and kind == 'blob', 'UNSUPPORTED_TREE_ENTRY')
            entries[name.decode('utf-8')] = [mode, oid]
    return entries


def evidence(ref, private):
    exact(ref, 'path sha256')
    p = path(ref['path'])
    need(p.is_relative_to(private), 'EVIDENCE_OUTSIDE_PRIVATE_ROOT')
    data = read(p)
    need(type(ref['sha256']) is str and rawhash(data) == ref['sha256'], 'EVIDENCE_CHANGED')
    return decode(data)


def snapshot(db):
    schema = [list(r) for r in db.execute("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT GLOB 'sqlite_*' AND name NOT IN (?,?,?) ORDER BY type,name",
              (AUDIT, 'immutable_coordinator_successions_update', 'immutable_coordinator_successions_delete'))]
    tables = [r[1] for r in schema if r[0] == 'table']
    need(all(re.fullmatch('[A-Za-z_][A-Za-z_0-9]*', n) for n in tables), 'UNKNOWN_SCHEMA')
    rows, unrelated = {}, {}
    for table in tables:
        values = [dict(r) for r in db.execute('SELECT * FROM "' + table + '"')]
        target_rows = [r for r in values if r.get('run') == RUN] if table in {'runs', 'claims'} else []
        rows[table] = sorted(target_rows, key=canonical)
        unrelated[table] = sorted([r for r in values if r not in target_rows], key=canonical)
        if table in {'journal', 'verifications', 'story_pr_publications'}:
            need(not any(r.get('run') == RUN for r in values), 'TARGET_PENDING_OPERATION')
        if table == 'journal':
            need(not any(r.get('state') == 'prepared' for r in values), 'REPOSITORY_PENDING_OPERATION')
        if table == 'story_pr_publications':
            need(not any(r.get('state') in {'merge-prepared', 'merged'} for r in values), 'REPOSITORY_PENDING_OPERATION')
        if table == 'claims':
            need(not any(r.get('run') != RUN and r.get('state') != 'integrated' for r in values), 'OTHER_ACTIVE_AUTHOR')
    return {'schema': schema, 'tables': rows, 'unrelated_state_digest': digest(unrelated)}


@contextlib.contextmanager
def database(store, write=False):
    need(store.is_file() and not store.is_symlink(), 'MISSING_STORE')
    with store.open('rb') as stream:
        header = stream.read(100)
    # A WAL read-only connection can create shared-memory sidecars. This bounded
    # operation supports the native engine's rollback-journal store only.
    need(header[:16] == b'SQLite format 3\0' and header[18:20] == b'\x01\x01', 'UNSUPPORTED_JOURNAL_MODE')
    db = sqlite3.connect(store.as_uri() + ('?mode=rw' if write else '?mode=ro'), uri=True,
                         isolation_level=None, timeout=2)
    db.row_factory = sqlite3.Row
    try:
        if not write:
            db.execute('PRAGMA query_only=ON')
        db.execute('BEGIN IMMEDIATE' if write else 'BEGIN')
        yield db
        db.execute('COMMIT' if write else 'ROLLBACK')
    except BaseException:
        if db.in_transaction:
            db.execute('ROLLBACK')
        raise
    finally:
        db.close()


def audit_schema(db):
    found = {r[0]: r[1] for r in db.execute("SELECT name,sql FROM sqlite_master WHERE tbl_name=? COLLATE NOCASE AND name NOT GLOB 'sqlite_*'", (AUDIT,))}
    expected = {AUDIT: DDL[0], 'immutable_coordinator_successions_update': DDL[1],
                'immutable_coordinator_successions_delete': DDL[2]}
    need(not found or found == expected, 'AUDIT_SCHEMA_CONFLICT')
    return bool(found)


def target(s):
    runs = [r for r in s['tables']['runs'] if r['run'] == RUN]
    claims = [r for r in s['tables']['claims'] if r['run'] == RUN]
    need(len(runs) == len(claims) == 1, 'TARGET_CARDINALITY')
    r, c = runs[0], claims[0]
    need(r['state'] == 'active' and r['final_sha'] is None, 'RUN_STATE')
    need(c['story'] == STORY and c['worker'] == WORKER and type(c['generation']) is int and
         c['generation'] == 1 and c['state'] == 'blocked' and
         all(c[k] is None for k in ['evidence', 'result_sha', 'integration_sha']), 'CLAIM_STATE')
    need(type(c['block_reason']) is str and c['block_reason'] and type(c['heartbeat']) in {float, int}, 'CLAIM_STATE')
    for table in ['journal', 'verifications', 'story_pr_publications']:
        need(not any(x['run'] == RUN for x in s['tables'][table]), 'TARGET_PENDING_OPERATION')
    need(not any(x.get('state') == 'prepared' for x in s['tables']['journal']), 'REPOSITORY_PENDING_OPERATION')
    need(not any(x.get('state') in {'merge-prepared', 'merged'} for x in s['tables']['story_pr_publications']),
         'REPOSITORY_PENDING_OPERATION')
    p = decode(r['plan'].encode())
    need(digest(p) == r['plan_hash'], 'PLAN_INTEGRITY')
    need(len(p['stories']) == 1 and p['stories'][0]['id'] == STORY and len(p['stories'][0]['write_paths']) == 11,
         'ALLOCATION_CHANGED')
    return r, c, p


DRIVER = r'''
import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('adoption_pinned_helper',sys.argv[1]); h=importlib.util.module_from_spec(spec); spec.loader.exec_module(h)
x=json.load(sys.stdin); p=x['plan']; c=x['claim']; repo=x['repo']
h.require(h.workflow_version(repo) in {x['old_pin'],p['workflow_version']},'Operative workflow drift')
h.require(h.workflow_version(x['staging'])==p['workflow_version'],'Staging workflow drift')
if x['operation']=='candidate':
    p['integration_worktree']=x['staging']; p['integration_branch']=h.branch(x['staging'])
    h.validate_plan(repo,p)
    h.require(h.workflow_version(repo,x['worker_head'])==p['workflow_version'],'Candidate worker pin')
    h.source_pins(repo,p,False,x['worker_head'])
    h.validate_diff(repo,p,c,x['old_base'],x['selected_checkpoint'])
    h.validate_diff(repo,p,c,p['base_sha'],x['worker_head'])
elif x['operation']=='settled':
    h.validate_plan(repo,p); h.story_pr_current_main(repo,p)
    h.require(h.workflow_version(c['worktree'])==p['workflow_version'],'Worker pin')
    h.source_pins(c['worktree'],p); h.validate_diff(repo,p,c,p['base_sha'],h.sha(c['worktree'],'HEAD'))
print(h.canonical(h.story_pr_assignment(p,c)))
'''


def native(ctx, operation):
    p = copy.deepcopy(ctx['after_plan'])
    c = copy.deepcopy(ctx['after_claim'])
    payload = dict(operation=operation, plan=p, claim=c, repo=str(ctx['integration']),
                   staging=str(ctx['integration_staging']),
                   worker_head=ctx['proposal']['worker_candidate'], old_pin=BEFORE_PIN,
                   old_base=ctx['proposal']['old_base'], selected_checkpoint=ctx['proposal']['selected_checkpoint'])
    result = command([sys.executable, '-B', '-c', DRIVER, str(ctx['integration']/HELPER)], canonical(payload).encode())
    return decode(result)


def publication(data, base):
    text = data.decode('utf-8-sig')
    matches = list(re.finditer(r'^publication_identity_json:[ \t]*(.+?)[ \t]*\r?$', text, re.M))
    need(len(matches) == 1, 'PUBLICATION_STATE_SHAPE')
    raw = matches[0].group(1)
    # State writer uses a JSON-encoded string scalar. No YAML parser or rewriting.
    scalar = json.loads(raw)
    need(type(scalar) is str, 'PUBLICATION_STATE_SHAPE')
    identity = decode(scalar.encode())
    exact(identity, 'base_branch base_revision branch repository run_id story_key worktree')
    need(identity['base_revision'] == base and identity['run_id'] == RUN and identity['story_key'] == STORY and
         re.search(r'^pr_number:[ \t]*127[ \t]*\r?$', text, re.M) and
         re.search(r'^pr_url:[ \t]*"https://github.com/rthunborg/Kopplas/pull/127"[ \t]*\r?$', text, re.M),
         'PUBLICATION_IDENTITY')
    return identity, matches[0]


def reassessed(data, old, new):
    identity, match = publication(data, old)
    text = data.decode('utf-8-sig')
    need(match.group(1).count(old) == 1, 'PUBLICATION_STATE_SHAPE')
    changed = text[:match.start(1)] + match.group(1).replace(old, new) + text[match.end(1):]
    return (b'\xef\xbb\xbf' if data.startswith(b'\xef\xbb\xbf') else b'') + changed.encode('utf-8')


def validate(request_path, allow_hot_recovery=False):
    raw = read(request_path)
    q = decode(raw)
    exact(q, 'schema_version request_id proposal owner_approval admission_review')
    need(type(q['schema_version']) is int and q['schema_version'] == 1, 'REQUEST_VERSION')
    need(type(q['request_id']) is str and str(uuid.UUID(q['request_id'])) == q['request_id'], 'REQUEST_ID')
    p = q['proposal']
    exact(p, 'environment private_root repository integration worker integration_staging before_integration before_worker integration_candidate worker_candidate checkpoint published_head selected_checkpoint old_base main main_observation expected_snapshot after_plan_hash original_plan exclusion_register custody qualification tool_sha256 tool_revision tool_author')
    need(p['environment'] in {'fixture', 'live'}, 'ENVIRONMENT')
    paths = {k: path(p[k]) for k in ['private_root', 'repository', 'integration', 'worker', 'integration_staging']}
    private = paths['private_root']
    need(path(str(request_path)).is_relative_to(private), 'REQUEST_OUTSIDE_PRIVATE_ROOT')
    root = paths['repository']
    need(not any(private.is_relative_to(paths[key]) for key in ['integration', 'worker', 'integration_staging']), 'PRIVATE_ROOT_BOUNDARY')
    common = path(gittext(root, 'rev-parse', '--path-format=absolute', '--git-common-dir'))
    need(common == root/'.git' and (root/'.git').is_dir(), 'PRIMARY_OR_LINKED_REPOSITORY')
    if p['environment'] == 'fixture':
        toolroot = Path(__file__).resolve().parents[2]
        allowed = toolroot/'tmp'/'private'/'adoption-fixtures'
        need(root.is_relative_to(allowed) and private.is_relative_to(root.parent), 'FIXTURE_BOUNDARY')
        need(not private.is_relative_to(root), 'PRIVATE_ROOT_BOUNDARY')
    else:
        need(root == path('C:/DEV/Kopplas') and paths['integration'] == path('C:/DEV/Kopplas/tmp/private/e35-control') and
             paths['worker'] == path('C:/DEV/Kopplas/tmp/private/e35-worker-35-6'), 'LIVE_TARGET_BOUNDARY')
        private_anchor = root/'tmp'/'private'
        need(private != private_anchor and private.is_relative_to(private_anchor), 'PRIVATE_ROOT_BOUNDARY')
        need(p['old_base'] == BASE and p['checkpoint'] == '54ec501da6ba7b756fe8013c0f71ac123f7a8a59' and
             p['published_head'] == 'f426d9d9d3c57b15e2fbcb36b4c25d02c5c3af22', 'LIVE_BINDING_CHANGED')
        # 4411 is the assessed anchor. The exact reviewed post-merge main must
        # include this tool, preserve F/source pins, and be freshly qualified.
        ancestor(root, MAIN, p['main'])
    need(len({paths[k] for k in ['integration', 'worker', 'integration_staging']}) == 3, 'CHECKOUT_IDENTITY')
    registered = git(root, 'worktree', 'list', '--porcelain', '-z').decode().split('\x00')
    registered = {path(x[9:]) for x in registered if x.startswith('worktree ')}
    for key in ['integration', 'worker', 'integration_staging']:
        need(paths[key] != root and paths[key] in registered and
             path(gittext(paths[key], 'rev-parse', '--path-format=absolute', '--git-common-dir')) == common,
             'CHECKOUT_IDENTITY')
        clean(paths[key])
    for key in ['before_integration', 'before_worker', 'integration_candidate', 'worker_candidate', 'checkpoint',
                'published_head', 'selected_checkpoint', 'old_base', 'main', 'tool_revision']:
        sha(p[key])
    need(gittext(root, 'rev-parse', 'refs/remotes/origin/main') == p['main'], 'MAIN_CHANGED')
    need(head(paths['integration_staging']) == p['integration_candidate'], 'STAGING_CHANGED')
    for old, new in [(p['before_integration'], p['integration_candidate']), (p['main'], p['integration_candidate']),
                     (p['before_worker'], p['selected_checkpoint']), (p['checkpoint'], p['selected_checkpoint']),
                     (p['published_head'], p['selected_checkpoint']), (p['selected_checkpoint'], p['worker_candidate']),
                     (p['main'], p['worker_candidate'])]:
        ancestor(root, old, new)
    need(head(paths['integration']) in {p['before_integration'], p['integration_candidate']} and
         head(paths['worker']) in {p['before_worker'], p['worker_candidate']}, 'HEAD_CHANGED')
    for commit in [p['old_base'], p['main'], p['integration_candidate'], p['worker_candidate']]:
        need(gittext(root, 'rev-parse', commit + ':' + HELPER) == ENGINE, 'ENGINE_CHANGED')
    for commit in {p['main'], p['integration_candidate'], p['worker_candidate']}:
        for name, expected in POLICIES.items():
            need(rawhash(blob(root, commit, name).replace(b'\r\n', b'\n')) == expected, 'CANONICAL_POLICY_CHANGED')
    for key in ['integration', 'worker', 'integration_staging']:
        content = read(paths[key]/HELPER).replace(b'\r\n', b'\n')
        need(hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest() == ENGINE, 'ENGINE_CHANGED')
    need(rawhash(read(Path(__file__).resolve())) == p['tool_sha256'], 'TOOL_CHANGED')
    original = evidence(p['original_plan'], private)
    need(original['coordinator'] == OLD and original['base_sha'] == p['old_base'] and
         original['workflow_version'] == BEFORE_PIN, 'ORIGINAL_PLAN_CHANGED')
    if p['environment'] == 'live':
        need(digest(original) == '8266af90560d857cdf8340a9428ae020627a0b2e859bb644ebc17c2e4f1b9efd' and
             p['original_plan']['sha256'] == 'bee4608cbc8846af38b69f2e26fca5089b9840f894609bbeb7db1b5029e2eab0', 'ORIGINAL_PLAN_CHANGED')
    after = copy.deepcopy(original)
    after.update(coordinator=NEW, base_sha=p['main'], workflow_version=AFTER_PIN)
    need(digest(after) == p['after_plan_hash'], 'AFTER_PLAN_HASH')
    store = common/'auto-bmad-parallel.sqlite3'
    preliminary = dict(request=q, request_raw_sha256=rawhash(raw), request_digest=digest(q), proposal=p,
                       store=store, common=common, after_plan=after, **paths)
    authorities(preliminary)
    def observed_native():
        with database(store) as db:
            audits = []
            if audit_schema(db):
                audits = list(db.execute('SELECT request_id,run,request_hash FROM coordinator_successions'))
                need(not audits or (len(audits) == 1 and audits[0]['run'] == RUN and
                     audits[0]['request_id'] == q['request_id'] and audits[0]['request_hash'] == digest(q)), 'SECOND_SUCCESSION')
            return snapshot(db), bool(audits)
    try:
        s, has_audit = observed_native()
    except sqlite3.OperationalError as error:
        if not allow_hot_recovery or getattr(error, 'sqlite_errorname', '') != 'SQLITE_READONLY_ROLLBACK':
            raise
        recover_hot_store(preliminary, request_path, original)
        s, has_audit = observed_native()
    r, c, plan = target(s)
    if has_audit:
        need(r['owner'] == NEW and plan == after and c['base_sha'] == p['main'], 'AFTER_STATE_DRIFT')
    else:
        need(r['owner'] == OLD and plan == original and c['base_sha'] == p['old_base'], 'BEFORE_STATE_CHANGED')
    need(plan['run_id'] == RUN and plan['publication_strategy'] == 'story-pr' and plan['story_source'] == 'stories' and
         plan['repository'] == 'rthunborg/Kopplas' and plan['base_branch'] == 'main', 'PLAN_IDENTITY')
    need(path(plan['integration_worktree']) == paths['integration'] and path(c['worktree']) == paths['worker'] and
         branch(paths['integration']) == plan['integration_branch'] and branch(paths['worker']) == c['branch'], 'CHECKOUT_IDENTITY')
    if p['environment'] == 'live':
        need(c['branch'] == 'codex/story-35-6-crm-record-journeys', 'CHECKOUT_IDENTITY')
    after_claim = copy.deepcopy(c)
    after_claim['base_sha'] = p['main']
    owned = set(original['stories'][0]['write_paths'])
    before_tree, main_tree, candidate_tree = [tree(root, x) for x in
                                            [p['selected_checkpoint'], p['main'], p['worker_candidate']]]
    original_tree = tree(root, p['old_base'])
    need(all(not token.endswith('/') for token in owned), 'ALLOCATION_CHANGED')
    need(not any(before_tree.get(name) != original_tree.get(name) and
                 main_tree.get(name) != original_tree.get(name) and before_tree.get(name) != main_tree.get(name)
                 for name in owned), 'CONFLICT_NEEDS_DISPOSITION')
    for name in set(before_tree) | set(main_tree) | set(candidate_tree):
        if name == STATE:
            continue
        expected = before_tree.get(name) if name in owned else main_tree.get(name)
        need(candidate_tree.get(name) == expected, 'PRODUCT_OR_UNOWNED_BLOB_CHANGED')
    old_state = blob(root, p['selected_checkpoint'], STATE)
    new_state = reassessed(old_state, p['old_base'], p['main'])
    need(blob(root, p['worker_candidate'], STATE) == new_state, 'PUBLICATION_REASSESSMENT_CHANGED')
    identity, _ = publication(old_state, p['old_base'])
    need(identity.get('repository') == plan['repository'] and identity.get('branch') == c['branch'] and
         identity.get('base_branch') == 'main' and path(identity['worktree']) == paths['worker'], 'PUBLICATION_IDENTITY')
    # Integration adopts exact main content; its prior HEAD remains an ancestor.
    # Any additional integration-only tree state needs a separately bounded disposition.
    need(tree(root, p['integration_candidate']) == main_tree, 'INTEGRATION_TREE_CHANGED')
    ctx = dict(request=q, request_raw_sha256=rawhash(raw), request_digest=digest(q), proposal=p,
               store=store, common=common, snapshot=s, before_run=r, before_claim=c, after_plan=after,
               after_claim=after_claim, old_state=base64.b64encode(old_state).decode(),
               new_state=base64.b64encode(new_state).decode(),
               original_plan_raw=base64.b64encode(read(p['original_plan']['path'])).decode(), **paths)
    authorities(ctx)
    native(ctx, 'candidate')
    return ctx


def authorities(ctx):
    q, p = ctx['request'], ctx['proposal']
    private = ctx['private_root']
    need(rawhash(read(Path(__file__).resolve())) == p['tool_sha256'], 'TOOL_CHANGED')
    evidence(p['original_plan'], private)
    exclusions = evidence(p['exclusion_register'], private)
    if p['environment'] == 'live':
        need(p['exclusion_register']['sha256'] == EXCLUSIONS, 'EXCLUSIONS_CHANGED')
    else:
        need(type(exclusions) is dict and exclusions.get('synthetic') is True and
             [exclusions.get(k) for k in ['tokens', 'domains', 'allocations']] == [57, 7, 3], 'EXCLUSIONS_CHANGED')
    custody = evidence(p['custody'], private)
    exact(custody, 'kind run story coordinator worker old_archived writers_stopped no_reopen delegates queued_operations native_operations holds issued expires provenance')
    need(custody['kind'] == 'current-stopped-custody' and custody['run'] == RUN and custody['story'] == STORY and
         custody['coordinator'] == NEW and custody['worker'] == WORKER and custody['old_archived'] is True and
         custody['writers_stopped'] == [OLD, NEW, WORKER, PRODUCER] and custody['no_reopen'] is True and
         custody['delegates'] == custody['queued_operations'] == custody['native_operations'] == [] and
         custody['holds'] == ['35.6', '35.7'] and type(custody['provenance']) is str and bool(custody['provenance']), 'CUSTODY_INCOMPLETE')
    now = time.time()
    need(type(custody['issued']) in {int, float} and type(custody['expires']) in {int, float} and
         custody['issued'] <= now < custody['expires'] <= custody['issued'] + 900, 'CUSTODY_EXPIRED')
    observed = evidence(p['main_observation'], private)
    exact(observed, 'kind repository branch head issued expires provenance')
    need(observed['kind'] == 'current-provider-main-observation' and observed['repository'] == 'rthunborg/Kopplas' and
         observed['branch'] == 'main' and observed['head'] == p['main'] and
         type(observed['issued']) in {int, float} and type(observed['expires']) in {int, float} and
         observed['issued'] <= now < observed['expires'] <= observed['issued'] + 900 and
         type(observed['provenance']) is str and observed['provenance'], 'MAIN_OBSERVATION_STALE')
    envelope = {k: q[k] for k in ['schema_version', 'request_id', 'proposal']}
    exact(q['owner_approval'], 'proposal_digest evidence')
    need(q['owner_approval']['proposal_digest'] == digest(envelope), 'OWNER_DIGEST')
    owner = evidence(q['owner_approval']['evidence'], private)
    exact(owner, 'kind proposal_digest decision provenance')
    need(owner['kind'] == 'trusted-channel-owner-decision' and owner['proposal_digest'] == digest(envelope) and
         owner['decision'] == 'authorize-exact-cold-context-adoption' and type(owner['provenance']) is str and owner['provenance'], 'OWNER_PROVENANCE')
    review_envelope = dict(envelope, owner_approval=q['owner_approval'])
    exact(q['admission_review'], 'request_digest reviewer model effort evidence')
    review = q['admission_review']
    need(review['request_digest'] == digest(review_envelope) and type(review['reviewer']) is str and
         review['reviewer'] not in {OLD, NEW, WORKER, p['tool_author']} and review['reviewer'] and
         review['model'] == 'gpt-6.1-sol' and review['effort'] == 'high', 'REVIEW_BINDING')
    accepted = evidence(review['evidence'], private)
    exact(accepted, 'kind request_digest reviewer status provenance')
    need(accepted['kind'] == 'independent-exact-request-review' and accepted['request_digest'] == review['request_digest'] and
         accepted['reviewer'] == review['reviewer'] and accepted['status'] == 'passed' and
         type(accepted['provenance']) is str and accepted['provenance'], 'REVIEW_PROVENANCE')
    qualification = evidence(p['qualification'], private)
    exact(qualification, 'kind environment tool_sha256 tool_revision workflow model effort status evidence provenance')
    need(qualification['kind'] == 'qualified-cold-adoption-tool' and qualification['environment'] == p['environment'] and
         qualification['tool_sha256'] == p['tool_sha256'] and qualification['tool_revision'] == p['tool_revision'] and
         qualification['workflow'] == AFTER_PIN and qualification['model'] == 'gpt-6.1-sol' and
         qualification['effort'] == 'high' and qualification['status'] == 'passed' and
         type(qualification['evidence']) is str and qualification['evidence'] and
         type(qualification['provenance']) is str and qualification['provenance'], 'TOOL_UNQUALIFIED')
    if p['environment'] == 'live':
        # A private fixture/review assertion cannot replace exact source qualification.
        ancestor(ctx['repository'], p['tool_revision'], gittext(ctx['repository'], 'rev-parse', 'refs/remotes/origin/main'))
        need(rawhash(blob(ctx['repository'], p['tool_revision'], 'scripts/maintenance/adopt_stopped_coordinator_context.py')) ==
             p['tool_sha256'], 'TOOL_UNQUALIFIED')


def durable(destination, value):
    data = canonical(value).encode()
    need(len(data) <= MAX_FILE, 'JOURNAL_TOO_LARGE')
    candidate = destination.with_name(destination.name + '.' + str(uuid.uuid4()) + '.next')
    with candidate.open('xb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(candidate, destination)
    if os.name != 'nt':
        descriptor = os.open(str(destination.parent), os.O_RDONLY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)


@contextlib.contextmanager
def operation_lock(destination):
    lock = destination.with_suffix('.lock')
    need(not redirected(lock), 'UNSAFE_PATH')
    stream = lock.open('a+b')
    try:
        if os.name == 'nt':
            import msvcrt
            stream.seek(0)
            try:
                msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
            except OSError:
                raise Refusal('OPERATION_BUSY') from None
        else:
            import fcntl
            try:
                fcntl.flock(stream, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError:
                raise Refusal('OPERATION_BUSY') from None
        # Read/initialize only after owning the OS lock. On Windows a read of
        # another process's locked byte itself fails before locking can report busy.
        stream.seek(0)
        content = stream.read(2)
        need(content in {b'', b'0'}, 'LOCK_STATE_UNKNOWN')
        if not content:
            stream.write(b'0'); stream.flush(); os.fsync(stream.fileno())
        yield
    finally:
        stream.close()


def journal_path(ctx):
    return ctx['private_root']/('cold-adoption-' + ctx['request']['request_id'] + '.json')


def append(journal, destination, phase):
    journal['events'].append({'phase': phase, 'previous': digest(journal['events']), 'at': time.time()})
    durable(destination, journal)


def verify_journal(j, ctx):
    exact(j, 'version request_digest request_raw_sha256 before_snapshot context events')
    need(j['version'] == 1 and j['request_digest'] == ctx['request_digest'] and
         j['request_raw_sha256'] == ctx['request_raw_sha256'], 'JOURNAL_REQUEST_CHANGED')
    expected = ['prepared', 'integration-intent', 'integration-done', 'worker-intent', 'worker-done', 'native-intent', 'native-done']
    need(type(j['events']) is list and 1 <= len(j['events']) <= len(expected), 'JOURNAL_CORRUPT')
    for i, event in enumerate(j['events']):
        exact(event, 'phase previous at')
        need(event['phase'] == expected[i] and event['previous'] == digest(j['events'][:i]), 'JOURNAL_CORRUPT')
    need(j['context'] == context(ctx), 'JOURNAL_CONTEXT_CHANGED')


def context(ctx):
    return {k: ctx[k] for k in ['proposal', 'original_plan_raw', 'old_state', 'new_state', 'after_plan', 'after_claim']}


def recover_hot_store(preliminary, request_path, original):
    """SQLite engine rollback only for this exact recorded native-intent.

    No schema initialization or compensating owner update occurs here. Default
    validate/prepare/apply never enter this lane; they remain physically RO
    before mutation. A hot journal blocks RO until explicit recover is selected.
    """
    ctx = dict(preliminary)
    destination = journal_path(ctx)
    need(destination.is_file() and not redirected(destination), 'JOURNAL_REQUIRED')
    with operation_lock(destination):
        j = decode(read(destination))
        need(digest(j['before_snapshot']) == ctx['proposal']['expected_snapshot'], 'JOURNAL_SNAPSHOT_CHANGED')
        old_run, old_claim, plan = target(j['before_snapshot'])
        need(old_run['owner'] == OLD and plan == original and old_claim['base_sha'] == ctx['proposal']['old_base'], 'BEFORE_STATE_CHANGED')
        after_claim = copy.deepcopy(old_claim); after_claim['base_sha'] = ctx['proposal']['main']
        old_state = blob(ctx['repository'], ctx['proposal']['selected_checkpoint'], STATE)
        new_state = reassessed(old_state, ctx['proposal']['old_base'], ctx['proposal']['main'])
        ctx.update(after_claim=after_claim, old_state=base64.b64encode(old_state).decode(),
                   new_state=base64.b64encode(new_state).decode(),
                   original_plan_raw=base64.b64encode(read(ctx['proposal']['original_plan']['path'])).decode())
        verify_journal(j, ctx)
        need(len(j['events']) == 6 and j['events'][-1]['phase'] == 'native-intent', 'HOT_RECOVERY_PHASE')
        recheck(ctx, request_path)
        for key, candidate in [('integration', 'integration_candidate'), ('worker', 'worker_candidate')]:
            need(head(ctx[key]) == ctx['proposal'][candidate], 'HEAD_CHANGED')
        native(ctx, 'settled')
        recheck(ctx, request_path)
        # BEGIN IMMEDIATE lets SQLite recover its own uncommitted rollback
        # journal. Afterwards only the exact recorded before/after state is valid.
        with database(ctx['store'], write=True) as db:
            current = snapshot(db)
            need(current in [j['before_snapshot'], expected_after(j['before_snapshot'], ctx)], 'HOT_RECOVERY_STATE_DRIFT')
            audit_schema(db)


def recheck(ctx, request_path):
    need(rawhash(read(request_path)) == ctx['request_raw_sha256'], 'REQUEST_CHANGED')
    authorities(ctx)
    need(gittext(ctx['repository'], 'rev-parse', 'refs/remotes/origin/main') == ctx['proposal']['main'], 'MAIN_CHANGED')
    for key, candidate in [('integration_staging', 'integration_candidate')]:
        clean(ctx[key])
        need(head(ctx[key]) == ctx['proposal'][candidate], 'STAGING_CHANGED')
    for key, before_key, after_key, expected_branch in [
        ('integration', 'before_integration', 'integration_candidate', ctx['after_plan']['integration_branch']),
        ('worker', 'before_worker', 'worker_candidate', ctx['after_claim']['branch'])]:
        clean(ctx[key])
        need(branch(ctx[key]) == expected_branch and head(ctx[key]) in
             {ctx['proposal'][before_key], ctx['proposal'][after_key]}, 'CHECKOUT_IDENTITY_CHANGED')


def expected_after(before, ctx):
    result = copy.deepcopy(before)
    r = next(x for x in result['tables']['runs'] if x['run'] == RUN)
    r.update(owner=NEW, plan=canonical(ctx['after_plan']), plan_hash=digest(ctx['after_plan']))
    c = next(x for x in result['tables']['claims'] if x['run'] == RUN)
    c['base_sha'] = ctx['proposal']['main']
    return result


def receipt(ctx):
    packet = native(ctx, 'settled')
    packet.update(effective_plan_hash=digest(ctx['after_plan']), succession_request=ctx['request']['request_id'])
    return {'status': 'locally-adopted-publication-pending', 'admitted': False, 'packet': packet,
            'request_digest': ctx['request_digest'], 'holds': ['35.6', '35.7']}


def recover(ctx, request_path, prepare_only=False, create=True):
    dest = journal_path(ctx)
    need(not redirected(dest), 'UNSAFE_PATH')
    need(create or dest.is_file(), 'JOURNAL_REQUIRED')
    with operation_lock(dest):
        if dest.exists():
            j = decode(read(dest))
            verify_journal(j, ctx)
        else:
            need(create, 'JOURNAL_REQUIRED')
            need(head(ctx['integration']) == ctx['proposal']['before_integration'] and
                 head(ctx['worker']) == ctx['proposal']['before_worker'], 'JOURNAL_REQUIRED')
            need(digest(ctx['snapshot']) == ctx['proposal']['expected_snapshot'], 'NATIVE_SNAPSHOT_CHANGED')
            j = dict(version=1, request_digest=ctx['request_digest'], request_raw_sha256=ctx['request_raw_sha256'],
                     before_snapshot=ctx['snapshot'], context=context(ctx), events=[])
            append(j, dest, 'prepared')
        if prepare_only:
            need(len(j['events']) == 1 and ctx['snapshot'] == j['before_snapshot'], 'NOT_PREPARED_STATE')
            return {'status': 'prepared', 'admitted': False, 'request_digest': ctx['request_digest']}
        before = j['before_snapshot']
        need(digest(before) == ctx['proposal']['expected_snapshot'], 'JOURNAL_SNAPSHOT_CHANGED')
        # A committed audit is authoritative for response-loss replay, never a new admission.
        with database(ctx['store']) as db:
            if audit_schema(db):
                row = db.execute('SELECT * FROM coordinator_successions WHERE run=?', (RUN,)).fetchone()
                if row:
                    need(row['request_id'] == ctx['request']['request_id'] and row['request_hash'] == ctx['request_digest'] and
                         row['before_snapshot'] == canonical(before) and row['after_snapshot'] == canonical(snapshot(db)) and
                         row['request'] == canonical(ctx['request']) and row['context'] == canonical(context(ctx)), 'AUDIT_REPLAY_CONFLICT')
                    need(len(j['events']) >= 6, 'JOURNAL_CORRUPT')
                    need(head(ctx['integration']) == ctx['proposal']['integration_candidate'] and
                         head(ctx['worker']) == ctx['proposal']['worker_candidate'], 'AFTER_STATE_DRIFT')
                    fresh = receipt(ctx)
                    need(canonical(fresh) == row['response'], 'AUDIT_REPLAY_CONFLICT')
                    if len(j['events']) == 6:
                        append(j, dest, 'native-done')
                    return {'status': 'historical-replay', 'admitted': False, 'replayed': True,
                            'request_digest': ctx['request_digest']}
            need(snapshot(db) == before, 'NATIVE_SNAPSHOT_CHANGED')
        need(len(j['events']) <= 6, 'AUDIT_MISSING')
        def cold_recheck():
            recheck(ctx, request_path)
            with database(ctx['store']) as db:
                need(snapshot(db) == before, 'NATIVE_SNAPSHOT_CHANGED')
        for key, before_key, candidate_key, intent, done in [
            ('integration', 'before_integration', 'integration_candidate', 'integration-intent', 'integration-done'),
            ('worker', 'before_worker', 'worker_candidate', 'worker-intent', 'worker-done')]:
            phases = [x['phase'] for x in j['events']]
            cold_recheck()
            clean(ctx[key])
            current = head(ctx[key])
            if done in phases:
                need(current == ctx['proposal'][candidate_key], 'RECORDED_STAGE_DRIFT')
                continue
            if intent not in phases:
                need(current == ctx['proposal'][before_key], 'UNRECORDED_STAGE')
                append(j, dest, intent)
            need(current in {ctx['proposal'][before_key], ctx['proposal'][candidate_key]}, 'UNKNOWN_GIT_OUTCOME')
            if current != ctx['proposal'][candidate_key]:
                cold_recheck()
                git(ctx[key], 'merge', '--ff-only', '--no-edit', ctx['proposal'][candidate_key])
            clean(ctx[key])
            need(head(ctx[key]) == ctx['proposal'][candidate_key], 'UNKNOWN_GIT_OUTCOME')
            append(j, dest, done)
        cold_recheck()
        response = receipt(ctx)
        if len(j['events']) == 5:
            append(j, dest, 'native-intent')
        with database(ctx['store'], write=True) as db:
            need(snapshot(db) == before, 'NATIVE_SNAPSHOT_CHANGED')
            need(not audit_schema(db) or not db.execute('SELECT 1 FROM coordinator_successions').fetchone(), 'SECOND_SUCCESSION')
            recheck(ctx, request_path)
            for key, candidate in [('integration', 'integration_candidate'), ('worker', 'worker_candidate')]:
                clean(ctx[key]); need(head(ctx[key]) == ctx['proposal'][candidate], 'HEAD_CHANGED')
            native(ctx, 'settled')
            if not audit_schema(db):
                for statement in DDL:
                    db.execute(statement)
            old_run, old_claim, _ = target(before)
            need(old_run['owner'] == OLD and old_claim['base_sha'] == ctx['proposal']['old_base'], 'BEFORE_STATE_CHANGED')
            cursor = db.execute('UPDATE runs SET owner=?,plan=?,plan_hash=? WHERE run=? AND owner=? AND plan=? AND plan_hash=? AND state=? AND final_sha IS NULL',
                (NEW, canonical(ctx['after_plan']), digest(ctx['after_plan']), RUN, OLD, old_run['plan'], old_run['plan_hash'], old_run['state']))
            need(cursor.rowcount == 1, 'RUN_CAS_FAILED')
            cursor = db.execute('UPDATE claims SET base_sha=? WHERE run=? AND story=? AND base_sha=? AND worker=? AND generation=1 AND state=?',
                (ctx['proposal']['main'], RUN, STORY, old_claim['base_sha'], WORKER, 'blocked'))
            need(cursor.rowcount == 1, 'CLAIM_CAS_FAILED')
            after = snapshot(db)
            need(after == expected_after(before, ctx), 'CONSERVATION_FAILED')
            db.execute('INSERT INTO coordinator_successions VALUES(?,?,?,?,?,?,?,?,?)',
                (ctx['request']['request_id'], RUN, ctx['request_digest'], canonical(before), canonical(after),
                 canonical(ctx['request']), canonical(context(ctx)), canonical(response), time.time()))
            need(audit_schema(db), 'AUDIT_SCHEMA_CONFLICT')
            need(snapshot(db) == after, 'CONSERVATION_FAILED')
            recheck(ctx, request_path)
        append(j, dest, 'native-done')
        # Private audit holds the packet; public stdout never exposes native paths.
        return {'status': 'locally-adopted-publication-pending', 'admitted': False, 'replayed': False,
                'request_digest': ctx['request_digest'], 'plan_hash': digest(ctx['after_plan'])}


def main():
    class Parser(argparse.ArgumentParser):
        def error(self, message):
            raise Refusal('CLI_USAGE')
    parser = Parser(description=__doc__)
    parser.add_argument('operation', choices=['validate', 'prepare', 'apply', 'recover'])
    parser.add_argument('--request', required=True)
    try:
        args = parser.parse_args()
        ctx = validate(path(args.request), args.operation == 'recover')
        if args.operation == 'validate':
            need(digest(ctx['snapshot']) == ctx['proposal']['expected_snapshot'] and
                 ctx['before_run']['owner'] == OLD and not journal_path(ctx).exists(), 'NOT_FRESH_PREFLIGHT')
            need(head(ctx['integration']) == ctx['proposal']['before_integration'] and
                 head(ctx['worker']) == ctx['proposal']['before_worker'], 'NOT_FRESH_PREFLIGHT')
            result = {'status': 'validated', 'writes': 0, 'admitted': False, 'request_digest': ctx['request_digest'],
                      'after_plan_hash': digest(ctx['after_plan']), 'before_snapshot_digest': digest(ctx['snapshot']),
                      'run': RUN, 'story': STORY, 'old_owner': OLD, 'successor': NEW, 'worker': WORKER,
                      'generation': 1, 'state': 'blocked', 'conserved_unrelated_digest': ctx['snapshot']['unrelated_state_digest']}
        else:
            result = recover(ctx, path(args.request), args.operation == 'prepare', args.operation != 'recover')
        print(canonical(result))
        return 0
    except (Refusal, ValueError, TypeError, KeyError, OSError, sqlite3.Error, subprocess.SubprocessError) as error:
        code = str(error) if isinstance(error, Refusal) else 'INVALID_OR_UNAVAILABLE_INPUT'
        print(canonical({'status': 'refused', 'reason': code, 'admitted': False}))
        return 2


if __name__ == '__main__':
    sys.exit(main())
