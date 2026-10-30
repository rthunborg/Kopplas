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
Refreshed against the bounded capture-gap working tree over checkpoint `ce45a9283409b64694f9b782e31172de42f0a30a` on 2026-10-30. This is a blocked candidate handoff: implementation verification failed; development completion is not claimed.

### Selected preview and existing confirmation

The operative Design Notes select the existing modal Dialog sheet API. The preview sits outside the inert workspace so the selected file remains operable while background rows/filters are protected; callers close the sheet before selecting another row or changing a filter. Shared Dialog, checked signing, reducer, media validation and lifecycle closures remain unchanged. Follow-up review identified a reachable focus race: the list becomes inert before the shared Dialog captures focus, and synchronous close attempted focus while still inert. The explicit selected trigger now restores in a scheduled frame after the selectedRow-null DOM update and Dialog cleanup; the same real journey asserts pointer-close and Escape restoration.

- `src/components/documents/DocumentFilters.tsx:169` — `modalOpen`: includes the selected preview in background isolation.
- `src/components/documents/DocumentFilters.tsx:45` — `restorePreviewFocus`: explicit post-inert trigger restoration after preview close.
- `src/components/documents/DocumentFilters.tsx:217` — `DocumentPreviewPane`: keeps selection and callbacks in the workspace.
- `src/components/documents/DocumentPreviewPane.tsx:12` — `variant="sheet"`: reuses naming, focus trap, dismissal and trigger restoration.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:993` — `keyboard list-detail-back`: AC2/AC4/AC5 sheet, target size, trap, Escape and filter/focus assertions.

### Independent feedback and safe relationship/event presentation

Token-based banners retain required failure/reconciliation feedback. Only confirmed lifecycle success creates the supplementary five-second dismissible toast; its timer does not alter retained operations or undo authority. The relationship chip uses the existing projected context return URL/label; no per-row route is invented. Tooltip text repeats the archive confirmation consequence. AuditTrail renders only the existing event IDs, labels and Stockholm timestamps, reflowing its time gutter on phones.

- `src/components/documents/DocumentFilters.tsx:194` — `toastVisible`: supplementary success is separate from persistent error/reconciliation branches.
- `src/components/documents/DocumentFilters.tsx:200` — `retainedOperations.filter`: preserves original-callable recovery independently of toast expiry.
- `src/components/documents/DocumentLifecycleActions.tsx:3` — `DocumentLifecycleActions`: existing permission projection and callbacks, with supplementary hover/focus/Escape tooltip.
- `src/components/jobs/JobEventsPanel.tsx:6` — `JobEventsPanel`: compact/full safe rows, persistent error/retry and genuine empty presentation.

### Approved test-only rendered-state and capture evidence

The actual human amendment recorded in source-binding.json supersedes the earlier six-path execution limit only for `tests/support/job-events-fetch-fault.cjs`, `playwright.config.ts`, and the schema-permitted controlled empty-parent fixture inside the already-owned Jobs test. Production paths, schema, reader/route authorization and canonical source pins are unchanged. The High implementation author chose a preload applied only to configured Playwright `next start` after build: the fault is limited to exact loopback-origin GET `/rest/v1/job_events`, safe select/order/range, one fixture job and its normal JWT subject/session/expiry. The attributed High fix author moved fresh cryptographic nonce generation from config into the actual next-start preload after CI at a6 rejected added node:crypto imports in the effective-config VM. Config now uses neither the added crypto nor path import. The private startup handshake binds control path, fresh nonce, current runner PID, boot time/live server PID, exact configured loopback Supabase origin, application URL and actual Next port. The same approved adapter exports a setup hook immediately before original fixture setup; it validates freshness/liveness/targets and passes nonce/path to workers, failing closed for a missing, stale or mismatched handshake. The private control file still holds no credentials, the exact safe-GET fault remains unchanged and the test finally disarms. `reuseExistingServer=false` prevents silently bypassing the preload; local managed execution still requires guarding that configured server launch.

The controlled standalone parent has NULL source references permitted by schema and is labeled defensive persisted state, not ordinary createJob behavior. Cleanup checks tenant+ID, absent source references and absence of unexpected events before removal, then asserts absence; it does not delete/rewrite history. The compact/full case now makes sequential normal-JWT checked in_progress → done → cancelled updates with fresh correlation IDs and asserted success, requires more than three genuine events, and excludes the earliest event from the exact latest-three view.

PNG Buffer attachments use actual production-page `fullPage:false` captures only after existing meaningful assertions. Selected Documents now plans 28 actual PNGs, Jobs 17 including three supplementary retained-input images, and context return 2: 47 actuals plus 13 independent reference PNGs, 60 total below the 80-image cap. Each has state/mode/viewport/test/synthetic-fixture/server and command provenance. Actual, controlled-transport, controlled-clock and controlled-persisted-state labels stay distinct. `workflowSha` is the environment GITHUB_SHA, not an authoritative checkout/build SHA; `candidateSha` remains null pending exact runner/checkout binding, and local fallback explicitly says local-uncommitted. A reproduction command is not a claim of its executed invocation. JSONReporter embeds PNG/JSON Buffer bodies in the existing general-browser.json artifact. There are no current-run images or screenshot acceptance claims.

- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:37` — `attachDocumentsState`: actual PNG bytes and explicitly unverified candidate provenance.
- `playwright.config.ts:65` — `job-events-fetch-fault.cjs`: test-only preload on the production server launch.
- `tests/support/job-events-fetch-fault.cjs:29` — `configureJobEventsFault`: validates the fresh runner/server handshake before original fixture setup.
- `tests/support/job-events-fetch-fault.cjs:67` — `jobEventsFetchFault`: scoped transport-only failure with real recovery reads.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:782` — `defensive persisted standalone job`: schema-permitted empty projection and guarded cleanup.
### Authorized Dashboard fixture navigation correction

The actual human approval, relayed by root, is `Approve test-only correction`; source-binding.json records that provenance and adds only `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts` to the test write allocation. This later approval extends the earlier bounded test allocation solely for this existing helper/call correction. The known sole-Montör fixture must authenticate and reach its exact `/my-day` landing before the helper explicitly opens `/dashboard` for the unchanged dashboard assertions. Other callers retain the exact `/dashboard` landing expectation; timeouts, role expectations and content assertions are unchanged. This is ordinary Sol Low test navigation work, not a login/product or authorization change.

- `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:46` — `expectedLanding`: defaults all existing other callers to Dashboard.
- `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:53` — `waitForURL`: requires the known exact landing before explicit Dashboard navigation.
- `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:128` — `f.roleAware.montor`: binds the exception only at the existing sole-Montör case.

Focused checks for this correction: `pnpm exec eslint tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts` exited 0 without warnings/errors; file-scoped `pnpm exec playwright test tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts --config tests/e2e/dashboard/playwright.ci.config.ts --list` exited 0 with 51 tests in 1 file and actual browser execution=0. Initial config-wide collection exited 1 because two unowned suites read an absent local fixture.json at collection; narrowing to the authorized file collected successfully, without modifying those suites or inventing fixtures. `git diff --check` exited 0. Targeted independent Sol Low review of this exact Dashboard correction returned No findings; actual browser/runtime verification remains pending; no existing immutable run covers the new edit.
### Approved context-modal compatibility and report artifact binding

Actual human approvals `Approve modal test compatibility` and `Approve report-path correction`, explicitly relayed by root, add only the context-navigation suite and Dashboard CI config paths recorded in source-binding.json. The context tests now use the existing preview Back control at four approved sites before blocked picker/upload, archived-mode or search interactions. Captured selected URLs and every existing identity/owner/bytes/navigation/filter/late-result/security assertion remain intact; the genuine history-clearing journey is unchanged. Installer landing, other fixture/context failures and the unresolved unsupported-download cause are outside this correction and remain untouched.

The Dashboard CI config binds `PLAYWRIGHT_JSON_OUTPUT_FILE` to working-directory `test-results/dashboard-browser.json` at load using its existing path import. Installed Playwright 1.61.1 CLI reporter override discards config reporter output options; its actual resolver treats OUTPUT_NAME relative to the nested config directory but OUTPUT_FILE relative to cwd. This one binding preserves the workflow bytes, CLI flags, reporter settings, timeouts and strict artifact-upload contract.

- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:614` — `documents-preview-back`: closes selected preview before the approved contextual picker interaction.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:853` — `documents-preview-back`: closes before desktop/phone background search without altering history tests.
- `tests/e2e/dashboard/playwright.ci.config.ts:12` — `PLAYWRIGHT_JSON_OUTPUT_FILE`: pins the existing JSON artifact despite CLI reporter override.

Focused evidence: ESLint for exactly these two paths and `pnpm exec tsc --noEmit` exited 0. File-filtered context-navigation collection exited 0 (53 tests/1 file); Dashboard CI file-filtered collection with actual `--reporter=list,json` exited 0 (51 tests/1 file). Actual installed resolver assertions passed 2/2 for nested OUTPUT_NAME and cwd OUTPUT_FILE; the real changed config plus CLI reporters wrote valid JSON at the expected cwd artifact path. These are network-free collection/path checks: browser execution=0, not passing dashboard/content or modal journeys. `git diff --check` exited 0. Targeted independent Sol Low review of this exact modal compatibility/report-path correction returned No findings; runtime/browser verification remains pending and status stays blocked.
### Independent reference families and actual relationship evidence

Root authorized reference-capture preparation within the two already-owned Documents suites. Four bounded family tests retain the existing default 60-second budget and use a separate empty-storage browser context on the existing hosted browser, closing it in finally. Exact pinned feedback/data card bytes and archived stylesheet/bundle/font dependencies are served only from a bounded read-only catalog on a reference-only origin; SRI-pinned external React/DOM/Babel scripts stay external dependencies, not authority sources. Dependency/script failure, missing Inter font loading or missing/clipped component markers fail rather than producing a blank reference. No application cookies, DOM, component classes or data are copied into references.

Feedback is a historical immutable family pattern with disclosed wrapper CSS isolating the original warning Banner/Toast/Tooltip/Modal, reserving original scaled modal space and keeping tooltip geometry inside the phone viewport. Audit retains the original Timeline pattern with unrelated table/phase/progress samples hidden. The card itself imports but does not instantiate EmptyState; a separately labeled empty-pattern wrapper now renders the exact admitted EmptyState.prompt.md JSX through the archived EmptyState export, with original card/assets unchanged and distinct mandatory wrapper bytes/hash. Historical source actors/meta are illustrative reference input only. SideSheet and ConnectionChip are explicitly AUTHORED DERIVED REFERENCE patterns independently composed from read-only DESIGN/EXPERIENCE tokens/roles and archived font/style declarations, with neutral labels and no invented actor/history/business flow. They are neither existing accepted PNGs nor production captures.

The reference contract retains same-base PNG, mandatory source.html wrapper bytes and provenance.json with kind=design-reference, referenceType, family, exact viewport, titlePath, workflowSha/non-authoritative candidateSha:null, reference-pattern or empty-pattern states and design-reference mode, exact source-byte SHA-256 inventory, actual wrapper SHA-256/description and external SRI metadata. Wrapper bytes allow independent extractor verification. Actual context-return screenshots are separate kind=production-actual attachments after existing safe-return href/current owner label/focus assertions and before activating return; genuine browser-history capability clearing and all existing assertions remain intact.

- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:56` — `attachDesignReferences`: independent context, read-only source catalog and family rendering gates.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:128` — `source.html`: mandatory exact wrapper bytes accompany the hashed provenance.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:308` — `E35-4-REFERENCE`: four bounded default-budget family tests.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:57` — `attachContextRelationshipState`: actual owner-context relationship evidence remains separate from references.

Planned maximum is 47 actual PNGs (including two explicit workspace projection-loading views) and 13 reference PNGs (including two admitted EmptyState pattern views), 60 total below the 80-image cap. Feedback/SideSheet/ConnectionChip references pair geometries at 1280x800, 1280x900 and 360x640; Timeline and its separate admitted EmptyState pattern each use 1280x900 and 360x640. These are justified family patterns, not state-specific reference matches or permission to self-pair actuals. The existing generic 35.2 images are not represented as these 35.4 variants.

Final preparation checks: scoped ESLint and tsc exited 0; file-filtered collection exited 0 with 137 tests across two files (84 selected-document tests including four reference families, 53 context-navigation tests), actual browser execution=0. Network-free source checks verified both admitted exact card SHA-256 pins, readable/hashable declared archive assets/spines and all nine used DESIGN palette tokens including CRLF parsing. Canonical story/test-slice hashes remain unchanged. Targeted independent Sol Low review of the exact reference/capture/context code returned No findings. Reference rendering, new actual captures, external SRI availability and visual/owner acceptance remain pending. Unknown unsupported-download behavior is unchanged. This is preparation, not a frontend or delivery gate pass.
### Focused CI amendment and exact known-fixture compatibility

Actual human `Approve focused CI amendment`, explicitly relayed by root, adds only the shared Documents suite and `.github/workflows/story-35-4-validation.yml` paths to source-binding.json; the context suite was already allocated. This author changes only the shared unsupported-format download case and the two shared signIn helpers/exact sole-installer callers. The helpers retain exact Dashboard expectations by default and require exact `/my-day` only for the existing known installer fixture; they do not widen route matching, redirect to Dashboard, skip cases or alter any denial/content/query/navigation/owner/bytes assertion or timeout. Production auth and routing authority are unchanged.

The shared download case uses the already-reviewed saveAs pattern to a unique test.info().outputPath, retains failure=null and exact suggested filename, compares actual saved bytes to Buffer.from(the original synthetic body), and finally removes only that saved copy. This corrects the installed remote-transport path incompatibility without asserting knowledge of the complete first old failure JSON or a product defect. The previously reviewed reference/capture and owned saveAs code remains unchanged.

The separate High author owns the dedicated workflow and ignored parser. Its originally installed workflow bytes hashed to the root-approved SHA-256 `0ecd507bcfe40b3b119d9214b7cfadc19f334d1c432a81f8ac6c0562b058fa3a`, verified read-only at that stage. That hash and original full-review reuse remain historical; the later context/export/upload correction has separate current hash and targeted High review below. Source-binding records the separate High implementation route and root-supplied distinct High review `/root/focused_ci_review` No-findings provenance at 11abc; root verified the exact installed bytes and empty relevant dependency diff from 11abc (CI/checkpoint/browser runtime/package/lock/main Playwright config), so distinct High workflow review reuse was valid for those original bytes; it does not cover the subsequently changed context/export/upload lines. This author does not modify or independently re-author that workflow. Historical root-reported 11abc full CI verify/database/dashboard native JSON/recovery success and cancelled e2e/no actual PNGs are not current evidence for the focused amendment.

- `tests/e2e/files/documents.e2e.spec.ts:50` — `expectedLanding`: default Dashboard expectation with exact known-role exception.
- `tests/e2e/files/documents.e2e.spec.ts:159` — `role === "installer"`: binds Min dag only to the known installer fixture.
- `tests/e2e/files/documents.e2e.spec.ts:631` — `saveAs(downloadedPath)`: remote-safe saved bytes and exact-copy cleanup.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:406` — `role === "installer"`: preserves denied-context tests after the correct known landing.

