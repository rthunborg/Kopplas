---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-20'
workflowType: 'testarch-atdd'
storyId: '15.5'
storyKey: 'spec-15-5-personal-calendar-feed-adr-b004-surface-1'
storyFile: '_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-spec-15-5-personal-calendar-feed-adr-b004-surface-1.md'
generatedTestFiles:
  - 'tests/integration/commands/calendar-feed.int.test.ts'
  - 'tests/integration/calendar-feed/public-feed.int.test.ts'
  - 'tests/integration/rls/calendar-feed.rls.test.ts'
  - 'tests/e2e/calendar-feed.e2e.spec.ts'
  - 'tests/integration/components/calendar-feed.test.ts'
  - 'tests/unit/features/calendar-feed/icalendar.test.ts'
  - 'tests/unit/features/calendar-feed/validation.test.ts'
  - 'tests/unit/features/calendar-feed/action-state.test.ts'
  - 'tests/unit/server/calendar-feed/attestation.test.ts'
  - 'tests/unit/server/calendar-feed/trusted-ip.test.ts'
  - 'tests/unit/server/calendar-feed/public-shell.test.ts'
inputDocuments:
  - '_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md'
  - '_bmad-output/auto-bmad/preparation/story-15-5/accepted-ownership-allocation.json'
  - '_bmad-output/auto-bmad/preparation/story-15-5/current-contracts-and-design.md'
  - '_bmad-output/auto-bmad/preparation/story-15-5/implementation-ownership-handoff.md'
  - '_bmad-output/auto-bmad/preparation/story-15-5/ownership-inventory-successor.md'
  - '_bmad-output/test-artifacts/test-design-epic-15.md'
  - 'docs/process/development-completion-policy.md'
  - 'docs/process/agent-model-routing.md'
  - 'docs/process/local-setup.md'
  - '_bmad/tea/config.yaml'
  - 'package.json'
  - 'vitest.config.ts'
  - 'playwright.config.ts'
---

# ATDD Checklist — Story 15.5 Personal Calendar Feed

P4 RED scaffolding is complete. All new tests remain skipped and **all nine ACs remain unproven**. No application, schema, environment, dependency, persistent key, runtime service, Git or remote operation was performed. Root owns the next phase and Git/state/sprint. Development completion and release readiness are not claimed.

Users will manage their own read-only calendar capability from the actual personal calendar and profile menu. Anonymous fetch must derive only the current exact subject from a hashed capability, serialize complete minimal live events, and enforce current authority, immediate lifecycle ordering and independent abuse budgets.

## Execution decisions

- Create mode; AI generation from the approved frozen contract. Rasmus's interactive choices were answered autonomously under the parent instruction. No recording, browser or legacy observations.
- Next.js detected as frontend with server/PostgreSQL behavior; node:test units, Vitest integration/SSR and Playwright browser runner already configured. Existing installed dependencies suffice for P4.
- Primary level: actual SQL/HTTP integration, with pure unit vectors and a focused essential browser journey. P0 covers authorization, disclosure, audit/CAS/revoke and counters; P1 covers RFC/date semantics and essential usability. R-008/R-009 = 2×3=6 in Epic15 TEA; no invented performance threshold.
- Requested mode auto, capability probe enabled. Native subagent support present; no distinct agent-team API. Resolved subagent mode. Required API and E2E foreground workers both completed on explicitly selected gpt-6.1-sol High. Parent handled six unit files and the SSR component file. No speedup percentage is asserted.
- Confidence 9 for contract-driven scaffolding: the approved 10 tasks/9 ACs, accepted allocation and existing fixture/source patterns are available. Concrete production exports, RPC identifiers, props and new accessible control wording are deliberately unbound. These are P5 source bindings, not invented product APIs or verified selectors.
- Playwright Utils flag=true but package absent; the library-integration-mandate two gates select existing vanilla conventions. No dependency or merged-fixture imports were invented. Pact is not relevant to this first-party feature and its package is absent. Pact broker unreachable: SmartBear MCP tools not available; no broker query or provider-state claim. New-feature intent comes from the frozen contract, current source supplies existing patterns.

## Exact approved acceptance criteria

