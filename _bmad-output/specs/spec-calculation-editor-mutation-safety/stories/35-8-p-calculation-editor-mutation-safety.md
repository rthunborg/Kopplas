---
title: "Story 35.8-P: Calculation Editor Mutation Safety"
status: in-review
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

The approved addition is limited to the tax-reconciliation suite's INITIAL helper adapter and necessary imports/result mapping. Owner approval `00dc03d45f061cb7c14d1ae868cc7897ea76ef20be463e05106f3f9e3552f6ca` and packet `351e99651748b94eb5db0a9f8e93af6d2170eb6306157a79870e4df03d0c3cf9` permit the generation-3-only provisional completion order; they do not waive technical, DB/RLS/recovery, full browser, independent review or final visual/unchanged frontend-wrapper requirements. Historical blocked/incomplete results above remain unchanged. At that earlier checkpoint implementation status remained in progress; development/visual acceptance and release readiness remained false.

The current working tree follows the workflow's `in-review` status; this is not development completion or readiness/acceptance. Configured independent qualification, runtime and visual duties remain pending. Root retains the checkpoint and publication boundary. Historical evidence is preserved; current execution is recorded separately below.

## Suggested Review Order

Authors: `/root/final_g_evidence_high/producer_safety_build/implementation_author_gen2` (inherited implementation) and `/root/final_g_evidence_high/producer_safety_build/implementation_author_gen3` (current implementation and reconciliation), both Sol High.
Refreshed against the current generation-3 working tree on HEAD `80787f68231016979c6cb8e72f85da15a878bbdf`. Evaluate the full story delta from admitted base `1c53833c70ad61a26cbfbc117a040b1f99d33f2e`, including inherited SQL, all thirteen callers, six hosts and ATDD. Preserve the original story baseline `3a2fe5a565e2627b45b9b46880e26966ef0cd23f` for its recorded frontend gate. This guide is not development, visual or release acceptance.

### Original form intent and explicit recovery

The six hosts dispatch their captured form explicitly inside a transition, preventing React action-form resets from clearing refused or later unsent controls; fresh calculation choices bind at submit while existing-entity facts bind at first edit. Tax operation state outlives canonical field resets, and a pending/newer draft prevents that reset; explicit remount reentry must match a stored whole-request fingerprint (including original expected facts) before the same UUID can be retried, with no submitted text/money/expected JSON stored in the session.

- `src/components/calculations/CalculationList.tsx:296` — `onSubmit:`: captures and explicitly dispatches without an automatic form reset.
- `src/components/calculations/TaxSettingsPanel.tsx:101` — `const taxOperation`: keeps the controller outside conditional clean-field remounts.
- `tests/e2e/calculations/calculation-mutation-safety.e2e.spec.ts:164` — `explicit original retry`: original replay and the next draft remain distinct.
- `tests/e2e/calculations/calculation-mutation-safety.e2e.spec.ts:189` — `matching reentered`: remount requires matching original business and expected content.

### Complete expected content and atomic effects

SQL owns typed normalization, request binding, root/descendant/source locks and complete sibling/subtree comparison; the TypeScript validator remains an early domain boundary. Rows retain their existing 500 limit, section reorder its existing 1000 limit, and calculation archive compares every source-allowed section rather than adding a lower cap to uncapped section creation; existing money/tax/lifecycle constraints remain authoritative.

- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:114` — `ce_input_internal`: normalizes the closed typed original input.
- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:246` — `mutate_calculation_editor`: commits domain effect and proof atomically.
- `tests/integration/commands/calculation-mutation-safety.int.test.ts:59` — `501-section reorder`: complete reorder and archive above 1000 sections.
- `tests/unit/features/calculations/editor-operation.test.ts:124` — `501-section reorder`: preserves separate population bounds and complete subtree shape.

### Immutable proof and original quote authority

The feature-local proof table retains identity/digest/terminal result, with no submitted text, money or raw expected facts and no target/actor deletion cascade. Initial quote retries enter the checked create path before recapture; transport-fault fixtures leave that absent probe intact, interrupt prepared creation only after authorization, and drop a post-commit response only after actual committed proof.

- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:222` — `ce_request_internal`: serializes original binding and immutable-result replay.
- `src/server/commands/quotes/quotes.ts:75` — `const resumed`: probes original intent before a fresh snapshot.
- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:435` — `clock_timestamp()`: checks expiry after all relevant lock waits.
- `tests/integration/commands/quote-initial-mutation-safety.int.test.ts:45` — `interruptedClient`: faults the actual prepared/committed stage.

