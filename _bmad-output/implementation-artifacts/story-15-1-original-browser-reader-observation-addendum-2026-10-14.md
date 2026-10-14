# Story 15.1 original browser reader observation proposal

## Outcome

PREPARATION ONLY. Propose a temporary test-side observation of the original browser reader acquired by Next. Coordinator path admission is not implementation or execution approval. Independent Sol High validation must resolve the questions below before code authoring; exact High source review precedes one future controlled run. No code, spec, Git, state, resources, runtime or tests changed/executed during preparation. P5, broad review and application acceptance credit remain zero.

Root-recorded route: existing sensitive Sol 6.1 High author, sequential preparation. Retain the approved kernel/baseline `ddd188`, blocked story status, existing native failures and all acceptance requirements.

## Files changed

Only this new addendum. Proposed future source ownership is **only** `tests/e2e/scheduling-views.atdd.e2e.spec.ts`, under its coordinator reservation. That file is currently 57,501B/SHA256 `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` and remains untouched. Read-only helper: 18,231B/SHA256 `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082`.

No helper, app, SDK, fixture, dependency, workflow, configuration, migration or spec edits are proposed. The separate synthetic probe remains immutable. Existing proof histories and failed receipts remain intact.

## Status

### Actual evidence and its limits

Run `38613188051`, exact commit `d75313bb63aa6dc414efacf0f1eb6fdd0fded186`: four required jobs PASS; general browser job FAIL; optional synthetic probe SUCCESS with eight actual cases. Actual probe versions: Node 22.23.3, Playwright 1.61.1, Chromium 149.0.7827.55. All seven artifact ZIPs were independently digest-verified; private metadata/digest/extraction receipts remain under `.env.epic15.mail-runtime/ci-native-stream-probe-38613188051/`.

- Probe JSON: 10,345B/SHA256 `a8efa8eedb67bdcadcb249e6df29bc36ef722d4180c2bb9d9009f10a442ea7a0`. Four reader positives have actual EOF, complete 324B/hash and server finish without premature close. Three also have public/CDP failure; one is clean. This reproduces a synthetic browser/native-terminal discrepancy.
- Two separate host `Response.text()` positives are unresolved; their browser streams were not exercised. They provide neither an independent complete-body comparison nor a cancellation explanation.
- Two controls have actual reader error/non-EOF, premature close and both failure terminals. Their complete plaintext byte count/hash does **not** establish delivery without EOF. Native `Response.finished()` remains unknown, as the pinned API permits.
- General JSON: 2,261,302B/SHA256 `37b0c6ac25d6ba40d5e9e87f8f79d02f609ee98d7bd55f82f4bf09ca5309dbcd`. Actual case results: 382 total, 368 passed, one failed, 13 skipped. Attempts: 375 passed, two failed, eight retries. Scheduling has 18 titles: first seven pass twice; AC2 fails twice with `ERR_ABORTED`; remaining ten do not run.
- Both AC2 receipts preserve the original 20-key native snapshot: one GET/200/RSC capture in `finished`, no body start, zero fulfilled and one pending. Passive candidate CDP failure/canceled/aborted is observed before public failure; 324 decoded bytes do not prove EOF. A second unmatched flight remains pending. Retry is not the tampered navigation.

Application EOF, complete payload, complete redaction, exact browser/public identity and cancellation actor remain unknown. Synthetic evidence does not resolve those application questions.

### Exact consulted input bindings

