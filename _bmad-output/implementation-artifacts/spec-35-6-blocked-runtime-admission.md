---
title: '35.6 blocked runtime ownership admission'
type: 'chore'
created: '2026-11-02'
status: 'done'
baseline_commit: '824bed4a92eb388db669ffb60492a7b1dd9fc038'
review_loop_iteration: 0
context:
  - docs/process/review-order.md
  - docs/process/parallel-auto-bmad-contract.md
  - docs/process/agent-model-routing.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 35.6 needs the existing proxy for required list-read/retry CI proof; its blocked schema-2 claim excludes `playwright.config.ts` and has no amendment API.

**Approach:** Add a separately reviewed adapter outside the pinned workflow tree, admitting only this runtime file to the exact blocked assignment through existing validators, transaction and append-only audit. The unchanged worker helper consumes its new generation.

## Boundaries & Constraints

**Always:** Preserve run/coordinator/worker/branch/worktree/source identities, plan base/spec/workflow pins, checks, risks, review history and PR identity. Require clean registered checkouts, exact blocked checkpoint, stopped claim writers, fresh reservations, independent Sol High tooling/admission review and exact-tooling-SHA CI. Validate the old claim diff against its eleven paths first. Author/review effort is High; root retains live mutation/publication custody.

**Ask First:** Different stories, further files, broader recovery or product behavior need new owner scope. The minimum runtime/recovery work and required verification are already approved.

**Never:** Edit installed/mirrored helpers, pins, product/runtime/producer/dependency/environment files or live claims. No claim release/transfer/retirement, fake integration, weakened checks, manual SQLite edits, premature writer restart or maintenance-code copy into live checkouts.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Qualified admission | Exact blocked 35.6 run; only `playwright.config.ts`; valid bound evidence | One atomic plan update, generation increment and checkpoint reanchor; full audit and schema-2 assignment | No Git mutation |
| Unqualified request | Wrong identity/path, unreviewed tooling, stale checkpoint/inventory, live writer, custody, conflicts or prior publication submission | Refuse before mutation | Preserve original plan/claim/audit |
| Retry | Same request token and identical payload | Return immutable historical receipt | Changed payload refuses; heartbeat still required |
| Transaction failure | Failure after attempted CAS | Roll back plan, claim and audit together | Preserve Git history |

</frozen-after-approval>

## Code Map

