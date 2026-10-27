# Story 15.3 proposed implementation ownership handoff

Candidate plan only, baseline 3a0282a70ab9cc539e2d85bd660635820e618731. Root must obtain Coordinator allocation after distinct High spec validation, before any app/schema/shared-test or fixture write. Idle concurrent owners do not release logical seams. No code/schema/test/runtime/Git/CI/aggregate-state mutation is authorized by this planning artifact.

## Approved behavior and semantic deltas

| Proposed delta | Approved source / derived AC | Existing protected seam |
| --- | --- | --- |
| Manager-only chip/glyph→grouped queue/detail/actions/accepted view | Story15.3 sketch; UX4.6; AC1–5/8 | Existing Bookings.Manage and own-only scheduling read boundaries; no new permission/nav/widget |
| Actual current shared-engine scan and honest recency; count-consistent scopes | Empty state/last-checked + deterministic correctness; AC1/2/3 | v3 per-job facts, current role locks, complete logical groups, period/context counts |
| Move/reassign/adjust/accept atomic outcome/history | FR89, architecture10.2/14, UX4.6, Contract D; AC4–6/8 | Existing single/series/card proof and refresh transaction contracts |
| Current-segment common time/default-assignee fix | Åtgärda hela serien, existing15.2 materialized bounded segment; AC7 | Original rule anchor/end/count, nominal slots, unchanged IDs, exceptions/tombstones, lineage |
| Immutable command/history ledger | Supporting infrastructure for recorded outcome, actor/time and command replay, AC6/8 | Avoid outcome-only booking UPDATE/exception trigger or ephemeral conflict anchor; no new product module |
| Retained resolved rows and reopen semantics in all three effective writers | Mark resolved; accepted natural-key identity across recurrence, AC4/5/6 | E16-reserved shared refresh; unchanged single/series/card protocols |
| booking.changed in-app recipients/category/preferences channel guard | Explicit E13 notification in15.3/UX4.6; AC6/8 | Manifest/notification category coherence, self-only preferences/recipient RLS, existing quote mail behavior |

The new private ledger is a technical proposal, not a newly approved product requirement. Existing alternatives were examined: bookings.update_outcomes is durable but an accept-only write fires booking_occurrence_exception_internal unless a special transaction guard is introduced; conflict-row outcome storage disappears when an accepted/still-open anchor later leaves detection unless every refresh becomes ledger-aware. One append-only resolver ledger is chosen to reuse one record for durable command outcome and required Händelser without either invariant bypass. Root's distinct High validator assesses proportionality before freezing it.

## Proposed source paths

New source files:

- `src/features/scheduling/conflict-resolver.ts`
- `src/features/scheduling/conflict-resolver-types.ts`
- `src/features/scheduling/conflict-resolver-state.ts`
- `src/features/scheduling/conflict-suggestions.ts`
- `src/features/resources/booking-conflict-actions.ts`
- `src/server/read-models/booking-conflicts.ts`
- `src/server/bookings/conflict-resolution.ts`
- `src/server/bookings/conflict-resolution-attestation.ts`
- `src/server/commands/bookings/resolve-booking-conflict.ts`
- `src/server/commands/bookings/conflict-resolution-validation.ts`
- `src/components/scheduling/ConflictResolver.tsx`
- `src/components/scheduling/ConflictQueue.tsx`
- `src/components/scheduling/ConflictDetail.tsx`
- `src/app/(app)/scheduling/conflicts/page.tsx`
- `src/app/api/scheduling/conflicts/route.ts`

Existing source paths with exact proposed semantic deltas:

