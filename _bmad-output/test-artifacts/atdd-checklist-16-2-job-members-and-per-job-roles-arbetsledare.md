---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-10-19'
workflowStatus: 'completed'
workflowType: 'testarch-atdd'
tddPhase: 'RED scaffolds; one meaningful source RED verified'
storyId: '16.2'
storyKey: '16-2-job-members-and-per-job-roles-arbetsledare'
storyFile: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md'
atddChecklistPath: 'C:/Users/Rasmus/.codex/worktrees/epic-16-jobs/Kopplas/_bmad-output/test-artifacts/atdd-checklist-16-2-job-members-and-per-job-roles-arbetsledare.md'
planRevision: 'cc59fee206595db982d74558c837f2c56c512871'
specSha256: 'f12587041c1f61dfb66366fa3c187ba42c6191440214c844e72248aa36b5a7ae'
generatedTestFiles:
  - tests/integration/commands/job-members.int.test.ts
  - tests/integration/rls/job-members.rls.test.ts
  - tests/e2e/jobs/job-members.e2e.spec.ts
  - tests/unit/features/jobs/job-members-domain.test.ts
  - tests/unit/server/authz/job-access.test.ts
fixtureFiles:
  - tests/support/job-members-atdd.ts
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md
  - _bmad-output/test-artifacts/test-design-epic-16.md
  - _bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - vitest.config.ts
  - package.json
pact_mcp_reachable: false
---

# ATDD Checklist — Story 16.2 Job Members and Per-Job Roles

Rasmus, Create mode uses AI generation from approved requirements and current source, without recording or any service launch. The canonical pipeline story key excludes the spec filename's collision suffix; the exact approved -2 source path and SHA are bound above. This creates red acceptance scaffolds only and never modifies the spec or promotes implementation status.

## Preflight, routing and scope

Installed skill customization resolves with no prepend/append/persistent facts. Framework present: Node pure tests, Vitest DB/RLS and Playwright production Chromium; manifest-based stack detection is frontend. Config auto/probe resolves to foreground awaited subagents, not an unavailable persistent agent-team facility. This delegate and all sensitive authors/reviewers use explicit Sol 6.1 High because tenant/job authority, protected projections and transaction/replay races are in scope. Existing 16.1 facts/proof/read/union regressions remain intact and are not duplicated.

Owner-approved authority: zero-or-one current eligible job-member lead; admins/Projektledare appoint/replace/clear. Lead-only authority is ordinary crew and planned start/end on their own current job, with current SQL eligibility/locks, stable identities and atomic audit/replay. Lead-only never appoints/replaces/clears/removes their designated membership or gains full-card/lifecycle/CRM/money/booking/document/consumption permissions. Independent existing role union remains effective. No whole-E15 gate or new consumer is introduced.

Playwright-utils flag true but dependency absent: two-gate mandate permits existing project fixtures without new imports or packages. Pact packages/boundary irrelevant; exact SmartBear namespace probe false, no broker call or inferred broker data. Existing source/tests provide interface context, not external observations. Supabase/Postgres guidance is loaded for DB-test contracts; no schema/query execution or feature implementation is authorized. No legacy URL or observation.

## Planned acceptance mapping

| AC | Priority / level | Discriminating RED contract |
| --- | --- | --- |
| AC01/TR03 | P0 DB + essential UI | Both kinds, ordinary assign/archive/reactivate retains same row/tenant roles and exactly one audit; durable reload. |
| AC02/TR04 | P0 DB + essential UI | Manager-only select/replace/clear from current eligible members; one lead; clear retains membership; stale concurrent picker cannot overwrite. |
| AC03/TR05 | P0 pure + DB/RLS + UI | Same lead A/not B; ordinary crew/date allow only A; leadership/full-card/CRM/planning/lifecycle boundaries still denied. |
| AC04/TR05 | P0 pure + DB/RLS + UI | Every seeded-role/current relational navigation/read, relevant independent-role union, unrelated/foreign denial and structural protected-field omission; original member/assignee reads preserved. |
| AC05 | P0 DB/RLS + pure | Foreign/inactive/archived/nonmember target variants; direct DML/private-helper/actor spoof negatives with exact no-state-change. |
| AC06 | P0 pure + DB + UI | Only nullable planned start/end, existing range validation, only two durable fields differ; genuine pre-edit full-card baseline goes stale without changing booking facts/proof versions. |
| AC07 | P0 DB | Explicit wait then removal/replacement/revocation/role/profile changes; current actor/target facts at commit/replay; identity reuse/change/intervening update, atomic audit failure rollback. |
| AC08 | P1 pure + essential UI | 360x640 accessible controls, retained unsent input, reachable retry/refetch, stable uncertain-retry identity, durable success/reload; existing paths remain usable. |

