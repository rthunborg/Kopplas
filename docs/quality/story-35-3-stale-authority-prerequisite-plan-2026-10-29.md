# 35.3 minimum customer stale-authority prerequisite plan

Date: 2026-10-29. Status: **frozen proposal for one expanded-scope authorization; implementation not authorized by this document**. Author route: `gpt-6.1-sol` / High / transactional-integrity, recorded before dispatch in `docs/quality/story-35-3-prerequisite-plan-route-2026-10-29.json`. Source-only planning; no runtime or acceptance evidence.

## Decision to authorize

Authorize the narrow `customer.update` prerequisite and exact proposed additional paths below, followed by the already approved 35.3 presentation work once its planning is refreshed. Preserve the human decision “35.3 is approved.” This request concerns the excluded backend/SQL/test allocation only; it neither asks for generic story reapproval nor changes the canonical common contract. Coordinator must record the allocation and sole implementation owner before writes begin. The existing seven production/two test allocation does not confer this authority.

Use a complete expected-facts baseline from the existing checked customer detail read, carried separately from the business patch and compared atomically by the audited customer update RPC. This is the minimum proposal: no version column, new table, receipt, idempotency system, HTTP endpoint, shared concurrency framework or broader CRM migration. The new required RPC argument is an intentional compatibility change with fail-closed old-caller behavior, described below.

## Evidence and immutable context

- Checkout `C:/DEV/K35-records`, branch `codex/story-35-3-record-inputs-and-tables`; product base `431c27f63183dc0dde0eea44da1427f78adf74c4`; blocked planning checkpoint `0740f04ae75cd5bfb14eeaed122b98404b865831`.
- Reuse `_bmad-output/specs/spec-design-35-3/contract-assessment.md` and independent `docs/quality/story-35-3-blocker-review-2026-10-29.json`. They assessed candidate `64a8e3a51d7b05d0a7bec6ce0094cc240002410d` over the same product base. Their PASS confirms the customer-edit stale-authority blocker, **not this proposed SQL design, implementation readiness or runtime behavior**. This task does not repeat broad readiness or consume a product review round.
- The proven caller is authenticated, currently entitled `tenant_admin`, `projektledare` or `saljare`: customer detail → CustomerDialog edit → `updateCustomerAction` → parser → validator/envelope → `updateCustomer` → checked RPC. B commits a new phone; A submits the old nonblank phone with a city edit; current SQL overwrites B. Existing tenant/role/shape/audit checks do not reject that valid same-tenant request.
- `E35-3-STATE-stale` / `E35-3-T-stale` retain their canonical “cannot overwrite latest facts” obligation. Local late-result correlation, refresh-before-save and changed-field-only patches do not establish it.
- Root's single captured metadata snapshot is `tmp/private/story35-3/prerequisite-remote-migration-inventory.json`: captured `2026-10-29T12:44:26.3532553Z`, remote main `431c27f63183dc0dde0eea44da1427f78adf74c4`, **119 existing migration filenames and Git blob identities**. Reuse it; no new census or migration-body review is needed for this plan. In particular the existing update definition is in `20260907171252_role_aware_phase_a_policy_evolution.sql`, blob `182bc47b44de089969bd8856776e2576aac55d5c`; current CRM table privilege baseline is `20261002122535_crm_and_audit_privilege_baseline.sql`, blob `50721c4e6d582b3dd9117c869fd2b3f93a613037`. These files and every other existing migration remain immutable. This snapshot is not a live target-backend schema assertion.

Preserve all raw pins in `_bmad-output/specs/spec-design-35-3/source-binding.json`, canonical bytes, IDs, applicability and immutable v1 sources. Principal raw SHA-256 pins remain:

| Source | Raw SHA-256 |
| --- | --- |
| `_bmad-output/implementation-artifacts/spec-35-3-record-inputs-and-tables.md` | `d70ddd6e3291fc42a0e20e6aeb6f5a2d4df62d619bad0b40588c317be35fe445` |
| `_bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-3.md` | `d354e22692446c6f3413abded4fdc7fb07dfa2bf8d4da6924373ca29996094fa` |
| Approved `ux-Kopplas-2026-10-23/DESIGN.md` | `d73d7fd80809c05350b4d403ed526812f831417a28dcbf23edd44317260673e6` |
| Approved `ux-Kopplas-2026-10-23/EXPERIENCE.md` | `f1eb82ae69f92ffb04b7a6aa9147e77d9f62be6fc4b45b4d6cf60ad33791c1d6` |
| `_bmad-output/planning-artifacts/ux-design-specification-phase-b.md` | `ea1005cc620b7c9683db0db60f2be80e0b1c065ebac8f7cf13568012a679fd4e` |

