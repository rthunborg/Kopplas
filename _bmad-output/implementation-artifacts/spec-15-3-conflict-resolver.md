---
title: '15.3 — Conflict Resolver'
type: 'feature'
created: '2026-10-20'
status: 'ready-for-dev'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '3a0282a70ab9cc539e2d85bd660635820e618731'
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

## Design Notes

Owner-authorized maintainable defaults, bounded suggestion semantics, current-segment meaning, immutable ledger choice, fresh-check recency and proof/refresh contracts are recorded in current-contracts-and-design.md. They interpret the approved resolver behavior; no new legacy evidence or approval is asserted. New ledger is supporting transactional/history infrastructure, avoiding accidental recurrence mutation or fragile replay anchors. Exact shared allocation and timestamp remain Root's implementation prerequisite.

## Verification

Planning executes artifact/process checks only: source AC byte comparison, seven-point story audit, READY standard, reader/discovery, kernel/raw hashes and source preservation; zero product tests/scaffolds/runtimes. Root separately validates the spec at High before build.

Future development: frozen install and applicable `pnpm run verify:development`, `pnpm audit --audit-level=high`; required full `SUPABASE_TEST_REQUIRED=1 pnpm run test:int` plus focused resolver and existing single/series/job-card/role/notification regressions; full current-history migration replay/seed/H4/policy agreement and direct physical recovery-Storage integrity; essential production Playwright resolver flow plus ordinary auth smoke; independent High review of actual sensitive diff. Required evidence records actual executed/failed/skipped counts and exact revision. Skips, synthetic envelopes and prior-story CI are not resolver acceptance.

Trace TEA15.3-INT-001…006, E2E-001, COMP-001 to actual assertions/results. Include stale workflow-only and description/customer changes, multi-assignee aggregate completeness, all three effective refresh writers, genuine cross-protocol proofs, role changes while waiting/replay, lost response/concurrent duplicates, audit/notification fault rollback, recipient union/preferences/multiple same-day events, unknown suggestions, mixed job inputs and both Stockholm DST weeks. Run no ATDD/automate/trace execution in this planning phase; selected later phases own it.

Future delivery explicitly defers exhaustive view/device/gesture/browser matrices, screenshots/visual comparison, manual accessibility/daylight/exploration, representative performance certification and polish to release validation with owner/status/evidence/next action. Never defer consequential broken functionality or claim unexecuted work passed. Development-complete is distinct from release-ready; separate merge/deployment approval persists. After two unsuccessful same approaches inspect and choose a simpler authorized route or record owner/evidence/next action/resume condition. Root owns resources/Git/CI/aggregate ledgers; no deployment or separate PR is authorized.

## Auto Run Result

Status: ready-for-dev
Blocking condition: none for planning.

HALT after planning. One source AC sketch is preserved verbatim; nine tasks/eight Given/When/Then ACs, both supporting companions, seven-point immediate audit, coherence/preservation self-validation and helper reader/discovery are complete. Intent-contract is the Build Auto sprint kernel, not a separate SPEC.md. The oversized warning is retained. Root independent High validation/approval/freeze and concrete Coordinator allocation of exact shared seams/new migration/isolated fixtures/resources precede any implementation. New ledger and defaults remain proposed technical choices pending that validation.

This delegate performed zero product tests, ATDD/scaffolds, app/schema/test changes, runtime launches, CI, Git commits/push/PRs, hosted changes or deployment. Existing source/history/context/state preserved. Actual routes: Sol6.1 High planning author; synchronous context-free Sol6.1 High read-only contract explorer, route capsule in private preparation. No implementation/review round consumed. Completion hook preserves planning status and creates no completed Suggested Review Order or development-complete/release-ready claim. Baseline3a0282a70ab9cc539e2d85bd660635820e618731.
