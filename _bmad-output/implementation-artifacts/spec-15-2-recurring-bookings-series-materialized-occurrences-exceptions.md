---
title: '15.2 — Recurring Bookings — Series, Materialized Occurrences, Exceptions'
type: feature
created: '2026-10-19'
status: in-review
review_loop_iteration: 0
followup_review_recommended: true
baseline_revision: '85755eb7cea3affdc77dbe1d30bb18279b614c5a'
story_key: '15-2-recurring-bookings-series-materialized-occurrences-exceptions'
context:
  - docs/process/review-order.md
  - docs/process/agent-model-routing.md
  - docs/process/development-completion-policy.md
  - docs/process/local-setup.md
  - docs/decisions/epic-14-story-ownership-contract-d-2026-10-07.md
  - docs/decisions/epic-15-scheduling-ux-disposition-2026-10-09.md
  - _bmad-output/test-artifacts/test-design-epic-15.md
  - _bmad-output/auto-bmad/preparation/story-15-2/implementation-ownership-handoff.md
  - _bmad-output/auto-bmad/preparation/story-15-2/post-integration-refresh-33c68c5a/integrated-source-contracts.md
  - _bmad-output/auto-bmad/preparation/story-15-2/post-integration-refresh-33c68c5a/ownership-reconciliation.md
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Existing bookings, the responsive editor and five scheduling views support individual bookings only. Planners need predictable repeated bookings with durable exception, cancellation and split behavior without duplicated rows or misleading conflict review.

**Approach:** Add bounded preset series and one pure calendar expansion shared by preview and server materialization. Commit series, real booking occurrences, assignments, complete authoritative conflict refresh, selected acceptance, durable dedupe outcome and audit atomically; preserve existing checked authority and headless separation.

## Boundaries & Constraints

**Always:** Phase B FR88/NFR48 and architecture §§3.3, 10.1–10.4, 14 govern. Reuse current Bookings.Manage (Admin/PL), cookie-bound normal Auth JWT, active membership/multi-role union, same-tenant composite references and generic denials. Montör reads only assigned occurrences; no series template or peer data disclosure. Authenticate/recheck current authority before replay as well as new writes. New booking_series is FORCE-RLS, explicit-grant, manifest/H4-enrolled; DML follows checked transaction wrappers with no direct recurrence metadata bypass. SQL owns actor/time/audit; server proofs bind exact operation, tenant/actor, command, series version/pivot, proposed occurrence IDs/payloads, complete current facts/output and reviewed logical groups. Preserve Contract D selective review, logical-group completeness, stale rejection, stable candidate identity and accepted state only for unchanged natural keys. All accepted finite occurrences are materialized now, with no background rolling expander. Calendar arithmetic precedes UTC conversion; default Europe/Stockholm, no timezone-setting UI. UI at 360×640 remains connected, keyboard reachable and successful only after confirmed persistence. Domain/rule/state/validation/actions remain separate from replaceable editor/preview presentation.

**Block If:** Before any app/schema/shared-fixture write, coordinator has not allocated the exact overlapping candidate delta in the ownership handoff; current downstream validation cannot preserve transactional proof/conflict authority without widening permissions or secrets; implementation needs a new product decision outside these approved requirements. These are implementation prerequisites, not reasons to omit this specification. A new concrete ambiguity must be reported with evidence; never silently waive a gate.

**Never:** Virtual-only occurrences, freeform RRULE, unbounded series, per-occurrence independent commits, trusted client expansion/conflicts/proof/actor, blanket conflict acceptance, silent truncation, physical cancellation deletion/regeneration, overwrite of exceptions, UUID churn for unchanged-time rows, extra peer-membership reader, money, resolver UI/actions/notifications (15.3), time reports/feed/Min dag (15.4–15.6), AI/optimization, PWA/offline storage/queues/sync, hosted migrations/provider/secrets/deployment changes, legacy URLs/evidence/browsing. Do not reopen E20 PR97/98/99 or write E16-reserved seams without allocation. No implementation, ATDD/scaffolds or runtime launch in this planning run.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Presets/end | Daily; selected-weekday weekly; every-other-week; monthly; exactly until-date or positive integer count | Same ordered real occurrence schedule in preview and materialization; until-date includes eligible local start dates through that date; count counts emitted occurrences | Invalid/empty weekdays, missing/both ends, nonfinite/unsafe count, nonpositive interval or admission overflow fail before writes; never truncate |
| Calendar edges | Monthly from January31; weekly07:00 spanning spring/autumn; all-day and overnight | Monthly skips absent day (Jan31, Mar31, May31); local endpoints/day offset retained; spring gap first valid instant, autumn fold earlier instant; UTC goldens match | Any occurrence whose independently converted endpoints are nonpositive rejects the entire candidate, identifying its local date to the authorized editor |
| Preview/review | Next min(10,total) entries, conflicts anywhere in full proposed series | Preview always shown; per-entry glyphs plus complete warning review for every affected occurrence, including beyond 10 and retained exceptions | New candidate/facts/series version invalidates receipt and selection; failed/pending preview cannot authorize save |
| Replay/recovery | Same series command key/content raced or retried after lost response | One durable series/split/result/audit; same stable proposed IDs reconcile; no automatic new command on unknown outcome | Changed content under same key rejects COMMAND_CONFLICT; lost response retains exact attempt and explicit retry; revoked authority cannot reveal replay |
| Exception/cancel | Edit/cancel one materialized occurrence, then change rule | Edited row sets is_exception; cancelled row remains exceptional tombstone; neither is overwritten or resurrected | Invalid/foreign occurrence or series linkage denied generically with zero writes |
| Split | At pivot choose Detta och kommande | Old rule ends before pivot, successor owns suffix; prefix exceptions untouched; retained suffix exceptions/tombstones transfer; rows at unchanged times keep UUIDs | Stale version/pivot or concurrent incompatible change rejects whole command; no partial move or duplicate slot |
| Conflict integrity | New/changed occurrences collide with persisted rows or each other, including aggregate capacity groups | Sole detector sees complete post-mutation set once; current warning review/nonblank reason required; only selected complete candidate-related groups accepted; unrelated/open groups remain correct | Forged/stale/missing proof or review, changed authority, and injected failure leave series/bookings/assignees/conflicts/outcome/audit unchanged |

