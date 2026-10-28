---
title: 'Story 35.2: Tokens Font And Real Login'
type: feature
created: '2026-10-28'
status: blocked
tracking_key: 35-2-tokens-font-and-real-login
baseline_revision: 5b167f1be0b3d96c1d7e9d53737211e3008eeb7e
planning_revision: d5fc62a88a25bf345754e3f62e5bbea7af964337
review_loop_iteration: 0
followup_review_recommended: true
context:
  - docs/process/review-order.md
  - docs/quality/frontend-quality-gate.md
  - docs/quality/story-35-2-approved-admission-2026-10-28.json
  - docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md
  - _bmad-output/test-artifacts/test-design-spec-design-35-2.md
  - _bmad-output/specs/spec-design-35-2/source-binding.json
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Approved Story 35.2 has accepted foundation/login direction, but the actual application still uses Geist, generic colors and its original password-login presentation.

**Approach:** Bind the approved official Inter v4.1 assets and written semantic tokens to the existing Tailwind v4/root layout, then compose the real credential form using accepted source grouping and the existing authentication seam. This is the sole admitted story, with a checkpoint after completion.

## Boundaries & Constraints

**Always:** Preserve all canonical AC/state/test IDs and applicability below, exact approved source hashes, Swedish content, server-derived role landing, refresh-before-replace, safe errors and browser-safe client. The dated human admission supersedes historical preparation blockers only where evidenced. Preserve canonical body verbatim. Resolve its relative links against `_bmad-output/implementation-artifacts/spec-35-2-tokens-font-and-real-login.md`, never this adapter directory. Canonical test slice resolves from its own original path. Actual written DESIGN/EXPERIENCE and detailed annex supersede prototype styling. Read the High test plan rather than reinvent authentication policy.

**Block If:** New sensitive behavior/uncertainty requires bounded Sol High assessment before deciding, and independent High review. Conflicting live ownership or required writes beyond allocated paths need exact coordinator reconciliation. Missing actual runtime/visual acceptance blocks development completion, not this planning exit. Trusted-main source/policy integration remains a hosted acceptance dependency; no source override/bypass is authorized.

**Never:** Add auth protocols, receipts, endpoints, signup, reset, BankID, demo impersonation, new file/dialog flows, forced-state hooks, framework/dependency upgrades, numeric-spacing-scale replacement without impact evidence, legacy browsing, other E35 work, global trackers, merge or deployment. Do not change immutable source assets or promote prototype styling/photos/logos into production authority.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Existing entitled account | Actual email/password succeeds | Existing refresh then root replace; server resolves current tenant and role destination | No client authorization shortcut |
| Invalid credentials | Existing Auth error then corrected explicit submit | Generic Swedish alert, input retained, no navigation until success | Do not enumerate accounts or invent field validator |
| Pending | Hold actual sign-in promise; click/Enter again | Readable pending text, disabled action, one active attempt | Observe actual handler; High assessment before any sensitive fix |
| Connection failure | Existing seam rejects | Safe persistent feedback and explicit recovery, suitable in-memory values retained | No durable credentials or auto-retry |
| Unknown outcome | Response lost after dispatch | No claimed success; ordinary server/session navigation reconciles authority | Preserve SDK evidence limits; no new status/receipt protocol |

</intent-contract>

## Code Map

- `src/app/globals.css:1` — Tailwind import and single inline theme; currently only Geist alias/body colors. Add semantic aliases from DESIGN without replacing inherited numeric utilities.
- `src/app/layout.tsx:2` — current Geist import; replace with local approved normal/italic font binding while preserving `lang="sv"`, metadata and body structure.
- `src/app/(auth)/login/page.tsx:19` — `LoginPage`; state and `handleSubmit` at line 26 own the current checked Auth seam. Presentation starts at line 60. Keep behavior seam proportional; no new framework.
- `src/server/db/supabase-browser-client.ts:18` — `createSupabaseBrowserClient`, read-only public/cookie client dependency.
- `src/app/page.tsx:14` — `Home` resolves tenant context then `resolveLandingRoute`; read-only role authority. `src/app/(app)/layout.tsx:42` rechecks context, navigation and protected shell.
- `docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md` and source-binding consumer hashes enumerate read-only app/operator/public, jobs, documents/files, booking, scheduling/time/Min dag and calendar-settings inheritance. ICS is not styled. These are regression consumers, not edit allocation.
- `_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md` and `EXPERIENCE.md` are actual frontend-skill authority paths; use `src/` conventions. No Figma URL, generic nextjs-app path, forced-state hook or prescribed three-layer framework is introduced.
- `_bmad-output/planning-artifacts/design-transition-2026-10-23/reconciliation-2026-10-28/font-provenance.json` and `Inter-v4.1-LICENSE.txt` bind approved official release members. Production binaries must match admission hashes; supplied v1 fonts are not the selected production bytes.
- `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts`, `role-aware-phase-a-surface.atdd.e2e.spec.ts`, `operator-console.atdd.e2e.spec.ts` are existing real-cookie/landing and inherited guards. Unit resolver/authz and integration authority tests are enumerated by the High test plan.
- `docs/quality/references/story-35-2-2026-10-28/capture-manifest.json` binds raw immutable source PNGs and hashes at 1440×900/360×640. They show source idle/focus/grouping only, not accepted candidate UI or auth behavior.

