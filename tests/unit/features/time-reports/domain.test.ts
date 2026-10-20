/** Independent literal goldens: do not calculate expected values with scheduling/domain helpers. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { completedNudgeDates, formatReportMinutes, personalWeek, reportedBookedDelta, reportMinutesBetween } from "@/features/time-reports/domain";

test("[P1] 15.4-UNIT-005 AC6 Stockholm DST prefill uses elapsed instants not wall-clock subtraction", async () => {
  assert.equal(reportMinutesBetween("2026-03-29T00:30:00Z", "2026-03-29T01:30:00Z"), 60); // local 01:30→03:30
  assert.equal(reportMinutesBetween("2026-10-24T23:30:00Z", "2026-10-25T02:30:00Z"), 180); // local 01:30→03:30
  assert.equal(reportMinutesBetween("2026-03-28T23:00:00Z", "2026-03-29T22:00:00Z"), 1380); // 23h local day
  assert.equal(reportMinutesBetween("2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z"), 1500); // 25h local day
  assert.equal(reportMinutesBetween("2026-10-19T21:30:00Z", "2026-10-19T22:30:00Z"), 60); // overnight
  assert.equal(reportMinutesBetween("2026-10-20T00:00:00.000000Z", "2026-10-20T00:00:59.999999Z"), null);
  assert.equal(reportMinutesBetween("2026-10-20T00:00:00Z", "2026-10-20T00:01:00.000001Z"), null);
  assert.equal(reportMinutesBetween("2026-10-20T00:00:00Z", "2026-10-20T00:01:30Z"), null);
  assert.equal(reportMinutesBetween("2026-10-20T01:00:00Z", "2026-10-20T01:00:00Z"), null);
  assert.equal(reportMinutesBetween("2026-10-20T02:00:00Z", "2026-10-20T01:00:00Z"), null);
});

test("[P1] 15.4-UNIT-006 AC5 seven completed Stockholm dates filter weekends and never extend window to seven weekdays", async () => {
  assert.deepEqual(completedNudgeDates("2026-10-20T12:00:00Z"), ["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-19"]);
  assert.deepEqual(completedNudgeDates("2026-03-29T22:30:00Z"), ["2026-03-23", "2026-03-24", "2026-03-25", "2026-03-26", "2026-03-27"]); // local Monday
  assert.deepEqual(completedNudgeDates("2026-10-25T23:30:00Z"), ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"]); // local Monday
  assert.deepEqual(completedNudgeDates("2027-01-03T23:30:00Z"), ["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01"]);
});

test("[P1] 15.4-UNIT-007 AC3 own weekly minutes and missing-day indicators do not infer hour completeness", async () => {
  const result = personalWeek({ weekStart: "2026-10-12", userId: "own", reports: [
    { id: "a", userId: "own", date: "2026-10-12", minutes: 75, status: "submitted", bookingId: "book", jobId: "job" },
    { id: "b", userId: "own", date: "2026-10-12", minutes: 15, status: "submitted", bookingId: null, jobId: null },
    { id: "c", userId: "own", date: "2026-10-14", minutes: 1, status: "submitted", bookingId: null, jobId: null },
    { id: "peer", userId: "peer", date: "2026-10-13", minutes: 999, status: "submitted", bookingId: null, jobId: null },
    { id: "next", userId: "own", date: "2026-10-19", minutes: 999, status: "submitted", bookingId: null, jobId: null },
  ], bookedDates: ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-17"] });
  assert.equal(result.totalMinutes, 91);
  assert.deepEqual(result.missingDates, ["2026-10-13"]);
  assert.deepEqual(result.days.flatMap((day: { reports: { id: string }[] }) => day.reports.map(row => row.id)), ["a", "b", "c"]);
});

test("[P1] 15.4-UNIT-008 AC4 AC9 delta is report minus frozen booked-at-filing minutes and standalone stays absent", async () => {
  assert.equal(reportedBookedDelta({ minutes: 135, bookedMinutesAtFiling: 120 }), 15);
  assert.equal(reportedBookedDelta({ minutes: 90, bookedMinutesAtFiling: 120 }), -30);
  assert.equal(reportedBookedDelta({ minutes: 120, bookedMinutesAtFiling: 120 }), 0);
  assert.equal(reportedBookedDelta({ minutes: 120, bookedMinutesAtFiling: null }), null);
});

test("fractional booked snapshots retain decimal precision while reported whole minutes keep familiar formatting", () => {
  assert.equal(formatReportMinutes(180), "3 h");
  assert.equal(formatReportMinutes(75), "1 h 15 min");
  assert.equal(formatReportMinutes(60.1), "1 h 0,1 min");
  assert.equal(formatReportMinutes(90.500001), "1 h 30,500001 min");
  assert.equal(formatReportMinutes(0.000000016666666666666667), "1,6666666666666667e-8 min");
});
