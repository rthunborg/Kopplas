import assert from "node:assert/strict";
import { test } from "node:test";
import type { Locator } from "@playwright/test";
import { completeWorkOrderSave, workOrderSaveView, type WorkOrderSaveView } from "../../e2e/jobs/work-order-save-completion";
import { createWorkOrderField, editWorkOrderField, receiveWorkOrderField } from "@/features/jobs/work-orders-domain";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
function view(overrides: Partial<WorkOrderSaveView> = {}): WorkOrderSaveView {
  return { requireIdle: async () => {}, requireNoReceipt: async () => {},
    requireNoError: async () => {}, requireReceipt: async () => {}, ...overrides };
}
const reply = () => ({ ok: () => true, finished: async () => null });

test("E01 completion waits for the response body, settled pane and fresh receipt before returning", async () => {
  const body = deferred<null>(), idle = deferred<void>(), receipt = deferred<void>();
  const readingBody = deferred<void>(), settlingPane = deferred<void>(), readingReceipt = deferred<void>();
  const events: string[] = [];
  let idleChecks = 0, completed = false;
  const completion = completeWorkOrderSave(async () => {
    events.push("trigger");
    return { ok: () => true, finished: () => {
      events.push("body"); readingBody.resolve(); return body.promise;
    } };
  }, view({
    requireIdle: async () => {
      events.push("idle");
      if (++idleChecks === 2) { settlingPane.resolve(); await idle.promise; }
    },
    requireNoReceipt: async () => { events.push("no-old-receipt"); },
    requireNoError: async () => { events.push("no-error"); },
    requireReceipt: async () => { events.push("receipt"); readingReceipt.resolve(); await receipt.promise; },
  })).then(() => { completed = true; });
  await readingBody.promise;
  assert.deepEqual(events, ["idle", "no-old-receipt", "trigger", "body"]);
  assert.equal(completed, false);
  body.resolve(null);
  await settlingPane.promise;
  assert.equal(completed, false);
  assert.equal(events.includes("receipt"), false);
  idle.resolve();
  await readingReceipt.promise;
  assert.equal(completed, false);
  receipt.resolve();
  await completion;
  assert.equal(completed, true);
  assert.deepEqual(events, ["idle", "no-old-receipt", "trigger", "body", "idle", "no-error", "receipt", "no-error"]);
});

test("E01 refuses an old receipt before triggering another save", async () => {
  let triggers = 0;
  await assert.rejects(completeWorkOrderSave(async () => { triggers++; return reply(); }, view({
    requireNoReceipt: async () => { throw new Error("old receipt still present"); },
  })), /old receipt/);
  assert.equal(triggers, 0);
});

test("E01 refuses unsuccessful HTTP responses and unfinished transport", async () => {
  let bodyReads = 0, receiptReads = 0;
  const ui = view({ requireReceipt: async () => { receiptReads++; } });
  await assert.rejects(completeWorkOrderSave(async () => ({ ok: () => false,
    finished: async () => { bodyReads++; return null; } }), ui), /unsuccessful HTTP/);
  assert.equal(bodyReads, 0);
  await assert.rejects(completeWorkOrderSave(async () => ({ ok: () => true,
    finished: async () => new Error("connection lost") }), ui), /did not finish/);
  assert.equal(receiptReads, 0);
});

test("E01 HTTP 200 with a settled business error never counts as confirmed success", async () => {
  let receiptReads = 0;
  await assert.rejects(completeWorkOrderSave(async () => reply(), view({
    requireNoError: async () => { throw new Error("PREVIEW_STALE visible alert"); },
    requireReceipt: async () => { receiptReads++; },
  })), /PREVIEW_STALE/);
  assert.equal(receiptReads, 0);
});

test("E01 HTTP 200 and absent error still require a new receipt", async () => {
  await assert.rejects(completeWorkOrderSave(async () => reply(), view({
    requireReceipt: async () => { throw new Error("no confirmed receipt"); },
  })), /no confirmed receipt/);
});

test("actual E01 locator adapter checks idle, absent old receipt, exact visible confirmation and no alert", async () => {
  const calls: unknown[][] = [];
  const detail = { id: "pane", getByTestId: (id: string) => ({ id }) };
  const expect = ((target: { id: string }) => ({
    toHaveAttribute: async (...args: string[]) => { calls.push([target.id, "attribute", ...args]); },
    toHaveCount: async (count: number) => { calls.push([target.id, "count", count]); },
    toBeVisible: async () => { calls.push([target.id, "visible"]); },
    toHaveText: async (text: string) => { calls.push([target.id, "text", text]); },
  })) as unknown as typeof import("@playwright/test").expect;
  const ui = workOrderSaveView(detail as unknown as Locator, expect);
  await ui.requireIdle(); await ui.requireNoReceipt(); await ui.requireNoError(); await ui.requireReceipt();
  assert.deepEqual(calls, [
    ["pane", "attribute", "aria-busy", "false"],
    ["work-order-save-status", "count", 0],
    ["work-order-error", "count", 0],
    ["work-order-save-status", "visible"],
    ["work-order-save-status", "attribute", "role", "status"],
    ["work-order-save-status", "text", "Det skickade försöket är bekräftat sparat."],
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
