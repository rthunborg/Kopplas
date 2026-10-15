---
title: 'Story 16.1: Jobs Depth Activation — Container Evolution and My-Jobs'
type: 'feature'
created: '2026-10-15'
status: 'draft'
baseline_revision: 'd6a310be4f55da0490669881737e88ce2eee8dda'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/epic-16-context.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/readiness-contracts-2026-10-15.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/project-context.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/review-order.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/agent-model-routing.md'
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** Existing jobs provide accepted-work/standalone records without personal membership/assignment access or complete scheduling-input depth. Workers need an authorized card without protected acceptance money, and booking checks need current job-specific requirements/windows.

**Approach:** Add typed container and minimal membership/read foundations to the active jobs module, My Jobs as actual membership UNION booking assignment, and authoritative job-bound booking facts. Preserve both creation APIs and stable identities. Explicit acceptance transfers retain member operations, work-order consumers and completed upgrade/card semantics in their sequential stories.

## Boundaries & Constraints

**Always:** Deepen/enroll already-active jobs; default type order, closed order/projekt set, lifecycle separate. Use tenant composites, forced RLS, hardened auth.uid()-bound row predicates, exact ACL/policy/H4/matrix enrollment and checked commands/RPCs. Navigation, direct URLs, direct API and server projections must agree. Protected money is structurally absent for unentitled roles. SQL snapshots, canonical versions/digests, per-evaluated-booking job identity and current-facts commit verification govern roles/windows. Missing versus known-empty stays distinct. Persist child/scalar/audit changes atomically and retain acceptance replay/source locks and original standalone inputs. Connected field success requires persistence at 360x640.

**Block If:** Material product semantics outside the explicit acceptance transfers or exact shared ownership remain unresolved at final planning; a proposal changes accepted source/proof/role authority or expands Phase B. Root/coordinator settle existing independent review/allocation; this draft cannot approve itself. Required High routing is already authorized.

**Never:** Add projects/jobs-depth modules, tenant-wide Arbetsledare, duplicate people/work-role catalogues, source connect-later, money on jobs, automatic optimization, client-authoritative facts, parser-only proof relaxation, invented dependency graph/capability, future-table SQL, JSON relationships, offline/PWA/AI/customer portal/public acceptance, E17 economy, E18 completion authority, E15 scheduling/time/calendar surfaces or hosted deployment. This draft admits no implementation.

## I/O & Edge-Case Matrix

| Scenario | Input/state | Required output | Failure posture |
| --- | --- | --- | --- |
| Old/new job | Existing row, acceptance RPC, original standalone input | Same IDs/source refs/history/bookings, type default order, old lifecycle | Invalid kind fails SQL; old valid calls do not gain mandatory inputs |
| My Jobs | Active real member, booking assignee, both or neither | Complete duplicate-free relationship union only | Generic denial/not-found; tenant membership alone grants no job |
| Worker detail | Assigned worker without economy entitlement | Operational card, protected values absent plus entitlement descriptor | No broader CRM/quote grants or null/zero masking |
| Enriched card | Coherent identity, bounded scalars and child sets | Atomic card/child/audit persistence | Reject inconsistent/foreign parents, unknown/source/actor/tenant fields and invalid ranges |
| Stale proof | Signed preview then job roles/windows/binding change | Recompute current canonical facts under serialization; stale fails and requires current review | No partial booking/assignment/conflict/outcome/audit |
| Mixed jobs | Bookings belonging to two distinct jobs plus unbound booking | Every evaluated booking consumes its own job facts; unbound unknown | No tenant-global/candidate-input bleed |
| Missing/empty | Unavailable facts, known-empty roles, known-empty windows | Unknown differs from known none; empty roles impose none; empty windows allow no interval | Do not coerce missing to compliance or erase explicit empty windows |
| Phone retry | Transient failure then explicit retry | Retained suitable input visibly unsent, reachable retry, durable saved result | No offline queue or optimistic saved claim |

</intent-contract>

## Code Map

