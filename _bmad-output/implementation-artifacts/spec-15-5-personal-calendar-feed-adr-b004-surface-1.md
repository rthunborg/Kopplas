---
title: '15.5 — Personal Calendar Feed (ADR-B004 Surface #1)'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
review_loop_iteration: 3
followup_review_recommended: false
baseline_revision: '3a1c3bc9fbf22b13c926179288a8b6eefe440c12'
approved_kernel: '0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977'
approval_record: '_bmad-output/auto-bmad/preparation/story-15-5/approval.json'
context:
  - docs/process/review-order.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - docs/process/local-setup.md
  - _bmad-output/test-artifacts/test-design-epic-15.md
  - _bmad-output/auto-bmad/preparation/story-15-5/current-contracts-and-design.md
  - _bmad-output/auto-bmad/preparation/story-15-5/implementation-ownership-handoff.md
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Users cannot subscribe to their own current bookings from an external calendar or safely manage that read capability. Public disclosure must remain limited to the exact subject and survive immediate rotation/revocation and abuse controls.

**Approach:** Add authenticated self-service Kalenderprenumeration and one isolated live iCalendar GET capability, backed by hashed random tokens, atomic audited lifecycle, a dedicated minimal own-booking projection and independent database token/IP limits with sanitized Admin monitoring. Keep validation, lifecycle state/actions and serialization separate from replaceable UI.

## Boundaries & Constraints

**Always:** FR91/NFR46/AC-B1b-7 and accepted inline ADR-B004 govern. Generate 32 CSPRNG bytes server-side as base64url; persist only SHA-256, bind to exact tenant/current membership and keep at most one active generation. Management uses current authenticated Bookings.View self authority, checked SQL, expected revision/attempt and atomic audit; no manager/peer elevation. Fetch derives tenant/subject solely from the token, requires the tenant row to exist, the exact token-bound/current self membership status to be active and its current Bookings.View role union to allow access, plus unarchived own profile/assignment, returns each current materialized planned own booking once and only minimal times/title/job/customer label/location. No profile means an empty valid calendar, no team fallback. Rotate/revoke serialize with fetch authority; no post-revocation new request succeeds. Lost issued responses reconcile metadata then require explicit new rotation because plaintext is unrecoverable. Enforce independently atomic per-token and cross-token per-IP-hash 900-second budgets 60/120, uniform invalid-token responses,429/Retry-After, no shared cache or auth shell/session dependency. Dedicated server-only feed proof binds canonical trusted IP/hash and lifecycle inputs to prevent direct-RPC spoof/weak chosen-hash bypass; no service role. All new tenant objects/public surface enroll coherently in manifest/H4/ACL tests. Connected settings works by keyboard and 360×640; success follows confirmed persistence only. Full ADR-B004 abuse suite is required before ship.

**Block If:** Root has not independently validated/frozen this candidate and admitted ATDD/build; Coordinator has not allocated the exact shared deltas, fresh combined migration chronology/reservation and isolated mutable fixtures/resources; or actual implementation exposes a material authorization/data-integrity/product ambiguity outside these approved/default decisions. Hosted feed enablement additionally requires release operator's separately authorized dedicated key/Vault/runtime and trusted-IP evidence. These are later execution/release prerequisites, not missing planning intent. After two failed attempts choose a simpler safe authorized route or retain named owner/evidence/next action/resume condition.

**Never:** Store/recover/log/audit/cache raw URL/token/proof/key/IP; use UUID/identity-derived tokens; trust tenant/subject overrides, arbitrary forwarded IPs, unsigned direct RPC arguments or manager-wide scheduling reads. No cookie/session/tenant-context/nav dependency in public feed path, no broad anon table grants, service role, arbitrary projection, privileged mutation or fourth public surface. No money, co-assignee/peer details, contacts/notes, tenant enumeration, portal/customer login/signing, AI/optimization, offline/PWA/queue/sync, new job/economy/payroll/email/provider surface or general legal/retention program. Preserve15.1–15.4 booking/series/resolver/time-report invariants and E16 actual claims; no absent unreviewed imports or permanent v3 assumption. This planning run edits only this spec/new15.5 preparation: no app/schema/tests/scaffolds/dependencies/env/runtime/CI/foreign checkout/state/sprint/Git commit/push/PR/merge/deploy/secrets changes or legacy URL/browsing/evidence.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Own issuance | Active authorized subject creates or rotates with current revision/attempt | Fresh 43-character 32-byte capability URL once; hash-only generation and audit commit together; rotate revokes old | Invalid/stale/foreign/inactive action generic denial; audit failure rolls back all |
| Unknown issued result | Commit response lost, retry or concurrent create/rotate/revoke | Sanitized attempt/revision reconciliation; no duplicate mutation/audit or plaintext recovery; explicit separate rotation recovers a lost link | UI pending/uncertain state and explicit retry; never claim success without confirmation |
| Live valid feed | Own/shared/recurring/edited/moved/all-day/DST booking data | Complete minimal own planned events; stable booking UID; current exceptions; cancelled/reassigned/archived-profile rows omitted | Current role/membership/token invalidation gives generic inactive; database failure503, never partial/empty success |
| Abuse and forgery | Invalid token classes, multiple tokens/IPs, concurrent requests, forged proof/IP/hash | Independent database windows/counters; common invalid404; shared-IP429 or active-token429 with Retry-After; sanitized Admin spike summary | Missing/expired/wrong-domain proof denied, no broad lookup; missing IP uses shared unknown bucket |
| Public isolation | No cookies, hostile cookies/headers/query tenant overrides, cache validators | Only capability controls own projection; no auth refresh, shell, session, cache reuse, redirects or cookies | No secret/tenant/subject oracle; invalid classes have identical response contract under equal IP history |

</intent-contract>

## Source Acceptance and Provenance

AC sketch: `calendar_feed_tokens` hashed 256-bit tokens; user-self-serve `Kalenderprenumeration` (create/rotate/revoke, audited, plain-language access warning, "senast hämtad" from `last_used_at`); `GET` feed route in `(public)` streaming iCalendar regenerated per request — own bookings only, minimal fields, never money, never other people's data; revoked/unknown tokens → identical generic response; per-token + per-IP-hash rate limits; the full ADR-B004 abuse suite (validity, revocation, rotation, uniformity, rate-limit trip, cross-tenant probe, shell isolation) green before ship (AC-B1b-7, NFR46).

**No Design Gate Criteria for this story.** Story15.5 in epics-phase-b.md provides the single verbatim sketch above without four Visual/Behaviour/Animation/Visual-validation criteria. Binding PhaseB UX user-menu/4.5/14.10/14.11/accessibility rules apply. The October19 completion policy defers exhaustive visual/manual/release validation, not actual lifecycle, disclosure, rate-limit or essential-flow correctness.

References: AGENTS.md; _bmad-output/project-context.md; valid byte-unchanged epic-15-context.md; epics-phase-b.md Story15.5; prd-phase-b.md FR91/NFR46/AC-B1b-7; architecture-phase-b.md §§3/4/6.1–6.6/9/16; ux-design-specification-phase-b.md; Epic15 TEA15.5 INT001/002, API001–005, SCOPE001/E2E001; both preparation companions and source-discovery.md. ADR-B004 is accepted inline architecture §6; no separate file. Installed historical PhaseA references are superseded by current PhaseB sources. No nextjs-app/docs/design/DESIGN.md/Figma is supplied: actual globals.css/Dialog/settings patterns plus October15 owner-authorized maintainable design defaults apply, with no new legacy claim.

Continuity:15.1–15.4 internally landed;15.4 approved kernel `3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb` and CI run39415418173 atcad4d37facf8cbf5d9c0c3701117d5b4f21d4de1 prove predecessor work only. Preserve15.2 exceptions/tombstones/stable IDs,15.3 resolver/current-authority and15.4 integer filed minutes/fractional booked snapshot/idempotency/preference gate. Existing unsubscribe is implemented already; “Surface#1” is the approved story title, not a claim that repository history has no other public implementation. Epic14 October8 acceptance/open QA48/performance/manual obligations stay visible;15.1 actual ContractD completion stays credited. Root retains inherited epic review_unverifiedTRUE and one-final-epic-PR/draft caveat. Fresh Coordinator receipt SHA256 `31be4d099a23e68bb769b578b6b0c3f82779dbd5c43681d4c335db9aedf87186` governs current E16 claims; no 15.5 migration/test/resource allocation exists.

## Code Map

- `src/scope/manifest.ts:263` — active scheduling; add token table/calendar_feed only, no activation flip or future MyDay.
- `src/server/auth/resolve-tenant-context.ts:56,76`, `src/server/authz/permission-matrix.ts:17,39`, `src/server/commands/envelope.ts:51,199,219` — current authenticated role union/tenant context and checked command mapping; tenant context does not expose membership ID, derive exact active membership inside SQL.
- `supabase/migrations/20260929120000_resource_person_profiles_and_work_hours.sql:4`, `supabase/migrations/20261020190000_time_reports.sql:156` — membership→unarchived own profile→assignment planned-only precedent. Existing time-report own helper is authenticated/eight-day-bounded, not a public feed implementation.
- `src/server/read-models/scheduling.ts:73,120`, `src/features/scheduling/view-model.ts:48`, `src/components/scheduling/SchedulingWorkspace.tsx:150` — authenticated wide manager DTO/client personal filtering; read-only evidence, do not import for feed.
- `supabase/migrations/20261006104143_booking_invariant_corrections.sql:13` — own helper has Montör-only/archive limitations; new exact subject selector cannot delegate to this helper as authority.
- `src/server/db/supabase-server-client.ts`, `middleware.ts:43`, `src/app/layout.tsx` — cookie client and global refresh must be excluded from exact feed route; root layout itself is generic.
- `src/app/(public)/unsubscribe/[token]/route.ts`, `src/server/email/unsubscribe.ts`, `supabase/migrations/20260924120000_email_delivery_followup_fixes.sql:49` — existing paired-IP limiter/cookie client is not the feed design; preserve unsubscribe behavior.
- `src/server/bookings/conflict-attestation.ts`, `src/server/storage/document-signed-access-attestation.ts`; `supabase/migrations/20260919120000_provisioning_decision_8a_authority.sql:5,69,80`, `20260919121000_provisioning_vault_reader_owner.sql` — reuse canonical proof/narrow filtered-key-owner patterns, never domains/keys/E16 version contracts.
- `src/components/scheduling/PersonalCalendarView.tsx:4`, `src/components/scheduling/SchedulingWorkspace.tsx:175` — actual personal agenda/week/empty-state host; add only a subscription link in PersonalCalendarView, no workspace/model/editor change.
- `src/components/app-shell/AppShell.tsx:278`, `src/app/(app)/(notification-settings)/settings/notifications/page.tsx`, `src/components/crm/Dialog.tsx`, `src/app/globals.css` — small profile entry, self-settings placement, existing focus/controls/styles; no primary nav addition.
- `scripts/verify/check-service-role-containment.mjs:250`, `tests/unit/scripts/verify/email-delivery-containment.atdd.test.ts:17` — current lexical public-route scan misses transitive cookie dependencies; extend actual dependency reachability and middleware proof.
- `tests/integration/rls/tenant-table-inventory.ts:125,199`, `rls-inventory-gate.int.test.ts`, `approved-public-acl-repair.int.test.ts`; `tests/support/time-reports-atdd.ts` — full manifest-derived table metadata/effective inherited ACL and isolated fixture patterns; global IP table needs explicit coverage outside tenant heuristics.

## Files Created / Files Modified

Exact new source/test/doc paths and existing shared semantics are enumerated in implementation-ownership-handoff.md. New feature/server/commands/read/UI/settings/public modules, dedicated token/global-IP schema migration and focused unit/DB/HTTP/browser fixtures are intended. Existing shared changes are limited to manifest, command mapping, profile menu, minimal PersonalCalendarView subscription link, exact middleware bypass, strengthened public reachability scanner and specified scope/RLS/role/containment enumerations. No permission-matrix grant, dependency/lockfile/tool/config-generated component file, primary nav item, jobs/editor/proof/capacity contract, notification/runner change or `.env` file is proposed. Root later assigns ephemeral test key/Vault/runtime config; release operator owns hosted provisioning. Migration logical basename `personal_calendar_feed`; timestamp is deliberately unreserved until fresh combined chronology, then CLI-created after latest E15/E16 reservation. Historical105–109 migrations remain immutable.

## Tasks & Acceptance

**Execution (dependency order; no ATDD/build before Root independent validation/admission):**

- [ ] T1 — `src/features/calendar-feed/types.ts`, `validation.ts`, `icalendar.ts`, `action-state.ts`, `src/server/calendar-feed/policy.ts`: define minimal event/lifecycle/attempt DTOs, fixed policy, canonical token validation, independent RFC5545 encoder and uncertain-response state. Supports AC1–9/I/O matrix.
- [ ] T2 — new Coordinator-allocated `supabase/migrations/` logical `personal_calendar_feed`: create hash-only membership-bound token/global-IP windows, exact ACL/RLS/owner/private verifier, lifecycle/CAS/audit, subject-only fetch/complete projection, independent atomic counters and safe monitoring. Enroll calendar_feed_tokens/calendar_feed in `src/scope/manifest.ts`. Supporting infrastructure for AC1–9; timestamp only after fresh combined reservation.
- [ ] T3 — `src/server/calendar-feed/attestation.ts`, `trusted-ip.ts`, `src/server/db/supabase-public-client.ts` and `src/server/commands/calendar-feed/manage-calendar-feed.ts`, `calendar-feed-db.ts`, existing `src/server/commands/envelope.ts`: implement dedicated proof domains/canonical bytes/current-self lifecycle, anon cookie-free client, exact JWT RPC invocation and SQL-owned audit; no fallback or borrowed keys. Supports AC1/2/4–9.
- [ ] T4 — `src/server/calendar-feed/public-feed.ts`, `src/app/(public)/layout.tsx`, `src/app/(public)/calendar/feed/[token]/route.ts`, `middleware.ts`: exact public bypass and dynamic no-store GET streaming complete live own calendar; sanitized generic404/429/503, no session/shell/proof/token leakage. Supports AC3–9.
- [ ] T5 — `src/server/read-models/calendar-feed.ts`, `src/features/calendar-feed/actions.ts`, `src/components/calendar-feed/CalendarSubscription.tsx`, `CalendarFeedAbuseQueue.tsx`, settings page/layout paths in handoff, `src/components/app-shell/AppShell.tsx` and `src/components/scheduling/PersonalCalendarView.tsx`: add a keyboard-reachable Kalenderprenumeration link from the actual Min kalender agenda/week/empty state to the single settings surface, retain the profile-menu entry, and deliver own status/attempt reconciliation, warning/one-time URL/copy/rotate/revoke/last-fetch and separate Admin aggregate queue with accessible connected 360×640 failure/retry states. Supports AC1/2/6/8/9.
- [ ] T6 — `tests/unit/features/calendar-feed/icalendar.test.ts`, `validation.test.ts`, `action-state.test.ts`, `tests/unit/server/calendar-feed/attestation.test.ts`, `trusted-ip.test.ts`, `public-shell.test.ts`: independent canonical bytes/32-byte entropy/hash, DST/all-day/UID/escaping/UTF8-folding and lifecycle/proof/IP/independent-boundary/uncertainty vectors; no production-output-as-oracle. Supports AC1–9/I/O matrix.
- [ ] T7 — `tests/integration/commands/calendar-feed.int.test.ts`, `tests/integration/rls/calendar-feed.rls.test.ts`, `tests/integration/calendar-feed/public-feed.int.test.ts`, `tests/support/calendar-feed-atdd.ts`: actual current-role/self/foreign/mixed/direct-RPC/forgery positives+negatives, including legacy NULL provisioning_state with active eligible membership positive and disabled/invited membership or Bookings.View role-loss negatives, audit/rotation rollback/CAS/fetch races, independent counter races/rollover, strict labels/projections/complete data and monitoring. Supports AC1–9/TEA INT001–002/API001–005.
- [ ] T8 — `scripts/verify/check-service-role-containment.mjs`, `tests/unit/scripts/verify/email-delivery-containment.atdd.test.ts` and exact shared manifest/H4/ACL/role/reset tests in handoff: transitive public dependency guard, middleware no-auth proof, full token and global-IP ACL enrollment and closed-set/scope tests retaining biting existing negatives. Supporting infrastructure for AC4/5/7/9/TEA SCOPE001.
- [ ] T9 — `tests/integration/components/calendar-feed.test.ts`, `tests/e2e/calendar-feed.e2e.spec.ts`, `tests/e2e/support/calendar-feed-atdd.ts`: real production-server browser Planering→actual Min kalender→Kalenderprenumeration link→settings→own issue→anonymous fetch→last-used→rotate→old invalid→revoke→new invalid, Admin-only monitoring, phone/keyboard/essential failure+reconcile; actual HTTP abuse/uniformity/cache/shell checks and physical own-row/audit readbacks. Supports AC1–9/TEA E2E001; no next dev/mocked server success.
- [ ] T10 — `docs/security/calendar-feed-operations.md`, this spec and future `_bmad-output/auto-bmad/delivery/15-5-personal-calendar-feed-adr-b004-surface-1.json`: document key/trusted-IP/monitoring readiness; author records actual executed gates/counts/revision, independent High review/cap 3, final author Suggested Review Order and contract reconciliation/deferred-release owners. Root runs executable delivery gate/distinct truth audit before done. Supporting completion infrastructure; no completed delivery/trail fabricated now.

**Acceptance Criteria:**

- AC1 — Given a current active Bookings.View user opening Kalenderprenumeration from the actual Planering Min kalender view or the separate profile-menu entry, when they create, rotate or revoke their own capability, then only their exact membership's generation changes with attributable atomic audit, a fresh 32-byte base64url URL is issued once on create/rotate, old links stop on rotation/revoke, and no peer/admin-on-behalf action or plaintext/hash disclosure is possible through status/direct DB paths.
- AC2 — Given stale or concurrent lifecycle actions, failed audit, lost committed response or explicit retry, when the user reconciles/retries, then revision/attempt/current-authority rules prevent duplicate rotation/audit, stale overwrite and resurrected tokens, uncertain UI stays honest, and an unrecoverable issued URL is replaced only by a separately explicit rotation; failure leaves no partial generation transition.
- AC3 — Given a valid capability with own/shared/materialized recurring bookings, when an anonymous GET occurs after create/edit/exception/split/cancel/reassignment, then complete current planned own events regenerate once with stable booking UIDs, independently correct UTC timed/Stockholm all-day exclusive dates, safe minimal title/job/customer/location and no co-assignees/money/notes/contact/tenant details; cancelled/unassigned/archived-profile data is omitted and no-profile returns a valid empty calendar.
- AC4 — Given revoked, rotated, unknown or malformed tokens with equal IP request history, when feed GET/direct RPC probes include tenant/user overrides, then they yield the same generic inactive404 body/headers without tenant/subject oracle, and forged/expired/missing proofs or spoofed direct IP/hash inputs cannot disclose data or bypass current authorization; a missing tenant, disabled/invited/missing exact membership or current Bookings.View role loss also invalidates access, while an existing legacy tenant with NULL provisioning_state and an otherwise eligible exact membership remains allowed.
- AC5 — Given many tokens from one IP, one token across IPs and concurrent fixed-window requests, when either independent 900-second budget 60/token or 120/IP is exceeded or rolls over, then database counters enforce the correct boundary without race bypass/overflow,429/Retry-After is correct, invalid shapes share IP enforcement, and counters/spike flags persist as sanitized own-tenant Admin monitoring with no raw token/IP/hash leak.
- AC6 — Given the real authenticated settings UI and an actual successful feed fetch, when status refreshes, then Senast hämtad/usage reflects database admitted fetch rather than lifecycle creation, never-used is explicit, the plain-language warning/one-time copy fallback/confirmations/pending/error/retry states work on desktop and 360×640 keyboard/touch, and non-Admin users cannot read the tenant abuse queue.
- AC7 — Given no session or hostile auth cookies/headers/cache validators, when the feed route executes, then middleware and all transitive public imports perform no auth refresh/session/tenant-context/nav/AppShell work, send no Set-Cookie/redirect or shared-cache304, and a current capability alone governs the no-store live response; protected route refresh and existing unsubscribe behavior remain intact.
- AC8 — Given malicious text/newlines/multibyte labels, boundary DST/all-day/overnight times, database/configuration failure or a large own materialized dataset, when the feed is serialized, then RFC5545 CRLF/escaping/75-octet safe folding and complete independent-parser events hold without injection, silent row truncation or persisted feed, and failures return generic503 before any partial/false-empty calendar.
- AC9 — Given actual anonymous/own/manager/mixed/peer/foreign/inactive/platform-only callers and current15.1–15.4/job fixtures, when full ADR-B004 SQL/RLS/ACL/HTTP and essential browser suites run, then all required positives/negatives pass with current self-only authority using tenant existence and the exact active membership/current role union (not provisioning_state), immediate commit-ordered revoke/assignment behavior, no privileged/public/client bypass and preserved recurrence/resolver/report/job semantics; calendar_feed is the only newly enrolled public surface.

## Spec Change Log

2026-10-20 — Initial independent High validation FAIL (14 checks:12 PASS/2 FAIL) required F15.5-01 and F15.5-02 only. Clarified existing tenant-existence/exact-active-membership/current-role eligibility and NULL provisioning_state compatibility; removed invented tenant lifecycle semantics. Added the approved actual personal-view→shared-settings entry and essential browser starting point. KEEP all other ADR-B004/security/serialization/limit/default/scope decisions and the10-task/9-AC structure. Original kernel `e0f81d85be76f7d33a1c17e6db2a47002f2ea8692571e415c91be338087985b8`, raw spec `0fac6de1fea61340517fbb865efc20830a764220f3b7030e3abed302cd138b88` and original15-file snapshot are preserved byte-for-byte under preparation revisions/initial-candidate. Approved kernel remains null pending targeted independent High revalidation; no implementation review round consumed.

## Review Triage Log

### Review Findings

**Round 1 of 3**

Review started at source head `ae020f63a88089966b9323c55a36b6554f7e3900`; zero prior completed rounds. Context-free gpt-6.1-sol High for all actual authorization/public-token/RLS/secret/transactional/lifecycle review scope; six installed Build Auto layers, including distinct bootstrap lifecycle and external native Codex review. Local source gates are recorded; required exact-head CI execution remains pending. Reviewer launch batches respect the available actor slots; no triage or source fixes before all layers finish.

Round 1 completed: **6 layers, 17 raw claims, 13 deduplicated claims: 11 patch,
1 reject, 1 release defer**. Original reports, the external native qualification,
and the global-lock clarification/rejection remain preserved in
`_bmad-output/auto-bmad/preparation/story-15-5/code-review-round-1/`;
`triage.json` SHA256 `ca281ac5bd9ec76451c9e9ee5044b794f5a3aed0c009056e2dda24be401f15c9`
is the accepted fix scope. Follow-up review is recommended for the sensitive fixes;
this is completed round 1 of the three-round cap, not an additional broad review.

| Finding | Applied action | Evidence limit |
| --- | --- | --- |
| R1-01/02 | Absent-only feed owner creation, seven attributes and retained membership checked; recovery grants only existing supabase_admin without admin option, source migration grants postgres. | Named recovery Compose unit case is static; real replay/restore and restore-principal ownership/schema-CREATE prerequisites remain CI requirements. |
| R1-04 | Projection catches SQLSTATE57014 in its subtransaction; UUID-scoped serial fault asserts durable token/IP admission and unchanged last-use. | Real SQL fault body/HTTP execution pending. |
| R1-05/06 | Microsecond ordering, positive RFC-second projection, optional METHOD omitted, revision derived from booking/work-role/job/customer/facility updates. | Independent Node vectors pass; live joined-label vectors await SQL/HTTP CI. |
| R1-07 | Automatic status refresh clears a superseded issuance and its stale success message. | Headless state race assertion passes; actual browser execution pending. |
| R1-08/11 | CI child settlement memoized, identities rechecked before signals; abnormal browser exits retain key custody; privacy detection inspects raw lines before allowlisting. | 22 injected bootstrap tests pass; synthetic dependencies do not prove live lifecycle/privacy. |
| R1-10 | Profile entry follows existing server-filtered scheduling navigation. Existing E2E-003 also checks denied seller entry/destination. | Browser execution pending; all 11 cases retained. |
| R1-12 | Status fixture checks exact ordinary-JWT RPC keys and physical hash/known secret absence before mapper; RLS008 retains direct payload assertions. | Native JWT/SQL execution pending. |
| R1-13 | Each allocated serial fixture captures, resets and restores only its keyed unknown-IP row after pending requests settle; primary/cleanup failures retained. | Native serial execution pending; row-isolated fixtures never acquire this control. |

R1-03 remains **rejected as an unproven functional/performance claim**. The original
High clarification did not identify a permitted workload that bypasses an invariant;
early lock release would weaken the hard cardinality bound. Keep the transaction
lock and already-deferred representative performance qualification unchanged.
R1-09 remains **release-blocking deferred**, owner Root/CI release operator:
the optional exhaustive branch is explicitly unallocated and unchanged. Before
`release_validation=true` qualification, obtain its exact runtime/lifecycle
allocation and execute the native exhaustive branch with every active case.
This is not development evidence and is never a passed release check.

