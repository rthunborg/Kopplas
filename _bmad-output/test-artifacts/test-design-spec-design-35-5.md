---
workflow: bmad-testarch-test-design
workflowStatus: completed
runScope: epic-level
runKey: epic-spec-design-35-5
storyIds: ['35-5']
lastSaved: 2026-11-01
release_ready: false
---

# Test Design: spec-design-35-5 — Authorized Responsive Shell

Date: 2026-11-01. Author: TEA delegate for Rasmus. Status: design completed; implementation and runtime validation pending. This is the bounded binding of the approved frozen slice, not a fresh broad design or an implementation approval.

## Executive Summary and inputs

Exactly one approved story, AC1–AC7. Operative admission is `../specs/spec-design-35-5/stories/35-5-authorized-responsive-shell.md` and `../specs/spec-design-35-5/source-binding.json`, approved base `ebb1311e`. Frozen source `dt-2026-10-23-test-design/slice-35-5.md`, SHA256 `80578a8d8522ba2987b9963e6d2a7197b9c1ec9f5787635bfae944f8f6c65a03`, retains its IDs, applicability and historical provenance. Canonical source SHA256 `90c20699b840d864f62769b6d4f51dce6ac7a77ee460571531ef0eb4ed31988b`. Historical preparation-only blockers are superseded only as expressly stated by operative admission; they are not silently edited.

Scope: grouped presentation of the existing server-filtered navigation DTO in `src/components/app-shell/AppShell.tsx`; all new or changed executable assertions go only in `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`. Other consumers are read-only. Source binding contains the bounded reviewed ownership/post-35.4 reconciliation; no broad census repeated. Route: tea_epic / standard / gpt-6.1-sol Low, supplied by root. No new sensitive authority judgment is made: existing checked server authority and original sensitive expectations are inherited. A new authority/privacy decision must be separately routed to recorded Sol High before proceeding.

Seven AC scenario groups: two P0, five P1; nine owned state subcases overlap those groups and are not nine additional independent test-count claims. Four scoped risks, two high. Runtime executions in this phase: zero.

## Not in Scope

No new harness, fixture platform, workflow, SQL, dependency, server/auth implementation, client capability map, DTO expansion, identity selector, destination, file command, domain editor or Phase C surface. No product/test modifications, resources, git mutations, merge or deployment. Existing canonical navigation order and every supplied destination must remain intact. Do not regroup by constructing a second authority list.

## Risk Assessment and mitigation

P/I use 1 unlikely/minor, 2 possible/degraded, 3 likely/critical. Scores are planning judgments, not observed defects.

| ID | Category | Reachable regression risk | P | I | Score | Mitigation / owner / due |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | TECH | Grouping drops, duplicates or reorders a supplied destination, hiding an entitled route | 2 | 3 | **6** | Compare ordered rendered hrefs with approved current DTO/fixture expectations; preserve active child context; implementation/QA before development completion |
| R-002 | BUS | Phone drawer or shell blocks keyboard navigation, focus return or the current route journey | 2 | 3 | **6** | Essential 360×640 and desktop focus/close/reflow journey, AC2/4/5; implementation/QA before development completion |
| R-003 | DATA | Shell navigation bypasses an existing protected-input decision or adopts a late result for the wrong selection | 1 | 3 | 3 | Reuse current downstream guards and selected-child return regression; implementation/QA before development completion |
| R-004 | OPS | Historical 35.4 results are represented as fresh 35.5 runtime proof | 2 | 2 | 4 | Exact candidate, command, counts/skips and evidence provenance in delivery; root/QA before gates |

High risks remain planned mitigations until fresh candidate evidence exists. Residual risk: exhaustive device/manual combinations and unmeasured performance remain release work. Sensitive revocation/denial contracts are inherited P0 regression requirements; this design neither redefines them nor certifies their enforcement.

## Test Coverage Plan

P0/P1 express importance, not execution timing. Preserve these parent IDs in test titles or explicit assertion mappings; use descriptive suffixes only to disambiguate atomic assertions. QA/implementation owns runtime evidence for every row.

