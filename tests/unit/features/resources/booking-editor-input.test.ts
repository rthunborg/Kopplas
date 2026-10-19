/**
 * Skipped RED pure editor input contract. Bind real input functions during GREEN;
 * no parser/timezone/detector implementation lives in the test-owned adapter.
 * Duplicate decision IDs are rejected here consistently with existing assignee
 * input validation; canonical de-duplication is also permissible if documented
 * at implementation and shown to preserve the same business decision identity.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { booking, decision, GROUP_A, GROUP_B } from "@/tests-support/booking-editor-contract";
import { normalizeBookingDecision, prepareBookingTimes, followingBookingDraft, recurrenceRuleFromEditor } from "@/features/resources/booking-editor-input";
import { expandRecurrence, validateRecurrenceRule } from "@/features/scheduling/recurrence";
import type { BookingFacts } from "@/features/resources/booking-types";

test("Round1 each untouched endpoint retains fractional precision and the later Stockholm fold instant", () => {
  const original = {startsAt: "2026-10-25T01:30:00.123456Z", endsAt: "2026-10-25T03:00:00.654321Z"};
  assert.deepEqual(prepareBookingTimes({original,startChanged:false,endChanged:true,allDay:false,
    startsAtLocal:"2026-10-25T02:30",endsAtLocal:"2026-10-25T05:00"}),
  {startsAt:original.startsAt,endsAt:"2026-10-25T04:00:00.000000Z"});
  assert.deepEqual(prepareBookingTimes({original,startChanged:true,endChanged:false,allDay:false,
    startsAtLocal:"2026-10-25T02:00",endsAtLocal:"2026-10-25T04:00"}),
  {startsAt:"2026-10-25T00:00:00.000000Z",endsAt:original.endsAt});
});
test("Round1 complete capacity identities larger than description limits remain valid human decisions", () => {
  const ids=Array.from({length:96},(_,i)=>`00000000-0000-4000-8000-${String(i).padStart(12,"0")}`);
  const logical=JSON.stringify([JSON.stringify(["over_capacity",ids,[ids[0]],"2026-10-11T22:00:00.000000Z","2026-10-12T22:00:00.000000Z"]),ids[0]]);
  assert.ok(logical.length>4000);
  assert.equal(normalizeBookingDecision({acknowledged:true,reviewedLogicalIds:[logical],selectedLogicalIds:[logical],reason:"Reviewed complete group"}).ok,true);
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-001 canonical decision orders logical identities and trims reason", () => {
  const result = normalizeBookingDecision(decision({ reviewedLogicalIds: [GROUP_B, GROUP_A],
    selectedLogicalIds: [GROUP_B, GROUP_A], reason: "  Kunden godkänner samordning \n " }));
  assert.deepEqual(result, { ok: true, data: decision({ reviewedLogicalIds: [GROUP_A, GROUP_B].sort(),
    selectedLogicalIds: [GROUP_A, GROUP_B].sort(), reason: "Kunden godkänner samordning" }) });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-002 duplicate selected logical identities do not form a valid decision", () => {
  assert.deepEqual(normalizeBookingDecision(decision({ selectedLogicalIds: [GROUP_A, GROUP_A] })),
    { ok: false, code: "VALIDATION_FAILED" });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P0] 14.4-UNIT-INPUT-003 closed human decision rejects authority and transport fields", () => {
  for (const field of ["tenantId", "actorId", "acceptedAt", "receipt", "signature", "proof", "conflicts"]) {
    assert.deepEqual(normalizeBookingDecision({ ...decision(), [field]: "forged" }),
      { ok: false, code: "VALIDATION_FAILED" }, field);
  }
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-004 current-set review cannot carry a whitespace-only reason", () => {
  assert.deepEqual(normalizeBookingDecision(decision({ reason: " \n\t " })),
    { ok: false, code: "VALIDATION_FAILED" });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-005 reviewed warning set permits an empty selected subset", () => {
  const supplied = decision({ selectedLogicalIds: [] });
  assert.deepEqual(normalizeBookingDecision(supplied), { ok: true, data: { ...supplied,
    reviewedLogicalIds: [GROUP_A, GROUP_B].sort() } });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-006 equivalent permutations produce the same canonical business decision", () => {
  const first = normalizeBookingDecision(decision({ reviewedLogicalIds: [GROUP_A, GROUP_B],
    selectedLogicalIds: [GROUP_A, GROUP_B], reason: "Samordning" }));
  const second = normalizeBookingDecision(decision({ reviewedLogicalIds: [GROUP_B, GROUP_A],
    selectedLogicalIds: [GROUP_B, GROUP_A], reason: "  Samordning  " }));
  assert.equal(first.ok, true);
  assert.deepEqual(second, first);
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-007 untouched displayed minutes preserve exact PostgreSQL microseconds", () => {
  const original = booking();
  const actual = prepareBookingTimes({ original, startChanged: false, endChanged: false, allDay: false,
    startsAtLocal: "2026-10-12T08:00:00", endsAtLocal: "2026-10-12T16:00:00" });
  assert.deepEqual(actual, { startsAt: original.startsAt, endsAt: original.endsAt });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-008 changed Stockholm fold input uses the existing earliest-instant policy", () => {
  const actual = prepareBookingTimes({ original: booking(), startChanged: true, endChanged: true, allDay: false,
    startsAtLocal: "2026-10-25T02:30:00", endsAtLocal: "2026-10-25T03:30:00" });
  assert.deepEqual(actual, { startsAt: "2026-10-25T00:30:00.000000Z", endsAt: "2026-10-25T02:30:00.000000Z" });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-009 changed Stockholm gap input uses the existing first-valid-instant policy", () => {
  const actual = prepareBookingTimes({ original: booking(), startChanged: true, endChanged: true, allDay: false,
    startsAtLocal: "2026-03-29T02:30:00", endsAtLocal: "2026-03-29T04:00:00" });
  assert.deepEqual(actual, { startsAt: "2026-03-29T01:00:00.000000Z", endsAt: "2026-03-29T02:00:00.000000Z" });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-010 changed full-day spring bounds span Stockholm's 23-hour local day", () => {
  const actual = prepareBookingTimes({ original: booking(), startChanged: true, endChanged: true, allDay: true,
    startsAtLocal: "2026-03-29T00:00:00", endsAtLocal: "2026-03-30T00:00:00" });
  assert.deepEqual(actual, { startsAt: "2026-03-28T23:00:00.000000Z", endsAt: "2026-03-29T22:00:00.000000Z" });
});

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P1] 14.4-UNIT-INPUT-011 changed full-day autumn bounds span Stockholm's 25-hour local day", () => {
  const actual = prepareBookingTimes({ original: booking(), startChanged: true, endChanged: true, allDay: true,
    startsAtLocal: "2026-10-25T00:00:00", endsAtLocal: "2026-10-26T00:00:00" });
  assert.deepEqual(actual, { startsAt: "2026-10-24T22:00:00.000000Z", endsAt: "2026-10-25T23:00:00.000000Z" });
});

test("Round1 following defaults use only explicit gesture fields, preserving resized fractional endpoints",()=>{
  const template={...booking(),seriesId:null,occurrenceIndex:null,isException:false} as BookingFacts;
  const rule={preset:"daily",startDate:"2026-10-12",startTime:"09:00:00.123456",endTime:"10:00:00.654321",endDayOffset:0,allDay:false,timeZone:"Europe/Stockholm",count:3} as const;
  const plain=followingBookingDraft(template,rule,"2026-11-02");
  assert.equal(plain.start,"2026-11-02T09:00:00.123456");assert.deepEqual(plain.facts,template);
  const resized=followingBookingDraft(template,rule,"2026-11-02",{endsAt:"2026-11-02T11:30:00.000001Z",assigneeIds:["replacement"]});
  assert.equal(resized.start,plain.start);assert.equal(resized.end,"2026-11-02T12:30:00.000001");
  assert.deepEqual(resized.facts.assigneeIds,["replacement"]);assert.equal(resized.facts.description,template.description);
});
for(const [start,end,expected] of [
  ["2026-03-28","2026-03-29",[["2026-03-27T23:00:00.000000Z","2026-03-28T23:00:00.000000Z"],["2026-03-28T23:00:00.000000Z","2026-03-29T22:00:00.000000Z"],["2026-03-29T22:00:00.000000Z","2026-03-30T22:00:00.000000Z"]]],
  ["2026-10-24","2026-10-25",[["2026-10-23T22:00:00.000000Z","2026-10-24T22:00:00.000000Z"],["2026-10-24T22:00:00.000000Z","2026-10-25T23:00:00.000000Z"],["2026-10-25T23:00:00.000000Z","2026-10-26T23:00:00.000000Z"]]],
] as const)test(`Round1 date-only all-day converter validates and expands Stockholm DST ${start}`,()=>{
  const rule=recurrenceRuleFromEditor({preset:"daily",endMode:"count",count:3,weekdays:[],allDay:true,start,end});
  assert.equal(rule.startTime,"00:00:00");assert.equal(rule.endTime,"00:00:00");assert.equal(rule.endDayOffset,1);assert.ok(validateRecurrenceRule(rule));
  const expanded=expandRecurrence(rule);assert.equal(expanded.ok,true);if(!expanded.ok)throw new Error("Expected complete all-day schedule");
  assert.deepEqual(expanded.occurrences.map(row=>[row.startsAt,row.endsAt]),expected);
});
