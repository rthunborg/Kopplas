# Independent latest-seven corrective regression review

Verdict: **NOTPASS**. Original F1 and F2 are **CLOSED** at `52007b760ff10f056ac75c5ed5b7dcdf49f99036`; one new P2 recognizer regression blocks latest-fix PASS. The original actual14 review at `cb8d696d19c53e63be05ecb1ae273449af60efaf` remains historically NOTPASS. Neither it nor the unadopted original F1 plan conclusion is rewritten.

Fresh distinct context-free generic gpt-6.1-sol High reviewer, independent of author and prior reviewer. Route recorded before dispatch: `review-native-cause-proof-corrective-latest7 / independent-sensitive-latest7-corrective-regression-reviewer`. Scope: exact committed seven paths, cb8 to52007b76, plus hash-bound unchanged context. Three broad rounds complete; this is targeted latest-fix regression/serious-finding closure, not a fourth broad review.

## F3 — [P2] Reject malformed plain event scalars before the sole POST

Location: `scripts/ci/checkpoint-dispatch.mjs:59-63`, new `assertDefaultDispatchWorkflow`. Production caller: `diagnosticAvailability`88-95, reached by `checkpoint("dispatch",...)`195 after authenticated write/maintain/admin permission.

The exact recognizer accepts:

```yaml
name: CI
on:
  workflow_dispatch:
    inputs: x: y
jobs:
  verify: {}
```

The mapping regex consumes `x: y` as a value. It matches no rejected leading indicator/bracket, nesting remains acceptable and `found` is true. This is invalid YAML: a plain scalar cannot contain colon followed by whitespace. [YAML1.2.2 §7.3.3](https://yaml.org/spec/1.2.2/#733-plain-style).

Actual bounded pure check: extracted the exact43 numbered packet source lines26-68, removed only the module export prefix, compiled that function and invoked it on the text above. Output: `malformed_plain_colon_value: ACCEPTED`. No copied parser/model, suite/native run, provider call or child process under review. This directly verifies the introduced admission guard, not generic YAML lint.

Invariant and downstream bypass: the allocated amendment explicitly requires malformed/ambiguous default event forms to refuse before POST. Blob hash proves bytes; active/id/path proves registration metadata. Neither validates this default blob's YAML. Full candidate checks validate a different blob. After default recognition94, no further default parser/validator precedes durable `dispatch-uncertain` intent197-210 and sole POST212. Given these accepted observations, the actual operator path records availability and sends its one-shot request despite malformed default event data. A GitHub rejection would occur after the required local refusal and leave the non-retry intent consumed/uncertain. This does not claim GitHub executes invalid YAML, current hosted default is malformed, or any normal acceptance/key-custody bypass. Hosted state/provider response remain UNKNOWN.

Bounded remedy: reject unsupported plain scalar syntax (including colon-whitespace) within the supported event subset, or use an equivalently bounded structural parser. Add an actual recognizer/dispatcher negative showing zero POST/no intent for this example. Preserve GET effects, candidate checks, durable intent, no retry/default update/fallback and normal gates. This reviewer changed no source or tests.

## F1 explicitly closed

Actual helper875-899 validates the exact distinct two tenant and ten returned Auth UUIDs before cleanup. It preserves canonical cleanup order and independently retains all reachable cleanup failures. The SAME existing final parameterized SELECT directly reads executing `current_user` from `pg_catalog.pg_roles` with `rolsuper OR rolbypassrls`, and directly observes `public.tenants`/$1 plus `auth.users`/$2. Exactly one row/three own named data properties, all strictly true, is required. False/missing/malformed/accessor/proxy failure or SQL rejection records fixed fixture-absence, cleanup false and CLEANUP_UNVERIFIED. Existing observation/readDiagnostic/diagnosticUnverified guards then retain key custody. Swallowed canonical Auth error plus a residual user can no longer qualify cleanup.

Same-statement current-role visibility blocks RLS-hidden false absence. BYPASSRLS does not grant missing SELECT; denied reads fail. [PostgreSQL17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [role attributes](https://www.postgresql.org/docs/17/view-pg-roles.html), [current_user permission identity](https://www.postgresql.org/docs/17/functions-info.html). This is physical absence of known returned IDs at that observation only: no historical delete-response, partial-setup, fresh SupAdmin/bootstrap or native proof. No additional query roundtrip/HTTP/connection/principal/grant.

## F2 explicitly closed

Actual production launchOwned384-431 defaults to Node spawn and processIdentity. Attempt is recorded BEFORE invocation. Real spawn event establishes started; pre-start error with undefined PID establishes positively not-created; exceptions/missing facts stay attempted-unverified. Started is absorbing. Persistent safe error listener survives late/repeated errors. Refresh after bounded wait and final cleanup preserves late positive evidence. Exit completion and group absence do not infer start.

finishCauseProof69-75 fails missing/refused reports for started OR uncertain launch despite zero exitCodes, emitting explicit attempt/state and true/null/false start consistently to receipt/manifest. Only not-attempted or positive not-created uses no-start. Captured identity/group stop, pending done/output drain, command/query/HTTP settlement, COMMIT uncertainty, key deletion/custody and normal DB/browser guards remain intact. Timeout/uncertain launch retains custody. Actual-source/adapter controls are meaningful simulated events, not native process proof.

## Amendment and preserved boundaries

Default fresh active registration/path/hash/event presence versus FULL reviewed candidate input/title/admission/argv/ref/SHA/mode/nonce capability is the admitted distinction. Fixed GET/sole POST/no default update/fallback/retry/no normal-gate waiver remain. F3 is incomplete malformed-event refusal in its implementation. Candidate-only capability remains a reviewed primary-source inference; hosted availability UNKNOWN. [GitHub dispatch event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch), [REST dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event).

Five current inputs and18 referenced artifacts matched bytes/SHA256; rechecked at output creation. Input-binding/Root strict admission bind exact7 committed/base blobs,15 unchanged context equalities, original14 review and source/index preservation. No Git/source/index sampling or mutation here: Root's supplied source identity, clean index and source/Spec preservation are reused with provenance, not independently resampled or global-clean claims. Nine single0x20 lines in each current diff/input remain untouched. CI-contract hunk is SHA pin only; app source unchanged; kernel5760/SRO87/in-review retained. Normal95/full database/browser/recovery/pilot, INT015 and protected109+37 remain required/preserved within this delta; no broad re-audit.

Author checks reused, not rerun: initial116=112P/4F, corrected116P; seven-file374P before late dispatcher alias hardening; final affected dispatcher30P, other344 unchanged bindings. COMPOSITE, not new combined374. Final whole TypeScript0; six-file lint before late change plus affected two-file lint after0/0; diff/kernel/SRO checks recorded passed. SQL rows/source seams/adapter events prove shape and controls, not native SQL/Auth/process/provider. No build/suite/collection/SQL/RPC/Auth/HTTP/browser/CI/resource/provider-repository action here. Actual reviewer actions: readonly metadata/hash/context inspection, public primary docs and one pure exact-function check. Changelog markdown fetch unsupported by web content type; no implementation depended on it. Initial metadata output write used a .NET relative path, failed before any write, and was corrected to absolute CreateNew output paths.

Native diagnostic UNEXECUTED; native/acceptance credit0. All43 DB causes/14 browser failures UNRESOLVED, eleven failed native histories retained. Private7 consumer UNBORN; later fresh High review/adoption, Root freeze/push, hosted availability and admission before sole POST remain gates. No development-complete/delivery/release/push/dispatch/merge/deployment claim or authority is supplied. Only this directory's three NEW original artifacts are written; all previous outputs preserved.
