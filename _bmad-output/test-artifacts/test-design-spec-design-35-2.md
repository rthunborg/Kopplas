---
workflowStatus: completed
runScope: epic-level
runKey: epic-spec-design-35-2
scope: single-story-35-2
totalSteps: 5
stepsCompleted: [step-01-detect-mode, step-02-load-context, step-03-risk-and-testability, step-04-coverage-plan, step-05-generate-output]
lastStep: step-05-generate-output
nextStep: ''
lastSaved: '2026-10-28'
implementationStatus: not-started
runtimeEvidence: pending
release_ready: false
inputDocuments:
  - _bmad-output/specs/spec-design-35-2/SPEC.md
  - _bmad-output/specs/spec-design-35-2/stories/35-2-tokens-font-and-real-login.md
  - _bmad-output/specs/spec-design-35-2/source-binding.json
  - _bmad-output/implementation-artifacts/spec-35-2-tokens-font-and-real-login.md
  - _bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-2.md
  - docs/quality/story-35-2-approved-admission-2026-10-28.json
  - docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md
  - docs/process/development-completion-policy.md
  - docs/quality/frontend-quality-gate.md
  - _bmad/tea/config.yaml
  - _bmad-output/planning-artifacts/prd-phase-b.md
  - _bmad-output/planning-artifacts/architecture-phase-b.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md
---

# Test Design: spec-design-35-2 — Tokens, Font and Real Login

**Date:** 2026-10-28. **Author:** TEA delegate for Rasmus. **Status:** Complete planning document; implementation and verification pending. **Route:** Sol High for actual authentication/session assessment, as selected by the parent; token/font/presentation scope remains ordinary. This is an epic-level method applied to one approved story, not an E35-wide plan.

## Executive Summary

Use the [approved canonical slice](dt-2026-10-23-test-design/slice-35-2.md) unchanged. This document binds its existing IDs to current login seams, identifies risks and execution evidence, and supplies the Phase 2 handoff. It creates no test scaffold, source change, feature, global ledger or new approval requirement.

Approved candidate: `65be26c5e6e2923ea0298160f4da54a987bed0fe`; inspection HEAD: `e1f02d489b06bb14d3ce98400a2b221e106d234a`, on `codex/story-35-2-foundations-login`. The approved candidate is an ancestor; intervening tracked changes are adapter/process documentation, with no product source change. All sourceFiles and readOnlyConsumerBaseline hashes in [source-binding.json](../specs/spec-design-35-2/source-binding.json) matched during this run. Implementation must bind its eventual actual candidate separately.

The canonical spec SHA-256 remains `ee7bc75184a16d3c6f46623321882f490986deadb81bc9a0dd92e0ba42eb6ff0`; canonical slice SHA-256 remains `b5da79654364f05ddf7b1fdc2263f1c757e620638741db499538a66206a55eae`. Both were recomputed and matched. The dated [admission](../../docs/quality/story-35-2-approved-admission-2026-10-28.json) supplies actual human approval and official Inter v4.1 selection; historical preparation blockers in immutable originals are not repeat approval gates.

Seven risks are planned, five scoring 6. Security, request/recovery correctness, inherited styles and usable sign-in drive the plan. Coverage retains seven numbered AC IDs and nine applicable state IDs: **16 traceability bindings, not 16 new test functions**. Reuse existing authority assertions and combine state aliases into approximately 7–10 focused cases where useful. Final executable counts belong to implementation evidence, never this estimate. QA effort is approximately 8–16 hours after runtime admission, excluding blocked elapsed time and separate exhaustive release validation.

## Not in Scope

| Item | Reason | Treatment |
| --- | --- | --- |
| Other E35 stories; scheduling/time redesign; unallocated primitives | Single-story allocation | Representative inherited regression/captures only; source owners retain their behavior and paths |
| BankID, identity picker, demo impersonation, password reset, signup | Prototype ideas are not approved login features | Real email/password form and existing role landing only |
| New Auth/session protocol, command receipt, idempotency key, endpoint or durable retry queue | Current Auth and server guards remain authoritative | Inject failures at existing seams; assess any necessary sensitive fix at High |
| New file/upload/editor/dialog features | Canonical applicability is N/A | Preserve affected existing consumers without enrolling their whole feature programs |
| Schema, dependencies, environment, hosted services, merge/deploy | Documentation-only phase and bounded admission | No writes or launches; no demo backend tests |
| Exhaustive browser/device/daylight/manual release matrices | Separately owned release obligations | Preserve `E35-2-REL-1/2/3` and existing delivery/deferred-work records; no competing ledger |

