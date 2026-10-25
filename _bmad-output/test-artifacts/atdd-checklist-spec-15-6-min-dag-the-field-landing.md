---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-25'
workflowType: 'testarch-atdd'
storyId: '15.6'
storyKey: 'spec-15-6-min-dag-the-field-landing'
storyFile: 'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/_bmad-output/implementation-artifacts/spec-15-6-min-dag-the-field-landing.md'
atddChecklistPath: 'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/_bmad-output/test-artifacts/atdd-checklist-spec-15-6-min-dag-the-field-landing.md'
generatedTestFiles:
  - 'tests/unit/server/read-models/my-day.test.ts'
  - 'tests/integration/scheduling/my-day.int.test.ts'
  - 'tests/unit/server/authz/phase-a-surface.test.ts'
  - 'tests/e2e/my-day.e2e.spec.ts'
  - 'tests/unit/features/my-day/domain.test.ts'
inputDocuments:
  - 'AGENTS.md'
  - 'docs/process/development-completion-policy.md'
  - 'docs/process/agent-model-routing.md'
  - '_bmad/tea/config.yaml'
  - '.agents/skills/bmad-testarch-atdd/resources/tea-index.csv'
  - 'package.json'
  - 'playwright.config.ts'
  - 'vitest.config.ts'
  - '_bmad-output/implementation-artifacts/spec-15-6-min-dag-the-field-landing.md'
  - '_bmad-output/auto-bmad/preparation/story-15-6/sensitive-assessment.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md'
---

# ATDD Checklist — 15.6 Min dag

## Context and strategy

Create mode selected autonomously under the delegated run. The approved `ready-for-dev` spec's Tasks & Acceptance / Acceptance Criteria is the contract. Stack detection: frontend (Next/React package, Playwright); server-domain behavior is covered by the existing Node unit and Vitest integration runners. Existing pinned toolchain and fixtures suffice for scaffold generation. Runtime database/server/browser resources remain unallocated.

AI generation is selected: requirements are explicit and there is no implemented page to record. No legacy URL, application, or evidence is used. Owner October 15/23 design authority, ADR-B009 connected 360×640, own-person privacy and Phase C exclusions apply. No implementation/spec/migration/package/state/Git changes are owned here.

| AC | Primary level and priority | Consequential scenarios |
|---|---|---|
| AC1 | Unit P0; E2E P0 | Pure Montör normalized landing, office-role union priorities, route/nav grant boundaries |
| AC2 | Domain unit P1; SQL integration P0 | Stockholm day/week/DST, half-open overlaps, once/order, current own planned rows for every role |
| AC3 | Read-model unit P0; SQL integration P0; E2E P0 | Exact minimal labels/address precedence, absence/redaction, same-job action and exact inline time prefill |
| AC4 | Read-model unit P0; SQL integration P0 | Server manifest seam, pending false branch zero jobs queries, direct true independently authorized, full own active jobs |
| AC5 | Read-model unit P1; integration P0; E2E P1 | Own unread generic booking.changed filtering before pagination, safe copy/routes, explicit notice failures |
| AC6 | Domain unit P0; read-model unit P0; E2E P0 | Current-request only, failure clears stale facts/actions, explicit retry and honest connected empty |
| AC7 | Unit/integration P0; essential E2E P0 | No money/source/peer payload, server-confirmed report and same-attempt unknown recovery, accessible usable floor |

Confidence: 8/10. Rationale: explicit approved AC1–7 and tasks define the four-argument RPC and planned module paths; existing runner configs, auth tests and scheduling fixtures supply concrete repository patterns. Unknowns: new helper exports and exact replaceable UI names will be author-confirmed at activation; assertions must preserve the product contract while adapting those seams.

## Integration capabilities

`tea_use_playwright_utils=true`, but `@seontechnologies/playwright-utils` is absent from package.json; the library mandate's two gates therefore do not bind. Reuse established project Playwright fixtures; no dependency or merged-fixture creation is authorized. Framework installation is a future separate proposal, not required for this story. Pact is irrelevant (no independently deployed consumer/provider contract); package absent and `pact_mcp_reachable=false` from one tool-list-only check. No broker query was made. Source fallback is the checked repository and approved story, never fabricated broker state.

