---
title: "Story 35.4: Dialogs Feedback And Selected Files"
type: feature
created: 2026-10-30
status: blocked
warnings: [oversized]
review_loop_iteration: 0
followup_review_recommended: true
deferred: []
baseline_revision: fdcb6b5b21a7828cd79e3be8c1d0aa0aaaafde76
context:
  - ../SPEC.md
  - ../source-binding.json
  - ../../../test-artifacts/test-design-spec-design-35-4.md
  - '{project-root}/docs/process/review-order.md'
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

## Build-auto planning contract — 2026-10-30

The canonical body above is preserved verbatim as historical approved intent. This operative execution plan translates it without changing AC1–AC7, applicability or source pins. Planning inspected current HEAD `08c7f443cc69203d2228b34d9cf10f13a6d2dd24`; approved product base remains source-binding.json's `07d24236961ae14619411c1c05fc199de568dde7`. Branch matches the single-story epic adapter; metadata refresh and clean-tree check succeeded before writing. No sibling stories exist in this adapter.

<intent-contract>

## Intent

**Problem:** Existing Documents presentation and the approved JobEventsPanel representative need the accepted DT-1c composition and accessible, honest state feedback through current real consumers.

**Approach:** Adapt only the four allocated production consumers and strengthen the two existing browser suites. Preserve the canonical seven ACs and all original state/test identities; use the focused High test design for atomic observations and inherited regression coverage.

## Boundaries & Constraints

**Always:** Exact allocation in source-binding.json; current selected-link identity and signing, retained callable/reconciliation, independent outcomes, existing route authority, safe events projection, Swedish content and Stockholm time. Read the preserved canonical applicability table and focused test design together. Current frontend/development gates apply.

**Block If:** An unallocated edit, new authority/transaction/navigation contract, fabricated event fields/history, or unavailable lawful evidence seam is necessary. Report precise owner/evidence/next action/resume condition to Coordinator. Missing runtime/visual evidence blocks completion, never becomes PASS.

**Never:** 35.5, new upload/editor/endpoint/history flow, shared Dialog/server/auth/RLS/schema/route/font changes, public fallback, sample success, broad readiness recensus or owner reapproval of this operative allocation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Selected access | Active link/file pair; two links may share bytes | Sign/refresh only selected pair; close restores origin/focus | Denied/expired response clears bearer access; no alternate-link fallback |
| Late completion | A request finishes after B selection/filter change | B identity/media/error remains current | Ignore A for current surface |
| Lifecycle | Pending, failed or uncertain bound operation | Preserve original callable; confirmed result alone reports success | Reread and explicit current confirmation before consequential retry |
| Feedback | Preview, upload and lifecycle coexist | Independent persistent failures and supplementary transient feedback | Toast expiry never clears reconciliation or required failure |
| AuditTrail | Safe existing rows, compact/full, empty/error | Stable IDs, safe labels, exact timestamp and Stockholm display | Persistent real error/retry; no invented actor/meta/history |

</intent-contract>

## Code Map

All paths below are repository-relative; resolve against this worktree, never the historical copied-link directory.

