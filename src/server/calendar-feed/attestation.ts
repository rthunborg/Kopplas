// SERVER-ONLY: dedicated feed key. Proofs, tokens and keys must never be logged.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isCalendarFeedToken } from "@/features/calendar-feed/validation";
export const FEED_SCHEMA = "kopplas.calendar-feed.v1";
export const FETCH_DOMAIN = "kopplas.calendar-feed.fetch.v1";
export const MANAGE_DOMAIN = "kopplas.calendar-feed.manage.v1";
export const FETCH_FIELDS = ["schema", "domain", "operation", "tokenHash", "ipHash", "requestId", "keyId", "issuedAt", "expiresAt"] as const;
export const MANAGE_FIELDS = ["schema", "domain", "operation", "tenantId", "actorId", "membershipId", "revision", "attemptId", "newHash", "correlationId", "keyId", "issuedAt", "expiresAt"] as const;
export type FeedClaims = Readonly<Record<string, string>>;
export function canonicalFeedProof(fields: FeedClaims): Uint8Array {
  const names = fields.operation === "fetch" ? FETCH_FIELDS : MANAGE_FIELDS;
  return Buffer.concat(names.map(name => { const bytes = Buffer.from(fields[name] ?? "", "utf8"); return Buffer.concat([Buffer.from(`${bytes.length}:`, "ascii"), bytes]); }));
}
export function acceptsFeedKey(secret: string | undefined): secret is string {
  if (!secret || !/^[A-Za-z0-9_-]+$/.test(secret)) return false;
  const bytes = Buffer.from(secret, "base64url");
  return bytes.length >= 32 && bytes.toString("base64url") === secret;
}
export function feedKeyFromEnv(): { keyId: string; secret: string } {
  const keyId = process.env.CALENDAR_FEED_ATTESTATION_KEY_ID, secret = process.env.CALENDAR_FEED_ATTESTATION_SECRET;
  if (!keyId || !/^[A-Za-z0-9_-]{1,64}$/.test(keyId) || !acceptsFeedKey(secret)) throw new Error("Calendar unavailable");
  return { keyId, secret };
}
export function signFeedProof(fields: FeedClaims, secret: string): string {
  if (!acceptsFeedKey(secret)) throw new Error("Calendar unavailable");
  return createHmac("sha256", Buffer.from(secret, "base64url")).update(canonicalFeedProof(fields)).digest("hex");
}
export function verifyFeedProof(fields: FeedClaims, signature: string, secret: string, now = new Date().toISOString()): boolean {
  try {
    const time = Date.parse(now), issued = Date.parse(fields.issuedAt), expires = Date.parse(fields.expiresAt);
    const names: readonly string[] = fields.operation === "fetch" ? FETCH_FIELDS : MANAGE_FIELDS;
    if (Object.keys(fields).length !== names.length || names.some(name => typeof fields[name] !== "string") || Object.keys(fields).some(name => !names.includes(name))) return false;
    if (fields.schema !== FEED_SCHEMA || fields.domain !== (fields.operation === "fetch" ? FETCH_DOMAIN : MANAGE_DOMAIN) || !Number.isFinite(time) || !Number.isFinite(issued) || !Number.isFinite(expires) || issued > time || expires <= time || expires <= issued || expires - issued > 60000 || !/^[0-9a-f]{64}$/.test(signature)) return false;
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(signFeedProof(fields, secret), "hex"));
  } catch { return false; }
}
export function issueCalendarFeedToken(entropy: (length: number) => Uint8Array = randomBytes): { raw: string; hash: string } {
  const bytes = entropy(32); if (bytes.length !== 32) throw new Error("Calendar unavailable");
  const raw = Buffer.from(bytes).toString("base64url"); return { raw, hash: hashFeedToken(raw) };
}
export function hashFeedToken(raw: string): string {
  if (!isCalendarFeedToken(raw)) throw new Error("Calendar unavailable");
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
