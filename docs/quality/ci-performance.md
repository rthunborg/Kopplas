# Fast CI feedback and cold-start diagnosis

This is the operating guide for the bounded CI performance change of 2026-10-27.
The task keeps Playwright and all existing consequential checks. The initial
five-minute objective concerns useful early feedback, not permission to declare
an arbitrary frontend change fully validated from a login-page check.

## Choose checks by changed behavior

During implementation, run the unit/component files that exercise the changed
behavior, plus their direct contract tests. Changes to shared components or
styles require representative affected consumers. Auth, permissions, tenant
isolation, database schemas, transactional behavior, money, configuration,
workflows, unknown files and uncertain transitive dependencies require broader
validation. File location or the absence of a migration is not proof of safety.

The additional early browser lane checks the real production login entry at
desktop and 360x640 without credentials or backend mutations. It supplies
rendering, hydration, interaction and screenshot evidence for that entry only.
It does not validate an authenticated component that never appears on the page.
A screenshot capture is not independent visual acceptance. Follow the current
frontend quality gate and approved reference requirements for affected surfaces.

Existing native `verify`, `db`, `e2e`, and `recovery-storage-loader` checks keep
their meanings. `dashboard-e2e` retains its existing explicit release-validation
condition. There is no success-status replacement for an unexecuted check and no
change to branch protection. Comprehensive browser/dashboard validation remains
available through the existing release-validation option and is required when
the affected behavior needs that coverage. Required integration/RLS execution
uses `SUPABASE_TEST_REQUIRED=1`; record executed, failed and skipped counts.

## Safe reuse and parallel execution

Use the frozen pnpm lockfile and the repository Node/pnpm versions. Dependency
cache hits reduce package download work; they do not replace dependency install
or lockfile verification. Next build intermediates may be reused only under the
lane's toolchain/configuration/environment key. Always run the production build;
never start `next dev` for browser verification. Do not share complete `.next`
outputs across source revisions or differing public environment values.

The main browser suite shares mutable seeded fixtures and tests login/logout.
It remains serial. Its authentication state is not suitable for blind reuse:
permission, invitation, session and logout tests need their original boundaries.
Do not cache or upload cookies, storageState, fixture credentials or `.auth`.
The data-free entry-rendering checks can use separate browser contexts and
viewports concurrently because they neither log in nor write tenant data.

Worker-scoped authenticated parallelism requires separate tenant/account/data
ownership, cleanup evidence, and independent High review before increasing
workers. This bounded change does not claim that assessment constitutes a safe
implementation for the existing shared-fixture suite.

## Diagnose slow setup

Start with native Actions job and step timestamps, including initial queue,
upstream-job waits, image pulls, runtime readiness, database startup/reset,
build, fixture/auth setup, test attempts and report upload. Inspect the native
failure before retrying. Record absent phase timings as unmeasured; do not assign
the remainder to a guessed cause. The old browser OS install was 10m17s, of
which apt payload download consumed 9m55s; browser downloads consumed about 9s.
Browser caching alone therefore did not address that incident's bottleneck.

Treat image pull, package acquisition or browser readiness failures as setup
failures. Treat a test assertion/timeout after successful startup as an
application/test failure. A shorter timeout alone is not a speed improvement.
Do not repeat an unchanged failed CI run or restart local recovery to diagnose
a hosted package mirror delay. Preserve the operation receipt and logs.

Use the existing exact-head checkpoint helper for a deliberate reviewed hosted
run. Do not duplicate an uncertain dispatch. Before pushing, verify the dedicated
Vercel `previewDeploymentsDisabled` field is present and true; generic Git flags
are insufficient. Before a future authorized merge, check production deployment
behavior separately. Neither this guide nor a passing CI run authorizes merge
or deployment.

## Evidence and handoff

See [the measured baseline](ci-performance/baseline.md) and
[implementation/ownership record](ci-performance/implementation.md).
The before run failed E01 and RLS; it is not a successful throughput benchmark.
Compare identical stages, disclose warm dependency caches, include image pulls,
and separate measured cold startup from projections. Report full CI completion
separately from early entry-screen feedback.

PR #109 independently owns immediate E01 and RLS repairs. Do not overwrite its
work-order completion helpers, jobs-depth diagnostics or tenant fixture helpers.
When integrating the performance PR after the owner confirms it is merged,
preserve #109's exact storage schema-source `--exclude mailpit` change and its
DB-diagnostic steps. Reconcile each reviewed CI-provenance inverse; retain the
historical hash and unrelated-byte drift rejection. Re-run the affected contract
tests after reconciliation, then obtain evidence for the resulting exact head.
Do not cherry-pick unrelated #109 fixes just to obtain a newer workflow file.

## Commands and version updates

Ordinary focused verification uses the repository's existing runners. For the
new contracts, run:

```powershell
node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/ci/browser-runtime.test.ts tests/unit/scripts/ci/classify-feedback.test.ts tests/unit/scripts/ci/ci-performance.test.ts
pnpm typecheck
pnpm lint
```

The additive browser suite is selected with:

```text
pnpm exec playwright test --config tests/feedback/playwright.config.ts
```

It needs a production build and the compatible browser runtime. CI uses
`node scripts/ci/browser-runtime.mjs start` and `stop`; this helper deliberately
refuses ordinary local and self-hosted execution. Local agents must follow the
resource guard instead of spoofing GitHub environment variables to bypass it.
The CI helper stops only its recorded container after validating owner label,
container ID and image. It does not prune/delete volumes or other resources.

The image is official `mcr.microsoft.com/playwright:v1.61.1-noble`, additionally
pinned to digest
`sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48`.
Startup verifies the installed Playwright version, pulls the image, starts a
loopback-only server, and proves Chromium can open a page before tests start.
The server package is pinned to the same version. Browser/OS binaries are
preinstalled; the small server package is acquired at startup. When upgrading
Playwright, update the lockfile, image tag/digest, package pin and compatibility
tests together, then measure the new image's cold pull/readiness.

The supported `PW_TEST_CONNECT_WS_ENDPOINT` environment variable connects the
existing test runner to the browser server. Existing root/dashboard Playwright
configs, essential-smoke commands and optional fixed-browser source bindings
remain unchanged. Optional fixed-browser diagnostics retain their existing
installation path and are not included in this first performance optimization.

The runtime receipt lives in `RUNNER_TEMP/browser-runtime-<job>.json`, outside
Playwright's cleaned output directory. It records image/version, `pullMs`,
`readyMs`, browser version and cleanup identity. Production build receipts from
`timed-build.mjs` live in `RUNNER_TEMP/build-timing-<job>.json`. This runs the same
Next production build and preserves failures. Native Playwright JSON records
attempts/retries; screenshots cover only the tested entry states. Ordinary E2E
build/server/fixture timing remains aggregated and must be labelled accordingly.

References: [official Playwright Docker/remote connection](https://playwright.dev/docs/docker),
[Playwright CI guidance](https://playwright.dev/docs/ci), and
[Playwright output-directory cleanup](https://playwright.dev/docs/api/class-testconfig#test-config-output-dir).