- `src/components/documents/DocumentFilters.tsx:31` — `DocumentsWorkspace` owns actual /files composition; selection/signing at 89, retained lifecycle at 100, explicit reread/current eligibility at 130–147, independent feedback at 172–185, current origin link at 164, existing confirmations at 197–205. Reuse handlers rather than introducing replacement authority.
- `src/components/documents/DocumentPreviewPane.tsx:4` — `DocumentPreviewPane` owns selected file/name, back focus and state; `DocumentMedia` at 24 validates actual PDF bytes and aborts/revokes on cleanup. Preserve MIME/download and failure/retry distinctions.
- `src/components/documents/DocumentLifecycleActions.tsx:2` — permission/pending presentation delegates existing callbacks; no local permission decision.
- `src/components/jobs/JobEventsPanel.tsx:6` — `JobEventsPanel` uses last three compact rows, safe labels, persistent error/retry and genuine empty at 8–14. Only `id,eventType,occurredAt` enter this presentation.
- `src/components/crm/Dialog.tsx` — read-only existing named/focus/busy/close `variant="dialog"|"sheet"` API. Compose an existing sheet for selected preview where appropriate; no new editor or shared primitive.
- `src/features/documents/actions.ts`, `src/features/documents/filters.ts`, `src/server/commands/documents/lifecycle.ts` — read-only checked action/reducer/domain authorities; preserve signatures, identity and downstream checks. Generic FilePreviewRow remains a different signing boundary.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:150` — existing real transport/DB fixture lane: uncertain identity at 150–226, modal focus at 259, expiry at 409, selected denial at 476, lifecycle persistence at 501, lost response at 567, late A/B at 365 and keyboard return at 749. Existing RED annotations are not evidence of skip or pass; inspect runner outcome and keep annotations honest when touching cases.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:175` — E01 actual desktop overview/events and E02 phone/privacy at 307; inherited E03 drafts/failure at 376 and E04/E05 child/history/late navigation at 516/613. Keep original IDs and add explicit E35 mapping.

## Tasks & Acceptance

Execute in dependency order; only the following six implementation files are writable. Local helpers must remain inside these files. Every task remains unchecked because implementation has not started.

- [ ] `src/components/documents/DocumentFilters.tsx` — adapt workspace Banner/Toast, actual relationship ConnectionChip, supplementary Tooltip, existing confirmations and selected-preview sheet composition using existing Dialog; retain all current signing, filter, lifecycle and navigation identity handlers. Required errors/reconciliation stay persistent and independent; show actual selected name/all-link effect and restore trigger/origin.
- [ ] `src/components/documents/DocumentPreviewPane.tsx` — adapt selected detail/loading/expiry/error/refresh/media presentation to the composition while preserving cleanup, authorized download and selected identity; phone controls ≥44px, reachable at enlargement/keyboard. Keep callback contracts compatible within allocated consumers.
- [ ] `src/components/documents/DocumentLifecycleActions.tsx` — align existing archive/restore controls, labels, pending/unavailable and focus with accepted design without changing eligibility or callbacks.
- [ ] `src/components/jobs/JobEventsPanel.tsx` — adapt existing compact/full AuditTrail, genuine empty and persistent retry using current safe rows/labels/Stockholm timestamps; no actor enrichment or unrelated Jobs migration.
- [ ] `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts` — add meaningful E35 assertions at existing real action/fixture seams for matrix cases, persistent versus transient feedback, selected-source expiry/denial, A/B lateness, named busy dialogs, origin/focus and phone target/reflow. Preserve original IDs and invariant assertions; do not mock business outcomes or add a harness.
- [ ] `tests/e2e/jobs/job-workspace.e2e.spec.ts` — strengthen E01/E02 actual safe-row compact/full/time/privacy assertions, preserve E03–E05 affected draft/navigation behavior, and resolve lawful existing test-owned empty/error capture seam before claiming those rendered states. If unavailable within this allocation, report exact frontend evidence blocker; never mutate protected history or fabricate RSC wire responses.

The following Given/When/Then observations are bindings to canonical ACs, not replacement criteria:

