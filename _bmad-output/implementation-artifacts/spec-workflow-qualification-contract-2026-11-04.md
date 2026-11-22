---
title: 'Define CI qualification responsibilities and supported early rehearsal'
type: chore
created: '2026-11-04'
status: in-review
review_loop_iteration: 0
baseline_commit: 4824c4c1a6acf3e10b4227604b13b2fa304d80e1
context:
  - '{project-root}/docs/process/review-order.md'
  - '{project-root}/docs/quality/ci.md'
---

<frozen-after-approval reason="human-owned intent — approval outstanding">

## Intent

**Problem:** E1–5 show overlapping source/merge workflows with different outcomes and long Windows runs. Treating all green runs as interchangeable or summing their durations misstates both qualification and delay.

**Approach:** Publish a single responsibility table for current required checks, evidence identity and local early feedback. Preserve current gates while removing duplicated observers/dispatches and unclear evidence packaging. This story is documentation and operating practice, not gate removal.

## Boundaries & Constraints

**Always:** Synthetic merge owns integration, immutable source admission stays required where adapter requires it, ordinary product CI/human acceptance remain distinct. Actual executed/skipped counts and native outcome retained. No claims of local equivalence without proof.

**Ask First:** D1 tranche acceptance; changes to current required checks, trigger paths, fail-fast policy or permitted evidence reuse need separate D2 decision.

**Never:** Branch protection/provider changes, renamed or skipped gates, dependency upgrades, reducing assertion coverage, experimental full CI dispatch without separate execution assignment, foreign/demo resources.

## I/O & Edge-Case Matrix

| State | Expected disposition |
|---|---|
| Direct source passes, PR merge fails | Integration blocked; exact failing identity retained. |
| Same tree but different checkout/index | Separate evidence, no automatic substitution. |
| Mocks pass, required DB unavailable | DB obligation remains unearned. |
| Another observer/test owner active | Reuse their result/status; no competing poller/test launch. |

</frozen-after-approval>

## Code Map

- `docs/quality/ci.md`, `docs/process/local-setup.md`, `docs/process/parallel-auto-bmad.md` — canonical route and evidence documentation.
- `.github/workflows/auto-bmad-parallel.yml` (PR/push and workflow_dispatch), `.github/workflows/ci.yml` — read-only sources of jobs/identities; names must be verified at adoption head.
- `scripts/maintenance/admit_story35_6_runtime.py` — immutable evidence acceptance, `validate_request`, `readonly_database`, `validate_only`; read-only here.
- `package.json`, `.nvmrc`, `scripts/ci/with-calendar-feed-runtime.mjs`, `tests/maintenance/test_admit_story35_6_runtime.py` — actual commands/runtime source of truth.

## Tasks & Acceptance

- [x] Inventory required check names/events, source/base/synthetic merge bindings, execution order, count/skip policy and owning observer at actual assigned head; explicitly reconcile older primary documentation.
- [x] Adopt rehearsal-matrix.md into canonical CI/local setup docs with exact verified commands and examples. Distinguish implemented commands from optional exact-logic extraction.
- [x] Define change-sensitive feedback: scope/docs checks for docs; focused actual unit/contract cases for affected code; full required hosted set at integrated candidate. Unknown impact defaults to current comprehensive route, never automatic skip.
- [x] Add one evidence record example for E1–E3 with union elapsed30m30 versus runner98m42, and source/merge disagreement refusal.
- [x] Document frozen-candidate discipline: gather required author trail before qualification; later changes requalify as current contracts demand; mutable status belongs in Coordinator record.

**Acceptance Criteria:** Every current required check has identity, command/OS, responsible owner and native artifact/count contract. Existing failed checks cannot be waived by documentation. Local/mocked results explicitly list untested real boundaries. Owner can select focused feedback without inventing a CI route or touching someone else's resources. No changes to workflows, branch protection or adapter in this story.

## Verification

Focused: compare documented commands and names against frozen workflow/package files and verify links. Integration: reviewer walks source pass/merge fail, docs-only, SQL/money, skipped DB and stale candidate cases; sensitive examples assessed by Sol High. Hosted: current required docs PR checks, no new manufactured runtime claim. No DB/browser execution required merely to document commands. Existing historical run sample is labelled historical.

## Transition, failure and done

Disjoint docs work can run alongside operating-contract and existing repair, but serialize edits to shared `parallel-auto-bmad.md`. Sol Low author/reviewer; High on any proposed qualification-policy relaxation (out of scope here). On stale source references re-read actual candidate; do not change commands to accommodate old checkout. Revert new docs by reviewed commit if inaccurate, keep prior evidence. Done: traceable route matrix, honest rehearsal limits, no weakened gates, independent review and exact commit/evidence handoff to Coordinator. Success metric: zero duplicate dispatches/observers for the same candidate/route/attempt across next two stories. Optional extraction is not a prerequisite.

## Successor execution checkpoint

Sequentially adopted under current user-authorized finite process tranche after
operating-contract edits settled. Original planning frozen intent retained as
provenance; owner-approval.md and current coordinator assignment supersede its
old approval-outstanding marker. No product story key or claim/store mutation.
Supported Build snapshot be5df8a06e3817d60ffb. Independent source candidate review passed (round1);
this document is code-written, not development-complete or hosted-qualified.

## Suggested Review Order

Author: /root/workflow_successor, current final working tree on baseline4824.

The workflow remains authoritative; the responsibility table makes source versus
integration proof visible without altering checks. Shared docs were edited
sequentially by the same exclusive author.

- `docs/quality/ci.md:265` — current gate documentation plus appended responsibility/identity matrix and freeze/evidence envelope.
- `docs/process/local-setup.md:342` — supported local routes and explicit hosted-only boundaries.
- `docs/process/parallel-auto-bmad.md:1` — minimal link retains native claims/qualification precedence.

Evidence: five qualification table-top cases passed in private tabletop-evidence.md;
command/job names inspected against baseline workflow/package sources. Named trail
checker result recorded in verification-evidence.json. No hosted/DB/browser run,
provider-required-check attestation or gate relaxation. Root owns current-head
qualification, integration and application changes.

## Independent source review outcome — round 1

Coordinator returned completed independent results on2026-11-04: blind correctness
PASS/no findings; verification PASS (native13passed/0failed/0skipped,11 honest
tabletop cases and SRO); Sol High authority/privacy SOURCE PASS/no reachable defect.
No code change followed review. Private review-round-1.json records provenance and
limits. No broad review or tests repeated merely for receipt recording.

Source acceptance is separate from adoption: Root must refresh private CURRENT
with the exact full57token/7domain/3ID existing-allocation-bindings.json register
SHA25638295be6a28463205ae1cd37ae5d9d933bdf85319796dfc87e1123698f620d23 as historical
exclusion provenance, NOT current custody clearance (the four producer files retain
only the old4domain summary). Author leaves private candidates unchanged. Supported
live monitor reconciliation/update/readback and hosted qualification remain
outstanding; both products held. In-review status preserves this incomplete
adoption/whole-tranche exit instead of an installed done claim. Local source
commit authorized by Coordinator; no publication, integration or release here.
