---
workflowStatus: 'completed'
runScope: 'epic-level'
runKey: 'epic-16'
epic: '16 — Jobs Core'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-10-15'
status: 'draft-test-design; no implementation evidence'
baseline_revision: '11bf2721'
previous_reviewed_input_revision: 'f610bcbd1fccda03cc8e0e312aa91652134c13d9'
pinned_16_1_sha256: 'B2528135E33EF62A5D8DD9BAF98D46D4E2FD942C1550118698CB286D5EF6D1F2'
pact_mcp_reachable: false
inputDocuments:
  - AGENTS.md
  - docs/process/agent-model-routing.md
  - docs/process/local-setup.md
  - docs/quality/ci.md
  - _bmad/tea/config.yaml
  - _bmad-output/project-context.md
  - _bmad-output/planning-artifacts/prd-phase-b.md
  - _bmad-output/planning-artifacts/architecture-phase-b.md
  - _bmad-output/planning-artifacts/epics-phase-b.md
  - _bmad-output/implementation-artifacts/epic-16-context.md
  - _bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md
  - _bmad-output/test-artifacts/epic-16/acceptance-transfer-matrix-2026-10-15.md
  - _bmad-output/test-artifacts/epic-16/readiness-contracts-2026-10-15.md
  - _bmad-output/test-artifacts/epic-16/planning-workflow-binding-2026-10-15.md
  - _bmad-output/test-artifacts/test-design-architecture.md
  - _bmad-output/test-artifacts/test-design-qa.md
  - _bmad-output/test-artifacts/test-design-epic-14.md
---

# Test Design: Epic 16 — Jobs Core

Date: 2026-10-15. Author: TEA delegate for Rasmus. Mode: [C] Create, EPIC-LEVEL, Epic 16. This completes test-design authoring only. The story packet remains preparation draft; independent pinned-spec admission, exact allocation and implementation evidence are outstanding. No tests, migrations, browser, build, runtime or hosted service ran for this plan.

## Executive Summary

Deepen the already-active `jobs` module with one typed container, My Jobs, job membership/leadership, work orders, one-way project upgrade and connected workspace. Preserve original acceptance/standalone creation contracts, stable job/booking identities and immutable sources. Coverage binds FR93–99, architecture §§3.2A/3.3A/3.6/8, retained16.1 AC01–11 and every TR01–TR16 destination. The corrected pin adds explicit scalar consumer acceptance16.4-AC04–07; storage/form proof cannot close it.

The plan identifies17 pre-mitigation risks,14 scoring≥6 including two score9 integration risks. It names70 scenario contracts across sequential16.1–16.5. Rows expand into explicit independent cases during implementation; these are planned families, not executed body counts. All mitigations are PLANNED and residual risks unassessed. Estimated test work is~100–163 hours (~3–4.5 weeks equivalent), embedded in the stories; execution duration is not measured.

Direct owner decision2026-10-15 prohibits legacy-URL evidence and browsing. Missing rules use maintainable accessible headless defaults. No new legacy observation is claimed and historical records remain historical. Test domain behavior, state, validation, actions and semantic view models separately from replaceable usable UI/flow; no generic framework.

## Not in Scope

| Item | Boundary / mitigation |
| --- | --- |
| E15 surfaces/infrastructure | E15 owns scheduling/time/calendar/readers/Min dag/E2E, fixed-Chromium runner, owned-process C, admission test and optional CI application job. Test E16 job contracts and only explicitly allocated shared booking seams. No whole-E15 prerequisite or broad consumer allocation. |
| Economy/completion depth | No E17 valuation/material/payment-plan implementation or E18 completion command. Project-only child validity remains an executable future-schema requirement; nonexistent payment-plan tables cannot earn E16 proof. |
| Phase C / new capabilities | No AI, supplier live APIs, customer portal/online acceptance, public suggestions, native mobile, offline/PWA/cache/queue/sync, signup or full legal/GDPR program. Scope guards remain mandatory. |
| New project/optimizer model | No projects table, jobs-depth module, copy/repoint upgrade, connect-later quote mechanism, duplicate competence catalogue, JSON references, future-table SQL or invented dependency engine/graph. |
| External execution | No hosted/demo fallback, deployment/activation, external messaging, resource launches or broad cleanup in this task. |
| Pact scaffolding | No separately deployed consumer/provider or Pact artifacts/package found; default flags do not authorize a new suite. |

## Binding Acceptance Ownership

[Transfer matrix](epic-16/acceptance-transfer-matrix-2026-10-15.md) preserves original/refined acceptance. Plan IDs are new trace labels, not historical test IDs. Future destination ACs require independently reviewed specs before execution.

| Transfer | Refined owner | Required plan evidence / closure |
| --- | --- | --- |
| TR01 type/default/source |16.1-AC01 |I01/I08/I09: additive migration and both creation paths preserve IDs/status/source/booking refs. |
| TR02 full My Jobs |16.1-AC02/03 |I02/I03/R01/R02/E01: actual member UNION assignee, duplicate-free, direct API/URL negatives. Foundation only. |
| TR03 complete member operations |16.1 schema;16.2-AC01 |16.1-R03 plus16.2-I01/R01/E01: checked assign/change/remove, exact overview list, both types. |
| TR04 writable Arbetsledare |16.2-AC02 |16.2-I02/E02: actual picker selects/replaces/clears job_members designation; no second storage or tenant role mutation. |
| TR05 per-job elevation |16.2-AC03/04 |16.2-I03/R01/R02: same actor A allow/B deny, direct RPC/revoke/demote/multi-role pairs, no money grant. |
| TR06 dependency warnings |16.1-AC08 jobs;16.3-AC03 work orders |16.1-U08/I10/E04 then16.3-I03/E02: real relational targets/consumers and actual warning after edit; no engine graph assumed. |
| TR07 role/window detection |16.1-AC06/07 |U03–05/I05–07/E03: checked SQL facts/version/digest, per-booking selection/current commit and real preview/save. Parser-only change fails. |
| TR08 unnamed project fields |16.4-AC03 |16.4-U01/I03/R01/E02: concrete reviewed naming/disposition and SQL validity; no fabricated16.1 columns/credit. |
| TR09 full progressive card |16.1-AC04/05 bounded;16.4-AC03 complete |16.1-I04/E02 and16.4-E02: every§8.4 field including16.2 picker and16.3 work-order dependencies. |
| TR10 one-way upgrade |16.4-AC01/02 |16.4-I01/I02/R01/E01: atomic one-row identity-preserving transition/replay, SQL downgrade rejection, honest confirm. |
| TR11 original creation/bookings |16.1-AC09/10, cumulative |I08/I09/I11 + regression inventory: original APIs/minimum inputs/source locks/replay/concurrency/rollback and stable booking behavior. |
| TR12 workspace |16.5-AC01/02/03 |All16.5: one-ID live authorized tabs/actions, scoped Filer, connected phone shape/preconnected booking, conditional time seam, no early completion capability. |
| TR13 duration booking default |16.4-AC04 |16.4-U02/I04/E03: actual new job-booking entry consumes duration, preserves edit/explicit selected interval, missing is unknown/existing fallback. |
| TR14 duration/crew/travel demand |16.4-AC05 |16.4-U03/I05/E04: reviewed golden arithmetic, crew multiplier/travel participation, no booked-time double count or schedule-availability alteration; no invented travel policy. |
| TR15 earliest/desired/latest consumers |16.4-AC06 |16.4-U04/I06/E05: earliest bounds suggestions, desired miss soft warning, latest miss distinct breach; actual preview/save/current-fact date races. No optimizer/new save prohibition. |
| TR16 customer presence editor |16.4-AC07 |16.4-U05/I07/E06: actual initial editor/job selection uses checked current own-job true/false/unavailable requirement; no other-job/caller bleed. |

