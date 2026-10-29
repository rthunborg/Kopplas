---
runScope: 'epic-level'
runKey: 'epic-35-3'
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-10-29'
---

# Story 35.3 test-design progress

Create mode selected by explicit assignment. This epic-level workflow uses the stable approved single-story adapter identity `35-3`, not all of E35. Output root is the assigned `_bmad-output/test-artifacts/design-35-3/`; no global checkpoint is overwritten.

Required story/AC inputs exist: canonical specification, Lane A slice, approved folder adapter, source binding and operative approval. Baseline is `431c27f63183dc0dde0eea44da1427f78adf74c4`; assigned bootstrap is `f6b23d785e095b8c4c5f2ff3b1a3df4cd2a26a20`. No prior checkpoint exists here. Source status remains historical; operative approval supersedes its approval/allocation gates only.

Route supplied before dispatch: Sol High, `tea_epic`, transactional integrity for honest persistence, unknown-outcome retry and late-result identity. No auth/domain/SQL contract change is authorized. Root owns Git/state. This delegate owns only new bounded test-design artifacts; no execution or coverage is claimed.

## Step 2 — loaded context

Canonical raw SHA-256 pins verified; HEAD observed at assigned bootstrap. Adapter/operative approval, 13 consumer bindings and saved-claim report read. Canonical Lane A slice is the primary plan. Loaded actual seven presentation consumers, shared read-only Dialog, CRM action-state/actions/reads/customer commands, current customer browser and pure-unit suites, command integration assertions, current development/visual policy, DESIGN/EXPERIENCE/common-contract, relevant architecture/PRD lines and local setup/runner configuration. See final plan for exact source inventory.

TEA customization resolved successfully: no prepend/append/persistent-fact overrides. English, Rasmus; frontend Next/React + local DB integration (no independent consumer/provider deployment boundary). Playwright/Pact utils flags true, packages absent. Existing Playwright patterns remain the bounded path; no dependencies/framework scaffolding. Knowledge loaded: risk governance, probability/impact, levels, priorities, NFR criteria, library/Playwright/Pact mandate and broker degradation, UI/API/fixture/network/auth/polling/logging narratives, confidence gate and CLI narrative. Reference implementation snippets are not copied. Browser exploration omitted under explicit design-only assignment; no runtime needed.

`pact_mcp_reachable: false`, established by one tool-list check. Pact broker: unreachable (SmartBear MCP tools not available). Provider states derived from provider source (`src/features/crm/actions.ts`, `action-state.ts`, `read.ts` and customer commands), not broker data. No Pact scaffolding is relevant to this bounded same-application presentation change.

## Step 3 — risk and testability assessment

Epic-level mode does not require a system-wide architecture review. Current code permits pure deterministic helper tests, real local DB/browser persistence tests and controlled transport tests. Source presence is not coverage. `CrmActionState` has idle/success/error plus targetId, no version/idempotency/reconciliation authority. Existing Dialog exposes busy gating but CustomerDialog does not currently wire pending into it; local close/identity protection can be planned inside owned callers. Read-only routes and commands remain authoritative.

Highest risks: duplicate create after ambiguous dispatch; late success attached to another customer/form generation; unsent values lost through close; semantics/associations broken by shared field styling. These receive P0/P1 tests with explicit boundaries in the final risk register. No new server version/idempotency contract is inferred. Unknown-create and stale-concurrent-update authority are named gaps when an assertion would exceed current contracts; local stale-view protection remains testable within ownership. All risk mitigations are planned, not completed. NFR sources provide 360×640/desktop, phone target ≥44px, text contrast ≥4.5:1, focus/association and server-confirmation thresholds. No new latency/load/SLA target is invented.

## Step 4 — coverage and execution design

Canonical seven numbered AC test IDs and sixteen Applies state/test IDs are retained in the plan. Ten browser scenario groups cover changed composition and interactions; up to three pure-helper groups are conditional on real new deterministic logic, preserving existing unit contracts. Existing DB/RLS assertions are reused at their own level, with executed/skipped counts required later. Shared consumers are inventoried completely but sampled by affected contract for rendered regression, not by a whole-site or inherited 35.2 screenshot count.

PR strategy: focused units, existing required integration/RLS/recovery lanes, customer production-server desktop/360×640 browser assertions and current-head visual evidence. Nightly/weekly introduce no new suites for this story; exhaustive release matrices remain assigned separately. No deadlines or provider proof are invented. Planned effort is P0 ~6–12h, P1 ~8–16h, P2 ~2–4h, total ~16–32h (~0.5–1 working week), including bounded harness adaptation and provenance, excluding any separately approved server contract work. All required owned AC/state assertions must pass; P0 100%, P1 at least 95% is a monitoring floor and never waives a required AC. Required CI and independent review remain mandatory. No actual coverage percentage or quality verdict is assigned.

## Step 5 — generated and validated

Full epic-template output: `test-design-epic-35-3.md`; stories-mode discovery bridge: `test-design-spec-design-35-3.md`. Epic workflow remains single-worker, no nested generation or system handoff required. Checklist reviewed against epic applicability: eight risk rows (three ≥6), ten browser groups plus up to three conditional real-logic unit groups, seven AC bindings, sixteen Applies state bindings, inherited lock/file and N/A unavailable states, NFR thresholds, ownership/timelines, execution strategy, estimates and current completion/visual acceptance gates. Stronger server reconciliation/optimistic concurrency guarantees are named G-01/G-02, not silently inferred from local UI correlation. G-03/G-04 preserve close/navigation and transport-harness limits. No runtime, resources or new test/support/application files. This checkpoint is the bounded quality-progress record; no global tracking/state/Git mutations.

Read-only document validation passed: seven AC bindings, sixteen Applies state rows, eight correctly multiplied risks with three ≥6, completed checkpoint, three expected output files and both immutable raw source hashes. Runtime tests executed: zero. Completion customization resolved to an empty hook, so no terminal action was required.
