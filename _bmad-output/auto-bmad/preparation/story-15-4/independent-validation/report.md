# Independent Story 15.4 specification validation

**PASS — zero required specification corrections.** Independent `gpt-6.1-sol` High validation, 2026-10-20. This is preparation validation, not an implementation review round or development acceptance. Root alone admits/finalizes the approved binding; this report independently accepts the candidate below for that decision.

## Binding and actual checks

- Owned checkout: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`; branch `codex/epic-15-scheduling-time-calendar`; HEAD `5040f683cf9446d39de8512cdca82242c55fca3e`.
- Candidate: `_bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md`.
- Raw SHA256: `7933d020fba0986d283294cb94f85859a58d1fdc83f884a4d29e8b69751c89bb`.
- Intent kernel SHA256: `3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb` (UTF-8 LF, both tags included, no appended newline).
- Exactly **10 ordered tasks, 9 Given/When/Then ACs and one verbatim original AC sketch**. All **13 author preparation artifacts** were inspected; the author's manifest has **13 correct file bindings** (12 preparation files plus the spec, excluding the manifest itself). Its own digest is recorded in the machine receipt.
- Independent `check-candidate.py`: exit 0, **26 passed / 0 failed** artifact/process checks. Authoritative reader and discovery both exited 0: `ready-for-dev`, `parse_warnings=[]`, intentional frontmatter `warnings=[oversized]`; unique discovery, no ambiguity/hard stop. `git diff --check` exited 0.
- Tracked application/schema/test/config/governance/source content equals the stated HEAD. The sole tracked delta is Root's expected canonical Story 15.4 state path; its bytes were observed only and conserved during checks. Cached Epic 15 context SHA256 `f41bccd2029d5dbd027f9b98c3f7b3e8b93b4ce7627331ec7bcf2592aded910a` agrees with both author preservation receipts. Coordinator snapshot hash matches the supplied fresh snapshot. No inventory/log duplication was needed.

The author's `validate-planning.py` was read in full and parsed, **not executed**: it writes original author receipts and requires clean tracked Git status, which conflicts with the expected Root-owned state delta. Independent read-only equivalents preserve those receipts and write only in this directory.

## Substantive assessment

| Area | Decision and source basis |
| --- | --- |
| Approved requirement completeness | Spec lines 43–53 and 75–101 preserve Story 15.4's complete sketch from `epics-phase-b.md:1563`, FR90/FR92 (`prd-phase-b.md:363,365`), architecture §10.6 (`architecture-phase-b.md:800`) and UX §§4.7–4.8 (`ux-design-specification-phase-b.md:276`). Booking-card and standalone filing, own weekly rows/nudges, complete PL/Admin filters/sums/delta/annotation and the stable no-money consumer seam all have tasks and observable ACs. |
| Current authorization and direct paths | Design companion lines 7–21 distinguishes ReportOwn (Admin/PL/Montör) from Review (Admin/PL), current active identity, own assignment, standalone profile independence, direct SELECT RLS, column privacy, command-only writes and SQL checks independent of the envelope. This fits current matrix/role union and `job_can_read` in migration `20261019133151_e16_16_1_job_depth.sql:57–75`. It explicitly avoids treating the Montör-only `booking_owned_by_current_user` helper as universal filing authority (`20261006104143_booking_invariant_corrections.sql:13`). No reviewer role permits peer filing or core mutation. |
| Transaction, replay and concurrency | AC2/6/7/8 and companion lines 17–21 require actor-bound attempts/digests, current authority before replay, frozen original replay result, fresh reference/assignment checks, exact retry reconciliation, review revision/latest-attempt rules and one report/annotation plus audit transaction. Existing tenant serialization, sorted locks, checked SQL and outer-audit suppression provide compatible seams. The actual existing serialization key is the tenant advisory lock (`20261006122441_booking_conflict_detection_integration.sql:5–16`); its manager-only gate is not itself a Montör filing grant. Implementation must honor the stated own-authority contract while sharing that lock discipline. This is a source compatibility observation, not a missing requirement. |
| Dates, minutes, provenance and lifecycle | Companion lines 9–13 defines valid local dates, positive exact whole minutes, integer overflow boundary, independent DST/overnight goldens, editable prefill, multiple deliberate filings, nullable booked-at-filing comparison and honest standalone grouping. AC4/7/9 prevents later booking changes or review metadata from rewriting filed core/snapshot/status. Existing `time-zone.ts` provides real-instant/Stockholm helpers. Accepted quote/job commitments, conflict acceptance, series exceptions/tombstones/stable IDs and money authority remain untouched. |
| E13 producer and reachable privileges | Companion lines 25–27 and AC5/8 require fixed in_app content/route, current reporting recipients/preferences, explicit tenant scope, completed seven-date frozen window, bounded keyset continuation, recipient/date dedupe and atomic sanitized system audit. Current registry/runner/route own authenticated dispatch, UTC cadence, continuation and failure visibility. Existing booking raw service-role ACLs are closed (`20261006101609_bookings_and_assignees.sql:104`); the candidate explicitly requires a narrow service-only checked RPC instead of raw grant widening. Current notification uniqueness (`20260923170000_in_app_notifications.sql:3`) and service-only system-audit RPC precedent are compatible. No new public/client privileged entry point, provider activation or mail release change is proposed. |
| Manifest, scope and cross-epic contracts | Scheduling is already active (`src/scope/manifest.ts:263`); only the report table, route, category and scoped operations are added with exhaustive H4/matrix/policy/ACL enrollment. No premature calendar feed/MyDay or Phase C capability appears. Current E16.1 job identity/visibility is consumed; unfinished E16.2/16.3 surface is not imported. Exact shared paths, metadata-only BookingEntry callers, semantic limits, fixtures, fault-test serialization and later combined job/member/resolver regression obligations appear in the ownership handoff. A unique forward migration strictly after current 108 must be allocated later; 105/106/107/108 remain immutable. |
| Usable headless implementation | T1/3/4/6 and companion lines 29–35 separate behavior, validation, attempt state, request-bound actions/read models and replaceable presentation proportionally. Existing Dialog, globals and booking entry patterns support prefilled/standalone capture, week/review, keyboard/focus/touch controls and explicit connection/unsent/retry feedback at 360×640. These are owner-authorized defaults, not invented legacy observations. |
| Actual-execution development gates | T7–10 and Verification lines 111–119 require applicable static/build/containment/dependency checks, full `SUPABASE_TEST_REQUIRED=1` DB/RLS with actual counts, migration replay/seed/exact policy/ACL/H4, direct physical recovery Storage integrity, all changed focused integrity cases, essential configured-production browser filing/retry/review and independent High review of the actual sensitive diff. `verify:development` is real and includes build/containment. Deferred release matrices/manual/performance cannot replace those gates. TEA 15.4 RLS/INT001–004/COMP/E2E scenario families map to real required assertions, including lost-response physical readbacks, not collection or mocked success. |

No missing guard finding is raised where the candidate already requires checked SQL, RLS, narrow ACLs or locked reference validation. There is no identified bypass or material product ambiguity requiring a human decision.

## Continuity and limits

Read the owned AGENTS, routing/completion/review/local-setup policies, relevant project-context lessons, approved Epic 15/PRD/architecture/UX/manifest, current predecessor sources and cited tests, plus all author preparation artifacts. The Oct 15 owner ban governs older oracle wording: no legacy application URL was used, no legacy site was browsed and no new legacy evidence is claimed. UXB-A9 and delivered Contract D remain resolved predecessor contracts. Epic 14 October 8 accepted-with-open-items and its 48 advisory/manual/performance carryover remain historical/open as appropriate.

Story 15.3's exact CI `39363860222` at `d550029a...` is predecessor evidence only; no 15.4 implementation exists or is accepted. Inherited `review_unverified=TRUE` remains Root-owned. This validation starts no resources and runs no app/unit/integration/RLS/Storage/browser/build/CI workload, grants no ownership allocation, migration reservation, approval binding, push/PR/merge/deployment or release authorization, and does not resume another session. No additional agents were spawned.

Required next steps are Root freeze/admission and Coordinator allocation, then implementation and actual development gates. Exhaustive visual/device/browser matrices, screenshots, manual accessibility/daylight/exploration, measured ≤30-second capture timing and representative R-012 performance remain deferred release validation, with named owner, scope, evidence/status and next action in the future delivery/ledger. Essential functionality and integrity remain blocking. Preserve one final epic PR and existing preview/deployment boundaries.

## Reproduction

From the owned checkout:

```powershell
python _bmad-output/auto-bmad/preparation/story-15-4/independent-validation/check-candidate.py
```

Actual result: native exit 0; 26 checks passed, 0 failed. This command invokes only the inspected read modes:

```powershell
python .agents/skills/auto-bmad/scripts/story_plan.py --spec _bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md
python .agents/skills/auto-bmad/scripts/story_plan.py --find-spec --impl-dir _bmad-output/implementation-artifacts --story-key 15-4-time-reporting-filing-timesheet-review
git diff --check
```

All three actual subprocess exit codes were 0. Full absolute Python/subprocess arguments and the compact check results are in `machine-checks.json`; report bindings are in `report.json` and `sha256-manifest.json`. Source inspection is not runtime evidence.
