---
title: 'Story 16.3 — Arbetsorder'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
baseline_revision: '1e8632db1ad051d117c38d2e24ed5d62fc2c8a57'
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

### 2026-10-20 — Review pass

Scope: all six actual configured independent layers completed Round1 over the original55-file candidate. This canonical entry preserves the parent-held deduplicated disposition and the one causal fix batch; source-addressed is not independent acceptance or executed runtime evidence.

- intent_gap: 0
- bad_spec: 0
- patch: 10: (high 5, medium 5, low 0)
- defer: 0
- reject: 3: (high 0, medium 0, low 3)
- addressed_findings:
  - `[high]` `[patch]` P1 coherent snapshot/token; P2 original create identity recovery; P3 hidden-edge preservation and observed visibility consent; P5 eligible alternate file sources; P8 originating pane generation.
  - `[medium]` `[patch]` P4 correctly associated anonymous warnings; P6 foreign/nonexistent helper privacy; P7 complete-graph lifecycle hints; P9 direct authenticated Storage revocation controls; P10 exact parent-job warning assertions.

Initial recommendation for this original pass: true (High5, Medium5, Low0; weighted score15 and High patches present). Preserve this history when targeted follow-up evaluates the fixed state. No new broad review was launched by the author.

| Finding | Causal source fix | Regression evidence / limit |
| --- | --- | --- |
| P1 High: old visible fields could share a newer token | Read RPC and every nested read-only digest helper are STABLE; writer digest helpers remain VOLATILE so post-write audit/replay retain their existing semantics. | INT-008 holds an observed advisory barrier around the real authenticated read statement while a checked update commits, asserts the old visible value/token agree and that save rejects unseen changes. Authenticated SQL/runtime pending CI. |
| P2 High: lost create plus intervening mutation could duplicate | Ordinary stale/replay rules remain; create adapter can call only read-only original-outcome reconciliation with identical actor, tenant, parent, command, correlation, original token and payload. Current authority and current child coherence still gate the existing ID; no input is applied and no audit is written. The UI keeps uncertain creates on that original command and offers no fresh-ID refetch path. | Adapter2tests passed; INT-009 and essential E04 retain one original child/audit after intervening mutation, reject changed identity/revoked authority and preserve newer input. Runtime/browser pending CI. |
| P3 High: visible replacement silently removed hidden edges | Replacement deletes only readable, eligible existing edges. The current readable edge-ID set participates only in the comparison hash, so hidden-to-readable changes invalidate an old form; hidden identifiers stay absent from DTOs. | RLS-002 now asserts hidden edge/warning survive a visible dependency edit and empty visible replacement; a later visibility grant makes the observed form stale with no write. Pending CI. No implicit hidden-edge removal remains. |
| P4 Medium: anonymous warning polluted every pane | Unknown warning includes only its readable dependent endpoint; both panel and pane consume exact dependent selection. | Consumed-model unit assertions cover childA, siblingB, parent and foreign/unscoped signals without exposing hidden prerequisite metadata; passed. |
| P5 High: any alternate link bypassed current source checks | Alternate must have an active link, allowed purpose, live coherent ancestry, independent source authority and applicable artifact provenance. Generic sign checks and locks a genuinely eligible selected alternate. | Seven separately budgeted FILE-INT-004 cases cover sole source, same archived parent, wrong purpose, archived link/customer, missing/foreign owner; FILE-INT-005 retains a valid alternate. Pending CI. |
| P6 Medium: helper existence oracle | Caller Files/tenant or path-tenant authority is checked before source existence. Foreign present/absent both return false; legitimate own-tenant bytes-before-metadata upload behavior remains. | FILE-INT-006 directly calls the authenticated boolean helpers for foreign/unknown IDs and paths with authorized-own and unentitled controls. Pending CI; no blanket grants changed. |
| P7 Medium: hidden invalid graph advertised lifecycle action | Authorized Documents rows obtain a checked complete-source-graph boolean before archive/restore hints; no hidden link metadata is returned. Checked lifecycle mutation remains the final guard. | Six focused read-model cases passed for active/archive modes and true/false/fault; FILE-INT-005 compares actual filtered hints and checked operations with a hidden invalid alternate. Runtime pending CI. |
| P8 High: late create attached identity to a newer pane | Completion carries the originating pane generation; the consumed selection model may refresh data but cannot reopen a closed pane, replaceB or attachA to a newer draft. | Actual RED missing-selection-model failure then2new consumed-model tests passed, including repeated/abandoned completions. No source-token-only assertion. |
| P9 Medium: direct Storage revoke path absent | Previously known object bytes are downloaded through the real authenticated Storage API after parent expiry, separately from checked signing. | FILE-INT-004 denies/no bytes after sole/all-invalid sources; FILE-INT-005 proves a genuinely live alternate still reads. Pending CI. |
| P10 Medium: broad warning .some accepted a child decoy | Existing typed-form assertions select exact dependent and prerequisite endpoints and dates. Separate parent-edge date cases cannot be satisfied by unrelated child warnings. | Three independent INT-003 parent cases assert delay/equality/unknown on `{jobId,workOrderId:null}`, preserving original old/new edge retention tests. Pending CI. |

