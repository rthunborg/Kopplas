---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-20'
workflowStatus: 'completed'
workflowType: 'testarch-atdd'
tddPhase: 'RED scaffolds; not implementation acceptance'
storyId: '16.3'
storyKey: '16-3-arbetsorder'
storyFile: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-3-arbetsorder-2.md'
atddChecklistPath: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/atdd-checklist-16-3-arbetsorder.md'
planRevision: 'f3cf100709b92637270304e78a4356082b89e9a6'
specSha256: '43590fbacaea52d12c5754dc91b64fc2975628e8e973f25ab393676bcede902c'
generatedTestFiles:
  - tests/integration/commands/work-orders.int.test.ts
  - tests/integration/commands/work-order-files.int.test.ts
  - tests/integration/rls/work-orders.rls.test.ts
  - tests/e2e/jobs/work-orders.e2e.spec.ts
  - tests/unit/features/jobs/work-orders-domain.test.ts
  - tests/unit/server/commands/work-order-file-contract.test.ts
fixturePaths:
  - tests/support/work-orders-atdd.ts
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-16-3-arbetsorder-2.md
  - _bmad-output/test-artifacts/test-design-epic-16.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - vitest.config.ts
pact_mcp_reachable: false
---

# ATDD Checklist — Story 16.3 Arbetsorder

## Result and scope

Create mode completed against the approved seven-AC spec at the bound plan revision. **29 RED scaffold scenarios remain skipped**: 13 command/integrity, 3 RLS, 3 Files integration, 7 pure and 3 essential browser. Skips and collection are not executed acceptance coverage. One actual production-validator probe confirmed RED; no DB/browser test executed and no resource launched. Product implementation, migrations, shared tests, spec, dependencies and state were not changed.

Admin/PL plus the current own-parent lead may create/edit/assign and change ordinary child status. Only independently authorized Admin/PL reopens. Ordinary membership/assignment grants no additional mutation, parent, money, booking/time or Files/Documents authority. Assignees are eligible current parent members; zero/many are valid. Work-order dates remain nullable own Gregorian dates, never parent fallback. Typed dependency warnings use actual endpoints; missing/unreadable timing is anonymous unknown. Self-edge/duplicate/current-edge CAS are covered; distinct same-parent endpoints are valid. No transitive/multi-node cycle policy was added. Existing job-only dependencies, 16.1/16.2 grants, accepted identities and booking-v3 contracts are preserved.

## Acceptance mapping

| AC | Priority and layers | Scaffold contracts |
| --- | --- | --- |
| AC01 | P0 pure/command/RLS, essential UI | UNIT-001/002/004, INT-001/005, RLS-001/003, E01: both parent kinds; title/description/own dates/plural current members; current manager/lead; profileless managers; foreign/inactive/spoof negatives and audit. |
| AC02 | P0 pure/command, essential UI | UNIT-003, INT-002, RLS-003, E02: exact four-state graph; manager-only two reopen edges; terminal field edits; no create/update/table/helper smuggling or parent completion. |
| AC03/TR06 | P0 pure/command/RLS, essential UI | UNIT-004/005, INT-003/004, RLS-002/003, E03: three typed forms, same-parent sequencing, actual own date delay/equality/unknown, hidden reference privacy, edge CAS and old/new retention. |
| AC04 | P0 command/RLS | INT-004/005/006/007, RLS-003: replay identity/current authority, competing saves, independently budgeted locked revocations/eligibility, composite parent/tenant integrity and whole write/audit rollback. |
| AC05 | P0 pure/files/RLS, essential UI | FILE-UNIT-001, FILE-INT-001/002/003, RLS-001, E01/E02: existing shared upload/link/sign/selected-source/context/archive/restore, child+parent checks, independent Files entitlement, substitution denial and structural omission. |
| AC06 | P0 RLS/command/files, essential UI | RLS-001/002/003, INT-001/002/003/004, FILE-INT-002, E03: inherited current parent scope/role union/designation; assignment alone no grant; retained parent/booking/provenance rows. |
| AC07 | P1 state/browser | UNIT-006, E01/E02/E03: connected 360×640, durable reload, semantic controls, lost reply exact retry, newer draft/dirty baseline, stale/refetch and own files/dependency presentation. |

IDs above have prefix `16.3-`. Integration owns authorization/transaction matrices; browser proves three connected usable journeys instead of repeating them. Component assertions live in the headless state contract and essential browser flow, with no new component runner.

## Generated files and fixtures

| File | Scenarios | Lines |
| --- | ---: | ---: |
| tests/integration/commands/work-orders.int.test.ts | 13 (5 focused + 7 independent INT-006 races + audit rollback) | 341 |
| tests/integration/rls/work-orders.rls.test.ts | 3 | 181 |
| tests/integration/commands/work-order-files.int.test.ts | 3 | 214 |
| tests/unit/features/jobs/work-orders-domain.test.ts | 6 | 201 |
| tests/unit/server/commands/work-order-file-contract.test.ts | 1 | 23 |
| tests/e2e/jobs/work-orders.e2e.spec.ts | 3 | 312 |
| tests/support/work-orders-atdd.ts | adapter; no tests | 104 |

