// SERVER ONLY. Separate protocols prevent single-booking or job-card proof reuse.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import { recurrenceLimits } from "@/features/scheduling/recurrence";
import { CommandError } from "@/server/commands/command-errors";
export const SERIES_ATTESTATION_DOMAIN = "kopplas.booking-series.attestation.v1";
export const SERIES_REVIEW_DOMAIN = "kopplas.booking-series.review.v1";
export const SERIES_CLAIM_FIELDS = ["tenantId", "actorId", "operation", "commandId", "seriesId", "candidateDigest", "factDigest",
  "engineVersion", "configVersion", "correlationId", "keyId", "issuedAt", "expiresAt"] as const;
export type SeriesClaims = Record<typeof SERIES_CLAIM_FIELDS[number], string>;
export function seriesProofBytes(domain: string, claims: SeriesClaims, body: string): Buffer {
  return Buffer.concat([domain, ...SERIES_CLAIM_FIELDS.map(key => claims[key]), body].map(value => {
    const bytes = Buffer.from(value, "utf8"); return Buffer.concat([Buffer.from(`${bytes.length}:`, "ascii"), bytes]);
  }));
}
export function signSeries(domain: string, claims: SeriesClaims, body: string, secret: string): string {
  return createHmac("sha256", secret).update(seriesProofBytes(domain, claims, body)).digest("hex");
}
export type SeriesReceipt = { claims: SeriesClaims; groups: import("./conflict-facts").LogicalConflictGroup[] };
const receiptKey = (secret: string) => createHash("sha256").update(`${SERIES_REVIEW_DOMAIN}\0${secret}`).digest();
export function sealSeriesReceipt(value: SeriesReceipt, secret: string): string {
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text, "utf8") + 28 > recurrenceLimits.maxReceiptBytes) throw new CommandError("VALIDATION_FAILED");
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", receiptKey(secret), iv);
  cipher.setAAD(Buffer.from(SERIES_REVIEW_DOMAIN));
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
export function openSeriesReceipt(receipt: string, secret: string): SeriesReceipt {
  try {
    const bytes = Buffer.from(receipt, "base64url");
    if (bytes.length < 29 || bytes.length > recurrenceLimits.maxReceiptBytes) throw new Error();
    const decipher = createDecipheriv("aes-256-gcm", receiptKey(secret), bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from(SERIES_REVIEW_DOMAIN)); decipher.setAuthTag(bytes.subarray(12, 28));
    const value = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8"));
    if (!value?.claims || !Array.isArray(value.groups) || SERIES_CLAIM_FIELDS.some(key => typeof value.claims[key] !== "string")) throw new Error();
    return value;
  } catch { throw new CommandError("TENANT_ACCESS_DENIED"); }
}