- AC1 — Given a current active Bookings.View user opening Kalenderprenumeration from the actual Planering Min kalender view or the separate profile-menu entry, when they create, rotate or revoke their own capability, then only their exact membership's generation changes with attributable atomic audit, a fresh 32-byte base64url URL is issued once on create/rotate, old links stop on rotation/revoke, and no peer/admin-on-behalf action or plaintext/hash disclosure is possible through status/direct DB paths.

- AC2 — Given stale or concurrent lifecycle actions, failed audit, lost committed response or explicit retry, when the user reconciles/retries, then revision/attempt/current-authority rules prevent duplicate rotation/audit, stale overwrite and resurrected tokens, uncertain UI stays honest, and an unrecoverable issued URL is replaced only by a separately explicit rotation; failure leaves no partial generation transition.

- AC3 — Given a valid capability with own/shared/materialized recurring bookings, when an anonymous GET occurs after create/edit/exception/split/cancel/reassignment, then complete current planned own events regenerate once with stable booking UIDs, independently correct UTC timed/Stockholm all-day exclusive dates, safe minimal title/job/customer/location and no co-assignees/money/notes/contact/tenant details; cancelled/unassigned/archived-profile data is omitted and no-profile returns a valid empty calendar.

- AC4 — Given revoked, rotated, unknown or malformed tokens with equal IP request history, when feed GET/direct RPC probes include tenant/user overrides, then they yield the same generic inactive404 body/headers without tenant/subject oracle, and forged/expired/missing proofs or spoofed direct IP/hash inputs cannot disclose data or bypass current authorization; a missing tenant, disabled/invited/missing exact membership or current Bookings.View role loss also invalidates access, while an existing legacy tenant with NULL provisioning_state and an otherwise eligible exact membership remains allowed.

- AC5 — Given many tokens from one IP, one token across IPs and concurrent fixed-window requests, when either independent 900-second budget 60/token or 120/IP is exceeded or rolls over, then database counters enforce the correct boundary without race bypass/overflow,429/Retry-After is correct, invalid shapes share IP enforcement, and counters/spike flags persist as sanitized own-tenant Admin monitoring with no raw token/IP/hash leak.

- AC6 — Given the real authenticated settings UI and an actual successful feed fetch, when status refreshes, then Senast hämtad/usage reflects database admitted fetch rather than lifecycle creation, never-used is explicit, the plain-language warning/one-time copy fallback/confirmations/pending/error/retry states work on desktop and 360×640 keyboard/touch, and non-Admin users cannot read the tenant abuse queue.

- AC7 — Given no session or hostile auth cookies/headers/cache validators, when the feed route executes, then middleware and all transitive public imports perform no auth refresh/session/tenant-context/nav/AppShell work, send no Set-Cookie/redirect or shared-cache304, and a current capability alone governs the no-store live response; protected route refresh and existing unsubscribe behavior remain intact.

- AC8 — Given malicious text/newlines/multibyte labels, boundary DST/all-day/overnight times, database/configuration failure or a large own materialized dataset, when the feed is serialized, then RFC5545 CRLF/escaping/75-octet safe folding and complete independent-parser events hold without injection, silent row truncation or persisted feed, and failures return generic503 before any partial/false-empty calendar.

- AC9 — Given actual anonymous/own/manager/mixed/peer/foreign/inactive/platform-only callers and current15.1–15.4/job fixtures, when full ADR-B004 SQL/RLS/ACL/HTTP and essential browser suites run, then all required positives/negatives pass with current self-only authority using tenant existence and the exact active membership/current role union (not provisioning_state), immediate commit-ordered revoke/assignment behavior, no privileged/public/client bypass and preserved recurrence/resolver/report/job semantics; calendar_feed is the only newly enrolled public surface.

## Scenario mapping and test files

The inventory counts syntactic test.skip declarations. Loops can expand native cases; inner assertion-vector loops are not separately credited. Detailed ID/AC/priority lists are in scaffold-inventory.json and both worker JSON outputs.

| Class | Declarations | Current evidence |
| --- | ---: | --- |
| serial-db-http | 34 | Installed Vitest glob/static AST only; no globalSetup/test bodies |
| rls | 12 | Installed Vitest glob/static AST only; no globalSetup/test bodies |
| e2e | 9 | 11 cases from Playwright --list only; no browser |
| component | 4 | Installed Vitest glob/static AST only; no globalSetup/test bodies |
| unit | 21 | 22 native registrations, 22 skipped; 0 assertions |

