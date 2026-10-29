---
workflowType: testarch-test-review
mode: Create
headless: true
context_basis: pr_diff
generate_inline_comments: false
lastSaved: '2026-10-29'
stepsCompleted: [step-01-load-context, step-02-discover-tests, step-03-quality-evaluation, step-03f-aggregate-scores, step-04-generate-report]
lastStep: step-04-generate-report
---

# Story 35.2 bounded test-quality review

## Executive Summary

Recommendation: **Request Changes**. Quality Score: **71/100 (C)** under the literal installed registry. This is an executed, advisory test-quality audit of two existing source files. Three H3 findings are deterministic fixture/viewport selection, not evidence that observed product behavior conditionally bypasses assertions. No newly demonstrated production defect or missing behavioral coverage is asserted. The coordinator decides process finalization under the owner-approved advisory lane; this report grants no waiver and performs no test edits.

The review remains separate from the accepted product review and does not increment or restart the completed product-review round count. The root supplied fresh exact-head independent High product PASS in chat `01a1871c-8702-75f2-a70b-977ed21a74cb`; that is reused evidence, not this test-quality result.

## Reviewed Files

Authoritative `review_files`:

- `tests/unit/auth/login-submission.test.ts`: actual TSX handler with isolated React/client/router seams, nine active instances (seven failure fixture variants plus pending and response loss).
- `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts`: fourteen active instances; five inherited authority journeys, native POST privacy, and four new story journeys across two declared viewports.

Node assert and Playwright expect respectively remain consistent within each file. Both files are under 1,000 lines. No skipped/focused/fixme case was found. Auth trace/video/screenshots are disabled to protect credentials. The handler mock calls actual compiled TSX; it is not a mock asserted against itself. Browser contexts are isolated while fixture identity is immutable/shared under the existing serial runner.

## Excluded From Review Set

None. Source, story, delivery and test-design artifacts are read-only context and do not score as tests. Existing role/DB/RLS suites are supporting context rather than an expanded whole-suite review.

## Context and source

`context_files` are the supplied 35.2 adapter/canonical specification, approved High test design, login TSX, Playwright configuration and canonical delivery. `context_basis=pr_diff` means caller-supplied implementation context, not an assertion that a new PR was created. Product source is accepted `f598bb18b4322bf55ac89db6db69a41f3eb6bfd8`, merged product tree `8f9bcf8d2a0cd8a2b65fa7ad6c1fd7e236b85ff9`. `input-provenance.json` records bytes read at audit time.

## Convention Baseline

Actual closest-directory-first source scan: 556 files outside the review set, 40 sampled. The exact lexical tie-break sample, patterns, adoption counts and statuses are retained in `convention-baseline.json`. Priority markers: established 27/40; test-id signal: established 31/40; network-interception signal: emerging 17/40; factory signal: established 20/40; fixture signal: emerging 7/40; playwright-utils literal: emerging 3/40. Behavioral descriptions and assertion dialects were read from the sampled names/imports/setup signals; both are established. These are file-level adoption signals, not counts of passing tests.

`tea_use_playwright_utils=true`, but its package is absent from `package.json`. Therefore M9/L9 do not exist for this run; no per-file library deduction. Future framework adoption would require the dependency, merged fixtures and an auth provider. No Pact artifact/package/contract boundary is in scope; M10 and Pact configuration/mobile rows are inapplicable. Exact word-boundary/name tool discovery found no SmartBear/Pact tools; no broker call occurred.

## Quality Criteria Assessment

| Criterion | Status | Basis and scope |
| --- | --- | --- |
| BDD / behavioral names | PASS | L5 convention; names describe outcomes; Given/When/Then comments in handler cases |
| Test IDs / selectors | WARN | L3 convention (31 of 40 sampled); five source locations use text/bare tags; role/label locators otherwise dominate |
| Priority markers | WARN | L2 convention (27 of 40 sampled); five inherited names omit markers |
| Hard waits | PASS | H1 Absolute; held promises and observable expectations, no timer ordering |
| Determinism | FAIL under rubric | H3 Absolute; three fixed-input expectation selections below; all variants execute |
| Isolation | PASS for state; WARN grouping | H4/C5 do not fire; M4 top-level handler suite grouping fires |
| Fixtures / factories | PASS | Reuse actual immutable fixture and local fresh harness; no threefold duplicate domain payload or existing factory bypass found |
| Network-first | WARN | M1; helper registers readiness after navigation; submit-time Auth route is before triggering submit |
| Explicit assertions | PASS | C3/C4/C6/M6; actual outcome assertions, pending promises awaited/released |
| File size / duration | PASS within static review | H5 absent; duration not measured now; no independent duration PASS inferred from source |
| Disabled/focused tests | PASS | C1/C2 absent in authoritative set |
| Utility adoption / Pact / mobile | N/A | Run-level package/relevance preconditions above |

