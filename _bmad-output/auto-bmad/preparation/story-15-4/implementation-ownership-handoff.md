# Story 15.4 proposed implementation ownership

2026-10-20; source baseline `5040f683cf9446d39de8512cdca82242c55fca3e`, branch `codex/epic-15-scheduling-time-calendar`. **Proposal only, no implementation/shared-write/migration/resource allocation.** Root first obtains distinct independent Sol High spec validation/freeze, then Coordinator allocates the exact semantics below. Paths are repository-relative to the owned checkout. The fresh Coordinator snapshot is `.env.epic15.mail-runtime/story-15-4-preparation/root-coordinator-snapshot-20261020.json`, reported SHA256 `7e1e05d64ff28638b2b606a78ba293922e65ab9f359e00f86049f6929c78a4b8`; preparation permission does not reserve any listed implementation path.

## New paths proposed for the story owner

| Paths | Responsibility / authority |
| --- | --- |
| `src/features/time-reports/types.ts`, `validation.ts`, `domain.ts`, `action-state.ts`, `actions.ts` | Client-safe types, exact-minute/date/attempt validation, pure week/delta/missing-day aggregation and headless retry actions; server actions remain request-bound. |
| `src/server/commands/time-reports/file-time-report.ts`, `annotate-time-report.ts`, `time-report-db.ts` | Envelope adapters, safe result mapping, checked SQL authority. |
| `src/server/read-models/time-reports.ts` | Thin cookie/RLS own/review queries, safe booking/job selectors, complete paged totals and field-absence descriptor. |
| `src/server/notifications/time-report-nudge-producer.ts` | Existing-runner adapter to bounded service-only RPC; no raw booking reads, arbitrary notification content or email. |
| `src/app/(app)/time-reports/layout.tsx`, `page.tsx` | Protected dynamic Tidrapporter surface and own/review modes. |
| `src/components/time-reports/TimeReportEntry.tsx`, `TimeReportForm.tsx`, `TimeReportWorkspace.tsx`, `PersonalTimesheet.tsx`, `TimeReportReview.tsx` | Replaceable one-hand filing, weekly report list, filters/totals and annotation sheet. |
| `tests/unit/features/time-reports/domain.test.ts`, `validation.test.ts`, `action-state.test.ts` | Independent date/DST/minutes/delta/nudge and retry-state oracles. |
| `tests/integration/commands/time-reports.int.test.ts`, `tests/integration/rls/time-reports.rls.test.ts`, `tests/integration/read-models/time-reports.int.test.ts`, `tests/integration/notifications/time-report-nudge-producer.int.test.ts`, `tests/integration/components/time-reports.test.ts` | Actual command/RLS/read/producer integrity and focused rendered UI states. |
| `tests/support/time-reports-atdd.ts`, `tests/e2e/support/time-reports-atdd.ts`, `tests/e2e/time-reports.e2e.spec.ts` | Isolated owned role/tenant/report fixtures, essential actual browser filing/retry/review. |

New forward migration: logical basename **`time_reports`** under `supabase/migrations/`; Coordinator must reserve a unique actual timestamp **strictly after `20261020180000`**, recheck latest inventory immediately before CLI creation, and record the exact filename. None is reserved now. One new table `time_reports` with private request/replay fields and bounded reviewer metadata; no second ledger/comment/event table required. SQL supplies checked authenticated filing/annotation, safe own/reviewer SELECT RLS and column ACLs, core-field immutability, same-tenant FKs, atomic audit/replay, nonmonetary booked-duration snapshot, service-only bounded nudge RPC and category-check widening. The nudge RPC is supporting infrastructure for the explicit producer AC. All historical migrations—including105/106/107/108—remain immutable.

## Exact shared semantic deltas requiring Coordinator allocation