</intent-contract>

## Source Acceptance and Provenance

AC sketch: `booking_series` rule rows (preset patterns: daily/weekly-with-weekday-picker/biweekly/monthly; mandatory end condition — no unbounded series); occurrences materialize as real `bookings` rows via one pure expansion function shared by editor preview ("next ~10 with conflict glyphs") and server; `createBookingSeries`/`updateBookingSeries` RPCs with series-level dedupe; occurrence edits set `is_exception` ("avviker från serien"), cancellations leave tombstones; "Detta och kommande" = series split preserving pre-pivot exceptions and stable occurrence ids where times unchanged; recurrence participates fully in conflict detection; DST boundary-week fixtures extend the 14.3 packs.

**No four-part Design Gate Criteria are declared for Story 15.2 in epics-phase-b.md.** Its AC sketch and binding UX §4.6/§6 contracts remain required. The derived Given/When/Then criteria below make those requirements executable; they do not replace the source sketch. October 15 owner direction forbids legacy evidence and authorizes maintainable design defaults. No new legacy observation/parity claim is made.

Primary context: AGENTS.md; _bmad-output/project-context.md; valid epic-15-context.md (2026-10-13, newer than all planning sources); architecture-phase-b.md §§3.3/9.2/10/14/16.4; epics-phase-b.md Story 15.2; ux-design-specification-phase-b.md §§4.6/6/10. Current Phase B sources supersede historical Phase A epics/architecture/UX. Existing design system is src/app/globals.css plus src/components/crm/Dialog.tsx and resource editor controls; there is no nextjs-app/docs/design/DESIGN.md in this repository.

Continuity: spec-15-1-the-five-scheduling-views-2.md is done, landed at 4c04159ed5dd938490e61bb7d705bada80cda071; reviewed source 0f56d487f96185f111d3378f2807b89c02dc9b81 and CI 39282080632 are reported upstream facts, not recurrence execution. Preserve its five views, manager boolean-only reassignment disclosure, own-only data, filters/capacity and actual Contract D hosts. Epic 14 October 8 accepted-with-open-items plus verified integrated closeout supersede the October 7 rejection only as current status. Its 44 maintenance advisories, representative performance thresholds/workloads and manual accessibility/daylight/exploration remain inherited open context; do not add them as recurrence implementation scope or mark them passed. Contract D’s host obligation was carried into 15.1 and its reviewed contracts remain binding.

Integration amendment (2026-10-19): current source baseline is33c68c5aef5b75f96cf0ca5c086ebe911631db55. The original76f50d38 candidate raw05770b8c408209935d0521f861410b484bd58c88e7bd28dfb5fab206650ef816 and technical independent PASS remain historical, preserved in the original preparation artifacts and current spec-before-amendment.md. The intent kernel remains013b7ae0d0614d20dbc021885786ca1803976e10bd634ddc0bc3791b19de4ee1. This preparatory amendment is unapproved; CI39304828183 and distinct High validation remain required. Read the current integrated-source-contracts.md and ownership-reconciliation.md companions listed above.

## Code Map

- src/features/resources/booking-types.ts:3,4 — BOOKING_PUBLIC_COLUMNS already selects recurrence fields; BookingFacts currently restricts them to null/false. Separate read/domain occurrence metadata from caller-owned mutable facts.
- src/server/commands/bookings/validation.ts:36,63 — strict existing payload validator rejects recurrence metadata; preserve standalone API rejection and add checked occurrence/series input paths, never trust arbitrary linkage.
- src/features/resources/bookings-read.ts:88 — summary currently erases recurrence metadata; src/server/read-models/scheduling.ts and src/features/scheduling/view-types.ts carry five-view data; expose safe actual occurrence flags without series rule/outcome leakage.
- supabase/migrations/20261006101609_bookings_and_assignees.sql:4,12,169 — recurrence columns exist; command identity/outcomes live on booking rows. No booking_series exists. Use a forward migration, never edit historical SQL.
- src/server/bookings/save-with-conflicts.ts:20,36 — authenticated snapshot/server engine/signed finalizer and replay; finalization is one booking. A series needs one batch snapshot/current-facts finalizer under the same tenant serialization gate, not a loop of these single saves.
- src/server/bookings/conflict-facts.ts:28,45,79 and src/features/scheduling/types.ts and src/features/scheduling/conflicts.ts — current v3 complete per-job FactBundle, every booking.jobId, independent null/empty roles/windows and sole whole-tenant detector/association projection. Current groups select one snapshot.bookingId; batch review must instead intersect the complete affected-ID set, without fake per-candidate snapshots or repeated single saves. Preserve current v3/v1 and unchanged natural keys.
- src/server/bookings/editor-preview.ts:10; conflict-attestation.ts:13; create-identity.ts — current single-booking review/domain and exact13-claim order/stable identity patterns; src/server/commands/jobs/card-proof.ts:4 has a distinct job-card domain. Preserve these protocols; new series proof/metadata uses a separate domain. Internal proof is never browser output except opaque checked receipt.
- src/features/scheduling/time-zone.ts:45 — stockholmLocalToUtc pins gap/fold policy and microseconds. Reuse helpers; do not add elapsed-week UTC arithmetic.
- src/components/resources/BookingEditor.tsx:19,98; src/components/resources/BookingEntry.tsx; src/features/resources/booking-actions.ts:34,71 — editor/state/actions/host seam; retain unresolved attempt, dirty guard, latest-request protection, explicit retry and current option refresh.
- src/components/scheduling/BookingBlock.tsx; SchedulingWorkspace.tsx; src/features/resources/booking-action-state.ts — actual host edit proposals and public summaries; show exception/cancel markers and route occurrence edits through scope selection.
- src/scope/manifest.ts:263 — scheduling already active, tenantTables empty; enroll booking_series there, retain resource ownership of existing booking tables and all unrelated partitions. H4 at tests/integration/rls/tenant-table-inventory.ts is exhaustive.
- tests/support/bookings-atdd.ts; tests/factories/admin-sql.ts; tests/support/stack-gate.ts — isolated tenant/actor fixtures, test-only introspection and REQUIRED DB gating. Existing scheduling DST goldens/editor/booking-replay/role-RLS suites provide regression boundaries.

