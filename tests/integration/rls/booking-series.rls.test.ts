import { describe, expect, test } from "vitest";
import { beforeAll } from "vitest";
import { withBookingFixture, bookingCommand, seedBookingParents } from "../../support/bookings-atdd";
import { realSeriesInput, reviewRealSeries, realSeriesSnapshot } from "../../support/booking-series-atdd";
import { adminQuery } from "../../factories/admin-sql";
import { makeAuthedServerClient, makeAnonServerClient } from "../../factories/tenants";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
import { runCommand } from "@/server/commands/envelope";
import { seriesCommandPayload } from "@/server/commands/bookings/series-validation";
import { updateBookingSeries } from "@/server/commands/bookings/update-booking-series";
import { previewBookingSeries } from "@/server/bookings/series-conflicts";
let realStackUp = false;
beforeAll(async () => {realStackUp=await isLocalStackReachable();});

describe("15.2 real series authority",()=>{
  test("15.2-RLS-REAL-001 FORCE RLS, private outcomes and every direct DML privilege remain closed",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    const [security]=await adminQuery<{relrowsecurity:boolean;relforcerowsecurity:boolean;private_read:boolean;insert_allowed:boolean;update_allowed:boolean;delete_allowed:boolean}>(`select c.relrowsecurity,c.relforcerowsecurity,
      has_column_privilege('authenticated','public.booking_series','outcomes','SELECT') private_read,
      has_table_privilege('authenticated','public.booking_series','INSERT') insert_allowed,
      has_table_privilege('authenticated','public.booking_series','UPDATE') update_allowed,
      has_table_privilege('authenticated','public.booking_series','DELETE') delete_allowed
      from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='booking_series'`);
    expect(security).toEqual({relrowsecurity:true,relforcerowsecurity:true,private_read:false,insert_allowed:false,update_allowed:false,delete_allowed:false});
    const functions=await adminQuery<{proname:string;anon:boolean;authenticated:boolean;service:boolean;public_execute:boolean;proconfig:string[]}>(`select p.proname,p.proconfig,
      has_function_privilege('anon',p.oid,'EXECUTE') anon,has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated,
      has_function_privilege('service_role',p.oid,'EXECUTE') service,
      exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public_execute
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and
      (p.proname like 'booking_series_%' or p.proname in ('booking_occurrence_exception_internal','snapshot_booking_series','finalize_booking_series')) order by p.proname`);
    expect(functions).toHaveLength(8);
    for(const fn of functions){expect(fn).toMatchObject({anon:false,authenticated:["snapshot_booking_series","finalize_booking_series"].includes(fn.proname),service:false,public_execute:false});expect(fn.proconfig).toEqual(['search_path=""']);}
  });
  test("15.2-RLS-REAL-002 current role sets and own-only occurrence reads do not disclose templates",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const {input}=await reviewRealSeries(fx,realSeriesInput(fx));
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input})).toMatchObject({ok:true});
      const peer=await bookingCommand("create",fx.adminClient,{...input.template,assigneeIds:[fx.coworkerProfile.id],commandId:crypto.randomUUID(),description:"Hidden peer occurrence fixture"});
      expect(peer).toMatchObject({ok:true});if(!peer.ok)throw new Error("Expected real hidden-peer fixture");
      const own=await fx.montorClient.from("bookings").select("id,series_id,is_exception,nominal_date").eq("tenant_id",fx.base.tenantA.id);
      expect(own.error).toBeNull();expect(own.data).toHaveLength(3);
      const clients=[fx.montorClient,fx.foreignClient,await makeAuthedServerClient(fx.users.saljare),await makeAuthedServerClient(fx.users.ekonomi),await makeAnonServerClient(),
        await makeAuthedServerClient(fx.disabledUser),await makeAuthedServerClient(fx.invitedUser)];
      const before=await realSeriesSnapshot(fx);
      for(const client of clients){
        const {data:{user}}=await client.auth.getUser();
        expect(await runCommand(createBookingSeries,{client:client as never,input})).toMatchObject({ok:false});
        const template=await client.from("booking_series").select("id,rule,defaults,version").eq("id",input.seriesId);
        expect(template.data??[]).toEqual([]);
        if(user)expect(template.error).toBeNull();
        expect((await client.from("bookings").select("id,description,series_id,nominal_date,is_exception").eq("id",peer.data.bookingId)).data??[]).toEqual([]);
        const direct={p_tenant_id:fx.base.tenantA.id,p_actor_id:user?.id??null,p_correlation_id:crypto.randomUUID(),p_command_id:input.commandId,p_input:seriesCommandPayload(input)};
        expect((await client.rpc("snapshot_booking_series",{...direct,p_key_id:"unconfigured",p_decision:input.editorReview!.decision})).error).not.toBeNull();
        expect((await client.rpc("finalize_booking_series",{...direct,p_claims:null,p_plan:"{}",p_signature:null,p_review_claims:null,p_review_groups:"[]",p_review_signature:null,p_decision:input.editorReview!.decision})).error).not.toBeNull();
        expect((await client.from("booking_series").select("outcomes").eq("id",input.seriesId)).error).not.toBeNull();
        expect((await client.from("booking_series").insert({id:crypto.randomUUID(),tenant_id:fx.base.tenantA.id,rule:input.rule,defaults:input.template})).error).not.toBeNull();
        expect((await client.from("booking_series").update({version:999}).eq("id",input.seriesId)).error).not.toBeNull();
        expect((await client.from("booking_series").delete().eq("id",input.seriesId)).error).not.toBeNull();
        expect((await client.from("bookings").update({series_id:crypto.randomUUID(),is_exception:false}).eq("tenant_id",fx.base.tenantA.id)).error).not.toBeNull();
      }
      expect(await realSeriesSnapshot(fx)).toEqual(before);
      const union=await makeAuthedServerClient(fx.roleUnionUser);
      for(const [client,actorId] of [[fx.adminClient,fx.base.adminA.id],[fx.plannerClient,fx.users.projektledare.id],[union,fx.roleUnionUser.id]] as const){
        const next=await reviewRealSeries(fx,realSeriesInput(fx),{client,actorId});
        expect(await runCommand(createBookingSeries,{client:client as never,input:next.input})).toMatchObject({ok:true});
        const edit=await reviewRealSeries(fx,{...next.input,commandId:crypto.randomUUID(),sourceSeriesId:next.input.seriesId,expectedVersion:1,editorReview:undefined,template:{...next.input.template,description:"Current manager update"}},{client,actorId});
        expect(await runCommand(updateBookingSeries,{client:client as never,input:edit.input})).toMatchObject({ok:true});
        const standalone=await bookingCommand("create",client,{...next.input.template,assigneeIds:[...next.input.template.assigneeIds],commandId:crypto.randomUUID()});
        expect(standalone).toMatchObject({ok:true});if(!standalone.ok)throw new Error("Expected valid optional-null standalone");
        expect(await adminQuery("select series_id,is_exception,job_id,customer_id,facility_id,contact_id from public.bookings where id=$1",[standalone.data.bookingId])).toEqual([{series_id:null,is_exception:false,job_id:null,customer_id:null,facility_id:null,contact_id:null}]);
      }
    });
  });
  test("15.2-RLS-REAL-003 revoked current authority prevents private replay and all direct proofless RPC writes",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const {input}=await reviewRealSeries(fx,realSeriesInput(fx),{client:fx.plannerClient,actorId:fx.users.projektledare.id});
      expect(await runCommand(createBookingSeries,{client:fx.plannerClient as never,input})).toMatchObject({ok:true});
      await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",[fx.base.tenantA.id,fx.users.projektledare.id]);
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(createBookingSeries,{client:fx.plannerClient as never,input})).toMatchObject({ok:false});
      const direct=await fx.plannerClient.rpc("snapshot_booking_series",{p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.users.projektledare.id,p_correlation_id:crypto.randomUUID(),p_command_id:input.commandId,p_input:seriesCommandPayload(input),p_key_id:"unconfigured",p_decision:input.editorReview!.decision});
      expect(direct.error).not.toBeNull();expect(direct.data).toBeNull();
      expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-RLS-REAL-004 every foreign lineage/person/link reference is denied with both tenants unchanged",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const own=realSeriesInput(fx),foreign=realSeriesInput(fx,{template:{...own.template,assigneeIds:[fx.foreignProfile.id]}});
      const foreignPreview=await previewBookingSeries(fx.foreignClient,{p_tenant_id:fx.base.tenantB.id,p_actor_id:fx.base.adminB.id,p_correlation_id:crypto.randomUUID(),p_command_id:foreign.commandId,p_input:seriesCommandPayload(foreign)},foreign);
      const reviewedForeign={...foreign,editorReview:{receipt:foreignPreview.receipt,decision:{acknowledged:foreignPreview.warnings.length>0,reviewedLogicalIds:foreignPreview.warnings.map(w=>w.logicalId),selectedLogicalIds:[],reason:foreignPreview.warnings.length?"Foreign fixture actual review":""}}};
      expect(await runCommand(createBookingSeries,{client:fx.foreignClient as never,input:reviewedForeign})).toMatchObject({ok:true});
      const ready=await reviewRealSeries(fx,own);expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:ready.input})).toMatchObject({ok:true});
      const [foreignOccurrence]=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date limit 1",[foreign.seriesId]);
      const parents=await seedBookingParents(fx.base.tenantB.id);
      const [{id:foreignJob}]=await adminQuery<{id:string}>("insert into public.jobs(tenant_id,customer_id,title) values($1,$2,'Foreign reference fixture') returning id",[fx.base.tenantB.id,parents.customerId]);
      const before=await realSeriesSnapshot(fx);
      for(const malicious of [
        realSeriesInput(fx,{sourceSeriesId:foreign.seriesId,expectedVersion:1}),
        realSeriesInput(fx,{sourceSeriesId:own.seriesId,expectedVersion:1,pivotOccurrenceId:foreignOccurrence.id}),
        ...Object.entries({assigneeIds:[fx.foreignProfile.id],workRoleId:parents.workRoleId,jobId:foreignJob,customerId:parents.customerId,facilityId:parents.facilityId,contactId:parents.contactId}).map(([field,value])=>realSeriesInput(fx,{template:{...own.template,[field]:value}})),
      ]){
        let candidate=malicious;
        try{candidate=(await reviewRealSeries(fx,malicious)).input;}catch(error){
          expect((error as {code?:string}).code).toBe("TENANT_ACCESS_DENIED");expect(await realSeriesSnapshot(fx)).toEqual(before);continue;
        }
        // For link fields the genuine own receipt reaches SQL's reference checks.
        expect(await runCommand(candidate.sourceSeriesId?updateBookingSeries:createBookingSeries,{client:fx.adminClient as never,input:candidate})).toMatchObject({ok:false});
        expect(await realSeriesSnapshot(fx)).toEqual(before);
      }
      const proofless=await fx.adminClient.rpc("finalize_booking_series",{p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:crypto.randomUUID(),p_input:seriesCommandPayload(realSeriesInput(fx)),p_claims:null,p_plan:"{}",p_signature:null,p_review_claims:null,p_review_groups:"[]",p_review_signature:null,p_decision:null});
      expect(proofless.error?.code).toBe("42501");expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-RLS-REAL-005 inactive assignment retention belongs only to its existing occurrence",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx);const first=await reviewRealSeries(fx,original);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:first.input})).toMatchObject({ok:true});
      await adminQuery("update public.tenant_memberships set status='disabled' where id=$1",[fx.ownProfile.membershipId]);
      const update=realSeriesInput(fx,{seriesId:original.seriesId,sourceSeriesId:original.seriesId,expectedVersion:1});
      const reviewed=await reviewRealSeries(fx,update);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:reviewed.input})).toMatchObject({ok:true});
      const before=await realSeriesSnapshot(fx);
      const added=realSeriesInput(fx,{seriesId:original.seriesId,sourceSeriesId:original.seriesId,expectedVersion:2,rule:{...original.rule,count:4}});
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:{...added,editorReview:reviewed.input.editorReview}})).toMatchObject({ok:false});
      expect(await realSeriesSnapshot(fx)).toEqual(before);
      // Safe flags remain actual values after a checked one-occurrence cancellation.
      await adminQuery("update public.tenant_memberships set status='active' where id=$1",[fx.ownProfile.membershipId]);
      const [row]=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date limit 1",[original.seriesId]);
      expect(await bookingCommand("update",fx.adminClient,{...original.template,assigneeIds:[...original.template.assigneeIds],commandId:crypto.randomUUID(),bookingId:row.id,status:"cancelled"})).toMatchObject({ok:true});
      const read=await fx.montorClient.from("bookings").select("id,series_id,is_exception,status").eq("id",row.id);
      expect(read.error).toBeNull();expect(read.data).toEqual([{id:row.id,series_id:original.seriesId,is_exception:true,status:"cancelled"}]);
    });
  });
});
import { loadBookingSeriesBindings, reviewed, type Fixture, type Plan,
  type Role, type SeriesBindings } from "../../support/booking-series-atdd";

