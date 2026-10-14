# Story 15.1 native stream probe contract

PREPARATION ONLY. High PASS + coordinator reservation before implementation. Root-recorded route: `native_stream_probe_preparation / data-free-native-probe-contract-author / standard / gpt-6.1-sol / low / codex / subagents / subagent`. High validates gates. Doc-only; no source/Git/state/CI/resources.

## Evidence and authorized boundary

Read AGENTS/routing/local setup/CI and diagnosis `story-15-1-dashboard-prefetch-diagnosis-2026-10-14.md`: 15,100 bytes/SHA256 `b3d186d2144bf8d27b033027978cbf16efee83ad39c3f912e1132eefe45ee2a4`. HEAD27d67de7 docs-only; CI38596630798 exactda3a AC2 abort twice before tampered goto; no EOF/identity/caller-abort proof or app correction.

Question: exact-version loopback delivery/premature close versus native terminal/body? ZERO app/RLS/security/visual/acceptance credit; failed assertions/status remain.

## Only eligible implementation edits

After validation/reservation: new `tests/diagnostics/no-store-stream-probe.mjs` and additive `.github/workflows/ci.yml` edits only. No dependency/package/app/spec/helper/fixture/browser/auth/prefetch/cache edits, interception/replacement/cloning/tee/monkeypatch/synthetic app data.

Exact workflow additions:

1. `workflow_dispatch.inputs.native_stream_probe`: clear data-free diagnostic description, `type: boolean`, `required: false`, `default: false`.
2. Immediately after existing `e2e` step `E2E tests (Playwright)`, before original uploads: name `Native stream diagnostic`, id `native_stream_probe`, condition `${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.native_stream_probe }}`, timeout 2 minutes, command `node tests/diagnostics/no-store-stream-probe.mjs`. No continue-on-error or shell success fallback. Explicit status condition permits observation after general failure without erasing that failure.
3. Dedicated `actions/upload-artifact@v4` step: condition `${{ !cancelled() && steps.native_stream_probe.outcome != 'skipped' && github.event_name == 'workflow_dispatch' && inputs.native_stream_probe }}`, name `native-stream-probe`, path `test-results/native-stream-probe.json`, retention 7 days, missing file error.

Keep original five jobs verify/db/recovery-storage-loader/e2e/dashboard-e2e, dependencies/permissions/concurrency/commands/assertions/outcomes/uploads/cleanup/budgets byte-identical. Reuse already installed Playwright 1.61.1/Chromium 149.0.7827.55; no install/download change. Probe success never makes a failed general suite green. No dispatch authority.

## Fixed eight-case experiment

One bounded CI foreground command owns Node http.createServer on 127.0.0.1 port0/static bootstrap/fixed routes and a fresh pinned headless browser/context without storageState, fresh page per case. Built-ins/public installed Playwright only; no app config/setup/server, DB/fixtures, credentials, external service, deployment, user browser or local resource. Actual Node/package/browser.version target mismatch fails, never upgrades.

Predetermine one ASCII payload exactly 324 decoded bytes and SHA256; gzip once into a fixed Buffer. All positives serve identical compressed bytes: 200, fixed synthetic text/x-component, gzip, `private, no-cache, no-store, max-age=0, must-revalidate`, chunked, NO Content-Length. Report decoded/compressed length/hash separately; cache/framing/Content-Length facts are fixed, no extra arms.

Exactly three arms, two repetitions each:

- A: original browser fetch body getReader, one server write/end.
- B: original browser fetch body getReader, two server writes.
- C: public Playwright Response.text, two server writes; browser fetch acquires response without consuming its body. No browser getReader beforehand. Record browser reader EOF as not exercised, never fabricate it from native text or byte totals.

A/B require read() done=true, browser crypto.subtle decoded SHA256/count, server finish, no caller abort. C hashes only actual native returned bytes; unavailable/unsettled -> failed/unknown, browser EOF not-exercised. C faithfully measured body defect is valid diagnostic behavior, never fabricated delivery. A/B observe native finished without a second stream.

