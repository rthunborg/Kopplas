---
title: '15.3 — Conflict Resolver'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
review_loop_iteration: 1
followup_review_recommended: true
baseline_revision: '3245042f1f9e08c3ec6c2445c1cb6109e326be33'
context:
  - docs/process/review-order.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - docs/process/local-setup.md
  - docs/decisions/epic-14-story-ownership-contract-d-2026-10-07.md
  - _bmad-output/test-artifacts/test-design-epic-15.md
  - _bmad-output/auto-bmad/preparation/story-15-3/implementation-ownership-handoff.md
  - _bmad-output/auto-bmad/preparation/story-15-3/current-contracts-and-design.md
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Planners have conflict counts and inline booking warnings, but cannot work through a current conflict queue, record deliberate fixes, inspect accepted conflicts or see resolution history. Recurring occurrences need a common-fix flow that preserves the landed series contract.

**Approach:** Add a manager-authorized master-detail resolver from existing conflict chips and booking glyphs. Reuse the sole detector and existing booking/series validation, with checked atomic resolution, durable command/history evidence and E13 in-app assignee notifications; keep domain/state/validation/actions separate from replaceable presentation.

## Boundaries & Constraints

**Always:** Phase B FR89/architecture §10.2/Contract D apply. Current tenant membership and existing resources/Bookings.Manage authorize queue details, suggestions, history, preview, commit and replay; scheduling/Bookings.View or own-booking visibility alone grants no resolver/peer authority. Use request-bound RLS clients, checked minimal SQL wrappers, tenant serialization and current role locks, same-tenant references and server-owned actor/time. Recompute complete current conflicts with the shared v3 detector and preserve v1 capacity configuration, per-booking jobId and independently null/empty per-job inputs. Decisions bind current complete logical groups, exact candidate and workflow/series state. Booking/assignment changes, conflict refresh, selected resolution/acceptance, immutable outcome, audit and notifications commit or roll back together. Unchanged natural keys preserve acceptance; changed collisions reopen; resolved identities returning to detection reopen without deleting history. Every success requires server-confirmed persistence; failed/unknown attempts retain input and stable identity for explicit authorized retry. Connected UI works at 360×640 and by keyboard. Common-series fixes preserve bounded segment ownership, exceptions/tombstones and stable IDs.

**Block If:** Before implementation, Root has not independently validated/frozen this specification and allocated its exact shared logical deltas, new migration and isolated mutable fixtures/resources; or a required invariant needs authority beyond current checked manager permissions/secrets or an unapproved product decision. These are later implementation gates, not missing planning intent. Report concrete evidence and resume condition rather than guessing or weakening a gate.

**Never:** Separate save-then-resolve/notify writes; client conflict/actor/time authority; partial logical-group or blanket series acceptance; expired/stale proof silently reused; direct privileged/unauthenticated paths; peer-data widening for Montör; booking flags for acceptance; accept-only changes that create recurrence exceptions; arbitrary standalone multi-booking split; lineage-wide changes or exception overwrite. Do not introduce optimization/AI, email/provider activation, background scheduling, money, new permissions, dashboard widgets, feed/time-report/Min dag work, PWA/offline/queues/sync or other Phase C scope. No legacy URLs/evidence/browsing, foreign checkout copying, automatic E16.2/16.3 integration, deployment/PR/push/merge or secret changes. This planning run writes no app/schema/tests/scaffolds and starts no runtime/CI.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Queue and scope | Period-wide scheduling chip, contextual booking/job/customer chip, or explicit all-conflicts scope | Person then Stockholm-date groups of complete current logical conflicts; count and queue use the same labelled scope; complete aggregate participants remain visible even outside that scope | Failed/unavailable read is unknown with retry, never zero/empty success; stale selection refreshes |
| Detail and actions | Double-booking or capacity/work-hours/access/competence violation | Both colliding bookings or complete aggregate/breach window, authorized job/customer context, plain-language rule; explicit movable booking selection; Flytta, Omfördela, Justera and Acceptera konflikt | Missing/denied target is generic; never choose a hidden/arbitrary participant |
| Suggestions | Same assignees/duration or active matching-role replacement, bounded search with current facts | Convenience candidates show actual schedule-derived load; only zero candidate-related groups are labelled available; unrelated tenant conflicts do not suppress valid suggestions | Unknown/malformed facts are unknown, cancelled targets cannot be labelled free; final commit rechecks everything |
| Fix | Move/reassign/adjust one occurrence or reviewed common current-segment fix | Sole detector evaluates the complete proposed overlay; disappeared targeted groups become resolved with outcome/actor/SQL time; surviving/new warnings stay visible and retain Contract D review/selection rules | A remaining conflict is not falsely reported resolved; stale candidate/workflow/series/facts requires renewed review; failure leaves zero partial writes |
| Accept | Current selected complete groups plus nonblank reason | Only selected reviewed candidate-related groups become accepted, leave default queue and remain inspectable through Visa accepterade; other groups stay open | Whitespace reason, forged/partial/unrelated group, stale status or cross-protocol proof fails atomically |
| Series | Åtgärda hela serien on a materialized occurrence with siblings in the same bounded segment | Re-preview common time/default-assignee changes for ordinary occurrences in that segment; exceptions and cancelled tombstones stay intact; show all remaining warnings, including beyond first ten | No lineage traversal, automatic exception repair, restart of original count or blanket acceptance; stale version rejects all |
| Replay/history/notification | Lost response, identical or changed command key, concurrent fix, later conflict refresh | Exact authorized replay returns one immutable result; one history/audit event and deduped affected-assignee notification set; later single/series/job-card refresh cannot erase history/replay | Changed content under key rejects; revoked authority denies even replay; notification/audit failure rolls back the whole attempt |