## Files Created / Files Modified

The complete proposed impact list and overlap classification are in `_bmad-output/auto-bmad/preparation/story-15-2/implementation-ownership-handoff.md`; tasks below bind the candidate files to behavior. No package/dependency/lockfile, .env, global infrastructure, new permission capability or capacity-rule file change is planned. A changed candidate list must be reconciled before implementation writes.

## Tasks & Acceptance

**Execution (ordered; candidate impact paths require ownership allocation first):**

- [ ] T1 — `src/features/scheduling/recurrence.ts` and recurrence-types.ts (new); tests/unit/features/scheduling/recurrence.test.ts plus tests/fixtures/golden/scheduling/recurrence.json (new): implement strict preset/end validation, deterministic complete expansion and first 10 projection, calendar/DST/overnight/all-day/missing-month-date goldens. Supports AC1/2.
- [ ] T2 — `supabase/migrations/20261019180000_recurring_booking_series.sql` (new candidate): add booking_series rule/defaults/version/durable command digest+outcome fields, immutable nominal-slot identity for occurrences, composite same-tenant FK and uniqueness; checked create/update/split/occurrence commands, FORCE RLS, minimal explicit grants/triggers, atomic audit/outcomes. Enroll via src/scope/manifest.ts; extend tests/integration/rls/tenant-table-inventory.ts and exact-policy/privilege fixtures as allocated. Supports AC3–7. No permission-matrix/capacity edit is planned.
- [ ] T3 — `src/server/commands/bookings/series-validation.ts`, create-booking-series.ts, update-booking-series.ts (new); src/server/bookings/series-conflicts.ts (new); src/server/commands/envelope.ts capability-map entries for createBookingSeries/updateBookingSeries under existing resources/Bookings.Manage; with existing conflict-facts.ts/editor-preview.ts/conflict-attestation.ts/save-with-conflicts.ts only where required: cookie-bound envelope commands expose createBookingSeries/updateBookingSeries and narrow checked SQL RPCs; validate references, shared expansion, complete batch snapshot/proof/review, version/dedupe and one atomic finalizer. Supporting infrastructure for AC2–7; preserve standalone paths.
- [ ] T4 — `src/features/resources/booking-types.ts`, booking-action-state.ts, bookings-read.ts; src/server/read-models/scheduling.ts; src/features/scheduling/view-types.ts; src/server/commands/bookings/validation.ts and update-booking.ts: project actual safe occurrence metadata, support authorized one-occurrence exception/cancellation updates, reject linkage forgery/direct-DML bypass, keep all five projections/own-row scope coherent. Supports AC4/5/7/8.
- [ ] T5 — `src/features/resources/booking-series-actions.ts` and booking-series-state.ts (new); src/features/resources/booking-actions.ts, booking-editor-input.ts, booking-transport.ts: wire preview/save/reconciliation with immutable attempt identity and bounded full warning review; retain unsent failure input and explicit retry. Domain state/actions independent of JSX. Supports AC2/3/6/8.
- [ ] T6 — `src/components/resources/BookingRecurrenceFields.tsx` and RecurrencePreview.tsx (new); BookingEditor.tsx, BookingEntry.tsx; src/components/scheduling/BookingBlock.tsx and SchedulingWorkspace.tsx: off-by-default recurrence presets/end, accessible preview/glyphs, complete warning review beyond 10, Endast detta tillfälle / Detta och kommande scope, exception/tombstone visibility and fresh series-edit preview. Use existing Dialog/styles/focus and 360×640 layout. Supports AC2/4/5/8.
- [ ] T7 — `tests/integration/commands/booking-series.int.test.ts` and tests/integration/rls/booking-series.rls.test.ts (new); focused existing booking/editor/replay/scheduling regression suites: execute atomicity/fault/replay/race/exception/tombstone/split/stable-ID/beyond-preview conflicts/current-role/direct-RPC/DML/tenant negatives and mixed batch conflicts. Independent SQL snapshots verify outcomes, not mocks. Supports AC3–7, TEA15.2-INT-001…005.
- [ ] T8 — `tests/integration/components/booking-series.test.ts` and tests/e2e/booking-series.e2e.spec.ts (new): essential real production-host create→reload→occurrence edit/cancel→split→reload flow, latest preview/stale review and lost-response explicit retry; actual DB outcomes, keyboard accessible scopes, phone 360×640. Component coverage uses the existing `.test.ts` SSR/state runner without claiming interaction/focus/persistence evidence; actual interactions remain in essential browser smoke. Focused headless state tests cover remaining edges; exhaustive view/gesture/device/screenshot/manual matrices are separately tracked release work. Supports AC2/4/5/8; TEA15.2-COMP-001.
- [ ] T9 — this spec Verification/Auto Run Result and _bmad-output/auto-bmad/delivery/15-2-recurring-bookings-series-materialized-occurrences-exceptions.json: author records exact executed evidence, required development/release reconciliation, deferred owner/status/next actions and one verified Suggested Review Order after actual implementation. Independent sensitive review and root delivery gate precede any development-complete claim. Supporting completion infrastructure; no empty final trail now.

