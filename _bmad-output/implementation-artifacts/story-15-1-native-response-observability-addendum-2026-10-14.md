# Story 15.1 native response observability — implementation proposal

Status: **PREPARE ONLY; independent High validation and authoring release pending.**

This is an implementation addendum to [the approved corrected spec](spec-15-1-the-five-scheduling-views-2.md), not a replacement specification or a passing-body repair. No normative intent change is proposed. The spec remains blocked with `implementation verification failed`, ten unchecked tasks, review iteration 0, follow-up false and no frontmatter deferrals. Its historical HALT, closeout, incident evidence and author-written Suggested Review Order remain intact.

Preservation inputs:

| Input | SHA256 |
| --- | --- |
| Approved intent contract | `035ee9683e8b3e6e0420204a3ddfa8d81b0dcb6a47aa12e638673859d60cc234` |
| Current full spec | `d5a492a1546c19d777d8bff3d7037686e60a577565cac67281bff764f427bc22` |
| Current scheduling browser spec | `0e1861d1f148dca2b90c099197149e0d8d9152d101429aa4915c3f17ab090ba8` |
| Original implementation review baseline | `ddd188f63e7b84c59e8f921933140ca2a2613551` |

The coordinator reports checkpoint `bf84cf5d6487480c1fdcfc18dcbd6f49a6a704b0`; no Git operation or fresh runtime verification is performed for this proposal. The existing 11 PNG targets, all 18 scheduling cases, native payload assertions and previous receipts are preservation requirements.

## Observed problem and remaining uncertainty

The independent High audit of native CI run 38549574105 at head `d79fff086e40c6e1d3b253a60a08da6ea72ae3bd` reports retry 0's `Network.getResponseBody` missing-resource failure; the original body/request identity is not retained. Retry 1's retained trace records one successful body call at relative 163.003–164.877 ms, navigation completing at 268.065 ms, a loading assertion at 520.076 ms, and a subsequent completion wait that hangs. These are coordinator-supplied trace facts, not a new trace inspection here.

HAR records include successful-status RSC GET/POST traffic marked `net::ERR_ABORTED`. Abort timestamps, CDP IDs and a causal join to the hanging captured Response are unavailable. Neither the successful body nor an arbitrary HAR abort identifies that Response. No authorization, read-model, browser-version, eviction or pre-timeout abort cause is established. Historical local body/SxS failures are preserved separately.

The installed Playwright 1.61.1 assessment identifies a client completion-signaling asymmetry: `requestfinished` resolves the client Response completion signal, whereas `requestfailed` does not. This supports a public failure observer as a fail-loud observability candidate. It does not prove that an observed abort caused either attempt, or that this candidate can make the case pass.

## Proposed functional change: fail on an exact captured native request

Future implementation ownership is only the AC2 observer in `tests/e2e/scheduling-views.atdd.e2e.spec.ts`, after independent validation and explicit release. No application reader, RPC, permission, fixture, configuration, SDK or private runtime helper change is part of this contract.

1. Retain the exact existing successful-Response matcher: captured origin plus pathname `/scheduling`, including its existing query-bearing navigation/action responses. Do not add exclusions, content-type filters or request-type filters.
2. For each already-matched Response, synchronously obtain its public `response.request()` object and register that exact object before the first `await`. Use an attempt-local WeakMap/object-identity registry; matching URL text or a later lookup is insufficient. The registry is correlation state for active captures, not a serialized history.
3. Register one owned public `page.on("requestfailed", listener)` before the existing navigation/capture window. Act only when the event carries an object already in that registry. Ignore unrelated objects, including objects with identical URLs. Do not record or inspect their request data.
4. For a matched native failure, invoke the existing `recordFailure`/fulfilled failure signal. Do not resolve `response.finished()`, settle a native body promise as successful, append an empty body, or synthesize a fulfilled capture. A pending capture may remain pending; the existing failed drain must stop waiting and fail.
5. Preserve the existing first-observed-error authority, including falsy earlier values and original native body/completion exceptions already observed. Public `Request.failure()` supplies an `errorText` string rather than an Error object. Its exact reason/error carrier and unavailable-metadata handling are **open validation questions**, not source decisions. Independent High validation must resolve that bridge against the installed public API and privacy limits before authoring. No wrapping, coercion, new message or fallback implementation is selected here; an unavailable diagnostic field must never turn a matched native failure into success.
6. Retain the original native `response.finished()` and `response.text()` calls, their order, raw in-memory payloads and immediate rejection settlement. Existing capture, navigation and UI errors retain their original objects/values and precedence. No rejection is swallowed to succeed.
7. On success, detach the response listener and fully drain the final capture buffer while the request-failure listener is still installed. Remove only this owned failure listener after that drain in a finally path. On failure, remove owned listeners without awaiting unresolved captures; their already-installed rejection handlers remain attached. Cleanup cannot replace an earlier error.

All manager/Montör/denied-role UI checks, tampered person/tenant inputs, exact own IDs, nonempty body checks, peer-email/lifecycle withholding and every other assertion remain unchanged. A matched native abort is a failure even if it might later prove to be normal application traffic; this proposal grants no exception to the approved capture contract.

## Proposed diagnostic: one bounded failure snapshot

