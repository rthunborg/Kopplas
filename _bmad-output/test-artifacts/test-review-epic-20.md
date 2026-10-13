---
workflowType: testarch-test-review
stepsCompleted: [step-01-load-context, step-02-discover-tests, step-03-quality-evaluation, step-03f-aggregate-scores, step-04-generate-report]
lastStep: step-04-generate-report
lastSaved: 2026-10-13
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-20-1-documents-activation-and-source-authorized-aggregation.md
  - _bmad-output/implementation-artifacts/spec-20-2-search-filters-preview-and-archive-restore.md
  - _bmad-output/implementation-artifacts/spec-20-3-entity-panel-links-and-contextual-navigation.md
---

# Test Quality Review: Epic 20

**Quality Score**: 36/100 (F - Needs Improvement)
**Review Date**: 2026-10-13
**Review Scope**: suite; authoritative 24 Git-only changed test paths
**Reviewer**: TEA delegate, Sol 6.1 High for determinism/isolation; Low for maintainability/performance
**Reviewed HEAD**: `21284266ee265dd349301616a9ed83d27a2b1769`

This static audit ran no tests or resources. Coverage mapping and coverage gates are outside test-review; retain the separate trace result.

## Executive Summary

**Overall Assessment**: Needs Improvement under pinned rubric.

**Recommendation**: Request Changes

**Context Basis**: pr_diff

**Context Waivers Applied**: 0

Three HIGH findings: two new clock-sensitive proof fixtures and one inherited conditional denial branch. The26 MEDIUM / 2 LOW findings are rubric-only grouping, construction, nesting, selector and readiness-order recommendations; no production defect or consequential isolation failure was demonstrated. Score and recommendation follow the formula unchanged; they do not create a fourth broad review or mutate release clearance.

### Key Strengths

- All 24 files parse and match committed test content under Git line-ending normalization; the largest file has 857 lines.
- No CRITICAL, hard wait, focused/disabled test, mock-self-assertion, unawaited effect, or unreset shared-state defect demonstrated.
- Behavioral names, fresh scoped fixtures, finally/rollback restoration and real persistence/audit assertions retained.

### Key Weaknesses

- New three-second expiry precondition can fail solely from scheduler delay.
- New proof fixture mixes independent Node/database clocks.
- Inherited denial branch conditionally skips its claimed outcome.

## Quality Criteria Assessment

| Criterion | Status | Violations | Basis | Notes |
| --- | --- | ---: | --- | --- |
| BDD Format | PASS | 0 | Convention: bddNaming (40 of 40 sampled) | Every name describes behavior. |
| Test IDs | PASS | 0 | Convention: testIds (2 of 40 sampled) | Emerging; role/label locators satisfy. |
| Priority Markers | Diagnostic only | Not scored | Convention: priorityMarkers (36 of 40 sampled) | L2 omitted from installed workers. |
| Disabled or Focused Tests | PASS | 0 | Absolute | Non-executable RED comments excluded. |
| Hard Waits | PASS | 0 | Absolute | Polling observed DB time is not a bare sleep. |
| Determinism | FAIL | 3 | Absolute + Applicability: time-bounded fixture | H2x2,H3x1. |
| Isolation | PASS | 0 | Absolute | C5/H4 absent; parallel ability unproved, no bonus. |
| Fixture Patterns | WARN | 3 | Applicability: domain payload construction | M2; no M5. |
| Data Factories | WARN | 3 | Applicability: domain payload construction | Same M2 counted once. |
| Network-First Pattern | WARN | 5 | Applicability: navigation and data-dependent content | M1 strict order; subsequent DOM waits retained. |
| Playwright Utils Adoption | Not enabled for scoring | 0 | Run precondition | Package absent, no M9/L9. |
| Pact.js Utils Adoption | Not enabled for scoring | 0 | Run precondition | Package absent; no Pact files. |
| Explicit Assertions | PASS | 0 | Absolute + Applicability | No C3/C4/C6/M6; H3 scored separately. |
| Test Length | PASS | 0 | Absolute | Maximum857, threshold 1000. |
| Test Duration | Unmeasured | 0 | Absolute | No execution, no 90-second claim. |
| Flakiness Patterns | FAIL | 3HIGH,5MEDIUM | Absolute + Applicability | SameH2/H3/M1, no extra deduction. |
| Grouping/construction/nesting | WARN | 21 | Absolute + Applicability | M4 x16,M2 x3,M7 x2. |
| Selector Resilience | WARN | 2 | Applicability: DOM elements | L1 CSS id where main role exists. |

**Total Violations**: 0 Critical, 3 High, 26 Medium, 2 Low

**Convention Baseline**: 40 test files sampled outside the review set

Closest-first lexical sample 40 of 422 outside-review test files. Complete inputs/forms/sample paths are in review-inputs.json. Additional ratios: factories 35/40, fixtures 8/40, network interception 0/40,playwrightUtils 0/40,runner-consistent assertion style 40/40. Sampling measures conventions, never expands the scored set.

Playwright Utils configuration is true but the package is absent: run framework only if the owner chooses migration; no per-file penalty. Pact broker: unreachable (SmartBear MCP tools unavailable). No Pact review or provider-state inference applies.

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -0 × 10 = -0
High Violations:         -3 × 5 = -15
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