## Critical Issues (Must Fix)

None (`CRITICAL=0`). No assertion against itself, assertion-free test, focused test or undocumented disabled case was found.

## Registry Findings and Recommendations

| Row / severity | File and exact lines | Finding and bounded interpretation |
| --- | --- | --- |
| H3 / HIGH | handler `:151` | Expected message, disabled action and retry path depend on one of seven statically enumerated failure inputs. The registry literally forbids conditional expectation selection. Every configured variant executes; this is not branching on observed UI success/failure. A later authorized refactor could move explicit expected outcomes into the case table. |
| H3 / HIGH | browser `:268` | >=44px geometry assertions are specific to the fixed 360px case. Both declared viewports execute. A later named phone-only case can satisfy the rubric without losing assertions. |
| H3 / HIGH | browser `:380` | Reduced-height reachability assertions apply to the declared phone viewport. This deterministic applicability selection is not an observed-result skip; preserve it if restructuring. |
| M4 / MEDIUM | handler `:1` | Nine top-level instances lack describe/context grouping despite identifying story/scenario in names. Later suite grouping is structural. |
| M1 / MEDIUM | browser `:60` | Shared `signIn` navigates before registering hydration/data expectations. Hydration polling is post-navigation, and therefore fails the literal before-navigation rule. Existing subsequent current-user/tenant assertions are active; no auth coverage gap is inferred. |
| L2 / LOW, five locations | browser `:69,76,83,96,112` | Preserved inherited test names lack `[P0-P3]`; neighborhood convention established 27/40. No assertion change is proposed in this closeout. |
| L3 / LOW, five locations | browser `:106,304,326,418,460` | Bare main/form or getByText lookup rather than role/label/test-id; established signal 31/40. Form lookup deliberately exercises native requestSubmit; do not add a production state hook solely for this rubric. Same row/location at line326 is deduplicated. |

Registry H3 applies literally to expected-value selection; severity is pinned and cannot be lowered by context. Preparatory branches at browser lines337/341 merely choose focus setup and do not conditionally assert, so they receive no separate H3 finding. Fixed nonempty loops do not establish missing assertions. No finding here demonstrates result-dependent assertion avoidance, cross-tenant leakage, unauthorized session grant, duplicated provider issuance or a product-reachable defect introduced by this story.

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -0 × 10 = -0
High Violations:         -3 × 5 = -15
Medium Violations:       -2 × 2 = -4
Low Violations:          -10 × 1 = -10

Bonus Points:
  Excellent BDD:         +0
  Comprehensive Fixtures: +0
  Data Factories:        +0
  Network-First:         +0
  Perfect Isolation:     +0
  All Test IDs:          +0
                         --------
Total Bonus:             +0

Final Score:             71/100
Grade:                   C
```

No across-every-file bonus is claimed: mixed inherited naming/data/fixture patterns, source-only isolation evidence, network-first finding and semantic/text lookups do not establish all bonus predicates. Deduplication uses registry row/file/location. Three HIGH findings deterministically yield Request Changes regardless of score. Structured dimension receipts and `test-review-summary.json` carry the same ledger.

## Best Practices and Runtime Evidence Limits

Tests call actual TSX, use held promises with finally-release, test same-turn native form events, preserve safe generic Swedish error text, distinguish uncertain transport outcomes, and use real cookie-bound server identity checks after reload. Browser native POST checks prove URL privacy, not successful no-JavaScript login. The configured production server avoids development HMR. Serial shared-fixture ownership is intentional and is not a parallelization finding.

Exact-head CI [40846238540](https://github.com/rthunborg/Kopplas/actions/runs/40846238540) is reused from canonical delivery: 3,744 unit pass/zero skips; DB 2,146 pass/52 pending, separate storage one pass; browser 73 expected + one flaky, zero unexpected/skipped. No new browser/test execution, burn-in, runtime-duration measurement or credential trace was produced by this audit. One retry remains recorded. Coverage is excluded from this ledger and belongs to `traceability-matrix.md`.

## Decision

Recommendation: **Request Changes** (advisory test-quality rubric). The report is complete and honest with open structural recommendations. It is not a production-defect verdict, a waiver, a release approval or a demand to alter tests in this process-only scope. Preserve all actual scenarios and their authority/unknown-outcome limits if a separately authorized follow-up restructures tests.

## Workflow Execution and Validation

Installed Create/headless steps applied with supplied review/context files and output override. Coordinator-approved sequential worker-step evaluation retained four dimension JSON outputs; aggregation used those exact receipts and the registry's deduction/recommendation functions. No nested agent or parallel-speedup claim. Configuration/customization and completion hooks resolved; no nonempty hook. Checklists checked for identity, registry attribution, exclusions, count/score consistency and evidence limits. No inline comments, test edits, browser session or managed resource were created; cleanup is not outstanding. `release_ready=false` and original REL-1/2/3 ownership remain.
