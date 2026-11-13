/** 35.8-P ATDD: mandatory safety inputs on every admitted caller, not optional legacy writes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateCreateCalculation, validateUpdateCalculation, validateArchiveCalc,
  validateCreateSection, validateUpdateSection, validateArchiveSection,
  validateCreateRow, validateUpdateRow, validateArchiveRow,
  validateReorderSections, validateReorderRows,
} from "@/server/commands/calculations/validation";
import { validateCreateReviewedQuoteVersionFromCalculation } from "@/server/commands/quotes/validation";

const id = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const tax = {
  schemaVersion: 2, documentVatType: "STANDARD_VAT_25", buyerVatNumber: null,
  deductionChoice: "NONE", paymentDate: null, finalPaymentDate: null,
  personAllowanceSlots: [], greenBasisMethod: "ACTUAL_ELIGIBLE_COSTS",
  genuineFixedPrice: false, fixedPriceOre: null, fixedPriceCategorySplitOre: null,
  fixedPriceRowIds: null,
};

// These are the thirteen actual action callers / twelve closed kinds from the
// approved matrix. Payloads intentionally omit safety inputs but remain otherwise
// valid: rejection must be caused by the missing operation/expected facts.
const callers: readonly [string, (raw: unknown) => { ok: boolean }, object][] = [
  ["createCalculationAction", validateCreateCalculation, { customer_id: id, title: "Ny kalkyl" }],
  ["updateCalculationAction", validateUpdateCalculation, { id, title: "Ändrad titel" }],
  ["updateTaxInputAction", validateUpdateCalculation, { id, tax_input_snapshot: tax }],
  ["archiveCalculationAction", validateArchiveCalc, { id }],
  ["createSectionAction", validateCreateSection, { calculation_id: id, title: "Sektion" }],
  ["updateSectionAction", validateUpdateSection, { id, title: "Ändrad sektion" }],
  ["archiveSectionAction", validateArchiveSection, { id }],
  ["createRowAction", validateCreateRow, { section_id: id, row_type: "labor", quantity: 1, unit: "h", unit_sell_ore: 10000, vat_rate_bp: 2500 }],
  ["updateRowAction", validateUpdateRow, { id, label: "Ändrad rad" }],
  ["archiveRowAction", validateArchiveRow, { id }],
  ["reorderSectionsAction", validateReorderSections, { calculation_id: id, ordered_section_ids: [id, other] }],
  ["reorderRowsAction", validateReorderRows, { section_id: id, ordered_row_ids: [id, other] }],
  ["createReviewedQuoteVersionFromCalculationAction", validateCreateReviewedQuoteVersionFromCalculation, {
    calculation_id: id, attachment_file_ids: [], reviewed_snapshot_digest: "a".repeat(64), reviewed_quote_capture_date: "2026-11-13",
  }],
];

for (const [caller, validate, payload] of callers) {
  test(`P-1 ${caller}: reject a legacy write with no retained operation or original expected facts`, () => {
    assert.equal(validate(payload).ok, false, `${caller} must fail closed before any database write`);
  });
}

test("P-1 invalid row money remains rejected (existing rule, no replacement arithmetic)", () => {
  assert.equal(validateCreateRow({ section_id: id, row_type: "labor", quantity: 1, unit: "h", unit_sell_ore: -1, vat_rate_bp: 2500 }).ok, false);
});
test("P-4 reviewed digest/date remain mandatory for initial quote creation", () => {
  assert.equal(validateCreateReviewedQuoteVersionFromCalculation({ calculation_id: id, attachment_file_ids: [] }).ok, false);
});

import {
  retainEditorIntent, applyEditorProof, editorHandle, readEditorHandle,
  validateEditorSafety, canonicalEditorJson, projectEditorFacts, HEADER_FACTS,
} from "@/features/calculations/editor-operation";

test("P-6 unknown/absent/prepared preserves original immutable request and scoped handle across remount; no automatic replay", () => {
  const request = { title: "Original", expected: { status: "draft" } };
  const retained = retainEditorIntent("user/tenant/calc/title", request, id);
  request.title = "Unsent later draft";
  assert.match(retained.originalRequest, /Original/);
  for (const status of ["unconfirmed", "prepared", "absent"]) {
    const applied = applyEditorProof(retained, { operationId: id, status }, request);
    assert.equal(applied.intent, retained);
    assert.equal(applied.currentDraftSaved, false);
  }
  const handle = editorHandle(retained);
  assert.deepEqual(readEditorHandle(handle, retained.scope), { operationId: id, scope: retained.scope });
  assert.equal(readEditorHandle(handle, "other/user/form"), null);
  assert.equal(handle.includes("Original"), false);
  assert.equal(handle.includes("title"), true); // opaque form scope, never submitted text
  assert.equal(Object.isFrozen(retained), true);
});
test("E35-8-T-late-result / E35-8-T-confirmed: operation A proof cannot mark later draft B or a neighboring form saved", () => {
  const a = retainEditorIntent("a", { title: "A" }, id);
  const b = retainEditorIntent("b", { title: "B" }, other);
  assert.equal(applyEditorProof(b, { operationId: id, status: "committed" }, { title: "B" }).currentDraftSaved, false);
  assert.equal(applyEditorProof(a, { operationId: id, status: "committed" }, { title: "later" }).currentDraftSaved, false);
  assert.equal(applyEditorProof(a, { operationId: id, status: "committed" }, { title: "A" }).currentDraftSaved, true);
  assert.equal(applyEditorProof(a, { operationId: id, status: "closed" }, { title: "A" }).currentDraftSaved, false);
});
test("P-1/P-2 version-1 per-kind normalization rejects extra/missing expected keys and preserves original complete projection", () => {
  const header = projectEditorFacts({ id, title: "original", status: "draft" }, HEADER_FACTS);
  const original = { operation_id: id, id, title: "changed", expected: { version: 1, form: "calculation", header } };
  assert.equal(validateUpdateCalculation(original).ok, true);
  assert.equal(validateEditorSafety({ ...original, expected: { ...original.expected, extra: true } }, "calculation.update"), null);
  assert.equal(validateEditorSafety({ ...original, expected: { ...original.expected, header: { id } } }, "calculation.update"), null);
  const safe = validateEditorSafety(original, "calculation.update")!;
  header.title = "later";
  assert.equal((safe.expected.header as { title: string }).title, "original");
  assert.equal(canonicalEditorJson({ a: 1, b: null }), canonicalEditorJson({ b: null, a: 1 }));
});
