---
workflowStatus: completed
runScope: story
story: '15.2'
mode: create
integrationMode: BMad-integrated
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-03c-aggregate', 'step-04-validate-and-summarize']
lastStep: step-04-validate-and-summarize
lastSaved: '2026-10-20'
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md
  - _bmad-output/test-artifacts/test-design-epic-15.md
  - _bmad-output/test-artifacts/atdd-checklist-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md
  - _bmad-output/test-artifacts/story15-2/build-intent-matrix.md
  - _bmad/tea/config.yaml
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - playwright.config.ts
  - vitest.config.ts
---

# Story 15.2 automation expansion

Date: 2026-10-20. Author: TEA delegate, Sol High for authorization and transactional-integrity scope. Create mode and all interactive defaults are resolved autonomously. This story-specific output preserves the unrelated shared automation-summary.md. The approved spec and Root-owned state, Git, delivery and ledgers remain untouched.

Result: revised one existing P0 RLS case with two meaningful assertions; zero new registered cases, browser cases, fixtures, dependencies or product changes. Automation assessment/generation and static validation are complete. The two new assertions are **UNEXECUTED** pending Root's independent P7 review and next exact-source standard CI. Historical passes do not include them; this document grants no renewed development-complete, release, merge or deployment admission.

## Preflight and context

