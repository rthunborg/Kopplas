# Epic20 trace artifacts

The authoritative human report is ../epic-20-traceability-report.md. Current cap/pilot reconciliation gate is PASS:80/81FULL, formal25/25 and only optional20-P3-01uncovered; iteration0FAIL remains in gate_progression.

- discovered-tests.json stores607unique mapped test records once. Resolve evidence_ref through evidence_index; source SHA inherits tested_product_sha. Original676discovered count is retained without70unmapped records; iteration1 adds exactly one case with explicit dirty execution provenance.
- mapping-input.json has complete25AC/56design family definitions and test-ID/level references.
- coverage-matrix.json contains the complete81-item Phase1 matrix, statistics, gaps and inventory references. Join each tests[].id to discovered-tests.json for full identity fields. This is normalized storage, not reduced coverage.
- evidence-integrity.json retains17native receipt paths, actual argv/environment/counts and independently checked raw-log hashes.
- e2e-trace-summary.json and gate-decision.json preserve their emitted schemas, values and verdict unchanged.

Reproduce with the bounded Python scripts in this order:

1. collect-evidence.py
2. map-coverage.py
3. complete-phase1.py
4. emit-gate.py
5. validate-output.py
6. update-iteration1.py (when reproducing the current iteration1 from its recorded evidence)
7. update-cap-pilot.py (for the current cap/pilot evidence reconciliation)
8. compact-artifacts.py

Raw inputs remain at the referenced temporary evidence paths; no product tests or managed resource starts occur. Reproduction resolves current git metadata while retaining the exact tested product SHA. Keep the approved coverage judgments and gaps unless a separately authorized re-trace has new evidence. On already normalized outputs, run compact-artifacts.py for idempotent structural/reference validation. The old validate-output.py expects expanded generator data and runs before packaging.

Cap/pilot joins are supplemental evidence references on the existing81requirements; the607canonical test records and prior ID mappings are unchanged. Reproduce each historical stage with its documented source revision: the iteration1 hash check deliberately fails if later reliability test fixes replace those bytes. Current update-cap-pilot.py reads committed measurement evidence without running its harness.