**Acceptance Criteria:**

- AC1 — Given a valid supported preset with until-date or count, when expanded through the editor and command path, then one pure function emits the same ordered bounded calendar schedule; missing/unbounded/invalid rules fail without writes and independent monthly/weekday/biweekly/end/DST/all-day/overnight goldens match the matrix.
- AC2 — Given an authorized planner using the actual booking editor, when recurrence is enabled or changed, then the next min(10,total) occurrences and per-occurrence conflict glyphs appear before commit, all affected warnings including beyond 10 remain reviewable, and pending/failed/stale previews cannot save.
- AC3 — Given a reviewed create/update series attempt, when it commits, races, faults or loses its response, then series+occurrences+assignees+complete derived conflicts+selected acceptance+dedupe outcome+audit are atomic, identical replay returns the same result once, changed content under its key is rejected, and explicit retry preserves identity without duplicates.
- AC4 — Given an existing series occurrence, when Endast detta tillfälle edits or cancels it and a later series edit runs, then its exception values and UUID survive; cancellation persists as a visibly exceptional tombstone and never regenerates.
- AC5 — Given a series with prefix/suffix exceptions and tombstones, when Detta och kommande is committed at a pivot, then the old series ends before the pivot and one successor owns the suffix, all retained exception/tombstone identity survives, unchanged-time rows retain IDs, and stale/concurrent splits produce no duplicate or partial ownership.
- AC6 — Given any full series mutation including intra-series and aggregate capacity collisions, when server finalization executes, then the sole detector uses current complete facts under the transaction gate, every affected candidate warning requires current acknowledgment/nonblank reason, only complete selected candidate-related groups are accepted, unchanged natural keys retain acceptance and changed identities reopen; forged/stale/unrelated acceptance fails with zero writes.
- AC7 — Given anonymous, foreign-tenant, inactive/revoked, Montör, Säljare, Ekonomi and manager role-set callers, when series/occurrence read/write/replay and direct SQL/RPC/DML surfaces are probed, then current matrix/own-row/same-tenant authority is enforced, no hidden peer/template/outcome data is exposed and allowed managers retain valid standalone optional-link bookings.
- AC8 — Given connected desktop and 360×640 real scheduling/resource hosts, when a user creates, edits, cancels, splits, reloads or explicitly retries a failed/unknown series attempt, then actual persisted rows and visible exception/tombstone markers agree across relevant projections, keyboard/dialog scope selection works, unsent input stays labelled unsent until confirmed, and existing 15.1 editor/filter/capacity/own-agenda/Contract D hosts still work.

## Spec Change Log

Historical preparation record (preserved; current Round1 triage is below).

No review loop has run. This is a new planning contract, with no prior 15.2 approved kernel to amend.

2026-10-19 — Bounded post-integration companion amendment at33c68c5a (preparation only): Root authorized source-baseline/code-map/technical companion reconciliation after coherent E16 integration. Correct the obsolete latest-finalizer reference and bind current per-job facts, null-versus-empty semantics,13-field/domain/version invariants, complete affected-ID batch projection and additional series metadata digest. Avoid building from obsolete scalar job facts, cross-protocol proof reuse or per-booking committed loops. KEEP the exact intent block, original9tasks/8ACs/source AC sketch, original76 evidence,15.1 kernel/history and development-versus-release gates. No implementation review round or approval is manufactured.

## Review Triage Log

### 2026-10-20 — Review pass

- intent_gap: 0
- bad_spec: 0
- patch: 8: (high 4, medium 4, low 0)
- defer: 0
- reject: 1: (high 0, medium 0, low 1)
- dismissed: none
- addressed_findings:
  - `[high]` `[patch]` R1-01 cached series identity/version after stale preview/save — current metadata reload retains draft, clears admission and fails closed; actual TSX ports plus GLK007 PASS9.907s.
  - `[medium]` `[patch]` R1-02 following scope drops explicit gesture — separate proposal composed over defaults; Workspace unit and actual native drag/reassign+resize GLK008 PASS9.817s with SQL readback.
  - `[high]` `[patch]` R1-03 requested date overwritten — forward rule start stays independent of nominal cutoff; genuinely changed earlier coordinates reject, inherited/end-only anchor compatibility and entered-date rejection pass actual planner/editor tests.
  - `[medium]` `[patch]` R1-04 hidden retained template assignee — effective selected fallback is visible/removable; GLK009 PASS5.439s includes replacement, preview, saved defaults and independent SQL.
  - `[high]` `[patch]` R1-05 protected archived work-role rejection — immutable forward106 narrowly retains unchanged historical protected role; actual105 REAL020 RED1F then106 GREEN1P includes fresh inactive-role denial and no-write snapshot.
  - `[high]` `[patch]` R1-07 whole-successor lower lineage bound — planner and forward106 validate requested/effective rule plus every signed row; normal-JWT REAL021 PASS proves forged-overlay denial/zero writes and valid bounded edit.
  - `[medium]` `[patch]` R1-08 moved-pivot production coverage — checked occurrence edit crosses nominal prefix, then actual planner/checked split REAL022 PASS preserves exact microseconds, UUIDs and prefix/suffix ownership.
  - `[medium]` `[patch]` R1-09 date-only all-day caller coverage — actual editor converter through validation/expansion matches independent spring/fall midnight/exclusive-end UTC literals.
