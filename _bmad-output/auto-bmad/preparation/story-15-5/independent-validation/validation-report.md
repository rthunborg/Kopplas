# Story 15.5 independent specification validation

**FAIL — completed specification validation; two bounded author repairs required before kernel approval/build admission.** Reviewed independently at `159557e114f18123e73282c39c90830917de9948` on `codex/epic-15-scheduling-time-calendar` with gpt-6.1-sol High. This is not an implementation review round, implementation acceptance, release approval or resource grant.

The candidate has 10 tasks, 9 Given/When/Then ACs and the complete approved Story15.5 AC sketch verbatim once. Canonical reader/discovery independently pass with no parse warnings. Fourteen independent checks: 12 PASS, 2 FAIL. No app/build/DB/RLS/HTTP/browser/CI tests ran. Resources 0; implementation changes 0; code-review rounds consumed 0.

- Candidate kernel SHA256: `e0f81d85be76f7d33a1c17e6db2a47002f2ea8692571e415c91be338087985b8`.
- Raw specification SHA256: `0fac6de1fea61340517fbb865efc20830a764220f3b7030e3abed302cd138b88` (26,156 bytes).
- Original author manifest SHA256: `bcaf54e0f8914e777acc281413de5652902734e6ba8c7c99218f1893bde419e5`.
- No approved kernel exists. The ready-for-dev author/frontmatter status does not override this independent FAIL.

## F15.5-01 — Define the actual tenant eligibility predicate (P1 specification ambiguity)

The kernel at spec line31 says “rechecks active tenant/membership/current permission”; AC4 at line97 separately invalidates an “inactive tenant.” The design companion at line7 repeats an active-tenant check without defining its predicate.

Actual schema and authority:
- `supabase/migrations/20260625122433_tenant_foundation.sql:45` creates tenants with id/name/timestamps. The active/invited/disabled status belongs to tenant_memberships.
- `supabase/migrations/20260919090000_tenant_provisioning.sql:21` adds nullable provisioning_state; line25 permits NULL and invitation/provisioning handoff values, with no inactive/disabled tenant value. Legacy NULL compatibility is explicit at line26.
- `src/server/auth/resolve-tenant-context-core.ts:99` gates active membership and returns the membership-derived tenant/roles at lines128/130. It has no separate tenant lifecycle predicate.
- `supabase/migrations/20260904120000_role_storage_and_permission_matrix.sql:45` implements has_tenant_role using current active membership and the scalar/additional role union, without an independent tenant-active condition.

**Reachable caller/impact:** a currently authorized user in an existing legacy tenant with NULL provisioning_state can open settings or use their capability. Implementing active as provisioning_state=ready would deny that current valid path; silently ignoring the undefined inactive-tenant condition leaves AC4 and its negative fixture unexecutable. No downstream current helper resolves it.

**Smallest repair:** explicitly define the existing-model predicate: tenant exists, exact token-bound/current self membership is active and the current Bookings.View role union allows the operation. Preserve NULL provisioning-state compatibility and remove the independent inactive-tenant claim/fixture if that was only shorthand. Do not invent tenant suspension or repurpose provisioning_state. A separate tenant-wide suspension rule would need identified approved authority before implementation. Align kernel, AC4, companion, SQL/test obligations and handoff. Require a legacy NULL+active-member positive and disabled-member/role-loss negatives. This bounded existing-model clarification needs no new human decision.

## F15.5-02 — Preserve the entry in the actual personal calendar view (P2 missing approved UI entry)

Approved UX `_bmad-output/planning-artifacts/ux-design-specification-phase-b.md:244` explicitly says that the personal Min kalender agenda/week view includes Kalenderprenumeration. Line120 separately requires the user-menu entry.

The candidate design at companion line35 adds profile-menu Min kalender→/settings/calendar and a reverse settings→agenda link. T5/spec line85 and the exact handoff list the new settings components and AppShell, but neither the personal view nor its host. Actual `src/components/scheduling/PersonalCalendarView.tsx:4` renders agenda/grid/empty state only; `SchedulingWorkspace.tsx:175` mounts it for the personal view. There is no existing subscription entry downstream.

**Reachable caller/impact:** a Bookings.View user already in Planering→Min kalender still has no Kalenderprenumeration entry if the proposed inventory is implemented exactly. A reverse link and a profile-menu item do not implement the specified direction. Owner-authorized defaults do not replace this explicit UX rule.

**Smallest repair:** add a small accessible Kalenderprenumeration link from the actual personal calendar view to the single shared /settings/calendar surface. Name its exact existing path and small test change in T5/handoff for Coordinator allocation; extend the essential browser plan to start there and continue to the self lifecycle. Keep the profile entry, headless shared management logic and one settings component; no new nav/module or duplicate lifecycle UI.

## Unchanged design assessment that may be reused after repairs

