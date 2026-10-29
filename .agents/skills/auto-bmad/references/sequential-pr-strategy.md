# Sequential epic publication — owner decision 2026-10-28

This project extension overrides conflicting one-PR, stop-on-pending, early-done
and branch-deletion instructions **only for fresh ordinary sequential epics**.
Single-story invocations and explicit parallel runs retain their existing route.
An existing anchor without `pr_strategy_json` retains the old epic route forever;
never hot-upgrade 35.2, an adopted existing run, or another active loop.

## E0 / E1: assess and pin before implementation

Delegate inspection of the approved epic/story requirements, design amendments,
acceptance criteria and actual intended visible behavior. Assess every ordered
story (including backend prerequisites). A filename/diff classifier is insufficient.
Produce `assessment` with `source_revision`, `approved_scope`, ordered `stories`:
`key`, boolean `visible_ui`, `scope_rationale`, earlier-story `dependencies`,
`dependency_rationale`, boolean `independent_of_pending`. Record source checkpoints
and permission to skip ahead in the assessment too; absence means no permission.
Uncertain approval/scope/dependencies must be resolved before selecting a route.

Run `python {skill-root}/scripts/pr_strategy.py select <input.json>` with existing
anchor contents as `state` and `fresh: true` only when no anchor exists. Persist
the emitted `patch` in E1's existing `state_update.py init` payload, once. Any UI
selects `story-pr` for **every** required story, including backend-only stories.
No UI selects the existing `epic-pr` route. Resume uses `fresh: false`, rechecks
the same source assessment, and never overwrites the selected mode. Drift stops
incompatible publication for explicit reassessment; no silent mode switching.

## E5: isolated sequential work, checkpoint publication, then selection

For `story-pr`, retain the anchor as coordinator state; it is not a product
integration branch. E2 runs once. Run `next` with the capsule, authoritative
story-state observations and actual refreshed main ancestors. Preserve source
order. Skip a pending story only when approved source permits it and the chosen
story's recorded independence is established. Required dependencies must have a
verified merge revision reachable on current main; `done`, implemented,
`stories_landed`, an open PR or green branch CI never satisfies this condition.
Do not stack PRs or copy/cherry-pick unmerged prerequisite code.

Before each new story, qualify refreshed `origin/main` under existing deployment
and CI policy. Use a separate managed worktree and `codex/` story branch from
that exact revision, targeting main. Persist an immutable identity with helper
`identity`: `story_key`, `branch`, absolute `worktree`, `base_branch: main`,
`base_revision`. Apply its patch to the existing story state **before launch**.
Persist the same identity on the anchor as flat story-key references/JSON scalar;
do not create a second tracking framework. A stopped create/push/PR request is
reconciled by exact branch/worktree/head/PR identity before any retry. Reuse the
existing artifacts and first incomplete phase; do not initialize twice.

Acquire the existing shared-claim authority/exclusive writer coordination before
each implementation or fixer handoff. YAML/heartbeat age is not ownership.
Implementation, feedback fixer and coordinator never write the same branch
concurrently. Reconcile uncertain ownership instead of taking over. Keep fixer
eligibility, protected paths, human decisions, attempt caps and current-head
checks unchanged; a label is not permission to bypass any of them.

