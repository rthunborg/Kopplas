---
title: 'Split runtime admission from core parallel contract CI'
type: 'chore'
created: '2026-11-03'
status: 'in-review'
baseline_commit: 'd03a52ce014f60c8e279f016e8cdd5790ca0d596'
continuation_baseline_commit: '2415964604d5b8d766883f0cbfcf6e6b5ca215a0'
continuation_date: '2026-11-04'
runner_observation_baseline_commit: '35ba03d20fc0f0b366b52b4205f539557247507d'
context:
  - docs/process/parallel-auto-bmad-contract.md
  - docs/process/review-order.md
  - docs/process/agent-model-routing.md
---

This is an explicitly authorized continuation of the same author's completed
PR130 task. Original sections through Verification preserve its d03 scope and
earned history; Current Windows admission partition continuation below governs
the new work. Neither historical result nor old four-job rule qualifies the
new source. The original baseline is intentionally preserved.

## Original PR130 intent and authority (historical)

The saved Windows contract check exhausted its shared 30-minute job budget after
three suites passed and finalization had begun. Move the unchanged admission
command into its own two-OS matrix and require the entire matrix to succeed before
either existing core contract job can run successfully. Preserve every command,
existing qualifying check name, setup/pin, native exit and per-OS budget.

Parent authorized this maintenance task after independent Sol High assessment
`/root/crm_runtime_route/runtime_admission_verification_review`, exact design
SHA256 `727521f832ea78dc4560524942179313a6def8a36f1fe9effce934f993f2f72b`
(`tmp/private/e09-design/windows-ci-assessment.md` in the E09 diagnostic worktree).
Author and sensitive CI/claim-qualification integrity route: gpt-6.1-sol High.
Use the existing root-rendered Build snapshot `a445218b1fb3096b3156`; no rerender,
story key or sprint-state change applies. E09's separately approved ignored
design remains immutable; no E09 source/runtime work is part of this task.

## Frozen scope and acceptance

Exactly three tracked paths:

- `.github/workflows/auto-bmad-parallel.yml`
- `docs/process/parallel-auto-bmad-contract.md`
- This spec.

The parent-recorded `tmp/private/ci-topology/author-allocation.json` uses read-only
shared-store evidence and records zero overlap with the CRM claim, full producer
reservation and known supplemental producer scope. Preserve other sessions.
No helper, adapter, focused test, pin, dependency, runtime configuration, product,
live claim, resource, CI/provider action or retry is authorized here.

1. Add `runtime-admission` with the unchanged admission command alone after the
   existing three setup steps, both OS entries, `fail-fast: false`, and exactly
   the same Windows 30 / Ubuntu 15 timeout expression.
2. Preserve `contracts` and its five other command steps byte-for-byte in meaning,
   including routing's native `$LASTEXITCODE` capture/exit. Add unconditional
   `needs: runtime-admission`; retain default success semantics. Neither old
   qualifying check can pass unless **both** admission matrix children passed.
   No `if`, `always()`, continue-on-error, status fallback, exclusion or bypass.
3. Conserve workflow triggers/path filters, contents-read permission, concurrency,
   Windows Git checkout overlay, checkout/action pins, credential setting,
   Python 3.12, `runs-on`, and both existing per-OS budgets. Successful workflow
   paths execute all six commands once per OS, with no weaker native-exit path.
4. Preserve the adapter's exact two `CI_JOBS` and strict receipt schema. Require
   native evidence for all four same-revision jobs under `source_ref`; downstream
   check argv/counts describe those actual jobs, not fabricated aggregate counts.
   Missing/failed/canceled/skipped/mismatched admission evidence refuses.
5. Record honest revision/count provenance. This `d03a52ce...` branch has 24
   admission methods, not 38. The saved 38-test run executed synthetic merge
   `7832cab2111e25522fc4751fc753a16472c3adde`, whose PR129 source is
   `82f9038f36f9f33f3965587e9bef359e321c547e`; it was not direct source-SHA execution
   and the overall Windows check was canceled. Following real qualified CI
   integration, a genuine PR129 source descendant must contain the integrated
   workflow plus 38 tests; obtain fresh direct-exact-reviewed-tooling-SHA evidence
   for all four jobs before qualification. No synthetic/source relabeling.
6. Verify the parsed workflow against the baseline and meaningful in-memory
   refusal mutations, using the existing installed YAML parser with no new
   dependency. Do not rerun expensive unchanged Python suites. Finish with one
   author review section, verified references and diff checks.

## Tasks

