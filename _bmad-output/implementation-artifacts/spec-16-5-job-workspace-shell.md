---
title: 'Job Workspace Shell'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
story_id: '16.5'
story_key: '16-5-job-workspace-shell'
epic: 16
baseline_revision: 'f96256a066db7e38d482e4538f2a0ba2472cf4b8'
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

**Round 1 of 3**

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 11: (high 1, medium 8, low 2)
- defer: 0
- reject: 3: (high 0, medium 0, low 3)
- addressed_findings:
  - `[medium]` `[patch]` Page the safe event projection with timestamp/ID ordering; the 1000-row truncation regression failed before and passes after repair.
  - `[medium]` `[patch]` Bound workspace scrolling so its header persists without changing AppShell.
  - `[medium]` `[patch]` Place header/modal stacking above workspace navigation; add the real backdrop/navigation regression.
  - `[high]` `[patch]` Reconcile child history with current selection and file ownership through existing dirty/pending protection; add two-child Back coverage.
  - `[medium]` `[patch]` Adopt late creation against the live query without stealing a subsequently selected tab or return parameter.
  - `[medium]` `[patch]` Retry a root read at the current URL without discarding tab/child context.
  - `[medium]` `[patch]` Retry work-order/member reads without unloading another mounted panel's draft.
  - `[medium]` `[patch]` Label cancelled booking intervals explicitly in the new mini-timeline.
  - `[low]` `[patch]` Rebind the retained traceability journey to Filer/Händelser without deleting its assertions.
  - `[medium]` `[patch]` Protect dirty/pending/unresolved full-card state on reload or route exit, disarming only after confirmed save; preserve the payload/attempt/window construction.
  - `[low]` `[patch]` Exercise the actual header Boka caller and current-job editor context.

The first nine items are the confirmed causal findings. The last two complete the explicit AC03 leave obligation and changed-caller verification. Browser assertions are declared and collected, not executed locally. Descriptive observations about pending runtime and the approved dedicated-event boundary are not counted as new defects. The historical planning halt is superseded by explicit Phase5 authorization; existing 16.2 lead-route coverage remains applicable, and a mirrored event-error render test is optional because the real reader distinguishes failure and the component checks error first. No functional/security acceptance is deferred.

Round1 provenance: all five internal High layers completed against raw diff SHA1704c73b45d065888cf96b3ca01055b1a7f6bffbeda94ab6b0bee104dda03133. The first configured external command exited native0 with a read-denial result, not findings. Root-authorized byte-identical readable-path recovery exited native0 and returned two duplicate findings; actual receipt SHA7bc08ef96f96371156e72be31190c9394ae926b66990bf55c78c0b3ca2f19570. Independent targeted High verification of this repair batch subsequently qualified PASS in the entry below. No broad layer was rerun.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Targeted independent Sol6.1 High recheck only: qualified PASS on the repaired thirteen-path delta, all twenty-six frozen bindings and relevant unchanged dependencies. The same reviewer checked cooperating navigation guards, opaque installed-router history state, later allowed navigation, late completion/file ownership, pagination, retries, stacking and the author trail. No broad or external layer was repeated. Actual receipt SHA 1885b3c10b005afb232563915672a5ac1f364a175214ed579286e7f4b1b3e202. Latest patched severity counts high0/medium0/low0, score0; follow-up recommendation false. Original eleven actions and their first-pass recommendation remain above. Required runtime evidence remains pending root CI.


### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Same independent Sol6.1 High reviewer qualified PASS on only the five-path runtime repair delta SHA530af26004dfe0dc2eed7f5e69889a9849c83641f2774b5c401eb9b00c043d9d, all26 frozen bindings and relevant unchanged dependencies. Actual receipt SHAbca3df0b395c3d2e75e4f691fc63e1d645ea0d85ac628ebcdcc30f15dd4d73f5. Separate scrolling, fixed modal stacking, invocation-only static fixture loading and real list/refusal/persistence assertions were checked. No broad/external layer was rerun. Latest counts remain all0/follow-up false. Failed CI39467187678 is preserved; member/work-order observer outcomes and repaired browser behavior still require a successful new exact-head CI. Collection/build are not runtime acceptance.

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

## Runtime evidence - first checkpoint ad9c3b79