| File | Lines | Declarations |
| --- | ---: | ---: |
| tests/integration/commands/calendar-feed.int.test.ts | 274 | 14 |
| tests/integration/calendar-feed/public-feed.int.test.ts | 398 | 20 |
| tests/integration/rls/calendar-feed.rls.test.ts | 229 | 12 |
| tests/e2e/calendar-feed.e2e.spec.ts | 331 | 9 |
| tests/integration/components/calendar-feed.test.ts | 38 | 4 |
| tests/unit/features/calendar-feed/icalendar.test.ts | 69 | 5 |
| tests/unit/features/calendar-feed/validation.test.ts | 37 | 3 |
| tests/unit/features/calendar-feed/action-state.test.ts | 40 | 3 |
| tests/unit/server/calendar-feed/attestation.test.ts | 62 | 4 |
| tests/unit/server/calendar-feed/trusted-ip.test.ts | 35 | 3 |
| tests/unit/server/calendar-feed/public-shell.test.ts | 38 | 3 |

| AC | Planned declarations that mention it | Primary purpose |
| --- | ---: | --- |
| AC1 | 23 | own issuance/rotation/revocation, once-only plaintext, exact self authority and audit |
| AC2 | 19 | CAS/replay/lost response/audit rollback and commit-ordered lifecycle/fetch races |
| AC3 | 13 | complete current planned own materialized events, minimal disclosure and independent dates/UIDs |
| AC4 | 29 | generic invalid capability, direct proof/override/current-authority negatives and legacy NULL positive |
| AC5 | 18 | independent 60/token and120/IP per900 seconds, DB clock/concurrency/persistence and sanitized monitoring |
| AC6 | 16 | actual fetched last-use, honest connected UI/copy/failure/phone/keyboard and Admin separation |
| AC7 | 8 | exact public preauth bypass/transitive isolation and real hostile-cookie/cache probes |
| AC8 | 10 | independent RFC5545/UTF8/DST/all-day vectors, complete large feed and atomic generic503 |
| AC9 | 25 | ordinary/direct SQL ACL/RLS and existing scheduling/report/job integrity/closed-scope preservation |

## RED and static evidence

- Native unit discovery: 22 registered, 0 passed, 0 failed, 22 skipped, 0 todo. These are not passing acceptance cases.
- Bounded native source-presence RED probe activates one stored scaffold **in memory only**: 3 registered, 1 executed and failed ENOENT before its first assertion, 2 skipped, 0 acceptance assertions. Stored files remain test.skip. This confirms missing route source only, not security/runtime behavior. native-red-probe.txt preserves the actual failure.
- Playwright --list: 11 cases, 1 file; no setup, production web server or browser launched. The source-inspected existing names and proposed new selectors are separately recorded in e2e-worker.json/e2e-notes.md.
- Installed Vitest glob + collect({staticParse:true}): four new integration files discovered. Normal collectTests was inspected and deliberately not called because it initializes globalSetup. This is STATIC discovery, not runtime partition/order evidence.
- Current config still puts the two future serial files in the parallel project. They contain only skipped declarations. P5 must make the accepted exact include/exclude and six-file partition changes before any real fixture runs. No planned config is labelled PASS.
- Final typecheck, scoped lint, scaffold inventory, frozen preservation and diff checks passed; command receipts and the initial repaired TypeScript data-typing failure remain in atdd/. No application build, required database lane, Storage check or browser acceptance was run in P4.

## Fixture infrastructure and binding needs

Two new helpers exist: tests/support/calendar-feed-atdd.ts (API worker sole owner) and tests/e2e/support/calendar-feed-atdd.ts (E2E worker sole owner). They define typed **test observations**, UUID/data constructors and independent parsing or semantic expectations. Their entry points throw intentional fixed RED errors before callbacks. The six unit files and component file also name explicit unbound actual-subject adapters. These are not production signatures or mock success implementations. Activating skips alone cannot satisfy acceptance.

P5 must bind ordinary-JWT checked commands/raw RPCs, exact current-self status, physical PostgreSQL rows/audit/effective ACLs, real anonymous HTTP and actual production-host browser actions. Reuse tests/factories and existing authenticated testclients; do not call production NEXT_PUBLIC_SUPABASE_URL getters as a fixture substitute. No fixture may return configured receipts without calling and observing the actual system. Independent time/UID/field/event/counter oracles come from approved constants and controlled seed facts, never from production output.

