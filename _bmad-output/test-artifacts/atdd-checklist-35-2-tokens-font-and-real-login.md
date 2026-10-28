---
stepsCompleted: [step-01-preflight-and-context, step-02-generation-mode, step-03-test-strategy, step-04-generate-tests, step-04c-aggregate, step-05-validate-and-complete]
lastStep: step-05-validate-and-complete
lastSaved: '2026-10-28'
storyId: '35.2'
storyKey: 35-2-tokens-font-and-real-login
storyFile: _bmad-output/specs/spec-design-35-2/stories/35-2-tokens-font-and-real-login.md
atddChecklistPath: _bmad-output/test-artifacts/atdd-checklist-35-2-tokens-font-and-real-login.md
generatedTestFiles:
  - tests/e2e/auth/login-and-tenant-context.e2e.spec.ts
  - tests/unit/auth/login-submission.test.ts
workflowStatus: completed
workflowType: testarch-atdd
scaffoldStatus: complete
behavioralAcceptance: pending
runtimeEvidence: pending
release_ready: false
inputDocuments:
  - _bmad-output/specs/spec-design-35-2/stories/35-2-tokens-font-and-real-login.md
  - _bmad-output/test-artifacts/test-design-spec-design-35-2.md
  - _bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-2.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - package.json
  - docs/process/agent-model-routing.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md
---

# ATDD checklist — Story 35.2

## Preflight and generation decision

Create mode, AI generation, English, Rasmus. Approved single-story admission and seven canonical acceptance criteria are present. Next.js/React/TypeScript and configured Playwright identify the frontend stack; Node unit tests and DB-only Vitest already exist. No framework installation or new dependencies are needed. Service readiness is separate from bounded scaffold preparation and is pending.

Route: Sol High for actual authentication caller/state assertions. The workflow resolver returned empty prepend/append/persistent facts and no completion hook. The installed ATDD workflow explicitly requires skipped scaffolds and A/B generation workers. Capability probe: subagents available; no separate agent-team runtime; `auto` resolves to subagent. Both nested auth-scoped workers use Sol High and wait in the foreground. Workers own disjoint output/test paths; no shared primitive is allocated.

`tea_use_playwright_utils=true`, but its package is absent from package.json. Under the two-gate mandate, retain installed vanilla Playwright/Node patterns without unresolved imports or dependency changes. A future deliberate framework migration can add the utilities; it is outside this story. Pact relevance is closed: no new endpoint or consumer/provider contract. Pact broker: unreachable (SmartBear MCP tools not available). Existing source seams informed the API N/A decision; no broker provider states or API responses were invented.

Selectors come from actual source and existing tests. No runtime/browser verification is claimed. No legacy app was browsed. Canonical DESIGN/EXPERIENCE paths above replace template nextjs-app/Figma/forced-state assumptions.

## Strategy and canonical traceability

Primary level: E2E for real Auth/cookie/tenant identity and usable login. Node tests invoke the actual TSX form handler with isolated client/router seams for deterministic pending/failure/order behavior. Those mocks cannot prove cookie persistence, server authority, provider issuance or response-loss reconciliation. No new API test, schema, RPC or protocol is applicable. Existing five active login/tenant cases and role/resolver/integration suites stay intact; green pre-existing behavior is regression evidence, not fabricated new red failures.

| Canonical test binding | Level and assertion route |
| --- | --- |
| E35-2-T-AC1 | Focused rendered foundation/reflow E2E plus source/inherited-consumer review; no mirrored CSS suite |
| E35-2-T-AC2 | Approved font-byte/license check and rendered font/contrast evidence; actual composite/non-text measurements remain required |
| E35-2-T-AC3 | Real invalid→corrected keyboard sign-in; actual handler pending/duplicate/failure/recovery/order scaffolds |
| E35-2-T-AC4 | 360×640 and 1440×900 real Swedish form, labels/44px phone targets/reachable action; manual virtual-keyboard and enlarged-text evidence pending |
| E35-2-T-AC5 | Actual keyboard focus; inherited affected dialog focus/motion guards reused, no new dialog |
| E35-2-T-AC6 | Nine state bindings below; no N/A flow or receipt |
| E35-2-T-AC7 | P0 existing anonymous/orphan/logout/current tenant-user E2E and server resolver/role/integration authority reuse |

