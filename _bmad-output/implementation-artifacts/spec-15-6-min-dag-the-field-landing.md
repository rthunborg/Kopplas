---
title: '15.6 Min Dag — the Field Landing'
type: 'feature'
created: '2026-10-25'
status: 'in-review'
baseline_revision: '118ebced2898b96f4b3dfce86f2dec8b52dd8f72'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/project-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-15-context.md'
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/docs/process/development-completion-policy.md'
  - '{project-root}/docs/process/agent-model-routing.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md'
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Montör still lands on Dashboard; there is no connected field landing that combines their real bookings, job entry and time filing.

**Approach:** Activate `/my-day` under scheduling with a minimal own-person server projection, replace the Montör fallback landing, and compose existing job and time-report workflows into a phone-usable day agenda. E16 is active at the planning baseline; its personal active-jobs section therefore renders through the manifest seam.

## Boundaries & Constraints

**Always:** Current cookie-derived tenant/user and active membership control every read; use existing `Bookings.View`, `TimeReports.ReportOwn` and jobs relationship rules without new capability grants. Own-person applies to every role using Min dag, including managers. Never return money fields, quote/source identity, rates, costs, broad staff roster or unrelated records in its DTO. Preserve 15.1–15.5 behavior, notification preferences and current time command/idempotency/reconciliation semantics. ADR-B009: connected at 360×640, server confirmation before persistence success, explicit failure/retry, no stale job-list fallback. Day/week boundaries use Europe/Stockholm and half-open UTC overlap intervals.

**Block If:** A new privilege, changed permission matrix, broad identity disclosure, new cross-module contract, product behavior outside the approved sketch/UX annex or deployment/provider work becomes necessary. Escalate sensitive auth/RLS/transaction decisions to Sol High. Missing routine styling uses the owner-authorized existing-system/default decision below.

**Never:** Browse/cite legacy URLs, copy foreign application code, implement offline/PWA/queues, add money/dashboard widgets, introduce named-team entities, new notification producers or calendar-feed behavior, activate pending modules, merge/push/deploy, or treat this planning run as executed verification.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Own agenda | Current own assignment; shared, recurring, all-day, cross-midnight bookings | Planned intersecting bookings once, ordered by start then ID; correct local dates/time; only authorized minimal labels | Missing optional job/customer/address is explicit absent context, never invented |
| No data | Successful current connected read with no bookings | `inga bokningar ännu`; jobs has a distinct no-assigned-jobs state | A failed read is never empty |
| Failure/revocation | Initial failure or failed refresh, lost membership/capability | Clear displayed lists/actions, show `Anslutning krävs` + `Försök igen` for connection/read failure; generic denial for revoked access | Late prior request cannot restore older date/user/tenant data |
| Action | Booking with job and time entitlement | Correct same-job workspace; time filing with exact booking/job/date/time prefill | Jobless booking has no fake job link; existing report flow retains input and reconciles unknown outcomes |
| Notifications | Own unread `booking.changed` from existing recipient-scoped source | Prominent banner/chips with existing safe generic copy and supported route | Notification read failure is explicit; do not infer dates/booking IDs absent from source |

</intent-contract>

## Code Map

