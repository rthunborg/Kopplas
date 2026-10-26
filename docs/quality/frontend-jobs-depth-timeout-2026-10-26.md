# PR109 RLS001 timeout diagnosis and bounded phase evidence

Date: 2026-10-26. Author route recorded before implementation: GPT-6.1 Sol
High for sensitive RLS/test integrity, under the existing Low coordinator.
Independent Sol High approved the exact five-path design before edits; final
implementation review is pending. This report continues the
[Auth diagnosis](frontend-auth-cleanup-2026-10-26.md); it changes no Auth code,
workflow, product, schema, permissions, dependencies or environment settings.

The required DB job remains failed at PR109 head
`184053e4bc1ec130371ce7537c4a372384d2a4d3`. No product defect or cleanup behavior
fix has been established. This candidate adds failure-only timing evidence for
the next separately authorized exact-head CI run. It grants no readiness,
merge, deployment or rerun approval.

## Observed evidence and attribution limit

- Final candidate run `40378974858`, DB job `121772070346`, native integration
  artifact `12678389611`: 2198 assertions, 2145 passed, one failed, 52 explicitly
  pending. Sole failure: `16.1-RLS-001 real roles, UNION rows, inactive actors
  and own-job child scope agree`, duration 30014.278443 ms. Native failure has
  `STACK_TRACE_ERROR` at test registration and empty metadata; it identifies
  no active await or backend error. ZIP SHA-256:
  `4696c60b647c0684c2430e5a11aa644e311918672b0893ecf434fa63bc437b68`.
- Comparable baseline run `40367022378`, exact main
  `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f`, native artifact `12672696071`:
  2198 assertions, 2146 passed, none failed, 52 explicitly pending. The same
  RLS001 case passed in 27656.08 ms, already close to the unchanged 30000 ms
  limit. This one passing comparison establishes neither determinism nor the
  failure mechanism. Pending assertions remain unexecuted coverage.
- NUDGE004 passed in 5669.787984 ms on the final run. Auth facts artifact
  `12678413135` explicitly reports `not-applicable`, no qualified window,
  ownership or source proof, zero services/failures, and zero acceptance
  credit. Its existence is not evidence of an Auth failure. ZIP SHA-256:
  `bdeb28f5486f4f1edf0dfc800c508eb37e5a22e0a55c639c12e8b34f655fe87b`.

Before this instrumentation, RLS test, jobs/booking fixtures, admin SQL helper,
quote PDF helper, Vitest configuration, runtime wrapper and lockfile Git blobs
matched d02 exactly. In particular, the RLS test blob was
`3761057c52c6803f5205da5a7618e49b95d06146` and jobs fixture blob was
`f5af2404b9f7a2397b970852535d319d3369cb66`. Source tracing and independent High
review found no changed assertion/domain/permission path: this fixture cleans
up through `cleanupRoleAwarePhaseAFixture` and the unchanged direct Auth delete,
not the opt-in diagnostic `deleteAuthUser`. The new Auth collector runs after
integration failure and cannot cause the preceding timeout.

The test's existing dynamic imports, fixture creation, assertions and cleanup
all count inside its existing limit. First-case timing is consistent with
several possible slow phases; cold import/transform, fixture work, assertions
and cleanup remain unproven explanations. Native registration stacks and total
duration cannot identify which operation was active. No retry, import move,
timeout increase, skip or assertion weakening is justified by these artifacts.

## Instrumentation contract

Only RLS001 opts in. The heavy imports stay in the original callback. An
optional synchronous observer marks existing fixture/setup awaits and cleanup;
the callback marks imports and assertion awaits. There are no extra operation
awaits, async wrappers, retries or changed cleanup order. The two original
nested card-load/update awaits are split into a named local solely to label
them individually. All original assertions remain intact. Other tests use the
same default helper behavior, with a no-op observer.

The dedicated public `task.meta.jobsDepthPhaseV1` slot contains only fixed
schema/case/evidence strings, one of 33 closed phase IDs (or null), bounded
integer counters and monotonic elapsed milliseconds. Counts are bounded at
100 per phase; time values at 600000 ms. Evidence is `diagnostic-only` with
`acceptanceCredit=0`. It contains no wallclock, identifiers, role/table values,
SQL, headers, credentials, errors, messages or signal reason. Grouped repeated
operations have aggregate counts/times rather than actor identity. Timings
include synchronous work inside the marked phase and do not prove backend
execution time or root cause.

Installed Vitest 4.1.9 supplies public `task.meta`, `context.signal`,
`context.onTestFailed` and `context.onTestFinished`. A synchronous abort listener
freezes the snapshot at timeout; the synchronous failure hook publishes it for
actual failures only. Late body/cleanup calls cannot mutate the frozen image.
Ordinary rejection markers do not inspect the thrown value. Foreign metadata
is untouched; observer, clock or sink failures cannot replace the test result.
Missing metadata means diagnostic evidence is unavailable, never success.
Passing tests publish no phase evidence. Existing native JsonReporter transport
already carries task metadata, so no workflow, collector or artifact change is
needed.

