/** 35.8-P P-4: initial quote retries retain original review authority/capture.
 * Local-only real commands. Wire-key spelling may follow the implementation helper;
 * no assertion permits recapture, new correlation, or renewed review authority.
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
import { buildQuoteReviewProof } from "../../support/quote-review-proof";
import { runCommand } from "@/server/commands/envelope";
import { createQuoteVersionFromCalculation } from "@/server/commands/quotes";

let up = false;
let fixture: TwoTenantFixture;
let actor: TestServerClient;
const capturedAt = "2026-11-13T10:00:00.000Z";
beforeAll(async () => {
  up = await isLocalStackReachable();
  if (!up) return;
  fixture = await createTwoTenantFixture();
  actor = await makeAuthedServerClient(fixture.adminA);
});
afterAll(async () => { if (up && fixture) await cleanupFixture(fixture); });

async function originalIntent() {
  const tenant = fixture.tenantA.id;
  const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: "Initial safety source" });
  const calc = await adminInsertCalculation({ tenant_id: tenant, customer_id: customer, title: "Reviewed original" });
  const section = await adminInsertSection({ tenant_id: tenant, calculation_id: calc, title: "Arbete" });
  await adminInsertRow({ tenant_id: tenant, section_id: section, unit_cost_ore: 2000, unit_sell_ore: 10000, quantity: 1, vat_rate_bp: 2500 });
  const reviewed = await buildQuoteReviewProof(actor, { calculationId: calc, capturedAt });
  const operation = crypto.randomUUID();
  return { operation, calc, input: {
    calculation_id: calc, attachment_file_ids: [], ...reviewed,
    operation_id: operation,
    expected: { version: 1, form: "reviewed-initial-quote", ...reviewed, attachment_file_ids: [] },
  } };
}
function interruptedClient(mode: "before-create" | "after-create") {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  let interrupted = false, prepared = false;
  const client = new Proxy(actor, { get(target, key) {
    if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      if (name === "create_calculation_editor_quote" && mode === "before-create" && prepared && !interrupted) {
        interrupted = true;
        throw new Error("synthetic transport loss before create dispatch");
      }
      const response = await target.rpc(name, args);
      if (name === "authorize_calculation_editor_quote" && !response.error) prepared = true;
      const proof: unknown = response.data;
      if (name === "create_calculation_editor_quote" && mode === "after-create" && !response.error && proof !== null && typeof proof === "object" && "status" in proof && proof.status === "committed" && !interrupted) {
        interrupted = true;
        throw new Error("synthetic transport loss after database commit");
      }
      return response;
    };
    const value = Reflect.get(target, key);
    return typeof value === "function" ? value.bind(target) : value;
  } });
  return { client, calls, wasInterrupted: () => interrupted };
}

// Closed diagnostic values only. These are separate privileged observations,
// never proof that the original authenticated caller is authorized. Each SELECT
// and adminSession cleanup completes before the original mutation is dispatched;
// assertion functions may take transient locks and influence timing.
type Point = "prepared-binding" | "purpose-unused-fresh" | "source-revision" | "line-sources" | "reviewed-source";
type Code = null | "23514" | "QV401" | "QV409" | "42501" | "CE409" | "OTHER";
type Mark = readonly [Point, boolean, Code];
function code(value: unknown): Code {
  try {
    if (value !== null && typeof value === "object" && "code" in value) {
      const item = value.code;
      switch (item) {
        case "23514": case "QV401": case "QV409": case "42501": case "CE409": return item;
      }
    }
  } catch { /* Unknown error shapes still project to the same closed value. */ }
  return "OTHER";
}
const reads: ReadonlyArray<readonly [Point, string]> = [
  ["prepared-binding", `select exists(select 1 from public.calculation_editor_operations o
    join public.quote_review_authorizations a on a.id=o.authorization_id
    where o.operation_id=$1 and o.tenant_id=$2 and o.actor_user_id=$3
    and a.tenant_id is not distinct from o.tenant_id and a.actor_user_id is not distinct from o.actor_user_id
    and a.correlation_id is not distinct from o.operation_id and a.captured_at is not distinct from o.captured_at
    and a.calculation_id is not distinct from o.calculation_id) ok`],
  ["purpose-unused-fresh", `select exists(select 1 from public.calculation_editor_operations o
    join public.quote_review_authorizations a on a.id=o.authorization_id
    where o.operation_id=$1 and o.tenant_id=$2 and o.actor_user_id=$3
    and a.purpose='initial_creation' and a.consumed_at is null and a.expires_at>clock_timestamp()) ok`],
  ["source-revision", `select coalesce((select public.story_10_8_calculation_source_revision(a.tenant_id,
    a.calculation_id,a.customer_id,a.facility_id,a.contact_id,a.attachments_payload)
    is not distinct from a.source_revision from public.calculation_editor_operations o
    join public.quote_review_authorizations a on a.id=o.authorization_id
    where o.operation_id=$1 and o.tenant_id=$2 and o.actor_user_id=$3),false) ok`],
  ["line-sources", `select true ok,public.assert_story_10_6_line_sources(a.tenant_id,a.calculation_id,a.lines_payload)
    from public.calculation_editor_operations o join public.quote_review_authorizations a on a.id=o.authorization_id
    where o.operation_id=$1 and o.tenant_id=$2 and o.actor_user_id=$3`],
  ["reviewed-source", `select true ok,public.assert_story_10_6_reviewed_source(a.tenant_id,a.calculation_id,
    a.customer_id,a.facility_id,a.contact_id,a.snapshot_payload,a.attachments_payload,repeat('0',64),
    a.reviewed_quote_capture_date,a.reviewed_calculation_status,a.reviewed_readiness_rows,
    (a.captured_at at time zone 'Europe/Stockholm')::date)
    from public.calculation_editor_operations o join public.quote_review_authorizations a on a.id=o.authorization_id
    where o.operation_id=$1 and o.tenant_id=$2 and o.actor_user_id=$3`],
];
async function points(value: string): Promise<Mark[]> {
  const marks: Mark[] = [];
  for (const [name, text] of reads) {
    let mark: Mark | undefined;
    try {
      await adminSession(async read => {
        let rows: { ok: boolean }[];
        try {
          rows = await read.query<{ ok: boolean }>(text, [value, fixture.tenantA.id, fixture.adminA.id]);
        } catch (value: unknown) {
          const item = code(value);
          if ((name === "line-sources" || name === "reviewed-source") && item !== null && item !== "OTHER") {
            mark = [name, false, item];
            return;
          }
          throw new Error("FAIL");
        }
        if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0]?.ok !== "boolean") throw new Error("FAIL");
        mark = [name, rows[0].ok, null];
      });
    } catch {
      // Acquisition, query integrity and cleanup failure are never observations.
      throw new Error("FAIL");
    }
    if (!mark) throw new Error("FAIL");
    marks.push(mark);
  }
  return marks;
}

