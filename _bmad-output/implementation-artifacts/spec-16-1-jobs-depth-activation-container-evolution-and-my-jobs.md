---
title: 'Story 16.1: Jobs Depth Activation — Container Evolution and My-Jobs'
type: 'feature'
created: '2026-10-15'
status: 'in-progress'
baseline_revision: 'c47b26858d7898ab03c0680826e2be7489a2ae68'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/epic-16-context.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/readiness-contracts-2026-10-15.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/project-context.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/review-order.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/agent-model-routing.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/process/development-completion-policy.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/quality/ci.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/docs/recovery/epic-15-16/README.md'
  - 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/test-design-epic-16.md'
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

Current execution authority is the explicitly resumed, coordinator-allocated 2026-10-19 plan below. P1–P10 remain open until their actual evidence; this planning invocation writes only the admitted documents and two empty migration reservations. Earlier proposal/hold paragraphs are historical, not renewed ownership requirements.

**Execution in dependency order:**

- [x] P0 — Reconcile the Planning Gate with the explicit owner resume, accepted headless defaults/E2/pinned preparation and coordinator shared-path allocation in this spec, `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/epic-16-context.md` and `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md`; retain original/refined acceptance distinctly.
- [ ] P1 — Generate append-only migration under `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/` for type/agreed scalar fields, minimal job_members read foundation, job_dependencies, job_access_windows and same-tenant required-work-role rows; add range/state/ACL/RLS/index constraints and checked atomic card write. No work_orders/upgrade/unnamed project columns. Use the CLI-generated 20261019133151_e16_16_1_job_depth.sql reserved on this resume; it is empty, not implemented. The separately reserved 20261019133200_e16_16_1_job_booking_facts.sql owns the atomic authoritative integration below. Do not edit historical SQL.
- [ ] P2 — Add hardened member-or-booking-assignee parent scope in the migration and proposed `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/job-access.ts`. Bind auth.uid()/active tenant membership and real same-tenant job relationships; avoid recursive RLS and broad profile grants. Direct child reads use parent scope. Keep member writes/elevation unavailable; retain ViewAll authority.
- [ ] P3 — Update only allocated manifest/matrix/route files listed below. Allocated permission contract: ViewAssigned admin/PL/Montor, ViewAll admin/PL unchanged; actual /jobs route admits assigned access while reads retain separate row scope. Keep existing all-jobs list for ViewAll with explicit personal view; Montor personal only. AssignUsers remains closed until 16.2. No dependency capability is invented.
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

- 2026-10-19: Explicit owner resume and released exact ownership resolve the historical planning hold. Bind adopted completion policy, corrected My Jobs dependency, exact current inventory and CLI-generated empty migration pair; preserve intent/all11AC/TR01–TR16 and every historical failure. Planning-only; no product evidence or story done.

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
### Historical shared integration proposals — 2026-10-15; current allocation below

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

Companion TR01–TR16 explicitly refine original 16.1.16.1 foundation never passes16.2 assignment/designation mutations, writable picker or operational elevation.16.3 owns work-order targets/consumers/warnings.16.4 owns one-way upgrade/completed card and concrete project-only fields.16.5 owns live workspace/Filer/tab/phone shape; actual completion action still requires E18 authority. Every transferred acceptance remains an epic gate with named destination evidence; no later story is needed to make refined 16.1 execute sequentially. Stable job/bookings/time links remain; submitted-only time has no monetary valuation. No new jobs-depth manifest module.

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

## Historical Preparation Planning Gate

Status: preparation draft, NOT ready-for-development. Current owner decision removes all oracle/legacy URL work and its former blocker. Priority/location/windows/headless separation and enriched identity compatibility now have concrete defaults above. No legacy observation is claimed; no browser lookup is required for preparation. The old packet remains historical and no current step may reintroduce an oracle dependency.

Option A/refined transfers are confirmed for preparation. These newly authored specs/transaction/defaults still require independent sensitive pinned-spec review, E2 test-design binding, phase3 clean-tree admission and exact shared/migration/resource allocation before implementation. Named project-only fields remain 16.4/TR08; this is an explicit later-story product decision rather than a fabricated16.1 column. No E5b/phase3/Build Auto completion is claimed. Root owns aggregate state/git; coordinator alone integrates/merges the single final PR.

### Preparation decision chronology

- 2026-10-15: Earlier draft called for E16 oracle vocabulary. The later direct owner standing decision supersedes that direction, cancels the next oracle step and authorizes maintainable headless defaults. Active tasks/design/gate were updated accordingly; historical committed evidence is not rewritten. Preserve hard product/auth/money/transaction/Phase C boundaries and independent review.
## Narrow consumer-acceptance clarification — 2026-10-15

Independent High review at f610bcbd1fccda03cc8e0e312aa91652134c13d9 found one clarity gap: persisted/full-card fields were not explicit proof of all original architecture 8.4 scheduling consumers. This amendment preserves that review history and makes no new product decision. 16.1-AC04/P1/P4/P6 retain schema, domain validation and progressive form/readback for duration, crew, travel, earliest/desired/latest and customer presence.16.1-AC06/07/P7 retain current authoritative role/window consumer integration. Do not credit field persistence or the roles/windows proof as acceptance of the scalar consumers below.

Consistent with existing TR09 completed-card ownership, explicit destination 16.4-AC04 owns duration-derived default booking length through actual new-job booking entry;16.4-AC05 owns estimated duration/crew multiplier/planned travel consumption in demand/capacity;16.4-AC06 owns earliest-bounded suggestions, desired soft warnings and distinct latest breach flags;16.4-AC07 owns the actual booking-editor customer-presence constraint. Companion TR13–TR16 specifies Given/When/Then acceptance and pure, real preview/save/readback and browser evidence.16.4-AC03 full-card display alone is insufficient. No later-story prerequisite is imposed on refined16.1, but epic finalization requires all these consumers.

Exact additional candidate consumer seams, for later coordinator allocation only:

- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/resources/BookingEntry.tsx:17 — existing newDraft currently defaults one hour; later job-duration semantic default must preserve explicit prefill and edit history.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/resources/BookingEditor.tsx:19 — actual editor host for semantic dates/presence/job changes; retain E14 current review and E15 selected-slot interval contracts.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/resources/booking-editor-input.ts:28 — existing temporal normalization/preservation seam; no arbitrary timezone or precision change.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/resources/booking-action-state.ts — bounded semantic context type if needed; no E15 reader-wide or route allocation.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/scheduling-consumers.ts — proposed headless domain suggestions/default/demand/constraint results, separate from replaceable UI and sole existing detector.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/read-models/job-scheduling-context.ts — proposed checked job-bound consumer context, without broad CRM/quote/money grants.

Previously enumerated exact shared types/capacity/conflict/fact/proof paths remain subject to allocation. No E15 scheduling view/reader/E2E or CI/diagnostic edit is authorized here.16.4 consumer integration must include relevant job values in checked canonical facts/current-fact revalidation whenever they affect authoritative output; parser-only, display-only and stale snapshots are insufficient. Existing parent/role checks, both legacy creation signatures, job IDs/bookings, no-legacy evidence and headless separation remain unchanged. Concrete crew/travel arithmetic and any omitted-vs-explicit default details are bound before 16.4 readiness using governing rules; this correction does not invent those product semantics or a new capability/optimizer.

Planning status remains draft/unapproved. Root owns state/git and existing independent reviewer handles this narrow correction; no duplicate review or product verification was run.
## Formal planning resume — 2026-10-15

Invocation: existing draft-spec resume through the pinned Build Auto workflow; Halt after planning. Root-recorded route is build/build-delegate/standard/gpt-6.1-sol/High, selected for actual authorization and integrity scope. Clean checkpoint captured by root and independently observed before this delegate wrote:5ffb6d8ecd36f98e0f05dd7317a7c66bc96568df. No implementation step was entered. The accepted preparation and E2 inputs are carried forward; no duplicate review of settled preparation findings was initiated.

Preserved verbatim intent-contract SHA256:DE0DB4343DF0EA830FD12DD42BD7FFFC420F52F9AF2D390082C0DA397733B88D. All11 retained ACs and everyTR01–TR16 original/refined destination remain unchanged. Earlier preparation gate/result wording remains historical; this section is the current planning-resume record. Current human headless-design direction remains controlling; no external observations or browser step occurs.

Accepted E2 input: C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/test-design-epic-16.md, SHA2563D7D950F097E952B2F3CB250C1B9188CBE118964700063AD5AA1566519D2A169. Its completed design checkpoint is C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/epic-16/test-design-progress-epic-16.md, SHA25650805B8F4B287E2FB403838C05B3D24418F9AA1F0F6159EB6F0C9E1A7720B6F3. This binds test-design authoring, not executed product tests. It names70 epic contracts,29 for retained16.1; planned families do not assert physical case counts.

| Retained AC | Accepted E2 scenario binding |
| --- | --- |
|16.1-AC01|16.1-I01/I08/I09, R03; additive type/IDs, both creation APIs and schema negatives. |
|16.1-AC02|16.1-I02, R01/R02, E01; real relationship union and direct route/API scope. |
|16.1-AC03|16.1-U02/I03/R01/R02/R04/E01; matrix/row authority and protected payload absence. |
|16.1-AC04|16.1-U01/U07/I04/R03/E02; pure enriched state/identity and real atomic write/readback. |
|16.1-AC05|16.1-U06/E02; retained visibly-unsent state and real retry/persistence. |
|16.1-AC06|16.1-U03/U04/U05/I05/E03; own-job authoritative inputs and missing/empty semantics. |
|16.1-AC07|16.1-U04/U09/I06/I07/R04/E03; version/proof/current-fact races and atomic refresh. |
|16.1-AC08|16.1-U08/I10/E04; actual linked-job dependency warning and honest unknown. |
|16.1-AC09|16.1-I08 plus named acceptance/source-lock/evidence/tax regression inventory. |
|16.1-AC10|16.1-I09/I11 plus existing standalone/booking/current-authority/DST/editor regression inventory. |
|16.1-AC11|16.1-R01/R03/R04/I11 plus manifest/H4/exact-policy/scope and complete transfer accounting. |

E2's16.1-E05 is an informational declared-volume baseline with no invented SLO/performance PASS; every mandatory retained/transferred AC still requires actual successful evidence. Preserve SUPABASE_TEST_REQUIRED=1 and honest discovery/executed/failed/skipped/native results, normal-JWT/direct API negatives, synthetic-only fixture credentials and full migration/seed/integration/browser gates.

### Exact implementation-admission inventory clarification

No source/test/helper/migration/runtime allocation is granted by planning. E2 identifies two additional existing exact semantic-rebaseline candidates, not permission to disable scope guards:

- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/e2e/jobs/job-list-deferred-surface.e2e.spec.ts
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/guardrails/job-non-scope.test.ts

Exact candidate fixture helpers, supplementary to shared H4/matrix authority and still unallocated/uncreated:

- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/jobs-depth-atdd.ts — compose existing factories into member/assignee/foreign/card fixtures; normal actor clients and privileged fixture-only readback remain separate.
- C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/job-booking-facts-atdd.ts — scoped canonical-fact, two-session barrier and durable conflict/audit readback support; no alternate detector or privileged production seam.

These narrow filenames refine E2's proposed helper directories without granting either directory or editing E2. Candidate migrations are C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261015100000_e16_16_1_job_depth.sql and C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261015100001_e16_16_1_job_booking_facts.sql. Both are coordinator-requested PROPOSALS, not reserved/generated/created; coordinator validates chronology/collision and allocates final CLI identities. First: typed/child/read foundation; second: checked job-card transaction and authoritative booking fact/proof integration. No new mutation surface before its authoritative integration.