## Risk Assessment

Probability: 1 unlikely, 2 possible, 3 likely. Impact: 1 minor, 2 degraded, 3 blocks core use or breaches authority. Scores are planning judgments based on inspected seams, not observed production failure rates. Priority is assigned separately from score. Scores ≥6 require mitigation; none is marked mitigated by a plan alone.

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Concrete failure | P | I | Score | Mitigation / planned verification | Owner | Timeline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | SEC | Presentation changes redirect before server-visible session, bypass role landing, expose credentials or show protected content on rejection | 2 | 3 | 6 | Preserve public browser client, refresh→replace ordering, cookie-bound resolver and root landing; reuse real Auth/tenant/role negatives and containment checks under `E35-2-T-AC7` | Implementation + independent High reviewer; QA executes | Before development complete |
| R-002 | TECH | Repeated click/Enter dispatches overlapping sign-ins, or ambiguous failure is presented as confirmed authentication | 2 | 3 | 6 | Hold/reject actual sign-in promise; count calls through the real form; test recoverable definite failure and ambiguous response separately; authoritative server context confirms success | Implementation/QA, High for sensitive fixes | Before development complete |
| R-003 | TECH | Root font/spacing aliases resize unowned jobs, documents or booking/scheduling/time actions and hide labels/focus | 2 | 3 | 6 | Use bounded inherited representatives and actual computed layout; avoid global numeric-scale replacement without impact evidence; retain existing functional regressions | UI implementation/QA; Coordinator reconciles owners | Before shared edits and completion |
| R-004 | BUS | Disabled/error/focus text becomes unreadable or the phone keyboard/reflow hides submit/error | 2 | 3 | 6 | Actual contrast, focus, keyboard/touch, ≥44px actions and connected phone/desktop journeys under AC2/4/5 | UI implementation + QA/accessibility | Before development complete |
| R-005 | OPS | Missing captures or unavailable trusted hosted source binding are treated as passed, allowing an unverified foundation to be called ready | 3 | 2 | 6 | Record pending evidence, use validated guarded runtime, run configured production capture/exact-head checks and initial owner visual acceptance; qualify trusted-controller source integration separately | Coordinator/runtime owner; UI reviewer; Rasmus accepts foundation | Before development/review-ready claim |

### Medium and Low Risks

No medium-scoring risk is separately introduced for this bounded change.

| Risk ID | Category | Description | P | I | Score | Action / owner |
| --- | --- | --- | --- | --- | --- | --- |
| R-006 | TECH | Wrong local Inter bytes, missing license, missing italic/weight fallback | 1 | 2 | 2 | Verify approved asset hashes/license and rendered font family/weights; implementation/QA before completion |
| R-007 | PERF | Local font loading causes visible fallback/reflow or stalls login; no login-specific numeric SLO is specified | 1 | 2 | 2 | Observe font requests/ready state and normal pilot responsiveness; record measurements and uncertainty, no invented latency threshold; UI/QA |

Categories: TECH technical/integration; SEC authority/exposure; PERF responsiveness; DATA data integrity; BUS customer-visible use; OPS operational/evidence readiness. No new money or business transaction is introduced, so no synthetic DATA scenario is added.

## NFR Planning

This plans evidence for later assessment; it assigns no final NFR PASS/CONCERNS/FAIL verdict.

