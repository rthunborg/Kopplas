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

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Same independent Sol6.1 High reviewer qualified PASS on only the two-path test-binding repair SHA071e04ec0346be2d69a2ff90323ad17d78d399cf015ee951a2fa956ee6a8468d and all26 frozen bindings. Receipt SHA964e5672208ed220112c7598d13f241354b54ef006cc8a77032c50b89c519369. All11 static helper substitutions retain canonical functions/arguments; exact web-first pathname waiting does not weaken any assertion. Probe source/configuration/log provenance and its binding-only limitation were verified, including first wrong-expectation failure and withdrawn absent-log claim. Latest counts all0/follow-up false. No broad/external review was repeated; required new exact-head CI remains outstanding.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - none

Targeted High review rejected the intermediate history repair: requesting childB before dirty consent replaces the real current-child-only file projection, unmounting childA's selected upload before its passive guard can reject navigation. The earlier private probe supplied both panels and did not mount file descendants; its green result masked this production dependency. This is an open consequential patch, no qualified checkpoint. Actual source-derived review receipt SHA06b3b1bc8c65e9e7e969a4b4adbebeb098395a20490f4711171cd8bcebb7220a. Preserve this failed review and narrow proof limitation; repair must protect the actual A file island through refused navigation, then receive same-reviewer targeted recheck. No broad/external review or runtime acceptance was claimed.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - none

Same High critical follow-up verified the original refused-navigation file-loss is fixed, but rejected the checkpoint for one related remaining callback race: accepted navigationB leaves the originating draft key selected until commit; an outstanding createC completion still passes receive()'s old origin-key gate and can router.replace(C), stealingB. The pending fieldset blocks new input, not this already-running callback. Receipt SHA4006b8c50f5c3e8c0da73576f92e976f7795692d952625e6dd6d31846ae59d1e. The next correction must honor exact accepted navigation intent while retaining the actual created row/list/receipt and original late-create behavior. Preserve both failed targeted reviews and their private probe limitations; current open consequential patches1/follow-up true, no broad/external review or runtime pass.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Same independent High reviewer qualified PASS on the latest accepted-intent callback correction and relevant preconsent/file-lock dependencies. Receipt SHA69b4070d72bdfdca14e42fd1b6ed11e93573844ada8b53d905e354bdbc86faee; reviewed delta SHA6e19b44773dda5cb825588b2f6529eea85004facee3bd10b147ee0c531c91f5f, all26 bindings, both failed targeted-review receipts and32 SRO targets verified. ConfirmedC retains row/identity; acceptedB wins, failedB reconcilesC through live query. Both related source-derived findings are resolved; latest counts all0/follow-up false. No broad/external layers were rerun. Stand-in caller probes are not browser evidence; new exact-head E03/E04/E05 and full required CI remain necessary before delivery.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Same independent High reviewer qualified PASS on the latest two-path diagnostic/E04 observation delta only: receipt SHA1ca5e32f0f7b98e63067952ee8074e21fee070e782e9379e67c91159ea770a42; exact delta SHA4021a17edb1943a4df2366f876295b6eb540c61dd490f8c4e8690aa2279b78ab and reviewed inventory SHAc174c2e761c5a7eddbd46781d3a08d4066561ecc5ec8fc23df1bea1b586ed519. All26bindings, frozen intent, probe/log hashes and36valid SRO targets verified. No consequential privacy/transparency/assertion-retention defect found for the inspected CardForm callers; no production guard change or fix is established. Latest counts all0/follow-up false describe this targeted source review, not unresolved E03 runtime acceptance. Fourth CI failure remains; next exact-head CI is diagnostic. No broad/external layer rerun, test execution, delivery or done authorization is claimed.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Same independent High reviewer qualified PASS on the latest listener-only precommit guard/E01 observation delta: receipt SHA138f712dc9a109602f0831da761bc21a7c89bbabb641c8755d074753a18a15d7, exact delta SHA2378f8c372cf184d70f699d797556b91cb088404ac5dba220a70d4f608231a27, reviewed inventory SHA682a82065d9388f427fae85260f9451bb81babbf1a53def2890356f37b1d91dc. All26bindings, frozen intent, evidence/framework hashes and42SRO targets verified. Refusal avoids history writes, accepted legacy prompt is suppressed once, same-job defers, cleanup/confirmed-save and honest fallback limits retained; payload/action logic and diagnostic privacy unchanged. Latest review counts all0/follow-up false concern the source delta only. Actual cancellation support and E01 first-attempt acceptance require new exact-head CI; prior five failures remain. No broad/external rerun, live execution, delivery or completion claim.

### 2026-10-20 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Same independent High reviewer qualified PASS on the exact two E2E native-action replacements: receipt SHA04f96a6d20b7d07f9c518eab8b406d7623cf46d98ac2fa84f85143613f931ad2; exact delta SHAaaccd1d03146b8b85866f5213079cd1abe18439b9247cbf48de66dba5d8dfef5, reviewed inventory SHAfd5edf4f37b18ed1ef1bed854716cfe363f6332845f6feb03415581ac92d7927. All26bindings, frozen intent, evidence/adapter hashes and45SRO targets verified. Real dialog observers precede actions, type/message/dismiss/awaited command/retained URL-input and later persistence assertions remain; production CardForm unchanged. Latest source-review counts all0/follow-up false do not establish complete E03 or new-head runtime. All six failures and prior review union remain; no broad/external rerun, live execution, delivery or completion authorization.

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


