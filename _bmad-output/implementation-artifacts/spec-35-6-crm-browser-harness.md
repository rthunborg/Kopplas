---
title: '35.6 CRM browser verification harness'
type: 'chore'
created: '2026-11-09'
status: 'in-review'
baseline_commit: '306f3a724d00065d3720cc7c24d7d0288c365e0d'
review_loop_iteration: 0
context:
  - docs/process/review-order.md
  - _bmad/custom/review-order-template.md
---

<frozen-after-approval reason="owner-approved revised direct-server allocation">

## Intent

Ordinary browser smoke needs the baseline CRM suite and a way for the later CRM retry journey to induce a real, subject-scoped list-read failure and recovery. The retained pricing P-E5 isolation check requires the direct local Supabase API and the existing singular, non-reused Playwright web server. The baseline CRM suite also needs its ignored contrast evidence directory on a fresh checkout.

Extend the run-bound Next preload to control the exact authenticated customer-list GET while keeping the direct local Supabase origin and existing jobs fault behavior. Create the ignored contrast directory during browser setup. Append CRM to the ordinary smoke command and retain every existing selection and reporter.

## Boundaries

This separate Phase B prerequisite owns the preload, its focused unit file, the smoke selector, and this spec. The later CRM product checkpoint owns the test-control wiring in its customer spec and preserves the real retry click, held read, authorized row, foreign-row exclusion, and durable row and audit comparisons. Preserve the earlier worktree and review evidence.

Keep pricing, settings, producer predicates, Playwright configuration, workflows, app code, migrations, dependencies, native state, and demo behavior unchanged. Qualify the exact prerequisite and actual merge in hosted CI. Independently verify the CRM journey and revision-bound desktop and mobile captures on the product candidate, including the configured browser routes that select it.

</frozen-after-approval>

## Approved source

The revised direct-server proposal was verified as SHA-256 `94EC440F7806D7DE0F1CF2050168965AB4EE8CB8F67581A77A1EB89C70ED0441` before implementation.

## Tasks & Acceptance

- [x] Keep the existing direct Next start and run-bound jobs adapter while providing the private CRM control to workers after boot verification.
- [x] Match only the exact direct-origin CRM list GET for the active authenticated fixture subject. Use a fixed PostgREST error or mark and hold the original read until a valid release.
- [x] Expire and invalidate attempts independently of the existing jobs control. Leave worker-owned control and marker removal to the separately owned browser case.
- [x] Create the baseline CRM contrast evidence directory during ordinary setup and append CRM to the ordinary smoke selector. Fixed Chromium keeps its broker write boundary and receives the CRM control under `test-results/private`.
- [x] Cover matching, passthrough, expiry, stale identities, bounded hold, cancellation by cleanup, and original forwarding with focused tests.

### Control contract

After the fresh startup handshake, the runner publishes `E2E_CRM_READ_FAULT_CONTROL` pointing to the absolute `test-results/private/crm-read-fetch-fault.json` path and retains `E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID` for the boot nonce. The worker atomically publishes exactly `{schemaVersion: 1, runId, attemptId, actorUserId, outcome, expiresAt}`. Each phase uses a fresh UUID for `attemptId`, the authenticated fixture user's UUID for `actorUserId`, and an epoch-millisecond `expiresAt` no more than 60 seconds ahead. `outcome` is `error` or `hold`.

For a hold, the server exclusively creates `<control>.<runId>.<attemptId>.held` containing `held`. The worker waits for that marker, then atomically publishes `<control>.<runId>.<attemptId>.release` containing `release`. The hold ends after at most 15 seconds or when the plan expires, is removed, or changes identity. The worker disarms and removes its control, temporary, and marker files in its cleanup.

## Verification

### Windows author evidence

Executed against the uncommitted direct-server prerequisite at baseline `306f3a724d00065d3720cc7c24d7d0288c365e0d` using Node 22.23.2 and pnpm 10.24.0. The lock-frozen install used `--ignore-scripts`.

- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/e2e/job-events-fetch-fault.test.ts tests/unit/scripts/verify/ci-native-test-reports.test.ts tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts` passed 229 tests with zero failures, cancellations, or skips after the fixed-mode setup correction.
- Scoped ESLint for the preload and unit file, full `tsc --noEmit`, and `git diff --check` exited 0. The smoke selector comparison verified the exact append against the baseline.
- The CRM unit uses the pinned Supabase SDK and actual CRM list-reader source. The transport, JWT, filesystem, process probes, and timers in the test are synthetic.

### Hosted acceptance

The native ordinary browser report must show that CRM and the existing settings and pricing cases, including P-E5, executed and passed on the exact prerequisite candidate and actual merged main. The later product revision requires its own real retry journey and exact-revision visual evidence. The Windows author run did not launch a browser, Next, or a database stack.

## Suggested Review Order

Author: Direct-server CRM harness implementation delegate.

Refreshed against the uncommitted direct-server prerequisite at `306f3a724d00065d3720cc7c24d7d0288c365e0d`.

### Ordinary smoke admission

The existing smoke command now selects CRM. After validating the fresh boot, the startup hook prepares the contrast directory for ordinary runs and shares the same CRM control with ordinary and fixed Chromium workers. The fixed broker's historical contrast path is read-only.

- `package.json:26` — `tests/e2e/crm/customers.e2e.spec.ts` appends CRM to ordinary smoke.
- `tests/support/job-events-fetch-fault.cjs:107` — `KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE` confines contrast directory creation to ordinary setup.
- `tests/unit/e2e/job-events-fetch-fault.test.ts:123` — `fresh singular Next boot` checks rejection before directory creation and control publication.
- `tests/unit/e2e/job-events-fetch-fault.test.ts:297` — `fixed Chromium setup publishes the same CRM control` checks permitted writes and control publication.

### Exact read and subject selection

The preload recognizes the actual list projection, filter, and order on the same direct local origin. The run nonce, matching authenticated subject, and expiry select the synthetic error or hold. Supabase remains responsible for authorizing forwarded reads.

- `tests/support/job-events-fetch-fault.cjs:52` — `isCrmListRead` constrains method, origin, endpoint, and query.
- `tests/support/job-events-fetch-fault.cjs:37` — `readCrmControl` checks plan shape, run identity, and expiry.
- `tests/unit/e2e/job-events-fetch-fault.test.ts:141` — `actual customer-list reader and pinned SDK` exercises the production query shape.
- `tests/unit/e2e/job-events-fetch-fault.test.ts:191` — `wrong, privileged, or invalid session claims` verifies passthrough for nonmatching claims.

### Fresh held request and original recovery

Exclusive hold markers claim a single request per attempt. The preload requires the same still-live plan and a valid release before forwarding that request unchanged.

- `tests/support/job-events-fetch-fault.cjs:66` — `waitForCrmRelease` checks single ownership, a monotonic deadline, and the release marker.
- `tests/unit/e2e/job-events-fetch-fault.test.ts:223` — `original receiver, request and options` checks identity and exactly one upstream call.
- `tests/unit/e2e/job-events-fetch-fault.test.ts:254` — `expiry, disarm, or replacement` verifies invalidation during a hold.
- `tests/unit/e2e/job-events-fetch-fault.test.ts:284` — `job-events transport fault remains independent` verifies the existing jobs seam.

The focused run also covers mismatched endpoints and methods, malformed plans and releases, and the timeout with a backward wall-clock step. See [Windows author evidence](#windows-author-evidence) for executed counts and [hosted acceptance](#hosted-acceptance) for the real browser and tenant evidence still required.
