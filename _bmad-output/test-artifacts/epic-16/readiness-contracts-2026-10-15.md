# Epic 16 readiness and contract-review packet — 2026-10-15

Status: preparation evidence only; contract alternatives UNAPPROVED; NOT a finalized or accepted specification; NOT Ready for Development.

Author route supplied by root: readiness/specification-author/critical, gpt-6.1-sol High, Codex subagent. Sensitive reasons: job authorization, per-job roles, acceptance RPC compatibility and transactional integrity. Independent contract review remains separate; this author has not approved its own proposals.

## Admission and provenance

- Assigned worktree: `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas`.
- Assigned branch: `codex/epic-16-jobs`.
- Original inspected base: `8cda24614e77eda33ea31fe4de61af3a19d4759d`; original inspection found a clean worktree.
- E1 checkpoint reported by root and observed at HEAD before this evidence write: `0586972a`.
- Scope for this authoring follow-up: this file only. No product/shared/spec/context/workflow changes, rendering, database access, runtime launch, commit or push.
- Concurrent E15 work is excluded by its actual write scope. This evidence does not allocate any product path or relocate a story obligation.

### E0 tooling hold — RESOLVED

Root reported coordinator independent Sol High PASS and admitted the exact installed-generator path synchronization, without workflow upgrade. The current generated file SHA256 was independently read as `A3E986D054DF57D602EA5281EB0499F9E7D30121474798830E5B518B7A17FA45`:

`C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad/custom/bmad-build-auto.toml`

Freshness receipt:

`C:/Users/Rasmus/AppData/Local/Temp/kopplas-epic16-build-auto-custom-fresh-20261015.json`

Receipt SHA256 independently verified: `FCF0EF1A8BDA4FC784FC4A4F4E9DD3EBDB108C07E3CA3CC1331B09B7C5D03970`.

Receipt reads `status=fresh`, `needs_apply=false`, `toml_valid=true`, with empty warnings/errors. Root supplied native exit 0 for the actual `--check`; this author read the receipt and hashes, and did not execute or recreate that check. The earlier stale-generated-config blocker is no longer outstanding.

## Governing requirements and source references

All line references below were inspected at the assigned base; absolute paths identify the source checkout. These are repository observations, not executed product acceptance evidence.

| Source | Binding fact |
| --- | --- |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/AGENTS.md` | Approved story/ADR-backed implementation, manifest scope, Phase C exclusions, High for sensitive work, independent review, concurrent ownership and server-confirmed field persistence apply. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/agent-model-routing.md` | Actual authorization/transaction work requires Sol High; no effort permission checkpoint is introduced. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/epics-phase-b.md:1581` | 16.1 title; complete AC sketch is line 1583. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/epics-phase-b.md:1585` | 16.2 title; complete AC sketch is line 1587. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/epics-phase-b.md:1589` | 16.3 owns work orders. 16.4/16.5 begin at 1593/1597. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/architecture-phase-b.md:403` | ADR-B006 is embedded here, not a separate decision file. Recorded decision: Option A model, Option C technique; its old gate is lifted. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/architecture-phase-b.md:438` | Additive extension of existing jobs; stable IDs, immutable source references, default order type, SQL conditional validity, job_members/work_orders valid for both types, one-way audited upgrade. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/architecture-phase-b.md:467` | Full job-card field set/storage dispositions; responsible Arbetsledare resolves from job_members, dependencies/access windows use child rows, budget comes from economy projection. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/architecture-phase-b.md:105` | Arbetsledare is per-job, never a tenant role; assignment itself grants no money visibility. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/prd-phase-b.md:369` | FR93–99: member/assignee My Jobs, standalone and accepted-quote paths, per-job roles, work orders, upgrade, customer/facility/contact and complete card fields. |
| `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/epics-phase-b.md:1865` | E16 has its own pre-first-story oracle terminology requirement. No waiver was inherited. |

16.1 specifically promises: typed container with orthogonal lifecycle; nullable project-only fields constrained by SQL; manifest/security enrollment and per-role negatives; My Jobs by membership/assignment; standalone create/connect with the full 8.4 field set and progressive disclosure; relational repeatable dependencies/access windows; economy-projected budget; regression proofs for BOTH existing creation paths and existing bookings.

