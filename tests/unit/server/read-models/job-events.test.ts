import { test } from "node:test";
import assert from "node:assert/strict";
import type { SafeJobEvent } from "../../../support/job-workspace-atdd";

const jobId = "10000000-0000-4000-8000-000000000001";
const eventId = "20000000-0000-4000-8000-000000000001";
const occurredAt = "2026-10-20T09:30:00.000Z";

test("[P0] 16.5-UNIT-EVENTS-01 production event boundary structurally omits private raw fields", async () => {
  const privateValue = "synthetic-private-do-not-print";
  const fixture = eventClient([{id: eventId, event_type: "upgraded_to_projekt", occurred_at: occurredAt,
    channel: privateValue, reference: privateValue, metadata: {privateValue}, actor_email: privateValue}]);
  const current = await read(fixture.client);
  assert.equal(current.error, null);
  assert.equal(current.rows.length, 1);
  assert.equal(current.rows[0].id, eventId);
  assert.equal(current.rows[0].eventType, "upgraded_to_projekt");
  assert.deepEqual(Object.keys(current.rows[0]).sort(), ["eventType", "id", "occurredAt"]);
  assert.equal(JSON.stringify(current).includes(privateValue), false);
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
  let page: unknown[] = data.slice(0, 1000);
  for (const operation of ["select", "eq", "order", "limit", "range"]) query[operation] = (...args: unknown[]) => {
    calls.push({ operation, args });
    if (operation === "range") page = data.slice(Number(args[0]), Number(args[1]) + 1);
    return query;
  };
  query.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data: page, error }).then(resolve);
  return { calls, client: { from(table: string) { assert.equal(table, "job_events"); return query; },
    rpc() { throw new Error("event reader must not invoke directory/audit RPCs"); } } };
}

test("[P0] 16.5-UNIT-EVENTS-02 dedicated normal-client reader selects explicit safe columns and scopes/orders real rows", async () => {
  const fixture = eventClient([{ id: eventId, event_type: "upgraded_to_project", occurred_at: occurredAt }]);
  const result = await read(fixture.client);
  assert.equal(result.error, null);
  assert.deepEqual(result.rows, [{ id: eventId, eventType: "upgraded_to_project", occurredAt }]);
  const select = fixture.calls.find((c) => c.operation === "select");
  assert.deepEqual(String(select?.args[0]).split(",").map((c) => c.trim()).sort(), ["event_type", "id", "occurred_at"]);
  assert.ok(fixture.calls.some((c) => c.operation === "eq" && c.args[0] === "job_id" && c.args[1] === jobId));
  assert.ok(fixture.calls.some((c) => c.operation === "order" && c.args[0] === "occurred_at" && (c.args[1] as { ascending?: boolean }).ascending === true));
});

test("[P1] 16.5-UNIT-EVENTS-03 genuine empty and unavailable remain different without raw error data", async () => {
  assert.deepEqual(await read(eventClient([]).client), { rows: [], error: null });
  const unavailable = await read(eventClient([], { message: "synthetic-private" }).client);
  assert.deepEqual(unavailable.rows, []);
  assert.equal(typeof unavailable.error, "string");
  assert.ok(unavailable.error);
  assert.equal(JSON.stringify(unavailable).includes("synthetic-private"), false);
});

test("[P0] 16.5-UNIT-EVENTS-04 history beyond the API cap retains the true latest upgrade with stable page ordering", async () => {
  const data = Array.from({length: 1003}, (_, index) => ({id: `event-${String(index).padStart(4, "0")}`,
    event_type: index === 1002 ? "upgraded_to_projekt" : "created", occurred_at: occurredAt}));
  const fixture = eventClient(data);
  const result = await read(fixture.client);
  assert.equal(result.error, null);
  assert.equal(result.rows.length, 1003);
  assert.equal(result.rows.at(-1)?.eventType, "upgraded_to_projekt");
  assert.deepEqual(result.rows.slice(-3).map(row => row.id), ["event-1000", "event-1001", "event-1002"]);
  assert.deepEqual(fixture.calls.filter(call => call.operation === "range").map(call => call.args), [[0,499],[500,999],[1000,1499]]);
  assert.equal(fixture.calls.filter(call => call.operation === "order" && call.args[0] === "id").length, 3);
});
