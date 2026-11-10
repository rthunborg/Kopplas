# Development completion and release validation

## Frontend acceptance amendment — 2026-10-26

For newly authorized frontend work and remediation, the owner now requires
[revision-bound frontend visual acceptance](../quality/frontend-quality-gate.md)
before development-complete/review-ready claims. Actual production-server UI at
desktop and connected 360×640, relevant finished/loading/error/empty states,
representative shared-style consumers and independent image review (or explicit
authenticated owner manual acceptance) are required. Initial foundations,
screens and reference changes additionally need owner acceptance. Missing,
stale, skipped or failed visual evidence blocks this gate. Documentation/backend
work records an explicit applicability reason. This narrow amendment supersedes
the October 19 deferral of these frontend checks; exhaustive release/device
validation and separate release approval remain tracked release work. Historical
records and paused runs are unchanged until explicitly authorized resume.

Use `scripts/quality/completion-gate.mjs` as the pre-transition wrapper for the
existing delivery/status/finalization helpers, with their unchanged arguments
and the actual full recorded baseline. Supported project customization facts and
handoffs require the same gate before an implementation returns complete. BMAD's
post-terminal `on_complete` hook cannot atomically prevent installed status
writes; it reports a missed gate without changing historical result schemas.
The trusted PR controller separately enforces readiness. Its required-check
protection/bootstrap remains an owner checkpoint, never inferred from this doc.

Owner decision — 2026-10-19. This policy supersedes older instructions that make exhaustive browser, screenshot, visual or manual review a routine development completion gate. Preserve historical evidence without relabelling it.

## Development gate

Ordinary stories and epics require the applicable static checks and production build, the required full database integration/RLS lane and direct recovery-storage integrity checks, focused unit/integration coverage for changed behavior and consequential integrity (including authorization, tenant isolation, money and transaction invariants where affected), independent review, and only the essential browser smoke needed to demonstrate the changed usable flow. Documentation-only changes need applicable process checks, not an application build or browser. Explicit skipped suites are not passing coverage; required integration evidence must show executed counts and use SUPABASE_TEST_REQUIRED=1.

Exhaustive browser matrices, screenshot comparisons, visual inspection, manual walkthroughs and polish belong to tracked deferred release validation. Record each item, its scope, owner, evidence/status and concrete next action in the delivery artifact and deferred-work ledger. Do not delete tests, weaken security/data-integrity acceptance criteria, or recategorize a consequential functional failure as polish. A browser failure exposing broken essential functionality still blocks development completion.

Use two distinct statements: development complete means applicable development checks and independent review passed; release ready additionally requires actual release-validation evidence and existing release/merge/deployment approvals. Development complete alone never authorizes deployment or claims release readiness. Existing BMAD done means development completion only. A deferred release check is deferred, never passed, waived, or falsely covered by unrelated evidence. TEA trace distinguishes development requirements from deferred release validation; only missing required development evidence blocks development. Release gaps remain visible to retrospective and reports.

## Story-scoped TEA dispatch

For a freshly admitted Auto-BMAD story, the coordinator and phase delegate apply
this route at the actual dispatch of every selected story Phase 4 (`atdd`) and
Phase 6 (`automate`). This includes sequential single stories, sequential epic
story loops and admitted schema-2 story-PR workers. For these dispatches replace
the stock `testarch-atdd` and `testarch-automate` Create prompt bodies with the
project-owned test-architecture delegate instructions below. Retain the native
phase selection, route and timing records, six-field result, ownership,
checkpoints and ordering. Epic-wide TEA keeps its own dispatch. Existing pinned
runs and assignments, including CRM and Epic 15, keep their admitted routes and
evidence.

### Admit and resolve

1. The coordinator pins the independently reviewed policy and
   `scripts/quality/story-tea-route.py` hashes from a qualified checkout, and
   the trusted installed planner's full commit and LF-normalized SHA-256.
   Before each helper invocation, compare the policy and helper bytes in the
   qualified checkout with their pinned hashes. Execute that verified helper
   and pass the assigned checkout as data. The helper executes the planner
   from the pinned commit only after validating its bytes. Carry the reviewed
   route and scope in the phase and nested delegate prompts.