| Category | Requirement / threshold | Risk | Planned level/tool and evidence |
| --- | --- | --- | --- |
| Security/privacy | Zero protected content on unauthenticated/denied path; no service-role client access; no credential/secret exposure or raw account-enumerating error | R-001 | Existing resolver unit/integration and real-cookie E2E/role negatives; containment reports, sanitized trace and independent High review |
| Reliability | One active user submission; rejection retains suitable in-memory input, permits explicit retry; no success before authority confirms | R-002 | Controlled actual sign-in seam plus real Auth landing; call counts, visible state and routing sequence assertions, failure/recovery trace |
| Accessibility/usability | All actual text ≥4.5:1; applicable non-text contrast; visible focus; phone targets ≥44px; connected 360×640 and representative desktop; enlargement/keyboard leaves action/error reachable | R-004 | Production-browser measurement and interaction evidence, exact-state PNGs, keyboard/manual evidence where browser emulation cannot measure virtual keyboard truthfully |
| Maintainability/scope | Existing Tailwind v4 semantic aliases, one token source; no framework replacement/pending surface; headless auth authority retained | R-003 | Actual computed consumer behavior plus applicable lint/type/build/scope/containment checks; source review rather than tautological CSS-copy tests |
| Performance | PRD NFR24 pilot responsiveness; NFR26 defers broader sizing. Login/font-specific numeric latency/CLS budget is **UNKNOWN**, not zero and not a new release SLO | R-007 | Observe actual local font loading/layout and regression responsiveness; record duration/layout evidence without claiming numerical SLO compliance |
| Font provenance | Exact approved official Inter v4.1 roman/italic/license; 400/500/600 and tabular numerals | R-006 | Asset SHA-256/license check and rendered computed font/number behavior, packaged asset evidence |
| Operational evidence | Current full-head production-server captures, applicable required CI and independent review; no skipped suite passes | R-005 | Build/capture logs, exact candidate/report counts/skips, accepted evidence package and delivery record |

No new scalability/load/compliance program is required by this presentation slice. Auth SDK behavior is tested at the repository's installed versions and actual seam; this plan does not claim new provider behavior. Missing performance numbers remain a documented planning limit, not a reason to request another business approval.

## Entry Criteria

- Canonical hashes, approved admission/allocation and current shared-path owners remain valid; refresh if the base changes. Original copied links resolve relative to the immutable canonical source, not the adapter's relocated body.
- Owned product paths remain `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(auth)/login/page.tsx`, `src/app/fonts/`, `public/licenses/inter/`. Exact extra primitive allocation is needed before edits.
- Use synthetic local Auth fixtures from existing setup (active tenant admin, orphan/no active membership and admitted role fixtures), unique run isolation and current cleanup. Never expose fixture passwords, cookies/tokens or server-only credentials in screenshots/reports.
- Runtime tests require valid actor-bound resource admission, ready local services and Playwright's configured production build/start server. Root now reports a verified guard-owned browser; application/server/database readiness and actual execution remain separate checks.
- Inspect actual implementation before deciding whether a narrow component seam test is needed. Reuse existing Node/Vitest/Playwright infrastructure; no package or new harness is authorized here.

## Exit Criteria and Quality Gates

- Planning completion means every applicable canonical binding has a concrete assertion/reuse route and documented limit. It is not development completion.
- Development requires **100% P0**, and this small slice requires **100% of applicable P1 acceptance bindings**. The generic ≥95% template threshold cannot excuse a consequential failed AC. No open high-severity defect or unmitigated high risk; security negatives pass completely. P2/P3 new story scenarios are N/A; inherited required CI remains required.
- Traceability target is 100% of seven AC and nine owned-state bindings, with inherited/N/A classification preserved. A generic ≥80% aggregate or line-coverage target does not replace required behavior; no new artificial unit coverage quota is introduced.
- Applicable static/type/lint/build/lock/audit/containment, focused changed-behavior checks and current required DB/integration/RLS/recovery lanes must have actual counts and `SUPABASE_TEST_REQUIRED=1` where required. Explicit skips are uncovered. Existing money/golden/storage policies remain current-policy gates, not new login tests.
- **October 26 frontend amendment applies:** actual current-head production-server screenshots at desktop and 360×640, relevant states and inherited representatives, plus independent image review or authenticated manual acceptance. Initial foundation rendering additionally needs Rasmus's visual acceptance. Missing/stale/failed visuals block development/review-ready claims. Approval of Inter/source composition is not this implemented acceptance.
- Independent review uses actual changed scope, High for auth/security, exact-head CI and required delivery/completion gate. An author-written final Suggested Review Order belongs to implementation, not this planning document. Frontend PR must carry verified `agent-fix` unless owner opts out. No merge/deploy authority is supplied.
- `release_ready=false` until separately required release evidence and approval exist. Later NFR assessment consumes actual evidence; none is fabricated here.

## Test Coverage Plan

**P0/P1/P2/P3 describe priority, not execution timing.** Canonical IDs/priorities remain intact: AC7 is P0, AC1–6 are P1. State clauses below are P1 usability/reliability assertions; underlying server authority is covered by P0 AC7. Tables reference each other to avoid duplicate tests.

