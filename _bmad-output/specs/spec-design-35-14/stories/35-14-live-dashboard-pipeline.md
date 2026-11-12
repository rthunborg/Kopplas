---
title: "Story 35.14: Live Dashboard Pipeline"
status: blocked
tracking_key: 35-14-live-dashboard-pipeline
baseline_revision: a1404c36796774db8362d23beaf49657c1d92459
context:
  - docs/process/review-order.md
  - _bmad-output/specs/spec-design-35-14/SPEC.md
  - _bmad-output/specs/spec-design-35-14/operative-contract.md
  - _bmad-output/specs/spec-design-35-14/dependency-amendment.json
  - _bmad-output/specs/spec-design-35-14/test-design.md
---

# Story 35.14: Live Dashboard Pipeline

## Status and intent

Owner-approved implementation candidate; native admission and implementation have started. Independent review, required runtime evidence and human visual acceptance remain pending. As an entitled existing user, I want the accepted E19.1 dashboard composition so I can understand live projected pipeline facts and follow the current destination with accessible, honest read outcomes. The current owner approval supersedes the frozen original's preparation-only status.

## Acceptance Criteria

All seven original numbered `E35-14-AC1` through `E35-14-AC7` in `../source-intent.md` are incorporated unchanged and must be read in full with `../source-test-design.md`. Preserve their original test IDs and eleven Applies STATE/T pairs. Validation, submitting, unknown, confirmed, locked, dirty-navigation and focus-dialog remain N/A for this read-only flow; no file command is created. Source preservation is verified in the evidence manifest.

## Dependencies

Operative dependency record: `../dependency-amendment.json`. Owner-approved removal of the historical **35.13 proposed-order-only edge** applies solely to this E19.1-only leaf. No DT-B15, 35.13 implementation or scheduling/time output is consumed. Existing qualified-main E19.1 projection, shared presentation foundations and source contracts remain prerequisites; the native plan binds them explicitly. Historical story-index/source wording remains intact as history and is not the operative dispatch dependency.

## Tasks

- Verify the exact current assignment, source/base, seven product paths and frozen host/producers before editing.
- Adapt only the allocated dashboard widget subtree/components; preserve onboarding and current role/withholding/deep-link behavior.
- Add the feature-local design spec in General and preserve/adapt the existing pipeline spec in the dedicated dashboard lane; execute meaningful real read/role/payload/failure/retry/accessibility assertions.
- Obtain actual production 360×640/desktop captures, independent exact-diff review and the current frontend completion/visual gate; record broader release duties through existing delivery records.

## Ownership and verification

Read `../operative-contract.md`, `../source-binding.json`, `../retained-reservations.json` and `../test-design.md`. Seven product paths are closed; ordinary protocol metadata has separate ownership. No shared fixture/config/registry/producer or global tracking edits. Existing release obligations and E16/E20 caveats retain provenance. No test/build/browser/visual evidence is claimed by this source preparation.

## Implementation-author review trail

The later implementation/fix author supplies one final Suggested Review Order after code and verification exist, following the adopted project convention. No selectable placeholder final section or invented line/test result is supplied here.

## Dev Agent Record

Source/dependency/ownership preparation: gpt-6.1-sol High. `implementation_started=false`; `development_complete=false`; `release_ready=false`. Separate exact-package review and qualified-source/native admission remain mandatory before launch.

## Implementation verification

Implementation author `/root/dashboard_35_14_worker/build/implementation`, Sol Low,
adapted the three bounded dashboard presentation components and added capture
attachments to the two allocated E2E tests. The original host, producers, registry,
read/refresh contracts and seven ACs remain unchanged. The earlier preparation
record above remains historical; implementation_started=true for this candidate.
Development_complete=false; release_ready=false. Required runtime, independent
review and candidate-bound human visual acceptance remain pending.

The current test-only same-response observer correction is based on clean `bdd13a8ea05ca93a45b01d8a335dbcc062e05ae8`; the earlier oracle/correlation and whole-viewport correction remains historical evidence.
See [verification and all eleven state bindings](../../../implementation-artifacts/evidence/35-14-dashboard/implementation-verification.md)
and the adjacent product/test byte fingerprint. Pinned offline install, production
build, typecheck, lint and 119 focused tests passed (zero failed/skipped); all 55
collected browser tests were unrun at that author checkpoint. Later hosted evidence is recorded below; this correction launches no resources. The parent owns exact-head CI/review/visual continuation; no done claim.

## Suggested Review Order

Author: `/root/dashboard_35_14_worker/build/implementation` (implementation author).
Test-seam/trail refresh author: `/root/dashboard_35_14_worker/late_refresh_medium`, Sol Medium (recorded escalation after two Low refinements). Refreshed against the same-genuine-response observer correction over `bdd13a8ea05ca93a45b01d8a335dbcc062e05ae8`;
the evidence fingerprint pins final product/test and story bytes.

### Current dashboard facts within the frozen host

