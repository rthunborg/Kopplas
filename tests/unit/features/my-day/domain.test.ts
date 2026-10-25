/** Story 15.6 RED. Proposed pure seams: reconcile names before activation, retain
 * the literal behavior. Future production imports live only in skipped callbacks.
 * This suite does not implement a second date/state engine or claim passing cover.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

const BOOKING = "10000000-0000-4000-8000-000000000001";
function booking(patch: Record<string, unknown> = {}) {
  return { id: BOOKING, startsAt: "2026-10-25T00:30:00.000Z", endsAt: "2026-10-25T02:30:00.000Z",
    allDay: false, description: "Install lighting", status: "planned", jobId: null,
    jobLabel: null, customerLabel: null, address: null, ownAssignment: "assigned", ...patch };
}
const selection = (patch: Record<string, unknown> = {}) => ({ date: "2026-10-25", tenantKey: "tenant-a", userKey: "user-a", ...patch });
const loaded = () => ({ bookings: [booking()], activeJobs: [{ id: "job-a", title: "Lighting", status: "created" }],
  notices: [{ id: "notice-a", title: "Planeringen har ändrats", route: "/scheduling" }] });

test.skip("[P1] 15.6-UNIT-D01 AC2 initial today is Stockholm local date across UTC midnight", async () => {
  const name = "@/features/my-day/domain";
  const { myDayToday } = await import(name);
  assert.equal(myDayToday("2026-10-24T22:30:00.000Z"), "2026-10-25");
  assert.equal(myDayToday("2026-10-25T23:30:00.000Z"), "2026-10-26");
});

for (const [date, start, end, hours] of [
  ["2026-03-29", "2026-03-28T23:00:00.000Z", "2026-03-29T22:00:00.000Z", 23],
  ["2026-10-25", "2026-10-24T22:00:00.000Z", "2026-10-25T23:00:00.000Z", 25],
] as const) {
  test.skip(`[P0] 15.6-UNIT-D02 AC2 Stockholm ${date} uses actual ${hours}-hour day`, async () => {
    const name = "@/features/my-day/domain";
    const { myDayPeriod } = await import(name);
    const period = myDayPeriod(date, "day");
    assert.equal(period.start, start); assert.equal(period.end, end);
    assert.deepEqual(period.dates, [date]);
    assert.equal((Date.parse(period.end) - Date.parse(period.start)) / 3_600_000, hours);
  });
}

test.skip("[P0] 15.6-UNIT-D03 AC2 week navigation retains selected local weekday across fall DST", async () => {
  const name = "@/features/my-day/domain";
  const { myDayPeriod, shiftMyDayWeek } = await import(name);
  assert.equal(shiftMyDayWeek("2026-10-25", 1), "2026-11-01");
  assert.equal(shiftMyDayWeek("2026-10-25", -1), "2026-10-18");
  const period = myDayPeriod("2026-10-25", "week");
  assert.equal(period.start, "2026-10-18T22:00:00.000Z");
  assert.equal(period.end, "2026-10-25T23:00:00.000Z");
  assert.deepEqual(period.dates, ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25"]);
  assert.equal((Date.parse(period.end) - Date.parse(period.start)) / 3_600_000, 169);
});

test.skip("[P1] 15.6-UNIT-D04 AC2 invalid calendar dates never normalize to another date", async () => {
  const name = "@/features/my-day/domain";
  const { myDayPeriod } = await import(name);
  for (const date of ["2026-02-30", "2026-13-01", "25/10/2026", "", "2026-10-25T00:00Z"]) {
    assert.throws(() => myDayPeriod(date, "day"));
  }
});

test.skip("[P0] 15.6-UNIT-D05 AC2 agenda half-open overlap sorts start then ID and deduplicates shared/series rows", async () => {
  const name = "@/features/my-day/domain";
  const { myDayAgenda } = await import(name);
  const early = booking({ id: "a", startsAt: "2026-10-24T21:30:00Z", endsAt: "2026-10-24T23:00:00Z" });
  const a = booking({ id: "b", seriesId: "series", occurrenceIndex: 1 });
  const b = booking({ id: "c", seriesId: "series", occurrenceIndex: 2 });
  const allDay = booking({ id: "all-day", allDay: true, startsAt: "2026-10-24T22:00:00Z", endsAt: "2026-10-25T23:00:00Z" });
  const actual = myDayAgenda([b, a, a, early, allDay,
    booking({ id: "ends-on-start", startsAt: "2026-10-24T20:00:00Z", endsAt: "2026-10-24T22:00:00Z" }),
    booking({ id: "starts-on-end", startsAt: "2026-10-25T23:00:00Z", endsAt: "2026-10-26T00:00:00Z" }),
    booking({ id: "cancelled", status: "cancelled" }),
  ], { start: "2026-10-24T22:00:00Z", end: "2026-10-25T23:00:00Z" });
  assert.deepEqual(actual.map((row: { id: string }) => row.id), ["a", "all-day", "b", "c"]);
  assert.equal(actual.find((row: { id: string }) => row.id === "all-day").allDay, true);
});

test.skip("[P1] 15.6-UNIT-D06 AC3 map URL safely encodes Swedish text, query delimiters and script-like input", async () => {
  // Google path/query is an author-adaptable presentation default, not an
  // exclusive provider requirement. Preserve HTTPS, one encoded address, no
  // injected parameters/fragments and absence behavior when reconciling it.
  const name = "@/features/my-day/domain";
  const { myDayMapUrl } = await import(name);
  const address = 'Åvägen 2 & 4 #entré? nästa=<script>alert(1)</script>, 111 22 Stockholm';
  const url = new URL(myDayMapUrl(address));
  assert.equal(url.protocol, "https:"); assert.equal(url.hostname, "www.google.com");
  assert.equal(url.pathname, "/maps/search/");
  assert.equal(url.searchParams.get("api"), "1"); assert.equal(url.searchParams.get("query"), address);
  assert.equal(url.hash, ""); assert.equal(url.searchParams.size, 2);
  assert.equal(myDayMapUrl(null), null); assert.equal(myDayMapUrl("  "), null);
});

for (const kind of ["retryable", "denied"] as const) {
  test.skip(`[P0] 15.6-UNIT-D07 AC6 ${kind} after success clears cards, actions and notices`, async () => {
    const name = "@/features/my-day/domain";
    const { createMyDayState, reduceMyDayState } = await import(name);
    let state = createMyDayState(selection());
    state = reduceMyDayState(state, { type: "request", requestId: 1, selection: selection() });
    state = reduceMyDayState(state, { type: "success", requestId: 1, selection: selection(), data: loaded() });
    assert.equal(state.bookings.length, 1);
    state = reduceMyDayState(state, { type: "request", requestId: 2, selection: selection() });
    state = reduceMyDayState(state, { type: "failure", requestId: 2, selection: selection(), kind });
    assert.deepEqual(state.bookings, []); assert.deepEqual(state.activeJobs, []); assert.deepEqual(state.notices, []);
    assert.equal(state.status, kind === "denied" ? "denied" : "unavailable");
    assert.equal(state.isEmpty, false);
    assert.doesNotMatch(JSON.stringify(state), /Install lighting|job-a|notice-a/);
  });
}

for (const changed of [{ date: "2026-10-26" }, { tenantKey: "tenant-b" }, { userKey: "user-b" }]) {
  test.skip(`[P0] 15.6-UNIT-D08 AC6 late previous ${Object.keys(changed)[0]} response cannot restore old data`, async () => {
    const name = "@/features/my-day/domain";
    const { createMyDayState, reduceMyDayState } = await import(name);
    const old = selection(), current = selection(changed);
    let state = reduceMyDayState(createMyDayState(old), { type: "request", requestId: 1, selection: old });
    state = reduceMyDayState(state, { type: "request", requestId: 2, selection: current });
    state = reduceMyDayState(state, { type: "failure", requestId: 2, selection: current, kind: "retryable" });
    const before = structuredClone(state);
    assert.deepEqual(reduceMyDayState(state, { type: "success", requestId: 1, selection: old, data: loaded() }), before);
    assert.deepEqual(reduceMyDayState(state, { type: "failure", requestId: 1, selection: old, kind: "denied" }), before);
  });
}

test.skip("[P0] 15.6-UNIT-D09 AC6 only current connected successful empty read becomes empty", async () => {
  const name = "@/features/my-day/domain";
  const { createMyDayState, reduceMyDayState } = await import(name);
  const initial = createMyDayState(selection()); assert.equal(initial.isEmpty, false);
  const pending = reduceMyDayState(initial, { type: "request", requestId: 1, selection: selection() });
  assert.equal(pending.isEmpty, false);
  const empty = reduceMyDayState(pending, { type: "success", requestId: 1, selection: selection(), data: { bookings: [], activeJobs: [], notices: [] } });
  assert.equal(empty.status, "ready"); assert.equal(empty.isEmpty, true);
});

test.skip("[P0] 15.6-UNIT-D10 AC6 older refresh for identical selection cannot replace a newer failed refresh", async () => {
  const name = "@/features/my-day/domain";
  const { createMyDayState, reduceMyDayState } = await import(name);
  let state = reduceMyDayState(createMyDayState(selection()), { type: "request", requestId: 1, selection: selection() });
  state = reduceMyDayState(state, { type: "request", requestId: 2, selection: selection() });
  state = reduceMyDayState(state, { type: "failure", requestId: 2, selection: selection(), kind: "retryable" });
  const before = structuredClone(state);
  assert.deepEqual(reduceMyDayState(state, { type: "success", requestId: 1, selection: selection(), data: loaded() }), before);
});
