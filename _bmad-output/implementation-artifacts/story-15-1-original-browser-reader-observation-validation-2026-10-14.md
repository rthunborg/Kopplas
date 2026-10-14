# Story 15.1 original browser reader observation proposal validation

## Outcome

**REVISE — preparation only.** Independent Sol 6.1 High validation of the actual 18,421-byte proposal finds two concrete unresolved preparation contracts. Resolve them before source authoring. This is a bounded diagnostic proposal validation, not a P5 review, execution authorization, acceptance waiver, or coverage credit. Broad review remains 0/3. Story 15.1 remains blocked; Story 15.2 and P5 release do not start.

The proposal remains byte-exact: SHA256 `64c45d82f560ea2b6afef81784862555bcbaba2804b8cf192c7702ac590e266d`. Its preservation, failure authority, original-reader scope, and conservative unknown classifications are sound. The gaps below require a concrete protocol, not an application fix or impossible proof of zero observer effect.

## Files changed

Only this new reserved companion. No proposal, source, helper, canonical spec, kernel, app, configuration, dependency, workflow, migration, Git, state, CI, resource, or browser change. No tests or runtime experiments executed. Other agents' edits are preserved.

## Status

### Consulted actual bindings

Complete file sizes and SHA256 digests were checked in the assigned worktree. Reads were bounded to the proposal and relevant installation/capture/reader paths; unrelated story specification and product code were not reviewed.

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| Original-reader observation proposal | 18,421 | `64c45d82f560ea2b6afef81784862555bcbaba2804b8cf192c7702ac590e266d` |
| `tests/e2e/scheduling-views.atdd.e2e.spec.ts` | 57,501 | `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` |
| `tests/e2e/support/scheduling-views-atdd.ts` | 18,231 | `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082` |
| `tests/e2e/support/booking-editor-atdd.ts` | 24,320 | `18d58914fcf36fc5e8fb544e2d723a0fb604d45bb0a902af1c8bc5b927d22ec5` |
| `tests/e2e/support/resource-cdp-attachment.ts` | 2,307 | `3073711d4488f93123044446790a508758e5235609f35f0b3f10e638326187d9` |
| Next `router-reducer/fetch-server-response.js` | 28,447 | `24857f50a53fc1f8058a0af15b006b3586dc1c581c9feb04443f0f9d284621c5` |
| Next `segment-cache/cache.js` | 147,853 | `8f4226c929b6bd902f24c2b9eef25a6600efc50c37d2b19019d8c99d877c08dd` |
| Next `segment-cache/fetch.js` | 1,379 | `378770d930578c5103083c029f8e388c4315ec67666d5843b2ddfc8af9469061` |

Assigned HEAD is `d75313bb63aa6dc414efacf0f1eb6fdd0fded186`; baseline/kernel `ddd188f63e7b84c59e8f921933140ca2a2613551` and the blocked canonical spec are preserved, not independently re-reviewed. Artifact digests/counts for run `38613188051` are coordinator-supplied, independently audited antecedent evidence; this validation did not reread ZIPs or claim a fresh artifact audit.

### Actual before-carrier path

AC2 begins its original `h.seed()` at source line 336. Harness fixture creation registers routes but does not navigate: booking-editor setup line 201 and fixture lines 324–329; scheduling fixture lines 195–199 only constructs the harness. The normal resource fixture provides Playwright's page; its attached variant creates its page/context before supplying them.

However, `SchedulingViewsHarness.seed()` ends by calling `signIn()` at helper line 75. That sign-in navigates to login and reaches dashboard at lines 86–88. Therefore installing after `h.seed()` misses an earlier possible dashboard tree-prefetch. Installing at the first AC2 statement on the verified blank page is the admissible source hook; capture origin can come from validated project baseURL rather than waiting for the existing line-340 scheduling URL. Unsupported/missing origin or a pre-used page must be unknown. Existing native observer admission at lines 589–600 must remain byte-exact.

Next's ordinary segment-cache fetch path invokes browser fetch; `createFetch` line 492 attaches `processFetch` to its original promise. `processFetch` can acquire the original reader itself under cache-component flags (line 254). Another existing path acquires it at line 422 and reads at line 425. A synchronous fetch wrapper can attach its handled mapping reaction before returning the exact original promise, so ordinary subsequently registered Next reactions can see the original-body WeakMap mapping. The implementation must demonstrate this order and reject bypasses/transformed/unmapped bodies, rather than assigning provenance to downstream streams.

