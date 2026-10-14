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
