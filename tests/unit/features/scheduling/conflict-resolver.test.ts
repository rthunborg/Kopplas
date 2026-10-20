import test from "node:test";
import assert from "node:assert/strict";
import { scopedConflictGroups,groupConflictQueue,conflictResolverHref } from "@/features/scheduling/conflict-resolver";
import { validateConflictResolution } from "@/server/commands/bookings/conflict-resolution-validation";
import type { ResolverBooking,ResolverGroup } from "@/features/scheduling/conflict-resolver-types";
import {planConflictResolution,type ResolverSnapshot} from "@/server/bookings/conflict-resolution";
import {deriveSeriesConflicts} from "@/server/bookings/series-conflicts";
import {DEFAULT_SCHEDULING_RULES} from "@/features/scheduling/types";
import type {BookingFacts} from "@/features/resources/booking-types";
import type {ResolutionRequest} from "@/features/scheduling/conflict-resolver-types";
const group:ResolverGroup={logicalId:"whole",keys:["base","association"],personId:"person",bookingIds:["a","b","c"],rule:"over_capacity",startsAt:"2026-10-24T22:00:00Z",endsAt:"2026-10-25T23:00:00Z",status:"open"};
test("AC1/2 scope and Stockholm grouping preserve complete aggregate peers and full DST interval",()=>{
  const bookings=[{id:"a",payload:{jobId:"job",startsAt:"2026-10-25T06:00:00Z",endsAt:"2026-10-25T07:00:00Z"}},{id:"b",payload:{jobId:"other",startsAt:"2026-10-25T07:00:00Z",endsAt:"2026-10-25T08:00:00Z"}}] as ResolverBooking[];
  assert.deepEqual(scopedConflictGroups([group,group],bookings,{jobId:"job"}),[group]);
  assert.deepEqual(groupConflictQueue([group]),[{personId:"person",date:"2026-10-25",groups:[group]}]);
  assert.deepEqual(scopedConflictGroups([group],bookings,{start:"2026-10-25T07:00:00Z",end:"2026-10-25T08:00:00Z"}),[group]);
  assert.match(conflictResolverHref({bookingId:"id"}),/bookingId=id/);
});
function seriesFixture(allDay=false){
 const payload:BookingFacts={startsAt:allDay?"2026-10-11T22:00:00.000000Z":"2026-10-12T06:00:00.123456Z",endsAt:allDay?"2026-10-12T22:00:00.000000Z":"2026-10-12T06:00:00.223456Z",allDay,description:"Exact original",status:"planned",assigneeIds:["person"],workRoleId:null,jobId:null,customerId:null,facilityId:null,contactId:null,seriesId:null,occurrenceIndex:null,isException:false};
 const rule={preset:"daily",startDate:"2026-10-12",startTime:allDay?"00:00:00":"08:00:00.123456",endTime:allDay?"00:00:00":"08:00:00.223456",endDayOffset:allDay?1:0,allDay,timeZone:"Europe/Stockholm",count:3} as const;
 const occurrences=[12,13,14].map((d,index)=>({id:`row${d}`,seriesId:"source",index,nominalDate:`2026-10-${d}`,isException:false,payload:{...payload,startsAt:allDay?`2026-10-${d-1}T22:00:00.000000Z`:`2026-10-${d}T06:00:00.123456Z`,endsAt:allDay?`2026-10-${d}T22:00:00.000000Z`:`2026-10-${d}T06:00:00.223456Z`}}));
 const bookings=occurrences.flatMap(o=>[{id:o.id,seriesId:"source",nominalDate:o.nominalDate,isException:false,payload:o.payload},{id:`peer${o.id}`,seriesId:null,nominalDate:null,isException:false,payload:o.payload}]);
 const snapshot={facts:{series:[{id:"source",rule,defaults:payload,version:1,endsBefore:null,predecessorId:null,successorId:null}],occurrences,bookings,workflow:[],detection:{profiles:[{id:"person",membershipId:"member",archivedAt:null,defaultWorkRoleId:null,employmentPercentage:100},{id:"other",membershipId:"other-member",archivedAt:null,defaultWorkRoleId:null,employmentPercentage:100}],memberships:[{id:"member",status:"active"},{id:"other-member",status:"active"}],hours:[],calendarDays:[],workRoles:[],jobInputs:[],bookings:bookings.map(b=>({id:b.id,...b.payload})),rules:DEFAULT_SCHEDULING_RULES}}} as unknown as ResolverSnapshot;
 const target=deriveSeriesConflicts(snapshot.facts.detection,[],true).groups.find(g=>g.rule==="double_booking"&&g.bookingIds.includes("row12"))!;
 const input:ResolutionRequest={commandId:"command",bookingId:"row12",action:"adjust",targetLogicalIds:[target.logicalId],wholeSeries:true,payload};
 return {snapshot,input,payload,rule};
}
test("R1-10 assignment-only common fix preserves independent literal microsecond endpoints and duration",()=>{
 const {snapshot,input}=seriesFixture();const plan=planConflictResolution(snapshot,{...input,payload:{...input.payload!,assigneeIds:["other"]}});
 assert.equal(plan.rows[0]!.payload.startsAt,"2026-10-12T06:00:00.123456Z");assert.equal(plan.rows[0]!.payload.endsAt,"2026-10-12T06:00:00.223456Z");
 assert.equal(plan.rows[2]!.payload.startsAt,"2026-10-14T06:00:00.123456Z");assert.equal(plan.rows[2]!.payload.endsAt,"2026-10-14T06:00:00.223456Z");
});
test("R1-06 timed/all-day common conversions keep nominal bounds and valid exclusive endpoints both directions",()=>{
 const timed=seriesFixture(),day=seriesFixture(true);
 const toDay=planConflictResolution(timed.snapshot,{...timed.input,payload:day.payload});
 assert.equal(toDay.rows[2]!.payload.startsAt,"2026-10-13T22:00:00.000000Z");assert.equal(toDay.rows[2]!.payload.endsAt,"2026-10-14T22:00:00.000000Z");
 const toTimed=planConflictResolution(day.snapshot,{...day.input,payload:timed.payload});assert.equal(toTimed.rows[2]!.payload.endsAt,"2026-10-14T06:00:00.223456Z");
 assert.deepEqual(toDay.rows.map(r=>[r.id,r.nominalDate]),toTimed.rows.map(r=>[r.id,r.nominalDate]));assert.equal(toDay.series?.rule.count,3);
});
test("R1-02 resolver following candidate uses actual suffix planner and retains original remaining bound",()=>{
 const {snapshot,input,payload,rule}=seriesFixture();const following={commandId:"command",seriesId:"successor",sourceSeriesId:"source",expectedVersion:1,pivotOccurrenceId:"row12",rule:{...rule,startTime:"09:00:00",endTime:"10:00:00"},template:{...payload,startsAt:"2026-10-12T07:00:00.000000Z",endsAt:"2026-10-12T08:00:00.000000Z"}};
 const plan=planConflictResolution(snapshot,{...input,wholeSeries:false,payload:following.template,following} as ResolutionRequest);
 assert.equal(plan.series?.id,"successor");assert.equal(plan.rows[2]!.seriesId,"successor");assert.equal(plan.rows[2]!.payload.startsAt,"2026-10-14T07:00:00.000000Z");assert.equal(plan.rows[2]!.id,"row14");
});
test("R1-08 real resolver validation canonicalizes SQL field order and following receipt input identically",()=>{
 const fixture=seriesFixture(),payload={...fixture.payload,assigneeIds:[crypto.randomUUID()]},rule=fixture.rule,commandId=crypto.randomUUID(),bookingId=crypto.randomUUID(),sourceId=crypto.randomUUID();
 const following={commandId,seriesId:crypto.randomUUID(),sourceSeriesId:sourceId,expectedVersion:1,pivotOccurrenceId:bookingId,rule,template:payload};
 const raw={commandId,bookingId,action:"adjust",targetLogicalIds:["target"],payload:Object.fromEntries(Object.entries(payload).reverse()),wholeSeries:false,following};
 const normalized=validateConflictResolution(raw);assert.equal(normalized.ok,true);if(!normalized.ok)throw new Error();
 const again=validateConflictResolution(normalized.data);assert.deepEqual(again,normalized);assert.equal(JSON.stringify(again),JSON.stringify(normalized));
 assert.equal(validateConflictResolution({...raw,wholeSeries:true}).ok,false);assert.equal(validateConflictResolution({...raw,following:{...following,pivotOccurrenceId:crypto.randomUUID()}}).ok,false);
});
test("AC5/8 acceptance rejects whitespace, blanket series, unrelated selection and unknown input fields",()=>{
  const input={commandId:crypto.randomUUID(),bookingId:crypto.randomUUID(),action:"accept",targetLogicalIds:["whole"],wholeSeries:false,payload:null};
  assert.equal(validateConflictResolution(input).ok,true);
  assert.equal(validateConflictResolution({...input,wholeSeries:true}).ok,false);
  assert.equal(validateConflictResolution({...input,targetLogicalIds:[]}).ok,false);
  assert.equal(validateConflictResolution({...input,actorId:crypto.randomUUID()}).ok,false);
  assert.equal(validateConflictResolution({...input,review:{receipt:"encrypted",decision:{acknowledged:true,reason:"  ",reviewedLogicalIds:["whole"],selectedLogicalIds:["whole"]}}}).ok,false);
  assert.equal(validateConflictResolution({...input,review:{receipt:"encrypted",decision:{acknowledged:true,reason:"Reviewed",reviewedLogicalIds:["whole"],selectedLogicalIds:["unrelated"]}}}).ok,false);
});
