# Story 15.1 passive network metadata preparation

Status: **candidate requiring independent Sol 6.1 High validation before source authoring.** Root-recorded Auto-BMAD route: `native_passive_metadata_preparation`, Sol 6.1 High, privacy/unchanged security assertions. Sole write: this document; no source/spec/test/state/Git/CI/resource actions.

## Baseline and objective

Read-only hashes reproduced:

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| [Diagnosis](story-15-1-dashboard-prefetch-diagnosis-2026-10-14.md) | 9,033 | `8bd328a2e4d7d74b60f695849defbbe4ed1fb6f1677bad5f4f8e6b845b4ddf2d` |
| `tests/e2e/scheduling-views.atdd.e2e.spec.ts` | 40,324 | `8563d81330b0f2cd79b9e86ec5888c1c96866bfdaff48b8af484acf3b4852e66` |
| Read-only `tests/e2e/support/scheduling-views-atdd.ts` | 18,231 | `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082` |

Baseline `e448f856b1f1ea337b2c91ed6cfc624995272521`; root-reported bookkeeping HEAD `b99e3f42`. CI `38579679091`: same AC2 ID, both attempts native `net::ERR_ABORTED`, before tampered goto. Prefetch starts during sign-in; cause unknown. [PW #42742](https://github.com/microsoft/playwright/issues/42742) remains a newer-browser candidate.

Collect cancellation metadata and exact **within-CDP** lifecycle joins. Public Request/CDP identity stays unproven; bodies remain obligations. No product change/upgrade justified.

## Eligible patch and preservation

After validation, eligible: E2E spec plus new `tests/unit/features/scheduling/passive-network-metadata.test.ts` for source-extracted tests. Other files read-only; root owns Git/state/execution.

Add marked factory/cleanup registry and AC2-only calls. Register cleanup before acquisition; attach after original listeners (350–352), before `guardedSignIn("montor")` (355). Preserve capture-window timing/admission. Observe until capture-window closure/failure, before denied sign-in; no retry/network wait.

Preserve 18 case titles, 11 PNG names, all 13 AC2 assertions, every selected HTML/RSC body, capture predicates, native `response.finished()`/`response.text()`, Request-object observers, barrier, first-error state and shutdown. Snapshot lines 183–217, its 20 keys/order/prefix/1,024-byte guard stay byte-for-byte unchanged. No cancelled-capture filtering, swallowed failure, synthetic/fallback body, interception/network-policy change, fetch/reader wrapper, headers/cache/auth/navigation change, timeout/retry/assertion change or SDK/private-field access.

Inverse-remove only marked diagnostic additions/import tokens and reproduce the original source SHA exactly. Compare title/PNG/assertion and reader/observer inventories. Extract actual marked source for unit tests. Non-additive edits return to preparation.

## Pinned supported API

Use public [newCDPSession(page)](https://playwright.dev/docs/api/class-browsercontext#browser-context-new-cdp-session) and [on/off/send/detach](https://playwright.dev/docs/api/class-cdpsession). Pinned primary sources: [1.61.1 protocol](https://github.com/microsoft/playwright/blob/v1.61.1/packages/playwright-core/src/server/chromium/protocol.d.ts), [browser manifest](https://github.com/microsoft/playwright/blob/v1.61.1/packages/playwright-core/browsers.json), Chromium `149.0.7827.55`/`1228`. Verify eventual runtime versions; no install here.

Separate page session: named handlers, then `send("Network.enable", {})` only, buffer/durable defaults. No other domains, cache bypass, interception, body reads/streaming or private imports. Network events: requestWillBeSent/responseReceived/dataReceived/loadingFinished/loadingFailed. Ignore optional dataReceived.data; never copy/spread/stringify/retain event objects. Project primitives immediately; timing overhead remains.

## Admission and exact joins

Admit GET, attached page session, original captureOrigin, exact `/scheduling` pathname. Four CDP flights total, no eviction; absent starts remain unjoined. Ephemeral requestId joins CDP events exactly, never emits. Redirect IDs can span hops: old hop becomes redirected, next matching hop gets new slot; redirect elsewhere ends tracking. Unexpected repeated IDs/conflicting terminals become ambiguous. No worker/child sessions.

Separate public request/response/requestfinished/requestfailed and main-frame framenavigated listeners; four Request references/URL-method keys max. Read original WeakMap ordinal without mutation. Full URL/method/status/lifecycle corroborate candidates, never exact public identity. Duplicates/missing starts/redirects/overflow stay explicit. No private/timing-only/ordinal joins; receipt order is not causal order.

## Fixed sanitized metadata

Failure only, once/attempt: separate `[scheduling-passive-network-metadata]` JSON ≤4,096 UTF-8 bytes. Freeze sanitized rows at unwind without waiting; start cleanup before emission. Original snapshot stays independent. Envelope: `kind="passive-network-v1"`, `setup` (`ready|unavailable|pending`), `overflow`, `invalid`, `cleanup` (`requested|unavailable`), `rows` (0–4). Fixed row keys/types:

- `flight`, `hop` (1–4); `publicRequestOrdinal` (original positive safe integer/null); `publicMatchCount` (0–4); `identity` (`candidate|ambiguous|unmatched`).
- `type` (`Document|Fetch|XHR|Prefetch|other|unavailable`); `initiatorType` (`parser|script|preload|other|unavailable`); `rsc`, `treePrefetch`, `noStore` (boolean/null); `status` (integer 100–599/null); `mimeClass` (`html|rsc|other|unavailable`). Header projections: exact rsc=1; next-router-prefetch=1 plus segment=/_tree; cache-control token no-store. Never retain headers/maps/values.
- `requestMs`, `responseMs`, `terminalMs` (relative CDP milliseconds against first admitted CDP request); `requestSeq`, `responseSeq`, `terminalSeq`, `publicFailedSeq` (receipt sequence/null); `mainFrameNavigationAfterResponse` (boolean/null). Commit timing is not navigation-start/caller proof. Never mix CDP/Node clocks.
- `dataEventCount`, `receivedDataBytes`, `receivedEncodedBytes`, `finishedEncodedBytes` (safe nonnegative integer/null); `terminal` (`pending|finished|failed|redirected|ambiguous`); `canceled` (boolean/null); `errorClass` (`aborted|blocked-client|blocked-response|other|unavailable`); `blockedReason` (`csp|mixed-content|origin|inspector|integrity|subresource-filter|content-type|other|none|unavailable`). Missing optional canceled is null, not false. Exact error comparisons: net::ERR_ABORTED, net::ERR_BLOCKED_BY_CLIENT, net::ERR_BLOCKED_BY_RESPONSE; never emit raw errorText. Unknown blocked strings project to other.

Validate unknown inputs with narrow structural guards, no unchecked event casts. Times: finite 0–300,000 ms, three decimals. Sequence/count cap: 1,000,000; byte totals: 2,147,483,647. Overflow flags invalidate affected totals rather than wrapping/saturating evidence. Aggregate data events, no event arrays. Ephemeral URL keys max 2,048 characters, IDs max 256; malformed/oversize admission sets invalid and stores nothing. Bound both four-slot tables, including terminal entries, for the full window. Exclude unrelated keys, post data, cookies/tokens, initiator URLs/stacks, bodies/data and personal information. Stop clears keys/references. Serialize validated primitives; failure/oversize drops diagnostic, no retry/raw error/fallback. Test worst-case output size.

## Cleanup and proposed tests

Cleanup covers finally, page close and afterEach timeout. Close before removing named listeners; idempotent stop attempts every removal and detach once with immediate handlers. Late-acquired sessions detach without enable/listeners. Late callbacks cannot mutate/log/attach/call capture functions. No persistent resource.

Diagnostic errors become fixed unavailability, never recordFailure or replace/wrap/rethrow firstFailure. On failure/timeout never await unresolved setup/detach. Synchronous log, no async attachment; success silent. Rejected detach invalidates diagnostic credit; existing fixture teardown owns target closure. Preserve original cleanup errors/native verdict.

Proposed source-extracted tests: ID/hop/public ambiguity; missing/conflicting/redirect terminals; absent canceled; error/blocked sanitization; separate byte totals; invalid numbers/oversize/four-slot/output bounds; secret queries/headers/cookies/stacks/body/data exclusion; acquisition/enable failure; setup cancellation/late callbacks/idempotence; throwing removal/rejected or pending detach; unchanged native first error/success silence. Fakes confer **no browser credit**. After validated authoring run these/typecheck/lint; root decides one native run.

## Finite decision

CDP failed/canceled/error/blocked describes browser failure, not caller. Finished versus candidate public failure is qualified discrepancy evidence. LoadingFinished/counts **do not prove renderer EOF, body availability or finished/text success**. Missing/ambiguous/overflow evidence is inconclusive. Without an application cancellation mechanism, stop this lane for separately prepared exact-version no-store/stream reproduction. No unchanged CI loop, speculative app edit, broad review credit, 15.1 completion, 15.2 or deployment.
