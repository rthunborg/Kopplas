import assert from "node:assert/strict";
import { test } from "node:test";

type IpDriver = { resolve(headers: Record<string, string>, verifiedPlatformContext: boolean): string | null;
  hash(address: string | null): string };
async function driver(): Promise<IpDriver> { const { resolveTrustedFeedIp, hashFeedIp } = await import("@/server/calendar-feed/trusted-ip"); return { resolve: resolveTrustedFeedIp, hash: address => hashFeedIp(address, Buffer.alloc(32, 13).toString("base64url")) }; }
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-015 AC4 AC5 unsigned forwarded headers cannot select an IP bucket", async () => {
  const subject = await driver(), unknown = subject.hash(null);
  const cases: Record<string, string>[] = [{}, { "x-forwarded-for": "192.0.2.1" }, { "x-real-ip": "192.0.2.2" },
    { "x-vercel-forwarded-for": "192.0.2.3" }, { "x-forwarded-for": "192.0.2.4, 198.51.100.2", vercel: "1" }];
  for (const headers of cases) {
    const address = subject.resolve(headers, false);
    assert.equal(address, null); assert.equal(subject.hash(address), unknown);
  }
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-016 AC4 AC5 verified platform canonicalizes single IPv4/IPv6, rejects lists/ports/invalid", async () => {
  const subject = await driver();
  assert.equal(subject.resolve({ "x-vercel-forwarded-for": "2001:0db8:0:0:0:0:0:1" }, true), "2001:db8::1");
  assert.equal(subject.resolve({ "x-vercel-forwarded-for": "192.0.2.7" }, true), "192.0.2.7");
  for (const candidate of ["", "192.0.2.1, 192.0.2.2", "192.0.2.1:443", "[2001:db8::1]:443", "garbage", "999.1.1.1"]) {
    assert.equal(subject.resolve({ "x-vercel-forwarded-for": candidate }, true), null);
  }
});
// Actual implementation binding; independent contract vectors retained.
test("[P0] 15.5-UNIT-017 AC4 AC5 IP HMAC uses canonical domain and shared unknown bucket without raw address", async () => {
  const subject = await driver();
  const canonical = subject.resolve({ "x-vercel-forwarded-for": "2001:0db8:0:0:0:0:0:1" }, true);
  assert.equal(subject.hash(canonical), subject.hash("2001:db8::1"));
  assert.notEqual(subject.hash("192.0.2.1"), subject.hash("192.0.2.2"));
  assert.notEqual(subject.hash(null), subject.hash("192.0.2.1"));
  assert.match(subject.hash(null), /^[a-f0-9]{64}$/);
});
