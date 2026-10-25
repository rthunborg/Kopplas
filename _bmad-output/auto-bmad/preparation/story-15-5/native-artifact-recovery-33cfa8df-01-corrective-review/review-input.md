# F1/F2 corrective implementation — targeted review input

Author status: frozen, pending independent targeted High review. Acquisition remains unexecuted and unauthorized by this packet. Normal acceptance credit remains zero.

The original composite verdict is NOTPASS, report 9753B / `bcaa7d08f4217897fa99b3edbc9c77539bac5cca10c00ecf59d86264bbe043a5`. Its seven-file review packet and original code-byte custody remain immutable. The original 26 passing author methods did not detect F1/F2 and are historical, nonadditive evidence. Corrective allocation is 2163B / `0199f9a96ccb5b01979705d1e3fae94ac4619d7e4433fe41d4c1e35d18d43c95`.

## Suggested review order

1. Read original F1/F2, then the actual original-to-current diff identities in `input-binding.json`. Original code is recoverable from Root custody `c7fdffac0076361cbd6bbbbbaa74ec0f2f7ce3ec487c3490f3fce2201d4f76c6`. Changed helper nodes are progress/transport initialization, pipe read, bounded command, transport schema and its main-stage construction. Driver changes are `Lines` and affected final failure/custody facts. Tests target those paths.
2. F1: physical empty-read EOF is separate from thread completion, read failure, output cap and queue overflow. Final Root facts retain fixed reader state plus observed count/digest. Capture failure leaves custody UNKNOWN even when the helper exits or no stage was observed. A zero-stage branch now needs a positively interpreted pretransport refusal, rather than assuming no transport occurred. Queued-after-exit success still drains through the completion event. An unjoined reader is not synchronously closed through its active buffered read lock.
3. F2: read progress survives exception and cleanup. Primary, drain and concatenated observed bytes/digests are retained; partial observations never become false zero. Primary completeness and total stream-observation completeness are distinct. Only measurement integer limits include the cap+1 overflow and existing bounded-drain observation. Listing acceptance remains 262144B and archive acceptance 4500000B; rejected/partial bytes are never parsed. Request count, endpoints, API version, archive/report readers and interpretation rules are unchanged.
4. Run the current tests. Actual driver-main tests substitute memory-only Root storage and bounded Python stdout children, not the operational helper. Reproductions cover reader exception/overflow, cap+1 plus drain, seven-byte partial timeout, helper read error plus drain, and closed Root failure handoff. They assert no candidate/facts mutation/continuation, no raw error persistence and unknown custody when capture is unverified.

## Frozen current code

- Helper: 33788B / `8e25c6d5af1de1056abb6acbc9bbc781aa84227a9233ecf31032e4d21a1fb6f7`.
- Tests: 25975B / `b8d19bafd48ed14f51588b5ec5ecc2b1d91c3640e3dee14f8e74b9a6a5db7df0`.
- Actual Root-written driver: 12150B / `3296d05e6086af0bf104076bad5e31ac66c9015d62b949a754a257f279139b37`.

Root replaced the driver from the new exact payload after validating the old `0c493975...` identity/custody. The author never wrote that Root file. Input-binding retains the exact payload, original NOTPASS references, current raw producer checks, historical Git identities and non-authorizing Root template DATA. No old artifact/listing body or qualified evidence was rewritten.

## Actual checks and limits

Latest full suite: **32 methods, zero failures/errors, 35 positive/107 negative checks, nineteen bounded owned Python children**. Earlier corrective subset: 31 methods passed while actual driver-byte match was held for Root replacement; counts are separate and nonadditive. Two additional bounded actual helper startup processes checked template-only and invalid-flag refusal. Three current files passed syntax parsing. Eleven current producer raw bindings match. The historical single local CLI-help observation is reused; it was not repeated.

No actual recovery expected/terminal/result exists. No API request, operational collector/driver activation, CI, resource, SQL or native case ran. No raw API/archive/native body or error payload was persisted. Only allocated helper/test and new corrective author metadata were written by this author. Original review files, old P33, source and Spec remain untouched.

The recovery operation remains posthoc and separate from the producer UUID. It cannot retry consumed P33 or recover discarded output: old listing count is UNKNOWN(0 or1), old ZIP was not reached, old inner cause is UNKNOWN. All eleven failed normal packets and the 43 DB/14 browser cause gaps remain. No diagnostic result satisfies normal story/full-DB/browser/recovery/pilot acceptance. Future activation still requires targeted corrective PASS plus actual Root once-admission; final-three offline publication requires its separate grant.
