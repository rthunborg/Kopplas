# Kopplas screen, state and action crosswalk

Status: accepted direction; DT-2026-10-23 documentation amendments approved and applied. Detailed requirements remain incorporated by reference. This inventory does not activate modules or rewrite completed evidence. Read [EXPERIENCE.md](EXPERIENCE.md) for common state/interaction rules and [DESIGN.md](DESIGN.md) for visuals.

## Source and evidence keys

- `MAIN`: `docs/design/claude-design/v1/handoff/Verksamhetssystem.dc.html`, `renderVals()` titles at lines 4747–4767. IDs are source anchors, not proposed URLs.
- `FIELD`: `docs/design/claude-design/v1/handoff/Fältvy.dc.html`, `renderVals()` lines 279–450; booleans `vyLogin`, `vyHem`, `vyJobb`, `vyAvsluta`, `vyKvitto`, `vyForfragan`, `ingenData`.
- `UX`: `_bmad-output/planning-artifacts/ux-design-specification-phase-b.md`, §§4.5–4.9, 10–12 and connected §4.8A. `PRD`: peer `prd-phase-b.md`, §4 B1–B7 and FR93–106. `ARCH`: peer `architecture-phase-b.md`, §§3.6, 8.3/8.4, 9.2, 12A.
- Integrated evidence is local recorded main `99104d0`, not working checkout `bbf7cef7`. E16 `29a6524a` ancestry plus actual jobs domains corroborates integration. E20 documents actions/filter/context source is integrated. E15 remains separate concurrent work; no branch completion label establishes availability.
- All rows inherit loading, selected/focus, meaningful empty/no matches, validation, permission denial/revocation, network/unknown outcome, explicit retry, suitable unsent drafts, stale/concurrency and server-confirmed success from EXPERIENCE.State Patterns. Additions below identify feature-specific cases.

## Main export surfaces

| MAIN ID | Capabilities and action owner | Actual support / proposed composition | Specific state or unresolved contract |
| --- | --- | --- | --- |
| `oversikt` | E19.1 registry/live pipeline; E19.2 other five widgets | Integrated dashboard/read-model; proposed shared WidgetCard composition | Per-widget failure/freshness; future cards absent, never sample zero/live totals. |
| `forfragan` | E3/E5/E6/E7 starting actions | Existing entities/actions; standalone intake inbox not established | Inbox/source ingestion/status/new field enquiry classification blocked. |
| `projekt` | E7/E16 job list/card/member/work-order/upgrade/workspace | Integrated `src/features/jobs/*-domain.ts`; actual five-tab workspace | Protected draft/history, selected child, late results; type differs from status. Prototype work packages need classification. |
| `planering` | E14 bookings/resources; E15.1–15.3 views/recurrence/resolver | E14 actual source; E15 branch-dependent | Schema, Resurser, Team, Beläggning, Min kalender; current conflict review, occurrence/series exceptions, DST and no-permission distinction. |
| `kund` | E3 customer/facility/contact; E32 deeper CRM | Existing CRM components/features/commands; restyle list/detail/dialogs | Separate IDs, archive/validation, unknown/stale mutation result; future 360/favorites/classification unavailable. |
| `personal` | E11 users/roles; E14 profiles; E31 HR | Reuse current admin/profile sources | Membership/profile/HR identities distinct; future private fields never generic person payload. |
| `tillgangar` | E21 rentals/E22 assets/E23 service/E24 panels | Future modules; existing files/profile substrate alone insufficient | Reservation/out/return, assignment/fault/service/QR states blocked until module contracts. |
| `avvikelse` | E18.2 deviations/risks | Future per-job member capture | Structured title/text/photos/severity/open/closed; all-jobs incident aggregation needs classification. |
| `tid` | E15.4 filing/review; E15.6 landing; E31 later HR | E15 branch support only | Own filing versus reviewer projection; submitted state, expected-hours difference. Prototype approval/payroll sync not inherited. |
| `chatt` | E18.2 member-only job chat | Future job slice | Author/time, persistence before mention notification; lobby/channel/DM/presence classification blocked. |
| `leverantor` | E25 supplier file import; E3 manual records | Current manual pricing inputs; future import | Preview/validation/reconciliation; live vendor API excluded. |
| `artikel` | E3 own articles/work roles; E25 imports | Existing manual article/pricing source | Unit/search/validation, file-import partial errors; no mock live price/API status. |
| `verktyg` | E27 DoU/E28 inspection/E29 tender/E30 KNX; E32 notes | Future distinct feature slices, not generic toolbox backend | Template version versus instance/lock/export/content owner; no AI or inferred online signing. |
| `fakturering` | E26 basis/E33 connection/E34 export | Future; no delivered invoicing UI inferred | Candidate/review/lock/audited correction/export outcomes need detailed contract; no payment sync/email expansion. |
| `levfakt` | No established inbound supplier-invoice owner | Design-only concept | Ingestion/approval/accounting effects require scope decision before any working-looking control. |
| `installningar` | E4 company/terms/pricing; E11 access; E13 notification; E33 future connection | Existing settings/admin components and actions | Validation, invitation and effective-permission states; future connection error/revoke/outbox states gated. |
| `falt` | E15.6/E16, then E17/E18/E28 | Responsive composition proposal over real feature actions | 360×640, explicit failure/retry, no aggregate local `Inskickat` success. |

