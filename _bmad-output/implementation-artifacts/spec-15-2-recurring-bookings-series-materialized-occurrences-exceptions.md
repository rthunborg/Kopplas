---
title: '15.2 — Recurring Bookings — Series, Materialized Occurrences, Exceptions'
type: feature
created: '2026-10-19'
status: done
review_loop_iteration: 0
followup_review_recommended: false
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
- Source checkpointeffbf5e1 and exact-head run39335595653 all5required jobs now PASS, independently qualifiedd5b0. Root deliverygate/narrowprovenance/status admission remain pending; no development-complete/done or release-ready claim.

### 2026-10-20 — Review pass

Round 2 of 3 follow-up review.

- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 2, medium 1, low 0)
- defer: 0
- reject: 2: (high 0, medium 0, low 2)
- dismissed: none
- addressed_findings:
  - `[high]` `[patch]` R2-01 ready preview admitted a complete plan above the SQL3MiB limit. Exact compact UTF8 serialization now gates ready/finalization with a fixed safe recovery message; actual planner/preview and exact/+1/multibyte boundary tests pass.
  - `[high]` `[patch]` R2-03 shortening after role archival rejected a newly cancelled historical slot. New107 replaces only the existing helper cancellation predicate, preserving same tenant/occurrence/original role. Native REAL023 retention/replay/new-ID/changed-role checks passed in exacta515/run39342433474.
  - `[medium]` `[patch]` R2-04 a concurrent split between metadata reads could cache mismatched ownership and repeatedly deny explicit retry. Following retry now reloads current metadata through unchanged recovery, preserving draft and pending/unknown guards; actual TSX action-port regression passes.
- Follow-up recommendation: true (high2/medium1/low0; weighted medium/low score3). Broad rounds2/3; nonconvergence counter0 is separate.
- All six configured independent layers completed before triage. Initial parallel CLI hook refusals provided no review credit; native batches plus one serial prescribed external retry supplied real reports. Final CMD TYPE failure is separate from the external872-byte report.
- Distinct High fix review caught the initial R2-02 use of a superseded4000-ID guard before runtime. Effective20261007131222 removes that limit; uncommitted cap removed and actual100-person/long-ID preview/public-input regression passed. Original RED18total15P3F includes only two confirmed defect failures and one rejected wrong-expectation failure, no false coverage credit. Current20P0F0S; full nonincremental TSC and scoped ESLint native0. High correction/helper and compact-TEXT boundary qualification PASS, no new broad round.
- Current evidence: `_bmad-output/test-artifacts/story15-2/build-round2-author-verification.json`. Exacta515/run39342433474 all5requiredjobsPASS, independentHighnativequalification02aa7862 confirms revisedRLS005/newREAL023 actualbodyexecution plus fullDB-RLS/directStorage/empty107/build. Root gate/final provenance passed and explicit status admission authorizes development done only.

### 2026-10-20 — Review pass

Round 3 of 3 final configured review.

- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 2, low 0)
- defer: 0
- reject: 3: (high 0, medium 0, low 3)
- dismissed: none
- addressed_findings:
  - `[medium]` `[patch]` R3-01 submitted-count expansion preceded effective suffix/original-end normalization. Update input keeps structural/count/calendar/transport admission, then the current signed-source planner expands the effective rule. Actual public preview plus save command/envelope regression admits the March26-28 description-only following edit; a genuinely invalid effective DST suffix denies before finalization and names its failing local date in the existing Swedish recovery message.
  - `[medium]` `[patch]` R3-02 unused archived default-role check preceded effective protected rows. Public preview now checks references after planning and before receipt issuance: same-tenant role existence, same occurrence/original role retention, signed unchanged unused defaults, and all other template/row reference relationships remain mandatory. New inactive/cancelled assignment, substitution, foreign role/customer and missing signed-default proofs deny. Standalone helper and SQL105/106/107 unchanged.
- Rejected R3-03/R3-04: metadata recovery cosmetics/error wording retain usable recovery and no persistence/auth bypass. Rejected R3-05: strongest headless reading is a descriptive architectural/test-surface distinction without a concrete customer defect. No cosmetic fix or redesign added.
- Follow-up recommendation: true (high0/medium2/low0; weighted medium/low score6). All3/3 broad rounds completed; nonconvergence counter0 is separate. No fourth broad review.
- All six configured context-free reports completed before triage. Original external Temp-input denial/native0 is not review credit. Root authorized same-byte owned-workspace input recovery; exactly one serial unchanged-model/High/read-only/argument retry returned the real report native0/e1c84f6809e4e902ff1992f9de5023804c3f391c4a920fb3a85e903e461a30e6. External suffix candidate deduplicated with R3-01.
- Initial focused32P0F0S; corrected-fixture RED22total20P2F demonstrates the two defects. First wrong-fixture RED22total13P9F omitted server-derived roles and has no defect/coverage credit. Both original logs retained. Full nonincremental TSC and scoped ESLint native0. Tests execute real public actions/envelope/planner/receipts and actual TSX ports with synthetic auth/cookie-RLS/RPC boundaries; no SQL/browser execution claimed.
- Current author record: `_bmad-output/test-artifacts/story15-2/build-round3-author-verification.json`. Final sourcea00dd595d96a73c398328ed1778bac334aca9de6/run39348312783 all5requiredjobsSUCCESS independently qualified2082dd02; all11identitybindings/45namedfocuscases/nativeRLS005+REAL023/fullDB-RLS/directStorage/empty107 proof. Browser normalCI has10firstpasses+1FLAKY/12attempts1retry/0finalfail/skips/globalerrors, disclosed with failed firstattempt laterassertions unreached and complete successful retry. Root deliverygatefa55 native0 and independent frozen-record provenance17505c8a PASS plus explicit Rootadmission3c5183f5 now authorize status-only development DONE; release approval remains separate. Threeof433 production paths changed versus historicala515; source/build/test/schema unchanged from finaltesteda00 through metadataHEAD308dfa3a. Historical admitted570d remains byte-identically archived.
- Targeted R3-01 correction: initial sourceHigh7a2916 PASS preceded a narrow intermediate-trail53b033 review confirming that effective DST failure lost its affected-date message. The planner now carries effective expanded.localDate into CommandError.userMessage; actual public preview asserts2026-03-29. Focused new diagnostic RED1F then final32P0F0S, TSC/lintnative0; same triage2patch/3reject and no additional broad round. Initial Root source-only checkpoint3c871f2ff2306624e1fc8191aa378eb1d7bcd4ef/run39346496291 is obsolete for the correction; one cancellation request acknowledgednative0, shutdown/completion not inferred and no final coverage credit. Final successor exactCI/review/gate/provenance remain pending.

