---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-20'
workflowType: 'testarch-atdd'
storyId: '15.3'
storyKey: 'spec-15-3-conflict-resolver'
storyFile: '_bmad-output/implementation-artifacts/spec-15-3-conflict-resolver.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-spec-15-3-conflict-resolver.md'
generatedTestFiles:
  - tests/integration/commands/conflict-resolver.int.test.ts
  - tests/integration/rls/conflict-resolver.rls.test.ts
  - tests/integration/read-models/booking-conflicts.int.test.ts
  - tests/e2e/conflict-resolver.e2e.spec.ts
inputDocuments:
  - AGENTS.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - package.json
  - playwright.config.ts
  - vitest.config.ts
  - _bmad-output/implementation-artifacts/spec-15-3-conflict-resolver.md
  - _bmad-output/auto-bmad/preparation/story-15-3/current-contracts-and-design.md
  - _bmad-output/auto-bmad/preparation/story-15-3/implementation-ownership-handoff.md
  - _bmad-output/test-artifacts/test-design-epic-15.md
---

# Story 15.3 Conflict Resolver — ATDD

Planners need a current complete conflict queue and checked fixes/acceptance with durable history. These artifacts prepare behavioral acceptance for that approved resolver. **ATDD generation is complete; product acceptance is unexecuted.**

## Preflight and generation choice

Create mode, autonomous answers, source-based AI generation. Approved/frozen specification supplied by Root; base HEAD e02403ace7a0a26c8c0cd01149d88054904fb7b9 on codex/epic-15-scheduling-time-calendar; clean at entry. Raw spec SHA-256 supplied by Root: 451795a63f9fd046ccc6f89a9e91f192b1f0f21beddf7a9a5391c0a6b8ccc873. Kernel: aa081c72088e5019d311764e68a0fb495822422dbb677b23f0db6f7e0c5d17a1. Planning documents' historical pending/planning-only statements describe their creation phase; this dispatch authorizes new ATDD files only. No production/schema/shared-helper edits.

Detected frontend stack (Next/React), with server/database behavior tested through the existing Node unit + Vitest integration + production Playwright runners. Framework and source environment are available. Root prohibits DB/runtime/browser/CI launch in this phase; no live test environment is claimed. AI generation is appropriate because the eight ACs and engineering defaults are explicit. No legacy observation is required or permitted.

Utils flags are true but neither @seontechnologies/playwright-utils nor @seontechnologies/pactjs-utils is installed. The library mandate's two gates therefore do not bind; preserve the existing runners and dependencies. Recommend a separately scoped framework adoption only if the project later wants utilities and a merged fixture entry. No independent provider boundary exists; Pact tests are inapplicable. Tool-list-only probe found no SmartBear/Pact broker tool: pact_mcp_reachable=false, fallback=provider-source. No broker call or retry.

## Eight-AC map and nonduplicating strategy — planned, not coverage

Confidence: 8/10 for acceptance intent and existing fixture reuse. Rationale: frozen Tasks & Acceptance AC1–8 plus current-contracts-and-design.md specify behavioral expectations; existing booking/editor/series tests show authenticated commands and physical SQL readback patterns. Unknowns: resolver export signatures, new DOM structure, ledger projection columns and correlation-scoped fault/lock fixtures do not yet exist. Generated local test projections are activation contracts to reconcile with actual implementation, not claims that those APIs/selectors exist. No production API or privilege is authorized by a test interface.

