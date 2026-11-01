---
title: "Story 35.5: Authorized Responsive Shell"
type: feature
created: 2026-11-01
status: blocked
review_loop_iteration: 0
warnings: [oversized]
context:
  - ../SPEC.md
  - ../source-binding.json
  - ../../../../docs/process/review-order.md
  - ../../../implementation-artifacts/spec-35-5-authorized-responsive-shell.md
  - ../../../test-artifacts/dt-2026-10-23-test-design/slice-35-5.md
---

## Operative admission — 2026-11-01

The owner individually approved Story 35.5 and its exact two-file allocation, as relayed in the root assignment. This operative adapter supersedes the copied historical preparation-only conditions for this assignment only. Preserve the canonical AC1–AC7, state/test identities and applicability classifications below. Historical relative links resolve against the original canonical source directory.

Implement only presentation in `src/components/app-shell/AppShell.tsx`; tests may change only `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`. Consume the existing server-filtered navigation DTO; preserve canonical authority/order, supplied destinations, session semantics and downstream protected navigation. No client capability fallback or payload expansion. Initial mobile Drawer is composition within the allocated shell. Unallocated needs require an exact bounded amendment before writing.

Current root ownership clearance and source pins are recorded in source-binding.json. Ordinary presentation is Sol Low; new auth, navigation authority, privacy or contract decisions require a recorded distinct Sol High delegate and independent sensitive review. Current development, candidate-bound initial visual acceptance and release responsibility gates remain; release_ready=false. This draft adapter starts no implementation or pipeline phase and grants no merge or deployment authority.


## Operative planning contract — 2026-11-01

This section governs this individually approved execution adapter. The canonical historical body below remains verbatim source evidence: its preparation-only status and prospective multi-path lists are historical, not the current allocation. This planning run stops before implementation. **Status: blocked — intent gap: owned state-to-caller binding remains incomplete.** No requirement is dropped or added to force readiness.

<intent-contract>

## Intent

**Problem:** The authenticated shell needs accepted responsive composition while continuing to display exactly the current server-authorized destinations and tenant identity. The approved allocation is presentation in `src/components/app-shell/AppShell.tsx` and assertions in the existing `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts` only.

**Approach:** Compose the received navigation into accessible presentation sections without changing its flattened order, hrefs, labels, icon data or grants. Reuse current semantic tokens, identity/profile/notification/sign-out consumers, protected ordinary links and existing authority regressions. Bind frozen AC/state/test IDs to actual callers before implementation admission.

## Boundaries & Constraints

**Always:** Preserve canonical E35-5-AC1–AC7, E35-5-T-AC1–AC7 and state/test identities and their original Applies/Inherited regression/N/A classifications. Preserve `AppShellContext`, supplied DTO, tenant resolution, live server checks, role landing, session/sign-out, every real destination and downstream protected-input/history decisions. Group only received items into contiguous presentation runs so concatenated links equal the supplied order exactly. Existing server authorization remains decisive after revocation; immediate push removal of stale rendered links is not required.

**Block If:** An owned frozen row has no exact actual caller/trigger/assertion; a necessary behavior needs another production/test path; grouping needs changed authority/order; or execution would require an unsupported fixture, expanded payload or new auth/session/navigation contract. Record the precise bounded amendment needed rather than choosing a policy.

**Never:** Edit any other product/test path, SQL, dependencies, stylesheets, workflows, source packets or source-binding pins. Add client grants, a capability map/fallback, identity selector, endpoint, shell fetch protocol, new pending/Phase C surface, offline queue, new editor/file flow, prototype data or fabricated runtime evidence. Planning performs no implementation, service launch, git mutation, PR, merge or deployment.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected output / behavior | Error handling |
| --- | --- | --- | --- |
| Authorized navigation | Received role-filtered DTO plus display context | Each supplied destination appears once in original flattened order; tenant label/current route remain visible | Never backfill absent links |
| Phone drawer | Connected 360×640; keyboard/touch open and close | Named modal drawer traps focus; Escape/explicit close restores trigger; active route is identified | Existing protected route decisions run before history commits |
| Stale link | Authority revoked after render | Current destination/server denial wins; no privileged stale action succeeds | Generic denial, then fresh authorized projection; no immediate push promise |
| Missing state binding | Frozen Applies row without actual caller/trigger/assertion | Preserve its identity and classification visibly | Block; do not manufacture API/state/fixture or mark inherited proof as owned coverage |

</intent-contract>

## Code Map

All paths below resolve from `C:/DEV/K35-5-shell`; only the first two are implementation write allocations.