Coordinator's bounded E12 assessment permits considering jobs-only extensions in current equivalents of migration-reset.int.test.ts, role-harness.atdd.int.test.ts and role-harness.ts, preserving provisioning owner inventory/policies/onboarding update/platform self-read/provisioning fixtures/directReadDenied/non-granting mappings/protocol projections/exhaustive negatives. This does not release/adopt/copy/revert the retained E12 checkout or allocate any product write. Supplemental helpers never replace shared H4.

E15 shared semantic/claim reconciliation remains pending for the exact paths manifest.ts, permission-matrix.ts, capacity.ts and tests/unit/server/authz/phase-a-surface.test.ts already enumerated above; other proposed shared seams are not cleared by absence of a diff. All16.4 consumer paths remain EXCLUDED from16.1 ownership. E15 views/readers/time/calendar/E2E/diagnostic/CI scope remains excluded. No retained E12/E15 checkout or running resource was inspected/adopted by this formal plan.

### Historical formal gate condition — 2026-10-15

The frozen Block If is literal: exact shared ownership unresolved at final planning prevents successful formal completion. Latest coordinator clarification expressly preserves this condition; there is no controlling appendix or readiness-to-execution waiver. All product/shared/migration/fixture/runtime paths remain on IMPLEMENTATION HOLD. At the preceding binding checkpoint, planning status remained draft pending active ownership reconciliation. The terminal final-gate assessment below controls; independent content/test-design acceptance does not grant ready-for-dev. Root owns aggregate state/git; no commit/push/branch/PR/deployment occurs here.
## Historical Auto Run Result — 2026-10-15

Status: blocked

Blocking condition: spec failed ready-for-development standard

Invocation: existing draft-spec formal planning resume; Halt after planning. Selected spec: C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md.

Final readiness self-check: actionable paths/dependency order, all11Given/When/Then surface ACs, allTR01–TR16 retained/transferred obligations and accepted E2 risk/scenario bindings remain present. Frozen intent preserved byte-for-byte. The one planning repair bound accepted E2/exact proposal metadata; reread still fails the literal frozen Block If because exact shared ownership remains unresolved at final planning. Coordinator confirmed no overriding interpretation and E15 semantic/claim reconciliation is still pending. No business requirement is fabricated or dropped to force readiness. No duplicate review occurred.

Unresolved operational facts: exact shared source/test ownership remains unallocated; E15 changed shared semantics require reconciliation; concrete migration/helper filenames are proposals, not reservations or grants. Bounded E12 assessment applies only to possible own-worktree jobs extensions with all provisioning invariants retained, never adoption/release of the retained checkout.16.4 consumers remain excluded from16.1 allocation. These facts prevent successful formal completion under the frozen condition, independently of accepted preparation/E2 content.

Outcome is planning-only BLOCKED, not implementation failure or implementation admission. No step03/build/ATDD/code-review/run-time/product test/migration/source/sprint/state/git operation was performed. Root/coordinator own the pending resolution and next admission; no new human question is needed here. Current implementation HOLD covers every unallocated product/shared/migration/fixture/runtime path.

Completion hook: applied the planning/blocked branch of docs/process/review-order.md; preserved blocked result, no implementation Suggested Review Order authored, no implementation author/reviewer reconciliation or recursive HALT. No commit/push/branch/PR/deployment/resource was created. Historical preparation/E0/E1/review/E2 records remain intact.

## Resumed formal plan — 2026-10-19 (current)

Owner explicitly resumed E16 and adopted development-completion-policy.md after recovery adoption 04cf0edff6b6d38edf40c170cd21ed730e2d9555. Root recorded the existing build/build-delegate/standard/gpt-6.1-sol/High route and both timings; clean head_before is d33415c7b09e85ad43585758b0ce2d817bd28ef8. The original blocked report was adopted unchanged; it is history, not a current dirty-tree blocker. This is the draft-spec planning route, Halt after planning; no step03 or product/SQL implementation runs here.

### Actual gate reconciliation and prerequisite facts

The frozen intent block, all11 retained ACs and TR01–TR16 remain unchanged. Its literal Block If remains enforced: the previously unresolved exact ownership condition is now satisfied by coordinator allocation after E15 ACK, not waived. The four released paths are src/scope/manifest.ts, src/server/authz/permission-matrix.ts, src/features/scheduling/capacity.ts and tests/unit/server/authz/phase-a-surface.test.ts. The named auth/H4/role seams and facts/proof/types/conflicts/checked SQL snapshot-finalize changes are one coordinated High integrity unit. No new ACK, whole-E15 acceptance or fabricated integrated reassignment predecessor is required for available E16 work.

My Jobs uses real job_members read foundation plus existing E14 bookings/booking_assignees/person_profiles/current tenant membership, with auth.uid-bound row scope. The E15 scheduling reader and 20261013201515_story_15_1_booking_reassignment_flags.sql are not My Jobs prerequisites. They must be reconciled/tested only if that reader is actually integrated; this plan does not adopt it. Preserve current checked SECURITY DEFINER actor/tenant gates, stable source/booking identity, money omission and current role checks. jobs/layout.tsx already delegates /jobs to RouteAccessBoundary; reuse this boundary through the allocated manifest/permission/phase-a-surface seams, without broad app-shell edits.

Latest direct owner sequencing instruction controls this resume: implement available approved E16 slices. If an exact unfinished E15 contract blocks one slice, record contract/path, responsible owner, actual evidence, unblock condition and later integration/test action, then continue implementable work. Preserve the blocked slice's acceptance as open; never substitute whole-E15 completion or mark the story done. No currently identified E15 contract blocks My Jobs. The future E16 job-input integrity unit is work to implement, not an external predecessor claim.

### Exact implementation inventory

These names bind the existing approved tasks; they grant no directory-wide ownership. Root stages/commits and dispatches implementation separately. SQL implementation requires the reserved migration pair below; no historical migration edits. E15 views/readers/time/calendar/E2E/diagnostics/CI and all16.4 scalar consumer paths remain excluded. No shared fixtures beyond the named supplementary helpers are authorized. Existing provisioning-owner metadata, onboarding/platform policies, directReadDenied/non-granting mappings and exhaustive negatives survive jobs-only H4 extensions.