describe("35.8-P initial quote original review operation", () => {
  it("P-4 checked quote normalizes empty attachment lists and rejects duplicate list identities before preparation",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await originalIntent();
    const fault=interruptedClient("before-create");
    const lost=await runCommand(createQuoteVersionFromCalculation,{client:fault.client as never,input:s.input,correlationId:s.operation,clock:{now:()=>new Date(capturedAt)}});
    expect(lost.ok).toBe(false);expect(fault.wasInterrupted()).toBe(true);
    expect(fault.calls.find(call=>call.name==="authorize_calculation_editor_quote")?.args.p_input).toMatchObject({attachment_file_ids:[]});
    const request={p_tenant_id:fixture.tenantA.id,p_actor_user_id:fixture.adminA.id,p_operation_id:s.operation,p_input:s.input};
    expect(await adminQuery("select status from public.calculation_editor_operations where operation_id=$1",[s.operation])).toEqual([{status:"prepared"}]);
    const before = await points(s.operation);
    const committed=await actor.rpc("create_calculation_editor_quote",request);
    const after = await points(s.operation);
    const detail = JSON.stringify([before, after]);
    expect(committed.error, detail).toBeNull();expect(committed.data, detail).toMatchObject({status:"committed",operationId:s.operation});
    expect(await adminSelectAuditEvents({correlationId:s.operation})).toHaveLength(1);
    const operation=crypto.randomUUID(),duplicated=[crypto.randomUUID()];duplicated.push(duplicated[0]);
    const rejected=await actor.rpc("authorize_calculation_editor_quote",{...request,p_operation_id:operation,p_input:{...s.input,operation_id:operation,attachment_file_ids:duplicated,expected:{...s.input.expected,attachment_file_ids:duplicated}},p_review:{}});
    expect(rejected.error?.code).toBe("23514");expect(rejected.error?.message).toMatch(/duplicate id/i);
    expect(await adminQuery("select operation_id from public.calculation_editor_operations where operation_id=$1",[operation])).toEqual([]);expect(await adminSelectAuditEvents({correlationId:operation})).toEqual([]);
  });

  it("P-4 prepared retry uses original authorization/capture/correlation and read-only reconciliation changes nothing", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await originalIntent();
    const fault = interruptedClient("before-create");
    const lost = await runCommand(createQuoteVersionFromCalculation, {
      client: fault.client as never, input: s.input, correlationId: s.operation, clock: { now: () => new Date(capturedAt) },
    });
    expect(fault.wasInterrupted()).toBe(true);
    expect(lost.ok).toBe(false);
    const original = await adminQuery("select * from public.quote_review_authorizations where correlation_id=$1", [s.operation]);
    expect(original).toHaveLength(1);
    expect(original[0].consumed_at).toBeNull();
    const before = await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation]);
    expect(before).toEqual([expect.objectContaining({ status: "prepared" })]);
    const observed = await actor.rpc("reconcile_calculation_editor_operation", { p_operation_id: s.operation });
    expect(observed.error).toBeNull();
    expect(observed.data).toMatchObject({ status: "unconfirmed" });
    expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation])).toEqual(before);

    // A different command clock cannot recapture the prepared quote or replace its
    // original review date. This is a replay of the original request, not a review.
    const replay = await runCommand(createQuoteVersionFromCalculation, {
      client: actor as never, input: s.input, correlationId: s.operation,
      clock: { now: () => new Date("2026-11-14T10:00:00.000Z") },
    });
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    const authorizations = await adminQuery("select id,captured_at,correlation_id,consumed_at from public.quote_review_authorizations where correlation_id=$1", [s.operation]);
    expect(authorizations).toHaveLength(1);
    expect(authorizations[0].id).toBe(original[0].id);
    expect(new Date(authorizations[0].captured_at as string).toISOString()).toBe(capturedAt);
    expect(authorizations[0].consumed_at).not.toBeNull();
    const versions = await adminQuery("select id,captured_at from public.quote_versions where calculation_id=$1", [s.calc]);
    expect(versions).toHaveLength(1);
    expect(versions[0].id).toBe(replay.data.targetId);
    expect(new Date(versions[0].captured_at as string).toISOString()).toBe(capturedAt);
    expect(await adminSelectAuditEvents({ correlationId: s.operation })).toHaveLength(1);
  });

  it("P-4 lost committed response replays exactly one quote/version/number with no fresh authority", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await originalIntent();
    const fault = interruptedClient("after-create");
    const lost = await runCommand(createQuoteVersionFromCalculation, {
      client: fault.client as never, input: s.input, correlationId: s.operation, clock: { now: () => new Date(capturedAt) },
    });
    expect(fault.wasInterrupted()).toBe(true);
    expect(lost.ok).toBe(false);
    const proof = await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation]);
    expect(proof).toEqual([expect.objectContaining({ status: "committed" })]);
    const replay = () => runCommand(createQuoteVersionFromCalculation, {
      client: actor as never, input: s.input, correlationId: s.operation, clock: { now: () => new Date("2026-11-14T10:00:00.000Z") },
    });
    const [one, two] = await Promise.all([replay(), replay()]);
    expect(one.ok).toBe(true);
    expect(two).toEqual(one);
    expect(await adminQuery("select id from public.quote_versions where calculation_id=$1", [s.calc])).toHaveLength(1);
    expect(await adminQuery("select id from public.quote_review_authorizations where correlation_id=$1", [s.operation])).toHaveLength(1);
    expect(await adminSelectAuditEvents({ correlationId: s.operation })).toHaveLength(1);
    expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation])).toEqual(proof);
    const altered = await runCommand(createQuoteVersionFromCalculation, {
      client: actor as never, input: { ...s.input, reviewed_snapshot_digest: "0".repeat(64) }, correlationId: s.operation,
    });
    expect(altered.ok).toBe(false);
    expect(await adminQuery("select id from public.quote_versions where calculation_id=$1", [s.calc])).toHaveLength(1);
  });


  it("P-4 real authorization lock crossing expiry checks wall clock after waiting and commits only closure",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await expiringPrepared(2);
    let release!:()=>void;const released=new Promise<void>(r=>release=r);let ready!:()=>void;const locked=new Promise<void>(r=>ready=r);let pid=0;
    const holder=adminSession(async session=>{await session.query("begin");try{pid=(await session.query<{pid:number}>("select pg_backend_pid() pid"))[0].pid;await session.query("select id from public.quote_review_authorizations where id=$1 for update",[s.authorization]);ready();await released;await session.query("select pg_sleep(greatest(0,extract(epoch from ($1::timestamptz-clock_timestamp())))+0.1)",[s.expires]);await session.query("commit");}catch(error){await session.query("rollback");throw error;}});
    await Promise.race([locked,holder]);const pending=submit(s);
    try{await expect.poll(async()=>(await adminQuery<{waiting:boolean}>("select exists(select 1 from pg_stat_activity where $1::int=any(pg_blocking_pids(pid))) waiting",[pid]))[0].waiting).toBe(true);}finally{release();await holder;}
    expect(await pending).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});await assertClosedWithoutQuote(s);
  });

  it("P-4 waiting creator rereads a committed terminal closure and never consumes the authorization",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await expiringPrepared(60);
    let release!:()=>void;const released=new Promise<void>(r=>release=r);let ready!:()=>void;const locked=new Promise<void>(r=>ready=r);let pid=0;
    const holder=adminSession(async session=>{await session.query("begin");try{pid=(await session.query<{pid:number}>("select pg_backend_pid() pid"))[0].pid;await session.query("select operation_id from public.calculation_editor_operations where operation_id=$1 for update",[s.operation]);ready();await released;await session.query("select public.ce_finish_internal($1,null,$2,null,0,true)",[s.operation,s.calc]);await session.query("commit");}catch(error){await session.query("rollback");throw error;}});
    await Promise.race([locked,holder]);const pending=submit(s);
    try{await expect.poll(async()=>(await adminQuery<{waiting:boolean}>("select exists(select 1 from pg_stat_activity where $1::int=any(pg_blocking_pids(pid))) waiting",[pid]))[0].waiting).toBe(true);}finally{release();await holder;}
    expect(await pending).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});await assertClosedWithoutQuote(s);
  });

  it("P-4 expired or stale prepared reconciliation is read-only; only checked creation closes it",async ctx=>{
    if(skipUnlessStack(ctx,up))return;
    for(const reason of ["expired","stale"]){
      const s=await expiringPrepared(reason==="expired"?-1:60);
      if(reason==="stale")await adminExec("update public.calculation_rows set label='Changed after review' where section_id in (select id from public.calculation_sections where calculation_id=$1)",[s.calc]);
      const before=await adminQuery("select * from public.calculation_editor_operations where operation_id=$1",[s.operation]);
      expect((await actor.rpc("reconcile_calculation_editor_operation",{p_operation_id:s.operation})).data).toMatchObject({status:"unconfirmed"});
      expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1",[s.operation])).toEqual(before);
      expect(await submit(s)).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});await assertClosedWithoutQuote(s);
      expect(await submit(s)).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});
    }
  });

  it("P-4 changed attachment selection cannot renew a prepared identity or gain new authority",async ctx=>{
    if(skipUnlessStack(ctx,up))return;const s=await expiringPrepared(60);const before=await adminQuery("select * from public.calculation_editor_operations where operation_id=$1",[s.operation]);
    const changed={...s.input,attachment_file_ids:[crypto.randomUUID()]};
    expect((await runCommand(createQuoteVersionFromCalculation,{client:actor as never,input:changed,correlationId:s.operation})).ok).toBe(false);
    expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1",[s.operation])).toEqual(before);
    expect(await adminQuery("select id from public.quote_review_authorizations where correlation_id=$1",[s.operation])).toHaveLength(1);
    expect(await submit(s)).toMatchObject({ok:true});
  });
});