- Targeted R3-02 completeness: original reference-identity predicate still denied mixed protected history plus a newly cancelled historical tombstone. Actual public-action matrix RED9total8P1F0S isolated that same accepted finding after input/planning/tenant-role lookup succeeded; no fixture failure. Root exactallocation and independentHigh proposalPASSf86ca7 preceded production edit. Direct templateApplied predicate now uses trusted planner non-exception rows and requires every retained row ID in signed source facts. Thirteen actual-action cases cover all-protected/mixed-new-tombstone/following ordinary-prefix/whole-shortening positives plus inactive ordinary/new/cancelled template use, substituted/foreign defaults/roles/customer and missing signed defaults negatives. Final combined45P0F0S/TSC-fullnonincremental/scopedlintnative0, not additive with earlier32. IndependentHigh actual-diff/trailPASS9d22c98c and exacta00CIqualification2082dd02 now pass, including all45nativeTAP names; no13successful-public-mutations claim. Root gate/newfrozenprovenance passed with explicit status-only admission. Canonical2medium patches/3low rejects/score6TRUE/broad3of3/nonconvergence0 unchanged; no extra broad pass or patch.


### Historical preparation triage record (preserved)

No implementation/code review has run. Parent-owned independent specification validation is required before approval/build; no broad review round is consumed by this plan.

### 2026-10-25 — Review pass (TARGETED post-cap P7 terminal closure/reuse)
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Independent gpt-6.1-sol High `/root/combined_epic15_closeout_high` executed the allocated latest-fix/remaining-serious-finding lane under AGENTS post-cap rules and October19 unchanged-review reuse. R3-01 correction7fbb279a and R3-02 implemented9d22c98c remain closed; completed25changed/28unchanged map and booking-editor-test seam23886158 are reused. The one identified uncovered dependency question was the later composed editor effective-flow bridge: exact BookingEditor/BookingEntry/action-state interval inspected; bounded historical series create/occurrence cancellation/exact retry/phone evidence reuse is supported, with current real command/RLS and common-series browser overlap. No new consequential defect, patch or scope gap found. Actual triage and reasoning: `_bmad-output/auto-bmad/preparation/epic-15/inherited-15-2-targeted-post-cap-p7-result.json`. This is one targeted follow-up after broad3/3, not a fourth broad round. Historical Round3 two medium patches/score6/TRUE remain unchanged below/above as recorded history; framework loop0 remains0. Root owns honest followup_passes2→3 bookkeeping.

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

Status: done
Blocking condition: none

Current Round3 exact-source evidence qualified: sourcea00dd595d96a73c398328ed1778bac334aca9de6/run39348312783 attempt1/release_validationfalse/all5requiredjobsSUCCESS,11identitychecksPASS. Actual3004unitP0F0S/43processP0F0S; all45focused namesTAPOK (13matrix+32related, nonadditive), fullDB1828P0F52explicitS with23active15.2commands, includedRLS800P14S neveradditive, isolatedphysicalStorage1P2objects66bytes,107firstreplay/seed in3jobs. NativeREAL023/RLS005PASSED and current required1/bodyreach qualification retained.

Auth/Jobs normalbrowserCI:10firstattemptpasses+1FLAKY case/12attempts1retry/0finalfail/skips/globalerrors. Jobs16.1-E03 firstattempt response.text/CDP Network.getResponseBody failed before PREVIEW_STALE expectation and laterassertions, which receive no firstattempt credit. Existing unchanged CIretry1 passed its complete awaited body321-354, including stale/snapshot/UIretry/exact durablebooking-assignee-conflicts/oneaudit/reload assertions. No observed productassertion mismatch, underlyingcause inference or waiver. This ordinarysmoke is separate from scoped historical Scheduling/series essentials and current syntheticport proof.

Two medium patches/three low rejects/0intent_gap-bad_spec-defer; score6/followupTRUE/broad3of3/nonconvergence0. Allsixconfiguredlayers precededtriage; current implementedHigh9d22PASS and narrowCIqualification2082dd02 qualify actualfinalsource. WrongfixtureRED/correctedRED/dateddiagnosticRED/mixedtombstoneRED, initialsourcePASS-qualified-by-lateHOLD, cancelled3cCI and historicalc533SUCCESS remain attributed separately. Sourceinventorye6aae211 unchanged through metadataHEAD308dfa3a; no current308build claimed.105/106/107raw/GitLFidentities preserved. Finalpilot read18.046681ms/CPU4.864174ms/2RLSrequests perread only narrowAdminusersprojection. Root gate/separate frozen-delivery provenance passed; explicit status-only admission authorizes development DONE only. Three owned release defers persist/release_readyfalse; no merge/release/deployment approval.