Shell/login are implicit around these IDs: use existing AppShell/nav descriptors and real auth; current tenant, sign-out, role landing, focus/escape/drawer behavior and notifications survive. End customers do not acquire a login. Pending modules remain absent from navigation.

## Field export states and actions

| FIELD state/ID | Action mapping | Required state semantics |
| --- | --- | --- |
| `vyLogin` | Existing authentication | No seeded-person selection as login; loading/invalid credentials/current auth flow and generic denial. |
| `hem` / `vyHem` | E15.6 Min dag; E16 assigned jobs; open booking/job and time filing | Distinct no-booking/no-job/no-connection states; real identity and selected date. |
| `jobb` / `vyJobb` | E16 workspace; subsequent feature-owned diary/material/etc. | Preserve one job ID; real authorized reads and drafts; prototype work package is unresolved mapping. |
| `avsluta` / `vyAvsluta` | E15.4 time; E17.1 usage; E18.1 diary/photos; E18.2 deviation; E28 inspection | Proposed task grouping only. Each command owns validation/outcome; partial confirmed results cannot be reported as one atomic completion. |
| `kvitto` / `vyKvitto` | Result of an actual feature command | Show only confirmed persisted result/record link. Unknown/failed upload stays incomplete; no localStorage receipt. |
| `forfragan` / `vyForfragan` | Field enquiry creation | Blocked intake-classification decision; not inferred CRM creation. |
| `ingenData` | Missing prototype backing data | Replace with real load/empty/denied/network states; no instruction to launch prototype runtime. |
| `fel` | Feature-specific validation/request feedback | Associated inline error, retained suitable input and explicit retry; separate uncertain result from definite validation rejection. |

FIELD line 396 explicitly combines time/material/diary/deviation/inspection; lines 438–450 write local aggregate data. These demonstrate the boundary to replace, not an accepted transactional model.

## Job phase and document subflows

| Designed subflow | Governing capability and actual seam | Preserve / block |
| --- | --- | --- |
| Calculation → quote → accepted job | E4–7/E10; calculations/quotes features, commands, money helpers | Immutable versions, stale review/PDF/send locks, manual acceptance evidence and correction/new-version path. No generic phase-button mutation. |
| Job workspace | E16 `job-workspace-domain.ts`, card/members/orders/upgrade domains | Actual Overview/Work orders/Schedule/Files/Events registry, capabilities and protected navigation. |
| Material | E17.1 | Usage separate from requests; own-article search, quantity/unit/who/when, status/routing/notification after persistence. |
| Economy/payment plan | E17.2–17.4 | Accepted-quote budget origin, integer öre, entitled projections, Projekt-only plan, honest actual/freshness; E26 seam. No new valuation/rounding choice here. |
| Diary/photos | E18.1 | Author/time, camera-first/multi-shot/caption/one photo pool; files/file_links substrate and honest upload lifecycle. |
| Deviations/risks/chat | E18.2 | Separate structured commands/member scope. Severity must be resolved by approved requirements/owner-authorized defaults, never legacy browsing. |
| Reports/completion | E18.3–18.4 | Recipient projection, progress and final artifact; once-only audited event, active effects confirmed before commit, post-confirmation read-only notice. Existing minimal `done` is not this contract. |
| Files/Documents | E8/E20; documents features/read-model and source links | Search/filter/no matches/partial source availability, selected-link identity, expired preview reauthorization, archive/restore and return context; no replacement storage/template platform. |

## Later epic impact register

