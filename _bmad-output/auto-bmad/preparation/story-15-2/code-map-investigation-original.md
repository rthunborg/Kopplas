Read-only investigation completed. Paths below are relative to `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`.

**Authoritative batch transaction**

- Reuse `public.booking_detection_gate_internal` unchanged: `supabase/migrations/20261006122441_booking_conflict_detection_integration.sql:5`. It binds `auth.uid()` to `p_actor_id`, takes the tenant advisory transaction lock, then checks current stored admin/PL roles after waiting.
- Latest finalizer is `public.finalize_booking_editor`: `supabase/migrations/20261007121034_booking_editor_whole_group_validation.sql:67`. Current sequence: authorize/serialize → replay → validate signed candidate/detector output/version/expiry → compare current fact digest → validate separately signed review → validate complete groups → commit.
- Existing `booking_conflict_output_internal` cannot validate a batch unchanged: `20261006122441_booking_conflict_detection_integration.sql:129`. Only one `p_booking_id` resolves against proposed facts; every other conflict participant must already exist in the database. New siblings require overlay-aware reference/assignee/window validation.
- Existing `booking_editor_groups_internal` also cannot simply receive batch groups: `20261007121034_booking_editor_whole_group_validation.sql:3`, especially lines 17 and 37. Every group must contain its single candidate. A batch equivalent must require an affected occurrence in each reviewed group while checking **all** candidate-related persistence rows and full v1/v2 aggregate association keys.
- `booking_commit_editor_internal` replaces the **whole tenant** derived set and preserves accepted workflow evidence only for identical natural keys: `20261007120235_booking_editor_audited_override.sql:268`. A series must generate the final complete overlay, run detection once, and replace conflicts once. Sequential single-booking saves would expose partial series commits and intermediate conflict truth.

**Concrete schema/RPC proposal**

One new `booking_series` table can hold:

- Rule/template/timezone/end condition and immutable rule-slot lineage.
- Tenant-scoped identity, optional split-parent/pivot metadata, revision.
- `create_command_id`, `create_payload_digest`, `create_result`, `update_outcomes` using the current embedded-outcome convention. This avoids a second outcome table and another H4/manifest enrollment.
- Unique `(tenant_id, create_command_id)` and `(id, tenant_id)`.
- Bookings need a composite `(series_id, tenant_id)` FK and uniqueness for the selected immutable slot identity. Current schema has neither.

Suggested new SQL seams, all delivered in a forward migration:

- `booking_series_payload_internal`
- `booking_series_digest_internal`
- `booking_series_replay_internal`
- `booking_series_facts_internal`
- `snapshot_booking_series`
- `booking_series_conflict_output_internal`
- `booking_series_editor_groups_internal`
- `finalize_booking_series`
- `booking_series_commit_internal`

Expose intended `createBookingSeries`/`updateBookingSeries` command/RPC contracts through checked wrappers; internal helpers remain revoked from authenticated/service-role execution. Use the existing cookie-bound client, existing attestation key retrieval and the same tenant gate. A distinct versioned series proof/review domain prevents single-booking receipts from authorizing batch changes.

**Proof and replay requirements**

- Bind the entire normalized request, rule, source series/revision, pivot, stable proposed series/occurrence IDs, complete materialization plan and decision into a batch candidate digest.
- Batch current-state digest must include series rules/revisions, membership/slot linkage, `is_exception`, cancelled tombstones and split lineage. Existing `booking_detection_facts_internal` includes booking demand but omits all recurrence metadata: `20261006122441_booking_conflict_detection_integration.sql:52`. Its digest alone cannot detect concurrent exception/series edits.
- On finalization, acquire the existing tenant gate, reconstruct fresh checked facts, compare digests and verify the signed plan before any durable write. SQL validates ownership/shape/references; the shared pure TS expansion/detector remains business-rule authority.
- Commit series row/split, occurrence changes, assignees, final conflicts, selected acceptance, durable outcome and audit in one transaction.
- Replay must resolve before key/receipt expiry checks, return the stored complete result, and avoid revalidating historical assignees or recomputing conflicts. Current replay’s actor membership lock/current role recheck is at `20261007120235_booking_editor_audited_override.sql:59`; fresh writes lock actor plus assignee memberships in sorted order at line 217, then profiles at line 221.
- Record split command outcome on the **original addressed series**, with resulting new series/occurrence IDs in the stored result. Otherwise retry after a lost response could look up the wrong lineage.
- Existing-assignment exception belongs per occurrence: archived/inactive people may remain on their existing occurrence, but retention on one occurrence cannot authorize new future siblings. Current SQL exemption is explicitly booking-specific at `20261007120235_booking_editor_audited_override.sql:223`.

