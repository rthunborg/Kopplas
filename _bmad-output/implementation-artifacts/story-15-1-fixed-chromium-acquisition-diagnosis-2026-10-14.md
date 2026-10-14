# Story 15.1 fixed Chromium acquisition diagnosis — 2026-10-14

## Outcome

**Actual acquisition cause remains unobservable; paired native comparison remains unexecuted.** No deterministic always-failing source cause was established. Present official JSON and ZIP HEAD satisfy the pinned metadata/transport predicates. These later Windows-host reads cannot establish what the earlier Ubuntu runner received or why it failed. Add sanitized acquisition-stage evidence before considering another runtime admission.

Fresh `gpt-6.1-sol` High bounded diagnosis for binary provenance and critical evidence integrity; preparation assessment, not implementation or independent review credit. Read AGENTS/routing/local setup, the bound contract/R1 validation/source review/native audit, actual acquisition source/workflow and retained native log/terminal metadata. Checkout/branch/HEAD are coordinator-supplied (`epic-15-calendar/Kopplas`, `codex/epic-15-scheduling-time-calendar`, `a5d262f84e181260d06cb06925176675759d1539`); no Git/state operation. No nested handoff occurred. Future nested handoffs must explicitly use Sol Low for ordinary work and Sol High for sensitive work, foreground-await results and retain independent review.

## Files changed

Only this reserved diagnosis document. No source/spec/config/default/browser/package/environment/state/private-proof edits, tests/proof reruns, dependency/cache changes, ZIP GET, install/version/browser/server/database launch, CI retry, fallback, synthetic pair or deployment. Network work: one exact official small JSON GET and one exact ZIP HEAD; no managed resources.

## Status

### Confirmed source path and native failure