- `.agents/skills/auto-bmad/scripts/parallel_run.py` — read-only validators, `database`, `stopped_writers`, `story_pr_assignment` and append-only `claim_amendments`; `WORKFLOW_PATHS` excludes this adapter/CI. Use old authoritative plan for anchor scans; separately test revised ownership.
- `.agents/skills/auto-bmad/scripts/state_update.py` — reuse `load_state` for immutable publication identity and confirmed durable operation.
- `docs/process/parallel-auto-bmad-contract.md` — preserve ordinary schema-2 legacy-maintenance refusal; document the separately reviewed, exact-story exception.
- `.github/workflows/auto-bmad-parallel.yml` — existing Windows/Linux contract CI; add only adapter path triggers and its focused command.
- Live store/artifacts remain read-only. Historical worker checkpoint: `54ec501da6ba7b756fe8013c0f71ac123f7a8a59`; execution must inspect actual current pins.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/maintenance/admit_story35_6_runtime.py` — implement a strict standalone request/CLI, tooling qualification, bound ownership/adoption evidence, old-scope validation, collision rechecks and atomic audited readmission.
- [x] `tests/maintenance/test_admit_story35_6_runtime.py` — reuse the existing synthetic Git/SQLite fixture and test successful continuation with the unchanged helper plus refusal, rollback, replay and stale-generation cases.
- [x] `.github/workflows/auto-bmad-parallel.yml` — run focused adapter tests on both existing operating systems without changing existing jobs.
- [x] `docs/process/parallel-auto-bmad-contract.md` and this spec — record exact request/custody sequence, evidence limitations, review order and actual verification.

**Acceptance Criteria:**
- Given qualified tooling and an independently reviewed complete request, when admission succeeds, then only the exact runtime file/domain are added and generation advances once with the same worker checkpoint as its new submission base.
- Given a successful admission, when the original pinned helper heartbeats/submits, then the new generation is accepted, the old generation is rejected, and all ordinary current-result checks remain required.
- Given concurrent producer or other ownership evidence, when a path/domain conflict or uncertain writer status exists, then admission refuses without changing its reservation.
- Given synthetic qualification, when reporting readiness, then distinguish it from live admission and product/runtime/CI acceptance; no live operation is implied.

## Spec Change Log

- 2026-11-02: implemented the approved standalone adapter, focused contracts and
  operational request documentation. Frozen intent and ACs remain unchanged;
  this is tooling for review, with no live admission or product proof performed.
- 2026-11-02, round 1 bounded patch: excluded every stopped writer from review,
  retained lossless raw evidence, parsed captured request bytes once, and used
  each foreign plan's own registered authoritative checkout. Corrected masked
  refusal tests and added direct review, byte-preservation, foreign-source and
  later-main continuation regressions. Frozen intent and helpers remain unchanged.
- 2026-11-02, PR128 Windows CI follow-up: reproduced a noncanonical tempfile
  root rejected by the unchanged qualifier. Corrected only fixture injection to
  mirror production's resolved root, with real identity-refusal regression
  cases. Production adapter, workflow, helpers and frozen intent are unchanged.

## Design Notes

Owner approval was conveyed by root: "Alright, if it is needed, I approve it. Make sure that both sessions are proceeding." Independent Sol High design review `/root/crm_runtime_route/runtime_admission_design_review` approved the clarified route before implementation. Renderer provenance: root's successful snapshot `a445218b1fb3096b3156`, rendered at primary root; this task's project/artifact root is the separate tooling checkout. This is an ordinary maintenance task, not product Story35.6 or an aggregate story; leave sprint status unset.

Strict identity is `e35-6-20261102` / `spec-design-35-6-35-6`, repository `rthunborg/Kopplas`, original source folder/ID, existing PR127. Add exactly `playwright.config.ts` and `test:general-browser-runtime`; reject arbitrary additions. Adapter loads only its own unchanged helper; require its clean registered tooling HEAD, review/tool hash and both existing contract-OS CI jobs at that SHA, already ancestor of qualified main. Keep workflow bytes/digest unchanged.

Require blocked claim evidence/result/integration null, no target publication submission/journal/verification, and no repository prepared integration or merge custody. Bind raw own state plus provider observation to immutable identity, confirmed publication operation, same open PR/main/branch and published-head ancestry; unknown/in-flight/ambiguous operations refuse.

The raw coordinator-attested ownership inventory binds the actual registered worktree set/common Git identity, current store plans/claims and each live reservation's scope/head/source status. Validate all known claim/legacy ownership and independence; active nonconflicting producer is allowed. Independent High admission review binds the entire strict request and raw hashes. Recheck inventory/store facts, stopped writers, Git heads and all bound bytes immediately before CAS. External status authenticity remains coordinator responsibility. Preserve complete before/after snapshots in the existing audit; identical retry is only a historical receipt.

## Verification

**Commands:**
- `python -X utf8 tests/maintenance/test_admit_story35_6_runtime.py -v` — synthetic success and fail-closed matrix, zero skips.
- `python -X utf8 .agents/skills/auto-bmad/scripts/tests/test_parallel_run.py -v` — unchanged helper regression contract, zero skips.
- `node scripts/verify/check-review-order.mjs _bmad-output/implementation-artifacts/spec-35-6-blocked-runtime-admission.md` — verified author trail after implementation.
- `git diff --check` — no whitespace errors; verify pinned workflow bytes remain unchanged.

**Executed by the implementation author, 2026-11-02:**

- Final working tree based on verified HEAD
  `824bed4a92eb388db669ffb60492a7b1dd9fc038`; no author commit/push or live
  claim/provider operation. The five owned files are the adapter, its tests,
  the contract workflow, contract documentation and this spec.
- Initial pre-review focused command: **18 passed, 0 failed, 0 skipped**, native exit 0,
  476.230s. Native log retained outside tracked files at
  `C:/DEV/Kopplas/tmp/private/e35-admission-focused-final.log`.
- Unchanged helper command above: **70 passed, 0 failed, 0 skipped**, native
  exit 0, 705.883s. This includes schema-1 recovery and schema-2 custody/source
  regressions; no installed/mirrored validator was edited or patched.
- `python -X utf8 scripts/maintenance/admit_story35_6_runtime.py --help`:
  native exit 0; strict JSON error parser uses the existing helper parser.
- `git diff --check`: passed. Exact comparison of every `WORKFLOW_PATHS` entry
  against the baseline produced no diff. Read-only helper `version` returned
  unchanged digest `f2463d540f4c2d0829224eb48d619e772a8916334c9f80fa8704b1309e14b612`.
- Initial pre-review trail checker: native exit 0, one section, 14 references,
  zero errors; superseded by the refreshed round-1 trail below.
- Windows sandbox default TEMP initially denied fixture-directory creation;
  final executions used workspace-owned TEMP/TMP
  `C:/DEV/Kopplas/tmp/private/e35-admission-test-temp`. The first refusal-suite
  attempt exposed a fixture-only exception-class mismatch from duplicate helper
  imports; the final suite uses both original helper imports without validator
  substitution. These earlier attempts are not passing evidence.

**Round-1 fix verification, executed by the same author:**

- Final focused command above: **23 passed, 0 failed, 0 skipped**, native exit 0,
  625.108s. Native log:
  `C:/DEV/Kopplas/tmp/private/e35-admission-r1-final.log`.
- Selected the complete focused suite because the fixes affect request parsing,
  both reviews, artifact capture, inventory validation and audit construction.
  Five new tests cover the direct valid-digest admission-review matrix (including
  a stopped nested fixer), BOM byte reconstruction, single request parsing,
  foreign-source authority/independence, and tooling landing on later main while
  blocked live checkouts retain their HEADs. Existing old-scope, custody and
  publication tests now refresh bound evidence and assert the specific guard.
- A preparatory four-test selection passed three tests and had one foreign
  fixture setup error: its native `init` used the target checkout instead of
  the foreign authority. Corrected the fixture invocation; the final 23-test
  run above includes and passes that test. The failed preparatory log remains
  at `C:/DEV/Kopplas/tmp/private/e35-admission-r1-targeted.log`.
- Reused the actual **70/70, zero-skip** helper result above; did not repeat it.
  A fresh comparison of every pinned workflow path against the baseline is
  empty. No installed/mirrored helper byte changed.
- Reviewed source raw SHA256:
  `b75613d101bb9a03308a1545945ec8099a9c97a8f9d0be4a70b5995c66d5b22e`;
  test raw SHA256:
  `2bfde1678d9bcc41a93aad7c099203128019963c1f53331c57533530af4388a2`.
  These match the parent's two narrow High fix-review targets. Parent reported
  no source findings or verification gaps, conditional on the terminal 23-test
  evidence; this author separately executed the tests above.
- Refreshed review-order checker: native exit 0, exactly one author section,
  **17 verified path/line/literal stops, zero errors**. `git diff --check` passed.

**PR128 Windows fixture follow-up, executed by the same author:**

- Preserved the original CI failure: run `41496309269`, Windows job
  `125452082150`, Python **3.12.10**, focused **23 tests: 5 failures, 8 errors,
  0 skips**, 395.839s. All consequential traces converge on the unchanged
  `qualify_tooling` identity refusal. Archived native log:
  `C:/DEV/Kopplas/tmp/private/e35-runtime-recovery/tmp/private/admission-review/pr128-windows-job-125452082150.log`,
  raw SHA256 `e178c3e776f1529ed58a06746275465ca96e64ba62928bb9f6662ef6510ceba7`.
- Before fixing, reproduced the exact refusal on available native Windows
  Python **3.14.7**, using `GetShortPathNameW` for an owned temporary directory.
  The fixture injected `E35-AD~1/.../c`, while Git/top resolution returned
  `e35-admission-test-temp/.../c`: root equality was false, registered checkout
  and common-Git checks were both true. Production already derives `ROOT`
  through `Path(__file__).resolve()`; its constructor contract was missing from
  the fixture injection. The CI log does not print its TEMP/root paths, so its
  exact remote alias spelling remains unobserved; the native reproduction
  isolates the matching failed predicate and mechanism.
- Fixed `tooling_identity_patches` to resolve its input. The production adapter,
  its equality/registration/common-Git/separation/cleanliness/exact-SHA guards,
  and every pinned helper byte remain unchanged. The new portable regression
  also proves raw aliases, nested non-root inputs, a real unrelated Git common
  directory, and live control checkout inputs still refuse.
- Targeted alias regression plus unchanged-helper continuation: **2 passed,
  0 failed, 0 skipped**, native exit 0, 63.907s. Log:
  `C:/DEV/Kopplas/tmp/private/e35-admission-windows-alias-targeted.log`.
- Final full focused command above: **24 passed, 0 failed, 0 skipped**, native
  exit 0, 626.974s. Ran once after the fixture fix, with process TEMP/TMP set to
  the real native `E35-AD~1` alias. Log:
  `C:/DEV/Kopplas/tmp/private/e35-admission-windows-alias-final.log`;
  native interpreter/temp context:
  `C:/DEV/Kopplas/tmp/private/e35-admission-windows-alias-context.json`.
  This exercises every focused case under the previously mismatched input shape.
- Retained the archived Windows helper phase's actual **70 passed, 0 failed,
  0 skipped**, 573.425s, native `OK`; no helper rerun. No CI/provider polling,
  rerun, workflow timeout adjustment, system setting or test skip was used.
- Unchanged adapter raw SHA256:
  `b75613d101bb9a03308a1545945ec8099a9c97a8f9d0be4a70b5995c66d5b22e`;
  updated test raw SHA256:
  `0c64de8815bef7d9a08de6f7ecf41ec366973e3ad50880be60edc07f65437e9d`.
  Execution used the fixture-fix working tree based on committed
  `08c320f693633b02a57a3962328d44142a66b007`. No author commit/push or live
  admission was performed; targeted High fix review and subsequent CI remain
  parent-owned gates.
- Follow-up author-trail checker: native exit 0, exactly one author section,
  **18 verified references, zero errors**. `git diff --check` passed.

Limits: disposable Git/SQLite fixtures exercise the real unchanged helper
validators, with synthetic CI/provider/reviewer/status records. Tooling checkout
location is redirected only inside the fixture; crash, request-read and final-evidence-race
hooks are synthetic. Passing focused proof is local Windows qualification;
the original failed CI receipt remains distinct. The new Windows Python 3.12
job and both exact-tooling-SHA contract jobs must still qualify through the
parent's CI observation. Independent Sol High tooling review, main
ancestry, current live inventory/admission review, live root admission, fresh
heartbeat, and all product runtime/list-read/retry/CI gates remain separate.
External status/CI authenticity and continued writer silence remain coordinator
responsibilities. No application, runtime configuration, environment, dependency,
producer, live claim, or pinned workflow file was changed.
Continuation still requires the existing durable publication/`pr_strategy`
wrapper to retain PR identity. The original helper's direct-submit boundary is
unchanged; this patch adds no replacement publication authority or PR128 gate.

## Suggested Review Order

Author: `/root/crm_runtime_route/runtime_admission_author`, implementation author
at Sol High for claim ownership and transactional integrity.
Refreshed after the PR128 Windows fixture follow-up against its working tree
based on `08c320f693633b02a57a3962328d44142a66b007`. Earlier execution against
baseline `824bed4a92eb388db669ffb60492a7b1dd9fc038` remains historical evidence above.

### Admit only the approved operator request

The frozen intent requires a separate exact-story exception while preserving
the installed schema-2 refusal. I fixed the approved run/source/PR and eleven
original paths in this adapter, leaving transient checkpoints and current
owner/worker identities bound to inspected store facts and the reviewed request.
The Windows follow-up corrects the fixture to mirror production's resolved-root
constructor; the production identity guard is unchanged.

- `docs/process/parallel-auto-bmad-contract.md:233` — `## Exact Story 35.6 schema-2 runtime admission`: defines operator custody and the exact exception.
- `scripts/maintenance/admit_story35_6_runtime.py:273` — `def admit(a):`: checks the strict reviewed payload and exact assignment.
- `scripts/maintenance/admit_story35_6_runtime.py:40` — `OLD_PATHS = [`: fixes the original eleven-path ownership boundary.
- `tests/maintenance/test_admit_story35_6_runtime.py:69` — `def tooling_identity_patches`: supplies the same resolved root contract as production.