Read-only observations at original base 8cda24614e77eda33ea31fe4de61af3a19d4759d; preparation HEAD d6a310be4f55da0490669881737e88ce2eee8dda. Source line references are existing anchors, not future implementation stops. The readiness companion retains the full inspected contract packet.

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/epics-phase-b.md:1583` — original 16.1;1587/1591/1595/1599 retain16.2–16.5. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/architecture-phase-b.md:438` and467 fix additive type/source/container/card storage;105/111 fix job-role/money rules. This refined story does not claim unchanged original 16.1 acceptance.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/scope/manifest.ts:159` — active jobs, route ViewAll at165, table set166. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/permission-matrix.ts:72` — ViewAssigned/AssignUsers empty. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/phase-a-surface.ts:11` derives nav and route; landing resolver31 is E15 shared scope.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/layout.tsx:1` and `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/app-shell/RouteAccessBoundary.tsx:1` — actual direct-route boundary. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/envelope.ts:95` maps existing create/update capabilities.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/create-job.ts:37`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/jobs.ts:56`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/validation.ts:1` — closed inputs/checked RPC callers. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20260907171252_role_aware_phase_a_policy_evolution.sql:173`,1644/1654/1676 — current role policies, actor assertion and checked SECURITY DEFINER atomic mutations; old INVOKER comments are superseded.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/quotes/accept-and-create-job.ts:1` — live atomic acceptance/replay; preserve latest wrapper/private-payload authority. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20260714095225_standalone_job_creation.sql:1` — nullable immutable sources, no connect-later.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/read.ts:115`,195/215/257 — list/detail and dependent acceptance money reads; worker projection must not indiscriminately run those quote queries. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/actions.ts:47`,111 — actual update/create actions.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261006101609_bookings_and_assignees.sql:26`,79 — stable job FK and booking-assignee->profile->membership chain; avoid broad caller-profile RLS assumptions.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/candidate-references.ts:1` — job/CRM relationship coherence. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/conflict-facts.ts:28`,51/107 currently requires jobInputs=null; `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/conflict-attestation.ts:6` engine version.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261006122441_booking_conflict_detection_integration.sql:49`,75 — complete canonical SQL facts currently emit null. `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261007120235_booking_editor_audited_override.sql:64` — checked snapshot/finalize/current-fact digest; retain later group-validation fixes.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/conflicts.ts:25` loops bookings with common input;101–105 consume requirements/windows. Select each evaluated booking's own job rather than the initiating candidate's set.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/tenant-table-inventory.ts:181` — exhaustive manifest-derived enrollment; `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/authz/role-harness.ts:25` currently maps jobs to ViewAll.

## Tasks & Acceptance

Proposed implementation allocations only. Keep every task open until actual evidence. No shared/product edit is authorized by this preparation.

**Execution in dependency order:**

- [ ] P0 — Resolve the Planning Gate, owner-authorized headless defaults, E2/test design and independent pinned-spec/shared-path admission in this spec, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/epic-16-context.md` and `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md`; retain original/refined acceptance distinctly.
- [ ] P1 — Generate append-only migration under `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/` for type/agreed scalar fields, minimal job_members read foundation, job_dependencies, job_access_windows and same-tenant required-work-role rows; add range/state/ACL/RLS/index constraints and checked atomic card write. No work_orders/upgrade/unnamed project columns. Coordinator reserves timestamp range before `supabase migration new e16_16_1_job_depth`; no range is allocated now.
- [ ] P2 — Add hardened member-or-booking-assignee parent scope in the migration and proposed `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/job-access.ts`. Bind auth.uid()/active tenant membership and real same-tenant job relationships; avoid recursive RLS and broad profile grants. Direct child reads use parent scope. Keep member writes/elevation unavailable; retain ViewAll authority.
- [ ] P3 — Update only allocated manifest/matrix/route files listed below. Proposal: ViewAssigned admin/PL/Montor, ViewAll admin/PL unchanged; actual /jobs route admits assigned access while reads retain separate row scope. Keep existing all-jobs list for ViewAll with explicit personal view; Montor personal only. AssignUsers remains closed until 16.2. No dependency capability is invented.
- [ ] P4 — Extend `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/validation.ts`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/create-job.ts`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/jobs.ts`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/jobs-audit-db.ts` and `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/index.ts` with bounded enriched card command/adapter, preserving old calls. Reject unknown/source/actor/tenant/money input; persist related rows/audit atomically with current identity/parent checks. No 16.2 designation writes.
- [ ] P5 — Create `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/read-models/my-jobs.ts`; extend `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/types.ts` and `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/read.ts` for safe operational projections. No acceptance money query for unentitled worker. If CRM RLS hides job labels, resolve only authorized job-bound display fields through checked narrow read, not general CRM/quote access. Do not let inherited file/booking denials blank the worker card.
- [ ] P6 — Update `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/actions.ts`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobList.tsx`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobDetailView.tsx`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobEditDialog.tsx`, proposed `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobCardForm.tsx`, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/page.tsx` and `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/[jobId]/page.tsx`. Implement real personal list/safe detail/progressive bounded form, child rows and accessible connected failure/retry. Omit transferred writable-Arbetsledare control; any display derives from membership.
- [ ] P7 — In precisely allocated booking paths and a forward E16 migration, connect complete job-bound SQL facts, sorted canonical bytes, version/proof binding and current-facts recheck under shared serialization. Overlay candidate job identity and choose each existing booking's own facts. Both preview and save use sole engine; job-input changes refresh persisted affected conflicts through real authoritative engine output. No stale persisted warnings or parser-only integration.
- [ ] P8 — Create `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/dependency-warnings.ts`; integrate into card read/form. Job-to-job linked known prerequisite end later than dependent start produces a warning. Missing dates are unknown, not compliance. This is a card warning owner, not a scheduling conflict type/graph capability. Work-order FK targets/consumers/warnings belong16.3.
- [ ] P9 — Add named tests below and exact allocated H4/role/policy metadata. Cover all I/O, real actor/role/tenant/direct API boundaries, unknown/empty, child insert/delete/update/rebinding staleness, mixed jobs, old engine claims, atomic rollback and original acceptance/standalone/booking contracts. Real browser save/reload/failure/direct URL required at 360x640.
- [ ] P10 — Run meaningful focused then cumulative required gates on isolated local resources; retain native counts/revisions and transfer evidence. Implementation author writes one final Suggested Review Order only after code/verification and refreshes after fixes. Root/coordinator own state/git/integration/final PR.

**Refined acceptance criteria:**

- **16.1-AC01, P0:** Given old jobs and both original creation callers, when additive migration/new creation run, then IDs/source refs/booking FKs/status stay valid, type defaults order and invalid kinds fail SQL; no project table/invented module. Unnamed project-only fields are explicitly transferred to 16.4 rather than counted complete.
- **16.1-AC02, P0:** Given active actual memberships and booking assignments on both types, when real My Jobs and direct server/API reads run, then the duplicate-free relationship union is complete and excludes unrelated/foreign/inactive actors; tenant membership alone grants no job.
- **16.1-AC03, P0:** Given every seeded role, multi-role and revoked/disabled actor, when menu, crafted direct URL, read RPC/table and commands run, then capability, row predicate and checked SQL agree; assigned read does not become ViewAll/elevation and protected values are absent throughout unentitled payloads.
- **16.1-AC04, P1:** Given coherent identity/agreed scheduling inputs, when actual progressive form creates/edits/reloads, then bounded scalars/roles/windows/dependencies/audit persist atomically; malformed/foreign/inconsistent parents and unknown/source/actor/tenant smuggling fail generically without partial rows. Old minimum-input create still succeeds.
- **16.1-AC05, P1:** Given a connected 360x640 user and transient save failure, when failure then explicit retry occur, then suitable input stays visibly unsent, retry stays reachable, saved state follows durable success and reload proves it.
- **16.1-AC06, P0:** Given two distinct job-input sets plus an unbound booking, when actual booking preview/save evaluate all bookings, then every evaluated booking uses its own authoritative set, correct warnings persist atomically, missing stays unknown and empty roles/windows retain distinct semantics.
- **16.1-AC07, P0:** Given signed detector/review snapshot, when job binding/roles/windows/relevant rows change before finalize, then current canonical facts/version reject stale/old/mismatched claims with no partial business/outcome/audit state and current warnings need renewed review; job-input writes cannot leave derived conflict rows silently stale.
- **16.1-AC08, P1:** Given job dependencies with known violated planned-date order, when actual card/date changes reload, then deterministic linked-job warning appears; missing dates are unknown and no optimizer/guessed engine graph/work-order target is exposed.
- **16.1-AC09, P0:** Given actual acceptance command, when fresh/replay/concurrent/faulted calls execute, then same result IDs, one-job uniqueness, frozen source linkage, events/evidence and atomic audit/rollback remain correct; direct source-ref mutation stays denied.
- **16.1-AC10, P0:** Given original standalone inputs and pre-existing connected bookings, when create/update/enriched fields run, then nullable immutable sources, stable IDs/coherent optional parents and existing booking replay/selective-review/current-authority/DST contracts stay intact; no E15 time/calendar change.
- **16.1-AC11, P1:** Given complete manifest/H4/exact-policy/role/security/Phase C gates, when inspecting final change, then all new tables/surfaces are jobs-enrolled with full negative metadata, no forbidden surface exists, and transfer rows remain open until destination evidence.
## Spec Change Log

- 2026-10-15: New preparation draft using governing sketches and inspected contracts. Coordinator selected independently reviewed Option A structural/read membership split and explicitly transferred writable responsible-Arbetsledare field to 16.2. Companion matrix records original/refined acceptance; roles/windows authoritative integration remains16.1. Keep both creation APIs, money absence and stable IDs. This is not completed formal Build Auto planning.

## Review Triage Log

No independent review of this draft has run. Earlier readiness-packet High PASS selects preparation direction only and is not approval of these new documents.

## Design Notes

### Owner-authorized headless defaults — current decision, 2026-10-15

The owner instructed: never reference or use a legacy URL as evidence; where design rules are missing, implement best-practice headlessly so design/flow can change easily. This supersedes every prospective oracle task/blocker in earlier preparation. No legacy URL/browser/oracle evidence is sought or claimed. The historical committed readiness packet is preserved as history, not current authorization. Domain state, validation, actions and semantic view models stay separate from usable replaceable UI; do not build a generic framework.

Concrete defaults below are author-selected design decisions under that authority, NOT observations of legacy behavior. Final sensitive independent review and product write admission remain required.

- Priority domain values: low, normal, high, urgent; normal default. Swedish presentation labels: Låg, Normal, Hög, Brådskande. Keep machine values/validation in one domain module and label/ordering presentation replaceable. This is manual ordering metadata, not an optimizer or new capability.
- Nullable positive estimated-duration minutes, nonnegative travel minutes and positive crew size; preserve integer minutes without monetary/rate information. Earliest/desired/latest are separate calendar dates. Reject earliest later than an explicitly supplied latest; desired is a soft target and a known miss is a warning, not an invented scheduling block. No new required date defaults.
- Location defaults to the linked facility address when available. Optional explicit override uses structured street/postal-code/city/country-code fields, never free-form coordinates or an external geocoding API. Override requires nonblank street/city and a valid country code; postal code is optional. Missing facility/address remains unknown rather than a fabricated place. Keep display/address-input components replaceable.
- Access windows are repeatable absolute half-open UTC ranges, entered/displayed in Europe/Stockholm using existing DST policy. No weekly recurrence model is invented. Normalize equivalent ranges deterministically and merge overlap/adjacency for engine evaluation without losing persisted audit meaning. SQL requires finite ends>starts. Optional unavailable is represented distinctly from recorded-empty: unavailable emits no compliance claim; explicitly empty allowed windows means no access interval is allowed. UI makes the restrictive empty state explicit before save; no default closes a site.
- Required work roles reuse work_roles via same-tenant children. Explicit recorded/unavailable markers distinguish unavailable from known-empty; known-empty roles impose no requirement. People competence remains the existing profile work-role facts; no E31 certification catalogue.
- Enriched identity flow requires a coherent facility and specific contact belonging to the chosen customer. Original createJob and acceptance APIs and old nullable rows remain valid without new inputs; requiring enriched completeness does not retroactively invalidate them. Customer/facility/contact relationships are checked under transaction locks. A retained old row can be read without forcing an edit/migration.
- Responsible PL resolves to an eligible current person with PL role. Responsible Arbetsledare remains a read of job_members and its writable picker is explicitly16.2, not a duplicate column.
- Unknown project-only scalar identities are a real product ambiguity: do not invent columns. The accepted preparation split assigns their concrete naming/disposition, conditional SQL validity and full-card integration to 16.4-AC03/TR08. No 16.1 acceptance is falsely credited for them.

Minimal job_members uses same-tenant person_profiles reference, composite job/person identity and archive-over-delete. The structural designation must support later 16.2 without granting16.1 operational rights. Avoid recursive RLS/broad profile reads; helpers bind auth.uid(), qualify refs, fix empty search_path and revoke unnecessary PUBLIC/anon/service_role execution. No tenant role or second responsible-Arbetsledare storage.
### Exact shared integration edit proposals — not allocations

| Exact path | Bounded proposed change |
| --- | --- |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/scope/manifest.ts | Active jobs table enrollment/assigned route requirement; preserve E7 provenance and E15 entries. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/permission-matrix.ts | ViewAssigned seed/sensitive contract; preserve AssignUsers closure until 16.2. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/phase-a-surface.ts | Assigned /jobs menu/route union if necessary; retain E15 landing behavior. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/envelope.ts | Only bounded enriched job command registration. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/conflict-facts.ts | Versioned complete job sets/booking bindings, per-evaluated-booking selection and absent/empty validation. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/conflict-attestation.ts | Engine/version binding coordinated with SQL; private compatibility domains/secrets retained. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/types.ts | Only pure per-booking job-fact shape; no E15 view model changes. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/capacity.ts | Only corresponding structured-fact validation; retain capacity arithmetic/config. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/conflicts.ts | Only correct per-evaluated-booking fact selection in sole detector; no duplicate engine/new dependency type. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/tenant-table-inventory.ts | Exact new child-table exhaustive negative metadata; retain fail-loud discovery. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/authz/role-harness.ts | Actual member/assignee/other-job fixtures and safe public projections. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/migration-reset.int.test.ts | Exact new ACL/policy/helper assertions. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/role-harness.atdd.int.test.ts | Actual per-role command/RLS agreement. |
| C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/authz/phase-a-surface.test.ts | Assigned direct/menu scope and retained all-job/landing expectations. |

Forward migration updates booking_detection_facts_internal, checked snapshot/finalize versions and current editor-review binding together, retaining all later group-validation fixes. Canonical sorted facts include relevant job role/window content and booking.jobId; child insertion/deletion must change digest. Candidate payload overlay binds job identity. Serialize job-input writes with existing tenant detection lock; recheck current roles/rows/facts after lock acquisition. Retain replay identity/current actor, candidate-selected logical groups, natural-key/association behavior, timestamp precision and private primitive ACLs. A job-input save must refresh affected derived conflicts through real signed sole-engine output; merely invalidating proofs while retaining wrong persisted warnings is incomplete. Use the explicit headless card-save transaction below; SQL verifies signed sole-engine results and never claims to execute TypeScript.

No fixture/seed/CI/config file is requested generically. Explain/allocate any additional exact path before mutation. E15 exclusively owns scheduling/time views/readers/calendar/Min dag/E2E, fixed-Chromium application runner, owned-process C, admission test and optional CI application job. No 16.1 E15-route write or whole-E15 prerequisite.

### Transfers and sequencing

Companion TR01–TR12 explicitly refine original 16.1.16.1 foundation never passes16.2 assignment/designation mutations, writable picker or operational elevation.16.3 owns work-order targets/consumers/warnings.16.4 owns one-way upgrade/completed card and concrete project-only fields.16.5 owns live workspace/Filer/tab/phone shape; actual completion action still requires E18 authority. Every transferred acceptance remains an epic gate with named destination evidence; no later story is needed to make refined 16.1 execute sequentially. Stable job/bookings/time links remain; submitted-only time has no monetary valuation. No new jobs-depth manifest module.

## Verification

Preparation executed only source inspection, documented renderer once native0, ten output hash/path-containment checks and document readback. No app tests, migrations, browser, lint/typecheck or product verification ran. E2 and phase3 clean-tree/formal planning gate remain unrun.

Proposed test files/check IDs, none executed or allocated:

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/commands/job-card-validation.test.ts` — I/O bounds/closed keys/canonical children/old valid callers.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/read-models/my-jobs.test.ts` — relationship union and protected field absence.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/features/jobs/dependency-warnings.test.ts` — known date violation/unknown without graph invention.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/bookings/job-facts.test.ts` — version/canonical parser/absent-empty/mixed-job selection.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/jobs-depth.rls.test.ts` —16.1-RLS-001/002 P0: real direct role/row/tenant/RPC/FK/primitive negatives.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/commands/jobs-depth.int.test.ts` —16.1-INT-001/002 P0: atomic enriched writes/child/audit and old standalone.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/commands/job-booking-facts.int.test.ts` —16.1-INT-003/004/005 P0: actual snapshots/finalize/current-fact races/mixed jobs/derived refresh.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/features/jobs/my-jobs.int.test.ts` —16.1-INT-006 P0: real membership/assignment/labels and absent money.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/e2e/jobs/jobs-depth.e2e.spec.ts` —16.1-E2E-001/002 P1: real assigned/direct URL/form save/reload/failure-retry360x640.

