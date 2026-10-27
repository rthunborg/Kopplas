# Story 15.1 original browser reader lifecycle resolution

## Outcome

**BLOCKED / REVISE mechanism readiness.** The retained candidate cannot establish the required complete all-document correspondence on the unchanged AC2 path. No admissible departure mechanism with the necessary ordering proof has been demonstrated. Do not insert or run the candidate, expand its protocol proofs, or treat historical R2 preparation PASS as source approval.

This is an independent Sol 6.1 High resolution of a concrete lifecycle/integrity conflict. It is not a broad BMAD review round, execution authorization, gate amendment, acceptance waiver, or an impossibility theorem about every conceivable public browser mechanism. R2's preparation verdict and every historical prefix remain intact; its outstanding implementation premises fail to establish a usable discriminator here.

## Files changed

Only this new resolution document. No existing document/source/helper/spec/kernel/app/configuration/dependency/Git/state/CI/resource/browser/test was changed or executed. Other agents' work and the incomplete private candidate are preserved. Assigned checkout/HEAD `437c3da22608973a396fbc0c090fc67a50429b64` are coordinator-supplied context, not newly audited Git evidence.

## Status

### Actual source, not an assumed failure race

- AC2 source line 336 calls unchanged `h.seed(); h.signIn("manager"); h.open("Resurser")`. Helper lines 75 and 86-88 call sign-in, clear cookies, navigate to `/login`, then click through to dashboard. Helper line 95 explicitly navigates from dashboard to `/scheduling`. Later original guarded sign-in again navigates to `/login` (source 378-389), reaches dashboard, and enters the original capture/navigation path (source 599-601). These are real document-replacement opportunities before finalization; SPA login routing need not itself destroy a context for the explicit `goto` replacements to establish the conflict.
- Candidate `addition.ts` 295-298 only opens a transition on navigation start. Its 320-327 destruction/clear handling permanently sets `invalid` for a document without a ledger; it neither exports nor freezes that document. Only `finish()` 409-425 sends needles/freeze and waits for acknowledgements, and it skips departed documents. Thus destruction of even the installed initial blank document without a ledger makes successful global closure unavailable. A surviving document cannot repair this state.
- Browser candidate 241-246 receives freeze through an asynchronous command queue, awaits hashing, sets `frozen`, then awaits encrypted ledger production before binding emission. Channel 68-103 uses asynchronous ECDH/HKDF/AES-GCM operations. Synchronous provisional capture establishes early recording, not durable export, final-call closure, or completion of pending crypto before replacement.
- The actual R1 contract requires explicit per-document encrypted freeze acknowledgements and rejects destroyed unexported documents (proposal 149), while forbidding original fetch/read/navigation from awaiting the observer. It specifies no departure trigger or atomic final-call/export boundary. R2 changes only one trace metadata classification; it cannot supply that lifecycle witness.

### Why a nonblocking departure dispatch is insufficient

A successful all-document proof needs both (a) the final eligible browser-call ledger, with no later unrecorded eligible call, and (b) authenticated receipt of that exact closed ledger before the document becomes inaccessible. Starting `Runtime.evaluate` or encryption at navigation start proves neither fact. The original document can still issue a fetch/read settlement after the snapshot, while the command, gate, hash or encryption can still be pending when its context is destroyed. Freezing early discards later side observations; omitting them would violate completeness, even though the original consumer still receives its exact promises.

A navigation event is not a supplied transaction that runs browser JS, completes WebCrypto, seals all subsequent original calls, and delivers an acknowledged ledger before commit. A `beforeunload`/`pagehide` listener or incremental encrypted snapshots would require an independently proven final-call/export witness too: snapshots alone do not close the tail, and an event callback does not establish that later handlers/microtasks cannot issue original calls or that its asynchronous transfer survives destruction. No such witness is established by these actual sources.