Status-only final admission —2026-10-20: Root mandatorydeliverygate native0/PASS, development_complete=true/errors[]/approval_granted=false on exactdeliverya40a8ec4a3b78e63809d99f18f34b0648f1e708aa4ba472e17792699db3a7048 (receiptfa55cb7b297c4819e65fc2d9ac57b47652e2cd3fd8066186252f4946c2f03cc1). New independentHigh frozen-recordprovenance PASS/no consequentialgaps `.env.epic15.mail-runtime/story-15-2-ci-a00dd595-independent/delivery-provenance-a00-final.md` SHA17505c8a5fdaa884c66fe7a16e01f2c388155114dc28090431e33a33380c6be7; JSON061f1b2d0e958ed494f30f6755adb697a6a6f0b6bf4b7a94c237b914b02deb3d; manifeste9afd65edfd72f20ed7906f93572a64df6819a8f809409bcdefbc94aa0a11685. Explicit Rootstatusadmission3c5183f51c6db90d5ed98e4cef08d3ec392c9e41e9e9ce5215bedd197faeda6b permits this spec-only closure. Deliverya40 and bound authorrecord85b2f65cf0c6e3f8fa2d28ab43b40bc1e3113a9d53f37182136c2fceb49a82ca remain byte-identical; their pending-gate wording records the earlier frozen point, superseded by these actual receipts. Sourceinventorye6aae211 and exacttesteda00 remain unchanged. No new source/test/schema/runtime/review/Git/state/sprint/ledger action; primaryBuildAuto owns normal metadata-only commit. FollowupTRUE/score6/broad3of3/nonconvergence0, oneSRO26refs, oversized warning/three release defers/release_readyfalse and disclosed browserflake persist. No merge/release/deployment approval.

### Historical Round2 admitted delivery — preserved, superseded for changed dependencies

Status: done
Blocking condition: none

Current Round2 exact-source evidence qualified — sourcea51531888252189a3cc98798b5e8e315f0348fb0, run39342433474 attempt1/release_validationfalse, all5requiredjobsSUCCESS and independent11ownershipchecksPASS. Actual2979unitP/43processP/fullDB1828P52S/RLS800P14S INCLUDEDsubset/directStorage1P2objects66bytes/empty107firstreplay in3jobs/AuthJobs11P0Sflakyretryerror. NativeREAL023PASSED covers3to2active replacement/historicalcancelledidentity+projectedpayload/replay/bothinactive-roledenials withfullsnapshots throughcheckedcommand/RPC. RevisedRLS005PASSED freshpreviewTENANT_ACCESS_DENIED+fullsnapshot, separatelyfromnarrowerstalereceiptdenial. Currentpilot read11.084037ms/CPU3.847585ms/2RLSreadrequests is narrowAdminusersprojection only. QualificationJSON02aa7862/manifest1850406c and exactnativebodyproof in authorverification/currentdelivery.

Threepatches(2high1medium),2rejects,0intent_gap/bad_spec/defer; followupTRUE/broad2of3/nonconvergence0. Current20focusedP/staticnative0 and Highsource/helper/correction/boundary/trailPASS. Source7hashes remainfrozen;105/106immutable,107 dualrawCRLF/GitLFnormalizedequal only. Rootaccepted composed essentialUIreuse+actualcurrentTSX DENIED-retry proof; nofreshDENIEDbrowser/matrix claim. Concrete frozen delivery570d0c7442c4e902b4564b85a55e77b9928042fd98ac4229a3503c82bede3e06 passed Root mandatorygate and independent narrow provenance; explicit Root admission now authorizes development done only. Threeownerreleasedefers persist/release_readyfalse; nodeployment/mergeapproval.

### Historical P5 completed delivery — preserved, superseded for changed dependencies

Status: done
Blocking condition: none

Current P5 evidence result —2026-10-20: reviewed source checkpoint effbf5e18e19556d0fad231d3fc01369397c8402; exact run39335595653 attempt1 release_validation=false completedSUCCESS. All applicable required jobs checkpoint-admission,verify,db,recovery-storage-loader,e2e passed; independentHigh qualificationd5b0b28924ff7d830b670e78bc6fc1f59e5229a65da62f92fa3a827376be0f9b verifies11ownership/provenance bindings and native result artifacts.52source/test/schema local hashes remain unchanged; this refresh edits evidence metadata only.

