# Story 15.4 ownership inventory successor

2026-10-20; preparation-only candidate for Coordinator's same High allocation review. Read-only source inspected at `05b10ce2c35e33269e4ccb359b770fb25eae2938`. This adds two missing verification-infrastructure path requests to the original handoff; it changes no product requirement, approved specification, kernel, prior evidence, write grant or runtime admission. Root's current canonical state edits are expected and outside this writer's scope. Sol High is retained for actual service-only authority, transaction rollback and shared fault-DDL decisions; no child or new BuildAuto run was invoked.

## Companion need 1: register the essential browser file

**Needed: `package.json`, only `scripts.test:smoke`.** Current line26 is:

```text
playwright test tests/e2e/auth/login-and-tenant-context.e2e.spec.ts tests/e2e/auth/auth-mail-callback.e2e.spec.ts tests/e2e/jobs/jobs-depth.e2e.spec.ts tests/e2e/conflict-resolver.e2e.spec.ts --reporter=list,json
```

Proposed exact value:

```text
playwright test tests/e2e/auth/login-and-tenant-context.e2e.spec.ts tests/e2e/auth/auth-mail-callback.e2e.spec.ts tests/e2e/jobs/jobs-depth.e2e.spec.ts tests/e2e/conflict-resolver.e2e.spec.ts tests/e2e/time-reports.e2e.spec.ts --reporter=list,json
```

The new filename is already in the original handoff. It will contain three essential flows: own booking-card filing through persisted personal week; standalone filing with failed/lost response and explicit same-attempt retry at360×640; PL/Admin person/job/week review and annotation through reload. Keep durable report/audit readbacks and own/peer authorization controls. This is registration of required essential coverage, not an exhaustive browser expansion or new feature. `.github/workflows/ci.yml:510–521` already runs `pnpm run test:smoke` for normal CI and full `test:e2e` only on explicit release-validation dispatch, so no workflow edit is requested. Preserve all four existing Auth/Jobs-depth/resolver filenames and reporter flags. No dependency, lockfile, script other than this value, absent E16 test import or separate browser runtime is authorized.

## Companion need 2: isolate the two actual fault-proof suites

**Needed: `vitest.config.ts`, only two exact file additions in each existing project list.** At lines43–55 the current `integration-parallel.exclude` and `integration-audit-ddl.include` both contain:

```text
tests/integration/jobs/job-runs.int.test.ts
tests/integration/commands/conflict-resolver.int.test.ts
```

Append these two paths to **both** lists, preserving the existing entries:

```text
tests/integration/commands/time-reports.int.test.ts
tests/integration/notifications/time-report-nudge-producer.int.test.ts
```

Both proposed files already exist in the original handoff as future story-owned tests. Keep root `fileParallelism:true`, parallel groupOrder0/include glob, serial `fileParallelism:false`/groupOrder1, globalSetup, timeouts, error posture and every other configuration value unchanged. The two files must execute only in the serial project, never both projects; other new report RLS/read/component files remain in the normal parallel lane. No directory exclusion, new project, global parallelism change or blanket configuration grant is requested.

Reason: stage-aware filing/annotation audit rollback and nudge notification/audit rollback must prove the intended business stage was reached, then show every effect rolled back. The existing seed hook (`supabase/seed.sql:55–84`, consumed by `tests/integration/jobs/job-runs.int.test.ts:57–84`) supports correlation-only audit rejection without runtime DDL and remains available for generic audit checks. It does not inspect a newly written time-report/annotation or newly emitted nudge stage. The existing resolver proof (`tests/integration/commands/conflict-resolver.int.test.ts:223–238`) uses unique temporary functions/triggers on shared `public.audit_events` and `public.notifications` for such stage assertions. The proposed two time-report suites may use that bounded approach for real stage-specific failures, so allocate their exact serial-lane membership before ATDD/build. Do not edit seed.sql, existing fault helpers or production functions to add test hooks. No broad helper/factory write is requested.

### Exclusive fixture and barrier conditions

