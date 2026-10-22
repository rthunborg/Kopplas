/** Actual production planner; synthetic facts only, no SQL/RLS proof. */
import test from "node:test";
import assert from "node:assert/strict";
import { planBookingSeries, previewBookingSeries, serializeBookingSeriesPlan, type SeriesSnapshot } from "@/server/bookings/series-conflicts";
import { createHash } from "node:crypto";
import type { SeriesClaims } from "@/server/bookings/series-attestation";
import { BOOKING_CONFLICT_ENGINE_VERSION } from "@/server/bookings/conflict-attestation";
import { validateBookingSeries, seriesCommandPayload } from "@/server/commands/bookings/series-validation";
import { DEFAULT_SCHEDULING_RULES, SCHEDULING_RULES_VERSION } from "@/features/scheduling/types";
import type { BookingSeriesInput } from "@/server/commands/bookings/series-validation";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as series from "@/server/bookings/series-conflicts";
import * as validation from "@/server/commands/bookings/series-validation";
import * as references from "@/server/bookings/candidate-references";
import * as errors from "@/server/commands/command-errors";
import * as core from "@/server/commands/envelope-core";
import * as clock from "@/server/commands/clock";
import * as correlation from "@/server/commands/correlation";
import * as result from "@/lib/result/result";
import * as permissions from "@/server/authz/permission-matrix";
import * as recurrence from "@/features/scheduling/recurrence";
import * as transport from "@/features/resources/booking-transport";

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

/** Synthetic snapshot port, not PostgreSQL jsonb canonicalization or SQL proof.
 * Bind every finite claim to this call/facts; real production signs/verifies receipts. */
function fixtureClaims(args:Record<string,unknown>, canonicalFacts:string):SeriesClaims {
  const input=args.p_input as ReturnType<typeof seriesCommandPayload>,now=Date.now();
  return {tenantId:args.p_tenant_id as string,actorId:args.p_actor_id as string,
    operation:input.sourceSeriesId ? "update":"create",commandId:args.p_command_id as string,seriesId:input.seriesId,
    candidateDigest:createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    factDigest:createHash("sha256").update(canonicalFacts).digest("hex"),
    engineVersion:BOOKING_CONFLICT_ENGINE_VERSION,configVersion:SCHEDULING_RULES_VERSION,
    correlationId:args.p_correlation_id as string,keyId:"review-synthetic",
    issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+120000).toISOString()};
}

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
  const raw={commandId:id(20000),seriesId:id(20001),sourceSeriesId:null,expectedVersion:null,pivotOccurrenceId:null,rule:{...rule,count:1},
    template:{...payload,assigneeIds:people,jobId:peopleCount>1?id(30000):null}};
  const checked=validateBookingSeries(raw);assert.equal(checked.ok,true,"public input validator admits this candidate");
  if(!checked.ok)throw new Error("Invalid admission fixture");
  const args={p_tenant_id:id(40000),p_actor_id:id(40001),p_command_id:raw.commandId,p_correlation_id:id(40002),p_input:seriesCommandPayload(checked.data)};
  const claims=fixtureClaims(args,canonicalFacts);
  const snapshot={kind:"snapshot",claims,canonicalFacts,facts} as unknown as SeriesSnapshot;
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

/** Actual public actions + command envelope/config + validator/planner/receipt.
 * Only auth, cookie-RLS reads and RPC persistence are synthetic ports; no SQL proof. */