- [x] Read approved design, saved native log/annotations and allocation/routing.
- [x] Record this baseline, intent, scope and ACs before the YAML edit.
- [x] Implement dependent two-matrix workflow without command/setup weakening.
- [x] Update truthful qualification/evidence and integration-order contract.
- [x] Run parsed conservation/refusal checks and inspect the final diff.
- [x] Write one author Suggested Review Order and verify its stops.

## Evidence baseline and limits

Saved Windows job `125772356144` annotation explicitly reports the 30m budget
exceeded, bound to source `82f9038f...`. Native checkout/log proves actual execution
at synthetic merge `7832cab...` onto `d03a52ce...`, Python 3.12.10:

| Command suite | Actual saved native result |
| --- | --- |
| Parallel helper | 70, terminal OK, 511.562s |
| Runtime admission | 38, terminal OK, 992.559s |
| CLI lifecycle | 13, terminal OK, 121.895s |
| Finalization | Ten individual ok results, then interrupted during next setup; no terminal suite result |
| Routing / external process | Not reached |

First three durations total 1626.016s before finalization. Overall canceled
Windows CI is not qualifying evidence. It proves no Git deadlock, finalization
defect or future timing guarantee. Saved log SHA256:
`b7c94c11542ea242c3158857341da597410d26465b09d205e4aadf251c0d4cf5`.

Static method inventory at this branch is 70 + 13 + 21 + 26 + 10 = 140 core,
plus 24 admission per OS if all commands execute; this inventory is not a native
pass claim. Native results and skips must be read at the actual later executed
revision. The split creates separate budgets, not an assurance that future jobs
finish. Local structural/mutation checks cannot prove hosted scheduling, native
suite completion, provider truth, tooling qualification or live admission.

## Verification

Author execution baseline: `d03a52ce014f60c8e279f016e8cdd5790ca0d596` plus exactly
the three allocated working-tree paths, before local commit. No remote/hosted
operation or Python test suite ran during this implementation.

`node tmp/private/ci-topology/check-workflow.mjs` passed using existing installed
**js-yaml 4.3.2**, without dependency changes. It parsed the actual candidate and
`git show` baseline workflow, checking root trigger/permission/concurrency equality,
exact job identities, complete two-OS matrices, fail-fast settings, exact 15/30
budget expressions, runner expression, complete three-step setup equality,
exact prerequisite dependency, admission command, and all five core step objects
including routing's captured native exit. It verifies all six commands occur once
on the successful path. Workflow raw SHA256 checked:
`921a27e5b17bdb53efb85dfd590efc215936ffe40b25a5979fde2186f032a898`.

Mutation probes: **1 positive workflow model passed, 32 weakening mutations were
rejected, and 1 duplicate-YAML-key probe refused**. These are structural/refusal
checks, not 34 native test executions. Rejections cover missing/wrong/empty
dependency, job/step conditions and failure suppression, OS omissions/exclusions,
fail-fast changes, either budget increase, runner changes, missing/masked commands,
setup/checkout/Python/credential changes, routing exit masking, trigger/concurrency/
permission changes, and qualifying-job renaming. AC1/3 map to setup/matrix/command
conservation; AC2 maps to dependency/no-bypass mutations; AC4/5 map to the contract
source-evidence and revision/count distinctions, which require later native proof.

Ignored durable evidence under `tmp/private/ci-topology/`:

- `check-workflow.mjs`, SHA256
  `90b8aaf448c82718906be9955a3cda2a386239c53fc222452a1c9de7b903f98f`.
- `parsed-workflow-result.json`, SHA256
  `02fe4f14320f0384c0e41fe1ea7506e070428d611545bb053356773e993ddcf4`.

Inspection confirmed no baseline diff in either helper tree, the adapter or its
focused tests. `git diff --check` passed. The author reference checker targets
this spec only. No unchanged expensive suite was rerun merely to decorate the
trail. Only root may observe subsequent provider execution; the saved canceled
run, structural probes and source method inventory are not new CI qualification.

## Windows admission partition continuation

Root admitted the same author (gpt-6.1-sol High, native
`01a19d45-2361-7400-994f-db87553edde5`) on the separate clean registered
`C:/DEV/Kopplas/tmp/private/e35-windows-admission-topology`, branch
`codex/e35-6-windows-admission-topology`, from qualified241596. The original
PR130 intent, d03 baseline, earned structural evidence and old counts above
remain historical; they are not new qualification. Reuse root's successful
render a445 with render root C:/DEV/Kopplas and this worktree as source/artifact
root. No story key or sprint/global-state update applies.

Fresh known-writer preflight: 62 registered worktrees, zero allocated-three-path
status exceptions. Root reports other known writers stopped/no overlapping new
assignment; this is not global process proof. Producer57tokens/7domains/3IDs,
cap3/fourth, diagnostic4 and PR1344 holds remain. This actual author assignment
must appear in later custody facts; no release or old idle assertion is inferred.
Private activation.json preserves exact identity, route and full path preflight.

