---
title: 'Job Workspace Shell'
type: 'feature'
created: '2026-10-20'
status: 'ready-for-dev'
story_id: '16.5'
story_key: '16-5-job-workspace-shell'
epic: 16
baseline_revision: 'bbfa9265cd9732ddd8355f256a4fd90a6111c0b5'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-16-context.md'
  - '{project-root}/docs/process/development-completion-policy.md'
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/docs/process/agent-model-routing.md'
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Story 16.5 requires one usable workspace for a job's existing authorized information and actions. The current detail page stacks those consumers without the required tabbed desktop/mobile shell.

**Approach:** Compose the existing job readers and actions into a persistent header and five permission- and activation-filtered tabs: Översikt, Arbetsorder, Schema, Filer and Händelser. Preserve the same job identity, established protected-field boundaries and connected failure/retry behavior.

Invocation: Story 16.5 "Job Workspace Shell" (sprint-status key `16-5-job-workspace-shell`, epic 16). Branch `codex/epic-16-jobs` is the intended branch for this work. Halt after planning.

## Boundaries & Constraints

**Always:** Enforce current tenant and job scope on the server and through existing checked readers/RLS, including direct URLs/readers, not merely tab visibility. Derive available consumers from permission matrix × active scope manifest. Keep root-route admission, current member/booking-assignee/current-lead relationships, independent money entitlement and existing manager/lead action boundaries. Structurally omit unauthorized monetary/supplier data from returned DTOs and serialized props; hiding or zeroing it is insufficient. Event presentation receives only safe identifiers, event type and timestamp, without raw metadata, actor directory/email or reference payload. Preserve all completed 16.1–16.4 booking/proof, full-card, upgrade, crew, lead, work-order and file invariants. Success requires confirmed server persistence; preserve entered data and explicit retry on failure.

**Block If:** An actual required consumer cannot be composed without changing an unapproved permission, exposing protected data, adding a pending surface or changing an existing transactional contract. Report the exact path/invariant and preserve independently implementable scope; do not infer a whole-E15 prerequisite.

**Never:** Add new grants, tables, RPCs, migrations, budget/economy/time/report/supplier/payment-plan placeholder tabs, completion actions before approved lifecycle authority, Phase C features, synthetic business data, legacy observations or global AppShell changes. Do not add a directory grant or disclose a nonmember responsible-PL email to satisfy a header label. Do not change booking facts, conflict versions, snapshots, seals/finalizers, E15 series/resolver/TimeReports or historical migrations. Root owns Git, CI and aggregate bookkeeping.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Header identity | Authorized Order or Projekt | Same job ID; real title/type/status, customer/site/contact chips, responsible PL assignment state, authorized lead label and planned dates | Missing values remain explicit; read failure differs from unassigned |
| Responsible PL outside visible crew | PL assigned; actor lacks independently authorized picker/member label | Show assigned/name unavailable, not unassigned; no directory request | Retry only the existing authorized read after an actual read failure |
| Authorized tabs | Existing consumer permission and active owning module | Show and serve only that consumer; members remain in Översikt | Direct denied tab falls back neutrally to Översikt without forbidden reader invocation |
| Direct URL / changed authority | Foreign job/child or membership/role revoked | Existing root/child denial and current-authority recheck; no protected DTO or stale action success | Preserve normal 404/denial versus retryable failure semantics |
| Schema | Bookings.View with normal job-scoped RLS | Actual visible bookings list and mini-timeline; only Bookings.Manage receives create/edit controls and options | True empty differs from unavailable; forbidden controls and picker payloads absent |
| Event timeline | Current authorized job | Ordered safe real events, including actual upgrade event label | Empty is not a substituted read error; raw metadata never serialized |
| Navigation | Known/unknown tab, old workOrder deep link, refresh/back, active draft | Stable job identity, bounded selection, correct work-order return and preserved draft or explicit leave protection | No silent discard, fabricated success, offline queue or timeout-based success |

</intent-contract>

## Code Map

Binding requirements: `epics-phase-b.md:1597–1599` Story 16.5; `architecture-phase-b.md:508–515` incorporates UX §4.9; `ux-design-specification-phase-b.md:332–364` specifies header, five tabs, members within overview and responsive navigation. These live under `_bmad-output/planning-artifacts/`. TR12 in `_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md:22` maps to the three refined criteria below. Cached epic context is current; completed story specifications remain immutable evidence.

