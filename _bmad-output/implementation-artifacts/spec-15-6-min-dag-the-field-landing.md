---
title: '15.6 Min Dag — the Field Landing'
type: 'feature'
created: '2026-10-25'
status: 'ready-for-dev'
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

**Execution (all unchecked; proposed paths require Root allocation before build):**

- [ ] T1 — `src/features/my-day/types.ts`, `src/features/my-day/domain.ts` — define minimal DTO, date selection, sorting, safe map URL and latest-request state rules; no server imports. AC2/3/6/7.
- [ ] T2 — `supabase/migrations/ (CLI-generated timestamp + story_15_6_my_day_projection.sql)` — add checked authenticated-only `read_my_day(p_tenant_id,p_start,p_end,p_include_jobs)` with explicit minimal JSON, bounded maximum eight-day UTC interval (covers a Stockholm week crossing DST), current active exact membership→unarchived own profile→assignment for all caller roles. Project related job/customer/facility labels only after relationship admission. Return no peers/money/source identity. Use `p_include_jobs boolean default false`, supplied only from server manifest state. FALSE is a separate branch with zero jobs-table/helper/join queries, activeJobs=[], no jobId/jobLabel/role/actions and only explicit booking customer/facility context. Suppress a job-linked report action if withholding jobId conflicts with the existing filing invariant. TRUE independently requires current job_can_read AND personal relationship for every job contribution. The flag grants no authority; authenticated direct RPC callers can request true, so it is server composition control, not proof of manifest status. Create via `supabase migration new story_15_6_my_day_projection` after CLI help discovery and capture its actual path; do not fabricate timestamp. Stable read-only checked SECURITY DEFINER projection for restricted related labels, empty search path, fully qualified names, authenticated-only ACL, no table/policy changes; any nested helper callable independently remains independently checked. AC1–4. High implementation/review required.
- [ ] T3 — `src/server/read-models/my-day.ts`, `src/features/my-day/actions.ts` — derive current authority and manifest activation server-side; validate/translate selected date to bounded interval; validate exact RPC DTO and whitelist output; read own unread booking-change notices with category-before-pagination (bounded visible banners plus honest more-link if capped). Resolve existing own-time-report capability and construct exact filing prefill from checked own bookings using existing time-report duration/date helpers; keep tenant/user selectors server-only. Do not expose raw RPC rows or adopt broad scheduling/jobs DTO. AC1–7.
- [ ] T4 — `src/app/(app)/my-day/layout.tsx`, `src/app/(app)/my-day/page.tsx`, `src/components/my-day/MyDayWorkspace.tsx`, `src/components/my-day/MyDayBookingCard.tsx` — add dynamic server entry and protected route; headless state/actions feed content-first single-column UI, today/date header, week arrows/swipe and day selection, named refresh control plus pull gesture, safe maps/job/time links, notices and isolated jobs section. Date/week navigation preserves selection and handles stale responses; failure removes old lists. Reuse `TimeReportEntry` inline with a server-constructed `TimeReportBookingPrefill` and current own-report capability rather than duplicating mutation logic; existing time-reports page does not consume URL prefill, so do not invent a query-string flow. AC2–7.
- [ ] T5 — `src/scope/manifest.ts`, `src/components/app-shell/nav-items.ts`, `src/server/authz/phase-a-surface.ts` — enroll `Min dag` `/my-day` in active scheduling with `Bookings.View`; Pure Montör role set lands there when granted; mixed office/Montör role unions preserve their existing office priority, while non-Montör priorities and current per-job admission remain unchanged. Missing grant uses existing authorized fallback; no redirect loop. AC1.
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

No code review round consumed during planning.

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