## Runtime evidence - second checkpoint b26cf196

Actual owned CI39471401065 at b26cf196c5c5fc0e6d7b2de9ed28dfbf58703ca3 passed verification2740/2740 with0skip plus43 process checks. Essential browser32 cases:28 expected,4 unexpected,0 flaky,0 skipped; all21 retained job journeys and7 authentication cases passed first attempt. Native SHA256 11a282fcb1edd308f998b2df87f0a006637581a8a56228b2a558e38fdf525096. All four workspace cases remain failed: E01 first attempt read /jobs immediately after the real list link click, before the expected detail transition; retry1 and every E02-E04 attempt hit the deeper job-semantics-atdd lazy import alias resolution. The earlier workspace-helper loading fix did not close the entire test execution graph. The materially simpler repair audits all workspace runtime imports together and qualifies actual no-resource runner execution; no incremental guessed alias fallback, decoder, authority change or assertion relaxation is approved. Browser completion remains required, no delivery/done claim. Final second-run outcome is failure solely in browser. The same revision actually passed full DB1880total/1879pass/0fail/1ordinary physical-recovery skip (native SHAda65c9030401f1265ed1f859d635b54b295504939a23b583f9fd07a279e0748d); separate physical recovery1/1pass/0skip (SHA278bb3f35902985dfc099be3af52711eb7d0b3a26b8604934c0fd5c6077c2747). Required pilot used5warmup/25measured, read p95=17.622676999999385ms and syntheticBulkEffectivePermissions p95=7.034692000000177ms. These are historical exact-head results, not repaired-workspace acceptance.

## Runtime evidence - third checkpoint e34997cb

Actual owned CI39474099331 at e34997cbdd9071949eccc6d6c49786376c5c6c61 failed only browser:32 cases,30 expected,2 unexpected,0 flaky,0 skipped. Workspace manager/header and privacy journeys E01/E02 now passed first attempt, as did all28 retained job/authentication journeys. Native SHA256 481b7e911e3d3503ea75ff08e78a03b25fec04175b045b7e6997297ea3341004. The remaining connected-flow invariants are essential: E03 both attempts observed no confirm dialog for Back after dirty-card re-entry; E04 restored URL childA but the pane retained childB, so later file-owner assertions were not reached. Actual guard/history/caller state requires causal correction; no functional deferral or lowered assertion is approved.

The same revision actually passed verification2740/2740 with0skip plus43 process checks; full DB1880total/1879pass/0fail/1ordinary physical-recovery skip (native SHAb11bd5553e79e6eaa3ab607b5a0942ba37c58bf6d96877a14e6ce5fe98d2f9fc); dedicated physical recovery separately1/1pass/0skip (SHA1fb1586ab087bb965da317b883affb440abbe6861cf61118374387525943fcf0). Required pilot5warmup/25measured:read p95=9.511504000000059ms,syntheticBulkEffectivePermissions p95=3.282032000000072ms. These are historical exact-head results, not remaining workspace acceptance. Source/spec remain in-review; no delivery/done claim.

## Runtime evidence - fourth checkpoint 1d35e347

Actual owned CI39480592913 at 1d35e347f88eed62ef0e5faebc5ef1b372d4d82a failed only essential browser:33cases,31expected,2unexpected,0flaky,0skip. E01/E02 and new held-response E05 passed first attempt, as did all28 retained job/authentication cases. Browser native SHA256 b090c4056f7fe6157e96e1424912e84872737c70b6f2b96ded990f89b666af00; completed browser log SHA256 9bec672d5ba6b4c55f532e8d5caf9ecaff46b3dc1fc51a51b700a224496492dc. E03 both attempts still reached no Back confirm dialog; native/log evidence does not establish the actual history destination or installed capture guard. No speculative source guard change or increased wait/retry is justified. E04 reached the final late-create check after its earlier file/refusal/Back checks, then compared an immutable URL snapshot captured before the awaited durable-row read to the created ID. The correction must observe live exact route commit after asserting exactly one durable row, retaining events-tab/return context and all persistence assertions. This identifies the test observation defect, not a production navigation fix.

The same revision passed verification2740/2740 with0skip plus43process checks; full DB1880total/1879pass/0fail/1ordinary physical-recovery skip (native SHAb4bfbede9391a5578ea32bdbe179e212d29e3ac270645fcc0f1030759c42ffa0), with direct isolated physical recovery separately1/1pass/0skip (SHA9da1ea5baa30682a89c26f98913596f6bc7a564d048e6610a99f136a5c95bb0a). Actual pilot5warmup/25measured:read p95=11.350626999999804ms,syntheticBulkEffectivePermissions p95=4.471324000000095ms; DB log SHA9fa3537224de201461abb44fbc5553da5ef69f88ae4d8fce36b0e381f450c432. All results are exact-head history, not repaired acceptance. E03 requires a materially different bounded E2E-only diagnostic of actual history/guard execution; outputs are limited to static action kinds, sanitized pathname categories, sorted history key names and armed booleans. No IDs, URL/query/state values, messages, customer data, proofs or credentials may be emitted. Source remains unchanged; new reviewed diagnostic-head required CI remains necessary. No delivery/done claim.

