---
name: Kopplas
status: approved-shared-experience-with-incorporated-requirements
updated: 2026-10-23
sources:
  - ../../prd-phase-b.md
  - ../../ux-design-specification-phase-b.md
  - ../../architecture-phase-b.md
  - ../../epics-phase-b.md
  - ../../prd.md
  - ../../ux-design-specification.md
  - ../../../../docs/design/claude-design/transition-assessment-2026-10-21.md
  - .memlog.md
---

# Kopplas — Experience contract

## Foundation

One connected responsive web application serves office and field work. Existing Next.js/React/Tailwind components and headless features are the implementation substrate; no new UI framework is implied. [DESIGN.md](DESIGN.md) owns visual identity. The owner's written-rules-first decision supersedes the old Geist posture. The spines win over supplied visual imports; product scope and domain authority continue to come from the PRD, ADRs, manifest and current Phase B UX.

This document records accepted direction and inherited behavior under the owner-approved DT-2026-10-23 documentation amendments. It is not final readiness or an implementation assignment. **Inherited** means an existing requirement remains binding. **Composition proposal** means a presentation/navigation adaptation to ratify in affected stories. **Blocked** means incomplete feature contracts must be deepened before building. EXPERIENCE is the shared interaction/composition entry point under DT-2026-10-23 and explicitly incorporates the detailed Phase B UX annex and approved story contracts. All still-binding domain requirements remain there until individually transferred with verified anchors and coverage. Proposed or blocked feature depth is not silently promoted to an approved command contract.

Evidence baseline: working checkout `bbf7cef7`; locally recorded main `99104d0` includes E16 and E20. E16 `29a6524a` is an ancestor of that main. E15 is separate, concurrent work: the reported `bd4121e55489bf8f5a35fdd80d3f9ffd68fb98ea` is a moving checkpoint, not integrated availability. Do not pause or take over its stories. The selected [source/contract review](validation-report.md) is complete; runtime, rendered accessibility and release qualification remain unestablished.

## Information Architecture

The [screen/state crosswalk](screen-state-crosswalk.md) is the complete export-ID inventory and feature ownership map. Export IDs are traceability anchors, not route names. Grouped navigation is a composition proposal; server-issued navigation and the scope manifest determine actual destinations. A pending module does not acquire navigation, widgets or working-looking actions through this document.

| Surface family | Entry and journey | Required usable composition |
| --- | --- | --- |
| Authentication and shell | Sign in; all flows | Real identity, current tenant, role landing, notifications and sign-out; responsive AppShell. No prototype identity picker. |
| CRM and quote journey | Customers/settings → calculation → quote → job; Johan and Sara | Retain distinct customer/facility/contact records, calculation validation, immutable quote versions, review/PDF/send/manual acceptance and jobs handoff. A phase chain navigates supported work; it never bypasses a command. |
| Dashboard | Authorized landing or navigation; Johan | Existing live quote pipeline and isolated WidgetCard states. Other cards await E19.2. Montör lands on Min dag when E15.6 is available. |
| Jobs workspace | Job list, assigned job, quote or booking; Emil/Sara | One job ID; existing Overview, Work orders, Schedule, Files, Events. Type Order/Projekt stays separate from status. Future field/economy tabs are activated feature slices, not placeholders. |
| Scheduling/time | Planering, job Schedule, Min dag; Sara/Emil | Five calendar projections, editor/resolver/recurrence and submitted time filing. E15 visual migration waits for its verified integration. |
| Files/Documents | Job/entity panel or Documents center; all entitled roles | Existing source-authorized aggregation, search/filter, preview, archive/restore and contextual return; selected link identity preserved. |
| Administration | Settings, users/roles, notifications; Företagsadmin | Existing validation, invitation state, effective permission explanation and current tenant context. |
| Operator/onboarding | Separate operator entry; PRD B5 | Keep existing strict preview/approval/reconciliation and readiness UX unchanged; internal security details are not product copy. |
| Future operational modules | Approved active navigation only; Anna and service journey | E17–18 and E21–34 need the explicit contract gates below before their actions exist. |

## Voice and Tone

Use direct Swedish action labels, concrete entity names and a next step. Distinguish record status from connection state and retained input. Examples below are wording patterns, not new workflow states.