## Execution route

This delegate is Sol 6.1 High for authorization, RLS, privacy and time integrity. Step-4 capability check finds subagents available; requested auto resolves to subagent. Required API/unit/integration and E2E workers run in separate available slots and are synchronously awaited before aggregation, under explicit Root confirmation. Each nested sensitive worker uses explicit Sol 6.1 High. Output envelopes are returned in worker final messages and consolidated here, rather than writing unauthorized `/tmp` files. Root owns aggregate routing/state artifacts. No review round is consumed.

## Development and release evidence

Scaffolds are acceptance intent, never passing coverage. Only bounded focused Node red activation is allowed now. Required development evidence later includes static checks, production build, full integration/RLS with SUPABASE_TEST_REQUIRED=1 and actual executed/skipped counts, direct recovery-storage integrity, independent High review and essential production-server browser smoke. No next dev or demo backend.

Exhaustive role/device/browser matrices, screenshots/design comparison, manual accessibility/daylight/exploration and polish remain separately owned QA/UX release validation, with concrete future actions in the final checklist. `release_ready=false`. No merge, deploy, provider or CI effects are authorized by this ATDD run.

## Story summary

A currently authorized Montör needs a connected own-person field landing that combines the selected Stockholm day's real bookings, current assigned active jobs and the existing time-filing flow. Managers using Min dag receive the same own-only projection. This story changes no capability grants, notification producers, calendar feed contracts, pending modules or Phase C surfaces.

Primary test level: direct SQL integration for the trust boundary; Node unit for deterministic projection/state; essential Playwright journey for composition. Separate component-runner setup is N/A: this repository has no approved component test dependency, and headless state is tested at unit level with real composition reserved for essential browser smoke.

## Implementation checklist and activation order

- [ ] T1 / AC2, AC6–7: activate the new domain cases individually. Implement and verify bounded Stockholm selection, ordering/once semantics, encoded maps and current-request state transitions. Keep domain/state independent of presentation.
- [ ] T2 / AC1–4, AC7: activate direct-RPC cases against Root-allocated local infrastructure. Implement only the already allocated migration path, with four-argument signature, authenticated-only ACL, explicit current membership/profile/assignment and own-only scope for managers. Retain eight-day bound and false-jobs separate branch. Verify exact response whitelists and direct true caller authorization.
- [ ] T3 / AC1–7: activate server-model cases individually. Derive authority and manifest state server-side, validate exact DTO/prefill, reject malformed or broadened data, and apply own unread notice category before pagination.
- [ ] T4 / AC2–7: activate the essential browser cases once the production-server runtime is allocated. Compose accessible date/week/day/refresh controls, current lists and inline existing TimeReportEntry. Failure clears stale actions; unknown time outcome uses the existing same-attempt reconciliation path.
- [ ] T5 / AC1: activate only appended 15.6 route cases; implement normalized pure-Montör landing and nav/direct-route authority. Resolve the historical Montör `/dashboard` assertion in the implementation author's authorized change, preserving its other checks; this ATDD run does not edit it.
- [ ] T6 / AC1–7: implementation author adds the new E2E file to the existing explicit `test:smoke` list. Preserve prior scheduling/recurrence/conflict/time/feed/jobs tests. Execute applicable static/build/full DB/RLS/direct recovery and essential browser gates with exact revision/counts.
- [ ] T7: author writes actual evidence and Suggested Review Order; Root retains delivery/status transitions, independent High review, review cap and publication ownership.

Effort estimate: not estimated by ATDD; the approved T1–T7 scope and implementer's inspected seams control sizing. This is not a new implementation authorization.

## Red–green–refactor handoff

New tests remain `test.skip` acceptance scaffolds until the author activates the current task. A skip is zero passing coverage. Activate a focused case, record its real failure before implementation, implement the smallest valid behavior, and rerun until green. Adapt proposed internal helper names or replaceable accessible labels only when the author records the final seam and preserves each assertion's product invariant. Do not add implementation solely to manufacture a red result or weaken acceptance to obtain green.