After admission: pnpm typecheck; pnpm lint; pnpm run test:unit; targeted pnpm exec vitest run against these files and existing acceptance-to-job/create-job/update-job/job-source-of-truth/accepted-lock/bookings/editor regressions. Required DB suites set SUPABASE_TEST_REQUIRED=1 and preserve native exit/executed/failed/skipped counts. Then required full integration, production build/containment, real Playwright and complete empty-DB migrations/seed/integration CI chain pass at final candidate. E2 will bind exact commands/inventory; this draft does not fabricate its output. No inherited skip/oracle waiver.

Use distinct guarded E16 Compose project, allocated high loopback API/DB/app ports, coherent Auth external/callback URLs, isolated named volumes/worktree .next/fixtures and guard-owned browser profile. Never assume default 55421/55422/3100 free or adopt E15/user resources. Apply SQL only to admitted owned local DB; no native Supabase lifecycle/reset teardown/hosted fallback. Save lifecycle IDs/readiness and request Stop when finished, preserving state. No runtime has been started by this author.

Implementation author writes exactly one final Suggested Review Order after actual code/evidence; no placeholder heading, guessed stops or fabricated tests here. Final independently reviewed pinned spec plus root E2/clean-tree admission is required before implementation.

## Headless card-save transaction contract

This concrete transport is a design proposal for sensitive review, not an executed feature. Use two envelope commands, job.card.create -> Jobs.Create and job.card.update -> Jobs.Edit, sharing a domain state/validation/semantic view-model module and a typed adapter. Do not change original createJob/updateJob or acceptance signatures. Candidate identity/command UUID is stable over an uncertain retry; client keys authorize nothing.

