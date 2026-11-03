---
title: 'Split runtime admission from core parallel contract CI'
type: 'chore'
created: '2026-11-03'
status: 'done'
baseline_commit: 'd03a52ce014f60c8e279f016e8cdd5790ca0d596'
context:
  - docs/process/parallel-auto-bmad-contract.md
  - docs/process/review-order.md
  - docs/process/agent-model-routing.md
---

## Intent and authority

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

## Suggested Review Order

Author: `/root/crm_runtime_route/runtime_admission_author`, gpt-6.1-sol High.
Refreshed against baseline `d03a52ce014f60c8e279f016e8cdd5790ca0d596` plus the
three allocated working-tree changes and the verification record above.

### Separate the observed cost while preserving the qualifying gate

The approved design separates the previously observed admission cost into its
own unchanged-budget matrix. The mandatory whole-matrix dependency preserves the
existing two qualifying check names; a failed/skipped admission cannot become
successful downstream coverage.

- `.github/workflows/auto-bmad-parallel.yml:29` — `runtime-admission:`: isolates the unchanged admission suite.
- `.github/workflows/auto-bmad-parallel.yml:66` — `python -X utf8 tests/maintenance/test_admit_story35_6_runtime.py -v`: preserves the exact native command.
- `.github/workflows/auto-bmad-parallel.yml:68` — `needs: runtime-admission`: requires both prerequisite OS children to succeed.

### Conserve execution authority and refusal behavior

Both jobs reuse the original setup, OS strategy and 15/30 budgets. Parsed baseline
comparison and targeted refusal mutations check that the split cannot omit a
command, weaken an exit path, change credentials/pins, or mask a failed matrix.

- `.github/workflows/auto-bmad-parallel.yml:35` — `timeout-minutes:`: retains the admission OS budgets.
- `.github/workflows/auto-bmad-parallel.yml:74` — `timeout-minutes:`: retains the core OS budgets.
- `.github/workflows/auto-bmad-parallel.yml:119` — `exit $testExit`: propagates the original routing native exit.

### Qualify the actual revision and actual four-job evidence

The contract distinguishes physical job placement, static method inventory and
native completed coverage. The baseline has 24 admission methods; the historical
38-pass command ran at a synthetic merge and the shared Windows job still canceled.
The approved integration route requires a genuine source descendant and fresh
direct-exact-reviewed-SHA evidence, without changing the adapter's two-name schema.

- `docs/process/parallel-auto-bmad-contract.md:263` — `Retain native source evidence`: requires all four same-revision native job records.
- `docs/process/parallel-auto-bmad-contract.md:272` — `For count provenance`: separates 140/24 source counts from native execution.
- `docs/process/parallel-auto-bmad-contract.md:281` — `must contain the integrated workflow`: preserves honest descendant and direct-SHA qualification.

Evidence: parsed candidate passed, 32 weakening mutations rejected and duplicate
YAML refused; see Verification for commands/hashes and AC mapping. Native Python
suites executed here: **0**; hosted runs observed/launched here: **0**. Limits:
local static/refusal checks do not emulate GitHub scheduling or establish actual
OS timing, suite completion, zero skips, provider truth or tooling/live admission.
Retain the existing failed native evidence and obtain all four real terminal job
logs at the intended exact executed revision through root's authorized route.