### P0 (Critical)

Criteria: security/authority failure prevents safe sign-in, with no safe client workaround.

| Existing test ID | Requirement / meaningful assertion | Level | Risk | Owner / reuse |
| --- | --- | --- | --- | --- |
| `E35-2-T-AC7` | From actual unauthenticated `/login`, denied/failed sign-in never exposes shell/tenant data. Real success yields cookie-bound server context, current tenant and role-derived destination; logout re-protects routes. Browser styling cannot grant permission or change public-surface set. | Existing unit + DB integration for authority; E2E for real cookie/landing outcome (different invariants) | R-001 | Implementation/QA + High reviewer; reuse resolver and role harness suites listed below |

### P1 (High)

Criteria: core usable login and shared foundation behavior, material reach and limited workaround.

| Existing test ID | Requirement / meaningful assertion | Level | Risk | Owner / reuse |
| --- | --- | --- | --- | --- |
| `E35-2-T-AC1` | Actual login and bounded inherited consumers render accepted white/ink/semantic spacing/type/radii, with one token source and visible labels/actions. Verify computed outcomes/reflow, not mirrored CSS declarations. | Browser + source review | R-003 | UI/QA; reference plan and inherited table |
| `E35-2-T-AC2` | Verify approved local roman/italic/license bytes, 400/500/600, plain wordmark and tabular numerals; measure actual disabled/inverse/composite text ≥4.5:1 and applicable focus/control contrast. Missing provenance is now resolved by admission, actual packaging/rendering remains pending. | Bounded asset check + browser measurement | R-004/006/007 | UI/QA; approved font hashes below |
| `E35-2-T-AC3` | Invalid→corrected credential journey, delayed submit, definite/ambiguous connection failure, explicit recovery, keyboard submission and unchanged role landing. No client success claim on rejected sign-in. Shared dialog regression is inherited only. | Actual handler seam for deterministic call/order/error assertions; essential real Auth E2E for session | R-001/002 | Implementation/QA; state bindings below |
| `E35-2-T-AC4` | Complete real Swedish credential form at 360×640 and 1440×900: label→control association, ≥44px phone actions, Tab/Enter/touch, visible error, zoom/enlargement/reflow. Confirm actual current user/tenant after login; no invented login record. | Browser, focused manual virtual-keyboard check | R-004 | UI/QA; no screenshot-only success proof |
| `E35-2-T-AC5` | Visible focus on actual controls; preserve affected inherited dialog open/close/Escape/trigger return and existing motion/reduced-motion behavior. No owned dialog/draft/motion added; canonical dialog/dirty/late-result rows stay N/A. | Browser on actual affected representative only | R-003/004 | UI/QA + existing source-owner regression |
| `E35-2-T-AC6` | Owned state rows below distinguish error/denial/unsent/unconfirmed/confirmed. Revoked is inherited; all other N/A rows stay absent. No file result, amount, audit receipt or generic saved badge is added to login. | Reuse state and authority cases, no separate duplicate suite | R-001/002 | Implementation/QA |

### P2 / P3

No new secondary/cosmetic feature cases are enrolled. Exhaustive comparison/device/manual release work remains under original release IDs, independent of priority labels. Do not create tests solely to populate these sections.

### Existing State IDs — Concrete Login Binding

Every owned row preserves `E35-2-STATE-<suffix>` and `E35-2-T-<suffix>`. Rows sharing one journey are aliases to assertions within that journey, not a requirement for separate test files/functions. Caller is an unauthenticated existing user submitting the real form; current Auth/tenant/role fixtures supply authority.