Checked snapshot_job_card and finalize_job_card RPCs are actor/tenant/correlation-bound with empty search_path and authenticated-only checked execution; private payload/audit/fact primitives stay non-callable. Snapshot takes the existing tenant detection serialization gate, checks current command authority/target/related rows, and returns complete canonical baseline facts plus the canonical proposed card and candidate identity. The server overlays the exact scalar/role/window changes onto those SQL-derived facts and invokes the existing sole engine per evaluated booking's own job. Domain-specific server proof binds operation, command/candidate/actor/tenant, canonical patch+child digest, baseline fact digest, engine/config versions, exact derived output and bounded validity. Use the existing length-prefixed HMAC mechanics with a separate job-card proof domain; secrets/proofs never become browser/audit data. No new public token surface.

Finalize reacquires the same tenant serialization gate and current actor/related-row authority, verifies domain/version/expiry/signature and recomputes complete current baseline facts. Changed baseline/relationship/membership returns stale without writes. Equal baseline permits one atomic card create/update + exact child replacement + refreshed affected derived conflict workflow + command outcome + lifecycle/audit. Preserve unrelated conflicts, current natural identities/selective accepted states and existing replay-current-authority rules; changed warning identities reopen rather than inherit acceptance. A failure anywhere rolls back business/child/conflict/outcome/audit together. No SQL-only placeholder engine, stale conflict rows or caller-supplied trusted result flag.