- Review result: all8Round1 patches addressed(4high/4medium;mediumscore12;followuptrue),1nonconsequential reject,0intent_gap/bad_spec/defer. Repair-loop0 is separate from broadRound1of3. SameHigh source/Unicode/009 follow-ups passed; no new broadround.
- Current CI actuals:2974unitP0S; process2+26+10+5=43P0S; fullDB1827P0F52S; all22active15.2commands and5active15.2RLS passed. RLS800P14S is INCLUDED subset, not additive.52skips=37commandscaffolds+14RLSscaffolds+1physicalStorageoutside its isolated lane; no skip credit.
- Separate current physicalStorage:1P0S,2loader objects/66bytes, protected logical-row/byte readback and generic+quotePDF overwrite denial. Empty first-attempt106migration+seed replay passed in db,e2e,recovery-storage-loader schema source, no CLI recovery attempts.
- Browser scope: ordinaryCI Auth7+Jobs4=11P0S/flaky/retry/globalerrors does not execute Scheduling/series. Actual guarded local GLK changed essentials007/0082P then0091P and earlier reviewed unchanged-path flows remain scoped separate evidence; original failed receipts retained. No source/test/config/migration changed after tested checkpoint.
- Configured pilot:25measurements/5warmups,120/24tenant projection; readp9514.010ms<=250,synthetic permissionsCPU5.946ms<=25,2RLSrequests/read<=3. Native log/immutable contract proof only; fullprivate baseline/queryplanJSON notuploaded. No representative Scheduling/production release-performance credit.
- Migration provenance:1800 local/Git24f rawidentical.106 frozen localc55 uses176CRLF; CI/GitLF57e7e9fc930513099b20759b84fd21c2b851f154effb8a0e45c198262da4a37d is normalized-identical only. Both first-applied migrations remain immutable; no file rewritten.
- Delivery evidence_revision=effbf5e18e19556d0fad231d3fc01369397c8402; all applicable development evidence checks passed with limitations in current matrix/delivery. Root mandatory gate native0/oktrue/development_completetrue/approval_grantedfalse and independent High frozen-record provenance PASS now precede explicit final status admission. Spec status isdone for development only.
- Release validation:3owned deferred items remain separate from0frontmatter deferred findings. Optional dashboard/probe jobs SKIPPED give no coverage. release_ready=false; no release/merge/deployment approval or provider/resource action.

### Historical preparation and dispatch record (preserved; old status superseded)

Current implementation dispatch —2026-10-19: Root approved P3 after independent High amended-spec validation and exact-head integration CI39304828183 passed all five required jobs. P4 ATDD completed at current implementation baseline 85755eb7cea3affdc77dbe1d30bb18279b614c5a. Root expressly authorizes implementation of this approved candidate, independent review and required verification now; earlier unapproved/planning-halt/pending-CI prose below is historical and does not reimpose those released gates. The narrow Coordinator allocation in current ownership companion stands. Read the canonical ATDD checklist _bmad-output/test-artifacts/atdd-checklist-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md and its actual adapter contracts;110 skipped scaffolds are not coverage. Preserve their original receipts and activate meaningful real-path checks. Ask the parent Build Auto delegate for concrete DB/browser runtime qualification before mutable verification; old Root resource IDs are stopped and must not be reused. No unguarded service launch, reset/reseed, prior one-shot ACL correction replay, foreign checkout/resource, protected capacity/permission/auth-surface edit, push/branch/PR/deployment or Root canonical state/sprint/report/aggregate write is authorized. No additional protected shared path beyond named current allocation: identify any actual required delta to the parent before writing. This latest explicit dispatch supersedes prior preparatory pending language only; intent kernel/tasks/ACs and all verification constraints remain intact.

Status: ready-for-dev
Historical blocking condition: none for preparatory specification amendment; current candidate remains unapproved and P3 open pending Root exact-head CI and distinct High validation. Implementation requires actual P3 approval and reconciled concrete ownership/resource allocation before overlapping writes.

HALT after planning. Baseline33c68c5aef5b75f96cf0ca5c086ebe911631db55 is the current coherent committed source checkpoint; HEAD/remote must remain there during this amendment. This is a companion/code-map amendment only. The exact original intent kernel and9tasks/8ACs are preserved; original76 planning/audit/validation/PASS artifacts are not overwritten. Current evidence is newly recorded under `_bmad-output/auto-bmad/preparation/story-15-2/post-integration-refresh-33c68c5a/` (reader, discovery, cache check, seven-point audit, preservation and validation). The unchanged original spec is archived there as spec-before-amendment.md. The planning-only context cache remains valid and byte-unchanged; no code facts are inserted into it.

Runtime for this amendment:0suites/0cases executed; no coverage claim, ATDD/scaffold, implementation, DB/browser/resource operation, app/test/schema/migration/dependency/.env/config/state/sprint/aggregate-report/Git-publication/hosted mutation. Existing local integrated verification and in-progress CI are prerequisite provenance only, not recurrence acceptance. Warnings: oversized. No broad code-review round consumed; distinct High amended-spec validation and Root approval remain pending. Current raw/kernel hashes and actual process-check results are in the new validation.json, not retroactively inserted into original receipts.

Current approved-kernel metadata: no15.2 approved kernel; canonical spec_approved=false and phases[0,1,2] remain Root-owned. The candidate kernel remains013b7ae0d0614d20dbc021885786ca1803976e10bd634ddc0bc3791b19de4ee1; preservation is checked against original bytes, not forced. Original15.1 approved kernel035ee9683e8b3e6e0420204a3ddfa8d81b0dcb6a47aa12e638673859d60cc234/history are unchanged. Root will reconcile CI39304828183 and independent review before P3 approval; ready-for-dev is not authorization to invoke implementation.

Completion hook: planning exit only under docs/process/review-order.md. Future implementation author writes one final Suggested Review Order after actual source/evidence; no completed implementation trail is manufactured here. Development complete remains distinct from release ready/deployment approval.


### 2026-10-25 — TARGETED post-cap terminal result

Status: done. Actual independent High targeted P7/reuse verdict PASS;0new high/medium/low patches, score0 and followup_review_recommended=false under unchanged step04 computation. No product/source/test/contract change. Historical broad3/3, prior followups2 and Round3score6TRUE remain history; this actual targeted follow-up earns the new terminal recommendation, not CI or metadata alone. Framework review_loop_iteration0 is preserved. No intent_gap/bad_spec/defer/reject. Current source actually tested is b57de61075646820ce9cb5feff7fd054fd2f8320/run40192543175; Root bridge to metadatahead4ed86264 is Git-byte equality outside_bmad-output, not later-head execution.45exact focused/23REALcommand/5REALRLS/7SSR pass;51scaffolds0coverage. Current15.3-E2E002 common-series protected-row/split and003standalonephone/keyboardretry pass retry0; historical15.2 browser receipts retain bounded effective-flow reuse, never current execution labels. Old a40delivery retained byte-exact in preparation/epic-15/inherited-15-2-historical-delivery-a40a8ec4.json. Three release deferrals and release_readyfalse remain. Root delivery_gate/admission and final fresh-chat PR review/current-head CI are separate pending gates; no deployment/merge approval.