## Executed local evidence

Tested worktree: the four source identities below on top of full head
`184053e4bc1ec130371ce7537c4a372384d2a4d3`; report is the fifth changed path.
Canonical LF SHA-256 receipts (Windows CRLF representation may differ):

| Path | SHA-256 |
| --- | --- |
| `tests/support/jobs-depth-phase-diagnostics.ts` | `0ddc2c3f131cfdbf5a52175dbd59909a0e9197d5c3e5fb3468c2b69582b5f31e` |
| `tests/support/jobs-depth-atdd.ts` | `2f9eb6ae0bc02307b07403641694df85238abb80a5f44053f60b941542134cf5` |
| `tests/integration/rls/jobs-depth.rls.test.ts` | `ee7c9871a76296bb03e1e3a35f359765ec86aa7a38584de154b47ee59c828ff5` |
| `tests/unit/support/jobs-depth-phase-diagnostics.test.ts` | `eb49832f4e7a93cb02cf4ad7f3992c1433da46d23195b2bc77e0c73a64cbf96a` |

- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/support/jobs-depth-phase-diagnostics.test.ts`:
  five passed, zero failed/skipped/pending. Fixed-clock tests exercise numeric
  bounds, foreign/accessor/hostile metadata, invalid clocks/labels, immutable
  abort snapshots and no error-value input. Extraction of the actual helper
  checks setup/callback/cleanup order, original rejection identity, cleanup
  error precedence and throwing/default observers.
- The fifth test executes the actual installed Vitest runner and JsonReporter
  in an isolated no-service configuration with no project setup/global hooks.
  The bounded subprocess intentionally executes three synthetic cases: two
  failures (20 ms timeout and a fixed original error), one pass, zero pending.
  The surrounding node test requires that nonzero outcome. It proves native
  metadata transport, unchanged original failure, failure-only publication,
  and a still-running body unable to rewrite the frozen timeout phase.
  Recorded local fixture: `tmp/private/rls001-phase-proof-AGFLqS/`;
  `native.json` SHA-256
  `fa8d29c3b864c4888f5c130e10d3bbce687d2a7ceedf45d0ab821a1b5b1034e1`,
  `proof.json` SHA-256
  `ee87d30a31e6cb129bf1c6ac9828c633397fcb99719ada8440443a5df1e1dc5a`.
- `node node_modules/typescript/bin/tsc --noEmit`: passed.
- Targeted ESLint for all four TypeScript paths: passed.
- `node scripts/verify/check-review-order.mjs docs/quality/frontend-jobs-depth-timeout-2026-10-26.md`:
  one section, nine literal/line references, zero errors.
- Local frontend policy against full head184: `not-applicable`, explicit
  tooling-only reason and changed-path inventory. No rendered surface changes;
  no application screenshots or visual acceptance are claimed.

No local backend/browser workload, managed service, hosted CI run or external
mutation was started in this continuation. Synthetic timeout fixtures establish
only the diagnostic mechanism; they do not explain the historical RLS failure
or execute its real role/tenant assertions. Required exact-head integration and
fresh external review remain coordinator-owned checkpoints after independent
High review of these source identities. A future pass still cannot retrospectively
identify the operation that timed out in the historical run.

## Suggested Review Order

### Preserve the failing test

- `tests/integration/rls/jobs-depth.rls.test.ts:8` — `16.1-RLS-001`: keeps imports and actual role/child assertions in the original timed callback; opts in only this case.
- `tests/support/jobs-depth-atdd.ts:103` — `function phaseObserver`: contains observer exceptions without inspecting operation values.
- `tests/support/jobs-depth-atdd.ts:234` — `export async function withJobsDepthFixture`: preserves original callback error and finally cleanup, including cleanup-error precedence.

### Bound and freeze diagnostic data

- `tests/support/jobs-depth-phase-diagnostics.ts:2` — `jobsDepthDiagnosticPhases`: closed vocabulary; no actor or backend value crosses the API.
- `tests/support/jobs-depth-phase-diagnostics.ts:25` — `export function createJobsDepthPhaseDiagnostics`: bounds monotonic counters/times and protects foreign metadata.
- `tests/support/jobs-depth-phase-diagnostics.ts:85` — `export function registerJobsDepthPhaseDiagnostics`: freezes on abort and publishes through public failure-only hooks.

### Check execution and its limits

- `tests/unit/support/jobs-depth-phase-diagnostics.test.ts:13` — `RLS phase evidence is fixed`: proves timeout snapshot immutability and privacy with a fixed clock.
- `tests/unit/support/jobs-depth-phase-diagnostics.test.ts:76` — `actual helper keeps callback/cleanup order`: checks original rejection and cleanup semantics when diagnostics fail.
- `tests/unit/support/jobs-depth-phase-diagnostics.test.ts:90` — `actual installed Vitest timeout and JsonReporter`: executes the isolated real runner; deliberate synthetic failures must remain failures.
