# Story 35.2 reference and inheritance binding — 2026-10-28

## Identity and authority

Bound to approved candidate `65be26c5e6e2923ea0298160f4da54a987bed0fe`, execution ID `35-2`, tracking key `35-2-tokens-font-and-real-login`. Exact source and pre-edit consumer SHA-256 values are in `_bmad-output/specs/spec-design-35-2/source-binding.json`. Approval/allocation is `story-35-2-approved-admission-2026-10-28.json`; official Inter v4.1 is selected there. This document is delegated routine source composition, not owner visual acceptance, runtime evidence or permission to expand auth.

Written authority (in descending applicable order): approved story/test contract and dated admission; `_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md` and `EXPERIENCE.md`; detailed Phase B UX annex; immutable source HTML. DESIGN owns appearance, EXPERIENCE behavior. The frontend-component skill's generic nextjs-app paths map to these actual files and `src/`; no generic forced-state hook, motion framework, Figma requirement or directory architecture is introduced.

## Bounded reference plan and identities

Reference plan `E35-2-REF-2026-10-28` is satisfied at composition/source-binding level by the following exact references. Raster capture remains technical preparation before implemented visual comparison; missing images are not represented as existing.

| Reference identity | Viewport/state | Bound source and composition |
| --- | --- | --- |
| E35-2-REF-D-IDLE | 1440×900 desktop idle | `docs/design/claude-design/v1/handoff/Verksamhetssystem.dc.html` login group around lines141–159: constrained form, wordmark, title/introduction, stacked labeled email/password, one primary action. DESIGN controls all tokens and overrides prototype styling. |
| E35-2-REF-M-IDLE | 360×640 phone idle | Same real credential form; `docs/design/claude-design/v1/handoff/Fältvy.dc.html` `vyLogin` around lines31–41 supplies compact vertical grouping only. DESIGN mandates16px gutters, ≥44px targets, reachable actions and error text. |
| E35-2-REF-D-ERROR / E35-2-REF-M-ERROR | Desktop/phone invalid credentials | Above form with retained input and safe Swedish invalid-credential feedback from actual login; DESIGN Field/error conventions and EXPERIENCE honest error state. Source HTML does not supply a real invalid-auth rendering. |
| E35-2-REF-D-PENDING / E35-2-REF-M-PENDING | Desktop/phone pending submission | Above form with actual pending sign-in, retained values, disabled action and clear “Loggar in…” text; readable disabled aliases without whole-control opacity. No shimmer/new motion. |
| E35-2-REF-D-FOCUS / E35-2-REF-M-FOCUS | Desktop/phone focused controls | Existing keyboard traversal email→password→submit; DESIGN inset text-entry focus and visible control focus. Capture actual focused inputs and action, no invented state-forcing API. |

Routine composition choices: plain Kopplas wordmark (Inter500); white canvas, ink primary action, sunken fields,8px controls, no rest shadow; use DESIGN heading/body/label roles and spacing ramp rather than prototype arbitrary values. Desktop constrained credential group and phone stack retain visible primary action/error under reflow. These are owner-authorized maintainable design choices applying existing written authority. No selected logo/photograph exists. Prototype BankID, demo impersonation, “Vem är du?” person chooser, password-reset link and decorative brand image are excluded: they do not authorize current production login features. Network failure/retry is actual implementation evidence using current rejection seam, not invented prototype behavior.

Missing image set: each named viewport/state above has no promoted raster in this preparation. The implementation/UI delegate may create a bounded source composition artifact and capture it through supported owned tooling, preserving the source hashes and these IDs; compare actual candidate states independently. Record candidate/build/capture provenance and actual contrast measurements. No source render proves successful sign-in. Rasmus's required initial visual acceptance occurs after actual implemented foundation rendering; it is a distinct checkpoint. No repeat pre-implementation owner approval is required for these routine references.

## Shared inheritance reconciliation (read-only)

One read-only baseline inspection found current root imports Geist via `next/font/google`; globals only bind `--font-sans` to Geist and body white/#171717. Therefore root font/body/token changes reach all HTML descendants, even where files are disjoint. Semantic spacing aliases must be additive/named or otherwise checked against inherited Tailwind utilities; blindly replacing the global numeric spacing scale can resize unowned consumers. No shared primitive path is allocated by this document.

