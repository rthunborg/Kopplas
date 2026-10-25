# Independent High F1 corrective closure

Verdict: **PASS - F1 CLOSED for the corrected bytes**. No new consequential regression was identified in this narrow delta. The original NOTPASS report, attestation, result and Root manifest remain unchanged.

Corrected materialized extractor:8505B/SHA256 `fde47b848880a7cf1b5d8dd55fec23daef070104b6369ee194fa849edab313aa`; corrective proposal:16366B/SHA256 `00c96620ae2401a3c8bf284f5f614c83585b8672d1a54aa239b97076cb8d10f3`. Its decoded payload matches exactly. The old8575B/SHA25616bcb852 payload remains in the immutable original proposal (15202B/SHA256 `b266966e2dec8dd74235d7a9edda2b41731b124e328ec3ea567822d94d1ba1fe`). Root's guarded-replacement receipt separately records the code-only replacement. HEAD remains f0b1e5735872ba2effcd7c1480756326125f6752.

## F1 closure and changed behavior

The extractor no longer interprets marker presence as TAP completeness. Every analyzer return has qualification=UNKNOWN and tap_complete=false. It returns only source-validated unqualified location candidates, or null when none qualify; it returns no TAP summary, complete failure inventory or zero/absence conclusion. An incomplete diagnostic may supply a positive candidate, but never a completeness or causal claim. The32-candidate/50000-line bounds also retain UNKNOWN.

The actual main composition now records STOP_UNKNOWN/UNQUALIFIED_SOURCE_CANDIDATES_ONLY with tap_complete=false and only parsed location_candidates/constant limits. Its initial state uses location_candidates=null. The final completion is always STOP_UNKNOWN/retry=false with exit1. LOCATED_FAILURES, tap_summary and tap_complete=true are absent. Thus each original malformed flat transcript can retain a useful candidate without the false qualification that caused F1.

This strictly weaker truthful extraction fits the accepted allocation's sourcepath/line/title-digest/fixed-category whitelist and incomplete UNKNOWN rule. It does not establish that a candidate is the failing test, that the failure inventory is complete, why the backend failed, or that a fix/CI retry is justified. Existing separately recorded owner authorization and operational gates remain with Root; this review introduces no repeat generic approval requirement.

## Unchanged boundary reuse

Compared the preserved original payload with current materialized code, not merely proposal descriptions. All23 top-level AST statements outside analyzeTap/main are byte-identical as extracted from the actual parsed nodes. The entire byte prefix before analyzeTap is unchanged, including identity/pinned inputs/capture/path/category handling. The source qualification and durable-write section is byte-identical. Main's acquisition prefix is identical after only the intended failures:null to location_candidates:null field rename, and its final durable/catch/finally cleanup block is byte-identical. Main's remaining differences are the reviewed qualification/result/completion weakening.

Accordingly the earlier fixed-endpoint, one-shot consumed reservation, fsync-before-child, timeout15000/maxBuffer4194304, no-shell, raw-memory-only capture, source realpath/HEAD/line validation and no-retry privacy review is reused with actual byte/AST provenance. No unchanged broad pass was run. Actual process, fsync, kill, transport or lifecycle behavior was not executed in this closure.

## Focused evidence

One independent pure run:12/12 PASS,0FAIL/skip/cancel. It covered all three original F1 counterexamples, valid-looking text that must still be UNKNOWN, empty text, partial diagnostics, invalid source path, source qualification refusal, duplicate location, oversized title, candidate cap and line cap. Every result stayed UNKNOWN/tap_complete=false; null remained null rather than zero-failure proof. Returned candidate values retained the static source digest and fixed category, with synthetic title/value sentinels absent. Actual import-safe analyzer exports only; main and real gh were never invoked. The author's separate13 controls are attributed proposal evidence and are not summed with these12.

The operational result remains unborn. Original review artifacts retain hashes11946390/a5e8793b/0fad3e4d and original Root manifest53797411; full identities are in the attestation. Source HEAD and input/proposal bytes remain unchanged during review. Normal/native acceptance credit0; no real logs, API, CI, provider or resources were accessed.

This is independent sensitive High F1 closure by the existing reviewer, distinct from the implementation author; no fresh-context claim and no fourth broad story review. Only this new original report, original-attestation.json and six-key result.json are written. No source/Spec, private extractor/result, Git/index, canonical state or other party's files are changed.