## Implementation Verification

Current Round3 qualified exacta00 evidence —2026-10-20: independentHigh report `.env.epic15.mail-runtime/story-15-2-ci-a00dd595-independent/qualification-final.md` SHAabdf275966b5338f4bd631d720cd4648e646acea6b2c601efe5b1c52e09d5b7c, JSON2082dd02bb9e844e221e4f8954bed3a04dc6be6fbeba7db4a52700bc6174d930 and manifestcb44b2be2b2b87c07b586ddb562f7f018e605ac84941754394bec8e71a067b4d bind run39348312783/sourcea00. All5requiredjobs/11identitybindings pass;3004units/43process/fullDB1828P52S/RLS800P14S included/directStorage1P/empty107/all45namedfocuscases and requestedREAL023+RLS005 actualbodyreach qualified. Skips/optionaljobs supply no coverage.

One normalretry browserflake remains disclosed:10firstpasses+1flaky/12attempts1retry,0finalfail/skips/globalerrors. FirstE03attempt fails at response.text before PREVIEW_STALE/laterassertions; unchanged normalretry1 completes actualawaited321-354body. Narrowqualificationfc130dae8244293c04f8f3a0baec2512880badea52a7b1a1e46b4a1a37f137b3 checks unchanged E03/Editor/standaloneactions/retryconfig againstc533, with recurrence disabled and changedseriesbranch unselected. No productassertion mismatch observed, no underlyingcause or waiver claim; originalfailedattempt retained.

Currentpilot25measurements/5warmups/120+24memberships: read18.046681ms<=250,permissionsCPU4.864174ms<=25,2RLSrequests/read<=3. NarrowlocalAdminusersread/CPU only, fullprivatebaseline/queryplanJSON notuploaded; representativeScheduling/releaseperformance remains deferred. Scoped GLK essentials and actual TSX/public-action syntheticport proof remain separate, with explicit source dependency rationale. Current source/build/test/schema conserved from testeda00 through metadataHEAD308dfa3a; no separate metadataHEADbuild. One SRO26validrefs, canonical2medium patches/3low rejects/score6TRUE/broad3of3/nonconvergence0. Rootdeliverygate and separate frozen-record provenance now passed with explicit status-only admission; specDONE for development only. Frozen pending wording remains historical, with unchanged a40delivery/85bauthorrecord.

### Historical Round2 qualified evidence and admission — preserved

Historical Round2: independentHigh exacta515/run39342433474 qualificationPASS (JSON02aa78628d14b33ea740a466b88be36899b5b01aef05ba024a618abd1f565d3b). Actual2979unitP0S,43processP0S,fullDB1828P0F52S with23active15.2commands; RLS800P14S included/nonadditive. NativeREAL023 and revisedRLS005 passed their complete sequentialawaitedbodies under SUPABASE_TEST_REQUIRED=1; no perassertioninstrumentation or isolatedrawSQLproofclaimed. DirectphysicalStorage1P2objects66bytes separatefromfullDBskip; empty107migration/seed replay firstattempt inall3jobs. AuthJobs11P0F0S/flaky/retry/error is separateproduction-smoke proof. Currentpilot25measurements/5warmups read11.084037ms/CPU3.847585ms/2RLSrequests perread only narrowAdminusersprojection.

Allsource7hashes unchanged from reviewed/testeda515; exactdualraw/Git migrationidentities retained. CurrentactualTSXDENIEDretry plus priorGLK007 unchangedrecovery/control composition supports owner-acceptedessentialreuse, nofreshbrowserclaim. Authorverification/currentdelivery retain nativeartifact/reporthashes,3releasedefers and release_readyfalse. Root mandatorygate and independent frozen-recordprovenance passed; explicit Root status admission authorizes development done only.

Admitted Round2 status closure — 2026-10-20: Root delivery_gate native0/PASS, development_complete=true and approval_granted=false on unchanged frozen record570d0c7442c4e902b4564b85a55e77b9928042fd98ac4229a3503c82bede3e06. Independent High frozen-record provenance PASS `.env.epic15.mail-runtime/story-15-2-ci-a5153188-independent/delivery-provenance-a515-final.md` SHA801253f2e8728fc32146699f1ecb940da54539ab1f15d2bc81932216ef4fe971; JSONbed36e1ae522fa0e8cd7d1e08adeb0a30a48a3fe06da90aea4e890456a608c3d. Explicit Root admission authorizes this status-only done/finalization. Source remains the exact tested a51531888252189a3cc98798b5e8e315f0348fb0; current delivery and author-verification bytes remain the immutable pre-admission freeze, whose pending-gate wording records that earlier point in time. No new tests, source, runtime or review round in closure. FollowupTRUE/broad2of3/nonconvergence0, three release defers and release_ready=false persist. No merge, release or deployment approval.

### Historical P5 verification and admission — preserved

Author final evidence refresh,2026-10-20. Approved kernel013b7ae0d0614d20dbc021885786ca1803976e10bd634ddc0bc3791b19de4ee1, original9tasks/8AC/sourceACsketch/DesignNotes remain unchanged. All8accepted Round1 patches are addressed and independently reviewed; canonical repair-loop0/broadRound1of3/followuptrue remain distinct. Source52 hashes match reviewed checkpoint effbf5e18e19556d0fad231d3fc01369397c8402; only evidence metadata changes in this refresh. Original pending record/index and raw review/CI reports were preserved before refresh.