One new thin adapter composes committed 16.1/16.2 fixture factories, normal-JWT clients, observed tenant-gate/audit-fault seams and durable snapshots. Existing fixture teardown owns synthetic rows/storage. No new factory family, credentials, store, bucket, purpose, private runtime dependency or shared helper edit. UUID constants in pure tests are intentional boundary fixtures; integration resources use existing isolated factories. Each locked-fact case gets its own fixture and timeout budget, rather than nine fresh lifecycles in one 30-second body. Activated suites must use `SUPABASE_TEST_REQUIRED=1`; unavailable DB/Auth/Storage must fail or be reported unexecuted, never counted as pass.

## Binding assumptions and mock requirements

Future headless module `@/features/jobs/work-orders-domain`, checked command module `@/server/commands/jobs/work-orders`, read module `@/server/read-models/job-work-orders`, export/RPC/DTO/error spellings and the child pane query are **proposed replaceable adapters**, not prescribed architecture or observed UI. Reconcile them with the implemented public contracts before activation, while retaining behavioral assertions. Closed validation does not prove current authorization; checked SQL must revalidate locked current facts. Expected-state digests include relevant current fields/assignments/dependency edges so a stale dependency edit is refused. No extra tenant roles or generic framework are required.

No external service mock or fake persisted success is required. Browser E02 installs a narrowly matched one-shot route before the action, forwards the real server request, then loses only its response to exercise exact retry; all other traffic continues. Reconcile actual Next Action serialization before activation. Readbacks and audit counts establish durable outcomes. No legacy browser/URL/evidence was used.

Required proposed hooks: `job-work-orders-panel`, `work-order-pane`, `work-order-{id}`, `work-order-error` (alert), `work-order-save-status` (status), `work-order-refetch`, `work-order-retry`, `work-order-dependency-warning`. Bind Swedish accessible labels/buttons, prerequisite option values and `?workOrder={id}` to actual UI; these are replaceable selectors. Existing shared EntityFilePanel labels remain source-based contracts.

## Executed checks and limits

- Worker aggregation: all three structured outputs succeeded; full file contents, expected-to-fail metadata and persistent `test.skip` verified; no placeholder assertions. Final refreshed API transport matches its two fixed files.
- TypeScript syntax transpilation: 7 files, 0 syntax errors. Initial full TSC exposed three local diagnostics (one thenable callback/reply and one union fixture insert); author fixed them without changing assertions. Final `tsc --noEmit --incremental false`: exit 0.
- Controlled actual RED: temporarily enabled only FILE-UNIT-001; `node --experimental-strip-types --import ./tests/support/register.mjs --test --test-name-pattern=16.3-FILE-UNIT-001 tests/unit/server/commands/work-order-file-contract.test.ts` returned exit 1, **1 failed / 0 passed / 0 skipped**. Existing `job/job_evidence` metadata control passed; actual production validator rejected `work_order/job_evidence` (`false !== true`). Original skipped file restored byte-for-byte, SHA256 `F48C267D7351B19990A47091B5E852874B852E2BAAAAAC7E20D644184862908B`.
- Saved pure scaffold collection: `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/jobs/work-orders-domain.test.ts tests/unit/server/commands/work-order-file-contract.test.ts`: exit 0, **7 skipped / 0 passed / 0 failed**. This checks registration only.
- Playwright `test tests/e2e/jobs/work-orders.e2e.spec.ts --list --reporter=list`: exit 0, **3 Chromium tests listed**, no browser/server/fixture execution.
- Independent context-free Sol 6.1 High scaffold review: PASS, no consequential new-file error or false coverage claim. Narrowly checked real fixture/Files seams; no new broad product review.
- DB/RLS/Storage, migrations, direct physical recovery, browser execution, production build, full development/pilot gates: **unexecuted for 16.3**. Earlier story evidence is not 16.3 acceptance evidence. Root guard refusal is known `HOOK_CONTEXT_UNAVAILABLE`; no recovery/ownership workaround attempted. Root-owned qualified CI supplies post-implementation evidence.

Commands used absolute `C:/nvm4w/nodejs/node.exe` after setting the absolute worktree location. No managed sessions, browsers or services were started; no teardown needed. The harmless existing Node package-type warning was not treated as product failure. Private worker transports/summary/RED log use `C:/Users/Rasmus/AppData/Local/Temp/tea-atdd-*-2026-10-20T09-06-43-877Z.json` and `tea-atdd-16-3-validator-red.log`; they are workflow transport evidence, not imports or a prerequisite for committed tests. This checklist is the portable canonical handoff; no extra evidence packet was added.

## Implementation activation checklist

