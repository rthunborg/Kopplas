# Story 15.1 acquisition observability — independent source/proof review

## Outcome

**FAIL for the exact acquisition-observability source/proof gate: one P2 deadline-publication defect.** The current source can publish the upload boolean after the reporter has timed out. The retained late-flag witness does not settle its deferred append and therefore misses this reachable path. Receipt freshness and nonzero acquisition failure remain intact, but the validated no-late-flag requirement is not satisfied. This verdict grants no runtime admission or application acceptance credit.

Fresh independent `gpt-6.1-sol` High reviewer for privacy, binary provenance and fail-closed evidence integrity; not the implementation author or contract validator. Read assigned checkout AGENTS.md and model-routing policy. Checkout/branch/commit are coordinator-supplied: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`, `codex/epic-15-scheduling-time-calendar`, `25390342e668dee81d6bda42bfe0b5b51ed1723b`. No Git or state action; no nested delegate. The review is limited to acquisition telemetry, its uploader and retained proofs.

## Files changed

Only this exclusively created reserved tracked verdict. Independent resource-free evidence was exclusively created in new private directory `.env.epic15.mail-runtime/acquisition-observability-review-9842c5ee-869d-4e23-9c83-8f1dcca0f739/`. Author proofs, prior private fixtures/receipts, source/spec/configuration, environment, helpers, state and other sessions remain untouched. No native HTTP/acquisition/download/install/Chromium-version/browser/server/DB/CI/managed launch, adoption, Git/state, push/PR/merge or deployment occurred.

## Status

### Bound inputs and preservation

Whole-file source and retained proof hashes were checked before evaluation; current source and all ten protected bindings were checked again after independent tests with zero mismatches. Author proof manifest: 5,851B/SHA256 `2b45aa8e5694803db3fd064d9e6285d6b05f1bfd6cbed6aa2780e78fb25821da`. Its eleven present receipt entries match; its absent lint text file is absent. The complete private file inventory was hashed before evaluation. Root state is expressly excluded.

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| Probe source | 63,669 | `6dac3193961859e47f0912806d3cf6b50744ff572bd673b8a1a29718f14c7107` |
| Workflow | 34,628 | `58c62d60f171a1d261f7fa9810127b79425c8ba733014dcfd727091423445932` |
| Current observability addendum | 11,734 | `dc98d39febdbfdc390c908c4893db32c030929e5a8b532e01a865633cfdd0986` |
| Original addendum prefix | 5,429 | `f0ecf5183de2ee1b24b5eeade56c5a660e825f6599e15c28ee703bf5fb2aabfa` |
| Independent contract validation | 9,039 | `5b3cbf730860e5e1580cd7ad7ee145830af2ebb6cc53295db4e56e398d44c3d1` |
| Diagnosis | 10,245 | `991b140b5522f25a999c115ea7be592c32f89cc3d1d244921e406cff8804fd8c` |
| Unchanged checkout CI unit | 2,511 | `313f11c18c66d8bb242e66cb27c314b9fbe3eca94573a4276ce28c308beb5b28` |

The executable in-memory inverses recover the complete admitted probe 56,441B/`d0a380500ad19a6ddd509d80e4481f27c5dfc2b60ca4ad7bd8be799ec98600fc` and workflow 34,149B/`0e00adb8ee60d0f9b3d2605d5213c5c0eee26ace0d2a8ec662cfaaeaeca3b5c1`. Default marker inverse recovers SHA256 `f4b0d06fa6ad41f94767b54a882f1b77b7ae3098a2a952ea1ef9f2ccfbadb647`. Twenty-seven default/paired functions and the paired non-acquisition branch/entry compare byte-identically. Complete workflow inversion removes only the new uploader, preserving all six prior jobs, inputs, commands, paired uploader, seven checkouts, DAG, permissions, SDK/pins and step budgets. The optional job remains 18 minutes, with summed step maxima 17 minutes.

The ten protected bindings are checkout unit, original app spec/helper, package/lock/default Playwright config, contract validation, diagnosis, native audit and paired addendum. Original app spec remains 57,501B/`9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065`. This is bounded protection, not a whole-project/history audit.

### Finding — P2: an in-flight flag append can publish after the reporter deadline

Caller: the existing acquisition CLI `acquisitionMain()` calls `publishAcquisitionReceipt()` using trusted runner filesystem/output paths. After a complete fresh exclusive receipt write, probe line 537 starts asynchronous `appendFile(GITHUB_OUTPUT, 'acquisition_receipt_written=true\n', { signal })`. Lines 539–540 race the operation against two seconds and abort on return. The post-append fence checks completion after the side effect; it cannot prevent or retract an already submitted write that settles later.

Reachable sequence: acquisition fails at metadata timeout; the static failed receipt completes exclusively; the flag append begins; the reporter's two-second timer fires before append completion; CLI emits the original generic unavailable stderr and exits nonzero; the pending append later finishes and publishes the true boolean. Workflow line 703 accepts that boolean under `always() && !cancelled()`, including failed acquisition. The fresh complete receipt and original failure remain valid, but the uploader becomes eligible through flag publication after the reporter has closed. This violates the validated requirement that late settlement cannot emit a flag. The same timing window exists after successful acquisition.

The retained author `flagFailure:'late'` witness asserts absence immediately after `run()` returns but never invokes its deferred settlement. The public-write late witness does settle deferred work. A fresh supplemental actual-source CLI witness uses the existing late flag mock, asserts the receipt is fresh/failed and CLI remains exit 1, then settles the pending append. Its no-late-flag assertion fails. This is not an arbitrary error-text inference or a detached reporter implementation.

A read-only inspection of the local Node filesystem implementation confirms native plausibility: `appendFile()` delegates to `writeFile()`, whose short-buffer `writeFileHandle()` checks AbortSignal before submitting its awaited filesystem write. The signal does not cancel that in-flight single write. The supplemental delayed-side-effect witness models that window; no actual filesystem output append or native acquisition was executed. The finding does not claim a stale/partial receipt, green acquisition, paired execution or application defect.

Required follow-up is acquisition-source repair plus a meaningful late flag settlement witness before repeating this bounded source/proof gate. The source author must preserve the current freshness, privacy, generic console, nonzero failure and operation/pin invariants while ensuring the fixed upload boolean cannot appear after the reporting deadline. A contract change would require separately authorized preparation/independent validation; this review does not authorize one.

### Other reviewed boundaries and proof authority

The receipt uses eight closed scalar fields, exact pinned targets, legal status/stage/reason combinations and an enforced 1,024B ceiling. Trusted per-operation callbacks retain attempted/current stage and first reason; arbitrary native/spoofed errors stay unknown. Failure freezes before reporting and later callbacks cannot change it. Raw errors, runner paths, environment, URLs, headers, bodies and IDs do not enter the public receipt. The qualified binary receipt and original `executable=<path>\n` handoff remain private and unchanged.

The static reporter checks repository containment, existing/made directory identity and symlinks, then uses `wx` for a fresh write. Collision/partial/write failures emit no flag; successful acquisition followed by reporting failure remains nonzero with generic unavailable stderr. The new pre-root/absent-directory witness confirms an invocation failure can create its fresh failed receipt without acquisition/temp-root creation. Original acquisition ordering, metadata/header/archive/ZIP/version predicates and timers remain unchanged. The new uploader has the intended one-file/fresh-boolean guard and seven-day retention; the prior paired uploader's missing-report failure remains intact. No other concrete reachable source defect was identified in this bounded review.

The retained author final TAP has 63 pass/0 fail/0 skipped/0 cancelled, exit 0: 60 actual-source CLI VM evaluations plus three preservation witnesses. Focused CI unit has four pass/0 fail/skip/cancel, exit 0; syntax/lint exit 0; changed-source lint emitted no output. Its unit run has an existing module-format runtime warning, not a lint warning. Retained initial harness syntax failure, fake-clock placement failure and manifest collector failure agree with the author's history; no old receipt was overwritten or rehabilitated.

The harness checks acquisition argv/production entry markers before evaluating the unchanged real module. Every imported acquisition network/fs/process/time/output surface is mocked in memory, and SDK/dynamic-import/server routes are denied. Synthetic ZIP/hash/version fixtures test validators/control flow, not native binary provenance. No default browser or paired runtime path is reached.

Independent identical-harness rerun: **63 pass/0 fail/skip/cancel, exit 0; 60 actual-source CLI evaluations plus three preservation witnesses**. Supplemental full run adds the absent-directory and late-flag checks: **65 executed, 64 pass/1 fail/0 skip/cancel, exit 1; 62 actual-source CLI evaluations plus three preservation witnesses**. The sole failure is the P2 late-flag assertion above. Across these two independent runs: 122 mocked actual-source CLI evaluations and six preservation test executions; zero native acquisitions or live actions.

| Fresh independent evidence | Bytes | SHA256 |
| --- | ---: | --- |
| Identical copied proof harness | 27,026 | `1ae3a72675b98b8d972ee869759d97c2f7902ae3a4837c5e9e17d375bef46ee7` |
| Independent rerun TAP | 16,799 | `46e036e1fb1da025d3c466a9ad2bc109f1292de091b3e03a74d187733acb6655` |
| Supplemental actual-source harness | 28,657 | `f79e6625ee989943f8f8f073e330ad25331674a9e7d4d39b51535493cb09b985` |
| Supplemental TAP | 18,047 | `e28d0cdac717dca8353e218253474277ca60cc55232ebb9e5d9e08ccb227546b` |
| Read-only native append semantics | 2,365 | `82093a23af198b0c148332e1335e2cb9f8f6037e917af61cc2236ff4f99e2514` |

The independent rerun exit receipt is one byte `0`/SHA256 `5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9`; supplemental exit receipt is one byte `1`/`6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b`. Reviewer native HTTP/acquisition/download/install/Chromium-version/browser/server/DB/CI/resource/Git/state/deployment actions: **0**.

## Open questions

The original Ubuntu acquisition failure cause remains UNKNOWN; later metadata GET/ZIP HEAD cannot explain it. Original application EOF/consumer identity/cancel actor remains unknown. This source review does not investigate those causes.

## Deferred work

Root-coordinated source repair and a fresh focused review of the late-flag path remain required. Any runtime must be separately admitted after the bounded source/proof gate passes. Original observer insertion, application remedy, Story 15.2, broad story review, acceptance/RLS/visual/completion/release decisions remain outside this review.

## Blockers

Current acquisition-observability source/proof gate is blocked by the P2 late-flag finding. Earlier run `38634351750` at `4b685196313d887a9e9bdb339fccb69fefc328f9` failed acquisition, skipped the paired command and produced zero paired cases or qualified binary receipt. General AC2 failed both attempts; ten later scheduling tests and six phone targets remain unexecuted. P5=false, broad review 0/3; no fourth/extra broad review or acceptance/RLS/visual/15.2/completion/release credit.

## Focused independent receiver-fenced source/proof follow-up — 2026-10-15

### Outcome

**PASS for the exact corrected acquisition-observability source/proof gate. The retained P2 is cleared under the separately prepared and independently validated amendment.** No new concrete consequential defect was identified in the worker/supervisor/publisher mechanism or its changed workflow authority. The original FAIL and failed late-flag witness remain valid history, preserved in full; this append does not claim that asynchronous writes can be cancelled or that the original contract was silently satisfied.

This is the same independent Sol 6.1 High source reviewer, focused on the P2 and regressions in the validated replacement mechanism. Coordinator-supplied current commit is `b01a0511cd1ee66f710de21034faeae9d5537403` in the original assigned checkout/branch; no Git/state inspection or action. AGENTS/model routing remain applicable. No nested delegation or broad story review occurred. PASS is exact source/proof clearance only; root separately owns any runtime admission.

### Files changed

Only an append to this reserved tracked review document. Its complete original 11,830B/SHA256 `d18b50a7e1cbf70291f0daba13cbdaa6242b299dea8a53c10bc569397472bd75` prefix is preserved, including the original FAIL/P2. Independent evidence was exclusively created in new private directory `.env.epic15.mail-runtime/receiver-fenced-review-49229d96-08a5-4ae9-ab7d-82a8776df88d/`; author proof files, manifests, fixtures and all older proof history remain untouched. No source/spec/validation/configuration/helper/environment/root-state or other-checkout edit occurred.

### Status

**Bindings before evaluation.** Exact current source, workflow, contract/validation and original review were hashed first. All 61 evidence entries in the author's 16,577B manifest `36efb8e7de152f7db4d5d5141f3b07c3f2c2d16dee1db34bcefea3077fca46d0` match their bytes/SHA256, including both complete inverses and failed/final receipts. The 5,894B preservation receipt matches `8cd85db064012d8d7d9e946e64973e2ec6c4c8933305e807a3b6946475be7ed1`. All ten protected bindings match before this admitted append. Rechecking author evidence and protected bindings before append gives zero mismatches; root state remains excluded. After append, the reserved review is protected by its original prefix, with the other nine bindings unchanged.

| Exact corrected input | Bytes | SHA256 |
| --- | ---: | --- |
| Probe | 74,792 | `95c967788cff764f1d546ec1a0b1bdd77cc116a57c714774447b266ef870a5f9` |
| Workflow | 35,082 | `25c9f3672f4538a95d5fb573421739ae14be757d0a2b72fc39e756dfcae1d304` |
| Current amended addendum | 38,524 | `a378c28cd92ee7989d47c9bcd8f00517a9e266def7317342742ebc502395b960` |
| Current independent validation | 32,860 | `a83a3aca46f5467e10f413b354b869be66cd0e8d78e71171e0bb4f464fbfcef6` |
| Unchanged checkout unit | 2,511 | `313f11c18c66d8bb242e66cb27c314b9fbe3eca94573a4276ce28c308beb5b28` |

The addendum's complete prepared 31,439B prefix remains `b7b5dfe8bedbd4bfcd6041be0ffe0dd8017e3e34e1a670c2bd2e241eb6d96703`. Validation retains the 21,455B REVISE/A1 prefix `7f05d05272f1eef3dcab15e811fadc902b09bd63d9df5382d8426ee8acbd40a1` and original 9,039B prefix `5b3cbf730860e5e1580cd7ad7ee145830af2ebb6cc53295db4e56e398d44c3d1`. Its latest focused PASS explicitly accepts the new runner-terminal authority and bounded post-commit exception.

**P2 closure and source authority.** The worker freezes the unchanged eight-field <=1,024B public receipt and creates it exclusively under a two-second preparation window, then writes a distinct provisional `worker.json`. It never writes the eligibility flag. Internal 0/71 is selected only after timely preparation acknowledgement/fences; unavailable preparation remains 1 after deferred receipt/provisional writes actually settle. The supervisor spawns exactly one worker from the same module/Node executable, ignores its streams, confirms actual permitted native close without a signal, and checks exact public bytes/hash plus provisional generation/status. Worker-only or older certificate data is never accepted by the publisher.

Probe lines 671–675 establish non-renewable `D = min(S + 180 seconds, H + 2 seconds)`, re-arm the shortened window, append the private locator, and require its acknowledgement plus an open strict-before-D fence. Only after that fence is the final schemaVersion-2 committed certificate serialized and exclusively written at line 683. A late locator settling after pre-commit closure cannot produce a final certificate. Publisher lines 703–714 independently validate final schema, generation, boot epoch, canonical unsigned-64-bit nanosecond values/order, recomputed D, current clock and exact public receipt/hash/worker-status pair. Expired or incomparable authority fails closed.

Publisher line 715 fences the boolean acknowledgement under the earlier of its own two-second window and D. Native physical bytes can settle after publisher failure; workflow line 711 additionally requires `steps.receipt_publish.conclusion == 'success'` AND the fixed true output. The actually settled deferred-flag witness retains physical true bytes while native publisher exit remains 1 and the real uploader expression rejects its failed conclusion. That additional runner-terminal authority addresses the retained P2 under the explicitly changed contract.

The narrow accepted post-commit exception is also implemented: once locator acknowledgement is timely and commitment selected, a later final-carrier delivery error/closure does not erase that selected capability before D. A fresh final carrier delivered after early supervisor failure can qualify only while the existing cutoff is still open. Supervisor generic unavailable/exit 1 and pairing skip remain authoritative. No capability can form or be newly accepted at/after D. A timely successful publisher authorization can later be consumed by the existing uploader without renewing the clock window.

**Focused witnesses.** Independent unmodified-harness rerun: **115 executed/pass, zero fail/skip/cancel, exit 0** (58 worker tests, 52 supervisor/publisher protocol tests, five preservation tests). Every production action import is replaced before source evaluation; SDK/dynamic-import/server/network/native version routes are denied. Worker tests exercise the actual worker CLI; protocol tests exercise the actual supervisor/publisher CLI with mocked child termination and in-memory receipts/outputs. Deferred public receipt, provisional certificate, locator, final certificate, public-read and eligibility append effects are actually settled after failure. Synthetic fixtures do not establish any native binary/clock behavior.

Eight supplemental focused cases pass in the final **60/60 protocol run**, zero fail/skip/cancel, exit 0. They verify ready AND worker-71 committed delivery strictly before D with rejection at equality/after D; locator acknowledgement exactly at H+2s creates no final authority; supervisor S+180s wins when the handoff window would be later; publisher own two-second equality fails while D remains open; a real in-memory exclusive final-file collision retains the prior bytes; generation-directory refusal prevents worker spawn; and publisher flag acknowledgement exactly at D fails even though its own deadline remains open. Physical true bytes in both equality cases do not satisfy runner-success eligibility.

The retained author's test named final collision exercises generic write rejection; this review supplements it with an actual mock filesystem EEXIST-style collision while asserting the production `wx` option, retained prior bytes and publisher rejection. This strengthens its evidence without changing author tests or identifying a source defect. The earlier 57/57 supplemental run is also retained. No failed receipt was overwritten or rerun in place.

Retained intermediate failures were read against their fixture code/repairs: 58 worker tests/56 pass/2 fail from fault injection persisting into preparation; a combined fixture source-path load failure; 97 tests/93 pass/4 fail when mocked successful worker close omitted its executable output; and a later BigInt test-name registration failure. The final fixture corrections preserve the consequential assertions and original acquisition predicates. The final author suite is 115/115; focused CI unit is 4/4 with zero fail/skip/cancel; syntax/lint/preservation native exit receipts are 0. This review reruns only safely copied resource-free suites and never invokes author collectors/edit/inverse builders.

**Clocks.** Read-only primary documentation/source lookup confirms the static route: Node's nanosecond BigInt API and `HrtimeBigIntImpl` call uv_hrtime; bundled Unix core requests UV_CLOCK_PRECISE; bundled Linux code uses CLOCK_MONOTONIC for that precise clock. Cross-process same-host origin is an inference from those implementation sources. The source gates Linux/Node22/libuv1, private boot identity and zero time-namespace offsets, and rejects regression, unknown/mismatched epochs, invalid ranges/order and expiry; there is no wall-clock/per-process-origin fallback. This is static evidence plus mocked clock checks, not Linux native verification or a Windows clock claim. [Node API](https://nodejs.org/docs/latest-v22.x/api/process.html#processhrtimebigint), [Node implementation](https://github.com/nodejs/node/blob/v22.22.0/src/node_process_methods.cc), [bundled core](https://raw.githubusercontent.com/nodejs/node/v22.22.0/deps/uv/src/unix/core.c), [bundled Linux clock](https://raw.githubusercontent.com/nodejs/node/v22.22.0/deps/uv/src/unix/linux.c).

**Preservation.** The independently applied complete inverse recovers the admitted 63,669B probe/`6dac3193961859e47f0912806d3cf6b50744ff572bd673b8a1a29718f14c7107` and 34,628B workflow/`58c62d60f171a1d261f7fa9810127b79425c8ba733014dcfd727091423445932`. Final inverse is 23,009B/`576f00732b96140f102964b46652359ad845f7ab0af38eb8a70c14d87c05cff3`; the prior intermediate inverse remains separately bound. Twenty-seven original/default/paired functions, actual acquisition predicates/order, public receipt/failure freezing, paired non-acquisition runner/R1/body/sidecars and executable handoff bytes remain identical. Default marker inverse recovers exact 25,358B/`f4b0d06fa6ad41f94767b54a882f1b77b7ae3098a2a952ea1ef9f2ccfbadb647`.

All six prior job blocks/input prefix are byte-identical; seven checkouts and paired commands/uploader/missing-report failure remain unchanged. Only the validated optional-job supervisor routing, one-minute publisher and acquisition uploader guard changed. Job ceiling stays 18 minutes and summed step ceilings are 18; no scheduling reserve or guaranteed evidence availability is claimed. There is no new job/input/dependency/cache/configuration/migration/default browser/fallback/downgrade. This is a bounded ten-binding review, not an exhaustive project/private-history scan.

| Fresh independent proof | Bytes | SHA256 |
| --- | ---: | --- |
| Independent rerun TAP | 27,476 | `aeafe78caa3632dd5d2933d5ce07001f0e1180ef283299379881f994120562fa` |
| Final supplemental protocol harness | 17,474 | `e5b6b21dfc47e1516315ed33e7a87e408c1db694c0b1f9ee57113da0e8c42c0f` |
| Final supplemental TAP | 12,542 | `7679f60e0546aa4419e84842503def81649e1dd475f68a209a4a3800e67c68d9` |
| Independent review manifest | 4,364 | `3a2ccdbd5a6690c8eefb210b86a8a0ef50aa2a9a34029868f90d858db69153b6` |

All independent test exit receipts are one-byte `0`/SHA256 `5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9`. Reviewer native acquisition-endpoint HTTP/acquisition/download/install/Chromium-version/browser/server/DB/CI/managed-resource/Git/state/PR/push/merge/deployment actions: **0**. Read-only primary clock documentation lookup occurred as permitted; no native clock/acquisition claim follows.

### Open questions

Original acquisition cause, application EOF/consumer identity and cancel actor remain UNKNOWN. No native compatibility/timing/success is inferred from this exact-source PASS.

### Deferred work

Root owns any separately admitted execution after reading this focused result. Original observer insertion/application remedy, broad story review, acceptance/RLS/visual/completion/release decisions and Story 15.2 remain outside scope. Source clearance neither dispatches a run nor authorizes source/spec changes elsewhere.

### Blockers

The retained acquisition-observability P2 source/proof blocker is cleared for these exact hashes under the validated amended contract. Original runtime/application blockers remain: run `38634351750` failed acquisition and skipped pairing, zero paired native cases/qualified binary receipt; General AC2 failed twice; ten later scheduling tests and six phone targets remain unexecuted. P5=false, broad review 0/3; no fourth/extra broad review or acceptance/RLS/visual/15.2/completion/release credit.