I retained the current server/read composition and changed only feature-local
appearance. Semantic tokens, flat cards, tabular counts and a single phone column
apply the accepted written design while the host/onboarding and sole destination
stay intact. Compact phone padding preserves content width; desktop uses 24px. Round 1 fixes express approved type sizes in rem at the 16px baseline, preserving user text enlargement without global edits.

- `src/app/(app)/dashboard/page.tsx:30` — `async function DashboardWidgets()`: unchanged eligibility and isolated loading entry.
- `src/components/dashboard/WidgetCard.tsx:5` — `export function WidgetCard`: local card, heading and sole supported link.
- `src/components/dashboard/DashboardGrid.tsx:3` — `export function DashboardGrid`: responsive one-column/desktop registry container.
- `src/components/dashboard/QuotePipelineWidget.tsx:68` — `<dl className=`: single phone metric column, grouped desktop values.

### Honest failure, withholding and freshness

I preserved the existing projection and absent-value handling. The hosted correction prevents known-offline refresh dispatch and retains the existing actionable error; connected refresh still re-runs server authority. I preserved the server refresh
semantics rather than introducing local data state. Failure adds a persistent
connection/retry instruction without claiming a network-specific diagnosis;
the lock now uses a monochrome icon and retains its existing tooltip handlers.

- `src/components/dashboard/QuotePipelineWidget.tsx:16` — `function MaskedValue()`: focus, touch and Escape explanation.
- `src/components/dashboard/QuotePipelineWidget.tsx:58` — `state === "error"`: local failure without successful values/time.
- `src/components/dashboard/QuotePipelineWidget.tsx:75` — `entitlements.withheld.includes`: unchanged authoritative withholding branch.
- `src/components/dashboard/DashboardRetry.tsx:12` — `const retry =`: known-offline guard retains error; connected retry repeats server authority.

### Assertions and evidence limits

AC1/2/6 reuse real component states and source projections; AC3/7 reuse registry
and read-contract checks. AC4/5 retain separate usable keyboard/touch/reflow and
tooltip assertions; capture attachments supplement those outcomes. The same-batch inventory precheck proved long full-page phone PNGs were not whole 360×640 frames. Existing seams now retain full-page context and add explicitly named whole-viewport originals, with no fixture or journey expansion. Browser
execution, late-result navigation proof and actual visual acceptance remain pending.

- `tests/unit/components/dashboard/widget-state.test.ts:77` — `loading announces progress`: no fabricated values or successful timestamp.
- `tests/unit/components/dashboard/widget-state.test.ts:123` — `absent-withheld money renders Dold`: absence never becomes zero.
- `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:75` — `phone values remain in one column`: asserts actual doubled font and text bounds, then reflow; unrun.
- `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:541` — `successive failed retries recover`: retained real-source recovery; correction awaits new runtime execution.
- `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:676` — `completed refresh cannot replace newer quote navigation`: revision-specific producer hold below Suspense and controlled same-response tee, strict Quotes navigation before release, original successful browser/body completion and fresh result; prior hosted failures retained.

Evidence: pinned Next16.4.1 production build/typecheck/lint passed; 119 focused
tests passed, zero failed/skipped. SSR phone topology probe passed one assertion.
Thirty-nine frozen source hashes and the onboarding host binding match. Detailed
commands, byte fingerprint and all seven AC/eleven state bindings are recorded in
the linked implementation verification file.

Limits: SSR/mocked read-dependency tests do not prove browser/RSC/RLS behavior.
Current collection: General 3 and dedicated pipeline 54. Hosted dedicated job on cc5c37d9 executed 82 cases: 79 passed, 3 failed, zero skipped/retried. Later hosted8546 evidence is 81 passed/1 failed late-result/0 skipped/retried; offline and mobile passed. This oracle-refined candidate has not executed. Full required
DB/RLS/recovery, exact-head CI, independent review, production captures and human
substantive visual acceptance remain pending. No independent filter/module-
unavailable state is manufactured; no-match/unavailable use their actual seams.
The current AC6 correction uses the existing revision-specific quote_events hold below DashboardWidgets Suspense, allowing shared RSC material to stream normally. The real Retry starts the original live dashboard RSC request; its read must reach the actual held marker. Real AppShell Quotes URL/heading and same-document nonce must commit while that read remains unresolved. Only then is the producer released, and the same original request must finish successfully with response.finished() null, a complete genuine success body and completedAt at/after release. Abort, proxy expiry, timeout, read/body failure and cleanup failure cannot pass. Cleanup releases the actual revision, awaits started work, removes owned observers and restores the scenario; primary and cleanup errors are retained together. Request IDs, fixed paths/statuses and bounded booleans remain the only attachment facts. Trace/video/automatic screenshots stay off only for this strict test; other 53 cases and all explicit capture companions remain unchanged.