| Existing paths | Allowed delta; preserve |
| --- | --- |
| `src/scope/manifest.ts` | scheduling gains only `time_reports`, `/time-reports` nav, `time_report.nudge`; existing active status/Planering/booking_series/resolver/category retained; no calendar-feed/MyDay surface. |
| `src/server/authz/permission-matrix.ts` | Only scheduling TimeReports.ReportOwn(Admin/PL/Montör) and TimeReports.Review(Admin/PL); preserve all existing operation roles/job scopes. |
| `src/server/commands/envelope.ts` | Register only filing/annotation capability mappings; SQL owns their audit so no duplicate outer audit. No generic gate semantics change. Existing stable COMMAND_CONFLICT covers stale/mismatched attempts; no shared error-union change proposed. |
| `src/components/app-shell/nav-items.ts` | Add Tidrapporter `/time-reports`, inline icon; existing nav ownership/order remains coherent with manifest. |
| `src/components/scheduling/BookingBlock.tsx`, `src/components/resources/BookingEntry.tsx` | Add accessible own-booking reporting entry; no booking edit/drag/resolver/series logic change, no peer on-behalf filing. |
| `src/app/(app)/customers/[customerId]/page.tsx`, `src/app/(app)/jobs/[jobId]/page.tsx`, `src/app/(app)/jobs/page.tsx` | Pass minimal current-user report capability/own-profile descriptor from the new time-reports read model to BookingEntry; no job/customer read, member/date/lead, editor, completion or tab semantics change. E16-adjacent ownership must be allocated explicitly. |
| `src/server/notifications/registry.ts`, `src/server/jobs/producers.ts`, `src/app/api/jobs/run/route.ts` | Register in_app-only nonessential nudge category, hourly producer and bounded dispatch; preserve booking.changed, quote categories, runner authentication/claims/audit, mail release controls and service containment. |
| `tests/integration/rls/tenant-table-inventory.ts` | Exhaustive time_reports public projection + spoof/filter/mutation/anon metadata and command-only mutation-denial classification; keep all existing E16/ledger cases. |
| `tests/support/authz/role-harness.ts`, `tests/integration/rls/role-harness.atdd.int.test.ts` | Own/reviewer time projection and all role/mixed-role positive/negative assertions; preserve existing E16 and scoped helper cases. |
| `tests/integration/rls/cross-tenant-isolation.rls.test.ts`, `tests/integration/rls/migration-reset.int.test.ts` | Seed one report via owned checked fixture; exact table-policy/column/RPC ACL enrollment, no grant widening or relaxed enumeration. Preserve existing24 E16 assertions and actual combined inventory when later joined. |
| `tests/unit/scope/resources-activation.atdd.test.ts`, `tests/unit/scope/manifest-coherence.test.ts`, `tests/unit/scope/booking-editor-scope.test.ts`, `tests/unit/scope/manifest-shape.test.ts`, `tests/unit/scope/manifest-derivations.test.ts` | Update exact derived scheduling route/table/category sets only; existing detector/file/job boundaries retain biting negatives. |
| `tests/unit/server/authz/permission-matrix.test.ts`, `tests/unit/server/jobs/producer-registry.test.ts`, `tests/unit/server/notifications/registry.test.ts` | Pin new operation roles/category/channel/producer declarations without weakening current exact assertions. |
| `tests/e2e/jobs/job-list-deferred-surface.e2e.spec.ts` | Scope whole-body tidrapport absence to job-list content so sanctioned shell nav is allowed; retain explicit job-timesheet absence and other deferred job content. |

Use existing scheduling read-data ownSelfPersonIds for action visibility where available. The three allocated caller-page deltas above supply BookingEntry's minimal own-action descriptor from the new request-bound report read model; authoritative reference selection remains inside the new read model/SQL. If another caller prop/shared path is actually required, request a bounded inventory successor before editing it. Do not broaden shared scheduling DTO/read semantics or raw service-role table ACLs as a shortcut.

## Mutable resources and fixture ownership before build

- Root remains sole lifecycle/Git/CI manager. No resources started, borrowed or reserved by preparation. Future actual migration replay/full REQUIRED DB/RLS/direct Storage and essential production Playwright need Root-allocated guard-managed isolated stack, browser/test runtime and exact-head CI admission; do not use demo/hosted databases or next dev.
- New test helpers own unique per-run tenant A/B, Admin/PL/Montör/seller/economy/mixed/inactive identities, profile/assignment/job/report/annotation/notification rows and attempt UUIDs. Never mutate shared smoke users/roles/tenant dates. Reuse tenant core/bookings factories; do not edit those factories unless Coordinator grants a successor.
- Rollback/fault tests need a dedicated serialized fixture/database scope; temporary trigger/fault injection DDL must not race other suites. Cleanup touches only owned fixture data, never lifecycle resources/volumes/profiles or user apps. Required direct physical Storage evidence runs under the existing Root-owned lane despite no report files being added.
- Nudge tests need frozen injected as-of/window and genuine service-only invocation, current DB-relative clocks/barriers for membership/preference/report races, cursor pages beyond25 recipients, tenant iteration and retry/concurrency dedupe. Interactive filing/read/annotation tests use ordinary authenticated clients, never service-role app adapters.
- Existing parallel E16 shared claims remain protected. No importing absent16.2/16.3 files; current16.1 is sufficient. Later integration must union actual membership/lead/date/jobscope/roles/smoke resolver fixtures and exact migrations without suppressing either branch's tests.

## Risk, contracts and gates

Sol High: RLS/roles/own-vs-review authority, same-tenant references, current membership/replay, atomic audit, core report immutability and service-only producer. Ordinary replaceable UI/docs/unit plumbing may route Sol Low, but mixed implementation/review must retain High for these boundaries; every nested dispatch records its route first. Headless structure and design choices are in current-contracts-and-design.md. No money/rates/approval/public tokens/provider/deployment changes are proposed.

Preserve v3 facts/proof domains/exact13 claims, tenant lock order, current108 resolver refresh/ledger/in_app booking.changed, series exception/tombstone/stable-ID behavior and all source/public/privacy controls. Filing does not mutate booking/conflict/job/quote state. Root retains inherited epic review_unverifiedTRUE until its own gate permits a change.

Future implementation author supplies actual full DB/RLS + direct physical Storage + essential browser evidence, independent High review within the3-round cap, author-written Suggested Review Order and delivery JSON. Full release matrices/screenshots/manual daylight/accessibility/exploration/≤30s timing and representative performance remain separately owned deferred release work. Zero runtime evidence is claimed by this proposal.