Saved diagnosis `cc50e9b04e5e77dff13d527efe9adad50b1998e3d1661e437127b0e7990c7b0f`
proves Windows job126091631996/run41685956548 exceeded30m at source01e6:
57 methods completed, the58th interrupted, three not started; no terminal61 PASS.
It does not establish a hung Git process or method-specific performance defect.
Independent source-aware refinement
`ec71054649e93545fe06de2d917843881078c4114745c358970a856f20b6f5ed`
replaces the initial expected61 assumption with actual complete source inventory.
Qualified241 has52 methods (26/26); later genuine PR134 integration has61 (31/30).
No source/count allowlist or historical partial-result aggregation is authorized.

<frozen-after-approval>
### Current intent and constraints

Keep the complete Ubuntu admission invocation and split Windows admission into
two deterministic exhaustive groups under the same15/30 budgets. Each existing
core140 job still needs the ENTIRE admission matrix with default success.
Exactly the original three tracked paths are allocated. Preserve all five core
commands/exit handling, setup/action/Python pins, triggers, concurrency, helpers,
adapter/schema/source pins and assertions. No product/config/dependency, live
claim/store/resource/CI/provider operation or full local suite execution.
If a reliable guard needs another tracked script/test, stop with the minimum
path proposal before widening this allocation.

The inline stdlib guard collects the full actual unittest module without running
fixtures/bodies; canonical IDs must be nonempty and unique. Sort and alternate
into two nonempty disjoint groups whose union equals the complete inventory.
Validate exact actual native script argv/selectors and successful executed IDs,
unique terminal count/OK, zero skips/failures/errors/expected failures/unexpected
successes and native exit0. Tee native stderr bytes immediately with flush,
including partial method progress, while stdout remains inherited. Validation
capture is bounded to1MiB; overflow, invalid UTF8 or incomplete output refuses
without hiding continued native output. No per-method start timing is inferred.
Missing/truncated/extra/duplicate output refuses.
Before and after collection/execution bind actual HEAD to immutable GITHUB_SHA,
commit/tree, committed module/checkout LF hash, full inventory count/digest and
both groups/selected IDs. No external reported metadata supplies expectations.
Root must retain and compare identical source/inventory bindings across all
three actual cells; there is no invented automatic cross-job proof/combined argv.

### Continuation acceptance criteria

- Given the actual complete52 or61 source inventory, when collected without
  execution, then Ubuntu selects all and Windows partitions26/26 or31/30 from
  that actual source; unknown/empty/duplicate/omitted/overlapping IDs refuse.
- Given exact selected native execution, when every selected canonical ID has
  one successful record and the matching complete terminal summary/exit0,
  then that cell succeeds; any nonpassing/unknown/incomplete result refuses.
- Given source or inventory changes or a checkout/GITHUB_SHA mismatch, when
  any guard boundary is checked, then qualification refuses before completion.
- Given a failed/canceled/skipped/missing admission cell, when downstream core
  scheduling is assessed, then neither core job can qualify. All conserved
  baseline settings/commands and two-check receipt schema remain intact.
- Given only local resource-free guard controls, when reporting results, then
  record their actual counts/source and limits; source qualification still needs
  fresh same-source terminal three-cell evidence plus both core140 jobs and
  separately required ordinary gates. Old57+later4 never becomes Windows61.
</frozen-after-approval>

### Continuation Code Map

- .github/workflows/auto-bmad-parallel.yml: runtime-admission matrix29–35 and
  existing native step65–66 gain the shared inline collection/selection/result
  guard; contracts68 keeps unconditional needs and every existing core step.
- tests/maintenance/test_admit_story35_6_runtime.py: RuntimeAdmission and final
  unittest.main() are read-only collection/explicit-selector seams; no new flag.
- docs/process/parallel-auto-bmad-contract.md: runtime admission qualification
  at253–284 must describe the real three admission/two core records and source
  provenance, preserving historical PR130 facts separately.
- This spec: retain original historical sections and refresh the SAME author
  Suggested Review Order after implementation/verification, not a second section.

### Continuation tasks

- [x] Verify identity/allocation, read exact design/refinement and record this
  explicit continuation before editing the workflow.
- [x] Implement the three-cell inline guard in the allocated workflow only.
- [x] Reconcile current qualification contract without schema/pin changes.
- [x] Run bounded controls against the extracted actual inline logic, actual52
  and target61 collection without fixture execution, and parsed YAML conservation.
- [x] Refresh exactly one author SRO, native evidence/limits and frozen hashes.