ExactCI39335595653 attempt1/release_validationfalse completedSUCCESS: checkpoint-admission,verify,db,recovery-storage-loader,e2e allpassed. Actual2974unitP0S;43processP0S; fullDB1827P0F52S with all22active15.2command cases; RLS800P14S is nonadditive subset. Separate physicalStorage1P0S proves2physicalobjects/66bytes plus protectedrows/bytes and overwrite denial. First-attempt empty106migration/seed replay passed in all three database-bearing lanes. OrdinaryAuth/Jobs11P0S/flaky/retry/globalerrors is separate from Scheduling/series proof. Configuredpilot25measurements/5warmups readp9514.010ms<=250/permissionsCPU5.946ms<=25/2requests<=3 passed; only narrow120/24membership projection/CPU log evidence, not fullprivatequeryplan or representative Scheduling load.

Guarded local changed essential GLK007/0082P then0091P completed all admission/gesture/assignment/persistence assertions; sameHigh source/Unicode82check/00942check follow-ups and unchanged-dependency proof qualify scoped reuse. Earlier response-loss/phone/ContractD/role receipts remain separately attributed. Original105RED and2P1F browser failure remain failed, never relabeled. Local42port/synthetic-fact tests are unit-only; currentCI fullunits include actual current source.52explicit DB skips and optional release/probe jobs are no coverage.

Both first-applied migrations immutable:1800 rawlocal/Git24f;106 local176CRLFc55 versus immutableCI/GitLF57e7e9fc930513099b20759b84fd21c2b851f154effb8a0e45c198262da4a37d, normalized-identical only. No migration/code/test/config/runtime/Git action in this metadata refresh. Matrix/handoff/verification/delivery carry exact receipts and limits. Delivery evidence_revision is the actual tested checkpoint and all applicable development evidence checks are passed; Root mandatorygate and narrowprovenance PASS plus explicit status admission now establish development done. Three owned release defers remain; release_ready=false and no deployment/merge approval.

Admitted status closure,2026-10-20: Root gate native0/oktrue/development_completetrue/approval_grantedfalse; independent High frozen delivery provenance PASS `.env.epic15.mail-runtime/story-15-2-ci-effbf5e1-independent/delivery-provenance-final.md` SHAb88fc40faef8e3e3adc91538aa8b2589fa6cbdef1db9e0e764d5d0fd88d5755c, JSONb3abb4f0b52a4161e543d5f0c23b08f2f030fa4bbb0a41e564904a59d9682b56. Explicit Root admission authorizes statusdone; deliveryc1d63ea5 stays byte-identical. This status-only reconciliation adds no tests/runtime/review round and grants no release/merge/deployment approval. Root P7 ledger harvest remains separately pending.

## Suggested Review Order

Author: existing implementation/fix and verification delegate. Final Round3 sourcea00dd595d96a73c398328ed1778bac334aca9de6 is qualified by implementedHigh9d22PASS and exactCI39348312783/2082dd02PASS, with one disclosed normalbrowserretry. Current45focused cases are nativeTAPOK within3004unitpasses. Source/build/test/schema unchanged through metadataHEAD308dfa3a; Root deliverygatefa55 and new frozen-record provenance17505c8a passed; explicit Rootstatusadmission3c5183f5 permits developmentDONE only. Frozen a40delivery/85bauthorrecord remain unchanged; prior source/failed/intermediate receipts remain scoped history.

### Following edits retain visible intent and refresh stale ownership

AC2/3/8 keep the explicit drag/resize/reassignment proposal separate from stored defaults, show effective retained assignees, and reload current source ownership/version after stale preview or save. Draft values survive; receipt, review, reason, selection and unsent command identity reset, while missing metadata fails closed instead of becoming create authority.

- `src/components/resources/BookingEditor.tsx:26` — `export function BookingEditor`: composes effective draft, admission and metadata recovery.
- `src/components/scheduling/SchedulingWorkspace.tsx:144` — `function edit(proposal: BookingProposal`: preserves explicit gesture fields separately.
- `src/features/resources/booking-editor-input.ts:24` — `export function followingBookingDraft`: combines stored defaults with explicit proposal only.
- `tests/unit/features/resources/booking-series-editor.test.ts:48` — `for(const origin of ["preview","save"]`: exercises actual TSX stale recovery through action ports.

Round2 explicit following retry also reloads current ownership after generic denial, preserving draft and pending/unknown protection. Actual TSX action-port proof covers this routing; unchanged recovery/rendering has scoped prior GLK007 evidence.

- `src/components/resources/BookingEditor.tsx:135` — `function retryPreview()`: reloads metadata on explicit following retry.
- `tests/unit/features/resources/booking-series-editor.test.ts:79` — `Round2 explicit following preview retry`: proves denied retry preserves draft and uses current ownership.

### Nominal ownership and requested calendar dates stay distinct

AC1/4/5 honor forward requested starts and reject genuinely changed earlier coordinates. Approved Design Notes127 retains inherited scheduling anchors with unchanged or end-only changes from the nominal pivot; the editor independently rejects every entered pre-pivot date, including the ambiguous stored anchor. Date-only all-day controls retain historical converter coverage across both DST transitions. Round3 update input validates shape and admission caps before snapshot acquisition, while only the effective normalized suffix is expanded for date validity. This preserves a valid March28 following edit whose unchanged submitted count would otherwise include March29 DST. A truly invalid effective expansion carries its own localDate into the existing Swedish recovery message; the public action negative asserts2026-03-29, without premature submitted-count expansion.