| AC / ID | Priority / level | Concrete assertions and fixture binding | Evidence disposition |
| --- | --- | --- | --- |
| AC1 / E35-5-T-AC1 | P1 / E2E | Existing authenticated role fixture: grouped ordered href sequence equals the existing authorized navigation expectation; no duplicate/lost destination, pending/E17/E18 action; tenant indicator, notifications and active nested-route marker retained. Desktop and drawer expose the same supplied links. | Extend allocated suite only; existing coherence tests reused unchanged |
| AC2 / E35-5-T-AC2 | P1 / E2E | Desktop sidebar 248px and topbar 56px at representative desktop; at 360×640 keyboard open named drawer, visible focus enters, Tab/Shift+Tab wrap, Escape/explicit close restore trigger; active route identified. Cancel existing protected navigation and assert URL/history/selected child remain before any committed transition. | Fresh rendered proof required; no new protected editor |
| AC3 / E35-5-T-AC3 | P0 / E2E + inherited authority integration | Preserve role landing and sign-out using current session; stale rendered capability cannot authorize denied navigation/action after revocation; return to the selected child retains identity. No identity chooser, client fallback or broader payload. Use existing checked role/revocation expectations without choosing a new grant. | Existing server/RLS tests retain original IDs; new shell composition evidence required |
| AC4 / E35-5-T-AC4 | P1 / E2E | Real connected Swedish record journey at 360×640 and desktop; actual owned phone actions ≥44px; touch/keyboard equivalent, overflow labeled, active identity visible. Enlarged text and virtual-keyboard/reflow inspection keep action/error reachable. Assert actual route/result, not screenshot alone. | Essential browser/contrast evidence before completion; exhaustive device/manual matrix deferred |
| AC5 / E35-5-T-AC5 | P1 / E2E | Actual shell drawer/adapted sheet name, focus containment, Escape/close/restore; existing downstream dirty-navigation and late-result guard preserved. Reduced motion only for actual changed motion. No new dialog/editor to populate a row. | Combine focus assertions with AC2, cite IDs rather than duplicate tests |
| AC6 / E35-5-T-AC6 | P1 / E2E + inherited regression | Exercise only the owned states below at the existing real consumer seam. Denial differs from empty, retained input remains unsent, failed requests never claim saved success. Preserve existing file consumer authority without adding shell files. | Controlled state evidence must identify mocked boundary; server enforcement needs inherited real proof |
| AC7 / E35-5-T-AC7 | P0 / existing unit/integration + focused shell E2E | Read-only inherited commands, permission projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file locks remain unchanged. Run applicable required CI/integrity suites and essential shell smoke; no pending/Phase C exposure. | Reuse unchanged reviewed evidence only with verified provenance; no new money/security policy |

The inspected allocated role suite currently has five cases: Säljare server-nav/landing (P0), Montör generic denied settings (P0), Montör no monetary values (P0), Säljare customers without cost/margin (P1), and absent calculation-origin quote creation (P0). These are source inventory, not executed 35.5 coverage. Its current fixture type directly declares only saljare and montor. The frozen family also names tenant_admin/projektledare/ekonomi; bind those only through already available authoritative role-harness fixtures. Do not invent credentials or extend fixture infrastructure. If a required case cannot be expressed within the existing harness and allocated file, record the exact missing seam and seek bounded allocation amendment through root.

## Owned state binding

Each row retains `E35-5-STATE-<name>` and `E35-5-T-<name>`; P1 except denied/revoked P0 inherited enforcement. Test at actual existing seam; do not invent a shell endpoint.

| Name | Meaningful outcome |
| --- | --- |
| loading | Delayed authoritative read preserves selected identity/structure; no false empty/success |
| loaded | Current authorized response identity/freshness matches rendered facts; forbidden data absent from browser payload |
| denied | Generic denial with no private identity/fields or side effect; use existing caller |
| revoked | Existing revoked caller cannot use stale link/action to bypass current server decision |
| unavailable | Explain actual unavailable source/module; no working-looking pending destination/sample success |
| connection-required | Failed connected request retains suitable unsent input with persistent explanation/explicit retry; no queue |
| error-retry | Definite failure has no success; explicit corrected retry resolves confirmed identity |
| late-result | Select A then B, resolve A last; A cannot replace B/current navigation and remains attached to A |
| focus-dialog | Actual named drawer/sheet traps visible focus, closes correctly and restores trigger; motion respects preference |

Dirty-navigation, submitting, unknown, confirmed and stale remain inherited regression only when affected. Empty, no-match, validation and locked are N/A. Shell files are N/A; 35.4/35.11 destination/file contracts remain inherited. An Applies label does not authorize creating a missing command or synthetic domain feature: if no existing seam reaches a planned state, report the precise binding limitation before implementation rather than mark it passed or delete the canonical ID.

## NFR Planning

| Category | Threshold / requirement | Risk | Planned evidence |
| --- | --- | --- | --- |
| Accessibility | Connected 360×640 and desktop; ≥44px phone targets; 248px desktop sidebar/56px topbar; named controls, visible trapped/restored focus; essential contrast/reflow | R-002 | Candidate-bound Playwright report plus actual essential visual/keyboard evidence, including enlarged text/keyboard limitation disclosure |
| Reliability | Explicit failure/retry, no false success, no late response replacing current selection, protected history preserved | R-003 | Focused real journey/state assertions and unchanged downstream guard regression |
| Security | Existing server-filtered DTO, role landing/current-session sign-out, generic denial, no payload expansion | inherited P0 | Existing required integration/RLS/containment reports and browser assertions; no mocked denial treated as enforcement proof |
| Maintainability | Two-path allocation; preserve unchanged 35.4 contracts and fixtures | R-001/R-004 | Diff review, static/type/lint/build and actual command/count provenance |
| Performance | Story-specific quantitative latency/load target UNKNOWN | R-004 | Retain current project gates; do not invent new SLO or benchmark. Later NFR assessment records missing measurement |