### Current authority and closed bypasses

Current tenant/member/role authority precedes lookup/replay; old calculation writes and initial quote entries are revoked together, while the forced-RLS proof table has no direct application surface. The exact harness enrollment and checked Tax INITIAL adapter retain original business/security assertions, including hostile review payloads and foreign actors; a matching available committed proof alone maps to the old success shape.

- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:196` — `ce_gate_internal`: resolves current authority before operation lookup.
- `supabase/migrations/20261112120000_calculation_editor_mutation_safety.sql:470` — `revoke insert,update,delete`: closes direct editor mutation bypasses.
- `tests/integration/commands/tax-answer-reconciliation.int.test.ts:310` — `authorizeAndCreateInitial`: preserves original checked INITIAL review payloads.
- `tests/integration/rls/calculation-editor-operation-contract.rls.test.ts:118` — `seller prepare/create/reconcile/replay`: restricts seller proof and source projection.

### Evidence and remaining qualification

P-1 has closed/missing/complete original shapes for thirteen callers. P-2/P-3 integration bodies cover original facts, sibling/subtree membership, each calculation effect, loss/replay/rollback and immutable proof; P-4 covers original authority/capture/correlation and real lock-crossing expiry/closure, while P-5 retains grant, forged-context and live-authority assertions. P-6 browser bodies cover all six hosts, refusal retention, explicit retry/reentry and tax revalidation; the separate downstream seventeen-state presentation contract remains unchanged.

- `tests/unit/features/calculations/editor-operation.test.ts:105` — `for(const [caller,validate,payload] of callers)`: thirteen original-fact validator contracts.
- `tests/integration/commands/calculation-mutation-safety.int.test.ts:244` — `for(const effect`: every calculation effect retains replay/audit assertions.
- `tests/integration/commands/quote-initial-mutation-safety.int.test.ts:139` — `real authorization lock`: current wall-clock expiry and terminal closure.
- `tests/e2e/calculations/calculation-mutation-safety.e2e.spec.ts:219` — `tax pending A revalidation`: server refresh preserves controlled and uncontrolled later tax draft.

Current execution: `gen3-fix-verification.json` and associated raw evidence under `_bmad-output/implementation-artifacts/evidence/35-8-producer-safety/` record focused units 188 passed, zero failed/skipped/TODO; eleven current-controller/panel/fault-function synthetic checks passed with zero failed/skipped/TODO; full TypeScript, production build, full lint and lockfile/service-role/built-bundle checks native 0. Full lint retains 40 warnings. Browser collection registers seventeen tests; browser execution is zero. The initial local fixture-signature typecheck failure and its correction remain retained. Earlier `gen2-verification.json`/`gen3-verification.json` results remain historical; no unchanged full-unit diagnostic is relabelled a pass, and older source hashes/builds do not qualify changed source.

The synthetic checks extract and execute the actual current controller, Tax panel, operation helper and quote fault helper with simulated hook/state/DOM/RPC boundaries. They check submit-time parent binding, each refusal path, matching and changed-fact remount reentry, same-identity retry, reconciliation/new-draft sequencing and tax controller/key lifetime; they are not React/browser, command-envelope or SQL execution evidence. The matching reentry hash covers all business string fields and expected facts, canonicalizes expected JSON/cross-field ordering, excludes only React transport metadata, and preserves repeated-value order. Changed facts do not match and never acquire the old identity; absent/prepared remains unconfirmed without an exact reconstruction. Current server authorization and SQL request binding remain required for every retry.

Limits: full ordinary unit/DB/RLS/recovery/storage, Tax INITIAL runtime paths and production browser execution remain pending; source inspection and collection are not executed coverage. Expiry fixtures copy a real prepared authorization into a shorter wall-clock window while retaining its exact 15-minute issued/expiry constraint; transport faults remain synthetic. Configured independent qualification, separate selected TEA automation provenance, candidate-bound six-host desktop/360×640 captures and authenticated human/controller acceptance remain pending. Root must finish permitted tracked metadata before final frozen G, earn exact-candidate full technical/runtime/visual qualification through the existing CI plus `release_validation=true` full browser/dashboard route, then run the unchanged frontend-FIRST wrapper on the same delivery JSON. No passed-review delivery record, readiness or deployment authority is claimed. The migration remains unapplied pending the later factual owner-authorized matched app/schema pause/drain cutover.
