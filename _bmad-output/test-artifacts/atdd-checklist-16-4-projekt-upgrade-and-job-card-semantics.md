---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-20'
workflowStatus: 'completed'
workflowType: 'testarch-atdd'
tddPhase: 'RED scaffolds; not implementation acceptance'
storyId: '16.4'
storyKey: '16-4-projekt-upgrade-and-job-card-semantics'
storyFile: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-4-projekt-upgrade-and-job-card-semantics-2.md'
atddChecklistPath: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/atdd-checklist-16-4-projekt-upgrade-and-job-card-semantics.md'
planRevision: 'f4b7e0a0a9747ab566e26588477b5960360a1395'
specSha256: 'a722320bc86a1e5e1b75f216b87d3a8a64eeb5f5170bbea930ef1dd45364ad13'
generatedTestFiles:
  - tests/integration/commands/job-upgrade.int.test.ts
  - tests/integration/commands/job-scheduling-consumers.int.test.ts
  - tests/e2e/jobs/job-upgrade.e2e.spec.ts
  - tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts
  - tests/unit/features/jobs/job-upgrade-domain.test.ts
  - tests/unit/features/jobs/job-scheduling-consumers.test.ts
  - tests/unit/features/scheduling/job-demand-advisory.test.ts
  - tests/unit/server/bookings/job-scheduling-protocol.test.ts
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-16-4-projekt-upgrade-and-job-card-semantics-2.md
  - _bmad-output/test-artifacts/test-design-epic-16.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - vitest.config.ts
pact_mcp_reachable: false
scaffoldScenarios: 47
integrationScenarios: 32
pureScenarios: 11
essentialBrowserScenarios: 4
fixturePaths:
  - tests/support/job-semantics-atdd.ts
---

# Story 16.4 ATDD checklist

Create/AI generation binds the exact approved -2 spec; no ambiguity lookup or old blocked artifact change. Seven ACs and TR08–10/TR13–16 govern the tests. Native Node pure/Vitest integration-RLS/production Playwright frameworks are present. Auto/probe selects foreground awaited sensitive Sol6.1 High workers. No services/DB/browser/resource launch is authorized; future required CI proves implementation. All persistent scaffolds remain skipped and unexecuted acceptance coverage.

P0 upgrade: same-ID manager-only one-way transition/event/audit, current authority/replay/CAS, exact downgrade code, durable related-row preservation and atomic faults. P0 actual consumers: complete both-kind card and current eligible lead/WO dependencies, new-only D elapsed default with explicit provenance, N×(D+T) once/job, same pool/window/post-edit booking inclusion on allocation and free capacity, candidate once/no forecast debit, distinct earliest/desired/latest and presence true/false/unknown. P0 proof: coherent booking-conflicts-v4/stockholm-capacity-v2 SQL/TS/current commit, obsolete correctly signed v3 denial and mixed-job facts isolation. P1 essential connected360×640 actual editor/card/upgrade persistence/failure/retry; release visual/manual/full browser breadth remains separately deferred.

Proposed domain/module/RPC/DTO/UI names are replaceable test bindings, not new product policy. Existing stable fixtures may be composed by a new thin16.4 adapter only. Existing tests/helpers/goldens are read-only during ATDD; implementation author owns their approved extensions. No unnamed project-only fields or17.2 payment plans; no optimizer/new hard block/lead grant/whole-E15 gate. Playwright-utils flag true/package absent means two-gate mandate inactive; preserve current fixture patterns without deps. Pact irrelevant/uninstalled, namespaceprobe false/no broker. Existing core/fixture/network/quality/selector/timing and Supabase/Postgres guidance applies. No legacy URL or evidence.

## RED deliverables and acceptance mapping

**47 persistent skipped scenarios**: 7 upgrade integration, 25 consumer/proof integration, 11 pure and 4 essential browser. Skips and collection are not executed acceptance coverage. All three full-content worker transports validated success, expected-to-fail metadata, actual matching bytes and skipped declarations; no placeholder assertion or active passing scaffold was emitted. No product/SQL/spec/existing test/helper/package/lock/state/Git changes were made.

