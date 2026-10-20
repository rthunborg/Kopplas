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

Status: ready-for-dev
Blocking condition: none for planning.

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

## Suggested Review Order

Author: Story 15.5 implementation/fix author (gpt-6.1-sol High), incorporating
explicitly delegated browser and bootstrap contributors. Refreshed after all
Round 3 latest-fix assertions, the subsequent checkpoint repairs and bounded
native setup diagnostics, same-connection privacy qualification and explicit
isolated setup authority transport, bounded child settlement, browser diagnostic repair and actual SQL callback ownership.
Stops below resolve to final source literals before the repair commit.

### Own settings and honest lifecycle results

The two personal entry points reach one settings surface; the profile entry uses
server-filtered navigation. Confirmations and component-memory issuance retain
explicit uncertainty handling, while later authoritative status removes stale URLs.

- `src/components/app-shell/AppShell.tsx:279` — `navigation.some`: gates the profile link on scheduling access.
- `src/components/calendar-feed/CalendarSubscription.tsx:34` — `const current = await refresh();`: clears superseded post-commit output and success.
- `tests/e2e/calendar-feed.e2e.spec.ts:380` — `15.5-E2E-010-`: AC2/6 actual supersession clears rendered controls and notice; execution pending.
- `tests/e2e/calendar-feed.e2e.spec.ts:447` — `15.5-E2E-011`: AC2/6 current-revision control retains issuance; execution pending.

### Signed current-self authority and atomic writes

Ordinary JWT commands derive self authority; SQL rechecks current exact membership
and role union under the scheduling tenant lock. Dedicated proofs bind privileged
inputs, and CAS/history/audit commit together without plaintext recovery.