- **E35-4-AC1 / T-AC1:** Given current real Documents/Jobs consumers, when the adapted surfaces render and feedback changes, then sheet/banner/toast/tooltip/relationship/AuditTrail serve their actual roles and required failures remain persistent.
- **E35-4-AC2 / T-AC2:** Given a selected link/file pair, when preview expires, refreshes and closes, then current selected authority is rechecked and origin/focus restored without alternative-source signing.
- **E35-4-AC3 / T-AC3:** Given actual affected unsent input and selection B, when abandonment is cancelled or old A completes, then input/history/B remain protected and independent file outcomes remain distinct.
- **E35-4-AC4 / T-AC4:** Given connected Swedish real records at desktop and 360×640, when keyboard/touch/enlargement/virtual keyboard are used, then ≥44px actions, labels and persistent errors remain accessible and persistence is server-confirmed.
- **E35-4-AC5 / T-AC5:** Given an actual adapted dialog/sheet, when opened, traversed, busy or dismissed, then accessible name/trap/dismiss protection/trigger restoration survive; existing motion respects reduced motion.
- **E35-4-AC6 / T-AC6:** Given each canonical Applies state at its actual caller, when feedback renders or retries, then denied/empty/unsent/unknown/confirmed stay distinct and uncertainty reconciles before consequential retry; inherited/N/A do not create new flows.
- **E35-4-AC7 / T-AC7:** Given current checked domain boundaries, when the presentation changes, then authority/provenance/money/locks/facts remain unchanged and required executed evidence is distinguished from release work.

## Spec Change Log

No review-loop amendments. Planning additions preserve canonical body and original source-binding.

## Review Triage Log

No implementation review performed.

## Design Notes

Concrete local composition is agent-owned within allocation. Use existing Dialog sheet API for selected preview and existing confirmation API; keep ownership of selection and callbacks in DocumentsWorkspace. ConnectionChip uses already projected context label/destination/origin only; never synthesize an unprojected per-row URL. Use current design tokens and read-only DESIGN/EXPERIENCE/annex. Independent upload errors and lifecycle/preview state cannot be collapsed into one receipt. No final Suggested Review Order is authored before implementation; implementation author must provide it after verified code exists.

## Verification

Planning evidence: current four consumers and two test seams inspected; source/hash/body/AC identity checks required before halt. This is source inspection, not runtime coverage. Focused High test design: `_bmad-output/test-artifacts/test-design-spec-design-35-4.md`; preserve its full canonical state table and P0/P1 mapping.

Later implementation runs `pnpm run verify:development`, `pnpm audit --audit-level=high`, required full isolated `pnpm run test:int` with `SUPABASE_TEST_REQUIRED=1`, direct recovery/storage integrity, and both allocated browser suites through configured production server plus applicable essential unchanged consumer smoke. Use actual package/CI commands and guard-owned isolated resources, never demo/production or next dev. Record native exit codes, revision and executed/failed/skipped counts. Required suites cannot be counted passed if skipped.

Before completion run candidate-bound frontend gate and `node scripts/quality/frontend-controller.mjs local --base 07d24236961ae14619411c1c05fc199de568dde7`; use completion-gate wrapper for delivery/status/finalization helpers. Real production UI desktop/360×640, relevant states, independent image review and initial owner visual acceptance remain mandatory. Missing Jobs empty/error seam is a concrete execution evidence risk, not a new intent decision or permission to weaken acceptance. Existing focused plan gives lawful resolution/block route.

Keep REL-1/REL-2/REL-3 ownership and exact deferred ledger/candidate binding with Coordinator; exhaustive device/manual release obligations remain pending, `release_ready=false`. No app/build/unit/integration/browser/visual checks ran during this planning stop. No service started; no merge/deployment requested.
### Planning route and sensitive preservation assessment

Ordinary planning: gpt-6.1-sol Low. Before sensitive judgment, dispatched distinct synchronous context-free gpt-6.1-sol High delegate `sensitive_plan_check` for selected-source tokens and lifecycle/late-result concurrency. It returned no unresolved intent/authority decision blocking ready-for-dev. Confirmed exact pair signing, reducer identity/expiry, retained callable/current reread/confirmation, Dialog focus/busy behavior and safe event projection. No files/services/git writes by reviewer. This assessment does not replace later independent sensitive implementation review.

## Historical planning run result

Status: ready-for-dev
Blocking condition: none
HALT: ready-for-dev — requested halt after planning.
Planning only; implementation and all runtime/visual gates remain pending. Canonical source/test SHA-256 pins and verbatim normalized canonical body checked successfully; seven AC identities retained. Readiness self-review: six exact file actions are dependency-ordered, Given/When/Then bindings observe actual outer surfaces, no placeholders or unresolved intent decisions. Known execution evidence risk has explicit Coordinator/block route. No final implementation review trail is manufactured on this planning exit.
## Suggested Review Order