- `src/components/jobs/JobList.tsx:362–389` and `src/app/(app)/jobs/page.tsx:11–25`: stable title/list and MyJobs entry. Existing create redirects also target `/jobs/{id}`; retain these contracts.
- `src/app/(app)/jobs/[jobId]/page.tsx:36–119`: authorized root orchestration, card options, members, work orders, files and booking host. Current booking composition uses Manage; View already permits a read-only host through its independent reader.
- `src/app/(app)/jobs/layout.tsx:3–4`, `src/components/app-shell/RouteAccessBoundary.tsx` and `src/features/jobs/read.ts:218–243`: retain current job admission and checked job detail projection. Operational DTO returns before broad CRM/acceptance reads; money keys are conditional.
- `src/components/jobs/JobDetailView.tsx:83–343`: existing header, full card, members, source, upgrade, work orders, bookings, files and events composition. Preserve its business controls while separating overview from tab panels.
- `src/server/read-models/job-members.ts:14–30` and `src/server/read-models/job-work-orders.ts:41–77`: checked current-job projections and action flags. Use existing visible member labels; eligible-person picker data is not a general header directory.
- `src/components/jobs/JobWorkOrdersPanel.tsx:20–41` and `src/server/read-models/document-context.ts:59–65`: existing query-preserving selection and `/jobs/{parent}?workOrder={child}` document return. A child link without a tab selects Arbetsorder; retain independent child/document authority.
- `src/features/resources/bookings-read.ts:91–128`, `src/components/resources/BookingEntry.tsx:13–48`: reuse job-filtered Bookings.View read and separately manager-only options/actions. Preserve current job/CRM prefill and all 16.4 scheduling/proof behavior.
- `src/features/files/read.ts:87–134`: cookie/RLS shared-file projection, explicit display columns; retain existing EntityFilePanel owner `job` and work-order file boundaries.
- `supabase/migrations/20261019133151_e16_16_1_job_depth.sql:77`: existing job_events current-job read policy. Operational job detail currently supplies an empty events array; obtain real events with a dedicated normal-cookie, explicit-column reader, not a new grant or audit endpoint.
- `src/scope/manifest.ts`: jobs/files/resources active; scheduling/suppliers pending in this branch. Schema uses the shipped E14 booking consumer; no E15 calendar/time dependency. `src/components/app-shell/AppShell.tsx` is read-only.

## Tasks & Acceptance

**Execution:**
1. `src/features/jobs/job-workspace-domain.ts` (new) — define the five closed tab IDs, capability/activation descriptor projection, bounded query selection and old workOrder-link compatibility. Keep pure behavior independent of UI and test every matrix boundary.
2. `src/server/read-models/job-workspace.ts` and `src/server/read-models/job-events.ts` (new), `src/app/(app)/jobs/[jobId]/page.tsx` — compose only independently authorized existing consumers after root admission; project safe header assignment labels and real redacted event rows. Filter event reads by tenant/job through normal cookie/RLS; distinguish empty from failure. Reuse current card/member/picker entitlements, never fetch a picker merely to label a worker header. Do not substitute internal ID or auth email as a new personal-name disclosure.
3. `src/components/jobs/JobWorkspaceShell.tsx`, `src/components/jobs/JobWorkspaceSchedule.tsx`, `src/components/jobs/JobEventsPanel.tsx` (new), `src/components/jobs/JobDetailView.tsx` — render persistent header, overview/member content, actual work-order panel, booking list/mini-timeline, existing file panel and safe events. Keep root AppShell unchanged. Preserve existing full-card/upgrade/source controls, manager-only mutation rights and work-order/lead exceptions without widening them.
4. `src/components/resources/BookingEntry.tsx` — make the existing read-only job host and honest empty/error states usable inside Schema, preserving existing editor/actions and job/CRM prefill. `src/components/jobs/JobWorkOrdersPanel.tsx` — only bounded tab/query coordination if required, preserving child identity, existing draft/close guards and document return links. No scheduling engine, proof or command changes.
5. `tests/unit/features/jobs/job-workspace-domain.test.ts`, `tests/unit/server/read-models/job-workspace.test.ts`, `tests/unit/server/read-models/job-events.test.ts` (new) — exercise the I/O matrix, no forbidden-reader calls, structural money/picker/event redaction and failure-versus-empty semantics. Use real authority descriptors with independently defined expected tab sets.
6. `tests/integration/features/jobs/job-workspace.int.test.ts`, `tests/integration/rls/job-workspace.rls.test.ts`, `tests/support/job-workspace-atdd.ts` (new) — prove direct reader/root/child scope, current-authority negatives, safe header fallback and actual read-only booking subsets. Reuse existing job/member/work-order fixtures lazily, without aggregate lifecycle timeout growth. No new table or ACL inventory is needed.
7. `tests/e2e/jobs/job-workspace.e2e.spec.ts` (new) — prove manager and worker/lead paths at actual responsive workspace, direct/deep links, protected-payload absence, draft preservation, real persistence and failure/retry. Update only necessary tab navigation in existing `jobs-depth.e2e.spec.ts`, `job-members.e2e.spec.ts`, `work-orders.e2e.spec.ts`, `job-upgrade.e2e.spec.ts`, `job-scheduling-consumers.e2e.spec.ts` in that directory; retain their complete assertions, fixtures, save-outcome diagnostics and conservation checks. `package.json::test:smoke` — append the new workspace file before the trailing reporter, preserving all existing seven paths, scripts and dependencies.
8. `_bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md` — implementation author later writes and refreshes exactly one Suggested Review Order with verified final stops and actual evidence. Conduct independent High configured review, bounded fixes and exact-head verification before delivery; do not backfill earlier stories or claim planning checks as implementation evidence.