### Current continuation verification

Execution source is qualified241596 plus ONLY the three allocated uncommitted
paths. The final actual YAML-extracted139-line guard SHA256 is
`73313f16de80dc1528bd4a730f8acf55ffb290b09aa452d474edb298c9f6f28f`. Private guard-draft.py is an earlier draft and is NOT the tested final source.
`python -B -X utf8 tmp/private/windows-admission-topology/run-final-controls.py`
ran four bounded commands, all native exit0:

| Actual command/control | Final native evidence | Limits |
| --- | --- | --- |
| node check-workflow.mjs | 1 positive parsed model;32 weakening mutations refused;1 duplicate-YAML refusal;0.178s | Existing installed js-yaml4.3.2; no scheduling emulation |
| python collect-only.py actual241 module |52 full IDs;26/26;0.328s | Collection only; no fixture or body runs |
| python collect-only.py private exact01e6 module |61 full IDs;31/30;0.362s | Read-only Git-source fixture; no native suite PASS |
| python check-guard.py |60 controls passed;1.127s | Exact extracted functions; synthetic native/process/source fixtures |

The final source-collection projection derives ONLY existing final733 logs and
metadata. Original source-collection-summary.json/previous321 evidence remains
historical, including its original times/hashes; no relabel or extra rerun.
Both native collection records retain complete IDs/groups and exact commands.
Actual admission fixtures/test bodies executed:0. Core suite executions:0.
Hosted/CI/provider/runtime/store/resources/live operations:0.

AC inventory/partition maps to actual52/61 full collection and empty/duplicate/
unknown/omitted/overlapping/nondeterministic group refusals. AC native completeness
maps to all three synthetic argv/result cells for BOTH actual inventories and
nonzero/canceled exit, altered argv, missing/truncated/unterminated output,
missing/extra/duplicate/wrong-order IDs, wrong/duplicate terminal count,
skip/error/failure/expected-failure/unexpected-success and contradictory-footer
refusals. The stream seam asserts raw partial bytes flush BEFORE next read/wait,
all bytes still tee after bounded overflow, and overflow/invalid UTF8 refuses.
AC source freshness maps to wrong/missing immutable SHA, actual dirty-candidate
refusal, refreshed module-byte tamper and source/inventory changes before/after
the injected native boundary. No injected clean-status fact is CI qualification.

The parsed comparison preserves the ENTIRE baseline contracts job object and
all non-admission changes, setup/action/Python/native-exit/trigger/concurrency/
permission and15/30 budget invariants. Its32 weakening mutations exercise those
boundaries and mandatory whole-matrix/no-bypass scheduling structure. This
proves the declared DAG structure, not actual GitHub scheduling or completion.

Retained failures/precision: the first parser command exited1/MODULE_NOT_FOUND
before any control, using an absent top-level js-yaml link. Existing pnpm
transitive js-yaml4.3.2 was then resolved explicitly; no install/dependency edit.
Earlier321 controls passed before an author precision changed diff/tree lookup
to the already checked immutable head, preventing a mixed HEAD/tree snapshot.
Those earlier bytes/results remain in before-source-binding-precision. Final
733 extraction/collection/controls ran once after that source change. No full
admission/native test suite was repeated to decorate evidence.

Durable private proof hashes (no recursive fixture/dependency traversal):

- `tmp/private/windows-admission-topology/check-workflow.mjs` SHA256 `3e0cdb7176eeebde77c04dd2a3421abcd65c156382b852aafe96b653d74fa45d`.
- `tmp/private/windows-admission-topology/check-guard.py` SHA256 `55f80d169a549a187c2e9350d4fd79eca427165c552dd4f8c6c33107abd67b9d`.
- `tmp/private/windows-admission-topology/workflow-controls.json` SHA256 `4a030259db9885497c1ef1d3b543c3309918f7bd9b799d7adec0edd84a64427b`.
- `tmp/private/windows-admission-topology/guard-controls.json` SHA256 `6bbd65883d8cf66cbc02ed5319a580aaf315cc875f9f7c399aa30ba11a4f4659`.
- `tmp/private/windows-admission-topology/final-native-controls.json` SHA256 `8869fe32b3bfa83b8d717d68f8d9a7e3140df1b905481babbc1673b62904efad`.
- `tmp/private/windows-admission-topology/final-source-collection-summary.json` SHA256 `25b88c2ad95d0bb8a3070c03a87a7cb4d73e53383b3bbc35b71a89afe855c6b9`.
- `tmp/private/windows-admission-topology/first-parser-failure.json` SHA256 `8dcbd27975474f16663ba85e13a513b7b9775ba2ce4d04741620f5c8b8c9ccd6`.
- `tmp/private/windows-admission-topology/source-binding-precision.json` SHA256 `0111e1b199ad711d4bf1aa3c80cedcd9d968b85bf1a6e331cb67204b409a5384`.

