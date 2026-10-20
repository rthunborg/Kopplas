import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import type { readJobDetail as ProductionReadJobDetail, JobReadClient } from "@/features/jobs/read";
import type { SafeJobEvent } from "../../../support/job-workspace-atdd";

const jobId = "10000000-0000-4000-8000-000000000001";
const eventId = "20000000-0000-4000-8000-000000000001";
const occurredAt = "2026-10-20T09:30:00.000Z";

test.skip("[P0] [16.5-RED-EVENTS] current production presentation exposes only safe event keys", async () => {
  const calls: { table: string; column: string; value: string }[] = [];
  const privateValue = "\u0000synthetic-private-do-not-print\u0001";
  const client: JobReadClient = { from(table) {
    assert.ok(["jobs", "file_links", "job_events"].includes(table), "unexpected table");
    return { select() { return { eq(column, value) {
      calls.push({ table, column, value });
      const data = table === "jobs" ? [{ id: jobId, title: "Fristående order", status: "created",
        planned_start_date: null, planned_end_date: null, quote_acceptance_id: null, quote_version_id: null,
        customer_id: null, customers: null }] : table === "job_events" ? [{ id: eventId, event_type: "upgraded_to_project",
        occurred_at: occurredAt, channel: privateValue, reference: privateValue, metadata: { privateValue }, actor_email: privateValue }] : [];
      return { limit: async () => ({ data, error: null }), order: async () => ({ data, error: null }) };
    }, is() { throw new Error("unexpected unscoped query"); } }; } };
  } };
  // Reconciliation: this actual current presentation boundary is the RED baseline.
  // Implementation activates/rebinds to the approved dedicated events/workspace reader,
  // preserving this SAME safe-only behavior assertion. Do not preserve the old architecture
  // or filter/rename returned events in this test to manufacture a green result.
  // Existing Node strip-runner bridge resolves the actual Next package entry only.
  // It does not stub the factory, cookies, client or production projection.
  register("data:text/javascript," + encodeURIComponent(
    "export async function resolve(s,c,n){if(s==='next/headers' && c.parentURL?.endsWith('/supabase-server-client.ts'))return n('next/headers.js',c);return n(s,c);}",
  ), import.meta.url);
  const path = "@/features/jobs/read";
  const { readJobDetail } = await import(path) as { readJobDetail: typeof ProductionReadJobDetail };
  const current = await readJobDetail(client, jobId);
  assert.equal(current?.id, jobId);
  assert.equal(current?.events.length, 1);
  assert.equal(current?.events[0].id, eventId);
  assert.equal(current?.events[0].eventType, "upgraded_to_project");
  assert.ok(calls.some((c) => c.table === "jobs" && c.column === "id" && c.value === jobId));
  assert.ok(calls.some((c) => c.table === "job_events" && c.column === "job_id" && c.value === jobId));
  // Only key names may appear in RED output; never assert/dump private values.
  assert.deepEqual(Object.keys(current!.events[0]).sort(), ["eventType", "id", "occurredAt"]);
});

type EventClient = { from: (table: string) => unknown; rpc: (name: string) => never };
async function read(client: EventClient) {
  const path = "@/server/read-models/job-events";
  const binding = await import(path) as { readJobEvents: (client: EventClient, id: string) => Promise<{ rows: SafeJobEvent[]; error: string | null }> };
  return binding.readJobEvents(client, jobId);
}
function eventClient(data: unknown[], error: unknown = null) {
  const calls: { operation: string; args: unknown[] }[] = [];
  const query: Record<string, unknown> = {};
  for (const operation of ["select", "eq", "order", "limit", "range"]) query[operation] = (...args: unknown[]) => {
    calls.push({ operation, args }); return query;
  };
  query.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data, error }).then(resolve);
  return { calls, client: { from(table: string) { assert.equal(table, "job_events"); return query; },
    rpc() { throw new Error("event reader must not invoke directory/audit RPCs"); } } };
}

test.skip("[P0] 16.5-UNIT-EVENTS-02 dedicated normal-client reader selects explicit safe columns and scopes/orders real rows", async () => {
  const fixture = eventClient([{ id: eventId, event_type: "upgraded_to_project", occurred_at: occurredAt }]);
  const result = await read(fixture.client);
  assert.equal(result.error, null);
  assert.deepEqual(result.rows, [{ id: eventId, eventType: "upgraded_to_project", occurredAt }]);
  const select = fixture.calls.find((c) => c.operation === "select");
  assert.deepEqual(String(select?.args[0]).split(",").map((c) => c.trim()).sort(), ["event_type", "id", "occurred_at"]);
  assert.ok(fixture.calls.some((c) => c.operation === "eq" && c.args[0] === "job_id" && c.args[1] === jobId));
  assert.ok(fixture.calls.some((c) => c.operation === "order" && c.args[0] === "occurred_at" && (c.args[1] as { ascending?: boolean }).ascending === true));
});

test.skip("[P1] 16.5-UNIT-EVENTS-03 genuine empty and unavailable remain different without raw error data", async () => {
  assert.deepEqual(await read(eventClient([]).client), { rows: [], error: null });
  const unavailable = await read(eventClient([], { message: "synthetic-private" }).client);
  assert.deepEqual(unavailable.rows, []);
  assert.equal(typeof unavailable.error, "string");
  assert.ok(unavailable.error);
  assert.equal(JSON.stringify(unavailable).includes("synthetic-private"), false);
});