| AC / transfer | Priority / scaffold IDs | Required behavior |
| --- | --- | --- |
| AC01/TR10 | P0 INT-U01/U02/U03/U05; U02; Upgrade-E01/E02 | Current manager atomic same-ID upgrade, status/source/customer/tenant/children/bookings/crew/WO/files unchanged; one event/audit; concurrency, lost reply, exact replay/identity and injected audit rollback. UI confirms durable transition before success. |
| AC02/TR10 | P0 U01; INT-U04/U05/U06; Upgrade-E01/E02 | Independent manager union/profileless authority; lead/ordinary/foreign/inactive/revoked denied, current role/parent after observed wait; exact reverse error below wrappers, direct privileged SQL guard, already-Projekt idempotence, old creation remains Order. Truthful confirmation and no downgrade control. |
| AC03/TR08–09 | P0 INT-C01 (both kinds); Upgrade-E01 | All existing complete-card fields, lead and actual WO dependency rows usable/persisted through actual card; protected values absent and no unnamed project-only/payment-plan data. Child/old dependency state survives. Existing16.1–16.3 regression contracts remain enabled and read-only in ATDD. |
| AC04/TR13 | P0 U03/U04/U06; INT-C02; Consumer-E01 | Actual job entry/BookingEditor uses D elapsed only for new no-explicit-end draft. Explicit/edit/user interval wins; job switch changes only untouched derived default; missing estimate retains honest60-minute fallback. Real preview/save/reload and newer draft retention. |
| AC05/TR14 | P0 U07–U10; INT-C03/C04/C05/C08/C10; Consumer-E02 | Total N×(D+T) once/job, actual allocation credit once, matched eligible pool/planned-window/inclusion, candidate identity overlay once, split/repeated actual occupancy, null versus T0, DST/day clipping/negative capacity. Real planned shortfall save proves advisory only; no estimate occupancy, forecast debit, crew multiplication of actual minutes, new override or persisted hard conflict. |
| AC06/TR15 | P0 U05/U06/U11; INT-C06/C07/C08/C09/C10/C11; Consumer-E01/E02 | Earliest bounds suggestions, desired soft miss and latest distinct breach; own-job facts across mixed bookings. All nine output-affecting job facts invalidate reviewed consent. Coherent v4/v2 snapshot/digest/current SQL, obsolete correctly signed v3 proof/receipt denial in booking/card finalizers, replay-only old finalizer cannot create. |
| AC07/TR16 | P0/P1 U05/U06; INT-C06/C08/C10/C12; Consumer-E01/E02 and Upgrade-E02 | Checked selected-job presence true/false/unavailable, no other-job/caller bleed, independent booking/tenant/CRM ancestry denial. Connected360×640 usable labels/errors/retry/refetch and retained newer input, with server-confirmed persistence. |

IDs above carry `16.4-` prefix: `U01–U11` pure; `INT-U01–U06` upgrade; `INT-C01–C12` consumers; `Upgrade-E01/E02` and `Consumer-E01/E02` browser. Parameterized cases create separate fixture lifecycles: two job kinds, four demand goldens, two obsolete finalizers, nine changed job facts and two upgrade lock changes. No nine fresh fixtures are aggregated into one30-second body. Component/state behavior uses headless pure contracts plus essential real editor journeys; no new component runner or generic framework.

## Approved numeric and semantic examples

D120 elapsed minutes, N2 people, T30 travel minutes per person means total300 person-minutes. Each tuple below uses identical selected pool/window for allocation and free capacity:

| Current-job allocated / gross capacity / all actual occupancy | Residual demand | Free capacity | Advisory shortfall |
| --- | ---: | ---: | ---: |
| 0 / 480 / 0 | 300 | 480 | 0 |
| 120 / 480 / 120 | 180 | 360 | 0 |
| 120 / 360 / 240 | 180 | 120 | 60 |
| 360 / 480 / 360 | 0 | 120 | 0 |

`remainingDemand=max(0,totalDemand−allocatedCurrentJob)`; `shortfall=max(0,remainingDemand−remainingCapacity)`. Both sides clip actual canonical post-edit booking/person overlaps to the same inclusive planned Stockholm calendar days and explicit distinct authorized eligible selected people. They do not use earliest/desired/latest as the capacity window, manufacture N people, count cancelled entries, debit forecasts or crew-multiply actual per-assignee minutes. Candidate replaces its previous identity exactly once. Two30-minute bookings×two people allocate120 like one60-minute booking. Missing required real input remains unknown; T0 is known. Negative free capacity remains visible; pure DST case preserves actual UTC minutes through the existing `prepareDailyCapacity` engine rather than candidate-excluding `calculateCapacity`.

