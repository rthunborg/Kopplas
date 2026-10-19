/** Actual production planner; synthetic facts only, no SQL/RLS proof. */
import test from "node:test";
import assert from "node:assert/strict";
import { planBookingSeries, previewBookingSeries, serializeBookingSeriesPlan, type SeriesSnapshot } from "@/server/bookings/series-conflicts";
import { createHash } from "node:crypto";
import { SERIES_CLAIM_FIELDS } from "@/server/bookings/series-attestation";
import { validateBookingSeries, seriesCommandPayload } from "@/server/commands/bookings/series-validation";
import { DEFAULT_SCHEDULING_RULES } from "@/features/scheduling/types";
import type { BookingSeriesInput } from "@/server/commands/bookings/series-validation";

const rule = {preset:"daily",startDate:"2026-10-12",startTime:"09:00:00",endTime:"10:00:00",endDayOffset:0,allDay:false,timeZone:"Europe/Stockholm",count:3} as const;
const payload = {startsAt:"2026-10-12T07:00:00.000000Z",endsAt:"2026-10-12T08:00:00.000000Z",allDay:false,description:"Existing",status:"planned",assigneeIds:["person"],workRoleId:null,jobId:null,customerId:null,facilityId:null,contactId:null,seriesId:null,occurrenceIndex:null,isException:false} as const;
function snapshot(): SeriesSnapshot {
  return {facts:{series:[{id:"source",rule,version:1,endsBefore:null,predecessorId:null,successorId:null}],
    occurrences:[12,13,14].map((day,index)=>({id:`row${day}`,seriesId:"source",index,nominalDate:`2026-10-${day}`,isException:false,payload:{...payload,startsAt:`2026-10-${day}T07:00:00.000000Z`,endsAt:`2026-10-${day}T08:00:00.000000Z`}})),
    detection:{profiles:[{id:"person",membershipId:"member",archivedAt:null,defaultWorkRoleId:null}],memberships:[{id:"member",status:"active"}],hours:[],calendarDays:[],workRoles:[],jobInputs:[],bookings:[],rules:DEFAULT_SCHEDULING_RULES}}} as unknown as SeriesSnapshot;
}
function input(patch: Partial<BookingSeriesInput> = {}): BookingSeriesInput {
  return {commandId:"command",sourceSeriesId:"source",seriesId:"successor",expectedVersion:1,pivotOccurrenceId:"row13",rule:{...rule,startDate:"2026-10-13"},template:{...payload,assigneeIds:[...payload.assigneeIds]},...patch};
}
test("Round1 actual planner honors forward requested date while retaining nominal ownership cutoff",()=>{
  const plan=planBookingSeries(snapshot(),input({rule:{...rule,startDate:"2026-10-14"}}));
  assert.equal(plan.pivot,"2026-10-13");assert.equal(plan.rule.startDate,"2026-10-14");
  assert.equal(plan.rows.find(row=>row.id==="row13")?.payload.status,"cancelled");
  assert.equal(plan.rows.find(row=>row.id==="row14")?.payload.status,"planned");
});
test("Round1 actual planner rejects requested dates before selected nominal cutoff",()=>{
  assert.throws(()=>planBookingSeries(snapshot(),input({rule:{...rule,startDate:"2026-10-11"}})),/VALIDATION_FAILED/);
});
test("Round1 whole successor cannot introduce slots before its current predecessor bound",()=>{
  const current=snapshot();
  Object.assign(current.facts.series[0]!,{predecessorId:"predecessor"});
  current.facts.series.push({...current.facts.series[0]!,id:"predecessor",endsBefore:"2026-10-12",predecessorId:null} as never);
  assert.throws(()=>planBookingSeries(current,input({seriesId:"source",pivotOccurrenceId:null,rule:{...rule,startDate:"2026-10-11"}})),/VALIDATION_FAILED/);
  assert.equal(planBookingSeries(current,input({seriesId:"source",pivotOccurrenceId:null,rule})).rows.length,3);
});
test("Round1 moved pivot production planner uses nominal slot and preserves exact exception",()=>{
  const current=snapshot(),pivot=current.facts.occurrences[1]!;
  pivot.isException=true;pivot.payload={...pivot.payload,startsAt:"2026-10-11T07:00:00.123456Z",endsAt:"2026-10-11T08:00:00.654321Z"};
  const plan=planBookingSeries(current,input());assert.equal(plan.pivot,"2026-10-13");
  assert.deepEqual(plan.rows.map(row=>row.id),["row13","row14"]);
  assert.deepEqual(plan.rows[0]!.payload,pivot.payload);
  assert.equal(current.facts.occurrences[0]!.seriesId,"source");
});


