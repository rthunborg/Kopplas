---
stepsCompleted: ['step-01-load-context', 'step-02-define-thresholds', 'step-03-gather-evidence', 'step-04-evaluate-and-score', 'step-04e-aggregate-nfr', 'step-05-generate-report']
lastStep: 'step-05-generate-report'
lastSaved: '2026-10-13'
workflowType: 'testarch-nfr-assess'
workflowStatus: 'completed'
epic: 20
authorRoute: 'gpt-6.1-sol High'
sourceHead: '827f63dd'
evidenceUpdateHead: '6f891f7db7a1be83bd3d90b67ce2fdb47e538e3c'
inputDocuments:
  - AGENTS.md
  - docs/process/agent-model-routing.md
  - _bmad/tea/config.yaml
  - .agents/skills/bmad-testarch-nfr/SKILL.md
  - .agents/skills/bmad-testarch-nfr/resources/knowledge/adr-quality-readiness-checklist.md
  - .agents/skills/bmad-testarch-nfr/resources/knowledge/ci-burn-in.md
  - .agents/skills/bmad-testarch-nfr/resources/knowledge/test-quality.md
  - .agents/skills/bmad-testarch-nfr/resources/knowledge/playwright-config.md
  - .agents/skills/bmad-testarch-nfr/resources/knowledge/error-handling.md
  - .agents/skills/bmad-testarch-nfr/resources/knowledge/playwright-cli.md
  - _bmad-output/test-artifacts/test-design-epic-20.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-phase-b.md
  - _bmad-output/planning-artifacts/architecture-phase-b.md
  - _bmad-output/implementation-artifacts/spec-20-1-documents-activation-and-source-authorized-aggregation.md
  - _bmad-output/implementation-artifacts/spec-20-2-search-filters-preview-and-archive-restore.md
  - _bmad-output/implementation-artifacts/spec-20-3-entity-panel-links-and-contextual-navigation.md
  - _bmad-output/test-artifacts/traceability/epic-20/gate-decision.json
  - _bmad-output/test-artifacts/traceability/epic-20/evidence-integrity.json
  - _bmad-output/test-artifacts/epic-20-e8-iter1-automation-summary.md
  - _bmad-output/test-artifacts/epic-20-cap-and-pilot-baseline-2026-10-13.json
  - _bmad-output/test-artifacts/epic-20-test-reliability-fixes.md
---
# NFR Evidence Audit — Epic 20 Documents

**Date:** 2026-10-13. **Scope:** approved Phase B stories 20.1, 20.2, 20.3. **Overall status: CONCERNS; MEDIUM evidence risk.**

## Executive Summary

The four-domain audit plus the bounded evidence update remains CONCERNS: **11 PASS findings, 18 CONCERNS, 0 FAIL**. Recorded Documents authority, minimal projections, authenticated RPC/secret containment, immutable commitments, explicit failure/retry, latest selection/expiry and atomic lifecycle/audit behavior are supported. No demonstrated vulnerability, crash, resource leak or numerical SLO breach is identified. This audit creates no new blocking requirement and grants no release/review authority.

The effective-cap provenance and planned pilot measurement gaps are closed by independently High-reviewed evidence committed at 6f891f7d. Final committed-head checks remain pending; unknown numerical performance and operational targets remain CONCERNS. Canonical 20.2 `review_unverified: true` and follow-up recommendation remain despite independent narrow acceptance. Three broad rounds per story are exhausted; this is a required evidence audit, not a fourth broad code review. Optional visual wrapping and broader unmeasured operational dimensions remain uncredited.

## Context, workflow and evidence

Create mode, English for Rasmus. Pinned checkout skill and AGENTS/routing loaded. Initial uv resolver failed on sandbox interpreter-cache permissions; documented base/team/user structural fallback found no NFR overrides and empty hooks/facts. Epic-scoped output preserves the generic audit. Steps1–5 completed with progress saves; final report consolidates those saves using the template sections. No product tests/CI, browser exploration, resources, source/spec/state/sprint/plan/Git changes or deployment occurred.

