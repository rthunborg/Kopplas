---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-20'
storyId: '15.4'
storyKey: 'spec-15-4-time-reporting-filing-timesheet-review'
storyFile: '_bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-spec-15-4-time-reporting-filing-timesheet-review.md'
generatedTestFiles:
  - tests/integration/commands/time-reports.int.test.ts
  - tests/integration/rls/time-reports.rls.test.ts
  - tests/integration/read-models/time-reports.int.test.ts
  - tests/integration/notifications/time-report-nudge-producer.int.test.ts
  - tests/e2e/time-reports.e2e.spec.ts
  - tests/integration/components/time-reports.test.ts
  - tests/unit/features/time-reports/validation.test.ts
  - tests/unit/features/time-reports/domain.test.ts
  - tests/unit/features/time-reports/action-state.test.ts
inputDocuments:
  - .agents/skills/bmad-testarch-atdd/SKILL.md
  - _bmad/tea/config.yaml
  - AGENTS.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - _bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md
  - _bmad-output/auto-bmad/preparation/story-15-4/current-contracts-and-design.md
  - _bmad-output/auto-bmad/preparation/story-15-4/implementation-ownership-handoff.md
  - _bmad-output/auto-bmad/preparation/story-15-4/ownership-inventory-successor.md
  - package.json
  - vitest.config.ts
  - playwright.config.ts
---

# Story 15.4 ATDD checklist

## Preflight and mode

Rasmus; Create mode selected autonomously as assigned. Approved nine-AC spec is frozen. HEAD 38b3a60257e32a482fca93e840fd7e5c858e1f86. Test stack auto-detects frontend (Next/React plus Playwright; actual SQL boundaries are covered using existing Vitest integration patterns). Node unit runner and production Playwright configuration exist. Local dependencies are available; managed services/runtime are deliberately not admitted in P4. AI generation from approved requirements, no recording or legacy evidence. User confirmations in steps 1–3 are answered by the authorized autonomous delegate.

## Strategy and recorded routes before dispatch

- TEA parent: gpt-6.1-sol High; sensitive auth/RLS, replay, serialization and atomic audit contracts.
- Required step 4A child: gpt-6.1-sol High, context-free; owns only four allocated new command/RLS/read-model/nudge suites and tests/support/time-reports-atdd.ts. Structured output at _bmad-output/test-artifacts/atdd-15-4-api-worker.json. No execution/resources.
- Required step 4B child: gpt-6.1-sol High, context-free; owns only tests/e2e/time-reports.e2e.spec.ts and tests/e2e/support/time-reports-atdd.ts. Structured output at _bmad-output/test-artifacts/atdd-15-4-e2e-worker.json. High for actual actor/tenant fixture and committed-response-loss proof design. No execution/resources.
- Parent owns allocated unit/component tests and this checklist/summary. Children are not alone and must preserve each other's edits. Both children must finish before aggregation. No recursive effort-only delegation.

Capability probe: collaboration.spawn_agent available; no independent agent-team lifecycle API. Config auto therefore resolves subagent. Pact tool-list probe: no Pact tools, pact_mcp_reachable=false; no broker call. Contract-test relevance gate closed: no independent HTTP provider/consumer contract introduced; no Pact package installed. Playwright-utils flag true but package absent; its two-gate mandate inactive. Existing Playwright and direct Supabase test factories apply, with no new dependency or unallocated merged-fixture path.

## Planned AC mapping

| AC | Required development proof | Level / priority |
| --- | --- | --- |
| 1 | Own booking prefill/edit and standalone filing, persisted own week | Command + essential browser P0/P1 |
| 2 | Exact actor-bound retries, changed payload conflicts, duplicates converge, unknown result stays unsent; no partial audit | Command + state + browser P0 |
| 3 | Own week only, exact totals, chips/missing weekdays, failed read not zero | Domain + read model + component P1 |
| 4 | PL/Admin complete filtered paged totals/standalone group; frozen booked comparison; annotation | Read model + command + browser P0/P1 |
| 5 | Existing-runner bounded frozen tenant cursor; current eligible roles/preferences/report absence; atomic dedupe in_app only | Nudge SQL/producer P0 + domain P1 |
| 6 | Exact minutes/date, both DSTs, locked current own assignment and same-tenant references; standalone needs no profile | Unit + command P0/P1 |
| 7 | Annotation CAS/latest retry, stale refresh, immutable core/no direct DML | Command + RLS P0 |
| 8 | Independent SQL union-role authority, own/review/anonymous/revoked/foreign projections and RPC/producer ACL | RLS + command + producer P0 |
| 9 | Stable authorized IDs, no money/approval, snapshot stable after booking edit; preserved booking/job/resolver contracts | Read + command + scope/regression P0/P1 |

