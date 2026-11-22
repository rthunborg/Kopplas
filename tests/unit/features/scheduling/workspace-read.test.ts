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
  for(const variant of ["absent","record","throw","rejected","getter","thenable"] as const){
  const old=deferred<SchedulingReadResult>(),latest=deferred<SchedulingReadResult>();let reads=0,loading=false,errors=0,thenReads=0;
  const observations:Record<string,unknown>[]=[],calls:string[]=[],readInputs:SchedulingReadInput[]=[];
  const published:SchedulingReadResult[]=[];const sequence={current:0},nextInput={...input,date:"2026-10-13"};
  const ports={sequence,read:(value:SchedulingReadInput)=>{calls.push("read");readInputs.push(value);return ++reads===1?old.promise:latest.promise;},start:()=>{calls.push("start");loading=true;},reconcile:()=>{calls.push("reconcile");return undefined;},publish:(r:SchedulingReadResult)=>{calls.push("publish");published.push(r);},failed:()=>{calls.push("failed");errors++;},finish:()=>{calls.push("finish");loading=false;}};
  Object.defineProperty(ports,"observe",{get:()=>{
    if(variant==="getter")throw new Error("optional observer getter");
    if(variant==="absent")return undefined;
    return (event:unknown)=>{
      if(variant==="record")observations.push(event as Record<string,unknown>);
      if(variant==="throw")throw new Error("optional observer throw");
      if(variant==="rejected")return Promise.reject(new Error("optional observer rejection"));
      if(variant==="thenable")return Object.defineProperty({},"then",{get(){thenReads++;throw new Error("thenable must not be assimilated");}});
      return undefined;
    };
  }});
  const first=runSchedulingRead(input,ports),second=runSchedulingRead(nextInput,ports);
  if(oldOutcome==="success")old.resolve({data:success,entitlements:{withheld:[]}});else old.reject(new Error("old failure"));
  await first;assert.equal(loading,true);assert.equal(errors,0);assert.deepEqual(published,[]);
  const final={data:{...success,tenantId:"latest"},entitlements:{withheld:[]}};latest.resolve(final);await second;
  assert.deepEqual(published,[final]);assert.equal(loading,false);assert.equal(errors,0);
  assert.equal(published[0],final);assert.equal(readInputs[0],input);assert.equal(readInputs[1],nextInput);
  assert.deepEqual(calls,["start","read","start","read","reconcile","publish","finish"]);assert.equal(sequence.current,2);assert.equal(thenReads,0);
  if(variant==="record"){
    assert.ok(observations.some(event=>event.ticket===1&&event.currentTicket===2));
    assert.ok(!observations.some(event=>event.ticket===1&&["publish","failed","finish"].includes(String(event.operation))));
    for(const event of observations)assert.deepEqual(Object.keys(event).sort(),["currentTicket","operation","ordinal","outcome","phase","ticket","timeMs"]);
  }
  await Promise.resolve();
  }
});
for(const oldOutcome of ["success","rejection"] as const)test(`reconciled second read: stale ${oldOutcome} cannot overwrite a newer request`,async()=>{
  for(const variant of ["absent","record","throw","rejected","getter","thenable"] as const){
  const second=deferred<SchedulingReadResult>(),latest=deferred<SchedulingReadResult>();let reads=0,loading=false,errors=0,thenReads=0;
  const observations:Record<string,unknown>[]=[],calls:string[]=[],readInputs:SchedulingReadInput[]=[];
  const published:SchedulingReadResult[]=[];const sequence={current:0},revisedInput={...input,date:"2026-10-14"},nextInput={...input,date:"2026-10-15"};
  const ports={sequence,read:(value:SchedulingReadInput)=>{calls.push("read");readInputs.push(value);reads++;return reads===1?Promise.resolve({data:success,entitlements:{withheld:[]}}):reads===2?second.promise:latest.promise;},start:()=>{calls.push("start");loading=true;},reconcile:()=>{calls.push("reconcile");return reads===1?revisedInput:undefined;},publish:(r:SchedulingReadResult)=>{calls.push("publish");published.push(r);},failed:()=>{calls.push("failed");errors++;},finish:()=>{calls.push("finish");loading=false;}};
  Object.defineProperty(ports,"observe",{get:()=>{
    if(variant==="getter")throw new Error("optional observer getter");
    if(variant==="absent")return undefined;
    return (event:unknown)=>{
      if(variant==="record")observations.push(event as Record<string,unknown>);
      if(variant==="throw")throw new Error("optional observer throw");
      if(variant==="rejected")return Promise.reject(new Error("optional observer rejection"));
      if(variant==="thenable")return Object.defineProperty({},"then",{get(){thenReads++;throw new Error("thenable must not be assimilated");}});
      return undefined;
    };
  }});
  const first=runSchedulingRead(input,ports);await Promise.resolve();assert.equal(reads,2);
  const newest=runSchedulingRead(nextInput,ports);
  if(oldOutcome==="success")second.resolve({data:success,entitlements:{withheld:[]}});else second.reject(new Error("stale reconciliation"));
  await first;assert.equal(loading,true);assert.equal(errors,0);assert.deepEqual(published,[]);
  const final={data:{...success,actorId:"newest"},entitlements:{withheld:[]}};latest.resolve(final);await newest;
  assert.deepEqual(published,[final]);assert.equal(loading,false);
  assert.equal(published[0],final);assert.equal(readInputs[0],input);assert.equal(readInputs[1],revisedInput);assert.equal(readInputs[2],nextInput);assert.equal(errors,0);assert.equal(sequence.current,2);assert.equal(thenReads,0);
  assert.deepEqual(calls,["start","read","reconcile","read","start","read","reconcile","publish","finish"]);
  if(variant==="record"){
    assert.ok(observations.some(event=>event.operation==="reconciled-read"&&event.phase==="start"&&event.ticket===1));
    assert.ok(!observations.some(event=>event.ticket===1&&event.currentTicket===2&&["publish","failed","finish"].includes(String(event.operation))));
  }
  await Promise.resolve();
  }
});
test("latest transport exception reaches only failure and finish, never stale success",async()=>{
  for(const variant of ["absent","record","throw","rejected","getter","thenable"] as const){
  const events:string[]=[],observations:Record<string,unknown>[]=[];let thenReads=0;
  const ports={sequence:{current:0},read:async(value:SchedulingReadInput)=>{assert.equal(value,input);throw new Error("transport");},start:()=>events.push("start"),reconcile:()=>undefined,publish:()=>events.push("publish"),failed:()=>events.push("failure"),finish:()=>events.push("finish")};
  Object.defineProperty(ports,"observe",{get:()=>{
    if(variant==="getter")throw new Error("optional observer getter");
    if(variant==="absent")return undefined;
    return (event:unknown)=>{
      if(variant==="record")observations.push(event as Record<string,unknown>);
      if(variant==="throw")throw new Error("optional observer throw");
      if(variant==="rejected")return Promise.reject(new Error("optional observer rejection"));
      if(variant==="thenable")return Object.defineProperty({},"then",{get(){thenReads++;throw new Error("thenable must not be assimilated");}});
      return undefined;
    };
  }});
  await runSchedulingRead(input,ports);
  assert.deepEqual(events,["start","failure","finish"]);assert.equal(thenReads,0);assert.equal(ports.sequence.current,1);
  if(variant==="record")assert.ok(observations.some(event=>event.operation==="first-read"&&event.phase==="threw"&&event.outcome==="thrown"));
  await Promise.resolve();
  }
  for(const observed of [false,true])for(const callback of ["start","failed","finish","both"] as const){
    const startSentinel=new Error("start sentinel"),failedSentinel=new Error("failed sentinel"),finishSentinel=new Error("finish sentinel");const calls:string[]=[];
    const ports={sequence:{current:0},read:async()=>{calls.push("read");throw new Error("transport");},start:()=>{calls.push("start");if(callback==="start")throw startSentinel;},reconcile:()=>undefined,publish:()=>calls.push("publish"),failed:()=>{calls.push("failed");if(callback==="failed"||callback==="both")throw failedSentinel;},finish:()=>{calls.push("finish");if(callback==="finish"||callback==="both")throw finishSentinel;},observe:observed?()=>Promise.reject(new Error("optional observer")):undefined};
    const expected=callback==="start"?startSentinel:callback==="failed"?failedSentinel:finishSentinel;
    await assert.rejects(runSchedulingRead(input,ports),error=>error===expected);
    assert.deepEqual(calls,callback==="start"?["start"]:["start","read","failed","finish"]);
  }
});
