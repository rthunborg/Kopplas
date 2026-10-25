# Story 15.5 proposed implementation ownership

2026-10-20; baseline `159557e114f18123e73282c39c90830917de9948`, branch `codex/epic-15-scheduling-time-calendar`. Proposal only: no source/schema/test/resource admission. Root owns Git/checkpoints/state/sprint/aggregate ledger and independent validation. Before overlapping implementation, Coordinator allocates these exact deltas and mutable resources. No resource is launched or reserved here.

## New paths proposed

| Paths | Owned responsibility |
| --- | --- |
| `src/features/calendar-feed/types.ts`, `validation.ts`, `icalendar.ts`, `action-state.ts`, `actions.ts` | Narrow DTOs, raw-token format, independent RFC5545 encoder, lifecycle pending/uncertain/reconcile state and request-bound server actions; client-safe modules never import proof/key/DB. |
| `src/server/calendar-feed/policy.ts`, `attestation.ts`, `trusted-ip.ts`, `public-feed.ts` | Single rate/window policy, feed-only proof domains/key loading, canonical trusted IP, sanitized complete fetch/result mapping. |
| `src/server/db/supabase-public-client.ts` | New no-cookie/no-session anon-key client with persistence/refresh disabled; no privileged key. |
| `src/server/commands/calendar-feed/manage-calendar-feed.ts`, `calendar-feed-db.ts` | Ordinary authenticated envelope + exact checked lifecycle RPC adapter, SQL audit, no plaintext recovery/replay rotation. |
| `src/server/read-models/calendar-feed.ts` | Own status/attempt reconciliation, separately authorized Admin aggregate abuse DTO; no hashes/raw/IP leakage. |
| `src/app/(app)/(calendar-settings)/settings/calendar/page.tsx`, `layout.tsx` | Own protected settings route using the existing notifications-settings nested-layout pattern, bypassing generic CompanySettings.View only for this authenticated self route. |
| `src/components/calendar-feed/CalendarSubscription.tsx`, `CalendarFeedAbuseQueue.tsx` | Replaceable accessible own lifecycle/URL/warning/last-fetch UI and Admin-only sanitized queue. |
| `src/app/(public)/layout.tsx`, `src/app/(public)/calendar/feed/[token]/route.ts` | Minimal isolated group and GET streaming iCalendar; static root layout already has no auth. |
| `tests/unit/features/calendar-feed/icalendar.test.ts`, `action-state.test.ts`, `validation.test.ts`; `tests/unit/server/calendar-feed/attestation.test.ts`, `trusted-ip.test.ts`, `public-shell.test.ts` | Independent bytes/DST/injection/folding, headless unknown-outcome, proof parity/IP/cookie/session/transitive-shell guards. |
| `tests/integration/commands/calendar-feed.int.test.ts`, `tests/integration/rls/calendar-feed.rls.test.ts`, `tests/integration/calendar-feed/public-feed.int.test.ts`, `tests/integration/components/calendar-feed.test.ts` | Real lifecycle/RLS/ACL/audit/race/independent-limit/projection/monitoring and focused presentation evidence. |
| `tests/support/calendar-feed-atdd.ts`, `tests/e2e/support/calendar-feed-atdd.ts`, `tests/e2e/calendar-feed.e2e.spec.ts` | Isolated tenants/subjects/materialized bookings/proof key fixtures and actual HTTP+essential browser flow; secrets redacted. |
| `docs/security/calendar-feed-operations.md` | Narrow key/trusted-IP/abuse configuration and release-operations readiness, no global legal retention program or deployment enablement. |

## Migration proposal and database objects

New forward migration logical basename `personal_calendar_feed`, actual timestamp NOT RESERVED. Before creation obtain fresh combined E15/E16 chronology; currently E15 latest109=`20261020190000_time_reports.sql`,105–108 immutable; E16 reserved `20261020200000_e16_16_3_work_orders.sql`,16.4 new migration not reserved. New file must sort after the latest combined reserved/landed migration at actual creation. Use the project-authorized CLI migration-creation path after allocation, never edit existing history. A prospective path is `supabase/migrations/<Coordinator-reserved-timestamp>_personal_calendar_feed.sql`; this notation is a reservation condition, not an implementation placeholder.