Rejected3Low required-patch suggestions: SPA navigation draft persistence; tenant-lock performance hardening without an identified operation-control bypass; unused generic Documents upload hint. They add no accepted invariant repair and were not implemented. No intent gap, bad spec or review deferral was introduced.

Review provenance: parent-held `review-provenance.json` in the private Round1 directory records the five subagent results and exact source diff. External configured receipt `cross-model.diff.review` completed native0, SHA256 `3194c93b376581cbd1bbe12da374edc320176f6af2f55a93e889bea677873ee6`. The parent drives same-High targeted follow-up on these fixes/regressions only.


### 2026-10-20 — Targeted regression follow-up

The same High blind reviewer identified two regressions in the first fix batch. This is a separate focused result, not a rewrite of original10patch/3reject history: (1) definitely rejected, never-committed first creates were permanently uncertain; (2) an abandoned pane's snapshot replaced the current projection before generation validation and could unmount a newer draft. Parent reported the focused Security result as qualified PASS for P5/P6/P7/P9. No additional broad audit or rejected suggestion was implemented.

The same High author verified the actual SQL/adapter/pane callers and repaired only these two causal paths. Serialized, currently authorized reconciliation now distinguishes absent original outcome (`BK404`) from mismatched existing identity (`BK409`). The existing create-only adapter maps absence to `COMMAND_CONFLICT`; no shared error registry or global permission changes were needed. A definitely rejected first submission may explicitly refetch, retain its draft and consent to a new command. A prior unresolved transport attempt remains on its original identity even if a later lookup sees absence; it cannot obtain a fresh command ID from this recovery flow. Original successful-create identity recovery, canonical binding, current authority and ordinary replay guards remain intact.

The panel now checks originating generation before any projection assignment, for create and ordinary child receipts. Repeated/non-adoptable create results are also rejected before replacing data. Its consumed guard regression retains B's projection, selected row and draft when A's stale snapshot omits B.

Actual RED: the added focused adapter/consumed-state assertions ran4passed/3failed/0skipped before fixes. After fixes, the same families plus existing domain assertions ran13passed/0failed/0skipped. The two new runtime assertions (INT-010 and essential E05) prove no-outcome stale create → explicit refetch/consent → one creation; authored and collected only, pending required CI. Existing lost-success INT-009/E04 remains unchanged. Latest typecheck, affected8-file ESLint, justified production build and source/bundle containment passed; unchanged full-unit groups were not repeated. Previous full2670passed/1Windows-xattr-skip evidence remains historical and applicable to unchanged groups, not a newly executed full run.

Security-qualified dependency preservation: no Files/Documents source or tests changed; the file integration suffix after its marker was compared and preserved byte-for-byte, raw SHA256 `df99007757e27fe5342d0778b9673891a4d9d0ec6c10c8b079b7c3720dd88527`. Only reconciliation's earlier no-outcome branch changed in SQL. Current collection:42integration/RLS cases and5essential Chromium journeys,0runtime executions. The same reviewer recheck, exact-checkpoint CI and delivery/provenance gates remain pending; spec stays in-review. No new completion or release claim.

### 2026-10-20 — Review pass