## Runtime evidence - fifth diagnostic checkpoint b0cd4c32

Actual owned CI39484281458 at b0cd4c3261b6cdc4c608f4141abbe4a05a3fcfb3 failed essential browser:33cases,31expected,1unexpected,1flaky,0skip. E04/E05 and all28 retained cases passed first attempt. WorkspaceE01 first visibility assertion failed, then retry1 passed; it is flaky, not first-attempt evidence. Native SHA4bbdaa426cf789f8bec0cd895a5f226c4bb22d85dd2f33098eb3261a7ed3f4d2; completed browser log SHAd8c12e516b69282ddf6c9b53e9fe5df897aaa216a08f9245059d9f73d0686c19. Both E03 attempts supply the decisive sanitized trace: /jobs unarmed, push current-job, guard-added armed=true, dirty-fill/unload/before-back armed=true, then history-replace to /jobs while armed, guard removal at /jobs, and only then pop-observed unarmed. Neither guard-pop-enter nor confirm-request occurs. The draft unmounts before the current pop callback; missing arming, same-job destination and an insufficient wait do not explain this actual trace. The next bounded listener-only repair requires installed Next/React correlation and actual-production-listener RED-to-GREEN evidence before claiming a fix. E01's separate booking-close cleanup traversal race is a source/native-supported inference, with a bounded existing marker-key-removal observation proposed before its next modal action. No timeout/retry/assertion weakening or command change is permitted.

The same exact revision passed verification2740/2740/0skip plus43process checks (verify log SHA3e5db1acf5a43e713b72e70fb540e7b7da1af6ae358df409351ec7ab74468f15). Full DB1880total/1879pass/0fail/1ordinary physical-recovery skip (native SHA6d207b92608188f15382c7f676d2cf65d294cff9b592d7c154e2a7a4234a7cef); direct physical recovery separately1/1pass/0skip (SHA044eec3ae69e508115a125358d670a0b78bde6cf9a407c969ad30749b2c25913). Required pilot5warmup/25measured:read p95=9.212395999999899ms,syntheticBulkEffectivePermissions p95=4.781260000000657ms; DB log SHA1c04b204bccb8db2b460ea73b0ab5eb3f875f9e831e6b5e1c448d98cde5e636e. Overall run is terminal failure solely E03 with E01 flaky. These are historical exact-head results; a reviewed new listener/test head requires full current CI. All five failed runs and the actual diagnostics remain evidence. No delivery, development-complete, done or release claim.

## Runtime evidence - sixth checkpoint 1bf3444e

Actual owned CI39487625801 at 1bf3444ed5e49ee0632a0b6d28a17eb976386b6b failed only E03 whole-case60s timeout:33browser cases,32expected,1unexpected,0flaky,0skip. E01 now passed first attempt, as did E02/E04/E05 and all28 retained cases. Native SHA295a29c1e8701177be5715108b4ca6e4c3f9ab90d009b30216b3890e4a9f1498; browser log SHAd9b67a8d2a371937ec7c4bfdf66a489df972f8d48b630854b30a70632715e4ae. Both attempts actually emitted traverse-samedocument-cancellable, confirm-request and confirm-refused while current-job remained armed, without history replacement/unmount. This proves the real cancellable precommit/refusal branch, not full E03. Cancelled reload consumed30.026s/30.044s before Back; after Back confirm refusal, no later stage occurred. The native reports only the enclosing step timeout. The blocking await for deliberately cancelled Back completion is derived from that last stage, the linear test flow and installed Playwright's navigation/lifecycle wait semantics, rather than a direct API-line stack. No case split or timeout increase is justified. The bounded test-only correction requests native window.location.reload/history.back, registers the real dialog observer before each action and awaits the JavaScript command instead of a navigation commit the guard prevents. Every real dialog type/message/dismiss, retained URL/input, later SPA refusal, retry and server-persistence assertion remains required. Production guard stays frozen.

The same revision passed verification2740/2740/0skip plus43process checks (native log SHAcc9f9dedd4cacbf03cfac17efebaeed51bef095209e05a7077ef679d63e3af14). Full DB1880total/1879pass/0fail/1ordinary physical-recovery skip (native SHAe9d07406e78dec94db883653d46e95a6bd94ab0b8684a5f1bbdcccbc041f7766); direct recovery separately1/1pass/0skip (SHAba365af80036e3a81021019d169f5ed1f04e5f5904e5ada7a8f0cdac1fd6d113). Actual required pilot5warmup/25measured:read p95=12.261700999999448ms,syntheticBulkEffectivePermissions p95=5.346536000000015ms; DB log SHAf9ddda771aa7c003a7241712a0235a0dc2a7caa8e6f6641d48cd24907a45f951. Overall terminal failure remains; neither the source fix's qualified branch nor these historical exact-head passes establish complete E03 or new-head required CI. Preserve all six failures, E01's earlier flaky attempt and the exact diagnostic limitations. No delivery/done/release claim.

## Auto Run Result