Prospective exact additional product files for this transport, all requiring allocation:

- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/job-card-domain.ts — stable values, validation/state and semantic view models, separate from UI.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/save-job-card.ts — the two command bodies and current-capability wiring.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/card-db.ts — checked snapshot/finalize typed adapter and stable error mapping.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/card-proof.ts — domain-bound server-only canonical signer/validation.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/card-facts.ts — SQL-fact overlay and sole-engine derivation; no second rule implementation.

Add these command files to taskP4/P7 only after exact allocation. Required tests add domain-state/semantic-DTO unit cases and real snapshot/finalize stale/missing/forged actor, wrong-domain/version, canonical child insertion/deletion, audit failure and concurrent booking/job-input races to the named card/job-booking suites. The browser control uses semantic actions/state, not embedded database policy or role names. This is a bounded domain design, not a reusable framework.

## Planning Gate

Status: preparation draft, NOT ready-for-development. Current owner decision removes all oracle/legacy URL work and its former blocker. Priority/location/windows/headless separation and enriched identity compatibility now have concrete defaults above. No legacy observation is claimed; no browser lookup is required for preparation. The old packet remains historical and no current step may reintroduce an oracle dependency.

Option A/refined transfers are confirmed for preparation. These newly authored specs/transaction/defaults still require independent sensitive pinned-spec review, E2 test-design binding, phase3 clean-tree admission and exact shared/migration/resource allocation before implementation. Named project-only fields remain 16.4/TR08; this is an explicit later-story product decision rather than a fabricated16.1 column. No E5b/phase3/Build Auto completion is claimed. Root owns aggregate state/git; coordinator alone integrates/merges the single final PR.

### Preparation decision chronology

- 2026-10-15: Earlier draft called for E16 oracle vocabulary. The later direct owner standing decision supersedes that direction, cancels the next oracle step and authorizes maintainable headless defaults. Active tasks/design/gate were updated accordingly; historical committed evidence is not rewritten. Preserve hard product/auth/money/transaction/Phase C boundaries and independent review.