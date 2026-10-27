---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-10-20'
workflowType: 'testarch-trace'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['_bmad-output/implementation-artifacts/spec-15-3-conflict-resolver.md:95']
externalPointerStatus: 'not_used'
gateType: 'story'
allowGate: false
collectionMode: 'contract_static'
collectionStatus: 'COLLECTED'
sourceSha: '51bbf0667f5055368e799e24b2f6ed7a20bc9665'
tempCoverageMatrixPath: 'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/_bmad-output/test-artifacts/story15-3/trace15-3-coverage-matrix.json'
---

# Story 15.3 Conflict Resolver — Traceability Matrix

Rasmus, this Create-mode trace covers only the eight frozen story acceptance criteria. Formal AC1–AC8 are the high-confidence oracle; the epic test design supplies supporting scenario priorities rather than expanding the denominator to the epic. No synthetic or external oracle is needed.

## Context and configuration

Evaluator: auto-bmad TEA delegate, gpt-6.1-sol High, for actual authorization/RLS and transactional-integrity evidence. Root persisted the route before dispatch; no nested handoff is needed. Team customization resolved successfully with no extra activation steps/facts. English is the configured language. Create mode and sensible autonomous defaults were selected. Root's explicit precedence sets gate_type=story and allow_gate=false; actual skill gate will be NOT_EVALUATED. This report is advisory and cannot grant release, merge or deployment authority.

Inputs: the story specification, test-design-epic-15.md (story15.3 families only), completed automation15-3-* artifacts in this directory, the immutable checkpoint-d550029a-ci-independent evidence packet, author-final-delivery-conservation.json, development-completion-policy.md and agent-model-routing.md. Knowledge loaded: test-priorities-matrix, risk-governance, probability-impact, test-quality and selective-testing. The template is adapted to the owner's non-gating story scope; generic release/deployment recommendations and example placeholders are not decisions.

The October19 development-completion policy requires consequential integrity and essential usable-flow evidence, while keeping exhaustive browser/visual/manual/representative performance validation explicitly deferred. Source CI is d550029abac34360af7d9d928f6e66f906665d38, run39363860222/attempt1. Current metadata head is 51bbf0667f5055368e799e24b2f6ed7a20bc9665; later metadata is not falsely described as freshly runtime-tested. All57source blobs are conserved by the qualified source inventory. release_ready=false.

## Test discovery and inventory

Static searches matched story IDs, test declarations and feature names in the owned tests directory. Existing P6 source/native assertion assessments were reused, with current declaration locations and the actual INT012/E2E bodies inspected for the explicit evidence boundaries. These are rerunnable automated test artifacts with qualified CI results, not a live-results-only oracle.

| Level | Focused bodies | Files / identity |
| --- | ---: | --- |
| API / DB command | 17 | tests/integration/commands/conflict-resolver.int.test.ts; 15.3-INT-001..017 |
| API / RLS | 4 | tests/integration/rls/conflict-resolver.rls.test.ts; 15.3-RLS-001..004 |
| API / read model | 2 | tests/integration/read-models/booking-conflicts.int.test.ts; 15.3-READ-001..002 |
| Component SSR | 2 | tests/integration/components/conflict-resolver.test.ts:9,15; 15.3-COMP-001 family |
| Unit | 16 actual native bodies | 7 resolver +3state +5suggestion +1attestation; four focused unit files |
| E2E | 3 | tests/e2e/conflict-resolver.e2e.spec.ts:25,43,62; 15.3-E2E-001..003 |
| Live manifest | 0 | Not present/configured for independent live credit |

Focused total=44 automated bodies in9files;25integration includes2SSR and therefore only23real DB/RLS bodies. Fourteen fixed unit declarations plus one parameterized declaration register16 native bodies, including both DST variants. Iterations within INT012, INT005 and INT008 do not become additional native test cases. All focused bodies have native pass evidence, no skipped/pending/fixme flags. Priorities below are explicit AC-level judgments; test names often carry no P tags. Supporting inherited14.3/15.2 actual tests are cited for continuity but excluded from this focused test-count denominator; old skipped scaffolds earn no credit.

### Live Verification Results

```json
{"liveRecords":[],"liveManifestHeader":{"present":false,"results_file":"_bmad-output/test-artifacts/live-verification-results.json","source_sha":"","observed_at":"","producer":"","read_error":"","current_source_sha":"51bbf0667f5055368e799e24b2f6ed7a20bc9665"}}
```

### coverage_heuristics

