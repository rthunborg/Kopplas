# Independent High review: fixed-job one-shot TAP extractor

Verdict: **NOTPASS**. One consequential completeness finding (F1) blocks activation of this exact extractor. No source fix, operational main call, log request or retry was performed.

## Reviewed identity and limits

Owned checkout HEAD `f0b1e5735872ba2effcd7c1480756326125f6752`. Reviewed only the new one-shot extractor and its supplied proposal/allocation/closed-step evidence, plus the two pinned source identities and one static source location needed by pure controls. This is a distinct sensitive High targeted review, independent of the implementation author; the existing reviewer was reused. No fourth broad Story15.5 review.

Materialized extractor:8575B/SHA256 `16bcb852e3923e03cff1e3c1fdd08dd38045299851c27fbc8e01c25728a5364a`. Proposal:15202B/SHA256 `b266966e2dec8dd74235d7a9edda2b41731b124e328ec3ea567822d94d1ba1fe`; its decoded payload equals the materialized bytes exactly. Closed-step metadata:3155B/SHA256 `7a67cabd894ac8db000959a22a6e8615378721dcfac17d054e9b55e3605f6258`, binding run39569322317/job119119310666/HEADf0b1. Accepted allocation:2114B/SHA256 `8892eac82f63c6c9d7fbaab84e054916abaf0a92d9e6197edccd4cc5d6c7f8d8`. These are retained metadata/source facts; no real job log was fetched.

## F1 - marker presence can falsely establish complete TAP

Affected extractor lines38-59, with the consequential promotion at line81. `analyzeTap` requires one TAP header, six summary names, fail>=1, some root-plan line and some duration line. It never establishes a unique consistent root plan, complete root test-record sequence, or consistent summary. Requiring at least one parsed failure at line58 does not fill that gap. The actual caller at line81 promotes any parser return to `status=LOCATED_FAILURES` and `tap_complete=true`.

Reachable caller: the Root-only one-shot GH callback after a successful observed-byte capture and unchanged input qualification. Static source path/line qualification can succeed for every returned record while the rest of the transcript is incomplete or contradictory. Neither the source validator nor the existing transport-success check validates TAP completeness. This bypasses the allocation's explicit malformed/partial=>incomplete UNKNOWN invariant.

Pure controls through the actual exported analyzer demonstrated three false acceptances, all using the same genuine HEAD source path and an in-range line/column:

- Flat transcript with only record1, but root plan1..2 and summary tests2/pass0/fail2: accepted, returning only one failure record.
- Flat transcript with one failing record and plan1..1, but tests1/pass1/fail1: accepted despite the contradictory summary.
- Transcript containing conflicting root plans1..1 and1..2: accepted.

These examples do not rely on a false assumption that nested-suite summary fail counts must equal every `not ok` record. The first two are deliberately flat and the third has conflicting root plans regardless of nested semantics. No actual native transcript completeness or backend cause is inferred from them. The finding is one missing completeness qualification with three counterexamples, not three separate defects.

Required invariant before any complete claim: either establish the supported TAP grammar/record and summary consistency, or stop claiming TAP completeness. Return UNKNOWN for malformed/incomplete/unqualified text. No code change is made by this review.

## Proportional corrective direction

After F1 was reported, the parent proposed a strictly weaker extractor rather than a full TAP parser. That direction can fit the existing allocation: always retain TAP qualification UNKNOWN and tap_complete=false; emit only positively observed, source-validated **unqualified location candidates** with the existing static-source/line/title-digest/fixed-category whitelist. Keep observed-byte callback transport status distinct, omit unvalidated TAP summary claims, and make no complete failure-inventory, zero-failure, absence, backend-cause, fix or CI-retry conclusion. A partial/malformed transcript must remain UNKNOWN even when individual candidates validate.

This is a conditional scope/contract assessment only. It does not close F1, review a replacement, authorize execution or require another broad story pass. This original NOTPASS finding and artifacts remain immutable; a correction requires its own bounded author/review evidence.

## Other reviewed boundaries and controls

Source inspection confirms one fixed job-log endpoint and one execFile invocation, shell=false, Windows-hidden child, timeout15000/maxBuffer4194304 during collection; a fresh wx result reservation and two fsynced states precede the child call. The consumed intent remains present on uncertain paths; no retry loop exists. Error/stdout/stderr values are not printed or persisted by the code; summaries use fixed enums, hashes and bounded static locations. Source locations reject traversal and are qualified under owned tests/unit realpaths against HEAD blobs and line/column bounds.

I did not invoke main, reserve its result, start real gh, or simulate an effectful main lifecycle. These process/durability conclusions are source inspection, not actual transport/fsync/kill/closure proof.

Independent pure observations: five synthetic analyzer transcripts produced two expected outcomes (valid single failure accepted; unclosed second failure refused) and the three F1 false acceptances above. Seven separate capture controls passed for buffer cap, timeout/killed, generic failure, interruption, invalid UTF-8 and successful observed-byte capture. One additional own-accessor error control passed without invoking getters. Successful analyzer results contained neither synthetic title nor private-value sentinel text; titles were digests and source/category output stayed bounded. The proposal's eighteen synthetic controls are attributed author evidence, not rerun or added to these observations.

The original materialized script/proposal and source input hashes are unchanged. The operational result remains unborn. Normal/native acceptance credit0; this does not establish development completion, fix authority or CI retry authority. October19 bounded-recovery and no-legacy rules remain in force.

## Ownership

Created only this fresh review directory and original-report.md, original-attestation.json and six-key result.json. No source/Spec, Git/index, canonical state, private extractor/result, provider/API/log/artifact/CI or resource mutation occurred. No raw real logs were acquired, persisted or output.
