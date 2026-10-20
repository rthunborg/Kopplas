### Log privacy assertions inspect already-filtered output

- **Changed surface:** Feed response telemetry at `src/server/calendar-feed/public-feed.ts:16`; output inspection at `scripts/ci/with-calendar-feed-runtime.mjs:70`.
- **Impacted consumer or site:** `15.5-API019` checks server-log privacy at `tests/integration/calendar-feed/public-feed.int.test.ts:383`.
- **Existing test evidence:** `Broken-verification gap`: the observer detects selected property names and URL patterns, then discards other output. Its unit test explicitly expects an unexpected response property to disappear without a leak flag at `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:241`. The integration assertion reads only this filtered file through `tests/support/calendar-feed-atdd.ts:376`.
- **Missing verification:** Detect raw tokens, hashes and IPs before filtering, including unexpected fields and standalone values.
- **Demonstration:** Adding `console.info(raw)` alongside the existing response marker would expose the capability in production logs. The observer would discard that line without incrementing `sensitiveOutputCount`; API019 would inspect the remaining sanitized markers and pass. Symbol/import searches found no separate raw-output assertion.
- **Consequence:** A production logging disclosure can pass the advertised log-privacy check.
- **Suggested test shape:** Feed known sensitive values through the observer in realistic standalone and JSON forms, assert detection, and retain only sanitized failure receipts.

### Status privacy tests discard the raw RPC response before checking it

- **Changed surface:** `read_calendar_feed_status` returns JSON at `supabase/migrations/20261020220000_personal_calendar_feed.sql:128` and is directly executable by authenticated callers at line 244.
- **Impacted consumer or site:** An authenticated caller invoking this RPC directly through Supabase.
- **Existing test evidence:** `Broken-verification gap`: RLS008 checks `status.publicDto` for disclosure at `tests/integration/rls/calendar-feed.rls.test.ts:142`. That DTO comes from `readCalendarFeedStatus`, which reconstructs an allowlisted object at `src/server/read-models/calendar-feed.ts:12`; the fixture labels that reconstructed object `publicDto` at `tests/support/calendar-feed-atdd.ts:258`. Searches for `read_calendar_feed_status` and `readCalendarFeedStatus` found no test asserting the raw RPC payload’s allowed keys.
- **Missing verification:** Assert the raw authenticated RPC response contains only permitted status/reconciliation fields.
- **Demonstration:** Adding `'tokenHash', active.token_hash` to the SQL result would disclose the hash to direct RPC callers. The TypeScript mapper would discard it, so the checked privacy assertions would remain green.
- **Consequence:** The externally callable status contract can disclose sensitive fields without the status-privacy tests failing.
- **Suggested test shape:** Call the RPC with an ordinary authenticated client and assert its exact keys and absence of the physical capability hash.

## Other findings

- `tests/integration/calendar-feed/public-feed.int.test.ts:193` leaves the shared unknown-IP bucket at 121 requests after API009. Fixture cleanup at `tests/support/calendar-feed-atdd.ts:421` removes tenant rows but leaves that global bucket, and no subsequent reset precedes API013’s expected HTTP 200 at `tests/integration/calendar-feed/public-feed.int.test.ts:263`. When these cases run within the same 900-second window, the healthy implementation returns 429 before the completeness assertions. Restore the owned unknown-IP bucket in a serial `finally`, or explicitly establish its initial state for each serial HTTP scenario. This is a source-established isolation defect; native execution remains pending.