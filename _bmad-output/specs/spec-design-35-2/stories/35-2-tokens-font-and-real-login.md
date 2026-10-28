---
title: 'Story 35.2: Tokens Font And Real Login'
type: feature
created: '2026-10-28'
status: ready-for-dev
tracking_key: 35-2-tokens-font-and-real-login
baseline_revision: 65be26c5e6e2923ea0298160f4da54a987bed0fe
planning_revision: d5fc62a88a25bf345754e3f62e5bbea7af964337
review_loop_iteration: 0
followup_review_recommended: false
context:
  - docs/process/review-order.md
  - docs/quality/frontend-quality-gate.md
  - docs/quality/story-35-2-approved-admission-2026-10-28.json
  - docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md
  - _bmad-output/test-artifacts/test-design-spec-design-35-2.md
  - _bmad-output/specs/spec-design-35-2/source-binding.json
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Approved Story 35.2 has accepted foundation/login direction, but the actual application still uses Geist, generic colors and its original password-login presentation.

**Approach:** Bind the approved official Inter v4.1 assets and written semantic tokens to the existing Tailwind v4/root layout, then compose the real credential form using accepted source grouping and the existing authentication seam. This is the sole admitted story, with a checkpoint after completion.

## Boundaries & Constraints

**Always:** Preserve all canonical AC/state/test IDs and applicability below, exact approved source hashes, Swedish content, server-derived role landing, refresh-before-replace, safe errors and browser-safe client. The dated human admission supersedes historical preparation blockers only where evidenced. Preserve canonical body verbatim. Resolve its relative links against `_bmad-output/implementation-artifacts/spec-35-2-tokens-font-and-real-login.md`, never this adapter directory. Canonical test slice resolves from its own original path. Actual written DESIGN/EXPERIENCE and detailed annex supersede prototype styling. Read the High test plan rather than reinvent authentication policy.

**Block If:** New sensitive behavior/uncertainty requires bounded Sol High assessment before deciding, and independent High review. Conflicting live ownership or required writes beyond allocated paths need exact coordinator reconciliation. Missing actual runtime/visual acceptance blocks development completion, not this planning exit. Trusted-main source/policy integration remains a hosted acceptance dependency; no source override/bypass is authorized.

**Never:** Add auth protocols, receipts, endpoints, signup, reset, BankID, demo impersonation, new file/dialog flows, forced-state hooks, framework/dependency upgrades, numeric-spacing-scale replacement without impact evidence, legacy browsing, other E35 work, global trackers, merge or deployment. Do not change immutable source assets or promote prototype styling/photos/logos into production authority.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Existing entitled account | Actual email/password succeeds | Existing refresh then root replace; server resolves current tenant and role destination | No client authorization shortcut |
| Invalid credentials | Existing Auth error then corrected explicit submit | Generic Swedish alert, input retained, no navigation until success | Do not enumerate accounts or invent field validator |
| Pending | Hold actual sign-in promise; click/Enter again | Readable pending text, disabled action, one active attempt | Observe actual handler; High assessment before any sensitive fix |
| Connection failure | Existing seam rejects | Safe persistent feedback and explicit recovery, suitable in-memory values retained | No durable credentials or auto-retry |
| Unknown outcome | Response lost after dispatch | No claimed success; ordinary server/session navigation reconciles authority | Preserve SDK evidence limits; no new status/receipt protocol |

</intent-contract>

## Code Map