Scope: the parent's actual qualified focused-review union over the final fixes and unchanged dependencies. Same blind Sol6.1 High reviewer returned qualified PASS on both targeted regressions: production helpers are wired, current authority/request binding and original uncertain identity remain enforced, and abandoned create/non-create receipts are rejected before projection assignment. No new consequential regression or unresolved serious finding was reported. Focused Security qualified PASS for P5/P6/P7/P9 is reused only for its verified unchanged suffix and Documents dependency bytes.

- intent_gap: 0
- bad_spec: 0
- patch: 0: (high 0, medium 0, low 0)
- defer: 0
- reject: 0: (high 0, medium 0, low 0)
- addressed_findings:
  - Actual same-reviewer qualified PASS closes the two recorded focused regressions; the original10patch/3Lowreject and targeted2finding history above remains unchanged.
  - Security reuse is bound to the current SQL file suffix at byte offset37872, length69393, SHA256 `df99007757e27fe5342d0778b9673891a4d9d0ec6c10c8b079b7c3720dd88527`; Documents source and its two test hashes match the recorded `955236aae8f7ef54ad5990eb6ce4fb323ae78fc907806ee52163619d9173b704` candidate inventory.

Latest follow-up recommendation: false under the actual policy (High0, Medium0, Low0; score0; no unresolved serious findings). This reflects the actual qualified focused results and verified reuse, not a reset of the original pass. Required exact-checkpoint CI/runtime, delivery gate and provenance remain pending. Status remains in-review; runtime executions0; no development-complete, done or release-ready claim.

## Design Notes

Owner-authorized presentation/validation defaults: progressive existing Arbetsorder section, list/cards plus selectable detail pane under the job URL, Swedish accessible labels, optional own date fields defaulting unknown, required bounded title/plain description, and separate command-specific draft/baseline models. The typed new dependency table keeps old job-only writes lossless and supports real same-parent sequencing without changing booking proofs. No generic permissions/state framework, optimizer or legacy observation is introduced. Keep future16.4 consumers and16.5 whole workspace requirements outside this implementation.

## Verification

Planning evidence: clean8031726d after root refresh, installed renderer native0 exactly once, valid cached context/completed16.2 continuity, reused two High source explorations, narrowly refreshed current seams/filenames and self-review. No code, migration reservation, application test, runtime or new independent implementation review executed during planning.

After root approves this plan: Phase4 high-risk ATDD → implementation with all ACs activated → configured independent Sol6.1 High sensitive review (three-round cap and truthful focused reuse) → exact-head required CI → author delivery record/root delivery_gate/provenance before any done claim. Required commands use checked-in scripts: `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm build`, source/bundle containment; full empty-history migration/seed plus `SUPABASE_TEST_REQUIRED=1 pnpm test:int`, direct recovery-storage integrity and applicable pilot performance; `pnpm test:smoke` with production Playwright webServer. Report actual passed/failed/skipped counts. Dedicated domain/SQL tests cover every matrix row, both container kinds, all operation/role pairs, actual endpoint calendar dates, old/new dependency retention, file-selected-link lifecycle, current-authority revocation races, replay and audit rollback. Required integration/skipped cases are never credited as pass.

Broad device/browser matrices, screenshot/visual/manual breadth are owned release-only validation under2026-10-19 policy (E16 UI/release owner; next action deliberate release-validation dispatch/manual design review before release approval). Record these in delivery and supported frontmatter/ledger at completion, never as deferred functional failures. Implementation author writes one final Suggested Review Order from actual code/evidence and runs `node scripts/verify/check-review-order.mjs` on this spec. Before development-complete, write `_bmad-output/auto-bmad/delivery/16-3-arbetsorder.json`; root runs actual delivery_gate and independent High provenance review before explicitly authorizing done. No release readiness/deployment claim follows from planning or development completion.

## Auto Run Result

Status: in-review
Blocking condition: none

HALT after planning. Clarified contract and seven outer-surface ACs pass the ready-for-development self-review: named ordered tasks, closed actor/lifecycle/date/dependency semantics, own-file integration, precise shared handoff and planned verification. The narrow read-projection clarification preserves unknown prerequisites without direct-table identifier leakage. Original blocked artifact and both direct-human decisions are preserved. No implementation, migration reservation, application test or release claim. Next phase: root plan approval/parser pin, then Phase4 high-risk ATDD; implementation remains separately admitted.


## Build invocation and implementation route — 2026-10-20

