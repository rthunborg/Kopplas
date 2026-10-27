import {beforeAll,describe,expect,test,vi} from "vitest";
import * as dbFactory from "@/server/db/supabase-server-client";
import {conflictSuggestionsAction} from "@/features/resources/booking-conflict-actions";
import {runCommand} from "@/server/commands/envelope";
import {resolveBookingConflict} from "@/server/commands/bookings/resolve-booking-conflict";
import {snapshotConflictResolver,previewConflictResolution,planConflictResolution,type ResolutionArgs} from "@/server/bookings/conflict-resolution";
import {openResolutionReceipt,sealResolutionReceipt,signResolution} from "@/server/bookings/conflict-resolution-attestation";
import {bookingConflictKeyFromEnv,signConflictOutput,type ConflictClaims} from "@/server/bookings/conflict-attestation";
import {snapshotBookingConflicts,previewBookingConflicts} from "@/server/bookings/conflict-facts";
import {previewBookingEditor} from "@/server/bookings/editor-preview";
import {scanBookingConflicts} from "@/server/read-models/booking-conflicts";
import type {ResolutionInput,ResolutionRequest} from "@/features/scheduling/conflict-resolver-types";
import {adminQuery,adminSession} from "../../factories/admin-sql";
import {bookingCommand,bookingInput,bookingSnapshot,withBookingFixture,withBookingFault,seedBookingParents,type BookingFixture} from "../../support/bookings-atdd";
import {realSeriesInput,reviewRealSeries as reviewProductionSeries} from "../../support/booking-series-atdd";
import {validateBookingSeries,type BookingSeriesInput} from "@/server/commands/bookings/series-validation";
import {createBookingSeries} from "@/server/commands/bookings/create-booking-series";
import {updateBookingSeries} from "@/server/commands/bookings/update-booking-series";
import {invokeJobCard} from "../../support/jobs-depth-atdd";
import {isLocalStackReachable} from "../../support/test-env";
import {skipUnlessStack} from "../../support/stack-gate";
import {waitForBlocked} from "../../support/booking-conflicts-atdd";
import {resolutionRequest,validateConflictResolution} from "@/server/commands/bookings/conflict-resolution-validation";
let up=false;beforeAll(async()=>{up=await isLocalStackReachable();});
async function reviewRealSeries(fx:BookingFixture,input:BookingSeriesInput,options?:Parameters<typeof reviewProductionSeries>[2]){
 const normalized=validateBookingSeries(input,Boolean(input.sourceSeriesId));if(!normalized.ok)throw new Error(`Series fixture validation: ${normalized.code}`);
 return reviewProductionSeries(fx,normalized.data,options);
}
function expectOk<T extends {ok:boolean;code?:string}>(result:T,stage:string):T {
 expect(result.ok,JSON.stringify({stage,code:result.ok?"OK":result.code&&/^[A-Z_]+$/.test(result.code)?result.code:"UNKNOWN"})).toBe(true);return result;
}
async function fixture(run:(fx:BookingFixture)=>Promise<void>){await withBookingFixture(async fx=>{try{await run(fx);}finally{
  await adminSession(async({query})=>{await query("begin");try{await query("set local session_replication_role=replica");await query("delete from public.booking_conflict_resolutions where tenant_id=any($1::uuid[])",[fx.tenantIds]);await query("commit");}catch(e){await query("rollback");throw e;}});
}});}
const args=(fx:BookingFixture,commandId=crypto.randomUUID()):ResolutionArgs=>({p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:commandId});
async function state(fx:BookingFixture){return {...await bookingSnapshot(fx.tenantIds),ledger:await adminQuery("select * from public.booking_conflict_resolutions where tenant_id=any($1::uuid[]) order by id",[fx.tenantIds]),notifications:await adminQuery("select * from public.notifications where tenant_id=any($1::uuid[]) order by id",[fx.tenantIds]),series:await adminQuery("select * from public.booking_series where tenant_id=any($1::uuid[]) order by id",[fx.tenantIds])};}
async function seed(fx:BookingFixture,count=2){
  for(const profile of [fx.ownProfile,fx.adminProfile,fx.coworkerProfile])for(let d=1;d<=5;d++)await adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,weekday,starts_at,ends_at) values($1,$2,'weekly_shift',$3,'07:00','17:00')",[fx.base.tenantA.id,profile.id,d]);
  const ids:string[]=[];for(let i=0;i<count;i++){const result=await bookingCommand("create",fx.adminClient,bookingInput([fx.ownProfile.id],{startsAt:"2026-10-12T06:00:00Z",endsAt:"2026-10-12T07:00:00Z",description:`Resolver participant ${i}`}));expect(result.ok).toBe(true);if(!result.ok)throw new Error(result.code);ids.push(result.data.bookingId);}
  return ids;
}
async function prepare(fx:BookingFixture,bookingId:string,action:ResolutionInput["action"]="accept",patch:Partial<ResolutionRequest>={}){
  const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),booking=scan.bookings.find(b=>b.id===bookingId)!;
  const target=(patch.targetLogicalIds?scan.groups.find(g=>patch.targetLogicalIds!.includes(g.logicalId)):undefined)??scan.groups.find(g=>g.rule==="double_booking"&&g.bookingIds.includes(bookingId))??scan.groups.find(g=>g.bookingIds.includes(bookingId));if(!target)throw new Error("Expected real detected target");
  const normalized=validateConflictResolution({commandId:crypto.randomUUID(),bookingId,action,targetLogicalIds:[target.logicalId],payload:action==="accept"?null:{...booking.payload,startsAt:"2026-10-12T09:00:00.000000Z",endsAt:"2026-10-12T10:00:00.000000Z"},wholeSeries:false,...patch});
  if(!normalized.ok)throw new Error("Real resolver validator rejected fixture input");const input=normalized.data;
  const preview=await previewConflictResolution(fx.adminClient,args(fx,input.commandId),input);
  return {input:{...input,review:{receipt:preview.receipt,decision:{acknowledged:preview.warnings.length>0,reason:preview.warnings.length?"Reviewed current complete warnings":"",reviewedLogicalIds:preview.warnings.map(g=>g.logicalId),selectedLogicalIds:action==="accept"?input.targetLogicalIds:[]}}},preview,target};
}
async function command(fx:BookingFixture,input:ResolutionInput,correlationId=crypto.randomUUID()) {
 const sqlStates:{rpc:string;code:string}[]=[];
 const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{const reply=await target.rpc(name,args);if(reply.error&&["booking_conflict_resolver_snapshot","finalize_booking_conflict_resolution"].includes(name))sqlStates.push({rpc:name,code:/^[A-Z0-9]{5}$/.test(reply.error.code)?reply.error.code:"UNKNOWN"});return reply;};const value=Reflect.get(target,key,target);return typeof value==="function"?value.bind(target):value;}});
 const result=await runCommand(resolveBookingConflict,{client:client as never,input,correlationId});if(!result.ok)console.info("15.3-safe-command",JSON.stringify({action:input.action,wholeSeries:input.wholeSeries,following:Boolean(input.following),code:result.code,sqlStates}));return result;
}
describe("15.3 actual checked resolver transactions",()=>{
 test("15.3-INT-017 common assignment and both all-day conversions persist literal microseconds and original nominal bounds",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  await seed(fx);const base=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:2,startTime:"08:00:00.123456",endTime:"08:00:00.223456"},template:{...realSeriesInput(fx).template,startsAt:"2026-10-12T06:00:00.123456Z",endsAt:"2026-10-12T06:00:00.223456Z"}});
  expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,base)).input})).toMatchObject({ok:true});
  const ids=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[base.seriesId]),assignees=[fx.ownProfile.id,fx.coworkerProfile.id].sort();
  const literal=async()=>adminQuery("select id,to_char(nominal_date,'YYYY-MM-DD') date,to_char(starts_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') start,to_char(ends_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') end,all_day from public.bookings where series_id=$1 order by nominal_date",[base.seriesId]);
  const assignment=await prepare(fx,ids[0].id,"reassign",{wholeSeries:true,payload:{...base.template,assigneeIds:assignees}});expect(expectOk(await command(fx,assignment.input),"INT017-common-assignment")).toMatchObject({ok:true});
  const timed=[12,13].map((d,i)=>({id:ids[i].id,date:`2026-10-${d}`,start:`2026-10-${d}T06:00:00.123456Z`,end:`2026-10-${d}T06:00:00.223456Z`,all_day:false}));expect(await literal()).toEqual(timed);
  const day=await prepare(fx,ids[0].id,"adjust",{wholeSeries:true,payload:{...base.template,assigneeIds:assignees,allDay:true,startsAt:"2026-10-11T22:00:00.000000Z",endsAt:"2026-10-12T22:00:00.000000Z"}});expect(await command(fx,day.input)).toMatchObject({ok:true});
  expect(await literal()).toEqual([{id:ids[0].id,date:"2026-10-12",start:"2026-10-11T22:00:00.000000Z",end:"2026-10-12T22:00:00.000000Z",all_day:true},{id:ids[1].id,date:"2026-10-13",start:"2026-10-12T22:00:00.000000Z",end:"2026-10-13T22:00:00.000000Z",all_day:true}]);
  const back=await prepare(fx,ids[0].id,"adjust",{wholeSeries:true,payload:{...base.template,assigneeIds:assignees}});expect(await command(fx,back.input)).toMatchObject({ok:true});expect(await literal()).toEqual(timed);
  expect(await adminQuery("select rule->>'startDate' anchor,rule->>'count' count,ends_before,predecessor_id,successor_id from public.booking_series where id=$1",[base.seriesId])).toEqual([{anchor:"2026-10-12",count:"2",ends_before:null,predecessor_id:null,successor_id:null}]);
  for(const row of ids)expect(await adminQuery("select person_profile_id::text id from public.booking_assignees where booking_id=$1 order by person_profile_id",[row.id])).toEqual(assignees.map(id=>({id})));
 });});
 test("15.3-INT-013 returning capacity identity from changed work hours reopens before selective acceptance",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const [id]=await seed(fx,1);await adminQuery("update public.person_work_hours set starts_at='08:00',ends_at='08:30' where person_profile_id=$1 and weekday=1",[fx.ownProfile.id]);
  const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),target=scan.groups.find(g=>g.rule==="over_capacity"&&g.bookingIds.includes(id))!,b=scan.bookings.find(b=>b.id===id)!;
  const fix=await prepare(fx,id,"adjust",{targetLogicalIds:[target.logicalId],payload:{...b.payload,endsAt:"2026-10-12T06:15:00.000000Z"}});expect(await command(fx,fix.input)).toMatchObject({ok:true,data:{outcome:"resolved"}});
  expect((await state(fx)).conflicts.filter(c=>target.keys.includes(String(c.natural_key))).every(c=>c.status==="resolved")).toBe(true);
  // No booking refresh writer intervenes: only capacity facts change.
  await adminQuery("update public.person_work_hours set ends_at='08:05' where person_profile_id=$1 and weekday=1",[fx.ownProfile.id]);
  const accept=await prepare(fx,id,"accept",{targetLogicalIds:[target.logicalId]});expect(accept.target.logicalId).toBe(target.logicalId);
  expect(await command(fx,accept.input)).toMatchObject({ok:true,data:{outcome:"accepted"}});
  const after=await state(fx),rows=after.conflicts.filter(c=>target.keys.includes(String(c.natural_key)));expect(rows).toHaveLength(target.keys.length);
  expect(rows.every(c=>c.status==="accepted"&&c.resolution_outcome===null&&c.resolved_at===null&&c.resolved_by_membership_id===null&&c.accepted_by_membership_id===fx.adminProfile.membershipId)).toBe(true);
  const again=await prepare(fx,id,"accept",{targetLogicalIds:[target.logicalId]});expect(await command(fx,again.input)).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});expect(await state(fx)).toEqual(after);
 });});
 test("15.3-INT-014 successful still-conflicting adjustment persists remaining history and open workflow",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const ids=await seed(fx),scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),b=scan.bookings.find(b=>b.id===ids[0])!;
  const ready=await prepare(fx,ids[0],"adjust",{payload:{...b.payload,description:"Reviewed change with conflict remaining"}}),before=await state(fx);
  expect(await command(fx,ready.input)).toMatchObject({ok:true,data:{outcome:"remaining"}});const after=await state(fx);
  expect(after.ledger).toHaveLength(1);expect(after.ledger[0]).toMatchObject({outcome:"remaining",action:"adjust"});expect(after.audit).toHaveLength(before.audit.length+1);
  expect(after.conflicts.filter(c=>ready.target.keys.includes(String(c.natural_key))).every(c=>c.status==="open"&&c.resolved_at===null&&c.accepted_at===null)).toBe(true);
  expect(after.bookings.find(b=>b.id===ids[0])?.description).toBe("Reviewed change with conflict remaining");expect(after.assignees).toEqual(before.assignees);
  const history=await fx.adminClient.rpc("booking_conflict_history",{p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id});expect(history.error).toBeNull();expect(history.data).toMatchObject([{outcome:"remaining",action:"adjust"}]);
 });});
 test("15.3-INT-015 genuine receipt identity mismatch denies while its complete target is still current",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const [id]=await seed(fx),ready=await prepare(fx,id),before=await state(fx);
  expect((await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id)).groups.some(g=>g.logicalId===ready.target.logicalId)).toBe(true);
  expect(await command(fx,{...ready.input,commandId:crypto.randomUUID()})).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});expect(await state(fx)).toEqual(before);
 });});
 test("15.3-INT-016 following resolver split preserves prefix, protected payloads, stable ids and an existing successor bound",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  await seed(fx);const base=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:6,startTime:"08:00:00",endTime:"09:00:00"}});
  expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,base)).input})).toMatchObject({ok:true});
  const original=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[base.seriesId]);
  await adminQuery("update public.bookings set is_exception=true,description='Following preserved exception' where id=$1",[original[1].id]);await adminQuery("update public.bookings set status='cancelled',is_exception=true where id=$1",[original[2].id]);
  const [source]=await adminQuery<{version:number}>("select version from public.booking_series where id=$1",[base.seriesId]),laterId=crypto.randomUUID();
  const later={...base,commandId:crypto.randomUUID(),seriesId:laterId,sourceSeriesId:base.seriesId,expectedVersion:source.version,pivotOccurrenceId:original[4].id,rule:{...base.rule,startDate:"2026-10-16"}};
  expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,later)).input})).toMatchObject({ok:true});
  expect(await bookingCommand("create",fx.adminClient,bookingInput([fx.ownProfile.id],{startsAt:"2026-10-13T06:00:00Z",endsAt:"2026-10-13T07:00:00Z"}))).toMatchObject({ok:true});
  const [current]=await adminQuery<{version:number}>("select version from public.booking_series where id=$1",[base.seriesId]);
  const successorId=crypto.randomUUID(),commandId=crypto.randomUUID(),following={...base,commandId,seriesId:successorId,sourceSeriesId:base.seriesId,expectedVersion:current.version,pivotOccurrenceId:original[1].id,
    rule:{...base.rule,startDate:"2026-10-13",startTime:"11:00:00",endTime:"12:00:00"},template:{...base.template,startsAt:"2026-10-13T09:00:00.000000Z",endsAt:"2026-10-13T10:00:00.000000Z"}};
  const ready=await prepare(fx,original[1].id,"adjust",{commandId,following,payload:following.template});
  expect(ready.preview.affectedBookingIds.sort()).toEqual(original.slice(1,4).map(r=>r.id).sort());const before=await state(fx);
  const immutable=await adminQuery("select * from public.bookings where id=any($1::uuid[]) order by id",[[original[0].id,original[4].id,original[5].id]]);
  const protectedPayloads=await adminQuery("select id,starts_at,ends_at,status,description,is_exception from public.bookings where id=any($1::uuid[]) order by id",[[original[1].id,original[2].id]]);
  const result=await command(fx,ready.input);expect(result).toMatchObject({ok:true,data:{outcome:"remaining"}});
  expect(await adminQuery("select * from public.bookings where id=any($1::uuid[]) order by id",[[original[0].id,original[4].id,original[5].id]])).toEqual(immutable);
  expect(await adminQuery("select id,starts_at,ends_at,status,description,is_exception from public.bookings where id=any($1::uuid[]) order by id",[[original[1].id,original[2].id]])).toEqual(protectedPayloads);
  expect(await adminQuery("select id from public.bookings where series_id=$1 order by nominal_date",[successorId])).toEqual(original.slice(1,4));
  expect(await adminQuery("select to_char(starts_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') start from public.bookings where id=$1",[original[3].id])).toEqual([{start:"2026-10-15T09:00:00Z"}]);
  expect(await adminQuery("select predecessor_id,successor_id,to_char(ends_before,'YYYY-MM-DD') bound from public.booking_series where id=$1",[successorId])).toEqual([{predecessor_id:base.seriesId,successor_id:laterId,bound:"2026-10-16"}]);
  expect(await adminQuery("select successor_id,to_char(ends_before,'YYYY-MM-DD') bound from public.booking_series where id=$1",[base.seriesId])).toEqual([{successor_id:successorId,bound:"2026-10-13"}]);
  const after=await state(fx);expect(after.audit).toHaveLength(before.audit.length+1);expect(after.ledger).toHaveLength(1);expect(await command(fx,ready.input)).toEqual(result);expect(await state(fx)).toEqual(after);
 });});
 test("15.3-INT-012 real available slot and matching-role person suggestions commit through fresh checked preview",async ctx=>{if(skipUnlessStack(ctx,up))return;
  for(const mode of ["move","reassign"] as const)await fixture(async fx=>{
   const ids=await seed(fx),parents=await seedBookingParents(fx.base.tenantA.id);
   await adminQuery("update public.person_profiles set default_work_role_id=$2 where id=any($1::uuid[])",[[fx.ownProfile.id,fx.coworkerProfile.id],parents.workRoleId]);
   const port=vi.spyOn(dbFactory,"createSupabaseServerClient").mockResolvedValue(fx.adminClient as never);
   let suggestions:Awaited<ReturnType<typeof conflictSuggestionsAction>>;
   try{suggestions=await conflictSuggestionsAction(ids[0],mode==="reassign"?fx.ownProfile.id:undefined);}finally{port.mockRestore();}
   expect(suggestions.status).toBe("success");if(suggestions.status!=="success")throw new Error(suggestions.code);
   const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),booking=scan.bookings.find(b=>b.id===ids[0])!;
   const candidate=mode==="move"?suggestions.slots[0]:suggestions.people.find(p=>p.personId===fx.coworkerProfile.id);
   expect(candidate?.availability).toMatchObject({status:"available",capacityMinutes:600,loadMinutes:mode==="move"?60:0});
   expect(suggestions.people.some(p=>p.personId===fx.adminProfile.id)).toBe(false);
   if(!candidate)throw new Error("Expected an actual available suggestion");
   const payload=mode==="move"&&"startsAt" in candidate?{...booking.payload,startsAt:candidate.startsAt,endsAt:candidate.endsAt}:{...booking.payload,assigneeIds:[fx.coworkerProfile.id]};
   const ready=await prepare(fx,ids[0],mode,{payload});
   await adminQuery("update public.person_profiles set employment_percentage=75 where id=$1",[fx.ownProfile.id]);const before=await state(fx);
   expect(await command(fx,ready.input)).toMatchObject({ok:false,code:"PREVIEW_STALE"});expect(await state(fx)).toEqual(before);
   const fresh=await prepare(fx,ids[0],mode,{payload});expect(await command(fx,fresh.input)).toMatchObject({ok:true,data:{outcome:"resolved"}});
   const persisted=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id);
   expect(persisted.bookings.find(b=>b.id===ids[0])?.payload).toMatchObject(payload);expect(persisted.groups.some(g=>g.logicalId===fresh.target.logicalId)).toBe(false);
  });
 });
 test("15.3-INT-002 accept-only is selective, immutable, replayable and never diverges an occurrence",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  await seed(fx);const series=realSeriesInput(fx,{template:{...realSeriesInput(fx).template,startsAt:"2026-10-12T06:00:00Z",endsAt:"2026-10-12T07:00:00Z"},rule:{...realSeriesInput(fx).rule,startTime:"08:00:00",endTime:"09:00:00"}});
  expect(expectOk(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,series)).input}),"INT002-create-series")).toMatchObject({ok:true});
  const [{id}]=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[series.seriesId]);const ready=await prepare(fx,id),before=await state(fx),result=await command(fx,ready.input);expect(result).toMatchObject({ok:true,data:{outcome:"accepted"}});
  const after=await state(fx);expect(after.bookings).toEqual(before.bookings);expect(after.assignees).toEqual(before.assignees);expect(after.series).toEqual(before.series);
  expect(after.ledger).toHaveLength(1);expect(after.audit).toHaveLength(before.audit.length+1);expect(after.notifications).toHaveLength(1);
  const selected=after.conflicts.filter(c=>ready.target.keys.includes(String(c.natural_key)));expect(selected).toHaveLength(ready.target.keys.length);expect(selected.every(c=>c.status==="accepted"&&c.accepted_by_membership_id===fx.adminProfile.membershipId&&c.accepted_at!==null)).toBe(true);
  expect(after.conflicts.filter(c=>!ready.target.keys.includes(String(c.natural_key))).every(c=>c.status==="open")).toBe(true);
  expect(await command(fx,ready.input)).toEqual(result);expect(await state(fx)).toEqual(after);
  expect(await command(fx,{...ready.input,review:{...ready.input.review!,decision:{...ready.input.review!.decision,reason:"Changed content"}}})).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});expect(await state(fx)).toEqual(after);
  await expect(adminQuery("update public.booking_conflict_resolutions set outcome='remaining' where id=$1",[after.ledger[0].id])).rejects.toMatchObject({code:"42501"});
 });});
 test("15.3-INT-001 move resolves only disappeared targets; later single, series and job-card writers retain/reopen history",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const ids=await seed(fx),ready=await prepare(fx,ids[0],"move"),result=await command(fx,ready.input);expect(result).toMatchObject({ok:true,data:{outcome:"resolved"}});
  const history=await adminQuery("select * from public.booking_conflict_resolutions where tenant_id=$1",[fx.base.tenantA.id]);
  expect(await adminQuery("select status from public.booking_conflicts where tenant_id=$1 and natural_key=any($2::text[])",[fx.base.tenantA.id,ready.target.keys])).toEqual(ready.target.keys.map(()=>({status:"resolved"})));
  const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),b=scan.bookings.find(b=>b.id===ids[0])!;
  expect(await bookingCommand("update",fx.adminClient,{...b.payload,assigneeIds:[...b.payload.assigneeIds],bookingId:b.id,commandId:crypto.randomUUID(),description:"Unrelated description refresh"})).toMatchObject({ok:true});
  const series=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,startDate:"2026-10-15"}});expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,series)).input})).toMatchObject({ok:true});
  const parents=await seedBookingParents(fx.base.tenantA.id);const card={commandId:crypto.randomUUID(),type:"order",title:"Refresh unrelated card",customer_id:parents.customerId,facility_id:parents.facilityId,contact_id:parents.contactId,
   priority:"normal",estimated_duration_minutes:null,planned_travel_minutes:null,crew_size:null,earliest_date:null,desired_date:null,latest_date:null,customer_presence_required:false,
   requiredWorkRoleIds:null,accessWindows:null,dependencyJobIds:[]};
  expect(await invokeJobCard(fx.adminClient,"create",card)).toMatchObject({ok:true});
  expect(await adminQuery("select status from public.booking_conflicts where tenant_id=$1 and natural_key=any($2::text[])",[fx.base.tenantA.id,ready.target.keys])).toEqual(ready.target.keys.map(()=>({status:"resolved"})));
  expect(await bookingCommand("update",fx.adminClient,{...b.payload,assigneeIds:[...b.payload.assigneeIds],bookingId:b.id,commandId:crypto.randomUUID(),startsAt:"2026-10-12T06:00:00.000000Z",endsAt:"2026-10-12T07:00:00.000000Z"})).toMatchObject({ok:true});
  expect((await adminQuery("select status,resolved_at,resolution_outcome from public.booking_conflicts where tenant_id=$1 and natural_key=any($2::text[])",[fx.base.tenantA.id,ready.target.keys])).every(c=>c.status==="open"&&c.resolved_at===null&&c.resolution_outcome===null)).toBe(true);
  expect(await adminQuery("select * from public.booking_conflict_resolutions where tenant_id=$1",[fx.base.tenantA.id])).toEqual(history);expect(await command(fx,ready.input)).toEqual(result);
  const bodies=await adminQuery<{name:string;body:string}>("select proname name,prosrc body from pg_proc where oid=any(array['public.booking_commit_editor_internal(uuid,uuid,uuid,uuid,uuid,jsonb,uuid,jsonb,jsonb,jsonb)'::regprocedure,'public.finalize_booking_series(uuid,uuid,uuid,uuid,jsonb,jsonb,text,text,jsonb,text,text,jsonb)'::regprocedure,'public.finalize_job_card(uuid,uuid,uuid,uuid,uuid,uuid,jsonb,jsonb,text,text)'::regprocedure])");
  expect(bodies).toHaveLength(3);expect(bodies.every(b=>b.body.includes('perform public.booking_conflict_refresh_internal('))).toBe(true);
 });});
 test("15.3-INT-003 current workflow, description/customer baseline and complete aggregate proofs reject stale/partial/unrelated writes",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const ids=await seed(fx,4);for(const id of ids)await adminQuery("update public.bookings set ends_at='2026-10-12T15:00:00Z' where id=$1",[id]);
  const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),aggregate=scan.groups.find(g=>g.rule==="over_capacity"&&g.bookingIds.length===4)!;expect(aggregate.keys.length).toBe(3);
  const ready=await prepare(fx,ids[2],"accept",{targetLogicalIds:[aggregate.logicalId]});
  const a=args(fx,ready.input.commandId),snapshot=await snapshotConflictResolver(fx.adminClient,a,resolutionRequest(ready.input));if(snapshot.kind!=="snapshot")throw new Error();
  const plan=planConflictResolution(snapshot,ready.input),key=bookingConflictKeyFromEnv(),partial={...plan,targets:plan.targets.map(g=>({...g,keys:g.keys.slice(0,1)}))};
  const before=await state(fx),body=JSON.stringify(partial),denied=await fx.adminClient.rpc("finalize_booking_conflict_resolution",{...a,p_input:((({review:_,...request})=>{void _;return request;})(ready.input)),p_decision:ready.input.review!.decision,p_claims:snapshot.claims,p_plan:body,p_signature:signResolution(snapshot.claims,body,key.secret)});
  expect(denied.error?.code).toBe("42501");expect(await state(fx)).toEqual(before);
  const other=await prepare(fx,ids[2]);await adminQuery("update public.bookings set description='Changed after preview' where id=$1",[ids[2]]);const changed=await state(fx);
  expect(await command(fx,other.input)).toMatchObject({ok:false,code:"PREVIEW_STALE"});expect(await state(fx)).toEqual(changed);
  const customer=await prepare(fx,ids[2]),parents=await seedBookingParents(fx.base.tenantA.id);await adminQuery("update public.bookings set customer_id=$2 where id=$1",[ids[2],parents.customerId]);const customerChanged=await state(fx);
  expect(await command(fx,customer.input)).toMatchObject({ok:false,code:"PREVIEW_STALE"});expect(await state(fx)).toEqual(customerChanged);
  const workflow=await prepare(fx,ids[2]);await command(fx,(await prepare(fx,ids[2])).input);const accepted=await state(fx);expect(await command(fx,workflow.input)).toMatchObject({ok:false,code:"PREVIEW_STALE"});expect(await state(fx)).toEqual(accepted);
  expect(await command(fx,{...workflow.input,commandId:crypto.randomUUID(),targetLogicalIds:["unrelated"]})).toMatchObject({ok:false});
 });});
 test("15.3-INT-010 genuine single and series review receipts and genuine single signature cannot authorize resolver",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const ids=await seed(fx),ready=await prepare(fx,ids[0]),scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),payload=scan.bookings.find(b=>b.id===ids[0])!.payload;
  const a=args(fx,ready.input.commandId),donor=await previewBookingEditor(fx.adminClient,{...a,p_booking_id:ids[0],p_payload:payload}),before=await state(fx);
  expect(await command(fx,{...ready.input,review:{...ready.input.review!,receipt:donor.receipt}})).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});
  const series=await reviewRealSeries(fx,realSeriesInput(fx));expect(await command(fx,{...ready.input,review:{...ready.input.review!,receipt:series.preview.receipt}})).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});
  const single=await snapshotBookingConflicts(fx.adminClient,{...a,p_booking_id:ids[0],p_payload:payload},bookingConflictKeyFromEnv().keyId);if(single.kind!=="snapshot")throw new Error();
  const output=JSON.stringify(previewBookingConflicts(single)),singleSignature=signConflictOutput(single as ConflictClaims,output,bookingConflictKeyFromEnv().secret);
  const snapshot=await snapshotConflictResolver(fx.adminClient,a,resolutionRequest(ready.input));if(snapshot.kind!=="snapshot")throw new Error();
  const {review:_,...request}=ready.input;void _;
  const denied=await fx.adminClient.rpc("finalize_booking_conflict_resolution",{...a,p_input:request,p_decision:ready.input.review!.decision,p_claims:snapshot.claims,p_plan:JSON.stringify(planConflictResolution(snapshot,ready.input)),p_signature:singleSignature});expect(denied.error?.code).toBe("42501");expect(await state(fx)).toEqual(before);
 });});
 test("15.3-INT-004 exact concurrent replay/lost response emits one event; expired receipt replay survives facts but revoked authority denies",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const ids=await seed(fx),ready=await prepare(fx,ids[0]),results=await Promise.all([command(fx,ready.input),command(fx,ready.input)]);expect(results[0]).toEqual(results[1]);expect(results[0]).toMatchObject({ok:true});
  expect(await adminQuery("select id from public.booking_conflict_resolutions where tenant_id=$1",[fx.base.tenantA.id])).toHaveLength(1);expect(await adminQuery("select id from public.notifications where tenant_id=$1 and category='booking.changed'",[fx.base.tenantA.id])).toHaveLength(1);
  const key=bookingConflictKeyFromEnv(),receipt=openResolutionReceipt(ready.input.review!.receipt,key.secret),expired=sealResolutionReceipt({...receipt,claims:{...receipt.claims,issuedAt:"2020-01-01T00:00:00Z",expiresAt:"2020-01-01T00:01:00Z"}},key.secret);
  await adminQuery("update public.person_profiles set employment_percentage=75 where id=$1",[fx.ownProfile.id]);const before=await state(fx);
  expect(await command(fx,{...ready.input,review:{...ready.input.review!,receipt:expired}})).toEqual(results[0]);expect(await state(fx)).toEqual(before);
  await adminQuery("update public.tenant_memberships set status='revoked' where id=$1",[fx.adminProfile.membershipId]);expect(await command(fx,ready.input)).toMatchObject({ok:false});
 });});
 test("15.3-INT-005 every effective single/series/job-card writer retains resolved rows and itself reopens a returning identity",async ctx=>{if(skipUnlessStack(ctx,up))return;
  for(const writer of ["single","series","job-card"] as const)await fixture(async fx=>{
   const ids=await seed(fx),ready=await prepare(fx,ids[0],"move");expect(await command(fx,ready.input)).toMatchObject({ok:true});
   const terminal=await state(fx),keys=ready.target.keys,terminalRows=terminal.conflicts.filter(c=>keys.includes(String(c.natural_key)));expect(terminalRows).toHaveLength(keys.length);expect(terminalRows.every(r=>r.status==="resolved")).toBe(true);
   const refresh=async()=>{
    if(writer==="single"){const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),b=scan.bookings.find(b=>b.id===ids[0])!;return bookingCommand("update",fx.adminClient,{...b.payload,assigneeIds:[...b.payload.assigneeIds],bookingId:b.id,commandId:crypto.randomUUID(),description:"Current single refresh"});}
    if(writer==="series"){const base=realSeriesInput(fx),input=realSeriesInput(fx,{rule:{...base.rule,startDate:"2026-11-02",count:1},template:{...base.template,startsAt:"2026-11-02T06:00:00Z",endsAt:"2026-11-02T07:00:00Z",assigneeIds:[fx.adminProfile.id]}});return runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,input)).input});}
    const p=await seedBookingParents(fx.base.tenantA.id);return invokeJobCard(fx.adminClient,"create",{commandId:crypto.randomUUID(),type:"order",title:"Actual job-card refresh",customer_id:p.customerId,facility_id:p.facilityId,contact_id:p.contactId,priority:"normal",estimated_duration_minutes:null,planned_travel_minutes:null,crew_size:null,earliest_date:null,desired_date:null,latest_date:null,customer_presence_required:false,requiredWorkRoleIds:null,accessWindows:null,dependencyJobIds:[]});
   };
   expect(expectOk(await refresh(),`INT005-${writer}-retain`)).toMatchObject({ok:true});expect((await state(fx)).conflicts.filter(c=>keys.includes(String(c.natural_key)))).toEqual(terminalRows);
   await adminQuery("update public.bookings set starts_at='2026-10-12T06:00:00Z',ends_at='2026-10-12T07:00:00Z' where id=$1",[ids[0]]);
   expect(expectOk(await refresh(),`INT005-${writer}-reopen`)).toMatchObject({ok:true});const reopened=await state(fx),returning=reopened.conflicts.filter(c=>keys.includes(String(c.natural_key)));expect(returning).toHaveLength(keys.length);
   expect(returning.every(r=>r.status==="open"&&r.resolved_at===null&&r.resolved_by_membership_id===null&&r.resolution_outcome===null)).toBe(true);expect(reopened.ledger).toEqual(terminal.ledger);
   expect(await command(fx,ready.input)).toMatchObject({ok:true});expect(await state(fx)).toEqual(reopened);
  });
 });
 test("15.3-INT-006 audit and notification failure roll back booking, conflicts, ledger and every effect",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const ids=await seed(fx),accept=await prepare(fx,ids[0]),ready=await prepare(fx,ids[0],"move"),correlation=crypto.randomUUID(),before=await state(fx);
  // Existing real post-booking fault proves a changed booking never partially commits.
  expect(await withBookingFault(correlation,"after_booking",()=>command(fx,ready.input,correlation))).toMatchObject({ok:false});expect(await state(fx)).toEqual(before);
  const auditName=`resolver_audit_${crypto.randomUUID().replaceAll("-","")}`;let reached=false;
  await adminQuery(`create function test_support.${auditName}() returns trigger language plpgsql set search_path='' as $$ begin if new.correlation_id='${correlation}' then if not exists(select 1 from public.booking_conflicts where tenant_id=new.tenant_id and status='accepted' and natural_key=any(array[${accept.target.keys.map(k=>`'${k}'`).join(",")}])) then raise exception 'acceptance stage not reached';end if;raise exception 'accepted before audit' using errcode='P5301';end if;return new;end $$;revoke all on function test_support.${auditName}() from public,anon,authenticated,service_role;create trigger ${auditName} before insert on public.audit_events for each row execute function test_support.${auditName}()`);
  try{const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{const reply=await target.rpc(name,args);if(name==="finalize_booking_conflict_resolution"&&reply.error?.code==="P5301")reached=true;return reply;};const value=Reflect.get(target,key,target);return typeof value==="function"?value.bind(target):value;}});
   expect(await runCommand(resolveBookingConflict,{client:client as never,input:accept.input,correlationId:correlation})).toMatchObject({ok:false});expect(reached).toBe(true);expect(await state(fx)).toEqual(before);
  }finally{await adminQuery(`drop trigger ${auditName} on public.audit_events;drop function test_support.${auditName}()`);}
  // A per-correlation trigger executes after booking/workflow/ledger/audit and before notification INSERT.
  const suffix=crypto.randomUUID().replaceAll("-",""),name=`resolver_fault_${suffix}`;
  let notificationReached=false;
  await adminQuery(`create function test_support.${name}() returns trigger language plpgsql set search_path='' as $$ begin if current_setting('app.booking_correlation_id',true)='${correlation}' then if not exists(select 1 from public.booking_conflict_resolutions r join public.audit_events a on a.id=r.id and a.tenant_id=r.tenant_id where r.id=new.logical_subject_id and r.command_id='${ready.input.commandId}' and a.correlation_id='${correlation}') then raise exception 'notification stage not reached';end if;raise exception 'resolver notification fault' using errcode='P5302'; end if;return new;end $$;revoke all on function test_support.${name}() from public,anon,authenticated,service_role;create trigger ${name} before insert on public.notifications for each row execute function test_support.${name}()`);
  try{const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{const reply=await target.rpc(name,args);if(name==="finalize_booking_conflict_resolution"&&reply.error?.code==="P5302")notificationReached=true;return reply;};const value=Reflect.get(target,key,target);return typeof value==="function"?value.bind(target):value;}});
   expect(await runCommand(resolveBookingConflict,{client:client as never,input:ready.input,correlationId:correlation})).toMatchObject({ok:false});expect(notificationReached).toBe(true);expect(await state(fx)).toEqual(before);
  }finally{await adminQuery(`drop trigger ${name} on public.notifications;drop function test_support.${name}()`);}
  expect(await command(fx,ready.input,correlation)).toMatchObject({ok:true});
 });});
 test("15.3-INT-007 current-segment common fix preserves bounds, stable ids, exceptions and tombstones",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  await seed(fx);const base=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:12,startTime:"08:00:00",endTime:"09:00:00"}});expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,base)).input})).toMatchObject({ok:true});
  const rows=await adminQuery<{id:string;nominal_date:Date;status:string}>("select id,nominal_date,status from public.bookings where series_id=$1 order by nominal_date",[base.seriesId]);
  await adminQuery("update public.bookings set is_exception=true,description='Preserved exception' where id=$1",[rows[1].id]);await adminQuery("update public.bookings set status='cancelled',is_exception=true where id=$1",[rows[2].id]);
  expect(await bookingCommand("create",fx.adminClient,bookingInput([fx.ownProfile.id],{startsAt:"2026-10-23T09:00:00Z",endsAt:"2026-10-23T10:00:00Z"}))).toMatchObject({ok:true});
  const protectedBefore=await adminQuery("select * from public.bookings where id=any($1::uuid[]) order by id",[[rows[1].id,rows[2].id]]);
  const ready=await prepare(fx,rows[0].id,"move",{wholeSeries:true,payload:{...base.template,startsAt:"2026-10-12T09:00:00.000000Z",endsAt:"2026-10-12T10:00:00.000000Z"}});
  expect(ready.preview.affectedBookingIds).toHaveLength(12);expect(ready.preview.untouchedBookingIds).toEqual(expect.arrayContaining([rows[1].id,rows[2].id]));expect(ready.preview.warnings.some(g=>g.bookingIds.some(id=>rows.slice(10).some(r=>r.id===id)))).toBe(true);
  expect(expectOk(await command(fx,ready.input),"INT007-common-segment")).toMatchObject({ok:true});expect(await adminQuery("select * from public.bookings where id=any($1::uuid[]) order by id",[[rows[1].id,rows[2].id]])).toEqual(protectedBefore);
  expect(await adminQuery("select id,nominal_date,status from public.bookings where series_id=$1 order by nominal_date",[base.seriesId])).toEqual(rows.map((r,i)=>({...r,status:i===2?"cancelled":r.status})));
  const ordinary=await adminQuery<{id:string;date:string;start:string;end:string;assignees:string[]}>("select b.id,to_char(b.nominal_date,'YYYY-MM-DD') date,to_char(b.starts_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') start,to_char(b.ends_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') end,array(select person_profile_id::text from public.booking_assignees a where a.booking_id=b.id order by person_profile_id) assignees from public.bookings b where b.series_id=$1 and not b.is_exception and b.status<>'cancelled' order by b.nominal_date",[base.seriesId]);
  expect(ordinary).toEqual([12,15,16,17,18,19,20,21,22,23].map((day,i)=>({id:rows[i===0?0:i+2].id,date:`2026-10-${day}`,start:`2026-10-${day}T09:00:00Z`,end:`2026-10-${day}T10:00:00Z`,assignees:[fx.ownProfile.id]})));
  const before=await state(fx);expect(await command(fx,{...ready.input,commandId:crypto.randomUUID()})).toMatchObject({ok:false,code:"PREVIEW_STALE"});expect(await state(fx)).toEqual(before);
 });});
 test("15.3-INT-008 role revocation while actually waiting denies both a fresh command and immutable replay",async ctx=>{if(skipUnlessStack(ctx,up))return;
  for(const replay of [false,true])await fixture(async fx=>{
   const ids=await seed(fx),ready=await prepare(fx,ids[0]),a={...args(fx,ready.input.commandId),p_actor_id:fx.users.projektledare.id};
   const preview=await previewConflictResolution(fx.plannerClient,a,ready.input),input={...ready.input,review:{...ready.input.review!,receipt:preview.receipt}};
   if(replay)expect(await runCommand(resolveBookingConflict,{client:fx.plannerClient as never,input})).toMatchObject({ok:true});
   const before=await state(fx);let pending:Promise<unknown>|null=null;
   await adminSession(async({query})=>{await query("begin");try{
    const [blocker]=await query<{pid:number}>("select pg_backend_pid() pid,pg_advisory_xact_lock(hashtextextended($1,0))",[fx.base.tenantA.id]);
    pending=runCommand(resolveBookingConflict,{client:fx.plannerClient as never,input});await waitForBlocked(blocker.pid,1);
    await adminQuery("update public.tenant_memberships set status='disabled' where id=$1",[fx.coworkerProfile.membershipId]);await query("commit");
   }catch(e){await query("rollback");if(pending)await pending;throw e;}});
   expect(await pending).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});expect(await state(fx)).toEqual(before);
  });
 });
 test("15.3-INT-009 before/after recipient union includes affected actor, honors preferences and dedupes by event rather than day",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  const ids=await seed(fx);for(const id of ids)await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)",[fx.base.tenantA.id,id,fx.adminProfile.id]);
  const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id),b=scan.bookings.find(b=>b.id===ids[0])!;
  const ready=await prepare(fx,ids[0],"reassign",{payload:{...b.payload,assigneeIds:[fx.adminProfile.id,fx.coworkerProfile.id].sort()}});
  expect(await command(fx,ready.input)).toMatchObject({ok:true});
  const notes=await adminQuery<{recipient_user_id:string;body:string;route:string;logical_subject_id:string}>("select recipient_user_id,body,route,logical_subject_id from public.notifications where tenant_id=$1 and category='booking.changed' order by recipient_user_id",[fx.base.tenantA.id]);
  expect(notes.map(n=>n.recipient_user_id).sort()).toEqual([fx.users.montor.id,fx.base.adminA.id,fx.users.projektledare.id].sort());
  expect(notes.find(n=>n.recipient_user_id===fx.users.montor.id)?.body).toContain("tidigare tilldelning");expect(notes.every(n=>n.route==="/scheduling")).toBe(true);
  await adminQuery("insert into public.notification_preferences(tenant_id,user_id,category,channel,enabled) values($1,$2,'booking.changed','in_app',false)",[fx.base.tenantA.id,fx.users.projektledare.id]);
  const next=await prepare(fx,ids[0]);expect(await command(fx,next.input)).toMatchObject({ok:true});
  const all=await adminQuery<{recipient_user_id:string;logical_subject_id:string}>("select recipient_user_id,logical_subject_id from public.notifications where tenant_id=$1 and category='booking.changed'",[fx.base.tenantA.id]);
  expect(all.filter(n=>n.recipient_user_id===fx.base.adminA.id)).toHaveLength(2);expect(all.filter(n=>n.recipient_user_id===fx.users.projektledare.id)).toHaveLength(1);expect(new Set(all.map(n=>n.logical_subject_id)).size).toBe(2);
  expect(await fx.montorClient.from("notification_preferences").insert({tenant_id:fx.base.tenantA.id,user_id:fx.users.montor.id,category:"booking.changed",channel:"email",enabled:true})).toMatchObject({error:{code:"23514"}});
 });});
 test("15.3-INT-011 complete v3 mixed job facts retain job identity and independent unavailable/empty rules",async ctx=>{if(skipUnlessStack(ctx,up))return;await fixture(async fx=>{
  await seed(fx);const p=await seedBookingParents(fx.base.tenantA.id),jobs=Array.from({length:3},()=>crypto.randomUUID()).sort(),bookings:string[]=[];
  for(let i=0;i<3;i++)await adminQuery("insert into public.jobs(id,tenant_id,customer_id,title,required_roles_recorded,access_windows_recorded) values($1,$2,$3,$4,$5,$6)",[jobs[i],fx.base.tenantA.id,p.customerId,`Mixed resolver job ${i}`,i!==0,i!==1]);
  await adminQuery("insert into public.job_required_work_roles(tenant_id,job_id,work_role_id) values($1,$2,$3)",[fx.base.tenantA.id,jobs[2],p.workRoleId]);
  await adminQuery("insert into public.job_access_windows(tenant_id,job_id,starts_at,ends_at) values($1,$2,'2026-10-14T06:30:00Z','2026-10-14T07:00:00Z')",[fx.base.tenantA.id,jobs[2]]);
  for(let i=0;i<4;i++){const result=await bookingCommand("create",fx.adminClient,bookingInput([fx.ownProfile.id],{jobId:jobs[i]??null,startsAt:`2026-10-${12+i}T06:00:00Z`,endsAt:`2026-10-${12+i}T07:00:00Z`}));expect(result.ok).toBe(true);if(result.ok)bookings.push(result.data.bookingId);}
  const s=await snapshotConflictResolver(fx.adminClient,args(fx),null);if(s.kind!=="snapshot")throw new Error();
  expect(s.facts.detection.jobInputs).toEqual([{jobId:jobs[0],estimatedDurationMinutes:null,crewSize:null,plannedTravelMinutes:null,plannedStartDate:null,plannedEndDate:null,earliestDate:null,desiredDate:null,latestDate:null,customerPresenceRequired:null,requiredWorkRoleIds:null,accessWindows:[]},{jobId:jobs[1],estimatedDurationMinutes:null,crewSize:null,plannedTravelMinutes:null,plannedStartDate:null,plannedEndDate:null,earliestDate:null,desiredDate:null,latestDate:null,customerPresenceRequired:null,requiredWorkRoleIds:[],accessWindows:null},{jobId:jobs[2],estimatedDurationMinutes:null,crewSize:null,plannedTravelMinutes:null,plannedStartDate:null,plannedEndDate:null,earliestDate:null,desiredDate:null,latestDate:null,customerPresenceRequired:null,requiredWorkRoleIds:[p.workRoleId],accessWindows:[{startsAt:"2026-10-14T06:30:00.000000Z",endsAt:"2026-10-14T07:00:00.000000Z"}]}]);
  expect(s.facts.detection.bookings.filter(b=>bookings.includes(b.id)).map(b=>b.jobId).sort()).toEqual([null,...jobs].sort());
  const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id);
  expect(scan.groups.filter(g=>g.rule==="outside_access_window").flatMap(g=>g.bookingIds).sort()).toEqual([bookings[0],bookings[2]].sort());
  expect(scan.groups.filter(g=>g.rule==="competence_missing").flatMap(g=>g.bookingIds)).toEqual([bookings[2]]);
  const ready=await prepare(fx,bookings[0]);await adminQuery("insert into public.job_access_windows(tenant_id,job_id,starts_at,ends_at) values($1,$2,'2026-10-12T06:00:00Z','2026-10-12T07:00:00Z')",[fx.base.tenantA.id,jobs[0]]);const before=await state(fx);
  expect(await command(fx,ready.input)).toMatchObject({ok:false,code:"PREVIEW_STALE"});expect(await state(fx)).toEqual(before);
 });});
});