## Red-phase rule

Installed workflow requires test.skip() on every persisted scaffold. They are not passing coverage. Step 5 may temporarily activate resource-free unit cases, run RED probes, restore skips, and report collection failure separately from executed assertion failure. P5 must activate all scenario IDs, wire actual production seams/factories, then execute focused and full required lanes. No skipped test proves an AC.

## Generated artifacts and exact counts

Both required workers completed and were awaited; outputs are `atdd-15-4-api-worker.json` and `atdd-15-4-e2e-worker.json`. Parent supplied units and SSR component scaffolds. API worker's first start was refused by model capacity before edits; one bounded same-model High retry completed. No model downgrade or further worker generation occurred. A single existing-schema fixture query was qualified from `select id` to `select p.id` to remove a join ambiguity; only its structured test snapshot was refreshed.

50 distinct test declarations in nine test files: 32 integration (10 command, 7 RLS, 6 read, 9 nudge), three essential Playwright, 11 unit and four SSR component. All 50 use `test.skip()`. There are **zero framework-parameterized declarations** (`test.each`/generated framework cases); the framework-case equivalent is 50, not the number of assertion vectors in loops. Integration and browser declarations were statically enumerated, not run or collected through service-dependent setup. Unit runner actually reported 11 skipped cases. Support is restricted to the two allocated helper paths. No helper placeholder throws a fabricated TODO outcome.

Embedded vectors remain inside these declarations: INT001 three own-role controls; INT003 three concurrent duplicates; INT004 13 invalid filing payloads plus two valid boundary controls; INT006 fresh/replay two; INT007 three reference mutations; INT009 filing/annotation two faults; RLS001 seven union-role rows; RLS003 six ordinary clients across private columns/DML; RLS005 six denied identities plus revoked control; RLS006 12 core mutations plus deletion; NUDGE003 five suppression reasons; NUDGE006 two current-state races; NUDGE004 27 recipients/pages; UNIT001 seven hour vectors, UNIT002 ten invalid strings, UNIT003 three valid/seven invalid dates, UNIT004 four note states, UNIT005 eight instant vectors, UNIT006 four calendar windows, UNIT008 four deltas. These are planned fixture/assertion vectors, not separately executed test counts.