Scalability/compliance programs add no story-specific scope. Full NFR PASS/CONCERNS/FAIL belongs to the later evidence assessment.

## Inherited evidence and interworking

`35-4-post-dev-evidence-reconciliation.md` records successful normal CI41296065573 at `9242c43ec2fed71ae48e788fd052ce81969b058c`: integration 2163 passed/52 skipped (37 booking-command RED,14 booking-RLS RED,1 storage opt-in), service-unavailable skips0; smoke80 passed/0 failed/skipped/flaky; dedicated storage1 passed/0 skipped. Focused41296060468 records182 expected/0 unexpected/skipped/flaky against four existing file/job suites. These counts are reported historical evidence, not this delegate's executions or shell acceptance. Skips are never coverage. Preserve original assertions, revisions and qualification limits.

`35-4-closeout-gate-decision.json` reports PASS for 35.4 development only. `35-4-closeout-e2e-trace-summary.json` records source `232ceb9d6d17200fcd4e2906b48a51222268f393`, static contract inventory97 cases across5 files,7/7 ACs; that inventory is not a new runtime run. Neither report proves 35.5 drawer geometry, grouped links, focus, candidate visuals or new state assertions. Existing file/dialog/provenance/selection behavior is read-only regression scope; do not re-author its assertions here. Preserve 35.4 release obligations and E16/E20 caveats.

## Entry, execution and exit

Entry: root-qualified current ownership/base; planned story and exact allocation; existing isolated fixture availability; production Playwright server and admitted actual state seams. Missing seam or new authority decision is a bounded escalation, not scope expansion.

PR: run all focused functional assertions in the allocated suite plus applicable required project checks. Run everything in PRs if <15 minutes; retain required integrity gates regardless. Existing Playwright configuration controls parallelization; do not add workers/harness/config changes. Start with real login/landing and desktop/mobile shell smoke, then P0 retained authority/contracts, then P1 focus/state composition. Use configured `next build`/`next start`, never `next dev`. Runtime resources, when later needed, require root's resource-guard workflow; this phase starts none. Integration/RLS required runs use `SUPABASE_TEST_REQUIRED=1` and report executed/skipped counts. No tests target demo/production.

Nightly/weekly: no new lane. Exhaustive device/manual/visual release checks remain separately assigned release work, not automatic passing evidence.

Exit targets: all7 ACs explicitly traced; P0 100% and all consequential P1 assertions pass (general P1 minimum95% never excuses an essential failed AC); 100% security scenarios, no unmitigated high risks, overall trace coverage at least80% with every uncovered obligation explicit. Exact candidate static/build/focused integrity, independent review and essential browser evidence required. Initial changed-UI candidate visual gate/acceptance remains mandatory. Unexecuted and skipped cases cannot count as passed. Development complete differs from release ready.

## Resource estimates

Planning ranges including fixture binding and evidence capture: P0 ~2–4 hours, P1 ~4–8 hours, P2/P3 no new planned scope (0 hours), total ~6–12 hours / ~0.2–0.5 working weeks. These estimate verification work, not measured runtime or a commitment to broaden infrastructure. Existing CI resource costs are inherited. Allocation/fixture blocker time is excluded and must be reported.

## Assumptions, gaps and release ownership

No new product decision is open for test-design completion. Later implementer must verify existing full role/revocation/selected-child seams and record exact evidence at candidate. If unavailable within allocation, root owns exact amendment; no invented endpoint/credential/test. Quantitative performance threshold remains UNKNOWN, advisory for later assessment.

E35-5-REL-1 visual/device/composite contrast/reflow: UI owner; REL-2 manual/keyboard/screen-reader/daylight: QA/accessibility owner; REL-3 final Phase B consolidation: Coordinator. Named people and exact candidate assignment remain root-owned release records. This is no duplicate authoritative ledger. `release_ready=false`; no merge/deployment grant.

## Workflow validation and references

Epic-level create, single story, sequential output; frozen slice reused directly. Relevant knowledge: risk-governance, probability-impact, test-levels-framework, test-priorities-matrix, nfr-criteria, playwright-utils-mandate. Next/React/Playwright frontend detected from existing source and package. Playwright Utils package absent (same documented 35.4 dependency gate); retain existing guarded fixture and no new utilities/code examples. Pact is irrelevant to this presentation-only slice; no broker call or contract artifacts. Browser exploration deliberately omitted under process-only/no-resource assignment. No browser session created. Resolver attempt encountered sandbox/cwd problems; customization fallback read installed defaults (empty hooks/facts), no team override found; no completion hook action required. No broad census, source review round, runtime or git work performed.

Checklist: scoped prerequisites and canonical ACs loaded; all7 ACs mapped, all9 Applies states retained; N/A excluded and inherited boundaries explicit; unique scored risks with owners/deadlines; NFR thresholds/unknowns/evidence stated; execution/ranges/gates specified; evidence provenance separated; no placeholders or duplicate new test suite. Approval here means completed design under delegated autonomy, not fabricated PM/Tech/QA sign-off. Root may now advance the separate planning/build workflow; no follow-on skill was run here.
