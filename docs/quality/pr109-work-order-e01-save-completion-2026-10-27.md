# PR109 work-order E01 completion diagnosis

Baseline: `220d68fae67075ae0e95d8844be203d1f8f46fe7`.
Projection-only follow-up baseline: `eb86bec5b253f0d42228307d2dd3ffd2ec993f7a`.
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

## First correction and subsequent hosted failure

The first helper waited for response EOF via `response.finished()`, an idle pane,
and a fresh generic saved receipt. Its 19 focused units and static checks passed;
independent High review gave targeted GO. Those units simulated body/UI promises
and did not establish actual browser success.

[CI run 40489824772](https://github.com/rthunborg/Kopplas/actions/runs/40489824772)
executed that correction at `eb86bec5b253f0d42228307d2dd3ffd2ec993f7a`.
Its native browser population was 64 expected, 1 unexpected, 0 flaky, 0 skipped.
Only E01 failed: both attempts exceeded the existing 60000ms test limit, taking
60065ms and 60121ms. Browser installation succeeded in 617 seconds; the smoke
step failed after 381 seconds. This was not an installation failure.

Native ZIP SHA-256: `fe8ef45ce37741bcdc3e9d3e4ed4dbed812a3a3e2409d7a54fbb5e39f308d17f`.
Native JSON SHA-256: `8615b65e12eb5c77890e649f2160c13cf2b95a3f16d74d6725b00f6e698eb22c`.
The results contain whole-test timeout errors without a source location or call
log. They reference error contexts and a retry trace under runner `test-results`,
but the four uploaded artifacts contain only native JSON. The full job log
confirms `playwright-report/` was absent; list/JSON reporters did not create it.
The privacy wrapper did not publish raw child output. Exact blocked-await
attribution is therefore unavailable from the retained evidence. Neither stream
EOF nor receipt disappearance is asserted as the historical timeout cause.

Source inspection finds `lane.saved` is local component feedback. Edits and sends
clear it, and remount initializes it false. However, creation selection retains
its existing key, and same-child history reconciliation returns `keep`; the
source does not prove a creation remount occurred in this run. The follow-up
instead chooses a completion contract directly tied to the required operation.

## Projection-only follow-up

E01 alone retains its three exact matched triggers. Before each trigger it proves
the expected new card value absent. `completeWorkOrderSave` requires HTTP success,
then the action-specific changed server projection, an idle pane, and no error:

- Creation: the newly visible exact-title card button `Montera central`.
- Assignment: both selected person labels in that work order's card before any
  details edit. The selection control alone is optimistic and is not this proof.
- Details: the new exact-title card button `Montera och prova central` before
  reading the audit snapshot.

`WorkOrderPane.send` publishes `result.projection` only after a successful server
action. `JobWorkOrdersPanel.receive` stores that projection and its cards render
the projection rows. A server-rendered refresh also uses the checked database
read model. Editing a control does not optimistically change these cards. Their
fresh values plus the settled form therefore demonstrate application completion
without requiring network-stream EOF or a generic local receipt. False HTTP200
business failure leaves the new projection target absent and fails the assertion.

The helper removes its extra transport/receipt predicates. Existing configured
assertion limits apply to the projection and pane checks. Audit deltas remain
exactly one, with no audit polling; tenant/actor, reload persistence, shared-file,
CAS, E02 loss/stale/replay, E03, timeouts and retries remain intact. No product
attribute, endpoint, schema, framework or runtime configuration changes.

## Follow-up verification and limits

On the follow-up baseline plus this four-path working-tree adjustment:

- Focused node units: 21 passed, 0 failed, 0 skipped. Seven helper cases exercise
  deferred projection/idle, a never-resolving stream that must never be awaited,
  HTTP refusal, unchanged/changed real read-model DTOs, a late visible error,
  the actual assertion adapter and real dirty-field CAS ordering. Fourteen
  existing domain/read-model cases also pass.
- Command: `node --experimental-strip-types --import ./tests/support/register.mjs
  --test tests/unit/e2e/work-order-save-completion.test.ts
  tests/unit/features/jobs/work-orders-domain.test.ts
  tests/unit/features/jobs/job-members-domain.test.ts
  tests/unit/server/read-models/job-work-orders.test.ts`.
- Scoped ESLint and `pnpm run typecheck`: passed.
- Diff whitespace and seven review-order references: passed. The local frontend
  controller on the full follow-up baseline reports `not-applicable` and
  inventories exactly the four repair paths. Shared `save()` and the entire
  E02/E03 tail compare unchanged to that baseline.
- Independent High pre-edit and post-edit targeted GO received for the simpler
  contract, with no actionable defect. The reviewer independently reran the
  seven changed helper units: 7 passed, 0 failed, 0 skipped. This targeted review
  does not grant broader PR readiness or execution authority.
- No new browser run, CI retry, local resource or database execution was performed
  for this follow-up. The mocked RPC-backed DTO tests do not prove persistence
  or actual browser behavior. The revised completion contract is not yet a
  verified hosted fix, and both retained timeout failures remain valid evidence.

Actual browser proof requires the parent's separately qualified execution route;
the infrastructure owner owns future trace/test-results retention changes. This
test/support/docs delta has no rendered product path; its visual applicability
does not qualify the broader PR109 gate, release readiness, merge or deployment.

## Suggested Review Order

Author: browser stabilization implementation delegate.
Refreshed against the four-file follow-up on the full `eb86bec5` baseline above.

### Prove each successful command is received before the next edit

E01 observes each newly changed server-projected card before proceeding, keeping
the audit invariant strict. Absence before the trigger excludes an old UI value.

- `tests/e2e/jobs/work-orders.e2e.spec.ts:106` — `completeWorkOrderSave`: waits for the new server-projected creation card.
- `tests/e2e/jobs/work-orders.e2e.spec.ts:124` — `completeWorkOrderSave`: settles assignment before details become dirty.
- `tests/e2e/jobs/work-orders.e2e.spec.ts:134` — `completeWorkOrderSave`: observes the changed row before its audit snapshot.
- `tests/e2e/jobs/work-order-save-completion.ts:17` — `completeWorkOrderSave`: waits for projection and settled form without stream EOF.

### Check proof boundaries and the preserved consent baseline

The new units prove helper ordering and refusal behavior, then demonstrate the
possible dirty-field interleaving using existing domain functions. They do not
establish the first CI attempt's cause or substitute for real browser execution.

- `tests/unit/e2e/work-order-save-completion.test.ts:24` — `test`: defers projection/idle while stream EOF stays unresolved.
- `tests/unit/e2e/work-order-save-completion.test.ts:63` — `test`: rejects HTTP200 with an unchanged read-model projection.
- `tests/unit/e2e/work-order-save-completion.test.ts:106` — `test`: demonstrates the possible old-token ordering.

Evidence and limits are recorded in the verification section above; actual
browser proof remains pending.