- [ ] Implement approved child/assignee/typed-edge schema, composite constraints, SELECT/RLS and hardened checked SQL with current authority/eligibility, CAS, canonical identity/replay, one audit or atomic rollback. Preserve old dependencies and booking-v3 consumers; coordinate any shared E15-owned seam through root without creating a whole-epic gate.
- [ ] Implement proportionate headless validation/date/status/dependency/draft state contracts; reconcile lazy pure bindings. Activate the seven pure cases task by task; first see meaningful RED, then green.
- [ ] Reconcile the thin real command/read adapter and error codes. Activate 13 command and 3 RLS cases, retaining independent race lifecycles and observed lock/audit-fault checks. Do not replace SQL proof with TypeScript-only guards.
- [ ] Enroll `work_order` through existing `job_evidence` file source/selected-context/sign/archive/restore paths with current child+parent and independent Files rights; activate three file cases and preserve all shared Files tests.
- [ ] Deliver usable accessible connected child flow with own dates, plural members, status/reopen, actual-date dependency warnings and shared files. Reconcile selectors/action transport, preserve retry/draft/baseline semantics and activate E01–E03.
- [ ] Implementation author adds only `tests/e2e/jobs/work-orders.e2e.spec.ts` to `test:smoke` **before** final `--reporter=list,json`, preserving all existing auth/Jobs paths; root does not edit package/test code.
- [ ] Under root-owned qualified CI/runtime, execute full required DB/RLS/Storage and migration/reset, direct recovery/integrity, essential Chromium smoke, unit/static/build/process and applicable pilot checks. Inspect executed/failed/skipped counts; record exact tested head and native evidence. No local service launch is authorized to this TEA delegate.
- [ ] Refactor only after activated contracts pass; rerun checks affected by changes. Preserve independent review/evidence and root ownership of Git/state/CI. Read this checklist's exact story binding manually; spec was deliberately not edited or backlinked.

Prospective focused commands: `pnpm test:int -- tests/integration/commands/work-orders.int.test.ts tests/integration/commands/work-order-files.int.test.ts tests/integration/rls/work-orders.rls.test.ts` with required flag and qualified isolated stack; `pnpm exec playwright test tests/e2e/jobs/work-orders.e2e.spec.ts` through configured production server; `pnpm exec playwright test tests/e2e/jobs/work-orders.e2e.spec.ts --headed` / `--debug` only with later authorized interactive runtime. Full development execution follows the canonical completion policy rather than these focused commands alone. Eight implementation activation tasks above are a contract checklist; no new effort estimate or product readiness promotion is asserted.

## Routing, guidance and deferred work

This TEA delegate and all four nested workers used explicit `gpt-6.1-sol` High: API/RLS, domain/Files, essential browser and independent scaffold review, all context-free and foreground awaited. Authorization, cross-parent privacy, file rights and transactional integrity justified High. Customization workflow had no prepend/append/persistent facts or completion action. AI generation/Create was selected autonomously; no destructive checkpoint decision was needed.

Applied fixture architecture, data factories, component TDD, network-first, test quality, selector/timing/healing, Playwright/library mandate fragments and Supabase/Postgres guidance. Playwright-utils flag true/package absent means its two-gate mandate is inactive: reuse resourcePage/current login fixtures; vanilla observation and exact response-loss deviation is documented in the browser source. Pact is irrelevant/uninstalled and namespace capability probe false; no broker call/dependency added. No new merged fixture or Pact boundary was invented.

Broad browser/device matrices, exhaustive visual comparison and manual exploratory/accessibility acceptance stay owned by the later E16 UI/release owner. Required development DB/browser checks remain implementation work, not release-only deferrals. ATDD completion does not mean story complete or release ready. No unresolved product question or ATDD blocker; runtime execution prerequisites are explicit.

## File integrity manifest

New code-file SHA256 values follow; the final checklist hash is returned separately to root to avoid self-reference.
- `tests/integration/commands/work-orders.int.test.ts`: `1E3F0F955643CD77724BCDC6B08722217F5BAA260866C7C7B8C9D55C815AA56A`.
- `tests/integration/commands/work-order-files.int.test.ts`: `EC58A5C90B2182196C7CC1AC944CEFE9BEF9A097645DC4E8BC74AF20B2700E0E`.
- `tests/integration/rls/work-orders.rls.test.ts`: `506E4BFD49D8F7E549F448DDCF06CA99AF3789E9C1051AD8C10C0B8E759F4A40`.
- `tests/e2e/jobs/work-orders.e2e.spec.ts`: `E5CAAD07794FC466537C7D78426D4B7F01CE63B6C8AEA7546F61CB79CED2C7B7`.
- `tests/unit/features/jobs/work-orders-domain.test.ts`: `6C48BE8904B693A5C692D48326AA1CD8016F2DD86F4B4367F84E4BA9E92AAF71`.
- `tests/unit/server/commands/work-order-file-contract.test.ts`: `F48C267D7351B19990A47091B5E852874B852E2BAAAAAC7E20D644184862908B`.
- `tests/support/work-orders-atdd.ts`: `146D1DF50FC1332C981E615C42C3A788B0D0810D838D9A71336DDF95FCECE035`.