| Suffix (Applies; P1) | Controlled trigger at actual seam | Assertion and bounded interpretation |
| --- | --- | --- |
| `loading` | Hold `signInWithPassword` before response, or hold normal server resolution after navigation | Show actual pending context without a completed landing or private data; retain form structure/values while on login. Login has no initial record read: do not create one. This shares the delayed-submission case. |
| `loaded` | Real server context resolves through root and protected layout after successful sign-in | Authorized existing tenant/user and role destination match fixture. Initial login-ready form has no domain record/freshness fields to fabricate. Shares successful landing, with authority asserted by AC7. |
| `validation` | Submit invalid credentials to existing Auth seam, then correct credentials | Safe Swedish invalid-credential alert, labeled controls and suitable input retained, no refresh/replace on rejection, corrected explicit submit succeeds. Current form has `noValidate` and no local validation/summary API: do not invent a validator/summary/field protocol. Verify accessible error association/focus without pretending Auth identifies which credential is wrong. |
| `denied` | Invalid credentials; separately real orphan/disabled/non-entitled context in existing authority fixtures | Generic feedback and no shell/tenant payload leakage. Credential rejection and authenticated no-membership landing are distinct assertions; do not transform denial into empty state or grant. |
| `connection-required` | Reject before successful Auth response using current browser-client seam | Persistent safe connection/failure explanation, retained in-memory suitable values and enabled explicit form retry. No queued/reconnect submission, durable credential storage or signed-in claim. Reuse actual catch path rather than invent connectivity API. |
| `submitting` | Hold sign-in promise, attempt second click and Enter submission via real form | Pending “Loggar in…”/disabled action; count exactly one active sign-in attempt. Test meaningful form submission, not only `disabled` markup. Existing handler lacks an explicit in-handler pending guard; evaluate observed behavior before a bounded fix. No command identity protocol. |
| `error-retry` | Definite Auth error or thrown rejection with known no successful client session; then explicit corrected/restored attempt | No success/navigation for failure; feedback and values retained, pending clears, next explicit attempt calls current sign-in once and can reach real server-authorized landing. Never auto-retry credentials. |
| `unknown` | Lose response after dispatch, rather than returning an explicit invalid-credential result | Outcome is unconfirmed: no success/credential-denial assertion from transport ambiguity, no blind automatic retry. Existing ordinary navigation/reload into server `resolveTenantContext` is the reconciliation authority if a cookie/session exists; confirmed unauthenticated context returns login. Do not claim provider session issuance is exactly-once or add receipt/version/status endpoint. If current SDK seam cannot distinguish pre/post-response outcomes, retain this explicit evidence limit and route any needed behavior change at High; mocks alone cannot prove real cookie reconciliation. |
| `confirmed` | Real successful sign-in and cookie-bound server root/protected-layout resolution | `router.refresh()` precedes `router.replace('/')`; actual root chooses role landing. Assert entitled fixture identity and current destination, no stale prior-user content. The login result is authentication, not a saved domain record/version, file link or neighboring-command receipt. |

**Inherited:** `revoked` preserves existing live server membership/role checks if affected; original regression IDs/revision remain. **N/A:** `empty`, `no-match`, `unavailable`, `stale`, `locked`, `dirty-navigation`, `late-result`, `focus-dialog`; login/root has no owned record list/editor/dialog/file command. Existing downstream dialog/focus/domain protections remain regression obligations only where inherited globals affect their usable UI. No new `file-*` IDs are instantiated.

## Interworking & Regression

The [reference/inheritance binding](../../docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md) owns exact representative source paths and source hashes. It is not a blanket write claim. Use a minimal affected-surface sample while recording all affected consumers in the actual visual package; do not expand this plan into a whole-site feature test program.

| Surface / seam | Reuse and bounded scope |
| --- | --- |
| Login/root → protected tenant authority | `tests/e2e/auth/login-and-tenant-context.e2e.spec.ts` preserves existing AC1/AC2/AC3 and logout loop; `tests/unit/server/auth/resolve-tenant-context.test.ts`, claims/core/edge suites and `tests/integration/server/auth/resolve-tenant-context.int.test.ts` preserve current authority. Presence was inspected; no new run is claimed. |
| Role landing/navigation | `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts`, role catalogue/harness and permission matrix tests; derive destination from current `resolveLandingRoute`, never historical prose or hard-coded universal dashboard. |
| Operator/public HTML | Existing `operator-console.atdd.e2e.spec.ts` isolation plus representative readable inherited labels/actions; preserve original cases. Public HTML font/reflow may inherit; calendar-feed ICS is not styled. |
| Jobs/records, documents/files, dialogs | Representative existing job list/workspace, selected document preview/files controls, BookingEditor dialog focus/action. Existing job/files/booking E2E suites remain their source-owner regressions; no new uploads/receipts/lifecycle cases. |
| Scheduling, time/Min dag, profile/calendar settings | Representative font/reflow/action/focus inheritance only, existing semantics unchanged; no E15 presentation takeover. Preserve current required suite selection and owner allocation. |
| Auth mail/admin lifecycle | Canonical admin-user-management/roles, auth-mail-callback and role-catalogue suites remain reusable. Expand focused execution only if actual changed lines/consumer impact reach them; no new mail flow. |

