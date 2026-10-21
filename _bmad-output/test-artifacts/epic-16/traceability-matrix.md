---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-10-20'
workflowStatus: 'complete'
workflowType: 'testarch-trace'
coverageBasis: 'acceptance_criteria'
oracleResolutionMode: 'formal_requirements'
oracleConfidence: 'high'
externalPointerStatus: 'not_used'
gate_type: 'epic'
allow_gate: true
collection_mode: 'contract_static'
collectionStatus: 'COLLECTED'
sourceSha: '7b220c5e8fe71a81c00ded9e654e8c5c96c2b878'
evidenceRevision: '54ac91ec2c912afe3b6772fcb8daa11fb282d36a'
tempCoverageMatrixPath: 'C:/Users/Rasmus/AppData/Local/Temp/tea-trace-coverage-matrix-2026-10-20T20-48-01-061Z.json'
oracleSources:
  - _bmad-output/implementation-artifacts/spec-16-1-jobs-depth-activation-container-evolution-and-my-jobs.md
  - _bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md
  - _bmad-output/implementation-artifacts/spec-16-3-arbetsorder-2.md
  - _bmad-output/implementation-artifacts/spec-16-4-projekt-upgrade-and-job-card-semantics-2.md
  - _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md
---

# Epic16 Jobs Core — Traceability and Development Gate

**Decision: PASS.** Epic16 development coverage gate: P0 29/29 (100%), P1 7/7 (100%; target90%), overall 36/36 (100%; minimum80%). Formal high-confidence source-backed criteria, no uncovered requirement or live-only coverage. Current applicable nativeCI evidence includes two explicitly qualified full browser retry passes; this is not first-pass-clean, a waiver, release readiness or deployment/merge approval.

## Scope and formal requirements

The five exact approved DONE specs supply36developmentAC; all are preserved below. Priorities:29P0 and7P1; where a composite criterion contains sensitive auth/integrity behavior, use its highest applicable priority.16.1's explicit sevenP0/fourP1 labels remain unchanged. All16transfer obligations are checked against actual destination criteria, not counted twice in the denominator. No synthetic or external oracle, legacy URL, release approval, PhaseC surface, new test or source change is introduced. Current sourceSHA7b220c5e8fe71a81c00ded9e654e8c5c96c2b878; actual tested functional revision54ac91ec2c912afe3b6772fcb8daa11fb282d36a. Scope manifest, frozen intents, current roles, one-way upgrade and E15 boundaries remain unchanged.

## Coverage summary

| Priority | Total | FULL | Coverage |
| --- | ---: | ---: | ---: |
| P0 |29|29|100%|
| P1 |7|7|100%|
| P2 |0|0|N/A|
| P3 |0|0|N/A|
| Overall |36|36|100%|

No PARTIAL/NONE/UNIT-ONLY/INTEGRATION-ONLY criteria; critical/high coverage gaps0; no waiver. API-only legacy command criteria are FULL where the approved behavior is a command contract; UI requirements have appropriate actual journeys. Endpoint/checked-command, denied-auth, error-path and essential-UI heuristics show no uncovered development obligation. FULL means the selected approved development behavior has appropriate assertions and applicable execution, not exhaustive branch/line/browser coverage. NFR and test-quality workflows remain separately sequenced by root; risk_summary here counts trace coverage gaps only.

Inventory: 269 unique current static test anchors in52files:88unit,155API/RLS,26JobsE2E,0component/live/other. The428 requirement→test links deduplicate159reuses. Suite describe prefixes created nine aliases; normalized actual leaf titles remove them. All155API anchors matched passed current native cases; all26Jobs browser anchors matched actual native leaf cases/files; source line references valid. The required browser union is33executed cases including7auth, not35or269. Native global execution totals are separate below.

## Full criterion matrix

| Criterion | Priority | Coverage | Approved requirement | Mapping size |
| --- | --- | --- | --- | ---: |
| 16.1-AC01 | P0 | FULL | Given old jobs and both original creation callers, when additive migration/new creation run, then IDs/source refs/booking FKs/status stay valid, type defaults order and invalid kinds fail SQL; no project table/invented module. Unnamed project-only fields are explicitly transferred to 16.4 rather than counted complete. | 8 anchors |
| 16.1-AC02 | P0 | FULL | Given active actual memberships and booking assignments on both types, when real My Jobs and direct server/API reads run, then the duplicate-free relationship union is complete and excludes unrelated/foreign/inactive actors; tenant membership alone grants no job. | 6 anchors |
| 16.1-AC03 | P0 | FULL | Given every seeded role, multi-role and revoked/disabled actor, when menu, crafted direct URL, read RPC/table and commands run, then capability, row predicate and checked SQL agree; assigned read does not become ViewAll/elevation and protected values are absent throughout unentitled payloads. | 7 anchors |
| 16.1-AC04 | P1 | FULL | Given coherent identity/agreed scheduling inputs, when actual progressive form creates/edits/reloads, then bounded scalars/roles/windows/dependencies/audit persist atomically; malformed/foreign/inconsistent parents and unknown/source/actor/tenant smuggling fail generically without partial rows. Old minimum-input create still succeeds. | 7 anchors |
| 16.1-AC05 | P1 | FULL | Given a connected 360x640 user and transient save failure, when failure then explicit retry occur, then suitable input stays visibly unsent, retry stays reachable, saved state follows durable success and reload proves it. | 5 anchors |
| 16.1-AC06 | P0 | FULL | Given two distinct job-input sets plus an unbound booking, when actual booking preview/save evaluate all bookings, then every evaluated booking uses its own authoritative set, correct warnings persist atomically, missing stays unknown and empty roles/windows retain distinct semantics. | 5 anchors |
| 16.1-AC07 | P0 | FULL | Given signed detector/review snapshot, when job binding/roles/windows/relevant rows change before finalize, then current canonical facts/version reject stale/old/mismatched claims with no partial business/outcome/audit state and current warnings need renewed review; job-input writes cannot leave derived conflict rows silently stale. | 8 anchors |
| 16.1-AC08 | P1 | FULL | Given job dependencies with known violated planned-date order, when actual card/date changes reload, then deterministic linked-job warning appears; missing dates are unknown and no optimizer/guessed engine graph/work-order target is exposed. | 5 anchors |
| 16.1-AC09 | P0 | FULL | Given actual acceptance command, when fresh/replay/concurrent/faulted calls execute, then same result IDs, one-job uniqueness, frozen source linkage, events/evidence and atomic audit/rollback remain correct; direct source-ref mutation stays denied. | 9 anchors |
| 16.1-AC10 | P0 | FULL | Given original standalone inputs and pre-existing connected bookings, when create/update/enriched fields run, then nullable immutable sources, stable IDs/coherent optional parents and existing booking replay/selective-review/current-authority/DST contracts stay intact; no E15 time/calendar change. | 10 anchors |
| 16.1-AC11 | P1 | FULL | Given complete manifest/H4/exact-policy/role/security/Phase C gates, when inspecting final change, then all new tables/surfaces are jobs-enrolled with full negative metadata, no forbidden surface exists, and transfer rows remain open until destination evidence. | 24 anchors |
| 16.2-AC01 | P0 | FULL | Given either job kind and a manager with eligible same-tenant people, when they add, remove or reactivate members through the job workspace, then durable membership and one audit outcome agree on reload, identity is stable, and tenant roles are unchanged; failed writes retain an actionable draft without false success. | 5 anchors |
| 16.2-AC02 | P0 | FULL | Given current job members, when a manager selects, replaces or clears responsible Arbetsledare in Översikt, then reload shows exactly zero or one eligible designated person from `job_members`; clear retains ordinary membership and concurrent/stale replacement cannot silently overwrite current state. | 6 anchors |
| 16.2-AC03 | P0 | FULL | Given the same person is lead on A but not B, when they use crew/date UI actions and direct checked RPC calls, then only A permits ordinary crew and planned start/end mutations; designation, full-card, identity/CRM/PL, other planning fields and lifecycle mutations remain denied unless independently authorized. | 6 anchors |
| 16.2-AC04 | P0 | FULL | Given a designated person of each seeded tenant role and relevant multi-role combinations, when they open navigation, My Jobs and their job directly, then their current own job is reachable, foreign/unrelated jobs remain inaccessible and protected money is structurally absent unless their independent existing role grants it. Ordinary installer member/booking-assignee read behavior remains intact. | 5 anchors |
| 16.2-AC05 | P0 | FULL | Given active, inactive, foreign, archived and nonmember target variants, when any actor assigns or designates them or attempts direct table/helper writes, then same-tenant FK, eligibility, RLS and privilege rules agree; unsupported calls leave membership, roles and audit unchanged. | 5 anchors |
| 16.2-AC06 | P0 | FULL | Given a valid dates-only request, when an entitled actor saves it, then only the two planned-date fields change, existing range/nullable rules apply, reload proves persistence and existing job-card baseline comparison rejects stale pre-edit review. No booking-facts/proof version or booking-view contract is changed. | 3 anchors |
| 16.2-AC07 | P0 | FULL | Given membership removal, lead replacement, tenant revocation, role change or profile archival races while an operation waits, when execution or replay resumes, then current SQL facts decide authority and target eligibility, with no stale-authority mutation, duplicate audit or partial result; an injected audit failure rolls back business state. | 12 anchors |
| 16.2-AC08 | P1 | FULL | Given phone-sized connected web and an interrupted/failed save, when users manage members/designation or dates, then accessible controls preserve entered state, expose retry/refetch and announce success only after persistence; retries preserve identity and all established jobs navigation/create/search/detail behaviors remain usable. | 11 anchors |
| 16.3-AC01 | P0 | FULL | Given either job kind and an Admin/PL or current own-job lead, when they create/edit work orders through the actual list/cards/detail pane and reload, then title/description/own nullable dates and plural eligible assignees persist under the same parent with one attributable outcome; other-job leads, ordinary members/assignees, foreign/inactive targets and parent spoofing fail without writes or role changes. | 20 anchors |
| 16.3-AC02 | P0 | FULL | Given each lifecycle state and actor combination, when ordinary transitions and deliberate reopen are attempted via UI and checked SQL, then exactly the approved graph is enforced, only Admin/PL reopens and all parent job statuses/events/completion actions remain unchanged. Create/full-update/direct table/helper calls cannot bypass it. | 7 anchors |
| 16.3-AC03 | P0 | FULL | Given job→work-order, work-order→job and distinct same-parent/cross-parent work-order prerequisites, when selected references or actual endpoint dates are edited and the workspace reloads, then same-tenant/parent/read scope is enforced and prerequisite actual end>dependent actual start visibly warns; equality/earlier clears and missing/unreadable facts show unknown without hidden metadata. Work-order dates never borrow parent dates. Old card/dependency saves retain new rows; new saves retain old job-only rows. FK/schema alone does not satisfy this criterion. | 13 anchors |
| 16.3-AC04 | P0 | FULL | Given current versus revoked membership/lead/roles/profile/assignee/parent state while a mutation or replay waits, when it resumes, then locked current authority/eligibility and stale-state/request identity rules decide the outcome; no stale write, duplicate audit or partial assignment/dependency mutation occurs, and injected audit failure rolls everything back. Profileless independently authorized managers still succeed. | 23 anchors |
| 16.3-AC05 | P0 | FULL | Given independently entitled versus unentitled actors and work-order files, when actual upload/link/open/selected signed access/archive/restore/context navigation run, then the shared private file system and both child/parent source checks agree. Foreign/wrong-owner/archived-parent substitutions and lead-only file attempts fail; money/auth/private-person fields remain structurally absent unless independently entitled. | 22 anchors |
| 16.3-AC06 | P0 | FULL | Given current parent read permission across seeded/multi-role/designation variants, when work orders are listed/opened directly or through navigation, then only current authorized parent scope is returned; assignment alone adds no grant. Current16.1/16.2 create/search/list/MyJobs/detail/crew/date behavior, independent protected consumers and E15 booking v3/current-facts/replay contracts remain unchanged. | 37 anchors |
| 16.3-AC07 | P1 | FULL | Given connected360×640 use with delayed/stale/error/uncertain save responses, when users create/edit/assign/change status/dates/dependencies and retry/refetch, then semantic labels/focus/errors remain usable, entered state and consent baseline are retained, late responses cannot consume newer edits and success appears only after persistence. Essential real browser smoke proves usable create/edit/reload, lead versus reopen denial, dependency warning and own files; broad release matrices are tracked separately. | 12 anchors |
| 16.4-AC01 | P0 | FULL | Given a current authorized manager and an order, when actual confirmation invokes upgrade (including concurrent requests, response-loss replay and injected audit failure), then same-ID type transition, one event and one audit commit together or nothing does; existing status, source refs, bookings, members, work orders and files remain identical. | 10 anchors |
| 16.4-AC02 | P0 | FULL | Given every seeded/multi-role actor, current revocation and each alternate/direct SQL writer, when upgrade/downgrade/replay is attempted, then only independently authorized managers can upgrade, no caller can downgrade and authorized reverse attempts return JOB_TYPE_DOWNGRADE_FORBIDDEN; already-projekt is idempotent and confirmation is truthful, with no downgrade control. | 12 anchors |
| 16.4-AC03 | P0 | FULL | Given Order or Projekt, when the actual complete card is created/edited/read, then all existing §8.4 fields, responsible lead and actual WO dependencies are usable/persisted without duplicate storage or unnamed project-only data, and protected fields remain absent. Existing fields apply to both kinds; payment-plan data and its SQL projekt-only validity remain E17.2, not implemented here. | 10 anchors |
| 16.4-AC04 | P0 | FULL | Given a known estimate and a new job-connected booking without an explicit end, when the actual editor opens/previews/saves/reloads, then default length consumes the selected job estimate; edit/existing/explicit intervals remain unchanged and missing estimate preserves documented fallback without inventing a known estimate. | 12 anchors |
| 16.4-AC05 | P0 | FULL | Given known D/N/T and planned dates with an authorized eligible selected-person pool, when actual job-bound planning/capacity and booking preview/save run, then total demand is N×(D+T) person-minutes once/job, actual current-job allocation is credited once and residual demand compared with remaining capacity. Both sides use identical pool/window/inclusion rules. Actual per-assignee minutes are never crew-multiplied again; split/repeated bookings contribute actual occupancy only. Missing inputs stay unknown, T=0 is known and shortfall is advisory without another debit/override/hard block. Golden and real consumer readback prove the numeric cases below. | 25 anchors |
| 16.4-AC06 | P0 | FULL | Given distinct earliest/desired/latest dates across mixed jobs, when actual suggestions/editor preview/save or relevant facts change while a proof waits, then earliest bounds suggestions, desired miss is a soft warning, latest miss is a distinct breach and obsolete/other-job facts cannot commit; no automatic optimizer or new hard rejection is introduced. | 27 anchors |
| 16.4-AC07 | P0 | FULL | Given selected-job presence true, false or unavailable, when actual job entry and selection/change render the editor, then the current checked selected job's requirement is visible with the correct distinction; another job's/caller's value cannot bleed through. Essential connected360×640 browser tests prove changed flows, failures/retry/refetch and server-confirmed persistence. | 13 anchors |
| 16.5-AC01 | P0 | FULL | Given a currently authorized actor and an Order or Projekt, when entering through its existing title/list/create link or refreshing its stable URL, then one workspace retains the same job ID and shows the persistent required header with real authorized labels/assignment states and dates, plus usable overview/card/member/source/upgrade actions according to existing rights. A nonmember responsible PL has an explicit assigned/name unavailable fallback unless an existing independently entitled projection supplies a label. Unauthorized money/budget/supplier fields are absent from server DTOs and serialized UI payloads; manager-versus-lead rights and global AppShell remain unchanged. | 10 anchors |
| 16.5-AC02 | P0 | FULL | Given the actor's current capabilities and active manifest modules, when selecting any of Översikt, Arbetsorder, Schema, Filer or Händelser or addressing its URL/reader directly, then only independently authorized current-job content/actions are served. Schema contains actual job bookings and mini-timeline with manager-only preconnected create/edit and read-only authorized worker subsets; Filer retains shared job ownership; events show real ordered safe labels/timestamps without raw metadata. Foreign/revoked/unauthorized root or child access exposes no protected data or stale write. No pending/future tab, broad audit/directory read, new grant or lifecycle completion action is introduced. | 17 anchors |
| 16.5-AC03 | P1 | FULL | Given the authorized workspace at desktop and 360×640, including an existing workOrder document-return link or unsaved/pending form, when navigating priority bottom tabs/Mer, keyboard controls, back/refresh and error/retry paths, then selection/focus/job identity remain coherent, unknown or unavailable tabs safely resolve to overview, entered drafts survive or receive explicit leave protection, and honest loading/empty/error states remain distinguishable. All existing overview, work-order, booking, file and upgrade journeys remain usable and only confirmed persistence reports success. | 11 anchors |