- Endpoint/seam inventory: GET /api/scheduling/conflicts has authenticated/read-error coverage through the actual read model and browser host. Suggestions/history/preview are server actions and final writes use resolveBookingConflict/checked SQL, not an invented HTTP mutation endpoint. Dedicated HTTP status/header assertions are not claimed from read-model tests.
- Auth negative paths: current manager versus anonymous/foreign/inactive/own-only/multi-role callers, safe projection/private RPC/DML denial and fresh/replay role revocation are covered by RLS001..004 and INT003/004/008/010. No missing consequential authorization negative was identified by the bounded P6 assessment.
- Error paths: read unknown/error, stale baseline, changed payload, current revocation, actual fault rollback, lost response and explicit same-attempt retry are mapped. No AC relies only on happy-path rendering.
- UI journeys: real chip/detail/accept/filter/reload, common/following edits and phone keyboard/retry execute. Flytta/Omfördela suggestion-menu selection is UNEXECUTED in browser; INT012 actually requests/selects API suggestions and commits through fresh production validation.
- UI states: SSR proves static structure only; real browser proves selected detail, denial/stale feedback, remaining/resolved notices, unsent input and retry. Exhaustive loading/empty/error/assistive-tech permutations remain outside essential smoke evidence.

## Acceptance criteria → actual tests

FULL means the consequential behavior in this formal criterion is covered by the combined appropriate automated levels and qualified essential smoke under the October19 policy. It does not assert exhaustive scenario coverage or a FULL browser matrix. P0 applies to AC4–AC8 because they govern writes, selective workflow identity, replay/notification atomicity, protected series ownership and authorization. P1 applies to AC1–AC3 as primary queue/detail/suggestion journeys; their integrity/privacy boundaries are additionally mapped to the P0 criteria. These are trace classifications, not invented source priority tags.

| Criterion | Priority / coverage | Given → when → then, actual assertion and source stops |
| --- | --- | --- |
| AC1 queue, labelled scope/count, complete groups, accepted filter, unknown | P1 / FULL | Given scoped multi-assignee aggregates, READ001:9 scans and retains all four-booking peers; scope unit:13 deduplicates/person-Stockholm grouping. READ002:21 rejects failed/denied successful-empty projection. E2E001:25 uses the real chip count/scope, default queue and accepted filter. COMP family:9,15 proves structure only. |
| AC2 detail, rule/context/target, honest recency, safe denied state | P1 / FULL | READ001:9 scans actual complete groups/context and check timestamp; READ002:21 leaves failed scan unknown; RLS001:16 and004:55 restrict safe history/detail to current managers. SSR:9 renders complete participant intervals and explicit target. E2E001:28 asserts both seeded participants and explicit selection. No browser claim for every aggregate/rule/context permutation. |
| AC3 actual free-slot/role/load suggestions, unknown, fresh validation | P1 / FULL | INT012:121 loops move/reassign with the real server action: actual capacity600/load60 or0, excludes wrong-role person, selects returned candidate; changed employment facts reject PREVIEW_STALE with unchanged snapshot; fresh preview commits and real scan reads exact payload/no target. INT011:283 checks mixed null/empty per-job facts; five suggestion units cover unknown/malformed/cancelled/start-date load and both DST weeks; RLS004:55 denies forbidden suggestion access. Flytta/Omfördela browser menu selection remains UNEXECUTED; API evidence is not browser evidence. |
| AC4 exact reviewed overlay, complete detection, resolved versus remaining, atomic rollback | P0 / FULL | INT001:155 writes real move/detection and checks resolved outcome/actor/SQL time; INT003:173 rejects stale/partial/unrelated baseline; INT006:223 proves full persisted rollback after observed audit/notification fault stages. INT012:121 covers actual move/reassign; INT014:82 checks truthful remaining history/open workflow; INT007:241/016:96/017:56 cover occurrence/common/following overlays. E2E002:43 and003:62 supply essential persisted edit/remaining-versus-resolved smoke. |
| AC5 selective acceptance, inspectability, natural-key continuity/reopen | P0 / FULL | INT002:143 accepts only complete selected groups with reason, immutable result and no occurrence divergence; INT003:173/010:188/015:91 deny stale/partial/unrelated/genuine wrong-domain or identity proof. INT005:207 exercises all three effective single/series/job-card retain/reopen writers; INT013:69 reopens returning capacity identity before acceptance. Validator unit:63 rejects whitespace/blanket/unknown fields. E2E001:25 proves accepted filter/reload; inherited actual14.3-INT004/15.2-INT-REAL012 support accepted natural-key continuity, not skipped ATDD. |
| AC6 durable history/actor/time, deduped preferred active recipients, replay/races/fault truth | P0 / FULL | INT002:143/004:199 prove immutable exact replay/concurrent duplicate and changed-content/current-authority denial; INT006:223 rolls back booking/conflict/ledger/audit/notifications with real observed stages; INT008:255 observes actual lock wait then revocation for new and replay commands. INT009:269 asserts before/after active-recipient union/preferences/per-event dedupe; RLS002:36 proves in-app-only booking category without changing quote email; RLS001:16 safe history. E2E001/003 exercise committed-response loss, explicit replay and durable history/notification projections. |
| AC7 bounded complete common/following series fix, protected rows, stable identity, warnings | P0 / FULL | INT007:241 covers12slots/all10ordinary sibling literal times/assignees, protected exceptions/tombstones, stable IDs/bounds and warnings beyond10 without blanket acceptance. INT016:96 checks existing successor/prefix/suffix ownership; INT017:56 reads microseconds and timed/all-day conversions; literal production-planner units:30,35,42 pin defaults/bounds. E2E002:43 exercises protected rows/common and following choices; following browser tail checks IDs/start times only, with complete DB assertions supplying end/assignment scope. |
| AC8 current matrix/RLS/read/suggestion/history/preview/save/replay/private surfaces, failure/retry/phone | P0 / FULL | RLS001..004 at16,36,50,55 exercise anonymous/foreign/inactive/own-only/allowed multi-role controls and checked/private DML/RPC boundaries. INT003/004/006/008/010 cover current proofs, revocation under actual wait/replay and whole-transaction truth. Three state units and attestation unit:7 prove stable unknown identity/current-response handling/domain tamper rejection. E2E001/003 execute denial, unsent reason/input, actual production-host persistence/retry and360×640 keyboard entry/action. Existing15.1/15.2/job-card actual regression evidence is retained; no new grant is inferred. |