After all current cases execute, refactor only while retaining the consequential assertions and rerunning affected checks. Development completion requires all applicable development gates and independent sensitive review; Root's delivery gate is the sole status/finalization transition. This checklist does not alter story status.

## Manual story handoff

The input spec is immutable in this preparation assignment. Pass this checklist and its generatedTestFiles list directly to the implementation workflow; do not insert an ATDD subsection into the spec during this run. The author may reference these paths through the ordinary authorized implementation record. No extra fixture, package, migration or temporary-output path is created here.

## Planned commands after Root resource allocation

```powershell
# Pure unit cases: no server/database allocation required.
node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/my-day/domain.test.ts tests/unit/server/read-models/my-day.test.ts tests/unit/server/authz/phase-a-surface.test.ts
# Focused SQL lane, then the required full DB/RLS lane (needs allocated local DB).
$env:SUPABASE_TEST_REQUIRED='1'
pnpm exec vitest run tests/integration/scheduling/my-day.int.test.ts
pnpm test:int
# Essential browser lane uses configured production build/server; needs Root allocation.
pnpm test:e2e tests/e2e/my-day.e2e.spec.ts
pnpm test:smoke
# Optional author diagnostics, only with allocated runtime.
pnpm test:e2e tests/e2e/my-day.e2e.spec.ts --headed
pnpm test:e2e tests/e2e/my-day.e2e.spec.ts --debug
# Required static/build gates before development completion.
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm build
```

The focused SQL and browser commands above are future handoff commands, not executed evidence. The full integration/RLS lane and direct recovery-storage integrity checks remain mandatory; focused evidence cannot replace them. No coverage percentage or performance claim is made.

## Deferred release validation

| Item | Owner | Status / evidence | Concrete next action |
|---|---|---|---|
| Full role/device/browser matrix | QA | Deferred; no runtime evidence in ATDD | Execute at the final Phase B validation/stabilization checkpoint after integrated development evidence |
| Screenshot/design comparison and visual polish | UX / QA | Deferred; canonical written design read, no rendered comparison | Capture bounded references against current DESIGN/EXPERIENCE and record actual comparison outcomes |
| Manual accessibility, text enlargement, daylight and exploratory field checks | QA / UX | Deferred; essential automated focus/viewport checks are planned separately | Perform manual checks on the integrated connected flow and triage consequential defects separately from polish |
| E14 advisory/performance carry-forward | QA; Product / Architect for targets | Deferred per story; no volumes/targets invented | Triage the 48 advisories with evidence and obtain approved performance targets before claims |
| Final Phase B release checkpoint | Coordinator | Pending; owner October 22 requirement remains unexecuted | Open/assign after current approved Phase B epics are development-complete and integrated |

`release_ready=false`. Existing release/merge/deployment approvals remain required. Deferred work is not passed or waived.

## Knowledge and template application

Read workflow steps 01–05, both mandatory worker steps, aggregation, checklist and checklist template. Applied library-integration/playwright-utils mandates (including package-presence gate), Pact MCP relevance/reachability fallback, fixture-architecture, data-factories, component-tdd, network-first, test-quality, test-healing-patterns, selector-resilience, timing-debugging, evidence-integrity, confidence-gate and test-levels/priorities principles. Worker-specific source and fragment references are retained in the generation inventory below.

Template adaptations are deliberate: no new HTTP API exists, so API acceptance uses existing server-model and direct SQL contracts; no Pact/provider artifact is created. Existing local factories replace a new faker dependency. Related assertions that establish one security or journey invariant stay together rather than imposing one-assertion syntax. Shared fixtures, story-backlink edits, random temporary envelopes, broad browser recording and external service setup are outside this assignment. Required scoped artifacts and real red activation are the verification mechanism.

The current approved spec's four-argument RPC and jobs false-branch rules supersede the historical three-argument proposal in `sensitive-assessment.md`. Canonical DESIGN/EXPERIENCE and the incorporated Phase B UX supply current written authority; no legacy observation is newly claimed. Separate Supabase skill security principles were read as context; no Supabase feature/schema is implemented and no remote lookup or test query is executed in this scaffold-only run.

