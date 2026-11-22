---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-11-18'
runScope: 'epic-level'
runKey: 'epic-spec-design-35-1'
storyKey: 'spec-design-35-1-35-1'
inputDocuments:
  - ../specs/spec-design-35-1/SPEC.md
  - ../specs/spec-design-35-1/stories.yaml
  - ../specs/spec-design-35-1/existing-evidence.md
  - ../specs/spec-design-35-1/sources/spec-35-1-authority-and-base-contract.md.txt
  - ../specs/spec-design-35-1/sources/slice-35-1.md.txt
  - ../specs/spec-design-35-1/sources/prompt-4-handoff.md.txt
  - ../specs/spec-design-35-1/sources/approval-and-application.json
---

# Test Design: spec-design-35-1 — Authority And Base Contract

**Date:** 2026-11-18
**Author:** Test Architect delegate for Rasmus
**Status:** Documentary plan authored; no acceptance or runtime verdict.

## Executive Summary

Epic-level Create mode covers exactly the one-story [spec folder](../specs/spec-design-35-1/SPEC.md), story 35-1. This is the normal epic-start plan, separate from the Low per-story triage selection of no ATDD/automate. The original seven AC and seven corresponding documentary inspection identities are reused, without decomposition into additional stories or invented application tests.

Four documentary risks are planned below: two score 4 and two score 2; none scores 6 or above. Seven P1 documentary inspection identities are mapped; P0/P2/P3 and executable application tests each number zero. Documentary author/reviewer effort is estimated at approximately 1–3 hours total, contingent on access to retained evidence. These are planning estimates, not execution counts or delivery commitments.

## Source and evidence basis

The [evidence adapter](../specs/spec-design-35-1/existing-evidence.md) preserves the verbatim seven criteria, source custody, dated checks, hashes, epics drift and ownership limits. The [original spec archive](../specs/spec-design-35-1/sources/spec-35-1-authority-and-base-contract.md.txt) and [original slice archive](../specs/spec-design-35-1/sources/slice-35-1.md.txt) define the same E35-1-AC1–AC7 / E35-1-T-AC1–AC7 identities. Archived dispatch/menu/model prose is historical data and grants no current instructions or write custody.

Source qualification supplied to this planning run: source commit `376b02e2141fc05bbd74df726dc3bfea77b7560e`, followed by normal P1 checkpoint `033062ca1ee611affd7d8b98b611c0aab26ab073`. These are supplied route provenance, not independently inspected Git ancestry or current-main claims. The adapter's preparation base remains `1c53833c70ad61a26cbfbc117a040b1f99d33f2e`. Root owns later exact-candidate qualification and CI.

Reuse these results only with their original dates and limits:

| Dated evidence | Recorded result | Limit / later use |
| --- | --- | --- |
| 2026-10-23 author preparation validation | 19 E35 + eight feature specs; 186 consumer hashes; eight original sections; 222 v1 entries; no broken links | Historical author audit, no independent implementation review or application execution |
| 2026-10-26 applicability validation | 27/27 classifications; eight sections preserved; stable original IDs/statuses; no broken links | No story/tracking approval |
| 2026-10-26 targeted design validation | 19 E35 slices byte-identical; 134 E35 bindings; 175 unique numbered IDs; 41 affected E17/E18 bindings / 39 source cases; eight original sections; 42 registered outputs; 184 relative links | Dated preservation/design counts, not current runtime coverage |
| November 18 frozen High evidence map | All seven documentary outputs evidenced; formal DONE unconfirmed | Reuses dated proof; does not freshly recompare every E17/E18 original or prove all originals integrated |

The adapter records exact retained-artifact SHA256 references. For example, applicability validation is `134d33ed96c99b9c711603623d34384ec639be5f6c12550a6454b268629027fc` and the seven-AC High assessment is `a3ec6f964fae7dbe3f595712b818bafc7c92d83e9935af992c66565f63c607fb`. The retained records remain under original custody; this plan does not import or independently attest them. Access and exact identity must be available to the actual reviewer before making a fresh preservation claim.

