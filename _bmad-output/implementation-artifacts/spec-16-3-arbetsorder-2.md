---
title: 'Story 16.3 — Arbetsorder'
type: 'feature'
created: '2026-10-20'
status: 'ready-for-dev'
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

**Problem:** Jobs lack constituent work orders with their own title, status, assignees, description, planned start/end and files. Story16.3 also owns TR06: real relational work-order dependency targets and visible, authoritative delay warnings after edit.

**Approach:** Deepen the existing active jobs module under either `order` or `projekt`. Deliver an Arbetsorder list/cards and detail pane with dedicated checked operations, current job-scoped authority, shared private files and proportional headless domain/state/actions/projections separated from accessible presentation.

## Boundaries & Constraints

**Always:** Apply the verified20October owner contract: Admin/Projektledare and the current active designated Arbetsledare may create/edit/assign/change ordinary status on the lead's own parent job; only Admin/PL may reopen. Assignees must be current eligible parent-job members. Current tenant roles combine independently by union; ordinary membership/assignee status alone grants no new writes. Work-order reads require current parent-job read authority. Enforce composite same-tenant and same-parent references, current actor/target checks after stable locks, explicit grants/forced RLS, atomic audit and current-authority replay. Own work-order dates are nullable canonical calendar dates, not inherited parent dates. Same-parent work-order dependencies use actual prerequisite-work-order end versus dependent-work-order start. Missing/unreadable timing remains unknown. Preserve source job identities, accepted provenance, all completed16.1/16.2 grants and v3 booking proof/current-facts contracts; files remain separately authorized.

**Block If:** A consequential contradiction with the verified owner contract or an actual required external contract cannot be resolved from approved sources. Record the exact path, owner, evidence, unblock condition and later integration test for that slice; continue independent approved work without claiming its missing acceptance. There is no whole-E15/ACK or messaging gate.

**Never:** Grant work-order reopen to a designation-only actor; widen the16.2 crew/date exception globally or grant parent identity/CRM/full-card/lifecycle/completion/upgrade/money/files/booking/time authority. Never use the rejected parent-date proxy or blanket same-parent rejection, unchecked JSON dependency IDs, a new file store, a projects table, booking work-order linkage, automatic scheduling or PhaseC/legacy-application evidence. Root owns Git/state/sprint/ledger/report/CI operations; no deployment/provider/secret changes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected output | Failure behavior |
| --- | --- | --- | --- |
| Both container kinds | Entitled writer; eligible current parent members | Durable child title/description/dates and plural assignees under unchanged parent | Foreign/wrong-parent/inactive inputs fail without partial state/audit |
| Lifecycle | created→in_progress→done; created/in_progress→cancelled | Dedicated status operation enforces exactly these ordinary transitions | No direct created→done, extra state, parent completion or full-update bypass |
| Reopen | done→in_progress or cancelled→created | Admin/PL only; designation-only actor denied on own job too | Current SQL authority applies even on replay; unchanged status retry is idempotent |
| Own dates | Nullable YYYY-MM-DD start/end, years0001–9999 | Reuse Gregorian validation; known end≥start; equal dates allowed | Invalid date/range/extra field rejected; no parent-date fallback or new timing SLO |
| Dependencies | Job→work order, work order→job, or work order→work order, including distinct same-parent work orders | Resolve the actual endpoint dates; prerequisite end>dependent start warns, equality/earlier clears | Missing/unreadable facts yield unknown without hidden labels/IDs/dates; self/foreign/spoofed endpoints denied |
| Stale/revoked/retry | Role/lead/member/profile/parent state changes while waiting; response loss | Locked current facts and expected state decide commit/replay; one durable audit outcome | Changed payload identity or stale consent cannot overwrite newer state; retain visible draft |
| Own files | Existing independently entitled Files actor and active work order/parent | Shared link/upload/sign/selected-source/archive/restore behavior | Designation/assignment does not bypass Files/Documents or parent checks |

</intent-contract>

## Invocation and owner clarification

Fresh invocation intent:

> Story 16.3 "Arbetsorder" (sprint-status key '16-3-arbetsorder', epic16). Branch 'codex/epic-16-jobs' is the intended branch for this work. Verified owner clarification2026-10-20: Admin/Projektledare plus the job's current Arbetsledare may create/edit/assign/change ordinary work-order status; approve the proposed lifecycle with manager-only reopen and eligible current parent-member assignees. Give work orders their own planned start/end dates; support meaningful same-parent work-order dependencies with actual work-order dates. Existing protected permissions remain unchanged. Halt after planning.

