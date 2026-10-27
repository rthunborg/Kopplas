# Independent latest-three F3 correction review

Verdict: PASS for the F3 correction and consequential regressions in the latest changed parser lines. F3 is CLOSED. No consequential reachable findings remain within this targeted scope.

Reviewed source: `af5af69fd5018795a963a28c1ad367147b4a9bc3` against `52007b760ff10f056ac75c5ed5b7dcdf49f99036` on the parent-bound `codex/epic-15-scheduling-time-calendar` worktree. This is a fresh, distinct, context-free generic `gpt-6.1-sol` High review, independent of the author and previous reviewer. Root recorded route `review-native-cause-proof-parser-f3-latest3` / `independent-sensitive-latest3-default-parser-regression-reviewer` before dispatch.

## Scope and review cap

Three broad rounds are complete. This review verifies the actual F3 fix and consequential adjacent regressions only; it is not a fourth broad review and does not reopen unchanged SQL, wrapper, story implementation, or F1/F2 design. The project follow-up rule in AGENTS.md governs this targeted follow-up. The review-round-guard skill was read; no bmad-code-review invocation or broad round was started.

The exact three-path delta is dispatcher `scripts/ci/checkpoint-dispatch.mjs`, existing unit file `tests/unit/scripts/ci/checkpoint-dispatch.test.ts`, and author trail `_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md`. The latter was assessed only through its changed author trail and bound preservation facts. No new allocation, parser dependency, or general YAML contract is introduced.

## F3 closure and changed-line assessment

F3 was the P2 local pre-POST refusal defect: a default event descendant `inputs: x: y` passed the previous bounded recognizer, despite its invalid plain-scalar syntax. A repository writer using diagnostic checkpoint dispatch could therefore consume the durable one-shot intent and reach its sole POST. Active workflow registration and validation of a different candidate blob did not validate that default scalar. This was not evidence of hosted execution, acceptance, or a cleanup-key bypass.

