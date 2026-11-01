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

Exactly one approved story, AC1–AC7. Operative admission is `../specs/spec-design-35-5/stories/35-5-authorized-responsive-shell.md` and `../specs/spec-design-35-5/source-binding.json`, approved base `ebb1311e`. Frozen source `dt-2026-10-23-test-design/slice-35-5.md`, SHA256 `80578a8d8522ba2987b9963e6d2a7197b9c1ec9f5787635bfae944f8f6c65a03`, retains its v1 IDs, applicability and historical provenance unchanged. Current execution uses only the expressly approved operative-v2 four-row correction below. Canonical source SHA256 `90c20699b840d864f62769b6d4f51dce6ac7a77ee460571531ef0eb4ed31988b`. Historical preparation-only blockers are superseded only as expressly stated by operative admission; they are not silently edited.

Scope: grouped presentation of the existing server-filtered navigation DTO in `src/components/app-shell/AppShell.tsx`; all new or changed executable assertions go only in `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`. Other consumers are read-only. Source binding contains the bounded reviewed ownership/post-35.4 reconciliation; no broad census repeated. Route: tea_epic / standard / gpt-6.1-sol Low, supplied by root. No new sensitive authority judgment is made: existing checked server authority and original sensitive expectations are inherited. A new authority/privacy decision must be separately routed to recorded Sol High before proceeding.

Seven AC scenario groups: two P0, five P1; five operative-v2 owned state subcases overlap those groups and are not five additional independent test-count claims. Four v1 owned-positive duties are expressly retired by the approved correction, with original identities retained as inherited regression provenance only. Four scoped risks, two high. Runtime executions in this phase: zero.

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
| AC6 / E35-5-T-AC6 | P1 / E2E + inherited regression | Exercise the five operative-v2 Applies states below at actual existing seams. Error-retry uses the existing mounted SignOutButton's definite undispatched controlled failure, retained server-confirmed current session, then explicit same-command real retry and actual logout outcome. The four corrected rows preserve only actual affected source-owner regression behavior/identities; unbound inherited rows earn no coverage. Denial differs from empty; failed requests never claim success; file authority remains inherited. | Record actual local Auth matcher/query and controlled failure boundary; SDK/runtime unverified until execution. No synthetic success or retired positive-state coverage claim |
| AC7 / E35-5-T-AC7 | P0 / existing unit/integration + focused shell E2E | Read-only inherited commands, permission projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file locks remain unchanged. Run applicable required CI/integrity suites and essential shell smoke; no pending/Phase C exposure. | Reuse unchanged reviewed evidence only with verified provenance; no new money/security policy |

The inspected allocated role suite currently has five cases: Säljare server-nav/landing (P0), Montör generic denied settings (P0), Montör no monetary values (P0), Säljare customers without cost/margin (P1), and absent calculation-origin quote creation (P0). These are source inventory, not executed 35.5 coverage. Its current fixture type directly declares only saljare and montor. The frozen family also names tenant_admin/projektledare/ekonomi; bind those only through already available authoritative role-harness fixtures. Do not invent credentials or extend fixture infrastructure. If a required case cannot be expressed within the existing harness and allocated file, record the exact missing seam and seek bounded allocation amendment through root.

## Operative-v2 state binding — approved 2026-11-01

The operative-v2 owned rows are `loaded`, `denied`, `revoked`, `error-retry` and `focus-dialog`; retain their `E35-5-STATE-<name>` / `E35-5-T-<name>` identities. Bind `error-retry` to the approved existing SignOutButton plan; record the controlled failure boundary and actual request/runtime result. Preserve the v1 identities and correction provenance for `loading`, `unavailable`, `connection-required` and `late-result`, now Inherited regression only for actual affected existing source-owner behavior. Unbound inherited rows earn no coverage. This expressly supersedes the four v1 owned-positive obligations; it does not declare them implemented or tested.

Rasmus expressly approved the exact reviewed correction through Coordinator chat `01a1160d-b5b1-7623-a8e8-54ef3dc537ed` on 2026-11-01 and instructed “Please proceed”, as relayed by root. Proposal and exact hashes are recorded in the operative story amendment and author receipt. `review.json` PASS covered the unapplied decision proposal only; targeted High confirmation of this actual amended delta remains pending. Frozen slice/spec/common contract and historical records are unchanged. This material ownership correction changes no product/test allocation, AC/state/test identity or N/A row.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loaded, denied, revoked, error-retry, focus-dialog | dirty-navigation, submitting, unknown, confirmed, stale, loading, unavailable, connection-required, late-result | empty, no-match, validation, locked |

