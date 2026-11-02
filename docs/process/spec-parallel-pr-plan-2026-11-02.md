# Restricted stories / story-PR parallel adapter plan

Status: accepted by independent Sol High plan review; no product enrollment, claim,
worker, provider mutation or managed service is authorized by this document.
Tooling base: `9533e969c1981647e26c33774a9327f842ad299a`.

## Scope and compatibility

Add schema 2 to the existing `parallel_run.py` authority for explicitly planned
stories-mode assignments delivered through individual main-target PRs. Reuse the
existing per-story pipeline, Git/PR route, `pr_strategy.py` validators, state and
report writers. Retain schema 1 sprint/epic-PR dispatch and all existing maintenance
APIs unchanged. No scheduler, provider client, new configuration or invented
customize.toml setting is introduced. Mirror project-owned changes under `.claude`.

The same Git-common-directory SQLite database owns both versions. Keep the exact
existing table columns (including positional INSERT compatibility). Pending PRs,
blocked assignments and merge verification retain their claims, paths, domains,
worktree and branch reservations and count toward the repository cap of two.

## Schema 2 plan

Retain existing plan fields and story ownership/check/risk/contract fields. Require
`schema_version: 2`, `story_source: stories`, `publication_strategy: story-pr`,
`repository: owner/repository`, and `base_branch: main`. The existing
`integration_branch` / `integration_worktree` identify the coordinator control
checkout only; workers never branch from its HEAD. `epic` is the explicit grouping
identity, not an invented source story number.

Each story's `id` is its unchanged `story_plan.py` story key. Add:

```json
{
  "source": {
    "spec_folder": "_bmad-output/specs/spec-example",
    "story_id": "1",
    "story_key": "spec-example-1",
    "position": 0,
    "spec_checkpoint": false,
    "done_checkpoint": false,
    "files": [
      {"path": "_bmad-output/specs/spec-example/SPEC.md", "sha256": "LF_SHA256"},
      {"path": "_bmad-output/specs/spec-example/stories.yaml", "sha256": "LF_SHA256"}
    ]
  }
}
```

Existing `spec_path` / `spec_revision` pin the approved individual story file.
The source parser/resolver supplies the original ID/key, exact matching file,
manifest order and checkpoint values; do not reproduce a looser YAML grammar.
Reject ambiguous/prefix-colliding IDs and malformed source. Source files and
specs must already be committed on qualified main before enrollment. This adapter
does not import unpublished preparation branches into worker PRs.

Canonical authority is `(full canonical repository-relative folder, original
source story ID)`, with Windows case aliases normalized. Never reduce the
namespace to folder basename. Preserve original keys for existing state/report
naming. Reject different folders whose basename-derived state/report/anchor
artifacts collide. Reject symlink escape and noncanonical paths. A run may name
two different folders (the anticipated 35.6/35.7 preparation shape). This first
adapter requires exactly one manifest entry per selected folder. Dependencies and
permission for concurrent independent execution remain reviewed plan metadata;
never add status/dependency fields to stories.yaml. Unresolved approval, source
checkpoint or dependency decisions block admission. An unfulfilled true
spec_checkpoint fails closed; this adapter adds no approval API. A terminal
done_checkpoint may be true: the worker stops after its own story PR, and no
later same-folder assignment is supported. PR-ready is still not integrated.

Protect SPEC.md, stories.yaml, .memlog.md, RETROSPECTIVE.md, aggregate spec reports,
epic anchors, global ledgers and workflow/configuration. Require exact own story
spec/state/report ownership, and deny sibling bookkeeping. Preserve existing
registered-inherited-state validation: a parallel_run_id marker is insufficient;
copied artifacts require the registered run/claim and exact immutable base blob.

## Claim and worker route

Plan is read-only and creates no store. Init preserves the existing exact clean
control-base checks and enforces source identity collisions across all active runs.
For schema 2, claim additionally requires `--expected-head SHA`: this must equal
the refreshed qualified `refs/remotes/origin/main` and clean worker HEAD. The
approved plan base must be its ancestor, and source/spec/workflow pins must match.
Qualification/fetch/CI policy is still verified operationally, not granted by JSON.
Required dependencies need verified actual main merges; done/open PR/green branch
CI is insufficient. No stacking or importing unmerged product code.

