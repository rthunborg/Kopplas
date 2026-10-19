---
title: 'Story 16.2: Job Members and Per-Job Roles (Arbetsledare)'
type: 'feature'
created: '2026-10-19'
status: 'ready-for-dev'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/docs/process/development-completion-policy.md'
  - '{project-root}/docs/process/agent-model-routing.md'
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-16-context.md'
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Story 16.1 supplied relational job membership and designation metadata, but users cannot manage members or the responsible Arbetsledare in the job workspace. Designation currently grants no operational authority, leaving the approved Story 16.2 and TR03–05 obligations incomplete.

**Approach:** Deliver audited, tenant-safe member management, a singular responsible-Arbetsledare picker, and narrowly checked per-job authority. A job has zero or one current Arbetsledare, appointed or replaced by admins/Projektledare; the designated person may manage ordinary crew and planned start/end dates on that job. Provide usable Översikt controls while keeping domain rules, validation, actions, semantic projections and presentation separate.

## Boundaries & Constraints

**Always:** Job membership is a job-specific relationship, never a tenant role. Any active tenant role may hold designation. Admin/Projektledare retain their independently approved manager permissions. The lead-only branch permits ordinary crew membership changes and `planned_start_date` / `planned_end_date` only, on the current designated job. Designation requires a current eligible job member; same-tenant composite references, current actor/target membership and profile checks, authorization under locks, audit atomicity and current-authority replay checks apply to every mutation. Read and navigation admission must reach designated users of any tenant role without granting unrelated jobs or modules. Preserve the member-OR-booking-assignee My Jobs union, both job kinds, stable identities/bookings, checked SQL boundaries and structural omission of unentitled money.

**Block If:** An implementation requires authority beyond the dated owner grant, changing an unrelated consumer's permission, bypassing current SQL authorization, or a material contract that cannot be satisfied within this scope. Record the exact contract, path, owner, evidence, unblock condition and later integration/test action; do not manufacture a whole-E15 prerequisite. The previously unresolved cardinality/authority question is resolved by the recorded owner answer below.

**Never:** Grant lead-only authority to appoint, demote or replace a lead; self-elevation; job identity, CRM/customer/facility/contact or responsible-PL edits; full-card edits; priority, crew-size, travel, location, role requirements, access windows or dependency changes; lifecycle/completion/cancel/archive/upgrade; money permission; or general booking/documentation/consumption authority. Never widen `story_11_2_assert_job_roles` to grant the old mixed job/card/create operations. No legacy application evidence, Phase C surfaces, new dependency/secret settings or deployment. This planning run creates no migration or implementation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Crew management | Manager, or current lead on job A; eligible same-tenant person | Add/reactivate/remove ordinary membership on A; overview reflects server-confirmed state | Foreign/inactive targets and lead-only attempts to alter designation fail without writes |
| Responsible lead | Manager selects a current eligible member, replaces or clears | Zero or one designation; clear retains ordinary membership; reload resolves the same person | Stale or competing replacement rejected/refetched, never silently overwrites newer state |
| Lead boundary | Same actor leads A, has no relationship to B | Crew/date operation allowed on A only; direct SQL/RPC checks agree | B, another lead's designation and full-card/lifecycle payloads denied |
| Planned dates | Entitled actor supplies only nullable planned start/end | Existing date/range rules applied; only those two fields change | Invalid range or extra field rejected; retain draft and show retry/refetch path |
| Revocation / retry | Actor or target disabled, archived, removed or replaced while waiting; response lost | Revalidate current authority before commit and replay; one durable mutation/audit outcome | No stale authority or duplicate audit; actionable failure, no false success |
| Role union / privacy | Sales/finance/installer is designated; optional independent manager/money role | Own-job operational access plus independent existing role union | No broad directory/CRM reads or protected-money fields through designation |

</intent-contract>

## Invocation and owner decision

Fresh invocation intent:

> Story 16.2 "Job Members and Per-Job Roles (Arbetsledare)" (sprint-status key `16-2-job-members-and-per-job-roles-arbetsledare`, epic 16). Branch `codex/epic-16-jobs` is the intended branch for this work. Verified owner clarification dated 2026-10-19: a job has zero or one Arbetsledare, appointed or replaced by admins/Projektledare; existing money and other protected permissions remain unchanged. Arbetsledare manages ordinary crew and planned dates on their own job. This means current ordinary crew and planned start/end dates only; no lead-designation, full-card, lifecycle or unrelated consumer permission expansion. Halt after planning.