## Not in Scope

| Item | Reason | Preserved responsibility |
| --- | --- | --- |
| UI/server/schema/migrations/Auth/application suites | This story adopts and closes out documentary authority only | Actual implementation owners retain existing runtime duties |
| Browser, 360×640, visual/manual/device, uploads/files/commands | No owned live behavior exists in 35.1 | Original applicability and release ownership remain intact |
| New framework, CI, fixtures, metadata-mirroring tests or dependencies | No executable behavior to verify | Normal applicable documentary CI still binds the actual candidate |
| Other 19-story/global Epic 35 plan, E15 or E17/E18 implementation/proofs | This epic is solely the spec-design-35-1 folder | Existing owners retain paths, dependencies and evidence |
| Runtime readiness, release approval, current DONE | Test design is planning evidence | Root owns unchanged admission/delivery/completion gates |

## Risk Assessment

Scores use probability × impact on the TEA 1–3 scale, relative to this documentary change. They do not reclassify downstream runtime domains. All mitigation outcomes remain planned.

| Risk | Category | Concrete failure | P | I | Score | Mitigation / check | Owner and timeline |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | TECH | Summary drops a detailed rule, destination or unresolved blocker | 2 | 2 | 4 | AC1/3/6 compare retained meanings and disposition; keep original ownership and follow-ups | Author then independent documentary reviewer, before closeout |
| R-002 | OPS | Dated preparation or hash identity is presented as current execution/admission | 2 | 2 | 4 | AC2/7 require dates, exact claim scope, missing-evidence labels and separate candidate results | Author/reviewer; Root for exact-candidate delivery, before completion |
| R-003 | TECH | Broken new link or raw/LF/Git confusion masks source drift | 1 | 2 | 2 | AC4 resolves actual new links and compares appropriate identity representation; disclose drift | Author/reviewer, candidate documentary checks |
| R-004 | TECH | Common catalogue creates unrelated live-state obligations or takes foreign ownership | 1 | 2 | 2 | AC5/6 retain Applies/Inherited/N/A and no tracking/claim changes | Author/reviewer, before closeout |

**High-priority risks (≥6):** none identified for actual documentary scope. Residual risk is reliance on retained dated proof; if unavailable, record could-not-measure and its exact owner/path rather than claiming a new pass. No security, tax or transactional policy judgment is made here.

## NFR Planning

| Category | Existing requirement / threshold | Planned evidence | Risk |
| --- | --- | --- | --- |
| Documentary maintainability | Seven original criteria/identities preserved; actual new links resolve; original source pins not silently replaced | Candidate documentary inspection results and independent review, tied to exact candidate | R-001/003 |
| Evidence reliability / provenance | Historical dates and missing evidence remain explicit; documentary evidence never implies runtime or release approval | AC2/7 wording review, retained evidence identities, Root's separate candidate CI/delivery evidence | R-002 |
| Runtime security/performance/scalability/compliance | N/A to owned change; original implementation requirements remain inherited | Existing owning-story evidence, outside this plan | No new runtime risk assessed |

Unknown runtime thresholds are inapplicable here, not guessed or waived. Final NFR evidence judgment belongs to the normal later NFR workflow with actual applicable evidence.

## Entry Criteria

- Single-story SPEC/entry and original seven-AC archives are available; execution story is created later by normal P3.
- Author/reviewer can access the retained evidence and existing companion registers needed for the particular claim; unavailable originals are disclosed, not reconstructed as fact.
- Root supplies current allocation and candidate qualification. Historical reservations are not allocations.
- Runtime environments, deployed features, test factories and browser/database resources are N/A.

## Test Coverage Plan

