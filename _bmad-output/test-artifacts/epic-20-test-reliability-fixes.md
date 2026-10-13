# Epic 20 bounded test reliability repairs

Author: `/root/epic20_test_reliability_fix`, Sol 6.1 High for authentication and transactional integrity. Scope: exactly DET-H3-01, DET-H2-01 and DET-H2-02 from `test-review-epic-20.md`. This is a post-audit test repair; broad review rounds and trace-remediation iteration remain unchanged.

- DET-H3-01: seed one UUID-named linked file with real Storage bytes, observe its exact customer-panel row, archive that file after hydration, submit the real preview action, and unconditionally assert visible generic `role=alert`, exact existing copy, no URL/path/bucket/existence disclosure. The inherited panel uses generic File signing, so the driver preserves Option A. Exact object/file/link cleanup runs in finally.
- DET-H2-01: derive otherwise-valid expired/future HMAC proof issuance from the DB prepare challenge, keeping its fixed five-minute lifetime. Run the real finalizer while Node `Date.now` is skewed by ±24 hours; assert FSA10/no data/no audit and restore the spy. This proves DB-relative negative vectors still reject under runner skew; it does not claim the skew alone distinguishes a hypothetical Node-clock validator.
- DET-H2-02: obtain both SQL sessions, hold contact authority and authenticate the finalizer before starting the 15-second remaining proof/real-URL lifetime. Assert dispatch <5 seconds and >8 seconds remaining after observed blocking, observe actual PostgreSQL expiry, release unchanged authority, then require FSA10/no audit. Proof expiry uses an independent synthetic HMAC; URL expiry uses real Storage signing. Readiness races the PID against request failure so setup rejection enters holder rollback and settles the prepared-args wait.

## Actual verification

All ordinary suites used `SUPABASE_TEST_REQUIRED=1`, API `127.0.0.1:60431`, DB `127.0.0.1:60432`, CI unset, one configured production server at port 3100, and guard-owned Chrome CDP `127.0.0.1:60433`. No DB clock replacement, skip-based coverage, production/schema/helper edits or Lovable observations.

| Check | Native exit | Executed / passed / failed / skipped | Seconds |
| --- | ---: | --- | ---: |
| integration | 0 | 114/114/0/0 | 54.53 |
| browser | 0 | 4/4/0/0 | 15.99 |
| suppressed-alert | 1 | 1/0/1/0 | 20.51 |
| aborted-readiness | 1 | 2/0/2/36 | 2.86 |
| lint | 0 | not a test suite | 4.26 |
| typecheck | 0 | not a test suite | 4.53 |

Final affected integration suites: documents-signed-access-lock-races.int.test.ts 38, documents-signed-access.int.test.ts 76. Browser: all four inherited preview journeys, zero flaky. Scoped ESLint and TypeScript completed after the readiness fix.

The two deliberate fault probes are expected failures, not passing coverage. Alert suppression removes the real rendered error element through a temporary DOM observer; the test fails at unconditional `toBeVisible` (1 failed, zero skipped). Request-setup injection throws before PID readiness; both expiry cases fail promptly at `finalizer setup failed before readiness: FIXTURE_SETUP_FAILURE`, afterAll completes, and the process exits in 2.86 seconds. Its 36 filtered cases are not execution evidence. The first temporary abort probe failed collection because its external source alias could not resolve; that attempt is retained and credited with zero tests. Neither probe modifies repository production code or the final test files.

Commands: `pnpm exec vitest run tests/integration/commands/documents-signed-access.int.test.ts tests/integration/commands/documents-signed-access-lock-races.int.test.ts --no-file-parallelism --reporter=json --outputFile=<proof>/integration.vitest.json`; `pnpm exec playwright test tests/e2e/files/entity-file-preview.e2e.spec.ts --reporter=json`; `pnpm exec eslint <three assigned test paths>`; `pnpm typecheck`. Temporary fault probe argv, generated source hashes, counts, before/after hashes and native exits are in the raw receipts.

## Source and raw evidence

