import { beforeAll, afterAll, test, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, makeAuthedServerClient, makeAnonServerClient, type RoleAwarePhaseAFixture } from "../../factories/tenants";
import { adminQuery } from "../../factories/admin-sql";
import { isLocalStackReachable, LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_ROLE_KEY } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { TENANT_ROLES } from "@/server/authz/roles";
import { TENANT_TABLES } from "./tenant-table-inventory";
let up = false, fx: RoleAwarePhaseAFixture;
const mutationNames = ["upsert_company_settings_with_audit_v2", "upsert_quote_terms_with_audit_v2", "approve_quote_terms_with_audit_v2", "upsert_work_role_with_audit_v2", "set_work_role_active_with_audit_v2", "upsert_article_with_audit_v2", "set_article_active_with_audit_v2"];
beforeAll(async () => { up = await isLocalStackReachable(); if (up)
    fx = await createRoleAwarePhaseAFixture(); });
afterAll(async () => { if (up)
    await cleanupRoleAwarePhaseAFixture(fx); });
function args(actor: string) { const id = crypto.randomUUID(); return { p_tenant_id: fx.base.tenantA.id, p_actor_user_id: actor, p_correlation_id: id, p_operation_id: id, p_target_id: crypto.randomUUID(), p_expected_revision: null, p_payload: { name: "RLS synthetic material", sku: null, unit: null, unit_price_ore: 1 } }; }
test("P-R1/P-R3 forced private receipt RLS, no policies/grants, helper closure and explicit checked owner ACLs", async (ctx) => {
    if (skipUnlessStack(ctx, up))
        return;
    expect(TENANT_TABLES).toContain("settings_pricing_operations");
    const [table] = await adminQuery<{
        rls: boolean;
        forced: boolean;
        policies: number;
    }>("select c.relrowsecurity rls,c.relforcerowsecurity forced,(select count(*)::int from pg_policy where polrelid=c.oid) policies from pg_class c where c.oid='public.settings_pricing_operations'::regclass");
    expect(table).toEqual({ rls: true, forced: true, policies: 0 });
    for (const role of ["anon", "authenticated", "service_role"]) {
        const [r] = await adminQuery<{
            allowed: boolean;
        }>("select has_table_privilege($1,'public.settings_pricing_operations','SELECT,INSERT,UPDATE,DELETE') allowed", [role]);
        expect(r.allowed).toBe(false);
    }
    const functions = await adminQuery<{
        name: string;
        definer: boolean;
        owner: string;
        config: string[];
        auth: boolean;
        anon: boolean;
        service: boolean;
        public_execute: boolean;
    }>(`select p.proname name,p.prosecdef definer,pg_get_userbyid(p.proowner) owner,p.proconfig config,has_function_privilege('authenticated',p.oid,'EXECUTE') auth,has_function_privilege('anon',p.oid,'EXECUTE') anon,has_function_privilege('service_role',p.oid,'EXECUTE') service,exists(select 1 from aclexplode(p.proacl) a where grantee=0 and privilege_type='EXECUTE') public_execute from pg_proc p where p.pronamespace='public'::regnamespace and p.proname=any($1::text[])`, [[...mutationNames, "reconcile_settings_pricing_operation"]]);
    expect(functions).toHaveLength(8);
    for (const fn of functions) {
        expect(fn).toMatchObject({ definer: true, owner: "postgres", config: ['search_path=""'], auth: true, anon: false, service: false, public_execute: false });
    }
    const helpers = await adminQuery<{
        name: string;
        allowed: boolean;
    }>("select proname name,has_function_privilege('authenticated',oid,'EXECUTE') or has_function_privilege('anon',oid,'EXECUTE') or has_function_privilege('service_role',oid,'EXECUTE') allowed from pg_proc where pronamespace='public'::regnamespace and proname like 'settings_pricing_%_internal'");
    expect(helpers.length).toBeGreaterThanOrEqual(4);
    for (const helper of helpers)
        expect(helper.allowed).toBe(false);
    const old = await adminQuery<{
        name: string;
        allowed: boolean;
    }>("select proname name,has_function_privilege('authenticated',oid,'EXECUTE') or has_function_privilege('anon',oid,'EXECUTE') or has_function_privilege('service_role',oid,'EXECUTE') allowed from pg_proc where pronamespace='public'::regnamespace and proname=any($1::text[])", [mutationNames.map(x => x.replace(/_v2$/, ""))]);
    expect(old).toHaveLength(7);
    for (const fn of old)
        expect(fn.allowed).toBe(false);
});
for (const role of TENANT_ROLES)
    test(`P-R1 ${role}: current exact pricing/company capability and no direct receipt access`, async (ctx) => {
        if (skipUnlessStack(ctx, up))
            return;
        const user = fx.users[role], client = await makeAuthedServerClient(user);
        const input = args(user.id);
        const result = await client.rpc("upsert_article_with_audit_v2", input);
        if (role === "tenant_admin" || role === "projektledare") {
            expect(result.error).toBeNull();
            expect(result.data).toMatchObject({ operationId: input.p_operation_id, targetId: input.p_target_id });
        }
        else {
            expect(result.error?.code).toBe("42501");
            expect(await adminQuery("select id from public.settings_pricing_operations where id=$1", [input.p_operation_id])).toEqual([]);
        }
        const companyId = crypto.randomUUID();
        const company = { ...args(user.id), p_operation_id: companyId, p_correlation_id: companyId, p_payload: { company_name: "RLS Company", org_nr: null, address_line1: null, address_line2: null, postal_code: null, city: null, email: null, phone: null, logo_url: null, logo_url_present: false, default_vat_display: "company_excl", vat_rate_bp: 2500 } };
        const saved = await client.rpc("upsert_company_settings_with_audit_v2", company);
        if (role === "tenant_admin")
            expect(saved.error).toBeNull();
        else
            expect(saved.error?.code).toBe("42501");
        for (const action of [client.from("settings_pricing_operations").select("*"), client.from("settings_pricing_operations").insert({ id: crypto.randomUUID(), tenant_id: fx.base.tenantA.id }), client.from("settings_pricing_operations").update({ request_digest: "a".repeat(64) }).eq("id", input.p_operation_id), client.from("settings_pricing_operations").delete().eq("id", input.p_operation_id)])
            expect((await action).error?.code).toBe("42501");
    });
test("P-R3 anonymous/service-role cannot execute checked RPCs, missing preconditions cannot use v2", async (ctx) => {
    if (skipUnlessStack(ctx, up))
        return;
    const anon = await makeAnonServerClient(), service = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const input = args(fx.base.adminA.id);
    for (const client of [anon, service]) {
        expect((await client.rpc("upsert_article_with_audit_v2", input)).error?.code).toBe("42501");
        expect((await client.rpc("reconcile_settings_pricing_operation", { ...input, p_operation_kind: "article.create" })).error?.code).toBe("42501");
        expect((await client.from("settings_pricing_operations").select("*")).error?.code).toBe("42501");
    }
    const admin = await makeAuthedServerClient(fx.base.adminA);
    const missing = { p_tenant_id: input.p_tenant_id, p_actor_user_id: input.p_actor_user_id, p_payload: input.p_payload };
    expect((await admin.rpc("upsert_article_with_audit_v2", missing)).error).not.toBeNull();
    expect(await adminQuery("select id from public.articles where id=$1", [input.p_target_id])).toEqual([]);
});
