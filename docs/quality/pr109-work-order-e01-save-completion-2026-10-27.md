# PR109 work-order E01 completion diagnosis

Baseline: `220d68fae67075ae0e95d8844be203d1f8f46fe7`.
Scope: four test/support/documentation paths, E01 successful sequencing only.
Implementation and independent review route: GPT-6.1 Sol High because the
assessment concerns compare-and-set consent and transactional audit integrity.
No product, schema, shared save helper, timeout, retry or negative-path change.

## Retained failure and evidence limit

The retained native browser ZIP from [CI run 40388798006](https://github.com/rthunborg/Kopplas/actions/runs/40388798006)
has SHA-256 `260bb7214469a7a8a6e4ae87356118f9804be3c831711d4880e53e744a1a8d0f`.
Its `general-browser.json` reports E01's first attempt failed after 3409ms at
the original `work-orders.e2e.spec.ts:126`: expected audit delta 1, received 0.
Retry passed after 5017ms. The archive and redacted summary remain under ignored
`tmp/private/frontend-gate-activation/`; no fixture/customer data is copied here.
The first attempt has no retained response body or client execution trace proving
its command outcome. The retry is neither proof of harmlessness nor a diagnosis.

## Concrete reachable sequencing hazard

The original `save()` returns the matched Playwright response at response headers.
E01 checks only HTTP success and then reads audit rows or edits another field.
The work-order server action can return a business failure such as `PREVIEW_STALE`
inside a successful HTTP response. Headers alone do not prove client completion.

`WorkOrderPane.send` awaits the action result, reconciles fields with its returned
projection, updates the parent projection, and sets its saved lane. Detail inputs
remain editable while the lane is pending. `receiveJobMemberField` deliberately
preserves the existing expected-state token for dirty controls. Therefore editing
details after the assignment response headers but before its client projection
arrives can retain the pre-assignment token. The subsequent details command can
correctly fail compare-and-set admission instead of appending an audit event.
The focused pure test demonstrates this possible ordering using the real field
functions; it does not reproduce or establish the historical CI cause.

The SQL `work_order_mutate_internal` checks current expected state (`BK409`) before
the mutation and records the audit event in the same function/transaction. The
command awaits its RPC; the action awaits the command and subsequent projection.
There is no basis here to claim an asynchronous audit commit or use eventual
audit polling. Keep the exact delta-one assertions and the database's current
compare-and-set enforcement.

Read-only source anchors:

- `src/components/jobs/WorkOrderPane.tsx`: `send`, `reconcile`, `edit`, `aria-busy`.
- `src/features/jobs/job-members-domain.ts`: `receiveJobMemberField`.
- `src/features/jobs/actions.ts`: `workOrderAction`.
- `src/server/commands/jobs/work-orders-db.ts`: awaited `client.rpc`.
- `supabase/migrations/20261020200000_e16_16_3_work_orders.sql`: `work_order_mutate_internal`.

## Bounded correction

E01 alone wraps its three existing exact-match save triggers in
`completeWorkOrderSave`. Before each trigger the actual pane must be idle and
have no previous receipt (E01's edits clear the saved lane). The helper requires
HTTP success, successful `response.finished()`, idle pane, no error, and a visible
new receipt with the exact existing confirmed-save message. It checks for errors
again after the receipt. A false-success HTTP 200 cannot satisfy that UI contract.
These observations use the configured Playwright assertions and existing limits.

Before editing details, E01 additionally observes the assignees in the returned
row projection. Before reading the edit audit snapshot, it observes the new row
title. Audit deltas, tenant/actor assertions, reload persistence, shared-file flow,
CAS, E02 loss/stale/replay coverage, E03, timeouts and retries stay intact.

The helper imports Playwright types only. Its injected assertion adapter is used
by the real E01 test; pure units exercise the same orchestration with deferred
response-body, pane-settlement and receipt promises. The seam permits bounded
verification without starting an application or substituting fake persistence.

## Verification and remaining proof

Working-tree verification on the recorded baseline plus these changes:

- Focused node units: 19 passed, 0 failed, 0 skipped (seven new helper/ordering
  cases plus existing work-order and job-member domain suites).
- Scoped ESLint: passed for the three TypeScript paths.
- `pnpm run typecheck`: passed.
- `git diff --check` and targeted review-order reference validation: passed.
- `node scripts/quality/frontend-controller.mjs local --base
  220d68fae67075ae0e95d8844be203d1f8f46fe7`: `not-applicable`, with all four
  changed/untracked paths inventoried and no frontend-bearing path.
- Independent High review: pre-edit and post-edit targeted GO; no actionable
  defect. The reviewer separately ran the seven new units: 7 passed, 0 failed,
  0 skipped. This is a review of the repair, not a fresh full-PR review.
- Actual browser/DB execution: not performed for this repair yet. Deferred unit
  observations are simulated, not application/browser or database evidence.

The infrastructure owner alone qualifies the shared guarded stack. Actual E01
verification requires that qualification and a separate guard-owned production
server/browser plan. No full CI, publication, settings change or hosted resource
action was performed. Browser completion remains unproven until real execution.
This test/support/docs change has no rendered product path; frontend visual
acceptance is not applicable to its four-path repair delta. This statement does
not qualify the broader PR109 frontend gate or any product/release readiness.

## Suggested Review Order

Author: browser stabilization implementation delegate.
Refreshed against the four-file uncommitted repair on the full baseline above.

### Prove each successful command is received before the next edit

E01 now observes actual completion before proceeding, keeping the audit invariant
strict. The barrier excludes an old receipt and a header-only HTTP success.

- `tests/e2e/jobs/work-orders.e2e.spec.ts:104` — `completeWorkOrderSave`: wraps the existing matched creation trigger.
- `tests/e2e/jobs/work-orders.e2e.spec.ts:120` — `completeWorkOrderSave`: settles assignment before details become dirty.
- `tests/e2e/jobs/work-orders.e2e.spec.ts:130` — `toContainText`: observes the fresh row before the audit snapshot.
- `tests/e2e/jobs/work-order-save-completion.ts:26` — `completeWorkOrderSave`: orders fresh receipt and body/UI completion.

### Check proof boundaries and the preserved consent baseline

The new units prove helper ordering and refusal behavior, then demonstrate the
possible dirty-field interleaving using existing domain functions. They do not
establish the first CI attempt's cause or substitute for real browser execution.

- `tests/unit/e2e/work-order-save-completion.test.ts:18` — `test`: defers body, idle and receipt independently.
- `tests/unit/e2e/work-order-save-completion.test.ts:72` — `test`: rejects HTTP 200 with a business error.
- `tests/unit/e2e/work-order-save-completion.test.ts:108` — `test`: demonstrates the possible old-token ordering.

Evidence and limits are recorded in the verification section above; actual
browser proof remains pending.