### Bind tooling, publication and concurrent ownership facts

The approved design requires unchanged local helpers and independently inspected
evidence. The adapter qualifies its own clean tooling commit, binds actual own
state to confirmed PR127 publication, and re-derives the complete inventory.
Round 1 corrects foreign-plan validation to use its own authoritative checkout;
source independence remains required. External authenticity remains coordinator-owned.

- `scripts/maintenance/admit_story35_6_runtime.py:97` — `def qualify_tooling`: requires reviewed tooling, both OS jobs and qualified-main ancestry.
- `scripts/maintenance/admit_story35_6_runtime.py:227` — `def publication`: binds immutable state, durable operation and provider head ancestry.
- `scripts/maintenance/admit_story35_6_runtime.py:147` — `def ownership`: checks authoritative foreign sources, independence and old-plan anchor recognition.

### Keep reviewed bytes and reviewer independence intact

Round 1 fixes the request's second parsing read and the text audit's BOM loss.
The request now parses its captured bytes once; every referenced artifact,
including stopped-writer source, is retained losslessly. Both reviews exclude
the entire inventoried writer set, including nested fixers.

- `scripts/maintenance/admit_story35_6_runtime.py:67` — `def parse_raw_json`: rejects duplicates while parsing captured bytes.
- `scripts/maintenance/admit_story35_6_runtime.py:342` — `forbidden =`: excludes every stopped writer and coordinator from review.
- `scripts/maintenance/admit_story35_6_runtime.py:367` — `base64.b64encode`: retains all raw artifact bytes without BOM loss.

