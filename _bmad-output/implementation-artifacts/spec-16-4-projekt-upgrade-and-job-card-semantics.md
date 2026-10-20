---
title: 'Story 16.4 — Projekt Upgrade and Job-Card Semantics'
type: 'feature'
created: '2026-10-20'
status: 'blocked'
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

**Problem:** Jobs currently have both kind values and the complete scheduling source fields, but there is no checked one-way upgrade and duration, crew/travel, planning dates and customer presence do not yet reach their required booking consumers. Storage or full-card display alone cannot close TR08–10 or TR13–16.

**Approach:** Add a dedicated, atomic manager-authorized same-row order-to-projekt operation and complete the actual job-card/booking-editor consumers using checked per-booking job facts. Keep the existing container, child identities, independent consumer permissions and one coordinated facts/proof/current-commit boundary.

## Boundaries & Constraints

**Always:** Keep the same job ID, lifecycle status, tenant/customer/source provenance, bookings, members, work orders, files and old/new dependency rows. Admin/Projektledare authority gates upgrade/full-card writes; designation alone adds neither. The exact downgrade result is `JOB_TYPE_DOWNGRADE_FORBIDDEN`, enforced below application callers. Current actor/tenant/role/target state and canonical request identity are checked on initial mutation and replay; one successful upgrade emits one job event and one audit atomically, and audit failure rolls back all writes. Preserve old creation APIs, order-only creation and existing card type-equality guards. Protected money/auth/private-person fields remain structurally absent without independent entitlement. Scheduling source facts are per evaluated booking's actual job; null/unavailable differs from recorded-empty and known false.

**Block If:** The project-only field disposition or duration/crew/travel units and estimate-versus-booked allocation remain unresolved. These are material intent gaps, not presentation defaults. Also stop any affected operation if a concrete authorized source/proof contract cannot be preserved; report its exact owner/path/invariant rather than inventing a whole-E15 gate.

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
| Capacity estimate | Duration D, crew N, travel T; split/repeated bookings | Must use the explicitly approved formula and allocation, without double charging actual occupancy | Pending owner decision below; no formula selected by this draft |

</intent-contract>

## Code Map

Current source is pinned to `2d002970fcb112db8d480068443a0cce2577bd5b`; this is planning inspection, not new execution evidence.

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

