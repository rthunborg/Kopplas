# Agent Workflow

This document defines how BMAD and Codex are used together in this repo.

## Operating Model

BMAD is used for product, architecture, story, test, and review structure. Codex is used for repository edits, file-level verification, and implementation once a story is approved.

Product implementation is scoped by the machine-readable scope manifest (`src/scope/manifest.ts`, ADR-B003): a module's surface may be built only when the module is `active`, and a module is flipped `pending → active` in the same PR as its first schema/nav change (per-epic activation, FR129). Process-only / docs-only tasks still create process, configuration, and documentation files only — no product code, migrations, dependencies, or `.env`.

## Source Hierarchy

| Priority | Source |
| --- | --- |
| 1 | Direct user instruction in the current task |
| 2 | `AGENTS.md` |
| 3 | Baseline plan: `docs/planning/saas-rebuild-phased-plan-2026-06-07.md` |
| 4 | ADRs in `docs/decisions` |
| 5 | Process, quality, and security docs |
| 6 | Existing design system and accessibility conventions where approved requirements leave design choices |

## Standard Flow

1. Read `AGENTS.md` and the baseline plan.
2. Identify phase (currently Phase B / Legacy Parity Release) and the target module's wave/status in `src/scope/manifest.ts`.
3. Run a scope check against the manifest (is the module `active`?) and the Phase C ledger (hard exclusions) in `AGENTS.md`.
4. If coding is requested, require an approved story or ADR-backed change.
5. Do not browse legacy applications or use their URLs as new evidence (owner decision 2026-10-15). Resolve missing design rules using the existing design system and record the rationale.
6. Make narrowly scoped changes.
7. Run the relevant quality gates.
8. For implementation stories, have the implementation/fix author write or refresh the [Suggested Review Order](review-order.md), then verify its references and evidence against the final change. The Test Architect defines evidence expectations; the reviewer checks the trail. auto-bmad's root delegates this work.
9. Summarize changed files, verification, remaining risks, and any manual setup.

## BMAD Responsibilities

BMAD agents should:

- Create or validate PRDs, stories, architecture notes, test plans, and reviews.
- Keep scope manifest-governed: build only `active`-module surface; flip a module `active` in the same PR as its first schema/nav change.
- Ask owner questions for ambiguous Swedish domain terms.
- Produce artifacts with acceptance criteria and explicit deferrals.
- Avoid implementation details unless the artifact requires them.

## Codex Responsibilities

Codex should:

- State whether it is operating in read-only, docs/config-only, or implementation mode before making changes.
- Edit files in the repo.
- Avoid destructive commands.
- Run necessary network actions within the authorized task scope and current host permissions; do not request repeated approval for that authorized work.
- Avoid touching `.env`.
- Add or upgrade dependencies only within authorized implementation scope; docs/process-only work adds none.
- Verify changes locally with appropriate checks, within the authorized scope and resource lifecycle requirements.
- Report exact files changed and checks run.

## Design evidence

The 2026-10-15 owner decision supersedes historical Lovable oracle guidance.
Preserve historical records without presenting them as newly verified evidence.
Use approved requirements, the existing design system and accessibility
conventions; record missing-rule choices as owner-authorized design decisions.

## Checkpoint delivery and deployment boundary

New, independently reviewed checkpoints may opt into the
[reusable exact-head CI lane](../quality/ci.md#reusable-checkpoint-ci-opt-in).
Its committed helper replaces per-checkpoint helper scripts and repository
admission-variable packets for the normal required gates. Keep active loops and
E15's optional privileged diagnostics on their existing owned controls until
explicit adoption; this lane does not discharge their remaining acceptance.

Automatic Vercel Preview deployments remain disabled by owner policy until
explicitly re-enabled. This records policy, not verified hosted configuration.
A checkpoint push is not deployment authorization. Verify production
auto-deployment separately before any merge and retain the deployment approval
gate; a future protected milestone preview needs qualified backend, test data,
secrets, schema, authentication, mail and integrations plus explicit approval.

Standing authorization for bounded independently reviewed checkpoint pushes and
CI runs does not waive exact-head evidence, operation ownership, independent
review, uncertainty handling or no-deployment boundaries. The reusable lane uses
immutable workflow inputs and local ownership state instead of temporary shared
variables. Its implementation adds no hosted secret or privileged runtime mode.

## Independently verified prerequisite PRs

Prefer a smaller, independently testable prerequisite PR when the approved
story or ADR permits that boundary. Before extracting it, reconcile the approved
delivery/activation contract and acceptance-criteria partition; record the
slice's write ownership, shared semantic contracts, integration dependency and
slice-specific tests. Concurrent work still requires explicit claims under the
parallel-development protocol. Passing prerequisite tests qualifies that slice;
it does not complete the parent story, waive its remaining acceptance, or grant
merge or deployment authorization.

Use one focused independent review of changed behavior, unresolved consequential
findings and regressions introduced by the fixes. Reuse unchanged evidence only
when its recorded revision, command, inputs and environment still support the
same claim; identify what was reused and rerun checks invalidated by the change.
Required exact-head CI evidence remains required. Route sensitive contract,
authorization, tenancy, money or integrity judgments to Sol High under the
[model-routing policy](agent-model-routing.md); retain independent review and
the existing three-round limit.

Current E15/E16 slicing assessment (2026-10-19; proposals, not product authority):

- E15's booking reassignment boolean/RPC can be considered separately, but it is
  not the E16 blocker. The approved scheduling activation/nav and first-RPC
  same-PR contract must be explicitly reconciled before adopting that split.
- E16's actual prerequisite is an agreed, allocated shared-contract boundary:
  UTC/DST, capacity, canonical facts, proof identity and current-facts semantics,
  including shared file ownership. That boundary can be qualified independently
  of calendar visuals with its own contract and tests; it is currently
  unapproved and creates no authority to add product/schema/mutation surface.

## Authorization and Remaining Gates

Implementation requires an approved story or ADR-backed task. Within authorized scope, code, migrations, dependencies, and necessary network actions do not require repeated approval. Docs/process-only work excludes product code, migrations, dependencies, and `.env`. Preserve current secret, destructive-action, merge, and Phase C owner-decision gates.

- Obtain story or ADR approval before starting product work; that authorization covers its required implementation actions within the agreed scope.
- Activate a pending module only within an approved activation story, in the same PR as its first schema/nav change, H4 enrollment, and deferred-token removal.
- Keep explicit approval for PR merge and for changes to `.env` or secrets handling; current host prohibitions and destructive-action safeguards still apply.
- Bringing any Phase C hard exclusion into active scope requires a new owner decision and linked planning artifact.
