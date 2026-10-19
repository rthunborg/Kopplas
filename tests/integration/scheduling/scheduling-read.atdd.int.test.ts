import { createHash, randomUUID } from "node:crypto";
import { beforeAll, describe, expect, test } from "vitest";
import { readScheduling, readBookingReassignmentFlags } from "@/server/read-models/scheduling";
import { EMPTY_SCHEDULING_FILTERS } from "@/features/scheduling/view-model";
import type { SchedulingReadInput } from "@/features/scheduling/view-types";
import { seedReadFixtures, withBookingFixture, bookingSnapshot } from "../../support/bookings-atdd";
import { adminQuery } from "../../factories/admin-sql";
import { makeAuthedServerClient } from "../../factories/tenants";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
const input = (view: SchedulingReadInput["view"] = "schema"): SchedulingReadInput => ({view,mode:"week",date:"2026-10-12",filters:EMPTY_SCHEDULING_FILTERS});
let stackUp=false;
beforeAll(async()=>{stackUp=await isLocalStackReachable();});

describe("15.1 actual authenticated scheduling read/RLS",()=>{
  test("manager reads complete same-tenant bookings and own agenda derives self without peer membership disclosure",async ctx=>{
    if(skipUnlessStack(ctx,stackUp))return;
    await withBookingFixture(async fx=>{
      const seed=await seedReadFixtures(fx),before=await bookingSnapshot(fx.tenantIds);
      const result=await readScheduling(input(),{client:fx.plannerClient as never});
      expect(result.data.error).toBeNull();expect(result.data.canManage).toBe(true);
      expect(result.data.bookings.map(b=>b.id).sort()).toEqual([seed.own,seed.shared,seed.coworker].sort());
      expect(result.data.ownSelfPersonIds).toEqual([fx.coworkerProfile.id]);
      expect(result.data.bookings.every(b=>typeof b.needsReassignment==="boolean")).toBe(true);
      expect(JSON.stringify(result)).not.toContain(seed.foreign);
      expect(JSON.stringify(result)).not.toContain("membership_id");
      expect(JSON.stringify(result)).not.toContain("employment_percentage");
      expect(await bookingSnapshot(fx.tenantIds)).toEqual(before);
    });
  });
  test("inactive historical work role retains its label without widening the active editor picker",async ctx=>{
    if(skipUnlessStack(ctx,stackUp))return;
    await withBookingFixture(async fx=>{
      const seed=await seedReadFixtures(fx);
      const [role]=await adminQuery<{id:string}>("insert into public.work_roles(tenant_id,display_name,cost_rate_ore,sell_rate_ore,is_active) values($1,'Historisk elroll',10000,20000,false) returning id",[fx.base.tenantA.id]);
      await adminQuery("update public.bookings set work_role_id=$2 where id=$1",[seed.own,role.id]);
      const result=await readScheduling(input(),{client:fx.plannerClient as never});expect(result.data.error).toBeNull();
      expect(result.data.workRoles).toContainEqual({id:role.id,label:"Historisk elroll"});expect(result.data.options?.workRoles.some(r=>r.id===role.id)).toBe(false);
      expect(result.data.bookings.find(b=>b.id===seed.own)?.workRoleId).toBe(role.id);
    });
  });
  test("unentitled and inactive actors deny; supplied actor/tenant keys do not override current context",async ctx=>{
    if(skipUnlessStack(ctx,stackUp))return;
    await withBookingFixture(async fx=>{
      const seed=await seedReadFixtures(fx);
      for(const user of [fx.users.saljare,fx.users.ekonomi,fx.invitedUser,fx.disabledUser,fx.base.orphanUser]){
        const client=await makeAuthedServerClient(user);const result=await readScheduling(input(),{client:client as never});
        expect(result.data.canView).toBe(false);expect(result.data.bookings).toEqual([]);expect(result.data.error).toBe("Du har inte behörighet att läsa planeringen.");
      }
      const forged={...input(),tenantId:fx.base.tenantB.id,actorId:fx.base.adminB.id};
      const result=await readScheduling(forged,{client:fx.plannerClient as never});expect(result.data.error).toBeNull();
      expect(result.data.tenantId).toBe(fx.base.tenantA.id);expect(result.data.actorId).toBe(fx.users.projektledare.id);expect(result.data.bookings.some(b=>b.id===seed.foreign)).toBe(false);
    });
  });
  test("own agenda returns own association only with omitted/listed planner fields and no lifecycle RPC",async ctx=>{
    if(skipUnlessStack(ctx,stackUp))return;
    await withBookingFixture(async fx=>{
      const seed=await seedReadFixtures(fx);let lifecycleCalls=0;
      const client=new Proxy(fx.montorClient,{get(target,key){if(key==="rpc")return (...args:Parameters<typeof target.rpc>)=>{if(args[0]==="booking_reassignment_flags")lifecycleCalls++;return target.rpc(...args);};const value=Reflect.get(target,key,target);return typeof value==="function"?value.bind(target):value;}});
      const result=await readScheduling(input("personal"),{client:client as never});
      expect(result.data.error).toBeNull();expect(result.data.bookings.map(b=>b.id).sort()).toEqual([seed.own,seed.shared].sort());
      expect(result.data.bookings.every(b=>JSON.stringify(b.assigneeIds)===JSON.stringify([fx.ownProfile.id]))).toBe(true);
      for(const field of ["options","roster","workRoles","capacity","openConflictCount"])expect(result.data).not.toHaveProperty(field);
      expect(result.data.bookings.every(b=>!("needsReassignment" in b))).toBe(true);expect(lifecycleCalls).toBe(0);
      expect(result.entitlements.withheld).toContain("bookings.needsReassignment");
      expect((await readScheduling(input("resources"),{client:client as never})).data.error).toContain("behörighet");
      const forged={...input("personal"),filters:{...EMPTY_SCHEDULING_FILTERS,personIds:[fx.coworkerProfile.id]}};
      expect((await readScheduling(forged,{client:client as never})).data.error).toContain("behörighet");
      const initial=await readScheduling(input(),{client:client as never,initial:true});
      expect(initial.data.error).toBeNull();expect(initial.data.canManage).toBe(false);
      expect(initial.data.bookings.map(b=>b.id).sort()).toEqual([seed.own,seed.shared].sort());
      expect(initial.data.bookings.every(b=>!("needsReassignment" in b))).toBe(true);expect(lifecycleCalls).toBe(0);
    });
  });
});