Author: implementation_author (Sol Low), the author of the presentation, Documents tests and initial compact/full Jobs test changes. Approved test-infrastructure/empty/error amendment rationale below is supplied by its distinct context-free Sol High implementation author through the coordinator; this section preserves that attribution.
Refreshed against the handshake-fix working tree over immutable checkpoint `a6aa7c57503043880bc0c9ca6374c690e263ccd6` on 2026-10-30. This is a blocked candidate handoff: implementation verification failed; development completion is not claimed.

### Selected preview and existing confirmation

The operative Design Notes select the existing modal Dialog sheet API. The preview sits outside the inert workspace so the selected file remains operable while background rows/filters are protected; callers close the sheet before selecting another row or changing a filter. Shared Dialog, checked signing, reducer, media validation and lifecycle closures remain unchanged. Follow-up review identified a reachable focus race: the list becomes inert before the shared Dialog captures focus, and synchronous close attempted focus while still inert. The explicit selected trigger now restores in a scheduled frame after the selectedRow-null DOM update and Dialog cleanup; the same real journey asserts pointer-close and Escape restoration.

- `src/components/documents/DocumentFilters.tsx:169` — `modalOpen`: includes the selected preview in background isolation.
- `src/components/documents/DocumentFilters.tsx:45` — `restorePreviewFocus`: explicit post-inert trigger restoration after preview close.
- `src/components/documents/DocumentFilters.tsx:217` — `DocumentPreviewPane`: keeps selection and callbacks in the workspace.
- `src/components/documents/DocumentPreviewPane.tsx:12` — `variant="sheet"`: reuses naming, focus trap, dismissal and trigger restoration.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:843` — `keyboard list-detail-back`: AC2/AC4/AC5 sheet, target size, trap, Escape and filter/focus assertions.

### Independent feedback and safe relationship/event presentation

Token-based banners retain required failure/reconciliation feedback. Only confirmed lifecycle success creates the supplementary five-second dismissible toast; its timer does not alter retained operations or undo authority. The relationship chip uses the existing projected context return URL/label; no per-row route is invented. Tooltip text repeats the archive confirmation consequence. AuditTrail renders only the existing event IDs, labels and Stockholm timestamps, reflowing its time gutter on phones.

- `src/components/documents/DocumentFilters.tsx:194` — `toastVisible`: supplementary success is separate from persistent error/reconciliation branches.
- `src/components/documents/DocumentFilters.tsx:200` — `retainedOperations.filter`: preserves original-callable recovery independently of toast expiry.
- `src/components/documents/DocumentLifecycleActions.tsx:3` — `DocumentLifecycleActions`: existing permission projection and callbacks, with supplementary hover/focus/Escape tooltip.
- `src/components/jobs/JobEventsPanel.tsx:6` — `JobEventsPanel`: compact/full safe rows, persistent error/retry and genuine empty presentation.

### Approved test-only rendered-state and capture evidence

The actual human amendment recorded in source-binding.json supersedes the earlier six-path execution limit only for `tests/support/job-events-fetch-fault.cjs`, `playwright.config.ts`, and the schema-permitted controlled empty-parent fixture inside the already-owned Jobs test. Production paths, schema, reader/route authorization and canonical source pins are unchanged. The High implementation author chose a preload applied only to configured Playwright `next start` after build: the fault is limited to exact loopback-origin GET `/rest/v1/job_events`, safe select/order/range, one fixture job and its normal JWT subject/session/expiry. The attributed High fix author moved fresh cryptographic nonce generation from config into the actual next-start preload after CI at a6 rejected added node:crypto imports in the effective-config VM. Config now uses neither the added crypto nor path import. The private startup handshake binds control path, fresh nonce, current runner PID, boot time/live server PID, exact configured loopback Supabase origin, application URL and actual Next port. The same approved adapter exports a setup hook immediately before original fixture setup; it validates freshness/liveness/targets and passes nonce/path to workers, failing closed for a missing, stale or mismatched handshake. The private control file still holds no credentials, the exact safe-GET fault remains unchanged and the test finally disarms. `reuseExistingServer=false` prevents silently bypassing the preload; local managed execution still requires guarding that configured server launch.

The controlled standalone parent has NULL source references permitted by schema and is labeled defensive persisted state, not ordinary createJob behavior. Cleanup checks tenant+ID, absent source references and absence of unexpected events before removal, then asserts absence; it does not delete/rewrite history. The compact/full case now makes sequential normal-JWT checked in_progress → done → cancelled updates with fresh correlation IDs and asserted success, requires more than three genuine events, and excludes the earliest event from the exact latest-three view.

PNG Buffer attachments use actual production-page `fullPage:false` captures only after existing meaningful assertions. Documents adds at most 26 PNGs; Jobs adds at most 17, including retained-input states: 43 total, below the 80-image cap. Each has state/mode/viewport/test/synthetic-fixture/server and command provenance. Actual, controlled-transport, controlled-clock and controlled-persisted-state labels stay distinct. `workflowSha` is the environment GITHUB_SHA, not an authoritative checkout/build SHA; `candidateSha` remains null pending exact runner/checkout binding, and local fallback explicitly says local-uncommitted. A reproduction command is not a claim of its executed invocation. JSONReporter embeds PNG/JSON Buffer bodies in the existing general-browser.json artifact. There are no current-run images or screenshot acceptance claims.

- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:36` — `attachDocumentsState`: actual PNG bytes and explicitly unverified candidate provenance.
- `playwright.config.ts:65` — `job-events-fetch-fault.cjs`: test-only preload on the production server launch.
- `tests/support/job-events-fetch-fault.cjs:29` — `configureJobEventsFault`: validates the fresh runner/server handshake before original fixture setup.
- `tests/support/job-events-fetch-fault.cjs:67` — `jobEventsFetchFault`: scoped transport-only failure with real recovery reads.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:782` — `defensive persisted standalone job`: schema-permitted empty projection and guarded cleanup.
### Evidence and limits

AC2/AC3/AC6/AC7 deterministic identity, expiry and denial behavior is covered by the unchanged preview reducer tests; safe projection and distinct empty/error read results are covered by the unchanged Jobs reader tests. Activated browser assertions cover real compact/full rows and exact Stockholm time; existing delayed-response, stored-byte, audit/persistence and dirty-navigation assertions remain intact. Their modal journeys explicitly close the preview before background interaction. The follow-up feedback case asserts tooltip hover/focus/Escape and both manual toast dismissal and five-second expiry independently from ten-second Undo, with unchanged persisted archive/audit observations. Those browser assertions are source changes, not executed coverage yet.

- `tests/unit/features/documents/preview-state.test.ts:15` — `selection switch immediately`: late-result identity and clearing invariants.
- `tests/unit/server/read-models/job-events.test.ts:9` — `16.5-UNIT-EVENTS-01`: safe projection structurally omits private fields.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:283` — `named archive confirmation`: AC4/AC5 identity, visible actions and minimum targets.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:312` — `tooltip dismissal and toast expiry`: AC1/AC6 feedback and independent Undo/persistence assertions.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:738` — `safe compact and full AuditTrail`: AC1/AC4/AC6/AC7 real route rows and exact timestamps.

