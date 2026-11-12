---
title: "Story 35.14: Live Dashboard Pipeline"
status: in-review
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

Owner-approved source ready for ordinary development; native admission and implementation have not started. As an entitled existing user, I want the accepted E19.1 dashboard composition so I can understand live projected pipeline facts and follow the current destination with accessible, honest read outcomes. The current owner approval supersedes the frozen original's preparation-only status.

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

Current author working tree is based on `a1404c36796774db8362d23beaf49657c1d92459`.
See [verification and all eleven state bindings](../../../implementation-artifacts/evidence/35-14-dashboard/implementation-verification.md)
and the adjacent product/test byte fingerprint. Pinned offline install, production
build, typecheck, lint and 119 focused tests passed (zero failed/skipped); all 55
collected browser tests remain unrun. No runtime resource or visual capture was
created. The parent owns exact-head CI/review/visual continuation; no done claim.

## Suggested Review Order

Author: `/root/dashboard_35_14_worker/build/implementation` (implementation author).
Refreshed against the final uncommitted author tree over `a1404c36796774db8362d23beaf49657c1d92459`;
the evidence fingerprint pins the five changed product/test files.

### Current dashboard facts within the frozen host

I retained the current server/read composition and changed only feature-local
appearance. Semantic tokens, flat cards, tabular counts and a single phone column
apply the accepted written design while the host/onboarding and sole destination
stay intact. Compact phone padding preserves content width; desktop uses 24px.

- `src/app/(app)/dashboard/page.tsx:30` — `async function DashboardWidgets()`: unchanged eligibility and isolated loading entry.
- `src/components/dashboard/WidgetCard.tsx:3` — `export function WidgetCard`: local card, heading and sole supported link.
- `src/components/dashboard/DashboardGrid.tsx:3` — `export function DashboardGrid`: responsive one-column/desktop registry container.
- `src/components/dashboard/QuotePipelineWidget.tsx:66` — `<dl className=`: single phone metric column, grouped desktop values.

### Honest failure, withholding and freshness

I preserved the existing projection, absent-value handling and server refresh
semantics rather than introducing local data state. Failure adds a persistent
connection/retry instruction without claiming a network-specific diagnosis;
the lock now uses a monochrome icon and retains its existing tooltip handlers.

- `src/components/dashboard/QuotePipelineWidget.tsx:14` — `function MaskedValue()`: focus, touch and Escape explanation.
- `src/components/dashboard/QuotePipelineWidget.tsx:56` — `state === "error"`: local failure without successful values/time.
- `src/components/dashboard/QuotePipelineWidget.tsx:73` — `entitlements.withheld.includes`: unchanged authoritative withholding branch.
- `src/components/dashboard/DashboardRetry.tsx:12` — `const retry =`: unchanged explicit refresh through current server authority.

### Assertions and evidence limits

AC1/2/6 reuse real component states and source projections; AC3/7 reuse registry
and read-contract checks. AC4/5 retain separate usable keyboard/touch/reflow and
tooltip assertions; capture attachments supplement those outcomes. Browser
execution, late-result navigation proof and actual visual acceptance remain pending.

- `tests/unit/components/dashboard/widget-state.test.ts:77` — `loading announces progress`: no fabricated values or successful timestamp.
- `tests/unit/components/dashboard/widget-state.test.ts:123` — `absent-withheld money renders Dold`: absence never becomes zero.
- `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:64` — `phone values remain in one column`: computed responsive/reflow assertion, currently unrun.
- `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:514` — `successive failed retries recover`: retained real-source recovery, currently unrun.

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
