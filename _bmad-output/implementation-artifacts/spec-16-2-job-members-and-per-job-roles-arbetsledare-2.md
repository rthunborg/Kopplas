---
title: 'Story 16.2: Job Members and Per-Job Roles (Arbetsledare)'
type: 'feature'
created: '2026-10-19'
status: 'done'
baseline_revision: 3583bfb5fc3be5fb1f2ea2abb740435b0be9f8af
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/docs/process/development-completion-policy.md'
  - '{project-root}/docs/process/agent-model-routing.md'
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-16-context.md'
warnings: [oversized]
deferred:
  - summary: >-
      Release-validation only: Exhaustive browser, role and viewport matrices beyond the essential E01-E05 and existing smoke journeys
    evidence: |-
      Classification: release validation only; not a functional acceptance gap or review finding.
      Status: deferred
      Owner: Kopplas release-validation coordinator; root owns deferred-ledger integration
      Evidence: CI 39317194836 executed the 16 essential browser tests, including all five E01-E05 first attempt/retry 0. It did not execute the exhaustive release matrix; optional dashboard/release validation was skipped with release_validation=false and is not coverage.
      Next action: Before release readiness, the coordinator enumerates and executes the remaining role/viewport/job-kind combinations on a qualified protected runtime, records results and resolves consequential failures in the root-owned release ledger.
      This mirrors the unchanged delivery record for supported root-owned Phase 7 harvest; required development checks are not deferred.
    location: >-
      _bmad-output/auto-bmad/delivery/16-2-job-members-and-per-job-roles-arbetsledare.json#deferred_release_validation[0]
  - summary: >-
      Release-validation only: Screenshot comparisons and visual inspection of the job-members, designation and dates surfaces
    evidence: |-
      Classification: release validation only; not a functional acceptance gap or review finding.
      Status: deferred
      Owner: Kopplas release-validation coordinator; root owns deferred-ledger integration
      Evidence: No exhaustive screenshot-comparison or visual-inspection evidence is claimed. Production build and essential functional browser passes are development evidence, not visual-release evidence.
      Next action: Before release readiness, capture and inspect the approved responsive states for both job kinds, record comparison evidence and disposition in the release ledger, and obtain any separately required runtime/deployment authorization.
      This mirrors the unchanged delivery record for supported root-owned Phase 7 harvest; required development checks are not deferred.
    location: >-
      _bmad-output/auto-bmad/delivery/16-2-job-members-and-per-job-roles-arbetsledare.json#deferred_release_validation[1]
  - summary: >-
      Release-validation only: Manual walkthroughs and presentation/usability polish beyond the verified essential connected flow
    evidence: |-
      Classification: release validation only; not a functional acceptance gap or review finding.
      Status: deferred
      Owner: Kopplas release-validation coordinator; root owns deferred-ledger integration
      Evidence: Manual release walkthroughs and polish were not executed in this author run. The actual automated persistence/retry/authorization journeys passed; no functional, security, transaction or storage obligation is deferred here.
      Next action: Before release readiness, perform the recorded manual keyboard/phone/desktop walkthrough and polish review, attach evidence and resolve or explicitly disposition release issues in the root-owned ledger.
      This mirrors the unchanged delivery record for supported root-owned Phase 7 harvest; required development checks are not deferred.
    location: >-
      _bmad-output/auto-bmad/delivery/16-2-job-members-and-per-job-roles-arbetsledare.json#deferred_release_validation[2]
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

### 2026-10-19 — Review pass

Scope: original six configured layers, one broad Round 1; this canonical block preserves their original deduplicated findings and the implemented batch.

- intent_gap: 0
- bad_spec: 0
- patch: 5: (high 3, medium 2, low 0)
- defer: 0
- reject: 6: (high 0, medium 0, low 6)
- addressed_findings:
  - `[high]` `[patch]` Three recorded High repairs: optional-profile manager denial, current visible assignment retry, and pristine/dirty cross-lane baselines.
  - `[medium]` `[patch]` Two recorded Medium repairs: typed admission failure and member-read recovery.

Recommendation for this original pass: true (patched high 3, medium 2, low 0; weighted medium/low score 6, and High patches present). This historical result is retained.