All SHA256 values bind complete bytes; these are read-only inputs, not implementation changes.

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| Scheduling E2E source | 57,501 | `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` |
| Scheduling helper | 18,231 | `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082` |
| `tests/e2e/support/booking-editor-atdd.ts` | 24,320 | `18d58914fcf36fc5e8fb544e2d723a0fb604d45bb0a902af1c8bc5b927d22ec5` |
| `tests/e2e/support/resource-cdp-attachment.ts` | 2,307 | `3073711d4488f93123044446790a508758e5235609f35f0b3f10e638326187d9` |
| `node_modules/next/dist/client/components/router-reducer/fetch-server-response.js` | 28,447 | `24857f50a53fc1f8058a0af15b006b3586dc1c581c9feb04443f0f9d284621c5` |
| `node_modules/next/dist/client/components/segment-cache/cache.js` | 147,853 | `8f4226c929b6bd902f24c2b9eef25a6600efc50c37d2b19019d8c99d877c08dd` |
| `node_modules/next/dist/client/components/segment-cache/fetch.js` | 1,379 | `378770d930578c5103083c029f8e388c4315ec67666d5843b2ddfc8af9469061` |
| `node_modules/next/package.json` | 3,173 | `6da8fc4823b66b8f2906d150002618e3f3e0d2446ebf3823b2a2f7efe73a46a4` |
| `package.json` | 1,879 | `b14c4d6182e43ee384f159a53d077556370953a891130d84f786f3632868b35f` |
| `pnpm-lock.yaml` | 166,878 | `532abe9d606d49daa060b41ebc91bc44b359291059b8832bed98233b65299ee2` |
| `.github/workflows/ci.yml` | 31,992 | `5fae85b59d5d140f60487adc85c070a1eab592a643776f7e23c955cc23b3664d` |
| `tests/diagnostics/no-store-stream-probe.mjs` | 25,358 | `f4b0d06fa6ad41f94767b54a882f1b77b7ae3098a2a952ea1ef9f2ccfbadb647` |
| Current native-stream addendum, including retained appendices | 14,734 | `812b305b251f133400bcf1d00c80214ed51fc8bc99040b6ac7ebab8db99bf8a8` |

The source reads establish these narrow hook points: the normal resource fixture provides Playwright's page, and the attached variant creates a fresh page. Next's `segment-cache/fetch.js` calls `window.fetch` in its normal path. `createFetch` applies `processFetch`; `processFetch` normally retains the response but can transform its body under cache-component flags. The non-PPR prefetch path calls `createNonTaskyPrefetchResponseStream(response.body)`, whose existing `getReader()` and `read()` calls buffer the original input. Other pinned paths acquire the original body reader in `stripIsPartialByte` or incremental prefetch code. The proposal observes the browser response's original body; transformed downstream streams do not receive guessed provenance.

### Install before the original carrier; complete ledgers

Future additions must establish public request/response listeners and a test-only browser bootstrap **before the AC2 test's first `h.seed()`/sign-in/open navigation**, rather than after host response delivery. Use this existing page and its future main-frame documents; do not create a new page or cause an extra navigation. The bootstrap can use `page.addInitScript` plus installation in the existing initial document. A pre-used/nonblank page, unsupported descriptor, missed document bootstrap, readiness uncertainty or carrier before installation makes the observation unavailable/unknown.

Maintain a bounded browser fetch ledger and an independent public Playwright request ledger from this early installation through a common closed observation window. Record all eligible same-origin `/scheduling` GET/RSC fetches, including dashboard tree-prefetch carriers, before selecting the failed native capture. Existing capture admission remains unchanged. Use private document/attempt tokens, main-frame scope, full URL including query, exact method and only RSC/prefetch flag values as in-memory join keys. Never inject a network correlation header, alter the URL or use timing/hash/324B as identity evidence.

There is **no shared public browser/Playwright object or request-ID bridge**. Proposed sufficient correspondence is a closed, complete one-to-one ledger join: exactly one eligible browser fetch/body/reader chain and exactly one public Request for the full key in the same verified document/main-frame scope. The public Response must bind that Request through its existing public `response.request()` object, and the failed native capture must be that exact public Request already held by the original observer. No direct cross-runtime object identity is claimed. Independent High validation must decide whether these completeness/uniqueness premises are sufficient; otherwise identity stays unknown.

Repeated keys, missing starts/responses/readers, mismatched document or flags, unresolved join closure, additional native captures without counterparts, overflow, redirects, service workers or frame uncertainty invalidate correspondence. Do not repair ambiguity with nearest time, event ordering, terminal state, body length/hash or passive CDP candidates. Existing passive rows retain their candidate/unmatched classification.