- `src/components/app-shell/AppShell.tsx:31` — display-only context; `NavLinks:44` maps supplied DTO; `AppShell:105` receives resolved context/navigation; `closeDrawer:134`, `handleDrawerNavigate:140`, `onDrawerKeyDown:167` own drawer focus/close/keyboard behavior. Sidebar at 221, topbar at 241, main at 309 and named drawer at 333 are composition points. No request/status/retry/A–B selection API exists in these props.
- `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:22` — existing seller expected order; `logIn:36`; tests at 54/66/81/91/101 preserve exact order, generic denial/no private data, withheld money, customer and quote affordance boundaries. Extend this file; retain existing test identities/assertions.
- Read-only `src/app/(app)/layout.tsx:54`, `:69`, `:79` — tenant/job admission and supplied DTO; genuine unavailable branch. `src/server/authz/phase-a-surface.ts:11` derives navigation by filtering canonical order. `src/components/app-shell/nav-items.ts:29` remains canonical, read-only.
- Read-only `src/components/app-shell/RouteAccessBoundary.tsx:21` — entry authority check, with distinct job unavailable/denied at 25–29. This is evidence of an existing seam, not an allocated edit.
- Read-only `tests/e2e/global-setup.ts:1095` — established administrator/project-manager/finance identities; `:1102` serializes only `roleAware.saljare` and `.montor`. Never assume additional `roleAware` fields. `tests/factories/tenants/core.ts:262` provides isolated five-role fixture plus paired cleanup; revoke an isolated account, never a shared run-wide one.
- Read-only `tests/e2e/jobs/job-workspace.e2e.spec.ts:418` (`16.5-E03`, cancel/sidebar/history checks at 488–527), `:564` (`16.5-E04`), `:661` (`16.5-E05`) preserve selected-child/draft/late-result regressions. Existing capture-phase anchor guards in `src/components/jobs/JobCardForm.tsx:64–104` must continue to receive ordinary links.
- Read-only `tests/unit/server/authz/phase-a-surface.test.ts:9` and `tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts:145` — reuse actual authority/matrix/projection regressions; source presence is not execution evidence.
- Read-only `src/app/globals.css` supplies current semantic color/font/spacing/radius/motion tokens. Accepted DESIGN.md layout at 208 and AppShell row at 234 require 248px sunken desktop sidebar, 56px header, white canvas and 2px ink selected marker. Use existing tokens through shell-local classes; no global edit. EXPERIENCE.md:62 preserves drawer and protected draft behavior.

## Tasks & Acceptance

**Execution, after the blocking contract resolution:**

1. `src/components/app-shell/AppShell.tsx` — compose supplied navigation into labeled presentation sections; preserve flattened DTO order, identity, active marker, notification/profile/settings/sign-out destinations and existing links. Apply current accepted semantic tokens, desktop geometry and responsive shell-local sizing. Keep phone targets at least 44px, overflow labeled, keyboard/visible focus, 16px phone/24px desktop content gutters and reduced motion for actual changed motion. Preserve current medium rail behavior unless a verified screen-level composition choice is recorded.
2. `src/components/app-shell/AppShell.tsx` — retain named drawer composition, opening focus, Tab wrap, Escape/explicit close/restoration, scroll cleanup and resize behavior. Ordinary route anchors must retain downstream dirty-input interception; avoid premature router/history changes. Do not introduce a new editor or dialog contract.
3. `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts` — preserve existing assertions; add canonical test IDs to meaningful supplied-order/tenant/active-route, desktop/360×640, focus/close/reflow/target checks and isolated revoke-after-render authority assertions using actual fixture exports. Verify current sign-out behavior without changing session semantics. Reuse unchanged source-owner tests for inherited behavior rather than copying a new suite. Resolve the blocked owned-state matrix before selecting controlled failures/delays.
4. This id-keyed story — implementation author records actual evidence, source-owner regression reuse with exact revision/counts/skips, and one final author-written Suggested Review Order after implementation. Root owns git, pipeline and publication.

**Acceptance criteria — operative Given/When/Then bindings:**

