---
workflowType: testarch-test-review
stepsCompleted: [step-01-load-context, step-02-discover-tests, step-03-quality-evaluation, step-03f-aggregate-scores, step-04-generate-report]
lastStep: narrow-findings-closure
lastSaved: 2026-10-13
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-20-1-documents-activation-and-source-authorized-aggregation.md
  - _bmad-output/implementation-artifacts/spec-20-2-search-filters-preview-and-archive-restore.md
  - _bmad-output/implementation-artifacts/spec-20-3-entity-panel-links-and-contextual-navigation.md
---

# Test Quality Review: Epic 20

**Quality Score**: 51/100 (F - Needs Improvement)
**Review Date**: 2026-10-13
**Review Scope**: suite; authoritative 24 Git-only changed test paths
**Reviewer**: TEA delegate, Sol 6.1 High for determinism/isolation; Low for maintainability/performance
**Initial Reviewed HEAD**: `21284266ee265dd349301616a9ed83d27a2b1769`
**Narrow Closure HEAD**: `6f891f7db7a1be83bd3d90b67ce2fdb47e538e3c`
**Historical Score**: 36/100 (F), Request Changes at the initial audit.

This static audit ran no tests or resources. Coverage mapping and coverage gates are outside test-review; retain the separate trace result.

## Executive Summary

**Overall Assessment**: Needs Improvement under pinned rubric.

**Recommendation**: Request Changes

**Context Basis**: pr_diff

**Context Waivers Applied**: 0

All three consequential findings are resolved by commit `4f891be8`. The closure checked only those fixes and their recorded evidence, with no new broad review or execution. The retained 26 MEDIUM and 2 LOW findings are rubric-only grouping, construction, nesting, selector and readiness-order recommendations; none demonstrates a production defect. Current arithmetic is 100 - 52 - 2 + 5 = 51. The computed recommendation remains Request Changes solely because the score is below 70; the practical disposition is zero unresolved consequential findings. The original 36/F audit remains historical evidence.

### Key Strengths

- The initial audit parsed all 24 files and matched their committed content under Git line-ending normalization. Closure verifies the three repaired test blobs match the retained tested blobs and remain unchanged at the closure HEAD.
- No CRITICAL, hard wait, focused/disabled test, mock-self-assertion, unawaited effect, or unreset shared-state defect demonstrated.
- Behavioral names, fresh scoped fixtures, finally/rollback restoration and real persistence/audit assertions retained.

### Remaining Weaknesses

Only the 28 rubric-only recommendations remain. They were retained without optional cleanup or another review pass; their locations describe the initial audit revision.

## Quality Criteria Assessment

| Criterion | Status | Violations | Basis | Notes |
| --- | --- | ---: | --- | --- |
| BDD Format | PASS | 0 | Convention: bddNaming (40 of 40 sampled) | Every name describes behavior. |
| Test IDs | PASS | 0 | Convention: testIds (2 of 40 sampled) | Emerging; role/label locators satisfy. |
| Priority Markers | Diagnostic only | Not scored | Convention: priorityMarkers (36 of 40 sampled) | L2 omitted from installed workers. |
| Disabled or Focused Tests | PASS | 0 | Absolute | Non-executable RED comments excluded. |
| Hard Waits | PASS | 0 | Absolute | Polling observed DB time is not a bare sleep. |
| Determinism | PASS after narrow closure | 0 | Absolute + Applicability: time-bounded fixture | Three identified findings resolved; no new broad evaluation. |
| Isolation | PASS | 0 | Absolute | C5/H4 absent; parallel ability unproved, no bonus. |
| Fixture Patterns | WARN | 3 | Applicability: domain payload construction | M2; no M5. |
| Data Factories | WARN | 3 | Applicability: domain payload construction | Same M2 counted once. |
| Network-First Pattern | WARN | 5 | Applicability: navigation and data-dependent content | M1 strict order; subsequent DOM waits retained. |
| Playwright Utils Adoption | Not enabled for scoring | 0 | Run precondition | Package absent, no M9/L9. |
| Pact.js Utils Adoption | Not enabled for scoring | 0 | Run precondition | Package absent; no Pact files. |
| Explicit Assertions | PASS | 0 | Absolute + Applicability | No C3/C4/C6/M6; H3 scored separately. |
| Test Length | PASS | 0 | Absolute | Maximum857, threshold 1000. |
| Test Duration | Unmeasured | 0 | Absolute | No execution, no 90-second claim. |
| Flakiness Patterns | WARN | 5 MEDIUM | Applicability: navigation readiness | Retained M1 findings only; no additional deduction. |
| Grouping/construction/nesting | WARN | 21 | Absolute + Applicability | M4 x16,M2 x3,M7 x2. |
| Selector Resilience | WARN | 2 | Applicability: DOM elements | L1 CSS id where main role exists. |

