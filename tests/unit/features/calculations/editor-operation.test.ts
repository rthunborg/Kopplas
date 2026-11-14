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

test("P-2 canonical expected facts retain database Date instants instead of empty objects", () => {
  const instant = new Date("2026-11-13T10:00:00Z");
  assert.equal(canonicalEditorJson({ captured_at: instant }), canonicalEditorJson({ captured_at: instant.toISOString() }));
});

const sectionFacts={id,title:"Section",display_mode:"detailed",sort_order:0,archived_at:null};
const rowFacts=Object.fromEntries((await import("@/features/calculations/editor-operation")).ROW_FACTS.map(key=>[key,key==="id"||key==="section_id"?id:null]));
for(const [caller,validate,payload] of callers){
  test(`P-1 ${caller}: complete original expected shape is mandatory and closed`,()=>{
    const header=projectEditorFacts({id,title:"Original",status:"draft"},HEADER_FACTS);
    const expected:Record<string,unknown>={version:1,header};
    if(caller==="createCalculationAction")Object.assign(expected,{form:"calculation",customer_id:id,facility_id:null,contact_id:null});
    else if(caller==="createReviewedQuoteVersionFromCalculationAction")Object.assign(expected,{form:"reviewed-initial-quote",reviewed_snapshot_digest:"a".repeat(64),reviewed_quote_capture_date:"2026-11-13",attachment_file_ids:[]});
    else if(caller==="updateCalculationAction"||caller==="updateTaxInputAction")expected.form=caller==="updateTaxInputAction"?"tax_input":"calculation";
    else if(caller==="archiveCalculationAction")Object.assign(expected,{form:"archive_calculation",sections:[]});
    else if(caller==="reorderSectionsAction"||caller==="reorderRowsAction")Object.assign(expected,{form:caller==="reorderRowsAction"?"reorder_rows":"reorder_sections",siblings:[{id,sort_order:0},{id:other,sort_order:1}]});
    else if(caller.includes("Section")){expected.form=caller.startsWith("archive")?"archive_section":"section";if(!caller.startsWith("create"))expected.section=sectionFacts;if(caller.startsWith("archive"))expected.rows=[];}
    else {Object.assign(expected,{form:caller.startsWith("archive")?"archive_row":"row",section:sectionFacts});if(!caller.startsWith("create"))expected.row=rowFacts;}
    if(caller==="createCalculationAction"||caller==="createReviewedQuoteVersionFromCalculationAction")delete expected.header;
    const input={...payload,operation_id:id,expected};assert.equal(validate(input).ok,true);
    assert.equal(validate({...input,expected:{...expected,extra:true}}).ok,false);
    assert.equal(validate({...input,expected:{version:1,form:expected.form}}).ok,false);
  });
}


test("P-2 section expectations preserve 501-section reorder and uncapped complete archive subtrees", () => {
  const sections = Array.from({length: 1002}, (_, index) => ({ section: {...sectionFacts, id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, sort_order:index}, rows:[] }));
  const header=projectEditorFacts({id,title:"Original",status:"draft"},HEADER_FACTS);
  const siblings=sections.slice(0,501).map(({section})=>({id:section.id,sort_order:section.sort_order}));
  assert.equal(validateReorderSections({calculation_id:id,ordered_section_ids:siblings.map(s=>s.id).reverse(),operation_id:other,expected:{version:1,form:"reorder_sections",header,siblings}}).ok,true);
  assert.equal(validateArchiveCalc({id,operation_id:other,expected:{version:1,form:"archive_calculation",header,sections}}).ok,true);
  assert.equal(validateArchiveCalc({id,operation_id:other,expected:{version:1,form:"archive_calculation",header,sections:[...sections,{...sections[0],rows:Array.from({length:501},()=>rowFacts)}]}}).ok,false);
});

test("P-6 matching reentry fingerprints business values and original facts, never React transport ordering", async () => {
  const {editorRequestFingerprint}=await import("@/features/calculations/editor-operation");
  const original=new FormData();original.append("title","Original input");original.append("operation_id",id);original.append("expected",JSON.stringify({version:1,form:"calculation",header:{id,title:"Original server fact"}}));original.append("$ACTION_ID_first","transport");original.append("selected","a");original.append("selected","b");
  const reordered=new FormData();reordered.append("selected","a");reordered.append("selected","b");reordered.append("expected",JSON.stringify({header:{title:"Original server fact",id},form:"calculation",version:1}));reordered.append("operation_id",id);reordered.append("$ACTION_ID_other","different transport");reordered.append("title","Original input");
  const fingerprint=await editorRequestFingerprint(original);
  assert.equal(await editorRequestFingerprint(reordered),fingerprint);
  for(const [field,value] of [["title","Later input"],["operation_id",other],["expected",JSON.stringify({version:1,form:"calculation",header:{id,title:"Changed server fact"}})]]){const changed=new FormData();for(const [k,v]of original)changed.append(k,v);changed.set(field!,value!);assert.notEqual(await editorRequestFingerprint(changed),fingerprint);}
  const replay={requestFingerprint:fingerprint};
  const retained=retainEditorIntent("actor/tenant/calc/title",[...original],id);
  const saved=editorHandle(retained,replay);
  assert.equal(saved.includes("Original input"),false);assert.equal(saved.includes("Original server fact"),false);
  assert.deepEqual(readEditorHandle(saved,retained.scope)?.replay,replay);
  assert.equal(readEditorHandle(saved,"another/actor"),null);
});