Two-write prefix excludes gzip trailer; remainder is trailer. Small proof must show decoded prefix progress. A/B page.exposeBinding signals decoded progress and synchronously releases remainder/end without awaiting acknowledgment. C binding on fetch-response acquisition releases remainder without body read; record release phase. No HTTP release/sleep/timed body release. Missing release is harness failure. Observe server finish/close/writableFinished: close-before-finished is premature; finish alone is not browser EOF.

Two controls after positives: AbortController after decoded progress/remainder withheld; server destroy after prefix/trailer withheld without caller abort. Record action, reader/bytes/hash, server and native/CDP outcomes. Neither counts as delivery; missing action/observations or unexpected full delivery is control failure.

## Public native coupling

Public Request/Response/requestfinished/requestfailed listeners + context.newCDPSession(page), Network.enable before fetch. Observe requestWillBeSent/responseReceived/dataReceived/loadingFinished/loadingFailed. Response.request binds public objects; unique serial method/path correlates CDP in memory only. Ambiguity -> unknown; no timing identity claim, CDP body/private API/interception. Original Response.finished all arms, Response.text C, finite windows before teardown. Body availability differs from terminal; absent terminal -> unknown. CDP totals/server finish/hash/native completion cannot infer browser EOF; cleanup events cannot supply proof.

## Deadline, report and exit semantics

Deadline90s: setup<=10s, eight serial windows<=8s, cleanup<=5s, all within deadline. Observation limits do not change app gates; unknown terminal differs from incomplete delivery.

Strict allow-listed JSON <=16KiB at test-results/native-stream-probe.json, exactly eight rows. Header: schemaVersion/kind, actual versions, expected decoded/compressed count/SHA256, result/harnessFailure enums. Rows: fixed case/arm/repetition/control; noStore/gzip/chunked/contentLengthPresent; decoded count/hash; reader eof/error/unknown/not-exercised; callerAbort/serverTruncate; server finish/prematureClose; public/CDP terminals finished/failed/unknown; match counts 0/1/overflow; native finished/body available/failed/unknown/not-requested, available-body count/hash; CDP event/byte totals; <=24 ordered events with ordinal/relative milliseconds/overflow. Overflow bars identity conclusions. No URLs/IDs/ports/headers/body/raw errors/stack/trace/env/customer/user/auth data. STDOUT fixed result/size; STDERR fixed failure enums. Validate schema/limits; arbitrary errors forbidden.

Results: discrepancy-reproduced requires proven A/B EOF/hash/server finish, valid controls and correlated native disagreement (including C body failure). not-reproduced needs six clean positives/controls. inconclusive preserves unknown observations. harness-failure covers setup/version/schema/privacy/control/deadline/cleanup defects. Exit0 for valid experiment even observed browser/body defect; nonzero for harness/control failure. C unavailable/unsettled is measured failed/unknown, never fabricated hash. Missing A/B EOF/bytes records transport incomplete without discrepancy proof. Write sanitized report; writing failure nonzero.

Try/finally: end observation, abort only own fetches, remove listeners/detach CDP, close owned pages/context/browser/server/sockets and timers within bound. Cleanup failure nonzero; no premature process.exit/live handles. No local run; future local launch needs guard admission.

## Preservation proofs and finite next decisions

Baseline complete-byte hashes (SHA256):

- Scheduling spec 57,501B: `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065`.
- Scheduling helper 18,231B: `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082`.
- package.json 1,879B: `b14c4d6182e43ee384f159a53d077556370953a891130d84f786f3632868b35f`.
- pnpm-lock.yaml 166,878B: `532abe9d606d49daa060b41ebc91bc44b359291059b8832bed98233b65299ee2`.
- Original ci.yml: `0934289c16f56355df9c58ed2c3208574c50beb606e529c21b552ed6f7d11a95`.

Hash complete app-test/helper/spec inventory before/after, including consulted inputs. Remove three additive workflow blocks; inverse bytes/hash must match original. Reject other edits, no partial comparison.