### Original object and promise pass-through

Propose test-only synchronous wrappers around the public browser `fetch`, `ReadableStream.prototype.getReader`, and the `read` method of **only the original reader Next itself acquires** from an admitted original browser body. This is new proposed observational scope; it is not permission to patch Next or Playwright internals.

- Call each original method exactly once with its original receiver and arguments. Preserve synchronous throws, exact returned fetch promise, exact reader identity and exact returned `reader.read()` promise. Wrappers must not be `async` and must not return the side-observation promise.
- Retain the original response, stream, read result object, `done`, byte view and rejection object unchanged. Do not await observation in the consumer path, substitute errors, swallow the consumer's rejection, alter `cancel`/`releaseLock`, introduce a read, or change the number/order of consumer reads.
- Attach handled side reactions to original promises. Observe only their actual settled results; pending remains pending/unknown. Copy an original settled byte view into bounded browser-only private memory for observation, without modifying/detaching it. An observer exception must be contained and classified unavailable, never change the consumer result.
- Use a WeakMap from original response body to its observed fetch record. If Next's configuration transforms the body, observe only the original body's already-existing acquisition/read calls when traceable by this map; never propagate a guessed identity to a wrapper/clone stream. Missing original acquisition remains unknown.

Side reactions add microtasks and copying/hash work before or alongside consumer continuations. Exact object/promise preservation does **not** prove zero observer effect. The instrumented diagnostic must still reproduce the original native discrepancy/failure on the corresponding application carrier; a green AC2/general run, absent failure, changed carrier population/order, unsupported installation or weakened assertion is not a successful discriminator. Stop with possible masking/unknown; do not credit a fix or automatically rerun.

### Bounded privacy, observation and cleanup

Proposed fixed limits: at most 16 eligible entries in each private ledger, four original body/reader records eligible for serialization, 256 observed original read settlements per reader, 2MiB copied bytes per body and 8MiB aggregate private byte storage. Limits count all admitted entries, not just a convenient matched subset. Overflow never stops or truncates the application's consumer; it stops diagnostic collection and makes the affected identity/completion/redaction unknown. No automatic cap increase.

Only actual `read()` settlement with `done === true` establishes browser EOF. Reader error, partial count/hash, native/CDP terminal or a complete byte count without EOF does not. At EOF within limits, hash the complete observed original byte sequence using browser `crypto.subtle`; inspect the complete sequence for both existing forbidden values (fixture forbidden email and `"needsReassignment":`). Split chunks/UTF-8 boundaries must not defeat the checks. Complete redaction requires EOF, complete bytes, configured needles and valid full decoding; missing needles, invalid decoding, deadline, overflow or late hash settlement yields unknown. New observations never populate the original host `payloads` array or satisfy its assertions.

Raw bytes, decoded body, forbidden needles, full URLs/query values, IDs/tokens, headers, cookies, credentials, storage, arbitrary errors and stacks must never cross into the new report, stdout, attachments or traces through observation arguments/results. Keep raw original bytes only in bounded browser memory; release buffers and needle references on freeze/cleanup. Hashes are diagnostic identities, not application payload disclosure or authorization evidence.

One new allow-listed JSON receipt per AC2 attempt, at most 4,096 UTF-8 bytes and four rows. Header enums: kind/version, installation, ledger closure, invalid/overflow, cleanup and observer-effect classification. Row fields are bounded ordinals/counters and enums only: original reader acquired, settlement/error/EOF state, complete byte count/SHA256 or null, both complete-redaction booleans or unknown, unique join state/counts, original native request/capture ordinals when proven, and original public/native terminal states. No raw event objects or inferred cancellation actor. Schema/key/value/size rejection produces a fixed unavailable classification, never a partial successful receipt.

A diagnostic-only final observation allowance is at most 1,000ms total and must fit inside the existing attempt deadline; hash/snapshot work outside this allowance is unknown. It does not change the 180s test timeout, retries, navigation/drain barriers or CI budgets. Do not wait for another application read or resolve the host's pending body. Retain the original first failure before any optional snapshot; snapshot timeout/failure cannot replace or suppress it. Observations that require delayed teardown must be explicitly classified and cannot establish pre-failure completion by cross-clock inference.