Actual owned CI39467187678 at ad9c3b79a4244333384e6d0970e13586f7a05739 failed its essential production-browser lane:32 cases,22 expected,9 unexpected,1 flaky,0 skipped. Native report SHA256 0aca765dddc0e41dac7f32010b2ec33c13f8e741d2db4646e9e5c3bf7e7ee618. Workspace fixture alias imports, actual sticky header/mobile-tab interception and lead/work-order action observers are under causal repair; the exact native assertions remain acceptance obligations. Jobs-depth E03 failed its first response-body read with Network.getResponseBody/no data, then passed retry1; that is flaky evidence, not a first-attempt pass. No failing behavior is deferred as release polish.

The same revision actually passed verification2740/2740,0 skip,plus43 process checks; full DB1880 total/1879 passed/0 failed/1 ordinary physical-recovery skip, including workspace INT4/RLS3; direct isolated physical recovery separately1/1 passed/0 skipped. Required pilot performance used5 warmup/25 measured:read p95=7.89618100000007ms,syntheticBulkEffectivePermissions p95=3.4589670000000297ms. Native DB SHA256 7d0b3b1d3111dc7401b6f6f3a3f152668d800c5147b791d85f2117c690429240; direct recovery SHA256 65646ec3458504c59520165910097616afd8ca8c045378afd6928e5dd027e7a3. These are historical exact-head results; a reviewed repair requires new exact-head required CI. Story remains in-review, no delivery/development-complete claim. Original review union and targeted receipts remain above; only latest causal changes receive focused independent High recheck.


## Auto Run Result

Status: in-review
Blocking condition: none
Historical planning exit: ready-for-dev, three refined ACs/TR12; the explicit Phase5 resume now authorizes implementation. Frozen intent remains unchanged.
Implemented the authorized five-tab workspace, safe header/events, independent consumer gates and connected navigation. Source baseline: f96256a066db7e38d482e4538f2a0ba2472cf4b8; local preservation checkpoint4562b3feecece4e36674242c7d95a8cbf5f5b5b7 retained the original reviewed candidate. No migration, new grant, AppShell, facts/proof or historical SQL change.
Round1: eleven patch actions applied (high1/medium8/low2), zero deferred, three rejected. Original Round1 recommendation was true (patched severity score=3×8+2=26, with one high). Targeted independent High repair verification: qualified PASS; latest patched counts high0/medium0/low0, score0, follow-up recommendation false. Original first-pass score26 and eleven actions remain historical above.
Actual local evidence after repair: controlled focused RED3fail then GREEN13pass/0fail/0skip; explicit TSC/lint/build and source/final-bundle containment native0; completed-build sequential unit2740total/2739pass/0fail/1Windows xattr skip; job-only Playwright collection25cases/6files, including four workspace journeys, no browser execution. One author Suggested Review Order,20 verified stops/0reference errors. Earlier withdrawn combined-shell TSC claim, transient unit/build race and missing local auth-fixture full-collection failure remain historical limitations, not passes.
First exact-head CI39467187678 at ad9c3b79 failed browser (22expected/9unexpected/1flaky/0skip) while verification2740/2740, DB1879pass/1ordinary recovery skip, dedicated recovery1/1 and pilot performance passed. The bounded five-path repair has actual local static/build/collection native0 and independent High targeted qualified PASS; a new exact-head full required CI remains pending root. No development-complete, done, release-ready or deployment approval claim. Root executable delivery gate, independent provenance and explicit authorization remain required after real runtime evidence.


## Suggested Review Order

Author: Story16.5 implementation/fix delegate (Sol6.1 High).
Refreshed against the final uncommitted causal-fix tree on reviewed candidate `4562b3feecece4e36674242c7d95a8cbf5f5b5b7`; original story source baseline remains `f96256a066db7e38d482e4538f2a0ba2472cf4b8`. Frozen intent SHA256 remains `84e6bca5a0696386eba53f7ee5d670c1ebfed42446154614f30ad365f8071bc8`.

### Stable admission, safe labels and complete real events

The existing route enters through the checked root reader before composing independently authorized consumers. Header labels come only from visible current-job members or the separately entitled manager picker, never eligiblePeople. Safe event history now pages below the API cap with timestamp/ID ordering, so the overview's latest three include the actual newest events; page failure returns a retryable error rather than partial history.