| AC | Scaffold anchors and required activation gaps | Priority |
| --- | --- | --- |
| AC1 | READ-001/002, E2E-001: labelled scope/distinct count/complete queue and unknown reads. Gaps: pagination, accepted/retained-resolved reconstruction, latest request ordering. | P0 |
| AC2 | READ-001/002, RLS-001, E2E-001: aggregate detail/safe projection/real scan recency. Gaps: complete context/window/date variants and actual checked history projection. | P0 |
| AC3 | INT-003 and E2E-001 entry; suggestions missing-seam RED probe. Gaps: actual Flytta/Omfördela engine-derived availability, unknown/cancelled facts, role/load, independent DST/capacity and stale candidate/fact validation. | P0 |
| AC4 | INT-001/003/006, E2E-001/002: exact overlay, target resolution and physical rollback. Gaps: surviving/new warnings, all adjustment/reassignment variants and every fault stage. | P0 |
| AC5 | INT-002/003/005, E2E-001/003: selective complete acceptance/no booking writes and resolved retention/reopen. Gaps: matching accepted metadata through all three writers and accept-only on a real occurrence. | P0 |
| AC6 | INT-001/004/005/006, RLS-001/002, E2E-001: immutable event/replay/current role/audit fault/notification and SQL preference pair. Gaps: real lock/lost-response/expired transport, recipient union/preferences/two events and isolated delivery constraint. | P0 |
| AC7 | E2E-002 real bounded common-series basic setup. Gaps: >=11 warnings, neighboring segments, stale full version/fingerprint, original rule bounds/count, all exceptions/tombstones and no blanket acceptance at DB level. | P0 |
| AC8 | RLS-001/002, INT-003/004/006, READ-002, E2E-003: own/foreign/anon/DML, current-role replay, unknown reads and keyboard retained retry. Gaps: complete direct RPC/catalog/inactive/multi-role/waiting matrix, actual desktop/phone execution. | P0 |

Unit tests should own newly introduced normalization, suggestion bounds and retry-state logic; do not copy existing detector/series goldens. DB/API owns authority and transaction truth; UI tests own wiring and interaction, not an exhaustive duplicate security matrix. Existing 15.1/15.2/E16 regressions remain unchanged and required later. TEA15.3-INT-001…006, COMP-001 and E2E-001 are scenario families, not executed-test totals.

## Route before worker dispatch

Parent ATDD delegate: gpt-6.1-sol High, authorization/tenant isolation/transactional integrity. No effort-only recursive handoff. Skill step-04 explicitly requires API and E2E generation workers. Capability probe: collaboration subagents available; no separate agent-team API. Requested auto resolves to subagent. Worker A: gpt-6.1-sol High for actual authorization/transaction test design. Worker B: gpt-6.1-sol High for durable browser/readback boundary design. Both receive disjoint NEW test ownership, no shared helper grant, no runtime or Git action, and are awaited synchronously within this task. This is same-story test generation, not parallel story implementation.

## Execution evidence

Actual bounded static RED evidence is in `atdd-15-3-red-evidence.json`: 3 Node import probes, 0 passed, 3 failed, 0 skipped; all fail with ERR_MODULE_NOT_FOUND at the three planned queue/command/suggestion source paths. These establish missing seams only. No acceptance body executed; no coverage or development-complete/release-ready claim.

## Generated red scaffolds

| File | Lines | Skipped declarations | Scenarios |
| --- | ---: | ---: | --- |
| tests/integration/commands/conflict-resolver.int.test.ts | 235 | 6 | INT-001 exact move/immutable event; 002 complete selective acceptance; 003 workflow/editable stale proof; 004 exact/concurrent/revoked replay; 005 three actual refresh writers; 006 before-audit physical rollback |
| tests/integration/rls/conflict-resolver.rls.test.ts | 98 | 2 | RLS-001 minimal manager/own/foreign/anon/private ledger controls; 002 SQL category/channel preference constraint with positive control and named CHECK |
| tests/integration/read-models/booking-conflicts.int.test.ts | 88 | 2 | READ-001 count/scope/aggregate detail; 002 real snapshot recency, unknown failed read and retry |
| tests/e2e/conflict-resolver.e2e.spec.ts | 295 | 3 | E2E-001 desktop chip/fix/accept/history/notification; 002 bounded common series; 003 connected 360×640 keyboard failure/explicit retry |

Total: 13 explicitly skipped declarations (10 P0, 3 P1); API/DB 10 and E2E 3. **Runner skipped count is unmeasured**, because neither Vitest nor Playwright ran. Acceptance bodies executed/passed/failed: 0/0/0. Do not report 13 as executed, passing, or runner-reported skips. No separate unit/component scaffold file was added: keep this ATDD proportionate; new pure normalization/suggestion/state and component-specific review/empty/failed interaction tests remain required development activation work under T1/T6/T7. They are not covered by the static import probes or by the READ-002 server boundary.

Expected activation failures: planned resolver modules are absent; provisional exports/DTOs/SQL field projections/DOM bindings must be reconciled before a behavioral RED run. No unconditional always-throw adapter was added. Test-local setup composes existing real factories/checked commands and reads physical rows; no fixture-generated command success or mocked proof verification.

