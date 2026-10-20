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

## Suggested Review Order

Author: Story 15.5 implementation/fix author (gpt-6.1-sol High), incorporating
explicitly delegated browser and bootstrap contributors. Refreshed after all
Round 3 latest-fix inheritance assertions and the bounded checkpoint CI repair.
Stops below resolve to final source literals before the repair commit.

### Own settings and honest lifecycle results

The two personal entry points reach one settings surface; the profile entry uses
server-filtered navigation. Confirmations and component-memory issuance retain
explicit uncertainty handling, while later authoritative status removes stale URLs.

- `src/components/app-shell/AppShell.tsx:279` — `navigation.some`: gates the profile link on scheduling access.
- `src/components/calendar-feed/CalendarSubscription.tsx:34` — `const current = await refresh();`: clears superseded post-commit output and success.
- `tests/e2e/calendar-feed.e2e.spec.ts:370` — `15.5-E2E-010-`: AC2/6 actual supersession clears rendered controls and notice; execution pending.
- `tests/e2e/calendar-feed.e2e.spec.ts:432` — `15.5-E2E-011`: AC2/6 current-revision control retains issuance; execution pending.

### Signed current-self authority and atomic writes

Ordinary JWT commands derive self authority; SQL rechecks current exact membership
and role union under the scheduling tenant lock. Dedicated proofs bind privileged
inputs, and CAS/history/audit commit together without plaintext recovery.

- `src/server/commands/calendar-feed/manage-calendar-feed.ts:10` — `calendarFeedConfig`: exposes plaintext only after confirmed fresh SQL success.
- `src/server/commands/calendar-feed/manage-calendar-feed.ts:32` — `command: "calendar_feed.create"`: literal create/rotate/revoke declarations retain independent enrollment discovery.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:162` — `create function public.manage_calendar_feed`: checks signed authority, revision, replay and audit.
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
- `tests/integration/commands/calendar-feed.int.test.ts:420` — `memberships.every(row => row.inherit_option === false)`: AC4/9 fresh/replay inherited-owner privileges denied; native execution pending.

### Isolated CI custody and honest evidence limits

Only captured child identities and one ephemeral Vault UUID belong to the wrapper.
The added PG17 case qualifies that disposable stack and owns transaction-local
UUID roles/schema/function through dedicated connections, with no pool reuse.
Settlement is memoized; abnormal browser teardown retains exact job custody, while
privacy detection measures raw output in memory before sanitized records persist.

- `tests/integration/commands/calendar-feed.int.test.ts:461` — `// FULL rollback comes first`: preserves rollback/reset and same/fresh catalog absence proof.
- `scripts/ci/with-calendar-feed-runtime.mjs:166` — `export function createOwnedGroupStopper`: memoizes settlement and verifies identity before signaling.
- `scripts/ci/with-calendar-feed-runtime.mjs:88` — `export function createTelemetryObserver`: detects leaks before dropping non-allowlisted output.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:308` — `nonzero/null-signal nested browser loss`: requires retained key custody for abnormal completion.
- `tests/support/calendar-feed-ci-contract.ts:43` — `projectCalendarFeedCiCommands`: validates pinned real wrapper argv and only the two exact workflow inverses.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:18` — `CI command projection rejects`: missing/wrong entry/argv and unrelated-source/workflow negatives preserve the original inverse fence.

Evidence: the checkpoint repair records 302 executed focused Node cases with zero
failures/skips, final typecheck/focused lint and the fresh application build.
The previous checkpoint failed eight unit tests; it remains failed historical
evidence, despite its 30 feed Node/22 bootstrap passes. Current separate bootstrap
inventory is 23. Its dependencies are synthetic; recovery assertions are static,
not restore evidence. Earlier passing checks retain their recorded dependencies.
All 51 native Vitest and 14 browser bodies remain pending locally; API001 covers
live label revisions, API018 cancellation/counters, RLS008 raw status privacy,
and E2E-001 the essential actual production lifecycle. Existing ACL/RLS010,
serial cleanup and full regressions also require exact-head CI. All three rounds completed; CI-repair latest-delta High regression review, restricted-executor
PG17 execution, live lifecycle/recovery and final truth qualification
are outstanding. No provider/device/visual/performance or release-ready claim;
the unallocated exhaustive branch remains explicitly release-blocking deferred.