- Root alone allocates the isolated guard-managed stack/test runtime and required lane. This proposal starts/adopts nothing. Ordinary clients exercise actual filing/annotation; only the existing loopback-gated test admin SQL installs test-only faults. The real nudge producer still invokes its checked service-only RPC; no raw service-role table ACL is widened.
- The `integration-audit-ddl` group begins after the parallel group has settled and runs its files serially. Within both new files, fault tests are not concurrent; await all started RPCs, concurrent-race tasks and transactions before installing or removing any fault. Explicit barriers, not sleeps, establish stage/race order. An independently launched test process sharing the same database must not overlap this fault lane; Root must serialize it or allocate another isolated database.
- Own per-run tenant/user/report/attempt/notification IDs and cryptographic UUID-derived SQL object names. Trigger predicates bind exact tenant plus operation correlation/target (for nudges, exact recipient/date/category/subject), pass through unrelated rows, verify the intended in-transaction stage and raise a unique asserted test SQLSTATE. Prove the expected fault was reached; an arbitrary rejected RPC is insufficient. Functions live only in `test_support`, use empty search_path/qualified names, and grant no API/app-role execution.
- Install one test's temporary objects at a time. Use `try/finally` to drop only that test's exact trigger/function after its operations settle; remove only its correlation-scoped control rows and owned fixture data. Assert physical report/review/audit/notification state equals the pre-attempt snapshot, then inspect the catalogs to confirm the exact owned fault objects are absent. Do not drop shared schemas/triggers/tables, clear another test's controls, reset the stack or clean by name/port/process sweep. A cleanup failure is a named test blocker, never permission for broad cleanup or another overlapping run.
- Keep fixture work within the original `tests/support/time-reports-atdd.ts` and exact new suites, with existing factories consumed read-only. No new shared factory/helper path is requested. Actual later collection must prove each fault file belongs once to the serial project; full REQUIRED DB/RLS execution and essential browser results still need exact-head receipts. These are conditions for later verification, not executed evidence here.

## Reserved migration and preserved integration boundaries

Coordinator reports the name reservation **`supabase/migrations/20261020190000_time_reports.sql`**, strictly after current108 `20261020180000_conflict_resolver.sql`. This is reservation metadata only: no SQL-write grant or runtime admission is inferred. Recheck actual combined migration inventory before creation. Existing105/106/107/108 remain immutable.

Preserve v3 facts/proof domains/exact13 claims, tenant/role lock order, resolver common refresh/ledger and in_app booking.changed. Preserve future integrated16.2 role/member/lead/date scope, all24 existing E16 migration assertions and the union of actual job-member/Jobs-depth plus resolver smoke fixtures when those files are present and allocated. Do not import missing E16 files or invent a combined inventory. The new smoke append preserves current Auth/Jobs-depth/resolver coverage; the exact Vitest additions preserve existing DDL cases and normal parallel coverage.

## Frozen bindings and scope of this successor

The approved spec raw SHA256 remains `7933d020fba0986d283294cb94f85859a58d1fdc83f884a4d29e8b69751c89bb`; LF intent-contract SHA256 remains `3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb`. All **19 pre-existing bindings** (spec +13 original preparation files +5 independent-validation files) are preserved byte-for-byte. Compact aggregate binding SHA256: `c2ade38ad3a1936acca47b03755c7cdd35be681d4600fe1255ea29f9aa4eeb24` over the pre-write list ordered by PowerShell `Sort-Object FullName`, each relative forward-slash path followed by one space, lowercase file SHA256 and LF, encoded UTF-8. The existing manifests retain per-file hashes; they are not rewritten to include this successor.

Only this new document is written. Requested additions are exactly `package.json::scripts.test:smoke` and the two named lists in `vitest.config.ts`, subject to Coordinator's final conditional allocation. No grant is asserted. No source/schema/test/config/state/sprint/timing/Git/provider/resource/secret/foreign-checkout mutation, broad review or runtime check occurred. Development/release separation, no-legacy policy and independent sensitive review remain intact.