Workers retain explicit assignment/generation, folder+ID dispatch, pinned workflow,
runtime external-review resolver, required checks, independent review and source
checkpoints. They use per-story phases and the existing sequential story-PR
publication route, including durable publication_identity_json and
publication_operation_json, frontend labels/screenshots and executable wrappers.
They do not write aggregate state/ledger, merge or declare epic completion.
This explicit schema-2 exception overrides the sequential-reference fresh-only
scope and schema-1 worker's forbidden publication; schema-1 behavior remains exact.

Submit retains existing evidence fields with schema_version 2 and adds
`publication`, containing provider-observed repository, PR number/URL, head branch,
base main, actual candidate head, immutable observation reference and the existing
`pr_strategy.publish` observation. Validate actual local branch/head/diff/checks/
review and publication validator. Submission becomes `pr-ready`, never integrated.
The original owner may resubmit a fixed candidate on the same immutable PR identity
before merge custody. Candidate head and its evidence change; repository/PR/
branch/worktree/base identity do not. Clear stale revision-specific receipts.

## One additive publication table and serialized main merge

Add `story_pr_publications` keyed by `(run,story)`, recording repository, PR number,
URL, branch, base_branch, head_sha, state, intent_json, observation_json, merge_sha
and verification_json. Existing run/claim/journal tables remain usable by the
unchanged pinned v1 helper. No separate fixer lifecycle machine is introduced.

Add `prepare-pr-merge --run --owner --story --expected-head SHA
--expected-main SHA --evidence FILE`. Under one BEGIN IMMEDIATE transaction:

1. Refuse any unresolved merge intent anywhere in this common-Git repository.
2. Validate owner/generation, stored immutable PR identity, actual local candidate,
   refreshed main, exact-head provider observation, and all existing
   pr_strategy.merge validators and executable authorization gates.
3. Require quiescent worker/fixer ownership evidence; freeze worker mutations.
4. Persist a once-created request token and complete intended repository/PR/head/
   main/generation before the coordinator calls the existing authorized gh merge
   route. The helper never calls the provider or grants merge authorization.

Add `observe-pr-merge --run --owner --story --request FILE`. Bind the same custody
token and identity to independently inspected provider merged facts. Refuse an
open PR, changed PR/head/base, unknown outcome or conflicting observations without
releasing custody. Refresh Git and prove the observed exact merge commit M has
parents `[prepared_main, prepared_candidate]` and is reachable on current qualified
main. Arbitrary ancestors and self-asserted open PR observations are insufficient.
Strict expected-main parent checking makes base drift a reconciliation blocker;
never automatically repeat a provider merge. Retain custody through verification.
An interrupted successful provider call is recovered by observing the same intent,
not by another launch or a replacement PR.

Schema-2 verify requires exact combined checks/review at current qualified main Q,
with M reachable from Q and the stored merge shape/candidate still verified. A new
main head invalidates Q evidence. Only this transition marks the claim integrated,
records verified publication and releases its reservations/custody. Finalize needs
every required claim integrated, actual merge ancestry on qualified current main,
and exact-head final checks plus normal trace/reconcile/retro/delivery obligations.
No final epic product PR is created. Any closeout artifacts use the existing
separately gated publication route.

## Implementation ownership and verification

Helper author owns parallel_run.py and its mirror. A separate contract author owns
appended tests in test_parallel_run.py/test_parallel_cli.py and mirrors; the existing
CI workflow already executes them. Documentation author updates SKILL.md and the
parallel/stories/Git/state/sequential reference exceptions and operator contract.
Keep the existing external-review generated customization unchanged; worker runtime
override already solves checkout-specific review commands.

Synthetic Git/CLI tests cover: v1 and pinned fixture compatibility; read-only plan;
two-folder IDs and artifact alias refusals; LF pins, source order/checkpoints and
workflow drift; main-versus-control base; mixed-version cap/path/domain custody;
blocked and pending ownership; legacy/inherited provenance; aggregate spec report
denials; prerequisite actual main ancestry; same-PR candidate resubmit; PR-ready
versus integrated; repo-wide durable intent/worker freeze; wrong provider identity,
open PR, head/base drift, arbitrary ancestor/wrong merge parents; restart after
provider success; exact integrated evidence and real executed/skipped counts;
strict finalization and mirrored files. Tests launch no services or real workers
and do not touch the live coordination database.