Round 1's 14 prescriptive reports reconcile to 11 unique claims: five patches (three High, two Medium), six rejected required-patch suggestions; intent gap 0, bad spec 0, defer 0. The same High implementation author applied one bounded batch. Source-addressed does not imply executed SQL/browser evidence or reviewer acceptance; same-reviewer follow-up is limited to these fixes, regressions and unresolved consequential findings.

| Unique claim | Disposition and actual action | Evidence / limit |
| --- | --- | --- |
| Manager denied without optional resource profile | Patched: active independent Admin/PL authority no longer requires an actor resource profile; only the relational lead branch does. Existing identity, membership/role locks, target eligibility and replay checks remain. | INT-007 exercises all four real checked operations for both manager roles using the existing profileless orphan fixture. Active, pending CI. |
| Deliberate assignment retry submits old A while B is visible | Patched: post-refetch assignment materializes the current valid visible selection; missing/ineligible/already-current selection disables retry. Uncertain replay retains the exact original request. | E04 asserts B alone is persisted with one audit; original uncertain-replay assertions remain. Active, pending CI. |
| Shared refreshed token silently authorizes stale controls | Patched: each editable operation owns its value/baseline/token. Pristine controls synchronize on server/refetched/initial projections; dirty controls retain their baseline until explicit operation-specific refetch/consent. Older confirmed submissions preserve newer unsent drafts. | UNIT-005/006 passed; E05 verifies pristine A→B synchronization and dirty C refusal after a dates save. Browser pending CI. |
| Admission infrastructure failure becomes absence/404 | Patched: discriminated admission result separates unavailable from false. A relational-only jobs route renders a generic retry state with no children on uncertainty; existing independent role grants, unrelated routes and landing remain unchanged. App navigation exposes a safe retry rather than silently hiding the path. | AUTHZ-004 passed for RPC failure/rejection/malformed reply, false/true admission and independent manager rights. Runtime pending CI. |
| New member-read failure throws away the loaded detail | Patched: page-facing typed member-read failure preserves the authorized job detail, omits unavailable controls, and renders a generic GET retry; no SQL/payload details or false 404. | AUTHZ-004 passed against real read-wrapper error paths; production build passed. Runtime pending CI. |
| Optimize the admission query | Rejected as a required repair: no concrete current correctness or authorization bypass. | Existing tenant-bound identity predicate retained; performance evidence remains the applicable CI lane. |
| Add more parent locks | Rejected as a required repair absent a current bypass: existing membership/role/profile/member locks and tenant gate remain. | Actual controlled actor/target revocation tests remain intact; no weaker lock was substituted. |
| Add an ABA ordinal | Rejected as a required repair: serialized audit ordinal is already in current expected-state/replay checks. | Existing guard preserved. |
| Add direct SQL date validation | Rejected as a required repair: checked SQL already closes payload keys/types, casts both dates and rejects range/calendar violations. | Existing guard and assertions preserved. |
| Add a singular-lead unique index | Rejected as a required repair: partial unique index already enforces one unarchived lead and fails historical duplicates explicitly. | Existing index and ACL/inventory assertions preserved. |
| Add broad edited-draft browser coverage | Rejected as a separate required repair without a current bypass. | Narrow E04/E05 were added for the two observed selection/baseline defects; no exhaustive release matrix is substituted for a missing development check. |

### 2026-10-19 — Review pass

Scope: same independent Sol 6.1 High s162_blind's focused check of the five fixes and regressions; no additional broad review. Qualified PASS in `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-2-review-afc41771-8a4c-4cb0-8a39-6349e08cfca9/focused-pass.receipt.txt`, SHA256 `52859c2a3be4e8cc44f6c08bb4f4e665f217c58d26c966fc1f27555a3e6f42b2`; all 38 source hashes and fix-diff hash matched. The receipt's then-pending runtime conditions are now supplied by exact-head CI 39317194836; its original text is preserved.

