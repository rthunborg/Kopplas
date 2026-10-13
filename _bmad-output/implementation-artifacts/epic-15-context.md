# Epic 15 Context: Scheduling Views, Time Reporting, and Calendar Feeds

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver trustworthy scheduling and connected field time reporting: planners see the same bookings through five useful views, manage recurring assignments and resolve conflicts explicitly; individuals see their own day, report time, and subscribe to a minimal personal calendar feed. Booking and time data must support later economy and billing without re-entry.

## Stories

- Story 15.1: The Five Scheduling Views
- Story 15.2: Recurring Bookings — Series, Materialized Occurrences, Exceptions
- Story 15.3: Conflict Resolver
- Story 15.4: Time Reporting — Filing, Timesheet, Review
- Story 15.5: Personal Calendar Feed (ADR-B004 Surface #1)
- Story 15.6: Min Dag — the Field Landing

## Requirements & Constraints

- Stay within approved Phase B operational scope. Scheduling surfaces, tenant tables, notification categories and the calendar-feed public surface activate through the scope manifest in the same PR as their first live implementation. Automatic scheduling optimisation, native mobile, PWA/offline queues and synchronization remain outside this delivery.
- All five views must render live data through one booking/filter model. Scheduling actions are permission-scoped; individuals receive their own bookings and reports, while authorized roles review team/job time. Server authorization and tenant isolation must enforce these boundaries independently of the UI.
- Conflict detection must be deterministic and covered for multi-assignee overlaps, capacity/work-hours edges, recurrence and both Europe/Stockholm DST transition weeks. Missed and phantom conflicts are correctness defects.
- Capacity derives from actual weekly schedules, never employment percentage or globally assumed weekdays/hours. Subtract holidays/closed days, absence, existing bookings, blocked internal time and optional planning buffer. Apply central Swedish holidays, tenant calendar adjustments and individual exceptions. Overtime requires an explicit authorized decision; overbooking always warns.
- Connected field flows work at 360×640. Preserve suitable unsent input after transient failure, explain that submission has not occurred, and offer explicit retry. Only server-confirmed persistence permits success. Unreachable data displays `Anslutning krävs`; an empty booking state requires a successful connected read. Do not substitute stale/offline job lists.
- Calendar-feed release requires the complete public-token abuse suite to pass, including rotation/revocation, uniform invalid responses, rate limits, cross-tenant probes and public-shell isolation. Feed and field payloads contain no money; personal feeds expose no other person's data.

## Technical Decisions

- Reuse the resource/booking foundation and one pure conflict engine for preview and authoritative server transaction checks. Persist conflict workflow states separately from derived detection. Acceptance requires current candidate-warning review, a nonblank reason and explicit selection of candidate-related logical conflicts; unselected reviewed conflicts remain open. Booking changes, selected acceptance and audit commit atomically. Stale facts require renewed review.
- Resolver edits re-run detection and record outcome, actor and timestamp; affected assignees receive `booking.changed`. Suggested free slots are a convenience projection, never write authority. Accepted state survives only when the conflict natural key still matches; changed collisions reopen detection.
- Recurrence uses bounded series rules and real materialized booking occurrences. One pure expansion function serves preview and server writes. Edited exceptions survive series edits; cancelled occurrences remain tombstones. Splitting at “this and future” preserves earlier exceptions and stable occurrence IDs where times do not change. Series commands require series-level deduplication.
- Store instants as UTC `timestamptz`; interpret recurrence, work hours, capacity and all-day boundaries in tenant timezone, default Europe/Stockholm. Expand local calendar dates before UTC conversion. Nonexistent spring times move to the first valid instant; ambiguous autumn times choose the earlier instant. Keep capacity rules as configuration and data.
- Time reports carry duration, optional booking/job links and notes, with own-row filing and authorized review scope. B1b status is `submitted` only; review/annotation does not introduce approval states. Any approval requirement is decided at the B1b-to-B2 checkpoint. Monetary valuation belongs to economy read-models, never report rows.
- Feed tokens are server-generated 256-bit random capabilities stored as SHA-256 hashes. Authenticated self-service create/rotate/revoke is audited; rotation issues the replacement and revokes the old token atomically. Generate iCalendar from live own bookings per request, update last-used visibility, and enforce DB-backed per-token/per-IP-hash rate limits. Public routes use an isolated minimal layout without authenticated shell, tenant-context, session or navigation dependencies.

## UX & Interaction Patterns

- `Planering` offers keyboard-reachable `Schema`, `Resurser`, `Team`, `Beläggning` and `Min kalender` views with shared date navigation, relevant day/week/month controls, person/work-role/job/customer filters, creation action and conflict-count chip. Persist filter and period preferences per user per view.
- Schema uses day/week time blocks and month density; Resurser uses person rows with capacity hints and a needs-reassignment lane. Team is a weekly day-column board grouped by displayed booking arbetsroll, with a clearly labelled no-work-role group. Person default roles are resource context. No named-team entity, membership model, administration or further Lovable observation prerequisite applies; this direction makes no new verified legacy-parity claim.
- Capacity cells show numbers plus color and link overruns to affected bookings. Personal calendar is phone-first agenda with desktop week grid. Drag interactions require keyboard/dialog equivalents. The booking editor is a desktop side sheet and phone full-screen sheet.
- Recurrence offers daily, selected-weekday weekly, biweekly and monthly presets with a mandatory end condition and approximately ten preview occurrences with conflict indicators. Show exceptions clearly.
- Conflict resolution uses person/date-grouped master-detail, plain-language violations and collision timelines; move, reassign, adjust or accept with reason. Accepted conflicts leave the default queue but remain inspectable. Show sibling-series fixes and last-checked recency.
- Time filing is a prefilled, one-hand flow targeting thirty seconds, also available standalone. Personal weekly reports show missing-day nudges; desktop review offers person/job/week filters, totals and booked-versus-reported deltas. Min dag shows ordered booking cards, map-linked addresses, job/time actions, schedule-change banners and pull-to-refresh.

## Cross-Story Dependencies

- Epic 14 supplies resource schedules, bookings, conflict authority and the shared editor. The transferred empty-slot creation obligation belongs to Story 15.1: actual Schema/Resurser browser click and drag must open that editor with interval/person context before those entry points are exposed or the story completes. Prefill-seam tests alone do not satisfy this gate.
- Epic 13 supplies notification infrastructure and producer registration for booking changes and time-report nudges.
- Min dag activates the Montör landing redirect without a technical dependency on Story 10.7. Its Mina jobb section contributes nothing until Epic 16 activates; jobs are a one-directional seam, not an Epic 15 prerequisite.
- Epic 17 consumes reported hours for economy; Epic 26 consumes them for billing basis. Preserve reusable booking/job relationships and keep valuation outside time reports.