## Sensitive proof boundaries

An empty `activeJobs` array or an outer `EXPLAIN` FunctionScan does not demonstrate that the false branch made zero nested jobs-table/helper/join queries. The implementation author must retain an actual safe proving-side mechanism or explicit inspected branch evidence accepted by independent High review; do not invent query-count evidence, introduce global DDL/instrumentation during parallel tests, or silently weaken this invariant.

All current Bookings.View roles also carry TimeReports.ReportOwn in the existing matrix. Any isolated read-model case withholding ReportOwn is an explicitly simulated capability-port negative; it is not evidence that the live matrix contains such a role or a request to add one. Actual filing authority still revalidates current membership/profile/assignment through the existing command.

No `context.annotate` diagnostics are introduced: Root identified a verified installed Vitest 4.1.9 output-guard compatibility precedent. Native case names and ordinary assertions retain failure evidence without logging private DTOs or credentials.

## E2E generation inventory (worker B complete)

Route: `/root/atdd15_6_high/e2e_red`, explicit gpt-6.1-sol High; success envelope returned and synchronously received. Only `tests/e2e/my-day.e2e.spec.ts` written; 8 literal skipped journeys (5 P0, 3 P1), covering AC1–7. No worker runtime execution.

| Test | Priority | Invariant |
|---|---|---|
| 15.6-E01 | P0 | Montör mobile landing, current date, own ordered cards, explicit encoded map click, actual job identity |
| 15.6-E02 | P0 | Inline exact report prefill; real action commit with response lost; same UUID/payload retry; one physical report and audit |
| 15.6-E03 | P0 | Keyboard refresh failure clears old lists/actions; retry recovers current date; native pull gesture fetches changed persisted content |
| 15.6-E04 | P1 | Successful booking empty differs from assigned-jobs empty; jobless absence; accessible week arrows |
| 15.6-E05 | P1 | Own current created/in_progress jobs and operational designation; terminal/archived omission; actual job destination |
| 15.6-E06 | P1 | Own unread generic booking.changed source copy and safe existing route; no invented booking/date association |
| 15.6-E07 | P0 | Anonymous/missing grant/revoked route boundary and preserved office landing |
| 15.6-E08 | P0 | Manager own-person agenda at desktop, without others' cards/actions |

### Fixtures and mocks

Reuse existing `resourcePage`, `withTimeReportBrowserFixture`, sign-in, filingAttempt, dialog and physical report/audit snapshot helpers unchanged. The owned file adds lazy local fixture extension for two booking rows, one facility and existing-schema notices in fresh factory-owned tenants, with teardown. No shared factory/helper path is changed. Unit/SQL fixture details follow below.

No external provider setup is needed. E01 aborts external map navigation after the explicit click, and asserts no earlier map/geocoding requests. E02 observes and fetches the real Next filing action, proves the durable commit, then loses only its response. E03 faults the real read action to verify connection-required clearing. These are future assertions; none ran here. The read-action transport matcher is a proposed seam to reconcile against the final implementation, not a new endpoint.

### Required selectors and proposed seams

New proposed test IDs: `my-day-booking-{id}`, `my-day-job-{id}`. New proposed semantic regions: `Agenda`, `Mina jobb`, `Ändringar i planeringen`; date label `Datum`; week buttons `Föregående vecka`, `Nästa vecka`. Spec-pinned names include `Min dag`, `Uppdatera`, `Försök igen`, `Öppna jobbet`, `Rapportera tid`, `Anslutning krävs`, `inga bokningar ännu`. Existing TimeReportEntry/Form selectors, status ID and job-workspace-header are reused. Bind replaceable new names to the author's actual accessible composition before activation; no browser-verified selector claim.

### Playwright Utils deviations

The two-gate mandate does not bind because the dependency is absent. Existing fixture import/login and native route.fetch/abort/waitForResponse are explicitly documented in the E2E file (intro and E02/E03). They exercise real Next action transport and physical persistence rather than a fabricated REST mock. Optional auth-session/merged-fixture wiring requires a separate framework/dependency decision; this ATDD creates none. No Pact artifacts or broker calls.