Unavailable local DB/browser runtime remains unexecuted, never passing coverage. Root's read-only guard List again refused HOOK_CONTEXT_UNAVAILABLE before any launch. No infrastructure recovery, alternate actor resource or native Supabase lifecycle is attempted. Required actual DB/RLS/migration/recovery/browser evidence follows implementation via root-owned qualified runtime/CI.

## Generated RED scaffolds

**ATDD generation is complete: 19 substantive bodies, all saved with `test.skip`, zero active passing acceptance tests.** One source contract was temporarily activated and failed for the intended missing behavior; its exact original bytes were restored. Skipped bodies are not acceptance coverage, and this artifact makes no development-complete claim.

| New file | Skipped bodies | Contract focus |
| --- | ---: | --- |
| `tests/integration/commands/job-members.int.test.ts` | 6 | Stable membership archive/reactivation; singular manager lead/stale replacement; own-job crew/date boundary; genuine card-baseline staleness; response-loss/replay/current authority; controlled locks and atomic audit rollback. |
| `tests/integration/rls/job-members.rls.test.ts` | 3 | Every seeded-role lead and independent role union; narrow privacy/eligible people; foreign/inactive/archived/nonmember targets; direct DML/spoof/ACL/private-helper refusal and forced RLS. |
| `tests/e2e/jobs/job-members.e2e.spec.ts` | 3 | Essential manager membership/designation reload and stale picker; phone lead crew/dates plus actual response-loss replay/refetch; newly admitted Sales lead navigation/direct denial/money omission and removal. |
| `tests/unit/features/jobs/job-members-domain.test.ts` | 4 | Closed operation inputs and nullable canonical dates; uncertain crew retry identity; stale lead draft/refetch. |
| `tests/unit/server/authz/job-access.test.ts` | 3 | Actual existing jobAccess trusted-relational descriptor seam; own-job only/nonmanager roles, absent/revoked/foreign facts, independent manager/money union. |
| `tests/support/job-members-atdd.ts` | helper | Thin lazy adapters over existing JobsDepthFixture, real command/RPC forwarding, public member projection, scoped SQL arrangement/readback and complete member/role/profile/audit snapshots. |

Priority labels: 17 P0 and 2 P1 bodies; no P2/P3 test matrix. Five new test files, one new thin helper, zero new fixture families or factory dependencies. Counts are test declarations, not loop iterations/assertions. No pre-existing 16.1 or E15 file is edited. Existing 16.1 union/read/facts/proof/creation regressions remain their own coverage rather than being counted as new passing 16.2 tests.

## Acceptance-to-test handoff

| AC / transfer | Scaffold IDs | Implementation and required later proof |
| --- | --- | --- |
| AC01/TR03 | INT-001, E01 | Checked ordinary assign/remove/reactivate on order and project, same row identity and tenant roles, one correlated audit, durable workspace reload. |
| AC02/TR04 | INT-002, E01, UNIT-004 | Manager select/replace/clear, eligible current member, zero-or-one lead, clear retains ordinary membership, competing expected-state request refuses/refetches without silent overwrite. |
| AC03/TR05 | INT-003, RLS-001/002, AUTHZ-001/002/003, E02 | Lead A gets ordinary crew/dates only A. Direct checked RPC and original mixed full-card/create/lifecycle paths retain their own authorization; designated membership/lead management and unrelated jobs stay closed. |
| AC04/TR05 | RLS-001, AUTHZ-001/002/003, E03 | Every seeded role/current relationship and relevant independent-role union; narrow IDs/display labels only, structural protected-value omission with entitled positive, Sales navigation/direct job access and same-token removal refusal. |
| AC05 | UNIT-001, RLS-002/003 | Closed/smuggled operations, current foreign/invited/disabled/archived/nonmember target variants, same-tenant FK, spoofed actor, direct DML, checked entrypoint ACLs and private helper denial; zero state mutation. |
| AC06 | UNIT-002, INT-004, E02 | Existing nullable Gregorian/range rules, only planned dates change, genuine earlier signed card snapshot/finalize becomes stale; existing bookings/facts/proof contracts unchanged. |
| AC07 | INT-005/006, E01/E02, UNIT-003/004 | Clean response-loss identity replay and changed-body/intervening-state refusal, direct SQL replay after current actor revocation, observed lock waits and removal/replacement/role/profile/target revocation, exact rollback including one audit. |
| AC08 | UNIT-003/004, E01/E02/E03 | Connected 360x640 usable controls, retained unsent draft, accessible alert/status/retry/refetch, actual durable response-loss replay and reload. Essential old Jobs/auth journeys remain required regressions. |