The two abbreviated design paths are under `_bmad-output/planning-artifacts/ux-designs/`. Historical preparation wording remains historical; do not repin sources to make implementation fit.

## Exact scope and proposed claim

**Customer update only.** Preserve customer create/archive, facility/contact create/update/archive and their existing permission/lifecycle semantics. Customer archival after the baseline read changes a compared fact and therefore rejects a stale customer edit; this does not add an archive precondition. Facility/contact changes do not change the parent customer facts and do not invalidate a customer-only edit. No new child revision, lock or stale guarantee is claimed.

Existing UI-owned seam work remains in `src/components/crm/CustomerDetail.tsx` and `src/components/crm/CustomerDialog.tsx`; all seven current presentation paths retain their operative allocation. The prerequisite proposes these **four additional existing production paths**, narrowly limited as follows:

| Proposed additional path | Sole change purpose |
| --- | --- |
| `src/features/crm/form-parsing.ts` | `parseUpdateCustomerForm` parses and forwards the complete `expected_customer` baseline separately from edited values; other parsers unchanged. |
| `src/server/commands/crm/validation.ts` | Customer-update-only baseline type/shape and identity validation; preserve business validators, shared archive validator and facility/contact contracts. |
| `src/server/commands/crm/customers.ts` | `updateCustomer` passes required baseline as separate RPC argument; `buildCustomerPatch` stays the current business allowlist. Create/archive unchanged. |
| `src/server/commands/crm/crm-db.ts` | Map the customer update RPC's exact definite-conflict SQLSTATE `PT409` to existing `COMMAND_CONFLICT`; restrict this mapping to `update_customer_with_audit`. Other mutation mappings unchanged. |

Propose **one new forward migration**, path pattern `supabase/migrations/<unallocated-timestamp>_customer_update_expected_facts.sql`. This is a proposed filename pattern only, not a valid allocated filename, timestamp or approved migration. Allocate the actual timestamp only after authorization and current ownership reconciliation. Its operation/schema contract is frozen below.

Proposed additional existing test paths:

1. `tests/integration/commands/crm-customer-commands.int.test.ts` — exact home for real two-editor command/RPC, tenant and atomic-audit assertions; also update its existing foreign-target caller to supply a well-formed baseline so it still reaches and tests tenant denial.
2. `tests/integration/commands/non-admin-audit-authority.int.test.ts` — reconcile the existing function catalogue assertion for two customer-update signatures (11 selected rows instead of 10), identify both signatures explicitly, and assert retained permissions/search path and safe old-signature behavior. Do not weaken other wrapper assertions or authorize facility/contact changes.
3. `tests/unit/features/crm/form-parsing.test.ts` — baseline preservation, malformed input and separation from edited values, in the existing parser suite.
4. `tests/unit/server/commands/crm-validation.test.ts` — complete/missing/null/malformed/mismatched baseline and preserved valid partial-patch behavior, in the existing validator suite. Update customer-update examples so unrelated rejection tests still test their named conditions.

The existing allocated `tests/e2e/crm/customers.e2e.spec.ts` binds the later visible conflict/refresh/review journey; `tests/unit/components/crm/customer-presentation.test.ts` retains its existing role. No new test framework or fixture/support-file write is proposed.

**Read-only dependencies remain:** `src/features/crm/read.ts`, `actions.ts`, `action-state.ts`, command errors/envelope/auth/tenant helpers, routes, root/globals/fonts/AppShell, shared Dialog, facility/contact bodies, booking/time/files, manifest and existing migrations. `readCustomerDetail` already returns the complete required facts from one RLS-scoped customer SELECT; no additional read field or revision is needed. `runCrm` already forwards `parsed.input` and maps all `CommandErrorCode` values into `CrmActionState`, including `COMMAND_CONFLICT`; no action/state rewrite is needed. No claim is made on those paths.

