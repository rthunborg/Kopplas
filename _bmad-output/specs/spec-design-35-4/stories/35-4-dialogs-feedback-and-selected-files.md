---
title: "Story 35.4: Dialogs Feedback And Selected Files"
type: feature
created: 2026-10-30
status: draft
baseline_revision: 07d24236961ae14619411c1c05fc199de568dde7
context:
  - ../SPEC.md
  - ../source-binding.json
  - ../../../implementation-artifacts/spec-35-4-dialogs-feedback-and-selected-files.md
  - ../../../test-artifacts/dt-2026-10-23-test-design/slice-35-4.md
---

## Operative admission — 2026-10-30

This adapter enrolls only individually approved Story 35.4 (DT-1c). The actual owner approval, relayed by Coordinator chat `01a1160d-b5b1-7623-a8e8-54ef3dc537ed`, is: “Sounds like a plan, lets finish35.4and35.5sequentially… I approve35.4onaboveallocation. Pleaseinitiate developmentinnewfreshsession”. Actual owner chat is `01a18c3f-da26-7ef2-be95-be71569284b7`; exact source pins, approved base, branch, worktree and allowed paths are in `../source-binding.json`.

This later approval supersedes historical preparation-only/no-adapter/no-start conditions for this assignment only. It does not enroll 35.5 or waive planning, verification, independent review, visual acceptance, merge or release gates. This story remains draft pending folder+ID build-auto planning; no implementation or runtime pass is claimed.

Only the four production and two existing test paths in source-binding.json are writable for implementation. JobEventsPanel is the existing representative AuditTrail: reuse existing safe event rows, compact/full, empty, persistent error/retry, stable identity, labels and Stockholm time; no actor/meta fields absent from projection and no fabricated document history. Existing shared Dialog, server/auth/RLS/schema, fonts and routes remain read-only. Preserve selected-source identity, late-result, dirty-navigation and lifecycle guards. Stop for Coordinator reconciliation before any unallocated path or sensitive contract change. Ordinary presentation route is Sol Low; actual file-token/tenant/transaction/navigation-authority decisions require a distinct Sol High delegate and recorded reason.

Read the admission packet at `docs/quality/story-35-4-admission-2026-10-30.md` relative to repository root alongside the canonical test slice. Preserve AC1–AC7, test/state identities and Applies/Inherited/N/A distinctions. Historical copied links below resolve against the canonical original directory, not this adapter directory. The original body begins below and remains historical wherever it describes preparation status or old bases; current operative admission and exact allocation above control this run. Candidate-bound visual acceptance and applicable development checks remain mandatory; `release_ready=false`.

# Story 35.4: Dialogs Feedback And Selected Files

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-SHARED B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-1c visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-4-AC1.** Deliver SideSheet, Banner, Toast, Tooltip, ConnectionChip and AuditTrail through current real consumers; LockConfirmDialog adapts existing locking confirmation only where needed. ConnectionChip is an entity relationship, not a connection indicator. Required errors stay persistent.

2. **E35-4-AC2.** Exercise selected-link preview -> expiry -> authorized refresh -> close -> origin using createDocumentSignedAccessAction/createDocumentSignedAccess and existing bound lifecycle actions. Multiple links to one file retain selected-source authority; no public fallback.

3. **E35-4-AC3.** Protect dirty input across close/Escape/tab/child/Back/Forward navigation and ignore late results for old selection. Restore trigger focus. Preserve file type/size/progress/partial/archived/locked outcomes rather than replacing them with common success.

4. **E35-4-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-4-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-4-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-4-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.3; shared dialogs/E20 selected-link reconciliation.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

Files/Documents subflow; frozen Phase A journey 5; selected/expired/locked/error states. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: /files selected preview; existing entity file panels.

Prospective consumers: src/components/documents/*; src/components/files/*; src/features/documents/actions.ts; src/server/commands/documents/lifecycle.ts.

- `src/features/documents/actions.ts` — `createDocumentSignedAccessAction`; SHA-256 `8da4b84d97df6b4c2b3ef15355973160be3e0b1d3ad9c2275b714b3b58ea40e1`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. Real selected-file/dialog consumers; existing upload substrate is regression scope, not a new capture flow.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, empty, validation, denied, revoked, unavailable, connection-required, submitting, error-retry, unknown, stale, confirmed, locked, dirty-navigation, late-result, focus-dialog | no-match | None of the common state rows |
| Files | Applies + inherited regression: Selected-link preview/expiry/denial/lock/lifecycle presentation applies; existing type/size/upload/link/partial mechanics are inherited unless changed. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Selected preview and entity panels: all applicable upload/link/partial/expiry/archived/locked states are IN. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-4-STATE-<name>` and `E35-4-T-<name>`. Every specific AC has proposed test ID `E35-4-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts; tests/integration/commands/documents-signed-access-lock-races.int.test.ts. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-4-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

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
