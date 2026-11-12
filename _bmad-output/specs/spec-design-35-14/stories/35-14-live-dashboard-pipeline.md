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

The current fix tree is based on independently reviewed `733b1ca455db1583eedd595845454162636f77f9`.
See [verification and all eleven state bindings](../../../implementation-artifacts/evidence/35-14-dashboard/implementation-verification.md)
and the adjacent product/test byte fingerprint. Pinned offline install, production
build, typecheck, lint and 119 focused tests passed (zero failed/skipped); all 55
collected browser tests remain unrun. No runtime resource or visual capture was
created. The parent owns exact-head CI/review/visual continuation; no done claim.

## Suggested Review Order

Author: `/root/dashboard_35_14_worker/build/implementation` (implementation author).
Refreshed against the Round 1 fix tree over reviewed `733b1ca455db1583eedd595845454162636f77f9`;
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

I preserved the existing projection, absent-value handling and server refresh
semantics rather than introducing local data state. Failure adds a persistent
connection/retry instruction without claiming a network-specific diagnosis;
the lock now uses a monochrome icon and retains its existing tooltip handlers.

- `src/components/dashboard/QuotePipelineWidget.tsx:16` — `function MaskedValue()`: focus, touch and Escape explanation.
- `src/components/dashboard/QuotePipelineWidget.tsx:58` — `state === "error"`: local failure without successful values/time.
- `src/components/dashboard/QuotePipelineWidget.tsx:75` — `entitlements.withheld.includes`: unchanged authoritative withholding branch.
- `src/components/dashboard/DashboardRetry.tsx:12` — `const retry =`: unchanged explicit refresh through current server authority.

### Assertions and evidence limits

AC1/2/6 reuse real component states and source projections; AC3/7 reuse registry
and read-contract checks. AC4/5 retain separate usable keyboard/touch/reflow and
tooltip assertions; capture attachments supplement those outcomes. Browser
execution, late-result navigation proof and actual visual acceptance remain pending.

- `tests/unit/components/dashboard/widget-state.test.ts:77` — `loading announces progress`: no fabricated values or successful timestamp.
- `tests/unit/components/dashboard/widget-state.test.ts:123` — `absent-withheld money renders Dold`: absence never becomes zero.
- `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:64` — `phone values remain in one column`: asserts actual doubled font and text bounds, then reflow; unrun.
- `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:517` — `successive failed retries recover`: retained real-source recovery, currently unrun.

Evidence: pinned Next16.4.1 production build/typecheck/lint passed; 119 focused
tests passed, zero failed/skipped. SSR phone topology probe passed one assertion.
Thirty-nine frozen source hashes and the onboarding host binding match. Detailed
commands, byte fingerprint and all seven AC/eleven state bindings are recorded in
the linked implementation verification file.

Limits: SSR/mocked read-dependency tests do not prove browser/RSC/RLS behavior.
General 3 and dedicated 52 browser tests are collected but unrun. Full required
DB/RLS/recovery, exact-head CI, independent review, production captures and human
substantive visual acceptance remain pending. No independent filter/module-
unavailable state is manufactured; no-match/unavailable use their actual seams.
Late-result navigation remains a named runtime proof gap. The absent local
`.env.test` cannot be repaired through this closed allocation. No development-
complete or release-ready claim is made.

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