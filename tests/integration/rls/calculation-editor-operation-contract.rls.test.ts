/** 35.8-P P-5: database-enforced proof privacy and closure of legacy write paths. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminExec, adminQuery, closeAdminPool } from "../../factories/admin-sql";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { assertSearchPathExactlyEmpty } from "../../support/search-path";

import { createRoleAwarePhaseAFixture,cleanupRoleAwarePhaseAFixture,makeAuthedServerClient,adminInsertCustomer,adminInsertCalculation,adminInsertSection,adminInsertRow,type RoleAwarePhaseAFixture,type TestServerClient } from "../../factories/tenants";
import { captureEditorTestIntent } from "../commands/calculation-editor-safety-fixture";
import { runCommand } from "@/server/commands/envelope";
import { createQuoteVersionFromCalculation } from "@/server/commands/quotes";
import { buildFreshQuoteSnapshotFromCustomerVisibleSource } from "@/server/commands/quotes/snapshot-build";
import { loadQuoteInitialCustomerVisibleSource,buildQuoteInitialCustomerVisibleReviewDigest } from "@/server/commands/quotes/quote-initial-source-db";
let fixture:RoleAwarePhaseAFixture,actor:TestServerClient,pm:TestServerClient,seller:TestServerClient,foreign:TestServerClient;
let up = false;
beforeAll(async () => { up = await isLocalStackReachable();if(!up)return;fixture=await createRoleAwarePhaseAFixture();[actor,pm,seller,foreign]=await Promise.all([fixture.base.adminA,fixture.users.projektledare,fixture.users.saljare,fixture.base.adminB].map(makeAuthedServerClient)); });
afterAll(async () => { if(up&&fixture)await cleanupRoleAwarePhaseAFixture(fixture);await closeAdminPool(); });
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


  it("P-1/P-5 direct RPC typed canonical binding rejects forged digest, extra keys and changed payload/kind",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await source();const input={id:s.calc,title:" Canonical "};const safety=await captureEditorTestIntent("calculation.update",input);const request={...input,...safety};
    for(const changed of [{...request,request_digest:"a".repeat(64)},{...request,title:42},{...request,expected:{...safety.expected,extra:true}}])expect((await mutate(actor,changed)).error).not.toBeNull();
    const first=await mutate(actor,request);expect(first.error).toBeNull();expect(first.data).toMatchObject({status:"committed"});
    expect(await mutate(actor,{...request,title:"Canonical"})).toEqual(first);
    expect((await mutate(actor,{...request,title:"Different"})).error?.code).toBe("CE409");
    expect((await mutate(actor,request,"calculation.archive")).error).not.toBeNull();
    expect(await adminQuery("select title from public.calculations where id=$1",[s.calc])).toEqual([{title:"Canonical"}]);
  });

  it("P-5 same-tenant other actor, foreign tenant, forged actor and revoked member cannot replay/read proof",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await source();const input={id:s.calc,title:"Original"};const safety=await captureEditorTestIntent("calculation.update",input);const request={...input,...safety};
    const result=await mutate(pm,request,"calculation.update",fixture.users.projektledare.id);expect(result.error).toBeNull();
    for(const client of [actor,foreign]){
      expect((await client.rpc("reconcile_calculation_editor_operation",{p_operation_id:safety.operation_id})).error?.code).toBe("42501");
    }
    expect((await mutate(actor,request,"calculation.update",fixture.users.projektledare.id)).error?.code).toBe("42501");
    expect((await mutate(foreign,request,"calculation.update",fixture.base.adminB.id,fixture.base.tenantB.id)).error?.code).toBe("42501");
    await adminExec("update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",[s.tenant,fixture.users.projektledare.id]);
    try{
      expect((await mutate(pm,request,"calculation.update",fixture.users.projektledare.id)).error?.code).toBe("42501");
      expect((await pm.rpc("reconcile_calculation_editor_operation",{p_operation_id:safety.operation_id})).error?.code).toBe("42501");
    }finally{await adminExec("update public.tenant_memberships set status='active' where tenant_id=$1 and user_id=$2",[s.tenant,fixture.users.projektledare.id]);}
    const foreignCustomer=await adminInsertCustomer({tenant_id:fixture.base.tenantB.id,customer_type:"company",display_name:"Foreign"});
    const forged={customer_id:foreignCustomer,title:"Denied"};const create=await captureEditorTestIntent("calculation.create",forged);
    expect((await mutate(actor,{...forged,...create},"calculation.create")).error?.code).toBe("42501");
    expect(await adminQuery("select operation_id from public.calculation_editor_operations where operation_id=$1",[create.operation_id])).toEqual([]);
  });

  it("P-5 seller prepare/create/reconcile/replay exposes only proof and customer-visible source, never internal costs",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await source();const capturedAt="2026-11-13T10:00:00Z";
    const projected=await loadQuoteInitialCustomerVisibleSource(seller as never,{p_tenant_id:s.tenant,p_calculation_id:s.calc,p_requested_attachment_ids:[],p_actor_user_id:fixture.users.saljare.id});
    const built=buildFreshQuoteSnapshotFromCustomerVisibleSource(projected.source,{calculationId:s.calc,capturedAt});
    const reviewed={reviewed_snapshot_digest:buildQuoteInitialCustomerVisibleReviewDigest(projected.source,built),reviewed_quote_capture_date:built.quoteCaptureDate};const domain={calculation_id:s.calc,attachment_file_ids:[],...reviewed};const safety=await captureEditorTestIntent("quote.version.create",domain);const input={...domain,...safety};
    let prepared=false;
    const loss=new Proxy(seller,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{if(name==="create_calculation_editor_quote"&&prepared)throw new Error("before create");const response=await target.rpc(name,args);if(name==="authorize_calculation_editor_quote"&&!response.error)prepared=true;return response;};const value=Reflect.get(target,key);return typeof value==="function"?value.bind(target):value;}});
    expect((await runCommand(createQuoteVersionFromCalculation,{client:loss as never,input,correlationId:safety.operation_id,clock:{now:()=>new Date(capturedAt)}})).ok).toBe(false);expect(prepared).toBe(true);
    const preparedProof=await seller.rpc("reconcile_calculation_editor_operation",{p_operation_id:safety.operation_id});expect(preparedProof.error).toBeNull();expect(preparedProof.data).toMatchObject({status:"unconfirmed"});
    await adminExec("update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",[s.tenant,fixture.users.saljare.id]);
    try {
      expect((await runCommand(createQuoteVersionFromCalculation,{client:seller as never,input,correlationId:safety.operation_id})).ok).toBe(false);
      expect((await seller.rpc("reconcile_calculation_editor_operation",{p_operation_id:safety.operation_id})).error?.code).toBe("42501");
      expect((await adminQuery("select status from public.calculation_editor_operations where operation_id=$1",[safety.operation_id]))[0].status).toBe("prepared");
    } finally { await adminExec("update public.tenant_memberships set status='active' where tenant_id=$1 and user_id=$2",[s.tenant,fixture.users.saljare.id]); }
    const first=await runCommand(createQuoteVersionFromCalculation,{client:seller as never,input,correlationId:safety.operation_id});expect(first.ok).toBe(true);
    expect(await runCommand(createQuoteVersionFromCalculation,{client:seller as never,input,correlationId:safety.operation_id})).toEqual(first);
    const proof=await seller.rpc("reconcile_calculation_editor_operation",{p_operation_id:safety.operation_id});expect(proof.error).toBeNull();expect(proof.data).toMatchObject({status:"committed"});
    expect(await adminQuery("select id from public.quote_review_authorizations where correlation_id=$1",[safety.operation_id])).toHaveLength(1);
    await adminExec("update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",[s.tenant,fixture.users.saljare.id]);
    try { expect((await runCommand(createQuoteVersionFromCalculation,{client:seller as never,input,correlationId:safety.operation_id})).ok).toBe(false); }
    finally { await adminExec("update public.tenant_memberships set status='active' where tenant_id=$1 and user_id=$2",[s.tenant,fixture.users.saljare.id]); }
    for(const payload of [preparedProof.data,proof.data,projected.source])expect(JSON.stringify(payload)).not.toMatch(/unit_cost_ore|markup_bp|internal_note|source_revision|cost_hash/);
    expect((await seller.from("calculation_rows").select("id,unit_cost_ore").eq("id",s.row)).data).toEqual([]);
    for(const table of ["calculations","calculation_sections","calculation_rows"]){const denied=await seller.from(table).update({id:crypto.randomUUID()}).eq("tenant_id",s.tenant);expect(denied.error?.code).toBe("42501");}
  });

  it("P-3 terminal proofs are immutable and one authorization cannot bind two operations",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await source();const input={id:s.calc,title:"Committed"};const safety=await captureEditorTestIntent("calculation.update",input);expect((await mutate(actor,{...input,...safety})).error).toBeNull();
    await expect(adminExec("update public.calculation_editor_operations set request_digest=repeat('b',64) where operation_id=$1",[safety.operation_id])).rejects.toMatchObject({code:"23514"});
    await expect(adminExec("update public.calculation_editor_operations set status='closed',terminal_code='COMMAND_CONFLICT' where operation_id=$1",[safety.operation_id])).rejects.toMatchObject({code:"23514"});
    const authorization=crypto.randomUUID();
    await adminExec("insert into public.calculation_editor_operations(operation_id,tenant_id,actor_user_id,operation_kind,form_kind,protocol_version,request_digest,status,authorization_id,captured_at) values($1,$2,$3,'quote.version.create','reviewed-initial-quote',1,repeat('a',64),'prepared',$4,clock_timestamp())",[crypto.randomUUID(),s.tenant,fixture.base.adminA.id,authorization]);
    await expect(adminExec("insert into public.calculation_editor_operations(operation_id,tenant_id,actor_user_id,operation_kind,form_kind,protocol_version,request_digest,status,authorization_id,captured_at) values($1,$2,$3,'quote.version.create','reviewed-initial-quote',1,repeat('a',64),'prepared',$4,clock_timestamp())",[crypto.randomUUID(),s.tenant,fixture.base.adminA.id,authorization])).rejects.toMatchObject({code:"23505"});
  });
});
async function source(){
  const tenant=fixture.base.tenantA.id;const customer=await adminInsertCustomer({tenant_id:tenant,customer_type:"company",display_name:"RLS safety"});const calc=await adminInsertCalculation({tenant_id:tenant,customer_id:customer,title:"Original"});const section=await adminInsertSection({tenant_id:tenant,calculation_id:calc});const row=await adminInsertRow({tenant_id:tenant,section_id:section,unit_cost_ore:2000,unit_sell_ore:10000});return{tenant,customer,calc,section,row};
}
function mutate(client:TestServerClient,input:Record<string,unknown>,kind="calculation.update",actorId=fixture.base.adminA.id,tenant=fixture.base.tenantA.id){return client.rpc("mutate_calculation_editor",{p_tenant_id:tenant,p_actor_user_id:actorId,p_operation_id:input.operation_id,p_kind:kind,p_input:input,p_captured_at:"2026-11-13T10:00:00Z"});}
