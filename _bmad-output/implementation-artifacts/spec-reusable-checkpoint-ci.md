---
title: Reusable checkpoint CI delivery lane
type: chore
created: 2026-10-19
status: in-review
baseline_commit: 7cf68eb9097c5c62685a6fd202157285dddb4357
review_loop_iteration: 0
context:
  - '{project-root}/docs/process/agent-model-routing.md'
  - '{project-root}/docs/process/review-order.md'
---

<frozen-after-approval reason="owner-authorized process task">

## Intent

**Problem:** Checkpoint CI orchestration currently requires per-run helpers, shared admission variables and timing-sensitive coordination. That work should be repeatable from committed tooling without interference between owners.

**Approach:** Add an opt-in dispatch entry point to the existing CI workflow and a reusable dispatch/status/cancel helper. Bind each request to an exact full source revision and unique checkpoint identity; preserve the real required gates.

## Boundaries & Constraints

**Always:** Use a persisted exclusive ownership record before dispatch, enforce exact-head admission before product gates, retain uncertain outcomes without blind retries, and scope cancellation to a proven owned run. Keep current gate commands, budgets, local-only test databases, secrets containment and cleanup. Independent review precedes adoption. Route implementation and security review to Sol High for dispatch authorization and ownership boundaries.

**Ask First:** Materially expanded effects, deployment, merge, secrets or a new privileged execution mode require their existing authorization.

**Never:** Mutate repository variables, import private E15 assets, hot-upgrade active loops, touch another owner's run, deploy, weaken acceptance, or dispatch during this implementation task.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Fresh checkpoint | Authorized repository, branch and exact remote SHA | Persist request identity and dispatch once; discover only matching run | Bounded discovery |
| Ref drift | Remote head differs or changes at execution | Reject before dispatch or before gates | Explicit failure |
| Ambiguous request | Transport failure or run not discovered yet | Retain identity and reconcile through status | Never dispatch again from that record |
| Concurrent owners | Distinct state records and checkpoint IDs | Independent workflow concurrency groups | No shared variables |
| Cancellation | Verified run identity matches recorded checkpoint | Cancel only that run | Mismatch or duplicate match fails closed |
| Completed run | Native run has final conclusion | Report conclusion and preserve evidence record | Failure remains failure |

</frozen-after-approval>

## Code Map

- `.github/workflows/ci.yml` — authoritative verify, database, recovery Storage, general browser and dashboard gates. Main has no optional E15 diagnostic lane.
- `scripts/ci/checkpoint-dispatch.mjs` — new operator entry point and testable ownership state machine using GitHub CLI authentication.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts` — resource-free mocked GitHub API and filesystem boundaries on the existing node:test runner.
- `docs/quality/ci.md`, `docs/process/agent-workflow.md` — operator adoption and gate/evidence boundaries.
- E15 workflow inspected read-only: its private broker provides experimental process containment for full158 diagnostics, not a prerequisite for ordinary isolated hosted CI.

## Tasks & Acceptance

**Execution:**
- [x] `.github/workflows/ci.yml` — add immutable dispatch admission and checkpoint concurrency; preserve required jobs.
- [x] `scripts/ci/checkpoint-dispatch.mjs` — implement dispatch, reconciliation, status and owned cancellation without global variables or uncertain retries.
- [x] `tests/unit/scripts/ci/checkpoint-dispatch.test.ts` — cover matrix and workflow wiring with no service launches.
- [x] `docs/quality/ci.md`, `docs/process/agent-workflow.md` — document commands, authorization, bounded cleanup and opt-in adoption.

**Acceptance Criteria:**
- Given ordinary PR/push CI, when it runs, then existing real gates retain their commands and admission succeeds without dispatch inputs.
- Given a checkpoint request, when its branch advances, then only its requested SHA may run gates and its run remains independently identifiable.
- Given any uncertain dispatch, when the operator resumes, then reconciliation uses the persisted identity and never sends another dispatch.
- Given a mismatched or duplicate run, when cancellation is requested, then no cancellation is sent.
- Given a clean checkout with Node and authenticated GitHub CLI, when the lane is adopted, then no private asset, repository variable packet or added dependency is needed.

## Spec Change Log

## Design Notes

2026-10-19 pre-edit adjustment: implement the smallest standard hosted checkpoint path first. The ordinary main CI gates need no privilege beyond contents:read. Experimental E15 privileged/full158 diagnostics are not imported, so their active run, variables, admission and private assets are untouched. Process-task authorization covers implementation now; adoption is opt-in after independent review. This spec records the owner-authorized task rather than adding another planning approval checkpoint.

Bootstrap note: the first BMAD renderer invocation failed because uv could not use its default temporary directory. The coordinator retained that failure, then successfully rendered once with task-local TEMP/TMP/UV_CACHE_DIR. No renderer rerun was needed here. Direct owner instructions consolidate the rendered three review lenses into one focused independent High review.

Documentation follow-up: add owner-requested prerequisite-PR boundaries and one focused independent review with applicable unchanged evidence reused. E15/E16 candidates record the existing assessment only; no product authority or implementation is added.

## Verification

- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/ci/checkpoint-dispatch.test.ts`: 21 passed, 0 failed/skipped; includes eight native Bash cases from the actual workflow block.
- `pnpm typecheck`, focused `pnpm exec eslint scripts/ci/checkpoint-dispatch.mjs tests/unit/scripts/ci/checkpoint-dispatch.test.ts`, `node --check scripts/ci/checkpoint-dispatch.mjs`: passed.
- YAML parsed using the existing locked js-yaml package: six jobs and dispatch inputs present. Review-order checker: eleven valid stops. `git diff --check`: clean.

