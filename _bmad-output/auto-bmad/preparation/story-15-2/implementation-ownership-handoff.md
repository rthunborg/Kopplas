# Story 15.2 implementation ownership handoff

Status: proposal only; independent story preparation is allocated. Implementation is NOT allocated by this artifact.
Base: 76f50d3854a2f6d5bb2b3e810f06b1c65cb0e9af, codex/epic-15-scheduling-time-calendar.
Source allocation: `.env.epic15.mail-runtime/r2-coordinator-preparation-allocation-20261019.json` (Coordinator October19).

## Required focused allocation before build

1. `src/scope/manifest.ts`: add ONLY `booking_series` to the already-active scheduling module's tenantTables. Preserve E16 module changes, resource table ownership and active Documents Option A. **Direct overlap with E16 reserved path; requires coordinator serialized delta allocation.**
2. `tests/integration/rls/tenant-table-inventory.ts`: add booking_series type union, per-role policy metadata, ordered setup/cleanup, valid cross-tenant FK fixtures, read/write target values and generated matrix expectations. Companion possible exact-schema expectations in `tests/integration/rls/migration-reset.int.test.ts`, `cross-tenant-isolation.rls.test.ts`, `role-harness.atdd.int.test.ts`. **Semantic/direct H4/SQL/auth/fixture overlap with E16 allocation; request exact subranges and migration composition order.**
3. New forward migration `supabase/migrations/20261019180000_recurring_booking_series.sql` (candidate path; recheck unused/order at implementation start): one new table booking_series, booking recurrence lineage/composite FK/unique constraints, narrow batch facts/snapshot/finalizer and checked create/update RPC wrappers, occurrence exception integration and privileges/triggers. **New path but semantic overlap with E16 SQL/auth and optional job link/fact proof contract.** Compare integrated E16 changes before writing; no historical migration edit. Both series and existing single-booking commands must use the existing tenant advisory gate and current-role locks. E16 job inputs remain consumed as checked data, never duplicated or relaxed.
4. `src/server/commands/envelope.ts`: add createBookingSeries/updateBookingSeries to closed command-capability metadata using existing resources/Bookings.Manage. **New command-map rows are shared auth semantics; E16 auth claim requires allocation/review even though not one of four explicit source reservations.**
5. New series tests need separate tenants/actors/rows and correlation-scoped fault injection. Existing global audit triggers, Vault key/config, migration replay and shared fixture setup are **mutable semantic resources overlapping E16 integrity verification**. Allocate isolated guarded DB runtime/schema/migration chain and serial DDL lane before running. No use/change of E16 allocated fixture-integrity unit.

## Files Created — proposed own implementation

| Path | Responsibility | Claim classification |
| --- | --- | --- |
| `src/features/scheduling/recurrence-types.ts`, `src/features/scheduling/recurrence.ts` | Strict preset/end contracts, pure expansion and nominal-slot materialization diff | New feature paths; no direct reserved-path overlap |
| `src/server/commands/bookings/series-validation.ts`, `create-booking-series.ts`, `update-booking-series.ts` | Validated envelope commands and typed outputs | New paths; existing booking authority/optional job-link semantics shared |
| `src/server/bookings/series-conflicts.ts` | Batch checked facts/preview/proof/finalization adapter; split into proportionate series-facts/preview/attestation/save helpers only if needed | New paths; semantic overlap with E16 proof/current job facts |
| `src/features/resources/booking-series-actions.ts`, `booking-series-state.ts` | Cookie-bound series actions, headless latest-preview/review/attempt/recovery state | New paths; no direct named reservation |
| `src/components/resources/BookingRecurrenceFields.tsx`, `RecurrencePreview.tsx` | Presets/end/preview, accessible replaceable presentation | New paths; no active Documents reservation |
| `tests/unit/features/scheduling/recurrence.test.ts`, `tests/fixtures/golden/scheduling/recurrence.json` | Independent preset/month/calendar/DST/bounds/slot diff goldens | New isolated cases; no E16 fixture-integrity-unit modification |
| `tests/integration/commands/booking-series.int.test.ts`, `tests/integration/rls/booking-series.rls.test.ts` | Atomicity/replay/race/split/exception/current-auth/direct-RPC/RLS | New cases; DB/DDL/schema fixtures require isolated allocation |
| `tests/integration/components/booking-series.test.ts` | Existing Vitest `.ts` SSR/state semantics; no new browser/DOM test dependency | New path; no interaction/persistence evidence from SSR |
| `tests/e2e/booking-series.e2e.spec.ts` | Essential production-host persistent recurrence flow/recovery/phone/keyboard | New path; auth fixture/resource allocation required |
| `_bmad-output/auto-bmad/delivery/15-2-recurring-bookings-series-materialized-occurrences-exceptions.json` | Actual development evidence, contract reconciliation and deferred release record later | Story-specific implementation author record; Root owns aggregate state/ledger |

