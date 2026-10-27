# Story 15.1 passive network metadata contract validation

## Outcome

**PASS for additive source authoring under this contract.** No concrete reachable contract gap requires revision. This validates the proposed diagnostic contract, not an implementation, native acceptance, cause, cleanup completion, P5, story completion or a broad review round.

Independent context-free Sol 6.1 High route supplied by root: `native_passive_metadata_validation / independent-native-evidence-contract-validator / diverse_review / gpt-6.1-sol / high / codex / subagents / subagent`. AGENTS, model routing and relevant local setup/context were read. Root retains commits, state, execution and next dispatch. Sole owned write is this document; source, helpers, evidence, Git, CI and resources were read-only. No workload was launched.

## Files changed

Only this validation document. Raw input hashes independently reproduced before and after inspection:

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| [Candidate contract](story-15-1-passive-network-metadata-addendum-2026-10-14.md) | 9,142 | `dec94a0dce6123590925a72cb45fbc2a7f55b2a5039968e23994438b483044f6` |
| [Diagnosis](story-15-1-dashboard-prefetch-diagnosis-2026-10-14.md) | 9,033 | `8bd328a2e4d7d74b60f695849defbbe4ed1fb6f1677bad5f4f8e6b845b4ddf2d` |
| `tests/e2e/scheduling-views.atdd.e2e.spec.ts` | 40,324 | `8563d81330b0f2cd79b9e86ec5888c1c96866bfdaff48b8af484acf3b4852e66` |
| Read-only `tests/e2e/support/scheduling-views-atdd.ts` | 18,231 | `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082` |

Root-reported HEAD `b99e3f425fb8ece254c7a4fe5cd25fcf0a52902d`, documentation after source baseline `e448f856b1f1ea337b2c91ed6cfc624995272521`; no Git operation performed.

## Status

The local retained CI report independently confirms AC2 ID `e17ed7bc58d5aa76eeac-0fd1705b2ad3737ad645`, retry 0 and 1 each failed with native `net::ERR_ABORTED` and one original snapshot. Report: 1,922,993 bytes, SHA256 `8dc19bfa01f91d91866552aa2dbc6e3d633270386e73ad862548a8bce507d386`. No report bodies or personal data were emitted. The diagnosis's before-tampered-navigation conclusion agrees with the source barrier: `hasFailure` throws before `action()` at lines 308-320. The raw trace timing/framework investigation remains the diagnosis's evidence; this validation does not re-audit all archives.

Public `newCDPSession(page)`, named `on/off`, `send` and `detach` exist in the installed 1.61.1 types. The [public session API](https://playwright.dev/docs/api/class-cdpsession) supports this usage. The [pinned protocol](https://github.com/microsoft/playwright/blob/v1.61.1/packages/playwright-core/src/server/chromium/protocol.d.ts) provides the five Network events and optional canceled/data fields; `Network.enable({})` does not request durable messages, custom buffers, streaming, interception or cache bypass. The [pinned browser manifest](https://github.com/microsoft/playwright/blob/v1.61.1/packages/playwright-core/browsers.json) agrees with local revision 1228 / Chromium 149.0.7827.55. Runtime versions still require eventual evidence.

Exact CDP request-ID joins are feasible only within this page session. GET/origin/exact pathname filtering, bounded redirect hops, missing-start and conflicting-terminal ambiguity prevent an unrelated event from becoming exact public Request identity. Full URL/method/status/lifecycle matching stays heuristic even with one candidate. Receipt sequences and main-frame commits cannot identify the cancellation caller. Four lifetime slots, no eviction and explicit overflow limit usefulness honestly; they do not justify dropping original captures.

Privacy is enforceable: project only guarded primitives and whitelisted enums; keep bounded IDs/URL keys/Request references ephemeral; never retain whole events, headers, optional data, stacks or bodies. Header values supply only the specified booleans. Unknown error text becomes a fixed class. Separate received/compressed/finished totals, missing canceled=null, finite times and overflow-invalidated totals avoid inventing evidence. A deliberately large four-row envelope measured 2,825 UTF-8 bytes in a bounded serialization check, below 4,096; the actual source test must still cover every schema field and boundary. The new separate cap supersedes the diagnosis's provisional metadata cap only; it never increases the original snapshot cap.

Cleanup is feasible without awaiting unresolved setup or detach: register attempt cleanup before acquisition, close diagnostic admission synchronously, attempt every named removal, handle rejection immediately, detach once, and clear ephemeral keys/references. Late acquisition may detach its newly acquired session, but must not enable it or install listeners. Other late callbacks must remain inert. `cleanup=requested` is not verified shutdown; rejected/pending detach cannot confer cleanup credit, and fixture target closure remains authoritative. Diagnostic errors cannot enter `recordFailure`, throw through existing cleanup or replace the original native error. The existing shutdown's own error behavior must remain unchanged.

Source-extracted proof requirements cover reachable behavior if exercised through the actual marked factory **and its AC2/afterEach/page-close wiring**, rather than a copied projector. Drive fake event emitters and deferred acquisition/enable/detach settlements; inject failure before/after setup, reentrant close, timeout cleanup, throwing removals and late rejections. Verify every removal is attempted, ownership is per attempt, late activity cannot emit/mutate/admit work, failure is preserved by identity (including falsy values), and success is silent. Feed secret-bearing admitted/unrelated/redirect/overflow events through those entry points and inspect all emitted output and retained diagnostic keys. These are finite contract proofs, not native browser evidence.

Preservation is decisive: inverse-remove only marked additions/import tokens and reproduce the entire 40,324-byte baseline hash. That protects all 18 expanded titles, 11 visual names, assertion arguments, every selected HTML/RSC native `finished()`/`text()` call, exact Request observers, barriers and failure semantics. Original snapshot lines 183-217 alone are 2,934 UTF-8 bytes with SHA256 `33217a46f8a645a3fef5bba2d3dabac2a57575344af35da695c0056eccb28cc4`; their 20 output keys/order/prefix/1,024-byte guard remain byte-for-byte unchanged. Whole-source recovery protects every assertion regardless of inventory counting convention.

## Open questions

Actual cancellation cause remains unknown. Ordinary Next task cancellation is not evidence of transport cancellation; tree-prefetch skips app components, and a later loading-boundary prefetch can be normal. The newer-browser issue candidate is not proof for Chromium 149. CDP terminal events/byte counts cannot prove renderer EOF, native body availability or acceptance. Missing/ambiguous/overflow evidence remains inconclusive.

## Deferred work

Only the E2E spec plus its new private source-extracted proof test are eligible next. Implementation preservation/proof checks and any one native run belong to later root dispatch. If no application cancellation mechanism is established, stop this lane and separately prepare an exact-version no-store/stream reproduction. Visual preparation is separate. No prefetch disablement, login rewrite, Chromium upgrade, cache change, unchanged CI loop, 15.2 or deployment is justified here.

## Blockers

None for contract-limited authoring. Native acceptance and cause resolution remain outstanding and this PASS does not clear them.