Formal Build Auto invocation uses this absolute spec path only. Source baseline `1e8632db1ad051d117c38d2e24ed5d62fc2c8a57` was clean before this metadata write. Before dispatch: context-free implementation author, `gpt-6.1-sol`, effort `high`, reason actual tenant/RLS/current-job authorization, shared files and atomic audit/replay contracts. Every sensitive nested handoff remains explicit Sol6.1 High; isolated ordinary presentation may use Low. Root exclusively owns Git/index/CI/state/sprint/ledger/report. The author returns a verified source checkpoint for independent configured reviews and root CI; done requires actual required evidence, root delivery gate, independent provenance and explicit root closure authorization. Planning HALT text above is retained history, not current development completion.

## Implementation author trail — 2026-10-20 source checkpoint

Author route: Sol6.1 High for tenant authorization, SQL/RLS/current facts, audit/replay and shared Files. Two context-free Sol6.1 High workers owned the isolated presentation/read/action and Files/Documents branches; both returned terminal, frozen source. No independent implementation review has run yet. Root retains every Git/index/commit/push/PR/CI/state/sprint/report/ledger operation. This spec remains in-progress.

Implementation choices follow the approved intent. New work-order commands have a distinct `Jobs.WorkOrders.Edit` matrix capability and only the five declared child operations enter the current-lead exception; parent-job typed dependencies retain `Jobs.Edit`. SQL repeats current authority and manager-only reopen after stable locks, even on replay. The transaction locks a stable ordered tenant superset of memberships, roles, jobs, profiles, members, children and edges, using the existing tenant advisory gate; runtime performance and revocation evidence remain required. No parent dates, identities, events, booking facts or proof versions are updated.

Work-order fields are closed full snapshots; the ATDD adapter fills omitted field patches from its real current projection before calling the full-snapshot command. Command IDs, correlation IDs and immutable submitted payloads remain fixed across uncertain retries. The work-order-specific confirmation helper preserves a newer edit even when the user undoes it back to the pre-submit value; that case moves only the comparison baseline to the confirmed value while retaining the old consent token. Existing16.2 helpers are unchanged. SQL trims the same whitespace family as the pure validator and stores nullable calendar dates directly.

The typed dependency table is separate from old job-only dependencies so each writer preserves the other family. Both endpoint parents and optional children are relational. The checked read projection omits unreadable endpoints and emits only `{state:"unknown"}` for them; readable endpoints compare their own actual dates. The projection adds a readable-only saved `dependencies` array and an independent manager-only `canEditJobDependencies` flag for the pane. Person profiles have no display-name column; this new DTO uses stable `Person <id-prefix>` labels instead of introducing auth/email payloads.

The same job URL uses `?workOrder=<id>`, operation-specific controls, per-control consent baselines, immutable uncertain attempts and explicit refetch/retry. Shared Files is composed only for the selected authorized work order and independent Files permission. Files/Documents extends existing owner/purpose/signing/lifecycle functions forward; all old owner branches survive. Current child plus parent source checks also restrict raw file/Storage reads. Selected-source signing retains an independently valid alternative source; archive/restore checks the complete source graph.

### Exact changed inventory and shared subranges

New production files: `src/features/jobs/work-orders-domain.ts`; `src/server/commands/jobs/work-orders.ts`; `src/server/commands/jobs/work-orders-db.ts`; `src/server/read-models/job-work-orders.ts`; `src/components/jobs/JobWorkOrdersPanel.tsx`; `src/components/jobs/WorkOrderPane.tsx`; `supabase/migrations/20261020200000_e16_16_3_work_orders.sql`. New focused test: `tests/unit/server/read-models/job-work-orders.test.ts`.

Existing production changes: `src/server/commands/jobs/index.ts` (six exports); `src/server/commands/envelope.ts` (six registry rows); `src/server/authz/job-command-scope.ts` (five child mappings); `src/server/authz/permission-matrix.ts` (one child edit capability); `src/scope/manifest.ts` (three jobs tables and one owner); `src/features/jobs/actions.ts` (fixed new work-order actions only); `src/app/(app)/jobs/[jobId]/page.tsx` (read/pane/selected Files caller); `src/components/jobs/JobDetailView.tsx` (panel slot); `package.json` (one smoke argument before reporter).