- `src/server/authz/phase-a-surface.ts:32` — `resolveLandingRoute` currently dashboard fallback; preserve non-Montör role behavior and server route authority.
- `src/app/page.tsx:25`, `src/components/app-shell/RouteAccessBoundary.tsx` — existing root redirect and direct-route denial boundaries.
- `src/scope/manifest.ts:263`, `src/components/app-shell/nav-items.ts:31` — active scheduling navigation enrollment; add Min dag using existing booking capability, no module flip or table enrollment.
- `src/server/read-models/scheduling.ts:73,120` — personal vs broad manager DTO; read-only precedent, not the new field payload. It lacks authorized labels/address and is unsuitable for client-side manager filtering.
- `src/features/scheduling/time-zone.ts`, `src/features/time-reports/domain.ts` — reuse date/instant parsing, Stockholm today/week and duration behavior.
- `src/server/read-models/my-jobs.ts:22`, `supabase/migrations/20261021102151_e16_job_read_tenant_and_source_quote_scope.sql:8` — checked personal relationship precedent; current job DTO lacks my-role and carries unnecessary source identity. Keep unchanged; use a dedicated minimal projection.
- `src/server/notifications/read-model.ts:8`, `src/server/notifications/registry.ts:6`, `supabase/migrations/20261020180000_conflict_resolver.sql:92` — recipient-scoped notices; existing producer emits generic copy and `/scheduling`, not precise today/tomorrow metadata. Filter category before paging/limiting the new personal read; do not mutate producer.
- `src/app/(app)/time-reports/page.tsx`, `src/components/time-reports/TimeReportEntry.tsx`, `src/features/time-reports/types.ts` — existing entry/prefill; page currently ignores search parameters, so compose TimeReportEntry inline, preserving exact interval/idempotent attempt recovery.
- `src/components/crm/Dialog.tsx`, `src/app/globals.css` — current presentation/focus/style primitives; canonical design is source authority, no unrelated shell/calendar restyle.
- `_bmad-output/auto-bmad/preparation/story-15-6/sensitive-assessment.md` — High assessment and precise trust-boundary rules; implementation must retain independent High review.

## Tasks & Acceptance

### Source acceptance sketch (verbatim)

AC sketch: `/my-day` route + Montör landing redirect activates (completing EB-A6); today header with week nav; time-ordered booking cards (job/kund + map-linked address, `Öppna jobbet`, `Rapportera tid`); banner-level schedule-change notices from `booking.changed`; pull-to-refresh; no money content; `Mina jobb` section renders when E16 activates (PB-D12 seam — the section contributes nothing before then); connected responsive behavior at the 360×640 floor; when data cannot be reached the page says `Anslutning krävs` and never substitutes an offline/stale job list; empty state "inga bokningar ännu" only after a successful connected read.

> **No Design Gate Criteria for this story.** `epics-phase-b.md` provides this AC sketch without separate Visual/Behaviour/Animation/Visual-validation criteria. This is intentional per the source; canonical design and the explicit verification requirements below still apply.

**Execution (Root-owned path allocation recorded; required runtime evidence remains pending):**

