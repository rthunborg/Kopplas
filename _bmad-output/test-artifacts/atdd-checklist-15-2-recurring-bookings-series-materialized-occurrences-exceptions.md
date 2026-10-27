---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-19'
storyId: '15.2'
storyKey: '15-2-recurring-bookings-series-materialized-occurrences-exceptions'
storyFile: 'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/_bmad-output/implementation-artifacts/spec-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md'
atddChecklistPath: 'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/_bmad-output/test-artifacts/atdd-checklist-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md'
workflowType: 'testarch-atdd'
generatedTestFiles:
  - tests/integration/commands/booking-series.int.test.ts
  - tests/integration/rls/booking-series.rls.test.ts
  - tests/e2e/booking-series.e2e.spec.ts
  - tests/integration/components/booking-series.test.ts
  - tests/unit/features/scheduling/recurrence.test.ts
  - tests/unit/features/resources/booking-series-state.test.ts
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md
  - _bmad-output/auto-bmad/preparation/story-15-2/implementation-ownership-handoff.md
  - _bmad-output/auto-bmad/preparation/story-15-2/post-integration-refresh-33c68c5a/integrated-source-contracts.md
  - _bmad-output/auto-bmad/preparation/story-15-2/post-integration-refresh-33c68c5a/ownership-reconciliation.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - package.json
  - vitest.config.ts
  - playwright.config.ts
pact_mcp_reachable: false
requestedExecutionMode: auto
resolvedExecutionMode: subagent
---
# ATDD checklist — Story 15.2

## Preflight and generation choices

Rasmus's approved P3 handoff authorizes ATDD only at source HEAD eb3da24daf45a13e2a29fffb020d4cd9c0c65879. The unchanged spec's historical planning-only stop text is provenance, superseded for this run by Root's explicit ATDD assignment. Eight ACs and nine tasks are loaded. No implementation completion or review round is claimed.

Detected frontend (Next/React; no mobile indicators) with existing Node pure-unit, Vitest integration/SSR, and Playwright production-server runners. AI generation from approved spec and actual provider source is selected; no browser, database, managed runtime, service mutation or legacy evidence is authorized. Questions in this workflow are answered autonomously by the delegate.

Primary level: checked command/SQL integration, with pure calendar goldens, headless state/SSR contracts and essential real-host browser smoke at their distinct seams. All committed acceptance scaffolds use test.skip; the pure unit copy will be activated temporarily to observe actual RED without touching source implementation.

Both library flags are true but @seontechnologies/playwright-utils and @seontechnologies/pactjs-utils/Pact are absent from package.json. Their two-gate mandates therefore prohibit unresolved imports and permit the current project fixtures; no dependencies/config are changed. A future separately authorized framework task can install the utilities and wire merged fixtures/auth-session. No external independently deployed consumer/provider contract boundary is introduced.

Pact broker: unreachable (SmartBear MCP tools not available). Provider states derived from provider source. One tool-list capability check only; no broker calls.

Routing: this sensitive authorization/transaction task runs gpt-6.1-sol High. Step 4 workers also run Sol High; subagent support exists, native agent-team support does not, so auto resolves to subagent. Workers are awaited before aggregation.

## Acceptance strategy

| AC | Priority | Distinct test responsibility |
|---|---|---|
| AC1 | P0/P1 | Pure daily/ISO weekdays/anchored biweekly/monthly absent-date and end validation, independent UTC/DST/all-day/overnight goldens; full admission failure, no truncation |
| AC2 | P0/P1 | Headless latest preview/save admission; actual editor first ten/glyphs/full warnings beyond ten and failed/stale admission |
| AC3 | P0 | Checked real batch finalization snapshots: seven durable surfaces atomic, race/replay/content conflict, fault rollback and exact retry identity |
| AC4 | P0 | Edit/cancel retained UUID/nominal slots; exceptional tombstone suppressed during re-expansion and visible after reload |
| AC5 | P0 | Stored nominal pivot, prefix/suffix lineage, unchanged-time UUID, retained exceptions/tombstones; stale/racing split atomicity |
| AC6 | P0 | v3/v1 complete per-job/null-empty facts; one overlay/detector/finalizer; full affected logical groups, stale/forged/cross-domain proof negatives, unchanged acceptance |
| AC7 | P0 | Current role before replay/after gate wait; RLS/grants/direct RPC/DML/tenant/reference negatives; manager valid optional-link standalone regression |
| AC8 | P1 | Essential production-host persistent flow, 360×640 keyboard scope and unsent/unknown explicit retry; safe metadata across five views/own agenda |

