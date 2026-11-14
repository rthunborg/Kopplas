/** Calculation editor writes use one checked SQL transaction for facts, effect and durable proof.
 * Existing domain validators remain the early typed boundary; SQL repeats it for direct RPC callers.
 * No generic envelope audit: only header lifecycle is audited, atomically inside SQL.
 */
import { defineCommand } from "../envelope";
import { mutateEditor } from "./editor-operation-db";
import type { CalcCommandResult } from "./calculations";
import { validateCreateRow, validateUpdateRow, validateArchiveRow, type CreateRowInput, type UpdateRowInput, type ArchiveCalcInput } from "./validation";

export const createRow = defineCommand<CreateRowInput, CalcCommandResult>({
  command: "calculation.row.create",
  auditable: false,
  eventType: "calculation.row.create.changed",
  targetType: "calculation",
  validateInput: validateCreateRow,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.row.create"),
});

export const updateRow = defineCommand<UpdateRowInput, CalcCommandResult>({
  command: "calculation.row.update",
  auditable: false,
  eventType: "calculation.row.update.changed",
  targetType: "calculation",
  validateInput: validateUpdateRow,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.row.update"),
});

export const archiveRow = defineCommand<ArchiveCalcInput, CalcCommandResult>({
  command: "calculation.row.archive",
  auditable: false,
  eventType: "calculation.row.archive.changed",
  targetType: "calculation",
  validateInput: validateArchiveRow,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.row.archive"),
});