| Meaning | Copy pattern |
| --- | --- |
| Unsent input | `Utkast ej skickat` — retained input is not persistence. |
| No connection | `Anslutning krävs` with an explicit useful retry action. |
| Confirmed save | `Sparad i systemet` only after authoritative confirmation. |
| Failure | `Kunde inte skickas. Dina uppgifter finns kvar här. Försök igen.` State photo/tab-close limits where applicable. |
| Unknown result | `Resultatet kunde inte bekräftas.` Offer the command's existing reconciliation/refresh path before another consequential action. |
| No data | Explain whether no records exist or current filters have no matches; do not describe denied data as empty. |
| Stale quote/PDF | Explain which artifact must be refreshed and why send is unavailable. |

## Component Patterns

Visual specifications belong to DESIGN.md; these shared names describe behavioral responsibilities, not an instruction to introduce every abstraction immediately.

| Component | Behavioral contract |
| --- | --- |
| AppShell | Server-filtered navigation, active destination and tenant identity; mobile drawer traps/restores focus, closes with Escape and does not discard a draft. |
| Button | Explicit action verb; submitting prevents accidental duplicate clicks; unavailable/destructive state has a reason at the decision point. |
| Field | Persistent label, help/error association and preserved valid input; validation summary links to invalid fields. |
| SelectionRow | Selection and navigation are distinguishable; keyboard equivalent to pointer; selected detail identity survives refresh. |
| Table | Header semantics, labeled sort/filter controls, stable row identity, meaningful no-match and load-error states; row actions remain available on touch. |
| StatusIndicator | Text expresses domain status; color is supplementary. Does not masquerade as connection or save confirmation. |
| StatusBadge | Inherited Phase B status pattern; coordinated visual alias of StatusIndicator. Text+icon distinguishes neutral/progress/success/terminal/warning families; new statuses remain module-registered and terminal differs from active. No new implementation requirement follows from the alias. |
| ConnectionChip | Navigable entity relationship: type icon + label, consistent across modules, graceful overflow and ≥44px target. Preserve originating record and useful Back context (Phase B UX §§2.4, 6). This is not a network indicator; connectivity failures use Banner. |
| Card | Groups one coherent record/task; primary destination explicit; avoid competing nested click targets. |
| SideSheet | Labeled dialog, trapped/restored focus, Escape and explicit close; protected unsent input follows current feature navigation contract. |
| LockConfirmDialog | Names irreversible/locking effect and current record before confirmation; success only after server result. Reuse existing approval semantics. |
| Banner | Persistent actionable failure/staleness or operational gate; stays until resolved/dismissible under existing contract. |
| Toast | Nonessential transient confirmation or update; never sole home of validation, failure or a required decision. |
| Tooltip | Supplemental help available by focus and touch-compatible equivalent; no essential instruction hidden here. |
| EmptyState | Distinguishes no records, no matches and unavailable content; offers only permitted supported actions. |
| WidgetCard | Title, one deep link, loading, meaningful empty, error/retry and freshness; one failure cannot blank dashboard. |
| BookingBlock | Accessible booking name/time/status; click/keyboard opens editor; drag always has a dialog alternative. |
| ConflictPanel | Shows current conflict type/evidence and permitted resolution; proposals never write until explicit checked command. Preserve reviewed-warning/acceptance semantics. |
| RecurrencePreview | Lists materialized dates and warnings before save; occurrence versus series edit is explicit, including exceptions and DST. |
| CaptureButton | Sticky phone entry ≥48px with icon+label; photo capture opens camera first where supported, picker secondary. |
| AuditTrail | Displays authoritative actor/time/event order; append-only history is never an editable form or simulated activity feed. |
| Wizard | Explicit current step, validation, review and outcome; back preserves suitable input; operator wizard retains existing preview/approval/reconciliation contract. |
| MaskedValue | Implements existing entitlement presentation; never receives a hidden sensitive number as a prop. Entire useless money tabs remain absent. |
| EffectivePermissions | Read-only explanation from server matrix with granting roles; no implication that viewing or platform metadata grants permission. |
| NotificationItem | Inherit category icon, one-line text, relative time, unread state and authorized deep link, consistently across popover and center. Categories appear only for active registered producers; existing read-state and delivery semantics remain binding. |
| QueueList | Inherit actionable queue pattern: count, grouped items, permitted per-item actions, meaningful empty state and freshness stamp. Used for supported conflicts/follow-ups and later activated suggestions/export errors; a pattern does not activate a module. |