The replay negative is discriminating: its separate clean fixture first commits and replays successfully, then disables the actor without another business update and invokes the same original identity/correlation directly through checked SQL. Expected SQLSTATE 42501 and exact unchanged post-revocation state prevent either ordinary stale-state rejection or an envelope-only denial from falsely covering current SQL replay authority.

These bounded bodies do not claim exhaustive final matrices. Implementation still owns exact command/envelope/permission enrollment tests and jobs-related shared H4/role-harness/migration replay/ACL inventory changes named in the approved spec. Root/coordinator reconciles exact shared allocations with E15; no broad directory claim, new dependency, adoption ACK or whole-E15 gate is introduced. TR03–05 behaviors retained here do not grant later documentation, work-order, material-consumption, project/full-card or shell acceptance.

## Fixtures and explicit binding assumptions

The helper composes the existing lazy 16.1 fixture; it does not start resources or perform database work at module registration. Administrative SQL is only fixture arrangement/readback; tested business operations run through normal authenticated clients and the actual command envelope or direct checked RPC. The observer forwards real RPC calls and cannot substitute a successful reply. Existing tenant-gate barriers and correlation-scoped audit-failure infrastructure remain required. Profiles and tenant-role rows are included in complete rollback/race snapshots; cleanup stays scoped to the fixture's tenant data.

Approved command names are `job.member.assign`, `job.member.remove`, `job.lead.set`, `job.plan_dates.update`. The helper's future exports/RPC names, `expectedState`, target-field spelling and result/read DTOs are explicitly proposed replaceable adapters. No response schema exists for those new RPCs yet; assertions cover approved fields and durable invariants. Reconcile the adapters to the actual checked implementation before activation, preserving the semantic assertions. The pure trusted-fact shape is server-supplied projection context, never client authorization or a requirement to widen a global role helper. Do not satisfy its tests with blanket tenant grants.

No external-provider mocks are needed. E02 forwards one identified actual dates action to real persistence and deliberately loses its response; the retry must forward the same real input and leave the same single durable mutation/audit result. It never permanently stubs success. Its Next action serialization predicate must be bound to the actual future action before activation. Proposed UI selectors and future exports are not observations or extra product policy.

## UI adapter requirements

Eleven proposed semantic test-ID patterns identify the new replaceable presentation: `job-members-panel`, `job-member-{profileId}`, `job-members-save-status`, `job-members-error`, `job-members-refetch`, `job-members-retry`, `job-planned-dates-form`, `job-plan-dates-save-status`, `job-plan-dates-error`, `job-plan-dates-refetch`, `job-plan-dates-retry`.

Proposed accessible labels/buttons include Lägg till person, Lägg till medlem, Ta bort medlem, Ansvarig arbetsledare, Spara arbetsledare, Planerat startdatum, Planerat slutdatum and Spara datum. Reconcile these semantic adapters with approved UI implementation, using the existing design system and accessible role/name selectors. Existing login/mobile menu/list/detail/full-card/entitlement selectors remain reused. No browser or legacy app was explored.

## Actual validation and RED evidence

1. Customization resolved successfully (native 0); prerequisites/framework/config and all eight ACs loaded. Auto mode resolved to foreground awaited API/E2E workers plus a separately scoped pure-contract author. Every sensitive author and the independent reviewer explicitly used context-free `gpt-6.1-sol` High. No parallel speedup is claimed.
2. Worker success JSON parsed and source content matched to the saved new files. Six new code files passed TypeScript syntactic transpilation: zero syntax errors, native 0. Syntactic registration scan found 19 test.skip declarations and zero active test declarations. This is scaffold/static evidence, not 19 executed passes.
3. Meaningful bounded source RED temporarily activated only AUTHZ-001:

   `node --experimental-strip-types --import ./tests/support/register.mjs --test --test-name-pattern=16.2-AUTHZ-001 tests/unit/server/authz/job-access.test.ts`

   Actual Node native exit **1**; **1 executed / 0 passed / 1 failed / 0 skipped**. The actual existing `jobAccess` returned undefined for `canManageCrew` where true is expected for the current designated Sales user on their own job. No missing-module/import failure was used. Original bytes were restored in finally; SHA256 remained `0947c2eaf616cbc52ea8e266aef8473256955cdde867706461a3abd645f5c949`, with all three authority bodies again skipped. Private TAP evidence: `C:/Users/Rasmus/AppData/Local/Temp/tea-atdd-16-2-source-red-2026-10-19T19-02-12-153Z.log`.