/* Future RED scope: real authenticated Supabase clients and actual current checked
 * command/SQL/RLS boundary. No policy fixture/inventory/manifest modification here.
 * Provider source: permission-matrix.ts Bookings.Manage; envelope.ts;
 * 20261006122441 tenant gate, 20261007120235 replay auth locks and E16 v3 facts.
 * New series SQL names/columns/grants are not pinned by this scaffold. Adapter
 * discovers signatures including old overloads and returns test-owned projections.
 * No installed playwright-utils/Pact package and no Pact boundary: Vitest only.
 * Every skipped case is unexecuted future coverage; adapter intentionally unbound.
 */
async function scenario(run: (b: SeriesBindings, fx: Fixture, plan: Plan) => Promise<void>, kind: "clear" | "existing" = "existing") {
  const b = await loadBookingSeriesBindings();
  await b.withFixture(async (fx) => run(b, fx, await b.seed(fx, kind)));
}
async function ready(b: SeriesBindings, fx: Fixture, plan: Plan) {
  return reviewed(plan.attempt, await b.preview(fx.clients.planner, plan.attempt), [plan.selected]);
}
const ids = (rows: { id: string }[]) => rows.map((row) => row.id).sort();
const deniedRoles: Role[] = ["anonymous", "foreign", "inactive", "revoked", "montor", "sales", "economy"];

