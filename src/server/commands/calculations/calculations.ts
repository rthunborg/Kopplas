/** Calculation editor writes use one checked SQL transaction for facts, effect and durable proof.
 * Existing domain validators remain the early typed boundary; SQL repeats it for direct RPC callers.
 * No generic envelope audit: only header lifecycle is audited, atomically inside SQL.
 */
import { defineCommand } from "../envelope";
import { mutateEditor } from "./editor-operation-db";
export interface CalcCommandResult { readonly targetId: string; readonly operationId: string; readonly targetAvailable: boolean }
import { validateCreateCalculation, validateUpdateCalculation, validateArchiveCalc, type CreateCalculationInput, type UpdateCalculationInput, type ArchiveCalcInput } from "./validation";

export const createCalculation = defineCommand<CreateCalculationInput, CalcCommandResult>({
  command: "calculation.create",
  auditable: false,
  eventType: "calculation.create.changed",
  targetType: "calculation",
  validateInput: validateCreateCalculation,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.create"),
});

export const updateCalculation = defineCommand<UpdateCalculationInput, CalcCommandResult>({
  command: "calculation.update",
  auditable: false,
  eventType: "calculation.update.changed",
  targetType: "calculation",
  validateInput: validateUpdateCalculation,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.update"),
});

export const archiveCalculation = defineCommand<ArchiveCalcInput, CalcCommandResult>({
  command: "calculation.archive",
  auditable: false,
  eventType: "calculation.archive.changed",
  targetType: "calculation",
  validateInput: validateArchiveCalc,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.archive"),
});