## Known operational gate

Multiple entries in one selected source folder are outside this first adapter.
Duplicate source tuples, case aliases and colliding artifact keys are refused. Schema-1-only
integrate, repair, amend-blocked and finalize-exceptions explicitly refuse schema 2.

At the preparation checkpoint used for this tooling plan, 35.6/35.7 was
blocked-for-enrollment. The intended separate spec-design-35-6 and
spec-design-35-7 folders were not qualified operative adapters; intended original
IDs were 35-6 and 35-7, without parser-qualified state keys. The frozen
35.7-to-35.6 dependency was retained, so simultaneous admission required proof or
a reviewed amendment. Current source qualification and eligibility remain
Coordinator-owned. No product SPEC folders are created by this tooling change.
Full AC feasibility, source
amendment, dependency interpretation, exact ownership and reviewed source adoption
belong to the coordinator/preparation route. Tooling implementation or green
synthetic tests do not resolve those decisions or authorize product claims.

## Suggested Review Order

1. Read this plan's Scope and compatibility, Schema 2 plan, and Known operational
   gate sections together. They explain the deliberate single-story-folder limit,
   preserved source identities/checkpoints and conditional pair eligibility.
2. Start at `.agents/skills/auto-bmad/scripts/parallel_run.py:876`, literal
   `def stories_pr_plan`, for the source/parser/hash/ownership boundary. It reuses
   the original strict validator through a schema-1 projection; the public
   schema-1 path and old table columns remain intact. Continue at line 940,
   `def story_pr_registered_anchor`, for exact inherited-state provenance, then
   line 982, `def stories_pr_report`, for dependency and independence admission.
3. Read `.agents/skills/auto-bmad/scripts/parallel_run.py:1004`, literal
   `def story_pr_publication`, alongside `def story_pr_evidence` at line 1015.
   These reuse existing publication gates and exact-commit check/review evidence.
   Continue at line 1030, `def execute_story_pr`: PR-ready retains claims;
   prepare persists repository-wide merge custody before provider work; observe
   proves actual reported merge parents/ancestry; verify gates the exact current
   main revision before releasing ownership. The dispatch stop is line 1177,
   `def execute`. The `.claude` helper is an exact mirror.
4. Map the source/ownership invariants to
   `.agents/skills/auto-bmad/scripts/tests/test_parallel_run.py:708`, literal
   `class StoriesPrAdmission`; map PR identity, durable custody, wrong merge facts,
   drift and exact-main/finalization to `class StoriesPrCustody` at line 902.
   Follow the actual subprocess/restart/concurrent-intent contract at
   `.agents/skills/auto-bmad/scripts/tests/test_parallel_cli.py:500`, literal
   `class StoriesPrCli`. Existing schema-1 and pinned-helper fixtures remain the
   compatibility evidence. These suites passed against the final unchanged helper:
   70 engine cases and 13 CLI cases, with zero failures/skips. The three revised
   CLI receipt cases also passed their focused rerun; they add no unique coverage.
5. Follow the root-owned verification record for routing, independent review and
   actual executed/skipped counts. Together with 21 finalization, 26 routing,
   10 process and 11 publication-strategy regressions, local qualification passed
   151 unique cases with zero failures/skips. Independent Sol High final-diff
   review round 1 found no actionable P1/P2 defects; the changed CLI receipt
   inspection also passed. No product enrollment, live store or provider behavior
   has been exercised. Source/provider evidence inputs remain observations verified
   operationally; they are not credentials or new merge authorization.

Final helper identity, independently reread after the test results: LF-normalized
SHA256 `12fe516baf4a3a01453c875491950afbe1e78dd250fcbac60967d69dd9d1b67e`;
raw checkout SHA256
`5eb5710e4965e5b443a2a394881f70342a13ada7772ae5b2b4a63edb1953a114`.
The helper mirrors match byte-for-byte, and the path:line stops above were verified
against that source. The finalization exception remains schema-1-only; this work
does not apply it to a live run or grant coverage to skipped tests.

Automatic approval review initially rejected the implementation patch because
trusted user authorization was missing in the delegate context. Work stopped
without a workaround. The user then supplied direct authorization, and the
bounded implementation resumed successfully. No product claim, managed service,
provider mutation, commit or PR is performed by this author subtask.
