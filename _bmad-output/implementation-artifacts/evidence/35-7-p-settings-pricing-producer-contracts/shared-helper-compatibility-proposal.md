# 35.7-P complete legacy-caller inventory and shared-helper adaptation

Status: **PROPOSED third-file extension — NOT OWNER APPROVED / NOT INDEPENDENTLY CONFIRMED**. Prior exact two-file approval/review remains valid. Product writes and author dispatch remain held.

## Complete bounded inventory

A native0 exact-name search covered7oldRPCs,9commandexports and9actionexports across src/tests, including support/factories, with a separate actual import-path scan. Full matches/caller rows/dispositions are in `legacy-caller-compatibility-inventory.json`. Source-only evidence, no runtime or external-user absence claim.

- Nine production RPC call sites are in original allocation.
- Existing settings/pricing command integration callers and parsing/validation/browser files are originally allocated.
- Six additional positive command calls in two integration files are already owner-approved and independently confirmed.
- **Only remaining out-of-allocation positive calls: three raw RPC calls in `tests/support/booking-conflicts-atdd.ts`:104/143/144.**
- Snapshot unit:268 is comment-only. `migration-reset.int.test.ts` exact ACL enumerations are booking/job/time domain-specific; no old settings/pricing RPC signature check. Receipt has no policies and domain policies stay unchanged, so no concrete extra edit there.

The enabled `booking-conflicts.int.test.ts:268` eight-writer loop calls prepareConsumedWriter at272;7non-invitation paths first call seedWorkRole. Registration at552 invokes native test, not skip. After mandatory oldRPCgrant revocation, those7 paths fail during seed before real lock observation. The two work-role writer branches also call revoked mutation RPCs.

## Exact read-only allocation constraint

Original author allocation keeps shared factories/global setup/helpers read-only. Actual owner addition2026-11-02 approves only the two named integration fixture files; it does not include this third shared helper. No implied authorization from general task or old caller existence.

The canonical Minimum allocation heading is `_bmad-output/specs/spec-settings-pricing-producer-contracts/producer-contract.md:77`; closed `source-binding.json` future_test_write_paths excludes this helper. Current two-file addition cannot authorize it. No legacy grant fallback or consumer assertion change resolves this correctly.

## Three BEFORE to AFTER shapes

### HELP-1 — `tests/support/booking-conflicts-atdd.ts:104` `seedWorkRole`

BEFORE, verbatim current source with LF normalization only:

```ts
export async function seedWorkRole(fx: BookingFixture) {
  const saved = await fx.adminClient.rpc("upsert_work_role_with_audit", {
    p_tenant_id: fx.base.tenantA.id, p_actor_user_id: fx.base.adminA.id, p_correlation_id: crypto.randomUUID(),
    p_work_role_id: null, p_display_name: "Conflict fixture electrician", p_cost_rate_ore: 20000, p_sell_rate_ore: 40000,
  });
  if (saved.error || typeof saved.data !== "string") throw new Error("Real work role fixture failed");
  return saved.data;
}
```

AFTER, precise semantics with illustrative new wire/property spellings:

```json
{
  "checked_rpc": "upsert_work_role_with_audit_v2 (approved RPC name)",
  "identity": "Fresh operationUUID and proposed targetUUID allocated once before call; explicit proposed-target absence; company/actor args remain fx.base.tenantA.id/fx.base.adminA.id checked against fx.adminClient authentication",
  "candidate": {
    "display_name": "Conflict fixture electrician",
    "cost_rate_ore": 20000,
    "sell_rate_ore": 40000
  },
  "audit": "Original operationUUID used as correlation; no extra envelope/audit write",
  "result_projection": "Validate actual committed receipt/result identity against captured operation/target and valid committedRevision. Return the same target UUID string from seedWorkRole; callers keep existing return/lock/parent-link shape. Replace old typeof data===string guard, not the success requirement.",
  "labels": "Additional parameter/property labels are illustrative until actual v2 typed adapter/wire contract is implemented; no missing-precondition fallback."
}
```

Approved producer anchors: `producer-contract.md:29`, `producer-contract.md:31`, `producer-contract.md:41`, `producer-contract.md:45`, `producer-contract.md:73`, `producer-contract.md:93`, `producer-contract.md:107`. ACs: P-AC1, P-AC2, P-AC3, P-AC6, P-AC7.

### HELP-2 — `tests/support/booking-conflicts-atdd.ts:143` `prepareConsumedWriter returned invoke closure`

BEFORE, verbatim current source with LF normalization only:

```ts
      case "work_role_upsert": return fx.adminClient.rpc("upsert_work_role_with_audit", { ...common, p_work_role_id: workRoleId, p_display_name: "Renamed current role", p_cost_rate_ore: 20000, p_sell_rate_ore: 40000 });
```

AFTER, precise semantics with illustrative new wire/property spellings:

