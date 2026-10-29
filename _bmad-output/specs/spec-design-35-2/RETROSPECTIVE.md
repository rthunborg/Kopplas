---
date: '2026-10-29'
verdict: accepted-with-open-items
criteria: declared
headless: true
---

# Story 35.2 adapter retrospective

## Epic summary

This retrospective covers only the approved single-story `spec-design-35-2` adapter, not the whole E35 epic. `stories.yaml` contains only `35-2`; it is both first and last. The declared criteria remain E35-2-AC1–AC7 in the adapter and its unchanged canonical source. The historical canonical preparation status is not current execution status.

Accepted product head: `f598bb18b4322bf55ac89db6db69a41f3eb6bfd8`; PR [115](https://github.com/rthunborg/Kopplas/pull/115) merged as `8f9bcf8d2a0cd8a2b65fa7ad6c1fd7e236b85ff9`. The recorded accepted PR comparison is `d281eef1c5ac3e8ca97871380e25146c70d2d754..f598bb18b4322bf55ac89db6db69a41f3eb6bfd8`. The adapter's planning baseline `5b167f1be0b3d96c1d7e9d53737211e3008eeb7e` is preserved; the accepted comparison is used here to avoid mistaking intervening main governance changes for new product work. `git_evidence.py` measured 19 commits, one merge, and one measured merge; commit-subject attribution is incomplete (some story commits do not use `35-2` spelling), and merge churn must not be added to non-merge churn.

Evidence inventory:

- [Execution adapter](stories/35-2-tokens-font-and-real-login.md), [scope](SPEC.md), `stories.yaml`, and `source-binding.json` provide the unchanged declared contract.
- [Canonical delivery record](../../auto-bmad/delivery/spec-design-35-2-35-2.json) records actual exact-head verification, independent review and deferred release work.
- [Preserved pre-closeout adapter](../../../docs/quality/story-35-2-closeout-2026-10-29/adapter-before-closeout.md) retains failed/blocked checkpoints.
- [Native CI run](https://github.com/rthunborg/Kopplas/actions/runs/40846238540), [owner acceptance](https://github.com/rthunborg/Kopplas/pull/115#issuecomment-6493666971), and [retained evidence commit](https://github.com/rthunborg/Kopplas/tree/8780be7d6098a8cdd1c93f2c6dc9d1c3bb89e668) bind the accepted product evidence.
- The trusted Coordinator handoff identifies fresh exact-head High review `01a1871c-8702-75f2-a70b-977ed21a74cb` as PASS. This retrospective did not rerun that review or infer a review-round count.
- Full implementation conversation logs were not independently retrieved. Process lessons below use retained artifacts, not invented participant feedback or motives.

Completeness rechecked after the legitimate author closeout: `story_plan.py --stories --spec-folder` returned one story, `story_file_status=done`, `all_done=true`, `hard_stop=false`, warnings empty, and both first/last flags true. Final `pending_stories=[]`. The working draft initially recorded rejection while the adapter was unfinished; this current result supersedes it without relabeling prior blocked checkpoints. Terminal pipeline/state closure remains the Coordinator's separate responsibility.

## Findings

| ID / view | Evidence and lesson | Instance disposition | Prevention |
| --- | --- | --- | --- |
| R1 — spec / execution reconciliation | Product acceptance and merge did not finalize the installed workflow. The retained minimum record explicitly said `canonicalBmadFinalized=false`; the pre-closeout adapter remained blocked. The canonical delivery refresh now carries exact-head evidence rather than relabeling earlier failures. Sources: delivery record `contract_reconciliation`; preserved adapter; current adapter frontmatter. | Adapter/delivery instance resolved through supported author closeout and independent High process review; terminal state remains Coordinator-owned. | Bind delivery, actual phase receipts, adapter status and retrospective separately; a merge is not a workflow receipt. |
| R2 — evidence provenance | Owner acceptance names exact `f598` and digest `3bbc67867a5d74ae69a1a4298493cf2747ec3c3e37df162a992b02cd4fc4c94b`. Earlier publisher undefined-digest and JobsPage metadata failures are historical; corrected acceptance is current. Sources: owner comment6493666971 and delivery `Authenticated current-head frontend acceptance`; evidence commit8780be7d. | Accept corrected current package; preserve old records. | Verify publisher digest and page metadata before requesting acceptance; changing metadata requires refreshed binding and review. |
| R3 — verification boundaries | Native integration recorded 2,146 pass / 52 pending / 0 fail; isolated storage separately passed once; browser recorded 73 expected / 1 flaky / 0 unexpected / 0 skipped. Sources: delivery checks and native run40846238540. | Accept bounded development evidence; retain pending and retry disclosures. | Report executed counts and separate lanes; do not convert pending tests or retries into clean first-attempt coverage. |
| R4 — release boundary | The delivery record retains exhaustive device/composite/reflow, manual accessibility/daylight and final Phase B release obligations with `release_ready=false`. Owner manual acceptance is not a configured independent vision-provider run. | Defer to the named release obligations below. | Keep development completion and release approval distinct; assign accountable people before release execution. |
| R5 — current audit qualification | [Phase 8 receipt](../../test-artifacts/story-35-2-closeout-2026-10-29/phase8-tea-result.json) records trace PASS (16/16), advisory NFR CONCERNS and advisory test-review Request Changes (71/C). NFR unknowns cover operational/performance targets and metrics; test-review observations concern deterministic fixture/viewport selection and test structure, with no demonstrated production defect or new behavior-coverage gap. | Accept bounded development evidence with advisory qualifications preserved; no advisory verdict is relabeled passed. | QA/test owner should assess the recorded rubric suggestions when the affected tests are next changed; Coordinator retains unknown operational/release qualification in the final release assessment. Do not generate speculative tests or product work from rubric labels alone. |

Architecture delta, duplication, size-growth and pattern-divergence analysis are narrowed to the existing accepted review and retained evidence. This process-only closeout does not add runtime code, re-open broad product review, or assert that an unperformed fresh aggregate scan was clean. The unchanged-head review reuse follows `docs/process/development-completion-policy.md`. No new `bmad-review` pass or runtime exercise is authorized in this closeout; independent review of the process artifact remains separate.

## Behavior verification

Actual current Phase 6 evidence: [automation receipt](../../test-artifacts/story-35-2-closeout-2026-10-29/phase6-automate-result.json) and [summary](../../test-artifacts/story-35-2-closeout-2026-10-29/automation-summary.md) record a newly executed gap-analysis workflow with no additional tests warranted, no product-test execution now and no resource launch. This does not claim that historical CI ran TEA. Current Phase 8 audits also executed: [traceability](../../test-artifacts/story-35-2-closeout-2026-10-29/traceability-matrix.md), [NFR assessment](../../test-artifacts/story-35-2-closeout-2026-10-29/nfr-assessment.md) and [test review](../../test-artifacts/story-35-2-closeout-2026-10-29/test-review.md). Their completed markers mean execution, not universal approval: trace PASS 16/16, NFR CONCERNS advisory, test review Request Changes advisory 71/C. The static inventory of 23 cases (9 handler and 14 browser) is not a new runtime count. The receipt records zero new test runs/files/resources.

No runtime was launched or exercised by this retrospective. Existing actual evidence is reused at the unchanged accepted product head: 3,744 unit passes with no failures/skips; required database lane 2,146 passes, 52 pending and no failures; isolated recovery storage one pass; production-server browser 73 expected and one flaky eventual pass, no unexpected results or skips. The delivery record identifies exact jobs/artifacts and the pending-test breakdown, including unchanged E15 caveats.

Actual production captures comprise 18 actuals and 18 references at bounded desktop/phone states. The controlled login scenarios intercepted two requests with zero provider forwards; those scenarios alone do not prove provider authentication. The separate normal public-anon SDK and protected current-user/tenant checks supply that bounded authority evidence. Owner comment6493666971 accepted the exact digest; this document neither requests new manual acceptance nor claims exhaustive device or assistive-technology validation.

## Previous-retro follow-through

No earlier retrospective exists for this adapter. This stories-mode closeout does not inspect or change global sprint action statuses. No assertion is made about unrelated epics' outstanding actions.

## Action items

Proposed and tracked; this retrospective grants no product or deployment authorization.

1. **E35-2-REL-1 / UI owner; Coordinator assigns a named person:** on the nominated release candidate, execute remaining exhaustive device, composite contrast and reflow checks, recording candidate-bound results. Current bounded acceptance remains valid within its scope.
2. **E35-2-REL-2 / QA/accessibility owner; Coordinator assigns a named person:** execute the remaining manual keyboard, screen-reader and daylight plan on the nominated release candidate, preserving actual outcomes and gaps.
3. **E35-2-REL-3 / Coordinator:** consolidate the final Phase B release ledger, preserve existing E16/E20 caveats, name the release candidate and obtain separate release approval after applicable checks. `release_ready` remains false.

Items 1–3 are separate release obligations, not a blanket block on Story 35.3 readiness. Story 35.3 still requires its own approved scope, ownership and admission; this retrospective does not authorize its implementation.

## Acceptance verdict

**accepted-with-open-items**. Criteria are declared. The authoritative single-story adapter is now done, with `pending_stories=[]`; exact-head CI, accepted production evidence and the existing independent High product review support development acceptance. Canonical delivery and supported author closeout were independently reviewed. The three named release obligations remain open with role owners and concrete next actions. This is a machine retrospective judgment based on evidence; it does not invent a new human acceptance or claim `release_ready=true`. Terminal process-state finalization and independent review of this final retrospective remain Coordinator-owned.

## Open questions

The Coordinator must name people for the UI and QA/accessibility release roles before those obligations are executed. Full release candidate and approval remain separate decisions. Missing implementation conversation logs prevent conclusions about participant motives or unrecorded feedback.

## Assumptions

- Headless stories mode was explicitly assigned for this single-story adapter. No sprint-status write, global tracker change, canonical source edit or whole-E35 acceptance is permitted.
- Initial drafting had `pending_stories=[35-2]` and an interim rejected verdict. Final supported recheck after author closeout returned one done story, `pending_stories=[]`, `all_done=true`, no warnings; the machine judgment is now accepted-with-open-items.
- Native CI and owner acceptance facts are retained exact-head evidence, checked against the installed canonical delivery record; this delegate did not re-fetch remote services or re-run product tests.
- The evidence-only TEA closeout executed as a separate current operation; its Phase 6 and Phase 8 receipts distinguish actual audit execution from reused CI and unchanged product tests. Historical ATDD/TEA artifacts alone are not represented as newly executed skills. Advisory NFR/test-review results remain qualified.
- Each action above is a proposal with its stated role owner. Role ownership is not an invented named-person assignment.
- No extra human feedback, fresh configured-provider result, independent review round count, merge/deployment permission or next-story implementation approval is inferred.
