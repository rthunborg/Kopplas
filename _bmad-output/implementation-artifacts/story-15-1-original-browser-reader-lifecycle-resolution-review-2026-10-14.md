# Story 15.1 independent lifecycle resolution review and upstream exit evidence

## Outcome

**PASS the focused resolution; retain BLOCKED / REVISE mechanism readiness.** Independently inspected actual candidate, helper, original acceptance source, R1/R2 contract and pinned SDK paths. The resolution correctly stops this incomplete candidate before insertion. No demonstrated admissible final-call/export protocol exists in the supplied mechanism. This is a bounded conclusion about these sources, not a global impossibility theorem.

Official upstream research found a merged Chromium fix and an exact distributed Canary version whose tagged source contains it. That supplies a concrete separate native experiment proposal, not a verified application remedy or permission to change the browser/dependency/acceptance contract. No broad review round or completion gate is earned.

## Files changed

Only this new review artifact. Route: fresh independent `gpt-6.1-sol` High for critical lifecycle/integrity/privacy review; reviewer is not the resolution/candidate author. Checkout and HEAD `437c3da22608973a396fbc0c090fc67a50429b64` are coordinator-supplied context; Git state was not audited or changed here. Existing files and other agents' work were preserved. No tests, resources, browser, protocol proof, static check, source/helper/spec/app/configuration/dependency/migration/runtime/CI action was performed.

## Status

### Independent source findings

1. **Departure conflict confirmed.** Original AC2 source 336 invokes `h.seed()`, manager sign-in and `h.open("Resurser")`; helper 75 invokes sign-in, 86-88 clears cookies and uses explicit `/login` navigation followed by dashboard, and 95 explicitly navigates to scheduling. Original guarded sign-in 378-389 and navigation 599-601 introduce further document replacement. SPA routing details are unnecessary to establish the explicit replacement opportunities.
2. Candidate `addition.ts` 295-298 merely opens a transition. Destruction/clear 320-327 permanently marks an unexported document invalid and stops its channel. `finish()` 409-425 alone dispatches needles/freeze, skips dead documents, waits for every acknowledgement and requires every document ledger. Therefore successful installed observation of the unchanged replacements cannot close this candidate's all-document ledger; installation/event failures also stay UNKNOWN. No inaccessible initial blank/login/dashboard ledger is inferred empty and no surviving subset is accepted.
3. Browser freeze 241-245 awaits hashes, freezes, then asynchronously encrypts/emits its ledger; channel 68-103 performs asynchronous key derivation and AES-GCM. Navigation-start dispatch is neither final-call closure nor authenticated receipt before destruction. A late original eligible call or pending original read can cross a snapshot, and crypto/transport can lose the context. A new wait/barrier changes original navigation sequencing. Synchronous provisional recording alone does not supply durable authenticated export.
4. R1 proposal 143-163 expressly preserves synchronous original fetch/getReader/read promises/results/bytes/rejections and forbids observer waits, extra reads/consumers/clone/tee/replay/new fetch/substitution. It requires complete closed unique browser/public correspondence, explicit per-document encrypted acknowledgements, and UNKNOWN for destroyed unexported documents. No atomic departure boundary is specified. R2 170-180 only permits the exact existing owned page GUID at session-creation library `params.page.guid`; it supplies no lifecycle witness. Historical R2 validation 115-127 is preparation PASS with implementation proofs outstanding. The resolution does not erase or silently broaden that verdict.
5. Pinned SDK claims checked at the cited paths: asynchronous client/CDP sends and event microtasks; context destruction; root-session attribution/context trace filtering; context-attributed `newCDPSession`; runner top-level parameters and nested-object previews. These support only the narrow R2 preparation classification. They do not prove runtime privacy, error serialization, export ordering, cleanup or an alternative public mechanism. No extra ID exception follows.
6. Whole original source and both private before/after archives are byte/hash identical; identity inversion applied zero additions. This preserves every existing assertion, host `Response.finished()` then `text()` failure, capture failure, exact native Request observer, first-failure precedence, drain/navigation barrier, timeout/retries and receipt/title/PNG requirements. The historical 20-key/1,024B, 18-title/11-PNG counts are retained requirements, not newly recounted coverage. Six historical preservation checks report six PASS, zero fail/skip/cancel, exit 0; protocol/static/runtime counts remain zero. No new checks were executed.