Existing Files/Documents changes: `src/server/commands/files/validation.ts`; `src/server/commands/files/file-db.ts`; `src/features/files/file-index.ts`; `src/components/files/EntityFilePanel.tsx`; `src/server/read-models/document-sources.ts`; `src/server/read-models/document-context.ts`; `src/features/documents/filters.ts`. Necessary bounded caller extensions: `src/features/files/revalidate-route.ts::resolveRevalidateRoute(parentJobId)`; `src/features/files/actions.ts::readParentIds(revalidate_job_id)`; `src/components/files/RevalidateFields.tsx` (optional parent hidden field); `src/components/files/FilePreviewRow.tsx` (parent forwarding); `src/features/documents/context-navigation.ts::documentsContextUploadOwner` (work-order branch). These only enroll/refresh the new owner path; no existing role or owner branch is replaced by work-order authority.

Existing ATDD activation/adapter changes: `tests/unit/features/jobs/work-orders-domain.test.ts`; `tests/unit/server/commands/work-order-file-contract.test.ts`; `tests/integration/commands/work-orders.int.test.ts`; `tests/integration/commands/work-order-files.int.test.ts`; `tests/integration/rls/work-orders.rls.test.ts`; `tests/e2e/jobs/work-orders.e2e.spec.ts`; `tests/support/work-orders-atdd.ts`. Original29 assertions are retained; the create/profileless-manager, lifecycle and both-kind file groups now have separate fixtures, expanding the scenario count to36 without raising the global timeout or weakening assertions.

Existing bounded enrollment/fixture tests: `tests/integration/rls/migration-reset.int.test.ts` (three tables and two new restrictive file SELECT policies); `tests/integration/rls/cross-tenant-isolation.rls.test.ts` (real new child rows and nonvacuous mutation controls); `tests/integration/rls/role-harness.atdd.int.test.ts` (new real fixture IDs); `tests/support/authz/role-harness.ts` (three projection/adapter enrollments); `tests/support/jobs-depth-atdd.ts` (lazy work-order H4 fixture); `tests/integration/rls/tenant-table-inventory.ts` (exhaustive new-table union and spoof/filter/mutation shapes); `tests/unit/scope/manifest-derivations.test.ts`; `tests/unit/scope/manifest-shape.test.ts`; `tests/unit/scope/manifest-invariants.test.ts` (actual54-table/eight-owner pinned sets); `tests/unit/server/authz/command-enrollment.test.ts`; `tests/unit/server/authz/permission-matrix.test.ts`; `tests/unit/server/commands/envelope-core.test.ts`. Necessary additional inventory seams preserve the fail-loud complete set rather than excluding new tables.

Existing Files tests extended: `tests/unit/server/commands/files/validate-upload-file.test.ts`; `tests/unit/features/files/file-index.test.ts`; `tests/unit/server/read-models/document-sources.test.ts`; `tests/unit/server/read-models/document-context.test.ts`; `tests/unit/features/files/revalidate-route.test.ts`; `tests/unit/features/documents/context-navigation.test.ts`. This author spec is the final changed document. No historical migration or blocked original16.3 spec was edited.

Migration provenance: CLI2.115.0 supported `supabase migration new e16_16_3_work_orders` created `20261020092751_e16_16_3_work_orders.sql`, length0. After root's fresh own104/E15actual109 filename check and destination-absence verification, only that newly owned empty file was renamed to approved later filename `20261020200000_e16_16_3_work_orders.sql`, length0 before SQL. All SQL was authored there; the worker's temporary forward fragment was appended once. No DB schema or migration execution is claimed.

### Initial source verification before Round1 fixes and remaining required evidence

The initial uncommitted source checkpoint was based on `baseline_revision` above. Its actual executed checks: `pnpm typecheck` exit0; `pnpm lint` exit0 with0errors/14existing warnings after correcting two ATDD adapter local-variable names; `pnpm test:unit`2660passed/0failed/1skipped (2661total,100suites); `pnpm build` exit0; source service-role containment passed; built-bundle containment passed. The only unit skip is `versioned file-backend restore preserves the DB-owned identity and refuses overwrite`: Windows lacks Linux xattrs, and Ubuntu required CI must execute it. Latest focused domain/DTO/enrollment/core lane24passed/0failed/0skipped. Files worker's focused9-file lane177passed/0failed/0skipped. The three Chromium work-order journeys were collected by `pnpm exec playwright test tests/e2e/jobs/work-orders.e2e.spec.ts --list`; collection is not browser execution.