| State and test suffix (E35-2-STATE- / E35-2-T-) | Concrete assertion route |
| --- | --- |
| loading | Held actual handler promise; pending action and retained form, no routing |
| loaded | Existing real-cookie/current-user/current-tenant E2E and corrected real login |
| validation | Real invalid credentials then explicit correction; generic message, associated labels, retained values |
| denied | Invalid credential rejection plus existing orphan/no-membership E2E; zero private shell data |
| submitting | Same pending case; repeated submit while one promise is active dispatches once |
| connection-required | Thrown imported Auth seam, safe persistent feedback and explicit recovery |
| error-retry | Invalid/thrown failure clears pending, retains suitable values and permits one explicit retry |
| unknown | Rejection after dispatch: no success, account-denial claim or automatic retry; real response-loss/cookie reconciliation remains unmeasured |
| confirmed | Handler refresh before replace('/'); real server landing and fixture identity prove actual authority separately |

`revoked` remains inherited. `empty`, `no-match`, `unavailable`, `stale`, `locked`, `dirty-navigation`, `late-result`, `focus-dialog` and file rows remain N/A for owned login. Existing inherited consumers are obligations only where global styles affect them. Sixteen traceability bindings are not sixteen new test functions.

P0: AC7 authority reuse. P1: AC1–6 and owned state assertions. P2/P3 new story cases: N/A. Preserve the High test plan's risk IDs R-001–007 and entry/exit gates rather than create a competing risk program.

## Generated scaffolds and aggregation

Both required generation workers completed successfully and their JSON outputs were parsed. API worker output: `atdd-35-2-api-output.json`; E2E worker output: `atdd-35-2-e2e-output.json`. Temporary workflow outputs live in this test-artifacts directory, not a random /tmp path. The summary is `atdd-35-2-summary.json`. No measured parallel speedup is claimed.

| Owned test file | New instances / present lines | Status and expected change |
| --- | --- | --- |
| `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts` | 4 skipped instances (2 declarations × 2 viewports); 335 lines total | Two real invalid→corrected keyboard/session journeys and two foundation/font/contrast/focus/enlargement journeys. Source predicts missing plain wordmark, existing Geist and short phone targets; runtime failures are unobserved. The desktop credential regression may already pass. Five existing active test bodies remain intact. |
| `tests/unit/auth/login-submission.test.ts` | 4 skipped instances (3 declarations, one parameterized); 177 lines | Actual TSX caller: pending/duplicate/order, invalid result recovery, thrown connection failure recovery, ambiguous response-loss non-success/non-replay. Direct duplicate dispatch was observed RED. Existing safe failure/order behavior is a guardrail, not an invented missing feature. |

Total new scaffolds: **8**, all currently skipped; API 0, E2E 4, Node handler 4. Priority by test instance: P0 2 real-session journeys carrying AC7; P1 6 remaining cases. State/AC aliases are clauses, not additional instances. No separate component runner is installed or required. No new factory, shared fixture, helper file, primitive or data-testid is introduced.

The existing guarded fixture import is expressly allocated by the Coordinator: login now imports `test`/`expect` from `tests/e2e/dashboard/guarded-test.ts`; Page/Locator remain Playwright types. Without its private `E2E_DASHBOARD_CDP_URL`, existing CI behavior is unchanged. The wrapper creates per-test contexts and leaves the root-owned browser open. This import does not itself qualify a runtime, backend or server.

## Data, fixture and mock requirements

E2E reuses global-setup/global-teardown's unique synthetic `adminA`/`tenantA` fixture and same-file hydration helper. Existing role-aware/orphan/logout suites retain their established factories and cleanup. No account is created by these scaffolds outside that configured setup. New factory/fixture count: zero. No faker dependency is added merely for template compliance; fixed `.invalid` unit values encode local synthetic input only and never create accounts.