## Progress

Steps 1–5 complete. Both High Sol workers completed synchronously and their full-content JSONs match their disk files. Aggregation found 110 planned cases and zero active canonical test registrations; all are intentional test.skip scaffolds. The bounded temporary pure activation executed 46 cases, all failed at missing production modules; no behavioral assertions passed. Fixtures remain loud-failure contracts. This completes ATDD only; development and release readiness are not claimed.

## Story summary and handoff

Planners need finite repeated bookings that materialize as real rows, retain exceptions/cancellations and split lineage, and preserve current tenant, conflict-proof and replay authority. The approved nine tasks/eight ACs remain unchanged. Scope is recurrence only; later resolver/feed/Min dag/AI/offline surfaces are excluded.

The canonical story file is deliberately unchanged under Root's ownership instruction. These artifact links are recorded here for the implementation author; do not backfill the spec or historic Suggested Review Order during ATDD. The future implementation author must add one final verified Suggested Review Order and actual delivery evidence at T9.

## Red-phase scaffolds and exact status

All paths below are relative to the owned project root recorded in frontmatter. Line counts and SHA256 values are recorded in [atdd-summary.json](story15-2/atdd-summary.json).

| Artifact | Lines | Planned cases | Status / expected activation failure |
|---|---:|---:|---|
| [Command integration](../../tests/integration/commands/booking-series.int.test.ts) | 601 | 37 | Skipped, unexecuted; real series commands/SQL/adapter absent |
| [RLS integration](../../tests/integration/rls/booking-series.rls.test.ts) | 228 | 14 | Skipped, unexecuted; real series schema/authority/adapter absent |
| [Essential browser journeys](../../tests/e2e/booking-series.e2e.spec.ts) | 357 | 6 | Skipped, unexecuted; actual recurrence UI/action/SQL bindings absent |
| [SSR structure](../../tests/integration/components/booking-series.test.ts) | 77 | 7 | Skipped, unexecuted; recurrence components absent; no DOM interaction credit |
| [Pure recurrence](../../tests/unit/features/scheduling/recurrence.test.ts) | 125 | 34 | Canonical skipped; temporary activation fails missing recurrence.ts |
| [Headless state](../../tests/unit/features/resources/booking-series-state.test.ts) | 61 | 12 | Canonical skipped; temporary activation fails missing booking-series-state.ts |
| **Total** | | **110** | **0 passing acceptance cases** |

The 11 independent hand-calculated synthetic [calendar goldens](../../tests/fixtures/golden/scheduling/recurrence.json) pin monthly skips, leap day, selected ISO weekdays/inclusive end, anchored biweekly count, spring/autumn weekly UTC changes, gap/fold policy, local-midnight all-day, overnight endpoints and microseconds. They are approved-contract expectations, never legacy observations and never generated by the SUT.

The API worker JSON [tea-atdd-api-tests-2026-10-19-story15-2.json](tea-atdd-api-tests-2026-10-19-story15-2.json) contains complete test contents and 51 per-case AC mappings. The E2E worker JSON [tea-atdd-e2e-tests-2026-10-19-story15-2.json](tea-atdd-e2e-tests-2026-10-19-story15-2.json) contains complete test/support contents, six journey mappings, selector provenance and future binding needs. Matrix loops inside command/RLS cases are not counted as extra registered cases.

## Concrete AC trace (planned coverage, not a pass)

| AC | Scaffold IDs and consequential expectation |
|---|---|
| AC1 | TEA15.2-UNIT-001/002; 15.2-INT-031,035–037. One complete shared expansion; strict finite validation, UTC goldens, resource/transport boundary and boundary+1, no truncation |
| AC2 | TEA15.2-STATE-001; TEA15.2-COMP-001; 15.2-E2E-002–004. First ten/glyphs plus complete suffix warnings; latest/current preview required |
| AC3 | 15.2-INT-001–009,023–025,035–037; RLS-004; STATE-002; E2E-005. Atomic full durable state; replay/race/key conflict/fault/lost response; exact immutable retry |
| AC4 | UNIT-002; INT-027,028,033,034; RLS-005,008; E2E-001,006. Stable actual UUID/nominal identity, omitted exceptions retained, exceptional tombstone never resurrected |
| AC5 | UNIT-002; INT-028–031,033; RLS-008,013; E2E-001. Stored nominal pivot, prefix/suffix ownership and count semantics, stale/raced split has no partial successor |
| AC6 | INT-001,005,007,008,010–023,032,034,036; RLS-009,010; E2E-002,004. Complete v3/v1 per-job facts/null≠empty, separate proof/metadata domain and digest, complete affected-ID logical groups, exact selection, current facts |
| AC7 | RLS-001–014; INT-006,016–018,024–026. Current normal JWT/multi-role authority before replay and after gate wait; exact grants/RLS/direct RPC/DML/tenant negatives; own-only Montör and valid standalone optional links |
| AC8 | STATE-001/002; COMP-001; E2E-001–006. Real-host reload/persistence/markers, phone keyboard scope, labelled unsent/unknown and explicit retry; inherited focused 15.1 regressions still required during implementation |