### Bounded upstream verification, retrieved 2026-10-14; pass completed by 19:53 UTC

The official issue remains **open**, created September 16 and updated October 6 at 17:40:51 UTC, with `browser-chromium` and `v1.65` labels. Its final maintainer comment points to CL 8508456 as the expected fix. The earlier reproduction spans Playwright 1.62.1/Chromium 151.0.7922.34, 1.63.0/153.0.8010.12 and a 1.64-next/154 report; those reports do not establish this application's original-carrier EOF or cause. [Issue and final comment](https://github.com/microsoft/playwright/issues/42742#issuecomment-6021970682), [official issue API](https://api.github.com/repos/microsoft/playwright/issues/42742), [comments API](https://api.github.com/repos/microsoft/playwright/issues/42742/comments).

**Verified merged source fix:** CL **8508456**, `[Fetch] Don't report a completed fetch() body as cancelled`, merged to `main` October 6 at **21:44:48 UTC**, commit **`62473ad0f747e245e514c93e741bb8e168a2a207`**, commit position **1712735**. Its three-line production addition records `HandleResult(result)` before notifying the client through `OnStateChange()`. The official commit describes fully received no-store reader bodies reported as aborted with lost DevTools bodies, including terminal error handling. It adds unit and inspector-protocol tests. This is upstream implementation evidence; no local patched/runtime/application proof is claimed. [CL](https://chromium-review.googlesource.com/c/chromium/src/+/8508456), [official detail/commit API](https://chromium-review.googlesource.com/changes/8508456/detail?o=CURRENT_REVISION&o=CURRENT_COMMIT), [exact patch](https://chromium-review.googlesource.com/changes/8508456/revisions/62473ad0f747e245e514c93e741bb8e168a2a207/patch).

The old suggested CL **6716020** is still **NEW / work in progress**, updated August 28, 2025; it is not the landed remedy. [Old CL detail](https://chromium-review.googlesource.com/changes/6716020/detail).

Exact-version applicability was checked against official tagged `response_body_loader.cc`, rather than inferred from browser newness or numeric revision alone:

| Version/source checked | Terminal-state addition | Meaning |
| --- | --- | --- |
| [149.0.7827.55 tag](https://chromium.googlesource.com/chromium/src/+/refs/tags/149.0.7827.55/third_party/blink/renderer/platform/loader/fetch/response_body_loader.cc?format=TEXT) | Absent | Pinned native-probe version has the old ordering. |
| [155.0.8059.79 tag](https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.79/third_party/blink/renderer/platform/loader/fetch/response_body_loader.cc?format=TEXT) | Absent | Current CfT Stable does not contain this addition. An existing machine Chrome 155 is not proven repaired. |
| [156.0.8078.4 tag](https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.4/third_party/blink/renderer/platform/loader/fetch/response_body_loader.cc?format=TEXT) | Absent | Exact Chromium bundled by Playwright 1.64.1 is not a source-proven fix for this defect. |
| [158.0.8104.0 tag](https://chromium.googlesource.com/chromium/src/+/refs/tags/158.0.8104.0/third_party/blink/renderer/platform/loader/fetch/response_body_loader.cc?format=TEXT) | Present before client callback, lines 231-233 | Exact distributed Canary candidate contains the upstream production change. |

Official Chrome for Testing metadata timestamp **2026-10-14T11:19:22.894Z** lists Canary **158.0.8104.0**, revision **1717709**, including a Linux x64 Chrome download. Stable is 155.0.8059.79, Beta 156.0.8078.12, Dev 157.0.8081.0. Availability/source inclusion is verified; binary execution, compatibility and application acceptance are not. [Official CfT metadata](https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json).

Playwright **1.64.1** was published **2026-10-14T11:51:33Z** and marked latest at retrieval. Its two release fixes concern Electron first-window discovery and routed preflighted cross-origin redirects. Its official browser manifest pins Chromium/headless shell revision **1248**, version **156.0.8078.4**. Neither release notes nor checked browser source supplies this stream fix. No SDK upgrade recommendation follows. [Exact release](https://github.com/microsoft/playwright/releases/tag/v1.64.1), [release API](https://api.github.com/repos/microsoft/playwright/releases/tags/v1.64.1), [exact browser manifest](https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-core/browsers.json).

**SDK completion and Chromium body failure remain distinct.** In installed 1.61.1 `coreBundle.js` 58491-58492, public `finished()` races its private finished promise with target closure; failed request handling 60689-60694 does not resolve that promise, while successful finish 60705-60706 does. This explains a pending host completion after a failed terminal in this SDK without proving Chromium's cause or recovering its body. Resolving/ignoring that promise would not restore DevTools body delivery and would change retained failure authority. [Pinned public SDK client source](https://github.com/microsoft/playwright/blob/v1.61.1/packages/playwright-core/src/client/browserContext.ts), [network source](https://github.com/microsoft/playwright/blob/v1.61.1/packages/playwright-core/src/client/network.ts).

### Exact native-probe limit and next safe proposal

Directly inspected bound native-probe JSON: Node 22.23.3, Playwright 1.61.1, Chrome 149.0.7827.55. All four reader positives reach real EOF with complete 324-byte hash, server finish and no premature close; three have public/CDP failure, one finishes. Both host-text arms remain unresolved with browser reader unexercised. Abort/truncation both retain the full matching plaintext hash yet have reader error, no EOF, premature server close and public/CDP failure. Full bytes/hash cannot substitute for delivery. These are eight synthetic observations and zero app acceptance. The coordinator's seven verified ZIPs/CI/application counts are retained context, not newly audited archives in this review.

**Proposal only:** separately admit and independently validate one bounded paired native experiment using immutable existing probe source and unchanged SDK 1.61.1, baseline 149.0.7827.55 versus the exact official fixed-source CfT 158.0.8104.0. Hold request/cache/reader behavior and assertions constant; retain EOF/full bytes, server lifecycle, public/CDP terminal and host finished/body states, including genuine abort/truncation negatives and unresolved host-text labels. No original-reader observer or lifecycle workaround is needed for that comparison. It must establish actual native success and genuine-failure preservation before any separate original application experiment or runtime decision. Source inclusion alone is insufficient.

A browser change, download, new probe/harness, CI dispatch, or application execution remains outside this review's authorization. The coordinator must prepare the concrete proposal and shared-path admission first. Original application tests, security assertions, source/helper/SDK/configuration/kernel, no-store behavior, native host failure checks and all gates remain preserved. A native upstream repair experiment is distinct from the historical observation contract, whose instrumented corresponding original native failure must still persist. No contract waiver or silent target change is granted.

### Independently checked bindings

Paths are relative to the assigned checkout; `private/` means `.env.epic15.mail-runtime/original-reader-proof-70e6fef7-23c9-4c32-bf55-6b0c95ff6838/`; SDK paths below are beneath `node_modules/.pnpm/`. Complete byte/hash values were directly checked, not trusted from the manifest. These are input bindings, not executed tests.

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| Reviewed lifecycle resolution | 13,162 | `298be91b7e14f6bd94333faa95f57bf365c57eba726d62a15e1de47fc29f45a3` |
| `AGENTS.md` | 10,416 | `8787eb21af6cff5c05a2ef8e4222b1a6dbf2da47b36fcdbcac9845b11a404a0e` |
| Observation addendum, original/R1/R2 | 39,344 | `5a67ea550a4b1fc0f5e40f96aa8b10c35e1e8a33fbe23e57e3fbc1d36ffe3ff3` |
| Observation validation, original/R1/R2 | 23,169 | `b315f2b70d94d26ee2c79a3bb0085b1194168642620cf3dd9329e54f3ac18d66` |
| `tests/e2e/scheduling-views.atdd.e2e.spec.ts` | 57,501 | `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` |
| `tests/e2e/support/scheduling-views-atdd.ts` | 18,231 | `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082` |
| `private/addition.ts` | 46,266 | `0f53c8e0c61403bd6324be4d9b68e1924dbefc7b5872bcf7530e7262d7d1ac9f` |
| `private/manifest.json` | 5,819 | `9afbca3922cfc9d399ea2d3129060129dc37dd25e02793e9a38182f992217b59` |
| `private/preservation-receipt-first.json` | 1,459 | `cda31834f43f7fd7d477da0df97d164b633bc6f38c4e1060c577e4e1392b4a5d` |
| `playwright-core@1.61.1/node_modules/playwright-core/lib/coreBundle.js` | 3,352,341 | `6be5c2ea035554e9b184b1dbc7aa5e7f1fb428dd1b5c202022858dcfae9bee27` |
| `playwright-core@1.61.1/node_modules/playwright-core/package.json` | 876 | `759e376f995bf39edd4810d699b99469bab1d7428b6fbc78d41912f367df7ba9` |
| `playwright@1.61.1/node_modules/playwright/lib/index.js` | 34,528 | `033484bd04076585fa11954261323575a2f8ec12ca113f0c288dac67009fbf9f` |
| `playwright@1.61.1/node_modules/playwright/lib/worker/workerProcessEntry.js` | 75,892 | `e8b654850c073df3996816eb09edf845490d9a6e75785477a9ddb69d586cca54` |
| `private/source-before.ts`, `private/source-after.ts`, each | 57,501 | `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` |
| Native-probe JSON under `ci-native-stream-probe-38613188051/native-stream-probe/` | 10,345 | `a8efa8eedb67bdcadcb249e6df29bc36ef722d4180c2bb9d9009f10a442ea7a0` |
| `tests/diagnostics/no-store-stream-probe.mjs` | 25,358 | `f4b0d06fa6ad41f94767b54a882f1b77b7ae3098a2a952ea1ef9f2ccfbadb647` |

| Directly checked historical prefix | Bytes | SHA256 |
| --- | ---: | --- |
| Proposal original before R1 | 18,421 | `64c45d82f560ea2b6afef81784862555bcbaba2804b8cf192c7702ac590e266d` |
| Proposal original/R1 before R2 | 36,383 | `5d7ef4ea7a7e010476fff18fb549253f96fc95f6d9809bbd452f0821a58f7dcf` |
| Validation original before R1 | 11,159 | `23268e90ff9bdac3d20433b7c2814f3d655550e92167d5ba47cbe78cb0a54be4` |
| Validation original/R1 before R2 | 19,377 | `7dbae2b9ccdce5e5c2c55bd274c2bd14e4cc67baca5935a56ec20af074b51bd1` |

## Open questions

No demonstrated departure protocol closes the supplied all-document contract. Exact fixed-version native behavior, SDK/browser compatibility, original application EOF/full payload/redaction/unique correspondence, cancellation actor and all runtime privacy/cleanup remain unknown. The merged upstream fix narrows a plausible native exit path; it does not establish application causation or acceptance.

## Deferred work

Coordinator preparation and independent admission of the exact paired native proposal; any acquisition/execution and subsequent original-application verification remain separate. Candidate insertion, protocol/static proofs and source approval remain stopped. No automatic upgrade, browser swap, flags, filtering, retry, failure ignore, cloning, SDK patch, source/assertion change, or next CI dispatch is proposed as an authorized action.

## Blockers

Incomplete candidate has no authenticated final-call/export witness; retained original application/general-browser failures and incomplete acceptance remain. P5 false, review unverified, broad review 0/3, canonical kernel/original baseline `ddd188f63e7b84c59e8f921933140ca2a2613551` retained without re-review, all six story goals sequential, no Story 15.2, no test/coverage/runtime/release credit and no deployment. A verified distributed source fix is not a verified remedy for the pinned application run.