Head at assessment start 827f63dd. Latest tested product **c65c18649ac5641f9520b12e03a8b3f20af8f610**: clean local synthetic production build, Chrome 155, desktop and 360×640, **17/17 native 0 checks, zero skips**; ten same-head carried receipts plus seven fresh checks. All 17 raw-log hashes were independently recalculated in this audit and matched. Latest bundle records 101 migrations plus synthetic seed on a new isolated local schema. Suite totals overlap and are never summed. Earlier 20.1/20.2 bundles remain historical evidence.

Historical trace PASS at 6b224082: **32/32 P0, 36/38 P1, 77/81 overall**, 81 requirement items and 607 mapped cases; this is requirement coverage, not code coverage. Iteration1 executed **166/166 REQUIRED integration, 0 fail/skip/todo**, new unchanged-token membership deletion case 1.564s; actual dirty b7f01bb3, test SHA256`eab6b291f0eb8bee1c6269a8563fa1619105a983a0e8058eb6bea23a0151c90c`, identical committed blob`5594186c5def14712a32fd0df53ec8c1ce2cc5f5` at 80fdaef7. No clean committed-head replay is claimed. Recorded lint/nonincremental typecheck and independent narrow High clearance do not replace final release checks.

Execution probe: subagent support available; no distinct agent-team API; config auto/probe=true resolved subagent. Four worker steps 4A–4D completed and were awaited. Security and transactional Reliability used explicit Sol 6.1 High; Performance/Maintainability Sol 6.1 Low. No measured parallel-speedup claim. Unknown-threshold dimensions never PASS; no aggregation downgrade needed. Each risk is MEDIUM, so max overall risk MEDIUM. Cross-domain concerns are limited measurement/detection confidence and final-head attribution.

Option A, Contract D and Phase C exclusions remain. Generic Files.View/direct tenant-path Storage access is preserved; current Documents selected-source access/refresh denies revoked context. Already-issued bearer URLs remain usable to actual expiry, default 300s/configurable issuance cap 86400s. No instant/global byte-revocation claim. Owner waived exact Lovable comparison; actual observations zero. No hosted/demo/legacy parity, full legal/GDPR program, AI/portal/offline/mobile/vendor-live API certification. Existing stop receipts mean accepted `stop_requested`, `verified=false`, not confirmed shutdown.

## Performance Assessment

Primary thresholds come from test-design-epic-20 NFR plan and NFR24–29; generic skill examples are not defaults.

| Dimension | Status | Threshold / actual evidence |
| --- | --- | --- |
| Complete bounded traversal | PASS | Dedicated effective config and no-limit runtime response prove cap 1000: HTTP 206, Content-Range 0-999/2125, first 1000 hidden. The unchanged readDocuments/RLS reader reaches all 1025 authorized rows exactly once in stable order, page<=50, authorized-only tuples/count/facets and no foreign/hidden IDs. Retained stack was unlimited, not a deployment 1000-cap claim. |
| Response time p95/p99/page load | CONCERNS | Required elapsed baseline now recorded for three synthetic pilot scenarios; numeric targets UNKNOWN. No p95/p99, Next route/cookie/browser latency or SLO PASS claim. |
| Throughput/query work | CONCERNS | Pilot HTTP request and transferred candidate-row counts now recorded. Each page rescans candidates; these are not SQL statements/rows scanned. Numeric throughput/concurrency/volume targets UNKNOWN; external-beta certification deferred under NFR26. |
| CPU/memory/pooling/optimization | CONCERNS | Pilot Node RSS/heap sampled every 10ms plus before/after now recorded; not instantaneous peak, DB memory, CPU/pool profiling or leak certification. Numeric targets UNKNOWN. No new optimization requirement. |

## Security Assessment

Scoped thresholds: zero unauthorized Documents rows/context/facets/counts/new URLs; seven sources, relevant roles/two tenants; live request authority, server-only proofs, immutable commitments and audit-atomic commands.

