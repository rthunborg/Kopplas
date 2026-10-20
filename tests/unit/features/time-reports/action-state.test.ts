/** Headless attempt contract: uncertain requests retain the original payload and identity. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { annotationOutcomeAfter, canEditTimeReportAttempt, currentTimeReportResponse, timeReportAttemptAfter, timeReportDraftFromBooking, timeReportDraftMinutes, updateTimeReportDraft } from "@/features/time-reports/action-state";

test("[P0] 15.4-UNIT-009 AC2 unknown filing outcome preserves exact payload and attempt until confirmed", async () => {
  const request = Object.freeze({ attemptId: "b859aeee-90ec-4d6c-b6a3-a439c725a241", date: "2026-10-20", minutes: 75, note: "Keep my input", bookingId: null, jobId: null });
  const unknown = timeReportAttemptAfter({ status: "pending", request }, "unknown");
  assert.equal(unknown.status, "unknown");
  assert.equal(unknown.request, request);
  const retry = timeReportAttemptAfter(unknown, "retry");
  assert.equal(retry.request, request);
  assert.equal(retry.status, "pending");
  assert.equal(timeReportAttemptAfter(retry, "success").status, "confirmed");
});

test("[P0] 15.4-UNIT-010 AC2 failure never claims submitted and definite rejection permits correction", async () => {
  const pending = { status: "pending", request: { attemptId: "exact", minutes: 75 } } as const;
  const unknown = timeReportAttemptAfter(pending, "unknown");
  assert.notEqual(unknown.status, "confirmed");
  assert.equal(canEditTimeReportAttempt(unknown), false);
  const rejected = timeReportAttemptAfter(pending, "rejected");
  assert.notEqual(rejected.status, "confirmed");
  assert.equal(canEditTimeReportAttempt(rejected), true);
});

test("[P1] 15.4-UNIT-011 AC3 AC7 old reads and superseded annotation responses require refresh", async () => {
  assert.equal(currentTimeReportResponse(3, 2), false);
  assert.equal(currentTimeReportResponse(3, 3), true);
  const result = annotationOutcomeAfter({ status: "pending", expectedRevision: 1, attemptId: "old" }, "stale");
  assert.equal(result.status, "refresh-required");
  assert.notEqual(result.status, "confirmed");
});

test("unknown filing remains frozen through denied retries until an authorized confirmation", () => {
  const request=Object.freeze({attemptId:"same",minutes:75});
  const unknown=timeReportAttemptAfter({status:"pending",request},"unknown");
  const denied=timeReportAttemptAfter(timeReportAttemptAfter(unknown,"retry"),"rejected");
  assert.equal(denied.status,"unknown");assert.equal(denied.request,request);assert.equal(canEditTimeReportAttempt(denied),false);
  assert.equal(timeReportAttemptAfter(timeReportAttemptAfter(denied,"retry"),"success").status,"confirmed");
});
test("each unchanged UTC endpoint preserves its fold and fractional instant independently", () => {
  const source={bookingId:"booking",date:"2026-10-25",startsAt:"2026-10-25T01:30:00Z",endsAt:"2026-10-25T02:30:00Z",minutes:60,jobId:null};
  const edited=updateTimeReportDraft(timeReportDraftFromBooking(source),{endsAtLocal:"2026-10-25T04:30"});
  assert.equal(timeReportDraftMinutes(edited,source),120);
  const micros={...source,startsAt:"2026-10-25T01:30:00.000001Z",endsAt:"2026-10-25T02:30:00.000001Z"};
  assert.equal(timeReportDraftMinutes(updateTimeReportDraft(timeReportDraftFromBooking(micros),{endsAtLocal:"2026-10-25T04:30"}),micros),null);
});
test("canonical twenty-minute prefill survives mode selection but an explicitly edited rounded decimal is rejected", () => {
  const source={bookingId:"booking",date:"2026-10-20",startsAt:"2026-10-20T06:00:00Z",endsAt:"2026-10-20T06:20:00Z",minutes:20,jobId:null};
  const hours=updateTimeReportDraft(timeReportDraftFromBooking(source),{mode:"hours"});
  assert.equal(timeReportDraftMinutes(hours,source),20);
  assert.equal(timeReportDraftMinutes(updateTimeReportDraft(hours,{hours:"0.3333333333333333"}),source),null);
});
test("first standalone start defaults its local day until report date is explicitly edited", () => {
  const first=updateTimeReportDraft(timeReportDraftFromBooking(),{startsAtLocal:"2026-10-12T23:30"});assert.equal(first.date,"2026-10-12");
  const explicit=updateTimeReportDraft(first,{date:"2026-10-14"});assert.equal(updateTimeReportDraft(explicit,{startsAtLocal:"2026-10-13T00:30"}).date,"2026-10-14");
});
