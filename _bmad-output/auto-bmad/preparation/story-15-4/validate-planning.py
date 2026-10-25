"""Bounded artifact checks for the owned planning run; no runtime or product writes."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[4]
PREP = Path(__file__).resolve().parent
SPEC = ROOT / '_bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def write_json(name, data):
    (PREP / name).write_text(json.dumps(data, indent=2) + '\n', encoding='utf8', newline='\n')

head = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], text=True).strip()
if '--snapshot' in sys.argv or '--compact-snapshot' in sys.argv:
    target = PREP / 'source-preservation-before.json'
    assert not target.exists() or '--compact-snapshot' in sys.argv
    tracked = subprocess.check_output(['git', '-C', str(ROOT), 'status', '--porcelain', '--untracked-files=no'], text=True)
    assert tracked == '', tracked
    context = ROOT / '_bmad-output/implementation-artifacts/epic-15-context.md'
    write_json(target.name, {'head_before': head, 'tracked_changes': [], 'cached_context_sha256': sha(context.read_bytes()), 'method': 'clean tracked Git status binds source to canonical HEAD; compact receipt replaces redundant copied file inventory'})
    print(json.dumps({'snapshot': str(target), 'head': head, 'tracked_changes': 0}))
    sys.exit(0)

s = SPEC.read_text(encoding='utf8')
epics = (ROOT / '_bmad-output/planning-artifacts/epics-phase-b.md').read_text(encoding='utf8')
source = epics.split('#### Story 15.4: Time Reporting — Filing, Timesheet, Review', 1)[1].split('#### Story 15.5:', 1)[0].strip()
assert s.count(source) == 1
assert len(re.findall(r'^- AC\d+ — Given .+, when .+, then .+', s, re.M)) == 9
assert re.findall(r'^- \[ \] T(\d+) —', s, re.M) == [str(i) for i in range(1, 11)]
assert not re.search(r'\b(TBD|ONE_TO_TWO_SENTENCES|HAPPY_PATH|ERROR_CASE|DESIGN_RATIONALE_AND_EXAMPLES)\b', s)
assert '<!--' not in s
assert s.count('<intent-contract>') == s.count('</intent-contract>') == 1
assert '## Suggested Review Order' not in s
assert '**No Design Gate Criteria for this story.**' in s
assert 'SUPABASE_TEST_REQUIRED=1' in s and 'independent High' in s
assert 'warnings: [oversized]' in s
for item in ('implementation-ownership-handoff.md', 'current-contracts-and-design.md', 'story-file-audit.md', 'spec-self-validation.md'):
    assert (PREP / item).is_file(), item
for path in re.findall(r'^  - (.+)$', s.split('---', 2)[1], re.M):
    assert (ROOT / path).is_file(), path
before = json.loads((PREP / 'source-preservation-before.json').read_text(encoding='utf8'))
tracked = subprocess.check_output(['git', '-C', str(ROOT), 'status', '--porcelain', '--untracked-files=no'], text=True)
assert tracked == '', tracked
assert head == before['head_before'] == '5040f683cf9446d39de8512cdca82242c55fca3e'
context = ROOT / '_bmad-output/implementation-artifacts/epic-15-context.md'
assert context.read_text(encoding='utf8').startswith('# Epic 15 Context:')
assert sha(context.read_bytes()) == before['cached_context_sha256']
assert context.stat().st_mtime >= max(p.stat().st_mtime for p in (ROOT / '_bmad-output/planning-artifacts').iterdir() if p.is_file())
write_json('source-preservation-after.json', {'head_after': head, 'tracked_changes': [], 'cached_context_sha256': sha(context.read_bytes()), 'passed': True})
kernel = re.search(r'<intent-contract>.*?</intent-contract>', s, re.S).group()
(PREP / 'candidate-intent-contract.txt').write_text(kernel, encoding='utf8', newline='\n')
assert "status: 'ready-for-dev'" in s
helper = ROOT / '.agents/skills/auto-bmad/scripts/story_plan.py'
for name, args in (('spec-reader.json', ['--spec', str(SPEC)]), ('spec-discovery.json', ['--find-spec', '--impl-dir', str(SPEC.parent), '--story-key', '15-4-time-reporting-filing-timesheet-review'])):
    result = subprocess.run([sys.executable, str(helper), *args], capture_output=True, text=True, check=False)
    assert result.returncode == 0, (name, result.stdout, result.stderr)
    payload = json.loads(result.stdout)
    write_json(name, payload)
    if name == 'spec-reader.json':
        assert payload['status'] == 'ready-for-dev' and payload['error'] is None and payload['parse_warnings'] == []
    else:
        assert payload['found'] and not payload['ambiguous'] and not payload['hard_stop']
        assert Path(payload['spec_path']) == SPEC
record = {'outcome': 'done', 'halt_status': 'ready-for-dev', 'blocking_condition': None, 'spec_path': str(SPEC), 'baseline_revision': head, 'phase': 'planning-only', 'model': 'gpt-6.1-sol', 'effort': 'high', 'tasks': 10, 'acceptance_criteria': 9, 'source_ac_sketches_preserved_verbatim': 1, 'story_file_audit_checks_passed': 7, 'kernel_sha256': sha(kernel.encode('utf8')), 'kernel_hash_definition': 'UTF-8 LF exact text including both intent-contract tags, no appended newline', 'raw_sha256': sha(SPEC.read_bytes()), 'raw_bytes': SPEC.stat().st_size, 'approved_kernel': None, 'approval_status': 'pending-root-independent-High-validation-and-freeze', 'reader_passed': True, 'discovery_passed': True, 'preservation_passed': True, 'preservation_method': 'unchanged canonical HEAD plus clean tracked Git status and cached-context SHA256', 'cached_epic_context': 'valid-reused-byte-unchanged', 'runtime_tests_executed': 0, 'resources_started': 0, 'code_review_rounds': 0, 'independent_spec_review': 'pending-root', 'release_ready': False, 'proposed_migration': {'logical_basename': 'time_reports', 'timestamp_after': '20261020180000', 'timestamp_reserved': False, 'sql_write_grant': False}, 'proposed_new_table': 'time_reports', 'proposed_notification': 'time_report.nudge (in_app only)', 'build_prerequisites': ['Root independent High validation/freeze', 'Coordinator exact shared semantic allocation, migration reservation, isolated fixtures/resources']}
write_json('validation.json', record)
inventory = {str(p.relative_to(ROOT)).replace('\\', '/'): sha(p.read_bytes()) for p in sorted(PREP.iterdir()) if p.is_file() and p.name != 'artifact-manifest.json'}
inventory[str(SPEC.relative_to(ROOT)).replace('\\', '/')] = sha(SPEC.read_bytes())
write_json('artifact-manifest.json', {'baseline_revision': head, 'sha256': inventory})
print(json.dumps(record, indent=2))
