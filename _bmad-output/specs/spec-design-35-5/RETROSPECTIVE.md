---
date: 2026-11-02
verdict: rejected
criteria: declared
headless: true
---

# Story 35.5 retrospective

## Epic summary

This headless retrospective covers only the explicitly named `spec-design-35-5` folder and its sole ordered story, `35-5`. `stories.yaml` and the story frontmatter resolve one story with provisional `status: done`; `pending_stories: []`. The owner-approved one-run metadata batch permits this provisional closeout, but does not transfer acceptance to its future commit. The formal verdict below is about the current final-candidate gate, not a failure of the seven product ACs at accepted 37b.

Recorded pre-product baseline: `084bda7cac4315e70a4346d2d0f5549cda6328d6`. Inferred current committed end: `37b31f875fd9ce273642807c41a18010be6aa3c7`. The read-only `git_evidence.py` pre-pass measured that exact range: 14 non-merge commits, zero merges, zero binary revisions. Change volume is not current file size: AppShell added64/deleted40/net24 across four commits; the allocated browser test added601/deleted50/net551 across eight commits. Story metadata added328/deleted58/net270. Additional uncommitted closeout artifacts are assessed as provisional metadata, not silently included in the accepted commit range.

Evidence inventory: SPEC.md/CAP-1, ordered stories.yaml, current story and source binding; canonical delivery `../../auto-bmad/delivery/spec-design-35-5-35-5.json`; P6 automation assessment; P8 trace, NFR and test-review reports under `../../test-artifacts/35-5-closeout-*`; own three OPEN entries in `../../implementation-artifacts/deferred-work.md`; actual native CI, custody and owner receipts referenced by those artifacts. Primary source/test SHA256 remain `3ca754a3dffdad94f85028384ecbd24b21454fba407878fc691460a81bbea8df` and `171ab9d9bb4fc76cae268f212abe532d1d26bd4692d5781e5dc8c0b7f243816e`.

The committed source diff has exactly one production and one test path. No dependencies, database/schema, authority logic, gate policy or workflows were changed by this allocation. No sprint-status file was read or written. No prior retrospective existed in this named folder. Raw full session logs were not collected: process observations below use the authored story receipts and native artifacts, not inferred conversations.

## Findings

### Architecture and scope

**Accept as-is:** AppShell remains a thin presentation layer over the received server-filtered DTO. Contiguous sections preserve flattened order and supplied hrefs; the existing protected ordinary-link behavior and drawer primitives remain the operative seams. The sole product file is 394 lines. This assessment reuses earned distinct High authority/privacy reviews; it makes no new authorization decision. Sources: `src/components/app-shell/AppShell.tsx` section composition; story operative contract and Suggested Review Order; P6 assessment AC1–AC7; P8 trace product coverage7/7.

**Defer separately authorized test-quality work:** The allocated browser file is 1016 content lines. Native headless test review retains its literal H5 size threshold and H3 conditional assertion findings, plus M1 readiness and L1 semantic-selector findings: 2 HIGH, 1 MEDIUM, 1 LOW; score92/A, derived advisory Request Changes. These are fixed-rubric test-quality observations, not established introduced production defects or CI failures. Isolation scored100. No test refactor is authorized in this metadata batch. Source: `../../test-artifacts/35-5-closeout-test-review.md` and summary JSON. Absolute-size observation is not a god-class verdict; no repository-wide duplication or dependency scan was performed.

### Evidence and runtime seams

**Accept the corrected mechanisms; retain the lesson:** Actual native failures exposed a hidden-role focus locator, broad helper import/alias incompatibility and configured browser Auth proxy origin differences. Fixes followed the actual seam rather than changing product authority. Stale-link verification now asserts the real rendered href and uses a fresh protected document under the same cookie context; it proves server denial/no data/fresh reduced projection, not native-popup behavior. Source: story runtime correction sections and commits `c8628867`, `6f2190fa`.