## State Patterns

Every surface family applies the common matrix plus its specific states. Feature-specific server contracts determine exact transitions; presentation cannot invent recovery or idempotency guarantees.

| State | Common behavior | Additional affected surfaces |
| --- | --- | --- |
| Cold/loading | Preserve structure and label loading; disable data-dependent actions without invented zero values. | Dashboard isolates each widget; calendar keeps selected period/filter. |
| Connected/loaded | Display current server facts and freshness when material. | Calendar/time shows correct selected period; files retain selected link. |
| Empty/no matches | Explain which condition applies, with permitted action or filter reset. | Min dag distinguishes no bookings from no assigned jobs. |
| Focus/selection | Visible focus; reading-order navigation; selected row/tab name and state exposed. | Job child selection and browser history preserve current drafts. |
| Validation | Inline associated error plus navigable summary where needed; preserve other input. | Quantity/unit, time/date, recurrence and quote validation stay domain-owned. |
| Permission denied/revoked | Generic authorized denial; do not leak withheld content or treat it as an empty list. On revocation stop presenting stale privileged actions. | Admin, job members, documents and money projections retain server enforcement. |
| Feature unavailable | No pending-module destination or fake working control. Explain a legitimate unavailable action only where the approved existing flow requires it. | E17/E18 and future modules are blocked slices. |
| Connection required | Explicit failure and retry; retain suitable unsent input; no implicit offline read/write promise. | Field input/photo lifecycle limits disclosed. |
| Submitting/uploading | Mark operation in progress and prevent duplicate clicks; file completion is separate from form text. | Upload progress, oversized/blocked type, partial/failed attachment states. |
| Failed/unknown outcome | Do not show success. Follow existing authoritative reload/reconciliation before retry when outcome is uncertain; explicit retry only. | Completion, quote sending, provisioning, imports/export and locks must not gain blind retries. |
| Unsent draft | Component state; suitable minimized session draft scoped to current user/tenant/entity/form; photos in memory when appropriate. | Navigation confirms before abandoning protected input; no tab-close/device durability promise. |
| Stale/concurrent | Explain stale version or changed facts; preserve edits and require existing refresh/review path. Never full-card overwrite through a restyle. | Quotes retain fingerprint/review expiry/PDF provenance; booking conflict evidence rechecked. |
| Confirmed | Only authoritative result establishes stored status, audit event, notification or attachment completion. | Multi-feature field actions cannot share one fake `Inskickat` receipt. |
| Read-only/locked | Show reason and allowed next action. | Sent quote snapshots, locked billing basis and E18 completed field tabs have different domain meanings. |

## Interaction Primitives

Explicit save/submit is the default where existing commands require it; no new autosave or optimistic persistence is introduced. Browser Back/Forward, tab switches, child selection and late async results retain existing job-workspace protections and live query semantics. Dialogs identify their record, restore focus and do not use background navigation to hide unsent-input decisions.

Calendar drag and resize are enhancements to keyboard/dialog operations. Conflict acceptance requires current evidence and the existing explicit selected warnings/reason path. Series, occurrence and exception actions are separately named. Date and time rendering follows current Europe/Stockholm/DST helpers, not prototype string arithmetic.

Files open through the selected authorized link. Expired preview URLs offer reauthorization/reload rather than a public fallback. Archive and source-context actions retain original link identity. Long operations show truthful progress or in-progress status, with completion only after confirmation.

## Accessibility Floor

Inherit Phase B UX §10 and existing working shell/dialog behavior. All operations are keyboard reachable with visible focus, semantic names/roles/states and logical order. Announce meaningful validation, submission and completion changes without repeatedly reading whole pages. Focus errors or summaries after rejected submission; restore trigger focus on close. Primary field targets are ≥48px; other targets ≥44px. No hover-only control, color-only status or precision-drag-only action. Respect reduced motion. Long Swedish content, text enlargement, zoom and browser keyboard must not hide actions or validation. Visual contrast—including disabled text—follows the accepted written-rule floor in DESIGN.md and requires measured evidence, not an assertion from a token name.

## Responsive & Platform

