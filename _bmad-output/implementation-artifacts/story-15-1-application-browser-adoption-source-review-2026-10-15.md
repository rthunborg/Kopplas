# Story 15.1 application-browser adoption: independent focused source review

## Outcome

**FAIL — the exact source/proof package is not ready for native execution admission.** The original 62 focused tests pass independently, but two new resource-free witnesses expose consequential gaps in the runner's claimed bounded cleanup. Retain this failure and both witnesses before any repair. No source fix or native execution occurred.

This is the distinct independent Sol 6.1 High review requested by the coordinator, separate from the implementation author and preparation validator. High applies to executable provenance, process ownership and failure-integrity boundaries. Assignment checkout: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`; coordinator-supplied HEAD `65207b9ecaf7e5ad39b1840bda76099805acfa57`. This is one focused source/proof assessment, not a broad Story 15.1 review round. Broad review remains 0/3.

### Finding 1 — [P2] Linux Chromium escapes the only process group the runner kills

**Caller/capability:** the optional `fixed-chromium-application-verification` job invokes `runApplication`, whose `productionRuntime().compatibility` spawns the Node compatibility helper through `runOwnedChild`. That helper calls `runCompatibility`, using the admitted installed Playwright 1.61.1 `chromium.launch` capability. This is an ordinary authorized runner invocation with a valid candidate; no forged receipt or elevated attacker is needed.

**Reachable trigger and invariant bypass:** a native Chromium process can become unresponsive during launch/close. The runner's compatibility timeout sends TERM and then KILL only to `-child.pid`, the Node helper's process group (`tests/diagnostics/fixed-chromium-application-runner.mjs`, `runOwnedChild` lines 161–194 and runtime group kill around line 210). The actual installed SDK's `launchProcess` sets `detached: process.platform !== "win32"` (`playwright-core/lib/coreBundle.js`, lines 8755–8758). On Linux, Chromium therefore leads a different process group. If browser graceful close stalls, killing the helper does not kill Chromium's group. The helper can close while its launched browser survives. The claim that the bounded helper group contains its browser is false, so this timeout is not bounded cleanup of the complete owned compatibility workload.

**Downstream guard verification:** the installed SDK maintains browser cleanup sets and signal/exit handlers. Its TERM handler requests graceful close; the inspected `gracefullyClose` waits for `attemptToGracefullyClose()` and browser cleanup. A pending graceful-close promise need not reject. The SDK has its own force-kill function targeting the browser group, but the runner kills the helper with SIGKILL instead of invoking that function or explicitly owning the distinct browser group. SIGKILL runs no Node exit hook. The runner's `finally` repeats the helper-group kill only when helper close has not arrived; after close, its timers are cleared. No verified downstream containment/cleanup wrapper bridges these process groups. Eventual GitHub machine teardown is not this promised deadline/confirmed cleanup and supplies no source-stage proof of it.

**Independent failure witness:** `cleanup-witness.mjs` executes the actual installed SDK `launchProcess` source in a VM with every spawn/kill/timer replaced by mocked interfaces, alongside the actual exported runner `runOwnedChild`. It observes `actualSdkDetached=true`, helper PGID123, browser PGID777, kills only `-123` with TERM/KILL and `browserAliveAfterHelperClose=true`. Its expected complete-cleanup assertion is RED. No browser or native child was started. The fixture specifically supplies a never-settling browser graceful-close promise and settles the fake helper and timers; it does not infer live native shutdown from the model.

**Required correction boundary:** repair must establish bounded ownership and termination of every native descendant/group actually created by the installed SDK, with truthful cleanup failure and no CLI admission after refused compatibility. Do not alter the SDK/default browser, suppress the failed result, use global process-name/port cleanup, or rely on an eventual host shutdown. This review does not choose or implement that mechanism.

### Finding 2 — [P2] Early cancellation leaves force cleanup scheduled at the original full deadline

**Caller/capability:** `productionRuntime` registers the parent runner's SIGINT/SIGTERM callbacks with `runOwnedChild`. The same owned-child helper supervises the installed application CLI with `milliseconds=1500000`, a 25-minute deadline. An ordinary cancellation during that invocation is enough to reach this path.

**Reachable trigger and invariant bypass:** `stop` marks `expired` and sends TERM, but does not schedule cancellation-relative escalation. The force-kill watchdog is created once at `milliseconds + 1000` (`runOwnedChild` lines 168–189). If TERM arrives early and the child does not close, there is no force-kill or cleanup refusal after a short cancellation grace period. The runner installs its own signal handler, so the parent remains awaiting this child until the original deadline or external host escalation. For the application route the original watchdog is at 1,501,000ms after invocation, regardless of when cancellation occurs. This violates bounded cancellation cleanup even if all native subprocesses could otherwise be contained.

**Downstream guard verification:** the race waits for child close, cleanup failure or that same watchdog. The `finally` group kill runs only after the race settles; it is not a cancellation-triggered timeout. Child cooperation can close sooner, but an unresponsive browser/CLI is exactly the case requiring enforced escalation. The compatibility wrapper refuses an expired result, preventing late admission; that correct failure fence does not bound termination. No other runner cancellation timer repairs this path. The workflow's outer job deadline/host cancellation is separate authority and cannot make the inner source claim true.

**Independent failure witness:** the second test calls the actual `runOwnedChild` with a fake child and fake clock, invokes its registered cancellation callback immediately, and records only timer delays `[1500000,1501000]` plus TERM. There is no cancellation-relative timer at or below 2,000ms. The bounded-escalation assertion is RED; the fake child is then closed and all fake timers are cleared before asserting. Native process, browser and signal actions remain zero. A repair must make cancellation and overflow force cleanup relative to refusal, preserve the original terminal result, and not restart or admit the application through a late callback.

## Files changed

The only new tracked artifact is this reserved review file. Source/config/workflow/unit/application/helper/spec/package/lock/environment/coordinator-state files were not edited. The reviewer is not alone in the repository and did not revert or alter another actor's work or resources.

New exclusive private evidence directory:

`.env.epic15.mail-runtime/application-browser-independent-review-5d09a9fb-1f6a-44f5-a547-9925cae5aeea/`

It contains current preservation snapshots, fresh raw TAP/stdout/stderr/native exit files, one new two-case cleanup witness, and a static inverse/YAML/preservation verifier. There are no additional tracked write allocations. The initial fixture import path was corrected before its first execution; no prior witness output was replaced. All executed failure outputs remain retained.

## Status

### Exact source and proof bindings

Before any rerun, the author manifest independently matched **14,259B / `11a2c0de7f621fddb1b43b595f3744934531dc445e928c7110283cbdc2b0ef5f`**, and all **74/74 entries** and **6/6 actual source bindings** matched with zero mismatches. The author's retained r1–r4 failures, corrected fixtures, later raw outputs, native exit files, type/lint/YAML lookup failures and count correction remain immutable. Final author counts are 62 total, comprising 58 new checks and four existing checkout/ref checks; no earlier failed/partially executing fixture count is treated as acceptance.

| Actual reviewed source | Bytes | SHA256 |
| --- | ---: | --- |
| `tests/diagnostics/no-store-stream-probe.mjs` | 74,992 | `8cf809577519061295a7a0dc5b65d81d4d1f9a1b9ef7a1e9804b88e71975567d` |
| `tests/diagnostics/fixed-chromium-application-runner.mjs` | 22,472 | `b8f0193f31c474891870bfd637327f750235d2d844a6011cc82fc02b6a263645` |
| `playwright.fixed-chromium-application.config.ts` | 1,602 | `0130eb414992aa9b3afb9cfa9b401785d9d99582a1f029b59671594e840159eb` |
| `.github/workflows/ci.yml` | 41,517 | `be67b75bf1a4554f35a61cf4427fc0ff2185d807ca045c249612aeb23cde2df9` |
| `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts` | 2,513 | `ffdd8587638a3bede21cf38553734a125515ccb09316a3b7087ada2467efc40a` |
| `tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts` | 26,036 | `68ece4fb021145d87167bc82a0ad8ae104e157d3ddbff3be70c76009bb7b9b5b` |

The addendum matches **39,275B / `297a4e5c19af6deb237903c5b47046d3b2cb9a5c65487d6019cff30a62156ece`**; its original **27,814B** prefix independently remains `db26fc6e665ec8444705c7c183c52e4e69d3866770ce860120e1569deae9571c`. Preparation validation remains **21,161B / `98ffd4ef74b572e47f812b6cbc398a84ac6d06ea4ccf48adc16fe318f8e515dd`**. The native audit remains **46,431B / `3037aa84db6a519a495f2e523ce114af7a87e425596b8a494db94ffcf0fb0777`**. Source/receipt hashes are not a new raw-browser-binary rehash.

Independent whole-source inverses recover byte-for-byte:

| Preserved original | Bytes | SHA256 |
| --- | ---: | --- |
| Probe: remove only two export modifiers | 74,978 | `e4ff29811169cff384d9d75ad992730e5726a34f8659287763be24ddef7bfd67` |
| Workflow: remove only marked optional input/job | 35,082 | `25c9f3672f4538a95d5fb573421739ae14be757d0a2b72fc39e756dfcae1d304` |
| Existing unit: restore optional title/count only | 2,511 | `313f11c18c66d8bb242e66cb27c314b9fbe3eca94573a4276ce28c308beb5b28` |

Thus all seven prior job blocks, existing input/ref/DAG/permission/gate/budget logic and original candidate/package function bodies are retained. Actual YAML parsing through existing ESLint js-yaml confirms eight jobs and default-false optional input; nothing was installed.

### Independent executed checks and immutable failure evidence

The source test files were read for write/process/network paths before rerun. Their production actions use denied VM or explicit mock interfaces. Actual production code is imported inertly; no production acquisition, native version, browser, application server or database is executed.

| Fresh check | Executed | Pass | Fail | Skip/cancel | Native exit |
| --- | ---: | ---: | ---: | ---: | ---: |
| Existing focused actual-source suite | 62 | 62 | 0 | 0/0 | 0 |
| Independent cleanup witnesses | 2 | 0 | 2 | 0/0 | 1 |

Syntax checks for both diagnostic modules, full `tsc --noEmit --incremental false`, five-path ESLint with zero warnings, existing service-role containment, actual YAML/inverse/current-preservation checks all return native exit0. These passing checks do not supersede the new consequential RED witnesses.

Fresh witness script is **3,982B / `4f654ba4091ac4b1bf4b830f7552602aeef9ca925d2cacc34ee4b20f91adc89f`**. Both distinct tests and discriminating output are preserved in `cleanup-witness.tap`, **2,540B / `2b4f6ac70a9f58ef4151797a09735271461e0d1ee8eaff2a0caf7f31c9fd4277`**, with `cleanup-witness.exit` exactly one byte `1`, SHA256 `6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b`. Its stderr is empty. The installed SDK file and manifest used by the first actual-source witness are byte/hash-bound in `preservation-after.json`; they were only read.

Independent 62-case TAP is **14,032B / `f5975e462e49d28b634cd35f747ed4aca07d37b3bea5303ef615c0243cb05384`**. Exit is exactly `0`, stderr empty. No synthetic fixture supplies native application, acquisition, binary, security/RLS or visual evidence.

### Preserved authority and limitations

Admission continues to require the exact full158 candidate receipt and computed acquired-byte ZIP/executable identities, actual SDK/module/manifests/Node binding, current source/config/package identity, awaited compatibility close and no CLI after rejected/late admission. Workflow conditions keep the optional job disabled by default and require verify success plus original General success/failure on opted-in dispatch. Acquisition publication retains its unchanged certificates, publisher result and nonrenewable D; an apparent true output after publisher failure does not authorize upload. No acquisition/source body was changed by the export seam.

The root config derives the actual original General inventory, one project, fixtures, production build/start, CI retries1, inherited timeout/trace/environment behavior and 800,000ms attempt-sum reporter. The original 25-minute job budget and seven prior jobs are preserved. The new isolated artifact paths and explicit full158 selection do not promote the optional result into the required gate. The runner preserves actual suite output/failure and uses a bounded closed provenance schema; the two findings concern cleanup enforcement, not a native success claim or a waiver of application evidence.

The independent snapshot binds **1,266 existing files** before/after, including all **1,172 old private files**, the 74-entry author package, six current sources and current protected states. All match after reruns. The **12 nonallocated protected files** consist of ten unchanged author non-state bindings plus the two coordinator state files frozen at this review's start. Old-state changes made before this assignment are not falsely claimed identical to the author's earlier state receipt. The addendum's admitted append is protected by its current full binding and exact original prefix. Original application spec **57,501B / `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065`**, helper, canonical spec **84,649B / `d5a492a1546c19d777d8bff3d7037686e60a577565cac67281bff764f427bc22`**, default config/package/lock and old native histories remain unchanged. Current preservation snapshot: **294,769B / `b1b5fdfee48dc20f524b3a0cd37359efc8f8f79422eae560c8c6317cb0c466e3`**; after receipt **2,712B / `2f6dfbf76f5f5e2ed083b3b9e5c13bc1b4a21a1b3bf732819610d951f9c22f8c`**.

## Open questions

No clarification is needed to establish either defect. A repair design must resolve actual SDK descendant ownership and cancellation-relative force cleanup before another native execution can be admitted. Source witnesses cannot prove Linux process termination; eventual native evidence must separately distinguish a requested kill, confirmed child close and complete owned workload shutdown.

The existing native audit remains narrow: the paired evidence supports a reader remedy only, four native-text observations remain unknown and full native status is inconclusive. The old executable hashes are runtime acquired-byte receipts, not this review's independent binary rehash or publisher signature. No full158 application finished/text/nonempty-payload/withheld-data/denied-role outcome follows from package pinning or a synthetic report.

## Deferred work

Return this FAIL to the coordinator for a bounded cleanup amendment preparation and independent validation before author allocation. Retain both failed witnesses and original source/proof history. This reviewer does not fix source, start additional broad tests or admit execution. Any later repair and focused regression review must bind its actual final source and prove these failure paths without changing required General/assertion authority.

One subsequent application execution remains a separately admitted stage. Required-route policy/promotion, all eleven genuine desktop/phone journey captures and meaningful visual comparison, Contract D click/drag and persistence, manual/accessibility/performance gates and full story acceptance remain outside this source review.

## Blockers

Both cleanup findings block source readiness and the next native application execution. Original required General remains red; AC2 finished/text remains unfulfilled, ten later scheduling titles and six phone targets remain unexecuted. Optional green cannot substitute for required General or earn P5. **P5=false; review unverified; broad review0/3; no Story15.2, new application acceptance, mock RLS/security, visual/manual/performance, completion, release or deployment credit.**

Actions: static reads/hashes and bounded resource-free source/mock/static checks, new private receipts and this sole tracked review artifact. **Actual HTTP/acquisition/download/install/native-version/browser/server/DB/CI/resource/Git/deploy actions0; source/config/workflow/application/helper/spec/package/environment/state edits0.** No resources were requested, adopted or stopped.

## Focused root-service source review — 2026-10-15

### Outcome

**FAIL readiness: two consequential changed-route defects remain.** Distinct independent Sol 6.1 High review of the authorized root-service fallback at independently read HEAD `16180cd63914a57895b36c2db060c43c74da3514`. This append preserves the entire original **16,998B / `317ad7458f38193511198e5691310634587aa4ba9cec4da5f3db6275c3776272`** review, including its original FAIL, both P2 findings and immutable RED evidence. It does not rewrite historical verdicts or consume a broad Story 15.1 review round.

### Files changed

Only this review append is a tracked write. Four allocated source paths are read-only. New exclusive private evidence: `.env.epic15.mail-runtime/application-browser-root-independent-review-af4037b5-3d56-4474-ba44-dce91a5e017d/`. No source fix, compiler/bootstrap, privileged process, acquisition/browser/application/DB/CI/resource/Docker/WSL/deployment or Git mutation occurred. Five bounded read-only Git commands verify HEAD and raw source blobs. Other actors' work, checkouts and resources remain untouched.

### Status

The author sealed manifest matches **11,576B / `eaa8968cd6f563de4822b0d55842c3497d696e9c8212f4395ef891eddd383a60`**. All **53/53 entries** and **4/4 source bindings** independently match before rerun and afterward. Raw HEAD blobs independently equal working bytes for all four sources, also matching the coordinator's **1,587B / `cd74de961f903dbe14a8741dd428e669c65ea024f62e3223a0bcebedb11ed877`** Git-binding receipt.

| Read-only source | Bytes | SHA256 |
| --- | ---: | --- |
| Runner | 32,087 | `83401b2deebee08aa565a352f037661200199f20c112bb08b9cc2463c3c9a410` |
| Owned-process C broker | 15,857 | `ea2abfa6638bf148854e5aba080edc9241e26b1b3594cec3d5b10be2006fae68` |
| Admission unit | 37,845 | `4b667fed0e344270c285f50510fa4ac68bf35f71d7ab1badf3f870fd01e1c9ea` |
| CI workflow | 48,604 | `818d0f379c90ade3ccd0d31be9ed260bf0a86ec5acee1a26eadfd72374478a42` |

Author addendum remains **112,204B / `11265a64af6cea16509e9f04472dd48e5ebc147eca2be608ee9f772d7ced8cc9`**, preserving its **105,966B / `229c99e404032da48716853256ba7cc7771db8006a7735a93b41839dda6c8d1f`** prefix. Independent preparation validation remains **87,941B / `e9cf00558944a2070232ed4299676bd4d54827aa4e3394f52d922353a9bab977`**. Author preservation receipt remains **7,873B / `8b4e5a972ee956124386dd1de4ae4d0029cc90b5765d7fd4d4bd903fda7b40fd`**.

**R1 — [P2] Terminal admission refusal does not revoke pending owner creation.** Caller: the ordinary authorized application invocation of `runApplication`, through `productionRuntime().admitCandidate/packageAdmission` and their shared `ownedAdmission` promise. Capability: start the reviewed root service and request its compatibility leaf; no forged receipt, arbitrary command or privileged attacker is required. The 15-second admission race at runner line382 can time out while `startOwner` is awaiting the root/binary filesystem preflight at line306. Failure handling calls `finishOwnership` at line421, but line353 cancels only an already assigned owner. There is no terminal refusal latch when `owner` is still undefined. When delayed filesystem preflight later settles, line310 can still create/spawn the owner; line324 then accepts its ACK and sends `COMPATIBILITY`, after the caller already returned admission failure. Thus an obsolete failed generation can create native work and start a new compatibility clock after first refusal.

Verified downstream guards: `createHostedOwner` has an irreversible refusal latch only after that object exists. Before assignment, no object is cancelled and no latch is inherited by `startOwner` or `ownedAdmission`. `bounded` races promises but does not cancel their continuations. The broker's durable ACK/birth fences prove ownership of a requested stage; they do not know that the frontend had already refused admission. No application CLI is admitted through this witness, but native compatibility after terminal refusal already violates the first-refusal/no-late-work invariant and its bounded cleanup contract. This is a concrete partial-start bypass, not a missing optional defensive check.

Independent actual-source witness `late-start-witness.mjs` extracts the exact production runtime function and calls the actual exported `runApplication`; all filesystem/process/control interfaces are mocked or denied. It delays the actual preflight across the admission timer, first observes `failure=admission`, exit1 and zero service starts, then settles that preflight and observes one service start plus `COMPATIBILITY`. The fake control transport is subsequently refused and all timers are settled. **1 executed,0 pass,1 fail,0 skip/cancel, native exit1**. Script **5,151B / `c74aceea71ae29f18d35cc9dfd92582053b63ce16f697382cd20a99e2396f1cd`**; raw TAP **1,399B / `f3b0d600100f2ef8351d5e633da0ce16bd1c6f543a8bfef066796f0b81745539`**. No native service, browser or syscall was executed.

**R2 — [P2] Capability-only mode still executes optional-job Supabase teardown.** Caller: opted-in `fixed-chromium-application-verification` with separately admitted `capability` mode. Capability: that job's workflow steps. Installation of Supabase CLI, stack start and migration are now application-mode gated, but the final cleanup at `.github/workflows/ci.yml` lines969–971 retains `if: always()` and `run: supabase stop`. Therefore this optional capability-only route still attempts database lifecycle work after deliberately skipping its Supabase installation/start. If the CLI is absent, this can fail the job after a successful capsule; if present, the database teardown attempt still contradicts the capsule-only effect boundary. No provider preinstallation is assumed or asserted.

Verified downstream guards: the actual job condition permits opted-in capability dispatch after verify success and General success/failure. The application-mode conditions apply to earlier installation/start/reset/artifact steps, not this unconditional final cleanup. There is no shell mode guard, `continue-on-error`, or other downstream condition suppressing the stop command in capability mode. Other unchanged jobs' authorized database/browser effects are a separate dispatch concern and do not authorize this optional job's extra teardown attempt.

Independent actual-YAML condition witness `capability-cleanup-witness.mjs` evaluates the three real step conditions under capability mode: install=false, start=false, stop=true; it binds the exact `supabase stop` command. **1 executed,0 pass,1 fail,0 skip/cancel, native exit1**. Script **1,481B / `aa8d8ab735bc1aae1dcdbf67a81e4486ebe35c621db8c564224b4d5d45df7ca7`**; raw TAP **1,485B / `877817f9ca9ebad7eb7ce2974eefabf0c6d49bcee8353a5470ac94e30d0216d6`**. No database/CLI process ran.

Existing focused controls independently rerun **89/89 PASS,0 fail/skip/cancel, exit0**; the retained original-source assertions independently rerun **0/2 PASS,2 expected RED,0 skip/cancel, exit1**. The author's final GREEN is `focused-r4.tap`,89/89; `focused-final.tap` deliberately remains the earlier88/89 uploader failure. Failed lint/uploader fixtures and all original62 controls/history remain preserved. Fresh focused TAP: **19,711B / `e2e32b3929a1e4866d81a2e000328e287df68e63c11fe1b40fde605669a3eb14`**. Fresh historical RED TAP: **2,539B / `416be467eed8e655edec6ea71c7c5e8c0cb537a7707aeec253ecbad4533431b8`**. Runner syntax, full nonincremental typecheck, five-path zero-warning lint, actual YAML and three raw inverse checks return exit0.

The original two P2 steady-state mechanisms are corrected at **source/mock level for an acknowledged owner**: SDK-detached descendants inherit a retained cgroup leaf instead of escaping a process-group kill, and cancellation/refusal schedules one-second force/two-second confirmed-or-failed outcomes for both routes. Corrected actual-runner/installed-SDK mock cases are GREEN. C source uses atomic `CLONE_INTO_CGROUP|CLONE_PIDFD`, freeze and durable born-before-thaw, stable pidfd reaping, direct same retained-leaf emptiness, and credential/group/capability/no-new-privilege/FD restrictions before exec. Native output is separated from authenticated broker stdout. These are reviewed source mechanisms, **not observed compiled C/systemd/kernel behavior**. Original P2 execution closure remains **OPEN/unverified**; R1 additionally prevents closing the overall refusal/ownership boundary.

The independent current snapshot binds188 existing files. All27 author protected bindings are accounted for:25 non-state bindings match; the two dirty coordinator states are frozen as found, without claiming historical state equality. All102 prior manifest-listed history files remain byte-identical. The sole permitted review append preserves its entire original prefix; every other current protected file remains exact. Original application spec/helper,13 harness assertions, default SDK/config/package, retries/budgets/pins/privacy and native histories remain unchanged. Raw inverses independently recover previous optional CI **41,517B / `be67b75bf1a4554f35a61cf4427fc0ff2185d807ca045c249612aeb23cde2df9`**, original seven-job CI **35,082B / `25c9f3672f4538a95d5fb573421739ae14be757d0a2b72fc39e756dfcae1d304`**, and original probe **74,978B / `e4ff29811169cff384d9d75ad992730e5726a34f8659287763be24ddef7bfd67`**. Fresh source/preservation receipt is **1,756B / `8b218f3193c21e007a20fc341a0bd6ec019d8d2fb96aa08be4a5d0732530ecd1`**.

### Open questions

No clarification is required to establish R1/R2. Fixes need a bounded refusal latch covering pre-owner startup and an application-only optional teardown condition, under renewed author allocation. The exact implementation remains the author's responsibility. Compiler/kernel/systemd/delegation/permission realization and independent owner survival remain unobserved; native compilation and capability execution cannot be inferred from source/mock PASS.

### Deferred work

Both new REDs are retained without fixes. Return this FAIL for focused amendment/allocation and subsequent independent regression review. Capability dispatch remains HELD, so no executable capsule admission is supplied by this verdict. A future separately admitted `ci.yml` dispatch would opt into `fixed_chromium_application_verification`, bind capability mode/exact reviewed SHA, compile/bootstrap the private broker and exercise only owned Node descendants in the optional job; it must first correct R2. The other unchanged seven jobs still execute their original effects and require complete-dispatch admission. No dispatch, variable write or privilege grant occurs here.

Standing direct owner design instruction is carried forward: do not seek new legacy-URL references, browsing, evidence or observations. Preserve historical evidence; future missing design rules use the existing design system/accessibility conventions and maintainable headless domain/state/validation/actions separated from replaceable UI. This source review redesigns nothing.

### Blockers

R1 and R2 block root-service source readiness and later native compilation/capability admission. Original required General remains red; four native-text observations remain unknown and full native/application evidence remains incomplete. **P5=false; broad review0/3; Story15.2 held; no application/RLS/security/visual/manual/performance/completion/release/deployment credit.** Actual native compilation/bootstrap/probes/browser/acquisition/DB/CI/resources/privileged commands/Docker/WSL/deploy actions0; Git mutations/source edits0.
