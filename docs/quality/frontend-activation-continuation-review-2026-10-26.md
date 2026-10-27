# Independent activation continuation review — 2026-10-26

Verdict: **GO for the scoped continuation checkpoint**, subject to final commit
identity binding and its exact-head CI. This is a targeted sensitive review of
new continuation work and its fixes, not another broad pass over unchanged PR
#109 code or a final PR-ready verdict.

Reviewer: independent OpenAI `gpt-6.1-sol`, High effort, through this Codex
session. The route covers Auth diagnostic privacy, owned CI collection, App
authority, pilot admission, state accounting and notification boundaries.
Reviewed parent: `568bcfd4e866b17bee2f787414b14841a96b5b21` in
`C:/DEV/Kopplas-quality-gate`. The [original setup review](frontend-gate-independent-review.md)
is preserved unchanged and supplies the earlier setup review history.

## Scope and identity

At freeze, the 22 continuation files excluding this new report had raw
working-byte SHA-256 inventory digest
`5f4bc6a2e71a3c07b204702755a2a32a95aaa5264c19a2f0e4d2c8ca6c57f621`.
Method: sort repository-relative paths, SHA-256 each raw file, serialize the
ordered path-to-hash object with compact JSON, SHA-256 that JSON. Canonical Git
blob identities for every file were also saved independently for comparison to
the eventual commit, including normal Windows newline filtering.

The scope is the two CI workflows; Auth collector and declaration; opt-in factory
and NUDGE helper; two pure Auth diagnostic modules; the exact CI projector;
diagnostic/collector/fixer tests; and these seven documentary records: setup,
remediation, dated activation, Auth investigation, runtime integration,
next admission and the original setup author's evidence reconciliation. No
product, schema, dependency, `.env`, immutable source, installed tooling or
autonomous file-policy expansion is included. No #103 startup repair was copied
into #109.

Selected raw working-byte identities:

| File | SHA-256 |
| --- | --- |
| `.github/workflows/ci.yml` | `6e1618ffa953745d24145d8c8acaff6d8d04b101b17fd5627e841d13e9c50682` |
| `.github/workflows/pr-feedback.yml` | `4d340ad70f1c0672957cde5dd4109903aad5c71ae8a2e1f5c6eaea0b72b9935c` |
| `scripts/ci/auth-cleanup-collector.mjs` | `8e5ce75a29ed6bd1310d2fce5ecc4d9923eeb651bbd517cea94ca4757bdec2d5` |
| `scripts/pr-feedback/runtime.mjs` | `e0c3bd7392efc61c3e8dace0822f00b1b1ab2367b6142d175967c72f2518c8cb` |
| `tests/support/auth-cleanup-log-summary.ts` | `494977507e66d3083b50258d9dd93f8abb38f9ee2f76e79f956beefe8fedf77c` |
| `tests/support/calendar-feed-ci-contract.ts` | `a773973d4b5a5f93d22aa67d4f42a46b2c3a561039b69cd2350fb1726b042b2e` |
| `tests/unit/scripts/pr-feedback-runtime.test.ts` | `2a0ce2df9fce6bac8f55839533f01891b5e6c704fa7237276c902b136df1c010` |
| `docs/quality/frontend-runtime-integration-2026-10-26.md` | `e866633cf75924d6dd230c1d40a1b1a7c1a460cf9615bf07b414605943e89c13` |

The collector's canonical LF source hash is
`0cc442d2dd373cbb6b9cacfc54da50ddc926a8f8d841ffe87ce0d7e2e660cbc9`,
matching the projector pin. Its raw Windows hash above is a distinct byte
representation, not a changed source contract.

## Findings resolved in the targeted review

1. **P2, PostgreSQL payload could fabricate class facts.** The initial reducer
   searched for severity text inside arbitrary payloads. I reproduced false
   `40P01`/deadlock and `23503`/foreign-key observations from SQL STATEMENT
   literals/comments. The final parser admits only anchored recognized severity
   headers; hostile literals, comments, DETAIL, CONTEXT and LOG payloads are
   covered by regressions. Raw SQL remains absent from output.
2. **P2, Docker stream boundary could hide records.** Concatenating stdout and
   stderr without a separator could merge two complete records when stdout
   lacked a trailing newline. The actual capture path now inserts a newline.
   Its regression proves separate HTTP500/503 records survive and blank
   separators do not add observations.
3. **P2, stale reservation reconciliation missed current write admission.**
   A completed prior reservation could be written after the initial settings
   read without noticing a fresh hold or pilot restriction. It now checks current
   admission immediately before that state write. Actual orchestration fixtures
   cover held, restricted and disabled transitions with zero state writes,
   reservations or journals.
4. **P2, known denied notification became permanently non-resumable.** The
   initial guard saved `notified=true` before a second admission denial skipped
   re-review. I reproduced the persisted true state with zero review requests.
   Admission now precedes intent mutation. Known denial remains resumable;
   admitted durable intent and its one POST finish as one bounded operation.
   Uncertain POST outcomes retain intent and are not blindly retried. Later
   holds prevent new operations without orphaning admitted publication accounting.

