# Epic20 trace artifacts

The authoritative human report is ../epic-20-traceability-report.md. Gate remains FAIL.

- discovered-tests.json stores606unique mapped test records once. Resolve evidence_ref through evidence_index; source SHA inherits tested_product_sha. Original676discovered count is retained without70unmapped records.
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
6. compact-artifacts.py

Raw inputs remain at the referenced temporary evidence paths; no product tests or managed resource starts occur. Reproduction resolves current git metadata while retaining the exact tested product SHA. Keep the approved coverage judgments and gaps unless a separately authorized re-trace has new evidence. On already normalized outputs, run compact-artifacts.py for idempotent structural/reference validation. The old validate-output.py expects expanded generator data and runs before packaging.