```json
{
  "checked_rpc": "upsert_work_role_with_audit_v2",
  "identity": "Capture one fresh operationUUID before closure return; existing target workRoleId from seeded result; original correlation for that operation equals the UUID",
  "expected_facts": "Immediately after seed and before returning invoke/starting consumer row lock: actual authenticated fx.adminClient own-tenant select(id,write_revision).single() for workRoleId; require successful row and valid revision. Capture exact revision once; do not reread or allocate identity inside delayed invoke.",
  "candidate": {
    "display_name": "Renamed current role",
    "cost_rate_ore": 20000,
    "sell_rate_ore": 40000
  },
  "preserve": "Invoke remains actual authenticated checked production writer; returned RpcResult shape remains data:unknown/error. Keep prepareConsumedWriter lockSql/lockParams and all other writer branches unchanged.",
  "labels": "New input spellings illustrative; actual target-update discriminator must preserve create/update distinction."
}
```

Approved producer anchors: `producer-contract.md:29`, `producer-contract.md:31`, `producer-contract.md:41`, `producer-contract.md:45`, `producer-contract.md:59`, `producer-contract.md:73`, `producer-contract.md:93`, `producer-contract.md:104`, `producer-contract.md:107`. ACs: P-AC1, P-AC3, P-AC4, P-AC7.

### HELP-3 — `tests/support/booking-conflicts-atdd.ts:144` `prepareConsumedWriter returned invoke closure`

BEFORE, verbatim current source with LF normalization only:

```ts
      case "work_role_active": return fx.adminClient.rpc("set_work_role_active_with_audit", { ...common, p_work_role_id: workRoleId, p_is_active: false });
```

AFTER, precise semantics with illustrative new wire/property spellings:

```json
{
  "checked_rpc": "set_work_role_active_with_audit_v2",
  "identity": "Fresh captured operationUUID distinct from seed; lifecycle target is workRoleId; use it as original correlation",
  "expected_facts": "Same successful authenticated pre-barrier id/write_revision read, captured before closure return. No late rebase while row/tenant gate is blocked.",
  "candidate": {
    "is_active": false
  },
  "operation_kind": "work_role.archive (closed approved operation kind)",
  "preserve": "Keep real RPC call/error result, common tenant-lock before row-lock contract, lockSql/lockParams and every consumer assertion. No alternate rawDML, mocked completion or service role.",
  "labels": "Actual new wire argument names await bounded implementation, semantic requirement is fixed."
}
```

Approved producer anchors: `producer-contract.md:29`, `producer-contract.md:31`, `producer-contract.md:41`, `producer-contract.md:45`, `producer-contract.md:59`, `producer-contract.md:73`, `producer-contract.md:93`, `producer-contract.md:104`, `producer-contract.md:107`. ACs: P-AC1, P-AC3, P-AC4, P-AC7.

## Preserve the consumer lock-race proof

- prepareConsumedWriter runs before consumer adminSession begins and takes source row lock. Seed and baseline read must complete before that barrier.
- invoke uses exact captured facts/operation; it still reaches real checked SQL and holds same common tenant advisory gate before blocking on row. Never replace result or perform late reread/rebase.
- waitForBlocked observes one writer then two sessions, before-state equality through wait and pendingWriter.error null after commit remain unchanged.
- work_role_upsert changes only display text with same rates; consumer expects committed booking, unchanged detector factDigest, correct renamed role, exactlyone booking/audit and foreignstate unchanged.
- work_role_active archives required role; existing stale finalizer/noeffect/newcurrentreview/retry assertions remain unchanged. Other writer branches preserve previous semantics.
- Distinct seed/update/archive operation UUIDs, fixed audit/money/tenant checks and expected revision guard cannot be skipped to satisfy race tests.

Adapt exactly3oldRPCsites and their local pre-dispatch identity/revision/receipt projection in the shared helper so every existing consumer remains byte-for-byte. Do not edit booking-conflicts.int.test.ts or other consumers, assertions, writer-kind enumeration, barrier helpers, detection/proof code, factory/globalsetup, productionpermissions or oldgrantrevocation. No generic helper/framework introduced.

Consumer race block remains read-only at `tests/integration/commands/booking-conflicts.int.test.ts:268` (LF SHA256 `e27b8cf3d0ede23724337e2b02bb49aceea8ddeafa4faaa53bf7551469895cb5`). All assertions, public helper return shapes, eight writer-kind enumeration and barriers remain unchanged. No consumer file is requested for write.

## Provenance, current state and confirmation

Current helper SHA256 `73fbfab981b62391cfa1c5a7543d4eda14086c61a55dfdecb9f4316d740525d0`; consumer SHA256 `d7ac1a145578394763d65bd91f8df314254c54c51a5e4d407ce6ff31d3f69ed5`. Parent will request the one complete remaining allocation decision after separate narrow High confirmation. Prior two-file approval/review is retained, not superseded. No business question is reopened.

Root did start isolated runtime: Auth/REST/Storage health200 and PostgreSQL metadata showed0applied migrations/no domain or receipt tables against120source migrations; no repo migration/newmigration/seed applied and runtime tests0. Root then requested Stop, accepted native0/oktrue/stop_requested/verifiedfalse, preserving data/config. Endpoints are not assumed active; no shutdown polling. New refs/runtime use wait for admission.

This new helper proposal has no independent review yet. Scope is exact3sites plus local capture/readback/result projection only. Record desired context-free SolHigh route before Root dispatch; verdict may be PASS_FOR_ALLOCATION_DECISION, never implementation PASS. No product/test/frozen/source-binding writes, wrapper rerun, broad tests or runtime mutation occurred. Build remains incomplete and release_ready=false.