These are blocked feature-depth tasks until their approved checkpoint stories specify commands/states; not authorization to implement export ideas. Existing numbered migration candidates marked VOID stay VOID.

| Owner | State/action contract to deepen before build |
| --- | --- |
| E19.2 | Five live widgets: follow-ups, week bookings, conflicts, active jobs, time position; activation/capability/freshness and honest dependency readiness. |
| E21 | Rental item vs asset, availability/reservation/out/return, documents, billing seam and notification outcomes. |
| E22 | Assignment/events/fault/mileage, QR label valid/revoked/rate-limited/submitted states; existing public-surface policy unchanged. |
| E23 | Due/overdue/suggestion-to-job, service/warranty provenance and actual E18 completion consumer. |
| E24 | Manual panel grid/print screens and E22 absorption decision; no image AI. |
| E25 | File preview/errors/partial validation/reconciliation and manual pricing; no supplier live API. |
| E26 | Basis candidates/inclusion, review/adjust/audited reason, lock/correction/export-readiness and Fortnox spike/final ADR; money policy inherited. |
| E27 | Manual DoU editor/assembly/version/lock/export/seed offer; named expert content ownership and approval, no authored compliance content or AI inference. |
| E28 | Version-bound inspection runner, measurements/attachments/results, signature meaning and PDF/read-only outcome; no online customer signing inferred. |
| E29 | Thin tender/FKU structure, manual uploads/conversion links and owner visibility; absent canonical screens need depth, no AI/RAG. |
| E30 | Manual KNX rooms/functions/group-address/settings tables; dense-table responsive access, no generated AI result. |
| E31 | Sensitive personnel/absence/leave/payroll scope reconciliation and retention ownership; users/resource profiles remain distinct; no new legal program. |
| E32 | Notice/notes, customer 360/favorites/classification, calculation duplication and quote branding; settle bundle and entity action permissions. |
| E33 | Fortnox connection/error/revocation/mapping/outbox after approved ADR/gates; credentials remain server-only. |
| E34 | Customer/article/basis export outcomes and idempotent explicit retry; inbound invoice/payment/payroll/email expansion excluded. |

## Amendment and verification handoff

### Frozen Phase A journey inheritance

