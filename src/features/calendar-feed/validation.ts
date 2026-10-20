import type { CalendarFeedIntent } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A 32-byte base64url value has two unused bits in its final sextet. */
export function isCalendarFeedToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/.test(value);
}
export function validateCalendarFeedIntent(raw: unknown): { ok: true; data: CalendarFeedIntent } | { ok: false; code: "VALIDATION_FAILED" } {
  if (!raw || typeof raw !== "object") return { ok: false, code: "VALIDATION_FAILED" };
  const input = raw as Record<string, unknown>;
  if (Object.keys(input).some(k => !["action", "revision", "attemptId"].includes(k)) ||
    !["create", "rotate", "revoke"].includes(String(input.action)) ||
    typeof input.revision !== "number" || !Number.isSafeInteger(input.revision) || input.revision < 0 || input.revision > 2147483646 ||
    typeof input.attemptId !== "string" || !UUID.test(input.attemptId)) return { ok: false, code: "VALIDATION_FAILED" };
  return { ok: true, data: input as CalendarFeedIntent };
}
