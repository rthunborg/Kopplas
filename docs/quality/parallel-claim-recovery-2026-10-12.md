# Blocked parallel claim recovery — 2026-10-12

Author route: `gpt-6.1-sol`, **High**, for transactional integrity and ownership
recovery. This is tooling maintenance under the owner's recovery authorization;
it admits no new product scope. Independent High review and targeted re-review
completed, as recorded below. The author does not count this tooling review as another broad product
review or modify the product story's three completed rounds.

## Design and limits

Existing v1 offers no claim amendment/release: blocking retains ownership and
repair applies only after integration within existing declared paths. The new
coordinator-only `amend-blocked` operation runs from a separate maintenance
checkout. Active workflow files/digests and run approved base/spec pins stay
unchanged. A strict request adds exact filenames and necessary conflict domains
only, revalidates the old authorized checkpoint and ownership across the repository,
then transactionally revises the effective plan projection and increments the
existing generation. The next generation claim base becomes the fully scoped,
validated worker checkpoint, so the old helper enforces checkpoint ancestry.
The previous claim base/evidence remain in the immutable before snapshot. The
original initialized plan artifact is untouched.

Complete before/after plan and claim snapshots, request, stopped-writer receipt
and response enter an append-only audit table. Plan hash and generation use CAS;
identical request retries replay the receipt, while changed payloads and competing
stale requests refuse. Stale result evidence is retained in the original snapshot
and cleared from the current claim. Journals, Git history, review provenance and
required checks are preserved. Old-generation workers lose helper authority.

The coordinator must verify terminal source statuses for the assigned worker and
every write-capable delegate, then attest to the complete stopped-writer inventory.
The helper requires a hashed structured evidence artifact bound to the exact clean
checkpoint, and checks Git/workflow/claim facts twice. It cannot authenticate an
external status reference or discover an omitted delegate. Git/agent state cannot
participate in SQLite's transaction; keep writers stopped until the new assignment
is validated. Recovery is not a passing submission, workflow upgrade or gate bypass.

## Suggested Review Order

1. `parallel_run.py`: inspect `amend_blocked`, then `stopped_writers`, the audit
   schema/triggers and parser dispatch. Follow admission, exact path/conflict
   validation, before/after snapshots, CAS, rollback and retry behavior. Existing
   submission/integration validators retain their ordinary evidence requirements.
2. `test_parallel_cli.py`: the exact pinned-v1 pilot exercises initialization,
blocked checkpoint, recovery, stale-generation and divergent-result rejection, revised sibling
   conflict admission, fresh submission and verified integration. Its two-process
   competing amendments exercise the real entry point and shared SQLite lock.
3. `test_parallel_run.py`: inspect preservation, refusal, idempotency, rollback,
   audit immutability and fresh-final-head evidence cases. Shared fixtures avoid
   duplicate original test execution.
4. Read the recovery contract/operator/protocol instructions together, especially
   the complete stopped-writer attestation limit and unchanged active workflow.
   Compare `.agents`/`.claude` mirrors and the immutable old-helper fixture digest.

## Verification

All execution uses disposable `tempfile`-owned Git repositories/worktrees and
SQLite stores. Synthetic reviewer metadata in those fixtures is explicitly test
data, never evidence for the live story. No live store, active worktree, product
specification, services, machine permissions or managed resources were changed.

The backward-compatibility fixture is an exact copy of the original active pinned
v1 helper from `C:/Users/Rasmus/.codex/worktrees/dbe6/ElproSaas`, copied on
2026-10-12 before recovery adoption. Its LF-normalized SHA256 is
`c5f1a285745485ee0e0969e4d098ec6ac5d861d3c907af0c8fc08cee0a4558c0`.
The test pins that digest and mirror equality. `tests/fixtures/parallel_run_v1.py`
is immutable fixture source, not a supported production entry point; unittest
discovery does not select it as a test module. Do not update it when updating
the production helper.

Initial full-suite execution (55 tests; 3 failures, 5 errors) found a recovery bug: the post-CAS claim lookup was
passed an incomplete argument namespace without `repo`. It now reuses the complete
validated CLI arguments. A focused default-sandbox invocation separately refused
nested fixture creation in sandbox TEMP; legitimate bounded synthetic tests use
approved escalation, with no machine permission changes. A later test correctly
rejected stale check evidence but expected a different diagnostic; its regex now
matches `evidence commit mismatch`.

Independent High review then found that merely recording checkpoint SHA while
retaining the old active claim base allowed v1 to accept a divergent result that
discarded the reviewed checkpoint. The narrow correction validates the entire
old-base-to-checkpoint scope first, then explicitly reanchors the new generation
claim base to that checkpoint and audits both bases. An actual pinned-helper CLI
regression submits a clean divergent result and requires ancestry refusal; the
happy path still integrates all original checkpoint work.

Independent reviewer `/root/claim_recovery_independent` (`gpt-6.1-sol`, High)
completed targeted re-review of the P1 correction. The coordinator reported the
result: old ownership validates the checkpoint before reanchoring, full merged
story scope is preserved, and no regressions remain in the fix. This is tooling
delta review, not another broad review of the product story. The reviewed helper's
LF-normalized SHA256 is
`d9dde32cccd46d759e417e2f90847e0f8f84ec2df4a44f6c31d81d0512c51905`.

Final full-suite command (native exit 0):

```text
python -X utf8 -m unittest discover -s C:/Users/Rasmus/.codex/worktrees/parallel-claim-recovery/Kopplas/.agents/skills/auto-bmad/scripts/tests -p test_parallel*.py -v
```

Final frozen-fix result: **56 executed, 56 passed, 0 failed, 0 skipped** in
345.098 seconds. This includes real CLI concurrency, exact pinned-v1 compatibility,
checkpoint-discard refusal, all original helper cases and recovery refusal/audit
cases. The focused actual pinned-helper happy/divergent pair also passed 2/2 in
24.274 seconds (native exit 0). The earlier 55-case passing run preceded the P1
correction and does not substitute for these final results.

Separate mirror/coherence check passed **5/5** byte-identical pairs (helper, two
test modules, immutable v1 fixture and protocol reference); the fixture's pinned
LF-normalized digest also passed. No additional app/deployment/DB/browser coverage
is claimed from this tooling-only synthetic suite.
