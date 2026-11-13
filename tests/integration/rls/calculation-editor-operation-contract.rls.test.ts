/** 35.8-P P-5: database-enforced proof privacy and closure of legacy write paths. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminQuery, closeAdminPool } from "../../factories/admin-sql";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { assertSearchPathExactlyEmpty } from "../../support/search-path";

let up = false;
beforeAll(async () => { up = await isLocalStackReachable(); });
afterAll(async () => { await closeAdminPool(); });
const wrappers = ["mutate_calculation_editor", "authorize_calculation_editor_quote", "create_calculation_editor_quote", "reconcile_calculation_editor_operation"];
const oldEntries = ["create_calculation_with_audit", "update_calculation_with_audit", "archive_calculation_with_audit", "reorder_calculation_rows", "reorder_calculation_sections", "authorize_quote_initial_review", "authorize_quote_initial_customer_visible_review", "create_quote_version_from_calculation"];

describe("35.8-P calculation editor operation SQL contract", () => {
  it("P-5 proof table forces RLS and denies every direct application-role table privilege", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const relation = await adminQuery("select relrowsecurity,relforcerowsecurity from pg_class where oid=to_regclass('public.calculation_editor_operations')");
    expect(relation).toEqual([{ relrowsecurity: true, relforcerowsecurity: true }]);
    // Effective privilege check includes inherited PUBLIC grants, unlike checking
    // only literal authenticated grant rows. Owner maintenance remains separate.
    const grants = await adminQuery(
      `select role_name,privilege from
       (values ('public'),('anon'),('authenticated'),('service_role')) r(role_name)
       cross join (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) v(privilege)
       where has_table_privilege(role_name,'public.calculation_editor_operations',privilege)`,
    );
    expect(grants).toEqual([]);
  });

  it("P-5 exactly four public checked RPC names are authenticated-only SECURITY DEFINER with empty search_path", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const functions = await adminQuery<{ proname: string; prosecdef: boolean; proconfig: string[] | null; authed: boolean; anon: boolean; service: boolean; public_role: boolean }>(
      `select p.proname,p.prosecdef,p.proconfig,
       has_function_privilege('authenticated',p.oid,'EXECUTE') authed,
       has_function_privilege('anon',p.oid,'EXECUTE') anon,
       has_function_privilege('service_role',p.oid,'EXECUTE') service,
       has_function_privilege('public',p.oid,'EXECUTE') public_role
       from pg_proc p where p.pronamespace='public'::regnamespace and p.proname=any($1::text[])`, [wrappers],
    );
    expect(functions.map(fn => fn.proname).sort()).toEqual([...wrappers].sort());
    for (const fn of functions) {
      expect(fn).toMatchObject({ prosecdef: true, authed: true, anon: false, service: false, public_role: false });
      assertSearchPathExactlyEmpty(fn.proname, fn.proconfig ?? []);
    }
  });

  it("P-5 old header/reorder/initial quote entries cannot bypass operation or expected-fact predicates", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const bypass = await adminQuery(
      `select p.proname,r.role_name from pg_proc p
       cross join (values ('public'),('anon'),('authenticated'),('service_role')) r(role_name)
       where p.pronamespace='public'::regnamespace and p.proname=any($1::text[])
       and has_function_privilege(r.role_name,p.oid,'EXECUTE')`, [oldEntries],
    );
    expect(bypass).toEqual([]);
    const directDml = await adminQuery(
      `select t.table_name,v.privilege from
       (values ('calculations'),('calculation_sections'),('calculation_rows')) t(table_name)
       cross join (values ('INSERT'),('UPDATE'),('DELETE')) v(privilege)
       where has_table_privilege('authenticated','public.'||table_name,privilege)`,
    );
    expect(directDml).toEqual([]);
  });

  it("P-3/P-5 durable proof cannot cascade away with actor/target removal or store source text/money/tax payload", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const fks = await adminQuery<{ target: string; confdeltype: string }>(
      `select confrelid::regclass::text target,confdeltype from pg_constraint
       where conrelid='public.calculation_editor_operations'::regclass and contype='f'`,
    );
    expect(fks.filter(fk => fk.target !== "tenants" && fk.target !== "public.tenants" && fk.confdeltype === "c")).toEqual([]);
    const columns = await adminQuery<{ column_name: string }>(
      "select column_name from information_schema.columns where table_schema='public' and table_name='calculation_editor_operations'",
    );
    expect(columns.length).toBeGreaterThan(0);
    for (const { column_name } of columns) {
      expect(column_name).not.toMatch(/^(title|label|description|tax_input_snapshot|expected|expected_facts|input|payload|snapshot|attachments|unit_.*_ore)$/);
    }
  });

  it.todo("P-1/P-5 direct authenticated mutate RPC normalizes typed input and computes binding; forged supplied digest cannot substitute another payload or kind");
  it.todo("P-5 real same-tenant second actor/foreign tenant/forged parent cannot reuse proof; current membership and exact capability checked before lookup/replay");
  it.todo("P-5 seller cannot read internal calculation fields through prepare/create/reconcile; denied old direct DML and helper calls preserve zero effects");
  it.todo("P-3 SQL refuses committed/closed proof mutation; unique bound authorization and concurrent identity reservation are enforced");
});
