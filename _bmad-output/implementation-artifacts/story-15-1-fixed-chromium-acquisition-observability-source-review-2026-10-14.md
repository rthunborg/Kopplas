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