## Frozen baseline and propagation contract

Baseline is **original facts**, never the submitted business patch or a server reread substituted at submission. Exactly these 13 keys are required, with no extras: `id`, `customer_type`, `display_name`, `personnummer`, `org_nr`, `contact_name`, `email`, `phone`, `address_line1`, `address_line2`, `postal_code`, `city`, `archived_at`. All ten mutable fields must appear, even those omitted from the current form or business patch. Preserve explicit nulls and exact original strings; do not trim, mask, omit blank/null keys or replace them with edited values. `id` is UUID-shaped and must match the command target; `customer_type` is an existing allowed value; nullable text/date fields retain their read types. Limit serialized input to 16 KiB UTF-8 and validate each field's shape, including parseable non-null `archived_at`, without applying new-value requiredness to an old nullable fact.

1. `readCustomerDetail` obtains those facts on the per-request cookie-bound RLS client from `DETAIL_COLUMNS`, including `archived_at`. Customer list still omits personnummer and supplies no edit authority.
2. CustomerDetail constructs the complete expected-facts object from that same customer row, including the currently omitted `archived_at` in the editor defaults. CustomerDialog captures it for the opened customer/draft generation and submits serialized `expected_customer` separately from editable controls. Background refresh must not silently advance the baseline under retained old edits; a real refresh/review explicitly establishes a new baseline.
3. `parseUpdateCustomerForm` decodes bounded JSON to raw baseline input; the server customer validator requires every key, correct types and matching identity. It returns baseline unchanged alongside the currently validated business fields. Do not derive baseline from `state.values`, modified controls, default fallbacks or a submit-time SELECT.
4. Existing action/envelope forwards it unchanged. `updateCustomer` passes it as `p_expected_customer`; ordinary business fields alone form `p_patch`.
5. SQL verifies it against the tenant-bound locked current row before either UPDATE or audit. A client can edit the hidden baseline; it remains untrusted comparison input. Current authenticated actor, live tenant membership/role, target tenant, value validation and database constraints independently authorize every write. Possession of a baseline does not grant access, reveal foreign current facts or permit a tenant override.

This facts mechanism rejects differing current facts, including change to a field A did not intentionally edit. It deliberately makes **no version-history/ABA claim**: if every compared fact changes and later returns to its identical original value, the facts compare may pass. A timestamp alone is not used as a reliable revision. The canonical customer requirement protects latest facts from overwrite; no CRM obsolete-review/token/version-history feature is introduced. A newly discovered requirement for mutation-history detection would require a narrowly identified delta High assessment before changing this contract.

Do not log the baseline, place it in URLs/local storage/audit metadata or expose private values on list/error payloads. It contains only facts already entitled in the detail editor and is temporary form input. Normal business payload fields, partial-patch semantics, customer type immutability and identifier constraints remain unchanged.

## Forward SQL and API compatibility contract

One transactional forward migration adds a **required six-argument overload**:

`public.update_customer_with_audit(p_tenant_id uuid, p_actor_user_id uuid, p_correlation_id uuid, p_customer_id uuid, p_patch jsonb, p_expected_customer jsonb) RETURNS uuid`

No default argument. The existing five-argument signature `(uuid,uuid,uuid,uuid,jsonb)` remains callable with its current grants but is replaced by a fail-closed body: perform the existing actor/tenant/role check, validate required target/correlation inputs, then raise `PT409` with a generic refresh-required message and perform no write/audit. It must not read current facts and forward them as an invented baseline. No null/missing-baseline compatibility bypass or permissive old overload survives migration commit. Raw callers cannot reach the old write body.

The new overload retains `SECURITY DEFINER`, `SET search_path = ''`, fully qualified object/helper references and current owner conventions. Revoke EXECUTE from PUBLIC, anon and service_role; grant only authenticated, matching the existing command boundary. Existing helper internals remain unexecutable by those client roles; do not widen table, function, schema or RLS grants. Keep authenticated table writes revoked. This proposal changes functions only: **no table column, index, policy, trigger or other persistent schema object**.

Execution order inside the checked new overload:

1. Apply the existing `story_11_2_assert_crm_roles` check with `tenant_admin/projektledare/saljare`; preserve auth.uid-to-actor and current tenant-role binding. Validate correlation/target, baseline shape and existing nonempty business patch allowlist/value rules. Missing/null/incomplete/wrong-shape baseline is `23514` (validation), never success or a fallback reread.
2. SELECT the customer by **both resolved tenant and customer ID FOR UPDATE**. An absent/foreign target gives existing generic `42501`; do not distinguish tenant existence with a conflict or return foreign facts. Hold the row lock through comparison, mutation and audit.
3. Compare all baseline values to that locked row. UUID identity is compared as UUID; all text is exact and null-safe; `archived_at` is parsed and compared as timestamptz with `IS NOT DISTINCT FROM`, avoiding JSON date-format differences. Any differing fact raises only generic `PT409`, without current values. SQL null semantics must not turn a mismatch into an unknown/accepted comparison.
4. Apply the same allowed business patch and existing constraints using tenant plus ID; invoke the same internal bound `customer.update/customer.updated/customer` audit writer with `{}` metadata and the caller's correlation. Return the same target UUID only after both succeed. Any exception rolls the entire transaction back; conflict produces neither successful update nor audit.

Repository production callers are CustomerDialog → `updateCustomerAction` and `updateCustomer` → this RPC; no production HTTP customer endpoint was found. Existing integration callers and direct raw RPC paths are included above. The server action signature, `CrmActionState` discriminant, success `targetId`, ordinary business field meanings and UUID RPC success result stay compatible. **Baseline-less update requests intentionally stop succeeding.** Updated commands always send six named arguments; five named arguments resolve only to the fail-closed legacy signature. Verify this against actual PostgREST in integration; never rely on a TypeScript cast for overload resolution.

`PT409` mapping belongs only to this customer operation in the existing DB helper, yielding existing `COMMAND_CONFLICT`. The action already preserves submitted suitable values. CustomerDialog keeps the draft open/unsaved, explains that current customer facts changed and offers explicit refresh/review. Do not automatically close, announce saved, replay, silently merge or advance baseline under old values. Refresh/review obtains the current checked detail and requires explicit review before a new save with that baseline; if unconfirmed transport applies, retain G-01 safety independently.

## Required verification after authorization

Use the existing isolated local stack and fixtures; services require proper guard context/admission. No demo/project backend. The exact two-editor integration additions belong in `tests/integration/commands/crm-customer-commands.int.test.ts`:

| Case | Meaningful assertion |
| --- | --- |
| Same-tenant stale A after B commit | Two independently authenticated entitled users in tenant A read the same complete baseline through RLS SELECT. B changes phone/name through the real command; A submits old phone/name plus a city edit. A gets `COMMAND_CONFLICT`; independent reread preserves B's facts and rejects A's entire patch; B has exactly one correctly bound audit, A none. |
| Concurrent equal-baseline writers | Release two real checked requests from the same baseline without sleeps; exactly one succeeds, the other conflicts after row-lock recheck; persisted row equals the winner, never a mixed patch; exactly one update audit. |
| Reviewed fresh save | Explicit current RLS read after conflict supplies the complete new baseline; user-reviewed new patch succeeds and yields the same target ID; exactly one bound audit and correct persisted fields. Preserve permitted partial patches and entitled seller/PM/admin behavior. |
| Authority and tenant boundary | Current tenant-B actor cannot mutate tenant-A customer even with its exact baseline; forged tenant/actor arguments and revoked/unentitled membership remain denied. Use well-formed baseline so tests reach actual authority. No mutation/audit/private current-fact response. |
| Raw boundary/compatibility | Direct authenticated six-arg RPC rejects stale and malformed/null/incomplete/mismatched baselines; old five-arg RPC rejects without writing; direct table write remains denied. Verify generic codes and actual named-argument overload dispatch. |
| Atomic audit failure | Use existing `test_support.forced_audit_failures` correlation fixture and existing admin SQL helper, as demonstrated in the non-admin audit suite. Force this update's audit insert to fail; independent reread proves no business patch persisted and no update audit. Clean up only this test's forced-failure row in finally; no new schema or shared trigger harness. |

