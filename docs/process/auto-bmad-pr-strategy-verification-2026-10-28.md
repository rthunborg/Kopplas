# Sequential Auto-BMAD PR strategy verification — 2026-10-28

Tooling-only author record. Base: origin/main 734d8998. Implementation route:
GPT-6.1 Sol Low. Sensitive branch/base/dependency/ownership/current-head boundary
assessment and targeted follow-up: independent Sol High delegate. Ordinary tooling
review: independent Sol Low delegate. No product epic was invoked or active run
upgraded; no live PR/provider/CI operation, resource launch, merge or deployment
was performed by this implementation.

The project-owned Auto-BMAD extension now selects a frozen route from approved
actual visible behavior for fresh ordinary sequential epics. Any UI selects all
story PRs from qualified main; backend-only selects legacy epic publication.
Existing anchors and explicit parallel/single-story routes retain their behavior.
The helper is deterministic local validation over observations; semantic scope
and independence judgment belongs to delegated approved-source assessment.
External CI, identity, visual acceptance, review and authorization remain checked
by their existing trusted operational sources. Author-supplied booleans/receipts
are never provider enforcement or acceptance authority.

## Suggested Review Order

### Route before implementation

The project-owned overlay selects from approved visible behavior because filenames
cannot identify intended UX. Freezing the capsule prevents active-run migration.

- `.agents/skills/auto-bmad/references/sequential-pr-strategy.md:9` — `E0 / E1`: binds approved source assessment before legacy branch assumptions.
- `.agents/skills/auto-bmad/scripts/pr_strategy.py:60` — `select`: freezes the fresh route and refuses scope drift.

### Preserve ownership and completion boundaries

Existing YAML remains authoritative to avoid a competing tracker. Local predicates
protect state integrity; external gate observations retain their existing trust sources.

- `.agents/skills/auto-bmad/scripts/pr_strategy.py:97` — `reconcile_operation`: reuses exact observed artifacts after uncertain publication.
- `.agents/skills/auto-bmad/scripts/state_update.py:122` — `_strategy_transition_errors`: loads immutable strategy guards for writer entrypoints.

### Verify the persisted behavior

The [acceptance mapping](#acceptance-mapping-and-evidence) records executed fixtures
and baseline limitations. The real writer fixture covers both refusal and positive
integrated completion; mocked artifact checks do not prove hosted enforcement.

- `.agents/skills/auto-bmad/scripts/tests/test_pr_strategy.py:120` — `test_state_writer_preserves_strategy_and_rejects_migration_done`: exercises persisted guards and finalize draft behavior.

## Acceptance mapping and evidence

| Scenario | Local fixture |
| --- | --- |
| 1 Backend-only epic keeps one PR | test_01_backend_epic_legacy_publication |
| 2 UI/mixed epic isolates every story | test_02_ui_mixed_all_stories_isolated |
| 3 Existing epic/single-story/35.2 unchanged | test_03_existing_epic_and_single_story_unchanged |
| 4 Interrupted resume reuses pin; drift refuses | test_04_interruption_pin_roundtrip |
| 5 Prerequisite requires confirmed merged-main ancestry | test_05_dependency_requires_confirmed_main_merge |
| 6 Pending human/visual/merge continues independent permitted work | test_06_pending_visual_continues_independent_only |
| 7 Identity and mocked uncertain PR reconciliation avoid duplicates | test_07_resume_no_duplicate_identity |
| 8 Actual frontend label and current durable labeled evidence | test_08_publication_frontend_label_and_evidence |
| 9 Exact-head merge CI/review/acceptance/visual gates | test_09_merge_exact_head_and_visual_gates |
| 10 All merges and integration obligations before completion; backend N/A | test_10_completion_all_merges_integration_and_backend_na |

Additional real state writer/finalize fixture verifies persisted capsule roundtrip,
legacy migration refusal, immutable pin, padded/case DONE refusal, phase-9 refusal,
finalize draft/no-flip, and positive integrated done receipt.

Verification: 11 new strategy tests passed; existing delivery-gate 5 tests passed;
existing routing/migration 26 tests passed (including full install mirror and
schema lockstep checks). Ten changed mirrored files are byte-identical. Git diff
whitespace check passed. Full existing helper unittest discovery found 129 tests. The uniquely owned
invocation was intentionally interrupted with its session Ctrl-C during unrelated
parallel-finalization subprocess fixtures after 38 completed passing tests; the
39th was active. It exited 1 without a final summary: this is interrupted evidence,
not a full-suite pass. The broad invocation began before final fixes; the final
candidate evidence is the scoped 42 passing tests above. No broad rerun was needed.

Existing state_update and state_plan standalone --self-test assertions fail on
both base HEAD sources and candidate: respectively `a legacy field must not feed
the new one` and `writer round-trip: no legacy clause field emitted`. Base was
executed with its actual script path for reference/schema resolution. These are
pre-existing expectations, not waived new test failures. No unrelated migration
semantics were changed to satisfy them.

Limits: local/mocked evidence only. No synthetic hosted PR or feedback, no
provider/controller activation or CI redesign, no proof of live remote gates.
The workflow journal and exclusive-writer inventory are procedural existing-state
coordination, not a new database lock service. Unresolved ownership blocks the
story. No test claims that LLM scope/dependency reasoning is mechanically proven.
