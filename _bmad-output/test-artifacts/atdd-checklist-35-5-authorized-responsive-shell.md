---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-11-01'
storyId: '35.5'
storyKey: '35-5-authorized-responsive-shell'
storyFile: '_bmad-output/specs/spec-design-35-5/stories/35-5-authorized-responsive-shell.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-35-5-authorized-responsive-shell.md'
generatedTestFiles: ['tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts']
inputDocuments:
  - AGENTS.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - package.json
  - _bmad-output/specs/spec-design-35-5/stories/35-5-authorized-responsive-shell.md
  - _bmad-output/specs/spec-design-35-5/operative-v2-targeted-review-2026-11-01.json
  - _bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-5.md
  - _bmad-output/test-artifacts/test-design-spec-design-35-5.md
---

# ATDD checklist — Story 35.5 Authorized Responsive Shell

## Admission and scope

Create mode; approved operative adapter ready-for-dev at parent-reported `ade43fff`, branch `codex/story-35-5-responsive-shell`. Sol High route is parent-persisted for actual auth/navigation test integrity. Approved operative-v2 correction and distinct High actual-delta confirmation govern. Frozen v1 source/slice/common remain provenance and are not rewritten. Product allocation is AppShell.tsx; the sole writable test is `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`. This workflow changes no product or story/spec files.

Frontend stack: Next/React/TypeScript with configured Playwright production build/start, local Supabase fixtures and one serial Chromium worker. Development sources and test framework are available; an owned runtime is not supplied to this delegate. No service launch or runtime PASS is implied. AI generation uses actual source selectors; recording is omitted because no guarded runtime is owned. Parent authorized autonomous completion without another input checkpoint.

## Libraries and capabilities

Config enables Playwright Utils and Pact Utils, but neither package is installed in package.json. Their two-gate mandates are inactive: preserve the project's guarded-test and existing fixture helpers, add no dependency or harness. Future library adoption belongs to a separately scoped framework workflow. Pact has no relevant new consumer/provider contract here. Tool inventory contains no Pact tools (`pact_mcp_reachable=false`); no broker request was made. Provider source is the fallback if needed; no inferred broker state is claimed.

## Test strategy

Preserve the five existing Story 11.2 browser authority cases and assertions. Generate skipped red-phase shell scenarios in the same allocated file, using actual caller/fixture fields. No API test is needed because this slice adds no endpoint or domain contract; do not duplicate existing unit/integration authority tests. New presentation assertions are expected red candidates, not observed failures. Existing behavior assertions are regression prerequisites, not falsely claimed new missing features.

| Acceptance identity | Level/priority | Meaningful obligation |
| --- | --- | --- |
| E35-5-T-AC1 | E2E/P1 | Exact authorized flattened nav order, identity, active marker and current real destinations at desktop and 360×640; no absent-link backfill. |
| E35-5-T-AC2 | E2E/P1 | Desktop 248px sidebar/56px header; named phone drawer focus wrap, keyboard/close/restoration, resize cleanup; ordinary protected links. |
| E35-5-T-AC3 | E2E/P0 | Isolated revoke-after-render attempt meets current server denial and fresh authoritative projection; real sign-out semantics. |
| E35-5-T-AC4 | E2E/P1 | Existing Swedish fixture identity; reachable 44px phone controls and bounded text reflow. Virtual keyboard/manual matrix remains honest deferred evidence. |
| E35-5-T-AC5 | E2E/P1 + inherited | Actual drawer focus/reduced motion, source-owner dirty/late guards retain original identities. |
| E35-5-T-AC6 | E2E/P0 | Owned loaded/denied/revoked/focus-dialog and actual SignOutButton controlled definite rejection → preserved same session → explicit real retry. |
| E35-5-T-AC7 | Existing authority/integrity suites/P0 | Preserve original permission/withheld money/no-private-data assertions; no new domain/money/file expectation or source-presence coverage claim. |

## State ownership and inherited regression limits

