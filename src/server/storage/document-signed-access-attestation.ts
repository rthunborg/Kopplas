// SERVER-ONLY. `node:crypto` makes accidental client bundling fail at build time.
// This module attests the exact response returned by caller-RLS Storage signing;
// it does not issue URLs and does not grant file access.
import { createHmac, timingSafeEqual } from "node:crypto";

import { quotePdfAttestationSecretFromEnv } from "@/server/quote-pdf/attestation";
import { MAX_SIGNED_URL_TTL_SECONDS } from "./signed-access";

export const DOCUMENT_SIGNED_ACCESS_ATTESTATION_DOMAIN =
  "elpro.document-selected-link-signed-access.audit-attestation.v1";
export const DOCUMENT_SIGNED_ACCESS_KEY_DERIVATION_DOMAIN =
  "elpro.document-selected-link-signed-access.audit-key.v1";
export const DOCUMENT_SIGNED_ACCESS_COMMAND = "document.signedAccess.create";
export const DOCUMENT_SIGNED_ACCESS_EVENT = "document.signed_access.created";
export const DOCUMENT_SIGNED_ACCESS_TARGET_TYPE = "file";
export const DOCUMENT_SIGNED_ACCESS_PURPOSE =
  "record-selected-link-success-after-storage-signing";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HEX_SHA256_RE = /^[0-9a-f]{64}$/;
const KEY_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ISO_MILLIS_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const DB_CLOCK_SKEW_MS = 60 * 1000;
const URL_EXPIRY_SKEW_MS = 60 * 1000;

