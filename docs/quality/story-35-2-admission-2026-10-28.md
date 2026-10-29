# Story 35.2 admission packet — 2026-10-28

**Prepared, not admitted.** Target only `35-2-tokens-font-and-real-login`; accepted design/document direction and DR-B1–B7 do not approve this implementation. Spec remains `preparation-only-not-approved`. No implementation, claim, loop, tracking, merge or deployment was started.

Read the [dated source/readiness amendment](../../_bmad-output/planning-artifacts/design-transition-2026-10-23/readiness-amendment-2026-10-28.md). Candidate code base is remote main `734d89981f287d128f176ceb7093244ef95fce82`, observed/fetched read-only October 28. The dirty authoring checkout remains `bbf7cef…`; it is not an execution candidate. Earlier October 26 activation blockers are historical: current Coordinator reports closed #100/#112, monitor deleted, main hold released and engine qualified. Preserve that lane's actual evidence; this packet does not re-open its resolved authorization or claim a new hosted run.

## Bounded approval identity

| Input | Current raw SHA-256 |
| --- | --- |
| `_bmad-output/implementation-artifacts/spec-35-2-tokens-font-and-real-login.md` | `ee7bc75184a16d3c6f46623321882f490986deadb81bc9a0dd92e0ba42eb6ff0` |
| `_bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-2.md` | `b5da79654364f05ddf7b1fdc2263f1c757e620638741db499538a66206a55eae` |

Approval must identify this packet, both hashes, integrated documentary candidate SHA and allocated owner/worktree. No existing record found grants that approval. Historical 35.1 authority/base closure is process work, not a new runtime suite. Preserve prior spec/test identities and apply this packet's dated interpretation rather than overwrite history.

## Proposed ownership, still unallocated

Coordinator must name one implementation owner and clean worktree before admission. This preparation cannot allocate other actors' paths; registered E15 operations/debug, quality-gate, visual-status and PR-feedback worktrees remain owned. Idle chats/merged epics do not release them.

| Proposed owned edits | Exact scope and inherited consumers |
| --- | --- |
| `src/app/layout.tsx` | Replace current Geist binding only after font closure; root affects auth, app, operator and public HTML. Preserve Swedish language and existing server authority. |
| `src/app/globals.css` | Existing Tailwind v4 inline semantic aliases, colors/spacing/radii/focus/motion. Audit app-shell, jobs, documents/files, existing dialogs, E15 scheduling/time/Min dag/profile/calendar settings before changing shared effects. Feed ICS has no typography. |
| `src/app/(auth)/login/page.tsx` | Existing real password login presentation, states and accessibility; preserve browser client, refresh-before-replace, server-derived role landing and safe generic errors. |
| Production font files/license/manifest | Proposed `src/app/fonts/` local assets and `public/licenses/inter/OFL.txt`, subject to font disposition below. No v1 asset edits. |

No blanket primitive rewrite. Reuse existing controls; any actual shared primitive edit must add its exact path/consumers to the claim and review before editing. `src/components/app-shell/AppShell.tsx`, `src/components/resources/BookingEditor.tsx`, jobs/files/dialogs and E15 consumers are inherited regression scope, not automatic write ownership. Root/global impact prevents claiming B-SHARED closed through file disjointness. Owner and current semantic reconciliation remain **open**.

## B-FONT: measured evidence and concrete disposition

Supplied assets are roman `0be2399ea925f1f83ff974764761da9860ec50742ed29a5d4c1ffd0c5c7ac3a8` and italic `6136f73372fedc37b80fd1a8ec3e21734073ff17376f3672718f186779672e7a`, locally claiming `4.001;git-66647c0bb`. Official GitHub API resolves that abbreviation to upstream commit `66647c0bbbe41a850d79d9c76fb13add3378940f`. Its `docs/font-files/InterVariable.ttf` downloaded read-only hashes `746431e950fd28d29b0189d708d4a5852a8458edb3184387eadcee9e5e34676c`, **not the supplied roman**. This is not a verified supplied-byte chain.