## Transfer ledger reconciliation

| Transfer | Current destination(s) | Coverage |
| --- | --- | --- |
| TR01 | 16.1-AC01 | FULL |
| TR02 | 16.1-AC02, 16.1-AC03 | FULL |
| TR03 | 16.2-AC01, 16.2-AC05, 16.2-AC07, 16.2-AC08 | FULL |
| TR04 | 16.2-AC02, 16.2-AC05, 16.2-AC07 | FULL |
| TR05 | 16.2-AC03, 16.2-AC04, 16.2-AC06, 16.2-AC07 | FULL |
| TR06 | 16.1-AC08, 16.3-AC03, 16.3-AC04 | FULL |
| TR07 | 16.1-AC06, 16.1-AC07, 16.4-AC06 | FULL |
| TR08 | 16.4-AC03 | FULL |
| TR09 | 16.1-AC04, 16.4-AC03 | FULL |
| TR10 | 16.4-AC01, 16.4-AC02 | FULL |
| TR11 | 16.1-AC09, 16.1-AC10, 16.2-AC08, 16.3-AC06 | FULL |
| TR12 | 16.5-AC01, 16.5-AC02, 16.5-AC03 | FULL |
| TR13 | 16.4-AC04 | FULL |
| TR14 | 16.4-AC05 | FULL |
| TR15 | 16.4-AC06 | FULL |
| TR16 | 16.4-AC07 | FULL |

TR06 includes real typed work-order endpoint dates, warnings, unknown/equality/retention/CAS, not only an FK or parent-date proxy; no transitive cycle policy is invented. TR08 owner disposition is no unnamed new project-only fields; existing fields apply to both kinds and payment plans remainE17.2. TR13–16 require actual default-duration, approvedN×(D+T)residual/capacity, earliest/desired/latest and selected-job customer-presence consumers. Storage/form-only16.1 evidence is not credited for those destinations. All16rows are FULL at their destinations; original planning ledger remains historical and unedited.

## Current executed evidence and applicability

Reused exact CI39490485088 terminalSUCCESS on54ac91ec2c912afe3b6772fcb8daa11fb282d36a:2740units/100suites allpassed0skip plus43process checks(2+26+10+5), required static/build/audit/frozen-lock/source+bundle containment. FullDB1880total1879pass0fail1ordinary physical-recovery pending with SUPABASE_TEST_REQUIRED=1; separate isolated recovery1/1pass0skip. The pending ordinary case is not renamed passed. Actual pilot5warmup/25measured, readp95=7.985169000000042ms and bulk-effective-permissionsp95=2.968015999999807ms; not production-throughput evidence.

Browser native:31expected,2flaky,0unexpected,0skipped;33complete passes=31first-attempt+2fullretry. All5workspacefirstattempt. Retained16.1-E03 first failed Chromium response-body retrieval; precise cause remainsunknown. Retained16.3-E01 first observed audit0 afterHTTP200 before confirmed-save; action outcome/timing unresolved and purely observational cause notproven. Full retries executed complete original assertions and passed. Independent High qualification at Temp/kopplas-e16-16-5-review-dgnle5ul/seventh-retry-independent-qualification.md SHA F7731A4CEB1F4D01B01594DACB1059EE26BA0377DF2523E8ED01377EB6F1425D identifies no concrete production audit bypass, accepts the qualified gate and explicitly says not a waiver. Preserve failed attempts and all six historical failed CI runs; never claim zero flakiness/allfirstpasses.

Read-only git diff54ac→current acrosssrc/tests/deps/config/CI/scripts/SQL is empty. All25terminal nonmetadata inventory hashes match. Native hashes, parsed actual counts and current source applicability are independently checked in this trace. Historical story1–4 records below retain their own earlier evidence revisions; current global CI qualifies changed consumer seams. No earlier story record is relabelled as a current-head execution.

| Native evidence | Exact path | SHA256 |
| --- | --- | --- |
| integration | `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json` | `028e6dc91a52dc12ccb73b7a1ebd20fe71a1c436f2740671ee736ea35ef46d6e` |
| browser | `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-browser-native/general-browser.json` | `c08263b31221e0bb82649df83bf7e7b98b85dd2a6ff6aaaf5f5844790094e1f0` |
| recovery | `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-recovery-native/isolated-storage-recovery.json` | `c2d82e2c9dc1ef156656c14cd079a129042a0c375ee881fbe99a62b7c31e4a78` |
| verify | `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log` | `24fba4f37aea028dd760fe599b724701db31b57c3fe9dbd6db276a6e6312a004` |
| db | `C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-db.log` | `99a4e7e12fe4f300ce744861ebecaf599ede547a4ff75a6185af6fb2661048cd` |

Temp means C:/Users/Rasmus/AppData/Local/Temp. No tests, collection, static/build command, CI or runtime was newly executed by this workflow. Newly performed operations were skill resolution, bounded requirement/test/source reads, native JSON/log/hash inspection, empty applicability diff, worker JSON/schema/anchor checks and deterministic artifact generation. No new source review round, resource/browser/service/provider action or deployment.

## Live Verification Results

```json
{
  "liveManifestHeader": {
    "present": false,
    "results_file": "",
    "source_sha": "",
    "observed_at": "",
    "producer": "",
    "read_error": "",
    "current_source_sha": "7b220c5e8fe71a81c00ded9e654e8c5c96c2b878"
  },
  "liveRecords": []
}
```

Collection is contract_static/COLLECTED with rerunnable source-backed tests and existing native results. Optional scoped live manifest is absent; no synthetic record was written. Requirements covered only by live evidence0; no stale/unmatched/contradicted live record is counted. This avoids treating a test report as a fresh ad-hoc runtime-manifest observation.

## Detailed current test mappings

### 16.1-AC01 — FULL

Current old minimum create and authentic acceptance fixtures retain Order default, immutable source tuple, status and connected booking IDs; invalid kind is rejected at SQL. Native clean migration/reset and manifest inventory support additive evolution. Unnamed project-only disposition remains 16.4-AC03.

- `16.1-INT-002` — `tests/integration/commands/jobs-depth.int.test.ts:76` (api); [P0] 16.1-INT-002 unchanged old minimum create and acceptance source tuples survive enriched evolution
- `16.1-INT-001` — `tests/integration/commands/jobs-depth.int.test.ts:9` (api); [P0] 16.1-INT-001 enriched create and response-loss replay retain one standalone identity/event/audit
- `[P0] happy path: the job persists (status 'created', NULL source refs, resolved tenant) + ONE job_events 'created' row at the injected clock + EXACTLY ONE job.created audit row` — `tests/integration/commands/create-job.int.test.ts:162` (api); [P0] happy path: the job persists (status 'created', NULL source refs, resolved tenant) + ONE job_events 'created' row at the injected clock + EXACTLY ONE job.created audit row
- `[P1] a customer-only create is enough (title/dates optional — born NULL)` — `tests/integration/commands/create-job.int.test.ts:216` (api); [P1] a customer-only create is enough (title/dates optional — born NULL)
- `[P0] 7.2-INT-01: happy path — records the acceptance, flips `sent → accepted`, creates the minimal job with immutable source refs, writes a `quote_events` accepted + a `job_events` created + ONE audit row, all committed together` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:173` (api); [P0] 7.2-INT-01: happy path — records the acceptance, flips `sent → accepted`, creates the minimal job with immutable source refs, writes a `quote_events` accepted + a `job_events` created + ONE audit row, all committed together
- `[P0] the public policy set is EXACTLY the expected per-table enumeration` — `tests/integration/rls/migration-reset.int.test.ts:241` (api); [P0] the public policy set is EXACTLY the expected per-table enumeration
- `10.1-UNIT-COH-00 (AC4 positive): the REAL manifest is coherent (validator returns zero violations)` — `tests/unit/scope/manifest-coherence.test.ts:91` (unit); 10.1-UNIT-COH-00 (AC4 positive): the REAL manifest is coherent (validator returns zero violations)
- `14.2-UNIT-DERIVE-05: TENANT_TABLES derives as the union of active modules' tenantTables == the pinned 54` — `tests/unit/scope/manifest-derivations.test.ts:159` (unit); 14.2-UNIT-DERIVE-05: TENANT_TABLES derives as the union of active modules' tenantTables == the pinned 54

### 16.1-AC02 — FULL

Real RLS and UI assert the exact member-order OR assignee-Projekt set, accepted membership, both relationship only once, no unrelated/foreign rows, with current relationship revocation. Tenant membership alone grants no personal job.

- `16.1-RLS-001` — `tests/integration/rls/jobs-depth.rls.test.ts:7` (api); [P0] 16.1-RLS-001 real roles, UNION rows, inactive actors and own-job child scope agree
- `[P0] 16.2 lead read predicate preserves installer member/assignee union and scopes inherited child policies` — `tests/integration/rls/jobs-depth.rls.test.ts:110` (api); [P0] 16.2 lead read predicate preserves installer member/assignee union and scopes inherited child policies
- `[P1] assigned capability needs a current relationship and never reveals unassigned or foreign jobs` — `tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts:274` (api); [P1] assigned capability needs a current relationship and never reveals unassigned or foreign jobs
- `16.2-RLS-001` — `tests/integration/rls/job-members.rls.test.ts:9` (api); [P0] 16.2-RLS-001 every seeded lead role and independent role union receives own-job scope with structural money/privacy boundaries
- `16.1-E01` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:122` (e2e); [P0] 16.1-E01 My Jobs is the actual duplicate-free member/assignee union; direct denial and money-safe assigned detail agree
- `16.1-U02` — `tests/unit/server/read-models/my-jobs.test.ts:14` (unit); 16.1-U02 failed read stays distinct from a confirmed empty personal list

### 16.1-AC03 — FULL

Current seeded-role and role-union read/command policy agrees with actual direct URLs and RLS; assigned-only users cannot mutate or elevate. Projection unit and actual accepted-price detail/SSR payload checks prove protected keys structurally absent, with independently entitled positive controls.

- `16.1-RLS-001` — `tests/integration/rls/jobs-depth.rls.test.ts:7` (api); [P0] 16.1-RLS-001 real roles, UNION rows, inactive actors and own-job child scope agree
- `16.1-RLS-002` — `tests/integration/rls/jobs-depth.rls.test.ts:45` (api); [P0] 16.1-RLS-002 direct mutation/elevation, foreign child FKs and spoofed checked actor leave no state
- `16.2-RLS-001` — `tests/integration/rls/job-members.rls.test.ts:9` (api); [P0] 16.2-RLS-001 every seeded lead role and independent role union receives own-job scope with structural money/privacy boundaries
- `[P0] policy catalog, real role navigation, and RLS reads agree for every seeded role × active module` — `tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts:145` (api); [P0] policy catalog, real role navigation, and RLS reads agree for every seeded role × active module
- `16.1-U02` — `tests/unit/server/read-models/my-jobs.test.ts:4` (unit); 16.1-U02 personal projection strips unexpected storage and protected keys
- `16.1-E01` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:122` (e2e); [P0] 16.1-E01 My Jobs is the actual duplicate-free member/assignee union; direct denial and money-safe assigned detail agree
- `16.2-E03` — `tests/e2e/jobs/job-members.e2e.spec.ts:275` (e2e); [P0] 16.2-E03 designated Sales user reaches own My Jobs/detail without money or unrelated reads, then loses access when removed

### 16.1-AC04 — FULL

Actual commands persist exact scalar/role/window/dependency replacement and correlated audit while preserving source/bookings. Closed domain and SQL reject malformed/current-parent/foreign/smuggled values atomically. Browser E02 proves actual progressive form readback and a second durable same-form edit.

- `closed core rejects unknown/source/actor/tenant/money keys` — `tests/unit/features/jobs/job-card-validation.test.ts:47` (unit); closed core rejects unknown/source/actor/tenant/money keys
- `16.1-U01` — `tests/unit/server/commands/job-card-validation.test.ts:9` (unit); 16.1-U01 enriched input rejects identity, money, tenant and malformed children without coercion
- `16.1-U07` — `tests/unit/server/commands/job-card-validation.test.ts:19` (unit); 16.1-U07 unknown and recorded-empty are distinct normalized values
- `16.1-INT-001` — `tests/integration/commands/jobs-depth.int.test.ts:26` (api); [P1] 16.1-INT-001 enriched card persists closed scalars and exact child replacement without changing source or booking IDs
- `16.1-INT-002` — `tests/integration/commands/jobs-depth.int.test.ts:55` (api); [P0] 16.1-INT-002 SQL current-parent checks and malformed/smuggled children roll back all business, outcomes and audit
- `16.1-INT-002` — `tests/integration/commands/jobs-depth.int.test.ts:76` (api); [P0] 16.1-INT-002 unchanged old minimum create and acceptance source tuples survive enriched evolution
- `16.1-E02` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:171` (e2e); [P1] 16.1-E02 phone progressive identity, scheduling and child save retains unsent input after failure; explicit retry persists across reload

### 16.1-AC05 — FULL

Connected360x640 browser E02 aborts the actual identified Server Action before writes, retains visible unsent scalars/children, reaches explicit retry, reuses exact uncertain input and reloads durable saved values. State tests protect newer edits and identity from late completion.

- `matching confirmed completion alone marks the current revision persisted` — `tests/unit/features/jobs/job-card-validation.test.ts:82` (unit); matching confirmed completion alone marks the current revision persisted
- `newer edits survive old failure, retry and success without rebinding payload or IDs` — `tests/unit/features/jobs/job-card-validation.test.ts:100` (unit); newer edits survive old failure, retry and success without rebinding payload or IDs
- `wrong candidate, command, or revision cannot complete a submission` — `tests/unit/features/jobs/job-card-validation.test.ts:128` (unit); wrong candidate, command, or revision cannot complete a submission
- `invalid input is retained unsent and immutable transitions never mutate earlier states` — `tests/unit/features/jobs/job-card-validation.test.ts:137` (unit); invalid input is retained unsent and immutable transitions never mutate earlier states
- `16.1-E02` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:171` (e2e); [P1] 16.1-E02 phone progressive identity, scheduling and child save retains unsent input after failure; explicit retry persists across reload