- `src/features/resources/bookings-read.ts` — complete logical count/scope and fresh manager scan; historical resolved rows excluded from active aggregate reconstruction; preserve nonmanager own-row reader.
- `src/server/read-models/scheduling.ts` — same scoped fresh manager count; own-only nonmanager projection unchanged.
- `src/server/bookings/conflict-facts.ts` — extract/reuse complete logical persistence mapping for a scan/full overlay without changing v3 facts, detector semantics or single candidate contract.
- `src/server/bookings/series-conflicts.ts` — reuse whole-current-segment planner through resolver adapter; any adapter extraction preserves ordinary series API/nominal matching/transport bounds and existing output.
- `src/server/commands/envelope.ts` — one resolveBookingConflict→resources/Bookings.Manage entry; no capability widening.
- `src/components/resources/BookingConflictChip.tsx` — accessible link/callback with explicit scope and manager entitlement; own-only informational variant retained.
- `src/components/resources/BookingEntry.tsx` — pass contextual count scope and manager actions; existing editor entry remains.
- `src/components/resources/BookingConflictPanel.tsx` — shared participant/rule presentation hooks, no embedded detector/command logic.
- `src/components/resources/BookingEditor.tsx` — inject resolver attempt/commit adapter and target/series scope while ordinary save paths remain; never ordinary commit followed by separate resolution.
- `src/components/scheduling/BookingBlock.tsx` — authorized glyph entry, no nested interactive controls or peer leak.
- `src/components/scheduling/SchedulingToolbar.tsx` — actionable labelled period-wide conflict chip, no silent filter narrowing.
- `src/components/scheduling/SchedulingWorkspace.tsx` — resolver deep link/selection plus unchanged views/editor/filter/drag parity.
- `src/server/notifications/registry.ts` — booking.changed plus minimal category labels and supported-channel metadata; existing categories retain behavior.
- `src/components/notifications/NotificationPreferences.tsx` — registry-driven category labels and only supported channel controls, no booking email affordance.
- `src/app/api/notifications/preferences/route.ts` — reject unsupported category/channel combinations using registry, preserve self-only updates.
- `src/scope/manifest.ts` — active scheduling gains booking_conflict_resolutions tenant table and booking.changed category only; no unrelated module transition or live surface.

No change to `src/server/authz/permission-matrix.ts`, `src/features/scheduling/capacity.ts`, `src/server/commands/jobs/card-proof.ts`, `src/server/jobs/producers.ts`, app-shell nav, deferred-token policy or E16.2/16.3 source is proposed. If actual implementation requires a new path/delta, return it for allocation before the write. Existing claims covering manifest, permission, capacity, H4, envelope/proof/refresh and fixtures remain Coordinator-owned even when their sessions are idle.

## Forward migration proposal and function inventory

Logical migration basename: `conflict_resolver`. On 2026-10-20 Coordinator name-reserved `supabase/migrations/20261020180000_conflict_resolver.sql` for E15. This reservation is not a SQL write grant or final shared allocation. Root/Coordinator still confirm the current combined migration inventory and project generation workflow before implementation; this is an allocation prerequisite, not a placeholder product requirement. Existing migrations105/106/107 and all earlier SQL remain byte-immutable. Do not append work into old files. Latest foreign E16 proposal20261019191746 is ownership data, not an instruction to integrate it.

Proposed new table: `public.booking_conflict_resolutions`, with private durable request digest/result and minimal manager history projection. Direct tenant ownership, FORCE RLS, explicit safe-column grants, checked-only insert and append-only trigger; same-tenant anchor FK and checked validation of every affected booking ID. Unique tenant/actor/command UUID; SQL actor/time/audit identity. Manifest/H4/privilege/migration-reset enrollment is mandatory. No new tenant counter, jobs table, public surface, storage bucket or file owner.

Proposed new checked/public functions (authenticated only, explicit grants; no PUBLIC/anon execute):

- `booking_conflict_resolver_snapshot` — resolves current manager authority under existing gate and returns server-only complete current facts/workflow/booking/series baseline with SQL snapshot time; no client fact authority.
- `finalize_booking_conflict_resolution` — one checked new/same-key replay entry; validates resolver-domain proof/current baseline/complete group/output; atomically writes overlay, workflow, ledger/audit/notifications; routes through current single/series validation internals without a separately committed save.
- `booking_conflict_history` — narrow RLS/manager-safe history projection, no private request/result/proof fields and no broad audit SELECT.

Proposed private helpers/trigger (names form the candidate inventory; private/no ordinary execute):

