/** Headless attempt contract: uncertain requests retain the original payload and identity. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { annotationOutcomeAfter, canEditTimeReportAttempt, currentTimeReportResponse, timeReportAttemptAfter } from "@/features/time-reports/action-state";

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