async function prepareOriginal() {
  const s=await originalIntent();const fault=interruptedClient("before-create");
  await runCommand(createQuoteVersionFromCalculation,{client:fault.client as never,input:s.input,correlationId:s.operation,clock:{now:()=>new Date(capturedAt)}});
  expect(fault.wasInterrupted()).toBe(true);return s;
}
/** Privileged fixture INSERT copies real reviewed payload, with a short real expiry.
 * It changes no trigger/config and preserves the existing exact 15-minute constraint.
 * The new identity gets the same authoritative SQL canonical binding as production.
 */
async function expiringPrepared(seconds:number) {
  const donor=await prepareOriginal();const operation=crypto.randomUUID(),authorization=crypto.randomUUID();const input={...donor.input,operation_id:operation};
  const [{expires_at:expires}]=await adminQuery<{expires_at:Date}>(`insert into public.quote_review_authorizations select (jsonb_populate_record(null::public.quote_review_authorizations,to_jsonb(a)||jsonb_build_object('id',$2::uuid,'correlation_id',$3::uuid,'issued_at',statement_timestamp()+make_interval(secs=>$4)-interval '15 minutes','expires_at',statement_timestamp()+make_interval(secs=>$4)))).* from public.quote_review_authorizations a where correlation_id=$1 returning expires_at`,[donor.operation,authorization,operation,seconds]);
  // clock_timestamp must be evaluated once to retain exact constraint equality.
  await adminExec(`insert into public.calculation_editor_operations(operation_id,tenant_id,actor_user_id,operation_kind,form_kind,protocol_version,request_digest,status,calculation_id,authorization_id,captured_at)
    select $1,$2,$3,'quote.version.create','reviewed-initial-quote',1,
      encode(extensions.digest(jsonb_build_object('protocol',1,'tenant',$2::uuid,'actor',$3::uuid,'kind','quote.version.create','input',public.ce_input_internal('quote.version.create',$5::jsonb,$1))::text,'sha256'),'hex'),
      'prepared',$4,$6,$7`,[operation,fixture.tenantA.id,fixture.adminA.id,donor.calc,JSON.stringify(input),authorization,capturedAt]);
  return {operation,authorization,calc:donor.calc,input,expires};
}
function submit(s:Awaited<ReturnType<typeof expiringPrepared>>) {
  return runCommand(createQuoteVersionFromCalculation,{client:actor as never,input:s.input,correlationId:s.operation,clock:{now:()=>new Date("2026-11-14T10:00:00Z")}});
}
async function assertClosedWithoutQuote(s:Awaited<ReturnType<typeof expiringPrepared>>) {
  expect(await adminQuery("select status,terminal_code from public.calculation_editor_operations where operation_id=$1",[s.operation])).toEqual([{status:"closed",terminal_code:"COMMAND_CONFLICT"}]);
  expect(await adminQuery("select id from public.quote_versions where calculation_id=$1",[s.calc])).toEqual([]);
  expect(await adminSelectAuditEvents({correlationId:s.operation})).toEqual([]);
  expect((await adminQuery("select consumed_at from public.quote_review_authorizations where id=$1",[s.authorization]))[0].consumed_at).toBeNull();
}