- Rejected R1-06: conservative unknown per-option series labels make no false availability claim; complete authoritative warnings/review gates remain. No enhancement scope added.
- Follow-up review recommendation: true (patched high4/medium4; medium score12). Same independent High targeted source/binding review passed after Unicode restoration (82offline checks) and009-only action correction (42offline checks); no new broad round.
- Original triage78aaa6 and all six review reports remain immutable. Unicode15literal/17line restoration and009 detaching-checkbox action binding are targeted follow-up history; original failed runs remain failed. GLK changed essential flow has actual2+1 passes, never relabeled one3-pass run.
- Source checkpoint and fresh exact-head CI/fullDB/RLS/empty replay/physical Storage/pilot remain pending. No development-complete/done or release-ready claim.

### Historical preparation triage record (preserved)

No implementation/code review has run. Parent-owned independent specification validation is required before approval/build; no broad review round is consumed by this plan.

## Design Notes

Owner-authorized defaults (2026-10-15 design direction), grounded in approved recurrence scope: daily means calendar days; weekly uses selected ISO weekdays and biweekly uses the start date’s ISO Monday week as alternating anchor; monthly uses the start’s day-of-month and skips missing dates without clamping/drift. Count counts emitted occurrences and until is inclusive by local start date. Preserve the original local start/end clocks plus end-day offset, rather than elapsed UTC duration; all-day uses local midnight boundaries. Expansion is pure/no clock/no I/O. No tenant timezone UI; existing Stockholm helper is the current setting seam. Display these choices in concise editor help/preview so dates are predictable.

Materialize the complete admitted finite candidate. Admission must use explicit tested resource/transport bounds shared by preview/server (existing action JSON limit 3 MiB; receipt encrypted body at most 750,000 bytes including 28-byte overhead) and reject over-limit input before expensive work or any mutation; do not silently shorten the user’s requested end. Select proportional numeric engineering limits against existing transport/fact budgets during implementation, document them in one validation constant and UI error, and independently verify boundary/boundary+1. This is bounded infrastructure, not an approved performance certification or new scheduling feature.

An update uses a source occurrence ID and expected series revision; derive the pivot from its stored nominal slot, never its edited actual start. For a pure field change or unchanged rule, preserve the original end and remaining slots, not a restarted original count. If the user explicitly changes count, that count applies to the successor from its pivot; preview shows the complete resulting suffix before commit.

Use immutable nominal local start-date slot identity (one preset occurrence per local date), distinct from edited actual instants and mutable sequence/index. On full series edit retain every edited exception/tombstone even when the new rule omits its date; on split retain prefix ownership and move suffix records with their immutable slot identity. A retained slot suppresses generated replacement for that nominal date even when the rule changes time. If the rule introduces a different local date, it is a new slot; moving an exception onto it must not silently merge/drop either booking (detect collisions). For unaffected generated rows match canonical UTC start/end to preserve UUIDs across split/re-expansion, with deterministic one-to-one matching; update metadata/assignees in place where appropriate. Removed ordinary generated slots become cancelled exceptional tombstones rather than hard deletes and also suppress subsequent regeneration of their original slot. No automatic restoration of any cancelled slot is authorized. Keep occurrence uniqueness and same-tenant lineage enforced in SQL, not only in the pure diff.

The existing finalizer validates/replaces tenant conflict output for one candidate. Batch materialization must compute the complete proposed post-write tenant booking set, including candidate-candidate collisions and unchanged exceptions, through the sole engine/group derivation, then finalize once under current tenant serialization/fact+series-version checks. Preserve the current `booking_detection_gate_internal` in `supabase/migrations/20261006122441_booking_conflict_detection_integration.sql:5`; latest single finalizer is `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:82`; the whole-group helper remains `20261007121034_booking_editor_whole_group_validation.sql:3`. The current v3/v1 per-job/null-empty/proof/replay and batch-overlay requirements are bound in the integrated-source-contracts.md companion. New series helpers must validate batch overlay references, not pass several new siblings through `booking_conflict_output_internal`’s single-candidate lookup or `booking_editor_groups_internal`’s single-candidate membership check. Snapshot/proof domains distinguish series operations from individual booking authority; no unsigned list or single-booking receipt can authorize a batch. The current-state digest must additionally cover source/successor series revisions, recurrence rules, nominal slot linkage, occurrence indices, is_exception, cancelled tombstones and split lineage: the existing detector-facts digest omits these. Acquire actor/assignee membership and profile locks in deterministic order after the same tenant gate. Existing inactive/archived assignment retention is per occurrence only and cannot authorize new future siblings. Store a split outcome on the original addressed series and return successor/occurrence IDs in that durable result. Add overlay-aware SQL output validation and complete logical-group validation: every reviewed group must involve an affected occurrence and contain all current persistence association keys. Existing HMAC key/config may be reused only with explicit domain-separated binding; no new environment/secret change is authorized by planning. Replay returns recorded result after current actor/auth/role gates without revalidating historical assignees, mutable candidate references, expired receipts or keys and without rerunning mutations/acceptance/audit. Outcome storage on booking_series remains private behind narrow public column grants.

## Verification

Historical planning verification record; current executed evidence is in Implementation Verification below.

Planning-only run: process/artifact checks only; zero runtime suites, zero scaffolds/ATDD or resources. Future development follows current .github/workflows/ci.yml/verify:development plus required exact-head CI. Do not copy historical native Supabase lifecycle commands into agent execution; use resource-guard/local-setup and allocated isolated resources. Never target demo.