## Tasks & Acceptance

**Execution (ordered):**
- [ ] `docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md`, source-binding and admission — recheck current ownership/base/source hashes before edits; inventory all root-style consumers.
- [ ] `src/app/fonts/InterVariable.ttf`, `src/app/fonts/InterVariable-Italic.ttf`, `public/licenses/inter/OFL.txt` — copy unchanged official v4.1 members from verified release provenance, compare all three admission hashes and preserve full license; never mutate v1.
- [ ] `src/app/globals.css`, `src/app/layout.tsx` — bind one local Inter variable font family (400/500/600 and italic), semantic color/space/type/radius/motion aliases, white canvas and tabular-number affordance. Audit inherited effects before/after; keep changes bounded.
- [ ] `src/app/(auth)/login/page.tsx` — apply plain wordmark and constrained responsive real-credential composition, ≥44px controls, readable pending/errors, associated labels, visible focus and reachable actions. Retain state/validation/actions separately from replaceable markup proportionally. Assess observed duplicate/unknown behavior under High before changing sensitive handling.
- [ ] `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts` — extend actual caller tests for invalid→corrected, delay/duplicate, rejection/recovery, keyboard and role landing using existing fixtures. A narrow handler test, if necessary, belongs at `tests/unit/auth/login-submission.test.ts`; mock only the existing client/router seam and record that it cannot prove real session authority.
- [ ] Existing auth/role and bounded consumer test files identified by the High plan — verify affected inherited paths; add no N/A feature/test program. Capture actual candidate states and contrast in the frontend evidence package with source/build/revision provenance.
- [ ] This story adapter — record commands/counts/skips/limitations, independent review and author-written final Suggested Review Order after implementation. Root owns publication/PR/agent-fix/exact-head CI and acceptance coordination; builder must return visual blockers honestly.

**Acceptance Criteria (canonical IDs, no reduced scope):**
- Given the real login and inherited consumers, when semantic foundations render, then white/ink, accepted spacing/type/radii/motion and one Tailwind source satisfy E35-2-AC1.
- Given approved official roman/italic/license bytes, when packaged and rendered, then Inter 400/500/600, plain wordmark, tabular numerals and measured actual text/non-text contrast satisfy E35-2-AC2.
- Given the real credential form, when invalid, pending, failed, recovered or keyboard-submitted, then actual safe states and unchanged server role landing satisfy E35-2-AC3.
- Given connected 360×640 and 1440×900 with Swedish content, when touched, tabbed, enlarged or keyboard-occluded, then controls/errors/actions remain usable and current account identity is authoritative under E35-2-AC4.
- Given actual adapted controls and affected inherited dialogs, when focus/motion/navigation is exercised, then existing applicable focus restoration/guards and reduced motion satisfy E35-2-AC5; no new modal is required.
- Given the canonical applicability matrix, when owned state assertions run, then all nine Applies IDs remain honest, revoked remains inherited and N/A rows create no flow under E35-2-AC6.
- Given checked server commands/entitlements and affected consumers, when the UI changes, then authority, money/provenance/integrity/file protections and development/release distinctions remain intact under E35-2-AC7.

## Spec Change Log

2026-10-28 planning: added concrete ordered execution map and Given/When/Then bindings around immutable approved body. Dated approval resolves historical preparation status; source references are now captured with explicit source-only provenance. KEEP all canonical AC/applicability/test IDs and High test-design constraints.

## Review Triage Log

2026-10-28 targeted High follow-up: no findings; both fixes present, transport/unknown remain guarded, server session/tenant authority unchanged. Browser execution/visual acceptance still pending; source review is not runtime evidence.

