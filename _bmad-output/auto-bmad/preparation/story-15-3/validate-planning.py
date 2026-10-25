"""Bounded read-only product preservation / owned planning artifact checks."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[4]
PREP = Path(__file__).resolve().parent
SPEC = ROOT / '_bmad-output/implementation-artifacts/spec-15-3-conflict-resolver.md'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def write_json(name, value):
    (PREP / name).write_text(json.dumps(value, indent=2) + '\n', encoding='utf8', newline='\n')

s = SPEC.read_text(encoding='utf8')
epics = (ROOT / '_bmad-output/planning-artifacts/epics-phase-b.md').read_text(encoding='utf8')
source_ac = epics.split('#### Story 15.3: Conflict Resolver', 1)[1].split('#### Story 15.4:', 1)[0].strip()
assert source_ac in s
assert s.count(source_ac) == 1
assert source_ac.count('AC sketch:') == 1
assert len(re.findall(r'^- AC\d+ — Given .+, when .+, then .+', s, re.M)) == 8
assert re.findall(r'^- \[ \] T(\d+) —', s, re.M) == [str(i) for i in range(1, 10)]
assert not re.search(r'\b(TBD|ONE_TO_TWO_SENTENCES|SOURCE_AC_SKETCH|DESIGN_RATIONALE_AND_EXAMPLES|HAPPY_PATH|ERROR_CASE)\b', s)
assert '<!--' not in s
assert s.count('<intent-contract>') == s.count('</intent-contract>') == 1
assert '## Suggested Review Order' not in s
assert s.count('## Source Acceptance and Provenance') == 1
assert '**No Design Gate Criteria for this story.**' in s
assert 'SUPABASE_TEST_REQUIRED=1' in s
assert 'release-ready' in s and 'independent High' in s
assert 'warnings: [oversized]' in s
for companion in ('implementation-ownership-handoff.md', 'current-contracts-and-design.md', 'story-file-audit.md', 'spec-self-validation.md'):
    assert (PREP / companion).is_file()
for context in re.findall(r'^  - (.+)$', s.split('---', 2)[1], re.M):
    assert (ROOT / context).is_file(), context

before = json.loads((PREP / 'source-preservation-before.json').read_text(encoding='utf8'))
changed = [p for p, digest in before['sha256'].items() if not (ROOT / p).is_file() or sha((ROOT / p).read_bytes()) != digest]
assert changed == [], changed
head = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], text=True).strip()
assert head == before['head_before']
context = ROOT / '_bmad-output/implementation-artifacts/epic-15-context.md'
assert context.read_text(encoding='utf8').startswith('# Epic 15 Context:')
assert context.stat().st_mtime >= max(p.stat().st_mtime for p in (ROOT / '_bmad-output/planning-artifacts').iterdir() if p.is_file())
write_json('source-preservation-after.json', {'head_after':head,'files_checked':len(before['sha256']),'changed_paths':changed,'passed':True})

kernel = re.search(r'<intent-contract>.*?</intent-contract>', s, re.S).group()
(PREP / 'candidate-intent-contract.txt').write_text(kernel, encoding='utf8', newline='\n')
if "status: 'draft'" in s:
    s = s.replace("status: 'draft'", "status: 'ready-for-dev'", 1)
    s += '\n## Auto Run Result\n\nStatus: ready-for-dev\nBlocking condition: none for planning.\n\nHALT after planning. One source AC sketch is preserved verbatim; nine tasks/eight Given/When/Then ACs, both supporting companions, seven-point immediate audit, coherence/preservation self-validation and helper reader/discovery are complete. Intent-contract is the Build Auto sprint kernel, not a separate SPEC.md. The oversized warning is retained. Root independent High validation/approval/freeze and concrete Coordinator allocation of exact shared seams/new migration/isolated fixtures/resources precede any implementation. New ledger and defaults remain proposed technical choices pending that validation.\n\nThis delegate performed zero product tests, ATDD/scaffolds, app/schema/test changes, runtime launches, CI, Git commits/push/PRs, hosted changes or deployment. Existing source/history/context/state preserved. Actual routes: Sol6.1 High planning author; synchronous context-free Sol6.1 High read-only contract explorer, route capsule in private preparation. No implementation/review round consumed. Completion hook preserves planning status and creates no completed Suggested Review Order or development-complete/release-ready claim. Baseline3a0282a70ab9cc539e2d85bd660635820e618731.\n'
    SPEC.write_text(s, encoding='utf8', newline='\n')
assert re.search(r'<intent-contract>.*?</intent-contract>', SPEC.read_text(encoding='utf8'), re.S).group() == kernel

helper = ROOT / '.agents/skills/auto-bmad/scripts/story_plan.py'
for name, arguments in (
    ('spec-reader.json', ['--spec', str(SPEC)]),
    ('spec-discovery.json', ['--find-spec', '--impl-dir', str(SPEC.parent), '--story-key', '15-3-conflict-resolver']),
):
    result = subprocess.run([sys.executable, str(helper), *arguments], capture_output=True, text=True, check=False)
    assert result.returncode == 0, (name, result.stdout, result.stderr)
    payload = json.loads(result.stdout)
    write_json(name, payload)
    if name == 'spec-reader.json':
        assert payload['status'] == 'ready-for-dev'
        assert payload['error'] is None and payload['parse_warnings'] == []
    else:
        assert str(SPEC).replace('\\', '/') in json.dumps(payload).replace('\\\\', '/'), payload

record = {'outcome':'done','halt_status':'ready-for-dev','blocking_condition':None,
          'spec_path':str(SPEC),'baseline_revision':head,'model':'gpt-6.1-sol','effort':'high',
          'phase':'planning-only','tasks':9,'acceptance_criteria':8,'source_ac_sketches_preserved_verbatim':1,
          'story_file_audit_checks_passed':7,'kernel_sha256':sha(kernel.encode('utf8')),
          'kernel_hash_definition':'UTF-8 LF exact text from <intent-contract> through </intent-contract>, tags included, no appended newline',
          'raw_sha256':sha(SPEC.read_bytes()),'raw_bytes':SPEC.stat().st_size,'approved_kernel':None,
          'approval_status':'pending-root-independent-High-validation','reader_passed':True,'discovery_passed':True,
          'preservation_passed':True,'source_files_checked':len(before['sha256']),
          'cached_epic_context':'valid-reused-byte-unchanged','runtime_tests_executed':0,'resources_started':0,
          'code_review_rounds':0,'independent_spec_review':'pending-root','release_ready':False,
          'companions':['implementation-ownership-handoff.md','current-contracts-and-design.md'],
          'proposed_migration':{'logical_basename':'conflict_resolver','timestamp_allocated':False},
          'proposed_new_table':'booking_conflict_resolutions','proposed_notification':'booking.changed (in_app only)',
          'build_prerequisites':['Root distinct independent High specification validation/approval/freeze','Coordinator exact shared delta/migration/isolated fixture-resource allocation']}
write_json('validation.json', record)
inventory = {str(p.relative_to(ROOT)).replace('\\','/'):sha(p.read_bytes()) for p in sorted(PREP.iterdir()) if p.is_file() and p.name != 'artifact-manifest.json'}
inventory[str(SPEC.relative_to(ROOT)).replace('\\','/')] = sha(SPEC.read_bytes())
write_json('artifact-manifest.json', {'baseline_revision':head,'sha256':inventory})
print(json.dumps(record, indent=2))
