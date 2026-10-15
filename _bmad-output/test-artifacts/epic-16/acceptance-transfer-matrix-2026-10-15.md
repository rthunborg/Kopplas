# Epic 16 acceptance-transfer matrix — 2026-10-15

Status: preparation draft. Coordinator relayed independent High final packet-binding PASS and selected Option A on 2026-10-15. This selects the preparation direction; it does not approve this newly authored spec or allocate product writes. Original readiness packet remains unchanged at commit d6a310be4f55da0490669881737e88ce2eee8dda, SHA256 E75E24522459001E1EA93AD2CBFB2FC503003327052541399386EE196C1C3152.

Source sketches: C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/epics-phase-b.md:1583 (16.1), :1587 (16.2), :1591 (16.3), :1595 (16.4), :1599 (16.5). Field/storage authority: C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/planning-artifacts/architecture-phase-b.md:438 and :467. The ORIG/TR/AC/check identifiers below are newly authored trace labels, not claims that historical sources or executed tests already contain those IDs.

## Original to refined ownership

| Trace | Original obligation | Refined owner and named acceptance | Required destination evidence; none executed |
| --- | --- | --- | --- |
| TR01 | 16.1 typed existing container and old/new default order | 16.1-AC01 | Additive schema/reset and original creation regressions; stable IDs/status/source refs. |
| TR02 | 16.1 full membership/assignment My Jobs; 16.2 job_members schema | 16.1-AC02/03 structural/read foundation | Actual job_members rows plus booking-assignment union, duplicate-free lists, direct-URL/API row negatives, inactive membership and same-tenant FK tests. No membership mutation or role elevation is credited here. |
| TR03 | 16.2 person membership, per-job operational role, composite refs | 16.1 schema foundation; 16.2-AC01 complete semantics | 16.2 actual checked assign/change/remove command and overview membership list; both types, same-tenant refs and current actor/member eligibility. Schema presence alone cannot pass 16.2. |
| TR04 | Original 16.1 full 8.4 form includes responsible Arbetsledare; 16.2 assignment/UI | Explicit writable-field transfer to 16.2-AC02 | Actual workspace responsible-Arbetsledare picker saves/replaces/clears designation through checked command; reload proves exactly the represented job_members state. No second storage column, no tenant Roller mutation. Browser + transactional readback required. |
| TR05 | 16.2 per-job Arbetsledare command enforcement and role-pair tests | 16.2-AC03/04 | Same actor allowed operational action on designated job, denied on other job/direct RPC; revoke/demote race, multi-role, inactive/foreign targets and no money grant. Every seeded-role negative plus designated positive executes. |
| TR06 | 16.1 relational dependencies include other jobs/work orders | 16.1-AC08 job-to-job; transfer work-order target/consumer to 16.3-AC03 | 16.1 stores/displays and warns on job planned-date violation. 16.3 same-tenant work_order FK targets, work-order consumers and actual workspace warning after edit. No dynamic future FK, JSON IDs or assumed engine graph. |
| TR07 | 16.1 complete role/window scheduling inputs | Retained 16.1-AC06/07, no transfer to E15 | Real SQL job facts + version/digest + per-evaluated-booking selection + current commit check + stale-proof negatives and real booking preview/save warning. Parser-only relaxation fails acceptance. |
| TR08 | Original 16.1 unspecified nullable project-only fields | 16.4-AC03 concrete complete-card/project-only field decision and SQL constraints | Naming/disposition is still unresolved. No placeholder columns; independent reviewed concrete field contract needed. 16.1-AC01 adds type without fabricating the unnamed set. This is an explicit refined acceptance boundary, not unchanged original 16.1 completion. |
| TR09 | 16.1 full progressive job-card form; 16.4 card semantics | 16.1-AC04/05 bounded identity/scheduling form; 16.4-AC03 full card | Final 16.4 browser evidence covers every 8.4 field, including responsible Arbetsledare delivered in 16.2 and work-order dependencies delivered in 16.3. No duplicate storage; project-only validity enforced below commands. |
| TR10 | Upgrade: audited, idempotent, one-way; project-only children SQL-bound | 16.4-AC01/02 | Checked command + direct-SQL downgrade rejection + identity/bookings preserved; events/audit atomic; already-projekt replay no duplicate event/audit; explanatory confirmation. Payment-plan implementation remains E17. |
| TR11 | 16.1 both existing creation paths/bookings unchanged | Retained 16.1-AC09/10, repeated cumulative epic regression | Actual acceptance RPC replay/concurrency/rollback/source immutability and original standalone inputs succeed; job/bookings stable with coherent parents. No connect-later mechanism. |
| TR12 | Workspace header, operational actions/tabs and field shape | 16.5-AC01/02/03 | Actual one-ID workspace with live authorized tabs; Filer owner scope and protected-payload absence; job bookings/preconnected create, conditional E15 time-entry seam; no premature completion action before E18 authority. |

## Mandatory preservation of every 16.2 obligation

16.2-AC01: Given an entitled job manager and a current eligible person, when actual workspace member assignment/change/removal runs, then per-job membership/role and attributable audit commit atomically for either job type with same-tenant references; overview list reloads that exact state.

16.2-AC02: Given a job workspace and eligible person, when responsible Arbetsledare is selected/replaced/cleared through the actual picker, then the checked command changes only that job's job_members designation, the displayed responsible field reloads from it, and no tenant role or independent responsible-person storage is changed. This is the explicit destination of the writable-field transfer from original 16.1.

16.2-AC03: Given the same actor designated on job A but not job B, when permitted operational commands are attempted on each job and directly through their checked RPCs, then authority is granted only on A and no new economic visibility arises.

16.2-AC04: Given every seeded role, multi-role combination, foreign/inactive actor/member and revoked designation, when assignment/read/operational commands and direct table requests run, then concrete positive/negative pairs prove the matrix, parent scope and current per-job checks agree. Membership writes never move into tenant Roller.

Prospective 16.2 evidence paths: C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/commands/job-members.int.test.ts; C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/integration/rls/job-members.rls.test.ts; C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/tests/e2e/jobs/job-members.e2e.spec.ts. These names are proposed, unallocated and not test execution claims.

## Epic completion gate

All TR01–TR12 obligations must map to reviewed destination specs and actual successful evidence at the final candidate. Every retained 16.1 AC, every 16.2 obligation above, 16.3 work-order containment/files/assignment/dependency warnings, 16.4 upgrade/complete-card constraints and 16.5 workspace gates remain required. A 16.1 foundation pass cannot close a transferred row. No later story is required to make refined 16.1 executable; its evidence honestly excludes transferred surfaces.

Keep original and refined acceptance distinct. Every transfer needs the independent pinned-spec review/coordinator admission record before execution. Record native results, actual executed/failed/skipped counts, canonical revision and browser/database readbacks; placeholders or skipped bodies are not evidence. Preserve cumulative acceptance/standalone/booking regressions, role/H4/exact-policy coverage, required empty-schema CI chain, field 360x640 persistence/failure, final author trail, independent review, and one final PR. No hosted deployment or Phase C capability is inferred.

## Owner decision amendment — 2026-10-15

Direct owner direction supersedes the earlier prospective oracle gate: never reference/use a legacy URL as evidence; missing design rules are resolved with maintainable headless defaults, no legacy observations. All TR01–TR12 product/authority/transaction and explicit transfer obligations remain. Replace prospective oracle evidence with review of domain/state/validation/actions/semantic view models and usable replaceable UI. Current priority/location/window defaults are in the draft 16.1; unnamed project-only fields remainTR08/16.4-AC03. No transfer or test is passed by this amendment.