| Check | Verdict | Independent basis |
| --- | --- | --- |
| C01/C02 provenance and canonical acceptance | PASS | All original 14 manifest bindings plus manifest hash match; exact HEAD/branch; source sketch, tasks/ACs and real reader/discovery confirmed. |
| C03 scope and ADR | PASS | ADR-B004 §§6.1–6.6 explicitly requires the minimal own feed, hash-only 32-byte token lifecycle, DB-backed independent token/IP limiting, Admin monitoring and isolated public group. Only calendar_feed_tokens/calendar_feed enroll in already active scheduling. Global IP infrastructure needs explicit ACL/RLS tests. |
| C04 exact self subject | PASS | Current Bookings.View allows Admin/PL/Montör union. Membership/profile/assignment joins are the right authority. Manager-wide cookie-bound readScheduling and Montör-only/archive-incomplete booking_owned_by_current_user cannot safely serve this feed. |
| C06 lifecycle/uncertainty | PASS | Server entropy/hash-only generation, current self authority, CAS/attempt, atomic audit, sanitized duplicate outcome and explicit new rotation for lost raw URL are coherent. No escrow or silent retry rotation is proposed. |
| C07 signed RPC/owner | PASS | Feed-only short-lived canonical signed hashes prevent direct anon IP-hash choice and authenticated weak chosen-token-hash insertion. Proof remains subordinate to current capability/self eligibility. Exact NOLOGIN owner policies/grants and a postgres-owned filtered Vault helper follow a feasible existing pattern; no service role or general Vault grant. |
| C08 commit ordering | PASS | Candidate requires compatible current-authority locks and actual revoke/fetch, assignment/profile/membership/role races. A pre-revoke admitted fetch may finish. Historical scheduling tests are not new feed evidence. |
| C09 limits/IP/monitoring | PASS | Existing unsubscribe counters are paired and directly accept IP hash, so reuse would fail independent axes. New DB-owned 900-second 60/token and 120/IP windows, common invalid-token IP budget, no revoked-only oracle, sanitized Admin aggregate and bounded global counter housekeeping are sufficient planning requirements. Trust falls back to one unknown bucket until deployment context is actually verified. |
| C10 live minimal iCalendar | PASS | Complete JSON/paging avoids row caps; materialized own planned events, stable booking UID, current omission, minimal labels, UTC/DST/all-day DATE semantics, independent parser/known bytes and injection/folding tests are required. No stored feed or invented date horizon. |
| C11 public isolation | PASS | Current global middleware refresh and transitive unsubscribe cookie client confirm the need for the exact feed-only early bypass, new cookie-free anon client, transitive import guard and real hostile-cookie HTTP checks; protected refresh/unsubscribe are preserved. |
| C13 usable headless flow/evidence | PASS | State/actions/validation/serializer remain independent of presentation. Real persistence/reconcile/error/copy/phone/keyboard flow, full required DB/RLS plus direct physical Storage, essential production-server browser and independent High actual-diff review remain development gates. Deferred release matrices/polish are not passed. |
| C14 ownership/integration | PASS | No E16 scheduling proof/editor/capacity/job DTO change is proposed. New actual-head consumption needs coordination. Exact shared semantics, fresh migration chronology/reservation, isolated runtime/key/fixtures and new serial fault-DDL admission remain future prerequisites. |

These PASS statements assess the plan's sufficiency, not the future implementation. Effective PUBLIC/inherited ACLs, private helper/key denial, proof field/domain/expiry parity, server-only generation, independent counter races, uniform errors/cache/shell behavior and large complete-event data still need actual tests and implementation review.

The API grants/RLS distinction was checked against [Supabase's primary RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security). Proposed CRLF/escaping/UTF-8 folding and exclusive all-day date semantics were checked against [RFC5545](https://www.rfc-editor.org/rfc/rfc5545.html). [Vercel's request-header documentation](https://vercel.com/docs/headers/request-headers) does not prove this project's deployed proxy topology. Changelog index and relevant PostgreSQL/TLS changes were reviewed read-only; no upgrade/runtime/project setting was changed. No legacy URL/evidence was used.

## Preservation and execution limits

The original 15 author files (14 bindings plus manifest) were frozen and hashed before review. The independent read-only validator rechecks those values, all 40 inspected source snapshots, exact HEAD/branch, cached Epic15 context, source acceptance, task/AC count and canonical reader/discovery. The only tracked differences allowed are Root's known Story15.5 and Epic15 state records; neither is attributed to the author or modified here. Source/app/schema/tests/dependencies/env/sprint remain unchanged by this validator.

Only this independent directory's report JSON, report Markdown, read-only validator and manifest were written. The author validator was inspected but not executed because it writes original author receipts and expects pre-Root clean state. No build-auto create/build workflow, app test, schema/Vault operation, background resource, foreign fixture, secret/provider grant, Git commit/push/PR/merge or deployment occurred. No optional release check was promoted to a development blocker.

Reproduce artifact integrity with:

```powershell
python _bmad-output/auto-bmad/preparation/story-15-5/independent-validation/validate-independent.py
```

An artifact-integrity PASS does not change the specification verdict FAIL.

## Handoff and resume

Original author repairs the two findings and refreshes affected canonical/raw/kernel/manifest receipts. A targeted independent High revalidation can reuse the unchanged assessment above; this does not consume a code-review round. Root keeps implementation on hold until actual PASS and kernel freeze. Coordinator allocation then covers exact shared paths/migration chronology/new serial files/fixtures/test key and isolated verification resources.

No human question is open. Hosted feed enablement remains separately authorized release operations work with dedicated key/Vault/runtime and trusted-IP evidence. Required implementation evidence and independent actual-diff review remain pending. Exhaustive device/calendar-provider/visual/manual/performance/polish work remains owned deferred release validation. release_ready=false; inherited epic review_unverifiedTRUE and merge/deployment boundaries remain.