export interface DocumentSignedAccessAttestationPayload {
  readonly tenantId: string;
  readonly actorUserId: string;
  readonly linkId: string;
  readonly fileId: string;
  readonly ownerType: string;
  readonly ownerId: string;
  readonly linkPurpose: string;
  readonly bucketId: string;
  readonly objectPath: string;
  readonly correlationId: string;
  readonly signedUrlSha256: string;
  readonly signedUrlExpiresAt: string;
  readonly keyId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export interface DocumentSignedAccessAuditChallenge {
  readonly linkId: string;
  readonly fileId: string;
  readonly ownerType: string;
  readonly ownerId: string;
  readonly linkPurpose: string;
  readonly bucketId: string;
  readonly objectPath: string;
  readonly keyId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

function canonicalLengthPrefixedBytes(values: readonly string[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks = values.map((value) => {
    const encoded = encoder.encode(value);
    const prefix = encoder.encode(`${encoded.byteLength}:`);
    const chunk = new Uint8Array(prefix.byteLength + encoded.byteLength);
    chunk.set(prefix);
    chunk.set(encoded, prefix.byteLength);
    return chunk;
  });
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const canonical = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    canonical.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return canonical;
}

/** Canonical bytes mirrored exactly by the private PostgreSQL payload helper. */
export function canonicalDocumentSignedAccessAttestationBytes(
  payload: DocumentSignedAccessAttestationPayload,
): Uint8Array {
  return canonicalLengthPrefixedBytes([
    DOCUMENT_SIGNED_ACCESS_ATTESTATION_DOMAIN,
    DOCUMENT_SIGNED_ACCESS_COMMAND,
    DOCUMENT_SIGNED_ACCESS_EVENT,
    DOCUMENT_SIGNED_ACCESS_TARGET_TYPE,
    DOCUMENT_SIGNED_ACCESS_PURPOSE,
    payload.tenantId,
    payload.actorUserId,
    payload.linkId,
    payload.fileId,
    payload.ownerType,
    payload.ownerId,
    payload.linkPurpose,
    payload.bucketId,
    payload.objectPath,
    payload.correlationId,
    payload.signedUrlSha256,
    payload.signedUrlExpiresAt,
    payload.keyId,
    payload.issuedAt,
    payload.expiresAt,
  ]);
}

/** Derive a Documents-command-specific key from the already-approved quote-PDF root. */
export function deriveDocumentSignedAccessAttestationKey(
  rootSecret: string,
): Buffer {
  if (rootSecret.length === 0) {
    throw new Error("document signed-access attestation is not configured");
  }
  return createHmac("sha256", rootSecret)
    .update(DOCUMENT_SIGNED_ACCESS_KEY_DERIVATION_DOMAIN, "utf8")
    .digest();
}

export function signDocumentSignedAccessAttestation(
  payload: DocumentSignedAccessAttestationPayload,
  rootSecret: string,
): string {
  assertValidPayload(payload);
  return createHmac(
    "sha256",
    deriveDocumentSignedAccessAttestationKey(rootSecret),
  )
    .update(canonicalDocumentSignedAccessAttestationBytes(payload))
    .digest("hex");
}

/** Exported for server-side golden/tamper tests only. */
export function verifyDocumentSignedAccessAttestation(
  payload: DocumentSignedAccessAttestationPayload,
  rootSecret: string,
  signature: string,
): boolean {
  if (!HEX_SHA256_RE.test(signature)) return false;
  try {
    const expected = Buffer.from(
      signDocumentSignedAccessAttestation(payload, rootSecret),
      "hex",
    );
    const actual = Buffer.from(signature, "hex");
    return (
      expected.byteLength === actual.byteLength &&
      timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

/** Load no new credential: this closes over the existing quote-PDF HMAC root. */
export function documentSignedAccessAttestorFromEnv(): {
  readonly keyId: string;
  sign(payload: DocumentSignedAccessAttestationPayload): string;
} {
  const { keyId, secret } = quotePdfAttestationSecretFromEnv();
  return {
    keyId,
    sign: (payload) => signDocumentSignedAccessAttestation(payload, secret),
  };
}

function canonicalIsoMillis(value: unknown): string | null {
  if (typeof value !== "string" || !ISO_MILLIS_RE.test(value)) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  const canonical = new Date(time).toISOString();
  return canonical === value ? canonical : null;
}

function isSafeObjectPath(
  objectPath: string,
  tenantId: string,
  fileId: string,
): boolean {
  if (
    objectPath.length === 0 ||
    Buffer.byteLength(objectPath, "utf8") > 1024 ||
    objectPath.startsWith("/") ||
    objectPath.includes("//") ||
    /[\u0000-\u001f\u007f]/.test(objectPath)
  ) {
    return false;
  }
  const segments = objectPath.split("/");
  return (
    segments.length === 3 &&
    segments[0] === tenantId &&
    segments[1] === fileId &&
    segments[2] !== "" &&
    segments.every((segment) => segment !== "." && segment !== "..")
  );
}

/**
 * Parse the one-row DB challenge and bind it back to the already-loaded selected link and file.
 * Malformed/expired challenges fail closed before Storage signing.
 */
export function parseDocumentSignedAccessAuditChallenge(
  data: unknown,
  expected: {
    readonly tenantId: string;
    readonly linkId: string;
    readonly fileId: string;
    readonly ownerType: string;
    readonly ownerId: string;
    readonly linkPurpose: string;
    readonly bucketId: string;
    readonly objectPath: string;
    readonly keyId: string;
    readonly nowMs?: number;
  },
): DocumentSignedAccessAuditChallenge {
  const row = Array.isArray(data) ? data[0] : data;
  if (
    (Array.isArray(data) && data.length !== 1) ||
    !row ||
    typeof row !== "object"
  ) {
    throw new Error("document signed-access challenge is invalid");
  }
  const raw = row as Record<string, unknown>;
  const linkId = raw.link_id;
  const fileId = raw.file_id;
  const ownerType = raw.owner_type;
  const ownerId = raw.owner_id;
  const linkPurpose = raw.purpose;
  const bucketId = raw.bucket_id;
  const objectPath = raw.object_path;
  const keyId = raw.attestation_key_id;
  const issuedAt = canonicalIsoMillis(raw.attestation_issued_at);
  const expiresAt = canonicalIsoMillis(raw.attestation_expires_at);
  if (
    linkId !== expected.linkId ||
    fileId !== expected.fileId ||
    ownerType !== expected.ownerType ||
    ownerId !== expected.ownerId ||
    linkPurpose !== expected.linkPurpose ||
    !UUID_RE.test(expected.linkId) ||
    !UUID_RE.test(expected.ownerId) ||
    !isDocumentSourcePair(expected.ownerType, expected.linkPurpose) ||
    bucketId !== expected.bucketId ||
    bucketId !== "tenant-files" ||
    objectPath !== expected.objectPath ||
    keyId !== expected.keyId ||
    typeof objectPath !== "string" ||
    typeof keyId !== "string" ||
    !KEY_ID_RE.test(keyId) ||
    !issuedAt ||
    !expiresAt ||
    !UUID_RE.test(expected.tenantId) ||
    !UUID_RE.test(expected.fileId) ||
    !isSafeObjectPath(objectPath, expected.tenantId, expected.fileId)
  ) {
    throw new Error("document signed-access challenge is invalid");
  }
  const issuedMs = Date.parse(issuedAt);
  const expiresMs = Date.parse(expiresAt);
  const nowMs = expected.nowMs ?? Date.now();
  if (
    expiresMs - issuedMs !== CHALLENGE_TTL_MS ||
    issuedMs > nowMs + DB_CLOCK_SKEW_MS ||
    expiresMs <= nowMs
  ) {
    throw new Error("document signed-access challenge is expired or invalid");
  }
  return { linkId: expected.linkId, fileId: expected.fileId, ownerType: expected.ownerType, ownerId: expected.ownerId, linkPurpose: expected.linkPurpose, bucketId, objectPath, keyId, issuedAt, expiresAt };
}

function assertValidPayload(payload: DocumentSignedAccessAttestationPayload): void {
  const issuedAt = canonicalIsoMillis(payload.issuedAt);
  const expiresAt = canonicalIsoMillis(payload.expiresAt);
  const signedUrlExpiresAt = canonicalIsoMillis(payload.signedUrlExpiresAt);
  if (
    !UUID_RE.test(payload.tenantId) ||
    !UUID_RE.test(payload.actorUserId) ||
    !UUID_RE.test(payload.linkId) ||
    !UUID_RE.test(payload.fileId) ||
    !UUID_RE.test(payload.ownerId) ||
    !isDocumentSourcePair(payload.ownerType, payload.linkPurpose) ||
    !UUID_RE.test(payload.correlationId) ||
    payload.bucketId !== "tenant-files" ||
    !isSafeObjectPath(payload.objectPath, payload.tenantId, payload.fileId) ||
    !HEX_SHA256_RE.test(payload.signedUrlSha256) ||
    !KEY_ID_RE.test(payload.keyId) ||
    !issuedAt ||
    !expiresAt ||
    !signedUrlExpiresAt ||
    Date.parse(expiresAt) - Date.parse(issuedAt) !== CHALLENGE_TTL_MS ||
    Date.parse(signedUrlExpiresAt) <= Date.parse(issuedAt) ||
    Date.parse(signedUrlExpiresAt) > Date.parse(issuedAt) + MAX_SIGNED_URL_TTL_SECONDS * 1000 + URL_EXPIRY_SKEW_MS
  ) {
    throw new Error("document signed-access attestation payload is invalid");
  }
}

/** Closed producer-purpose pairs, independent of the selected file's provenance. */
function isDocumentSourcePair(ownerType: string, purpose: string): boolean {
  switch (ownerType) {
    case "customer": case "facility": case "contact": return purpose === "crm_document";
    case "calculation": return purpose === "calculation_attachment";
    case "quote_version": return purpose === "quote_attachment_snapshot" || purpose === "quote_pdf";
    case "quote_acceptance": return purpose === "acceptance_evidence";
    case "job": case "work_order": return purpose === "job_evidence";
    default: return false;
  }
}