**Source / UI / shared seams (P1–P8):**

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/scope/manifest.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/permission-matrix.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/phase-a-surface.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/authz/job-access.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/envelope.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/validation.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/create-job.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/jobs.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/jobs-audit-db.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/index.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/save-job-card.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/card-db.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/card-proof.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/commands/jobs/card-facts.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/read-models/my-jobs.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/job-card-domain.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/dependency-warnings.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/types.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/read.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/jobs/actions.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobList.tsx`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobDetailView.tsx`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobEditDialog.tsx`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/components/jobs/JobCardForm.tsx`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/page.tsx`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/app/(app)/jobs/[jobId]/page.tsx`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/conflict-facts.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/server/bookings/conflict-attestation.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/types.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/capacity.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/src/features/scheduling/conflicts.ts`

**Named test/metadata edits (P9):**

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/features/jobs/job-card-validation.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/features/jobs/dependency-warnings.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/commands/job-card-validation.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/read-models/my-jobs.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/bookings/job-facts.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/jobs-depth.rls.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/commands/jobs-depth.int.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/commands/job-booking-facts.int.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/features/jobs/my-jobs.int.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/e2e/jobs/jobs-depth.e2e.spec.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/tenant-table-inventory.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/migration-reset.int.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/role-harness.atdd.int.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/authz/role-harness.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/server/authz/phase-a-surface.test.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/e2e/jobs/job-list-deferred-surface.e2e.spec.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/unit/guardrails/job-non-scope.test.ts`

**Only supplementary fixture helpers:**

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/jobs-depth-atdd.ts`
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/support/job-booking-facts-atdd.ts`

No generic seed/config/CI/package or other shared path is allocated. Existing focused suites named below are execution inputs; an additional edit requires an exact claim before mutation. Preserve the authored implementation review trail requirement and load frontend-component before any UI implementation.

### Reserved forward migrations: empty, not implemented

- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261019133151_e16_16_1_job_depth.sql` — CLI `supabase migration new e16_16_1_job_depth`, native0. Type/card columns, tenant composites, structural membership and other job children, hardened row-read foundation/ACL/RLS/indexes and checked narrow operational reads. Keep membership/designation mutation/elevation in16.2. No enriched write may bypass the second migration's authoritative transaction.
- `C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql` — CLI `supabase migration new e16_16_1_job_booking_facts`, native0. Job-bound canonical SQL facts, coherent version transition, checked booking snapshot/finalize/review and card snapshot/finalize/derived-refresh transaction. Preserve tenant serialization, fresh actor/relationship checks, output/domain/candidate bindings, private primitives and exact replay/selective-review semantics.

Installed CLI2.115.0 --help confirms migration new creates an empty script. Both files are0bytes; generated versions are distinct, collision-free and later than current 20261009091121 latest migration. Earlier 20261015100000/20261015100001 filenames remain historical proposals, never created. Recheck complete chronology before implementing against an integrated future base; no SQL, DB contact, install or CLI upgrade occurred here. Both migrations and source changes ship coherently in the final epic diff, not as an independently live half-version.

### Implementable order and retained evidence

1. Reuse local checkpoint2d14d7acaa8529207413cdcef4f33ff71dd53da5 P8 pure warning and97e622214b58f354c63f088c21d16db772446901 card-core validator/state. Their distinct Low author/reviewer receipts record14 and18 focused passes respectively; these are historical bounded pure evidence, not whole AC08 or AC04/05, integration, lint/typecheck or new execution here. Existing core test is tests/unit/features/jobs/job-card-validation.test.ts; the separately named server/commands test covers enriched command boundary/old callers and is not a duplicate filename claim.
2. Implement first-migration foundation, job-access.ts, My Jobs safe projections and allocated permission/route union; test real normal-JWT member/assignee/unrelated/foreign/inactive/role pairs, direct table/RPC/URL and structural money absence. Keep member writes unavailable and all-job manager flow intact. No E15 reader prerequisite.
3. Implement P4/P7 card commands/DB/proof/facts and second-migration snapshot/finalize as one High integrity unit with own-job engine selection and complete insert/delete/rebind-sensitive canonical content. Version/parser/SQL/proof transition is atomic; reject old/wrong-domain/stale/forged claims. A job-card save must recompute affected persisted conflicts through signed sole-engine output and atomically commit children/outcome/audit. No parser-only or stale-derived-warning shortcut.
4. Wire progressive usable card/My Jobs UI to headless state/actions; integrate existing dependency warning. Location/enriched identity and eligible PL remain real checked requirements. Full ACs, direct API/SQL negatives and both original create/acceptance paths require execution; standalone nullable/source stability stays intact.
5. Run development evidence below, independent consequential review and supported delivery gate before any done/finalization. TR01–TR16 destination obligations remain open until actual owning-story evidence; no16.4 consumer is implemented or counted here.

### Current verification classification — owner policy2026-10-19

Retain approved/pinned product acceptance and all consequential security, money, current-fact, authorization and transactional negatives. Development requires applicable static checks, production build/source+built containment, full DB integration/RLS and complete empty-history migration/seed replay, recovery-storage integrity, focused consequential tests, independent review, and essential real changed-flow smoke. Use SUPABASE_TEST_REQUIRED=1 and record native executed/failed/skipped counts at the actual revision. No skipped body is evidence.

Use checked-in pnpm run verify:development for applicable local static/build verification and standard CI/checkpoint-dispatch helper with a unique generated receipt; no private executable, global admission variable or temporary execution window. Complete DB/RLS/recovery integrity and essential auth smoke remain required in the current CI lane. For E16 essential real smoke retain normal assigned-user direct URL, money-safe detail, durable form save/reload and explicit failure/retry at360x640 plus actual job-bound preview/save persistence; these demonstrate functional acceptance rather than an exhaustive browser matrix. AC01–AC11 still require real outer-surface/integrity evidence. Existing test design stays accepted; this classification does not claim any planned scenario ran.

Execute focused E16 tests listed above and existing tests/integration/commands/{accept-quote-and-create-job,create-job,update-job,job-source-of-truth,accepted-record-lock,bookings,bookings-replay-authority,booking-conflicts,booking-editor,booking-editor-review-fixes,booking-editor-round2}.int.test.ts plus tests/integration/rls/bookings.rls.test.ts; preserve unchanged proof/capacity/DST/core checks. These brace names are execution inventory only, not an edit grant. Verify actual discovered paths before running. Additional precise test edits needed by a version transition receive root claim first; do not widen ownership silently.

Broad role×device×browser journeys, exhaustive screenshots/visual/manual checks and polish are deferred release validation, never passed or waived. Owner: E16 UI/release owner. Evidence: no new E16 UI acceptance in this run. Next action: run deliberate release_validation=true and representative manual/design checks at release stabilization; preserve any consequential failure as a development blocker. Transfer browser requirements retain their behavior/evidence; only exhaustive release breadth is deferred. Deferred items must be tracked in the supported delivery record/ledger before completion, not silently removed from TR rows.

Before development-complete/status done/finalization, author/verification delegate writes _bmad-output/auto-bmad/delivery/16-1-jobs-depth-activation-container-evolution-and-my-jobs.json with policy_version2026-10-19, explicit pinned-contract reconciliation, actual evidence_revision/development_checks, independent_review, owned deferred_release_validation and release_ready=false. Root runs the supported delivery_gate.py; no record or pass is fabricated by this planning run. Development complete is distinct from release ready; merge/deployment remain separately authorized and previews remain disabled.

No managed resource was launched here. Later verification uses guard-admitted isolated Compose/local synthetic resources and SQL-only migration replay under docs/process/local-setup.md; no native Supabase lifecycle/reset, hosted fallback or E15/user-resource adoption. After two failed operational approaches choose a simpler authorized route or record owner/evidence/next action/resume condition; avoid repeated harness loops.


## Auto Run Result

Status: ready-for-dev

Invocation: draft-spec formal planning resume through generation96e8da50b6e5096e00c4; Halt after planning. Spec: C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md. Clean head_before: d33415c7b09e85ad43585758b0ce2d817bd28ef8.

Final readiness reread: actionable exact source/test/fixture/migration names, dependency-ordered current tasks,11unchanged Given/When/Then outer-surface ACs, allTR01–TR16 destinations and accepted E2 bindings remain. Previous exact-ownership blocker is factually resolved by the explicit coordinator grants; no frozen condition was waived. No active intent/product gap identified in retained16.1; unnamed project-only fields and scalar consumers remain explicitly owned by16.4. Old proposed timestamps are replaced only in current execution by the two CLI-generated empty files.

This HALT is planning readiness, not implementation, executed acceptance, development completion or release readiness. P1–P10/fullACs remain open; pure14/18checks and source-only recovery2569passes are historical bounded evidence. No SQL or product implementation/ATDD/application test/build/resource/Git/index/sprint/state/report mutation was performed by this invocation. CLI empty reservations are disclosed, not schema proof. Root owns checkpoint/state and subsequent build/verification/review dispatch.

Completion hook: applied the planning-only branch of docs/process/review-order.md, preserved planning HALT and authored no completed implementation Suggested Review Order. Supported policy delivery record/gate is required later before done/finalization; no record/pass was fabricated. No recursive HALT, deployment, merge or release claim.


## Actual build invocation — 2026-10-19

Phase5 is explicitly admitted at clean baseline c47b26858d7898ab03c0680826e2be7489a2ae68; implement the whole approved16.1 scope above and retain unfinished acceptance honestly. Exact source/test/fixture claims are the reconciled inventory; both reserved migrations may now receive their SQL as one coordinated High integrity unit. Root exclusively owns Git/index/staging/commits/push/aggregate state/report; implementation and review delegates must not mutate Git or canonical state/report. Request root checkpoint with exact reviewed file inventory if workflow reaches a commit. You are not alone: preserve E15 and unrelated edits; no other-owner adoption or revert.

ATDD checkpoint c47b26858d7898ab03c0680826e2be7489a2ae68 contains21explicit new skipped cases (13DB/RLS,4essential browser,4source) and an actual detector U04 red control. Replace skips with real assertions through actual implemented interfaces; no skipped acceptance credit. Existing pure core32passes are historical bounded evidence. Minimize the existing tests/unit/features/jobs/job-card-validation.test.ts:12 TS2339 type-only fix under ordinary Low routing; fix current code/meaningful assertions, not expectations to hide failure.

Node22.23.2/pnpm10.24.0 frozen dependencies are installed in this worktree, package/lock unchanged. No local resource is running. Implement source first, then coordinate exact isolated test stack inputs with root; only actor-own trusted resourceGuardContext permits launches. No invented guard optional schema, native Supabase lifecycle/reset, hosted fallback or user/E15 resource adoption. Root is preparing the documented supported Compose path. Report actual runtime blockers with owner/evidence/resume condition, not an E15 dependency. Do not relaunch or expand a harness after two failed approaches.

### Implementation route — 2026-10-19
Implementation author retains Sol High authorization/SQL/proof/current-fact integrity work. One Sol Low UI delegate owns only the P6 UI/actions paths after a stable contract handoff, under coordinator authorization; it adds no authority logic. This is source implementation, not verification or completion evidence.


## Implementation source checkpoint — 2026-10-19

Author: Sol High implementation delegate, with the explicitly allocated Sol Low P6 UI contribution. Source baseline remains c47b26858d7898ab03c0680826e2be7489a2ae68; root-owned process commits 92428157, 30f8b863 and dea276c7 are known concurrent changes. This checkpoint is implemented source ready for independent review, not development completion, story done, or release readiness. P1–P10 acceptance remains open until the required executed evidence and independent review exist.

Implemented choices follow the current approved headless defaults. The original minimum-input create and lifecycle edit remain usable with their original commands; an explicit progressive-card toggle supplies the stricter enriched identity workflow. The P6 author compared JobList against c47b and restored its four filters, labels, localized dates, row links, simple-create error/empty/options states and navigation. Domain validation, the command adapter, proof and the sole detector remain separate from those replaceable components.

The schema adds only the agreed scalar fields, typed existing container and four jobs children. Membership is a read foundation with no authenticated mutation or operational elevation. My Jobs uses actual active profile/member or booking-assignee relationships. The safe operational detail returns no protected amount keys for an unentitled actor, lists withheld fields, and avoids inherited quote/file reads. The existing prerequisite job read predicate remains enforced: a stored dependency whose prerequisite is invisible produces an explicit unknown date warning rather than exposing its data. No project-manager email was added to the worker projection.

Card writes use SQL-canonical proposals, a complete current baseline and the existing tenant serialization gate. The HMAC key provider is reused with the separate length-prefixed kopplas.job-card.attestation.v1 domain; no new secret family, hosted configuration or public token was introduced. Finalize rechecks current authority, parents, digest, version and signed output before the scalar/child/conflict/outcome/audit transaction. New conflict identities reopen; unchanged natural identities retain existing workflow evidence. Booking snapshots/finalize use the coordinated v3 facts contract and every evaluated booking selects its own job inputs.

Automatic approval review rejected an attempted combined display patch that would have added a job-bound manager email and removed the prerequisite job_can_read predicate. That patch was not applied or retried indirectly. The implemented safe route retains the predicate and represents unavailable prerequisite dates as unknown. Its unrelated location constraint/display correction was applied separately without widening access.

### Executed evidence and limits

- Focused Node command over the ten changed domain/fact/projection/scope/enrollment suites: native 0, 68 passed, 0 failed, 0 skipped. Log: C:/Users/Rasmus/AppData/Local/Temp/e16-focused-current.log.
- Full Node unit command: native 0, 2611 passed, 0 failed, 1 skipped, 2612 tests across 100 suites. Log: C:/Users/Rasmus/AppData/Local/Temp/e16-unit-final-source.log. The single existing Windows skip is the Linux-xattr file-backend restore case; it is not recovery-Storage coverage and must execute in its Linux lane.
- Proper absolute Node 22 / TypeScript command, independently run by root's tooling delegate against the current working source at dea276c7: native 0, 0 errors. Log: C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-tsc-final-verification.log. The subsequent test-helper local-name/comment cleanup is nonsemantic; exact-candidate CI still applies.
- Production Next build: native 0. Log: C:/Users/Rasmus/AppData/Local/Temp/e16-build-source.log. Lockfile, source service-role containment and built-bundle containment passed.
- Full ESLint initially found one allocated fixture local named module and 15 warnings. The name was repaired to bindings; focused ESLint for that helper passed without diagnostics. Prior P6 focused ESLint passes are source evidence only. The remaining warnings are existing unrelated paths; full exact-candidate CI lint remains required.
- All 21 newly skipped ATDD assertions were activated: 13 database/RLS, 4 essential browser, 4 parser/detector source cases. Three additional real database cases cover enriched-create replay, signed-card protocol negatives and a child change during an observed tenant-gate wait. Their bodies use actual checked RPCs, ordinary JWT clients and fixture-only privileged setup. The 16 database/RLS and 4 browser cases are authored, not locally executed evidence.

The root's isolated Compose request was refused before launch (HOOK_CONTEXT_UNAVAILABLE, resourceId null); no local stack was started or adopted. No database migration/seed, full integration/RLS/regression lane, direct recovery-Storage proof or essential browser journey ran here. These are required development evidence, owned by root's isolated exact-head CI lane, with resume condition a reviewed/pushed candidate whose required jobs execute successfully. No skipped runtime suite is counted as passing coverage. A delivery record with passed independent review/development evidence cannot be honestly written yet; the implementation author remains available for review fixes and final evidence reconciliation.

### Deferred release validation

| Item | Owner | Status/evidence | Concrete next action |
| --- | --- | --- | --- |
| Exhaustive device/role/browser UI matrices beyond the four essential journeys | E16 release-validation owner | Deferred; not executed in this source checkpoint | Run the tracked full release-validation lane on the final qualified candidate. |
| Screenshot comparison, visual inspection and manual polish/walkthrough | E16 release-validation owner | Deferred under the 2026-10-19 completion policy; no historical result relabelled | Execute and retain viewport/visual/manual evidence before a release-ready claim. |

Development complete still requires the applicable remaining runtime checks and independent review. Release ready additionally requires the deferred checks and existing release/merge/deployment approvals. Transferred TR03–TR16 obligations remain owned by their named sequential stories; this checkpoint gives them no completion credit.

## Focused review-fix batch 1 — 2026-10-19

The first independent Sol High source pass reported two P2 patches: confirmed enriched save retained a permanent disabled state across same-route refresh, and E02's confirmation regex did not match the actual Swedish message. No other consequential SQL, authorization, money or detector finding was reported in that pass. The same Sol Low P6 author fixed only JobCardForm.tsx and jobs-depth.e2e.spec.ts; the Sol High implementation author checked the changed identity/retry semantics. No broader review or specification change was started.

A confirmed attempt is still cleared only after the server returns success. The component retains its current values and confirmed status across refresh, allows another edit, and clears the confirmed-only save lock when a field changes or an access-window add/remove button changes the draft. A new submit constructs a fresh command ID. An unresolved request keeps the form disabled and retries the exact retained body and ID. There is no prop-triggered reset/remount that could discard an unresolved attempt.

E02 now asserts the literal server-confirmed message, equality of the failed/retried POST bodies, and two durable successful saves in the same mounted form without a reload between them. It explicitly verifies a button-only window deletion enables save before another input event, restores that interval, then checks a different command ID, the second title/duration, retained child relationship content and exactly one further audit. Its final reload/full-state readback remains. These are authored browser assertions, not locally executed browser evidence.

Focused verification: the P6 author ran ESLint on the two changed files (native 0) and Playwright collection of the exact jobs-depth file (native 0, four tests collected; no execution). The implementation author ran the proper absolute Node 22/TypeScript gate (native 0, zero diagnostics), log C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-review-fix-tsc.log. The unchanged pure-unit, SQL and initial build evidence above is retained with its original provenance; no extra broad rerun is claimed for these UI fixes. Runtime acceptance and the same reviewer's narrow follow-up remain open. The sole review order and 47-file raw-hash inventory are refreshed for this patch batch.

## Focused CI startup-fix batch 2 — 2026-10-19

Root reported the reviewed source checkpoint 41463a2224c9197ee53195d6df03ac82375f4aeb pushed and standard CI run 39271273236 dispatched with release_validation=false. Its verify job passed. DB job 118125149078, essential-browser job 118125148993 and recovery-Storage job 118125149044 failed stack/schema startup before tests; missing native test reports are secondary to that startup failure. No runtime acceptance result is inferred from those jobs.

The authorized private DB log inspection identified SQLSTATE 42601, syntax error at end of input, at statement 11 of 20261019133200_e16_16_1_job_booking_facts.sql while compiling finalize_job_card. PostgreSQL pointed to line 343's unparenthesized CASE in the operation comparison. The implementation author added only parentheses around that CASE expression, matching the already working finalize_booking_editor predicate. Actor, operation, candidate, digest, proof, expiry, version and transaction behavior are unchanged.

A focused inspection of CASE comparisons in the two new migrations found no second instance of this parser defect: the numeric CASE is already enclosed by its containing expression, and the editor-operation comparison already uses parentheses. No implementation-mirroring string test, dependency/parser installation, broad review or unchanged unit/build rerun was added. The previous source/unit/type/build evidence remains historical evidence with its recorded provenance; it did not prove PostgreSQL compilation. The actual migration compile and runtime tests must execute on a new independently reviewed exact-head CI candidate. Root owns that new commit/push/unique receipt; no redispatch, cancellation, local resource or provider action was taken by this author.

Private log: C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39271273236-db-startup.log. Only the safe SQL error, migration/function/line and statement context were reported; credentials and the raw log were not published. This grammar-only patch and the refreshed trail return to the same High reviewer for a narrow startup-fix/regression check. Required runtime gates, delivery evidence and development completion remain open.

## Focused CI runtime-fix batch 3 � 2026-10-19

After the same High reviewer's narrow startup-fix approval, root pushed d56281f5a9d5db5feab5200d25a32a139909d84f and dispatched standard CI 39272905198 with release_validation=false. Startup/reset succeeded. Recovery-Storage job 118130883258 passed its one actual native assertion. DB job 118130883686 executed 1,546 assertions: 1,535 passed and 11 failed; of 1,752 total, 206 were pending and none todo. Browser job 118130884092 reported seven passing authentication cases and four failing Jobs cases. All four Jobs failures occurred in fixture setup before their UI journeys, not in a passing or deferred release lane.

The native DB artifact full-integration.json raw SHA256 is abb42cf557ddd240c916514bf35aaaac441d4129baf49a53826ce0e24f398e87. Its failure groups are eight positive enriched-card cases (job-booking-facts: five; jobs-depth command: two; jobs-depth RLS: one), one old booking receipt version assertion and two old role-aware policy/capability assertions. The 206 pending comprise 205 H4 assertions behind a failed beforeAll and the DB lane's separately owned recovery assertion. The real signed-card protocol-negative case passed and confirmed finalize was reached; My Jobs passed all three actual assertions. None of those passes proves the positive save/refresh cases.

Root allocated the following bounded repair after this evidence, without a blind retry:

- The H4 own work-role INSERT at cross-tenant-isolation.rls.test.ts:450 omitted required cost_rate_ore and sell_rate_ore. It now supplies synthetic integer-ore rates matching the existing booking fixture. Both own/foreign real child fixtures and every existing assertion remain. The beforeAll failure did not execute any of the 205 H4 assertions.
- The four browser failures reported createRoleAwarePhaseAFixture is not a function at jobs-depth-atdd.ts's native dynamic factory-facade import. That same helper now statically imports the existing tenant factory facade and the explicitly used jobs/quotes command bindings, following the existing bookings-atdd static pattern. Database work still occurs only inside invoked fixture functions; no new endpoint, provider or module-level database operation was added.
- finalize_job_card declared local x while its conflict DELETE/INSERT used the SQL set alias x. Batch 3 renames the checked loop value to v_conflict and uses explicit conflict_row(value) columns. PostgreSQL documents ambiguous PL/pgSQL variable/column resolution as an error (https://www.postgresql.org/docs/current/plpgsql-implementation.html). SQLSTATE 42702 as the shared native card failure cause remains INFERRED: the existing command boundary returned SERVER_ERROR without exposing the original code. A source-only inverse transformation reproduced the reviewed migration's raw SHA exactly, bounding this patch to those names; actual successful persistence still requires new CI. The existing test-only command adapter now emits only a hardcoded allowed card RPC name and a validated five-character SQLSTATE for an unexpected SQL failure. It prints no message, detail, payload, identity, proof, credential or raw error.
- Root additionally allocated tests/integration/commands/booking-editor.int.test.ts and tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts. The former's expected receipt version is now v3; the explicit correctly signed v2 rejection remains in job-booking-facts (including the already executed protocol-negative case). The latter checks delegated job_can_read authority plus actual relationship access instead of assuming inline role text and no ViewAssigned grant. Other module role/catalog checks retain their previous predicates. Navigation admission and unassigned row admission remain distinct, and real member-positive, foreign, unassigned and archived-member negatives are asserted.

Focused checks on this repair: ESLint of the four changed TypeScript helper/test files, native 0 with no diagnostics (kopplas-e16-ci-runtime-fix-lint.log); proper absolute C:/nvm4w/nodejs/node.exe and worktree TypeScript --noEmit, native 0 with zero errors (kopplas-e16-ci-runtime-fix-tsc.log); Playwright test tests/e2e/jobs/jobs-depth.e2e.spec.ts --list, native 0 with four collected, zero executed (kopplas-e16-ci-runtime-fix-collection.log). An initial lint command named a nonexistent Program Files Node executable and did not run; one correction used the discovered executable. No unchanged broad unit/build rerun or local stack fallback was performed.

Private runtime logs remain under the temporary directory as kopplas-e16-ci39272905198-db-failed.log and kopplas-e16-ci39272905198-e2e-job.log; raw logs and credentials were not published. Root owns the next independently reviewed head and unique CI receipt. The sole author trail and post-write raw-hash inventory are refreshed, now 49 files including the two admitted existing tests, still nine new files. Same-reviewer narrow causal-fix review, positive DB/RLS/full H4/browser acceptance and delivery evidence remain open.

## Suggested Review Order

Author: the Sol High implementation author, incorporating the recorded P6 author's baseline-preservation decisions. Refreshed after focused CI runtime-fix batch 3 against reviewed/pushed checkpoint d56281f5a9d5db5feab5200d25a32a139909d84f plus the six-file causal repair below; source intent baseline c47b268 is preserved. Runtime acceptance of these repairs and the same reviewer's narrow independent follow-up remain outstanding.

### Reach the personal job flow without expanding row authority

The existing manager list and minimum-input creation remain intact; the enriched card is explicit progressive disclosure. Route admission comes from the active manifest, while the SQL member/assignee predicate independently restricts direct reads.

- `src/app/(app)/jobs/page.tsx:18` — `personal ? readMyJobs() : readJobList()`: choose personal or entitled all-job reads.
- `src/server/read-models/my-jobs.ts:16` — `readMyJobs`: construct only the thin public list projection.
- `supabase/migrations/20261019133151_e16_16_1_job_depth.sql:69` — `job_can_read`: enforce current role and actual job relationship.
- `src/features/jobs/read.ts:234` — `protectedMoney`: avoid quote/file queries on operational-only detail.

### Keep enriched persistence and derived warnings one transaction

The new command leaves both original APIs unchanged and accepts only the bounded enriched value object. SQL owns canonicalization/current-row authority; a separate proof domain binds the server's sole-engine result before atomic persistence and audit. Batch 3 separates the PL/pgSQL conflict variable from explicitly qualified SQL rows without changing that transaction.

- `src/features/jobs/job-card-domain.ts:59` — `validateJobCardInput`: reject smuggling and normalize bounded children.
- `src/server/commands/jobs/save-job-card.ts:24` — `snapshot_job_card`: enter the checked canonical proposal flow.
- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:216` — `job_card_related_internal`: lock and recheck coherent current parents.
- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:323` — `finalize_job_card`: verify proof/current baseline before all durable writes.

### Bind every booking to its own authoritative facts

The version changes with SQL snapshots/finalize and the parser together. Complete per-job sets preserve unavailable versus recorded-empty, and the sole detector selects the evaluated booking's identity instead of sharing the candidate's requirements.

- `supabase/migrations/20261019133200_e16_16_1_job_booking_facts.sql:3` — `booking_detection_facts_internal`: snapshot sorted complete job sets and booking bindings.
- `src/features/scheduling/conflicts.ts:72` — `jobInputSets`: select each evaluated booking's own requirements/windows.
- `tests/unit/server/bookings/job-facts.test.ts:73` — `16.1-U04`: assert mixed-job and unbound warnings without candidate bleed.
- `tests/integration/commands/job-booking-facts.int.test.ts:4` — `16.1-INT-005`: exercise signed protocol negatives through real SQL.

### Assess evidence at the boundary it actually exercises

AC04/09/10 retain real enriched/original API and exact-child assertions. AC05 now also covers two successive same-form saves: uncertain retry preserves its body, while a new edit receives a fresh command identity. The focused/full Node passes prove pure behavior and registry/scope contracts; authored DB/browser bodies do not prove runtime acceptance.

- `tests/integration/commands/jobs-depth.int.test.ts:26` — `exact child replacement`: assert atomic enriched values and preserved source/booking identities.
- `src/components/jobs/JobCardForm.tsx:89` — `onChange`: unlock only the confirmed draft for another edit.
- `src/components/jobs/JobCardForm.tsx:109` — `setSaved(false)`: include button-only access-window edits in that transition.
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts:162` — `16.1-E02`: assert retry-body equality and successive durable saves without reload.

