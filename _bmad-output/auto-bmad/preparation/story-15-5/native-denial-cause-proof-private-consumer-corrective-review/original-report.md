# Targeted independent private-consumer corrective review

Verdict: **PASS, latest F1 correction and consequential adjacent regressions only. F1 CLOSED.** No remaining concrete consequential defect was established in this bounded correction. The original NOTPASS and its three original artifacts remain unchanged. This is not a fourth broad Story 15.5 review, whole-story acceptance, or permission to collect evidence.

## Identity and actual delta

Independent Sol 6.1 High reviewer `/root/review15_5_private_diagnostic_high`, distinct from author/native qualifier `/root/native15_5_high` and Root, reviewed the actual original-versus-current two-file delta. Root recorded route `review-native-cause-proof-private-consumer-exact-artifact-admission-fix` before dispatch. Worktree `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`, branch `codex/epic-15-scheduling-time-calendar`, checkpoint HEAD `2524306ca9edd6079c23d205cf01268797288d89`, producer source `af5af69fd5018795a963a28c1ad367147b4a9bc3`, checkpoint UUID `59829dee-b02e-4343-a11f-1874f1ead5d8`.

Original collector: 36,247 bytes / SHA256 `cb6e61638cbdb0faec689fc7db9b3681b117b93edfc59e037b10affdb54da90d`; corrected collector: 45,053 bytes / `f329a8215c02e9acbbb28309cb2c44e94cef6f7581fe2d656d3cda00d5817b0c`. Original tests: 24,907 bytes / `db22e9f2a7b3cc7c8748fc0ad07476306f8f73ca4608b2e408f9d20bbe617b01`; corrected tests: 36,380 bytes / `50a3a304522f65924cc105746104801ce03f0f3aca20a24c090ff58f9ca31732`.

The original source bytes were decoded and hash/length checked in memory from Root's custody file (82,317 bytes / `4f87dd46590a6f412744ee581a0c3f42733944e5cbdbf4d7e70119facf00afa4`), then compared directly with current bytes. No original source copy or diff file was written. Root's corrective binding (1,752 bytes / `8cfa0fd23934ee69ebc058991474688253c2fd702e491ef1d5f7b76b4433d74b`) matched. Both new frozen hashes were checked again immediately before these review outputs.

## F1 closure and operational bridge

The old null wildcard has been removed from final artifact admission. A nonempty listing now requires `CONFIRMED_PRESENT`, a positive integer Root-admitted artifact ID excluding bool, and exact equality with the retained listed ID before the second GET. `CONFIRMED_EMPTY` permits null only for a genuinely empty retained listing. Pending, missing, null, bool, wrong-ID and mismatched empty/present states cannot authorize ZIP acquisition.

The review replayed the original F1 condition with a matching nonempty listing and null/empty final admission. It now refuses `ARTIFACT_ID_MISMATCH` after exactly one injected listing GET, with no ZIP GET. The positive bridge control performs exactly one listing then one exact-ID ZIP GET; the explicit confirmed-empty control performs one listing and no ZIP. No real GET was executed.

The implemented same-invocation bridge resolves the ordering gap without pretending Root knew the artifact ID before listing. Expected admission declares `same-invocation-v1`, 4,096 continuation bytes, a 60-second deadline and required stdin closure. Terminal schema v2 has exactly five mutable admission fields. Initial PENDING requires the other four null and authorizes only the fixed owned-run listing. The flushed request exposes a closed nonsecret candidate, listing/candidate/pending/expected digests, caps and `archive_authorized=false`; raw listing stays in memory.

One capped JSON continuation plus EOF identifies the candidate and final terminal raw SHA. The collector rereads final terminal bytes once, verifies their digest, validates all terminal facts and permits changes only to the five admission fields. It binds final listing bytes/digest and candidate SHA to the retained listing. It rechecks unchanged expected-admission bytes and both reviewed file hashes before any ZIP GET. The resulting qualification exposes final terminal byte length/SHA and final admission state separately from the explicitly named pending-terminal digest inside candidate proof; pending bytes are not claimed as final facts.

The bridge changes only the two allocated private helpers and uses Root's existing terminal-facts file; it creates no new discovery endpoint, stored raw API body, private file or producer effect. Root remains sole terminal writer and must supply actual facts. These review results do not manufacture or authorize that future continuation.

## Verification and adjacent regression limits

Executed with Python `-B`: **31 tests passed, zero failures/errors; nonadditive counters 19 positive and 238 negative controls; two bounded pipe-only Python driver processes.** This replaces, rather than adds to, the author's intermediate 30-test milestone and earlier 22-test counts. Existing coverage was retained/adapted to the new bridge.

Controls cover exact ID/null/bool/wrong/missing admission, all closed states, listing/candidate/final digest binding, identity/job mutations outside the five allowed fields, malformed/extra/multiple/oversize continuation, missing EOF, timeout, changed expected/helper/test bytes, one final reread, one listing and at most one ZIP, privacy/capture uncertainty and zero acceptance. Real Windows anonymous-pipe EOF and deadline controls run synchronously without a reader thread. Both bounded driver processes actually exited, reported one thread and network=false, and had their owned pipe handles closed. The driver children execute only `read_continuation`, never collector main or a GET.

An additional reviewer-run real anonymous-pipe check wrote a complete line while retaining the writer open: `read_continuation(...,0.05)` refused `CONTINUATION_TIMEOUT` in under one second. Thus a newline without EOF does not release archive authority or leave a blocked reader. This additional check is not added to the supplied suite counters.

Actual old/new AST comparison confirmed these previously reviewed boundaries unchanged: `parse_json`, `unpack_archive`, `receipt_and_manifest`, `observation`, `native_report`, `qualified_evidence`, `bounded_gh_get`, and `schema_id`. All eleven producer/dependency raw length/SHA bindings still match (22 comparisons), without reopening their broad source review. The new private schema digest is `9268cbe1e2834edd3ac80b88766305a6e62105407adb677f7351d2afbc5e0579`; its change reflects the added continuation cap. Actual producer fields/bindings remain unchanged. Root proof placeholders remain null and expected-admission/terminal-facts remained unborn when checked. All three original NOTPASS artifact byte lengths and hashes still match.

## Retained boundaries

Only the three new corrective review artifacts were written. No helper/test/product/Spec/state/prior artifact/Git/provider changes, network/artifact fetch, collector network CLI invocation, DB/RPC/native CI, managed resource launch, browser, deployment, commit, push or merge occurred. The only child executions were bounded offline pipe-reader test drivers; `-B` prevented cache files. This was targeted actual-delta review, with no additional broad story review or new producer acceptance.

PASS closes F1 for these exact two corrected hashes only. Root adoption/freeze, actual workflow availability/admission, actual Root expected/terminal facts and separate explicit terminal collection authorization remain required. Original NOTPASS records remain immutable historical evidence. All 43 DB causes and 14 browser failures remain unresolved. Diagnostic/native/normal acceptance credit is zero; normal 95/full 2039/browser/recovery/pilot gates are not satisfied; backend cause remains UNPROVEN, historical JWT/clock/input/snapshot equivalence remains unknown, development_complete=false and release_ready=false.