4. `node node_modules/typescript/bin/tsc --noEmit --incremental false`: first native 2 reported eight new scaffold typing diagnostics in the two API test files. The author preserved actual calls/assertions while using the existing DurableRow type for snapshot rows and the established current client-type adapter for readJobDetail. One bounded rerun passed, **native 0 with zero diagnostics**. No product type contract or behavior was weakened.
5. Independent Sol 6.1 High scaffold review found one consequential masked replay-authority assertion. The author repaired it within INT-005 using the separate clean direct-SQL branch described above. Targeted High follow-up **PASS** verified only that repair and the two typing deltas; prior review of the other four unchanged files remains applicable. No new broad product-code review or service execution occurred.

The checks above are the complete executed ATDD validation. No DB, RLS, migration replay, recovery-storage, pilot, browser, screenshot/manual, production build or implementation acceptance ran here. No skipped suite is reported as passing. The unavailable root resource-guard context is recorded, not evaded with another actor or native Supabase lifecycle. Actual changed-code DB/RLS/browser proof must follow implementation; historic 16.1 green evidence does not prove new 16.2 behavior.

## Activation and implementation checklist

- [ ] Activate only the current pure operation/authority scaffold, observe expected RED, implement the closed domain and trusted semantic descriptors, then make that task green. Preserve original generic job/card/global capability boundaries.
- [ ] Reconcile the thin future command/RPC/projection adapter, then implement the four dedicated checked operations and current actor/target eligibility under the established lock boundary. Create the one authorized forward migration through the established CLI only during implementation; verify actual combined chronology, including E15's reported reservation, without creating a backward dependency.
- [ ] Activate INT-001/002 and RLS-002/003 for stable ordinary membership, one eligible lead, manager-only designation and direct SQL/ACL/FK constraints. Include explicit migration failure for existing duplicate active leads in the allocated migration gate; never choose an arbitrary winner.
- [ ] Activate INT-003/004 and AUTHZ tests for narrow current lead crew/dates, independent manager/money union, untouched mixed full-card/lifecycle/CRM commands and genuine old-card baseline staleness. Do not modify booking-facts/proof versions or E15 views to satisfy dates-only behavior.
- [ ] Activate INT-005/006 in a qualified required DB lane; prove clean replay authority, observed current lock facts/eligibility, intervening-update refusal and exact atomic audit rollback. Keep the correlation-scoped fault and actual two-session barrier; no fake result or sleep-based race.
- [ ] Implement narrow member/eligible-person projection and accessible Översikt panel/dates editor with separate capabilities. Reconcile the eleven proposed UI patterns and actual action predicate, then activate the three essential browser journeys against the production Playwright server.
- [ ] Implementation author performs the approved bounded `package.json` test:smoke inclusion: append `tests/e2e/jobs/job-members.e2e.spec.ts` before final `--reporter=list,json`, retaining both auth files and existing jobs-depth file. This ATDD delegate does not edit scripts/config. Root coordinates checkpoint/review/CI, not story or test code authoring.
- [ ] Implementation author extends only allocated jobs assertions in command enrollment/envelope/permission/role/migration/H4 shared paths, preserving E15/provisioning/recurrence rows. Run actual static/full units/build/full DB/RLS/direct recovery integrity/applicable pilot and essential smoke with independent High review; record exact head/native executed/skipped counts in the later delivery record.
- [ ] Root advances supported pipeline state/Git checkpoints after the handoff. TEA automate follows actual implementation. This checklist does not invoke another workflow or mark the story done.

Effort estimate: not assigned by this test-artifact task; implementation owner estimates after reconciling real interfaces and shared allocations. No generic component runner is added: pure domain/draft tests and essential real browser behavior use the existing framework.

Useful later commands, **not executed here**:

- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/jobs/job-members-domain.test.ts tests/unit/server/authz/job-access.test.ts` — after current-task activation, count active versus skipped bodies honestly.
- `SUPABASE_TEST_REQUIRED=1 pnpm exec vitest run tests/integration/commands/job-members.int.test.ts tests/integration/rls/job-members.rls.test.ts` — only after qualified isolated runtime/schema/fixtures; full required lane still follows.
- `pnpm exec playwright test tests/e2e/jobs/job-members.e2e.spec.ts --reporter=list,json` — after semantic adapter activation, under qualified production server/stack and root-owned resource/CI orchestration. Do not substitute next dev.
- Checked-in static/build/full regression scripts and direct recovery lane remain required for changed implementation; no repeat of an unavailable runtime is attempted by ATDD.

## Preservation and final hashes

| New code file | SHA256 |
| --- | --- |
| `tests/integration/commands/job-members.int.test.ts` | `1ea6d9d0f37fff13c5b057d513bb763298885181cd54b1dd23fb94e940a7ee14` |
| `tests/integration/rls/job-members.rls.test.ts` | `ac487b7756ec2f6d6780bbf03486be09d8281bdee0397c0f57c6f7c809091dcf` |
| `tests/support/job-members-atdd.ts` | `c86b92631ac1ac47590ca0dfbbfcd1138ea7d529c8fb08986b931103e7644f9e` |
| `tests/unit/features/jobs/job-members-domain.test.ts` | `015b294d8fa16095082f041f0a98f9cbfc169dcc147df04319cbd9ebe4529124` |
| `tests/unit/server/authz/job-access.test.ts` | `0947c2eaf616cbc52ea8e266aef8473256955cdde867706461a3abd645f5c949` |
| `tests/e2e/jobs/job-members.e2e.spec.ts` | `60872735fc04e2202ec2311abde86608cf01620faab0e803a8fdaeb51a0b9b83` |

Exact approved spec remains SHA256 `f12587041c1f61dfb66366fa3c187ba42c6191440214c844e72248aa36b5a7ae`; package remains `d2d9fe7ba43b9df704cb649f9f143e9c81dd938260fc9dbf68db273e052b068c`; lock remains `532abe9d606d49daa060b41ebc91bc44b359291059b8832bed98233b65299ee2`. Only the five new tests, one thin helper and this checklist are repository outputs. No spec backlink is written because spec edits are explicitly prohibited; exact storyFile/atddChecklistPath/generatedTestFiles frontmatter supplies the manual handoff. Root owns Git/index/commits/push/state/sprint/ledger/delivery; none was changed by this delegate.

Structured worker transports are retained in OS Temp: `tea-atdd-api-tests-2026-10-19T19-02-12-153Z.json`, `tea-atdd-e2e-tests-2026-10-19T19-02-12-153Z.json`, `tea-atdd-unit-tests-16-2-2026-10-19T19-02-12-153Z.json`. They are supplemental generation metadata, not executable test dependencies or extra repository evidence packets. Final code/checklist above is the canonical persisted handoff.

## Checklist disposition and release limits

Preflight/approved ACs/framework/context, AI generation, risk/level mapping, expected assertions, skip discipline, lazy scoped cleanup, real forwarding/no placeholder success, selector/action assumptions, implementation tasks/commands and exact artifact handoff checked. New inputs/domains are not imported eagerly. API/DB remains in existing Vitest paths rather than a new tests/api runner; package-absent utilities and irrelevant Pact introduce no dependencies. Knowledge applied: data factories, component-TDD principles, test quality/healing, selector/timing, fixture/network-first, integration mandates and Supabase/Postgres current authority/least privilege/lock-order guidance. Healing of a real implemented feature was not attempted; the single RED failure is intentional.

Playwright Utils deviations: library gate inactive (package absent); existing resourcePage, semantic login, bounded hydration poll, real action observations and one response-loss route are explicitly documented in-file. Future library adoption/provider/merged-fixture wiring is outside this task. Pact: not applicable/uninstalled; broker unreachable, no calls or inferred provider state.

Deferred release validation remains owned by the E16 UI/release-validation owner: exhaustive role/device/browser matrices, screenshots, visual inspection/manual walkthrough and polish. Evidence is unexecuted, never passed; concrete next action is deliberate release_validation=true and representative visual/manual checks on the qualified final epic candidate, with consequential functional failures still blocking development. No release ready, merge, deployment or whole-epic claim.

Open questions: none. ATDD blockers: none. Remaining implementation/runtime prerequisites are named above and do not constitute a whole-E15 or human-approval gate.
