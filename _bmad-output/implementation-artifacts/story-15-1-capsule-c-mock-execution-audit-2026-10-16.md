# Story 15.1 compiled capsule C mock — independent execution audit

## Outcome

**PASS for the ONE actual compiled C-mock execution: 36 logical cases / 37 physical evaluations, zero failures or skips.** This proves the bound producer's behavior under compiled mocked interfaces. It does not diagnose the earlier real capsule code 125, establish real credential/kernel behavior or complete application verification.

[Run 38883625738](https://github.com/rthunborg/Kopplas/actions/runs/38883625738), workflow `386543290`, event push, attempt 1, actor `rthunborg`, exact HEAD `45deb28751a5e0af154e8c219b3f607132a23654` on `codex/epic-15-scheduling-time-calendar`. Recorded one push initiated `2026-10-16T09:54:04.908838Z`, native exit 0; run created `09:54:09Z`. Its sole job `116915989465` completed success `09:54:13–09:54:23Z`. All nine listed steps succeeded, including exact case-sensitive event admission before checkout, qualification, extraction, compilation, execution and preservation.

Distinct independent actual Sol 6.1 High auditor; routing policy read. Auditor compiler/reexecution/test/Git/push/CI/settings/resource/browser/DB/deployment actions: **0**. No broad source review or historical behavior audit was repeated.

## Files changed

Only this new artifact. Prior capability audit remains **28,005B / `7bc0a012d3c821abadf714fb2ce403d2ca8ba046e1bed061d1ea1e876e0033c7`**. All source, old artifacts and private evidence remain untouched. No private proof files were needed.

## Status

### Sealed proof and exact compilation input

First independently verified master **43,046B / `8bf652f6a91bcd2e42be83ad9d4338c2513ce9fe5c443f54ab15ff5cba45cb6c`**, then **130/130 bindings, zero length/hash mismatches**. Original artifact `12038284012`, `capsule-c-mock-38883625738-1`, ZIP **18,956B / `28179136f2b094eed013786cc8f33d695191477814f602729aa6a00cb2370223`**, independently matches API size/digest/run/HEAD. All **17 extracted artifact entries** match in-memory ZIP entry hashing. Original complete log ZIP **18,378B / `a8e700e6f5eb5ffaf5e7b03fa177caf85cea7671b3a522784e6748a3becd5e5d`**, all **11 extracted log entries**, also independently match. Original extraction receipts retain CRC qualification. No extraction or archive rewrite occurred here.

Operational final binding **7,012B / `b3834d6f35452eeebf1df7ece82a924b51dc594adde04d76b0b92a52f74faf5c`**: all **12 current protected sources** match, zero working mismatches; recorded Git raw equality and qualified LF-normalized comparisons independently pass, zero qualification mismatches. Normalization is not described as raw equality.

| Actual input / output | Bytes | SHA256 |
| --- | ---: | --- |
| production C | 21,149 | `a48c96a0e196416aa5e0036010085676fc696ff844f166903044e317064c530c` |
| mock scaffold | 9,855 | `fba14fa7508e22ea5552219b984ee279d560c62ce8576d29a77cf49b5a9fa60f` |
| extracted production span | 9,002 | `58110a2a79866ca8406b2a2b27aebe4e692d0f4e96272405ae662ee8d9381a22` |
| generated compiled C | 18,823 | `2227fd1dab92d5ab43916dd18d78200a1713ceee4a30392a49a533487ed82a91` |
| uploaded compiled mock executable | 30,504 | `9ba34ccd6c14757de9f63e0aafc4be2163f5ac9535f65cbecfd76f1e3266b1c4` |
| mock stdout | 1,021 | `56b550d58e0a0971f0a405dc9b5908a5be19c5195cdcf4d06c9cea3937867828` |

Independent byte reconstruction replaces the scaffold's sole marker with production bytes `[6297,15299)` and equals the uploaded generated C exactly. This is actual producer source inserted into a compiled harness, not a detached duplicate implementation. The native Linux broker entry/main, stage lifecycle, session loader and real system interfaces are excluded/replaced.

The executed workflow is **8,443B / `4aa549f5df3ac1e51a0e475826dde0f99d70e1143f83878454efa90780986b86`**. Actual action-download records resolve checkout@v4 to **`11d5960a326750d5838078e36cf38b85af677262`**, upload-artifact@v4 to **`ea165f8d65b6e75b540449e92b4886f43607fa02`**. These match the admitted observations for this run; mutable aliases do not prove future resolution.

### Toolchain, exits and actual case assertions

Actual qualification records Ubuntu **24.04 / x86_64**, Ubuntu Clang **18.1.3 (1ubuntu1)**, target **x86_64-pc-linux-gnu**, resolved compiler `/usr/lib/llvm-18/bin/clang`. Qualification JSON **186B / `1dc41d3885b2355a1a68b4de5fa184cb65fc41b4ac00965843a7b41340f6a962`** is qualified=true. Reported tool hashes bind the runner's observed compiler/timeout/Python; their raw binaries were not uploaded or independently rehashed here.

Actual compile flags: **`-std=c11 -Wall -Wextra -Werror -O0`**, 20s compiler ceiling. Mock execution has 3s ceiling; outer job 5 minutes. Qualification version/target probes have 3s bounds. Each stdout/stderr result is limited to 32,768B; private output uses restrictive creation and file limits. Both `compiler.exit` and `mock.exit` are **2B `0\n` / `9a271f2a916b0b6ee6cecb2426f0b3206ef074578be55d9bc94f6f3fe3ab86aa`**. Compiler stdout/stderr, qualification stderr and mock stderr are empty. No timeout, compiler warning/error, skipped qualification or missing case is reported.

The actual 1,021B stdout exactly equals all 36 ordered named PASS rows plus `mock_cases=36 failures=0 skipped=0 native_actions=0`. Result JSON **54B / `fca1ce880137e443b7282b268a2758ddda3ea08bea6c1c27094c96d0af7d918d`** reports pass=true, cases=36, skip=0, reasons empty.

| Logical population | Physical evaluations | What compiled assertions check |
| --- | ---: | --- |
| cases 01–34: each first-failure boundary | 34 | stdin/dup; privilege/capability/group/identity guards; chdir/fd closure; node formatting/length; environment guards; mocked exec |
| case 35: delivery unavailable | 2 | Both write=-1 and write=0; bitwise OR evaluates both subvariants |
| case 36: mock exec success | 1 | Mocked exec transfer succeeds with no refusal write |

For each failure evaluation, the compiled harness requires exit **125**, exactly **one** bounded refusal write, exact stage JSON/schema/newline, saved errno **13** or deliberate predicate-null, exact requested byte count, correct fallback descriptor, correct call order and **zero subsequent guarded calls after the first failure**. The write stub changes errno to 99, so exact comparison specifically checks saved-error preservation. Unavailable delivery must leave no captured marker while retaining the refusal request/exit; no retry or manufactured successful delivery is accepted. Successful mocked exec requires no refusal writes and no argument/order errors.

The scaffold's exact syscall/credential/exec/environment mocks inspect expected arguments and replace those operations. `_exit` and exec transfer use setjmp/longjmp in the harness; real process exit/exec is not exercised by those assertions. Marker comparison admits only the fixed schema/kind/stage and bounded numeric-or-null errno, without paths, environment, secret values or raw errors. Synthetic environment constants are validated in memory and are not stdout evidence. The compiled success proves those assertions passed for **all 37 evaluations**, not merely that the workflow was green.

`native_actions=0` is narrowly the harness's absence of real domain syscall/credential/exec actions. It does not mean no native compilation/process execution occurred: Clang and the uploaded mock executable actually ran. This audit independently hashes the uploaded mock binary but does not execute it.

### Provider handoff and preserved scope

Bound provider history retains the first window refusal and subsequent ONE separately admitted successful patch/positive verification before its deadline; no refusal was silently treated as permission. The after-state is **900B / `7e47f30dcebef48c443b09a7ce50f6a3e22f61aaa974fef8607fa14198971bb6`**. Coordinator recorded the window closed and actor holds released. Owner end state remains **all project automatic previews disabled until owner reenable; no automatic restore or replay**. This auditor made no provider call or setting change; this is a bound handoff state, not a new authorization.

This workflow has only the mock job. It does not rerun the unchanged 123 source tests, General, real capability, browser, database, application or visual flows. The earlier qualified native ACK/reap/retained-leaf facts and unknowns remain unchanged. Prior General scheduling **7 pass / 1 fail / 10 skipped**, six phone targets unexecuted, and four synthetic native-text unknowns remain historical blockers; they are not recounted or promoted by this mock run.

## Open questions

Real first-failure boundary behind native code 125 remains unknown. Actual credential dropping, kernel/exec behavior, detached-descendant/expected-timeout and independent owner survival/full capability remain unproven. Application AC2 finished/text/body assertions and remaining phone/visual acceptance remain open. Actual native realization is outside this compiled mock's evidence.

## Deferred work

The smallest remaining gap is a **separately prepared, independently validated and admitted capability-only native observation of the existing bounded C refusal producer**, retaining its current guards, failure semantics and ownership protocol. This compiled mock supplies supporting readiness evidence; it admits no execution and no application-mode expansion. No additional source change or mock repetition is justified by a failure in this run, because none occurred.

Existing design-system/accessibility rules and domain/state/validation/actions separation from replaceable UI remain applicable; preserve history. Story 15.2 and E16 runtime remain held.

## Blockers

Compiled mock gate passes. Real capability/application acceptance still lacks required evidence. **P5=false, broad review 0/3; no real credential/kernel, code-125-cause, full capability, application, visual, completion or release credit.** Only this bounded independent compiled-mock audit is complete.