| Dimension | Status | Evidence and limit |
| --- | --- | --- |
| Documents authentication/authorization | PASS | Current membership/role/source conjunction, request RLS, raw RPC/ACL, forged tenant/actor/link, revocation negatives; same-token active deletion closure retained with dirty provenance. |
| Data protection/signed access | PASS | Minimal safe DTOs; no privileged key/proof/path/auth/price/signed URL in list; tamper/replay/expiry/failure negatives. Option A residuals above. |
| Scoped input validation | PASS | Source/query/UUID/date, signed-field/domain/time/key tamper, origin spoof/direct DML/replay negatives. Universal injection protection is unclaimed. |
| API/secret boundaries | PASS | Authenticated checked RPC/internal helper ACLs; no anonymous/service-role signing authority; service-role and production bundle containment native 0 at tested SHA. Whole-repository hardcoded-secret absence is unclaimed. |
| Artifact/audit integrity | PASS | Bytes/identity/links/locks preserved, strict PDF/snapshot provenance, no PDF restore, proven ordinary origin; deterministic locks/atomic rollback/replay negatives. |
| Platform security measurements | CONCERNS | Hosted TLS/at-rest encryption, full session/MFA, broad SQLi/XSS/CSRF assessment, CORS/headers/rate-limit applicability, key rotation and vulnerability scan evidence not supplied. Targets/applicability UNKNOWN; no discovered defect/new blocking requirement. |
| Evidence currency/review disposition | CONCERNS | c65c1864 and dirty regression attribution distinct; final-head checks pending;20.2 canonical caveat retained. |

Security worker has 6 PASS and 6 CONCERNS findings; grouped rows above preserve all dimensions. Compliance: full legal/GDPR program is owner-deferred; no SOC2/HIPAA/PCI/ISO certification is applicable or asserted.

## Reliability Assessment

| Dimension | Status | Evidence and limit |
| --- | --- | --- |
| Error handling/retry | PASS | No URL/success audit on signing/storage/audit failure; UI explicit retry and authorized response-loss reconciliation/reconfirmation. |
| Transactional fault tolerance | PASS | Checked lifecycle/audit atomicity; audit fault, lock timeout/deadlock preserve state/origin; consumed opposite replay rejected; same-identity concurrency/finalize replay avoid duplicate effects. |
| Selection/expiry/persistence | PASS | Actual browser journeys reject delayed prior selection/expired URLs, require explicit fresh renewal and server-confirmed mutation success. |
| Availability/error rate/MTTR | CONCERNS | Targets UNKNOWN; no hosted uptime/error/incident measurements supplied. Local passing tests are not availability metrics. |
| CI burn-in/stability | CONCERNS | No approved repetition threshold or consecutive-run report; no invented 5/10/100-run requirement. |
| Operational fault tolerance/DR | CONCERNS | RTO/RPO, backup restore/failover/redundancy/rollback drills absent; thresholds UNKNOWN. Transaction rollback is not DR. |
| Monitoring/currency | CONCERNS | Operational RED/APM/health/alert evidence absent; current audit rows do not certify operational telemetry. Final-head checks pending. |

## Maintainability Assessment

| Dimension | Status | Evidence and limit |
| --- | --- | --- |
| Established product checks | PASS | c65c1864 required positive DB execution, lint/type/unit/build/lockfile/containment and recorded fresh-schema/coherence evidence; final-head replay separately pending. |
| Code coverage | CONCERNS | Critical branch/statement target >=80% where instrumented; no report/trend supplied.81 mapped requirements and passing cases do not establish a code percentage. |
| Duplication | CONCERNS | Report and approved numeric target UNKNOWN; generic5% example is not an Epic20 requirement. |
| Dependency vulnerability health | CONCERNS | Audit report/counts/remediation policy not supplied; no reachable vulnerability asserted. |
| Observability | CONCERNS | No structured log sample/schema/assertion or operational error-tracker evidence supplied. Business audit tests are a different measure. |

## Custom / ADR Quality Readiness Checklist