Focused checks for the two test fixes: scoped ESLint and tsc exited 0; file-filtered collection of shared Documents, context-navigation, selected-preview/lifecycle and Jobs suites exited 0, 182 tests across four files with actual browser execution=0. Targeted independent Sol Low review of the exact latest two shared-test fixes returned No findings; prior unchanged capture/download reviews are reused with their original scope, not turned into current runtime evidence. Status remains blocked; no services, CI, commits, pushes, PR changes or root-state/report edits were performed by this author.
The later High-authored hosted-context fix removes the unavailable runner context from jobs.env and instead exports the same RUNNER_TEMP evidence directory in the first admission step, persisting it with GITHUB_ENV. Distinct High review caught that an early checkout failure could leave the always-uploader evidence variable unset; the final uploader directly names runner.temp/story-35-4-evidence/, while its browser-runtime path already directly uses runner.temp. Aggregate workflow change from immutable 436 is three insertions/two deletions. The final canonical-LF SHA-256 is `c52aac68b235fcd99197d08b11cc05826342a711331592410e507ced9866e641`, independently verified read-only and recorded separately from original approval/review in source-binding. A distinct targeted independent Sol High review returned No findings after the early-failure-path correction; unchanged original full review is not claimed to review these new lines.

- `.github/workflows/story-35-4-validation.yml:48` — `export STORY_35_4_EVIDENCE`: binds the evidence directory inside a supported step runtime.
- `.github/workflows/story-35-4-validation.yml:260` — `runner.temp`: keeps always-upload acquisition bounded even before admission exports exist.

