"""Bounded artifact/provenance checks only; never launches product tests or services."""
from pathlib import Path
import collections
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
PACKET = ROOT / '.env.epic15.mail-runtime/story-15-4-preparation/checkpoint-cad4d37f-ci-independent'
SPEC = '_bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md'
DELIVERY = '_bmad-output/auto-bmad/delivery/15-4-time-reporting-filing-timesheet-review.json'
FREEZE = '_bmad-output/auto-bmad/preparation/story-15-4/sourcefreeze-ci-followup-d798b286.json'
AUDIT = '_bmad-output/auto-bmad/preparation/story-15-4/development-completion-cad4d37f/truth-audit/final-audit.json'
HEAD = 'cad4d37facf8cbf5d9c0c3701117d5b4f21d4de1'
KERNEL = '3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb'
STAMP = '2026-10-20T12-08-37-492Z'
checks = []
def check(name, passed, detail=None):
    checks.append({'name': name, 'passed': bool(passed), 'detail': detail})
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))
def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args]).decode().strip()
def write(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

bindings = {
    PACKET / 'report.json': 'd92811e5c91ae4429fd14e40d5a68a32adc3c7b87cb4c166cdcea88ffc54a360',
    PACKET / 'sha256-manifest.json': 'd3558fc2b6a98f1ac4fdf32eff6b497a9ea28dcc367ff6bd1c64bb4b8479733a',
    ROOT / FREEZE: 'e575391c9df265a21df890ba02dc1ea9dc1c538aada289e14325a9f0946afe17',
    ROOT / DELIVERY: 'acc8cecee0cca409860cd5ec5fdfac0aa81400acccbeb7f88dd5c91cd6537ab6',
    ROOT / AUDIT: '0bb6a1cbb414ead7d3404efc08c72632268c5fee8a39c71a5bffba2857155e29',
    ROOT / SPEC: '2b112ecee170676c8468d246dbbe695f4d07f040c76b3f1c3c2710fc43400c0c',
}
for path, expected in bindings.items():
    check('input hash ' + str(path.relative_to(ROOT)), sha(path) == expected, sha(path))
manifest = read(PACKET / 'sha256-manifest.json')
bad_packet = [x['path'] for x in manifest['files'] if
              not (PACKET / x['path']).is_file() or
              (PACKET / x['path']).stat().st_size != x['bytes'] or
              sha(PACKET / x['path']) != x['sha256']]
check('190 immutable packet file bindings', len(manifest['files']) == 190 and not bad_packet, bad_packet)
freeze = read(ROOT / FREEZE)
bad_raw, bad_git = [], []
for entry in freeze['source_test_schema_config_paths']:
    path = entry['path']
    if sha(ROOT / path) != entry['raw_sha256']:
        bad_raw.append(path)
    if any(git('rev-parse', f'{rev}:{path}') != entry['git_blob'] for rev in ('HEAD', HEAD, freeze['latest_independently_reviewed_source'])):
        bad_git.append(path)
check('60 current source raw hashes', len(freeze['source_test_schema_config_paths']) == 60 and not bad_raw, bad_raw)
check('60 current/checkpoint/reviewed Git blob identities', not bad_git, bad_git)
spec_text = (ROOT / SPEC).read_text(encoding='utf-8-sig')
kernel = re.search(r'<intent-contract>.*?</intent-contract>', spec_text, re.S).group()
check('approved LF kernel preserved', hashlib.sha256(kernel.encode()).hexdigest() == KERNEL)
acs = re.findall(r'^- (AC[1-9]) — (.*)$', spec_text, re.M)
check('nine approved ACs', [a[0] for a in acs] == [f'AC{i}' for i in range(1, 10)])
report = read(PACKET / 'report.json')
check('CI identity/checkpoint/attempt', report['head'] == HEAD and report['run']['id'] == 39415418173 and report['run']['run_attempt'] == 1 and report['checkpoint'] == '420be87e-0913-42fe-8909-f7fda85cb934')
required = {'checkpoint-admission', 'verify', 'db', 'e2e', 'recovery-storage-loader'}
jobs = {j['name']: j['conclusion'] for j in report['jobs']}
check('all five required jobs successful', all(jobs.get(k) == 'success' for k in required))
check('release validation false', report['release_validation'] is False and report['release_ready'] is False)
check('native full unit counts', report['unit']['tests'] == report['unit']['pass'] == 3041 and report['unit']['fail'] == report['unit']['skipped'] == 0)
check('43 process tests', sum(report['process_test_counts']) == 43, report['process_test_counts'])

integration = read(PACKET / 'extracted/native-full-integration/full-integration.json')
check('full integration executed counts / skips not credited', integration['success'] and integration['numTotalTests'] == 1980 and integration['numPassedTests'] == 1928 and integration['numFailedTests'] == 0 and integration['numPendingTests'] == 52)
expected_files = {
    'tests/integration/commands/time-reports.int.test.ts': (11, 'real_DB'),
    'tests/integration/rls/time-reports.rls.test.ts': (7, 'real_DB'),
    'tests/integration/read-models/time-reports.int.test.ts': (7, 'real_DB'),
    'tests/integration/notifications/time-report-nudge-producer.int.test.ts': (13, 'real_DB'),
    'tests/integration/components/time-reports.test.ts': (18, 'component'),
}
inventory = []
for path, (count, level) in expected_files.items():
    matches = [s for s in integration['testResults'] if s['name'].endswith('/' + path)]
    assertions = matches[0]['assertionResults'] if len(matches) == 1 else []
    check('native source suite ' + path, len(matches) == 1 and len(assertions) == count and all(a['status'] == 'passed' and not a.get('failureMessages') for a in assertions), {'expected': count, 'actual': len(assertions)})
    source = (ROOT / path).read_text(encoding='utf-8-sig')
    titles = re.findall(r'\btest\(\s*"([^"\n]+)"', source)
    check('source/native title inventory ' + path, len(titles) == count and set(titles) == {a['title'] for a in assertions})
    check('no committed story skips/focus ' + path, not re.search(r'\b(?:test|it|describe)\.(?:skip|only)\s*\(', source))
    for a in assertions:
        inventory.append({'file': path, 'title': a['title'], 'level': level, 'native_status': a['status'], 'evidence': str((PACKET / 'extracted/native-full-integration/full-integration.json').relative_to(ROOT))})
verify_log = (PACKET / 'logs/118603175261-verify.log').read_text(encoding='utf-8-sig')
pure = list((ROOT / 'tests/unit/features/time-reports').glob('*.test.ts'))
for path in sorted(pure):
    source = path.read_text(encoding='utf-8-sig')
    titles = re.findall(r'\btest\(\s*"([^"\n]+)"', source)
    check('unit titles reached native passing TAP ' + path.name, all(re.search(r'\bok \d+ - ' + re.escape(title) + r'\s*$', verify_log, re.M) for title in titles), len(titles))
    check('no committed unit skips/focus ' + path.name, not re.search(r'\b(?:test|it|describe)\.(?:skip|only)\s*\(', source))
    for title in titles:
        inventory.append({'file': str(path.relative_to(ROOT)).replace('\\', '/'), 'title': title, 'level': 'pure', 'native_status': 'passed', 'evidence': str((PACKET / 'logs/118603175261-verify.log').relative_to(ROOT))})

browser = read(PACKET / 'extracted/native-general-browser/general-browser.json')
browser_cases = []
def visit(suite):
    for child in suite.get('suites', []): visit(child)
    for spec in suite.get('specs', []):
        for test in spec.get('tests', []):
            browser_cases.append((spec, test))
for suite in browser['suites']: visit(suite)
check('17 first-pass browser bodies', len(browser_cases) == 17 and not browser.get('errors') and all(t['status'] == 'expected' and len(t['results']) == 1 and t['results'][0]['status'] == 'passed' and t['results'][0].get('retry', 0) == 0 for _, t in browser_cases))
story_browser = [(s, t) for s, t in browser_cases if s.get('file') == 'time-reports.e2e.spec.ts' or s.get('file', '').endswith('/time-reports.e2e.spec.ts')]
check('three story browser cases', len(story_browser) == 3)
for s, t in story_browser:
    inventory.append({'file': 'tests/e2e/time-reports.e2e.spec.ts', 'title': s['title'], 'level': 'browser', 'native_status': t['results'][0]['status'], 'evidence': str((PACKET / 'extracted/native-general-browser/general-browser.json').relative_to(ROOT))})
counts = dict(collections.Counter(x['level'] for x in inventory))
check('76 distinct existing story cases', len(inventory) == 76 and counts == {'real_DB': 38, 'component': 18, 'pure': 17, 'browser': 3}, counts)
storage = read(PACKET / 'extracted/native-isolated-storage-recovery/isolated-storage-recovery.json')
check('separate physical Storage actual1P0F0S', storage['success'] and storage['numPassedTests'] == 1 and storage['numFailedTests'] == storage['numPendingTests'] == 0)
check('serial DDL actual order and nonoverlap', report['serial']['after_parallel'] is True and report['serial']['nonoverlapping'] is True and len(report['serial']['files']) == 4)
delivery = read(ROOT / DELIVERY)
check('six owned release deferrals retained', len(delivery['deferred_release_validation']) == 6 and all(x['status'] == 'deferred' and all(x.get(k) for k in ('item', 'owner', 'evidence', 'next_action')) for x in delivery['deferred_release_validation']) and delivery['release_ready'] is False)
audit = read(ROOT / AUDIT)
check('independent final truth audit reused', audit['development_complete_assertions_supported'] is True and audit['release_ready'] is False and not audit['blockers'])

workers = []
if '--final' in sys.argv:
    for worker in ('api', 'e2e'):
        path = OUT / f'tea-automate-{worker}-tests-{STAMP}.json'
        data = read(path)
        check('worker schema and zero-generation ' + worker, data['success'] is True and data['subagent'] == worker + '-tests' and data['tests'] == [] and data['test_count'] == 0 and not data['fixture_needs'] and data['new_tests'] == data['runtime_runs'] == 0 and not data['consequential_gaps'])
        check('worker nine-AC map ' + worker, {row['ac'] for row in data['existing_coverage']} == {f'AC{i}' for i in range(1, 10)})
        workers.append({'path': str(path.relative_to(ROOT)), 'bytes': path.stat().st_size, 'sha256': sha(path)})
    aggregate = read(OUT / f'tea-automate-summary-{STAMP}.json')
    check('aggregate zero-generation and existing counts', aggregate['success'] is True and aggregate['total_tests'] == aggregate['fixtures_created'] == aggregate['runtime_runs_this_assessment'] == 0 and aggregate['existing_executed_story_counts'] == {'pure': 17, 'component_ssr_controller': 18, 'real_DB': 38, 'browser': 3, 'total': 76} and aggregate['release_ready'] is False)
    summary = (ROOT / '_bmad-output/test-artifacts/automation-summary-story-15-4-postdev.md').read_text(encoding='utf-8')
    check('summary workflow completion and required sections', "lastStep: 'step-04-validate-and-summarize'" in summary and "assessment: 'adequate-existing-development-proof'" in summary and 'release_ready: false' in summary and all(x in summary for x in ('### Playwright Utils deviations', '### Pact.js Utils deviations', '### Deferred release validation', '### Final executable coverage map')))
    headings = re.findall(r'^#{1,6} (.*)$', summary, re.M)
    check('summary Markdown hygiene', len(headings) == len(set(headings)) and len(re.findall(r'^```', summary, re.M)) % 2 == 0 and not any(re.search(r'[ \t]+$', line) for line in summary.splitlines()))

write(OUT / 'coverage-inventory.json', {'kind': 'existing-executed-story-test-inventory', 'head': HEAD, 'run': 39415418173, 'generated_tests': 0, 'runtime_runs_this_assessment': 0, 'counts': counts, 'total': len(inventory), 'tests': inventory})
result = {'kind': 'postdev-automate-artifact-validation', 'status': 'PASS' if all(x['passed'] for x in checks) else 'FAIL', 'checks_passed': sum(x['passed'] for x in checks), 'checks_failed': sum(not x['passed'] for x in checks), 'checks': checks, 'current_head_observed': git('rev-parse', 'HEAD'), 'qualified_ci_head': HEAD, 'source_paths_verified': 60, 'source_git_revisions_verified': 3, 'packet_files_verified': len(manifest['files']), 'input_bindings': [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p)} for p in bindings], 'workers': workers, 'new_product_tests': 0, 'runtime_test_runs': 0, 'resources_started': 0, 'source_or_spec_mutations': 0, 'release_ready': False}
write(OUT / 'validation-result.json', result)
print(json.dumps({k: result[k] for k in ('status', 'checks_passed', 'checks_failed', 'current_head_observed', 'source_paths_verified', 'packet_files_verified')}))
if result['status'] != 'PASS':
    print(json.dumps([x for x in checks if not x['passed']], ensure_ascii=False))
    sys.exit(1)