The Node file loads and transpiles the actual login TSX using the established booking-series-editor unit pattern. It isolates React hook storage for rendering, the imported `createSupabaseBrowserClient().auth.signInWithPassword` seam and `useRouter` only. Its Auth results are `{error:null}`, `{error:{message:syntheticDetail}}`, a held promise or a thrown/rejected promise. It makes no HTTP request and fabricates no server membership or cookie. Generic Swedish copy must hide synthetic detail. The direct handler invocations are not native click/Enter browser events.

The unknown case loses the fake response **after caller dispatch**. It proves only no client success/credential-denial assertion and no automatic retry at that seam. It cannot know provider issuance or browser cookie delivery, distinguish SDK pre/post-response failures, or prove real server reconciliation. Required real response-loss/navigation evidence stays pending; do not add a status endpoint, receipt, new Auth protocol or blind consequential retry to make a test appear complete.

No new test IDs are needed in production. Reuse associated `E-post`/`Lösenord` labels, submit/alert/main roles, exact plain wordmark, and existing `tenant-context`/`current-user` anchors. Existing role/entitlement guards remain the authority.

## Implementation checklist and evidence handoff

The implementation workflow receives this checklist and both owned test paths through the Coordinator. Story/spec writes were explicitly excluded, so no ATDD link was inserted into the story. Do not edit its canonical body or acceptance IDs. Next workflow is the installed implementation phase, not automate or another broad test-design run.

- [ ] Recheck approved admission, actual source/consumer hashes and ownership before root/layout/font changes; preserve all inherited numeric Tailwind utility behavior unless separately evidenced.
- [ ] Package exact official Inter v4.1 roman/italic/license bytes and verify the High plan's three SHA-256 expectations. Confirm actual 400/500/600/italic and tabular numerals; generated font-family names alone prove neither identity nor weights.
- [ ] Apply the bounded white/ink/token/plain-wordmark responsive presentation, preserving Swedish content, usable errors and associated labels. Make phone input/action targets at least 44px and verify actual enlargement/focus/reachability.
- [ ] Route the observed pending-handler gap to Sol High. Activate the pending case, assess direct invocation versus actual click/keyboard behavior, then make the smallest justified fix preserving existing public client, cookie protocol and refresh-before-replace/server-derived landing. Retain independent High review.
- [ ] Activate definite failure/recovery and ambiguous non-success guardrails; preserve explicit recovery and in-memory values. Record their existing-pass behavior honestly rather than force artificial red failures. Prove actual response-loss reconciliation separately or retain the named evidence limit.
- [ ] On a qualified guarded production server/local backend, activate both E2E scenario declarations, run the essential real success/rejection/correction/cookie-reload and actual pending/failure journeys, and rerun existing applicable role/orphan/logout/resolver/integration regressions. Use `SUPABASE_TEST_REQUIRED=1` where required; report executed/failed/skipped counts.
- [ ] Complete actual disabled/inverse/composite text and non-text focus/control contrast, screenshots with candidate/build/source provenance, bounded inherited consumers and initial owner foundation visual acceptance. This scaffold measures only flat idle/error text and a changed visible focus treatment; it is not the whole visual gate. Current-head evidence and trusted hosted source integration remain required.
- [ ] Finish applicable static/build/containment/required CI and independent review, then have the implementation author write final Suggested Review Order. Preserve development/release distinctions and original E35-2-REL-1/2/3 ownership. No publication/merge/deploy authority follows from ATDD.

Estimated focused QA remains the existing High plan's 8–16 hours after qualified runtime admission, excluding blocked time and exhaustive release work. No new estimate or feature program is invented.

## Execution commands and resource boundary

