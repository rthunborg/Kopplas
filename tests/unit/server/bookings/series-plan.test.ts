/** Actual production planner; synthetic facts only, no SQL/RLS proof. */
import test from "node:test";
import assert from "node:assert/strict";
import { planBookingSeries, type SeriesSnapshot } from "@/server/bookings/series-conflicts";
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
