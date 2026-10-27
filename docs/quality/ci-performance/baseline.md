# Timing baseline: 2026-10-27

Source: [normal CI run 40489824772](https://github.com/rthunborg/Kopplas/actions/runs/40489824772)
on PR #109 head `eb86bec5b253f0d42228307d2dd3ffd2ec993f7a`. Native job/step
metadata is retained in `baseline-run-40489824772.json`. This is a failed run,
not a successful performance benchmark. Dependency installs used warm caches;
OS dependencies and the disposable database stacks were installed from scratch.

| Stage | Measured duration | Interpretation |
| --- | ---: | --- |
| Initial queue to admission job | 4s | Run created 10:36:43Z; job started 10:36:47Z. |
| Admission | 3s | Immutable source validation. |
| Verify queue after admission | 3s | Verify started 10:36:53Z. |
| Verify total | 3m26s | Checkout 6s, pnpm 1s, Node/cache 9s, Python 1s. |
| Dependency install in verify | 1s | Warm pnpm cache; not a cold dependency-install benchmark. |
| Typecheck / lint / unit | 24s / 36s / 74s | Full existing static/unit population. |
| Verify production build | 37s | Separate from browser webServer build. |
| Browser wait after verify | 5s | Browser job started 10:40:24Z. |
| Browser checkout / Node/cache / dependency install | 3s / 5s / 2s | Hosted setup, warm package cache. |
| Browser and OS installation | 10m17s | Dominant avoidable setup cost. |
| Apt payload download | 9m55s | 25.9MB at 43.6kB/s, from completed log. |
| Browser binary downloads | 9.09s | Chrome 4.486s, FFmpeg 1.074s, headless shell 3.530s. |
| Browser database start | 1m37s | Includes image pulls, initialization and readiness. |
| Browser reset/migrations/seed | 31s | First reset attempt succeeded. |
| Essential browser step | 6m21s | Includes production build, fixtures, tests/retry/teardown. |
| Browser report uploads | 1s | Native JSON and HTML combined at step resolution. |
| Browser stack stop | 18s | Existing hosted teardown. |
| Browser job total | 19m25s | Failed E01; 65 cases, 64 expected, 1 unexpected. |
| Feedback from run creation to terminal result | 23m07s | Failure outcome, not passing validation. |
| DB stack start / reset | 1m42s / 33s | Separate required DB job. |
| DB integration/RLS/performance step | 13m45s | Failed RLS case; separate application diagnosis in #109. |
| Storage job total | 4m41s | Physical loader assertion passed 1/1. |

The native metadata does not separately time browser build, authentication,
fixture setup, teardown or each retry. E01 timed out at 60s on both attempts;
those two attempts are included in the 6m21s aggregate. Do not attribute the
remaining aggregate to any one stage without additional native evidence.
Supabase image-pull time is included in stack startup; it is not independently
separated by step metadata. No Playwright image existed in this baseline.

## Scope and comparison limits

The browser job inherited a dependency on all static verification. This creates
an avoidable serial feedback delay for an independent, narrow presentation lane.
Removing the 10m17s setup does not alone establish five-minute feedback: backend
startup/migrations, production compilation and test execution still matter.
The first change must measure official-image pull/startup rather than treating
preinstallation as free. Existing required DB/security/integration checks remain
independent of the additional feedback lane; failed or skipped checks cannot be
relabelled as validated.

Observed read-only GitHub configuration on 2026-10-27: main classic protection
endpoint returned HTTP404 Branch not protected; repository rulesets returned
an empty array. This is a point-in-time observation, not permission to remove
check contexts or change repository protection. Preserve the current native
job names and document their unchanged meaning.

Read-only Vercel project API inspection: gitProviderOptions.createDeployments
was enabled and commandForIgnoringBuildStep was exactly `exit 0`. This blocks
builds through cancellation; it is not evidence that Git integration is disabled.
No hosted settings were changed. Recheck immediately before publication and
check production separately before any future authorized merge.

The dedicated field, checked separately after the reduced connector omitted it,
is `previewDeploymentsDisabled=true` (present). That is the authoritative
Preview-disable observation. Generic `createDeployments=enabled` does not
contradict that dedicated Preview setting. Production remains a separate check.

## Prior-run cross-check: the apt delay was an outlier

| Run/head | Verify | Browser/OS install | Browser smoke | Browser job | Whole run |
| --- | ---: | ---: | ---: | ---: | ---: |
| [40388798006](https://github.com/rthunborg/Kopplas/actions/runs/40388798006) / 220d68fa | 2m32s | 28s | 4m16s PASS | 7m45s PASS | 20m07s FAIL |
| [40384620314](https://github.com/rthunborg/Kopplas/actions/runs/40384620314) / 9fa34f19 | 2m46s | 27s | 5m17s PASS | 8m55s PASS | 20m53s FAIL |

Both earlier whole runs failed in the database job. Their metadata summaries
are retained beside this file. The 10m17s install is an observed network outlier,
not a typical recurring cost. Preinstallation removes dependence on runtime apt
mirrors and pins the environment, but its image pull may cost more than the old
27-28s typical install. Measure that tradeoff; do not advertise a guaranteed
ten-minute reduction on every run. These differing heads are historical
observations, not controlled same-source A/B measurements.
