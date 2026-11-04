---
title: 'Split runtime admission from core parallel contract CI'
type: 'chore'
created: '2026-11-03'
status: 'in-review'
baseline_commit: 'd03a52ce014f60c8e279f016e8cdd5790ca0d596'
continuation_baseline_commit: '2415964604d5b8d766883f0cbfcf6e6b5ca215a0'
continuation_date: '2026-11-04'
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

## Suggested Review Order

Author: `/root/crm_runtime_route/runtime_admission_author`, gpt-6.1-sol High.
Refreshed against the three-path continuation from qualified
`2415964604d5b8d766883f0cbfcf6e6b5ca215a0`. Original PR130/d03 evidence above
remains historical; this trail describes the actual new source and controls.

### Derive complete source-bound cells before execution

The new guard derives its expectation from the full actual source, so source52
and source61 cannot borrow each other's count or historical partial completion.
The canonical alternating partition keeps every original case in Windows coverage.

- `.github/workflows/auto-bmad-parallel.yml:29` — `runtime-admission:`: enters the three-cell admission prerequisite.
- `.github/workflows/auto-bmad-parallel.yml:99` — `def binding(expected)`: binds immutable GitHub SHA, tree and actual module source.
- `.github/workflows/auto-bmad-parallel.yml:114` — `def inventory(path=MODULE)`: collects complete actual IDs without executing fixtures.
- `.github/workflows/auto-bmad-parallel.yml:137` — `def validate_partition`: refuses empty, duplicate, overlapping or incomplete groups.

### Preserve native progress, strict results and the whole-matrix gate

Raw child progress remains visible during cancellation. Only complete exact native
results can produce a cell success; neither core job can bypass any required cell.

- `.github/workflows/auto-bmad-parallel.yml:152` — `def native_child(argv)`: tees partial bytes immediately and bounds validation capture.
- `.github/workflows/auto-bmad-parallel.yml:171` — `def native_result`: verifies exact actual IDs, count, terminal success and native exit.
- `.github/workflows/auto-bmad-parallel.yml:209` — `emit("admission-after"`: records after-source/inventory consistency before success.
- `.github/workflows/auto-bmad-parallel.yml:217` — `needs: runtime-admission`: preserves default-success whole-matrix gating.

### Keep qualification provenance and existing core authority explicit

The adapter still accepts the same two core checks; Root separately retains and
compares all three real prerequisite records. Local source collection and injected
protocol controls establish guard behavior, without pretending to be native suite execution.

- `.github/workflows/auto-bmad-parallel.yml:268` — `exit $testExit`: preserves the existing core routing native failure propagation.
- `docs/process/parallel-auto-bmad-contract.md:264` — `Every admission cell`: requires common immutable source/full-inventory bindings.
- `docs/process/parallel-auto-bmad-contract.md:291` — `all five jobs`: requires all actual records without a fake combined Windows argv.
- `docs/process/parallel-auto-bmad-contract.md:300` — `Current topology continuation`: distinguishes actual baseline52 from later integrated61.

Evidence: Current continuation verification maps each AC to the actual collected
source and60 extracted-guard controls, plus parsed conservation/32 refusal
mutations. Admission bodies/core/CI executions here:0. Limits: synthetic child,
pipe, result and clean-status fixtures do not prove hosted timing, Windows group
completion, global provider truth, live custody or new tooling qualification.
Root retains fresh direct-source matrix/ordinary gates and publication authority.