Owned: `E35-5-STATE-loaded/denied/revoked/error-retry/focus-dialog` with corresponding `E35-5-T-*`. Error-retry binds only mounted SignOutButton → browser Auth signOut with the established Säljare fixture. Intercept only configured local origin POST `/auth/v1/logout`, preserving the actual query. Fulfill a definite non-401/403/404 failure before forwarding. Assert persistent exact error, unchanged URL/identity/enabled same command; independently load a protected page in the same cookie context to confirm server identity. Remove fault and explicitly activate that same command; actual Auth success must lead to `/login` and a fresh protected redirect. Matcher, SDK behavior and full runtime sequence remain UNVERIFIED until executed.

`loading`, `unavailable`, `connection-required`, `late-result` are corrected to inherited regression only. Their new shell positive duties are expressly retired, not passed or reclassified N/A. Unbound loading/connection-required earn no coverage. Actual unavailable source binding is `tests/unit/server/authz/job-access.test.ts` / `16.2-AUTHZ-004`; late-result/dirty selected-child source owners are `tests/e2e/jobs/job-workspace.e2e.spec.ts` / `16.5-E03/E04/E05`. Reuse only when affected and actually executed, retaining revision/counts/skips. No claim follows from source presence. N/A empty/no-match/validation/locked/file operations add no tests/features.

## Execution status

Generation complete: 10 new skipped E2E scenarios (P0=1, P1=9), zero API/component/contract tests, zero new fixture files. The original five active Story 11.2 cases are preserved; total expanded suite inventory is 15, not a collected/executed count. Runtime executed: 0; passed/failed/skipped runtime outcome: not run. No observed-red/runtime PASS, screenshot or accepted visual candidate is claimed. Root/build owns guarded configured production-server execution and activation.

