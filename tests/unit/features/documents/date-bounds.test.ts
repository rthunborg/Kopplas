/** Story20.2 AC1 RED. Proposed documentDateBounds({from?,to?}) Result<{fromUtc,toUtc}> in assigned date-bounds.ts; null = unbounded. */
import test from "node:test";
import assert from "node:assert/strict";

test.skip("[P1][AC1] genuine Gregorian days reject impossible, noncanonical and reversed ranges", async () => {
  const path = "@/features/documents/date-bounds";
  const { documentDateBounds } = await import(path);
  for (const input of [{ from: "2026-02-29" }, { to: "2026-04-31" }, { from: "2026-3-29" }, { to: "2026-01-01T00:00:00Z" }, { from: "2026-10-26", to: "2026-10-25" }]) {
    const result = documentDateBounds(input);
    assert.equal(result.ok, false);
    assert.equal(result.code, "VALIDATION_FAILED");
    assert.equal("data" in result, false);
  }
});
test.skip("[P1][AC1] inclusive Stockholm spring DST day has a23-hour UTC half-open interval", async () => {
  const path = "@/features/documents/date-bounds";
  const { documentDateBounds } = await import(path);
  const result = documentDateBounds({ from: "2026-03-29", to: "2026-03-29" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, { fromUtc: "2026-03-28T23:00:00.000Z", toUtc: "2026-03-29T22:00:00.000Z" });
  assert.equal(Date.parse(result.data.toUtc) - Date.parse(result.data.fromUtc), 23 * 60 * 60 * 1000);
});
test.skip("[P1][AC1] inclusive Stockholm autumn DST day has a25-hour UTC half-open interval", async () => {
  const path = "@/features/documents/date-bounds";
  const { documentDateBounds } = await import(path);
  const result = documentDateBounds({ from: "2026-10-25", to: "2026-10-25" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, { fromUtc: "2026-10-24T22:00:00.000Z", toUtc: "2026-10-25T23:00:00.000Z" });
  assert.equal(Date.parse(result.data.toUtc) - Date.parse(result.data.fromUtc), 25 * 60 * 60 * 1000);
});
test.skip("[P1][AC1] empty and independently optional dates are unbounded and leap day is valid", async () => {
  const path = "@/features/documents/date-bounds";
  const { documentDateBounds } = await import(path);
  assert.deepEqual(documentDateBounds({ from: "", to: "" }).data, { fromUtc: null, toUtc: null });
  assert.deepEqual(documentDateBounds({ from: "2024-02-29" }).data, { fromUtc: "2024-02-28T23:00:00.000Z", toUtc: null });
  assert.deepEqual(documentDateBounds({ to: "2024-02-29" }).data, { fromUtc: null, toUtc: "2024-02-29T23:00:00.000Z" });
});