New tenant table `calendar_feed_tokens` (membership-bound hash/revocation/usage/lifecycle metadata), global infrastructure table `calendar_feed_ip_windows` (canonical keyed IP hash/fixed window/count only, no tenant/subject/token FK); exact least-privilege owner, private filtered Vault helper, canonical proof verifier, checked lifecycle RPCs, narrow fetch RPC, current membership/Bookings.View/assignment authority, independent atomic limits, Admin aggregate reader and audit transactions. All direct token/counter DML denied; own status via narrow read RPC/column-safe RLS, no raw/hash in ordinary status DTOs. Global IP table gets explicit RLS/ACL/introspection assertions despite not matching tenant H4 heuristics. Use new feed-only32byte secret and key ID; no existing secret borrowed, no committed value, no host env or Vault mutation now. DB derives windows/clock/counters, not signed caller-selected window/limit.

Proposed exact RPC ownership (new names, not claimed existing contracts):

| RPC/helper | Input/authority/output contract |
| --- | --- |
| `public.manage_calendar_feed` | Authenticated-only create/rotate/revoke action, expected revision, attempt UUID, proposed new hash for issue actions and server proof. Derives exact current tenant/membership/actor; signed fields must match. Atomic generation+audit. Sanitized metadata only; raw URL assembled from server-held fresh token after confirmed first success. Enrolled command names `calendar_feed.create`, `calendar_feed.rotate`, `calendar_feed.revoke` reuse Bookings.View. |
| `public.read_calendar_feed_status` | Authenticated current self, optional own attempt UUID for reconciliation. Returns active/inactive, lifecycle revision/attempt outcome, created/revoked/last-used/usage; no raw URL/hash/IP/peer metadata. New server action checks this before retrying uncertain issue attempts, rather than signing a newly generated hash under the old attempt. |
| `public.fetch_personal_calendar_feed` | Exact anon execution only with valid feed-fetch proof, hash/IP-hash/key/time/request UUID. Derives token subject; DB chooses clock/window/limits and returns generic state/retry seconds or complete safe event array. No tenant/subject/date/filter override input; no broad table rights. All calls consume applicable counters; proof replay cannot change signed hash/IP and is counted again. |
| `public.read_calendar_feed_abuse` | Authenticated current Admin only, tenant derived from current context. Bounded/paged sanitized tenant aggregate/spike records; no raw URL/token/hash/IP or booking/person data. |
| Private feed payload/verifier and key helper | `calendar_feed_attestation_payload`, `calendar_feed_verify_attestation_internal`, `calendar_feed_secret_internal`: no JWT/PUBLIC execute; filtered key helper executable only by the dedicated feed owner, never general Vault access. Include exact signatures/effective privileges in the new migration ACL test. |

Runtime contract proposed for later allocation: server-only `CALENDAR_FEED_ATTESTATION_KEY_ID` and `CALENDAR_FEED_ATTESTATION_SECRET` (at least32 random bytes), Vault name `calendar_feed_attestation_<key-id>`. Isolated test key/name is unique to owned run and redacted. These names document future configuration only; no `.env`, CI/provider secret or hosted key edit occurs here.

## Shared paths requiring explicit semantic allocation