test("Round1 unchanged stored rule with pure field change keeps original suffix and end",()=>{
  const plan=planBookingSeries(snapshot(),input({rule,template:{...payload,description:"Changed default",assigneeIds:[...payload.assigneeIds]}}));
  assert.equal(plan.pivot,"2026-10-13");assert.equal(plan.rule.startDate,"2026-10-13");assert.equal(plan.rule.untilDate,"2026-10-14");assert.equal(plan.rule.count,undefined);
  assert.deepEqual(plan.rows.map(row=>row.id),["row13","row14"]);assert.ok(plan.rows.every(row=>row.payload.description==="Changed default"));
});
for(const end of [{count:1},{untilDate:"2026-10-13"}] as const)test(`Round1 inherited stored anchor with changed ${"count" in end?"count":"until"} begins at nominal pivot`,()=>{
  const {count:_count,...coordinates}=rule;void _count;
  const plan=planBookingSeries(snapshot(),input({rule:{...coordinates,...end}}));
  assert.equal(plan.rule.startDate,"2026-10-13");assert.equal(plan.rows[0]!.payload.status,"planned");assert.equal(plan.rows[1]!.payload.status,"cancelled");
  assert.deepEqual(plan.rows.map(row=>row.id),["row13","row14"]);
});
test("Round1 repeated prefix unchanged rule stays below live successor bound",()=>{
  const current=snapshot();current.facts.series[0]!.endsBefore="2026-10-14";current.facts.series[0]!.successorId="previous-successor";
  current.facts.occurrences=current.facts.occurrences.filter(row=>row.nominalDate<"2026-10-14");
  const plan=planBookingSeries(current,input({rule}));assert.deepEqual(plan.rows.map(row=>row.id),["row13"]);
  assert.ok(plan.rows.every(row=>row.nominalDate<"2026-10-14"));
});
test("Round1 semantic inherited coordinates compare weekday sets and ignore property order",()=>{
  const current=snapshot(),weekly={...rule,preset:"weekly" as const,weekdays:[1,2,3]};current.facts.series[0]!.rule=weekly;
  const reordered=Object.fromEntries(Object.entries({...weekly,weekdays:[3,1,2]}).reverse()) as unknown as BookingSeriesInput["rule"];
  const plan=planBookingSeries(current,input({rule:reordered}));assert.deepEqual(plan.rows.map(row=>row.id),["row13","row14"]);
});

