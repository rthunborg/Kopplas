---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-19'
workflowStatus: 'completed'
workflowType: 'testarch-atdd'
tddPhase: 'RED scaffolds; one bounded source RED verified'
storyId: '16.1'
storyKey: '16-1-jobs-depth-activation-container-evolution-and-my-jobs'
storyFile: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md'
atddChecklistPath: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/atdd-checklist-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md'
planRevision: '1f8c16201e016f2b62c316e060f49bce9f1a1327'
specSha256: '5fb561b5f7ba7c2c7a2880ceceb34642600ab48c227a99df697ed27688fc8ba6'
generatedTestFiles:
  - tests/integration/rls/jobs-depth.rls.test.ts
  - tests/integration/commands/jobs-depth.int.test.ts
  - tests/integration/commands/job-booking-facts.int.test.ts
  - tests/integration/features/jobs/my-jobs.int.test.ts
  - tests/e2e/jobs/jobs-depth.e2e.spec.ts
  - tests/unit/server/bookings/job-facts.test.ts
fixtureFiles:
  - tests/support/jobs-depth-atdd.ts
  - tests/support/job-booking-facts-atdd.ts
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md
  - _bmad-output/test-artifacts/test-design-epic-16.md
  - docs/process/development-completion-policy.md
  - _bmad/tea/config.yaml
  - package.json
  - vitest.config.ts
  - playwright.config.ts
pact_mcp_reachable: false
---

# ATDD Checklist — Story 16.1 Jobs Depth and My Jobs

Date:2026-10-19. Author: TEA delegate for Rasmus. Create mode completed for test scaffolding only. All21new acceptance tests remain explicitly test.skip; none is passing acceptance coverage. One practical source contract was temporarily activated, failed for the intended missing behavior, then restored byte-for-byte. Existing32core checks passed. Story implementation, development completion and release readiness are not claimed.

## Story and Scope

Assigned users need a duplicate-free real membership/booking-assignment job list and a money-safe operational card. Checked enriched writes must preserve original creation/source identities and feed complete own-job roles/windows into authoritative current-fact booking transactions. Existing core card validation/state and dependency-warning behavior is reused.

Canonical story key strips the spec- filename prefix. Approved plan revision and exact spec hash are recorded above; spec content/hash unchanged by ATDD. Only the six named test files, two allocated supplementary helpers and this checklist were written. No product/SQL/spec/Git/state/report/dependency/config/shared-metadata changes or services. Reserved migrations remain implementation work.

All11retained ACs and everyTR01–TR16 destination remain mandatory; bounded scaffolds do not close full AC matrices. No16.2 membership mutations/elevation,16.3work orders,16.4scalar consumers or E15views/readers/time/calendar/E2E work is asserted here. No actual unfinished E15 predecessor is identified for available My Jobs/E14 foundation. If one later blocks a slice, record exact contract/path, owner, evidence, unblock condition and later integration test for only that slice; continue independent work.

## Generated Red Scaffolds

| File | New skipped bodies | Priority / main behavior |
| --- | ---: | --- |
| tests/integration/rls/jobs-depth.rls.test.ts |3|P0 actual role/row/tenant/parent/ACL/schema negatives, no structural membership-write elevation. |
| tests/integration/commands/jobs-depth.int.test.ts |3|Actual enriched card persistence/rollback, compatible old creation/provenance/source/booking identity. |
| tests/integration/commands/job-booking-facts.int.test.ts |4|P0 authoritative own-job facts/current proof, stale/old/wrong-domain signatures, derived refresh, current-authority lock wait and exact rollback. |
| tests/integration/features/jobs/my-jobs.int.test.ts |3|P0 actual member UNION booking assignee, disabled/foreign/unrelated scope and protected payload omission. |
| tests/e2e/jobs/jobs-depth.e2e.spec.ts |4|2P0+2P1 essential E01–E04: assigned navigation/direct URL+money; phone persistence/retry; real booking warning/stale review/save; dependency unknown→violation→resolved. |
| tests/unit/server/bookings/job-facts.test.ts |4|P0 actual parser/detector source contracts, mixed jobs/unbound, unknown versus empty, old engine/canonical tamper. |
| Total |21|0active newtest declarations; skip is not coverage. |

No component test runner or generic fixture directory introduced. Existing tests/unit/features/jobs/job-card-validation.test.ts (18) and dependency-warnings.test.ts (14) remain byte-identical. No new command-boundary or My Jobs pure unit file was invented: the enriched validator/pure projection interface is not yet implemented and the current read imports next/headers. Required behavior is covered by substantive API/E2E scaffolds; add the real pure boundary tests once extracted during implementation, not module-not-found-only tests or duplicated scalar/state truth tables.

## Acceptance-to-Implementation Handoff

