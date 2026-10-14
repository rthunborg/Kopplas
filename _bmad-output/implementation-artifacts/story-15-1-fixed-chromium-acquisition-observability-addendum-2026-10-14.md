# Story 15.1 acquisition observability addendum — 2026-10-14

## Authority and scope

Sol 6.1 High preparation only; coordinator HEAD `a39cd221685df5fb3fd92e044b43b57fd8cf6e47`. Only this addendum is writable; independent High owns validation. No Git/state action. Diagnosis 10,245B/SHA256 `991b140b5522f25a999c115ea7be592c32f89cc3d1d244921e406cff8804fd8c`; probe 56,441B/`d0a380500ad19a6ddd509d80e4481f27c5dfc2b60ca4ad7bd8be799ec98600fc`; workflow 34,149B/`0e00adb8ee60d0f9b3d2605d5213c5c0eee26ace0d2a8ec662cfaaeaeca3b5c1`. R1/native audit govern. Actual cause UNKNOWN, paired cases 0; later Windows metadata cannot explain earlier Ubuntu failure.

Conditional scope: acquisition-only `tests/diagnostics/no-store-stream-probe.mjs`; one uploader in optional fixed job of `.github/workflows/ci.yml`. Preserve six prior jobs/input bytes, eight original cases/default entry and paired runner/body/sidecar/qualification. Shared-helper telemetry is acquisition-only; other behavior/error authority stays unchanged. Preserve official URLs/pins/revision/generation/MD5/size/source provenance/ZIP/version checks and deadlines. No other job/input/checkout/inventory test/DAG/command/permission/assertion, retry/fallback/cache/SDK/default-browser/E2E fixture change.

## Receipt

UTF-8 JSON/newline, <=4,096B, exclusive static repo `test-results/fixed-chromium-acquisition.json`. Exact scalar keys: `schemaVersion:1`, `kind:'fixed-chromium-acquisition-boundary'`, `targetVersion:'158.0.8104.0'`, `targetPlatform:'linux64'`, `status:'ready'|'failed'`, `stage`, `reason`, `pairedCases:0`. Validate exact keys/constants/enums/size; freeze before serialization, no late mutation.

Stage means operation entered, not completed or underlying cause. Reasons require private trusted tags/callbacks at existing predicates; raw/spoofed errors map to `unknown`, allowed at every failed stage:

| Stage | Reasons |
| --- | --- |
| invocation | arguments |
| setup | setup-rejected |
| temp-root, receipt-write | io |
| metadata | http-status, timeout, network, aborted, oversize, invalid-json, metadata-rejected |
| head | http-status, header-rejected, timeout, network, aborted |
| download | head reasons plus oversize, incomplete |
| archive | length-rejected, md5-rejected |
| extract | zip-rejected, extract-failed, deadline, io |
| executable | executable-rejected, version-rejected, version-process-failed, io |
| receipt | receipt-rejected |
| deadline | deadline |
| handoff | privacy, io |

Ready requires `complete/none` after original handoff; failed/none is invalid. HTTP/timeout/rejection mean observed non-200/existing timer/predicate, never inferred cause. No actual version/hash, raw errors/stacks/paths/env/headers/URLs/bodies/request or application IDs/auth data. Targets are expectations. Stage cannot prove download/version execution or absence; bounded `--version` is possible, paired cases are not. Private qualified receipt stays separate.

## Reporting and CI

Report even argument/setup/temp-root failure independently of candidate-root creation. Check static repo containment/symlinks; bounded directory creation and `wx` write only. Never overwrite/delete/truncate or claim an existing file. Reporting/flag work <=2s; original 175s/three-minute deadline stays. Late settlement cannot emit flag/ready or promote evidence.

Acquisition OR reporting/flag failure exits 1 with original stderr `fixed-chromium-acquisition unavailable\n`; reporting cannot mask original failure. Only total success emits original stdout `fixed-chromium-acquisition ready\n`, exit 0. No new console text. Preserve private `executable=<path>\n` bytes. Earlier handoff may exist on report failure; paired step skips.

Append fixed `acquisition_receipt_written=true\n` to GITHUB_OUTPUT only after fresh receipt completes, ready OR failed. Collision emits no flag; output error fails closed. Append errors may leave bytes, but any true flag follows fresh creation and never greens acquisition. Add separate actions/upload-artifact@v4 uploader: `${{ always() && !cancelled() && steps.fixed.outputs.acquisition_receipt_written == 'true' }}`, one minute, artifact `fixed-chromium-acquisition`, only this JSON, seven-day retention, missing-file error. Preserve paired uploader/missing-report failure. No binary/ZIP/raw metadata upload. Maxima 17 minutes within unchanged 18-minute job. Missing/cancelled evidence is unavailable.

## Proof and admission

Retain private proofs; use a fresh admitted path. Exercise actual CLI entrypoint in memory, mocking all network/fs/process/time/output. Cover every stage/reason, spoofed errors, schema/size/privacy, pre-root failure, containment/symlink/collision/write/flag failure, late settlement, success/failure and exact console/exit/handoff. No real process/network/binary/fs writes. Test actual metadata/transport/archive/ZIP/version predicates; prior rejections stay closed. Prove no second acquisition/pair execution, original probe inverse/default/paired behavior and six prior jobs/input identity; workflow inverse removes only new uploader, no checkout-unit change.

Independent High contract PASS precedes root source/proof admission; independent High source/proof review precedes ONE separately admitted runtime. No current execution or acceptance/RLS/visual/release credit. P5=false; broad review 0/3; Story 15.2 excluded. Actual acquisition cause and application EOF/cancel actor remain unresolved.

## Source author evidence — 2026-10-14