Final Score:             36/100
Grade:                   F
```

No partial bonus or context waiver. Sixteen duplicate M4 findings removed by file/line/row. Informational dimension scores 85/20/0/75 were not averaged.

## Critical Issues (Must Fix)

No CRITICAL registry issue detected. No demonstrated production defect.

## Recommendations (Should Fix)

### Consequential test weaknesses

### 1. conditional-assertion

**Severity**: P1(High)
**Location**: `tests/e2e/files/entity-file-preview.e2e.spec.ts:143`
**Row**: H3
**Provenance**: Inherited branch unchanged by diff
**Knowledge Base**: timing-debugging/test-quality; pinned registry.

The denial/error outcome assertions execute only when file-preview-error already exists. This test navigates to an ordinary customer panel without arranging or submitting a denied preview, so a normal success page can pass while every denial-message/role/no-path assertion is skipped. signIn/gotoCustomerPanel still assert dashboard URL and panel visibility; this is a hollow denial branch, not a test with zero executed assertions.

```typescript
if (await previewError.count()) {
```

**Recommended improvement**: Arrange a specific listed file, revoke or archive its selected context, submit its preview, and unconditionally require the generic visible alert plus no raw path or existence-disclosing text.

### 2. wall-clock-fixture

**Severity**: P1(High)
**Location**: `tests/integration/commands/documents-signed-access.int.test.ts:268`
**Row**: H2
**Provenance**: New test file
**Knowledge Base**: timing-debugging/test-quality; pinned registry.

The otherwise-valid expired/future proof fixture derives issuance and five-minute expiry from live Node Date.now(), then submits the HMAC proof to a real database clock. No fake or injected clock governs this fixture; proof validity depends on the relation between the runner clock, DB clock and elapsed scheduling time. This meets H2 even though the offsets provide a useful practical margin.

```typescript
const issued = Date.now() + (state === "expired" ? -600_000 : 120_000);
```

**Recommended improvement**: Derive mutated timestamps from the prepared DB challenge issuance rather than the independent Node wall clock; retain explicit expired/future cases and fixed-clock unit boundary assertions. Do not fake an unauthenticated success response or weaken the DB-time check.

### 3. wall-clock-fixture

**Severity**: P1(High)
**Location**: `tests/integration/commands/documents-signed-access-lock-races.int.test.ts:153`
**Row**: H2
**Provenance**: New test file
**Knowledge Base**: timing-debugging/test-quality; pinned registry.

The synthetic proof gets only three seconds remaining from live PostgreSQL clock_timestamp(), before asynchronous contact-lock acquisition, second-session startup and pg_blocking_pids polling. An otherwise correct implementation fails the beforeExpiry.fresh assertion at line174 if that setup is scheduled after the three-second boundary. Later observed-expiry polling proves a real post-lock boundary, but does not freeze or remove this live-clock freshness race.

```typescript
const [times] = await holder.query<{ issued: string; expires: string }>("select public.file_signed_access_attestation_iso(clock_timestamp()-interval '4 minutes 57 seconds') as issued,public.file_signed_access_attestation_iso(clock_timestamp()+interval '3 seconds') as expires");
```

**Recommended improvement**: Retain the actual PostgreSQL clock_timestamp expiry semantics, transaction lock barrier and no-audit assertions. Make the near-expiry setup budget explicit and validate freshness before admitting the asserted race; derive timestamps consistently from one DB clock sample. Do not freeze Node timers as DB control or add an unapproved production clock seam. Fixed-clock pure proof boundaries remain separate evidence.

The H3 finding concerns only denial assertions; surrounding panel assertions execute. H2 findings concern evidence reliability, not an authorization bypass. Node fake timers cannot govern real PostgreSQL expiry; retain actual database clock, lock/expiry observation and no-audit assertions when stabilizing setup.

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

- Root/author should disposition the two new H2 evidence-reliability weaknesses through a narrow test change or recorded gate decision; this audit changes no tests.
- Keep the inherited H3 denial weakness distinct from introduced changes.
- Optional rubric maintenance does not establish a production defect or reopen a fourth broad review.
- Continue root-owned exact-head and NFR evidence work; trace owns requirements coverage.

## Decision

**Recommendation**: Request Changes

This recommendation is computed unchanged from three HIGH findings and a score below 70, with zero waivers. It is a test-quality recommendation, not a production code-review verdict, story mutation, merge approval, or release clearance. The consequential scope consists of two new clock-sensitive test fixtures and one inherited conditional denial branch; the other 28 findings are rubric-only recommendations.

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

The complete deduplicated manifest of 31 findings is in test-reviews/epic-20/assessment-summary.json. Dimension JSON retains detailed snippets and provenance.

### Quality Trends

No comparable previous score was supplied; no trend is claimed.

### Workflow Limitations

Registry row L2 appears in the report contract but is omitted from all four installed worker row lists. The unscored diagnostic identifies file-index-scope.e2e.spec.ts and manifest-shape.test.ts as lacking priority-marked declarations. No extra worker/pass, false PASS claim, or deduction was added. Duration remains unknown; no tests were executed.

### Validation and Ownership

All four workers completed and their JSON parsed. Attribution, severities, deduplication, arithmetic, the exact 24-file manifest, and Git-normalized test content were validated. Only new Epic 20 test-review artifacts were written. No code, specs, state, sprint, plan, Git, or resources were changed. Temporary dimension results were copied into test-artifacts; originals were retained.
