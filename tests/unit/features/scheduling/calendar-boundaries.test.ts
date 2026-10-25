import test from "node:test";
import assert from "node:assert/strict";
import { calendarDropTimes, navigateSchedulingDate, schedulingPeriod, validateSchedulingReadInput, EMPTY_SCHEDULING_FILTERS } from "@/features/scheduling/view-model";
import { prepareBookingTimes } from "@/features/resources/booking-editor-input";

test("low-year months stay bounded and use Gregorian leap years without Date.UTC remapping",()=>{
  for(const [date,days] of [["0001-02-10",28],["0004-02-10",29],["0099-12-10",31],["0100-02-10",28],["2000-02-10",29],["2100-02-10",28]] as const){
    const period=schedulingPeriod(date,"month");
    assert.equal(period.dates.length,days);assert.equal(period.dates[0],`${date.slice(0,7)}-01`);
    assert.ok(period.start.startsWith(date.slice(0,4)));assert.ok(period.end.startsWith(date.slice(0,4)) || date==="0099-12-10"&&period.end.startsWith("0100"));
  }
  assert.equal(navigateSchedulingDate("0099-12-31","month",1),"0100-01-31");
  assert.equal(navigateSchedulingDate("0004-03-31","month",-1),"0004-02-29");
});
test("period and navigation refuse unsupported encoding edges before expansion",()=>{
  for(const [date,mode] of [["0001-01-01","day"],["9999-12-30","day"],["9999-12-31","day"],["9999-12-10","month"],["10000-01-01","month"],["2026-02-30","month"]] as const)
    assert.throws(()=>schedulingPeriod(date,mode));
  assert.equal(schedulingPeriod("9999-12-28","day").dates.length,1);
  assert.throws(()=>navigateSchedulingDate("9999-12-31","day",1));
  assert.throws(()=>navigateSchedulingDate("0001-01-01","month",-1));
  assert.throws(()=>validateSchedulingReadInput({view:"schema",mode:"day",date:"10000-01-01",filters:EMPTY_SCHEDULING_FILTERS}));
});
for(const [name,start,end,target,targetEnd,expectedStart,expectedEnd] of [
  ["spring","2026-03-27T23:00:00Z","2026-03-28T23:00:00Z","2026-03-29T12:30:00Z","2026-03-29T13:00:00Z","2026-03-28T23:00:00.000000Z","2026-03-29T22:00:00.000000Z"],
  ["fall","2026-10-23T22:00:00Z","2026-10-24T22:00:00Z","2026-10-25T13:30:00Z","2026-10-25T14:00:00Z","2026-10-24T22:00:00.000000Z","2026-10-25T23:00:00.000000Z"],
] as const)test(`all-day ${name} move preserves calendar days and untouched editor validation instants`,()=>{
  const booking={allDay:true,startsAt:start,endsAt:end};
  const times=calendarDropTimes(booking,target,targetEnd,false)!;
  assert.deepEqual(times,{startsAt:expectedStart,endsAt:expectedEnd});
  assert.deepEqual(prepareBookingTimes({original:{startsAt:times.startsAt!,endsAt:times.endsAt},allDay:true,startChanged:false,endChanged:false,startsAtLocal:"",endsAtLocal:""}),times);
  assert.equal(booking.startsAt,start);assert.equal(booking.endsAt,end);
});
test("all-day resize snaps to selected local day end and rejects nonpositive proposal",()=>{
  const booking={allDay:true,startsAt:"2026-03-27T23:00:00Z",endsAt:"2026-03-28T23:00:00Z"};
  assert.deepEqual(calendarDropTimes(booking,"2026-03-29T12:30:00Z","2026-03-29T13:00:00Z",true),{endsAt:"2026-03-29T22:00:00.000000Z"});
  assert.equal(calendarDropTimes(booking,"2026-03-26T12:30:00Z","2026-03-26T13:00:00Z",true),null);
  assert.deepEqual(calendarDropTimes({...booking,endsAt:"2026-03-29T22:00:00Z"},"2026-10-25T13:30:00Z","2026-10-25T14:00:00Z",false),{startsAt:"2026-10-24T22:00:00.000000Z",endsAt:"2026-10-26T23:00:00.000000Z"});
});
test("timed drop preserves fractional elapsed duration rather than all-day snapping",()=>{
  const booking={allDay:false,startsAt:"2026-03-28T06:00:00.123456Z",endsAt:"2026-03-28T07:00:00.654321Z"};
  assert.deepEqual(calendarDropTimes(booking,"2026-03-29T12:30:00.000000Z","2026-03-29T13:00:00.000000Z",false),{startsAt:"2026-03-29T12:30:00.000000Z",endsAt:"2026-03-29T13:30:00.530865Z"});
  assert.deepEqual(calendarDropTimes(booking,"2026-03-29T12:30:00Z","2026-03-29T13:00:00Z",true),{endsAt:"2026-03-29T13:00:00Z"});
});