2026-10-28 targeted follow-up route selected before dispatch: gpt-6.1-sol High independent reviewer checks only review-1 auth rejection/native-submit fixes and their regressions, not a new broad review. Author reports focused handler 9 passed/0 failed/0 skipped and targeted lint/type/containment passing; real browser still pending.

### 2026-10-28 — Review pass 1
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 2, low 0)
- defer: 0
- reject: 0
- addressed_findings:
  - implemented by Sol High; targeted independent High review passed: distinguish explicit provider validation/rate-limit rejection from ambiguous transport outcomes; retain generic feedback and suitable input for corrected explicit retry. Blind, edge and external reports describe the same required action and are deduplicated.
  - implemented by Sol High; actual browser execution pending: exercise actual native form submission before hydration/with JavaScript disabled and prove POST/no credentials in navigation URL.

Review evidence limits: foundation-only Low and security High reported no findings; intent alignment records missing runtime/inherited/response-loss/keyboard evidence already explicitly pending, not a completion claim. The external Codex High reviewer produced its report, but the prescribed CMD final display returned exit1, `The system cannot find the file specified.`; the existing output report was read through PowerShell with no rerun. Full local unit remains failed on two baseline CRLF-sensitive assertions, not passed. Fix route selected before dispatch: original context-free Sol High author, authentication classification/native submission safety. No broad second review is started by this batch.

2026-10-28: independent product review round 1 is running against baseline 5b167f1be0b3d96c1d7e9d53737211e3008eeb7e plus the captured candidate diff SHA-256 da11cd82f6f0c43f9fedaa4a8d47bf409c1fc70e3bd9e925296e44585f353e39. Font/token-only Sol Low; actual auth/caller, blind/edge/verification/intent/security and external Codex Sol High. Runtime and visual acceptance remain pending; no readiness verdict.

No implementation review run in this planning phase.

## Design Notes

2026-10-28 preliminary actual-image review route selected before dispatch: independent gpt-6.1-sol Low foundation reviewer inspects original source PNGs and actual be4cb52f public-login idle/focus/controlled-state PNGs against written DESIGN/EXPERIENCE. This is bounded visual inspection, not an authentication contract review, configured-provider receipt, authenticated owner acceptance, or development-ready claim. Real-cookie/inherited consumer verification remains blocked by the partial local baseline.

2026-10-28 local baseline operator route selected before dispatch: distinct context-free gpt-6.1-sol High, transactional integrity/security of applying only the 20 independently qualified existing baseline migrations to root-owned loopback test DB. Exact root authorization and PASS_PLAN_ONLY prechecks control execution. No seed replay/reset/db push, existing-ledger rewrite, source migration edit or new schema design. Operator owns ignored per-file evidence only; product files remain with existing authors.

2026-10-28 root exact allocation: append only `/public/licenses/inter/OFL.txt -text` plus a comment in `.gitattributes`, preserving existing rules. Sol Low Build Auto author and original independent Sol Low foundation reviewer handle this byte-preservation correction. Official license bytes already match approval; the rule prevents future Windows CRLF checkout conversion. No unrelated CI normalization or broader attributes authorized.

2026-10-28 verification continuation: existing context-free Sol High author re-engaged for bounded read-only baseline-byte proof of the unchanged privileged calendar-runtime test failures; no CI/security path edits. Review routes selected before upcoming dispatch: font/layout/token-only review Sol Low; actual auth state/caller diff, security and external Codex review Sol High because changed submission and session reconciliation are sensitive. No production story review round completed yet.

2026-10-28 split ownership: Build Auto Sol Low authors official-font packaging, root layout and additive semantic tokens. Context-free Sol High implementation author owns only login page and allocated auth tests, including presentation in that file; no concurrent page author. Numeric Tailwind spacing and existing consumer classes remain intact. Font archive and all three members matched approved hashes before byte-for-byte installation.

2026-10-28 implementation dispatch: gpt-6.1-sol High, context-free, because the approved scope includes actual authentication submission and session-authority behavior. Independent sensitive review will also use High. This does not reconfigure the Low Build Auto delegate.

Owner-authorized routine composition follows the existing binding: constrained credential group, white background, Inter 500 plain wordmark, sunken fields, ink action, 8px controls and no rest shadow. Use 16px phone gutters and existing token rhythm. Desktop/photo/logo/BankID/demo/reset prototype extras are excluded from accepted composition. Raw source phone export may overflow; it is grouping evidence, not the required responsive result. No pending/error source screenshot is fabricated. Their written requirements and real implementation states supply later comparison inputs. Source captures do not modify `policy.references` or establish owner acceptance.