TEA design aliases TEA15.2-INT-001…005 map to the finer 15.2-INT-001…037 plus RLS families above; TEA15.2-COMP-001 maps to SSR structure plus the essential browser journeys for actual interaction/persistence. SSR cannot satisfy keyboard, CSS, phone layout or persistence requirements.

## Actual verification and limits

Source revision: eb3da24daf45a13e2a29fffb020d4cd9c0c65879. Read [verification-receipt.json](story15-2/verification-receipt.json), [scaffolds-receipt.json](story15-2/scaffolds-receipt.json), [activate-receipt.json](story15-2/activate-receipt.json), [scaffolds.tap](story15-2/scaffolds.tap) and [activate.tap](story15-2/activate.tap). Receipt hashes bind the canonical pure inputs; activation changes only skip markers and copy-relative import/fixture paths in retained test artifacts.

| Actual command | Native exit | Actual result |
|---|---:|---|
| node _bmad-output/test-artifacts/story15-2/validate-atdd.mjs | 0 | Worker JSON/disk equality, 10 canonical files, 0 active canonical test sites; refreshed after callback-name fix |
| node _bmad-output/test-artifacts/story15-2/run-pure-red.mjs scaffolds | 0 | 46 discovered, 0 passed, 0 failed, 46 skipped; no acceptance credit |
| node _bmad-output/test-artifacts/story15-2/run-pure-red.mjs activate | 1 | 46 executed, 0 passed, 46 failed, 0 skipped; expected ERR_MODULE_NOT_FOUND / ERR_TEST_FAILURE |
| pnpm exec tsc --noEmit --incremental false | 0 | Semantic scaffold validity only; no product build or runtime pass |
| pnpm exec eslint (nine new canonical TS files and two artifact runners; receipt records list) | 1 | Only two false-positive React hook diagnostics for Playwright callback variable use |
| pnpm exec eslint tests/e2e/support/booking-series-atdd.ts | 0 | Callback renamed provide; JSON source refreshed. Other files were clean in the original focused invocation |

Underlying bounded native RED command: node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=tap _bmad-output/test-artifacts/story15-2/red-activation/recurrence.test.ts _bmad-output/test-artifacts/story15-2/red-activation/booking-series-state.test.ts. The two retained activated copies are evidence artifacts outside configured test discovery; the six canonical scaffold files remain skipped. No API/RLS/SSR/E2E bodies executed, no browser or managed resources started, no DB mutation, no broad implementation review or prerequisite CI re-run. A missing-module failure verifies red activation only; it proves no recurrence behavior.

## Data factories and exact implementation bindings