- [x] T1 — `src/features/my-day/types.ts`, `src/features/my-day/domain.ts` — define minimal DTO, date selection, sorting, safe map URL and latest-request state rules; no server imports. AC2/3/6/7.
- [x] T2 — `supabase/migrations/ (CLI-generated timestamp + story_15_6_my_day_projection.sql)` — add checked authenticated-only `read_my_day(p_tenant_id,p_start,p_end,p_include_jobs)` with explicit minimal JSON, bounded maximum eight-day UTC interval (covers a Stockholm week crossing DST), current active exact membership→unarchived own profile→assignment for all caller roles. Project related job/customer/facility labels only after relationship admission. Return no peers/money/source identity. Use `p_include_jobs boolean default false`, supplied only from server manifest state. FALSE is a separate branch with zero jobs-table/helper/join queries, activeJobs=[], no jobId/jobLabel/role/actions and only explicit booking customer/facility context. Suppress a job-linked report action if withholding jobId conflicts with the existing filing invariant. TRUE independently requires current job_can_read AND personal relationship for every job contribution. The flag grants no authority; authenticated direct RPC callers can request true, so it is server composition control, not proof of manifest status. Create via `supabase migration new story_15_6_my_day_projection` after CLI help discovery and capture its actual path; do not fabricate timestamp. Stable read-only checked SECURITY DEFINER projection for restricted related labels, empty search path, fully qualified names, authenticated-only ACL, no table/policy changes; any nested helper callable independently remains independently checked. AC1–4. High implementation/review required.
- [x] T3 — `src/server/read-models/my-day.ts`, `src/features/my-day/actions.ts` — derive current authority and manifest activation server-side; validate/translate selected date to bounded interval; validate exact RPC DTO and whitelist output; read own unread booking-change notices with category-before-pagination (bounded visible banners plus honest more-link if capped). Resolve existing own-time-report capability and construct exact filing prefill from checked own bookings using existing time-report duration/date helpers; keep tenant/user selectors server-only. Do not expose raw RPC rows or adopt broad scheduling/jobs DTO. AC1–7.
- [x] T4 — `src/app/(app)/my-day/layout.tsx`, `src/app/(app)/my-day/page.tsx`, `src/components/my-day/MyDayWorkspace.tsx`, `src/components/my-day/MyDayBookingCard.tsx` — add dynamic server entry and protected route; headless state/actions feed content-first single-column UI, today/date header, week arrows/swipe and day selection, named refresh control plus pull gesture, safe maps/job/time links, notices and isolated jobs section. Date/week navigation preserves selection and handles stale responses; failure removes old lists. Reuse `TimeReportEntry` inline with a server-constructed `TimeReportBookingPrefill` and current own-report capability rather than duplicating mutation logic; existing time-reports page does not consume URL prefill, so do not invent a query-string flow. AC2–7.
- [x] T5 — `src/scope/manifest.ts`, `src/components/app-shell/nav-items.ts`, `src/server/authz/phase-a-surface.ts` — enroll `Min dag` `/my-day` in active scheduling with `Bookings.View`; Pure Montör role set lands there when granted; mixed office/Montör role unions preserve their existing office priority, while non-Montör priorities and current per-job admission remain unchanged. Missing grant uses existing authorized fallback; no redirect loop. AC1.
- [ ] T6 — `tests/unit/features/my-day/domain.test.ts`, `tests/unit/server/read-models/my-day.test.ts`, `tests/unit/server/authz/phase-a-surface.test.ts`, `tests/integration/scheduling/my-day.int.test.ts`, `tests/e2e/my-day.e2e.spec.ts` — assert matrix, exact minimal DTO, full/paged own relationships, auth/tenant negatives, failure clearing, map/prefill and essential 360×640 journey. `package.json` — add `tests/e2e/my-day.e2e.spec.ts` solely to the existing explicit `test:smoke` script list so required essential-browser verification includes this flow; no dependency, lockfile, workflow or controller change. Existing manifest-derived guards should derive the new nav automatically; repair only demonstrated hard-coded fixture expectations. AC1–7.
- [ ] T7 — this spec, `_bmad-output/auto-bmad/delivery/15-6-min-dag-the-field-landing.json`, `_bmad-output/implementation-artifacts/deferred-work.md` — implementation author records actual revision/commands/counts, independent High review, one final Suggested Review Order with verified stops, contract reconciliation and named deferred release work. Supporting completion infrastructure, not a new product AC. Root owns status/delivery-gate transitions.

**Acceptance Criteria (executable elaboration of the preserved sketch/UX):**