| Retained AC | Current scaffold/retained evidence | Still required before acceptance |
| --- | --- | --- |
| AC01 |RLS/schema+commands fixtures, real original create paths |Implement additive schema/defaults/composites; empty-history full migration/seed and original-call regressions. |
| AC02 |My Jobs3 + RLS3 + E01 |Actual member/assignee union and row/current membership authority, no broad tenant access. |
| AC03 |RLS/My Jobs/E01; money sentinel/absent-key assertions |Full every-seeded-role/direct-command/RPC/table/current-role+menu/direct URL agreement and nested omission. |
| AC04 |Commands3 + E02; retained18core |Actual enriched command/parent validation/scalar-child-event-audit atomicity, current related-row checks and SQL negatives. |
| AC05 |E02 + retained state tests |Real360×640 transient failure/explicit retry/durable save/reload; no success before persistence. |
| AC06 |Booking-facts4 + U03/U04/U05 + E03 |Complete checked SQL facts and own evaluated-job selection; unknown≠known-empty, no candidate/tenant-global bleed, correct persisted warnings. |
| AC07 |Booking-facts4 + U09 + E03 |Insert/delete/rebind-sensitive current canonical facts, coherent version transition, all signature/domain/current actor checks after lock, stale review and full business/children/conflict/outcome/audit rollback. |
| AC08 |Retained14pure + E04 |Actual card/date changes and reloaded linked warning; missing dates remain unknown, no invented dependency engine. |
| AC09 |Original send/accept chain in helper+commands |Full existing acceptance replay/concurrency/fault/evidence/source immutability regression suites, real fresh-only audit and stable results. |
| AC10 |Old create/E14booking fixtures+commands |Full original minimum-input/source/optional-parent/booking replay/current authority/selective review/DST regressions. |
| AC11 |RLS/schema scope assertions + accepted E2 |Implement exact shared H4/role/matrix/policy metadata under granted paths, manifest coherence and Phase C exclusion checks; later transfers remain open. |

Implementation sequence: activate relevant scaffold, observe intended RED in the qualified environment, implement available foundation/My Jobs first, then complete the coordinated facts/proof/SQL/card transaction unit and real UI. Adapt proposed fixture bindings to actual checked interfaces without weakening semantic assertions. Root owns checkpoint/state/dispatch; ATDD does not promote ready/done.

## Fixtures and Explicit Interface Assumptions

`tests/support/jobs-depth-atdd.ts`: lazy createJobsDepthFixture/withJobsDepthFixture, actual existing role/profile/tenant factories, real standalone create/E14 booking and actual send/accept chain, snapshot readback, card input/checked command adapter, My Jobs read adapter and protected-path checks. Fixture privileges seed/read back synthetic state only; actual operations use normal authenticated clients. Cleanup stays scoped to owned synthetic fixtures.

`tests/support/job-booking-facts-atdd.ts`: mixedJobScenario, complete jobFacts adapter, observeJobCard through real checked RPC proxy, afterTenantGateWait two-session barrier, correlation-scoped existing audit fault and actual reviewed booking save. No global trigger installation, fake authoritative result or hard sleeps. Audit-fault case requires existing test_support.forced_audit_failures fixture infrastructure to be enrolled in the qualified local test database; this is a test fixture prerequisite, not E15/product predecessor. Do not silently skip that integrity case.

The spec freezes semantics, not new TypeScript export/DTO/SQL-column envelope spelling. Helpers explicitly label E16-only proposed card/My Jobs exports/columns and jobInputs array transport as replaceable adapters. Reconcile them against actual implementation before activation. Wire null versus arrays represents unavailable versus known-empty; child insertion/deletion and booking job binding must affect the true canonical digest. Current existing functions, factories, checked booking commands, signer and Data API contracts were inspected rather than invented.

E2E proposed semantic contracts are documented in-file: Mina jobb heading; progressive identity/scheduling labels; planning-toggle, unsent/retry/save-status; role/window/dependency rows and dependency-warning/unknown/entitlement indicators. Existing job-edit/booking/login identifiers come from actual code. One-shot failure binds the actual Next Server Action POST and unique submitted title; if transport changes, bind the real action before activation, never a magic endpoint or permanently mocked success. E03 uses actual booking candidate/editor-review semantics and real normal-JWT DB readback.

## Actual Validation Results

1. Scaffold checks: all6test files have test.skip and no active declarations;21bodies total, no placeholder expect(true)/assert.ok(true). Both worker JSON contracts parse. Eight generated code files passed TypeScript syntactic transpilation:0syntax errors, native0. This is syntax evidence only, not runtime coverage.
2. Preserved core plus new unit collection command:

   `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/server/bookings/job-facts.test.ts tests/unit/features/jobs/dependency-warnings.test.ts tests/unit/features/jobs/job-card-validation.test.ts`

   Native0;36discovered,32passed,0failed,4explicitly skipped. Only the existing32core bodies executed; the four new skipped bodies earn no pass credit.