- `src/app/globals.css:1` — Tailwind import and single inline theme; currently only Geist alias/body colors. Add semantic aliases from DESIGN without replacing inherited numeric utilities.
- `src/app/layout.tsx:2` — current Geist import; replace with local approved normal/italic font binding while preserving `lang="sv"`, metadata and body structure.
- `src/app/(auth)/login/page.tsx:19` — `LoginPage`; state and `handleSubmit` at line 26 own the current checked Auth seam. Presentation starts at line 60. Keep behavior seam proportional; no new framework.
- `src/server/db/supabase-browser-client.ts:18` — `createSupabaseBrowserClient`, read-only public/cookie client dependency.
- `src/app/page.tsx:14` — `Home` resolves tenant context then `resolveLandingRoute`; read-only role authority. `src/app/(app)/layout.tsx:42` rechecks context, navigation and protected shell.
- `docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md` and source-binding consumer hashes enumerate read-only app/operator/public, jobs, documents/files, booking, scheduling/time/Min dag and calendar-settings inheritance. ICS is not styled. These are regression consumers, not edit allocation.
- `_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md` and `EXPERIENCE.md` are actual frontend-skill authority paths; use `src/` conventions. No Figma URL, generic nextjs-app path, forced-state hook or prescribed three-layer framework is introduced.
- `_bmad-output/planning-artifacts/design-transition-2026-10-23/reconciliation-2026-10-28/font-provenance.json` and `Inter-v4.1-LICENSE.txt` bind approved official release members. Production binaries must match admission hashes; supplied v1 fonts are not the selected production bytes.
- `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts`, `role-aware-phase-a-surface.atdd.e2e.spec.ts`, `operator-console.atdd.e2e.spec.ts` are existing real-cookie/landing and inherited guards. Unit resolver/authz and integration authority tests are enumerated by the High test plan.
- `docs/quality/references/story-35-2-2026-10-28/capture-manifest.json` binds raw immutable source PNGs and hashes at 1440×900/360×640. They show source idle/focus/grouping only, not accepted candidate UI or auth behavior.

## Tasks & Acceptance

**Execution (ordered):**
- [ ] `docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md`, source-binding and admission — recheck current ownership/base/source hashes before edits; inventory all root-style consumers.
- [ ] `src/app/fonts/InterVariable.ttf`, `src/app/fonts/InterVariable-Italic.ttf`, `public/licenses/inter/OFL.txt` — copy unchanged official v4.1 members from verified release provenance, compare all three admission hashes and preserve full license; never mutate v1.
- [ ] `src/app/globals.css`, `src/app/layout.tsx` — bind one local Inter variable font family (400/500/600 and italic), semantic color/space/type/radius/motion aliases, white canvas and tabular-number affordance. Audit inherited effects before/after; keep changes bounded.
- [ ] `src/app/(auth)/login/page.tsx` — apply plain wordmark and constrained responsive real-credential composition, ≥44px controls, readable pending/errors, associated labels, visible focus and reachable actions. Retain state/validation/actions separately from replaceable markup proportionally. Assess observed duplicate/unknown behavior under High before changing sensitive handling.
- [ ] `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts` — extend actual caller tests for invalid→corrected, delay/duplicate, rejection/recovery, keyboard and role landing using existing fixtures. A narrow handler test, if necessary, belongs at `tests/unit/auth/login-submission.test.ts`; mock only the existing client/router seam and record that it cannot prove real session authority.
- [ ] Existing auth/role and bounded consumer test files identified by the High plan — verify affected inherited paths; add no N/A feature/test program. Capture actual candidate states and contrast in the frontend evidence package with source/build/revision provenance.
- [ ] This story adapter — record commands/counts/skips/limitations, independent review and author-written final Suggested Review Order after implementation. Root owns publication/PR/agent-fix/exact-head CI and acceptance coordination; builder must return visual blockers honestly.

**Acceptance Criteria (canonical IDs, no reduced scope):**
- Given the real login and inherited consumers, when semantic foundations render, then white/ink, accepted spacing/type/radii/motion and one Tailwind source satisfy E35-2-AC1.
- Given approved official roman/italic/license bytes, when packaged and rendered, then Inter 400/500/600, plain wordmark, tabular numerals and measured actual text/non-text contrast satisfy E35-2-AC2.
- Given the real credential form, when invalid, pending, failed, recovered or keyboard-submitted, then actual safe states and unchanged server role landing satisfy E35-2-AC3.
- Given connected 360×640 and 1440×900 with Swedish content, when touched, tabbed, enlarged or keyboard-occluded, then controls/errors/actions remain usable and current account identity is authoritative under E35-2-AC4.
- Given actual adapted controls and affected inherited dialogs, when focus/motion/navigation is exercised, then existing applicable focus restoration/guards and reduced motion satisfy E35-2-AC5; no new modal is required.
- Given the canonical applicability matrix, when owned state assertions run, then all nine Applies IDs remain honest, revoked remains inherited and N/A rows create no flow under E35-2-AC6.
- Given checked server commands/entitlements and affected consumers, when the UI changes, then authority, money/provenance/integrity/file protections and development/release distinctions remain intact under E35-2-AC7.