### Repair executed failures without weakening the gates

Batch 3 uses static bindings at the existing lazy fixture invocation boundary, supplies required synthetic H4 rates, and reconciles the two old test contracts with approved v3 and relationship-based jobs access. Other module checks and all H4 assertions remain; the jobs test adds real member, unassigned, archived-member and foreign-tenant read checks.

- `tests/support/jobs-depth-atdd.ts:11` � `import * as t`: resolve the factory facade through Playwright's static transform.
- `tests/integration/rls/cross-tenant-isolation.rls.test.ts:450` � `cost_rate_ore,sell_rate_ore`: seed a valid own role before all 205 H4 assertions.
- `tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts:274` � `assigned capability needs a current relationship`: verify actual relationship scope with ordinary JWT clients.
- `tests/integration/commands/booking-editor.int.test.ts:101` � `booking-conflicts-v3`: expect the current receipt engine; signed old-engine rejection remains in job-booking-facts.

Evidence: see Executed evidence and limits and all three focused fix batches for commands, counts, logs and revision provenance. CI 39272905198 proved startup/schema replay and recovery-Storage (1/1), but DB assertions failed 11 and 206 remained pending, while all four essential Jobs browser cases failed fixture setup. These are failed/open acceptance gates, not source-only evidence or passing coverage. This repair passed focused ESLint, proper absolute TypeScript and four-case browser collection; the SQL inverse-hash check bounds the change to names, not runtime correctness. New exact-head CI must prove successful persistence, all H4 obligations and essential browser journeys. Exhaustive visual/manual work remains deferred release validation; no development-complete or release-ready claim is made.
