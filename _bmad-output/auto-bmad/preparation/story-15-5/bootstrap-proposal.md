# Story 15.5 isolated verification runtime proposal

2026-10-20; implementation author. Proposed additional source ownership only;
no shared CI/bootstrap implementation or runtime launch has occurred.

## Exact paths and callers

- New `scripts/ci/with-calendar-feed-runtime.mjs`: disposable CI-only launcher.
- `.github/workflows/ci.yml`: only existing DB and essential browser job steps
  that execute integration/smoke. Preserve all admission, recovery, diagnostics,
  budgets, unrelated setup and teardown. No provider or persistent settings.
- Existing `playwright.config.ts`, Vitest globalSetup and app runtime remain
  unchanged; child processes inherit ephemeral environment values.

The DB job currently runs `pnpm run test:int --reporter=default
--reporter=github-actions --reporter=json
--outputFile=test-results/full-integration.json` after migration reset without
a production Next host. Actual feed HTTP assertions require that host. The
browser lane already invokes the configured production Playwright webServer.

## Two fixed modes

`db`: after reset and production build, qualify this isolated local CI stack;
install a unique ephemeral Vault key; start only this wrapper's `next start`
child on a dedicated loopback port; await bounded HTTP readiness; invoke the
unchanged full integration command with `SUPABASE_TEST_REQUIRED=1` and
`CALENDAR_FEED_TEST_BASE_URL` pointing at that host. Await every child/request,
stop only the captured Next process group, then delete only the created Vault
UUID. Do not adopt or stop an existing listener or user process. Fail if the
port is occupied. Root's managed CI resource policy governs the child launch.

`browser`: qualify the isolated local CI stack, install a separate unique key,
then invoke only existing `pnpm run test:smoke`; Playwright's existing build and
production webServer inherit the key. Await runner and its webServer teardown,
then delete only the created Vault UUID. No second Next launch in this mode.

The wrapper accepts only these mode literals and fixed argument arrays, never
arbitrary shell commands. CI alone dispatches it. A local actor must use the
resource guard; the author does not execute it locally.

## Qualification, keys, evidence and cleanup

Require `CI`, explicitly disposable isolated stack, loopback API/DB URLs, current
migration ledger and expected feed functions before setup. Use parameterized
SQL over the existing local test PostgreSQL connection. Generate a UUID key ID
and 32 cryptographic bytes in memory; export only server environment
`CALENDAR_FEED_ATTESTATION_KEY_ID` / `CALENDAR_FEED_ATTESTATION_SECRET` to child
processes. Install exactly `calendar_feed_attestation_<key-id>` using Vault's
existing checked administration facility as the test operator; grant no new
Vault access or app test RPC. Parallel row-isolated tests read it only. Serial
fault/key suites may mutate only this owned fixture and restore it before exit.

No `.env`, seed, provider/production key or persistent GitHub secret change.
Never print/persist the key, raw capability URL/token/hash, proof, IP or SQL
arguments. Keep native JSON test counts and a separate redacted lifecycle
receipt with mode, child exit codes, readiness result and cleanup booleans only.
Use fixed redacted failures without causes or command arguments. Disable raw
Next access/request output capture and browser trace/video/screenshots for feed.

Try/finally covers setup, readiness, test failure, signal and cleanup. Capture
resource handles immediately; no blind retry after uncertain mutation. Preserve
the primary failure and every cleanup failure in a redacted aggregate rather
than replacing one with another. After child work settles, stop only owned
processes and delete only the exact returned Vault UUID (also checking expected
owned name). Restore or remove only this wrapper's own ephemeral environment;
do not touch unrelated keys, containers, profiles or database state. Stop does
not delete resources. Cleanup failure blocks the verification claim and records
an owner, safe next action and exact resume condition.

This proposal requests narrow Coordinator allocation and independent High review
of the new launch/key/lifecycle boundary before shared source writes. It does
not authorize deployment, hosted use, main merge or release enablement.
