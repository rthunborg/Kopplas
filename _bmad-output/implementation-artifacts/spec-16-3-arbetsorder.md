---
title: 'Story 16.3 — Arbetsorder'
type: 'feature'
created: '2026-10-19'
status: 'blocked'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/docs/process/development-completion-policy.md'
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/docs/process/agent-model-routing.md'
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Jobs currently have no constituent work orders. Approved Story 16.3 requires work orders under either `order` or `projekt`, with title, status, plural assignees, description, their own files and a usable Arbetsorder list/cards/detail pane. Retained TR06 additionally requires real work-order dependency targets and an actual warning after edit.

**Approach:** Extend the existing active jobs module and shared private file/link model. Separate pure validation/state and checked actions/projections from replaceable accessible presentation. Resolve the material authority and dependency/status decisions below before a ready-for-development plan or implementation.

## Boundaries & Constraints

**Always:** Preserve one stable parent `jobs.id`, both job kinds, composite same-tenant child references, current parent scope and independent role union. New tenant tables require manifest enrollment, explicit grants, ENABLE/FORCE RLS, exact policy/ACL and nonvacuous H4/role tests. Mutations enter checked envelope/RPC boundaries with current actor/target eligibility, atomic audit and response-loss/revocation safety. Work-order files use existing `files`/`file_links` and private storage, with declared `work_order` owner and independent selected-link/lifecycle authorization. Preserve all completed16.1/16.2 contracts and TR01–TR16 destination acceptance.

**Block If:** `intent gap`: approved sources do not select work-order mutation/assignment authority, its status graph, or the work-order timing input/comparison and allowed target scope needed for TR06 delay warnings. These are the explicit unresolved decisions below, not an E15 dependency or missing messaging permission.

**Never:** Infer work-order rights from the16.2 lead decision, ordinary membership or booking assignment; widen global job assertions or the crew/date scoped exception; invent work-order dates/status/authority as approved requirements; substitute unfinished-status warnings for required delay semantics without approval; complete/cancel the parent through a child; add a projects table, separate file store, portal, offline/AI/mobile/vendor surfaces or deployment. No product/test/schema changes or migration reservation in this planning run. Do not reference or browse legacy application evidence.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior | Failure boundary |
| --- | --- | --- | --- |
| Containment | Either parent kind; same-tenant versus foreign/wrong-parent references | Children remain under their immutable parent; cross-tenant references are rejected | No mutation, file disclosure or audit success on denial |
| Current authority | Current versus revoked actor/assignee; designation without independent permission | Apply the owner-selected resource/action matrix after locks and again on replay | No stale-authority write or inferred tenant-role elevation |
| Own files | Work-order owner plus parent and independently entitled file actor | Shared linking/signing/selected-link/lifecycle checks include the work order and parent | Parent/owner spoof and protected document leakage denied |
| Dependency target | Real work-order reference and resolved authorized timing input | Persist relational target; show actual delay/unknown result after edit | No unchecked JSON IDs, hidden data exposure or fabricated timing |
| Connected retry | Failed/interrupted save at360×640 | Retain suitable draft, expose retry/refetch and announce success only after persistence | No false success, duplicate durable outcome or offline queue |

</intent-contract>

## Invocation and binding

Exact invocation intent:

> Story 16.3 "Arbetsorder" (sprint-status key '16-3-arbetsorder', epic 16). Branch 'codex/epic-16-jobs' is the intended branch for this work. Halt after planning.

Source HEAD: `e1bd6b0cc9d757933fcd3d61b677d4a1fd9f0037`. Root performed the required bounded index refresh and confirmed a clean intended branch. Installed own-worktree skill renderer executed exactly once; snapshot `_bmad/render/bmad-build-auto/kopplas-307a2bfdc280/96e8da50b6e5096e00c4/`. Cached `epic-16-context.md` is valid and newer than planning sources; completed16.2 is continuity. Two context-free Sol6.1 High read-only explorers investigated requirements and actual authorization/schema/files/dependencies. No implementation or runtime verification is claimed.

## Code Map

All paths are repository-relative, specific planning candidates rather than implementation allocation.

