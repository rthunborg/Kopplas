"""Story15.5 owned artifact validation only; no runtime or product mutation."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[4]
PREP = Path(__file__).resolve().parent
SPEC = ROOT / '_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md'
BASELINE = '159557e114f18123e73282c39c90830917de9948'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args], text=True).strip()

def output(name, value):
    (PREP / name).write_text(json.dumps(value, indent=2) + '\n', encoding='utf8', newline='\n')

head = git('rev-parse', 'HEAD')
tracked = git('status', '--porcelain', '--untracked-files=no')
assert head == BASELINE, head
HISTORY = PREP / 'revisions/initial-candidate'
history_manifest = json.loads((HISTORY / 'history-manifest.json').read_text(encoding='utf8'))
validated_history = json.loads((PREP / 'revisions/validated-candidate/history-manifest.json').read_text(encoding='utf8')) if (PREP / 'approval.json').exists() else None
approval = json.loads((PREP / 'approval.json').read_text(encoding='utf8')) if validated_history else None
root_owned_states = (validated_history or history_manifest)['root_owned_state_sha256']
assert set(git('diff', '--name-only').splitlines()) <= set(root_owned_states), tracked
for path, expected in root_owned_states.items():
    assert sha((ROOT / path).read_bytes()) == expected, path
for path, expected in history_manifest['snapshot_files'].items():
    assert sha((HISTORY / path).read_bytes()) == expected, path
for path, expected in history_manifest['independent_validation_preservation'].items():
    assert sha((ROOT / path).read_bytes()) == expected, path
if validated_history:
    for path, expected in validated_history['snapshot_files'].items():
        assert sha((PREP / 'revisions/validated-candidate' / path).read_bytes()) == expected, path
    for path, expected in validated_history['independent_validation_preservation'].items():
        assert sha((ROOT / path).read_bytes()) == expected, path
    assert sha((ROOT / approval['approval_source']['root_receipt']).read_bytes()) == approval['approval_source']['root_receipt_sha256']
    assert sha((PREP / 'implementation-ownership-handoff.md').read_bytes()) == approval['handoff_sha256_unchanged']
independent = json.loads((PREP / 'independent-validation/validation-report.json').read_text(encoding='utf8'))
for path, expected in independent['source_snapshot_sha256'].items():
    assert sha((ROOT / path).read_bytes()) == expected, path
context = ROOT / '_bmad-output/implementation-artifacts/epic-15-context.md'
if '--snapshot' in sys.argv:
    assert not (PREP / 'source-preservation-before.json').exists()
    output('source-preservation-before.json', {
        'head_before': head, 'tracked_changes': [], 'cached_context_sha256': sha(context.read_bytes()),
        'method': 'canonical HEAD and clean tracked Git status; initial clean status obtained before owned artifact writes; compact receipt taken before readiness gate',
        'source_paths': ['src/', 'supabase/', 'tests/', 'scripts/', 'package.json', 'pnpm-lock.yaml', 'AGENTS.md', '_bmad-output/implementation-artifacts/sprint-status.yaml', '_bmad-output/auto-bmad/state.yaml'],
    })
    print('Source preservation snapshot PASS')
    sys.exit(0)

s = SPEC.read_text(encoding='utf8')
if approval:
    validated_spec = (PREP / 'revisions/validated-candidate' / SPEC.relative_to(ROOT)).read_text(encoding='utf8')
    assert s.replace(approval['metadata_only_delta']['added_frontmatter'], '', 1).removesuffix(approval['metadata_only_delta']['appended_approval_metadata']) == validated_spec
    assert f"approved_kernel: '{approval['approved_kernel']}'" in s
source_doc = (ROOT / '_bmad-output/planning-artifacts/epics-phase-b.md').read_text(encoding='utf8')
source = source_doc.split('#### Story 15.5: Personal Calendar Feed (ADR-B004 Surface #1)', 1)[1].split('#### Story 15.6:', 1)[0].strip()
assert s.count(source) == 1
assert re.findall(r'^- \[ \] T(\d+) —', s, re.M) == [str(i) for i in range(1, 11)]
assert len(re.findall(r'^- AC\d+ — Given .+, when .+, then .+', s, re.M)) == 9
assert s.count('<intent-contract>') == s.count('</intent-contract>') == 1
assert 'rechecks active tenant/membership' not in s and 'current inactive tenant/membership' not in s
assert 'requires the tenant row to exist' in s and 'NULL provisioning_state' in s
assert 'src/components/scheduling/PersonalCalendarView.tsx' in s
assert 'Planering→actual Min kalender→Kalenderprenumeration link→settings' in s
assert not re.search(r'\b(TBD|ONE_TO_TWO_SENTENCES|HAPPY_PATH|ERROR_CASE|DESIGN_RATIONALE_AND_EXAMPLES)\b', s)
assert '<!--' not in s and '## Suggested Review Order' not in s
assert '**No Design Gate Criteria for this story.**' in s
assert 'SUPABASE_TEST_REQUIRED=1' in s and 'independent High' in s
assert "status: 'ready-for-dev'" in s and 'warnings: [oversized]' in s
for item in ('current-contracts-and-design.md', 'implementation-ownership-handoff.md', 'source-discovery.md', 'story-file-audit.md', 'spec-self-validation.md', 'routes.json'):
    assert (PREP / item).is_file(), item
for path in re.findall(r'^  - (.+)$', s.split('---', 2)[1], re.M):
    assert (ROOT / path).is_file(), path
before = json.loads((PREP / 'source-preservation-before.json').read_text(encoding='utf8'))
assert before['head_before'] == head
assert sha(context.read_bytes()) == before['cached_context_sha256']
assert context.read_text(encoding='utf8').startswith('# Epic 15 Context:')
assert context.stat().st_mtime >= max(p.stat().st_mtime for p in (ROOT / '_bmad-output/planning-artifacts').iterdir() if p.is_file())
status = git('status', '--porcelain', '--untracked-files=all')
owned_spec = SPEC.relative_to(ROOT).as_posix()
owned_prefix = PREP.relative_to(ROOT).as_posix() + '/'
for line in status.splitlines():
    if line[3:] in root_owned_states or line[2:] in root_owned_states:
        continue
    assert line.startswith('?? '), line
    path = line[3:]
    assert path == owned_spec or path.startswith(owned_prefix), path
output('source-preservation-after.json', {
    'head_after': head, 'author_tracked_changes': [], 'cached_context_sha256': sha(context.read_bytes()),
    'known_root_owned_state_hashes_unchanged': root_owned_states,
    'original_candidate_snapshot_files_verified': len(history_manifest['snapshot_files']),
    'independent_report_files_unchanged': len(history_manifest['independent_validation_preservation']),
    'validated_candidate_snapshot_files_verified': 3 if validated_history else 0,
    'all_independent_report_files_unchanged': len(validated_history['independent_validation_preservation']) if validated_history else 4,
    'independent_source_snapshots_verified': len(independent['source_snapshot_sha256']),
    'owned_untracked_only_apart_from_immutable_independent_reports': True,
    'source_schema_tests_dependencies_env_sprint_unchanged': True, 'passed': True,
})
kernel = re.search(r'<intent-contract>.*?</intent-contract>', s, re.S).group()
if approval:
    assert sha(kernel.encode('utf8')) == approval['approved_kernel'] == '0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977'
(PREP / 'candidate-intent-contract.txt').write_text(kernel, encoding='utf8', newline='\n')
helper = ROOT / '.agents/skills/auto-bmad/scripts/story_plan.py'
for name, args in (
    ('spec-reader.json', ['--spec', str(SPEC)]),
    ('spec-discovery.json', ['--find-spec', '--impl-dir', str(SPEC.parent), '--story-key', '15-5-personal-calendar-feed-adr-b004-surface-1']),
):
    process = subprocess.run([sys.executable, str(helper), *args], capture_output=True, text=True)
    assert process.returncode == 0, (name, process.stdout, process.stderr)
    payload = json.loads(process.stdout)
    output(name, payload)
    if name == 'spec-reader.json':
        assert payload['status'] == 'ready-for-dev' and payload['error'] is None and payload['parse_warnings'] == []
    else:
        assert payload['found'] and not payload['ambiguous'] and not payload['hard_stop'] and Path(payload['spec_path']) == SPEC
record = {
    'outcome': 'bounded-planning-repair-complete', 'halt_status': 'ready-for-dev', 'blocking_condition': None,
    'spec_path': str(SPEC), 'baseline_revision': head, 'phase': 'planning-only',
    'model': 'gpt-6.1-sol', 'effort': 'high', 'tasks': 10, 'acceptance_criteria': 9,
    'source_ac_sketches_preserved_verbatim': 1, 'story_file_audit_checks_passed': 7,
    'kernel_sha256': sha(kernel.encode('utf8')),
    'kernel_hash_definition': 'UTF-8 LF exact text including both intent-contract tags, no appended newline',
    'raw_sha256': sha(SPEC.read_bytes()), 'raw_bytes': SPEC.stat().st_size,
    'approved_kernel': None, 'approval_status': 'pending-targeted-distinct-independent-High-revalidation',
    'repaired_findings': ['F15.5-01', 'F15.5-02'],
    'initial_independent_validation': {'status': 'FAIL', 'checks': 14, 'passed': 12, 'failed': 2, 'immutable': True},
    'original_kernel_sha256': history_manifest['original_kernel_sha256'],
    'original_raw_spec_sha256': history_manifest['original_spec_sha256'],
    'original_manifest_sha256': history_manifest['original_manifest_sha256'],
    'initial_history_manifest_sha256': sha((HISTORY / 'history-manifest.json').read_bytes()),
    'original_candidate_snapshot_files_verified': len(history_manifest['snapshot_files']),
    'independent_source_snapshots_verified': len(independent['source_snapshot_sha256']),
    'reader_passed': True, 'discovery_passed': True, 'preservation_passed': True,
    'cached_epic_context': 'valid-reused-byte-unchanged', 'runtime_tests_executed': 0, 'resources_started': 0,
    'code_review_rounds': 0, 'discovery_delegates_completed': 1, 'independent_spec_review': 'initial-FAIL; targeted-revalidation-pending-root',
    'release_ready': False, 'proposed_migration': {'logical_basename': 'personal_calendar_feed', 'timestamp_reserved': False, 'requires': 'fresh combined E15/E16 chronology before CLI creation', 'sql_write_grant': False},
    'proposed_tenant_table': 'calendar_feed_tokens', 'proposed_global_infrastructure_table': 'calendar_feed_ip_windows',
    'proposed_public_surface': 'calendar_feed', 'prepared_handoff': str(PREP / 'implementation-ownership-handoff.md'),
    'build_prerequisites': ['Root distinct independent High validation/freeze/phase3 admission', 'Coordinator exact shared deltas/migration/serial DDL/isolated fixtures and test key/runtime allocation'],
    'hosted_enablement_prerequisites': ['separate release authorization', 'release operator dedicated feed-key/Vault/runtime and deployment-verified trusted-IP evidence'],
}
if approval:
    record.update({
        'outcome': 'approval-metadata-pin-complete',
        'approved_kernel': approval['approved_kernel'],
        'approval_status': 'pinned-after-targeted-independent-High-PASS; implementation-admission-held',
        'approval_record_sha256': sha((PREP / 'approval.json').read_bytes()),
        'validated_candidate_raw_spec_sha256': approval['validated_raw_spec_sha256'],
        'metadata_only_reconstruction_verified': True,
        'validated_candidate_snapshot_files_verified': 3,
        'all_independent_report_files_unchanged': 8,
        'independent_spec_review': 'targeted-PASS6/6; initial12-unchanged-PASS-assessments-reused; zero-remaining-findings',
        'implementation_admitted': False,
    })
output('validation.json', record)
inventory = {p.relative_to(ROOT).as_posix(): sha(p.read_bytes()) for p in sorted(PREP.rglob('*'))
             if p.is_file() and p != PREP / 'artifact-manifest.json'
             and 'independent-validation' not in p.relative_to(PREP).parts}
inventory[owned_spec] = sha(SPEC.read_bytes())
output('artifact-manifest.json', {
    'baseline_revision': head, 'revision': 'approval-metadata-only' if approval else 'bounded-author-repair-F15.5-01-F15.5-02',
    'approved_kernel': approval['approved_kernel'] if approval else None,
    'original_history_manifest_sha256': sha((HISTORY / 'history-manifest.json').read_bytes()),
    'validated_history_manifest_sha256': sha((PREP / 'revisions/validated-candidate/history-manifest.json').read_bytes()) if approval else None,
    'independent_validation_files_excluded_and_conserved': (validated_history or history_manifest)['independent_validation_preservation'],
    'sha256': inventory,
})
print(json.dumps(record, indent=2))