Command locators above use tests/integration/commands/conflict-resolver.int.test.ts; RLS uses tests/integration/rls/conflict-resolver.rls.test.ts; READ uses tests/integration/read-models/booking-conflicts.int.test.ts; SSR uses tests/integration/components/conflict-resolver.test.ts; E2E uses tests/e2e/conflict-resolver.e2e.spec.ts. Unit scope/planner/validator uses tests/unit/features/scheduling/conflict-resolver.test.ts; state uses conflict-resolver-state.test.ts, suggestion uses conflict-suggestions.test.ts in that directory; attestation uses tests/unit/server/bookings/conflict-resolution-attestation.test.ts. Machine-readable coverage output preserves every mapped test title/file/line/level/status and distinct SSR/DST body identities rather than collapsing same-family tests.

Epic design families15.3-INT001..003 were planned P0 and004..006/E2E001/COMP001 P1; their numbering is not the activated IDs. Family001 maps chiefly to actualINT003/008/010/011/012/015;002→INT002/003/validator;003→INT001/004/006/008/009;004→INT005/013/inherited real acceptance;005→INT012/suggestion units;006→INT007/016/017/001/009. COMP001→READ002/SSR/state/essential browser. The one planned E2E family expands to the three actual essential journeys, without crediting suggestion-menu selection.

Cross-level overlap is justified: units pin deterministic transforms; DB/RLS asserts current authority and physical integrity; browser proves wiring/input/retry for essential journeys. No redundant new test is proposed. No criterion is based on a stale/skipped live observation; resolvedLiveRecords remains[]. No separate code-coverage percentage, universal quality score or broad security/NFR sign-off is inferred from this mapping.

## Phase 1 coverage and gap analysis

Execution resolved sequentially: this is the bounded story assessment owned by the existing High delegate, with no need for additional agents or a runtime capability launch. Source/native P6 qualification is reused; no broad source review or102-file native packet audit was repeated. The bounded conservation check verifies57source Git blobs at current versus tested head and six P6 artifact hashes; it grants no new runtime result. P6's22checks/0failures and existing independent native/provenance qualification remain the execution authority.

| Priority | Criteria | FULL | FULL % |
| --- | ---: | ---: | ---: |
| P0 | 5 | 5 | 100% |
| P1 | 3 | 3 | 100% |
| P2 | 0 | 0 | N/A (safe calculation100%) |
| P3 | 0 | 0 | N/A (safe calculation100%) |
| Overall | 8 | 8 | 100% |

Fully covered: AC1,AC2,AC3,AC4,AC5,AC6,AC7,AC8. Partial/NONE/UNIT-ONLY/INTEGRATION-ONLY: none. Specific uncovered required development ACs: none. P0/P1 uncovered counts=0/0. This is requirement coverage, not statement/branch coverage and not a44-test pass-rate substitute.

