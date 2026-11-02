# Spec-folder parallel individual-PR compatibility — verification

Local tooling qualification complete. Base: `9533e969c1981647e26c33774a9327f842ad299a`.
Owned checkout: `C:/DEV/kp-parallel-v2`, branch `codex/spec-parallel-pr`.
Scope is process helper, synthetic contracts, mirrored references and documentation.
No product implementation, live claims, workers, services, database migrations or provider merges were performed.

## Design and authority

The independently reviewed plan is [spec-parallel-pr-plan-2026-11-02.md](spec-parallel-pr-plan-2026-11-02.md).
Schema 2 is restricted to stories/story-pr delivery, one manifest entry per explicit SPEC folder and at most two shared claims. Terminal done checkpoints remain; unfulfilled spec approval and multi-entry continuation fail closed. Existing schema 1 remains supported.

The helper reuses the common-Git SQLite authority and existing per-story pipeline/publication validators. Pending PRs retain custody. A durable repository-wide merge intent precedes the existing authorized provider route; exact ordered merge parents, refreshed-main ancestry and current-head combined verification precede release. Aggregate work remains coordinator-owned. Helper observations are data, not credentials or authorization; the existing delivery/visual controllers remain mandatory and independently classify actual PR paths.

Auto-BMAD exposes no customize.toml surface for this step logic. The existing project-owned `.agents` and `.claude` extension mirrors are used; no invented TOML, global skill changes or hot upgrade. Adopt only after merge, from a clean launch with a fresh workflow pin. Product source qualification, approved amendments and enrollment remain coordinator responsibilities; proposed E35 namespaces are not claims.

## Routing and independent review

Routes were recorded before dispatch. Context-free `protocol_plan` used `gpt-6.1-sol` High for sensitive claim/workflow design and implementation; distinct `plan_review` used Sol High for pre-implementation plan review. `contracts` used Sol High for integrity contracts; `workflow_docs` used ordinary Low for disjoint documentation ownership. The primary owned Git/PR and this evidence record.

Independent actual-diff round 1 used context-free `protocol_review`, Sol High. It found no actionable P1/P2 defects after downstream validation of SQL reservations, source pins, ownership, merge custody and current-main verification. A targeted follow-up confirmed no operational visual-gate bypass through retained controllers and inspected the exact executed CLI-receipt correction; no second broad review was needed.

Reviewed helper raw SHA256: `5eb5710e4965e5b443a2a394881f70342a13ada7772ae5b2b4a63edb1953a114`.
LF-normalized helper SHA256: `12fe516baf4a3a01453c875491950afbe1e78dd250fcbac60967d69dd9d1b67e`.
Engine-test raw SHA256: `d7a12af6d45f1310f3a098d6260e9a8de2cc8fbb4ea18c26ffe6d4851e97731f`.
Final CLI-test raw SHA256: `3bf3023c07c89dde13a73906530a8c0b461903580fef4aed28d0ac97ff214643`.
All nine changed workflow pairs are byte-identical. The reviewer performed no test execution, live-store mutation or provider calls; native hosted branch protection was not independently inspected.

## Executed local checks

All paths below are under `.agents/skills/auto-bmad/scripts/`. Commands used `python -X utf8` or `python -m unittest`; engine/CLI cwd was `scripts/tests` with owned writable TEMP/TMP and PYTHONDONTWRITEBYTECODE=1.

| Suite | Passed | Failed/skipped | Duration |
| --- | ---: | --- | --- |
| `python -m unittest test_parallel_run` | 70 | 0 / 0 | 791.190s |
| `python -m unittest test_parallel_cli` | 13 | 0 / 0 | 209.723s |
| `tests/test_parallel_finalization.py -v` | 21 | 0 / 0 | 440.750s |
| `tests/test_routing_migration.py -v` | 26 | 0 / 0 | 0.978s |
| `tests/test_cli_delegate_windows_pid.py` | 10 | 0 / 0 | 0.014s |
| `tests/test_pr_strategy.py -v` | 11 | 0 / 0 | 0.056s |

Total: **151 unique tests passed, zero failed/skipped**. After the minimal CLI-receipt correction, its three changed v2 cases passed again in 63.506s; these do not add unique coverage. Python syntax, exact mirrors and `git diff --check` passed.

The 27 new tests cover full-folder namespaces and aliases, source LF pins/checkpoints, qualified-main bases, mixed-version ownership/capacity, blocked claims, legacy/provenance protection, path/domain conflicts, outside writes, immutable PR identity/resubmission, PR-ready versus integrated, durable serial custody/crash recovery, stale/open/wrong observations, exact merge parents, actual-main evidence and restart behavior. Test stores/branches/receipts are synthetic, not product coverage or product enrollment.

## Recorded limits and resolved setup history

An initial automatic approval review blocked the substantive patch because direct implementation authorization was not visible. No workaround was attempted. The human directly replied “You are authorized” in this chat on 2026-11-02; implementation then resumed. Earlier partial-source mirror failures and one colliding synthetic epic fixture were corrected before the final passing suites. Default-TEMP setup errors were resolved by an owned writable temporary directory.

An optional unchanged `state_update.py --self-test` failed at its pre-existing `legacy field must not feed the new one` assertion (line 1438). The writer is byte-unchanged from base; no unrelated repair or passing claim is included. The final focused suites above passed. Hosted PR CI and coordinator final actual-head review remain separate gates; this local record grants neither merge authority nor product/release readiness.

## Hosted CI checkout prerequisite — approved exception

PR124 initial head `24ec0fb1ae7d542006f9a45bedb32834a9420745`: ordinary CI (verify, e2e, db, recovery-storage-loader) and Ubuntu contracts passed. Optional dashboard/fixed-browser probes were configured skips, with no coverage credit. Windows contracts failed before testing because checkout could not create a 262-character inherited main path; zero Windows contracts executed in that job. No blind rerun or waiver was used.

The exact checkout-only exception is [the reviewed proposal](spec-parallel-pr-windows-checkout-proposal-2026-11-02.md), final raw SHA256 `b189eb9c566ce55de9605287d7fbb211c6c3bfd0029448a630998580c844dd3b`. Its native PowerShell/Git probe passed 14 cases; distinct Sol High focused review accepted the exact delta and documented higher-priority PARAMETERS/-c precedence. Original workflow remained unchanged until approval.

Actual human approval was independently read from Coordinator user turn `01a19c20-1bb0-7d91-a161-4a29e3ab0bb4`: “Approval granted. Continue monitoring both stories now.” The coordinator identified this as approval of the precise pending checkout exception. The prior original CI-workflow allocation exclusion is therefore extended only for this reviewed Windows preparation/checkout environment delta. Route before dispatch: existing context-free Sol High author applies it; distinct Sol High reviewer checks the exact applied delta. No new broad helper review or unchanged local-suite rerun; helper/test hashes remain the provenance boundary. Successor hosted checkout/Windows contracts and all applicable PR checks remain unearned until actual execution. No merge or product-worker authority is granted.

The approved checkout delta is applied. Distinct High consequential review accepted it with no findings; reversing the exact replacement block reproduces the original workflow preimage. Applied workflow raw SHA256: `5e1c7525eb950c283c2cf2b869f62bbc1adabd6832741aa506d9a82d95bee27d`. The helper and test review hashes are unchanged. The author refreshed verified workflow review stops; no extra broad helper review or unchanged local tests were repeated. Actual successor hosted checkout and Windows contracts remain the next validation gate.