### 16.1-AC06 — FULL

Actual parser/sole detector and SQL snapshot use each evaluated booking binding across disjoint A/B/unbound cases; unknown, known-empty roles and restrictive empty windows differ. Checked save persists exact appropriate warnings. E03 complete retry proves real booking preview/save/reload, qualified by retained first-attempt body failure.

- `16.1-U03` — `tests/unit/server/bookings/job-facts.test.ts:56` (unit); [P0][16.1-U03] checked snapshot parser accepts and freezes complete own-job authoritative facts
- `16.1-U04` — `tests/unit/server/bookings/job-facts.test.ts:73` (unit); [P0][16.1-U04] mixed jobs and unbound bookings use each evaluated booking's facts without candidate bleed
- `16.1-U05` — `tests/unit/server/bookings/job-facts.test.ts:95` (unit); [P0][16.1-U05] unavailable facts stay distinct from known-empty roles and restrictive empty windows
- `16.1-INT-003` — `tests/integration/commands/job-booking-facts.int.test.ts:49` (api); [P0] 16.1-INT-003 mixed jobs and unbound booking consume their own SQL roles/windows, unknown differs from recorded-empty
- `16.1-E03` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:289` (e2e); [P0] 16.1-E03 actual job-bound booking preview/save consumes requirements and windows; changed job facts invalidate review before durable save

### 16.1-AC07 — FULL

Genuine signatures reach checked finalizers: wrong domain/actor/old engine/signature deny; inserted/deleted children and rebound booking facts invalidate prior digests without writes. Observed tenant-gate waits recheck changed children/current authority. Audit fault rolls back exact children/conflicts/outcome/audit, successful refresh matches sole detector. E03 complete retry renews consent after stale review.

- `16.1-U09` — `tests/unit/server/commands/job-card-validation.test.ts:28` (unit); 16.1-U09 job-card signatures cannot be used as booking output signatures
- `16.1-U09` — `tests/unit/server/bookings/job-facts.test.ts:115` (unit); [P0][16.1-U09] old engine and content insertion deletion or job rebinding cannot reuse canonical claims
- `16.1-INT-005` — `tests/integration/commands/job-booking-facts.int.test.ts:4` (api); [P0] 16.1-INT-005 card protocol rejects correctly signed cross-domain and mismatched actor/version claims atomically
- `16.1-INT-005` — `tests/integration/commands/job-booking-facts.int.test.ts:29` (api); [P0] 16.1-INT-005 job-child change committed during the tenant-gate wait makes the prior real card proof stale
- `16.1-INT-004` — `tests/integration/commands/job-booking-facts.int.test.ts:81` (api); [P0] 16.1-INT-004 child insertion/deletion and job rebinding change canonical digest and reject genuine prior booking proof without writes
- `16.1-INT-005` — `tests/integration/commands/job-booking-facts.int.test.ts:133` (api); [P0] 16.1-INT-005 card snapshot/finalize uses real signed sole-engine refresh; audit failure rolls back children/conflicts/outcomes/audit exactly
- `16.1-INT-005` — `tests/integration/commands/job-booking-facts.int.test.ts:166` (api); [P0] 16.1-INT-005 finalization rechecks real current authority after explicit two-session tenant-gate wait
- `16.1-E03` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:289` (e2e); [P0] 16.1-E03 actual job-bound booking preview/save consumes requirements and windows; changed job facts invalidate review before durable save

### 16.1-AC08 — FULL

Pure supplied-link date evaluation distinguishes known order and explicit missing-date unknown without engine graph inference. Browser E04 edits actual card dates/dependency, reloads linked warning, then clears only after durable correction; command suite persists exact dependency rows.

