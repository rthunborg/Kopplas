---
title: 'Story 16.4 — Projekt Upgrade and Job-Card Semantics'
type: 'feature'
created: '2026-10-20'
status: 'ready-for-dev'
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

Status: ready-for-dev

Planning only. Fresh renderer executed exactly once from installed own-worktree skill, snapshot96e8da50b6e5096e00c4. Root index refresh native0 confirmed clean HEADebd03a4e4c5226a2b3926bcdcbd2c2a29d18e776. Both completed context-free High explorations were reused after metadata-only source comparison; same High consumer synchronously verified the approved matched-pool/window/occupancy algorithm. Valid cached context and16.3 continuity retained. Original blocked artifact unchanged. Seven ACs/TR08–10/TR13–16 retain actual consumer/proof/verification/shared handoff, with all three former choices explicitly approved. No implementation, runtime, test execution, SQL/migration, Git/state/ledger write or completed review trail is claimed.

Ready-for-development self-review passed: actionable exact paths, dependency order, seven surface-anchored Given/When/Then ACs, concrete approved arithmetic/allocation, coherent shared facts/proof boundary and no unresolved material choice. HALT after planning. Blocking condition: none. On Complete preserves this planning result without fabricating implementation evidence or a final author trail. Next phase is root-pinned Phase4 ATDD; implementation is not performed in this invocation.