The strict case now also installs one temporary public fetch observer after login. It invokes native fetch once per call with unchanged arguments/receiver/signal, clones only the uniquely matched live dashboard response and promptly returns the SAME original Response to Next. Exact full request URL and GET/RSC/router-state/prefetch facts are compared against the original Playwright request in memory; extras, mismatch and redirects fail. The owned clone drains/discards chunks with an 8MiB byte cap and 15-second lifetime; failures are observed, fetch is restored, clone/control work is awaited and bounded cleanup fails closed. Clone EOF is only an additional witness: the original requestfinished/no-failure, response.finished() null, full genuine original-body success/freshness and Quotes/nonce guards remain mandatory. This is an explicit controlled physical-stream-lifetime intervention that may retain the HTTP stream after an application reader abandons its branch. It does NOT prove original Next-consumer completion, an unmodified production trace, the abort cause or a permanent product fix. Actual Chromium/Next feasibility is unproven until the changed runtime checkpoint.

Historical bdd hosted evidence remains81 passed/1 strict failure/0 skipped/flaky/retries (report SHA25694a42817eba1a0955234d9e9408b546385b3a975f576904141a72b73110216d0). Its actual Quotes navigation committed before release, then the original dashboard request aborted; sole inner assertion was transportSucceeded=false. No successful old producer body/completedAt or cleanup failure was observed. The original request must still succeed in this changed candidate; clone success cannot replace that requirement.

The former variant completed upstream first and withheld the entire RSC response before navigation. That transport-specific coverage is now absent; it is an author test-seam change, not a passing result or a business-gate waiver. Historical f524 hosted evidence remains 81 passed, 1 strict late-result failure, zero skipped/flaky/retries; its source JSON SHA256 is bd90778122e41338426ef9b5958bfab50cdc0e0503e3cc546f5fb3d57b03d762. Current changed-candidate lint and typecheck passed; 54 pipeline plus 3 General cases collected, zero executed locally. Product code, router.refresh, authority, layout, registry, producer, shared proxy/support/config and capture instrumentation are unchanged. Unchanged production/unit evidence is reused with its prior revision limits. The actual late-result browser pass, targeted independent reviews and current CI/visual gates remain pending. No exclusive runtime-cause, development-complete or release-ready claim is made.

## Review Triage Log

### 2026-11-12 — Review pass

**Round 1 of 3** — five internal layers plus configured external attempted on fixed 733b1ca455db1583eedd595845454162636f77f9; Coordinator-authorized capacity batches, outputs collected before triage.

- intent_gap: 0
- bad_spec: 0
- patch: 1 (medium 1, high 0, low 0)
- defer: 0
- reject: 9 (non-introduced pending-gate/capture/metadata observations; required gates remain explicitly blocked)
- addressed_findings:
  - `[medium]` `[patch]` Preserved root-font text scaling with baseline-equivalent rem sizes and meaningful computed-size/text-bound enlargement assertions. Metadata and existing capture instrumentation refreshed by author without claiming execution.

Targeted regression/trail check at f9749b6cc6ba99d512647ba3aaf334a58679338b: independent Sol Low, no findings; 12 review stops and six fingerprints validated. This was targeted fix verification, not another broad restart. External configured review remains blocked; no whole-round pass claimed.

## Auto Run Result

Status: blocked
Blocking condition: required external review cannot read diff (registered Core launch requires an installed app); frontend gate API authentication unavailable (HTTP 401); required browser/DB/RLS/recovery, late-result runtime evidence and actual visual/manual acceptance remain unmet.

Implemented checkpoint: f9749b6cc6ba99d512647ba3aaf334a58679338b over baseline a1404c36796774db8362d23beaf49657c1d92459. Three presentation components use approved tokens, flat cards, responsive phone metrics, accessible controls and rem text scaling; two E2E files retain functional assertions and add capture instrumentation. DashboardPage, DashboardRetry, producers, registry and host remain unchanged.

Follow-up review recommendation: false; patched high=0, medium=1, low=0; score=3. This does not waive the incomplete configured external layer or pending actual runtime/acceptance gates. Deferred finding count: 0.

Actual checks: pinned Next16.4.1 production build/typecheck pass; affected lint pass and full lint 0 errors/32 existing warnings; focused119 tests pass/0 failed/0 skipped; phone SSR topology1 pass; lockfile/service-role/bundle containment and39 frozen hashes pass; review-order12 references/0 errors. Browser collection3 General+52 dedicated only,0 executed. Final code fingerprints and author evidence retained under evidence/35-14-dashboard. Local frontend-controller attempted with recorded baseline and failed gh repo lookup HTTP401; no authenticated acceptance. No screenshots produced/accepted, no DB service/browser resources launched. No done or release-ready claim.

Resume: Coordinator owns supported external runtime repair, phase6 automation, exact-head provider qualification and authenticated visual evidence continuation. Preserve single draft PR153 identity; no worker publication performed. Complete required actual3 focused dashboard/quote integration files with SUPABASE_TEST_REQUIRED=1 and zero skips, both browser lanes and late-result proof, then candidate-bound visual/manual acceptance before completion. Do not copy secrets or expand ownership to fix infrastructure.