Freeze browser and host diagnostic ledgers before teardown events; remove new host listeners, clear bounded timers/buffers, restore only descriptors/wrappers still owned by this observer, and handle all side-reaction/hash/binding rejections. Late results cannot mutate or emit a final receipt. `page.addInitScript` registrations have no assumed public removal API: future-document bootstrap must consult an inactive host gate and remain inert/restore owned wrappers after stop; existing fixture disposal retains page/context ownership. Validator must assess this residual bootstrap and readiness race before implementation. No new process, server, browser or local resource launch is permitted by this contract.

### Preservation and meaningful proofs before a run

Future author must mark every eligible addition so removing only those additions reproduces the entire 57,501B source and SHA256 above. Preserve every existing byte outside additions, including `Response.finished()` then `Response.text()`, original promise/capture rejection handling, exact native Request observer, first-error precedence, native drain/navigation barriers, security assertions, original 20-key/1,024B receipt, passive metadata, 18 test titles and 11 PNG requirements. No timeout, retry, assertion, failure substitution or reporter/workflow change. Helper, app, kernel/spec, package/lock, configuration and synthetic probe hashes remain unchanged.

Planned source-extracted/imported pure proofs, without HTTP/browser/app execution:

1. Original receiver/arguments/call count; exact fetch/read promise and reader/result/byte-view identity; synchronous throw and asynchronous rejection identity; no observer return substitution or extra reads.
2. Hook registration before the existing carrier starts; response/body mapping before original consumer acquisition; missed installation or transformed/unmapped body stays unknown.
3. Complete ledger bijection and linkage to the exact original public Request/capture; duplicate/missing/redirect/worker/frame/document/flag mismatch and overflow reject correspondence without timing rescue.
4. Real EOF/full-byte hash versus identical byte count without EOF; split forbidden needles and UTF-8 chunk boundaries; absent needle, malformed decode, byte/read/memory cap and late hash produce unknown.
5. Strict formatter whitelist/key/value/4,096B/four-row limits with hostile URLs, payloads, credentials, exceptions and foreign fields; no raw browser-buffer/needle return through bindings.
6. Observer exceptions and rejected side reactions do not alter original rejection/result; freeze prevents late callback/teardown evidence, cleans memory/listeners/timers, and detects descriptor ownership changes.
7. Exact full-source inverse and immutable consulted-input hashes; original host failures, capture assertions, 20 keys/1,024B, titles/PNG inventory and deadlines remain intact. An observed green run cannot be classified as persistent native discrepancy.

Run only applicable syntax/static checks and these focused pure proofs after validated authoring. Independent High source review verifies public-only hook scope, exact inversion, privacy and the above negative cases. No broad P5 review, local test infrastructure or runtime experiment is authorized at this preparation stage.

## Open questions

Independent High validation must decide: (1) whether the complete, closed, unique ledger join is sufficient correspondence despite no public shared-ID bridge; (2) whether the before-carrier initialization/document gate can be demonstrated without a missed original call; (3) whether exact promise/result/rejection preservation plus the required persistent native failure sufficiently bounds masking risk; and (4) whether the residual init-script gate, bounded final observation and trace/privacy plan preserve cleanup and failure authority. These are explicit validation blockers, not inferred approvals.

## Deferred work

Validate this proposal in the separately reserved original-browser-reader-observation validation document. Only after PASS: bounded source authoring in the one reserved E2E path, private pure proofs, exact High source review, and one separately authorized controlled run. If observations are incomplete, ambiguous or masked, stop with the missing discriminator; no automatic expansion, app repair, dependency upgrade, assertion relaxation, story completion or Story 15.2.

## Blockers

Pending independent High validation of correspondence, early installation, observer effects and cleanup/privacy sufficiency. Existing application native failure and incomplete acceptance evidence remain blockers; no proposal or synthetic success waives them.