The circular enable-before-successful-pilot wording was corrected: prerequisites
permit the bounded pilot, while operational qualification requires its later
success. The historical setup anchor is retained. The original setup author
record changes only its evidence scope, links and verified monitor review stop;
it does not relabel historical tests as current-head evidence.

## Verified behavior and evidence limits

The opt-in error adapter reads only own fixed data fields and emits closed
class/status/code values, never upstream messages, causes, IDs or credentials.
I checked the retained baseline factory snippet against d02's actual Git bytes;
its exact function hash is
`fabd0deb22e2c1245c058f21da2b8131f6adf3eeb1ba53221da798d7c263a962`.
The guard, one delete per call, default callers, 63 concurrent NUDGE deletions,
failure aggregation and assertions remain intact. This improves observability;
it is not a behavioral cleanup fix.

The collector requires a failed exact NUDGE004 Auth-cleanup boundary, actual
checkout identity, GitHub-hosted db job/attempt binding, fresh local project
DB/gateway/Auth peers, network/publication/image checks and a narrow derived
window. It uses validated full IDs for finite log reads with identity rechecks.
Outputs are fixed diagnostic-only counts with zero acceptance credit; source
reads, line/byte/window/process limits and incomplete coverage remain explicit.
No SQL query, logging change, service lifecycle change, raw log artifact or
credential exposure was introduced. The two workflow steps remain failure-only
before unchanged teardown; collector failure cannot green the failed test.
The exact inverse retains the original workflow hash and rejects missing,
duplicated or changed collector steps and unrelated drift.

Unset pilot scope retains normal admission. A valid temporary scope admits only
the matching manual PR; malformed, automatic and mismatched requests fail before
attempt/model admission. Current variables are reread at admission and before
the first relevant mutation. The publication and failure finalizer also check
after intervening reads; successful commits retain durable accounting. Existing
actor permission, same-repository opt-in, whole-PR/proposal file restrictions,
fresh feedback, signed history, budgets, validation and expected-head publication
remain. `monitor_only` invokes the same CI and `assessPr` path without a new
reservation, journal or inference. There are no new journal/result schema fields.

I independently ran **25 Auth diagnostic/collector tests** and the final **108
frontend/fixer tests**: all passed, zero failed or skipped. The 25 include the
original-hash projection/drift regression. The author separately reports the 11
selected NUDGE/meta regressions, full TypeScript, targeted lint, syntax/YAML and
review-stop checks passed. The broader two Windows CRLF-dependent contract
failures remain recorded in the author report, not waived. Those full static
commands were not repeated by this reviewer. `git diff --check` passed here.

No collector was executed against real service logs in this continuation review.
Unit fixtures, mocked APIs and the actual SDK with synthetic responses establish
their bounded claims only. Even a later green CI run may skip this failure-only
collector; do not call that proof of real collector capture.

## Hosted facts and outstanding decisions

The separately owned exact-d02 baseline run `40367022378` passed its five ordinary
jobs and NUDGE004: 2,146 integration passes, 52 pending, 65 browser passes and one
separate storage proof. Pending tests are not executed coverage. That comparison
does not reproduce or explain the earlier failure at PR #109 head 568; the
historical Auth/Postgres logs are unavailable and no backend cause is established.
It supplies no pass for the combined continuation's future head.

The independently reviewed #103 update
`989eac74cadb18dfeeb5cc91b58b31516dac8c24` adds only its exact checkout-ref line.
Fresh credential-free preflight `40367858227` passed initialization/EOF proof.
Its old-ancestry ordinary CI `40367858106` failed dependency audit; that remains
separate from startup proof and requires an actual authorized base reconciliation
and new CI before merge readiness. No local or hosted merge is authorized here.

The five continuation documents preserve established bounded paid/live/enable
authorization without requesting it again. They retain reuse of the existing
App/credentials/four variables, an owned temporary pilot control, conditional
restore/no blind retry and genuine eligible human feedback. No hosted control was
changed or paid pilot executed by this review. API account/model/rate/hard-spend
evidence awaits sign-in/inspection. App dedicated-use/minimum-grant reduction and
protection A/B choices remain pending and unapplied.

Required-check App ID 15368 identifies GitHub Actions, not a specific workflow.
The proposal now preserves actual producer/head/conflicting-context checks and
the direct trusted monitor. A needs a real independent human approver; B leaves
that human/provenance boundary process-only. No unsupported workflow-identity
field or fixer permission/file-policy expansion was invented. Automatic Preview
disable does not block production Git deployment, so main bootstrap still needs
its separately qualified no-deployment and merge decisions.

Final-head CI, fresh-chat external PR review, actual source/reference/provider
visual acceptance, paid/live loop qualification and E35 individual admission
remain separate. This targeted GO authorizes none of their outcomes, settings,
merge or deployment. Product visual applicability for this continuation is N/A:
test/process/tooling changes only; no product visual PASS is issued.