Use the actual `LoginPage.handleSubmit → createSupabaseBrowserClient().auth.signInWithPassword` seam for deterministic delay/failure. `src/server/db/supabase-browser-client.ts` uses browser-safe public configuration and cookie persistence; `src/app/page.tsx`, protected app layout and server resolver retain authority. A narrow caller test may mock that imported seam and router for call counts/order; only a real-cookie test establishes Auth/session landing. Do not add production state-forcing hooks or model tests that only echo newly written CSS.

## Execution Strategy

| Lane | Plan |
| --- | --- |
| PR | Run all focused functional cases when under 15 minutes and retain all current required CI partitions regardless of this estimate. Use existing serial Playwright fixture model (`workers: 1`) unless separately safely changed; generic parallelization advice does not override shared Auth fixtures. Build/start through configured production web server; never `next dev`. Run actual essential success/failure/retry and exact-head visual gate. No new workflow configuration is proposed. |
| Nightly | No new nightly suite required by this story. Existing long-running/performance programs retain their owners. Do not move mandatory functional/visual acceptance here to hide unavailable infrastructure. |
| Weekly / release checkpoint | Exhaustive browser/device, screen-reader/daylight and broader manual checks follow original release responsibilities. They do not replace required current-head development evidence. |

Observe intercepted failures before triggering submission, use accessible labels/roles and deterministic response/condition waits, and restore each test's own network/fixture state. Negative auth requests are expected failures, not globally suppressed errors. Reports/trace must minimize credentials and session material. Failed test outcomes stay failures; no screenshot or mocked response substitutes for persistence/authority.

## Resource Estimates and Prerequisites

| QA effort | Range | Basis |
| --- | --- | --- |
| P0 existing authority reuse and exact-candidate verification | ~2–4 hours | Existing fixtures/negative suites; no new permission policy |
| P1 login failure/recovery/accessibility/font and bounded inherited evidence | ~6–12 hours | Controlled seam cases, two viewports, source/render/capture provenance |
| P2/P3 new story cases | ~0 hours | No new scenarios enrolled |
| Total focused QA | ~8–16 hours, approximately 0.2–0.5 working weeks | Excludes implementation, blocked elapsed time, owner scheduling and exhaustive release matrices; environment failure can widen estimate |

Use existing fixtures/factories and cleanup; do not launch paid services or create resources in this phase. Playwright Utils config is true but `@seontechnologies/playwright-utils` is absent from `package.json`: the library mandate's second gate is false. Reuse installed project patterns; no dependency/import migration. Pact package/artifacts and service-contract requirement are absent, so no Pact scaffold. `pact_mcp_reachable=false` from one tool-list probe: **Pact broker unreachable (SmartBear MCP tools not available); source seams, not broker provider states, informed this plan.** No broker call/retry occurred. No generated code means no emitted utility deviations.

Official Inter v4.1 expected SHA-256: roman `4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf`; italic `d6f1f6a172d9e588438db9f986fd5cfad7b30f644374080a8a9d4d91e344586f`; license `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a`. These are approved expectations, not proof the assets are already packaged or rendered.

## Mitigation Plans and Evidence Ownership

All high-risk rows remain **planned/open for execution**. For R-001, implementation preserves the current boundary, QA runs existing authority and real Auth outcomes, independent High review verifies actual changed scope. For R-002, control the current promise and count repeat submissions, distinguish definite failure from ambiguous response, and retain unresolved provider/cookie evidence limits. For R-003, reconcile shared consumers before root edits and compare their real layout/actions afterward. For R-004, measure real composite contrast/focus/target geometry and complete phone/desktop interaction. For R-005, Coordinator supplies valid actor/resource admission, UI owner records candidate/build/capture provenance, reviewer checks original captures and Rasmus performs initial foundation acceptance. All complete before development claims; no waiver or resolution is inferred here.

## Assumptions, Dependencies and Pending Work

