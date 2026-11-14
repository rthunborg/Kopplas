---
title: "Story 35.8-P: Calculation Editor Mutation Safety"
status: in-progress
tracking_key: spec-calculation-editor-mutation-safety-35-8-p
baseline_revision: 3a2fe5a565e2627b45b9b46880e26966ef0cd23f
context:
  - _bmad-output/specs/spec-calculation-editor-mutation-safety/SPEC.md
  - _bmad-output/specs/spec-calculation-editor-mutation-safety/approved-producer-contract.md
  - _bmad-output/specs/spec-calculation-editor-mutation-safety/approved-source-matrix.json
  - _bmad-output/specs/spec-calculation-editor-mutation-safety/test-design.md
  - _bmad-output/specs/spec-calculation-editor-mutation-safety/approval-and-ownership.json
  - _bmad-output/specs/spec-calculation-editor-mutation-safety/retained-reservations.json
  - _bmad-output/specs/spec-calculation-editor-mutation-safety/source-binding.json
  - docs/process/review-order.md
---

# Story 35.8-P: Calculation Editor Mutation Safety

## Intent and status

Existing owner-approved prerequisite, ready for normal source review/publication and subsequent ordinary admission. Native admission and implementation have not started. As an entitled editor user, I need truthful recoverable operation outcomes and protection from stale decisions before the preserved 35.8 presentation journey can safely resume.

## Acceptance contract

The complete unchanged technical contract and all-caller/expected-fact matrix are incorporated from ../approved-producer-contract.md and ../approved-source-matrix.json. These seven verification bindings restate the approved contract; they add no presentation acceptance or domain policy:

1. **P-1 / CAP-1:** All thirteen action callers use mandatory retained identity/expected facts across the twelve existing kinds; direct-command fixtures migrate without optional unchecked inputs. Preserve the fail-closed legacy quote action.
2. **P-2 / CAP-2:** Authoritative typed SQL normalization and computed request binding, original expected content, parent/source authorization and consistent locks atomically reject stale fields, tax, archive descendants and changed complete sibling order/membership.
3. **P-3 / CAP-1:** One immutable scoped durable proof survives response loss, later edits/archive/removal and concurrent replay. Different payload/kind/actor/tenant cannot reuse identity; absent/prepared stays unconfirmed. Domain write/audit/proof commit together.
4. **P-4 / CAP-3:** Initial quote authorization/create/replay binds original reviewed digest/date, attachment selection, authorization/capture and existing correlationId option. Real post-lock expiry and committed terminal closure defeat waiting creators; reconciliation stays read-only. Committed replay grants no new authority.
5. **P-5:** New table security/manifest/inventory, checked RPCs and revoked old direct DML/EXECUTE close every admitted bypass while preserving current live membership/roles, seller projections, source/file locks, money/tax and ADR-B008 invariants.
6. **P-6:** Six allocated UI hosts retain per-form original intent across response loss/remount, explicit reconcile/retry and late results under ADR-B009. No draft is called saved by a different result, no automatic/offline replay or queue; preserve original 35.8 AC6 and seventeen state/test identities in ../test-design.md.
7. **P-7:** Exact matrix containment, focused race/replay tests, full required ordinary verification, independent High review and actual frontend classification/visual requirements pass on the candidate. Preserve the later factual operator-authorized matched app/schema pause/drain cutover; no deployment or runtime pass is claimed here.

## Tasks and dependencies

- Bind the actual qualified source-containing base, source/helper/preimages, sole author/checkpoint, current relevant writer holds, named migration slot and supported native capacity before implementation.
- Implement the one approved producer/caller/fixture/migration cutover in exactly the matrix; keep readonly contracts and historical grants intact except the accepted serialized shared slice.
- Run meaningful tests and current complete gates with actual counts/skips and candidate-bound browser captures. The coordinator adopts/validates prepared test design through normal E2; this companion alone is not a completed coordinator E2 receipt.
- Obtain distinct sensitive review, correct in scope, qualify the producer, then rebind/admit the separate frozen 35.8 presentation story. That downstream source is unchanged by this prerequisite.

