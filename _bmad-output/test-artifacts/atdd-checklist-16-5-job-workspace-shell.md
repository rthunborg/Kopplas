---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-20'
workflowStatus: 'complete'
workflowType: 'testarch-atdd'
tddPhase: 'RED scaffolds'
storyId: '16.5'
storyKey: '16-5-job-workspace-shell'
storyFile: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md'
atddChecklistPath: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/atdd-checklist-16-5-job-workspace-shell.md'
planRevision: 'f830a4ca94a82f4c080ae16dc7312d368ca13b0e'
specSha256: 'C84BE8587D0F84F4BFCCC4B8BB1635B534E687D372FA9086D3CC87350299EE8F'
intentSha256: '84e6bca5a0696386eba53f7ee5d670c1ebfed42446154614f30ad365f8071bc8'
generatedTestFiles:
  - tests/unit/server/read-models/job-workspace.test.ts
  - tests/unit/server/read-models/job-events.test.ts
  - tests/integration/features/jobs/job-workspace.int.test.ts
  - tests/integration/rls/job-workspace.rls.test.ts
  - tests/unit/features/jobs/job-workspace-domain.test.ts
  - tests/e2e/jobs/job-workspace.e2e.spec.ts
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md
  - _bmad-output/test-artifacts/test-design-epic-16.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - vitest.config.ts
pact_mcp_reachable: false
---

# Story 16.5 workspace ATDD checklist

Formal Create/AI generation is complete for the approved three-AC/TR12 spec at plan revision f830a4ca94a82f4c080ae16dc7312d368ca13b0e. This completes the ATDD deliverable only: **20 persistent skipped scaffolds, zero executed acceptance passes**. The one controlled production-bound RED failed for the intended missing safe event projection; its original skipped bytes were restored exactly. No product, SQL, existing test/helper, spec, dependencies, environment or Git/state files changed.

## Strategy and actual routes

Primary remains Sol6.1High for authorization/current-read/structural-omission boundaries. Auto/probe selected subagents; no persistent agent-team API exists. Mandatory API and browser authors ran together, explicitly context-free Sol6.1High, foreground awaited. A distinct context-free Sol6.1High reviewer then inspected only these seven new code files and necessary existing interfaces: PASS, no consequential defects; read-only review adds no execution coverage.

Existing Node strip runner, Vitest integration/RLS and production Playwright are retained. Primary level is server composition/direct reader integration, with pure contract tests and three essential connected browser journeys. Active E14 resources owns Schema; pending E15 scheduling cannot hide it. Prior16.1–16.4 exact9d4584f7/CI39445650692 evidence is continuity only, not16.5 evidence; none was rerun. No legacy observation, resource/browser/service/backend/DB launch, framework/package migration or new grant/RPC/migration.

## Acceptance-to-scenario map

| Approved criterion | Scenario IDs and assertions | Priority |
| --- | --- | --- |
| AC01: real persistent identity/header/overview/actions | UNIT-HEADER-01–03: Order/Projekt identity, chips/dates, authorized member/picker labels; assigned-name-unavailable vs unassigned vs unavailable; no raw money/supplier/directory data. INT-01 both kinds; INT-02 structural server omission; E01 real overview/card/upgrade/source continuity, E02 restricted controls/PL label. | P0 |
| AC02: matrix × active five real tabs, direct boundaries | D01–02 independently expected tab sets/current root admission, active resources despite pending scheduling, closed live set. INT-02 no forbidden file/picker/directory reads on denied URL, INT-03 real scoped bookings/list/timeline View vs Manage, INT-04 root-first safe failure. UNIT-EVENTS-01–03 safe keys, scoped ordered real events, empty vs error. RLS-01 foreign/unrelated/anon direct root/events; RLS-02 other-parent child URL/directSQL; RLS-03 current relational lead, no new grants, revocation/stale-write denial. E01 actual work orders/files/events; E02 own booking subset/protected serialized payload. | P0; failure distinctions P1 |
| AC03: responsive navigation, preserved context/draft and honest outcomes | D03–04 bounded tab selection, unknown/unavailable fallback, old workOrder-only deep link, stable job/query with no input mutation. E03 desktop keyboard then360×640 Mer, focus/back/refresh, old child return, draft retained OR explicit native leave protection, exact precommit transport failure, no false success, same-input retry and actual persisted reload. | P1 |

All three AC are mapped to proposed verification; skips do not prove them. No whole-E15 gate, new transitive dependency policy, AppShell change, pending module surface, directory lookup or prior-story domain matrix is introduced.

## Persistent scaffold inventory

