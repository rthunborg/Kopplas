# Recovery acquisition implementation — independent review input

Status: author frozen, pending distinct High composite code review. No acquisition is authorized by this packet. Normal acceptance credit is zero.

This implements only the separately allocated recovery operation `6395eae9-7110-49a9-9c16-12a55c06c0bf` for existing completed diagnostic run `39551805476`, attempt 1, checkpoint `33cfa8dfa1323708edf80034c0a98b0620790b6a`. Producer checkpoint UUID remains `44738655-b7e9-4bb7-8b8c-77f7c2a32bcf`. The new admission is posthoc, before a future recovery GET. The old prePOST intent never claims to bind this new code.

The accepted allocation is 3727B / `b4bd1f15c6e87c4771d89c48e7137c15420e4a041cd767b24b00921b82d2b364`. Reviewed revision-1 plan manifest is `5c04c4457240909ec0c239f9af0c58d12332e3d7adbb2b76b113e9faf520cba0`. Its current API grammar explicitly includes required nullable `expires_at`; optional/nullable digest and workflow metadata are insufficient eligibility proof. Unknown shape refuses with fixed masks/counts only.

## Suggested review order

1. Read the allocation and frozen revision-1 plan, then the identities and non-authorizing template DATA in `input-binding.json`.
2. Inspect the actual Root-owned driver and the helper together: exclusive durable result reservation, fixed inputs, one listing, exact-five-field Root confirmation, flushed-and-closed one-line continuation, and at most one exact admitted ID ZIP. In particular check exited-child queued output, closed refusals, bounded draining and custody uncertainty. The driver never expects final packet files during collection.
3. Inspect the typed listing grammar separately from eligibility, exact raw listing/candidate/final-facts hashes, archive/member/report/privacy readers and closed stdout schema. Only compatible pure readers are imported from hash-pinned old code; old listing/network/collection entrypoints are never used.
4. Read and run the offline controls. Driver-main tests substitute memory-only Root storage and bounded Python stdout children. They never activate the operational helper, create actual Root facts/result or issue requests.

## Frozen code

- Helper: 31137B / `6e730bd7d56684ba5c5586ab77871c570ad85af3f9ea785743ff444b5bbf8b9c`.
- Tests: 19563B / `70713595f5f1cdc138a75809b6c55370d77393f016aac7b76ad4cdbec45ce61e`.
- Actual Root-written driver: 10483B / `0c49397576042a9881cbfa001d36b5d1c5dbe7c139fdddb34e1bc880076fb2c6`. Author supplied only the hash-bound base64 draft in input-binding; Root exclusively wrote and read it back.

Full paths, current raw producer bindings, historical Git bindings, historical-input hashes and exact driver payload are in input-binding. The eleven current producer raw inputs were rechecked. No new Git command ran; Git source/checkpoint identities retain their explicit historical provenance. No old qualified listing/body/evidence is rewritten or reused.

## Actual local checks and limits

Latest suite: 26 methods, zero failures/errors, 27 positive and 102 negative checks, twelve bounded owned Python children. Counts describe the latest suite only. Historical runs are retained separately and are nonadditive: the first 22-method run had one Windows CRLF fixture expectation failure; a later 26-method run had one oversized synthetic Windows argv fixture failure. Both fixture corrections passed on the next run; neither established an acquisition defect or native evidence.

One actual permitted local `gh api --help` process passed method/header/escape flag checks; only its byte count/hash, binary identity and booleans were retained. Two actual helper startup processes exercised `--template` and an invalid flag; template remained unauthorized and invalid activation exited 1. Three files passed syntax parsing. Root expected/terminal and outside result remained unborn. These checks created no raw payload files, caches, API requests, CI dispatches or native evidence.

The consumed old P33 remains immutable: listing count is UNKNOWN (zero or one), ZIP was not reached, discarded child output cannot establish the old RuntimeError's cause. Eleven failed normal packets remain unchanged. The 43 DB and 14 browser failures remain unresolved. Diagnostic observations, including ambiguous 42501, cannot establish backend cause or satisfy the normal 95 cases, full DB, browser, recovery or pilot gates. Custody statements cover tracked handles/output; they do not assert unproven descendant-group absence. Final-three offline publication requires a separate grant and must bind the closed Root operation result plus current final facts and code hashes.

Author scope: two new helper/test files and these three author review metadata files only. Root owns driver, expected/terminal and operation result. This author made no foreign writes in this implementation step. Prior proposal-path correction remains disclosed in the frozen proposal/allocation, rather than being erased.