</intent-contract>

## Source Acceptance and Provenance

AC sketch: master-detail resolver from the `Konflikter (n)` chip/queue — grouped queue (person, date), detail mini-timeline of both colliding bookings with job/kund context and plain-language violated rule; actions `Flytta` (suggested free slots from the inverted engine — convenience, never authority), `Omfördela` (available candidates with load), `Justera`, `Acceptera konflikt` (required reason, drops from default queue, `Visa accepterade` filter); resolution re-runs detection, marks `resolved` with outcome + actor, records on `Händelser`, notifies affected assignees (`booking.changed` via E13); accepted-conflict natural-key identity carries across recurrence; `Åtgärda hela serien` for sibling occurrences; empty state with last-checked recency (FR89).

**No Design Gate Criteria for this story.** epics-phase-b.md declares the AC sketch above, without a four-part Visual/Behaviour/Animation/Visual-validation gate. Binding Phase B UX §§4.6/6/10 still applies. Derived ACs below operationalize the unchanged sketch. The 2026-10-19 owner policy defers exhaustive visual/manual/release matrices, without deferring consequential functionality, authorization or integrity.

References: AGENTS.md; _bmad-output/project-context.md; _bmad-output/planning-artifacts/epics-phase-b.md Story15.3; architecture-phase-b.md §§3.3/9.2/10/14/16; ux-design-specification-phase-b.md §§4.6/6/10; the current epic-15-context.md; Contract D; both listed companions. Current Phase B sources supersede historical Phase A epics/architecture/UX. No nextjs-app/docs/design/DESIGN.md or supplied Figma reference exists here: use src/app/globals.css, existing Dialog/editor controls and approved UX. Missing details use the October15 owner-authorized defaults recorded in the design companion, never alleged legacy observations.

Continuity: 15.1 and 15.2 are internally done; retain their five views, current editor/detector, bounded recurrence, exceptions, nominal slots, stable IDs and proofs. Current HEAD is 3a0282a70ab9cc539e2d85bd660635820e618731. Root reports source a00dd595d96a73c398328ed1778bac334aca9de6 qualified by CI39348312783, with subsequent metadata-only commits; these are prior-story provenance, not 15.3 execution. Preserve 15.2's three-round cap/followup caveat, disclosed unchanged Jobs browser retry, release_ready=false and open release work. Epic14 October8 accepted-with-open-items is continuity, not extra 15.3 scope: advisories/performance targets/manual accessibility/daylight/exploration remain unexecuted inherited work; 15.1's historical Contract D transfer does not automatically reopen the completed story. Current branch includes the coherent landed16.1 prerequisite; do not import16.2/16.3 or implement against unfinished16.3.

## Code Map

