import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandError } from "@/server/commands/command-errors";
import { createRow } from "@/server/commands/calculations/rows";

test("createRow maps the atomic SQL row-limit refusal without a direct insert bypass", async () => {
  const operation = "55555555-5555-4555-8555-555555555555";
  let calls = 0;
  const db = {
    from() { throw new Error("direct DML must not be reached"); },
    async rpc(name: string, args: Record<string, unknown>) {
      calls++;
      assert.equal(name, "mutate_calculation_editor");
      assert.equal(args.p_operation_id, operation);
      assert.equal(args.p_kind, "calculation.row.create");
      return { data: null, error: { code: "23514", message: "calculation row limit" } };
    },
  };
  await assert.rejects(async () => createRow.config.execute({
    db, input: { section_id: "11111111-1111-4111-8111-111111111111", operation_id: operation, expected: {} },
    tenantContext: { userId: "33333333-3333-4333-8333-333333333333", tenantId: "44444444-4444-4444-8444-444444444444", role: "tenant_admin", status: "active" },
    clock: { now: () => new Date("2026-08-07T12:00:00.000Z") }, correlationId: operation,
  } as never), (error: unknown) => error instanceof CommandError && error.code === "VALIDATION_FAILED");
  assert.equal(calls, 1);
});
