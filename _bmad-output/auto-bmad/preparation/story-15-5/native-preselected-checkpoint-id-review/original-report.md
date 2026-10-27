# Independent latest-three checkpoint ID review

Verdict: **PASS**. No concrete reachable defect was found in the optional preselected checkpoint identity change or its consequential adjacent refusal/ownership paths. Findings: 0.

## Identity and scope

Reviewed source `f304ea548faa05f037cd3aa44c65888d96d543df` against `2524306ca9edd6079c23d205cf01268797288d89` on `codex/epic-15-scheduling-time-calendar`, in the assigned Epic 15 worktree. The actual native committed delta is exactly three paths, 100 insertions and 3 deletions: the dispatcher, its unit tests and the Story 15.5 implementation spec. This is a fresh independent Sol 6.1 High targeted review, separate from the implementation author and previous reviewers. It is not a fourth broad story review.

All five immutable inputs were read without trimming or rewriting. Their sizes and SHA256 values, all three raw/current/base source bindings, and both Root admission references are recorded in the attestation. Independently checked all 16 recursively declared reference occurrences / 11 unique paths, byte equality of latest.diff to the native Git diff, each changed file's current and base blob bytes, and all 70 actual current/af5 Git OID pairs (67 unchanged). Owned source worktree and index comparisons to source HEAD both returned 0. No global clean claim is made.

Applicable ancestor/worktree AGENTS instructions, model-routing policy, Code Review Rules and review-order convention were read. The current owner instruction prohibiting legacy browsing overrides the older worktree oracle language. No legacy URL was used.

## Changed-path conclusions

- `scripts/ci/checkpoint-dispatch.mjs:178–181`: supplied identity is read once, requires a primitive string matching the existing canonical lowercase UUIDv4 grammar, and refuses on status/cancel before filesystem state or any API. CLI admission at lines 268–275 permits it only for dispatch and rejects duplicate, missing and malformed values. The former generated-ID path remains available on omission.
- `scripts/ci/checkpoint-dispatch.mjs:207–225`: selected identity enters the same exclusive, written, fsynced and closed pre-POST state. The unchanged POST uses that persisted ID. No new payload field, callback, transport seam, workflow, schema, dependency or API is introduced. Existing record refusal occurs before API. Uncertain dispatch retains the same ID and cannot redispatch from the record.
- Necessary unchanged context at lines 143–171 and 230–258 still binds title to mode, ID and exact SHA, then checks repository, workflow, event, branch, SHA, both actor identities, first attempt and recorded run ID before cancellation. A different title is not adopted. The unchanged workflow uses the supplied checkpoint input for its title and concurrency group, with UUID/SHA/attempt/branch admission. No missing-guard finding is asserted over those enforced checks.
- The four added test cases cover six supplied/generated normal/diagnostic/release combinations, durable state at the injected POST boundary, invalid programmatic and CLI input, status/cancel refusal and uncertain-outcome retention. The test changes do not weaken the earlier 31 cases.
- The spec addition accurately labels the interface as correlation rather than GitHub idempotency. The one existing author-written Suggested Review Order was extended with three current, verified stops, not replaced by reviewer-authored rationale. The 5760-byte approved intent-contract including its tags remains identical to base, SHA256 `0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977`. Frontmatter remains in-review / iteration 3; the historical ready-for-dev ARR warning is retained.

## Independent controls and evidence limits

Executed 80 independent pure controls, all PASS, 0 failures/skips/cancellations: six identity/mode paths, 59 programmatic refusals, 12 CLI refusals, one CLI supplied/omitted selection control, one uncertainty/foreign-title/no-redispatch control and one read-once control. Invalid vectors included boxed strings, nonstrings, wrong UUID version/variant/case, whitespace, LF/CR/CRLF and Unicode line separators.

Method: loaded the committed dispatcher blob into a Node VM, removing import/export declarations and the CLI entrypoint only, and supplied memory-only filesystem/API fakes. Durable intent was observed as fsynced and closed before the fake POST. This independently exercises the control flow, but does not establish operating-system fsync durability, an actual provider response, CLI child-process behavior or native CI success. A direct import also exercised the exported parser for trailing line-terminator refusals, without calling checkpoint or its API. No persistent test file or real checkpoint record was created.

The author local-checks input separately reports 35/35 dispatcher tests on its first run, whole TypeScript success and affected two-file lint success. These are attributed author results, not rerun here and not summed with the 80 controls. No application build, full/broad suite, DB, browser, provider or private helper execution was performed by this review.

## Retained gates

This PASS closes only the exact committed prerequisite code review. It does not qualify a real run, authorize a POST or establish development completion, delivery, release readiness, merge or deployment. No native or acceptance credit is granted.

Supplied IDs are correlation only. Root must choose a fresh UUID and must never reuse one after uncertainty; there is intentionally no global replay/idempotency store. Before a future dispatch, retain Root freeze/checkpoint push and NEW exclusive private preparation bound to the actual newly pushed full SHA and fresh UUID, with rebound helper/test independent High review and the existing pre-POST admission gates. The P252 helper/test remain unchanged and unexecuted. Eleven failed native histories, 43 DB causes and 14 browser failures remain open; historical F1/F2/F3 closures are not reopened or re-credited by this narrow review.

## Write and action limits

Only this report, original-attestation.json and result.json are created. No source, spec, Git/index, state, bookkeeping, provider, network, DB, CI, resource or private preparation mutation was performed. No implementation fix or follow-on execution was attempted.