describe("Story 15.2 series/occurrence authorization ATDD (unexecuted RED)", () => {
  test.skip("[P0] 15.2-RLS-001 FORCE RLS and explicit public column grants keep all outcome/proof fields private (AC7)", async () => {
    await scenario(async (b, fx) => {
      const security = await b.tableSecurity(fx);
      expect(security.rlsEnabled).toBe(true);
      expect(security.forceRls).toBe(true);
      expect(security.privateColumns.length).toBeGreaterThan(0);
      expect(security.managerPublicColumns.length).toBeGreaterThan(0);
      expect(security.publicGrantColumns.length).toBeGreaterThan(0);
      expect(security.privateColumns.filter((column) => security.managerPublicColumns.includes(column))).toEqual([]);
      expect(security.privateColumns.filter((column) => security.publicGrantColumns.includes(column))).toEqual([]);
      const managerRead = await b.read(fx.clients.admin, fx);
      for (const column of security.privateColumns) expect(JSON.stringify(managerRead.rawBrowserPayload)).not.toContain(`"${column}"`);
    });
  });

  test.skip("[P0] 15.2-RLS-002 active Admin and PL role sets including union can create/update through checked authority (AC7)", async () => {
    for (const role of ["admin", "planner", "multiRolePlanner"] as const) {
      for (const kind of ["clear", "existing"] as const) {
      await scenario(async (b, fx, plan) => {
        // Each role gets its OWN genuine receipt bound to its actor, never a PL receipt.
        const attempt = reviewed(plan.attempt, await b.preview(fx.clients[role], plan.attempt), plan.groups.length ? [plan.selected] : []);
        const before = await b.snapshot(fx);
        const result = await b.command(fx.clients[role], attempt, fx.correlationId);
        expect(result.ok).toBe(true);
        expect(await b.snapshot(fx)).not.toEqual(before);
        expect(await b.auditFor(fx, fx.correlationId)).toEqual([{ actorId: fx.actorIds[role], event: expect.any(String), at: expect.any(String) }]);
        const ownRead = await b.read(fx.clients[role], fx);
        expect(ownRead.templates.length).toBeGreaterThan(0);
        expect(ids(ownRead.occurrences)).not.toContain(fx.foreignOccurrenceId);
        expect(JSON.stringify(ownRead.rawBrowserPayload)).not.toContain(fx.foreignMarker);
      }, kind);
      }
    }
  });

  test.skip("[P0] 15.2-RLS-003 anonymous/foreign/inactive/revoked/Montor/Sales/Economy cannot mutate series (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      const before = await b.snapshot(fx);
      for (const role of deniedRoles) {
        const result = await b.command(fx.clients[role], attempt, crypto.randomUUID());
        expect(result).toMatchObject({ ok: false, kind: "denied" });
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-004 current authorization precedes private durable replay for every denied caller (AC3/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      expect((await b.command(fx.clients.planner, attempt, fx.correlationId)).ok).toBe(true);
      const before = await b.snapshot(fx);
      for (const role of deniedRoles) {
        const result = await b.command(fx.clients[role], attempt, crypto.randomUUID());
        expect(result).toMatchObject({ ok: false, kind: "denied" });
        expect(JSON.stringify(result)).not.toContain(attempt.proposedSeriesId);
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-005 Montor sees assigned real occurrences including safe exception/tombstone metadata only (AC4/7)", async () => {
    await scenario(async (b, fx) => {
      const read = await b.read(fx.clients.montor, fx);
      expect(ids(read.occurrences)).toEqual([...fx.ownOccurrenceIds].sort());
      expect(read.templates).toEqual([]);
      expect(read.occurrences.some((row) => row.isException)).toBe(true);
      expect(read.occurrences.some((row) => row.status === "cancelled" && row.isException)).toBe(true);
      expect(ids(read.occurrences)).not.toContain(fx.peerOccurrenceId);
      expect(ids(read.occurrences)).not.toContain(fx.foreignOccurrenceId);
      const raw = JSON.stringify(read.rawBrowserPayload);
      for (const marker of [fx.templateMarker, fx.peerMarker, fx.foreignMarker]) expect(raw).not.toContain(marker);
      const security = await b.tableSecurity(fx);
      for (const column of security.privateColumns) expect(raw).not.toContain(`"${column}"`);
    });
  });

  test.skip("[P0] 15.2-RLS-006 nonmanager callers have no template/private outcome projection or foreign occurrence disclosure (AC7)", async () => {
    await scenario(async (b, fx) => {
      for (const role of deniedRoles) {
        const read = await b.read(fx.clients[role], fx);
        expect(read.templates).toEqual([]);
        const raw = JSON.stringify(read.rawBrowserPayload);
        expect(raw).not.toContain(fx.templateMarker);
        expect(raw).not.toContain(fx.foreignMarker);
        const security = await b.tableSecurity(fx);
        for (const column of security.privateColumns) expect(raw).not.toContain(`"${column}"`);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-007 foreign series/pivot/assignee/job/customer/facility/contact references reject atomically (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      for (const field of ["series", "pivot", "assignee", "job", "customer", "facility", "contact"] as const) {
        const malicious = await b.foreignReference(fx, attempt, field);
        const before = await b.snapshot(fx);
        expect(await b.command(fx.clients.planner, malicious, crypto.randomUUID())).toMatchObject({ ok: false });
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-008 manager and Montor direct DML cannot forge rule, outcome or recurrence linkage (AC4/5/7)", async () => {
    await scenario(async (b, fx) => {
      for (const role of ["admin", "planner", "montor", "foreign", "anonymous"] as const) {
        for (const target of ["series", "series-rule", "series-outcome", "booking-series-id", "nominal-slot",
          "occurrence-index", "exception", "tombstone", "lineage"] as const) {
          const before = await b.snapshot(fx);
          const reply = await b.dml(fx.clients[role], fx, target);
          expect(reply.affectedRows).toBe(0);
          expect(await b.snapshot(fx)).toEqual(before);
        }
      }
    });
  });

  test.skip("[P0] 15.2-RLS-009 checked RPC cannot accept absent/unsigned human review even with otherwise genuine detector proof (AC6/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const reviewedAttempt = await ready(b, fx, plan);
      const { decision: _decision, ...withoutReview } = reviewedAttempt;
      void _decision;
      const before = await b.snapshot(fx);
      const reply = await b.direct(fx.clients.planner, withoutReview);
      expect(reply.error).not.toBeNull();
      expect(reply.data).toBeNull();
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-RLS-010 every checked fresh SQL overload rejects missing review and no obsolete overload bypass exists (AC6/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      const entries = await b.sqlInventory(fx, attempt);
      expect(entries.filter((entry) => entry.kind === "checked").length).toBeGreaterThan(0);
      for (const entry of entries.filter((candidate) => candidate.kind !== "private")) {
        const { decision: _decision, ...withoutReview } = attempt;
        void _decision;
        const before = await b.snapshot(fx);
        const reply = await b.direct(fx.clients.planner, withoutReview, entry);
        expect(reply.error).not.toBeNull();
        expect(reply.data).toBeNull();
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-011 private helpers have no PUBLIC/anon/authenticated/service-role EXECUTE grants (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const entries = (await b.sqlInventory(fx, await ready(b, fx, plan))).filter((entry) => entry.kind === "private");
      expect(entries.length).toBeGreaterThan(0);
      const acls = await b.sqlAcls(entries);
      expect(acls).toHaveLength(entries.length);
      for (const acl of acls) expect(acl).toEqual({ signature: acl.signature, publicExecute: false,
        anonExecute: false, authenticatedExecute: false, serviceRoleExecute: false });
      for (const entry of entries) {
        const before = await b.snapshot(fx);
        expect((await b.direct(fx.clients.admin, plan.attempt, entry)).error).not.toBeNull();
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-012 all checked RPC entrypoints enforce caller identity and current matrix (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      const entries = (await b.sqlInventory(fx, attempt)).filter((entry) => entry.kind === "checked");
      expect(entries.length).toBeGreaterThan(0);
      const before = await b.snapshot(fx);
      for (const role of deniedRoles) {
        for (const entry of entries) {
          const reply = await b.direct(fx.clients[role], attempt, entry);
          expect(reply.error).not.toBeNull();
          expect(reply.data).toBeNull();
          expect(await b.snapshot(fx)).toEqual(before);
        }
      }
    });
  });

  test.skip("[P0] 15.2-RLS-013 same-tenant SQL lineage/slot/index integrity resists direct authenticated bypass (AC5/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      for (const attack of ["successor", "nominal-pivot", "proposed-id", "source-revision"] as const) {
        const malicious = await b.attack(fx, attempt, attack);
        const before = await b.snapshot(fx);
        expect((await b.direct(fx.clients.planner, malicious)).error).not.toBeNull();
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P1] 15.2-RLS-014 authorized standalone bookings preserve valid optional-null links (AC7)", async () => {
    for (const role of ["admin", "planner"] as const) {
      await scenario(async (b, fx) => {
        const created = await b.standaloneOptionalLinks(fx, role);
        expect(created.result.ok).toBe(true);
        expect(created.row).toMatchObject({ id: created.result.bookingId, tenant_id: fx.tenantIds[0],
          job_id: null, customer_id: null, facility_id: null, contact_id: null, series_id: null, is_exception: false });
        expect(typeof created.row.id).toBe("string");
      });
    }
  });
});
