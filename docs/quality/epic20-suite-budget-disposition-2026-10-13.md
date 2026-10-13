# Epic 20 suite-budget disposition — 2026-10-13

Status: measurement candidate; final DB suite budget and new-candidate CI acceptance are pending.

The user authorized a measured, independently reviewed suite-budget update while retaining every test and all product performance limits. Author: `/root/epic20_runtime_fix_author`, `gpt-6.1-sol` High. This bounded successor changes execution allowances; historical pilot results and completed broad review rounds remain unchanged.

## Measured browser successor

The general Chromium attempt-sum ceiling is 800 seconds. Two complete PR97 runs reported 591.40 and 631.49 seconds; each executed 361 passed tests with three explicit skips and failed because the old 300-second suite ceiling was exceeded. The slower observation times 1.25 is 789.36 seconds; rounding to 800 leaves 168.51 seconds (26.69%) of headroom. These two observations do not establish a statistical p95. Independent High design review selected this finite allowance before implementation.

The reporter still sums every test result duration, including failed and retried attempts, and returns failure on overrun. Production build and server startup remain outside the attempt sum. HTML/list reporting, CI retry 1, serial worker 1, all discovery, bodies, individual timeouts and setup/teardown are unchanged. The dashboard suite and reporter fallback retain 300 seconds; units retain 180 seconds; browser jobs retain an independent 25-minute whole-job timeout. No tests are removed, newly skipped, or converted to expected failures. Existing explicit skips are not executed coverage. New reports must disclose actual pass/fail/skip/flaky counts and retry attempts.

## Temporary DB measurement envelope

The 900-second DB ceiling is diagnostic, not final policy. Both observed 300.11-second and 300.08-second failures are censored by the deadline. The d759 run was still reporting parallel integration suites when stopped; there was no full Vitest summary or pilot assessment. No complete DB duration or final ceiling is inferred from those outcomes.

The exact command remains `pnpm run test:int && node --experimental-strip-types --import ./tests/support/register.mjs scripts/nfr/epic-11-r1108-baseline.ts`, with required local CI services and `SUPABASE_TEST_REQUIRED=1`. Its process-tree wall-clock envelope begins after startup/reset, covers all integration/RLS setup, execution and cleanup, then the pilot. A test failure still prevents the pilot, and a pilot failure still fails the lane. Runner partitions, tests, assertions, timeouts, retry and cleanup behavior are unchanged.

After a complete current-candidate CI DB+pilot execution, record revision, wrapper wall time, complete file/test passed/failed/skipped counts, serial completion, actual pilot report/assessment, native exit and raw-log hashes. Select a fixed final ceiling at approximately 1.25 times the complete observed duration, rounded upward to a whole 60-second multiple, with independent High review. Replace diagnostic 900 in the workflow and exact-command guard before release acceptance. A failed or timed-out run yields no successful complete duration or acceptance. The temporary allowance remains finite and is not an approved final DB suite policy.

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

Browser values are completed attempt sums; DB values are deadline failures. Source inspection confirms unchanged test inventory, retry accounting and pilot thresholds. No successful new-candidate execution, DB/pilot completion, product-latency improvement, hosted behavior or release acceptance is claimed. Fresh narrow policy units, typecheck, reference validation and independent implementation review are separate from historical observations. Root owns commits, CI dispatch, final budget selection and aggregate progress.

Fresh author verification on this uncommitted four-file candidate: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/nfr/epic-11-pilot-limits.test.ts tests/unit/scripts/verify/run-with-time-budget.test.ts tests/unit/support/ci-duration-budget.test.ts tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts` reported 12 passed, zero failed/skipped/cancelled/todo. This Windows run exercised the product boundary/profile guards, exact DB command, generic duration boundary and bounded child-failure/deadline checks. The existing command-tree test returns early on Windows; its real descendant/process-group probe still requires Linux CI, and the 12 reported passes do not establish that Linux behavior. The successor reference checker passed seven stops with zero errors. Full candidate typecheck, DB/pilot completion and browser execution remain pending.

## Suggested Review Order

Author: `/root/epic20_runtime_fix_author`, `gpt-6.1-sol` High, bounded suite-budget implementation and this evidence record. No additional broad story review is requested.

### Browser allowance follows the measured attempt metric

The general CI configuration supplies its measured finite ceiling. Reporter accumulation retains every attempt and the dashboard stays independently bounded.

- `playwright.config.ts:43` — `maxMs: 800_000`: sets the measured general-browser ceiling.
- `tests/e2e/ci-duration-budget-reporter.ts:22` — `this.elapsedMs += result.duration;`: counts every attempt, including retries.
- `tests/e2e/dashboard/playwright.ci.config.ts:24` — `maxMs: 300_000`: preserves the dedicated dashboard ceiling.

### Complete DB measurement preserves failure propagation

The diagnostic wall-clock envelope retains the exact integration-then-pilot chain, with final measured selection pending. The existing command guard retains the sequential contract and rejects a retrospective Phase A pilot script.

- `.github/workflows/ci.yml:198` — `--max-seconds 900`: bounds the complete diagnostic DB and pilot chain.
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:11` — `--max-seconds 900`: preserves the exact integration-then-pilot command.

### Product ceilings remain independent of suite duration

The unchanged pilot constants and throwing assessment still enforce all product thresholds. Source inspection and historical results above remain distinct from fresh candidate execution, which is pending.

- `scripts/nfr/epic-11-pilot-limits.ts:4` — `export const EPIC11_PILOT_LIMITS =`: retains the approved profile and product thresholds.
- `scripts/nfr/epic-11-r1108-baseline.ts:262` — `Epic 11 pilot performance gate failed`: fails on any actual pilot-limit violation.
