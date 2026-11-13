/** 35.8-P P-2/P-3: real command/transaction acceptance; local stack only.
 * New wire-key spelling is a test-local scaffold, not a separate API decision.
 * Build may align spelling with the feature helper, preserving these assertions.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminExec, adminQuery, adminSession } from "../../factories/admin-sql";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import {
  createTwoTenantFixture, cleanupFixture, makeAuthedServerClient,
  adminInsertCustomer, adminInsertCalculation, adminInsertSection, adminInsertRow,
  type TwoTenantFixture, type TestServerClient,
} from "../../factories/tenants";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { runCommand } from "@/server/commands/envelope";
import { createCalculation, updateCalculation, archiveCalculation, updateRow, archiveSection, reorderRows } from "@/server/commands/calculations";

let up = false;
let fixture: TwoTenantFixture;
let actor: TestServerClient;
beforeAll(async () => {
  up = await isLocalStackReachable();
  if (!up) return;
  fixture = await createTwoTenantFixture();
  actor = await makeAuthedServerClient(fixture.adminA);
});
afterAll(async () => { if (up && fixture) await cleanupFixture(fixture); });

async function seed() {
  const tenant = fixture.tenantA.id;
  const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: "Safety fixture" });
  const calc = await adminInsertCalculation({ tenant_id: tenant, customer_id: customer, title: "Original" });
  const section = await adminInsertSection({ tenant_id: tenant, calculation_id: calc, title: "Original section" });
  const rows = await Promise.all([0, 1].map(sort_order => adminInsertRow({ tenant_id: tenant, section_id: section, label: `Rad ${sort_order}`, sort_order, unit_sell_ore: 10000 })));
  return { tenant, customer, calc, section, rows };
}
async function header(id: string) {
  return (await adminQuery("select id,title,status,archived_at,tax_input_snapshot from public.calculations where id=$1", [id]))[0];
}
async function sectionTree(id: string) {
  const section = (await adminQuery("select id,title,display_mode,sort_order,archived_at from public.calculation_sections where id=$1", [id]))[0];
  const rows = await adminQuery(`select id,section_id,row_type,quantity,unit,unit_cost_ore,unit_sell_ore,markup_bp,vat_rate_bp,
    included_in_invoice_total,deduction_classification,vat_type,is_hidden,is_optional,is_selected,label,description,internal_note,quote_note,sort_order,
    source_kind,source_id,source_name,source_price_ore,source_cost_ore,source_updated_at,source_captured_at,source_sku,source_unit
    from public.calculation_rows where section_id=$1 and archived_at is null order by id`, [id]);
  return { section, rows };
}
function intent(form: string, facts: object) {
  return { operation_id: crypto.randomUUID(), expected: { version: 1, form, ...facts } };
}
async function reconcile(operation: string) {
  const result = await actor.rpc("reconcile_calculation_editor_operation", { p_operation_id: operation });
  expect(result.error).toBeNull();
  return result.data;
}

describe("35.8-P calculation original-operation and atomic expected-content contract", () => {
  it("P-3 lost create response + concurrent original replay produces one target and one audit", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await seed();
    const op = intent("calculation", { customer_id: s.customer, facility_id: null, contact_id: null });
    const input = { customer_id: s.customer, title: `Lost ${op.operation_id}`, ...op };
    let dropped = false;
    const lossy = new Proxy(actor, { get(target, key) {
      if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
        const response = await target.rpc(name, args);
        if (name === "mutate_calculation_editor" && !response.error && !dropped) {
          dropped = true; // Database finished; the caller receives no authoritative result.
          throw new Error("synthetic post-commit transport loss");
        }
        return response;
      };
      const value = Reflect.get(target, key);
      return typeof value === "function" ? value.bind(target) : value;
    } });
    const lost = await runCommand(createCalculation, { client: lossy as never, input, correlationId: op.operation_id });
    expect(dropped).toBe(true);
    expect(lost.ok).toBe(false);
    const replies = await Promise.all([1, 2].map(() => runCommand(createCalculation, { client: actor as never, input, correlationId: op.operation_id })));
    expect(replies[0].ok).toBe(true);
    expect(replies[1]).toEqual(replies[0]);
    expect(await adminQuery("select id from public.calculations where title=$1 and tenant_id=$2", [input.title, s.tenant])).toHaveLength(1);
    expect(await adminSelectAuditEvents({ correlationId: op.operation_id })).toHaveLength(1);
    expect(await reconcile(op.operation_id)).toMatchObject({ status: "committed" });
  });

  it("P-3 proof is original immutable history after later edit/archive and privileged target removal", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await seed();
    const op = intent("calculation", { header: await header(s.calc) });
    const input = { id: s.calc, title: "Original committed edit", ...op };
    const first = await runCommand(updateCalculation, { client: actor as never, input, correlationId: op.operation_id });
    expect(first.ok).toBe(true);
    const proof = await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [op.operation_id]);
    await adminExec("update public.calculations set title='Later value',status='archived',archived_at=clock_timestamp() where id=$1", [s.calc]);
    expect(await runCommand(updateCalculation, { client: actor as never, input, correlationId: op.operation_id })).toEqual(first);
    expect((await header(s.calc)).title).toBe("Later value");
    // Test-owned privileged removal is intentional: no target FK may erase proof.
    await adminExec("delete from public.calculation_rows where section_id=$1", [s.section]);
    await adminExec("delete from public.calculation_sections where id=$1", [s.section]);
    await adminExec("delete from public.calculations where id=$1", [s.calc]);
    expect(await reconcile(op.operation_id)).toMatchObject({ status: "committed", targetAvailable: false });
    expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [op.operation_id])).toEqual(proof);
    expect(await adminSelectAuditEvents({ correlationId: op.operation_id })).toHaveLength(1);
  });

  it("P-3 absent reconciliation remains unconfirmed, not evidence of non-execution", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    expect(await reconcile(crypto.randomUUID())).toMatchObject({ status: "unconfirmed" });
  });

  it("P-2 rechecks original header after a competing transaction commits under the root lock", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await seed();
    const op = intent("calculation", { header: await header(s.calc) });
    let locked!: () => void;
    const ready = new Promise<void>(resolve => { locked = resolve; });
    let release!: () => void;
    const released = new Promise<void>(resolve => { release = resolve; });
    let holderPid = 0;
    const holder = adminSession(async session => {
      await session.query("begin");
      try {
        holderPid = (await session.query<{ pid: number }>("select pg_backend_pid() pid"))[0].pid;
        await session.query("select id from public.calculations where id=$1 for update", [s.calc]);
        await session.query("update public.calculations set title='Concurrent winner' where id=$1", [s.calc]);
        locked();
        await released;
        await session.query("commit");
      } catch (error) { await session.query("rollback"); throw error; }
    });
    // Observe holder failure too, so failed setup cannot hang the ready promise.
    await Promise.race([ready, holder]);
    const pending = runCommand(updateCalculation, { client: actor as never, input: { id: s.calc, title: "Stale loser", ...op }, correlationId: op.operation_id });
    try {
      // A real lock observation, not a timed guess that two requests overlapped.
      await expect.poll(async () => (await adminQuery<{ waiting: boolean }>(
        "select exists(select 1 from pg_stat_activity where $1::int=any(pg_blocking_pids(pid))) waiting", [holderPid],
      ))[0].waiting, { timeout: 5000 }).toBe(true);
    } finally { release(); await holder; }
    expect(await pending).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
    expect((await header(s.calc)).title).toBe("Concurrent winner");
    expect(await adminSelectAuditEvents({ correlationId: op.operation_id })).toEqual([]);
  });

  it("P-2 row original source/option facts and archive subtree membership cannot hide a newer child", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await seed();
    const original = await sectionTree(s.section);
    const rowOp = intent("row", { header: await header(s.calc), row: original.rows.find(row => row.id === s.rows[0]) });
    const archiveOp = intent("archive_section", { header: await header(s.calc), ...original });
    await adminExec("update public.calculation_rows set label='Newer child',is_optional=true,is_selected=false,included_in_invoice_total=false where id=$1", [s.rows[0]]);
    const before = await sectionTree(s.section);
    const row = await runCommand(updateRow, { client: actor as never, input: { id: s.rows[0], label: "Old draft", ...rowOp }, correlationId: rowOp.operation_id });
    const archive = await runCommand(archiveSection, { client: actor as never, input: { id: s.section, ...archiveOp }, correlationId: archiveOp.operation_id });
    expect(row).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
    expect(archive).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
    expect(await sectionTree(s.section)).toEqual(before);
    expect(await adminSelectAuditEvents({ correlationId: rowOp.operation_id })).toEqual([]);
    expect(await adminSelectAuditEvents({ correlationId: archiveOp.operation_id })).toEqual([]);
  });

  it("P-2 stale full sibling membership rejects reorder without changing any rank", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await seed();
    const siblings = (await sectionTree(s.section)).rows.map(row => ({ id: row.id, sort_order: row.sort_order }));
    const op = intent("reorder_rows", { header: await header(s.calc), siblings });
    await adminInsertRow({ tenant_id: s.tenant, section_id: s.section, label: "Concurrent insert", sort_order: 2 });
    const before = await sectionTree(s.section);
    expect(await runCommand(reorderRows, { client: actor as never, input: { section_id: s.section, ordered_row_ids: [...s.rows].reverse(), ...op }, correlationId: op.operation_id })).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
    expect(await sectionTree(s.section)).toEqual(before);
  });

  it("P-2 calculation archive compares the complete original active subtree", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await seed();
    const originalHeader = await header(s.calc);
    const op = intent("archive_calculation", { header: originalHeader, sections: [await sectionTree(s.section)] });
    await adminInsertSection({ tenant_id: s.tenant, calculation_id: s.calc, title: "Concurrent section", sort_order: 1 });
    expect(await runCommand(archiveCalculation, { client: actor as never, input: { id: s.calc, ...op }, correlationId: op.operation_id })).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
    expect(await header(s.calc)).toEqual(originalHeader);
    expect(await adminSelectAuditEvents({ correlationId: op.operation_id })).toEqual([]);
  });

  it.todo("P-2 complete original tax/section/row archive snapshots; disjoint header patch coexistence; sibling archive/reorder and complete duplicate-free permutations");
  it.todo("P-3 all eleven calculation effect kinds: post-commit loss, same intent serialization, changed payload/kind refusal and terminal closed replay");
  it.todo("P-3 forced existing audit-failure fixture: domain + required audit + committed proof roll back together; original identity safely retries");
  it.todo("P-2 existing source mutation interactions and row-limit recheck under root lock without new money rules");
});