## Spec Change Log

2026-10-28 planning: added concrete ordered execution map and Given/When/Then bindings around immutable approved body. Dated approval resolves historical preparation status; source references are now captured with explicit source-only provenance. KEEP all canonical AC/applicability/test IDs and High test-design constraints.

## Review Triage Log

No implementation review run in this planning phase.

## Design Notes

Owner-authorized routine composition follows the existing binding: constrained credential group, white background, Inter 500 plain wordmark, sunken fields, ink action, 8px controls and no rest shadow. Use 16px phone gutters and existing token rhythm. Desktop/photo/logo/BankID/demo/reset prototype extras are excluded from accepted composition. Raw source phone export may overflow; it is grouping evidence, not the required responsive result. No pending/error source screenshot is fabricated. Their written requirements and real implementation states supply later comparison inputs. Source captures do not modify `policy.references` or establish owner acceptance.

Route: Sol Low planning/token/font/presentation; existing Sol High test design reused with provenance. No new sensitive judgment made here. Actual auth-state changes route to bounded Sol High then independent High review.

## Verification

Implementation commands: `pnpm install --frozen-lockfile`; `pnpm run verify:lockfiles`; `pnpm typecheck`; `pnpm lint`; `pnpm test`; `pnpm build`; containment/bundle checks and required CI policy. Required integration/RLS uses `SUPABASE_TEST_REQUIRED=1` with executed/failed/skipped counts. Use configured production Playwright server, guarded resources and essential real login/role/inherited journeys; no next dev. Run `pnpm exec playwright test tests/e2e/auth/login-and-tenant-context.e2e.spec.ts` plus affected role/operator/consumer cases from the High plan. Preserve its 16 traceability bindings (seven AC + nine owned states), not 16 invented test functions.

Before completion run `node scripts/quality/frontend-controller.mjs local --base 65be26c5e6e2923ea0298160f4da54a987bed0fe` and use the project completion wrapper for any delivery/status helper. Actual clean committed candidate/one PR/current-head owner foundation visual acceptance are future prerequisites. Trusted main 734d source/policy mismatch is a hosted integration dependency; local 65be paired-source validation is distinct. Do not weaken controller/protection or claim hosted readiness. Exhaustive release matrices remain E35-2-REL-1/2/3; release_ready=false.

Planning evidence: inspected HEAD d5fc62a88a25bf345754e3f62e5bbea7af964337 and intended branch, clean tree before planning writes; no product delta from approved 65be baseline. Renderer invoked exactly once. Source captures used existing root-owned Chrome through an isolated Playwright context and closed only that context. No application tests, product edits, auth service, implementation completion or acceptance claimed.

## Auto Run Result

Status: ready-for-dev
Blocking condition: none for planning; halt-after-planning requested.
Implementation acceptance dependencies: actual candidate functionality/contrast/captures, independent review, initial authenticated owner visual acceptance, exact-head CI and trusted hosted source/policy integration. Review-order completion hook: planning exit preserved; no completed trail manufactured.

## Canonical approved content (verbatim body)

# Story 35.2: Tokens Font And Real Login

## Status

Full bounded preparation specification, **not approved or ready-for-dev**. Final package identity only; no sprint row, code claim or implementation admission. Blockers: B-BASE B-SHARED B-FONT B-TEST B-APPROVAL.

## Story

As an entitled existing user, I want this bounded accepted-design flow, so that I can perform its current operations with clear, accessible and authoritative outcomes.

## Intent and scope

DT-1a visual/composition follow-up (35.1 is documentation/readiness). IN: routes and ACs below. SEAM: current checked domain commands/read-models. DEFERRED: unsupported prototype concepts, pending modules, E19.2/E21–E34 checkpoint depth. Completed stories keep original evidence; index links this follow-up to predecessors.

## Acceptance Criteria

1. **E35-2-AC1.** Bind accepted colors, spacing, typography, radii and motion to existing Tailwind v4 semantic aliases. White page, ink actions, Inter 400/500/600 and tabular numerals; controls/chips/cards 8px, sheets 12px. No second token runtime or framework replacement.

