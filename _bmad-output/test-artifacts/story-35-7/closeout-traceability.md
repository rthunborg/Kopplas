---
workflow: bmad-testarch-trace
mode: create-bounded-reconciliation
workflowStatus: completed-with-explicit-scope-override
stepsCompleted: [step-01-load-context, step-02-discover-tests, step-03-map-criteria, step-04-analyze-gaps, step-05-gate-decision]
lastStep: step-05-gate-decision
lastSaved: 2026-11-10
coverageBasis: acceptance_criteria
oracleResolutionMode: formal_requirements
oracleConfidence: high
collectionStatus: COLLECTED
gate_type: epic
allow_gate: true
scope: spec-design-35-7 / 35-7 only
release_ready: false
---

# Story 35.7 development traceability

**Development gate PASS.** All seven acceptance criteria and fifteen owned states have executed evidence for the approved development scope. P0 is 2/2, P1 is 5/5, and overall AC coverage is 7/7. The state matrix is a separate 15/15 check and adds no duplicate items to the AC denominator. The result carries no waiver. Phase B release remains open.

## Oracle and scope

The formal oracle is the canonical story, its operative amendment, the retained fifteen state/test pairs, the original risk priorities, and Phase 6's actual assertion map. The qualified producer prerequisite is PR #126 at merge `01523c97eddec423288ef988217eedc3c9f0c258`, with normal checkpoint 42647750664. Preparation blockers and pending statuses in the historical artifacts remain historical. The current exact-main reports supply the runtime outcomes. [Canonical SPEC](../../specs/spec-design-35-7/SPEC.md) · [Story](../../specs/spec-design-35-7/stories/35-7-settings-and-manual-pricing.md) · [Operative contract](../../specs/spec-design-35-7/operative-contract.md) · [Test design](../../specs/spec-design-35-7/test-design.md) · [Risk priorities](../dt-2026-10-23-test-design/slice-35-7.md) · [Phase 6 assertion map](automation-summary.md)

The Phase 8 epic development decision applies to the `spec-design-35-7` folder, which contains only Story 35.7, under the October 26 frontend acceptance amendment and the October 19 development-versus-release split. The closeout worktree base `a53c30a2113666d061ba84bc6a1e0e16d9ac6bfe` adds a separate CRM harness above tested product main `91635d3ddfc130df12d299a5743280dcbf5817f5`. The runtime results belong to product main. No test was rerun during Phase 8. [Development completion policy](../../../docs/process/development-completion-policy.md)

## Collected execution evidence

Private source names below resolve under the coordinator's 35.6/35.7 evidence root. Native browser and DB records, source assertion anchors, and the independent review together determine coverage. The collection uses re-runnable test artifacts with retained native results.

| Evidence | Observed result and binding |
| --- | --- |
| Exact product main, normal run 42829233035 | Static, lockfile, typecheck, lint, build, source and bundle containment, and verify-development success per the combined record. The native verify log has 3,910 unit passes, zero failures, skips or cancellations. Combined evidence SHA-256 `c095c439d8416a862aeebfb2a75de350eb69bf3b1b3082fbada564cd1e85b4f4` in `pr147-combined-91635d3d-evidence.json`. |
| `pr148-91635d3d-browser-native/general-browser.json` | 116 first-attempt Chromium passes, 0 failed, skipped or flaky, including 15 settings and 21 pricing cases. Report revision and run metadata identify the product SHA and run 42829233035. Configured production build and `next start`. SHA-256 `bf87c277e4ae2c3a5a61d6cf48f109ddc4fefcdb2c2535882b8370a6a3ae3918`. |
| `pr148-91635d3d-db-native/full-integration.json` | Required DB/RLS lane with `SUPABASE_TEST_REQUIRED=1` has 2,253 passed and 0 failed, with 52 explicit skips: 37 booking command, 14 booking RLS, and 1 opt-in recovery assertion executed in its dedicated lane. No 35.7 scoped skips or unavailable-service skips. SHA-256 `d8f485475231164b62c25e90e94c0a398f7bc63910e7f289a35f9a16a31327a1`. |
| Settings/pricing DB subset, within the full total | 138 passed, 0 skipped or failed: pricing commands 17, settings commands 14, producer operation contract 75, pricing migration/reset 10, operation-contract RLS 7, and settings RLS 15. Role-aware Phase A surface adds 7 inherited passes in its own file. Neither count is additional to 2,253. |
| `pr148-91635d3d-recovery-native/isolated-storage-recovery.json` | One physical Storage restore/immutability assertion passed with 0 skipped or failed. It read loader-restored bytes and verified logical rows and overwrite protection. SHA-256 `dd119360b2e0e12857e233fdaf604d904680bf9b9dd20c920854cba72e3011c2`. |
| Owner-accepted candidate visual evidence | PR #148 head `3d7d2b3672995b63e2a34170ffeece6f12d27922`, run 42823680027, has 78 production PNG/sidecar pairs at 1440×900 and 360×640. Owner comment 6768991121 and successful visual check 129869307755 bind evidence digest `d1a8275ffd6992b70a1bb0199fd47cdca5b84fba2561bfd47d97a5c8a949eb69`. The accepted head and tested main have identical Git tree `59a668ee25679ab9f88540d31c5f18a48d7d24bf`. An independent comparison checked all 40 pricing pairs against PR #147, with 33 exact matches and 7 differences confined to generated fixture account text in the header. No consequential visual or privacy difference. This supports the candidate development visual gate. |
| Independent review and local reconciliation | Combined record identifies `/root/pricing_verifygap`, Sol High, approved exact product main with no unresolved findings. The separate reviewed local reconciliation finalized `e35-7-presentation-20261109` at product main. The post-finalize receipt retains exact story and final verification rows. `pr147-live-91635d3d-4ca7a294/native-finalize-result.json` SHA-256 `1ba38940663449a23995a07ecee8f01e2a29c7329daa373baf3fc95812170b8b`. |