Status: in-review
Blocking condition: none
Historical planning exit: ready-for-dev, three refined ACs/TR12; the explicit Phase5 resume now authorizes implementation. Frozen intent remains unchanged.
Implemented the authorized five-tab workspace, safe header/events, independent consumer gates and connected navigation. Source baseline: f96256a066db7e38d482e4538f2a0ba2472cf4b8; local preservation checkpoint4562b3feecece4e36674242c7d95a8cbf5f5b5b7 retained the original reviewed candidate. No migration, new grant, AppShell, facts/proof or historical SQL change.
Round1: eleven patch actions applied (high1/medium8/low2), zero deferred, three rejected. Original Round1 recommendation was true (patched severity score=3×8+2=26, with one high). Targeted independent High repair verification: qualified PASS; latest patched counts high0/medium0/low0, score0, follow-up recommendation false. Original first-pass score26 and eleven actions remain historical above.
Actual local evidence after repair: controlled focused RED3fail then GREEN13pass/0fail/0skip; explicit TSC/lint/build and source/final-bundle containment native0; completed-build sequential unit2740total/2739pass/0fail/1Windows xattr skip; job-only Playwright collection25cases/6files, including four workspace journeys, no browser execution. One author Suggested Review Order,20 verified stops/0reference errors. Earlier withdrawn combined-shell TSC claim, transient unit/build race and missing local auth-fixture full-collection failure remain historical limitations, not passes.
First exact-head CI39467187678 at ad9c3b79 failed browser (22expected/9unexpected/1flaky/0skip) while verification2740/2740, DB1879pass/1ordinary recovery skip, dedicated recovery1/1 and pilot performance passed. The bounded five-path repair has actual local static/build/collection native0 and independent High targeted qualified PASS; a new exact-head full required CI remains pending root. Second exact-head CI39471401065 at b26cf196 failed only the four workspace browser cases (28expected/4unexpected/0flaky/0skip); verification, full DB, dedicated recovery and pilot passed. The complete static test-binding/exact-route repair has same High targeted qualified PASS, actual TSC/lint native0 and binding probe1pass plus25/6 collection. No new production change; new exact-head required CI remains pending root. Third exact-head CI39474099331/e34997cb passed verify/full DB/dedicated recovery/pilot but failed browser30expected/2unexpected/0flaky/0skip. Current guarded-selection/accepted-intent repair is same-High targeted qualified PASS after both related failed reviews; actual caller RED-to-GREEN, TSC/lint/build/containment native0 and job collection26/6. Workspace5/intended fullsmoke33; E03/E04/E05 actual browser remains pending new root exact-head CI.  Fourth exact-head CI39480592913/1d35e347 passed verification/full DB/dedicated recovery/pilot but failed browser31expected/2unexpected/0flaky/0skip of33; E01/E02/E05 and all28 retained cases passed first attempt. Latest E2E-only E04 live-URL observation and E03 transparent sanitized diagnostic have same-High targeted qualified PASS, TSC/lint/5-case collection native0 and a passing stand-in transparency/privacy probe. E03 cause remains unknown and actual diagnostic-head required CI remains pending root.  Fifth exact-head CI39484281458/b0cd4c32 passed verification/full DB/dedicated recovery/pilot but failed browser31expected/1unexpected/1flaky/0skip of33; E04/E05 and28retained passed first attempt. The native-proven pre-pop unmount correction is listener-only, with real-component stand-in RED1-to-GREEN0, unchanged submit/render bytes, TSC/lint/5-case collection/build/containment native0 and same-High targeted qualified PASS. E01 booking-close marker observation remains inference; actual cancellable Navigation API support and E01/E03 acceptance remain pending new root exact-head CI.  Sixth exact-head CI39487625801/1bf3444e passed verification/full DB/dedicated recovery/pilot and32browsercasesfirstattempt; E03timedoutafteractualcancellableprecommitconfirm/refusal. The test-only native-reload/Back observer correction has actualadapterRED1-to-GREEN0, TSC/lint/5collection native0 and same-High targetedqualifiedPASS; guard andall24othercandidatebindingsunchanged. CompleteE03 andnewexactheadfullrequiredCIremainpendingroot; no testtimeout/retry/catch/assertion changes. No development-complete, done, release-ready or deployment approval claim. Root executable delivery gate, independent provenance and explicit authorization remain required after real runtime evidence.


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

### Pre-navigation consent, committed child identity and file drafts

Fix-author rationale: existing-child dirty/pending consent precedes the child-specific RSC request, so rejectingB cannot remove A's selected file input. Accepted navigation keeps committed-query adoption; a one-use exact selected-key/target acknowledgement avoids duplicate passive confirmation. Standard React useTransition disables the native ancestor fieldset, including shared file controls, until the accepted route settles, preventing newer input after consent. Unused acknowledgement is cleared on settled nonmatching transition/unmount without resetting dirty state. No cached file node or new A-authority assumption exists; actual RSC file props remain authoritative. New draft/close, existing history entries and late creation are retained.