After authoring: node --check; small proofs: payload/gzip progress, schema/privacy/limits, ambiguity, controls/classification/exit, default-off/PR/push/general-failure/probe-failure/cancel wiring. No full local app tests. High validates diff/preservation before dispatch.

One authorized experiment: discrepancy -> upstream evidence; clean -> unreproduced; incomplete/unknown -> missing discriminator and stop. No automatic rerun/expansion/app repair/upgrade/relaxation/completion/15.2.
## R1 — separate diagnostic job; original artifacts retain priority

Preparation only; same Sol Low route. Read independent High validation (7,625B/SHA256 cdbf7abee85c7040df6b4979df272dd73943162d0ebfcfa811638b37ba470daa). Its REVISE identifies reachable loss of original uploads when a same-job probe consumes e2e's remaining 25-minute budget. This R1 supersedes only original workflow additions 2/3, install-reuse and inverse-block boundaries. All experiment/API/privacy/control/exit limits remain; no source or execution authorized.

Keep default-false workflow_dispatch native_stream_probe input. Instead of adding any e2e steps, append one new job native-stream-probe after the five original jobs. No existing job substring changes. New job: ubuntu-latest; needs [verify, e2e]; timeout-minutes 10; job condition:

`${{ always() && !cancelled() && github.event_name == 'workflow_dispatch' && inputs.native_stream_probe && needs.verify.result == 'success' && (needs.e2e.result == 'success' || needs.e2e.result == 'failure') }}`

This incoming dependency waits until e2e's original uploads/cleanup complete. It adds no predecessor/dependency to any original job, delays no original artifact and changes no original outcome/budget. Late e2e failure reaches baseline uploads; new budget is independent. Cancelled/skipped verify/e2e or default-off/PR/push declines diagnostic execution and is no-execution/unknown, never observed browser behavior.

New job alone duplicates baseline pinned setup: actions/checkout@v4 with exact existing ref expression; pnpm/action-setup@v4 (packageManager); actions/setup-node@v4 with .nvmrc/cache pnpm; pnpm install --frozen-lockfile; pnpm exec playwright install --with-deps chromium. No version override/upgrade, new dependency/cache policy or app/DB/Supabase/fixture/environment import. Exact installed package/browser checks still apply. New-job checkout/pnpm/Node setup ceiling 1 minute each, frozen install 3 minutes, browser install 2 minutes, probe step 2 minutes (internal <=90 seconds). These finite maxima consume this job's own budget only; deadline exhaustion means unavailable/unknown, not a fabricated run.

Before probe, setup must have succeeded. Probe uses original foreground command and finally cleanup. Setup failure cannot trigger a retry/alternate install or eight fabricated case observations. If Node/report capability is available, a bounded fixed no-execution report may identify setup-unavailable using a separate explicit admission variant with zero cases/unknown versions; never pretend the experiment schema ran. No raw setup errors/env or app outputs enter the synthetic report. If no report capability exists, upload absence remains explicit; no application inference.

Dedicated uploader only in this job: actions/upload-artifact@v4, timeout-minutes 1, condition `${{ always() && !cancelled() }}`, native-stream-probe name, test-results/native-stream-probe.json only, retention 7 days, if-no-files-found error. Upload attempted after probe failure while own runner exists; no cancelled-run guarantee or missing report fabrication. Failure/nonzero remains visible, never continue-on-error. Probe/browser defect is diagnostic only; failing probe/upload cannot replace or erase original e2e failure.

Inverse proof changes to removal of exactly default-false input and entire new job; resulting full workflow bytes/SHA256 must equal baseline 0934289c16f56355df9c58ed2c3208574c50beb606e529c21b552ed6f7d11a95. Separately byte-compare all five complete original job substrings, including uploads, conditions, cleanup and budgets. Preserve all original graph edges and complete app-test/helper/spec/package/lock bytes. Small wiring proofs include near-budget e2e failure, independent-job setup failure, cancelled/skipped dependencies, absent report and bounded uploader. No local full tests/resources. Focused High revalidation and coordinator revised-placement reservation confirmation precede source authoring.