Route: Sol Low planning/token/font/presentation; existing Sol High test design reused with provenance. No new sensitive judgment made here. Actual auth-state changes route to bounded Sol High then independent High review.

## Verification

### Current execution evidence — 2026-10-28

Status is **blocked; development acceptance incomplete**. Historical application evidence below predates the resumed minimum packet. Native hosted evidence at `5dc23d40bd672d476b80ccfeff1d1a6dad56ba74` and the independently High-reviewed E09 correction at `1e969651c998708e7f471ce0b968427771220632` are recorded separately below. Final current-head build, visual packet and CI remain required; historical captures are not relabeled as a newer head.

| Executed check | Actual outcome and limits |
| --- | --- |
| Lockfiles, typecheck, lint, service-role containment and diff checks | Passed in author/coauthor runs; full lint retained 31 warnings in unedited paths. Latest focused auth-test lint/typecheck/diff passed after the harness fixes. No bundle-containment PASS is inferred. |
| `pnpm build` using the ignored synthetic runtime environment | Passed for be4cb52f; `test-results-story35-2-build-be4cb52f.local.log`. Guard-owned production `next start`; no development-server substitution. |
| Actual TSX handler unit command | `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/auth/login-submission.test.ts`: 9 passed, 0 failed, 0 skipped. Client/router/hooks are mocked; this is caller/order/recovery evidence. Duplicate guard was first RED with 3 dispatches instead of 1. |
| Full unit suite after fixes | `pnpm run test:unit`: 3,744 tests, 3,741 passed, 2 failed, 1 Linux-xattr-only versioned-file restore skip; 103 suites, exit 1. Both calendar body/literal-LF assertions reproduced unchanged at baseline: 2 executed/2 failed/0 skipped; five relevant files match baseline Git bytes after accounting for Windows CRLF. No assertion/source normalization or weakening. |
| Controlled actual browser/SDK UI | 10 passed/0 failed/0 skipped at 360×640 and 1440×900; 14 requests intercepted, 0 forwarded Auth requests, no DB fixtures. Pending duplicate, validation/rate correction, transport and malformed-result paths; 16 actual PNGs. Pending/disabled text 6.1961:1 and error text 8.3632:1. `controlled-auth-result.json`. |
| Controlled auth reflow and native privacy | 4 passed/0 failed/0 skipped using body zoom 2 and 360×320 available-height analogues; 2 intercepted requests, 0 forwarded. Error/actions scroll/keyboard reachable, no horizontal overflow. `controlled-auth-reflow-result.json`. Separate native JS-disabled actual POST/privacy case passed; no authentication success without JS is claimed. |
| Actual runtime qualification after root-owned CORS lifecycle | Auth and authenticated Storage HTTP 200; local/database ledgers 119/119 with 0 missing/extra. Browser sees API version `2024-01-01` on actual HTTP 400 `invalid_credentials`. `cors-qualified-runtime-check.json`. Root applied the reviewed response-header exposure; no product parser/unknown-outcome weakening. |
| Real configured Auth and role suites, final run | Derived production/CDP config retains original setup/teardown. Explicit dedicated loopback API 55421/DB 55422 and `SUPABASE_TEST_REQUIRED=1`. **19 registered/executed, 19 passed, 0 failed/skipped/flaky**, exit 0, 17.1s. Includes native privacy, real invalid→corrected submit, current tenant/user plus cookie-bound reload, delayed duplicates, transport→ordinary server reconciliation→explicit retry, logout/orphan denial and exact seller/Montör landings. `real-auth-role-rerun3-report.json` and log. Normal fixture setup/teardown completed; no cleanup warning or retained fixture file. No separate physical erasure proof is inferred. |
| Earlier real runs, preserved | First run executed setup/teardown but 0 tests because worker-scoped trace/video/screenshot options were nested; moved unchanged off-options to file scope. Rerun1: 19 executed, 15 passed/4 failed/0 skipped (local CORS hides version header; obsolete Montör destination assertions). Rerun2: 19 executed, 17 passed/2 failed/0 skipped; invalid feedback passed, corrected submit not reached because the test imported a server-only alias graph. Reviewed test fix asserts the exact approved adminA `/dashboard` fixture contract through actual UI/server identity/reload checks. No broad destination matcher. |
| Initial full required integration/RLS | Exit 1: 1,252 passed, 485 failed, 384 skipped and 16 pending after bail, 2,137 total. File results 175: 103 failed/66 passed/1 skipped/5 not entered. Auth logs during 31 overlapping file intervals prove SQLSTATE 53300 connection exhaustion under the 100-connection database limit; not every failure was attributed to capacity. No backend limit/security change. |
| Reviewed bounded full required integration/RLS | Exact existing `pnpm run test:int --maxWorkers=2 --reporter=default --reporter=json --outputFile=tmp/private/story35-2/candidate-be4cb52f/full-required-integration-budget2-report.json`; `VITEST_MAX_WORKERS` absent and unchanged. Exit 1, 654.07s: **2,056 passed, 43 failed, 52 skipped and 14 pending after serial bail, 2,165 total**. File results 175: 162 passed/9 failed/1 skipped/3 not entered. Pending/skipped/unentered rows are not coverage; nested JSON suite totals are not file counts. |
| Supplementary coauthor visual/font evidence | Public idle/focus, loaded local roman/italic, 400/500/600 and equal-width tabular numeral probe; 4 ordinary keyboard/reflow profiles. Approved source and packaged `.next/static/media/*.ttf` hashes match the official members; full OFL bytes preserved. Independent Low image review inspected 33 source/actual inputs without concrete visual findings. These are local supplementary evidence, not authenticated owner acceptance/configured-provider receipt or authenticated inherited-consumer proof. |
| Root-reported frontend controller | At clean `01c4b149867e839e154bc4d92ffac6d88f204235`, local controller with recorded baseline 5b167f1b returned exit 1 requiring the exact-head published PR. No visual gate PASS; final commit/rebuild/capture and live exact-head acceptance remain outstanding. |