[Exact-main CI](https://github.com/rthunborg/Kopplas/actions/runs/42829233035) · [Accepted PR head](https://github.com/rthunborg/Kopplas/pull/148) · [Owner visual acceptance](https://github.com/rthunborg/Kopplas/pull/148#issuecomment-6768991121)

## Acceptance criteria

Browser anchors below resolve on tested product main. **S** denotes `tests/e2e/settings/settings.e2e.spec.ts`. **P** denotes `tests/e2e/pricing/pricing.e2e.spec.ts`. The DB oracle for identity, authorization, and atomicity is the executed checked command/RLS suite, supported by authenticated browser readbacks.

| Criterion and test ID | Priority | Actual evidence | Development |
| --- | --- | --- | --- |
| E35-7-AC1 / E35-7-T-AC1 | P1 | S:114,132,147,164,484,709. Company save reads back integer VAT basis points. Terms save keeps approval null, deliberate approval binds actor and revision, and editing approved wording invalidates approval. Command and producer tests cover failed writes, readiness authority, and stale approval. | PASS |
| E35-7-AC2 / E35-7-T-AC2 | P1 | P:117,137,157,687,2320. Real create, update, archive and reactivate actions retain row identity and show authorized archive and search context. Validation and command tests enforce integer öre and checked authorization. Manual articles render without a supplier/import control. | PASS |
| E35-7-AC3 / E35-7-T-AC3 | P0 | P:80,106,249,961. Phone row edits verify tabular Swedish display, including 850,00 kr/tim and 12,50 kr with unit context, exact record identity and persisted öre. Negative and excess precision values remain associated field errors. The follow-up checks active and archived work-role rates and the canonical article display after a confirmed save. | PASS |
| E35-7-AC4 / E35-7-T-AC4 | P1 | S:210,709 and P:249,687,961. Connected production browser journeys at desktop and 360×640 check labels, keyboard activation, phone target bounds and focus. Representative computed contrast checks and the enlarged company form at 360×400 verify reflow, focused error, and scroll-reachable action. Accepted candidate visual evidence covers both viewports. The shortened viewport models reduced height. Native keyboard and wider device/manual work remain REL-1/2. | PASS |
| E35-7-AC5 / E35-7-T-AC5 | P1 | S:251 and P:249,961,2404. Actual canceled link, Back and Forward preserve the terms draft and history. Pricing replacement, keyboard focus and the pending A/B test preserve attempt ownership. The slice adapts no app dialog or motion. Existing dialogue/file-lock behavior keeps its inherited classification. | PASS |
| E35-7-AC6 / E35-7-T-AC6 | P1 | All fifteen rows below are exercised. P:1854 also distinguishes real authorized read failure and historical missing target from absence or current confirmation. The file classification remains inherited or N/A as specified. | PASS |
| E35-7-AC7 / E35-7-T-AC7 | P0 | Exact-main static, 3,910 unit, 138 scoped DB plus 7 role-aware, full required DB/RLS and dedicated recovery evidence support the authority and integrity seams. Existing quote-PDF validity/privacy and migration tests in the full run preserve inherited ADR-B008 evidence. S:192 and P:191 assert manifest-aligned navigation. Current independent and visual evidence is revision-bound, while release obligations remain separate. | PASS |

## Owned state and test IDs

| State and test ID | Executed assertion | Development |
| --- | --- | --- |
| E35-7-STATE-loading / E35-7-T-loading | P:2184 holds each exact initial read relation in isolated CI. The loading fallback appears without controls or empty/saved copy, then the same navigation settles after rollback. Both viewports. | PASS |
| E35-7-STATE-loaded / E35-7-T-loaded | S:709 and P:249 bind current, authorized company, terms and pricing facts to actual IDs and integer amounts. Role-aware and RLS suites verify entitlement and read boundaries. | PASS |
| E35-7-STATE-empty / E35-7-T-empty | S:709 and P:2184 use fresh owned tenants. VAT suggestion is labelled and unsaved, empty terms have no approval action, and empty manual price lists allow entitled creation. P:1854 distinguishes failed read. | PASS |
| E35-7-STATE-no-match / E35-7-T-no-match | P:214,2320 retain the filter and selection, keep no-match distinct from absence, and restore authorized active or archived rows by identity. SKU/unit and foreign-tenant assertions use actual rows. | PASS |
| E35-7-STATE-validation / E35-7-T-validation | S:90,210,484,709 and P:80,106,687 associate retained invalid fields with linked errors and avoid a success claim. Exact validators enforce basis points and öre precision. | PASS |
| E35-7-STATE-denied / E35-7-T-denied | S:69,321 and P:66 exercise anonymous/authenticated no-access paths. Seven role-aware integration cases plus scoped settings/pricing RLS and command negatives cover unentitled/foreign targets and absence of side effects. | PASS |
| E35-7-STATE-revoked / E35-7-T-revoked | S:321 revokes a current membership after render. The action is denied, write controls disappear and reload denies access. Fixture checks show no company row or audit mutation. Producer operation tests cover denial after an ambiguous attempt. | PASS |
| E35-7-STATE-connection-required / E35-7-T-connection-required | P:249 retains the selected input and existing row offline, observes zero action POSTs and no saved claim, then verifies one explicit save and the authoritative result after reconnect. | PASS |
| E35-7-STATE-submitting / E35-7-T-submitting | S:484 and P:687,2404 hold a captured attempt. Pending labels, one dispatched operation, protected controls and independent neighboring controls are asserted before release. | PASS |
| E35-7-STATE-error-retry / E35-7-T-error-retry | S:210,484,709 and P:687 retain invalid input and exercise explicit correction. Producer rollback cases prove zero business/audit/receipt effects on rejection, then allow the same attempt to commit after proven rollback. | PASS |
| E35-7-STATE-unknown / E35-7-T-unknown | S:484 and P:687 show real reply-loss ambiguity and same-operation reconciliation before consequential retry. Exact producer command/RLS cases check replay and no duplicate effects. | PASS |
| E35-7-STATE-stale / E35-7-T-stale | S:484 and P:961 use competing writes and exact expected revisions. Pricing separates a held rejected response's reread, retains raw input and focus, and requires explicit current-facts adoption. Producer conflict cases prove no overwrite. | PASS |
| E35-7-STATE-confirmed / E35-7-T-confirmed | S:484,709 and P:961,1854,2404 bind matching action/receipt and current authorized row. Historical success is distinguished from unavailable, missing or newer current facts. | PASS |
| E35-7-STATE-dirty-navigation / E35-7-T-dirty-navigation | S:251 and P:249 verify canceled link, Back, Forward and row replacement preserve the actual selection, raw draft and available history. Explicit discard allows departure. | PASS |
| E35-7-STATE-late-result / E35-7-T-late-result | P:2404 holds A's exact operation and revision before dispatch, blocks B and route exit, then confirms only A. B keeps its original revision/value and inherits no receipt. P:961 also proves neighbor-refresh independence. | PASS |

## Evidence limits and release handoff

`locked` and `focus-dialog` are inherited when consumed. `unavailable` as a common state ID and unowned file operations are N/A. The real read-error recovery case is evidence for independent outcomes within AC6. The mounted guard covers owned form actions, local links and supported cancellable traversal. Shared shell logout, hard reload/closure/crash, and unsupported traversal remain outside the claimed protection.

| Release obligation | Owner role | Status and next action |
| --- | --- | --- |
| E35-7-REL-1 | UI owner | Deferred. Bind the release candidate and complete wider device, reflow, visual comparison and composite contrast coverage. |
| E35-7-REL-2 | QA/accessibility owner | Deferred. Assign the manual matrix and capture native virtual keyboard, screen-reader, keyboard/touch and daylight evidence. |
| E35-7-REL-3 | Coordinator | Deferred. Consolidate the two evidence packages and release decision at the Phase B checkpoint. Preserve existing E16/E20 caveats. |

Named release assignees and qualifying release evidence are pending in the supplied record. The shared deferred-work ledger is outside this write allocation. The story-local entries are the handoff for its authorized owner. The trace workflow's default shared summary and temporary matrix outputs also fall outside the four-file allocation. This report holds the matrix and the companion JSON holds the deterministic one-story epic gate. The development PASS is neither a release sign-off nor a new deployment authorization. [Machine-readable decision](closeout-gate-decision.json) · [NFR assessment](closeout-nfr-assessment.md) · [Test review](closeout-test-review.md)