Waiting for freeze/crypto/export before an original `goto` or sign-in step would add a navigation barrier. Debugger suspension, extra consumers/requests, shared network IDs, SDK patches, plaintext private-key transfer, inferred empty departed ledgers, or accepting only the final surviving document would change an expressly retained constraint. None is an admissible repair under this resolution. Conservative UNKNOWN is correct behavior, but inevitable UNKNOWN is not a successful recovery discriminator.

### Pinned public SDK evidence and privacy limit

Actual installed `playwright-core/package.json` is version 1.61.1. In the bound `coreBundle.js`, public client `CDPSession.send` is asynchronous (56144-56146); CRSession sends return response promises (34574-34580), and incoming events are dispatched via a promise microtask (34598-34602). Chromium context destruction removes the context and forwards destruction to its frame (37191-37201; frame handling 23623-23629). These paths provide no observed pre-departure freeze barrier. This is source-path evidence, not a runtime event-order experiment or a claim that Chromium never permits an export to win a race.

The relevant trace findings remain narrowly bound: root CRSession/CDPSession attribution (34554-34556, 34626-34630, 38176-38189) and exact-context trace filtering (12369-12375) support exclusion of these CDP sends from context library actions. Runner parameters are top-level channel parameters (`playwright/lib/index.js` 87-108), with nested objects previewed as `Object` (`workerProcessEntry.js` 731-744, 774-791). Context-attributed public session creation (core 53120-53126) remains distinct, and before events retain `metadata.params` (24567-24580). Preserve R2's sole exception for the existing owned `params.page.guid`; no new transport, raw control ID, error path or trace exception is validated here.

### Smallest truthful next action

Keep source authoring stopped and have a fresh independent High reviewer validate this resolution. The missing prerequisite is a concrete public, private, bounded departure protocol proving the final-call boundary and authenticated all-document export without delaying original navigation/reader promises. Merely adding dispatch at navigation start is insufficient. No proven smaller admissible implementation action exists in the supplied mechanism; do not manufacture one to preserve a preparation PASS.

If a different diagnostic contract is proposed later, document its qualification and rationale explicitly in a new bounded proposal and obtain independent High validation before implementation. It must preserve full original payload observation, actual EOF, exact unique Request/capture correspondence, privacy, all original security assertions and every completion gate. This resolution proposes no surviving-subset or inferred-empty exception and authorizes no contract revision.

### Meaningful obligations for any future departure proposal

1. Exercise the actual extracted lifecycle/transport logic with destruction immediately after navigation start, before gate completion, during hashing/encryption, and before receipt authentication. Missing final export stays UNKNOWN; positive evidence cannot depend on a favorable timer or a model with an invented departure barrier.
2. Exercise a late original fetch after a proposed snapshot/freeze and a pending original read settling at the boundary. Demonstrate how every eligible start is either in the authenticated final ledger or invalidates qualification; unchanged receiver/call count/promise/result/byte/rejection identity and navigation sequencing must survive.
3. Cover initial blank, login, dashboard prefetch, manager replacement, scheduling and later guarded sign-in documents, transition/commit/context reordering, rapid replacement, missed installation/events, redirects/workers/frames, duplicate full keys, unmatched starts and all fixed caps. Neither zero public rows nor a current-document match proves an inaccessible earlier ledger empty.
4. Preserve strict full-tuple equality after authenticated transfer; reject replay/reorder/wrong context/key/attempt, invalid point/tag/padding/schema and oversized envelopes. Prove zero raw URL/query/email/header/body/application-ID sentinels in every new pinned trace/error/report/stdout boundary, retaining only R2's exact owned page-GUID exception.
5. Prove ownership-checked removal/restoration and the bounded stop fence with late bootstrap/gate/hash/read/binding callbacks, removal failure and foreign descriptors. No late activation/emission or successful cleanup inferred from fixture disposal.
6. Distinguish real original `done === true` plus complete bytes/fatal decode/both needles from equal full-length bytes without EOF or an error after plaintext. Retain original host `finished()`/`text()` and capture failures, security assertions, exact native Request observer, first-failure authority, 20-key/1,024B receipt, deadlines/retries, titles/PNGs and exact marked-addition inversion. A later controlled diagnostic must preserve the native failure on the corresponding carrier; green/masking/changed population or order remains UNKNOWN.

