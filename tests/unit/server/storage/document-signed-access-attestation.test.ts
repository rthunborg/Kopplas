/**
 * Story 20.1 ATDD: fixed selected-link proof contract, E20 P0-07 / AC7.
 * Active red acceptance tests. No server, environment file or DB fixture needed.
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { signFileSignedAccessAttestation } from "@/server/storage/signed-access-attestation";

const ROOT = "local-test-only-quote-pdf-attestation-secret-v1";
const DOMAIN = "elpro.document-selected-link-signed-access.audit-attestation.v1";
const KEY_DOMAIN = "elpro.document-selected-link-signed-access.audit-key.v1";
const ISSUED = "2030-01-02T03:04:05.678Z";
const EXPIRES = "2030-01-02T03:09:05.678Z";
const NOW = Date.parse(ISSUED);
const uid = (n: number) => "00000000-0000-4000-8000-" + n.toString().padStart(12, "0");

interface Payload {
  tenantId: string; actorUserId: string; linkId: string; fileId: string;
  ownerType: string; ownerId: string; linkPurpose: string;
  bucketId: string; objectPath: string; correlationId: string;
  signedUrlSha256: string; signedUrlExpiresAt: string; keyId: string;
  issuedAt: string; expiresAt: string;
}
interface ProofApi {
  canonicalDocumentSignedAccessAttestationBytes(p: Payload): Uint8Array;
  deriveDocumentSignedAccessAttestationKey(root: string): Buffer;
  signDocumentSignedAccessAttestation(p: Payload, root: string): string;
  verifyDocumentSignedAccessAttestation(p: Payload, root: string, signature: string): boolean;
  parseDocumentSignedAccessAuditChallenge(data: unknown, expected: Record<string, unknown>): Record<string, unknown>;
}
async function proofApi(): Promise<ProofApi> {
  const name = "@/server/storage/document-signed-access-attestation";
  return await import(name) as ProofApi;
}
function payload(overrides: Partial<Payload> = {}): Payload {
  return {
    tenantId: uid(1), actorUserId: uid(2), linkId: uid(3), fileId: uid(4),
    ownerType: "customer", ownerId: uid(5), linkPurpose: "crm_document",
    bucketId: "tenant-files", objectPath: uid(1) + "/" + uid(4) + "/räkning.pdf",
    correlationId: uid(6), signedUrlSha256: "a".repeat(64),
    signedUrlExpiresAt: "2030-01-02T03:09:06.000Z",
    keyId: "test_v1", issuedAt: ISSUED, expiresAt: EXPIRES,
    ...overrides,
  };
}
/** Independent acceptance oracle from the reviewed field order and UTF-8 rule. */
function expectedBytes(p: Payload): Buffer {
  const values = [
    DOMAIN, "document.signedAccess.create", "document.signed_access.created",
    "file", "record-selected-link-success-after-storage-signing",
    p.tenantId, p.actorUserId, p.linkId, p.fileId, p.ownerType, p.ownerId,
    p.linkPurpose, p.bucketId, p.objectPath, p.correlationId,
    p.signedUrlSha256, p.signedUrlExpiresAt, p.keyId, p.issuedAt, p.expiresAt,
  ];
  return Buffer.concat(values.map(value => {
    const bytes = Buffer.from(value, "utf8");
    return Buffer.concat([Buffer.from(bytes.length + ":"), bytes]);
  }));
}
function challenge(overrides: Record<string, unknown> = {}) {
  const p = payload();
  return {
    link_id: p.linkId, file_id: p.fileId, owner_type: p.ownerType,
    owner_id: p.ownerId, purpose: p.linkPurpose, bucket_id: p.bucketId,
    object_path: p.objectPath, attestation_key_id: p.keyId,
    attestation_issued_at: p.issuedAt, attestation_expires_at: p.expiresAt,
    ...overrides,
  };
}
function expectedChallenge() {
  const p = payload();
  return { ...p, linkPurpose: p.linkPurpose, nowMs: NOW };
}

test("[P0] 20-P0-07 UTF-8 byte lengths and exact selected-link field order match the reviewed contract", async () => {
  const api = await proofApi();
  assert.deepEqual(Buffer.from(api.canonicalDocumentSignedAccessAttestationBytes(payload())), expectedBytes(payload()));
});
test("[P0] 20-P0-07 derives a separate Documents key under the existing root and signs the exact canonical bytes", async () => {
  const api = await proofApi();
  const expectedKey = createHmac("sha256", ROOT).update(KEY_DOMAIN, "utf8").digest();
  const expectedSignature = createHmac("sha256", expectedKey).update(expectedBytes(payload())).digest("hex");
  assert.deepEqual(api.deriveDocumentSignedAccessAttestationKey(ROOT), expectedKey);
  assert.equal(api.signDocumentSignedAccessAttestation(payload(), ROOT), expectedSignature);
  assert.equal(api.verifyDocumentSignedAccessAttestation(payload(), ROOT, expectedSignature), true);
});

