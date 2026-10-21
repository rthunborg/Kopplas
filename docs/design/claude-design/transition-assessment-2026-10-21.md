# Claude Design integration assessment for Kopplas

Date: 2026-10-21. Status: investigation and proposed transition plan, not approval
to implement, change scope, stop development, merge or deploy.

## Subsequent owner decision and publication scope

After this investigation, the owner designated the handoff's design styles and
written design rules as visual authority. Prototype styling, including exported
application CSS overrides and the existing generic UI, is historical design.
Consequently, questions below about whether prototype styling should win are
superseded: Sally should reconcile written rules and base styles, documenting
explicit overrides and resolving only remaining conflicts within authoritative
handoff materials. Layout/flow references do not authorize behavior or scope.

The owner subsequently authorized publication and merge of this baseline and its
records to `main` for Sally's fresh checkout. That publication also adds a narrow
ESLint exclusion for immutable `docs/design/claude-design/v*/handoff/**` reference
trees. The original investigation and its branch/CI observations below remain a
dated snapshot, not current completion evidence or instructions to resume work.
No original handoff bytes or application/backend behavior are changed.

## Recommendation and transition point

Adapt the design into the existing Next.js application through shared visual
foundations and successive feature slices. Preserve existing domain functions,
server actions, commands, entitlement projections and database enforcement. Use
the exported component source selectively; treat the generated application as a
visual/interaction reference, not a replacement application or backend contract.

**After E15 and E16 is a sensible checkpoint for the main screen migration**, once
their reviewed changes are integrated into one verified base. It covers bookings,
time filing, job containers, members, work orders and workspace composition. It
does not finish the designed field workflow: E17 owns materials/economy and E18
owns diary/photos/deviations/chat/reports and the stronger completion contract.
Do not wait for all later backend epics merely to adopt the visual foundations.
Start the UX reconciliation and planning now; do not take over or redesign active
E15/E16 stories in place. If authorized later, pause *new backend epic admission*
at their clean checkpoint while delivering the initial design integration batch.
Continue defect/integrity fixes needed to establish that checkpoint.

Resume backend feature development once the shared foundation and representative
CRM, quote and job/scheduling flows demonstrate usable integration, the remaining
backlog has explicit design contracts, and development gates plus independent
review pass. Exhaustive visual/release checks remain separately owned under the
2026-10-19 completion policy found in the newer E16 branch; a functional failure
is never reclassified as visual polish. There is no reason to require a wholesale
redesign of every screen before resuming E17.

## Evidence and actual implementation status

The checkout at `C:/DEV/Kopplas` is `main` at `bbf7cef7`. It has pre-existing
uncommitted changes to AGENTS, architecture, epics, UX, project context and process
files, plus PR-feedback tooling. Those changes were not authored or altered here.
The locally recorded `origin/main` is newer at `e5e0308d` (2026-10-19). This
assessment inspected that ref without fetching, resetting or merging it.

| Evidence scope | Observed state | Consequence |
| --- | --- | --- |
| Checkout sprint ledger | E1–6 and E10–14 done; all E7–9 stories done but parent epic rows still in-progress; E19.1 done, E19.2 backlog; E15/E16/E20 backlog | Parent labels and old timestamps do not measure current implementation. Do not call the backend “half complete” based on epic counts. |
| Recorded `origin/main` ledger and source | E20 and 20.1–20.3 done; Documents activated and implemented; E15/E16 still backlog on that base | Documents is delivered on newer main, not missing backend work. Bring its existing contracts into the integration base rather than rebuilding them. |
| E15 worktree, `codex/epic-15-scheduling-time-calendar`, inspected head `2524306c` | 15.1–15.4 review; 15.5 in-progress; 15.6 backlog. Latest report describes P5 diagnostic preparation, not acceptance | Scheduling/time work exists but the epic has not completed; calendar-feed validation and Min dag remain prerequisites. Its ledger also carries only an earlier E16 slice and is not authority for all E16 work. |
| E16 worktree, `codex/epic-16-jobs`, head `e6eeaf9b` | All five stories marked done; epic finalized; PR105 open and unmerged; `release_ready=false` | Development completion in a branch is not integrated availability or release readiness. |
| Live GitHub PR105 metadata/comments, inspected in this task | Open at `e6eeaf9bad34436cd4230105c94dab083b4f7f90`; review summary reports unresolved findings | Require disposition of existing comments before adopting E16 as a trusted integration base; do not silently treat publication as acceptance. |

