import { isIP } from "node:net";
import { createHmac } from "node:crypto";
import { acceptsFeedKey } from "./attestation";
export function resolveTrustedFeedIp(headers: Readonly<Record<string, string>>, verifiedPlatformContext: boolean): string | null {
  if (!verifiedPlatformContext) return null;
  const value = headers["x-vercel-forwarded-for"];
  if (!value || value !== value.trim() || !isIP(value) || value.includes("%")) return null;
  if (isIP(value) === 4) return value;
  // WHATWG canonical IPv6 serialization normalizes equivalent textual addresses.
  try { return new URL(`http://[${value}]/`).hostname.slice(1, -1); } catch { return null; }
}
export function hashFeedIp(address: string | null, secret: string): string {
  if (!acceptsFeedKey(secret)) throw new Error("Calendar unavailable");
  return createHmac("sha256", Buffer.from(secret, "base64url")).update("kopplas.calendar-feed.ip.v1\0").update(address ?? "unknown").digest("hex");
}
/** Hosted trust is deliberately off until release operations verifies the topology. */
export function feedPlatformIpTrustEnabled(): boolean {
  return process.env.VERCEL === "1" && process.env.CALENDAR_FEED_VERIFIED_VERCEL_IP === "1";
}
