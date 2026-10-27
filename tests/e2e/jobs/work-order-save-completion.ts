import type { Locator, Response } from "@playwright/test";

/** Test-only observations; none authorizes a write or replaces persistence checks. */
export type WorkOrderSaveView = {
  requireIdle(): Promise<void>;
  requireNoError(): Promise<void>;
};

export function workOrderSaveView(detail: Locator, expect: typeof import("@playwright/test").expect): WorkOrderSaveView {
  return {
    requireIdle: async () => { await expect(detail).toHaveAttribute("aria-busy", "false"); },
    requireNoError: async () => { await expect(detail.getByTestId("work-order-error")).toHaveCount(0); },
  };
}

/** Only E01's sequential successful saves use this barrier. HTTP 200 is insufficient. */
export async function completeWorkOrderSave(
  trigger: () => Promise<Pick<Response, "ok">>,
  view: WorkOrderSaveView,
  requireFreshProjection: () => Promise<void>,
): Promise<void> {
  await view.requireIdle();
  const response = await trigger();
  if (!response.ok()) throw new Error("Work-order save returned an unsuccessful HTTP response");
  // Each E01 caller first proves its target absent. Cards receive server
  // projections, so the changed card proves more than optimistic field input.
  // Stream EOF and a generic saved receipt are not the completion contract.
  await requireFreshProjection();
  await view.requireIdle();
  await view.requireNoError();
}