From `C:\DEV\K35-implementation`:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm exec eslint tests/unit/auth/login-submission.test.ts tests/e2e/auth/login-and-tenant-context.e2e.spec.ts
node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/auth/login-submission.test.ts
# After activating the selected unit scaffold:
node --experimental-strip-types --import ./tests/support/register.mjs --test --test-name-pattern='one active form attempt' tests/unit/auth/login-submission.test.ts
```

Later browser selection is `pnpm exec playwright test tests/e2e/auth/login-and-tenant-context.e2e.spec.ts`; **do not run that command locally until the Coordinator has qualified and guarded both browser and production server**. For a focused activated story selection add `--grep 'E35-2-T-'`. The normal config can launch its `webServer` and a browser, so an endpoint environment variable alone is insufficient. The Coordinator owns a derived execution-only config importing the base and setting `webServer:undefined` when using a ready external production server, plus the private guarded CDP URL. Local native headed/debug launch is not authorized by this checklist; use only an explicitly qualified guarded equivalent. Do not use `next dev`, demo/hosted DB, native Supabase lifecycle or database pushes.

Existing supported Compose configuration is `compose.test.yaml`, project `${COMPOSE_PROJECT_NAME:-kopplas-story14-test}`, ignored `.env.test` based on `.env.test.example`, API 55421/DB 55422 defaults on loopback. These are configuration observations, not ownership/readiness evidence or a launch instruction. This delegate launched no managed resource, attached no browser, opened no page and owes no Stop. The former root CDP endpoint was stopped by the Coordinator; it must not be reused without fresh validation.

## Red-green-refactor and actual validation

RED scaffolding is complete. Activate only the selected new scenario, inspect an actual meaningful failure, implement the smallest approved change, then retain the now-active passing test. Existing contract safeguards can already pass; report that fact without changing their expectation to manufacture failure. Refactor only with unchanged behavior and adequate real authority evidence. Skipped scaffold discovery never counts as behavioral coverage.

| Validation actually run | Result / limitation |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit 0, lockfile already current; 398 packages installed/reused. No package/lockfile change. |
| Node handler scaffold discovery | Exit 0: tests 4, pass 0, fail 0, skipped 4. Skipped bodies did not execute. |
| Temporarily activated pending-only direct handler case | Underlying Node exit 1: tests 1, pass 0, fail 1, skipped 0. `Repeated form gestures must not dispatch overlapping sign-ins`, actual **3**, expected **1**. Original skipped bytes restored in `finally`. This establishes direct-handler dispatch, not browser gesture reachability or session issuance. |
| `pnpm typecheck` after final test/import changes | Exit 0. |
| Focused ESLint on both test files after correction | Exit 0. Initial local `module` variable lint finding was corrected to `compiledModule`; no product code touched. |
| Worker E2E syntax diagnostics / worker JSON parsing | 0 syntax diagnostics; both worker JSON outputs valid. This is not Playwright runtime discovery. |
| Browser/Auth/DB/integration/captures/contrast/inherited runtime | **Not executed**. Existing five active E2E cases were not rerun. New four E2E instances remain skipped; remaining three Node bodies remain unexecuted. |

No required runtime gate passed in this phase. Full unknown/cookie reconciliation, pending browser gestures, keyboard/touch/virtual-keyboard truth, measured non-text/composite/disabled states, affected inherited consumers and candidate visuals remain pending. No broad suite, product code, schema, dependency update, story/spec, global tracker, branch/stage/commit/push/PR, merge, deploy or DB push was performed.

## Workflow validation

The installed template/checklist sections are populated above or explicitly N/A: story/metadata, seven AC/nine state binding map, scaffold paths/counts, fixtures/factories, mocks, selectors, implementation tasks, commands, red/green/refactor, evidence and handoff. All eight new instances are skipped with meaningful expected-behavior assertions. Prior active regressions remain active. One behavior/journey can have several related assertions; the project's canonical binding/reuse constraints supersede generic one-assertion/faker/new-fixture instructions that would duplicate scope. Both required nested workers completed and were awaited. No orphaned browser/CLI session exists. Release readiness remains false.

Applied TEA knowledge: library/Playwright mandates and their installed-package gate; fixture architecture; data factories; component TDD; network-first; test quality/healing; selector resilience; timing/debugging; confidence gate; Pact MCP capability degradation; Playwright CLI session hygiene. Supabase and frontend-component skills informed the actual Auth boundary and canonical source paths. No provider API change was made; the parent's checked official `signInWithPassword` documentation was reused. Written DESIGN/EXPERIENCE and the High plan supply the binding; prototype styling and old legacy URLs do not.