Original epic-family trace: TEA15.3-INT-001 maps to INT-003/004 plus current-fact/genuine-proof gaps; INT-002 to INT-002; INT-003 to INT-001/004/006 plus later fault/lock gaps; INT-004 to INT-005 plus unchanged accepted-metadata gap; INT-005 to the suggestions probe and still-required behavioral suggestions tests; INT-006 to INT-001/E2E-002 plus full-segment/recipient gaps. TEA15.3-E2E-001 maps to the three essential journeys, with remaining action bindings required. TEA15.3-COMP-001 has READ-002/E2E-001 boundary scaffolds but its focused component/state assertion remains unimplemented. Family IDs are planning references, not counts or one-to-one proof of every variant.

Factory modules created: 0. Shared fixture modules created/modified: 0. New dependencies/config changes: 0. Local functions inside the four new suites provide only source-reconciled setup/readback/projection, with missing bindings listed in worker JSON. Mock providers: 0. Provisional data-testid contracts are listed below; none is claimed browser-verified.

## Browser bindings and standard-CI selection

The three declarations are discovered by `playwright.config.ts`: `testDir: ./tests/e2e`, `testMatch: **/*.e2e.spec.ts`, project `chromium` (Desktop Chrome), `workers: 1`. Its only `testIgnore` is the dashboard pipeline spec, so the resolver filename is included. Test fixture is the existing `tests/e2e/support/resource-cdp-attachment.ts` `resourcePage`.

Exact focused entry point after binding and deliberate unskip:

```powershell
pnpm exec playwright test --config=playwright.config.ts --project=chromium tests/e2e/conflict-resolver.e2e.spec.ts --reporter=list,json
```

The configured `webServer.command` runs production `next build` then `next start --port ${E2E_PORT ?? 3100}` and uses `http://127.0.0.1:<port>` as baseURL. Root must admit the actual runner/server/browser/DB resources first; this command is not resource-launch authorization. Do not substitute `next dev` or attach an arbitrary existing user server (`reuseExistingServer` defaults true outside CI). Ensure any reused server is guard-validated, matches the current source and synthetic DB, and has the required resolver schema.

Runner environment must set `SUPABASE_TEST_REQUIRED=1` and the non-public `BOOKING_CONFLICT_ATTESTATION_KEY_ID` / `BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET` to the checked synthetic `LOCAL_TEST_BOOKING_CONFLICT_KEY_ID` / `LOCAL_TEST_BOOKING_CONFLICT_SECRET` pair from `tests/support/test-env.ts`, matching the admitted DB seed. `reviewRealSeries` and checked booking setup execute in the worker, so webServer env alone does not configure them. The config sets the corresponding non-public server pair and local Auth/DB values. If Root's isolated ports differ from test defaults, set `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_TEST_SERVICE_ROLE_KEY` and `SUPABASE_TEST_DB_URL` consistently for runner and server; no demo/hosted project. `E2E_PORT` is configurable. For Root's dedicated Chromium attach lane, set private loopback `E2E_GUARD_CHROMIUM_CDP_ENDPOINT` and `E2E_RESOURCE_SAVE_FAILURE_ENABLED=true`; the fixture creates/closes only its own context/page and leaves root-owned browser lifecycle to Root. No endpoint/credential value is stored here.

**Current ordinary CI does not select this resolver spec.** `.github/workflows/ci.yml` e2e job runs `pnpm run test:smoke` unless an explicit `workflow_dispatch` has `release_validation=true`. `package.json` currently selects only `auth/login-and-tenant-context.e2e.spec.ts`, `auth/auth-mail-callback.e2e.spec.ts` and `jobs/jobs-depth.e2e.spec.ts`. Auth/Jobs success is not scheduling coverage. The release opt-in runs full `test:e2e` and would discover this file, but skipped declarations still execute no behavior. P5 must obtain focused actual production-host evidence independently of standard smoke. No workflow/config edit was made.

