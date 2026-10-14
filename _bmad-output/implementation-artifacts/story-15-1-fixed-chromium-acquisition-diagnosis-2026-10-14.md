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