Every 16.2 obligation must remain accounted for: person membership; per-job operational role including Arbetsledare; composite same-tenant FKs; workspace assignment rather than the tenant Roller tab; per-job command enforcement; overview member list; role positive/negative pairs proving the authority exists only on the designated job. No alternative below deletes these obligations.

## Current authorization and read/write contracts

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/permission-matrix.ts:72`: Jobs.ViewAssigned and Jobs.AssignUsers have empty roles. Jobs.ViewAll/Create/Edit currently allow tenant_admin and projektledare.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/scope/manifest.ts:159`: jobs is already active with E7/Phase A provenance; line 165 requires Jobs.ViewAll for /jobs; line 166 lists jobs/job_events. E16 deepens this module and must not fabricate a pending-to-active transition.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/layout.tsx:1` calls RouteAccessBoundary for /jobs. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/app-shell/RouteAccessBoundary.tsx:1` uses canAccessPhaseARoute.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/phase-a-surface.ts:11` derives both navigation and route access from manifest capability. Its landing resolver at line 31 is also an E15 seam; do not edit it without allocation. Granting ViewAssigned alone cannot open /jobs.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/envelope.ts:95` maps job.create to Jobs.Create; line 96 maps job.update to Jobs.Edit.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/create-job.ts:37` calls create_job_with_audit; `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/jobs.ts:56` calls update_job_with_audit. Preserve closed input validation, resolved tenant/actor, ownership and atomic audit behavior.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20260907171252_role_aware_phase_a_policy_evolution.sql:173` establishes role-aware jobs/job_events/file policies. Its lines 1644/1654/1676 define current job authority helper/create/update RPCs. The helper checks auth.uid(), exact actor and tenant roles. Current mutation RPCs are checked SECURITY DEFINER. Historical comments naming INVOKER are not the final authority.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/quotes/accept-and-create-job.ts:1` documents the current atomic, actor-bound acceptance path: one acceptance/job, immutable source references, idempotent replay/concurrent result identity, atomic events/evidence/audit. Preserve its API and downstream authority; do not substitute the historical initial SQL body.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/read.ts:115` reads list; detail starts at 215. Acceptance columns at 195 and dependent query at 257 include money. Montor/Arbetsledare payloads require structurally absent protected values, not null/zero/CSS masking. Never broaden quote-table access just to reuse the old detail query.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/actions.ts:47` and 111 are existing update/create action callers. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/page.tsx:1` and `[jobId]/page.tsx` host existing job and booking UI.

Existing assignment is an actual relational path: bookings.job_id -> booking_assignees.person_profile_id -> person_profiles.membership_id -> tenant_memberships.user_id with matching tenant and active membership. See `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261006101609_bookings_and_assignees.sql:26` and lines 79–84. The existing historical Montor booking predicate should not be copied blindly for multi-role My Jobs; use current active membership/role contracts. Tenant membership alone never means membership of every job. No job_members/is_job_member implementation exists at the inspected base.

## Unapproved contract alternatives for independent High review

### A. Minimal membership foundation in 16.1

Move only the schema/read foundation required for full membership/assignment My Jobs into 16.1. Granting job read scope must not grant tenant-wide edit, member management or economic visibility. 16.2 retains checked member mutations, complete operational role behavior/Arbetsledare assignment, per-job authority checks, workspace controls, overview list and positive/negative pairs. Its schema/FK obligation is recorded as delivered prerequisite evidence, not silently removed from acceptance. This avoids a later-story runtime prerequisite, but relocates ownership and therefore needs explicit approval.

### B. Explicit incremental acceptance split

16.1 implements assignment-only My Jobs using existing bookings/person/membership structures. 16.2 adds the membership union to the same reader/predicate and verifies full FR93. Neither dynamic future-table lookup nor placeholder membership store is used. No elevation occurs in 16.1, and every 16.2 AC remains. This also avoids a runtime prerequisite, but requires an explicit acceptance split: assignment-only execution cannot count as proof of 16.1's full membership sketch.

Rejected shortcuts: all tenant memberships treated as job members; tenant-wide rows for ViewAssigned; shadow assignment storage; dynamic SQL probing a future table; or requiring 16.2 completion before sequential 16.1 can pass.

