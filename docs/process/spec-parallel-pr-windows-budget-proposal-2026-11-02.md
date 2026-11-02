# Windows contracts job budget proposal

Status: the separately approved exact budget allocation is applied locally.
Root received the human's direct approval after the precise Windows-30/Ubuntu-15
request and dispatched only this one-field change. The approved proposal version
was SHA256 `a9c97675f54adb64a3ffb769011d2f9fed56395c75bb70af86c10f9a6c6325a9`.
This is separate from the earlier checkout exception. Consequential applied-diff
High review and a new exact-head hosted result remain gates; helper/test content
is unchanged.

## Observed deadline and completed evidence

At head `d470`, run `41441669454`, Windows job `125264784369`, the checkout fix
succeeded. Native hosted results then passed all 70 engine cases in 523.637
seconds and all 13 CLI cases in 146.113 seconds. Those 83 cases consumed 669.750
seconds, approximately 11.2 minutes, before the remaining compatibility work.

The job was cancelled after 15 minutes 8 seconds while the unchanged 21-case
finalization suite was running. Root retained GitHub's check annotation:

> The job has exceeded the maximum execution time of 15m0s

That native annotation establishes a job deadline, rather than an inference from
elapsed age. The interrupted finalization suite is not a passing suite. Routing
and process steps did not execute, so this run does not establish an all-Windows
contracts pass. Ubuntu completed successfully with its existing allocation.

The earlier checkout path failure and this explicit job deadline are two distinct
pipeline failures. The smallest next route is a bounded Windows allocation that
lets the unchanged serial checks finish. It does not replace assertions, remove
tests, introduce a parallel runner or blindly retry the failed candidate.

## Exact one-field proposal

Target: `.github/workflows/auto-bmad-parallel.yml:31`, under `jobs.contracts`.
Verified pre-change workflow raw SHA256:
`5e1c7525eb950c283c2cf2b869f62bbc1adabd6832741aa506d9a82d95bee27d`.

Before:

```yaml
    timeout-minutes: 15
```

After:

```yaml
    timeout-minutes: ${{ matrix.os == 'windows-latest' && 30 || 15 }}
```

The existing matrix remains exactly `[ubuntu-latest, windows-latest]`:

| Existing matrix value | Job budget |
| --- | --- |
| `windows-latest` | 30 minutes |
| `ubuntu-latest` | 15 minutes |

All commands, tests, assertions, action pins, permissions, dependencies, matrix
entries and concurrency rules remain unchanged. The approved checkout environment
projection is retained exactly. The helper, source paths and ownership protocol
are outside this proposal.

## Why a bounded 30 minutes

The prior complete local Windows engine, CLI and finalization runs took 791.190,
209.723 and 440.750 seconds respectively: 1441.663 seconds, approximately 24.0
minutes for those three suites alone. Thirty minutes provides about six minutes
beyond that measured total for checkout/setup and the remaining routing/process
checks. The current hosted engine/CLI receipts show faster execution, but still
used about 11.2 minutes before finalization and the later checks. The Ubuntu job
takes about a minute and retains its 15-minute ceiling.

Thirty minutes is a finite platform-specific allowance, not a guarantee of
completion or authorization for a later automatic increase. If the new candidate
still hits its deadline or fails a test, preserve its actual result and stop to
reconcile the concrete cause.

## Primary expression validation and limits

GitHub's context-availability table explicitly permits the `matrix` context for
`jobs.<job_id>.timeout-minutes`. See the
[official contexts table](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability).
The runner schema maps the job timeout to `number-strategy-context`, which allows
`matrix` and requires a number. See the
[job field schema](https://github.com/actions/runner/blob/main/src/Sdk/DTPipelines/workflow-v1.0.json#L51-L64)
and [number strategy schema](https://github.com/actions/runner/blob/main/src/Sdk/DTPipelines/workflow-v1.0.json#L503-L511).

The documented expression operators include equality, `&&` and `||`; numeric
literal 30 is truthy, so the Windows branch yields numeric 30 and the other
existing matrix entry yields numeric 15. This is a static inference from the
[official expression semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#operators),
checked against the two current matrix values. Both values are positive integer
job budgets. The
[job timeout documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idtimeout-minutes)
confirms the field controls automatic cancellation.

This validates the proposed context, type and branch selection from primary
sources. No hosted evaluation or 30-minute job was executed for this proposal.
Separate approval was received and only this exact field was changed. A new exact-head
CI result must show the finalization, routing and process steps actually executed
and passed before anyone claims complete Windows qualification. Root remains the
sole CI observer; this task issued no rerun or provider mutation.

## Applied-delta evidence

The approved proposal hash and pre-change workflow hash were checked before the
edit. Applied workflow raw SHA256 is
`c263ecb68d0211d7f5e66ba6c41d75ad415380b1920f01cb0f0745984fd4385f`.
Reversing the exact one-line replacement reproduces the original raw workflow
hash. Thus every other workflow byte, including the checkout overlay, commands,
per-test timeouts, assertions, steps, action pins, permissions, dependencies,
matrix and concurrency, is unchanged.

Helper raw SHA256 remains
`5eb5710e4965e5b443a2a394881f70342a13ada7772ae5b2b4a63edb1953a114`.
Engine and CLI test hashes remain
`d7a12af6d45f1310f3a098d6260e9a8de2cc8fbb4ea18c26ffe6d4851e97731f`
and `3bf3023c07c89dde13a73906530a8c0b461903580fef4aed28d0ac97ff214643`;
their mirrors match exactly. Earned local evidence for that unchanged content is
reused; no broad test retake was performed for this job-budget field. Root owns
Git, publication and CI observation. No claim, resource or provider action was
performed by this author task.

## Suggested Review Order

1. Check `.github/workflows/auto-bmad-parallel.yml:29` for the unchanged two-entry
   matrix and line 31, literal `timeout-minutes: ${{ matrix.os == 'windows-latest' && 30 || 15 }}`,
   for the exact applied replacement above. These stops were reread after the edit. The Windows-only
   30/Ubuntu-15 result must not expand the matrix or alter check commands.
2. Read the retained native deadline annotation and the 83 completed hosted cases
   separately from the interrupted/unexecuted suites. Keep the previous checkout
   fix's success distinct from the remaining complete-Windows gate.
3. Compare the bounded allocation with the measured 24.0-minute local three-suite
   total and primary expression evidence. Review only the exact one-field delta;
   the unchanged helper/test evidence does not need a new broad review.
4. Keep consequential applied-diff review and hosted execution as outstanding
   gates. The direct approval covered only this exact field. This author task
   performed no commit, push, resource or product claim, and does not declare the
   interrupted or unexecuted Windows checks passed.
