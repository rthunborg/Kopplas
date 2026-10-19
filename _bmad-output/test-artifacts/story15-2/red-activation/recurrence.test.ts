import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { baseRule, loadRecurrenceBindings, persistedSlot, type Rule, type Slot } from "../../../../tests/support/booking-series-unit-atdd";

// RED: T1 production recurrence module is absent. Activate only current task cases.
// Golden expectations are independent data, never computed through the SUT.
const golden = JSON.parse(await readFile(new URL("../../../../tests/fixtures/golden/scheduling/recurrence.json", import.meta.url), "utf8")) as {
  cases: { name: string; input: Rule; expected: Slot[] }[];
};
describe("15.2 pure bounded calendar recurrence — AC1", () => {
  for (const sample of golden.cases) {
    test("[P0] TEA15.2-UNIT-001 " + sample.name, async () => {
      // Given a finite local calendar preset and independently pinned UTC endpoints.
      const b = await loadRecurrenceBindings();
      // When the shared production expansion executes.
      const result = b.expandRecurrence(sample.input);
      // Then full materialization and first-ten projection use that exact schedule.
      assert.equal(result.ok, true);
      if (!result.ok) throw new Error("Expected valid golden");
      assert.deepEqual(result.occurrences, sample.expected);
      assert.deepEqual(result.preview, sample.expected.slice(0, 10));
    });
  }
  const invalid: [string, Record<string, unknown>][] = [
    ["unbounded", { count: undefined }],
    ["both-end-conditions", { count: 3, untilDate: "2026-10-20" }],
    ["zero-count", { count: 0 }], ["negative-count", { count: -1 }],
    ["fractional-count", { count: 1.5 }], ["nonfinite-count", { count: Infinity }],
    ["nan-count", { count: NaN }],
    ["unsafe-count", { count: Number.MAX_SAFE_INTEGER + 1 }],
    ["empty-weekdays", { preset: "weekly", weekdays: [] }],
    ["invalid-iso-weekday", { preset: "weekly", weekdays: [0, 8] }],
    ["invalid-until-date", { count: undefined, untilDate: "2026-02-30" }],
    ["end-before-start", { count: undefined, untilDate: "2026-10-11" }],
    ["unsupported-preset", { preset: "rrule" }],
    ["invalid-local-date", { startDate: "2026-02-30" }],
    ["nonpositive-interval", { endTime: "07:00:00", endDayOffset: 0 }],
  ];
  for (const [name, patch] of invalid) {
    test("[P0] TEA15.2-UNIT-001 rejects " + name + " without partial occurrences", async () => {
      // Given a malformed/unbounded rule, when expanded, then return failure only.
      const b = await loadRecurrenceBindings();
      const result = b.expandRecurrence(baseRule(patch));
      assert.equal(result.ok, false);
      assert.equal(Object.hasOwn(result, "occurrences"), false);
    });
  }
  test("[P0] TEA15.2-UNIT-002 gap-converted nonpositive endpoint rejects entire series with local date", async () => {
    const b = await loadRecurrenceBindings();
    // Both local gap endpoints map to first valid 03:00; no zero-length row may escape.
    const result = b.expandRecurrence(baseRule({ startDate: "2026-03-28", startTime: "02:15:00", endTime: "02:45:00", count: 3 }));
    assert.equal(result.ok, false);
    if (result.ok) throw new Error("Expected entire candidate rejection");
    assert.equal(result.localDate, "2026-03-29");
    assert.equal(Object.hasOwn(result, "occurrences"), false);
  });
  test("[P1] TEA15.2-UNIT-001 previews ten while materializing all twelve without truncation", async () => {
    const b = await loadRecurrenceBindings();
    const result = b.expandRecurrence(baseRule({ count: 12 }));
    assert.equal(result.ok, true);
    if (!result.ok) throw new Error("Expected finite expansion");
    assert.equal(result.occurrences.length, 12);
    assert.equal(result.preview.length, 10);
    assert.equal(result.occurrences[11]!.nominalDate, "2026-10-23");
    assert.deepEqual(result.preview, result.occurrences.slice(0, 10));
  });
  test("[P0] TEA15.2-UNIT-001 admits shared bound and rejects bound plus one with no partial rows", async () => {
    const b = await loadRecurrenceBindings();
    const bound = b.recurrenceLimits.maxOccurrences;
    assert.equal(Number.isSafeInteger(bound) && bound > 0, true);
    assert.equal(b.recurrenceLimits.maxCommandBytes <= 3 * 1024 * 1024, true);
    assert.equal(b.recurrenceLimits.maxReceiptBytes <= 750_000, true);
    const admitted = b.expandRecurrence(baseRule({ count: bound }));
    assert.equal(admitted.ok, true);
    if (!admitted.ok) throw new Error("Boundary must be admitted");
    assert.equal(admitted.occurrences.length, bound);
    const rejected = b.expandRecurrence(baseRule({ count: bound + 1 }));
    assert.equal(rejected.ok, false);
    assert.equal(Object.hasOwn(rejected, "occurrences"), false);
  });
});
describe("15.2 immutable nominal identity reconciliation — AC4/AC5", () => {
  test("[P0] TEA15.2-UNIT-002 rule omission retains exceptional slot outside generated dates", async () => {
    const b = await loadRecurrenceBindings();
    const exception = persistedSlot({ isException: true, description: "Protected omitted date" });
    const introduced = { nominalDate: "2026-10-13", startsAt: "2026-10-13T05:00:00.000000Z", endsAt: "2026-10-13T06:00:00.000000Z" };
    const result = b.reconcileOccurrences({ existing: [exception], proposed: [introduced], sourceSeriesId: "source-series" });
    assert.deepEqual(result.retained, [exception]);
    assert.deepEqual(result.generated, [introduced]);
    assert.deepEqual(result.tombstones, []);
  });
  test("[P0] TEA15.2-UNIT-002 retains exception omitted by new rule and suppresses same nominal replacement", async () => {
    const b = await loadRecurrenceBindings();
    const changed = persistedSlot({ isException: true, description: "Hand-edited", startsAt: "2026-10-14T10:00:00.000000Z", endsAt: "2026-10-14T11:00:00.000000Z" });
    const result = b.reconcileOccurrences({ existing: [changed], proposed: [
      { nominalDate: changed.nominalDate, startsAt: "2026-10-12T07:00:00.000000Z", endsAt: "2026-10-12T08:00:00.000000Z" },
    ], sourceSeriesId: "source-series" });
    assert.deepEqual(result.retained, [changed]);
    assert.deepEqual(result.generated, []);
  });
  test("[P0] TEA15.2-UNIT-002 cancelled slot tombstone never regenerates", async () => {
    const b = await loadRecurrenceBindings();
    const cancelled = persistedSlot({ isException: true, status: "cancelled" });
    const result = b.reconcileOccurrences({ existing: [cancelled], proposed: [cancelled], sourceSeriesId: "source-series" });
    assert.deepEqual(result.retained, [cancelled]);
    assert.deepEqual(result.generated, []);
  });
  test("[P0] TEA15.2-UNIT-002 removed generated slot becomes cancelled exceptional tombstone", async () => {
    const b = await loadRecurrenceBindings(); const original = persistedSlot();
    const result = b.reconcileOccurrences({ existing: [original], proposed: [], sourceSeriesId: "source-series" });
    assert.deepEqual(result.tombstones, [{ ...original, isException: true, status: "cancelled" }]);
  });
  test("[P0] TEA15.2-UNIT-002 split pivot uses nominal date despite exception actual start moving into prefix", async () => {
    const b = await loadRecurrenceBindings();
    const prefix = persistedSlot({ nominalDate: "2026-10-12" });
    const pivot = persistedSlot({ nominalDate: "2026-10-19", isException: true, startsAt: "2026-10-11T05:00:00.000000Z", endsAt: "2026-10-11T06:00:00.000000Z" });
    const suffix = persistedSlot({ nominalDate: "2026-10-20", startsAt: "2026-10-20T05:00:00.000000Z", endsAt: "2026-10-20T06:00:00.000000Z" });
    const result = b.reconcileOccurrences({ existing: [prefix, pivot, suffix], proposed: [pivot, suffix],
      sourceSeriesId: "source-series", successorSeriesId: "successor-series", pivotOccurrenceId: pivot.id });
    assert.deepEqual(result.prefix, [prefix]);
    assert.deepEqual(result.suffix, [pivot, suffix].map(row => ({ ...row, seriesId: "successor-series" })));
    assert.deepEqual(result.generated, []);
  });
});