### Work-order dependencies and remaining field decisions

8.4 permits dependencies on jobs/work orders, while 16.3 owns work_orders. Options requiring explicit review: 16.1 job-to-job dependencies followed by work-order references in 16.3, or a narrowly relocated work-order foundation. Neither JSON nor unchecked polymorphic IDs satisfy the relational contract.

The sketches do not name concrete project-only scalar columns. Identify justified columns or approve a documented disposition before finalized acceptance; do not invent placeholders. Resolve priority enum via E16 oracle, structured location override/reference, date/window validation and new required facility/contact behavior without invalidating old creation calls/rows. Existing source refs remain immutable, including no connect-standalone-to-quote-later mechanism under ADR-B006. Responsible Arbetsledare remains a view of job_members.

## Initial Story 16.1 specification outline — NOT finalized

All final ACs must be Given/When/Then and observe the outermost requested surface. The following outline retains unresolved reviewed splits rather than pretending they are decisions:

1. Given pre-E16 jobs and both creation paths, when additive migration and new creation run, then IDs/source refs/bookings remain stable, existing/new rows default to order, type stays separate from status, and invalid kind/project-only state is rejected by SQL.
2. Given each seeded role and active membership, when direct/API/navigation My Jobs is read, then only the reviewed membership/assignment scope appears; unrelated, foreign, inactive and unauthorized targets remain inaccessible.
3. Given an unentitled acceptance-backed job reader, when detail/card loads, then protected money fields are absent from payloads and listed in the entitlement descriptor; entitled acceptance provenance stays correct.
4. Given valid related identity selections and scheduling detail, when progressive create/edit submits, then the reviewed 8.4 scalars/child sets persist atomically with lifecycle/audit; cross-customer or cross-tenant relationships, unknown/source/actor/tenant fields and invalid ranges fail safely.
5. Given a transient failure at 360x640, when the user retries, then suitable input remains explicitly unsent, retry is explicit and success appears only after server-confirmed persistence.
6. Given acceptance replay/concurrency and unchanged standalone create inputs, when invoked, then original result IDs, uniqueness, immutable linkage and atomic rollback/audit invariants remain correct.
7. Given existing job-linked bookings, when container fields or later type upgrade change, then bookings continue binding the same job ID and validated identities; no repoint/copy operation appears.
8. Given scope and governance checks, then no projects table, automatic scheduling optimization, offline queue, AI, portal acceptance or E17 economy implementation is reachable.

Task order: approved contract decisions and E16 oracle evidence; additive schema and security enrollment; checked write validation/transactions; scoped read projections; route/navigation and progressive form integration; role/direct-API/negative tests and both creation regressions; real browser persistence/failure tests; author-written Suggested Review Order with verified evidence. No task may use TBDs or claim an unexecuted verification.

## Prospective paths and migration ownership — UNALLOCATED

Preparation names proposed to root (no write admission for these is implied by this evidence):

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/epic-16-context.md`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/test-design-epic-16.md`

Prospective E16 product areas:

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/`
- Candidate new `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/job-access.ts`
- Candidate new `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/read-models/my-jobs.ts`
- Candidate new `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobCardForm.tsx`

Candidate tables: additive jobs fields; job_dependencies; job_access_windows; required work-role join rows if multiple requirements are offered; job_members according to the approved split; work_orders in its assigned story. Budget never becomes a jobs column.

Migration proposal: append-only story files under `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/` with E16-specific descriptive suffixes `_e16_16_1_*` through `_e16_16_5_*`. NO numeric timestamp range has been allocated. Coordinator must reserve a nonoverlapping range before CLI-generated migration creation. Do not edit historical migrations or guess a final filename. The proposal is a logical ownership range for stories 16.1–16.5, not a timestamp reservation.

Shared paths requiring explicit allocation:

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/scope/manifest.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/permission-matrix.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/phase-a-surface.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/envelope.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/tenant-table-inventory.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/authz/role-harness.ts`
- Shared exact-policy expectations, fixtures, file-owner validation and booking snapshot integration: exact additional files must be identified and allocated before mutation, not covered by an open-ended wildcard here.