const mutations: ReadonlyArray<readonly [keyof Payload, string]> = [
  ["tenantId", uid(11)], ["actorUserId", uid(12)], ["linkId", uid(13)],
  ["fileId", uid(14)], ["ownerType", "facility"], ["ownerId", uid(15)],
  ["linkPurpose", "calculation_attachment"], ["bucketId", "other-bucket"],
  ["objectPath", uid(1) + "/" + uid(4) + "/other.pdf"], ["correlationId", uid(16)],
  ["signedUrlSha256", "b".repeat(64)], ["signedUrlExpiresAt", "2030-01-02T03:09:07.000Z"],
  ["keyId", "test_v2"], ["issuedAt", "2030-01-02T03:04:06.678Z"],
  ["expiresAt", "2030-01-02T03:09:06.678Z"],
];
for (const [field, value] of mutations) {
  test("[P0] 20-P0-07 changing bound " + field + " cannot reuse a selected-link proof", async () => {
    const api = await proofApi();
    const original = payload();
    const signature = api.signDocumentSignedAccessAttestation(original, ROOT);
    assert.equal(api.verifyDocumentSignedAccessAttestation({ ...original, [field]: value }, ROOT, signature), false);
  });
}
test("[P0] 20-P0-07 generic File and quote proof/key domains cannot substitute for Documents", async () => {
  const api = await proofApi();
  const p = payload();
  const generic = signFileSignedAccessAttestation(p, ROOT);
  const quoteDomainSignature = createHmac("sha256", ROOT).update("elpro.quote-pdf.audit-attestation.v1").update(expectedBytes(p)).digest("hex");
  assert.equal(api.verifyDocumentSignedAccessAttestation(p, ROOT, generic), false);
  assert.equal(api.verifyDocumentSignedAccessAttestation(p, ROOT, quoteDomainSignature), false);
  assert.equal(api.verifyDocumentSignedAccessAttestation(p, ROOT + "-wrong", api.signDocumentSignedAccessAttestation(p, ROOT)), false);
});
for (const signature of ["", "a", "g".repeat(64), "a".repeat(63), "a".repeat(65)]) {
  test("[P0] 20-P0-07 malformed proof fails verification: length " + signature.length, async () => {
    const api = await proofApi();
    assert.equal(api.verifyDocumentSignedAccessAttestation(payload(), ROOT, signature), false);
  });
}
test("[P0] 20-P0-07 empty root cannot create a signing key or proof", async () => {
  const api = await proofApi();
  assert.throws(() => api.deriveDocumentSignedAccessAttestationKey(""));
  assert.throws(() => api.signDocumentSignedAccessAttestation(payload(), ""));
});
test("[P0] 20-P0-07 exactly one DB-owned challenge binds the selected source before Storage issuance", async () => {
  const api = await proofApi();
  const result = api.parseDocumentSignedAccessAuditChallenge([challenge()], expectedChallenge());
  assert.equal(result.linkId, uid(3));
  assert.equal(result.fileId, uid(4));
  assert.equal(result.ownerType, "customer");
  assert.equal(result.ownerId, uid(5));
  assert.equal(result.purpose ?? result.linkPurpose, "crm_document");
  assert.equal(result.objectPath, payload().objectPath);
  assert.equal(result.issuedAt, ISSUED);
  assert.equal(result.expiresAt, EXPIRES);
});
const challengeMutations: ReadonlyArray<readonly [string, unknown]> = [
  ["link_id", uid(23)], ["file_id", uid(24)], ["owner_type", "job"],
  ["owner_id", uid(25)], ["purpose", "job_evidence"], ["bucket_id", "public"],
  ["object_path", uid(11) + "/" + uid(4) + "/evidence.pdf"], ["attestation_key_id", "other"],
  ["attestation_issued_at", "2030-01-02T03:04:05Z"],
  ["attestation_expires_at", "2030-01-02T03:10:05.678Z"],
];
for (const [field, value] of challengeMutations) {
  test("[P0] 20-P0-07 mismatched challenge " + field + " stops before signing", async () => {
    const api = await proofApi();
    assert.throws(() => api.parseDocumentSignedAccessAuditChallenge([challenge({ [field]: value })], expectedChallenge()));
  });
}
for (const invalid of [null, [], [challenge(), challenge()]]) {
  test("[P0] 20-P0-07 null/empty/duplicate challenge is unavailable rather than selecting an arbitrary row " + JSON.stringify(invalid), async () => {
    const api = await proofApi();
    assert.throws(() => api.parseDocumentSignedAccessAuditChallenge(invalid, expectedChallenge()));
  });
}
test("[P0] 20-P0-07 expired and future challenge is rejected; parsing skew does not change five-minute lifetime", async () => {
  const api = await proofApi();
  assert.throws(() => api.parseDocumentSignedAccessAuditChallenge([challenge()], { ...expectedChallenge(), nowMs: Date.parse(EXPIRES) }));
  assert.throws(() => api.parseDocumentSignedAccessAuditChallenge([challenge()], { ...expectedChallenge(), nowMs: NOW - 60_001 }));
});