- `booking_conflict_resolver_baseline_internal` — canonical current selection/edit/workflow/series fingerprint, including fields missing from detector factDigest.
- `booking_conflict_resolver_output_internal` — complete overlay reference/logical-group validation, compatible with existing detector association identity.
- `booking_conflict_resolution_replay_internal` — current actor/role checked immutable outcome lookup, changed-digest rejection.
- `booking_conflict_refresh_internal` — complete-set refresh retaining absent resolved, preserving matching accepted, reopening current resolved and inserting new open identities; respects current constraints.
- `emit_booking_changed_internal` — transaction-local active before/after recipient union, preference gating, safe payload/deep link and event+recipient dedupe.
- `enforce_booking_conflict_resolution_immutable` — rejects ledger UPDATE/DELETE.

Forward-replace these three effective callers only as needed to use the shared refresh behavior, preserving all other current authoritative checks and protocol domains:

1. `booking_commit_editor_internal` (effective body20261007120235_booking_editor_audited_override.sql, refresh270; current outer v3 finalizer20261019133200_e16_16_1_job_booking_facts.sql).
2. `finalize_booking_series` (effective latest20261019220000_booking_series_integrity_followup.sql, refresh162).
3. `finalize_job_card` (effective20261019133200_e16_16_1_job_booking_facts.sql, refresh393).

Keep booking_detection_gate_internal and existing single/card/series attestation domains, exact13claim order, job facts null/empty semantics, role locks, direct-DML protection and source/successor revision checks. A helper extraction cannot weaken output validation or turn old proofs into resolver proofs. SQL notification/preferences category/channel constraints widen only for booking.changed in_app; no mail template/outbox/provider activation or new background producer. All failure injection and replay tests must hit these actual latest effective bodies, not an obsolete migration/function spelling.

## Proposed verification paths and immutable test boundaries

New files:

- `tests/unit/features/scheduling/conflict-resolver.test.ts`
- `tests/unit/features/scheduling/conflict-suggestions.test.ts`
- `tests/unit/features/scheduling/conflict-resolver-state.test.ts`
- `tests/unit/server/bookings/conflict-resolution-attestation.test.ts`
- `tests/integration/commands/conflict-resolver.int.test.ts`
- `tests/integration/rls/conflict-resolver.rls.test.ts`
- `tests/integration/read-models/booking-conflicts.int.test.ts`
- `tests/integration/components/conflict-resolver.test.ts`
- `tests/e2e/conflict-resolver.e2e.spec.ts`

Existing shared-test candidate files:

- `tests/integration/rls/tenant-table-inventory.ts` — new ledger enrollment/factory/denial metadata.
- `tests/support/authz/role-harness.ts` — proposed bounded shared allocation for the new booking_conflict_resolutions H4 metadata, fixture projection and minimal manager history return contract, including own/foreign fixtures; preserve E16 job-scope helper/cases and keep private request/result/outcome fields outside returned projections.
- `tests/integration/rls/role-harness.atdd.int.test.ts` — proposed bounded shared allocation for actual manager/own-only/foreign role-denial proofs matching the checked history projection and H4 contract; preserve existing E16 job-scope cases. No directory-wide fixture, admin-sql or factory authority is implied.
- `tests/integration/rls/migration-reset.int.test.ts` — current full-history schema/policy/grant expectations, preserving all E16 committed assertions and deriving migration/table counts from actual combined history.
- `tests/integration/commands/booking-editor.int.test.ts` — ordinary single writer terminal-history retention/reopening regression; add focused cases only.
- `tests/integration/commands/booking-series.int.test.ts` — effective series writer retention/reopening and no accept-only divergence; preserve all existing executed15.2 cases.
- `tests/integration/notifications/notifications.atdd.int.test.ts` — booking category preferences/recipient self-scope and existing quote regression.
- `tests/unit/server/notifications/registry.test.ts` — active category/channel metadata coherence.
- `tests/unit/support/booking-editor-sql-inventory.test.ts` — forward-helper/effective function inventory only if exact-current assertions require it; preserve sensitive prior assertions.