### Accepted proposal requirements

- **Correspondence:** a complete, closed, unique one-to-one full-key join can establish diagnostic correspondence without a shared public ID. It must cover every eligible carrier on both sides and prove the same document/main-frame scope. Public Response binds the exact public Request with `response.request()`; the original native observer then supplies its capture ordinal. It must never claim cross-runtime object identity. Repeated keys, missing events/readers, redirects, workers, scope uncertainty, overflow, or incomplete closure remain unknown. Time, byte/hash agreement, terminal ordering, and passive CDP candidates cannot repair a failed join.
- **Pass-through:** synchronous wrappers, one original invocation with unchanged receiver/arguments, exact returned fetch/read promises and reader/result/byte/rejection objects, and handled side reactions are sufficient design constraints. No additional consumer, read, clone, tee, replay, substituted response, new fetch, runtime SDK patch, or application change is permitted.
- **Observation limits:** actual settled original reads only; EOF requires `done === true`. Whole-sequence hashing and fatal full decoding with both configured needles are required for complete-redaction evidence. Byte equality without EOF is insufficient. Missing needles, partial observation, caps, malformed decoding, late results, and deadlines remain unknown; new observations cannot fill original `payloads` or satisfy its assertions.
- **Observer effects:** added microtasks/copying/hashing carry residual timing risk. Exact identity preservation does not remove it. Reproduction of the original native discrepancy on the corresponding application carrier is necessary; green, missing failure, changed carrier population/order, or weakened assertions yields possible masking/unknown. No causal claim or automatic rerun follows. This bounds the proposal without demanding zero observer effect.
- **Failure preservation:** retain `Response.finished()` then `Response.text()` at lines 492–497, rejection handlers and first-failure authority, native Request observer, navigation/drain barriers, security assertions at lines 620–621, 180-second timeout, retries, original 20-key/1,024-byte receipt, 18 titles and 11 PNG requirements. Removing only marked additions must recover the complete source binding above. The helper and synthetic probe stay unchanged.

### Necessary revision 1 — private bridge and trace exposure

The full URL/query and exact flags needed for the closed join are initially browser-private and host-private values. The generated forbidden fixture email is created inside `h.seed()` (helper lines 49–52), after proposed early installation. The proposal requires both a cross-runtime join and browser complete-redaction checks, while forbidding sensitive values in traced observation arguments/results. It names no supported channel that performs those transfers/comparisons under that restriction.

Before authoring, specify the actual public API and direction of every bootstrap, gate, ledger, needle, and snapshot transfer; what its arguments/results contain; and how pinned trace capture treats them. Keep raw body/decoded data browser-only. Show how full-key equality and the configured generated needle are supplied/checked without newly exposing URL/query/fixture values through traces, reports, stdout, or attachments. If a prerequisite cannot be satisfied, explicitly classify that identity/redaction dimension unknown; do not claim a successful full-key join or complete redaction. A receipt formatter whitelist alone does not prove privacy of the preceding transfer. Do not silently replace exact equality with URL hashes, timing, body hashes, or an injected network ID; any alternate protocol needs separately bounded review.

### Necessary revision 2 — document gate, readiness and stop protocol

The proposal says to use `addInitScript` plus current-document installation and an inactive host gate, but leaves the bootstrap/gate ordering unspecified. An init script consulting a host binding/evaluation may receive readiness asynchronously. Delaying wrapper installation until that response can miss the original dashboard fetch; installing before that response leaves the post-stop bootstrap ownership/inertness question unresolved. This is a protocol gap, not proof that all possible public implementations fail.

Specify a document lifecycle sequence with the synchronous hook-install point, verified current-document readiness before AC2 `h.seed()`, host/public document scope registration, original-call eligibility, new-document gate handling, freeze, and owner-checked restoration. State what happens when application fetch/read occurs before gate settlement, a document is replaced while registration is pending, stop precedes a new bootstrap/gate response, or ownership changes. No original fetch/read/navigation may await the observer or gate. The pure proofs must make all missed/uncertain cases unknown and prevent late activation/emission after freeze. Public frame identity alone is insufficient across replaced documents: uncertain document correspondence must stay unknown. Residual init-script registrations cannot rely on an assumed removal API or delayed fixture disposal to establish successful cleanup.