- `_bmad-output/planning-artifacts/epics-phase-b.md:1589` and `:1591`; `prd-phase-b.md:372`; `ux-design-specification-phase-b.md:343` — constituent work orders, both parent kinds, fields, own files, actual list/cards/pane and checked create/edit.
- `_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md:16` — TR06 requires same-tenant work-order FK targets, actual dependency consumer and workspace warning after edit; schema alone is insufficient.
- `_bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md:61`, `:123` — completed owner grant is ordinary crew and planned parent-job dates only. Work-order consumer authority was retained here, not granted there.
- `src/server/authz/permission-matrix.ts:74`, `src/server/authz/job-command-scope.ts:1`, `supabase/migrations/20261019191746_e16_16_2_job_members.sql:13` — current manager capabilities, closed scoped exceptions and current relational job read. `src/app/(app)/jobs/[jobId]/page.tsx:76` independently gates Files/Bookings.
- `supabase/migrations/20261019133151_e16_16_1_job_depth.sql:46`, `src/features/jobs/dependency-warnings.ts:30`, `src/features/jobs/read.ts:227`, `src/components/jobs/JobDetailView.tsx:136` — existing job-only dependency FK, prerequisite planned end versus dependent planned start, warning/clear/unknown and actual workspace consumer. No work-order table/date or `bookings.work_order_id` exists.
- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:141`, `:246`, `:266`, `:389` — closed card payload/current facts and dependency replacement. Preserve old checked SQL/history; an old job-card save must never delete newly introduced work-order links. Any future dedicated dependency operation must share coherent parent locking/stale-state semantics.
- `src/server/commands/files/validation.ts`, `file-db.ts`; `src/features/files/file-index.ts`; `src/components/files/EntityFilePanel.tsx` — exact shared owner registration/resolve/UI seams.
- `src/server/read-models/document-sources.ts:28`, `document-context.ts:59`, `src/features/documents/filters.ts:8`; migrations `20261009091120_story_20_1_documents_selected_link_access.sql:196` and `20261009091121_story_20_2_documents_lifecycle_origin_and_restore.sql:39` — owner authorization and shared document lifecycle require coherent forward extension, never historical migration rewrites.

## Tasks & Acceptance

### Safely resolved execution outline; implementation remains blocked

1. `src/features/jobs/work-orders-domain.ts` and `tests/unit/features/jobs/work-orders-domain.test.ts` (proposed new) — closed input/state semantics and domain edge cases after the decisions are approved.
2. One future CLI-generated `supabase/migrations/*_e16_16_3_work_orders.sql` — child/assignee same-tenant structure, explicit owner-selected authority, checked mutations/audit/retry, FK and dependency safety; enroll exact new tables in `src/scope/manifest.ts`. No numeric identifier reserved; preserve existing16.1/16.2 SQL and E15 reservation `20261019180000_recurring_booking_series.sql`.
3. Proposed new `src/server/commands/jobs/work-orders.ts`, `work-orders-db.ts`, `src/server/read-models/job-work-orders.ts`; existing `src/server/commands/jobs/index.ts`, `src/features/jobs/actions.ts`, `src/server/authz/permission-matrix.ts` and exact closed envelope registration — checked operations and least-privilege projections. Final command/actor mapping waits for the decision; no blanket directory claim.
4. Proposed new `src/components/jobs/JobWorkOrdersPanel.tsx`, `WorkOrderPane.tsx`; existing `src/components/jobs/JobDetailView.tsx`, `src/app/(app)/jobs/[jobId]/page.tsx` — list/cards/detail and create/edit flow. Use current design-system labels, keyboard/focus/error conventions, connected retry and proportional headless separation. No full16.5 workspace shell expansion.
5. Extend the exact file/document owner seams above and dependency domain/form/read/workspace consumers after timing/target semantics are selected. Reuse shared files; preserve independent consumer permissions and old dependency rows on save. Do not add booking linkage merely because it may be useful later.
6. Proposed new `tests/integration/commands/work-orders.int.test.ts`, `tests/integration/rls/work-orders.rls.test.ts`, `tests/e2e/jobs/work-orders.e2e.spec.ts` — activate high-risk ATDD against the final approved authority, dependency and own-file contract. Extend existing H4/ACL/owner fixtures precisely at implementation admission, preserving provisioning/series/jobs assertions.

### Retained acceptance

- **AC01:** Given either job kind and an approved writer, when work orders are created/edited from the actual workspace and reloaded, then title/status/assignees/description persist under the same parent with checked attributable outcomes and no parent lifecycle changes.
- **AC02:** Given authorized versus foreign/unrelated/revoked actors and invalid references, when child/assignment/command/direct-RPC/table requests run, then same-tenant containment, selected authority, current eligibility and independent money/consumer checks agree without partial writes.
- **AC03 / TR06:** Given an actual selected work-order prerequisite and approved timing/target semantics, when its relevant state or dependent state is edited and the workspace reloads, then relational scope is enforced and the correct visible delay/clear/unknown result uses authoritative authorized facts. Existing job-only dependencies survive all saves.
- **AC04:** Given a work-order file and parent context, when independently entitled users attach/open/archive/restore through existing file surfaces, then shared owner/link/selected-source/lifecycle checks apply; foreign owner/parent substitution and unauthorized signed access fail.
- **AC05:** Given connected phone-sized use and interrupted/error/stale responses, when users create/edit/view work orders, then accessible state and draft/retry handling remain usable and success occurs only after persistence.

These retained criteria are not approved executable detail while the following material choices remain unresolved. TR08–10/TR13–16 remain16.4, workspace-wide TR12 remains16.5, and completed16.1/16.2 acceptance is not rewritten.

## Unresolved material decisions

1. **Resource/action matrix and targets.** Sources require envelope/RLS/matrix enforcement but do not name work-order create/edit/assign/status writers. Proposed narrow owner choice: Admin/Projektledare alone mutate work orders, assigning current eligible parent-job members; designation/assignee alone adds no writes. Reads retain current parent-job scope, files retain their separate checks. An alternative must enumerate the exact lead/assignee actions instead of expanding their16.2 grant implicitly.
2. **Status and delay semantics.** Sources require status, not an enumeration/transition graph. A consistency proposal is `created→in_progress→done`, `created/in_progress→cancelled`, explicit manager reopen `done→in_progress` or `cancelled→created`; no parent effect. For TR06 without new dates, a possible **explicit owner choice** is cross-job targets only, comparing prerequisite work-order parent planned end against dependent job planned start; missing/unreadable facts remain unknown and the warning is labelled parent-date based. Same-parent work orders have no independent timing under that rule and would be rejected. Existing parent dates cannot prove separate within-job task delay. Work-order-specific timing or different allowed targets require an explicit contract; unfinished status alone is not an equivalent approved delay warning.

These are proposals for a minimal concrete decision, not adopted defaults or approval claims. No exact unfinished E15 contract blocks this story; no whole-E15/ACK/messaging gate is introduced.

## Spec Change Log

## Review Triage Log

## Design Notes

Use the existing Arbetsorder section under the one job ID, progressive create/edit detail, accessible semantic labels and separate domain/action/presentation modules. These presentation choices are owner-authorized maintainable defaults, not legacy observations. No final Suggested Review Order is manufactured for this planning-only blocked exit; the implementation author will write it against actual changes and evidence.

## Verification

Planning verification: renderer native0 once, valid cached context, clean source binding after root-owned refresh, two synchronous High source/requirements explorations and specification self-review. No application tests, DB/browser services or migration creation occurred.

After a complete approved plan: high-risk ATDD and automate; pure boundary/state units; empty-history migration replay; full integration/RLS with `SUPABASE_TEST_REQUIRED=1`, executed counts, direct SQL/RPC/ACL and H4 negatives; controlled revocation/target races, idempotent response-loss/audit rollback; real own-file parent checks and dependency warning after edit; essential production-Playwright create/edit/status/assignment/files/reload/retry smoke; static checks/build, direct recovery integrity, independent High configured review with the three-round cap. Exact assertions must bind the selected owner contract, not guessed states or permissions. Broad browser/visual/manual breadth is owned deferred release validation under current policy, not waived functional behavior. Author delivery JSON and root delivery gate are required before done; no completion or release claim is made here.

## Auto Run Result

Status: blocked
Blocking condition: intent gap
Spec: `_bmad-output/implementation-artifacts/spec-16-3-arbetsorder.md`

The formal planning run stops here. Governing sources leave the work-order writer/target matrix, status transitions and TR06 work-order timing/target semantics unresolved. Safely resolved obligations and exact current integration seams are retained above. No implementation admission, migration reservation, test execution or release readiness is implied.
