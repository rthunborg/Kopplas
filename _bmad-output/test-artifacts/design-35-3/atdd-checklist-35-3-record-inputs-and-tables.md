---
workflow: bmad-testarch-atdd
workflowStatus: completed
mode: create
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: step-05-validate-and-complete
lastSaved: '2026-10-29'
storyId: '35-3'
storyKey: 35-3-record-inputs-and-tables
storyFile: C:/DEV/K35-records/_bmad-output/specs/spec-design-35-3/stories/35-3-record-inputs-and-tables.md
atddChecklistPath: C:/DEV/K35-records/_bmad-output/test-artifacts/design-35-3/atdd-checklist-35-3-record-inputs-and-tables.md
generatedTestFiles:
  - tests/integration/commands/crm-customer-commands.int.test.ts
  - tests/integration/commands/non-admin-audit-authority.int.test.ts
  - tests/e2e/crm/customers.e2e.spec.ts
  - tests/unit/features/crm/form-parsing.test.ts
  - tests/unit/server/commands/crm-validation.test.ts
inputDocuments:
  - _bmad-output/specs/spec-design-35-3/stories/35-3-record-inputs-and-tables.md
  - _bmad-output/specs/spec-design-35-3/source-binding.json
  - docs/quality/story-35-3-prerequisite-approval-2026-10-29.json
  - docs/quality/story-35-3-stale-authority-prerequisite-plan-2026-10-29.md
  - _bmad-output/test-artifacts/design-35-3/test-design-epic-35-3.md
  - _bmad-output/test-artifacts/design-35-3/test-design-spec-design-35-3.md
  - _bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-3.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - AGENTS.md
executionMode: sequential
detectedStack: frontend
primaryLevel: E2E
pact_mcp_reachable: false
evidenceStatus: observed-unit-red; database-and-browser-not-executed
developmentComplete: false
release_ready: false
---

# Story 35.3 ATDD checklist

ATDD generation is complete for the approved single-story scope. Product implementation, database/browser execution, independent review and visual acceptance remain pending. The canonical seven ACs and sixteen Applies states remain binding. The approved prerequisite supersedes historical seven/two-only and stale-blocked wording only within its exact allocation. No canonical or adapter story content was changed.

Route: root recorded `tea_per_story`, `gpt-6.1-sol` High for authorization/transactional integrity before dispatch. Observed input head `83801855dd8ef3c5ed0b0b6dbeffe8842584827e`, product base `431c27f63183dc0dde0eea44da1427f78adf74c4`, worktree `C:/DEV/K35-records`, branch `codex/story-35-3-record-inputs-and-tables`. Root retains Git, state, claims, migration generation, resources and publication ownership.

## Preflight and strategy

- Approved story, frozen prerequisite, source binding, existing Playwright configuration, Node unit runner and Vitest integration runner are available. Next/React package detection selects frontend; real Supabase command integration owns database assertions.
- AI generation selected from the existing story/test-design and actual checked callers. No recording session or browser launch was needed to author scaffolds. Existing fixtures, hydration helpers and real `POST` + `next-action` / `route.fetch` / abort precedent were inspected.
- Sequential worker phases were executed in this delegate, honoring the bounded no-fanout handoff. No nested delegate was launched. API and E2E generation manifests are saved beside this checklist.
- The root explicitly required active intentional RED and no skipped scaffolds. This overrides the installed skill's default `test.skip()` convention. New tests are executable assertions; none are placeholders, TODO tests or disabled tests. Existing conditional stack gating remains visible and does not count as runtime coverage.
- No new endpoint or independent consumer/provider boundary exists. No Pact suite was added. Tool-list probe found no SmartBear Pact tools; fallback is existing provider source, not broker data.
- Playwright Utils flag is true but package is absent. The two-gate library mandate therefore permits the existing vanilla fixture/runner and interception patterns. No dependency or merged-fixture file was added. Framework adoption is a separately scoped future decision, not a prerequisite for this story.

## Artifacts and observed result

- [API/integration generation manifest](atdd-api-generation-35-3.json)
- [E2E generation manifest](atdd-e2e-generation-35-3.json)
- [Observed red evidence](atdd-red-evidence-35-3.json)
- [Reused Phase 2 design](test-design-epic-35-3.md) and [adapter bridge](test-design-spec-design-35-3.md)

Bounded executed command:

```powershell
node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/crm/form-parsing.test.ts tests/unit/server/commands/crm-validation.test.ts tests/unit/components/crm/customer-presentation.test.ts
```

Exit **1**; **118 executed, 85 passed, 33 failed, 0 skipped/cancelled/todo**. All 33 newly added parser/validator cases fail against the current product code, which does not yet preserve/require `expected_customer`. This is the intended RED state, not a product pass. Existing 85 regressions, including unchanged presentation tests, pass. No new pure-helper contract was invented merely to add tests: sorting/selection/attempt/hint unit groups become applicable when the implementation actually extracts those helpers.

`node node_modules/typescript/bin/tsc --noEmit --pretty false` exited **0** against the generated scaffold snapshot. TypeScript validation is structural evidence only; it proves no database overload, action transport or browser behavior. Final edits receive the closing structural check recorded in the evidence file.