Root verified direct human answers in Coordinator task `01a1160d-b5b1-7623-a8e8-54ef3dc537ed`, human turn `01a15885-1599-7d52-80e9-e95058a10198`, dated2026-10-20. ExactQ1 answer: “Admin/Projektledare plus the job’s Arbetsledare; approve proposed lifecycle”. The actual question explicitly restricted reopen to managers. ExactQ2 answer: “Give work orders their own planned start/end dates”. This is root-verified provenance, not a new observation by this delegate. It resolves the two prior intent gaps; it does not approve the old cross-job parent-date proxy or same-parent restriction.

The historical blocked `spec-16-3-arbetsorder.md` remains byte-unchanged, SHA256 `6235eb62e0f11ff6e15f38512b00bcc77ce39514d15fddf1532044009a9568aa`. The supported non-draft collision route creates this `-2` spec. The original requirements and TR06 are reconciled by own work-order dates and scoped consumer commands below; no acceptance is silently transferred or erased.

Source HEAD: `8031726df492022ac32aaae207ab5e7bd35d5a3b`. Root refreshed the index and confirmed clean intended branch. Renderer executed once using the installed own-worktree skill; current snapshot `_bmad/render/bmad-build-auto/kopplas-307a2bfdc280/96e8da50b6e5096e00c4/`. Cached Epic16 context remains valid; completed16.2 is continuity. Reuse both completed context-free Sol6.1 High requirements/source explorations; this resume refreshes only calendar/owner/command/dependency seams and migration filenames. No implementation or verification pass is claimed by planning.

## Code Map

- `_bmad-output/planning-artifacts/epics-phase-b.md:1589`, `:1591`; `prd-phase-b.md:372`; `ux-design-specification-phase-b.md:343` — both-kind child containment, fields, own files, real list/cards/pane and envelope/RLS. The verified owner answers supply writer, lifecycle and timing detail.
- `_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md:16` — TR06's real work-order FK/consumer/warning obligation; TR08–10/TR13–16 remain16.4 and workspace-wide TR12 remains16.5.
- `src/features/jobs/job-card-domain.ts:23`, `job-members-domain.ts:37` — canonical calendar/date/null ordering and closed-field validation. `job-members-domain.ts` also separates immutable uncertain submissions from visible drafts and each dirty field's comparison baseline.
- `src/server/authz/job-command-scope.ts:1`, `permission-matrix.ts:74`, `src/server/commands/envelope.ts`, `envelope-core.ts` — closed dedicated scoped command admission. Extend only new work-order command rows; leave old role assertions/mixed-card commands and16.2 rows intact.
- `supabase/migrations/20261019191746_e16_16_2_job_members.sql:13` — current lead/job read, stable membership/profile/job locking, expected-state/canonical request identity/audit replay patterns. Independent Admin/PL authority must not require an optional person profile.
- `supabase/migrations/20261019133151_e16_16_1_job_depth.sql:46`; `src/features/jobs/dependency-warnings.ts:30`, `read.ts:227`; `src/components/jobs/JobCardForm.tsx:110`, `JobDetailView.tsx:136` — old job-only dependencies and actual warning consumer. Existing card SQL deletes/replaces only those old rows (`20261019133200_e16_16_1_job_booking_facts.sql:389`); preserve that contract without losing new work-order edges.
- `src/server/commands/files/validation.ts:33`, `:165`, `file-db.ts:99`; `src/components/files/EntityFilePanel.tsx`; `src/features/files/file-index.ts` — closed owner/purpose and shared upload/owner resolution. Add `work_order` with existing `job_evidence` purpose, keeping file semantics rather than a new bucket/purpose family.
- `src/server/read-models/document-sources.ts:28`, `document-context.ts:59`, `src/features/documents/filters.ts:8` — active-source coherence, parent validation, display/context navigation. Historical SQL `20261009091120_story_20_1_documents_selected_link_access.sql:196` and `20261009091121_story_20_2_documents_lifecycle_origin_and_restore.sql:39`, `:188` must be extended forward for the new owner, with all old branches preserved.