**Acceptance Criteria:**
- **AC01 — TR12, identity and overview:** Given a currently authorized actor and an Order or Projekt, when entering through its existing title/list/create link or refreshing its stable URL, then one workspace retains the same job ID and shows the persistent required header with real authorized labels/assignment states and dates, plus usable overview/card/member/source/upgrade actions according to existing rights. A nonmember responsible PL has an explicit assigned/name unavailable fallback unless an existing independently entitled projection supplies a label. Unauthorized money/budget/supplier fields are absent from server DTOs and serialized UI payloads; manager-versus-lead rights and global AppShell remain unchanged.
- **AC02 — TR12, authorized actual consumers:** Given the actor's current capabilities and active manifest modules, when selecting any of Översikt, Arbetsorder, Schema, Filer or Händelser or addressing its URL/reader directly, then only independently authorized current-job content/actions are served. Schema contains actual job bookings and mini-timeline with manager-only preconnected create/edit and read-only authorized worker subsets; Filer retains shared job ownership; events show real ordered safe labels/timestamps without raw metadata. Foreign/revoked/unauthorized root or child access exposes no protected data or stale write. No pending/future tab, broad audit/directory read, new grant or lifecycle completion action is introduced.
- **AC03 — TR12, connected responsive flow:** Given the authorized workspace at desktop and 360×640, including an existing workOrder document-return link or unsaved/pending form, when navigating priority bottom tabs/Mer, keyboard controls, back/refresh and error/retry paths, then selection/focus/job identity remain coherent, unknown or unavailable tabs safely resolve to overview, entered drafts survive or receive explicit leave protection, and honest loading/empty/error states remain distinguishable. All existing overview, work-order, booking, file and upgrade journeys remain usable and only confirmed persistence reports success.

## Spec Change Log

## Review Triage Log

## Design Notes

Owner-authorized maintainable defaults under current AGENTS: keep existing global navigation; use the design system for desktop tab navigation and mobile priority tabs plus Mer with accessible names, selected state and focus handling. Maintain stable authorized panel islands keyed by job/tab, or reuse explicit dirty/pending leave guards where mounting cannot be preserved; do not silently discard existing form state. No generic navigation/state framework or offline persistence is required.

Responsible-PL privacy is resolved, not an intent gap: always represent assignment state; use a label only from the actor's already-authorized current-job member projection or separately entitled existing manager picker. Otherwise distinguish assigned/name unavailable, unassigned and read failure. This avoids the historically rejected nonmember-email disclosure without weakening the literal header's truthful assignment information. No new personal-label RPC/migration is planned.

Händelser and an overview mini-timeline use the same safe real event projection. Schema's mini-timeline uses actual visible booking intervals, not a new full scheduling view. Members stay in Översikt. The missing economy/consumption/time modules remain absent, including lock-only placeholders; existing independently entitled financial details stay inside their existing checked presentation, not a fabricated budget tab.

Shared-path handoff: bounded `page.tsx` orchestration, `JobDetailView.tsx` composition, `BookingEntry.tsx` read-only host/empty state, optional `JobWorkOrdersPanel.tsx` query coordination, and `package.json::test:smoke` append only. Preserve E15 series/resolver/TimeReports/calendar-feed rows and any future combined smoke union. No manifest, permission-matrix, command envelope, H4 fixture, facts/proof/finalizer, AppShell, notification, CI workflow/helper, schema or migration edits are required. No migration is reserved or created. Root handles actual coordination and integration; there is no whole-E15 or acknowledgment gate.

## Verification

Planning evidence only: two context-free Sol6.1 High requirements/consumer explorations completed read-only; actual own-worktree renderer snapshot `96e8da50b6e5096e00c4` was loaded. Baseline is the canonical Git revision above. No implementation tests, DB/browser execution or new development-complete claim occurs in this run.

**Implementation commands and required observations:**
- `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm build` — success; count executed/failed/skipped separately. Targeted tests must include the matrix and real DTO boundary negatives.
- Required checked-in CI on the reviewed exact head: full integration/RLS with `SUPABASE_TEST_REQUIRED=1`, empty-DB migration/reset, focused current-authority/money integrity, pilot performance, direct isolated physical recovery, and production Playwright smoke union — actual passed evidence and native counts, not skipped coverage or a helper probe. Workspace browser cases must run alongside existing journeys; no timeout/retry increases to conceal regressions.
- Independent configured High review and targeted fixes under the three-broad-round cap; verify direct routes/readers, unsafe payload absence and retained action boundaries. Any new external private diff upload requires applicable direct human authorization; the earlier exact16.4 payload grant is not blanket permission.
- Author actual delivery JSON and final Suggested Review Order; root executable delivery gate and independent High provenance review precede explicit root authorization to mark done. Prior story CI is baseline continuity only. Broad visual/manual/browser matrices remain separately owned release validation, never a deferral of failing functional/security acceptance. Development completion does not imply release readiness or deployment approval.

## Auto Run Result

Status: ready-for-dev
Blocking condition: none
Ready-for-development gate: workflow and written specification re-read; actionable dependency-ordered paths, three surface-level Given/When/Then criteria, complete I/O boundaries and no unresolved intent gap.
Planning only. Three refined ACs preserve Story16.5/TR12. No implementation, migration reservation, resource launch or release claim.