- `src/components/jobs/JobWorkOrdersPanel.tsx:62` — `function select`: obtains consent before requesting another child's RSC props.
- `src/components/jobs/JobWorkOrdersPanel.tsx:34` — `const approved`: consumes only the matching selected-key/target consent once.
- `src/components/jobs/JobWorkOrdersPanel.tsx:22` — `useTransition`: tracks accepted route transition pending state.
- `src/components/jobs/JobWorkOrdersPanel.tsx:102` — `fieldset disabled`: locks actual native file and form controls during accepted leave.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:538` — `unsentFile`: retains A's native FileList, title and owner after refusingB.

The intermediate route-first repair was rejected: the earlier both-panels hook probe masked unmounting of A's actual file island before passive consent. That failed review remains in Review Triage Log. The new actual-component probe first failed/native1 becauseB was requested with zero prompts, then passed/native0 with real A-only/B-only composition, refusal-before-request, accepted transition lock/single consent and nonmatching cleanup. React hooks/router/window/Pane are instrumented stand-ins; this is caller/closure evidence, not mounted descendant, browser, live authority or DB proof. Source C:/Users/Rasmus/AppData/Local/Temp/story-16-5-file-consent-caller-probe.cjs SHA1df73950f0c97616f0ec88b7a9d81f5638ee7950431f3e03712fc59cc7ba7a1e; red log SHAaf65a890e6f6d8c9fe0ccaee3672a79d3cab8326fd862ceb760876cff11c3066; green log SHA5f60eb7e43609216d5bb45e62d9dd69c8614b2496b374fec6217d928fbadc687, logs story-16-5-file-consent-caller-{red,green}.log in that directory. Persistent E04 selects a real unsent file and dirty title, refusesB and asserts native FileList/owner remainA, then explicitly acceptsB before all original Back/newer-draft/late-create assertions; those browser assertions remain unexecuted until CI.

Preconsent-batch TSC, affected lint, workspace collection4/1, production build and final-build containment all native0; persisted story-16-5-file-consent-{typecheck,lint,collection,build,containment}.log files include native codes. E03 still waits for the exact real job route in shared list entry; all refresh/Back/SPA/refusal/persistence assertions and CardForm source remain unchanged. This synchronization cause is an inference pending runtime. Preserve third-run30expected/2unexpected and every earlier failure; no exact-head acceptance or delivery claim occurs here.

Fix-author accepted-intent rationale: the successful create callback still retains the real projection, confirmed child ID and same draft key, preserving server-confirmed reconciliation rather than leaving an anonymous fresh create. It suppresses only created-child router navigation while an exact accepted origin/destination intent is active; B's committed query wins. If B settles without commit, it reconciles the already-confirmed C identity using the live tab/return query after clearing intent. Pre-request consent, fieldset lock and existing origin-key guard remain; no queue, cached payload, new authority or optimisticB is introduced.

- `src/components/jobs/JobWorkOrdersPanel.tsx:93` — `Keep the confirmed identity/receipt`: retains C without stealing acceptedB navigation.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:613` — `16.5-E05`: holds real create/B RSC replies and preserves durableC plus finalB.

The actual-component callback probe produced production RED/native1 (C replaced acceptedB), then GREEN/native0 for acceptedB winning with confirmedC retained, failedB reconcilingC through live query, and ordinary late creation preserving later tab/return context. Explicit hook/router/window stand-ins and actual work-order domain functions prove caller state only, not browser/DB/receipt acceptance. Source C:/Users/Rasmus/AppData/Local/Temp/story-16-5-navigation-intent-caller-probe.cjs SHA32f64023f7424b91bf39f9a36bf6770679a50e99cfeec8aeee56670787868ab8; red log SHA28ba2759c3684c3d22da716f0d6a8404158d6fae4a5b907369d862741caf45f3; green log SHAa8da58991d20f1d3b4721e9c1973e7563aa1a2ee2625cfb390c6d9f151584a71, logs story-16-5-navigation-intent-caller-{red,green}.log in that Temp directory. A separate private launcher-only ERR_UNSUPPORTED_ESM_URL_SCHEME/native1 preceded file:/// correction and actual RED; startup log SHAff885f774b0a76608580fd276dc4e91342a60a012b6300bc7e2ae2433afc50dd, not a product failure. Current TSC/lint/build/containment and job-only collection26cases/6files all native0 with persisted explicit-code story-16-5-navigation-intent-{typecheck,lint,collection,build,containment}.log. New E05 retains existing E04 late-create-to-new-tab assertions: workspace5, collected jobs26, intended fullsmoke33. No new local auth collection or browser acceptance is claimed; exact-head E03/E04/E05 remain required.

### Persistent chrome, usable panel scrolling and card leave lifecycle

Fix-author rationale: I chose in-flow persistent chrome with a separate bounded panel scroller to remove native pointer interception without changing AppShell. Phone CRM details use native disclosure; primary identity, truthful PL/lead assignment state and planned dates remain present. The capped header retains its higher stacking context for the existing upgrade dialog; shared Dialog is unchanged. The existing card leave lifecycle and cooperating child/history guards are unchanged by this repair.

