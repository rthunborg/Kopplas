# Story 15.1 application-browser capability — independent native audit

## Outcome

**Capability run FAILED after successful native compilation/session preparation. No capability receipt exists; the narrower cause and owned-process guarantees remain UNOBSERVED. Required General E2E also FAILED.**

[Run 38720110409](https://github.com/rthunborg/Kopplas/actions/runs/38720110409), attempt 1, exact executed HEAD `d5a5f85155394a0337ea92fcd606f949559b172a`, workflow `296219797`, branch `codex/epic-15-scheduling-time-calendar`, actor `rthunborg`, event workflow_dispatch. Accepted dispatch is bound to one POST, native transport exit 0 / HTTP 200 at `2026-10-15T10:25:02.286118Z`; run created `10:25:04Z`, terminal failure updated `10:47:03Z`. Input application verification=true, paired=false, original native=false; admitted repository mode was capability with the exact execution SHA.

Independent actual Sol 6.1 High auditor for privileged ownership/cleanup evidence, authenticated/RLS boundaries and response security. Audit began after coordinator confirmed terminal execution, variable restoration and freeze release. This is a native evidence audit, not another broad story review. Auditor native/browser/compiler/bootstrap/DB/CI/variable/resource/deployment actions: **0**. All checks below are bounded reads/hashes of preserved evidence and source interfaces; no tests or mocks were rerun.

## Files changed

Only this new artifact. The prior paired-native audit remains **46,431B / SHA256 `3037aa84db6a519a495f2e523ce114af7a87e425596b8a494db94ffcf0fb0777`**. Sources, spec, old artifacts, private corpus, root state and other checkouts remain untouched by this auditor. No fresh private proof files were needed.

## Status

### Sealed transport and exact source

First independently verified execution manifest **88,191B / `d72353a195cc3c3eaa6a998dec1f33dd9d8ca979dde5fa11950f83a322f3cf76`**, then every listed byte binding: **359 execution files + 34 external Phase A/list files, zero length/hash mismatches**. External paths resolve against the assigned checkout; execution paths resolve against the sealed directory `.env.epic15.mail-runtime/root-capability-execution-8af8acfc-aebf-4107-a2e1-05f66d38883b/`.

All **six original artifact ZIPs** independently match terminal API SHA256, size and exact run/HEAD; in-memory entry hashing matches **44 extracted artifact entries, zero mismatches**. Terminal API contains exactly the ordinary General/Dashboard/integration/recovery artifacts, **zero capability or fixed-application artifact**. Whole native log ZIP is **873,860B / `15e548e0e4714550078333a998f08c42a8522a8e1550aac3c8d2c4c52a4e7d15`**; all **113 extracted log entries** independently match. Original failed ANSI-guard transport captures remain history; successful corrected capture metadata records native exit 0. Raw logs, environment values, private paths, generated identities and unrelated variable bodies are not reproduced here.

The exact capability log is **30,510B / `8d332753c1fa40840a5a36a8f3460bc4618e31368e7c2891c5a006f6a4a2f94a`**. General JSON is **2,238,597B / `725fd403f4ba67465b0a68c27d2617214a9f7d05fab306058345ebdaa9c4abe1`**. Manifest, API and original ZIP checks bind the contents rather than relying on a green job summary.

All **11 source-execution working bindings** match current files. The four implementation paths are raw Git/work byte-identical in the saved exact-head binding:

| Source | Bytes | SHA256 |
| --- | ---: | --- |
| application runner | 33,989 | `0e1f9df21c4dc710a218661f6668166316418e26a5d9641a78b908991cced4a0` |
| owned-process C broker | 15,857 | `ea2abfa6638bf148854e5aba080edc9241e26b1b3594cec3d5b10be2006fae68` |
| admission unit | 44,760 | `152d9d77f867ca0d28aab200b16752dd60fcb964482f9aa1d8bb0eb6cadf52e6` |
| CI workflow | 48,743 | `9c933a75fd38b6a4ea885dd52c94e4c072df037f5bc04251a1063d99e181f77d` |

Package/lock/nvm raw Windows bytes differ from Git only by independently verified CRLF→LF normalization. The spec also has that qualified normalization: working **84,649B / `d5a492a1546c19d777d8bff3d7037686e60a577565cac67281bff764f427bc22`**, Git-normalized **84,648B / `6cd7c03108abb89a32e3785832c0b432fe7bd5dc1235af8b23113c85d4abc305`**. These are separate identities, not raw equality. Application test remains **57,501B / `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065`**, helper **18,231B / `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082`**. The bound source review retains the 13 harness assertions; capability failure supplies no execution credit for them.

Source review **38,352B / `8210eb8883502141dd0afa05475643f4ef894a92565f5ef225612312ba74daa9`** retains both preceding FAIL histories and records focused source/mock PASS. Addendum is **120,879B / `dcfa0e2f341cbcf977860489647aaa7393e97842b145e99016e1be1f9388afbf`**; validation **87,941B / `e9cf00558944a2070232ed4299676bd4d54827aa4e3394f52d922353a9bab977`**. Its 95+2 passing mocked controls do not prove native broker/kernel/cleanup behavior. Coordinator's bookkeeping-only rebind from reviewed source to the execution SHA is consistent with the exact four source bindings; this auditor performed no Git operation.

### Actual first failure and execution boundary

Capability job `116380672399` has **25 listed steps: 10 success, 2 failure, 13 skipped**. Relevant original runner results:

| Step | Actual outcome / UTC |
| --- | --- |
| exact hosted mode/source gate, package setup/install | success |
| Playwright install, Supabase CLI/start/reset, CfT acquisition/publisher | all skipped in capability mode |
| compile private broker and prepare hosted session | **success, 10:46:43–10:46:56** |
| capability capsule command | **failure, 10:46:56–10:46:58**, native exit 1 |
| preserve capability receipt | **failure**, missing file |
| isolated fixed application, native JSON/report/provenance uploads, acquisition upload, Supabase stop | all skipped |

Successful preparation binds the executed workflow's mandatory shell operations: exact Node version check, availability of `/usr/bin/clang-18` and `/usr/bin/systemd-run`, native C compile with C11/GNU/Linux headers and warnings-as-errors, copied private workload/home/control tree, fresh system account/group, root-written session, ownership/mode setup and exported handoff. It is positive evidence of **native compilation and bootstrap/session preparation**. Compiler/linker/package version details and binary digest were redirected into private control files that are not uploaded; no independently retained compiler version/broker-binary digest is invented. Compile success establishes usable headers/compiler for this source, not runtime kernel/delegation/credential support.

The first failed execution step is the host runner's `--capability-capsule` invocation. Its only native diagnostic is **`fixed-chromium-application unavailable`** at `10:46:56.7239381Z`; runner reports exit 1 at `10:46:58.7348023Z`. The actual entry catches capability errors into the fixed admission failure, so that outward classification does **not** distinguish host preflight, provider startup/readiness, capsule result validation, ownership finish or receipt writing. No specific compiler error, systemd/provider error or broker protocol stage is retained in this capsule log segment. The observed missing receipt is an actual negative; the missing internal stage is unknown. Neither generic output nor the approximately two-second duration identifies the cause.

**Observed:** one host capability-entry invocation, successful native bootstrap, generic capability refusal, missing receipt, failed receipt upload. **Unobserved:** whether a systemd C-broker service actually started/was ready, whether the owned capsule/descendant was born, exact credential/capability dropping, direct retained same-leaf populated=0, leader reaping, independent owner survival, cleanup confirmation or resource residue. These are not proven absent and not inferred from the reviewed source/mock protocols. A completed GitHub job is not a host-shutdown certificate.

Capability job measured capsule proof rows: **0 available**. Its actual owned-capsule execution count is unknown without the missing protocol evidence. Fixed-browser compatibility launches, fixed application invocations/cases, optional-job acquisition and optional-job DB execution are **0**, with their workflow steps skipped. Paired/original native jobs were also skipped. No new browser provenance, EOF/body/control or application result is available from this job.

### Required jobs and original General evidence

| Job / native ID | Terminal outcome | Actual test evidence |
| --- | --- | --- |
| verify / `116372299061` | success | 2,631 Node tests passed, 100 suites, 0 fail/skip/cancel/todo; Python groups 2, 26 and 10 executed. |
| Dashboard / `116373231377` | success | 57 distinct tests / 57 passed attempts, retry 0 throughout; no skipped/unexpected/flaky. |
| db / `116373231405` | success | 1,736 pass / 1 skip / 0 fail; 144 passed files + 1 skipped file, 1,737 assertions. |
| isolated recovery / `116373231438` | success | Physical Storage proof 1 executed/pass, 0 skip/fail. |
| General / `116373231610` | **failure** | 382 distinct cases: 368 expected / 13 skipped / 1 unexpected, 0 flaky. 400 reporter entries = 375 passed + 2 failed executed attempts + 23 skipped entries. |
| capability / `116380672399` | **failure** | Bootstrap succeeded; capability evidence unavailable. |
| paired / `116380674599`; original native / `116380674721` | skipped | No native observations. |

DB evidence separately retains **8 actual local-DB/JWT reassignment cases + 4 authenticated reader/RLS cases**, and **21 transport mocks with no RLS credit**. Main integration explicitly skips the physical Storage assertion; recovery separately executes it. Vitest's 463 suite aggregate is distinct from file/assertion counts. DB/pilot command elapsed **343.67s / 420s budget**, not a calendar p95 certificate.

Scheduling: **18 titles, 7 pass / 1 fail / 10 skipped**. Serial replay yields 14 passed + 2 failed executed attempts and 20 skipped entries; seven earlier passes are not fourteen distinct behaviors. The projection test supplies **10 desktop PNG attachments / five distinct target names**. Six phone target images and both AC8 tests are **unexecuted/missing**. No screenshot similarity, manual accessibility, daylight/one-hand or complete visual-flow acceptance is inferred.

Both latest AC2 attempts independently fail with `'net::ERR_ABORTED'`. Each preserves its original **20-key** native receipt: request/capture **1/1**, HTTP 200 RSC, trigger requestfailed, phase finished, finishedEnd/bodyStart/bodyEnd null; captures 1 / fulfilled 0 / rejected 0 / pending 1. The original same-object `Response.finished()` is pending at each freeze and its `Response.text()` is uninvoked. Final complete-payload/withheld-data/denied-role assertions are not reached.

Each attempt also has one prefetch RSC/no-store passive candidate, public ordinal 1 / match count 1, public failure observed, **324 received decoded bytes**. In **both** current attempts CDP terminal is **pending**, terminalMs/finishedEncodedBytes null, canceled unknown and errorClass unavailable; no main-frame navigation follows response. Setup ready, overflow/invalid false, cleanup requested remain explicit. Neither attempt has observed canceled=true in its frozen CDP row. The candidate matches, prefetch flag and bytes do not prove application browser-reader identity/hash/EOF, canceling actor or a causal relationship to the capability failure. Earlier runs' CDP failures/ordinals are not borrowed.

Unchanged native finished/text/body obligations and 13 harness assertions remain binding. The capability-only job neither executes them nor substitutes synthetic bodies. Prior paired reader remedy remains historical synthetic evidence; its four native-text unknowns remain unknown, and it supplies no new application security or completion credit.

### Repository-variable restoration

Restoration manifest **4,966B / `607cf2e022de18a1f372248a75694043d240a1f3f9f519b117d46e3b7fc7bd1b`** independently verifies **28/28 files, zero mismatches**. Prior complete LIST was HTTP 200, total/returned 8/8 with both exact admission names absent. Both creates are HTTP 201. Subsequent owned checks preserve the desired name/value and exact created_at/updated_at identities. After terminal failure, each owned variable alone was deleted with HTTP 204; individual GETs return expected 404, and final complete LIST returns HTTP 200 / 8 of 8 with both absent.

Independent canonical comparison of all eight prior/final variable objects confirms **every prior body unchanged**, agreeing with the sealed equality receipt. Values and unrelated names remain private. Restoration is repository-variable evidence, not native process cleanup. Execution was already terminal before the recorded deadline; no cancellation was needed or performed in this audit. Source/ref/no-PR/freeze evidence and coordinator's related-session holds are qualified coordination facts, not absolute repository exclusivity.

## Open questions

The capability command's precise failure boundary/reason is not retained. Broker/service/capsule startup, privilege enforcement, cleanup/reaping, same-leaf emptiness and independent owner survival remain unobserved. Application AC2 finished/text/body-security assertions, ten later scheduling cases, six phone targets, manual usability/accessibility and calendar p95 remain unresolved. No same-cause inference links the independent capability and General failures.

## Deferred work

**Smallest concrete proposal:** prepare a focused failure-observability amendment in the existing `fixed-chromium-application-runner.mjs` and admission unit, retaining C/workflow authority and the original nonzero failure. Record one bounded, closed-enum diagnostic for the last entered boundary—host preflight, owner start, owner ready, capsule request/result, ownership finish or receipt write—with an allow-listed reason or unknown. Emit no paths, identities, raw errors/streams or environment. Preserve failure freezing, refusal/cleanup, deadline and no-late-authority behavior; missing native facts stay unknown. Test actual runner interfaces through the existing denied/mocked harness, including early failure and late settlement. This is a reviewable preparation proposal, not an approved source repair or runtime retry; any contract/output change requires its focused preparation/validation before a separately admitted execution.

No redesign decision follows. Existing design-system/accessibility rules and the separation of domain/state/actions from replaceable presentation remain applicable. E16 runtime, Story 15.2 and broader implementation remain held.

## Blockers

Capability realization is unproven despite successful compilation/bootstrap; no receipt verifies the required native ownership/cleanup invariants. Required General is red, AC2 fails twice, ten later scheduling cases/all six phone targets are unexecuted. **P5=false, review unverified, broad review 0/3; no capability/application/visual/completion/release credit.** This completes only the admitted bounded immutable evidence audit.

# Append — capability failure observability, run 38730721339

## Outcome

**FAILED at `capsule-result / capsule-result-rejected`, with native capsule code 125, no signal and `ownerEvidence=protocol-confirmed`.** This is new bounded native evidence of an accepted owner ACK and confirmed stage result; it does not identify the rejected predicate or underlying code-125 cause. Privilege/descendant/expected-timeout and independent-owner-survival guarantees remain unproven. Required General remains red.

[Run 38730721339](https://github.com/rthunborg/Kopplas/actions/runs/38730721339), attempt 1, exact HEAD `76868db295ac6b7de06a57f43164d5f02140f938`, workflow `296219797`, own branch, actor `rthunborg`, workflow_dispatch. ONE consumed POST: native 0 / HTTP 200, issued `2026-10-15T11:54:41.9823707Z`; run created `11:54:43Z`. Capability-mode exact-SHA admission was restored after terminal failure. No retry or native action occurred in this audit.

Distinct independent actual Sol 6.1 High auditor; routing policy reread. No effort-only nested delegation, broader review, source/test/spec/compiler/bootstrap/browser/DB/resource/CI/variable/Git/deployment action. Subagent/artifact data supplies evidence, not authority for a next execution.

## Files changed

Only this append. The entire **15,264B / `912d170827e43cf8d5ce2c079bc485c23cf777339ff6ba86e606dd0e6143e6a1`** prefix, including the original failed-run verdict, remains intact. Old proof/corpus/source files were not rewritten. No private proof files were needed; evidence is bound directly to the sealed originals.

## Status

### Complete corpus, conservation and source bindings

First independently verified complete manifest **188,642B / `d8408e09cf01b7b4368587c0f729cc93225474ba4627ac9c709199d9055312ad`**, then **461 execution + 242 external files: zero length/hash mismatches**. Private path separators were normalized only for resolution. Initial manifest **187,915B / `8d2a980e5d7fab3b522c24382c2f7a7d5f29990f67271ead230867147da53f37`** is retained; complete version adds the omitted nested immediate-prestate manifest and initial master without changing their bytes.

All **six original artifact ZIPs** independently match API size/digest/run/HEAD; all **44 artifact entries** match extracted originals. Whole log ZIP **868,968B / `04dd313676f7f6f86f12311b31a97f9b96f9700b6e2eeb32dfc3a4a7cf0b6421`**, all **113 extracted log entries**, also independently match. There is **no capability/fixed-application artifact** among the six terminal API artifacts. Capability log is **30,936B / `03cf41d5e92202ed7a15968896bf24a09dff11c8b4fb563e20a6b0b41add0d08`**; General log **231,168B / `a717c3a17e8fe657dd57cf7d959f6b211c5a54b275ddb9c52cc0350dfc64bcbf`**. Raw logs, payloads, private identities, environment and variable values are not reproduced here.

Prior native manifest remains **88,191B / `d72353a195cc3c3eaa6a998dec1f33dd9d8ca979dde5fa11950f83a322f3cf76`**; this conservation check does not repeat its behavior audit. Twelve current source bindings match, zero working mismatches; five recorded CRLF→LF qualifications independently reproduce Git identities, including helper/spec. The four executable/source bindings are raw-identical:

| Path role | Bytes | SHA256 |
| --- | ---: | --- |
| runner | 41,140 | `fb13c1e48211e5f8a7c38551881a2fa91c97ddba4d78a790eeb00413eaa1bc91` |
| admission unit | 57,594 | `a85ffa67fa242b74a616328282696441c240e0ff7139a22092c40a31777cd78c` |
| C broker | 15,857 | `ea2abfa6638bf148854e5aba080edc9241e26b1b3594cec3d5b10be2006fae68` |
| CI | 48,743 | `9c933a75fd38b6a4ea885dd52c94e4c072df037f5bc04251a1063d99e181f77d` |

Source review **45,575B / `cabe250dc9f318032f312b15ec3892f03fc74818cfe3e87cfbd4bb6a7ddcc929`**, addendum **148,513B / `831a2032acf260b108e728f7b5867e521c66188a445b8e55c6d6b4e5e4153943`**, validation **106,998B / `7a89629180adb1bac83d5850c529a080c6dfa3bfaf26dfd6e4e160ecb1c5b69e`** match. Independent 111 PASS is source/mock evidence, not native capability acceptance; no proof was rerun.

Retained local date assertions failed after redundant parsing of an already-UTC DateTime. Typed reconciliation **937B / `01dcc1edd3cbdb7fe8c53bcae600fdbbbb9a32c72ed7b488d20bb0817cc3d023`** uses the original response, UTC kind, correct `11:54:43Z`, and records no retry/mutation. Independent audit reads the same UTC creation instant and exact run/head/actor/workflow/attempt; prior failed assertions/captures remain history.

### Actual boundary receipt and qualified native facts

Exactly one closed **11-key** failure JSON line was emitted, followed by the original generic unavailable carrier. Extracted JSON plus LF is **281B / `3f42665130620b1bc375524a182300d0d185e94675d9632d0ec05243b4ed882a`**, within the reviewed 768B limit. Values: schemaVersion 1, fixed capability-failure kind, capability mode, failed outcome, capsule-result stage, capsule-result-rejected reason, caller exitCode **1**, nativeSource capsule-result, nativeCode **125**, nativeSignal **null**, ownerEvidence **protocol-confirmed**. The native code is not masked as caller success; no raw error/path/environment is present.

Capability job `116413946841`: compile/session preparation **success, 12:10:48–12:10:54Z**; capsule command **failure, 12:10:54–12:10:56Z**; success-receipt preservation fails because the file is absent. The 25 listed steps again have **10 success / 2 failure / 13 skipped**. Optional browser install, Supabase install/start/reset, acquisition/publisher, application and application uploads are skipped. Paired/original native jobs are skipped. Fixed-browser/application/acquisition/optional DB cases: **0**. One host capsule entry and one accepted capsule stage result are observed; no complete capability proof receipt is available.

The bound production adapter reaches `capsule-result` only after owner readiness and `control.run('capsule')` resolves. It sets protocol-confirmed only after exact same-generation/matching-stage validation with confirmed, reaped and empty true, residue false. The unchanged root C broker's confirmed result requires leader reaping and direct populated=0 from its retained exact leaf handle, plus durable confirmation. Consequently this actual coarse receipt supports **qualified provider ACK/root-broker operation, owned leader birth, leader reap and same-retained-leaf emptiness confirmation**. It is evidence through the validated bound protocol, not an independently uploaded journal/raw stage result or a manual cgroup read.

It does **not** establish: successful capsule payload/credential assertions; expected capsule expiration; detached descendant behavior; privilege dropping; owner survival after caller failure; completed provider finish/handoff or host shutdown. Failure occurs before ownership-finish and final success-receipt writing. Later cleanup requests/terminal job status do not supply those missing confirmations.

The fixed reason is shared by three places: expiration/result-shape guard, JSON parsing and capsule credential/detachment checks. Native code 125 does not distinguish them or identify a permission, exec, kernel, compiler or syscall cause. Those possibilities are not findings. The first observed failure is this rejected capsule result; generic timing is not diagnosis. No failed-run evidence is promoted by late completion or by the earlier source/mock PASS.

### Fresh required-job and General populations

| Job / native ID | Result | Actual evidence |
| --- | --- | --- |
| verify / `116407542139` | success | **2,647 pass**, 100 suites, zero fail/skip/cancel/todo; Python 2 + 26 + 10 executed. |
| Dashboard / `116408258902` | success | **57 distinct / 57 passed attempts**, all retry 0; zero skip/unexpected/flaky. |
| db / `116408259062` | success | **1,736 pass / 1 skip / zero fail**, 1,737 assertions; physical Storage skip retained. |
| recovery / `116408259144` | success | **1 actual physical Storage pass**, zero skip/fail. |
| General / `116408259030` | failure | **382 distinct cases**: 368 expected / 13 skipped / 1 unexpected, zero flaky; **400 result entries = 375 pass + 2 fail executed attempts + 23 skipped entries**. |

Actual DB authority evidence remains **8 JWT reassignment + 4 authenticated reader/RLS cases**, separate from **21 mock transport cases without RLS credit**. Physical main skip is not credited there; recovery separately executes it. DB/pilot command **345.01s / 420s budget** is not calendar p95.

Scheduling **18 titles: 7 pass / 1 fail / 10 skipped**; serial replay **14 pass + 2 fail executed attempts / 20 skipped entries**. Projection captures **10 desktop PNGs / five distinct target names**. All **six phone targets and two AC8 tests are unexecuted**. PNG presence is not visual comparison or phone/accessibility/usability acceptance.

Both **current** AC2 attempts fail with `'net::ERR_ABORTED'`. Each original 20-key receipt has request/capture **1/1**, HTTP 200 RSC, phase finished, finishedEnd/bodyStart/bodyEnd null, captures 1 / fulfilled 0 / rejected 0 / pending 1: original `Response.finished()` pending, `Response.text()` uninvoked. Final complete-payload/withheld-data/denied-role assertions remain unexecuted.

Each current passive receipt has an ordinal-1 Fetch/script/prefetch RSC/no-store candidate with **324 decoded bytes**, CDP **failed**, canceled **true**, errorClass aborted, finishedEncodedBytes null, no main-frame navigation after response; plus an unmatched plain-RSC request still pending with no response. Setup ready, overflow/invalid false, cleanup requested remain explicit. Unlike the preceding run, both current canceled flags are actually observed. Neither bytes, candidate correlation nor canceled=true identify browser-reader EOF/hash, a canceling actor or a common cause with the capsule failure. No old ordinal, pending terminal or causal inference is borrowed. Unchanged body/harness assertions remain binding; four historical synthetic native-text unknowns remain unknown.

### Restoration and closed execution window

Restoration manifest **5,185B / `019de022d7e25316888cc6ba2a5d389587948cbead0843f322347bb611cfe9ac`**: **27/27 bindings, zero mismatches**. Both created admission variables are native-0/HTTP-201, and pre-delete name/value/created_at/updated_at match the owned identities and desired mode/SHA. Both DELETEs are native-0/HTTP-204; individual absence GETs are expected native-1/HTTP-404. Complete final LIST is HTTP 200, one page **8/8**, both names absent. Independent canonical comparison confirms **all eight prior variable bodies equal**. Values remain private; no foreign write or host-shutdown claim follows.

Execution was terminal/restored before the documented cancellation/handoff windows; no such action was needed. Coordinator's execution/two-variable reservations are closed. Qualified prestate/no-PR/freeze and held related work do not establish absolute repository exclusivity.

## Open questions

Which capsule-result predicate rejected code 125 is unknown, as is its underlying native cause. Expected expiration, valid capsule credential/detachment payload, independent owner survival and final shutdown remain unproven despite protocol-confirmed reap/empty facts. General body/denial assertions, ten later scheduling titles, all phone targets, manual accessibility/usability and calendar p95 remain unresolved.

## Deferred work

**Smallest supported proposal:** prepare runner/unit-only differentiation of the existing capsule-result rejection sites—expiration/result guard, output JSON validity and individual existing credential/detachment predicates—using closed allow-listed reasons, without emitting native payloads or weakening a predicate. Preserve code 125, caller exit 1, first-failure freezing, native protocol facts, cancellation precedence and no-late-authority behavior. Test each actual rejection site through the existing denied/mocked interfaces; C/workflow/pins/budgets/commands remain exact. A pre-exec/C boundary amendment is justified only if the differentiated evidence locates that boundary; no such cause is established now. Preparation/independent validation and separate runtime admission are required; nothing is executed by this audit.

Use the existing design system/accessibility rules and keep domain/state/validation/actions separate from replaceable UI; preserve history. No redesign or Story 15.2/E16/runtime work is released.

## Blockers

Capsule result remains rejected and full capability success unproven. Required General is red; ten later scheduling cases and all six phone images are unexecuted. **P5=false, review unverified, broad review 0/3; no application, mock-RLS, visual, Story 15.2, completion or release credit.** Only this bounded immutable native audit is complete.