| Layer | Cases | P0 | P1 | Execution status |
| --- | ---: | ---: | ---: | --- |
| Pure domain/header/event | 10 | 7 | 3 | Node collection:10 skipped,0pass,0fail |
| Real normal-client workspace integration | 4 | 3 | 1 | skipped bodies; DB not invoked or collected by Vitest |
| Direct current-authority/RLS/child | 3 | 3 | 0 | skipped bodies; DB not invoked or collected by Vitest |
| Essential production browser | 3 | 2 | 1 | Playwright listed3; no browser/fixtures executed |
| Total | 20 | 15 | 5 | all test.skip restored/persisted |

Six test files and one thin support adapter are generated. Each database/browser scenario owns a fresh existing JobsDepthFixture with existing cleanup; no aggregate nine-fixture lifecycle testcase. Deterministic pure client records are injected fixtures, not acceptance logic or test-side redaction. Existing factories generate isolated live identities. No new faker dependency/factory framework, external provider mock, route or service is required. The single transport abort in E03 happens before actual persistence and is followed by a real retry; no canned success.

| Generated file | Lines | SHA256 |
| --- | ---: | --- |
| `tests/unit/server/read-models/job-workspace.test.ts` | 43 | `66DCB8CCA6EF07D873937C1238278D10262660ADD2BEBEAAEABCB9188F1BE0F0` |
| `tests/unit/server/read-models/job-events.test.ts` | 83 | `113DF4847312F4C3F0850B17981F104BE8FD1ED668DA7F2D0A73E21E49737E77` |
| `tests/integration/features/jobs/job-workspace.int.test.ts` | 117 | `BB3133DBBF730E10AA474FB7C3967C24114EE7133021A75C880784B2D198DC60` |
| `tests/integration/rls/job-workspace.rls.test.ts` | 82 | `5BD68053C866A53E6534BCF5522EA0F394BD54070A7AA89778A078195E7AD5F6` |
| `tests/unit/features/jobs/job-workspace-domain.test.ts` | 100 | `A4E6328BAA4E4634DEFFEB769735889773E66DA2D7544740B95721E45E0065A1` |
| `tests/e2e/jobs/job-workspace.e2e.spec.ts` | 333 | `8C22C5C614F1B2F0F466C7C702E0A8762E55F947347D06063F15A48EFD9749F8` |
| `tests/support/job-workspace-atdd.ts` | 36 | `CFA81D6C42D47045AEB5B5417E440104E565CFD86674954CFD599FC01E8ED550` |

## Actual server-free verification

All commands ran from the absolute worktree above with C:/nvm4w/nodejs/node.exe. No test process remains running.

| Check | Actual result |
| --- | --- |
| TypeScript transpileModule on the seven new files | native0;7files,0syntax errors |
| node node_modules/typescript/bin/tsc --noEmit --incremental false | native0; no diagnostics |
| node --experimental-strip-types --import ./tests/support/register.mjs --test --test-name-pattern=16.5-RED-EVENTS tests/unit/server/read-models/job-events.test.ts (only marked body temporarily activated) | native1;1executed,0pass,1expected failure,0skip. Positive current-job/event/scope controls passed before safe-key assertion. Actual keys additionally channel/reference. Original file restored byte-for-byte/SHA113DF4847312F4C3F0850B17981F104BE8FD1ED668DA7F2D0A73E21E49737E77. |
| node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/jobs/job-workspace-domain.test.ts tests/unit/server/read-models/job-workspace.test.ts tests/unit/server/read-models/job-events.test.ts | native0;10tests,0pass,0fail,10skipped. Collection only. Existing module-type warning does not change counts. |
| node node_modules/@playwright/test/cli.js test tests/e2e/jobs/job-workspace.e2e.spec.ts --list --reporter=list | native0;3Chromium tests listed in1file; no server/browser startup |
| Worker JSON success/full-content/expected_to_fail/test.skip and helper content checks | both succeeded, persisted files match; no placeholder assertions |
| Focused independent High scaffold review | PASS; no edits or execution by reviewer |

The controlled RED uses actual current readJobDetail with a query-aware injected normal client. A narrow established Node resolver maps next/headers to the actual next/headers.js package entry only; cookies/factory/client are not replaced. No event values/proofs were printed. This is the current presentation-boundary baseline, **not a mandate to keep old architecture**: rebind the safe-only assertion to the approved dedicated workspace event reader at implementation; never filter the result in tests to manufacture green.