Hosted/source evidence is distinct: immutable push 436 run 41065800967 failed before jobs with fallback run-name; no exact hosted annotation was recovered after bounded routes. Official-checksum-verified actionlint 1.7.12 proved the actual jobs.env schema error at old 29:32, and root reports final actionlint, YAML, nine Bash blocks, embedded JS and parsed-YAML bounded-upload-path checks all exited 0. These checks and targeted High source review are not a new hosted validation or browser/DB/capture pass. The ignored acquisition hash-pin update is separately High-owned and is not authored here; status remains blocked.
Root authorized the concrete projection-loading and empty-reference quality-gap batch within the owned test. One attachDocumentsState call now follows every existing loading/hidden stale-row/count/facet assertion and precedes read.release, yielding exactly desktop1280x800 and phone360x640 captures without a new test, fixture or assertion. The same existing audit family case now also renders the exact JSX fenced in archived EmptyState.prompt.md through the actual admitted EmptyState export. The immutable data.card, source/style bytes and hashes remain unchanged; only the disclosed reference wrapper substitutes the render expression. Empty-pattern metadata/unique names and actual wrapper source.html/SHA distinguish the new empty references from the populated Timeline. Historical prompt copy is illustrative pattern input, not actual Job copy or history; feedback pattern comparisons remain local feedback/Banner comparisons, not whole-application acceptance. Three dirty-input captures remain supplementary nonprimary evidence.

- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:420` — `workspace-projection-loading-hidden-stale-counts`: captures the existing projection branch before releasing its real read.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:163` — `admittedEmptyMarkup`: extracts exact admitted JSX instead of inventing an empty UI.

Source-binding records exact EmptyState component/prompt source paths and SHA256 values. Scoped ESLint/type and four-file collection exited 0 (182 tests; corrected runtime=0). Exact regex literals and replacement template were extracted from the on-disk test and executed offline against actual admitted files: JSX extraction succeeded, Demo replacement retained exact EmptyState JSX, single Babel render/final closing tags were preserved, and the generated render parsed as TSX with zero diagnostics. The literals have single escapes; JSON rendering had doubled their display. Independent Low review reproduced this semantic proof, retracted the escaped-display finding and returned final No findings. Planned image counts are 47 actual +13 reference =60, not acquired images or accepted comparisons. Runtime/SRI/font/image/owner acceptance for this batch remains pending; canonical pins and blocked status are preserved.
### Evidence and limits

AC2/AC3/AC6/AC7 deterministic identity, expiry and denial behavior is covered by the unchanged preview reducer tests; safe projection and distinct empty/error read results are covered by the unchanged Jobs reader tests. Activated browser assertions cover real compact/full rows and exact Stockholm time; existing delayed-response, stored-byte, audit/persistence and dirty-navigation assertions remain intact. Their modal journeys explicitly close the preview before background interaction. The follow-up feedback case asserts tooltip hover/focus/Escape and both manual toast dismissal and five-second expiry independently from ten-second Undo, with unchanged persisted archive/audit observations. Those browser assertions are source changes, not executed coverage yet.