- [booking-series-unit-atdd.ts](../../tests/support/booking-series-unit-atdd.ts): baseRule, persistedSlot, seriesState factories with overrides. Crypto UUIDs isolate identities; literal calendar values express the tested domain. Faker is absent, so no dependency is added. RecurrenceBindings is a TEST-OWNED normalized adapter: expandRecurrence(unknown) returns complete occurrences/first-ten preview or a failure without partial occurrences; recurrenceLimits exposes the documented common admission ceilings; reconcileOccurrences returns retained/generated/tombstone/prefix/suffix rows. The loader currently looks for those exports in the future src/features/scheduling/recurrence.ts. The implementation author may bind differently named exports here while preserving every behavior assertion.
- The same helper's StateBindings normalizes applySeriesEvent, canSaveSeries and seriesRetryAttempt from future src/features/resources/booking-series-state.ts. Candidate/request/version/fact/pivot/ID changes invalidate review; unknown outcome retains the exact Attempt. These names/event shapes do not prescribe a public product API.
- [booking-series-atdd.ts](../../tests/support/booking-series-atdd.ts): loadBookingSeriesBindings deliberately throws. Bind SeriesBindings.command through real createBookingSeries/updateBookingSeries + runCommand and normal authenticated clients. withFixture/seed use fresh owned tenant A/B/roles/jobs/persons/correlations and finally-only owned cleanup. snapshot/occurrences/series/conflicts/outcomeRows/auditFor read real rows including timestamps, private outcomes and both tenants, with deterministic ordering. facts/proof read real canonical SQL text/digests/bytes. The worker JSON and this interface enumerate concrete changeCurrent/attack/crossProtocol/race/loseResponseThenRetry/observeCommand/withFault/revokedWhileWaiting/assigneeRetention/admissionProbe/jobCardInterleave/read/direct/dml/sqlInventory/sqlAcls/tableSecurity helpers. None may derive expected output from the engine under test, replace a denial with a synthetic result, or mock success.
- [E2E booking-series-atdd.ts](../../tests/e2e/support/booking-series-atdd.ts): bindBookingSeriesHarness deliberately throws. Bind seed/snapshot to owned checked setup and independent SQL, observeNextSave/loseNextCommittedSaveResponseOnce to actual discovered Next server actions, and fail/hold/race/stale observers before triggering actions. attempts captures real immutable business attempts; settleTransport drains real lifecycle events without sleeps; dispose releases owned holds/listeners/routes/rows only. Use the existing guarded resourcePage after Root allocates the runtime. Never create a fake /api/booking-series endpoint or overwrite shared .auth credentials/roles.
- SSR bindings import future real BookingRecurrenceFields and RecurrencePreview components dynamically, normalized to FieldsProps/PreviewProps locally. Adjust only this test adapter for an equivalent approved props API; no new DOM library is required.

## Mock requirements and selector contracts

External service mocks: none. Conflict detection/proof/authority/transaction results must be real. Failure and lost-response seams are future test-only transport observation or correlation-scoped SQL faults; SQL fault hooks require an isolated serial lane, real stage reachability and finally restoration. No global trigger, key or shared fixture is changed here.

Existing host routes/selectors are source-inspected only: /login, /scheduling, /jobs; booking editor/save/retry/unsent controls; scheduling-view-schema and actual booking IDs. They were not browser-verified in ATDD. New proposed test-owned bindings are booking-recurrence-enabled/preset/end-mode/count/weekdays/preview/preview-row/all-warnings; preview rows carry data-nominal-date, preview carries current state/total/candidate description. E2E also proposes booking-series-conflict-glyph, booking-series-preview-retry, booking-series-scope-dialog and booking-series-scope-confirm. Scope names Endast detta tillfälle / Detta och kommande and exception wording avviker från serien come from the approved story. Exact selector provenance and semantics are in the E2E JSON. Keep new controls accessible using current design-system conventions; these bindings are not observed legacy design evidence or additional product decisions.

Playwright Utils deviations: the dependency is absent, so the package gate is closed. Existing guarded fixture composition and real sign-in are used in tests/e2e/support/booking-series-atdd.ts:5,152 and tests/e2e/booking-series.e2e.spec.ts:24; one-line source comments and the E2E JSON record the reason. A separately authorized framework task would need package installation, merged fixture/auth provider wiring and migration of transport observation. Pact is N/A: package absent and no independent consumer/provider boundary. No unavailable imports are emitted.

## Implementation checklist and activation

- [ ] T1: Implement the single pure expansion/diff and common admission bounds; bind RecurrenceBindings. Activate UNIT-001/002 cases task-by-task, first observe missing implementation RED, then actual behavioral assertions and green. Never regenerate the independent golden expectations from production code.
- [ ] T2: Under the already allocated exact ownership delta, implement the reserved forward migration/constraints/checked wrappers/FORCE RLS/grants/audit/outcomes and only booking_series H4/manifest additions. Bind real table/security/readback adapters. No shared fixture or migration was edited by ATDD.
- [ ] T3: Implement normal authenticated series envelope commands, full v3/v1 batch snapshot/proof/output and one transaction finalizer. Preserve exact legacy 13-field order and single/card domains; bind complete series metadata digest separately. Activate INT-001–026,032,035–037 and RLS negative cases using an allocated guarded isolated DB.
- [ ] T4: Implement safe occurrence metadata projection and checked one-occurrence exception/cancel edits. Activate INT-027–030,033,034 and own-only/direct-DML/RLS cases; preserve standalone optional links and existing 15.1 focused read/editor/Contract D regressions.
- [ ] T5: Bind headless state/actions with immutable attempts, latest preview/current review and explicit retry. Activate STATE-001/002; unknown attempt must never silently become a fresh command.
- [ ] T6: Bind recurrence fields/preview and accessible edit scopes to the actual editor/hosts. Activate seven COMP-001 SSR cases. Verify focus/layout/persistence through E2E, not SSR.
- [ ] T7: Bind every real integration helper before removing skips; preserve independent fixture expectations and exact raw durable snapshots. Execute required full DB/RLS with SUPABASE_TEST_REQUIRED=1 and report executed/skipped counts; direct physical recovery Storage remains mandatory. Fault/gate tests require actual observed barriers and coordinator-owned serial DDL window.
- [ ] T8: Bind the real production Next host and six essential browser journeys; execute create→reload→edit/cancel→split→reload, complete warnings, stale review, exact lost-response retry and 360×640 keyboard/unsent behavior. Failure of essential functionality blocks development.
- [ ] T9: Record actual static/build/focused integrity/full REQUIRED DB/RLS/direct Storage/essential-browser evidence and independent High review; implementation author refreshes one Suggested Review Order and the delivery JSON. Root owns state/sprint/aggregate/ledger/checkpoint/CI/Git. No commit, PR, merge or deployment is authorized by ATDD completion.

