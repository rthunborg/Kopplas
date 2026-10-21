---
workflowType: 'testarch-test-review'
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-quality-evaluation', 'step-03f-aggregate-scores', 'step-04-generate-report']
lastStep: 'step-04-generate-report'
lastSaved: '2026-10-20'
workflowStatus: 'complete'
headless: true
context_basis: 'pr_diff'
context_waivers_applied: 0
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md
  - _bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md
  - _bmad-output/implementation-artifacts/spec-16-3-arbetsorder-2.md
  - _bmad-output/implementation-artifacts/spec-16-4-projekt-upgrade-and-job-card-semantics-2.md
  - _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md
  - docs/process/agent-model-routing.md
  - docs/process/development-completion-policy.md
---

# Test Quality Review: Epic16 authoritative 110-file set

**Quality Score**: 0/100 (F - Critical Issues, rubric grade label)
**Review Date**: 2026-10-20
**Review Scope**: authoritative review_files (110 paths), headless Create
**Reviewer**: TEA delegate, gpt-6.1-sol High

This audits existing tests and test-support artifacts; it generates or executes no tests. Coverage mapping/gates remain the trace workflow responsibility. The computed recommendation below is advisory test-quality output, not a production-defect count or a new development completion gate.

## Executive Summary

**Overall Assessment**: Critical Issues (score-band label; zero CRITICAL findings)
**Recommendation**: Request Changes
**Context Basis**: pr_diff
**Context Waivers Applied**: 0

### Key Strengths

- Real normal-JWT/direct SQL boundaries, atomic snapshots, replay/current-authority and essential persistence assertions are retained.
- No C1/C2/C3/C4/C5/C6, H1/H2/H4 or M6 finding was identified by the assigned workers. This is bounded static review, not proof that all possible defects are absent.
- Complete inventory accounting: 109 reviewed (96 test files and 13 support/config artifacts), one JSON fixture explicitly excluded; five byte-identical mirror pairs bound.

### Key Weaknesses

- Three H3 HIGH conditional-oracle weaknesses; focused crosscheck found existing independent unconditional coverage for their core invariants, not a product guard bypass or established missing development invariant.
- One H5 HIGH file-size metric on a 2,100-line test-support inventory; it demonstrates size, not failed behavior.
- 70 MEDIUM observations: 51 M4 grouping, 12 M1 pre-navigation readiness, 3 M2 payload reuse and 4 M7 nesting; two LOW L1 selector observations.

The exact global ledger subtracts162points from100 and clamps to0; bonuses0. The resulting Request Changes is published unchanged. Neither context nor current CI waived a deduction. No wholesale restyling, new test-repair cycle, source fix or rerun is requested solely to improve this advisory score. Root retains the findings for report/retro/delivery. No identified functional failure is hidden as polish.

## Quality Criteria Assessment

| Criterion | Status | Violations | Basis | Notes |
| --- | --- | ---: | --- | --- |
| BDD Format (Given-When-Then) | PASS | 0 | Convention: bddNaming (40 of 40 sampled) | Runner-specific behavior naming; baseline corpus423/sample40. |
| Test IDs | PASS | 0 | Convention: testIds (5 of 40 sampled) | Emerging; role/label locators valid; no duplicate L1/L3. |
| Priority Markers (P0/P1/P2/P3) | NOT_EVALUATED | 0 scored | Convention: priorityMarkers (33 of 40 sampled) | Published L2 has no owner in supplied four worker row tables; baseline only, no invented PASS/deduction. |
| Disabled or Focused Tests | PASS | 0 | Absolute | Still-true documented runtime skip conditions distinguished from specimen strings; skips never execution coverage. |
| Hard Waits (sleep, waitForTimeout) | PASS | 0 | Absolute | No H1 found; condition polling/lock observation not bare step-order timers. |
| Determinism (no conditionals) | FAIL | 3 | Absolute + Applicability | Three H3 weaknesses; exact crosscheck below. |
| Isolation (cleanup, no shared state) | PASS | 0 | Absolute | No consequential isolation defect found; fixture/reset/cleanup traced. |
| Fixture Patterns | WARN | 3 | Applicability | M2 reuse opportunities; no low-level user-event substitution predicate found. |
| Data Factories | WARN | 3 | Applicability | Three repeated payload shapes; preserve boundary values. |
| Network-First Pattern | WARN | 12 | Applicability: navigation then data-dependent content | 12static pattern findings; no proven retry cause. |
| Playwright Utils Adoption | PASS (n/a) | 0 | Run-level precondition closed | Flag true, package absent; rows disabled once per run. |
| Pact.js Utils Adoption | PASS (n/a) | 0 | Run-level precondition closed | Flag true, package absent; no Pact artifact. |
| Explicit Assertions | PASS | 0 | Absolute + Applicability | No tautological/missing/unreachable/floating-effect outcome found; H3 remains separately visible. |
| Test Length (<=1000 lines) | FAIL | 1 | Absolute | One support inventory file2100lines; not a behavioral failure. |
| Test Duration (<=1.5min) | WARN | 12 | Absolute + Applicability | Static pattern proxy; no new timing measurement and no fabricated all110 duration pass. |
| Flakiness Patterns | FAIL | 15 | Absolute + Applicability | Pattern risks distinct from qualified two observed retries. |
| Mobile Flow Patterns | PASS (n/a) | 0 | Applicability: Maestro flow | No Maestro flow in supplied set. |

**Total Violations**: 0 Critical, 4 High, 70 Medium, 2 Low
**Convention Baseline**: 40 test files sampled outside the review set

Baseline corpus423, closest directory distance first with lexical tie break; exact40paths and mechanically measured adoption preserved in JSON. Priority33/40 established; test IDs5/40 emerging; network-first0/40 absent; playwright-utils0/40 absent; factories30/40 established; fixtures26/40 established; behavioral naming40/40 and runner-native assertion style40/40 established. No convention is inferred from the reviewed set. L2 ownership omission is explicit and unscored.

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -0 × 10 = -0
High Violations:         -4 × 5 = -20
Medium Violations:       -70 × 2 = -140
Low Violations:          -2 × 1 = -2

Bonus Points:
  Excellent BDD:         +0
  Comprehensive Fixtures: +0
  Data Factories:        +0
  Network-First:         +0
  Perfect Isolation:     +0
  All Test IDs:          +0
                         --------
Total Bonus:             +0