- `src/features/resources/booking-series-actions.ts:62` — `export async function previewBookingSeriesAction`: checks public manager admission before signed planning.
- `src/server/bookings/series-conflicts.ts:55` — `export function planBookingSeries`: separates rule start, nominal cutoff and lineage bounds.
- `tests/unit/server/bookings/series-plan.test.ts:216` — `Round3 public preview and save envelope`: proves effective suffix admission through public preview and save.
- `tests/unit/server/bookings/series-plan.test.ts:222` — `Round3 effective DST failure`: checks effective-date recovery and blocks preview/save finalization.

### Effective references and forward SQL preserve historical assignment authority

Round3 public preview checks the effective plan before issuing a receipt. An unused archived default must match signed source defaults; each retained row must match its original occurrence and role under SQL107. Trusted planner non-exception rows directly identify template use, including cancelled ordinary/new slots; protected/omitted historical exceptions require signed source IDs. This admits a newly copied historical tombstone while keeping ordinary inactive-template assignments denied. Following plans exclude unaffected prefixes before the predicate; whole-series shortening follows the same rule. Cookie-RLS role existence and all other reference relationships remain checked; missing defaults fail retention closed. Actual public-action tests cover protected exceptions/cancellations, active replacement defaults, new inactive/cancelled assignments, substitution and foreign references. The first-applied1800 migration is immutable. Forward220000 narrowly allows an unchanged existing protected work-role reference and enforces predecessor lower bounds on requested/effective rules plus every complete row; existing protected-payload equality, auth, locks, proof domains, replay, outcomes and audit remain intact. AC4/5/6 have historical effbf5e1/run39335595653 all22real command passes plus local106020-0221+2P;105 RED stays a failure.106 GitLF57e7 and frozenlocalCRLFc55 differ only in176line endings; neither is rewritten.

- `src/features/resources/booking-series-actions.ts:29` — `async function validateEffectiveReferences`: checks defaults and rows against the same signed snapshot.
- `tests/unit/server/bookings/series-plan.test.ts:241` — `Round3 R3-02 completeness`: covers thirteen public-action retention and assignment boundaries.
- `tests/integration/commands/booking-series.int.test.ts:1076` — `15.2-INT-REAL-020`: pairs protected retention with inactive-new-assignment denial.
- `tests/integration/commands/booking-series.int.test.ts:1099` — `15.2-INT-REAL-021`: tests real JWT signed-overlay denial and zero durable delta.

Round2 forward107 additionally permits the unchanged existing role when an omitted ordinary slot first becomes cancelled. Same tenant/booking/original role remains mandatory; new inactive assignments and substitution deny. Native REAL023 passed in exacta515/run39342433474 through the checkedcommand/RPC with projectedpayload/replay/denial snapshots; not an isolatedrawSQL or blanketcancellationproof.

- `supabase/migrations/20261020000000_booking_series_cancelled_role_retention.sql:21` — `and (b.is_exception`: admits same-occurrence historical role on cancellation.
- `tests/integration/commands/booking-series.int.test.ts:1149` — `15.2-INT-REAL-023`: checks retention/replay and inactive-assignment negatives.

### One current-facts transaction still owns conflicts and replay

AC3/6/7 continue using the sole detector over the complete proposed overlay and one current-authority tenant gate. Separate proof/review domains, group completeness and atomic selected acceptance/outcome/audit are preserved; actual audit-failure rollback and historical effbf5e1/run39335595653 fullDB1827P/RLS800subset retain transaction-stage proof; skipped scaffolds give no credit.

- `src/server/bookings/series-attestation.ts:5` — `export const SERIES_ATTESTATION_DOMAIN`: separates batch proof authority.
- `src/server/bookings/series-conflicts.ts:112` — `export function deriveSeriesConflicts`: derives whole-overlay associations through the sole detector.
- `supabase/migrations/20261019180000_recurring_booking_series.sql:151` — `create function public.finalize_booking_series`: preserves the immutable first-applied transaction baseline.
- `tests/integration/commands/booking-series.int.test.ts:849` — `15.2-INT-REAL-007`: proves last-stage failure rolls back all durable collections.

Round2 ready admission measures the exact compact p_plan TEXT sent to SQL before JSONB parsing. Later conflict-output validation has no aggregate byte cap, so JSONB whitespace cannot cause another size rejection. The boundary unit is synthetic serialization evidence, not a full SQL3MiB transaction. Effective decision SQL permits long logical IDs within transport/receipt limits.

- `src/server/bookings/series-conflicts.ts:146` — `export function serializeBookingSeriesPlan`: applies SQL UTF8 bounds before ready/save.
- `tests/unit/server/bookings/series-plan.test.ts:130` — `Round2 preview rejects`: exercises actual planner/preview over the complete oversized conflict plan.

### Match essential host proof to actual execution and unchanged dependencies

Public occurrence metadata remains behind existing RLS; no template/outcome grants change. New real-host cases exercise changed stale recovery, native drag/resize following proposals and retained-assignee removal. Actual GLK007/008 plus strict009 prove all changed flows;009 uses one native click and explicit disappearance because the effective fallback control intentionally detaches after deselection. Historical genuine response-loss/phone/role receipts remain scoped history; Root qualified every mutable lane.

- `src/features/resources/bookings-read.ts:17` — `const BOOKING_COLUMNS`: projects existing safe occurrence metadata without private outcomes.
- `tests/e2e/booking-series.e2e.spec.ts:410` — `15.2-E2E-007`: asserts fresh stale recovery, invalidated review and explicit retry.
- `tests/e2e/booking-series.e2e.spec.ts:431` — `15.2-E2E-008`: uses native resource drag/resize and independent persisted facts.
- `tests/e2e/booking-series.e2e.spec.ts:452` — `15.2-E2E-009`: asserts effective inactive assignee visibility and durable removal.