Database integration, PostgREST, full required integration/RLS, recovery-storage, production-server browser, screenshots/contrast and owner visual acceptance were **not executed**. No services, database, browser, remote provider or CI run was launched; no migration was generated or applied.

## Test groups and preserved acceptance IDs

| Binding | Concrete scaffold or retained regression | Level / priority |
| --- | --- | --- |
| E35-3-AC1 / E35-3-T-AC1 | B01 semantic list, independent checkbox selection and explicit link; B02 form/summary; B03 archive; B10 existing shared field consumers | E2E P1 |
| E35-3-AC2 / E35-3-T-AC2 | B01 stable selected customer across sort/search/reset; B06 delayed A read cannot replace B; semantic header and keyboard selection | E2E P1/P0 |
| E35-3-AC3 / E35-3-T-AC3 | B02 field association/summary focus, retained values, real corrected save and DB reread; B03 soft archive; B04 pending protection | E2E P1/P0 |
| E35-3-AC4 / E35-3-T-AC4 | B08 connected 360×640 targets/overflow/actions/errors; existing desktop journeys retained | E2E P1; required visual/zoom/virtual-keyboard proof remains implementation verification |
| E35-3-AC5 / E35-3-T-AC5 | B07 actual focus wrapping/dirty Escape, independent Back/Forward precommit cancellation; B06 late read; existing clean Escape/trigger restoration | E2E P1/P0 |
| E35-3-AC6 / E35-3-T-AC6 | B04/B05 pending/unknown and no replay; B06 stale/review/save; B09 authorized empty vs denial and live revocation | E2E P0/P1 + integration P0 |
| E35-3-AC7 / E35-3-T-AC7 | Real checked command/RPC tests, both catalogued signatures, tenant/actor/revocation/raw-write denial, atomic audit and private baseline separation; existing scope/invariant suites retained | Unit/integration P0 + E2E P1 |

| Canonical Applies state / proposed test ID | Binding and falsifiable observation |
| --- | --- |
| E35-3-STATE-loading / E35-3-T-loading | B06 holds the real customer A read; selection retained, no empty claim, visible loading, then releases after B |
| E35-3-STATE-loaded / E35-3-T-loaded | B01 actual authorized list and existing detail/privacy assertions |
| E35-3-STATE-empty / E35-3-T-empty | B09 separate newly provisioned authorized tenant's real zero-record read |
| E35-3-STATE-no-match / E35-3-T-no-match | B01 nonmatching search retains selection identity through reset |
| E35-3-STATE-validation / E35-3-T-validation | B02 real validator/associated error/summary focus/preserved adjacent value; parser/validator negatives |
| E35-3-STATE-denied / E35-3-T-denied | B09 foreign private detail has generic not-found and no private fields; raw/command tenant negatives |
| E35-3-STATE-revoked / E35-3-T-revoked | B09 disables own isolated fixture membership after render; actual save denied, no row; raw revoked-role negative |
| E35-3-STATE-connection-required / E35-3-T-connection-required | B05 pre-forward abort proves no row in test fixture; UI retains unsent input. Production transport rejection remains conservative unknown without rollback authority |
| E35-3-STATE-submitting / E35-3-T-submitting | B04 holds real response, duplicate activation dispatched once, Escape/Cancel cannot close |
| E35-3-STATE-error-retry / E35-3-T-error-retry | B02 definite validation rejection, explicit correction and confirmed save; B03 archive cancellation/confirmation |
| E35-3-STATE-unknown / E35-3-T-unknown | B05 one real create + independent row/audit proof + browser-response loss; no saved claim/replay after document remount; unavailable/corrupt hint fail closed |
| E35-3-STATE-stale / E35-3-T-stale | B06 two browser editor instances, original FormData baseline separated from edited city; integration two distinct entitled actors, conflict preserves entire winner row and no losing audit |
| E35-3-STATE-confirmed / E35-3-T-confirmed | B02/B04/B06 only actual success closes; independent physical row/audit observation; no synthetic success response |
| E35-3-STATE-dirty-navigation / E35-3-T-dirty-navigation | B07 Escape and separate real Back/Forward entries: no `currententrychange` while decision pending or after cancel, same URL/entry/length/draft |
| E35-3-STATE-late-result / E35-3-T-late-result | B06 delayed read A released after B; B URL/heading retained. Pending mutation abandonment is prohibited instead of forcing an unreachable editor switch |
| E35-3-STATE-focus-dialog / E35-3-T-focus-dialog | B07 actual Tab/Shift+Tab remains in named dialog; existing clean Escape returns trigger; B10 inherited dialogs |

`locked` and entity files retain **Inherited regression** classification and source-owner IDs; `unavailable` remains **N/A**. This phase adds no upload, lock, unrelated money/proof flow or pending module. Existing money/tax/provenance/recovery and scope gates remain required where consumed; source presence is not passing coverage.

## Sensitive producer contract