Exact headings below come from [Phase A PRD](../../prd.md#user-journeys), lines 122–162. [Frozen Phase A UX](../../ux-design-specification.md) supplies the referenced screen contracts. These are role protagonists in the source; no invented personal names or testimonials are required. Failures and success criteria remain inherited at those anchors.

| Exact Phase A journey heading and PRD anchor | Frozen UX source anchor | Current migration/flow entry and retained outcome |
| --- | --- | --- |
| Journey 1: Tenant Admin Completes the Core Pilot Workflow — `#journey-1-tenant-admin-completes-the-core-pilot-workflow` | §4 `#4-end-to-end-tenant-admin-workflow`; §§5–8 calculation/quote/job/files | EXPERIENCE IA CRM/quote journey and B3/B4; MAIN `kund` → supported calculation/quote phases → `projekt`. Preserve traceable immutable version, acceptance, amounts and selected files; failed acceptance/job creation is not partial success. |
| Journey 2: Tenant Admin Changes a Quote After It Was Sent — `#journey-2-tenant-admin-changes-a-quote-after-it-was-sent` | §6 `#6-quote-version-pdf-and-acceptance-ux-requirements` | EXPERIENCE B4 and stale/concurrent/PDF states; new-version/correction entry from quote. Sent version stays immutable; changed customer-visible content requires the current review/PDF/send path. |
| Journey 3: Tenant Admin Handles Acceptance With Adjusted Price or Evidence — `#journey-3-tenant-admin-handles-acceptance-with-adjusted-price-or-evidence` | §§6–7 `#6-quote-version-pdf-and-acceptance-ux-requirements`, `#7-basic-joborder-ux-requirements` | EXPERIENCE B3 and LockConfirmDialog/state rules; existing internal manual acceptance/evidence/correction entry. Preserve reason/evidence, transactionality and idempotent job creation; no customer login/signing. |
| Journey 4: Pilot Operator Compares New Behavior Against Lovable Oracle — `#journey-4-pilot-operator-compares-new-behavior-against-lovable-oracle` | Purpose/boundary and §11 `#11-explicit-non-goals`; historical verification context | Historical source retained unchanged. Owner 2026-10-15 supersedes browsing legacy URLs as evidence. Current migration uses preserved approved fixtures, source contracts and existing comparison evidence; this is verification work, not a new app screen or permission to access the legacy application. |
| Journey 5: Internal Support Investigates a Tenant or File Access Issue — `#journey-5-internal-support-investigates-a-tenant-or-file-access-issue` | §8 `#8-file-and-attachment-ux-requirements`; §9 `#9-validation-error-empty-and-loading-states` | EXPERIENCE files/denied/expired-link/AuditTrail rules and existing authorized support metadata/runbooks. Preserve traceability and tenant-private short-lived links; no new support role, service-role UI or access policy inferred. |

### Existing Phase B UX section authority

This navigation mapping is supplemented by the DT authority register. Preserve every current heading and detailed rule unless its source-to-destination requirement-level transfer is reviewed. A row marked retained-by-reference is covered by incorporation, not retired. The 17 MAIN and 8 FIELD rows, all common states, five frozen journeys, Phase B B1–B7 and later-epic impacts remain the minimum screen/flow inventory; actual implementation inventory on the pinned base must also be reconciled.

This is a navigation crosswalk, not approval to delete or replace old sections. EXPERIENCE incorporates the existing detailed Phase B UX as a normative annex under approved DT-2026-10-23; accepted owner visual decisions supersede the old visual posture. No detailed requirement has been retired.

| Existing `ux-design-specification-phase-b.md` section | New contract location | Authority treatment |
| --- | --- | --- |
| §1 Foundation — visual posture | DESIGN.md; EXPERIENCE.Foundation | Accepted written-rule visual decisions supersede old Geist styling. Connected posture and domain principles remain inherited. |
| §2 Information Architecture | EXPERIENCE.Information Architecture; this screen-ID inventory | Inherit server-filtered navigation and §2.4 entity links/origin/Back context; grouped presentation is a composition proposal. |
| §3 Role Surfaces and Least-Privilege UX | EXPERIENCE.Foundation, Information Architecture, State Patterns and Component Patterns | Existing permission/entitlement behavior remains binding; no new role policy. |
| §4 Wave B1 Detailed Surfaces | EXPERIENCE.Information Architecture, State Patterns, Key Flows; job subflow table here | Retain detailed quote, admin, provisioning, notification, scheduling, field and job contracts; summaries do not replace their ACs. |
| §5 B2/B3 Pattern-Level Specifications | EXPERIENCE.Build gates; later epic impact register here | Inherit patterns; detailed future contracts remain blocked until approved checkpoint work. |
| §6 Component Patterns | EXPERIENCE.Component Patterns; DESIGN.Components | Preserve behavioral meanings, including ConnectionChip as an entity relationship link, not connectivity status. |
| §7 State Patterns | EXPERIENCE.State Patterns | Inherit all domain-specific states; common matrix adds presentation guidance, not new persistence semantics. |
| §8 Interaction Primitives | EXPERIENCE.Interaction Primitives | Preserve explicit actions, keyboard/dialog parity, protected drafts and authoritative outcomes. |
| §9 Voice, Tone, Terminology | EXPERIENCE.Voice and Tone | Inherit terminology and status meanings; new copy examples do not rename domain states. |
| §10 Accessibility Floor | EXPERIENCE.Accessibility Floor; DESIGN contrast/visual rules | Existing behavioral floor retained; accepted written visual rules apply with measured evidence. |
| §11 Responsive and Platform Strategy | EXPERIENCE.Responsive & Platform | Connected responsive web at 360×640 retained; no offline/PWA feature introduced. |
| §12 Key Flows | EXPERIENCE.Key Flows | Preserve Phase B journeys and inherited frozen Phase A journeys; future steps remain conditional. |
| §§13–15 Owner-Gate Impact Map, Architecture Open Items, Assumptions Register | EXPERIENCE.Build gates; root course-correction handoff | Retain existing gate/decision/assumption records until explicit course-correction replacement or reconciliation. No deletion approved. |

Course correction should identify each row as visual-only, composition, inherited behavior or material scope decision, then amend the current UX/story references explicitly. Completed stories receive linked follow-ups; active E15 work remains with its owner. No backlog status changes follow from this file.

Later slice evidence: exact source head; essential production-build browser smoke; responsive keyboard/focus/error/retry and server-confirmed result; existing required domain/integration/RLS tests appropriate to changed scope. Exhaustive screenshot/device/release checks remain separately owned and are never marked passed because a source mapping exists. The selected [independent source/contract review](validation-report.md) is complete; rendered visual/browser evidence remains outstanding.
