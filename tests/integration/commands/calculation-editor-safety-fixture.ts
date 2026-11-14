/** Test-owned intent capture. It never changes production validation or shared seed factories. */
import { runCommand, type Command, type RunCommandOptions } from "@/server/commands/envelope";
import { EDITOR_KINDS, HEADER_FACTS, SECTION_FACTS, ROW_FACTS, projectEditorFacts, type EditorKind } from "@/features/calculations/editor-operation";
import { adminQuery } from "../../factories/admin-sql";
const uuid = /^[a-f0-9-]{36}$/i;
async function row(table: string, id: unknown): Promise<Record<string, unknown> | null> {
  if (typeof id !== "string" || !uuid.test(id)) return null;
  // Table names come exclusively from the fixed branches below.
  return (await adminQuery<Record<string, unknown>>(`select * from public.${table} where id=$1`, [id]))[0] ?? null;
}
async function children(table: string, parent: string, id: unknown) {
  if (typeof id !== "string" || !uuid.test(id)) return [];
  return adminQuery<Record<string, unknown>>(`select * from public.${table} where ${parent}=$1 and archived_at is null order by id`, [id]);
}
export async function captureEditorTestIntent(kind: EditorKind, input: Record<string, unknown>, operationId = crypto.randomUUID()) {
  if (kind === "quote.version.create") return { operation_id: operationId, expected: { version: 1, form: "reviewed-initial-quote", reviewed_snapshot_digest: input.reviewed_snapshot_digest, reviewed_quote_capture_date: input.reviewed_quote_capture_date, attachment_file_ids: input.attachment_file_ids ?? [] } };
  if (kind === "calculation.create") return { operation_id: operationId, expected: { version: 1, form: "calculation", customer_id: input.customer_id, facility_id: input.facility_id ?? null, contact_id: input.contact_id ?? null } };
  const targetRow = kind.startsWith("calculation.row.") && kind !== "calculation.row.create" ? await row("calculation_rows", input.id) : null;
  const section = kind.startsWith("calculation.section.") && kind !== "calculation.section.create"
    ? await row("calculation_sections", input.id)
    : kind.startsWith("calculation.row") ? await row("calculation_sections", targetRow?.section_id ?? input.section_id) : null;
  const calculation = await row("calculations", section?.calculation_id ?? input.calculation_id ?? input.id);
  // Nonexistent/foreign/invalid target negative tests retain a syntactically complete
  // intent so the actual command authorization/ownership boundary remains exercised.
  const fallback = { id: "00000000-0000-4000-8000-000000000001", title: "Missing", status: "draft", archived_at: null, tax_input_snapshot: null };
  const header = projectEditorFacts(calculation ?? fallback, HEADER_FACTS);
  const expected: Record<string, unknown> = { version: 1, header };
  if (kind === "calculation.update") expected.form = input.tax_input_snapshot === undefined ? "calculation" : "tax_input";
  else if (kind === "calculation.archive") {
    expected.form = "archive_calculation";
    expected.sections = await Promise.all((await children("calculation_sections", "calculation_id", input.id)).map(async s => ({ section: projectEditorFacts(s, SECTION_FACTS), rows: (await children("calculation_rows", "section_id", s.id)).map(r => projectEditorFacts(r, ROW_FACTS)) })));
  } else if (kind.endsWith(".reorder")) {
    expected.form = kind === "calculation.rows.reorder" ? "reorder_rows" : "reorder_sections";
    const rows = kind === "calculation.rows.reorder" ? await children("calculation_rows", "section_id", input.section_id) : await children("calculation_sections", "calculation_id", input.calculation_id);
    expected.siblings = rows.map(r => ({ id: r.id, sort_order: r.sort_order }));
  } else {
    expected.form = kind.includes(".section.") ? (kind.endsWith("archive") ? "archive_section" : "section") : (kind.endsWith("archive") ? "archive_row" : "row");
    if (kind !== "calculation.section.create") expected.section = projectEditorFacts(section ?? fallback, SECTION_FACTS);
    if (kind === "calculation.section.archive") expected.rows = (await children("calculation_rows", "section_id", input.id)).map(r => projectEditorFacts(r, ROW_FACTS));
    if (targetRow || (kind.includes(".row.") && kind !== "calculation.row.create")) expected.row = projectEditorFacts(targetRow ?? { ...fallback, section_id: fallback.id }, ROW_FACTS);
  }
  return { operation_id: operationId, expected };
}
/** Existing domain suites now submit mandatory original facts, without deleting their assertions. */
export async function runEditorCommand<I, R>(command: Command<I, R>, options: RunCommandOptions) {
  const kind = command.config.command;
  if (!(EDITOR_KINDS as readonly string[]).includes(kind) || !options.input || typeof options.input !== "object") return runCommand(command, options);
  const input = options.input as Record<string, unknown>;
  const safety = input.operation_id ? input : await captureEditorTestIntent(kind as EditorKind, input, options.correlationId ?? crypto.randomUUID());
  return runCommand(command, { ...options, input: { ...input, ...safety }, correlationId: String(safety.operation_id) });
}