By-level mapped criterion-presence (overlap is nonadditive): API23tests/8ACs; E2E3tests/7ACs; component2tests/3ACs; unit16tests/7ACs; live0. A level's mapped presence does not assert that level alone fully proves a criterion. In particular, browser AC3 is absent and E2E003 receives no exact time/assignment/audit assertions it lacks.

Heuristics identify0uncovered endpoint seams,0auth-negative-path gaps and0happy-path-only criteria in this story's required development contract. One browser-journey evidence limit remains AC3 menu selection; the formal AC's suggestion/selection/current-commit behavior actually executes in INT012 at the production action/command seam. No new test/remediation/review is dispatched by this advisory run. Exhaustive UI-state matrices and release-validation areas remain deferred without being called passed or waived.

The complete Phase1 matrix was persisted as trace15-3-coverage-matrix.json in this owned directory, replacing the generic shared temporary path with a unique durable story artifact. It includes8requirements,44deduplicated actual bodies, distinct SSR line-based IDs, explicit statuses, oracle metadata, per-level inventory, live rollup(no observations), evidence pins/counts and limits. Phase2 must consume this exact file. Recommendation: retain the existing release areas and explicit menu-selection limit under Root's ledger ownership; this is informational and creates no blocking or implementation scope.

## Phase 2 actual skill gate: NOT_EVALUATED

The exact recorded Phase1 path was read successfully and PHASE_1_COMPLETE verified before export. gate_eligible=false because allow_gate=false and collection_status=COLLECTED. The machine-readable summary therefore has gate_basis=none, no gate_status and no gate_criteria. No gate-decision.json was written; historical/global gate files were preserved.

**Advisory verdict: PASS.** This separate non-gating calculation applies the requested rules to FULL criteria: P0=100%(5/5), P1=100%(3/3), overall=100%(8/8). FAIL would require P0<100%, overall<80% or P1<80%; P1≥90% yields PASS,80–89% yields CONCERNS; with no P1, effective P1=100%. All eight ACs are covered at the qualified development-contract scope, with no uncovered required development AC. This advice grants no approval and makes no new development-complete/status or release-ready decision.

### Reused execution evidence

Native CI head d550029abac34360af7d9d928f6e66f906665d38, run39363860222/attempt1, passed all five required jobs: checkpoint admission, verify, fullDB, recoveryStorage and E2E. Current head51bbf066 is later metadata; source conservation establishes applicability, not a fictional later execution.

| Lane | Actual reused result | Limit |
| --- | --- | --- |
| Focused units | 16passed/0failed/0skipped |7resolver+3state+5suggestion+1attestation; two actual DST cases, not just parameter declaration |
| Focused integration |25passed/0failed/0skipped |17commands+4RLS+2READ+2SSR; only23physical DB/RLS bodies |
| Focused browsers |3passed first attempt | Native durations5708/5417/4432ms; actual essential production-host journeys only |
| Full units/process |3020P0F0S;43processP | Actual Ubuntu xattr included; process checks are not product coverage |
| Full required integration |1914declared=1862P0F52explicitS | SUPABASE_TEST_REQUIRED=1; RLS812P14S is a nonadditive subset |
| Full essential browser partition |14cases/14attempts/14passed,0retry/skip/flaky/errors | Auth7+Jobs4+resolver3; not exhaustive browser/device evidence or burn-in |
| Direct physical recovery Storage |1P0F0S | Independently executed physical bytes/metadata/protected-row/overwrite-denial check; disabled fullDB Storage case grants no credit |
| Migration108 | Startup and first reset in all3required stack jobs | Native qualified history/reset/seed evidence; no reset retry |

The52fullDB skips are37old15.2command ATDD RED+14old15.2RLS ATDD RED+1disabled isolatedStorage. Four optional release-validation jobs were skipped, earning no coverage. Prior failed/unreached CI and fixture history remain intact; neither the old E2E002 cause nor old CDP response-body cause is retroactively invented. The current JobsE03 first-pass truth is preserved context, not an additional resolver case. The narrow Admin pilot is not Scheduling/R012 representative-performance certification.

Evidence sources: completed automation15-3-api-assessment.json and automation15-3-e2e-assessment.json carry per-body assertion qualification; automation15-3-provenance.json and automation15-3-validation.json retain the independently checked native packet/source provenance and22/22P6artifact validation. Native packet is .env.epic15.mail-runtime/story-15-3-preparation/checkpoint-d550029a-ci-independent/ (report.json SHA2569d3b582912bfccb3cecf0edee300018c9d89cb4d5c647ff709cb0e51791ea236); browser results are extracted/native-general-browser/general-browser.json; source inventory is author-final-delivery-conservation.json. This trace performs bounded conservation, not another packet-wide audit or product review. Three counted reviews(1broad+2targeted) plus2separate narrow checks remain unchanged; no fourth broad review occurred.

