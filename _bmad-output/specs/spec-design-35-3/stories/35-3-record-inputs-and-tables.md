---
title: "Story 35.3: Record Inputs And Tables"
type: feature
created: "2026-10-29"
status: draft
tracking_key: 35-3-record-inputs-and-tables
baseline_revision: 431c27f63183dc0dde0eea44da1427f78adf74c4
context:
  - docs/process/review-order.md
  - docs/quality/story-35-3-operative-approval-2026-10-29.json
  - _bmad-output/specs/spec-design-35-3/source-binding.json
  - _bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-3.md
---

# Operative execution bridge

This draft adapts the individually approved 35.3 canonical contract for folder+ID dispatch. The approval record and exact path allocation are in source-binding.json and the operative approval record. Historical preparation-only status and blockers in the immutable copy below describe preparation at its original date; later approval/allocation supersede only those documented gates for this assignment. Current base, claims, shared consumers and full preflight remain required. This is not implementation readiness or executed evidence.

The build-auto planner must preserve canonical AC/state/test IDs, scope, applicability and release obligations, audit the exact seven production/two test allocation, reconcile FormField/association contracts, DialogActions and ArchiveButton inherited consumers, and keep excluded bodies read-only. If a required state needs an authority/action-state change outside allocation, escalate rather than inventing semantics or dropping coverage. Actual sensitive decisions require Sol High; presentation planning uses Sol Low. Use written design authority and existing 35.2 foundations; no legacy URL evidence, new framework or invented Figma prerequisite. Do not copy 35.2 completion/runtime evidence.

No tests have run for 35.3. No Auto Run Result is asserted. The implementation author later supplies exactly one final `## Suggested Review Order` with verified stops and evidence; the historical scaffold below is not that final section. Relative links inside the canonical copy resolve from the original canonical specification, not this directory. The test slice remains separately normative at its pinned original path.

<!-- canonical-body-copy: spec-35-3-record-inputs-and-tables.md -->

# Story 35.3: Record Inputs And Tables

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-SHARED B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-1b visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-3-AC1.** Deliver Button, Field/input/select/textarea, SelectionRow, Table, Card, StatusIndicator/StatusBadge and EmptyState patterns through existing components and a real customer list/detail/edit journey. Add abstractions only as needed by this flow.

2. **E35-3-AC2.** Rows use 14px block/16px inline padding, selected fill and 2px ink marker, stable row identity and semantic headers. Separate selection/navigation, expose sort/filter by keyboard, and provide labeled narrow-grid overflow or compact record form.

3. **E35-3-AC3.** Reuse createCustomerAction/updateCustomerAction/archiveCustomerAction and readCustomerList/readCustomerDetail. Preserve labels, help/error association, validation summary, suitable unsent input, explicit save and current archive semantics.

4. **E35-3-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-3-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-3-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-3-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.2; shared primitive ownership reconciliation.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

MAIN kund; inherited record-work journey and frozen Phase A journey 1. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: /customers and /customers/[customerId] representative real edit flow.

Prospective consumers: src/components/crm/*; src/features/crm/actions.ts; src/features/crm/read.ts.

- `src/features/crm/actions.ts` — `createCustomerAction, updateCustomerAction, archiveCustomerAction, createFacilityAction, updateFacilityAction, archiveFacilityAction, createContactAction, updateContactAction, archiveContactAction`; SHA-256 `9df8f1ae665d4ad83915b686ee19a0d3a273312723fe415503fbde96b5d58146`.
- `src/features/crm/read.ts` — `CustomerListReadResult, readCustomerList, CustomerDetailRow, FacilityRow, ContactRow, CustomerDetailReadResult, readCustomerDetail`; SHA-256 `136b6f0a8c8fca52721802bc6a22a385261c9d9bf0bcd973edd57b2eed7cfa65`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. Real customer list/form; source entity file panel remains an inherited consumer.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, empty, no-match, validation, denied, revoked, connection-required, submitting, error-retry, unknown, stale, confirmed, dirty-navigation, late-result, focus-dialog | locked | unavailable |
| Files | Inherited regression: Existing CRM entity panel only; no new upload consumer in representative edit. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Representative customer edit has no new file command; existing entity attachment panel remains source-authorized and is fully migrated in 35.6/35.11. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-3-STATE-<name>` and `E35-3-T-<name>`. Every specific AC has proposed test ID `E35-3-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: tests/e2e/crm/customers.e2e.spec.ts; tests/integration/commands/crm-customer-commands.int.test.ts. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-3-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

### References

- [AGENTS](../../AGENTS.md), [project context](../project-context.md), [Phase B epics](../planning-artifacts/epics-phase-b.md), [PRD](../planning-artifacts/prd-phase-b.md), [architecture](../planning-artifacts/architecture-phase-b.md).
- [DESIGN](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md), [detailed annex](../planning-artifacts/ux-design-specification-phase-b.md), [crosswalk](../planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/screen-state-crosswalk.md).
- [Package index/predecessors](../planning-artifacts/design-transition-2026-10-23/story-preparation/README.md), [review convention](../../docs/process/review-order.md).

## Implementation-author Suggested Review Order scaffold

Planning scaffold only. Implementation/fix author replaces it with exactly one final `## Suggested Review Order` after code/verification; no empty selectable final heading or invented lines now.

1. Entry/user outcome: rationale and final route/component symbol with verified line.
2. State/authority: reuse/tradeoff rationale and changed boundary/downstream guard with verified lines.
3. Evidence/limits: actual AC assertions, command/revision/counts/skips, mocked boundaries and pending release/operational work. Refresh after fixes; reviewer checks final diff.

## Dev Agent Record

Preparation route: gpt-6.1-sol / low; sensitive assessment separately recorded. Implementation/model/file list/completion/verification: not started. No historical evidence rewritten.