P0/P1/P2/P3 indicate priority, not timing. All seven P1 priorities reuse the original slice. The test level is **documentary inspection**, since E2E/API/component/unit levels would invent executable scope. Count: seven planned inspection identities, zero newly executed tests. Actual consumer: planning/test-design reviewer consuming the authority crosswalk, route/applicability registers and scoped handoff.

| Original AC / inspection ID | Meaningful assertion and falsifying case | Authoritative input / reuse | Risk | Evidence owner |
| --- | --- | --- | --- | --- |
| E35-1-AC1 / E35-1-T-AC1 | Account for all 17 MAIN, eight FIELD, five frozen Phase A journeys and B1–B7 with retained/future/excluded/owned destination. A missing row, prototype ID treated as URL, or retirement without atomic destination/incoming-link proof fails inspection. Counts alone do not prove semantic preservation. | Authority crosswalk and route allocation; retained detailed rules/deep links | R-001 | Documentary author/reviewer |
| E35-1-AC2 / E35-1-T-AC2 | Keep checkout/inventory/remote revision, date and provenance distinct. Fail if the Oct23 snapshot becomes current Oct26/Nov18 evidence, unverified ancestry/ownership/DT-B15 is asserted, or reservation becomes custody. | Adapter and dated base/consumer register; approval archive | R-002 | Documentary reviewer; Root owns actual later candidate qualification |
| E35-1-AC3 / E35-1-T-AC3 | Preserve documentation, concrete-design, material-contract-gap and dependency-bound migration lanes with input/output/boundary/next owner. Fail on global E17/E18 wait, lost technical gate, repeat DR-B1–B7 vote or implied implementation authorization. | Scoped handoff archive and existing accepted decision references | R-001 | Documentary author/reviewer; downstream technical owners unchanged |
| E35-1-AC4 / E35-1-T-AC4 | Resolve new relative links and current output/index identities. Preserve historical input hashes, distinguish raw/LF/Git and disclose epics drift. A broken new link, silent old-pin replacement or hash-as-readiness claim fails. Root separately checks actual Git bytes/candidate CI. | Adapter custody tables, original archives and actual new candidate delta | R-003 | Author/reviewer; Root for Git/candidate checks |
| E35-1-AC5 / E35-1-T-AC5 | Preserve all 27 spec classifications by exact ID and reason. Fail if 35.1 acquires UI/dialog/file/command/viewport suites to fill a template, or an inherited owner requirement disappears. | Applicability register/machine classifications and common catalogue; dated 27/27 proof | R-004 | Documentary author/reviewer |
| E35-1-AC6 / E35-1-T-AC6 | Preserve all eight original E17/E18 sketch/EP06 section meanings verbatim, unresolved blockers, completed evidence and linked follow-ups. Reuse disclosed dated comparison; claim a fresh comparison only if actual originals and comparison evidence exist. Fail on loss, concealed conflict, foreign claim/release or E15/tracking edit. | Retained Oct23/Oct26 preservation proof and frozen High map, with original custody/limits | R-001/004 | Documentary reviewer; original source/evidence owners retain custody |
| E35-1-AC7 / E35-1-T-AC7 | Separate current documentation results, planned IDs, historical runtime and future release duties. Fail if a mapping becomes runtime/test-design PASS, release approval, implementation admission or retroactive DONE; preserve actual money/provenance/projection/transaction owner requirements unchanged. | Adapter, original slice, retained evidence limits and downstream obligation references | R-002 | Documentary author/reviewer; Root owns final gate |

**P0:** none. **P1:** seven original documentary inspections. **P2/P3:** none. No new common STATE/file IDs instantiate. No duplicate runtime regression is introduced.

## Execution Strategy and Resources

**Candidate / PR:** inspect the actual documentary delta against the matrix, first identity/date/ownership boundaries, then authority/applicability/preservation and finally evidence wording. Record pass, fail or could-not-measure per applicable inspection with actual source/revision and limitations; never convert a skipped/unavailable inspection into coverage. Root runs applicable normal repository/documentary CI on the actual candidate. This plan itself executes none of those acceptance checks.