3. Meaningful bounded RED: temporarily activate only U04, run

   `node --experimental-strip-types --import ./tests/support/register.mjs --test --test-name-pattern='mixed jobs and unbound bookings' tests/unit/server/bookings/job-facts.test.ts`

   Native1;1executed,0passed,1failed,0skipped. Actual deriveBookingConflicts output was[]; expected exactly jobB competence_missing and outside_access_window, with no candidate/unbound bleed. This tests actual existing detector behavior, not an absent module. Original file bytes restored in finally; final4skip markers verified.
4. `pnpm exec tsc --noEmit --incremental false`: initial native1 found2new PromiseLike callback binding diagnostics and the untouched core diagnostic. Author corrected callback to async/await, preserving actual RPC behavior and refreshed scratch content. Second bounded run native1 leaves only `tests/unit/features/jobs/job-card-validation.test.ts(12,56): TS2339 Property issues does not exist on type never`. File is unchanged at the preserved hash below; no new scaffold diagnostics remain. Whole-project typecheck is NOT reported as passed; implementation owner owns this existing allocated core path. No repeated attempt beyond the two bounded runs.
5. Independent Sol6.1High review PASS over all8new code files after authors completed. A no-op wrong-domain variant dropped by conflictClaims was corrected to a genuine existing editor-domain signature in the detector-proof slot; unbound negative checks both warning categories. No unresolved consequential scaffold findings. One later typing-only async/await correction preserves the reviewed RPC/barrier behavior. Reviewer:/root/e16_test_design/atdd_review; distinct from all authors.

Unexecuted: all13DB/RLS bodies and4browser bodies, real migration replay/full DB/RLS/direct recovery-storage integrity, production build/essential runtime smoke. No service/DB/browser was started. Required DB execution later uses SUPABASE_TEST_REQUIRED=1 and truthful discovered/executed/failed/skipped counts. Missing runtime is expected at ATDD; it is not an E15 dependency or reason to claim passing acceptance.

## Development and Deferred Release Gates

Before development completion: applicable static/build/containment, full DB/RLS/empty-history migration+seed, direct recovery-storage integrity, focused auth/money/current-fact/transaction tests, independent review and essential actual changed-flow smoke. Skips are never passing evidence. Owner-authorized process distinguishes development complete from release ready; no delivery record/pass fabricated here.

Deferred release validation: exhaustive role×device×browser journeys, screenshots/visual/manual walkthrough and polish. Owner:E16 UI/release owner. Evidence:not executed in ATDD;21newscaffolds remain skipped. Next action: deliberate release_validation=true and representative manual/design checks at release stabilization; retain consequential functional failures as development blockers. TR01–TR16 behaviors/destination evidence stay mandatory, including16.4consumer obligations, but no16.4consumer is tested or implemented in16.1.

## Workflow and Preservation

Own-worktree skill .agents/skills/bmad-testarch-atdd, [C]Create, AI generation from repository/spec (no recording). Auto execution capability resolves to awaited subagents; separate explicitly Sol6.1High API, E2E and source-contract authors due actual sensitive scope, plus independent High reviewer. Root-recorded parent route retained. No measured speedup claim. Supabase/Postgres RLS/locking guidance loaded before DB test design; no schema/product feature implementation or external database action.

Playwright-utils flag true but package absent: two-gate mandate permits existing project fixtures (`resource-cdp-attachment`), no package or merged fixture added. Pact irrelevant/uninstalled; SmartBear tool-list probe false, no broker call, source-derived provider context only. No legacy URLs/observations/browsing.

Scratch worker contracts (not runtime dependencies): C:/Users/Rasmus/AppData/Local/Temp/tea-atdd-api-16-1-20261019.json and tea-atdd-e2e-16-1-20261019.json. No extra tracked scratch output. Story backlink intentionally omitted because spec edits prohibited; checklist frontmatter supplies exact manual handoff. API/DB rather than generic tests/api and Node rather than new component runner follow this project's existing framework.

Final preserved SHA256s: spec5fb561b5f7ba7c2c7a2880ceceb34642600ab48c227a99df697ed27688fc8ba6; card-core test3eab96124d85613117a3878d5d0b82b7fc521c462c94f181de3ccf22667f5310; dependency test4ec1dec4b227783750a260b97a978944b8293e967f82ba233258c60f85c708ff; package914ddbe0efd3d1776096ca332ef402afba7efddbd5643d5769edb15e9896360a; lock532abe9d606d49daa060b41ebc91bc44b359291059b8832bed98233b65299ee2.

ATDD checklist validation: prerequisites/source/AC mapping/test levels/skip markers/real expected assertions/lazy scoped fixtures/explicit assumptions/task activation/manual handoff and truthful result limits checked. No ready/done/release-ready claim. Next step is root's authorized implementation dispatch; later automate/acceptance activation is separate. No resource exists to clean up and no unrelated paused chat was resumed.