Private standard worker/aggregation transport JSON: C:/Users/Rasmus/AppData/Local/Temp/tea-atdd-{api-tests,e2e-tests,summary}-2026-10-20T15-59-55-203Z.json. RED receipt: C:/Users/Rasmus/AppData/Local/Temp/tea-atdd-16-5-safe-event-red.log. These are generation/probe evidence, not runtime dependencies of committed tests.

## Replaceable bindings and implementation checklist

New module/DTO/query/export/selector signatures are explicit assumptions to reconcile against final production composition before activation. The helper lazily forwards normal-client production readers and existing fixtures; no policy/redaction/directory/service work lives there. Pure header input represents already-authorized projections: supplying the existing manager picker requires independent existing entitlement at composition; it does not authorize fetching it. Current lead relationship may admit root reads without tenant-wide Jobs.ViewAssigned/Bookings.View/Files.View; preserve that distinction.

- [ ] Implement proportional headless workspace domain/header/composer and dedicated safe-event reader under approved source ownership; derive tabs from current matrix and active manifest, gate before invoking readers, preserve ordinary RLS and current child scope. No new directory/RPC/grant or schema.
- [ ] Reconcile lazy readJobWorkspace/readJobEvents/projectJobWorkspaceHeader and proposed Workspace DTO names; activate the matching pure/integration/RLS bodies task by task, observe RED then GREEN. Keep root-first safe failure, structural omission, direct unauthorized reads, revocation and real persistence assertions.
- [ ] Compose persistent header plus actual overview/work-order/Schema/files/events consumers, real event labels/time/empty-error states and member/picker-safe PL labels. Preserve card/booking proofs, existing commands, source identity and money omission; never force restricted data through header props.
- [ ] Reconcile the accessible tab/tabpanel IDs, mobile priority/Mer and URL state; preserve child document returns and draft-or-leave-guard behavior. Proposed new IDs: job-workspace-header/type, job-site/contact/responsible-pl/lead, job-event-{id}, booking-mini-timeline, booking-interval-{id}, job-schedule-empty. Existing card/member/source/file/booking controls are source inspected. A custom accessible leave guard may replace native dialog binding while retaining the same protection assertion.
- [ ] Implementation owner updates only the approved existing UI test entry assumptions necessitated by moved panels and appends tests/e2e/jobs/job-workspace.e2e.spec.ts to test:smoke BEFORE the final --reporter=list,json argument. No package/old-test edits are made in this ATDD phase.
- [ ] Root-owned exact-head CI runs required full development verification: units/process/static/lint/build/containment/frozen-lock, SUPABASE_TEST_REQUIRED=1 full DB/RLS/direct recovery/integrity, essential production browser (new3+prior28) and existing pilot lane. Report executed/skipped native counts; one ordinary physical recovery skip requires its separate executed isolated recovery evidence. No skip-as-pass or local guard workaround.

Task-by-task commands after qualified implementation: the pure Node command above; SUPABASE_TEST_REQUIRED=1 pnpm exec vitest run tests/integration/features/jobs/job-workspace.int.test.ts tests/integration/rls/job-workspace.rls.test.ts (qualified root DB only); pnpm exec playwright test tests/e2e/jobs/job-workspace.e2e.spec.ts (configured production webserver only). Debug/headed inspection, if later authorized, uses the same production configuration with --debug or --headed; it was not run here. Refactor after GREEN while preserving assertions; root exclusively owns commits. No speculative implementation hour estimate is asserted by this ATDD handoff.

## Guidance, deviations and release work

Playwright-utils config=true/package absent: actual two-gate mandate is inactive. Preserve established resourcePage/login fixture; no missing merged fixture/dependency is fabricated. Browser file documents deviations for bounded hydration expect.poll, test.step, actual transport observers armed before triggers and one exact request abort. Pact is irrelevant/uninstalled/no broker; namespace probe false. Fixture architecture/data factories/component-TDD/network-first/test quality/selector timing and Supabase/Postgres knowledge inform these focused contracts. Separate component mount tests are unnecessary for the selected thin shell; pure semantics and essential production journeys carry the obligations.

Spec backlink writes are prohibited: this checklist/frontmatter is the complete manual handoff link for root/build. Spec/package/lock SHA values match the initial protected values; tracked diff remains empty. Only the checklist and seven assigned new code files are untracked. No credential/manual/product ambiguity blocks implementation.

Development versus release remains separate under docs/process/development-completion-policy.md: root/release owner retains broad browser/device/role matrices, visual comparison/design review and manual release validation. They are unexecuted release checks, not new development gates, passing evidence or missing ATDD coverage. No deployment or release-ready claim. Next workflow is root-coordinated formal build, then exact-head CI/review and post-dev automate.