2. **E35-2-AC2.** Adopt supplied Inter roman/italic only after production provenance/licensing evidence. Plain Kopplas wordmark; neutral purposeful placeholders only. Measure actual disabled/inverse/composite text at least 4.5:1 and non-text focus/control contrast; no n300–n500 text on light surfaces.

3. **E35-2-AC3.** Complete real sign-in with invalid credentials, loading, connection failure, keyboard submission and unchanged role landing. Audit global inherited effects on jobs/files/booking dialogs before edits; a file-disjoint E15 consumer is still a semantic conflict.

4. **E35-2-AC4 — Connected accessible journey.** Complete the bounded journey connected at 360×640 and representative desktop with actual Swedish content/record identity. All phone targets ≥44px, keyboard/touch equivalents and labeled overflow; text enlargement and virtual keyboard do not hide actions/errors.

5. **E35-2-AC5 — Focus and protected navigation.** For actual adapted dialogs/sheets, preserve accessible name, trapped focus, Escape/close and trigger restoration. Preserve dirty-navigation/late-result guards in owned or affected consumers as classified; no new editor/dialog is required. Apply DESIGN motion only where motion exists, with reduced motion.

6. **E35-2-AC6 — Honest states and files.** Apply only the rows classified Applies in this spec’s applicability table under its state/test IDs; preserve Inherited regression rows when affected and exclude N/A rows. Denied is not empty, absent money is not zero, retained input is unsent. Unknown outcomes reconcile before consequential retry. Owned file consumers retain their applicable independent outcomes and selected authority; unowned file rows are inherited or N/A, never a reason to add uploads. No common local receipt.

7. **E35-2-AC7 — Preserved contracts and evidence.** Keep current checked commands, permissions/entitlement projections, integer-öre/tax, ADR-B008 provenance, transaction/facts/proof/stale and file-lock semantics. Distinguish essential development evidence from separately owned release obligations; no pending module or Phase C surface.

Visual gate for actual changed UI: accepted DESIGN/EXPERIENCE plus detailed annex. Animation checks cover existing adapted motion only (DESIGN durations and reduced motion), not new transitions. Essential function/accessibility/contrast blocks development completion; exhaustive screenshot/device comparison remains release work. No rendered pass claimed.

## Tasks / Subtasks

- [ ] Revalidate base, blockers and ownership before implementation admission (AC1, final AC).
- [ ] Bind current reads/state/validation/actions to this bounded route composition (specific outcome ACs).
- [ ] Apply minimum shared patterns after prerequisites (specific outcome and accessibility ACs).
- [ ] Verify owned applicable states and relevant inherited regressions from the applicability table; create no N/A flow (common ACs).
- [ ] Obtain independent review, development evidence and author-owned final review trail; assign release follow-up (final AC).

## Dev Notes

### Dependencies, base and hashes

35.1; E15 global-style/root-layout reconciliation.

Integrated source inventory: `99104d0ffa0360cf7d4ce4de174789c4a4605224`; dirty authoring checkout `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad` is not the migration base. Read-only remote main observed 2026-10-23: `0ae48a243fce47cb42e0998aae319f00c796dc85` (prior approved evidence identifies documentation-only descendant; object absent locally). Admission must pin actual DT-B0 ancestry/evidence and current owners; DT-B15 has no assigned integrated SHA. Applied-document and exact per-consumer SHA-256 live in [base-and-consumers.json](../planning-artifacts/design-transition-2026-10-23/story-preparation/base-and-consumers.json); final spec hash lives in companion spec-hashes.json, avoiding circular self-hash.

### Source-screen/state allocation

Implicit shell/login; FIELD vyLogin; common loading/denied/connection/error/confirmed states. Source IDs identify the accepted screen-state-crosswalk rows, not URLs or backend authority. Common requirements are selected by the explicit applicability table; unowned behavior remains inherited or N/A.

### Routes and exact consumers

Routes: /login and root layout; indirect global consumers.

Prospective consumers: src/app/globals.css; src/app/layout.tsx; src/app/(auth)/login/page.tsx.

- `src/app/(auth)/login/page.tsx` — `default route/component`; SHA-256 `8975d2bf0891056701f5efc6aba2aa18dcf3c8bdaf8afcb515644b8218dcaf7d`.

