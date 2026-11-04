# Running Auto-BMAD work in parallel

The parallel workflow is opt-in. Ordinary `/auto-bmad epic --epic N` remains sequential.
Use one coordinator chat and up to two worker chats in separate Git worktrees.
Schema 1 supports sprint stories and one epic PR. The restricted
schema-2 route below supports explicit stories/story-PR plans; synthetic
qualification is complete; operational/adoption gates remain. Both use one computer and one
shared Git repository; ordinary sequential behavior is unchanged.

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

Coordinators and workers follow [development completion policy](development-completion-policy.md). Claims and ownership remain mandatory. Worker submissions identify passed development evidence separately from owned deferred release validation. For schema 1, only the coordinator publishes the single final epic PR; separate prerequisite/split PR publication needs owner approval. The explicit schema-2 exception below reuses the existing per-story publication gates. Existing paused sessions are not resumed by this policy.

## Restricted stories / story-PR route (schema 2)

> **Synthetic qualification complete; operational/adoption gates remain.**
> See the [verification record](spec-parallel-pr-verification-2026-11-02.md).
> This is not a product run, source-adoption decision or admission authority;
> current product qualification remains coordinator-owned. Schema 1 is unchanged.


**IN:** explicitly reviewed stories-mode plans using original spec folders and
source IDs, isolated main-based worker branches, and one main-target PR per story.
The same SQLite owner/claim/generation authority reserves paths/domains and at most
two slots across both protocol versions. Pending PRs, blockers and merge verification
retain their reservations. The coordinator control branch is not the product base.
**DEFERRED:** product enrollment, automatic scheduling/fixer machinery and active-run
upgrades. This does not change existing sequential or schema-1 sessions.

Preparation prompt for a fresh coordinator:

> Prepare a read-only schema-2 parallel readiness plan for the explicitly approved
> spec folders. Resolve their original folder+ID identities with story_plan.py;
> pin committed SPEC.md, stories.yaml and individual story bytes on qualified main.
> Preserve source order/checkpoints and actual dependencies. Inspect all live
> ownership, reserve exact paths and report exclusions. Start no run or workers.

After reviewed plan/source adoption and authorization to execute, the explicit
route is `/auto-bmad epic --parallel --plan <absolute-plan.json>`. Workers still use
`/auto-bmad worker --assignment <absolute-assignment.json>`. Do not add `--spec`
auto-detection or invent sprint IDs for these assignments. Use the helper's current
subcommand help and [schema-2 contract](parallel-auto-bmad-contract.md#restricted-schema-2-stories--story-pr-contract).

A schema-2 worker reuses the existing per-story completion and checkpoint-PR route,
including durable publication intent, required labels/screenshots, exact-head
CI/review/visual wrappers and independent review. It owns only its own story
spec/state/report and declared paths. The coordinator owns every aggregate output,
ledger reconciliation and retrospective. A published PR-ready result is pending,
not integrated. Real prerequisites must be verified merged on current qualified
main before dependent work starts; disjoint files do not establish independence.

Only the coordinator prepares durable serialized merge intent, then uses the
existing authorized merge route and observes the same operation. It proves the
exact two-parent merge from prepared main and candidate, refreshes qualified main,
and obtains exact-main combined verification before releasing custody/reservations.
Unknown provider outcomes retain custody; inspect the original operation rather
than repeating it. Only all required verified main merges plus aggregate final
gates complete the run. There is no final epic product PR on this route.

### Product-pair qualification belongs to the coordinator

At the tooling planning checkpoint, 35.6/35.7 were blocked for enrollment. The
then-proposed mappings were `_bmad-output/specs/spec-design-35-6`, original ID
`35-6`, parser key `spec-design-35-6-35-6`, and the corresponding 35-7 mapping;
historical source tracking keys were `35-6-crm-record-journeys` and
`35-7-settings-and-manual-pricing`. These are planning context, not current pins.
Current product source qualification, approved amendments, checkpoint values,
dependency interpretation and exact ownership belong to the coordinator. Inspect
current approved sources rather than treating this historical snapshot as live
readiness evidence. This guide creates no adapters and grants no product admission
authority. Plain preparation requirements and green synthetic tooling tests do
not replace current approved source and admission evidence.

Manual setup: adopt reviewed tooling only in a fresh coordinator at a clean
checkpoint; materialize/approve and qualify actual source artifacts separately;
prepare exact plan/evidence outside tracked worker files. No global configuration,
customize.toml setting or managed-service launch is required by this documentation.

The bounded schema-2 source route accepts exactly one story entry per selected
folder (up to two explicitly planned folders). Terminal done_checkpoint is
preserved: stop after the own PR, retain pending status until verified main merge.
Unfulfilled spec_checkpoint approval and multi-entry continuation fail closed;
no new checkpoint scheduler or source flag rewrite is introduced.

## Bounded operating context

Apply the [bounded workflow operating policy](bounded-workflow-operating-policy.md)
on authorized fresh runs or reconciled resumes. Existing claims, legacy
reservations, qualification and completion gates remain authoritative.

Qualification evidence separates immutable source admission from synthetic-merge
integration; use the [CI responsibilities](../quality/ci.md#qualification-responsibilities-and-early-feedback)
and one named observer. Failed automatic checks cannot be replaced by direct-source
or same-tree success.