- `src/app/(app)/jobs/[jobId]/page.tsx:23` — `readJobWorkspace`: admits the root before subordinate page reads.
- `src/server/read-models/job-workspace.ts:24` — `projectJobWorkspaceHeader`: preserves truthful assignment states without a directory expansion.
- `src/server/read-models/job-events.ts:17` — `.range(offset, offset + 499)`: keeps safe current-job events complete and ordered.
- `tests/unit/server/read-models/job-events.test.ts:61` — `16.5-UNIT-EVENTS-04`: AC02 retains the newest upgrade beyond 1,000 rows.

### Actual consumers and retries retain the current context

Schema still uses the allocated optional normal-client seam in the existing booking readers; the cookie default and independent manager options gate remain. Cancelled intervals now state their status. Root, work-order and member-error recovery uses current-URL refresh rather than full GET, preserving bounded query context and mounted sibling drafts. The retained traceability journey now navigates to the actual shared file and event tabs without removing its source, content, permission or persistence checks.

- `src/features/resources/bookings-read.ts:91` — `readBookingHost`: retains the existing normal-JWT/cookie authority.
- `src/components/jobs/JobWorkspaceSchedule.tsx:14` — `booking.status === "cancelled"`: distinguishes cancelled timeline intervals.
- `src/components/jobs/JobWorkspaceShell.tsx:101` — `JobWorkspaceRetry`: refreshes the actual current URL without document unload.
- `tests/e2e/jobs/job-traceability.e2e.spec.ts:107` — `getByRole("tabpanel"`: retains the file assertion against the actual consumer.

### History and late completion preserve the selected child and tab

A changed child query reconciles the mounted pane through the existing dirty/pending confirmation and the current visible-child set. A refused transition restores the existing child query; an accepted restoration refreshes the corresponding file island. Creation completion retains the original draft key but derives its URL from the live query, preserving a subsequently chosen tab and unrelated return parameters.

- `src/features/jobs/job-workspace-domain.ts:31` — `reconcileJobWorkspaceChild`: separates unchanged, protected and visible-child restoration.
- `src/components/jobs/JobWorkOrdersPanel.tsx:29` — `reconcileJobWorkspaceChild`: applies history changes through the existing protection.
- `src/components/jobs/JobWorkOrdersPanel.tsx:65` — `jobWorkspaceChildHref`: adopts creation into the live query without tab takeover.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:429` — `16.5-E04`: AC03 two-child Back/file ownership, dirty rejection and late real creation.

### Persistent chrome, usable panel scrolling and card leave lifecycle

Fix-author rationale: I chose in-flow persistent chrome with a separate bounded panel scroller to remove native pointer interception without changing AppShell. Phone CRM details use native disclosure; primary identity, truthful PL/lead assignment state and planned dates remain present. The capped header retains its higher stacking context for the existing upgrade dialog; shared Dialog is unchanged. The existing card leave lifecycle and cooperating child/history guards are unchanged by this repair.

- `src/components/jobs/JobWorkspaceShell.tsx:21` — `useLayoutEffect`: fits the viewport and cleans up disclosure/resize listeners.
- `src/components/jobs/JobWorkspaceShell.tsx:60` — `max-h-[50%]`: bounds persistent chrome without obscuring body controls.
- `src/components/jobs/JobWorkspaceShell.tsx:93` — `job-workspace-content`: scrolls panels independently of header and navigation.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:118` — `Persistent header opens`: checks actual header/modal and phone booking clicks.
- `src/components/jobs/JobCardForm.tsx:38` — `if (!leaveArmed) return`: retains dirty/pending route-exit protection.
- `src/components/jobs/JobCardForm.tsx:89` — `setLeaveArmed(false)`: disarms only after actual server-confirmed save.

### Focused regressions, unchanged authority and honest limits

The original20 ATDD bodies remain active; three additional pure cases and one browser case target the causal fixes. E02 remains the admitted ordinary-member privacy scenario because existing leads legitimately receive crew-picker labels; existing16.2-E03 still exercises the changed route as a Sales lead, and RLS03 retains current-lead/revocation/stale-write boundaries. No new personal-label source, grant, transactional action or fixture weakening was introduced.

