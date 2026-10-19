// SERVER-ONLY. A separate domain prevents booking/card cross-protocol reuse.
import { createHmac } from "node:crypto";
import { bookingConflictKeyFromEnv, CONFLICT_CLAIM_FIELDS, type ConflictClaims } from "@/server/bookings/conflict-attestation";
export const JOB_CARD_PROOF_DOMAIN = "kopplas.job-card.attestation.v1";
export function canonicalJobCardProofBytes(claims: ConflictClaims, output: string): Uint8Array {
  return Buffer.concat([JOB_CARD_PROOF_DOMAIN, ...CONFLICT_CLAIM_FIELDS.map((field) => claims[field]), output].map((value) => {
    const bytes = Buffer.from(value, "utf8");
    return Buffer.concat([Buffer.from(`${bytes.byteLength}:`, "ascii"), bytes]);
  }));
}
export const jobCardKeyFromEnv = bookingConflictKeyFromEnv;
export function signJobCardOutput(claims: ConflictClaims, output: string, secret: string): string {
  return createHmac("sha256", secret).update(canonicalJobCardProofBytes(claims, output)).digest("hex");
}