- AC1 — Given current `Bookings.View` and active scheduling, when a pure Montör role set signs in, then server landing resolves `/my-day`, its nav and direct route work; given absent entitlement/inactive module/unauthenticated user, when opening it directly, then existing generic denial/login/fallback applies without new grants, and mixed-office and non-Montör landing priorities remain unchanged.
- AC2 — Given own planned bookings in the selected Stockholm day/week, when Min dag loads or navigates via week arrows/swipe/day controls, then today's initial header and selected local dates are correct and intersecting cards appear once in time order, including shared/recurring/all-day/DST/overnight cases; unrelated or cancelled bookings never appear, even for managers.
- AC3 — Given a card, when its authorized context is available, then it displays time, job/kund, description, own assignment context and a map-linked address; `Öppna jobbet` targets its actual job and `Rapportera tid` opens the existing authorized filing flow prefilled from that booking. Given absent job/address or no filing entitlement, when rendered, then no fake destination or unauthorized action exists.
- AC4 — Given E16/jobs is active, when the connected section loads, then `Mina jobb` shows only current own member/assignee jobs with active lifecycle (`created`/`in_progress`), name, kund, status and my operational designation/assignment; opening preserves job identity. Given jobs pending, when rendered/read, then the section contributes no UI/query/payload. Booking and job empties remain distinct.
- AC5 — Given own unread `booking.changed` notifications, when Min dag loads/refreshes, then schedule-change banners are prominent and use existing recipient-safe copy/routes and preferences; no other recipient's notice or invented booking/date association appears, and absence/failure never fabricates notices.
- AC6 — Given a loaded or initial agenda, when pull-to-refresh or keyboard-accessible `Uppdatera` runs, then fresh server facts replace lists only for the current selection; a connection/read failure clears old list/actions and says `Anslutning krävs` with explicit retry. Given a successful connected empty read, when displayed, then `inga bokningar ännu` appears; denied/failing reads never show this empty state.
- AC7 — Given the actual page at 360×640 and desktop, when navigating controls and entering existing time filing, then essential flows remain usable with visible focus, accessible names, no horizontal page overflow and server-confirmed filing only. The serialized page/action/SQL DTO contains no prices, rates, costs, margin or quote source identity for any role. No durable offline storage/service worker or stale/offline list substitution exists.

## Spec Change Log

No review re-derivation yet.

## Review Triage Log

### Review Findings

**Round 1 of 3**

Round 1 completed: eleven deduplicated patches applied; required hosted verification remains pending.

**Round 2 of 3**

Targeted independent High review PASS: R1-01–R1-11 resolved; all 23 source hashes verified; unchanged SQL retains Round 1 security provenance. Required runtime gates remain pending.