- pnpm typecheck; pnpm lint; pnpm run test:unit; pnpm build; pnpm run verify:bundle-containment (after build), source containment/lockfile/audit and applicable process checks — expected before development completion: every applicable static/build check passes; none executed in this plan.
- Focused unit recurrence/DST and component tests plus SUPABASE_TEST_REQUIRED=1 full pnpm run test:int — actual executed counts, no credit for required skipped bodies. Focused new DB series tests and existing booking/editor/replay/RLS regressions prove matrix/atomic current facts and cross-tenant/role boundaries.
- Empty migration+seed and independent physical recovery-storage integrity lane remain mandatory; actual current schema/H4/policy/fixture agreement, no broad fixture mutation/DDL race. CI’s required verify/db/recovery-storage-loader/e2e/dashboard-e2e results must reference the exact pushed head.
- pnpm exec playwright test tests/e2e/booking-series.e2e.spec.ts --reporter=list,json — essential actual production-server connected series flow, keyboard/phone scope, stale review/response-loss behavior and durable outcome; no next dev substitute, synthetic command success or receipt-only proxy.
- Trace TEA15.2-UNIT-001/002, INT-001…005 and COMP-001 to actual tests/results. Later selected ATDD/automate/trace-advisory phases own scaffolds and execution; this plan does not execute them.

Development completion reconciles the October 19 owner policy: focused integrity/current-auth/transaction/DST tests, full REQUIRED DB/RLS, direct recovery-storage, applicable static/build, independent High review and essential browser smoke are required. Exhaustive browser/view/gesture/device permutations, screenshots/visual comparisons, manual accessibility/daylight/exploration, representative performance certification and polish are deferred release validation, never passed by proxy. Implementation author records each deferred item with scope, owner QA/UX or Product/Architect as appropriate, actual evidence/status and next action in delivery/deferred ledger; coordinator owns aggregate ledger writes. Do not reclassify consequential broken functionality as polish. After two failed attempts choose a simpler safe approach or record owner/evidence/next action/resume condition. Development done never means release ready or deployment approval.

## Auto Run Result

Status: in-review
Blocking condition: Reviewed source checkpoint and fresh exact-head required CI (fullDB/RLS, empty migration+seed replay, physical recovery Storage and pilot performance) remain pending; no development-complete or done claim.

Current P5 author result —2026-10-20: approved kernel013b7ae0d0614d20dbc021885786ca1803976e10bd634ddc0bc3791b19de4ee1 and original9tasks/8ACs/source AC sketch are unchanged. Round1 six independent layers completed;8patches addressed (4high/4medium; medium score12; followup true),0intent_gap/0bad_spec/0defer/1reject. Targeted High fix/binding follow-ups passed; all accepted fixes now have the actual focused evidence mapped below. Source checkpoint is NOT done; Root owns Git/current-head CI and final delivery admission.

- Summary: complete finite materialization, protected exceptions/tombstones and nominal lineage; stale following recovery, explicit gesture/date intent and visible retained assignee fixes; narrowly reviewed forward106 role/bound guards.
- Current build/source: GLKBSX62N9CbTViZM7YrP,433source manifestc0aadd3c/inventoryadef0cc8; current12path source-test freeze6666a3b1. Both first-applied migrations1800SHA24f and220000SHAc55 permanently immutable.
- Review findings breakdown:8patched (high4/medium4),0deferred findings,1nonconsequential reject. Follow-up review recommendation:true, medium score12; targeted High82+42offline checks passed, without resetting broad round1.
- Verification performed: focused42P0F0S/lint0/tsc0/build0/public/bundle0; actual106 integrity0201P plus021/0222P; changed essential browser007/0082P then0091P,0skips/flakies/globalerrors in their passing receipts. Original105 RED and2P1F browser result remain preserved. Historical fullDB1824P52S/RLS800P14S and earlier essential receipts retain explicit dependency limits, not current-head CI credit.
- Pending development evidence: reviewed bounded source checkpoint, fresh exact-head standard CI/fullDB/RLS/empty replay/physical Storage/pilot and Root delivery gate. Delivery evidence_revision remains null until actual checkpoint; current worktree is not a revision.
- Deferred release validation:3owned delivery items (QA/UX exhaustive visual/device matrix; QA/UX manual accessibility/daylight/exploration; Product/Architect representative scheduling performance). Frontmatter deferred findings remains0; release validation is separate and never passed by proxy.
- Exact evidence and file inventory: build-intent-matrix.md, build-change-inventory.json, build-round1-author-verification.json and pending delivery record. No PR/push/deployment/Root state or sprint mutation by author.

### Historical preparation and dispatch record (preserved; old status superseded)

Current implementation dispatch —2026-10-19: Root approved P3 after independent High amended-spec validation and exact-head integration CI39304828183 passed all five required jobs. P4 ATDD completed at current implementation baseline 85755eb7cea3affdc77dbe1d30bb18279b614c5a. Root expressly authorizes implementation of this approved candidate, independent review and required verification now; earlier unapproved/planning-halt/pending-CI prose below is historical and does not reimpose those released gates. The narrow Coordinator allocation in current ownership companion stands. Read the canonical ATDD checklist _bmad-output/test-artifacts/atdd-checklist-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md and its actual adapter contracts;110 skipped scaffolds are not coverage. Preserve their original receipts and activate meaningful real-path checks. Ask the parent Build Auto delegate for concrete DB/browser runtime qualification before mutable verification; old Root resource IDs are stopped and must not be reused. No unguarded service launch, reset/reseed, prior one-shot ACL correction replay, foreign checkout/resource, protected capacity/permission/auth-surface edit, push/branch/PR/deployment or Root canonical state/sprint/report/aggregate write is authorized. No additional protected shared path beyond named current allocation: identify any actual required delta to the parent before writing. This latest explicit dispatch supersedes prior preparatory pending language only; intent kernel/tasks/ACs and all verification constraints remain intact.