- `tests/unit/features/documents/preview-state.test.ts:15` — `selection switch immediately`: late-result identity and clearing invariants.
- `tests/unit/server/read-models/job-events.test.ts:9` — `16.5-UNIT-EVENTS-01`: safe projection structurally omits private fields.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:430` — `named archive confirmation`: AC4/AC5 identity, visible actions and minimum targets.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:459` — `tooltip dismissal and toast expiry`: AC1/AC6 feedback and independent Undo/persistence assertions.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:738` — `safe compact and full AuditTrail`: AC1/AC4/AC6/AC7 real route rows and exact timestamps.

Executed in this working tree: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/documents/preview-state.test.ts tests/unit/server/read-models/job-events.test.ts` exited 0: 11 passed, 0 failed, 0 skipped. `git diff --check` exited 0. Canonical spec/slice SHA-256 pins match source-binding; approved base is an ancestor of the current branch. Follow-up scoped `pnpm exec eslint` over the four allocated TSX and two allocated browser test paths exited 0 with 0 errors and one existing Next image-element warning. React checklist source inspection retained direct imports, conditional PDF loading, event-driven tooltip state and cleaned-up toast timer; this is not independent review or browser evidence.

Coordinator-reported verification on this scoped working tree: production build, bundle containment, latest typecheck and full lint exited 0 (lint: 31 warnings); audit exited 0 with 3 moderate advisories. Focused BMAD checks passed after the required escalation resolved sandbox temporary-file denial: `pnpm run test:bmad-focused` 2/2 and `pnpm run test:auto-bmad-focused` 26+10+5 = 41 passed, native exit 0. `verify:development` failed its unit lane: first 3,741 passed/37 failed/2 skipped; bounded retained-log second run 3,777 passed/2 failed/1 skipped (3,780 total). The two retained failures are unchanged `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts` at lines 1992 (CRLF/LF body comparison) and 2237 (undefined split); no unchanged-baseline passing run is claimed, and no unrelated fix was applied. Playwright `--list` exited 0 with 87 tests across the two allocated files; actual browser execution was 0. Independent High sensitive review reported no findings. Low source follow-up confirmed the focus fix and the tooltip/toast source-coverage gaps resolved; assertions remain unexecuted browser coverage.

Root-authorized remote-download test compatibility is limited to the owned unsupported-format case. Root-supplied installed Playwright 1.61.1 source/runtime evidence shows Download.path at coreBundle 56762 reaches Artifact.pathAfterFinished at 56621, which rejects remote connections; the runner converts PW_TEST_CONNECT_WS_ENDPOINT to connectOptions and connectToEndpoint at 61171 marks that connection remote. The case now saves an independent runner-local copy with saveAs to a unique test.info().outputPath, checks the same exact bytes and removes only that exact saved copy in finally. The existing downloaded.failure null and suggestedFilename equality assertions remain; remote artifact ownership/lifecycle and production download behavior do not change. This establishes an unavoidable test-transport incompatibility, not a demonstrated product defect; no complete first-failure JSON cause is claimed. The later actual-human focused-CI amendment below extends the same transport correction to the explicitly approved shared Documents case.

- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:704` — `unsupported format`: retains failure, filename and actual authorized-byte assertions.
- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:712` — `saveAs(location)`: supported remote transfer plus exact test-owned saved-copy cleanup.