**Process lesson:** Shared shell geometry changes can consume an inherited workspace's vertical budget. Actual Job16.5-E01 phone evidence measured92.375 against unchanged >=96 on both attempts. The bounded outer-header vertical-gap correction retained the existing job assertion and feature body; later ordinary80 passed. Do not promote the earlier arithmetic prediction96.375 into a runtime measurement. Source: story phone-content-height receipt; commit `05cba5db`; qualified ordinary PR native report.

**Process lesson:** A healthy empty state requires an admitted fixture. The existing MyDay read requires an active owned profile; an unprofiled fixture's denial is not healthy empty evidence. The two connected capture cases reused the existing owned-profile pattern and the earned High-reviewed profile-before-Auth cleanup ordering. All captures remain fail-closed until context closure, own registered profile cleanup, all ten strict owned Auth deletions and paired cleanup succeed. Source: story capture admission receipts499–507; commit `37b31f87`; P6 fixture/privacy assessment and distinct custody review. This retrospective introduces no new query or cleanup semantics.

**Accept limits, not causal invention:** A transient bounding-box null was observed in an earlier run; Suspense/focus handoff was only a possible explanation. Later passes do not prove that root cause. The retrospective records the failed evidence without creating a speculative product defect. Source: story failed-candidate receipts and subsequent native dashboard reports.

### Declared acceptance and unresolved evidence

Seven product ACs are FULL at accepted37b. Trace nevertheless reports CONCERNS because `E35-5-GATE-FINAL` is PARTIAL: final metadata-head CI/captures/package/digest/owner acceptance/clean controller and applicable completion admission are not yet earned. Combined trace P0=2/2, P1=5/6 and overall7/8 are the actual native gate calculation, not a product-AC denominator change. Source: `../../test-artifacts/35-5-closeout-gate-decision.json`.

NFR overall CONCERNS/MEDIUM preserves7 PASS,16 CONCERNS,0 FAIL. Unknown quantitative performance, operational, coverage/duplication, scan and telemetry measurements are not passes; scoped authority/session/custody/regression evidence passed. Source: `../../test-artifacts/35-5-closeout-nfr-assessment.md` and summary JSON. No new introduced NFR breach was established; no broad compliance or performance claim is made.

Two inherited visible child limitations remain disclosed: NotificationPreferences' inline mandatory caption lacks a gap, and NotificationBell's controlled failed read displays error together with empty copy. Earned High comparison established unchanged child blobs at084/fd95/37b. The error capture is controlled undispatched local GET500, not proof of healthy backend-empty knowledge. No child-path fix, waiver or generic clean-bill claim is made. Source: canonical delivery reconciliation and owner-reviewed visual package.

### Review scope

The skill's broad diff-review and fresh behavior portions are narrowed by the explicit metadata-only assignment and completed review cap. Earned independent source/fix, custody, package and actual image reviews are reused because source/test dependencies are unchanged; no additional broad `bmad-review` round or new application runtime is claimed. One Low read-only delegate supplied ordinary aggregate observations with source references; High judgments above are quoted earned evidence. This is evidence synthesis, not a fresh security or implementation review.

## Behavior verification

No application was launched and no test executed in this retrospective. Actual direct37b dashboard evidence already exercised79 cases, zero failures/skips/flakes: original15 functional role cases plus12 appended capture cases passed retry0, producing31 originals after strict cleanup. Required PR run41334064672 passed all five native jobs. Ordinary80 ran at GitHub test-merge `5f593c8f26be6393fd46edb1cb295251bee88580`, whose tree `a122ddf3d0adb823794bc4eff055ecb2b29bfdd2` exactly matches37b; it is qualified PR-merge evidence, not literal37b metadata. Units3780 passed; integration2163 passed with52 pending of2215, pending earns no coverage; dedicated recovery1 passed. Seven allocated role/RLS assertions passed.

