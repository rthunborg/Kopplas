---
title: 'Story 16.4 — Projekt Upgrade and Job-Card Semantics'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
baseline_revision: '77d11b6f18570e075dd858096194e497d99f95b1'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/docs/process/development-completion-policy.md'
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/docs/process/agent-model-routing.md'
warnings: [oversized, multiple-goals]
deferred: []
---

<intent-contract>

## Intent

**Invocation:** Story 16.4 "Projekt Upgrade and Job-Card Semantics" (sprint-status key `16-4-projekt-upgrade-and-job-card-semantics`, epic16). Branch `codex/epic-16-jobs` is the intended branch for this work. Halt after planning.

**Owner clarification — 2026-10-20:** Root relayed the direct human answer **“Confirm all those decisions as defaults”** to ALL three concrete questions. Approved: no unnamed new project-only fields; existing card fields apply to Order and Projekt, payment-plan fields/children remain17.2; D is elapsed on-site minutes, N crew size, T planned travel minutes PER PERSON, total demand N×(D+T); advisory whole-job demand versus remaining planning-window capacity without another occupancy debit, repeated full-estimate charges on split/repeated bookings, or a new hard save block. This fresh clarified invocation retains the exact Story16.4 target/branch and **Halt after planning.** Historical blocked bytes remain unchanged.

**Problem:** Jobs currently have both kind values and the complete scheduling source fields, but there is no checked one-way upgrade and duration, crew/travel, planning dates and customer presence do not yet reach their required booking consumers. Storage or full-card display alone cannot close TR08–10 or TR13–16.

**Approach:** Add a dedicated, atomic manager-authorized same-row order-to-projekt operation and complete the actual job-card/booking-editor consumers using checked per-booking job facts. Keep the existing container, child identities, independent consumer permissions and one coordinated facts/proof/current-commit boundary.

## Boundaries & Constraints

**Always:** Keep the same job ID, lifecycle status, tenant/customer/source provenance, bookings, members, work orders, files and old/new dependency rows. Admin/Projektledare authority gates upgrade/full-card writes; designation alone adds neither. The exact downgrade result is `JOB_TYPE_DOWNGRADE_FORBIDDEN`, enforced below application callers. Current actor/tenant/role/target state and canonical request identity are checked on initial mutation and replay; one successful upgrade emits one job event and one audit atomically, and audit failure rolls back all writes. Preserve old creation APIs, order-only creation and existing card type-equality guards. Protected money/auth/private-person fields remain structurally absent without independent entitlement. Scheduling source facts are per evaluated booking's actual job; null/unavailable differs from recorded-empty and known false. Existing card fields apply to both kinds; no unnamed project-only data is created. D/N/T retain current integer bounds; T=0 is known. Actual allocation credit and remaining capacity use the SAME authorized eligible-person pool, planning-window overlap bounds and booking inclusion rules. Never crew-multiply actual per-assignee minutes again. Advice never becomes synthetic occupancy, persisted hard conflicts, a new override requirement or a new save block.

**Block If:** A newly discovered concrete authority, containment or proof invariant cannot be preserved within the approved contract. Name its exact path, owner, invariant and safe resume condition. The three previous product questions are resolved; do not recreate them or a whole-E15/acknowledgement gate.

**Never:** Downgrade, recreate/reparent the container or children, broaden current lead grants, implement payment plans/economy (E17), parent completion (E18), the16.5 workspace shell, notifications, an optimizer or new hard date save prohibition. No Phase C/offline/AI/portal/provider work, legacy URLs/observations, historical SQL edits, foreign dirty-source adoption, service-role client access, deployments or Git/state/ledger mutations.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected output / behavior | Error handling |
| --- | --- | --- | --- |
| Upgrade | Authorized current manager; order of any existing lifecycle status | Same row becomes projekt; exact status and all linked identities retained; one event/audit | Atomic rollback on any write/audit failure |
| Replay / concurrency | Same request after lost response, or concurrent upgrades; already projekt | Return current same-ID state without duplicate transition/event/audit; recheck current authority | Changed request identity and revoked authority cannot replay a grant |
| Forbidden writer / reverse | Lead-only/member/foreign/inactive actor, or projekt-to-order via any writer | No mutation or protected output | Generic access denial; exact downgrade code for an otherwise authorized reverse attempt |
| Booking default | New job-connected draft; known estimate; no explicit end | Length derives from selected job estimate and effective selected start | Existing/edit/explicit interval retained; unavailable estimate retains honest existing60-minute fallback |
| Job change / stale proof | Mixed jobs; changed duration/crew/travel/dates/presence while preview waits | Each booking consumes its own checked facts; current facts invalidate obsolete context/proof | Refetch/review with retained unsent input; no caller-authoritative hints |
| Dates / presence | Known earliest, desired, latest; presence true/false/unavailable | Earliest lower bound; desired soft warning; separate latest breach; correct presence constraint | Unknown stays unknown; no optimizer or automatic new rejection |
| Capacity estimate | D120,N2,T30; allocation120; gross capacity360; all occupancy240 | Total300; residual demand180; remaining capacity120; advisory shortfall60 person-minutes | Missing input unknown; no estimate occupancy/debit, repeated full charge or hard block |

</intent-contract>

## Code Map

Current entry HEAD is `ebd03a4e4c5226a2b3926bcdcbd2c2a29d18e776`. Read-only Git comparison against `2d002970fcb112db8d480068443a0cce2577bd5b` is metadata-only, so both completed High source explorations and16.3 continuity remain applicable. This is inspection, not execution evidence.