Status: ready-for-dev
Blocking condition: none for preparatory specification amendment; current candidate remains unapproved and P3 open pending Root exact-head CI and distinct High validation. Implementation requires actual P3 approval and reconciled concrete ownership/resource allocation before overlapping writes.

HALT after planning. Baseline33c68c5aef5b75f96cf0ca5c086ebe911631db55 is the current coherent committed source checkpoint; HEAD/remote must remain there during this amendment. This is a companion/code-map amendment only. The exact original intent kernel and9tasks/8ACs are preserved; original76 planning/audit/validation/PASS artifacts are not overwritten. Current evidence is newly recorded under `_bmad-output/auto-bmad/preparation/story-15-2/post-integration-refresh-33c68c5a/` (reader, discovery, cache check, seven-point audit, preservation and validation). The unchanged original spec is archived there as spec-before-amendment.md. The planning-only context cache remains valid and byte-unchanged; no code facts are inserted into it.

Runtime for this amendment:0suites/0cases executed; no coverage claim, ATDD/scaffold, implementation, DB/browser/resource operation, app/test/schema/migration/dependency/.env/config/state/sprint/aggregate-report/Git-publication/hosted mutation. Existing local integrated verification and in-progress CI are prerequisite provenance only, not recurrence acceptance. Warnings: oversized. No broad code-review round consumed; distinct High amended-spec validation and Root approval remain pending. Current raw/kernel hashes and actual process-check results are in the new validation.json, not retroactively inserted into original receipts.

Current approved-kernel metadata: no15.2 approved kernel; canonical spec_approved=false and phases[0,1,2] remain Root-owned. The candidate kernel remains013b7ae0d0614d20dbc021885786ca1803976e10bd634ddc0bc3791b19de4ee1; preservation is checked against original bytes, not forced. Original15.1 approved kernel035ee9683e8b3e6e0420204a3ddfa8d81b0dcb6a47aa12e638673859d60cc234/history are unchanged. Root will reconcile CI39304828183 and independent review before P3 approval; ready-for-dev is not authorization to invoke implementation.

Completion hook: planning exit only under docs/process/review-order.md. Future implementation author writes one final Suggested Review Order after actual source/evidence; no completed implementation trail is manufactured here. Development complete remains distinct from release ready/deployment approval.


## Implementation Verification

Author Round1 bounded-fix refresh,2026-10-20. Approved original intent/kernel/tasks/ACs and Design Notes are unchanged. Eight accepted Round1 items are implemented in frozen source: stale preview/save metadata reload with retained draft and cleared admission; explicit following gesture composition; requested forward date versus nominal ownership; visible retained template assignee; protected historical-role retention; whole-successor lower lineage guard; actual production moved-pivot coverage; date-only all-day converter coverage. Conservative unknown per-option labels were rejected as nonconsequential, not expanded.

Current actual focused verification:42P0F0S using actual planner/TSX hook-action ports/additive Workspace+converter tests; lint0 and typecheck0. Original RED and intermediate failures remain preserved. The single successor production build GLKBSX62N9CbTViZM7YrP passed0 with public binding inspection and bundle containment0. Frozen433source inventory adef0cc8/canonical manifest c0aadd3c. Unit boundaries are synthetic and give no SQL/RLS/browser credit. Targeted review caught test-only Unicode binding corruption;15literal values across17lines were restored to exact raw-before text, preserving all new007-009 assertions. Original c76/206 and927packet remain immutable; current test hashes5e89/3dc and wrapper1a873f83/manifestd908 use the same GLK app build. Same targeted High follow-up passed0findings with82offline checks; no browser credit.

First-applied1800SHA24f remains permanently immutable. Forward220000SHA c55d1de1 changes only existing row helper/finalizer bodies for narrow protected-role retention and predecessor bounds. Root actual105 REAL020 RED1F/0P is preserved; reviewed forward106 is committed/verified, and same REAL020 GREEN1P0F reached all positive/negative assertions. Both first-applied migrations are permanently immutable. Root focused REAL021-022 passed2P0F; actual GLK007 stale recovery and008 native gesture cases passed;009 failed after a successful removal click while awaiting same-node uncheck. Only009 test binding now uses one click+explicit absence, with later persistence checks retained. Same targeted High009 follow-up passed42/42; strict009 now passed1P0F with all persistence assertions, while source checkpoint/current-head CI remain pending; no development-complete claim is made.

Prior local fullDB1824P/52S (RLS800P/14S subset), series unique4+1+1 and existing-host7+2 remain exact historical results. Four app dependencies changed in this batch; unchanged reader alone does not establish their current usability. OldTfRq107-artifact preservation544777c9 retains actual raw source/build/config/bootstrap/receipts. Matrix `build-intent-matrix.md` maps each approved behavior to actual execution and limits. Fresh reviewed-checkpoint exact-head CI/fullDB/RLS/empty replay/physical Storage/pilot, delivery gate and deferred release work remain explicit; author launched no services or fixtures.

## Suggested Review Order

Author: implementation/fix author. Refreshed against frozen Round1 twelve-path Unicode-current packet6666a3b1 (originalff996b68/Unicode46bb preserved) and build GLKBSX62N9CbTViZM7YrP; this guide is not approval.

### Following edits retain visible intent and refresh stale ownership

AC2/3/8 keep the explicit drag/resize/reassignment proposal separate from stored defaults, show effective retained assignees, and reload current source ownership/version after stale preview or save. Draft values survive; receipt, review, reason, selection and unsent command identity reset, while missing metadata fails closed instead of becoming create authority.