No new OS timing, actual Windows group success, complete source CI qualification,
live admission or product/runtime PASS is earned locally. Groups are only
count-balanced. Root must qualify the real final source across all three cells
with identical source/full-inventory bindings and both core140 jobs; after real
PR134 integration the actual inventory must be61, not this baseline52. Historical
57 completion lines plus later results are never combined. No automatic release,
claim, source-pin or two-check receipt-schema authority changes.

## Source-refusal diagnostics continuation (2026-11-04)

Root admitted SAME Sol6.1 High author/native01a19d45 on a NEW clean registered
`C:/DEV/Kopplas/tmp/private/e35-source-refusal-diagnostics`, branch
`codex/e35-6-source-refusal-diagnostics`, from qualified
`4824c4c1a6acf3e10b4227604b13b2fa304d80e1`. Reuse root Build render a445;
render project root remains C:/DEV/Kopplas, source/artifact root is this worktree.
No story key/sprint/global bookkeeping. Fresh status checks found63 registered
worktrees and zero exceptions on the three allocated paths. This records known
source facts, not global process proof. All producer57/7/3IDs+cap3/fourth+diag4+
PR1344+topology3 and current new3 holds remain; author is newly active.

Approved original design SHA256 `deb4bd78808ae7af35cb63692ea45653c2a44d2eddb118d78a760609faf1c44b`
PLUS binding R1 addendum `5d4798b8cd49123761a3fe0d7c562b4c4f7cd60c7d6a0c1ee85a500290f71104`
were independently assessed by SAME Sol High reviewer
`/root/crm_runtime_route/runtime_admission_blind_review`, final receipt
`38d9e83972210855ac4bb4e98468b7e2acd6e02a95f6a099eec354706267819a`.
These frozen private files remain under PR134's source-refusal-diagnostics-design
folder. This extension preserves the original PR130 intent and prior partition
history above. Qualified4824 contains52 methods; frozen PR13410cc contains61.
Neither inventory is a native PASS or qualification of this new source.

### Approved refusal-only intent and acceptance

- Given original Git cleanliness code0, when binding checks source, then the
  original call/settings/streams run once with no diagnostics and unchanged
  acceptance. Given a returned nonzero, diagnostics can never permit collection,
  execution or success: the SAME static fatal refusal is raised from None.
- Given that nonzero, when metadata is available, then only three fixed Git
  plumbing reads run sequentially with diagnostic-only no-optional-locks/pager/
  replace/lazy-fetch/ext-diff/textconv/rename suppression. Retain exact original
  native RC. Capture head-index/worktree facts as LATER NON-ATOMIC, cause UNKNOWN.
  No refresh/repair/index/config change, retry or guessed original state.
- Given new diagnostic bytes, when parsed/emitted, then complete NUL grammar,
  exact immutable raw-path membership and safe ASCII display are required before
  ANY row. Unknown/unsafe/malformed/overflow input withholds all rows/counts.
  Capture limits: allowlist2MiB/16384paths/512bytes, diff256KiB/256rows/16display,
  ASCII JSON32768bytes or fixed fallback2048bytes. No content/stderr/env/config/
  credentials/exception text. Original inherited stderr is unchanged legacy I/O.
- Given slow/failed/late workers, when the6s application deadline closes the
  record, then nonblocking locks select independent UNKNOWN fallback, no I/O/
  parse/spawn/cleanup occurs under lock, and new callbacks cannot promote/mutate/
  emit/start another command. Command1.5s, owned kill/wait0.25s, EOF/emission
  signal0.05s and0.1s reserve apply. Raw descriptor reads only, no main close/join
  of unsettled readers; one main-scheduled pre-deadline os.write attempt only.
  No buffered stdio/logging/traceback in new workers, delivery or verified-shutdown
  claim. External cancellation remains nonqualification.
- Given this exact three-path change, when qualifying locally, then private
  controls use ACTUAL extracted YAML logic plus one disposable Git fixture.
  Preserve entire core/matrix/pin/schema/trigger/concurrency/15–30 contracts and
  append contract notes after existing sections. No admission bodies/core/CI/
  runtime/resources/store/live actions. Fresh real-source gates remain Root's.

### Refusal continuation Code Map

- `.github/workflows/auto-bmad-parallel.yml`: existing binding cleanliness seam
  gains local bounded parser/capture/refusal helpers and three fixed phase labels;
  collection/partition/native result/core logic remains unchanged.