- `src/components/resources/BookingConflictChip.tsx:1`, `BookingEntry.tsx:29`; `src/components/scheduling/SchedulingToolbar.tsx:8`, `SchedulingWorkspace.tsx:180`, `BookingBlock.tsx` — existing inert chips/glyph/host seams; wire accessible resolver links without adding nav or a dashboard widget.
- `src/features/resources/bookings-read.ts:53,99`; `src/server/read-models/scheduling.ts:83`; `src/features/scheduling/view-model.ts:43` — logical count normalization and contextual versus period-wide scope; toolbar filters apply later. Exclude retained resolved rows from active aggregate reconstruction.
- `src/features/scheduling/conflicts.ts:26,86`; `src/server/bookings/conflict-facts.ts:79` — sole deterministic detector, natural identity and complete logical-to-persistence association projection. One aggregate may involve more than two bookings.
- `src/server/bookings/editor-preview.ts:43`, `save-with-conflicts.ts:26`, `conflict-attestation.ts:13`; `src/server/commands/jobs/card-proof.ts:4` — checked snapshot/proof/replay patterns; preserve exact existing thirteen-claim order and distinct editor/card/series domains. Resolver gets its own exact domain/bindings, not a widened parser.
- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:3,82,323` — current v3 facts, single finalizer and job-card finalizer. Detection digest omits workflow state and some editable/display fields: a resolver-specific baseline must bind those too.
- `supabase/migrations/20261007120235_booking_editor_audited_override.sql:175,270`; `20261019220000_booking_series_integrity_followup.sql:44,162`; job-card refresh in `20261019133200_e16_16_1_job_booking_facts.sql:393` — three effective complete-set writers needing coordinated forward-only terminal-row refresh semantics; historical SQL remains immutable.
- `src/server/bookings/series-conflicts.ts:55`; `src/server/commands/bookings/update-booking-series.ts:5`; `supabase/migrations/20261019180000_recurring_booking_series.sql:24` — whole-current-segment null-pivot seam preserves exceptions; every ordinary booking UPDATE triggers occurrence divergence, so accept-only ledger/history cannot update bookings.
- `src/components/resources/BookingConflictPanel.tsx:1`; `src/components/crm/Dialog.tsx`; `src/app/globals.css` — reuse plain-language warnings and accessible editor/dialog styling; extend collision detail rather than duplicating detection logic.
- `src/server/notifications/registry.ts:3`; `src/components/notifications/NotificationPreferences.tsx:51`; `src/app/api/notifications/preferences/route.ts:18`; `src/scope/manifest.ts:275`; `supabase/migrations/20260923170000_in_app_notifications.sql` — booking.changed missing; current labels/channels assume quote notifications. New category needs coherent manifest/registry/SQL/preferences handling, not a provider or cron.
- `tests/support/bookings-atdd.ts`, `booking-editor-atdd.ts`, `booking-series-atdd.ts`; `tests/integration/commands/booking-series.int.test.ts:710` — existing isolated actor/tenant fixtures and actually executed series cases are regression boundaries; skipped scaffolds grant no evidence.

## Files Created / Files Modified

Exact proposed source/test/shared seams, forward SQL function inventory, new-table rationale and immutable-resource constraints are in implementation-ownership-handoff.md. This is a candidate impact list for Root allocation, not a shared write claim. No dependency, lockfile, .env, permission-matrix, capacity-rule or unfinished job authority change is planned. A changed impact list requires reconciliation before overlapping writes.

## Tasks & Acceptance

**Execution (dependency order; every implementation path is allocated first):**

- [ ] T1 — `src/features/scheduling/conflict-resolver.ts`, `conflict-resolver-types.ts`, `conflict-suggestions.ts` (new): implement client-safe complete-group normalization/scope/date grouping, explicit selected booking/state/attempt identity and pure bounded inverted-detector suggestions; unit-pin matrix and golden DST/capacity edges. Supports AC1–4/7.
- [ ] T2 — new coordinator-allocated forward migration under `supabase/migrations/` (logical basename `conflict_resolver`, timestamp not allocated by this plan): add the append-only `booking_conflict_resolutions` command/history ledger with minimal checked-only writes, tenant/actor/command identity and manager-scoped RLS; add checked snapshot/finalizer/history projection and private shared refresh/emitter. Forward-replace the three effective refresh callers, retain absent resolved rows, preserve matching acceptance and reopen a returning resolved key. Enroll new table/category through `src/scope/manifest.ts` and `tests/integration/rls/tenant-table-inventory.ts`; preserve existing grant/trigger/proof boundaries. Supports AC2/5–8. See companion for exact function inventory.
- [ ] T3 — `src/server/bookings/conflict-resolution.ts`, `conflict-resolution-attestation.ts`, `src/server/commands/bookings/resolve-booking-conflict.ts`, `conflict-resolution-validation.ts` (new), `src/server/commands/envelope.ts` (existing command map): expose resolveBookingConflict under existing resources/Bookings.Manage. Bind workflow plus editable/full series baseline, perform sole-engine full-overlay preview and finalization with complete review/selected acceptance, exact durable replay and no partial writes; reuse validated single/series plans without independent commits. Supports AC3–8.
- [ ] T4 — `src/server/read-models/booking-conflicts.ts` (new), `src/server/read-models/scheduling.ts`, `src/features/resources/bookings-read.ts`: implement manager-only queue/detail/history with complete pagination, safe context projection and actual fresh shared-engine scan/checked timestamp; join persisted acceptance by exact natural key, never mistake a workflow fetch for detection recency. Align chips and queue scope, preserve own-only nonmanager data and generic failure semantics. Supports AC1/2/5/8.
- [ ] T5 — `src/server/notifications/registry.ts`, `src/components/notifications/NotificationPreferences.tsx`, `src/app/api/notifications/preferences/route.ts`: add only booking.changed in-app category, generic registry-driven labels/channel capability, checked active before/after assignment recipient union and stable event/recipient dedupe; SQL emitter participates in T2/T3's transaction. Keep existing quote email behavior. Supports AC6/8.
- [ ] T6 — `src/features/resources/booking-conflict-actions.ts`, `src/features/scheduling/conflict-resolver-state.ts` (new); `src/components/scheduling/ConflictResolver.tsx`, `ConflictQueue.tsx`, `ConflictDetail.tsx`, `src/app/(app)/scheduling/conflicts/page.tsx`, `src/app/api/scheduling/conflicts/route.ts` (new); existing chip/entry/panel/editor/block/toolbar/workspace files named in handoff: deliver all entry/detail/action/accepted/history/series/empty states using existing editor and headless actions. Provide dynamic protected route, accessible focus/live feedback, phone layout, retained unsent input and explicit retry. Supports AC1–8.
- [ ] T7 — new focused unit/integration/RLS/component files in handoff plus existing conflict/editor/series/job-card/notification/schema regression suites: prove matrix, actual effective writer retention/reopening, genuine-proof current-role/stale negatives, full rollback/replay/races, channel/recipient safety, recurrence/DST and immutable history through independent physical row readbacks. Supports all ACs; TEA15.3-INT-001…006/COMP-001.
- [ ] T8 — `tests/e2e/conflict-resolver.e2e.spec.ts` (new): essential actual production-host chip→queue→complete detail→fix/accept→reload/history/notification flow, a common-series fix and connected 360×640 keyboard/retry path with durable readbacks. No mocked command success, receipt-only proxy or next dev substitute. Supports all ACs/TEA15.3-E2E-001; exhaustive permutations remain release work.
- [ ] T9 — this spec plus `_bmad-output/auto-bmad/delivery/15-3-conflict-resolver.json` (future author-owned evidence): reconcile approved gates, actual executed counts/revision, independent High review, deferred release owner/evidence/next actions and author-written Suggested Review Order; Root runs delivery gate before any done claim. Supporting completion infrastructure, no empty final trail in this plan.

**Acceptance Criteria:**

- AC1 — Given an authorized planner entering an existing conflict chip or booking glyph, when the resolver loads or refreshes, then a labelled, count-consistent person/date master-detail queue shows current complete logical conflicts, default open only, and Visa accepterade exposes accepted conflicts without duplication; failed/unknown reads never show a successful empty state.
- AC2 — Given a selected double-booking, aggregate capacity or other supported rule conflict, when detail opens, then all relevant bookings/breach windows, authorized job/customer context and the plain-language rule appear, with explicit target selection; a successful empty queue shows honest last shared-engine-check recency, and generic denied/failed states reveal no hidden tenant/peer data.
- AC3 — Given Flytta or Omfördela for a selected booking, when suggestions are requested, selected and committed, then same-assignee free slots or active matching-role people show actual capacity/load from the sole engine, unknown is never available, and stale suggestions confer no write authority; final validation uses current facts and may require renewed review.
- AC4 — Given Flytta, Omfördela or Justera including an occurrence edit, when the planner previews and confirms, then one checked transaction changes only the reviewed candidate overlay and re-runs complete conflict detection; targeted groups that disappear become resolved with outcome/actor/SQL time, remaining/new conflicts are honestly shown, and current warnings follow Contract D selective review/acceptance rather than false resolution.
- AC5 — Given current selected complete logical conflicts, when Acceptera konflikt commits with a nonblank reason, then only those exact candidate-related groups become accepted atomically and leave the default queue while remaining inspectable; unrelated/partial/forged/stale selections cannot change any state, and returning resolved identities reopen while unchanged accepted identities retain acceptance across single/series/job-card refresh.
- AC6 — Given a successful resolution or acceptance, when its result is reloaded or its exact command replayed after response loss, then durable Händelser records action/outcome, actor and SQL timestamp, eligible affected active assignees receive one booking.changed notification per event/recipient according to current in-app preferences, and no duplicated booking/history/audit/notification results appear; a changed key payload, authority revocation, race or injected failure produces no unauthorized/partial effect.
- AC7 — Given same-fix sibling conflicts in one existing bounded series segment, when Åtgärda hela serien is selected, then the complete resulting segment is previewed and confirmed using current series version, ordinary occurrences receive the common change, exceptions/tombstones/stable IDs/earlier or later segment ownership remain intact, and unresolved/new sibling warnings are shown without blanket acceptance or a false all-fixed claim.
- AC8 — Given anonymous, foreign-tenant, inactive/revoked, own-only and allowed multi-role callers on read/suggestion/history/preview/save/replay/direct RPC/DML surfaces, when access or failure/retry paths execute, then current matrix/RLS/same-tenant authority and whole-transaction invariants hold; the actual desktop and 360×640 keyboard flow retains unsent input, exposes explicit retry and reports success only after server-confirmed persistence, while existing 15.1/15.2 and job-card contracts remain intact.

## Spec Change Log

## Review Triage Log

### Review Findings

**Round 1 of 3**

Route: context-free gpt-6.1-sol High for all source-review layers because this diff changes current authorization, RLS and transaction integrity. Review input source9548c5cd33d6696817ed334fc832b2259e592437 / metadata8d06d549432479ad3e2261f8e746d716adcb4dd2; required runtime execution is pending exact-head CI. No development-complete claim.

All six independent High layers completed. Consolidated adjudication: 13 patches (2 high, 11 medium), intent_gap0/bad_spec0/defer0/reject0; security reported No findings. Cross-layer duplicates are deduplicated. Frozen intent is unchanged. This author applied one consolidated fix batch; completed source review rounds remain 1/3 here. Author verification below is not an independent review round. The next independent check targets these fixes/regressions under the parent's actual guard accounting; no unchanged broad review is requested. Follow-up recommended: true (score33).

| Finding | Author repair | Regression mapping (runtime cases remain unexecuted) |
| --- | --- | --- |
| R1-01 high | Validated current identities may have retained resolved rows; refresh reopens/clears terminal fields before selective acceptance, while accepted groups remain denied. | INT-013 changes only capacity facts after resolution, then accepts the same returning identity and checks cleared terminal metadata/already-accepted denial. |
| R1-02 medium | Strictly validated following-series input passes through resolver preview/save adapters into the same atomic finalizer; source/successor bounds, protected payloads and stable slots follow the existing series planner. Ordinary series commits are not called by resolver recurrence paths. | Actual planner unit; INT-016 existing-successor/prefix/protected/suffix readbacks and one audit/outcome/replay; E2E-002 explicit Detta och kommande plus ordinary persisted sibling times. |
| R1-03 medium | First definite authorization denial releases the acceptance attempt; an already unknown attempt retains its exact identity on denied retry. | New state unit exercises all four denial codes and SERVER_ERROR; E2E-001 disables/restores actual membership and checks editability. |
| R1-04 medium | Stale acceptance keeps the unsent reason and dialog, renews the real preview, clears acknowledgment and requires review again; unsuccessful renewal remains blocked with explicit retry. | E2E-001 changes real baseline facts, retains literal reason and requires renewed checkbox acknowledgment. |
| R1-05 medium | Acceptance adds history/unload protection and unsent-discard confirmation; pending/unknown attempts cannot be discarded or navigated away through the established back pattern. | E2E-001 loses a real committed response, observes actual popstate, checks unload cancellation and replays one durable event. Synthetic unload-event dispatch checks listener behavior, not a full browser-restart recovery claim. |
| R1-06 medium | Common changes preserve nominal start/recurrence bounds while permitting valid timed/all-day exclusive-end conversion both directions. | Independent literal planner unit plus INT-017 persisted SQL endpoints/bounds both directions. |
| R1-07 medium | Common preview identifies every protected occurrence by date, description and exception/cancelled status before confirmation. | E2E-002 identifies the protected exception and cancelled date in the actual editor. |
| R1-08 medium | Integration prepare helper invokes the real production validator before receipt issuance, matching command normalization and honoring the actual selected target. | Canonicalization/idempotence unit uses real UUID input; all INT positive previews use real production normalization, not manufactured positive proofs. |
| R1-09 medium | Availability includes its actual Stockholm measurement date and the UI explicitly labels start-date load/capacity for multi-day bookings. | New multi-day unit checks dated start-day measurement and unknown null date; no total-period capacity claim. |
| R1-10 high | Local clock extraction preserves all six fractional digits before the shared recurrence planner. Assignment-only common changes retain exact subsecond endpoints. | Independent literal planner test changes assignment on a100ms occurrence; INT-017 reads persisted fractional endpoints/assignees for both ordinary occurrences. |
| R1-11 medium | Added independent times/assignees readbacks for every ordinary sibling, including conflict-free siblings; existing protected full-row checks remain intact. | INT-007 reads all10ordinary rows in the12-slot series; E2E-002 reads all3ordinary rows in5slots, then2following rows. |
| R1-12 medium | Successful remaining targets persist outcome/history/open workflow and use a shared explicit remaining notice. | State notice unit; INT-014 result/ledger/history/open workflow; E2E-003 actual visible notice and physical remaining result before its later resolution/retry. |
| R1-13 medium | Removed-target replay with a new key expects actual PREVIEW_STALE; genuine identity mismatch is a separate still-current-target scenario. | INT-007 stale after successful removal; INT-015 genuine receipt/new command mismatch with current target and unchanged physical snapshot. |

## Design Notes

Owner-authorized maintainable defaults, bounded suggestion semantics, current-segment meaning, immutable ledger choice, fresh-check recency and proof/refresh contracts are recorded in current-contracts-and-design.md. They interpret the approved resolver behavior; no new legacy evidence or approval is asserted. New ledger is supporting transactional/history infrastructure, avoiding accidental recurrence mutation or fragile replay anchors. Exact shared allocation and timestamp remain Root's implementation prerequisite.

## Verification

Planning executes artifact/process checks only: source AC byte comparison, seven-point story audit, READY standard, reader/discovery, kernel/raw hashes and source preservation; zero product tests/scaffolds/runtimes. Root separately validates the spec at High before build.

Future development: frozen install and applicable `pnpm run verify:development`, `pnpm audit --audit-level=high`; required full `SUPABASE_TEST_REQUIRED=1 pnpm run test:int` plus focused resolver and existing single/series/job-card/role/notification regressions; full current-history migration replay/seed/H4/policy agreement and direct physical recovery-Storage integrity; essential production Playwright resolver flow plus ordinary auth smoke; independent High review of actual sensitive diff. Required evidence records actual executed/failed/skipped counts and exact revision. Skips, synthetic envelopes and prior-story CI are not resolver acceptance.

Trace TEA15.3-INT-001…006, E2E-001, COMP-001 to actual assertions/results. Include stale workflow-only and description/customer changes, multi-assignee aggregate completeness, all three effective refresh writers, genuine cross-protocol proofs, role changes while waiting/replay, lost response/concurrent duplicates, audit/notification fault rollback, recipient union/preferences/multiple same-day events, unknown suggestions, mixed job inputs and both Stockholm DST weeks. Run no ATDD/automate/trace execution in this planning phase; selected later phases own it.

Future delivery explicitly defers exhaustive view/device/gesture/browser matrices, screenshots/visual comparison, manual accessibility/daylight/exploration, representative performance certification and polish to release validation with owner/status/evidence/next action. Never defer consequential broken functionality or claim unexecuted work passed. Development-complete is distinct from release-ready; separate merge/deployment approval persists. After two unsuccessful same approaches inspect and choose a simpler authorized route or record owner/evidence/next action/resume condition. Root owns resources/Git/CI/aggregate ledgers; no deployment or separate PR is authorized.

## Historical Planning Result

Status: ready-for-dev
Blocking condition: none for planning.

HALT after planning. One source AC sketch is preserved verbatim; nine tasks/eight Given/When/Then ACs, both supporting companions, seven-point immediate audit, coherence/preservation self-validation and helper reader/discovery are complete. Intent-contract is the Build Auto sprint kernel, not a separate SPEC.md. The oversized warning is retained. Root independent High validation/approval/freeze and concrete Coordinator allocation of exact shared seams/new migration/isolated fixtures/resources precede any implementation. New ledger and defaults remain proposed technical choices pending that validation.

This delegate performed zero product tests, ATDD/scaffolds, app/schema/test changes, runtime launches, CI, Git commits/push/PRs, hosted changes or deployment. Existing source/history/context/state preserved. Actual routes: Sol6.1 High planning author; synchronous context-free Sol6.1 High read-only contract explorer, route capsule in private preparation. No implementation/review round consumed. Completion hook preserves planning status and creates no completed Suggested Review Order or development-complete/release-ready claim. Baseline3a0282a70ab9cc539e2d85bd660635820e618731.

## Implementation Route

2026-10-20: Build Auto implementation author dispatched as context-free gpt-6.1-sol High for actual authorization/RLS and transactional-integrity scope. Frozen P3 contract and bounded allocations are released by Root at source 3245042f1f9e08c3ec6c2445c1cb6109e326be33; implementation/review remains subject to exact allocated scope, resource/CI coordination and delivery admission. Independent review starts at round 0/3.

## Implementation Checkpoint — 2026-10-20

Author: implementation delegate `/root/build15_3_high/implementation`, gpt-6.1-sol High. Source commit `9548c5cd33d6696817ed334fc832b2259e592437`, baseline `3245042f1f9e08c3ec6c2445c1cb6109e326be33`; 54 allocated app/schema/test/config paths. Binary Git diff SHA256 `4c5f754411c7883638a63b85ed5b8544058995319918b2de4c015e6fdcc9f1ef`. No legacy observations, new permissions, E16.2/16.3 imports, runtime launches, database changes, pushes or deployment were performed by this author.

T1–T6 source implementation is complete. T7/T8 have executable acceptance bodies, with runtime validation still pending; T9 remains incomplete until independent High review, exact-head CI and Root delivery admission. Existing provisional skipped resolver scaffolds were replaced by real command/readback/browser bodies, retaining INT-001…006 obligations and adding the matrix below; no scaffold or skip is counted as passing coverage. The frozen Intent and AC1–8 above are unchanged.

The owner-authorized UI defaults use existing chips, native queue buttons, text timelines, Dialog and BookingEditor. Domain scope/suggestions/attempt state and server actions remain separate from presentation. Suggestions are bounded to 14 local days, 15-minute starts plus actual window boundaries, and 10 results; candidate-related sole-engine conflicts determine availability, with actual capacity/load and unknown states. Whole-series means the existing current segment, common clocks/all-day/default assignment only: dates, recurrence bounds, identity, metadata, exceptions and cancelled tombstones remain protected. These are the recorded implementation choices, grounded in the approved design companion and October15 owner decision.

The reserved migration is `20261020180000_conflict_resolver.sql`. It composes only each effective single/series/job-card complete-refresh seam using `pg_get_functiondef`, requiring exactly one matching block and failing on absent/ambiguous shapes. This preserves surrounding current and later earlier-timestamp writer authority rather than copying an obsolete finalizer. No old migration changed and no missing E16 integration was introduced. INT-005 separately invokes all three actual writers for terminal retention and returning-identity reopening; INT-001 checks effective bodies use the helper. Execution of those assertions and empty-history replay remains required CI evidence.

### Executed local evidence

All checks below ran against the implementation worktree subsequently committed as `9548c5cd33d6696817ed334fc832b2259e592437`; the final partition expectation changes no production code. Final integration-body and partition edits received a further typecheck/focused ESLint check. Git blob hashes and binary diff are recorded in private `author-checkpoint-source-manifest.json`; private logs are evidence only and are excluded from commits.

| Check | Actual outcome |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS; lockfile unchanged. |
| `pnpm typecheck` | PASS, including final INT-012 body. |
| `pnpm lint --ignore-pattern '.env*/**'` | PASS, 0 errors/17 existing warnings. `git ls-files '.env*'` lists only `.env.example` and `.env.test.example`; excluded directories contain ignored generated evidence, not tracked source. Initial unbounded lint traversed generated Playwright report JS and was interrupted; it is not claimed passed. |
| `pnpm build` | PASS; production page and API routes generated. |
| `pnpm audit --audit-level=high` | Exit 0; 2 moderate findings, no high/critical threshold failure. |
| `pnpm verify:lockfiles`, `verify:service-role-containment`, `verify:bundle-containment` | Each PASS, built artifact scanned. |
| Four focused resolver unit files via Node test runner | 8 passed/0 failed/0 skipped. Initial run 6 passed/2 failed was a DST fixture expectation error: Sundays are closed in the existing sole engine; corrected literal next-Monday expectations then passed. |
| Installed-Vitest partition/order focused file | 3 passed/0 failed/0 skipped; real runner collects each integration file exactly once and awaits group teardown. |
| Final `pnpm test:unit` | 3012 tests, 103 suites; 3011 passed/0 failed/1 skipped. Earlier full runs were 2992 passed/19 failed/1 skipped, then 3010 passed/1 failed/1 skipped. The 19 failures exposed real chip/read-model dependency ports, manifest/category pins and explicit role metadata; the last failure pinned the pre-resolver DDL partition. Authorized companion fixes preserve production bindings, existing assertions and fail-loud scope checks. |
| `pnpm test:bmad-focused`; `pnpm test:auto-bmad-focused` | 2 passed; then 26+10+5 passed, no failures. |

The sole local unit skip is `tests/unit/ops/isolated-recovery-storage.test.ts:16`, the existing Windows conditional requiring Linux xattrs. It must execute on Ubuntu CI; it is not local recovery-Storage evidence. The full `verify:development` wrapper was not claimed executed: its supported constituent steps ran with the explicitly disclosed bounded lint invocation. The observed two focused RED results were fixture errors, not a captured production-domain TDD red-to-green cycle; negative authority/unknown/tamper assertions passing in the focused suite are unit evidence only.

### Required runtime matrix — authored, not executed locally

| IDs | Required assertions / AC mapping |
| --- | --- |
| READ-001…002, COMP-001 (2 SSR cases) | AC1/2/8: four-booking/multi-assignee completeness, contextual peers, checked time, denied/error versus successful empty, native queue/target controls. SSR assertions do not prove interaction. |
| INT-001, INT-005 | AC4/5/8: target outcomes; each actual effective single/series/job-card writer retains terminal history and reopens returning keys; immutable replay unchanged. |
| INT-002…004, INT-010 | AC5/6/8: accept-only never updates bookings/series; selective immutable history; partial aggregate/stale workflow/description/customer negatives; concurrent exact replay; genuine editor/series receipt and genuine single signature cross-domain denial. |
| INT-006, INT-008 | AC6/8: real post-booking fault, stage-reached audit/notification rollback and lock-observed revocation for fresh/replayed commands. |
| INT-007, INT-011…012 | AC3/4/7: full 12-occurrence common overlay including warnings beyond10, protected rows; mixed v3 job identity/null/empty facts; actual available slot/person suggestion, stale denial and fresh checked commit. |
| INT-009, RLS-001…004 | AC6/8: affected actor/former/current assignee union, preference and same-day event dedupe, no booking email; current multi-role/foreign/anonymous/inactive/own-only surfaces, safe projection/private-column denial and actual RPC/helper ACLs. |
| E2E-001…003 | AC1–8 essential production flow: chip/detail/selective accept/reload; common-series fix with physical protected-row readback; 360×640 keyboard edit, lost real response, retained input, explicit exact replay and durable row counts. |

INT-006 uses the existing real `after_booking` fault plus two per-case UUID-named owner-only `test_support` trigger functions. Each has empty search_path and revoked client EXECUTE, is correlation scoped, and is dropped in awaited `finally`. The audit trigger first observes the accepted target and raises exact SQLSTATE P5301; the notification trigger first observes the immutable ledger joined to the actual audit event/correlation and raises P5302. A real-client RPC observer asserts that exact SQLSTATE came from the finalizer; independent persisted before/after snapshots compare both tenants' bookings, assignments, conflicts, audit, ledger, notifications and series. No proxy manufactures successful execution or error codes.

INT-008 holds the exact tenant advisory lock in an owner SQL transaction, starts the real authenticated planner command, observes its actual lock wait using `pg_blocking_pids`, revokes membership, then unlocks and awaits the pending operation before checking no changes. Error cleanup rolls back/unlocks and awaits pending work. Fixture cleanup removes only fixture-tenant append-only ledger rows in a transaction with transaction-local replication mode, before the existing fixture teardown; no global setting persists. Resolver command tests share the existing `integration-audit-ddl` project with job-runs, `fileParallelism:false`, groupOrder1 after the parallel group. Separate processes are not serialized: hook execution requires Root's exclusive owned isolated disposable CI lane and reviewed source binding. Allocation authorizes the mechanism; actual stage reach and cleanup must still be observed in CI.

## Round 1 Repair Checkpoint — 2026-10-20

Source fix commit `3aaa522bc8448e38a7ec7ce2fecc2dbcb9b927b4` changes13existing allocated paths after `8d06d549432479ad3e2261f8e746d716adcb4dd2`. The initial checkpoint/evidence above is retained as history. Final source inventory remains54app/schema/test/config paths versus baseline; the full56-path Git diff also includes the prior two author documentation files. Private `author-round1-source-manifest.json` pins every Git blob, full baseline diff SHA256 `b445da7571ecaf33e41ff156ce0f1545195cf5fdb107ad6b7732127175e6e6c9`, source-only baseline diff `00bfcecf70c8e5600724159dce596484ae27ce9bc86bb649cbff0e09d31d522f`, and round1 delta `4b2b8493b91cec835ff0c06c1583ba23e53acef3d992a6d6045129faa95a709a`. Manifest file SHA256 `73e2bf67b08d79c2e330f6df92e208f6d30248ba20d96978a048a1d9e153ed29`.

Executed author verification: actual production planner regressions first2P/3F/0S, then5P/0F/0S after fixes. Expanded four-file focused matrix15P/0F/0S; its later canonicalization fixture initially produced14P/1F because a non-UUID unit person reached the real validator, then passed after using a real UUID. Final full `pnpm test:unit`:3019tests/103suites,3018P/0F/1S; exact same existing Windows Linux-xattrs skip remains. `pnpm typecheck`, bounded full lint (0errors/17existing warnings), production build and final changed-file ESLint all pass. After the final UI proposal-preservation and INT-017 additions, typecheck/focused ESLint/build/built-bundle containment and the full unit suite were rerun and pass. Unchanged frozen-install/audit-threshold/lockfile/service-role/process evidence above is reused with unchanged dependencies and check implementations; no rerun is claimed for those checks.

R1-02 materializes the reviewed planner rows directly inside the resolver finalizer, with the same suffix split lineage semantics and checked series-write setting; it does not invoke a separate ordinary series mutation or emit an additional ordinary-series audit. Prefix and an existing later successor's booking rows remain untouched; selected protected suffix payloads/IDs remain exact while their series ownership moves as the existing suffix protocol requires. Common full-segment protected rows retain full-row equality. Candidate/fact/plan proof binding, current role locks, per-row reference validation, complete output validation, one resolver history/audit transaction and exact replay remain in force. No new shared path, grant, helper/factory hook, old migration, resource or environment change was introduced.

Required runtime matrix is now INT-001…017 (17cases), RLS-001…004, READ-001…002, COMP-001(2SSRcases), E2E-001…003 (still3essential browser tests, strengthened within their existing bodies). All original rollback/lock/refresh/ACL/channel obligations above remain. Zero DB/RLS/Storage/browser executions by this author; all new persisted assertions, migration108 replay, hook stages and browser interactions still need Root's reviewed exact-head CI qualification. This is a source checkpoint, not development completion.

## Suggested Review Order

Author: the implementation delegate named above. Refreshed after the consolidated round1 batch against source commit `3aaa522bc8448e38a7ec7ce2fecc2dbcb9b927b4`; this section and pending delivery record are the subsequent author documentation change. The13finding-to-test mappings and actual execution limits are above.

### Reach a complete, honest conflict queue

AC1/2 uses current complete SQL facts and the existing deterministic detector before applying context, so peers stay visible and failed reads remain unknown. Existing entry chips route into a replaceable master/detail presentation with explicit target selection.

- `src/app/(app)/scheduling/conflicts/page.tsx:5` — `ConflictsPage`: protected production entry point.
- `src/server/read-models/booking-conflicts.ts:20` — `scanBookingConflicts`: complete checked facts and actual detection time.
- `src/components/scheduling/ConflictDetail.tsx:6` — `ConflictDetail`: full participant detail and explicit target controls.
- `tests/integration/read-models/booking-conflicts.int.test.ts:9` — `15.3-READ-001`: complete aggregate peers across contextual scope.

### Preview once, commit only current reviewed facts

AC3/4/7/8 reuses the sole engine and existing series planner, with a resolver-specific baseline and distinct encrypted receipt/proof domains. Round1 restores the explicit following-series path inside the resolver transaction and exact fractional/all-day common endpoints; dated suggestions still confer no authority without checked preview.

- `src/features/scheduling/conflict-suggestions.ts:7` — `evaluateConflictCandidate`: actual load/capacity and fail-closed unknown availability.
- `src/server/bookings/conflict-resolution.ts:39` — `planConflictResolution`: common/following overlays with preserved series ownership.
- `src/components/scheduling/ConflictResolver.tsx:54` — `followingRequest`: resolver-bound following preview/save inputs.
- `tests/unit/features/scheduling/conflict-resolver.test.ts:29` — `R1-10 assignment-only`: exact independent fractional endpoint assertions.

### Persist workflow, replay and notifications atomically

The append-only ledger avoids accept-only occurrence divergence and supplies durable replay independent of mutable booking references. AC5/6/8 keeps audit, resolution, workflow and notifications in one transaction; round1 allows validated returning resolved identities to reopen before acceptance while denying already accepted identities. Forward composition still preserves surrounding writer contracts and refuses unknown seams.

- `tests/integration/commands/conflict-resolver.int.test.ts:57` — `15.3-INT-013`: capacity-only identity return and cleared terminal metadata.
- `supabase/migrations/20261020180000_conflict_resolver.sql:110` — `finalize_booking_conflict_resolution`: checked authority, proof and atomic effects.
- `supabase/migrations/20261020180000_conflict_resolver.sql:319` — `Expected exactly one complete booking refresh`: fail-loud effective-writer composition.
- `tests/integration/commands/conflict-resolver.int.test.ts:211` — `15.3-INT-006`: observed fault stages and full persisted rollback snapshots.

### Check retry behavior and the evidence boundary

AC6/8 retains an unknown attempt until explicit replay, releases first definite denials and reports success only after persistence. Round1 preserves unsent acceptance reasons through renewed review, protects navigation and explicitly reports remaining outcomes. INT-001…017/RLS-001…004 and the3essential browser bodies map the consequential boundaries above; runtime assertions are still unexecuted.

- `src/features/scheduling/conflict-resolver-state.ts:8` — `resolverAttemptForFailure`: definite denial versus already unknown classification.
- `src/components/scheduling/ConflictResolver.tsx:49` — `renewAcceptance`: preserve reason and require current acknowledgment.
- `tests/e2e/conflict-resolver.e2e.spec.ts:16` — `15.3-E2E-001`: actual denial/staleness/unknown acceptance navigation and replay.
- `tests/e2e/conflict-resolver.e2e.spec.ts:52` — `15.3-E2E-003`: truthful remaining notice and keyboard/lost-response readbacks.

Evidence: local commands/counts and failure history are recorded above; the source commit is the verified baseline-to-source boundary. Limits: zero local DB/RLS/Storage/browser execution; migration SQL syntax/replay and actual hook cleanup remain unqualified until CI. Unit read-model ports inject SQL-shaped facts into actual production modules, not actual auth/RLS; SSR is structure only. No external mail/integration, exhaustive screenshot/device matrix, manual accessibility or representative performance execution is claimed.

## Auto Run Result

Status: in-review; consolidated round1 repairs source checkpoint ready for targeted independent High verification. Development completion remains pending exact-head full required DB/RLS, direct recovery-Storage, essential browser execution, independent fix review/provenance and Root delivery gate. Draft `_bmad-output/auto-bmad/delivery/15-3-conflict-resolver.json` deliberately records those pending checks and cannot admit done. Root alone owns state/sprint/aggregate ledgers, CI/push and release/deployment authority. Deferred release items in that record must be mirrored by Root into its existing ledger. `release_ready=false`.

Author checks: `check-review-order.mjs` passes with exactly one section, 16 verified path/line stops and zero reference errors. The draft delivery gate returns `development_complete:false`, with three pending runtime checks plus pending independent review; this expected refusal is not a completion failure disguised as a pass. Resume after Root supplies actual exact-head results and independent provenance, then this author refreshes the same section/record before Root admission.