**Defaults supplied by the parent fit the architecture, with these qualifications**

- Monthly missing-day skips, finite full materialization and local-wall-clock end offset do not contradict inspected approved requirements. Treat them as recorded owner-authorized design defaults.
- Preserve UUID on unchanged exact start/end instants; compare full microsecond instants rather than display strings. Current engine natural keys include booking IDs, affected person and conflict window: `src/features/scheduling/conflicts.ts:82`.
- Immutable slot lineage must remain separate from current timing and from a mutable/rebased `occurrence_index`. A tombstone or exception moved off its original time must still suppress regeneration of its original slot.
- Preserve post-pivot exceptions/tombstones by lineage when moving ownership to the new series. Existing pre-pivot exceptions stay with the old series, as required by architecture §10.3.
- New monthly skip semantics must state whether `N times` counts **materialized valid occurrences**; recommended yes. Otherwise a ten-occurrence request starting on the 31st can silently produce fewer rows.
- Existing single-occurrence update must acquire stored metadata under the same gate and set `is_exception` server-side. Merely widening public metadata inputs would permit callers to forge series linkage. Prefer keeping writable booking facts separate from protected recurrence metadata.

**Batch review and headless implementation**

- Detect against all resulting occurrences, including future rows beyond the first ten preview items. Show first ten occurrence rows, but require deliberate review of **every affected logical conflict** before commit. Selected groups become accepted; other reviewed groups remain open.
- Preserve complete aggregate identities when an affected occurrence sorts third or later. Existing TS projection is `src/server/bookings/conflict-facts.ts:79`; do not reduce grouping to pairwise collisions.
- `detectAllBookingConflicts` already accepts a complete overlay through `candidate` plus `existingBookings`: `src/features/scheduling/conflicts.ts:26`. A headless batch adapter can reuse it without touching reserved `capacity.ts`.
- Suggested new files: `src/features/scheduling/recurrence.ts`, recurrence contracts/validation/materialization-plan modules; `src/server/bookings/series-{facts,preview,attestation,save}.ts`; series command files; separate recurrence editor/preview/scope components.
- Keep command/recovery state outside presentation. Current exact-attempt retry/unknown-outcome behavior to preserve is `src/components/resources/BookingEditor.tsx:111` and `src/features/resources/booking-editor-input.ts:27`.
- Transport admission matters: current action limit is 3 MiB (`src/features/resources/booking-transport.ts:2`), receipt plaintext cap 750,000 bytes (`src/server/bookings/editor-preview.ts:27`). Bound raw rule/count/horizon input before expansion and reject a full reviewed request that cannot fit; previewing ten is not an admission bound.

**Ownership overlaps and verification**

- **Unavoidable reserved overlap:** `src/scope/manifest.ts:271` must enroll `booking_series`; `tests/integration/rls/tenant-table-inventory.ts` must add its type/fixture/read/write cases. Coordinate a narrow patch with E16.
- **Avoidable:** existing `resources/Bookings.Manage` can authorize series commands. Add mappings in `src/server/commands/envelope.ts` alongside lines 108–109; no new permission-matrix capability is necessary. No recurrence need found for reserved `capacity.ts` or `phase-a-surface.test.ts`.
- Reuse existing synthetic Vault test key (`supabase/seed.sql:154`) and booking/audit fault mechanisms, with separately scoped series fixture adapters. Do not modify E16’s allocated fixture-integrity unit.
- Essential new tests: bounded expansion/month skips/DST and microseconds; full-overlay sibling conflicts; aggregate acceptance; lost-response replay; same command/different rule or decision conflict; split identity/exception/tombstone preservation; membership revocation after waits; stale series metadata; rollback at each durable stage; RLS/ACL/migration reset.
- Existing proven concurrency/replay patterns: `tests/integration/commands/booking-conflicts.int.test.ts:159`, `:232`; `tests/integration/commands/bookings-replay-authority.int.test.ts:128`.
- Mutable test fixtures include shared per-run `tests/e2e/.auth/fixture.json`, tenant bookings/conflicts/profiles and Vault key. New cases should provision dedicated actors/rows and correlation-scoped faults. Existing browser harness mutates/deletes only token-scoped rows: `tests/e2e/support/booking-editor-atdd.ts:292`. 