- `src/components/jobs/JobWorkspaceShell.tsx:21` — `useLayoutEffect`: fits the viewport and cleans up disclosure/resize listeners.
- `src/components/jobs/JobWorkspaceShell.tsx:60` — `max-h-[50%]`: bounds persistent chrome without obscuring body controls.
- `src/components/jobs/JobWorkspaceShell.tsx:93` — `job-workspace-content`: scrolls panels independently of header and navigation.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:202` — `Persistent header opens`: checks actual header/modal and phone booking clicks.
- `src/components/jobs/JobCardForm.tsx:38` — `if (!leaveArmed) return`: retains dirty/pending route-exit protection.
- `src/components/jobs/JobCardForm.tsx:106` — `setLeaveArmed(false)`: disarms only after actual server-confirmed save.

### Focused regressions, unchanged authority and honest limits

The original20 ATDD bodies remain active; three additional pure cases and one browser case target the causal fixes. E02 remains the admitted ordinary-member privacy scenario because existing leads legitimately receive crew-picker labels; existing16.2-E03 still exercises the changed route as a Sales lead, and RLS03 retains current-lead/revocation/stale-write boundaries. No new personal-label source, grant, transactional action or fixture weakening was introduced.

- `tests/unit/features/jobs/job-workspace-domain.test.ts:101` — `16.5-D05`: AC03 visible child restoration versus protected draft.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:202` — `Persistent header`: actual Boka/current-job editor, header scrolling and physical modal/tab pointer checks.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:449` — `Only the card draft`: AC03 refresh/Back/SPA refusal, same-job retention and confirmed-save navigation.
- `tests/integration/rls/job-workspace.rls.test.ts:53` — `16.5-RLS-03`: AC02 current lead loses workspace and stale writes after revocation.

Actual fix-batch evidence (2026-10-20): focused RED3executed/0pass/3fail/0skip exposed capped1000-versus1003 events and missing history/adoption behavior; GREEN13executed/13pass/0fail/0skip. Explicit TSC and affected eslint native0; production build native0,12/12 static pages; source and final built-bundle containment native0. Final full units ran sequentially after build:2740total/2739pass/0fail/1skip. The existing Linux-xattr recovery skip is not passing local coverage and requires its independent CI recovery lane. Job-only Playwright collection native0:25cases in6files, workspace4 plus existing21; the complete smoke union is now32 including7auth, pending actual root CI setup. The traceability file's existing fixture-dependent setup was not fabricated for collection or execution.

Logs: `C:/Users/Rasmus/AppData/Local/Temp/story-16-5-fix-red.log`, `story-16-5-fix-pure.log`, `story-16-5-fix-typecheck.log`, `story-16-5-fix-lint.log`, `story-16-5-fix-build.log`, `story-16-5-fix-containment.log`, `story-16-5-fix-unit.log`, `story-16-5-fix-collection.log` in that same directory. Earlier evidence remains historical: the initial corrected TSC/JSX extraction failure, the first full-unit/build overlap's unreadable transient artifact, and the first external review source-read denial are not relabelled as passes. Root's corrected external recovery completed native0 with two duplicate modal/history findings. This author performed no external upload or broad review; the final causal diff requires root's targeted independent High recheck.

Limits: browser assertions are declared/collected, not executed here. Required integration4/RLS3, all essential browser flows (workspace4 plus retained journeys), full DB/empty-DB, integrity/recovery and pilot evidence remain root-owned CI work. Pure event fixtures do not prove live RLS, and refresh/error presentation plus browser history/modal behavior still require that runtime evidence. Broad device/role/browser matrices, screenshots and visual/manual review remain deferred release validation owned by root/release owner; next action is its qualified release lane after development evidence. No services, resources, browser launch, SQL, dependencies, environment/secrets, providers, Git/state mutation, deployment or development-complete/release-ready claim occurred in this author batch. Story remains in-review pending the existing gates.


### Complete native fixture execution and real navigation observation

Fix-author rationale: all eleven remaining test-body dynamic-import statements now use canonical static loader bindings for the same semantics/member/work-order/booking helper families. I inspected the complete reachable helper graph together rather than repairing one missing module at a time; all real invocation arguments and invocation-only database work remain unchanged. The exact pathname assertion uses Playwright's web-first observation so the real Link transition can commit; real row/title/href/click and refused-navigation/persistence assertions remain. The earlier CRM disclosure and immediate stale-response body capture are retained.

- `tests/support/job-workspace-atdd.ts:24` — `Static bindings`: keeps actual fixture/readers under the canonical loader.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:23` — `saveCard, upgradeInput`: binds all real helper families before worker execution.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:137` — `toHaveURL`: observes the exact actual job route after Link navigation.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:153` — `async function openListedJob`: retains the actual title-bearing row and exact href click.
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts:153` — `customerDetails`: retains visible/nonempty phone customer checks.
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts:322` — `const staleSave`: captures the real body at matching response observation.
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts:326` — `PREVIEW_STALE`: retains refusal, fresh-preview and durable conservation checks.

Second repair actual native exits: TSC0, affected-file ESLint0, job-only collection0 (25 cases/6 files). A private no-browser/no-webServer Playwright worker probe executed the full static helper graph and real upgrade-to-envelope-to-tenant resolver with an explicitly instrumented null-claims client stand-in: one getClaims call, zero database method calls, actual UNAUTHENTICATED rejection;1passed/native0. This proves runtime binding and fail-beforeDB only, not live authority, fixture persistence or browser acceptance. First private probe failed/native1 solely because its expected code was AUTH_REQUIRED instead of established UNAUTHENTICATED; that failed log remains preserved.

Private reproducible probe: C:/Users/Rasmus/AppData/Local/Temp/story-16-5-second-runtime-binding-probe/binding-probe.spec.ts SHA256 cfad596dd3cc88a66f67f4fba54671e662b81fd4ec21ef2f1a76525e96bdc1e6; sibling playwright.config.ts SHA256 4f7d60933aa66812d323db38fa91091c63a5ca520a8c069191cf17b3f8a19072. Passing log story-16-5-second-runtime-binding-probe.log SHA256 1e5e1d63b46154e48a43a93fa9160650ac2d9acfe80c5aad9c2330e540e8f960; failed first-expectation log SHA256 66a71a088303814fe7b57da7c3c854a27fda0b6d3db871070a0bbb5dd64d426f, both in C:/Users/Rasmus/AppData/Local/Temp/. Collection log is story-16-5-second-runtime-collection.log there. TSC/lint actually returned native0/no diagnostics (author tool chunks7e9cf1/62c2ce); empty native output gave Tee-Object no items, so the intended typecheck/lint log files were not created. The earlier persisted-log claim is withdrawn; no missing-file hash or redundant rerun is claimed. Unchanged production build/unit/security evidence remains historical; no redundant broad rerun or new external upload occurred. The earlier repaired presentation has actual28 retained browser cases passed on b26cf196; the four workspace cases and full required CI still require successful execution on a new reviewed exact head. No delivery/done claim.


### Fourth-run observation correction and bounded unknown-cause diagnostic

Fix-author rationale: E04 now asserts exactly one durable created row before web-first observation of its exact live child route; only then is the current URL captured for the retained events-tab, child-ID and returnTo checks. This removes the immutable early snapshot without substituting a command, weakening persistence or asserting success before commit. Fourth-run E05's actual first-attempt pass remains the distinct real held-response race evidence.

- `tests/e2e/jobs/job-workspace.e2e.spec.ts:604` — `expect(rows).toHaveLength(1)`: preserves exactly one durable late-created row before route observation.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:605` — `toHaveURL`: waits on the actual selected child, then retains the tab and return context.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:54` — `async function installCardHistoryDiagnostics`: E03-only transparent history/listener diagnostic, no production guard change.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:65` — `const pathCategory`: limits emitted paths to fixed categories, without IDs or query data.