**Total Violations**: 0 Critical, 0 High, 26 Medium, 2 Low

**Convention Baseline**: 40 test files sampled outside the review set

Closest-first lexical sample 40 of 422 outside-review test files. Complete inputs/forms/sample paths are in review-inputs.json. Additional ratios: factories 35/40, fixtures 8/40, network interception 0/40,playwrightUtils 0/40,runner-consistent assertion style 40/40. Sampling measures conventions, never expands the scored set.

Playwright Utils configuration is true but the package is absent: run framework only if the owner chooses migration; no per-file penalty. Pact broker: unreachable (SmartBear MCP tools unavailable). No Pact review or provider-state inference applies.

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -0 × 10 = -0
High Violations:         -0 × 5 = -0
Medium Violations:       -26 × 2 = -52
Low Violations:          -2 × 1 = -2

Bonus Points:
  Excellent BDD:         +5
  Comprehensive Fixtures: +0
  Data Factories:        +0
  Network-First:         +0
  Perfect Isolation:     +0
  All Test IDs:          +0
                         --------
Total Bonus:             +5

Final Score:             51/100
Grade:                   F
```

No partial bonus or context waiver. Sixteen duplicate M4 findings removed by file/line/row. Current informational dimension scores are 100/20/0/75; the initial determinism score was 85. Dimension scores were not averaged.

## Critical Issues (Must Fix)

No CRITICAL registry issue detected. No demonstrated production defect.

## Recommendations (Should Fix)

### Resolved consequential findings

| Finding | Initial location | Actual remedy | Verification |
| --- | --- | --- | --- |
| DET-H3-01 | entity-file-preview.e2e.spec.ts:143 | Seed real linked file/Storage bytes; archive after listing; invoke the inherited generic File preview caller; require visible generic alert and no URL/path/bucket disclosure unconditionally. | All 4 browser journeys pass with zero skips/flaky. Suppressed alert produces the expected failure at toBeVisible. |
| DET-H2-01 | documents-signed-access.int.test.ts:268 | Derive proof timestamps from DB challenge; deliberately skew Node clock by +/-24 hours; restore the spy in finally. | DB-relative expired/future vectors reject with FSA10, no data or audit; included in 114 passing integration cases. |
| DET-H2-02 | documents-signed-access-lock-races.int.test.ts:153 | Acquire/authenticate both sessions and hold authority before starting 15-second lifetime; assert dispatch under 5 seconds and more than 8 seconds remaining after observed blocking; retain actual DB expiry. Race PID readiness against request failure, with rollback/settlement. | Actual expiry then release produces FSA10/no audit. Forced setup failure promptly exits and completes cleanup; filtered cases receive no coverage credit. |

Closure evidence: [bounded repair report](C:/Users/Rasmus/.codex/worktrees/dbe6/ElproSaas/_bmad-output/test-artifacts/epic-20-test-reliability-fixes.md). Independent Sol6.1 High narrow review returned CLEAN; the author trail validates 37 references with zero errors. The three tested working blobs equal the fix commit and closure HEAD blobs. The repaired tests retain real PostgreSQL clock semantics; Node fake timers do not pretend to control the database. The clock-skew cases prove robust DB-relative fixtures, without claiming skew alone kills a hypothetical Node-clock validator.

Recorded normal execution: 114 integration and 4 browser cases, all passing with zero skips; browser zero flaky. Deliberate alert/setup fault probes are expected failures, not passing coverage. These are retained working-blob results; this closure performed no execution and does not claim final committed-head release replay.

The inherited denial caller remains generic File signing under Option A. No production authority, schema, helper, story intent, or optional rubric recommendation was changed by this closure.

### Rubric-only recommendations

All 28 MEDIUM/LOW findings below lack a demonstrated production defect or measured flaky outcome. Exact descriptions and snippets are retained in dimension JSON and assessment-summary.json.

| Row | Severity | Location | Improvement |
| --- | --- | --- | --- |
| M4 | MEDIUM | `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/integration/commands/documents-lifecycle.int.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/integration/rls/documents-context.rls.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/integration/rls/documents-filter-archive.rls.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/components/documents/entity-documents-link.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/features/documents/context-navigation.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/features/documents/date-bounds.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/features/documents/filters.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/features/documents/preview-state.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/scope/manifest-shape.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/server/commands/documents-lifecycle.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/server/commands/documents-signed-access.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/server/read-models/document-context.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/server/read-models/document-sources.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/server/read-models/documents.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M4 | MEDIUM | `tests/unit/server/storage/document-signed-access-attestation.test.ts:1` | Wrap the existing cases in a subject-named describe/context group during a separately authorized test-maintenance change; preserve behavior and the capped review state. |
| M2 | MEDIUM | `tests/e2e/files/documents-context-navigation.e2e.spec.ts:133` | Use a local Source factory with owner-specific overrides; preserve exact route expectations. |
| M2 | MEDIUM | `tests/unit/features/documents/context-navigation.test.ts:46` | Use a base Ref factory with explicit invalid overrides, retaining visible case meaning. |
| M2 | MEDIUM | `tests/unit/features/documents/filters.test.ts:43` | Build filter rows from a small local factory and keep overrides explicit. |
| M7 | MEDIUM | `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:701` | Extract the browser media cleanup instrumentation into a named helper while retaining its observations. |
| M7 | MEDIUM | `tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:114` | Extract the writer transaction helper to flatten nested session orchestration without changing transaction assertions. |
| L1 | LOW | `tests/e2e/files/documents-context-navigation.e2e.spec.ts:266` | Use page.getByRole("main") for main-region assertions and evaluate calls. |
| L1 | LOW | `tests/e2e/files/documents.e2e.spec.ts:166` | Use page.getByRole("main") for this assertion. |
| M1 | MEDIUM | `tests/e2e/files/documents-context-navigation.e2e.spec.ts:283` | Register a response/readiness promise for the actual destination transport before navigation, then await it before reading destination data. Preserve real SSR/Next transport and existing DOM assertions; do not invent an API endpoint. |
| M1 | MEDIUM | `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:66` | Register a response/readiness promise for the actual destination transport before navigation, then await it before reading destination data. Preserve real SSR/Next transport and existing DOM assertions; do not invent an API endpoint. |
| M1 | MEDIUM | `tests/e2e/files/documents.e2e.spec.ts:73` | Register a response/readiness promise for the actual destination transport before navigation, then await it before reading destination data. Preserve real SSR/Next transport and existing DOM assertions; do not invent an API endpoint. |
| M1 | MEDIUM | `tests/e2e/files/entity-file-preview.e2e.spec.ts:82` | Register a response/readiness promise for the actual destination transport before navigation, then await it before reading destination data. Preserve real SSR/Next transport and existing DOM assertions; do not invent an API endpoint. |
| M1 | MEDIUM | `tests/e2e/files/file-index-scope.e2e.spec.ts:125` | Register a response/readiness promise for the actual destination transport before navigation, then await it before reading destination data. Preserve real SSR/Next transport and existing DOM assertions; do not invent an API endpoint. |

