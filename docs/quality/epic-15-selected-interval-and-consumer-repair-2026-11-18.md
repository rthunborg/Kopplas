# Epic 15 selected-interval and consumer repair - 2026-11-18

Status at source freeze: the local corrections and bounded checks below are recorded; the final combined candidate has not executed hosted browser or visual qualification. `release_ready=false`. The frontend gate applies. All 25 release rows remain deferred. Six completed Epic 15 stories and PR108 retain their historical development-done status; this repair does not reopen or complete those stories, admit full Story35.15, or authorize main integration or production.

## Why these corrections are necessary

An explicit 30-minute calendar selection reached BookingEditor as a draft without the existing prefill provenance. A subsequently selected job could therefore derive a valid 60-minute end and silently replace the user's choice. SchedulingWorkspace now passes the original selected endpoints through BookingPrefill. Generic toolbar creation retains job-derived defaults; existing booking, series and resolver modes retain their contracts. Shared BookingEditor and all save/authority/schema behavior are unchanged.

Five test login guards assumed dashboard for fixtures whose real landing is my-day or membershipless root. The six-consumer correction binds each fixture to one exact expected URL while retaining role, invitation, session, outbox and notification assertions. Booking-editor tests enter the visible, hydrated Schema tab before their existing picker/chip and persisted-reload assertions. The separately reachable inline scheduling sign-in now expects my-day for its pure Montor fixture and dashboard for its denied fixture; its auth barrier, lifecycle labels, tamper checks and durable assertions remain intact.

Notification preferences were flat even though existing Story13.2 requires grouping by module. The component now partitions existing active preference DTOs into nonempty fieldsets/tables using manifest labels: Offerter and Scheduling, Time Reporting & Calendar Feeds. The outer accessible group remains exactly Notiskategorier. Essential controls, channel availability, defaults, excluded quote.delivery and the original GET/PUT/reconciliation/error handlers are preserved. The existing group test retains Offerter checks, asserts Scheduling placement/isolation, and uses the normal booking.changed switch to prove real PUT, reload GET/readback and confirmed UI restoration. The email-column locator is scoped to Offerter because there are now two tables. No registry, manifest, API, permission or shared harness changes are included.

## Provenance and actual local evidence