function publicSeriesCase(dst = false) {
  const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
  const tenant=id(1),person=id(2),source=id(3),target=id(4),role=id(5),otherRole=id(6);
  const storedRule={...rule,...(dst?{startDate:"2026-03-26",startTime:"02:15:00",endTime:"02:45:00"}:{})};
  const expanded=recurrence.expandRecurrence(storedRule);assert.ok(expanded.ok);
  const template:BookingSeriesInput["template"]={...payload,startsAt:expanded.occurrences[0]!.startsAt,endsAt:expanded.occurrences[0]!.endsAt,assigneeIds:[person],workRoleId:null};
  const facts={series:[{id:source,rule:storedRule,defaults:template,version:1,endsBefore:null,predecessorId:null,successorId:null}],
    occurrences:expanded.occurrences.map((slot,index)=>({id:id(20+index),seriesId:source,index,nominalDate:slot.nominalDate,isException:false,
      payload:{...template,startsAt:slot.startsAt,endsAt:slot.endsAt}})),
    detection:{profiles:[{id:person,membershipId:id(7),archivedAt:null,defaultWorkRoleId:null,employmentPercentage:100}],memberships:[{id:id(7),status:"active"}],
      hours:[],calendarDays:[],workRoles:[],jobInputs:[],bookings:[],rules:DEFAULT_SCHEDULING_RULES}};
  const raw={commandId:id(8),sourceSeriesId:source,seriesId:target,expectedVersion:1,pivotOccurrenceId:id(dst?22:21),
    rule:{...storedRule,startDate:dst?"2026-03-28":"2026-10-13"},template:{...template,description:"Changed default"}};
  const calls:string[]=[],plans:series.SeriesPlan[]=[],queries:{table:string;filters:Record<string,string>}[]=[];
  const roles=new Map<string,boolean>();
  const client={from:(table:string)=>{const filters:Record<string,string>={};const query={select:()=>query,eq:(key:string,value:string)=>{filters[key]=value;return query;},
    limit:async()=>({data:table==="booking_series"&&filters.id===source?[{id:source}]:[],error:null}),
    maybeSingle:async()=>{queries.push({table,filters});return{data:table==="work_roles"&&filters.tenant_id===tenant&&roles.has(filters.id!)?{id:filters.id,is_active:roles.get(filters.id!)}:null,error:null};}};return query;},
    rpc:async(name:string,args:Record<string,unknown>)=>{calls.push(name);
      if(name==="snapshot_booking_series"){
        const canonicalFacts=JSON.stringify(facts),claims=fixtureClaims(args,canonicalFacts);
        return{data:{kind:"snapshot",claims,canonicalFacts},error:null};
      }
      assert.equal(name,"finalize_booking_series");plans.push(JSON.parse(args.p_plan as string));
      const committed=args.p_input as {seriesId:string;pivotOccurrenceId:string|null};
      return{data:{kind:"committed",result:{seriesId:committed.seriesId,successorSeriesId:committed.pivotOccurrenceId?committed.seriesId:null,
        occurrenceIds:plans.at(-1)!.rows.map(row=>row.id)}},error:null};
    }};
  const require=createRequire(import.meta.url),modules:Record<string,unknown>={"next/cache":{revalidatePath:()=>{}},
    "@/server/db/supabase-server-client":{createSupabaseServerClient:async()=>client},
    "@/server/auth/resolve-tenant-context":{resolveTenantContext:async()=>({ok:true,data:{tenantId:tenant,userId:id(9),role:"tenant_admin",roles:["tenant_admin"],status:"active",userEmail:null,tenantName:null}})},
    "@/server/authz/permission-matrix":permissions,"@/server/commands/command-errors":errors,"./command-errors":errors,
    "@/server/bookings/series-conflicts":series,"@/server/commands/bookings/series-validation":validation,"./series-validation":validation,
    "@/server/bookings/candidate-references":references,"@/features/scheduling/recurrence":recurrence,"./booking-transport":transport,
    "@/lib/result/result":result,"./clock":clock,"./correlation":correlation,"./envelope-core":core,"./audit":{writeAuditEvent:()=>{throw new Error("Unexpected audit");}}};
  function load(path:string){const m={exports:{}};const output=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    runInNewContext(output,{module:m,exports:m.exports,require:(name:string)=>modules[name]??require(name),Buffer,process});return m.exports as Record<string,unknown>;}
  modules["@/server/commands/envelope"]=modules["../envelope"]=load("src/server/commands/envelope.ts");
  modules["@/server/commands/bookings/create-booking-series"]=load("src/server/commands/bookings/create-booking-series.ts");
  modules["@/server/commands/bookings/update-booking-series"]=load("src/server/commands/bookings/update-booking-series.ts");
  const actions=load("src/features/resources/booking-series-actions.ts") as {
    previewBookingSeriesAction:(input:unknown)=>Promise<{status:string;code?:string;message?:string;preview?:Awaited<ReturnType<typeof previewBookingSeries>>}>;
    saveBookingSeriesAction:(input:unknown)=>Promise<{status:string;code?:string}>;
  };
  async function save(preview:NonNullable<Awaited<ReturnType<typeof actions.previewBookingSeriesAction>>["preview"]>){return actions.saveBookingSeriesAction({...raw,
    editorReview:{receipt:preview.receipt,decision:{acknowledged:true,reviewedLogicalIds:preview.warnings.map(w=>w.logicalId),selectedLogicalIds:[],reason:"Reviewed current warnings"}}});}
  function protect(){roles.set(role,false);Object.assign(template,{workRoleId:role});raw.template.workRoleId=role;
    facts.occurrences.forEach((row,index)=>{row.isException=index!==2;row.payload={...row.payload,workRoleId:role,status:index===2?"cancelled":"planned"};});}
  return{...actions,raw,facts,calls,plans,queries,roles,role,otherRole,protect,save};
}