| Existing path | Exact delta and preservation |
| --- | --- |
| `src/scope/manifest.ts` | Add only `calendar_feed_tokens` and `calendar_feed` to active scheduling. IP window is global infrastructure explicitly tested, no fake tenant enrollment. No new primary nav/module/category/widget/file owner. |
| `src/server/commands/envelope.ts` | Register calendar-feed create/rotate/revoke on existing scheduling Bookings.View; no new role grants. Existing SQL-owned audit mode, generic errors, current auth gates preserved. |
| `src/components/app-shell/AppShell.tsx` | Profile link `Min kalender`→`/settings/calendar`; preserve notifications/signout/drawer/focus/navigation and do not expose URL/token in shell props. No generic settings nav/matrix change. |
| `middleware.ts` | Exact `/calendar/feed/<one-token-segment>` early pass-through before env/auth/client/cookie work; malformed token still reaches generic feed handler. Preserve session refresh for protected/other routes; do not blindly bypass all arbitrary `/calendar` prefixes. |
| `tests/integration/rls/tenant-table-inventory.ts` | Token own/foreign/anon spoof/filter/mutation/column safety + command-only mutation classification. Preserve E16/current report enrollments. |
| `tests/integration/rls/cross-tenant-isolation.rls.test.ts`, `migration-reset.int.test.ts` | Exact token-table policy/grants/functions/new owner checks; global-IP explicit ACL/no JWT access/empty search_path/private-helper tests, new manifest table in full replay. Preserve all assertions and currently landed history. |
| `tests/support/authz/role-harness.ts`, `tests/integration/rls/role-harness.atdd.int.test.ts` | Add own-only Bookings.View management positive/negative pairs including manager, mixed, inactive, revoked, platform-only; no granting matrix edits or E16 role fixture overwrites. |
| `tests/unit/scope/manifest-shape.test.ts`, `manifest-coherence.test.ts`, `manifest-derivations.test.ts`, `resources-activation.atdd.test.ts`, `booking-editor-scope.test.ts` | Exact closed-surface/table deltas and biting PhaseC/customer-portal negatives; retain other active/pending sets. |
| `tests/unit/server/authz/permission-matrix.test.ts` | Add exact command enrollment assertions where required; actual capability matrix unchanged. New headless public-shell.test.ts owns middleware behavior tests, no existing middleware test is assumed. |
| `scripts/verify/check-service-role-containment.mjs`, `tests/unit/scripts/verify/email-delivery-containment.atdd.test.ts` | Add feed-rooted transitive dependency reachability including cookie/session dependencies; do not make unrelated unsubscribe refactoring an implicit prerequisite; preserve existing email/service/bundle containment positives and biting negatives. No unrelated unsubscribe refactor. |

All new paths are proposals; actual existing-test anchors are reconciled in source-discovery.md. If implementation needs another shared path, return a bounded inventory successor before touching it. No scheduling/types, capacity, conflicts, booking-facts/editor/proof, safejobDTO or jobs-detail deltas are proposed. Read underlying booking/profile/job/customer/facility columns minimally; E16 current claims remain protected. Any E16 scalar/proof consumer discovered later requires exact actual-head coordination; no unreviewed absent-file imports or blanket16.4 wait.

## Mutable test/resource allocation

Root allocates an isolated guard-managed current-history Supabase/production web/browser lane or uniquely owned exact-head CI; no demo/project DB, foreign fixtures/users/ports or next dev. New helpers own unique tenantA/B, Admin/PL/Montör/Säljare/Ekonomi/mixed/inactive memberships, profiles, own/shared/peer/cross-tenant bookings, recurring exceptions/cancelled/split IDs, token hashes and one test-only attestation key+Vault names. Never log raw URLs/proofs/IP/key. Cleanup only owned fixture rows/keys after tests; lifecycle teardown uses guard Stop and preserves containers/volumes/profiles.

Public HTTP tests must hit the real configured route using anon/no cookies plus malicious cookies/headers/query input; actual browser management proves warning/create/fetch/last-used/rotate/revoke and essential phone/keyboard/error flow. Unit dependency injection is not real database/public HTTP evidence. Required full integration uses `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts; direct physical recovery Storage check remains required existing lane despite no feed file uploads.

Concurrency/fault cases need isolated SQL barriers and serial database scope: lifecycle/fetch commit boundary, role/membership/assignment changes, concurrent counters, failed audit/rotation and counter persistence. Existing four serial DDL files do not allocate this story's files. Fresh Coordinator must assign new fault/DDL test files and their serialization before execution; do not edit global fault triggers shared across tenants.

## Operations and terminal contract

Release operator owns future dedicated key/Vault/runtime provisioning and deployment-verified IP trust, with redacted evidence and exact resume condition before hosted feed use. Local ephemeral test setup is part of separately admitted verification. No credentials need user input for planning. Root first obtains distinct High spec validation/kernel freeze, then admits ATDD/build; author preserves this candidate until that decision. Independent implementation review remains High/capped3, actual delivery JSON+Root gate+distinct truth review required before done. Exhaustive matrices/screenshots/manual accessibility/daylight/calendar-app interoperability/performance/polish remain owned deferred release work, never passed. Inherited epic review_unverifiedTRUE stays unchanged; no merge/deploy/Preview/provider/secrets/publication authorization.