## API/unit/integration generation inventory (worker A complete)

Route: `/root/atdd15_6_high/api_red`, explicit gpt-6.1-sol High; success envelope returned and synchronously received. It wrote only its four assigned test paths. Worker A returned 51 expanded skipped cases: P0=45, P1=6. Combined with worker B, there are **59 new skipped scenarios (P0=50, P1=9)**. Parameterized registrations expand at collection; source registrations and expanded counts are deliberately distinguished below. Five historical active authz cases are separate from this new-case total.

| File | Lines | Literal new skip registrations | Expanded new scenarios | Priority |
|---|---:|---:|---:|---|
| tests/unit/features/my-day/domain.test.ts | 140 | 10 | 14 | P0=11, P1=3 |
| tests/unit/server/read-models/my-day.test.ts | 223 | 12 | 18 | P0=15, P1=3 |
| tests/unit/server/authz/phase-a-surface.test.ts | 81 | 3 | 3 | P0=3 |
| tests/integration/scheduling/my-day.int.test.ts | 313 | 15 | 16 | P0=16 |
| tests/e2e/my-day.e2e.spec.ts | 448 | 8 | 8 | P0=5, P1=3 |

Expanded SQL and browser counts are generation/source inventory, **not runtime collection or executed coverage**. Expanded Node counts were observed by the focused Node runner. No generated test is a placeholder assertion. No new standalone API, component, shared factory or fixture file is created.

### Final AC-to-test map

| AC | Scaffold IDs and purpose |
|---|---|
| AC1 | A01–A03 normalized pure/mixed landing and direct/nav authority; R01–R02 cookie/current entitlement; INT01–INT04 ACL/current exact membership/profile/own scope; E01/E07/E08 usable landing and denial |
| AC2 | D01–D05 Stockholm day/week/DST/date/half-open/order/once; R01/R12 selected projection and independent empties; INT04–INT08 and INT15 current own rows, recurrence/shared/all-day/overnight, invalid bounds and >transport-page completeness; E01/E04/E08 actual composition |
| AC3 | D06 safe encoded map absence; R03–R06 exact whitelists/prefill/capability/absence; INT09/INT12/INT13 false-job redaction, facility→job override→job facility address precedence and booking role provenance; E01/E02/E04 destination and existing inline flow |
| AC4 | R07 pending server manifest false branch and no independent jobs-table/helper read; INT09 default-false output and withheld identity, INT10–INT11/INT14–INT15 direct true current job authority/relationship/lifecycle and complete own jobs; E05 current own designation/identity |
| AC5 | R08–R09 own unread booking.changed category before cap, generic safe notices/more link and explicit failure; E06 visible safe existing notice route; existing notification RLS remains required in full lane |
| AC6 | D07–D10 current failure clearing, old date/tenant/user/request rejection and honest empty; R10–R12 malformed/error/revoked/current empty; INT05 assignment/membership revocation; E03 current-date retry after clearing and actual pull gesture refresh |
| AC7 | R03 exact private-field stripping and inline prefill authority; INT04/INT09/INT10/INT13 privacy; E01/E02/E03/E08 usable 360×640/desktop, named keyboard controls, no overflow, actual persisted filing and identical-attempt recovery |

### File-local data and fixtures

Domain factories produce deterministic dates, boundary intervals and isolated in-memory rows. Server-model transport is an in-memory trace/filter/RPC harness; it proves the adapter's requests and output, **not RLS**. SQL cases reuse `withBookingFixture`, `seedReadFixtures`, `seedBookingParents`, ordinary authenticated clients and existing admin SQL helpers with file-local row-isolated seed extensions and existing teardown. No global DDL, trigger faults, query-stat reset, permission alteration or shared fixture edit is added.

INT09 compares an omitted fourth argument to explicit false. SQL case binding still requires the implemented checked function. Empty jobs output is expressly not nested-query proof. Current role matrix has no admitted Bookings.View + own relationship + false job_can_read combination; reachable ordinary sales denial and manager-no-relationship controls do not claim to isolate that impossible combination. Independent High implementation review must check the true branch's conjunction.