PR105 is [Jobs depth and workspace](https://github.com/rthunborg/Kopplas/pull/105).
Existing automated comments concern stale full-card overwrites, booking-end
deadline warnings and multi-membership tenant scoping of job-card options. These
are **reported findings awaiting owner/reviewer disposition**, not newly validated
defects from this investigation. Do not start another broad review here. Its
publication evidence reports passing focused CI, but also an unresolved first-run
modal/background-navigation observation, 14 deferred release checks, NFR
CONCERNS/MEDIUM and advisory test-quality Request Changes. Preserve those caveats.

Primary status references:

- `_bmad-output/implementation-artifacts/sprint-status.yaml` in each inspected tree.
- `_bmad-output/auto-bmad/reports/epic-14.md`, `19-1-widget-registry-and-dashboard-framework.md` in the checkout.
- E15 worktree: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/_bmad-output/auto-bmad/reports/epic-15.md`.
- E16 worktree: `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/auto-bmad/reports/epic-16.md`, `delivery/epic-16.json`, and implementation specs listed in PR105.
- E20 closeout: `C:/Users/Rasmus/.codex/worktrees/documents-e20-closeout/Kopplas/docs/quality/epic20-postmerge-closeout-2026-10-13.md` and `_bmad-output/auto-bmad/reports/epic-20.md`; closeout records merged PR97 and caveated retrospective. Source existence and local refs corroborate delivery; historical CI was not rerun here.

The usable foundation is substantial: authentication/tenant context; CRM,
company/terms/pricing; calculations and integer-öre tax primitives; immutable quote
versions/PDF/review/send/acceptance; basic jobs; private files; RBAC/admin;
operator/onboarding; notifications/email infrastructure; scheduling foundations;
dashboard framework/pipeline; and newer-main Documents. E17/E18, remaining dashboard
widgets and most B2/B3 modules remain future work. Counting these as a percentage
would conceal differences in scope, verification and operational release gates.

### Stack and reusable seams

`package.json` pins Next 16.3.8, React/ReactDOM 19.2.4, TypeScript 5.9.3 and
Tailwind 4.3.1, with Supabase SSR/client libraries. The E16 branch additionally
records a Vite security patch. There is no installed shadcn, Radix or Motion
dependency in the inspected checkout. No framework migration is necessary.

- Routes: `src/app/(app)/**`; auth in `(auth)`; separate operator and public boundaries.
- Shell: `src/components/app-shell/AppShell.tsx`, `nav-items.ts`, `RouteAccessBoundary.tsx`; server-filtered navigation, mobile drawer/focus/escape behavior and tenant identity already exist.
- Domain UI: `src/components/{crm,calculations,quotes,jobs,files,resources,dashboard,notifications,admin-users,onboarding,settings}/`.
- Headless seams: `src/features/**` contains actions, read functions, types, validation/presentation helpers; `src/server/commands/**`, `src/server/read-models/**`, `src/server/authz/**`, `src/lib/money/**` retain authoritative behavior.
- Real styling is still generic: `src/app/globals.css` has Tailwind plus minimal body colors; `src/app/layout.tsx` uses Geist. There is no `nextjs-app/docs/design/DESIGN.md` or existing full application token layer in the inspected tree. The generic frontend skill's example paths, shadcn/Motion and three-layer layout are not facts about Kopplas; adopt proportional primitives within `src/components`, not a fictional second application root.
- E16 adds headless `src/features/jobs/{job-card-domain,job-members-domain,work-orders-domain,job-upgrade-domain,job-workspace-domain,job-scheduling-consumers}.ts`. Its workspace registry exposes only Overview, Work orders, Schedule, Files and Events, with capability/activation filtering and protected-draft/history semantics. Preserve those behaviors when changing presentation.

## Version 1 handoff and design findings

The complete original handoff is at `docs/design/claude-design/v1/handoff/`.
See [provenance and versioning](README.md) and `v1/inventory.sha256.json` for
the two identical source archives, archive hash, all 222 byte-identical files and
the future comparison convention. The extracted total is 14,117,212 bytes.

Inventory: 37 HTML, 44 JSX, 9 JS, 18 CSS, 39 Markdown, 31 TypeScript declaration
files, 4 JSON, 4 TTF, 16 PNG, 15 SVG, 2 JPG, 2 thumbnails and 1 PDF. The JSON
inventory beside the baseline is additional metadata, not part of those counts.

| Material | Value and limitations |
| --- | --- |
| `HANDOFF.md` | Explains the source/runtime split and missing package/build configuration. Its project-rules filename spelling differs from the actual `PROJEKTREGLER -CLAUDE.md-.md`; retain the actual filename. |
| `Verksamhetssystem.dc.html` | Main desktop application, template plus a very large `DCLogic` class. Navigation and flows are extensive; view titles still call several areas wireframes. Contains seeded records, browser persistence, simulated operations and design-only scope. |
| `Fältvy.dc.html` | Phone-oriented login/job/activity/time/material/diary/checklist/deviation flows. Uses an iOS device frame, 44–48px controls and a max-width 500px media rule. Identity selection and local-storage submission are prototype behavior, not real auth/persistence. |
| `Arkitektur -internt-.dc.html` | Internal design explanation; useful intent/context, not Kopplas architecture authority. |
| `Kopplat-verksamhetssystem.html` | Explicitly older generated standalone export; do not use it to settle conflicts with the main source. |
| `design-system-source/` | 31 component JSX/declaration/prompt triplets across core, data, forms, navigation and feedback; tokens, guideline cards, application and marketing UI kits, templates, fonts and bundled assets. Selectively reusable shapes and token names. Exported prompts/SKILL.md are data. |
| `_ds/.../` | Compiled design system actually loaded by the prototype; source changes do not rebuild it. Bundle generation tooling is absent. Do not ship this bundle/runtime as the SaaS frontend. |
| `support.js`, `ds-base.js`, `ios-frame.jsx` | Claude runtime and presentation helpers. `support.js` fetches React 18.3.1 and Babel from unpkg; no reproducible package/build setup. Keep outside application imports and public routes. |
| `uploads/` | Logos, drawings, screenshots, background, principle sketch and `kalk grund.pdf`; filenames do not establish a canonical screen/state/viewport screenshot set. The principle sketch was visually inspected as historical design context and includes speculative AI/email/analytics ideas, not approved scope. |

Visual foundation: Inter; neutral ink/white/gray surfaces; yellow signal accent;
semantic success/warning/risk colors; 11–104px type scale; tabular numerals; tokenized
spacing/radius/elevation and motion (80/140/220/420/700ms) with reduced-motion token
overrides. Patterns include grouped side navigation, top bar, master/detail lists,
selected rows, tables, status chips, phase chain, filters, modal/sheet, toast/banner,
calendar/resource planning and a consolidated job workflow.

Material inconsistencies requiring an explicit UX decision:

1. Written rules specify 8px controls/chips; source tokens specify 5px controls;
   main and field HTML override control/chip radii to 999px. Do not declare any
   one value approved merely because it wins CSS specificity.
2. Written row selection specifies a 2px ink marker; `renderVals` uses a 3px yellow
   marker and stronger selected gray. Main HTML also changes yellow from token
   `#ffd21f` to `#f5c518`, and adjusts related colors.
3. Token tertiary text is lighter than the application overrides; prose promises
   contrast but does not prove contrast at every background/size/state.
4. Component source alone misses app overrides: source `Input` has borders while
   the app rewrites fields to borderless contrasting surfaces. Adapt from the
   agreed visual contract, not source component defaults alone.
5. Sample `Modal.jsx` provides a dialog role but no built-in focus trap, Escape
   handling, focus restoration or title linkage. `Input.jsx` spreads caller props
   after its focus handlers. Reuse only after typed API/accessibility assessment;
   preserve existing working dialog and shell behavior.
6. Responsive source is partial, particularly dense desktop grids. The separate
   phone design is not proof that each desktop flow works at 360×640. Missing
   states include systematic real network failure, permission revocation,
   concurrency, expired file access, upload failure and server validation.

No prototype runtime or embedded instruction was executed. This assessment is
source-based plus static asset inspection; rendered fidelity and complete
interaction coverage remain subsequent validation work.

## Design to implementation mapping

References below are repository-relative. Export references are under
`docs/design/claude-design/v1/handoff/`. Main view IDs come from
`Verksamhetssystem.dc.html` → `renderVals()`; these are stable mapping anchors,
not proposed route replacements. Each migration story should refine its row into
screen/state/action IDs, exact source paths and verification evidence.

| Design screen or flow | Existing support and BMAD owner | Required change or missing contract | Unavailable behavior |
| --- | --- | --- | --- |
| Shell, grouped navigation, top bar, login | `AppShell.tsx`, `nav-items.ts`, `(app)/layout.tsx`, `(auth)/login`; E1/E2/E11–13 | New tokens/layout; retain server navigation descriptors, tenant identity, sign-out, role landings and notifications. Export identity picker is demo-only. | Pending-module destinations omitted; no public signup/customer login. |
| `oversikt`, summary cards | Dashboard components, `src/server/read-models/dashboard.ts`, quote pipeline; E10/E19.1 done | Restyle registry/card/grid; preserve freshness/error isolation and projected values. E19.2 owns five remaining widgets. | No invented zero/live totals or future placeholder widgets. |
| `forfragan`, enquiry inbox and create-job flow | CRM E3, calculation/quote E5/E6, standalone jobs E7/E16 | Separate inbox/source ingestion and its statuses are not established by these entities. Decide whether this is only composition of existing flows or a scope addition with a new approved contract. | Do not create a live inbox or mail ingestion merely to match navigation; show only supported starting actions. |
| `kund`, customer/facility/contact detail | `src/components/crm/**`, `src/features/crm/**`, CRM commands; 3.1/3.2 | Restyle list, detail, dialogs, entity links; retain distinct customer/facility/contact IDs, validation/archive behavior. | Unbuilt CRM depth is E32 follow-up, not an empty saved record. |
| Job calculation and quote phases | `calculations/**`, `quotes/**`, corresponding features/actions; E4–7 and 10.2–10.9 | Compose existing calculation and immutable quote-version workflows within agreed navigation. Keep explicit review, stale-content/PDF state, sent locks, manual acceptance evidence, correction/new version. | AI parsing and customer online signing/acceptance omitted entirely. No generic phase button bypass. |
| `projekt` Jobb list/card, workspace and work orders | Base E7 jobs; E16.1–16.5 in PR105; `src/features/jobs/*-domain.ts`, jobs components | Adapt delivered shell around one jobs ID; Order/Projekt type separate from status; work orders on both types, one-way upgrade, members and protected navigation. Prototype work packages are not automatically work orders. | Unsupported work-package hierarchy needs classification/decision; economy/material/field tabs wait for their contracts. |
| `planering`, job Schema, resource allocation | E14 profiles/bookings/conflict engine; E15.1–15.3 branch; `resources/BookingEditor.tsx`, scheduling domain and booking commands | Style all five approved views, toolbar, editor and resolver. Preserve one booking model, keyboard/dialog drag alternatives, recurrence/DST and checked conflict save. Export planning does not replace missing views. | Suggestions are not authoritative writes; absence of permission is not an empty calendar. |
| `tid`, personal week/report/review | E15.4 branch, 15.6 Min dag pending | Adapt filing/week/review to submitted-only domain and server success. Keep own-row versus reviewer projection. | Export Klarmarkerad/Attesterad/Synkad payroll workflow exceeds current E15; no approval or Fortnox Lön action. Resolve AB-A10 at checkpoint. |
| `falt`, `Fältvy.dc.html` Min dag/Mina jobb/activity | E15.6; E16 my-jobs/workspace | Map real auth and assigned-job reads; 360×640 connected flow with explicit retry and draft protection. Separate design activity form into real feature-owned submissions. | Material E17, diary/photos/deviations/chat E18, checklists E28 stay unavailable; one fake local “Inskickat” must never stand for a multi-domain commit. |
| Job material, economy, payment plan | E17.1–17.4 future; money engine exists | Define material/request commands, protected economy projections, accepted-quote budget origin and Projekt-only plan, then adapt comparisons/variance UI. | Do not display sample actuals as zero/live, or show budget to unentitled roles; no fake request success. |
| Diary/photos/deviations/reports/completion | E18.1–18.4 future; files substrate E8 | New approved contracts first; map upload lifecycle, author/time, member scope and completion effects. Existing minimal `status=done` is not E18's event contract. | Disable completion-with-effects until authoritative path exists; reconcile old mutation paths in E18 work. No simulated uploads/report generation. |
| `chatt`, job chat versus global channels/DM | Job chat E18.2 future | Per-job member chat is planned. Lobby, general channels, DMs and presence in export need separate scope assessment. | Do not activate tenant-wide chat as a visual adaptation. |
| Files/Documents and job documentation | E8 files; E20.1–20.3 delivered on recorded newer main; `src/features/documents/**`, `src/server/read-models/documents.ts` | Restyle existing source-authorized aggregation/filter/preview/archive/context links; retain selected-link identity and access expiry. Documents center is not a template-authoring platform. | Export template generation/signing/AI need separate manual-core or Phase C classification. No new storage model. |
| `personal` | E11 users/roles and E14 profiles now; E31 HR depth future | Distinguish login membership, resource profile and HR record. Reuse admin screens and work-hour contracts; add future sensitive personnel states through E31. | No payroll/private HR fields in generic person DTOs. |
| `tillgangar` | E21 rentals, E22 assets/QR, E23 service, E24 panels future | Map asset versus rentable item and assignment/return/fault/service concepts. Existing files and profiles are substrates only. | Omit pending nav; no working-looking QR/return/loan actions. |
| `leverantor`, `artikel` | E3 manual articles/work roles now; E25 file import future | Reuse manual pricing; define import/validation/reconciliation at E25. Export says live wholesaler API; Phase B permits file import only. | No supplier API toggles, calls or mock live prices. |
| `fakturering`, `levfakt`, Fortnox/account settings | E26 basis/spike, E33 connection/outbox, E34 export future | Map locked billing basis and export-only status/error/retry. Supplier-invoice ingestion, payment status inbound, payroll sync, account-plan editing need scope decisions; not implied by invoice-basis export. | No Fortnox UI/artifacts before final ADR/activation; no fake sent/paid state. Fortnox owns invoice email. |
| `verktyg` templates/checklists/protocols | E27 manual DoU, E28 self-inspection, E30 KNX; E29 thin tender core, all future | Refine approved manual artifacts and content gates; distinguish shared templates from module records and formal standards/legal content. Tender/KNX/panel/DoU flows lack full canonical screen coverage in supplied material. | AI interpretation and signing remain excluded; absent designs require targeted UX specs, not invented product scope. |
| `installningar`, users/roles, notifications, onboarding/operator | E3/E11–13 existing; settings/admin/onboarding/operator components | Apply foundation; preserve all capability/error/recovery states, notification preferences, operator isolation and real-delivery/provisioning controls. Export is not complete coverage of these system flows. | Do not replace operator-only flows with tenant settings or add unimplemented integration controls. |
| Marketing UI kit | `design-system-source/ui_kits/site/` only | Useful brand reference; marketing/pricing/checkout is outside this authorized frontend transition scope unless separately approved. | No self-service signup or pricing promises imported. |

### Placeholder contract

Client DTOs must omit unauthorized amounts and any sensitive aggregates derived
from them; CSS hiding or locked-looking controls are insufficient. Tenant and
capability authority stays in server resolution, commands and RLS, never the
prototype's identity picker. Service-role credentials, HMAC secrets/attestations
and OAuth tokens must not enter adapted client code. Scope suitable transient
draft storage by tenant, actor, entity and form; photo bytes remain transient.
No durable offline queue or replay is introduced, and success requires server
confirmation. Preserve the actual integrated authorized file-access paths rather
than substituting prototype URLs or a new privileged client.

The user's desired placeholders must fit the manifest: a pending module has **no
live nav, route, widget, notification category or file-owner surface**, even when
the label would say “coming soon.” Keep its design visible in the reference and
planning inventory, not production navigation. A clickable all-module prototype
may remain a separately isolated design artifact; do not turn it into app routes.

Inside an active module, an approved story may expose an unavailable action/tab
only if that specific surface is allowed by its contract; existing E16 registry
currently omits future tabs. Default to omission. Where an intentional disabled
control is approved, explain “Inte tillgängligt ännu,” keep explanations accessible
without relying on hover, avoid form submission/network writes, and identify the
owning follow-up. Permission-denied, not implemented, loading, connected-empty and
network-failed are different states. Do not reveal sensitive data to explain a
disabled action. No sample data mixed into tenant reads; synthetic fixtures live
only in explicit test/design contexts. Replacement requires real commands/read
models, authorization, validation/failure/retry behavior and smoke evidence before
the disabled state disappears. No timer/localStorage mutation may report success.

## Ordered BMAD transition workflow

Installed repository skills and `_bmad/_config/bmad-help.csv` were inspected;
workflows below are proposed, not executed to mutate artifacts. `bmad-help` and
frontend-component guidance informed this investigation. BMM resolves English
planning/implementation directories under `_bmad-output`; installed TOML still has
historical ElproSaas naming while BMM YAML says Kopplas. Reconcile durable config
through supported customization later, not by editing installer-managed answers.

| Order and workflow | Prerequisite and rationale | Concrete output and decision |
| --- | --- | --- |
| 0. Status/ownership reconciliation, read-only sprint-status view | Current branch/ref/worktree evidence; preserve active claims | Pin integration base and E15/E16/E20 evidence; identify active owners. Do not regenerate tracking from this stale checkout. |
| 1. UX designer/Sally with `bmad-ux` Update/Validate intent | v1 baseline plus current approved UX/domain requirements | One accepted visual contract and behavior delta; screen/state inventory, navigation/terminology map, responsive rules, accessibility and conflicts register. Resolve pill/8px/selection precedence here. |
| 2. `[CC] bmad-correct-course` | This assessment plus reconciled UX impacts | Proposed sprint-change document with exact affected artifacts, integration batch, checkpoint/resume conditions and scope decisions. Obtain agreement before applying sequencing or product changes. |
| 3. `[PRD] bmad-prd` update only where behavior/scope changes; `[CA] bmad-architecture` brownfield update | Accepted scope/UX delta; architect reviews presentation/domain seams | Narrow Phase B amendments; contract/permission/data impact assessment; ADR only for actual architecture decisions. Visual changes alone do not justify new backend contracts. Sensitive decisions receive Sol High. |
| 4. `[CE] bmad-create-epics-and-stories` targeted revision | Ratified requirements/architecture/UX | Bounded integration epic or explicitly named follow-up batch without renumbering existing epics; screen mapping, dependency graph, story AC/state/test changes. Do not rewrite completed story evidence. |
| 5. `[SP] bmad-sprint-planning` readiness intent, then planning on PASS | Complete story slices and contract decisions | PASS/CONCERNS/FAIL readiness evidence first; update tracking/order only after agreement and claim reconciliation. Current skill incorporates implementation-readiness checks; no duplicate deprecated readiness lane needed. |
| 6. `[TD] bmad-testarch-test-design`, selective ATDD/automation | Approved slices and risk classification | Traceable visual/behavior/compatibility checks; required development versus deferred release matrix. Reuse existing framework/CI; no framework reinitialization. |
| 7. `/auto-bmad` existing story/epic lane | Approved story and reconciled source base; foundation before screens | Sequential implementation with typed headless seams, required integrity checks, essential browser smoke, independent review, delivery record and Suggested Review Order. Preserve three-round cap. No active-loop migration to BMAD Loop. |
| 8. `[CK] bmad-checkpoint-preview`, trace and retrospective | Reviewable integration changes and actual evidence | Human walkthrough locally; trace/status/deferred ledger updated truthfully. Name notwithstanding, this does not authorize a hosted preview. |

Use fresh contexts for these workflow runs. Ordinary work uses Sol Low; permission,
tenant, token, money, concurrency and integrity changes require explicit Sol High
delegation/review. This investigation's sensitive-boundary assessment used Sol High
read-only. It did not constitute a new broad PR review or acceptance of PR105.

The installed `bmad-ux` now emits peer `DESIGN.md` and `EXPERIENCE.md` under
`_bmad-output/planning-artifacts/ux-designs/ux-{project_name}-{date}/`. Existing
Phase B consumers still use `ux-design-specification-phase-b.md`. Agree the
authority/linking scheme in the transition proposal: recommended new visual spine,
Phase B behavior deltas linked to it, and explicit crosswalk to EXPERIENCE rather
than two silently competing behavior authorities. Keep the frozen Phase A UX spec
unchanged. The current task has not generated these contracts.

## Phased execution and completion criteria

| Phase | Work and dependency | Exit criterion |
| --- | --- | --- |
| A. Preserve and reconcile | v1 persistence complete; reconcile branch evidence, design contradictions, unsupported concepts and active claims | Baseline hashes/file set match; accepted scope/visual decisions and exact change proposal exist. Nothing paused implicitly. |
| B. Establish integration base | Finish E15; resolve E16 existing findings/qualification; integrate through existing owner/review/CI gates; include delivered E20 | Exact combined revision is recorded and development checks pass. Full release readiness is separately stated; E15.5 public-token abuse evidence and 15.6 flow cannot be replaced with mocks. |
| C. Shared design foundation | After A and on agreed base: Inter/brand assets with provenance, semantic tokens, typography/spacing, button/input/select/table/feedback primitives, responsive shell/navigation | Representative list/form/dialog at desktop and 360×640 works with keyboard, focus, validation and real errors. No domain/persistence rewrites. Visual choices are documented; pending nav remains absent. |
| D. First integrated journey | Foundation then CRM/settings → calculation → quote review/PDF/manual acceptance → job | Existing commands/locks/provenance and entitlement payloads preserved; essential smoke proves real persisted result and failure/retry. This proves adaptation pattern before mass migration. |
| E. Scheduling and job/field shell | E15/E16 base plus C/D; five views, recurrence/conflict resolver, submitted timesheets, Min dag, work orders, Files/Documents, notifications/admin | Existing keyboard/drag/dialog, date/DST, membership, unsent-input/history and selected-file contracts survive. E17/E18 functionality remains explicit in backlog, not fake submissions. |
| F. Resume backend slices with the design | E17 → E18 and E19.2 using approved updated story contracts; B2/B3 at their existing checkpoints | Replace unavailable feature slices with server-backed states and remove only corresponding placeholders. Revalidate E23/E27 completion consumers, E26 billing seam and future widgets against real data. |
| G. Release validation and future iterations | Track through all phases; exhaustive work before release approval | Role/device/browser/accessibility/visual matrices, documented deviations and remaining operational gates have real evidence; separate merge/deployment approval. New handoffs get v2+ and impact-driven follow-ups. |

A visual reference does not justify postponing required authorization or integrity
evidence. Conversely, exhaustive screenshot matrices should not stall ordinary
development under the newer completion policy. Capture a small representative
visual check during each slice, record exhaustive release comparisons with owner
and next action, and never call deferred checks passed.

### Verification design

- Build/static checks on the exact integration head; introduce a narrow immutable-reference ESLint exclusion before accepting the baseline in CI. Current extracted declarations pass typecheck; they should not become an application dependency.
- Unit tests for actual changed headless behavior, formatting and state transitions; retain money golden packs and exact quote/PDF fingerprint behavior. Avoid tests that only mirror CSS or the component implementation.
- Required real local integration/RLS lane with `SUPABASE_TEST_REQUIRED=1`, executed/skipped counts, per-role and two-tenant negatives; no tests against demo. Include multi-membership selected-tenant payloads and stale-form writes where contracts change.
- Essential Playwright smoke against configured production build, not `next dev`: real success, validation, failure/retry, stale content, protected draft/history and relevant unauthorized routes. Any resource launch uses the resource guard and bounded ownership.
- Visual references keyed to v1 source, screen, viewport, fixture and state. Seed deterministic synthetic data, fonts/date/time, capture desktop and 360×640 plus agreed tablet/wide layouts; compare composition, selection, typography, focus, content overflow and disabled/error states. Inspect changed assets side by side; recorded source hashes identify which version was used.
- Release matrix: supported roles, keyboard/screen reader, contrast, reduced motion, touch targets, long Swedish text, zoom, empty/large datasets, expired signed links, uploads, modal layering, all five calendar views and date/DST edges. Track defects separately from polish and run wider checks when change/risk warrants them.

## Documentation and backlog change inventory

These are proposed edits for subsequent authorized execution. This task only added
the handoff, inventory and accompanying records. Paths without an existing file
are explicitly proposed new artifacts.

| Order | Actual artifact or proposed addition | Required change |
| --- | --- | --- |
| 1 | `docs/design/claude-design/README.md`, `v1/handoff/`, `v1/inventory.sha256.json` | Baseline established now; future versions append. Preserve originals; keep adapted code in `src`, derived captures outside handoff trees. |
| 2 | Proposed `_bmad-output/planning-artifacts/sprint-change-proposal-2026-10-21-design-transition.md` | Record chosen checkpoint/batch, owner decisions, exact base, scope exclusions and work ownership; do not overwrite prior proposals. Date may reflect actual approval session. |
| 3 | Proposed UX DESIGN/EXPERIENCE spine at configured UX run path; existing `_bmad-output/planning-artifacts/ux-design-specification-phase-b.md` | Resolve visual conflicts; map all active screens/states and exported concepts; document source-version and precedence. Update §§1–12 and B2/B3 pattern/depth commitments. Reference frozen Phase A UX without editing it. |
| 4 | `_bmad-output/planning-artifacts/prd-phase-b.md`, `product-brief-phase-b.md`, `owner-signoff-questions.md` | Change only accepted behavioral/IA/product deltas and decision answers; label design-only scope. Do not import AI, portal, vendor API, payroll or net-new intake/chat merely because drawn. |
| 5 | `_bmad-output/planning-artifacts/architecture-phase-b.md`; new ADR only if justified | Record replaceable visual layer, component/API ownership, approved token location and contract compatibility. Preserve ADR-B006/B008/B009, projection, public-surface and transactional invariants. No new database architecture for restyling. |
| 6 | `_bmad-output/planning-artifacts/epics-phase-b.md`; new integration epic/follow-up specs under implementation-artifacts | Add traceable integration batch and future-story impact register. Retain E-numbers, completed AC/evidence and active claims. Pin references to v1 paths/hash and screen/state anchors. |
| 7 | `_bmad-output/implementation-artifacts/sprint-status.yaml`, active claims/assignments under existing parallel protocol | Reconcile newer main/branches first, then update ordering only through supported planning/coordination. Never mark this checkout's backlog rows done from copied branch labels. |
| 8 | `_bmad-output/test-artifacts/test-design-epic-15.md`, `test-design-epic-16.md` in owning branches, future epic test designs and traceability | Add changed UI-state/compatibility cases; keep existing functional evidence truthful; separately own exhaustive visual/release matrices. Refresh per slice rather than rerunning unrelated historical work. |
| 9 | `_bmad-output/auto-bmad/delivery/<story-or-epic>.json`, reports, `_bmad-output/implementation-artifacts/deferred-work.md` | Delivery author records exact revision, required passed checks and separately owned release validation. Reconcile the existing ledger on the integration base; do not fabricate a parallel ledger or backfill historical passes. |
| 10 | `_bmad-output/project-context.md`, `AGENTS.md` managed context, `docs/process/agent-workflow.md`, applicable quality/CI docs | Link accepted design authority and paths, source-material boundary, placeholder rules and development/release verification. Use `bmad-project-context` refresh after integrated changes. Preserve concurrent uncommitted edits. |
| 11 | `_bmad/custom/` overrides, frontend skill routing references, BMAD config | Reconcile skill example paths with actual `src` layout and accepted visual spine; fix durable naming through supported customization, not installer-managed TOML. Keep active loops unchanged. |
| 12 | `eslint.config.mjs` (future narrow tooling edit), possibly typecheck tooling if enrollment changes | Exclude only immutable supplied handoffs from app linting; never suppress errors in adapted source. The archive remains byte-identical. |

### Future epic and story impact register

All current future epic groups were inspected in `epics-phase-b.md`; B2/B3 mostly
remain candidate lists and must be deepened at their checkpoints. The following
is the required review coverage, not authorization to implement every design idea.

| Epic/story group | Scope/dependency/AC/state changes to assess |
| --- | --- |
| E15.1–15.6 | Map all five calendar views, toolbar/filter persistence, recurrence/exceptions, resolver and drag parity; retain submitted-only time and feed privacy; Min dag real empty/error states. Existing stories get follow-ups for new visual deltas, not rewritten completion. |
| E16.1–16.5 | Job identity versus workspace phases, member/lead scope, work-order versus prototype work-package semantics, one-way Projekt upgrade, protected form/history behavior and tab registry. Link PR105 comment disposition and unresolved browser observation. |
| E17.1–17.4 | Material reporting/request states, Projekt-only plan, entitled budget/actual/variance, immutable budget origin, no new rounding; dependency on E15 time and E16 jobs, billing seam to E26. |
| E18.1–18.4 | Split the field “activity” design into real diary/photo/deviation/chat/report commands; upload/retry and member permissions; completion once-only effects, old status-edit reconciliation, downstream activation and read-only state. |
| E19.2 | Five live widgets only; match visual cards without fake data, capability/activation and freshness states; consume actual E15–18 support. Preserve 19.1 history. |
| E20.1–20.3 | Delivered on newer main. Create visual follow-ups for search/filter/preview/archive/context links. Preserve source-authorized aggregation and per-link access; no reactivation story or replacement storage model. |
| E21.1–21.5 | Rental item versus asset, availability/reservation/out/return, document and billing-record states; dependent notifications and E26 handoff. 21.6 migration is explicitly VOID; do not revive it. |
| E22.1–22.5 | Assignment/events/fault/mileage/QR label states; minimal public QR abuse suite; decide E24 absorption at checkpoint. 22.6 migration remains VOID. |
| E23.1–23.4 | Service suggestion/due/overdue/plan-to-job/warranty states and completion provenance from E18; E16/E13 dependencies. 23.5 migration remains VOID. |
| E24.1–24.2 | Missing canonical panel screens/grid/print design; retain manual core, settle E22 merge; no image AI. 24.3 migration remains VOID. |
| E25.1–25.3 | File-import preview/errors/partial validation and manual pricing connection; explicitly remove designed vendor-API promise. 25.4 migration remains VOID. |
| E26.1–26.5 | Billing-basis candidate/lock/export-readiness states and inputs from E17/time/rentals; approval seam decision and real-invoicing gates; Fortnox spike informs final ADR, not premature integration UI. |
| E27.1–27.4 | Manual DoU content/editor/assembly/export and completion-seed flow; N-8 content and E18/E20 links; AI excluded. 27.5 migration remains VOID. |
| E28.1–28.3 | Checklist template versus completed inspection, results/signature meaning and PDF/read-only states; N-8 content and field failure states. 28.4 migration remains VOID; customer online signing is not inferred. |
| E29.1–29.2 | Thin tender/FKU structure, organized uploads/manual conversion links and owner visibility N-7; absent full screens need design depth; no AI/RAG. 29.3 migration remains VOID. |
| E30.1 | Manual KNX rooms/functions/group-address tables and settings, dense-table presentation and E29 adjacency; no AI generation. 30.2 migration remains VOID. |
| E31.1–31.7 | Sensitive HR fields separated from users/resources; absence/leave/payroll design scope reconciliation, N-4/N-10 and retention ownership; preserve 31.7 physical-reclamation dependency, no extra legal program smuggled through UI. Migration candidate 31.6 remains VOID where recorded. |
| E32.1–32.3 | Notes/notice board, Customer 360/favorites/classification, duplicate calculations and quote-branding completions; settle bundle decision and map exported fields/actions to entity permissions. Generic toolbox/chat is not implied. 32.4 migration remains VOID. |
| E33.1–33.3 | Connection/error/revocation/mapping and outbox states after E26 spike and final ADR; server-only OAuth/tokens, negative suite. No Fortnox artifact before gate. |
| E34.1–34.3 | Customer/article/basis export statuses and idempotent retry. Export-only contract does not authorize inbound supplier invoices, payment sync, payroll or invoice emailing. |

For every authoring pass, add: baseline/version plus screen/state paths, whether
the change is visual/composition/behavior/scope, current backend owner, unavailable
states, accessible/responsive AC, actual verification IDs and dependency readiness.
Unbuilt detailed stories are refined in place before approval; completed work gets
new linked follow-ups; active work stays with its owner until a deliberate clean
handoff. Check numbered candidates against the reconciled current epic file before
creating story files, especially candidates explicitly marked VOID.

## Material decisions, risks and next action

The first transition planning session should settle:

1. Which visual source wins the pill-versus-8px and ink-versus-yellow conflicts?
   Recommended: review representative controls and selected rows, then record one
   owner decision in the new visual spine. Neither archive preservation nor this
   assessment makes that choice.
2. Is the enquiry inbox only a new composition of approved CRM/quote/job actions,
   or a new intake product? Likewise classify work packages, global chat/DMs,
   payroll sync, supplier invoices and template/signing behavior before authoring.
3. Agree the initial integration batch and backend-resume criterion, and the
   DESIGN/EXPERIENCE versus existing Phase B UX authority crosswalk.

Main risks are adopting an unintegrated branch as truth, copying browser persistence
or simulated success, changing financial/domain semantics while restyling, leaking
money or foreign-tenant options through broad client payloads, losing existing
unsent-input/navigation protections, importing Phase C affordances and accepting
unrendered design states as verified. These are addressed by the mappings,
headless seams, explicit contracts and staged gates above.

**Recommended next action:** run a bounded UX reconciliation with Sally against
v1 and the current integrated/branch evidence, then prepare the concrete
correct-course proposal and foundation/integration story batch. Keep E15/E16 owners
working under their existing assignments. Do not initiate a pause, merge or design
implementation from this report alone.

## Checks performed for this task

- Both archive SHA-256 hashes compared; all 222 extracted files verified byte-for-byte by ZIP-entry hashes, with full original relative names and file-set equality.
- Post-extraction TypeScript: `node node_modules/typescript/bin/tsc --noEmit --incremental false` returned 0 in the current checkout. This is not backend regression or prototype behavior evidence.
- Scoped ESLint against `docs/design/claude-design/v1/handoff`: returned 1, 11 errors and 110 warnings across 84 inspected files. Findings include generated ReactDOM/module runtime, declaration `any`, a UI-kit effect and the iOS wrapper. Original files remain unchanged; the future narrow tooling exclusion is a known CI admission prerequisite.
- Read-only repository/ref/worktree/source and installed skill inspection; live PR105 metadata/comments checked through the GitHub connector. No services, database, browser prototype, legacy application, tests against demo, migration, deployment or active-loop control was started. No sprint/backlog or existing documentation was rewritten.