Original TEA aliases reconcile as follows: TEA15.4-INT-001→INT001/002/004; INT-002→INT003/005/006/009; INT-003→INT008/010 and READ002/003; INT-004→NUDGE001–009; TEA15.4-RLS-001→RLS001–007; TEA15.4-COMP-001→COMP001A–D; TEA15.4-E2E-001→E2E001–003. Alias consolidation does not add executed coverage. The scenario IDs below are exhaustive.
| ID | Scenario (AC and priority in name) |
| --- | --- |
| 15.4-INT-001 | [P0] 15.4-INT-001 AC1 AC6 AC8 own planned booking files exact submitted minutes for Admin PL and Montor |
| 15.4-INT-002 | [P0] 15.4-INT-002 AC1 AC6 standalone requires neither link nor profile and deliberate same-day rows stay distinct |
| 15.4-INT-003 | [P0] 15.4-INT-003 AC2 AC8 concurrent exact retry converges; changed content and another actor never reuse the result |
| 15.4-INT-004 | [P0] 15.4-INT-004 AC6 AC8 SQL rejects bad references and exact-minute/date boundaries without partial writes |
| 15.4-INT-005 | [P0] 15.4-INT-005 AC2 AC4 AC9 snapshot and exact replay survive live booking changes and removed assignment |
| 15.4-INT-006 | [P0] 15.4-INT-006 AC2 AC8 current SQL authority is rechecked after actual tenant-lock wait for fresh and replay |
| 15.4-INT-007 | [P0] 15.4-INT-007 AC6 AC8 locked assignment booking status and job relation cannot change before fresh filing |
| 15.4-INT-008 | [P0] 15.4-INT-008 AC4 AC7 annotation CAS latest exact retry and blank clear preserve every filed core field |
| 15.4-INT-009 | [P0] 15.4-INT-009 AC2 AC7 audit fault proves filing or review stage then rolls all effects back |
| 15.4-INT-010 | [P0] 15.4-INT-010 AC7 AC8 revoked reviewer cannot replay latest annotation and superseded attempt cannot overwrite |
| 15.4-RLS-001 | [P0] 15.4-RLS-001 AC7 AC8 raw RPC union roles authorize ReportOwn separately from Review |
| 15.4-RLS-002 | [P0] 15.4-RLS-002 AC3 AC4 AC8 own projection excludes peers; Review reads tenant standalone and linked rows only |
| 15.4-RLS-003 | [P0] 15.4-RLS-003 AC7 AC8 direct DML and private replay columns denied for every ordinary role |
| 15.4-RLS-004 | [P0] 15.4-RLS-004 AC2 AC6 AC8 actor tenant and on-behalf spoofing fail SQL independently with no existence oracle |
| 15.4-RLS-005 | [P0] 15.4-RLS-005 AC8 anon inactive revoked seller economy and platform-only identities gain no report surface |
| 15.4-RLS-006 | [P0] 15.4-RLS-006 AC7 AC9 database core-field guard protects rows even beyond direct-grant denial |
| 15.4-RLS-007 | [P0] 15.4-RLS-007 AC7 AC8 forced RLS exact safe column ACL and checked RPC security survive direct catalog inspection |
| 15.4-READ-001 | [P1] 15.4-READ-001 AC3 AC8 own week totals chips and missing weekdays expose only caller rows |
| 15.4-READ-002 | [P0] 15.4-READ-002 AC4 AC8 complete review pages honor person job week filters and standalone groups |
| 15.4-READ-003 | [P1] 15.4-READ-003 AC4 AC9 booked-at-filing delta stays frozen and standalone has no fabricated booked comparison |
| 15.4-READ-004 | [P0] 15.4-READ-004 AC3 AC4 AC8 failed first page cannot publish success or zero totals |
| 15.4-READ-006 | [P0] 15.4-READ-006 AC3 AC4 AC8 later-page transport failure with real persisted prefix is an explicit read failure |
| 15.4-READ-005 | [P0] 15.4-READ-005 AC1 AC6 AC8 current selectors prefill own real instants; manager visibility never implies assignment |
| 15.4-NUDGE-001 | [P0] 15.4-NUDGE-001 AC5 AC8 frozen seven completed Stockholm dates exclude weekend today future old and reported day |
| 15.4-NUDGE-002 | [P0] 15.4-NUDGE-002 AC5 AC8 adapter uses one scoped checked RPC injected client and leaves raw booking ACL revoked |
| 15.4-NUDGE-003 | [P0] 15.4-NUDGE-003 AC5 AC8 current opt-out inactive role loss archived profile and cancelled booking suppress recipients |
| 15.4-NUDGE-004 | [P0] 15.4-NUDGE-004 AC5 AC8 more than25 real recipients continue stable frozen scoped cursor without gaps duplicates or fact return |
| 15.4-NUDGE-005 | [P0] 15.4-NUDGE-005 AC5 duplicate concurrent hourly retries emit zero new notification or audit effects |
| 15.4-NUDGE-006 | [P0] 15.4-NUDGE-006 AC5 AC8 tenant lock checks current preferences and membership after actual blocked producer |
| 15.4-NUDGE-007 | [P0] 15.4-NUDGE-007 AC2 AC5 filing committed before serialized nudge predicate suppresses notification |
| 15.4-NUDGE-008 | [P0] 15.4-NUDGE-008 AC5 atomic system audit failure verifies inserted recipient-date nudge then rolls it back |
| 15.4-NUDGE-009 | [P0] 15.4-NUDGE-009 AC5 AC8 existing authenticated jobs dispatch passes exact tenant and frozen run instant to real nudge adapter |
| 15.4-E2E-001 | [P0] 15.4-E2E-001 own booking editable prefill → filed report → persisted own week |
| 15.4-E2E-002 | [P0] 15.4-E2E-002 no-profile standalone at 360×640 keeps unsent input through failure/lost commit and keyboard same-attempt retry |
| 15.4-E2E-003 | [P1] 15.4-E2E-003 PL/Admin complete person/job/week review totals and attributed annotation survive reload |
| 15.4-COMP-001A | [P1] 15.4-COMP-001A AC1 AC2 unsent failure retains labelled values and explicit retry |
| 15.4-COMP-001B | [P1] 15.4-COMP-001B AC2 pending is announced without submitted success |
| 15.4-COMP-001C | [P1] 15.4-COMP-001C AC3 failed week read is connection error with retry rather than zero total |
| 15.4-COMP-001D | [P1] 15.4-COMP-001D AC4 AC9 standalone comparison remains absent and review cannot approve |
| 15.4-UNIT-001 | [P1] 15.4-UNIT-001 AC6 locale decimal hours preserve exact whole minutes |
| 15.4-UNIT-002 | [P0] 15.4-UNIT-002 AC6 rejects nonminute zero negative nonfinite and integer overflow without rounding |
| 15.4-UNIT-003 | [P1] 15.4-UNIT-003 AC6 real Gregorian report dates include leap day and exclude rollover |
| 15.4-UNIT-004 | [P1] 15.4-UNIT-004 AC1 AC6 bounded note normalization clears blanks without truncating meaning |
| 15.4-UNIT-005 | [P1] 15.4-UNIT-005 AC6 Stockholm DST prefill uses elapsed instants not wall-clock subtraction |
| 15.4-UNIT-006 | [P1] 15.4-UNIT-006 AC5 seven completed Stockholm dates filter weekends and never extend window to seven weekdays |
| 15.4-UNIT-007 | [P1] 15.4-UNIT-007 AC3 own weekly minutes and missing-day indicators do not infer hour completeness |
| 15.4-UNIT-008 | [P1] 15.4-UNIT-008 AC4 AC9 delta is report minus frozen booked-at-filing minutes and standalone stays absent |
| 15.4-UNIT-009 | [P0] 15.4-UNIT-009 AC2 unknown filing outcome preserves exact payload and attempt until confirmed |
| 15.4-UNIT-010 | [P0] 15.4-UNIT-010 AC2 failure never claims submitted and definite rejection permits correction |
| 15.4-UNIT-011 | [P1] 15.4-UNIT-011 AC3 AC7 old reads and superseded annotation responses require refresh |

