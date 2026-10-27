# Running Auto-BMAD work in parallel

The parallel workflow is opt-in. Ordinary `/auto-bmad epic --epic N` remains sequential.
Use one coordinator chat and up to two worker chats in separate Git worktrees.
This first version supports sprint stories, one computer and one shared Git repository.

## Existing sessions

As inspected on 2026-10-07:
- **Resume Epic 14 from checkpoint** is implementing/reviewing Story 14.3.
- **Run Auto-BMAD Epic 13** is repairing the background runner in
  `codex/runner-cursor-resilience` and validating PR #83. Its title is historical.

Leave both in their current checkouts. This tooling is developed separately on
`codex/parallel-auto-bmad-workflow`. Do not pull workflow changes into a running loop
mid-phase. Adopt at a clean checkpoint with no old delegates still writing, or after
the current epic finishes.

## What you ask the coordinator

After the tooling is integrated and you have a fresh coordinator checkout, start
Sol 6.1 Light or GPT-6 Astra Light with:

> Use Auto-BMAD to prepare a parallel readiness plan for Epic 15. Inspect current
> prerequisites and existing sessions. Keep their work excluded. Finalize ready
> story specs through the planning delegate, identify path and semantic conflicts,
> and run the read-only parallel planner. Start no workers yet. Explain which
> stories can run together and which must wait.

Change the epic number to the one you intend. This is preparation, not permission
to implement unapproved product scope. If only one story is ready, one worker is correct.
E15 and E16 are potential later concurrent workstreams once E14 is integrated, not
a preapproved parallel pair. Each epic still has its own coordinator and final gates;
repository-wide claims prevent cross-epic conflicts.

When the plan is ready:

> /auto-bmad epic --epic 15 --parallel --plan <absolute-path-to-plan.json>
> Run the approved plan with up to two workers. Give me the assignment artifacts
> and exact worktree paths for worker chats. Continue integration and epic gates
> as results become ready; retain existing merge approval rules.

Angle-bracket paths are placeholders the coordinator replaces. The skill instructions
drive this flow; the Python helper supplies deterministic checks and coordination.
No global setting turns every existing session parallel.

## What you ask each worker

Open a new Codex chat in the assigned worktree, select Sol 6.1 Light, and paste:

> /auto-bmad worker --assignment <absolute-path-to-assignment.json>
> Complete only this assignment using its pinned spec and ownership constraints.
> Escalate sensitive work to High automatically. Keep independent review and
> required tests, submit the committed result and evidence, and report blockers.

Use the second assignment in a second worktree/chat. Never point both chats at
C:/DEV/ElproSaas or the same worker folder. An ordinary chat opened in the project
root does not become isolated just because its title says "worker".

Alternatively, explicitly tell the coordinator to use internal subagents if you
prefer one visible chat. The same claims and worktree separation still apply.
Creating or messaging user-owned chats requires your authorization.

## Results and recovery

The coordinator owns merge order and aggregate state. A worker finishing does not
mean the story is integrated. The result passes through submission, integration
and combined verification before it is counted as landed. Epic finalization and
the normal tests/PR/CI gates happen after all required results.

If a worker blocks, let unrelated work continue. Ask the coordinator to inspect
status and explain the blocker. Do not open another session on the same story or
delete the ownership record. Heartbeat age alone does not prove a worker stopped.
For a coordinator restart, reopen its same integration worktree and ask it to resume
the run ID through the parallel helper, preserving the journal and completed work.

Containers/test data use the resource guard. Workers need separate mutable test
resources or exclusive test scheduling; worktrees alone do not isolate databases.
Nested reviewers and tests consume machine capacity, so start with two workers.

## Limits and adoption

The helper enforces declared paths/contracts and recorded Git facts; it cannot
discover every semantic dependency or prove that an agent reported a test honestly.
The coordinator and independent reviewers still assess scope and inspect evidence.
Do not edit the plan after initialization; changed scope requires deliberate
checkpoint/replanning and ownership reconciliation.

For exact files accidentally omitted from an otherwise unchanged approved story,
the coordinator may use the separately reviewed `amend-blocked` recovery operation
at a clean stopped-writer checkpoint. First retain the worker's real blocked result,
commit its authorized checkpoint, inspect terminal status for the worker and every
write-capable delegate, and record that evidence. Keep its original claim and
workflow installed. Invoke the recovery executable only from the separate tooling
checkout, with the original coordinator identity and exact current checkpoint
HEADs; do not upgrade an active worker's workflow.

The operation explicitly revises effective ownership through an append-only audit,
preserves the original plan/spec pins and increments the existing claim generation.
The new generation's submission base is its validated checkpoint; the old base
and evidence remain in the audit. This enforces checkpoint ancestry through the
unchanged pinned helper. Final checks still cover the whole final commit.
It admits exact additional filenames and necessary conflict domains, not new
product scope, broader directory ownership or weaker gates. Give the worker the
new assignment only after the command succeeds and a fresh heartbeat validates it.
Keep completed review rounds and failed-check history; review the new delta and
unresolved serious findings, then execute all required final checks. See the
[recovery contract](parallel-auto-bmad-contract.md#additive-blocked-claim-recovery)
for request fields, quiescence evidence, refusal conditions and retry semantics.

This is a local coordination system, not a cross-machine scheduler. Workflow
installation, product pilot results and measured speedup must be reported separately.
The synthetic Git test suite validates mechanics without touching the live epics.

On Windows, use `python -X utf8` for helper help/output when the shell encoding cannot display Unicode.

Technical procedure:
[parallel epic protocol](../../.agents/skills/auto-bmad/references/parallel-epic.md)
and the [CLI and evidence contract](parallel-auto-bmad-contract.md).


## Reviewed finalization of identified inherited skips

The owner-authorized `finalize-exceptions` maintenance command supports only the
one isolated physical recovery-loader skip and the three Story 10.5 retry-safety
skips listed in the [exact finalization contract](parallel-auto-bmad-contract.md#quiesced-inherited-skip-finalization-maintenance-only).
It preserves real skipped counts and gives those bodies no coverage credit.
Every Documents gate and all other required gates must pass with zero skips;
failed, aborted and stale receipts remain failures.

After the maintenance change has independent Sol High review and passing CI, freeze
the clean final candidate and stop the complete writer inventory, including later
repair authors/verifiers. Retain exact file/full-test identities and raw framework
JSON/native receipts for all 40 gates; separately execute the physical recovery
proof. Bind the reviewed tooling commit/hash separately from the live workflow pin,
human decision and reason, current plan hash, exact candidate and independent High
adoption review. Invoke only from the clean separate maintenance checkout using the
existing coordinator identity. Do not upgrade live helpers or edit SQLite manually.
An honest CI merge-checkout receipt names its actual commit and identical Git tree;
it must not pretend it ran from the literal PR branch checkout.

Save the full adoption response and retain source receipts. Identical uncertain
retries reuse the exact token/payload; changed payloads require fresh review and
cannot replace completed finalization. The helper atomically audits adoption and
finalizes, but does not publish, merge or claim that skipped tests executed.
Implementation/synthetic verification alone does not apply this operation live.

## Development completion — owner decision 2026-10-19

Coordinators and workers follow [development completion policy](development-completion-policy.md). Claims and ownership remain mandatory. Worker submissions identify passed development evidence separately from owned deferred release validation. Only the coordinator publishes the single final epic PR; separate prerequisite/split PR publication needs owner approval. Existing paused sessions are not resumed by this policy.