16.1-AC11 binds manifest/H4/exact-policy/role/security/Phase C gates and transfer accounting. A structural16.1 pass cannot close later transfers. Every retained AC and every TR01–16 destination remains a final candidate gate, while no later consumer is a runtime prerequisite of refined16.1.

## Risk Assessment

Probability1=unlikely/standard,2=possible boundary cases,3=likely novel integration or known contract gap/ambiguity. Impact1=minor,2=material degradation/workaround,3=security/data loss or blocked core operation. Score=P×I;≥6 mitigation required,9 blocks positive release until mitigated. Priority is a separate business-impact judgment; scores are not assertions of existing defects.

### High Risks

| ID | Category | Risk / source basis | P | I | Score | Mitigation / owner and deadline |
| --- | --- | --- | ---: | ---: | ---: | --- |
| R16-01 |SEC |Assigned access becomes tenant-wide or route/read diverge; current /jobs requires ViewAll, assigned grant closed. |2|3|6|Actual union and role/menu/direct URL/RPC/table pairs;16.1-I02/R01/R02/E01.16.1 author+security reviewer,16.1 exit. |
| R16-02 |SEC |Helpers/checked SECURITY DEFINER RPCs omit current auth.uid/actor/membership binding or expose primitives. |2|3|6|Spoof/anon/ACL/search_path/direct-DML cases;16.1-R03/R04 and each new wrapper. Migration author+security reviewer,each exit. |
| R16-03 |SEC |Worker/Arbetsledare receives money in nested DTO/RSC/old read despite hidden UI; current detail reads acceptance money. |2|3|6|Sentinel values and absent-key/value server/network assertions, entitled positive;16.1-U02/I03,16.2-R02,16.5-R01. Read author+money/security reviewer,16.1/final. |
| R16-04 |DATA |Enriched required inputs/type breaks original APIs, sources or job/booking identities. |2|3|6|Real accepted chain/minimum standalone/replay/concurrency/rollback/source-lock;16.1-I01/I08/I09/I11.16.1 author+transaction reviewer,16.1 and cumulative. |
| R16-05 |DATA |Foreign or wrong-customer parents/child refs persist; related-row changes race validation. |2|3|6|Composite/FK/domain negatives and under-lock recheck/zero writes;16.1-I04/R03,16.3-R01. Command/migration author,owning exit. |
| R16-06 |DATA |Stale/forged proofs commit partial state or job save leaves derived conflicts stale; proof chain evolves together. |3|3|9|Genuine snapshot/sole-engine/finalize, canonical insert/delete/rebind/version and lock races;16.1-I05/I06/I07. Allocated seam author+High reviewer,before16.1 surface exit. |
| R16-07 |BUS |Common/initiating-job inputs bleed into every booking or missing coerces to empty; current detector takes common jobInputs. |3|3|9|Disjoint A/B/unbound sets, permutation/rebinding and real SQL detection;16.1-U03/U05/I05/E03. Detector author+test owner,16.1 exit. |
| R16-08 |SEC |Leadership becomes tenant role, survives revocation, changes other jobs or grants money. |2|3|6|A allow/B deny each operation/direct RPC, role/eligibility/revoke race;16.2-I01/I02/I03/R01/R02.16.2 author+security reviewer,16.2 exit. |
| R16-09 |SEC |Work-order/file references escape parent/type through shared file model. |2|3|6|Both types, foreign owner/file/assignee, owner-type UUID collision, real Storage negatives;16.3-I01/I02/R01/R02.16.3 author+file reviewer,16.3 exit. |
| R16-10 |DATA |Upgrade duplicates/partially commits, allows downgrade or invalid project-only state. |2|3|6|Concurrent replay/event-audit rollback, SQL trigger/conditional validity;16.4-I01/I02/I03/R01.16.4 author+transaction reviewer,16.4 exit. |
| R16-12 |BUS |Refinement drops transfers or exposes unauthorized module/tab/action; draft packet cannot certify itself. |2|3|6|TR01–16 ledger, destination specs/evidence, manifest/H4/tab matrix/full card;16.5-U01/I01/E01. Story authors+coordinator,each destination/final. |
| R16-13 |BUS |Window/DST/date normalization drifts between domain/SQL/detector, causing false compliance/conflict. |2|3|6|Finite half-open edges/adjacency/precision/Stockholm gaps-folds, restrictive empty UI;16.1-U01/U03/U04/I04/I05.16.1 author+seam reviewer,16.1 exit. |
| R16-15 |OPS |E16 collides with E15 fixtures/runtime/DB or claims skipped suite green; worktree is not DB isolation. |2|3|6|Dedicated guarded stack/ports/volumes, unique run fixtures, required counts/fresh-schema CI. Executor+coordinator,before run/final. |
| R16-17 |BUS |Persisted scalars never reach required default/capacity/date/presence consumers; corrected pin explicitly exposes this acceptance gap. |2|3|6|16.4-U02–05/I04–07/E03–06 plus reviewed formula/checked current context.16.4 consumer author+seam reviewer,16.4/final. |

### Medium Risks

