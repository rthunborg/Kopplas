---
record_type: original_completed_targeted_review
selected_model: gpt-6.1-sol
selected_effort: high
review_round: 2
recording_only: true
source_head: 1f19e3f3b7562bd43732dc61c17a9d0b1b5cee34
input_sha256: ec5d409b466b789a2e658e46f65c313046fa5b57ed001d5e53949456219cb2d4
input_bytes: 257335
full_read_content_lines: 2932
runtime_status: pending_root_ci
---

All nine Round 1 findings are resolved **in source**. No consequential regression was identified in the latest fixes. Database/browser execution remains pending Root CI; this is not development-complete or release approval.

| Finding | Judgment and anchors |
|---|---|
| R1-01 | **Resolved.** Unknown-outcome history survives definite denial; the frozen request remains locked until confirmation. Production [Entry:41](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/components/time-reports/TimeReportEntry.tsx:41), actual-handler [test:133](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:133), real loss/revocation/restoration [browser case:76](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/e2e/time-reports.e2e.spec.ts:76). |
| R1-02 | **Resolved.** Each unchanged endpoint independently retains its authoritative UTC instant, including late-fold identity and microseconds. Edited intervals still require exact whole minutes. [State:36](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/features/time-reports/action-state.ts:36), [controller test:143](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:143). |
| R1-03 | **Resolved.** Canonical prefilled minutes survive mode selection; editing hours clears that canonical value and invokes exact parsing. [State:25](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/features/time-reports/action-state.ts:25), [test:150](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:150). |
| R1-04 | **Resolved.** Start date supplies the default until explicit report-date editing. [State:28](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/features/time-reports/action-state.ts:28), [test:155](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:155). |
| R1-05 | **Resolved.** Both review links consume the production navigation guard: dirty input requires confirmation; pending/unknown outcomes block navigation. [Review:26](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/components/time-reports/TimeReportReview.tsx:26), [test:159](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:159). |
| R1-06 | **Resolved in source, execution pending.** Detailed assessment below. |
| R1-07 | **Resolved.** Decimal-scaled subtraction avoids manufactured binary digits while retaining booked provenance and integer filing validation. [Domain:28](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/features/time-reports/domain.ts:28), [rendered assertion:189](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:189). |
| R1-08 | **Resolved.** Production review consumes `annotationOutcomeAfter`; the actual TSX handler test verifies stale feedback, locked editing and no `onSaved`. [Review:17](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/components/time-reports/TimeReportReview.tsx:17), [test:174](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:174). |
| R1-09 | **Resolved.** Production success/error/finally branches consume the tested sequence predicate; deferred actual-handler reads verify the newest selection/result survives late resolution. [Workspace:21](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/src/components/time-reports/TimeReportWorkspace.tsx:21), [test:180](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/components/time-reports.test.ts:180). |

For R1-06, the [invoker trigger:186](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/supabase/migrations/20261020190000_time_reports.sql:186) only gates mutations involving an OLD or NEW nudge category. It takes distinct sorted affected tenant IDs through `pg_try_advisory_xact_lock`, raises exact `55P03` without catching it, and contains no authenticated/service/definer/native exemption. Existing preference RLS and grants remain unchanged.

The producer retains its tenant gate, membership/role/profile locks, current preference predicate, dedupe and atomic notification/audit writes. Only preference tuple locking was removed. Its post-wait reads are consistent with the stated READ COMMITTED/volatile contract; no Repeatable Read guarantee is claimed.

The new serial assertions cover:

- [NUDGE-010:224](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/notifications/time-report-nudge-producer.int.test.ts:224): absent/existing UPSERT, UPDATE and category change hold the writer transaction, observably block the producer through `pg_blocking_pids`, commit first, then require zero effects.
- [NUDGE-011:268](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/notifications/time-report-nudge-producer.int.test.ts:268): an owned UUID-scoped post-predicate trigger blocks the producer; authenticated and genuine jobs-service preference writes must fail with exact `55P03`, preserve state, and succeed only on explicit retry after the historical emission.
- [NUDGE-012:356](C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/tests/integration/notifications/time-report-nudge-producer.int.test.ts:356): affected tenants, category moves, native writes, two active memberships and membership revocation.
- Cleanup releases the control transaction before settling pending operations, then drops only owned objects and checks catalog absence. Existing stage-specific audit-fault/rollback proofs remain intact.

Inventory is **73 active declarations**: pure17/component15/command11/RLS7/read7/nudge13/browser3, zero explicit skips. No prior test ID disappeared. The single author-written SRO accurately preserves execution limits. Minor attribution note: its line234 groups service coverage under NUDGE012/013; the genuine service assertion actually resides in NUDGE011:315–318. This is not a production defect.

Full-read attestation: all 2,932 content lines, including complete appended contexts and original findings, read in bounded chunks; the initial truncated attempt was fully reread. Input remained **257,335 bytes**, SHA-256 **`ec5d409b466b789a2e658e46f65c313046fa5b57ed001d5e53949456219cb2d4`**. Current head verified as **`1f19e3f3b7562bd43732dc61c17a9d0b1b5cee34`**. No tests, services, database, browser, network, edits or Git mutations were performed.