- `repeated evaluation preserves frozen inputs and link identity` — `tests/unit/features/jobs/dependency-warnings.test.ts:48` (unit); repeated evaluation preserves frozen inputs and link identity
- `unknown results do not share mutable missing-date state` — `tests/unit/features/jobs/dependency-warnings.test.ts:66` (unit); unknown results do not share mutable missing-date state
- `16.1-INT-001` — `tests/integration/commands/jobs-depth.int.test.ts:26` (api); [P1] 16.1-INT-001 enriched card persists closed scalars and exact child replacement without changing source or booking IDs
- `16.1-INT-002` — `tests/integration/commands/jobs-depth.int.test.ts:55` (api); [P0] 16.1-INT-002 SQL current-parent checks and malformed/smuggled children roll back all business, outcomes and audit
- `16.1-E04` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:363` (e2e); [P1] 16.1-E04 dependency dates display unknown, a linked violated-order warning, then clear only after a durable date correction

### 16.1-AC09 — FULL

Retained actual acceptQuoteAndCreateJob tests execute real sent/accepted commands, stable fresh/replay IDs, DB one-job uniqueness, parallel accept winner, source/evidence freeze and exact events/audit. Injected job/event transaction faults roll back; enriched evolution cannot mutate accepted source tuples.

- `[P0] 7.2-INT-01: happy path — records the acceptance, flips `sent → accepted`, creates the minimal job with immutable source refs, writes a `quote_events` accepted + a `job_events` created + ONE audit row, all committed together` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:173` (api); [P0] 7.2-INT-01: happy path — records the acceptance, flips `sent → accepted`, creates the minimal job with immutable source refs, writes a `quote_events` accepted + a `job_events` created + ONE audit row, all committed together
- `[P0] 7.2-INT-02: a second identical call returns the SAME (acceptance_id, job_id) and creates NO second acceptance/job/lifecycle-transition/event/audit` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:247` (api); [P0] 7.2-INT-02: a second identical call returns the SAME (acceptance_id, job_id) and creates NO second acceptance/job/lifecycle-transition/event/audit
- `[P0] 7.2-INT-03: a DIRECT second `jobs` INSERT for the same acceptance violates `unique (quote_acceptance_id)` — one job per acceptance` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:327` (api); [P0] 7.2-INT-03: a DIRECT second `jobs` INSERT for the same acceptance violates `unique (quote_acceptance_id)` — one job per acceptance
- `[P0] 7.2-INT-06: two PARALLEL Promise.all accepts of the same sent version ⇒ exactly ONE job; the other idempotent-returns or fails COMMAND_CONFLICT/ACCEPTANCE_ALREADY_RECORDED; NEVER two jobs (sleep-free)` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:464` (api); [P0] 7.2-INT-06: two PARALLEL Promise.all accepts of the same sent version ⇒ exactly ONE job; the other idempotent-returns or fails COMMAND_CONFLICT/ACCEPTANCE_ALREADY_RECORDED; NEVER two jobs (sleep-free)
- `[P0] 7.2-INT-04: an injected mid-transaction failure at the JOB-insert boundary leaves NO acceptance, NO lifecycle change, NO job, NO event — behavioral rollback proof` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:356` (api); [P0] 7.2-INT-04: an injected mid-transaction failure at the JOB-insert boundary leaves NO acceptance, NO lifecycle change, NO job, NO event — behavioral rollback proof
- `[P0] 7.2-INT-04: a fault at the EVENT-write boundary also rolls the whole transaction back (no orphaned acceptance/job)` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:376` (api); [P0] 7.2-INT-04: a fault at the EVENT-write boundary also rolls the whole transaction back (no orphaned acceptance/job)
- `[P1] 7.2-INT-07: on success every expected row is present (acceptance, job, quote `accepted` event, job `created` event, ONE audit); a retry adds NO duplicate of any of them` — `tests/integration/commands/accept-quote-and-create-job.int.test.ts:501` (api); [P1] 7.2-INT-07: on success every expected row is present (acceptance, job, quote `accepted` event, job `created` event, ONE audit); a retry adds NO duplicate of any of them
- `[P1] 7.3-INT-01: renaming the LIVE customer after job creation leaves the FROZEN commitment name + accepted price UNCHANGED (the source-of-truth invariant)` — `tests/integration/commands/job-source-of-truth.int.test.ts:172` (api); [P1] 7.3-INT-01: renaming the LIVE customer after job creation leaves the FROZEN commitment name + accepted price UNCHANGED (the source-of-truth invariant)
- `16.1-INT-002` — `tests/integration/commands/jobs-depth.int.test.ts:76` (api); [P0] 16.1-INT-002 unchanged old minimum create and acceptance source tuples survive enriched evolution

### 16.1-AC10 — FULL

Original standalone command/minimum input and original update remain active, nullable sources retained and accepted source tuples immutable. Current native same-source booking replay/current-authority and selective-review tests plus DST goldens retain connected-booking identities and time behavior; this creates no whole-E15 prerequisite.

- `[P0] happy path: the job persists (status 'created', NULL source refs, resolved tenant) + ONE job_events 'created' row at the injected clock + EXACTLY ONE job.created audit row` — `tests/integration/commands/create-job.int.test.ts:162` (api); [P0] happy path: the job persists (status 'created', NULL source refs, resolved tenant) + ONE job_events 'created' row at the injected clock + EXACTLY ONE job.created audit row
- `[P1] a customer-only create is enough (title/dates optional — born NULL)` — `tests/integration/commands/create-job.int.test.ts:216` (api); [P1] a customer-only create is enough (title/dates optional — born NULL)
- `[P1] 7.3-INT-02: a title-only edit persists and writes EXACTLY ONE audit row with { targetId } on the target_id column + empty metadata (no status change ⇒ NO job_events row)` — `tests/integration/commands/update-job.int.test.ts:235` (api); [P1] 7.3-INT-02: a title-only edit persists and writes EXACTLY ONE audit row with { targetId } on the target_id column + empty metadata (no status change ⇒ NO job_events row)
- `16.1-INT-002` — `tests/integration/commands/jobs-depth.int.test.ts:76` (api); [P0] 16.1-INT-002 unchanged old minimum create and acceptance source tuples survive enriched evolution
- `16.1-INT-001` — `tests/integration/commands/jobs-depth.int.test.ts:26` (api); [P1] 16.1-INT-001 enriched card persists closed scalars and exact child replacement without changing source or booking IDs
- `[P0] 14.4 preserves explicitly absent-review legacy create/update outcomes without borrowing them for override` — `tests/integration/commands/bookings-replay-authority.int.test.ts:24` (api); [P0] 14.4 preserves explicitly absent-review legacy create/update outcomes without borrowing them for override
- `[P1] 14.2-INT-003 UPDATE replay rejects stale caller after 'role downgraded and secondary roles r…'` — `tests/integration/commands/bookings-replay-authority.int.test.ts:63` (api); [P1] 14.2-INT-003 UPDATE replay rejects stale caller after 'role downgraded and secondary roles r…'
- `[P0] 14.4-INT-005 unchanged accepted identity survives description edit and empty selection` — `tests/integration/commands/booking-editor.int.test.ts:387` (api); [P0] 14.4-INT-005 unchanged accepted identity survives description edit and empty selection
- `[P1] 14.3-UNIT-009 spring gap uses first valid instant across all-day/multi-day` — `tests/unit/features/scheduling/dst.golden.test.ts:11` (unit); [P1] 14.3-UNIT-009 spring gap uses first valid instant across all-day/multi-day
- `[P1] 14.3-UNIT-010 fall fold uses earlier instant and retains exact microseconds` — `tests/unit/features/scheduling/dst.golden.test.ts:30` (unit); [P1] 14.3-UNIT-010 fall fold uses earlier instant and retains exact microseconds

### 16.1-AC11 — FULL

Real manifest/coherence/derived tenant-table and non-scope tests, exact database policy enumeration, checked/private ACLs, forced RLS and concrete per-new-table H4 negative cases establish jobs enrollment and fail-loud metadata. Transfer accounting preserves allTR01-16 destinations; this row does not close later-story consumers.

- `10.1-UNIT-COH-00 (AC4 positive): the REAL manifest is coherent (validator returns zero violations)` — `tests/unit/scope/manifest-coherence.test.ts:91` (unit); 10.1-UNIT-COH-00 (AC4 positive): the REAL manifest is coherent (validator returns zero violations)
- `14.2-UNIT-DERIVE-05: TENANT_TABLES derives as the union of active modules' tenantTables == the pinned 54` — `tests/unit/scope/manifest-derivations.test.ts:159` (unit); 14.2-UNIT-DERIVE-05: TENANT_TABLES derives as the union of active modules' tenantTables == the pinned 54
- `10.1-UNIT-DERIVE-06 (AC3 fail-loud): a surface NOT listed in the manifest is not silently admitted by the derivation` — `tests/unit/scope/manifest-derivations.test.ts:176` (unit); 10.1-UNIT-DERIVE-06 (AC3 fail-loud): a surface NOT listed in the manifest is not silently admitted by the derivation
- `7.3-E2E-03: NO deferred-scope surface token appears in the job feature/command/component dirs` — `tests/unit/guardrails/job-non-scope.test.ts:116` (unit); 7.3-E2E-03: NO deferred-scope surface token appears in the job feature/command/component dirs
- `[P0] the public policy set is EXACTLY the expected per-table enumeration` — `tests/integration/rls/migration-reset.int.test.ts:241` (api); [P0] the public policy set is EXACTLY the expected per-table enumeration
- `16.1-RLS-002` — `tests/integration/rls/jobs-depth.rls.test.ts:74` (api); [P0] 16.1-RLS-002 checked entrypoints are hardened and all private job-card primitives refuse authenticated execution
- `[P0] 16.2 migration inventory retains SELECT-only members and exact checked/private ACLs` — `tests/integration/rls/migration-reset.int.test.ts:677` (api); [P0] 16.2 migration inventory retains SELECT-only members and exact checked/private ACLs
- `[P0] policy catalog, real role navigation, and RLS reads agree for every seeded role × active module` — `tests/integration/rls/role-aware-phase-a-surface.atdd.int.test.ts:145` (api); [P0] policy catalog, real role navigation, and RLS reads agree for every seeded role × active module
- `[P0] SELECT: Tenant A admin reads ZERO job_members rows belonging to Tenant B (no error leak)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:535` (api); [P0] SELECT: Tenant A admin reads ZERO job_members rows belonging to Tenant B (no error leak)
- `[P0] INSERT: Tenant A admin cannot INSERT a job_members row carrying Tenant B ownership (no spoof)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:549` (api); [P0] INSERT: Tenant A admin cannot INSERT a job_members row carrying Tenant B ownership (no spoof)
- `[P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_members rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:561` (api); [P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_members rows
- `[P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_members rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:708` (api); [P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_members rows
- `[P0] SELECT: Tenant A admin reads ZERO job_required_work_roles rows belonging to Tenant B (no error leak)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:535` (api); [P0] SELECT: Tenant A admin reads ZERO job_required_work_roles rows belonging to Tenant B (no error leak)
- `[P0] INSERT: Tenant A admin cannot INSERT a job_required_work_roles row carrying Tenant B ownership (no spoof)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:549` (api); [P0] INSERT: Tenant A admin cannot INSERT a job_required_work_roles row carrying Tenant B ownership (no spoof)
- `[P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_required_work_roles rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:561` (api); [P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_required_work_roles rows
- `[P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_required_work_roles rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:708` (api); [P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_required_work_roles rows
- `[P0] SELECT: Tenant A admin reads ZERO job_access_windows rows belonging to Tenant B (no error leak)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:535` (api); [P0] SELECT: Tenant A admin reads ZERO job_access_windows rows belonging to Tenant B (no error leak)
- `[P0] INSERT: Tenant A admin cannot INSERT a job_access_windows row carrying Tenant B ownership (no spoof)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:549` (api); [P0] INSERT: Tenant A admin cannot INSERT a job_access_windows row carrying Tenant B ownership (no spoof)
- `[P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_access_windows rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:561` (api); [P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_access_windows rows
- `[P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_access_windows rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:708` (api); [P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_access_windows rows
- `[P0] SELECT: Tenant A admin reads ZERO job_dependencies rows belonging to Tenant B (no error leak)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:535` (api); [P0] SELECT: Tenant A admin reads ZERO job_dependencies rows belonging to Tenant B (no error leak)
- `[P0] INSERT: Tenant A admin cannot INSERT a job_dependencies row carrying Tenant B ownership (no spoof)` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:549` (api); [P0] INSERT: Tenant A admin cannot INSERT a job_dependencies row carrying Tenant B ownership (no spoof)
- `[P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_dependencies rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:561` (api); [P0] UPDATE: Tenant A admin cannot UPDATE Tenant B's job_dependencies rows
- `[P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_dependencies rows` — `tests/integration/rls/cross-tenant-isolation.rls.test.ts:708` (api); [P0] DELETE: Tenant A admin cannot DELETE Tenant B's job_dependencies rows

### 16.2-AC01 — FULL

Checked assign/remove/reactivate tests cover Order and Projekt, one stable membership ID, one correlated audit per mutation, unchanged tenant roles/bookings and real readback. Profileless independently authorized Admin/PL retain all four commands. E01 reload and E04 current visible target supplement core state recovery.

- `16.2-INT-001` — `tests/integration/commands/job-members.int.test.ts:9` (api); [P0] 16.2-INT-001 both job kinds archive/reactivate the same relationship without changing tenant roles
- `16.2-INT-007` — `tests/integration/commands/job-members.int.test.ts:264` (api); [P0] 16.2-INT-007 active Admin and PL without optional resource profiles retain all four manager operations
- `16.2-E01` — `tests/e2e/jobs/job-members.e2e.spec.ts:95` (e2e); [P0] 16.2-E01 manager archives/reactivates the same project member and selects/replaces/clears one order lead with stale refetch
- `16.2-E04` — `tests/e2e/jobs/job-members.e2e.spec.ts:335` (e2e); [P0] 16.2-E04 deliberate stale assignment retry uses the currently visible eligible person
- `16.2-UNIT-003` — `tests/unit/features/jobs/job-members-domain.test.ts:110` (unit); [P1] 16.2-UNIT-003 uncertain crew retry keeps original identity and snapshot while newer draft stays unsent

### 16.2-AC02 — FULL

Real command select/replace/clear enforces zero-or-one current eligible designated job member; concurrent stale competitors yield one winner and PREVIEW_STALE, clear retains ordinary memberships. E01 actual stale picker/refetch and E05 pristine/dirty controls protect user consent.

- `16.2-INT-002` — `tests/integration/commands/job-members.int.test.ts:40` (api); [P0] 16.2-INT-002 manager select/replace/clear has one lead and competing stale replacements cannot overwrite
- `16.2-RLS-002` — `tests/integration/rls/job-members.rls.test.ts:69` (api); [P0] 16.2-RLS-002 foreign/inactive/archived/nonmember targets, spoofing and direct DML cannot bypass checked eligibility
- `16.2-E01` — `tests/e2e/jobs/job-members.e2e.spec.ts:95` (e2e); [P0] 16.2-E01 manager archives/reactivates the same project member and selects/replaces/clears one order lead with stale refetch
- `16.2-E05` — `tests/e2e/jobs/job-members.e2e.spec.ts:359` (e2e); [P0] 16.2-E05 cross-lane refetch synchronizes pristine lead and cannot silently authorize a dirty lead
- `16.2-UNIT-004` — `tests/unit/features/jobs/job-members-domain.test.ts:126` (unit); [P1] 16.2-UNIT-004 stale lead selection requires refetch and preserves user draft without silent resubmit
- `16.2-UNIT-005` — `tests/unit/features/jobs/job-members-domain.test.ts:148` (unit); [P0] 16.2-UNIT-005 cross-lane refresh updates pristine values but cannot authorize dirty controls

### 16.2-AC03 — FULL

Actual command and direct RPC exercise leadA ordinary crew and planned dates while unrelatedB, designation/self-removal, full card/identity/CRM/planning/lifecycle remain denied. Trusted descriptor tests never substitute for SQL authority. E02 performs allowed writes at phone viewport with forbidden controls absent.

- `16.2-INT-003` — `tests/integration/commands/job-members.int.test.ts:71` (api); [P0] 16.2-INT-003 lead A can manage ordinary crew/dates only A; designation and existing mixed commands remain denied
- `16.2-AUTHZ-001` — `tests/unit/server/authz/job-access.test.ts:40` (unit); [P0] 16.2-AUTHZ-001 current lead of any nonmanager role gets own-job crew/dates without full-card or designation
- `16.2-AUTHZ-002` — `tests/unit/server/authz/job-access.test.ts:55` (unit); [P0] 16.2-AUTHZ-002 lead A cannot manage B and absent/revoked/foreign lead facts fail closed
- `16.2-AUTHZ-003` — `tests/unit/server/authz/job-access.test.ts:75` (unit); [P0] 16.2-AUTHZ-003 independent manager union keeps existing rights and money remains separately entitled
- `16.2-E02` — `tests/e2e/jobs/job-members.e2e.spec.ts:176` (e2e); [P0] 16.2-E02 phone lead manages ordinary crew/dates only; a lost real save response retries once, and stale dates require refetch
- `16.2-INT-007` — `tests/integration/commands/job-members.int.test.ts:264` (api); [P0] 16.2-INT-007 active Admin and PL without optional resource profiles retain all four manager operations

### 16.2-AC04 — FULL

Real RLS001 iterates every seeded lead role plus manager/finance role unions; narrow ID/label eligible projection omits private fields, accepted-price fixture discriminates structural money omission and entitled positives. E03 verifies Sales navigation/MyJobs/direct own access and same-session removal denial; original installer member-or-assignee union remains exact.

- `16.2-RLS-001` — `tests/integration/rls/job-members.rls.test.ts:9` (api); [P0] 16.2-RLS-001 every seeded lead role and independent role union receives own-job scope with structural money/privacy boundaries
- `[P0] 16.2 lead read predicate preserves installer member/assignee union and scopes inherited child policies` — `tests/integration/rls/jobs-depth.rls.test.ts:110` (api); [P0] 16.2 lead read predicate preserves installer member/assignee union and scopes inherited child policies
- `16.2-AUTHZ-003` — `tests/unit/server/authz/job-access.test.ts:75` (unit); [P0] 16.2-AUTHZ-003 independent manager union keeps existing rights and money remains separately entitled
- `16.2-E03` — `tests/e2e/jobs/job-members.e2e.spec.ts:275` (e2e); [P0] 16.2-E03 designated Sales user reaches own My Jobs/detail without money or unrelated reads, then loses access when removed
- `16.1-E01` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:122` (e2e); [P0] 16.1-E01 My Jobs is the actual duplicate-free member/assignee union; direct denial and money-safe assigned detail agree

### 16.2-AC05 — FULL

Closed per-operation payload tests combine with actual RLS002 current foreign/invited/disabled/archived/nonmember variants, spoofed tenant/actor/job, authenticated and anonymous direct DML, composite FK and exact checked/private ACLs. Complete state equality proves no changes.

- `16.2-UNIT-001` — `tests/unit/features/jobs/job-members-domain.test.ts:54` (unit); [P0] 16.2-UNIT-001 separate operations reject invalid identities and cross-operation field smuggling
- `16.2-RLS-002` — `tests/integration/rls/job-members.rls.test.ts:69` (api); [P0] 16.2-RLS-002 foreign/inactive/archived/nonmember targets, spoofing and direct DML cannot bypass checked eligibility
- `16.2-RLS-003` — `tests/integration/rls/job-members.rls.test.ts:130` (api); [P0] 16.2-RLS-003 checked RPC grants and forced RLS exclude anonymous execution and private helper bypass
- `16.1-RLS-002` — `tests/integration/rls/jobs-depth.rls.test.ts:45` (api); [P0] 16.1-RLS-002 direct mutation/elevation, foreign child FKs and spoofed checked actor leave no state
- `[P0] 16.2 migration inventory retains SELECT-only members and exact checked/private ACLs` — `tests/integration/rls/migration-reset.int.test.ts:677` (api); [P0] 16.2 migration inventory retains SELECT-only members and exact checked/private ACLs

### 16.2-AC06 — FULL

Actual dates-only command permits explicit null/canonical ranges, changes only planned start/end and allowed timestamp, preserves unrelated job/booking/conflict data, and makes a genuine earlier full-card snapshot stale. E02 readback and complete boundary snapshot prove persistence without changing booking facts/proof contract.

- `16.2-UNIT-002` — `tests/unit/features/jobs/job-members-domain.test.ts:87` (unit); [P0] 16.2-UNIT-002 dates-only values preserve explicit null and canonical calendar/range policy
- `16.2-INT-004` — `tests/integration/commands/job-members.int.test.ts:109` (api); [P0] 16.2-INT-004 date save changes only planned fields and invalidates a genuine pre-edit card baseline
- `16.2-E02` — `tests/e2e/jobs/job-members.e2e.spec.ts:176` (e2e); [P0] 16.2-E02 phone lead manages ordinary crew/dates only; a lost real save response retries once, and stale dates require refetch

### 16.2-AC07 — FULL

Separate clean direct checked-SQL replay after revocation cannot be masked by an intervening business state change. Eight uniquely expanded observed tenant-gate races cover membership removal, lead replacement, tenant revocation, profile archival, manager role change and target eligibility. Audit fault proves exact rollback and same-request one-audit retry; E02 real response loss proves one durable outcome.

- `16.2-INT-005` — `tests/integration/commands/job-members.int.test.ts:149` (api); [P0] 16.2-INT-005 response-loss retry returns one outcome, rejects changed input/intervening state and rechecks current authority
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:244` (api); [P0] 16.2-INT-006 audit failure rolls the entire mutation back and the same request retries once
- `16.2-INT-002` — `tests/integration/commands/job-members.int.test.ts:40` (api); [P0] 16.2-INT-002 manager select/replace/clear has one lead and competing stale replacements cannot overwrite
- `16.2-E02` — `tests/e2e/jobs/job-members.e2e.spec.ts:176` (e2e); [P0] 16.2-E02 phone lead manages ordinary crew/dates only; a lost real save response retries once, and stale dates require refetch
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: actor-member-removed
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: actor-lead-replaced
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: actor-revoked
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: actor-profile-archived
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: manager-role-changed
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: target-member-removed
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: target-revoked
- `16.2-INT-006` — `tests/integration/commands/job-members.int.test.ts:200` (api); [P0] 16.2-INT-006 checked mutations recheck locked actor/target facts: target-profile-archived

### 16.2-AC08 — FULL

Headless retry/stale/pristine/dirty/older-confirmation tests and five actual browser journeys cover reachable labelled phone controls, explicit retry/refetch, retained input, durable-only status, current visible assignment and cross-lane consent. Existing16.1 essential navigation/create/detail evidence remains active; unavailable admission is safe/retryable.

- `16.2-UNIT-003` — `tests/unit/features/jobs/job-members-domain.test.ts:110` (unit); [P1] 16.2-UNIT-003 uncertain crew retry keeps original identity and snapshot while newer draft stays unsent
- `16.2-UNIT-004` — `tests/unit/features/jobs/job-members-domain.test.ts:126` (unit); [P1] 16.2-UNIT-004 stale lead selection requires refetch and preserves user draft without silent resubmit
- `16.2-UNIT-005` — `tests/unit/features/jobs/job-members-domain.test.ts:148` (unit); [P0] 16.2-UNIT-005 cross-lane refresh updates pristine values but cannot authorize dirty controls
- `16.2-UNIT-006` — `tests/unit/features/jobs/job-members-domain.test.ts:165` (unit); [P0] 16.2-UNIT-006 confirming an older assignment retains newer visible selection and its stale baseline
- `16.2-AUTHZ-004` — `tests/unit/server/authz/job-access.test.ts:108` (unit); [P0] 16.2-AUTHZ-004 unavailable admission is retryable, not absence; member read failure is typed and sanitized
- `16.2-E01` — `tests/e2e/jobs/job-members.e2e.spec.ts:95` (e2e); [P0] 16.2-E01 manager archives/reactivates the same project member and selects/replaces/clears one order lead with stale refetch
- `16.2-E02` — `tests/e2e/jobs/job-members.e2e.spec.ts:176` (e2e); [P0] 16.2-E02 phone lead manages ordinary crew/dates only; a lost real save response retries once, and stale dates require refetch
- `16.2-E03` — `tests/e2e/jobs/job-members.e2e.spec.ts:275` (e2e); [P0] 16.2-E03 designated Sales user reaches own My Jobs/detail without money or unrelated reads, then loses access when removed
- `16.2-E04` — `tests/e2e/jobs/job-members.e2e.spec.ts:335` (e2e); [P0] 16.2-E04 deliberate stale assignment retry uses the currently visible eligible person
- `16.2-E05` — `tests/e2e/jobs/job-members.e2e.spec.ts:359` (e2e); [P0] 16.2-E05 cross-lane refetch synchronizes pristine lead and cannot silently authorize a dirty lead
- `16.1-E02` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:171` (e2e); [P1] 16.1-E02 phone progressive identity, scheduling and child save retains unsent input after failure; explicit retry persists across reload

### 16.3-AC01 — FULL

Both actual parent kinds and manager/current-lead commands persist own nullable dates, closed fields and plural eligible members with correlated audit and stable ancestry. Real checked negatives cover ordinary/assignment-only actors, unrelated/foreign parents, inactive/invited/archived/nonmember targets and spoofing with full-state no-write assertions. E01 actual list/pane/create/edit/assignment/reload/shared-file journey passes on retained retry; its first-attempt audit delta zero remains an unresolved qualified execution caveat.

- `16.3-E01` — `tests/e2e/jobs/work-orders.e2e.spec.ts:82` (e2e); [P0] 16.3-E01 manager creates and edits own dates/plural assignees, reloads and opens an own shared file
- `16.3-E03` — `tests/e2e/jobs/work-orders.e2e.spec.ts:254` (e2e); [P0] 16.3-E03 distinct same-parent work orders warn from their own dates, clear at equality and show unknown; scoped reads/writes remain bounded
- `16.3-E02` — `tests/e2e/jobs/work-orders.e2e.spec.ts:160` (e2e); [P1] 16.3-E02 phone lead progresses status; lost-response/stale retries retain newer draft and cannot reopen
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:56` (api); [P0] 16.3-INT-001 independent projektledare authority does not require an optional profile
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:56` (api); [P0] 16.3-INT-001 independent tenant_admin authority does not require an optional profile
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:11` (api); [P0] 16.3-INT-001 parent assigneeProject preserves identity, own fields and plural eligible assignees for managers/current leads
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:11` (api); [P0] 16.3-INT-001 parent memberOrder preserves identity, own fields and plural eligible assignees for managers/current leads
- `16.3-INT-005` — `tests/integration/commands/work-orders.int.test.ts:247` (api); [P0] 16.3-INT-005 invalid dates/targets and identity substitution leave the entire write/audit unchanged
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: actor-lead-replaced
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: actor-profile-archived
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: actor-revoked
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: manager-role-lost
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: parent-archived
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: target-member-removed
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: target-profile-archived
- `16.3-RLS-001` — `tests/integration/rls/work-orders.rls.test.ts:10` (api); [P0] 16.3-RLS-001 seeded roles/union/current lead follow parent reads and assignment alone adds no authority
- `16.3-RLS-003` — `tests/integration/rls/work-orders.rls.test.ts:125` (api); [P0] 16.3-RLS-003 direct DML, composite parent/tenant substitution, anonymous RPC and private helper bypass fail
- `16.3-UNIT-001` — `tests/unit/features/jobs/work-orders-domain.test.ts:56` (unit); [P0] 16.3-UNIT-001 create/update are closed and normalize bounded title/plain description
- `16.3-UNIT-002` — `tests/unit/features/jobs/work-orders-domain.test.ts:84` (unit); [P0] 16.3-UNIT-002 own nullable Gregorian dates preserve equality and reject noncanonical/out-of-range values
- `16.3-UNIT-004` — `tests/unit/features/jobs/work-orders-domain.test.ts:121` (unit); [P0] 16.3-UNIT-004 plural assignment and typed dependency inputs reject smuggling/self/duplicates but admit distinct same-parent orders

### 16.3-AC02 — FULL

Pure exhaustive approved graph is backed by real ordinary transition paths, terminal edits, manager-only reopen, unchanged parent/bookings, checked create/full-update status-smuggling refusals and direct DML/helper denial. Phone E02 performs allowed transitions, hides reopening and verifies checked lead denial without parent completion.

- `16.3-E02` — `tests/e2e/jobs/work-orders.e2e.spec.ts:160` (e2e); [P1] 16.3-E02 phone lead progresses status; lost-response/stale retries retain newer draft and cannot reopen
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:112` (api); [P0] 16.3-INT-002 create/update cannot smuggle status or skip lifecycle edges
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:79` (api); [P0] 16.3-INT-002 lifecycle [ 'cancelled' ] enforces manager-only reopen and terminal field edits
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:79` (api); [P0] 16.3-INT-002 lifecycle [ 'in_progress', 'cancelled' ] enforces manager-only reopen and terminal field edits
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:79` (api); [P0] 16.3-INT-002 lifecycle [ 'in_progress', 'done' ] enforces manager-only reopen and terminal field edits
- `16.3-RLS-003` — `tests/integration/rls/work-orders.rls.test.ts:125` (api); [P0] 16.3-RLS-003 direct DML, composite parent/tenant substitution, anonymous RPC and private helper bypass fail
- `16.3-UNIT-003` — `tests/unit/features/jobs/work-orders-domain.test.ts:102` (unit); [P0] 16.3-UNIT-003 status graph has four states and exactly two independently manager-only reopen edges

### 16.3-AC03 — FULL

Real typed job-to-work-order, work-order-to-job and distinct same-/cross-parent child references compare their actual endpoint dates with deliberately different parent dates. Delay/equality/earlier/null/unreadable anonymous-unknown, both-scope denial, lossless old/new edge preservation and visibility-sensitive CAS are directly asserted. E03 persists/reloads warnings and edits real own dates. Only exact self-reference is prohibited; no invented transitive-cycle policy is credited.

- `16.3-E03` — `tests/e2e/jobs/work-orders.e2e.spec.ts:254` (e2e); [P0] 16.3-E03 distinct same-parent work orders warn from their own dates, clear at equality and show unknown; scoped reads/writes remain bounded
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:135` (api); [P0] 16.3-INT-003 all typed endpoint dates, same-parent sequencing and old/new edge retention
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:366` (api); [P0] 16.3-INT-003 parent job endpoint compares its own dates: 2026-10-20 => clear
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:366` (api); [P0] 16.3-INT-003 parent job endpoint compares its own dates: 2026-10-23 => delay
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:366` (api); [P0] 16.3-INT-003 parent job endpoint compares its own dates: null => unknown
- `16.3-INT-004` — `tests/integration/commands/work-orders.int.test.ts:208` (api); [P0] 16.3-INT-004 competing saves and lost replies cannot overwrite or replay changed identity/current authority
- `16.3-INT-008` — `tests/integration/commands/work-orders.int.test.ts:381` (api); [P0] 16.3-INT-008 a coherent read token never authorizes overwriting an unseen concurrent edit
- `16.3-RLS-002` — `tests/integration/rls/work-orders.rls.test.ts:75` (api); [P0] 16.3-RLS-002 hidden prerequisite becomes anonymous unknown without leaking IDs/dates/labels or picker authority
- `16.3-RLS-003` — `tests/integration/rls/work-orders.rls.test.ts:125` (api); [P0] 16.3-RLS-003 direct DML, composite parent/tenant substitution, anonymous RPC and private helper bypass fail
- `16.3-P4 unknown warnings retain only the readable dependent identity and never pollute siblings or parent` — `tests/unit/features/jobs/work-order-selection.test.ts:21` (unit); 16.3-P4 unknown warnings retain only the readable dependent identity and never pollute siblings or parent
- `16.3-UNIT-002` — `tests/unit/features/jobs/work-orders-domain.test.ts:84` (unit); [P0] 16.3-UNIT-002 own nullable Gregorian dates preserve equality and reject noncanonical/out-of-range values
- `16.3-UNIT-004` — `tests/unit/features/jobs/work-orders-domain.test.ts:121` (unit); [P0] 16.3-UNIT-004 plural assignment and typed dependency inputs reject smuggling/self/duplicates but admit distinct same-parent orders
- `16.3-UNIT-005` — `tests/unit/features/jobs/work-orders-domain.test.ts:148` (unit); [P0] 16.3-UNIT-005 warning compares actual typed endpoint dates; equality clears and unreadable timing stays anonymous unknown

### 16.3-AC04 — FULL

Seven separately observed post-lock revocation/target/parent cases exercise checked SQL; profileless independent managers succeed. Real one-winner CAS, unchanged-body/current-authority replay, coherent read token, lost-create original identity, proven no-outcome fresh consent and whole child/assignment/dependency/outcome/audit fault rollback have active cases. Real E02/E04/E05 transport/stale recovery supplements adapter state units.

- `16.3-E04` — `tests/e2e/jobs/work-orders.e2e.spec.ts:316` (e2e); [P0] 16.3-E04 lost create reconciles the original child after another mutation without a duplicate or newer-draft loss
- `16.3-E05` — `tests/e2e/jobs/work-orders.e2e.spec.ts:378` (e2e); [P0] 16.3-E05 never-committed stale create retains draft until explicit refresh/consent and creates once
- `16.3-E02` — `tests/e2e/jobs/work-orders.e2e.spec.ts:160` (e2e); [P1] 16.3-E02 phone lead progresses status; lost-response/stale retries retain newer draft and cannot reopen
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:56` (api); [P0] 16.3-INT-001 independent projektledare authority does not require an optional profile
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:56` (api); [P0] 16.3-INT-001 independent tenant_admin authority does not require an optional profile
- `16.3-INT-004` — `tests/integration/commands/work-orders.int.test.ts:208` (api); [P0] 16.3-INT-004 competing saves and lost replies cannot overwrite or replay changed identity/current authority
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: actor-lead-replaced
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: actor-profile-archived
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: actor-revoked
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: manager-role-lost
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: parent-archived
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: target-member-removed
- `16.3-INT-006` — `tests/integration/commands/work-orders.int.test.ts:291` (api); [P0] 16.3-INT-006 checked SQL rechecks locked current facts: target-profile-archived
- `16.3-INT-007` — `tests/integration/commands/work-orders.int.test.ts:335` (api); [P0] 16.3-INT-007 audit failure rolls assignments/dependencies/child/outcome back before an exact retry
- `16.3-INT-008` — `tests/integration/commands/work-orders.int.test.ts:381` (api); [P0] 16.3-INT-008 a coherent read token never authorizes overwriting an unseen concurrent edit
- `16.3-INT-009` — `tests/integration/commands/work-orders.int.test.ts:411` (api); [P0] 16.3-INT-009 lost create outcome reconciles original identity after an intervening edit without duplicate or audit
- `16.3-INT-010` — `tests/integration/commands/work-orders.int.test.ts:435` (api); [P0] 16.3-INT-010 a definitively stale first create proves no outcome before fresh explicit consent
- `16.3-RLS-003` — `tests/integration/rls/work-orders.rls.test.ts:125` (api); [P0] 16.3-RLS-003 direct DML, composite parent/tenant substitution, anonymous RPC and private helper bypass fail
- `16.3 only proven first-attempt absence permits stale-create refresh and explicit fresh consent` — `tests/unit/features/jobs/work-order-selection.test.ts:52` (unit); 16.3 only proven first-attempt absence permits stale-create refresh and explicit fresh consent
- `16.3-UNIT-006` — `tests/unit/features/jobs/work-orders-domain.test.ts:169` (unit); [P0] 16.3-UNIT-006 uncertain retry/late confirmation retain newer input and dirty fields keep their original consent baseline
- `16.3 failed reconciliation remains stale/denied; other mutation replay never uses create recovery` — `tests/unit/server/commands/work-orders-db.test.ts:25` (unit); 16.3 failed reconciliation remains stale/denied; other mutation replay never uses create recovery
- `16.3 stale create recovers only the original identity with identical canonical request arguments` — `tests/unit/server/commands/work-orders-db.test.ts:13` (unit); 16.3 stale create recovers only the original identity with identical canonical request arguments
- `16.3 stale never-committed create is a definite conflict rather than unresolved transport uncertainty` — `tests/unit/server/commands/work-orders-db.test.ts:39` (unit); 16.3 stale never-committed create is a definite conflict rather than unresolved transport uncertainty

### 16.3-AC05 — FULL

Actual shared upload/link/generic sign/selected sign/context/archive/restore and authenticated known-path private Storage bytes are tested under current child-plus-parent ancestry and independent Files rights. Foreign/wrong-owner/type/purpose/archived/lead-only/assignee-only negatives, no-write audit-fault rollback, legitimate alternative-source positive, private helper non-oracle behavior, exact attestation and structural protected-field omission are asserted. E01 opens actual uploaded bytes; retry qualification remains explicit.

- `16.3-E01` — `tests/e2e/jobs/work-orders.e2e.spec.ts:82` (e2e); [P0] 16.3-E01 manager creates and edits own dates/plural assignees, reloads and opens an own shared file
- `16.3-E02` — `tests/e2e/jobs/work-orders.e2e.spec.ts:160` (e2e); [P1] 16.3-E02 phone lead progresses status; lost-response/stale retries retain newer draft and cannot reopen
- `16.3-FILE-INT-001` — `tests/integration/commands/work-order-files.int.test.ts:61` (api); [P0] 16.3-FILE-INT-001 parent assigneeProject uses real shared upload/link/sign and selected source/context without protected payloads
- `16.3-FILE-INT-001` — `tests/integration/commands/work-order-files.int.test.ts:61` (api); [P0] 16.3-FILE-INT-001 parent memberOrder uses real shared upload/link/sign and selected source/context without protected payloads
- `16.3-FILE-INT-002` — `tests/integration/commands/work-order-files.int.test.ts:107` (api); [P0] 16.3-FILE-INT-002 foreign/type/link substitutions, lead-only and assignee-only actors, and archived parent deny actual shared consumers
- `16.3-FILE-INT-003` — `tests/integration/commands/work-order-files.int.test.ts:172` (api); [P0] 16.3-FILE-INT-003 selected work-order archive/restore preserve shared identities and roll back on audit failure/current parent denial
- `16.3-FILE-INT-004` — `tests/integration/commands/work-order-files.int.test.ts:237` (api); [P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: archived-customer
- `16.3-FILE-INT-004` — `tests/integration/commands/work-order-files.int.test.ts:237` (api); [P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: archived-link
- `16.3-FILE-INT-004` — `tests/integration/commands/work-order-files.int.test.ts:237` (api); [P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: foreign-owner
- `16.3-FILE-INT-004` — `tests/integration/commands/work-order-files.int.test.ts:237` (api); [P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: missing-owner
- `16.3-FILE-INT-004` — `tests/integration/commands/work-order-files.int.test.ts:237` (api); [P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: same-parent-job
- `16.3-FILE-INT-004` — `tests/integration/commands/work-order-files.int.test.ts:237` (api); [P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: sole-work-order
- `16.3-FILE-INT-004` — `tests/integration/commands/work-order-files.int.test.ts:237` (api); [P0] 16.3-FILE-INT-004 generic sign and known-path Storage deny all invalid sources: wrong-purpose
- `16.3-FILE-INT-005` — `tests/integration/commands/work-order-files.int.test.ts:269` (api); [P0] 16.3-FILE-INT-005 live alternate preserves selected bytes while hidden invalid work order withholds active lifecycle hints
- `16.3-FILE-INT-005` — `tests/integration/commands/work-order-files.int.test.ts:269` (api); [P0] 16.3-FILE-INT-005 live alternate preserves selected bytes while hidden invalid work order withholds archived lifecycle hints
- `16.3-FILE-INT-006` — `tests/integration/commands/work-order-files.int.test.ts:301` (api); [P0] 16.3-FILE-INT-006 authenticated predicates do not distinguish foreign present from absent source/file/path
- `16.3-RLS-001` — `tests/integration/rls/work-orders.rls.test.ts:10` (api); [P0] 16.3-RLS-001 seeded roles/union/current lead follow parent reads and assignment alone adds no authority
- `[16.3][AC05] existing owner preflight preserves its single request-RLS visibility check` — `tests/unit/server/commands/file-validation.test.ts:214` (unit); [16.3][AC05] existing owner preflight preserves its single request-RLS visibility check
- `[16.3][AC05] shared work-order preflight admits only the current coherent child and parent` — `tests/unit/server/commands/file-validation.test.ts:185` (unit); [16.3][AC05] shared work-order preflight admits only the current coherent child and parent
- `16.3-FILE-UNIT-001` — `tests/unit/server/commands/work-order-file-contract.test.ts:10` (unit); [P0] 16.3-FILE-UNIT-001 shared upload accepts work_order/job_evidence while preserving closed owner/purpose validation
- `16.3 read DTO strips protected/raw metadata from every nested projection` — `tests/unit/server/read-models/job-work-orders.test.ts:18` (unit); 16.3 read DTO strips protected/raw metadata from every nested projection
- `[16.3][AC05] work-order evidence challenge and proof use the existing exact selected-link bytes and key` — `tests/unit/server/storage/document-signed-access-attestation.test.ts:194` (unit); [16.3][AC05] work-order evidence challenge and proof use the existing exact selected-link bytes and key

### 16.3-AC06 — FULL

Real seeded-role/union/designation parent-read matrix and direct child/raw checked boundaries deny foreign/unrelated/inactive actors and assignment-only authority; DTO/protected-path tests prove structural omission. Snapshot-preserved jobs/bookings/conflicts/source/roles and current native retained 16.1/16.2 browser journeys plus booking checked current-facts/concurrency/replay regressions support compatibility. Retired v3 fresh-proof handling after the intentional 16.4 v4 upgrade is covered by 16.4 rather than counted as continued v3 fresh admission.

- `16.2-E01` — `tests/e2e/jobs/job-members.e2e.spec.ts:95` (e2e); [P0] 16.2-E01 manager archives/reactivates the same project member and selects/replaces/clears one order lead with stale refetch
- `16.2-E02` — `tests/e2e/jobs/job-members.e2e.spec.ts:176` (e2e); [P0] 16.2-E02 phone lead manages ordinary crew/dates only; a lost real save response retries once, and stale dates require refetch
- `16.2-E03` — `tests/e2e/jobs/job-members.e2e.spec.ts:275` (e2e); [P0] 16.2-E03 designated Sales user reaches own My Jobs/detail without money or unrelated reads, then loses access when removed
- `16.2-E04` — `tests/e2e/jobs/job-members.e2e.spec.ts:335` (e2e); [P0] 16.2-E04 deliberate stale assignment retry uses the currently visible eligible person
- `16.2-E05` — `tests/e2e/jobs/job-members.e2e.spec.ts:359` (e2e); [P0] 16.2-E05 cross-lane refetch synchronizes pristine lead and cannot silently authorize a dirty lead
- `16.1-E01` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:122` (e2e); [P0] 16.1-E01 My Jobs is the actual duplicate-free member/assignee union; direct denial and money-safe assigned detail agree
- `16.1-E03` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:289` (e2e); [P0] 16.1-E03 actual job-bound booking preview/save consumes requirements and windows; changed job facts invalidate review before durable save
- `16.1-E02` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:171` (e2e); [P1] 16.1-E02 phone progressive identity, scheduling and child save retains unsent input after failure; explicit retry persists across reload
- `16.1-E04` — `tests/e2e/jobs/jobs-depth.e2e.spec.ts:363` (e2e); [P1] 16.1-E04 dependency dates display unknown, a linked violated-order warning, then clear only after a durable date correction
- `16.3-E01` — `tests/e2e/jobs/work-orders.e2e.spec.ts:82` (e2e); [P0] 16.3-E01 manager creates and edits own dates/plural assignees, reloads and opens an own shared file
- `16.3-E03` — `tests/e2e/jobs/work-orders.e2e.spec.ts:254` (e2e); [P0] 16.3-E03 distinct same-parent work orders warn from their own dates, clear at equality and show unknown; scoped reads/writes remain bounded
- `16.3-E02` — `tests/e2e/jobs/work-orders.e2e.spec.ts:160` (e2e); [P1] 16.3-E02 phone lead progresses status; lost-response/stale retries retain newer draft and cannot reopen
- `14.4-INT-003-concurrent` — `tests/integration/commands/booking-editor.int.test.ts:319` (api); [P0] 14.4-INT-003-concurrent editors reviewed same facts commit one and force other review
- `14.4-INT-003-current-facts-concurrent-booking` — `tests/integration/commands/booking-editor.int.test.ts:284` (api); [P0] 14.4-INT-003-current-facts-concurrent-booking has one finalize no silent redetection
- `14.4-INT-003-current-facts-schedule` — `tests/integration/commands/booking-editor.int.test.ts:284` (api); [P0] 14.4-INT-003-current-facts-schedule has one finalize no silent redetection
- `14.4-INT-002-replay-create` — `tests/integration/commands/booking-editor.int.test.ts:439` (api); [P0] 14.4-INT-002-replay-create lost-response equal retry excludes transport facts drift expiry
- `14.4-INT-002-replay-update` — `tests/integration/commands/booking-editor.int.test.ts:439` (api); [P0] 14.4-INT-002-replay-update lost-response equal retry excludes transport facts drift expiry
- `14.4-INT-002-replay-normalized` — `tests/integration/commands/booking-editor.int.test.ts:439` (api); [P1] 14.4-INT-002-replay-normalized reason trim and reordered logical IDs return historical result
- `16.3-FILE-INT-002` — `tests/integration/commands/work-order-files.int.test.ts:107` (api); [P0] 16.3-FILE-INT-002 foreign/type/link substitutions, lead-only and assignee-only actors, and archived parent deny actual shared consumers
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:56` (api); [P0] 16.3-INT-001 independent projektledare authority does not require an optional profile
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:56` (api); [P0] 16.3-INT-001 independent tenant_admin authority does not require an optional profile
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:11` (api); [P0] 16.3-INT-001 parent assigneeProject preserves identity, own fields and plural eligible assignees for managers/current leads
- `16.3-INT-001` — `tests/integration/commands/work-orders.int.test.ts:11` (api); [P0] 16.3-INT-001 parent memberOrder preserves identity, own fields and plural eligible assignees for managers/current leads
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:112` (api); [P0] 16.3-INT-002 create/update cannot smuggle status or skip lifecycle edges
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:79` (api); [P0] 16.3-INT-002 lifecycle [ 'cancelled' ] enforces manager-only reopen and terminal field edits
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:79` (api); [P0] 16.3-INT-002 lifecycle [ 'in_progress', 'cancelled' ] enforces manager-only reopen and terminal field edits
- `16.3-INT-002` — `tests/integration/commands/work-orders.int.test.ts:79` (api); [P0] 16.3-INT-002 lifecycle [ 'in_progress', 'done' ] enforces manager-only reopen and terminal field edits
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:135` (api); [P0] 16.3-INT-003 all typed endpoint dates, same-parent sequencing and old/new edge retention
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:366` (api); [P0] 16.3-INT-003 parent job endpoint compares its own dates: 2026-10-20 => clear
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:366` (api); [P0] 16.3-INT-003 parent job endpoint compares its own dates: 2026-10-23 => delay
- `16.3-INT-003` — `tests/integration/commands/work-orders.int.test.ts:366` (api); [P0] 16.3-INT-003 parent job endpoint compares its own dates: null => unknown
- `16.3-INT-004` — `tests/integration/commands/work-orders.int.test.ts:208` (api); [P0] 16.3-INT-004 competing saves and lost replies cannot overwrite or replay changed identity/current authority
- `16.3-RLS-001` — `tests/integration/rls/work-orders.rls.test.ts:10` (api); [P0] 16.3-RLS-001 seeded roles/union/current lead follow parent reads and assignment alone adds no authority
- `16.3-RLS-002` — `tests/integration/rls/work-orders.rls.test.ts:75` (api); [P0] 16.3-RLS-002 hidden prerequisite becomes anonymous unknown without leaking IDs/dates/labels or picker authority
- `16.3-RLS-003` — `tests/integration/rls/work-orders.rls.test.ts:125` (api); [P0] 16.3-RLS-003 direct DML, composite parent/tenant substitution, anonymous RPC and private helper bypass fail
- `16.3 parent mismatch, malformed state/status and failed reads remain actionable failures` — `tests/unit/server/read-models/job-work-orders.test.ts:38` (unit); 16.3 parent mismatch, malformed state/status and failed reads remain actionable failures
- `16.3 read DTO strips protected/raw metadata from every nested projection` — `tests/unit/server/read-models/job-work-orders.test.ts:18` (unit); 16.3 read DTO strips protected/raw metadata from every nested projection

### 16.3-AC07 — FULL

Actual 360x640 E02 plus E01-E05 cover labelled/focus/status/alert controls, immutable response-loss replay, newer draft and original baseline retention, stale refusal/refetch/explicit consent, durable success/reload and usable dependencies/files. Consumed selection-generation/abandoned-pane units prevent late receipts consuming newer state. Broad device/browser/visual/manual scope remains owned release validation. E01 initial audit-zero failure and complete successful retry are both retained.

- `16.3-E01` — `tests/e2e/jobs/work-orders.e2e.spec.ts:82` (e2e); [P0] 16.3-E01 manager creates and edits own dates/plural assignees, reloads and opens an own shared file
- `16.3-E03` — `tests/e2e/jobs/work-orders.e2e.spec.ts:254` (e2e); [P0] 16.3-E03 distinct same-parent work orders warn from their own dates, clear at equality and show unknown; scoped reads/writes remain bounded
- `16.3-E04` — `tests/e2e/jobs/work-orders.e2e.spec.ts:316` (e2e); [P0] 16.3-E04 lost create reconciles the original child after another mutation without a duplicate or newer-draft loss
- `16.3-E05` — `tests/e2e/jobs/work-orders.e2e.spec.ts:378` (e2e); [P0] 16.3-E05 never-committed stale create retains draft until explicit refresh/consent and creates once
- `16.3-E02` — `tests/e2e/jobs/work-orders.e2e.spec.ts:160` (e2e); [P1] 16.3-E02 phone lead progresses status; lost-response/stale retries retain newer draft and cannot reopen
- `16.3 abandoned pane receipts cannot replace newer projection or unmount its draft` — `tests/unit/features/jobs/work-order-selection.test.ts:36` (unit); 16.3 abandoned pane receipts cannot replace newer projection or unmount its draft
- `16.3 only proven first-attempt absence permits stale-create refresh and explicit fresh consent` — `tests/unit/features/jobs/work-order-selection.test.ts:52` (unit); 16.3 only proven first-attempt absence permits stale-create refresh and explicit fresh consent
- `16.3-P8 a create result can adopt only its originating still-open empty pane generation` — `tests/unit/features/jobs/work-order-selection.test.ts:5` (unit); 16.3-P8 a create result can adopt only its originating still-open empty pane generation
- `16.3-UNIT-006` — `tests/unit/features/jobs/work-orders-domain.test.ts:169` (unit); [P0] 16.3-UNIT-006 uncertain retry/late confirmation retain newer input and dirty fields keep their original consent baseline
- `16.3 failed reconciliation remains stale/denied; other mutation replay never uses create recovery` — `tests/unit/server/commands/work-orders-db.test.ts:25` (unit); 16.3 failed reconciliation remains stale/denied; other mutation replay never uses create recovery
- `16.3 stale create recovers only the original identity with identical canonical request arguments` — `tests/unit/server/commands/work-orders-db.test.ts:13` (unit); 16.3 stale create recovers only the original identity with identical canonical request arguments
- `16.3 stale never-committed create is a definite conflict rather than unresolved transport uncertainty` — `tests/unit/server/commands/work-orders-db.test.ts:39` (unit); 16.3 stale never-committed create is a definite conflict rather than unresolved transport uncertainty

### 16.4-AC01 — FULL

Actual checked same-ID one-way upgrade conserves status/frozen quote sources/customer/tenant/all children/bookings/members/work orders/files and produces one event/audit. Concurrent identical requests/replay/changed identity, stale64hex CAS, post-lock revocation and injected-audit whole rollback are directly exercised. Actual confirmation E01/E02/E03 proves full UI/reload and response-loss recovery.

- `16.4-Upgrade-E01` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:171` (e2e); [P0] 16.4-Upgrade-E01 manager uses full card on both kinds; same-ID upgrade preserves accepted source and every child
- `16.4-Upgrade-E02` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:245` (e2e); [P0] 16.4-Upgrade-E02 current lead gains no manager grant; phone response-loss retry keeps state and commits once
- `16.4-Upgrade-E03` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:305` (e2e); [P0] 16.4-Upgrade-E03 definitive refusal dismisses; failed/duplicate refetch retains confirmation and cannot overwrite a newer save
- `16.4-INT-U01` — `tests/integration/commands/job-upgrade.int.test.ts:5` (api); [P0] 16.4-INT-U01 manager upgrades accepted job with every child/file/provenance intact
- `16.4-INT-U02` — `tests/integration/commands/job-upgrade.int.test.ts:40` (api); [P0] 16.4-INT-U02 concurrent response-loss retries have one outcome and changed request identity is refused
- `16.4-INT-U03` — `tests/integration/commands/job-upgrade.int.test.ts:71` (api); [P0] 16.4-INT-U03 audit fault rolls type/event/outcome back; exact retry commits once
- `16.4-INT-U05` — `tests/integration/commands/job-upgrade.int.test.ts:116` (api); [P0] 16.4-INT-U05 current authority and target after observed lock wait: parent-archived
- `16.4-INT-U05` — `tests/integration/commands/job-upgrade.int.test.ts:116` (api); [P0] 16.4-INT-U05 current authority and target after observed lock wait: role-revoked
- `16.4-F01` — `tests/unit/features/jobs/job-upgrade-domain.test.ts:62` (unit); [P0][16.4-F01] definitive upgrade rejection dismisses, unresolved retries retain identity, stale refresh cannot reset a newer outcome
- `16.4-U02` — `tests/unit/features/jobs/job-upgrade-domain.test.ts:38` (unit); [P0][16.4-U02] failed upgrade retains exact retry identity and ignores stale confirmation

### 16.4-AC02 — FULL

Independent current manager role union/profileless positive and lead/ordinary/foreign/inactive/current-revocation replay negatives use real commands/checked SQL and observed waits. Privileged direct SQL and alternate writers enforce the exact downgrade invariant beneath wrappers; already-Projekt is a no-op and old creation stays Order. Real confirmation is truthful, has no downgrade control, and handles denial/stale refetch.

- `16.4-Upgrade-E01` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:171` (e2e); [P0] 16.4-Upgrade-E01 manager uses full card on both kinds; same-ID upgrade preserves accepted source and every child
- `16.4-Upgrade-E02` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:245` (e2e); [P0] 16.4-Upgrade-E02 current lead gains no manager grant; phone response-loss retry keeps state and commits once
- `16.4-Upgrade-E03` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:305` (e2e); [P0] 16.4-Upgrade-E03 definitive refusal dismisses; failed/duplicate refetch retains confirmation and cannot overwrite a newer save
- `16.4-INT-C12` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:246` (api); [P0] 16.4-INT-C12 semantic entry/preview cannot grant foreign-parent or lead-only booking authority
- `16.4-INT-U02` — `tests/integration/commands/job-upgrade.int.test.ts:40` (api); [P0] 16.4-INT-U02 concurrent response-loss retries have one outcome and changed request identity is refused
- `16.4-INT-U04` — `tests/integration/commands/job-upgrade.int.test.ts:86` (api); [P0] 16.4-INT-U04 manager role union works without profile; lead/ordinary/foreign/inactive JWTs cannot upgrade or replay
- `16.4-INT-U05` — `tests/integration/commands/job-upgrade.int.test.ts:116` (api); [P0] 16.4-INT-U05 current authority and target after observed lock wait: parent-archived
- `16.4-INT-U05` — `tests/integration/commands/job-upgrade.int.test.ts:116` (api); [P0] 16.4-INT-U05 current authority and target after observed lock wait: role-revoked
- `16.4-INT-U06` — `tests/integration/commands/job-upgrade.int.test.ts:133` (api); [P0] 16.4-INT-U06 every reverse writer is rejected below wrappers with exact downgrade result; old creation stays order-only
- `16.4-F01` — `tests/unit/features/jobs/job-upgrade-domain.test.ts:62` (unit); [P0][16.4-F01] definitive upgrade rejection dismisses, unresolved retries retain identity, stale refresh cannot reset a newer outcome
- `16.4-U01` — `tests/unit/features/jobs/job-upgrade-domain.test.ts:20` (unit); [P0][16.4-U01] upgrade input is closed and reverse kind transition has the exact error
- `16.4-U02` — `tests/unit/features/jobs/job-upgrade-domain.test.ts:38` (unit); [P0][16.4-U02] failed upgrade retains exact retry identity and ignores stale confirmation

### 16.4-AC03 — FULL

Both Order/Projekt real complete-card saves retain the named existing fields, current responsible lead and actual typed child dependencies without modifying child storage. Worker read denies edit/upgrade and excludes protected/payment/economy/token fields. Actual full-card browser journey saves/reloads both kinds and conserves sources/files/children on upgrade. Four consumed serializer F05 cases preserve offsets, microseconds, fold instants and independently edited boundaries through the strict validator. No unnamed project-only fields or E17.2 payment-plan validity are counted as implemented.

- `16.4-Upgrade-E01` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:171` (e2e); [P0] 16.4-Upgrade-E01 manager uses full card on both kinds; same-ID upgrade preserves accepted source and every child
- `16.4-INT-C01` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:7` (api); [P0] 16.4-INT-C01 complete order card retains fields, responsible lead and actual WO edges
- `16.4-INT-C01` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:7` (api); [P0] 16.4-INT-C01 complete projekt card retains fields, responsible lead and actual WO edges
- `16.4-INT-U01` — `tests/integration/commands/job-upgrade.int.test.ts:5` (api); [P0] 16.4-INT-U01 manager upgrades accepted job with every child/file/provenance intact
- `16.1-U01 enriched input rejects identity, money, tenant and malformed children without coercion` — `tests/unit/server/commands/job-card-validation.test.ts:9` (unit); 16.1-U01 enriched input rejects identity, money, tenant and malformed children without coercion
- `16.1-U07 unknown and recorded-empty are distinct normalized values` — `tests/unit/server/commands/job-card-validation.test.ts:19` (unit); 16.1-U07 unknown and recorded-empty are distinct normalized values
- `16.4-F05` — `tests/unit/server/commands/job-card-validation.test.ts:58` (unit); 16.4-F05 already canonical loaded access windows preserve submillisecond precision
- `16.4-F05` — `tests/unit/server/commands/job-card-validation.test.ts:72` (unit); 16.4-F05 each edited access-window boundary converts independently and retains the other original
- `16.4-F05` — `tests/unit/server/commands/job-card-validation.test.ts:49` (unit); 16.4-F05 loaded database-offset access windows remain saveable with every microsecond intact
- `16.4-F05` — `tests/unit/server/commands/job-card-validation.test.ts:67` (unit); 16.4-F05 untouched second-fold access-window instant is never reparsed to the first fold

### 16.4-AC04 — FULL

Selected D alone derives the untouched new booking interval; explicit/existing/edited intervals win and missing D remains a truthful 60-minute fallback. Current hint refresh, job/CRM changes, stale/newer drafts, fractional/canonical DST instants and independent booking authority negatives are covered. Actual production editor/preview/save/read/reload browser consumers E01/E03/E04 demonstrate consumed behavior, not helper-only coverage.

- `16.4-Consumer-E01` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:106` (e2e); [P0] 16.4-Consumer-E01 actual job entry defaults D120 elapsed; job changes refresh only untouched defaults, and explicit/edit intervals plus distinct hints persist
- `16.4-Consumer-E03` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:279` (e2e); [P0] 16.4-Consumer-E03 actual new defaults follow earliest and CRM clears; delayed options preserve newer job/interval edits
- `16.4-Consumer-E04` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:314` (e2e); [P0] 16.4-Consumer-E04 untouched fold start and same-wall-time changed end retain canonical UTC defaults
- `16.4-INT-C02` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:41` (api); [P0] 16.4-INT-C02 actual editor consumes D only for new untouched default; explicit/edit intervals survive preview/save/read
- `16.4-INT-C12` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:246` (api); [P0] 16.4-INT-C12 semantic entry/preview cannot grant foreign-parent or lead-only booking authority
- `16.4-INT-F01` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:276` (api); [P0] 16.4-INT-F01 valid terminal/centuries planning dates cannot block real booking preview or save
- `16.4-F02` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:123` (unit); [P0][16.4-F02] actual default composition clamps only derived starts and preserves canonical DST fold instants
- `16.4-U03` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:29` (unit); [P0][16.4-U03] new derived default uses selected D at effective start and unknown uses honest 60 minutes
- `16.4-U04` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:42` (unit); [P0][16.4-U04] explicit/edit/user intervals survive job changes while untouched derived interval rederives
- `16.4-U06` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:79` (unit); [P0][16.4-U06] stale hint response retains dirty newer draft and immutable uncertain submission
- `current hint refresh updates only the matching untouched unsent interval` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:95` (unit); current hint refresh updates only the matching untouched unsent interval
- `unavailable selected job keeps date and honest fallback; defaults preserve fractional instants` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:111` (unit); unavailable selected job keeps date and honest fallback; defaults preserve fractional instants

### 16.4-AC05 — FULL

Real consumer goldens and pure existing capacity fixture prove N*(D+T)=300 once per job, allocations0/120/120/360, residual300/180/180/0, remaining capacity480/360/120/120 and shortfall0/0/60/0. Same selected eligible pool and inclusive Stockholm planned window apply to credit and capacity; candidate replacement/dedup/split/repeat/other-job/cancelled/DST/negative/fractional occupancy remain actual per-assignee minutes. Missing facts remain unknown; T0known. Actual planned shortfall saves with no extra conflict/debit/override/block, and browser E02 previews/saves/reloads current advice.

- `16.4-Consumer-E02` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:181` (e2e); [P0] 16.4-Consumer-E02 actual capacity advice counts candidate once; preview/save/reload stays advisory and stale responses retain the newer draft
- `16.4-INT-C03` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:71` (api); [P0] 16.4-INT-C03 actual read/preview demand 0/480/0
- `16.4-INT-C03` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:71` (api); [P0] 16.4-INT-C03 actual read/preview demand 120/360/240
- `16.4-INT-C03` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:71` (api); [P0] 16.4-INT-C03 actual read/preview demand 120/480/120
- `16.4-INT-C03` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:71` (api); [P0] 16.4-INT-C03 actual read/preview demand 360/480/360
- `16.4-INT-C04` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:82` (api); [P0] 16.4-INT-C04 actual post-edit candidate credited once, same explicit pool/window and split actual occupancy only
- `16.4-INT-C05` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:103` (api); [P0] 16.4-INT-C05 missing real input stays unknown, zero travel known; advisory shortfall adds no save/override/conflict rule
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: crew_size
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: customer_presence_required
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: desired_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: earliest_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: estimated_duration_minutes
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: latest_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: planned_end_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: planned_start_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: planned_travel_minutes
- `16.4-INT-C10` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:206` (api); [P0] 16.4-INT-C10 mixed booking facts bind each actual job and selected-pool canonical post-edit occupancy
- `16.4-INT-F01` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:276` (api); [P0] 16.4-INT-F01 valid terminal/centuries planning dates cannot block real booking preview or save
- `16.4-F03` — `tests/unit/features/scheduling/job-demand-advisory.test.ts:147` (unit); [P0][16.4-F03] valid lower/upper instant boundaries and centuries-long planning windows leave advisory unknown without throwing or iterating the window
- `16.4-U07` — `tests/unit/features/scheduling/job-demand-advisory.test.ts:36` (unit); [P0][16.4-U07] four approved D120 N2 T30 person-minute goldens charge demand once and occupancy once
- `16.4-U08` — `tests/unit/features/scheduling/job-demand-advisory.test.ts:63` (unit); [P0][16.4-U08] missing real inputs stay unknown while explicit T0 is known and crew does not invent people
- `16.4-U09` — `tests/unit/features/scheduling/job-demand-advisory.test.ts:80` (unit); [P0][16.4-U09] canonical candidate replaces prior identity once and split/repeated bookings credit actual minutes only
- `16.4-U10` — `tests/unit/features/scheduling/job-demand-advisory.test.ts:99` (unit); [P0][16.4-U10] identical eligible pool and inclusive planned Stockholm day clip DST occupancy and preserve negative capacity
- `duplicate existing ownership contradictions fail instead of selecting arbitrary allocation credit` — `tests/unit/features/scheduling/job-demand-advisory.test.ts:140` (unit); duplicate existing ownership contradictions fail instead of selecting arbitrary allocation credit
- `multi-day clipping uses the planned window and exact fractional occupancy/capacity` — `tests/unit/features/scheduling/job-demand-advisory.test.ts:122` (unit); multi-day clipping uses the planned window and exact fractional occupancy/capacity

### 16.4-AC06 — FULL

Actual selected-job earliest bound, soft desired miss and distinct latest breach remain separate and saveable across mixed jobs. Nine canonical scalar/date/presence facts, selected pool and canonical occupancy bind digests; all nine observed-wait mutations reject stale reviewed commits and require new receipt. Genuine obsolete v3/v1 proofs reach both finalizers and fail, old fresh-write finalize returns BR428, authenticated obsolete receipts are stale while tampered/foreign ones are denied. Real consumers show date hints, default composition, preview/save/reload and no new hard date rule.

- `16.4-Consumer-E01` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:106` (e2e); [P0] 16.4-Consumer-E01 actual job entry defaults D120 elapsed; job changes refresh only untouched defaults, and explicit/edit intervals plus distinct hints persist
- `16.4-Consumer-E02` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:181` (e2e); [P0] 16.4-Consumer-E02 actual capacity advice counts candidate once; preview/save/reload stays advisory and stale responses retain the newer draft
- `16.4-Consumer-E03` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:279` (e2e); [P0] 16.4-Consumer-E03 actual new defaults follow earliest and CRM clears; delayed options preserve newer job/interval edits
- `16.4-Consumer-E04` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:314` (e2e); [P0] 16.4-Consumer-E04 untouched fold start and same-wall-time changed end retain canonical UTC defaults
- `16.4-INT-C06` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:139` (api); [P0] 16.4-INT-C06 checked selected-job dates and true/false/unknown presence never bleed across mixed jobs
- `16.4-INT-C07` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:158` (api); [P0] 16.4-INT-C07 correctly signed obsolete v3 booking proof/receipt rejected by real finalizer
- `16.4-INT-C07` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:158` (api); [P0] 16.4-INT-C07 correctly signed obsolete v3 card proof/receipt rejected by real finalizer
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: crew_size
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: customer_presence_required
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: desired_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: earliest_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: estimated_duration_minutes
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: latest_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: planned_end_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: planned_start_date
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: planned_travel_minutes
- `16.4-INT-C09` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:196` (api); [P0] 16.4-INT-C09 old replay-only finalizer cannot perform a fresh write
- `16.4-INT-C10` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:206` (api); [P0] 16.4-INT-C10 mixed booking facts bind each actual job and selected-pool canonical post-edit occupancy
- `16.4-INT-C11` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:231` (api); [P0] 16.4-INT-C11 card finalizer refuses an evaluated other-job fact change with no derived writes
- `16.4-INT-F01` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:276` (api); [P0] 16.4-INT-F01 valid terminal/centuries planning dates cannot block real booking preview or save
- `16.4-INT-F02` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:288` (api); [P0] 16.4-INT-F02 authentic obsolete receipt refetches; tampered/foreign receipts stay denied without writes
- `16.4-F02` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:123` (unit); [P0][16.4-F02] actual default composition clamps only derived starts and preserves canonical DST fold instants
- `16.4-U05` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:57` (unit); [P0][16.4-U05] earliest bounds suggestions and desired/latest/presence remain distinct per selected job
- `16.4-U06` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:79` (unit); [P0][16.4-U06] stale hint response retains dirty newer draft and immutable uncertain submission
- `[P0][16.4] all nine scheduling facts bind canonical snapshots and per-job overlays` — `tests/unit/server/bookings/job-facts.test.ts:134` (unit); [P0][16.4] all nine scheduling facts bind canonical snapshots and per-job overlays
- `16.4-F04` — `tests/unit/server/bookings/job-scheduling-protocol.test.ts:67` (unit); [P0][16.4-F04] authenticated obsolete receipt refreshes only after request binding; malformed/tampered/foreign receipts remain denied
- `16.4-U11` — `tests/unit/server/bookings/job-scheduling-protocol.test.ts:51` (unit); [P0][16.4-U11] correctly signed and hashed obsolete v3/v1 snapshot is rejected at semantic admission

### 16.4-AC07 — FULL

Real checked selected-job true/false/null presence and mixed-job canonical facts prevent caller/other-job bleed; foreign parent, inconsistent CRM, lead-only booking authority and current changed-presence proof paths are denied without writes. Actual 360x640 E01/E02 shows current false refresh, retained newer draft, honest saved state and durable reload; E03/refetch and Upgrade-E02 transport recovery cover changed-flow failure handling. Exhaustive breadth remains owned release validation.

- `16.4-Consumer-E01` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:106` (e2e); [P0] 16.4-Consumer-E01 actual job entry defaults D120 elapsed; job changes refresh only untouched defaults, and explicit/edit intervals plus distinct hints persist
- `16.4-Consumer-E02` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:181` (e2e); [P0] 16.4-Consumer-E02 actual capacity advice counts candidate once; preview/save/reload stays advisory and stale responses retain the newer draft
- `16.4-Consumer-E03` — `tests/e2e/jobs/job-scheduling-consumers.e2e.spec.ts:279` (e2e); [P0] 16.4-Consumer-E03 actual new defaults follow earliest and CRM clears; delayed options preserve newer job/interval edits
- `16.4-Upgrade-E02` — `tests/e2e/jobs/job-upgrade.e2e.spec.ts:245` (e2e); [P0] 16.4-Upgrade-E02 current lead gains no manager grant; phone response-loss retry keeps state and commits once
- `16.4-INT-C06` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:139` (api); [P0] 16.4-INT-C06 checked selected-job dates and true/false/unknown presence never bleed across mixed jobs
- `16.4-INT-C08` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:174` (api); [P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: customer_presence_required
- `16.4-INT-C10` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:206` (api); [P0] 16.4-INT-C10 mixed booking facts bind each actual job and selected-pool canonical post-edit occupancy
- `16.4-INT-C12` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:246` (api); [P0] 16.4-INT-C12 semantic entry/preview cannot grant foreign-parent or lead-only booking authority
- `16.4-INT-F02` — `tests/integration/commands/job-scheduling-consumers.int.test.ts:288` (api); [P0] 16.4-INT-F02 authentic obsolete receipt refetches; tampered/foreign receipts stay denied without writes
- `16.4-U05` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:57` (unit); [P0][16.4-U05] earliest bounds suggestions and desired/latest/presence remain distinct per selected job
- `16.4-U06` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:79` (unit); [P0][16.4-U06] stale hint response retains dirty newer draft and immutable uncertain submission
- `current hint refresh updates only the matching untouched unsent interval` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:95` (unit); current hint refresh updates only the matching untouched unsent interval
- `unavailable selected job keeps date and honest fallback; defaults preserve fractional instants` — `tests/unit/features/jobs/job-scheduling-consumers.test.ts:111` (unit); unavailable selected job keeps date and honest fallback; defaults preserve fractional instants

### 16.5-AC01 — FULL

FULL development coverage: both real kinds retain stable identity/header and authorized CRM/date/assignment labels; nonmember PL fallback is distinguished from unassigned/read failure and only an independently entitled picker supplies its label. Actual checked composition, structural DTO/serialized absence, current relational root admission and E01/E02 usable overview/member/card/source/upgrade/book entry and persisted reload bind the existing production presentation. Manager versus lead grants and AppShell remain unchanged by the assessed bindings.

- `16.5-UNIT-HEADER-01` — `tests/unit/server/read-models/job-workspace.test.ts:18` (unit); [P0] 16.5-UNIT-HEADER-01 Order and Projekt retain real identity, chips, dates and authorized labels
- `16.5-UNIT-HEADER-02` — `tests/unit/server/read-models/job-workspace.test.ts:26` (unit); [P0] 16.5-UNIT-HEADER-02 assigned nonmember PL is distinct from unassigned and read failure
- `16.5-UNIT-HEADER-03` — `tests/unit/server/read-models/job-workspace.test.ts:35` (unit); [P0] 16.5-UNIT-HEADER-03 only already entitled manager picker supplies a missing PL name; raw fields never escape
- `16.5-INT-01` — `tests/integration/features/jobs/job-workspace.int.test.ts:8` (api); [P0] 16.5-INT-01 real Order/Projekt identity and enriched header survive checked composition
- `16.5-INT-02` — `tests/integration/features/jobs/job-workspace.int.test.ts:27` (api); [P0] 16.5-INT-02 worker forbidden Filer URL falls back without file/picker/directory reads or protected serialization
- `16.5-RLS-01` — `tests/integration/rls/job-workspace.rls.test.ts:7` (api); [P0] 16.5-RLS-01 direct foreign/unrelated/anonymous root and event reads reveal no job data
- `16.5-RLS-03` — `tests/integration/rls/job-workspace.rls.test.ts:53` (api); [P0] 16.5-RLS-03 current relational lead gains only job scope and revoked membership cannot retain a workspace or stale write
- `16.5-D04` — `tests/unit/features/jobs/job-workspace-domain.test.ts:86` (unit); [P1] 16.5-D04 tab URLs preserve the stable job, child selection and unrelated return query without mutating the input
- `16.5-E01` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:175` (e2e); [P0] 16.5-E01 manager desktop keeps real header/overview and all five consumers, shared job file and server-confirmed edit across reload
- `16.5-E02` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:307` (e2e); [P0] 16.5-E02 phone current member reads own booking subset, denied files fall back, and private PL/money/event payloads stay absent

### 16.5-AC02 — FULL

FULL development coverage: real permission matrix and active manifest close the five-tab surface; admitted root precedes independent subordinate readers. Real own-job bookings preserve normal-client RLS subset and manager-only options; files retain job/child owners; explicit safe event columns, exact keys, stable timestamp/id pagination and empty/error distinctions prevent raw metadata/directory reads. Foreign, unrelated, anonymous, other-parent and revoked actor/direct-SQL/stale-write negatives supplement positive current lead/member reads. Essential browser consumers exercise shared job files, bookings, events, work orders and accepted child navigation without new grants or lifecycle actions.

- `16.5-UNIT-EVENTS-01` — `tests/unit/server/read-models/job-events.test.ts:9` (unit); [P0] 16.5-UNIT-EVENTS-01 production event boundary structurally omits private raw fields
- `16.5-UNIT-EVENTS-02` — `tests/unit/server/read-models/job-events.test.ts:41` (unit); [P0] 16.5-UNIT-EVENTS-02 dedicated normal-client reader selects explicit safe columns and scopes/orders real rows
- `16.5-UNIT-EVENTS-03` — `tests/unit/server/read-models/job-events.test.ts:52` (unit); [P1] 16.5-UNIT-EVENTS-03 genuine empty and unavailable remain different without raw error data
- `16.5-UNIT-EVENTS-04` — `tests/unit/server/read-models/job-events.test.ts:61` (unit); [P0] 16.5-UNIT-EVENTS-04 history beyond the API cap retains the true latest upgrade with stable page ordering
- `16.5-INT-02` — `tests/integration/features/jobs/job-workspace.int.test.ts:27` (api); [P0] 16.5-INT-02 worker forbidden Filer URL falls back without file/picker/directory reads or protected serialization
- `16.5-INT-03` — `tests/integration/features/jobs/job-workspace.int.test.ts:62` (api); [P0] 16.5-INT-03 active resources Schema serves actual own-joined bookings without manager options
- `16.5-INT-04` — `tests/integration/features/jobs/job-workspace.int.test.ts:96` (api); [P1] 16.5-INT-04 root read failure stays retryable and invokes no subordinate consumer
- `16.5-RLS-01` — `tests/integration/rls/job-workspace.rls.test.ts:7` (api); [P0] 16.5-RLS-01 direct foreign/unrelated/anonymous root and event reads reveal no job data
- `16.5-RLS-02` — `tests/integration/rls/job-workspace.rls.test.ts:32` (api); [P0] 16.5-RLS-02 foreign or other-parent workOrder URL never crosses the admitted job
- `16.5-RLS-03` — `tests/integration/rls/job-workspace.rls.test.ts:53` (api); [P0] 16.5-RLS-03 current relational lead gains only job scope and revoked membership cannot retain a workspace or stale write
- `16.5-D01` — `tests/unit/features/jobs/job-workspace-domain.test.ts:25` (unit); [P0] 16.5-D01 real matrix and manifest yield five manager tabs and current member/lead subsets without implicit grants
- `16.5-D02` — `tests/unit/features/jobs/job-workspace-domain.test.ts:51` (unit); [P0] 16.5-D02 Schema consumes active E14 resources independently of pending scheduling; inactive owners remove their consumers
- `16.5-D05` — `tests/unit/features/jobs/job-workspace-domain.test.ts:101` (unit); [P0] 16.5-D05 child history restores only visible identities and protects an active draft
- `16.5-E01` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:175` (e2e); [P0] 16.5-E01 manager desktop keeps real header/overview and all five consumers, shared job file and server-confirmed edit across reload
- `16.5-E02` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:307` (e2e); [P0] 16.5-E02 phone current member reads own booking subset, denied files fall back, and private PL/money/event payloads stay absent
- `16.5-E04` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:516` (e2e); [P0] 16.5-E04 two-child back restores identity and files; late real create retains current tab and query
- `16.5-E05` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:613` (e2e); [P0] 16.5-E05 accepted child navigation wins over a late real create completion

### 16.5-AC03 — FULL

FULL development coverage: consumed domain logic bounds unknown/unavailable tabs, preserves legacy workOrder links/stable job/live return queries and protects selected-child drafts. Real desktop and 360x640 keyboard/Mer/history/refresh/document-return journeys, actual empty schedule, protected card/child/file drafts, held late creates/navigation and exact precommit abort demonstrate honest failure/no success/unchanged snapshot, identical-input explicit retry and server-confirmed persistence/reload. Root/event reader unit/API cases distinguish safe unavailable from genuinely empty. Exhaustive visual/manual breadth remains separately deferred release work.

- `16.5-UNIT-EVENTS-03` — `tests/unit/server/read-models/job-events.test.ts:52` (unit); [P1] 16.5-UNIT-EVENTS-03 genuine empty and unavailable remain different without raw error data
- `16.5-INT-04` — `tests/integration/features/jobs/job-workspace.int.test.ts:96` (api); [P1] 16.5-INT-04 root read failure stays retryable and invokes no subordinate consumer
- `16.5-D03` — `tests/unit/features/jobs/job-workspace-domain.test.ts:72` (unit); [P1] 16.5-D03 bounded query selection rejects unknown/unavailable tabs and preserves old workOrder-only links
- `16.5-D04` — `tests/unit/features/jobs/job-workspace-domain.test.ts:86` (unit); [P1] 16.5-D04 tab URLs preserve the stable job, child selection and unrelated return query without mutating the input
- `16.5-D05` — `tests/unit/features/jobs/job-workspace-domain.test.ts:101` (unit); [P0] 16.5-D05 child history restores only visible identities and protects an active draft
- `16.5-D06` — `tests/unit/features/jobs/job-workspace-domain.test.ts:112` (unit); [P1] 16.5-D06 created child adoption preserves the live tab and return query
- `16.5-E01` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:175` (e2e); [P0] 16.5-E01 manager desktop keeps real header/overview and all five consumers, shared job file and server-confirmed edit across reload
- `16.5-E02` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:307` (e2e); [P0] 16.5-E02 phone current member reads own booking subset, denied files fall back, and private PL/money/event payloads stay absent
- `16.5-E03` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:376` (e2e); [P1] 16.5-E03 keyboard/Mer, back/refresh and old document return keep selection and drafts; exact real save failure offers honest retry
- `16.5-E04` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:516` (e2e); [P0] 16.5-E04 two-child back restores identity and files; late real create retains current tab and query
- `16.5-E05` — `tests/e2e/jobs/job-workspace.e2e.spec.ts:613` (e2e); [P0] 16.5-E05 accepted child navigation wins over a late real create completion

## Deferred release validation —14items

All items below are deferred, never executed/passed/waived by this trace. Owners and next actions remain those recorded by each story; root coordinates the ledger. Counts2/3/3/3/3, release_ready=false for all5. Consequential authorization/money/file/persistence/transaction behavior is not deferred.

### 16-1-jobs-depth-activation-container-evolution-and-my-jobs

Record: `_bmad-output/auto-bmad/delivery/16-1-jobs-depth-activation-container-evolution-and-my-jobs.json`, evidence revision`d605295a46634e2c20013638e01c5e2a37ad0779` (historical story-specific revision; not relabelled as current).

- **Exhaustive role/device/browser matrices beyond the four essential Jobs journeys** — deferred; owner: E16 UI/release-validation owner. Next: At release stabilization, the E16 UI/release-validation owner runs the deliberate release_validation=true lane and the tracked full role/device/browser matrix on the qualified final epic candidate, retaining actual results before any release-ready claim.
- **Screenshot comparison, visual inspection, representative manual walkthrough and polish** — deferred; owner: E16 UI/release-validation owner. Next: Before release readiness, the E16 UI/release-validation owner records screenshot comparisons and representative viewport/manual design/accessibility walkthroughs, resolves consequential defects and retains their evidence separately from the development smoke.

### 16-2-job-members-and-per-job-roles-arbetsledare

Record: `_bmad-output/auto-bmad/delivery/16-2-job-members-and-per-job-roles-arbetsledare.json`, evidence revision`65e9111fa4303f87924e84e5e96d220f777f3cfc` (historical story-specific revision; not relabelled as current).

- **Exhaustive browser, role and viewport matrices beyond the essential E01-E05 and existing smoke journeys** — deferred; owner: Kopplas release-validation coordinator; root owns deferred-ledger integration. Next: Before release readiness, the coordinator enumerates and executes the remaining role/viewport/job-kind combinations on a qualified protected runtime, records results and resolves consequential failures in the root-owned release ledger.
- **Screenshot comparisons and visual inspection of the job-members, designation and dates surfaces** — deferred; owner: Kopplas release-validation coordinator; root owns deferred-ledger integration. Next: Before release readiness, capture and inspect the approved responsive states for both job kinds, record comparison evidence and disposition in the release ledger, and obtain any separately required runtime/deployment authorization.
- **Manual walkthroughs and presentation/usability polish beyond the verified essential connected flow** — deferred; owner: Kopplas release-validation coordinator; root owns deferred-ledger integration. Next: Before release readiness, perform the recorded manual keyboard/phone/desktop walkthrough and polish review, attach evidence and resolve or explicitly disposition release issues in the root-owned ledger.

### 16-3-arbetsorder

Record: `_bmad-output/auto-bmad/delivery/16-3-arbetsorder.json`, evidence revision`c44e5179bfcbc210de250eb92a48734561cc0fac` (historical story-specific revision; not relabelled as current).

- **Exhaustive browser, role, viewport and job-kind matrices beyond the essential work-order E01-E05 and existing smoke** — deferred; owner: Kopplas release-validation coordinator; root owns deferred-ledger integration. Next: Before release readiness, enumerate and execute the remaining qualified role/viewport/job-kind matrix, record evidence and resolve consequential failures in the root-owned release ledger.
- **Screenshot comparisons and visual inspection of work-order cards, pane, dependencies and shared Files states** — deferred; owner: Kopplas release-validation coordinator; root owns deferred-ledger integration. Next: Before release readiness, capture and inspect approved responsive states for both job kinds and record comparison evidence/disposition under separately qualified runtime and deployment authorization.
- **Manual keyboard/phone/desktop walkthroughs and presentation/usability polish beyond the essential connected flow** — deferred; owner: Kopplas release-validation coordinator; root owns deferred-ledger integration. Next: Before release readiness, perform the manual responsive/keyboard walkthrough and polish review, attach evidence and resolve or explicitly disposition release issues in the root-owned ledger.

### 16-4-projekt-upgrade-and-job-card-semantics

Record: `_bmad-output/auto-bmad/delivery/16-4-projekt-upgrade-and-job-card-semantics.json`, evidence revision`9d4584f7d86721f07e88a94cf2b15e940a2b7266` (historical story-specific revision; not relabelled as current).

- **Release-only exhaustive browser matrix beyond the seven essential Story16.4 journeys: additional role, viewport and interaction combinations for upgrade/full-card/booking consumers.** — deferred; owner: Epic16 release validation owner (root). Next: At the Epic16 release checkpoint, run the owned optional release-validation browser matrix and record its exact-head results.
- **Release-only screenshot comparison and visual review of full-card, upgrade confirmation and booking consumer presentation across release viewports.** — deferred; owner: Epic16 release validation owner (root). Next: Capture the release-state screenshots, compare the approved design-system layouts and record visual findings and fixes in release validation.
- **Release-only manual walkthrough and presentation polish for the completed card/upgrade/booking flows.** — deferred; owner: Epic16 release validation owner (root). Next: Perform the Epic16 release walkthrough, resolve recorded presentation-polish findings, and attach the manual evidence before release readiness.

### 16-5-job-workspace-shell

Record: `_bmad-output/auto-bmad/delivery/16-5-job-workspace-shell.json`, evidence revision`54ac91ec2c912afe3b6772fcb8daa11fb282d36a` (current reused functional CI revision).

- **Release-only exhaustive role,viewport and browser matrix beyond the five essential workspace journeys and retained smoke, including remaining traceability/navigation permutations.** — deferred; owner: Epic16 release validation owner (root). Next: Run the owned optional Epic16 release-validation matrix on the qualified release head and attach exact results.
- **Release-only screenshot comparison and visual review of workspace header,tabs,panels and dialogs across release viewports.** — deferred; owner: Epic16 release validation owner (root). Next: Capture release-state screenshots,compare the existing design-system layouts and record visual findings before release readiness.
- **Release-only manual connected-field walkthrough and presentation polish of workspace,child/file navigation and explicit retry flows.** — deferred; owner: Epic16 release validation owner (root). Next: Perform the Epic16 release walkthrough,resolve presentation-polish findings and attach manual evidence before release readiness.

## Workflow validation and next actions

Create/BMad-integrated, explicit gate_type=epic/allow_gate=true, deterministic thresholds are resolved without config edits. Primary and allthree context-free workers retain explicit Sol6.1High for sensitive scope. A classified gaps/mapped1–2; B extracted heuristics/live rollup/mapped3–4; C checked statistics/release accounting/mapped5. A/B launched together; C's first dispatch was refused before creation by proven capacity, then accepted after an owned worker completed. All were foreground awaited; no foreign pending actor interrupted. Synthesis and Phase2 waited for all results.

Phase1 matrix is saved both as canonicalcoverage-matrix.json and exact Temp/tea-trace-coverage-matrix-2026-10-20T20-48-01-061Z.json; tempCoverageMatrixPath pins the Phase2 input. Phase2 reread that actual file and applied P0100%,P1target90/min80,overall80, formal-confidence and live-only overlays. Gate-decision.json is schema0.1.0; e2e-trace-summary.json is0.2.0. No manual waiver or fabricated approval. Framework and trace checklist coverage/identity/skip/heuristic/gate-integrity checks completed; stronger release/deployment boilerplate is superseded by the owner development-completion policy. No tests were generated or modified.

Reusable knowledge: priorities,risk/probability-impact,quality,selective testing,fixtures/network/data conventions. Existing installed-library two-gate facts remain: Playwright/Pact flags do not authorize absent-package imports or a framework migration. No new package/provider/broker is used. Existing reviews/native results apply only through recorded source/dependency applicability; no claim to have rerun them.

Next: root continues its separately authorized epicNFR, test-quality/reconciliation and bookkeeping sequence. Remaining release owners execute their14trackedchecks before release readiness; no merge, PR, deployment or release approval follows from this PASS. Only these four epic trace artifacts are repository writes.
