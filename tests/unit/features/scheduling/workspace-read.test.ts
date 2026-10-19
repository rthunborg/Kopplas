import test from "node:test";
import assert from "node:assert/strict";
import { EMPTY_SCHEDULING_FILTERS, runSchedulingRead, schedulingToolbarData, schedulingReadException } from "@/features/scheduling/view-model";
import type { SchedulingReadData, SchedulingReadInput, SchedulingReadResult } from "@/features/scheduling/view-types";
const input:SchedulingReadInput={view:"schema",mode:"day",date:"2026-10-12",filters:EMPTY_SCHEDULING_FILTERS};
const success:SchedulingReadData={canView:true,canManage:true,actorId:"actor",tenantId:"tenant",bookings:[],ownSelfPersonIds:[],error:null,roster:[{id:"person",label:"Person",workRoleIds:[]}],workRoles:[{id:"role",label:"Roll"}],capacity:[],openConflictCount:5};
const io=(patch:Partial<SchedulingReadData>={}):SchedulingReadData=>({...schedulingReadException().data,actorId:"actor",tenantId:"tenant",confirmedAuthority:{canView:true,canManage:true},...patch});
test("same-identity server-confirmed retry retains only toolbar metadata, no bookings/capacity/counts",()=>{
  const actual=schedulingToolbarData(success,io());
  assert.equal(actual.canManage,true);assert.equal(actual.roster,success.roster);assert.equal(actual.workRoles,success.workRoles);
  assert.deepEqual(actual.bookings,[]);assert.equal(actual.capacity,undefined);assert.equal(actual.openConflictCount,undefined);assert.ok(actual.error);
});
for(const [name,current] of [
  ["denied",io({errorKind:"denied",confirmedAuthority:undefined})],
  ["actor changed",io({actorId:"other"})],["tenant changed",io({tenantId:"other"})],
  ["current manager revoked",io({confirmedAuthority:{canView:true,canManage:false}})],
  ["unqualified thrown exception",schedulingReadException().data],
] as const)test(`retry never retains toolbar authority when ${name}`,()=>{
  const actual=schedulingToolbarData(success,current);
  assert.equal(actual,current);assert.equal(actual.canManage,false);assert.equal(actual.roster,undefined);assert.equal(actual.workRoles,undefined);
});
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(reason:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
for(const oldOutcome of ["success","rejection"] as const)test(`overlapping read: stale ${oldOutcome} cannot publish, error or finish latest loading`,async()=>{
  const old=deferred<SchedulingReadResult>(),latest=deferred<SchedulingReadResult>();let reads=0,loading=false,errors=0;
  const published:SchedulingReadResult[]=[];const sequence={current:0};
  const ports={sequence,read:()=>++reads===1?old.promise:latest.promise,start:()=>{loading=true;},reconcile:()=>undefined,publish:(r:SchedulingReadResult)=>published.push(r),failed:()=>{errors++;},finish:()=>{loading=false;}};
  const first=runSchedulingRead(input,ports),second=runSchedulingRead({...input,date:"2026-10-13"},ports);
  if(oldOutcome==="success")old.resolve({data:success,entitlements:{withheld:[]}});else old.reject(new Error("old failure"));
  await first;assert.equal(loading,true);assert.equal(errors,0);assert.deepEqual(published,[]);
  const final={data:{...success,tenantId:"latest"},entitlements:{withheld:[]}};latest.resolve(final);await second;
  assert.deepEqual(published,[final]);assert.equal(loading,false);assert.equal(errors,0);
});
for(const oldOutcome of ["success","rejection"] as const)test(`reconciled second read: stale ${oldOutcome} cannot overwrite a newer request`,async()=>{
  const second=deferred<SchedulingReadResult>(),latest=deferred<SchedulingReadResult>();let reads=0,loading=false,errors=0;
  const published:SchedulingReadResult[]=[];const sequence={current:0};
  const ports={sequence,read:()=>{reads++;return reads===1?Promise.resolve({data:success,entitlements:{withheld:[]}}):reads===2?second.promise:latest.promise;},start:()=>{loading=true;},reconcile:(_value:SchedulingReadResult,current:SchedulingReadInput)=>reads===1?{...current,date:"2026-10-14"}:undefined,publish:(r:SchedulingReadResult)=>published.push(r),failed:()=>{errors++;},finish:()=>{loading=false;}};
  const first=runSchedulingRead(input,ports);await Promise.resolve();assert.equal(reads,2);
  const newest=runSchedulingRead({...input,date:"2026-10-15"},ports);
  if(oldOutcome==="success")second.resolve({data:success,entitlements:{withheld:[]}});else second.reject(new Error("stale reconciliation"));
  await first;assert.equal(loading,true);assert.equal(errors,0);assert.deepEqual(published,[]);
  const final={data:{...success,actorId:"newest"},entitlements:{withheld:[]}};latest.resolve(final);await newest;
  assert.deepEqual(published,[final]);assert.equal(loading,false);
});
test("latest transport exception reaches only failure and finish, never stale success",async()=>{
  const events:string[]=[];
  await runSchedulingRead(input,{sequence:{current:0},read:async()=>{throw new Error("transport");},start:()=>events.push("start"),reconcile:()=>undefined,publish:()=>events.push("publish"),failed:()=>events.push("failure"),finish:()=>events.push("finish")});
  assert.deepEqual(events,["start","failure","finish"]);
});