Only an already-captured request's native failure or its completion/body rejection may attempt a snapshot. Record functional failure first. The snapshot is capture-failure evidence, not necessarily the first test failure and never body coverage.

Use one attempt-local `snapshotAttempted` flag, set before serialization/output. Choose one synchronous emission with the fixed prefix `[scheduling-native-response-failure] ` and at most 1,024 UTF-8 bytes of JSON. No attachment/file writer, asynchronous diagnostic task, queue, retry, rollover or history is proposed. If collection, validation, serialization or output fails, emit nothing further and preserve the original failure. Diagnostic operations, including getters and successful timing updates, must be nonthrowing to the test. Stop diagnostic output when the owned observer window closes; later settled rejection handlers still preserve error handling.

The JSON object has exactly these keys and no arbitrary object spreads:

| Keys | Allowed values |
| --- | --- |
| `kind` | Literal `native-response-failure` |
| `trigger` | `requestfailed`, `finished-rejected` or `body-rejected` |
| `path` | Literal `/scheduling`; no origin or URL |
| `queryPresent` | Boolean, or null when unavailable; never query values |
| `method` | `GET`, `POST`, `other` or `unavailable` |
| `status` | Integer 200–299 from the already-matched Response, or null |
| `contentType` | `text/html`, `text/x-component`, `application/json`, `text/plain`, `other` or `unavailable` |
| `requestOrdinal`, `captureOrdinal` | Attempt-local positive safe integers, or null |
| `phase` | `response`, `finished`, `body` or `complete` |
| `responseMs`, `finishedStartMs`, `finishedEndMs`, `bodyStartMs`, `bodyEndMs`, `requestFailedMs` | Relative finite nonnegative numbers no greater than MAX_SAFE_INTEGER, or null |
| `captureCount`, `fulfilledCount`, `rejectedCount`, `pendingCount` | Nonnegative safe integers |

Read a content type only to project it into the fixed whitelist; do not serialize headers. Request/Response objects, error text/objects, bodies, cookies, tokens, full URLs, query values, fixture IDs and raw errors never enter this new payload. Any later approved native failure carrier belongs exclusively to the existing failing test path; its representation is unresolved here. Ordinals and relative timestamps associate the failed observer with its original public Request object without exposing protocol IDs.

Counters describe actual capture-promise settlement. A `requestfailed` event does not pretend a pending capture has settled. A completion/body rejection increments rejected count before its snapshot; pending count excludes that settled rejection. No retained list of prior captures is emitted. Missing metadata uses null/the fixed unavailable values, not invented facts. Existing failure classifiers are not changed; `trigger` and `phase` are observation points only.

## Bounded verification required after authoring release

Independent High preservation/spec validation must approve this proposal before any test-file edit. Thereafter:

- Prove the exact source diff affects only this observer/diagnostic contract. All 18 titles/cases, 11 PNG targets, native matcher/reads, assertions, first-error behavior, retries and timeouts must remain. No scope or permission change is authorized.
- Use a separately admitted private no-network proof of the actual extracted observer logic; do not import canonical fixture/setup/test-environment modules. This is harness evidence only, never JWT/RLS/body acceptance. The proof must cover unrelated/same-URL-different-object failures; matched failure while completion remains unresolved; matched failure during final success drain; earlier native/UI/falsy errors retaining precedence; all-success full drains and original payload checks; only owned listener removal; repeated failure notifications; unavailable/throwing metadata; strict snapshot schema/byte/one-attempt bounds; and rejection settlement without successful-body substitution.
- Run focused lint and no-emit typecheck. No dependency, SDK or test-inventory change is proposed.
- Obtain independent High exact implementation review before any runtime invocation. A later coordinator-selected native CI run must bind its exact source/head and authentic artifacts. Report every scheduling case and attempt, skips, native body failures and assertion-stage reachability. A new failure is retained evidence, not an excuse to suppress a capture or increase a timeout.

No new proof helper, test, CI run, resource action or source implementation is executed by this preparation. Future private proof paths and execution are separately scoped by the coordinator; this addendum does not authorize a new tracked test or configuration path.

## Acceptance and resume boundary

Open validation question: how should the matched public failure event's native `errorText` (or its absence) reach the existing first-failure mechanism without replacing an earlier original native body/completion exception, changing failure classification, or disclosing raw error data through the new diagnostic? The validator must settle this question before implementation release; this document chooses no carrier.

The approved kernel, eight ACs, task expectations and Suggested Review Order are not edited. All required native bodies/payload assertions must actually pass; an observer that merely reports an abort does not resolve the story. Successful first-error signaling without a passing body is only observability progress. Normative capture/intent ambiguity, a need for exclusions or authority changes, or a necessary SDK/wire alteration must be reported as a gap for review rather than implemented under this proposal.

Keep status blocked, all task checkboxes unchecked and broad rounds at 0. General/mail/editor/dashboard/physical recovery evidence, visual evidence and all six independent implementation review layers remain governed by their existing gates. No P5/E5h completion, NFR certification, manual accessibility claim, Figma screen ID or 15.2 authorization is introduced.

Historical HALT/closeout, the wrong-target fixture incident, failed native/local receipts and old guard `inspect_only` state remain preserved. This proposal neither repairs the old browser package nor admits a resource lifecycle retry.
