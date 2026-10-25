# Epic 15 Context: Scheduling Views, Time Reporting, and Calendar Feeds

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver connected scheduling and field time reporting: planners use five consistent projections of bookings, manage recurring assignments and resolve conflicts explicitly; individuals see their day, report time and subscribe to a minimal personal calendar. Booking and time relationships support later economy and billing without re-entry.

## Stories

- Story 15.1: The Five Scheduling Views
- Story 15.2: Recurring Bookings — Series, Materialized Occurrences, Exceptions
- Story 15.3: Conflict Resolver
- Story 15.4: Time Reporting — Filing, Timesheet, Review
- Story 15.5: Personal Calendar Feed (ADR-B004 Surface #1)
- Story 15.6: Min Dag — the Field Landing

## Requirements & Constraints

- Deliver only approved Phase B scope, with live surfaces governed by the scope manifest. Automatic optimization, AI, native mobile, customer portal, PWA installation, durable offline reads/writes, queues and synchronization remain excluded.
- Use one booking/filter model across views. Preserve existing validated own-person access, authorized review and tenant boundaries. Never expose money in field or personal-feed payloads; hiding values in presentation is insufficient.
- Connected field flows work at 360×640. Suitable unsent form state survives transient request failures, remains explicitly unsent and offers retry. Show success only after server-confirmed persistence. Unreachable reads say `Anslutning krävs`; no stale/offline job-list substitution. Empty booking states require successful connected reads.
- Capacity comes from actual weekly schedules, central holidays, tenant adjustments, individual exceptions, bookings, absence, blocked time and optional buffer, never employment percentage or globally assumed working hours. Overtime needs an explicit authorized decision; overbooking warns. Conflict detection must handle multi-assignee overlaps, recurrence and both Stockholm DST boundary weeks without missed or phantom conflicts.
- Development completion requires applicable static/build checks, focused integrity tests, the required executed integration/RLS lane, independent review and essential browser smoke. Exhaustive browser matrices, screenshots, manual accessibility/daylight/exploratory validation and polish remain tracked release work. Deferred or skipped checks are not passes; development completion does not establish release readiness or deployment authorization.

## Technical Decisions

- Retain the resource/booking foundation and one deterministic pure conflict engine for previews and authoritative transaction checks. Conflict workflow state is distinct from derived detection. Acceptance reviews the current candidate warning set, requires a nonblank reason and explicitly selects candidate-related logical conflicts; unselected conflicts remain open. Booking changes, selected acceptance and audit commit atomically; stale facts require renewed review.
- Resolution re-runs detection and records outcome, actor and timestamp; affected assignees receive `booking.changed`. Free-slot suggestions are convenience projections, never write authority. Accepted identity follows the logical natural key; changed collisions reopen detection.
- Recurrence has bounded rules and real materialized booking occurrences. One pure expansion serves preview and writes. Edited exceptions survive series updates, cancellation leaves tombstones, and future splits preserve earlier exceptions and stable unchanged occurrence IDs. Series commands deduplicate at series level.
- Store instants in UTC; interpret local dates, recurrence, schedules and capacity in tenant timezone, default Europe/Stockholm. Spring nonexistent times move to the first valid instant; autumn ambiguous times select the earlier instant.
- Time reports remain own-row filing with authorized review, duration and optional booking/job links. B1b ships `submitted` only, with review/annotation rather than approval transitions. Valuation belongs to economy projections, never report rows.
- Calendar capabilities are hashed 256-bit random tokens with audited self-service creation/rotation/revocation and atomic replacement. Feeds regenerate minimal own-booking iCalendar from live data; invalid tokens have uniform generic responses. DB-backed token/IP-hash limits and isolated public shell remain required. The full ADR-B004 abuse suite is a shipping gate.

## UX & Interaction Patterns

- Approved 2026-10-23 canonical `DESIGN.md` and `EXPERIENCE.md`, with the incorporated detailed Phase B UX annex, govern visual/shared experience. Written amendments win; prototype styling is legacy and flows grant no new scope. Use the existing design system, accessibility conventions, plain wordmark and purposeful neutral placeholders. Separate domain/state/validation/actions from replaceable presentation and flow composition; keep abstractions proportional.
- Do not browse or cite legacy applications as new evidence. Missing routine design details use maintainable owner-authorized defaults with rationale. Two known missing linked design-package documents do not invalidate the available canonical sources or authorize recursive foreign copying.
- `Planering` provides keyboard-reachable Schema, Resurser, Team, Beläggning and Min kalender with shared date/filter semantics, per-user per-view persistence and a conflict-count chip. Schema offers time grids/month density; Resurser shows person timelines and reassignment needs. Team groups booking cards by displayed booking work role, including a labelled no-work-role group; person default roles are context, never named-team identity. Capacity uses numbers plus color. Drag requires keyboard/dialog equivalents.
- Personal calendar is phone agenda/desktop week grid. Editor is desktop side sheet/phone full-screen sheet. Recurrence previews approximately ten occurrences with conflicts and visible exceptions; resolver presents grouped queue, plain violations and collision timelines.
- Min dag is content-first: date/week navigation, time-ordered booking cards, map-linked address, job and prefilled time actions, prominent schedule-change banners and pull-to-refresh. Distinguish no bookings from no assigned jobs. No dashboard widgets or money.

## Cross-Story Dependencies

- Epic 14 provides booking, schedules, detector and editor authority. Its October 8 retrospective is accepted with open items; the October 7 rejection remains historical. QA triages the 48 advisories with actual resolution evidence; Product/Architect approve performance volumes/targets before performance or hosted claims. Manual release obligations remain unexecuted/deferred.
- Contract D's transferred Schema/Resurser click/drag interval/person and keyboard/dialog obligation is already integrated and qualified in 15.1. Preserve it; reopen only for demonstrated regression.
- Epic 13 supplies booking-change notifications and time-nudge producers. Min dag completes Montör landing activation. Mina jobb contributes nothing before Epic 16 activation; when active it uses assigned/member jobs and the existing job workspace. This is a one-directional seam, not a prerequisite on Epic 16 or Story 10.7.
- Epic 17 consumes hours for economy; Epic 26 consumes them for billing basis. Preserve reusable relationships without adding valuation to reports.

Provenance: refreshed 2026-10-25 from `epics-phase-b.md`, `prd-phase-b.md`, `architecture-phase-b.md`, `product-brief-phase-b.md`, `ux-design-specification-phase-b.md`, canonical `ux-designs/ux-Kopplas-2026-10-23/DESIGN.md` and `EXPERIENCE.md`, current supplied owner instructions and development-completion policy. This is planning context, not new runtime, legacy or release verification evidence.