Estimated effort: not estimated by this ATDD phase; the approved implementation tasks remain authoritative. After green, refactor proportionally while retaining independent acceptance assertions, cross-domain negatives and scoped fixture ownership. The next workflow is the approved implementation/build phase; post-implementation automate/trace can consume this checklist and the worker JSON mappings.

Future allocated-runtime commands:

```powershell
node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/scheduling/recurrence.test.ts tests/unit/features/resources/booking-series-state.test.ts
$env:SUPABASE_TEST_REQUIRED='1'
pnpm exec vitest run tests/integration/commands/booking-series.int.test.ts tests/integration/rls/booking-series.rls.test.ts tests/integration/components/booking-series.test.ts
pnpm run test:int
pnpm exec playwright test tests/e2e/booking-series.e2e.spec.ts --reporter=list,json
```

These commands are future activation instructions, not claims of execution here. Use Playwright's configured production server and guard-owned resources, never next dev or native Supabase lifecycle/reset commands.

## Deferred release validation (not development evidence)

| Scope | Owner | Status/evidence | Concrete next action |
|---|---|---|---|
| Exhaustive five-view/device/gesture/browser permutations | QA | Deferred; no ATDD runtime | Plan and execute expanded matrix after essential flow is green |
| Screenshot comparison/visual/manual accessibility/daylight/exploration and polish | QA/UX | Deferred; no visual/manual pass | Validate implemented screens with accessible keyboard/phone baseline retained in development |
| Representative performance certification and inherited Epic14 advisories | Product/Architect/QA | Deferred existing context; no recurrence performance pass | Reconcile workloads/advisories and capture separate release evidence |
| Release readiness, merge and deployment approval | Owner/Root | Not granted by this phase | Obtain applicable actual validation and existing approval gates separately |

Root/implementation author carries these scoped owner/status/next-action records into the canonical delivery/deferred ledger later; ATDD does not edit aggregate artifacts. Consequential authorization, persistence, conflict, replay or essential usable-flow failures are development blockers, never polish.

## Workflow validation outcome

- [x] Approved eight ACs/nine tasks, framework/source contracts, ownership and current policy loaded; workflow customization resolved with no extra facts/hooks.
- [x] AI generation selected autonomously; subagent capability probed, two sensitive High Sol workers completed and awaited.
- [x] Six canonical test files use test.skip; no active passing acceptance scaffolds, focus markers or placeholder true assertions. Given/When/Then intent is explicit in bodies/comments; multiple assertions serve one invariant rather than unrelated concerns.
- [x] Factories/support files exist and declare exact scoped future setup/readback/cleanup. No Faker/utilities dependency or config change; no unsupported import.
- [x] All eight ACs mapped, independent calendar goldens retained, mock/selector/binding requirements named, implementation and activation instructions persisted.
- [x] Actual bounded RED/counts and static validity recorded with limits; no skipped coverage credit, DB/browser/runtime mutation or implementation-complete claim.
- [x] Story preserved by explicit ownership rule; artifact discovery links live here. Review rounds remain 0/3, implementation author owns future Suggested Review Order.

Open questions: none requiring a human for ATDD. Existing engineering choices (numeric occurrence admission bound, new series-domain spelling and proportional source APIs) belong to implementation under the approved contract; bind adapters after inspecting actual source, never invent a product decision. ATDD blockers: none. Future runtime bindings and required development evidence are intentionally outstanding implementation work.

