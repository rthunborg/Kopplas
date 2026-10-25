---
workflowType: "testarch-test-review"
stepsCompleted: ["step-01-load-context", "step-02-discover-tests", "step-03-quality-evaluation", "step-03a-subagent-determinism", "step-03b-subagent-isolation", "step-03c-subagent-maintainability", "step-03e-subagent-performance", "step-03f-aggregate-scores", "step-04-generate-report"]
lastStep: "step-04-generate-report"
lastSaved: "2026-10-25"
inputDocuments: ["_bmad-output/implementation-artifacts/spec-15-1-the-five-scheduling-views-2.md", "_bmad-output/implementation-artifacts/spec-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md", "_bmad-output/implementation-artifacts/spec-15-3-conflict-resolver.md", "_bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md", "_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md", "_bmad-output/implementation-artifacts/spec-15-6-min-dag-the-field-landing.md"]
headless: true
generate_inline_comments: false
context_basis: "pr_diff"
output_file_override: "C:\\Users\\Rasmus\\.codex\\worktrees\\epic-15-calendar\\Kopplas\\_bmad-output\\test-artifacts\\epic-15-closeout\\test-review.md"
---

# Epic15 bounded test-quality review

**Quality Score**: 0/100

**Grade**: F

**Recommendation**: Block

**Context Basis**: pr_diff

**Context Waivers Applied**: 0

This is the requested advisory assessment. The literal registry recommendation applies to retained test-hygiene predicates; owner steering keeps NFR/test-review/polish nonblocking. No source/test change or gate waiver was made. The49retaineddevelopmentACtrace and actual required runtime evidence are separate; this report does not prove missing functionalcoverage or a productdefect.

## Scope and evidence limits

Complete126file static pins/declaration collector reused; qualified original independent reviews/runtime retained for unchanged files. No new per-lens/full-corpus review, new tests/browser/acquisition or other source context. Absolute mechanically verified findings below are actual; no all-files bonus or fresh blanket code-review PASS.

126authoritativepaths:123JS/TS/MJS reviewed via current static inventory plus qualified existing review applicability;3unscorableformats excluded below. Six approvedE15specs are the complete read-only requirement context. No outside corpus reread: conventionbaseline unavailable, allConventionrowsn/a without deductions. No fresh statement that every body/lens was exhaustively re-reviewed. Inlinecommentsfalse. No Pactboundary/package or reachable dedicatedPactreviewtool; no broker/network call. PlaywrightUtils flagtrue/packageabsent: recommend framework evaluation only in a separately owned setup task, no per-file penalty.

## Quality Criteria Assessment

| Criterion | Status | Violations | Basis | Notes |
|---|---|---|---|---|
|BDD Format (Given-When-Then)|PASS(n/a)|0|Convention:unknown|Outside-set baseline unavailable under bounded scope; no inventedadoptioncounts.|
|Test IDs|PASS(n/a)|0|Convention:unknown|Outside-set baseline unavailable under bounded scope; no inventedadoptioncounts.|
|Priority Markers (P0/P1/P2/P3)|PASS(n/a)|0|Convention:unknown|Outside-set baseline unavailable under bounded scope; no inventedadoptioncounts.|
|Disabled or Focused Tests|FAIL|51|AbsoluteC1|Distant suite reason fails adjacent-reason predicate;51retiredscaffolds0coverage. No new current productfailure inferred.|
|Hard Waits|FAIL|1|AbsoluteH1|Mailpit bounded250ms polling delay.|
|Determinism / Isolation / Explicit Assertions|PASS (bounded reuse)|0additional|Absolute+Applicability|Existing qualified reviews retained; no additional reachable assertion bypass identified; no fresh broadper-lensPASS.|
|Fixture/DataFactory/NetworkFirst|PASS (bounded reuse)|0additional|Applicability|Existing admitted real fixtures/armed waits retained; no bonus or unmeasuredcoverageclaim.|
|Playwright/Pact utilities|PASS(n/a)|0|Runpreconditionclosed|Packagesabsent; noPactboundary. No deduction.|
|TestLength<=1000|FAIL|8|AbsoluteH5|Exactlinecounts pinned in test-inventory.json.|
|TestDuration<=1.5min / flakiness|FAIL (H1 evidence)|1overlapping|Absolute+Applicability|Not separately deducted; no new measured runtime. Two currentProtocolErrorretry0F/retry1P retained as observations.|