- **E35-5-AC1 / E35-5-T-AC1:** Given current server-filtered navigation for an established role, when the shell renders at desktop or phone, then grouped flattened destinations equal that DTO in order exactly, with tenant identity, active marker, notifications and real destinations preserved; pending/unbuilt actions remain absent.
- **E35-5-AC2 / E35-5-T-AC2:** Given the authenticated shell, when keyboard/touch opens and closes the phone drawer, then its name, focus trap, Escape/explicit close and trigger restoration work; desktop uses 248px sidebar/56px topbar, and inherited cancel-protected navigation retains input/selection before history commit.
- **E35-5-AC3 / E35-5-T-AC3:** Given current tenant/session/role resolution and an isolated rendered stale link, when authority is revoked and navigation attempted, then current server denial wins and fresh projection/role landing remains authoritative; selected-child return and sign-out keep existing semantics with no client identity switch or expanded payload.
- **E35-5-AC4 / E35-5-T-AC4:** Given actual Swedish fixture identity connected at 360×640 and representative desktop, when the user traverses the bounded shell journey by keyboard/touch with text enlargement, then identity/actions/errors stay reachable, phone targets are at least 44px and overflow is labeled; no layout assertion substitutes for persisted-domain proof.
- **E35-5-AC5 / E35-5-T-AC5:** Given the actual adapted drawer and affected existing consumers, when focus/close/protected navigation or late results occur, then existing name/trap/restoration and dirty/late guards remain; actual motion respects DESIGN and reduced motion without adding absent dialogs/editors.
- **E35-5-AC6 / E35-5-T-AC6:** Given each original Applies row's resolved real caller and controlled authoritative outcome, when its trigger executes, then its original state/test identity and honest outcome hold; inherited regressions remain inherited and N/A rows instantiate no feature. This criterion is blocked by the table below, not waived.
- **E35-5-AC7 / E35-5-T-AC7:** Given unchanged checked authority/domain consumers, when shell presentation and essential regressions run, then current permissions, withheld payload, money/provenance/transaction/file-lock contracts remain and evidence distinguishes development acceptance from separately owned release work; `release_ready=false`.

## Design Notes

Grouping is presentation over the received array; contiguous runs avoid importing a new client grant/route registry or changing canonical order. Shared existing controls may be sized by shell-local wrappers, without editing their owning consumers. No new screen reference or candidate acceptance is implied by the frozen design source.

## Blocking state-to-caller decisions

Distinct context-free assessment `/root/plan/sensitive_contract` used **gpt-6.1-sol / High**, after route/reason were recorded to root before dispatch. Reason: actual auth/navigation authority/privacy/contracts and meaningful revocation/fixture binding. It confirms the two-file presentation allocation is viable, but **readiness is not earned until these owned frozen rows have exact actual caller/trigger/assertion bindings**. This is not proof that expanded production scope is necessary.

| Preserved Applies IDs | Actual seam and unresolved binding |
| --- | --- |
| `E35-5-STATE-loading` / `E35-5-T-loading` | AppShell receives resolved props, not an authoritative request lifecycle. Identify a real route/RSC transition with controlled delay and observable retained selected identity; no invented shell fetch API. |
| `E35-5-STATE-unavailable` / `E35-5-T-unavailable` | Genuine job-admission unavailable feedback/retry exists in layout/RouteAccessBoundary. Confirm this composed caller is the intended owned binding and its exact fixture/trigger; absence of pending links alone is insufficient. |
| `E35-5-STATE-connection-required` / `E35-5-T-connection-required` | SignOutButton has generic failure/session retention/retry, and NotificationBell has independent read/ack state. Neither observation by itself binds the frozen persistent connection explanation and retry requirement to an owned shell caller. |
| `E35-5-STATE-error-retry` / `E35-5-T-error-retry` | Bind definite rejection/retry at an actual existing command, preserving that command's independent outcome. Do not invent a shell command or alter sign-out/notification semantics. |
| `E35-5-STATE-late-result` / `E35-5-T-late-result` | Identify exact owned A/B route/RSC identity and controlled completion ordering; existing job selected-child late-result regression remains inherited and cannot silently replace an owned row. |

`loaded`, `denied`, `revoked` and `focus-dialog` retain their Applies identities and available seams described above. Inherited `dirty-navigation`, `submitting`, `unknown`, `confirmed`, `stale` and N/A `empty`, `no-match`, `validation`, `locked`, plus no owned file command, remain exactly as classified in the canonical body.

**Narrow question for source owner/Coordinator:** Which exact existing composed callers and authoritative triggers bind each unresolved owned row? If a row genuinely needs missing behavior, provide a bounded behavior/path amendment, or explicitly correct the source ownership/requirement. Do not authorize new auth/session behavior or reclassification by inference. Resume when these bindings are recorded and independently assessed at High; no broad census or repeat vote on settled decisions is needed.

## Verification

Planning evidence only: canonical spec SHA-256 `90c20699b840d864f62769b6d4f51dce6ac7a77ee460571531ef0eb4ed31988b` and test-slice SHA-256 `80578a8d8522ba2987b9963e6d2a7197b9c1ec9f5787635bfae944f8f6c65a03` were rechecked and match source-binding.json. Root's native git reads (all exit 0) verify clean `codex/story-35-5-responsive-shell` at `d098533bcc54a3edaff5dfdcfdf784b5f0a7c5e9`; this delegate's sandbox git reads could not enter the worktree. No git mutation performed.