### 2026-10-25 — Review pass, Round 1
- intent_gap: 0
- bad_spec: 0
- patch: 11: (high 1, medium 6, low 4)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` R1-01: bind render/request lifetime to current server-derived identity; retain same-identity uncertain report ownership.
  - `[medium]` `[patch]` R1-02/03/05/06/08/10: validated technical date bounds, dated all-day cards, field touch targets, honest recipient-filtered notice paging, scoped gestures and actual workspace race assertions.
  - `[low]` `[patch]` R1-04/07/09/11: neutral absent-job copy, stable focus return, one main landmark and actual whole-week toggle assertions.
- Patched score: high 1, medium 6, low 4; weighted score 22; follow-up recommended true for this patch pass.
- Evidence: six configured independent lenses over frozen diff `9f0158d2e8bce52a5535cfc9d321eac84a4312541ea9fb122e4e8b0d02db8f67`; compact results in `preparation/story-15-6/review-round-1-results.json`. External Codex review artifact recovered read-only after the final Windows TYPE display failed on a forward-slash path; no model rerun.

### 2026-10-25 — Review pass, Round 2 (targeted fixes/regressions)
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none
- Verdict: independent Sol6.1 High PASS; R1-01–R1-11 resolved in source, full 63,991-byte fix delta `aa4b9a6ee778f7da711b576044cc18c3cd6b673b336940d0fb6f52c1c86d9ff2` and all 23 author source hashes verified. Current SRO accurately states evidence limits. No runtime execution by the reviewer.
- Patched score: high 0, medium 0, low 0; weighted score 0; follow-up recommended false for this latest pass. Two completed rounds (one broad, one targeted), cap three; `review_loop_iteration` remains zero because no bad-spec re-derivation occurred.
- Required canonical clean-checkout, full DB/RLS, direct recovery and essential production browser evidence remain pending. Source review PASS is not development completion.

## Design Notes

Owner-authorized defaults (October 15/23): use canonical neutral cards and tokens with current accessible primitives; no broad design-system migration. Arrow controls are the accessible equivalent of week swipes; a visible refresh button accompanies pull-to-refresh. Use a safe encoded map search URL opened only by an explicit user click, with address text and no automatic map/geocoding request. Show no map control for absent addresses. Missing job/customer labels use concise absence copy, never raw database identifiers. No decorative animation is required; honor reduced motion.

Booking assignee RLS deliberately withholds peers from Montör. Preserve that privacy boundary: show the current user's assignment context, not a broad staff identity list. My-role reflects current job designation/assignment, never a resource default work role or invented named-team model. Generic existing booking-change notices all qualify as prominent schedule changes; their producer lacks precise moved-today/tomorrow data, so never claim those dates. These defaults fulfill the sketch without expanding contracts.

Address projection uses explicit booking facility first, then the existing E16 job-location precedence (job override, then job facility); no customer billing-address substitution. Current own relationship is rechecked at every request. Do not retain stale data following failed/revoked reads. Dedicated minimal reads keep replaceable UI independent of broad scheduler DTOs.

## Verification

Planning baseline: `4cf343c8c73db83e11e4fc0a0e1feb8d51a4939f`; source inspection only. No build, database, browser, hosted or performance evidence executed here. Root owns Git/checkpoint/state changes. Supplied October policies supersede historical worktree oracle instructions. Required follow-up independent High spec validation remains Root-owned before build.

During implementation: run focused unit/integration tests for AC1–7; inspect actual serialized responses and direct authenticated RPC negatives (anonymous/service-role/foreign tenant, inactive/invited membership, archived/missing own profile, role union, removed assignment, manager own-only, related labels/address and jobs relationships). Test pagination completeness and invalid date ranges, DST/week boundaries, delayed responses, read failure after success, safe encoded map links and exact report prefill/unknown-result recovery. Confirm existing scheduling/recurrence/resolver/time/feed/jobs smoke behavior remains unchanged.

Before review/development complete: `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm build`; required full integration/RLS lane with `SUPABASE_TEST_REQUIRED=1 pnpm test:int` plus direct recovery-storage integrity checks per local/CI policy; focused `pnpm test:e2e tests/e2e/my-day.e2e.spec.ts` and `pnpm test:smoke` (whose explicit script list must include the new Min dag spec) through configured production server. Record actual executed/failed/skipped counts and revision; skipped is not passing. Resources require Root allocation and guard-managed startup; do not use demo backend. Independent High review for projection/auth with three-round cap; later external PR review uses a fresh Codex chat at exact head per October 21 policy.

Release work stays deferred with QA/UX owners and concrete next actions: full role/device/browser matrices, screenshot/design comparison, manual accessibility/daylight/exploratory and polish. E14 October 8 accepted-with-open-items governs: QA triages 48 advisories with resolution evidence; Product/Architect approve performance volumes/targets before claims. Contract D15.1 already integrated/qualified and reopens only on demonstrated regression. The upstream October 22 final Phase B checkpoint is pending, not executed; retain it after Root integrates origin/main. No release-ready, merge or deployment claim.

References: `AGENTS.md`; `_bmad-output/project-context.md`; `_bmad-output/planning-artifacts/epics-phase-b.md` Story15.6/EB-A6/EB-A7; `architecture-phase-b.md`; `ux-design-specification-phase-b.md` §4.8; current canonical DESIGN.md/EXPERIENCE.md; ADR-B009; `docs/process/local-setup.md`; completion/routing/review-order policies. Historical `epics.md`, `architecture.md`, generic UX and old `nextjs-app/docs/design/DESIGN.md` are superseded for this Phase B surface; do not copy missing legacy design paths. Two missing linked package docs do not invalidate canonical sources.

## Auto Run Result

Status: ready-for-dev
Halt after planning as requested. No implementation or review round executed; sprint/status/Git transitions remain Root-owned. Self-audit passed all seven checks; High sensitive assessment and focused amendment integrated. Independent Root-owned High spec validation and allocation precede build. Migration directory/logical stem fixed; CLI-generated concrete filename is intentionally deferred to Root's filename-generation-only step after fresh combined inventory and ownership clearance. No previously applied migration is edited. Completion-hook protocol applied: planning exit preserved, no completed Suggested Review Order or verification trail manufactured.


## Implementation Checkpoint — 2026-10-25

Source/local-ready only, on `118ebced2898b96f4b3dfce86f2dec8b52dd8f72` plus the author working tree. Actual source SHA256 inventory and commands are in `_bmad-output/auto-bmad/preparation/story-15-6/author-checks.json`; implementation choices and recovery details are in `author-implementation-notes.md` in the same folder. The planning Verification and Auto Run Result above are preserved as historical planning evidence.

Implemented T1–T5, activated all 59 new ATDD scenarios and added the smoke spec. Five demonstrated hard-coded nav fixtures were minimally extended only after Coordinator/Root exact-file clearance. No additional migration, table, role grant, dependency or privileged app client was introduced; the Root-generated forward migration is the only schema file authored. Runtime and independent review portions of T6/T7 remain incomplete.

Actual local evidence: focused domain/read/auth 40/40 pass (35 new, five retained), approved scope fixtures33/33 pass, final full Windows units3480 discovered/3479 passed/0 failed/1 skipped, typecheck pass, scoped lint0 errors/31 existing warnings, changed source/tests lint0 errors/0 warnings, production build pass with dynamic `/my-day`, source/bundle containment pass. Canonical local `pnpm lint` failed exit2 while traversing ignored historical runtime traces; bounded recovery excluded `.env*/**` without config/data changes. The single Windows unit skip is the historical Linux-xattr recovery test, not coverage. Clean-checkout canonical lint, full required DB/RLS, direct recovery-storage integrity and essential production-server browser/smoke are Root-owned pending gates. No service/runtime was launched and no Git/provider action was taken by the author.

The pending delivery JSON intentionally does not pass the completion gate: required hosted checks and independent High review are `pending`. No development-complete, release-ready, merge or deployment claim. Release work is recorded with QA/UX/Coordinator owners and concrete next actions in the delivery record and this story's appended deferred-work ledger entries; E14 advisory/performance and final PhaseB checkpoint obligations remain visible.


### Round1 patch checkpoint

R1-01..R1-11 are implemented; source and rationale are recorded in author-implementation-notes.md. The catalog now has63new active cases:15domain,20read,3auth,16SQL and9browser. Actual post-fix local evidence is43focused passes/0failures/0skips, typecheck, affected lint, production build, source/bundle containment and browser syntax passes. Previous full Windows3480/3479pass/one historical Linux-xattr skip is pre-fix broad evidence; exact-head full CI/DB-RLS/direct recovery/browser remains pending. No new SQL/table/policy/grant or shared notification change was needed. Subsequent independent context-free SolHigh Round2 follow-up passed on the63991-byte fix snapshot `aa4b9a6ee778f7da711b576044cc18c3cd6b673b336940d0fb6f52c1c86d9ff2`, with all23source bytehashes matched and unchanged SQL High review reused. Delivery now records independent review passed; required hosted checks remain pending and release_ready remains false.

## Suggested Review Order

Author: Story15.6 implementation/fix author, with the recorded ordinary UI and High test-binding delegates.
Refreshed after bounded R1-01..R1-11 fixes against baseline `118ebced2898b96f4b3dfce86f2dec8b52dd8f72` plus current author working tree; current byte hashes and historical pre-fix evidence are separate in author-checks.json.

### Begin with current identity and the usable field landing

The server-derived opaque digest controls presentation lifetime only; no command or read accepts it as authority. A resolved actor/tenant change resets lists and report ownership, while the same identity's unknown attempt survives ordinary date/read failure. Pure Montor keeps the approved landing preference and mixed office roles retain theirs.

- `src/app/(app)/my-day/page.tsx:7` — `MyDayPage`: initializes the connected landing.
- `src/components/my-day/MyDayWorkspace.tsx:20` — `MyDayWorkspace`: keys state to resolved server context.
- `src/server/read-models/my-day.ts:60` — `renderContextKey =`: derives non-granting lifetime metadata.
- `src/server/authz/phase-a-surface.ts:33` — `resolveLandingRoute`: preserves normalized landing priorities.

### Follow own-person authority and the closed payload

The SQL branch and job predicate choices from the original implementation remain unchanged: every role gets own assignments, jobs-off performs no job queries, and every job contribution requires both existing readability and personal relationship. The adapter validates and reconstructs the browser DTO; notice pagination stays recipient/unread/category-scoped before its range.

- `src/server/read-models/my-day.ts:52` — `readMyDay`: revalidates current authority and builds the DTO.
- `supabase/migrations/20261025085310_story_15_6_my_day_projection.sql:23` — `if not coalesce`: separates the jobs-off query.
- `supabase/migrations/20261025085310_story_15_6_my_day_projection.sql:56` — `left join public.jobs`: gates linked job contributions.
- `tests/unit/server/read-models/my-day.test.ts:95` — `15.6-UNIT-R03`: exercises AC3/7 manager-safe allowlists.

### Preserve selected facts and immutable report recovery

Complete four-digit Stockholm week destinations are validated before state changes; current-request gates clear/withhold old facts. The stable heading gives the shared Dialog a surviving focus destination, and the retained filing owner stays independent of fetched lists. RSC today data cannot overwrite a different current date/week.

- `src/components/my-day/MyDayWorkspace.tsx:69` — `async function refresh`: validates selection and guards response ownership.
- `src/components/my-day/MyDayWorkspace.tsx:129` — `ref={reportHost}`: retains the existing immutable filing owner.
- `tests/unit/features/my-day/domain.test.ts:142` — `15.6-UNIT-D11`: covers both technical date bounds.
- `tests/e2e/my-day.e2e.spec.ts:264` — `15.6-E03`: asserts actual queued-read gating and native gestures.

### Check the actual outer-surface assertions and evidence limits

E04 now checks real multi-date week then day-only output, dated all-day cards,44px targets and one main; E06 proves actual personal continuation past the shared center's cap. E09 binds real filing, changed-tenant RSC navigation and late prior-read rejection. These source assertions supplement the passed focused units; they still require Root's browser/DB execution.

- `tests/e2e/my-day.e2e.spec.ts:415` — `15.6-E04`: covers AC2/7 actual week/date/target composition.
- `tests/e2e/my-day.e2e.spec.ts:524` — `15.6-E06`: covers AC5 actual category-filtered continuation.
- `tests/e2e/my-day.e2e.spec.ts:626` — `15.6-E09`: covers AC6 actual context reset and old-response rejection.
- `tests/integration/scheduling/my-day.int.test.ts:191` — `15.6-INT-09`: retains AC4 zero-job scans with a positive control.

Evidence: author-checks.json records post-fix43focused passes, typecheck, affected lint, production build, containment and source parse, all native exits0. It retains pre-fix full Windows3479pass/one historical Linux-xattr skip separately. Limits: mocked unit transport is not RLS evidence;16SQL/9browser scenarios remain unexecuted here; Next16 serializes actions/REFRESH, so E03 uses real queued callbacks and E09 uses real NAVIGATE preemption rather than fabricated parallel transport. Independent context-free High Round2 follow-up passed and verified this trail; exact-head canonical lint/full DB-RLS/direct recovery/essential production browser remain pending. Exhaustive visual/manual matrices remain tracked release deferrals; no development-complete or release-ready claim.
