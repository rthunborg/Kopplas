import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingEditorSqlEntry, type SqlCatalogEntry } from "../../support/booking-editor-atdd";

test("SQL inventory retains zero-argument trigger identity and ordinary RPC overloads", () => {
  const catalog: SqlCatalogEntry[] = [
    { signature: "booking_occurrence_exception_internal()", name: "booking_occurrence_exception_internal", names: null, inputArgumentCount: 0, returnsTrigger: true },
    { signature: "booking_zero_arg_internal()", name: "booking_zero_arg_internal", names: null, inputArgumentCount: 0, returnsTrigger: false },
    { signature: "booking_helper_internal(uuid)", name: "booking_helper_internal", names: ["p_tenant"], inputArgumentCount: 1, returnsTrigger: false },
    { signature: "booking_helper_internal(uuid,jsonb)", name: "booking_helper_internal", names: ["p_tenant", "p_payload"], inputArgumentCount: 2, returnsTrigger: false },
    { signature: "finalize_booking_editor(uuid,jsonb)", name: "finalize_booking_editor", names: ["p_tenant", "p_review"], inputArgumentCount: 2, returnsTrigger: false },
  ];
  const entries = catalog.map((entry) => bookingEditorSqlEntry(entry, { p_tenant: "tenant", p_payload: { status: "planned" } }));

  // The full identity set remains available to ACL queries, with no trigger or
  // overload removed by name or by its absent argument-name array.
  assert.deepEqual(entries.map((entry) => entry.signature), [
    "public.booking_occurrence_exception_internal()", "public.booking_zero_arg_internal()",
    "public.booking_helper_internal(uuid)", "public.booking_helper_internal(uuid,jsonb)",
    "public.finalize_booking_editor(uuid,jsonb)",
  ]);
  assert.deepEqual(entries.map((entry) => entry.rpcCallable), [false, true, true, true, true]);
  assert.deepEqual(entries.map((entry) => entry.args), [
    {}, {}, { p_tenant: "tenant" }, { p_tenant: "tenant", p_payload: { status: "planned" } },
    { p_tenant: "tenant", p_review: null },
  ]);
});

test("SQL inventory fails loudly for unnamed nonzero input arguments instead of probing a false zero-argument overload", () => {
  for (const names of [null, [""]]) {
    assert.throws(() => bookingEditorSqlEntry({
      signature: "booking_helper_internal(uuid)", name: "booking_helper_internal",
      names, inputArgumentCount: 1, returnsTrigger: false,
    }, {}), /unnamed input arguments: public\.booking_helper_internal\(uuid\)/);
  }
});