type Row=Record<string,unknown>;
/** Transport-only harness, deliberately distinct from DB/RLS evidence above. */
function transport(count=1001,own=false){
  const tenantId=randomUUID(),actorId=randomUUID(),membershipId=randomUUID(),personId=randomUUID();
  const ids=Array.from({length:count},()=>randomUUID()).sort();
  const trace:{table:string;columns:string;from:number;to:number;equalities:{column:string;value:unknown}[];idFilters:{column:string;values:string[]}[];orders:{column:string;ascending:boolean}[]}[]=[],batches:string[][]=[];
  const tableRows:Record<string,Row[]>={
    tenant_memberships:[{id:membershipId,user_id:actorId,tenant_id:tenantId,role:own?"montor":"projektledare",status:"active",created_at:"2026-01-01",tenants:{name:"Transport tenant"}}],membership_roles:[],
    bookings:ids.map(id=>({id,tenant_id:tenantId,starts_at:"2026-10-12T06:00:00Z",ends_at:"2026-10-12T07:00:00Z",all_day:false,status:"planned",description:"Transport booking",work_role_id:null,job_id:null,customer_id:null,facility_id:null,contact_id:null})),
    booking_assignees:ids.map(id=>({id:randomUUID(),tenant_id:tenantId,booking_id:id,person_profile_id:personId})),booking_conflicts:[],
    person_profiles:[{id:personId,tenant_id:tenantId,membership_id:membershipId,employment_percentage:null,default_work_role_id:null}],
    person_work_hours:[{id:randomUUID(),tenant_id:tenantId,person_profile_id:null,entry_kind:"weekly_shift",weekday:1,starts_at:"07:00",ends_at:"16:00",local_date:null,exception_kind:null}],
    tenant_calendar_days:[],work_roles:[],jobs:[],customers:[],facilities:[],contacts:[],
  };
  let failTable:string|undefined,failOffset=-1,failColumn:string|undefined,failBatch=-1,malform:(value:Row[])=>unknown=value=>value;
  const client={auth:{getClaims:async()=>({data:{claims:{sub:actorId}},error:null})},
    from(table:string){
      const predicates:((row:Row)=>boolean)[]=[],equalities:{column:string;value:unknown}[]=[],idFilters:{column:string;values:string[]}[]=[],orders:{column:string;ascending:boolean}[]=[];
      let from=0,to=499,columns="";
      const query={
        select(value:string){columns=value;return query;},
        eq(column:string,value:unknown){equalities.push({column,value});predicates.push(row=>row[column]===value);return query;},
        is(column:string,value:unknown){predicates.push(row=>row[column]===value);return query;},
        lt(column:string,value:string){predicates.push(row=>String(row[column])<value);return query;},
        gt(column:string,value:string){predicates.push(row=>String(row[column])>value);return query;},
        in(column:string,values:string[]){expect(values.length).toBeLessThanOrEqual(50);idFilters.push({column,values:[...values]});predicates.push(row=>values.includes(String(row[column])));return query;},
        or(){throw new Error("Unexpected unbounded OR transport");},
        order(column:string,options?:{ascending?:boolean}){orders.push({column,ascending:options?.ascending!==false});return query;},
        range(a:number,b:number){from=a;to=b;return query;},limit(value:number){to=value-1;return query;},
        then(resolve:(value:unknown)=>unknown){
          trace.push({table,columns,from,to,equalities,idFilters,orders});
          const source=(tableRows[table]??[]).filter(row=>predicates.every(predicate=>predicate(row)));
          for(const order of [...orders].reverse())source.sort((a,b)=>String(a[order.column]).localeCompare(String(b[order.column]))*(order.ascending?1:-1));
          const failed=table===failTable&&from===failOffset&&(!failColumn||idFilters.some(filter=>filter.column===failColumn));
          return Promise.resolve({data:failed?null:source.slice(from,to+1),error:failed?{message:"PRIVATE_TRANSPORT_ERROR"}:null}).then(resolve);
        },
      };return query;
    },
    rpc:async(name:string,args:Record<string,unknown>)=>{if(name==="booking_editor_people")return{data:[{id:personId,default_work_role_id:null,label:"Transport person"}],error:null};expect(name).toBe("booking_reassignment_flags");const batch=args.p_booking_ids as string[];batches.push(batch);return{data:batches.length===failBatch?null:malform(batch.map((bookingId,index)=>({bookingId,needsReassignment:index%2===0}))),error:batches.length===failBatch?{code:"XX000",message:"PRIVATE_TRANSPORT_ERROR"}:null};},
  };
  return{client:client as never,ids,personId,tenantId,tableRows,trace,batches,failPage:(table:string,offset:number,column?:string)=>{failTable=table;failOffset=offset;failColumn=column;},failRpc:(batch:number)=>{failBatch=batch;},malformed:(f:typeof malform)=>{malform=f;}};
}
const CONFLICT_COLUMNS="id,booking_id,related_booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key,status";
function conflict(h:ReturnType<typeof transport>,bookingId:string,relatedBookingId:string|null,key:string,patch:Row={}):Row{return{id:randomUUID(),tenant_id:h.tenantId,booking_id:bookingId,related_booking_id:relatedBookingId,affected_person_profile_id:h.personId,conflict_type:"double_booking",starts_at:"2026-10-10T06:00:00.000000Z",ends_at:"2026-10-10T07:00:00.000000Z",natural_key:key,status:"open",...patch};}