- `docs/process/parallel-auto-bmad-contract.md`: append a refusal-metadata note
  after all sections; preserve unrelated future PR134 SRO567 by retaining prefix.
- This spec: preserve prior intent/history; refresh exactly ONE author SRO after
  final native evidence. Private controls/evidence live under
  `tmp/private/source-refusal-diagnostics/`, no new tracked helper/test paths.

### Refusal continuation tasks

- [x] Establish fresh identity/source allocation; record approved intent before code.
- [x] Implement refusal-local diagnostics and append operator contract note.
- [x] Run actual-extracted private native/privacy/lifecycle controls and Git fixture.
- [x] Verify conserved source/pins, one author SRO and final exact three-path diff.

### Refusal continuation verification

The author completed these controls before the owner HOLD, and preserved them.
Root's explicit repair-only release adopts the finite owner-approved tranche at
`b6d5ae5b8475faeabaa8f8d134fc6532f35fce55`; both product35.6/35.7 holds remain.
Full continuation envelope and parent-folder owner-approval.md were read. Fresh
resumption confirmed the SAME native identity, allocated worktree/branch, baseline
4824 and exactly three dirty paths, with no outstanding command. Full approved
original/R1/independent-confirmation hashes matched before adoption. No source
logic or successful control was replayed merely to resume. All reservations remain.

Tested source: qualified4824 plus ONLY this workflow working-tree change. Final
actual YAML-extracted guard SHA256 is
`ab3068c8a096e61a4845019a796b6cdb2e720ee324c640f062368a87cca358c5`;
workflow raw SHA256 is
`3ddeada039565c306ab42dc705af20a92e26e4b918466791dd3c9f8ed4c0d46a`.
The guard is362 lines versus139 at baseline. Four refusal-local helpers occupy
215 lines including separating whitespace (initial draft202; strict UTF8 check
and protected completion signaling account for the later13). The additional
structure implements raw descriptor ownership, independent fallback/closure and
caught daemon completion errors required by R1; no generic runner/framework,
new dependency or tracked script/test was introduced. Collection, partition,
existing native stream/result and core logic remain unchanged. The design's
120–160 line estimate was exceeded; size is reported for targeted review,
not treated as proof of correctness or a hidden scope expansion.

Each final command used the private run-command.py recorder, retaining exact
argv/cwd, elapsed seconds, native exit, log hash and guard hash. All four finished
native0; their records/log hashes were rechecked on repair-only resumption:

| Final private command | Actual result | Seconds |
| --- | --- | --- |
| node check-workflow.mjs |1 parsed positive;32 weakening mutations refused;1 duplicate-YAML refusal|0.175184|
| python -B -X utf8 check-refusal.py |81 controls passed;0 failed|0.338098|
| python -B -X utf8 check-lifecycle.py |20 controls passed;0 failed|6.207293|
| python -B -X utf8 check-git-fixture.py |5 real Git observations passed;0 failed|2.318141|

All paths above resolve under `tmp/private/source-refusal-diagnostics/`; these
are controls/observations, not admission suite or product test counts. Python
fixtures/native child results are injected except ONE retained disposable Git
repository. No admission bodies/core suites/CI/browser/runtime/resources/store
or live operations executed. The fixture's actual original Git probes returned1;
its diagnostic fixed reads reported index-only, worktree-only, both, deliberately
later-empty, and unknown-new-path refusal. Index raw hashes immediately AFTER
original probes equal those AFTER diagnostics. Its non-ASCII committed member
remains exact internal membership, never normalized. Original native Git emitted
two LF/CRLF warnings in the retained log; that unchanged inherited stderr is
explicitly outside the NEW diagnostic privacy boundary.

AC native precedence maps to original0/1/128/negative/Windows-native code probes,
once-only exact original argv/settings, zero-diagnostic success, fatal nonzero
and suppressed secret exception chains. AC privacy maps to complete allowlist
and status grammar, exact case/byte membership, unknown/new/unsafe/nonASCII/
control/traversal paths, valid-before-invalid withholding, duplicate/unterminated/
empty/parity errors and byte/path/record/display caps. No unsafe row/count leaks.
AC lifecycle maps to raw pipe/error/timeout/overflow/EOF controls, contested
nonblocking lock fallback, blocked/partial/throwing/late raw emission, late owned
Popen cleanup and a REAL6s deadline followed by an inert late collector. AST
checks prohibit new buffered stdio/flush/join/traceback and I/O/parse/spawn under
the record lock. These are bounded injected boundaries, not OS teardown proof.
AC conservation maps to unchanged preexisting function ASTs/main except three
literal phase arguments, complete parsed baseline job/setup/core equality,
mandatory whole-matrix gate and32 weakening refusals. Existing source-aware52
baseline versus future61 remains unchanged, without reexecuting either suite.