- `tests/unit/features/jobs/job-workspace-domain.test.ts:101` — `16.5-D05`: AC03 visible child restoration versus protected draft.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:118` — `Persistent header`: actual Boka/current-job editor, header scrolling and physical modal/tab pointer checks.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:364` — `Only the card draft`: AC03 refresh/Back/SPA refusal, same-job retention and confirmed-save navigation.
- `tests/integration/rls/job-workspace.rls.test.ts:53` — `16.5-RLS-03`: AC02 current lead loses workspace and stale writes after revocation.

Actual fix-batch evidence (2026-10-20): focused RED3executed/0pass/3fail/0skip exposed capped1000-versus1003 events and missing history/adoption behavior; GREEN13executed/13pass/0fail/0skip. Explicit TSC and affected eslint native0; production build native0,12/12 static pages; source and final built-bundle containment native0. Final full units ran sequentially after build:2740total/2739pass/0fail/1skip. The existing Linux-xattr recovery skip is not passing local coverage and requires its independent CI recovery lane. Job-only Playwright collection native0:25cases in6files, workspace4 plus existing21; the complete smoke union is now32 including7auth, pending actual root CI setup. The traceability file's existing fixture-dependent setup was not fabricated for collection or execution.

Logs: `C:/Users/Rasmus/AppData/Local/Temp/story-16-5-fix-red.log`, `story-16-5-fix-pure.log`, `story-16-5-fix-typecheck.log`, `story-16-5-fix-lint.log`, `story-16-5-fix-build.log`, `story-16-5-fix-containment.log`, `story-16-5-fix-unit.log`, `story-16-5-fix-collection.log` in that same directory. Earlier evidence remains historical: the initial corrected TSC/JSX extraction failure, the first full-unit/build overlap's unreadable transient artifact, and the first external review source-read denial are not relabelled as passes. Root's corrected external recovery completed native0 with two duplicate modal/history findings. This author performed no external upload or broad review; the final causal diff requires root's targeted independent High recheck.

Limits: browser assertions are declared/collected, not executed here. Required integration4/RLS3, all essential browser flows (workspace4 plus retained journeys), full DB/empty-DB, integrity/recovery and pilot evidence remain root-owned CI work. Pure event fixtures do not prove live RLS, and refresh/error presentation plus browser history/modal behavior still require that runtime evidence. Broad device/role/browser matrices, screenshots and visual/manual review remain deferred release validation owned by root/release owner; next action is its qualified release lane after development evidence. No services, resources, browser launch, SQL, dependencies, environment/secrets, providers, Git/state mutation, deployment or development-complete/release-ready claim occurred in this author batch. Story remains in-review pending the existing gates.


### Native fixture loading, real title entry and response observation

Fix-author rationale: static alias-aware bindings load the actual fixture/readers while all database work remains invocation-only. List entry selects the real title-bearing row, verifies its exact job href and clicks its real link; its accessible name includes other row text. Native disclosure preserves every CRM value/visibility check. Real stale-response body capture starts immediately at matching response observation, before subsequent refresh can lose the body. Member/work-order exact-path observers remain unchanged because tab query parameters were already handled; their timeout repair remains a runtime hypothesis until CI.

- `tests/support/job-workspace-atdd.ts:24` — `Static bindings`: loads actual dependencies without module-level database work.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:66` — `openListedJob`: verifies the real row, exact href and title before navigation.
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts:153` — `customerDetails`: preserves phone customer visibility and nonempty checks.
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts:322` — `const staleSave`: starts actual response-body capture at observation.
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts:326` — `PREVIEW_STALE`: retains refusal, fresh-preview and durable-save assertions.

Actual bounded repair checks all returned native0: explicit TSC, affected ESLint (four paths/no diagnostics), production build, completed-build containment, actual Playwright import probe4 cases/1 file and job-only collection25 cases/6 files. Logs are C:/Users/Rasmus/AppData/Local/Temp/story-16-5-browser-repair-{typecheck,lint,build,containment,collection}.log and story-16-5-native-import-probe.log. No unit/security broad rerun was needed for unchanged domain/authority dependencies; historical evidence is retained. Browser pointer, response-loss and persistence assertions are declared and locally unexecuted; a new reviewed exact-head CI is required. Failed ad9c counts and its flaky retry remain above, never reclassified as release-only work. Root owns checkpoint/CI, then delivery gate and provenance before any done authorization.
