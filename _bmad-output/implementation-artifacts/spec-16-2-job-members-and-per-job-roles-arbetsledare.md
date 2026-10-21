---
title: 'Story 16.2: Job Members and Per-Job Roles (Arbetsledare)'
type: 'feature'
created: '2026-10-19'
status: 'blocked'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/epic-16-context.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/development-completion-policy.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/agent-model-routing.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/review-order.md'
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Jobs have structural membership and relationship-based reads, but no checked membership/designation mutations or per-job operational authority. Story 16.2 must deliver the workspace member list and responsible-Arbetsledare picker while preserving tenant isolation and independent economic entitlements.

**Approach:** Extend the existing job_members foundation with checked, audited job-scoped mutations and actual workspace actions. Resolve the material cardinality/writer/operation contract before implementation; use no tenant-wide Arbetsledare role or global manager-helper widening.

Invocation intent, verbatim:

```
Story 16.2 "Job Members and Per-Job Roles (Arbetsledare)" (sprint-status key `16-2-job-members-and-per-job-roles-arbetsledare`, epic 16). Branch `codex/epic-16-jobs` is the intended branch for this work. Halt after planning.
```

## Boundaries & Constraints

**Always:** Support order and projekt. Assign in the job workspace, never Roller. Resolve the responsible picker from job_members among job members, with no second responsible-person column. Preserve composite same-tenant references, current actor/target eligibility, direct-DML denial, attributable atomic audit and revocation/replay checks. Any active tenant role may hold the designation; operational authority must remain job-specific, and money remains governed by independent tenant-role union. Preserve Montor member-OR-booking-assignee reads, both creation paths, stable job/booking IDs and accepted-source immutability. Connected 360x640 actions require explicit failure/retry and server-confirmed success.

**Block If:** The owner has not settled designation cardinality, membership/designation writers and the exact job-operation allowlist. The proposed choices below are not authority. No implementation starts from this blocked spec.

**Never:** Invent a tenant-wide Arbetsledare role; widen Jobs.Edit, Bookings.Manage, Files permissions, story_11_2_assert_job_roles or booking_detection_gate_internal globally; equate presentation flags with authorization; give leadership an economic grant; expose arbitrary tenant people/CRM through a picker; add a parallel membership/responsible-person store; change historical migrations. No later work-order, upgrade, lifecycle/completion, consumption, workspace-shell, Phase C, offline, AI, portal or deployment scope is admitted.

## I/O & Edge-Case Matrix

| Scenario | Input/state | Required outcome | Failure posture |
| --- | --- | --- | --- |
| Member lifecycle | Current eligible person and entitled writer on either job type | Checked add/change/remove and exact overview reload; reactivate existing unique membership row | Foreign/inactive/spoofed actor or target denied without partial membership/audit |
| Responsible picker | Current job members; select, replace or clear | Stored designation and displayed value agree; no tenant Roller write | Cardinality/writer choice R1 remains unresolved |
| Job-scoped action | Same actor designated on A but not B | Only explicitly approved operation on A; direct RPC on B denied | Operation allowlist R1 remains unresolved; default deny |
| Revocation race/replay | Authority removed while a request waits or before replay | Recheck current locked authority; denial leaves business/audit state unchanged | No historical success may authorize a current revoked actor |
| Multi-role economics | Designation plus independently seeded tenant roles | Role union retained; no protected values added solely by designation | Do not let operational edit metadata activate broad CRM/acceptance reads |
| Phone failure | Connected phone, transient mutation failure | Suitable draft retained, reachable retry, success after durable response and reload | No optimistic saved state or offline queue |

</intent-contract>

## Code Map

All paths below are relative to this worktree. Observations are read-only at 70ec78ee3ce7b4e2beb48f7a724e74359e7548ac; proposed writes are not implementation allocation.