Official [Inter v4.1 release](https://github.com/rsms/inter/releases/tag/v4.1), downloaded as `Inter-4.1.zip` outside v1 for bounded inspection, contains:

| Official archive member | SHA-256 |
| --- | --- |
| `InterVariable.ttf` | `4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf` |
| `InterVariable-Italic.ttf` | `d6f1f6a172d9e588438db9f986fd5cfad7b30f644374080a8a9d4d91e344586f` |
| `LICENSE.txt` | `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a` |

The upstream [license](https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt) permits bundling subject to its conditions, including preservation of notice/license. Complete release license bytes, not a metadata summary, must accompany future production copies. This is bounded provenance/packaging evidence, not a broad legal conclusion.

**Recommended disposition for Sally/owner:** approve unchanged official v4.1 roman/italic files above as the production font source, retaining supplied v1 assets unchanged as historical visual inputs. That is an explicit source/version change from supplied 4.001, so no silent substitution. Alternatively supply a trustworthy exact-byte origin chain for both supplied files. B-FONT stays open until one route is selected and bound. Proposed implementation uses `next/font/local`, two normal/italic sources, variable weight range supporting 400/500/600, one `--font-sans` semantic alias, sans fallback and tabular numerals where required; no hosted font fetch or second token runtime. Implementer verifies build emission, actual font load and computed normal/italic 400/500/600; checks Swedish glyphs, reflow/fallback and actual contrast. No package/dependency/code changes made here.

## Reference and test interpretation

Written DESIGN/EXPERIENCE and detailed Phase B UX annex win. Composition references are immutable `docs/design/claude-design/v1/handoff/Verksamhetssystem.dc.html` (login/common foundation) and `Fältvy.dc.html` (`vyLogin`, phone grouping). No supplied upload/logo image is a promoted login reference or selected brand asset. Plain Kopplas wordmark and neutral purposeful placeholders apply. Sally/UI owner resolves routine source-derived composition and prepares desktop and 360×640 login/foundation references under existing delegated authority; no new owner permission before implementation. Record reference source path/hash, viewport/state and authority; never use prototype screenshots as proof of runtime persistence.

Resolve generic test-template wording as follows: `loaded` means the usable sign-in form, not loaded record ID/list. `submitting` means one pending actual `signInWithPassword` invocation with retained input and prevented duplicate action. `unknown` means an interrupted/unresolved auth response, no claimed signed-in state; reuse existing auth/session reconciliation/landing and explicit failure recovery, adding no queue/receipt/idempotency protocol. `confirmed` requires actual auth result plus server-resolved authorized landing; client optimism is insufficient. `denied` retains safe generic invalid-credential feedback; no account enumeration. Revoked/role effects are inherited only through real auth/session reachability. Files, record lists, new dialogs and draft editors remain N/A.

At main, `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts` is primary real login/landing regression; `role-aware-phase-a-surface.atdd.e2e.spec.ts` and `operator-console.atdd.e2e.spec.ts` cover affected role/operator inheritance. Reuse `auth-mail-callback.e2e.spec.ts` only if root changes affect its real path. User-management/catalogue suites retain ordinary policy relevance but are not invented login-owned features. Preserve existing test IDs. Add meaningful invalid→corrected credentials, loading, network rejection/recovery, keyboard submit, 360×640/desktop, focus, ≥44px targets, text enlargement/virtual keyboard, actual composite contrast/reduced motion where present. Check representative inherited job/files/booking surfaces under changed globals. Required static/build and actual policy CI/integration/RLS gates remain; required DB evidence uses `SUPABASE_TEST_REQUIRED=1` and executed/skipped counts. Configured production Playwright server only. No tests or rendered checks executed here.

The operational changed-surface visual gate applies to actual changed login/foundation states with source/candidate/build/capture provenance and independent verdict. Initial 35.2 foundations additionally require **Rasmus's visual acceptance** against those references before acceptance. Durable actual desktop/360px captures belong in the frontend PR; verify `agent-fix` label. Broad release device/manual/accessibility matrix remains separately owned and cannot be represented as passed by development evidence.

## Exact remaining actions and resume condition

1. Completed documentary candidate application: Coordinator-owned `C:/DEV/K35-admission`, branch `codex/design-35-2-admission`, based on `734d89981f287d128f176ceb7093244ef95fce82`, now contains17 exact normative snapshots and independently High-reviewed paired EXPERIENCE/policy source update. Candidate commit/index verification remains Coordinator-owned. Main is not asserted updated; no merge implied.
2. Coordinator names implementation owner, exact shared-path/semantic allocation and clean worktree; affected owners confirm inherited reconciliation. Ownership is not presently allocated.
3. Sally resolves routine reference composition/capture under existing delegated authority; no pre-implementation owner reference approval is required. The concrete supplied-byte versus official-release font source disposition must be selected explicitly by the appropriate design/owner authority; do not silently substitute versions. Complete production license/package assets remain future implementation artifacts.
4. Rasmus individually approves 35.2 against the exact final spec/test/packet hashes and candidate/allocation. Later Rasmus gives visual acceptance of actual implemented foundations. These are separate actions; neither design direction nor policy acceptance supplies them.
5. After individual approval only, prepare/review the one-story adapter and validate installed parser against its actual absolute folder. Record 35.2 tracking key/source/hash/approval ↔ quoted execution ID `35-2`. No global tracking or other E35 enrollment.

## Ready-to-send prompt

> Implement only the individually approved Kopplas story35.2; verify exact individual approval first using `docs/quality/story-35-2-admission-2026-10-28.md` and its dated DT amendment. Do not start implementation until the exact individual approval, clean candidate, current shared ownership, font disposition and reference binding in that packet are closed. Preserve main's current qualified visual/feedback evidence and existing authorization; do not reopen historical October 26 gates. Recheck main once and qualify actual deltas rather than redo a broad readiness assessment. Keep the dirty authoring checkout and other owners' work intact. After explicit story approval, create a reviewed supported stories-mode adapter in the allocated clean worktree (`SPEC.md`, `stories.yaml`, `stories/35-2-*.md`), only this admitted entry, list-order priority and no status/priority/subset YAML fields. Validate parser folder/ID support and record exact source/hash/approval mapping. Run only `/auto-bmad --spec <validated actual absolute admitted folder> --story 35-2` when the packet's resume conditions are met. Use Sol Low for ordinary implementation/review and Sol High for any actual sensitive change; preserve existing auth contracts rather than redesign them. Require actual changed-state browser/contrast/accessibility evidence, operational visual gate, Rasmus's initial foundation visual acceptance, independent fresh-chat review, exact-head CI and frontend PR screenshots/agent-fix label. Author the final Suggested Review Order. Stop at the story checkpoint. No whole-E35 loop, global ledger regeneration, active-owner takeover, merge, deployment or database push. If admission remains incomplete, return only the exact unresolved packet actions rather than launching.

### Reference-state gap, bounded

No promoted rendered login image was established by this preparation. Required reference set is exactly: desktop idle form, 360×640 idle form, visible invalid-credential feedback and pending submission, plus focused controls at each viewport. Network failure/retry requires actual implementation evidence, not invented prototype content. Existing `handoff/uploads/` images are unselected source assets; no arbitrary upload is promoted as a login oracle. An owned guarded source-render session may derive the available idle reference states from the immutable HTML, with written rules taking precedence; Sally records the derived reference identity under delegated routine visual authority. Rasmus gives required initial foundation visual acceptance after actual implementation rendering. This does not block source/documentary consolidation.

Additional bounded primary-source check: official Google Fonts `ofl/inter` history identifies commit `e1d6480102fed30739fead0faee463101f892c8f` as “Inter: Version 4.001;git-66647c0bb added”. The current official `Inter-Italic[opsz,wght].ttf` / `Inter[opsz,wght].ttf` downloads hash respectively `acd98e64795781b2058f07b18475e0ecee2a0fe2b42a49e2f9e37d0d6bf66ce6` / `29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031`; neither matches supplied bytes. Their matching embedded version alone cannot close the byte-origin chain. This check is not proof that no exact upstream artifact exists. Sources: [official family tree](https://github.com/google/fonts/tree/main/ofl/inter), [version addition](https://github.com/google/fonts/commit/e1d6480102fed30739fead0faee463101f892c8f).

Reference capture tooling outcome (Coordinator, this run): guarded source browser request timed out; retained owned registration was inspected and stopped (`8200658c-ad6d-4b2b-84e3-ea0a62a39249`, shutdown verified). No reference images were created and no unmanaged retry occurred. This is a tooling/evidence gap for the later author to resolve with supported guarded capture, not a new owner input or pre-implementation permission gate. Exact missing reference states are listed above; Rasmus visual acceptance remains after actual implemented foundation rendering.

Durable font documentary evidence is preserved outside immutable v1 and production code in `reconciliation-2026-10-28/Inter-v4.1-LICENSE.txt` (complete official release license bytes) and `font-provenance.json` (exact release download origin, archive SHA-256 and roman/italic/license member SHA-256). Production packaging remains prospective and subject to the explicit source disposition above.

Documentary integration is already authorized and owned by the Coordinator; it is not an additional owner approval action. The paired source/policy after artifacts and 17 bounded normative dependency snapshots are prepared for its clean candidate. Record the eventual candidate commit and validation separately; remote main integration is not claimed here. Product path allocation and individual 35.2 approval remain separate.
