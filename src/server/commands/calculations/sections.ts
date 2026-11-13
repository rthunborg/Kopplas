/** Calculation editor writes use one checked SQL transaction for facts, effect and durable proof.
 * Existing domain validators remain the early typed boundary; SQL repeats it for direct RPC callers.
 * No generic envelope audit: only header lifecycle is audited, atomically inside SQL.
 */
import { defineCommand } from "../envelope";
import { mutateEditor } from "./editor-operation-db";
import type { CalcCommandResult } from "./calculations";
import { validateCreateSection, validateUpdateSection, validateArchiveSection, type CreateSectionInput, type UpdateSectionInput, type ArchiveCalcInput } from "./validation";

export const createSection = defineCommand<CreateSectionInput, CalcCommandResult>({
  command: "calculation.section.create",
  auditable: false,
  eventType: "calculation.section.create.changed",
  targetType: "calculation",
  validateInput: validateCreateSection,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.section.create"),
});

export const updateSection = defineCommand<UpdateSectionInput, CalcCommandResult>({
  command: "calculation.section.update",
  auditable: false,
  eventType: "calculation.section.update.changed",
  targetType: "calculation",
  validateInput: validateUpdateSection,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.section.update"),
});

export const archiveSection = defineCommand<ArchiveCalcInput, CalcCommandResult>({
  command: "calculation.section.archive",
  auditable: false,
  eventType: "calculation.section.archive.changed",
  targetType: "calculation",
  validateInput: validateArchiveSection,
  // SQL checks current authority before proof lookup, including historical targets.
  execute: ctx => mutateEditor(ctx, "calculation.section.archive"),
});
