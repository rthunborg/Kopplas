import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateJobDependency,
  type JobDependencyDates,
} from "@/features/jobs/dependency-warnings";

const identity = {
  prerequisiteJobId: "prerequisite-job",
  dependentJobId: "dependent-job",
};

// 16.1-U08: evaluate a supplied job link, without a graph or persistence layer.
for (const [end, start, status] of [
  ["2026-10-18", "2026-10-17", "warning"],
  ["2026-10-17", "2026-10-17", "clear"],
  ["2026-10-16", "2026-10-17", "clear"],
  ["2026-02-01", "2026-01-31", "warning"],
  ["2027-01-01", "2026-12-31", "warning"],
  ["2024-02-29", "2024-03-01", "clear"],
  ["2024-03-01", "2024-02-29", "warning"],
  ["2026-03-29", "2026-03-30", "clear"],
  ["2026-10-26", "2026-10-25", "warning"],
] as const) {
  test(`planned end ${end} vs start ${start}: ${status}`, () => {
    assert.deepEqual(evaluateJobDependency({
      ...identity,
      prerequisitePlannedEnd: end,
      dependentPlannedStart: start,
    }), { ...identity, status });
  });
}

for (const [end, start, missingDates] of [
  [null, "2026-10-17", ["prerequisitePlannedEnd"]],
  ["2026-10-17", null, ["dependentPlannedStart"]],
  [null, null, ["prerequisitePlannedEnd", "dependentPlannedStart"]],
] as const) {
  test(`missing ${missingDates.join(" and ")} stays explicitly unknown`, () => {
    assert.deepEqual(evaluateJobDependency({
      ...identity,
      prerequisitePlannedEnd: end,
      dependentPlannedStart: start,
    }), { ...identity, status: "unknown", missingDates });
  });
}

test("repeated evaluation preserves frozen inputs and link identity", () => {
  const input: JobDependencyDates = Object.freeze({
    prerequisiteJobId: "job-B",
    dependentJobId: "job-A",
    prerequisitePlannedEnd: "2026-12-31",
    dependentPlannedStart: "2026-01-01",
  });
  const before = { ...input };
  const first = evaluateJobDependency(input);
  assert.deepEqual(first, {
    prerequisiteJobId: "job-B",
    dependentJobId: "job-A",
    status: "warning",
  });
  assert.deepEqual(evaluateJobDependency(input), first);
  assert.deepEqual(input, before);
});

test("unknown results do not share mutable missing-date state", () => {
  const input = Object.freeze({
    ...identity,
    prerequisitePlannedEnd: null,
    dependentPlannedStart: null,
  });
  const first = evaluateJobDependency(input);
  const second = evaluateJobDependency(input);
  assert.deepEqual(first, second);
  if (first.status !== "unknown" || second.status !== "unknown") {
    assert.fail("Missing dates must produce unknown results");
  }
  assert.notStrictEqual(first.missingDates, second.missingDates);
  assert.deepEqual(input, { ...identity, prerequisitePlannedEnd: null, dependentPlannedStart: null });
});
