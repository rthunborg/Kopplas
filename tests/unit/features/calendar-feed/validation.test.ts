import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

/** P5 binds these test-side operations to actual T1/T3 exports, without changing
 * the independent vectors. No production API names or fallback implementation. */
type ValidationDriver = { accepts(raw: string): boolean; issue(entropy: (length: number) => Uint8Array): { raw: string; hash: string } };
async function driver(): Promise<ValidationDriver> { const { isCalendarFeedToken } = await import("@/features/calendar-feed/validation"); const { issueCalendarFeedToken } = await import("@/server/calendar-feed/attestation"); return { accepts: isCalendarFeedToken, issue: issueCalendarFeedToken }; }
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-006 AC1 issuance requests 32 entropy bytes and stores independent SHA256 only", async () => {
  const subject = await driver(), lengths: number[] = [];
  const bytes = Uint8Array.from({ length: 32 }, (_, i) => i);
  const issued = subject.issue(length => { lengths.push(length); return bytes; });
  assert.deepEqual(lengths, [32]);
  assert.equal(issued.raw, Buffer.from(bytes).toString("base64url"));
  assert.equal(issued.raw.length, 43);
  assert.equal(issued.hash, createHash("sha256").update(issued.raw).digest("hex"));
  assert.notEqual(issued.hash, issued.raw);
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-007 AC1 AC4 canonical token shape rejects padding, encodings, identity and path tricks", async () => {
  const subject = await driver();
  const canonical = Buffer.alloc(32, 255).toString("base64url");
  assert.equal(subject.accepts(canonical), true);
  for (const bad of ["", canonical + "=", canonical.slice(1), canonical + "A", "a".repeat(43),
    canonical.replace(/.$/, "_"), "7a8d34bb-e453-4172-923d-e2a0e46cfb90", `%2f${canonical}`, `${canonical}/x`, ` ${canonical}`, `${canonical}\n`, "å".repeat(43)]) {
    // 'a'*43 and the altered final char have noncanonical unused base64 bits.
    assert.equal(subject.accepts(bad), false, "noncanonical capability accepted");
  }
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-008 AC1 failed entropy never derives capability from an identity or timestamp", async () => {
  const subject = await driver();
  assert.throws(() => subject.issue(() => { throw new Error("owned entropy failure"); }));
  assert.throws(() => subject.issue(() => new Uint8Array(31)));
});
