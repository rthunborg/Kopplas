/** Exact input contracts: independent minute, Gregorian-date and bounded-note oracles. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { isReportDate, normalizeReportNote, parseReportHours } from "@/features/time-reports/validation";

test("[P1] 15.4-UNIT-001 AC6 locale decimal hours preserve exact whole minutes", async () => {
  for (const [input, minutes] of [["1", 60], ["1,25", 75], ["1.25", 75], ["0.05", 3], ["0,1", 6], ["12.5", 750], ["35791394", 2147483640]] as const) {
    assert.equal(parseReportHours(input), minutes, input);
  }
});

test("[P0] 15.4-UNIT-002 AC6 rejects nonminute zero negative nonfinite and integer overflow without rounding", async () => {
  for (const input of ["", "0", "-1", "0.01", "1.001", "NaN", "Infinity", "1e3", "1,2.3", "35791395"]) {
    assert.equal(parseReportHours(input), null, input);
  }
});

test("[P1] 15.4-UNIT-003 AC6 real Gregorian report dates include leap day and exclude rollover", async () => {
  for (const date of ["2028-02-29", "2026-10-20", "2026-12-31"]) assert.equal(isReportDate(date), true, date);
  for (const date of ["2026-02-29", "2026-02-30", "2026-04-31", "2026-13-01", "0000-01-01", "2026-1-01", "2026-10-20T00:00:00Z"]) assert.equal(isReportDate(date), false, date);
});

test("[P1] 15.4-UNIT-004 AC1 AC6 bounded note normalization clears blanks without truncating meaning", async () => {
  assert.deepEqual(normalizeReportNote("  Kabeldragning  "), { ok: true, value: "Kabeldragning" });
  assert.deepEqual(normalizeReportNote(" \n\t "), { ok: true, value: null });
  assert.deepEqual(normalizeReportNote("a".repeat(2000)), { ok: true, value: "a".repeat(2000) });
  assert.equal(normalizeReportNote("a".repeat(2001)).ok, false);
});