- `src/server/commands/calendar-feed/manage-calendar-feed.ts:10` — `calendarFeedConfig`: exposes plaintext only after confirmed fresh SQL success.
- `src/server/commands/calendar-feed/manage-calendar-feed.ts:32` — `command: "calendar_feed.create"`: literal create/rotate/revoke declarations retain independent enrollment discovery.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:162` — `create function public.manage_calendar_feed`: checks signed authority, revision, replay and audit.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:122` — `is distinct from (case`: preserves domain branches while delimiting CASE within the PL/pgSQL IF; subsequent native stack resets compiled it.
- `tests/support/calendar-feed-atdd.ts:270` — `const allowed = ["membershipId"`: checks raw JWT status keys before mapper reconstruction.
- `tests/integration/rls/calendar-feed.rls.test.ts:129` — `15.5-RLS008`: AC1/4/9 raw status/hash and direct-DML assertions; execution pending.

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
- `tests/integration/calendar-feed/public-feed.int.test.ts:364` — `15.5-API018`: AC5/8 durable token/IP and last-use assertions; execution pending.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:27` — `pg_has_role(current_user,feed_owner.oid,'SET')`: qualifies source ownership authority independently of creator ADMIN.
- `tests/integration/commands/calendar-feed.int.test.ts:434` — `memberships.every(row => row.inherit_option === false)`: AC4/9 fresh/replay inherited-owner privileges denied; native execution pending.
- `tests/support/calendar-feed-atdd.ts:472` — `has_schema_privilege(oid,'public','CREATE')`: reads actual effective schema privileges including PUBLIC/inherited access.
- `tests/integration/rls/calendar-feed.rls.test.ts:171` — `publicSchemaCreate: false`: AC4/9 existing RLS010 requires effective CREATE absence; execution pending.
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

- `tests/integration/commands/calendar-feed.int.test.ts:475` — `// FULL rollback comes first`: preserves rollback/reset and same/fresh catalog absence proof.
- `scripts/ci/with-calendar-feed-runtime.mjs:257` — `export function createOwnedGroupStopper`: memoizes settlement, validates capture, passively observes missing-leader group absence and bounds completion/output.
- `scripts/ci/with-calendar-feed-runtime.mjs:179` — `export function createTelemetryObserver`: detects leaks before dropping non-allowlisted output.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:893` — `nonzero/null-signal nested browser loss`: requires retained key custody for abnormal completion.
- `tests/support/calendar-feed-ci-contract.ts:43` — `projectCalendarFeedCiCommands`: validates pinned real wrapper argv and only the two exact workflow inverses.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:32` — `CI command projection rejects`: missing/wrong entry/argv and unrelated-source/workflow negatives preserve the original inverse fence.
- `scripts/ci/with-calendar-feed-runtime.mjs:32` — `function safeDiagnostic`: emits only fixed stages/categories and allowlisted SQLSTATE without native payloads.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:313` — `COMMIT uncertainty is not cleared`: rollback alone cannot establish key absence after attempted COMMIT.
- `scripts/ci/with-calendar-feed-runtime.mjs:443` — `receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);`: rejects unsafe effective settings before entropy on the existing client.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:209` — `privacy preflight rejects incomplete`: malformed and unsafe settings cannot reach a secret or child; actual driver/same-client/query-close cases exercise the surrounding boundary.
- `scripts/ci/with-calendar-feed-runtime.mjs:99` — `export function createCalendarFeedDatabaseClient`: fixes the same qualified source publication, canonical admin and sole captured credential; no default or alternate route.
- `scripts/ci/with-calendar-feed-runtime.mjs:86` — `export async function readCalendarFeedSetupAuthority`: actual authenticated session/current LOGIN+SUPER proof is mandatory before mutation.
- `tests/integration/commands/calendar-feed.int.test.ts:497` — `await fresh.connect(); await setupQualified(fresh); await absent(fresh);`: fresh read-only cleanup independently requalifies authority/privacy and proves absence; native execution pending.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:147` — `setup construction refuses missing`: credential/target refusals cannot reach secrets or children; actual identity negatives and child-config tests complete the bounded boundary evidence.

- `tests/e2e/support/calendar-feed-atdd.ts:83` — `export function createCalendarLifecycleObservations`: AC2/6 observes both transport promises and joins actual readback before teardown; pure regressions are not native acceptance.
- `tests/e2e/support/calendar-feed-atdd.ts:25` — `export function calendarBrowserDiagnostic`: preserves closed stage/category/SQLSTATE without native error payloads.
- `tests/e2e/support/calendar-feed-atdd.ts:705` — `if (base && cleanupAllowed)`: canonical SQL/Auth cleanup waits for verified settlement; unresolved references retain fixture custody.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:489` — `missing leaders with persistent groups`: absence is measured within existing budgets; anonymous groups grant no signaling authority.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:659` — `actual browser bounded cancellation`: timeout cannot credit in-flight SQL/readback settlement; release and real completion are distinct.

- `tests/e2e/support/calendar-feed-atdd.ts:93` — `trackReadback<T>`: registers actual callback/query work independently of Playwright deadlines and closes before drain.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:739` — `installed polling deadline cannot credit`: HTTP completion plus outer timeout cannot credit unresolved physical query siblings or callback completion.

Evidence: historical check receipts retain their exact revisions and dependency
limits. The sixth checkpoint passed 3105 Node units (30 feature and 33 separate
wrapper cases), Python43 and recovery1, with actual original-client setup7 and
privacy4 preflight credit. It still failed DB child settlement and all14 story
browser cases across28 attempts;51 feature DB cases remain unexecuted. The local
33b repair's47 separate bounded Node cases exercise injected lifecycle and actual
pure browser source seams only. Current-head full native DB/HTTP/RLS/INT015,
14 browser acceptances, successful child/key cleanup and attachment-content
privacy remain pending. Source RLS010 effective CREATE and restricted-source
claims cannot borrow the separate real recovery CREATE=false proof. Installed
collection and prior build checks retain their recorded scope; no local managed
runtime was launched. All three broad rounds completed; this repair receives only
a distinct High latest-delta review. No provider/device/visual/performance or
release-ready claim; the unallocated exhaustive branch remains explicitly
release-blocking deferred.