Owner comment6571422748 authenticated user53317458 accepted exactly37b and digest `e997b6de5a9a06099ef093116f36248360bff9b0040ddcefab38ef27cc410fd6`; clean controller returned native0 owner-manual accepted. The reference basis is limited historical common chrome plus separate blank Login and written35.5 targets, not whole-feature mockups. These results do not establish the future metadata batch head. Optional remaining exhaustive release work was cancelled and earns no pass.

## Previous-retro follow-through

No earlier RETROSPECTIVE.md existed in this folder. Other stories' action items and the198 historical ledger entries are outside this reconciliation. They were preserved byte-for-byte; only ownREL1–3 were appended. No previous action status or sprint state is changed.

## Action items

1. **Required closeout — root/Coordinator:** Commit the reviewed authorized metadata batch, obtain fresh final-head required CI and actual capture package, exact-digest authenticated owner acceptance and clean controller/admission before completed return or merge. Proposed next action, not executed here; acceptance of37b never transfers. Source: trace final-candidate condition and approved batch sequencing.
2. **Release matrix — UI and QA/accessibility owners, named by Coordinator:** Execute own OPEN REL1/REL2 device/composite/contrast/reflow/manual keyboard/screen-reader/daylight qualification for a named release candidate. Selected desktop/360×640 evidence is not exhaustive coverage. Source: ledger IDs198/199 and canonical delivery.
3. **Release assurance — Coordinator:** Consolidate REL3, inherited limitations and E16/E20 caveats; assign approved quantitative/operational assurance targets and retain actual outcomes and separate release approval. Source: ledger ID200 and NFR report. This is release work, not deferral of mandatory final-candidate verification.
4. **Proposed test-quality follow-up — test owner/Coordinator:** Separately disposition native92/A advisory Request Changes and its four exact rubric findings, retaining all existing behavior/custody assertions if future refactoring is authorized. No code remediation is auto-applied or required by this metadata batch solely from these heuristics. Source: test-review report.
5. **Proposed process improvement — BMAD process owner:** Before the next frontend run, resolve canonical delivery/status metadata closeout sequencing explicitly so accepted-head checks do not require an unplanned policy interpretation. The present one-run human batch approval is not a standing exemption or policy edit. Source: owner-approved closeout sequencing proposal and completion policy canonical-record/pre-transition rules.

Action-item count: 5. All are proposed/remaining, not completed by this document. No action is assigned an invented person or time estimate.

## Acceptance verdict

**rejected** — declared criteria are the operative AC1–AC7 plus mandatory candidate-bound development acceptance. Product criteria are met at37b, and `pending_stories: []` reflects the provisional story metadata. However the final-candidate condition is explicitly blocking and unresolved; the retrospective rubric therefore prevents accepted/accepted-with-open-items at this snapshot. This is not a finding that the seven product ACs failed, a reversal of owner37b acceptance, a release decision or a waiver. Root may continue the authorized metadata process, but must earn final-head proof and reconcile this verdict against that evidence before claiming final completion.

## Open questions

None about scope or authority. The remaining final-head condition requires actual evidence. Named release owners and performance/operational targets remain Coordinator assignments recorded in the release ledger/NFR report.

## Assumptions

- Explicit `-H C:/DEV/K35-5-shell/_bmad-output/specs/spec-design-35-5` selects stories mode. No sprint-status detection/update is used.
- Ordered stories.yaml contains only35-5; current story frontmatter is provisionally done, so pending_stories is empty. This does not establish accepted future-head delivery.
- The end of the source range37b is inferred from current committed history; uncommitted authorized metadata is described separately.
- The machine verdict is rejected because final-candidate evidence remains blocking, without inventing a human override of that verdict. Earlier owner acceptance and the batch sequencing decision have their exact, limited meanings.
- Each of the five action items is proposed from sourced evidence, not a confirmed implementation instruction or completed action.
- Raw session logs, full dependency/duplication scans, new runtime, exhaustive device/manual/NFR measurements and previous-epic action verification were not performed. Their absence is not a clean result.
- No SPEC, stories.yaml, story, sprint, source, test, Git or policy mutation is part of this retrospective. The sole output is this document; workflow.on_complete is empty.