Tested HEAD: `c210b6376c4b176ec0953ea208181f1be8653bce` with uncommitted assigned test repairs. These are dirty working-blob results, not committed-HEAD release evidence. Root-owned run state was also dirty. Browser source remained identical through the later integration-only readiness/comment changes. Reused BUILD_ID: `hY4oofJ3bUEsQ-3fLITrm`; `git diff c65c18649ac5641f9520b12e03a8b3f20af8f610 -- src` was empty. No fresh production build is claimed here; root final committed replay remains separate.

| Assigned source | Tested working blob | HEAD blob |
| --- | --- | --- |
| `tests/e2e/files/entity-file-preview.e2e.spec.ts` | `9202bc2d9ca23ea6fd24c192ecb53c7a5504f0d5` | `a5837195fefefa6b280b46f1bd5a44ddc8b553fa` |
| `tests/integration/commands/documents-signed-access.int.test.ts` | `5042965bd6fbbfd9c250f55214ff77d9a8b56b23` | `5594186c5def14712a32fd0df53ec8c1ce2cc5f5` |
| `tests/integration/commands/documents-signed-access-lock-races.int.test.ts` | `4fc97b887cc55b8f52d38ce8fc948c780ba88e35` | `3b7c361060d6d04a716ee41469ecccd34fe0326b` |

Raw directory: `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-epic20-test-reliability-c210b637/`. Native receipts retain full argv, origins, timestamps and before/after source SHA256/Git blob IDs. Initial 114/114 integration before the readiness fix is retained under `integration-before-review-fix.*`; only final `integration.*` receives current-source credit.

| Raw check | Log SHA256 | JSON report SHA256 |
| --- | --- | --- |
| `integration` | `507a533fec5432ee4b2f98f17d744098836e4ca1d1f5b913e40b952632527d49` | `49a6a73765c58c0b0b89ba037a9a4b41af47960c204560e8c83672c0d852898a` |
| `browser` | `227565a378d1ec21804f3b0952ff1979a065ed69aa118a7057d4549b85968963` | `6bca743546113fc298cdf3de36502b714f44f35f7291fd5be4a08521bfddc83a` |
| `suppressed-alert` | `f7909cfc1a068602affcf805a729c7d0b50bafbf136527cae4caac29522ba66f` | `067e49176891c861a015580eeeecf10ef7b5734f28e24935d1894bf39b599511` |
| `aborted-readiness` | `333acbdb1ce80afa4155cb95fcc8ec49d817341878300092936d36c7696e6b7a` | `7c6c35dd213d72e4e63ce173eb1c30df6fb123d21f466af2fb8a51d79e0cde28` |
| `lint` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `not applicable` |
| `typecheck` | `4006c7b8a409701c91dd2de3d66fdf6578bddb728b9fc4816ec07eb42636cd4d` | `not applicable` |

## Narrow independent review and author trail

Independent `/root/epic20_test_reliability_fix/narrow_test_fix_review`, explicit Sol 6.1 High, returned CLEAN after reviewing only these three fixes and their fixture effects. The readiness failure-path finding was repaired with Promise.race and verified by the completed final suite plus the forced setup-failure probe. The reviewer independently matched current working blobs, native receipts, raw log hashes, JSON assertions and the refreshed concerns 4/5; 37 review stops validate with zero errors and native exit 0. No unresolved consequential finding, fourth broad round, broad audit or rubric-only cleanup. Raw confirmation: `narrow-review.json` in the evidence directory.

The affected Story 20.1 Suggested Review Order was refreshed by this fix author with current rationale, proof/expiry/denial stops and this evidence link. Stale stops in that same section were checked against current declarations/assertions and moved to their actual lines, preserving earlier rationale and historical records. Story 20.2/20.3 frozen intent and review counts remain untouched.

Option A, Contract D, Phase C exclusions and zero Lovable observations remain retained. No open product decisions or production gaps identified. The 28 rubric-only MEDIUM/LOW recommendations remain outside this repair; release acceptance and Git/aggregate state belong to the root. Guard Stop accepted all three owned usage releases with native 0/ok=true/state=stop_requested: browser `301d573f-c1fa-4433-a69b-5ffb75e9831e`, server `dd9e2d66-965c-42d4-8b74-b1dd1aadcbe8`, Compose `6ef47948-c8c3-4587-ad63-31c90ff4c5de`. Raw `browser-stop.json`, `server-stop.json` and `compose-stop.json` record acceptance, not verified shutdown; retained data/profile/build state is preserved.
