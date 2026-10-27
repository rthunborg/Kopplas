# Auth cleanup investigation - 2026-10-26

Route recorded before dispatch: GPT-6.1 Sol High implementation/investigation,
because Auth fixture integrity and diagnostic privacy are sensitive. Parent
coordination remains Low; no effort inheritance change is claimed. Ownership is
limited to the NUDGE004 helper, relevant factory/test diagnostics, the guarded read-only CI collector/inverse contract, and this report.
Other authors' runbook/activation edits remain theirs. E15 owner confirmed through
the parent that these paths have no active edit/claim; the old E15 session stays
inactive. No product/schema/policy/test-timeout/skip/concurrency change is authorized
or made. No local service, demo DB, secrets, external write/push/CI dispatch or
managed resource was used by this author.

## Original failure and exact source identity

PR109 candidate `568bcfd4e866b17bee2f787414b14841a96b5b21`, original PR CI
[40357804045](https://github.com/rthunborg/Kopplas/actions/runs/40357804045), failed
only the required `db` job among the five development jobs. Static/build,
checkpoint admission, recovery/storage and essential Auth browser job passed;
optional diagnostics were skipped. Native full integration artifact ID
`12666009810` is `native-full-integration`. Downloaded `full-integration.json`
SHA-256: `e9b328b6ec2892f1cccad2c44ac9bc9d9b3f5edb600673b0e75bcb67a2684bed`.
Its assertions report **2088 passed, 1 failed, 52 skipped, 9 pending**; aggregate
native counters report `numPendingTests=52`, so preserve the distinction rather
than treating pending/skipped as executed coverage.

The sole failed case is `15.4-NUDGE-004`. Its two failure entries originate at
`deleteAuthUser` under `withNudgeRecipients`' `Promise.allSettled`, indexes 7 and
35, each ending in upstream `message="{}"`. Nine batches seed seven extra users
each; the helper launches **63 deletes concurrently** after its owned rows and
profiles. Both indexes are the projektledare position (index mod 7 = 0). This is
an observation, not proof of role causality or a deadlock. Fixed source labels
locate `cleanup-auth`; no failed producer/tenant/cursor/business assertion appears
in the native record. Original test duration is approximately 4171.35ms, not a
configured timeout failure.

Unmodified base `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f` and original PR head
have identical committed Git blobs for every inspected implicated entry:

| File | Shared Git blob |
| --- | --- |
| `tests/support/time-reports-atdd.ts` | `314f7d518984ef3858c55e8cbd9acb30c49c3cf6` |
| `tests/factories/tenants/core.ts` | `f72a04caab1acbc2d3d43f1a75c2cc6048125bc0` |
| `tests/support/bookings-atdd.ts` | `a1217258358c416364fd2843b04efe0b4f1d29c2` |
| `tests/integration/notifications/time-report-nudge-producer.int.test.ts` | `209528d744adb11d6e266e92a37c4a8dc19b2c13` |
| `vitest.config.ts` | `1c75b680f80f5f1f61eaba8fccac9a0c9d257770` |
| `.github/workflows/ci.yml` | `3c2fca9d9da9d9dd8a843bbd1fc565db91e29e8a` |
| `pnpm-lock.yaml` | `3c0ae6b01c1853d5478b9d0727bc64dba3eb8a12` |
| `supabase/config.toml` | `1836067cabc316882815b657355b5b10f3eb5d25` |

These identities establish no change to the inspected path, **not a proven
baseline runtime failure**. The E15 owner attributed prior passing run
40208565269 to d190feb9; that historical context is not a new exact-d02 comparator.

Original job logs identify CLI 2.115.0, GoTrue v2.195.0 and PostgreSQL
17.6.1.159. Resolved image digests/identical-host scheduling were not established.
The original workflow uploads native test JSON but no Auth/Postgres container
logs before teardown. That job and its disposable stack have ended; the absent
server error/SQLSTATE cannot be reconstructed from `{}` or replaced by historical
E14 deadlock observations. Original raw logs/native JSON were downloaded read-only
to the author's OS temporary directory; no raw server/request material is copied
into this committed report.

## Proven observability defect and bounded correction

Installed `@supabase/auth-js` 2.108.2's actual `handleError` short-circuits its
server/gateway status set (including HTTP500) into `AuthRetryableFetchError` before
parsing the response body. `JSON.stringify(Response)` normally yields `{}`; the
error still owns numeric `status`, while `code` is unavailable. A transport error
can also yield `{}` with **status0**. Therefore the original message proves
neither HTTP500 nor database deadlock.

The original factory creates a new message-only `Error`, losing the remaining
class/status/code. A deterministic test executes the real pinned SDK with a
mocked HTTP500 DELETE response, then the actual unmodified d02 factory body. It
reproduces the `{}` message and field loss without any network or database. The
same original function is retained as a bounded test snapshot (SHA-256
`fabd0deb22e2c1245c058f21da2b8131f6adf3eeb1ba53221da798d7c263a962`, exact d02 core.ts function bytes), so ordinary shallow CI needs no ancestor
fetch. The author executed the original Git-body comparator before snapshotting;
independent review checks the retained snippet against that recorded Git blob. The
same actual current factory body under its opt-in redacted mode retains safe
class/status; HTTP400's parsed allowlisted code and transport0 are distinct cases.
This proves the diagnostic defect and correction, not the backend delete cause.

Change: `deleteAuthUser` gains optional `"redacted"` failure mode. Only this nudge
recipient cleanup opts in. A small pure adapter reads only own data properties
`name`, `status`, `code`; hostile getters/messages/causes/bodies/headers are not
read. Output is a fixed class, status0 or integer400-599, and an explicitly
allowlisted Auth code (`other`/`unavailable` otherwise). No user ID, error message,
SQL, request path, key/token or original cause is returned. Rejections stay
rejections. Successful calls, default callers, local-only guard, all63 delete
attempts/Promise.allSettled, aggregate failures and assertions remain unchanged.
No retry, sleep, swallowed error, reduced matrix or cleanup serialization is added.

## Controlled baseline and subsequent diagnostics

The separate High publisher/executor prepared and dispatched exactly one normal
baseline run after reviewed ownership/main rechecks:
[40367022378](https://github.com/rthunborg/Kopplas/actions/runs/40367022378), main at
exact d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f, checkpoint
`3bbc8900-6ecb-4bd1-9b4b-f03b8ff6d5cc`, workflow296219797. All release/cause-proof/
optional diagnostic flags are false; no temporary variable was needed. Its state
receipt belongs to that executor at
`tmp/private/frontend-gate-activation/baseline-main-3bbc8900-6ecb-4bd1-9b4b-f03b8ff6d5cc.state.json`.
This author did not dispatch or retry it. The baseline completed SUCCESS on all five required jobs. Native integration
artifact12672696071 reports2198 total =2146 passed,0failed,52explicit pending;
NUDGE004 passed at approximately4816ms. The original2150-count inventory was
incomplete after serial bail1: do not combine it with this run, normalize its
historical skips/pending, or double-count the separate storage proof. That separate
artifact12671496390 has1PASS/0pending; browserartifact12672160721 has65expected,
0skipped/unexpected/flaky/errors. The executor's exact receipt/summary is retained
under the checkpoint directory. This is one comparable baseline success: the
original failure did not reproduce on this run. It does not identify the original
backend cause or justify a cleanup ordering/retry change. A repeated failure establishes baseline reproducibility for that run,
while underlying cause still needs actual class/SQL evidence.

A pure bounded reducer is prepared for a later independently reviewed owned-CI
collector. It accepts **only timestamp-prefixed `docker logs --timestamps` lines**
for caller-qualified `auth`/`postgres` services in an explicit <=15minute window;
limits are 2MiB total, 4000 lines and32KiB/line. It outputs diagnostic-only
acceptanceCredit0 counts of allowlisted SQLSTATEs, separately labeled phrase
observations and Auth DELETE400-599 status counts. Error facts come only from
Auth's structured backend `error` field on `/admin/users/<uuid>` DELETEs or the
Postgres ERROR/FATAL/PANIC text, never request bodies/headers or STATEMENT text. It never outputs timestamps,
raw lines, SQL/table/constraint names, user IDs, paths, request bodies, credentials
or arbitrary error codes. Missing timestamps and oversized input retain incomplete
coverage. A phrase such as "deadlock detected" does not fabricate an observed
SQLSTATE; the two fields remain distinct.

### Failure-only collector wiring (not yet executed hosted)

`scripts/ci/auth-cleanup-collector.mjs` is now wired into the existing db job after
native JSON upload and before unchanged `supabase stop`. Both added steps require
`failure() && !cancelled()` and exclude the separate cause-proof lane. The collector
itself reads native JSON first and requires the exact failed NUDGE004 case, its
fixed `cleanup-auth` source label and the redacted Auth failure. With no match it
performs no Docker qualification/log read and records not-applicable0credit.

The selected case must be the last executed assertion (remaining pending/skipped)
under the existing serial/bail partition. Native suite end minus case duration,
with2seconds before and1second after, defines a <=33001ms bound; future/malformed/
nonfinal windows refuse. This is an explicit narrow derived window, not proof of
an exact server request join. A subsequent collector may classify evidence only
from that window; missing facts never prove absence of backend errors.

Existing `validateAdmission`/`validateStackIdentity` are reused unchanged. The
collector requires Linux GitHub-hosted db job, attempt1, exact current job binding,
real workspace/.git identity, actual checkout PR-head/dispatch SHA, fresh project
DB/gateway identities and loopback publications. The Auth peer additionally must
be the fresh running same-project/same-network pinned GoTruev2.195.0 container,
created before the selected window and without a host publication. Docker inspect
reads only a fixed metadata projection, never Config.Env. The existing local CLI
status is captured privately to validate its actual local-demo endpoint/issuer
contract; keys/status/raw identities are never returned or uploaded. No provider
secret, SQL connection/query or changed logging control is involved.

Only after those checks, full captured container IDs are used for two finite
`docker logs --timestamps --since --until --tail4001` reads. Every read has an
identity recheck before/after; process calls are bounded5seconds and a30second
collector deadline, plus the workflow's1minute ceiling. Docker output is bounded
in memory and never written to disk or printed. The reducer discards raw input
and returns only the previously described closed facts. The artifact
`native-auth-cleanup-facts` contains only `test-results/auth-cleanup-facts.json`,
created fresh with symlink/size/path checks and fixed failure codes. Collector
failure stays explicit and cannot change the original failed integration result;
no continue-on-error, retry, teardown alteration or test mutation is used.

The CI source projector admits only the exact two new steps and reviewed collector
source hash; the original workflow inverse hash remains unchanged. Missing,
duplicated or changed diagnostic commands fail that guard, and every unrelated
workflow byte still reaches its existing drift checks. This is a narrow extension
to the existing diagnostic contract, not a disabled fingerprint check.

The collector has **not been launched** locally or hosted. Its mocks/real pure
ownership validators qualify control flow and privacy only. A future one-shot
current-head CI after independent High review is meaningful new diagnostic-code
evidence; it is not a blind replay of the original failure. No additional baseline
or retry is proposed. Actual original Auth/Postgres logs are unrecoverable; retain
that uncertainty if the symptom does not recur. Docker's [official log command
reference](https://docs.docker.com/reference/cli/docker/container/logs/) confirms
the bounded timestamp/since/until/tail controls; `--follow`/`--details` are absent.

If diagnostic evidence shows HTTP500 with matching PostgreSQL40P01, investigate
the actual competing transaction/lock shape before proposing test-only ordering.
If it shows23503/storage ownership/permission/network, follow that evidence instead.
Do not change product FKs/grants/policies or make deletion pass by suppressing a
real data-integrity guard. Hand any product/schema/boundary defect back to the
parent. A subsequent passing run never erases original failures.

## Current verification and limits

The 12 initial focused unit tests passed, zero failed/skipped: actual pinned SDK
HTTP500, unmodified baseline field-loss comparator, enhanced actual factory,
HTTP400 safe code, transport0, hostile getters/proxies/sentinels, default/success/
thrown-error behavior, unchanged63-delete call, and bounded log facts/privacy.
The final diagnostic unit file now executes14 cases, all passing with zero
failed/skipped. The11 selected existing NUDGE helper/callback/source-label/meta
regressions passed, zero failed/skipped. Targeted ESLint and full TypeScript checks
passed after correcting new test import typing, and passed again after the final narrow reducer change. The broader unchanged calendar runtime unit file executed
201 cases:199 passed and2 failed on Windows CRLF-dependent migration-body/fragment
comparisons (unit lines1953/2198). Its test file, calendar helper and both source
migration Git blobs match d02 and were not edited; these failure paths do not call
the Auth cleanup helper. They remain failures in the recorded local broad command,
not passing coverage, and are outside this bounded diagnostic change. No live Auth/Postgres query or modified
NUDGE integration test ran in this author session. Initial independent High review accepted the diagnostic adapter and found one P2 in the reducer: nested SQL text could mimic an ERROR header. The reducer now anchors recognized PG severity headers and tests hostile literals/comments/DETAIL/CONTEXT; targeted follow-up and the new collector High review remain pending before publication. The diagnostic-only change does not resolve the
original backend failure or establish required full integration PASS.

Supabase skill was read. Its changelog index was fetched and relevant Auth/error
documentation consulted; no applicable admin-delete contract upgrade was inferred.
Official [admin delete reference](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
requires the privileged test-only admin path; [user-management troubleshooting](https://supabase.com/docs/guides/troubleshooting/dashboard-errors-when-managing-users-N1ls4A)
directs Auth and Postgres logs for underlying database errors. The general examples
are not permission to weaken project constraints or grants. The public
[changelog index](https://supabase.com/changelog.md) includes unrelated Auth endpoint/
TLS/Node lifecycle changes; actual pinned SDK source explains this narrow error
representation. No SDK/configuration upgrade or schema change was made.

Build skill renderer ran exactly once successfully for this continuation and
returned `_bmad/render/bmad-build/kopplas-quality-gate-5782a5eed358/16f2a8cd76003a5573c6/workflow.md`.
Only its supported process contracts apply to this already authorized bounded
investigation; no installer workflow, product story, epic run or done/release state
was changed. Visual applicability is N/A: test tooling/diagnostics only, no product
presentation. Preserve the existing project gate and independent review boundaries.

## Suggested Review Order

### Preserve deletion behavior and diagnostic privacy

The API call count, local-only guard, failure/aggregate behavior and63-user matrix
stay intact. Opt-in at the specific nudge cleanup boundary keeps other factory
callers unchanged; own data descriptors and closed output vocabularies prevent
upstream messages, IDs, causes and secrets from entering the safe diagnostic.

- `tests/factories/tenants/core.ts:370` — `deleteAuthUser`: retains one guarded admin delete and opt-in redaction.
- `tests/support/time-reports-atdd.ts:271` — `Promise.allSettled`: retains all concurrent attempts and rejection aggregation.
- `tests/support/auth-cleanup-diagnostics.ts:19` — `authCleanupFailure`: emits fixed safe class/status/code only.
- `tests/unit/support/auth-cleanup-diagnostics.test.ts:41` — `pinned SDK500`: compares real SDK behavior with the byte-pinned d02 factory.

### Class facts remain diagnostic-only

The reducer is wired only through the guarded failure-only CI collector; no runtime collection has been executed.
Its bounded output distinguishes actual SQLSTATE observations from phrases and
excludes request payload/SQL statement text. A future collector needs separate
reviewed job/container/window qualification before any backend conclusion.

- `tests/support/auth-cleanup-log-summary.ts:12` — `summarizeAuthCleanupLogs`: constrains service/window/input and closed output.
- `tests/unit/support/auth-cleanup-diagnostics.test.ts:100` — `owned log reducer`: verifies fixed facts with sensitive sentinels absent.
- `tests/unit/support/auth-cleanup-diagnostics.test.ts:120` — `request body header`: blocks fabricated facts from irrelevant payload text.

Evidence:14 diagnostic unit cases and11 relevant existing nudge/meta cases
passed without skips; broader Windows unit failures remain recorded above.
Final targeted ESLint and full TypeScript checks passed after the reducer narrowing.
No live modified Auth/DB verification, backend-cause proof, independent approval
or publication is claimed by this author report.

### Wire collection without broadening the CI contract

Native case selection precedes resource reads. Existing positive hosted/stack
ownership is reused, the Auth peer and exact checkout are added, and only full
captured IDs are read with before/after identity checks. The two added steps are
exactly inverted for the historical CI fingerprint; the historical hash itself
is unchanged, and the collector source is pinned rather than ignored.

- `.github/workflows/ci.yml:298` — `Capture bounded owned Auth`: runs only after failure, before unchanged teardown.
- `scripts/ci/auth-cleanup-collector.mjs:19` — `selectNudgeFailure`: refuses nonfinal, unmatched and invalid native windows.
- `scripts/ci/auth-cleanup-collector.mjs:48` — `validateLogSources`: reuses shared stack proof and qualifies the Auth peer.
- `scripts/ci/auth-cleanup-collector.mjs:127` — `collectAuthCleanupFacts`: no-match performs no source read; errors remain explicit.
- `tests/support/calendar-feed-ci-contract.ts:95` — `authCleanupEntry`: admits one exact new fragment with collector-source pin.
- `tests/unit/scripts/ci/auth-cleanup-collector.test.ts:94` — `only exact collector steps`: retains original hash and unrelated-drift rejection.

Final executable evidence before High collector review:14 adapter/reducer cases,
10 collector/ownership/privacy/contract cases and the existing CI projection case
all passed without skips; the11 relevant existing NUDGE/meta cases also passed.
The original historical workflow inverse remains
`48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0`.
JS syntax, parsed CI YAML, diff checks and local tooling visual N/A check passed.
YAML parsing uses the already frozen js-yaml4.3.2, not actionlint. Final targeted ESLint and full TypeScript checks passed after the fixture typing
correction. Independent High collector review is pending at this writing. No actual log read, service launch or collector runtime evidence
is claimed. One future qualified current-head CI is the planned new-evidence run;
the single completed baseline will not be repeated.

Independent High collector review confirmed ownership/bounds/exact inverse and
that the reducer P2 is fixed. Its one stream-boundary correction is now applied:
Docker stdout/stderr have an explicit newline separator, so a complete stdout
record without trailing LF cannot merge with the next stderr record. A focused
regression checks both500/503 records survive and empty separators are harmless.
The reviewed collector source pin was refreshed; no cleanup behavior or original
failure attribution changed. Targeted confirmation of these exact latest bytes
remains required before publication.

Latest stream-boundary verification:25 adapter/reducer/collector tests passed,
zero failed/skipped, and the existing exact CI projection case passed with the
historical hash unchanged. Targeted ESLint and full `tsc --noEmit --incremental
false` passed after this final correction. All13 author review stops validate.
The collector canonical source pin is
`0cc442d2dd373cbb6b9cacfc54da50ddc926a8f8d841ffe87ce0d7e2e660cbc9`.
Only targeted independent confirmation of this correction and the separate
current-head CI/publication steps remain. No live collector execution, cleanup
behavior fix, original backend-cause proof, merge or deployment is claimed.
