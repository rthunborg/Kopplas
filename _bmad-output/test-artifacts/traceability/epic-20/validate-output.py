import json,pathlib,re,subprocess
R=pathlib.Path('C:/Users/Rasmus/.codex/worktrees/dbe6/ElproSaas');O=R/'_bmad-output/test-artifacts/traceability/epic-20'
g=json.loads((O/'gate-decision.json').read_text(encoding='utf-8'));m=json.loads((O/'coverage-matrix.json').read_text(encoding='utf-8'));s=json.loads((O/'e2e-trace-summary.json').read_text(encoding='utf-8'))
assert len(m['requirements'])==81 and len({x['id']for x in m['requirements']})==81
assert g['gate_status']==s['gate_status']=='FAIL'
assert m['coverage_statistics']['priority_breakdown']['P0']['covered']==31
assert g['critical_gap_ids']==['20-P0-02']
assert s['tests']['cases']==len(m['test_inventory']['tests'])
assert len({t['id']for t in m['test_inventory']['tests']})==s['tests']['cases']
assert all((R/t['file']).is_file() for t in m['test_inventory']['tests'])
assert all(not(t['skipped']or t['pending']or t['fixme']) for t in m['test_inventory']['tests'])
report=R/'_bmad-output/test-artifacts/traceability/epic-20-traceability-report.md'
txt=report.read_text(encoding='utf-8'); assert "lastStep: 'step-05-gate-decision'" in txt and txt.count('## Step 2 —')==1
# Add completion hook and checklist record without rewriting decision/matrix.
txt+='\n### Workflow validation\n\nAll five Create steps completed and outputs validated against the installed trace checklist. Phase1 output was saved before Phase2 read the exact temporary matrix; no gate-time matrix regeneration. Oracle81 items and unique identities, all test file paths, stats, by-level/live shape and deterministicFAIL were checked. Unknown NFR/code-coverage/burn-in and optional visual evidence remain explicit. No enabled story/status/stakeholder update is owned or performed.\n\nCompletion resolver ran successfully using a process-only temporary uv cache after the activation cache failure; `workflow.on_complete` resolved empty (native0), so no completion hook action is required.\n'
report.write_text(txt,encoding='utf-8')
check='''# Epic20 trace — workflow validation record

- [x] Create mode selected autonomously; approved specs and test design resolve formal oracle.
- [x] AGENTS/model policy/config/base customization loaded; missing team/personal overrides confirmed.
- [x] Required knowledge loaded; template sections adapted to epic-scoped output to preserve other reports.
- [x] Discovery by test IDs, AC tags, file paths, expanded runtime titles and static declaration prefixes.
- [x] All17 native receipts and raw-log SHA256 values independently verified; actual product/source identities retained.
- [x] Zero skipped/pending/fixme acceptance credit; overlapping execution totals not summed.
- [x] All25ACs and56approved design families mapped with explicit FULL/PARTIAL/NONE rationale.
- [x] 81unique oracle IDs, stable mapped case IDs, source files/available lines and evidence paths retained.
- [x] Source-to-runtime provenance shows later commits only metadata; no execution relabeled to metadata head.
- [x] Positive/negative enforced API/RLS/race/UI paths checked; missing same-token membership-removal variant explicit.
- [x] Formal24/25, design52/56 and full76/81 statistics retain separate granularity and overlap.
- [x] Critical/high/medium/low and partial gaps prioritized with specific test IDs, Given/When/Then and owner role/before-gate due obligation.
- [x] Phase1 matrix written to resolved temporary path and durable artifact before Phase2.
- [x] Phase2 consumed exact saved matrix; gate eligible, deterministicP0FAIL; no waiver fabricated.
- [x] Summaryschema0.2.0 and gateschema0.1.0 valid, live/by-level buckets, criteria, blockers and links populated.
- [x] 20.2review_unverified/formula history, three broad-round cap and narrow High acceptance preserved.
- [x] OptionA/ContractD/PhaseC, TTL residual, zero Lovable/hosted proof and supported viewport limits retained.
- [x] Completion resolver returned empty hook/native0; all nested delegates completed synchronously.
- [x] No code/spec/state/sprint/plan edits, new test, launch, commit, PR or stakeholder message.
- [x] Checklist adapted: ordinary per-test quality review/NFR/code coverage/burn-in NOT ASSESSED here; separate test-review/NFR owner workflow remains.

Workflow success means an accurate completed FAIL gate. It does not mean product acceptance, release approval or absence of coverage gaps. No human sign-off is recorded.
'''
(O/'validation-checklist.md').write_text(check,encoding='utf-8')
print(json.dumps({'validation':'passed','gate':'FAIL','mapped_cases':s['tests']['cases'],'artifact_files':[p.name for p in O.iterdir()if p.is_file()]}))