| Posture | Required behavior |
| --- | --- |
| Phone from 360×640 | Single-column field tasks, readable labels, sticky CaptureButton clear of keyboard/content; active job identity visible; workspace priority tabs plus `Mer`; accessible drawer. |
| Tablet | Same records/actions with more space; touch actions remain explicit; no desktop-only hover dependency. |
| Laptop/desktop | Office master/detail, tables and planning density; selections remain apparent; side sheets do not erase source context. |
| Five scheduling views | `Schema`: day/week time grid and month density, phone agenda fallback. `Resurser`: person timeline. `Team`: week board grouped by work role. `Beläggning`: capacity overview with phone summary. `Min kalender`: personal agenda on phone/week grid on desktop. All share one booking model and filter semantics. |

The viewport table does not certify every exported dense grid. Layout-driving desktop/phone states need bounded references and real essential smoke in later stories. Phase B has no PWA install, service worker, durable offline storage, queue/replay or native app.

## Inspiration & Anti-patterns

The supplied main and field exports illustrate grouped navigation, list/detail continuity and a consolidated work context; they do not authorize seeded values, localStorage commits or simulated integrations. Written handoff rules outrank prototype CSS. Preserve the untouched [main export](../../../../docs/design/claude-design/v1/handoff/Verksamhetssystem.dc.html) for screen-ID/composition reference and [field export](../../../../docs/design/claude-design/v1/handoff/Fältvy.dc.html) for phone task grouping, not authentication or persistence. There are no promoted rendered mockups in this run. No screenshot fidelity has been verified.

## Key Flows

### B1 — Montör Emil runs his connected day from the field.

1. Emil signs in on his phone; Min dag shows real own bookings and assigned jobs (E15.6 dependency).
2. He opens a booking, then its job; supported E16 workspace actions retain that job ID.
3. As E17/E18 slices become available, he logs material, writes diary text and captures photos through their separate commands.
4. A panel differs from the drawing; he records a structured deviation. If connection fails, text remains an unsent draft and selected photos remain in memory where practical; no notification is claimed.
5. He explicitly retries through the approved command after connection returns.
6. **Climax:** the server confirms the deviation and attachments; success and the authoritative notification follow. He files time against the booking/job before leaving.

Failure: no booking is an honest empty state, denial is distinct, upload failure is not submission, and an unknown result uses authoritative recovery. E15.6/E17/E18 detailed slices remain blocked until their own contracts/evidence exist; no unified activity commit is proposed.

### B2 — Projektledare Sara schedules a crew and resolves a conflict.

1. Sara opens Planering next week, selects the team and job.
2. She uses booking editor or equivalent drag entry to select people, role and time.
3. Current collision/capacity evidence appears before save; existing explicit reviewed-warning acceptance semantics remain binding.
4. She opens ConflictPanel and chooses a checked move/reassignment rather than treating a suggestion as a write.
5. **Climax:** confirmed bookings and conflict outcomes update the shared schedule; booking reminders and change notifications follow the existing E13/E15 producer contracts, not a client-simulated event.
6. She previews recurring service dates/exceptions before committing; her personal feed uses E15's create/rotate/revoke flow and privacy warning.

Failure: stale conflict/recurrence facts require re-evaluation; denial and request failure retain suitable editor input. Five views and feed remain E15 branch-dependent, not delivered by this contract.

### B3 — A job runs from acceptance to completion.

1. A manually accepted quote creates the existing job; its quote version and provenance stay intact.
2. Sara makes the audited one-way Projekt upgrade, adds members/Arbetsledare and work orders through E16.
3. E17 later supplies accepted-quote budget versus real material/time economy for entitled roles.
4. E18's completion dialog lists only active downstream effects before commit.
5. **Climax:** confirmed once-only completion appears in AuditTrail and field tabs become read-only with notice; warranty/DoU effects occur only for active consumers.

Failure: explicit rejection or a confirmed pre-commit failure leaves the job incomplete. An unconfirmed response requires reconciliation of authoritative status before retry; a timeout does not prove that no commit occurred. E17 economy and E18 completion are blocked until deepened; existing `done` status is not evidence of the completion-event contract.

### B4 — Säljare Johan works the pipeline.

