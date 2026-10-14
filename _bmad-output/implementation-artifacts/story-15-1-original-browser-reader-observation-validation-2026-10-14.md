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