**Total Violations**: 51 Critical, 9 High, 0 Medium, 0 Low

**Convention Baseline**: unavailable: explicit bounded closeout supplies no outside-set measured baseline and forbids new corpus census; unknown Conventionrows deduct0.

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -51 × 10 = -510
High Violations:         -9 × 5 = -45
Medium Violations:       -0 × 2 = -0
Low Violations:          -0 × 1 = -0

Bonus Points:
  Excellent BDD:         +0
  Comprehensive Fixtures: +0
  Data Factories:        +0
  Network-First:         +0
  Perfect Isolation:     +0
  All Test IDs:          +0
                         --------
Total Bonus:             +0

Final Score:             0/100
Grade:                   F
```

## Critical Issues (Must Fix)

RegistryC1:51retiredseriescommand/RLSscaffolds have documented unbound-adapter reasons at distant suiteheaders, not on their skip line or immediately above. Exact51row/linefindings are retained in `test-review-summary.json`. Preserve0coverage and real replacement evidence; adjacent-reason/archive hygiene is futureownedwork. This report applies no waiver or sourceedit.

## Recommendations

- H1 HIGH `tests/e2e/auth/auth-mail-callback.e2e.spec.ts:74` — Mailpit receipt loop sleeps a fixed250ms between requests. RegistryH1 covers bare timer ordering even though the loop is bounded and eventually throws. Use a bounded condition/event-based polling helper in the CI/test-maintenance lane; preserve real-mail assertions and timeout behavior.
- H5 HIGH `tests/diagnostics/no-store-stream-probe.mjs:1` — File has 1053lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.
- H5 HIGH `tests/e2e/global-setup.ts:1` — File has 1288lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.
- H5 HIGH `tests/integration/commands/booking-series.int.test.ts:1` — File has 1182lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.
- H5 HIGH `tests/integration/rls/tenant-table-inventory.ts:1` — File has 2134lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.
- H5 HIGH `tests/support/calendar-feed-atdd.ts:1` — File has 1457lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.
- H5 HIGH `tests/unit/docs/acceptance-gate-report-validators.test.ts:1` — File has 1003lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.
- H5 HIGH `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1` — File has 3345lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.
- H5 HIGH `tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts:1` — File has 1251lines, above registry1000line boundary. Split along existing fixture/domain seams in a separately owned test-maintenance change, retaining exact assertion and cleanup behavior.

## Strengths and retained evidence

Actual command/RLS/proof/current-role/race/fault assertions, independent fixtures/snapshots and production browser flows are qualified in existing storyreviews and native receipts. SSR/source-only/syntheticports are explicitly limited. Current158requiredcalendarcases remain158, not multiplied by overlap. No bonus earned across allreviewedfiles. QA/CI still owns two protocolflake investigations and any newly demonstrated productdefect returns to development.

## Reviewed Files

- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-c4-config01-correction/parallel.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-c4-config01-correction/serial.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-c4-job01-refinement/parallel.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-c4-job01-refinement/serial.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-containment-proposal/a-caught-inner.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-containment-proposal/a-caught-outer.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-containment-proposal/a-healthy.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-containment-proposal/a-uncertain.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-containment-proposal/parallel.test.mjs`
- `_bmad-output/auto-bmad/preparation/story-15-5/job-wide-custody-containment-proposal/z-next.test.mjs`
- `_bmad-output/test-artifacts/story15-2/red-activation/booking-series-state.test.ts`
- `_bmad-output/test-artifacts/story15-2/red-activation/recurrence.test.ts`
- `tests/diagnostics/fixed-chromium-application-runner.mjs`
- `tests/diagnostics/no-store-stream-probe.mjs`
- `tests/e2e/auth/auth-mail-callback.e2e.spec.ts`
- `tests/e2e/booking-series.e2e.spec.ts`
- `tests/e2e/calendar-feed.e2e.spec.ts`
- `tests/e2e/conflict-resolver.e2e.spec.ts`
- `tests/e2e/global-setup.ts`
- `tests/e2e/global-teardown.ts`
- `tests/e2e/jobs/job-list-deferred-surface.e2e.spec.ts`
- `tests/e2e/jobs/jobs-depth.e2e.spec.ts`
- `tests/e2e/my-day.e2e.spec.ts`
- `tests/e2e/scheduling-views.atdd.e2e.spec.ts`
- `tests/e2e/support/booking-editor-atdd.ts`
- `tests/e2e/support/booking-series-atdd.ts`
- `tests/e2e/support/calendar-feed-atdd.ts`
- `tests/e2e/support/resource-cdp-attachment.ts`
- `tests/e2e/support/scheduling-lifecycle-metadata.ts`
- `tests/e2e/support/scheduling-views-atdd.ts`
- `tests/e2e/support/time-reports-atdd.ts`
- `tests/e2e/time-reports.e2e.spec.ts`
- `tests/factories/admin-sql.ts`
- `tests/integration/calendar-feed/public-feed.int.test.ts`
- `tests/integration/commands/booking-editor.int.test.ts`
- `tests/integration/commands/booking-series.int.test.ts`
- `tests/integration/commands/calendar-feed.int.test.ts`
- `tests/integration/commands/conflict-resolver.int.test.ts`
- `tests/integration/commands/time-reports.int.test.ts`
- `tests/integration/components/booking-series.test.ts`
- `tests/integration/components/calendar-feed.test.ts`
- `tests/integration/components/conflict-resolver.test.ts`
- `tests/integration/components/time-reports.test.ts`
- `tests/integration/features/booking-read-actions.test.ts`
- `tests/integration/features/jobs/job-workspace.int.test.ts`
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`
- `tests/integration/notifications/time-report-nudge-producer.int.test.ts`
- `tests/integration/ops/recovery-storage-immutability.int.test.ts`
- `tests/integration/read-models/booking-conflicts.int.test.ts`
- `tests/integration/read-models/time-reports.int.test.ts`
- `tests/integration/rls/acceptance-tables-migration-reset.int.test.ts`
- `tests/integration/rls/booking-series.rls.test.ts`
- `tests/integration/rls/calendar-feed.rls.test.ts`
- `tests/integration/rls/conflict-resolver.rls.test.ts`
- `tests/integration/rls/cross-tenant-isolation.rls.test.ts`
- `tests/integration/rls/migration-reset.int.test.ts`
- `tests/integration/rls/role-harness.atdd.int.test.ts`
- `tests/integration/rls/tenant-table-inventory.ts`
- `tests/integration/rls/time-reports.rls.test.ts`
- `tests/integration/scheduling/booking-reassignment-flags.int.test.ts`
- `tests/integration/scheduling/my-day.int.test.ts`
- `tests/integration/scheduling/scheduling-read.atdd.int.test.ts`
- `tests/support/authz/role-harness.ts`
- `tests/support/booking-editor-atdd.ts`
- `tests/support/booking-editor-production.ts`
- `tests/support/booking-series-atdd.ts`
- `tests/support/booking-series-unit-atdd.ts`
- `tests/support/calendar-feed-atdd.ts`
- `tests/support/calendar-feed-ci-contract.ts`
- `tests/support/time-reports-atdd.ts`
- `tests/unit/dependencies/next-image-optimizer.test.ts`
- `tests/unit/docs/acceptance-gate-report-validators.test.ts`
- `tests/unit/features/calendar-feed/action-state.test.ts`
- `tests/unit/features/calendar-feed/icalendar.test.ts`
- `tests/unit/features/calendar-feed/validation.test.ts`
- `tests/unit/features/jobs/job-workspace-domain.test.ts`
- `tests/unit/features/my-day/domain.test.ts`
- `tests/unit/features/resources/booking-editor-input.test.ts`
- `tests/unit/features/resources/booking-series-editor.test.ts`
- `tests/unit/features/resources/booking-series-state.test.ts`
- `tests/unit/features/resources/bookings-read.test.ts`
- `tests/unit/features/scheduling/calendar-boundaries.test.ts`
- `tests/unit/features/scheduling/calendar-components.test.ts`
- `tests/unit/features/scheduling/capacity-view.atdd.test.ts`
- `tests/unit/features/scheduling/conflict-resolver-state.test.ts`
- `tests/unit/features/scheduling/conflict-resolver.test.ts`
- `tests/unit/features/scheduling/conflict-suggestions.test.ts`
- `tests/unit/features/scheduling/focus-restoration.test.ts`
- `tests/unit/features/scheduling/preferences.atdd.test.ts`
- `tests/unit/features/scheduling/recurrence.test.ts`
- `tests/unit/features/scheduling/views.atdd.test.ts`
- `tests/unit/features/scheduling/workspace-read.test.ts`
- `tests/unit/features/time-reports/action-state.test.ts`
- `tests/unit/features/time-reports/domain.test.ts`
- `tests/unit/features/time-reports/validation.test.ts`
- `tests/unit/guardrails/file-index-non-scope.test.ts`
- `tests/unit/guardrails/job-non-scope.test.ts`
- `tests/unit/ops/pilot-operations.test.ts`
- `tests/unit/scope/booking-editor-scope.test.ts`
- `tests/unit/scope/manifest-coherence.test.ts`
- `tests/unit/scope/manifest-derivations.test.ts`
- `tests/unit/scope/manifest-shape.test.ts`
- `tests/unit/scope/resources-activation.atdd.test.ts`
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts`
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts`
- `tests/unit/scripts/verify/ci-native-test-reports.test.ts`
- `tests/unit/scripts/verify/email-delivery-containment.atdd.test.ts`
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts`
- `tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts`
- `tests/unit/scripts/verify/integration-test-partitions.test.ts`
- `tests/unit/scripts/verify/scheduling-lifecycle-metadata.test.ts`
- `tests/unit/server/authz/permission-matrix.test.ts`
- `tests/unit/server/authz/phase-a-surface.test.ts`
- `tests/unit/server/authz/role-catalogue.test.ts`
- `tests/unit/server/bookings/conflict-resolution-attestation.test.ts`
- `tests/unit/server/bookings/series-plan.test.ts`
- `tests/unit/server/calendar-feed/attestation.test.ts`
- `tests/unit/server/calendar-feed/public-shell.test.ts`
- `tests/unit/server/calendar-feed/trusted-ip.test.ts`
- `tests/unit/server/jobs/producer-registry.test.ts`
- `tests/unit/server/notifications/registry.test.ts`
- `tests/unit/server/read-models/my-day.test.ts`
- `tests/unit/support/booking-editor-sql-inventory.test.ts`

## Excluded From Review Set

- tests/diagnostics/fixed-chromium-capsule-mock.c — format not scorable by the ledger
- tests/diagnostics/fixed-chromium-owned-process.c — format not scorable by the ledger
- tests/fixtures/golden/scheduling/recurrence.json — format not scorable by the ledger

## Context Files

- `_bmad-output/implementation-artifacts/spec-15-1-the-five-scheduling-views-2.md`
- `_bmad-output/implementation-artifacts/spec-15-2-recurring-bookings-series-materialized-occurrences-exceptions.md`
- `_bmad-output/implementation-artifacts/spec-15-3-conflict-resolver.md`
- `_bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md`
- `_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md`
- `_bmad-output/implementation-artifacts/spec-15-6-min-dag-the-field-landing.md`

## Validation and next action

Ledger arithmetic and pinnedseverity/rowdedup validated; no inventedbonus/coveragepercentage;126pathsaccounted for;3excludedformats named;contextwaivers0;inlinecomments0;no testexecution/browser/resourcecleanup needed. Advice only: schedule boundedtesthygiene/protocolreliability follow-up. FinalPRindependentreview/currentheadrequiredCI and releasevalidation stay separate.
