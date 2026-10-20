/** Story 16.4 AC05/TR14. Approved allocation arithmetic, not a test-side engine.
 * Proposed evaluateJobDemandAdvisory binding is replaceable; production interval
 * preparation remains the oracle. All fixtures are canonical synthetic facts.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareDailyCapacity } from "@/features/scheduling/capacity";
import { DEFAULT_SCHEDULING_RULES, type SchedulingBooking, type SchedulingFacts } from "@/features/scheduling/types";

const JOB = "16400000-0000-4000-8000-000000000021";
const OTHER_JOB = "16400000-0000-4000-8000-000000000022";
const P1 = "16400000-0000-4000-8000-000000000023";
const P2 = "16400000-0000-4000-8000-000000000024";
const CANDIDATE = "16400000-0000-4000-8000-000000000025";
type Job = { jobId: string; durationMinutes: number | null; crewSize: number | null; travelMinutes: number | null;
  plannedStartDate: string | null; plannedEndDate: string | null; earliestDate: string | null;
  desiredDate: string | null; latestDate: string | null };
type Advice = { kind: "known" | "unknown"; totalDemandMinutes?: number; allocatedCurrentJobMinutes?: number;
  remainingDemandMinutes?: number; remainingCapacityMinutes?: number; shortfallMinutes?: number };
type DemandContract = { evaluateJobDemandAdvisory(input: { job: Job; eligiblePersonIds: readonly string[] | null;
  facts: SchedulingFacts | null }): Advice };
const job = (patch: Partial<Job> = {}): Job => ({ jobId: JOB, durationMinutes: 120, crewSize: 2, travelMinutes: 30,
  plannedStartDate: "2026-10-12", plannedEndDate: "2026-10-12",
  earliestDate: "2026-10-01", desiredDate: "2026-10-20", latestDate: "2026-10-31", ...patch });
const booking = (id: string, startsAt: string, endsAt: string, patch: Partial<SchedulingBooking> = {}): SchedulingBooking =>
  ({ id, jobId: JOB, startsAt, endsAt, status: "planned", allDay: false, assigneeIds: [P1, P2], ...patch });
const emptyCandidate = () => booking(CANDIDATE, "2026-10-12T06:00:00Z", "2026-10-12T07:00:00Z", { status: "cancelled" });
function facts(candidate: SchedulingBooking, existingBookings: readonly SchedulingBooking[] = [], end = "12:00"): SchedulingFacts {
  return { candidate, existingBookings, people: [P1, P2].map((id) => ({ id, employmentPercentage: 100,
    shifts: [{ weekday: 1, start: "08:00", end, breaks: [] }], exceptions: [] })),
    calendarDays: [], jobInputs: null, rules: DEFAULT_SCHEDULING_RULES };
}

// Provider: future src/features/scheduling/job-demand-advisory.ts, lazy until activation.
test.skip("[P0][16.4-U07] four approved D120 N2 T30 person-minute goldens charge demand once and occupancy once", async () => {
  const modulePath = new URL("../../../../src/features/scheduling/job-demand-advisory.ts", import.meta.url).href;
  const { evaluateJobDemandAdvisory } = await import(modulePath) as DemandContract;
  const oneHour = booking(CANDIDATE, "2026-10-12T06:00:00Z", "2026-10-12T07:00:00Z");
  const cases = [
    { name: "unallocated", input: facts(emptyCandidate()), allocated: 0, residual: 300, capacity: 480, shortfall: 0, perPersonOccupied: BigInt(0) },
    { name: "120 allocated", input: facts(oneHour), allocated: 120, residual: 180, capacity: 360, shortfall: 0, perPersonOccupied: BigInt(3600000000) },
    { name: "other job also consumes capacity", input: facts(oneHour,
      [booking("other", "2026-10-12T07:00:00Z", "2026-10-12T08:00:00Z", { jobId: OTHER_JOB })], "11:00"),
      allocated: 120, residual: 180, capacity: 120, shortfall: 60, perPersonOccupied: BigInt(7200000000) },
    { name: "allocation above demand", input: facts(booking(CANDIDATE, "2026-10-12T06:00:00Z", "2026-10-12T09:00:00Z")),
      allocated: 360, residual: 0, capacity: 120, shortfall: 0, perPersonOccupied: BigInt(10800000000) },
  ];
  for (const row of cases) {
    const before = structuredClone(row.input);
    const advice = evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: [P1, P2], facts: row.input });
    assert.deepEqual(advice, { kind: "known", totalDemandMinutes: 300, allocatedCurrentJobMinutes: row.allocated,
      remainingDemandMinutes: row.residual, remainingCapacityMinutes: row.capacity, shortfallMinutes: row.shortfall }, row.name);
    const actualIntervalCapacity = row.input.people.reduce((sum, person) => sum +
      prepareDailyCapacity(row.input, person, "2026-10-12")(row.perPersonOccupied).terms.availableMinutes, 0);
    assert.equal(advice.remainingCapacityMinutes, actualIntervalCapacity, "actual intervals debit capacity; forecast never does");
    assert.deepEqual(row.input, before, "advice cannot insert forecast occupancy");
  }
});

test.skip("[P0][16.4-U08] missing real inputs stay unknown while explicit T0 is known and crew does not invent people", async () => {
  const modulePath = new URL("../../../../src/features/scheduling/job-demand-advisory.ts", import.meta.url).href;
  const { evaluateJobDemandAdvisory } = await import(modulePath) as DemandContract;
  const actual = facts(emptyCandidate());
  for (const patch of [{ durationMinutes: null }, { crewSize: null }, { travelMinutes: null },
    { plannedStartDate: null }, { plannedEndDate: null }] as Partial<Job>[]) {
    assert.equal(evaluateJobDemandAdvisory({ job: job(patch), eligiblePersonIds: [P1], facts: actual }).kind, "unknown");
  }
  assert.equal(evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: null, facts: actual }).kind, "unknown");
  assert.equal(evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: [], facts: actual }).kind, "unknown");
  assert.equal(evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: ["unavailable-profile"], facts: actual }).kind, "unknown");
  assert.equal(evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: [P1], facts: null }).kind, "unknown");
  assert.deepEqual(evaluateJobDemandAdvisory({ job: job({ travelMinutes: 0 }), eligiblePersonIds: [P1], facts: actual }),
    { kind: "known", totalDemandMinutes: 240, allocatedCurrentJobMinutes: 0, remainingDemandMinutes: 240,
      remainingCapacityMinutes: 240, shortfallMinutes: 0 });
});

test.skip("[P0][16.4-U09] canonical candidate replaces prior identity once and split/repeated bookings credit actual minutes only", async () => {
  const modulePath = new URL("../../../../src/features/scheduling/job-demand-advisory.ts", import.meta.url).href;
  const { evaluateJobDemandAdvisory } = await import(modulePath) as DemandContract;
  const whole = booking(CANDIDATE, "2026-10-12T06:00:00Z", "2026-10-12T07:00:00Z");
  const prior = booking(CANDIDATE, "2026-10-12T06:00:00Z", "2026-10-12T09:00:00Z");
  const wholeInput = facts(whole, [prior, prior]);
  const splitInput = facts(booking(CANDIDATE, "2026-10-12T06:00:00Z", "2026-10-12T06:30:00Z"),
    [prior, booking("second", "2026-10-12T06:30:00Z", "2026-10-12T07:00:00Z")]);
  const expected = { kind: "known", totalDemandMinutes: 300, allocatedCurrentJobMinutes: 120,
    remainingDemandMinutes: 180, remainingCapacityMinutes: 360, shortfallMinutes: 0 };
  assert.deepEqual(evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: [P1, P2, P1], facts: wholeInput }), expected);
  assert.deepEqual(evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: [P1, P2], facts: splitInput }), expected,
    "two 30 minute bookings × two people equals one 60 minute booking × two people");
  const repeat = facts(whole, [booking("repeat", "2026-10-12T07:00:00Z", "2026-10-12T08:00:00Z")]);
  assert.deepEqual(evaluateJobDemandAdvisory({ job: job(), eligiblePersonIds: [P1, P2], facts: repeat }),
    { kind: "known", totalDemandMinutes: 300, allocatedCurrentJobMinutes: 240,
      remainingDemandMinutes: 60, remainingCapacityMinutes: 240, shortfallMinutes: 0 });
});

test.skip("[P0][16.4-U10] identical eligible pool and inclusive planned Stockholm day clip DST occupancy and preserve negative capacity", async () => {
  const modulePath = new URL("../../../../src/features/scheduling/job-demand-advisory.ts", import.meta.url).href;
  const { evaluateJobDemandAdvisory } = await import(modulePath) as DemandContract;
  const selected = booking(CANDIDATE, "2026-10-24T21:00:00Z", "2026-10-25T01:00:00Z", { assigneeIds: [P1] });
  const input: SchedulingFacts = { ...facts(selected, [
    booking("other-job", "2026-10-25T01:00:00Z", "2026-10-25T04:00:00Z", { jobId: OTHER_JOB, assigneeIds: [P1] }),
    booking("cancelled", "2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z", { status: "cancelled", assigneeIds: [P1] }),
    booking("outside-pool", "2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z", { assigneeIds: [P2] }),
    booking("after-window", "2026-10-25T23:00:00Z", "2026-10-26T00:00:00Z", { assigneeIds: [P1] }),
  ]), people: [P1, P2].map((id) => ({ id, employmentPercentage: 100,
    shifts: [{ weekday: 7, start: "00:00", end: "04:00", breaks: [] }], exceptions: [] })) };
  const advice = evaluateJobDemandAdvisory({ job: job({ plannedStartDate: "2026-10-25", plannedEndDate: "2026-10-25",
    earliestDate: "2026-10-01", desiredDate: "2026-10-12", latestDate: "2026-10-31" }), eligiblePersonIds: [P1], facts: input });
  assert.deepEqual(advice, { kind: "known", totalDemandMinutes: 300, allocatedCurrentJobMinutes: 180,
    remainingDemandMinutes: 120, remainingCapacityMinutes: -60, shortfallMinutes: 180 });
  assert.equal(prepareDailyCapacity(input, input.people[0]!, "2026-10-25")(BigInt(21600000000)).terms.availableMinutes,
    advice.remainingCapacityMinutes, "00–04 fall-back shift has 300 real minutes; 360 actual minutes leave -60");
});
