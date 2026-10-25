# Story 15.1 native response observability — independent preservation validation

Outcome: **PASS**, with the binding public failure-carrier resolution below.

This is independent pre-implementation preservation/design validation on explicit gpt-6.1-sol High. The actual sensitive scope is AC2 raw payload withholding, native error authority and diagnostic privacy. It is not a broad implementation code review, a runtime receipt, an author-written review trail, or a release/completion decision. Broad review rounds remain **0/3**.

## Inputs and preservation identity

Owned checkout: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`. The coordinator supplied HEAD `bf84cf5d6487480c1fdcfc18dcbd6f49a6a704b0`; this validator performed no Git operation to independently verify HEAD.

The following raw SHA256 values and byte lengths were independently read from disk:

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| Approved corrected spec | 84,649 | `d5a492a1546c19d777d8bff3d7037686e60a577565cac67281bff764f427bc22` |
| Preparation-only observability addendum | 12,387 | `5be621b5afb0ab749b4024c78fc62b42e6df3a4f5d485ad7dec47a00d890981a` |
| Frozen scheduling browser spec | 26,554 | `0e1861d1f148dca2b90c099197149e0d8d9152d101429aa4915c3f17ab090ba8` |

Canonical kernel hashing explicitly decodes the spec's raw bytes as UTF-8, takes the exact tag-inclusive `<intent-contract>…</intent-contract>` block, normalizes internal CRLF to LF, excludes any LF after the closing tag, and re-encodes as UTF-8. Independently verified raw byte range `[948,6504)` yields 5,556 canonical bytes and SHA256 `035ee9683e8b3e6e0420204a3ddfa8d81b0dcb6a47aa12e638673859d60cc234`, matching the original records in `discovery-check.json:24` and `corrected-spec-decision.md:42` under `_bmad-output/auto-bmad/preparation/story-15-1/`. As an encoding qualification, decoding these UTF-8 block bytes as Windows-1252 before UTF-8 re-encoding instead yields 5,561 bytes and SHA256 `d5c44619d86670a84a7b9578c2adb942f8d26025ac8864745a7af5787fd66501`; this reproduction does not identify or attribute any reviewer's command. No input was edited. The kernel retains its approved format; the modern five-field SPEC workflow was not used to convert or re-derive it.

Rules applied: checkout `AGENTS.md`; `docs/process/agent-model-routing.md`; `docs/process/review-order.md`; `docs/decisions/epic-14-story-ownership-contract-d-2026-10-07.md`; the installed bmad-spec preservation/coherence rules and project override. Spec Law preservation is a claim-by-claim assessment here; no memlog/spec workflow write is authorized. The one new report is the only validator write.

## Claim-by-claim result

| Criterion | Result and reason |
| --- | --- |
| Approved kernel and eight ACs | PASS. The proposal changes only how a native captured-request failure becomes observable. It adds no disclosure/permission seam or authority and grants no body-coverage exception. AC2 still requires authentic raw bodies, own IDs, absence of peer email and lifecycle leaf, direct input tampering and denied-role behavior. AC1/3–8 are retained. |
| Contract D and task expectations | PASS. Four actual Schema/Resurser click/drag persistence gates, keyboard/dialog/move/resize/cancellation, reviewed conflict identity and atomic save remain required. No task is checked off; blocked status, round 0, follow-up false and empty deferrals remain. |
| Scope and ownership | PASS. Only the existing AC2 observer in the frozen browser file is eligible for later authoring. All 18 scheduling cases and 11 PNG targets remain. No reader/RPC/SDK/private runtime/fixture/configuration/dependency change, response exclusion, retry change or timeout/budget extension is admitted. |
| Exact request identity | PASS. Public `response.request()` must be registered synchronously before the first await for every already-matched Response. The owned public failure listener precedes navigation and acts only on that exact registered Request object. A same-URL different object is unrelated. Do not discard an admitted registry entry before the observer window closes merely because a body completed. |
| Native body contract | PASS. Keep the original origin/path/OK matcher, `await response.finished()`, truthy returned-error throw, `await response.text()`, raw payload accumulation and assertions. An event failure does not settle/fulfil a capture, append data, repair a body or prove any payload assertion. |
| First-error authority | PASS under the binding carrier rule below. `hasFailure`, not error truthiness, remains the authority. Original observed native completion/body exceptions and navigation/UI/assertion/cleanup values retain object/value identity, including undefined/null/false/0/empty string. Later events or cleanup cannot replace them. |
| Late failure and cleanup | PASS. Detach only the owned response listener, drain its final buffer with the owned failure listener still installed, and remove that listener in a finally path. A matched failure during final drain wakes the fulfilled failure signal and throws the first error without awaiting unresolved captures. Rejection handlers remain attached. Diagnostics close with the owned observer window; they never extend it. |
| Snapshot privacy and bounds | PASS. One attempt flag must be set before any collection/output, and functional failure must already be recorded. Exactly the addendum's fixed schema/whitelists, finite safe relative timings and actual settlement counts may be emitted synchronously. Check the serialized JSON's UTF-8 byte length at <=1,024; drop an invalid/oversize record rather than truncate or retry. Prefix bytes are additional to the JSON bound. No raw error/reason, request/response object, body, origin, query values, headers/cookies/tokens, fixture ID, protocol ID or serialized history enters this snapshot. All diagnostic getters/timing updates/serialization/output are nonthrowing. |
| Evidence limits and gates | PASS as a proposal. The trace/HAR claims remain coordinator-supplied evidence, not a trace inspection by this validator. Neither a successful earlier body nor an unjoined HAR abort proves the cause of the hanging capture. This observer may turn a timeout into a clearer failure; it is not a passing-body fix. Real later native CI and every existing acceptance gate remain mandatory. |

No normative gap was found. If later evidence requires a response exclusion, changed read/body authority, altered SDK/wire behavior or another acceptance exception, the author must return a precise gap for specification review; this PASS grants no such exception.

## Binding public failure-carrier resolution

The installed package identifies itself as Playwright core **1.61.1**. Its public type declaration `types/types.d.ts:20228` exposes `Request.failure(): null | { errorText: string }`; it does not expose a native Error instance. The same declarations expose `Response.finished(): Promise<null | Error>` at line 20516. Installed bundled client source is supporting inspection only, never an implementation API: `lib/coreBundle.js:58115` returns the failure string projection, `:60689` publishes requestfailed after recording its reason, `:60696` resolves completion on requestfinished, and `:58491` awaits the completion promise through the target-close scope. This confirms the proposed public observer is compatible with the pinned API without establishing the actual CI request/abort cause.

Resolve the addendum's open question as follows:

1. After exact identity matching, obtain the reason synchronously with the public `request.failure()` inside a bounded try/catch. Accept it only when `typeof failure?.errorText === "string"`. Pass that exact string, including an empty string, directly to existing `recordFailure`. Do not wrap it in Error, stringify/coerce it, prepend a message, turn it into a different net error, attach the Request, or claim it was a native body exception.
2. If that public metadata is null, malformed, inaccessible or throws, pass a fixed safe Error carrier to `recordFailure`: name `SchedulingNativeRequestFailure`, message `Captured scheduling request failed; native reason unavailable.`. Give it no cause, raw getter error, Request/Response reference or arbitrary extra properties. This is an explicitly identified unavailable-reason event failure, not an invented native reason or successful capture. Preconstructing this fixed carrier in the attempt is acceptable.
3. Reason lookup contains no await. Record failure before diagnostic collection/output; guarded metadata absence cannot escape, skip the event or change failure into success. Already-recorded first failures remain untouched. A later native rejection is retained by its existing settled capture result but cannot replace an earlier observed event failure; conversely, an earlier original body error remains the first error.
4. The exact native string belongs only to the ordinary failing-test path, as the addendum allows. Neither it nor the fallback Error enters the new diagnostic. Existing classifiers are not edited: native reason text remains native reason text; unavailable metadata must be reported as unavailable and must not be labeled `ERR_ABORTED`, `No resource` or an established causal diagnosis.

This uses the actual native reason when available while avoiding invented/coerced native exceptions. It also addresses falsy reasons and makes unavailable metadata fail loud. A fixed typed unavailable carrier is safer than dumping the metadata getter exception or arbitrary objects. Using only a generic typed carrier for every failure would discard available native reason evidence; using a truthiness fallback would replace the native empty-string value. Neither is selected.

This report settles an implementation design choice explicitly delegated to the validator. The author must consume this report alongside the exact hashed addendum and retain this resolution in the handoff; the addendum's earlier open wording is superseded only on this carrier choice. No original approved spec change or owner decision is needed. Coordinator authoring release is still required before source edits.

## Required verification after authoring release

Before any runtime invocation, independent High exact implementation review must verify the final diff and source hashes, preserving all original matcher/native reads/raw assertions, first-error semantics, cases, PNG targets, retries and timeouts. Focused lint and no-emit typecheck must pass.

The separately scoped private no-network proof must exercise the actual extracted observer logic without canonical fixture/environment imports. Required assertions are:

- Unrelated and same-URL/different-object failures do nothing; exact admitted failure interrupts an unresolved completion and an unresolved final success drain.
- A failure cannot disappear because metadata is null, malformed or throwing; exact native string and empty-string identity are retained. Fallback has the fixed safe name/message and no raw cause/data.
- Earlier completion/body/UI and every falsy first value remain unchanged, including when later failure/cleanup occurs. Both event-before-body and body-before-event orderings are checked; repeated notifications do not overwrite.
- Full successful drains retain every raw payload and reach every unchanged nonempty/withholding assertion. No unresolved capture becomes fulfilled, no empty substitute is inserted, and all rejection handlers remain attached.
- Only owned listeners are removed; the failure listener remains live during final drain. Late rejection handling after observer closure is attached and emits no diagnostic.
- Snapshot schema/key/value whitelists, one attempted emission, UTF-8 byte limit, unavailable/throwing getters, output/serialization failure, real settlement counters, and nonthrowing success timing updates hold. A requestfailed pending capture is still counted pending; rejected completion/body capture settlement is counted before its snapshot.

Private proof is observer-harness evidence, not JWT/RLS/body/CI acceptance. The later coordinator-selected native CI receipt must bind the exact source/head and authentic artifacts and enumerate all 18 scheduling cases/attempts, failed body reads, assertion-stage reachability, skips and serial not-run cases. Passing an observer proof or clearer failure cannot close Story 15.1. General/mail/editor/dashboard/physical-recovery, visual, review and other retained gates remain mandatory under their existing contracts.

## Operational result

Executed runtime/tests: **0**. No guard, browser, service, SDK, CI or external action occurred. No Git/spec/addendum/source/state edits occurred. Earlier CI counts remain reported evidence: scheduling 7 passed/1 failed/10 not run; general 368 passed/1 failed/13 skipped; editor 19 and mail 2 passed. They are not new executed coverage.

Files changed: this new validation report only.

Open questions: none for this implementation design. Actual missing-body and pending-completion causes remain unknown and cannot be inferred from unjoined HAR data.

Deferred work: authorized author implementation, separately admitted private proof, focused static checks, independent High exact implementation review, later real CI and remaining release gates. These are pending work, not scope deferrals.

Blockers: no preservation/design blocker for this bounded proposal. Story 15.1 remains blocked by implementation verification failure; no completion, runtime launch or 15.2 release is granted.