E03 remains unknown: the bounded diagnostic observes actual capture-popstate add/remove/entry/exit, confirm delegation, history actions and fixed test stages before Back. Only static action kinds, fixed pathname categories, armed booleans and allowlisted history key names (all other names collapsed) may reach native stdout; never messages, IDs, state/query values or credentials/proofs. It preserves original listeners/capture/options/this/event/result/throw/removal, native confirm/history delegates and opaque argument identity. Automatic once/signal registrations are conservatively untracked, not asserted armed; the inspected CardForm registration uses ordinary capture=true. Diagnostic normalization/logging errors cannot replace native navigation behavior. Original E03 assertions, retries and timeouts remain unchanged.

Actual no-browser diagnostic transparency/privacy probe passed/native0; source C:/Users/Rasmus/AppData/Local/Temp/story-16-5-history-diagnostic-privacy-probe.cjs SHA89a2cc5114fcbd3d630a90dc91ded9e59b58db211fe9700a00a2c34470c00f7c; passing sibling .log SHAb1765157ad722a64b17b1125bd38701203a465600a3035e552fa575fd97be47d. A private expanded-probe fixture failed/native1 because it wrongly expected exactly64 emitted rows after a deliberately malformed URL consumed one bounded attempt, and Node's boolean-capture teardown retained a deliberately throwing listener. That log SHAde48dffcad663c1962dc45ca113901d09405bdb86bd7c8e28139e1eeedc76804 is preserved; corrected <=64/output and explicit-capture fixture teardown are not product RED or live browser evidence. Affected TSC/lint and workspace collection5/1 each completed native0; explicit-code logs story-16-5-history-diagnostic-{typecheck,lint,collection}.log reside in that Temp directory. No redundant unit/build, broad review, external upload or runtime launch occurred. Production source bindings are unchanged; the next root-owned exact-head CI is diagnostic for E03, not a claimed guard fix or development completion.


### Native-proven pre-pop unmount and narrow precommit protection

Fix-author rationale: fifth-run diagnostics prove arming followed by router history replacement and unmount before the pop observer, identically on both attempts. The listener-only correction feature-detects cancellable same-document Navigation API traversal before that commit. Refusal prevents the traversal without writing or interpreting opaque history; an accepted destination is acknowledged once if the legacy pop listener also runs, with navigateerror clearing it. Same-job query traversal defers to existing workspace/child behavior. Unmount/confirmed save removes listeners; failed results stay armed. Cross-document retains beforeunload, and unavailable/noncancellable API retains only existing click/unload/legacy pop fallback. That fallback has no new precommit or unsupported-browser guarantee; installed React use does not establish actual browser cancellation capability. Sanitized runtime capability kinds in E03 must qualify the real branch on the next required CI. No generic navigation layer or authority change exists.

- `src/components/jobs/JobCardForm.tsx:55` — `Same-document traversals`: scopes precommit protection to the observed unmount boundary.
- `src/components/jobs/JobCardForm.tsx:60` — `const traverse`: preserves same-job/cross-document/noncancellable boundaries and asks before commit.
- `src/components/jobs/JobCardForm.tsx:70` — `permittedTraverse`: suppresses only the matching already-accepted legacy prompt.
- `src/components/jobs/JobCardForm.tsx:84` — `removeEventListener`: cleans up the added listener alongside existing guards.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:81` — `const navigation`: emits only sanitized actual traversal capability kinds.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:211` — `BookingEditor close`: waits for the existing real close marker handoff before the next E01 modal/tab action.