/** Actual parser/planner/detector/preview; only snapshot RPC is a synthetic port. */
function admissionCase(peopleCount: number, bookingCount: number) {
  const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
  const people=Array.from({length:peopleCount},(_,n)=>id(n+10001)),shared=id(9999);
  const profiles=[shared,...people].map((person,index)=>({id:person,membershipId:id(index+50000),archivedAt:null,defaultWorkRoleId:null,employmentPercentage:100}));
  const bookings=Array.from({length:bookingCount},(_,n)=>{
    const date=new Date(Date.UTC(2026,7,1+Math.floor(n/20))).toISOString().slice(0,10);
    return {id:id(n+1),startsAt:`${date}T07:00:00.000000Z`,endsAt:`${date}T08:00:00.000000Z`,allDay:false,status:"planned",assigneeIds:[shared],jobId:null};
  });
  const facts={series:[],occurrences:[],detection:{profiles,memberships:profiles.map(p=>({id:p.membershipId,status:"active"})),hours:[],calendarDays:[],workRoles:[],
    jobInputs:peopleCount>1?[{jobId:id(30000),requiredWorkRoleIds:[],accessWindows:[]}]:[],rules:DEFAULT_SCHEDULING_RULES,bookings}};
  const canonicalFacts=JSON.stringify(facts);
  const claims={...Object.fromEntries(SERIES_CLAIM_FIELDS.map(field=>[field,"synthetic"])),factDigest:createHash("sha256").update(canonicalFacts).digest("hex"),engineVersion:"booking-conflicts-v3",configVersion:"stockholm-capacity-v1"};
  const snapshot={kind:"snapshot",claims,canonicalFacts,facts} as unknown as SeriesSnapshot;
  const raw={commandId:id(20000),seriesId:id(20001),sourceSeriesId:null,expectedVersion:null,pivotOccurrenceId:null,rule:{...rule,count:1},
    template:{...payload,assigneeIds:people,jobId:peopleCount>1?id(30000):null}};
  const checked=validateBookingSeries(raw);assert.equal(checked.ok,true,"public input validator admits this candidate");
  if(!checked.ok)throw new Error("Invalid admission fixture");
  const args={p_tenant_id:id(40000),p_actor_id:id(40001),p_command_id:raw.commandId,p_correlation_id:id(40002),p_input:seriesCommandPayload(checked.data)};
  const calls:string[]=[];
  const client={rpc:async(name:string)=>{calls.push(name);return {data:snapshot,error:null};}};
  return {input:checked.data,args,client,calls};
}
async function syntheticKey<T>(run:()=>Promise<T>) {
  const oldId=process.env.BOOKING_CONFLICT_ATTESTATION_KEY_ID,oldSecret=process.env.BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET;
  process.env.BOOKING_CONFLICT_ATTESTATION_KEY_ID="review-synthetic";process.env.BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET="review-synthetic-key";
  try{return await run();}finally{
    if(oldId===undefined)delete process.env.BOOKING_CONFLICT_ATTESTATION_KEY_ID;else process.env.BOOKING_CONFLICT_ATTESTATION_KEY_ID=oldId;
    if(oldSecret===undefined)delete process.env.BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET;else process.env.BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET=oldSecret;
  }
}
test("Round2 preview rejects a complete unrelated conflict plan over SQL's 3 MiB bound",async()=>syntheticKey(async()=>{
  const fixture=admissionCase(1,1000);
  const oversized=planBookingSeries((await fixture.client.rpc("snapshot_booking_series")).data,fixture.input);
  assert.ok(Buffer.byteLength(JSON.stringify(oversized),"utf8")>3*1024*1024);
  fixture.calls.length=0;
  await assert.rejects(()=>previewBookingSeries(fixture.client,fixture.args,fixture.input),{code:"VALIDATION_FAILED"});
  assert.deepEqual(fixture.calls,["snapshot_booking_series"]);
}));
test("Round2 preview retains long aggregate identities admitted by the latest SQL decision validator",async()=>syntheticKey(async()=>{
  const fixture=admissionCase(100,0);
  const oversized=planBookingSeries((await fixture.client.rpc("snapshot_booking_series")).data,fixture.input);
  assert.ok(oversized.groups.some(group=>group.logicalId.length>4000));
  assert.ok(Buffer.byteLength(JSON.stringify(oversized),"utf8")<3*1024*1024);
  fixture.calls.length=0;
  const preview=await previewBookingSeries(fixture.client,fixture.args,fixture.input);
  assert.ok(preview.warnings.some(warning=>warning.logicalId.length>4000));
  assert.equal(preview.total,1);assert.ok(preview.receipt.length>0);
  assert.equal(validateBookingSeries({...fixture.input,editorReview:{receipt:preview.receipt,decision:{acknowledged:true,
    reviewedLogicalIds:preview.warnings.map(warning=>warning.logicalId),selectedLogicalIds:[],reason:"Reviewed complete aggregate identities"}}}).ok,true);
  assert.deepEqual(fixture.calls,["snapshot_booking_series"]);
}));
test("Round2 serialized plan admits exactly 3 MiB UTF-8 and rejects the next multibyte character",()=>{
  const plan=planBookingSeries(snapshot(),input());plan.groups=[];plan.output=[];plan.rows[0]!.payload={...plan.rows[0]!.payload,description:""};
  const remaining=3*1024*1024-Buffer.byteLength(JSON.stringify(plan),"utf8");
  plan.rows[0]!.payload={...plan.rows[0]!.payload,description:"a".repeat(remaining)};
  assert.equal(Buffer.byteLength(serializeBookingSeriesPlan(plan),"utf8"),3*1024*1024);
  const admittedDescription=plan.rows[0]!.payload.description;
  plan.rows[0]!.payload={...plan.rows[0]!.payload,description:admittedDescription+"a"};
  assert.throws(()=>serializeBookingSeriesPlan(plan),{code:"VALIDATION_FAILED"});
  plan.rows[0]!.payload={...plan.rows[0]!.payload,description:admittedDescription+"å"};
  assert.throws(()=>serializeBookingSeriesPlan(plan),{code:"VALIDATION_FAILED"});
});
test("Round2 small valid preview still returns its complete admitted occurrence",async()=>syntheticKey(async()=>{
  const fixture=admissionCase(1,0),preview=await previewBookingSeries(fixture.client,fixture.args,fixture.input);
  assert.equal(preview.total,1);assert.equal(preview.occurrences.length,1);assert.ok(preview.receipt.length>0);
  assert.deepEqual(fixture.calls,["snapshot_booking_series"]);
}));
