# Epic 20 suite-budget disposition — 2026-10-13

Status: fixed measured suite budgets selected; corrected-checkout candidate CI and final acceptance remain pending.

The user authorized a measured, independently reviewed suite-budget update while retaining every test and all product performance limits. Author: `/root/epic20_runtime_fix_author`, `gpt-6.1-sol` High. This bounded successor changes execution allowances; historical pilot results and completed broad review rounds remain unchanged.

## Measured browser successor

The general Chromium attempt-sum ceiling is 800 seconds. Two complete PR97 runs reported 591.40 and 631.49 seconds; each executed 361 passed tests with three explicit skips and failed because the old 300-second suite ceiling was exceeded. The slower observation times 1.25 is 789.36 seconds; rounding to 800 leaves 168.51 seconds (26.69%) of headroom. These two observations do not establish a statistical p95. Independent High design review selected this finite allowance before implementation.

The reporter still sums every test result duration, including failed and retried attempts, and returns failure on overrun. Production build and server startup remain outside the attempt sum. HTML/list reporting, CI retry 1, serial worker 1, all discovery, bodies, individual timeouts and setup/teardown are unchanged. The dashboard suite and reporter fallback retain 300 seconds; units retain 180 seconds; browser jobs retain an independent 25-minute whole-job timeout. No tests are removed, newly skipped, or converted to expected failures. Existing explicit skips are not executed coverage. New reports must disclose actual pass/fail/skip/flaky counts and retry attempts.

## Measured fixed DB envelope