Historical local integration failures are grouped in `integration-budget2-failure-grouping.json`: **24** effective table-DML/foreign mutation rejection assertions (matrix mismatch or null/undefined error instead of expected 42501); **4** missing/invalid seed-installed booking-editor rollback fault fixtures; **12** calendar pre-callback refusals with the dedicated calendar key/secret absent in the actual child environment; **1** redacted calendar-owner ACL proof failure; **2** time-report large-prefix cases that hit the unchanged 30,000ms timeout (JSON's fallback says STACK_TRACE_ERROR). All nine failed test files match baseline 5b167f1b Git content after CRLF accounting. This establishes unchanged test source, not that the ACL/functional failures are harmless or unrelated to every runtime dependency. No baseline repair, seed replay, secret/privileged-wrapper bypass, timeout increase, test weakening or additional reproduction was performed.

Sanitized counts/causes/hashes may be published. Raw Auth logs, environments, fixture/token/credential diagnostics remain ignored/private. Runtime files above are in `tmp/private/story35-2/candidate-be4cb52f/`; original source-only references remain separate. Browser workers/owned contexts finished normally, and no test session remains active; root owns service/browser lifecycle and any final cleanup.

AC/state mapping: AC1/2 have bounded foundation/public-render/font evidence; AC3/6 and loaded/confirmed/denied have the real 19-case cookie/tenant/role suite plus 9 handler and 10 controlled-state cases; AC4/5 have actual keyboard/targets/focus and desktop enlargement/reduced-height analogues. Inherited revoked/permission boundaries retain their real role-denial checks, but broader authenticated inherited consumer/dialog evidence is not complete. Real-device virtual keyboard, screen reader and actual provider-issued-session response-loss ambiguity are not established. Later native required-mode DB and recovery-storage-loader evidence passed as recorded below. Local failures remain historical receipts, not an unresolved demand to repair unchanged feature programs.

### Resumed native evidence and minimum visual packet

- Native hosted verify job `122789851804` at `5dc23d40`: **3,744 passed, 0 failed/skipped**, 103 suites; static/build/containment passed. Native required-mode DB job `122791306635`: **2,146 passed, 0 failed, 52 explicitly skipped**, 2,198 total, all 551 reported suites passed. Skips receive no coverage credit. These actual Linux results supersede local CRLF/capacity/fixture-limited results for that tested code without erasing their receipts. Hosted recovery-storage-loader also passed.
- Hosted browser history at that head: 72 expected, 1 flaky, 1 unexpected; the unexpected case was existing My Day `15.6-E09`. The first local strict diagnostic retained `{event:"failed",phase:"after-release"}`; its transport cause remains unproven. The independently High-reviewed correction records bounded failure/framing categories and retains strict finished-after-release plus all isolation/durable assertions. One local diagnostic at test commit `1e969651` against unchanged served product build `5dc23d40` passed **1/1, retries 0, skipped 0**, terminal `{event:"finished",phase:"after-release",category:"none"}`; all post-release assertions ran. Native exit 0 and fixture absence after teardown are recorded in `tmp/private/story35-2/ci-resume-e09-runtime-2026-10-28-02/sanitized-result.json`. This is not final-head hosted CI.
- Rasmus approved only the shown idle login compositions at 360×640 and 1440×900, captured at `5dc23d40`; human provenance is `docs/quality/story-35-2-login-visual-approval-2026-10-28.json`. This does not approve unseen states, inherited screens, replacement references or a formal protocol package.
- Minimum current packet: **18 core actual/reference pairs**: finished login plus six inherited representatives (`records-list`, `booking-dialog`, `documents-list`, `jobs-list`, `calendar-settings`, `time-reports`) at both viewports, plus login loading/error at both viewports. Calendar settings is an existing scheduling-control representative under test-design line 172. Applicable state N/A reasons remain explicit. Four loading/error references are authored from the approved idle composition and written rules, not observed provider states. The six unchanged consumers need only 12 honest prechange regression frames at approved `65be26c5`, using the same existing fixture and viewports. No PDF/My Day success fixture, 28-screen expansion or new E35 migration is required.
- Minimal authored references rendered once: loading/error at 360×640 and 1440×900, four PNGs, native exit 0. Manifest SHA-256 `f4787b8b24ec8b42a38715dd82b842c7dbb85e6475065aca418ba641c75888c8`; private path `tmp/private/story35-2/core-reference-raster/output/raster-manifest.json`. One independent Low source/raster review opened all four, verified hashes/geometry and synthetic-only PII, and found no concrete visual defect. These remain authored references; pixels alone do not independently prove font loading or owner/protocol acceptance.
- The earlier 56 actuals remain historical provenance. The exploratory 43-file reference folder and three short 360×320 rasters are preserved in history/archive and reverted from the candidate; they are supplemental, not core geometry or required PR scope.

Development blockers now are the final current-head production build/18-pair visual packet and formal acceptance, final exact-head required CI, and trusted hosted source/policy integration. Trusted-main source pin mismatch is an external integration gate; the local 21-path bootstrap is not a bypass or merge authorization. Unchanged release programs and exhaustive device/manual work remain separately owned under E35-2-REL-1/2/3, not additional foundations implementation scope. `release_ready=false`. Follow-up review recommendation retains the historical score-6 route; repaired findings are not asserted to remain open.
Implementation commands: `pnpm install --frozen-lockfile`; `pnpm run verify:lockfiles`; `pnpm typecheck`; `pnpm lint`; `pnpm test`; `pnpm build`; containment/bundle checks and required CI policy. Required integration/RLS uses `SUPABASE_TEST_REQUIRED=1` with executed/failed/skipped counts. Use configured production Playwright server, guarded resources and essential real login/role/inherited journeys; no next dev. Run `pnpm exec playwright test tests/e2e/auth/login-and-tenant-context.e2e.spec.ts` plus affected role/operator/consumer cases from the High plan. Preserve its 16 traceability bindings (seven AC + nine owned states), not 16 invented test functions.

Before completion run `node scripts/quality/frontend-controller.mjs local --base 5b167f1be0b3d96c1d7e9d53737211e3008eeb7e` and use the project completion wrapper for any delivery/status helper. Actual clean committed candidate/current-head visual package and formal acceptance remain prerequisites. Trusted main 734d source/policy mismatch is a hosted integration dependency; local 65be paired-source validation is distinct. Do not weaken controller/protection or claim hosted readiness. Exhaustive release matrices remain E35-2-REL-1/2/3; release_ready=false.

Planning evidence: inspected HEAD d5fc62a88a25bf345754e3f62e5bbea7af964337 and intended branch, clean tree before planning writes; no product delta from approved 65be baseline. Renderer invoked exactly once. Source captures used existing root-owned Chrome through an isolated Playwright context and closed only that context. No application tests, product edits, auth service, implementation completion or acceptance claimed.

## Auto Run Result

Status: blocked; implementation and real Auth/role verification exist, development acceptance is incomplete.
Blocking condition: final current-head production build and minimum 18-pair visual package/formal acceptance, final exact-head required CI, and trusted hosted source/policy integration remain unmet. Native 5dc unit/DB gates and the one changed local E09 diagnostic passed with their recorded revision and skip limits; these do not grant final-head readiness.
Next action: commit only minimal authored reference inputs and this refreshed trail; root freezes/rebuilds once, then runs one existing rich fixture across baseline/current twelve-frame phases plus six isolated login captures. No expanded PDF/My Day fixture, Auth19 rerun or broad baseline investigation. Root owns publication and trusted-source integration.
Release status: `release_ready=false`; no done, development-complete, review-ready, merge, release or deployment claim. E35-2-REL-1/2/3 retain separately owned release work.

## Suggested Review Order

Author: Sol High implementation/fix author supplied login/auth and bounded gateway/test rationale; Sol Low supplied foundation rationale and this evidence-only refresh from the High E09 handoff.
Refreshed after independently High-reviewed E09 test commit `1e969651c998708e7f471ce0b968427771220632`, its one passing local diagnostic, native 5dc verification and the minimum visual packet decision. Application logic remains unchanged since the recorded product build; final current-head visual/CI acceptance remains blocked.

### A readable credential entry with honest feedback

The approved constrained composition uses the existing page/state/action seam, semantic aliases and plain wordmark. POST protects native prehydration submission; generic associated errors receive focus without introducing a field validator or unsupported login flow (AC1/2/3/4/5).

- `src/app/(auth)/login/page.tsx:19` — `LoginPage`: owns the bounded entry and state/action seam.
- `src/app/(auth)/login/page.tsx:99` — `method="post"`: keeps native credentials out of navigation URLs.
- `src/app/(auth)/login/page.tsx:137` — `login-error`: associates readable failure feedback with the existing controls.

### One attempt and a bounded trust boundary

The synchronous ref closes the observed same-turn duplicate gap. The closed definite AuthApiError set permits explicit correction; transport/thrown/unknown outcomes retain the guard and ordinary server reconciliation, while success preserves refresh-before-replace (AC3/6/7).

- `src/app/(auth)/login/page.tsx:37` — `if (inFlight.current) return;`: rejects overlap before React renders.
- `src/app/(auth)/login/page.tsx:55` — `const rejected`: separates definite API rejection from ambiguity.
- `src/app/(auth)/login/page.tsx:79` — `router.refresh();`: preserves order before root navigation.
- `src/app/(auth)/login/page.tsx:146` — `href="/"`: reconciles through ordinary server navigation after uncertainty.

### Local foundation bytes and bounded inheritance

The foundation coauthor selected the exact approved official roman/italic/license bytes and local loading; the OFL attribute preserves those bytes on Windows. The sole inline theme adds ds-N spacing without replacing numeric utilities, intentionally applies white/ink/15px body roles and opt-in motion with reduced duration zero, and adds no inherited selector override (AC1/2).

- `src/app/layout.tsx:5` — `const inter = localFont({`: binds local normal/italic variable faces.
- `src/app/globals.css:4` — `@theme inline`: contains semantic aliases and additive spacing.
- `src/app/globals.css:154` — `prefers-reduced-motion`: zeroes the opt-in durations.
- `.gitattributes:35` — `/public/licenses/inter/OFL.txt -text`: preserves approved full license bytes.

### Tests separate controlled behavior from real authority

Nine TSX handler assertions exercise duplicate suppression, refresh order, correction and guarded ambiguity; 10 controlled SDK/UI cases and four auth reflow cases retain their mock/emulation limits. The final real suite additionally confirms invalid→corrected authentication, current tenant/user and cookie-bound reload at both viewports (AC3/4/5/6/7).

- `tests/unit/auth/login-submission.test.ts:95` — `E35-2-T-loading/submitting/confirmed`: checks one active attempt and refresh order.
- `tests/unit/auth/login-submission.test.ts:125` — `E35-2-T-validation/denied/connection-required/error-retry`: checks correction versus guarded recovery.
- `tests/unit/auth/login-submission.test.ts:182` — `E35-2-T-unknown`: prevents claims or replay after response loss.
- `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts:228` — `E35-2-T-AC7`: checks actual invalid/corrected tenant/user and cookie reload.

### Native privacy, precise role landing and the held-read diagnostic

The actual JS-disabled test proves POST/privacy only. The narrowly reviewed local gateway fix exposes the API-version response header required by the installed SDK to parse modern error codes; exact fixture-role expectations avoid both stale Montör assertions and importing the server alias graph into the browser runner, while server authorization remains unchanged.

- `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts:145` — `native submission uses POST`: asserts actual method/body and URL privacy.
- `ops/test/kong.yml:11` — `exposed_headers`: adds only API-version visibility beside content-range.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:39` — `expectedLanding`: requires the exact approved destination for each fixture role.
- `src/app/page.tsx:15` — `resolveTenantContext`: retains server-derived root authority.
- `tests/e2e/my-day.e2e.spec.ts:659` — `const record: HeldTerminal`: records exact held-request event, phase and bounded category.
- `tests/e2e/my-day.e2e.spec.ts:770` — `Only a completed transport after release`: retains the strict late-response verdict after isolation assertions.

Evidence: Verification preserves real Auth/roles **19 passed/0 failed/0 skipped**, 9 handler, 10 controlled SDK/UI and 4 reflow passes, native privacy and 119/CORS qualification. Native hosted 5dc unit **3,744/3,744 passed** and required DB **2,146 passed/0 failed/52 explicit skips** replace local environment-limited failures as evidence for that tested revision. E09 changed local diagnostic at `1e969651` passed **1/1, retry 0, skip 0**, strict finished/after-release/none, all post-release/durable checks reached; previous failed attempt and unproven cause remain recorded.
Limits: handler mocks/intercepted responses do not establish provider issuance. Real-device keyboard/screen-reader and applicable exhaustive release work remain separate. Owner approval covers only the two shown 5dc idle compositions. Four authored loading/error references have bounded provenance and independent image/PII review; the minimum 18-pair current-head actual packet, formal protocol acceptance and final hosted CI remain pending. Trusted-main source integration remains external and cannot be bypassed. No done, review-ready, merge or deployment claim follows.
## Canonical approved content (verbatim body)

# Story 35.2: Tokens Font And Real Login

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-BASE B-SHARED B-FONT B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-1a visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-2-AC1.** Bind accepted colors, spacing, typography, radii and motion to existing Tailwind v4 semantic aliases. White page, ink actions, Inter 400/500/600 and tabular numerals; controls/chips/cards 8px, sheets 12px. No second token runtime or framework replacement.

2. **E35-2-AC2.** Adopt supplied Inter roman/italic only after production provenance/licensing evidence. Plain Kopplas wordmark; neutral purposeful placeholders only. Measure actual disabled/inverse/composite text at least 4.5:1 and non-text focus/control contrast; no n300–n500 text on light surfaces.

3. **E35-2-AC3.** Complete real sign-in with invalid credentials, loading, connection failure, keyboard submission and unchanged role landing. Audit global inherited effects on jobs/files/booking dialogs before edits; a file-disjoint E15 consumer is still a semantic conflict.

4. **E35-2-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-2-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-2-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-2-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.1; E15 global-style/root-layout reconciliation.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

Implicit shell/login; FIELD vyLogin; common loading/denied/connection/error/confirmed states. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: /login and root layout; indirect global consumers.

Prospective consumers: src/app/globals.css; src/app/layout.tsx; src/app/(auth)/login/page.tsx.

- `src/app/(auth)/login/page.tsx` — `default route/component`; SHA-256 `8975d2bf0891056701f5efc6aba2aa18dcf3c8bdaf8afcb515644b8218dcaf7d`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. Login form; no record list, dialog, file flow or capture.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, validation, denied, connection-required, submitting, error-retry, unknown, confirmed | revoked | empty, no-match, unavailable, stale, locked, dirty-navigation, late-result, focus-dialog |
| Files | N/A: None; no file operation. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Login/root tokens has no upload/download command. Existing downstream file surfaces are semantic regression consumers only. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-2-STATE-<name>` and `E35-2-T-<name>`. Every specific AC has proposed test ID `E35-2-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: Existing authentication/role-landing and nav/scope regression suites. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-2-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

### References

- [AGENTS](../../AGENTS.md), [project context](../project-context.md), [Phase B epics](../planning-artifacts/epics-phase-b.md), [PRD](../planning-artifacts/prd-phase-b.md), [architecture](../planning-artifacts/architecture-phase-b.md).
- [DESIGN](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md), [detailed annex](../planning-artifacts/ux-design-specification-phase-b.md), [crosswalk](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/screen-state-crosswalk.md).
- [Package index/predecessors](../planning-artifacts/design-transition-2026-10-23/story-preparation/README.md), [review convention](../../docs/process/review-order.md).

## Implementation-author Suggested Review Order scaffold

Planning scaffold only. Implementation/fix author replaces it with exactly one final `## Suggested Review Order` after code/verification; no empty selectable final heading or invented lines now.

1. Entry/user outcome: rationale and final route/component symbol with verified line.
2. State/authority: reuse/tradeoff rationale and changed boundary/downstream guard with verified lines.
3. Evidence/limits: actual AC assertions, command/revision/counts/skips, mocked boundaries and pending release/operational work. Refresh after fixes; reviewer checks final diff.

## Dev Agent Record

Preparation route: gpt-6.1-sol / low; sensitive assessment separately recorded. Implementation/model/file list/completion/verification: not started. No historical evidence rewritten.