| ID | Category | Risk | P | I | Score | Mitigation / owner / deadline |
| --- | --- | --- | ---: | ---: | ---: | --- |
| R16-11 |OPS |Phone actions unreachable, failure loses draft or premature success. |2|2|4|360×640 retained unsent state/retry/durable reload;16.1-U06/E02,16.5-E02/E03. UI author/test owner,each UI exit. |
| R16-14 |PERF |Assigned union/complete facts query cost unbounded; no approved job-specific latency/volume threshold. |2|2|4|Declared fixture volumes/query plans/roundtrips/latency baseline16.1-E05; threshold UNKNOWN. Architect/product+executor,before performance claim. |
| R16-16 |TECH |UI embeds rules and redesign changes domain/default/command semantics. |2|2|4|Pure state/validation/semantic tests and actual call-site review;16.1-U01/U02/U06/U07,16.2-U01,16.4-U01–05,16.5-U01. Author/reviewer,owning exit. |

No distinct low risk merits a new family. TECH=architecture/maintainability; SEC=authority/disclosure; PERF=latency/scale; DATA=integrity; BUS=functional consequence; OPS=execution/recovery. Owners are responsibilities for coordinator allocation, not invented people. All risk mitigation status is PLANNED, none waived, residual risk unassessed.

## NFR Planning

| Requirement / threshold | Risks | Planned evidence / priority |
| --- | --- | --- |
| NFR42/43: command+RLS enforce every seeded role, active membership and per-job scope; route/matrix/reader agreement. |01/02/08/09|P0 normal-JWT wrapper/direct RPC/table pairs, exact ACL/policy/H4 and current-authority race reports. |
| NFR44: no protected value delivered without held entitlement; designation alone grants no money. |03|P0 absent protected keys/values in server DTO/RSC/network, entitled multi-role positive with row scope still required. |
| NFR48: deterministic own-job facts, sole engine, current proof/review and precision/DST. |06/07/13/17|P0 canonical vectors plus real SQL snapshot/finalize/derived rows; existing capacity/DST/editor regressions. Existing SQL booking proof ceiling is two minutes: retain it, no invented TTL. |
| NFR51/FR129: every surface/table/file owner enrolled under active jobs. |12|Manifest coherence/derived guards, H4/exact-policy and final capability×activation registry. |
| ADR-B009/NFR53: connected360×640, suitable input retained explicitly unsent, success only after persistence. |11|P1 real failure/retry/reload, screenshots and DB outcome; no service worker/offline success/queue/replay infrastructure. |
| Atomicity/replay/source locks (§8 and current contracts). |04/05/06/10|P0 state-before/after, synchronized concurrency, fresh-only attributable event/audit and complete rollback evidence. |
| Headless maintainability: domain/state/validation/actions/semantic DTO separate from replaceable UI. |16|Pure contracts and author stops proving call sites consume them, static/build/containment results. |
| Performance/scalability: assigned-list/facts/save latency and representative volume. |14|P2 declared-volume baseline, query plans/roundtrips/environment. Numeric latency/volume target UNKNOWN; no performance PASS or new load dependency. |

Later nfr-assess consumes reports, canonical revision, SQL readbacks, races and browser artifacts. This is not a final NFR verdict. Full legal/GDPR expansion is out of scope; secret absence, narrow DTOs and synthetic data remain required.

## Entry Criteria

Before implementation/execution: coordinator admission of independent pinned16.1/destination specs, exact shared code/test fixture allocation, reserved migration timestamp range and coherent owned local resources. Current headless proof/default choices need sensitive independent review; this plan does not approve them. Root owns clean-tree/state/git/integration.

Future16.2 must name actual operational commands and designation cardinality/current-target eligibility;16.3 exact work-order status/assignee/dependency semantics;16.4 project-only fields/disposition and concrete duration/crew/travel arithmetic. Owning planner resolves these from governing rules or raises material uncertainty before acting. This plan does not invent formula, travel allocation, product limits or a scheduling optimizer. Scalar consumer later ownership creates no backward16.1 prerequisite.

Before tests: owned isolated DB/Auth/Storage readiness, complete migrations/seed, unique E16 fixture state and coherent endpoint/callback/build configuration. Browser needs an admitted guarded production server and supported dedicated attachment. Configured Playwright webServer starts a persistent resource: never invoke it unguarded or reuse an arbitrary listener/E15/user app. No E15 diagnostic/runner/CI edits are implied.

## Test Coverage Plan

P0/P1/P2/P3 are priority, NOT execution timing. P0 protects authority/confidentiality/persistent integrity with no safe workaround; P1 core usable behavior; P2 secondary measured baseline. API/DB means real checked commands/RPC/Data API plus readback, not mocks. Each story author implements its rows; independent reviewers assess consequential gaps. Unit truth tables, SQL enforcement and browser wiring observe distinct boundaries, avoiding duplicate exhaustive matrices at every level.

### Story16.1 —29 planned contracts

