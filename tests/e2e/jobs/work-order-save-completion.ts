import type { Locator, Response } from "@playwright/test";

/** Test-only observations; none authorizes a write or replaces persistence checks. */
export type WorkOrderSaveView = {
  requireIdle(): Promise<void>;
  requireNoReceipt(): Promise<void>;
  requireNoError(): Promise<void>;
  requireReceipt(): Promise<void>;
};

export function workOrderSaveView(detail: Locator, expect: typeof import("@playwright/test").expect): WorkOrderSaveView {
  const receipt = detail.getByTestId("work-order-save-status");
  return {
    requireIdle: async () => { await expect(detail).toHaveAttribute("aria-busy", "false"); },
    requireNoReceipt: async () => { await expect(receipt).toHaveCount(0); },
    requireNoError: async () => { await expect(detail.getByTestId("work-order-error")).toHaveCount(0); },
    requireReceipt: async () => {
      await expect(receipt).toBeVisible();
      await expect(receipt).toHaveAttribute("role", "status");
      await expect(receipt).toHaveText("Det skickade försöket är bekräftat sparat.");
    },
  };
}

/** Only E01's sequential successful saves use this barrier. HTTP 200 is insufficient. */
export async function completeWorkOrderSave(
  trigger: () => Promise<Pick<Response, "ok" | "finished">>,
  view: WorkOrderSaveView,
): Promise<void> {
  await view.requireIdle();
  // E01 edits clear lane.saved. Reject an old receipt before the next trigger.
  await view.requireNoReceipt();
  const response = await trigger();
  if (!response.ok()) throw new Error("Work-order save returned an unsuccessful HTTP response");
  const failure = await response.finished();
  if (failure !== null) throw new Error("Work-order save response did not finish", { cause: failure });
  await view.requireIdle();
  await view.requireNoError();
  await view.requireReceipt();
  await view.requireNoError();
}
