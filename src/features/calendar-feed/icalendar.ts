import type { CalendarFeedEvent } from "./types";

const stockholm = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" });
function instant(value: string): Date {
  if (!/^[0-9]{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) || value.startsWith("0000")) throw new Error("Calendar unavailable");
  const day = new Date(`${value.slice(0,10)}T00:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10) !== value.slice(0,10)) throw new Error("Calendar unavailable");
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("Calendar unavailable");
  return date;
}
function utc(value: string): string { return instant(value).toISOString().slice(0, 19).replace(/[-:]/g, "") + "Z"; }
function localDay(value: string): string { return stockholm.format(instant(value)).replaceAll("-", ""); }
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
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kopplas//Personal calendar//SV", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  const seen = new Set<string>();
  for (const event of events) {
    if (!event.id || /[\r\n]/.test(event.id) || seen.has(event.id) || instant(event.endsAt) <= instant(event.startsAt)) throw new Error("Calendar unavailable");
    seen.add(event.id);
    lines.push("BEGIN:VEVENT", `UID:${escape(event.id)}@bookings.kopplas`, `DTSTAMP:${utc(event.updatedAt)}`, `LAST-MODIFIED:${utc(event.updatedAt)}`,
      event.allDay ? `DTSTART;VALUE=DATE:${localDay(event.startsAt)}` : `DTSTART:${utc(event.startsAt)}`,
      event.allDay ? `DTEND;VALUE=DATE:${localDay(event.endsAt)}` : `DTEND:${utc(event.endsAt)}`,
      `SUMMARY:${escape([event.title, event.jobLabel, event.customerLabel].filter(Boolean).join(" – "))}`);
    if (event.location) lines.push(`LOCATION:${escape(event.location)}`);
    lines.push("END:VEVENT");
  }
  return [...lines, "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n";
}