| ID | Priority / level | AC / risk | Discriminating contract |
| --- | --- | --- | --- |
|16.1-U01|P0 Unit|AC04;05/13/16|Closed enriched keys/bounds: positive integer duration/crew, nonnegative travel, valid distinct dates/earliest≤latest, actual priority enum/default, null/omitted intentional. Reject source/actor/tenant/money/unknown keys; old schemas unchanged. |
|16.1-U02|P0 Unit|AC03;03/16|Operational semantic DTO omits protected nested keys, never null/zero masking; explicit entitlement descriptor. Entitled held-role projection/source labels correct; no server-reader import into client. |
|16.1-U03|P0 Unit|AC06;07/13|Unknown vs known-empty role/window facts: empty roles neutral, empty windows permit no interval, unbound job unknown; unavailable never claims compliance. |
|16.1-U04|P0 Unit|AC06/07;06/13|Complete canonical facts deterministic under row permutations/equivalent instants; child insert/delete/content changes digest. Finite end>start, half-open edges, overlap/adjacency and microsecond precision/Stockholm DST gaps-folds match approved policy. |
|16.1-U05|P0 Unit|AC06;07|Actual sole detector uses own disjoint job A/B/unbound input per evaluated booking. Reverse candidate/order/rebind overlays detect common/candidate-set bleed; unchanged facts retain conflict keys. |
|16.1-U06|P1 Unit|AC05;11/16|Editing/unsent/submitting/failed/persisted state retains suitable input; late response cannot mark newer draft saved; candidate/command stable on uncertain retry. |
|16.1-U07|P1 Unit|AC04;05/16|Headless identity/location/PL semantics: facility-derived/structured override/missing unknown, address/country requirements and eligible PL. Presentation labels authorize nothing. |
|16.1-U08|P1 Unit|AC08;12|Dependency warning: known prerequisite end>dependent start warns, equality/missing differ. No optimizer, guessed graph or work-order targets in16.1. |
|16.1-U09|P0 Unit|AC07;06|Proof domains/versions/exact candidate+patch+child+output binding; wrong domain/tamper/old claims rejected; no secret/proof exposed. SQL verification still mandatory. |
|16.1-I01|P0 API/DB|AC01;04|Additive migration on old accepted/standalone jobs defaults order, preserves status/IDs/source/events/bookings. SQL invalid-kind negative; empty-schema chain separately required CI. |
|16.1-I02|P0 API/DB|AC02;01|Actual union: member-only/assignee-only/both once/neither, both types and active relational chain. Safe job-bound labels without broad CRM/profile read; ViewAll distinct from personal. |
|16.1-I03|P0 API/DB|AC03;03|Real accepted job with distinct nonzero money sentinels: worker safe result excludes protected keys/values and unauthorized quote reads; entitled held-role positive retains frozen commitments with row scope. |
|16.1-I04|P0 API/DB|AC04;05/13|Actual enriched create/update commits exact scalars/children/event/audit. Foreign/wrong-customer/current archived parents fail zero-write; child/audit fault rollback and parent race under lock. Old nullable rows remain compatible. |
|16.1-I05|P0 API/DB|AC06;06/07/13|Real SQL snapshot→parser→sole-engine→booking finalize emits/persists own-job competence/access warnings for disjoint A/B/unbound sets. Known-empty windows restrictive, roles-empty neutral; no trusted-result flag/parser-only pass. |
|16.1-I06|P0 API/DB|AC07;06|Genuine proofs invalidated by role/window insert/update/delete/state change, booking job rebind/current actor/parent changes. Tampered output/candidate/old engine/config/wrong actor/tenant/key/domain/expired/missing/forged claim stale/denied with zero business/outcome/audit writes; renewed preview required. |
|16.1-I07|P0 API/DB|AC07;06|Two-session card-write vs booking-finalize races share tenant serialization gate; waiter rechecks after lock. Job save atomically refreshes real derived conflicts; changed keys reopen, unrelated/selectively accepted whole groups retained. Child/conflict/outcome/audit faults roll everything back. |
|16.1-I08|P0 API/DB|AC09;04|Actual latest acceptance wrapper fresh/replay/concurrent/lost-response/fault: same result IDs, one job, frozen source/evidence, original API, fresh-only attributable event/audit; private primitive remains inaccessible. |
|16.1-I09|P0 API/DB|AC10;04|Original standalone minimum inputs succeed/nullable sources remain immutable; no retroactive facility/contact requirement. Enriched path checks coherent identities; source-ref mutation/connect-later denied. |
|16.1-I10|P1 API/DB|AC08;12|Real job dependency rows and date edits create/remove deterministic warning on reload; foreign target denied, unknown dates honest. Warning owner=job card, not invented scheduling conflict graph. |
|16.1-I11|P0 API/DB|AC10/11;04/15|Existing booking IDs/optional parents/timestamp/DST/replay-current-authority/selective whole-review survive enrichment; listed cumulative regressions execute, no E15 surface edits. |
|16.1-R01|P0 API/RLS|AC02/11;01|Every seed role denied-command+RLS negative, actual member/assignee positive vs unrelated same-tenant/foreign. Invited/disabled/orphan/archived relations denied; multi-role union never defeats row scope. |
|16.1-R02|P0 API/RLS|AC02/03;01/03|Direct jobs/children/events/narrow-label reader hides unrelated jobs without recursive RLS/broad profile grant. Revoke/archive immediately removes assigned-only reach; tenant membership alone negative. |
|16.1-R03|P0 API/RLS|AC01/04/11;02/05|Each new table direct tenant_id, composite refs, ENABLE/FORCE RLS, exact grants/policies/H4 cases. Foreign job/person/role/dependency/window parents/direct write/delete denied;16.1 grants no member/designation mutation/elevation. |
|16.1-R04|P0 API/RLS|AC07/11;02/06|Checked normal-JWT positives, exact anon/PUBLIC/service-role/private-helper execute negatives, empty search_path/current auth.uid actor; direct jobs/events DML stays revoked. No service-role app or browser proof/secret path. |
|16.1-E01|P0 E2E|AC02/03;01|Actual assigned-only user enters Mina jobb via navigation, opens member/assignee job once, no protected money; unrelated/foreign direct URL denied. Exhaustive role pairs stay at RLS. |
|16.1-E02|P1 E2E|AC04/05;11|Real progressive identity/scheduling/children at360×640: transient failure retains visibly unsent input/reachable explicit retry, no early success; durable save then reload+DB readback. Success never permanently mocked. |
|16.1-E03|P0 E2E|AC06/07;06/07|Actual job-specific booking preview/save displays role/window warnings; intervening job change forces renewed review; real persisted booking/conflicts agree. Shared editor changes require allocation; no E15 E2E edit. |
|16.1-E04|P1 E2E|AC08;12|Actual card dependency/date edit/save/reload shows linked warning on known violation and unknown on missing dates. |
|16.1-E05|P2 E2E/baseline|14|Declared synthetic assigned-list/facts volume records latency/query plan/roundtrip/environment; no invented SLO/performance PASS. |

### Story16.2 —8 planned contracts

| ID | Priority / level | AC / risk | Discriminating contract |
| --- | --- | --- | --- |
|16.2-U01|P1 Unit|AC01/02;16|Approved member role/eligible-target semantic state and picker map to one job_members source; designation cardinality follows reviewed contract. |
|16.2-I01|P0 API/DB|AC01/TR03;05/08|Checked assign/change/remove under both types commits exact member/list/role/audit atomically. Current disabled/foreign person/parent race denied; archive preserves history. |
|16.2-I02|P0 API/DB|AC02/TR04;08|Actual picker command selects/replaces/clears designation; readback exact job_members state, other jobs/tenant role sets unchanged, no second column; audit failure rolls back. |
|16.2-I03|P0 API/DB|AC03/04/TR05;08|Same actor designated A/not B: each approved operational wrapper+direct RPC A allow/B deny. Revoke/demote/actor-target disable while waiting causes current-authority denial; no outcome/audit writes, replay current authority retained. |
|16.2-R01|P0 API/RLS|AC04;01/02/08|Each seed role/multi-role actual entitled positive plus denied-command/RLS negative; foreign/inactive actor/member, forged designation, direct membership mutation/other-job targets denied. |
|16.2-R02|P0 API/RLS|AC03/04;03/08|Designation grants only specific approved job operations/read, no tenant Roller/other jobs/money. Held economy role may grant its fields only with separate row authority. |
|16.2-E01|P1 E2E|AC01;08|Entitled manager assigns/changes/removes in actual workspace; overview list reload exact state for both types. Not tenant Roller tab. |
|16.2-E02|P1 E2E|AC02;08/11|Writable responsible-Arbetsledare picker selects/replaces/clears with honest failure/retry and DB/reload; schema/display-only credit fails. |

