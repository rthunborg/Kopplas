import { randomUUID } from "node:crypto";
import { encodeCalendarFeed } from "@/features/calendar-feed/icalendar";
import { isCalendarFeedToken } from "@/features/calendar-feed/validation";
import type { CalendarFeedEvent } from "@/features/calendar-feed/types";
import { createSupabasePublicClient } from "@/server/db/supabase-public-client";
import { feedKeyFromEnv, FEED_SCHEMA, FETCH_DOMAIN, hashFeedToken, signFeedProof } from "./attestation";
import { feedPlatformIpTrustEnabled, hashFeedIp, resolveTrustedFeedIp } from "./trusted-ip";

const securityHeaders = {
  "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache", Expires: "0",
  "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow",
};
export type FeedRpcClient = { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }> };
function reply(status: number, body: string, retry?: number): Response {
  console.info(JSON.stringify({ event: "calendar_feed.response", status }));
  return new Response(body, { status, headers: { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8", ...(retry ? { "Retry-After": String(retry) } : {}) } });
}
function eventsFromResult(value: unknown): CalendarFeedEvent[] {
  if (!Array.isArray(value)) throw new Error("Calendar unavailable");
  return value.map(raw => {
    if (!raw || typeof raw !== "object") throw new Error("Calendar unavailable");
    const row = raw as Record<string, unknown>;
    if (Object.keys(row).some(k => !["id", "startsAt", "endsAt", "allDay", "updatedAt", "title", "jobLabel", "customerLabel", "location"].includes(k)) ||
      ["id", "startsAt", "endsAt", "updatedAt", "title"].some(k => typeof row[k] !== "string") || typeof row.allDay !== "boolean" ||
      ["jobLabel", "customerLabel", "location"].some(k => row[k] !== undefined && typeof row[k] !== "string")) throw new Error("Calendar unavailable");
    return row as CalendarFeedEvent;
  });
}
/** Test seams are server-only dependencies, never request/query/header options. */
export async function publicCalendarFeed(raw: string, headers: Headers, dependencies: {
  client?: FeedRpcClient; trustedIp?: string | null; now?: Date;
} = {}): Promise<Response> {
  try {
    const key = feedKeyFromEnv(), now = dependencies.now ?? new Date();
    const address = "trustedIp" in dependencies ? dependencies.trustedIp ?? null : resolveTrustedFeedIp(Object.fromEntries(headers.entries()), feedPlatformIpTrustEnabled());
    const tokenHash = isCalendarFeedToken(raw) ? hashFeedToken(raw) : "0".repeat(64), ipHash = hashFeedIp(address, key.secret);
    const claims = { schema: FEED_SCHEMA, domain: FETCH_DOMAIN, operation: "fetch", tokenHash, ipHash, requestId: randomUUID(), keyId: key.keyId,
      issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 60000).toISOString() };
    const { data, error } = await (dependencies.client ?? createSupabasePublicClient()).rpc("fetch_calendar_feed", { p_token_hash: tokenHash, p_ip_hash: ipHash, p_claims: claims, p_signature: signFeedProof(claims, key.secret) });
    if (error || !data || typeof data !== "object") return reply(503, "Kalendern är tillfälligt otillgänglig.");
    const result = data as Record<string, unknown>;
    if (result.status === 404) return reply(404, "Kalenderlänken är inte aktiv.");
    if (result.status === 429 && Number.isInteger(result.retryAfter) && Number(result.retryAfter) >= 1 && Number(result.retryAfter) <= 900) return reply(429, "För många förfrågningar. Försök igen senare.", Number(result.retryAfter));
    if (result.status !== 200) return reply(503, "Kalendern är tillfälligt otillgänglig.");
    // Finish validation and serialization before a single response byte is emitted.
    const calendar = new TextEncoder().encode(encodeCalendarFeed(eventsFromResult(result.events)));
    console.info(JSON.stringify({ event: "calendar_feed.response", status: 200 }));
    return new Response(new ReadableStream({ start(controller) { controller.enqueue(calendar); controller.close(); } }), {
      status: 200, headers: { ...securityHeaders, "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'inline; filename="min-kalender.ics"' },
    });
  } catch { return reply(503, "Kalendern är tillfälligt otillgänglig."); }
}