Retained failure: first refusal command native1 in0.265551s failed before any
control with IndentationError in the newly added UTF8 check. The author corrected
indentation; earlier31142a guard then passed81/20/5 controls before protecting
all daemon-finally completion signaling. Those prior bytes/results are preserved
as before-worker-signal-* and their original logs/metadata. The final ab3068
commands above ran after that justified source change. No earlier pass was
relabelled final; no failure was deleted or rerun blindly for green.

Private packet enumerates specific scripts, native metadata/logs/results and
source bindings; it does not recursively traverse the retained fixture. Exactly
one author SRO below is checked with the bounded existing node reference checker.
`git diff --check` and protected committed-blob/pin comparisons are recorded in
the private freeze receipt. Neither local success nor the old synthetic/direct
CI observations prove this new source's qualification or the old failure cause.
Root retains current-source review/hosted gates, publication and hold release.

## Runner-native index observation continuation — approved 2026-11-04

New author `/root/diagnostic_receipts`, Sol High, owns exactly the workflow,
parallel contract and this existing execution artifact. Approved proposal r2
SHA25673c2b3425376b145b0444ad1ec21e74da1ea08f98926c0ecac8897c7a4e5380a
and direct owner approval are retained privately. Build renderer ran once,
snapshot1f5525134fd8b352f1e3; headless preparation uses that exact approval.
Historical frozen intent/baselines above remain unchanged. Current local baseline
35ba03d20fc0f0b366b52b4205f539557247507d merges reviewed877 with actual main
4411cdc412f01ee023440525ff1e17bb824ef383. Old731c PR metadata is historical.
No product sprint/claim status is changed by this process continuation.

Problem: hosted PR138 Windows0 retained original quiet1 but later empty comparisons;
four approved private exact-version observations did not reproduce that pattern.
Measure only bounded before/after index byte/stat relations on one actual runner.

Execution plan (all within the explicit three-path allocation):
- [x] Workflow: manual-only default-false mode, one Windows0 observation job;
  original877guard byte-identical, default52/26/26 matrix/core140 unchanged.
- [x] Inline observer: two250ms waits/16MiB reads, no raw index/digest/path/stat
  output, original quiet once with unchanged args/settings/streams, fatal nonzero.
- [x] Preserve bounded artifact then intentional non-qualification workflow failure
  even original0; no accepted contract success or consumer schema/pin changes.
- [x] Private actual-YAML/injected source controls plus current consumer refusal;
  author trail maps actual results and limitations before independent High review.
- [x] Append operator contract and refresh one SRO; freeze exactly3tracked paths.

Acceptance: Given ordinary events/default dispatch, when parsed, then existing
complete DAG/pins/native commands stay equal apart from mode exclusion. Given
manual observation, when original0/complete capture, then terminal failure still
prevents workflow SUCCESS. Given original nonzero or observer failures, when the
job settles, then exact original code/static fatal precedence persists. Given
unsafe/unstable/oversized/late index input, when summarized, then bounded fixed
UNKNOWN/unavailable facts replace raw data and no late publication changes it.
Given diagnostic/zero-test receipts, when existing qualification consumers run,
then they refuse without new schemas. These local controls never execute a new
actual Git experiment or qualify a hosted source.

Scope stays process-only: no source repair, helper/workflow pin changes,
dependencies, product/table/auth/app changes, resources, live store or provider
calls. Root alone owns commits/publication, one approved automatic CI set and
one later diagnostic dispatch. Both products remain held. Frontend acceptance is
not applicable because only workflow/operator docs/execution evidence change.

### Runner observation local verification and limits

Actual parsed YAML conserved the complete ordinary baseline35ba DAG/pins/core
commands and exact877guard ab3068. Native node command passed1positive,
28weakening mutations and1duplicate-key refusal. Its mode truth table covers
PR/push/manual false/manual true; GitHub evaluation itself remains hosted proof.
Actual extracted observation source SHA256
5e56faa4b79003d92911c1774dc832da165be3b5c561747811e7f7490703be48
ran 48 Python controls:48 passed/0 failed/0 errors/0 skipped in1.080285s (native0).
These exercise original0/1/128/signal/Windows result, exact once-only argv/no
kwargs, static fatal/secret-chain precedence, fixed scalar schema, descriptor
capture/close, reparse/missing/oversized/unstable index, read/start/serialization/
artifact/partial-write failures, contested lock and real250ms late-reader/writer
closure, exact guard extraction without main, and actual terminal child exit77.
Existing strict A.qualify_tooling and original engine.checks rejected synthetic
diagnostic failed/misnamed/missing/zero-count/skipped/extra-job receipts; a valid
synthetic core receipt passed those consumers. Other Git/store/review prerequisites
were mocked, not executed. This does not authenticate provider provenance.