P1 except denied/revoked P0 inherited enforcement. Test only actual existing seams; no shell endpoint or async state is invented.

| Name | Classification | Meaningful outcome / source binding |
| --- | --- | --- |
| loading | Inherited regression | Preserve only actual affected existing source-owner behavior. No exact inherited binding demonstrated; no coverage claim. Identity preservation alone is not positive loading evidence. |
| loaded | Applies | Current authorized response identity/freshness matches rendered facts; forbidden data absent from browser payload |
| denied | Applies | Generic denial with no private identity/fields or side effect; use existing caller |
| revoked | Applies | Existing revoked caller cannot use stale link/action to bypass current server decision |
| unavailable | Inherited regression | Preserve actual job-admission unavailable alert/retry in layout/RouteAccessBoundary. Original source regression `tests/unit/server/authz/job-access.test.ts` / `16.2-AUTHZ-004` only if affected; no allocated browser/server RPC-failure trigger or runtime coverage claimed. |
| connection-required | Inherited regression | Preserve only actual affected existing failure behavior. No exact inherited binding demonstrated; no coverage claim. Generic failure does not prove a connection explanation; no queue or new connection feature. |
| error-retry | Applies | Actual mounted SignOutButton with existing Säljare fixture: definite controlled local Auth failure before forwarding, retained server-confirmed current identity, explicit same-button real retry and actual login/protected redirect; exact plan below, runtime unexecuted. |
| late-result | Inherited regression | Preserve actual affected Jobs selected-child guards, original `tests/e2e/jobs/job-workspace.e2e.spec.ts` / `16.5-E04` and `16.5-E05`; no new shell A/B lifecycle and no runtime proof from source presence. |
| focus-dialog | Applies | Actual named drawer/sheet traps visible focus, closes correctly and restores trigger; motion respects preference |

Dirty-navigation, submitting, unknown, confirmed and stale remain inherited regression only when affected, now joined by the four corrected rows. Empty, no-match, validation and locked are unchanged N/A. Shell files are N/A; 35.4/35.11 destination/file contracts remain inherited. No exact affected inherited source binding means no coverage claim, not editorial N/A. Missing operative Applies seams remain a bounded escalation; no new command, product state, query/product path, dependency or harness is authorized.

### Existing SignOutButton error-retry plan — unexecuted

Use the allocated suite's existing Säljare fixture and actual mounted “Logga ut” command. Intercept only the configured **local** Supabase Auth origin, method `POST`, pathname `/auth/v1/logout`; retain and record the actual query. Return a definite test-controlled non-401/403/404 failure, such as HTTP 500, before forwarding to the backend. This is not response-loss simulation or proof of a real-provider rejection.

Assert persistent exact “Utloggningen misslyckades. Försök igen.”, same URL/tenant/current-user identity, and the enabled same “Logga ut” retry. Independently open a fresh real protected page in the same browser context and server-confirm the same signed-in identity after the failed undispatched attempt. Remove the fault, explicitly retry the same command against real Auth, and assert actual `/login` plus a fresh protected navigation redirect to login. Do not fulfill synthetic success or infer session authority solely from retained client UI.

Actual matcher/query, installed SDK failure/session handling and runtime outcome are **UNVERIFIED until execution**. Preserve `E35-5-STATE-error-retry` / `E35-5-T-error-retry`; no unknown-response or saved-record coverage is claimed.

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

Checklist: scoped prerequisites and canonical ACs loaded; all7 ACs mapped, all5 operative-v2 Applies states retained; four v1 owned-positive duties expressly retired with original identities/provenance preserved; N/A excluded and inherited boundaries explicit; unique scored risks with owners/deadlines; NFR thresholds/unknowns/evidence stated; execution/ranges/gates specified; evidence provenance separated; no placeholders or duplicate new test suite. Approval here means completed design under delegated autonomy, not fabricated PM/Tech/QA sign-off. Root may now advance the separate planning/build workflow; no follow-on skill was run here.
