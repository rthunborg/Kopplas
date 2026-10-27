# Independent private diagnostic consumer review

Verdict: **NOTPASS**. One P2 collection-admission defect blocks adoption of the two frozen private files. This is their first bounded independent review, not a fourth broad Story 15.5 review. Existing source reviews and their original artifacts remain unchanged.

## Reviewed identity and independence

Reviewer: distinct Sol 6.1 High delegate `/root/review15_5_private_diagnostic_high`, independent of the helper author/native qualifier `/root/native15_5_high` and Root. Route: `review-native-cause-proof-private-diagnostic-consumer`, recorded by Root before dispatch. Worktree: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`; branch `codex/epic-15-scheduling-time-calendar`; HEAD `2524306ca9edd6079c23d205cf01268797288d89`; producer source `af5af69fd5018795a963a28c1ad367147b4a9bc3`; checkpoint `59829dee-b02e-4343-a11f-1874f1ead5d8`.

The collector is 36,247 bytes, SHA256 `cb6e61638cbdb0faec689fc7db9b3681b117b93edfc59e037b10affdb54da90d`. Its test file is 24,907 bytes, SHA256 `db22e9f2a7b3cc7c8748fc0ad07476306f8f73ca4608b2e408f9d20bbe617b01`. Both hashes were checked before review and again before these outputs were written.

## P2 F1: Require Root's exact artifact ID before the archive GET

Location: `collect-diagnostic-evidence.py:210`, with the admitted-null branch at line185 and archive acquisition in `collect`.

Caller and authority: the future operator invokes `main(["--collect-after-terminal-authorization"])` using Root-owned, hash-bound expected admission and completed terminal facts. The approved collection contract permits the fixed owned-run artifact listing, followed only by the exact admitted artifact ID ZIP. Root's explicit terminal grant remains required; no such grant or network call was made in this review.

`validate_terminal` accepts `artifact_id=null`. For a nonempty listing, `listing_artifact` currently checks `t["artifact_id"] is None or t["artifact_id"] == a["id"]`. Null therefore becomes a wildcard rather than unavailable/unknown evidence. Once the remaining run/name/mode/source/digest checks pass, `collect` immediately constructs and calls the archive endpoint for the returned ID. No downstream validator requires equality to a positive Root-admitted artifact ID before that GET. The archive hash and producer receipt checks happen after the unauthorized additional acquisition, so they cannot enforce this collection boundary.

Offline reproduction used the supplied fixture constructors: valid expected admission; completed terminal facts with `artifact_id=None`; a single otherwise matching artifact ID9 and matching archive. Calling `collect` with an injected memory-only getter made two calls: `repos/rthunborg/Kopplas/actions/runs/7/artifacts?per_page=100&page=1` and `repos/rthunborg/Kopplas/actions/artifacts/9/zip`. It returned `DIAGNOSTIC_OBSERVED_WITH_LIMITS` with artifact ID9. Thus Root's null admitted ID did not stop the second GET. This is a concrete collection-authorization bypass even though the additional artifact remains constrained to the owned run and normal acceptance credit stays zero.

Required correction: keep null only for a genuinely empty listing/unavailable-artifact outcome. For any nonempty listing, require a positive Root-admitted ID and unconditional equality with the listed artifact ID before calling the archive getter. Add a meaningful negative control with null admitted ID plus a matching nonempty listing; it must refuse after exactly the first listing GET and before the archive GET. Retain the existing positive exact-ID and empty-list/null cases. Do not fabricate an ID, perform extra discovery, or retry the network to resolve uncertainty. Refreeze changed helper/test hashes and obtain the bounded independent corrective review before adoption.

## Verified controls and compatibility

The supplied suite was executed directly with Python `-B`: 22 tests passed, zero failures and zero errors; its nonadditive counters report 14 positive and 178 negative controls. All transport behavior in these tests is injected; network_executed=false, native_credit=0, normal_acceptance_credit=0. These passing controls do not cover F1 and are not acceptance evidence.

Independent additional pure checks verified the template's nine null Root-proof placeholders, producer schema SHA256 `a9c12ab2e7cba2746aaf1b7e15e500ee73a45e8180e6ad58a9ad64fc2bef405e`, disabled network gate, and five missing terminal identity/authorization fields refusing before transport. The F1 injected reproduction above was separate from the supplied suite and its counters.

All eleven hard-coded producer/dependency bindings matched actual raw byte lengths/SHA256, Git-clean OIDs, checkpoint OIDs and producer-source OIDs (55 comparisons). Root binding, source freeze and exact private-consumer allocation hashes matched the dispatched values. The Root-owned expected-admission and terminal-facts files were still unborn when checked.

Compatibility inspection covered the actual committed runtime's diagnostic receipt/manifest, four launch states and nullable started uncertainty; exact ten-field observation and max16 closed events; actual DIAG001 declaration and output path; source-enforced F1 executing-role/same-statement strict three absence booleans; launch-state monotonicity; mode-aware checkpoint/workflow context. The consumer does not invent an observation visibility field or reinterpret 42501 as a first backend cause. Installed Vitest4.1.9 JSON reporter, runner suite enumeration and snapshot summary source were inspected against the native parser; this is source compatibility evidence, not an executed native report.

The scoped controls exercise mode/SHA/UUID/run/attempt/unknown-field/unknown-enum/artifact/count/manifest/observation/privacy refusal, ZIP path/symlink/comment/extra/trailing-payload and size limits, duplicate/deep/nonfinite JSON, capture loss after child start, nullable launch uncertainty, fixed transport endpoints, byte caps, timeout/no-retry and zero acceptance. The identified artifact-null bypass remains unresolved. No other consequential finding was established within this bounded two-file review.

## Limits and retained gates

Only these three new review files were written. No helper/test/product/Spec/canonical state/prior artifact/Git/provider changes, artifact fetch, real collector network mode, DB/RPC/native CI, managed resource, browser, deployment, commit, push or merge was performed. Python ran with `-B`; no cache file was created. The initial read-only shell call did not honor its requested cwd and enumerated outside the worktree with access-denied errors; all substantive review reads and subsequent commands used an explicit worktree Set-Location, and no outside material was used as evidence.

The applicable worktree AGENTS and newer owner instructions supplied by Root/user were respected; no legacy application was browsed. Prior producer F1/F2/F3 review closure is historical context, not a new broad review here. All 43 DB causes and 14 browser failures remain unresolved; normal 95/full 2039/browser/recovery/pilot gates receive zero credit. Historical clock/JWT/input/snapshot equivalence remains unknown. Diagnostic backend_cause remains UNPROVEN, development_complete=false and release_ready=false. NOTPASS and this report authorize no collection or execution. Root must preserve the originals and route only the bounded corrective change; subsequent actual expected/terminal facts, workflow availability/admission and explicit terminal authorization remain separate gates.
