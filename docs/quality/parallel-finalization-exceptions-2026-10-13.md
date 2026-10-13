# Quiesced finalization exceptions - 2026-10-13

Author route: `gpt-6.1-sol`, **High**, for transactional integrity and retained
run finalization authority. This is narrowly owner-authorized tooling maintenance
under the direct human decision of 2026-10-13; it adds no product scope and does
not count as another broad story review. Independent Sol High review is required
before adoption and is dispatched separately by the coordinator.

## Design and limits

`finalize-exceptions` is distinct from ordinary zero-skip finalization. It runs
only from a clean registered maintenance checkout at its independently reviewed
commit and executable digest, after recorded exact-tooling-SHA CI. The unchanged
live workflow digest, original plan/spec/base pins and claims remain intact.
The request binds the exact current plan hash and clean candidate HEAD, recorded
human decision/reason, complete terminal writer inventory including subsequent
repair authors/verifiers, all 40 named native receipts and independent High
adoption review over the complete request/hashes.

The hard-coded allowlist was read from the current Epic 20 sources without
modifying them: one physical recovery Storage loader case and the three full
Story 10.5 retry-safety identities. Exact file and full framework title must
match; count-only, wrong-file, renamed and duplicate skips refuse. Separate raw
Vitest evidence must execute and pass the exact recovery test. Native exit/state and raw cases reject failed, aborted and incomplete
reports. Playwright also rejects interrupted, expected-failure, flaky and retried
cases. Vitest native JSON omits retry counts; independent High adoption review
verifies retry-disabled invocation/configuration/log rather than claiming that
JSON proves first-attempt success. No Documents or unit-gate skip is waived. All actual skipped counts stay
in evidence/audit and receive no coverage credit.

Native receipts bind the acceptance candidate separately from the actual execution
checkout and Git tree. A GitHub merge checkout may qualify only with retained
candidate ancestry and an identical source tree, and its Git object must be
available for verification. External status/review/CI references remain data;
the coordinator and independent reviewer inspect source authority and terminal
statuses. The helper cannot discover an omitted unrecorded writer or authenticate
external receipts. Explicit complete inventory attestation and continued writer
silence protect the non-transactional Git/chat boundary.

One SQLite transaction CAS-finalizes the active run, records ordinary __final__
evidence and appends an immutable adoption audit with before run/plan/claims/
verifications and exact structured receipts/hashes. Same-token identical retries
replay once; changed payloads/competing tokens refuse. Rollback covers all three
writes. No plan/claim/journal/Git changes or live application is implied.

## Suggested Review Order

1. `parallel_run.py`: inspect `FINALIZATION_SKIPS`, `finalize_exceptions`, the
   unchanged `checks`/`combined_evidence`/ordinary finalize branch, and the
   append-only audit schema. Follow before snapshot, CAS, retained counts and
   transaction rollback/idempotency.
2. Inspect `final_receipt` and `framework_cases`: native exit/execution state,
   actual executor/candidate tree binding, raw artifact hashing, full physical
   identities/counts and separately executed recovery proof. Then inspect
   `final_writers` and maintenance checkout/review/CI identity checks.
3. `test_parallel_finalization.py`: synthetic clean maintenance checkout, strict
   default refusal, unchanged claim/plan/history assertions, actual CLI two-process
   contention, rollback/retry, stale identities/raw hashes/trees, writer omissions,
   missing recovery, and no Documents/unit gate exceptions. Reviewer metadata is
   synthetic fixture data, never evidence for the live run.
4. Read contract/operator/protocol instructions together. Confirm separate
   tooling/workflow pins, no automatic routing, source-status attestation limits,
   exact all-40 receipts and preserved failed history. Compare `.agents`/`.claude`
   mirrors and the untouched original v1 fixture.

## Verification

All test execution uses disposable tempfile-owned Git repositories/worktrees and
SQLite stores. No managed services, live store writes, application/config/env/
migration edits, live worktree changes or adoption was performed.

Initial focused execution (16 tests) hit a synthetic fixture issue: importing the
separately committed helper created untracked Python bytecode, correctly making
its maintenance checkout fail the clean-tree guard. Fixture-only `__pycache__`
ignore fixes that setup; production cleanliness remains strict. Further parser
and receipt guards now preserve actual CI executor/tree bindings and prohibit
secret environment values in retained native metadata.

