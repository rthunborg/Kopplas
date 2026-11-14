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
import { captureEditorTestIntent } from "./calculation-editor-safety-fixture";
import { runCommand } from "@/server/commands/envelope";
import { createCalculation, updateCalculation, archiveCalculation, createSection, updateSection, archiveSection, createRow, updateRow, archiveRow, reorderSections, reorderRows } from "@/server/commands/calculations";

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
  it("P-2 accepts complete 501-section reorder and archives every section beyond 1000 without a new creation cap", async ctx => {
    if (skipUnlessStack(ctx,up)) return;
    const s=await seed();
    await adminExec("insert into public.calculation_sections(tenant_id,calculation_id,title,sort_order) select $1,$2,'Population section',n from generate_series(1,500)n",[s.tenant,s.calc]);
    const siblings=await adminQuery<{id:string;sort_order:number}>("select id,sort_order from public.calculation_sections where calculation_id=$1 and archived_at is null order by sort_order",[s.calc]);
    expect(siblings).toHaveLength(501);
    const reordered=siblings.map(x=>x.id).reverse(),reorderInput={calculation_id:s.calc,ordered_section_ids:reordered};
    const reorderSafety=await captureEditorTestIntent("calculation.sections.reorder",reorderInput);
    expect(await runCommand(reorderSections,{client:actor as never,input:{...reorderInput,...reorderSafety},correlationId:reorderSafety.operation_id})).toMatchObject({ok:true});
    expect((await adminQuery<{id:string}>("select id from public.calculation_sections where calculation_id=$1 and archived_at is null order by sort_order",[s.calc])).map(x=>x.id)).toEqual(reordered);
    await adminExec("insert into public.calculation_sections(tenant_id,calculation_id,title,sort_order) select $1,$2,'Population section',n from generate_series(501,1000)n",[s.tenant,s.calc]);
    const createInput={calculation_id:s.calc,title:"Section above 1000"},createSafety=await captureEditorTestIntent("calculation.section.create",createInput);
    expect(await runCommand(createSection,{client:actor as never,input:{...createInput,...createSafety},correlationId:createSafety.operation_id})).toMatchObject({ok:true});
    const archiveInput={id:s.calc},archiveSafety=await captureEditorTestIntent("calculation.archive",archiveInput);
    expect(archiveSafety.expected.sections).toHaveLength(1002);
    expect(await runCommand(archiveCalculation,{client:actor as never,input:{...archiveInput,...archiveSafety},correlationId:archiveSafety.operation_id})).toMatchObject({ok:true});
    expect((await header(s.calc))?.archived_at).not.toBeNull();
    expect(await adminQuery("select id from public.calculation_sections where calculation_id=$1 and archived_at is null",[s.calc])).toHaveLength(1002);
    expect(await adminSelectAuditEvents({correlationId:archiveSafety.operation_id})).toHaveLength(1);
  });
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
    const rowOp = intent("row", { header: await header(s.calc), section: original.section, row: original.rows.find(row => row.id === s.rows[0]) });
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


  it("P-2 disjoint header fields coexist; obsolete tax, section and row archive decisions conflict", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await seed();
    const title = { id: s.calc, title: "Disjoint title", ...await captureEditorTestIntent("calculation.update", {id:s.calc}) };
    await adminExec("update public.calculations set tax_input_snapshot=$2::jsonb where id=$1", [s.calc, JSON.stringify(taxInput)]);
    expect(await runCommand(updateCalculation, {client:actor as never,input:title,correlationId:title.operation_id})).toMatchObject({ok:true});
    const requests = [
      [updateCalculation, "calculation.update", {id:s.calc,tax_input_snapshot:taxInput}],
      [updateSection, "calculation.section.update", {id:s.section,title:"Stale"}],
      [archiveRow, "calculation.row.archive", {id:s.rows[0]}],
    ] as const;
    for (const [command,kind,input] of requests) {
      const safety = await captureEditorTestIntent(kind,input);
      if(kind === "calculation.update") await adminExec("update public.calculations set tax_input_snapshot=null where id=$1",[s.calc]);
      else if(kind === "calculation.section.update") await adminExec("update public.calculation_sections set title='Newer' where id=$1",[s.section]);
      else await adminExec("update public.calculation_rows set label='Newer' where id=$1",[s.rows[0]]);
      expect(await runCommand(command as typeof updateCalculation,{client:actor as never,input:{...input,...safety},correlationId:safety.operation_id})).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});
      expect(await adminSelectAuditEvents({correlationId:safety.operation_id})).toEqual([]);
    }
  });

  it("P-2 complete permutation rejects duplicates, omitted siblings and stale archive/reorder ranks", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s=await seed();
    for(const ids of [[s.rows[0],s.rows[0]],[s.rows[0]]]) {
      const input={section_id:s.section,ordered_row_ids:ids};const safety=await captureEditorTestIntent("calculation.rows.reorder",input);
      expect((await runCommand(reorderRows,{client:actor as never,input:{...input,...safety},correlationId:safety.operation_id})).ok).toBe(false);
    }
    for(const change of ["sort_order=sort_order+5","archived_at=clock_timestamp()"]){
      const input={section_id:s.section,ordered_row_ids:[...s.rows].reverse()};const safety=await captureEditorTestIntent("calculation.rows.reorder",input);
      await adminExec(`update public.calculation_rows set ${change} where id=$1`,[s.rows[0]]);
      const before=await sectionTree(s.section);
      expect(await runCommand(reorderRows,{client:actor as never,input:{...input,...safety},correlationId:safety.operation_id})).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});
      expect(await sectionTree(s.section)).toEqual(before);
    }
  });

  for(const effect of ["create","update","tax","archive","section.create","section.update","section.archive","row.create","row.update","row.archive","sections.reorder","rows.reorder"] as const) {
    it(`P-3 ${effect}: lost commit and concurrent same-intent replay retain one immutable effect`,async ctx=>{
      if(skipUnlessStack(ctx,up))return;const s=await seed();
      const operations={
        create:[createCalculation,{customer_id:s.customer,title:`Loss ${crypto.randomUUID()}`}],
        update:[updateCalculation,{id:s.calc,title:"Saved"}],tax:[updateCalculation,{id:s.calc,tax_input_snapshot:taxInput}],archive:[archiveCalculation,{id:s.calc}],
        "section.create":[createSection,{calculation_id:s.calc,title:"New section"}],"section.update":[updateSection,{id:s.section,title:"Saved section"}],"section.archive":[archiveSection,{id:s.section}],
        "row.create":[createRow,{section_id:s.section,row_type:"labor",quantity:1,unit:"h",vat_rate_bp:2500,unit_sell_ore:10000}],"row.update":[updateRow,{id:s.rows[0],label:"Saved row"}],"row.archive":[archiveRow,{id:s.rows[0]}],
        "sections.reorder":[reorderSections,{calculation_id:s.calc,ordered_section_ids:[s.section]}],"rows.reorder":[reorderRows,{section_id:s.section,ordered_row_ids:[...s.rows].reverse()}],
      } as const;
      const [command,domain]=operations[effect];const kind=command.config.command as Parameters<typeof captureEditorTestIntent>[0];
      const safety=await captureEditorTestIntent(kind,domain);const input={...domain,...safety};let lost=false;
      const lossy=new Proxy(actor,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{const response=await target.rpc(name,args);if(name==="mutate_calculation_editor"&&!response.error&&!lost){lost=true;throw new Error("post-commit loss");}return response;};const value=Reflect.get(target,key);return typeof value==="function"?value.bind(target):value;}});
      const submit=(client:TestServerClient)=>runCommand(command as typeof updateCalculation,{client:client as never,input,correlationId:safety.operation_id});
      expect((await submit(lossy)).ok).toBe(false);expect(lost).toBe(true);
      const before=await adminQuery("select * from public.calculation_editor_operations where operation_id=$1",[safety.operation_id]);
      const domainBefore=await domainState(s.customer);
      const [one,two]=await Promise.all([submit(actor),submit(actor)]);expect(one.ok).toBe(true);expect(two).toEqual(one);
      expect(await domainState(s.customer)).toEqual(domainBefore);
      expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1",[safety.operation_id])).toEqual(before);
      expect(await adminSelectAuditEvents({correlationId:safety.operation_id})).toHaveLength(["create","update","tax","archive"].includes(effect)?1:0);
      const changed=await actor.rpc("mutate_calculation_editor",{p_tenant_id:s.tenant,p_actor_user_id:fixture.adminA.id,p_operation_id:safety.operation_id,p_kind:kind,p_input:{...input,expected:{...input.expected,form:"wrong"}},p_captured_at:new Date().toISOString()});
      expect(changed.error).not.toBeNull();
    });
  }

  it("P-3 audit failure rolls domain and proof back; the exact original identity safely retries",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await seed();const input={customer_id:s.customer,title:`Rollback ${crypto.randomUUID()}`};const safety=await captureEditorTestIntent("calculation.create",input);
    await adminExec("insert into test_support.forced_audit_failures(correlation_id) values($1)",[safety.operation_id]);
    try{expect((await runCommand(createCalculation,{client:actor as never,input:{...input,...safety},correlationId:safety.operation_id})).ok).toBe(false);}
    finally{await adminExec("delete from test_support.forced_audit_failures where correlation_id=$1",[safety.operation_id]);}
    expect(await adminQuery("select id from public.calculations where title=$1",[input.title])).toEqual([]);
    expect(await adminQuery("select operation_id from public.calculation_editor_operations where operation_id=$1",[safety.operation_id])).toEqual([]);
    expect(await runCommand(createCalculation,{client:actor as never,input:{...input,...safety},correlationId:safety.operation_id})).toMatchObject({ok:true});
    expect(await adminSelectAuditEvents({correlationId:safety.operation_id})).toHaveLength(1);
  });

  it("P-2 SQL resolves the current pricing source under its lock and enforces the persisted 500-row limit",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await seed();
    const [{id:source}]=await adminQuery<{id:string}>("insert into public.work_roles(tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,'Before',2000,10000) returning id",[s.tenant]);
    const input={section_id:s.section,row_type:"labor",quantity:1,unit:"h",vat_rate_bp:2500,source_kind:"work_role",source_id:source};const safety=await captureEditorTestIntent("calculation.row.create",input);
    let release!:()=>void;const released=new Promise<void>(r=>release=r);let ready!:()=>void;const locked=new Promise<void>(r=>ready=r);let pid=0;
    const holder=adminSession(async session=>{await session.query("begin");try{pid=(await session.query<{pid:number}>("select pg_backend_pid() pid"))[0].pid;await session.query("update public.work_roles set display_name='After',sell_rate_ore=12000 where id=$1",[source]);ready();await released;await session.query("commit");}catch(error){await session.query("rollback");throw error;}});
    await Promise.race([locked,holder]);const pending=runCommand(createRow,{client:actor as never,input:{...input,...safety},correlationId:safety.operation_id,clock:{now:()=>new Date("2026-11-13T10:00:00Z")}});
    try{await expect.poll(async()=>(await adminQuery<{waiting:boolean}>("select exists(select 1 from pg_stat_activity where $1::int=any(pg_blocking_pids(pid))) waiting",[pid]))[0].waiting).toBe(true);}finally{release();await holder;}
    const result=await pending;expect(result.ok).toBe(true);if(!result.ok)return;
    expect(await adminQuery("select source_name,source_price_ore::text,source_captured_at from public.calculation_rows where id=$1",[result.data.targetId])).toEqual([{source_name:"After",source_price_ore:"12000",source_captured_at:new Date("2026-11-13T10:00:00Z")}]);
    await adminExec("insert into public.calculation_rows(tenant_id,section_id,row_type,quantity,unit,vat_rate_bp) select $1,$2,'labor',1,'h',2500 from generate_series(1,497)",[s.tenant,s.section]);
    const limit=await captureEditorTestIntent("calculation.row.create",input);
    expect(await runCommand(createRow,{client:actor as never,input:{...input,...limit},correlationId:limit.operation_id})).toMatchObject({ok:false,code:"VALIDATION_FAILED"});
    expect(await adminQuery("select operation_id from public.calculation_editor_operations where operation_id=$1",[limit.operation_id])).toEqual([]);
  });
});

const taxInput={schemaVersion:2,documentVatType:"STANDARD_VAT_25",buyerVatNumber:null,deductionChoice:"NONE",paymentDate:null,finalPaymentDate:null,personAllowanceSlots:[],greenBasisMethod:"ACTUAL_ELIGIBLE_COSTS",genuineFixedPrice:false,fixedPriceOre:null,fixedPriceCategorySplitOre:null,fixedPriceRowIds:null};

async function domainState(customer:string){return adminQuery(`select 'calculation' kind,c.id,to_jsonb(c) facts from public.calculations c where c.customer_id=$1
 union all select 'section',s.id,to_jsonb(s) from public.calculation_sections s join public.calculations c on c.id=s.calculation_id where c.customer_id=$1
 union all select 'row',r.id,to_jsonb(r) from public.calculation_rows r join public.calculation_sections s on s.id=r.section_id join public.calculations c on c.id=s.calculation_id where c.customer_id=$1 order by kind,id`,[customer]);}
