# Remaining F1 buffered-record correction — targeted review

Status: author frozen, pending independent targeted F1 closure review. Acquisition/API/native acceptance remain zero. Root expected, terminal and result remain unborn.

The previous corrective review is preserved as NOTPASS/F1 OPEN/F2 CLOSED, together with its original seven files and byte custody `0138fd71be9e1b0b2318f05cfe8131db4774a81bd5d2ff18f900d222058b0ec4`. Its 32 passing author methods are historical and nonadditive. The original first NOTPASS/custody also remain unchanged. Root assigned this narrow follow-up metadata under retained scope; this is not represented as a new Coordinator grant.

## Suggested review order

1. Read the previous report's buffered-record finding and the exact previous-to-current diff identities in input-binding. **Helper/F2 code is byte-identical:** 33788B / `8e25c6d5af1de1056abb6acbc9bbc781aa84227a9233ecf31032e4d21a1fb6f7`. No helper, payload grammar, interpretation cap, endpoint, header, UUID or network budget changed.
2. Inspect actual Root driver `Lines.check_reader` and `line`: known reader error is checked on entry, during waiting and immediately before returning a complete buffered record. Then inspect the immediate checks in Root's `write_final` and `send` callbacks. A known failed reader cannot authorize terminal mutation or continuation merely because a candidate was already buffered. Physical EOF/completion/capture facts and UNKNOWN custody behavior remain intact.
3. Inspect exact ordered-buffer driver-main control `test_33`: one real bounded Python child emits initial stage, settled stage and valid candidate in one chunk. The first stage is accepted; the real reader then raises READ_ERROR, known before remaining buffered records are consumed. Assertions require only the first stage accepted, zero terminal-write attempts, zero ack-write attempts, no admitted candidate and UNKNOWN custody. Test-only traps prevent any actual Root fact or continuation effect even if the regression recurs. Companion adapter control checks a complete buffered line directly; healthy queued-after-exit controls remain.

## Frozen code and actual checks

- Unchanged helper: 33788B / `8e25c6d5af1de1056abb6acbc9bbc781aa84227a9233ecf31032e4d21a1fb6f7`.
- Tests: 29787B / `3b1824fbad1d86d3231c085bf4dc56bdf4ba26d50179dada15fd05f103add613`.
- Actual Root-written driver: 12417B / `10bea96d7f29eee685fcb761dcd80098d3b3ccd6af60667908c33a552a539beb`.

Driver change is ten added/two removed lines in Lines/main. Root wrote the exact author-supplied payload after old `3296d05e...` hash/custody verification; the author did not write Root's file.

Latest full run: **34 methods passed, zero failures/errors; 37 positive/107 negative checks, twenty bounded owned Python children**. Earlier 33-method subset omitted the actual-driver byte match while Root replacement was pending; counts are separate. The exact ordered-buffer control was also run against hash-verified old driver bytes in memory and produced its expected single failure, with no actual Root writes. That baseline is separate, not a failure of current code or native evidence. Three current files pass syntax parsing; eleven current producer raw bindings match. No help observation, operational startup or request was repeated.

Input-binding retains exact old/new code identities, prior NOTPASS/custody, current raw inputs, historical Git provenance, payload and non-authorizing Root template DATA. No original review metadata was updated. This author wrote only the allocated test and new follow-up author-three metadata. Root owns driver/facts/result; helper is unchanged.

Normal 43 DB/14 browser cause gaps, eleven failed packets and consumed P33 remain unresolved and immutable. Old listing count/cause remain UNKNOWN; no retry authority or historical equivalence is inferred. Targeted PASS, actual separate Root once-admission/activation and later separate High offline publication remain required. No normal story/full-DB/browser/recovery/pilot gate is satisfied.
