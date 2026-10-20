/** Prepared RED-phase vectors, now bound to the production T1 serializer.
 * Independent RFC parsing below preserves the original contract oracle. */
import assert from "node:assert/strict";
import { test } from "node:test";

type Event = { id: string; startsAt: string; endsAt: string; allDay: boolean;
  updatedAt: string; title: string; jobLabel?: string; customerLabel?: string; location?: string };
type Encoder = (events: readonly Event[]) => string;
async function encoder(): Promise<Encoder> {
  return (await import("@/features/calendar-feed/icalendar")).encodeCalendarFeed;
}
const booking = (patch: Partial<Event> = {}): Event => ({ id: "1c53a406-cd13-4f3e-bf0b-1484172036fb",
  startsAt: "2026-10-25T00:30:00Z", endsAt: "2026-10-25T01:30:00Z", allDay: false,
  updatedAt: "2026-10-20T08:00:00Z", title: "Bokning", ...patch });
// Independent RFC5545 unfolding/parser oracle: not imported from the production encoder.
function properties(ics: string): string[] {
  assert.ok(ics.endsWith("\r\n"));
  assert.equal(ics.replaceAll("\r\n", "").includes("\n"), false);
  for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  return ics.replace(/\r\n[ \t]/g, "").split("\r\n");
}

// Actual implementation binding; independent contract vectors retained.
test("[P1] 15.5-UNIT-001 AC3 AC8 timed autumn fold preserves independent UTC instants", async () => {
  // Given distinct UTC instants in the repeated Stockholm hour; when serialized; then exact Z values survive.
  const lines = properties((await encoder())([booking()]));
  assert.ok(lines.includes("DTSTART:20261025T003000Z"));
  assert.ok(lines.includes("DTEND:20261025T013000Z"));
  assert.equal(lines.filter(line => line === "BEGIN:VEVENT").length, 1);
});
for (const vector of [
  { id: "spring", start: "2026-03-28T23:00:00Z", end: "2026-03-29T22:00:00Z", day: "20260329", next: "20260330" },
  { id: "autumn", start: "2026-10-24T22:00:00Z", end: "2026-10-25T23:00:00Z", day: "20261025", next: "20261026" },
]) // Actual implementation binding; independent contract vectors retained.
test(`[P1] 15.5-UNIT-002-${vector.id} AC3 AC8 all-day Stockholm exclusive end across DST`, async () => {
  const lines = properties((await encoder())([booking({ allDay: true, startsAt: vector.start, endsAt: vector.end })]));
  assert.ok(lines.includes(`DTSTART;VALUE=DATE:${vector.day}`));
  assert.ok(lines.includes(`DTEND;VALUE=DATE:${vector.next}`));
  assert.equal(lines.some(line => /^DTSTART:/.test(line)), false);
});
// Actual implementation binding; independent contract vectors retained.
test("[P1] 15.5-UNIT-003 AC3 AC8 edit/split with retained booking ID retains UID and stable update stamp", async () => {
  const encode = await encoder(), initial = properties(encode([booking()]));
  const edited = properties(encode([booking({ startsAt: "2026-10-26T07:00:00Z", endsAt: "2026-10-26T08:00:00Z" })]));
  const uid = initial.find(line => line.startsWith("UID:"));
  assert.ok(uid?.includes(booking().id)); assert.equal(edited.find(line => line.startsWith("UID:")), uid);
  assert.equal(edited.find(line => line.startsWith("DTSTAMP:")), "DTSTAMP:20261020T080000Z");
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-004 AC8 malicious UTF8 text is escaped and octet folded without property injection", async () => {
  const title = "Å🔌".repeat(40) + ",;\\\r\nATTENDEE:mailto:peer@example.invalid";
  const ics = (await encoder())([booking({ title, location: "A;B,C\\D\nE" })]);
  const lines = properties(ics);
  assert.equal(lines.filter(line => line === "BEGIN:VEVENT").length, 1);
  assert.equal(lines.some(line => /^(ATTENDEE|ORGANIZER|VALARM|URL):/.test(line)), false);
  assert.ok(lines.includes("LOCATION:A\\;B\\,C\\\\D\\nE"));
  assert.equal(Buffer.from(ics, "utf8").toString("utf8"), ics);
  assert.equal(ics.includes("\ufffd"), false);
});
// Actual implementation binding; independent contract vectors retained.
test("[P1] 15.5-UNIT-005 AC3 AC8 empty and >PostgREST-cap input are complete calendars", async () => {
  const encode = await encoder();
  assert.ok(properties(encode([])).includes("END:VCALENDAR"));
  const events = Array.from({ length: 1005 }, (_, i) => booking({ id: `independent-booking-${i}` }));
  const lines = properties(encode(events));
  assert.equal(lines.filter(line => line === "BEGIN:VEVENT").length, events.length);
  assert.equal(new Set(lines.filter(line => line.startsWith("UID:"))).size, events.length);
});

for (const vector of [
  { start: "2026-10-25T00:30:00.000001Z", end: "2026-10-25T00:30:00.000002Z", projectedStart: "20261025T003000Z", projectedEnd: "20261025T003001Z" },
  { start: "2026-10-25T00:30:00.1Z", end: "2026-10-25T00:30:00.9Z", projectedStart: "20261025T003000Z", projectedEnd: "20261025T003001Z" },
  { start: "2026-10-25T00:30:00.999999Z", end: "2026-10-25T00:30:01Z", projectedStart: "20261025T003000Z", projectedEnd: "20261025T003001Z" },
  { start: "1969-12-31T23:59:59.999998Z", end: "1969-12-31T23:59:59.999999Z", projectedStart: "19691231T235959Z", projectedEnd: "19700101T000000Z" },
  { start: "9999-12-31T23:59:59.000001Z", end: "9999-12-31T23:59:59.999999Z", projectedStart: "99991231T235958Z", projectedEnd: "99991231T235959Z" },
]) test(`R1-05 positive microsecond range projects to distinct supported RFC seconds ${vector.start}`, async () => {
  const lines = properties((await encoder())([booking({ startsAt: vector.start, endsAt: vector.end })]));
  assert.ok(lines.includes(`DTSTART:${vector.projectedStart}`));
  assert.ok(lines.includes(`DTEND:${vector.projectedEnd}`));
});
test("R1-05 microsecond ordering rejects reversed intervals within one millisecond", async () => {
  const encode = await encoder();
  assert.throws(() => encode([booking({ startsAt: "2026-10-25T00:30:00.000002Z", endsAt: "2026-10-25T00:30:00.000001Z" })]), /Calendar unavailable/);
});
test("R1-06 snapshot omits METHOD and both revision stamps advance while UID stays stable", async () => {
  const encode = await encoder(), before = properties(encode([booking()]));
  const after = properties(encode([booking({ title: "Ny roll", jobLabel: "Nytt jobb", customerLabel: "Ny kund", location: "Ny adress", updatedAt: "2026-10-21T09:30:00.123456Z" })]));
  assert.equal(after.some(line => line.startsWith("METHOD:")), false);
  assert.equal(after.find(line => line.startsWith("UID:")), before.find(line => line.startsWith("UID:")));
  assert.ok(after.includes("DTSTAMP:20261021T093000Z")); assert.ok(after.includes("LAST-MODIFIED:20261021T093000Z"));
});