Parser/validator cases verify the full original baseline is preserved distinctly from changed fields, explicit nulls survive, omitted fields cannot bypass comparison and malformed inputs reject before command execution. Do not merely change old expectations to accept a weaker contract. The existing catalogue test must verify **both signatures**, their search path and grants, rather than selecting the first overload by name.

Later run focused unit and command integration paths, required full integration/RLS using `SUPABASE_TEST_REQUIRED=1` with executed/failed/skipped counts, and applicable static/build/security/containment gates under current completion policy. Existing allocated production-server E2E must prove the actual two-editor conflict is visible, input remains unsent, refresh/review enables a later confirmed save, and private baseline facts stay out of list/error/audit output. Controlled transport is actual Next server-action transport, not `/api/customers`. Test names or this source plan are not execution evidence.

## Dependency, release sequencing and recovery

1. Coordinator/owner records **one exact expanded-scope authorization** for this proposed operation/path set, allocates the actual migration filename and sole Sol High implementation owner; root reconciles current base/claims without altering immutable sources/migrations. If changed dependencies invalidate a specific proposal, request only that delta High assessment.
2. Implement the source prerequisite with customer-owned baseline wiring, compatibility test updates and sensitive independent review. Keep SQL and updated caller source together in the bounded branch; root owns Git and publication strategy. This is not a separate-PR authorization.
3. Verify on isolated migrated local infrastructure. Reconcile 35.3 adapter/test planning to the verified contract under root ownership, preserving every canonical ID/pin and other gap dispositions; only then resume ATDD/35.3 UI work under its approved allocation. Prerequisite completion does not itself satisfy all 35.3 states.
4. Any future release must coordinate target migration and caller activation under **separate actual deployment/database authority**. Applying the secure migration before updated callers makes existing edit callers fail closed until the compatible caller is active. Updated callers before the new overload is available cannot save. A bounded edit-unavailable interval or a separately qualified coordinated release is therefore required; zero-downtime compatibility is not claimed or solved by making the baseline optional. No hosted release ordering is authorized here.
5. After an applied migration, recover by a new reviewed **fix-forward** migration/caller repair; never edit/remove/reset an applied file or database. Rolling back application source to an older caller preserves fail-closed edit behavior, possibly disabling edits. Do not restore the old permissive RPC, synthesize its baseline from current data, or allow null baseline to recover availability. Old callers may recover only by refreshing and upgrading to the checked baseline protocol. Preserve existing data, containers and volumes.

No merge, deployment, database push, migration generation/application, CI dispatch or remote mutation is authorized by this plan. Runtime verification and implementation remain unstarted. Root computes final Git/blob byte identity and delivers the artifact to Coordinator; this author changes only this file.

## Remaining obligations and resume condition

No unresolved source fact prevents freezing this minimum proposal. The outstanding decision is acceptance/allocation of this exact additional customer-update contract, including deliberate fail-closed old-caller compatibility; the completed blocker PASS is not that decision. If an external/hosted update caller beyond the repository must keep working, Coordinator must name it and obtain a **delta** compatibility assessment before release planning; its existence is not assumed, and no generic new review is requested.

G-01 unknown-create reconciliation remains safe blocking before consequential retry; this prerequisite grants no create identity/recovery guarantee. G-03 full route/Back/Forward precommit binding and G-04 actual action-transport tests retain their recorded gaps. Do not add global guards, receipt machinery or excluded shell/action-state edits to clear them silently. Their concrete bindings must be resolved in refreshed 35.3 planning, escalating only a specifically proven additional boundary.

Retain the original seven ACs, sixteen Applies states, inherited/N/A distinctions, `E35-3-REL-1/2/3`, current development gates, independent review and initial revision-bound owner visual acceptance for the new customer composition. Reuse 35.2 foundation/font/login approval only. Actual production desktop/360×640 captures and exact candidate image links/embeds remain required when visual acceptance is requested; no images or acceptance exist for this plan. Do not mark implementation ready, development complete or release ready. **Resume condition:** recorded expanded allocation → implemented/verified and independently reviewed source prerequisite → refreshed 35.3 plan and normal readiness gates. Until then the stale-authority planning blocker remains; `release_ready=false`.