1. Johan opens an existing quote/follow-up from authorized navigation; only delivered widgets are present.
2. He follows existing review, current PDF and send checks; customer-facing acceptance remains manually recorded internally. On a sent version he uses `Planera uppföljning` with date/note; its due/overdue reminder follows the existing producer contract.
3. When a customer declines, he records the existing loss outcome/reason. The follow-up sheet retains `Klarmarkera` with outcome note and offers planning the next follow-up, or entering the existing loss/new-version paths (Phase B UX §4.1).
4. **Climax:** append-only lifecycle status and live pipeline update while the sent snapshot/PDF remain unchanged.

Failure: expired review, changed content or stale PDF blocks send with its existing refresh action. No public quote acceptance is introduced. E19.2 follow-up widget is future, so the flow must retain an available record-level entry.

### B5 — An operator provisions a second company.

1. The allow-listed operator uses the existing separate wizard and strict eligible-company input.
2. They review its write-nothing preview and explicitly approve the exact server-bound request.
3. Existing reconciliation exposes tenant/state/attempt/next action; uncertain provider outcome never becomes an automatic retry.
4. The invited Företagsadmin activates membership and completes onboarding settings, tax/terms/work roles and invitations.
5. **Climax:** existing exact readiness and onboarding checks confirm a working company.

Failure: preserve current validation, bounded explicit recovery and generic access denial. This visual adaptation changes no provisioning policy, tokens or authorization. The source uses the operator role without a personal name; that source-faithful protagonist is adequate.

### B6 — Ekonomi Anna produces money-out.

The inherited term “money-out” means preparing and exporting billing bases here; it does not mean executing payments.

1. In future E26, Anna selects customer/period and reviews candidates from jobs/time/material/rentals/service.
2. She excludes or adjusts with the existing planned audited-reason contract.
3. She reviews LockConfirmDialog before an immutable lock.
4. In E33/E34, after their gates, she exports customers, articles and invoice bases to Fortnox and inspects per-record outcomes.
5. **Climax:** an authoritative locked basis and confirmed export status make the result reviewable without re-entry.

Failure: failed/unknown export follows its eventual idempotent explicit recovery contract. Real-invoicing qualification remains separate. Candidate inclusion, lock/correction and Fortnox ADR details are blocked future contracts; this flow does not settle them.

### B7 — Service keeps itself honest.

1. The future authenticated service scan produces due suggestions and notifications.
2. A Projektledare reviews a suggestion and converts it to a job.
3. Separately, the approved future public asset-QR fault flow feeds the authorized service workflow.
4. **Climax:** confirmed suggestion-to-job provenance links the reported problem to assigned work.

Failure: no duplicate conversion, public-token detail or abuse policy is invented here; E22/E23 must supply current commands and validation. The source identifies a service workflow and Projektledare rather than a personal name; retain those protagonists without inventing one.

### Supporting inherited journeys — Företagsadmin and record work

1. Företagsadmin opens Users & roles, invites a Montör and sees authoritative invitation status.
2. EffectivePermissions explains current server-granted access; onboarding retains its current checklist.
3. **Climax:** confirmed membership activation admits the Montör to the real role landing; no additional permission is implied by the explanation.

Failure: failed invitation has explicit current recovery, not fake sent state. Customer/facility/contact editing, calculations, source-authorized Documents search/preview/archive and settings remain their existing Phase A/E20 flows, reached from the IA table. Preserve their approved ACs rather than replacing them with a generic form shell. The five frozen Phase A journeys are extracted by exact source heading in the crosswalk; inherited behavior remains there rather than being duplicated here. Historical oracle access is superseded by the 2026-10-15 owner prohibition, as explicitly recorded in that mapping.

## Build gates and Pass 1 coverage

E17/E18 detail gates and all later module contracts are enumerated in the crosswalk. Missing severity/report/template/content/billing choices are blocked work, never permission to browse legacy URLs or invent policy. Headless domain/state/validation/action seams remain separate from replaceable flow composition.

Author Pass 1: required section shape and all shared component names are covered; all exported top-level/field IDs and five frozen Phase A journeys are mapped; state families and five scheduling views are explicit. B5/B7 retain source-role protagonists without invented personal names. The selected independent [source/contract review](validation-report.md) checked the pair and confirmed corrections to all three initial coverage findings. Future per-action contracts, rendered references and viewport/browser evidence remain outstanding. This remains accepted direction for course correction, not a full-readiness verdict.