Root verified the direct human question/answer in recovery task `01a153e5-e143-7d61-b8c7-77b61e334730`, human turn `01a1557e-e736-71f1-a3fb-a5041dfa80db`, dated 2026-10-19. Question: “For Story 16.2, which job-lead permissions do you approve? In both options, a job has zero or one Arbetsledare, appointed or replaced by admins/Projektledare; existing money and other protected permissions remain unchanged.” Answer: “Arbetsledare manages ordinary crew and planned dates on their own job (proposed contract)”. This records root-verified provenance, not a new observation by this delegate.

The earlier blocked `spec-16-2-job-members-and-per-job-roles-arbetsledare.md` remains unchanged (SHA256 `762e120bba51a87edf919cd59abb5206e7d6c34b0420dfbe190f614c08533efa`). The workflow's non-draft collision route creates this `-2` file; it does not rewrite the old intent-gap HALT. Source revision: `291c7bf93295bc5f7378ac35faffc410c1c60421`. Story 16.1's completed contracts and evidence are reused as prerequisites, not counted as new 16.2 verification.

## Code Map

Paths and anchors below are investigation evidence, not directory-wide ownership grants. Two completed Sol 6.1 High explorations of governing requirements and actual contracts are reused; no material source change since their planning baseline was found.

- `_bmad-output/planning-artifacts/epics-phase-b.md:1585` — Story 16.2 membership, per-job operational role, same-tenant references, workspace assignment and positive/negative authorization acceptance.
- `_bmad-output/planning-artifacts/architecture-phase-b.md:107` and `:109`, `:144`, `:179`, `:484` — designation alongside tenant roles, job operations and responsible person. The dated owner grant narrows current operational writes; broader consumer obligations remain with their stories.
- `_bmad-output/planning-artifacts/ux-design-specification-phase-b.md` — reuse the existing job overview/member-picker design requirements; the architecture and approved owner decision govern authorization.
- `_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md:13` and `:29` — TR03–05 and their four destination acceptance obligations, retained below.
- `supabase/migrations/20261019133151_e16_16_1_job_depth.sql:25` — existing `job_members`, unique tenant/job/person relationship, member/arbetsledare designation and archive marker. Reactivate the existing row; do not duplicate identities. `:57` current relationship, `:69` `job_can_read`, `:79` forced RLS/SELECT-only boundary, `:117` current lead projection.
- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:216` and `:299` — transaction/lock ordering and current-authority replay checks; `:259` existing job-card baseline includes job state. Preserve these old RPCs and proofs.
- `supabase/migrations/20260907171252_role_aware_phase_a_policy_evolution.sql:1644` — global `story_11_2_assert_job_roles`; leave its old command callers manager-only. `:270` existing private audit writer is reused inside the business transaction.
- `supabase/migrations/20260910165124_admin_user_management.sql:50` — tenant-membership row locking is the revocation serialization boundary; a different advisory-lock namespace alone is insufficient.
- `src/server/commands/envelope.ts:95`, `envelope-core.ts:176` — closed command enrollment and early global capability gate. Add an explicit closed job-scoped branch, not a generic capability bypass.
- `src/server/commands/jobs/index.ts:7`, `jobs.ts:45`, `save-job-card.ts:13` — existing create/update/full-card commands have mixed authority and remain unchanged for lead-only users.
- `src/server/authz/permission-matrix.ts:71`, `job-access.ts:3` — currently tenant-role-only job capabilities; retain independent full-card/money manager flags while adding explicit scoped semantics.
- `src/features/jobs/read.ts:224`, `types.ts:85`, `src/server/read-models/my-jobs.ts:2` — money/CRM hydration depends on existing protected-money and manager-edit flags. Never reuse a new crew/date flag as full-card `canEdit`.
- `src/components/jobs/JobDetailView.tsx:291`, `src/components/jobs/JobCardForm.tsx:105`, `src/app/(app)/jobs/[jobId]/page.tsx:76` — overview/member controls belong alongside existing manager-only card editing, not inside a widened card form.
- `src/server/authz/phase-a-surface.ts`, `src/components/app-shell/RouteAccessBoundary.tsx:20`, `src/app/(app)/layout.tsx:68`, `src/app/(app)/jobs/layout.tsx` — role-only navigation/route gate currently excludes some eligible designated roles. Add trusted relational jobs admission only; preserve unrelated routes and E15 landing behavior.

## Tasks & Acceptance

### Execution, in dependency order

1. `tests/unit/features/jobs/job-members-domain.test.ts` (new), `tests/integration/commands/job-members.int.test.ts` (new), `tests/integration/rls/job-members.rls.test.ts` (new), `tests/e2e/jobs/job-members.e2e.spec.ts` (new) — ATDD the acceptance below using `tests/support/jobs-depth-atdd.ts`; activate real fixture calls lazily. Reuse `tests/support/job-booking-facts-atdd.ts` controlled transaction waits where needed. No module-level DB activity or new fixture family.
2. `src/features/jobs/job-members-domain.ts` (new) — closed, separately typed assign/remove/set-lead/planned-date inputs, date validation and semantic draft/error state; cover every matrix boundary. Unknown/extra fields fail closed. Maintain canonical dates/nullable semantics already used by jobs, without introducing new date rules.
3. `supabase/migrations/*_e16_16_2_job_members.sql` (one future CLI-named file), generated through the established CLI at implementation time — extend the existing table/predicates and add checked assignment/removal/designation/date RPCs. **No timestamp is reserved or migration created by this plan.** Validate chronology against E15's reported reservation `20261019180000_recurring_booking_series.sql`; choose a distinct later identifier when authorized. Enforce one unarchived designated row per tenant/job, same-tenant eligible references, current actor and target checks, and minimum grants. Existing duplicate active leads must fail migration explicitly rather than silently choosing a winner. Private helpers remain uncallable by authenticated clients; direct table mutation remains denied.
4. `src/server/commands/jobs/job-members.ts`, `job-plan-dates.ts`, `job-members-db.ts` (new), plus `src/server/commands/jobs/index.ts`, `src/server/commands/envelope.ts`, `envelope-core.ts`, `src/server/authz/permission-matrix.ts`, `job-access.ts` — enroll four dedicated operations as specified below. Preserve every existing command's fail-closed global gate. SQL revalidates the actor/tenant/job relationship in the transaction; a successful preliminary envelope check is not commit authority. Update exact enrollment/envelope tests in `tests/unit/server/authz/command-enrollment.test.ts`, `permission-matrix.test.ts`, `tests/unit/server/commands/envelope-core.test.ts` and `envelope-core-edges.test.ts`.
5. `src/server/read-models/job-members.ts` (new), `src/features/jobs/read.ts`, `types.ts`, `actions.ts`, `src/server/read-models/my-jobs.ts` — project current members, singular lead and separate `canManageCrew`, `canSetLead`, `canUpdatePlannedDates` semantics. Add only job-scoped eligible-person options with existing public display labels/IDs; no auth objects, email property or general directory capability. Preserve money omission and manager-only broad CRM/card hydration. Archive/inactive membership/profile must not project a current responsible lead.
6. `src/server/authz/phase-a-surface.ts`, `src/components/app-shell/RouteAccessBoundary.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/jobs/layout.tsx`, `src/app/(app)/jobs/[jobId]/page.tsx` — admit an authenticated current designated user to jobs navigation/own job via trusted server relationship facts. Keep global role helpers and every other route/landing unchanged. Test the relational exception and ordinary role paths in new `tests/unit/server/authz/job-access.test.ts` and existing `phase-a-surface.test.ts`.
7. `src/components/jobs/JobMembersPanel.tsx` (new), `src/components/jobs/JobDetailView.tsx` — usable Översikt member list, ordinary crew controls, manager-only responsible picker/clear and a dates-only lead editor. Reuse existing design-system fields, accessible labels and explicit server-confirmed success/failure/retry. Leave `JobCardForm.tsx` full-card policy unchanged. Load the frontend-component skill before UI implementation.
8. `tests/integration/rls/jobs-depth.rls.test.ts`, `role-harness.atdd.int.test.ts`, `migration-reset.int.test.ts`, `tests/support/authz/role-harness.ts` — extend only jobs-related assertions/fixtures and checked-RPC ACL inventory; retain provisioning, existing H4 and E15 coverage. Verify direct calls, child reads, money omission, multi-role unions and revocation races. New dedicated integration files own the transaction/audit scenarios.
9. Root-owned `package.json` verification prerequisite — coordinate appending `tests/e2e/jobs/job-members.e2e.spec.ts` to ordinary essential smoke before the trailing reporter option; retain both authentication specs and existing jobs-depth smoke. No workflow, dependency, lockfile or global CI-setting change is required. Run the required checks and independent High review before delivery; author the final review trail only after actual implementation evidence exists.

### Command and actor contract

The command names are bounded implementation design choices. They do not create new tenant-wide grants.

| Command | Admin / Projektledare | Current designated lead without independent manager role | Other actor |
| --- | --- | --- | --- |
| `job.member.assign` | Add/reactivate eligible ordinary member | Same, own designated job only | Deny |
| `job.member.remove` | Remove membership; removing current lead clears effective designation atomically | Remove ordinary member only; never alter designated membership | Deny |
| `job.lead.set` | Select current eligible member, replace, or clear | Deny | Deny |
| `job.plan_dates.update` | Update planned start/end | Same, own designated job only | Deny |
| Existing create/full-card/lifecycle/booking/doc/consumption commands | Existing approved consumer policy | Existing independent tenant/consumer permissions only | Existing policy |

Use the existing `job_members` designation as the sole responsible-Arbetsledare source; no second jobs-column or tenant-role mutation. Clearing changes designation to ordinary member; manager replacement clears the previous designation atomically, including an ineligible former lead; removing archives the relationship. Reactivation preserves row identity. A lead may remove their own membership only through a separately entitled manager branch, since ordinary-crew authority excludes the designated member.

Transactions authenticate and check current tenant membership, serialize on the established tenant/job mutation boundary and lock relevant parent memberships/profiles and job/member rows in a stable order. Recheck current authority after locks and before writes. Use expected current state for stale picker/date requests and correlated, canonical request identity for response-loss retries; existing audit/correlation infrastructure is reused rather than adding a new outcome table. Replays require current authority, reject a reused identity with changed input, and never overwrite an intervening different update. Mutation and one audit outcome commit together or neither commits. Do not log payloads, proof material or private person attributes.

### Acceptance Criteria

- **AC01 / TR03:** Given either job kind and a manager with eligible same-tenant people, when they add, remove or reactivate members through the job workspace, then durable membership and one audit outcome agree on reload, identity is stable, and tenant roles are unchanged; failed writes retain an actionable draft without false success.
- **AC02 / TR04:** Given current job members, when a manager selects, replaces or clears responsible Arbetsledare in Översikt, then reload shows exactly zero or one eligible designated person from `job_members`; clear retains ordinary membership and concurrent/stale replacement cannot silently overwrite current state.
- **AC03 / TR05:** Given the same person is lead on A but not B, when they use crew/date UI actions and direct checked RPC calls, then only A permits ordinary crew and planned start/end mutations; designation, full-card, identity/CRM/PL, other planning fields and lifecycle mutations remain denied unless independently authorized.
- **AC04 / TR05:** Given a designated person of each seeded tenant role and relevant multi-role combinations, when they open navigation, My Jobs and their job directly, then their current own job is reachable, foreign/unrelated jobs remain inaccessible and protected money is structurally absent unless their independent existing role grants it. Ordinary installer member/booking-assignee read behavior remains intact.
- **AC05:** Given active, inactive, foreign, archived and nonmember target variants, when any actor assigns or designates them or attempts direct table/helper writes, then same-tenant FK, eligibility, RLS and privilege rules agree; unsupported calls leave membership, roles and audit unchanged.
- **AC06:** Given a valid dates-only request, when an entitled actor saves it, then only the two planned-date fields change, existing range/nullable rules apply, reload proves persistence and existing job-card baseline comparison rejects stale pre-edit review. No booking-facts/proof version or booking-view contract is changed.
- **AC07:** Given membership removal, lead replacement, tenant revocation, role change or profile archival races while an operation waits, when execution or replay resumes, then current SQL facts decide authority and target eligibility, with no stale-authority mutation, duplicate audit or partial result; an injected audit failure rolls back business state.
- **AC08:** Given phone-sized connected web and an interrupted/failed save, when users manage members/designation or dates, then accessible controls preserve entered state, expose retry/refetch and announce success only after persistence; retries preserve identity and all established jobs navigation/create/search/detail behaviors remain usable.

These preserve the four destination acceptance obligations in the transfer matrix: workspace mutations/audit (AC01), writable responsible picker (AC02), actual per-job command boundary (AC03/06), and full positive/negative/race scope matrix (AC04/05/07). Broader architecture documentation/consumption authority is not claimed: documentation/file consumer acceptance remains Story 16.5, work-order consumer authority Story 16.3, and project/full-card/upgrade/completion-card consumers Story 16.4. Material consumption remains Epic 17 Story 17.1 and existing time/booking consumers retain their own approved permissions. Future consumer work must retain its own acceptance and checked authorization, not inherit an unapproved blanket role grant; no consumption implementation is added to this story.

## Shared-path overlap and dependency disposition

| Seam | 16.2 requirement | E15 recurrence overlap / integration action |
| --- | --- | --- |
| SQL conflict facts, booking snapshots/finalizers, current-job proof and job-card baseline | No edits required; keep checked manager-only old RPCs. Planned dates already participate in baseline staleness | Preserve 16.1 contracts; no reassignment/whole-15.1 acceptance dependency |
| Manifest / booking_series enrollment | No new table or module; job_members already enrolled | E15 owns booking_series enrollment; no 16.2 manifest change planned |
| `envelope.ts` | Four named job command rows and explicit job-scoped gate | Concrete textual overlap with create/updateBookingSeries rows; preserve both enrollments, test closed dispatch |
| `permission-matrix.ts` | Explicit manager/scoped-job semantics without tenant escalation | Preserve independent recurrence command rows; review actual combined diff |
| `tests/support/authz/role-harness.ts`, `tests/integration/rls/role-harness.atdd.int.test.ts`, `migration-reset.int.test.ts` | Jobs fixtures, relationship/ACL negatives | Distinct series fixture/enrollment assertions may share these exact files; retain both sets |
| Forward migration chronology | One new jobs-members migration, not created/reserved now | Reported E15 reservation `20261019180000_recurring_booking_series.sql`; allocate distinct later timestamp through CLI at implementation |

No exact unfinished E15 contract blocks this approved plan. No other-worktree adoption, copying, ACK or message is a prerequisite. Implementation claims are exact-file claims requiring normal coordinator reconciliation, not ownership of directories or the E15 recurrence surface.

## Spec Change Log

## Review Triage Log

## Design Notes

Owner-authorized maintainable defaults: keep member controls in existing Översikt, use an explicit manager-only nullable lead picker among current eligible members, and render the lead dates editor separately from the manager full-card form. Headless input/state/action/projection modules keep future flow changes inexpensive; avoid a generic permissions framework. Stale writes show current state and retain the user's draft for a deliberate retry rather than silently replacing a lead or dates. These are design choices grounded in current requirements, not legacy observations.

## Verification

Planning evidence is source inspection and reuse of the completed explorations only. No application tests, DB, browser, migration or implementation occurred in this run.

Implementation must run high-risk ATDD before development and TEA automate after implementation, plus:

- Focused domain/envelope/permission unit tests: closed fields, role union, explicit unknown-command refusal and no global capability bypass; positive and negative cases for each operation.
- Required empty-database migration replay and full integration/RLS with `SUPABASE_TEST_REQUIRED=1`: actual executed/failed/skipped counts, both job kinds, actual JWT callers, direct RPC/table/helper ACLs, one-lead constraint, current eligibility, audit rollback, response-loss replay and controlled revocation/replacement races. Preserve existing H4/provisioning/recurrence assertions.
- Direct recovery-storage integrity lane and applicable pilot performance checks; reused historical passing evidence alone does not prove changed code.
- Essential real browser smoke: manager assign/remove/reactivate/select/replace/clear with durable reload; lead crew/dates/retry and prohibited actions; any-role lead own-job navigation/read with unrelated-job and money boundaries; revoked lead loses access. Preserve the existing authentication and four jobs-depth journeys. Use production Playwright webServer and accessible role-scoped selectors, not next dev.
- Applicable lint, typecheck, full unit suite and production build using checked-in package scripts. Read Supabase/Postgres skills and established CLI help before SQL; obey resource ownership rules for any later local runtime.
- Independent Sol 6.1 High review of SQL/RLS, scoped envelope, data projection and actual authority races. Configured workflow review stages remain required with truthful scoped provenance and the three-round cap.

Before development-complete status, the author writes `_bmad-output/auto-bmad/delivery/16-2-job-members-and-per-job-roles-arbetsledare.json` with exact tested revision/checks/review provenance and owned deferred release validation. Root runs the executable delivery gate before done/finalization. Exhaustive browser matrices, screenshots and manual polish are deferred release validation under the 2026-10-19 policy, never a waiver of essential behavior or security tests. This plan grants no release readiness or deployment permission.

## Auto Run Result

Status: ready-for-dev
Blocking condition: none
Phase: planning only; implementation not started.
Intent decision: resolved by root-verified direct owner answer dated 2026-10-19.
Next phase: root pins this exact specification and admits Phase 4 ATDD after parser verification; no implementation in this invocation.

Planning verification: final workflow/spec disk reread and ready-standard self-review completed; closed actor/command policy and Given/When/Then acceptance specified. Oversized warning retained. The renderer was executed once for this invocation; snapshot `_bmad/render/bmad-build-auto/kopplas-307a2bfdc280/96e8da50b6e5096e00c4/workflow.md`. Completion hook preserves this planning HALT without manufacturing an implementation review trail.