Local guard was unavailable under the root contract; no server, database, Storage, browser, provider, secrets or deployment was started. Required empty-history migrations/seed, `SUPABASE_TEST_REQUIRED=1 pnpm test:int`, direct recovery-storage integrity, applicable pilot performance and essential production Playwright smoke remain unexecuted and must be proven by root-owned CI for the exact independently reviewed checkpoint. Independent configured review, the delivery record/gate and explicit root done authorization are still outstanding. No development-complete, done, source-runtime-pass or release-ready assertion is made.

Broad browser/device matrices, screenshot/visual/manual breadth remain deferred release validation under the dated development-completion policy. Owner: E16 UI/release owner. Evidence/status: deferred, no new execution. Next action: deliberate release-validation dispatch/manual design review before release approval. Required functional, integrity, DB and essential browser checks remain development requirements.

### Round1 fix-batch source verification and inventory

All10accepted findings received one causal source/test batch; both original workers returned terminal frozen source. Additional explicitly authorized graph seam: `src/server/read-models/documents.ts` plus its existing `tests/unit/server/read-models/documents.test.ts`. New focused files: `tests/unit/server/commands/work-orders-db.test.ts` and `tests/unit/features/jobs/work-order-selection.test.ts`. Original55-file inventory plus these4paths yields59candidate files. Batch changes otherwise remain in original work-order SQL, adapter/domain/pane/panel, original work-order integration/RLS/browser tests and this author spec. No frozen intent/approval content or historical migration changed; the pinned intent text was compared exactly against the Round1 private copy.

Actual latest checks: focused domain/selection/DTO/adapter12passed/0failed/0skipped; worker Documents/source lane157passed/0failed/0skipped; full `pnpm test:unit`2670passed/0failed/1skipped (2671tests,100suites). The sole skip remains the pre-existing Windows/Linux-xattr restore case; Ubuntu required CI must execute it. `pnpm typecheck`, full `pnpm lint` (0errors/14existing warnings), `pnpm build`, source and built-bundle containment passed. Initial selection regression was RED before the consumed model existed, then passed; there is no claimed SQL/runtime RED-to-green execution. A transient in-progress selection weak-type error was repaired before final typecheck. Latest integration/RLS collection lists41scenarios; Chromium lists4essential journeys. Collection executes0database/browser scenarios and credits no acceptance pass.

Snapshot SQL/authenticated concurrency, original-create SQL recovery, complete-graph source predicates, direct Storage/no-bytes checks, full empty-history migration/seed, required integration/RLS/recovery/performance and essential browser execution still need root-owned exact-checkpoint CI after targeted independent review. Spec stays in-review; no development-complete, delivery or release-ready record is asserted. The private final candidate inventory carries every actual path/SHA; no new repository intermediates were created.

## Suggested Review Order

Author: the same Story16.3 Sol6.1 High implementation/fix author, using the recorded isolated workers.
Refreshed against the original Round1 batch and its two bounded follow-up regressions; review provenance and runtime limits remain explicit above.

### Start at pane selection and retained create attempts

The same job URL/pane remains, but abandoned receipts are rejected before projection replacement; late create completion adopts only its originating still-open generation. Exact dependent filtering keeps an anonymous hidden-prerequisite signal on its readable child or parent (AC01/03/07; P2/P4/P8).

- `src/components/jobs/JobWorkOrdersPanel.tsx:10` — `JobWorkOrdersPanel`: binds completion to current selection and its originating generation.
- `src/components/jobs/WorkOrderPane.tsx:72` — `WorkOrderPane`: keeps uncertain creates on the original immutable attempt.
- `src/features/jobs/work-orders-domain.ts:102` — `canReceiveWorkOrderPaneProjection`: rejects abandoned generations before accepting their snapshots.
- `tests/unit/features/jobs/work-order-selection.test.ts:36` — `16.3 abandoned pane`: retains the newer row, projection and draft under stale completion.

### Follow original identity recovery without reapplying stale input