**P5 exact allocation now approved:** Root reports Coordinator approved **package.json → scripts.test:smoke**, appending `tests/e2e/conflict-resolver.e2e.spec.ts` after activation, preserving the existing Auth/Auth-mail/Jobs-depth paths and reporter arguments. Unique successor receipt: `.env.epic15.mail-runtime/story-15-3-preparation/root-coordinator-allocation-smoke-successor-20261020.json`, SHA-256 `376e89026afb3642e024d32496d5cbccad2597d00884d68a5a30484ede946bd9`; original P3 receipt bytes remain conserved. This P4 delegate does not write package.json. No workflow/config/dependency/environment/provider delta follows from that allocation; no additional broad review is needed solely for the already reviewed narrow script addition. Discovery needs no `playwright.config.ts` edit. Any other shared configuration/helper/workflow delta discovered during binding returns to Root before write.

P5 must execute all three activated resolver browser cases in **ordinary exact-head CI**, recording actual executed/passed/failed/skipped counts from the named resolver cases in `native-general-browser`; release-validation opt-in is not the substitute. Existing Auth/Jobs cases and any later integrated E16 `job-members` suite remain selected. The E16 job-members file/migration is not present on this branch and is not imported now; a later coherent integration preserves the script-path UNION (Auth + Auth-mail + Jobs-depth + Job-members + Resolver), never a whole-file winner. Zero skipped resolver bodies is required for those three cases to count as executed development evidence.

Provisional new test IDs: `conflict-resolver`, `conflict-scope`, `conflict-queue-row`, `conflict-person-group`, `conflict-for-booking-{id}`, `conflict-detail`, `conflict-participant-{id}`, `conflict-breach-window`, `conflict-available-slot`, `conflict-preview`, `conflict-confirm`, `conflict-last-checked`, `conflict-history-{id}`, `conflict-preserved-occurrence-{id}`, `conflict-unsent`, `conflict-success`. Accessible-name contracts reuse approved `Flytta`, `Acceptera konflikt`, `Åtgärda hela serien`, `Visa accepterade`, `Händelser`, with provisional `Orsak`, selection and `Försök igen` labels. Reconcile them with actual accessible source; do not invent a new product decision to fit the scaffold. SQL ledger/event names, display timestamp formatting and Next-action request framing are also provisional in E2E worker fixture_needs.

## Static validation and workflow completion

- AST parse and declaration validation: passed for all four generated files; 13 `test.skip` declarations, no active acceptance tests, `.only`, placeholder self-pass or hard waits. Generation summary stores final file hashes and counts.
- Full `tsc --noEmit --incremental false --pretty false`: exit 0 after the bounded corrections, recorded in `atdd-15-3-typecheck.json`.
- Focused ESLint over the four new files: exit 0, no warnings/errors, recorded in `atdd-15-3-lint.json`.
- Frozen raw spec SHA-256 rechecked unchanged. Only new Story 15.3 test/artifact paths were written; no shared helper, source, SQL, historical migration, completed 15.1/15.2 artifact, independent P3 evidence or state mutation.
- API and E2E required generation workers both finished and were awaited. No separate agent-team API; auto resolved to subagent. No runtime/browser/DB/CI/remote mutation, managed resources or CLI browser sessions were started, so teardown is N/A. Source lint/typecheck are static process evidence only.
- Corrected a hollow negative before handoff: actual outbox delivery guard does not yet exist, so its generic CHECK failure was removed and left as required development work. Preference test now uses a successful in_app control, email-only delta and exact category/channel CHECK identity; no unrelated rejection may count as enforcement.
- Skill validation checklist reconciled: project directories/runners and behavior-level assertions replace generic tests/api/Cypress examples; one atomic transaction may assert multiple physical rows. No new faker/library/framework or provider integration is warranted. Unit/component and advanced fixtures remain named required development gaps, not implied completion. Story linking is manual because spec is frozen.

Generation artifacts: `atdd-15-3-api-worker.json`, `atdd-15-3-e2e-worker.json`, `atdd-15-3-generation-summary.json`, `atdd-15-3-red-evidence.json`, `atdd-15-3-typecheck.json`, `atdd-15-3-lint.json`. Worker JSON contains full generated content, source confidence, fixture needs and named required development activation gaps. No measured parallel-speed claim is made.

Knowledge applied: library/playwright-utils mandates (two gates), data-factories, fixture-architecture, component-tdd, network-first, selector-resilience, timing-debugging, test-quality, test-healing, confidence-gate, Pact MCP fallback and the existing epic test levels/priorities. Supabase skill security principles were consulted for existing RLS/current membership/column grant boundaries; this phase implements no Supabase feature or schema. No broker/provider states or live observations were invented.