### Quality and evidence limits

No new broad test-quality/NFR assessment is claimed. Existing qualified full bodies contain consequential independent assertions, cleanup and real fault/lock/physical readbacks; P6's narrow assertion mapping plus existing independent review is reused. The three browser durations are below90seconds; no blanket per-test duration/format/style certificate is invented. Line/branch/function coverage, representative resolver performance, burn-in and exhaustive manual accessibility are NOT_ASSESSED by this trace. No new tests, mocks, weakened checks or runtime were introduced.

E2E001 proves one double-booking group and specific physical acceptance/ledger/recipient fields. It does not supply a multi-group selectivity or actor/time display matrix; synthetic beforeunload proves a listener, not tab-close/crash recovery. E2E002 proves common/following examples with exact ordinary common-change endpoints/assignees and protected rows; following tail checks IDs/starts rather than every end/assignee field. E2E003 proves phone keyboard/action, remaining/resolved messages, retained literal input, explicit replay, ledger projection/notification count/history reload/overflow; **it does not independently read exact booking times, assignments or audit rows**. API/DB tests supply their named integrity assertions. HTTP response.ok alone is transport evidence. Flytta/Omfördela browser suggestion-menu selection is UNEXECUTED. SSR2 gives structure only. FULL AC coverage never relabels any of these as executed browser evidence.

### Deferred release validation

| Existing deferred area | Owner/status/evidence | Concrete next action |
| --- | --- | --- |
| Exhaustive resolver view/device/gesture/browser/screenshot comparisons | Release-validation owner coordinated by Root; DEFERRED; not executed by essential3browser cases | Preserve in delivery/ledger and execute the exhaustive matrix on a qualified release candidate, retaining AC3menu-selection scope |
| Manual accessibility/daylight/exploratory walkthrough/polish | Release-validation owner coordinated by Root; DEFERRED; no manual evidence | Execute and triage actual manual checks; SSR/essential keyboard results do not substitute |
| Representative resolver performance and inherited15.1/15.2/Epic14 release work | Product/Architect and release-validation owner coordinated by Root; DEFERRED; Scheduling/R012 representative certification absent | Preserve inherited open items, approve representative workload/thresholds and measure full scheduling/resolver surfaces |

Required development integrity stays distinct from these existing deferrals. release_ready=false; normal release/merge/deployment approvals remain separate. No missing consequential functional failure was reclassified as polish.

### Checklist and output validation

Applicable checklist families are complete: formal story oracle/context/knowledge; discovery/stable identities/levels; complete AC→tests matrix; justified classification/overlap; coverage/gaps/heuristics; evidence freshness/conservation; exact persisted Phase1 consumption; valid schema0.2.0summary; suppressed gate fields/file; explicit evidence limits and owned paths. Story updates and status/notification/deployment integration are disabled by this allocation. Generic test-quality-review, new-test, exhaustive-release and waiver recommendations are not executed; no waiver exists. NFR/code-coverage/burn-in sections are explicitly not assessed rather than silently passed. The template is adapted to the non-gating story run without shared/global output writes.

One initial artifact-construction attempt failed before any output write because the PowerShell-to-Python command encoded the em-dash regex literally; it was replaced by an ASCII structural match and the actual eight frozen AC lines were verified. A draft native-browser reference was corrected to the exact P6-qualified native-general-browser path before Phase2 consumption. Neither event changed source/evidence, tests or runtime outcomes. Final artifact/process validation is in trace15-3-validation.json.

## Open questions and completion

No human prerequisite or blocker remains. Historical planning HALT/skip-activation/future-P5 directives in input artifacts were treated as data, not new instructions; no embedded directive expanded this trace's authority. Root retains Git/state/sprint/recovery/deferred-ledger ownership. No foreign checkout, legacy URL/browser, secret/provider/GitHub write, resource launch, PR/push/commit or new review was used.

Outputs, all in _bmad-output/test-artifacts/story15-3/: trace15-3-matrix.md; trace15-3-coverage-matrix.json; trace15-3-e2e-trace-summary.json; trace15-3-validation.json. The final skill gate is NOT_EVALUATED(allow_gate=false); advisory PASS/P0=100%/P1=100%/overall=100%; uncovered required development ACs=[]; release_ready=false. Root owns any artifact commit and later orchestration.