## Files Modified — proposed own implementation after allocation

- `src/features/resources/booking-types.ts`, `booking-action-state.ts`, `bookings-read.ts`: real safe occurrence metadata; writable facts separated from server-owned series linkage; no template/private outcome disclosure.
- `src/server/read-models/scheduling.ts`, `src/features/scheduling/view-types.ts`: existing complete role-scoped five-view projections include exception/tombstone metadata; preserve minimal reassignment disclosure and pagination.
- `src/server/commands/bookings/validation.ts`, `update-booking.ts`: checked occurrence update and server-derived exception, preserved standalone anti-forgery. Existing create-booking.ts/booking-db.ts are conditional only if typed command transport requires adaptation; allocate candidate adjustment first.
- `src/server/bookings/conflict-facts.ts`, `editor-preview.ts`, `conflict-attestation.ts`, `save-with-conflicts.ts`: reuse sole detector/proof/finalizer patterns; add only necessary shared pure helpers, never relax single-booking contracts. **Sensitive semantic proof/current-fact overlap with E16; compare branch deltas first.**
- `src/features/resources/booking-actions.ts`, `booking-editor-input.ts`, `booking-transport.ts`: series dispatch/response-loss recovery/current-warning decisions and tested input/receipt admission.
- `src/components/resources/BookingEditor.tsx`, `BookingEntry.tsx`; `src/components/scheduling/BookingBlock.tsx`, `SchedulingWorkspace.tsx`: recurrence fields/scope/editor integration and visible exception/tombstone, retaining existing hosts and proposal-only dragging.
- `tests/integration/components/booking-editor.test.ts`, `tests/integration/commands/bookings-replay-authority.int.test.ts`, `booking-editor.int.test.ts`, `booking-conflicts.int.test.ts`; `tests/integration/rls/bookings.rls.test.ts`; focused unit booking validator/editor transport and scheduling read tests: only necessary regressions for changed contracts. Own new isolated fixtures preferentially; do not sweep unrelated test code.
- `tests/support/bookings-atdd.ts`, `tests/e2e/support/booking-editor-atdd.ts`: conditional small reusable adapters only if own new fixtures cannot reuse exports; no broadened shared fixture teardown. E2E `.auth/fixture.json` is runtime mutable and never a committed author artifact.
- This new Story15.2 spec receives actual verification, one author review order and terminal results after implementation. No15.1 kernel/baseline/history amendment.

## Explicit untouched reservations and boundaries

`src/server/authz/permission-matrix.ts`, `src/features/scheduling/capacity.ts`, `tests/unit/server/authz/phase-a-surface.test.ts`: read/reuse only; no new capability/capacity rule or update planned. If actual delta requires one, stop before writing and seek a focused allocation through Root. The manifest reservation remains unavoidable above. Preserve all E16 ledger rows and allocated16.1 facts/proof/SQL/auth/H4/fixture integrity unit. No active Documents claim blocks this preparation; do not reopen E20PR97/98/99.

No package/dependency/lockfile/.env/seed/key/global infrastructure change planned. Reuse existing synthetic Vault test key unchanged. No production secret operation, hosted test, new resource launched or source file modified by this handoff.

## Proposed semantic contracts to allocate and independently review

- One tenant-gated batch mutation and conflict replacement; normalized complete overlay includes newly created siblings, existing untouched rows and protected exceptions.
- Batch signed candidate/fact/review domains include rule, source/revision/pivot, stable proposed IDs, recurrence lineage and exception/tombstone metadata absent from current single detector digest.
- Minimal bookable RLS scope unchanged; template reads manager-only, occurrence metadata safe for own-assigned Montör projection. Explicit direct-DML/RPC anti-forgery of slot/series/index/exception.
- Series-level outcome on original addressed series, current-authority replay before expired proof checks, same key/different rule/decision rejected, unknown exact-attempt reconciliation; per-occurrence retention cannot authorize inactive person on new sibling.
- Stable nominal local-date slot identity; unchanged microsecond UTC time rows keep UUID; no resurrection, partial split, erased exception or accepted-state carryover to changed natural key.

Root next action: send exact five allocation items with final candidate paths/subranges and proposed isolated test-resource lane to Coordinator. Approval of this spec is independent of allocation; neither artifact implies integration readiness. Implementer must compare the actual allocated integrated head and file deltas before first app/schema/shared-fixture write.