Owned root: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`. Inspection baseline: `7ca73633da0ae804ae28b9d735ff2242dcf2a066`; tested product checkpoint: `effbf5e18e19556d0fad231d3fc01369397c8402`. Initial status was clean. The customization resolver completed native 0: no prepend/append/persistent facts or completion hook.

Automatic stack detection selects frontend: Next/React package manifest plus Playwright config, with no separate backend-language manifest or mobile scaffold. Actual product behavior includes server actions and PostgreSQL; API worker scope therefore includes existing Node/Vitest command/RLS tests. Framework is present: node:test units, Vitest DB/RLS and SSR, Playwright Chromium with configured production build/start. No framework/dependency/config change is needed.

Flags: playwright-utils=true, pactjs-utils=true, pact_mcp=mcp, browser_automation=auto, execution_mode=auto, capability_probe=true. Neither utility package nor Pact is installed. The library two-gate rule therefore does not require unavailable imports. Keep current runner/fixtures; library adoption would require a separately scoped framework task. No independent consumer/provider or asynchronous contract boundary is introduced by recurrence; Pact generation is N/A. Tool-list probe found no SmartBear/Pact tools: pact_mcp_reachable=false; fallback is provider-source, with no broker call or invented broker state. Browser exploration is unnecessary for this source-and-evidence gap analysis; runtime resources have Stop requests and no currently qualified runtime is assumed.

Knowledge applied: test-levels-framework, test-priorities-matrix, data-factories, selective-testing, ci-burn-in, test-quality, library-integration-mandate, playwright-utils-mandate, evidence-integrity, fixture-architecture, network-first, risk-governance, probability-impact, confidence-gate, Playwright utility profiles and pact-mcp; workers record their additional fragments in their JSON. Normative fragment content was loaded separately from illustrative samples. Existing ATDD source and fixture bindings take precedence over illustrative fragment examples. No legacy application evidence is used.

## Coverage plan

Selective scope: identify consequential untested behavior after implementation; retain existing tests when assertions already cover the invariant. Planned ATDD families and their historical red/skipped receipts are not current passing coverage. Read active actual tests and current receipts before proposing additions.

| AC | Priority and primary level | Existing targets to compare | Expansion decision |
| --- | --- | --- | --- |
| AC1 finite shared calendar expansion | P0 unit + command integration | recurrence goldens/validation/admission; REAL015/017; actual planner and editor-input tests | Existing independent goldens, invalid-rule, bound and actual-caller coverage retained; no duplicate added. |
| AC2 complete current preview | P0 state/unit + essential browser | headless preview state, REAL005/012, E2E002-004/007 | Existing latest-request/version invalidation and complete warning admission retained. |
| AC3 atomic write/replay/recovery | P0 real DB + transport/browser | REAL001/007-009/012/014, E2E005/006/007 | Existing real gate, audit-failure rollback, concurrency, current authority and committed-response loss retained; no substitute mocks. |
| AC4 stable exception/tombstone | P0 unit + real DB/browser | reconciliation, REAL002/003/016/020/022, RLS004/005, E2E001/006/009 | Existing identity/value retention and changed editor-control coverage retained. Person fresh-sibling admission is the AC7 delta below. |
| AC5 nominal split/lineage | P0 planner + real DB/browser | planner compatibility, REAL002/006/013/017/021/022, E2E001/008 | Existing nominal bounds/concurrency/signed-overlay/real gesture assertions retained. |
| AC6 full facts/selective review | P0 real DB + focused pure logic | REAL004/005/007/010-012/018/019/021 and detector suites | Existing actual proof/fact/group/key/fault/current-metadata assertions retained. Skipped fault scaffolds receive no credit. |
| AC7 current authority/privacy | P0 RLS + checked command | REAL009, RLS-REAL001-005, full REQUIRED suite and own-agenda hosts | One revised RLS005 fresh count4 preview now expects exact inactive-person denial and unchanged full snapshot; two new assertions UNEXECUTED. |
| AC8 usable connected hosts | P1 essential browser + state/SSR | E2E001-009 and qualified nine 15.1 host behaviors, editor/Workspace tests | No demonstrated additional essential browser gap. Qualified historical/current-build receipts retained separately; release matrices remain deferred. |

The initial plan required an actual gap and Root path allocation before any shared test edit. Root subsequently allocated only the two-line RLS005 correction described below; no new test path or mutable runtime was needed.

## Worker execution

Requested mode: auto. Capability probe enabled: runtime exposes subagent launch and synchronous completion, with no native agent-team API; resolved mode: subagent. The skill's two frontend workers were launched together and both completed before aggregation. Both use explicit Sol High because their actual scope includes admission, current authority, transaction and lost-response semantics. No nested handoff was needed solely to change effort.

Worker timestamp token: `2026-10-20-story15-2-high`. Windows resolves the prescribed `/tmp/tea-automate-*-tests-<token>.json` staging paths as `C:/tmp/tea-automate-*-tests-<token>.json`; final copies are retained under the story's test-artifact directory. Workers own only their separate JSON output and cannot mutate product tests or runtime fixtures. Backend/mobile workers are N/A under frontend stack detection. No measured parallel speedup is claimed.

Read-only reuse check: `git diff --quiet effbf5e18e19556d0fad231d3fc01369397c8402 HEAD -- src tests supabase package.json pnpm-lock.yaml playwright.config.ts vitest.config.ts` completed native 0. This confirms committed inputs in that scope are unchanged; it is not a new product test execution or independent provenance review. The existing narrow High provenance report remains the authority for local receipt/dependency reuse.

## Demonstrated gap and bounded correction

API worker found one falsifiability gap in `tests/integration/rls/booking-series.rls.test.ts`, `15.2-RLS-REAL-005`. Its count4 update reused the previous count3 receipt and asserted generic rejection. That assertion can reject on candidate staleness even if fresh inactive-person admission regresses. REAL020 separately covers an inactive work role, while the inherited single-booking test reaches a different row helper. Neither makes the original receipt-staleness assertion specific to fresh series-person admission. No production bypass was found: current planner and SQL guards both enforce retention per existing occurrence.

Root explicitly allocated only this existing E15-owned test to the High API author. The author inserted at lines130-131:

```ts
await expect(reviewRealSeries(fx,added)).rejects.toMatchObject({code:"TENANT_ACCESS_DENIED"});
expect(await realSeriesSnapshot(fx)).toEqual(before);
```

The active Admin retains manager authority; the assigned person's membership was disabled earlier in the fixture. `added` addresses the current version2 series with count4. `reviewRealSeries` calls the actual `previewBookingSeries`, obtains a current SQL snapshot, then `planBookingSeries` rejects the new inactive-person sibling because its booking ID has no retained assignment. The rejection is during **fresh preview**, before a new receipt or `finalize_booking_series` call. The second assertion compares complete durable booking-domain state, including both tenants and series, using existing snapshot helpers. No new fixture or helper was added. The original stale-receipt save rejection remains useful as a stale-attempt negative and is not evidence of this inactive-person guard. No isolated SQL-row-guard test was generated or claimed.

Raw test SHA256: original `2533666daf6c0e8107a08f8b1ce1359da25b68f6c396339094330139e74b75d9`; candidate `b7cebf2c860419e411cbe6ef563ccbe6c7faccf5e1fcc6091c25cbbe24bec6c0`. Removing exactly the two inserted lines reconstructs the original bytes/hash. The API JSON contains the exact complete candidate file; aggregation verified disk equality without rewriting it.

## Aggregated outputs and current validation

Counts describe changed coverage, not passing tests: one revised existing API/RLS case (P0), two new assertions, zero new registered cases, zero E2E additions, zero fixtures/factories/helpers. Both workers returned success and all expected JSON was parsed before aggregation. E2E coverage analysis mapped eight ACs without finding another essential gap. No percentage or line-coverage measurement is claimed.

Files created or updated:

- This story-specific summary.
- [API worker output](story15-2/tea-automate-api-tests-2026-10-20-story15-2-high.json), SHA256 `a1c43f73eac96fde3263bed7e408eca1297c48c01269778a377338fb4d22cc11`.
- [E2E worker output](story15-2/tea-automate-e2e-tests-2026-10-20-story15-2-high.json), SHA256 `2407d4ec5d1494b360db86b0c5b35801988dad7326f61fbbe84021e66ac13046`.
- [Required aggregate/validation JSON](story15-2/tea-automate-summary-2026-10-20-story15-2-high.json), SHA256 `e36083d70e2de41f4d26c6511e08185e04a454570310e1854bb0ed2d501fa028`.
- `tests/integration/rls/booking-series.rls.test.ts`: exactly the allocated two-line addition.

Windows `/tmp` staging files were retained and copied byte-for-byte into these canonical test artifacts; no temporary result is discoverable only outside the repository. No test README/package script update was needed because the existing runner, path, invocation and fixture contracts are unchanged.

| Actual command/check in this pass | Native exit/result | Meaning |
| --- | --- | --- |
| Customization resolver `--key workflow` | 0; empty hooks/facts | Workflow activation resolved. |
| Committed source/test/schema/framework comparison above | 0 | Historical CI source inputs unchanged in committed scope, before the uncommitted two-line candidate. |
| `pnpm exec eslint tests/integration/rls/booking-series.rls.test.ts` | 0 | Actual candidate static check passed. |
| `pnpm exec tsc --noEmit --incremental false` | 0 | Actual candidate typecheck passed. |
| Bounded Python aggregation/integrity check | 0; ok=true | Both worker schemas/success; exact candidate/disk/hash/two-line reconstruction; spec/delivery preservation; canonical worker copies verified. |
| Functional tests | 0 suites / 0 cases executed; 0 skipped | No new functional pass is claimed. Two new assertions remain UNEXECUTED, rather than runner-skipped. |

Spec SHA256 remains `688977b8b6047d3cc9e4a62381598aa1df670a4075d3b7fff6e7a3d0b0364bfc`; delivery remains `c1d63ea5d6d610d6453852ef7a7e21c601d04d58e24faee55626a8b24d468576`. Root owns any later status/evidence admission. No app/database/browser/resource launch or fixture mutation, Git publication, provider change or deployment occurred.

## Historical executed evidence and limits

Qualified source `effbf5e18e19556d0fad231d3fc01369397c8402`, CI39335595653 attempt1, all five required ordinary jobs passed. It executed units2974P/0S, process43P/0S, fullDB1827P/0F/52S, including all22 active series command cases and five active series RLS cases. RLS800P/14S is an included subset, never additive. The52 skips are37 original command scaffolds,14 original RLS scaffolds and one physical-Storage case outside its isolated lane; none is coverage. Separate isolated physical Storage1P/0S and empty106 migration/seed replay passed. Configured narrow pilot passed its25measurements/5warmups; it is not representative Scheduling release-performance proof.

Ordinary CI Auth/Jobs11P is distinct from Scheduling coverage. Actual local changed essentials007/0082P plus0091P are distinct preserved commands; earlier001-006 and selected15.1 hosts use their independent scoped unchanged-dependency qualification. Original failed receipts remain failed. These receipts are reused, not re-executed or re-labelled as a single current whole-suite run. In particular, the historical RLS005 pass predates the new two assertions and cannot cover them.

## Validation checklist and handoff

- [x] Framework/config, approved eight ACs, nine tasks, current policy, actual source/tests, existing ATDD and qualified evidence inspected.
- [x] Selective P0/P1 plan and eight-AC test mapping recorded; only the demonstrated fresh-person-admission assertion gap changed.
- [x] Deterministic mode/capability resolution recorded; both required frontend workers completed and their exact results were aggregated.
- [x] Fixtures/helpers unchanged, unavailable package imports avoided, no duplicate calendar/browser/transaction test matrix created.
- [x] Candidate is exactly two added assertions in one allocated case, with existing async/rejection/snapshot helpers; no new sleeps, mocks, focus, skips or weakened checks.
- [x] Actual lint/typecheck and bounded artifact checks passed; registered test inventory unchanged. No functional test result is fabricated.
- [x] Final document consolidated, output references/hashes/count meanings checked and temporary worker outputs preserved under test_artifacts.
- [x] Browser/CLI-session cleanup N/A: no browser session or managed resource was launched. Healing/burn-in N/A: no functional run or flaky failure in this pass; old failures are retained.
- [x] Optional README/scripts/framework/CDC generation N/A: no new runner/usage contract, package or consumer/provider boundary.
- [ ] Root's targeted independent High P7 review and next exact-source standard CI execution of the revised RLS005 are pending; this is explicitly **not** a passed functional or development-complete claim.

Next recommended workflow: Root's already selected P7 follow-up/trace advisory, preserving broad review1/3 and separate repair counter0. Review the actual delta, then execute the revised integration assertion in the next exact-source standard CI `db` lane with `SUPABASE_TEST_REQUIRED=1`, retaining executed/skipped counts. Its targeted equivalent is `pnpm exec vitest run tests/integration/rls/booking-series.rls.test.ts` only in a separately qualified owned test environment; no local runtime is needed or requested now. Renewed done/delivery admission must follow the new review/CI evidence. These pending checks have owner Root, concrete next action and resume condition (review plus exact-source executed result); no human clarification is required.

## Playwright Utils deviations

No new Playwright file or vanilla API was emitted. Existing explicit package-absence notes remain at `tests/e2e/booking-series.e2e.spec.ts:7` and `tests/e2e/support/booking-series-atdd.ts:5`; their established resourcePage/bookingSeries fixtures and actual sign-in/transport observation remain. The installed-package gate is closed. A separately scoped framework adoption would install the utility package, create the single merged fixture entry point, wire its auth-session provider/network-error-monitor and assess Next-action/CDP observation while preserving independent SQL and original-response-loss semantics. No missing wiring is represented as installed capability.

Pact broker: unreachable (SmartBear MCP tools not available). Provider states derived from provider source. Pact artifacts/deviations are N/A because recurrence introduces no independent consumer/provider contract boundary and no Pact package is installed. No broker or provider mutation occurred.

## Deferred release validation

| Item | Owner | Status/evidence | Concrete next action |
| --- | --- | --- | --- |
| Exhaustive five-view/gesture/device and screenshot/visual matrix | QA/UX | Deferred under October19 policy; selected essential receipts are narrower. | Before release execute remaining view/device combinations and inspect actual image differences. |
| Manual accessibility/daylight/exploratory scheduling validation | QA/UX | Deferred; selected keyboard/phone and SSR checks do not certify manual accessibility/readability. | Before release record keyboard/screen-reader/zoom/daylight walkthroughs and triage consequential failures. |
| Representative Scheduling performance workloads/thresholds | Product/Architect | Deferred; narrow configured pilot is separate evidence. | Agree representative recurrence/tenant workloads and thresholds, measure production build and record acceptance. |

These three existing release items are neither waived nor passed. Root retains canonical ledger ownership; no duplicate ledger was created. Release_ready=false. Open questions: none. Human/resource blockers: none. Required next verification: pending Root review/CI as stated above.