E01's first-attempt missing upgrade modal coincided with later navigation completion. The existing booking editor owns an asynchronous close Back; both E01 close handoffs now observe absence of its application marker KEY before subsequent actions. No private Next state value is inspected, no BookingEditor/Dialog source changes, no timeout/retry/expectation removal. The causal race is an inference pending real first-attempt execution. Existing E03 diagnostic and every refusal/refresh/Back/save/retry/persistence assertion remain active; E04/E05 actual fifth-run first-pass history stays distinct.

The actual extracted CardForm hook/navigation/history/action-result stand-in probe reproduced observed unmount-before-pop as RED/native1, then GREEN/native0 for refusal preserving the mounted armed component and opaque state object with zero history writes, accepted-once legacy ordering, same-job deferral, error acknowledgement cleanup, unsupported/noncancellable/cross-document fallback lifecycle, failed-result armed, confirmed-result disarmed and unmount cleanup. Source C:/Users/Rasmus/AppData/Local/Temp/story-16-5-precommit-guard-caller-probe.cjs SHA3afcf88d1919222c0c07310de8602c28f4207414e6a470739db64586c94ed2e2; red log SHAaca8b59b1fce3c835cdce604c9aff8373b63824d8f5af0bd476dbff879291f6c; green log SHAff9b05e913d4ae4356f41224a5952fdca4be20be312a3660cb7562eed48d4008. These callbacks and synthetic results are not live browser/Next/server proof.

Raw submit-through-render SHA498b53e3928c4282e96260e49530a709ed83c2c866d4a164c24c0a52d83b4101 and render SHA40d33b277d7f41b02f0491597647c67778bb92e75259a77e4abbfead8358db0f exactly match reviewed1d35 and pre-edit RED. Larger attempt/send/retry tail matches after LF normalization; raw larger-tail equality is not claimed because of existing working-copy line endings. Native0 equivalence log C:/Users/Rasmus/AppData/Local/Temp/story-16-5-precommit-payload-equivalence.log SHA1d70d19e3492f410fb845b0fa31d90a1ba11199b2347ed1d48758e67d1ce38f9 preserves that distinction. No payload, precise-window serialization, attempt, stale/refetch or action logic changed.

Affected TSC/lint, workspace collection5/1, production build and final-build containment all native0; persisted explicit-code logs story-16-5-precommit-guard-{typecheck,lint,collection,build,containment}.log and passing diagnostic privacy probe story-16-5-precommit-diagnostic-privacy-probe.log are in that Temp directory. No redundant unit/broad review/external upload/resource launch occurred. Latest listener/test correction requires same High targeted review and new exact-head full required CI; all five failed runs and E01 flaky remain historical. No delivery/development-complete/done claim.


### Observe refused native actions without waiting for a prevented commit

Fix-author rationale: the native reload and Back now use page.evaluate solely to invoke window.location.reload()/window.history.back(). Dialog observation still starts before each action; exact dialog type/message, dismissal, awaited JavaScript command completion, retained draft and same URL assertions remain, followed by all original SPA/retry/save/persistence checks. This corrects an observer deadlock: installed Playwright reload/goBack await a navigation commit that successful refusal prevents. Sixth-CI diagnostics demonstrate the supported traverse branch requested and refused confirmation; they do not establish completion of the later E03 journey. Production CardForm bytes remain unchanged SHA bf85ac3e941e5c20832645ae23a18745dd888375927fa0fd649da396cbc3184d. No evaluate-click, state injection, added case, catch, timeout/retry change or assertion removal occurs.

- `tests/e2e/jobs/job-workspace.e2e.spec.ts:451` — `const prompt = page.waitForEvent("dialog")`: observes the real beforeunload before requesting reload.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:452` — `window.location.reload()`: requests native reload without a prevented-navigation completion waiter.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:461` — `window.history.back()`: requests actual native traversal after registering its real dialog observer.

Installed adapter correlation: node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/lib/coreBundle.js lines21608-21615 reload,21618-21634 goBack,22737-22753 navigation wait and36800-36808 real Chromium history-entry request. The private actual-E2E-binding/installed-adapter probe is RED/native1 then GREEN/native0 using explicit no-commit frame/delegate/window stand-ins; it proves adapter semantics, not live browser/dialog/authority acceptance. Source C:/Users/Rasmus/AppData/Local/Temp/story-16-5-refused-action-adapter-probe.cjs SHA7b2d87d4653960efcfc6e059bb6984ca529e4ef236baefaaecd6ca8adb10064f; red log SHAff583ca50a36c241239ee4efba6f1e09af5998335f854a3f42e16966a08976b0; green log SHA8dbab1aa7a87df823cbaa0f6d9cf551039e94e0fddf1ede3951aeb8f2e5b5a54, same Temp directory. Final affected TSC/lint and five-case Playwright collection each native0 with explicit-code story-16-5-refused-action-{typecheck,lint,collection}.log there. No redundant unit/build/broad/external review or resource launch occurred. Intended smoke remains33; all six failed CI histories stay visible, and exact new-head full required CI must execute the retained complete E03 before delivery or completion.