Test-data strategy PASS: synthetic local fixtures, two-tenant segregation and fixture cleanup; no demo/production run. Connected QoE PASS for recorded keyboard/loading/friendly error/persisted-state desktop and 360×640 journeys. Optional long-name/neutral-label wrapping has no manual observation. No new offline/PWA/durable draft or legal-retention requirement.

The 29-criterion ADR rubric is a system evidence inventory, not an approved Epic20 release-score gate. Unverified criteria are CONCERNS rather than evidence of absent implementation. Scope-specific recorded evidence supports 10 criteria; 19 lack complete supporting evidence. This is separate from the 29 domain findings, now 11 PASS/18 CONCERNS after the bounded update. The ADR score remains 10/29: no approved numeric latency target or full-load bottleneck/operational evidence is newly established.

| ADR category | PASS criteria | CONCERNS criteria | Met | Overall |
| --- | --- | --- | ---: | --- |
| Testability/Automation |1.1 isolated units;1.2 headless core command/read tests;1.3 seeded states|1.4 sample-request completeness|3/4|CONCERNS|
| Test Data |2.1 segregation;2.2 synthetic generation;2.3 cleanup|None|3/3|PASS|
| Scalability/Availability |None|3.1 restart/horizontal scale;3.2 load bottleneck;3.3 SLA/redundancy;3.4 measured dependency timeout/circuit behavior|0/4|CONCERNS|
| Disaster Recovery |None|4.1 RTO/RPO;4.2 failover;4.3 immutable backup/restore|0/3|CONCERNS|
| Security |5.1 scoped auth/least privilege;5.3 scoped server-only secrets|5.2 hosted encryption;5.4 broad injection assessment|2/4|CONCERNS|
| Monitorability |None|6.1 trace context;6.2 runtime log levels;6.3 RED metrics;6.4 runtime config change evidence|0/4|CONCERNS|
| QoS/QoE |7.3 loading;7.4 friendly degradation|7.1 numeric latency;7.2 rate-limit/noisy-neighbor evidence|2/4|CONCERNS|
| Deployability |None|8.1 zero-downtime;8.2 N-1 DB/code compatibility;8.3 automatic rollback|0/3|CONCERNS|
| **Total** |**10 PASS**|**19 CONCERNS;0 FAIL**|**10/29**|**CONCERNS**|

## Evidence Gaps and Recommended Actions

| Gap / disposition | Priority, owner, deadline | Evidence needed / estimated effort |
| --- | --- | --- |
| Closed 20.1-AC6/20-P1-05 cap provenance |CLOSED; independently High-reviewed at 6f891f7d|Explicit finite 1000 cap and beyond-cap complete 2125-candidate traversal recorded; no further measurement required for this gap. |
| Closed 20-P2-09 pilot baseline |CLOSED; independently High-reviewed at 6f891f7d|Three actual elapsed/HTTP/transferred-row/sampled-Node-memory scenarios with SHA/environment/dataset provenance; no numerical SLO approval. |
| Existing final committed-head checks |Existing release gate; coordinator/verifier; before release clearance|Native argv/env/head/count/hash receipts for scheduled exact-head checks, including retained-token regression. Effort per existing 17-check lane, not a new test campaign. |
| Existing 20.2 canonical review caveat |Governance follow-through; coordinator/owner; final checkpoint|Retain review_unverified/follow-up history and independent narrow approval; resolve release disposition under capped-review policy. No fourth broad round.~15–30min recording estimate. |
| Instrumented coverage |MEDIUM claim qualification; test owner; before claiming >=80%|Attach approved critical-path instrumented report if tooling applies; otherwise record unavailable.1–2h evidence estimate, not imposed new tooling. |
| Duplication/dependency evidence |MEDIUM follow-up; engineering/security owners; next operational-readiness review|Existing reports and approved applicable policy; no example 5%/zero-vuln numerical target invented.1–2h evidence inventory estimate. |
| Operational security/observability evidence |MEDIUM follow-up; security/ops owners; before related hosted-readiness claims|Deployment TLS/encryption, secret/session policy, structured log/error tracker, RED/health evidence.1–3h evidence inventory estimate; no certification claim. |
| Availability/burn-in/DR/deployability |MEDIUM follow-up; ops/owner; next operational-readiness review|Approved targets then actual uptime/errors/MTTR/stability/restore/failover/rollback data. Estimate requires environment/target decisions. |
| Optional 20-P3-01 visual polish |LOW optional; UX/QA; next polish opportunity|Recorded long-name/neutral-label wrap check at both viewports, 15–30min estimate. Exact Lovable comparison remains owner-waived. |