Google map provider/path/query and minimal DTO/helper export spellings are author-adaptable seams. HTTPS, safe address encoding, absence handling, explicit click, current own authority, exact filing identity/interval, privacy whitelists and failure semantics remain binding. Capability withholding is the explicitly simulated server-only negative described above.

## Step 5 validation and actual execution evidence

Toolchain observed locally: **Node v22.23.2; pnpm 10.24.0**. Supplied baseline: `aa4e3f9b5a4f1d6aef5897fdcdbb48348b352a1d`; this delegate does not mutate Git or claim an independent current-head lookup.

1. Ran `node --experimental-strip-types --check <path>` separately on each of the five owned test files. **All five native exits 0**. This proves TypeScript strip/parse syntax only, not typecheck/build/runtime correctness.
2. Ran `node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=tap tests/unit/features/my-day/domain.test.ts tests/unit/server/read-models/my-day.test.ts tests/unit/server/authz/phase-a-surface.test.ts`. Native exit **0**; **40 tests discovered, 5 passed (unchanged historical auth tests), 0 failed, 35 skipped (all new 15.6 unit scaffolds), 0 cancelled, 0 todo**. New-feature passing coverage: **0**.
3. Temporarily activated only D01 and R01 in the two new unit files, then ran `node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=tap tests/unit/features/my-day/domain.test.ts tests/unit/server/read-models/my-day.test.ts`. Native exit **1**; **32 discovered, 2 activated failures, 0 passes, 30 skips, 0 cancelled, 0 todo**. D01 failed `ERR_MODULE_NOT_FOUND` for absent `src/features/my-day/domain`; R01 failed `ERR_MODULE_NOT_FOUND` for absent `src/server/read-models/my-day`. This is intentional missing-implementation RED; neither reached its behavior assertions, so no product behavior is verified.
4. The activation command restored original bytes in `finally` and checked both SHA256 values. **SCAFFOLDS_RESTORED_BYTE_EXACT=true**. No existing auth test was changed or skipped. Final generated cases all remain `test.skip`.

No integration test, RLS suite, recovery-storage check, build, typecheck, lint, browser journey, server, database, Docker, WSL, CI, hosted provider or external service was executed/started/contacted. No runtime resource allocation or cleanup was needed. No passing runtime, development-complete or release-ready claim is made.

### Validated workflow checklist

- [x] Approved ready-for-dev story and clear AC1–7 loaded; existing runner/dependency/fixture configuration inspected.
- [x] AI generation and test-level/P0–P1 strategy recorded; sensitive route explicit High at each required nested handoff.
- [x] Both mandatory worker outputs received and successful; tests restricted to the five allocated paths with actual assertions and new-case skips.
- [x] Existing active auth assertions preserved; proposed seams and unsatisfied SQL nested-query proof explicitly documented.
- [x] File-local fixture reuse and cleanup, mock/selector needs, activation/tasks and exact handoff commands recorded.
- [x] Five parse checks and focused Node scaffold/temporary RED counts recorded honestly; restore hashes checked.
- [x] Immutable input spec retained; manual handoff paths recorded in frontmatter.
- [x] No browser session or temporary envelope file created; no orphan resource exists from this run.
- [x] Development checks and separate QA/UX release work retained; `release_ready=false`.

ATDD preparation is complete. Next workflow: the already authorized implementation lane activates and binds these cases task by task, obtains the required actual evidence, and retains independent High review. No implementation or code-review round is consumed by this preparation.
### Bounded E03 completion

The original E2E author completed one targeted scaffold amendment without a new broad review/generation cycle. E03 now uses native Chromium touch input (`touchStart` → `touchMove` → `touchEnd`), waits for the actual read and asserts newly persisted booking text replaces prior content while preserving current selected date. The proposed Agenda gesture surface, scroll owner and 140px distance must be bound to the final composition before activation. This remains required functional verification, not deferred visual polish. E2E total remains 8 and the full new inventory remains 59. Repeated only the changed E2E file's `node --experimental-strip-types --check`: native exit 0. No browser/runtime executed. Both mandatory worker steps and this bounded amendment are complete.
