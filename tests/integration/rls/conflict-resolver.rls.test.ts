import {beforeAll,describe,expect,test,vi} from "vitest";
import {withBookingFixture,seedBookingReadRows} from "../../support/bookings-atdd";
import {adminQuery,adminSession} from "../../factories/admin-sql";
import {isLocalStackReachable,LOCAL_SUPABASE_ANON_KEY,LOCAL_SUPABASE_URL} from "../../support/test-env";
import {skipUnlessStack} from "../../support/stack-gate";
import {createClient} from "@supabase/supabase-js";
import * as dbFactory from "@/server/db/supabase-server-client";
import {PUT} from "@/app/api/notifications/preferences/route";
import {makeAuthedServerClient} from "../../factories/tenants";
import {readBookingConflicts} from "@/server/read-models/booking-conflicts";
import {runCommand} from "@/server/commands/envelope";
import {resolveBookingConflict} from "@/server/commands/bookings/resolve-booking-conflict";
import {conflictSuggestionsAction,previewConflictResolutionAction} from "@/features/resources/booking-conflict-actions";
let up=false;beforeAll(async()=>{up=await isLocalStackReachable();});
describe("15.3 resolver least privilege",()=>{
 test("15.3-RLS-001 only current managers read safe history; own-only, foreign and anonymous paths cannot inspect or mutate it",async ctx=>{if(skipUnlessStack(ctx,up))return;await withBookingFixture(async fx=>{
  const own=await seedBookingReadRows(fx.base.tenantA.id,fx.ownProfile.id),foreign=await seedBookingReadRows(fx.base.tenantB.id,fx.foreignProfile.id);
  try{
   for(const [tenant,actor,booking] of [[fx.base.tenantA.id,fx.base.adminA.id,own.bookings],[fx.base.tenantB.id,fx.base.adminB.id,foreign.bookings]])await adminQuery("insert into public.booking_conflict_resolutions(tenant_id,actor_id,command_id,booking_id,request_digest,action,outcome,target_keys,affected_booking_ids,result) values($1,$2,gen_random_uuid(),$3,repeat('a',64),'accept','accepted','[]',array[$3::uuid],'{}')",[tenant,actor,booking]);
   const columns="id,tenant_id,actor_id,booking_id,action,outcome,affected_booking_ids,created_at";
   for(const client of [fx.adminClient,fx.plannerClient]){
    const safe=await client.from("booking_conflict_resolutions").select(columns).eq("tenant_id",fx.base.tenantA.id);expect(safe.error).toBeNull();expect(safe.data).toHaveLength(1);
    expect(await client.from("booking_conflict_resolutions").select("request_digest,result,target_keys,command_id")).toMatchObject({error:{code:"42501"}});
    const history=await client.rpc("booking_conflict_history",{p_tenant_id:fx.base.tenantA.id,p_actor_id:client===fx.adminClient?fx.base.adminA.id:fx.users.projektledare.id});expect(history.error).toBeNull();expect(Object.keys(history.data[0]).sort()).toEqual(["action","actorLabel","affectedBookingIds","bookingId","createdAt","id","outcome"]);
   }
   expect((await fx.montorClient.from("booking_conflict_resolutions").select(columns)).data).toEqual([]);
   expect((await fx.foreignClient.from("booking_conflict_resolutions").select(columns).eq("tenant_id",fx.base.tenantA.id)).data).toEqual([]);
   const anon=createClient(LOCAL_SUPABASE_URL,LOCAL_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
   for(const [client,actor] of [[fx.montorClient,fx.users.montor.id],[fx.foreignClient,fx.base.adminB.id],[anon,null]] as const){
    expect(await client.rpc("booking_conflict_resolver_snapshot",{p_tenant_id:fx.base.tenantA.id,p_actor_id:actor,p_correlation_id:crypto.randomUUID(),p_command_id:crypto.randomUUID(),p_input:null,p_decision:null,p_key_id:null})).toMatchObject({error:{code:"42501"}});
    expect(await client.rpc("booking_conflict_history",{p_tenant_id:fx.base.tenantA.id,p_actor_id:actor})).toMatchObject({error:{code:"42501"}});
   }
   for(const verb of ["insert","update","delete"] as const){const query=verb==="insert"?fx.adminClient.from("booking_conflict_resolutions").insert({tenant_id:fx.base.tenantA.id}):verb==="update"?fx.adminClient.from("booking_conflict_resolutions").update({outcome:"remaining"}).eq("tenant_id",fx.base.tenantA.id):fx.adminClient.from("booking_conflict_resolutions").delete().eq("tenant_id",fx.base.tenantA.id);expect(await query).toMatchObject({error:{code:"42501"}});}
  }finally{await adminSession(async({query})=>{await query("begin");try{await query("set local session_replication_role=replica");await query("delete from public.booking_conflict_resolutions where tenant_id=any($1::uuid[])",[fx.tenantIds]);await query("commit");}catch(e){await query("rollback");throw e;}});}
 });});
 test("15.3-RLS-002 booking preference/channel SQL and API reject email while preserving self-scope and quote email",async ctx=>{if(skipUnlessStack(ctx,up))return;await withBookingFixture(async fx=>{
  const preference={tenant_id:fx.base.tenantA.id,user_id:fx.users.montor.id,category:"booking.changed",channel:"in_app",enabled:false};
  expect((await fx.montorClient.from("notification_preferences").insert(preference)).error).toBeNull();
  const before=await adminQuery("select * from public.notification_preferences where tenant_id=$1 order by id",[fx.base.tenantA.id]);
  const email=await fx.montorClient.from("notification_preferences").insert({...preference,channel:"email"});expect(email.error?.code).toBe("23514");expect(email.error?.message).toContain("notification_preferences_booking_channel_check");
  expect((await fx.foreignClient.from("notification_preferences").insert(preference)).error?.code).toBe("42501");expect(await adminQuery("select * from public.notification_preferences where tenant_id=$1 order by id",[fx.base.tenantA.id])).toEqual(before);
  const client=vi.spyOn(dbFactory,"createSupabaseServerClient").mockResolvedValue(fx.montorClient as never);
  try{const reply=await PUT(new Request("http://localhost/api/notifications/preferences",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({category:"booking.changed",channel:"email",enabled:true})}));expect(reply.status).toBe(422);}finally{client.mockRestore();}
  expect((await fx.montorClient.from("notification_preferences").insert({...preference,category:"quote.follow_up_due",channel:"email",enabled:true})).error).toBeNull();
  const subject=crypto.randomUUID();await adminQuery("insert into public.email_outbox(tenant_id,recipient_hash,category,subject_type,subject_id,logical_period,template_key,template_version,template_params) values($1,repeat('a',64),'quote.follow_up_due','quote',$2,'2026-10-20','follow_up_due',1,'{}')",[fx.base.tenantA.id,subject]);
  const outbox=await adminQuery("select * from public.email_outbox where tenant_id=$1 order by id",[fx.base.tenantA.id]);
  await expect(adminQuery("insert into public.email_outbox(tenant_id,recipient_hash,category,subject_type,subject_id,logical_period,template_key,template_version,template_params) values($1,repeat('a',64),'booking.changed','quote',$2,'2026-10-20','follow_up_due',1,'{}')",[fx.base.tenantA.id,subject])).rejects.toMatchObject({code:"23514",constraint:"email_outbox_booking_channel_check"});
  expect(await adminQuery("select * from public.email_outbox where tenant_id=$1 order by id",[fx.base.tenantA.id])).toEqual(outbox);
 });});
 test("15.3-RLS-003 checked entries are authenticated-only and every helper/trigger is owner-only with empty search path",async ctx=>{if(skipUnlessStack(ctx,up))return;
  const checked=["booking_conflict_resolver_snapshot","finalize_booking_conflict_resolution","booking_conflict_history"],names=[...checked,"booking_conflict_refresh_internal","booking_conflict_resolver_baseline_internal","booking_conflict_resolution_replay_internal","emit_booking_changed_internal","enforce_booking_conflict_resolution_immutable"];
  const rows=await adminQuery<{name:string;config:string[];anon:boolean;authenticated:boolean;service:boolean;public_execute:boolean}>("select p.proname name,p.proconfig config,has_function_privilege('anon',p.oid,'EXECUTE') anon,has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated,has_function_privilege('service_role',p.oid,'EXECUTE') service,exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public_execute from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=any($1::text[])",[names]);
  expect(rows).toHaveLength(names.length);for(const row of rows){expect(row).toMatchObject({anon:false,service:false,public_execute:false,authenticated:checked.includes(row.name)});expect(row.config).toContain('search_path=""');}
 });
 test("15.3-RLS-004 current multi-role manager can scan; sales/economy/inactive/own-only cannot preview, suggest, commit or read peers",async ctx=>{if(skipUnlessStack(ctx,up))return;await withBookingFixture(async fx=>{
  const union=await makeAuthedServerClient(fx.roleUnionUser);expect(await readBookingConflicts({}, {client:union as never})).toMatchObject({status:"success"});
  for(const user of [fx.users.montor,fx.users.saljare,fx.users.ekonomi,fx.invitedUser,fx.disabledUser]){
   const client=await makeAuthedServerClient(user),input={commandId:crypto.randomUUID(),bookingId:crypto.randomUUID(),action:"accept",targetLogicalIds:["not-an-authority"],payload:null,wholeSeries:false};
   expect(await readBookingConflicts({}, {client:client as never})).toMatchObject({status:"error"});expect(await runCommand(resolveBookingConflict,{client:client as never,input})).toMatchObject({ok:false});
   const port=vi.spyOn(dbFactory,"createSupabaseServerClient").mockResolvedValue(client as never);
   try{expect(await conflictSuggestionsAction(input.bookingId)).toMatchObject({status:"error"});expect(await previewConflictResolutionAction(input)).toMatchObject({status:"error"});}finally{port.mockRestore();}
  }
 });});
});