Effort estimates are suggestions, not schedules or commitments. No demonstrated critical/high implementation defect. Required evidence actions already existed in test-design/trace/final gates; broader unknown dimensions do not add release blockers.

## Quick Wins, Monitoring Hooks and Fail-Fast Mechanisms

Quick wins: retain the committed cap/pilot evidence links and precise final-head receipts; retain explicit unknown/waived/optional classifications. No product configuration mutation is performed.

Suggested monitoring follow-up, not deployed hooks: QA retain the recorded pilot elapsed/HTTP/candidate-transfer/authorized-row/sampled-Node-memory observations; ops link existing error/RED/health observations at operational-readiness review; security retain denied checked-RPC/business-audit evidence. Alert thresholds remain UNKNOWN until approved; no new automation or alert recipient is created.

Existing fail-fast validation is supported by checked source/role/RLS/proof/lock/audit negatives, invalid context/date checks, manifest-derived coherence and REQUIRED-test zero-skip gates. Circuit-breaker/rate-limit/coverage-duplication additions are N/A to this audit; measurement/approved applicability must precede any product work.

## Gate YAML Snippet

```yaml
nfr_assessment:
  date: '2026-10-13'
  story_id: '20.1/20.2/20.3'
  feature_name: 'Epic20 Documents'
  overall_status: CONCERNS
  overall_risk: MEDIUM
  adr_checklist_score: '10/29'
  domains: {security: CONCERNS, performance: CONCERNS, reliability: CONCERNS, maintainability: CONCERNS}
  finding_counts: {pass: 11, concerns: 18, fail: 0}
  critical_issues: 0
  high_priority_defects: 0
  new_nfr_blockers: false
  existing_release_obligations_pending: true
  required_evidence_actions: [final_committed_head_checks]
  closed_evidence_gaps: [effective_cap_provenance, pilot_baseline]
  review_caveat: '20.2 review_unverified=true; narrow approval retained; no fourth broad review'
  release_authority: false
  waiver: 'owner waived exact Lovable comparison; zero observations'
```

## Related Artifacts and Integrity

Primary requirements: three spec paths and test-design/PRD/architecture paths in inputDocuments. Canonical review state: `_bmad-output/auto-bmad/state/20-2-search-filters-preview-and-archive-restore.yaml:56`. Normalized trace artifact paths are relative to this report directory.

| Evidence source | SHA256 at audit |
| --- | --- |
|traceability/epic-20/gate-decision.json|556eacd8940728dd7c446b7906363537c9d4310e57a8296a6dce6401597d7593|
|traceability/epic-20/evidence-integrity.json|afa789b6a7795b8aad80fcd64fc629bf7ec45e236a9930ac7249c32bc2a619ab|
|C:/Users/Rasmus/AppData/Local/Temp/Kopplas-documents20-3-combined-c65c1864/summary.json|9a8dd2ab63dddbdd0310d7138afd0a397851cea57f53f0f487d184135b73be44|
|Same bundle/evidence.json|b2f4f4bc9b0a283271b957fc3c69ff87cf1e98bf7798e5def1deb844167c1a28|

Durable compact machine summary: `nfr/epic-20/assessment-summary.json`; worker output paths/hashes and all category/status decisions are referenced there. Full local domain JSONs: `C:/Users/Rasmus/AppData/Local/Temp/tea-nfr-{security,performance,reliability,maintainability}-2026-10-13-epic20.json`. Local aggregate: `tea-nfr-summary-2026-10-13-epic20.json`. Raw inventories/results are not duplicated into this audit.

