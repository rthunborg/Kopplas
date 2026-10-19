/** Unit query-port regression only; actual DB/RLS and browser evidence are separate. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as permissions from "@/server/authz/permission-matrix";
import * as times from "@/features/scheduling/time-zone";
import type { BookingHostReadResult } from "@/features/resources/booking-action-state";

type Row = Record<string, unknown>;
const TENANT = "15020000-0000-4000-8000-000000000001";
const SERIES = "15020000-0000-4000-8000-000000000002";
const PERSON = "15020000-0000-4000-8000-000000000003";
function booking(id: string, metadata: Row): Row {
  return { id, tenant_id: TENANT, starts_at: "2026-11-02T08:00:00.000000Z", ends_at: "2026-11-02T09:00:00.000000Z",
    all_day: false, work_role_id: null, job_id: null, customer_id: null, facility_id: null, contact_id: null,
    description: "Owned booking", status: "planned", booking_assignees: [{ person_profile_id: PERSON }],
    create_payload_digest: "private-command-digest", update_outcomes: { secret: "private-outcome" }, ...metadata };
}
function bindRead(rows: Row[]) {
  const client = { from(table: string) {
    if (!["bookings", "booking_conflicts"].includes(table)) throw new Error("Unexpected read table");
    const filters: [string, unknown][] = []; let columns = "";
    const query = {
      select(value: string) { columns = value; return query; },
      eq(column: string, value: unknown) { filters.push([column, value]); return query; },
      is(column: string, value: unknown) { filters.push([column, value]); return query; },
      order() { return query; },
      async range(from: number, to: number) {
        const visible = table === "bookings" ? rows.filter(row => filters.every(([key, value]) => row[key] === value)) : [];
        // Behave like PostgREST: an unselected stored field never reaches mapping.
        const selected = visible.slice(from, to + 1).map(row => Object.fromEntries(columns.split(",").flatMap(token => {
          const key = token.split("(", 1)[0]!;
          return key in row ? [[key, row[key]]] : [];
        })));
        return { data: selected, error: null };
      },
    };
    return query;
  } };
  const require = createRequire(import.meta.url);
  const modules: Record<string, unknown> = {
    "@/server/db/supabase-server-client": { createSupabaseServerClient: async () => client },
    "@/server/auth/resolve-tenant-context": { resolveTenantContext: async () => ({ ok: true,
      data: { tenantId: TENANT, userId: PERSON, role: "tenant_admin", roles: ["tenant_admin"], status: "active" } }) },
    "@/server/authz/permission-matrix": permissions,
    "@/features/scheduling/time-zone": times,
  };
  const source = readFileSync("src/features/resources/bookings-read.ts", "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports,
    require: (name: string) => modules[name] ?? require(name) });
  return (compiledModule.exports as { readBookingHost: () => Promise<BookingHostReadResult> }).readBookingHost;
}

test("15.2 public host read retains stored exception, tombstone and standalone metadata through its actual SELECT", async () => {
  const exception = booking("exception", { series_id: SERIES, occurrence_index: 2, is_exception: true, nominal_date: "2026-11-02" });
  const tombstone = booking("tombstone", { series_id: SERIES, occurrence_index: 3, is_exception: true, nominal_date: "2026-11-03", status: "cancelled" });
  const standalone = booking("standalone", { series_id: null, occurrence_index: null, is_exception: false, nominal_date: null });
  const foreign = booking("foreign", { ...exception, id: "foreign", tenant_id: "other-tenant" });
  const result = await bindRead([exception, tombstone, standalone, foreign])();
  assert.equal(result.error, null); assert.equal(result.canView, true); assert.equal(result.canManage, true);
  assert.equal(result.bookings.length, 3);
  const byId = new Map(result.bookings.map(row => [row.id, row]));
  assert.equal(byId.get("exception")?.seriesId, SERIES);
  assert.equal(byId.get("exception")?.occurrenceIndex, 2);
  assert.equal(byId.get("exception")?.isException, true);
  assert.equal(byId.get("exception")?.nominalDate, "2026-11-02");
  assert.equal(byId.get("tombstone")?.seriesId, SERIES);
  assert.equal(byId.get("tombstone")?.occurrenceIndex, 3);
  assert.equal(byId.get("tombstone")?.isException, true);
  assert.equal(byId.get("tombstone")?.nominalDate, "2026-11-03");
  assert.equal(byId.get("tombstone")?.status, "cancelled");
  assert.equal(byId.get("standalone")?.seriesId, null);
  assert.equal(byId.get("standalone")?.occurrenceIndex, null);
  assert.equal(byId.get("standalone")?.isException, false);
  assert.equal(byId.get("standalone")?.nominalDate, null);
  assert.ok(!byId.has("foreign"));
  assert.doesNotMatch(JSON.stringify(result), /private-command-digest|private-outcome|create_payload_digest|update_outcomes|tenant_id/);
});