Author reference checker executed with native0,14 valid stops/0errors; local
frontend-controller gate returned explicit not-applicable for exactly these three
workflow/doc/spec paths. git diff --check passed. No frontend/build evidence is
borrowed.

Private scripts/logs/native metadata and counts live at
`tmp/private/runner-index-observation/` in this worktree; source is actual parsed
YAML, not a separately passing draft. Source reader/capture facts are injected;
the only native terminal subprocess was the fixed failure script, not Git.
No extra actual Git experiment, admission/core test body, build/application,
DB/RLS/browser/runtime, hosted CI, provider, claim/store or resource action ran.
The prior4local exact-version observations and failed hosted877 remain immutable
history; no cause or source/hosted qualification is inferred. Root must obtain
independent High review, current source/base/synthetic bindings, its approved
single automatic CI set and separately approved one manual observation attempt.

## Suggested Review Order

Author: `/root/diagnostic_receipts`, Sol High; new approved observation continuation.
Current local baseline35ba03d20fc0f0b366b52b4205f539557247507d integrates
reviewed877 with actual main4411cdc412f01ee023440525ff1e17bb824ef383.
The preceding frozen intent/evidence remain historical; current facts below are
local controls only, with independent/hosted qualification still pending.

### Separate observation from qualification

The default-false mode preserves the complete ordinary DAG. The manual-only
Windows job omits all test bodies and must fail after capture even when the
original Git result is0; a successful observation cannot become runtime evidence.

- `.github/workflows/auto-bmad-parallel.yml:21` — `observe_index_only`: explicit boolean input with disabled default.
- `.github/workflows/auto-bmad-parallel.yml:36` — `if:`: excludes the ordinary matrix only for the diagnostic dispatch.
- `.github/workflows/auto-bmad-parallel.yml:501` — `original-index-observation`: one separate Windows job.
- `.github/workflows/auto-bmad-parallel.yml:763` — `Diagnostic observation cannot qualify`: preserves original failure and forces native77 after successful probe/capture.

### Observe bounded metadata without retaining index contents

Each read owns its raw descriptor; closed, nonblocking publication and independent
fallback prevent late results from becoming current. Only relation/availability
enums leave transient digest/stat material; readers cannot establish atomicity.

- `.github/workflows/auto-bmad-parallel.yml:567` — `def index_read`: fixed literal metadata path, byte cap and descriptor/stat checks.
- `.github/workflows/auto-bmad-parallel.yml:607` — `def observe_index`:250ms wait closes before selecting an immutable result.
- `.github/workflows/auto-bmad-parallel.yml:644` — `def bounded_observation`: rejects unexpected states and shapes.
- `.github/workflows/auto-bmad-parallel.yml:660` — `def capture_report`:2KiB payload, one raw write and bounded descriptor ownership.

### Preserve the first native predicate and its fatal result

The copied877 guard body is unchanged. The observer retains the original once-only
Git argv/settings/inherited streams, then only nonzero enters its existing bounded
refusal routine; all observer/capture/serializer failures leave that refusal fatal.

- `.github/workflows/auto-bmad-parallel.yml:701` — `def original_observation`: immutable source binding and separate observations.
- `.github/workflows/auto-bmad-parallel.yml:709` — `subprocess.run`: exact original argv with no new keyword settings.
- `.github/workflows/auto-bmad-parallel.yml:729` — `if code != 0`: unconditional static fatal fromNone after optional diagnostics.
- `.github/workflows/auto-bmad-parallel.yml:736` — `def observation_main`: validates exact877 guard digest without running admission main.

### Read the actual local evidence with its limits

The parsed workflow controls preserve all existing default jobs and refuse28
weakening mutations;48 injected Python controls exercise privacy/native/lifecycle
boundaries and the unchanged consumer predicates. They do not execute a native Git
experiment or establish GitHub expression evaluation, filesystem/OS teardown,
provider authenticity or source qualification. The native terminal control exited77.

- `.github/workflows/auto-bmad-parallel.yml:754` — `Preserve bounded non-qualification observation`: captures only one safe artifact, including after failure.
- `docs/process/parallel-auto-bmad-contract.md:1048` — `Diagnostic-only original index observation`: operator limits and separate native non-qualification failure.

Root owns current provider source/base/synthetic checks, publication, the approved
automatic CI set and one diagnostic dispatch. Original877 failure, PR13461 context,
the four-case non-reproduction and independent workflow-pin stop remain. Both
products are held; current source independent review/hosted execution are pending.
