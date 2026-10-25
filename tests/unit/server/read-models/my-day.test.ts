/** Story 15.6 production server adapter, mocked transport only (no RLS credit).
 * Proposed binding: readMyDay({date,mode}, {client,isModuleActive,noticeLimit,
 * resolveCapability?}).
 * Dependency options are server/test-only, never action parameters or authority.
 * DTO spellings below are proposed minimal bindings. Adapt to production names
 * before activation without widening the allowlists or weakening these assertions.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { TimeReportBookingPrefill } from "@/features/time-reports/types";

type Row = Record<string, unknown>;
type Trace = { table: string; filters: [string, string, unknown][]; range?: [number, number]; limit?: number; columns?: string };
function transport() {
  const tenantId = randomUUID(), userId = randomUUID(), membershipId = randomUUID(), bookingId = randomUUID(), jobId = randomUUID();
  let authenticated = true, roles = ["montor"], membershipStatus = "active", rpcError: unknown = null, noticeError: unknown = null;
  let payload: unknown = { ownSelfPersonIds: [randomUUID()], bookings: [{ id: bookingId, startsAt: "2026-10-25T00:30:00.000Z", endsAt: "2026-10-25T02:30:00.000Z",
    allDay: false, description: "Install lighting", ownAssignment: "assigned", canReportBooking: true, jobId, jobLabel: "Lighting job",
    customerLabel: "Workshop customer", address: "Åvägen 2, Stockholm" }],
  activeJobs: [{ id: jobId, title: "Lighting job", customerLabel: "Workshop customer", status: "created", myRole: "member" }] };
  const notices: Row[] = [], trace: Trace[] = [], rpcCalls: { name: string; args?: Row }[] = [];
  let authorityReads = 0;
  const client = {
    auth: { getClaims: async () => { authorityReads++; return { data: authenticated ? { claims: { sub: userId } } : null, error: null }; } },
    from(table: string) {
      const entry: Trace = { table, filters: [] };
      const query = {
        select(columns: string) { entry.columns = columns; return query; },
        eq(column: string, value: unknown) { entry.filters.push(["eq", column, value]); return query; },
        is(column: string, value: unknown) { entry.filters.push(["is", column, value]); return query; },
        order() { return query; },
        range(from: number, to: number) { entry.range = [from, to]; return query; },
        limit(limit: number) { entry.limit = limit; return query; },
        then(resolve: (reply: { data: Row[] | null; error: unknown }) => unknown) {
          trace.push(structuredClone(entry));
          const source = table === "tenant_memberships" ? [{ id: membershipId, tenant_id: tenantId, user_id: userId,
            role: roles[0], status: membershipStatus, created_at: "2026-01-01", tenants: { name: "Synthetic tenant" } }]
            : table === "membership_roles" ? roles.map(role => ({ tenant_id: tenantId, membership_id: membershipId, role }))
              : table === "notifications" ? notices : [];
          const filtered = source.filter(row => entry.filters.every(([, key, value]) => (row as Row)[key] === value));
          const [from, to] = entry.range ?? [0, (entry.limit ?? filtered.length) - 1];
          return Promise.resolve({ data: table === "notifications" && noticeError ? null : filtered.slice(from, to + 1),
            error: table === "notifications" ? noticeError : null }).then(resolve);
        },
      }; return query;
    },
    rpc: async (name: string, args?: Row) => {
      assert.ok(authorityReads > 0, "cookie claims must be revalidated before the projection RPC");
      rpcCalls.push({ name, args }); return { data: payload, error: rpcError };
    },
  };
  return { client, tenantId, userId, bookingId, jobId, rpcCalls, trace, notices,
    payload: (value: unknown) => { payload = value; }, raw: () => payload as { bookings: Row[]; activeJobs: Row[] },
    auth: (value: boolean) => { authenticated = value; }, roles: (value: string[]) => { roles = value; },
    status: (value: string) => { membershipStatus = value; }, rpcError: (value: unknown) => { rpcError = value; },
    noticeError: (value: unknown) => { noticeError = value; }, authorityReads: () => authorityReads };
}
const input = { date: "2026-10-25", mode: "day" };
function options(h: ReturnType<typeof transport>, jobs = true) {
  return { client: h.client, isModuleActive: (module: string) => module !== "jobs" || jobs, noticeLimit: 3 };
}
function notice(h: ReturnType<typeof transport>, patch: Row = {}): Row {
  return { id: randomUUID(), tenant_id: h.tenantId, recipient_user_id: h.userId, category: "booking.changed",
    title: "Planeringen har ändrats", body: "En bokning i din planering har ändrats.", route: "/scheduling",
    read_at: null, created_at: "2026-10-25T03:00:00.000Z", ...patch };
}

test("[P0] 15.6-UNIT-R01 AC1/2 cookie authority supplies exact four RPC arguments; hostile selectors have no effect", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport();
  const result = await readMyDay({ ...input, tenantId: "foreign-tenant", userId: "foreign-user", roles: ["tenant_admin"], includeJobs: false }, options(h));
  assert.equal(result.ok, true);
  assert.deepEqual(h.rpcCalls, [{ name: "read_my_day", args: { p_tenant_id: h.tenantId,
    p_start: "2026-10-24T22:00:00.000Z", p_end: "2026-10-25T23:00:00.000Z", p_include_jobs: true } }]);
  assert.equal(h.authorityReads(), 1);
  assert.doesNotMatch(JSON.stringify(result), /foreign-tenant|foreign-user|tenant_admin/);
});

for (const denied of ["anonymous", "invited", "disabled", "no-booking-grant", "scheduling-pending"]) {
  test(`[P0] 15.6-UNIT-R02 AC1 current ${denied} denies before projection/notice reads`, async () => {
    const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
    const h = transport();
    if (denied === "anonymous") h.auth(false);
    if (["invited", "disabled"].includes(denied)) h.status(denied);
    if (denied === "no-booking-grant") h.roles(["saljare"]);
    const deps = { ...options(h), isModuleActive: (module: string) => !(module === "scheduling" && denied === "scheduling-pending") };
    const result = await readMyDay(input, deps);
    assert.equal(result.ok, false); assert.equal(result.code, "DENIED");
    assert.deepEqual(h.rpcCalls, []); assert.equal(h.trace.some(row => row.table === "notifications"), false);
    assert.doesNotMatch(JSON.stringify(result), /Install lighting|Lighting job/);
  });
}

test("[P0] 15.6-UNIT-R03 AC3/7 exact browser allowlists strip money, peers, source and authority for managers too", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport(); h.roles(["tenant_admin", "montor"]);
  const raw = h.raw();
  Object.assign(raw, { tenantId: h.tenantId, userId: h.userId, roles: ["tenant_admin"], quoteId: "PRIVATE_SOURCE" });
  Object.assign(raw.bookings[0], { acceptedPriceOre: 987654321, cost_rate_ore: 999, assignees: ["PRIVATE_PEER"], quoteVersionId: "PRIVATE_SOURCE", rawRow: { secret: true } });
  Object.assign(raw.activeJobs[0], { quoteId: "PRIVATE_SOURCE", sourceSentTotalOre: 987654321, card: { secret: true }, members: ["PRIVATE_PEER"] });
  const result = await readMyDay(input, options(h)); assert.equal(result.ok, true);
  const card = result.data.bookings[0];
  assert.deepEqual(Object.keys(card).sort(), ["address", "allDay", "customerLabel", "description", "endsAt", "id", "jobId", "jobLabel", "ownAssignment", "startsAt", "timeReportPrefill"].sort());
  assert.deepEqual(Object.keys(result.data.activeJobs[0]).sort(), ["customerLabel", "id", "myRole", "status", "title"]);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_|rawRow|quoteId|quoteVersion|acceptedPrice|rate_ore|tenantId|userId|roles|members/);
});

test("[P0] 15.6-UNIT-R04 AC3 filing prefill is exact existing contract with Stockholm date and elapsed DST minutes", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport(); const result = await readMyDay(input, options(h)); assert.equal(result.ok, true);
  const expected: TimeReportBookingPrefill = { bookingId: h.bookingId, jobId: h.jobId, jobLabel: "Lighting job",
    startsAt: "2026-10-25T00:30:00.000Z", endsAt: "2026-10-25T02:30:00.000Z", minutes: 120, date: "2026-10-25" };
  assert.equal(result.data.canReportOwn, true);
  assert.deepEqual(result.data.bookings[0].timeReportPrefill, expected);
  assert.equal(Object.hasOwn(result.data.bookings[0], "timeReportHref"), false, "existing page does not accept query-string prefill");
});

test("[P0] 15.6-UNIT-R05 AC3/6 own-time capability revoked between reads removes prefill immediately", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport();
  assert.ok((await readMyDay(input, options(h))).data.bookings[0].timeReportPrefill);
  // All current Bookings.View roles also have ReportOwn. A server-only capability
  // port models a revoked entitlement without inventing a different role matrix.
  const matrixName = "@/server/authz/permission-matrix";
  const { resolveCapability } = await import(matrixName);
  const result = await readMyDay(input, { ...options(h), resolveCapability: (request: { roles?: readonly unknown[]; module: string; capability: string }) =>
    request.capability === "TimeReports.ReportOwn" ? { granted: false } : resolveCapability(request) });
  assert.equal(result.ok, true);
  assert.equal(result.data.canReportOwn, false); assert.equal(result.data.bookings[0].timeReportPrefill, null);
  assert.equal(h.authorityReads(), 2);
});

test("[P1] 15.6-UNIT-R06 AC3 jobless/addressless booking has explicit absence and valid jobless prefill", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport(); Object.assign(h.raw().bookings[0], { jobId: null, jobLabel: null, customerLabel: null, address: null });
  const result = await readMyDay(input, options(h)); assert.equal(result.ok, true);
  const card = result.data.bookings[0]; assert.equal(card.jobId, null); assert.equal(card.address, null);
  assert.deepEqual(card.timeReportPrefill, { bookingId: h.bookingId, startsAt: "2026-10-25T00:30:00.000Z",
    endsAt: "2026-10-25T02:30:00.000Z", minutes: 120, jobId: null, date: "2026-10-25" });
  assert.doesNotMatch(JSON.stringify(card), /\/jobs\/null|maps|undefined/);
});

test("[P0] 15.6-UNIT-R07 AC4 jobs pending sets false, queries no jobs source and contributes no section payload/actions", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport();
  h.payload({ ownSelfPersonIds: [randomUUID()], bookings: [{ id: h.bookingId, startsAt: "2026-10-25T00:30:00.000Z", endsAt: "2026-10-25T02:30:00.000Z",
    allDay: false, description: "Install lighting", ownAssignment: "assigned", canReportBooking: false, customerLabel: null, address: null }], activeJobs: [] });
  const result = await readMyDay({ ...input, includeJobs: true }, options(h, false)); assert.equal(result.ok, true);
  assert.equal(h.rpcCalls[0].args?.p_include_jobs, false);
  assert.equal(h.trace.some(row => /jobs|job_members/.test(row.table)), false);
  assert.deepEqual(h.rpcCalls.map(call => call.name), ["read_my_day"]);
  assert.equal(Object.hasOwn(result.data, "activeJobs"), false);
  assert.equal(Object.hasOwn(result.data.bookings[0], "jobId"), false);
  assert.equal(Object.hasOwn(result.data.bookings[0], "jobLabel"), false);
  assert.equal(result.data.bookings[0].timeReportPrefill, null, "withheld job identity must never fabricate a jobless report");
});

test("[P0] 15.6-UNIT-R08 AC5 filter own unread booking.changed before cap; safe generic notices and honest more-link", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport();
  h.notices.push(...Array.from({ length: 501 }, () => notice(h, { category: "quotes.follow-up" })),
    notice(h, { recipient_user_id: "PRIVATE_PEER" }), notice(h, { tenant_id: "FOREIGN_TENANT" }),
    notice(h, { read_at: "2026-10-25T04:00Z" }), ...Array.from({ length: 4 }, () => notice(h)));
  const result = await readMyDay(input, options(h)); assert.equal(result.ok, true);
  assert.equal(result.data.notices.length, 3); assert.equal(result.data.noticesHasMore, true);
  assert.equal(result.data.noticesMoreHref, null); assert.equal(result.data.noticePage, 1); assert.equal(result.data.noticesUnavailable, false);
  const reads = h.trace.filter(row => row.table === "notifications"); assert.ok(reads.length > 0);
  for (const read of reads) {
    for (const filter of [["eq", "tenant_id", h.tenantId], ["eq", "recipient_user_id", h.userId], ["eq", "category", "booking.changed"], ["is", "read_at", null]]) {
      assert.ok(read.filters.some(actual => JSON.stringify(actual) === JSON.stringify(filter)), "all category/recipient/read filters must be sent in every page query");
    }
  }
  for (const item of result.data.notices) {
    assert.equal(item.route, "/scheduling"); assert.equal(item.body, "En bokning i din planering har ändrats.");
    assert.equal(Object.hasOwn(item, "bookingId"), false); assert.equal(Object.hasOwn(item, "date"), false);
  }
  assert.doesNotMatch(JSON.stringify(result.data.notices), /PRIVATE_PEER|FOREIGN_TENANT|idag|imorgon/);
  const continued = await readMyDay({ ...input, noticePage: 2 }, options(h));
  assert.equal(continued.ok, true); assert.equal(continued.data.noticePage, 2);
  assert.equal(continued.data.notices.length, 1); assert.equal(continued.data.noticesHasMore, false);
  assert.equal(continued.data.noticesMoreHref, null);
  assert.ok(h.trace.filter(row => row.table === "notifications").some(row => row.range?.[0] === 3 && row.range?.[1] === 6));
  assert.equal(new Set([...result.data.notices, ...continued.data.notices].map(row => row.id)).size, 4);

});

test("[P1] 15.6-UNIT-R09 AC5 notices empty/failure are distinct and never manufacture a schedule change", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport();
  const empty = await readMyDay(input, options(h)); assert.equal(empty.ok, true);
  assert.deepEqual(empty.data.notices, []); assert.equal(empty.data.noticesUnavailable, false); assert.equal(empty.data.noticesHasMore, false);
  h.noticeError(new Error("PRIVATE_NOTIFICATION_SQL"));
  const failed = await readMyDay(input, options(h)); assert.equal(failed.ok, true);
  assert.deepEqual(failed.data.notices, []); assert.equal(failed.data.noticesUnavailable, true); assert.equal(failed.data.noticesHasMore, false);
  assert.doesNotMatch(JSON.stringify(failed), /PRIVATE_NOTIFICATION_SQL/);
});

for (const malformed of [null, { bookings: "not-an-array", activeJobs: [] },
  { bookings: [{ id: "not-a-uuid", startsAt: "bad", endsAt: "bad" }], activeJobs: [] }]) {
  test("[P0] 15.6-UNIT-R10 AC6 malformed projection fails closed instead of reporting connected empty", async () => {
    const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
    const h = transport(); h.payload(malformed);
    const result = await readMyDay(input, options(h)); assert.equal(result.ok, false);
    assert.equal(result.code, "UNAVAILABLE"); assert.equal(result.message, "Anslutning krävs");
    assert.equal(Object.hasOwn(result, "data"), false);
  });
}

test("[P0] 15.6-UNIT-R11 AC6 failed refresh or membership revocation never returns previous success", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport(); assert.equal((await readMyDay(input, options(h))).ok, true);
  h.rpcError(new Error("PRIVATE_DATABASE_STACK"));
  const unavailable = await readMyDay(input, options(h)); assert.equal(unavailable.ok, false);
  assert.equal(unavailable.message, "Anslutning krävs"); assert.equal(Object.hasOwn(unavailable, "data"), false);
  h.rpcError(null); h.status("disabled"); const denied = await readMyDay(input, options(h));
  assert.equal(denied.ok, false); assert.equal(denied.code, "DENIED"); assert.equal(h.rpcCalls.length, 2);
  assert.doesNotMatch(JSON.stringify([unavailable, denied]), /Install lighting|Lighting job|PRIVATE_DATABASE_STACK/);
});

test("[P1] 15.6-UNIT-R12 AC2/4 confirmed booking empty and active-job empty remain independent", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport(); const jobs = h.raw().activeJobs;
  h.payload({ ownSelfPersonIds: [randomUUID()], bookings: [], activeJobs: jobs });
  const withoutBookings = await readMyDay(input, options(h)); assert.equal(withoutBookings.ok, true);
  assert.deepEqual(withoutBookings.data.bookings, []); assert.equal(withoutBookings.data.activeJobs.length, 1);
  h.payload({ ownSelfPersonIds: [randomUUID()], bookings: [], activeJobs: [] }); const empty = await readMyDay(input, options(h));
  assert.equal(empty.ok, true); assert.deepEqual(empty.data.bookings, []); assert.deepEqual(empty.data.activeJobs, []);
});


test("[P0] 15.6-UNIT-R13 AC6 opaque render context is stable for one actor/tenant and changes across authority", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  const h = transport(), other = transport();
  const first = await readMyDay(input, options(h)); assert.equal(first.ok, true);
  assert.match(first.renderContextKey, /^[0-9a-f]{64}$/);
  const again = await readMyDay({ ...input, renderContextKey: "forged" }, options(h));
  assert.equal(again.renderContextKey, first.renderContextKey);
  h.rpcError(new Error("unavailable"));
  assert.equal((await readMyDay(input, options(h))).renderContextKey, first.renderContextKey);
  assert.notEqual((await readMyDay(input, options(other))).renderContextKey, first.renderContextKey);
  assert.doesNotMatch(JSON.stringify(first), new RegExp(`${h.tenantId}|${h.userId}`));
});

test("[P1] 15.6-UNIT-R14 AC5 invalid notice page cannot reach the projection or notification source", async () => {
  const name = "@/server/read-models/my-day"; const { readMyDay } = await import(name);
  for (const noticePage of [0, -1, 1.5, 1000001, "2", Infinity]) {
    const h = transport(); const result = await readMyDay({ ...input, noticePage }, options(h));
    assert.equal(result.ok, false); assert.equal(result.code, "INVALID_INPUT");
    assert.deepEqual(h.rpcCalls, []); assert.equal(h.trace.some(row => row.table === "notifications"), false);
  }
});