- `src/components/resources/BookingEditor.tsx:23` — `export function BookingEditor`: composes effective draft, admission and metadata recovery.
- `src/components/scheduling/SchedulingWorkspace.tsx:144` — `function edit(proposal: BookingProposal`: preserves explicit gesture fields separately.
- `src/features/resources/booking-editor-input.ts:24` — `export function followingBookingDraft`: combines stored defaults with explicit proposal only.
- `tests/unit/features/resources/booking-series-editor.test.ts:46` — `for(const origin of ["preview","save"]`: exercises actual TSX stale recovery through action ports.

### Nominal ownership and requested calendar dates stay distinct

AC1/4/5 honor forward requested starts and reject genuinely changed earlier coordinates. Approved Design Notes127 retains inherited scheduling anchors with unchanged or end-only changes from the nominal pivot; the editor independently rejects every entered pre-pivot date, including the ambiguous stored anchor. Date-only all-day controls pass through real conversion, validation and expansion across both DST transitions.

- `src/features/scheduling/recurrence.ts:38` — `export function expandRecurrence`: expands the complete finite local calendar.
- `src/server/bookings/series-conflicts.ts:55` — `export function planBookingSeries`: separates rule start, nominal cutoff and lineage bounds.
- `tests/unit/server/bookings/series-plan.test.ts:44` — `Round1 unchanged stored rule with pure field change`: guards original suffix/end compatibility in the actual planner.
- `tests/unit/features/resources/booking-editor-input.test.ts:124` — `Round1 date-only all-day converter`: checks literal spring/fall UTC boundaries through the actual caller.

### Forward SQL retains protected history without expanding assignment authority

The first-applied1800 migration is immutable. Forward220000 narrowly allows an unchanged existing protected work-role reference and enforces predecessor lower bounds on requested/effective rules plus every complete row; existing protected-payload equality, auth, locks, proof domains, replay, outcomes and audit remain intact. AC4/5/6 require qualified106 evidence: REAL020 GREEN1P now proves both retention and denial, and021/022 passed2P0F;105 RED stays a failure.

- `supabase/migrations/20261019220000_booking_series_integrity_followup.sql:2` — `create or replace function public.booking_series_row_internal`: retains only existing protected historical role references.
- `supabase/migrations/20261019220000_booking_series_integrity_followup.sql:103` — `if source.predecessor_id is not null`: rejects requested-rule or complete-row lower-bound bypasses.
- `tests/integration/commands/booking-series.int.test.ts:1066` — `15.2-INT-REAL-020`: pairs protected retention with inactive-new-assignment denial.
- `tests/integration/commands/booking-series.int.test.ts:1089` — `15.2-INT-REAL-021`: tests real JWT signed-overlay denial and zero durable delta.

### One current-facts transaction still owns conflicts and replay

AC3/6/7 continue using the sole detector over the complete proposed overlay and one current-authority tenant gate. Separate proof/review domains, group completeness and atomic selected acceptance/outcome/audit are preserved; historical actual audit-failure rollback remains relevant to unchanged transaction stages, with fresh exact-head CI still required.

- `src/server/bookings/series-attestation.ts:5` — `export const SERIES_ATTESTATION_DOMAIN`: separates batch proof authority.
- `src/server/bookings/series-conflicts.ts:111` — `export function deriveSeriesConflicts`: derives whole-overlay associations through the sole detector.
- `supabase/migrations/20261019180000_recurring_booking_series.sql:151` — `create function public.finalize_booking_series`: preserves the immutable first-applied transaction baseline.
- `tests/integration/commands/booking-series.int.test.ts:847` — `15.2-INT-REAL-007`: proves last-stage failure rolls back all durable collections.

### Match essential host proof to actual execution and unchanged dependencies

Public occurrence metadata remains behind existing RLS; no template/outcome grants change. New real-host cases exercise changed stale recovery, native drag/resize following proposals and retained-assignee removal. Actual GLK007/008 plus strict009 prove all changed flows;009 uses one native click and explicit disappearance because the effective fallback control intentionally detaches after deselection. Historical genuine response-loss/phone/role receipts remain scoped history; Root qualified every mutable lane.

- `src/features/resources/bookings-read.ts:17` — `const BOOKING_COLUMNS`: projects existing safe occurrence metadata without private outcomes.
- `tests/e2e/booking-series.e2e.spec.ts:410` — `15.2-E2E-007`: asserts fresh stale recovery, invalidated review and explicit retry.
- `tests/e2e/booking-series.e2e.spec.ts:431` — `15.2-E2E-008`: uses native resource drag/resize and independent persisted facts.
- `tests/e2e/booking-series.e2e.spec.ts:452` — `15.2-E2E-009`: asserts effective inactive assignee visibility and durable removal.

Evidence: `_bmad-output/test-artifacts/story15-2/build-intent-matrix.md` maps all seven AC/invariant rows to actual receipts. Current42P is unit-only; static/build/public/bundle0.105 REAL020 RED1F and106 integrity1+2P remain separate runs; GLK essential2+1P are actual passes, not one3-pass command.

Limits: GLK changed essential cases passed2+1 across preserved commands; original009 pre-save failure remains failed. Fresh reviewed-checkpoint exact-head CI/physical Storage/pilot and delivery reconciliation remain required. No combined current full-suite result is invented. Historical37command/14RLS scaffolds and physical Storage skip are no coverage. Synthetic action ports do not prove auth, RLS or browser interaction; exhaustive visual/device/manual and representative scheduling performance remain deferred with named owners/next actions. No development-done or release-ready claim is made.

### Review Findings

**Round 1 of 3**

Configured Round1 completed:8accepted patches addressed (4high/4medium; medium score12; followup true),1nonconsequential reject,0intent gap/bad spec/defer. Same High targeted source/binding/Unicode/009 follow-ups passed. Dated canonical Review Triage Log above maps each fix to actual evidence. Source checkpoint and exact-head CI remain pending; development-done is not claimed.