Later implementation follows current required CI/completion policy: applicable typecheck/lint/unit/build/lock/audit/containment, full required integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, focused allocated browser tests plus unchanged affected inherited regressions, guard-owned production-server 360×640/desktop evidence, independent review (High for sensitive scope), and `node scripts/quality/frontend-controller.mjs local --base <actual-full-recorded-baseline>` before completion. Use the existing completion wrapper for pipeline mutations; no direct helper bypass. Initial candidate-bound visual reference acceptance remains required; no rendered/functional pass exists from this planning run. UI implementation author owns REL-1 follow-up, QA/accessibility owns REL-2, Coordinator owns REL-3 in existing delivery/deferred ledger; exhaustive release work remains unexecuted and `release_ready=false`.

## Spec Change Log

2026-11-01: Added operative bounded plan and preserved canonical body verbatim. Frozen owned-state binding gap blocks readiness; no acceptance identity/classification changed. Renderer attempt receipts remain in root pipeline history: initial sandbox interpreter metadata failure; elevated request rejected before launch; fresh default-sandbox invocation with workspace-local process TEMP/TMP/cache succeeded exit 0. No global environment change or elevated renderer execution occurred.

## Review Triage Log

No code-review round executed. Distinct High planning assessment only; independent exact-candidate implementation review remains required.

## Auto Run Result

Status: blocked
Blocking condition: intent gap — five frozen Applies state/test rows lack exact actual owned caller/trigger/assertion binding under the two-file presentation allocation; see Blocking state-to-caller decisions. Halt after planning; implementation not started. No completed-implementation review trail required or manufactured.

## Preserved canonical historical body

The following source body is retained unchanged. Historical relative links resolve from `_bmad-output/implementation-artifacts/`, and historical approval/path/status language is superseded only for this assignment by the operative admission and planning contract above.

# Story 35.5: Authorized Responsive Shell

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-SHARED B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-1d visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-5-AC1.** Group current server-authorized active nav destinations while preserving tenant identity, active marker, notifications and all real destinations. Pending modules and unbuilt E17/E18 actions stay absent; no new capability map.

2. **E35-5-AC2.** Desktop sidebar 248px/topbar 56px; phone named drawer traps/restores focus, supports Escape/explicit close and active-route identification. Route transitions pass existing protected-input decisions before committing history.

3. **E35-5-AC3.** Preserve tenant resolution, live entitlement filtering, role landing and sign-out. Verify capability revocation and selected-child return; no prototype identity selector or broadened client payload.

4. **E35-5-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-5-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-5-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-5-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.4; E15 shell/nav/registry reconciliation.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

Implicit shell around all MAIN IDs; FIELD hem/jobb navigation; pending IDs omitted. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: All authenticated destinations, sign-out and role landing.

Prospective consumers: src/components/app-shell/AppShell.tsx; src/components/app-shell/nav-items.ts; src/scope/manifest.ts; src/scope/widget-registry.ts.

- `src/components/app-shell/AppShell.tsx` — `AppShellContext, AppShell`; SHA-256 `165086797092cefd976eb9f8463a6a0b58ea6c38546c920e600ec3c2943cdc4d`.
- `src/components/app-shell/nav-items.ts` — `NavItem, navItems`; SHA-256 `c25b7fccf6cde909a69d410454139203e9c7e253c882d8bdcdbf8a11eb76e15d`.
- `src/scope/manifest.ts` — `SCOPE_MANIFEST`; SHA-256 `6f52dcedc9c4eca4a3fcb915488cc8bae05f8bcf0933f51c5d057d8991e6211f`.
- `src/scope/widget-registry.ts` — `WIDGET_REGISTRY, eligibleWidgets`; SHA-256 `e776fe1675baa24491e252c62780e45f4448919c34293c4ab4ad38f07d696ee2`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. Shell/nav/drawer owns no new domain editor or file operation; preserve consumer guards and sign-out semantics.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, denied, revoked, unavailable, connection-required, error-retry, late-result, focus-dialog | dirty-navigation, submitting, unknown, confirmed, stale | empty, no-match, validation, locked |
| Files | N/A: No shell file command; destination file behavior belongs to its feature. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Shell owns no file mutation; existing destination file authority remains with 35.4/35.11. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-5-STATE-<name>` and `E35-5-T-<name>`. Every specific AC has proposed test ID `E35-5-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: Current nav/manifest coherence and role-surface browser regressions. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-5-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

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
