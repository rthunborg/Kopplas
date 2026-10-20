---
title: '15.4 — Time Reporting — Filing, Timesheet, Review'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
review_loop_iteration: 0
followup_review_recommended: true
baseline_revision: '4862704665cb12e4f577ecac59ee173c49c36763'
context:
  - docs/process/review-order.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - docs/process/local-setup.md
  - _bmad-output/test-artifacts/test-design-epic-15.md
  - _bmad-output/auto-bmad/preparation/story-15-4/implementation-ownership-handoff.md
  - _bmad-output/auto-bmad/preparation/story-15-4/current-contracts-and-design.md
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** People can see their bookings but cannot file server-confirmed time, inspect their week or give planners a trustworthy review basis. Missing time has no scoped reminder producer.

**Approach:** Add own-row submitted-only time reporting from current booking cards or a standalone form, an own weekly timesheet, PL/Admin review/annotation and bounded E13 in-app nudges. Separate duration/date/state/validation/actions from replaceable presentation; retain reusable booking/job links without valuation.

## Boundaries & Constraints

**Always:** Phase B FR90/FR92 and architecture §10.6 apply. Derive tenant/reporter/actor from current authenticated membership; ReportOwn never grants peer filing, Review grants tenant-scoped read and annotation only. Enforce same-tenant references and own planned-booking assignment inside checked SQL; a standalone row may omit both links. Positive whole-minute duration and real local date are authoritative, with `submitted` the sole status. Freeze a linked booking's nonmonetary booked-duration comparison at filing. One attributable report+audit transaction, actor-bound attempt/digest, current-authority replay and conflict detection for changed retry content prevent duplicates/partial writes. RLS, explicit narrow ACLs and exhaustive manifest/H4 enrollment independently protect direct paths. Connected desktop/360×640 UI retains suitable unsent input on failure and confirms submitted only after server persistence. Review metadata cannot alter filed time. Nudges use the existing authenticated E13 runner, explicit bounded tenant scope, current preferences and stable recipient/date dedupe; no client/read/filing service-role path.

**Block If:** Root has not independently validated/frozen this spec or Coordinator has not allocated its exact shared deltas, isolated fixtures/resources and a new migration sorting after current108; or implementation discovers an unresolvable authorization/data-integrity requirement or material product ambiguity beyond the approved requirements/defaults. Allocation/validation are later implementation prerequisites, not missing planning intent. After two failures of one approach choose a simpler authorized route or name owner/evidence/next action/resume condition.

**Never:** On-behalf filing; manager visibility used as own assignment; UI-only authorization; client actor/creation-time/tenant authority; stale replay grants; separate report-then-audit writes; raw service-role booking-grant widening; money/rate/salary/valuation columns or reads; approval/rejection/billing states; mutation of accepted quote/job commitments or booking conflict acceptance; report self-correction/deletion/retention program. No new job/economy/billing workspace, calendar feed, Min dag landing, AI/optimizer, offline/PWA/queue/sync, provider/email go-live, public privileged path or other Phase C surface. No legacy URLs/evidence/browsing, foreign checkout copying, absent E16 imports, deployment/PR/push/merge/secrets/state/sprint changes in this planning run.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Booking or standalone filing | Own planned booking or Ny tidrapport; adjusted interval/hours/date; optional note/job | Prefill is editable; checked SQL stores actor's submitted report and attributable audit, stable optional links and booked-minute snapshot | Wrong tenant/owner/job pair, inactive membership, invalid date/duration or unavailable reference fails generically with no write |
| Unknown outcome/retry | Saved response is lost, same attempt retried, or changed payload reuses key | Exact authorized replay returns original own report, one row/audit; concurrent duplicates converge | Preserve exact uncertain payload/token and Osänd input; reconcile before editing; changed key content conflicts, revoked current authority denies |
| Personal week | Connected own reports and weekday bookings | Own day rows/chips/minute totals and missing-booked-day indicators; failed reads never mean zero | No peer records/roster/money; Anslutning krävs with explicit retry when unavailable |
| Review/annotation | Admin/PL person/job/week filters and report sheet | Complete per-person/job sums, labelled report-vs-booked-at-filing delta and one current review note with actor/time/revision; status remains submitted | Standalone has no fabricated booked value; stale annotations refresh; reviewer cannot rewrite reporter/core fields |
| Nudge | Completed local weekday has own planned booking but no own submitted row | Hourly bounded existing runner emits at most one in_app reminder per eligible recipient/date, preferences honored | Frozen7-date window/cursor, explicit tenant scope and atomic checks; failures retry without duplicates or exposed booking facts |

</intent-contract>

## Source Acceptance and Provenance