Only tests/integration/commands/calendar-feed.int.test.ts and tests/integration/calendar-feed/public-feed.int.test.ts may own later shared DDL, ephemeral key changes or the isolated unknown-IP budget. RLS stays row-isolated with read-only allocated key; component stays SSR/headless with no global state. Browser fixtures do not consume the serial global key/budget helper. Use UUID tenant/subject/attempt/correlation/stage scope, bounded barriers, release before settling all work, preserve primary and every cleanup error, drop only owned temporary objects and prove catalog absence. Settle owned references before Auth deletion. Do not weaken direct physical Storage integrity.

The release operator separately owns hosted dedicated key/Vault/runtime and verified platform IP trust. P4 creates no key. Future isolated tests may use a unique ephemeral 32-byte TEST key only in owned process/Vault fixture and redacted cleanup, never host .env/provider/CI persistent secrets or a borrowed production key. Root alone manages any needed guarded resource launches.

## Mock and selector requirements

External service mocks: none. No calendar-provider API, supplier, live mail, hosted key or new test endpoint is needed. UI faults may hold/drop a real request/response, but must never fulfill fabricated success. A lost-response case joins the actual SQL commit before dropping transport bytes.

Existing source anchors include Planering, Profil, Huvudnavigation, Min kalender tab/region, Datum, Period, Egen agenda/veckokalender and the empty-state copy. The pinned new entry/title is Kalenderprenumeration and the single settings route is /settings/calendar. Other new lifecycle names, warnings, errors and Admin region names in calendarNames are proposed accessible selectors requiring source and actual browser confirmation in P5. No new data-testid is mandated. Keyboard traversal, dialog focus return, connected failure/retry and 360×640 touch are essential functional checks, not screenshot claims.

One-time capability values must remain in private memory and out of matcher diagnostics, logs, traces, HAR, screenshots/video, browser storage, errors and reports. Opaque handles or redacted boolean checks carry observations; no hash/IP/proof/key or plaintext recovery crosses own-status/Admin DTOs. Preserve driver redaction when replacing RED adapters.

## P5 activation checklist aligned to the ten approved tasks

- [ ] T1/T6: bind pure validation/32-byte issuance/hash, action-state and RFC5545 adapters; run independent CRLF/escaping/UTF8-folding, UTC/Stockholm DST/all-day/exclusive-date/stable UID and uncertainty goldens RED→GREEN. Concrete canonical proof schema/field-order goldens must be reconciled against the implemented contract; test-side conceptual names are not SQL argument requirements.
- [ ] T2: after fresh combined E15/E16 collision check, create only the allocated forward migration 20261020220000_personal_calendar_feed.sql by the authorized process. Preserve all history and E16's 210000 reservation. Enroll only calendar_feed_tokens and calendar_feed for active scheduling; asset_qr remains pending, unsubscribe remains existing.
- [ ] T3/T7: bind real lifecycle/proof/public-client/checked SQL; prove current exact active membership + Bookings.View union + tenant existence, legacy NULL provisioning positive, self-only managers, direct ACL/RLS/forgery negatives, dedicated filtered Vault authority and no service role/client-secret path.
- [ ] T4/T7: bind real cookie-free anonymous GET and trusted-IP private seam. Test complete current minimal own events, uniform equal-history404, independent60/token and120/IP per900 seconds, DB clock/window/concurrency/failure persistence,429/Retry-After and generic503 before partial/false-empty output.
- [ ] T5/T9: implement actual personal agenda/week/empty subscription entry and profile entry to the single settings surface; bind usable own lifecycle/status/one-time copy/fallback and separate Admin aggregate. Confirm proposed labels from actual UI.
- [ ] T7: activate every new serial/RLS declaration against actual isolated PostgreSQL/HTTP, with scoped observable faults, barrier order, transaction settlement and physical readbacks. Implement fixture cleanup/redaction and require all new cases active before acceptance.
- [ ] T8: strengthen actual transitive public containment and exact middleware bypass; preserve protected refresh/unsubscribe. Extend effective ACL/H4/manifest tests and regressions without broadening permission grants or deferred surfaces.
- [ ] T8 configuration: append the two exact serial files to existing Vitest include and matching parallel exclude; preserve prior four files/order, group0 parallel/group1 serial, globalSetup/timeouts/retry0/unhandled-error policy. Extend exact six-file partition test expectations without losing duplicate/missing/overlap/reversed/equal-order/teardown negatives, and prove actual installed collection/order later. Append only the feed E2E file to test:smoke, preserving all current and future joined E16 entries/reporters.
- [ ] T9: run essential real production-browser lifecycle journey and hostile-cookie/public HTTP checks, with no next dev/SSR/VM/mocks substituted for browser/DB evidence. Retain actual executed/failed/skipped counts and sanitized physical rows.
- [ ] T10: document dedicated key/trust/monitoring operations; write actual delivery record and author Suggested Review Order, obtain independent High review within three completed rounds and run Root's delivery/truth gate. Preserve inherited review_unverifiedTRUE and one final epic PR/agent-fix policy. No merge/deployment/Preview/provider action is authorized here.