Consumer/proof fixtures deliberately use explicit actual access windows. Empty `accessWindows:[]` retains its existing restrictive-known-empty meaning. INT-C05 previews/saves a nonconflicting planned10:00–10:30 local candidate after actual prior occupancy, with total300/allocation180/residual120/free60/shortfall60; it does not demonstrate nonblocking advice using only a cancelled candidate. Full current-fact variants cover D, N, T, planned start/end, earliest/desired/latest and presence individually.

## New files and infrastructure

| New file | Scenarios | Lines |
| --- | ---: | ---: |
| tests/integration/commands/job-upgrade.int.test.ts | 7 | 145 |
| tests/integration/commands/job-scheduling-consumers.int.test.ts | 25 | 259 |
| tests/unit/features/jobs/job-upgrade-domain.test.ts | 2 | 59 |
| tests/unit/features/jobs/job-scheduling-consumers.test.ts | 4 | 93 |
| tests/unit/features/scheduling/job-demand-advisory.test.ts | 4 | 113 |
| tests/unit/server/bookings/job-scheduling-protocol.test.ts | 1 | 64 |
| tests/e2e/jobs/job-upgrade.e2e.spec.ts | 2 | 261 |
| tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts | 2 | 272 |
| tests/support/job-semantics-atdd.ts | adapter, no tests | 143 |

One new thin adapter composes stable committed16.1/16.2/16.3 fixtures, normal-JWT commands/direct checked SQL, actual proof signers/observed locks/audit fault and durable snapshots. Existing factories own synthetic users/rows and teardown; admin SQL is only arrangement/readback/adversarial constraint testing. No new factory family, credential, runtime secret, private untracked import, bucket, environment or source fixture. Pure constants are intentional synthetic boundaries/numeric goldens; the pure tests never implement the business algorithm themselves.

## Binding assumptions, mocks and UI hooks

Future production export/RPC/DTO paths and result spellings in the new adapter are replaceable **test binding assumptions**, not prescribed new readers/endpoints or product decisions. Implementation may bind the existing safe card reader, real BookingEntry/BookingEditor composition and checked preview instead of adding `job-semantics` production modules. Keep the actual consumer/persistence/security assertions; never create a test-only successful calculation or substitute an isolated widget for the editor. Pure domain request/state spellings and helper expected-state representation can be reconciled with the final implementation without weakening closed-input/current-authority/replay rules. Different unit/integration DTO spellings are adapter translations, not duplicate policy.

New upgrade dialog labels/actions/test IDs and semantic booking hint/advisory regions/Next Action serialization are explicit replaceable proposals in browser files. Use the implemented design system and accessible labels. Existing card, login, job and BookingEditor labels are current source contracts. Required semantic surfaces: one-way upgrade confirmation; current kind/event; selected-job duration/provenance; earliest context, distinct desired/latest warnings, presence true/false/unknown; total/allocated/residual/free/shortfall advice; live error/status and reachable retry/refetch. The existing responsible manager field takes a person-profile ID, not a user ID.

No external-service mock or fake persisted success is required. Narrow one-shot transport-loss routes forward actual action requests, then lose the response only; unrelated requests continue, and durable snapshots/audit determine outcomes. Listeners are registered before triggers. No browser recording/oracle observation or hard wait was used. UI paths/DTOs must be reconciled before activation, rather than invented as verified observations.

## Actual checks and honest limits

- **Syntax:** installed TypeScript `transpileModule`,9new files,0syntax errors.
- **Typecheck:** absolute Node executing `node_modules/typescript/bin/tsc --noEmit --incremental false`, native exit0. Subsequent review correction replaced two string-valued manager user-ID references with existing profile-ID references; no type/API shape changed. No redundant compiler rerun was needed for that binding-only correction.
- **Meaningful RED:** temporarily activated only U11 in the actual-parser protocol file. `node --experimental-strip-types --import ./tests/support/register.mjs --test --test-name-pattern=16.4-U11 tests/unit/server/bookings/job-scheduling-protocol.test.ts` returned native exit1: **1failed/0passed/0skipped**. Real production canonical hashes and HMAC verified first, then actual `parseDetectionSnapshot` accepted the retired v3/v1 envelope, producing the expected missing-exception failure. This is an unmet semantic admission behavior, not an import/typo/static-constant failure or a demand that the low-level crypto verifier implement version policy.
- **Restore:** original persistent skipped bytes restored exactly; protocol SHA256 `CD9489526BFEA2DB742BFBFD0DA3AF95E2F0EA15F9BAAEE63B9DD7913F82E076`.
- **Saved pure collection:** Node `--test` across the four new pure files: native exit0, **11skipped/0passed/0failed**. No pure acceptance body ran in this registration check.
- **Browser collection:** Playwright CLI `test tests/e2e/jobs/job-upgrade.e2e.spec.ts tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts --list --reporter=list`: native exit0, **4Chromium tests listed in2files**. No browser, server or fixture execution.
- **Independent scaffold review:** context-free Sol6.1High, nine new files; PASS after two manager user-ID bindings were corrected to `f.fx.coworkerProfile.id` and the reviewer verified the final lines. The lead→manager session switch was checked against actual login behavior and is valid. No remaining consequential scaffold finding; no broad product review or runtime was performed.
- **Final aggregation:** refreshed full-content worker JSON matches all eight test files; 47persistent scenarios remain skipped. Code hashes below reflect the final profile-ID correction.

