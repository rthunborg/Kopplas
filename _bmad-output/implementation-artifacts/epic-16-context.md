# Epic 16 Context: Jobs Core

Preparation draft, 2026-10-15. This distilled context and its story draft are not an approved implementation contract. Preserve the separate acceptance-transfer matrix and readiness evidence; final independent pinned-spec admission remains outstanding.

## Goal

Deepen the existing job container into a tenant-safe operational workspace: personal assigned jobs, membership and per-job leadership, constituent work orders, one-way project upgrade and connected field access. Preserve accepted-quote provenance, standalone creation and all existing booking identities.

## Stories

- Story 16.1: Jobs Depth Activation — Container Evolution and My-Jobs
- Story 16.2: Job Members and Per-Job Roles (Arbetsledare)
- Story 16.3: Arbetsorder
- Story 16.4: Projekt Upgrade and Job-Card Semantics
- Story 16.5: Job Workspace Shell

## Requirements & Constraints

This is Phase B legacy parity. Jobs is already active: deepen and enroll its additional tables/surfaces in the same PR, retaining Phase A provenance. Do not create another jobs-depth module or a projects table. Live surfaces require manifest and permission traceability; new tenant tables need direct tenant IDs, composite same-tenant references, ENABLE/FORCE RLS, exact grants/policies, H4 fixtures and per-role negative evidence.

Use one jobs row with type order/projekt, defaulting old/new jobs to order. Kind is separate from lifecycle status. An upgrade keeps the same ID and changes one row atomically with lifecycle/audit; downgrade is rejected in SQL. Members and work orders are valid under either type. Project-only fields/children require database validity constraints; do not invent unnamed project-only fields to fill a sketch.

A user's My Jobs is the union of actual job membership and actual booking assignment, not tenant membership. Roles combine by union while row scope still applies. Arbetsledare is a per-job designation, never a tenant role or a grant over other jobs. Its default economic visibility equals Montor's: protected monetary values are absent from server payloads, not masked or sent as null/zero. Budgets belong to economy projections, never jobs columns.

Both existing creation paths retain their APIs and invariants. Acceptance creates one job per acceptance atomically, returns the same IDs on replay and preserves immutable commitment/source references. Standalone jobs retain nullable source references; no later quote-linking mechanism is introduced. Existing rows/calls must remain valid when facility/contact inputs are tightened for new enriched workflows.

## Technical Decisions

The selected preparation direction puts only membership schema/read foundation into 16.1. Membership/designation writes, the writable responsible-Arbetsledare picker and operational elevation stay in 16.2. Their acceptance is explicitly transferred, never credited to a structural foundation alone. Work-order relationships/warnings stay in 16.3. Upgrade/completed card semantics stay in 16.4. Final epic acceptance requires every transferred obligation and its actual destination evidence.

Scheduling inputs include estimated duration, earliest start, desired/latest end, priority, crew size, existing work-role requirements, structured location, travel, responsible project manager, customer presence, dependencies and access windows. Dependencies/windows are relational child rows; no JSON substitute or parallel competence/person catalogue. Responsible Arbetsledare resolves from membership. Phase B stores/displays dependencies and warns on violations; no automatic optimization or invented dependency-engine capability.

Required roles/windows must be real authoritative job-bound detection inputs: checked SQL snapshots, complete canonical facts, version/digest binding and commit-time current-facts verification. Missing facts differ from an explicitly known empty set. Mixed-job bookings must use their own job's inputs, never a tenant-global set. Existing acceptance, replay, selective conflict review and stale-proof behavior remain intact.

## UX & Interaction Patterns

My Jobs supports a connected 360x640 field experience with honest connected/loading/error/retry/empty states. Suitable unsent form input survives transient failures and success requires server-confirmed persistence. No stale/offline job list, service worker, offline queue or replay infrastructure is added.

Create/edit uses progressive disclosure: identity first, scheduling detail second, repeatable relational rows. Current owner direction prohibits using legacy URLs as evidence. Missing UX rules use maintainable headless defaults with no claimed legacy observations; the story draft names the priority/location/window choices and independent review boundary. Jobb is the container; Projekt is its type badge/upgrade rather than another nav entity.

The workspace is keyed by one container ID. Header, tabs and actions derive from granted capabilities and actual module depth. No future placeholder tabs; no money for an unentitled worker. Files remain in the shared file/link model. Accessible keyboard/focus/error behavior and reachable field actions apply.

## Cross-Story Dependencies

Keep stories sequential 16.1 through 16.5. Foundation relocation removes a backwards dependency on 16.2 while preserving its full final obligations. A job-to-job dependency foundation does not prove later work-order references or warnings. The acceptance-transfer matrix names every destination and the epic gate rejects missing evidence.

Existing membership/permission, file and booking foundations are actual prerequisites. No whole-E15 prerequisite follows from numbering: bookings already bind stable job IDs. E15 owns scheduling/time views/readers/calendar/Min dag/E2E and its diagnostic/CI work. Integrate only explicitly allocated shared job-fact seams; E15 can consume a My Jobs contract without an E16 edit to its routes. Time links remain stable, submitted-only and unvalued; economy valuation is later work.

Keep independent review and required local unit/integration/RLS/browser and empty-database migration/seed CI evidence. Skipped acceptance bodies confer no credit. Isolate guarded E16 database/server/browser resources and fixtures from E15; no deployment or hosted fallback. Root/coordinator own aggregate state, integration and the single final PR/merge. Phase C exclusions include AI, public customer acceptance, native mobile and offline/PWA capability.

## Owner decision amendment — 2026-10-15

The later direct owner instruction cancels all prospective oracle work. Separate domain/state/validation/actions/semantic view models from replaceable usable UI. Choose best-practice defaults autonomously for missing design rules; never infer new product/security/economy scope. Priority low/normal/high/urgent (default normal), facility-derived or structured override location, and explicit absolute access windows/unknown-versus-empty are current draft decisions, not legacy observations. Existing creation calls/rows remain compatible. Unnamed project-only fields stay an explicit16.4 product decision. This amendment supersedes any earlier oracle task in this preparation without rewriting committed history.