## Tasks & Acceptance

### Execution in dependency order

1. New `src/features/jobs/work-orders-domain.ts`, `tests/unit/features/jobs/work-orders-domain.test.ts` — closed separate create/update/assignee/status/dependency inputs, statuses/transitions, canonical dates and reusable semantic draft/warning models. Title is required trimmed1–256 characters; optional plain description is null or bounded10000characters (maintainable validation default, not a legacy observation). Create starts `created`; create/update cannot smuggle a status/reopen or parent/tenant reassignment. Ordinary field edits remain independently checked in terminal states; only explicit status changes traverse the graph. Do not impose unapproved completed-record immutability.
2. One future CLI-generated `supabase/migrations/*_e16_16_3_work_orders.sql` — add `work_orders` and `work_order_assignees`, direct tenant IDs, immutable child identity/parent, composite `(id,job_id,tenant_id)` parent coherence, same-tenant profile/member references, per-work-order/person uniqueness and current eligibility. Store own `planned_start_date`/`planned_end_date` as nullable SQL dates with the same calendar bounds/order. No authenticated direct writes. Add narrow checked authenticated RPCs/private helpers, empty search paths, actor/correlation binding, expected state, current locks/recheck and atomic sanitized audit; test direct bypass/replay/rollback.
3. In the same new migration, add typed `work_order_dependencies` for new edges containing at least one work-order endpoint. Both parent job IDs are explicit; optional dependent/prerequisite work-order IDs carry composite FKs to those parents; null work-order ID denotes that endpoint's job. Reject exact self-reference, duplicates and both-null job→job rows (old `job_dependencies` owns those). Distinct work orders under the same parent are valid. New rows remain separate from old job-only replacement/deletion. Direct dependency SELECT must not expose unreadable prerequisite IDs/dates/labels: require both endpoint scopes or deny raw access, and use a narrow checked actor/tenant/parent read projection for an anonymous unknown signal. Dependency selectors admit only currently readable eligible prerequisites; retaining/removing an existing inaccessible edge does not disclose it or authorize a new hidden target. No optimizer/transitive scheduling is introduced.
4. New `src/server/commands/jobs/work-orders.ts`, `work-orders-db.ts`; existing `src/server/commands/jobs/index.ts`, `envelope.ts`, `envelope-core.ts`, `src/server/authz/permission-matrix.ts`, `job-command-scope.ts` — enroll the explicit operation table below. Authenticate after locks/current membership, role/lead/profile/job/target validation; honor independently entitled profileless managers. Lock actor memberships/roles, relevant profiles/job parents in stable ID order, then children/edges consistently with existing revocation serialization. Current authority also gates idempotent replay; changed payload identities/stale expected state fail without new audit. Do not create a second role system or generic capability bypass.
5. New `src/server/read-models/job-work-orders.ts`; existing `src/features/jobs/types.ts`, `read.ts`, `actions.ts`, `dependency-warnings.ts` — current RLS-scoped work-order/list/detail/assignee/options DTOs and independent `canEditWorkOrders`/`canReopenWorkOrders`/file flags. Parent `job_can_read` is required; assignee alone creates no new read permission. No protected-money/private auth/email payloads. Evaluate job-only old edges plus new edges by the dates of the actual typed endpoints; missing/unreadable timing is unknown. Work-order edits never mutate parent planned dates or its booking-facts v3 digest/proof. Read faults remain actionable generic failures rather than fake emptiness/denial.
6. New `src/components/jobs/JobWorkOrdersPanel.tsx`, `WorkOrderPane.tsx`; existing `src/components/jobs/JobDetailView.tsx`, `src/app/(app)/jobs/[jobId]/page.tsx` — usable Arbetsorder cards/list/detail create/edit/assignee/date/status/dependency controls and shared files. Keep one job URL; a selected work-order query parameter can drive pane/deep-link/context return. Date/dependency forms use own current comparison baseline, visible stale refetch/consent and immutable uncertain retry, preserving newer unsent input. Reuse frontend-component/design system; keyboard/focus/error semantics and360×640 connected flow. Manager-only reopen has a distinct control; other actors cannot reauthorize through hidden fields. No whole16.5 shell rewrite.
7. Existing `src/server/commands/files/validation.ts`, `file-db.ts`, `src/features/files/file-index.ts`, `src/components/files/EntityFilePanel.tsx`, `src/server/read-models/document-sources.ts`, `document-context.ts`, `src/features/documents/filters.ts` — enroll `work_order`/`job_evidence` and shared owner source/context display. Forward migration extends owner CHECKs/current selected-link target/current archive-origin graph/lifecycle owner branch; work order AND parent must be coherent/current, and all existing Files/Documents capability checks remain. Lead write authority never grants Files/Documents. No historical SQL edit, duplicate bytes or new HMAC/secret family.
8. Existing `src/scope/manifest.ts` — enroll exactly the three new tenant tables and `work_order` owner under active jobs. Bounded shared tests: `tests/integration/rls/migration-reset.int.test.ts`, `cross-tenant-isolation.rls.test.ts`, `role-harness.atdd.int.test.ts`, `tests/support/authz/role-harness.ts`, `tests/unit/scope/manifest-derivations.test.ts`, `manifest-shape.test.ts`, `tests/unit/server/authz/command-enrollment.test.ts`, `permission-matrix.test.ts`, `job-access.test.ts`, `tests/unit/server/commands/envelope-core.test.ts`, `envelope-core-edges.test.ts`. Extend only work-order table/ACL/projection/role/closed-command rows, preserving E15/provisioning/job assertions and fail-loud exhaustive inventory. Existing `tests/support/jobs-depth-atdd.ts` owns lazy fixtures; no new generic fixture family or module-level DB work.
9. New `tests/integration/commands/work-orders.int.test.ts`, `work-order-files.int.test.ts`, `tests/integration/rls/work-orders.rls.test.ts`, `tests/e2e/jobs/work-orders.e2e.spec.ts`; bounded existing owner tests `tests/unit/server/commands/file-validation.test.ts`, `files/validate-upload-file.test.ts`, `tests/unit/features/files/file-index.test.ts`, `tests/unit/components/files/entity-file-panel-owner-type.test.ts`, `tests/unit/server/read-models/document-sources.test.ts`, `document-context.test.ts` — high-risk ATDD/actual integration for the AC below, including selected-link/lifecycle negatives and old dependency retention. `package.json` adds the work-order E2E file before trailing smoke reporter while retaining every existing argument, no dependency/lock/CI workflow change. Implementation author later writes and validates the final Suggested Review Order against real evidence.

