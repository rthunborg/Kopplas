import {test} from "node:test";
import assert from "node:assert/strict";
import {resolveWorkOrderCreateSelection, selectWorkOrderDependencyWarnings} from "@/features/jobs/work-orders-domain";

test("16.3-P8 a create result can adopt only its originating still-open empty pane generation", () => {
  const creatingA = {id: null, key: "draft-A"};
  const samePane = resolveWorkOrderCreateSelection(creatingA, "draft-A", "created-A");
  assert.deepEqual(samePane, {selection: {id: "created-A", key: "draft-A"}, adopted: true});
  // Completion refreshes data elsewhere, but cannot reopen a closed pane, select
  // the created row over B, or attach A's identity to a newer unsent draft.
  for (const current of [null, {id: "existing-B", key: "pane-B"}, {id: null, key: "draft-B"},
    {id: "existing-B", key: "draft-A"}]) {
    const result = resolveWorkOrderCreateSelection(current, "draft-A", "created-A");
    assert.equal(result.adopted, false);
    assert.equal(result.selection, current);
  }
  // Repeated/older completions cannot replace a child already adopted by the pane.
  assert.equal(resolveWorkOrderCreateSelection(samePane.selection, "draft-A", "other-created").adopted, false);
});

test("16.3-P4 unknown warnings retain only the readable dependent identity and never pollute siblings or parent", () => {
  const a = {jobId: "job", workOrderId: "A"}, b = {jobId: "job", workOrderId: "B"};
  const parent = {jobId: "job", workOrderId: null};
  const hiddenA = {state: "unknown", dependent: a};
  const hiddenParent = {state: "unknown", dependent: parent};
  const bDelay = {state: "delay", dependent: b, prerequisite: {jobId: "other", workOrderId: "readable"}};
  const unscoped = {state: "unknown"};
  const foreign = {state: "unknown", dependent: {jobId: "other-job", workOrderId: "A"}};
  const warnings = [hiddenA, hiddenParent, bDelay, unscoped, foreign];
  assert.deepEqual(selectWorkOrderDependencyWarnings(warnings, a), [hiddenA]);
  assert.deepEqual(selectWorkOrderDependencyWarnings(warnings, b), [bDelay]);
  assert.deepEqual(selectWorkOrderDependencyWarnings(warnings, parent), [hiddenParent]);
  assert.equal(Object.hasOwn(selectWorkOrderDependencyWarnings(warnings, a)[0], "prerequisite"), false);
});

test("16.3 abandoned pane receipts cannot replace newer projection or unmount its draft", async () => {
  const api = await import("@/features/jobs/work-orders-domain") as unknown as {
    canReceiveWorkOrderPaneProjection: (selection: {id: string | null; key: string} | null, originKey?: string) => boolean;
  };
  const paneB = {id: "B", key: "pane-B"};
  const current = {selection: paneB, projection: {rows: [{id: "B", title: "Current B"}]}, draft: {title: "Newer B draft"}};
  const stale = {rows: [{id: "A", title: "Older A snapshot"}]};
  const consume = (origin: string) => api.canReceiveWorkOrderPaneProjection(current.selection, origin) ? {...current, projection: stale} : current;
  assert.equal(consume("pane-A"),current);
  assert.equal(consume("pane-A").projection.rows.some(row => row.id === "B"),true);
  assert.equal(consume("pane-A").draft,current.draft);
  assert.equal(api.canReceiveWorkOrderPaneProjection(null,"pane-A"),false);
  assert.equal(api.canReceiveWorkOrderPaneProjection({id:null,key:"new-draft"},"pane-A"),false);
  assert.equal(api.canReceiveWorkOrderPaneProjection(paneB,"pane-B"),true);
});

test("16.3 only proven first-attempt absence permits stale-create refresh and explicit fresh consent", async () => {
  const api = await import("@/features/jobs/work-orders-domain") as unknown as {
    workOrderCreateRecovery: (code: string, unresolved: boolean) => "stale" | "uncertain" | null;
  };
  assert.equal(api.workOrderCreateRecovery("COMMAND_CONFLICT",false),"stale");
  for (const code of ["COMMAND_CONFLICT","PREVIEW_STALE","SERVER_ERROR","TENANT_ACCESS_DENIED"]) assert.equal(api.workOrderCreateRecovery(code,true),"uncertain");
  assert.equal(api.workOrderCreateRecovery("PREVIEW_STALE",false),"uncertain");
  assert.equal(api.workOrderCreateRecovery("SERVER_ERROR",false),"uncertain");
  assert.equal(api.workOrderCreateRecovery("VALIDATION_FAILED",false),null);
});