## Validation and Sign-Off

Checklist validated with unknown/missing evidence recorded for every applicable dimension; all four domains and ancillary ADR categories covered. Numeric targets are sourced or UNKNOWN; no generic example imposed. Report uses template sections, deduplicated prose, precise evidence attribution, owners/deadlines/estimates and gate YAML. No runtime/browser/resource launch means no new cleanup obligation. Scope prerequisite is accessible implementation and retained deployment/test evidence; no currently-running hosted deployment is asserted.

**NFR audit complete: CONCERNS.** No new critical blocker or waiver request. Final committed-head follow-through and existing 20.2 review disposition belong to the coordinator's final gates. Refresh this evidence audit narrowly when those results exist; trace PASS remains its own coverage decision. Product release is not approved here. Terminal resolver succeeded with native exit 0 using a process-local temporary uv cache; workflow.on_complete was empty, so no hook action was required.


## Bounded evidence update — 6f891f7d

Existing evidence only; no new audit/delegate/test/resource launch. Artifact `epic-20-cap-and-pilot-baseline-2026-10-13.json` ran at 74aaac5f with src tree unchanged from c65c1864, real anon-key authenticated readDocuments/RLS client, 101 local synthetic migrations, REQUIRED=1, native 0, 3/3 passed/0 skip. Independent Sol6.1 High measurement review accepted exact set/order/tuples/count/facets and method/provenance; no remaining measurement blocker. Deployment cap is unclaimed.

| Scenario | Candidates / authorized | Three traversal read totals (ms) | HTTP requests / transferred candidate rows | Sampled Node peak RSS (bytes) |
| --- | --- | --- | --- | --- |
| realistic mixed source |210/140|2194.599;2190.571;2194.032|152/630|131104768|
| hidden heavy |1225/125|1302.686;1289.368;1307.242|68/3675|142233600|
| finite-cap completeness |2125/1025|11020.641;10023.896;9983.487|468/44625|144699392|

Timing excludes validation/counter body clones; counter pass is separate. Each page rescans candidates. HTTP counts/transferred rows do not measure SQL statements/rows scanned. RSS is 10ms sampled process memory including Node/libs/fixtures/retained rows, excluding DB memory; no guaranteed instantaneous peak, leak or p95/p99 claim. Realistic case has 72 distinct authorized files; the other cases have 7 files/seven authorized owners with ordinary-link-heavy additions. This closes required measurement availability, not an UNKNOWN numerical target.

Test-reliability fixes committed 4f891be8 close DET-H3-01/DET-H2-01/DET-H2-02: unconditional rendered denial check, DB-challenge-relative proof vectors under runner skew, and prepared-session expiry readiness with setup-failure cleanup. Independent narrow Sol6.1 High review CLEAN; final affected integration 114/114 and browser 4/4, zero skips, scoped lint/type native 0. Actual execution was dirty c210b637 plus assigned working blobs; reused unchanged c65 production build. Deliberate suppressed-alert/setup-failure probes failed as intended and receive no passing/skipped coverage credit. This strengthens affected reliability evidence; it is not final committed-head release replay or another broad review.

New source hashes: cap/pilot JSON SHA256`12472f0188fe350855c9d58c761dd5262381b1c24431d5cc4d6864b25f2a9020`; reliability-fixes Markdown SHA256`36fbb97ff29920ed00378aa85f33cd11e23f939173976c9be36a95a5e4613f50`. Original worker receipts remain historical; current performance finding/compliance dispositions are updated in the durable summary. Overall CONCERNS/MEDIUM and ADR 10/29 remain; bounded traversal changes to PASS, so domain findings become 11 PASS/18 CONCERNS/0 FAIL. No unknown-target PASS, operational program, new waiver, or release approval is introduced. Canonical 20.2 caveat, Option A/Contract D/Phase C and zero Lovable observations remain.