**Round 2 of 3**

Targeted follow-up at `672099e9dc6569f4ac1cb9a967037e0d91df689c`: verify the eleven accepted Round 1 fixes and their regressions only. Reuse unchanged independent Round 1 assessments with original provenance; no new broad scope or spec audit. All sensitive reviewers remain context-free gpt-6.1-sol High. Native exact-head runtime qualification remains pending.

Round 2 completed all six layers with **two unique patch findings**. Accepted
triage is `code-review-round-2/triage.json`, SHA256
`16d7c37aa94cdab2fbc3ca40cee536ad342e48579160f4346539d5a01a133867`.
R2-01 is corrected under Root's SAME High clarification: source `postgres`
creator ADMIN membership is permitted, independently of SET authority. The source
guard keeps all seven negative owner attributes and rejects owner-outbound or
unexpected grantee memberships; it explicitly grants SET TRUE/INHERIT FALSE and
checks the actual executor's SET capability before ownership transfer. The
recovery SQL remains byte-unchanged, SupAdmin-only and strictly NOADMIN. No native
role or schema/function proof fixture is allocated in this fix batch; any such
future test effect requires Root's separate exact admission and PG17 evidence.

R2-02 is authored and integrated in the existing two E2E files: the real issuance
response is held after exact SQL attempt/hash/audit readback, a second real settings
page commits rotate/revoke, then unchanged real response bytes are released.
Rendered URL/copy removal and supersession announcement are asserted without
manual refresh; the current-revision control retains them. All original 11 cases
and privacy controls remain, plus three race/control cases. Both accepted patches
are source-complete; native role, SQL/HTTP and actual browser evidence is pending.

**Round 3 of 3**

Final automatic targeted review at `360fe850c18552f23a2bf74d8eda865431f0af38`:
review the two accepted Round 2 fixes, their single separately allocated native
PG17 proof case and consequential regressions only. Reuse unchanged Round 1/2
assessments and provenance. All sensitive layers use context-free gpt-6.1-sol
High; the external reviewer uses the qualified native read-only CLI route.
Required exact-head runtime evidence remains pending Root CI. After this round,
do not start a fourth broad review; follow-ups are limited to latest-fix
regressions and unresolved serious findings under the project owner policy.

Round 3 completed all six layers at source `360fe850c18552f23a2bf74d8eda865431f0af38`.
Only R3-01 is accepted: a medium verification gap in the resulting owner-membership
inheritance assertions. Five layers, including qualified native external Sol High
(exit 0), reported no findings/divergence. Accepted triage is
`code-review-round-3/triage.json`, SHA256
`10054ed013d3f6bb8161cdad32007f2f64c1773930e711d5de53848f70ff13ff`.
The author corrected only the allocated latest case: its shared post-bootstrap
assertion now requires every exact owner-to-executor membership row to have
INHERIT FALSE and the actual restricted executor's USAGE to be false after both
fresh source execution and replay. Existing SET/ADMIN/seven owner attributes,
identity/source/savepoint/cleanup assertions are preserved. The three completed
rounds exhaust the cap; only this latest fix's distinct High regression check
and unresolved serious findings may receive further review. No fourth broad pass.

## Design Notes

Current-contracts-and-design.md records the owner-authorized defaults: dedicated projection instead of manager-wide reader, Node 32-byte issuance with feed-only attestation, CAS/attempt reconciliation without plaintext escrow, independent 60/120-per-15-minute windows, conservative unknown-IP bucket, same-page sanitized Admin queue, complete live materialized feed with no invented horizon and safe work-role/Bokning title rather than arbitrary booking description. These are proportional supporting implementations of explicit ADR requirements, not new product features or verified legacy observations. All consumer/provider interoperability beyond essential RFC/HTTP correctness is deferred release validation. Stream only after complete authority/query success so a broken query cannot emit a partial valid calendar.

Implementation author later writes exactly one final author-written Suggested Review Order after code/evidence exist and validates actual stops using `node scripts/verify/check-review-order.mjs <this-spec>`. No guessed future line numbers/trail are created during planning. Root never authors spec/code.