[Run 38634351750](https://github.com/rthunborg/Kopplas/actions/runs/38634351750), attempt 1, ran exact `4b685196313d887a9e9bdb339fccb69fefc328f9`. Terminal metadata proves paired job `116103320016`: acquisition failed `2026-10-14T21:04:01Z`–`21:04:06Z`, paired command skipped, uploader failed for missing report. Paired log lines 432–439 show the exact acquisition CLI, generic `fixed-chromium-acquisition unavailable` and exit 1. The approximately four-second interval does not identify a substage. Ubuntu 24.04/Node 22.23.3 and installer log 149.0.7827.55 are setup observations, not executable receipts or browser launches.

`tests/diagnostics/no-store-stream-probe.mjs:759–763` catches every acquisition exception without inspecting it and returns before paired reporting. `acquireFixed():609–625` contains twelve distinguishable sequential boundaries: setup; isolated temporary root; official metadata; HEAD; GET; complete archive length/digest; ZIP extraction/containment; executable hash/version; receipt validation; deadline; exclusive receipt write; private output handoff. Metadata/transport helpers additionally collapse HTTP rejection, timeout, network/body/parse/validation failure into `provenance`. Filesystem/executable failures reach the same outer catch. **Zero stage/status/reason fields survive.**

The paired report writer exists only in the other CLI branch (`765–783`). Workflow `ci.yml:679–698` gives the paired step its default success condition; acquisition failure therefore skips it. The always/non-cancelled uploader then searches for a file acquisition never writes. Missing paired report is a deterministic consequence, not a second browser defect or an emitted classifier `no-execution` result. Terminal artifact metadata contains six prior artifacts and no paired artifact.

No acquisition provenance bypass or deterministic failure was identified. Package/baseline admission, payload qualification and both engines occur only in the paired branch, so they cannot cause this acquisition-step failure. No retained receipt does **not** prove no intermediate ZIP bytes/executable existed. It proves no retained qualified acquisition receipt and no executed pair. Actual metadata/HEAD/GET responses, extraction/version outcomes and failing boundary remain unknown.

### Current primary-source checks

Requests used exact URLs, identity encoding, redirects disabled and ten-second ceilings. No archive GET occurred.

- GET [exact version JSON](https://googlechromelabs.github.io/chrome-for-testing/158.0.8104.0.json), started `2026-10-14T21:17:47.1977486Z`: HTTP 200, 2,563 UTF-8 bytes; version `158.0.8104.0`, revision `1717709`, exactly one Chrome linux64 entry pointing to the pinned ZIP URL.
- HEAD [exact linux64 ZIP](https://storage.googleapis.com/chrome-for-testing-public/158.0.8104.0/linux64/chrome-linux64.zip), started `2026-10-14T21:17:47.4809039Z`: HTTP 200; generation `1791951285551907`; stored/HTTP lengths both `202355055`; stored encoding `identity`; MD5 base64 `S8PCqhpzVlf30GOpbYS6og==`, hex `4bc3c2aa1a735657f7d063a96d84baa2`.

Direct comparison satisfies current `checkMetadata():490–494` and `checkTransport():480–484`. These later host-specific facts do not explain earlier runner transport differences, timeout, GET/digest/archive/extraction/version/I/O failure. No publisher SHA256, downloaded ZIP/executable hash, compatibility or upstream-change causation was established. Existing exact tagged-source inclusion/ancestry evidence remains the bound preparation evidence, not newly verified binary behavior.

### Input identity

Whole-file reads reproduce probe 56,441B/SHA256 `d0a380500ad19a6ddd509d80e4481f27c5dfc2b60ca4ad7bd8be799ec98600fc`, workflow 34,149B/`0e00adb8ee60d0f9b3d2605d5213c5c0eee26ace0d2a8ec662cfaaeaeca3b5c1` and checkout unit 2,511B/`313f11c18c66d8bb242e66cb27c314b9fbe3eca94573a4276ce28c308beb5b28`. Addendum/validation/source-review/native-audit and all three terminal metadata files match coordinator bindings. Paired log: 41,525B/`f3d36729e6e3a62bafdc0710a21bd6dc53ca5a5928f983ab6fb45696478e5cfe`.

Consult the bound [native audit](story-15-1-fixed-chromium-paired-probe-native-audit-2026-10-14.md), 15,107B/`d22fa06e2e71af732ff7cbeb268911ef59040dac2ea48a790a4ffcb8b7713e36`, for the complete native inventory. The 34,077B/R1 qualification prefix remains authoritative as recorded by source review. Private inverse-manifest pre-rerun identity remains unproven; no reconstruction/rerun here repairs it.

### Minimal proposal — not admitted implementation

Proposed source path: `tests/diagnostics/no-store-stream-probe.mjs`, acquisition branch/helpers only. Track the last operation entered and fixed typed failure enums, emit a bounded terminal line, and write an exclusive <=4KiB strict-schema `test-results/fixed-chromium-acquisition.json` receipt with kind/version, pinned public artifact identity, stage, status and reason. Success is recorded only after each existing validator returns. Distinguish request timeout/network/non-200, metadata/header rejection, incomplete/oversize/digest, ZIP/extraction, executable, receipt-write and handoff failure. Native exceptions map to a fixed unknown/I/O enum; never derive report strings from arbitrary exception text. The receipt is observability, not a qualified acquisition/pair.

Proposed workflow path: `.github/workflows/ci.yml`, new optional job only. Add a separate one-file acquisition-receipt uploader (`always() && !cancelled()`, one minute, seven-day retention). Preserve the paired uploader/path/missing-file error; acquisition-only evidence cannot masquerade as a paired report or turn failure into success. Current sixteen-minute summed maxima leave two minutes within the eighteen-minute job ceiling; a one-minute uploader would leave one minute, subject to independently validated amendment. No prior job/input/checkout-count change is needed.

Privacy/fail-closed requirements: no raw errors/stacks/headers/response bodies/runner paths/env/signed URLs/ports/auth/application data. Allow only fixed stages/reasons/public pinned identifiers. Computed digests/actual versions require the existing completed byte/version checks and retain their actual authority. Partial stages cannot create engine rows or clean/persistence/remedy claims; receipt-write failure remains nonzero. Preserve all official version/revision/generation/MD5/length, source-ancestry, ZIP, payload/control and qualification gates; no retry/latest/default-browser/SDK change.

Root must coordinate exact amendment/author/proof paths before source admission. Resource-free proof expectations: injected failure at every stage gives the correct bounded enum/strict receipt and exit 1; hostile native strings never escape; success handoff follows all existing gates; timeout/redirect/incomplete/digest/ZIP/version rejection stays fail-closed; receipt-write/missing-upload/cancellation remain explicit; original eight-case/default behavior and all six prior jobs/input invert byte-for-byte. Retain existing private proofs and use a newly admitted path for new receipts. Independent Sol High contract validation and source/proof review must precede root consideration of ONE separately admitted runtime. This diagnosis does not independently review its own proposal.

## Open questions

Which acquisition boundary failed, and what sanitized reason did it produce? Retained logs cannot answer. Current availability cannot safely select a source fix or attribute the failure to metadata, binary mismatch, download, extraction, network or compatibility.

## Deferred work

Formal amendment, source/tests/workflow implementation, independent High validation/review and later runtime admission remain root-coordinated future work. No blind repeat is recommended. Private original-reader observer stays blocked/uninserted; application/helper/response-capture changes are outside this diagnosis.

## Blockers

Paired native coverage: **0 baseline/fixed cases, 0 sidecars/controls, 0 qualified ZIP/executable receipts, 0 paired artifacts**. General E2E still fails AC2 with `net::ERR_ABORTED` twice; ten later scheduling tests and six phone targets remain unexecuted. Actual application EOF/cancel-actor proof is absent. Prior required-job passes remain separate: Story 15.1 has eight actual DB/JWT tests plus four actual authenticated scheduling reader/RLS tests; twenty-one transport mocks earn no RLS credit. Synthetic diagnostics cannot substitute for app acceptance. P5=false; broad review 0/3; Story 15.2 excluded; no completion/release credit.

## 2026-10-15 append — executable-version predicate diagnosis

### Outcome and files changed

**Confirmed source-format incompatibility; actual native rejecting component remains UNKNOWN.** The current predicate rejects standard `--version` output defined by both exact pinned Chromium tags. This is a deterministic static finding, not a captured native stdout value or proof that it was the sole native cause. The original 10,245B diagnosis is preserved in full; its earlier run 38634351750 cause remains unobservable. Later Windows JSON/HEAD reads do not explain either run.

Fresh bounded Sol High for provenance/critical integrity. Coordinator-supplied current HEAD `39b84268e8eeffb3f9a6ff6b055846187c166d4b`; no Git/state/source/spec/proof/capture edits. Only this append. Actual operations were static reads/hashes and public primary documentation/tagged-source reads; no acquisition endpoint GET/HEAD, ZIP download/extraction, version process, browser/server/DB/resource/CI execution or proof rerun.

### New native boundary, separate from historical failure

Run [38652607316](https://github.com/rthunborg/Kopplas/actions/runs/38652607316), exact `eaabd2d0020b391247e1a4383b0eaf6291f0ac83`: acquisition failed `2026-10-14T23:31:55Z`–`23:31:59Z`; publisher and one-file acquisition upload succeeded; paired command skipped. Read-only extracted receipt is 206B/SHA256 `107acb640e92b10695f70bf943c6a86a6182b4a56f80cacff236cb67f0930ccc`: exact eight fields, failed / executable / version-rejected / pairedCases 0, target 158.0.8104.0/linux64. Target is an expectation, not actual version. Native stdout/stderr and complete ZIP/executable SHA/provenance receipt were not retained. No browser comparison or emitted pair classifier result exists.

`executableReceipt()` (current probe lines 842–851) passes the exact expected `FIXED.version` to `checkExecutableVersion`, after file checks/read, and invokes `execFile(path, ['--version'], {timeout:5000,maxBuffer:256,windowsHide:true}, callback)`. Callback errors take distinct `version-process-failed`; `version-rejected` is emitted by the subsequent predicate (837–839): unsupported expected version, truthy stderr, non-string stdout or product/version regex mismatch. The actual call supplies the allow-listed 158 target, so unsupported expected version is not indicated. Ordinary native API defaults do not imply a Buffer mismatch. Nonempty stderr versus stdout grammar remains unobserved.

Current source bindings match: probe 74,792B/`95c967788cff764f1d546ec1a0b1bdd77cc116a57c714774447b266ef870a5f9`; workflow 35,082B/`25c9f3672f4538a95d5fb573421739ae14be757d0a2b72fc39e756dfcae1d304`. Read receipt ZIP, terminal metadata and transport manifest match their supplied bindings. Existing independent 92/92 transport and seven-ZIP/45-entry audit is not repeated or converted into acquired-browser proof. Consult the bound native audit, now 31,174B/`616797ef54235aa4526d10f2761f0f9258b279eeca84133270cfefe1aed268e3`, for originals and runner-guard delivery qualifications.

### Primary-source facts and deterministic counterexample

[Node 22.23.3 API](https://nodejs.org/download/release/v22.23.3/docs/api/child_process.html#child_processexecfilefile-args-options-callback) specifies UTF-8 strings by default; the actual call sets neither buffer encoding nor shell. [Exact Node source](https://raw.githubusercontent.com/nodejs/node/v22.23.3/lib/child_process.js), read at `2026-10-14T23:50:19.3171365Z`, 28,131B/SHA256 `77f27adef6b921c2986dfc45680b824e8ddf4664ad2c6bcf1fcca07c66f2f74c`, sets utf8 at 331 and concatenates chunks unchanged at 396/404 before callback at 410. It does not trim the channel separator. Thus no deterministic default API-type defect was found.

The [exact 158 delegate](https://chromium.googlesource.com/chromium/src/+/refs/tags/158.0.8104.0/chrome/app/chrome_main_delegate.cc?format=TEXT), read/decoded in memory at `2026-10-14T23:49:24.0680059Z`, 82,547B/`43a8266dcf2f6c084a5839db6e849dd009581b18023d2308abc5b69df9b70d76`, defines `--version` at 441–442 with `printf("%s %s %s\n", ...)`: product, version, channel. There is always a literal space after the version. If channel is empty, that space still precedes LF; otherwise the channel text follows. The predicate instead permits the pinned version followed immediately by optional CR/LF. Both source-defined forms fail that grammar, even with empty stderr and the permitted product and exact version.

[Exact 158 POSIX channel source](https://chromium.googlesource.com/chromium/src/+/refs/tags/158.0.8104.0/chrome/common/channel_info_posix.cc?format=TEXT), read at `23:49:24.8192059Z`, 5,289B/`916bbcb36b9d6d07631cac1b69e0ac1aa3009793ae0932417f6c17cd85e85a97`, can return empty or named channels for branded builds and an ambient channel for other builds; the mandatory separator does not depend on which path applies. No actual CI channel value is inferred.

The [exact 149 delegate](https://chromium.googlesource.com/chromium/src/+/refs/tags/149.0.7827.55/chrome/app/chrome_main_delegate.cc?format=TEXT), read at `2026-10-14T23:50:18.5323500Z`, 69,505B/`85f692bcd20a49844da2370ce6be5e6acb4291682c4f73fd2c70e77ae0fddab1`, likewise defines the three-field format at 379–383. The shared predicate therefore also conflicts with the source-defined bundled full-Chrome baseline format, if future execution reaches its admission. That baseline did not execute here.

A source-derived counterexample is the permitted product plus exact pinned version plus one space plus LF, empty stderr, no callback error. Its terminal suffix is hex 20 0a; the current predicate permits neither that space nor a channel. This is a mathematical/static witness, not an executed test, downloaded binary or historical native output. Exact source-tag format evidence does not establish that the unretained acquired executable produced those bytes. Consequently the concrete grammar defect is established while the native stdout/stderr component and any additional rejection remain unknown.

### Narrow future proposal, not implementation or admission

A potential correction is a bounded, exact source-derived three-field `--version` grammar: retain permitted product names and the exact two pinned versions, require the explicit separator/channel position and a closed authorized channel set, keep empty stderr and native-process failure checks. No arbitrary trim/whitespace normalization, substring/version extraction, arbitrary suffix, stderr waiver, command switch, fallback or SDK/browser change. Whether any legacy no-channel fixture form remains accepted requires an explicit reviewed contract decision, not silent broadening. Acquisition order, hashes/pins/deadlines, runner-guard certificate/publisher mechanism, six prior jobs/input, default eight cases and paired classifier/sidecar behavior remain untouched.

Meaningful future witnesses would cover source-derived empty and authorized nonempty channel forms for both versions, exact separators/end-of-input, wrong product/version, unknown suffix, extra whitespace/lines, nonempty stderr, non-string values, process error and late settlement. They would execute the actual predicate and mocked native callback/CLI path, retain original failure/exit and receipt authority, and verify original source/workflow inverses. No such witnesses ran here. A concrete correction contract and independent High validation/source review would be required before any implementation or separate runtime admission.

If additional diagnosis is needed, minimal privacy-safe telemetry would split the controlled version-output rejection into expected-version, stderr-present, stdout-type and stdout-format flags/enums, evaluated without emitting either stream or accepting it. No current telemetry or receipt change was made. This is optional future proposal material, not an instruction to dispatch or retry.

### Remaining blockers

New General population remains 382 titles: 368 passed, 13 skipped, one failed; 400 entries: 375 passed, two failed, 23 skipped. Scheduling remains seven passed/one failed/ten skipped. Original AC2 capture 3 has pending finished/body uninvoked; retry has no native capture receipt and its state remains unknown. Earlier run CDP facts cannot fill that gap. Application EOF/cancel actor is unknown; six phone targets are unexecuted. Paired baseline/fixed cases, controls and body sidecars are all 0. No actual 158 version, binary compatibility, native remedy/persistence or app acceptance follows. P5=false; broad review 0/3; Story 15.2 held.
