---
stepsCompleted: ['step-01-load-context', 'step-02-define-thresholds', 'step-03-gather-evidence', 'step-04-evaluate-and-score', 'step-04e-aggregate-nfr', 'step-05-generate-report']
lastStep: 'step-05-generate-report'
lastSaved: '2026-10-20'
workflowStatus: 'complete'
workflowType: 'testarch-nfr-assess'
runScope: 'Epic16 advisory NFR audit'
sourceSha: '7b220c5e8fe71a81c00ded9e654e8c5c96c2b878'
evidenceRevision: '54ac91ec2c912afe3b6772fcb8daa11fb282d36a'
inputDocuments:
  - _bmad-output/test-artifacts/test-design-epic-16.md:117-130,320-326
  - _bmad-output/test-artifacts/test-design-architecture.md
  - _bmad-output/test-artifacts/test-design-qa.md
  - _bmad-output/planning-artifacts/prd-phase-b.md:432-489
  - _bmad-output/planning-artifacts/architecture-phase-b.md
  - docs/process/development-completion-policy.md
  - docs/process/agent-model-routing.md
  - scripts/nfr/epic-11-pilot-limits.ts
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json
  - _bmad-output/test-artifacts/epic-16/traceability-matrix.md
---

# Epic16 NFR Evidence Audit

**Date:**2026-10-20. **Mode:**Create. **Overall status: CONCERNS. Overall risk: MEDIUM.**

This advisory audit evaluates existing implementation and native CI evidence. It runs no tests or CI workflows, replaces no trace gate, and authorizes no release/deployment. Development-completion policy governs scope; generic template examples are not new requirements.

## Executive Summary

**17 PASS,14 CONCERNS,0 FAIL across31 domain findings. Critical blockers0; high-priority reachable defects identified0; waivers none.** All four domains have CONCERNS/MEDIUM due incomplete broader measurements or assurance evidence. No new consequential authorization, money/file-disclosure, transaction or persistence defect was identified in the bounded audit.
Known tenant/current-authority, structural omission, rollback, replay/CAS and connected-persistence invariants have current executed evidence. Unknown production targets, Jobs latency/volume, operational controls, coverage/duplication metrics and retry uncertainty remain explicit. Fourteen owned release-only checks remain DEFERRED, unexecuted/unwaived; **release_ready=false**.
Recommendation: retain scoped development proof; give the suggested owners the advisory evidence followups before broader claims. Parent may proceed to separately dispatched test-review; no test-review/reconcile is executed here.

## Scope, Thresholds and Applicability