Post-review technical corrections (R1-05/06): reuse the scheduling microsecond
parser for authority/order, then floor timed starts and ceil timed ends to RFC5545
whole seconds. At the final representable second in year 9999, saturate the end;
if that collapses the interval, move its start back one second. This deliberate
export rounding keeps positive fractional intervals nonempty, with at most
one second of boundary adjustment, while exact-second ordinary/DST/all-day
behavior and stable UIDs are kept. Component revision is the greatest update
of booking, work role, job, customer and facility; only those update columns are
added to the owner allowlist. Omit optional METHOD for a subscription snapshot,
so DTSTAMP and LAST-MODIFIED both describe the current component revision under
[RFC5545 sections 3.8.7.2/3](https://www.rfc-editor.org/rfc/rfc5545.html#section-3.8.7.2).
These narrow source corrections do not rewrite the approved kernel or historical
companion and do not claim provider interoperability.

Round 2 technical correction: PostgreSQL17's restricted CREATEROLE creator
receives ADMIN TRUE with SET FALSE/INHERIT FALSE. ADMIN allows membership management;
SET authorizes ownership transfer. Preserve that native source-creator authority,
then grant only SET explicitly and disable inherited owner privileges for the
trusted source executor; test its SET ability instead of inferring it from ADMIN.
This source policy does not apply to isolated recovery's strict NOADMIN principal.
See [PostgreSQL17 role attributes](https://www.postgresql.org/docs/17/role-attributes.html),
[GRANT membership options](https://www.postgresql.org/docs/17/sql-grant.html), and
[pg_has_role SET](https://www.postgresql.org/docs/17/functions-info.html).
No hosted catalog observation or restricted-executor native execution is claimed.

Keep the current-self role union, transactional lifecycle/audit/CAS, cookie-free
public boundary, complete minimal live snapshot, hard global cardinality lock,
independent budgets and no-plaintext recovery behavior unchanged. Recovery creates
only the absent exact feed role and fails closed on unsafe retained attributes or
grants, rather than repairing a cluster role. No persistent schema CREATE,
superuser/BYPASSRLS, runtime/JWT membership or general Vault grant is introduced.

## Verification

Planning executes only source AC comparison, immediate seven-point author audit, READY self-review, canonical spec reader/discovery, candidate kernel/raw hashes and tracked-source/context preservation. No ATDD, application unit/integration/build/browser/runtime or CI execution is claimed. Root next dispatches distinct independent Sol High specification validation and freezes only after applicable preservation/validation; candidate kernel is not approved.

Future development: frozen install, `pnpm run verify:development`, applicable audit/static/production build; full `SUPABASE_TEST_REQUIRED=1 pnpm run test:int` with actual executed/failed/skipped counts, all new focused DB/HTTP/ACL/role tests plus unchanged booking/series/resolver/report/job/E13 regressions, current combined-history migration replay/H4/exact policy/effective grants; direct physical recovery Storage integrity; configured-production Playwright essential calendar-feed/auth smoke; independent High actual-diff review within 3 rounds. Dedicated temporary test key/owned Vault and serial fault/barrier resources require Root/Coordinator allocation first. No old skips/collected tests/SSR/synthetic/VM/predecessor evidence substitutes for real required DB/public HTTP or browser outcomes.

Cover actual HTTP no-cookies and malicious-cookies cases, direct anonymous/authenticated raw-RPC forgery, invalid/key/expiry/domain/field proof parity, current permission/membership/profile/assignment races, atomic rotation/revoke/audit/CAS and retry, independent limits across many tokens/IPs/concurrency/window rollovers, persisted failure counters/Admin field absence, event completeness beyond row cap, shared bookings/recurrence tombstones/splits/stable IDs, all-day/DST and injection/escaping/UTF8 parser vectors. Trace each TEA scenario to actual assertions/results at the exact tested revision.

Deferred release validation: exhaustive browser/device/calendar-provider matrices and screenshots/visual comparison (QA/UX, deferred/unexecuted, execute approved representative matrix); manual accessibility/daylight/exploration (QA/UX, deferred/unexecuted, record actual observations); representative full-feed workload/performance thresholds (Product/Architect+ops, deferred/unapproved, approve volumes/targets then measure); polish (delivery owner, deferred, triage after functional evidence). Record scope/owner/status/evidence/next action in delivery/Root ledger, never PASS. Security/data/essential-flow failures block development. Done means development complete only, release_ready=false until actual release evidence and separate approvals. No automatic Preview/manual deploy/main merge/production enablement authorized; Root retains inherited review_unverifiedTRUE.

## Auto Run Result

Status: in-review
Blocking condition: the new118th job-card shared-refresh migration is source-only and unexecuted. Qualified NORMAL39703778989 retained2058DBpass/2fail/9pending/52skip;35mandatory story DB cases includingAPI019/INT015 are unexecuted. The new correction addresses demonstrated E16 job-card refresh overwrite and strict REAL011 fact-shape mismatch, not a proved hosted first throw. Browser007unexpected/fourflaky and response.finished/backend custody remain UNKNOWN; no browser change or retry is authorized here. Independent targeted source review and required qualified native gates remain pending; development complete=false, acceptance0.

Current result — 2026-10-22: exact4 forward-correction source handoff only. One
CLI-generated migration changes only the series protocol pair after exact effective
body qualification;41 affected pure units pass. No SQL application, extra query,
principal/ACL expansion, browser change or Git mutation occurred.
The following planning paragraphs are retained historical results, not the current
status, permission, gate outcome or runtime evidence. The historical ARR warning
and three completed broad review rounds remain preserved.

HALT after planning. Author READY/self-audit passed with 10 tasks and 9 Given/When/Then ACs. Candidate intent kernel awaits approval; exact raw/kernel digests and reader/discovery/preservation receipts are in preparation validation.json. Planning-only candidate; independent Root High validation/kernel freeze and Coordinator exact implementation/migration/test-resource admission remain pending. No source/schema/test/dependency/env/runtime/state/sprint/Git/remote mutation occurred. Resources 0. Completion hook preserves this planning result and creates no completed implementation review trail or delivery claim.

Bounded author repair completed for initial findings F15.5-01/F15.5-02 only. Current ready-for-dev remains a candidate, not approval; initial independent FAIL and12 unchanged PASS assessments remain historical in immutable independent-validation/. New candidate hashes/receipts supersede only author preparation metadata. No implementation/resource admission or runtime execution occurs.

Approval metadata — 2026-10-20: independently validated kernel pinned in frontmatter and approval.json after targeted High PASS6/6; initial FAIL history preserved. This supersedes pending-approval metadata only. Status remains ready-for-dev; implementation, ownership, migration, test-key/runtime and resource admission remain held for Root/Coordinator. No product contract, task or AC changed.

## Implementation Execution Admission

2026-10-20 — Implementation mode admitted by Root after verified direct owner approval and accepted exact Coordinator allocation. Read `_bmad-output/auto-bmad/preparation/story-15-5/accepted-ownership-allocation.json` (SHA256 a00bd6d75e7d3c56e0e5985dce9f6c26e43776be6c3670ae319159bdbe1ac0ed) and `ownership-inventory-successor.md`; historical planning-only holds are superseded only within these exact bounds. Fresh Root/Coordinator inventory confirms E16 actual HEAD 77d11b6f18570e075dd858096194e497d99f95b1, active16.4, reserved/untracked 20261020210000 migration, and allocated E15 20261020220000_personal_calendar_feed.sql absent in both inventories and later than the combined reservations. Creation in this owned branch is admitted; foreign dirty SQL remains excluded.

Build workflow execution route: context-free implementation author gpt-6.1-sol High, selected for public tokens, authorization/RLS, dedicated Vault secrets and transactional integrity; independent reviews select High for the same actual diff. Before dispatch this route is recorded here. An already-routed High author does not recursively delegate merely for effort. Author commits story source per git-and-pr.md and never pushes. Root owns bookkeeping commits, all pushes, canonical state/sprint/aggregate ledgers and resource lifecycle. Author must not launch managed background/DB/Next/browser resources, run Vitest collectTests/globalSetup, or Playwright auto webServer. Bounded unit/type/lint/build source verification is allowed. Full DB/RLS/HTTP/browser installed collection and recovery-storage evidence will use Root-managed exact-head CI after independently reviewed source freeze; report pending evidence honestly and retain in-review until Root qualification and distinct truth review. This execution metadata is outside the immutable approved intent contract.

## Implementation Verification — source handoff 2026-10-20

Source implementation and all 83 prepared expanded acceptance cases are now bound:
22 Node unit cases, 50 Vitest lifecycle/API/RLS/component cases and 11 browser
cases. No prepared case was dropped. The original ATDD manifests and planning
receipts remain historical; their hashes are not current execution evidence.

The implementation author applied the frontend-component and Supabase skills,
the Supabase PostgreSQL security guidance, and the React best-practices review.
Missing historical DESIGN/Figma references were resolved under the recorded
owner-authorized existing Dialog/globals/settings defaults. No legacy observation
was made. The allocated migration was CLI-created, then only that newly created
file was moved to the Coordinator's reserved `20261020220000` name after Root's
fresh combined-history receipt. No earlier migration or E16 worktree was edited.

Actual local execution against the final source working tree before its source
commit: focused combined Node command **90 passed, 0 failed, 0 skipped**, including
all 22 feed unit cases (action-state 3, iCalendar 6, validation 3, attestation 4,
trusted-IP 3, public-shell 3); typecheck passed; explicit owned-source ESLint
passed; production `pnpm build` passed (compile 4.6s, TypeScript 20.8s, 12/12
static pages, dynamic feed/settings routes); service-role, lockfile and built
bundle guards passed. Initial scope-count/import-path failures were corrected
before the final 90-case pass. Broad local `pnpm lint` was interrupted because
it scanned retained ignored historical CI trace assets; those assets and lint
configuration were not changed. Full clean-checkout canonical lint remains CI work.

Root-authorized disjoint Sol High contributors supplied the two browser files
and the three isolated-runtime/CI files. Their reported checks: browser source
ESLint/typecheck/diff check passed and Playwright discovery listed 11 cases
(discovery only); bootstrap injected tests **17 passed, 0 failed, 0 skipped**,
focused ESLint/typecheck/diff check passed. The latter simulate process/DB
dependencies and do not prove live runtime ownership or Vault cleanup. The
bootstrap source requires its own distinct High lifecycle review before CI.

Required native full integration/RLS/ACL and installed six-file collection,
physical recovery Storage integrity, actual public HTTP and essential production
browser execution, independent High implementation review and final truth audit
are **pending Root's exact-head lane**. No runtime, database, Vault key, managed
resource, deployment or hosted configuration was launched or changed locally.
No delivery JSON or development-complete/release-ready claim is fabricated.
Root retains the existing in-progress/in-review gate and `release_ready=false`.

Deferred release validation is unchanged: QA/UX owns provider/device/visual/manual
accessibility matrices and screenshots; Product/Architect/operations owns approved
representative volumes and performance targets; release operator owns hosted key
and verified-IP provisioning. Each needs its previously recorded next action and
actual release evidence. Functional/security/native development failures remain
blocking and cannot be recategorized as deferred polish.

## Round 1 fix verification — 2026-10-20

All 11 accepted patches are applied in this working tree, including the two
explicitly delegated bootstrap fixes. No prepared declaration was removed or
skipped: all 83 prepared expanded cases remain, plus eight new Node regression
cases (30 feed Node cases total). Existing API001/API018/RLS008 and E2E-003 gained
assertions without replacing their earlier assertions. E2E-003 is the existing
profile-entry case; it now includes a denied seller vector, not a new test.

Actual targeted command:
`node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/calendar-feed/icalendar.test.ts tests/unit/features/calendar-feed/action-state.test.ts tests/unit/ops/pilot-operations.test.ts tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts`
**63 passed, 0 failed, 0 skipped**: serializer 13, action-state 4, existing operations
24, bootstrap 22. The operations recovery case reads source only; bootstrap
process/DB transports are injected. Full source typecheck and focused ESLint passed.
Production build passed (compile 3.5s, TypeScript 5.6s, 12/12 static pages);
service-role and built-bundle containment passed. An initial build exposed mixed
encoding in two newly edited Swedish text lines; both were repaired to valid
UTF-8 and the build/focused lint passed. A mistyped bundle-guard path failed to
resolve before the canonical `check-bundle-containment.mjs` passed.

The isolated SQL/HTTP/RLS and actual production-browser/recovery bodies remain
unexecuted locally, as required by execution admission. In particular, SQLSTATE57014
is a scoped real-SQL fault vector, not evidence of an executed native timeout;
raw status/privacy and unknown-IP cleanup need native execution. Required full
integration, installed six-file collection, recovery Storage/principal checks,
essential browser, targeted High follow-up and truth qualification remain Root's
exact-head CI/review work. No resources, key, Vault, environment or hosted settings
were changed. Keep status in-review, follow-up recommended, no delivery JSON or
development-complete/release-ready claim. The optional exhaustive release branch
remains release-blocking deferred as recorded above.

## Round 2 fix verification — 2026-10-20

Browser contributor released exactly `tests/e2e/calendar-feed.e2e.spec.ts` and
`tests/e2e/support/calendar-feed-atdd.ts` after adding three active rendered
race/control cases, for **14 browser cases**. Child-reported typecheck, focused
ESLint, native diff check and Playwright `--list` discovery (14 cases/one file)
passed; these unchanged source checks are reused with that provenance. Discovery
is not browser execution. No new runtime/build/unit result is claimed for this
browser/helper change. The source-role correction additionally passed the focused
existing named static case:
`node --experimental-strip-types --import ./tests/support/register.mjs --test --test-name-pattern="recovery Compose sources" tests/unit/ops/pilot-operations.test.ts`
**1 passed, 0 failed, 0 skipped**; focused ESLint on that changed assertion file
passed. This proves the source contract assertion, not PG17 execution. Recovery
SQL is unchanged. No application runtime source changed after the Round 1 build,
so its recorded production-build evidence is reused rather than rerun. Original
83 prepared expanded cases remain; additions now comprise eight Node regressions
and three browser race/control cases, yielding 30 feed Node, 50 native Vitest and
14 browser cases overall. The frozen intent is unchanged. No resource launch,
native test-role effect or development-complete claim is made by this fix handoff.

## Native PG17 proof-case source verification — 2026-10-20

Root/Coordinator's later exact allocation `accepted-pg17-probe-allocation.json`
(SHA256 `bc3f01da175a7f2ed4589c9cad86baff4cec4329c293597becba4b5a05d6e2b6`) supersedes only the earlier held test-effect
statement. Added exactly one active case, `15.5-INT015`, to the existing serial
command file. The original 83 prepared expanded cases and later additions remain:
current inventory is **30 feed Node, 51 native Vitest, 14 browser cases**.

The case first reuses existing wrapper admission/stack validators with bounded,
fixed-argv read-only Docker/status observations, workspace/checkout identity,
complete migration ledger and actual checked feed-function owners. Raw command
JSON/errors stay in memory. It then requires observed native major17 and both
original session/current identities to be the authenticated isolated superuser;
no existing role is elevated. Native server version values are recorded through
safe Vitest annotations only when actually observed; no version result is invented.

Exactly two UUID-owned NOLOGIN roles, one UUID schema and one harmless invoker
function are transaction-local. A restricted session authorization, not merely
SET ROLE under a superuser session, is asserted immediately before each credited
source/SET/ownership operation. Separate engine-baseline creator ADMIN/SET/INHERIT
and createrole_self_grant checks roll back before the actual leading source DO
block genuinely creates its fresh target. Role-name substitutions are reversible;
every source guard statement remains. Replay and unsafe attribute/membership
vectors require the exact bootstrap exception after savepoint rollback. The
inverse-membership setup first removes forward/dependent grants between only
the two owned roles, so engine-cycle rejection cannot count as guard evidence.

UUID-schema CREATE is only a transaction-local fixture prerequisite, not proof
of real source/recovery public-schema privileges. Expected errors restore their
savepoints before assertions. Unexpected failure triggers full rollback before
session/role resets; dedicated direct connections never enter a pool. Primary,
transport and all cleanup failures are retained without raw causes/values. Both
the original and a fresh read-only connection must prove both roles/schema/function
absent. Existing roles, public schema, JWT, Vault, hosted state, processes and
workflows receive no mutation from this test fixture.

Actual checks on the authored source: full typecheck and focused ESLint passed.
No native test, Vitest collection/globalSetup, Docker/Supabase qualification command,
DB connection or runtime was executed locally. Existing production build and
unchanged unit/browser-discovery evidence remain reusable with their recorded
provenance; they do not execute INT015. Distinct changed-line High Round 3 review
must precede Root exact-head CI. The actual restricted-executor test, full required
native lanes and source/recovery public-schema qualification remain pending.
Status stays in-review, follow-up recommended, no delivery/development-complete claim.

## Round 3 latest-fix verification — 2026-10-20

R3-01 adds only read assertions inside the existing `assertOwner` helper used after
both fresh bootstrap and replay: `pg_has_role(current_user, exact_owner, 'USAGE')`
must be false, and all nonempty exact owner/executor membership rows must have
`inherit_option=false`. Checking actual resulting memberships closes the gap that
would allow a source WITH INHERIT TRUE regression despite a passing engine
baseline/static wording assertion. Every earlier proof and cleanup remains.
There is no additional role, object, process, command or fixture effect, and the
95-case inventory remains unchanged (30 feed Node, 51 native Vitest, 14 browser).

Focused ESLint and full source typecheck passed for this assertion correction.
No native case or qualification command was executed. Unchanged earlier static,
unit/build and independent review evidence is reused with its recorded provenance;
it is not runtime evidence for INT015. One author review section is refreshed
against the final changed source. Distinct High latest-fix-only review, actual
restricted PG17 execution, required full native lanes, public-schema source/recovery
qualification and final truth assessment remain pending Root's exact-head lane.
Status remains in-review; no delivery/development-complete/release-ready claim.

## Checkpoint CI repair verification — 2026-10-20

The first checkpoint at `9487c0d9dc6f622b472780587e20e834abf98595`
(source equal to reviewed `611c86295540161d31169110bf2139cf1d85d708`)
failed run `39451957379`, attempt 1: **3094 unit tests, 3086 passed, eight
failed, zero skipped**. That failed native result and the original source-freeze
capsule remain immutable history. Root reports all 30 feed Node and 22 separate
bootstrap cases reached and passed there; the other 65 feature native bodies
were not executed, and no API execution artifact exists.

Seven failures came from shared tests assuming that delegated integration/smoke
commands remained literal workflow commands. The eighth exposed the command
enrollment scanner's intentional literal-declaration contract. The source now
declares each of create/rotate/revoke literally and shares their unchanged
execution configuration; request authority, proof and plaintext handling remain
inside execution. No enrollment checker was weakened.

Root/Coordinator admitted exactly the new `tests/support/calendar-feed-ci-contract.ts`
and five named shared test consumers after E16/Documents ownership confirmation
(`accepted-ci-contract-repair-allocation.json`, SHA256
`f0c35067c1691c7df20e5ebc25ca5fec89e718f2d98a01d6d62bf2902c153cf7`).
The test-only helper reads, never evaluates/imports, the reviewed LF-normalized
wrapper source pinned to `cca0ccc6c0221f70a63f05a9fda715e8551de3fb58c3c99559772fbe137af0a6`.
It validates both actual literal argv arrays and inverts only the two complete
admitted workflow entries, including line boundaries. All other workflow bytes
survive. This choice lets existing checks follow real delegated commands while
preserving their job/authority/optional/required-red/native-success/upload and
seeded honesty fences. The original fixed-Chromium inverse hash
`48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0` is unchanged.
Unrelated wrapper drift fails the pin; unrelated workflow drift survives and
fails that original inverse. The wrapper's existing injected tests independently
assert exact actually launched argv against literals, not its own constants.
No workflow, runtime wrapper, key/provider or resource effect changed.

Actual bounded working-tree verification before the repair commit:
`node --experimental-strip-types --import ./tests/support/register.mjs --test --test-reporter=dot tests/unit/docs/acceptance-gate-report-validators.test.ts tests/unit/scripts/ci/checkpoint-dispatch.test.ts tests/unit/scripts/verify/ci-native-test-reports.test.ts tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts tests/unit/server/authz/command-enrollment.test.ts tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts`
passed **302/302, zero failures/skips**. The new projection regression case brings
the separate bootstrap suite to **23**; feature inventory stays **95 = 30 Node +
51 Vitest + 14 browser**, preserving all original 83 prepared expanded cases.
During this repair an initial negative caught prefix matching of appended argv;
complete line boundaries fixed it before the final full focused pass. Initial
`.ts` imports failed typecheck and were corrected to the repository's registered
extensionless convention. Full `pnpm exec tsc --noEmit --incremental false` then
passed. Focused eight-file ESLint exited zero with two unused-helper
warnings in the fixed-Chromium test; those unrelated functions were preserved.
Fresh `pnpm run build` passed after the application declaration correction
(compile 3.5s, TypeScript 6.0s, static 12/12). Subsequent changes are test/spec-only,
so that build is reused for the unchanged application dependency set.

Root-owned dirty state and allocation/route metadata are excluded from author
source commits. This is not a globally clean-tree or successful-checkpoint claim.
The distinct High latest-fix review at source611 passed; it does not review this
new CI repair. A distinct High latest-delta review and a successor source binding
must precede Root's next exact-head checkpoint. Native DB/RLS/component/HTTP,
browser, recovery and installed-collection evidence remains unexecuted. No local
runtime/qualification command or resource was launched. Three broad rounds are
complete; no fourth broad review, delivery JSON, done or release-ready claim.

## Native SQL compile repair and effective-schema assertions — 2026-10-20

The second checkpoint `c57580580217e34a0b933a23f7c36737306333b7`, run
`39457178499` attempt 1, passed **3095/3095 Node units, zero failures/skips**,
the three partition units, Python 43, production build and bundle containment.
Its DB, recovery and browser jobs all stopped at statement 43 of this unapplied
migration with SQLSTATE `42601`. The immutable native context
`checkpoint-c5758058-ci-independent/native-static-sql-failure-context.json`
records log lines 983–992: the caret points to the first CASE-branch THEN in
`calendar_feed_verify_attestation_internal`. The complete failed packet's
manifest SHA256 is `0819c8fe8dd279578c1a9a8b88074c11f1c3abce1d0df206d92d42d55f8a0e1c`.
No complete real ownership/grant/revoke lifecycle or native feature body is
credited after this failure: API execution artifacts remain zero, and the 65
Vitest/browser feature bodies remain unexecuted. Both failed checkpoints and
their predecessor capsules stay immutable; a passed unit subset is not a passed CI.

The author inspected the exact source/error context and the same file's CASE
uses. The sole bare CASE in a PL/pgSQL IF condition now has parentheses around
the CASE expression. This two-character syntax correction separates its THEN
from the enclosing IF terminator; branches, null handling, domains, guard order,
role hardening, proofs, claims and transactions are unchanged. Assignment and
already-delimited SQL CASE expressions were preserved. Required native migration
compilation remains the regression gate; no static string mirror is substituted
for execution and no local SQL runtime was started.

Read-only source investigation also found that the existing RLS010 effective
ACL assertions omitted effective public-schema CREATE absence. A direct REVOKE
does not establish absence through PUBLIC/inherited grants. The existing fixture
now queries `has_schema_privilege` for the real owner, and existing RLS010 requires
`publicSchemaCreate=false`. Root/Coordinator additionally allocated only the
existing recovery Storage test's single case (`accepted-recovery-schema-assertion-allocation.json`,
SHA256 `2fa8883400517d3bb268c9d1ab42605811df4669c264bb58b468b4f8479358c8`).
Before its Storage checks, the same fixed Compose/psql SupAdmin target performs
one bounded read-only catalog SELECT and fails unless effective CREATE is false.
The 15-second command limit and fixed sanitized failure expose no raw output,
SQL argv or error cause. No roles, DDL, SET, grants, objects, keys, workflows,
inputs or workloads were added or changed by these assertions.

Reached real migration/restore statements can establish their actual guards,
grants, transfers and revocation once native execution completes; absent emitted
identity logs alone are not a defect. No new restricted-real-source claim is
made. The separate UUID-schema INT015 proof keeps its explicit evidence limits.
No new case or fixture was added: feature inventory remains **95 (30 Node,
51 Vitest, 14 browser)**, original 83 retained, and bootstrap units remain **23
separate**. This repair requires targeted High latest-delta review and new
exact-head native CI; it does not increment the three completed broad rounds.
Root metadata and all immutable source-freeze/failed-packet artifacts are excluded
from the author source commit. Status remains in-review, no delivery/done claim.

Actual bounded checks on these four source files before the repair commit:
full `pnpm exec tsc --noEmit --incremental false` passed; focused
`pnpm exec eslint tests/support/calendar-feed-atdd.ts tests/integration/rls/calendar-feed.rls.test.ts tests/integration/ops/recovery-storage-immutability.int.test.ts`
passed with zero errors/warnings. Earlier executed Node/build results retain
their revisions and dependency limits; they were not rerun for SQL/native-test-only
changes and do not compile this migration. Native and cached Git diff checks and
the single review trail's actual path/line/literal anchors are checked before commit.

## Native setup diagnostic repair — 2026-10-20

Third checkpoint `1cea5c4caa4996566ca95f5b872c6623da22f807`, run
`39460389509` attempt 1, remains **failed**. Native verify passed 3095 Node
tests with zero failures/skips/cancellations, Python 43, build and bundle guard.
All three stack starts/resets now passed, clearing the SQL compilation blocker
and giving reached real migration engine operations their own bounded credit.
The existing isolated recovery case also passed: actual restored-target effective
CREATE=false, physical Storage bytes/info, unchanged protected rows and overwrite
denials. That one case is separate from feature95. The immutable third packet's
manifest SHA256 is `c961673416fa0f1aa9ec527d63096906daa7cd375be8d51fff44597e71303fc8`.

DB and browser then emitted only `runtime-failed`, ready=false, empty child exit
codes, keyDeleted=false, dbClosed=true and custody=null. No exact setup stage,
connection/key outcome, child readiness or feature execution can be inferred from
those receipts. The 51 feed Vitest and 14 browser bodies, source RLS010, public
HTTP/telemetry and INT015 remain unexecuted. There is no functional setup fix based
on a guessed cause. All three prior capsules and failed packets remain immutable.

Root authorized a diagnostic-only change to the existing wrapper/unit file and
test-contract pin. The author recorded explicit Sol High routing before edits in
`author-native-setup-diagnostic-route.json`. Receipts now include a closed fixed
stage and category plus only nine allowlisted SQLSTATE values (others become
unclassified/null). Native code is read only through its own data descriptor;
no native message, detail, hint, query, parameters, stack, cause, status payload
or secret-bearing data is serialized. Primary and cleanup diagnostics stay
separate. Fixed commands, admission, privileges and cleanup/custody branches
are unchanged.

The diagnostic `keyOutcome` is derived from actual control-flow confirmations,
never custody=null: not-attempted, rollback-confirmed before any COMMIT attempt,
deleted-confirmed through existing exact UUID/name deletion plus absence read,
or unverified. The COMMIT-attempt flag is irrevocable; later successful ROLLBACK
cannot alone prove absence after a lost COMMIT response. This records uncertainty
without repairing or broadening the existing cleanup policy.

The wrapper's actual LF-normalized SHA256 is now
`3b680b435875ab7023f12db379d4f90fcd2705c6b4a778fad2a68de4ac709ac2`;
the test-only contract pin matches it. The original workflow inverse hash and all
entry/argv/reporters/native-JSON/unrelated-drift negatives remain unchanged.
Actual bounded checks on this working source: the existing wrapper Node file
passed **26/26, zero failures/skips**, including three new diagnostic/uncertainty
cases. Full typecheck and focused three-file ESLint passed with zero lint errors
or warnings. These injected tests exercise real wrapper failure and cleanup
branches; they do not diagnose the native setup cause or prove live key custody.
No unrelated passing test/build lane was rerun, and no native runtime/resource
or qualification command was started locally. Feature inventory remains **95**,
original 83 retained; the separate bootstrap suite is now **26**.

The single author review trail is refreshed to the diagnostic working tree.
Distinct High latest-delta review must precede the proposed source commit and
new exact-head diagnostic CI; this is not a fourth broad review. Root metadata
and the author route stay outside source commits. Status remains in-review,
without delivery, done, successful CI or release-ready claims.

Post-review verdict metadata: the distinct context-free Sol High latest-delta
review passed the four uncommitted working-file versions bound by the frozen
43,259-byte input SHA256 `6066a8c53d71c299f4f5aaa4da16ba680d440c087c5681e6713d842340479f4d`.
This was a working-tree review against HEAD1cea, not a review of a later
commit. The three final code/test files retain the reviewed raw/Git-clean
bindings. This added paragraph is a separate post-review spec metadata delta;
no exact-byte review claim covers the amended spec. The intent kernel and
29-stop review section are unchanged. Native setup cause and 65 feature bodies
remain unverified pending the next exact-head diagnostic CI.

## Same-connection privacy preflight repair — 2026-10-20

Fourth checkpoint `e91b366b8b362f8ffbd867940dfe1cd2d817e72b`, run
`39464940677` attempt 1, remains **failed**. Its DB and browser receipts reached
database-connect / insufficient-privilege / SQLSTATE42501, keyOutcome not-attempted,
no children and dbClosed=true. Native verify passed 3098 Node tests; the existing
one-case recovery proof passed separately. All 65 feature runtime bodies remain
unexecuted. The failed packet and all four preceding source capsules remain
immutable. Neither the denied parameter nor an observed connected principal or
effective setting is established by that startup rejection. Earlier generic
failures retain their original unknown classification.

Root authorized the four-file repair and the author recorded explicit Sol High
routing before edits in `author-native-privacy-preflight-route.json`. PostgreSQL
17's documented SUSET/USERSET distinction supports a startup permission hypothesis,
not a native diagnosis of the denied setting. The selected proportional repair
uses only the USERSET `log_parameter_max_length_on_error=0` startup option,
explicitly excluding ambient PGOPTIONS. A fixed read-only query on the same
client then requires exactly four unique, strictly typed controls with expected
contexts and effective values `none/panic/0/0`. Missing, unknown, duplicate,
malformed or mismatched facts fail closed before UUID/entropy, Vault, telemetry or
children. Only closed names/contexts and booleans enter the receipt; actual
setting values, role names and native error payloads do not. Identity and SET
authority booleans are diagnostic observations, never a new superuser/privilege
gate. The qualifying client remains the key transaction and cleanup client;
there is no fallback, privilege/configuration grant or alternate principal.

Fixed argv, workflow inverses, original inverse hash, child ownership, COMMIT
uncertainty, exact UUID/name deletion and custody branches remain unchanged.
The actual wrapper LF SHA pin is refreshed. Local bounded evidence is 30/30
injected/adapter Node tests, zero failures/skips, including four new preflight
cases. They cover all four unsafe controls, incomplete/duplicate/unknown/type/
context failures, zero secret/launch operations on refusal, same-client ordering,
actual installed driver startup configuration, diagnostic-only identity/SET facts,
and separate sanitized query/close failures. Full typecheck and focused lint
passed with zero lint errors/warnings; receipts accompany the committed review
input. No native runtime or resource was
started locally; existing application and feature tests are unchanged. Feature
inventory remains 95 and separate bootstrap inventory is 30. Distinct High review
of the exact committed four-path delta and a new exact-head CI remain pending;
no prior native default or success is assumed. Status stays in-review, without
delivery, done or release-ready claims.

## Isolated authenticated setup transport repair — 2026-10-20

Fifth checkpoint `c7570096435dfbae2f6a535be46e61daaf9e28dc`, run
`39468849461` attempt 1, remains **failed**. Verify passed 3102 Node cases and
Python 43/build/containment; the separate recovery case passed. Both wrappers
actually connected as session=current postgres, with superuser=false and
BYPASSRLS=true. Three required privacy matches were false, on-error matched,
and no entropy/key/child followed. A canSet=false observation is not an actual
SET trial or a general USERSET prohibition. INT015 was still unexecuted and its
original authenticated-superuser prerequisite cannot be credited from that role.
All 65 feature runtime bodies remain pending. All five capsules and failed
packets preserve their historical facts without retroactive reclassification.

Root/Coordinator explicitly admitted the independently High-reviewed proposal's
credential-use/transport effect in `accepted-native-authority-boundary-allocation.json`.
The author recorded Sol High routing before edits in
`author-native-authority-transport-route.json`. The fixed setup constructor
revalidates the same fresh source stack and accepts only its sole nonempty
captured POSTGRES_PASSWORD entry, in memory. It fixes the existing local DB
publication and supabase_admin login, with no guessed/default credential, caller
admin URL, alternate route, retry, role elevation or permission repair. Existing
ordinary DB configuration, generic pools and child configuration are unchanged.
The admin credential mapping/TCP login remains unverified until admitted CI;
authentication failure must stop, not select another identity.

The original four session-only startup logging controls are restored on this
setup connection. After authentication, a separate fixed read-only authority
query requires actual session=current supabase_admin and both LOGIN+SUPER flags;
the same client's strict four-control privacy proof still precedes UUID/entropy,
Vault, telemetry and children. Raw credential/role/setting/driver payloads never
enter receipts. SET ACL and postgres/BYPASSRLS facts remain diagnostic; this
explicit setup authority gate is distinct from those observations. No persistent
GUC, grant, existing role, provider, workflow or migration changes are introduced.

Only existing INT015 changes its original and fresh client construction to that
qualified route. Actual original-superuser/native-PG17 proof stays mandatory.
Restricted SESSION AUTHORIZATION and immediately asserted session=current owned
migrator, seven attributes, native baseline, fresh/replay bootstrap, SET/USAGE/
INHERIT, owner operations, savepoint/full rollback and same/fresh absence remain.
Reset and fresh read-only connections independently qualify identity/privacy.
UUID-schema CREATE does not substitute for real public-schema prerequisites.
Primary and cleanup failures stay visible; no unverified connection is pooled.
Wrapper COMMIT uncertainty, exact UUID/name cleanup, child settlement and custody
are unchanged. Exports constrain call sites; this Docker-enabled isolated job is
not a process sandbox. No new privileged child field/DSN is added; no physical
credential separation is claimed if existing principals reuse a password value.

The wrapper's actual LF SHA pin is refreshed. Local bounded wrapper evidence is
33/33 Node cases, zero failures/skips: real unconnected pg startup/purpose/timeouts,
ambient-input exclusion, strict source credential/identity negatives, zero
secret/launch on refusal, ordinary child configuration and existing privacy/
COMMIT/cleanup/argv/drift fences. Full typecheck and focused four-file lint passed
with zero lint errors/warnings; all 35 stops in the single refreshed author trail
resolve. Receipts accompany the exact committed review input. Existing feature case
inventory remains 95; bootstrap33 is separate. No native runtime or resource was
started locally. Distinct High exact-committed latest-delta review and new
exact-head CI remain pending. Status stays in-review, no delivery/DONE/release
claim, and the intent kernel is unchanged.

### Native settlement and browser diagnostic repair — sixth failed checkpoint

Checkpoint `fae644b5349744a531008e2224ca3a08d596836e`, run
`39474891873` attempt 1, remains **failed**. Verify passed 3105 Node cases,
including 30 feature and 33 separate wrapper cases; Python 43 and the separate
recovery case passed. Both real wrapper clients proved all seven setup-authority
facts and four privacy matches before key/child work. That preflight is bounded
native credit, not execution of INT015 or the source RLS catalog assertions.
The DB's first build child exited zero, then identity/cleanup guards refused;
no receipt distinguishes missing leader, identity mismatch or group change.
The 51 feature DB cases did not execute. Browser ran 31 cases: 17 unrelated passes
and all 14 story cases failed, with 28 attempts including retries. Seven exposed
response-wait timeouts; seven retained only sanitized scenario/setup failures.
None establishes a completed browser acceptance body. All six prior capsules and
failed packets remain immutable; the new result does not relabel older failures.

Root admitted the exact six-file settlement/diagnostic repair before edits;
`native-settlement-browser-author-route.json` records the author's Sol High route.
An injected reproduction reached a valid captured leader disappearing during
identity inspection, matching the failure pattern without proving its native
cause. The wrapper now gives that path passive actual group-absence observation
within the existing 15/5/5-second stages. It never signals a leaderless group,
requires a valid original capture, rejects reused/mismatched identities, and
latches observed absence before bounded child completion and output drain.
Persistent groups retain failure and key custody. Closed process-phase codes
expose only capture/read/mismatch/persistent-missing categories; no native
identity or payload is emitted. COMMIT uncertainty, exact-key cleanup and the
abnormal browser-exit custody fence remain intact.

The browser delegate retained the same Next action predicates and physical
attempt/hash/audit assertions. Own cancellable event listeners observe both
waiters and the returned promise immediately; outer failure cannot leave a raw
response rejection unhandled. Teardown releases transport gates, cancels future
polling and joins actual readback/route work before SQL/Auth cleanup. Cancellation
or timeout alone is not query settlement; failed listener removal or unverified
work retains the canonical fixture in process custody rather than deleting its
rows/users. Local composition uses the same canonical role-aware factory, four
profiles and four ordinary test clients, joining seed and token/audit siblings.
Closed diagnostic stages/categories/allowlisted SQLSTATE preserve primary and
all cleanup failures without original messages, causes, parameters or bodies.
No parser, application, principal, privilege, workflow or global recorder changed.

Installed Playwright 1.61.1 suppresses only the DOM snapshot for the file-local
privacy flag; message/source error-context attachments can still exist. The
native packet has 28 metadata references, zero available attachment bodies, and
content-check result **null/unavailable**, not privacy PASS or demonstrated leak.
The repair retains attachments and the existing negative exit fence. Actual
content qualification, clean child/key lifecycle and current-head native DB and
browser acceptance remain pending.

The bounded unit suite now has 47 separate cases: prior 33 plus six stopper/full-
wrapper regressions and eight browser Promise/diagnostic/cleanup regressions.
All 47 passed with zero failures/skips/cancellations; full typecheck and focused
five-file lint passed with zero errors/warnings. All 40 literal stops resolve.
Pure browser checks execute the exact uniquely bounded helper source region with
only installed Node TypeScript stripping, not a copied implementation. Full
helper import under the existing bare-Node alias hook fails on a same-name fixture
directory; that plumbing remains unexecuted and unchanged. Pure seam execution
does not qualify browser wiring, SQL or production behavior. Final check receipts
and the refreshed author trail accompany the committed latest-delta review input.
Distinct High exact-commit review and new Root-owned CI remain pending; status
stays in-review, with no delivery/DONE/release claim and an unchanged intent kernel.

### Latest-finding follow-up — actual SQL callback settlement

The distinct High review of committed `33b595a8b7c001bd89788fb1c0e8cd9c626e03ec`
reported one P2 custody defect; that assessment remains **not passed**. Installed
Playwright 1.61.1 races each expect.poll callback against its deadline without
joining an unfinished callback. The outer observation and HTTP body could finish
while the physical token/audit query promises remained active. Joining only the
outer observation therefore did not justify SQL/Auth fixture cleanup.

Root admitted only helper, existing unit and author Spec changes under the
recorded High route `author-native-poll-query-settlement-route.json`. The registry
now synchronously owns actual callback and query promises independently of the
poll wrapper. Its non-async tracker immediately observes the exact returned
promise; the non-async token/audit factories return it without another adopting
wrapper. Teardown closes registration before capturing and draining work, and
checks the latch again before invoking queued factories. Late poll callbacks
cannot launch SQL. Both physical query siblings and the actual poll callback
remain owned until real completion; the existing 20-second drain timeout retains
custody rather than crediting absence. The 15-second poll, original matchers,
physical attempt/hash/audit assertions and primary/all cleanup errors remain.
No wrapper, SHA pin, browser scenario, application, privilege or runtime changes.

Four new bounded regressions exercise the installed polling deadline with injected
SQL promises and successful HTTP completion, pending/rejected siblings, queued/
late launch refusal and abandoned synchronous/native rejections. They execute
actual pure helper source and the installed polling helper, with no SQL/browser
or managed resource. Previous 47/47 and 326/326 results remain historical33b
facts. Current bounded units passed **51/51**, zero failures/skips/cancellations;
full typecheck and focused two-file lint passed with zero errors/warnings. Final
42-stop/kernel/Git checks accompany the committed three-path review input.
The unchanged parts of the prior six-path assessment are reused explicitly;
new review is latest-finding/consequential-regression only, not a fourth broad
round or a whole-source PASS. All six failed native histories, fourteen browser
failures/28 attempts, 51 unexecuted DB cases and unavailable attachment content
remain unchanged. Fresh exact-head Root CI and distinct High follow-up review
are pending; status remains in-review without delivery/DONE/release claims.

## Executed feature failures: bounded fixture diagnostics and status fallback — 2026-10-20

Checkpoint `cba60486b5e695b9796ef39d4492bc7f569d517b`, run39483572143,
is a qualified seventh FAILURE history. DB2039 comprised1942 passed,45 failed
and52 pending; all51 story Vitest cases were attempted with7 passed/44 failed:
commands1/14 (INT015 passed), HTTP1/19 (API011 passed), components3/1
(COMP003 failed), and RLS2/10 (RLS002/009 passed). The45th DB failure was
the nonstory acceptance-table policy-set assertion. Browser31 comprised17 other
passes and14 story failures across28 attempts, zero skips/flaky results. Feature95
therefore reached37 passes/58 failures/zero unexecuted cases; attempted does not
mean every downstream assertion ran. Verify3123, separate bootstrap51, Python43
and recovery1 passed. DB child/key cleanup actually completed with no custody;
browser abnormal teardown retained key custody. Both original clients qualified
setup7/privacy4. INT015's actual restricted-session/bootstrap/ownership/absence
oracle passed; failed source RLS010/API019 cannot borrow that credit or the
separate recovery proof. Attachment28 metadata references had no available bodies;
content privacy remains unavailable, not passed.

First API001/INT001/RLS001 exposed only the owned helper's redacted aggregate,
not a structured leaf SQLSTATE or a proven RPC/permission/proof/schema cause.
The admitted proposal and distinct context-free High design review are preserved
under `native-feature-failure-repair-proposal/` and its sibling review directory.
The proposal SHA is `bc9456fd765d5c57c4a2a4445667aecc29d17199a1c88b8451ba4106c93954e7`;
the original design verdict SHA is
`58ba05c45f0b74bb33bd97120f2240c66e061076d16648adffd41d0af148f1cc`.
Those are design/proof provenance, not source or native acceptance approval.

The owned fixture now preserves only fixed stages and allowlisted own-data
SQLSTATE/category values at existing setup/cleanup catches. Depth4/node16
aggregate bounds have explicit cycle/truncation/unknown failures; native messages,
stacks, causes, query/params, accessors, result payloads and secrets are not copied.
Known safe errors preserve their finer owned stage through outer aggregation.
Pre-callback canonical setup stays a coarse stage: canonical auth/tenant/sign-in
message-only replacement has already lost code, canonical best-effort warnings
are not rejected outcomes, and rollback/DISCARD/finally may replace an earlier
error. Only errors actually reaching an owned catch can be retained. Missing
information remains UNKNOWN; no parsing of messages or invented original cause.
No four-RPC observer, extra `.then`, client/result modification, query/request,
pool, privilege, Vault or production public-handler change was introduced.

COMP003's actual first SSR assertion failed because an injected error state had
no runtime message. The existing live status region now falls back to the same
approved failure sentence used by mutation denial. Runtime messages still win;
unknown results remain blocked and require reconciliation before same-attempt
retry. No button, request, state transition, eligibility or success behavior changes.
The frontend-component skill, existing approved settings design and Phase B
Swedish error guidance were applied; no layout/token/visual-reference change.

Root's exact shared-case allocation is recorded in
`accepted-native-feature-policy-case-allocation.json` (SHA
`783151c5ec5320617e922ed87716ef192a18782f2945792cbed06fe8e6ea605d`).
Only the existing acceptance-table catalog case changes: all nine authenticated
policies across three tables plus one dedicated calendar owner SELECT on jobs
must match exact policyname/cmd/roles, ten rows total (four on jobs). No row/role
filter hides extra policies; DELETE, ALL, extra/renamed policies and broadened
roles fail. Its three queries, required-stack gate, fixtures and DDL are unchanged.
This newly allocated source path was outside source67 and protected37: the new
source union is68; the historical protection set and prior capsules stay intact.

Bounded local Node execution passed58/58, zero failures/skips/cancellations:
the previous51 plus seven new source-seam/catalog-assertion contracts. They prove
safe classification, descriptor/cycle/size negatives, retained reaching stages,
single invocation/value identity, upstream UNKNOWN limits and biting exact-policy
negatives with injected rows. They do not prove a native failing branch, SQLSTATE,
RLS, cleanup, browser or migration reset. The four existing SSR cases passed via
an in-memory Vitest configuration with `config:false` and `globalSetup:[]`;
there was no database/global setup or browser/server launch. Final full typecheck
passed; focused four-file lint passed with zero errors/warnings. The unchanged
5760-byte kernel and one49-stop author review trail passed their checks.
The first typecheck found one new test-only self-referential parameter annotation;
renaming that parameter corrected it without changing executed behavior. Previous
build/native results remain historical dependencies, not a new build or acceptance
result for the changed application bytes. All seven failed packets and old
capsules remain immutable; a distinct High latest-delta review and fresh exact-head
Root CI are pending. Status remains in-review, without DONE/delivery/release claims.

## Bounded diagnostic transport through the installed reporter — 2026-10-20

Eighth checkpoint `3e7b6131a00e6c7b4d25c49373d8ba1c1eefe42f`, run39492715549,
remains a qualified FAILURE history: full DB2039=1944 passed/43 failed/52 skipped;
story51=8 passed/43 failed/zero skipped (HTTP1/19, commands1/14, RLS2/10,
components4/0). The allocated exact policy-set case and INT015 passed. API019
and RLS010 failed without downstream predicate credit. Verify3130/Python43 and
recovery1 passed separately. Original setup7/privacy4 and actual DB readiness,
children[0,1], exact key deletion/closed connection/no custody were qualified;
these do not turn the DB result into acceptance. Browser31=17 other passes and
14 story failures across28 attempts, zero skip/flaky results; abnormal browser
teardown retained key custody. Attachment28 metadata references still had no
available bodies, so content checks remain unavailable/unqualified.

All43 fixture failure reports exposed only outer group messages, with no leaf
category/SQLSTATE tuple. Collector positive controls accepted two valid synthetic
tuples and rejected an invalid stage, while native input contained zero leaf-prefix
candidates and43 valid group markers. This establishes NOT_SERIALIZED, not that
in-process code was unknown, cleanup caused the failure or a SQL predicate failed.
All43 actual causes remain UNKNOWN_NOT_OBSERVABLE_IN_REPORT.

The installed Vitest4.1.9 runner's `failTask` unwraps exactly one AggregateError
level (`chunk-artifact.js:3055–3073`). Actual `processError` serializes its child;
`serialize.js:87–105` can retain nested own errors. The JSON reporter then selects
only each remaining error's stack or message (`index.UpGiHP7g.js:3573`), dropping
the nested leaf representation. The previous safe aggregate hierarchy therefore
hid leaves behind the primary group after that single unwrap. Its
canonical-fixture-cleanup group label was a container phase, not causal evidence.

Root's exact three-path admission is preserved as
`accepted-native-fixture-report-transport-repair.json`, SHA
`0df4bb27eecb06d59f970cd11de7bda8c2f78498039cf87f47bd678d6328e23e`.
Only the pure aggregate construction changes: after each existing guarded walk,
flatten module-owned already-sanitized child groups into ordered leaves. Keep
finer stages, primary/cleanup order, own-data allowlist, getter/proxy/cycle handling,
node16/depth4 budgets and explicit truncation/UNKNOWN. No native message, stack,
cause or arbitrary property is added. Operations, values, requests, RPCs, queries,
clients, pools, authority, result/settlement/custody, UI and the policy case stay
unchanged. Upstream erased/swallowed/masked errors remain unrecoverable.

The existing separate bounded Node file passed61/61, zero failures/skips/cancellations:
58 retained plus three actual installed transport controls. Tests extract the unique
installed `failTask` body unchanged, supply actual installed `processError`, and
invoke public `JsonReporter` against one synthetic task and an in-memory logger.
There is no Vitest run/collection/global setup, output file, SQL/auth/browser or
managed service. The old nested-shape negative reproduces a known in-process
leaf missing from JSON. The actual repaired pure source transports ordered known
42501, UNKNOWN and cleanup leaves while keeping one failed case. Hostile fields,
getters, inherited codes, cycle/depth/node limits and truncation retain safe output.
These synthetic controls prove transport only, with zero native acceptance credit.
Full typecheck and focused two-file lint passed with zero errors/warnings; final
kernel/Git checks and the single refreshed review trail precede the source commit.
Prior localSSR4 and eighth native component4 passes remain separately scoped;
this repair reruns neither. All eight failed packets/capsules and frozen inputs
remain intact. Distinct High exact committed three-path latest-fix review and
fresh Root exact-head native CI remain pending, without a fourth broad round,
DONE/delivery/release claim or claim to have fixed the43 underlying causes.

## Bounded owned scenario origins — 2026-10-20

Ninth checkpoint6dad/run39498246931 remains FAILED: story51 ran8P43F0skip;
fullDB1944P43F52skip, components4/shared policy/INT015 passed separately.
The repaired reporter now exposes44 ordered safe leaves across43 failed cases,
all scenario/unknown with unavailable SQLSTATE. These are explicit unknowns,
not evidence of a permission failure, canonical cleanup cause or an identified
original branch. Browser14 cases failed across28 attempts; unavailable attachment
bodies still receive no privacy credit. All nine failed histories stay immutable.

Root admitted exactly four already-owned paths under
`accepted-native-owned-origin-diagnostic-repair.json`, SHA
`76a6c87a3e87fac2b36b3b231b4de09461a691ae5ad2ca480e3f090d47a09d0a`.
Two family-only labels were insufficient. The matcher catch now immediately
registers a fixed owned assertion origin, keeping only newly constructed safe
source frames. Issuance guards distinguish already-consumed denied, unavailable,
conflict, replayed, unknown-noncommitted and committed-missing-url branches.
Existing token-route and HTTP catch guards emit closed owned origins. RLS001's
four allowed-subject assertions use compile-time own/admin/planner/mixed sites
through a synchronous once-call wrapper. No native error fields, matcher
arguments/actual/expected or original stack/message/cause are inspected.
All guards, loop order, calls/arguments/results/return identity, query/RPC/client,
privilege/authority, actual settlement and custody behavior remain unchanged.

These origins localize failed contracts, not underlying backend causes. Different
backend failures already collapse to denied/unavailable. Pre-guard seed/authority
failures and upstream erased, swallowed, unmapped or masked errors may still be
UNKNOWN. If unavailable/denied/uninstrumented UNKNOWN remains, record the exact
gap and require a targeted cause-proof proposal; do not assume another opaque
CI retry establishes a diagnosis or that all43 causes are fixed.

Current67 separate bounded Node controls passed with0 failures/skips/cancellations:
61 retained plus six live-source origin/caller controls. They execute the exact
first INT001/API001/RLS001 callbacks with injected stopping fixtures, exact guard
and matcher source, and installed in-memory runner/processError/JsonReporter.
Controls cover finite outcomes/sites, precise safe matcher frames, preceding and
no-later call order, once/value identity, hostile accessors, HTTP arguments and
upstream UNKNOWN limits. Synthetic callers prove neither actual SQL nor native
failure causes. Whole TypeScript and focused three-file lint passed; final kernel,
review-stop and Git checks precede the append-only exact four-path commit.
No managed runtime, Vitest runner/collection/global setup, browser, extra operation,
observer, client/then instrumentation, authority workaround or new build ran.
Fresh distinct High committed latest-four review and Root exact-head native CI
remain pending; no fourth broad review, DONE/delivery or release claim.

## Minimal Vite security patch after blocking audit - 2026-10-21

Tenth checkpointbe2/run39503939856 remains FAILED: install/frozen lock validation
passed, then pnpm audit --audit-level=high exited1 with1high/4moderate findings
and GHSA-587h-7wmj-h5pm. All later checks,95feature cases,67separate controls
and managed runtime were UNEXECUTED at that head. Earlier43DB/14browser failures
remain unresolved. The tenth packet/capsule and all predecessor evidence remain
immutable; the previous exact380 owned-origin High review passed without findings.

Root/Coordinator admitted exactly package.json's devDependencies.vite key,
mechanically required lock closure and this post-kernel author trail under
`accepted-native-dependency-audit-repair-allocation.json`, SHA
`61ce9199157fe35aaa2ce50e6c6bc67be221a3ebd8975fccc56b8f2f39d0f581`.
The exact Vite pin moves8.1.0 to8.1.6, the minimum patched release on the same8.1
branch according to the current reviewed advisory and official2026-10-06 release.
Its bundle includes launch-editor2.14.2; overriding a separately resolved editor
would not replace Vite's bundled2.14.1. This is an affected tool inventory and
remediation, not evidence that production Next exposes or exploited that path.

Actual pnpm10.24.0 lock-only --ignore-scripts resolution followed by frozen
--ignore-scripts materialization passed. No unrelated manifest/script/version or
lock settings/override/patch changes occurred. The required closure is Vite8.1.6,
picomatch4.0.7, rolldown1.1.5 with15 matching platform bindings, and rolldown's
@oxc-project/types0.139.0. Existing postcss8.5.23 stays fixed. Vitest4.1.9 and
mocker retain versions and resolve the same Vite8.1.6 via changed peer snapshot
keys. Vite's integrity is the actual registry/pnpm value
`sha512-aRAHIxx5SW5zc1sMqFwJU/t5qaFfXb5Hj0J7W0VXihu/X99+346tz6080tO1T1xVIJORX/b3zVTXGFqUXh35uw==`.
Installed bundle region markers confirm launch-editor and middleware2.14.2.
Vite's Nodeengine remains ^20.19.0 || >=22.12.0, compatible with existing22;
Vitest's existing ^8.0.0 range accepts the candidate. No schema/data/application,
privilege/authority/provider/secret/workflow/toolchain or workspace change occurs.
The new lockfile source path expands the authored union68 to69; protected109SQL
and37consumer files stay unchanged. Old installed dependency contexts remain
historical, not new-byte proof for the changed graph.

Actual post-materialization pnpm audit --audit-level=high passed exit0, reporting
2moderate findings and no high findings; no ignore, threshold change or retry was
used. Do not infer identities of the remaining moderate findings or claim all
advisories gone. verify:lockfiles, full TypeScript,67/67bounded Node controls
(0fail/skip/cancel), production Next build and built-bundle containment passed.
These controls retain61+6 with no new version-mirror tests, no Vitest runner,
collection/globalSetup or DB/browser execution. Full local pnpm run lint traversed
ignored retained historical Playwright report assets and was terminated through
only its captured command session (exit1); it is INCOMPLETE, not PASS. Focused
ESLint on the existing three calendar-feed fixture/control files passed with
0errors/0warnings. No historical report deletion, ignore/config change or blanket
warning attribution occurred. Clean-checkout canonical lint remains mandatory CI.

The approved5760-byte intent contract stays unchanged/in-review. One refreshed
review trail and native/staged Git checks precede the append-only exact three-file
commit. Fresh distinct context-free High review of the exact dependency delta and
Root exact-head normal CI remain pending. A successful audit permits later gates;
it does not establish compatibility of the full native feature, resolve43DB and
14browser failures, or qualify browser attachment content. No managed service,
local qualification, blind CI retry, fourth broad review, push, merge/deployment,
DONE/delivery or release claim is made.

## Staged denial cause-proof implementation — unexecuted diagnostic lane

Root admitted exact revision1 hunks in14 paths through
`accepted-native-denial-cause-proof-allocation.json` (5006B,
SHA256 `99bcc94753e87bb3efcf7fec730c88da4059ca450a4548286f47dbf20fdc63d3`).
The dispatcher is the sole addition to the previous69-source inventory (now70).
Historical109 SQL/protected37 consumers and every previous failure/capsule remain
unchanged. The approved intent contract is unchanged; status stays in-review.
The author recorded Sol6.1 High implementation under Root's admitted route;
independent committed latest-delta High review is pending, within the completed
three-round cap. This source grant launches no service, probe or CI run.

The minimal route follows the independently challenged staged design: ONE real
own-subject JWT management call with closed scoped branch observations, then at
most ONE corresponding ORIGINAL status or management function in a restricted,
rollback-only controlled SQL baseline. Normal calls have no trace store or log;
no generic client/RPC/thenable observation or public DTO change is introduced.
The scoped context closes and clears expected private identifiers after the real
command promise settles. The existing public-fetch pending set is not used as
proof that this command or a PostgreSQL query has ended. The dedicated baseline
checks the installed pg protocol ReadyForQuery boundary; timeout rejection alone
is insufficient. Unverified references retain fixture/key custody. This path
composes the canonical role fixture directly so an unconditional booking-fixture
finally cannot delete rows/Auth against outstanding diagnostic work.

The baseline keeps original function OIDs/source/owners/ACL and claims only a NEW
controlled direct-SQL result. Its original setup session is independently
qualified SupAdmin LOGIN+SUPER with all four effective privacy controls. The
same client changes only transaction-local session authorization/owned claims,
then proves restricted session=current authenticated/nonSUPER/nonBYPASS/owned
identity and privacy immediately before its single original-function call.
There is no function replacement/clone/role DDL/grant/fault DDL/Vault probe/new
endpoint. Full rollback precedes identity recovery, and independently qualified
fresh source/owned-state verification precedes normal fixture cleanup. Every
reaching primary/cleanup failure has a closed retained stage; inherited upstream
factory best-effort cleanup/message replacement remains outside that guarantee.

42501 remains AMBIGUOUS_SQL42501; engine errors, context/state/clock mismatch,
nonreproduction and cleanup uncertainty stop with named UNKNOWN/custody. No SQL
engine phase or historical JWT session/snapshot/proof equivalence is invented.
The current43 DB causes and14 browser failures are not fixed by this code. RLS010
later ACL predicates, API019 later telemetry checks and browser contentNULL privacy
remain uncredited. No automatic next probe or opaque full-suite retry is added.

The actual dispatcher persists diagnostic mode/SHA/nonce before its only POST,
uses a distinct title/status and preserves old normal/release records. It refuses
new diagnostic dispatch unless both hosted candidate/default workflow definitions
prove the supported exact input/admission contract. Root private-qualifier
adoption, availability, producer review/freeze and pushed-head prerequisites are
external gates, not proved by an environment flag. No default-branch update,
merge, provider mutation or alternate dispatch is authorized. A diagnostic run
has zero acceptance even if its selected jobs succeed. Normal full DB+pilot,
browser/recovery/release commands and the original inverse hash are preserved.
Only mode-bound, privacy-validated report copies enter the diagnostic upload tree;
unsafe originals are not deleted or uploaded. Failed native cases may upload
safe actual JSON; missing reports/refused content retain capture failure. Private
key custody identifiers are excluded from that artifact receipt.

Actual local checks: the initial seven-file Node execution was359 total,
358PASS/1FAIL/0skip/0cancel because the admitted existing Bash harness omitted the
three new environment defaults under set-u. After that harness fix, all361 passed
with0fail/skip/cancel. Two additional actual-source status/envelope controls were
then added, followed by the actual-source registration guard control; the final
changed Node file executed79PASS/0FAIL/0skip/0cancel.
The other six files retain their actual earlier passing bindings; no inferred
363-case combined run is claimed. The original67 controls are retained. These
injected lifecycle/source/driver-construction/real temporary-FS/installed reporter
controls have nativecredit0. Whole TypeScript, focused12-file ESLint
(0errors/0warnings), production Next build and built-bundle containment passed.
An attempted nonexistent verify:no-service-role-client-bundle script refused;
the actual verify:bundle-containment command then passed, with no build rerun.
Dependencies are unchanged from55db; native11 canonical audit/lint positives keep
that historical scope. No canonical local lint scan through retained assets,
native collection, DB/RLS/component/HTTP/browser execution or diagnostic baseline
was run. The source's normal95 acceptance cases and INT015 are unchanged;
DIAG001 is declared ONLY in explicit diagnostic mode and is not normal coverage.

## Exact-seven corrective diagnostic contract — 2026-10-21

The cb8 committed-delta High review is preserved as NOTPASS with two P2 findings;
its original packet remains immutable. Root's new exact-seven allocation
`accepted-native-denial-cause-proof-corrective-allocation.json` (4261B,
SHA256 `956b92aaaeda0d028a4c53e2b48c00b8f86916bae2523f069f28ce2363451079`)
admits the reviewed corrective proposal and visibility addendum. The earlier
F1 plan-sufficiency PASS without same-connection visibility is NOT ADOPTED.
This author executes the recorded sensitive Sol6.1 High corrective route; fresh
distinct committed latest-fix review remains pending, within the three-round cap.

F1 replaces the diagnostic caller's existing ONE final tenant-only absence SELECT
with same-statement executing current_user pg_roles SUPERUSER OR BYPASSRLS,
exact two owned tenant absences and exact ten known returned Auth user absences.
Exactly one row/three own data booleans must all be true. Missing, false, malformed,
getter/proxy or rejected observations retain fixed fixture-absence failure,
CLEANUP_UNVERIFIED and existing custody. The exact parameterized Auth/catalog
reads are newly admitted; no extra query roundtrip, HTTP request, connection,
principal or grant is introduced. BYPASSRLS does not supply a missing SELECT
privilege. The unchanged pool/DSN is not inferred to be SupAdmin or independently
qualified bootstrap setup. This proves only physical absence of known returned
IDs at the observation, not historical Auth responses or partial setup closure.
Canonical shared factory/admin SQL and all normal cases remain unchanged.

F2 records attempt before the actual launch boundary and actual adapter spawn /
pre-spawn refusal evidence independently of bounded done/exit codes. Started,
uncertain and positively not-created remain distinct, with childStarted true,
null or false respectively; later real spawn evidence cannot be erased by wait
or cleanup failure. Missing reports after started OR uncertain launch are
CAPTURE_FAILED. A no-start claim requires positive proof. Persistent safe error
listeners retain late adapter failures without native text escaping. Existing
captured identity/group stop, done/output drain, COMMIT and key-custody guards
remain; uncertain launch exceptions conservatively retain custody.

The separately admitted availability contract now requires fresh active/default
workflow path, blob identity and a strict structurally recognized root
workflow_dispatch declaration, while FULL diagnostic input/title/admission/argv
capability and reviewed-checkout identity stay required on the candidate. The
bounded recognizer refuses unsupported, nested, duplicate, quoted/comment-only,
block-scalar, alias and malformed event forms; it is not a general YAML parser.
The provider GET sequence and sole nonce/mode-bound POST are unchanged. Hosted
availability remains UNKNOWN until Root's later fresh checks, with no fallback,
default update, retry, acceptance or waiver. The unborn private qualifier must
consume the explicit new launch schema; producer source cannot adopt it itself.

Actual initial two-file execution:116 total,112PASS/4FAIL/0skip/0cancel.
Three controls initially bound an import.meta caller through Function syntax;
they now compile the exact current caller in an ES module. The fourth repeated
actual adapter-error control exposed once-only listener consumption, corrected
with a persistent safe listener. The corrected two-file run passed116/116.
Initial focused lint had one prefer-const error in new test plumbing, corrected.
After the final malformed-result control, actual seven-file execution passed
374/374 with0fail/skip/cancel:86 separate runtime/source/driver/FS controls,
30 dispatcher controls and258 existing consumer/enrollment controls. After that
run, the recognizer additionally refused flow/sequence aliases; the affected
dispatcher file alone reran30PASS/0FAIL/0skip/0cancel, with the other344 tested
bindings unchanged. No new combined execution is inferred. All earlier
79 and retained67 controls remain. Whole TypeScript and six-file focused ESLint
passed (0errors/0warnings). These injected actual-source seams and adapter events
prove caller/SQL shape, boolean and launch/capture/recognizer contracts; they do
not execute SQL/Auth, real child processes or hosted dispatch. Normal95 and
INT015 are unchanged. No app runtime bytes changed, so no new production build
was run; the earlier build retains its historical dependency scope. No native
collection, fixture, RPC/query, service, browser, provider or CI action occurred.
Kernel5760 bytes is unchanged; status stays in-review, ARR warnings and all11
failed native histories remain. All43 DB/14 browser causes remain unresolved.
No development-complete, release, delivery or diagnostic acceptance is claimed.

## F3 default plain-scalar refusal — 2026-10-21

The independent latest-seven review at52007b76 closed F1 and F2 but is preserved
as NOTPASS for one new P2 recognizer defect. A default event descendant such as
`inputs: x: y` passed the prior bounded subset even though colon followed by
separation is not valid plain YAML scalar content. Active registration/blob
identity and full candidate checks do not validate that default scalar. The
required pre-POST refusal therefore needed correction; no hosted execution,
acceptance or key-cleanup bypass is inferred. The exact report/attestation and
all prior input bytes remain immutable.

Under Root's recorded sensitive Sol6.1 High F3 route and existing exact-seven
allocation, only dispatcher, its existing unit file and this author trail change.
The same narrow structural recognizer now treats separated # as comment syntax,
then refuses colon-whitespace/end and adjacent unsupported plain-scalar mapping,
sequence/reserved leading indicators. It still accepts supported colon-without-
separation content and comments, and keeps existing quote/block/alias/duplicate/
nesting/sequence checks. No parser dependency, broader YAML capability, provider
GET/POST, durable intent, ref/SHA/capability, retry or default-branch change is
introduced. Malformed defaults stop before BOTH state creation and the sole POST.
F1 helper, F2 wrapper, CI pin and all their closed-review evidence are unchanged.

Actual affected dispatcher run passed31/31 with0fail/skip/cancel on its first
execution, including the actual reviewed recognizer and real checkpoint caller
against malformed defaults. Original30 controls remain. Whole TypeScript and
affected two-file ESLint passed0errors/0warnings. These pure/injected provider
controls are not hosted availability or native cause proof. Earlier374-before-
late plus30-after/344-unchanged remains historical composite evidence, not a new
combined suite at this fix. No additional broad unit/build/native run is claimed.
Single author SRO and5760-byte approved kernel are preserved; status stays
in-review and current ARR warnings remain. Fresh distinct High committed latest-
three review is pending within the completed three-round cap. All43 DB causes,
14 browser failures,11 failed native packets, unborn private qualifier and later
Root availability/admission/execution gates remain unresolved or pending.

## Dispatch-only preselected checkpoint correlation — 2026-10-21

Root's exact-three prerequisite allocation
`accepted-native-preselected-checkpoint-id-allocation.json` (2858B,
SHA256 `73c47ee40695bf48d9997d77dea8e8a1f1b5119f02abc56ef529278364e85398`)
admits an optional dispatcher identity input and its actual caller controls.
The recorded Sol6.1 High route is
fix-diagnostic-dispatch-preselected-checkpoint-id-interface. The source baseline
is checkpoint2524306ca9edd6079c23d205cf01268797288d89 with af5 producer bytes.
That checkpoint was pushed without a new native attempt: still11 failed native
histories, not12. All original reviews/capsules remain immutable.

The optional dispatch-only CLI --checkpoint-id and programmatic checkpoint_id
must be canonical lowercase UUIDv4 using the existing ID grammar. Supplied
values are read once and validated before every API; nonstrings, wrong version,
variant/case, malformed values and status/cancel selection refuse. CLI missing
and duplicate values also refuse. At the existing exclusive/fsynced pre-POST
state construction a valid supplied ID is selected; omission retains the exact
legacy randomUUID default. The same durable identity reaches the unchanged
checkpoint_id input, diagnostic/normal title and ownership checks. No callback,
transport hook, new payload field, workflow, schema, dependency, API or global
nonce/replay store is introduced. This is correlation, NOT GitHub idempotency:
a fresh Root UUID must never be reused after an uncertain invocation. Existing
record refusal, uncertain intent retention and zero redispatch remain mandatory.

Actual affected dispatcher execution passed35/35 with0fail/skip/cancel on the
first run, preserving prior31 controls. Six supplied/generated and normal/
diagnostic/release paths inspect the actual durable record AT the POST boundary;
refusals assert zero API calls. Whole TypeScript and affected two-file ESLint
passed0errors/0warnings; kernel5760 and single author SRO are preserved. These
injected API controls are not a provider dispatch or native test. No new combined
117/375, broad/full suite, production build or native acceptance is claimed.
Application/helper/wrapper bytes are unchanged; no needless build was rerun.

The reviewed P252 private helper/test remain immutable and UNEXECUTED. A later
new pushed producer head needs a NEW exclusive private preparation bound to its
full SHA and a fresh UUID, with rebound helper/test independent High review and
all existing pre-POST admission gates. This author neither edits nor executes
that helper. Fresh distinct High committed latest-three review is pending;
loop3, in-review/ARR warnings and no-DONE/delivery/release boundaries remain.
All43 DB causes and14 browser failures remain unresolved. No provider, native
query, CI, service, push, deployment or main merge occurred in this fix.

## Status-origin discriminator implementation — 2026-10-21

Accepted allocation accepted-native-status-origin-discriminator-source-allocation.json
(3505B/SHA256 e64d0f906325c904921caec9aec3c0c324244a1a07ed1871f40e5f3825f18b3d)
applies the frozen plan and revision1 without a functional permission fix. The
existing restricted status qualification SELECT adds eighteen fixed catalog facts;
management keeps its original SQL. Exact own-data booleans/one-row shape and true
identity qualification precede the same at-most-one original baseline call.
False facts remain evidence and do not suppress the call. No extra query,
connection, grant, RLS, function, principal or operation change.

The own-data ErrorResponse routine maps only to PLPGSQL_RAISE, ACL_ENGINE or
UNKNOWN: external reporting origin, never underlying cause or an exact guard,
especially after an inner error is caught/re-raised. No raw routine/error text,
stack, query or parameters enter the observation. The strict eleven-field current
wire adds statusDiscriminator:null or exact status-origin-v1 facts for a qualified
completed status baseline. Existing outcomes/settlement/rollback/RESET/fresh
checks/cleanup/custody and producer1000000-byte/private65536-byte caps are preserved.

Revision1 treats owner_tokens_select as TABLE_ACL_ONLY: false may coexist with
sufficient column access and is excluded from the other seventeen necessary
candidates. Root explicitly kept decisions/candidate fields and unused test-only
interpretation seams out of this producer. The future separately allocated private
qualifier must implement candidate counting/named UNKNOWN stops and actual consumer
controls; these remain UNEXECUTED. All-true seventeen plus false table bit is
accepted only as closed observation, never promoted to a cause. RLS/implicit
dependencies remain unmeasured. The original JWT and restricted baseline differ
in session/time/snapshot; all43DB/14browser causes remain unresolved.

Actual affected Node file93P/0F/0skip/0cancel, whole TypeScript exit0 and focused
four-file ESLint exit0/no warnings on this working source. Initial92-case run
91P/1F compared the existing null-prototype validator return to a plain object;
corrected to wire-value equality. Intermediate92-case runs passed separately,
not added to93. Source inspection corrected a draft SELECT-list comma before
final controls. Exploratory package-version lookup hit package exports restrictions;
actual pg resolution supplied the installed parser. Spec reader initially failed
on default Windows encoding; explicit UTF-8 repaired the reader before writing.

Current source-extraction/data-URL helpers use injected connections and actual
installed pg-protocol1.15.0 finite ErrorResponse frames. They prove local SQL
construction, once-call/parameter identity, strict/getter/proxy/false-bit/schema
controls and the exact existing producer-size boundary. PostgreSQL syntax/runtime,
inner cause, private interpretation and native acceptance receive ZERO credit.
No app build rerun for unchanged app bytes, no new normal acceptance (95 intact).
Fresh committed latest-delta High review/private adoption/Root execution pending;
in-review/kernel5760/broad-loop3/ARR warning preserved.

## Discovery-order unit correction — 2026-10-21

The qualified Linux Node22.23.2 full unit suite reproduced one local failure:
3178P/1F/0skip across3179 cases/103 suites. Installed Vitest discovery returned
the same six serial DDL files in a different order. The assertion now uses the
existing exact-partition check, preserving unique membership, parallel exclusion,
group0-before-group1, serial fileParallelism=false and all execution settings.
Reversed/shuffled discovery is accepted; missing/duplicate serial files still fail.
The installed scheduler probe still requires parallel teardown before serial work
and deliberately detects reversed-group interference. No Vitest config or runtime
behavior changed. This local reproduction does not establish the hosted failure
cause or fix the43DB/14browser failures.

Actual focused Windows and Linux runs each passed3/3,0F/skip/cancel. The final
qualified Linux full unit suite passed3179/3179 across103 suites,0F/skip/cancel/todo,
in35756.921857ms, using the existing private Node/native-binding overlay and a fresh
per-child TMPDIR. Prior Linux3178P/1F and Windows3178P/1skip remain historical runs;
these counts are not added together. Whole TypeScript and affected ESLint exited0.
The initial edit reader stopped on newline matching; the initial Spec reader then
included a newline outside the approved kernel. Both stopped before writes and
were corrected in the reader only. No app build rerun, source commit, native/API/CI
or resource launch occurred. Root commits after mechanical conservation and obtains
a distinct targeted committed-delta review before any justified fresh CI attempt.
In-review, loop3, kernel5760 and the historical ARR warning remain.

## Preparsed canonical actor adapter — 2026-10-21

Root's final actual-path allocation accepted-invoker-adapter-repair-final-path-allocation.json
records Coordinator completed turn01a15e00-ebe0-7aa3-89e8-bbabbe0cef59 / grant
exec-b79f271e-67cf-4508-919f-f42aa7f650b2. The sole CLI2.115.0 generation produced
empty20261021102723_calendar_feed_preparsed_actor_identity.sql; this author filled
that exact path without generation/rename. It follows E16reserved20261021102151.
Source union becomes71paths; actual local SQL census111. Old migrations and
protected109SQL/37consumers remain unchanged; no old capsule or private P2 edit.

The new migration is one atomic DO statement. It qualifies actual ordinary
postgres identity, existing SETtrue/INHERITfalse authority, the owner's seven
hardened attributes and exact original function sources/call counts/properties/
private entrypoint ACLs. It creates a postgres-owned SQL STABLE SECURITY INVOKER
adapter with empty search_path and SQL-standard RETURN auth.uid(), revokes PUBLIC
and JWT/runtime execution, and permits only feed-owner execution plus inherent
postgres ownership. It does not grant Auth namespace access, change auth.uid ACLs,
copy a claims expression, add SECURITY DEFINER or change role memberships/attributes.

Under a narrow transient public CREATE grant it SET LOCAL ROLE calendar_feed_owner
and replaces only status/manage/abuse through their actual pg_get_functiondef
with exactly3/2/3 auth.uid() substitutions. RESET restores the executor; CREATE is
revoked and effective absence (including PUBLIC/inheritance) asserted. The same
OIDs, owners, signatures, all other pg_proc metadata/ACL/config/volatility and exact
remaining source are checked. Helper prosqlbody, canonical auth.uid pg_depend,
private effective EXECUTE and postgres invoker ownership are asserted. Any error
fails the whole statement; no superuser/schema-owner fallback or partial success.

This choice follows the independently qualified invoker mechanism probe
(invoker-adapter-probe-qualification.json10184B/SHA256
f45092e068564833b91f5e42cc0feba1a991cbe74f4c69ab2e13d1cf89d82bb4):
actual restricted direct canonical lookup denied42501 while the first preparsed
invoker returned canonical identity/NULL, with revoked adapter EXECUTE denied and
same/fresh cleanup qualified. This is local engine feasibility ONLY, not the
production migration, current feature, hosted/historical cause or full95PASS.
[PostgreSQL17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html)
explains definition-time SQL-body parsing/dependency binding and preserved owner/
permissions on replacement; [SET ROLE](https://www.postgresql.org/docs/17/sql-set-role.html)
requires SET authority and changes command privilege checks. Supabase and Postgres
security skill guidance was read/applied. The changelog.md fetch could not be
rendered by the web reader; no changed Supabase SDK/CLI behavior is assumed.

The current wire is strict status-origin-v2, eighteen exact booleans replacing
owner_auth_usage with owner_actor_execute; canonical owner_uid_execute remains
necessary. The other seventeen exclude only TABLE_ACL_ONLY owner_tokens_select.
v1/mixed schemas fail closed. The qualification remains one SELECT; management
observations/call counts, routine classes, outcomes, settlement/rollback/RESET/
fresh checks/cleanup/custody and caps stay unchanged. The baseline catalog guard
now derives the same eight substitutions from immutable original SQL and refuses
unrelated source/owner/config drift. P2v1 helpers/necessity conclusions remain
historical, never current v2 qualification. Future v2 private consumer requires
Root rebinding/review/admission; no native activation is authorized.

Existing RLS010 now includes the exact actor helper and asserts postgres owner,
invoker/preparsed SQL STABLE/empty path/canonical uid dependency/private execution.
All original owner/publicCREATE/JWT/table/Vault negatives remain. No test/case,
INT015, timeout or skip was weakened; normal95 declarations are unchanged.

Actual checks: focused affected Node97P0F0skip0cancel first-run; after the final
migration pre-ACL guard, another affected97P0F0skip0cancel. These are separate
runs, not194. Whole TypeScript and focused five-file ESLint exit0/no warnings.
One final pure-Node run through the existing Node22.23.2 Linux native overlay
passed3183tests/103suites,3183P0F0skip0cancel in37.965s; output was RAM-only,
965928B/SHA256 c892ec25e4e5d01ad23021b2006bcd4728a23d35bca2680a9ed445a9ac58ad38.
Ubuntu24.04 was already Running; NODE_PATH/TMPDIR were per-child, quoted glob one
literal argv, no install or managed workload. The focused97 are included there,
not additive. No initial test/type/lint failure occurred in this batch.

Actual live-source controls execute v2 SELECT construction, strict old/mixed
schema refusal, adapted-vs-drift expected sources and the actual ACL query/RLS010
callback with injected facts; they cross-validate all three embedded original
bodies/eight substitutions against unchanged historical SQL. They do NOT compile
or execute PostgreSQL, prove migration atomicity/production permission behavior,
full DB/RLS/HTTP/browser acceptance or a new private v2 consumer. These require
fresh exact-head native gates and distinct targeted High review. No app build for
unchanged app bytes; in-review/kernel5760/broad-loop3/ARR warning preserved.

## Owner SET bad-row guard correction — 2026-10-21

Root accepted-owner-set-guard-repair-allocation.json2460B/SHA256
5397d8ef4735847bc24f02c51468b9514e8556c5ce0de64e9f465120b6134738
admits only the existing migration bad-row term, focused unit regressions and
this author trail. Coordinator completed turn01a15e28-ab3a-7f72-a08b-83e1deae410a /
grant exec-4512aade-5b61-4c42-ab89-ef82fffc2e3f. The failed checkpoint
93473f1208f5b883b560903faf10348c205d2211/run39587739462 and diagnosis remain
immutable. Three startup jobs observed the owner/SET guard P0001 before adapter
changes. Exact hosted membership rows and which OR term fired were not observed;
the parallel-grant explanation is source-backed inference, not native cause proof.

The old bad-row EXISTS rejected every owner-to-executor row lacking SET, even
when another existing direct grant provides SET. A valid PG17 creator ADMINtrue /
SETfalse / INHERITfalse row can coexist with a separate SETtrue grant. This patch
removes only `or not set_option` from that bad-row predicate. The separate direct
SETtrue/INHERITfalse existence check and effective SET check remain. ADMIN grants
no new exception or SET authority. Foreign inbound, outbound and inherited rows,
all seven hardened role attributes, effective USAGE denial and effective public
CREATE absence still fail closed. All function sources/eight adapter calls/OIDs/
owners/private EXECUTE/ACL/config/atomicity/v2/pin and other files are unchanged.
No new migration, privilege grant, membership, query, runtime or provider effect.

Actual new tests extract the current whole owner guard and its two membership
predicates, translate only a closed Boolean/equality grammar, and execute those
actual source expressions against injected non-null catalog rows/facts. The
parallel-grant positive case is rejected by the counterfactual old expression;
row-order/ADMIN variations and direct/effective SET, inherited/foreign/outbound,
publicCREATE and seven-attribute negative fixtures preserve the boundaries.
These controls do not execute SQL, pg_has_role or observe hosted catalog rows.

Actual affected pure-Node99P0F0skip0cancel first-run; whole TypeScript exit0;
affected unit-file ESLint exit0/no warnings. No initial failure in this batch.
The prior full Linux3183PASS and prior focused97 runs remain historical, not
rerun or combined with99. No app build for unchanged application bytes. Current
Spec/ARR stay in-review; the frontmatter historical warnings:[oversized] is
separate from canonical reader parse_warnings. Required fresh native exact-head
five gates/all95/separate recovery and distinct targeted High review remain
pending. Baseline3a1c3bc9, review-loop3, approved5760-byte kernel and all historical
ARR warnings/results are preserved; no fourth broad review or completion claim.

## Original-function refusal matrix — current admitted repair

Root accepted-original-function-direct-evidence-source-allocation.json2215B/SHA256
dc052ce7e080d91f88c1429a4a15dedf74eea80bcd449568eb3c716a27bad606 admits
exactly the existing original-function IF failure-message construction, focused
unit controls and this author trail. The frozen proposal11241B/SHA256
9856e25ba8240a2c0a116dcbd11571a4af568fa9893c79c46522b920e145fb48 and
its High PASS are PLAN ONLY; actual committed-source review remains pending.
Coordinator completed turn01a15e58-38e9-7a73-8d36-355b227f92cd / grant
exec-0ee731e8-304e-4300-a149-1f96351566a3 covers these bounds, not execution.

Actual native startup reported the original-function guard refusal; the failed
predicate/ordinal and cause remain unknown. All eleven local fixture predicates
were true and normalized public/global default entries equal. Neither observation
proves the hosted catalog, original application sequence or a production fix.
Replaying eight unrelated migrations was not selected. This change observes the
already failing invocation itself after refusal, with no functional correction.

The original IF, SELECT, exact target order, earlier guards and later DDL remain
byte-identical. Only its RAISE construction changes. If that unchanged IF refuses,
the message retains its fixed prefix and default P0001 and appends a closed JSON
calendar-original-function-guard-v1 object with ordinal1..3 and eleven fixed named
boolean-or-NULL checks. Positive complements of the existing predicates report
owner/security mode/volatility/language/exact config/effective caller execution/
unsafe ACL absence/exact body/call-count equality. No NULL coercion, raw source,
config, ACL/grantee/role/OID/claim/query/error payload or arbitrary message enters
that matrix. The compiler constructs fixed keys; no generic observer or new API.

The explicit observation effect is additional evaluation of those same bounded
catalog predicates only after the original refusal; earlier short-circuiting may
have skipped some. There is no added SQL statement, roundtrip or connection.
An unexpected expression error yields no qualified matrix and requires UNKNOWN
stop; it does not justify a guessed fix or repeat normal run. One false bit names
an observed invariant, not its drift/transformation/grantor cause. NULL, all-true
despite refusal, malformed/missing data, mixed source/run or uncertain transport
requires the frozen proposal's named stop. Future once execution/acquisition and
unexpected-success conditional effects remain separately Root-owned/unactivated.
No old collector was adopted or relabelled and no native effects occurred here.

Actual controls retain the previous99 and add3 affected cases: initial102 ran
101P/1F/0skip/0cancel because the privacy test treated the required exact_proconfig
key's substring as raw proconfig leakage. It now rejects the raw property name
specifically while checking exact keys/types and raw-value exclusion. Initial
whole TypeScript found one test-only index-signature annotation error; corrected
to an explicit Record type. An intermediate102 passed before that type-only fix;
final current102P0F0skip0cancel, whole TypeScript exit0, affected ESLint exit0/no
warnings. These runs are separate, never additive. A proposal filename lookup
first attempted .md; the actual frozen .json was then read/hash-verified; no
proposal/source write or execution resulted from that read failure.

The new test-only finite source evaluator extracts the actual IF and JSON
expressions, preserves SQL Boolean/NULL semantics for its bounded grammar, and
injects catalog/function results. It exercises all eleven false-bit/ordinal
mappings, all-true/no-emission, first refusal, UNKNOWN preservation, closed output
and source placement. Whole-migration inverse hashing restores exact prior bytes
when only the new RAISE is removed, covering original guard/targets/prior guards/
DDL and default error behavior. These are source/fixture controls, not PostgreSQL
parsing/execution, actual catalog-function results, native short-circuit/error
behavior or evidence of a specific original cause. The prior full Linux3183 and
native packets remain historical; no full unchanged suite/app build rerun.
Fresh independent targeted source review and separately admitted native evidence
remain necessary. Baseline3a1c3bc9/kernel5760/in-review/loop3/ARR warning preserved;
no fourth broad review, normal95 acceptance, new privilege or completion claim.

## Original-function owner ACL reconciliation — current admitted repair

The exact five-path allocation2899B/SHA256
f577b996e02755eb51d7536dbe903552a67b67efbdb18551ba2e08782305fb9a adopts the
frozen proposal26010B/ec7e512c7689ca17ef48ae661f01ef36b6069980233bdfc2672a8c79e0de5b79
and PLAN ONLY High validation11082B/bc5dedbbd6c1509ac7355c3e4312d779a4129e27082641ce4a2ba2759d1ec3bd.
This supersedes the prior section's current-source wording without changing its
historical evidence. Existing111 is conditionally editable only while no actual
successful adoption is known; discovery of success requires forward coordination.
Predecessor110 is immutable. Unknown hosted ACL entries/grantors and the original
failure cause are not inferred from this conditional ordinary-grantor witness.

The source now resolves all eight canonical functions, rejects missing/overloaded
identities, and compares complete exact body/signature/default/language/security/
config/owner/shape before ANY SET, ACL or adapter mutation. The original3 source
callcounts3/2/3 are also checked there. Raw ACL must be either exact standard D
(owner+PUBLIC), or that function's exact source-intended I (owner-only, owner+anon
for fetch, owner+authenticated for management/status/abuse). EVERY row must use
the actual owner grantor, EXECUTE and no grant option, including the mandatory
single owner entry. Missing/duplicate/extra/grantable/foreign-grantor rows or D+JWT
fail SOURCE_ACL_NOT_COMPARABLE before effects. No arbitrary legacy ACL is cleaned.

Only existing hardened owner SET authority performs eight narrowly targeted ACL
operations. RESET requalifies the ordinary postgres executor; unchanged non-ACL
pg_proc/definitions/OIDs/owners and role/membership/schema snapshots are compared.
Exact raw I and effective owner/JWT/service-role boundaries are asserted, including
inherited access. The COMPLETE original3 IF/refusal matrix then runs unchanged,
and its adapter metadata baseline is captured AFTER intentional ACL normalization.
The preparsed invoker, transient CREATE, eight substitutions and postconditions
are unchanged. One DO statement fails atomically; no role/member/Auth-schema/
default-privilege repair, superuser fallback, independent commit or swallowed error.

Existing RLS010 covers all four entrypoints and four transferred internal helpers,
adding subject+clock while retaining postgres-owned secret and actor. Existing
six read-only ACL queries expose only closed rawAclExact/ownerExecute/service-role
facts alongside the prior effective negatives. Purpose sets, owner/security/
volatility/search path, preparsed dependency, filtered secret and public CREATE
remain asserted. All95 declaration identities remain; no new case/skip/global
serial configuration or wrapper/SHA/status-origin-v2 change.

A separately named helper is invoked once BEFORE RLS010 row fixture setup. Its
future native effects are exactly two fixed read-only metadata commands, qualified
main+fresh SupAdmin connections, two UUID NOLOGIN roles, one private UUID schema
and one inert never-invoked function. Actual ordinary nonSUPER/noninheriting
session=current identity is asserted before source/bootstrap/ownership work;
owner identity is asserted before the ACTUAL production reconciliation fragment.
The representative status header uses the same source signatures/default/config;
the predecessor ACL commands are checked exactly before fixed-target adaptation.
The planned failure/no-op witness, forced savepoint rollback and successful owner
repair observe their own current invocation, not historical hosted causality.

All catalogs are uncommitted and UUID-isolated; no shared/production function ACL,
existing role attribute/membership or ordinary suite state is mutated. The RLS file
stays parallel. Snapshot comparison excludes other suites' unrelated UUID catalogs;
it covers the relevant existing eight functions and owner/executor/public authority.
The UUID schema CREATE is only a rollback-only fixture prerequisite, not production
public-schema lifecycle proof. The same qualified wrapper admission/stack/ledger/
function-owner/actual SupAdmin+privacy checks guard future execution; no generic
pool, guessed credential, alternate URL, new service or key is used.

Primary work closes at its deadline, actual query promises join, and protocol
ReadyForQuery is required separately from query_timeout before full ROLLBACK.
RESET/actual original identity/privacy and exact same/fresh two-role/schema/function
absence follow. Both dedicated clients close; every reaching primary and cleanup
failure survives as fixed redacted errors. Unverified rollback/identity/absence/
protocol/close retains the exact UUID custody in module memory until job disposal;
no DROP fallback or absence-by-timeout. A failed primary with verified cleanup
still fails without falsely claiming custody remains. RLS010 alone uses180s;
there is no global timeout or serial-mode change.

Offline verification retains all102 existing controls and adds8 source-bound
cases. Initial102:100P/2F/0skip/0cancel (old first-reset/whole-file inverse assumptions
needed the additive phase). Initial108:104P/4F/0skip/0cancel (exact marker, negative
fixture selection and setup-versus-restricted-operation harness assumptions).
Initial tsc errors were one relative test-env import, then one unknown type in
a unit fixture; corrected. These runs are temporal, never additive. A bounded
Spec read initially used Windows cp1252; explicit UTF-8 corrected that reader only.

Current finite SQL predicate controls consume actual source expressions, inject
catalog rows and cross-check all8 exact predecessor bodies. They cover complete
shape drift and D/I/unsafe ACL tuples; exact new-block removal restores prior111
LF SHA256 d0f75428527392aca0d2be34685d83c8d1169479f9c29ad6f5349c5a24afb919.
The older failure-message inverse still restores f788d507414dc32ecc45b37dcfa44a45ce01cc36da0417063f4e9da1549a3b91,
proving original3 guard/matrix, prior guards and adapter suffix unchanged. Actual
RLS callback and UUID operation/cleanup regions execute offline with injected
clients/results, including forced rollback, identity, drift, pending protocol,
primary plus ALL cleanup failures and custody negatives. These are not SQL parsing,
PG execution, pg_has_role/catalog results, native rollback or hosted cause proof.

Final focused commands/results are recorded in the SRO below. No full unchanged
Linux3183 suite or app build was rerun. Native SQL/RLS010/INT015/all95/recovery,
independent latest-delta review, exact-head CI and any current v2 private consumer
remain pending. No SQL, resource, Git mutation, commit or push by this author;
Root owns Git/bookkeeping. Kernel5760, baseline3a1c3bc9, in-review/ARR historical
warning and review-loop3 remain; no fourth broad review or completion claim.

## Post-ACL harness repair - six-path source-only continuation

Root admitted the six-path factory refinement in
accepted-post-acl-six-path-source-allocation.json (SHA256
fb3dc9097834391cc741cdb8f3d8b221c9fa32b1b122adeec128131c78c93eb4),
C1-C7 and reviewed F1 weak-client dispatch. The same-helper clarification permits
canonical composition to prevent the booking wrapper's unconditional cleanup from
deleting live refs. Root owns Git; this author makes no stage/commit/push/runtime.

H1 corrects the foreign caller's no-op tenant spoof. Every negative now changes
its caller identity, invokes one ordinary RPC, requires denial/no rows and an
exact physical no-change readback. Legitimate foreign self-management precedes
the negative baseline. H3 changes only the empty agenda structural check: visible
region, exact empty copy, unique visible keyboard link/href and settings/create
remain; populated A/B agenda visibility and all foreign/privacy checks remain.

H2 uses opt-in adminRetiredSession with the SAME configured pool/principal and
query-only callback. Default adminQuery/adminExec/adminSession/closeAdminPool
remain byte-equivalent after removing the added import type and appended opt-in
region. Exact weak-owned registration precedes callback exposure, including late
acquisition. Only registered-owned pool errors are contained; foreign/default/
other receivers/events retain original Node emit, listeners, monitors and throws.
Each acquired client gets one public release(true), after closing query admission.
Actual query promises, post-invocation drain, transaction status, callback and end
are bounded by20s operation/5s retirement. Frontend closure is never proof of
backend rollback, original identity, canonical restoration or physical absence.

Clock/subject/fetch operations preflight the same ordinary postgres session,
all7 owner flags, direct/effective SET without inheritance, schema grant authority,
exact canonical-or-owned body/shape/OID and raw/effective ACL before mutation.
Typed OID/regproc metadata is normalized in the existing SELECT; full nonbody
pg_proc metadata is retained for stable snapshots. One transaction grants only
needed transient CREATE, SET LOCAL exact owner, performs the bound replacement
or private clock read, resets postgres, revokes/proves effective CREATE absence
and stable metadata BEFORE COMMIT. Publication/retirement precedes independent
ordinary callbacks. Commit uncertainty survives later rollback. Reached primary
and ALL cleanup failures are fixed aggregates; unresolved SQL/protocol/identity/
restore latches custody within this helper module/isolate and blocks its later
seams and destructive cleanup. It is not job-wide containment. No new
execute grant/role/membership/attribute/pool/principal/migration is introduced.

Canonical composition uses existing exported createRoleAwarePhaseAFixture,
cleanupRoleAwarePhaseAFixture and makeAuthedServerClient. It reproduces private
bookings-atdd::seedBookingFixture's exact four profile tenant/user inputs, four
ordinary-client inputs and BookingFixture return shape, using the SAME membership
SELECT/profile INSERT/UUID ownership. allSettled joins siblings. The changed
withCalendarFeedFixture composition preserves normal and setup-failure cleanup
through the SAME export, but uncertain actual work/shared restoration retains
known canonical/Auth/row refs and blocks deletion. Upstream partial-setup erasure
or swallowed canonical cleanup cannot be reconstructed; known-ID absence checks
do not prove historical Auth responses or upstream partial setup. Six serial
files keep their existing once-after-parallel order; shared mutable seams remain
confined to their existing serial callers, pending separate native qualification.
vitest.config.ts group1/fileParallelism:false establishes ordering, but installed
Vitest defaults isolate:true and no local override. A later isolated file can
recreate this module; per-target preflight then rejects that target's drift, not
all possible retained different-target state. Therefore job-wide no-further-seam
containment is an explicit C4 source-interface blocker, not established by this
latch or frontend retirement. Any runner/partition abort/quarantine effect needs
a new exact allocation; no unallocated global workaround was taken.

Full affected offline command (before the final prior-fixture admission guard):
`node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts`
executed124:124P/0F/0skip/0cancel (11.743s), retaining110 and adding14 controls.
The later guard refuses/latches a new fixture while a prior shared owner state
is still held, including a nonreturned callback. Actual affected composition
controls were rerun:2P/0F/0skip/0cancel; the other122 unchanged controls are reused
from the124 run, not reported as a new combined126 or fresh final124.
Installed Pool/fake clients and exact live regions (TS/module wrapping only)
exercise owner operation/callback order, private read/full restore, unsafe
premutation refusal, SQL/COMMIT/rollback/reset/restore, pending custody,
canonical composition and actual RLS002/E2E002 assertions. Whole tsc noEmit /
incrementalfalse exit0 and five-file focused ESLint exit0/no warnings match
final code after the late admission guard and prefer-const fixes.
Initial attempts are nonadditive: factory4P/1F release interception timing;
owner seam0P/4F import.meta plumbing then2P/2F uncreated-pool cleanup;
composition/row4P/3F TS wrapper/injected UUID; combined122P/2F CRLF extraction;
first lint2 prefer-const errors. Corrected attempts are not native evidence.
The first Spec refresh reader stopped before emission on cp1252; explicit UTF-8
fixed that reader. Initial SRO check correctly found stale stops before refresh.

These are JS/query-construction/injected lifecycle controls, native credit0:
no SQL syntax/PG execution, privileges/rollback/backend closure or browser geometry
is proven. No SQL/integration/browser/resource/network/API/CI ran; no unchanged
full suite/app build was repeated. Applied111/predecessors stay immutable.
Normal95 declarations (30Node/51DB/14browser) remain. API019/privacy, E2E001,
flakies and historical native/browser custody remain open/UNKNOWN. Independent
sensitive latest-delta review and separately admitted exact-head native gates
remain. Kernel5760/baseline3a1c3bc9/in-review/ARR warning/loop3 remain; no fourth
broad review, delivery/development-complete or release-ready claim.

## C4 whole-run admission and conservative key custody - source/offline stage

Root accepted the exact six-path follow-up in accepted-job-wide-c4-six-path-source-allocation.json
(SHA2566c3c3833a1b6e92be008eff1324ea7ac99fbe2f88874f1d391197263375fb6d7),
after the frozen strict34 caller and C4-CONFIG01 plan refinements. The preceding
partial d661 handoff's per-module limitation remains historical; this stage adds
the admitted execution-boundary capability, not a hidden helper/global protocol.
No source CODEPASS, backend restoration, native acceptance or completion follows
from plan PASS or these offline controls. Root owns all Git/commit/checkpoint work.

Serial project bail1 propagates any uncaught test/fixture failure to the runner's
coordinator, preventing the next isolated serial-file admission. The unchanged
six-file once-after-parallel partition remains. Every selected project's inherited
configureVitest hook checks the full resolved two-project predicate before setup
or test imports. It rejects missing/extra projects, unsafe parallel configured
maxWorkers1/group0 isolation, changed parallelism/order, or missing serial
isolation/maxWorkers1/bail1. It does not confuse CPU/CLI-effective1 with the actual
parallel project.config.maxWorkers property. No scheduling rewrite/fallback/skip
or test retry/timeout change is introduced; unsupported settings stop before work.

Bail cannot see a swallowed whole-fixture rejection. The source contract therefore
requires the actual34 ordinary fixture calls (INT001-014/API001-020) to be directly
imported named bindings and top-level awaited ExpressionStatements in their exact
async test callbacks. Catch/finally-return/void/wrapper/alias/shadow/reassignment
and missing/duplicate IDs are rejected. Current caller code is unchanged. This
is a finite maintained contract, not a proof against arbitrary malicious JS or a
replacement helper/runner. Expected denials with verified fixture cleanup pass
normally. Failed/bailed/omitted cases are unexecuted, never passing coverage.

The existing wrapper now retains its exact UUID/name key after unsuccessful or
uncertain DB runtime: build/integration nonzero or signal, launch/readiness/wait
failure, cancellation including cleanup-time abort, or forced/unknown owned stop.
It does not DELETE or perform the key-absence readback on those paths. Bounded
owned stop and DB end remain; frontend closure is not backend/canonical rollback.
Healthy child0/verified stop keeps exact existing UUID/name deletion/readback.
Setup transaction collision/rollback, browser and diagnostic contracts remain.
The CI helper changes only the wrapper's LF source SHA pin. Actual controls require
identical projection for LF, constructed Windows CRLF and the raw checkout file;
raw Windows SHA differs while normalized LF equals the CI clean bytes. argv/workflow inverse
and all existing admission/provenance/normal gate conditions remain unchanged.

Actual final affected runs are separate, not additive:
- runtime unit file125P/0F/0skip/0cancel (11.748s), retaining124 plus1 new control;
- partition C4 subset5P/0F/0skip/0cancel (13.999s), including nine bounded installed
  synthetic children with no app/globalSetup/setupFiles/.env/SQL/network: healthy
  and CLI1 each3P/native0; uncaught/caught-inner each1P1F/native1 with no later
  file import/hook/body; five unsupported configurations native1 before any
  module/setup/test/report. Synthetic failures are expected controls, not native
  application failures or coverage. All children joined; each capped25s;
- final whole TypeScript noEmit/incrementalfalse exit0 and focused five-file
  ESLint exit0/no warnings. No app build/full unchanged suite or real collection.

Initial failures are retained nonadditively: first focused controls3P+3P; initial
partition installed5P; first full runtime124P/1F from hashing CRLF instead of the
contract's normalized LF source, corrected by SHA-only repin. First lint rejected
reserved test variable module; renamed before final5P/type/lint. Initial guessed
metadata filenames were corrected by exact directory inventory, with no effects.
Previous partial124 intermediate plus final affected2/122 reuse is historical,
not a new current aggregate. The current changes invalidate only their actual
source/dependency scope; old native runs are never promoted to the current head.

Successful acceptance still requires all95 unique story cases30Node/51DB/14browser,
full DB/RLS SUPABASE_TEST_REQUIRED1 and separate recovery1, zero required skips.
Current audited b459/run39637925040 remains failed12 DB, browser2 unexpected plus
4 flaky; API019/privacy/E2E001/custody remain open. Historical43DB/14browser facts
are preserved as history. No native/key/DB/resource/provider/CI/push effect occurred.
Applied110/111 and other cumulative sources remain conserved. Independent sensitive
cumulative/committed-delta review and separately admitted native gates remain;
Spec/ARR in-review, kernel5760, baseline3a1c3bc9 and loop3 remain. No fourth broad
review, Done, delivery, development-complete, release-ready or deployment claim.

## F1 ordinary transport uncertainty — exact-three source correction

Root's accepted-f1-three-path-corrective-source-allocation.json
(SHA2561de1b7b6a98fe39a38ee5b6ec76788d64b585d688a430714b18a5641b6f2070f)
and explicit finite dependency-port clarification admit this correction only.
Cumulative source22508ef's independent NOTPASS/F1 and original counterexample
remain immutable; this author does not close that independent finding.

A rejected ordinary fetch, body abort/timeout or unclassifiable HTTP completion
latches module-owned custody before emitting the existing fixed transport origin.
The latch survives a scenario catching the error and the tracker removing the
rejected promise. The existing actual-work drain now also refuses previously
latched uncertainty when pending0. Owner restore, unknown-window rewrite, fault/
barrier reference deletion and canonical/Auth cleanup retain their existing
custody guards. No rejection, frontend close or empty pending set proves backend
completion. The existing isolated-file module latch, strict34 awaited caller
contract, serial bail1/resolved-project admission and conservative failed-DB key
custody remain distinct layers; none is a new backend cancellation protocol.

For the existing trustedFetch dependency only, a finite fetch_calendar_feed RPC
view invokes the SAME anon.rpc exactly once with unchanged receiver/arguments,
awaits that SAME operation once, checks only its own data status descriptor, and
returns the identical result or rejection. Status0, missing/accessor/malformed/
unclassifiable completion or rejection latches custody BEFORE publicCalendarFeed
can erase the status into generic503. No client mutation, new client/principal,
query/RPC, generic observer or extra thenable subscription is introduced. Real
completed HTTP503 and RPC HTTP400/403/500/503 remain completed responses and do
not latch uncertainty merely because the public route reports503. Existing
response bodies, public results and ordinary expected denials stay unchanged.

Actual final affected command: node --experimental-strip-types --import
./tests/support/register.mjs --test tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:
131P/0F/0skip/0cancel in11.859s. The125 existing declarations remain, with the
existing HTTP test adapted and six new controls. Actual source extraction uses
unique boundaries and TypeScript stripping; installed Postgrest2.108.2 receives
an injected fetch, while the actual public function has fixed memory-only
configuration and the actual trustedFetch wiring. No HTTP/SQL occurs. Controls
prove caught-inner transport custody before restore/later seams, body failure,
status0-before-erasure, same receiver/arguments/result/rejection identity, hostile
status descriptor/proxy privacy and healthy completed-error restoration. Existing
actual canonical-composition controls separately exercise custody-conditioned
row/Auth/absence suppression; they do not constitute a native whole-fixture run.

Initial affected full run131:127P/4F/0skip/0cancel is preserved, not additive:
three controls hit a whitespace-mismatched exact-source tracker anchor; the
fourth hostile proxy rejected JavaScript Promise assimilation's required then
access before the status check. The harness now matches actual source and permits
only that protocol read, retaining hostile arbitrary payload/accessor checks.
The intermediate selected7P/0F/0skip/0cancel and final131P are separate runs.
Final whole TypeScript --noEmit --incremental false and two-TS focused ESLint
both exit0, zero lint warnings. No app build, broad unchanged suite or integration
collection was repeated. Prior125 runtime/partition5+nine synthetic children are
historical unchanged-dependency evidence, never a new combined count.

Normal95 enrollment remains30Node/51DB/14browser. Current normal DB/RLS/direct
recovery/essential browser/API019 privacy and independent sensitive F1 closure
remain pending. Actual audited b459 failures/custody and older histories are not
promoted to current success. Applied110/111, other source and Root bookkeeping
are conserved; Root owns all Git. No SQL/resource/network/CI/key/provider/push
effect occurred. Development complete=false, release ready=false, in-review,
baseline3a1c3bc9 and completed broad-round counter3 remain unchanged.

## NUDGE004 / E2E001 original-boundary labels — exact-six source handoff

Root's accepted-source-label-six-path-allocation.json and independently validated
boundary-state-refinement admit fixed labels only. The initial plan NOTPASS and
PASS_PLAN_ONLY_LABEL_01_02_CLOSED remain immutable; plan PASS is not code review
or native execution. The previous F1 source/controls are retained unchanged.
This stage does not select a product/SQL cause from the qualified truncated R1.

Only NUDGE004 opts into one bounded context shared by its enclosing test catch,
withTimeReportFixture and withNudgeRecipients. Fixed source sites identify the
existing recipient/assertion/cleanup operations; the outer helper tracks callback
entry, original clients Promise.all, report callback/cleanup/composition and the
existing withBookingFixture await. A rejection before callback entry or after its
return stays OPAQUE/UNKNOWN. For an observed inner failure, only reference equality
with the final rejection is reported; factory=UNKNOWN always. No error, cause,
message, stack, expected/actual or identity is read by the label code. The exact
final error is rethrown, including opaque outer cleanup overriding inner failure.
Original primary/ALL cleanup ordering, same clients/arguments and all27 recipients
remain. Healthy opted-in and default callers emit nothing. A throwing sink cannot
replace the test error;16 lines maximum,512 ASCII bytes per line/8KiB per case,
with overflow/diagnostic failure recorded UNKNOWN, never accepted as cause proof.

Only E2E001 opts into separate create/rotate/revoke records, ordinals1..3.
Registration, successful request/response matching, readback, optional native
completion and observation result are independent. MATCHED comes only from the
existing successful waiter finish; no-op final cancellation cannot overwrite it.
Never-invoked work remains NOT_STARTED; absent completion is NOT_APPLICABLE.
Readback success followed by cancellation can coexist with observation CANCELLED;
native completion failure/pending never inherits earlier create success. Original
scenario-site snapshots are emitted before later cleanup labels. State notes use
only existing predicates/finish/cancel/continuations; no extra .then/catch observer,
query, waiter, timer or async work is added. Native/JS settlement labels are not
backend rollback/restoration or cleanup authority: actual pending/cancellation/
transport guards and custody remain unchanged. Existing public/browser assertions
and timing are unchanged; no DOM/URL/request fields enter these fixed labels.

Actual final affected Node file:146P/0F/0skip/0cancel in12.268s, preserving prior131
and adding15 controls. Exact source regions are extracted/TypeScript-stripped,
with injected ordinary dependencies only. They cover pre-booking failure, clients,
inner/outer cleanup precedence, report cleanup aggregation, final test catch,
27 recipients/nine seeds/ordered cleanup, sink throw/hostile getter/budget/silence,
mixed/concurrent browser records, cancelled/failed unmatched request versus matched
response, never-started work, readback/native failures, optional completion,
receiver/args/result/safe-error identity and once-call behavior. AST controls compare
both callers' actual original assertions against baseline166cad and prove one opt-in
each. Source counts confirm no added Promise observer/timer/RPC/adminQuery.

The unchanged actual strict34 guard plus catch/finally-return/void/wrapper/alias/
shadow/reassignment inverses execute separately:2P/0F/0skip/0cancel (0.737s).
NUDGE's outer catch remains outside that finite calendar caller predicate; the
calendar API/INT source/caller contract is not relaxed. Final whole TypeScript
--noEmit --incremental false and five changed TS ESLint exit0/no warnings.
Native diff/reader/kernel/SRO checks bind the final source handoff.

Initial new subset12:11P/1F is retained, not additive: the injected recipient
fixture omitted tenantA, failing before its real source seed path. Corrected
subset14P is separate. An intermediate TypeScript run found two unit-only typing
issues (assertion narrowing to never[] and omitted NODE_ENV in the isolated Node
child's typed env); both were corrected. Intermediate146P runs predate the final
original-site emission/sink-negative/finite-boundary wording refinements; only the
final146 result above binds these current TS bytes. No unchanged broad full suite,
app build, Vitest application collection/globalSetup, SQL or browser was executed.

The installed Node test-runner stdin control proves fixed labels reach that pure
child's captured stderr while its intentional fixed error still fails the child.
The child is bounded/joined and writes no test files. It does NOT prove native
Vitest/Playwright reporter/log transport, hosted publication or browser geometry;
those remain explicit targeted reviewer/native comparison stops. The fixed error
has no secrets, and no raw artifact/error payload is acquired or reconstructed.
Normal95 (30Node/51DB/14browser), all real27 recipients and original assertions
remain mandatory. DIAG001 is unchanged and cannot substitute a filtered run.
A future ONE changed-information comparison requires distinct code PASS plus
separate Root/Coordinator effect admission; no automatic retry follows labels.
If still inconclusive, stop at the exact missing fact/owner/resume condition.

Current source census75 derives the old73 source vector plus the previously
explicit NUDGE test (historical report-location74), and the newly admitted changed
time-report helper. This source census addition does NOT expand the immutable
historical report-location allowlist. All110/111/predecessors and other contexts
remain conserved. Root owns Git. Current causes/custody UNKNOWN, nativeacceptance0,
in-review/baseline3a1c3bc9/counter3 and the approved5760-byte kernel are preserved.

## SOURCE-LABEL-01 — retain evaluated relation through the final test catch

Independent source-label-committed-delta-high-review at committed5d5ea4e is
NOTPASS_SOURCE_LABEL_01 (report SHA256
905f3d2ac181f0597ac7afacd76d28657e48d2822d8fe2264128671fbdf5d557).
Its counterexample and the old68249-byte/e9df41e6 author receipt remain immutable.
The original bounded labels did preserve ordinary errors, but falsely emitted
NO_INNER_OBSERVED from LOCAL/TEST_FINAL without evaluating absence. This section
records only the admitted diagnostic-integrity correction; no application cause
or SQL/functional fix follows and the independent finding is not self-closed.

The same context now starts finalRelation=UNKNOWN. Only the outer helper's
existing matched/different reference comparison or established before/after
callback absence updates that relation. TEST_FINAL reuses the evaluated fact;
LOCAL and other unevaluated snapshots emit UNKNOWN without changing it.
NO_INNER_OBSERVED is reserved for the helper's actual no-observed-inner outer
branches. Existing factory=UNKNOWN, error object/cause/precedence, cleanup,
clients/operations, sink bounds and overflow remain unchanged. The actual NUDGE
catch and both browser sources require no edits; the context carries the fact
through that same existing final catch. No error properties are inspected.

Actual focused command uses the existing Node runtime-unit file with pattern
actual opted-in outer nudge|actual nudge clients|actual nudge labels|actual enclosing
NUDGE|actual labelled recipient|actual recipient cleanup|SOURCE-LABEL-01:
8P/0F/0skip/0cancel in0.271s, first run/no initial failures. The two new controls
compose the actual helper AND actual NUDGE004 enclosing test catch for SAME
clients rejection, DIFFERENT outer-cleanup override, genuine absence before
callback and after callback return, intermediate LOCAL/unestablished TEST_FINAL
UNKNOWN, unchanged final identity and cleanup ordering, and sink failure.
Six retained directly affected controls execute in that same selected run.
Whole TypeScript noEmit/incrementalfalse and two changed TS ESLint exit0/no
warnings. Final native diff, canonical reader, kernel and single SRO bind the
handoff. No unchanged full suite/build or native SQL/browser is rerun; prior146P
and separate C4 guard2P are historical unchanged-scope evidence, not a current
148-test aggregate. Prior initial11P1F/type-error history remains nonadditive.

Source-only working changes are time-report helper, existing runtime unit and
this author Spec, within the original six-path claim. Root owns all Git. Current
75 source rows are resampled; historical report-location74 is not expanded.
All111 SQL/predecessors and other contexts remain immutable. No external effects,
current codePASS/native acceptance or development/release completion is claimed.
Same independent High corrective review and separately allocated exact-head NORMAL
comparison remain required; Node3222/Python43 are historical separate positives,
DB16P/35unexecuted (API019/INT015), browser10expected/1flaky/3unexpected and custody
UNKNOWN remain open. In-review/baseline3a1c3bc9/counter3/kernel5760 are preserved.

## NUDGE004 public Vitest metadata carrier — source-only prerequisite

Root's source-label-normal-comparison-readiness identifies an actual transport
gap: the unchanged wrapper drops these closed console lines and native Vitest JSON
does not carry captured console output. Installed Vitest4.1.9's public TaskBase.meta
comment explicitly promises JSON preservation; public TestContext.task is
Readonly<Test> with nested custom metadata. Its actual JsonReporter.onTestRunEnd
serializes t.meta when filterMeta is absent. No wrapper/filter/workflow change or
new artifact/stream is needed. SOURCE-LABEL-01 is independently source-closed;
its original NOTPASS and corrective receipt/review remain immutable history.

Only the existing NUDGE004 public callback receives task and injects a synchronous
sink into the unchanged createNudgeFailureLabels emitter. It creates only its
reserved meta.calendarSourceLabelsV1 slot, only on a valid failure label. The sink
accepts canonical primitive ASCII strings for the source-bound NUDGE004 case/site/
boundary/relation/factoryUNKNOWN/booking boolean/progress enums in exact order.
It rejects unknown fields/enums, malformed/over512/non-ASCII/nonprimitive inputs
and impossible source relation combinations. No arbitrary native error/task/
message/cause/stack/expected/actual/identity/SQL/DOM/URL enters the carrier.

The context owns only newly created frozen arrays, replaced with defensive
primitive copies after checking the exact prior owned slot descriptor/identity.
Preexisting or changed foreign slots are refused without overwriting. Plain/null
metadata prototypes only; reserved accessors/custom prototypes and recording
failures fail closed without native getter reads/output or error replacement.
All other metadata stays unchanged. This is NOT a sanitizer for generic Vitest
metadata: a preexisting foreign payload remains its owner's value and cannot be
claimed safe merely because this sink refuses it. Tests distinguish this limit
from hostile producer input exclusion in an otherwise empty owned namespace.

At most16 records of512 ASCII bytes each/8KiB label values are accepted; the
existing emitter's final overflow UNKNOWN record survives unchanged. A direct
carrier overcount is refused within16. Arrays cannot be changed by later producer
input mutation, and no complete/absent/nativePASS interpretation follows from a
missing/refused/partial field. Healthy/default paths create no reserved key/output.
Sink refusal, frozen metadata and foreign-slot failure preserve the exact ordinary
exception/cause/outer cleanup precedence, clients/operations and cleanup order.
Existing Playwright stderr transport and time-report helper are unchanged.

Actual final focused controls:13P/0F/0skip/0cancel in0.976s. Four new carrier tests
and nine retained affected source controls execute actual extracted helper and
actual public NUDGE004 callback with synthetic task.meta. Before/after-callback,
inner SAME/outer DIFFERENT and TEST_FINAL relation reach the REAL installed
JsonReporter.onTestRunEnd; only writeReport is overridden to capture JSON in RAM.
The exact assertionResults.meta field owns byte-equal valid strings. Unknown/
secret-like producer fields, primitive/prototype/accessor/oversize negatives
publish no owned field; foreign-slot refusal preserves foreign identity rather
than claiming generic serialization sanitization. Frozen/copy/descriptor/16-record
controls, unchanged original errors/cleanup and healthy/key-absent paths pass.
The caller's original assertion ASTs and exact opt-in remain checked.

This is real installed reporter serialization proof with synthetic pure context,
not a test runner/collection/globalSetup, application SQL/Auth/HTTP/browser run,
hosted native publication or original backend cause proof. No writeReport output
file is created; no other reporter implementation is substituted. Final whole
TypeScript noEmit/incrementalfalse and affected two TS ESLint exit0/no warnings.
First selected13P, then the final13P after adding the direct carrier cap control,
are nonadditive; no initial test/type/lint failures in this prerequisite. Earlier
146 and SOURCE-LABEL-01 selected8 remain separate historical evidence, not a new
152-test/full-suite aggregate. No unchanged broad suite/build/native run repeated.

The initial guessed direct @vitest/runner symlink type path was absent; the exact
installed4.1.9 package path was resolved through Vitest's own module resolution.
Both installed reporter source and public type declarations are hash-bound in the
new ignored author receipt. Existing code contexts/111 applied migrations and
75-row source closure are conserved except the exact three admitted source paths;
historical report-location74 stays unchanged. Spec kernel5760/baseline3a1c3bc9/
in-review/counter3 and existing native UNKNOWN/acceptance0 remain. Native carrier
publication requires later independently qualified exact-head evidence; source
review and separate one-NORMAL effect admission are still prerequisites, not a
current run/UUID or automatic retry. Root owns all Git and external effects.

## Qualified NORMAL unit portability correction — bounded source handoff

At clean metadataHEAD177559a5/sourcea459 and historical pushed3a385df5, the two
declared candidates both passed on Windows before edits. Running exactly those
two on the already-running qualified Linux Node22.23.2 overlay failed before
assertions: their runtime Git commands could not resolve this Windows worktree's
Git pointer. This is a controlled local failure, not the unknown hosted exception.
The current verify checkout also lacks a full-history declaration, so requiring
historical166cad1c objects at unit runtime is an additional source-supported risk,
not an observed hosted diagnosis.

Both original invariants remain enforced without Git execution: the operation
vector7/8/6/5/14/2 and ordered assertion AST fingerprints260/268 were independently
derived from the actual reviewed166cad1c Git objects, not current-to-current
comparisons. The exact historical blobs and whole-body hashes are in the new
ignored author receipt. Assertion extraction/whitespace normalization and operation
patterns are unchanged. Added-operation controls for all six patterns plus altered
existing/extra assertion controls must fail the same verification. Existing default
silence and exact NUDGE004/E2E001 opt-in checks remain. No production, helper,
metadata-carrier, authorization, clock, custody, cleanup, timeout, workflow or fetch
policy changed; no skip, fallback or history fetch was introduced.

Actual temporal evidence: pre-edit Windows2P/0F and Linux0P/2F; corrected selected
Windows2P/0F; then the ENTIRE affected file on qualified Linux152P/0F/0skip/0cancel
in18.223s. These runs are separate/nonadditive, not a new full3243 or native PASS.
Whole TypeScript noEmit/incrementalfalse and affected unit ESLint exit0. Kernel,
reader and review stops are checked on the final source. Root owns Git and future
independent targeted review/exact-head execution. Development complete=false,
acceptance0, in-review/loop3 and all prior failure/review/receipt records remain.

## Series current-conflict protocol forward correction — source only

Root independently admitted the forward correction and actual generated filename.
Installed Supabase CLI2.115.0 version/help/new-help preceded exactly one
`migration new booking_series_current_conflict_protocol`. It produced empty
20261022002335_booking_series_current_conflict_protocol.sql (SHAe3b0c442...);
Root's completed clerical substitution retires reserved000847, with no rename,
duplicate generation or historical edit. The117th file is new; all116 predecessors
remain immutable. The skill's live-query/network recommendations do not expand
this explicit source-only/no-network/no-SQL allocation.

Effective source is derived in chronological order, not copied from an old
finalizer: snapshot comes from20261019180000, finalizer from20261019220000, then
20261020180000's exact one-match refresh replacement composes
`booking_conflict_refresh_internal(p_tenant_id,output)`. Effective prosrc hashes:
snapshot2032B/de57810a4ef7fd45ef5d4c7b4b8f8aee322b145d8dae8c6e6fe35e62331ad974;
finalizer14472B/87cd4e1062df816bc060069404d25e71f3e7744188a2387fe89936b339a218bc.
No later historical source reference changes those two targets.

The single atomic DO qualifies both exact prosrc bodies before DDL. Embedded
references are canonicalized to LF only; actual catalog bodies must equal that
reference or its complete CRLF counterpart. Mixed/bare-CR/unrelated bodies refuse.
Actual prosrc is never normalized: its original bytes are saved, only the two
version literals are substituted, and postflight requires that exact raw-style
result. Finite LF/CRLF/inverse/changed-body controls are source evidence only. It derives
CREATE OR REPLACE from actual catalog definitions and substitutes exactly one
enginev3→v4 and configv1→v2 per target. It then checks exact resulting body and
all non-prosrc pg_proc attributes/OIDs, including owner/ACL/security/volatility/
defaults/search_path. Unknown body or changed metadata refuses atomically. No
DROP, grants, role/membership or Auth changes are added. The effective common
refresh, accepted/resolved/reopened conflict behavior, locks, replay/idempotency,
proof domains, signatures and freshness guards stay intact. The resolver's own
separate compatiblev3/v1 protocol is unchanged.

The new pure tests reconstruct effective predecessors from actual historical
source plus the actual resolver regexp. They require the new migration's bound
bodies, inverse only its two literal substitutions and retain shared refresh;
protocols derived from the actual forward SQL producer pass the real TS preview
boundary while historical SQL versions fail. Existing digest/claims/freshness/
role/foreign/protected/DST/cap/review negatives remain. The existing REAL004 DB
case gains assertions over actual returned SQL protocol, call bindings, fact hash
and2minute lifetime, with no additional RPC/query or new case/skip. It is UNEXECUTED.

Actual local evidence: first39P/2F was the new source-reader missing dotAll on
multiline function headers; corrected reader only. Intermediate41P preceded the bounded newline
correction; final affected42P/0F/0skip/0cancel, whole TypeScript and two-file ESLint exit0; native diff/reader/SRO checked.
No full suite/app build or PostgreSQL syntax/migration execution was performed.
Inverse/source/metadata assertion controls are not native metadata preservation
proof. Independent targeted High review and Root's future exact-head qualification
remain required; no fourth broad pass or acceptance/completion claim.

Parent READONLY browser conclusion remains separate: qualified closed tuples show
cleanup-lifecycle timeout and retained/unverified custody, not a primary cause.
Readback success does not prove native HTTP completion. Existing completion waits
request.response() then response.finished(); labels do not distinguish these two
awaits. No browser change/GET/retry is authorized here. A future separate proposal
could add finite completionPhase/scenario-state labels at existing awaits while
preserving all operations/guards/caps, plus separately allocated private parser
v2 compatibility; legacy labels would leave new facts UNKNOWN. This is proposal
only, not implemented or a justification to retry NORMAL blindly.

The distinct targeted review of cb65 returned NOTPASS for SERIES-PROTOCOL-01:
active REAL011 still required obsolete v3/v1 after the new SQL producer and real
TS guard agreed on v4/v2. Its original review remains immutable. The finite
correction changes only that positive expectation to the same actual current
constants used by REAL004. Exact inverse restores the prior integration source;
all per-job null/empty, digest, stale-review and physical no-change assertions
remain byte-identical, as do skipped historical scaffolds. Migration02335 and
series-plan unit bytes remain exactly cb65. This is a test-contract correction,
not a runtime proof or a diagnosis of the hosted first throw. Prior42 source
controls/LF-CRLF inverse evidence are reused by immutable provenance, not rerun.
Affected lint/diff/reader/SRO are checked; targeted independent closure and native
SQL/integration gates remain pending.

## Browser v2 finite completion observability — source only

The earlier browser proposal above remains historical to the SQL repair. Root's
separate completed allocation now implements only opt-in001,007 and010-revoke;
010-rotate and all other cases remain silent. No browser/SQL/network/CI or private
collector execution accompanies this source change. Applied117 SQL files and the
series unit/integration closure remain unchanged.

The producer emits calendar-source-label-v2 within its owned namespace. Existing
request.response() and response.finished() awaits retain their order/call counts;
completionPhase is assigned RESPONSE or FINISHED immediately before those awaits,
and DONE only after the existing successful result. Null/failure/pending retains
its actual last phase and separate completion state. Scenario state surrounds
only the existing run callback. Neither readback success nor JavaScript settlement
becomes backend completion, rollback, cleanup or custody proof.

PRE_CLEANUP is copied before existing fixture teardown; setup failure uses the
existing outer finally boundary. FINAL is copied by the actual enclosing selected
case catch, after its existing cleanup, including007's outer context cleanup.
Those catches rethrow the identical final error. Only final failures publish;
normal successes remain silent. Registered action rows only are included;
no-registration yields one summary, missing/malformed/duplicate boundary yields
one UNKNOWN replacing its affected snapshot. Snapshots are immutable and remain
independent as later action/cleanup state changes. Sink failures cannot replace
errors, change cleanup or add retries/observers/queries/timers/awaits.

The actual producer controls yield at most28 browser records over actions3/2/2,
two snapshots and two attempts, plus unchanged NUDGEv1 max16 =44 below global48.
Each record is canonical ASCII <=512 bytes and <=6 rows per selected attempt,
within16. The previously parent-executed real assembler proposed-envelope proof
measured26913/32768 bytes with8 worst unit failures/maxmetadata (margin5855),
old48-slot28194 reconstructed. That is inherited envelope evidence, not proof of
a current private parser: separately owned browser_labels v2 matching/review is
still required; historical v1 new fields remain UNKNOWN. No private operator was
edited, invoked or rebound by this author.

Actual final affected unit file:157P/0F/0skip/0cancel. Existing operation vector and
ordered assertion fingerprints remain; new actual-source completion and selected
case callbacks cover pending/failing/successful awaits, null, scenario/cleanup
ordering, same final error identity,007 cleanup override,010-rotate silence,
immutable mixed records, exact28+16 cap and hostile/sink inputs. Source extraction
and injected I/O prove only those offline boundaries, not live Playwright/SQL or
native report publication. Initial156P preceded test-only TypeScript narrowing
corrections; a later added injected fixture had a missing brace and failed to load,
then was corrected. These attempts are nonadditive; final whole TypeScript and
three-file lint pass. Required native/independent gates remain open, acceptance0.

## Effective job-card shared-refresh forward correction — source only

Root admitted exactly four source paths and one installed CLI2.115.0 offline
`migration new job_card_shared_conflict_refresh`. It generated the sole empty
20261022014027_job_card_shared_conflict_refresh.sql; Root independently verified
count118, all117 old raw hashes and three mutable baselines unchanged before
content clearance. No second generation/rename/manual timestamp or native SQL
execution occurred. All117 historical migrations remain immutable.

The current finalizer is the20261020210000 E16 v4/v2 body, not the older resolver
composition. Its8101-byte canonical prosrc SHA
4abac05b664633f4100953964e7d5131a78f23a7130e5b886cccc96b99b4c06f
contains exactly one807-byte complete bad refresh block SHA
5a3e74977a19639356a2c20071735b165476fdb907ad9c2a903813693771d507.
Later20261021061932 renamed the old payload helper, installed its expectedRevision
wrapper and strengthened related/revision validation; it did not redefine this
finalizer. The forward change derives its CREATE OR REPLACE from the actual
catalog definition and replaces only the complete refresh block with the existing
booking_conflict_refresh_internal(p_tenant_id,output). Every other E16 body byte
and later helper binding remains. No pre-E16 finalizer, signature or proof-domain
copy is restored.

One atomic DO qualifies exact effective target and common-helper bodies before
DDL; canonicalizes only embedded reference CRLF to LF; accepts actual bodies
only as exact LF or complete CRLF variants; snapshots original raw target source.
The single block substitution must invert exactly, preserving original newline
bytes outside that removed block. Postflight requires the exact expected raw
body, stable target/helper OIDs, every target non-prosrc pg_proc attribute and
complete unchanged helper metadata. Unknown shape/count/metadata refuses and
rolls back that statement. No helper replacement, role/grant/Auth/schema change
is introduced. These are source assertions; PostgreSQL compilation/application,
atomic rollback and physical catalog preservation are not executed proof.

REAL011 keeps exact full equality and independently expected null values for all
nine current nullable job fields: duration, crew, travel, planned dates, earliest/
desired/latest dates and customer-presence. Their originating column declarations
have no non-null/default values; the fixture inserts do not assign them. Existing
job ordering, role/window null-versus-empty distinctions, full fact digest,
stale-preview rejection and exact physical no-change remain. A full-file inverse
back to the independently hashed9384d4f3 integration blob proves no other changes.
The resolver INT001 history/reopen/ledger/replay/common-helper oracle is unchanged.

Actual affected source controls: first-run45P/0F/0skip/0cancel, retaining42 old
cases plus effective-body/altered-guard/metadata inverses, LF/CRLF/drift/block-count
controls and authoritative full-fact expectation preservation. Whole TypeScript
and two-file ESLint exit0. No full unit suite/app build/SQL/integration/browser run
was repeated. The observed native title hashes locate the two failed cases but
not their first assertion/exception; source corrections do not claim native cause.
No acceptance/completion claim or fourth broad review follows.

Browser source is unchanged. Fixed v2 observations identify FINISHED (the existing
response.finished await), successful scenario callbacks and subsequent retained
custody, not backend settlement. A cleanup/context-close self-dependency is not
proved. Keep the finished wait, custody/error-precedence/caps; any transport proof
needs separately named scope rather than another opaque retry or generic family.
The required35 missing DB cases remain blocked by actual failed gates, never
filtered or credited. After independent source PASS, Root's shortest next action
is a separately qualified functional checkpoint proposal with all95 enrollment
and explicit remaining browser transport-lifetime evidence; no automatic run.

## Suggested Review Order

Author: Story 15.5 implementation/fix author (gpt-6.1-sol High), incorporating
explicitly delegated browser and bootstrap contributors. Refreshed after all
Round 3 latest-fix assertions, the subsequent checkpoint repairs and bounded
native setup diagnostics, same-connection privacy qualification and explicit
isolated setup authority transport, bounded child settlement, browser diagnostic repair,
actual SQL callback ownership, executed-feature fixture/status/policy repairs and
bounded safe-leaf transport through the installed reporter, closed owned scenario origins, the minimal Vite security patch, the admitted staged diagnostic-only lane and the discovery-order unit correction.
Stops below resolve to the current forward-protocol working source handed to Root; no author Git mutation occurs.

### Own settings and honest lifecycle results

The two personal entry points reach one settings surface; the profile entry uses
server-filtered navigation. Confirmations and component-memory issuance retain
explicit uncertainty handling, while later authoritative status removes stale URLs.
The error render fallback reuses the existing approved sentence without enabling
retry before uncertain results have been reconciled; all four isolated SSR cases passed.

- `src/components/app-shell/AppShell.tsx:279` — `navigation.some`: gates the profile link on scheduling access.
- `src/components/calendar-feed/CalendarSubscription.tsx:34` — `const current = await refresh();`: clears superseded post-commit output and success.
- `src/components/calendar-feed/CalendarSubscription.tsx:69` — `state?.status === "error"`: AC2/6 renders fallback guidance without changing lifecycle controls.
- `tests/integration/components/calendar-feed.test.ts:36` — `15.5-COMP-003`: AC2/6 existing error/retry SSR assertions passed in isolation.
- `tests/e2e/calendar-feed.e2e.spec.ts:388` — `15.5-E2E-010-`: AC2/6 supersession cases failed at3e7; changed-head browser evidence pending.
- `tests/e2e/calendar-feed.e2e.spec.ts:456` — `15.5-E2E-011`: AC2/6 browser control failed at3e7; changed-head evidence pending.

### Signed current-self authority and atomic writes

Ordinary JWT commands derive self authority; SQL rechecks current exact membership
and role union under the scheduling tenant lock. Dedicated proofs bind privileged
inputs, and CAS/history/audit commit together without plaintext recovery.

- `src/server/commands/calendar-feed/manage-calendar-feed.ts:10` — `function calendarFeedConfig`: exposes plaintext only after confirmed fresh SQL success.
- `src/server/commands/calendar-feed/manage-calendar-feed.ts:38` — `command: "calendar_feed.create"`: literal create/rotate/revoke declarations retain independent enrollment discovery.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:162` — `create function public.manage_calendar_feed`: checks signed authority, revision, replay and audit.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:122` — `is distinct from (case`: preserves domain branches while delimiting CASE within the PL/pgSQL IF; subsequent native stack resets compiled it.
- `tests/support/calendar-feed-atdd.ts:362` — `const allowed = ["membershipId"`: checks raw JWT status keys before mapper reconstruction.
- `tests/integration/rls/calendar-feed.rls.test.ts:139` — `15.5-RLS008`: AC1/4/9 case failed at3e7; no downstream field/ACL credit inferred.

### Complete live snapshots and essential RFC correctness

The exact public middleware boundary precedes authentication/cookies. Projection
is complete and minimal; stable IDs, every projected-source revision and explicit
fractional rounding produce a subscription snapshot without scheduling METHOD.

- `middleware.ts:40` — `request.nextUrl.pathname`: bypasses only the exact feed token segment.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:236` — `'updatedAt',greatest`: covers mutable booking, role, job, customer and facility revisions.
- `src/features/calendar-feed/icalendar.ts:40` — `export function encodeCalendarFeed`: serializes complete snapshots before streaming.
- `tests/unit/features/calendar-feed/icalendar.test.ts:76` — `R1-05 positive`: AC3/8 independent positive fractional and boundary vectors passed.

### Durable abuse admission and hardened restore ownership

Independent budgets keep admitted counters through projection cancellation without
advancing last-use. Serial fixtures restore only their captured unknown-IP row;
source creator ADMIN is distinct from SET authority, while unchanged recovery
keeps SupAdmin-only NOADMIN. Retained unsafe roles fail closed.

- `supabase/migrations/20261020220000_personal_calendar_feed.sql:247` — `exception when sqlstate '57014'`: keeps projection failure inside the counter transaction.
- `tests/integration/calendar-feed/public-feed.int.test.ts:364` — `15.5-API018`: AC5/8 case failed at3e7; changed-head durability evidence pending.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:27` — `pg_has_role(current_user,feed_owner.oid,'SET')`: qualifies source ownership authority independently of creator ADMIN.
- `tests/integration/commands/calendar-feed.int.test.ts:445` — `memberships.every(row => row.inherit_option === false)`: AC4/9 INT015 native fresh/replay inherited-owner oracle passed at3e7.
- `tests/support/calendar-feed-atdd.ts:573` — `has_schema_privilege(oid,'public','CREATE')`: reads actual effective schema privileges including PUBLIC/inherited access.
- `tests/integration/rls/calendar-feed.rls.test.ts:182` — `publicSchemaCreate: false`: AC4/9 RLS010 failed at3e7; individual predicate reach remains unknown.
- `tests/integration/ops/recovery-storage-immutability.int.test.ts:131` — `has_schema_privilege('calendar_feed_owner','public','CREATE')`: the existing recovery case checks the restored target before Storage requests; separately qualified native case.

### Isolated CI custody and honest evidence limits

Only captured child identities and one ephemeral Vault UUID belong to the wrapper.
The added PG17 case qualifies that disposable stack and owns transaction-local
UUID roles/schema/function through dedicated connections, with no pool reuse.
Settlement is memoized; abnormal browser teardown retains exact job custody, while
privacy detection measures raw output in memory before sanitized records persist.
Before any secret, one fixed read-only query requires exact effective privacy on
the same connection later used for key creation and deletion. SET ACL facts
remain observations. The later admitted setup transport separately requires actual
authenticated SupAdmin LOGIN+SUPER for key setup and INT015, preserving its
restricted-session oracle. No new privileged child configuration or grant is added.

- `tests/integration/commands/calendar-feed.int.test.ts:486` — `// FULL rollback comes first`: preserves rollback/reset and same/fresh catalog absence proof.
- `scripts/ci/with-calendar-feed-runtime.mjs:343` — `export function createOwnedGroupStopper`: memoizes settlement, validates capture, passively observes missing-leader group absence and bounds completion/output.
- `scripts/ci/with-calendar-feed-runtime.mjs:264` — `export function createTelemetryObserver`: detects leaks before dropping non-allowlisted output.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1281` — `nonzero/null-signal nested browser loss`: requires retained key custody for abnormal completion.
- `tests/support/calendar-feed-ci-contract.ts:83` — `projectCalendarFeedCiCommands`: validates pinned real wrapper argv and the two wrapper inverses and finite exact diagnostic fragments.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:39` — `CI command projection rejects`: missing/wrong entry/argv and unrelated-source/workflow negatives preserve the original inverse fence.
- `scripts/ci/with-calendar-feed-runtime.mjs:115` — `function safeDiagnostic`: emits only fixed stages/categories and allowlisted SQLSTATE without native payloads.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:322` — `COMMIT uncertainty is not cleared`: rollback alone cannot establish key absence after attempted COMMIT.
- `scripts/ci/with-calendar-feed-runtime.mjs:569` — `receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);`: rejects unsafe effective settings before entropy on the existing client.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:218` — `privacy preflight rejects incomplete`: malformed and unsafe settings cannot reach a secret or child; actual driver/same-client/query-close cases exercise the surrounding boundary.
- `scripts/ci/with-calendar-feed-runtime.mjs:182` — `export function createCalendarFeedDatabaseClient`: fixes the same qualified source publication, canonical admin and sole captured credential; no default or alternate route.
- `scripts/ci/with-calendar-feed-runtime.mjs:169` — `export async function readCalendarFeedSetupAuthority`: actual authenticated session/current LOGIN+SUPER proof is mandatory before mutation.
- `tests/integration/commands/calendar-feed.int.test.ts:508` — `await fresh.connect(); await setupQualified(fresh); await absent(fresh);`: INT015 fresh authority/privacy and exact absence oracle passed at3e7.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:156` — `setup construction refuses missing`: credential/target refusals cannot reach secrets or children; actual identity negatives and child-config tests complete the bounded boundary evidence.

- `tests/e2e/support/calendar-feed-atdd.ts:123` — `export function createCalendarLifecycleObservations`: AC2/6 observes both transport promises and joins actual readback before teardown; pure regressions are not native acceptance.
- `tests/e2e/support/calendar-feed-atdd.ts:65` — `export function calendarBrowserDiagnostic`: preserves closed stage/category/SQLSTATE without native error payloads.
- `tests/e2e/support/calendar-feed-atdd.ts:765` — `if (base && cleanupAllowed)`: canonical SQL/Auth cleanup waits for verified settlement; unresolved references retain fixture custody.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:498` — `missing leaders with persistent groups`: absence is measured within existing budgets; anonymous groups grant no signaling authority.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1045` — `actual browser bounded cancellation`: timeout cannot credit in-flight SQL/readback settlement; release and real completion are distinct.

- `tests/e2e/support/calendar-feed-atdd.ts:133` — `trackReadback<T>`: registers actual callback/query work independently of Playwright deadlines and closes before drain.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1125` — `installed polling deadline cannot credit`: HTTP completion plus outer timeout cannot credit unresolved physical query siblings or callback completion.

- `tests/support/calendar-feed-atdd.ts:203` — `export function calendarFixtureDiagnostic`: fixed stages/own-data SQLSTATE preserve only reaching errors within bounded aggregates.
- `tests/support/calendar-feed-atdd.ts:284` — `phase="additional-users"`: marks actual callback entry; upstream lost code remains unknown.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:603` — `actual fixture diagnostics preserve only`: injected classification and upstream-loss negatives are not native failure-cause proof.
- `tests/integration/rls/acceptance-tables-migration-reset.int.test.ts:212` — `approved role-specific policies`: exact ten-policy/role case passed at3e7, retaining DELETE/ALL/extra-policy rejection.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:927` — `the actual allocated policy case rejects`: injected rows exercise catalog negatives; actual3e7 policy case passed separately.

- `tests/support/calendar-feed-atdd.ts:235` — `calendarFixtureSafeFailures.get(child)?.children`: flattens only guarded, already-sanitized children for the one-level reporter boundary.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:874` — `installed failure transport reproduces lost`: old-shape control distinguishes JSON projection loss from in-process unknown.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:886` — `actual repaired fixture diagnostics reach`: ordered safe primary/cleanup leaves remain one failed synthetic case.

Evidence: historical check receipts keep their exact revisions and dependency
limits. Eighth checkpoint3e7 ran all51 story Vitest cases:8 passed/43 failed;
all four component cases and the exact shared policy case passed. Fourteen story
browser cases failed across28 attempts. Separate verify3130/bootstrap58/Python43/
recovery1 and actual DB child/key cleanup/INT015 passed; the full DB result still
failed1944P43F52skip. Browser custody, RLS010/API019 failure and unavailable
attachment content receive no borrowed proof. All43 native fixture messages had
only group markers: no leaf serialization, no diagnosed SQL or cleanup cause.
Current61 separate bounded Node tests passed, including three installed
runner/processError/JsonReporter transport controls using synthetic failures.
Actual pure source seams, injected rows and synthetic reporter tasks are not native
SQL/auth/browser acceptance. Prior isolated localSSR4 and native component4
passes keep their own scope; no SSR rerun here. Changed-head managed runtime,
complete native success and attachment-content privacy require Root exact-head CI.
Prior production builds remain historical, and no new build is claimed here.
All three broad rounds completed; only distinct High latest-delta review remains.
No provider/device/visual/performance or release-ready claim; the unallocated
exhaustive branch remains explicitly release-blocking deferred.

### Closed origins without inferred backend causes

The existing guards report only compile-time origins or outcome enums already
consumed. RLS001 preserves each allowed-subject assertion and adds a fixed site;
safe source frames identify other assertion lines without inspecting native errors.

- `tests/support/calendar-feed-atdd.ts:191` — `export function calendarFixtureOrigin`: registers only newly created fixed safe errors.
- `tests/support/calendar-feed-atdd.ts:196` — `export function calendarFixtureAssertionAt`: calls the existing assertion once and returns its result.
- `tests/support/calendar-feed-atdd.ts:933` — `const outcome = result.outcome`: classifies the same consumed outcome without observing an RPC.
- `tests/integration/rls/calendar-feed.rls.test.ts:24` — `calendarFixtureAssertionAt(allowedSites[subject]`: distinguishes four allowed contracts without changing the loop.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:800` — `actual first INT001 and API001 callbacks stop`: proves preceding/no-later operations with injected fixtures, not native acceptance.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:832` — `actual first callbacks retain precise safe assertion frames`: proves controlled frames and unrecoverable upstream UNKNOWN limits.

Current evidence:67 bounded controls passed with0 failures/skips/cancellations,
whole TypeScript and focused lint passed, and the approved5760-byte kernel is
unchanged. Ninth native8P43F exposes44 scenario/unknown leaves; first actual
branches and all43 causes remain unknown. Fixed outcome tags cannot distinguish
collapsed backend causes. Native acceptance, RLS010/API019 later predicates and
browser attachment privacy remain pending. Distinct High latest-four review is
pending; prior review/SSR/runtime receipts retain their historical dependency scope.

### Patch the bundled tool without weakening the gate

The same-branch minimum patched Vite replaces its bundled editor. Only its required
lock closure changes; scripts, Vitest versions, overrides and audit threshold stay
fixed. Local synthetic controls/build do not replace fresh native qualification.

- `package.json:50` — `"vite": "8.1.6"`: pins the patched tool without changing scripts.
- `pnpm-lock.yaml:2297` — `vite@8.1.6:`: binds the actual registry integrity and unchanged engine.
- `pnpm-lock.yaml:2059` — `rolldown@1.1.5:`: carries the required types and matching platform bindings.

Evidence: frozen installation, high-threshold audit (exit0/2moderate/no high),
lock guard, full typecheck,67bounded controls, production build and bundle
containment passed after materialization. Focused lint passed0errors/0warnings;
canonical local lint was terminated/incomplete after scanning ignored historical
assets and receives no PASS credit. Clean-CI canonical lint/native gates and fresh
independent exact dependency-delta review remain pending. All prior failed heads
and the43DB/14browser gaps remain failed/unresolved; no whole-native reuse.

### A diagnostic result never substitutes for acceptance

- `src/server/commands/calendar-feed/calendar-feed-db.ts:25` — `export async function captureCalendarFeedTrace`: closed per-invocation events, result/error identity and late-context closure.
- `src/server/commands/calendar-feed/manage-calendar-feed.ts:48` — `const code = result.code`: observes the already-consumed stable envelope result without changing its outcome.
- `src/server/read-models/calendar-feed.ts:10` — `if (error?.code === "42501")`: locates status erasure before its existing typed denial.
- `tests/support/calendar-feed-atdd.ts:943` — `export function calendarCauseProofSelection`: selects at most one warranted original-function baseline.
- `tests/support/calendar-feed-atdd.ts:949` — `export async function calendarCauseProofIdle`: a pg timeout is not actual protocol settlement.
- `tests/support/calendar-feed-atdd.ts:1009` — `export async function runCalendarFeedCauseProof`: one ordinary command, qualified restricted original baseline, rollback/fresh verification and conditional custody cleanup.
- `tests/integration/commands/calendar-feed.int.test.ts:21` — `test("15.5-DIAG001"`: explicit-mode-only diagnostic inventory; normal95/INT015 are not replaced.
- `scripts/ci/checkpoint-dispatch.mjs:83` — `function diagnosticAvailability`: candidate/default availability refusal before the sole POST.
- `scripts/ci/checkpoint-dispatch.mjs:15` — `function verificationMode`: persisted diagnostic/legacy mode cannot downgrade to normal acceptance.
- `scripts/ci/with-calendar-feed-runtime.mjs:14` — `export const CAUSE_PROOF_ARGS`: fixed single-case serial argv/reporters/output without a Next/browser child.
- `scripts/ci/with-calendar-feed-runtime.mjs:65` — `export async function finishCauseProof`: validated distinct report upload on test failure as well as success, with private custody redaction.
- `.github/workflows/ci.yml:262` — `- name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)`: separate mode-bound step; ordinary full+pilot remains intact.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1357` — `actual per-invocation trace preserves once-call value`: actual scoped trace concurrency/nesting and identity controls.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1378` — `actual baseline decision chooses one observed boundary`: conditional selection and protocol-settlement negatives.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1403` — `actual installed failed native report and closed observation`: actual reporter/temporary-FS capture on failure without publishing custody handles.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:245` — `diagnostic selection is durable before the only POST`: actual dispatcher durable mode/nonce/zero-acceptance transport controls.
- `tests/unit/scripts/verify/ci-native-test-reports.test.ts:41` — `cause-proof capture is distinct mode-bound`: raw upload/artifact mode and negative controls preserve ordinary native reports.
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:53` — `diagnostic dispatch excludes pilot`: normal pilot/inverse guards and diagnostic NOT_RUN stay distinct.

Evidence: final79 changed-file Node controls and prior361 seven-file run have the
separate temporal limits recorded above. No diagnostic native run or SQL cause
proof has occurred. Hosted availability and private qualifier adoption are hard
pre-POST requirements; distinct committed-delta High review remains pending.

### Correct cleanup and launch evidence before dispatch

The corrective allocation adds same-statement visibility so hidden rows cannot
qualify absence, and separates actual launch evidence from exit completion.
Default registration/event presence and candidate capability have distinct gates.

- `tests/support/calendar-feed-atdd.ts:1125` — `(select r.rolsuper or r.rolbypassrls`: qualifies visibility on the executing query role.
- `tests/support/calendar-feed-atdd.ts:1131` — `if (!Array.isArray(rows)`: rejects malformed or false absence observations without getters.
- `scripts/ci/with-calendar-feed-runtime.mjs:403` — `child.once("spawn",`: actual adapter events establish launch independently of done.
- `scripts/ci/with-calendar-feed-runtime.mjs:517` — `const refreshLaunch`: retains late actual launch facts through cleanup.
- `scripts/ci/with-calendar-feed-runtime.mjs:84` — `if (!["not-attempted", "not-created-confirmed"].includes(receipt.childLaunchState))`: uncertain or started missing reports fail capture.
- `scripts/ci/checkpoint-dispatch.mjs:26` — `export function assertDefaultDispatchWorkflow`: rejects ambiguous structure before the sole POST.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1494` — `actual diagnostic caller requires same-statement`: actual caller visibility/absence, exact parameter and custody controls.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:286` — `default recognizer refuses comments`: malformed event definitions cannot satisfy default presence.

Evidence: actual374 seven-file Node PASS includes86 runtime and30 dispatcher
controls. Final alias-only changes then passed the affected30 dispatcher cases;
other344 bindings are reused, not a second combined run. Whole TypeScript and
focused ESLint passed. Actual source seams,
synthetic SQL rows, simulated spawn events and temp-FS reports are not native
SQL/Auth/child/hosted acceptance. The new schema's future private consumer,
hosted availability, fresh committed High and Root execution remain pending.

### Refuse malformed default scalars before consuming the intent

The bounded default-event subset rejects colon-separation mapping syntax rather
than claiming default syntax validity from registration or a different candidate.

- `scripts/ci/checkpoint-dispatch.mjs:64` — `|| /:\s|:$/.test(value)`: malformed plain values cannot reach durable intent or POST.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:309` — `F3 actual default plain-scalar syntax refusal`: actual recognizer/caller negatives prove no state and no POST.

Evidence:31 affected dispatcher controls passed, whole TypeScript and two-file
ESLint passed. Closed F1/F2 and unchanged344 control bindings are reused with
historical scope, not rerun or summed into a new execution. Hosted availability,
private consumer adoption and diagnostic/native acceptance remain pending.

### Bind the reviewed private intent to the dispatcher nonce

A caller may supply correlation identity before dispatch while the same durable
one-shot intent and refusal rules remain authoritative under uncertainty.

- `scripts/ci/checkpoint-dispatch.mjs:178` — `const suppliedId = "checkpoint_id" in options`: validates supplied dispatch identity before any API.
- `scripts/ci/checkpoint-dispatch.mjs:207` — `checkpoint_id: suppliedId ? selectedId : randomUUID()`: keeps selection inside the existing exclusive pre-POST state.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:326` — `preselected and legacy generated checkpoint identity`: actual durable-at-POST value propagates through payload, title and ownership.

Evidence:35 affected dispatcher cases passed0fail/skip/cancel, full TypeScript
and affected lint passed. Prior31/374 composites retain their separate temporal
scope. No real provider/private collector/diagnostic/native run is credited;
new-head private qualification and fresh reviewed Root dispatch remain pending.

### Observe external status origin without inferring an inner cause

The status-only SELECT and catch keep the original operation and parameters.
Strict facts carry evidence to the future qualifier; table ACL alone is insufficient.

- `tests/support/calendar-feed-atdd.ts:958` — `export function calendarStatusErrorOrigin`: maps only three own-data routine literals.
- `tests/support/calendar-feed-atdd.ts:965` — `export async function calendarCauseProofRestricted`: adds eighteen facts inside the original status SELECT.
- `tests/support/calendar-feed-atdd.ts:1080` — `Object.assign(report, await calendarCauseProofBaseline`: joins the original call before existing protocol cleanup.
- `scripts/ci/with-calendar-feed-runtime.mjs:48` — `if (value.statusDiscriminator === null`: enforces the strict current eleven-field contract.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1554` — `status discriminator classifies actual installed pg-protocol frames`: uses real parser frames with injected source helpers.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1593` — `status strict wire schema preserves false TABLE_ACL_ONLY`: retains table-only false without a cause claim.

Evidence:93 affected Node controls passed0F/skip/cancel; whole TypeScript and
focused lint passed. Synthetic query/finite-frame/source seams do not execute
PostgreSQL or prove cause, private17-candidate interpretation or native acceptance.
Historical failed heads and ARR warning remain; future qualifier controls unexecuted.

### Separate discovery membership from execution ordering

- `tests/unit/scripts/verify/integration-test-partitions.test.ts:53` — `assertExactPartition(specs.filter`: exact six-file serial membership accepts platform-dependent enumeration while group/settings guards remain enforced.
- `tests/unit/scripts/verify/integration-test-partitions.test.ts:73` — `const serialExpected = [...ddlFiles].sort();`: reversed/shuffled acceptance and missing/duplicate rejection exercise the same live partition guard.
- `tests/unit/scripts/verify/integration-test-partitions.test.ts:85` — `test("installed Vitest finishes parallel teardown`: actual installed scheduling proves teardown completion and reversed-group interference.

Evidence: focused Windows3P and Linux3P; final Linux full3179P/0F/0skip across103
suites; whole TypeScript and affected lint exit0. Local unit proofs preserve
execution integrity without claiming the unknown hosted stop or DB/browser cause.

### Resolve canonical identity without widening runtime authority

The preparsed invoker binds auth.uid at definition time while preserving runtime
EXECUTE and caller identity. One atomic owner-scoped replacement preserves guards.

- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:171` — `if session_user <> 'postgres'`: qualifies the ordinary migration executor before DDL.
- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:326` — `language sql stable security invoker`: binds canonical identity without a privileged runtime helper.
- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:242` — `execute 'set local role calendar_feed_owner'`: uses actual ownership plus transient schema CREATE.
- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:348` — `and to_jsonb(p)-'prosrc'=metadata[i]`: asserts OIDs and unchanged function metadata after eight substitutions.
- `tests/support/calendar-feed-atdd.ts:977` — `export function calendarCauseProofExpectedBody`: derives only the fixed adapted source from historical SQL.
- `scripts/ci/with-calendar-feed-runtime.mjs:56` — `if (schema !== "status-origin-v2"`: refuses old or mixed observation contracts.
- `tests/integration/rls/calendar-feed.rls.test.ts:209` — `sqlStable: true, preparsed: true`: extends existing RLS010 canonical dependency and private ACL assertions.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1673` — `actual ACL source and existing RLS010 reject actor`: exercises actual callback negatives using injected catalog facts.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1683` — `new atomic migration cross-validates exact original bodies`: cross-validates immutable sources and substitution boundaries.

Evidence: final97 affected controls and3183 full pure-Node tests passed separately
(not additive), whole TypeScript/focused ESLint passed. Native migration, RLS010,
current v2 private consumer and full95 remain pending. The qualified probe proves
only the preparsed invoker mechanism; it supplies no borrowed production PASS.

### Require SET authority without rejecting a parallel creator grant

One removed bad-row term separates effective/direct SET from independent creator
ADMIN metadata. All unsafe membership and owner hardening checks remain required.

- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:181` — `and member=executor_oid and set_option and not inherit_option`: retains the existing direct non-inherited SET requirement.
- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:182` — `member<>executor_oid or inherit_option))`: rejects foreign/inherited rows without requiring SET on every grant.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1730` — `actual owner guard admits parallel native creator ADMIN`: executes the source positive and biting old-predicate counterexample.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1738` — `actual owner guard retains foreign outbound inherited`: executes preserved membership, SET and seven-attribute refusals.

Evidence:99 affected pure-Node cases passed0F/skip/cancel; whole TypeScript and
affected lint passed. These are extracted Boolean/source fixtures, not PostgreSQL
execution or hosted membership/causal proof. Prior Linux3183 is historical only;
current native gates/all95/recovery and independent latest-fix review are pending.

### Name refused original invariants without exposing catalog payloads

The unchanged IF gates a fixed failure-only matrix. Native false bits may localize
a missing invariant; NULL or drift without established cause still requires a stop.

- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:304` — `raise exception 'calendar actor original function refused %'`: emits only the closed matrix after the original refusal.
- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:305` — `'schema','calendar-original-function-guard-v1'`: binds fixed schema and ordinal to eleven nullable booleans.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1810` — `actual unchanged original guard emits the named eleven-bit`: exercises exact false-bit and first-ordinal mapping from source.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1827` — `failure-message inverse restores exact original migration`: proves only message construction changed and P0001 remains default.

Evidence: final102 affected controls passed0F/skip/cancel; whole TypeScript and
affected lint passed after recorded initial test/type failures. The finite source
seam/inverse hash is not SQL or native catalog/cause proof. Plan High PASS is not
current-source review; all execution/acquisition/native and normal gates remain.

### Reconcile only exact source-comparable owner ACLs

Existing SET authority repairs D or exact I after complete all-eight preflight;
unknown sources/grantors are refused before mutation. AC4/AC9 keep least privilege.

- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:189` — `-- Begin all-eight source-comparable preflight`: finishes source and raw ACL admission before effects.
- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:250` — `-- Begin exact owner ACL reconciliation fragment.`: changes only exact target ACLs as owner.
- `supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql:279` — `grantees is distinct from intended_grantees`: requires exact raw and effective final boundaries.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1886` — `all-eight actual preflight cross-validates`: executes source guards and byte-conservation controls offline.

### Prove the ordinary-grantor boundary without shared catalog faults

The planned native regression is private UUID and rollback-only, before row fixtures.
Source controls exercise its actual operation/cleanup paths; native proof is pending.

- `tests/support/calendar-feed-atdd.ts:1144` — `export async function calendarOwnerAclRegression()`: qualifies isolated main/fresh setup and owns exact UUID custody.
- `tests/support/calendar-feed-atdd.ts:1278` — `export async function calendarOwnerAclExercise(`: runs ordinary witness, forced rollback and actual owner fragment.
- `tests/integration/rls/calendar-feed.rls.test.ts:179` — `await calendarOwnerAclRegression();`: keeps the proof separate from production ACL projection.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2006` — `actual native cleanup preserves the primary and ALL`: exercises cleanup order, failure retention and custody offline.

Evidence: final affected pure-Node110P/0F/0skip/0cancel; whole TypeScript exit0;
focused three-file ESLint exit0/no warnings; native diff and canonical reader/SRO
checks below. Counts are separate from historical102/108 and Linux3183, never added.
Limits: finite SQL interpretation, constructed command and injected client controls
supply native credit0. No SQL syntax/runtime/rollback/ACL or original-cause PASS;
fresh independent latest-delta review and required native exact-head gates remain.


### Keep subject attacks real and empty calendar navigation usable

Legitimate self-management precedes the no-mutation baseline; the empty agenda
uses structure plus visible copy/navigation while populated visibility remains.

- `tests/integration/rls/calendar-feed.rls.test.ts:42` — `const legitimate =`: establishes the positive before negative baseline.
- `tests/integration/rls/calendar-feed.rls.test.ts:47` — `const otherTenant =`: changes every caller's tenant override.
- `tests/e2e/calendar-feed.e2e.spec.ts:142` — `if (variant.scenario === "no-profile")`: requires visible empty UI and structural agenda.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2187` — `actual RLS002 uses a different spoof`: executes actual negative matrix and physical checks.

### Retire owned sessions and restore only after actual work

Default consumers retain their behavior; only registered-owned errors are contained.
Atomic owner operations commit/retire before callbacks; uncertainty retains custody.

- `tests/factories/admin-sql.ts:111` — `function retiredGate(`: delegates foreign events to original Node emit.
- `tests/factories/admin-sql.ts:136` — `export async function adminRetiredSession`: bounds query/drain/end and retires once.
- `tests/support/calendar-feed-atdd.ts:716` — `export async function calendarOwnerAtomic`: qualifies same-session mutation and reset before COMMIT.
- `tests/support/calendar-feed-atdd.ts:264` — `async function calendarSeedBookingFixture`: composes the same exported canonical setup.
- `tests/support/calendar-feed-atdd.ts:297` — `if(calendarSharedCustody){if(canonical)`: blocks destructive cleanup against uncertain work.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2198` — `actual withDatabaseTime awaits committed retired publication`: executes callback/settlement/restoration order.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2055` — `actual owned error gate preserves foreign listeners`: exercises listeners/monitors and concurrent ownership.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2180` — `actual composition cleans after seed failure`: exercises cleanup versus custody with exact exports.

Evidence: prior124P/0F/0skip/0cancel plus final affected2P/0F/0skip/0cancel;
other122 controls reused, no inferred new aggregate. Final whole TypeScript/
five-file ESLint exit0.
AC4/AC9 subject/no-mutation and transaction/custody invariants have live source
controls; AC6 empty navigation has actual caller-assertion controls. Native credit0:
SQL/RLS/browser, API019/privacy, E2E001/flakies and independent review remain open.
The partial d661 handoff had no cross-isolate job boundary. Its module latch
remains limited; the following C4 concern records the new runner/caller/custody
contract and the remaining independent/native gates.


### Stop later isolated admission without weakening successful enrollment

Serial bail propagates failures; the unconditional resolved-project guard rejects
unsupported partitions before setup. The strict34 caller shape preserves rejection.

- `vitest.config.ts:27` — `export function supportedCalendarIntegrationProjects`: checks the exact supported resolved project set.
- `vitest.config.ts:35` — `plugins:[{name:"c4-supported-partition"`: evaluates the complete guard from every selected project.
- `vitest.config.ts:68` — `bail: 1`: cancels later serial admission after a failed test.
- `tests/unit/scripts/verify/integration-test-partitions.test.ts:155` — `function calendarCallerContract`: rejects current-caller suppression and binding drift.
- `tests/unit/scripts/verify/integration-test-partitions.test.ts:241` — `C4 installed hook preserves healthy expected-denial`: tests actual installed cancellation and ordering offline.

### Keep exact key custody after unsuccessful DB runtime

Owned frontend settlement is not canonical backend restoration. Failed or uncertain
runtime retains the existing key; healthy verified cleanup stays unchanged.

- `scripts/ci/with-calendar-feed-runtime.mjs:651` — `const dbRuntimeUnverified`: forbids failed-runtime deletion/readback.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2218` — `failed DB signal cancellation launch timeout`: exercises failure/cancellation/forced/unknown custody.
- `tests/support/calendar-feed-ci-contract.ts:6` — `const wrapperSha256 =`: pins reviewed LF wrapper bytes without changing argv/inverse.

Evidence: runtime125P and partition C4 subset5P are separate actual runs; whole
TypeScript/focused lint/reader/SRO/native Git checks follow final source. Installed
synthetic probes establish runner/caller behavior only, normal acceptance0. The
remaining real DB/RLS/browser/recovery and independent sensitive review still block
completion; all95 remain mandatory on a successful run.

### Retain ordinary transport uncertainty before any destructive cleanup

The finite dependency boundary preserves public error mapping while custody
remains independent of JavaScript promise removal or a caught scenario error.

- `tests/support/calendar-feed-atdd.ts:475` — `http:`: observes body completion or latches transport custody.
- `tests/support/calendar-feed-atdd.ts:480` — `trustedFetch:`: wires the existing anonymous dependency through the finite view.
- `tests/support/calendar-feed-atdd.ts:632` — `function calendarRetainTransportCustody`: preserves the first uncertainty before error erasure.
- `tests/support/calendar-feed-atdd.ts:645` — `function calendarFetchPort`: forwards the same receiver, args and result once.
- `tests/support/calendar-feed-atdd.ts:664` — `if(!settled||calendarSharedCustody)`: rejects custody even when pending is empty.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2253` — `actual clock scope retains caught HTTP rejection`: blocks restoration after caught transport failure.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2279` — `installed Postgrest status zero`: proves the actual public-erasure path offline.

Evidence: final affected131P/0F/0skip/0cancel, whole TypeScript and two-file lint
exit0. Initial127P/4F, intermediate7P and prior125/partition5 runs remain separate.
Reviewer stop: verify finite-view receiver/args/result identity, caught-inner
custody and every downstream restore/delete guard. These injected installed-code
controls carry native acceptance0; backend settlement/canonical restoration and
API019/essential browser/current full gates still require independently qualified
native evidence. Independent F1 closure has not yet occurred.

### Observe the original fixed failure boundary without selecting a cause

Only NUDGE004/E2E001 opt in; errors/results/cleanup and healthy/default silence
stay unchanged. Opaque outer failure remains UNKNOWN, even after an inner error.

- `tests/integration/notifications/time-report-nudge-producer.int.test.ts:192` — `const labels=createNudgeFailureLabels(`: opts in only the real27-recipient case.
- `tests/support/time-reports-atdd.ts:50` — `export function createNudgeFailureLabels`: bounds fixed output without error/property reads.
- `tests/support/time-reports-atdd.ts:74` — `export async function withTimeReportFixture`: preserves outer error identity and precedence.
- `tests/e2e/calendar-feed.e2e.spec.ts:74` — `const labels=createCalendarFailureLabels(undefined,"E2E001")`: opts in only the existing lifecycle case.
- `tests/e2e/support/calendar-feed-atdd.ts:21` — `export function createCalendarFailureLabels`: isolates action/ordinal applicability and state.
- `tests/e2e/support/calendar-feed-atdd.ts:121` — `const wasDone=done`: preserves MATCHED on no-op final cancellation.
- `tests/e2e/support/calendar-feed-atdd.ts:187` — `note("readback","SETTLED_SUCCESS")`: keeps readback separate from observation cancellation.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2319` — `actual opted-in outer nudge boundary`: exercises opaque rejection and final identity.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2393` — `actual browser readback failure native failure`: exercises independent completion states.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2424` — `installed Node test runner receives only fixed`: proves the bounded offline stderr boundary only.

Evidence: final affected146P and unchanged C4 acceptance/inverses2P are separate
actual runs, not an aggregate. Whole TypeScript/five-file lint exit0. Review must
check original failure-site capture, unchanged error/cause/cleanup order, no added
observers/operations and current native UNKNOWN. This is source diagnostics only;
no functional correction, CODEPASS, native gate/coverage or execution approval.

### Preserve evaluated final relations instead of inventing absence

LOCAL remains unevaluated; the actual NUDGE004 TEST_FINAL snapshot retains the
outer helper's established same/different/absence relation. Factory cause is UNKNOWN.

- `tests/support/time-reports-atdd.ts:52` — `let finalRelation:`: starts with no evaluated relation.
- `tests/support/time-reports-atdd.ts:66` — `const relation=`: separates LOCAL unknown from final relation retention.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2468` — `SOURCE-LABEL-01 actual helper and enclosing NUDGE004`: exercises the actual composed final boundary.

Evidence: selected8P/0F/0skip/0cancel first run; whole TypeScript/two-file lint
exit0. No new full148 aggregate, native or independent closure credit. The old
NOTPASS and original author receipt remain preserved; reviewer checks only this
relation correction and consequential latest-line regressions, not a fourth pass.

### Carry only owned closed labels through the public JSON metadata path

The NUDGE004 public task-local sink owns its reserved field. Generic/foreign
metadata is preserved, not sanitized; absent publication remains UNKNOWN.

- `tests/integration/notifications/time-report-nudge-producer.int.test.ts:9` — `export function createNudgeTaskMetaSink`: validates fixed source records before publishing.
- `tests/integration/notifications/time-report-nudge-producer.int.test.ts:38` — `Object.defineProperty(meta,key`: replaces only the exact owned frozen-array slot.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2500` — `async function actualMetaJsonReport`: invokes real installed onTestRunEnd in memory.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2524` — `VITEST-META actual helper and public NUDGE callback`: proves byte-equal reporter metadata and original failures.

Evidence: final focused13P/0F/0skip/0cancel, whole TypeScript/two-file lint exit0.
Installed-source/type hashes are in the new author receipt. This carrier proof
supersedes only the missing offline reporter-path evidence, not native publishing
or functional/custody gates; independent targeted source review remains pending.

### Preserve source invariants without requiring historical Git at test runtime

Fixed baselines come from reviewed166cad objects; current code must match their
operation counts and ordered assertion fingerprints, including biting inverses.

- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2410` — `label instrumentation preserves actual promise`: checks six counts and added-operation negatives.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2438` — `actual labelled caller assertions match`: checks ordered original assertions and changed-source negatives.

Evidence: full affected Linux152P/0F/0skip/0cancel, whole TypeScript and affected
lint exit0. Pre-edit Windows2P vs controlled Linux2F are distinct; opaque hosted
exceptions remain UNKNOWN. This fixes the demonstrated runtime-history dependency,
not an application cause or hosted gate. Reviewer checks independent constants
against166cad Git objects and preserved comparison semantics; no fourth broad pass.

### Align only the series protocol while preserving the effective resolver composition

A new forward migration binds exact effective bodies and metadata, preserving
shared refresh and the resolver's separate compatibility protocol.

- `supabase/migrations/20261022002335_booking_series_current_conflict_protocol.sql:5` — `do $series_protocol$`: holds both replacements in one atomic statement.
- `supabase/migrations/20261022002335_booking_series_current_conflict_protocol.sql:11` — `expected_sources`: binds effective source before DDL.
- `tests/unit/server/bookings/series-plan.test.ts:326` — `function forwardSeriesProtocolSources`: derives the historical resolver composition and inverse.
- `tests/unit/server/bookings/series-plan.test.ts:359` — `Actual forward SQL producer protocol`: invokes the real TS admission boundary with SQL-derived protocol.
- `tests/unit/server/bookings/series-plan.test.ts:371` — `Forward predecessor line-ending admission`: preserves actual raw LF/CRLF and rejects mixed/bare-CR/drift.
- `tests/integration/commands/booking-series.int.test.ts:802` — `expect(snapshot.claims).toMatchObject`: aligns active REAL011 positive protocol only; all null/empty/digest/stale negatives remain.
- `tests/integration/commands/booking-series.int.test.ts:993` — `expect(snapshot.claims.engineVersion)`: asserts future actual checked SQL claims without extra RPCs.

Evidence: final affected42P after newline controls; prior41P and initial39P/2F
reader failure retained nonadditively; wholeTS/lint0.
Source inverse is not PostgreSQL execution; native body/metadata/ACL/rollback proof
is pending. Review exact forward body composition and target-only substitutions.
Browser phase/custody diagnosis remains UNKNOWN/separately allocated, not a fix.


### Observe only existing browser completion phases and final failure boundaries

- `tests/e2e/support/calendar-feed-atdd.ts:21` — `export function createCalendarFailureLabels`: bounds immutable registered-action snapshots and failure-only publication.
- `tests/e2e/support/calendar-feed-atdd.ts:603` — `label?.set("completionPhase","RESPONSE")`: marks the first existing native completion await without adding work.
- `tests/e2e/calendar-feed.e2e.spec.ts:389` — `const labels=competingAction===`: opts in revoke only, leaving rotate silent.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2615` — `browser v2 actual enclosing selected case catches`: executes actual enclosing catches and final error/cleanup precedence.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:2593` — `browser v2 closed producer rows match`: checks actual producer rows and exact28+16 bound.

Evidence: final157 affected offline controls, wholeTS and three-file lint0; initial
156/type failure and later fixture syntax-load failure retained nonadditively.
Private v2 parser/qualified hosted transport/native completion remain unexecuted;
this is source observability, not a functional fix or fourth broad review.


### Restore shared job-card refresh without losing later E16 validation

- `supabase/migrations/20261022014027_job_card_shared_conflict_refresh.sql:4` — `do $job_card_refresh$`: contains the one atomic target-only forward correction.
- `supabase/migrations/20261022014027_job_card_shared_conflict_refresh.sql:7` — `expected_body constant text`: binds effective E16 source rather than an old finalizer copy.
- `supabase/migrations/20261022014027_job_card_shared_conflict_refresh.sql:158` — `execute pg_catalog.replace(definition`: changes exactly the existing complete refresh seam.
- `tests/unit/server/bookings/series-plan.test.ts:393` — `function forwardJobCardRefreshSources`: derives effective source/helper/revision provenance and altered-source inverses.
- `tests/unit/server/bookings/series-plan.test.ts:432` — `REAL011 retains full strict authoritative`: pins exact full-file inverse and independent nullable schema facts.

Evidence: first affected45P; wholeTS/two-file lint0; source guards/inverse are not
PostgreSQL execution. Existing117SQL and resolver INT001 remain unchanged. Review
new118 exact preimage/one replacement/metadata and full REAL011 expectations;
native first throw and browser completion/custody remain UNKNOWN.