test("Round3 public preview and save envelope expand the effective original-end suffix before DST",async()=>syntheticKey(async()=>{
  const h=publicSeriesCase(true),preview=await h.previewBookingSeriesAction(h.raw);
  assert.equal(preview.status,"success");assert.equal(preview.preview!.total,1);
  assert.equal((await h.save(preview.preview!)).status,"success");
  assert.equal(h.plans.length,1);assert.equal(h.plans[0]!.rule.untilDate,"2026-03-28");assert.equal(h.plans[0]!.rows[0]!.nominalDate,"2026-03-28");
}));
test("Round3 effective DST failure blocks public preview and save before finalization",async()=>syntheticKey(async()=>{
  const h=publicSeriesCase(true);Object.assign(h.raw.rule,{count:2});
  const preview=await h.previewBookingSeriesAction(h.raw);assert.equal(preview.code,"VALIDATION_FAILED");
  assert.match(preview.message??"",/2026-03-29/,"effective failing occurrence remains actionable in the public preview");
  assert.equal((await h.saveBookingSeriesAction({...h.raw,editorReview:{receipt:"untrusted",decision:{acknowledged:false,reviewedLogicalIds:[],selectedLogicalIds:[],reason:""}}})).code,"VALIDATION_FAILED");
  assert.equal(h.plans.length,0);
}));
test("Round3 public preview retains archived default role only for existing protected payloads",async()=>syntheticKey(async()=>{
  const h=publicSeriesCase();h.protect();const preview=await h.previewBookingSeriesAction(h.raw);
  assert.equal(preview.status,"success");assert.equal((await h.save(preview.preview!)).status,"success");
  assert.deepEqual(h.plans[0]!.rows.map(row=>row.payload),h.facts.occurrences.slice(1).map(row=>row.payload));
  assert.ok(h.queries.some(q=>q.table==="work_roles"&&q.filters.tenant_id&&q.filters.id===h.role));
}));
test("Round3 active replacement default preserves each protected row's own archived role",async()=>syntheticKey(async()=>{
  const h=publicSeriesCase();h.protect();h.roles.set(h.otherRole,true);h.raw.template.workRoleId=h.otherRole;
  const preview=await h.previewBookingSeriesAction(h.raw);assert.equal(preview.status,"success");
  assert.equal((await h.save(preview.preview!)).status,"success");assert.ok(h.plans[0]!.rows.every(row=>row.payload.workRoleId===h.role));
}));
for(const scenario of ["all protected","protected plus new tombstone","ordinary template use","new inactive assignment","inactive default substitution","foreign default","foreign retained role","foreign customer","missing signed defaults","cancelled ordinary template use","new cancelled slot","following with ordinary prefix","whole-series shortening"] as const)
test(`Round3 R3-02 completeness ${scenario} checks effective template use through public actions`,async()=>syntheticKey(async()=>{
  const h=publicSeriesCase();h.protect();h.raw.pivotOccurrenceId=h.facts.occurrences[0]!.id;
  Object.assign(h.raw.rule,{startDate:"2026-10-12",count:2});
  if(scenario!=="all protected"&&scenario!=="new cancelled slot")Object.assign(h.facts.occurrences[2]!,{isException:false,payload:{...h.facts.occurrences[2]!.payload,status:"planned"}});
  if(scenario==="ordinary template use")h.facts.occurrences[0]!.isException=false;
  if(scenario==="new inactive assignment")Object.assign(h.raw.rule,{count:4});
  if(scenario==="inactive default substitution"){h.roles.set(h.otherRole,false);h.raw.template.workRoleId=h.otherRole;}
  if(scenario==="foreign default")h.raw.template.workRoleId=h.otherRole;
  if(scenario==="foreign retained role")h.facts.occurrences[2]!.payload.workRoleId=h.otherRole;
  if(scenario==="foreign customer")Object.assign(h.raw.template,{customerId:"00000000-0000-4000-8000-000000000099"});
  if(scenario==="missing signed defaults")delete(h.facts.series[0] as {defaults?:unknown}).defaults;
  if(scenario==="cancelled ordinary template use"){h.facts.occurrences[0]!.isException=false;Object.assign(h.raw.template,{status:"cancelled"});}
  if(scenario==="new cancelled slot"){Object.assign(h.raw.rule,{count:4});Object.assign(h.raw.template,{status:"cancelled"});}
  if(scenario==="following with ordinary prefix"){
    h.facts.occurrences[0]!.isException=false;h.raw.pivotOccurrenceId=h.facts.occurrences[1]!.id;
    Object.assign(h.raw.rule,{startDate:"2026-10-13",count:1});
  }
  if(scenario==="whole-series shortening")Object.assign(h.raw,{seriesId:h.raw.sourceSeriesId,pivotOccurrenceId:null});
  const checked=validateBookingSeries(h.raw,true);assert.ok(checked.ok,"fixture passes public update input validation");
  const expectedPlan=planBookingSeries({facts:h.facts} as unknown as SeriesSnapshot,checked.data);
  if(scenario==="protected plus new tombstone"||scenario==="following with ordinary prefix"||scenario==="whole-series shortening"){
    const retained=scenario==="following with ordinary prefix"?h.facts.occurrences.slice(1):h.facts.occurrences;
    assert.deepEqual(expectedPlan.rows.map(row=>row.id),retained.map(row=>row.id));
    assert.ok(expectedPlan.rows.every(row=>row.payload.workRoleId===h.role&&row.payload.description==="Existing"));
    assert.equal(expectedPlan.rows.at(-1)!.payload.status,"cancelled");assert.equal(expectedPlan.rows.at(-1)!.isException,true);
    assert.deepEqual(expectedPlan.rows.at(-1)!.payload,{...h.facts.occurrences[2]!.payload,status:"cancelled"});
  }
  if(scenario==="cancelled ordinary template use")assert.ok(expectedPlan.rows.some(row=>!row.isException&&row.payload.status==="cancelled"&&row.payload.description==="Changed default"));
  if(scenario==="new cancelled slot")assert.ok(expectedPlan.rows.some(row=>!h.facts.occurrences.some(old=>old.id===row.id)&&!row.isException&&row.payload.status==="cancelled"));
  const preview=await h.previewBookingSeriesAction(h.raw);
  if(scenario==="all protected"||scenario==="protected plus new tombstone"||scenario==="following with ordinary prefix"||scenario==="whole-series shortening"){
    assert.deepEqual(h.calls,["snapshot_booking_series"],"public action reached current-facts admission without finalization");
    assert.ok(h.queries.some(q=>q.table==="work_roles"&&q.filters.tenant_id&&q.filters.id===h.role),"existing tenant role was read through the cookie-RLS port");
    assert.equal(preview.status,"success",JSON.stringify(preview));assert.equal((await h.save(preview.preview!)).status,"success");
    assert.deepEqual(h.plans[0]!.rows,expectedPlan.rows);
  }else{
    assert.equal(preview.code,"TENANT_ACCESS_DENIED");assert.equal(preview.preview,undefined);
    assert.equal((await h.saveBookingSeriesAction(h.raw)).code,"BOOKING_CONFLICT_UNACKNOWLEDGED");assert.equal(h.plans.length,0);
  }
}));
test("Round3 deferred update expansion preserves structural, count and calendar admission caps",async()=>syntheticKey(async()=>{
  for(const patch of [{count:129},{count:undefined,untilDate:"2127-01-01"},{startTime:"25:00:00"}]){
    const h=publicSeriesCase(true);Object.assign(h.raw.rule,patch);
    assert.equal((await h.previewBookingSeriesAction(h.raw)).code,"VALIDATION_FAILED");assert.deepEqual(h.calls,[]);
  }
  const h=publicSeriesCase(true);
  assert.equal((await h.previewBookingSeriesAction({...h.raw,sourceSeriesId:null,expectedVersion:null,pivotOccurrenceId:null})).code,"VALIDATION_FAILED");
  assert.deepEqual(h.calls,[],"new-series DST expansion is still validated before snapshot");
}));
for(const change of ["new occurrence","new cancelled occurrence","changed inactive default","foreign default","foreign protected row","foreign customer","missing signed defaults"] as const)
test(`Round3 public preview denies ${change} without issuing save admission`,async()=>syntheticKey(async()=>{
  const h=publicSeriesCase();h.protect();
  if(change==="new occurrence")Object.assign(h.raw.rule,{count:4});
  if(change==="new cancelled occurrence"){Object.assign(h.raw.rule,{count:4});Object.assign(h.raw.template,{status:"cancelled"});}
  if(change==="changed inactive default"){h.roles.set(h.otherRole,false);h.raw.template.workRoleId=h.otherRole;}
  if(change==="foreign default")h.raw.template.workRoleId=h.otherRole;
  if(change==="foreign protected row")h.facts.occurrences[1]!.payload.workRoleId=h.otherRole;
  if(change==="foreign customer")Object.assign(h.raw.template,{customerId:"00000000-0000-4000-8000-000000000099"});
  if(change==="missing signed defaults")delete (h.facts.series[0] as {defaults?:unknown}).defaults;
  const preview=await h.previewBookingSeriesAction(h.raw);assert.equal(preview.code,"TENANT_ACCESS_DENIED");assert.equal(preview.preview,undefined);
  assert.equal((await h.saveBookingSeriesAction(h.raw)).code,"BOOKING_CONFLICT_UNACKNOWLEDGED");assert.equal(h.plans.length,0);
}));
test("Round2 small valid preview still returns its complete admitted occurrence",async()=>syntheticKey(async()=>{
  const fixture=admissionCase(1,0),preview=await previewBookingSeries(fixture.client,fixture.args,fixture.input);
  assert.equal(preview.total,1);assert.equal(preview.occurrences.length,1);assert.ok(preview.receipt.length>0);
  assert.deepEqual(fixture.calls,["snapshot_booking_series"]);
}));