Source checkpoint:7b220c5e8fe71a81c00ded9e654e8c5c96c2b878. Actual functional/test revision:54ac91ec2c912afe3b6772fcb8daa11fb282d36a; [CI39490485088](https://github.com/rthunborg/Kopplas/actions/runs/39490485088). Functional/source/test/dependency/config/SQL applicability is unchanged to this checkpoint;25nonmetadata terminal inventory bindings matched. Earlier story1-4 delivery receipts stay historical; current global CI qualifies their changed consumer seams.
Threshold priority: Epic16 test-design, current Phase B PRD/architecture, then approved scoped pilot code. UNKNOWN targets/evidence mean CONCERNS. No guessed SLA, throughput, retry count or monitoring framework. Branch target80% applies if instrumented; no report supplied. Generic coverage>=80% and duplication<5% are advisory, unmeasured references and add no dependency or gate.
Formal trace36/36AC FULL(29P0/7P1),TR01-16,269deduplicated anchors/52files is requirements coverage, not line/branch coverage. Current33browser cases are26Jobs+7auth; alias anchors do not increase execution counts.

### Reused Native Evidence

- **verify:** 2740/2740 units,100suites,0fail/skip;43process;TSC/lint/productionbuild/frozenlock/containment passed; high dependency gate passed with TWO MODERATE advisories.
  - Path: C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log
  - SHA256: 24FBA4F37AEA028DD760FE599B724701DB31B57C3FE9DBD6DB276A6E6312A004
- **integration:** 1880total,1879pass,0fail,1ordinary physical-recovery pending/skipped;SUPABASE_TEST_REQUIRED=1.
  - Path: C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json
  - SHA256: 028E6DC91A52DC12CCB73B7A1EBD20FE71A1C436F2740671EE736EA35EF46D6E
- **recovery:** Separate isolated Storage physical recovery1/1pass,0skip; ordinary skip is not relabelled.
  - Path: C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-recovery-native/isolated-storage-recovery.json
  - SHA256: C2D82E2C9DC1EF156656C14CD079A129042A0C375EE881FBE99A62B7C31E4A78
- **browser:** 33completed passes:31first-attempt+2fullretries;native expected31/flaky2/unexpected0/skipped0;all5workspace first-attempt.
  - Path: C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-browser-native/general-browser.json
  - SHA256: C08263B31221E0BB82649DF83BF7E7B98B85DD2A6FF6AAAF5F5844790094E1F0
- **db:** Approved RBAC pilot5warmups/25measurements;readp95=7.985169000000042ms;bulkpermissionsp95=2.968015999999807ms;2authenticated requests/read.
  - Path: C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-db.log
  - SHA256: 99A4E7E12FE4F300CE744861EBECAF599EDE547A4FF75A6185AF6FB2661048CD

Terminal inventory:C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-5-review-dgnle5ul/terminal-done-inventory.json;SHA256 6A69A16F62DEC69DF7271BE5355787464E46EA7BD677043B2D7AD83140A6B6C8.

### Retry Qualification and Failure History

33complete passes=31first-attempt+2fullretries; native expected31/flaky2/unexpected0/skipped0. All5workspace journeys first-attempt. First16.1-E03 response-body lookup failure cause is unknown. First16.3-E01 observed auditdelta0 after HTTP200 before confirmed save: first action outcome/timing unresolved; HTTP200 is not application success and pure observer cause is not proven. Full original retries passed. Independent High found no concrete audit bypass and accepted qualified evidence only. Historical failed CI attempts remain failures; no first-pass-clean, zero-flakiness or functional-waiver claim.
Qualification:C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-5-review-dgnle5ul/seventh-retry-independent-qualification.md;SHA256 F7731A4CEB1F4D01B01594DACB1059EE26BA0377DF2523E8ED01377EB6F1425D.

## Security Assessment

**CONCERNS;MEDIUM risk.** 8PASS/3CONCERNS/0FAIL.

### E16-SEC-01: Authentication and authorization: tenant/job/child boundaries

- **Status:** PASS
- **Threshold:** NFR42/43: zero unauthorized command, tenant row, parent or child access across the approved negative pairs.
- **Actual:** All 13 assertions in the four directly inspected RLS files passed in current applicable native CI; inspected assertions discriminate permitted and denied actors and compare hidden identifiers/payloads.
- **Finding:** Normal authenticated JWT and anonymous negative pairs exercise actual tenant/job RLS, seeded roles and independent role unions. Membership alone and work-order assignment alone grant no wider job access; foreign, unrelated and wrong-parent workspace/child URLs return no protected rows or identities. Manager, designated lead and ordinary member capabilities remain distinct.
- **Owner:** Epic16 implementation/security owner
- **Next action:** Retain these normal-JWT and direct-SQL negative pairs for future boundary changes; no corrective action identified.
- **Evidence:**
  - tests/integration/rls/jobs-depth.rls.test.ts:7,45,110
  - tests/integration/rls/job-members.rls.test.ts:9,69
  - tests/integration/rls/work-orders.rls.test.ts:10,75,125
  - tests/integration/rls/job-workspace.rls.test.ts:7,32
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json: jobs-depth.rls 4/4, job-members.rls 3/3, work-orders.rls 3/3, job-workspace.rls 3/3 assertions passed, no pending in these files

### E16-SEC-02: Authorization freshness and profile eligibility

- **Status:** PASS
- **Threshold:** NFR42/43: zero authority retained from revoked membership/role/designation or ineligible profile; authoritative current SQL facts decide checked access.
- **Actual:** Native mapped current-authority scenarios passed. Inspected member negatives require 42501 and unchanged state apart from the deliberate external authority update; upgrade replay with the same revoked JWT is denied.
- **Finding:** Evidence checks current role, membership, designation, target eligibility and profile archival, including existing JWT reuse and replay after revocation. Profileless independently authorized Admin/PL retain intended manager rights. This finding evaluates current-authority security; the reliability worker owns the detailed race/atomicity assessment.
- **Owner:** Epic16 implementation/security owner
- **Next action:** Preserve the current-facts checks and profileless-manager positive control; no new broader review round required for unchanged source.
- **Evidence:**
  - tests/integration/commands/job-members.int.test.ts:200,264
  - tests/integration/commands/work-orders.int.test.ts:56,291
  - tests/integration/commands/job-upgrade.int.test.ts:86,116
  - tests/integration/rls/job-workspace.rls.test.ts:53
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json: job-members command 15/15, work-orders command 25/25, job-upgrade command 7/7 passed

### E16-SEC-03: Data protection: structural projection and disclosure

- **Status:** PASS
- **Threshold:** NFR44: zero protected keys or values in unentitled server DTOs or serialized UI payloads; safe event output only id/type/time.
- **Actual:** Inspected assertions verify exact member/event key sets and forbidden serialized values, prevent forbidden directory/file/picker reads, and distinguish independently entitled money positives from lead-only negatives. Current mapped unit/integration/browser evidence passed.
- **Finding:** Money remains independently entitled; designation adds no financial grant. Work-order, member, workspace header and event projections omit money/auth/private-person/raw-event fields structurally. Hidden prerequisites remain anonymous unknowns without leaking IDs, dates or labels. A nonmember responsible PL uses an unavailable-name state unless an already entitled projection supplies a label.
- **Owner:** Epic16 read-model/security owner
- **Next action:** Retain exact-key and serialized-value assertions when projections change; no disclosure bypass identified.
- **Evidence:**
  - tests/integration/rls/job-members.rls.test.ts:9
  - tests/integration/rls/work-orders.rls.test.ts:10,75
  - tests/integration/features/jobs/job-workspace.int.test.ts:27
  - tests/unit/server/read-models/job-events.test.ts:9,41,52
  - tests/unit/server/read-models/job-workspace.test.ts:26,35
  - tests/e2e/jobs/job-workspace.e2e.spec.ts:307; current native 16.5-E02 first-attempt pass
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:2740 unit tests passed, zero skips

### E16-SEC-04: Private files: independent rights, source graph and Storage

- **Status:** PASS
- **Threshold:** NFR42/43/44: zero unauthorized private bytes, signed URL, lifecycle hints, protected metadata or child/parent substitution; selected proof binds tenant/owner/link/file/object identity and purpose.
- **Actual:** All 14 current native file assertions passed; bounded inspection confirmed real normal-JWT consumer/Storage calls, positive byte readback, denied requests without URL/data/audit side effects, and exact proof binding negative pairs.
- **Finding:** Actual shared upload/link/generic-sign/selected-link/context/lifecycle consumers require independent Files rights plus current child and parent source eligibility. Lead/member/assignee status does not grant Files. Foreign/type/link/wrong-owner/archived-parent substitutions fail. Direct authenticated known-path Storage downloads are tested separately from signing wrappers, including invalid alternate sources and foreign-present versus absent indistinguishability.
- **Owner:** Epic16 Files/security owner
- **Next action:** Preserve independent source/parent/Files checks for every access path; no new bucket, purpose, key or scan gate is requested.
- **Evidence:**
  - tests/integration/commands/work-order-files.int.test.ts:61,107,172,237,269,301
  - tests/unit/server/storage/document-signed-access-attestation.test.ts:194 and following bound-identity/purpose negatives
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json: work-order-files 14/14 passed, no skipped/pending assertions

### E16-SEC-05: Signed proof boundaries and authoritative facts

- **Status:** PASS
- **Threshold:** No cross-domain, obsolete-version, changed-authority/job-facts proof accepted; retain existing two-minute SQL proof ceiling.
- **Actual:** Inspected signatures fail cross-domain or changed actor/output checks; current mapped native finalizer negatives passed. Bounded SQL inspection shows expires<=issued and expires>issued+interval '2 minutes' rejection with current expiry checks. No new expiry experiment was executed.
- **Finding:** Job-card and booking signatures remain domain separated; correctly signed obsolete facts/versions are rejected by real finalizers. The existing SQL two-minute ceiling is retained rather than replaced with an invented TTL.
- **Owner:** Epic16 command/security owner
- **Next action:** Retain existing proof binding/current-facts/lifetime contract; no TTL change or new broad review requested.
- **Evidence:**
  - tests/unit/server/commands/job-card-validation.test.ts:28
  - tests/integration/commands/job-booking-facts.int.test.ts:29,81
  - tests/integration/commands/job-scheduling-consumers.int.test.ts:158
  - supabase/migrations/20261020210000_e16_16_4_job_upgrade_and_scheduling.sql:108,122,239
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json: mapped native passed proof/current-facts anchors

### E16-SEC-06: API/privileged entrypoints and client secret containment

- **Status:** PASS
- **Threshold:** Zero client service-role exposure or unauthenticated privileged capability; checked SQL cannot be bypassed through direct grants/private helpers.
- **Actual:** Current native RLS tests inspect hardened empty search_path and effective grants, attempt denied helper calls as authenticated, and verify forced/enabled RLS. Both actual source and built .next containment guards passed. Reused unchanged independent High review reported no findings.
- **Finding:** Checked entrypoints are explicitly hardened and deny anonymous execution; private primitives refuse authenticated execution and new child tables enforce RLS with no direct mutation grants. Existing source and production-bundle guards passed for service-role exposure. This is bounded privileged-boundary evidence, not certification that all secrets or all API risks were scanned.
- **Owner:** Epic16 security owner
- **Next action:** Keep source and bundle guards plus effective-grant/direct-call negatives; no concrete bypass identified.
- **Evidence:**
  - tests/integration/rls/jobs-depth.rls.test.ts:74
  - tests/integration/rls/job-members.rls.test.ts:130
  - tests/integration/rls/work-orders.rls.test.ts:125
  - tests/unit/scripts/verify/jobs-service-role-containment.test.ts:8
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:296,18850
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-5-review-dgnle5ul/security.review.md: No findings

### E16-SEC-07: Active scope and allowed consumers

- **Status:** PASS
- **Threshold:** NFR51/FR129: only active, manifest-enrolled live surfaces; no Phase C/pending consumer or new authorization grant.
- **Actual:** Current mapped scope/H4/exact-policy unit and integration evidence passed; inspected domain cases remove consumers when owners become pending and distinguish manager/member/lead tab sets without granting access.
- **Finding:** Job surfaces and child ownership remain jobs-enrolled; workspace consumers follow active manifest modules and independent capabilities. Schema uses active resources, while pending scheduling gains no surface or implicit grant. Phase C/pending surfaces are guarded by manifest and scope tests.
- **Owner:** Epic16 scope owner
- **Next action:** Preserve manifest-derived gates on later activation changes; no scope defect identified.
- **Evidence:**
  - tests/unit/features/jobs/job-workspace-domain.test.ts:25,51
  - tests/unit/scope/manifest-coherence.test.ts:91
  - tests/unit/scope/manifest-derivations.test.ts:159
  - tests/unit/guardrails/job-non-scope.test.ts:116
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json:16.1-AC11 24 mapped anchors; current unit/native RLS inventory evidence

### E16-SEC-08: Input validation: approved Jobs command boundary

- **Status:** PASS
- **Threshold:** Zero caller-controlled tenant/actor/protected-field elevation or malformed child/foreign-parent substitution accepted through the approved command paths.
- **Actual:** Inspected unit cases reject unsupported privileged keys without coercion; actual normal-JWT SQL negatives and independent composite-FK 23503 controls passed. No generalized SQLi/XSS/CSRF claim follows from this evidence.
- **Finding:** Closed job-card validation rejects injected actor/tenant/money/identity fields and malformed child/date inputs. Direct checked RPC and relational-constraint negatives remain independent of TypeScript wrappers. This finding covers the approved command shape and substitution boundary only.
- **Owner:** Epic16 command/security owner
- **Next action:** Retain closed validators and below-wrapper negatives; broader web security remains separately unmeasured.
- **Evidence:**
  - tests/unit/server/commands/job-card-validation.test.ts:9
  - tests/integration/rls/jobs-depth.rls.test.ts:45
  - tests/integration/rls/job-members.rls.test.ts:69
  - tests/integration/rls/work-orders.rls.test.ts:125
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log and integration-native/full-integration.json: mapped assertions passed

### E16-SEC-09: Authentication/session and deployed encryption breadth

- **Status:** CONCERNS
- **Threshold:** UNKNOWN for broad deployed MFA/session/encryption controls in this bounded Epic16 assessment.
- **Actual:** Not measured or inspected; no deployment/provider/session/secret access was performed and no missing implementation or reachable defect is asserted.
- **Finding:** The supplied Epic16 evidence does not establish current deployed MFA/session lifecycle, TLS configuration, encryption at rest/database/key settings or operational credential revocation posture. Tenant/profile revocation controls above are verified but do not prove these broader controls.
- **Owner:** Platform/security operations owner
- **Next action:** If broader operational assurance is required, define its applicable target and retain qualified existing configuration/operational evidence under a separately authorized assessment. Advisory evidence gap; not a new Epic16 development gate.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-context-2026-10-20T21-04-49-580Z.json: no approved measured deployment/security-operations baseline
  - .agents/skills/bmad-testarch-nfr/steps-c/nfr-status-definitions.md: UNKNOWN evidence must be CONCERNS

### E16-SEC-10: Web/API security breadth

- **Status:** CONCERNS
- **Threshold:** UNKNOWN for comprehensive web/API attack coverage and operational rate-limit/CORS/header targets.
- **Actual:** No new dynamic scan or broad source audit executed. Existing CI contains security-header/containment checks, but this assessment does not inflate them into all-endpoint assurance.
- **Finding:** Bounded command validation and authorization evidence do not constitute a comprehensive XSS/CSRF/SQL-injection penetration assessment, nor establish rate-limit, CORS and deployed header effectiveness for every endpoint.
- **Owner:** Platform/application security owner
- **Next action:** Keep the verified scoped controls; define and collect broader threat/control evidence only when separately required. This is advisory and does not invent an OWASP scan gate or a concrete vulnerability.
- **Evidence:**
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json: contract_static acceptance coverage only
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log: actual CI checks, not a penetration-test report

### E16-SEC-11: Secrets management and supply-chain assurance breadth

- **Status:** CONCERNS
- **Threshold:** Existing dependency gate: no high/critical accepted by pnpm audit --audit-level=high; broader operational rotation/key-management/secret-scan target UNKNOWN.
- **Actual:** Existing CI high-level dependency gate passed with two moderate advisories, not zero vulnerabilities. No new scan, credential/key inspection or rotation occurred. No Epic16-reachable exploit is identified from the moderate summary.
- **Finding:** Source/bundle service-role containment and proof binding are evidenced, while operational rotation/key-management and comprehensive secret scanning are unmeasured here. The actual dependency gate must be described by its real threshold and retained advisory result.
- **Owner:** Platform security/dependency owner
- **Next action:** Retain the two moderate advisory facts and use the existing dependency triage process; separately record operational key/rotation evidence if required. No new mandatory scan or legal program is introduced.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:266-279 pnpm audit --audit-level=high completed with two moderate vulnerabilities
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:296,18850 containment passed

## Performance Assessment

**CONCERNS;MEDIUM risk.** 1PASS/4CONCERNS/0FAIL.

### PERF-16-01: Scoped local RBAC pilot

- **Status:** PASS
- **Threshold:** {
  "scope": "Local admin-users projection and synthetic effective-permissions calculation; not Jobs or a full-page target",
  "tenantAActiveMemberships": 120,
  "tenantBActiveMemberships": 24,
  "readP95Ms_lte": 250,
  "syntheticBulkEffectivePermissionsP95Ms_lte": 25,
  "authenticatedRlsRequestsPerRead_lte": 3,
  "source": "scripts/nfr/epic-11-pilot-limits.ts:3-9"
}
- **Actual:** {
  "tenantAActiveMemberships": 120,
  "tenantBActiveMemberships": 24,
  "tenantARoleDistribution": "Five primary roles; every third membership also holds the next role",
  "tenantBShape": "Separate tenant rows for 23 of the same authenticated accounts plus its own admin",
  "warmupIterations": 5,
  "measuredIterations": 25,
  "readP95Ms": 7.985169000000042,
  "syntheticBulkEffectivePermissionsP95Ms": 2.968015999999807,
  "authenticatedRlsRequestsPerRead": 2,
  "authenticatedRlsRequestsTotal": 50,
  "membershipPages": 25,
  "rolePages": 25,
  "effectivePermissionGrantCount": 2984,
  "gate_result": "The script rejects fixture drift and any breached ceiling; the native log completes its output and proceeds to the next CI step without a pilot gate failure."
}
- **Finding:** The existing local Epic 11 admin-users/RBAC pilot meets its approved read, CPU-only bulk calculation and authenticated request ceilings at the exact approved two-tenant fixture profile. This result applies only to those measured functions.
- **Owner:** Existing RBAC pilot maintainer / performance executor
- **Next action:** Retain this scoped regression baseline. Do not relabel it as Jobs latency, full-page response time, production load, throughput or CPU utilization evidence.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-db.log:1900-1990; complete pilot output inspected, SHA256 verified
  - scripts/nfr/epic-11-r1108-baseline.ts:149-156 exact-profile admission
  - scripts/nfr/epic-11-r1108-baseline.ts:179-208 actual authenticated admin-users reader, 5 warmups, 25 measured samples and ceiling assessment
  - scripts/nfr/epic-11-r1108-baseline.ts:250-262 documented metric exclusions and failed-assessment throw

### PERF-16-02: Jobs response times and representative volume

- **Status:** CONCERNS
- **Threshold:** UNKNOWN: numeric Jobs assigned-list/facts/save latency and representative volume; explicitly unresolved in approved Epic 16 plan
- **Actual:** UNKNOWN: no current target-matched Jobs latency/volume baseline supplied. The existing 1003-event paging regression proves completeness only. Generic template examples and unrelated authentication baselines are not accepted Jobs targets.
- **Finding:** Epic 16 assigned-list, complete facts and save latency have no accepted numeric target or representative Jobs-volume profile. Existing functional and paging-completeness evidence cannot establish response-time compliance.
- **Owner:** Architect/product and performance executor
- **Next action:** Before a Jobs performance claim, agree the representative assigned-job/facts/events/save profile and acceptance targets, then capture environment, query plans, roundtrips and latency using the authorized existing execution lane. No new load dependency is allocated.
- **Evidence:**
  - _bmad-output/test-artifacts/test-design-epic-16.md:112 risk R16-14: score 4, no approved job-specific latency/volume threshold; architect/product plus executor own the follow-up
  - _bmad-output/test-artifacts/test-design-epic-16.md:128 performance/scalability: declared-volume baseline, query plans, roundtrips and environment required; numeric latency/volume UNKNOWN
  - _bmad-output/test-artifacts/test-design-epic-16.md:320,326 P2 informational targets cannot convert UNKNOWN performance into PASS
  - C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-context-2026-10-20T21-04-49-580Z.json: nfr_thresholds.performance.epic16_job_latency_volume
  - _bmad-output/planning-artifacts/prd.md:488-490 frozen NFR24 qualitative pilot responsiveness; NFR25 explicit completion/failure status for waits; NFR26 beyond-pilot targets deferred until External Beta sizing. No numeric Jobs threshold.

### PERF-16-03: Throughput and concurrent capacity

- **Status:** CONCERNS
- **Threshold:** UNKNOWN: accepted Jobs/production requests-per-second and concurrency targets
- **Actual:** UNKNOWN: no target-matched throughput or concurrency measurements supplied. Twenty-five serial pilot samples are not a load test.
- **Finding:** The serial local RBAC pilot does not measure Jobs requests per second, concurrent users, sustained load or production database capacity.
- **Owner:** Architect/product and performance executor
- **Next action:** Define capacity expectations and representative concurrency if a production performance claim is required; measure that approved profile before making the claim. Missing evidence remains advisory CONCERNS, not an inferred functional failure.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-context-2026-10-20T21-04-49-580Z.json: nfr_thresholds.performance.production_throughput_cpu_memory
  - scripts/nfr/epic-11-r1108-baseline.ts:190-203 serial measured read and synthetic calculation loop
  - scripts/nfr/epic-11-r1108-baseline.ts:252-256 local-only pilot and full-page/production-load exclusions
  - _bmad-output/planning-artifacts/prd.md:490 NFR26 defers beyond-pilot performance targets pending External Beta sizing

### PERF-16-04: Resource usage

- **Status:** CONCERNS
- **Threshold:** UNKNOWN: CPU utilization, memory and database connection-pool capacity targets
- **Actual:** UNKNOWN: sustained CPU/memory/pool usage under a representative Jobs workload
- **Finding:** No accepted Jobs/production CPU, memory or connection-pool target and measurement was supplied. A CPU-only calculation duration does not report CPU utilization or memory capacity.
- **Owner:** Architect/product and performance executor
- **Next action:** Decide the resource dimensions needed for the approved Jobs profile and collect corresponding measurements before capacity claims. No service, cache or infrastructure change is justified by the present evidence alone.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-context-2026-10-20T21-04-49-580Z.json: nfr_thresholds.performance.production_throughput_cpu_memory
  - scripts/nfr/epic-11-r1108-baseline.ts:196-202 synthetic CPU-only effective-permissions duration scope
  - _bmad-output/test-artifacts/test-design-epic-16.md:128,326 unresolved performance target

### PERF-16-05: Optimization and Jobs query cost

- **Status:** CONCERNS
- **Threshold:** UNKNOWN: accepted Jobs query-cost/roundtrip baseline at representative volume; no caching/CDN/lazy-loading requirement established by the supplied performance contract
- **Actual:** Scoped RBAC roundtrips meet their known ceiling; target-matched Jobs optimization evidence is UNKNOWN
- **Finding:** The approved plan asks for declared-volume query-plan/roundtrip evidence for assigned-list/facts/save. The RBAC pilot only bounds its own two authenticated requests and writes a tenant-membership plan; it cannot qualify Jobs query cost or establish a need for caching, CDN or new services.
- **Owner:** Architect/product and performance executor
- **Next action:** Inspect Jobs query plans and roundtrips as part of the agreed representative baseline; propose proportionate optimization only if measured evidence identifies an actual need.
- **Evidence:**
  - _bmad-output/test-artifacts/test-design-epic-16.md:112,128 R16-14 declared-volume/query-plan/roundtrip follow-up
  - scripts/nfr/epic-11-r1108-baseline.ts:211-218 tenant-membership-only EXPLAIN
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-db.log:1982-1987 scoped measured request counter

## Reliability Assessment

**CONCERNS;MEDIUM risk.** 4PASS/3CONCERNS/0FAIL.

### REL16-01: Fault atomicity and audited outcomes

- **Status:** PASS
- **Threshold:** NFR20 and NFR23 carried into Phase B; zero partial state under failure and audited attributable corrections; Epic16 AC atomicity contracts.
- **Actual:** Native required integration lane: 1880 total, 1879 passed, zero failed, one ordinary physical-recovery case skipped and separately executed 1/1 with zero skips. Relevant 16.1-INT-001/002, 16.2-INT-006 audit fault, 16.3-INT-005/007 and 16.4-INT-U03 passed. Actual assertions compare durable snapshots around rejected audit writes and check one audit/event after retry.
- **Finding:** Scoped job/member/work-order/upgrade fault injection demonstrates whole-snapshot rollback and one attributable committed outcome on exact retry; no partial business, event, request-outcome or audit state is evidenced.
- **Owner:** Epic16 implementation owner
- **Next action:** Retain the exact-revision native receipts and the distinct ordinary-skip/separate-recovery accounting in the advisory report.
- **Evidence:**
  - _bmad-output/planning-artifacts/prd.md:481,484
  - _bmad-output/planning-artifacts/prd-phase-b.md:432
  - tests/integration/commands/job-members.int.test.ts:244
  - tests/integration/commands/work-orders.int.test.ts:335
  - tests/integration/commands/job-upgrade.int.test.ts:71
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-db.log: SUPABASE_TEST_REQUIRED=1

### REL16-02: Current authority after lock wait and replay

- **Status:** PASS
- **Threshold:** Zero stale-authority mutation, duplicate audit or partial result after lock wait/replay; AC16.2-07, AC16.3-04, AC16.4-02.
- **Actual:** All native 16.2-INT-006 actor/target variants, 16.3-INT-006 locked-fact variants and 16.4-INT-U05 role-revoked/parent-archived variants passed. 16.2 assertions await the tenant-gate wait, apply explicit competing state changes and compare the final snapshot with only that external change. Replay authority is covered by 16.2-INT-005, 16.3-INT-004/009 and 16.4-INT-U04.
- **Finding:** Observed lock-wait tests judge current actor, target and parent facts after concurrent revocation or replacement and conserve the externally committed state on denial.
- **Owner:** Epic16 implementation owner
- **Next action:** Keep current-authority and lock-wait cases mandatory when these transaction boundaries change.
- **Evidence:**
  - tests/integration/commands/job-members.int.test.ts:149,200
  - tests/integration/commands/work-orders.int.test.ts:208,411
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json:16.2-AC07,16.3-AC04,16.4-AC02
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json

### REL16-03: Exact retry, CAS and uncertain-response recovery

- **Status:** PASS
- **Threshold:** Stable command/input identity; current-state CAS; no duplicate outcome under concurrency/response loss; fresh explicit consent after definitively uncommitted stale create.
- **Actual:** Native 16.2-INT-002/005, 16.3-INT-004/008/009/010 and 16.4-INT-U02 passed. 16.3-INT-009 asserts original identity after an intervening edit, one child and audit, refusal of changed input and no replay after authority removal. Native 16.3-E02/E04/E05 and 16.4-Upgrade-E02/E03 passed first attempt; exact transport interception forwards the real action before losing its response.
- **Finding:** Exact retries preserve original request identity and outcome; changed payloads or stale baselines cannot overwrite intervening state. Lost create reconciliation recovers the original child without consuming a newer draft or creating another audit.
- **Owner:** Epic16 implementation owner
- **Next action:** Preserve explicit retry/refetch and immutable submitted identity; do not introduce automatic resubmission from a changed draft.
- **Evidence:**
  - tests/integration/commands/work-orders.int.test.ts:411
  - tests/e2e/jobs/work-orders.e2e.spec.ts:160,316,378
  - tests/unit/features/jobs/job-card-validation.test.ts:100
  - tests/unit/features/jobs/job-members-domain.test.ts:110,126,165
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-browser-native/general-browser.json

### REL16-04: Connected phone failure and persistence semantics

- **Status:** PASS
- **Threshold:** ADR-B009/NFR53 and Epic16 connected-web ACs; explicit failure/retry, retained unsent state, server-confirmed persistence; no durable offline infrastructure.
- **Actual:** 16.1-E02, 16.2-E02/E04/E05, 16.3-E02/E04/E05 and 16.4 retry/refetch smoke passed first attempt. All five 16.5 workspace cases passed first attempt. Targeted 16.3-E02 assertions prove real upstream commit, failed response, no success announcement, exact retried input, unchanged durable snapshot and retained newer title. 16.5-E03 proves no state after pre-persistence abort, honest alert, retained draft, exact retry, persisted title and reload.
- **Finding:** Essential connected 360x640 flows preserve visible unsent input, expose reachable explicit retry/refetch, keep newer edits during delayed completions and announce success only after actual server persistence.
- **Owner:** Epic16 implementation owner
- **Next action:** Retain scoped essential-smoke evidence; leave the 14 tracked breadth/visual/manual release checks deferred with owners and next actions. They are neither passed nor waived, and are not missing development checks.
- **Evidence:**
  - tests/e2e/jobs/jobs-depth.e2e.spec.ts:171
  - tests/e2e/jobs/work-orders.e2e.spec.ts:160
  - tests/e2e/jobs/job-workspace.e2e.spec.ts:376
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json:16.1-AC05,16.2-AC08,16.3-AC07,16.5-AC03
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-browser-native/general-browser.json

### REL16-05: Retained browser retry evidence qualification

- **Status:** CONCERNS
- **Threshold:** Current essential smoke must demonstrate the full usable/integrity journey; retry evidence must retain failed attempts and explain its limits rather than claim first-pass success or waive an integrity failure.
- **Actual:** Native browser report records 33 cases:31 first-attempt passes, two passed on retry, zero unexpected failures/skips. 16.1-E03 initially failed retrieving Chromium response body; precise cause unknown. 16.3-E01 initially observed audit delta zero before confirmed-save feedback; HTTP200 does not prove application success and first action outcome/timing remain unresolved. Pure observer instability is not proven. Complete retries passed; checked transaction/success path exposed no identified audit bypass. Qualification is acceptable with retained uncertainty, not first-pass-clean or a waiver.
- **Finding:** Complete retry journeys passed and independent High review found no identified consequential production defect, but first-attempt cause and outcome uncertainty remain visible reliability caveats.
- **Owner:** Epic16 QA/verification owner
- **Next action:** Carry both failed attempts and the independent qualification into final evidence. On a future authorized relevant run retain action result, durable outcome and timing diagnostics if either recurs; do not invent a production defect or relabel the initial audit observation as proven harmless.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-browser-native/general-browser.json
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-16-5-review-dgnle5ul/seventh-retry-independent-qualification.md
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json:execution_caveats

### REL16-06: Availability, error rate and operational incident recovery

- **Status:** CONCERNS
- **Threshold:** UNKNOWN: approved availability/SLA, acceptable operational error rate and MTTR; no generic numeric target is adopted.
- **Actual:** Existing native tests establish bounded functional integrity under tested faults, not uptime history or production error/incident recovery measurements. No measured operational baseline was supplied in the scoped evidence.
- **Finding:** Operational reliability cannot be scored as meeting a production objective because Epic16 availability, error-rate and MTTR thresholds and measurements are UNKNOWN.
- **Owner:** Product owner and operations owner
- **Next action:** Define applicable production service/error/incident targets and retain measured operational evidence in the authorized release/operations lane; this advisory does not initiate deployment or new infrastructure.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-context-2026-10-20T21-04-49-580Z.json:nfr_thresholds.reliability
  - _bmad-output/planning-artifacts/prd.md:481,484,488,490
  - .agents/skills/bmad-testarch-nfr/steps-c/nfr-status-definitions.md

### REL16-07: Operational observability and service fault tolerance

- **Status:** CONCERNS
- **Threshold:** UNKNOWN: operational telemetry/alerting and production service-failover targets. Scoped audited-command and explicit user retry requirements are known and covered separately.
- **Actual:** Transaction/audit fault and retry tests passed. Native reports do not demonstrate production monitoring, alert routing, availability under service loss or measured failover. A generic skill checklist is not authorization or a requirement for a new health endpoint, circuit breaker or three automatic retries.
- **Finding:** Audited command outcomes and explicit user-driven recovery have evidence; production error tracking, alerting and service-failover behavior are not established by these receipts.
- **Owner:** Operations owner
- **Next action:** Reconcile production monitoring and service-failover evidence against owner-approved targets in the authorized operational readiness assessment, retaining UNKNOWN until measured.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-context-2026-10-20T21-04-49-580Z.json:nfr_thresholds.reliability.production_failover,adr8_additional.monitorability
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-integration-native/full-integration.json
  - .agents/skills/bmad-testarch-nfr/steps-c/step-04c-subagent-reliability.md

## Maintainability Assessment

**CONCERNS;MEDIUM risk.** 4PASS/4CONCERNS/0FAIL.

### M16-01: Headless separation

- **Status:** PASS
- **Threshold:** Owner-authorized proportional domain/state/validation/actions/semantic DTO separation; no generic framework required.
- **Actual:** job-members-domain contains closed validators and immutable draft transitions; job-workspace-domain contains tab/query/child navigation behavior; actions.ts delegates writes through the existing command envelope; job-workspace.ts composes a typed header with explicit assignment states. Current author review orders bind these seams to real consumers and unit/API/browser cases.
- **Finding:** Existing reviewed implementation separates pure job validation/draft transitions and bounded workspace selection from server actions, semantic read DTOs and replaceable usable presentation.
- **Owner:** Jobs implementation maintainer
- **Next action:** Preserve these seams during changes; use targeted reviewed refactoring only for a concrete maintenance problem.
- **Evidence:**
  - src/features/jobs/job-members-domain.ts:1-79
  - src/features/jobs/job-workspace-domain.ts:1-43
  - src/features/jobs/actions.ts:22-30
  - src/server/read-models/job-workspace.ts:12-46
  - _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md:308
  - _bmad-output/implementation-artifacts/spec-16-4-projekt-upgrade-and-job-card-semantics-2.md:422
  - _bmad-output/implementation-artifacts/spec-16-2-job-members-and-per-job-roles-arbetsledare-2.md:346

### M16-02: Requirements coverage and regression evidence

- **Status:** PASS
- **Threshold:** All 36 approved development ACs and retained transfer obligations have source-backed appropriate evidence.
- **Actual:** 36/36 FULL (29 P0,7 P1);269 unique static anchors across52files (88unit,155API/RLS,26Jobs E2E). Existing CI2740unit passes/0skip plus43process checks; required DB1879passes/1ordinary recovery pending plus separate direct recovery1pass; browser33complete passes=31first+2qualified full retries; all5workspace first attempt. All5 post-development automation mappings have0gaps/0newtests per supplied current reconciliation.
- **Finding:** Current trace supplies complete approved development requirement coverage with actual applicable execution; this is not a code-coverage metric.
- **Owner:** Epic16 test maintainer
- **Next action:** Retain exact native/revision provenance, the ordinary recovery pending distinction and both qualified retry histories. Preserve unresolved first16.1-E03 response-body cause and16.3-E01 audit-zero action outcome/timing; no audit bypass is identified. Fourteen owned release breadth/visual/manual items remain deferred, not waived or newly blocking development.
- **Evidence:**
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json
  - _bmad-output/test-artifacts/epic-16/traceability-matrix.md:29-46
  - _bmad-output/test-artifacts/epic-16/traceability-matrix.md:114-126
  - _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md:290-296

### M16-03: Measured test coverage and trend

- **Status:** CONCERNS
- **Threshold:** Changed-domain branch target>=80% IF instrumented (test-design-epic-16:321); reference NFR criteria>=80% advisory coverage metric. No new coverage dependency allocated.
- **Actual:** Branch percentage UNKNOWN; line percentage UNKNOWN; trend UNKNOWN. Existing 100% requirements trace cannot substitute for these measurements.
- **Finding:** No current branch/line coverage report or trend evidence is supplied; acceptance coverage does not prove measured coverage.
- **Owner:** Test/CI maintainer
- **Next action:** Before claiming numerical coverage, locate any existing instrumented report and record its revision/scope/trend. Otherwise keep UNKNOWN; do not introduce a new instrumentation package merely to satisfy this advisory audit.
- **Evidence:**
  - _bmad-output/test-artifacts/test-design-epic-16.md:321
  - _bmad-output/test-artifacts/epic-16/coverage-matrix.json:coverage_basis
  - _bmad-output/test-artifacts/epic-16/traceability-matrix.md:44

### M16-04: Code duplication

- **Status:** CONCERNS
- **Threshold:** Reference NFR criteria duplication<5% is an advisory framework metric, not an established measured result.
- **Actual:** Duplicated percentage, largest duplicated regions and trend UNKNOWN. Scoped existing reuse is evidenced but cannot establish a numerical threshold.
- **Finding:** No measured duplication report is supplied.
- **Owner:** Jobs/quality maintainer
- **Next action:** Obtain an existing scoped duplication measurement before any numerical compliance claim. Refactor only an identified consequential duplication problem; no speculative framework or broad rewrite.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-context-2026-10-20T21-04-49-580Z.json:nfr_thresholds.maintainability
  - tests/support/job-workspace-atdd.ts:6-29
  - src/features/jobs/job-members-domain.ts:1

### M16-05: Dependency vulnerability gate

- **Status:** PASS
- **Threshold:** No critical/high accepted by pnpm audit --audit-level=high.
- **Actual:** CI39490485088 frozen-lock install and audit completed successfully. Native audit reports2moderate vulnerabilities; this is not zero vulnerabilities. No fresh audit executed.
- **Finding:** The actual current CI high-severity dependency gate passed within its stated scope.
- **Owner:** Dependency maintainer
- **Next action:** Retain the two moderate advisories in dependency triage; inspect affected paths and available compatible fixes before any change. Do not infer runtime exploitability or blindly upgrade dependencies.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:206-207
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:266-280

### M16-06: Dependency lifecycle and remediation

- **Status:** CONCERNS
- **Threshold:** No approved numeric freshness/remediation target supplied; supporting evidence UNKNOWN.
- **Actual:** Outdated/unmaintained dependency inventory and time-to-remediate UNKNOWN; moderate advisory detail/ownership is not established by the bounded native summary.
- **Finding:** The high-severity audit gate does not measure dependency freshness, maintenance status or remediation age.
- **Owner:** Dependency maintainer
- **Next action:** Record affected advisory/dependency paths, disposition and an owner during normal dependency maintenance before making broader dependency-health claims.
- **Evidence:**
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:266-280

### M16-07: Static/build process and fixture reuse

- **Status:** PASS
- **Threshold:** Applicable typecheck/lint/production build/frozen-lock/source and final-bundle containment; reusable invocation-only fixtures with cleanup.
- **Actual:** Current native CI passed required static/build/containment and43process checks. Workspace fixture delegates to withJobsDepthFixture; jobs-depth disposes in finally and cleans role-aware fixture on setup failure. No database work on helper import. Scoped examples establish reuse/cleanup structure, not a fresh full test-quality review.
- **Finding:** Existing current native CI verifies the bounded build/static process; synthetic fixture adapters reuse existing cleanup ownership.
- **Owner:** CI/test fixture maintainer
- **Next action:** Preserve existing scoped fixtures, invocation-only setup and finally cleanup; retain required native execution counts. Hosted rollout/rollback remains outside this assessment.
- **Evidence:**
  - _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md:296
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:297
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:313
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:18752
  - C:/Users/Rasmus/AppData/Local/Temp/kopplas-e16-ci39490485088-verify.log:18850
  - tests/support/job-workspace-atdd.ts:1-29
  - tests/support/jobs-depth-atdd.ts:148-177

### M16-08: Operational observability

- **Status:** CONCERNS
- **Threshold:** Critical command outcome auditing known; production structured log schema/samples/format assertions, error tracking, log levels and operational context UNKNOWN.
- **Actual:** Trace includes actual audit fault rollback/exact replay tests and safe event projections. Neither proves deployment-wide structured operational telemetry or error tracking. No vendor-specific requirement inferred. First16.3-E01 audit-zero action outcome/timing remains unresolved; enforced transactional paths and successful full retry identify no concrete production audit bypass.
- **Finding:** Critical command outcome/audit assertions are evidenced; production structured logging/error tracking coverage is not established.
- **Owner:** Application operations owner
- **Next action:** Before operational-readiness claims, supply existing structured log schema/sample/assertions and error-capture evidence with safe correlation context. Keep unresolved first-attempt evidence visible; do not invent Sentry adoption or claim audits alone prove observability.
- **Evidence:**
  - _bmad-output/test-artifacts/epic-16/traceability-matrix.md:362-365
  - _bmad-output/test-artifacts/epic-16/traceability-matrix.md:450-467
  - _bmad-output/test-artifacts/epic-16/traceability-matrix.md:564-571
  - _bmad-output/implementation-artifacts/spec-16-5-job-workspace-shell.md:294

## Compliance Scope

Rollup preserves N/A certifications and partial evidence. Scoped privacy/access findings establish no legal certification pass. The full legal/GDPR program remains excluded. Boolean release_ready=false is metadata and is not compliance PASS.

| Standard or scoped control | Evidence rollup |
| --- | --- |
| SOC2 | N/A |
| GDPR | N/A |
| HIPAA | N/A |
| PCI-DSS | N/A |
| ISO27001 | N/A |
| approved_local_RBAC_pilot_only | PASS |
| epic16_Jobs_latency_and_volume | PARTIAL |
| production_throughput_and_concurrency | PARTIAL |
| CPU_memory_and_connection_pool_capacity | PARTIAL |
| Jobs_query_cost_and_optimization_baseline | PARTIAL |
| overall_performance | PARTIAL |
| NFR20_scoped_atomicity | PASS |
| NFR23_scoped_audited_outcomes | PASS |
| current_authority_after_lock_wait_replay | PASS |
| exact_retry_CAS_input_identity | PASS |
| ADR_B009_NFR53_connected_essential_flow | PASS |
| qualified_browser_evidence | PARTIAL |
| availability_error_rate_MTTR | PARTIAL |
| operational_observability_service_failover | PARTIAL |
| headless_separation | PASS |
| requirements_coverage | PASS |
| coverage_80pct | PARTIAL |
| duplication_5pct | PARTIAL |
| vulnerability_scan | PASS |
| dependency_lifecycle | PARTIAL |
| static_build_fixture_process | PASS |
| observability | PARTIAL |

## Custom NFRs and ADR Quality Crosswalk

No additional custom product requirement introduced. The31domain findings are not29independently scored ADR criteria. **ADR29 score:NOT_EVALUATED**; this qualitative crosswalk records the additional categories without manufacturing a numerical readiness score.

| ADR category | Evidence and limitation |
| --- | --- |
| Testability/automation | Current native suites, direct denied pairs and transactional fault injection; measured branch percentage UNKNOWN. |
| Test data strategy | Existing isolated synthetic tenant/job fixtures and required reset/seed/cleanup; no new runtime/fixture. |
| Scalability/availability | Scoped RBAC pilot PASS; Jobs volume/load/production capacity/availability UNKNOWN. |
| Disaster recovery | Not automatically assessed by four workers. RTO/RPO/backup/regional targets and measurements UNKNOWN. Separate Storage1/1PASS is scoped integrity only. |
| Security | Approved tenant/role/data/file/proof invariants evidenced; broader deployed assurance UNKNOWN. |
| Monitorability/debuggability/manageability | Command audit evidenced; production structured logs/telemetry/error capture UNKNOWN. |
| QoS/QoE | Connected draft/failure/retry/server-persistence smoke evidenced;14breadth/visual/manual checks DEFERRED. |
| Deployability | Build/frozenlock/migration-reset/containment evidenced; hosted rollout/rollback not audited/authorized. |

Availability/error-rate/MTTR numeric targets and production baselines UNKNOWN:CONCERNS. RTO/RPO/backup/regional evidence UNKNOWN; scoped direct recovery is not production DR PASS. CPU-only bulk calculation duration is not CPU utilization; CPU/memory/pool measurements UNKNOWN. No sustained/consecutive-clean CI burn-in target established; two first-attempt uncertainties retained.

## Cross-Domain Risks

- **MEDIUM,performance + reliability:** Unknown Jobs volume/latency and production capacity/availability targets limit broader operational confidence. The measured RBAC pilot is not a Jobs or production SLO.
- **MEDIUM,reliability + maintainability:** Unmeasured telemetry and branch/duplication metrics plus two qualified retry uncertainties limit diagnosis/trend confidence. No reachable defect or low measured coverage is inferred.

## Quick Wins

Three documentation/evidence actions, no code changes: preserve retry qualifications and true native counts; retain two moderate advisories for dependency triage; explicitly retain UNKNOWN metrics until scoped evidence exists. Suggested owners:evidence/release owner and platform/dependency maintainer. Effort:bounded receipt/triage review; implementation hours not estimated. No change executed.

## Recommended Actions and Evidence Gaps

No immediate CRITICAL/HIGH correction or development blocker identified; no waiver requested. These MEDIUM advisory followups suggest owners, not new authorized work or deadline promises. Timing is before the corresponding broader assurance claim; calendar dates/effort require owner scoping.

| Followup / suggested owner | Evidence needed / completion condition | Timing / effort |
| --- | --- | --- |
| Jobs performance:product/architect + performance executor | Approve assigned-list/facts/save numeric targets/profile, then target-matched latency/query-plan/roundtrip evidence in existing approved lane. | Before Jobs performance claim; measurement effort TBD after targets. |
| Operations reliability/capacity:platform operations + product | Define availability/error/MTTR,throughput/resource/failover targets; supply measured reports.25serial samples are not load/uptime. | Before matching operational claim; scope/effort TBD. |
| Operational security:application/platform security owner | Applicable deployed MFA/session,TLS/encryption,key/rotation,all-endpoint and secret assurance evidence if broader assurance requested. | Before broader security claim; scope/effort TBD. |
| Dependency lifecycle:platform/security maintainer | Triage two moderate advisories with affected paths,compatible fixes/remediation age; retain true high/critical gate result. | Existing dependency cadence; bounded triage/fix effort TBD. |
| Maintainability metrics:Jobs/quality maintainer | Existing scoped branch/line/trend and duplication reports before numeric claims; no new coverage dependency allocated. | Before numeric claims; instrumentation scope/effort TBD. |
| Diagnostics:platform operations + Jobs maintainer | Existing structured log schema/samples/format assertions/error-capture coverage,then justified thresholds. | Before operational observability claim; evidence scope TBD. |
| Stability provenance:evidence/release owner | Preserve failed attempts,unknown firstE01actionoutcome and qualification with passing full retries; investigate on concrete recurrence. | Preserve now through release review; no new rerun requested. |
| DR assurance:platform operations + release owner | Applicable RTO/RPO/backup/regional restoration evidence separately; Storage recovery is not a substitute. | Before production DR claim; separate approved scope. |
| Release validation:14existing root-coordinated owners/items | Execute recorded breadth/screenshots/manual work; none passed,waived or hidden here. | Before release_ready claim; existing ledger owns scope. |

Every CONCERNS finding retains exact owner/action/evidence above and in JSON. Raw worker evidence-gap/action lists are retained in JSON; overlapping limitations do not create extra defects.

## Monitoring Hooks and Fail-Fast Mechanisms

No monitoring changes. Suggested owners first supply current log/error-capture evidence and applicable targets; numeric alert thresholds UNKNOWN. Retain evidenced command audit,current-authority/proof validation,transaction rollback and required CI gates. New circuit breakers,caches/CDN,rate-limit infrastructure,automatic three-retry policies and health endpoints are N/A as automatic prescriptions: no approved requirement or measured need. New coverage/duplication gates require evidence/ownership allocation; no package/framework added.

## Findings Summary

| Domain | PASS | CONCERNS | FAIL | Status | Risk |
| --- | ---: | ---: | ---: | --- | --- |
| security | 8 | 3 | 0 | CONCERNS | MEDIUM |
| performance | 1 | 4 | 0 | CONCERNS | MEDIUM |
| reliability | 4 | 3 | 0 | CONCERNS | MEDIUM |
| maintainability | 4 | 4 | 0 | CONCERNS | MEDIUM |
| **Total** | **17** | **14** | **0** | **CONCERNS** | **MEDIUM** |

## Advisory Gate YAML

This reports the audit; it does not overwrite the completed epic trace gate or establish release readiness.

```yaml
nfr_assessment:
  date: '2026-10-20'
  epic: '16'
  advisory: true
  overall_status: CONCERNS
  overall_risk: MEDIUM
  categories: {security: CONCERNS, performance: CONCERNS, reliability: CONCERNS, maintainability: CONCERNS}
  findings: {pass: 17, concerns: 14, fail: 0}
  adr_checklist_score: NOT_EVALUATED
  critical_issues: 0
  high_priority_issues: 0
  blockers: false
  waivers: []
  release_ready: false
  release_only_deferred: 14
  newly_executed_tests: 0
  recommendations:
    - Preserve scoped native proof and qualified retry history.
    - Supply owner-approved targets/evidence before broader claims.
    - Retain fourteen owned release-only deferrals; no functional waiver.
```

## Execution, Validation and Related Artifacts

Primary and all four context-free required workers ran gpt-6.1-sol High for tenant/RBAC/file/money/transaction evidence. All foreground awaited. Proven capacity refusal before creation was handled by waiting for own worker completion then bounded dispatch; no stale actor adopted/interrupted. Parallel speedup not measured/claimed.
New checks:bounded read-only source/test/evidence applicability inspection,receipt SHA256 validation,worker JSON/status/threshold/compliance aggregation and artifact readback. **New tests0; newly executed tests0;no new runtime/browser/CI/build/broad review.** Reused native counts remain above. No source/test/dependency/config/spec/Git/state/trace-gate edits belong to this audit.
Checklist validation:all4domains assessed; missing targets/evidence explicit; PASS threshold/evidence present;UNKNOWN neverPASS;CONCERNS owner/action retained;N/A preserved;31counts reconcile17/14/0;no template placeholders. Hosted/deployed accessibility N/A for this evidence-only task:actual production-mode CI evidence available,no deployment claim. Unavailable load/APM/coverage/duplication/penetration/uptime evidence marked missing,never passed. No CLI/browser/resource created;cleanup N/A. Story updates prohibited/not requested. ADR29numeric score not fabricated.
Related inputs:_bmad-output/test-artifacts/test-design-epic-16.md:117-130,320-326; _bmad-output/test-artifacts/test-design-architecture.md; _bmad-output/test-artifacts/test-design-qa.md; _bmad-output/planning-artifacts/prd-phase-b.md:432-489; _bmad-output/planning-artifacts/architecture-phase-b.md; docs/process/development-completion-policy.md; docs/process/agent-model-routing.md; scripts/nfr/epic-11-pilot-limits.ts; _bmad-output/test-artifacts/epic-16/coverage-matrix.json; _bmad-output/test-artifacts/epic-16/traceability-matrix.md. Existing traceability-matrix.md,coverage-matrix.json,e2e-trace-summary.json,gate-decision.json remain unchanged. Companion nfr-assessment.json retains domain originals,normalized compliance,thresholds and worker hashes.

## Sign-Off

**Audit complete;NFR CONCERNS/MEDIUM;0FAIL,0critical/high,0identified consequential blockers,0waivers.** Fourteen owned release checks and advisory evidence followups remain open;release_ready=false. Next workflow:parent-dispatched test-review. No automatic trace rerun/release. Reassess only changed evidence,a concrete new concern or separately authorized broader scope.