### Consulted immutable bindings

Paths are relative to the assigned checkout. `private/` below means `.env.epic15.mail-runtime/original-reader-proof-70e6fef7-23c9-4c32-bf55-6b0c95ff6838/`; SDK paths are under `node_modules/.pnpm/`. Full byte/hash bindings were checked directly, not inferred from the manifest.

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| `AGENTS.md` | 10,416 | `8787eb21af6cff5c05a2ef8e4222b1a6dbf2da47b36fcdbcac9845b11a404a0e` |
| Observation addendum (original + R1 + R2) | 39,344 | `5a67ea550a4b1fc0f5e40f96aa8b10c35e1e8a33fbe23e57e3fbc1d36ffe3ff3` |
| Observation validation (original + R1 + R2) | 23,169 | `b315f2b70d94d26ee2c79a3bb0085b1194168642620cf3dd9329e54f3ac18d66` |
| `tests/e2e/scheduling-views.atdd.e2e.spec.ts` | 57,501 | `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` |
| `tests/e2e/support/scheduling-views-atdd.ts` | 18,231 | `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082` |
| `private/addition.ts` | 46,266 | `0f53c8e0c61403bd6324be4d9b68e1924dbefc7b5872bcf7530e7262d7d1ac9f` |
| `private/manifest.json` | 5,819 | `9afbca3922cfc9d399ea2d3129060129dc37dd25e02793e9a38182f992217b59` |
| `private/preservation-receipt-first.json` | 1,459 | `cda31834f43f7fd7d477da0df97d164b633bc6f38c4e1060c577e4e1392b4a5d` |
| `playwright-core@1.61.1/node_modules/playwright-core/lib/coreBundle.js` | 3,352,341 | `6be5c2ea035554e9b184b1dbc7aa5e7f1fb428dd1b5c202022858dcfae9bee27` |
| `playwright-core@1.61.1/node_modules/playwright-core/package.json` | 876 | `759e376f995bf39edd4810d699b99469bab1d7428b6fbc78d41912f367df7ba9` |
| `playwright@1.61.1/node_modules/playwright/lib/index.js` | 34,528 | `033484bd04076585fa11954261323575a2f8ec12ca113f0c288dac67009fbf9f` |
| `playwright@1.61.1/node_modules/playwright/lib/worker/workerProcessEntry.js` | 75,892 | `e8b654850c073df3996816eb09edf845490d9a6e75785477a9ddb69d586cca54` |

## Open questions

The missing final-call/export ordering witness remains unresolved. Actual application EOF/full payload/redaction/correspondence, cancellation actor, runtime privacy and cleanup remain unknown. The original and R1/R2 validation scope did not establish those facts. This read-only inspection establishes the candidate conflict; it does not identify a cancellation cause or an upstream defect.

## Deferred work

Fresh independent focused review of this resolution; only then a separately admitted mechanism proposal or explicit contract-revision proposal, if justified. Source insertion, crypto/wrapper/lifecycle proofs, static checks, exact High source review and any controlled runtime remain deferred. No tests or protocol proofs were executed here. The retained manifest/first receipt report six executed source-preservation checks, six PASS, zero failure/skip/cancel, exit 0 and identity inversion; crypto/wrapper/lifecycle/static/runtime execution counts remain zero. This is preservation evidence only.

## Blockers

The candidate is incomplete, uninserted and not execution-ready; required all-document closure has no demonstrated admissible departure witness. Existing application/general-browser failure and incomplete acceptance remain substantive blockers. Preserve canonical kernel/original baseline `ddd188f63e7b84c59e8f921933140ca2a2613551` and blocked status without re-review. P5 remains false, review unverified, broad review 0/3, all six story goals sequential; no Story 15.2, synthetic/application acceptance, coverage or release credit.