### Explicit operation and authority contract

Names are bounded implementation choices, not existing historical RPC claims. Dedicated SQL repeats current authorization; envelope admission alone never commits authority.

| Operation | Admin/PL | Current lead on dependent/own parent job | Ordinary member/assignee |
| --- | --- | --- | --- |
| `work_order.create`, `work_order.update` (title/description/own dates only) | Allow | Allow own job | Deny |
| `work_order.assignees.set` (eligible current parent members, zero or many) | Allow | Allow own job | Deny |
| `work_order.status.set` (ordinary transitions) | Allow | Allow own job | Deny |
| Same operation reopening done→in_progress / cancelled→created | Allow | Deny absent independent Admin/PL | Deny |
| `work_order.dependencies.set` (dependent work order, authorized typed targets) | Allow | Allow own job | Deny |
| `job.work_order_dependencies.set` (dependent parent job, new work-order targets only) | Existing manager Jobs.Edit | Deny absent independent manager role | Deny |
| Files/Documents/bookings/time/parent full-card/lifecycle/economy | Existing independent policy | Existing independent policy | Existing independent policy |

Required eligibility on additions/status/edits is current and locked. A previously assigned person losing eligibility must not block an entitled writer removing that old assignment; the stale assignment grants no authority. Job designation alone never grants reopen, money or Files. Parent/job IDs cannot be changed by child edits. Concurrent same-record saves use current expected-state checks; actor/target revocation, replacement, profile archival, replay and injected audit failure leave no stale or partial mutation.

### Acceptance Criteria

