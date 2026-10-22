# Development completion and release validation

Owner decision — 2026-10-19. This policy supersedes older instructions that make exhaustive browser, screenshot, visual or manual review a routine development completion gate. Preserve historical evidence without relabelling it.

## Development gate

Ordinary stories and epics require the applicable static checks and production build, the required full database integration/RLS lane and direct recovery-storage integrity checks, focused unit/integration coverage for changed behavior and consequential integrity (including authorization, tenant isolation, money and transaction invariants where affected), independent review, and only the essential browser smoke needed to demonstrate the changed usable flow. Documentation-only changes need applicable process checks, not an application build or browser. Explicit skipped suites are not passing coverage; required integration evidence must show executed counts and use SUPABASE_TEST_REQUIRED=1.

Exhaustive browser matrices, screenshot comparisons, visual inspection, manual walkthroughs and polish belong to tracked deferred release validation. Record each item, its scope, owner, evidence/status and concrete next action in the delivery artifact and deferred-work ledger. Do not delete tests, weaken security/data-integrity acceptance criteria, or recategorize a consequential functional failure as polish. A browser failure exposing broken essential functionality still blocks development completion.

Use two distinct statements: development complete means applicable development checks and independent review passed; release ready additionally requires actual release-validation evidence and existing release/merge/deployment approvals. Development complete alone never authorizes deployment or claims release readiness. Existing BMAD done means development completion only. A deferred release check is deferred, never passed, waived, or falsely covered by unrelated evidence. TEA trace distinguishes development requirements from deferred release validation; only missing required development evidence blocks development. Release gaps remain visible to retrospective and reports.

## Final Phase B release checkpoint

Owner decision — 2026-10-22: after all approved current Phase B epics are development-complete and integrated, the Coordinator opens and assigns the [Phase B release validation and stabilization checkpoint](../quality/phase-b-release-validation-checkpoint.md). This is a required final milestone; completing the epics does not complete this checkpoint. It consolidates deferred release validation across all epics and preserves actual evidence, owners and unresolved functional findings. Until its applicable checks pass and explicit release approval is recorded, `release_ready` remains false. This instruction schedules the work by completion of the epics, not by a calendar date, and does not authorize deployment.

## Bounded recovery and ownership

After two unsuccessful attempts at the same approach, stop repeating it. Inspect the evidence and choose a materially simpler safe route within existing authorization. If none exists, retain a named blocker with owner, evidence, next action and the exact resume condition. Never blindly retry an uncertain remote mutation. Do not expand scope or change protected boundaries to clear a gate. A deferred release check must not stall ordinary development; a real development blocker must not be hidden.

Review evidence may be reused when its reviewed commit/diff and relevant dependencies are unchanged and ownership/provenance are recorded. Changes receive targeted independent review; sensitive scope retains High effort review and the three-round review cap. Do not rerun a broad unchanged review merely because a session resumed.

Use compact progress updates: current result, next action, and a named actionable blocker if present. Heartbeats stay quiet for unchanged/non-actionable state unless the owner requested periodic status. Paused chats remain paused: this policy is not authorization to contact, resume or migrate them. New policy takes effect only on an explicitly authorized fresh run or resume after its ownership and evidence are reconciled; never rewrite prior results as a pass.

## Epic publication

Deliver one final epic PR. Concrete narrow prerequisite/checkpoint work is permitted inside the epic branch and its final diff, subject to normal scope and checkpoint review/CI rules. If a separate prerequisite PR or split publication is needed, prepare its exact scope and dependency rationale locally and obtain owner approval before publishing it. Do not turn the one-PR rule into a refusal to fix an authorized narrow prerequisite. Checkpoint pushes remain subject to existing authorization; merging and deployment retain their approval gates.

## Executable delivery record

Before a development-complete claim, status flip to done, or finalization, the implementation/verification delegate writes `<output_folder>/auto-bmad/delivery/<key>.json`; the orchestrator runs `python <skill-root>/scripts/delivery_gate.py <record>`. The JSON contains `policy_version: "2026-10-19"`, `contract_reconciliation` (the author's explicit assessment of approved/pinned story gates, including which older visual/manual requirements are now deferred on an authorized resume; never rewrite historical results), `evidence_revision`, `development_checks` (nonempty objects with name, status=passed, evidence), `independent_review` (status=passed, evidence), `deferred_release_validation` (objects with item, owner, status=deferred|passed, evidence, next_action), and `release_ready` (boolean). Evidence states actual commands/results and exact revision; the helper validates the contract, not the truth of assertions. The independent reviewer checks provenance against the actual diff. Non-product records may name the applicable process checks. Release-ready true requires every recorded release check passed and separate release approval evidence in `release_approval`; this helper grants no approval.

A failed contract blocks the claim/status flip/finalization and preserves resumable state. On resume reuse a valid record only after checking its revision/dependency evidence remains applicable; otherwise delegate a targeted refresh. Older runs lacking a record remain historical, and acquire one only on an authorized resume. Do not add unsupported keys to auto-bmad config or silently mutate existing state schemas.

The project overrides apply when global test-gate or visual-validation skills describe a mandatory screenshot/manual gate. Those installed skills are not evidence of an executed check and must not override this owner decision. The required CI lane and optional release-validation dispatch are documented in [CI policy](../quality/ci.md).

## Acceptance and verification

This owner-authorized process change adds no product surface, migrations, dependencies or secret settings. Acceptance requires the executable state/status/finalization entrypoints to reject missing/invalid development evidence without writes, accept development-complete records with explicitly deferred release work, reject skipped checks and unsupported release-ready claims, and retain equivalent Codex/Claude orchestration behavior. Existing scope, resource lifecycle, independent sensitive review, checkpoint ownership and merge/deployment gates remain in force.

## Suggested Review Order

1. Read this policy and AGENTS.md's dated owner decision: verify development versus release scope and publication authorization.
2. Read `delivery_gate.py::validate` and `require_for_transition` in `.agents/skills/auto-bmad/scripts/`: verify required executed evidence, deferred release ownership, pinned-contract reconciliation and epic record path resolution. This validates assertions, not their truth; independent review checks provenance.
3. Read the delivery gate calls in `state_update.py::main`, `story_plan.py::main` and `state_plan.py::main`: missing records fail before state/status writes and deny finalization. Historical reads remain unchanged.
4. Run `python -m unittest discover -s .agents/skills/auto-bmad/scripts/tests -p test_delivery_gate.py`: subprocess tests cover missing-record refusal/no mutation and valid-record admission across real entrypoints, normalized uppercase/whitespace done transitions, last-story epic-lift refusal without an epic record, plus malformed, skipped and false release assertions.
5. Check `_bmad/custom/` persistent policy facts, pipeline/delegation overlays and equivalent `.claude/skills/auto-bmad/` copies. Reconcile an old pinned story only on its authorized resume; do not rewrite its historic evidence.

Author verification: five focused tests pass; team customization TOML parses and Build Auto customization resolution includes this policy. The upstream state_update/state_plan/story_plan self-tests fail on the same legacy/Windows fixtures when executing the unchanged HEAD scripts; those pre-existing failures are not reported as passed. No application runtime, browser, database or deployment was started for this process change.