test("Current synthetic snapshot fixtures bind call facts and fresh claims while obsolete versions and changed facts fail real admission",async()=>syntheticKey(async()=>{
  const fixture=admissionCase(1,0),snapshot=(await fixture.client.rpc("snapshot_booking_series")).data;
  assert.equal(snapshot.claims.tenantId,fixture.args.p_tenant_id);assert.equal(snapshot.claims.actorId,fixture.args.p_actor_id);
  assert.equal(snapshot.claims.commandId,fixture.args.p_command_id);assert.equal(snapshot.claims.correlationId,fixture.args.p_correlation_id);
  assert.equal(snapshot.claims.seriesId,fixture.input.seriesId);assert.equal(snapshot.claims.operation,"create");
  assert.equal(snapshot.claims.candidateDigest,createHash("sha256").update(JSON.stringify(fixture.args.p_input)).digest("hex"));
  assert.equal(snapshot.claims.engineVersion,BOOKING_CONFLICT_ENGINE_VERSION);assert.equal(snapshot.claims.configVersion,SCHEDULING_RULES_VERSION);
  assert.equal(Date.parse(snapshot.claims.expiresAt)-Date.parse(snapshot.claims.issuedAt),120000);assert.ok(Date.parse(snapshot.claims.expiresAt)>Date.now());
  for(const patch of [{engineVersion:"booking-conflicts-v3"},{configVersion:"stockholm-capacity-v1"},{factDigest:"0".repeat(64)}]){
    let calls=0;const client={rpc:async(name:string)=>{calls++;assert.equal(name,"snapshot_booking_series");return {data:{...snapshot,claims:{...snapshot.claims,...patch}},error:null};}};
    await assert.rejects(()=>previewBookingSeries(client,fixture.args,fixture.input),{code:"SERVER_ERROR"});assert.equal(calls,1);
  }
}));