### Preserve checkpoint history in one audited transaction

I reused the existing transaction and append-only audit because the approved
route forbids manual store edits and workflow replacement. Old ownership is
validated before revision; new-generation base anchoring lets the original
helper preserve the reviewed checkpoint while enforcing fresh final-result gates.

- `scripts/maintenance/admit_story35_6_runtime.py:330` — `engine.validate_diff`: validates the checkpoint against original ownership first.
- `scripts/maintenance/admit_story35_6_runtime.py:350` — `store_snapshot(db, repo)`: rechecks ownership immediately before mutation.
- `scripts/maintenance/admit_story35_6_runtime.py:357` — `UPDATE runs`: starts the guarded plan/claim compare-and-swap sequence.
- `scripts/maintenance/admit_story35_6_runtime.py:368` — `INSERT INTO claim_amendments`: retains complete before/after snapshots and bound evidence.

### Review evidence as synthetic ownership qualification

AC1/AC2 map to exact additions, pin preservation, checkpoint reanchoring,
unchanged-helper heartbeat/submission and zero-skip enforcement; stale
generations refuse. AC3 maps to actual competing claims, active-producer
reservation conflicts and uncertain writer/status checks. Rollback and replay
assertions protect the transaction and immutable historical receipt; AC4 is
the explicit operational/evidence limit above. Round-1 negative cases use fresh
bound evidence and named guard refusals, avoiding stale-evidence masking.
The Windows follow-up reproduces noncanonical identity input and tests real
registration/common-Git/separation refusals before accepting the resolved fixture.

- `tests/maintenance/test_admit_story35_6_runtime.py:146` — `test_fixture_canonicalizes_tooling_alias_without_weakening_identity_guards`: proves alias normalization and retained real identity refusals.
- `tests/maintenance/test_admit_story35_6_runtime.py:356` — `test_admission_review_rejects_every_writer_and_invalid_review_field`: isolates review independence and every required review field.
- `tests/maintenance/test_admit_story35_6_runtime.py:196` — `test_all_raw_audit_artifacts_reconstruct_exact_bytes_including_bom`: reconstructs all raw hashes, including stopped-writer source.
- `tests/maintenance/test_admit_story35_6_runtime.py:485` — `test_foreign_schema2_source_uses_its_authoritative_checkout_and_independence`: proves foreign-source acceptance and retained independence refusal.

Evidence: current native Windows alias-focused 24/24 and targeted 2/2 passed;
the unchanged helper's archived Windows 70/70 pass is retained, all with zero skips.
The original PR128 Windows 23-test CI failure remains recorded separately;
see Verification for commands, native counts, revision and retained log. CI
records, provider observations and reviewer/status identities in fixtures are
synthetic. No live admission, product/P6 proof or remote CI result is implied.