Candidate E16-specific tests:

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/commands/job-card-validation.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/read-models/my-jobs.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/jobs-depth.rls.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/commands/jobs-depth.int.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/features/jobs/my-jobs.int.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/e2e/jobs/jobs-depth.e2e.spec.ts`

Retain/regress existing acceptance-to-job, create-job, update-job, source-of-truth and accepted-record-lock suites. Shared H4/role harness must be extended under allocation, never replaced by a parallel E16 inventory.

## E15 interfaces and dependencies

No whole-E15 prerequisite is inferred from epic numbering. Existing E14 bookings bind jobs.id and survive depth/upgrade; E15's time/bookings readers must continue using that same identity.

Important live boundary: `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/conflict-facts.ts:28` types jobInputs as null, line 51 rejects non-null facts and line 107 supplies null to the engine. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261006122441_booking_conflict_detection_integration.sql:75` emits canonical jobInputs=null. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/types.ts:28` and `conflicts.ts:101` already offer pure required-role/access-window inputs. Persisting job fields alone does not make authoritative detection consume them. Coordinate exact snapshot/digest/version/locking ownership with E15; do not relax the parser independently.

`C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/candidate-references.ts:1` checks job/customer/facility/contact coherence; authoritative SQL rechecks at commit. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/resources/bookings-read.ts:122` reads editor job options and must keep identity contracts stable.

E15 time reports are optional booking/job links, own-row-scoped, submitted-only, no money; architecture source: `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/architecture-phase-b.md:800`. No approval or valuation state is added by E16. E15 Min dag can consume E16 My Jobs later; the planning register at epics-phase-b.md:1848 explicitly identifies a one-directional seam, not a dependency.

E15 retains scheduling views/time/calendar/readers/E2E and the explicitly assigned diagnostic runner, owned-process C file, admission unit test and optional CI application job. No E16 edit of those files is proposed here. Coordinator alone owns aggregate sprint/integration/publication; one final PR, merge by coordinator only, no deployment.

## Isolated test-resource proposal — NOT launched

Use this worktree's `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/compose.test.yaml` through the guard with a distinct E16 Compose project and named data/storage volumes. Coordinator must allocate distinct high loopback API/DB/app ports. Do not assume default 55421/55422/3100 are available or adopt E15 resources.

The Compose Auth configuration embeds external API 55421 and app callbacks 3000/3100; isolated overrides must make actual external/API/callback origins coherent. Set only local SUPABASE_TEST_* endpoints for fixtures/tests, with matching public build-time endpoints for the dedicated production server. Use a separate E16 worktree build/.next, fixture output and dedicated guard-owned browser profile.

Start only when required using the actor's own latest structured trusted guard context. Save lifecycle resource IDs; Compose admission is not readiness. Inspect composeOperation/readiness, apply migrations by the supported SQL-only path to the verified owned local database, and never reset another worktree's database. Native Supabase lifecycle startup/reset/teardown is outside the adapter contract. No hosted/demo fallback.

Run meaningful unit/command/RLS/regression/browser checks with SUPABASE_TEST_REQUIRED=1 and retain honest native exit and executed/skipped/failed counts. Explicitly skipped bodies are not coverage. Production-mode Next is required; no next dev substitute. The E15-owned browser application diagnostic files are not editable by E16. Required browser evidence still needs a supported admitted runtime; this proposal is not proof of its availability.

When finished request Stop by lifecycle resource ID; retain files/volumes/profiles and do not poll shutdown as a completion gate. No managed runtime or database query was launched during this readiness work, so there is no resource ID or stop receipt to report.

## Outstanding dispositions and verification limits

E0 is resolved. Remaining readiness work is independent High membership/dependency contract disposition, concrete field/constraint decisions, E16-specific oracle terminology evidence, exact shared-path/migration/resource allocation and final full-spec authoring/review. These are not granted by the presence of this packet.

No product tests, migrations, browser acceptance, lint or typecheck ran for this document-only readiness authoring. Reading sources and checking hashes is the sole verification claimed here. Subsequent story specs must contain complete actionable tasks, Given/When/Then surface acceptance and author-maintained Suggested Review Order. Ordinary stories remain sequential; review rounds and final verification must retain actual outcomes.