Commands used `C:/nvm4w/nodejs/node.exe` after explicit absolute worktree `Set-Location`, with no server/service launch. Existing Node package-type warning is not an application failure. DB/RLS/Storage, migration/reset/seed, real signed proof/finalizers/revocation/integrity, production build, full units/process/pilot and essential browser execution remain **unexecuted for16.4**. Prior16.3 CI is continuity only, never16.4 pass evidence. Future required DB uses `SUPABASE_TEST_REQUIRED=1` and actual executed/skipped counts through qualified root-owned CI. No local guard repair, actor-context reuse, resource adoption/native lifecycle or hosted fallback occurred. No CLI/browser session was opened, so no resource teardown is needed.

## Implementation activation checklist

- [ ] Reconcile future module/RPC/DTO/state/UI bindings against actual production seams and activate the relevant skipped case task by task. Establish meaningful RED before green; never count remaining skips as acceptance.
- [ ] Implement dedicated independent-manager one-way same-row upgrade, exact downgrade guard/result, canonical identity/current-role/target locks, replay/idempotence and atomic event/audit; preserve every old writer/source lock/linked identity. Activate INT-U and U01/U02 plus actual upgrade UI.
- [ ] Complete actual both-kind card fields/lead/WO consumers without unnamed project-only data, duplicated storage, E17 payment data or lead full-card authority. Activate INT-C01 and Upgrade-E01; preserve existing shared regression/inventory contracts.
- [ ] Implement new-only D elapsed default and interval provenance through real job entry/selection/BookingEditor; preserve explicit/edit/user/newer/uncertain input and honest fallback. Activate U03–U06, INT-C02/C06/C12 and Consumer-E01.
- [ ] Implement approved advisory using existing exact interval preparation, matched authorized pool/planned-window/inclusion and canonical candidate once; no forecast debit or hard conflict/override/block. Activate four pure demand cases, actual numeric/split/missing/T0 cases and planned advisory save/E02.
- [ ] Implement the coherent High SQL/TypeScript `booking-conflicts-v4` + `stockholm-capacity-v2` transition across authoritative per-booking facts, proposed-card overlay, snapshot/digest, review receipt and BOTH real booking/card finalizers. Preserve actor/tenant/action/expiry/request/review/old replay-only/current-authority/atomic refresh. Reject correctly signed retiredv3; activate U11, INT-C07–C11 and stale/refetch browser checks. Do not use parser relaxation as the implementation.
- [ ] Implementation author owns approved existing shared tests/helpers/goldens/inventory extensions, including complete capacity/conflicts/batch/DST goldens and exact ACL/role enrollments; no directory-wide E15 allocation or whole-epic ACK gate. Append the TWO new E2E paths to `test:smoke` **before** final `--reporter=list,json`, preserving all prior paths/dependencies/CI.
- [ ] Under root-owned qualified exact-head CI, execute static/full units/build/containment/audit/lock/process, empty-database forward migration/seed/reset, full required integration/RLS/direct recovery integrity, focused upgrade/proof/numeric/race and essential production Chromium smoke. Keep each runtime fixture budget bounded; split heavy cases rather than raising the global timeout or dropping assertions. Retain independent sensitive review/SRO/evidence before root's development gate. Root owns Git/state/CI/commit operations; this checklist does not authorize deployment.