At dispatcher lines 59-65 the actual correction removes separated YAML comments from an unquoted value before validating it. It refuses colon followed by whitespace or end, and refuses adjacent unsupported leading mapping/sequence/reserved indicators. Thus `x: y`, `x:`, and `x: y # comment` retain their invalid content and fail. A comment containing a colon does not become scalar data; `# comment: text` becomes an empty value and retains the correct nesting behavior. Supported `https://example.invalid` and `description:value` remain accepted. This matches the relevant plain-scalar and comment boundaries in the primary [YAML 1.2.2 plain-style specification](https://yaml.org/spec/1.2.2/#733-plain-style) and [comment rules](https://yaml.org/spec/1.2.2/#66-comments). The adjacent reserved-indicator refusal is consistent with [the indicator rules](https://yaml.org/spec/1.2.2/#53-indicator-characters). The implementation deliberately refuses additional unsupported forms; this review does not represent it as a complete YAML or GitHub workflow-schema validator.

The retained quote/block/alias/flow checks still apply after comment removal. Inline comments cannot hide an invalid prefix: colon-separation remains visible before the comment, while malformed bracketed values remain malformed after removal. The root event check still rejects scalar `workflow_dispatch` declarations. Duplicate keys, indentation, nested dispatch names, and mapping/sequence separation are unchanged. Supported empty declarations and correctly separated comments preserve their intended structure. No newly reachable acceptance or refusal regression was identified in the changed lines.

The actual caller at lines 92-99 validates the candidate, compares the full candidate to the reviewed checkout, reads the repository default branch and default blob, then invokes this recognizer. At checkpoint line 199 that availability step precedes state construction, exclusive durable state creation at lines 213-214, and sole POST at lines 216-218. A malformed default now throws before both the durable intent and POST. No new provider endpoint, retry, capability, or mutation is added.

The actual unit addition at lines 309-322 imports the reviewed recognizer and checkpoint caller. Its default-provider fixture computes an actual content blob identity, supplies the real reviewed candidate separately, and substitutes only the default content. The negative assertions require the unavailable error, absent state file, zero POSTs, and final GET at the default content endpoint. Ten malformed scalar/indicator cases exercise the local boundary; positives cover the actual full reviewed candidate, colon-without-separation content and supported comments. This is meaningful recognizer/caller coverage, not a mock result label. Existing ordinary/default/candidate controls remain. Repo/ref/SHA/default-active presence, nonce/title/mode/status/artifact/admission and sole-POST logic are unchanged by this delta; broader review of those unchanged controls is reused rather than claimed anew.

## Provenance and evidence limits

I independently matched all five frozen packet raw byte lengths and SHA-256 values, all eight referenced artifact hashes, and the four packet-input bindings. I matched raw source bytes for all three paths and independently normalized CRLF to LF to match their committed-byte packet bindings. Root's bound admission establishes actual commit/base/diff/ancestry/index facts; I did not run Git or resample the root's dirty metadata. Global cleanliness is not claimed. The untrimmed 9,507-byte diff and 41,806-byte review input retain their two single-space context lines each; these are not findings.

Frozen packet identities:

- `review-input.md`: 41,806 bytes; SHA-256 `d525e848f1ebd95676f656a1bc8ff420fa9c3214923fdef8455fcc3c36a62bb7`.
- `latest.diff`: 9,507 bytes; SHA-256 `84373f05c0f7353b8551d8ab47abd2f3d24ef255d05a5b71e5b9148c3c5cdd65`.
- `local-checks.json`: 1,627 bytes; SHA-256 `88294c800290a0b4e76a1e1f779765161d5874d0688841d70041f13a216c9b70`.
- `route-context.json`: 1,663 bytes; SHA-256 `70092f883bebd80fe3ff8e8274771ae9b0c9102855858e3ecf2946e9ddf33816`.
- `input-binding.json`: 23,288 bytes; SHA-256 `7bff37b024750b79abe337303857ce93a9126523cac5bec4dadaa7e10259f0ae`.

The bound author evidence records 31 affected dispatcher tests passed, zero failures/skips/cancellations, first execution with no initial failure; whole TypeScript exit 0; affected two-file ESLint zero errors/warnings; working/staged native diff checks 0. I inspected their source relevance and provenance; I did not rerun tests, typecheck, lint, build or any native/hosted operation. The earlier 374-before-late plus 30-after-late/344-unchanged remains historical composite evidence, not a new current aggregate or a new 374 run. No new full suite/build/collection is credited.

## Preserved historical verdict and remaining gates

The original 520 latest-seven report remains NOT PASS with F1/F2 CLOSED and its original F3 finding intact. Its report hash remains `5b480c25b39069f3fff270ce90977e272dee7a3b0f9d7b12c8bb3926f4ecdcbf`; attestation hash remains `1a537514b5a9b2750cd95f0c12d4ac1f68266311d95c63dc004a43c739dd998f`. This new scoped PASS records later F3 closure; it never rewrites the old verdict. The four unchanged F1/F2 path closures are reused by parent-verified source/base OID equality and hash-bound prior evidence. They were not reviewed anew. The earlier unqualified F1 plan PASS remains corrected/not adopted; its later valid addendum and all old bytes remain preserved. The resulting review composite is reused F1/F2 closure plus this latest-three F3 closure, not a new whole-seven review.

The approved 5,760-byte kernel, one author Suggested Review Order with 89 verified stops, in-review status and ARR warnings remain preserved by the binding. The two changed SRO anchors at dispatcher line 64 and test line 309 match actual source. All 95 normal cases, full DB/browser/recovery/pilot work, INT015 and protected 109+37 requirements remain unchanged. All 43 DB causes and 14 browser failures remain unresolved, all 11 failed native histories remain failed, and DIAG001 remains unexecuted with zero diagnostic/native/acceptance credit.

The private seven-helper consumer remains UNBORN. Later reviewer adoption, Root freeze/checkpoint push, and actual hosted availability/admission checks remain required before any authorized sole POST. Hosted availability is UNKNOWN. This source-review PASS authorizes no native query/RPC, provider operation, CI dispatch, resource launch, commit/push, merge, deployment, acceptance, development-complete or release-ready claim.

Only this new report, its original attestation, and the canonical six-field result were written. All reviewed inputs, source, prior reports and attestations were preserved.