Job-card forward-refresh tests belong in new conflict-resolver.int.test.ts using the existing actual checked job-card commands and proof seams, avoiding changes to E16-owned tests. Existing conflict/editor/series/RLS/notification suites outside the explicitly listed shared candidates run unchanged as regression evidence; the two named role-harness paths receive only the bounded proposed metadata/projection/denial additions above. No renaming/removing/weakening skips or assertions to clear a gate. New synthetic test data is per-run unique tenant/actor/person/booking/series/job fixtures. No fixed shared fixture IDs, foreign mutable stack or global DDL race.

No test/support fixture file write is allocated by this plan. Proposed new tests should compose existing factories; if new helper exports require editing `tests/support/bookings-atdd.ts`, `tests/support/booking-editor-atdd.ts`, `tests/support/booking-series-atdd.ts`, `tests/factories/admin-sql.ts` or envelope fixtures, identify the exact semantic delta and obtain Coordinator allocation first. Existing migrations and E16 migration-reset24assertions remain immutable; do not hardcode107 as a future combined-history total.

## Resources and publication

Planning requested/started/adopted zero managed resources. No runtime/resource ID, mutable local DB/browser lease, fixture allocation, host port, app stack or auth fixture is inherited. Root retains guard lifecycle control and must allocate isolated verification resources under the exact actor context before future launches. Native Supabase lifecycle/reset, foreign/user-owned stack adoption and demo-target tests are forbidden. Stop requested resources when finished, preserving containers/data/profiles; no teardown deletion/pruning. No deployment/main merge/provider/secret/Preview change, separate PR or other-thread contact. Root owns Git/push/CI/state/sprint/ledgers and final epic publication; later frontend PR receives agent-fix unless owner opts out.

## Bounded allocation inventory amendment — 2026-10-20

Coordinator SAMEHigh allocation review requested the two exact role-harness paths above because ledger H4 enrollment and the checked minimal manager history projection require matching fixture projections and own/foreign role-denial proofs. This is an inventory successor only, with no product intent/AC/spec/kernel change. Preserve E16 job-scope helper/cases and all private outcome fields. The migration filename is name-reserved only; final allocation and SQL/app/test writes remain withheld. Root reports original independent High specification PASS; distinct verification of this bounded successor remains pending.

## Coordinator conditional allocation receipt — 2026-10-20

Root reports Coordinator FINAL CONDITIONAL ALLOCATION PASS for the original exact inventory plus tests/support/authz/role-harness.ts and tests/integration/rls/role-harness.atdd.int.test.ts. Receipt reference: `.env.epic15.mail-runtime/story-15-3-preparation/root-coordinator-allocation-20261020.json` (Root-owned; this author does not edit it). Migration20261020180000_conflict_resolver.sql is name-reserved and must be rechecked before creation. Independent bounded-successor verification and Root release remain required before implementation; no further generic Coordinator ACK is needed once those conditions are satisfied. This supersedes earlier allocation-pending wording only to that conditional extent, not as a planning-task SQL/app/test write grant.

Preserve the recorded later E16 join boundaries: envelope14lines, role-harness cases29lines and migration-reset24assertions; no automatic import of16.2 source without its coherent16.2 migration. Actual E16 HEAD90f53dc852a7a0044ef20f163699c96ad6f9a541/report-only dirty and no active Documents claim are Coordinator observations, not authority to widen writes. The common refresh must preserve all three atomic single/series/job-card paths, the107 row helper, existing13claims and distinct proof domains.

SQL category/channel pair constraints must forbid booking.changed/email at actual preference/delivery persistence boundaries even while existing email activation is enabled. Keep booking.changed in_app only; never rely solely on UI/registry hiding. The role/H4 fixture projection and expected denials must match the implemented checked minimal-manager history contract: distinguish permitted safe-column/projection access from denial of private request/result/outcome fields, rather than asserting wholly private table denial if SQL intentionally grants safe columns. No broad fixture/admin-sql/factory or private outcome-field grant follows from the two added paths.