1. Resolve only the three explicit owner choices below. Do not implement policy-dependent arithmetic or fabricate project-only columns while this spec is blocked. All remaining tasks describe the bounded intended implementation after an approved ready plan.
2. New `src/features/jobs/job-upgrade-domain.ts`, `src/server/commands/jobs/upgrade-job-to-projekt.ts`, `job-upgrade-db.ts`; existing `src/server/commands/jobs/index.ts`, `src/server/commands/envelope.ts`, `envelope-core.ts`, `command-errors.ts`, `src/features/jobs/actions.ts` — dedicated upgrade command/action and safe exact downgrade error. Reuse independent Jobs.Edit manager admission and checked SQL current authority; leave `job-command-scope.ts`'s closed lead exceptions unchanged.
3. One fresh CLI-generated `supabase/migrations/*_e16_16_4_job_upgrade_and_scheduling.sql` (logical proposal only) — append dedicated event CHECK/checked upgrade RPC, current-role/job locks, request replay, audit atomicity and database one-way type guard. Keep all old writers/source locks. If owner chooses extra project-only data, name its exact concrete constraints before approval; no placeholder column or premature E17 payment schema.
4. New `src/components/jobs/JobUpgradeDialog.tsx`; existing `JobDetailView.tsx`, `src/features/jobs/actions.ts`, `types.ts`, `read.ts` — usable authorized order-only confirmation, current-kind result/readback and event label. Explain the one-way kind change honestly: members/work orders already exist for both kinds; payment/economy features remain separately unavailable until their modules ship. Retain entered state on failure and show success only after persistence.
5. New headless `src/features/jobs/job-scheduling-consumers.ts`; existing `src/features/resources/booking-action-state.ts`, `bookings-read.ts`, `booking-actions.ts`, `src/components/resources/BookingEntry.tsx`, `BookingEditor.tsx`, `src/app/(app)/jobs/[jobId]/page.tsx` — safe checked selected-job hints, new-only duration default with explicit interval provenance, earliest-bounded suggestion/context, distinct desired/latest warnings and presence true/false/unavailable. Preserve edited intervals, newer drafts, immutable uncertain submissions and independently checked booking authority. Do not substitute a new isolated widget for the actual editor.
6. Coordinated High facts/proof unit: `src/features/scheduling/types.ts`, `capacity.ts`, `conflicts.ts`; `src/server/bookings/conflict-facts.ts`, `conflict-attestation.ts`, `editor-preview.ts`, `save-with-conflicts.ts`; `src/server/commands/jobs/card-facts.ts` and the one new migration — include every output-affecting approved scalar in checked SQL facts and candidate-card overlay, canonical digest/snapshot and commit-time current-fact recomputation. Keep actor/tenant/action/candidate/expiry/request/review binding, whole-group selective review, replay/current-authority and atomic derived-conflict refresh. Proposed semantic version transition is booking-conflicts-v4 and, if rules semantics change, stockholm-capacity-v2; replace TS and both actual booking/card SQL finalizers coherently and reject correctly signed obsolete v3 claims/receipts. Preserve the separate job-card HMAC domain; no new secret family. Defaults/hints never become caller-authoritative facts. Expose new desired/latest/advisory-demand semantics as distinct semantic advice, preserving existing conflict-review rules; do not silently add override reasons or hard save blocks.
7. Tests: new `tests/unit/features/jobs/job-upgrade-domain.test.ts`, `job-scheduling-consumers.test.ts`; `tests/integration/commands/job-upgrade.int.test.ts`, `job-scheduling-consumers.int.test.ts`; `tests/e2e/jobs/job-upgrade.e2e.spec.ts`, `job-scheduling-consumers.e2e.spec.ts`. Extend bounded current `tests/unit/server/bookings/job-facts.test.ts`, `tests/integration/commands/job-booking-facts.int.test.ts`, `tests/support/jobs-depth-atdd.ts`, `job-booking-facts-atdd.ts`; `tests/unit/features/scheduling/capacity.golden.test.ts`, `conflicts.test.ts`, `batch-conflicts.test.ts`; golden `tests/fixtures/golden/scheduling/capacity.json`, `conflicts.json`, `regressions.json`, `dst.json`. Bind approved arithmetic, null/zero, split/repeated/actual occupancy, DST/day clipping, mixed jobs, explicit interval retention and current-fact/date/crew/travel/presence changes.
8. Preserve fail-loud exact ACL/role inventory through bounded `tests/integration/rls/migration-reset.int.test.ts`, `role-harness.atdd.int.test.ts`, `tests/support/authz/role-harness.ts`, `tests/unit/server/commands/envelope-core.test.ts`, `tests/unit/server/authz/command-enrollment.test.ts`. Add only upgrade/protocol cases, not global grants or table enrollment. No new tenant table/nav/module is implied. `package.json::test:smoke` appends the two actual new essential E2E paths before the trailing reporter, preserving all existing arguments/dependencies/lockfiles/CI workflow.
9. Implementation author writes exactly one final Suggested Review Order with actual entry/checked authority/SQL/proof/current-consumer/test stops and verified line anchors, using `docs/process/review-order.md` and the section scaffold. This planning artifact does not manufacture a completed trail or execution results.

### Acceptance Criteria