## Actual bounded verification

- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/time-reports/validation.test.ts tests/unit/features/time-reports/domain.test.ts tests/unit/features/time-reports/action-state.test.ts`: native exit 0; 11 tests, 0 pass, 0 fail, 11 skipped. This verifies skip declarations only.
- Same command with only these three new files temporarily activated: native exit 1; 11 tests, 0 pass, 11 fail, 0 skipped. All failures are `ERR_MODULE_NOT_FOUND` for planned validation/domain/action-state modules, before behavioral assertions. The runner entered test callbacks and failed at deferred import; this is **missing-seam RED**, not a database collection error or executed behavioral assertion failure. Every original scaffold byte was restored in `finally`. Raw output is `atdd-15-4-red-probes.json`.
- `pnpm exec tsc --noEmit --pretty false`: native exit 0. Scoped ESLint over the 11 generated TS test/support files: native exit 0, 0 errors, 8 unused-destructuring warnings in E2E core comparison. No production static/build gate is inferred.
- Static scaffold check: 50 unique scenario IDs, 50 skipped declarations, no active tests/only, structured worker test contents match their actual files, both workers successful. Zero framework-parameterized cases; loop vectors are not extra runner counts. No service-dependent Vitest/Playwright setup was invoked.
- Conservation only: 19 frozen bindings; 17 entries compared individually to existing manifests, no mismatches, and both self-manifest files proven by the original 19-file aggregate. Aggregate SHA256 remains `c2ade38ad3a1936acca47b03755c7cdd35be681d4600fe1255ea29f9aa4eeb24`. Spec raw SHA256 remains `7933d020fba0986d283294cb94f85859a58d1fdc83f884a4d29e8b69751c89bb`; kernel remains `3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb`. Receipt: `atdd-15-4-preservation.json`. This did not rerun spec validation.

**Executed acceptance assertions: 0 passing, 0 failing. DB/browser/Storage execution: 0.** Predecessor CI is not story15.4 evidence. Source/SQL/config/dependency/spec/preparation/SRO/delivery edits: none. Root's concurrent state change is outside this delegate. Root alone owns Git, admission, timers, state, CI and runtime lifecycle. No browser sessions/resources started, so no lifecycle teardown applies.

## Mandatory P5 activation and implementation checklist

All 50 IDs listed above are mandatory activation work, not coverage. Scope remains the approved nine ACs and ten tasks; no additional human decision is needed for these already authorized changes.

- [ ] T1: Implement validation/domain/headless state; bind the explicitly planned exports in UNIT001–011 to actual APIs without changing independent numeric/date/DST outcomes. Retain submitted-only state and immutable exact unknown request identity. Activate all 11; show missing-seam RED before green, then executed assertion results. SSR COMP001A–D props are planned adapters, not frozen component architecture; bind to the real headless component props and execute four body assertions. Browser owns interaction/focus claims.
- [ ] T2/T3: Recheck reserved migration collision, then create only the allocated forward migration; do not alter105–108. Implement checked SQL and ordinary request-bound envelope adapters. Bind planned RPC signatures/SQL columns/result/error mapping. Activate INT001–010 and RLS001–007. Direct SQL must independently authorize current active union roles (Own Admin/PL/Montör vs Review Admin/PL), with actor/tenant derivation, same-tenant/current locked references, profile-free standalone, exact minutes and actor-bound current-authority replay. Test raw DML/private-column/anon denial, immutable core and annotation CAS without UI/envelope dependence.
- [ ] T4: Bind actual read-model API/DTO and execute READ001–006. Cross the real page bound, retain whole-result failure on later-page failure, complete person/job/week totals and unlinked groups. Pin stable authorized IDs and frozen nonmonetary comparison. No peer roster, private attempts, rates/money or approval state.
- [ ] T5: Bind existing injected jobs service client and real default dispatch tenant + frozen as-of/window/cursor. Activate NUDGE001–009. Add **mandatory SQL DST refinement inside NUDGE001 before green acceptance**: spring/fall Stockholm cross-midnight overlap and exclusive local-midnight end vectors, frozen local completed-date window, no today/future/weekend/extra eighth date. UNIT006 literal goldens do not prove SQL behavior. Keep current roles/preferences/own planned assignment/report absence under tenant serialization; fixed in_app only, count/cursor only, atomic sanitized system audit and dedupe adds neither effect. No second raw/unrestricted scan, credential import or booking-grant widening.
- [ ] T7/T8: Before running faults, register exactly `tests/integration/commands/time-reports.int.test.ts` and `tests/integration/notifications/time-report-nudge-producer.int.test.ts` once each in the existing `integration-audit-ddl.include` and exclude both from `integration-parallel`. Preserve job-runs/resolver entries, global parallelism, group orders and serial false fileParallelism. High source review must verify actual hook wiring, one-time collection and CI assertion reach. Confirm fixture cleanup for new report foreign keys/immutable triggers using only owned IDs; never adopt another stack, disable global triggers, edit seed hooks or sweep catalog names. Bind actual current tenant/role lock key/order and checked RPC signatures; all pending tasks settle before exact UUID/correlation/stage fault removal, rollback snapshots and catalog-absence proof.
- [ ] T6/T9: Confirm the new UI's accessible labels and selectors in source/production browser. Activate E2E001–003, using ordinary authenticated commands and physical row/audit proof. Append only `tests/e2e/time-reports.e2e.spec.ts` to `scripts.test:smoke`; retain existing Auth/Jobs-depth/resolver files/reporters. Keep three allocated caller pages limited to minimal current-own metadata; no peer picker/Bookings.Manage elevation. No mocked success, next dev, offline queue or on-behalf filing. Existing factory cleanup and lost-response barriers require actual runtime verification.
- [ ] T8/T10: Preserve manifest/H4 exhaustive enrollment, role/matrix/registry exact checks, v3 facts/proof domains/13 claims, tenant locking, job visibility, series/resolver/E13 controls and immutable105–108. Keep current/future actual E16 member/lead/date/jobscope and all24 schema assertions/smoke union when joined; do not import absent files. Root tracks overlap changes independently. Later High implementation author adds the required Suggested Review Order and delivery evidence; this frozen spec is deliberately unmodified and receives no automatic ATDD link.
- [ ] P5/Root: Run all activated focused suites and full `SUPABASE_TEST_REQUIRED=1 pnpm run test:int` in the Root-allocated exclusive isolated lane; report actual executed/skipped counts and exact head. Run required physical recovery-Storage integrity, current-history migration/seed/H4 evidence, production build/static/containment checks and essential smoke. Collect both fault files exactly once in their serial lane. Independent High review remains required under the three-round cap. An unexecuted scaffold, static collection, allocation or predecessor CI is never acceptance evidence.

Next workflow is the already approved High P5 build. Activate per current task, observe a behavioral RED where the real seam exists, implement minimally, prove green, then refactor without weakening the invariants. Bindings that differ only in names may be adapted; a material authorization/integrity ambiguity must be reported to Root before dependent work. Root holds all resource/CI/Git boundaries.

## Proposed selectors, fixture and mock inventory

No selectors were observed in a running UI. Existing login/scheduling selectors were read in source; all new selectors/labels are proposed and require P5 confirmation. New labels: Rapportera tid, Ny tidrapport, Datum, Start, Slut, Timmar, Jobb, Anteckning, Vecka, Person, Granska, Granskningsanteckning, Spara anteckning, Stäng, and explicit retry. Proposed new test-ID patterns: `time-report-submit-status`, `time-report-row-{id}`, `time-report-week-total`, `time-report-missing-{date}`, `time-report-review-total`, `time-report-person-total-{userId}`, `time-report-job-total-{jobId}`, `time-report-unlinked-total`, `time-report-booked-at-filing`, `time-report-booked-delta`, `time-report-review-status`, `time-report-review-attribution`. Region/dialog accessible names: Min vecka, Granska tidrapporter, Ny tidrapport, Granska tidrapport. Existing scheduling card identity is retained.

Fixtures: existing role-aware tenant/bookings factories read-only; fresh per-run tenants, actors, profiles, jobs, bookings, attempts/correlations and up to27 nudge recipients. Concrete new helper functions are deferred at import, with physical reports/audit/notification reads and ordinary checked commands. SQL/export/DTO names are explicitly planned. No raw report INSERT is used for successful filing setup; only isolated test SQL prepares authorized references and physically observes results. Fault infrastructure is restricted to exact UUID objects and scope. P5 must prove cascade/immutable-row cleanup for these new children before shared-lane use.

External-service success mocks: none. Failure injection: real failed/lost Next action response, real later-page transport failure, correlation-scoped actual audit-stage rejection. Every successful filing/annotation/nudge assertion requires genuine persistence. No broker/provider/email endpoint is introduced.

Playwright-utils deviations apply to `tests/e2e/time-reports.e2e.spec.ts` native test fixture/response waits and `tests/e2e/support/time-reports-atdd.ts` native routes/auth handling: package-install gate is false, so existing resourcePage/real-factory patterns are used. Adopting utility auth/merged/network wiring would be separately allocated framework work, not an implicit dependency installation. Pact is N/A (no boundary/package/tools); probe performed once, no broker calls.

## Validation and handoff result

Create workflow steps1–5 complete: approved inputs, AI mode, AC/priority/test-level map, both required child outputs, exact-path scaffolds and fixtures, RED compliance, recorded actual bounded probes, all50 activation requirements and immutable handoff bindings. No story/preparation backlink was written because explicit ownership requires preserving them. Template default `tests/api`/`tests/component`/faker paths are replaced by the project's allocated Vitest/Node/UUID patterns; no dependency is added. Linked transaction assertions prove one invariant rather than splitting an atomic outcome into independently green fragments.

Open questions: none. The planned API/SQL/selector bindings and necessary fixture/runtime proof are P5 work, not new product decisions. No development-complete/release-ready status is claimed.

Deferred release validation (unexecuted): QA/UX owns exhaustive device/view browser matrices, screenshots/visual comparison, manual accessibility/daylight/exploration and actual≤30-second one-hand timing; next action is scheduling owned release validation after development gates. Product/Architect owns approved performance targets and representative workload certification; next action is target approval then measurement. Delivery owner owns polish/deferred ledger reconciliation. No consequential authorization, persistence, SQL DST, rollback or essential interaction requirement is deferred to release.

No managed runtime was launched or left running. Root retains the no-deployment boundary, independent review, exact-head CI and merge/deployment approvals. Development completion and release readiness remain distinct.