Initial corrected focused result: **16 executed, 16 passed, 0 failed, 0 skipped**
in 231.975 seconds (native exit 0). This preceded the subsequent narrow findings
and is retained as earlier evidence rather than substituted for final results.

Independent reviewer `/root/finalization_exception_review` (`gpt-6.1-sol`, High)
found two reachable gaps during this tooling-only review: request-known final/
adoption verifiers were not included in the required stopped inventory, and
Vitest's native pending-suite counter was not checked. The author now requires
both reviewers stopped and `numPendingTestSuites == 0`; dedicated regressions
cover both. The native Playwright path reader also now interprets spec.file relative
to raw config.rootDir, including Linux CI paths on Windows without weakening exact
repository identities or source-tree binding. A historical successful native
Playwright report parsed 163 cases as format compatibility only, not current
candidate acceptance.

The reviewer's narrow follow-up executed **5 tests, 5 passed, 0 failed, 0 skipped**
in 64.052 seconds and reported no remaining concrete production-reachable defect
within the maintenance delta. The Vitest retry limitation is explicitly assigned
to independent review of argv, committed config, per-test retry overrides and log;
the JSON format cannot prove retry absence. This is no new broad story review.

The independently reviewed helper LF-normalized SHA256 is
`1d0d0092155db40d34dc6366548cd54a42d9cca99c063f1ebd8f295daff9269d`.
The reviewed finalization test SHA256 is
`01a78d630f17db2c800c4aacbed40979213f2df2572181a074d2a11a62461960`.
Both mirrors are byte-identical. The immutable original v1 fixture remains
`c5f1a285745485ee0e0969e4d098ec6ac5d861d3c907af0c8fc08cee0a4558c0`.

A pre-freeze full-suite run was already in flight while narrow parser/fixture fixes
were being made. It loaded earlier fixtures while its copied maintenance executable
picked up later source changes: **75 executed, 5 failures, 2 errors, 0 skips** in
617.475 seconds (native exit 1). Diagnostics were missing new config.rootDir/
pending-suite fixture fields and a live-checkout test pointing at a nonexistent
fixture directory. Those setup changes are included in the reviewed frozen test
digest above. That mixed-version run is retained as failed development evidence,
not acceptance of the frozen implementation. A subsequent targeted 6-case run
passed 5 and exposed the last fixture-directory diagnostic; the reviewed test
now points at its existing tracked workflow directory to reach the actual
separate-maintenance refusal guard.

Final frozen full-suite command (native exit **0**):

```text
python -X utf8 -m unittest discover -s C:/Users/Rasmus/.codex/worktrees/parallel-claim-recovery/Kopplas/.agents/skills/auto-bmad/scripts/tests -p test_parallel*.py -v
```

Result: **77 executed, 77 passed, 0 failed, 0 skipped**, in **638.935 seconds**.
The 56 prior helper/CLI cases and 21 new finalization/parser cases all pass against
the reviewed helper/test digests above. No reviewed core changed during this frozen
run. The observed local 10.65-minute total remains below the existing 15-minute CI
job budget; hosted matrix timing remains to be measured and no budget was expanded.

Final coherence/whitespace checks passed: **6/6** mirrored helper/test/fixture/
protocol pairs byte-identical, original v1 fixture digest preserved, and
`git diff --check` native exit 0. All author-owned writes are complete for coordinator
Git/PR handoff. Hosted exact-tooling-SHA CI and operational adoption remain separate.
No live finalization or fresh app/DB/browser coverage is claimed by these tooling
checks.


## CI coverage

The existing Auto-BMAD parallel contracts workflow enumerated the prior helper and
CLI modules, and general CI's focused Auto-BMAD command covers routing/process APIs;
neither implicitly discovered the new module. The coordinator authorized exactly
one additional `test_parallel_finalization.py -v` step in the existing contracts
job, for both Ubuntu and Windows. PR/main-push path triggers, required gates and
the 15-minute job budget stay unchanged. Independent reviewer `/root/finalization_exception_review` (Sol High) approved
the two-line workflow addition without findings. Its LF-normalized SHA256 is
`3c99511a589c8d87cf9b7f4fb557e9f0cd6b2117cf900d7004da918b88c68532`.
That enumeration-only edit justifies no local test rerun. Exact-tooling-SHA CI must pass
after publication before operational adoption; local tests do not claim CI passed.
