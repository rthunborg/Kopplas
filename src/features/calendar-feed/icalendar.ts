import type { CalendarFeedEvent } from "./types";

import { parseUtcInstant, formatUtcInstant, localDateForInstant } from "@/features/scheduling/time-zone";

const second = BigInt(1000000);
const lastSecond = parseUtcInstant("9999-12-31T23:59:59Z");
function instant(value: string): bigint {
  try { return parseUtcInstant(value); } catch { throw new Error("Calendar unavailable"); }
}
function floorSecond(value: bigint): bigint { return (value >= BigInt(0) ? value / second : (value - second + BigInt(1)) / second) * second; }
function utc(value: bigint): string {
  const formatted = formatUtcInstant(value);
  if (!/^\d{4}-/.test(formatted) || formatted.startsWith("0000")) throw new Error("Calendar unavailable");
  return formatted.slice(0,19).replace(/[-:]/g, "") + "Z";
}
/** RFC5545 has whole seconds. Expand outward, saturating the final supported
 * second at year 9999; move start back one second if saturation collapses it. */
function timedRange(start: bigint, end: bigint): [string, string] {
  let projectedStart = floorSecond(start);
  let projectedEnd = floorSecond(end) + (end % second === BigInt(0) ? BigInt(0) : second);
  if (projectedEnd > lastSecond) projectedEnd = lastSecond;
  if (projectedStart >= projectedEnd) projectedStart = projectedEnd - second;
  return [utc(projectedStart), utc(projectedEnd)];
}
function localDay(value: bigint): string { return localDateForInstant(value).replaceAll("-", ""); }
function escape(value: string): string {
  return value.replaceAll("\\", "\\\\").replace(/\r\n|\r|\n/g, "\\n").replaceAll(";", "\\;").replaceAll(",", "\\,").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}
/** Fold by UTF-8 octets, including the continuation space, never within a code point. */
function fold(value: string): string {
  const encoder = new TextEncoder(); let line = "", length = 0; const lines: string[] = [];
  for (const char of value) {
    const size = encoder.encode(char).length;
    if (length + size > 75) { lines.push(line); line = " "; length = 1; }
    line += char; length += size;
  }
  return [...lines, line].join("\r\n");
}
/** Full snapshots use materialized booking IDs; no recurrence re-expansion or horizon. */
export function encodeCalendarFeed(events: readonly CalendarFeedEvent[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kopplas//Personal calendar//SV", "CALSCALE:GREGORIAN"];
  const seen = new Set<string>();
  for (const event of events) {
    const start = instant(event.startsAt), end = instant(event.endsAt);
    if (!event.id || /[\r\n]/.test(event.id) || seen.has(event.id) || end <= start) throw new Error("Calendar unavailable");
    const [timedStart, timedEnd] = event.allDay ? ["", ""] : timedRange(start, end);
    const stamp = utc(floorSecond(instant(event.updatedAt)));
    seen.add(event.id);
    lines.push("BEGIN:VEVENT", `UID:${escape(event.id)}@bookings.kopplas`, `DTSTAMP:${stamp}`, `LAST-MODIFIED:${stamp}`,
      event.allDay ? `DTSTART;VALUE=DATE:${localDay(start)}` : `DTSTART:${timedStart}`,
      event.allDay ? `DTEND;VALUE=DATE:${localDay(end)}` : `DTEND:${timedEnd}`,
      `SUMMARY:${escape([event.title, event.jobLabel, event.customerLabel].filter(Boolean).join(" – "))}`);
    if (event.location) lines.push(`LOCATION:${escape(event.location)}`);
    lines.push("END:VEVENT");
  }
  return [...lines, "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n";
}