The repair branch is `codex/e15-selected-interval-repair-20261118`, based on frozen S `fe282c326b208788ef94a3717092057ab7e2e91e` from [draft PR158](https://github.com/rthunborg/Kopplas/pull/158). D1 caller plus two appended regressions were independently reviewed with zero findings and committed as `2a0d032a72e64f63a1e8896f4c5ac5b17b6c7512`. The six consumer files were committed as `141b8081f99cd824fe69e4be7eed3b3c00db6cac`. The present three-path correction and this documentary report follow those frozen changes; their reviewed published full SHA must be recorded by Root before qualification. The frozen S report and historical DONE specs are unchanged.

[Checkpoint44285601540](https://github.com/rthunborg/Kopplas/actions/runs/44285601540), attempt1 at the earlier candidate, failed: 11 unexpected, 1 flaky and 22 skipped, with cleanup/key-custody uncertainty preserved. Those results remain historical failures; they are not passes for this candidate and will not be relabeled or retried as attempt2. The one newly admitted purpose-bound case is for the changed combined candidate only, after targeted High review and publication.

Commands use Node22.23.2 and the checkout's locked dependencies. No local server, browser, stack, database or provider action was launched by the author.

| Boundary | Executed local result | Limit |
| --- | --- | --- |
| D1 existing calendar-components, job-scheduling-consumers and booking-editor-input tests | 49 passed, 0 failed/skipped | Existing actual-TSX hook/event ports and domain tests |
| Two appended selected-interval caller regressions | 2 passed, 0 failed/skipped; 51 distinct positive D1 cases total | Original caller supplied read-only to those same tests produces 1 pass/1 expected failure, proving lost-prefill detection |
| Six consumer source checks | Typecheck and scoped lint exit0; 17 actual login-function port cases and 1 public-tab port case pass | Synthetic ports do not prove a real session, permission decision or browser interaction |
| Current notification units | `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/server/notifications/registry.test.ts tests/unit/components/notifications/notification-presentation.test.ts`: 9 passed, 0 failed/skipped | Registry/presentation coverage |
| Current actual component and inline sign-in probes | 9 passed: active grouping, pending defaults, GET hydration, optional PUT/readback, failed PUT, failed GET, empty DTO projection and two exact role landings | Private actual-source hook/fetch/method ports; no browser/layout/image credit |
| Current static checks | `node node_modules/typescript/bin/tsc --noEmit --incremental false` and scoped `node node_modules/eslint/bin/eslint.js` for the three changed sources: both exit0 | No build or full unchanged suite claimed |

Private receipts retain preimages, exact patches, raw/LF hashes and logs under `release-validation-20261118/selected-interval-repair-author`, `six-consumer-repair-author` and `final-known-blocker-author`. Their scope/grant provenance is supplementary; the repository sources, commands and native checkpoint above make this report readable without private filesystem access.

Current exact reverse-edit proofs reconstruct the original component and scheduling file. Notification bytes before the approved group test, including the D2 sign-in helper, are identical; bytes after it differ only in the approved email-header locator. Every original D4 line remains in order. Test declarations and all scheduling capture code are conserved. The scheduling source has 12 lexical test calls which generate the configured 20 runtime cases; collection or source counts earn no execution credit. Prior D1 and other consumer postimages remain frozen.

## Frontend and final-head qualification

The actual Kopplas DESIGN/EXPERIENCE spines, Phase B UX and existing13.2/15.1/16.4 contracts govern. No promoted Figma reference was supplied for this bounded change. Existing spacing/typography are reused; no redesign, new tokens, state-forcing hook or framework is introduced. Project connected360x640 governs the phone viewport.

Root owns targeted independent High review of the latest changed sources/assertions, ordinary publication/CI/Preview and the single fresh supported full checkpoint on the actual reviewed branch/full SHA. The existing real scheduling regression at `tests/e2e/scheduling-views.atdd.e2e.spec.ts:292` must execute, alongside all20 configured scheduling cases/11 captures, seven diagnosed login-setup cases, two booking-workspace cases and the amended preferences case. Retain native first-attempt/retry/skip/failure counts and cleanup/key-custody receipts. No fourth broad historical-story review or unchanged known-failing rerun is requested.

The existing owned-connected-context test at `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:792` already captures authenticated GET200/no-alert/default preferences at1280x800 and360x640, named `owned-original-notification-preferences-real-defaults-{viewport}-released-after-auth-delete`. It must run on the final combined head and depict the new groups. No capture file was changed. Existing screenshots from an older head cannot be relabeled. Pending GET still displays defaults, failed GET/PUT still displays the existing alert, and absent stored rows still resolve defaults; local probes preserve those behaviors without inventing rendered-state passes. Independent image/state review and applicable authenticated human acceptance remain unearned at source freeze.

For D1, actual browser save/readback and revision-bound desktop/phone evidence must demonstrate the explicit selected interval before/after job choice, persisted reopen, Resources/dialog entry, generic toolbar derivation and unchanged edit/series behavior. QA/UX must reconcile applicable finished, loading, error, empty/default, cancellation/focus and failure/retry evidence. Root packages actual reviewed images and results into one phone-friendly human acceptance packet when substantive acceptance is required; this document requests no acceptance without evidence.

After publication, authoritative run URLs/full SHA, native reports, image binding/review, state applicability and acceptance results belong in the repair PR checks/package comments and attached evidence. Do not append successful run links through a new source commit solely to update this report and invalidate its candidate/image binding. Any necessary content fix requires qualification of the actual new head.

## Conserved release register and holds

The [existing 25-row register](epic-15-release-validation-2026-11-18.md#existing-25-row-release-register), [aggregate delivery](../../_bmad-output/auto-bmad/delivery/epic-15.json) and [accepted retrospective](../../_bmad-output/implementation-artifacts/epic-15-retro-2026-10-25.md) retain authority. The rows below preserve every ID, requirement, owner and deferred condition; this report closes none. Passing automated cases cannot certify representative performance targets, physical phone/daylight/one-hand/assistive validation, hosted feed enablement, cross-PhaseB stabilization or explicit owner release.

| ID | Story | Required release check | Owner | Status; next action |
| --- | --- | --- | --- | --- |
| E15-REL-01 | 15.1 | E15 remaining exhaustive calendar/actor/gesture browser combinations | Epic15 verification owner | Deferred. Execute remaining release-candidate combinations at stabilization; investigate consequential failures. Run optional diagnostics only for a named outcome. |
| E15-REL-02 | 15.1 | E15 eleven visual design comparisons | Epic15 UI/release owner | Deferred. Capture and review all eleven comparisons against current approved design at release stabilization; retain results and repair consequential defects. |
| E15-REL-03 | 15.1 | E15 manual phone/daylight/one-hand/assistive-tech and polish | Product/release owner | Deferred. Perform representative-hardware phone/daylight/one-hand/assistive-tech and polish walkthrough before the applicable release decision; record method/results. |
| E15-REL-04 | 15.1 | E15 broad General and dashboard browser suites | Coordinator/release owner | Deferred. Deliberately dispatch release_validation=true against the qualified release candidate at stabilization, or earlier when consequential changed behavior requires broader browser evidence. |
| E15-REL-05 | 15.1 | E15 representative performance workload/measurements/approval | Product + Architect | Deferred. Approve representative volumes and latency/resource/throughput thresholds, measure complete scheduling surfaces, and record the performance release decision. |
| E15-REL-06 | 15.2 | Exhaustive five-view/gesture/device and screenshot/visual matrix | QA/UX | Deferred. Before release execute tracked remaining view/device/gesture matrix, inspect image differences, record evidence and triage consequential failures. |
| E15-REL-07 | 15.2 | Manual accessibility/daylight/exploratory scheduling validation | QA/UX | Deferred. Before release perform recorded keyboard/screen-reader/zoom/daylight walkthroughs and exploratory checks; resolve consequential findings. |
| E15-REL-08 | 15.2 | Representative scheduling performance thresholds/workloads certification | Product/Architect | Deferred. Agree representative recurrence/tenant workloads and thresholds, measure production build and record acceptance before release. |
| E15-REL-09 | 15.3 | Exhaustive resolver view/device/gesture/browser permutations and screenshot/visual comparison | Release validation owner, coordinated by Root | Deferred. Root mirror this item into the existing deferred release ledger; release owner schedule and record the exhaustive matrix against a qualified release candidate. |
| E15-REL-10 | 15.3 | Manual accessibility, daylight, exploratory walkthrough and visual polish | Release validation owner, coordinated by Root | Deferred. Root mirror ownership/status into the deferred ledger; release owner run and triage manual checks on the release candidate before release readiness. |
| E15-REL-11 | 15.3 | Representative resolver performance certification and inherited epic release validation | Release validation owner, coordinated by Root | Deferred. Root retain inherited15.1/15.2 and Epic14 open release work, add resolver performance scope to the ledger and schedule representative measurement before release readiness. |
| E15-REL-12 | 15.4 | Exhaustive browser/device/view matrices | QA/UX | Deferred. Define the owned release browser/device/view matrix, admit a separate release-validation run and retain every executed/failed/skipped result before release readiness. |
| E15-REL-13 | 15.4 | Screenshots, visual comparison and visual inspection | QA/UX | Deferred. Capture approved viewport/state screenshots on a qualified release candidate, compare them against approved design/defaults and record review outcomes and required corrections. |
| E15-REL-14 | 15.4 | Manual accessibility, daylight and exploratory walkthroughs | QA/UX | Deferred. Run the scoped keyboard/focus/assistive/manual daylight and exploratory checklist on the qualified release candidate, preserve observations and resolve consequential defects before release approval. |
| E15-REL-15 | 15.4 | Actual <=30-second one-hand filing timing | QA/UX | Deferred. Execute and record actual representative one-hand booking/standalone filing timing, including failure/retry usability, then evaluate against the <=30-second requirement. |
| E15-REL-16 | 15.4 | Representative workload, target approval and performance certification | Product/Architect | Deferred. Approve representative tenant/history/concurrency workloads and thresholds, then admit and execute performance validation and record actual measurements against those approved targets. |
| E15-REL-17 | 15.4 | Release polish | Delivery owner | Deferred. Maintain the owned polish list, inspect the qualified release candidate, resolve agreed items and attach actual release-review evidence before requesting release approval. |
| E15-REL-18 | 15.5 | Exhaustive role/device/browser matrices beyond essential14 smoke | Kopplas release-validation coordinator | Deferred. On a separately qualified and authorized release candidate, enumerate and execute remaining role/device/browser combinations, retain results and resolve consequential defects before release readiness. |
| E15-REL-19 | 15.5 | Screenshot comparison, representative manual visual/accessibility walkthrough and polish | Kopplas release-validation coordinator | Deferred. Before release readiness, retain screenshot and representative viewport/manual/accessibility validation against approved authority. Consequential functional/accessibility defects remain development blockers, not polish. |
| E15-REL-20 | 15.5 | Release-operator hosted feed enablement and release/deployment approval | Kopplas release operator | Deferred. Before hosted feed enablement, obtain existing separate release/deployment approvals and qualify dedicated target key/Vault/runtime/trusted-IP configuration; retain operator evidence rather than infer it from CI. |
| E15-REL-21 | 15.6 | Full Min dag role/device/browser matrix beyond nine essential journeys | QA / release-validation coordinator | Deferred. QA/release-validation coordinator executes the qualified release-head role/device/browser matrix. QA/CI verification maintainer separately investigates the two response-body protocol flakes using per-attempt native evidence, records disposition without hiding retries, and routes any demonstrated consequential functional defect back to development remediation; this is not an acceptance waiver. |
| E15-REL-22 | 15.6 | Canonical design screenshot comparison, measured contrast and presentation polish | UX / QA | Deferred. Compare the rendered Min dag states against approved DESIGN/EXPERIENCE at release viewports; assess shared-token migration in its owned design lane and resolve findings. |
| E15-REL-23 | 15.6 | Manual accessibility, keyboard, daylight and exploratory walkthrough | QA / UX | Deferred. Run and attach the manual connected-field release walkthrough, including long Swedish text and zoom/reflow. |
| E15-REL-24 | 15.6 | E14 advisory triage and approved performance volumes/targets | QA / Product / Architect | Deferred. Reconcile advisory resolution evidence and approve representative performance volumes/targets before qualification claims. |
| E15-REL-25 | 15.6 | Final Phase B release validation and stabilization checkpoint | Coordinator / release-validation coordinator | Deferred. After current PhaseB epics are integrated/development-complete, open assigned checkpoint and execute applicable release checks before explicit release approval. |

Main ordering/readmission remains Coordinator-held. Product work remains paused until all epics are done and explicit owner release; there is no automatic production resume. Package/lock/workspace/patch, StageA, migration custody, auth/schema, protected35.8/CRM/PR151, scheduler, production/demo and all unrelated ownership fences remain intact.

## Suggested Review Order

Author: `/root/e15_release_wiring_author_high`, explicit Sol High. Refreshed against the frozen local combined repair sources on parent141b8081, before publication.

### Carry explicit interval intent through the existing editor boundary

Inspect the already-reviewed caller and append-only regression provenance first. This fixes endpoint intent while retaining toolbar derivation and existing edit modes.

- `src/components/scheduling/SchedulingWorkspace.tsx:138` — `function select`: carries explicit endpoints through the existing prefill contract.
- `src/components/scheduling/SchedulingWorkspace.tsx:180` — `prefill={editing.prefill}`: delivers provenance without changing the shared editor.
- `tests/unit/features/scheduling/calendar-components.test.ts:212` — `selected interval caller carries`: detects the original lost-prefill defect.

### Bind consumer setup to real fixture and public workspace posture

The committed six-consumer repair establishes one exact expected landing and visible public tab before retaining business assertions. The latest inline fix targets the reachable scheduling helper only.

- `tests/e2e/auth/admin-user-management.atdd.e2e.spec.ts:28` — `async function logIn`: retains exact fixture-specific landing assertions.
- `tests/e2e/booking-editor.e2e.spec.ts:29` — `async function openJobSchedule`: opens the hydrated visible public scheduling panel.
- `tests/e2e/scheduling-views.atdd.e2e.spec.ts:404` — `identity === "montor"`: preserves denied-role dashboard and requires Montor my-day.

### Preserve grouped controls and verify actual qualification boundaries

The only new rendered structure partitions existing active DTOs. Review original handler conservation, placement isolation and the UI-driven persistence regression; then require actual final-head browser/images rather than local port credit.

- `src/components/notifications/NotificationPreferences.tsx:8` — `CATEGORY_GROUPS`: derives nonempty groups from active manifest labels and DTO module ownership.
- `src/components/notifications/NotificationPreferences.tsx:58` — `Notiskategorier`: preserves the outer accessible group required by existing captures.
- `tests/e2e/notifications/notifications.atdd.e2e.spec.ts:183` — `Profile preferences group`: retains Offerter checks and proves placement, PUT/reload/readback and UI restoration.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:792` — `E35-5-CAP-owned-connected-context`: retains required final-head desktop/phone capture execution.

Evidence and limits are recorded above: local51 distinct D1 positives, current9 existing units and9 synthetic-source probes pass; browser, production build, final-head images and applicable human acceptance remain unexecuted by this author. All25 release rows remain deferred.