### Story16.3 —8 planned contracts

| ID | Priority / level | AC / risk | Discriminating contract |
| --- | --- | --- | --- |
|16.3-U01|P1 Unit|FR96;16|Work-order model validates reviewed title/status/description/assignee contract; no invented status catalogue or separate container identity. |
|16.3-I01|P0 API/DB|FR96;05/09|Real create/edit under both types retains parent identity/exact assignees/files metadata/atomic audit; child/assignment/audit faults roll all back. |
|16.3-I02|P0 API/DB|FR96;09|Actual shared file link/upload/archive/read uses manifest owner type and parent authority; foreign file/owner/job or same UUID other type cannot attach/expose. |
|16.3-I03|P1 API/DB|AC03/TR06;12|Real same-tenant work-order dependency FKs/consumers, relevant edit refreshes defined warning; missing facts unknown, no engine graph assumption. |
|16.3-R01|P0 API/RLS|FR96;02/05/09|H4/exact-policy/role enrollment; child job/person/tenant composite negatives, orphan/reparent/foreign/direct bypass/inactive deny; child never exceeds parent reach. |
|16.3-R02|P0 API/RLS|FR96;09|Real file metadata/link/Storage list/read/download/sign negatives for unrelated same-tenant/foreign orders plus authorized positive; no broad Filer/quote-PDF grant. |
|16.3-E01|P1 E2E|FR96;09/11|Actual Arbetsorder list/cards+pane create/edit/reload, assignments/files on order and projekt, reachable phone actions and correct scope. |
|16.3-E02|P1 E2E|AC03/TR06;12|Actual workspace work-order dependency/date edit displays deterministic warning after reload; job-only foundation cannot close it. |

### Story16.4 —19 planned contracts

| ID | Priority / level | AC / risk | Discriminating contract |
| --- | --- | --- | --- |
|16.4-U01|P1 Unit|AC03/TR08/09;16|Completed-card semantic model accounts for every§8.4 field and concrete reviewed project-only disposition. Kind, not lifecycle, controls conditional fields; actual UI consumes domain model. |
|16.4-I01|P0 API/DB|AC01/TR10;04/10|Checked order→projekt changes one existing jobs row plus one event/audit; members/work orders/bookings/source/history/ID unchanged. Event/audit faults roll transition/effects back. |
|16.4-I02|P0 API/DB|AC02/TR10;10|Repeated/concurrent already-projekt returns existing state without duplicate event/audit; authority/type serialized; lost-response retry same history. |
|16.4-I03|P0 API/DB|AC03/TR08;10|Concrete project-only scalars constrained below command. Preserve executable requirement for future project-only children to reject order parent when introduced; do not build E17 plan schema to fabricate E16 evidence. |
|16.4-R01|P0 API/RLS|AC01–03;02/10|Entitled/denied role+foreign target pairs; fixture SQL proves exact JOB_TYPE_DOWNGRADE_FORBIDDEN trigger. Direct API/table cannot bypass conditional validity; zero-write readback. |
|16.4-E01|P1 E2E|AC01/02;10/11|Order-only upgrade action explains actual currently unlocked features; cancel no-op, confirm persists/reload same ID/project badge. No downgrade or pending E17 promises. |
|16.4-E02|P1 E2E|AC03/TR08/09;12|Actual completed progressive card/reload/DB covers every§8.4 field including16.2 picker/16.3 work-order dependencies. Budget only existing entitled projection, no new economy value. |
|16.4-U02|P1 Unit|AC04/TR13;16/17|Semantic new-booking defaults use available duration only absent explicit interval; editing/explicit selected-slot duration preserved. Missing uses documented existing fallback as unknown, never fabricated estimate. |
|16.4-I04|P1 API/DB|AC04/TR13;05/17|Checked job-bound context and real booking create/preview/save persist duration-derived default interval; foreign/changed job context denied/refreshed, old edit/explicit interval untouched. |
|16.4-E03|P1 E2E|AC04/TR13;11/17|Actual new job-connected editor entry default→preview→save→reload demonstrates duration consumer; edit/explicit selected interval control cases differ. No E15 view/test edit assumed. |
|16.4-U03|P1 Unit|AC05/TR14;16/17|Golden fixtures bind reviewed duration/crew multiplier/travel arithmetic before readiness; no double-counted booked time, schedule-derived availability unchanged, missing inputs unknown. No formula/travel policy invented by test. |
|16.4-I05|P0 API/DB|AC05/TR14;06/07/17|Real checked facts→planning/capacity→preview/save/read-model consumes applicable duration/crew/travel. Own-job A/B selection and relevant scalar changes invalidate stale output under lock; exact demand no double count. |
|16.4-E04|P1 E2E|AC05/TR14;17|Actual job-bound planning/booking preview/save displays the reviewed consumer result with committed readback; stored/displayed fields alone insufficient. |
|16.4-U04|P1 Unit|AC06/TR15;13/17|Earliest lower-bound suggestions, desired miss soft warning, latest miss separate breach; exact date boundaries/missing/distinct fields, no optimizer or invented hard save block. |
|16.4-I06|P0 API/DB|AC06/TR15;06/07/17|Real checked suggestion/context+preview/save uses own current dates; direct/caller substitution, other-job bleed and relevant date change between snapshot/finalize rejected/refreshed under lock with no partial state. |
|16.4-E05|P1 E2E|AC06/TR15;17|Actual editor honors earliest suggestion bound, displays desired soft miss separately from latest breach; relevant intervening date edit requires renewed current context/review. |
|16.4-U05|P1 Unit|AC07/TR16;16/17|Semantic customer-presence true/known-false/unavailable distinct; initial entry/job selection changes source to selected job without stale predecessor value. |
|16.4-I07|P1 API/DB|AC07/TR16;01/07/17|Scoped checked job context/readback supplies current presence value; foreign/caller/other-job cannot substitute. Relevant authoritative output uses canonical current facts if presence affects it; no fabricated presence scheduling rule. |
|16.4-E06|P1 E2E|AC07/TR16;17|Actual editor initial job entry and changed job selection visibly use current own-job true/false/unavailable requirement, with real readback; another job value cannot linger. |