Focused download-correction evidence: scoped ESLint and tsc exited 0; owned-file collection exited 0 with 84 tests/1 file, browser execution=0. Targeted independent Sol Low review of the exact owned saveAs/cleanup lines returned No findings; the already-reviewed reference capture code is unchanged. Actual remote download verification remains pending and status stays blocked.
Actual authenticated native evidence at `tmp/private/story35-4/normal-959cfbab-browser.json` (artifact 12982844756, authenticated digest `12acd4fcd788173f55b90a6ed0c874d28fbd0a874d5486eea0aa45451e6d6142`) reports exactly 80 executed tests: 78 expected, 2 unexpected, 0 skipped, 0 flaky. This author read the actual failure/source once: both new Jobs viewport cases reach the raw failedRefresh.text assertion after startup, initial persistent rendered error and reload assertions. The body read either has mojibake or fails CDP Network.getResponseBody with no resource data. This proves an ordinary test-transport assertion incompatibility; it does not warrant an adapter/guard/startup/SQL change or explain coarse wrapper failures elsewhere.

The initial narrow Jobs correction matched real RSC transport but targeted Low review correctly found that completed transport plus an old persistent DOM did not prove React adopted that refresh. The original High fixture/fix author then added a unique title-only update through the same planner normal-JWT checked updateJob command, asserting ok/targetId and exact unchanged safe event history. The old header and absence of the new title are asserted before retry. After the matched real current-route RSC GET succeeds and finishes, the exact new header identity must appear BEFORE persistent error/no-empty/no-rows assertions and disarm, proving React adopted the retry. Recovery retains that new title plus the original event IDs/count/timestamps and exact history equality. High source assessment verified SQL appends job_events only on a distinct status change, so this title marker uses normal audited state without inventing event history. Distinct targeted independent High review of that marker returned No findings; the High author owns its sensitive fixture choices. The original selected job/nonce/JWT fault, persistent reload, finally disarm and same-history recovery assertions remain unchanged. No RSC body is parsed, replaced or stubbed, and no skip/timeout widening is introduced. The old native 959cfbab result is evidence for the diagnosis only; the corrected case has not run yet.

- `tests/e2e/jobs/job-workspace.e2e.spec.ts:876` — `currentRoute`: binds the actual retry GET to the current job and tab.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:887` — `refreshedTitle`: requires the unique new server title before persistent-error assertions and disarm.
- `tests/e2e/jobs/job-workspace.e2e.spec.ts:885` — `text/x-component`: requires a completed real refresh before current rendered-state checks.

Focused initial transport correction checks: scoped ESLint and tsc exited 0; Jobs-only collection exited 0 with 11 tests/1 file, corrected browser execution=0. The High marker author separately reports lint/type/11-test collection exit 0 and canonical-LF Jobs source SHA-256 `54b6d356cc51316779106b728b21d2a8a45289d5b1510c739efef67c2cf6749c`; distinct targeted High marker review returned No findings. The corrected marker cases remain unexecuted. All other capture/reference/config/adapter/workflow/SQL/timeouts/shared-test and custody behavior remains unchanged; current corrected runtime and acceptance are pending and status remains blocked.
The separate root-authenticated focused 959 native artifact is `tmp/private/story35-4/focused-959-browser.json`, native-general-browser artifact 12984951139, digest `ffb3d0737a47d0bbdea77ac987a7f0df9d7f5fcf062e9f0f142ccedb4160a776`, run 41067296261 at exact 959cfbab19a0fe37c6ec53703e900493a775efe0. Its paired provenance artifact is 12983818093, digest `c28504f6559205c8dc38ab4f9a532398a863ae6253d49ccc3ad8be07df64ecb3`. Actual native stats are 182 cases: 174 expected/passed, 8 unexpected/failed, 0 skipped, 0 flaky. These are prior-candidate execution counts, distinct from the normal 80-case/78-expected/2-unexpected artifact above and from the still-unexecuted corrected batch.

Six focused failures are ordinary Documents selector/journey compatibility: one audit reference counted seven descendants because the immutable card also contains five PhaseChain list items, four Jobs-source cases attempted the real file panel from Översikt rather than its existing Filer tab (real panel, uppercase UUID, mixed-case UUID, supported job picker), and one quote-acceptance safe-return clicked behind the selected preview modal. The exact archived Demo/Timeline source puts its two Timeline items under the last grid div's direct ol; the assertion and marker selector now scope only those items and still require exactly two. No immutable card, wrapper, reference pixels or count expectation is changed.

Source inspection confirms the real Jobs route mounts EntityDocumentsLink/EntityFilePanel in the files panel, and JobWorkspaceShell exposes the Filer tab with the existing Mer phone overflow. The context helper now activates that actual tab before Job-only entry/panel checks, including UUID return checks; it no-ops for all other owners. It constructs no bypass URL and manipulates no hidden DOM. Quote-acceptance closes only the existing preview Back control after preserving signed URL/bytes and before background return. All original authority/identity/owner/bytes/query/history/security assertions and timeouts remain; genuine history-clearing observations are unchanged. Targeted independent Low review of the exact six-case Docs selector/Filer/modal correction returned No findings.

- `tests/e2e/files/documents-search-preview-lifecycle.e2e.spec.ts:157` — `toHaveCount(2)`: isolates the immutable Timeline while preserving the intended two events.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:102` — `openSourcePanel`: uses the actual Job Filer/Mer journey and leaves other owners unchanged.
- `tests/e2e/files/documents-context-navigation.e2e.spec.ts:750` — `documents-preview-back`: closes quote-acceptance preview before the existing safe return.