The inspected base already contains the active calculations/quotes producers. This producer prerequisite does not require pending 35.7 presentation/CRM recovery/PR151 behavior. Conditional E15/producer ownership is explicitly resolved only through the accepted future positive projection and fresh activation checks; no schema-2 exemption is presumed. No optional checkpoint flags were added.

## Verification and author trail

Use ../test-design.md and the adopted review-order convention. The eventual implementation/fix author writes exactly one final Suggested Review Order with verified code/test locations after implementation exists. No final trail or execution evidence is fabricated here.

## Dev Agent Record

Preparation: gpt-6.1-sol High for transactional integrity, quote/money invariants and ownership preservation. Source ready-for-dev is not native admission. implementation_started=false; development_complete=false; release_ready=false.

## Auto Run Result

Status: blocked
Blocking condition: implementation verification failed

This folder+id build-auto run resolved story `35-8-p` and reached the rendered implementation step. The actual admitted worker baseline is `3a2fe5a565e2627b45b9b46880e26966ef0cd23f`; earlier preparation statements above remain historical. Partial implementation is preserved, with no development-complete, review-ready or release-ready claim.

The mandatory new-table enrollment reaches two files outside the approved 55-path allocation: `tests/integration/rls/role-harness.atdd.int.test.ts` has an exhaustive `Record<TenantTableName, string>` seed map, and the explicitly read-only `tests/support/authz/role-harness.ts` requires capability, direct-role denial and operation-id projection metadata. Both files remain untouched. Parent/Root directed a source hold while they qualify the exact ownership/allocation disposition; no cast, omission, skip or harness bypass was introduced.

The sole context-free implementation author was `/root/final_g_evidence_high/producer_safety_build/implementation_author`, `gpt-6.1-sol` High for authorization/RLS, money and transactional integrity. Its 43-path partial source checkpoint was retained without a child commit. The author and build delegate are stopped; all known own process handles are terminal. Parent owns the normal blocked checkpoint, native bookkeeping and any explicit resume.

Observed verification in the intermediate working tree:

- Frozen dependency installation succeeded after a recorded sandbox EPERM and authorized same-target escalation: 398 packages; no manifest/lock/config change.
- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/features/calculations/editor-operation.test.ts tests/unit/features/calculations/action-state.test.ts tests/unit/features/calculations/form-parsing.test.ts`: 75 passed, zero failed/skipped/TODO.
- The same Node runner over `calc-validation.test.ts`, `calc-validation-coverage.test.ts`, `calc-source-validation.test.ts` and `quote-validation.test.ts`: 82 passed, zero failed/skipped/TODO.
- Typecheck failed: eight author-owned local fixture typing errors, three material ATDD browser scaffold typing errors and the external exhaustive role-harness seed dependency. No typecheck pass.
- Full unit command `node --experimental-strip-types --import ./tests/support/register.mjs --test 'tests/unit/**/*.test.ts'` was intentionally interrupted by Root for the allocation-block checkpoint. Actual unit native exit 1, wrapper exit 0; partial TAP reached top-level test 1287 and two manifest-count failures. No final totals or full-suite pass; this is not a hang diagnosis. Exact owned process identities were revalidated and all ten known identities were absent at handoff.
- SQL application, DB/RLS/recovery integrity, lint/build/containment, browser/full hosted CI, frontend-controller/visual acceptance and independent product review remain unrun. Baseline CI and scaffolds earn no candidate coverage.

The installed renderer first failed before rendering because uv could not persist sandbox interpreter metadata. Its preserved native failure was followed by one explicitly authorized process-local private-temp recovery using the same supported renderer; it succeeded and printed the immutable worker-specific snapshot. No workflow source fallback occurred.

The installed migration generator first failed on the existing legacy profile selector. A separately reviewed explicit built-in `--profile supabase` correction succeeded in the same retained unlinked fixture and emitted actual `20261113144531_calculation_editor_mutation_safety.sql`. Its zero-byte template was exclusively mapped to the sole approved `20261112120000_calculation_editor_mutation_safety.sql`, with verified byte equality and a pre-SQL receipt. The generated six-byte `cli-latest` update cache was separately reviewed and retained; no project/profile/config/link, deletion, alternate migration or live DB operation was used. SQL is intermediate and unreviewed.

Private evidence root: `C:/DEV/Kopplas/tmp/private/35-6-35-7-coordinator-2026-11-09`.

- `product-35-8-author-held-working-tree-checkpoint-20261113.json`, SHA-256 `4487abfe131c8b8ba33801054872d347585999da52e217112f2d91e2dcbe62d6`: 43-path pre-HALT manifest and actual focused commands. This HALT changes only this story's status/result after that source checkpoint.
- `product-35-8-author-two-file-h4-dependency-proposal-20261113.md`, SHA-256 `0e46dfde85c164838f0498b601c6f2f2c49bc9860397e12abace5ffa16c3189d`: private proposal only; both actual external files remain unchanged.
- `product-35-8-author-unit99330-terminal-handoff-20261113.json`, SHA-256 `5dba49502518650b690655ef4493a646c4e035a6b81ccb1d2f01771ae4e53cf3`: real interrupted run, native outcomes and terminal process proof.
- `product-35-8-author-exclusive-mapping-before-sql-20261113.json`, SHA-256 `bde8140bb4e0c706fbccfb3cc5a6e55e286c7703f7d72f46dc8e3f0696b29795`: actual generator-template mapping before SQL.

Review rounds completed: 0. Patch findings: 0 (no product review performed). No deferred review finding was invented. Independent review remains required after authorized implementation and verification. No Suggested Review Order was manufactured for this incomplete blocked exit; the completion hook preserves this result.

Remaining owned work includes fixture typing and manifest counts, material integration/RLS/browser cases and grant/reset adapters, source capture/archive/command-clock semantics and expected UUID canonicalization, full required verification and independent review. These are unfinished development requirements, not passed or waived release deferrals. Resume only after Parent explicitly binds the fixed checkpoint and applicable allocation disposition.
## Generation-2 continuation

Continuation starts at `15d8210e79a044babb9255b5aebd73bec2c54ae6` under the verified Root release and generation-2 assignment on 2026-11-13. The historical blocked Auto Run Result above remains unchanged. The original implementation baseline remains `3a2fe5a565e2627b45b9b46880e26966ef0cd23f`; independent product review must inspect the full unreviewed story delta from admitted base `1c53833c70ad61a26cbfbc117a040b1f99d33f2e`, including ATDD tests and the original partial implementation. Development complete and release ready remain false pending actual required evidence and independent High review.

## Generation-3 continuation

Root's operative generation-3 release and running assignment were independently rehashed on 2026-11-14: operative handoff `150f30279c515a508cc42b26b669c7e1a9f31e6f687c0a28c5a9bd2697a94df2`, assignment `df88d45f51f9d7d548168ea192b950a1c695317df6a2c26e3e3bb521302fa916`, writer route `8696bfb4a30e8a75ce8e194cafa098d9a985af30ec6ba96d478c42de2013915c`. The sole fresh implementation writer is `/root/final_g_evidence_high/producer_safety_build/implementation_author_gen3`, Sol High. Earlier authors remain stopped. Root retains all Git, provider, native and aggregate mutations.

The approved addition is limited to the tax-reconciliation suite's INITIAL helper adapter and necessary imports/result mapping. Owner approval `00dc03d45f061cb7c14d1ae868cc7897ea76ef20be463e05106f3f9e3552f6ca` and packet `351e99651748b94eb5db0a9f8e93af6d2170eb6306157a79870e4df03d0c3cf9` permit the generation-3-only provisional completion order; they do not waive technical, DB/RLS/recovery, full browser, independent review or final visual/unchanged frontend-wrapper requirements. Historical blocked/incomplete results above remain unchanged. Implementation status remains in progress; development/visual acceptance and release readiness remain false.

## Suggested Review Order

Authors: `/root/final_g_evidence_high/producer_safety_build/implementation_author_gen2` (inherited implementation/fixes) and `/root/final_g_evidence_high/producer_safety_build/implementation_author_gen3` (tax adapter, current evidence and trail reconciliation), both Sol High.
Refreshed against the generation-3 working tree on HEAD `f6789bc0278d0968ba79526ce43a4b34d78ad874`. This is an implemented checkpoint with unresolved qualification, not development completion or frontend acceptance. Review the **full unreviewed story delta from admitted base `1c53833c70ad61a26cbfbc117a040b1f99d33f2e`**, including ATDD and prior partial implementation. Preserve the story baseline `3a2fe5a565e2627b45b9b46880e26966ef0cd23f` for its recorded frontend gate.

### Original form intent and truthful recovery

The six allocated hosts share feature-local plumbing in an existing allocated host; the approved contract requires opaque session handles and keeps original submitted text/money in memory. This continuation captures expected facts when editing starts, preserves later drafts against React action resets, checks a retained handle before another dispatch, and exposes a recovered create/quote destination without calling a neighboring or later draft saved. An absent/prepared remount without original input remains unconfirmed and cannot silently recapture/replay.

- `src/components/calculations/CalculationList.tsx:184` — `useEditorOperation`: six-host identity, duplicate and recovery boundary.
- `src/components/calculations/CalculationList.tsx:249` — `useLayoutEffect`: restores newer in-memory input after an older result.
- `src/features/calculations/actions.ts:98` — `correlationId: operationId`: preserves the retained identity through the existing envelope.
- `tests/e2e/calculations/calculation-mutation-safety.e2e.spec.ts:113` — `E35-8-T-late-result`: P-6 late result, duplicate suppression and persistence reread.

### Typed expected content and atomic effects

Per the approved expected-content design, SQL owns normalization, binding, root/descendant locks, current source resolution and complete sibling/subtree comparison; TypeScript remains an early domain-validation boundary. This continuation fixes Date canonicalization, normalizes UUID/tree and numeric serialization, and forwards the injected command clock for source/archive capture rather than substituting wall time. Existing constraints and private lifecycle helpers continue to enforce money, tax and audit rules; this adds no valuation engine.

- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:114` — `ce_input_internal`: closed typed input and normalized expected content.
- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:246` — `mutate_calculation_editor`: P-2 comparison and domain/proof transaction.
- `tests/integration/commands/calculation-mutation-safety.int.test.ts:113` — `rechecks original header`: observed two-connection root-lock interleaving.
- `tests/integration/commands/calculation-mutation-safety.int.test.ts:261` — `SQL resolves`: current source lock and persisted 500-row limit.

### Immutable operation proof and original quote authority

The approved feature-local proof table retains only identities, digest and terminal result; target or actor deletion cannot erase that history. Quote retries enter the checked create path before building a fresh snapshot. This continuation also locks an initially absent counter key before the real wall-clock expiry check, and supplies real lock-wait/terminal-closure cases rather than a command-clock proxy for expiry.

- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:222` — `ce_request_internal`: server binding and serialized original-result replay.
- `src/server/commands/quotes/quotes.ts:75` — `const resumed`: prepared/committed retries precede recapture.
- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:435` — `clock_timestamp()`: post-lock expiry before the existing private consumer.
- `tests/integration/commands/quote-initial-mutation-safety.int.test.ts:137` — `real authorization lock`: P-4 actual expiry and no-domain-write closure.

### Close bypasses and preserve current authority

Current tenant/member/role authority precedes lookup/replay. The approved cutover revokes old application writes and initial quote entry points together; the new forced-RLS proof table has no direct application read/write surface. The exact additional harness enrollment uses Calculations.Edit metadata, zero direct roles and operation_id projection, with one privileged closed-proof seed. The generation-3 owner-approved tax INITIAL adapter now uses the checked wrappers without altering its seven indirect caller bodies or their assertions. Its canonical source digest uses the owning fixture client so the hostile foreign client still reaches the actual SQL gate; original stale date, snapshot, line and readiness payloads pass through unchanged. Only a matching committed proof with available quote/version identities maps back to the original success shape.

- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:196` — `ce_gate_internal`: live authority and established tenant lock order.
- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:470` — `revoke insert,update,delete`: no admitted direct editor mutation bypass.
- `tests/integration/commands/tax-answer-reconciliation.int.test.ts:310` — `authorizeAndCreateInitial`: checked INITIAL adapter preserves hostile business assertions.
- `tests/integration/rls/calculation-editor-operation-contract.rls.test.ts:118` — `seller prepare/create/reconcile/replay`: P-5 safe projection and revoked prepared/committed authority.

### Evidence, limits and rollout boundary

P-1's thirteen callers have missing/extra/complete-shape unit assertions. P-2/P-3 bodies cover original facts, complete permutations/subtrees, every calculation effect (including tax), post-commit loss, same-intent serialization, no extra domain effect/audit, immutable history and audit rollback. P-4 bodies preserve authorization/capture/correlation and test real lock-crossing expiry/committed closure. P-5 checks direct grants, canonical binding, forged actors/tenants/parents, revocation, seller projection and immutable/unique proof. P-6 registers ten real-browser cases across all six hosts; the preserved downstream seventeen-state presentation contract remains separate.

- `tests/unit/features/calculations/editor-operation.test.ts:105` — `for(const [caller,validate,payload] of callers)`: P-1 closed original-fact shapes across all thirteen callers.
- `tests/integration/commands/calculation-mutation-safety.int.test.ts:224` — `for(const effect`: P-3 twelve forms across eleven calculation kinds.
- `tests/integration/commands/quote-initial-mutation-safety.int.test.ts:146` — `waiting creator`: P-4 rereads a committed terminal closure.
- `tests/e2e/calculations/calculation-mutation-safety.e2e.spec.ts:137` — `for(const host`: P-6 remaining four editor hosts; list/header cases precede it.

Current evidence: `gen3-verification.json` and its raw logs under `_bmad-output/implementation-artifacts/evidence/35-8-producer-safety/` record full TypeScript native 0, targeted tax lint native 0 (zero warnings/errors), and the actual INITIAL adapter-body synthetic check native 0 (12 passed, zero failed/skipped/TODO). The adapter check extracts the current TypeScript declarations, executes the real quote branch of the feature-local intent helper, and substitutes RPC/canonical source-read seams: it checks original operation/input/actor/tenant/capture/attachments/review forwarding, unchanged SQL errors, and rejects noncommitted/mismatched/unavailable/malformed proof as success. It does not execute SQL or the production command body. Source comparison proves all seven indirect caller bodies, business/financial/error/actor/tenant/no-side-effect assertions, successor/send/acceptance code, and obsolete-signature introspection remain unchanged.

Eligible prior evidence is reused explicitly from `gen2-verification.json` (raw SHA-256 `f36dd2e4fbc10b9c87675073eb0aa42b57e2aac0cf906317b9362a77532b5b9a`): all 52 recorded product/test source hashes revalidate unchanged, including SQL `8756798bf74c112182fcfdaeec6df14d45bb7c14a82663a229356b9ef862bbe5`. It records focused units 186 passed, zero failed/skipped/TODO; typecheck, production build, lockfile/service-role/built-bundle checks and full lint native 0 (40 warnings). These are provenance-bound reused checks, not reruns or final candidate hosted qualification. The prior 240000 ms full-unit diagnostic has no final totals/full pass and remains historical, with source changes overlapping that run. Ten browser tests were collected; zero browser tests executed. First failures/retries remain retained.

Limits: DB/RLS/recovery/storage, the seven indirect tax-helper runtime paths and real production-browser execution remain unrun by this author; source inspection, synthetic adapter checks and compiled test bodies are not executed DB coverage. Quote-expiry fixtures privilege-insert a copy of a real prepared authorization with a shortened wall-clock window while retaining the exact 15-minute issued/expiry constraint; they do not alter triggers. Post-commit transport-loss proxies/browser interception forward real calls before dropping only the response, but remain synthetic transport faults. No authenticated candidate-bound desktop/360×640 captures, human/controller acceptance or independent product review has occurred (rounds 0). The historical local frontend rejection remains recorded; it is not rerun on this uncommitted checkpoint or treated as acceptance. Root must publish the concrete candidate for the existing ordinary full CI plus `release_validation=true` full production browser/dashboard route. Separate TEA automation provenance, full-D independent High review, final frozen-G technical/runtime/visual duties and the unchanged frontend-FIRST wrapper on the same delivery JSON remain required. No passed-review delivery record is fabricated. The migration remains unapplied and requires the later factual owner-authorized matched app/schema pause/drain cutover; this checkpoint grants no deployment authority.
