import {beforeAll,describe,expect,test} from "vitest";
import {readBookingConflicts,scanBookingConflicts} from "@/server/read-models/booking-conflicts";
import {withBookingFixture,bookingCommand,bookingInput,seedBookingParents} from "../../support/bookings-atdd";
import {adminQuery} from "../../factories/admin-sql";
import {isLocalStackReachable} from "../../support/test-env";
import {skipUnlessStack} from "../../support/stack-gate";
let up=false;beforeAll(async()=>{up=await isLocalStackReachable();});
describe("15.3 manager queue scan",()=>{
 test("15.3-READ-001 complete four-booking multi-assignee groups keep out-of-scope peers and truthful scan recency",async ctx=>{if(skipUnlessStack(ctx,up))return;await withBookingFixture(async fx=>{
  const parent=await seedBookingParents(fx.base.tenantA.id),ids:string[]=[];
  for(let i=0;i<4;i++){const r=await bookingCommand("create",fx.adminClient,bookingInput([fx.ownProfile.id,fx.coworkerProfile.id],{jobId:i===0?null:null,customerId:i===0?parent.customerId:null}));expect(r.ok).toBe(true);if(r.ok)ids.push(r.data.bookingId);}
  const result=await readBookingConflicts({customerId:parent.customerId},{client:fx.adminClient as never});expect(result.status).toBe("success");if(result.status!=="success")throw new Error(result.message);
  const aggregate=result.data.groups.filter(g=>g.rule==="over_capacity");expect(aggregate).toHaveLength(2);expect(aggregate.every(g=>g.bookingIds.length===4&&g.keys.length===3)).toBe(true);
  expect(result.data.bookings.filter(b=>ids.includes(b.id))).toHaveLength(4);expect(Number.isFinite(Date.parse(result.data.checkedAt))).toBe(true);
  expect(JSON.stringify(result)).not.toMatch(/canonicalFacts|factDigest|signature|request_digest|create_payload_digest/);
  const scan=await scanBookingConflicts(fx.adminClient as never,fx.base.tenantA.id,fx.base.adminA.id);expect(new Set(result.data.groups.map(g=>g.logicalId)).size).toBe(scan.groups.filter(g=>g.bookingIds.includes(ids[0])).length);
  // A retained resolved association cannot contaminate a new current aggregate.
  await adminQuery("insert into public.booking_conflicts(tenant_id,booking_id,affected_person_profile_id,conflict_type,starts_at,ends_at,natural_key,status,resolution_outcome,resolved_by_membership_id,resolved_at) values($1,$2,$3,'over_capacity','2026-10-11T22:00:00Z','2026-10-12T22:00:00Z','historical-only','resolved','adjust',$4,clock_timestamp())",[fx.base.tenantA.id,ids[0],fx.ownProfile.id,fx.adminProfile.membershipId]);
  expect((await readBookingConflicts({customerId:parent.customerId},{client:fx.adminClient as never}))).toMatchObject({status:"success",data:{groups:result.data.groups}});
 });});
 test("15.3-READ-002 denied/failed scan never publishes successful empty or peer facts",async ctx=>{if(skipUnlessStack(ctx,up))return;await withBookingFixture(async fx=>{
  expect(await readBookingConflicts({}, {client:fx.montorClient as never})).toMatchObject({status:"error"});
  const broken=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>name==="booking_conflict_resolver_snapshot"?{data:null,error:{code:"XX000"}}:target.rpc(name,args);const value=Reflect.get(target,key,target);return typeof value==="function"?value.bind(target):value;}});
  expect(await readBookingConflicts({}, {client:broken as never})).toMatchObject({status:"error",message:expect.stringContaining("okänt")});
  const empty=await readBookingConflicts({}, {client:fx.adminClient as never});expect(empty).toMatchObject({status:"success",data:{groups:[],bookings:[]}});if(empty.status==="success")expect(Date.parse(empty.data.checkedAt)).not.toBeNaN();
 });});
});
