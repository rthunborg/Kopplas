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

// API spelling of the new feature-local helper is deliberately left to the build
// delegate. These are material uncovered pure-state checks, never passing coverage.
test.todo("P-6 unknown/absent/prepared preserves original immutable request and scoped handle across remount; no automatic replay");
test.todo("E35-8-T-late-result / E35-8-T-confirmed: operation A proof cannot mark later draft B or a neighboring form saved");
test.todo("P-1/P-2 version-1 per-kind normalization rejects extra/missing expected keys and preserves original complete projection");