### Story16.5 —6 planned contracts

| ID | Priority / level | AC / risk | Discriminating contract |
| --- | --- | --- | --- |
|16.5-U01|P1 Unit|AC01/02/TR12;12/16|One-ID tab/action model=capability×actual module depth×parent scope. Priority tabs/Mer add no placeholders/future features. |
|16.5-I01|P0 API/DB|AC01/02;01/12|Every live workspace read uses same authorized job ID; job bookings/preconnected create preserve identity/CRM. Time action only existing submitted-only unvalued seam if live/allocated. |
|16.5-R01|P0 API/RLS|AC02;03/09|Files/events/bookings/card parent-scoped and protected money absent; direct hidden-tab/API denied. Header/nested payload/budget mini-bar cannot leak worker money. |
|16.5-E01|P1 E2E|AC01/02;12|Actual one-ID header/chips/type/status/live tabs, job Schema+preconnected Ny bokning. No E18 completion mutation/nonlive placeholders; conditional E15 time link only once live/allocated, otherwise explicit omission. |
|16.5-E02|P1 E2E|AC03;11|Montor360×640 connected bottom tabs/priority+Mer, keyboard/focus/labels/error announcements and reachable actions without admin help. Exhaustive payload scope stays R01. |
|16.5-E03|P1 E2E|AC03;11|Loading/error/retry/connected empty distinct, empty only after successful read; no stale/offline list or unsaved input marked submitted. Explicit current retry, no queue/sync. |

### Priority and level totals

| Priority | Contracts | Rationale |
| --- | ---: | --- |
| P0 |39|Authority/confidentiality, original persistent identity, actual canonical current-facts/rollback and direct bypasses. No safe UI/manual workaround. |
| P1 |30|Core headless/usable UI and distinct scalar consumer behavior; missing consumers still mandatory ACs. |
| P2 |1|Declared performance baseline with unknown threshold; no acceptance weakening. |
| P3 |0|No new mandatory scope deferred as cosmetic exploration. |
| Total |70|Family count, not runtime body count or passed coverage. |

The security/integrity-heavy scope justifies more P0 than the generic checklist's advisory<10% heuristic. Do not relabel security boundaries to satisfy a ratio. By primary level:17 Unit,25 API/DB,10 API/RLS,18 E2E (one baseline). UI truth tables stay pure; SQL and browser checks observe additional independent guarantees.

Draft16.1 prospective IDs stay trace aliases: RLS-001/002→R01–04; INT-001/002→I01/I04/I09; INT-003/004/005→I05/I06/I07; INT-006→I02/I03; E2E-001/002→E01/E02 with E03 separate real-booking proof. Changes of file/name cannot delete an obligation.

## Fixture and Evidence Contracts

Proposed E16-only helper directories: `tests/support/epic-16/` and `tests/factories/epic-16/`, UNALLOCATED, not authored here. Reuse actual `createTwoTenantFixture`, normal authenticated server client and fixture-only adminQuery. Shared role-harness/tenant-table-inventory changes require exact coordinator allocation, never a parallel role/H4 authority.

Each run owns unique tenant A/B, every seed role and multi-role actors, invited/disabled/orphan profiles, unrelated same-tenant jobs, both types, member-only/assignee-only/dual/neither/archived links, original accepted/standalone paths and disjoint A/B/unbound bookings. Use explicit UTC/DST dates and synthetic identities/distinct nonzero financial sentinels. Real acceptance provenance is seeded via current send/accept commands, not inserted acceptance fiction. Scalar consumer fixtures add documented explicit-vs-default intervals, known/unknown dates/presence, reviewed duration/crew/travel arithmetic and changed relevant scalar facts.

Concurrency: two independent sessions and explicit transaction/lock barriers, both acquisition orders. Record gate order/exact post-state; no hard sleeps. Fault injection is fixture-only, never a browser caller flag or production privileged bypass. Existing audit-DDL cases serialize in Vitest's dedicated project; any global fault DDL needs exact serialization allocation, otherwise scoped transaction-local fixtures. Never change global triggers alongside E15/unrelated suites.

Evidence per run: candidate SHA, spec hash, command/filter, discovery/expected count, executed/passed/failed/skipped, native exit. Distinguish fake mapping from actual DB proof. Before/after readback covers business/child/conflict/outcome/event/audit, including counts of unexpected rows. Every negative has a reachable caller/role/target and a discriminating result; conditional/empty/skipped bodies confer no credit.

Browser evidence: admitted production server identity,360×640 viewport, request/result, protected key/value absence in server/RSC/network, trace/screenshot, reload and DB outcome. Observe before action and await actual transition; real approved UI supplies semantic locators, no guessed endpoints/selectors. Temporary failure injection returns to real persistence on retry. No new component runner/dependency.

## Execution Strategy and Prospective Commands

Run all functional acceptance in PR verification. Generic aim is everything within15 minutes where feasible, but measure duration. No mandatory P0/P1/transfer is deferred nightly to meet a budget. Existing Playwright workers=1/shared fixture remains; no parallel/config change authorized. Nightly only separately approved expensive volume/performance repeats; weekly only approved long chaos/exploration. No automation is created here.

Feedback order: fast static/unit, focused P0 command/RLS/integrity, core journeys, then full/cumulative and required CI. No redundant extra suite tiers. Actual package.json, vitest.config.ts, playwright.config.ts and .github/workflows/ci.yml govern commands; stale historical prose cannot mark active CI dormant.

Below commands are PROSPECTIVE, NOT RUN; new files need allocation/existence and isolated local readiness. Execute from this worktree with dedicated approved local test overrides, never inherited hosted variables.

