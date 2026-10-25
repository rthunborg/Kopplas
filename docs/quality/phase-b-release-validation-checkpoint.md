# Phase B release validation and stabilization checkpoint

Owner decision — 2026-10-22. **Status: PENDING; not executed.**

## Trigger and ownership

- [ ] **Final Phase B release validation and stabilization milestone.** Open when all approved current Phase B epics are development-complete and integrated. Completing those epics does not complete this checkpoint.

The Coordinator is accountable for opening the checkpoint at that trigger, assigning named QA and UI reviewers, and obtaining the owner's release decision. The checkpoint has no fixed calendar date. The [process roadmap](../planning/post-phase-a-plan-2026-07-08.md#9-process-roadmap-session-sequence) and [completion policy](../process/development-completion-policy.md#final-phase-b-release-checkpoint) retain this obligation for future delivery sessions.

**IN:** validation and stabilization of approved Phase B behavior and its deferred release checks. **DEFERRED:** Phase C product features and the separately parked full legal/GDPR program. This checkpoint does not activate that scope or create commitments to implement future seams.

## Pending checklist

- [ ] **Consolidate the release inventory.** Read all applicable epic [delivery records](../../_bmad-output/auto-bmad/delivery/) and deferred-work records. Carry forward every `deferred_release_validation` entry with its originating epic/record, scope, owner, status, evidence and next action. Reconcile superseding records without losing history or double-counting work. Record any missing inventory or ownership as an open item; the inventory is not claimed complete by this document. E16 currently contributes 14 tracked entries in its [final follow-up record](../../_bmad-output/auto-bmad/delivery/epic-16-external-followup-2026-10-21.json), covering broader matrices, visual checks and manual walkthroughs; these are not 14 known bugs.
- [ ] **Qualify the candidate and environment.** Record the exact integrated candidate revision, approved Phase B scope, configuration and representative test data, plus the environment and owners needed for credible validation. Surface unresolved readiness dependencies rather than assuming them satisfied. Environment creation, provider changes and deployment retain their existing authorization gates.
- [ ] **Execute deliberate release CI.** Follow [CI policy](ci.md) with `release_validation=true` against that candidate. Retain actual full browser-suite and dashboard results, executed/skipped counts and retry evidence. This input requests broader CI; it neither completes manual validation nor sets `release_ready`.
- [ ] **Complete the broader UI and workflow checks.** Execute the recorded role/device/browser matrices, design-system and accessibility review, connected phone layout checks (including 360×640), keyboard navigation, screenshots/visual comparisons and manual walkthroughs. Include representative cross-module journeys across the completed Phase B scope. Preserve per-item results and reviewer evidence rather than checking off a category from one unrelated passing journey.
- [ ] **Resolve findings and verify repairs.** Preserve known functional uncertainties and distinguish unproven observations from established defects. Do not waive consequential functionality, authorization, tenant isolation or data-integrity failures as polish. Allocate bounded repairs within approved scope, obtain independent review and rerun relevant checks. Bind evidence to the final candidate; after changes, explicitly assess which earlier evidence remains applicable.
- [ ] **Reconcile wider release readiness.** Check applicable existing NFR, security, recovery and operational readiness requirements and their actual evidence/approvals. Keep unresolved dependencies visible; this checkpoint is not a substitute for them and does not expand Phase B into deferred product or legal-program work.
- [ ] **Record the release decision.** Every applicable recorded release item must be passed with evidence, and explicit owner release approval must be recorded in `release_approval`, before the applicable delivery record may claim `release_ready=true`. Record the candidate, results, responsible reviewers and any remaining blockers. Until then retain `release_ready=false` truthfully.

## Meaning of completion

`release_ready` is an evidence conclusion, not a feature flag or deployment switch. False means release validation or approval is outstanding; it does not undo development completion or mean the merged implementation failed. An epic-level true claim alone does not establish whole-product readiness. The delivery gate validates the record contract; independent review must check the truth and applicability of the evidence.

Neither completing this checkpoint, running release CI nor changing the flag authorizes a merge, deployment, schema application or provider configuration change. Those actions retain their separate approval gates. This document records future work only; it starts no validation run or automation now.