Allocated product paths: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(auth)/login/page.tsx`, `src/app/fonts/`, `public/licenses/inter/`. Root chat alone owns implementation coordination. Other owners' work remains intact. This scan found no local active-claims ledger; current sole allocation is evidenced by Coordinator approval JSON, not inferred from a clean tree. Coordinator/root live chat snapshot reports only this implementation chat active for Kopplas; Coordinator, quality-gate and Sally idle, E15 and CI worktree notLoaded. This is coordination context, not release proof or evidence that idle owners relinquished paths. Finished E15 integration is prior fact; preserve all other worktrees. Any later shared-path owner conflict requires coordinator reconciliation before edits.

| Inherited surface | Exact representative baseline paths (read only; no write claim) | Bounded regression implication |
| --- | --- | --- |
| App/auth/operator/public HTML | `src/app/(app)/layout.tsx`; `src/app/operator/layout.tsx`; `src/app/(public)/layout.tsx`; `src/components/app-shell/AppShell.tsx` | Font/reflow, labels/actions, role nav/scope unchanged; public HTML inherits globals. Calendar feed ICS is not styled. |
| Jobs/records | `src/app/(app)/jobs/page.tsx` | Labels, record identity, tables/numerals and actions retain readable layout; no domain changes. |
| Files/documents | `src/app/(app)/files/page.tsx`; `src/components/documents/DocumentPreviewPane.tsx` | Check existing selected/document outcomes and readable controls; no upload feature or receipt added. |
| Booking/scheduling | `src/components/resources/BookingEditor.tsx`; `src/components/scheduling/SchedulingWorkspace.tsx` | Existing dialogs/focus and actions remain usable under inherited font/globals; no E15 takeover or layout migration. |
| Time/Min dag | `src/components/time-reports/TimeReportWorkspace.tsx`; `src/components/my-day/MyDayWorkspace.tsx` | Preserve current connected command/result semantics and readable controls. |
| Profile/calendar settings | `src/app/(app)/(calendar-settings)/settings/calendar/page.tsx` | Root font inheritance only; later scheduling/profile presentation remains outside this claim. |

## Actual auth seam and evidence routing

Unauthenticated caller submits `LoginPage.handleSubmit` → `createSupabaseBrowserClient().auth.signInWithPassword({email,password})`; generic invalid feedback retains values, catch gives safe failure text, success calls `router.refresh()` then `router.replace('/')`. The protected server layout re-resolves tenant/role context. Preserve this ordering and server authority. This preparation makes no auth behavior decision. Any needed mutation of validation, duplicate submission handling, session reconciliation or authorization requires bounded Sol High assessment and independent High review, rather than silently classifying it as styling.

Primary existing regression: `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts`; relevant role/operator inheritance uses `role-aware-phase-a-surface.atdd.e2e.spec.ts` and `operator-console.atdd.e2e.spec.ts`; mail callback only if affected. Canonical test IDs/applicability remain authoritative. Actual invalid→corrected, pending, network rejection/recovery, keyboard,360×640/desktop, focus, touch sizing, zoom/virtual keyboard and composite contrast need implementation evidence. No test/render/pass is claimed here. Full applicable policy gates, independent review, exact-head CI, frontend PR captures/agent-fix and author-written final Suggested Review Order remain. Broad release matrices remain deferred; release_ready=false.

## Capture tooling disposition

Root reports the bounded guarded installed-Chrome launch refused `HOOK_CONTEXT_UNAVAILABLE` because the cross-chat wake-up had no current root turn actor. No backend/resource started. Persistent browser/reference capture is blocked until a direct human turn opens the required actor; do not reuse another actor context or bypass resource guard. This is a lifecycle/tooling limitation, not a repeat design approval. Static source composition and ordinary preparation remain valid; no raster or runtime verification is claimed.

## Source capture closure — 2026-10-28 planning run

The earlier capture-tooling refusal above is historical. A direct active root actor subsequently supplied a verified guarded Chrome resource. This planner connected through Playwright CDP, created one isolated context, rendered immutable source files via file URI and closed only its context. No managed resource was launched or adopted by this planner.

Five raw source captures and their source/image SHA-256, exact viewports and state provenance are in `docs/quality/references/story-35-2-2026-10-28/capture-manifest.json`: main login idle/focused email at 1440x900 and 360x640; field `vyLogin` default grouping at 360x640. Hash verification passed for all five. The main source default is a seeded demonstration, not a real authentication outcome; no credential submission occurred. The field source is the historical identity chooser, only grouping evidence. Prototype logo/photo/pills/BankID/demo/reset controls remain visible in raw source screenshots and are expressly excluded from the accepted implementation composition. Written DESIGN/EXPERIENCE and the bounded reference plan above remain authoritative. Raw phone source overflow is not an accepted responsive result.

These artifacts are source inputs, not promoted application references, current product evidence, policy.references changes, visual acceptance or a hosted gate PASS. Invalid-auth, pending-auth, network-failure and server-confirmed login have no truthful source render here. Their required actual candidate captures and assertions remain implementation work. Initial Rasmus visual acceptance follows actual foundation/login rendering; no repeat approval of the story/font is needed.