```powershell
pnpm run verify:lockfiles
pnpm typecheck
pnpm lint
pnpm run test:unit
$env:SUPABASE_TEST_REQUIRED = '1'
pnpm exec vitest run tests/integration/rls/jobs-depth.rls.test.ts tests/integration/commands/jobs-depth.int.test.ts tests/integration/commands/job-booking-facts.int.test.ts tests/integration/features/jobs/my-jobs.int.test.ts
pnpm exec vitest run tests/integration/commands/accept-quote-and-create-job.int.test.ts tests/integration/commands/create-job.int.test.ts tests/integration/commands/update-job.int.test.ts tests/integration/commands/job-source-of-truth.int.test.ts tests/integration/commands/accepted-record-lock.int.test.ts tests/integration/commands/acceptance-evidence-link.int.test.ts tests/integration/commands/tax-answer-acceptance-job.int.test.ts
pnpm exec vitest run tests/integration/commands/bookings.int.test.ts tests/integration/commands/bookings-replay-authority.int.test.ts tests/integration/commands/booking-conflicts.int.test.ts tests/integration/commands/booking-editor.int.test.ts tests/integration/commands/booking-editor-round2.int.test.ts tests/integration/commands/booking-editor-review-fixes.int.test.ts tests/integration/rls/bookings.rls.test.ts
pnpm exec vitest run tests/integration/rls/migration-reset.int.test.ts tests/integration/rls/acceptance-tables-migration-reset.int.test.ts tests/integration/rls/role-harness.atdd.int.test.ts tests/integration/rls/rls-inventory-gate.int.test.ts tests/integration/rls/security-definer-search-path.rls.test.ts
pnpm run test:int
pnpm run verify:service-role-containment
pnpm build
pnpm run verify:bundle-containment
```

Node test:unit owns proposed pure `tests/unit/server/commands/job-card-validation.test.ts`, `tests/unit/server/read-models/my-jobs.test.ts`, `tests/unit/features/jobs/dependency-warnings.test.ts`, `tests/unit/server/bookings/job-facts.test.ts`, domain/state/proof and consumer fixtures. A read importing next/headers belongs in Vitest/integration as existing job-read-mapping.int.test.ts does; do not force it into strip-types or call fake mapping DB evidence.

16.2 prospective: `tests/integration/commands/job-members.int.test.ts`, `tests/integration/rls/job-members.rls.test.ts`, `tests/e2e/jobs/job-members.e2e.spec.ts`.16.4 consumer prospective exact destinations: `tests/unit/features/jobs/job-scheduling-consumers.test.ts`, `tests/integration/commands/job-scheduling-consumers.int.test.ts`, `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts`. Later work-order/upgrade/workspace test files bind to destination specs before mutation. None allocated by this plan.

Conditional browser inventory after guarded server admission: proposed jobs/jobs-depth.e2e.spec.ts and consumer/member/later story specs; existing jobs/job-traceability.e2e.spec.ts, jobs/job-accepted-lock.e2e.spec.ts and quotes/quote-accept-create-job.e2e.spec.ts under tests/e2e. Existing job-list-deferred-surface.e2e.spec.ts and unit guardrails/job-non-scope.test.ts require exact semantic rebaseline for E16 allowed depth while preserving unrelated Phase C exclusions; never delete/blanket-disable them. Prospective `pnpm exec playwright test <allocated E16 paths> --project=chromium` and final `pnpm run test:e2e` only after supported guarded application/browser invocation. No E15 E2E edit/reuse or arbitrary listener adoption.

Final required CI: empty DB→all migrations→synthetic seed→Auth/Storage readiness→full integration/RLS/H4 and browser partitions, exact ledger/seed/native counts/status checks at canonical candidate. Existing CI-native lifecycle is runner behavior, not local agent startup permission. Local migration application must use supported SQL-only path against verified owned E16 database; executor resolves exact tooling, not a guessed reset command.

## Isolated Local Resource Prerequisites — Proposal Only

Use existing project-local compose.test.yaml through guard ComposeUp, with distinct coordinator-allocated E16 project, named volumes and high127.0.0.1 API/DB/app ports. No numeric port/migration timestamp reservation here. Auth external API/site/callback origins and Next build-time URLs must match actual allocated endpoints;55421/55422/3100 defaults are not availability proof. Separate worktree .next, fixture Auth output, test results and guard-owned browser profile from E15.

Each executor uses its own latest trusted structured resourceGuardContext via Windows PowerShell5.1, never another actor's and never logged/on command line. Save lifecycle resourceId; accepted starting/unverified Compose is not readiness. Inspect composeOperation/owned readiness before migrations/tests; no blind uncertain retry. Never adopt E15/user resources or use hosted fallback/global network/Windows DB bind mounts/Docker or WSL system changes.

Only dedicated SUPABASE_TEST_* endpoints/keys and the existing local-target guard feed fixtures; public build endpoints must match the local stack. Privileged fixture credentials stay out of client/application payloads. Existing signing/Vault fixture pairs coherent; any new card-proof synthetic seed needs exact allocation and containment, not shared secret/domain shortcuts. Stop by lifecycle ID when finished, preserve volumes/files/profiles; stop_requested acknowledgment suffices, no deletion/prune/reset teardown/shutdown polling gate. This task launched nothing.

## Resource Estimates

| Priority | Planned effort range | Basis |
| --- | --- | --- |
| P0 |~62–98 hours |Real authority/proof/race/rollback, source regressions, fixtures and exact evidence. |
| P1 |~35–58 hours |Headless consumer/state, real sequential core journeys, phone retry and complete card/workspace. |
| P2 |~3–7 hours |Declared-volume/query baseline and threshold reconciliation. |
| P3 |No new budget |Optional exploratory polish; no mandatory AC moved here. |
| Total |~100–163 hours, roughly3–4.5 weeks equivalent |Test work embedded across sequential stories, including setup/evidence; not elapsed implementation promise. |

No per-test multiplication or guessed execution runtime is reported as measurement. Unallocated seams/fixtures and future concrete arithmetic/project fields affect effort, never justify dropping preserved contracts.

## Quality Gates and Exit Criteria