## Open questions

Resolve only the two protocol gaps above, using bounded actual API/trace behavior when needed. Cancellation actor, application EOF/full-payload/redaction, and acceptance remain unknown. The 1,000ms observation allowance can collect a later fact within the existing attempt deadline; it cannot establish that EOF occurred before host failure by comparing browser and host clocks. Pending native/body promises must remain pending, with the original failure retained.

## Deferred work

Coordinator-owned follow-up preparation may document the resolved protocols without overwriting the admitted proposal bytes. A separate independent PASS must precede bounded source authoring, meaningful source-extracted pure proofs, exact High source review, and any separately authorized controlled run. No broad framework work, dependency upgrade, speculative app fix, local launch, assertion relaxation, or Story 15.2 expansion is needed to resolve these gaps.

## Blockers

Two preparation blockers: concrete trace-safe private transfer/comparison, and concrete before-carrier document-gate/cleanup protocol. Existing required general-browser failure and incomplete acceptance evidence remain substantive story blockers. Synthetic browser EOF/native-terminal discrepancy, proposal validation, and any future diagnostic success do not waive them.

## R1 focused independent revalidation (2026-10-14)

### Outcome

**REVISE — one remaining concrete preparation blocker.** R1 supplies concrete encrypted private-key/needle transport and synchronous provisional collection/removable bootstrap protocols. Those resolve the two original mechanism omissions conditionally, subject to their specified source proofs and fail-closed cases. A pinned trace boundary still conflicts with the retained blanket no-IDs requirement: creating the public CDP session records an owned existing Playwright page GUID. This is framework control metadata, not a tenant, fixture, application, public Request, or cancellation identity. This validation neither treats it as secret application data nor silently permits it under a prohibition that R1 has not amended.

### Exact reviewed appendix and immutable bindings

Actual R1 proposal: 36,383B/SHA256 `5d7ef4ea7a7e010476fff18fb549253f96fc95f6d9809bbd452f0821a58f7dcf`; appendix 17,962B. The exact original 18,421B prefix remains SHA256 `64c45d82f560ea2b6afef81784862555bcbaba2804b8cf192c7702ac590e266d`. This companion's original 11,159B prefix remains SHA256 `23268e90ff9bdac3d20433b7c2814f3d655550e92167d5ba47cbe78cb0a54be4`. Scheduling source/helper remain 57,501B/`9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` and 18,231B/`84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082`.

Read-only pinned Playwright 1.61.1 consulted bindings, all under `node_modules/.pnpm/`:

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| `playwright-core@1.61.1/node_modules/playwright-core/lib/coreBundle.js` | 3,352,341 | `6be5c2ea035554e9b184b1dbc7aa5e7f1fb428dd1b5c202022858dcfae9bee27` |
| `playwright@1.61.1/node_modules/playwright/lib/index.js` | 34,528 | `033484bd04076585fa11954261323575a2f8ec12ca113f0c288dac67009fbf9f` |
| `playwright@1.61.1/node_modules/playwright/lib/worker/workerProcessEntry.js` | 75,892 | `e8b654850c073df3996816eb09edf845490d9a6e75785477a9ddb69d586cca54` |
| `playwright-core@1.61.1/node_modules/playwright-core/package.json` | 876 | `759e376f995bf39edd4810d699b99469bab1d7428b6fbc78d41912f367df7ba9` |

Only relevant bundled source spans were inspected. These are code-path findings, not runtime trace evidence or a new broad dependency review.

### Narrow pinned trace result

Public `CDPSession.send()` forwards `{method, params}` through its channel (`coreBundle.js` 56144–56146). Server CDPSession inherits the root CRSession/CRConnection attribution, rather than the target BrowserContext (12389–12395, 34505–34516, 34554–34556, 34626–34630, 38176–38189). Context-scoped tracing listeners filter by exact `sdkObject.attribution.context` (12369–12375, 24746). Therefore those send calls are excluded from the BrowserContext library action trace; the corresponding binding events are emitted directly to the public client (51490, 56131–56133), rather than becoming action-call parameters. Runner API tracing supplies top-level channel parameters (`playwright/lib/index.js` 87–108); its preview turns the nested CDP `params` object into the literal `Object` (`workerProcessEntry.js` 731–744, 774–791). This supports the feasibility of R1's targeted exclusion of raw Runtime context IDs, removal script IDs, binding metadata, and encrypted dispatch contents from those trace paths. It does not prove every future wrapper/error path private.