for (const invalid of [
  { signedUrlExpiresAt: ISSUED },
  { signedUrlExpiresAt: "2030-01-03T03:05:06.679Z" },
  { issuedAt: "2030-01-02T03:04:05Z" },
  { expiresAt: "2030-01-02T03:09:06.678Z" },
  { ownerType: "pending_owner" },
  { linkPurpose: "job_evidence" },
  { objectPath: uid(1) + "/" + uid(4) + "/../a.pdf" },
  { keyId: "bad key" },
]) {
  test("invalid selected-link proof fields fail closed " + JSON.stringify(invalid), async () => {
    const api = await proofApi();
    assert.throws(() => api.signDocumentSignedAccessAttestation(payload(invalid), ROOT));
    assert.equal(api.verifyDocumentSignedAccessAttestation(payload(invalid), ROOT, "a".repeat(64)), false);
  });
}
test("challenge accepts only bounded DB parsing skew without extending actual URL issuance cap", async () => {
  const api = await proofApi();
  assert.ok(api.parseDocumentSignedAccessAuditChallenge([challenge()], { ...expectedChallenge(), nowMs: NOW - 60_000 }));
  assert.throws(() => api.parseDocumentSignedAccessAuditChallenge([challenge()], { ...expectedChallenge(), nowMs: NOW - 60_001 }));
  assert.throws(() => api.parseDocumentSignedAccessAuditChallenge([challenge({ attestation_expires_at: "2030-01-02T03:09:05.679Z" })], expectedChallenge()));
});


function workOrderPayload(overrides: Partial<Payload> = {}): Payload {
  return payload({ ownerType: "work_order", linkPurpose: "job_evidence", ...overrides });
}
function workOrderChallenge(overrides: Record<string, unknown> = {}) {
  return challenge({ owner_type: "work_order", purpose: "job_evidence", ...overrides });
}
test("[16.3][AC05] work-order evidence challenge and proof use the existing exact selected-link bytes and key", async () => {
  const api = await proofApi(), p = workOrderPayload();
  const parsed = api.parseDocumentSignedAccessAuditChallenge([workOrderChallenge()], { ...p, nowMs: NOW });
  assert.equal(parsed.ownerType, "work_order"); assert.equal(parsed.linkPurpose, "job_evidence");
  assert.deepEqual(Buffer.from(api.canonicalDocumentSignedAccessAttestationBytes(p)), expectedBytes(p));
  const expected = createHmac("sha256", api.deriveDocumentSignedAccessAttestationKey(ROOT)).update(expectedBytes(p)).digest("hex");
  assert.equal(api.signDocumentSignedAccessAttestation(p, ROOT), expected);
  assert.equal(api.verifyDocumentSignedAccessAttestation(p, ROOT, expected), true);
});
for (const [field, value] of [["tenantId", uid(81)], ["ownerId", uid(82)], ["linkId", uid(83)],
  ["fileId", uid(84)], ["ownerType", "job"], ["objectPath", uid(1) + "/" + uid(4) + "/different.pdf"]] as const) {
  test("[16.3][AC05] work-order proof cannot be reused for another bound " + field, async () => {
    const api = await proofApi(), p = workOrderPayload();
    const signature = api.signDocumentSignedAccessAttestation(p, ROOT);
    assert.equal(api.verifyDocumentSignedAccessAttestation({ ...p, [field]: value }, ROOT, signature), false);
  });
}
for (const purpose of ["crm_document", "calculation_attachment", "quote_attachment_snapshot", "quote_pdf", "acceptance_evidence"]) {
  test("[16.3][AC05] work-order attestation rejects wrong purpose " + purpose, async () => {
    const api = await proofApi(), p = workOrderPayload({ linkPurpose: purpose });
    assert.throws(() => api.parseDocumentSignedAccessAuditChallenge([workOrderChallenge({ purpose })], { ...p, nowMs: NOW }));
    assert.throws(() => api.signDocumentSignedAccessAttestation(p, ROOT));
    assert.equal(api.verifyDocumentSignedAccessAttestation(p, ROOT, "a".repeat(64)), false);
  });
}
for (const foreign of [{ owner_id: uid(85) }, { link_id: uid(86) }, { file_id: uid(87) },
  { object_path: uid(88) + "/" + uid(4) + "/evidence.pdf" }]) {
  test("[16.3][AC05] work-order challenge rejects foreign selected identity " + Object.keys(foreign)[0], async () => {
    const api = await proofApi();
    assert.throws(() => api.parseDocumentSignedAccessAuditChallenge([workOrderChallenge(foreign)], { ...workOrderPayload(), nowMs: NOW }));
  });
}