/** Source inverse/real TS admission proof only; this does not execute PostgreSQL. */
function forwardSeriesProtocolSources() {
  const read=(path:string)=>readFileSync(path,"utf8").replaceAll("\r\n","\n");
  const original=read("supabase/migrations/20261019180000_recurring_booking_series.sql"),follow=read("supabase/migrations/20261019220000_booking_series_integrity_followup.sql"),resolver=read("supabase/migrations/20261020180000_conflict_resolver.sql");
  const body=(source:string,name:string)=>{const match=source.match(new RegExp("create(?: or replace)? function public[.]"+name+"\\(.*?as \\$\\$([\\s\\S]*?)\\$\\$;","is"));assert.ok(match);return match[1]!;};
  const pattern=resolver.match(/pattern:='([^']+)';/)?.[1];assert.ok(pattern);
  const finalBefore=body(follow,"finalize_booking_series"),refresh=new RegExp(pattern,"gs");assert.equal([...finalBefore.matchAll(refresh)].length,1);
  const effective=[body(original,"snapshot_booking_series"),finalBefore.replace(refresh,"perform public.booking_conflict_refresh_internal(p_tenant_id,output);")];
  const sql=read("supabase/migrations/20261022002335_booking_series_current_conflict_protocol.sql");
  const expected=[sql.match(/\$snapshot_source\$([\s\S]*?)\$snapshot_source\$/)?.[1],sql.match(/\$finalizer_source\$([\s\S]*?)\$finalizer_source\$/)?.[1]];
  assert.deepEqual(expected,effective,"forward preflight must bind exact effective sources, including common resolver refresh");
  const replacements=sql.match(/definitions\[target_index\] := replace\(replace\(definition,\s*'([^']+)','([^']+)'\),\s*'([^']+)','([^']+)'\)/);assert.ok(replacements);
  const pairs=[[replacements[1]!,replacements[2]!],[replacements[3]!,replacements[4]!]];
  assert.deepEqual(pairs,[["booking-conflicts-v3","booking-conflicts-v4"],["stockholm-capacity-v1","stockholm-capacity-v2"]]);
  const next=effective.map(source=>pairs.reduce((text,[before,after])=>text.replaceAll(before!,after!),source));
  for(let n=0;n<effective.length;n++){
    for(const [before] of pairs)assert.equal(effective[n]!.split(before!).length-1,1);
    assert.equal(pairs.reduce((text,[before,after])=>text.replaceAll(after!,before!),next[n]!),effective[n],"only protocol literals may differ");
  }
  assert.equal(next[1]!.split("perform public.booking_conflict_refresh_internal(p_tenant_id,output);").length-1,1);
  assert.notEqual(expected[1],finalBefore,"old pre-resolver finalizer is not an admissible predecessor");
  assert.match(sql,/select p\.prosrc,to_jsonb\(p\)-'prosrc'/);assert.match(sql,/metadata_after is distinct from metadata_before\[target_index\]/);
  assert.match(sql,/to_regprocedure\(signatures\[target_index\]\)::oid is distinct from target_oids\[target_index\]/);
  assert.deepEqual([...sql.matchAll(/'public\.([a-z_]+)\(uuid/g)].map(m=>m[1]),["snapshot_booking_series","finalize_booking_series"]);
  assert.ok(resolver.includes("'booking-conflicts-v3'")&&resolver.includes("'stockholm-capacity-v1'"),"resolver compatible pair is separate and unchanged");
  assert.ok(sql.includes("reference_source := replace(expected_sources[target_index],E'\\r\\n',E'\\n');"));
  assert.ok(sql.includes("position(E'\\r' in reference_source)>0"));
  assert.ok(sql.includes("source_before is distinct from reference_source\n        and source_before is distinct from replace(reference_source,E'\\n',E'\\r\\n')"));
  assert.ok(sql.includes("actual_sources[target_index] := source_before;"));
  assert.ok(sql.includes("source_after is distinct from replace(replace(actual_sources[target_index],"));
  assert.ok(!sql.includes("source_before := replace"),"actual catalog source is never normalized");
  return {effective,next};
}
test("Forward series migration preserves effective resolver-refresh bodies and complete non-source metadata",()=>{forwardSeriesProtocolSources();});
test("Actual forward SQL producer protocol satisfies real TS snapshot guard while historical protocol still fails",async()=>syntheticKey(async()=>{
  const {effective,next}=forwardSeriesProtocolSources(),fixture=admissionCase(1,0),base=(await fixture.client.rpc("snapshot_booking_series")).data;
  const protocol=(source:string)=>{const match=source.match(/'engineVersion','([^']+)','configVersion','([^']+)'/);assert.ok(match);return {engineVersion:match[1]!,configVersion:match[2]!};};
  for(const [source,accepted] of [[effective[0]!,false],[next[0]!,true]] as const){
    let calls=0;const client={rpc:async(name:string)=>{calls++;assert.equal(name,"snapshot_booking_series");return {data:{...base,claims:{...base.claims,...protocol(source)}},error:null};}};
    if(accepted){const preview=await previewBookingSeries(client,fixture.args,fixture.input);assert.equal(preview.total,1);assert.ok(preview.receipt.length>0);}
    else await assert.rejects(()=>previewBookingSeries(client,fixture.args,fixture.input),{code:"SERVER_ERROR"});
    assert.equal(calls,1);
  }
}));


test("Forward predecessor line-ending admission preserves actual LF or CRLF bytes and rejects mixed, bare-CR and changed bodies",()=>{
  const {effective}=forwardSeriesProtocolSources();
  // Evaluate the exact finite equality/replace branch bound above; no PostgreSQL execution.
  for(const original of effective){
    for(const reference of [original,original.replaceAll("\n","\r\n")]){
      const canonical=reference.replaceAll("\r\n","\n");
      const admits=(actual:string)=>!canonical.includes("\r")&&(actual===canonical||actual===canonical.replaceAll("\n","\r\n"));
      for(const actual of [original,original.replaceAll("\n","\r\n")]){
        assert.equal(admits(actual),true);
        const changed=actual.replaceAll("booking-conflicts-v3","booking-conflicts-v4").replaceAll("stockholm-capacity-v1","stockholm-capacity-v2");
        assert.equal(changed.replaceAll("booking-conflicts-v4","booking-conflicts-v3").replaceAll("stockholm-capacity-v2","stockholm-capacity-v1"),actual);
        assert.equal(changed.includes("\r\n"),actual.includes("\r\n"));
      }
      assert.equal(admits(original.replace("\n","\r\n")),false,"mixed body is not a complete CRLF variant");
      assert.equal(admits(original.replace("\n","\r")),false,"bare CR is not admitted");
      assert.equal(admits(original.replace("begin","begin -- unrelated drift")),false);
    }
  }
});