- **AC01:** Given either job kind and an Admin/PL or current own-job lead, when they create/edit work orders through the actual list/cards/detail pane and reload, then title/description/own nullable dates and plural eligible assignees persist under the same parent with one attributable outcome; other-job leads, ordinary members/assignees, foreign/inactive targets and parent spoofing fail without writes or role changes.
- **AC02:** Given each lifecycle state and actor combination, when ordinary transitions and deliberate reopen are attempted via UI and checked SQL, then exactly the approved graph is enforced, only Admin/PL reopens and all parent job statuses/events/completion actions remain unchanged. Create/full-update/direct table/helper calls cannot bypass it.
- **AC03 / TR06:** Given job→work-order, work-order→job and distinct same-parent/cross-parent work-order prerequisites, when selected references or actual endpoint dates are edited and the workspace reloads, then same-tenant/parent/read scope is enforced and prerequisite actual end>dependent actual start visibly warns; equality/earlier clears and missing/unreadable facts show unknown without hidden metadata. Work-order dates never borrow parent dates. Old card/dependency saves retain new rows; new saves retain old job-only rows. FK/schema alone does not satisfy this criterion.
- **AC04:** Given current versus revoked membership/lead/roles/profile/assignee/parent state while a mutation or replay waits, when it resumes, then locked current authority/eligibility and stale-state/request identity rules decide the outcome; no stale write, duplicate audit or partial assignment/dependency mutation occurs, and injected audit failure rolls everything back. Profileless independently authorized managers still succeed.
- **AC05:** Given independently entitled versus unentitled actors and work-order files, when actual upload/link/open/selected signed access/archive/restore/context navigation run, then the shared private file system and both child/parent source checks agree. Foreign/wrong-owner/archived-parent substitutions and lead-only file attempts fail; money/auth/private-person fields remain structurally absent unless independently entitled.
- **AC06:** Given current parent read permission across seeded/multi-role/designation variants, when work orders are listed/opened directly or through navigation, then only current authorized parent scope is returned; assignment alone adds no grant. Current16.1/16.2 create/search/list/MyJobs/detail/crew/date behavior, independent protected consumers and E15 booking v3/current-facts/replay contracts remain unchanged.
- **AC07:** Given connected360×640 use with delayed/stale/error/uncertain save responses, when users create/edit/assign/change status/dates/dependencies and retry/refetch, then semantic labels/focus/errors remain usable, entered state and consent baseline are retained, late responses cannot consume newer edits and success appears only after persistence. Essential real browser smoke proves usable create/edit/reload, lead versus reopen denial, dependency warning and own files; broad release matrices are tracked separately.

## Shared-path, migration and resource handoff

Planning grants no implementation ownership. Before overlapping edits root communicates exact logical rows and reconciles actual diffs; no foreign dirty-file import, cross-thread workaround or blanket ACK gate. E15 current15.4 owns TimeReports/AdminPL review/in-app nudge;16.3 adds none of these.

| Exact prospective seam |16.3 bounded change / preserve |
| --- | --- |
| `src/server/authz/permission-matrix.ts`, `src/server/commands/envelope.ts`, `envelope-core.ts`, `src/server/authz/job-command-scope.ts` | New explicit work-order rows/scoped mapping only; preserve E15 time/series/resolver rows and all16.2 mappings; SQL repeats authorization |
| `src/scope/manifest.ts` | Three work-order tables+one owner in jobs only; preserve all scheduling/TimeReports/notification enrollments |
| `src/app/(app)/jobs/[jobId]/page.tsx`, `src/components/jobs/JobDetailView.tsx` | Work-order caller/panel only; preserve E15 time-report caller integration and existing16.2 forms. Other E15 caller pages are excluded |
| `tests/support/authz/role-harness.ts`, `tests/integration/rls/role-harness.atdd.int.test.ts`, `migration-reset.int.test.ts`, `cross-tenant-isolation.rls.test.ts` | Work-order projection/ACL/real fixtures only; retain TimeReports/series/provisioning/H4 meanings and exhaustive negative cases |
| `src/server/read-models/document-sources.ts`, `document-context.ts`, shared file owner files and new migration document functions | Add only work-order branch with current parent authorization; preserve all old selected-source/archive-origin/restore guards |
| Existing v3 booking SQL/facts/proof/finalizers, `src/features/scheduling/capacity.ts`, E15 series/resolver/TimeReports SQL, notification registry/jobs runner/readers/views/E2E | Read-only here; no new booking linkage, proof version, capacity, series or notification producer is required by this story |
| `package.json` | Essential work-order smoke argument only before reporter; preserve all prior smoke files/scripts/dependencies |