Example maintenance patterns:

```typescript
describe("Documents lifecycle", () => { /* retain existing cases */ });
const ref = (overrides = {}) => ({ module: "crm", ownerType: "customer", ownerId: OWNER, ...overrides });
await expect(page.getByRole("main")).not.toContainText(forbiddenName);
```

M1 readiness must bind real SSR/Next transport before navigation; no invented API endpoint or replacement of real persistence with a stub. Existing web-first DOM/hydration waits and action-time intercepts remain mitigating evidence.

## Best Practices Found

The lock-race suites observe actual PostgreSQL blocking and expiry rather than assuming a sleep duration. Fresh graphs, correlation IDs, and finally/rollback cleanup protect isolation. Persistence, audit, and state assertions form one transactional subject; many assertions alone did not trigger M3.

## Test File Analysis

24 TypeScript files: 5 Playwright browser tests, 7 Vitest integration/RLS tests, and 12 Node unit tests. All parse; the largest file has 857 lines. Static declaration metadata is recorded in review-inputs.json; generated parameter matrices are not execution counts. Duration and assertions per executed case were not measured. Package and runner configuration were read as framework metadata and were not scored.

## Context and Integration

### What the Context Said

The three supplied specs describe selected-link aggregation (20.1), all-link lifecycle/filter/preview behavior (20.2), and fresh context/navigation/upload continuity (20.3). Each was read as context and never scored or used to waive a finding. Historical evidence is referenced without claiming new execution.

### Related Artifacts

