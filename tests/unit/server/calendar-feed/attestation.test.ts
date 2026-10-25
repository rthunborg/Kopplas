import assert from "node:assert/strict";
import { test } from "node:test";

/** Test-side adapter shape only. P5 must use actual dedicated feed proof code,
 * supply a synthetic test key in memory, and prove TS/SQL parity in the DB lane. */
type ProofDriver = { canonical(fields: Record<string, string>): Uint8Array;
  sign(fields: Record<string, string>): string;
  verify(fields: Record<string, string>, proof: string, now?: string): boolean;
  acceptsKey(value: string | undefined): boolean };
async function driver(): Promise<ProofDriver> {
  const actual = await import("@/server/calendar-feed/attestation"), secret = Buffer.alloc(32, 17).toString("base64url");
  return { canonical: actual.canonicalFeedProof, sign: fields => actual.signFeedProof(fields, secret),
    verify: (fields, proof, now = "2026-10-20T08:00:15Z") => actual.verifyFeedProof(fields, proof, secret, now), acceptsKey: actual.acceptsFeedKey };
}
// Conceptual test adapter fields, mapped to the actual canonical schema in P5.
// Public fetch deliberately has no tenant/membership/actor override.
const claims = () => ({ tokenHash: "1".repeat(64), ipHash: "2".repeat(64), operation: "fetch",
  issuedAt: "2026-10-20T08:00:00Z", expiresAt: "2026-10-20T08:00:30Z", keyId: "owned-unit-only",
  requestId: "a3c7bc0b-c420-409a-82bf-caf64b171d0a", schema: "kopplas.calendar-feed.v1", domain: "kopplas.calendar-feed.fetch.v1" });
const lifecycleClaims = () => ({ tenantId: "c7a73192-aef8-4534-a8c4-6a210f397008",
  membershipId: "38f89e80-f5f5-494a-a63d-c433ed42b2f3", actorId: "d77abbec-5d34-4a37-a24b-8dc40a08a20f",
  attemptId: "a3c7bc0b-c420-409a-82bf-caf64b171d0a", revision: "4", correlationId: "d77abbec-5d34-4a37-a24b-8dc40a08a20f", operation: "rotate", newHash: "3".repeat(64),
  issuedAt: "2026-10-20T08:00:00Z", expiresAt: "2026-10-20T08:00:30Z", keyId: "owned-unit-only",
  schema: "kopplas.calendar-feed.v1", domain: "kopplas.calendar-feed.manage.v1" });
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-012 AC4 AC9 canonical bytes are deterministic, length safe and domain separated", async () => {
  const subject = await driver(), fields = claims();
  assert.deepEqual(subject.canonical(fields), subject.canonical({ ...fields }));
  const unicode = Buffer.from(subject.canonical({ ...fields, keyId: "Å:🔌" })).toString("utf8");
  assert.ok(unicode.includes("7:Å:🔌"), "canonical length prefix must count UTF8 octets");
  assert.ok(unicode.includes(`64:${fields.tokenHash}`));
  assert.notDeepEqual(subject.canonical({ ...fields, keyId: "Å:🔌" }), subject.canonical({ ...fields, keyId: "Å", operation: ":🔌fetch" }));
  const signed = subject.sign(fields);
  assert.equal(subject.verify(fields, signed, "2026-10-20T08:00:15Z"), true);
  for (const domain of ["booking-conflicts", "document-signed-access", "tenant-provisioning"]) {
    assert.equal(subject.verify({ ...fields, domain }, signed), false);
  }
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-013 AC4 every token/IP/lifecycle/proof field mutation invalidates signature", async () => {
  const subject = await driver();
  for (const fields of [claims(), lifecycleClaims()]) {
    const proof = subject.sign(fields);
    for (const [field, value] of Object.entries(fields)) {
      assert.equal(subject.verify({ ...fields, [field]: `${value}changed` }, proof), false, `unbound field ${field}`);
    }
    for (const invalid of ["", proof + "=", proof.slice(1), "0".repeat(64), "🚫"]) assert.equal(subject.verify(fields, invalid), false);
  }
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-014 AC4 AC9 dedicated key missing/short/badly encoded fails closed", async () => {
  const subject = await driver();
  for (const key of [undefined, "", "borrowed-secret", Buffer.alloc(31).toString("base64url"), "!".repeat(43)]) {
    assert.equal(subject.acceptsKey(key), false);
  }
  assert.equal(subject.acceptsKey(Buffer.alloc(32, 11).toString("base64url")), true);
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-021 AC4 proof expires, rejects future issuance and lifetime over sixty seconds", async () => {
  const subject = await driver(), fields = claims(), proof = subject.sign(fields);
  assert.equal(subject.verify(fields, proof, "2026-10-20T08:00:31Z"), false);
  assert.equal(subject.verify(fields, proof, "2026-10-20T07:59:59Z"), false);
  const tooLong = { ...fields, expiresAt: "2026-10-20T08:01:01Z" };
  assert.equal(subject.verify(tooLong, subject.sign(tooLong), "2026-10-20T08:00:15Z"), false);
});