Parser tests use real FormData. The exact original thirteen-key object preserves nulls, original strings and omitted-form facts independently of edited fields; no `expected_customer` echo. Missing/blank/malformed/non-string/oversized UTF-8 input has associated error. Validator tests reject missing/null/array/string/extra/mismatched identity/type/date/oversized input and each individually omitted key while retaining valid partial business patches. Existing unrelated update examples now include a valid baseline so they still test their named failure.

Integration uses the existing isolated two-tenant factories and real `runCommand`/authenticated RPC clients. Admin and seller read original facts independently; B commits before stale A; concurrent equal-baseline commands produce exactly one whole winner and one conflict/audit. Explicit fresh RLS read permits a reviewed save. Exact baseline possession does not authorize foreign tenant/forged actor/revoked role/direct table writes. Direct PostgREST dispatch tests required six named arguments, malformed baseline validation, old five-argument fail-closed PT409 and stale PT409 without private current facts. Update command must map the latter to existing COMMAND_CONFLICT. Forced-audit fixture is correlation-scoped and cleaned in finally; the entire business patch must roll back. Catalogue requires exactly eleven selected functions, both customer-update argument signatures, no defaults, retained grants and empty search path; other wrappers/internal writer assertions remain intact.

No timestamp/SQL file is allocated by this phase. The future single migration and updated current in-repository callers stay together. Human never-released/no-older-callers clarification is retained; no hypothetical cohort, compatibility interval or further per-story migration permission is imposed.

## Browser harness boundaries and implementation checklist

The existing routes, IDs and Swedish field labels were inspected. New semantic controls use planned Swedish names (`Välj <customer>`, a Sortera label, Återställ and refresh/review/abandonment controls) as ordinary test bindings, not new product policy. Implementation may align these locators to the final accessible wording while retaining every assertion. No CSS-class or Flight response-schema assertions are introduced. Existing test IDs are reused: `new-customer-button`, `edit-customer-button`, `form-error-summary`, `customers-empty`, `customers-no-results`, `customers-failed`, `customer-not-found`, `new-facility-button`, `new-contact-button`.

- [ ] Implement the approved exact baseline parsing/validation and customer-only checked RPC overload/old-signature refusal. Preserve original business patch allowlist, authorizers and bound audit.
- [ ] Implement the seven owned presentation components' accepted structure/state behavior. No new helper export is prescribed by these tests.
- [ ] Observe real multipart server-action FormData in production Chromium before treating harness selectors as qualified. The gates require current customer route, POST and next-action, then decode actual multipart data; no `/api/customers`, JSON-argument copy or guessed Flight payload.
- [ ] Keep payload-free per-tab hint through pending/unknown/remount/discard. Unknown create has no terminal reconciliation lookup here. No automatic retry, manual clear, timeout clear, payload, entity/user/tenant ID, offline queue, idempotency or receipt claim.
- [ ] Run actual Chromium Back and Forward scenarios. Current entry/event observations must prove precommit cancellation; post-popstate repair and mere API presence cannot pass. Unsupported/noncancelable actual path requires the exact caller/event/evidence/minimal-delta stop described in the approved plan.
- [ ] Qualify B06 delayed read against actual current Next navigation. Handler errors are propagated; held responses are released and handlers removed in finally. Do not change this to manufactured success or declare browser runtime passed from TypeScript.
- [ ] Re-run units to GREEN, then focused required command/catalogue integration, actual named overload dispatch and full required integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/failed/skipped counts. No conditional skip is coverage.
- [ ] Run configured production-server E2E (no `next dev`), real persistence and relevant desktop/phone states, pending customer Cancel plus inherited DialogActions callers, compact archive kind/ID behavior, representative calculation and FileIndexUpload association/hooks. No excluded body edits are authorized by that verification.
- [ ] Supply actual 1440×900 and connected 360×640 revision-bound images, composite contrast/accessibility and initial customer-composition owner visual acceptance. Include zoom/virtual keyboard, actual existing motion/reduced-motion and inherited changed-contract applicability evidence. No images were generated here.
- [ ] Complete applicable static/build/lock/audit/containment/scope/golden/recovery gates, independent High review of new sensitive decisions/diff, exact-head CI and author-written Suggested Review Order through the existing development completion wrapper.

No new supporting test file, fixture framework, dependency, `.env`, migration, app/source file, story/spec or aggregate tracking file was changed. The unchanged customer-presentation unit suite is reused; new deterministic helper tests are conditional on actual extracted logic and remain a Build-owned task. The checklist is the sole ATDD link handoff; Build Auto owns story changes.

## Validation and next handoff

Create/preflight/strategy/generation/aggregation/validation completed in autonomous mode. The completed workflow means artifacts and observed unit RED are available, not development complete or release ready. Root next checkpoints these tests and dispatches the approved Build phase. No user product question is open for ATDD. Runtime qualification, independent review and visual acceptance are implementation gates.

Release obligations remain E35-3-REL-1 (UI visual/device/reflow), REL-2 (QA/accessibility manual/screen-reader/daylight) and REL-3 (Coordinator final Phase B consolidation), with named people/exact candidate assigned through existing delivery/deferred ledgers. No release ledger or historical evidence was rewritten. `release_ready=false`.