The exact context paths are retained in the report frontmatter and review-inputs.json. Retain the separate trace PASS after 80fdaef7 and NFR CONCERNS. Outstanding release evidence remains effective PostgREST cap provenance, representative pilot measurements, and final committed-head checks. Preserve story 20.2 review_unverified=true and add zero broad review rounds. Exact Lovable comparison is owner-waived, with zero actual observations.

## Knowledge Base References

Pinned skill and registry: C:/DEV/Kopplas/.agents/skills/bmad-testarch-test-review. Worker results retain consulted fragment paths. The union includes test-quality, data-factories, test-levels-framework, selective-testing, test-healing-patterns, selector-resilience, timing-debugging, fixture-architecture, network-first, and the applicable Playwright Utils profile references. The package gate disables utility deductions.

## Next Steps

- No consequential test finding remains open from this audit.
- Retain optional rubric recommendations without reopening a fourth broad review.
- Continue root-owned final committed-head verification and separate trace/NFR release evidence. This score update grants no release clearance.

## Decision

**Recommendation**: Request Changes

This remains the pinned formula's result because 51 is below 70. All three HIGH findings are actually resolved; there are zero remaining Critical/High findings and 28 rubric-only Medium/Low recommendations. No waiver altered the score. The practical disposition is no unresolved consequential test defect; optional rubric volume must not be represented as a new production defect or a fourth broad-review requirement. Historical score 36/F and its findings are preserved in assessment-summary-initial-21284266.json.

## Reviewed Files

- tests/e2e/files/documents-context-navigation.e2e.spec.ts
- tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts
- tests/e2e/files/documents.e2e.spec.ts
- tests/e2e/files/entity-file-preview.e2e.spec.ts
- tests/e2e/files/file-index-scope.e2e.spec.ts
- tests/integration/commands/documents-lifecycle-lock-races.int.test.ts
- tests/integration/commands/documents-lifecycle.int.test.ts
- tests/integration/commands/documents-signed-access-lock-races.int.test.ts
- tests/integration/commands/documents-signed-access.int.test.ts
- tests/integration/rls/documents-context.rls.test.ts
- tests/integration/rls/documents-filter-archive.rls.test.ts
- tests/integration/rls/documents.rls.test.ts
- tests/unit/components/documents/entity-documents-link.test.ts
- tests/unit/features/documents/context-navigation.test.ts
- tests/unit/features/documents/date-bounds.test.ts
- tests/unit/features/documents/filters.test.ts
- tests/unit/features/documents/preview-state.test.ts
- tests/unit/scope/manifest-shape.test.ts
- tests/unit/server/commands/documents-lifecycle.test.ts
- tests/unit/server/commands/documents-signed-access.test.ts
- tests/unit/server/read-models/document-context.test.ts
- tests/unit/server/read-models/document-sources.test.ts
- tests/unit/server/read-models/documents.test.ts
- tests/unit/server/storage/document-signed-access-attestation.test.ts

## Excluded From Review Set

None. The three context specs and 40 baseline samples are read-only context and measurement, never scored.

## Appendix

### Violation Summary by Location

The current manifest contains 28 retained rubric-only findings and 3 resolved consequential findings. The original 31-finding assessment is preserved in assessment-summary-initial-21284266.json; dimension JSON retains historical provenance.

### Quality Trends

Initial audit: 36/F. Narrow closure: 51/F after resolving all 3 HIGH findings; no optional re-review or cleanup. Recommendation remains Request Changes from rubric volume.

### Workflow Limitations

Registry row L2 appears in the report contract but is omitted from all four installed worker row lists. The unscored diagnostic identifies file-index-scope.e2e.spec.ts and manifest-shape.test.ts as lacking priority-marked declarations. No extra worker/pass, false PASS claim, or deduction was added. Duration remains unknown; no tests were executed.

### Validation and Ownership

All four workers completed and their JSON parsed. Attribution, severities, deduplication, arithmetic, the exact 24-file manifest, and Git-normalized test content were validated. Only new Epic 20 test-review artifacts were written. No code, specs, state, sprint, plan, Git, or resources were changed. Temporary dimension results were copied into test-artifacts; originals were retained.

### Narrow closure validation

Commit 4f891be8 contains the three fixes. Their committed Git blobs equal the tested working blobs recorded in epic-20-test-reliability-fixes.md and remain identical at 6f891f7d. No new workers, tests, resources, code/spec/state edits, or broad review rounds were performed. Test quality artifacts alone were updated. Release evidence remains owned by the root and separate trace/NFR delegates.