- **AC01 / TR10:** Given a current authorized manager and an order, when actual confirmation invokes upgrade (including concurrent requests, response-loss replay and injected audit failure), then same-ID type transition, one event and one audit commit together or nothing does; existing status, source refs, bookings, members, work orders and files remain identical.
- **AC02 / TR10:** Given every seeded/multi-role actor, current revocation and each alternate/direct SQL writer, when upgrade/downgrade/replay is attempted, then only independently authorized managers can upgrade, no caller can downgrade and authorized reverse attempts return JOB_TYPE_DOWNGRADE_FORBIDDEN; already-projekt is idempotent and confirmation is truthful, with no downgrade control.
- **AC03 / TR08–09:** Given the explicit approved project-only disposition and either job kind, when the actual full card is created/edited/read, then all §8.4 fields, the existing responsible lead and actual WO dependencies are usable/persisted without duplicate storage, protected fields remain absent and any concrete project-only validity is database-enforced. No unnamed fields or E17 implementation are credited.
- **AC04 / TR13:** Given a known estimate and a new job-connected booking without an explicit end, when the actual editor opens/previews/saves/reloads, then default length consumes the selected job estimate; edit/existing/explicit intervals remain unchanged and missing estimate preserves documented fallback without inventing a known estimate.
- **AC05 / TR14:** Given the owner-approved units, arithmetic and allocation, when actual job-bound planning/capacity and booking preview/save run, then duration, crew multiplier and travel all contribute exactly as approved against real schedule availability; missing values stay unknown and existing/split/repeated occupancy is not double charged. Golden fixtures and real consumer readback are required; formula remains an explicit blocked decision below.
- **AC06 / TR15:** Given distinct earliest/desired/latest dates across mixed jobs, when actual suggestions/editor preview/save or relevant facts change while a proof waits, then earliest bounds suggestions, desired miss is a soft warning, latest miss is a distinct breach and obsolete/other-job facts cannot commit; no automatic optimizer or new hard rejection is introduced.
- **AC07 / TR16:** Given selected-job presence true, false or unavailable, when actual job entry and selection/change render the editor, then the current checked selected job's requirement is visible with the correct distinction; another job's/caller's value cannot bleed through. Essential connected360×640 browser tests prove changed flows, failures/retry/refetch and server-confirmed persistence.

## Spec Change Log

## Review Triage Log

## Design Notes

Current approved defaults remain: low/normal/high/urgent priority (normal default), canonical nullable dates, positive integer duration/crew, nonnegative travel, structured facility-derived location or override, real work roles, absolute access windows and member-derived lead. Presentation may use the existing design system with proportional headless domain/state/validation/actions separation; no new material planning arithmetic is hidden as a UX default.

### Material owner choices — pending, not approved

1. **TR08:** Approve no new unnamed project-only scalars in16.4; all §8.4 fields remain valid for both kinds; actual payment-plan children/fields and their SQL projekt gate remain E17.2. Alternative: name each extra project-only field/type/meaning now.
2. **TR14 travel meaning/formula:** D = on-site elapsed minutes, N = crew, T = planned travel. Choose per-person total travel `N × (D + T)` or aggregate crew travel `N × D + T`. Neither is selected by this draft.
3. **TR14 allocation:** Approve advisory whole-job demand versus remaining window capacity, without an additional occupancy debit, repeated whole-job charges per split/repeated booking, or a new hard save block; otherwise specify the different allocation.

Evidence: architecture:453/456/503 leaves project-only identity unnamed; transfer matrix:18 expressly leaves its disposition unresolved. Architecture:473/478/482 and owner input list `docs/discovery/phase-b-owner-answers-2026-07-26.md:644–669` require duration/crew/travel but choose neither units nor allocation. Transfer matrix:24/55 requires approved concrete arithmetic before ready. Existing `capacity.ts:86–91` and `conflicts.ts:47–60`, `:99–102` use actual per-person booking overlap; they cannot resolve estimate allocation. Root presented these three concrete questions on2026-10-20; no answer is inferred from elapsed time.

### Exact prospective shared handoff and resource boundary

- Scheduling shared symbols: `src/features/scheduling/types.ts::JobSchedulingInputs`/rules version, `capacity.ts` input validation/approved demand helper and `src/features/scheduling/conflicts.ts::detectAllBookingConflicts` per-booking evaluation. Preserve E15 actual interval arithmetic and all series/resolver/time-report contracts.
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

Status: blocked
Blocking condition: intent gap

Planning only. Renderer executed once from installed own-worktree skill, snapshot96e8da50b6e5096e00c4. Both context-free Sol6.1High read-only source explorations completed; root performed required bounded index refresh and confirmed clean HEAD2d002970fcb112db8d480068443a0cce2577bd5b. Cached Epic16 context was valid; completed16.3 continuity was loaded. No product/test/SQL/resource/Git/state writes or new execution claims. Ready-for-development self-review fails completeness/sufficiency/coherence only on the three explicit material choices above. Actionable resolved tasks, seven surface-anchored Given/When/Then ACs, precise current-source map and prospective shared handoff are retained. No implementation is admitted. Resume condition: root supplies verified direct owner answers for project-only disposition, travel units/formula and whole-job allocation, then invokes a fresh clarified plan preserving this blocked history. On Complete preserved this planning-only result; no completed implementation review trail was manufactured.
