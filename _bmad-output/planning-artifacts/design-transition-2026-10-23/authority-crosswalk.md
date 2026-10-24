# DT-2026-10-23 — authority and coverage register

Status: owner-approved incorporation scheme applied 2026-10-23, no requirements retired. The source hash and line inventory below identify the pre-amendment snapshot; original headings remain valid after authority wording/pointers changed. Part of [the approval package](../sprint-change-proposal-2026-10-23-design-transition.md).

## One canonical scheme

DESIGN owns appearance. EXPERIENCE owns shared interactions and approved composition and incorporates the detailed numbered Phase B UX annex plus approved domain story contracts. PRD, ADRs and manifest retain product authority. The annex remains normative for every detailed rule not individually transferred. References are incorporation, not a claim that the summary contains all details. Frozen Phase A and v1 remain byte-preserved history.

For now keep every existing heading and its content except the exact authority edits EP-01. No duplicated domain section is superseded by this proposal. This provides complete coverage by explicit inheritance while preventing silent loss. Later retirement requires a reviewed atomic-requirement register, not simply this heading inventory.

## Required atomic transfer gate

Before any duplicated section is retired, enumerate every normative bullet, table row, state, error, action, precondition, exception, role projection, journey outcome, assumption and gate. Each row must record stable source ID/anchor and quoted requirement, precise destination anchor, delta class, owner/story, preserved or approved-changed meaning, verification IDs and disposition. Reconcile approved story contracts and current implementation additions as well as the old UX document. Check all incoming links and keep the old heading as a redirect to a verified destination. Every binding rule must be retained-by-reference or transferred with proof; zero orphan requirements, unresolved contradictions or broken deep links. A newly proposed behavior cannot be counted as inherited. Review gaps block retirement/story approval, not unrelated E15 progress.

Visual authority edits can proceed after approval without deleting detailed behavior. EXPERIENCE must explicitly name the annex and domain contracts, so there are no competing silent defaults. A later source version needs an impact amendment; receipt does not change authority.

## Complete current Phase B section inventory

The source hash and exact heading/line inventory below identify the working document with pre-existing owner edits. Stable source headings are retained. Destination names refer to the accepted pair in `../ux-designs/ux-Kopplas-2026-10-23/`. This inventory includes purpose, amendments and registers, not only screen sections.

Source SHA-256: `11c9a0e271fec165f90115faba04be14847acb2771e330eace95001e9d31bf09`.