AC sketch: `time_reports` own-row-scoped (user, date, duration, optional booking/job links, note; `status` column ships `submitted`-only — the reserved approval seam, decided at the B1b→B2 checkpoint per AB-A10); filing from booking cards pre-filled (≤30-second one-hand phone flow) or standalone (`Ny tidrapport`, PB-D12); suitable unsent input survives a transient request failure, remains labelled unsent, and explicit retry is available; the `submitted` domain/UI state appears only after server persistence; personal week timesheet with missing-day nudge indicators (+ `time_report.nudge` producer registered in E13's registry); desktop review surface for PL/Admin (person/job/week filters, per-job/person sums, report-vs-booked delta highlight, review/annotate affordances — no hard approval state); hours flow onward valued only in economy read-models (report rows carry no money); per-role RLS (own rows vs review scope).

**No Design Gate Criteria for this story.** Story15.4 in epics-phase-b.md supplies the AC sketch above without four-part Visual/Behaviour/Animation/Visual-validation gates. Binding Phase B UX§§4.7/4.8/6/10 still applies. October19 completion policy defers exhaustive visual/manual/release checks and actual ≤30-second one-hand timing; usable essential functionality, authorization and persistence still require executed development evidence.

References: AGENTS.md; _bmad-output/project-context.md; current epic-15-context.md; epics-phase-b.md Story15.4; prd-phase-b.md FR90/FR92 and PB-D12; architecture-phase-b.md §§3.3–3.7/4/9.2/10.6/11/14/16; ux-design-specification-phase-b.md §§4.7/4.8/6/10; listed companions and TEA15.4 scenarios. Current Phase B sources supersede historical Phase A source names used by installed templates. No nextjs-app/docs/design/DESIGN.md or supplied Figma exists; actual globals.css/Dialog/editor patterns and owner-authorized defaults govern, without new legacy observations.

Continuity: valid cached Epic15 context and completed15.3 were loaded;15.1–3 stay preserved. Current source HEAD is `5040f683cf9446d39de8512cdca82242c55fca3e`; prior15.3 CI39363860222/atd550/all5PASS is predecessor evidence only. Keep v3 facts/proof domains/exact13 claims, tenant locks, resolver shared refresh/ledger/in_app booking.changed and recurrence exceptions/tombstones/stable IDs.105/106/107/current108 migrations are immutable. Current16.1 is a landed dependency; unfinished16.2/16.3 is not imported or required. Inherited epic review_unverifiedTRUE remains Root-owned. Epic14 October8 accepted-with-open-items carries48 quality advisories, unapproved performance targets and unexecuted manual work; historical ContractD transfer already handled by15.1 is not reopened.

## Code Map

- `src/scope/manifest.ts:263`, `src/server/authz/permission-matrix.ts:39`, `src/components/app-shell/nav-items.ts:28` — active scheduling owns no time-report surface yet; add only allocated report table/route/category and scoped operations, not future feed/MyDay.
- `supabase/migrations/20260929120000_resource_person_profiles_and_work_hours.sql:6`, `supabase/migrations/20261006104143_booking_invariant_corrections.sql:13`; `src/server/read-models/scheduling.ts:120` — membership→profile→assignment ownership; existing own helper explicitly requires Montör and cannot validate PL/Admin own filing alone.
- `supabase/migrations/20261019133151_e16_16_1_job_depth.sql:57`, `supabase/migrations/20260709120000_acceptance_to_job_model.sql:169` — reuse current job visibility and same-tenant links; no quote/job acceptance or lifecycle approval inference.
- `src/server/commands/envelope.ts:51,197,217`, `src/server/commands/bookings/create-booking.ts:7`; `supabase/migrations/20261006101609_bookings_and_assignees.sql:181` — capability/envelope, SQL-owned audit and durable command replay patterns. Check current authority under lock before replay; do not edit historical SQL.
- `src/features/scheduling/time-zone.ts:10,45,63,67,97` — real date validation, Stockholm conversion, local-day boundaries and elapsed minutes; reuse with independent DST goldens, never derive time by employment percentage or naive wall-clock subtraction.
- `src/components/scheduling/BookingBlock.tsx:7`, `src/components/resources/BookingEntry.tsx:29`, `src/components/crm/Dialog.tsx`, `src/app/globals.css` — actual booking entry/host and existing controls/styles; add own-report action without changing editor/resolver gestures.
- `src/app/(app)/customers/[customerId]/page.tsx:146`, `src/app/(app)/jobs/[jobId]/page.tsx:82`, `src/app/(app)/jobs/page.tsx:21` — current BookingEntry callers need minimal own report-action metadata from the new report read model; exact E16-adjacent candidate deltas require Coordinator allocation.
- `src/server/notifications/registry.ts:3`, `src/server/jobs/producers.ts:28`, `src/app/api/jobs/run/route.ts:120`, `src/server/jobs/runner.ts:67`; `src/server/notifications/follow-up-producer.ts:96` — existing manifest/category/producer/dispatch/UTC-cadence/cursor seams. Booking raw service-role ACL is revoked at `20261006101609_bookings_and_assignees.sql:104`; a bounded service-only RPC is required instead of copied raw scans.
- `supabase/migrations/20260923170000_in_app_notifications.sql:3`, `supabase/migrations/20261020180000_conflict_resolver.sql:85,92`; `supabase/migrations/20260928110819_epic_13_reviewbot_followup_atomic_job_run_audit_and_config_recovery.sql:45` — existing notification recipient/date uniqueness, current booking.changed constraints, checked emitter and service-only RPC grant precedents.
- `tests/integration/rls/tenant-table-inventory.ts`, `tests/support/authz/role-harness.ts:15,216`, `tests/factories/tenants/core.ts:223`, `tests/support/bookings-atdd.ts:187`, `tests/e2e/support/scheduling-views-atdd.ts:48`, `tests/e2e/conflict-resolver.e2e.spec.ts:33` — exhaustive enrollment and isolated role/booking fixtures; actual committed-response-loss retry precedent. `tests/e2e/jobs/job-list-deferred-surface.e2e.spec.ts:76,123` needs content-scoped absence checks while preserving the job-timesheet boundary at130.

## Files Created / Files Modified

The ownership handoff lists exact new/shared candidate paths, semantic limits, new migration requirements, tests/helpers and mutable resources. It is an allocation proposal, not a write claim. No dependency/lockfile/.env/config/shared-governance change or future E16 file is proposed. A newly discovered shared path or semantics requires a bounded ownership successor before overlapping writes.

## Tasks & Acceptance

**Execution (dependency order; Root validation and Coordinator allocation precede writes):**

- [ ] T1 — `src/features/time-reports/types.ts`, `validation.ts`, `domain.ts`, `action-state.ts`: implement client-safe report/annotation/attempt contracts, exact minute/date/interval parsing, own week/missing-day/totals/delta projections and honest unknown-outcome state; pin I/O edge cases. Supports AC1–8.
- [ ] T2 — new Coordinator-allocated `supabase/migrations/` migration, logical basename `time_reports` with unique timestamp after20261020180000: add table/composite FKs/safe SELECT RLS+ACLs, checked own filing/annotation with durable attempt/revision, immutable core/snapshot and atomic audit; add bounded service-only nudge RPC and coherent category constraints. Enroll only report table/route/category in `src/scope/manifest.ts`. Supporting infrastructure for AC1/2/4–9.
- [ ] T3 — `src/server/authz/permission-matrix.ts`, `src/server/commands/envelope.ts`; new `src/server/commands/time-reports/file-time-report.ts`, `annotate-time-report.ts`, `time-report-db.ts`: register ReportOwn/AdminPLMontör and Review/AdminPL; use checked SQL on request-bound ordinary clients, generic errors and no duplicate outer audit. Supports AC1/2/4–8.
- [ ] T4 — `src/server/read-models/time-reports.ts` (new): own/review scoped paged reads, safe currently authorized optional selectors and current-user booking prefill; complete week/person/job sums and explicit read failures; no money/private attempt fields. Supports AC1/3/4/8/9.
- [ ] T5 — `src/server/notifications/time-report-nudge-producer.ts` (new), `src/server/notifications/registry.ts`, `src/server/jobs/producers.ts`, `src/app/api/jobs/run/route.ts`: wire hourly bounded current-preference in_app nudge using T2 RPC/frozen cursor and existing runner; retain all E13 release/containment and booking.changed behavior. Supports AC5/8.
- [ ] T6 — `src/features/time-reports/actions.ts`, `src/app/(app)/time-reports/layout.tsx`, `page.tsx`, five named new UI files in handoff; existing nav-items.ts/BookingBlock.tsx/BookingEntry.tsx: deliver protected dynamic route, own week/reviewer mode, prefilled and standalone filing, editable interval/hours, review sheet and honest connection/unsent/retry feedback with keyboard/focus/360×640 controls. Supports AC1–6/8/9; reusable entry remains a15.6 seam.
- [ ] T7 — `tests/unit/features/time-reports/domain.test.ts`, `tests/integration/commands/time-reports.int.test.ts`, `tests/integration/rls/time-reports.rls.test.ts`, other exact new read/producer/component suites/helpers in handoff: prove all I/O edges with independent date/minute/DST oracles, own/other/foreign/mixed/revoked roles, assignment/link races, exact replay/duplicates/audit rollback, annotation revision/core immutability, paginated sums and nudge scope/preferences/cursor/dedupe. Supports AC1–9; TEA15.4-RLS-001/INT-001…004/COMP-001.
- [ ] T8 — `tests/integration/rls/tenant-table-inventory.ts`, `tests/support/authz/role-harness.ts`, `tests/e2e/jobs/job-list-deferred-surface.e2e.spec.ts` and exact shared cross-tenant/migration-reset/scope/matrix/category/producer tests in handoff: enroll the new table/route/operation/category without relaxing exact assertions; narrow the whole-body tidrapport absence guard to existing job content while preserving deferred job-timesheet absence. Supporting infrastructure; all ACs and unchanged15.1–3/job/E13 regressions.
- [ ] T9 — `tests/e2e/time-reports.e2e.spec.ts`, `tests/e2e/support/time-reports-atdd.ts` (new): essential actual configured-production browser booking-card and standalone filing→persisted own week→PL review/filter/annotate→reload, plus360×640 keyboard/transient/lost-response explicit same-attempt retry with physical row/audit readbacks. Supports AC1–8/TEA15.4-E2E-001; no mocked success or next dev.
- [ ] T10 — this spec and future `_bmad-output/auto-bmad/delivery/15-4-time-reporting-filing-timesheet-review.json`: author records actual gates/counts/revision, independent High review, approved-contract reconciliation, deferred release ownership and one author-written Suggested Review Order with verified stops; Root runs delivery gate before done. Supporting completion infrastructure, no completed trail/delivery record is manufactured in planning.

**Acceptance Criteria:**

- AC1 — Given an authenticated reporting-capable user on an own planned booking card or Ny tidrapport, when the form opens, is adjusted and submitted, then booking times/job prefill or optional standalone links are shown and the actual own submitted report/date/minutes/note/links appear after server-confirmed persistence; desktop and360×640 controls remain usable by keyboard and touch.
- AC2 — Given a transient failure, lost committed response, concurrent duplicate or changed retry payload, when the user explicitly retries, then suitable unsent input remains labelled unsent until confirmation, an exact authorized attempt yields one report and one audit, changed content under its key is rejected, and audit/reference/authorization failure leaves no partial result.
- AC3 — Given a successfully loaded personal week, when date navigation or refresh occurs, then only the caller's day rows, reported hours and booking/job chips appear with correct totals and weekday-booking-without-report nudges; a failed read offers Anslutning krävs/retry and never an empty-success or false zero state.
- AC4 — Given PL/Admin review access, when person/job/week filters or a report sheet are used, then complete authorized per-person/job reported sums include standalone groups, the linked report delta uses clearly labelled booked-at-filing minutes, and an annotation saves reviewer/time/revision without changing submitted status or filed core fields; standalone/inaccessible live booking facts are never fabricated as zero booked time.
- AC5 — Given an eligible missing weekday in the frozen preceding seven completed local dates, when the hourly existing E13 runner processes bounded pages or retries, then only active authorized recipients with own planned bookings/no submitted day report receive at most one time_report.nudge in_app per date, with preference opt-out respected, no today/future/other-tenant leak and no mail/provider behavior change.
- AC6 — Given invalid/overflow/nonminute duration, invalid local date, mismatched booking/job, cancelled/foreign/unassigned booking or unavailable reference, when filing is attempted through form, command or direct RPC, then validation/current own authorization rejects generically without writes; valid standalone filing requires neither booking/job nor person profile, and DST elapsed-time prefill has independently correct minutes.
- AC7 — Given two reviewers or a lost annotation response, when notes are saved or retried, then expected revision and exact latest-attempt identity prevent stale overwrite/duplicate audit, superseded retries require refresh, and every direct attempt to change report identity/date/duration/reporter note/links/snapshot/status or delete is denied.
- AC8 — Given anonymous, own-only, foreign-tenant, inactive/revoked, seller/economy/platform-only and valid mixed-role callers, when report selectors/reads/aggregates/filing/annotation/replay/direct DB/RPC/producer surfaces are exercised, then current matrix/RLS/column grants and same-tenant/actor rules hold independently of the UI, with no peer or private-attempt/money disclosure and no unauthorized partial audit/notification effect.
- AC9 — Given persisted time reports linked to existing jobs or bookings, when the stable authorized time read seam is consumed by job/period, then exact user/date/minutes and optional stable IDs are available without re-entry, booked comparison remains stable after booking changes, and report rows/projections contain no rates/money/approval states; existing15.1–3/E13/current job behavior remains intact.

## Spec Change Log

2026-10-20 author boundary correction under approved maintainable defaults: genuine booking intervals can contain seconds/microseconds, so booked-at-filing provenance uses positive numeric elapsed minutes. Filed report duration remains a positive PostgreSQL integer with no rounding. An interval that cannot prefill whole report minutes retains its own booking/action/reference and asks for an explicit whole-minute declaration; it must not fail an otherwise valid own week. Existing High UI and integrity authors receive only their original disjoint files for this correction and boundary assertions. Kernel and product scope are unchanged.

2026-10-20 Coordinator successor allocation received through Root: the implementation author extends only `tests/unit/features/scheduling/calendar-components.test.ts` (VM report-entry dependency enrollment and real BookingBlock own-action/propflow assertion) and `tests/unit/scripts/verify/integration-test-partitions.test.ts` (exact four-file serial membership and parallel exclusions). The existing scheduling and partition negatives remain. These repair the twelve reproduced unit failures caused by new imports/exact enrollment; no product behavior or runtime authority expands.

2026-10-20 focused test-author route: context-free Sol 6.1 High owns allocated integration/RLS/harness/E2E/config/scope assertions only, because real authorization, audit rollback and isolated fault-DDL assertions are sensitive. Execution remains static only; Root owns DB/browser admission.

2026-10-20 implementation route: Sol 6.1 High author retains SQL/commands/read models/nudge and integration authority; one context-free Sol 6.1 High UI/domain delegate owns only the allocated feature/UI/booking-action caller and focused unit/component files. High is selected because action-state replay and request-bound actions are sensitive. No runtime or Git authority is delegated.

## Review Triage Log

2026-10-20 Round 1 of 3: nine accepted patch findings (three High, six Medium), zero intent/spec gaps and re-derivation iteration zero. The external wrapper failed with exit 1 (`The system cannot find the file specified.`); its recovered report is triage input only, with actual external model metadata unavailable. Source was not accepted. The original Sol 6.1 High author retains the synchronous fix batch. The existing UI author is re-engaged at Sol 6.1 High for R1-01–05/08/09 in its original feature/controller/component/E2E paths; the implementation author retains decimal arithmetic R1-07, proposed preference-serialization R1-06 and final integration/SRO. High covers uncertain filing integrity and shared SQL serialization. No nested runtime, commit, broad review or kernel change is delegated. The new preference write contract awaits Coordinator reconciliation before any SQL write.

The existing integrity-test author is re-engaged at Sol 6.1 High only for R1-06 deterministic two-session/barrier assertions in the allocated serial nudge suite. It writes no preference trigger or shared contract and starts no runtime; the new contract remains on hold until actual semantic allocation.

Coordinator's final R1-06 allocation authorizes only the unapplied109 affected-row preference contract and allocated serial tests. The earlier membership-scanning statement-trigger proposal was rejected and was never written. The implemented invoker row trigger tries the distinct sorted affected OLD/NEW tenant gates for nudge INSERT/UPSERT/UPDATE/DELETE and category/tenant moves; a busy gate raises `55P03` and aborts the transaction for explicit retry. It never waits after a tuple lock and has no authenticated, service, definer, JWT or native-fixture exemption. The producer retains its tenant gate and current preference predicate but drops preference tuple locks, allowing writers to reach the nonblocking gate. Current preference reads occur after the advisory wait under the existing READ COMMITTED/volatile-RPC contract; no broader isolation guarantee is asserted. Existing API failure/retry behavior, RLS, categories, grants, membership/role/profile locks and atomic notification/audit effects remain. The precise shared semantic delta and bounded UUID/session-scoped test barrier were allocated before their writes.

## Design Notes

Round 1 arithmetic correction: report-vs-booked delta now subtracts the inputs' decimal numeric representations with integer scaling, then converts the decimal result to the existing numeric DTO. This preserves the received booked provenance, including 60.1 minutes, and displays 75−60.1 as 14.9 minutes without adding binary subtraction digits. It introduces no money arithmetic or report-duration rounding; filed minutes remain integers. Six focused domain assertions passed with zero skips during the fix batch, including independent tenths and micro/exponent boundaries. Final integrated evidence is recorded separately after all fixes settle.

The design companion records the rationale for scoped capability names, immutable filing plus minimal reviewer metadata, booked-minute snapshot, exact retry semantics, same-tenant/assignment enforcement and bounded seven-day in_app nudge defaults. These are maintainable technical choices within approved behavior under owner authority; Root's distinct High validation may identify a bounded correction before freeze. Do not infer a separate canonical SPEC.md: this sprint BuildAuto spec's intent-contract is its kernel; exact candidate hashes are in the preparation validation receipt. No approved kernel binding is claimed before Root freeze.

## Verification

### Implementation checkpoint — 2026-10-20

Current result: implementation is ready for independent source review, with required runtime evidence pending. This is an uncommitted working-tree check against baseline `4862704665cb12e4f577ecac59ee173c49c36763`; Root owns the later source commit, review/CI admission and exact-head evidence. Status remains in-progress. The frozen LF intent-contract SHA256 is still `3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb`.

Implemented T1–T6/T8 and the executable test/essential-browser source for T7/T9. All original 50 skipped declarations are active and statically bound to production exports; six additional boundary assertions bring the report suite inventory to 56 declarations with zero explicit skips. Commands11/RLS7/read7/nudge9/essential-browser3 still require actual execution. The component suite has seven executed SSR assertions; report pure units have twelve executed assertions. Collection is discovery only: it confirms three essential browser cases and exact serial membership of report command+nudge files, while report read/RLS/component remain parallel. T7/T9/T10 completion still requires their remaining actual gates and author evidence refresh.

Actual bounded checks in this run:

- `pnpm typecheck` passed after the final fractional-booking change.
- `pnpm exec eslint src tests scripts` passed with zero errors and 17 existing warnings. The ordinary `pnpm lint` attempt was interrupted after traversing retained ignored `.env.epic15.mail-runtime` trace assets; canonical clean-checkout lint remains for CI. No ESLint configuration or ignored artifacts were changed.
- Final `pnpm run test:unit`: 3,036 tests, 3,035 passed, zero failed, one Windows-only skip. That skip is `versioned file-backend restore preserves the DB-owned identity and refuses overwrite`, which requires Linux xattrs and remains required in CI. Before the two-path allocation/fix, two full runs each had 3,034 tests, 3,021 passed, 12 failed and one skip. Focused reproduction identified eleven calendar VM-loader failures on the newly imported report entry and one exact serial-partition expected-set failure. The allocated fixes preserve existing negatives and add real BookingBlock own-action/propflow coverage; their focused rerun passed all 15 assertions. After those fixes and before the fractional boundary correction, the full run had 3,035 tests, 3,034 passed, zero failed and one skip.
- Focused report pure units passed 12/12 with zero skips; isolated SSR component assertions passed 7/7 with zero skips. SSR uses synthetic props and proves rendered states only; it does not prove interaction, focus, transport or persistence. The shared scope/matrix/category/producer focused unit run passed 48/48 with zero skips.
- `pnpm build` passed after final product-source changes and generated the dynamic `/time-reports` route. Source and built-bundle service-role containment and the lockfile guard passed. Parent independently executed `pnpm install --frozen-lockfile`, `pnpm audit --audit-level=high` (zero high findings, two moderate advisories), `test:bmad-focused` (2 passed) and `test:auto-bmad-focused` (41 passed); dependency/process sources were unchanged by this story.

No database, Storage, browser, application server, Compose, native Supabase or CI runtime was started or adopted by this author or its two bounded authors. Actual REQUIRED full integration/RLS, current-history migration replay/seed/ACL verification, physical recovery-Storage checks and the three configured-production essential browser flows are pending Root's independently reviewed exact-head CI lane. Independent High review is pending. No development-complete/done/release-ready assertion or passing delivery JSON is written here.

Deferred release work retains the existing owners: QA/UX owns exhaustive device/view/browser matrices, screenshot comparison, manual accessibility/daylight/exploration and actual ≤30-second one-hand timing; Product/Architect owns representative workload/threshold approval before performance certification; the delivery owner owns polish. Evidence is unexecuted/deferred, and the next action is a separately admitted release-validation run plus recorded manual/performance outcomes. Consequential functionality and integrity remain development gates. No deployment/merge/publication approval is implied.

Fixture limit for independent review: `cleanupOwnedTimeReports` uses the repository's test-admin transaction convention, with `SET LOCAL session_replication_role=replica` on one connection and deletion restricted to explicit owned tenant report rows; commit/rollback restores the session setting. It makes no global/catalog/production-trigger change. The two fault suites remain serialized after the parallel group; their stage-aware temporary audit triggers and cleanup assertions still need real CI execution. Beforeunload/Dialog guards preserve pending/uncertain input in the connected UI; custom browser-history interception and durable/offline storage are absent.

### Round 1 fix checkpoint — 2026-10-20

This synchronous original-author batch fixes the nine accepted Round 1 findings against source commit `73169cc0c75d88fbb16dc999ef99cbd9028ff361`; changes remain uncommitted for Root's scoped fix commit and independent focused review. Accounting is one counted review round of three, zero re-derivations, patch9 (High3/Medium6), intent_gap0, bad_spec0, defer0, reject0; follow-up score18 and the High patches retain `followup_review_recommended: true`. The external wrapper remains failed/unqualified; its recovered report is triage input, not a passed review layer.

R1-01 preserves the unresolved exact attempt across a definite denied retry. R1-02 preserves each unchanged UTC endpoint independently, including fold offset/microseconds. R1-03 retains canonical prefilled minutes across modes while edited decimal hours still require exact whole minutes. R1-04 defaults the first standalone start's date until explicit date selection. R1-05 guards review links with the same dirty/pending/unknown state. R1-06 adds the allocated all-writer affected-tenant nonblocking preference contract and both acknowledged-order race assertions. R1-07 uses decimal-safe delta subtraction without altering the booked snapshot. R1-08/09 bind the tested stale-annotation and latest-response behavior to production controllers, with meaningful actual-handler assertions. No intent/kernel change, new path, API/grant, dependency, isolation level or runtime expansion is introduced.

Actual bounded evidence after the UI/domain fix integration:

- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/time-reports/domain.test.ts tests/unit/features/time-reports/validation.test.ts tests/unit/features/time-reports/action-state.test.ts`: 17 passed, zero failed/skipped, executed by the same bounded High UI author.
- `pnpm exec vitest run tests/integration/components/time-reports.test.ts --project integration-parallel`: 15 passed, zero failed/skipped (eight SSR and seven actual TSX-controller VM cases), executed by that author using the checked-in standard config/globalSetup. The selected component suite has no database test body; config reachability checks are not database coverage. VM replaces hook scheduling, action/read transport and router effects; it proves handler decisions/propflow, not DOM/focus, authorization or persistence.
- `pnpm run test:unit`: 3,041 total, 3,040 passed, zero failed, one existing Windows/Linux-xattr skip. The exact skipped file-backend restore test remains required in Linux CI. Earlier 3,034-test/12-failure runs and their causal repairs above remain historical evidence.
- `pnpm typecheck` and final `pnpm exec tsc --noEmit --incremental false` passed. `pnpm exec eslint src tests scripts` passed with zero errors and 17 existing warnings; final focused lint of the nudge and migration-reset test files passed with zero errors/warnings after the integrity handoff. Canonical clean-checkout lint remains CI-owned after the historical interrupted root scan.
- `pnpm build`, `pnpm run verify:service-role-containment`, `pnpm run verify:bundle-containment` and `pnpm run verify:lockfiles` passed. No dependency/process source changed, so the earlier frozen-install/audit/process outcomes are retained without duplicate execution.
- Browser discovery lists the three existing essential flows only. Serial discovery with the actual configured `integration-audit-ddl` project lists exactly job-runs, conflict-resolver, report-command and nudge files. An initial inventory call used nonexistent project `integration-serial` and exited1; correcting the project filter passed without source/config changes. Discovery is not test execution.
- `node scripts/verify/check-review-order.mjs _bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md` passed with one section, 20 verified stops and zero errors after correcting two stops moved by the final test edit. `git diff --check` passed.

The source inventory now has 73 report declarations: pure17/component15/command11/RLS7/read7/nudge13/browser3, with zero explicit skips. The original 50 skipped declarations remain active; this batch adds five pure, eight component and four nudge declarations to the preceding56. Component execution and unit execution do not establish the unexecuted SQL/browser outcomes. Actual REQUIRED integration/RLS, migration/reset/seed/ACL, recovery Storage and production-browser checks remain pending Root's exclusive exact-head CI. The LF kernel digest remains `3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb`; original preparation files are unchanged. No runtime, commit, delivery pass or done status is claimed.

### Historical preparation evidence

This planning run executes artifact/process checks only: source AC comparison, seven-point immediate story audit, READY standard, spec reader/discovery, exact raw/kernel hashes and clean tracked-source/cached-context preservation. Zero app/schema/test/scaffold/runtime/CI execution is claimed. Root separately dispatches independent High specification validation.

Future development: frozen install; applicable `pnpm run verify:development`, `pnpm audit --audit-level=high`; full `SUPABASE_TEST_REQUIRED=1 pnpm run test:int` with actual counts, all new focused integrity suites plus existing booking/series/resolver/job/E13/role regressions; complete current-history migration replay/seed/H4/exact-policy/ACL agreement; direct physical recovery-Storage integrity; essential configured-production Playwright time-reports and ordinary auth smoke; independent High review of actual sensitive diff. Record executed/failed/skipped counts and exact revision. No skipped suite, synthetic envelope, test collection or predecessor CI grants report acceptance.

Cover actual wrapper/direct-RLS positive controls, current-role revocation/replay, assignment reparenting and same-tenant links, report/annotation audit fault rollback, concurrent idempotency, complete paging/standalone totals, both Stockholm DST transitions/overnight/local week boundaries, booked snapshot after booking changes, bounded producer cursor beyond25 recipients and7 dates, own recipient preferences/races, service-only ACL denial and preserved booking.changed/channel checks. Trace TEA15.4-RLS-001/INT-001…004/COMP-001/E2E-001 to real assertions and outcomes.

Deferred release validation retains exhaustive browser/device/view matrices, screenshots/visual comparison, manual accessibility/daylight/exploration and actual≤30-second one-hand timing (QA/UX), representative performance certification after Product/Architect approves targets, and polish (delivery owner). Record status/evidence/next action in later delivery/ledger; unexecuted means deferred, never passed. Consequential functionality/security/integrity failure still blocks development. Development-complete does not mean release-ready or authorize merge/deploy; no automatic previews/manual deployment is authorized. Root owns resources/Git/CI/state/aggregate ledgers; inherited review_unverifiedTRUE is preserved.

## Auto Run Result

Status: in-review — the original author applied all nine Round 1 patches; independent focused fix review and Root-owned exact-head CI remain pending.
Blocking condition: required database/RLS/migration/Storage/browser evidence has not executed for this implementation, and the fixed source has not been independently accepted. The external wrapper remains failed/unqualified pending Root's bounded qualification. No runtime or ownership expansion is requested; resume through the already allocated review/CI lane.

### Historical preparation result

Status: ready-for-dev
Blocking condition: none for planning.

HALT after planning. One original source AC sketch is preserved verbatim, with ten path-bound tasks and nine Given/When/Then ACs, exact candidate ownership and design companions, immediate seven-point audit and author READY self-review. No product intent gap was found. The intent-contract is the sprint BuildAuto kernel; candidate raw/LF kernel hashes and reader/discovery/preservation results are in preparation validation receipts. Approved kernel remains null pending Root's distinct independent High validation and freeze.

Root then obtains Coordinator allocation of exact shared semantic deltas, a unique new migration timestamp after20261020180000 and isolated mutable fixtures/resources before implementation. Three existing BookingEntry caller pages are explicit candidate metadata-only deltas, not permission to touch E16-owned job semantics. This run changes only this spec and its owned preparation artifacts; cached Epic15 context, all tracked source/history/state/sprint and inherited review_unverifiedTRUE remain unchanged. No app/schema/tests/scaffolds/dependencies/env, runtime/CI, Git commit/push/PR, provider/hosted changes or deployment occurred. Routes: Sol High author and one synchronous context-free Sol High read-only explorer, completed before HALT; no implementation/review round consumed. Completion hook preserves planning status and creates no completed Suggested Review Order or delivery/development-complete/release-ready claim.

## Suggested Review Order

Author: original Story15.4 implementation author, gpt-6.1-sol High; the same bounded High UI/integrity authors' fixes are reconciled here.
Refreshed against the Round1 fix working tree based on `73169cc0c75d88fbb16dc999ef99cbd9028ff361`, 2026-10-20. The frozen intent contract is unchanged; in-review status and required runtime limits remain.

### Own capture and honest retry

Entry now consumes the headless attempt/draft transitions. A denied retry cannot resolve an earlier unknown commit; independent untouched UTC endpoints retain their fold/microsecond identity, canonical booking minutes survive mode switches, and standalone start defaults the date until explicitly changed. AC1/2/6 are asserted through actual controller handlers and exact-input units; browser2 extends the same-attempt persistence scenario.

- `src/components/time-reports/TimeReportEntry.tsx:13` — `TimeReportEntry`: freezes unresolved attempts and composes connected capture.
- `src/features/time-reports/action-state.ts:36` — `timeReportDraftMinutes`: preserves untouched endpoints and exact canonical duration.
- `tests/integration/components/time-reports.test.ts:133` — `R1-01`: exercises actual filing handlers across loss, denial and confirmation.
- `tests/e2e/time-reports.e2e.spec.ts:76` — `15.4-E2E-002`: checks persisted same-attempt reconciliation after restored authority.

### Current authority and one attributable write

SQL checks the current role union under tenant serialization before replay, then locks own assignment and same-tenant job references. Immutable filing and reviewer CAS each persist with their attributable audit in one transaction; AC2/7/8 fault tests inspect physical rollback, while ACL/RLS tests protect direct paths.

- `supabase/migrations/20261020190000_time_reports.sql:48` — `time_report_actor_gate_internal`: checks current authority before replay.
- `supabase/migrations/20261020190000_time_reports.sql:62` — `file_time_report`: binds actor, attempt, references and booked provenance.
- `supabase/migrations/20261020190000_time_reports.sql:122` — `annotate_time_report`: checks revision and latest exact retry.
- `tests/integration/commands/time-reports.int.test.ts:193` — `15.4-INT-009`: proves business stage and atomic audit rollback.

### Complete projections and guarded review

The existing complete-page read model retains AC3/4/9 totals, filters and standalone groups. Production review now consumes stale-outcome/navigation guards and workspace response ordering; decimal-scaled subtraction preserves raw booked provenance without binary display digits. Actual TSX cases assert stale no-save, guarded links and out-of-order results; READ002 and READ007 retain SQL-backed projection assertions.

- `src/components/time-reports/TimeReportReview.tsx:11` — `TimeReportReview`: guards notes, frozen attempts and internal links.
- `src/components/time-reports/TimeReportWorkspace.tsx:14` — `TimeReportWorkspace`: publishes only the current request's response.
- `src/features/time-reports/domain.ts:28` — `reportedBookedDelta`: subtracts decimal minutes without snapshot rounding.
- `tests/integration/components/time-reports.test.ts:180` — `R1-09`: asserts latest selection and actual rendered result.

### Current preferences under bounded serialization

The existing jobs client supplies exact tenant/as-of/cursor scope. The allocated affected-row trigger makes every preference writer try OLD/NEW tenant gates and abort explicitly with55P03 when busy; removing producer preference tuple locks lets existing-row writers reach that guard. The producer re-reads the current predicate after its tenant wait under existing READ COMMITTED/volatile semantics; no broader isolation contract is claimed. AC5 source tests cover both acknowledged orders, real post-predicate barriers, explicit retry, service writes and tenant moves.

- `supabase/migrations/20261020190000_time_reports.sql:186` — `time_report_preference_gate`: tries affected tenant gates without waiting or writer exemptions.
- `supabase/migrations/20261020190000_time_reports.sql:209` — `emit_time_report_nudges`: retains bounded predicates, dedupe and atomic effects.
- `tests/integration/notifications/time-report-nudge-producer.int.test.ts:224` — `15.4-NUDGE-010`: observes producer waiting until authenticated opt-out commits.
- `tests/integration/notifications/time-report-nudge-producer.int.test.ts:268` — `15.4-NUDGE-011`: observes post-predicate producer and exact retryable writer failure.

### Integrity evidence and operational limits

NUDGE001 retains real SQL spring/fall, midnight and exclusive-end vectors; NUDGE004 retains frozen continuation beyond25 recipients. NUDGE012/013 assert affected-tenant/membership/category/service behavior and exact private trigger ACLs. These and command/RLS/read/browser bodies are active source awaiting Root CI. The temporary barrier releases its control gate before settling all pending sessions and exact catalog teardown; owned report cleanup retains its disclosed transaction-local test-admin bypass.

- `tests/integration/notifications/time-report-nudge-producer.int.test.ts:356` — `15.4-NUDGE-012`: asserts affected tenants and current membership without exemptions.
- `tests/integration/rls/migration-reset.int.test.ts:700` — `privateFunctions`: enrolls the new invoker trigger in the closed ACL set.
- `tests/integration/read-models/time-reports.int.test.ts:37` — `15.4-READ-002`: asserts complete filtered review and standalone totals.
- `tests/support/time-reports-atdd.ts:165` — `cleanupOwnedTimeReports`: confines immutable-fixture cleanup to explicitly owned tenants.

Evidence: the Round1 checkpoint above records focused17/17 pure units, component15/15 (8 SSR and7 actual-controller VM cases), full units3,040 passed/zero failed/one Windows xattr skip, type/source-lint/build/containment checks and source inventory. VM substitutes hook scheduling, action transport and router effects; SSR proves markup. Neither proves DOM/focus, authorization, network or persistence. The original failed-unit history, external-wrapper failure and unexecuted database/browser limits remain recorded. Required migration/RLS/Storage/browser execution, Linux xattr, canonical clean-checkout lint, independent focused fix review and passing delivery remain Root-owned; release matrices/manual timing/performance stay deferred. No done/development-complete/release-ready claim is made.