Focused prospective commands: `pnpm test:int -- tests/integration/commands/job-upgrade.int.test.ts tests/integration/commands/job-scheduling-consumers.int.test.ts` with required flag and qualified isolation; Node pure runner for the four new files; `pnpm exec playwright test tests/e2e/jobs/job-upgrade.e2e.spec.ts tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts` through the configured production server. Headed/debug execution is a later explicitly qualified interactive verification choice, not executed here. Focused commands supplement the canonical full development policy, not replace it. Eight activation tasks are a handoff contract; no new implementation effort estimate or ready/done promotion is asserted.

## Routing, workflow and deferred work

This delegate retained Sol6.1High. API, pure and E2E authors plus independent scaffold reviewer were all explicitly `gpt-6.1-sol` High/context-free and foreground awaited. Actual step files are `step-04a-subagent-api-failing.md` and `step-04b-subagent-e2e-failing.md`; AI/Create selected autonomously. API and pure began together; E2E had two proven capacity refusals, then launched after the pure author returned terminal under root's bounded fallback. No accepted dispatch was blindly retried, no detached work and no speedup claim. Installed customization has no prepend/append/persistent facts or completion action. Exact source path/hash remains above; no spec backlink/edit was permitted, so this frontmatter is the manual implementation handoff.

Core data-factory/component-TDD/quality/healing, fixture/network-first/selector/timing, Playwright/library/Pact capability and Supabase/Postgres security/lock guidance were applied. Playwright-utils flag true/package absent makes the two-gate mandate inactive; current resourcePage/login/normal-JWT fixtures and documented vanilla hydration/action observation/one-shot response-loss deviations remain. An auth provider/merged-fixtures/package migration belongs to a separately authorized framework task, not these skipped tests. Pact is irrelevant/uninstalled and namespace probe false; no broker call or invented contract state. No secret/credential or additional resource is needed to finish ATDD.

Private full-content API/unit/E2E/summary workflow transports use `C:/Users/Rasmus/AppData/Local/Temp/tea-atdd-{api-tests,unit-tests,e2e-tests,summary}-2026-10-20T11-52-26-663Z.json`; RED log is `tea-atdd-16-4-parser-red.log` there. They are workflow transport evidence, not committed runtime prerequisites. This single checklist is canonical; no extra readiness/evidence packet was added.

Broad browser/device/role matrices, screenshot/visual inspection and manual keyboard/phone/desktop/polish remain owned release validation for the Kopplas release-validation coordinator (root owns delivery/ledger integration). Status: unexecuted/deferred. Next action: deliberately dispatch and record qualified release validation before release readiness. Required functional/auth/transaction/proof/DB/browser checks remain development work and cannot be reclassified as polish. No human question or ATDD blocker is open; no story-complete or release-ready claim.

## Final code-file SHA256

The checklist hash is returned separately to avoid self-reference.
- `tests/integration/commands/job-upgrade.int.test.ts`: `99FD474F6EB6F6D107F761741C25EFCD11BE95A4F1E0F8FC31DE513D9743CD6C`.
- `tests/integration/commands/job-scheduling-consumers.int.test.ts`: `0A1638BA15072B8AFEA0D478E435242E5DD07E8FC102061DB6AC8B8008F9C6E6`.
- `tests/e2e/jobs/job-upgrade.e2e.spec.ts`: `690D22B1C8C5BAC51EFCB91CFAF75076918C4D9CD0B068D526E6EDAFFD645A25`.
- `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts`: `A7DC64541D772E26AE09CCE53E4F3672414F884EA553CE022B7C6580E81FFCF5`.
- `tests/unit/features/jobs/job-upgrade-domain.test.ts`: `8ED111F23A0FD677825C8D125A006C98A6EB32EE8C41E58EAB0C6AC38E090E71`.
- `tests/unit/features/jobs/job-scheduling-consumers.test.ts`: `E8DC612BBE97C3F55AD4DE70574CB7275CCB1726492E3C9DB88D2A662DD3CACA`.
- `tests/unit/features/scheduling/job-demand-advisory.test.ts`: `16899D29AA852441E61F29EFE3322170C6E767B103B22A7DD2EAD3B616B4C546`.
- `tests/unit/server/bookings/job-scheduling-protocol.test.ts`: `CD9489526BFEA2DB742BFBFD0DA3AF95E2F0EA15F9BAAEE63B9DD7913F82E076`.
- `tests/support/job-semantics-atdd.ts`: `3D4D522F9FE1BBEC95BFB82B00C1EBD36EE9BE03CBD8845B55C51CDD074BC24F`.
