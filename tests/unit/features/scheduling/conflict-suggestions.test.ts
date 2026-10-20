import test from "node:test";
import assert from "node:assert/strict";
import { evaluateConflictCandidate,suggestConflictSlots,CONFLICT_SUGGESTION_LIMITS } from "@/features/scheduling/conflict-suggestions";
import { DEFAULT_SCHEDULING_RULES,type SchedulingFacts } from "@/features/scheduling/types";
const facts:SchedulingFacts={candidate:{id:"candidate",jobId:null,startsAt:"2026-10-12T06:00:00Z",endsAt:"2026-10-12T07:00:00Z",allDay:false,status:"planned",assigneeIds:["person"]},existingBookings:[],
 people:[{id:"person",employmentPercentage:25,shifts:[{weekday:1,start:"08:00",end:"12:00",breaks:[]}],exceptions:[],workRoleIds:[]}],calendarDays:[],jobInputs:null,jobInputSets:[],rules:DEFAULT_SCHEDULING_RULES};
test("AC3 schedule-derived capacity and unrelated tenant conflicts do not suppress candidate suggestions",()=>{
  const input={...facts,existingBookings:[{...facts.candidate,id:"unrelated",assigneeIds:["other"]},{...facts.candidate,id:"unrelated2",assigneeIds:["other"]}],people:[...facts.people,{...facts.people[0]!,id:"other"}]};
  assert.deepEqual(evaluateConflictCandidate(input,input.candidate),{status:"available",loadMinutes:0,capacityMinutes:240});
  const slots=suggestConflictSlots(facts);assert.equal(slots.length,CONFLICT_SUGGESTION_LIMITS.results);
  assert.equal(slots[0]!.startsAt,"2026-10-12T06:00:00.000000Z");assert.equal(slots[0]!.endsAt,"2026-10-12T07:00:00.000000Z");
});
test("AC3 cancelled and malformed schedule facts are unknown, empty known job access is busy",()=>{
  assert.equal(evaluateConflictCandidate(facts,{...facts.candidate,status:"cancelled"}).status,"unknown");
  assert.equal(evaluateConflictCandidate({...facts,people:[]},facts.candidate).status,"unknown");
  assert.equal(evaluateConflictCandidate({...facts,jobInputSets:[{jobId:"job",requiredWorkRoleIds:null,accessWindows:[]}]},{...facts.candidate,jobId:"job"}).status,"busy");
  assert.deepEqual(suggestConflictSlots({...facts,candidate:{...facts.candidate,status:"cancelled"}}),[]);
});
for(const [date,start,end,nextStart,nextEnd] of [["2026-03-29","2026-03-29T00:00:00.000000Z","2026-03-29T00:30:00.000000Z","2026-03-30T06:00:00.000000Z","2026-03-30T06:30:00.000000Z"],["2026-10-25","2026-10-24T23:00:00.000000Z","2026-10-24T23:30:00.000000Z","2026-10-26T07:00:00.000000Z","2026-10-26T07:30:00.000000Z"]])test(`AC3 Stockholm DST week ${date} preserves elapsed duration and Sunday closure`,()=>{
  const input={...facts,candidate:{...facts.candidate,startsAt:start!,endsAt:end!}};
  assert.equal(evaluateConflictCandidate(input,input.candidate).status,"busy");
  const slots=suggestConflictSlots(input);assert.equal(slots[0]!.startsAt,nextStart);assert.equal(slots[0]!.endsAt,nextEnd);
  assert.equal(new Set(slots.map(s=>`${s.startsAt}/${s.endsAt}`)).size,slots.length);
});