2. Record a private route JSON and its raw SHA-256 outside the assigned checkout.
   Common fields are `schema_version: 1`, `route` (`sequential` or `schema-2`),
   `checkout` (absolute physical worktree root), `branch`, `story_key` (canonical
   planner key), `planner_revision`, `planner_sha256` and `phases` (the selected
   subset of `["atdd", "automate"]`). Include `phase_test_paths`, an object mapping
   each selected phase to its reviewed exact test file list. An empty list
   permits an evidence-only phase. Each listed file must be an approved
   `tests/unit/**/*.test.ts`, `tests/integration/**/*.{test,spec}.ts` or
   `tests/e2e/**/*.e2e.spec.ts` path. Allocating a test directory does not give a
   delegate permission to edit every file in it.
   - Sequential adds the approved relative `spec_path`, `write_paths` and
     `source`. A stories source has `mode: "stories"`, `spec_folder` and original
     `story_id`. A sprint source has `mode: "sprint"`, `sprint_status`, `impl_dir`
     and `story_ref`. Relative paths use forward slashes.
   - Schema 2 adds `assignment_sha256` (raw file hash), `run_id`, `owner`,
     `worker` and `generation` from the exact successful native assignment JSON.
     Supply that private JSON with `--assignment <file>`. Before both resolver
     calls, use the normal native ownership revalidation for the exact live
     assignment. A changed owner, worker, generation, checkout or branch, or a
     non-writable claim, blocks the phase. The resolver checks the pinned
     assignment receipt and Git evidence. Claim admission and live claim
     authority stay with the native workflow.
3. Add only the story's allocated evidence directory (trailing slash) or its
   exact selected evidence file paths to approved write scope. The directory
   defaults to `_bmad-output/test-artifacts/<canonical-story-key>/`. The schema-2
   `spec-design-35-7-35-7` assignment, from
   `_bmad-output/specs/spec-design-35-7` with original ID `35-7`, uses the existing
   `_bmad-output/test-artifacts/story-35-7/` allocation. The filenames are
   `atdd-checklist.md` and `automation-summary.md`. A shared evidence prefix or
   another story's allocation blocks this route.
4. Fold the native route selection and timing start into the preceding
   checkpoint where possible. Otherwise checkpoint only the verified
   coordinator-owned bookkeeping before dispatch. The assigned checkout must
   be clean across tracked and untracked files. Ordinary ignored dependencies
   are allowed, and the evidence tree must have no pending changes, including
   ignored files. The selected phase output must be new. Immediately before
   dispatch, obtain the full clean phase HEAD and run the following command
   (add `--assignment` for schema 2). Require exit 0 and `ok: true` and retain the
   complete stdout JSON as a private pre-phase receipt.

   ```text
   python -I -B <qualified-helper> resolve --route <private-json> --route-sha256 <hash> --checkout <assigned-root> --phase <atdd|automate> --revision <full-HEAD>
   ```

### Delegate and verify

- Dispatch a test-architecture delegate under the normal project model routing
  and phase-result contract. Use distinct delegates for the two phases and Sol
  High for tenant authority, money or transactional integrity. Give each
  delegate the exact approved spec, worktree, revision, write allocation and
  resolver's `output_absolute` and `evidence_header`. The delegate writes that
  header verbatim as the first line of the assigned UTF-8 Markdown file. The
  delegate edits only the approved `phase_test_paths` for this phase, leaves
  tests unstaged and leaves the evidence untracked for verification before
  the normal phase checkpoint.
- Phase 4 maps the approved acceptance criteria to real checks and test
  scaffolds, records command and executed counts and demonstrates the intended
  red checkpoint before product implementation. Identify each expected failure
  and its reason. Distinguish existing passing tests, expected failing tests,
  skipped tests and tests that were unrun. Keep the native red checkpoint
  before Phase 5.
- Phase 6 reviews the implemented behavior against the matrix and existing
  ATDD coverage, expands only material coverage gaps and records actual
  commands, counts, outcomes and remaining gaps. Preserve the applicable native
  browser, database/RLS and other required checks, independent review,
  revision-bound visual gate and delivery evidence. The Markdown and resolver
  establish artifact provenance. The observed commands and independent review
  establish coverage.
- The project delegates do not launch the stock story-level Create workflows,
  edit the tracked TEA configuration or copy evidence out of a shared path.
  Native spec edits and state changes stay with their existing owners. Before
  pausing the phase timing, committing or recording the phase complete, the
  orchestrator or schema-2 worker reruns the same command with `verify` and
  `--receipt <pre-phase-json>`.
  Use the same pinned inputs and phase HEAD. Require exit 0 and `ok: true`.
  Retain the verified path, revision, artifact SHA-256 and changed test hashes
  with the phase result.
  A wrong checkout, stale revision, incompatible receipt, absent or wrong
  artifact, staged change, or change outside the exact approved phase files
  blocks the phase. Use the original receipt to verify a retained output on a
  same-route recovery.
  Preserve historical evidence and escalate unresolved mismatches through the
  existing blocked handling.

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

### Future sequential UI epics — owner decision 2026-10-28

Fresh ordinary sequential Auto-BMAD epics assess approved actual visible scope
once. Any UI selects separate isolated main-target story PRs for every story;
backend-only epics retain the final epic PR. This is standing split-publication
authorization for that selected route. Existing anchors (including 35.2), single
stories and explicit parallel runs retain their route. See the project-owned
[sequential strategy](../../.agents/skills/auto-bmad/references/sequential-pr-strategy.md).
Pending review/visual/merge permits eligible independent work, never a completion
claim. Existing development/visual acceptance, exact-head CI, fresh Coordinator
review, merge authorization and integration obligations remain mandatory.
