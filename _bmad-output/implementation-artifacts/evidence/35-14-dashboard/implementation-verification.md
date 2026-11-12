# 35.14 implementation verification — 2026-11-12

Implementation author: `/root/dashboard_35_14_worker/build/implementation`, Sol Low.
Subject: Round 1 fix tree over reviewed `733b1ca455db1583eedd595845454162636f77f9`.
`implementation-fingerprint.json` pins final product/test and story bytes (raw and LF).
The seven allocated product paths remain the closed boundary. Only three presentation
components and the two allocated E2E files changed; DashboardPage and DashboardRetry
remain unchanged. No authority, money arithmetic, producer, registry, host, environment,
configuration or support changes. Existing sensitive oracles are reused, not redefined.

## Result and decisions

An entitled existing user reads the dashboard's existing server projection through
the registry, DashboardRetry and QuotePipelineWidget, then follows the sole `/quotes`
destination. The adaptation uses existing semantic DESIGN tokens, a flat border/card,
20px heading, 38px tabular count figures, 44px controls and a single phone metric column.
Desktop groups the three counts above rate/value. Compact 16px phone padding preserves
usable content width; desktop uses the prescribed 24px card padding. The accepted
written DESIGN/EXPERIENCE outrank prototype styling; no promoted screenshot reference
exists. The neutral flat skeleton has no added motion. The lock is a monochrome SVG,
replacing the prior platform emoji while preserving all tooltip handlers and labels.

Error copy retains the original failure statement and adds a persistent connection/
retry instruction. It makes no claim to distinguish network from source failure.
Refresh still re-runs server authority; no client cache or fabricated value is added.
General current-period and dedicated controlled-source state tests now attach actual
full-page PNGs when executed. This is capture instrumentation, not produced evidence.

## Executed checks

All commands ran from `C:/DEV/Kopplas/tmp/private/e35-14-20261112/worker` with explicit
Set-Location and login:false. No managed runtime or browser resource was launched.

| Command/check | Actual result |
| --- | --- |
| Direct pinned pnpm10.24.0 `install --offline --frozen-lockfile --store-dir C:/DEV/Kopplas/tmp/private/e35-14-20261112/pnpm-store` | Exit0;398 reused,0downloaded,398added. Lockfile unchanged. |
| `node node_modules/typescript/bin/tsc --noEmit` | Exit0 with pinned dependencies. |
| `node node_modules/eslint/bin/eslint.js` | Exit0;0errors,32 warnings in unchanged files. Targeted five changed files also exit0 without diagnostics. |
| `node node_modules/next/dist/bin/next build` | Next16.4.1, exit0, production compilation/TypeScript/static generation successful. A final class-only token adjustment was followed by one successful rebuild of the final source. |
| `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/components/dashboard/widget-state.test.ts tests/unit/server/read-models/dashboard.test.ts tests/unit/server/read-models/quote-pipeline-result.test.ts tests/unit/server/read-models/quote-pipeline-aggregate.test.ts tests/unit/server/read-models/quote-pipeline-aggregate-atdd.test.ts tests/unit/scope/widget-registry.test.ts` | Exit0;119passed,0failed,0skipped,0cancelled. Native final output retained in focused-tests.tap. |
| Actual QuotePipelineWidget SSR phone topology probe | 1assertion passed,0failed: rendered dl has base grid-cols-1. Reverses the recorded ATDD red; not computed CSS/reflow proof. |
| `node scripts/verify/check-lockfiles.mjs` | Exit0. |
| `node scripts/verify/check-service-role-containment.mjs` | Exit0. |
| `node scripts/verify/check-bundle-containment.mjs` after final build | Exit0. |
| Frozen LF-hash/host probe against source-binding.json | All39 readonly files match. DashboardPage host SHA256 `1e5ea60dfc3febe970770aaae1bdb9910547a1c919690df653e2c863236411d0` matches; all3 onboarding imports retained. |
| `node node_modules/@playwright/test/cli.js test tests/e2e/dashboard/dashboard-design.e2e.spec.ts --project=chromium --list` | Exit0;3collected,0executed. |
| `node node_modules/@playwright/test/cli.js test --config tests/e2e/dashboard/playwright.config.ts dashboard-pipeline.e2e.spec.ts --list` | Exit0;52collected,0executed. Dedicated selector unchanged. |

Earlier ancestor dependency attempt: `node C:/DEV/Kopplas/node_modules/next/dist/bin/next build`
reported Next16.3.6 and failed because Turbopack could not find next/package.json inside
the worker filesystem root. `node -p "require.resolve('next/package.json')"` resolved
`C:/DEV/Kopplas/node_modules/.pnpm/next@16.3.6_@babel+core@7.2_fbbbbe98b798c72de8461c8f9227173f/node_modules/next/package.json`;
`node -p "require('next/package.json').version"` returned16.3.6. Ancestor typecheck failed
on the missing Next image-optimizer/transform declaration. These were not counted as
passing pinned checks. The parent supplied the actual installed pnpm executable at
`C:/Users/Rasmus/AppData/Local/pnpm/package-manager-store/v11/links/@pnpm/win-x64/10.24.0/dca8b965605c60a0beb0ebed23b086d4f26c327ac4aa8534856358b2fa7aca3f/node_modules/@pnpm/win-x64/pnpm.exe`.
This materially different direct executable route succeeded without launcher/mirror retry.

## Seven acceptance and eleven state bindings

The original E35-14-AC1–7 and E35-14-T-AC1–7 remain unchanged in source companions.