GitHub calls are mocked. No live dispatch, hosted verification, database or browser execution occurred. The native admission test executes on Linux CI; Windows without Git Bash explicitly skips that test (this run skipped none). Independent Sol High review passed with zero findings and independently reran all 21 tests (including eight native Bash cases). The subsequent process-doc-only follow-up also passed narrow independent Sol High review with zero findings; all eleven review stops validated and unchanged 21-test evidence was reused. Spec remains in-review pending PR creation; default-branch adoption remains required. Coordinator owns commits/pushes.

## Suggested Review Order

Author: CI lane implementation delegate (Sol High). Refreshed against the
uncommitted six-file change based on `7cf68eb9097c5c62685a6fd202157285dddb4357`.

### Exact source and real gates

Dispatch inputs admit the requested commit before existing gates. Checkouts retain
the baseline PR source-head policy; dispatch uses the immutable event SHA.

- `.github/workflows/ci.yml:20` — `workflow_dispatch:`: operator inputs.
- `.github/workflows/ci.yml:52` — `checkpoint-admission:`: fail closed before gates.
- `docs/quality/ci.md:116` — adoption and unchanged acceptance boundaries.

### Durable ownership and uncertainty

Flushed local intent precedes dispatch. Bounded discovery and ownership verification
prevent guessed cancellation; uncertain mutations are never automatically retried.

- `scripts/ci/checkpoint-dispatch.mjs:86` — `checkpoint`: operator state machine.
- `scripts/ci/checkpoint-dispatch.mjs:66` — `assertOwnedRun`: cancellation identity boundary.
- `scripts/ci/checkpoint-dispatch.mjs:74` — `discover`: duplicates and pagination bound.

### Evidence and adoption

Focused tests exercise intent persistence, uncertain dispatch, native conclusions,
all ownership fields and cancellation. Static workflow checks preserve gate commands.

- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:60` — dispatch persistence assertions.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:75` — uncertain outcome recovery assertions.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:168` — native admission acceptance and rejection cases.
- `docs/process/agent-workflow.md:64` — deployment and active-loop boundary.
- `docs/process/agent-workflow.md:86` — prerequisite qualification and focused-review boundary.

Evidence: 21 tests passed, 0 failed/skipped; syntax, full typecheck and focused
ESLint passed. Tests mock GitHub; no hosted dispatch, DB, browser or deployment
was executed. Independent Sol High implementation review and the narrow docs-only follow-up both passed with zero findings. All eleven stops validate; unchanged 21-test implementation evidence is reused. PR review status and default-branch adoption remain outstanding.
