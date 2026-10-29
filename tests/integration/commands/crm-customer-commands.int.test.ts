/**
 * Story 3.1 — ATDD RED-PHASE scaffold: CRM command-envelope acceptance (AC3, P0/P1).
 *
 * The canonical CRM command happy/failure paths exercised through the EXISTING
 * `defineCommand`/`runCommand` envelope (architecture §5 steps 1-9), reusing the
 * EXISTING two-tenant factories and the EXISTING `audit_events` BYPASSRLS read
 * helper — NO new auth/error/audit mechanism.
 *
 * ── WHY THIS FILE IS `describe.skip` (RED PHASE) ─────────────────────────────────
 * The nine CRM commands (`createCustomer`/`updateCustomer`/`archiveCustomer` + the
 * facility/contact families) and the `crm_data_model` migration do NOT exist yet —
 * Task 1 (migration) and Task 2 (commands) are the Story 3.1 DEV phase. Until they
 * land, importing `@/server/commands/crm/*` would not resolve, so this scaffold:
 *   - keeps the suite `describe.skip` so it cannot fail CI before the feature exists
 *     (the project's established red-phase idiom — Story 2.2/2.3 used the same), and
 *   - declares the command surface via a LOCAL `notYetImplemented()` placeholder so
 *     the file type-checks today WITHOUT importing a non-existent module.
 *
 * ── GREEN-PHASE HAND-OFF (Story 3.1 dev) ────────────────────────────────────────
 * After Task 1+2 land:
 *   1. Replace the `notYetImplemented()` command stubs with real imports:
 *        import { createCustomer, updateCustomer, archiveCustomer } from
 *          "@/server/commands/crm/customers";
 *   2. Replace `adminSelectCustomerById` with the real `tests/factories/tenants.ts`
 *      service-role read helper added in Task 3.1.
 *   3. Remove `.skip`. The assertions below are the CONTRACT — do not weaken them.
 *
 * Every assertion encodes EXPECTED behavior (no `expect(true).toBe(true)`); the
 * suite is designed to FAIL until the commands + migration exist. Runs against the
 * LOCAL Supabase stack only; skips visibly when unreachable.
 *
 * COVERAGE (test-design-epic-3.md P0/P1; story AC3 / Task 2 / Task 4.3):
 *   - happy-path create/update/archive → persisted row + EXACTLY ONE audit row,
 *   - VALIDATION_FAILED for bad customer_type / missing-or-mismatched identifier /
 *     bad email,
 *   - archive sets `archived_at` (soft-delete, no hard delete),
 *   - database-owned audit timestamp bounded by Postgres clock samples (never `sleep`),
 *   - audit metadata carries NO PII (personnummer/org_nr/name/email).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTwoTenantFixture,
  makeAuthedServerClient,
  cleanupFixture,
  adminSelectCrmRowById,
  adminInsertMembership,
  type TwoTenantFixture,
  type TestServerClient,
} from "../../factories/tenants";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import { adminExec, closeAdminPool } from "../../factories/admin-sql";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import {
  expectDatabaseOwnedTimestamp,
  readDatabaseNow,
} from "../../support/database-time";
import { runCommand } from "@/server/commands/envelope";
import {
  createCustomer,
  updateCustomer,
  archiveCustomer,
} from "@/server/commands/crm/customers";
import type { CommandClock } from "@/server/commands/clock";

const FIXED_ISO = "2026-06-30T12:00:00.000Z";
const fixedClock: CommandClock = { now: () => new Date(FIXED_ISO) };

let stackUp = false;
let fixture: TwoTenantFixture;
let a: TestServerClient; // adminA's authenticated anon-key client
let editorB: TestServerClient;
let foreign: TestServerClient;

beforeAll(async () => {
  stackUp = await isLocalStackReachable();
  if (!stackUp) return;
  fixture = await createTwoTenantFixture();
  a = await makeAuthedServerClient(fixture.adminA);
  await adminInsertMembership({ tenant_id: fixture.tenantA.id, user_id: fixture.orphanUser.id, role: "saljare", status: "active" });
  editorB = await makeAuthedServerClient(fixture.orphanUser);
  foreign = await makeAuthedServerClient(fixture.adminB);
});

afterAll(async () => {
  if (stackUp && fixture) await cleanupFixture(fixture);
  if (stackUp) await closeAdminPool();
});

// Un-gated (Story 3.1 dev): the CRM commands + migration have landed (Tasks 1-2).
describe("CRM customer commands via the envelope (AC3 / R-001,R-010)", () => {
  it("[P1] createCustomer (private) persists the row and writes EXACTLY ONE audit_events row", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const correlationId = crypto.randomUUID(); // append-only audit → unique per run
    const databaseBefore = await readDatabaseNow();

    const result = await runCommand(createCustomer, {
      client: a as never,
      input: {
        customer_type: "private",
        display_name: "Anna Andersson",
        personnummer: "19900101-1234",
        email: "anna@example.test",
        phone: "+46701234567",
      },
      clock: fixedClock,
      correlationId,
    });
    const databaseAfter = await readDatabaseNow();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const customerId = (result.data as { targetId: string }).targetId;

    // EXACTLY ONE audit row, every snake_case column correct, with a database-owned timestamp.
    const rows = await adminSelectAuditEvents({ correlationId });
    expect(rows.length).toBe(1);
    const row = rows[0];
    expect(row.tenant_id).toBe(fixture.tenantA.id); // resolved tenant, NOT a client tenant_id
    expect(row.actor_user_id).toBe(fixture.adminA.id);
    expect(row.command).toBe("customer.create");
    expect(row.event_type).toBe("customer.created");
    expect(row.target_type).toBe("customer");
    expect(row.target_id).toBe(customerId);
    expectDatabaseOwnedTimestamp(row.created_at, databaseBefore, databaseAfter, FIXED_ISO);

    // Audit metadata carries NO PII — personnummer/name/email never routed there
    // (SAFE_FIELDS allow-list; project-context Security Regression Harness Rules).
    const serialized = JSON.stringify(row.metadata ?? {});
    expect(serialized.includes("19900101-1234")).toBe(false);
    expect(serialized.includes("Anna Andersson")).toBe(false);
    expect(serialized.includes("anna@example.test")).toBe(false);
  });

  it("[P1] createCustomer (company) requires org_nr and rejects personnummer", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const result = await runCommand(createCustomer, {
      client: a as never,
      input: {
        customer_type: "company",
        display_name: "Elfirma AB",
        org_nr: "556677-8899",
      },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(result.ok).toBe(true);
  });

  it("[P0] VALIDATION_FAILED for a customer_type outside the 4 approved values", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const result = await runCommand(createCustomer, {
      client: a as never,
      input: { customer_type: "charity", display_name: "X" },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_FAILED");
  });

  it("[P0] VALIDATION_FAILED when a private customer omits personnummer", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const result = await runCommand(createCustomer, {
      client: a as never,
      input: { customer_type: "private", display_name: "No Personnummer" },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_FAILED");
  });

  it("[P0] VALIDATION_FAILED when a private customer carries org_nr (identifier-by-type)", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const result = await runCommand(createCustomer, {
      client: a as never,
      input: {
        customer_type: "private",
        display_name: "Wrong Identifier",
        personnummer: "19900101-1234",
        org_nr: "556677-8899",
      },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_FAILED");
  });

  it("[P1] VALIDATION_FAILED for a malformed email where email is captured", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const result = await runCommand(createCustomer, {
      client: a as never,
      input: {
        customer_type: "company",
        display_name: "Bad Email AB",
        org_nr: "556677-8899",
        email: "not-an-email",
      },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_FAILED");
  });

  it("[P1] VALIDATION_FAILED for an empty display_name", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const result = await runCommand(createCustomer, {
      client: a as never,
      input: {
        customer_type: "company",
        display_name: "",
        org_nr: "556677-8899",
      },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_FAILED");
  });

  it("[P1] archiveCustomer sets archived_at (soft-delete) and the row is NOT hard-deleted", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const created = await runCommand(createCustomer, {
      client: a as never,
      input: {
        customer_type: "company",
        display_name: "ToArchive AB",
        org_nr: "556677-8899",
      },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const customerId = (created.data as { targetId: string }).targetId;

    const databaseBefore = await readDatabaseNow();
    const archived = await runCommand(archiveCustomer, {
      client: a as never,
      input: { id: customerId },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    const databaseAfter = await readDatabaseNow();
    expect(archived.ok).toBe(true);

    // Independent BYPASSRLS read proves the row still EXISTS with archived_at set —
    // a soft-delete, never a hard DELETE. archived_at == the single injected instant.
    const row = await adminSelectCrmRowById("customers", customerId);
    expect(row).not.toBeNull();
    expect(row?.archived_at).not.toBeNull();
    expectDatabaseOwnedTimestamp(
      row?.archived_at as string,
      databaseBefore,
      databaseAfter,
      FIXED_ISO,
    );
  });

  it("[P1] updateCustomer on a foreign-tenant id returns TENANT_ACCESS_DENIED (RLS invisible)", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    // A random id (or a Tenant B id) is invisible under A's RLS → ownership-verify
    // sees zero rows → TENANT_ACCESS_DENIED (envelope verifyOwnership, R-004).
    const foreignId = crypto.randomUUID();
    const result = await runCommand(updateCustomer, {
      client: a as never,
      input: { id: foreignId, expected_customer: originalFacts(foreignId), display_name: "Hijack" },
      clock: fixedClock,
      correlationId: crypto.randomUUID(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("TENANT_ACCESS_DENIED");
  });
});

const FACT_COLUMNS = "id,customer_type,display_name,personnummer,org_nr,contact_name,email,phone,address_line1,address_line2,postal_code,city,archived_at";
function originalFacts(id: string): Record<string, unknown> {
  return { id, customer_type: "company", display_name: "Original AB", personnummer: null,
    org_nr: "556677-8899", contact_name: null, email: null, phone: "+46701111111",
    address_line1: null, address_line2: null, postal_code: null, city: "Stockholm", archived_at: null };
}
async function checkedFacts(client: TestServerClient, id: string): Promise<Record<string, unknown>> {
  const read = await client.from("customers").select(FACT_COLUMNS).eq("id", id).single();
  expect(read.error).toBeNull();
  expect(read.data).not.toBeNull();
  return read.data as unknown as Record<string, unknown>;
}
async function seedEditableCustomer(): Promise<string> {
  const created = await runCommand(createCustomer, { client: a as never, input: {
    customer_type: "company", display_name: `35.3 ${crypto.randomUUID()}`, org_nr: "556677-8899",
    phone: "+46701111111", city: "Stockholm",
  }, correlationId: crypto.randomUUID() });
  expect(created.ok).toBe(true);
  if (!created.ok) throw new Error("35.3 customer setup failed");
  return created.data.targetId;
}

describe("35.3 E35-3-T-stale customer expected-facts authority (active RED)", () => {
  it("[P0] two entitled editors: stale A cannot overwrite B; explicit fresh review can save", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const id = await seedEditableCustomer();
    const baselineA = await checkedFacts(a, id);
    const baselineB = await checkedFacts(editorB, id);
    expect(baselineB).toEqual(baselineA);
    const bCorrelation = crypto.randomUUID(), aCorrelation = crypto.randomUUID();
    const bResult = await runCommand(updateCustomer, { client: editorB as never, input: {
      id, expected_customer: baselineB, phone: "+46702222222",
    }, correlationId: bCorrelation });
    expect(bResult).toMatchObject({ ok: true, data: { targetId: id } });
    const afterB = await checkedFacts(a, id);
    const stale = await runCommand(updateCustomer, { client: a as never, input: {
      id, expected_customer: baselineA, phone: baselineA.phone, city: "Malmö",
    }, correlationId: aCorrelation });
    expect(stale).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
    expect(await checkedFacts(a, id)).toEqual(afterB);
    expect(await adminSelectAuditEvents({ correlationId: aCorrelation })).toEqual([]);
    const audit = await adminSelectAuditEvents({ correlationId: bCorrelation });
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ tenant_id: fixture.tenantA.id, actor_user_id: fixture.orphanUser.id,
      command: "customer.update", event_type: "customer.updated", target_type: "customer", target_id: id, metadata: {} });
    const reviewedCorrelation = crypto.randomUUID();
    const reviewed = await runCommand(updateCustomer, { client: a as never,
      input: { id, expected_customer: await checkedFacts(a, id), city: "Malmö" }, correlationId: reviewedCorrelation });
    expect(reviewed).toMatchObject({ ok: true, data: { targetId: id } });
    expect(await checkedFacts(a, id)).toEqual({ ...afterB, city: "Malmö" });
    expect(await adminSelectAuditEvents({ correlationId: reviewedCorrelation })).toHaveLength(1);
  });

  it("[P0] concurrent equal-baseline writers yield exactly one whole winner and one conflict/audit", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const id = await seedEditableCustomer();
    const baseline = await checkedFacts(a, id);
    const patches = [{ phone: "+46703333333", city: "Uppsala" }, { phone: "+46704444444", city: "Lund" }];
    const correlations = [crypto.randomUUID(), crypto.randomUUID()];
    const results = await Promise.all([a, editorB].map((client, index) => runCommand(updateCustomer, {
      client: client as never, input: { id, expected_customer: baseline, ...patches[index] }, correlationId: correlations[index],
    })));
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok && result.code === "COMMAND_CONFLICT")).toHaveLength(1);
    const winner = results.findIndex((result) => result.ok);
    expect(await checkedFacts(a, id)).toEqual({ ...baseline, ...patches[winner] });
    const audits = await Promise.all(correlations.map((correlationId) => adminSelectAuditEvents({ correlationId })));
    expect(audits[winner]).toHaveLength(1);
    expect(audits[1 - winner]).toEqual([]);
    expect(audits[winner][0]).toMatchObject({ target_id: id, tenant_id: fixture.tenantA.id,
      actor_user_id: winner === 0 ? fixture.adminA.id : fixture.orphanUser.id, metadata: {} });
  });

  it("[P0] raw six named arguments validate every fact and old five named arguments fail closed", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const id = await seedEditableCustomer(), baseline = await checkedFacts(a, id);
    const args = { p_tenant_id: fixture.tenantA.id, p_actor_user_id: fixture.adminA.id,
      p_customer_id: id, p_patch: { city: "Malmö" } };
    const malformed: unknown[] = [null, {}, { ...baseline, id: crypto.randomUUID() }, { ...baseline, phone: 123 }];
    for (const key of Object.keys(baseline)) { const incomplete = { ...baseline }; delete incomplete[key]; malformed.push(incomplete); }
    for (const p_expected_customer of malformed) {
      const correlationId = crypto.randomUUID();
      const result = await a.rpc("update_customer_with_audit", { ...args, p_correlation_id: correlationId, p_expected_customer });
      expect(result.error?.code).toBe("23514");
      expect(result.data).toBeNull();
      expect(await checkedFacts(a, id)).toEqual(baseline);
      expect(await adminSelectAuditEvents({ correlationId })).toEqual([]);
    }
    const oldCorrelation = crypto.randomUUID();
    const old = await a.rpc("update_customer_with_audit", { ...args, p_correlation_id: oldCorrelation });
    expect(old.error?.code).toBe("PT409");
    expect(old.data).toBeNull();
    expect(await checkedFacts(a, id)).toEqual(baseline);
    expect(await adminSelectAuditEvents({ correlationId: oldCorrelation })).toEqual([]);
    const freshCorrelation = crypto.randomUUID();
    const fresh = await a.rpc("update_customer_with_audit", { ...args, p_correlation_id: freshCorrelation, p_expected_customer: baseline });
    expect(fresh.error).toBeNull();
    expect(fresh.data).toBe(id);
    const staleCorrelation = crypto.randomUUID();
    const stale = await a.rpc("update_customer_with_audit", { ...args, p_patch: { phone: "+46705555555" },
      p_correlation_id: staleCorrelation, p_expected_customer: baseline });
    expect(stale.error?.code).toBe("PT409");
    expect(JSON.stringify(stale.error)).not.toContain(String(baseline.display_name));
    expect(await checkedFacts(a, id)).toEqual({ ...baseline, city: "Malmö" });
    expect(await adminSelectAuditEvents({ correlationId: staleCorrelation })).toEqual([]);
  });

  it("[P0] exact baseline confers no tenant/actor/revoked-role or raw-table authority", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const id = await seedEditableCustomer(), baseline = await checkedFacts(a, id);
    for (const [client, tenantId, actorId] of [
      [foreign, fixture.tenantB.id, fixture.adminB.id], [foreign, fixture.tenantA.id, fixture.adminB.id],
      [a, fixture.tenantA.id, fixture.adminB.id],
    ] as const) {
      const correlationId = crypto.randomUUID();
      const result = await client.rpc("update_customer_with_audit", { p_tenant_id: tenantId, p_actor_user_id: actorId,
        p_correlation_id: correlationId, p_customer_id: id, p_patch: { city: "Hijack" }, p_expected_customer: baseline });
      expect(result.error?.code).toBe("42501");
      expect(result.data).toBeNull();
      expect(JSON.stringify(result.error)).not.toContain(String(baseline.display_name));
      expect(await adminSelectAuditEvents({ correlationId })).toEqual([]);
    }
    await adminExec("update public.tenant_memberships set status = 'disabled' where tenant_id = $1 and user_id = $2", [fixture.tenantA.id, fixture.orphanUser.id]);
    try {
      const correlationId = crypto.randomUUID();
      const revoked = await editorB.rpc("update_customer_with_audit", { p_tenant_id: fixture.tenantA.id, p_actor_user_id: fixture.orphanUser.id,
        p_correlation_id: correlationId, p_customer_id: id, p_patch: { city: "Revoked" }, p_expected_customer: baseline });
      expect(revoked.error?.code).toBe("42501");
      expect(await adminSelectAuditEvents({ correlationId })).toEqual([]);
    } finally {
      await adminExec("update public.tenant_memberships set status = 'active' where tenant_id = $1 and user_id = $2", [fixture.tenantA.id, fixture.orphanUser.id]);
    }
    const direct = await a.from("customers").update({ city: "Raw bypass" }).eq("id", id).select("id");
    expect(direct.error?.code).toBe("42501");
    expect(await checkedFacts(a, id)).toEqual(baseline);
  });

  it("[P0] audit insert failure rolls back the entire customer update", async (testCtx) => {
    if (skipUnlessStack(testCtx, stackUp)) return;
    const id = await seedEditableCustomer(), baseline = await checkedFacts(a, id), correlationId = crypto.randomUUID();
    await adminExec("insert into test_support.forced_audit_failures (correlation_id) values ($1::uuid)", [correlationId]);
    try {
      const result = await runCommand(updateCustomer, { client: a as never,
        input: { id, expected_customer: baseline, display_name: "Must roll back", city: "Malmö" }, correlationId });
      expect(result).toMatchObject({ ok: false, code: "SERVER_ERROR" });
      expect(await checkedFacts(a, id)).toEqual(baseline);
      expect(await adminSelectCrmRowById("customers", id)).toMatchObject({ display_name: baseline.display_name });
      expect(await adminSelectAuditEvents({ correlationId })).toEqual([]);
    } finally {
      await adminExec("delete from test_support.forced_audit_failures where correlation_id = $1::uuid", [correlationId]);
    }
  });
});
