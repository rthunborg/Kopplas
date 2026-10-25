import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { loadSeriesStateBindings, seriesState, type Attempt } from "../../../../tests/support/booking-series-unit-atdd";

// RED: T5 headless production state module absent. No DOM/focus/persistence claim.
describe("15.2 latest preview and explicit attempt recovery — AC2/AC3/AC8", () => {
  for (const previewStatus of ["idle", "pending", "failed"] as const) {
    test("[P0] TEA15.2-STATE-001 " + previewStatus + " preview cannot save", async () => {
      const b = await loadSeriesStateBindings();
      assert.equal(b.canSaveSeries(seriesState({ previewStatus })), false);
    });
  }
  test("[P0] TEA15.2-STATE-001 late preview cannot replace latest candidate or authorize save", async () => {
    const b = await loadSeriesStateBindings();
    const before = seriesState({ candidateKey: "candidate-B", latestRequestId: 2, previewStatus: "pending", preview: null });
    const after = b.applySeriesEvent(before, { type: "preview-succeeded", preview: { requestId: 1, candidateKey: "candidate-A", receipt: "old", seriesVersion: 1, warnings: [] } });
    assert.deepEqual(after, before);
    assert.equal(b.canSaveSeries(after), false);
  });
  for (const changedField of ["rule", "seriesVersion", "factRevision", "pivotOccurrenceId", "proposedIds"]) {
    test("[P0] TEA15.2-STATE-001 changing " + changedField + " discards receipt selection and reason", async () => {
      const b = await loadSeriesStateBindings();
      const before = seriesState({ selected: ["complete-group-A"], reason: "Reviewed all current warnings" });
      const after = b.applySeriesEvent(before, { type: "candidate-changed", changedField, candidateKey: "candidate-B" });
      assert.equal(after.preview, null);
      assert.deepEqual(after.selected, []);
      assert.equal(after.reason, "");
      assert.equal(b.canSaveSeries(after), false);
    });
  }
  test("[P0] TEA15.2-STATE-001 complete warning set includes eleventh warning before save admission", async () => {
    const b = await loadSeriesStateBindings();
    const warnings = Array.from({ length: 12 }, (_, i) => "logical-group-" + i);
    const state = seriesState({ preview: { requestId: 1, candidateKey: "candidate-A", receipt: "opaque", seriesVersion: 1, warnings },
      selected: [warnings[10]!], reason: "Foreman reviewed complete set" });
    const unacknowledged = b.applySeriesEvent(state, { type: "review-changed", acknowledged: false, reviewedLogicalIds: warnings.slice(0, 10) });
    assert.equal(b.canSaveSeries(unacknowledged), false);
    const acknowledged = b.applySeriesEvent(state, { type: "review-changed", acknowledged: true, reviewedLogicalIds: warnings });
    assert.equal(b.canSaveSeries(acknowledged), true);
  });
  test("[P0] TEA15.2-STATE-002 lost response retains exact immutable attempt for explicit retry", async () => {
    const b = await loadSeriesStateBindings();
    const attempt: Attempt = { commandId: crypto.randomUUID(), seriesId: crypto.randomUUID(),
      proposedIds: [crypto.randomUUID(), crypto.randomUUID()], input: { description: "Keep unsent input", count: 2 } };
    const before = seriesState({ attempt, persistence: "saving" });
    const unknown = b.applySeriesEvent(before, { type: "response-lost" });
    assert.equal(unknown.persistence, "unknown");
    assert.deepEqual(unknown.attempt, attempt);
    assert.deepEqual(b.seriesRetryAttempt(unknown), attempt);
  });
  test("[P1] TEA15.2-STATE-002 failed response keeps labelled unsent data until server-confirmed result", async () => {
    const b = await loadSeriesStateBindings();
    const attempt: Attempt = { commandId: crypto.randomUUID(), seriesId: crypto.randomUUID(), proposedIds: [crypto.randomUUID()],
      input: { description: "Do not discard this text", count: 1 } };
    const failed = b.applySeriesEvent(seriesState({ attempt, persistence: "saving" }), { type: "save-failed", message: "Retry explicitly" });
    assert.equal(failed.persistence, "unsent");
    assert.deepEqual(failed.attempt, attempt);
    const confirmed = b.applySeriesEvent(failed, { type: "save-confirmed", commandId: attempt.commandId, result: { seriesId: attempt.seriesId, occurrenceIds: attempt.proposedIds } });
    assert.equal(confirmed.persistence, "confirmed");
  });
});