## Implementation activation checklist — required development work

The following are **required development obligations**, including every remaining fixture/assertion gap. None is deferred release work or covered by a skip. New test-local fixtures may compose existing primitives within each new suite; any edit to shared helper/factory/admin-SQL/envelope-fixture paths needs Root's exact allocation before the write.

- [ ] T1: implement and unit-pin complete logical-group normalization with multi-person/multi-booking associations, distinct counts, labelled scope and Stockholm date windows. Exclude retained resolved associations from active reconstruction. Test unknown/out-of-order reads separately from a successful engine scan.
- [ ] T1/T3: pin the 14-local-date/15-minute/10-result suggestion bounds, exact boundary candidates, same elapsed timed duration/local-day all-day span, spring/fall Stockholm DST, actual schedules/load and candidate-only conflict filtering. Unknown/malformed facts and cancelled candidates cannot be available; unrelated tenant conflicts do not suppress a valid suggestion. Preserve independently null versus empty per-job inputs and job identity.
- [ ] T2/T3: implement one checked atomic resolver transaction and append-only manager-scoped ledger. Prove exact candidate overlay, complete selected groups, disappeared target resolved rows/outcome/actor/SQL timestamp, and honest surviving/new warnings with independent physical rows in both tenants.
- [ ] T2/T3: genuine issued resolver proofs must reject workflow-only changes (open/accepted/reason/outcome), description/customer/editable-field changes, fact changes and full series-version/fingerprint changes. Exercise actual latest effective SQL checked RPC as well as command wrappers. Genuine editor, series and job-card proofs first verify in their own domains, then fail substitution into resolver and vice versa. Preserve the existing exact 13-claim domains/order; never mock verification.
- [ ] T2/T3: deterministic role-revocation-while-waiting and authority-revocation-on-exact-replay proofs; observe actual blocking/lock acquisition through bounded barriers, not sleeps. Cover concurrent identical commands, different commands for the same reviewed target, changed payload under an existing key, response-loss retry and expired-transport authorized replay. Recheck current role even on replay.
- [ ] T2/T3: inject correlation-scoped failures after booking/assignment mutation, conflict decision, ledger/outcome, audit and in-app notification stages. Show the stage was reached before raising, then compare complete physical snapshots (all columns, private outcomes, timestamps, both tenants). Local fault hooks require Root's isolated serial DDL/resource lane; no global test-hook mutation is authorized by this scaffold.
- [ ] T2/T7: execute each current effective writer separately: `booking_commit_editor_internal` (20261007120235 plus current v3 outer finalizer), `finalize_booking_series` (20261019220000), `finalize_job_card` (20261019133200). Unchanged accepted identity retains actor/reason/time; absent resolved rows and immutable ledger/replay remain; returning resolved identity reopens; changed collision opens. Test an accepted or newly derived target and terminal history through all three writers. No edit of historical migrations 105/106/107.
- [ ] T4/T6: manager-only queue/detail/history/suggestions and safe contextual projection. Own-only Montör/View cannot gain peer authority; allowed multi-role caller is a positive control. Direct RPC/table reads and DML, anonymous, foreign, inactive/revoked and same-tenant-reference negatives must match actual column grants and checked minimal history projection; do not assume wholly private table SELECT if safe columns are intentionally granted. Private request/result/proof/outcome fields remain denied.
- [ ] T5: actual before/after active-assignee union (including affected actor), safe former-assignee wording, self-scoped preference/recipient reads, event+recipient dedupe, two same-day events, and current in-app opt-out. SQL persistence must reject `booking.changed`/`email` preferences and deliveries even with existing email activation enabled; UI/registry hiding is insufficient. Preserve quote email regressions; no mail/provider/outbox producer activation.
- [ ] T3/T6/T7: common fix uses the current bounded segment and current version, preserving stable IDs/nominal indices/rule anchor/bounds, exceptions, cancelled tombstones and neighboring segments. Preview/review every warning beyond ten; no blanket acceptance, original-count restart, lineage traversal or per-occurrence committed loop. Acceptance alone cannot update bookings or create recurrence exceptions.
- [ ] T6/T8: reconcile actual browser selectors and real isolated setup; activate the essential production-host chip/booking glyph → labelled queue → complete detail → fix/accept → reload/history/affected notification flow. Include bounded series and desktop/360×640 keyboard focus/input-preserving explicit retry with success only after server-confirmed physical persistence. Do not replace with `next dev`, fabricated success, receipt-only state or mocked command results.
- [ ] T7/T9: applicable static/build/frozen-install/audit checks, `SUPABASE_TEST_REQUIRED=1` full integration/RLS with executed/failed/skipped totals, focused resolver plus unchanged single/series/job-card/notifications regressions, combined-history migration/seed/H4/policy agreement, direct recovery-Storage integrity, essential auth/browser smoke and independent Sol High review of actual sensitive diff. Prior-story/baseline CI is not 15.3 coverage.
- [ ] T9: author refreshes Suggested Review Order and exact-revision delivery evidence, including contract reconciliation and independent provenance. Root must run delivery_gate before done/development-complete claims. This ATDD run does not update the story, state, sprint, ledgers, Git or release status.