| AC/test | Evidence and remaining limit |
| --- | --- |
| AC1 / T-AC1 |119 focused checks exercise registry/read/state/freshness/isolation; dedicated E2E002/005/006/011 and General connected journey await execution. |
| AC2 / T-AC2 |SSR state/projection tests pass; phone topology probe passes; existing E2E003 payload/withholding plus General computed single-column/reflow assertions remain unrun. |
| AC3 / T-AC3 |Actual registry unit checks pass; no new registry/card/destination; existing browser role/card-set assertions unrun. |
| AC4 / T-AC4 |General360×640/1280×900 Swedish tenant identity, facts,focus,44px link,keyboard destination and enlarged text assertions collected; no browser/touch/virtual-keyboard pass. |
| AC5 / T-AC5 |Existing tooltip pointer/focus/Escape/long-press handlers preserved; E2E009 unrun. No dialog,draft or animation added. |
| AC6 / T-AC6 |Read states below; existing failure/refresh semantics unchanged. New ATDD disconnected test preserved; no file/write/receipt invented. |
| AC7 / T-AC7 |119 focused inherited contracts pass;39readonly hashes/host match; full DB/RLS/recovery and independent/exact-head checks pending. |

Each state retains its full `E35-14-STATE-<name>` / `E35-14-T-<name>` identity:

| Name | Actual seam/status |
| --- | --- |
| loading |SSR progress/no zeros/no time passed; dedicated held-source E2E010/011 unrun. |
| loaded |SSR current facts/time passed; General and dedicated real-source oracle unrun. |
| empty |SSR entitled current-period zero/null-rate passed; E2E004/010 unrun. |
| no-match |Same resolved current-period empty seam; no independent filter/reset exists, so no invented filter UI or distinct browser pass. |
| denied |Read/registry unit behavior passed; dedicated E2E001 role absence unrun. |
| revoked |Existing same-session E2E007 authority revocation/retry retained, unrun. |
| unavailable |Existing ineligibility/error seams retained; no independently reachable module-unavailable widget or synthetic UI pass. |
| connection-required |New ATDD context-offline/reconnect/explicit retry test retained, unrun; generic source-error copy includes persistent connection/retry instruction. |
| error-retry |SSR failure without facts/time passed; existing real-source repeated failure/recovery E2E011 unrun. |
| stale |Existing failed refresh drops facts/time; unit failure behavior passes, browser paths unrun; no mutation overwrite exists. |
| late-result |No dashboard selection/filter or local result cache. Existing router/full-document navigation owns obsolete refresh disposal. Actual navigate-away/late-source browser proof remains a named gap, not covered by retry assertions. |

Validation,submitting,unknown,confirmed,locked,dirty-navigation,focus-dialog and widget
file operations remain N/A. Quote destination protections remain inherited, unmodified.

## Pending gates and next action

Round 1 fix evidence: the independent blind layer identified that fixed-px type
utilities prevented root-font text enlargement, while the prior test checked only
visibility/overflow. Built CSS inspection confirmed `.text-heading{font-size:20px}`
and `.text-metric{font-size:38px}`. The written DESIGN sets the type scale and
requires text enlargement; it does not require fixed CSS units. The two owned
components now override only font-size with equivalent rem values at the normal
16px baseline (11/12/13/15/20/38px). Existing semantic utilities retain the approved
line-height/tracking; globals remain frozen. The General test measures every
actual h2/dt/dd/p/a computed font size and text Range height, doubles the current
root size and requires doubled font sizes plus larger text bounds before checking
values/actions/reflow. Thus fixed-px typography cannot silently pass this check.

Existing phone tooltip, successful retry recovery and enlarged-text seams gained
PNG attachments, preserving their functional assertions. Attachments remain
unearned until actual execution. Round 1 affected lint passed with no diagnostics;
the six-file focused run passed 119 tests, 0 failed/skipped (round1-focused-tests.tap);
Next16.4.1 production build and its TypeScript step passed. General 3 / dedicated
52 tests collect successfully but remain unrun. Current intent wording and the
same author review trail were refreshed. Independent edge/gap/security-High
reviewers reported no findings through the parent; external reviewer launch was
unavailable and is not counted as successful external review. These review
reports do not supply runtime or visual acceptance.

Development-complete=false; release-ready=false. Author returns an implementation
candidate for independent review, not a completion claim. Parent owns exact-head CI
and frontend evidence continuation. Required full integration/RLS/recovery with
SUPABASE_TEST_REQUIRED=1, all required scope/unit/static lanes,55browser executions,
production phone/desktop captures including permitted loaded/withheld/empty/loading/
error/retry, independent image review and human substantive acceptance remain pending.
No screenshot was produced or accepted in this implementation turn.

Concrete local runtime blocker: .env.test is absent in the worker, while compose.test.yaml
requires it and the closed write allocation forbids environment/config/support changes.
Do not copy secrets, adopt another actor's stack or raw-launch the CI webServer. Resume
local runtime only with an authorized guard-managed isolated stack/environment route;
otherwise parent runs both existing hosted lanes at the exact candidate through the
approved controller. A collected test is unrun, not skipped/passed. Late-result proof
needs the actual supported navigation seam in those runtime conditions.

Existing E35-14-REL-1/2/3 ownership remains UI owner,QA/accessibility owner,Coordinator
pending named owner/candidate binding in the existing delivery/deferred records.
Broader manual/device/screen-reader/daylight release checks remain deferred there;
essential functional/visual gaps above are not reclassified as release polish.
E16 fourteen deferred checks and E20 caveats retain their original provenance.