The public session-creation call is different. `BrowserContext.newCDPSession` is invoked on the context dispatcher (53120–53126). Dispatcher metadata retains original wire `params2` (18387–18403). The context's tracing listener records `metadata.params` in its before event (24567–24580, 24964–24973). The page argument is the existing channel reference, serialized as `params.page.guid`. `visitTraceEvent` recursively preserves ordinary object/string fields; its dispatcher replacement applies to actual Dispatcher instances, not that wire GUID object (24545–24565). Thus, while tracing is active, the new public creation call can record the owned framework page GUID. The returned session Dispatcher is replaced with `<CDPSession>`; it is not a newly serialized secret session identifier. The runner's object preview does not remove the separate library before event.

R1 says earlier preservation/privacy constraints remain authoritative and supersedes only unspecified transfer/bootstrap choices. The earlier rule forbids IDs/tokens crossing into traces through observation arguments/results without distinguishing framework handles. Its literal requirement therefore remains incompatible with this reachable session-creation path. This is the remaining blocker; it is not a finding that the ciphertext leaks a fixture email or that CDP Runtime dispatch necessarily records a context ID.

### Mechanisms conditionally accepted and necessary revision

The ECDH/HKDF/AES-GCM proposal has a concrete supported API route, direction-separated keys, fresh public bootstrap material, sequence/AAD binding, fixed padding, exact decrypted tuple comparison, bounded envelopes/storage, fatal decoding and no plaintext fallback. Its public crypto material/ciphertext is expressly classified as transport, not identity evidence. Source proofs must still cover exact schemas/caps, invalid point/tag/padding, replay/reorder/cross-context rejection, zeroing owned mutable buffers, cleared references, and fixed error boundaries. Raw bytes/decoded data remain browser-only. No URL/body hash may substitute for exact tuple equality.

The synchronous PROVISIONAL installation before the first unchanged `h.seed()` correctly prevents an asynchronous gate from delaying collection. Registration qualifies already collected evidence rather than guessing a missed call. Actual document/default-world/main-frame association, transitions, replacement, unexported destroyed contexts and all-document closure remain conservative UNKNOWN cases. Public owned script removal plus bounded lifecycle fence/restoration is a concrete cleanup protocol; a raced or unreachable bootstrap cannot receive successful cleanup status. No fetch/read/navigation waits on the observer. Implementation proofs, rather than this preparation review, must establish each exact event schedule and owner check.

Necessary revision: explicitly resolve the treatment of **owned framework control metadata** at the public session-creation trace boundary. A bounded amendment may distinguish the existing page channel GUID from forbidden application/tenant/fixture/request identifiers, while retaining the actual no-context/script/secret transport requirements; otherwise provide an admissible public alternative and its pinned trace evidence. This reviewer does not grant that amendment implicitly. Do not disable/scrub traces, patch SDK internals, hide calls through private instrumentation, or relax raw application privacy to avoid the mismatch.

### Retained status, open questions, deferred work and blockers

Only this focused validation appendix is authored; every existing byte is preserved. No source/spec/kernel/Git/state/CI/resource/browser/test change or execution occurred. Historical eight probe cases and general-browser failure are unchanged antecedent evidence. Original reader/fetch promise/result/byte/rejection identity, native `Response.finished()`/`text()` failures, first-failure authority, exact native observer, 20-key/1,024B receipt, security assertions, deadlines/retries, 18 titles and 11 PNGs remain required. Closed complete unique bijection stays conditional correspondence, not shared object identity. Added microtask effects remain acknowledged; persistent original native failure on the corresponding carrier is mandatory, with masking/green/changed population UNKNOWN.

One preparation question remains: the explicit framework-handle trace classification above. Resolve it in bounded preparation, then independent focused PASS before authoring, actual source-extracted proofs, exact High source review and one separately controlled diagnostic. Acceptance EOF/full payload/redaction/correspondence/cancellation actor remain unknown; no waiver, coverage credit, broad review/P5 credit, story completion or Story 15.2 follows.