## Deferred release validation

Owner: Root coordinates QA/release validation. Status: deferred, no evidence yet. Scope: exhaustive browser/device/gesture matrices, screenshots/visual comparison, manual assistive-tech/daylight/exploratory walkthroughs, representative performance certification and polish. Next action: schedule and record each required release result against the final epic revision before release-ready approval. Essential broken functionality, tenant/authorization, proof/replay, transactional integrity and the development obligations above cannot move into this category.

## Green and refactor handoff

Primary level: DB/API through the existing authenticated command and checked SQL seams, not an invented HTTP boundary. Begin the authorized `bmad-build` implementation with the frozen spec and this checklist; `automate`/trace follow after actual implementation. Bind/reconcile one new scaffold at a time, remove its skip, confirm behavioral RED, implement, verify GREEN with independent persisted expectations, then refactor while preserving the invariant. A missing import is only missing-seam evidence and must be replaced by actual behavioral failures/passes during build.

Do not create a production export solely to satisfy a test-owned normalization type. Adapt the suite's local binder to real command/read-model/proof signatures and keep request-bound authenticated clients. Factory and binding names never grant authorization.

No new shared factory, fixture module, dependency or mock provider is created in ATDD. Existing UUID-based booking/tenant factories supply unique data and owned-row cleanup. New test-local setup must add cleanup for the append-only ledger and notification rows in the test-owned tenant lifecycle before activation; preserve production append-only constraints. External mock endpoints are N/A. No live provider, email, browser, DB or local service was contacted or started.

## Commands for the implementation owner

These future execution commands require Root's isolated resource/fixture admission first and are **not executed by this ATDD run**:

```powershell
# After reconciling and activating the current task's integration scaffolds:
$env:SUPABASE_TEST_REQUIRED = '1'
pnpm exec vitest run tests/integration/commands/conflict-resolver.int.test.ts tests/integration/rls/conflict-resolver.rls.test.ts tests/integration/read-models/booking-conflicts.int.test.ts

# Required complete current-history integration/RLS lane; inspect real counts:
pnpm run test:int

# Essential browser only, using the configured production web server:
pnpm exec playwright test tests/e2e/conflict-resolver.e2e.spec.ts
# Optional local diagnostics in the already admitted dedicated browser lane:
pnpm exec playwright test tests/e2e/conflict-resolver.e2e.spec.ts --headed
pnpm exec playwright test tests/e2e/conflict-resolver.e2e.spec.ts --debug

# Applicable ordinary development checks remain required:
pnpm run verify:development
pnpm audit --audit-level=high
```

No coverage instrumentation is introduced; coverage percentages are N/A. Assert actual command outcomes and physical state rather than using line percentages or skip totals as evidence. Scope test durations only after execution; no runtime/performance estimate is inferred from scaffold size. This run makes no implementation-hours estimate; Root's T1–T9 plan remains the scheduling source.

The spec is frozen and outside this delegate's write scope, so no `Dev Notes` subsection is inserted. Manual handoff: pass this checklist, its frontmatter generatedTestFiles and `atdd-15-3-red-evidence.json` with the unchanged `spec-15-3-conflict-resolver.md` to the build delegate. Do not flip status or consume a review round from ATDD metadata alone.