- intent_gap: 0
- bad_spec: 0
- patch: 0: (high 0, medium 0, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - none

Recommendation for this focused pass: false (patched high 0, medium 0, low 0; score 0).


### CI 39314732375 — bounded INT-006 harness repair

The root-owned source revision `5d5186e1cfb3e045db9ef101e1c6cf6b50133040` failed one integration case. The author inspected the original private DB log (`C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39314732375-db.log`, SHA256 `48a30d7186b90be6402311115dd05498baa0498e86f597616afe26742d4c6376`) and native integration JSON (`C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39314732375-integration-native/full-integration.json`, SHA256 `a9d0dc225461524ade60abef0b44624c344cb8646acbf3798e2387dbd407bc55`). The log's explicit diagnostic is **Test timed out in 30000ms**; the native collection stack's `STACK_TRACE_ERROR` is not a SQL assertion mismatch. Native integration counts remain historical **1,765 total, 1,763 passed, 1 failed, 1 pending**, with INT-006 at 30,029.428 ms.

The failed test aggregated eight independent authority-race fixtures and one audit-fault fixture under one unchanged 30-second runner budget. In the same native run, the one-fixture siblings INT-001/002/003/004/007 passed in 4,670.474 / 3,105.100 / 3,934.394 / 3,937.730 / 5,216.076 ms; two-fixture INT-005 passed in 6,699.354 ms. This supports the bounded harness repair; the exact interrupted scenario was not logged and remains unknown, and no SQL defect is proven.

Action: replace only that aggregate with `test.each` for the exact eight race names and a separately named ninth audit rollback/retry test. All original assertion expressions, actual checked-RPC calls, controlled waits, full external-state comparisons and same-request retry/audit assertions are preserved. The global 30-second timeout, 10-second barrier, fixtures, SQL/helpers and product code are untouched. No source-bound test mirroring this registration was added.

Executed on the repaired source: actual `pnpm exec vitest list tests/integration/commands/job-members.int.test.ts --json` collected **15 command tests**, including all **eight named INT-006 races plus the ninth audit case**; `pnpm typecheck` and targeted ESLint passed. Collection executes no test fixtures and is not database coverage. Parent-reported native static evidence (2,627 unit passes/0 skips), browser evidence (16 passed, including E01–05 first attempt/retry 0), and recovery evidence (1 passed) remain tied to the prior revision and unchanged product boundaries. Their actual applicability is root-owned; no passing history or failed case is rewritten. Focused independent High review and the root's real integration rerun remain required before crediting this repair or completion.

### 2026-10-19 — Review pass

Scope: same independent Sol 6.1 High s162_blind's focused approval of the bounded two-file timing-harness repair; no additional broad pass. Qualified PASS in `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-2-review-afc41771-8a4c-4cb0-8a39-6349e08cfca9/timeout-fix-pass.receipt.txt`, SHA256 `18b7ee2c4ddf8c326b02cf4009a91024aab81339ab1a24cfd18ff15474179df2`; all assertions, checked calls, waits, awaited cleanup and retry guarantees were preserved without raising a timeout. Exact-head CI 39317194836 now proves all eight races plus the audit case passed. Original failed-run evidence and unknown interrupted iteration remain above.

- intent_gap: 0
- bad_spec: 0
- patch: 0: (high 0, medium 0, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - none

Latest recommendation: false because this actual latest pass patched high 0, medium 0, low 0; `3 × medium + low = 0`, below 5, with no High patch. The formula is pass-local; historical High patches and their true recommendation remain recorded. `review_loop_iteration: 0` tracks bad-spec re-derivation loops, not the number of broad/targeted review receipts. Review deferrals remain 0; the three release-validation deferrals live in the delivery record and await root ledger integration.


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

Status: done
Blocking condition: none
Phase: development complete under the adopted 2026-10-19 policy; root-authorized metadata closure. Release readiness remains false, and merge/deployment authorization is not granted.
Evidence revision: `65e9111fa4303f87924e84e5e96d220f777f3cfc`; owned terminal-success CI `39317194836`, checkpoint `ef94062e-ea29-4e3a-ba6f-03f9ccee5f5e`, receipt `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-2-ci-65e9111f-cc5758aa-eabd-47a8-99c2-933c31eed812.json`. This source revision was tested; subsequent author edits are only this spec and the required delivery JSON.

Implemented change: audited same-tenant membership/reactivation, singular manager-appointed Arbetsledare, own-job ordinary crew/planned-date authority, narrow person projections and jobs-only admission, and explicit connected UI retry/stale consent. Existing mixed/full-card/lifecycle/consumer/money grants remain independent. The profileless-manager, current-selection, dirty-baseline and typed read-failure fixes are included; the timing-only INT006 repair preserves every original assertion.

Files changed (one-line scope summaries; exact 38-file reviewed source inventory and hashes are `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-2-review-afc41771-8a4c-4cb0-8a39-6349e08cfca9/inventory-timeout-fixed.json`, raw SHA256 `57e138b9cbad60d624121192fdddd06c64f1af056445791853ee52d82753db0f`):

- Jobs page/app-shell entry paths: typed safe read/admission failures and jobs-only relational navigation.
- `JobDetailView.tsx`, new `JobMembersPanel.tsx`: usable member/lead/date controls with honest persistence, retry and draft consent.
- New `job-members-domain.ts`, reused `job-card-domain.ts` calendar predicate: closed inputs, immutable submissions and independent field baselines.
- Jobs actions/read models/types consumers: fixed-operation actions, narrow IDs/labels/flags and structural money withholding.
- Authorization/envelope paths: closed crew/date scope enrollment with unchanged mixed-command and independent manager/money grants.
- New jobs member/date command wrappers and checked SQL migration: current locked authority, stable relationships, one-lead constraint and atomic audit/replay.
- Unit/integration/RLS/role-harness/fixture paths: original contracts and focused five-fix/timeout regressions.
- `package.json`: essential smoke retains both authentication specs and jobs-depth, adds job-members.
- This spec: author decisions, triage, truthful history and review trail. New `_bmad-output/auto-bmad/delivery/16-2-job-members-and-per-job-roles-arbetsledare.json`: required policy evidence/deferral metadata only; no source/test/SQL/helper change after green.

Actual exact-head development checks:

| Check | Executed result |
| --- | --- |
| Static/unit/process | Typecheck/lint passed; units **2627 passed, 0 failed/cancelled/skipped/todo, 100 suites**; Python **2+26+10+5=43 passed**. |
| Build/containment | Production build, source and bundle containment passed. |
| Supply-chain integrity | Dependency audit and lock checks passed. |
| Migration replay | New migration applied at startup and empty-database reset; reset attempt **1 succeeded**. Hosted isolated CI evidence. |
| Full integration/RLS | **1773 total, 1772 passed, 0 failed, 1 pending, 0 todo**; runner files **148 passed/1 skipped of 149**. Commands **15 passed/0 skipped**, member RLS **3**, Phase A surface **7**, role-harness **10 test bodies**. Every INT006 race/audit case passed. |
| Essential browser | **16 expected, 0 unexpected/skipped/flaky, 0 top errors**; all E01–E05 exactly one attempt/retry 0; duration **95302.69 ms**. |
| Direct physical recovery | Same-head **1 total/1 passed/0 failed/pending**, directly executing the sole ordinary-integration pending physical-storage loader proof; no general skip waiver. |
| Pilot performance | **5 warmup/25 measured**; read p95 **11.469548 ms**, synthetic bulk-effective-permissions p95 **4.134991 ms**. |

Actual evidence paths/hashes and review union are in the delivery record. Optional dashboard/release validation was skipped (`release_validation=false`) and is not coverage. No local native Supabase execution or deployment is claimed. The failed `39314732375`/`5d5186` run remains failed (**1763 passed/1 failed/1 pending**, aggregate 30000ms timeout, interrupted iteration unknown); individual final races passed in **2.32–3.20s** and audit in **2.58s**, now proving the bounded harness repair.

Review result: original **5 patches (High 3/Medium 2), 6 Low rejects, 0 review deferrals**; both focused independent High checks passed with no new patch. Latest canonical pass counts are all 0 and the workflow formula yields `followup_review_recommended: false` (High 0, Medium 0, Low 0; score 0). This reflects actual focused-review results, not a Phase 7 avoidance choice.

Owned release deferrals: **3** in the delivery JSON—exhaustive browser/role/viewport matrices, screenshot/visual inspection, and manual walkthrough/polish. Owner: Kopplas release-validation coordinator; root owns ledger integration. Each has scope, evidence, status and next action. No consequential functional/security/transaction/storage check is deferred. `release_ready` remains **false**, with no release/merge/deployment approval.

Completion metadata: root explicitly authorized this done transition after actual delivery_gate recheck returned native exit 0 with `ok: true`, `development_complete: true`, `errors: []`, `approval_granted: false`; the same independent High provenance reviewer returned qualified PASS for the eight evidence groups, native counts, review union, three release deferrals and review trail. Root verified all 37 source/test files unchanged from tested source `65e9111fa4303f87924e84e5e96d220f777f3cfc` and confirmed CI `39317194836` terminal SUCCESS. The delivery record remains byte-identical (SHA256 `4a0ebbc106c1df14fa2380a75e88d2d23027ca3a18910a258321d021954cd548`). This author changes only final spec completion metadata; root retains state/sprint/ledger/Git ownership.

Next action: the release-validation coordinator completes the three supported release-only frontmatter/delivery obligations before any release-ready claim. Historical checkpoints and the preserved review trail describe their then-current boundaries; this explicit completion metadata records the later gate/provenance/closure result without rewriting that history.

## Historical planning HALT — 2026-10-19

The following is the preserved planning-only invocation outcome, superseded by the current in-progress build/evidence result above. It is not the current canonical Auto Run Result.

Status: ready-for-dev
Blocking condition: none
Phase: planning only; implementation not started.
Intent decision: resolved by root-verified direct owner answer dated 2026-10-19.
Next phase: root pins this exact specification and admits Phase 4 ATDD after parser verification; no implementation in this invocation.

Planning verification: final workflow/spec disk reread and ready-standard self-review completed; closed actor/command policy and Given/When/Then acceptance specified. Oversized warning retained. The renderer was executed once for this invocation; snapshot `_bmad/render/bmad-build-auto/kopplas-307a2bfdc280/96e8da50b6e5096e00c4/workflow.md`. Completion hook preserves this planning HALT without manufacturing an implementation review trail.

## Build invocation and implementation route — 2026-10-19

Exact invocation intent: `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md`

Renderer executed once; emitted snapshot `96e8da50b6e5096e00c4`. Step 1 routes ready-for-dev directly to Step 3. Baseline `3583bfb5fc3be5fb1f2ea2abb740435b0be9f8af`; nineteen committed ATDD scaffolds require activation. Implementation author dispatch: context-free gpt-6.1-sol High for actual scoped RBAC/RLS, SQL transactions and revocation integrity; independent review retained. Root exclusively owns Git/index, CI/state/ledger/report operations. No local resource launch; runtime evidence will come from a reviewed source checkpoint through checked-in CI. Spec remains in-progress until actual required evidence, delivery gate/provenance review and explicit root closure authorization.


## Implementation checkpoint — 2026-10-19

Status remains **in-progress**. This is the implementation author's uncommitted source checkpoint against the recorded baseline, pending the root-owned exact-head CI checkpoint, configured independent review, delivery evidence reconciliation and explicit closure authorization. Planning-only statements above are historical; they are not implementation evidence.

Implemented the four fixed crew/designation/date commands, closed DTO validation, current-identity lead admission, narrow member/eligible-person read model, Översikt panel and dates-only editor. SQL uses the existing tenant mutation gate plus ordered membership, role, job, profile and member locks; current authority and target eligibility precede replay and writes. Audit metadata stores canonical request/state hashes and a serialized outcome ordinal, avoiding another outcome table and avoiding clock-based replay ordering. Lead-only authority never enters the old mixed job/card/booking commands. The full-card date validator's calendar predicate is exported for reuse, without changing its rules. Unentitled job payloads use a generic protected-money descriptor instead of serializing protected field names in withholding metadata.

The CLI allocated `supabase/migrations/20261019191746_e16_16_2_job_members.sql` with Supabase CLI 2.115.0 (`migration new e16_16_2_job_members`) after its installed help was read; it is later than the reported recurrence reservation. No migration was executed here. No service, browser, Docker/WSL workload, provider, secret, environment, dependency, Git/index mutation, push, merge or deployment was started by this author.

Nested route/ownership: the parent High implementation author retained SQL, command authorization, projections, domain state and actions. The explicitly isolated `members_ui` worker ran context-free **gpt-6.1-sol Low**, owning only `src/components/jobs/JobMembersPanel.tsx`; it used the existing zinc component pattern and supplied a file-only ESLint pass. That result was awaited and integrated. The repository does not contain the skill's example `nextjs-app/docs/design/DESIGN.md`/Figma reference path; the spec's owner-authorized existing-system defaults govern the panel. The React checklist was applied to event-based actions, typed server DTOs, independent drafts, accessible labels/status/errors and absence of effects/request-shared mutable state.

Activation retains all **19** original ATDD bodies/assertions: four domain, three access, six command integration, three RLS, three browser journeys. Proposed DTO spellings in the domain scaffold were reconciled to the real `personProfileId` and required opaque `expectedState` contract; symbol/extra-field rejection, null/calendar/range checks, immutable retry and deliberate stale refetch assertions remain. The direct checked-SQL revoked-replay negative remains intact. Dedicated capability/envelope tests supplement these assertions. Shared role-harness metadata tables/projection adapters are unchanged; only a closed scoped-command classifier/import and jobs-related assertions were added. The smoke command now retains both authentication specs and existing jobs-depth smoke and adds job-members before its reporter option.

Executed source checks:

- `pnpm typecheck`: passed, including the final adapter/inventory changes.
- Focused domain/access/navigation/enrollment/matrix/envelope command: **47 passed, 0 failed, 0 skipped**.
- `pnpm test:unit`: **2,623 passed, 0 failed, 1 skipped** (2,624 tests, 100 suites). The skip is `tests/unit/ops/isolated-recovery-storage.test.ts` on Windows because Linux xattrs are required; it remains missing Linux execution evidence here.
- `pnpm build`: passed production compilation, TypeScript and page generation; no application server was launched.
- Full lint initially found the ATDD adapter's two forbidden `module` variable names; they were renamed without changing assertions. `pnpm lint` then passed with **0 errors, 14 warnings** (existing unrelated warnings). The author review-order checker passed with **17 verified references, 0 errors**.

Required development evidence still outstanding: clean migration replay, full integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, direct recovery-storage integrity on Linux, applicable pilot performance, the three real production-server essential browser journeys, configured independent sensitive review and exact tested checkpoint provenance. Root owns the checkpoint/CI and delivery gate. No `development_complete`, `done`, release-ready or deployment claim is made; the final delivery JSON must be written/reconciled only with actual required evidence.

Deferred release validation: exhaustive browser/role/viewport matrices, screenshots, visual inspection and manual polish remain **deferred**, owned by the release-validation coordinator. Next action: record qualified release evidence in the root-owned deferred ledger/delivery artifact before release readiness. These deferrals do not cover any essential functional, authorization, transaction, recovery or persistence failure.

## Suggested Review Order

Author: Story 16.2 implementation/fix author (gpt-6.1-sol High). Final evidence refreshed against tested source `65e9111fa4303f87924e84e5e96d220f777f3cfc` and terminal-success owned CI `39317194836`. Only spec/delivery metadata changes follow that tested source. The original six configured layers and two focused High receipts are preserved; final metadata provenance and closure remain root-owned.

### Visible drafts retain their own consent boundary

The spec's overview composition and separate dates editor remain. Deliberate post-refetch assignment uses the current visible eligible person; an uncertain replay retains the frozen original request. Each control owns its baseline so pristine values follow server projections while dirty values cannot gain authority from an unrelated lane's refresh (AC01/02/08).

- `src/components/jobs/JobMembersPanel.tsx:51` — `JobMembersPanel`: renders separately granted operational controls.
- `src/components/jobs/JobMembersPanel.tsx:127` — `retry`: separates exact replay from current deliberate selection.
- `src/features/jobs/job-members-domain.ts:70` — `receiveJobMemberField`: synchronizes only pristine controls.
- `tests/unit/features/jobs/job-members-domain.test.ts:148` — `16.2-UNIT-005`: asserts cross-lane pristine/dirty consent behavior.

### Operational admission never becomes a broad edit grant

Only the three dedicated crew/date commands consult current relational leadership after validation; designation remains manager-only. SQL remains commit authority. Existing full-card/create/lifecycle and other consumer capabilities retain their independent policies (AC03/04).

- `src/server/authz/job-command-scope.ts:3` — `const scoped`: enumerates the closed crew/date exception.
- `src/server/commands/envelope-core.ts:231` — `if (needsJobScope)`: checks current job scope before execution.
- `tests/unit/server/commands/envelope-core.test.ts:229` — `16.2 scoped`: asserts positive scope and unchanged mixed/unknown-command denial.

### Current membership governs independent manager authority

Independent active Admin/PL authority requires no optional resource profile; only current relational leadership requires one. Ordered locks, the single-lead index, canonical request/state hashes and serialized audit ordinal retain the transactional/revocation/replay boundaries. Mutation and audit commit together (AC01/02/05/06/07).

- `supabase/migrations/20261019191746_e16_16_2_job_members.sql:3` — `job_members_one_current_lead`: enforces singular unarchived designation.
- `supabase/migrations/20261019191746_e16_16_2_job_members.sql:131` — `Resource profiles are optional`: separates manager and relational-lead actor requirements.
- `supabase/migrations/20261019191746_e16_16_2_job_members.sql:158` — `if saved.id is not null then`: validates replay after current authority checks.
- `supabase/migrations/20261019191746_e16_16_2_job_members.sql:183` — `post_state:=`: binds the atomic audit to business state.

### Unavailable reads stay actionable and fail closed

Jobs admission distinguishes a confirmed absent relationship from unavailable authority; only an independently authorized role or a confirmed relationship admits content. The page's member-read wrapper preserves already authorized detail and exposes a safe retry. Narrow ID/label projections, independent money/CRM policy and unchanged tenant-role landing remain intact (AC04/05/08).

- `src/server/read-models/job-members.ts:28` — `readJobMembersForPage`: maps member read failures to safe typed results.
- `src/server/read-models/job-members.ts:34` — `readJobLeadAdmission`: distinguishes unavailable authority from false.
- `src/components/app-shell/RouteAccessBoundary.tsx:25` — `decision === "unavailable"`: renders retry without job children.
- `src/app/(app)/jobs/[jobId]/page.tsx:78` — `const memberRead`: retains detail when the member projection fails.

### Focused regressions and actual evidence stay distinct

All 19 original acceptance contracts/assertions remain, including INT-004 genuine pre-edit card proof staleness, INT-005 direct revoked SQL replay, RLS001–003 role/privacy/ACL and E01–03 persistence/retry/navigation. After the CI timeout, INT-006's eight independent controlled-race fixtures and ninth audit fixture each receive their own unchanged test budget; its seven original assertion expressions and every checked call/wait remain. This isolates failures without increasing a timeout or changing SQL. INT-007, E04/E05 and AUTHZ-004 retain the five-fix regressions.

- `tests/integration/commands/job-members.int.test.ts:200` — `test.each(authorityChanges)`: registers the exact eight independent race cases.
- `tests/integration/commands/job-members.int.test.ts:244` — `16.2-INT-006 audit failure`: preserves rollback and same-request retry assertions separately.
- `tests/integration/commands/job-members.int.test.ts:264` — `16.2-INT-007`: tests profileless Admin/PL across four checked operations.
- `tests/e2e/jobs/job-members.e2e.spec.ts:359` — `16.2-E05`: checks pristine synchronization and dirty baseline refusal.

Evidence: actual exact-head CI `39317194836` at `65e9111fa4303f87924e84e5e96d220f777f3cfc` passed all required jobs. Native unit/process results: **2627 units passed/0 skipped** and **43 Python tests passed**; typecheck/lint/build/containment/audit/lock gates passed. Full required integration/RLS: **1772 passed/0 failed/1 pending of 1773**, including **15 command cases**, **3 membership RLS**, **7 Phase A surface**, **10 role-harness test bodies**; all eight INT006 races and the audit case passed. The sole ordinary-run pending physical-loader proof separately passed **1/1 at the same head** in direct recovery. Essential browser: **16 passed, 0 unexpected/skipped/flaky/errors**, including all E01–E05 first attempt/retry 0. Pilot: **25 measured/5 warmup**, read p95 **11.469548ms**, synthetic bulk-effective-permissions p95 **4.134991ms**. Full paths/hashes are in `_bmad-output/auto-bmad/delivery/16-2-job-members-and-per-job-roles-arbetsledare.json` and the canonical result; author verified the supplied native artifact hashes and relevant counters.

Limits: historical failed run/Windows skip/collection-only checks remain historical and are not relabelled. Native ordinary-run storage pending and separate recovery pass retain their distinct dispositions. Source review is the six-layer plus two focused-High union, not a newly invented broad pass or an executed reviewer-to-DB exercise. Latest canonical review has zero patch/defer/reject and formula score 0; earlier 3 High/2 Medium patches remain recorded. Exhaustive UI matrices, visuals and manual polish are three owned deferred release items; optional skipped dashboard is not coverage. Required root delivery gate, independent final provenance review and explicit closure authorization are pending; spec remains in-progress and release-ready false.

## Configured review route — Round 1 of 3, 2026-10-19

All six configured Step 4 layers actually executed against the frozen tracked-plus-new diff SHA256 `e78077629c6adc31d3543ff76ccd73f4a0ef2653a6a3e2758bb303ce8a7c1734`: independent context-free Sol 6.1 High blind, edge, verification, intent and security agents, plus exact configured external Codex High read-only command (native exit 0; nonempty receipt). Platform concurrency required queueing the final two children for freed slots, without rerunning any layer. Private provenance and source inventory: `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-2-review-afc41771-8a4c-4cb0-8a39-6349e08cfca9/`. Collaboration-history receipts are original; private agent receipt files explicitly summarize them; external `.review` is native unmodified output.

The five concrete repair claims go to the same Sol 6.1 High author as one batch: optional-resource-profile manager denial; stale assignment target mismatch; pristine/dirty cross-lane token synchronization; scoped admission infrastructure failure handling; member-read failure handling. Six distinct optional coverage/performance suggestions are rejected as required patches after checking the existing SQL validation/locks/index/ordinal and immutable retry guards; they identify no current bypass. Intent audit is descriptive: the current explicitly authorized implementation invocation supersedes the historical planning-run restriction; existing-detail overview composition and scoped eligible-person choices follow the approved plan, without broad consumer permission expansion. No new intent gap or E15 gate is introduced. Spec remains in-progress and required runtime remains outstanding. Follow-up reviews will target fixes/regressions and unresolved consequential findings, not repeat unchanged broad source review.


## Round 1 author fix checkpoint — 2026-10-19

The same Sol 6.1 High author applied the five concrete repairs as one bounded batch and authored the triage above. No new worker, broad review, dependency, provider, environment, Git mutation, runtime resource or deployment was introduced. The original `members_ui` Low contribution remains recorded; the state/read/authorization fixes in this batch are owned by the High author.

Executed after fixes: focused **50/50** tests; full units **2,626 passed, 0 failed, 1 Windows xattr skip**; final typecheck; targeted ESLint for all changed TS/TSX/tests; fresh production build. All passed except the explicitly skipped Linux-only test, which remains unproved here. The prior full-lint receipt (0 errors/14 existing warnings) remains historical; changed fix files passed targeted lint with 0 errors/warnings. Runtime INT-007/E04/E05 additions are active and await root CI along with the original required integration/RLS/browser/recovery/performance lanes. No local runtime execution or done/development-complete/delivery claim is made. Parent now performs same-reviewer targeted checks of this batch and the refreshed author trail before the root checkpoint lane.


## CI timeout repair author checkpoint — 2026-10-19

Same High author, exactly two edited files: this spec and `tests/integration/commands/job-members.int.test.ts`. The native failure remains recorded; the exact interrupted race is unknown and no SQL bug is claimed. Actual collection verified eight separately named race cases plus the ninth audit rollback/retry case. Typecheck/targeted lint passed with no runtime resource, helper/product/SQL, timeout, dependency, environment, Git or CI mutation. The root now owns focused independent review and any exact-head CI rerun; this checkpoint grants no done/development-complete/delivery/release claim.


## Post-green author evidence reconciliation — 2026-10-19

Root explicitly authorized only this spec and the required delivery JSON after exact-head terminal-success CI. The author verified the five supplied native log/report hashes, focused-review receipt hashes and reviewed inventory hash, read the original focused PASS receipts, inspected relevant native counters and confirmed the runner's 148-passed/1-skipped file summary. Source/tests/SQL/helpers were not edited, and no tests/resources/Git/CI/state/ledger/report operations were run. No private closure proposal was needed. Root gate, independent metadata provenance and explicit closure remain outstanding. Earlier author checkpoints and planning outcomes are historical; the current canonical in-progress Auto Run Result and same Suggested Review Order carry the green evidence.