Final Score:             0/100
Grade:                   F
```

Raw findings127; duplicate M4 rows51 removed by exact file/line/row identity. H5/H6/H7/H8/L4 use file-level identity. No weighted average or discretionary score correction. Six bonuses are0 because the criterion is not established across every reviewed artifact; no bonus inferred merely from missing violations.

## Critical Issues (Must Fix)

No CRITICAL issues detected. HIGH rubric observations appear below with exact scope and implications.

## Recommendations (Should Fix)

### 1. H3 — Conditional assertion

**Severity**: P1 (High)
**Location**: tests/e2e/files/documents-context-navigation.e2e.spec.ts:266
**Row**: H3
**Criterion**: Conditional assertion
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The old signed-URL absence assertion executes only when previousSignedHref is truthy. Callers at lines 583,611,646 obtain it with getAttribute and only a TypeScript non-null assertion, so a missing href silently omits this check; a visible download element does not prove its href exists. This can pass without exercising the claimed stale capability removal.

```typescript
if (previousSignedHref) expect(await page.locator("#main-content").evaluate((element, href) =>
    [...element.querySelectorAll("a")].some(anchor => anchor.href === href), previousSignedHref)).toBe(false);
```

**Recommended Improvement**: Assert that the prior signed href is nonempty when capturing it, pass a required string to the helper, and execute the absence assertion unconditionally for those cases.

**Focused applicability crosscheck**: Admin source-context picker upload/reset callers at583/611/646; TypeScript non-null assertion does not validate captured href.

**Related requirement**: 16.5-AC03/TR12 (file/context navigation regression)

- Same helper:265 download locator count0
- tests/unit/features/documents/preview-state.test.ts:16-23,35-45 populated URL then selection/filter clear and stale-response refusal
- tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:393-404 explicit cleared downloads; source inspected, not executed by current33Jobs/auth smoke

**Development impact**: Supplemental global-DOM stale-href oracle can be bypassed; core reset invariant has unconditional unit/browser-source anchors. No demonstrated missing Epic16 development invariant or product defect.

**Precise optional oracle repair**: Assert captured href is a nonempty string, require it in this helper and execute stale-href absence assertion unconditionally.

### 2. H3 — Conditional assertion

**Severity**: P1 (High)
**Location**: tests/integration/rls/work-orders.rls.test.ts:33
**Row**: H3
**Criterion**: Conditional assertion
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The only eligible-person DTO shape assertion is inside a loop over read.eligiblePeople with no nonempty or expected-identity assertion. If the populated current-lead read regresses to an empty eligible list, this privacy/shape check runs zero times and the scenario can remain green.

```typescript
for (const person of read.eligiblePeople) expect(Object.keys(person).sort()).toEqual(["id", "label"]);
```

**Recommended Improvement**: Arrange a specifically eligible current member and assert the expected populated eligiblePeople identities before iterating. If a role legitimately receives no candidates, assert that empty outcome explicitly in its own case.

**Focused applicability crosscheck**: Each seeded role is designated current lead of acceptedAssigned job and reads real checked work-order projection; eligiblePeople loop has no nonempty expected-ID assertion.

**Related requirement**: 16.3-AC01, 16.3-AC05

- tests/unit/server/read-models/job-work-orders.test.ts:11,26 populated candidate projection strips hourly_cost and preserves exact id/label
- tests/e2e/jobs/work-orders.e2e.spec.ts:86-87,116-136 two seeded current members selected and exact persisted IDs verified; actual current full retry passed, initial outcome uncertainty retained
- tests/integration/commands/work-orders.int.test.ts:17-18,34-45 real manager/lead plural eligible assignments persist

**Development impact**: Narrow populated SQL candidate-list oracle weakness. Existing unit projection/privacy and actual usable plural picker/assignment proof prevent a claim of wholly missing picker/privacy coverage. No product defect identified.

**Precise optional oracle repair**: Assert expected populated eligiblePeople identities for the arranged member fixture before the shape loop; explicitly assert an empty result only where independently expected.

### 3. H3 — Conditional assertion

**Severity**: P1 (High)
**Location**: tests/integration/rls/work-orders.rls.test.ts:36
**Row**: H3
**Criterion**: Conditional assertion
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The child-denial assertion is selected by the observed unrelatedParent response. An unexpectedly visible parent causes the test to skip the unrelatedChildren assertion rather than fail against an independently specified role expectation. This is an assertion bypass in the test; it does not establish a product RLS bypass.

```typescript
if ((unrelatedParent.data ?? []).length === 0) expect(unrelatedChildren.data ?? []).toEqual([]);
```

**Recommended Improvement**: Use the fixed role/fixture expectation to assert parent and child visibility independently, with a real seeded unrelated child for the denied roles, instead of choosing whether to assert from the parent read result.

**Focused applicability crosscheck**: Seeded-role current-lead matrix chooses unrelated-child assertion from observed unrelatedParent; no unrelated work order is created until later in the scenario.

**Related requirement**: 16.3-AC06, 16.5-AC02/TR12

- supabase/migrations/20261020200000_e16_16_3_work_orders.sql:58 shared job_can_read select policy
- tests/integration/rls/jobs-depth.rls.test.ts:18-26 independent seeded-role parent visibility assertions
- tests/integration/rls/work-orders.rls.test.ts:62-65 seeded unrelated child and unconditional revoked-Montor parent/child denial
- tests/integration/rls/job-workspace.rls.test.ts:32-48 seeded own/other/foreign work orders, positive own projection and unconditional other/foreign raw denial

**Development impact**: Residual per-role child oracle should be independent and discriminate a populated denied child. Shared enforced policy plus existing direct negative and positive anchors mean no discovered missing guard or global trace gap.

**Precise optional oracle repair**: Seed an unrelated work order before role iteration; assert both parent and child visibility from fixed manager/nonmanager expectations, never observed-parent output.

### 4. H5 — Oversize test file

**Severity**: P1 (High)
**Location**: tests/integration/rls/tenant-table-inventory.ts:1001
**Row**: H5
**Criterion**: Oversize test file
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The reviewed test-support inventory is 2,100 logical lines, exceeding the registry H5 absolute 1,000-line threshold. It has no test bodies, so test-body predicates are n/a, but H5 is a file-level predicate. This metric does not demonstrate a behavior, security or coverage failure.

```typescript
          "tenantBCompanySettingsId",