## Commands and evidence boundaries

Verified no-resource P4 commands (run from this checkout):

    node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/calendar-feed/*.test.ts tests/unit/server/calendar-feed/*.test.ts
    node node_modules/@playwright/test/cli.js test tests/e2e/calendar-feed.e2e.spec.ts --list --reporter=list
    node _bmad-output/auto-bmad/preparation/story-15-5/atdd/static-discovery.mjs
    node node_modules/typescript/bin/tsc --noEmit --incremental false
    node _bmad-output/auto-bmad/preparation/story-15-5/atdd/validate-preservation.mjs

Later only after Root resource/fixture and P5 admission: use the full required SUPABASE_TEST_REQUIRED=1 pnpm run test:int lane, report native executed/failed/skipped counts and direct physical recovery Storage evidence; execute the configured production Playwright smoke through Root's guarded owned lane. Scoped runs supplement the full lane. Frozen install/static/build, unchanged scheduling/series/resolver/report/job regressions, combined-history replay/H4/effective grants and exact-head CI remain P5 development gates. Historical15.4 CI and52 historical skips remain predecessor truth, not15.5 coverage. Windows xattr skip is not Linux success.

Effort estimate: no new hours/story-points estimate is asserted; the approved ten tasks govern scope. Both worker outputs provide exact generated test counts and fixture needs, not implementation-duration promises.

## Preservation and manual handoff

The frozen Spec was not edited to link artifacts. Root/P5 should discover this checklist through this handoff path rather than changing the pinned contract during P4. The approved kernel, raw Spec,35 author bindings,8 independent files,40 historical source snapshot bindings and accepted allocation hashes matched. New P4 test sources are explicit additions; this is not a claim that the tests tree is byte-unchanged. Existing package/vitest/partition companions remain unchanged. Root's preexisting dirty bookkeeping and untracked allocation were preserved.

Validation of the skill checklist is scoped truthfully: prerequisites/AC analysis/test-skip structure/typed scaffold code/static discovery/output metadata/worker completion/preservation are satisfied. Real fixture binding, cleanup execution, database/browser acceptance and GREEN are deferred P5 work. Faker, new dependencies, generic tests/api directories, merged-fixtures and external contract mocks are not applicable to this project's accepted existing-runner/no-dependency scope. Related knowledge fragments and source references are in run-context.json and worker JSON. No broad specification re-review or implementation review round was started.

## Deferred release validation

| Item | Owner | Status/evidence | Next action |
| --- | --- | --- | --- |
| Exhaustive browser/view matrix | QA/UX | Deferred, unexecuted | Run approved representative states after essential functionality passes |
| Device/calendar-provider matrix | QA/UX | Deferred, unexecuted | Exercise approved devices/providers with sanitized fixtures |
| Screenshots/visual comparison | QA/UX | Deferred, unexecuted | Capture approved non-secret representative views |
| Manual accessibility/daylight/exploration | QA/UX | Deferred, unexecuted | Record actual manual observations |
| Representative full-feed workload/performance | Product/Architect + ops | Deferred, volumes/targets unapproved | Approve workload/thresholds then measure |
| Polish | Delivery owner | Deferred, unexecuted | Triage after functional evidence |

Development complete is distinct from release ready. P4 is neither; release_ready=false. No historical skip, static parse, synthetic fixture, predecessor CI or source-presence failure proves a15.5 AC. Next recommended workflow is Root-admitted P5 build; automate follows implementation. No per-story trace advisory was requested for the six-story route. HALT after P4.
