/** Calculation editor writes use one checked SQL transaction for facts, effect and durable proof.
 * Existing domain validators remain the early typed boundary; SQL repeats it for direct RPC callers.
 * No generic envelope audit: only header lifecycle is audited, atomically inside SQL.
 */
import { defineCommand } from "../envelope";
import { mutateEditor } from "./editor-operation-db";
import type { CalcCommandResult } from "./calculations";
import { validateReorderSections, validateReorderRows, type ReorderSectionsInput, type ReorderRowsInput } from "./validation";

export const reorderSections = defineCommand<ReorderSectionsInput, CalcCommandResult>({
  command: "calculation.sections.reorder",
  auditable: false,
  eventType: "calculation.sections.reorder.changed",
  targetType: "calculation",
  validateInput: validateReorderSections,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.sections.reorder"),
});

export const reorderRows = defineCommand<ReorderRowsInput, CalcCommandResult>({
  command: "calculation.rows.reorder",
  auditable: false,
  eventType: "calculation.rows.reorder.changed",
  targetType: "calculation",
  validateInput: validateReorderRows,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.rows.reorder"),
});
