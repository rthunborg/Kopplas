// SERVER ONLY. Resolver proofs and encrypted review receipts have distinct domains.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import { CommandError } from "@/server/commands/command-errors";
export const RESOLUTION_DOMAIN = "kopplas.conflict-resolver.attestation.v1";
export const RESOLUTION_REVIEW_DOMAIN = "kopplas.conflict-resolver.review.v1";
export const RESOLUTION_FIELDS = ["tenantId","actorId","operation","commandId","bookingId","candidateDigest","factDigest",
  "engineVersion","configVersion","correlationId","keyId","issuedAt","expiresAt"] as const;
export type ResolutionClaims = Record<typeof RESOLUTION_FIELDS[number], string>;
export function resolutionProofBytes(claims: ResolutionClaims, body: string): Buffer {
  return Buffer.concat([RESOLUTION_DOMAIN,...RESOLUTION_FIELDS.map(k=>claims[k]),body].map(value=>{
    const bytes=Buffer.from(value,"utf8");return Buffer.concat([Buffer.from(`${bytes.length}:`),bytes]);
  }));
}
export function signResolution(claims: ResolutionClaims, body: string, secret: string): string {
  return createHmac("sha256",secret).update(resolutionProofBytes(claims,body)).digest("hex");
}
const receiptKey=(secret:string)=>createHash("sha256").update(`${RESOLUTION_REVIEW_DOMAIN}\0${secret}`).digest();
export type ResolutionReceipt = { claims: ResolutionClaims; planDigest: string };
export function sealResolutionReceipt(value: ResolutionReceipt, secret: string): string {
  const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",receiptKey(secret),iv);
  cipher.setAAD(Buffer.from(RESOLUTION_REVIEW_DOMAIN));
  return Buffer.concat([iv,...(()=>{const encrypted=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return [cipher.getAuthTag(),encrypted];})()]).toString("base64url");
}
export function openResolutionReceipt(receipt: string, secret: string): ResolutionReceipt {
  try {
    const bytes=Buffer.from(receipt,"base64url");if(bytes.length<29||bytes.length>8192)throw new Error();
    const cipher=createDecipheriv("aes-256-gcm",receiptKey(secret),bytes.subarray(0,12));cipher.setAAD(Buffer.from(RESOLUTION_REVIEW_DOMAIN));cipher.setAuthTag(bytes.subarray(12,28));
    const row=JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString("utf8"));
    if(!row.claims||Object.keys(row.claims).length!==RESOLUTION_FIELDS.length||RESOLUTION_FIELDS.some(k=>typeof row.claims[k]!=="string")||typeof row.planDigest!=="string")throw new Error();
    return row;
  } catch {throw new CommandError("TENANT_ACCESS_DENIED");}
}