Existing exports/return-type/checked-input authority remain in the pinned source and consumer manifest. DT-B15 unbound routes/exports block 35.12/35.13 migration binding only; they do not block unrelated E35 concrete test design. No proposed API name is represented as implemented. Preserve proportional headless domain/state/validation/action seams.

### File impact and path/semantic conflicts

Files Modified (prospective): listed route/component presentation consumers after allocation. Existing server/domain paths are semantic dependencies, not an edit claim. Files Created: only feature-local presentation helpers justified by reuse audit; implementer lists exact files before admission. No framework/Tailwind config/parallel storage platform is prescribed.

Path conflicts: globals/root font, primitives, AppShell/nav/registry, booking editor/entry, job Schema, document context/selected links and shared fixtures. Semantic conflicts: protected drafts/history, revocation/projections, current facts/proof, source locks, quote/money provenance and E15 schedule/time consumers. Global inherited styling requires E15 reconciliation even with disjoint paths. This preparation reserves/releases nothing. Ordinary future implementation stays sequential unless separately authorized under the parallel protocol.

### Common requirement applicability

Correction 2026-10-26: **Applies** means this slice owns the behavior; **Inherited regression** means preserve/reuse actual downstream or unchanged behavior when affected; **N/A** creates no feature, test or release obligation. This scope-specific table controls common-template interpretation. Login form; no record list, dialog, file flow or capture.

| Family | Applies to this slice | Inherited regression | N/A |
| --- | --- | --- | --- |
| Common state IDs | loading, loaded, validation, denied, connection-required, submitting, error-retry, unknown, confirmed | revoked | empty, no-match, unavailable, stale, locked, dirty-navigation, late-result, focus-dialog |
| Files | N/A: None; no file operation. | Only existing source/file mechanisms actually consumed; preserve original authority | Unowned file states and new file features; no camera/capture except E18.1 |
| Layout/keyboard/focus/motion | Connected 360×640/desktop, keyboard and visible focus for actual owned UI; dialog/motion rules only for existing adapted surfaces | Existing linked editor/consumer protections; no new modal or draft editor | 48px capture unless E18.1; dialogs/drafts/animations absent from this flow |
| Runtime/domain evidence | Meaningful changed-behavior assertions for actual consumers | Existing permission/money/provenance/transaction/storage checks only where consumed/affected; current required CI policy remains | No new endpoint/harness/application suite just to instantiate a template row |

Inherited entries do not invent reachability. Where a lifecycle/permission decision or DT-B15 consumer is unresolved, record the test-design gap instead of choosing values or manufacturing fixtures. Common rows not listed as Applies are not automatically new acceptance criteria. A standard required CI gate, if applicable under current policy, is retained without turning it into a story-owned feature.

### File-state applicability

Login/root tokens has no upload/download command. Existing downstream file surfaces are semantic regression consumers only. N/A describes absence of a feature command, not omitted states in an existing file consumer.

### State, tests and release obligations

Normative [common-contract.md](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md) applies under `E35-2-STATE-<name>` and `E35-2-T-<name>`. Every specific AC has proposed test ID `E35-2-T-AC<n>`; test design supplies real assertions and callers, preserving existing IDs. Applicability reasons are recorded above; N/A does not require adding a feature or synthetic fixture. Regression inputs: Existing authentication/role-landing and nav/scope regression suites. Abbreviations resolve against exact integrated test inventory in base-and-consumers.json. No tests executed in this preparation.

Development policy (inherited, not new feature/test scope): admitted-base completion policy retains applicable static/type/lint/build/lock/audit/containment, focused tests, required full DB/integration/RLS with `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts, recovery/storage integrity, configured-production-server browser success/failure/retry at 360×640 plus desktop, independent review, exact-head CI and executable delivery gate. Preserve scope and golden tests; no `next dev` substitute or screenshot-only functional proof.

Release `E35-2-REL-1` visual/device/composite contrast/reflow: UI owner; `REL-2` manual/keyboard/screen-reader/daylight: QA/accessibility owner; `REL-3` final Phase B consolidation: Coordinator. Named people/candidate pending; evidence none. Next action: assign owners/scope/exact candidate and link existing deferred-work ledger and future delivery record. This is a planning contract, not a second authoritative ledger. Preserve E16 14-item and E20 caveats. `release_ready=false`; no merge/deployment authority.

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