| Source heading and line | Canonical entry / incorporated detail | Treatment / delta |
| --- | --- | --- |
| UX Design Specification — Kopplas Phase B (Legacy Parity Release) (L23) | DESIGN all sections; EXPERIENCE Foundation | Visual amendment EP-01; retain nonvisual principles |
| Current design authority — owner decision 2026-10-15 (L29) | EXPERIENCE Foundation / Build gates; original heading | Retained history, scope, principles or navigation; EP-01 where explicit |
| 0. Purpose, Boundary, and Reading Order (L39) | EXPERIENCE Foundation / Build gates; original heading | Retained history, scope, principles or navigation; EP-01 where explicit |
| 1. Foundation (L53) | DESIGN all sections; EXPERIENCE Foundation | Visual amendment EP-01; retain nonvisual principles |
| Form factor and posture (L55) | EXPERIENCE Foundation / Build gates; original heading | Retained history, scope, principles or navigation; EP-01 where explicit |
| UI system (L60) | DESIGN all sections; EXPERIENCE Foundation | Visual amendment EP-01; retain nonvisual principles |
| Design principles (Phase B additions to the Phase A posture) (L65) | EXPERIENCE Foundation / Build gates; original heading | Retained history, scope, principles or navigation; EP-01 where explicit |
| 2. Information Architecture (L75) | EXPERIENCE Information Architecture / Component Patterns | Composition; server navigation and origin/Back requirements retained |
| 2.1 Navigation model: grouped sidebar derived from manifest × permission matrix (L77) | EXPERIENCE Information Architecture / Component Patterns | Composition; server navigation and origin/Back requirements retained |
| 2.2 Target IA at full Phase B build-out (L86) | EXPERIENCE Information Architecture / Component Patterns | Composition; server navigation and origin/Back requirements retained |
| 2.3 Top bar (L125) | EXPERIENCE Information Architecture / Component Patterns | Composition; server navigation and origin/Back requirements retained |
| 2.4 Cross-navigation rules (extended) (L132) | EXPERIENCE Information Architecture / Component Patterns | Composition; server navigation and origin/Back requirements retained |
| 3. Role Surfaces and the Least-Privilege UX Model (L141) | EXPERIENCE IA / State Patterns / MaskedValue / EffectivePermissions | Inherited behavior; exact role/field rules retained in annex |
| 3.1 Role → home surface (L143) | EXPERIENCE IA / State Patterns / MaskedValue / EffectivePermissions | Inherited behavior; exact role/field rules retained in annex |
| 3.2 Sensitive-field masking — the mechanism (policy is N-4's) (L154) | EXPERIENCE IA / State Patterns / MaskedValue / EffectivePermissions | Inherited behavior; exact role/field rules retained in annex |
| 4. Wave B1 Detailed Surface Specifications (L167) | EXPERIENCE Foundation / Build gates; original heading | Retained history, scope, principles or navigation; EP-01 where explicit |
| 4.1 Quote lifecycle completion (E10) — delta on the frozen Phase A quote UX (L169) | EXPERIENCE IA / Key Flows / components; detailed original subsection | Inherited quote/admin/operator/notification detail; retained |
| 4.2 RBAC and admin user management (E11) (L190) | EXPERIENCE IA / Key Flows / components; detailed original subsection | Inherited quote/admin/operator/notification detail; retained |
| 4.3 Tenant provisioning and onboarding (E12) (L208) | EXPERIENCE IA / Key Flows / components; detailed original subsection | Inherited quote/admin/operator/notification detail; retained |
| 4.4 Notifications and email touchpoints (E13) (L232) | EXPERIENCE IA / Key Flows / components; detailed original subsection | Inherited quote/admin/operator/notification detail; retained |
| 4.5 Scheduling: the five views (E14/E15) (L244) | EXPERIENCE scheduling IA / interactions / states / B1-B2; original subsection | Inherited E15 contract; migration conditional on DT-B15 |
| 4.6 Booking creation, recurrence, and the conflict resolver (L258) | EXPERIENCE scheduling IA / interactions / states / B1-B2; original subsection | Inherited E15 contract; migration conditional on DT-B15 |
| 4.7 Time reporting (E15) (L286) | EXPERIENCE scheduling IA / interactions / states / B1-B2; original subsection | Inherited E15 contract; migration conditional on DT-B15 |
| 4.8 The field-worker experience (Montör on a phone) — **connected responsive web (ADR-B009, 2026-09-03)** (L294) | EXPERIENCE connected states / Responsive & Platform / B1 | Inherited ADR-B009; full lifecycle/storage limits retained |
| 4.8A Connected field UX contract (ADR-B009; supersedes ADR-B007) (L318) | EXPERIENCE connected states / Responsive & Platform / B1 | Inherited ADR-B009; full lifecycle/storage limits retained |
| 4.9 The job workspace (E16–E18) — **model resolved by ADR-B006 (2026-07-26)** (L342) | EXPERIENCE Jobs IA / B3; crosswalk job subflows | Inherited E16 and blocked E17/E18 feature detail; no activation |
| 4.10 Operational dashboard v1 (E19) (L375) | EXPERIENCE WidgetCard / IA; crosswalk E19.2 | 19.1 inherited; future widgets gated |
| 5. Wave B2/B3 Pattern-Level Specifications (L393) | EXPERIENCE Build gates; screen-state-crosswalk later epic register | Inherited patterns; detailed checkpoint requirements retained |
| 5.1 Shared module conventions (the B1 inheritance) (L397) | EXPERIENCE Build gates; screen-state-crosswalk later epic register | Inherited patterns; detailed checkpoint requirements retained |
| 5.2 Module deltas (one paragraph each) (L410) | EXPERIENCE Build gates; screen-state-crosswalk later epic register | Inherited patterns; detailed checkpoint requirements retained |
| 6. Component Patterns (behavioral contracts, new in Phase B) (L428) | EXPERIENCE Component Patterns; DESIGN Components | Behavior inherited; visual alias mapping only |
| 7. State Patterns (L448) | EXPERIENCE State Patterns plus original domain-specific matrix | Inherited states; common summary does not replace exceptions |
| 8. Interaction Primitives (L467) | EXPERIENCE Interaction Primitives | Inherited behavior; protected input/history preserved |
| 9. Voice, Tone, and Terminology (L476) | EXPERIENCE Voice and Tone | Inherited terminology; historical oracle instructions superseded by 2026-10-15 |
| 10. Accessibility Floor (L506) | EXPERIENCE Accessibility Floor; DESIGN contrast/components | Inherited behavioral floor; accepted stronger visual floor |
| 11. Responsive and Platform Strategy (L519) | EXPERIENCE Responsive & Platform / states | Inherited 360x640 connected posture and ADR-B008 correction delta |
| 12. Key Flows (protagonists per PRD §4 journeys; climax beats marked) (L542) | EXPERIENCE Key Flows; crosswalk frozen journeys | Inherited outcomes and failures, with domain detail retained |
| 13. Owner-Gate Impact Map (what is designed vs what waits) (L556) | EXPERIENCE Build gates; original register and approved ADR/story dispositions | Retain all gate/open-item/assumption records; only UXB-A1 authority changed |
| 14. Open Items for the Architecture Stage (L573) | EXPERIENCE Build gates; original register and approved ADR/story dispositions | Retain all gate/open-item/assumption records; only UXB-A1 authority changed |
| 15. Assumptions Register (autonomous run record) (L590) | EXPERIENCE Build gates; original register and approved ADR/story dispositions | Retain all gate/open-item/assumption records; only UXB-A1 authority changed |
| Product naming amendment — 2026-10-09 (L611) | EXPERIENCE Foundation / Build gates; original heading | Retained history, scope, principles or navigation; EP-01 where explicit |

## Surface, component, state and journey completeness

Use the accepted [screen-state-crosswalk](../ux-designs/ux-Kopplas-2026-10-23/screen-state-crosswalk.md) as the screen/action inventory, not prototype routes:

- MAIN: oversikt, forfragan, projekt, planering, kund, personal, tillgangar, avvikelse, tid, chatt, leverantor, artikel, verktyg, fakturering, levfakt, installningar, falt. Authentication/shell are separately inherited. Unsupported rows remain classified/blocked; mapped does not mean implemented.
- FIELD: vyLogin; hem/vyHem; jobb/vyJobb; avsluta/vyAvsluta; kvitto/vyKvitto; forfragan/vyForfragan; ingenData; fel. The combined local receipt is replaced by feature-owned outcomes, not a new cross-feature transaction.
- Jobs/documents: calculation/quote/accepted-job journey, workspace, material, economy/payment plan, diary/photos, deviations/risks/chat, reports/completion, Files/Documents. Preserve one job identity and selected-link/file context.
- Components: all 26 rows in EXPERIENCE Component Patterns, including StatusBadge, NotificationItem, QueueList, entity-link ConnectionChip, MaskedValue and EffectivePermissions. Visual anatomy remains DESIGN's responsibility. Count/name reconciliation must be rerun before retirement; a count alone is not semantic completeness.
- States: cold/loading, connected/loaded, empty/no matches, focus/selection, validation, denied/revoked, unavailable, connection-required, submitting/uploading, failed/unknown, unsent, stale/concurrent, confirmed, locked/read-only. Every feature adds its actual exceptions/transitions. No missing state is fabricated from fixtures.
- Journeys: Phase B B1-B7 plus supporting admin/record work; all five exact frozen Phase A journeys in the accepted crosswalk. Preserve frozen historical oracle journey as history, with 2026-10-15 prohibition governing future work. No legacy URL is evidence.
- Future coverage: E17.1-17.4, E18.1-18.4, E19.2, E21-E34 at their real checkpoints; E20's three delivered contracts retained. VOID candidates remain VOID.

This is complete source-category and section coverage by incorporation, not atomic transfer or runtime proof. Reconcile every actual implemented route/component/action on DT-B0, including auth, support, public and operator surfaces outside export IDs, before final DT-6 inventory. Those surfaces are covered by existing contracts meanwhile; they cannot disappear because absent from a prototype.

## Evidence boundary

The selected prior source/contract review resolved three medium coverage gaps. No browser/rendered/composite-contrast/release pass follows. This run checks proposal links, heading inventory and input preservation only. Atomic transfer review, actual story readiness, rendered states, domain regression execution and release validation remain later owned work. The proposal deliberately retains detailed sections instead of claiming their summaries supersede them now.