- `_bmad-output/planning-artifacts/epics-phase-b.md:1595`; `architecture-phase-b.md:448`, `:453`, `:460`, `:467–490` — one-way atomic upgrade, kind/status independence, both-kind members/work orders and complete card semantics.
- `_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md:18–26`, `:53–59` — TR08–10 and TR13–16 / AC03–07 are mandatory destination acceptance; TR14 explicitly requires approved concrete arithmetic before ready.
- `src/server/commands/envelope.ts:97–108`, `src/server/authz/permission-matrix.ts:74–85`, `job-command-scope.ts:3–12`, `job-access.ts:12–20` — existing manager card grants and closed lead-only exceptions. Add no upgrade/full-card lead exception.
- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:216–256`, `:371–381` — creation remains order-only and full-card updates cannot change kind. `20260711120000_accepted_record_lock.sql:208–242` source immutability coexists with same-row upgrade. `20260709120000_acceptance_to_job_model.sql:232–239` currently constrains event kinds.
- `src/features/jobs/job-card-domain.ts:35–57`, `:65–117`; `src/components/jobs/JobCardForm.tsx:65–109`; `JobDetailView.tsx:38–43`, `:125–131`, `:314` — reuse current field validation/form/read display and extend only event label/upgrade affordance.
- `src/app/(app)/jobs/[jobId]/page.tsx:79–105`; `src/features/resources/bookings-read.ts:136–165`; `booking-action-state.ts:11–17`; `src/components/resources/BookingEntry.tsx:17–22`; `BookingEditor.tsx:67–79`, `:145–185` — independent Bookings.Manage, current safe job options,60-minute default and CRM-only selected-job handling. These are the actual consumer entry points.
- `src/features/scheduling/types.ts:19–36`; `capacity.ts:47–58`, `:86–127`; `conflicts.ts:26–110` — current roles/windows facts and actual per-assignee UTC booking-overlap capacity; no job-estimate formula exists.
- `src/server/bookings/conflict-facts.ts:18–61`, `:112–123`; `src/server/commands/jobs/card-facts.ts:8–29`; `conflict-attestation.ts:6–14`; `editor-preview.ts:9–59`; `save-with-conflicts.ts:15–35` — checked canonical facts, proposed-card overlay, v3 claims, sealed reviewed preview and actual save.
- `20261019133200_e16_16_1_job_booking_facts.sql:3–139`, `:259–405` — actual facts/snapshot/editor finalizer and card baseline/snapshot/finalizer definitions to extend FORWARD as one integrity unit. `20261007120235_booking_editor_audited_override.sql:148–157` keeps `finalize_booking_conflicts` replay-only (fresh writes BR428); do not reopen it.
- Completed `spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md:61–65`, `:127–137` and `spec-16-3-arbetsorder-2.md:63–67`, `:124–143` preserve current narrow lead/crew/date/WO authority, own WO dates and lossless dependencies. Their prior CI is continuity evidence only.

## Tasks & Acceptance

### Execution in dependency order

1. New `src/features/jobs/job-upgrade-domain.ts`, `src/features/jobs/job-scheduling-consumers.ts` and `src/features/scheduling/job-demand-advisory.ts` with named unit tests below — bind approved closed inputs/units, interval provenance and concrete allocation/golden cases. Use existing columns; no unnamed field or product policy remains to invent.
2. New `src/features/jobs/job-upgrade-domain.ts`, `src/server/commands/jobs/upgrade-job-to-projekt.ts`, `src/server/commands/jobs/job-upgrade-db.ts`; existing `src/server/commands/jobs/index.ts`, `src/server/commands/envelope.ts`, `src/server/commands/envelope-core.ts`, `src/server/commands/command-errors.ts`, `src/features/jobs/actions.ts` — dedicated upgrade command/action and safe exact downgrade error. Reuse independent Jobs.Edit manager admission and checked SQL current authority; leave `src/server/authz/job-command-scope.ts`'s closed lead exceptions unchanged.
3. One fresh CLI-generated `supabase/migrations/*_e16_16_4_job_upgrade_and_scheduling.sql` (logical proposal only) — append dedicated event CHECK/checked upgrade RPC, current-role/job locks, request replay, audit atomicity and database one-way type guard. Keep all old writers/source locks. No unnamed project-only data is added. Existing §8.4 fields remain valid under both kinds; payment-plan data and its SQL projekt gate remain E17.2. No placeholder column, premature E17 schema or unexecuted future-constraint claim.
4. New `src/components/jobs/JobUpgradeDialog.tsx`; existing `src/components/jobs/JobDetailView.tsx`, `src/features/jobs/actions.ts`, `src/features/jobs/types.ts`, `src/features/jobs/read.ts` — usable authorized order-only confirmation, current-kind result/readback and event label. Explain the one-way kind change honestly: members/work orders already exist for both kinds; payment/economy features remain separately unavailable until their modules ship. Retain entered state on failure and show success only after persistence.
5. New headless `src/features/jobs/job-scheduling-consumers.ts`; existing `src/features/resources/booking-action-state.ts`, `src/features/resources/bookings-read.ts`, `src/features/resources/booking-actions.ts`, `src/components/resources/BookingEntry.tsx`, `src/components/resources/BookingEditor.tsx`, `src/app/(app)/jobs/[jobId]/page.tsx` — safe checked selected-job hints, new-only duration default with explicit interval provenance, earliest-bounded suggestion/context, distinct desired/latest warnings and presence true/false/unavailable. Preserve edited intervals, newer drafts, immutable uncertain submissions and independently checked booking authority. Do not substitute a new isolated widget for the actual editor.
6. Coordinated High facts/proof unit: `src/features/scheduling/types.ts`, `src/features/scheduling/capacity.ts`, `src/features/scheduling/conflicts.ts`; `src/server/bookings/conflict-facts.ts`, `src/server/bookings/conflict-attestation.ts`, `src/server/bookings/editor-preview.ts`, `src/server/bookings/save-with-conflicts.ts`; `src/server/commands/jobs/card-facts.ts` and the one new migration — include D/N/T, planned start/end, earliest/desired/latest dates and customer presence alongside roles/windows in checked per-job SQL facts and proposed-card overlay. Bind output-affecting values, selected-person capacity facts/window and canonical post-edit bookings in snapshots/digests/current-fact recomputation; retain every other job's own facts. Keep actor/tenant/action/candidate/expiry/request/review binding, whole-group selective review, replay/current-authority and atomic derived-conflict refresh. Use coordinated semantic identities booking-conflicts-v4 and stockholm-capacity-v2; replace TS and both actual booking/card SQL finalizers coherently and reject correctly signed obsolete v3 claims/receipts. Preserve the separate job-card HMAC domain; no new secret family. Defaults/hints never become caller-authoritative facts. Keep desired/latest/demand advice separate from persisted booking_conflicts and acknowledged override groups; no new override reason or hard save block.
7. Tests: new `tests/unit/features/jobs/job-upgrade-domain.test.ts`, `tests/unit/features/jobs/job-scheduling-consumers.test.ts`, `tests/unit/features/scheduling/job-demand-advisory.test.ts`; `tests/integration/commands/job-upgrade.int.test.ts`, `tests/integration/commands/job-scheduling-consumers.int.test.ts`; `tests/e2e/jobs/job-upgrade.e2e.spec.ts`, `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts`. Extend bounded current `tests/unit/server/bookings/job-facts.test.ts`, `tests/integration/commands/job-booking-facts.int.test.ts`, `tests/support/jobs-depth-atdd.ts`, `tests/support/job-booking-facts-atdd.ts`; `tests/unit/features/scheduling/capacity.golden.test.ts`, `tests/unit/features/scheduling/conflicts.test.ts`, `tests/unit/features/scheduling/batch-conflicts.test.ts`; golden `tests/fixtures/golden/scheduling/capacity.json`, `tests/fixtures/golden/scheduling/conflicts.json`, `tests/fixtures/golden/scheduling/regressions.json`, `tests/fixtures/golden/scheduling/dst.json`. Bind approved arithmetic, null/zero, split/repeated/actual occupancy, DST/day clipping, mixed jobs, explicit interval retention and current-fact/date/crew/travel/presence changes.
8. Preserve fail-loud exact ACL/role inventory through bounded `tests/integration/rls/migration-reset.int.test.ts`, `tests/integration/rls/role-harness.atdd.int.test.ts`, `tests/support/authz/role-harness.ts`, `tests/unit/server/commands/envelope-core.test.ts`, `tests/unit/server/authz/command-enrollment.test.ts`. Add only upgrade/protocol cases, not global grants or table enrollment. No new tenant table/nav/module is implied. `package.json::test:smoke` appends the two actual new essential E2E paths before the trailing reporter, preserving all existing arguments/dependencies/lockfiles/CI workflow.
9. Implementation author writes exactly one final Suggested Review Order with actual entry/checked authority/SQL/proof/current-consumer/test stops and verified line anchors, using `docs/process/review-order.md` and the section scaffold. This planning artifact does not manufacture a completed trail or execution results.

### Acceptance Criteria

- **AC01 / TR10:** Given a current authorized manager and an order, when actual confirmation invokes upgrade (including concurrent requests, response-loss replay and injected audit failure), then same-ID type transition, one event and one audit commit together or nothing does; existing status, source refs, bookings, members, work orders and files remain identical.
- **AC02 / TR10:** Given every seeded/multi-role actor, current revocation and each alternate/direct SQL writer, when upgrade/downgrade/replay is attempted, then only independently authorized managers can upgrade, no caller can downgrade and authorized reverse attempts return JOB_TYPE_DOWNGRADE_FORBIDDEN; already-projekt is idempotent and confirmation is truthful, with no downgrade control.
- **AC03 / TR08–09:** Given Order or Projekt, when the actual complete card is created/edited/read, then all existing §8.4 fields, responsible lead and actual WO dependencies are usable/persisted without duplicate storage or unnamed project-only data, and protected fields remain absent. Existing fields apply to both kinds; payment-plan data and its SQL projekt-only validity remain E17.2, not implemented here.
- **AC04 / TR13:** Given a known estimate and a new job-connected booking without an explicit end, when the actual editor opens/previews/saves/reloads, then default length consumes the selected job estimate; edit/existing/explicit intervals remain unchanged and missing estimate preserves documented fallback without inventing a known estimate.
- **AC05 / TR14:** Given known D/N/T and planned dates with an authorized eligible selected-person pool, when actual job-bound planning/capacity and booking preview/save run, then total demand is N×(D+T) person-minutes once/job, actual current-job allocation is credited once and residual demand compared with remaining capacity. Both sides use identical pool/window/inclusion rules. Actual per-assignee minutes are never crew-multiplied again; split/repeated bookings contribute actual occupancy only. Missing inputs stay unknown, T=0 is known and shortfall is advisory without another debit/override/hard block. Golden and real consumer readback prove the numeric cases below.
- **AC06 / TR15:** Given distinct earliest/desired/latest dates across mixed jobs, when actual suggestions/editor preview/save or relevant facts change while a proof waits, then earliest bounds suggestions, desired miss is a soft warning, latest miss is a distinct breach and obsolete/other-job facts cannot commit; no automatic optimizer or new hard rejection is introduced.
- **AC07 / TR16:** Given selected-job presence true, false or unavailable, when actual job entry and selection/change render the editor, then the current checked selected job's requirement is visible with the correct distinction; another job's/caller's value cannot bleed through. Essential connected360×640 browser tests prove changed flows, failures/retry/refetch and server-confirmed persistence.

## Spec Change Log

## Review Triage Log

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 14: (high 8, medium 6, low 0)
- defer: 0
- reject: 1: (high 0, medium 0, low 1)
- addressed_findings:
  - `[medium]` `[patch]` P01 — Definitive upgrade rejection allows dismissal while unresolved outcomes retain identity.
  - `[medium]` `[patch]` P02 — Refetch failures are caught without losing confirmation.
  - `[high]` `[patch]` P03 — Operation/generation and revision guards reject concurrent or obsolete refetch results.
  - `[high]` `[patch]` P04 — Selected-job defaults bound untouched create starts by earliest.
  - `[high]` `[patch]` P05 — Checked preview refresh applies current earliest to untouched starts.
  - `[high]` `[patch]` P06 — CRM clears and null hints restore derived fallback without changing edited ends.
  - `[high]` `[patch]` P07 — Default-end refresh compares canonical UTC instants.
  - `[high]` `[patch]` P08 — Large optional advisory calculations are bounded with honest unknown output.
  - `[high]` `[patch]` P09 — Valid terminal upper dates cannot throw through essential preview.
  - `[medium]` `[patch]` P10 — Authentic obsolete receipts require refetch after current identity/timing binding.
  - `[medium]` `[patch]` P11 — Valid 64-hex stale-state tests reach normal command and direct JWT SQL guards.
  - `[medium]` `[patch]` P12 — Actual NEW-draft delayed options case preserves newer edits.
  - `[medium]` `[patch]` P13 — Frozen browser time proves a future earliest clamp.
  - `[high]` `[patch]` P14 — Untouched DST-fold starts retain original canonical instants.

Historical original six-layer pass; twenty raw concrete findings yielded fourteen causal patches after six overlap deduplications. Duplicates are not rejects. The one low reject is the historical planning-HALT interpretation as a current execution gap, superseded by the explicit pinned Phase 5 implementation grant.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 1, medium 0, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` P15 — Both supported instant-window edges now guard optional advice; valid 0001-01-01 one-day regression observed RED then GREEN.

Same-blind targeted residual follow-up; this is not another broad six-layer pass.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Latest same-blind lower-bound recheck qualified PASS with zero new findings; same-security qualification applies to unchanged security/proof/card/migration dependencies. Latest recommendation is false; historical patch necessity remains recorded above.

### Round 1 causal batch — 2026-10-20

Root reported five internal review layers completed (security: no findings). Configured external CLI review was initially refused before launch by automatic approval because private code required direct human authorization for the external model. Root obtained that authorization for the exact frozen candidate; foreground external review then completed native 0. Receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-4-review-c2eea236-b5c7-4e65-b9d4-bb296d96e162/cross-model.diff.review`, SHA256 `0E19578A24CB188A2DC251F6AC2062CA0DF335C85D556D8456207C195B75CC30`. Root confirmed all 44 candidate hashes unchanged before this authorized patch batch. Twenty raw findings were deduplicated into fourteen causal patches; the historical frozen planning phrase was not accepted as a new execution gap because the current pinned Phase 5 dispatch authorizes implementation.

| Patch | Author disposition and implementation |
| --- | --- |
| 1 | Definitive upgrade refusals permit dismissal; unresolved saves retain exact retry identity, including later authorization denial. |
| 2 | Stale-refetch transport/action failures are caught and retain confirmation/error state. |
| 3 | Save/refetch share a synchronous operation latch, generation checks and revision-aware transitions; obsolete responses cannot reset persisted/newer state. |
| 4 | Actual selected-job defaults bound only an untouched derived create start by earliest. |
| 5 | Current checked preview hints apply a changed earliest to that same still-derived start. |
| 6 | Every CRM-clearing branch and a null refreshed hint restore the honest 60-minute derived fallback; edited ends remain intact. |
| 7 | Preview rederivation compares exact UTC instants, including fold ends with identical displayed wall times. |
| 8 | Optional demand calculation uses a deterministic 4,096 day/person work budget; beyond it the result is wholly unknown, without partial numbers or a card/save restriction. Whole-window actual overlaps equal summed contiguous day overlaps, so exact occupancy is aggregated once and subtracted from the existing affine daily capacity result. |
| 9 | The original patch made a valid terminal 9999-12-31 planning end report unavailable advice before the existing four-digit instant boundary; the targeted follow-up below covers both edges; essential preview/save continue. Public date validation and shared time-zone code remain unchanged. |
| 10 | Authentic receipt parsing is separate from semantic retirement. Current actor/tenant/action/request/target, candidate/facts and valid timing bind first; obsolete versions then require refetch. Tampered, malformed, future-issued or foreign claims remain denied. |
| 11 | Valid-shaped mismatched 64-hex state is asserted through normal command and direct normal-JWT RPC, before transition and on committed-identity replay, with unchanged business/event/audit snapshots. Existing SQL guards required no source change. |
| 12 | New actual browser case holds a real options response for a NEW draft while newer job/interval edits occur, then checks those values survive. |
| 13 | Browser Date is fixed before a future earliest date; actual bounded start and elapsed duration are asserted. |
| 14 | Untouched ambiguous Stockholm starts retain their original canonical instant; only actual user start edits reparse wall time. Actual browser controls cover both this case and same-wall-time changed ends. |


### 2026-10-20 — Review pass

- intent_gap: 0
- bad_spec: 0
- patch: 0: (high 0, medium 0, low 0)
- defer: 0
- reject: 0: (high 0, medium 0, low 0)
- addressed_findings: none — latest same-blind High targeted CI-repair recheck qualified PASS on DD1DFF91, five changed hashes / 41 unchanged dependencies; this is not another broad review round. Required exact-head runtime/performance evidence remains pending.

### 2026-10-20 — Review pass

- intent_gap: 0
- bad_spec: 0
- patch: 0: (high 0, medium 0, low 0)
- defer: 0
- reject: 0: (high 0, medium 0, low 0)
- addressed_findings: none — latest same-blind High targeted CI2 repair recheck qualified PASS on 373AF3AC, three changed hashes / 43 unchanged dependencies. This is a narrow causal recheck, not a new broad review; new exact-head required CI remains pending.

### 2026-10-20 — Review pass

- intent_gap: 0
- bad_spec: 0
- patch: 0: (high 0, medium 0, low 0)
- defer: 0
- reject: 0: (high 0, medium 0, low 0)
- addressed_findings: none — latest same-blind High diagnostic assertion review qualified PASS on 6907A4, two changed hashes / 44 unchanged dependencies. The unresolved save cause requires actual diagnostic CI; no new broad review or product-fix verdict is claimed.

## Review Findings

**Round 1 of 3**

Configured six-layer independent review; all sensitive layers use context-free gpt-6.1-sol High. Runtime acceptance remains pending exact-checkpoint CI. No review verdict is claimed at dispatch.

The preceding dispatch text is the restored historical Round 1 route. Actual completion now comprises that original six-layer review plus the same independent High targeted fix/security and final lower-bound rechecks, bound by unchanged dependencies; all six layers were not reexecuted on the latest fix. Latest targeted recheck has zero new findings, and the source checkpoint is qualified for root's checkpoint/CI lane. Required runtime CI remains pending.

Review receipt folder: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-4-review-c2eea236-b5c7-4e65-b9d4-bb296d96e162/`.

- `targeted-security-review.txt` — SHA256 `9277E60393C5AEE46EA8B4F97F9C506FED2CAFDB28B1A85B5D6CCF83E6DED9A4`; actual collaboration text saved verbatim, qualified at 7FAE with unchanged security suffix retained.
- `targeted-blind-review.txt` — SHA256 `97681232CAC20C7E925C7E641FF8D0DD923F84E63DD00B22E77E63AE381D89F7`; finding text saved with normalized formatting, not a raw export.
- `targeted-lower-bound-review.txt` — SHA256 `90BD586F10D8F9F31811C006EF35354980207F2C321E87F8F13E307578A0A3C5`; actual same-blind qualified PASS text, bound to CB7CD4BC's three changed hashes and 42 unchanged dependencies.
- `external-review-completed.json` — SHA256 `373D670E1A3A10CE5EF39D57B0EDDDC48A0660C41A76E28BCD3941516231CA7C`; `external-review-human-authorization.json` — SHA256 `7424F01002E35DF5794BB0C18A4382DC0861DF1E41E8AA611C3A93BBE6CEE418`.
- `external-review-refusal.json` preserves the prelaunch automatic refusal; `review-provenance-pending.json` preserves the original internal collaboration summaries/pointers as a historical file, not the final status or native exports. The external CLI text receipt and its full hash remain in the Round 1 history above.

## Design Notes

Current approved defaults remain: low/normal/high/urgent priority (normal default), canonical nullable dates, positive integer duration/crew, nonnegative travel, structured facility-derived location or override, real work roles, absolute access windows and member-derived lead. Presentation may use the existing design system with proportional headless domain/state/validation/actions separation; no new material planning arithmetic is hidden as a UX default.

### Approved defaults and exact allocation — 2026-10-20

Direct human answer: **“Confirm all those decisions as defaults”**, relayed by root in the resumed task. This approves all three former questions, not just presentation. Historical blocked SHA256: `1f9d493d0f81883a773ad3633430633438b46c5c5f199caede7260f622395e39`. It remains untouched.

The same High consumer explorer verified the following technical expression of the approved no-double-charge rule; it introduces no permission or new save prohibition:

1. Window = existing planned_start_date through planned_end_date, inclusive Europe/Stockholm calendar days, internally [local midnight start, local midnight after end). Never substitute earliest/desired/latest.
2. BOTH allocation credit and capacity use distinct explicit current authorized eligible editor-selected assignees. Do not manufacture N people. Missing D/N/T/window/pool or required capacity facts yields unknown; explicit T=0 is known.
3. Canonical post-edit bookings replace the candidate's previous identity exactly once. Apply the same current active/cancelled inclusion rules and exact per-person interval/day/DST clipping on both sides.
4. totalDemand = N×(D+T) person-minutes once/job.
5. allocatedCurrentJob = actual current-job booking/person overlaps clipped to THAT window in the SAME pool, each booking/person once. Never multiply those actual minutes by N again.
6. remainingDemand = max(0,totalDemand−allocatedCurrentJob). Sum remaining capacity across that same pool/window after ALL actual post-edit occupancy is deducted once. Preserve negative remaining capacity honestly.
7. shortfall = max(0,remainingDemand−remainingCapacity). Display total/allocated/residual/capacity/shortfall as advice; never insert estimate occupancy, debit forecast or require a new override.
8. Reuse `prepareDailyCapacity` at `src/features/scheduling/capacity.ts:96–127` with full post-edit actual demand. Do not use `calculateCapacity`'s candidate-exclusion API for this advisory. Preserve exact internal precision until final display.

Golden cases for D120,N2,T30, hence total300 person-minutes:
- allocated0/gross480/allBooked0 -> residual300/capacity480/shortfall0.
- allocated120/gross480/allBooked120 ->180/360/0.
- allocated120/gross360/allBooked240 ->180/120/60.
- allocated360/gross480/allBooked360 ->0/120/0.
Two30-minute bookings with two people allocate120, like one60-minute booking; neither repeats total300.

New booking default is D elapsed minutes, not N×D or D+T. Explicit prefill, existing booking or user-modified interval wins. Job changes may rederive only a still-derived untouched default. Selected-job presence/date hints refresh independently of interval provenance.

### Exact prospective shared handoff and resource boundary

- Scheduling shared symbols: `src/features/scheduling/types.ts::JobSchedulingInputs`/rules version, `src/features/scheduling/capacity.ts` input validation/approved demand helper and `src/features/scheduling/conflicts.ts::detectAllBookingConflicts` per-booking evaluation. Preserve E15 actual interval arithmetic and all series/resolver/time-report contracts.
- SQL shared definitions listed in Code Map: checked booking facts, booking/editor snapshots, real editor finalizer, job-card baseline/snapshot/finalizer and derived refresh. One coordinated High unit owns semantic transition; no partial UI-only scalar override or reopened replay-only finalizer.
- Booking shared subranges: selected-job safe DTO query/options, new draft defaults, editor selected-job semantic state, preview response projection. Existing independent Bookings.Manage and explicit interval behavior remain.
- Auth/test shared rows: dedicated upgrade command row, exact RPC ACL/signature entries, jobs-only role fixtures and error result. Preserve E15 rows, provisioning assertions, old lead/WO cases and fail-loud exhaustive sets. No notification registry/runner or E15 views/readers/E2E/CI claim.
- No migration is reserved/created. One logical forward migration is proposed after the combined actual E16/E15 chronology; root must recheck filenames immediately before future CLI creation. Own latest observed is20261020200000_e16_16_3_work_orders.sql; reported prior E15 latest20261020190000_time_reports.sql is coordination data only for this run.
- No services/resources are required for planning. Future local verification uses only actor-owned guarded isolated Compose/app services with unique project/ports/synthetic fixtures, or qualified root-owned exact-head checked-in CI. No native Supabase lifecycle/reset, user/E15 resource adoption, provider writes or deployment.

## Verification

No checks below have been executed for16.4. Prior16.3 CI39410923156 is continuity only.

- Static/unit/build: `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm build`, source/bundle containment and lock checks; report actual pass/fail/skip counts.
- Sensitive integration/RLS: `SUPABASE_TEST_REQUIRED=1 pnpm test:int` through the required full lane, empty-database forward migration/seed/reset chain, direct isolated Storage recovery and focused actual upgrade/concurrency/revocation/replay/audit/proof/golden tests. The dedicated physical proof's ordinary-lane skip is never counted executed; report its separate evidence.
- Essential production Playwright smoke: actual confirmation/same-ID upgrade/reload, role denial, complete-card preservation and real booking default/capacity/date/presence preview/save/reload; preserve old smoke union and connected360×640 flow. No next-dev substitute, screenshot-only or internal-proxy acceptance.
- Configured independent reviews use actual sensitive Sol6.1High routes, exact diff/dependency bindings and the three-round cap; follow-ups target changed regressions/unresolved serious findings.
- Author delivery JSON `_bmad-output/auto-bmad/delivery/16-4-projekt-upgrade-and-job-card-semantics.json` must bind actual current revision/evidence and owned release-only breadth. Root runs actual delivery_gate, independent High provenance checks truth, and root explicitly authorizes done metadata before any final development-complete claim. Exhaustive matrices/screenshots/manual/polish remain owned release validation, not functional deferral.

## Auto Run Result

Status: in-review

Current result: checkpoint `643274eb5eb59f3a4c22666250d31b3f5a880015` ran CI39438104931. General browser counted 27 first-attempt passes / 1 unexpected / 0 flaky / 0 skipped; Upgrade-E01 failed both attempts while polling the unchanged title after an HTTP200 response. All four consumer journeys passed first attempt. A bounded complete source audit did not establish the save refusal reason or a production defect; the admitted diagnostic acceptance assertion below now requires the form's actual confirmed-save feedback before the unchanged persistence poll. It is not a product repair or passing runtime evidence. Same independent High narrow diagnostic review qualified PASS on inventory `6907a4ac1584cb81ea0235e04b49a1bb9114c21efeefc3c17af7520a77d7d039` (two changed hashes / 44 unchanged dependencies); next exact-head diagnostic CI remains pending. Prior qualified reviews and database/recovery/performance receipts remain separately bound to their recorded checkpoints; root confirmed the third database lane: 1,873 total / 1,872 passed / 0 failed / 1 ordinary physical-recovery skip, with separate recovery 1 passed. Actual pilot performance completed 5 warmups / 25 measured iterations: read p95 10.571949000000131 ms and bulk permissions p95 4.079482999999527 ms. Overall CI still failed one browser journey and the save cause remains unknown.

Actual current local checks: affected-file ESLint and full TypeScript --noEmit --incremental false native 0; native collection lists the same 7 essential browser cases. Collection is not execution. No local service/browser/DB launch or redundant full-unit/build run occurred. The author SRO has 22 verified stops. Status remains in-review; no development-complete, done, delivery-pass or release-ready claim is made.

### Historical planning-only result — preserved

The following records the earlier planning invocation and its HALT; it does not describe the current explicitly authorized Phase 5 implementation checkpoint.

Planning only. Fresh renderer executed exactly once from installed own-worktree skill, snapshot96e8da50b6e5096e00c4. Root index refresh native0 confirmed clean HEADebd03a4e4c5226a2b3926bcdcbd2c2a29d18e776. Both completed context-free High explorations were reused after metadata-only source comparison; same High consumer synchronously verified the approved matched-pool/window/occupancy algorithm. Valid cached context and16.3 continuity retained. Original blocked artifact unchanged. Seven ACs/TR08–10/TR13–16 retain actual consumer/proof/verification/shared handoff, with all three former choices explicitly approved. No implementation, runtime, test execution, SQL/migration, Git/state/ledger write or completed review trail is claimed.

Ready-for-development self-review passed: actionable exact paths, dependency order, seven surface-anchored Given/When/Then ACs, concrete approved arithmetic/allocation, coherent shared facts/proof boundary and no unresolved material choice. HALT after planning. Blocking condition: none. On Complete preserves this planning result without fabricating implementation evidence or a final author trail. Next phase is root-pinned Phase4 ATDD; implementation is not performed in this invocation.

## Implementation Evidence — 2026-10-20

Implementation author: Sol 6.1 High; one bounded context-free Sol 6.1 High child authored the two pure scheduling modules and their unit tests. The main author owns the coordinated checked SQL/proof/finalizer boundary and all command/UI integration. Working-tree baseline remains `77d11b6f18570e075dd858096194e497d99f95b1`; no implementation commit, push, deployment, or status transition was performed by these authors. The planning-only Auto Run Result above is historical. Current status is in-review; targeted source/fix reviews are qualified and exact-head required runtime CI remains pending.

Recorded choices: use the existing Jobs.Edit manager capability for the dedicated upgrade, the existing tenant advisory gate and current membership/role/job locks, and the existing audit primitive for a single atomic transition. The same-row UPDATE touches type and updated_at only; no child is recreated. Replay binds actor, target, command and expected state; correlation remains audit provenance rather than a retry identity. All existing card fields continue on both kinds, without a project-only placeholder. The database guard rejects every projekt-to-order writer with JT409 / JOB_TYPE_DOWNGRADE_FORBIDDEN.

The owner-approved D/N/T and matched-pool/window algorithm is implemented using prepareDailyCapacity's existing exact hundredths. Demand is separate advice; desired/latest/presence do not enter booking_conflicts or override review. Job estimates default only untouched create intervals; explicit prefill, edits and unresolved submissions keep their interval. Options refresh uses the candidate sequence before applying a default. Safe SQL-selected hints feed actual BookingEntry/BookingEditor controls; preview advice derives from the same frozen checked snapshot used for the sealed receipt. Two necessary production composition seams were reported before editing and confirmed within scope: src/server/read-models/job-semantics.ts composes existing checked operational/member/work-order readers; src/server/bookings/job-semantics.ts composes checked booking authority/references/preview and the shared pure consumers. Static production imports repair the new native Playwright alias boundary without initializing a provider at collection.

Actual local evidence (absolute Node C:/nvm4w/nodejs/node.exe, own worktree, login false): typecheck --noEmit --incremental false passed; full ESLint passed with 0 errors / 14 existing warnings; full unit runner passed 2,718 / failed 0 / skipped 1 of 2,719 tests. The skip is the existing Linux-xattrs recovery-loader proof; it is not execution evidence. The 15 Story16.4 pure cases comprise the original 11 activated ATDD cases plus four focused cases; the additional canonical-facts unit assertion also passes. Production Next build passed after the readonly helper DTO translation fix. Lockfile and source/built service-role containment checks passed. Native no-webServer/no-browser injected-client binding probe passed 1/1 after two unsuccessful lazy-import attempts and a simpler static-binding repair; this proves binding/denial behavior only.

Collection only: Vitest lists all 32 new integration cases and native Playwright lists the four new essential browser journeys; all original 47 skipped ATDD bodies are activated. No local database/RLS/recovery or real browser journey was executed. Required exact-candidate root CI must execute the full SUPABASE_TEST_REQUIRED=1 integration/RLS lane, direct Storage recovery and production browser smoke. Earlier E16.3 CI is continuity only. The existing smoke union is preserved with both new paths before its trailing reporter; dependencies and lockfiles are unchanged. Existing conflicts/regressions/DST golden suites remain intact and execute; the capacity golden pack now additionally pins the four approved job-demand cases. The Sunday DST fixture explicitly authorizes overtime, retaining the existing Sunday closure rule and all expected arithmetic.

Acceptance mapping: AC01–02/TR10 → 16.4-U01/U02, manager-only envelope/enrollment checks and 16.4-INT-U01–U06, plus Upgrade-E01/E02. AC03/TR08–09 → INT-C01's two kinds and Upgrade-E01 full-card/member/work-order/file preservation. AC04/TR13 → U03–U06, INT-C02 and Consumer-E01. AC05/TR14 → U07–U10 and four extra pure cases, capacity.json jobDemand, INT-C03–C05/C10 and Consumer-E02. AC06/TR15 and AC07/TR16 → pure selected-job/date/presence cases, the nine-field canonical-facts unit, INT-C06–C08/C10–C12 and Consumer-E01/E02. Integration/browser mappings name activated assertions, not passing runtime evidence. Physical wait/revocation/audit-fault proofs and actual persistence remain CI obligations.

Development completion is not claimed. Root owns exact-head required CI, configured independent reviews and later author/provenance reconciliation. Release-only exhaustive browser matrices, screenshots, visual/manual walkthroughs and polish remain deferred with owner root/Epic16 release validation; next action is recording their concrete release evidence in the final delivery artifact/ledger, without deferring any essential functional failure. No delivery JSON or done metadata is asserted before root authorization.

## Round 1 Causal Patch Evidence

All fourteen items above are implemented as one authorized causal batch. Four added focused regression checks were observed failing against the frozen source: lifecycle/default/receipt checks 0/3 and terminal-calendar check 0/1. After the patches, the four focused files pass 19/19 with zero skips. The two calendar examples return unknown immediately; no centuries loop was exercised in the failing run because the first terminal-date assertion stopped that test. No SQL source, shared time-zone implementation, dependencies, environment or resource configuration changed.

Final Round 1 local commands use absolute Node C:/nvm4w/nodejs/node.exe in the owned worktree: typecheck --noEmit --incremental false native 0; full ESLint native 0, 0 errors / 14 existing warnings; full node unit runner native 0, 2,722 passed / 0 failed / 1 existing Linux-xattrs platform skip out of 2,723 tests; Next production build native 0. Logs are `C:/Users/Rasmus/AppData/Local/Temp/kopplas-164-round1-{lint,unit,build}.log`; targeted red/green logs use `kopplas-164-round1-red.log`, `kopplas-164-round1-calendar-red.log` and `kopplas-164-round1-green.log`. Source/bundle containment, lockfile and author reference checks are rechecked before refreeze.

Collection only: 34 integration cases (original 32 plus real receipt-retirement and valid terminal/long-window preview/save cases) and 7 essential browser cases (original 4 plus upgrade failure/refetch recovery, NEW-draft late-options/earliest/CRM fallback, and canonical DST control cases). Original 47 ATDD cases remain activated. New unit cases F01–F04 cover dismissal/unknown outcome and revision guards, earliest/start provenance and fold instants, computation availability, and authenticated receipt retirement versus denied tampering/identity. INT-U02 now exercises existing checked SQL with valid-shaped state mismatches; it is not claimed executed locally. Consumer-E01 now fixes browser time before a future earliest date. Consumer-E03 and E04 exercise actual production components rather than counting the pure refresh helper as UI evidence; Upgrade-E03 exercises real action responses and a dropped read response.

Runtime acceptance remains unexecuted locally: required exact-head root CI must supply SUPABASE_TEST_REQUIRED=1 full integration/RLS, direct Storage recovery and production browser journeys. Current local results do not replace them. The completed broad Round 1 review produced the causal batch; same independent High targeted fix reviews and the final lower-bound recheck are now qualified through the recorded provenance union. All prior evidence, the automatic refusal and subsequent direct human external-review grant remain historical provenance; no review outcome is silently rewritten as pass.

## Targeted Lower-Bound Follow-up

Root reported the same independent High security review qualified PASS on the frozen `7fae43bf598945c573d8a775296014d1a7802407889dcdb17ece782cea8f80e2` inventory, including unchanged proof/card/migration dependencies. The same blind targeted recheck identified one residual: valid one-day planned window 0001-01-01 crossed Stockholm midnight into unsupported UTC year 0000. This was a reachable optional-advice exception, not an invalid public date or a new planning decision.

The author extended F03 with that lower one-day case and observed RED native 1 / one failure. Both window-edge conversions now run inside a contained availability guard after existing date/fact validation and the work-budget check. Unsupported conversion at either edge yields wholly unknown advice; normal exact pool/window/occupancy arithmetic remains unchanged. No shared time-zone, SQL, public validator, card or save restriction changed.

Actual focused checks: demand-advisory file 7 passed / 0 failed / 0 skipped, native 0; affected two-file ESLint native 0; full TypeScript --noEmit --incremental false native 0. Logs: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-164-lower-bound-red.log`, `kopplas-164-lower-bound-green.log`, `kopplas-164-lower-bound-lint.log`, `kopplas-164-lower-bound-typecheck.log` in the same folder. Prior full-unit/build/static results above remain accurately bound to the prior candidate and were not rerun for this narrow follow-up, as root instructed. The same-blind lower-bound recheck has now qualified PASS on the frozen CB7CD4BC inventory; required exact-head runtime CI remains pending and status stays in-review.

## Exact-Head CI Failure and Bounded Test Repair

Root reported CI39432791404 on `dd7e54d08bdda0dfdf1a39610fc05310e486a909`: general browser 22 expected / 6 unexpected / 0 flaky / 0 skipped; each failure occurred on retry 0 and 1. Existing 21 journeys and new Upgrade-E02 passed. Full integration counted 1,873 total / 1,868 passed / 4 failed / 1 pending; direct recovery separately passed 1 / 0 skipped. Required pilot performance did not execute after integration failed; the non-gating auth baseline is not pilot performance evidence. These failed results remain failed history.

Native receipts: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39432791404-browser-native/general-browser.json` SHA256 `457C134A364C379421E6CD7C9B306B62E17B8FB97B7617AC45CB34668B189923`; `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39432791404-integration-native/full-integration.json` SHA256 `A58C2FD7691518112BD1EA63086868C8BF7C5B38A45DDCF2F80F905F051FE2BC`.

Causal browser repairs: Consumer-E01 compares exact parsed microsecond UTC instants instead of serialized fractional-width text, retaining persistence readback and interval assertions. Consumer-E02 gives its distinct supplemental checked read a fresh command ID; the original saved/retried identity remains immutable. Consumer-E03 explicitly supplies valid earliest/date fixtures and selects a real eligible assignee before requiring successful checked preview. Consumer-E04 also selects a real assignee for each new draft and requires preview-ready before its canonical fold/default/user-edited assertions. Upgrade-E01 uses accessible role/name selectors for required fields and compares every access-window instant exactly. Upgrade-E03 clicks the actual scoped header close control, preserving denial, unchanged state and recovery assertions without forcing a backdrop click.

Causal integration repairs: the old current-receipt binding assertion now expects approved v4/v2 literals; genuine obsolete-version denial/stale tests remain. Both C01 card kinds retain all scalar/relationship checks and separately compare access-window counts and exact instants. The inferred timestamp mismatch follows the inspected canonical writer contract; native JSON did not serialize an actual/expected delta. C05 retains successful advisory/no-new-conflict save and missing-input/T0 checks, asserts empty eligible-pool unknown at the pure boundary using otherwise complete real checked facts, and separately requires actual checked empty-assignee rejection with an unchanged full snapshot. No production validation was relaxed.

Affected lint and full typecheck native 0; collection only: 58 existing booking-editor plus 27 consumer integration cases (85), and 7 essential browser cases. Logs: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-164-ci-fix-lint.log`, `kopplas-164-ci-fix-typecheck.log`, `kopplas-164-ci-fix-int-collection.log`, and `kopplas-164-ci-fix-collection.log` in that folder. No timeout/retry increase, skip, lossy time comparison, assertion-failure deferral, production/SQL/auth/environment/dependency change or managed runtime launch occurred. Root owns the new exact-head integration/browser/performance gate; this test repair is not passing runtime evidence.

Same independent High narrow causal review completed: no consequential issue; exact UTC comparisons, immutable save/retry identity, persistence/authority checks and invalid-candidate no-write assertions remain. Receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-4-review-c2eea236-b5c7-4e65-b9d4-bb296d96e162/targeted-ci-fix-review.txt` (actual collaboration PASS relayed by parent, bound to DD1DFF91 inventory; receipt hash not yet supplied). Runtime and performance remain pending.

## Second Exact-Head Browser Failure and Source-Contract Repair

CI39435738491 browser receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39435738491-browser-native/general-browser.json`, SHA256 `23A7B6F0C05907EA64F5A97ED9FC8057A8A033351538712F71FA4C51CE2E45F2`, checkpoint `6260c5a2544dc0999cc9700935edcd4e5cce54ac`. It reports 26 expected / 2 unexpected / 0 flaky / 0 skipped; Consumer-E01 and Upgrade-E01 failed both attempts. Root reports separate recovery 1 passed; the database run was still running at the initial repair boundary. Its subsequently confirmed result and pilot performance are recorded below; the overall run remains failed.

Consumer-E01's native diff showed four old Oct12/13 outside-work-hours/over-capacity rows becoming an empty set. The fixture creates those bookings without weekly hours, then this test installed Mon–Fri08–16 after its three checked card writes. The schedule RPC updates hours/audit without refreshing derived conflicts; the later normal booking commit recomputes the complete signed tenant conflict set and removes obsolete keys. The now-covered Oct12/13 08–09 local bookings therefore correctly lose those conflicts. The repair moves that same schedule arrangement before the existing three checked card writes, whose full refresh establishes a stable baseline before the browser mutation. It explicitly requires zero baseline conflicts and retains the whole before/after conflict equality, exact UTC/persistence/default/edit/hint and reopened-duration assertions. No row filtering, conflict deletion or baseline moved past the save under test is introduced.

A single bounded audit covered every remaining Upgrade-E01 field and assertion against JobCardForm, EntityFilePanel, the operational card, member/work-order rows and upgrade contracts. Both wrapping Kund/Anläggning labels include select option descendants; exact getByLabel text matching is unsuitable. Both now use the actual accessible combobox names, following the established jobs-depth test. Separate primitive labels, required text controls, checkbox/window/dependency hooks, permitted text/plain upload, file region/status/list rows, Projekt/Pågår/member/work-order selectors, whole child/card preservation and single event/audit checks match their source contracts and remain required. This audit is not execution proof of the remaining journey.

Affected lint and full TypeScript native 0; native collection 7 / 2 files. Logs: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-164-ci2-fix-lint.log`, `kopplas-164-ci2-fix-typecheck.log`, and `kopplas-164-ci2-fix-collection.log` in that folder. No production/SQL/helper/card-command/environment/dependency changes, forced clicks, timeout/retry increases, skips or weakened preservation assertions occurred. Same-High narrow causal review and new exact-head CI remain required; no further broad review or blind CI retry is substituted for diagnosis.

Same independent High latest CI2 causal review qualified PASS on 373AF3AC (three changed hashes / 43 unchanged dependencies): scheduling facts precede checked refresh and the tested booking, zero-baseline assertion strengthens whole conflict equality, and customer/site combobox checks remain. Receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-4-review-c2eea236-b5c7-4e65-b9d4-bb296d96e162/targeted-ci2-fix-review.txt`, SHA256 `BD8381BD1FEFAF17A542FE16D5474C6884E5CD4D792FB81A35707E6C5F9B7ADB`. Latest targeted findings are zero; this does not claim six-layer reexecution.

Root's actual second-CI database receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39435738491-integration-native/full-integration.json`, SHA256 `DA2D9268A1940E2D43FE85E55BB8A93E565B793B87F43810D967F88E3E3A4473`: 1,873 total / 1,872 passed / 0 failed / 1 ordinary physical-recovery skip, supplemented by separate recovery 1 passed / 0 skipped. Database log: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39435738491-db.log`, SHA256 `F300BA816E3A49A4F10F609E41E745F9DB615E5895AEED64816FFE1327F5F93E`. Actual pilot performance: 5 warmups / 25 measured, read p95 12.394076999999925 ms and bulk permissions p95 4.995358000000124 ms. Non-gating auth baseline is separate. These results bind checkpoint6260c5a2; overall CI failed two browser journeys, so the reviewed repair still requires new exact-head required CI. No done/development-complete/delivery-pass assertion is made.

## Third-CI Save-Outcome Evidence Gap

CI39438104931 browser receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39438104931-browser-native/general-browser.json`, SHA256 `B6E86D84BC143D8A469C6A2253C8F69AC1A8A1BA8B87504FE87E3FC896A368D0`, checkpoint `643274eb5eb59f3a4c22666250d31b3f5a880015`. It reports 27 first-attempt passes / 1 unexpected / 0 flaky / 0 skipped. Upgrade-E01 failed both attempts with requested title "Order card before upgrade" versus durable "Workshop rewiring"; HTTP200 does not identify an action result. No actual refusal code or visible form feedback was recorded by that assertion. All four Consumer cases, including stable conflict conservation, passed first attempt.

The bounded source audit traced the complete form assembly, action result mapping, closed TypeScript validator, checked related-row gates, snapshot/detector/finalizer and remaining card/child assertions. Intended scalar/date/window/address/type values and the arranged accepted customer/site/contact, active project-manager/role/dependency and existing booking parent relationships do not establish an invalid fixture or guard violation. The actual browser-submitted outcome remains unknown; no product cause is invented from the unchanged title.

The admitted change affects only editFullCard in the existing upgrade E2E: after the observed real response, wait for the unique form-scoped existing success-or-error feedback, include only its current user-safe visible text as assertion context, require job-card-save-status and "Jobbet är sparat.", then retain the exact durable-title poll and every full-card/child/source/event/audit assertion. This stronger acceptance assertion will expose a real refusal or distinguish a confirmed-save/readback defect in next exact-head CI. No raw action transport decoder, payload/proof logging, production debugging, authority injection, timeout/retry change or weakened check was added.

Affected-file lint and full TypeScript native 0; native collection 7 / 2 files. Logs: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-164-ci3-diagnostic-lint.log`, `kopplas-164-ci3-diagnostic-typecheck.log`, and `kopplas-164-ci3-diagnostic-collection.log` in that folder. Prior full verification/recovery counts remain retained at their actual heads; the third database lane was still running at the root's dispatch boundary. Same-High narrow diagnostic review is now qualified PASS; next exact-head diagnostic CI remains pending. This is an evidence-producing acceptance assertion, not a claimed fix of the unresolved save failure.

Latest same independent High diagnostic review qualified PASS on 6907A4 (two changed hashes / 44 unchanged dependencies): actual confirmed feedback precedes unchanged durable readback and preservation checks; only existing safe visible context is exposed, and no save-cause fix is claimed. Receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-4-review-c2eea236-b5c7-4e65-b9d4-bb296d96e162/targeted-ci3-diagnostic-review.txt`, SHA256 `E592516A78AFF520309D3EFC6DABFE38F9CE63CDFD825D2CA295DD882987C4BE`.

Third-CI database receipt: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39438104931-integration-native/full-integration.json`, SHA256 `550005B1EF9CC8A200C171C97D943D6604C0DE47648F64BAF0100C08B2E2034B`: 1,873 total / 1,872 passed / 0 failed / 1 ordinary physical-recovery skip, with separate direct recovery 1 passed. Database log: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39438104931-db.log`, SHA256 `A4BE5286D5B8C28EDF38D6BF93858C1D5F1E92CB6E33494DC75A91717DFD1CFE`. Actual pilot performance: 5 warmups / 25 measured, read p95 10.571949000000131 ms and bulk permissions p95 4.079482999999527 ms; auth baseline is separate and non-gating. These results bind643274eb; overall run failed one browser journey, the save cause remains unresolved, and next reviewed-head CI must execute the outcome diagnostic. No all-runtime-pass, done or delivery claim follows.

## Suggested Review Order

Author: Story16.4 implementation/fix author (Sol 6.1 High), preserving the bounded pure-module child's recorded arithmetic rationale.
Refreshed after the admitted third-CI save-outcome acceptance assertion against checkpoint `643274eb5eb59f3a4c22666250d31b3f5a880015`; original implementation baseline and intent are preserved.

### Follow confirmation and recovery in the actual upgrade dialog

The independent manager entry and truthful one-way consequences remain. Definitive refusals allow closing; unresolved outcomes retain the same request. Synchronous operation/generation guards and revision-aware transitions prevent stale read responses from resetting another operation.

- `src/components/jobs/JobDetailView.tsx:112` — `<JobUpgradeDialog`: connects manager detail to confirmation.
- `src/components/jobs/JobUpgradeDialog.tsx:20` — `async function refetch`: catches read failure and guards concurrent operations.
- `src/features/jobs/job-upgrade-domain.ts:35` — `export function canDismissJobUpgradeDraft`: distinguishes definitive refusal from uncertain outcome.
- `tests/e2e/jobs/job-upgrade.e2e.spec.ts:271` — `16.4-Upgrade-E03`: checks actual rejection and refetch recovery.
- `tests/e2e/jobs/job-upgrade.e2e.spec.ts:115` — `const outcome =`: requires actual form-confirmed save before durable readback, surfacing existing user-safe refusal feedback.

### Retain the same-row transactional and replay boundary

The SQL transition/audit and reverse-type invariant are unchanged by this fix batch. Valid-shaped stale-state tests now reach those existing checked guards directly rather than stopping at TypeScript shape validation.

- `src/server/commands/envelope.ts:98` — `"job.upgrade_to_projekt"`: retains independent Jobs.Edit admission.
- `supabase/migrations/20261020210000_e16_16_4_job_upgrade_and_scheduling.sql:314` — `create function public.upgrade_job_to_projekt_with_audit`: serializes current authority and atomic same-row persistence.
- `tests/integration/commands/job-upgrade.int.test.ts:46` — `const freshStale=`: reaches checked SQL with a valid stale hash.
- `tests/integration/commands/job-upgrade.int.test.ts:71` — `16.4-INT-U03`: asserts audit-fault rollback and exact retry.

### Bind current facts before retiring an authentic receipt

All nine semantic fields and the per-job card overlay remain bound by v4/v2 snapshots and current SQL recomputation. GCM authentication and current request/timing bindings precede stale-version classification; invalid signatures and foreign identities still receive denial, while genuine obsolete receipts reach the editor's refetch path.

- `supabase/migrations/20261020210000_e16_16_4_job_upgrade_and_scheduling.sql:26` — `'estimatedDurationMinutes'`: includes checked per-job semantic facts.
- `src/server/commands/jobs/card-facts.ts:23` — `const own =`: overlays only its proposed job.
- `src/server/bookings/editor-preview.ts:44` — `export function assertEditorReceiptCurrent`: checks identity and timing before semantic retirement.
- `tests/unit/server/bookings/job-scheduling-protocol.test.ts:67` — `16.4-F04`: separates authenticated stale receipts from denial.
- `tests/integration/commands/booking-editor.int.test.ts:101` — `engineVersion: "booking-conflicts-v4"`: retains the whole current receipt binding contract with v4/v2, alongside the separate obsolete-proof negatives.

### Preserve start and end provenance through actual editor changes

Only untouched create defaults follow earliest or selected-job duration; CRM removal gets the honest fallback. Original canonical fold starts survive, and default refresh compares UTC instants even when wall-time text matches. The actual late-options branch retains its sequence guard, now covered by a NEW-draft browser case.

- `src/features/jobs/job-scheduling-consumers.ts:48` — `input.interval.startProvenance === "derived"`: bounds only an untouched derived start.
- `src/components/resources/BookingEditor.tsx:79` — `function defaultInterval`: retains canonical untouched starts and updates derived intervals.
- `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:279` — `16.4-Consumer-E03`: checks current earliest, CRM fallback and late options.
- `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:314` — `16.4-Consumer-E04`: checks canonical instants through actual DST controls.

### Keep optional demand calculation exact and bounded

The approved formula and matched pool/window remain unchanged. Whole-window actual overlap aggregation is algebraically identical to summed day clipping; the existing daily capacity debit is affine. Complete calculations remain exact; an unavailable optional calculation returns no numbers and cannot add an essential preview/save block.

- `src/features/scheduling/job-demand-advisory.ts:25` — `MAX_CAPACITY_DAY_PEOPLE`: bounds optional computational work without changing valid fields.
- `src/features/scheduling/job-demand-advisory.ts:73` — `capacityHundredths-=occupied*HUNDRED`: debits exact actual occupancy once.
- `tests/unit/features/scheduling/job-demand-advisory.test.ts:147` — `16.4-F03`: covers both instant boundaries and centuries-window availability.
- `tests/integration/commands/job-scheduling-consumers.int.test.ts:276` — `16.4-INT-F01`: asserts real preview and save remain usable.

Evidence and limits: the Implementation Evidence and Round 1 Causal Patch Evidence sections preserve actual commands/counts and the AC01–07 mapping. F01 plus Upgrade-E03 target patches 1–3; F02 plus Consumer-E01/E03/E04 target patches 4–7/12–14; F03/INT-F01 target patches 8–9; F04/INT-F02 target patch 10; valid-hash INT-U02 targets patch 11. Original upgrade preservation/concurrency/revocation/audit and mixed-job/current-fact proof assertions remain intact. New browser/integration cases are collected, not locally executed. Same independent High targeted source/fix reviews are qualified through the recorded unchanged-dependency union. CI39432791404 full verification and separate direct recovery passed, while its required integration/browser lanes failed. The first four-test-file repair has qualified same-High narrow review. Second-CI source-proven arrangement/selector repairs preserve the original assertions and have qualified same-High narrow review. The second CI database/direct recovery/pilot performance passed as recorded; its overall result remains failed on two browser cases, and new exact-head required CI remains pending. The third CI leaves one unresolved full-card save outcome; the strengthened acceptance assertion has qualified narrow review and awaits diagnostic execution. No development-complete or release-ready assertion is made.
