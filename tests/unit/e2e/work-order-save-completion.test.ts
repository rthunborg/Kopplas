import assert from "node:assert/strict";
import { test } from "node:test";
import type { Locator } from "@playwright/test";
import { completeWorkOrderSave, workOrderSaveView, type WorkOrderSaveView } from "../../e2e/jobs/work-order-save-completion";
import { createWorkOrderField, editWorkOrderField, receiveWorkOrderField } from "@/features/jobs/work-orders-domain";
import { readJobWorkOrders } from "@/server/read-models/job-work-orders";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
function view(overrides: Partial<WorkOrderSaveView> = {}): WorkOrderSaveView {
  return { requireIdle: async () => {}, requireNoError: async () => {}, ...overrides };
}
const reply = () => ({ ok: () => true });
const rawProjection = (title: string) => ({
  expectedState: "a".repeat(64), canEditWorkOrders: true, canReopenWorkOrders: false, canEditJobDependencies: false,
  rows: [{ id: "order", jobId: "job", title, description: null, status: "created",
    plannedStartDate: null, plannedEndDate: null, assignees: [{ id: "person", label: "Montör" }] }],
  eligiblePeople: [], prerequisiteOptions: [], dependencies: [], dependencyWarnings: [],
});

test("E01 waits for fresh projection and settled pane without waiting for unfinished stream EOF", async () => {
  const projected = deferred<void>(), idle = deferred<void>();
  const readingProjection = deferred<void>(), settlingPane = deferred<void>();
  const unfinishedStream = deferred<null>();
  const events: string[] = [];
  let idleChecks = 0, completed = false, finishedCalls = 0;
  const completion = completeWorkOrderSave(async () => {
    events.push("trigger");
    return { ok: () => true, finished: () => { finishedCalls++; return unfinishedStream.promise; } };
  }, view({
    requireIdle: async () => {
      events.push("idle");
      if (++idleChecks === 2) { settlingPane.resolve(); await idle.promise; }
    },
    requireNoError: async () => { events.push("no-error"); },
  }), async () => {
    events.push("projection"); readingProjection.resolve(); await projected.promise;
  }).then(() => { completed = true; });
  await readingProjection.promise;
  assert.deepEqual(events, ["idle", "trigger", "projection"]);
  assert.equal(completed, false);
  projected.resolve();
  await settlingPane.promise;
  assert.equal(completed, false);
  idle.resolve();
  await completion;
  assert.equal(completed, true);
  assert.equal(finishedCalls, 0);
  assert.deepEqual(events, ["idle", "trigger", "projection", "idle", "no-error"]);
});

test("E01 refuses unsuccessful HTTP before observing a success projection", async () => {
  let projections = 0;
  await assert.rejects(completeWorkOrderSave(async () => ({ ok: () => false }), view(), async () => {
    projections++;
  }), /unsuccessful HTTP/);
  assert.equal(projections, 0);
});

test("E01 HTTP 200 with unchanged real read-model projection cannot confirm success", async () => {
  const client = { rpc: async () => ({ data: rawProjection("Original title"), error: null }) };
  await assert.rejects(completeWorkOrderSave(async () => reply(), view(), async () => {
    const actual = await readJobWorkOrders(client, "job");
    assert.equal(actual.rows[0].title, "Updated title", "false 200 left the server projection unchanged");
  }), /false 200/);
});

test("E01 accepts a changed real read-model projection without a generic receipt or response EOF", async () => {
  const client = { rpc: async () => ({ data: rawProjection("Updated title"), error: null }) };
  let observed = false;
  await completeWorkOrderSave(async () => ({ ok: () => true,
    finished: async () => { throw new Error("EOF must not be called"); } }), view(), async () => {
    const actual = await readJobWorkOrders(client, "job");
    assert.equal(actual.rows[0].title, "Updated title");
    assert.deepEqual(actual.rows[0].assignees, [{ id: "person", label: "Montör" }]);
    observed = true;
  });
  assert.equal(observed, true);
});

test("E01 rejects a visible business error after the projection and pane settle", async () => {
  let projected = false;
  await assert.rejects(completeWorkOrderSave(async () => reply(), view({
    requireNoError: async () => { assert.equal(projected, true); throw new Error("PREVIEW_STALE visible alert"); },
  }), async () => { projected = true; }), /PREVIEW_STALE/);
});

test("actual E01 locator adapter checks settled pane and no work-order alert", async () => {
  const calls: unknown[][] = [];
  const detail = { id: "pane", getByTestId: (id: string) => ({ id }) };
  const expect = ((target: { id: string }) => ({
    toHaveAttribute: async (...args: string[]) => { calls.push([target.id, "attribute", ...args]); },
    toHaveCount: async (count: number) => { calls.push([target.id, "count", count]); },
  })) as unknown as typeof import("@playwright/test").expect;
  const ui = workOrderSaveView(detail as unknown as Locator, expect);
  await ui.requireIdle(); await ui.requireNoError();
  assert.deepEqual(calls, [
    ["pane", "attribute", "aria-busy", "false"],
    ["work-order-error", "count", 0],
  ]);
});

test("real field reconciliation demonstrates the possible old-token ordering without claiming the CI cause", () => {
  const original = { title: "Montera central", end: "2026-10-21" };
  const edited = { title: "Montera och prova central", end: "" };
  const beforeAssignment = createWorkOrderField(original, "before-assignment");
  const earlyEdit = editWorkOrderField(beforeAssignment, edited);
  const lateProjection = receiveWorkOrderField(earlyEdit, original, "after-assignment");
  assert.deepEqual(lateProjection.value, edited);
  assert.equal(lateProjection.expectedState, "before-assignment");
  // Waiting for the assignment projection while details are pristine advances
  // their baseline before editing. SQL still decides whether that token is current.
  const confirmedProjection = receiveWorkOrderField(beforeAssignment, original, "after-assignment");
  const editAfterCompletion = editWorkOrderField(confirmedProjection, edited);
  assert.deepEqual(editAfterCompletion.value, edited);
  assert.equal(editAfterCompletion.expectedState, "after-assignment");
});