Docs scoped ESLint/type and two-file collection exited 0 (137 tests/2 files; corrected execution=0). Together with the High-reviewed two Jobs marker cases this is one eight-case batch, not a claim to publish Jobs alone. Root owns the next candidate-bound execution; no corrected case, image pair or owner acceptance has passed yet. Existing binding amendments already cover these paths; canonical source/test-slice SHA-256 pins were rechecked unchanged. No code outside the three approved test files, fixture authority, adapter/config/workflow/custody/SQL, new review roster, service, Git or CI action was introduced by this author.
Limits: units exercise deterministic/source seams, not rendered UI or production authority. Prior-candidate native browser execution now exists at 959 as recorded above; the corrected eight-case working-tree batch remains unexecuted. Required integration/RLS/recovery and browser/capture evidence must retain their exact candidate/dependency provenance, and no prior success is relabeled as fixed-batch runtime or owner visual acceptance. The frontend controller exited 1 for the dirty candidate; this is not a frontend gate pass. The approved High-authored Jobs empty/error/retry seams now exist in source but remain unexecuted; unit empty/error coverage and source inspection do not satisfy that rendered gate. Distinct independent High review of the complete latest test-only amendment returned No findings, including downstream reader/SQL guards, guarded cleanup, startup contract, capture provenance, JSON serialization and CI upload. This is a source-review pass; runtime and captures remain pending. No managed service was launched by this author. The coordinating agent reports guard DOCKER_UNAVAILABLE (missing Docker Desktop Linux pipe), for lifecycle `93030c01-d8dd-43dd-aa72-acad86b045ec`, recoveryRoute `inspect_only`; Stop acknowledged `stopped`, verified true. Database/browser/capture evidence is blocked pending owner/runtime availability. Native PDF remains an iframe viewer: keys inside its nested browser document do not bubble to the parent Dialog. Its useful native PDF/download behavior is preserved; surrounding Back/header close and keyboard traversal remain available, but iframe-interior Escape is not claimed and needs runtime/manual qualification. Coordinator owns remaining development evidence and REL-1/REL-2/REL-3 candidate/owner reconciliation; exhaustive release validation remains deferred and `release_ready=false`. No merge/deployment or development-complete claim.

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
Dashboard test-only follow-up — 2026-10-30: actual human `Approve test-only correction`, explicitly relayed by root, authorizes only the Dashboard suite helper/exact known fixture call plus source-binding/trail metadata. The helper now verifies the sole-Montör `/my-day` landing then opens `/dashboard`; other roles and all existing dashboard assertions/timeouts remain unchanged. Focused lint, scoped collection (51 tests; execution=0) and diff checks passed as recorded in the same author trail. Targeted independent Sol Low review of the exact Dashboard correction returned No findings. Actual browser verification remains pending. Status remains blocked; runtime and frontend/owner acceptance gates are not passed. No product/config/other-test edit, service, CI dispatch, commit or push was performed by this author.
Modal compatibility/report-path follow-up — 2026-10-30: source-binding.json records actual human `Approve modal test compatibility` and `Approve report-path correction` approvals, explicitly relayed by root, for exactly the two additional test/config paths. Four explicit existing preview-close operations and one config-load JSON output binding are the entire source change. Lint, tsc, network-free file-filtered collections (53 context tests and 51 dashboard tests), installed reporter resolution (2/2) and actual CLI/config JSON artifact-path validation passed as described in the author trail. Targeted independent Sol Low review of the exact modal compatibility/report-path correction returned No findings; browser execution and unresolved functional causes remain pending. No workflow, product, login, unrelated fixture/history/download, service, CI, commit or push change was made. Status remains blocked and canonical source/hash pins remain preserved; immutable runs on 39ee do not cover this working-tree correction.
Reference/relationship capture preparation — 2026-10-30: added only independent reference capture code in the owned selected-document suite and two actual context-return captures in the owned context-navigation suite. Planned image inventory is 45 production actuals plus 11 distinctly labeled family references; exact wrapper HTML/source hashes and non-authoritative candidate metadata accompany references. Scoped lint/type/source-hash checks and service-free collection (137 tests, execution=0) passed; no local browser, service, CI dispatch or Git write was performed. Targeted independent Sol Low review of this exact reference/capture/context code returned No findings; the 56 planned images and their runtime rendering/acceptance remain pending. Source bytes, canonical pins, unsupported-download behavior and blocked status remain unchanged. Root owns the next candidate-bound hosted execution and acceptance; prior immutable artifacts do not cover this uncommitted preparation.
Owned remote-download follow-up — 2026-10-30: root authorized replacing only the unsupported-format case remote Download.path call with saveAs to a unique runner-local test artifact. Failure=null, exact suggested filename and exact stored-byte comparison remain, with finally removal scoped to that saved copy only. Scoped lint/type/collection passed (84 tests; browser execution=0). Targeted independent Sol Low review of the exact owned saveAs/cleanup lines returned No findings; actual browser verification remains pending and the complete first-failure assertion remains unknown. No other download suite, capture/reference implementation, product, service, CI or Git write was changed. Source pins and blocked status remain preserved; no full first-failure JSON or runtime pass is claimed.
Focused CI/shared-test follow-up — 2026-10-30: actual human `Approve focused CI amendment` is recorded in source-binding.json with root-relayed provenance, exact shared-test/workflow path additions and separate High workflow authorship/review-reuse requirements. Only the approved shared download saveAs/cleanup and exact known-installer landing test changes were made by this author. Scoped lint/type and service-free four-suite collection passed (182 tests, browser execution=0); installed workflow SHA matches the root-approved bytes. Targeted independent Sol Low review of the exact two shared-test fixes returned No findings. Root verified the exact workflow bytes and unchanged relevant dependencies for valid distinct High review reuse. Canonical body/hash pins and blocked status remain unchanged. Prior full CI and unknown first old failure JSON do not supply focused runtime or visual proof; root owns the focused candidate execution/publication.
Hosted-context metadata follow-up — 2026-10-30: source-binding retains the historical original workflow approval/hash/review and separately records current canonical-LF hash c52aac68b235fcd99197d08b11cc05826342a711331592410e507ced9866e641 plus the specific High-authored context/export/always-upload fix and distinct targeted High No-findings review. Immutable failed 436 receipt/run 41065800967 remains historical; actionlint/source checks do not imply new hosted/runtime success. Only source-binding and this author trail were refreshed by this author. Canonical body/hash pins and blocked status are unchanged; root state, code/tests, acquisition parser, services, CI and Git writes remain untouched.
Jobs armed-retry native-evidence follow-up — 2026-10-30: immutable authenticated 959cfbab native JSON reports 80 tests, 78 expected/2 unexpected/0 skipped/0 flaky, with failures at raw RSC body inspection after startup/initial rendered-error/reload checks. The source-proven ordinary test assertion now checks matched real RSC GET/current route, HTTP/content type/completion and retains current rendered error/no-empty/no-rows/job identity before the unchanged disarm/recovery flow. Scoped lint/type/Jobs collection passed (11 tests; corrected browser execution=0); targeted Low review follows. No adapter/config/workflow/SQL/custody/timeouts/shared-suite edit was made. Old native evidence is not a future corrected-run pass; canonical pins and blocked status remain preserved.
Complete eight-case batch reconciliation — 2026-10-30: prior focused 959 native JSON reports 182/174 expected/8 unexpected/0 skipped/0 flaky, while the separate normal native artifact reports 80/78 expected/2 unexpected/0 skipped/0 flaky; exact artifact/run/digest identities are retained in the same author trail. Final batch combines the attributed High-owned title marker/React-adoption proof (distinct High review No findings) and the six Low-owned Docs Timeline/Filer/modal journey corrections (targeted Low review No findings). Scoped checks/collections passed as recorded; all corrected cases and image acceptance remain unexecuted. This author changed only its approved Docs files plus this metadata, never the High-owned Jobs file after handoff. Root must integrate the three-test-file batch and trail together before publication. Canonical source/hash pins, blocked status, immutable native receipts and root-state ownership remain preserved.
Capture-gap batch reconciliation — 2026-10-30: one existing projection-loading attachment plus two exact admitted EmptyState pattern references are prepared in the owned selected-document test, with separate populated/empty wrapper bytes and source hashes. Source-binding metadata records 47 planned actuals, 13 planned references, 60 total, and three supplementary dirty-input actuals. Focused lint/type/182-test collection and actual-file offline extraction/replacement/TSX semantic checks passed; final targeted Low review returned No findings after retracting the escaped-display concern. Current batch runtime/visual/owner acceptance remains pending. Only the owned test and its story/source-binding metadata changed in this batch; no immutable source, product, fixture, new test, timeout, service, CI or Git action was introduced. Canonical source/hash pins and blocked status remain unchanged.