Ordinary checked mutations retain locked current authority, manager-only reopen and existing stale/replay checks. The recovery RPC returns an existing canonically bound creation outcome or distinguishes serialized absence from mismatched identity; it cannot apply old fields or write another audit. Only a definitely rejected first create can refetch/consent; prior transport uncertainty keeps the original identity (AC02/04/06; P2).

- `src/server/commands/jobs/work-orders-db.ts:27` — `BK404`: maps only proven create absence to explicit conflict recovery.
- `supabase/migrations/20261020200000_e16_16_3_work_orders.sql:242` — `reconcile_work_order_create`: checks current authority and original request binding before returning identity.
- `tests/integration/commands/work-orders.int.test.ts:435` — `16.3-INT-010`: requires absence proof and new consent before exactly one creation.
- `tests/integration/commands/work-orders.int.test.ts:411` — `16.3-INT-009`: asserts one original child/audit after an intervening durable edit.

### Inspect coherent snapshots and visible-edge consent

Read RPC/digest helpers share one STABLE snapshot; mutation helpers retain their write-aware snapshot semantics. Omitted hidden edges survive replacement, and visibility changes stale an older observed form without exposing hidden IDs (AC03/TR06/04/06; P1/P3/P4/P10).

- `supabase/migrations/20261020200000_e16_16_3_work_orders.sql:294` — `read_job_work_orders`: returns fields, warnings and token from one snapshot.
- `supabase/migrations/20261020200000_e16_16_3_work_orders.sql:73` — `work_order_visible_edges_internal`: binds observed visibility only into consent hash material.
- `tests/integration/commands/work-orders.int.test.ts:381` — `16.3-INT-008`: controls a concurrent checked update and rejects unseen-field overwrite.
- `tests/integration/rls/work-orders.rls.test.ts:75` — `16.3-RLS-002`: proves hidden retention, privacy and hidden-to-readable stale consent.

### Validate current alternate sources and complete lifecycle hints

A stale non-work-order alternate no longer grants bytes; only an independently eligible live selected source does. The Documents caller separately asks a checked complete-graph boolean before lifecycle hints, preserving hidden-link privacy and the final checked mutation guard (AC05/06; P5/P6/P7/P9).

- `supabase/migrations/20261020200000_e16_16_3_work_orders.sql:370` — `story_16_3_file_link_source_eligible`: checks purpose, ancestry, source authority and artifact provenance.
- `src/server/read-models/documents.ts:169` — `document_lifecycle_source_graph_eligible`: obtains metadata-free eligibility for the complete graph.
- `tests/integration/commands/work-order-files.int.test.ts:269` — `16.3-FILE-INT-005`: preserves live-alternate bytes while withholding invalid full-graph lifecycle hints.
- `tests/integration/commands/work-order-files.int.test.ts:301` — `16.3-FILE-INT-006`: directly compares foreign present/unknown helper probes.

### Assess exact regressions and evidence limits

The added regression assertions target the reported causal paths. Mocked read-model/adapter tests validate projection and dispatch, while actual SQL, Storage and browser bodies remain authored and collected for required CI (P7/P9/P10; AC03/05/07).

- `tests/integration/commands/work-orders.int.test.ts:366` — `16.3-INT-003 parent job`: selects exact parent-job endpoints for delay, equality and unknown.
- `tests/integration/commands/work-order-files.int.test.ts:237` — `16.3-FILE-INT-004`: retries authenticated known-path bytes after all valid sources expire.
- `tests/unit/server/read-models/documents.test.ts:334` — `[16.3][P7]`: tests active/archive complete-graph true, false and fault outcomes.
- `tests/e2e/jobs/work-orders.e2e.spec.ts:375` — `16.3-E05`: retains a definitely rejected first-create draft through explicit consent; E04 retains lost-success recovery.

Evidence: latest affected13unit passes/0skips after observed4pass3fail RED; latest typecheck, affected lint, production build and containment passed. Prior full2670unit passes/one named Windows xattr skip were not rerun for unchanged groups. All20review stops resolve; current42integration/RLS plus5browser cases are collected but unexecuted. The actual same-High qualified focused-review union is recorded in the latest canonical pass above; required exact-checkpoint CI and delivery/provenance gate remain outstanding. Release breadth remains deferred under the dated completion policy and authorizes no deployment.
