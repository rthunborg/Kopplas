---
workflowType: testarch-test-review
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03a-subagent-determinism', 'step-03b-subagent-isolation', 'step-03c-subagent-maintainability', 'step-03e-subagent-performance', 'step-03f-aggregate-scores', 'step-04-generate-report']
headless: true
executionMode: sequential
lastSaved: '2026-10-29'
---

# 35.3 bounded test-quality review

## Executive Summary

**Recommendation: Request Changes. Score: 0/100 (F).** Context Basis: pr_diff. Context Waivers Applied: 0.

This is a structural audit of two existing tests, not a product code-review round, behavioral coverage decision or production qualification. Actual native CI40919281738 at accepted2b594338 remains root-supplied passing evidence, not a test run performed here. The literal registry is strict: five HIGH findings and the established per-test naming/priority convention deductions drive the recommendation. These are not relabeled PASS; no new product work is authorized by this report.

## Reviewed Files

- tests/e2e/crm/customers.e2e.spec.ts — 1009 lines; 31 AST test declarations; SHA256 8e34b146921c9ab3ac765c1b216a50b0fe8b7552079be7b71d1ea4c0d60a7c75
- tests/unit/components/crm/customer-presentation.test.ts — 287 lines; 24 AST test declarations; SHA256 c431d2501812ad992fcebaff313cdc521734311da674404096f2dc54cfbb7c62

Declarations are not collected runtime counts: parameterized declarations may register multiple cases.

## Excluded From Review Set

None. The supplied review set has exactly two files. Security/integrity integration tests are outside the supplied ordinary structural review scope and remain High-owned.

## Quality Score Breakdown

```text
Starting Score:          100
Critical Violations:     -0 × 10 = -0
High Violations:         -5 × 5 = -25
Medium Violations:       -3 × 2 = -6
Low Violations:          -74 × 1 = -74
                         --------
Total Bonus:             +0

Final Score:             0/100
```

Scores clamp to0; raw deductions=105. All six bonuses are0 because each requires its property across every reviewed file, which is not established here.

## Critical Issues (Must Fix)

None: no CRITICAL row fired. No committed skip/only, no-assertion body, tautology or unreachable assertion was established.

## Recommendations

- H3 HIGH — tests/e2e/crm/customers.e2e.spec.ts:65 — Outline assertion executes only when helper outline flag is true.
- H3 HIGH — tests/e2e/crm/customers.e2e.spec.ts:66 — Ratio assertion is conditional and expected threshold is selected by outline flag.
- H3 HIGH — tests/e2e/crm/customers.e2e.spec.ts:401 — Audit-count expected value is selected by snapshotMarker===marker ternary.
- H3 HIGH — tests/e2e/crm/customers.e2e.spec.ts:658 — Expected persisted row count is selected by transport-mode ternary.
- H5 HIGH — tests/e2e/crm/customers.e2e.spec.ts:file — File has 1009 lines, exceeding the registry absolute 1000-line threshold.
- M2 MEDIUM — tests/unit/components/crm/customer-presentation.test.ts:58 — CustomerListRow domain payload shape is constructed inline at least four times (58,85,172,194); item factory only covers CustomerListItem.
- M4 MEDIUM — tests/unit/components/crm/customer-presentation.test.ts:31 — 24 top-level test declarations have no describe/context grouping.
- M1 MEDIUM — tests/e2e/crm/customers.e2e.spec.ts:105 — Login and ordinary route navigations rely on post-navigation state checks; no per-navigation intercept or pre-registered data-readiness signal (later fault gates are registered first).
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:130 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:139 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:162 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:171 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:214 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:237 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:266 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:287 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:304 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:323 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:416 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:453 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:475 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:493 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:523 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:564 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:594 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:606 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:624 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:643 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:670 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:771 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:805 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:842 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:884 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:897 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:915 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:957 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/e2e/crm/customers.e2e.spec.ts:980 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:28 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:28 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:37 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:37 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:46 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:46 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:51 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:51 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:72 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:72 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:105 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:105 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:111 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:111 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:127 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:127 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:137 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:137 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:153 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:153 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:176 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:176 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:194 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:194 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:199 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:199 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:205 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:205 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:210 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:210 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:215 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:215 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:221 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:221 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:225 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:225 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:235 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:235 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:244 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:244 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:249 — Missing priority marker under established convention: 33 of 40 sampled.
- L5 LOW — tests/unit/components/crm/customer-presentation.test.ts:249 — Implementation-shaped test title names helper/constant; behavioral naming established in 40 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:260 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:270 — Missing priority marker under established convention: 33 of 40 sampled.
- L2 LOW — tests/unit/components/crm/customer-presentation.test.ts:282 — Missing priority marker under established convention: 33 of 40 sampled.

## Quality Criteria Assessment

| Criterion | Status | Basis | Notes |
|---|---|---|---|
| Disabled/focused tests | PASS | Absolute C1/C2 | None found |
| Hard waits | PASS | Absolute H1 | No timer-based synchronization; promises/real transport used |
| Wall-clock fixture | PASS (n/a) | Applicability H2 | Date.now at220 is opaque unique customer name, not expiry/TTL boundary |
| Conditional assertions | FAIL | Absolute H3 | Four pinned sites; parameterized expectations remain literal rubric deductions |
| File length | FAIL | Absolute H5 | E2E1009 lines; unit287 |
| Isolation | PASS | Absolute H4/C5 | No demonstrable shared-fixture order dependency identified; no parallel-safety certification |
| Network first | WARN | Applicability M1 | Ordinary read navigations use post-navigation checks |
| Grouping/payload reuse | WARN | Absolute M4; Applicability M2 | Unit suite has24 top-level cases and repeated CustomerListRow literals |
| Priority markers | WARN | Convention: priorityMarkers (33 of 40 sampled) | Per-test missing marker deductions retained |
| Behavioral naming | WARN | Convention: bddNaming (40 of 40 sampled) | Method/constant-shaped unit names |
| Test IDs | PASS | Convention: testIds (31 of 40 sampled) | Role/label locators satisfy row; generated error-id selectors intentionally test association |
| Assertion style | PASS | Convention: assertionStyle (40 of 40 sampled) | Each file uses its runner dialect consistently |
| Runtime duration | Unmeasured | Static audit | No performance runtime measured or inferred |

## Scope and framework qualifications

Playwright-utils flag=true, package absent: M9/L9 do not exist for this run; no per-file deduction. Framework adoption is a future scoped decision, not a dependency change in this task. Pact/contract/Maestro rows do not apply.

Conditional helper assertions and method-shaped titles are rubric findings even though the tests have passed native CI. Native green is not used as a waiver. Awaited route gates, scoped matching, finally cleanup and physical read observations are strengths; no unconditional sleeps were found.

## Context and evidence limits

The approved adapter and supplied test design were read as context, not scored. Source hashes and measured baseline are in companions. The outside-review corpus has556 files;40 closest-first files were read for convention signals; this is not a corpus quality sweep. Browser exploration, tracing, test execution, inline comments and new tests were excluded by the parent's bounded authorization. Production qualification remains pending and High-owned. This report makes no development_complete, Phase8done or release-ready claim.

## Decision

**Recommendation: Request Changes.** Retain the actual rubric recommendation as an advisory process result; parent independently assesses whether any item exposes a consequential development blocker. Do not start a fourth broad product review, rewrite tests, or silently turn this audit execution into a PASS verdict.