describe("15.1 production scheduling transport completeness (mock transport, no RLS credit)",()=>{
  test("retryable IO confirms only current read authority; denied and initial own reads never retain planner authority",async()=>{
    const manager=transport(1);manager.failPage("bookings",0);
    const failed=await readScheduling(input(),{client:manager.client});
    expect(failed.data.canView).toBe(false);expect(failed.data.bookings).toEqual([]);
    expect(failed.data.errorKind).toBe("retryable");expect(failed.data.confirmedAuthority).toEqual({canView:true,canManage:true});
    expect(failed.data).not.toHaveProperty("roster");expect(failed.data).not.toHaveProperty("capacity");
    const own=transport(1,true);own.failPage("bookings",0);
    const ownFailure=await readScheduling(input("personal"),{client:own.client});
    expect(ownFailure.data.confirmedAuthority).toEqual({canView:true,canManage:false});
    const denied=await readScheduling(input(),{client:own.client});
    expect(denied.data.errorKind).toBe("denied");expect(denied.data).not.toHaveProperty("confirmedAuthority");
    const initial=transport(2,true);const initialRead=await readScheduling(input(),{client:initial.client,initial:true});
    expect(initialRead.data.error).toBeNull();expect(initialRead.data.canManage).toBe(false);expect(initialRead.data.bookings).toHaveLength(2);expect(initial.batches).toEqual([]);
  });
  for(const count of [501,1001])test(`${count} bookings publish only after complete 500-row pages and max50 ordered flag batches`,async()=>{
    const h=transport(count),result=await readScheduling(input(),{client:h.client});
    expect(result.data.error).toBeNull();expect(result.data.bookings.map(b=>b.id).sort()).toEqual(h.ids);
    expect(h.batches.flat()).toEqual(h.ids);expect(h.batches.every(batch=>batch.length<=50)).toBe(true);
    expect(h.trace.filter(t=>t.table==="bookings").map(t=>[t.from,t.to])).toEqual(count===501?[[0,499],[500,999]]:[[0,499],[500,999],[1000,1499]]);
    expect(result.data.bookings.every(b=>typeof b.needsReassignment==="boolean")).toBe(true);
  });
  test("conflict arms retain related-only/outside-period participants and dedupe symmetric cross-batch facts with max50 exact reads",async()=>{
    const h=transport(51),outside=randomUUID(),first=h.ids[0]!,last=h.ids[50]!;
    const participants=[first,last,outside].sort(),start="2026-10-10T06:00:00.000000Z",end="2026-10-10T07:00:00.000000Z";
    const identity=JSON.stringify(["over_capacity",participants,[h.personId],start,end]);
    const hash=(parts:unknown[])=>createHash("sha256").update(JSON.stringify(parts)).digest("hex");
    const capacityKey=(bookingId:string)=>"v2:"+hash([identity,h.personId,bookingId]);
    h.tableRows.booking_conflicts=[conflict(h,first,null,"primary"),conflict(h,outside,last,"related"),conflict(h,first,last,"symmetric"),conflict(h,last,first,"symmetric"),
      conflict(h,first,last,capacityKey(first),{conflict_type:"over_capacity"}),conflict(h,last,first,capacityKey(last),{conflict_type:"over_capacity"}),
      conflict(h,outside,first,"retained accepted participant",{conflict_type:"over_capacity",status:"accepted"})];
    const result=await readScheduling(input(),{client:h.client});
    expect(result.data.error).toBeNull();expect(result.data.openConflictCount).toBe(4);
    expect(result.data.bookings.find(booking=>booking.id===first)?.openConflictCount).toBe(3);expect(result.data.bookings.find(booking=>booking.id===last)?.openConflictCount).toBe(3);
    const reads=h.trace.filter(trace=>trace.table==="booking_conflicts");expect(reads).toHaveLength(4);
    expect(reads.map(read=>[read.idFilters[0]?.column,read.idFilters[0]?.values.length])).toEqual([["booking_id",50],["related_booking_id",50],["booking_id",1],["related_booking_id",1]]);
    for(const read of reads){expect(read.columns).toBe(CONFLICT_COLUMNS);expect(read.equalities).toEqual([{column:"tenant_id",value:h.tenantId}]);expect(read.orders).toEqual([{column:"id",ascending:true}]);expect(read.from).toBe(0);expect(read.to).toBe(499);expect(read.idFilters).toHaveLength(1);}
  });
  test("both conflict arms collect more than500 rows including final contributions before logical counting",async()=>{
    const h=transport(2),outside=randomUUID();
    h.tableRows.booking_conflicts=[...Array.from({length:501},(_,index)=>conflict(h,h.ids[0]!,null,"primary-"+index)),...Array.from({length:501},(_,index)=>conflict(h,outside,h.ids[1]!,"related-"+index)),conflict(h,h.ids[0]!,h.ids[1]!,"shared-cross-arm")];
    const result=await readScheduling(input(),{client:h.client});expect(result.data.error).toBeNull();expect(result.data.openConflictCount).toBe(1003);
    expect(result.data.bookings.map(booking=>booking.openConflictCount)).toEqual([502,502]);
    expect(h.trace.filter(trace=>trace.table==="booking_conflicts").map(read=>[read.idFilters[0]?.column,read.from,read.to])).toEqual([["booking_id",0,499],["booking_id",500,999],["related_booking_id",0,499],["related_booking_id",500,999]]);
  });
  for(const arm of ["booking_id","related_booking_id"])test("failed final conflict page in "+arm+" arm discards the whole read",async()=>{
    const h=transport(2),outside=randomUUID();h.tableRows.booking_conflicts=[...Array.from({length:501},(_,index)=>conflict(h,h.ids[0]!,null,"primary-"+index)),...Array.from({length:501},(_,index)=>conflict(h,outside,h.ids[1]!,"related-"+index))];
    h.failPage("booking_conflicts",500,arm);const result=await readScheduling(input(),{client:h.client});
    expect(result.data.canView).toBe(false);expect(result.data.bookings).toEqual([]);expect(result.data.error).toBe("Planeringen kunde inte läsas. Försök igen.");expect(result.data).not.toHaveProperty("openConflictCount");expect(result.data).not.toHaveProperty("capacity");expect(JSON.stringify(result)).not.toContain("PRIVATE_TRANSPORT_ERROR");
    expect(h.trace.filter(trace=>trace.table==="booking_conflicts"&&trace.idFilters[0]?.column===arm).map(read=>read.from)).toEqual([0,500]);
  });
  for(const table of ["person_profiles","person_work_hours","tenant_calendar_days","booking_conflicts"])test(`later ${table} page failure discards all data/counts`,async()=>{
    const h=transport(1),existing=h.tableRows[table];
    h.tableRows[table]=Array.from({length:501},()=>table==="person_profiles"?{...existing[0],id:randomUUID()}:table==="person_work_hours"?{...existing[0],id:randomUUID()}:table==="booking_conflicts"?{id:randomUUID(),tenant_id:h.tableRows.bookings[0].tenant_id,booking_id:h.ids[0]}:{id:randomUUID(),tenant_id:h.tableRows.bookings[0].tenant_id,local_date:`2026-10-12`,variant:"closed",reduction_percent:null});
    h.failPage(table,500);const result=await readScheduling(input(),{client:h.client});
    expect(result.data.error).toBe("Planeringen kunde inte läsas. Försök igen.");expect(result.data.bookings).toEqual([]);expect(result.data).not.toHaveProperty("openConflictCount");
  });
  test("501 ancillary roster/hour/calendar/conflict rows retain final-page facts and numeric demand",async()=>{
    const h=transport(1),tenantId=h.tableRows.bookings[0].tenant_id,membershipId=h.tableRows.person_profiles[0].membership_id;
    const profiles:Row[]=Array.from({length:500},()=>({id:randomUUID(),tenant_id:tenantId,membership_id:randomUUID(),employment_percentage:null,default_work_role_id:null}));
    profiles.push({id:h.personId,tenant_id:tenantId,membership_id:String(membershipId),employment_percentage:null,default_work_role_id:null});
    h.tableRows.person_profiles=profiles;
    h.tableRows.person_work_hours=profiles.map(p=>({id:randomUUID(),tenant_id:tenantId,person_profile_id:p.id,entry_kind:"weekly_shift",weekday:1,starts_at:"07:00",ends_at:"16:00",local_date:null,exception_kind:null}));
    h.tableRows.tenant_calendar_days=Array.from({length:501},(_,i)=>({id:randomUUID(),tenant_id:tenantId,local_date:new Date(Date.UTC(2027,0,1)+i*86400000).toISOString().slice(0,10),variant:"closed",reduction_percent:null}));
    h.tableRows.booking_conflicts=Array.from({length:501},()=>({id:randomUUID(),tenant_id:tenantId,booking_id:h.ids[0],related_booking_id:null,affected_person_profile_id:h.personId,conflict_type:"outside_work_hours",starts_at:"2026-10-12T06:00:00Z",ends_at:"2026-10-12T07:00:00Z",natural_key:randomUUID(),status:"open"}));
    const result=await readScheduling(input(),{client:h.client});expect(result.data.error).toBeNull();
    expect(result.data.roster).toHaveLength(501);expect(result.data.capacity).toHaveLength(3507);expect(result.data.openConflictCount).toBe(501);
    expect(result.data.capacity?.find(c=>c.personId===h.personId&&c.date==="2026-10-12")).toMatchObject({budget:540,demand:60,balance:480});
    for(const table of ["person_profiles","person_work_hours","tenant_calendar_days","booking_conflicts"])expect(h.trace.filter(t=>t.table===table).some(t=>t.from===500&&t.to===999)).toBe(true);
  });
  test("failed final booking page and final lifecycle batch produce no partial or false-empty success",async()=>{
    for(const kind of ["page","rpc"]){const h=transport();if(kind==="page")h.failPage("bookings",1000);else h.failRpc(21);const result=await readScheduling(input(),{client:h.client});expect(result.data.canView).toBe(false);expect(result.data.error).toBe("Planeringen kunde inte läsas. Försök igen.");expect(result.data.bookings).toEqual([]);expect(JSON.stringify(result)).not.toContain("PRIVATE_TRANSPORT_ERROR");}
  });
  for(const [label,alter] of [
    ["missing",(r:Row[])=>r.slice(1)],["extra",(r:Row[])=>[...r,r[0]]],["duplicate",(r:Row[])=>r.map(()=>r[0])],
    ["wrong order",(r:Row[])=>r.toReversed()],["unknown key",(r:Row[])=>r.map(x=>({...x,status:"active"}))],
    ["not boolean",(r:Row[])=>r.map(x=>({...x,needsReassignment:null}))],["unknown ID",(r:Row[])=>r.map(x=>({...x,bookingId:randomUUID()}))],
    ["non-array",()=>({})],
  ] as const)test(`malformed flags ${label} reject exact shape/completeness`,async()=>{
    const h=transport(2);h.malformed(alter);await expect(readBookingReassignmentFlags(h.client,randomUUID(),h.ids)).rejects.toThrow();
  });
  test("own transport calls neither planner tables nor any RPC",async()=>{const h=transport(2,true);const result=await readScheduling(input("personal"),{client:h.client});expect(result.data.error).toBeNull();expect(h.batches).toEqual([]);expect(h.trace.some(t=>["person_profiles","person_work_hours","tenant_calendar_days","work_roles","jobs","customers"].includes(t.table))).toBe(false);});
});