Executed in this working tree: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/documents/preview-state.test.ts tests/unit/server/read-models/job-events.test.ts` exited 0: 11 passed, 0 failed, 0 skipped. `git diff --check` exited 0. Canonical spec/slice SHA-256 pins match source-binding; approved base is an ancestor of the current branch. Follow-up scoped `pnpm exec eslint` over the four allocated TSX and two allocated browser test paths exited 0 with 0 errors and one existing Next image-element warning. React checklist source inspection retained direct imports, conditional PDF loading, event-driven tooltip state and cleaned-up toast timer; this is not independent review or browser evidence.

Coordinator-reported verification on this scoped working tree: production build, bundle containment, latest typecheck and full lint exited 0 (lint: 31 warnings); audit exited 0 with 3 moderate advisories. Focused BMAD checks passed after the required escalation resolved sandbox temporary-file denial: `pnpm run test:bmad-focused` 2/2 and `pnpm run test:auto-bmad-focused` 26+10+5 = 41 passed, native exit 0. `verify:development` failed its unit lane: first 3,741 passed/37 failed/2 skipped; bounded retained-log second run 3,777 passed/2 failed/1 skipped (3,780 total). The two retained failures are unchanged `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts` at lines 1992 (CRLF/LF body comparison) and 2237 (undefined split); no unchanged-baseline passing run is claimed, and no unrelated fix was applied. Playwright `--list` exited 0 with 87 tests across the two allocated files; actual browser execution was 0. Independent High sensitive review reported no findings. Low source follow-up confirmed the focus fix and the tooltip/toast source-coverage gaps resolved; assertions remain unexecuted browser coverage.

Limits: units exercise deterministic/source seams, not rendered UI or production authority. Full isolated integration/RLS with `SUPABASE_TEST_REQUIRED=1`, direct recovery/storage integrity, browser execution/shared-consumer smoke, candidate images and initial owner visual acceptance have zero current-run evidence. The frontend controller exited 1 for the dirty candidate; this is not a frontend gate pass. The approved High-authored Jobs empty/error/retry seams now exist in source but remain unexecuted; unit empty/error coverage and source inspection do not satisfy that rendered gate. Distinct independent High review of the complete latest test-only amendment returned No findings, including downstream reader/SQL guards, guarded cleanup, startup contract, capture provenance, JSON serialization and CI upload. This is a source-review pass; runtime and captures remain pending. No managed service was launched by this author. The coordinating agent reports guard DOCKER_UNAVAILABLE (missing Docker Desktop Linux pipe), for lifecycle `93030c01-d8dd-43dd-aa72-acad86b045ec`, recoveryRoute `inspect_only`; Stop acknowledged `stopped`, verified true. Database/browser/capture evidence is blocked pending owner/runtime availability. Native PDF remains an iframe viewer: keys inside its nested browser document do not bubble to the parent Dialog. Its useful native PDF/download behavior is preserved; surrounding Back/header close and keyboard traversal remain available, but iframe-interior Escape is not claimed and needs runtime/manual qualification. Coordinator owns remaining development evidence and REL-1/REL-2/REL-3 candidate/owner reconciliation; exhaustive release validation remains deferred and `release_ready=false`. No merge/deployment or development-complete claim.

Bounded remediation checks by this author: Documents-only eslint exited 0 without warnings/errors; Documents Playwright --list exited 0 with 80 tests/1 file and execution=0; pnpm exec tsc --noEmit exited 0 during remediation. High worker reports Jobs collection 11 tests and scoped tsc/eslint/syntax/diff exit 0 before its final cleanup guard adjustment. The coordinator subsequently reports final tsc and scoped ESLint over config, adapter and both tests exited 0, covering the final source amendment; runtime remains unexecuted. Earlier build/full-unit/audit evidence above belongs to its prior checkpoint and has not been relabeled as execution of this amendment. The two suites now collect 91 tests in aggregate; all browser execution remains pending.

## Auto Run Result

status: blocked
Blocking condition: implementation verification failed.
Candidate: handshake-fix working tree over immutable checkpoint `a6aa7c57503043880bc0c9ca6374c690e263ccd6`; production remains within four allocated paths. The human-approved source-binding test amendment now additionally allows only the test preload and Playwright configuration paths alongside the two existing suites; it supersedes stale six-path execution wording solely for that bounded test scope. Existing hosted evidence pinned to 5fe remains immutable and is not evidence for these new edits. Canonical source and test-slice hashes are unchanged; original AC1–AC7 and historical preparation/planning results remain preserved.

Triage: 3 medium patch items (reachable focus restoration plus tooltip and toast assertion coverage), 1 rejected native-PDF nested-context item retained as an explicit browser limitation, 0 deferred findings, 0 intent gaps and 0 bad-spec findings. Follow-up recommended=true (score 9); source follow-ups are resolved, required runtime/verification work remains pending. Native PDF behavior is preserved rather than replaced with a new framework.

Blocker owner: Coordinator/runtime owner for isolated Docker availability and execution of the approved Jobs rendered-state seam; implementation/verification owner for the retained required-unit failures. Evidence: `verify:development` failed the unit lane after bounded recovery; Docker guard returned DOCKER_UNAVAILABLE/inspect_only; DB/RLS/recovery/browser/capture executions=0; owner visual acceptance pending. Next action: reconcile the two unchanged unit failures with exact evidence, restore a lawful isolated runtime or run the newly pinned hosted candidate, execute required DB/recovery/browser and candidate visual gates with exact checkout/artifact binding, then obtain owner acceptance. Resume condition: retained unit blockers reconciled and isolated runtime available; do not count collection, source review or historical acceptance as execution.

`release_ready=false`; REL-1/REL-2/REL-3 retain their existing Coordinator-owned candidate/owner reconciliation and release ledger obligations. Candidate checkpoint is authorized for the skill workflow; this build delegate owns the bounded local checkpoint commit; the root owns push/PR/hosted-CI follow-up. This author made no commit, merge or deployment and claims neither development completion nor release readiness.
Hosted continuation: use existing scripts/ci/checkpoint-dispatch.mjs with the exact pushed candidate and --release-validation true. Ordinary test:smoke includes Jobs workspace but omits Documents search/preview/lifecycle; the existing exhaustive option covers both owned suites and dashboard diagnostics. Required db and recovery-storage-loader jobs provide isolated integration/RLS and Storage evidence. No workflow changes or hosted pass are claimed. If local runtime resumes, first inspect retained lifecycle93030c01-d8dd-43dd-aa72-acad86b045ec under recoveryRoute inspect_only; never blindly relaunch.

Final amendment source gate — 2026-10-30: independent Sol High review returned No findings and final tsc/scoped ESLint exited 0. Runtime, screenshots and owner acceptance remain pending. Root owns the new commit/push/CI run; existing CI pinned to 5fe5684813933d4bdeca5de4b826285f49cc9c77 does not cover this uncommitted amendment. Status remains blocked; no development-complete or release-ready claim.

Handshake follow-up — 2026-10-30: CI at immutable a6aa7c57503043880bc0c9ca6374c690e263ccd6 failed the effective-config VM with DENIED node:crypto; the distinct High fix author changed only playwright.config.ts and tests/support/job-events-fetch-fault.cjs. The adapter now creates the nonce inside fresh next-start and its setup hook validates the private runner/server handshake before existing fixture setup, as described in the same author trail. Missing/stale/mismatched handshakes fail closed; the existing exact fetch fault and disarm contract are unchanged. Installed Playwright startup ordering was independently checked to support this hook sequence.

Coordinator-reported focused verification of this fix: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts` exited 0, 214/214 passed with 0 failed/0 skipped; tsc, scoped ESLint, syntax and diff checks exited 0; Jobs collection remains 11 tests, browser execution=0. Twelve network-free actual-adapter VM checks passed for shared nonce, negative handshakes, exact safe-GET fault, stale/disarmed forwarding and unchanged detail-read forwarding. These checks exercise startup/fault selection and do not prove database, browser UI, screenshots or full business-command behavior. A distinct targeted independent Sol High review returned No findings. Runtime/browser/DB/captures and existing frontend/owner acceptance gates remain pending; no pass is inferred from source review or collection. Root owns publication/new CI for the exact fix candidate; prior immutable runs do not cover these uncommitted changes. Status remains blocked and release_ready=false.