Reuse Phases 3–7, their checkpoints and review routing in the story's worktree.
Retain source `spec_checkpoint` / `done_checkpoint` semantics verbatim; source
files (`stories.yaml` included) are not rewritten to reorder or relax them.
Checkpoint publication can occur while human/visual/merge gates are pending:
record `development_state: checkpoint_pending`, never claim development complete
until existing completion/visual wrappers pass. Track separately on existing
story state: `development_state`, `publication_state`, `pr_url`, `candidate_revision`,
`ci_revision`/`ci_status`, `review_revision`/`review_state`,
`visual_revision`/`visual_state`, `merge_state`/`merge_revision` and blocker reason.
Use `development_state: complete` only after that gate; published pending work
is recognized separately during selection (see helper's pending rule).

Publish one checkpoint PR per story via existing Git/PR procedure and run helper
`publish` before reporting it published. All actual frontend PRs get verified
`agent-fix`, durable immutable revision-bound screenshots labeled screen, state,
viewport, revision and implemented/reference/synthetic kind. Publish evidence
through existing frontend package/controller process; a local path is not durable
PR evidence. Backend-only stories require justified visual N/A, no fake images.
Publication may be draft pending acceptance; it is never acceptance or completion.
Record checkpoint and phase outcomes atomically through existing state_update.
After checkpoint publication, continue the next eligible independent story.
Return a truthful pending summary when none is eligible; don't end the epic.

## Resume, merge and epic closing

Refresh each known PR's actual head, labels, CI, reviews, visual-controller result
and merge result. Invalidate stale revision-specific evidence after any fix or
head movement, refresh screenshots and route fresh exact-head coordinator review
in a fresh chat. Never count old screenshots/green CI against a new head. Keep
pending states resumable; no anchor/story `status: done` or Phase 9 completion
marker while required merges remain. `stories_landed` is legacy bookkeeping,
not merge authority. Reconcile PR metadata writes lost to interruption.

Before merge, run helper `merge`, then all existing operational validators and
authorization gates: development delivery, exact-head CI, fresh coordinator
review, applicable acceptance and separate merge authorization. Visual frontend
acceptance must be operational/controller-verified or authenticated manual
acceptance under current policy. An author's JSON cannot grant it. Check production
auto-deploy separately; this strategy grants no merge or deployment authorization.
Use merge commits and retain branches. Record observed merge SHA only after
GitHub confirms merge and Git proves reachability on qualified main.

After **all required merges**, run E8 integration trace, reconciliation and retro
against their integrated qualified main revision (new integration branch/PR if
artifacts require publication, with the same review/CI/merge gates). Existing
done flips and delivery gate remain mandatory; don't use pre-retro batch flips
to declare this route complete early. `complete` validates merge ancestry and
trace/reconcile/retro/delivery obligations before E_final/anchor done; only then
render epic completion. Keep development, CI, visual, merge and release claims
separate. A release-evidence deferral never waives this route's operational visual
acceptance or required merges.

All helper commands read a JSON snapshot and emit advisory results/patches;
only existing `state_update.py` writes YAML. Verify observations independently,
then apply patches with exclusive ownership. Do not treat helper booleans as
credentials, gate verdicts or provider enforcement. Reinstall reconciliation:
preserve this project-owned extension and its `.agents`/`.claude` mirrors;
Auto-BMAD has no exposed customize.toml for this strategy, so no invented TOML
keys, global skill edits or BMAD core edits are used.

### Concrete ownership and external-operation reconciliation

Use the already-created epic coordinator worktree/branch as the canonical control
context for `<output>/auto-bmad/state/epic/<anchor>.yaml` and aggregate receipts.
Story states are initialized there before their worktree exists; mirror only the
selected story's state into its new main-based worktree, never aggregate sibling
state or pending sprint snapshots. The control branch is not a product PR base.
Canonical coordinator-owned receipts are imported by exact revision, not by whole
file copying. Identity fields include `run_id` and `repository`; persist observed
`pr_number`, `pr_url` and `candidate_revision` after reconciliation.

Do not call the opt-in parallel claim API for this sequential route. Before each
writer handoff inspect current chat/worktree inventory, existing parallel claims
read-only and active fixer Actions runs for the exact PR/head. An unresolved
writer/conflicting claim blocks this story. Reserve the exact branch for the
named coordinator and one foreground implementation delegate; no concurrent
coordinator adoption is supported. Do not infer ownership from copied state or
age. Before author work on an opted-in PR, prevent a new fixer attempt using the
existing documented opt-out, drain/confirm completion of active exact-PR fixer
runs, then hand off the sole writer. Restore `agent-fix` and verify after the
author checkpoint is stable; never reset attempt history or manufacture feedback.
If safe exclusive ownership cannot be established, park with a named blocker.

Before create-worktree, push, create-PR, label or merge, persist an operation intent
in the existing story state (`publication_operation_json` scalar): run/story/repo,
operation, intended branch/base/head, expected current remote head/PR identity,
operation status `intent`, and non-secret reconciliation evidence. On success,
record the observed result and status `confirmed`; on interruption/unknown status,
read actual Git refs/worktree inventory/PR head+base+number/labels/merge result
first. Zero matches permits the original operation only after confirming refusal;
one exact match is reused; multiple/conflicting matches stop this story. Never
blindly retry, create a replacement PR or erase the intent. Before each remote
mutation recheck the expected current head; mismatch invalidates evidence and
requires reconciliation. This is an existing-state journal, not a second tracker.
Keep PR-feedback eligibility/human/attempt/current-head policies unchanged.

### Selection announcement, source adapters and manual visual requests

Briefly announce the automatically selected mode and its scope rationale before
implementation: backend-only epic PR, or any-UI per-story PRs. No extra choice
prompt is needed. Visible UI includes pages, layouts, components, styles,
typography and customer-visible output, assessed from approved intended behavior.
The assessment uses exact boolean `source_allows_skip` (default false), with its
source permission/rationale. Existing `stories.yaml` remains unchanged: this
extension introduces no dependency, status or skip fields into that source
format. Dependency/independence/skip assessment stays in the existing anchor's
capsule, referencing authoritative source permission rather than inventing it.

Whenever requesting manual visual review/acceptance, end the final chat message
with the relevant embedded Markdown images. Label screen, state, viewport and
candidate revision; distinguish implemented captures, design references and
controlled/synthetic states. Use absolute local image paths in Codex and durable
revision-bound links in PR evidence. If embedding is unavailable, provide exact
clickable image links in that same final message and explain the limitation.
A folder or PR link alone is insufficient. For larger sets embed primary desktop
and mobile images and link the remaining exact captures. Refresh evidence after
fixes, disclose missing captures, and distinguish preliminary feedback from
formal acceptance. Never ask the owner to locate the images.