- `_bmad-output/planning-artifacts/epics-phase-b.md:1587` and `architecture-phase-b.md:107,109,144,179,484`: per-job role authority; any tenant roles may hold designation; broad crew/planning/documentation/consumption language is not an enumerated command grant.
- `_bmad-output/planning-artifacts/ux-design-specification-phase-b.md:336,342`: responsible picker among job members; overview lists members and job roles.
- `_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md:13-15,29-35`: TR03-05 and the four retained 16.2 acceptance obligations.
- `supabase/migrations/20261019133151_e16_16_1_job_depth.sql:25-33,57-85`: existing unique tenant/job/person membership, designation member/arbetsledare, archival, active identity relationship helper and SELECT-only forced RLS. Multiple leads are mechanically possible; that is not a product decision.
- Same migration `:117-118`: SQL responsibleArbetsledare currently derives an array of person IDs, not a singular chosen-policy contract or implemented picker. Current DTO/UI does not expose it.
- `src/server/commands/jobs/jobs.ts:45-82`: job.update combines title, lifecycle status and planned start/end. `save-job-card.ts:13-40` replaces a full card through snapshot/finalize. Neither is a safe automatic lead grant.
- `src/server/commands/envelope.ts:95-111`, `envelope-core.ts:176-186`, `src/server/authz/permission-matrix.ts:71-80`: closed enrollment/capability gate precedes validation; Jobs.AssignUsers is closed, existing Create/Edit are manager-only. `job-access.ts:3-7` is presentation metadata.
- `supabase/migrations/20260907171252_role_aware_phase_a_policy_evolution.sql:1644-1681`: checked manager-only original job creation/update and auth.uid actor binding. Preserve these original APIs.
- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:216-267,299-355`: existing serialization, ordered identity/reference locks, current authority/replay and signed card protocol. Full job-row baseline already makes a planned-date change stale an outstanding card proof.
- `supabase/migrations/20261006122441_booking_conflict_detection_integration.sql:5-16`: shared manager-only detection gate also acquires the tenant lock. Reuse serialization separately, not its global authorization override.
- `src/features/jobs/read.ts:224-244`, `types.ts:85-126`, `src/server/read-models/my-jobs.ts:2-28`: thin operational projection; separate operational edit from economic/broad-read entitlement. Designated Saljare/Ekonomi need own-job access without widening unrelated rows.
- `src/components/jobs/JobDetailView.tsx:55,291-301`, `JobCardForm.tsx:105`, `src/app/(app)/jobs/[jobId]/page.tsx:76`: current manager-style editor/PL field; membership UI is missing.
- `src/server/authz/phase-a-surface.ts:11-52` and `src/components/app-shell/RouteAccessBoundary.tsx:20-26`: role-only navigation/route admission must agree with any current designation-scoped read exception; preserve landing behavior.
- `tests/support/job-booking-facts-atdd.ts:77` and `supabase/migrations/20260910165124_admin_user_management.sql:50-72`: reusable controlled tenant-lock waits/current membership lock ordering.

## Tasks & Acceptance

This is safely resolved planning plus an explicit blocked policy choice, not a ready implementation checklist.

**Execution after R1 is settled:**

1. `supabase/migrations/` -- create one new forward job-members migration through the established CLI only after implementation admission; capture a unique later identifier and actual path before SQL. None is reserved or created here. Add only approved checked membership/designation/date operations, current identity/target checks, ordered tenant/job/member locks, generic errors and atomic audit. Keep direct authenticated member DML denied and historical migrations unchanged.
2. Proposed `src/features/jobs/job-members-domain.ts`, `src/server/commands/jobs/job-members.ts`, `src/server/commands/jobs/job-plan-dates.ts`, plus existing `jobs/index.ts` -- bounded typed validators and dedicated operations with the selected owner matrix; dates-only means planned_start_date/planned_end_date, not a full-card update. Names are prospective implementation paths, not admitted product writes.
3. `src/server/commands/envelope.ts`, `src/server/authz/job-access.ts`, `permission-matrix.ts` -- enroll job-scoped commands and separate current relationship authority from global role grants. Resolve the target before any scoped authorization and recheck it in SQL; do not rely on UI flags or globally permit existing manager commands.
4. `src/features/jobs/actions.ts`, `read.ts`, `types.ts`, `src/server/read-models/my-jobs.ts` and job-specific SQL reads -- expose exact active member/designation state, narrow eligible picker options and scoped entitlements. Preserve the existing ordinary assigned-read union, own-designated-job access for any eligible tenant role, independent money union and structural omission. Do not broaden general person-profile/CRM reads.
5. Proposed `src/components/jobs/JobMembersPanel.tsx`, existing `JobDetailView.tsx`, job detail route and necessary narrowly scoped jobs route admission -- usable overview/member/picker and, only if approved, dates-only action; reuse existing design-system controls and headless domain/actions. Preserve manager full editor and current phone flows.
6. Proposed `tests/integration/commands/job-members.int.test.ts`, `tests/integration/rls/job-members.rls.test.ts`, `tests/e2e/jobs/job-members.e2e.spec.ts` -- actual checked mutations, picker persistence, designated A versus B/direct-RPC pairs, multi-role/foreign/inactive actors, atomic replacement/rollback, current revocation after lock wait and replay. Reuse `tests/support/jobs-depth-atdd.ts` and its real synthetic local fixture initialization.
7. Existing `tests/support/authz/role-harness.ts`, `tests/integration/rls/role-harness.atdd.int.test.ts`, `tests/integration/rls/jobs-depth.rls.test.ts` -- extend only named jobs cases/ACL assertions; preserve direct-write/self-elevation/foreign/private-helper negatives. Do not mechanically edit H4 table enrollment: job_members is already enrolled.

**Preserved acceptance obligations:**

- **AC01/TR03:** Given an entitled job manager and eligible current person, when actual workspace assignment/change/removal runs, then membership/role and attributable audit commit atomically for either job type with same-tenant references, and overview reloads that state.
- **AC02/TR04:** Given job members, when the actual responsible-Arbetsledare picker saves/replaces/clears, then only this job's job_members designation changes and the responsible field reloads from it, with no independent column or tenant-role mutation. R1 must settle cardinality and writers first.
- **AC03/TR05:** Given an actor designated on A but not B, when an approved operational command and its checked RPC run on each, then only A is authorized and no new economic visibility arises. R1 must enumerate the permitted operations first.
- **AC04/TR05:** Given every seeded role, multi-role, foreign/inactive actor/member and revoked designation, when assignment/read/operational/direct-table requests run, then positive and negative pairs prove matrix, row scope and current SQL authority agree. Include controlled races, unchanged denied outcomes/audit and current-authority replay checks.

## Spec Change Log

## Review Triage Log

## Design Notes

### R1: material policy awaiting the human

Approved sources do not state an at-most-one lead invariant or enumerate membership writers and exact operational commands. Existing schema permits multiple leads; current empty AssignUsers grants denote unimplemented authority, not an owner answer. No choice below is adopted.

The exact pending question is: may each job have zero or one active-member Arbetsledare, with only tenant_admin/Projektledare designating/revoking, and that lead able to manage ordinary crew and edit only planned start/end dates? Alternative: managers manage ordinary crew too, while the lead edits only those dates. A custom answer must name the differing grants/cardinality.

Approval of that question does NOT grant priority, duration, crew-size, travel, location, customer-presence, work-role, access-window or dependency mutations. Existing full card, title/CRM/responsible-PL, lifecycle/completion/cancellation/archival, creation and upgrade remain manager-only or their existing later-story authorities. No documentation/consumption operation is invented; broad architectural consumer obligations remain visible for their approved consumer work.

Maintainable defaults that do not decide authorization: accessible explicit member list; picker among current members; explicit save/replace/clear; retained unsent input and retry; domain validation/actions separated from presentation. Removal is archival and reactivation reuses the existing unique membership row. The selected cardinality, concurrency response and writer matrix must become explicit before readiness.

### Concrete E15 recurrence overlap, not a dependency gate

The narrowed proposal needs no edits to booking_detection_facts_internal, snapshot_booking_conflicts, snapshot_booking_editor, finalize_booking_editor, snapshot_job_card, finalize_job_card, job_card_baseline_internal or TypeScript facts/proof modules. Booking facts contain required roles/windows, not job planned dates or memberships. Dependency warnings derive from current dates on read; dates-only writes need refresh, not a new conflict engine. The existing full-row card baseline already detects changed dates.

| Shared path | Proposed 16.2 change | Separate E15 recurrence work |
| --- | --- | --- |
| src/server/commands/envelope.ts | New membership/designation/dates-only rows; original update/card rows unchanged | createBookingSeries/updateBookingSeries rows |
| src/server/authz/permission-matrix.ts | Only selected job-scoped operation metadata; no tenant-wide lead grant | Any independently required series rows |
| tests/support/authz/role-harness.ts | Jobs/designation cases only | Series enrollment/read adapter |
| tests/integration/rls/role-harness.atdd.int.test.ts | Jobs member/designation fixtures/assertions only | Separate booking-series fixtures/table IDs |
| src/scope/manifest.ts | No necessary change: existing job_members enrollment | booking_series resources enrollment |
| tests/integration/rls/tenant-table-inventory.ts | No expected structural edit; only a proven job-member constraint fixture need could justify one | New series table metadata |

Schema/ACL/introspection gates run unchanged unless a concrete new entrypoint assertion is needed. Future SQL is a distinct forward migration. E15 reports its own 20261019180000_recurring_booking_series.sql reservation; this is coordination data only, not an inspected/adopted migration or permission. No 16.2 migration ID is reserved. No whole-E15 acceptance, renewed ACK or prior allocation question blocks this plan.

## Verification

Planning performed only renderer/context/source inspection and artifact checks; no test, migration, application build, runtime or browser was executed. Renderer ran exactly once successfully and emitted the pinned 96e8da50b6e5096e00c4 workflow. Root performed the required bounded index refresh and confirmed clean intended branch at 70ec78ee3ce7b4e2beb48f7a724e74359e7548ac.

Implementation verification, once admitted, retains current policy: ATDD before implementation and automate afterward (risk high); meaningful focused validator/authority tests; static/type/lint/full units/production build/containment; SUPABASE_TEST_REQUIRED=1 full integration/RLS, empty database migration/seed and direct recovery integrity with actual counts; controlled revocation/concurrency/atomicity/direct-RPC negatives; essential connected 360x640 member/picker/date/denial/retry smoke. Exhaustive browser/device/role matrices and screenshot/manual polish are tracked deferred release validation, not passing coverage. A real delivery JSON and root gate plus independent sensitive review are required before development completion. No release/merge/deployment approval is implied.

## Auto Run Result

Status: blocked
Blocking condition: intent gap

The written draft is unapproved. R1 requires a precise owner cardinality/writer/operation choice; it is not a technical dependency on E15. Requirements/source exploration was synchronous Sol6.1 High; existing16.1 completion/evidence and TR03-05 obligations are preserved. Future work-order/upgrade/workspace and economic consumers remain their existing story owners. No product/test/SQL/dependency/env/shared-state/ledger/Git or runtime changes were made.

Planning-only completion hook: loaded docs/process/review-order.md and preserved this blocked result; no completed implementation Suggested Review Order is fabricated. Resume the same plan after the owner answer is recorded and root authorizes the supported draft-resume transition; do not implement from this artifact.