```

**Recommended Improvement**: When maintaining the inventory, consider coherent internal metadata modules while retaining its one public authoritative enrollment API and completeness checks. Do not delete inventory entries or weaken the gate to reduce length.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 5. M2 — Repeated literal payload

**Severity**: P2 (Medium)
**Location**: tests/unit/server/commands/file-validation.test.ts:43
**Row**: M2
**Criterion**: Repeated literal payload
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The complete file-link validator payload shape file_id/owner_type/owner_id/purpose is reconstructed inline six times at lines 43,57,69,81,90,99. These are domain inputs passed to validateCreateFileLink, not repeated constants or expected-output assertions.

```typescript
    const r = validateCreateFileLink({
```

**Recommended Improvement**: Introduce a local valid file-link input builder with explicit overrides for owner type, purpose and malformed IDs; retain each rejection case and its behavior title.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 6. M2 — Repeated literal payload

**Severity**: P2 (Medium)
**Location**: tests/unit/features/files/revalidate-route.test.ts:75
**Row**: M2
**Criterion**: Repeated literal payload
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: Six complete nested-owner route inputs repeat ownerType/ownerId/parentCustomerId/parentQuoteId/parentVersionId at lines 75,86,99,109,152,162. These are domain input objects passed to resolveRevalidateRoute; the existing NO_PARENTS reuse does not cover these six constructions.

```typescript
  const route = resolveRevalidateRoute({
```

**Recommended Improvement**: Use a small local route-input builder with overrides for the parent relationship under test, preserving the explicit invalid-parent and no-fallback assertions.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 7. M2 — Repeated literal payload

**Severity**: P2 (Medium)
**Location**: tests/unit/features/scheduling/capacity.golden.test.ts:8
**Row**: M2
**Criterion**: Repeated literal payload
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The shift domain payload weekday/start/end/breaks is rebuilt inline at lines 8,14,28,39,47,55,61,62,77. The facts() factory constructs the larger scheduling graph but these nine shift objects are still constructed independently.

```typescript
  const detect = await engine(); const input = facts(); input.people[0]!.shifts = [{ weekday: 1, start: "10:00", end: "10:30", breaks: [] }];
```

**Recommended Improvement**: Provide a local shift factory with explicit weekday/start/end/breaks overrides. Keep exact golden and microsecond boundary values visible at each call site.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 8. L1 — Fragile selector

**Severity**: P3 (Low)
**Location**: tests/e2e/files/documents-context-navigation.e2e.spec.ts:383
**Row**: L1
**Criterion**: Fragile selector
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/selector-resilience.md

**Issue Description**: The DOM lookup uses the CSS id #main-content. AppShell renders this existing element as a main landmark (src/components/app-shell/AppShell.tsx:309-310), so a role-based locator is already available. Other same-selector uses occur in this file; this row is recorded once for the file and is not duplicated as L3.

```typescript
        await expect(page.locator("#main-content")).not.toContainText(source(seed, "customer").label);
```

**Recommended Improvement**: Replace the main landmark lookups with page.getByRole("main"), retaining the existing privacy/content assertions and evaluate behavior.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 9. L1 — Fragile selector

**Severity**: P3 (Low)
**Location**: tests/e2e/files/documents.e2e.spec.ts:166
**Row**: L1
**Criterion**: Fragile selector
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/selector-resilience.md

**Issue Description**: This privacy assertion selects the existing main landmark using the CSS id #main-content even though its semantic main role is available. Record L1 once; no duplicate L3 deduction attaches to this lookup.

```typescript
        await expect(page.locator("#main-content")).not.toContainText(fixture().crm.fileName);
```

**Recommended Improvement**: Use page.getByRole("main") for the existing negative filename assertion.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 10. M7 — Excessive nesting

**Severity**: P2 (Medium)
**Location**: tests/integration/commands/documents-lifecycle-lock-races.int.test.ts:114
**Row**: M7
**Criterion**: Excessive nesting
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: Inside the test starting at line 97, the pending transaction try block is nested beyond three blocks: for(98), fixture callback(99), holder callback(107), try(109), pending callback(112), try(114). This reports nesting complexity, not a demonstrated lock or correctness defect.

```typescript
            try { const [p] = await tx.query<{ pid: number }>("select pg_backend_pid() pid"); pid.resolve(p.pid); await tx.query("set local statement_timeout='12s'"); await tx.query(mutation[0], [mutation[1]]); await tx.query("rollback"); return { ok: true }; }
```

**Recommended Improvement**: Extract a focused transaction-attempt helper with explicit session and result parameters while retaining the blocking, commit and finally cleanup assertions.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 11. M7 — Excessive nesting

**Severity**: P2 (Medium)
**Location**: tests/integration/commands/documents-signed-access-lock-races.int.test.ts:156
**Row**: M7
**Criterion**: Excessive nesting
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The parameterized test at line 144 contains the holder callback(146), try(150), pending request callback(154), and nested try(156), exceeding three nested blocks within the test body. No behavioral failure is inferred from that metric.

```typescript
          try {
```

**Recommended Improvement**: Extract the pending request transaction into a local helper with explicit prepared-proof and PID signals; keep every expiry and no-audit assertion.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 12. M7 — Excessive nesting

**Severity**: P2 (Medium)
**Location**: tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:699
**Row**: M7
**Criterion**: Excessive nesting
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The test at line 665 nests its media diagnostic through withSeed(670), addInitScript(676), replacement fetch callback(687), try(695), and if(699): five blocks within the test body. This is a maintainability metric; it does not imply the instrumentation or media behavior is wrong.

```typescript
              if (gated) {
```

**Recommended Improvement**: Move the narrowly scoped media cleanup instrumentation into a named local installer and retain its transparent native delegates, explicit gate and all cleanup assertions.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 13. M7 — Excessive nesting

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/job-workspace.e2e.spec.ts:643
**Row**: M7
**Criterion**: Excessive nesting
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md

**Issue Description**: The test at line 613 nests withWorkspaceFixture(614), holdActual callback(630), the destination else-if(641), and matching-destination if(643), exceeding three blocks within its body. This is a structure observation, not an identified navigation, authority or outcome failure.

```typescript
          if (!capturedNavigation && url.searchParams.get("workOrder") === b) {
```

**Recommended Improvement**: Extract the held real-create/navigation route observer into a local helper with explicit origin/destination/gate parameters; preserve real response handling and the exact winning-navigation assertions.

**Impact**: maintainability rubric observation. No acceptance weakening or source change is authorized by this recommendation.

### 14. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/files/documents-context-navigation.e2e.spec.ts:283
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: The real source-panel journey navigates to ref.route and then reads the seeded filename and context entry without a readiness signal for that source registered before navigation. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
        await signIn(page, seed.base.adminA); await page.goto(ref.route);
        const panel = page.getByTestId(ref.panelId);
        await expect(panel).toBeVisible();
        await expect(panel).toContainText(fileName);
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 15. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:66
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: The open helper navigates to the filtered Documents route without registering a readiness signal for its rows/facets first; the combined-filter case reads seeded rows and counts after this helper. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await signIn(page); await page.goto(`/files?${new URLSearchParams(query)}`);
}
async function select(page: Page, name: string): Promise<Response> {
  const control = row(page, name).getByRole("button", { name: "Förhandsvisa", exact: true }); await hydrated(control);
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 16. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/files/documents.e2e.spec.ts:73
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: openDocuments navigates to /files and then checks the heading/index before callers read document rows. Neither these post-navigation checks nor the login diagnostic listeners register readiness for the document projection before navigation. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await page.goto("/files");
  await expect(page.getByRole("heading", { name: "Dokument", exact: true })).toBeVisible();
  await expect(page.getByTestId("file-index")).toBeVisible();
}
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 17. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/files/entity-file-preview.e2e.spec.ts:87
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: gotoCustomerPanel navigates to the customer route and callers then inspect file-panel content and preview controls without a pre-navigation data readiness signal. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await page.goto(`/customers/${fixture().crm.company.id}`);
  await expect(page.getByTestId("entity-file-panel")).toBeVisible();
}

```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 18. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/files/file-index-scope.e2e.spec.ts:125
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: The category test navigates to /files and then reads seeded customer/quote/evidence rows and exact facets without pre-registering readiness for those results. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
    await page.goto("/files");
    const index = page.getByTestId("file-index");
    await expect(index).toBeVisible();

```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 19. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/job-members.e2e.spec.ts:76
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: membersPanel navigates to the job and returns the member panel after generic visibility/React-marker polling; no member-data readiness signal is registered before navigation. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await page.goto(`/jobs/${jobId}`);
  const panel = page.getByTestId("job-members-panel");
  await ready(panel);
  return panel;
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 20. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:44
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: openJobBooking navigates to the job schedule and then opens the data-bound booking editor; ready only polls visibility/React markers after navigation, with no prior job/booking data readiness signal. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await page.goto(`/jobs/${jobId}?tab=schedule`);
  const entry = page.getByTestId("booking-entry-job");
  await ready(entry);
  await entry.click();
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 21. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/job-traceability.e2e.spec.ts:84
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: openJobDetail navigates directly to the accepted job and then callers read source/version/evidence/price content. The post-navigation hydration helper is generic and no data readiness signal is registered first. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await page.goto(`/jobs/${fixture.acceptedJob.jobId}`);
  await waitForHydrated(page.getByTestId("job-detail"));
}

```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 22. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/job-upgrade.e2e.spec.ts:76
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: editFullCard navigates to the job and reads current CRM/card selections after generic hydration polling, without a pre-navigation readiness signal for that projection. Upgrade/card mutation observers correctly precede their later submit actions but do not cover this navigation. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await page.goto(`/jobs/${jobId}`);
  const card = page.getByTestId("job-card-form");
  await ready(card);
  await card.getByRole("textbox", { name: "Titel", exact: true }).fill(title);
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 23. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/job-workspace.e2e.spec.ts:296
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: After the checked upgrade, the workspace journey navigates to the events tab and immediately reads the upgrade event, type and identity without a pre-navigation readiness registration for that workspace data. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
      await page.goto(`/jobs/${jobId}?tab=events`);
      await expect(page.getByRole("tabpanel", { name: "Händelser", exact: true })).toContainText("Uppgraderad till projekt");
      await expect(page.getByTestId("job-workspace-type")).toContainText("Projekt");
      await identity(page, jobId, changed);
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 24. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/jobs-depth.e2e.spec.ts:64
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: openCard navigates to the job and returns the data-dependent form after a generic post-navigation React-marker helper, without registering card-data readiness before navigation. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
  await page.goto(`/jobs/${jobId}`);
  const form = page.getByTestId("job-card-form");
  await hydrated(form);
  return form;
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### 25. M1 — Network-first violated

**Severity**: P2 (Medium)
**Location**: tests/e2e/jobs/work-orders.e2e.spec.ts:89
**Row**: M1
**Criterion**: Network-first violated
**Knowledge Base**: .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md

**Issue Description**: The essential work-order journey navigates to the work-order tab and interacts with the current parent panel after generic visibility/React-marker polling; no work-order data readiness signal is registered first. This is the registry readiness-pattern risk, not proof of a production defect or the cause of any prior retry.

```typescript
      await page.goto(`/jobs/${jobId}?tab=work-orders`);
      const panel = page.getByTestId("job-work-orders-panel");
      await ready(panel);
      await panel.getByRole("button", { name: "Ny arbetsorder", exact: true }).click();
```

**Recommended Improvement**: Register a narrowly scoped observer/readiness promise for the actual document or RSC data route before page.goto, await its successful completion, and retain the current data-specific assertions. Do not invent a test endpoint or replace real persistence with a success stub.

**Impact**: Static readiness-pattern risk; no demonstrated production defect or causal link to retained retries.. No acceptance weakening or source change is authorized by this recommendation.

### M4 grouping observations — 51 MEDIUM deductions

The following51files have three or more runner test bodies and no runner describe/context group. Locally defined context() dependency factories are not runner groups. Each is a pinned MEDIUM deduction; diagnostic/style scope only, no demonstrated correctness/security failure. Suggested future maintenance pattern is a subject-level describe wrapper preserving all bodies, hooks, IDs and assertions. No wholesale restyling or new development gate is requested.

```typescript
describe("Existing behavior subject", () => {
  // Keep each current test body and fixture lifetime unchanged.
});
```

| File | Line | Row | Severity |
| --- | ---: | --- | --- |
| tests/integration/commands/documents-lifecycle-lock-races.int.test.ts | 50 | M4 | MEDIUM |
| tests/integration/commands/documents-lifecycle.int.test.ts | 92 | M4 | MEDIUM |
| tests/integration/commands/work-order-files.int.test.ts | 61 | M4 | MEDIUM |
| tests/integration/rls/documents-context.rls.test.ts | 124 | M4 | MEDIUM |
| tests/integration/rls/documents-filter-archive.rls.test.ts | 66 | M4 | MEDIUM |
| tests/unit/components/documents/entity-documents-link.test.ts | 41 | M4 | MEDIUM |
| tests/unit/features/documents/context-navigation.test.ts | 17 | M4 | MEDIUM |
| tests/unit/features/documents/date-bounds.test.ts | 5 | M4 | MEDIUM |
| tests/unit/features/documents/filters.test.ts | 12 | M4 | MEDIUM |
| tests/unit/features/documents/preview-state.test.ts | 15 | M4 | MEDIUM |
| tests/unit/features/files/revalidate-route.test.ts | 35 | M4 | MEDIUM |
| tests/unit/features/jobs/dependency-warnings.test.ts | 25 | M4 | MEDIUM |
| tests/unit/features/jobs/job-card-validation.test.ts | 22 | M4 | MEDIUM |
| tests/unit/features/jobs/job-members-domain.test.ts | 54 | M4 | MEDIUM |
| tests/unit/features/jobs/job-scheduling-consumers.test.ts | 29 | M4 | MEDIUM |
| tests/unit/features/jobs/job-upgrade-domain.test.ts | 20 | M4 | MEDIUM |
| tests/unit/features/jobs/job-workspace-domain.test.ts | 25 | M4 | MEDIUM |
| tests/unit/features/jobs/work-order-selection.test.ts | 5 | M4 | MEDIUM |
| tests/unit/features/jobs/work-orders-domain.test.ts | 56 | M4 | MEDIUM |
| tests/unit/features/scheduling/batch-conflicts.test.ts | 24 | M4 | MEDIUM |
| tests/unit/features/scheduling/capacity.golden.test.ts | 7 | M4 | MEDIUM |
| tests/unit/features/scheduling/job-demand-advisory.test.ts | 36 | M4 | MEDIUM |
| tests/unit/scope/manifest-derivations.test.ts | 112 | M4 | MEDIUM |
| tests/unit/scope/manifest-invariants.test.ts | 55 | M4 | MEDIUM |
| tests/unit/scope/manifest-shape.test.ts | 132 | M4 | MEDIUM |
| tests/unit/scripts/ci/checkpoint-dispatch.test.ts | 60 | M4 | MEDIUM |
| tests/unit/scripts/ci/verify-development.test.ts | 6 | M4 | MEDIUM |
| tests/unit/scripts/pr-feedback-app-permissions.test.ts | 9 | M4 | MEDIUM |
| tests/unit/scripts/pr-feedback-runtime.test.ts | 31 | M4 | MEDIUM |
| tests/unit/scripts/pr-feedback.test.ts | 31 | M4 | MEDIUM |
| tests/unit/scripts/verify/ci-native-test-reports.test.ts | 9 | M4 | MEDIUM |
| tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts | 8 | M4 | MEDIUM |
| tests/unit/server/authz/command-enrollment.test.ts | 13 | M4 | MEDIUM |
| tests/unit/server/authz/job-access.test.ts | 40 | M4 | MEDIUM |
| tests/unit/server/authz/permission-matrix.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/authz/phase-a-surface.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/bookings/job-facts.test.ts | 56 | M4 | MEDIUM |
| tests/unit/server/commands/documents-lifecycle.test.ts | 14 | M4 | MEDIUM |
| tests/unit/server/commands/documents-signed-access.test.ts | 150 | M4 | MEDIUM |
| tests/unit/server/commands/envelope-core-edges.test.ts | 64 | M4 | MEDIUM |
| tests/unit/server/commands/envelope-core.test.ts | 34 | M4 | MEDIUM |
| tests/unit/server/commands/file-validation.test.ts | 34 | M4 | MEDIUM |
| tests/unit/server/commands/files/validate-upload-file.test.ts | 57 | M4 | MEDIUM |
| tests/unit/server/commands/job-card-validation.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/commands/work-orders-db.test.ts | 13 | M4 | MEDIUM |
| tests/unit/server/read-models/document-context.test.ts | 94 | M4 | MEDIUM |
| tests/unit/server/read-models/document-sources.test.ts | 97 | M4 | MEDIUM |
| tests/unit/server/read-models/documents.test.ts | 101 | M4 | MEDIUM |
| tests/unit/server/read-models/job-events.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/read-models/job-workspace.test.ts | 18 | M4 | MEDIUM |
| tests/unit/server/storage/document-signed-access-attestation.test.ts | 76 | M4 | MEDIUM |

## Best Practices Found

- tests/integration/commands/job-upgrade.int.test.ts and work-orders.int.test.ts preserve actual atomic snapshots and injected-fault/replay assertions.
- tests/integration/rls/job-workspace.rls.test.ts:32-48 seeds visible and hidden children, checks a positive own projection, and unconditionally asserts direct other/foreign denial.
- tests/unit/server/read-models/job-work-orders.test.ts:11-31 uses a populated protected projection to prove structural stripping.
- Existing test fixtures arrange real tenant/client state with bounded cleanup/restoration; no module-initialization service launch is introduced.

## Test File Analysis

Authoritative110paths:1,909,152bytes/28,490metadata lines;10Python,99TypeScript,1JSON.96files contain actual test bodies;13support/config artifacts were read for applicable predicates and fixture/async context, not treated as missing-assertion tests.109reviewed paths represent104unique byte contents after five mirrored pairs. One JSON golden input is not scoreable by this ledger; its data remains required by its consumers and is not removed or declared passed.

Framework/import metadata:51Node-test,25Vitest,13Playwright-import (including config),8Python-test and12helper/config paths, plus1JSON. Metadata token counts are lexical, not runtime testcase counts; exact imports/fixtures/control flow were inspected by the responsible workers. Reused current runtime counts appear below and are not inferred from declarations. Assertions per body and duration across all110are not manufactured statistics.

### Byte-identical mirrors

- .agents/skills/auto-bmad/scripts/tests/fixtures/parallel_run_v1.py = .claude/skills/auto-bmad/scripts/tests/fixtures/parallel_run_v1.py; SHA256 909961D3F19B2CCE74CD04AAA45DF228023D9D9700C31680D7F2762A525BD6EF
- .agents/skills/auto-bmad/scripts/tests/test_delivery_gate.py = .claude/skills/auto-bmad/scripts/tests/test_delivery_gate.py; SHA256 12F1D2A6975AB5CE6B5ADBE0D7FD36F69D118A574DDDE3FE75D1408F5899A237
- .agents/skills/auto-bmad/scripts/tests/test_parallel_cli.py = .claude/skills/auto-bmad/scripts/tests/test_parallel_cli.py; SHA256 2816E762C82F7C2280178159187F5C9F0C1DE7D995ABB3C4B3502FB76A196C26
- .agents/skills/auto-bmad/scripts/tests/test_parallel_finalization.py = .claude/skills/auto-bmad/scripts/tests/test_parallel_finalization.py; SHA256 757816D596028D10CA4F8B850167878233DFD67CC60C7BB7D74C18985AA4EC64
- .agents/skills/auto-bmad/scripts/tests/test_parallel_run.py = .claude/skills/auto-bmad/scripts/tests/test_parallel_run.py; SHA256 D3147E3A77A4CCC2B128CD4C78D94B40622E0FD9558F771A9AEA6E53F5B8CDD2

All mirrored identities remain dispositioned. Content read-once reuse is recorded, not a silent exclusion. No finding was lost through mirror handling.

## Context and Integration

Five supplied DONE specs establish approved job access/membership, four-state work orders and Files, one-way upgrade/current facts, scheduling advisory/defaults and workspace TR12 boundaries. They are read-only context, never scored, never used to waive a finding. Process policies distinguish required development integrity/essential smoke from14owned release-only breadth/visual/manual deferrals. Context adds the focused H3 applicability crosscheck; it alters no deduction.
This quality review does not redo formal trace coverage or its gate. Existing trace PASS36AC100%(29P0/7P1),TR01-16 and NFR CONCERNS/MEDIUM remain separate completed artifacts. No global trace gap, missing guard or product defect is established by these observations.

### Reused verification evidence

Actual functional/test revision54ac91ec2c912afe3b6772fcb8daa11fb282d36a; [CI39490485088](https://github.com/rthunborg/Kopplas/actions/runs/39490485088). Functional/dependency/config/SQL applicability remains unchanged; old story1-4 receipts remain historical and current global CI qualifies changed consumer seams.
2740units passed0skip +43process; requiredDB1880total1879pass0fail1ordinaryphysicalrecoveryskip separately1/1pass0skip; browser33complete passes31first+2qualifiedfullretries/all5workspacefirst. These figures do not claim all110reviewed files or E20 Documents browser journeys were executed by the current smoke.
First16.1E03response-body lookup precise cause unknown. First16.3E01auditdelta0 before confirmed save leaves initial action outcome/timing unresolved; HTTP200 is not application success, and pure observer cause is not proven. Full retries passed original assertions. Historical failed CI attempts remain failed history; no first-pass-clean, zero-flakiness or waiver claim.
- C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log; SHA256 24FBA4F37AEA028DD760FE599B724701DB31B57C3FE9DBD6DB276A6E6312A004
- C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json; SHA256 028E6DC91A52DC12CCB73B7A1EBD20FE71A1C436F2740671EE736EA35EF46D6E
- C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-recovery-native/isolated-storage-recovery.json; SHA256 C2D82E2C9DC1EF156656C14CD079A129042A0C375EE881FBE99A62B7C31E4A78
- C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-browser-native/general-browser.json; SHA256 C08263B31221E0BB82649DF83BF7E7B98B85DD2A6FF6AAAF5F5844790094E1F0
- C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-db.log; SHA256 99A4E7E12FE4F300CE744861EBECAF599EDE547A4FF75A6185AF6FB2661048CD

## Knowledge Base References

- .agents/skills/bmad-testarch-test-review/resources/knowledge/library-integration-mandate.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/playwright-utils-mandate.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/data-factories.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/test-levels-framework.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/selective-testing.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/test-healing-patterns.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/selector-resilience.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/timing-debugging.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/fixture-architecture.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/network-first.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/playwright-config.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/ci-burn-in.md
- .agents/skills/bmad-testarch-test-review/resources/knowledge/pact-mcp.md

Both utilityflags are true and both packages absent. M9/M10/L9 are disabled once per run, not per-file deductions. A separately allocated framework workflow is the option if adoption is desired; no install or framework migration is required to close this audit. Pact broker: unreachable (SmartBear MCP tools unavailable by metadata probe); no Pact artifact/provider-state analysis applies, no broker request or invented provider states.

## Next Steps

1. Root retains the exact computed score/recommendation and optional three H3 oracle recommendations with independent anchors in report/retro/epic delivery. No new test repair cycle merely for duplicate coverage/style.
2. During future affected-test maintenance, consider small grouping/builders/readiness/selector/nesting changes proportionate to demonstrated need; preserve all denial/transaction/current-authority assertions.
3. Preserve14owned release checks as DEFERRED, not passed/waived; release_ready=false. No release/deployment authorization. Parent dispatches reconcile separately; no reconcile executed in this run.

## Decision

**Recommendation**: Request Changes

The mandated deduction ledger produces0/F and Request Changes from4HIGH/70MEDIUM/2LOW. It is not softened. Most volume is grouping/readiness diagnostic debt; H5 is a support-size metric. The three H3 patterns remain valid rubric findings with precise optional oracle strengthening, while existing independent unconditional positive/negative anchors cover their core invariants. This bounded review establishes no missing development invariant, product guard bypass or production defect. Context waivers0; no functional failure excused.

## Appendix

### Violation Summary by Location

| File | Line | Row | Severity |
| --- | ---: | --- | --- |
| tests/e2e/files/documents-context-navigation.e2e.spec.ts | 266 | H3 | HIGH |
| tests/e2e/files/documents-context-navigation.e2e.spec.ts | 283 | M1 | MEDIUM |
| tests/e2e/files/documents-context-navigation.e2e.spec.ts | 383 | L1 | LOW |
| tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts | 66 | M1 | MEDIUM |
| tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts | 699 | M7 | MEDIUM |
| tests/e2e/files/documents.e2e.spec.ts | 73 | M1 | MEDIUM |
| tests/e2e/files/documents.e2e.spec.ts | 166 | L1 | LOW |
| tests/e2e/files/entity-file-preview.e2e.spec.ts | 87 | M1 | MEDIUM |
| tests/e2e/files/file-index-scope.e2e.spec.ts | 125 | M1 | MEDIUM |
| tests/e2e/jobs/job-members.e2e.spec.ts | 76 | M1 | MEDIUM |
| tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts | 44 | M1 | MEDIUM |
| tests/e2e/jobs/job-traceability.e2e.spec.ts | 84 | M1 | MEDIUM |
| tests/e2e/jobs/job-upgrade.e2e.spec.ts | 76 | M1 | MEDIUM |
| tests/e2e/jobs/job-workspace.e2e.spec.ts | 296 | M1 | MEDIUM |
| tests/e2e/jobs/job-workspace.e2e.spec.ts | 643 | M7 | MEDIUM |
| tests/e2e/jobs/jobs-depth.e2e.spec.ts | 64 | M1 | MEDIUM |
| tests/e2e/jobs/work-orders.e2e.spec.ts | 89 | M1 | MEDIUM |
| tests/integration/commands/documents-lifecycle-lock-races.int.test.ts | 50 | M4 | MEDIUM |
| tests/integration/commands/documents-lifecycle-lock-races.int.test.ts | 114 | M7 | MEDIUM |
| tests/integration/commands/documents-lifecycle.int.test.ts | 92 | M4 | MEDIUM |
| tests/integration/commands/documents-signed-access-lock-races.int.test.ts | 156 | M7 | MEDIUM |
| tests/integration/commands/work-order-files.int.test.ts | 61 | M4 | MEDIUM |
| tests/integration/rls/documents-context.rls.test.ts | 124 | M4 | MEDIUM |
| tests/integration/rls/documents-filter-archive.rls.test.ts | 66 | M4 | MEDIUM |
| tests/integration/rls/tenant-table-inventory.ts | 1001 | H5 | HIGH |
| tests/integration/rls/work-orders.rls.test.ts | 33 | H3 | HIGH |
| tests/integration/rls/work-orders.rls.test.ts | 36 | H3 | HIGH |
| tests/unit/components/documents/entity-documents-link.test.ts | 41 | M4 | MEDIUM |
| tests/unit/features/documents/context-navigation.test.ts | 17 | M4 | MEDIUM |
| tests/unit/features/documents/date-bounds.test.ts | 5 | M4 | MEDIUM |
| tests/unit/features/documents/filters.test.ts | 12 | M4 | MEDIUM |
| tests/unit/features/documents/preview-state.test.ts | 15 | M4 | MEDIUM |
| tests/unit/features/files/revalidate-route.test.ts | 35 | M4 | MEDIUM |
| tests/unit/features/files/revalidate-route.test.ts | 75 | M2 | MEDIUM |
| tests/unit/features/jobs/dependency-warnings.test.ts | 25 | M4 | MEDIUM |
| tests/unit/features/jobs/job-card-validation.test.ts | 22 | M4 | MEDIUM |
| tests/unit/features/jobs/job-members-domain.test.ts | 54 | M4 | MEDIUM |
| tests/unit/features/jobs/job-scheduling-consumers.test.ts | 29 | M4 | MEDIUM |
| tests/unit/features/jobs/job-upgrade-domain.test.ts | 20 | M4 | MEDIUM |
| tests/unit/features/jobs/job-workspace-domain.test.ts | 25 | M4 | MEDIUM |
| tests/unit/features/jobs/work-order-selection.test.ts | 5 | M4 | MEDIUM |
| tests/unit/features/jobs/work-orders-domain.test.ts | 56 | M4 | MEDIUM |
| tests/unit/features/scheduling/batch-conflicts.test.ts | 24 | M4 | MEDIUM |
| tests/unit/features/scheduling/capacity.golden.test.ts | 7 | M4 | MEDIUM |
| tests/unit/features/scheduling/capacity.golden.test.ts | 8 | M2 | MEDIUM |
| tests/unit/features/scheduling/job-demand-advisory.test.ts | 36 | M4 | MEDIUM |
| tests/unit/scope/manifest-derivations.test.ts | 112 | M4 | MEDIUM |
| tests/unit/scope/manifest-invariants.test.ts | 55 | M4 | MEDIUM |
| tests/unit/scope/manifest-shape.test.ts | 132 | M4 | MEDIUM |
| tests/unit/scripts/ci/checkpoint-dispatch.test.ts | 60 | M4 | MEDIUM |
| tests/unit/scripts/ci/verify-development.test.ts | 6 | M4 | MEDIUM |
| tests/unit/scripts/pr-feedback-app-permissions.test.ts | 9 | M4 | MEDIUM |
| tests/unit/scripts/pr-feedback-runtime.test.ts | 31 | M4 | MEDIUM |
| tests/unit/scripts/pr-feedback.test.ts | 31 | M4 | MEDIUM |
| tests/unit/scripts/verify/ci-native-test-reports.test.ts | 9 | M4 | MEDIUM |
| tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts | 8 | M4 | MEDIUM |
| tests/unit/server/authz/command-enrollment.test.ts | 13 | M4 | MEDIUM |
| tests/unit/server/authz/job-access.test.ts | 40 | M4 | MEDIUM |
| tests/unit/server/authz/permission-matrix.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/authz/phase-a-surface.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/bookings/job-facts.test.ts | 56 | M4 | MEDIUM |
| tests/unit/server/commands/documents-lifecycle.test.ts | 14 | M4 | MEDIUM |
| tests/unit/server/commands/documents-signed-access.test.ts | 150 | M4 | MEDIUM |
| tests/unit/server/commands/envelope-core-edges.test.ts | 64 | M4 | MEDIUM |
| tests/unit/server/commands/envelope-core.test.ts | 34 | M4 | MEDIUM |
| tests/unit/server/commands/file-validation.test.ts | 34 | M4 | MEDIUM |
| tests/unit/server/commands/file-validation.test.ts | 43 | M2 | MEDIUM |
| tests/unit/server/commands/files/validate-upload-file.test.ts | 57 | M4 | MEDIUM |
| tests/unit/server/commands/job-card-validation.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/commands/work-orders-db.test.ts | 13 | M4 | MEDIUM |
| tests/unit/server/read-models/document-context.test.ts | 94 | M4 | MEDIUM |
| tests/unit/server/read-models/document-sources.test.ts | 97 | M4 | MEDIUM |
| tests/unit/server/read-models/documents.test.ts | 101 | M4 | MEDIUM |
| tests/unit/server/read-models/job-events.test.ts | 9 | M4 | MEDIUM |
| tests/unit/server/read-models/job-workspace.test.ts | 18 | M4 | MEDIUM |
| tests/unit/server/storage/document-signed-access-attestation.test.ts | 76 | M4 | MEDIUM |

### Quality Trends

No prior comparable110-file rubric run is supplied; no numerical trend/average invented. Per-dimension informational scores:determinism70,isolation0,maintainability0,performance40. They are not averaged; the global deduction ledger alone controls final0.

## Review Metadata

Headless input override:true; authoritative review_files JSON SHA256 D716F876FF9128E702E5025F061F4D9CA29A5A065DA85C80E0D0C44E383CFE7D. Complete source:C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-epic-authoritative-review-files-7b220c5e.json. Output override:_bmad-output/test-artifacts/epic-16/test-review.md. Inline commentsfalse, story updatesfalse; no scored context files.
Four context-free gpt-6.1-sol High workers completed and were awaited. Capacity refusal before creation was handled only by own worker completion; no stale actor interrupted. No parallel speedup measured.
New commands/checks:actual rg file discovery and40file convention reads;110file metadata/hash validation; bounded static worker AST/source inspections; root-requested three-H3 anchor crosscheck; JSON/registry/location/dedup/ledger/readback validation. New tests0,runtime0,CI0. A transient preparation-script variable typo was corrected before context persistence; final validation passed. No source/spec/tests/dependency/config/Git/state edits.
Workflow limitation:L2is published but absent from four worker ownership lists, so priority-marker baseline is reported NOT_EVALUATED rather than fakePASS. Broader operational NFR and release validation are not silently added to this review.

## Reviewed Files

- .agents/skills/auto-bmad/scripts/tests/fixtures/parallel_run_v1.py
- .agents/skills/auto-bmad/scripts/tests/test_delivery_gate.py
- .agents/skills/auto-bmad/scripts/tests/test_parallel_cli.py
- .agents/skills/auto-bmad/scripts/tests/test_parallel_finalization.py
- .agents/skills/auto-bmad/scripts/tests/test_parallel_run.py
- .claude/skills/auto-bmad/scripts/tests/fixtures/parallel_run_v1.py
- .claude/skills/auto-bmad/scripts/tests/test_delivery_gate.py
- .claude/skills/auto-bmad/scripts/tests/test_parallel_cli.py
- .claude/skills/auto-bmad/scripts/tests/test_parallel_finalization.py
- .claude/skills/auto-bmad/scripts/tests/test_parallel_run.py
- tests/e2e/dashboard/playwright.ci.config.ts
- tests/e2e/files/documents-context-navigation.e2e.spec.ts
- tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts
- tests/e2e/files/documents.e2e.spec.ts
- tests/e2e/files/entity-file-preview.e2e.spec.ts
- tests/e2e/files/file-index-scope.e2e.spec.ts
- tests/e2e/jobs/job-members.e2e.spec.ts
- tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts
- tests/e2e/jobs/job-traceability.e2e.spec.ts
- tests/e2e/jobs/job-upgrade.e2e.spec.ts
- tests/e2e/jobs/job-workspace.e2e.spec.ts
- tests/e2e/jobs/jobs-depth.e2e.spec.ts
- tests/e2e/jobs/work-orders.e2e.spec.ts
- tests/integration/commands/booking-editor.int.test.ts
- tests/integration/commands/documents-lifecycle-lock-races.int.test.ts
- tests/integration/commands/documents-lifecycle.int.test.ts
- tests/integration/commands/documents-signed-access-lock-races.int.test.ts
- tests/integration/commands/documents-signed-access.int.test.ts
- tests/integration/commands/job-booking-facts.int.test.ts
- tests/integration/commands/job-members.int.test.ts
- tests/integration/commands/job-scheduling-consumers.int.test.ts
- tests/integration/commands/job-upgrade.int.test.ts
- tests/integration/commands/jobs-depth.int.test.ts
- tests/integration/commands/work-order-files.int.test.ts
- tests/integration/commands/work-orders.int.test.ts
- tests/integration/features/jobs/job-workspace.int.test.ts
- tests/integration/features/jobs/my-jobs.int.test.ts
- tests/integration/rls/cross-tenant-isolation.rls.test.ts
- tests/integration/rls/documents-context.rls.test.ts
- tests/integration/rls/documents-filter-archive.rls.test.ts
- tests/integration/rls/documents.rls.test.ts
- tests/integration/rls/job-members.rls.test.ts
- tests/integration/rls/job-workspace.rls.test.ts
- tests/integration/rls/jobs-depth.rls.test.ts
- tests/integration/rls/migration-reset.int.test.ts
- tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts
- tests/integration/rls/role-harness.atdd.int.test.ts
- tests/integration/rls/tenant-table-inventory.ts
- tests/integration/rls/work-orders.rls.test.ts
- tests/support/authz/role-harness.ts
- tests/support/booking-editor-production.ts
- tests/support/bookings-atdd.ts
- tests/support/job-booking-facts-atdd.ts
- tests/support/job-members-atdd.ts
- tests/support/job-semantics-atdd.ts
- tests/support/job-workspace-atdd.ts
- tests/support/jobs-depth-atdd.ts
- tests/support/work-orders-atdd.ts
- tests/unit/components/documents/entity-documents-link.test.ts
- tests/unit/features/documents/context-navigation.test.ts
- tests/unit/features/documents/date-bounds.test.ts
- tests/unit/features/documents/filters.test.ts
- tests/unit/features/documents/preview-state.test.ts
- tests/unit/features/files/file-index.test.ts
- tests/unit/features/files/revalidate-route.test.ts
- tests/unit/features/jobs/dependency-warnings.test.ts
- tests/unit/features/jobs/job-card-validation.test.ts
- tests/unit/features/jobs/job-members-domain.test.ts
- tests/unit/features/jobs/job-scheduling-consumers.test.ts
- tests/unit/features/jobs/job-upgrade-domain.test.ts
- tests/unit/features/jobs/job-workspace-domain.test.ts
- tests/unit/features/jobs/work-order-selection.test.ts
- tests/unit/features/jobs/work-orders-domain.test.ts
- tests/unit/features/scheduling/batch-conflicts.test.ts
- tests/unit/features/scheduling/capacity.golden.test.ts
- tests/unit/features/scheduling/job-demand-advisory.test.ts
- tests/unit/scope/manifest-derivations.test.ts
- tests/unit/scope/manifest-invariants.test.ts
- tests/unit/scope/manifest-shape.test.ts
- tests/unit/scripts/ci/checkpoint-dispatch.test.ts
- tests/unit/scripts/ci/verify-development.test.ts
- tests/unit/scripts/pr-feedback-app-permissions.test.ts
- tests/unit/scripts/pr-feedback-runtime.test.ts
- tests/unit/scripts/pr-feedback.test.ts
- tests/unit/scripts/verify/ci-native-test-reports.test.ts
- tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts
- tests/unit/server/authz/command-enrollment.test.ts
- tests/unit/server/authz/job-access.test.ts
- tests/unit/server/authz/permission-matrix.test.ts
- tests/unit/server/authz/phase-a-surface.test.ts
- tests/unit/server/bookings/job-facts.test.ts
- tests/unit/server/bookings/job-scheduling-protocol.test.ts
- tests/unit/server/commands/documents-lifecycle.test.ts
- tests/unit/server/commands/documents-signed-access.test.ts
- tests/unit/server/commands/envelope-core-edges.test.ts
- tests/unit/server/commands/envelope-core.test.ts
- tests/unit/server/commands/file-validation.test.ts
- tests/unit/server/commands/files/validate-upload-file.test.ts
- tests/unit/server/commands/job-card-validation.test.ts
- tests/unit/server/commands/work-order-file-contract.test.ts
- tests/unit/server/commands/work-orders-db.test.ts
- tests/unit/server/read-models/document-context.test.ts
- tests/unit/server/read-models/document-sources.test.ts
- tests/unit/server/read-models/documents.test.ts
- tests/unit/server/read-models/job-events.test.ts
- tests/unit/server/read-models/job-work-orders.test.ts
- tests/unit/server/read-models/job-workspace.test.ts
- tests/unit/server/read-models/my-jobs.test.ts
- tests/unit/server/storage/document-signed-access-attestation.test.ts

## Context Files

- _bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md
- _bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md
- _bmad-output/implementation-artifacts/spec-16-3-arbetsorder-2.md
- _bmad-output/implementation-artifacts/spec-16-4-projekt-upgrade-and-job-card-semantics-2.md
- _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md
- docs/process/agent-model-routing.md
- docs/process/development-completion-policy.md

## Excluded From Review Set

- tests/fixtures/golden/scheduling/capacity.json — format not scorable by the ledger