The approved one-story admission and exact source composition remain authoritative. Reference IDs `E35-2-REF-D/M-IDLE`, `ERROR`, `PENDING`, `FOCUS` bind the named desktop/phone composition; no promoted raster exists yet. Static source composition is not an implemented capture or a successful login. Earlier `HOOK_CONTEXT_UNAVAILABLE` is historical/resolved: after the owner's direct Continue, root reports verified guard-owned Chrome resource `6c0efc86-8dfc-4f90-a0f1-8e4dc6e0bf09`. Root owns lifecycle. This delegate started/used no resource and performed no captures; runtime evidence remains unexecuted. Follow supported actor/resource ownership and readiness checks, never reuse another actor's context or bypass the guard. No new business decision is needed for this documentary plan.

**Hosted acceptance dependency:** parent reports the paired EXPERIENCE/policy source fix is bound to approved local candidate `65be26c5…`; trusted main/controller at reported `734d…` still has the earlier mismatched source/policy pair and empty references. Local trusted-source validation passing does not prove hosted readiness. Implementation/local rendering may proceed under the explicit approved candidate, while hosted visual acceptance remains contingent on separately integrating/qualifying the trusted-controller sources and accepted references. Do not weaken controller/base policy, retarget checks or manufacture a bypass. No merge is authorized by this plan; no repeat story/font approval is requested.

Actual non-text contrast measurements, virtual keyboard behavior, real response-loss/cookie reconciliation, rendered font behavior and initial visual acceptance remain pending. If a current seam cannot produce a requested fault deterministically, document exactly the unmeasured assertion and use the smallest existing seam; do not invent an endpoint, session state machine or passing claim. The Low presentation implementation delegate must hand actual authentication/authorization changes to High and retain independent High review.

Release obligations retain `E35-2-REL-1` (UI visual/device/reflow), `E35-2-REL-2` (QA/accessibility manual/screen-reader/daylight), and `E35-2-REL-3` (Coordinator final Phase B consolidation). Current frontend development visuals are required now; exhaustive remainder stays in existing delivery/deferred records with actual owner/candidate/next action. No E16 14-item or E20 caveat is rewritten. Remaining limitations are unexecuted application evidence and the specific hosted-controller dependency, not incomplete documentary planning or a repeat approval gate.

## Workflow Validation and Handoff

The installed Create workflow's epic template/checklist were applied, with explicit single-story output naming and current owner policy overriding generic deployment, duplicate approval and percentage/parallel advice. All five planning steps are complete; one scoped checkpoint records progress. Canonical IDs, hashes and applicability were checked. Template sections are populated or explicitly N/A; risk scores, levels, owners, estimates, entry/exit criteria, evidence gates and regression scope are present. No browser session or managed resource was opened, so no session cleanup is outstanding. No source, test scaffold, global tracking, branch, stage/commit/push or PR action occurred.

Planning can hand off to the installed next Auto-BMAD phase. ATDD/automate are separate workflows; neither was auto-run by this test-design task. Implementation execution and acceptance must resolve the evidence above before completion. This document grants no deployment, merge, release or paid-model authorization.

## Appendix — Sources and Knowledge

Primary binding: [adapter](../specs/spec-design-35-2/SPEC.md), [immutable canonical specification](../implementation-artifacts/spec-35-2-tokens-font-and-real-login.md), [canonical test slice](dt-2026-10-23-test-design/slice-35-2.md), [common contract](../planning-artifacts/design-transition-2026-10-23/story-preparation/common-contract.md), [source binding](../specs/spec-design-35-2/source-binding.json), [reference/inheritance](../../docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md), [completion policy](../../docs/process/development-completion-policy.md), [frontend gate](../../docs/quality/frontend-quality-gate.md), [model routing](../../docs/process/agent-model-routing.md). PRD/architecture, DESIGN/EXPERIENCE and actual source/test paths were consulted for this slice; no legacy application was browsed or presented as new evidence.

TEA knowledge: library/Playwright utility mandates (flag plus installed-package gate); risk-governance; probability-impact; test-levels-framework; test-priorities-matrix; nfr-criteria; fixture/network-first/data-factory/test-quality/selectors/confidence/evidence-integrity guidance; relevant utility, Pact-MCP and CLI guidance. Supabase skill informed auth-specific security context; no provider API change or query was performed. No system-level architecture/QA/handoff documents were generated because this invocation is epic-level and single-story.
