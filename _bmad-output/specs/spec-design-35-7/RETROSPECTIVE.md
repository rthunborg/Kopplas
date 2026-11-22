---
date: 2026-11-10
verdict: accepted-with-open-items
criteria: declared
headless: true
---

# Story 35.7 retrospective

## Epic summary

The named spec folder contains one story, Settings and Manual Pricing. Its operative artifact is `done` after guarded delivery and trace. The ordered story list contains no unfinished items. The declared scope covers seven acceptance criteria and fifteen owned states. [Spec](SPEC.md) · [Operative contract](operative-contract.md) · [Story](stories/35-7-settings-and-manual-pricing.md)

The historical source baseline is `0dd0c4e0`. For delivered code, the provider merge parents establish the narrower operative range `f225e3e27c67ce5af2fc81156610e87c8c6ebd90..91635d3ddfc130df12d299a5743280dcbf5817f5`. It includes the original presentation merge and the pricing correction. The Git evidence helper found 17 commits, with both first-parent merges measured separately. The producer prerequisite precedes that range and has its own qualification. The process checkout at `a53c30a2` includes a later CRM harness merge and is outside the 35.7 product evidence boundary. [Producer qualification](https://github.com/rthunborg/Kopplas/actions/runs/42647750664) · [Presentation PR](https://github.com/rthunborg/Kopplas/pull/147) · [Correction PR](https://github.com/rthunborg/Kopplas/pull/148)

Available evidence includes source, the delivered diff, exact-head reviews and owner visual decisions, the exact-main native reports, and the story-local trace, NFR and test-quality records. The native verifier integrated the claim and the pinned finalizer closed the run at `91635d3d`. Full session logs were outside the retrospective scope. [Delivery](../../auto-bmad/delivery/spec-design-35-7-35-7.json) · [Main CI](https://github.com/rthunborg/Kopplas/actions/runs/42829233035)

## Findings

- **Spec and architecture.** The bounded presentation uses existing checked commands and authoritative reads. The delivered range changes the presentation, a local navigation guard, and tests. The separate four-file correction also touches the shared field primitive. The correction preserves entered raw pricing text through hydration and stale refresh, and displays one rate with its unit. The scoped verification ties the matching write to the authorized row and receipt. Disposition: accept the verified implementation. [Correction](https://github.com/rthunborg/Kopplas/pull/148/files) · [Trace](../../test-artifacts/story-35-7/closeout-traceability.md)
- **Review and test maintenance.** The original review rounds and the targeted correction review supply adversarial, edge and verification evidence at their recorded revisions. This retrospective reuses that trail and performs bounded scope reconciliation. It does not open another code-review round or assert a full dependency or duplication scan. The pricing browser spec has 2,682 lines and triggers the test review's maintainability rule. Disposition: defer any split to separately scoped test maintenance. [Delivery review evidence](../../auto-bmad/delivery/spec-design-35-7-35-7.json) · [Test review](../../test-artifacts/story-35-7/closeout-test-review.md)
- **Merge custody and exact evidence.** PR #147 merged before its local preparation step. Reconciliation required a reviewed one-time update, then the existing verifier and finalizer. Separately, early main runs exposed pricing regressions that were corrected in #148. The final main run and exact candidate visual decisions preserve both the failure history and the proof of recovery. Disposition: accept the completed reconciliation and retain the existing rule to prepare merge custody first. [Presentation merge](https://github.com/rthunborg/Kopplas/commit/8c85e054613304e06c05aa268a238299d36b5d47) · [Correction](https://github.com/rthunborg/Kopplas/pull/148) · [Main CI](https://github.com/rthunborg/Kopplas/actions/runs/42829233035)

## Behavior verification

Reused production-server Chromium journeys at desktop and connected 360×640. The exact-main run records 116 first-attempt passes with zero skips or flakes. It exercised company and terms persistence, manual pricing row identity and integer öre, protected navigation, stale and unknown outcomes, and reduced-height and 200% company-form reflow. All 138 scoped database checks passed without skips, and isolated recovery passed. The full database report separately records 52 pending cases. The owner accepted the original 78 captures and the correction's 40 affected pricing captures at their respective candidate revisions. No new runtime or manual device session ran for this retrospective. [Main CI](https://github.com/rthunborg/Kopplas/actions/runs/42829233035) · [Delivery](../../auto-bmad/delivery/spec-design-35-7-35-7.json) · [Trace gate](../../test-artifacts/story-35-7/closeout-gate-decision.json)

## Previous-retro follow-through

The 35.5 retrospective is available as historical context. Its action items were outside this named stories-mode run. No completion status is inferred for those items. [35.5 retrospective](../spec-design-35-5/RETROSPECTIVE.md)

## Action items

| Item | Owner | Next action |
|---|---|---|
| E35-7-REL-1 | UI owner | Assign a named owner and pinned release candidate for the wider physical device, contrast and reflow matrix. |
| E35-7-REL-2 | QA/accessibility owner | Assign a named owner to run and record manual keyboard, actual soft keyboard, screen reader and daylight journeys on supported devices. |
| E35-7-REL-3 | Coordinator | Consolidate the outstanding checks and inherited caveats at the Phase B release checkpoint and obtain its separate approval. |

These three items remain deferred. Future review of test-file size is advisory. [Delivery dispositions](../../auto-bmad/delivery/spec-design-35-7-35-7.json) · [NFR assessment](../../test-artifacts/story-35-7/closeout-nfr-assessment.md)

## Acceptance verdict

**accepted-with-open-items** against the declared development criteria. The named trace passed all seven acceptance criteria and fifteen owned states without a waiver. The NFR advisory is **CONCERNS**, and the bounded test review is **NOT_SCORED**. The three deferred obligations remain open and `release_ready` remains `false`. [Trace gate](../../test-artifacts/story-35-7/closeout-gate-decision.json) · [Delivery](../../auto-bmad/delivery/spec-design-35-7-35-7.json)

## Open questions

Named release owners and the release candidate remain to be assigned. The remaining manual and operational measurements belong to the Phase B release checkpoint.

## Assumptions

- Headless invocation explicitly selected `spec-design-35-7`. The ordered list contains only `35-7` and the operative frontmatter records it as `done`.
- The delivery range ends at the independently verified merged product revision. The later bookkeeping checkout supplies the closeout artifacts only.
- The verdict and the three tracked actions use the existing development and release scopes. There was no separate human override of this retrospective verdict. Stories mode writes only this retrospective and has no sprint-status transition.