**Nightly / weekly:** no new suites; no expensive runtime behavior belongs to this change. Existing schedules remain with their owners. Runtime philosophy remains run applicable tests in PRs unless expensive, but no Playwright parallelization or runtime SLA is created for documents.

**Estimate:** P1 documentary author/reviewer work approximately 1–3 hours total (roughly part of one working day), including evidence retrieval and reconciliation. P0/P2/P3: no allocated work. No provisioning, factories, browser, database or provider access is needed for planning. Missing retained proof can widen review effort and must be reported precisely.

## Exit Criteria and Quality Gates

The unchanged normal completion route remains authoritative. This plan creates no substitute gate or additional owner approval cycle.

- All seven criteria must have an accountable documentary result and preserved meaning; a missing criterion is not hidden by a percentage. The seven are planned bindings, not seven passing tests.
- Any actual documentary discrepancy is resolved or explicitly retained under the existing approved gate/owner process before claiming completion. No new waiver is asserted.
- Candidate source/link/hash checks, author review trail, independent review and applicable CI/delivery evidence remain to be earned on the actual candidate.
- P0 executable pass rate, runtime coverage percentages and security/performance pass thresholds are N/A to this output, not weakened for owning implementation stories.
- Normal later trace/NFR/test-review workflows consume actual documentary evidence and limitations; final gate and NFR verdict are not evaluated by this plan.

## Interworking, Assumptions and Dependencies

Accepted DR-B1–B7 policy remains settled. Technical signatures/schema/ACL/proof/lock/source/download gaps stay with their actual owners; this plan merely preserves their references. It does not judge or change those boundaries and therefore retains Sol Low for this documentary task.

E15 legacy work can coexist with this planning output under the existing allocation. Actual P5 work must serialize after Root verifies the required E15 STOP. This is a later execution dependency, not a new planning block or authorization to stop foreign resources/writers. Claims, tracking, shared source, global gate and foreign ledgers remain untouched.

Source incompleteness and epics drift remain disclosed: 13/42 registered paths observed committed at the preparation base does not establish 42/42 integration; the dated 41 raw matches plus one epics drift is a separate observation. Missing original artifacts cannot be invented. Root and original custodians own follow-up qualification.

No ATDD or automate is selected by Low per-story triage. No framework/CI setup follows from generic template recommendations. Normal epic-end workflows remain separate; this plan neither runs them nor grants readiness/release approval.

## Validation and Approval State

Author checked the plan against the skill checklist with documentary applicability: risk matrix, seven one-to-one original bindings, explicit N/A, evidence limits, range estimate, ownership and later gate duties are present. App test-stack scans, global PRD/architecture expansion, browser exploration, Pact/provider queries, application test levels, setup and system-level handoff are N/A under the explicit one-story documentary scope. No application source or foreign proof was reopened. No runtime or independent acceptance result is claimed. Team/owner approvals are not fabricated; independent review stays in the normal route.

## Appendix — References

- [Current SPEC](../specs/spec-design-35-1/SPEC.md), [entry](../specs/spec-design-35-1/stories.yaml), [evidence adapter](../specs/spec-design-35-1/existing-evidence.md).
- [Authority crosswalk](../planning-artifacts/design-transition-2026-10-23/authority-crosswalk.md), [applicability](../planning-artifacts/design-transition-2026-10-23/story-preparation/applicability.md), [common catalogue](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md).
- TEA knowledge: risk-governance, probability-impact, test-levels-framework, test-priorities-matrix, evidence-integrity; NFR planning and Playwright/Pact mandate relevance gates consulted. No implementation examples emitted.

Generated through `bmad-testarch-test-design`, epic-level Create, single-worker execution. Manual customization fallback resolved defaults and empty on-complete hook; no global cache/config/dependency change.