Own checkout inspected104 migration filenames, latest `20261019191746_e16_16_2_job_members.sql`. Root independently inspected E15's LOCAL branch filenames (not a claim they are remote/committed here):105 `20261019180000_recurring_booking_series.sql`;106 `20261019220000_booking_series_integrity_followup.sql`;107 `20261020000000_booking_series_cancelled_role_retention.sql`;108 `20261020180000_conflict_resolver.sql`. Reservation109 `20261020190000_time_reports.sql` was absent from that listing. All historical files remain immutable. Plan-only candidate `20261020200000_e16_16_3_work_orders.sql` sorts after actual+reserved histories but is **UNRESERVED, UNCREATED**. Before creation root rechecks combined actual/reserved chronology and author uses established Supabase CLI help/workflow for a fresh supported distinct filename; report actual name before SQL. Do not copy other-branch SQL or assume numbering integrates it.

No runtime starts during plan. Implementation can proceed in independent domain/UI/command slices under admitted claims; verification uses root's uniquely owned standard checked-in CI helper for an exact independently reviewed checkpoint if current local guard context is unavailable. Any local database/browser later needs this actor's valid guard admission, isolated configuration/unique project/ports and documented ownership; never adopt E15/user resources or native Supabase lifecycle/reset. No .env/provider/secret/CI-admission-variable workaround. Root owns CI dispatch/cleanup; report actual executed counts, skips and failed attempts. No identified unfinished E15 product contract blocks this plan.

## Spec Change Log

## Review Triage Log

## Design Notes

Owner-authorized presentation/validation defaults: progressive existing Arbetsorder section, list/cards plus selectable detail pane under the job URL, Swedish accessible labels, optional own date fields defaulting unknown, required bounded title/plain description, and separate command-specific draft/baseline models. The typed new dependency table keeps old job-only writes lossless and supports real same-parent sequencing without changing booking proofs. No generic permissions/state framework, optimizer or legacy observation is introduced. Keep future16.4 consumers and16.5 whole workspace requirements outside this implementation.

## Verification

Planning evidence: clean8031726d after root refresh, installed renderer native0 exactly once, valid cached context/completed16.2 continuity, reused two High source explorations, narrowly refreshed current seams/filenames and self-review. No code, migration reservation, application test, runtime or new independent implementation review executed during planning.

After root approves this plan: Phase4 high-risk ATDD → implementation with all ACs activated → configured independent Sol6.1 High sensitive review (three-round cap and truthful focused reuse) → exact-head required CI → author delivery record/root delivery_gate/provenance before any done claim. Required commands use checked-in scripts: `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm build`, source/bundle containment; full empty-history migration/seed plus `SUPABASE_TEST_REQUIRED=1 pnpm test:int`, direct recovery-storage integrity and applicable pilot performance; `pnpm test:smoke` with production Playwright webServer. Report actual passed/failed/skipped counts. Dedicated domain/SQL tests cover every matrix row, both container kinds, all operation/role pairs, actual endpoint calendar dates, old/new dependency retention, file-selected-link lifecycle, current-authority revocation races, replay and audit rollback. Required integration/skipped cases are never credited as pass.

Broad device/browser matrices, screenshot/visual/manual breadth are owned release-only validation under2026-10-19 policy (E16 UI/release owner; next action deliberate release-validation dispatch/manual design review before release approval). Record these in delivery and supported frontmatter/ledger at completion, never as deferred functional failures. Implementation author writes one final Suggested Review Order from actual code/evidence and runs `node scripts/verify/check-review-order.mjs` on this spec. Before development-complete, write `_bmad-output/auto-bmad/delivery/16-3-arbetsorder.json`; root runs actual delivery_gate and independent High provenance review before explicitly authorizing done. No release readiness/deployment claim follows from planning or development completion.

## Auto Run Result

Status: ready-for-dev
Blocking condition: none

HALT after planning. Clarified contract and seven outer-surface ACs pass the ready-for-development self-review: named ordered tasks, closed actor/lifecycle/date/dependency semantics, own-file integration, precise shared handoff and planned verification. The narrow read-projection clarification preserves unknown prerequisites without direct-table identifier leakage. Original blocked artifact and both direct-human decisions are preserved. No implementation, migration reservation, application test or release claim. Next phase: root plan approval/parser pin, then Phase4 high-risk ATDD; implementation remains separately admitted.