Bounded collection attempt: `pnpm exec playwright test tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts --list` exited 1 with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`, `Command "playwright" not found`. Worktree `node_modules/@playwright/test/cli.js` and `tests/e2e/.auth/fixture.json` are absent. Collection therefore did not execute or count any test; runtime passed/failed/skipped counts are **not-run**, not zero-skipped coverage. No dependency install, fake credential fixture, production server, browser or Supabase stack was started to work around this limit.

## Source confidence and knowledge

Confidence: 8/10 for scaffold bindings, based on the actual allocated AppShell, mounted SignOutButton, existing role suite, tenant fixture exports and operative amendment. Unknowns: actual browser selector resolution after presentation changes; installed SDK handling in the eventual test worktree; actual logout query/matcher and full session retry runtime. These unknowns are explicit verification work rather than assumed outcomes. No new endpoint or schema is inferred.

Knowledge applied: library-integration-mandate, playwright-utils-mandate (two-gate check), data-factories, component-tdd, test-quality (including actionable committed skip reasons), test-healing-patterns, selector-resilience, timing-debugging, fixture-architecture, network-first, confidence-gate, evidence-integrity, playwright-cli, pactjs-utils-mandate and pact-mcp. Component/API/contract generation is outside this slice; no extra suite is added to satisfy a generic template.

Supabase skill consulted for Auth specifics. Read the current [changelog index](https://supabase.com/changelog.md) and [signOut reference](https://supabase.com/docs/reference/javascript/auth-signout). Inspected relevant [self-hosted Auth URL prefix](https://supabase.com/changelog/47093-self-hosted-supabase-api-external-url-to-include-auth-v1), [gateway](https://supabase.com/changelog/48048-self-hosted-supabase-envoy-becomes-the-default-api-gateway-b) and [TLS](https://supabase.com/changelog/cbc-tls-ciphers-deprecated) notices. No infrastructure change follows: use the repository's configured local test authority, and verify the actual request at runtime. Documentation does not substitute for installed-SDK/runtime proof.

## Generated cases and activation handoff

| New scaffold | Expanded count | Binding |
| --- | --- | --- |
| Säljare and Montör at desktop1280×800/phone360×640 | 4 | Exact complete nav href order/current marker, tenant/user, notifications/profile real destinations and ordinary anchor navigation; AC1/3/6/7, loaded |
| Desktop composition | 1 | 248px sidebar, 56px header, 24px gutters; AC2/4 |
| Phone reduced-motion drawer | 1 | Named modal, visible focus, Tab wrapping, Escape/close/restoration, resize and scroll cleanup; AC2/5/6, focus-dialog |
| Phone text reflow and targets | 1 | CSS text size100%/200%, 16px base gutters, reachable44px existing toolbar/drawer controls; AC4 |
| Isolated Säljare→Montör revocation | 1 | Existing role fixture/paired cleanup and existing `setRoles`; rendered real link opens a fresh document, generic denial and fresh authoritative Montör projection; AC3/6/7, revoked |
| Actual mounted sign-out failure/retry, desktop and phone | 2 | Exact local Auth controlled500, same command/URL/identity, fresh protected server identity, remove fault/real retry/login/protected redirect; AC3/4/6, error-retry |

The preserved existing denial case binds denied and retains its original test title; it is unchanged source, not newly executed E35-5 coverage. The original monetary withholding, forbidden quote affordance and customer boundaries remain intact. New source has actionable RED annotations; only the new scenarios are skipped. Existing tests were not disabled.

- [x] Read approved story, operative-v2 correction, frozen slice, framework and actual caller/fixture sources.
- [x] Choose E2E as primary level; API/component/Pact generation N/A under exact allocation.
- [x] Dispatch and aggregate Step4A/4B Sol High workers; both finalized. No API fixtures required; E2E reuses existing local helpers. Worker receipts: `atdd-35-5-api-red.json` and `atdd-35-5-e2e-red.json`.
- [x] Retain all five original test bodies/assertions, verified against Git HEAD after CRLF normalization.
- [x] Validate TypeScript transpilation syntax using existing `C:/DEV/Kopplas/node_modules/typescript/lib/typescript.js`; zero syntax diagnostics. This is not semantic typecheck/module resolution or browser collection. Full-content E2E JSON matches the generated suite after newline normalization.
- [x] No new SQL/query, endpoint, fixture file, dependency, harness, workflow, product/spec edit, service launch or git mutation.
- [ ] Implementation owner activates the current skipped scenario(s), runs the real configured local production-server browser runner and records observed RED before implementation, then GREEN after implementation. Do not count committed skips as coverage.
- [ ] Build/review verifies visible labeled grouping, selected marker/token styling and final composition. Exact flattened-order assertions do not prove grouping, and accepted source defines no new group-label/ARIA vocabulary.
- [ ] Execute required affected source-owner authority/dirty/late regressions with exact revision/counts/skips. Modified-click fresh-document revocation does not certify same-tab prefetched RSC cache behavior or immediate push removal.
- [ ] Obtain candidate-bound safe desktop/phone captures after real assertions; review actual focus/reflow/contrast/visible errors. Native browser zoom, virtual keyboard and exhaustive device/manual acceptance remain unexecuted.

No new data-testid is required: reuse tenant-context/current-user and existing semantic names. Controlled mocking is limited to the exact local Auth500 failure; retry is real, not synthetic. Generic template requirements for new factories, random data packages, API fixtures and singleton-assertion duplication are N/A: this slice reuses authoritative fixture data and keeps one coherent journey per scenario. No story file was edited because ownership excludes it; implementation author should link this checklist and the sole E2E path from its story evidence record.

Execution command after root-owned environment readiness and activation: `pnpm exec playwright test tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`; add `--grep E35-5` for focused task activation, `--headed` or `--debug=cli` only within owned guarded browser/runtime rules. Full required regression execution remains root/build responsibility. No installation or bootstrap is prescribed here; use the project's existing local setup/guard contract.

Safe capture plan only: loaded authenticated desktop after exact identity/nav assertions; phone drawer after named/focus assertions; failed sign-out after exact controlled response/error and independent server identity checks. No login credentials, tokens, headers, request bodies, cookies, raw traces or synthetic success images. Zero captures exist. Bind any future captures to their actual revision and controlled-state provenance.

Implementation estimate remains the operative story/build owner's estimate; no new hours or scope commitment is invented. Next workflow: parent-owned build/implementation. All validation gaps above are handed off explicitly. Completion resolver returned empty `workflow.on_complete`; no completion hook ran. `release_ready=false`.