- P0/SEC:100% successful executed evidence. All high risks including score9 mitigated before owning-story/final closure; none is closed here.
- Generic P1 minimum95%, but every mandatory retained/transferred AC and core journey here requires100%. Optional residual P1 failure needs explicit triage/authorized dated waiver; none exists. P2/P3 informational target≥90% never converts UNKNOWN performance into PASS.
- Contract coverage100% of16.1 AC01–11,16.2 AC01–04 and TR01–16 destinations, including16.4 AC04–07 consumers. Changed-domain branch target≥80% if instrumented; no new coverage dependency allocated. Percentages never replace actual role/row/proof/rollback cases.
- No open consequential authorization/isolation/money/integrity/core user defect. Negative tests name actual caller/role/target and invariant; inspect downstream enforced guards and latest checked SQL/wrappers rather than older migration comments.
- Required DB suites SUPABASE_TEST_REQUIRED=1, discovery/expected vs executed/failed/skipped counts reconciled. Skip/todo/empty/conditional body/mock-only proof/caught failure is a gap. Required empty-schema chain, full integration/role/H4/exact-policy, production build/containment and real browser must pass at canonical candidate.
- Final evidence ledger pairs each TR destination with independent pinned-spec admission and actual report/readback.16.1 can exit on refined foundation boundary without later runtime prerequisites but cannot claim transferred UI/actions/consumers. Root/coordinator own E2 aggregate/state/clean-tree/integration and single final PR; this author changes none.
- Implementation/fix author writes one final Suggested Review Order using actual changed stops/evidence and refreshes after fixes; retain independent review/model/round-cap rules. This plan adds no placeholder review section or fabricated tests.
- Every in-scope NFR evidence source must be supplied for later nfr-assess. Numeric performance target stays UNKNOWN until accepted; this plan issues no final implementation/NFR PASS/CONCERNS/FAIL.

## Interworking and Regression

| Component | Required regression / integration boundary |
| --- | --- |
| Acceptance/frozen provenance |Latest real send/accept/source-of-truth/accepted-lock/evidence/tax-answer chain; entitled immutable money after mutable-source change, workers receive none. No new legacy evidence. |
| Standalone jobs |Original closed schemas/minimum inputs/nullable source locks/current actor-role/audit and checked SECURITY DEFINER ACLs. No retroactive enriched mandatory fields. |
| Booking engine/editor |Stable FK/parent coherence/replay authority/current facts/selective candidate logical groups/aggregate association/natural keys/precision/DST. Only exact allocated integration paths. |
| Matrix/nav/H4/RLS |Extend current shared machine authority/inventory/exact-policy metadata under allocation; route/direct reader/command agree. Current arrays/schema beat historical stale counts. |
| Shared files |Work-order owner enrollment/parent isolation, no UUID type confusion or broader index/Storage signing; retain other modules' locks. |
| E15 |Stable IDs and submitted-only unvalued time seam; no scheduling/time/calendar reader/E2E/CI edit or whole-epic prerequisite. Consumer seams are proposed, not directory allocations. |
| E17/E18 |Pass conditional child SQL test requirement forward when schema exists; do not introduce payment-plan/valuation/completion capability in E16. |

## Assumptions, Open Questions and Dependencies

Design confidence8/10, based on exact corrected pin, transfer matrix, governing architecture and inspected actual manifest/matrix/SQL/detector/test sources. No selectors/endpoints/schema code generated from guesses. Initial pin027CCEEA... at f610bcbd was read; coordinator correction11bf2721 and new B2528135... hash were read and verified before final output. Earlier independent review is not rewritten or claimed as approval of this plan/corrected pin.

1. Coordinator allocates exact shared booking SQL/facts/types/capacity/conflicts/attestation and fixture changes, migration timestamp range and local resources/ports before mutation. Shared fixture support cannot silently expand E15 scope.
2.16.2 reviewed operational commands/designation semantics,16.3 statuses/assignee/dependency consumers,16.4 named project-only disposition and duration/crew/travel arithmetic bind before respective story readiness. Tests preserve requirements without deciding new product policy.
3. Corrected scalar consumers require exact allocation of proposed BookingEntry.tsx, BookingEditor.tsx, booking-editor-input.ts, booking-action-state.ts and new headless jobs/scheduling-consumers.ts and checked job-scheduling-context.ts only if needed. This is not E15 view/reader/E2E or directory-wide ownership.
4. Owner-authorized draft priority/location/absolute windows/unknown-empty/headless signed card transaction still needs independent pinned-spec review. Relevant scalar consumer facts affecting authoritative output join canonical/current-fact revalidation; display-only/parser-only/stale acceptance fails.
5. Representative job/booking volume and numeric latency threshold UNKNOWN. Baseline declared inputs and resolve before a performance claim; no mandatory new load framework.
6. Guarded production/browser support needs admission without E15-owned runner/CI changes. If unavailable, report could-not-measure/browser gap; never next dev/hosted/mock-only acceptance.

No human question blocks this design. These are future execution gates, not an invented permission flow. Material new product uncertainty beyond accepted transfer/default authority is raised concisely by the owning planner before acting.

## Approval and Follow-on Workflows

DRAFT TEST DESIGN, awaiting independent/coordinator review. No approval or ready-for-development promotion. Prospective /bmad-testarch-atdd and /bmad-testarch-automate are separate invocations; neither launched. No external review schedule/message created. Root owns aggregate Quality & Testing Progress/state/git updates.

## Appendix: Workflow, Sources and Validation Limits

Installed skill C:/DEV/Kopplas/.agents/skills/bmad-testarch-test-design/SKILL.md; workflow customization resolved with empty prepend/append/persistent facts. Single epic-template output, one worker, no nested delegation. Supplied route tea_epic/tea-delegate/standard/gpt-6.1-sol/high/codex/subagents/subagent matches actual sensitive authorization/money/proof scope. Step checkpoint is epic-16/test-design-progress-epic-16.md, a coordinator-authorized ownership-preserving override of skill default; unrelated checkpoints untouched.

Knowledge applied: risk-governance/probability-impact/test-levels-framework/test-priorities-matrix/nfr-criteria and targeted library/Playwright/Pact mandates, fixture/data-factory/network-first/test-quality/evidence-integrity/confidence/selector guidance. Supabase skill security guidance informs planned ACL/RLS negatives; no database query/implementation/CLI lifecycle/external docs call. Historic system plans provide patterns, not fresh claims that their old deferred/role/oracle assumptions still apply.

Playwright-utils flag true but package absent: two-gate mandate does not authorize imports/dependency setup; existing fixtures/runner remain. A separate scoped framework workflow can consider adoption. Pact broker: unreachable (SmartBear MCP tools not available). Provider contracts/states are source-derived, no broker call/evidence; Pact relevance false, so no suite proposed. Browser exploration omitted under explicit design-only/no-runtime direction and no legacy browsing.

Checklist review checks all epic-applicable sections, scores/IDs/trace ownership/counts, correct paths, NFR UNKNOWN handling, truthful evidence and gates. System two-document/handoff sections are N/A. Approval/execution/environment-readiness checklist items remain explicitly future, not falsely checked. No browser sessions exist to clean. Only this plan and E16 checkpoint are written; no product/test-code/shared-planning/sprint/state/config/dependency/schema files, branch/commit/push/PR or resource lifecycle mutations.