Fresh Sol 6.1 High implementation for privacy logging, binary provenance and failure integrity; no nested handoff. Root admitted exactly the acquisition telemetry in the existing probe and one fixed-job uploader after independent contract PASS. Author checks are complete; fresh independent source review and any later runtime admission remain pending. The preceding 5,429B contract remains byte-identical, SHA256 `f0ecf5183de2ee1b24b5eeade56c5a660e825f6599e15c28ee703bf5fb2aabfa`.

| Final source | Bytes | SHA256 |
| --- | ---: | --- |
| `tests/diagnostics/no-store-stream-probe.mjs` | 63,669 | `6dac3193961859e47f0912806d3cf6b50744ff572bd673b8a1a29718f14c7107` |
| `.github/workflows/ci.yml` | 34,628 | `58c62d60f171a1d261f7fa9810127b79425c8ba733014dcfd727091423445932` |

New private proof directory: `.env.epic15.mail-runtime/acquisition-observability-source-2b40ff69-9642-4d2d-ab53-271a1068c666/`. Before/final source archives, independently executable `inverse-operations.json`, actual-source VM proof code, protected ten-binding snapshots, final/intermediate TAP/native exit receipts and `source-proof-manifest.json` are retained there. No old proof suite, fixture, inverse receipt or archive was rerun or written. Root state is excluded; no state preservation claim is made.

Implementation emits only the eight closed scalar fields. The 1,024B enforced ceiling is tighter than the contract's 4,096B maximum. Trusted operation/predicate callbacks record the entered stage and first reason; arbitrary thrown/spoofed errors retain unknown. Original failure is frozen before static reporter work. Static containment/symlink checks, exclusive write, two-second abort/fences and the fresh flag follow the fully written receipt. Collision/partial/reporting/flag failures retain generic unavailable stderr and exit 1. An append error may leave flag bytes only after a fresh complete receipt; it cannot produce success stdout or green acquisition. Original executable handoff bytes, acquisition order/pins/predicates/deadlines and private qualified receipt remain authoritative. This instruments failure visibility; it does not fix or identify the earlier acquisition failure.

Final `node --experimental-vm-modules --test <private>/proofs.test.mjs`: 63 executed/pass, zero failed/skipped/cancelled, native exit 0. These include 60 actual production-module CLI evaluations in isolated VMs and three read-only preservation tests. Before evaluation, acquisition argv/entry markers are checked; every imported network/filesystem/process/time/output surface is mocked, while server/SDK/dynamic-launch routes are denied. File operations and handoff/flag outputs exist only in memory. Synthetic ZIP/digest/version fixtures exercise control flow and validators, never establish real acquired binary identity or execution.

Forty-five injected acquisition failures exercise the actual CLI stage/reason, frozen fresh failed receipt, generic console and nonzero authority. Additional tests cover ready success/order/exact handoff; all legal closed schema combinations, unknown keys and hostile markers; actual metadata/HEAD/archive/version predicates; pre-root reporting; static containment/symlinks, directory rejection, exclusive collision and partial/late writes; flag failure before/after bytes and timeout; original failure versus writer failure; and actual late request error without receipt/flag mutation. Legal schema reasons are not represented as observed native causes. No live transport or version process was run.

Focused checkout CI unit: 4 executed/pass, zero failed/skipped/cancelled, exit 0. Probe syntax and changed-source ESLint both exit 0; lint emits no warnings/output. Complete two-source inverses recover the admitted 56,441B probe/`d0a380500ad19a6ddd509d80e4481f27c5dfc2b60ca4ad7bd8be799ec98600fc` and 34,149B workflow/`0e00adb8ee60d0f9b3d2605d5213c5c0eee26ace0d2a8ec662cfaaeaeca3b5c1`. Original default marker inverse still recovers 25,358B/`f4b0d06fa6ad41f94767b54a882f1b77b7ae3098a2a952ea1ef9f2ccfbadb647`. Twenty-seven original/default/paired case functions, paired non-acquisition branch and entry bytes compare identically. Workflow inverse removes only the new uploader; all six prior jobs, inputs, paired commands/uploader, checkouts, graph, permissions and budgets remain unchanged. Summed optional step maxima are 17 minutes within the original 18-minute job.

Ten protected bindings compare with zero mismatches: unchanged checkout unit 2,511B/`313f11c18c66d8bb242e66cb27c314b9fbe3eca94573a4276ce28c308beb5b28`, app spec/helper, package/lock/default Playwright configuration, independent observability validation, diagnosis, native audit and old paired addendum. No exhaustive project/private-history audit was repeated.

Intermediate failures are retained: first harness load had a private syntax error (one failed file test, zero CLI evaluations); next batch executed 59, passed 58, failed one because its fake clock injected the raw error at extract rather than final deadline. Source correctly retained extract/unknown; private clock injection was corrected. The following 61/61 and final 63/63 batches pass with zero skips/cancellations. A private manifest collector initially assumed an empty successful lint pipeline created a text file; native exit 1 is recorded in `manifest-r1-failure.json`, and the final collector records that file as absent alongside the actual lint exit-0 receipt. These corrections change no production source predicate.

Review stops: first verify final archives/two byte inverses/default marker inverse and ten protected bindings; then inspect acquisition-only trusted callbacks and frozen failure before the reporter; inspect containment/freshness/abort/flag failure witnesses and generic console authority; finally verify the uploader's fresh-flag condition, prior job/paired byte preservation and final executed/skip counts. Source-stage proof is not native compliance. HTTP/acquisition/download/install/version/browser/server/DB/CI/Git/state/deployment actions by this author: 0. Earlier native cause remains UNKNOWN and paired native cases remain 0. P5=false, broad review 0/3, original app/observer blockers and Story 15.2 exclusion remain; no application/RLS/visual/completion/release credit.
