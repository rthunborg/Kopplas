# 35.7-P six-call fixture adaptation proposal

Actual owner approval on2026-11-02: **“Approve both fixture updates and Coordinator messaging”**, reply to request_user_input_async question0 relayed by Root. No message ID invented. This approves exactly two fixture files with unchanged business/security assertions; it changes no normative producer contract. Product/test writes remain held until independent narrow confirmation and refreshed ownership. Build stays incomplete.

## Semantic/API boundary

AFTER labels are illustrative semantic records, not normative TypeScript input/property signatures. Actual future adapter/validator fields and create/update discrimination remain bounded implementation details; business fields/approved operation-kind literals are pinned. Never put proposed UUID into the old optional id meaning update.

## Approved producer clauses requiring these changes

- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:29` — **C1**: Capture operation UUID/kind, target/proposed UUID, revision/absence and canonical candidate before dispatch; envelope correlation equals the operation UUID.
- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:31` — **C2**: Resolve tenant/actor on server; bind complete canonical fields and expected facts, preserving omission, integer ore and bp.
- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:41` — **C3**: Current authenticated actor and membership/role remain authoritative through commit.
- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:47` — **C4**: First singleton creation requires actual expected absence; cannot overwrite via an upsert branch.
- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:57` — **C5**: Only successful null singleton reads establish expected absence; carry captured ID/revision through validators.
- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:59` — **C6**: Existing company/terms writes compare locked revision; each update renews it, including same-value saves.
- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:73` — **C7**: Revoke old writes; no missing-ID/revision compatibility bypass; dedicated provisioning insertion stays unchanged.
- `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:93` — **C8**: Reuse existing role/authenticated/audit fixtures and regression gates without unrelated responsibility expansion.

P-AC1/3/4/7 require mandatory identity and expected facts. A permissive old-input fallback would violate the approved producer. Existing regression assertions must therefore use the new checked protocol.

## Proven fixture starting facts

### company exists

Both onboarding company calls update the company row created during provisioning. Neither may use expected absence or a proposed target UUID.

- `tests/factories/platform-operators.ts:561` — `export async function createAcceptedProvisionedFirstAdminFixture`.
- `tests/factories/platform-operators.ts:578` — `const provisioned = await executeApprovedProvisioning(input, { preserveFixture: true });`.
- `supabase/migrations/20260919183425_provisioning_review_authority_fixes.sql:114` — `insert into public.tenant_provisioning_requests(request_id`.
- `supabase/migrations/20260919192619_provisioning_request_validation_persistence.sql:42` — `create trigger tenant_provisioning_requests_apply_company_settings`.
- `supabase/migrations/20260919193857_provisioning_company_settings_trigger_owner.sql:8` — `insert into public.company_settings(`.

### terms absent in current fixture source

Provisioning baseline termsPlaceholder=true is metadata, not a quote_terms seed. The current provisioner/acceptance fixture creates no quote_terms row for the new tenant. Still require actual authenticated error-free maybeSingle null before using absence; fail fixture setup on error or unexpected existing row.

- `src/server/provisioning/baselines.ts:3` — `const entry =`.
- `supabase/migrations/20260919120000_provisioning_decision_8a_authority.sql:25` — `values ('standard-se',1,`.
- `supabase/migrations/20260919183425_provisioning_review_authority_fixes.sql:107` — `insert into public.tenants(`.
- `tests/factories/platform-operators.ts:608` — `const accepted = await adminSession`.
- `tests/factories/platform-operators.ts:618` — `FIRST_ADMIN_ACCEPTANCE_FAILED`.
Read exact provisioner INSERT sequence and full accepted fixture561-655; repository insertion search found quote_terms writes in command wrappers only, no provisioning/acceptance seed. Source inspection is not runtime verification.

### work-role deliberate create

Current provisioner/acceptance fixture creates no work_roles rows for the new tenant. The test deliberately creates a new target; never dedupe by Elektriker/name/price. Explicit absence concerns proposed target UUID, not the whole collection.

- `tests/factories/platform-operators.ts:219` — `export async function executeApprovedProvisioning(`.
- `supabase/migrations/20260919183425_provisioning_review_authority_fixes.sql:107` — `insert into public.tenants(`.
- `tests/integration/journeys/first-admin-onboarding-lifecycle.int.test.ts:91` — `const role = await runCommand(upsertWorkRole as never`.

## Six exact before/after shapes

### EXT-1 — `tests/integration/commands/non-admin-audit-authority.int.test.ts:428` `upsertWorkRole`

BEFORE — verbatim current source; LF normalization only:

```ts
      const workRoleCorrelation = crypto.randomUUID();
      const workRole = await runCommand(upsertWorkRole, {
        client: seller as never,
        input: {
          display_name: `11.2 PM role ${crypto.randomUUID()}`,
          cost_rate_ore: 45000,
          sell_rate_ore: 85000,
        },
        correlationId: workRoleCorrelation,
      });
```

AFTER — semantic input, illustrative protocol labels:

```json
{
  "operation_uuid": "workRoleCorrelation (existing fresh UUID variable)",
  "operation_kind": "work_role.create",
  "target_identity": "proposedWorkRoleId: new UUID captured once",
  "expected_facts": "explicit absence of proposedWorkRoleId",
  "canonical_candidate": {
    "display_name": "`11.2 PM role ${crypto.randomUUID()}` (evaluate once)",
    "cost_rate_ore": 45000,
    "sell_rate_ore": 85000
  },
  "client": "seller as never",
  "envelope_correlationId": "exactly the captured operation UUID above",
  "fixture_preparation": "No label/price lookup. Existing workRoleCorrelation declaration and audit query binding retained."
}
```

Current validator `src/server/commands/pricing/validation.ts:111` `export function validateUpsertWorkRole(`. Contract: C1, C2, C3, C7, C8. Acceptance: P-AC1/P-U1; P-AC2/P-I2; P-AC3/P-I3/P-R1; P-AC7/P-R3.

### EXT-2 — `tests/integration/commands/non-admin-audit-authority.int.test.ts:454` `upsertArticle`

BEFORE — verbatim current source; LF normalization only:

```ts
      const articleCorrelation = crypto.randomUUID();
      const article = await runCommand(upsertArticle, {
        client: seller as never,
        input: { name: `11.2 PM article ${crypto.randomUUID()}`, unit_price_ore: 1250 },
        correlationId: articleCorrelation,
      });
```

AFTER — semantic input, illustrative protocol labels:

```json
{
  "operation_uuid": "articleCorrelation (existing fresh UUID variable)",
  "operation_kind": "article.create",
  "target_identity": "proposedArticleId: new UUID captured once",
  "expected_facts": "explicit absence of proposedArticleId",
  "canonical_candidate": {
    "name": "`11.2 PM article ${crypto.randomUUID()}` (evaluate once)",
    "unit_price_ore": 1250
  },
  "client": "seller as never",
  "envelope_correlationId": "exactly the captured operation UUID above",
  "fixture_preparation": "No name/SKU/price lookup; optional sku/unit stay omitted. Existing articleCorrelation and audit query binding retained."
}
```

Current validator `src/server/commands/pricing/validation.ts:156` `export function validateUpsertArticle(`. Contract: C1, C2, C3, C7, C8. Acceptance: P-AC1/P-U1; P-AC2/P-I2; P-AC3/P-I3/P-R1; P-AC7/P-R3.

### EXT-3 — `tests/integration/journeys/first-admin-onboarding-lifecycle.int.test.ts:60` `updateCompanySettings`

BEFORE — verbatim current source; LF normalization only:

```ts
      const companyIdentity = await runCommand(updateCompanySettings, {
        client: firstAdminClient as never,
        input: {
          company_name: "Lifecycle Electric AB",
          org_nr: tenant.normalized_organization_number,
          default_vat_display: "company_excl",
          vat_rate_bp: 2500,
        },
        correlationId: crypto.randomUUID(),
      });
```

AFTER — semantic input, illustrative protocol labels:

```json
{
  "operation_uuid": "companyIdentityOperationId: new UUID captured once",
  "operation_kind": "company.save",
  "target_identity": "companyBeforeIdentity.id: real existing row ID",
  "expected_facts": "existing ID + companyBeforeIdentity.write_revision",
  "canonical_candidate": {
    "company_name": "\"Lifecycle Electric AB\"",
    "org_nr": "tenant.normalized_organization_number",
    "default_vat_display": "\"company_excl\"",
    "vat_rate_bp": 2500
  },
  "client": "firstAdminClient as never",
  "envelope_correlationId": "exactly the captured operation UUID above",
  "fixture_preparation": "Before capture, use firstAdminClient.from(\"company_settings\").select(\"id,write_revision\").eq(\"tenant_id\",accepted.tenantId).single(); require no error, actual row and valid UUID revision, otherwise throw fixture setup error. Never use absence."
}
```

Current validator `src/server/commands/settings/validation.ts:137` `export function validateUpdateCompanySettings(`. Contract: C1, C2, C3, C7, C8, C5, C6. Acceptance: P-AC1/P-U1; P-AC3/P-I3; P-AC4/P-I4; P-AC7/P-R3.

### EXT-4 — `tests/integration/journeys/first-admin-onboarding-lifecycle.int.test.ts:72` `updateCompanySettings`

BEFORE — verbatim current source; LF normalization only:

```ts
      const vat = await runCommand(updateCompanySettings, {
        client: firstAdminClient as never,
        input: {
          company_name: "Lifecycle Electric AB",
          org_nr: tenant.normalized_organization_number,
          default_vat_display: "company_togglable",
          vat_rate_bp: 2500,
        },
        correlationId: crypto.randomUUID(),
      });
```

AFTER — semantic input, illustrative protocol labels:

```json
{
  "operation_uuid": "vatOperationId: fresh UUID distinct from companyIdentityOperationId",
  "operation_kind": "company.save",
  "target_identity": "companyBeforeVat.id: real row ID from new read",
  "expected_facts": "existing ID + new companyBeforeVat.write_revision",
  "canonical_candidate": {
    "company_name": "\"Lifecycle Electric AB\"",
    "org_nr": "tenant.normalized_organization_number",
    "default_vat_display": "\"company_togglable\"",
    "vat_rate_bp": 2500
  },
  "client": "firstAdminClient as never",
  "envelope_correlationId": "exactly the captured operation UUID above",
  "fixture_preparation": "After await companyIdentity and unchanged expect(companyIdentity.ok).toBe(true), reread id/write_revision with same authenticated own-tenant single query; require successful real row. Capture new revision; never reuse first baseline or invent a future result field."
}
```

Current validator `src/server/commands/settings/validation.ts:137` `export function validateUpdateCompanySettings(`. Contract: C1, C2, C3, C7, C8, C5, C6. Acceptance: P-AC1/P-U1; P-AC3/P-I3; P-AC4/P-I4; P-AC7/P-R3.

### EXT-5 — `tests/integration/journeys/first-admin-onboarding-lifecycle.int.test.ts:84` `updateQuoteTerms`

BEFORE — verbatim current source; LF normalization only:

```ts
      const terms = await runCommand(updateQuoteTerms, {
        client: firstAdminClient as never,
        input: { terms_text: "Betalningsvillkor 30 dagar." },
        correlationId: crypto.randomUUID(),
      });
```

AFTER — semantic input, illustrative protocol labels:

```json
{
  "operation_uuid": "termsOperationId: new UUID captured after successful null read",
  "operation_kind": "terms.save",
  "target_identity": "proposedTermsId: new UUID captured once",
  "expected_facts": "explicit singleton absence only from error-free data===null",
  "canonical_candidate": {
    "terms_text": "\"Betalningsvillkor 30 dagar.\""
  },
  "client": "firstAdminClient as never",
  "envelope_correlationId": "exactly the captured operation UUID above",
  "fixture_preparation": "Before capture, firstAdminClient.from(\"quote_terms\").select(\"id,write_revision\").eq(\"tenant_id\",accepted.tenantId).maybeSingle(); on error or data!==null throw fixture setup error. No null/error conflation, silent update branch or approval fields."
}
```

Current validator `src/server/commands/settings/validation.ts:201` `export function validateUpdateQuoteTerms(`. Contract: C1, C2, C3, C7, C8, C4, C5. Acceptance: P-AC1/P-U1; P-AC3/P-I3; P-AC4/P-I4; P-AC5/P-I5 (save-only semantics retained); P-AC7/P-R3.

### EXT-6 — `tests/integration/journeys/first-admin-onboarding-lifecycle.int.test.ts:91` `upsertWorkRole`

BEFORE — verbatim current source; LF normalization only:

```ts
      const role = await runCommand(upsertWorkRole as never, {
        client: firstAdminClient as never,
        input: { display_name: "Elektriker", cost_rate_ore: 45000, sell_rate_ore: 85000 },
        correlationId: crypto.randomUUID(),
      });
```

AFTER — semantic input, illustrative protocol labels:

```json
{
  "operation_uuid": "roleOperationId: new UUID captured once",
  "operation_kind": "work_role.create",
  "target_identity": "proposedRoleId: new UUID captured once",
  "expected_facts": "explicit absence of proposedRoleId, not the whole catalogue",
  "canonical_candidate": {
    "display_name": "\"Elektriker\"",
    "cost_rate_ore": 45000,
    "sell_rate_ore": 85000
  },
  "client": "firstAdminClient as never",
  "envelope_correlationId": "exactly the captured operation UUID above",
  "fixture_preparation": "Keep deliberate create; no Elektriker matching/dedupe. Remove command-level as never when actual revised exported Command is wired; client cast unchanged."
}
```

Current validator `src/server/commands/pricing/validation.ts:111` `export function validateUpsertWorkRole(`. Contract: C1, C2, C3, C7, C8. Acceptance: P-AC1/P-U1; P-AC2/P-I2; P-AC3/P-I3; P-AC7/P-R3.

## Type casts and preserved assertions

Propose removing only upsertWorkRole as never at original journey91 when actual exported revised Command is wired; it can hide generic result/input relations but does not change runtime authority or existing expect outcomes. Do not replace it with another broad command/input cast.

Keep existing seller as never / firstAdminClient as never unchanged in this bounded proposal; structural client casts can conceal interface mismatch but runtime auth/validation/SQL remain enforced. No new casts or elevated clients.

Even removing command cast does not itself type-check protocol input because runCommand raw input is unknown. Once revised actual exported validated input types exist, type local captured objects/satisfies against those real types, never illustrative-field casts; actual validator/DB evidence remains required. `src/server/commands/envelope.ts:205` accepts `input: unknown`.

All existing expect assertions/test titles/business values/optional omission/money rates/current tenant-actor resolution/role setup-restoration/audit command-event-target-metadata-count/direct-DML denial/onboarding invite-read-model/tenant-B protectedRows expectations remain byte-for-byte. Only local UUID/input capture and authorized successful readback/fixture guards change. No helper/global factory/provisioning/permission edits.

The JSON retains the exact BEFORE and existing assertion blocks with LF SHA-256 values, plus complete current two-file hashes. No assertion is weakened or relabelled. Company/VAT reads are through the actual firstAdminClient with an own-tenant filter, not service-role mutation or submitted tenant authority. The second read must follow first success; terms read errors/unexpected rows fail fixture preparation rather than manufacture absence.

## Independent confirmation and limits

This new extension has not been independently reviewed. The imported source review covers its unchanged approved proposal bytes only. Root will dispatch a distinct context-free Sol High reviewer over this bounded six-call proposal and the exact two test-file hashes. A positive review is `PASS_FOR_ALLOCATION_DECISION`, never implementation/runtime PASS. No runtime/broad tests, resource launches, wrapper rerun, product/test/assertion/source-binding/frozen/history writes or author dispatch occurred. Actual implementation, sensitive review, required DB/RLS/browser/visual and completion gates remain unearned.

No new business question remains. Future typed adapter property spelling is an engineering choice within the existing allocated implementation, subject to the approved semantic contract.