Evidence: `_bmad-output/test-artifacts/story15-2/build-round3-author-verification.json` binds frozen3production+1test inventorye6aae211, all6Round3reports, original/incorrect-fixture/corrected/date/mixedtombstone RED history and implementedHigh9d22PASS. Actualfinal45P0F0S=13matrix+32related are independently matched by name to nativeTAPOK within exacta00/run39348312783 unit3004P0F0S, never additive. All5requiredjobs/11identitybindingsPASS,43processP0S/fullDB1828P52S with23active15.2commands/RLS800P14S INCLUDEDsubset/directStorage1P/107firstreset3jobs. NativeRLS005freshpreview+snapshot and REAL023checkedretention/replay/denials passed current required1 bodies. Full static/build/containment passed exactsource.

Browser disclosure: Auth/Jobs10firstattemptpasses+1FLAKY case,12attempts/1retry/0finalfail/skips/globalerrors. E03 firstattemptCDPresponse.text fails before PREVIEW_STALE/laterassertions, which are unreached; unchanged configuredretry1 passes complete awaited body321-354. Narrowqualificationfc130dae establishes reach and unchanged standalone route, without rootcause inference or waiver. This ordinarybrowser smoke is separate from historical scoped GLK007/0082Pthen0091P Scheduling essentials and current actualTSX/public-action ports. No fresh Scheduling/DENIEDbrowser or matrix claim.

Limits: synthetic public-action tests mock auth/cookie-RLS/RPC persistence;45passes include expected denials, not13successful mutations.52DBskips/4optionaljobs supply no coverage; RLSnonadditive. No fullSQL3MiBtransaction/local107apply/exhaustivevisual-manual-device/representativeSchedulingreleaseperformance claim. Currentconfiguredpilot read18.046681ms/CPU4.864174ms/2RLSrequestsperread is narrowAdminuserswork only; fullprivatequeryplanJSONnotuploaded.105/106/107raw+GitLFidentities preserved separately. Prior3cCI cancelled andc533SUCCESS are historical, not finaldelta coverage; finala00source conserved through metadataHEAD308dfa3a, no separate308build. Canonical2medium patches/3low rejects/score6TRUE/broad3of3/nonconvergence0. Rootdeliverygate/native0 plus independent newfrozenrecordprovenance PASS and explicit statusadmission now establish developmentDONE;3release defers persist/release_readyfalse.

Final gate evidence: actual Rootgatefa55/native0/development_completetrue/approval_grantedfalse and independent frozen-recordprovenance17505c8a/JSON061f1b2d/manifest e9afd65e passed against unchangeddeliverya40 and boundauthor85b. Explicit Rootstatusadmission3c5183f5 authorizes spec-only developmentDONE. Pending-gate wording in the immutable records is the earlier freeze, superseded by this closure; no source/test/runtime/review round added. PrimaryBuildAuto owns metadata-only commit and Root-owned later P7/E5h bookkeeping.

### Review Findings

**Round 1 of 3**

Configured Round1 completed:8accepted patches addressed (4high/4medium; medium score12; followup true),1nonconsequential reject,0intent gap/bad spec/defer. Same High targeted source/binding/Unicode/009 follow-ups passed. Dated canonical Review Triage Log above maps each fix to actual evidence. Source checkpointeffbf5e1 and exactCI39335595653 all5required jobs PASS; Root mandatorydeliverygate/narrowprovenance PASS and explicit finalstatus admission now permit development-done only.


**Round 2 of 3**

Six configured layers completed:3patches(2high1medium),2rejects,0intent/badspec/defer. Targeted High correction/helper/boundary PASS,20focusedP0F0S/static native0. Frozen source/SQL/test packet passed exacta515/run39342433474 requiredCI; nativeREAL005/REAL023PASSED. Root gate/final provenance passed with explicit development-done admission; broad2/3, nonconvergence0, followupTRUE. P5 evidence remains historical at its tested source.


**Round 3 of 3**

Final automatic configured review completed all six context-free layers before triage against ecb3f6d0b835388d73a81aadf8beec9f6f899469/frozen diffbc62fe746e4019ff012df67dda1be5d7c2078bd1bcd1214c0c683e3acd4a96b1. Two medium patches addressed, three low candidates rejected, zero intentgap/badspec/defer; weighted score6/followupTRUE. Current45focusedP/staticnative0 after R3-01 effective-date correction and R3-02 complete13case matrix (accepted-finding RED8P1F). InitialsourcePASS/trailqualification/obsolete3cCANCELLED/c533SUCCESShistory retained. ImplementedHigh9d22 and exacta00CIqualification2082 pass with disclosed1browserflake; Rootfinaldeliverygate/separate frozen-recordprovenance PASS and explicit status-only admission now establish developmentDONE only; immutablea40/85bfrozenrecords preserved. Specin-review. Broad3/3 is final; nonconvergence0 remains separate, no fourth broad pass.


Targeted closeout evidence (2026-10-25): the existing authored review trail remains intact; new metadata author verified the composed editor effective-path reuse and records actual targeted score0/FALSE in preparation/epic-15/inherited-15-2-targeted-post-cap-p7-result.json. Earlier implementation author was not re-engaged; no earlier design rationale is reconstructed or relabelled author-written. Current45/23REAL/5RLS/7SSR plus scoped historical browser reuse are separate from release validation and final PR approval.