The final DB-and-pilot ceiling is 420 seconds. Diagnostic [CI run 38434646963, DB job 115426241123](https://github.com/rthunborg/Kopplas/actions/runs/38434646963/job/115426241123) succeeded under the temporary 900-second envelope. Its complete integration/RLS suite took 316.31 seconds; the full wrapper, including the actual pilot and cleanup, completed in 326.38 seconds. The selected fixed ceiling is `ceil(326.38 * 1.25 / 60) * 60 = 420` seconds, leaving 93.62 seconds (28.69%) of headroom. Independent High design review selected the measurement-based rule before this final implementation. The censored 300.11/300.08-second failures remain historical failures; they did not select the final ceiling.

The diagnostic job reported 142 passed test files and one skipped file; 1703 passed tests, zero failed and one inherited explicit skip (`tests/integration/ops/recovery-storage-immutability.int.test.ts`), whose dedicated recovery job remains separate. That skipped test is not execution coverage. The actual pilot retained 120/24 memberships, five warmups and 25 samples; it measured Admin read p95 17.923913ms, synthetic bulk permissions p95 5.089318ms and two authenticated RLS requests per read. Those values satisfy the unchanged 250ms/25ms/three-request ceilings. A successful complete wrapper establishes the diagnostic integration-then-pilot chain completed; it does not establish final candidate acceptance.

The diagnostic checkout was synthetic merge `7843eba2057f35cf22092e832402a064c21c5cdb`, merging candidate `0ea457c4bbc82a6d7b362b5777645454db0f74a3` into main `f0430404f6b97e91f3b460e284c71e7f91b404c6`. This complete merge-tree measurement informs the suite allowance only. The corrected explicit PR-head checkout and final 420-second policy require fresh exact-candidate CI, and post-merge main CI remains required before Epic 15 adoption.

The current command retains the same integration-then-pilot chain, with only native reporting arguments added: `pnpm run test:int --reporter=default --reporter=github-actions --reporter=json --outputFile=test-results/full-integration.json && node --experimental-strip-types --import ./tests/support/register.mjs scripts/nfr/epic-11-r1108-baseline.ts`, with required local CI services and `SUPABASE_TEST_REQUIRED=1`. Its process-tree wall-clock envelope starts after stack/reset, covers all integration/RLS setup, execution and cleanup, then the pilot. Test failure still prevents the pilot and pilot failure still fails the lane. Runner partitions, bodies, assertions, individual timeouts, retry, cleanup and failure propagation remain unchanged. The temporary 900-second allowance has been replaced in both workflow and exact-command guard; it is not retained as final policy.

## Exact candidate checkout and combined-main evidence

All five required CI jobs now use `${{ github.event.pull_request.head.sha || github.sha }}` as their explicit checkout ref. Pull-request execution checks out the actual proposed head, rather than GitHub's synthetic merge commit; push execution checks out the triggering SHA. The existing `pull_request`/`push` events, checkout action version, token permissions, secrets exposure and test execution remain unchanged. This changes the source revision under test, not its authority or privilege. GitHub documents the [checkout ref input](https://github.com/actions/checkout) and [OR expression semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions).

The maintenance validator still requires evidence for the actual pinned candidate HEAD/tree; its criteria are unchanged. Earlier PR97 receipts, including the browser observations and DB timeouts above, remain historical synthetic-merge-checkout measurements and are not relabelled as exact-head candidate results. Diagnostic CI 38434646963 began before this checkout correction; its completed DB duration may inform the final suite envelope but cannot establish the corrected exact-head checkout. Fresh final CI must prove the actual new candidate revision. After merge, required push CI on main must prove the combined main tree before Epic 15 adoption; a PR-head result alone does not prove those combined-main checks.

## Native framework reports for the strict evidence mapping

This observability successor adds four original framework-native JSON files. Candidate 0a774's earlier logs/HTML did not supply those required reports and are not final acceptance. The initialized plan's exact 40 mapping (hash `a95443b3d705191f88416f0f24ff8698b35bbfd7ff888b553655786b4fc9901a`) requires the following physical reports, reviewed independently before implementation:

| CI job | Original native file | Uploaded artifact | Mapped framework checks |
| --- | --- | --- | --- |
| db | test-results/full-integration.json | native-full-integration | Full integration/RLS and six Documents/signing/storage partitions |
| recovery-storage-loader | test-results/isolated-storage-recovery.json | native-isolated-storage-recovery | Actual isolated recovery; both existing verification flags 1 |
| e2e | test-results/general-browser.json | native-general-browser | General browser and three Documents browser partitions |
| dashboard-e2e | test-results/dashboard-browser.json | native-dashboard-browser | Whole dedicated dashboard browser report |

The full Vitest report supplies `full-integration-rls`, `documents-integration-rls` (all seven existing Documents files), `files-signed-access-integration` (generic signing/access-refresh), `documents-baseline-storage-boundary` (Storage isolation/role grants), `documents-selected-link-lock-races-integration`, `documents20-2-lifecycle-integration` (lifecycle/races/filter), and `documents20-3-context-integration`. The separate recovery invocation supplies `isolated-storage-recovery-integration`. General Playwright supplies `general-browser`, `documents-browser` (three existing Documents files), `documents20-2-browser` and `documents20-3-browser`; dedicated dashboard supplies `dashboard-browser`. These 13 logical checks share four physical original reports. Their aliases/partitions are never summed as unique test executions or emitted as reconstructed framework JSON.

The other 27 mapped checks retain actual Node TAP, static/build/reset/pilot/artifact-validation commands and GitHub job/status command receipts. No Node JSON reporter or additional focused product rerun is added. Root binds each external evidence envelope to actual argv, checkout SHA/tree/root, native exit, job log/report hashes and only the two existing nonsecret verification flags; this change adds no sidecar metadata reconstruction or validator exception. The strict maintenance validator remains unchanged.

Both Vitest 4.1.9 invocations explicitly retain `default` and `github-actions` reporters while adding the built-in `json` reporter and separate output files. The DB wrapper remains 420 seconds around the exact integration-then-pilot chain; recovery runs the same exact isolated test file with its existing flags. General/dashboard Playwright append their built-in JSON reporters to existing HTML/list/duration reporting, with 800/300-second ceilings and unchanged retries. Frameworks write their own reports; upload steps copy original files unchanged and run after test failures unless cancelled. Missing native files fail artifact capture rather than being reconstructed from console/HTML or treated as successful evidence. Existing HTML report uploads and cleanup remain intact; `test-results/` is already ignored.

Reporter/config source checks do not prove actual report emission, test execution or final acceptance. Independently reviewed successor CI must produce all four original reports and actual commands with preserved counts, skip/retry disclosure and product ceilings. Fresh exact-candidate CI and post-merge combined-main CI remain required.

## Unchanged product performance contract

The real Epic 11 pilot still requires 120 active TenantA memberships, 24 TenantB memberships, five evenly distributed primary roles, 40 additional-role holders/160 assignments, five warmups and 25 measured samples. Its limits remain p95 Admin projection at most 250ms, synthetic bulk permissions at most 25ms and at most three authenticated RLS requests per complete Admin read. The unchanged assessor records actual samples and throws on any violation. These product limits and the exact profile remain independent of the full-suite execution allowance; their existing unit boundary/regression tests remain intact.

## Evidence and limits

Retained CI observations, with raw-log SHA256:

| Log | Observed result | SHA256 |
| --- | --- | --- |
| Kopplas-pr97-e2e-job.log | 591.40s; 361 passed/3 skipped; suite ceiling failed | fd58ab47d500d84f7d1ce4004bd249f70f05e1c4b030e322bdccbee57de85bcc |
| Kopplas-pr97-d759-e2e.log | 631.49s; 361 passed/3 skipped; suite ceiling failed | 75995e64102c96123c97ee347d9af2273113879b26175c197e3624264a8d6fc6 |
| Kopplas-pr97-db-job.log | Timeout 300.11s; full DB/pilot incomplete | a47ab13e647bab208fa57a18d34f4f13243db87c1e662f2fdbcf641612d0a4ce |
| Kopplas-pr97-d759-db.log | Timeout 300.08s; full DB/pilot incomplete | f6091b9ac2563ddef57e280575ae4c08a2ce65d324290c3b3ec591150873bcd0 |
| Kopplas-pr97-0ea-db.log | Synthetic-merge diagnostic success; 1703 passed/1 inherited skip; full wrapper 326.38s | 9a8279cbe31669b24d23cb8b693a01f2874e16c14773032a8dfe5607540267ff |

Browser values are completed attempt sums; the first two DB values are deadline failures, and the third is a complete diagnostic merge-tree DB+pilot measurement. Source inspection confirms unchanged test inventory, retry accounting and pilot thresholds. The diagnostic DB/pilot completion is recorded above. No successful corrected-checkout candidate execution, product-latency improvement, hosted behavior or release acceptance is claimed. Fresh narrow policy units, typecheck, reference validation and independent implementation review are separate from historical observations. Root owns commits, CI dispatch, final budget selection and aggregate progress.

Earlier budget-only author verification on its uncommitted four-file candidate: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/nfr/epic-11-pilot-limits.test.ts tests/unit/scripts/verify/run-with-time-budget.test.ts tests/unit/support/ci-duration-budget.test.ts tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts` reported 12 passed, zero failed/skipped/cancelled/todo. This Windows run exercised the product boundary/profile guards, exact DB command, generic duration boundary and bounded child-failure/deadline checks. The existing command-tree test returns early on Windows; its real descendant/process-group probe still requires Linux CI, and the 12 reported passes do not establish that Linux behavior. The successor reference checker passed seven stops with zero errors. Full candidate typecheck, DB/pilot completion and browser execution remain pending.

Checkout follow-up verification: the same four-file focused unit command now reports 15 passed, zero failed/skipped/cancelled/todo, with native exit0. Three added cases verify all five explicit checkout refs, PR-head selection against a distinct synthetic merge SHA, and push fallback with absent PR context. These are source-contract and synthetic context-evaluation checks; actual Actions checkout SHA/tree still requires fresh final CI. Focused ESLint passed with native0 and the final author reference check passed 11 stops with zero errors/native0. The first run failed on a new test regex escaping error; that error was corrected before this successful run. The existing Windows descendant-probe early-return limitation remains as recorded above. No test or failure result was hidden, no permissions or product code changed, and independent narrow review remains required before commit.

Final fixed-bound author verification: after replacing 900 with 420 in the workflow and exact-command guard, the same focused policy command passed 15 tests with zero failed/skipped/cancelled/todo and native0. Focused ESLint passed/native0 and the final reference check passed 11 stops with zero errors/native0. Browser 800, dashboard 300, unit 180, checkout selection, all product ceilings and test inventory remain unchanged. These are bounded Windows source/policy checks with the previously recorded descendant-probe limitation. They do not replace fresh corrected-checkout candidate CI or post-merge main CI.

Native-report follow-up verification: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/nfr/epic-11-pilot-limits.test.ts tests/unit/scripts/verify/run-with-time-budget.test.ts tests/unit/support/ci-duration-budget.test.ts tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts tests/unit/scripts/verify/ci-native-test-reports.test.ts` reported 18 passed, zero failed/skipped/cancelled/todo, native0. The three new cases pin both Vitest reporter sets/output files, additive Playwright reporting with unchanged retries/budgets, and all four failure-aware/missing-file upload contracts. Focused ESLint and `pnpm typecheck` passed/native0; the author reference check passed 15 stops/zero errors/native0. TypeScript preflight checked all four changed/new TS files. These are configuration/source-contract checks; no actual native framework report from the product suites was generated locally and no full integration/browser run is claimed. The existing Windows descendant-probe limitation remains recorded. Fresh reviewed-successor CI must produce the original files, and root must bind its actual execution evidence for the strict 40 mapping.

## Suggested Review Order

Author: `/root/epic20_runtime_fix_author`, `gpt-6.1-sol` High, bounded suite-budget implementation and this evidence record. No additional broad story review is requested.

### Checkout identity matches the evidence under review

Each required job explicitly checks out the proposed PR head or triggering push revision. Historical synthetic-merge results remain historical; exact-head final CI and combined-main post-merge CI are separate required evidence.

- `.github/workflows/ci.yml:50` — `ref: ${{ github.event.pull_request.head.sha || github.sha }}`: pins the actual candidate or triggering push revision.
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:30` — `all five required CI jobs explicitly`: covers every required checkout step.
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:39` — `pull-request CI selects`: rejects synthetic-merge selection for PR evidence.
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:46` — `push CI selects`: covers absent PR context on main push.

### Browser allowance follows the measured attempt metric

The general CI configuration supplies its measured finite ceiling. Reporter accumulation retains every attempt and the dashboard stays independently bounded.

- `playwright.config.ts:43` — `maxMs: 800_000`: sets the measured general-browser ceiling.
- `tests/e2e/ci-duration-budget-reporter.ts:22` — `this.elapsedMs += result.duration;`: counts every attempt, including retries.
- `tests/e2e/dashboard/playwright.ci.config.ts:24` — `maxMs: 300_000`: preserves the dedicated dashboard ceiling.

### Complete DB measurement preserves failure propagation

The fixed 420-second wall-clock envelope uses the complete 326.38-second diagnostic measurement and retains the exact integration-then-pilot chain. The existing command guard retains the sequential contract and rejects a retrospective Phase A pilot script.

- `.github/workflows/ci.yml:202` — `--max-seconds 420`: bounds the complete DB and pilot chain with the measured final ceiling.
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:11` — `--max-seconds 420`: preserves the exact integration-then-pilot command.

### Original framework results preserve the strict evidence boundary

Native reporters retain console/budget behavior and capture the actual original framework schema. Uploads preserve the files on failed runs and reject missing output; partitioned maintenance envelopes remain root-owned and require fresh CI.

- `.github/workflows/ci.yml:209` — `name: native-full-integration`: captures the original complete Vitest report.
- `.github/workflows/ci.yml:372` — `name: native-isolated-storage-recovery`: separates actual recovery from its inherited full-suite skip.
- `tests/unit/scripts/verify/ci-native-test-reports.test.ts:31` — `all four original native files upload`: pins failure-aware capture and missing-report rejection.
- `playwright.config.ts:43` — `outputFile: "test-results/general-browser.json"`: adds native browser output alongside existing reporters.

### Product ceilings remain independent of suite duration

The unchanged pilot constants and throwing assessment still enforce all product thresholds. Source inspection and historical results above remain distinct from fresh candidate execution, which is pending.

- `scripts/nfr/epic-11-pilot-limits.ts:4` — `export const EPIC11_PILOT_LIMITS =`: retains the approved profile and product thresholds.
- `scripts/nfr/epic-11-r1108-baseline.ts:262` — `Epic 11 pilot performance gate failed`: fails on any actual pilot-limit violation.
