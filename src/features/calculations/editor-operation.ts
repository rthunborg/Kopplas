/** Feature-local intent contract. Identity is never an authorization capability. */
export const EDITOR_KINDS = [
  "calculation.create", "calculation.update", "calculation.archive",
  "calculation.section.create", "calculation.section.update", "calculation.section.archive",
  "calculation.row.create", "calculation.row.update", "calculation.row.archive",
  "calculation.sections.reorder", "calculation.rows.reorder", "quote.version.create",
] as const;
export type EditorKind = typeof EDITOR_KINDS[number];
export const HEADER_FACTS = ["id", "title", "status", "archived_at", "tax_input_snapshot"] as const;
export const SECTION_FACTS = ["id", "title", "display_mode", "sort_order", "archived_at"] as const;
export const ROW_FACTS = [
  "id", "section_id", "row_type", "quantity", "unit", "unit_cost_ore", "unit_sell_ore",
  "markup_bp", "vat_rate_bp", "included_in_invoice_total", "deduction_classification", "vat_type",
  "is_hidden", "is_optional", "is_selected", "label", "description", "internal_note", "quote_note",
  "sort_order", "source_kind", "source_id", "source_name", "source_price_ore", "source_cost_ore",
  "source_updated_at", "source_captured_at", "source_sku", "source_unit",
] as const;
export type EditorExpected = Readonly<Record<string, unknown>> & { readonly version: 1; readonly form: string };
export interface EditorSafetyInput { readonly operation_id: string; readonly expected: EditorExpected }
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function isEditorUuid(value: unknown): value is string { return typeof value === "string" && uuid.test(value); }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function keys(value: unknown, required: readonly string[]): value is Record<string, unknown> {
  return record(value) && Object.keys(value).length === required.length && required.every(key => Object.hasOwn(value, key));
}
function facts(value: unknown, required: readonly string[]): boolean {
  return keys(value, required) && isEditorUuid(value.id) && required.every(key => value[key] !== undefined);
}
function siblings(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 500 && value.every(item => keys(item, ["id", "sort_order"]) && isEditorUuid(item.id) && Number.isInteger(item.sort_order))
    && new Set(value.map(item => item.id)).size === value.length;
}
function tree(value: unknown): boolean {
  return keys(value, ["section", "rows"]) && facts(value.section, SECTION_FACTS)
    && Array.isArray(value.rows) && value.rows.length <= 500 && value.rows.every(row => facts(row, ROW_FACTS));
}
/** Validate the closed expected-content shape before any command executes. SQL repeats this boundary. */
export function validateEditorSafety(raw: unknown, kind: EditorKind): EditorSafetyInput | null {
  if (!record(raw) || !isEditorUuid(raw.operation_id) || !record(raw.expected)) return null;
  const e = raw.expected;
  if (e.version !== 1 || typeof e.form !== "string") return null;
  let valid = false;
  if (kind === "calculation.create") valid = keys(e, ["version", "form", "customer_id", "facility_id", "contact_id"])
    && e.form === "calculation" && isEditorUuid(e.customer_id) && (e.facility_id === null || isEditorUuid(e.facility_id)) && (e.contact_id === null || isEditorUuid(e.contact_id));
  else if (kind === "quote.version.create") valid = keys(e, ["version", "form", "reviewed_snapshot_digest", "reviewed_quote_capture_date", "attachment_file_ids"])
    && e.form === "reviewed-initial-quote" && e.reviewed_snapshot_digest === raw.reviewed_snapshot_digest
    && e.reviewed_quote_capture_date === raw.reviewed_quote_capture_date && canonicalEditorJson(e.attachment_file_ids) === canonicalEditorJson(raw.attachment_file_ids ?? []);
  else if (!facts(e.header, HEADER_FACTS)) return null;
  else if (kind === "calculation.update") valid = keys(e, ["version", "form", "header"]) && e.form === (raw.tax_input_snapshot === undefined ? "calculation" : "tax_input");
  else if (kind === "calculation.archive") valid = keys(e, ["version", "form", "header", "sections"]) && e.form === "archive_calculation" && Array.isArray(e.sections) && e.sections.length <= 500 && e.sections.every(tree);
  else if (kind === "calculation.section.create") valid = keys(e, ["version", "form", "header"]) && e.form === "section";
  else if (kind === "calculation.section.update") valid = keys(e, ["version", "form", "header", "section"]) && e.form === "section" && facts(e.section, SECTION_FACTS);
  else if (kind === "calculation.section.archive") valid = keys(e, ["version", "form", "header", "section", "rows"]) && e.form === "archive_section" && tree({ section: e.section, rows: e.rows });
  else if (kind === "calculation.row.create") valid = keys(e, ["version", "form", "header", "section"]) && e.form === "row" && facts(e.section, SECTION_FACTS);
  else if (kind === "calculation.row.update" || kind === "calculation.row.archive") valid = keys(e, ["version", "form", "header", "section", "row"])
    && e.form === (kind.endsWith("archive") ? "archive_row" : "row") && facts(e.section, SECTION_FACTS) && facts(e.row, ROW_FACTS);
  else valid = keys(e, ["version", "form", "header", "siblings"]) && e.form === (kind === "calculation.rows.reorder" ? "reorder_rows" : "reorder_sections") && siblings(e.siblings);
  return valid ? { operation_id: raw.operation_id.toLowerCase(), expected: JSON.parse(canonicalEditorJson(e)) as EditorExpected } : null;
}
/** Stable request equality only; the authoritative binding is computed by SQL. */
export function canonicalEditorJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalEditorJson).join(",")}]`;
  if (record(value)) return `{${Object.keys(value).filter(key => value[key] !== undefined).sort().map(key => `${JSON.stringify(key)}:${canonicalEditorJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value ?? null);
}
export function projectEditorFacts(value: object, fields: readonly string[]): Record<string, unknown> {
  const row = value as Record<string, unknown>;
  return Object.fromEntries(fields.map(key => [key, row[key] ?? null]));
}
export interface RetainedEditorIntent {
  readonly operationId: string;
  readonly scope: string;
  readonly originalRequest: string;
  readonly state: "unconfirmed" | "committed" | "closed";
}
export function retainEditorIntent(scope: string, request: unknown, operationId: string): RetainedEditorIntent {
  if (!scope || !isEditorUuid(operationId)) throw new Error("Invalid editor intent");
  return Object.freeze({ scope, operationId, originalRequest: canonicalEditorJson(request), state: "unconfirmed" });
}
export function applyEditorProof(intent: RetainedEditorIntent, proof: { operationId: string; status: string }, currentRequest: unknown): { intent: RetainedEditorIntent; currentDraftSaved: boolean } {
  if (proof.operationId !== intent.operationId || (proof.status !== "committed" && proof.status !== "closed")) return { intent, currentDraftSaved: false };
  return { intent: Object.freeze({ ...intent, state: proof.status }), currentDraftSaved: proof.status === "committed" && intent.originalRequest === canonicalEditorJson(currentRequest) };
}
/** Only opaque scope/identity is durable. Original request and money/text stay in memory. */
export function editorHandle(intent: RetainedEditorIntent): string { return JSON.stringify({ version: 1, scope: intent.scope, operationId: intent.operationId }); }
export function readEditorHandle(value: string, scope: string): { operationId: string; scope: string } | null {
  try { const v: unknown = JSON.parse(value); return keys(v, ["version", "scope", "operationId"]) && v.version === 1 && v.scope === scope && isEditorUuid(v.operationId) ? { operationId: v.operationId, scope } : null; } catch { return null; }
}
