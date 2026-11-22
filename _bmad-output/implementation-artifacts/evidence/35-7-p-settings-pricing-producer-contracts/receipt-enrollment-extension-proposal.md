# Bounded receipt enrollment fixture/expectation extension — proposal only

No unallocated file has been edited. Prior path approvals remain earned. These five exact consumers are the complete proven delta.

## tests/integration/rls/role-harness.atdd.int.test.ts

SHA-256: `75688b1a77bc851a764bbbc485f5be3ad3306fd55ff7f309c261d144eed0444a`.

BEFORE: Existing source has no settings_pricing_operations enrollment; original source unchanged.

AFTER: In seedEveryTenantTable only, allocate one synthetic operation UUID; INSERT a schema-valid private receipt using existing companySettings real row ID/write_revision read from public.company_settings for tenantId, existing actorId, operation_kind company.save, fixed synthetic 64-hex digest, correlation_id equal operation UUID, current synthetic setup committed_at and approved_at null. Require one returned ID and return it as settings_pricing_operations. Existing role cases/expect outcomes unchanged; normal clients still perform both real own and foreign denial queries.

## tests/support/authz/role-harness.ts

SHA-256: `23a1897cc8fb9cda711f5fc3c95d86f68680f7c7bcba41ac3d484e394fbf1dc9`.

BEFORE: Existing source has no settings_pricing_operations enrollment; original source unchanged.

AFTER: Add only settings_pricing_operations metadata entries: TABLE_PROJECTION_CAPABILITIES=CompanySettings.Edit (existing capability metadata, no permission grant), TABLE_DIRECT_RLS_ALLOWED_ROLES=[] (no role has direct receipt read), TABLE_RLS_PROJECTION_ADAPTERS=keyProjection(settings_pricing_operations,id,true). Retain existing harness generation, command probes, casts, cases, and all consumer assertions.

## tests/integration/rls/cross-tenant-isolation.rls.test.ts

SHA-256: `471ec572624326090089b3d3afdcef3963f7f4a3844923037b93d50af9ad572f`.

BEFORE: Existing source has no settings_pricing_operations enrollment; original source unchanged.

AFTER: Add only settings_pricing_operations to directReadRevokedTables. Existing SELECT denial branch then requires error.code 42501 and data null for the new private table. No assertion, fixture, seededMutationTargets, DML expectation, existing entry, or generic logic changes.

## tests/unit/scope/manifest-shape.test.ts

SHA-256: `4a516ad9d25a6effaa0e07156f9388491510640ac76f62c87249cf47cf114296`.

BEFORE: Existing source has no settings_pricing_operations enrollment; original source unchanged.

AFTER: Add only settings_pricing_operations string to PINNED_TENANT_TABLES beside settings entries; update exact total 58→59 and matching count diagnostic/title wording. Preserve fail-loud complete equality and length assertions with the new expected enrollment, all existing entries and every unrelated assertion/logic. These exact membership/count/title changes are explicit exceptions to source-byte preservation.

## tests/unit/scope/manifest-derivations.test.ts

SHA-256: `9a0a5e50e00cb6d6e254cd4c37e2f73850b55cd0e9725030a7faa9d7f364b870`.

BEFORE: Existing source has no settings_pricing_operations enrollment; original source unchanged.

AFTER: Add only settings_pricing_operations string to PINNED_TENANT_TABLES beside settings entries; update exact total 58→59 and matching count diagnostic/title wording. Preserve fail-loud complete equality and length assertions with the new expected enrollment, all existing entries and every unrelated assertion/logic. These exact membership/count/title changes are explicit exceptions to source-byte preservation.

## Verification and limits

Cited actual typecheck progress log native2 currently records seven diagnostics: six owned TS2339 ParserError reads (three each in already allocated settings/pricing command suites, being repaired there) plus the blocked TS2741 exhaustive role-harness seed omission. The earlier sole-error progress log was overwritten; it is not claimed as retained evidence. Preserve current log. Actual scope units native1 executed14, passed12, failed2, skipped0; both pinned equality/length contracts require new expected membership and58→59. No runtime DB/RLS result is inferred.

All existing security/business assertions and titles outside the two scope files remain byte-identical. Scope exceptions are exactly one expected membership plus58→59 exact length/count and matching diagnostic/title wording per file; full fail-loud equality remains. No generic assertion weakening.

Only private receipt setup/metadata plus exact expected-enrollment updates change. No SQL/API relaxation, direct grant, permission/factory/global setup change, frozen source edit or generic framework is proposed. P-AC3/P-R1 and P-AC7/P-R3 require these privacy/enrollment semantics. Synthetic receipt seed is fixture construction, not proof of a real operation.
