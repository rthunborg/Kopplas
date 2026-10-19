/**
 * Story 16.1 ATDD: real parser and sole-detector seams, without DB or alternate detector.
 * Cases exercise the complete per-job wire contract through the real parser and sole detector.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { DEFAULT_SCHEDULING_RULES } from "@/features/scheduling/types";

const JOB_A = "16010000-0000-4000-8000-000000000001";
const JOB_B = "16010000-0000-4000-8000-000000000002";
const BOOKING_A = "16010000-0000-4000-8000-000000000011";
const BOOKING_B = "16010000-0000-4000-8000-000000000012";
const UNBOUND = "16010000-0000-4000-8000-000000000013";
const PERSON = "16010000-0000-4000-8000-000000000021";
const TENANT = "16010000-0000-4000-8000-000000000041";
const ACTOR = "16010000-0000-4000-8000-000000000042";
const COMMAND = "16010000-0000-4000-8000-000000000043";
const CORRELATION = "16010000-0000-4000-8000-000000000044";
const MEMBERSHIP = "16010000-0000-4000-8000-000000000045";
const HOURS = "16010000-0000-4000-8000-000000000046";
const ROLE = "16010000-0000-4000-8000-000000000031";
const MISSING_ROLE = "16010000-0000-4000-8000-000000000032";
type JobInput = { jobId: string; requiredWorkRoleIds: string[] | null;
  accessWindows: { startsAt: string; endsAt: string }[] | null };
const digest = (text: string) => createHash("sha256").update(text).digest("hex");
function booking(id: string, jobId: string | null, hour: string) {
  return { id, jobId, startsAt: `2026-10-12T${hour}:00:00Z`, endsAt: `2026-10-12T${hour}:30:00Z`,
    allDay: false, status: "planned", assigneeIds: [PERSON] };
}
function facts(jobInputs: JobInput[]) {
  return {
    bookings: [booking(BOOKING_A, JOB_A, "08"), booking(BOOKING_B, JOB_B, "09"), booking(UNBOUND, null, "10")],
    profiles: [{ id: PERSON, membershipId: MEMBERSHIP, defaultWorkRoleId: ROLE,
      employmentPercentage: 100, archivedAt: null }],
    memberships: [{ id: MEMBERSHIP, userId: ACTOR, status: "active", role: "montor", roles: [] }],
    hours: [{ id: HOURS, personProfileId: PERSON, entryKind: "weekly_shift", weekday: 1,
      localDate: null, exceptionKind: null, startsAt: "08:00", endsAt: "17:00" }],
    calendarDays: [], workRoles: [{ id: ROLE, isActive: true }, { id: MISSING_ROLE, isActive: true }],
    jobInputs, rules: DEFAULT_SCHEDULING_RULES,
  };
}
async function snapshot(jobInputs: JobInput[], engineVersion?: string) {
  const { BOOKING_CONFLICT_ENGINE_VERSION } = await import("@/server/bookings/conflict-attestation");
  const canonicalFacts = JSON.stringify(facts(jobInputs));
  const own = booking(BOOKING_A, JOB_A, "08");
  return { kind: "snapshot", tenantId: TENANT, actorId: ACTOR, operation: "update", commandId: COMMAND,
    bookingId: BOOKING_A, candidateDigest: digest(JSON.stringify(own)), factDigest: digest(canonicalFacts),
    engineVersion: engineVersion ?? BOOKING_CONFLICT_ENGINE_VERSION, configVersion: DEFAULT_SCHEDULING_RULES.version,
    correlationId: CORRELATION, keyId: "test_v1", issuedAt: "2026-10-12T06:00:00Z", expiresAt: "2026-10-12T06:01:00Z",
    candidate: { ...own, workRoleId: null, customerId: null, facilityId: null, contactId: null,
      description: "", seriesId: null, occurrenceIndex: null, isException: false }, canonicalFacts };
}

// This is the best first RED activation: existing parser currently rejects every non-null jobInputs.
test("[P0][16.1-U03] checked snapshot parser accepts and freezes complete own-job authoritative facts", async () => {
  const { parseDetectionSnapshot } = await import("@/server/bookings/conflict-facts");
  const jobInputs = [
    { jobId: JOB_A, requiredWorkRoleIds: [ROLE], accessWindows: null },
    { jobId: JOB_B, requiredWorkRoleIds: [], accessWindows: [] },
  ];
  const row = await snapshot(jobInputs);
  const parsed = parseDetectionSnapshot(row);
  assert.equal(parsed.kind, "snapshot");
  const full = parsed as Extract<typeof parsed, { kind: "snapshot" }>;
  assert.deepEqual(full.facts.jobInputs, jobInputs);
  assert.equal(full.canonicalFacts, row.canonicalFacts);
  assert.equal(full.factDigest, digest(row.canonicalFacts));
  assert.ok(Object.isFrozen(full.facts.jobInputs));
  assert.ok(Object.isFrozen(full.facts.bookings));
});

test("[P0][16.1-U04] mixed jobs and unbound bookings use each evaluated booking's facts without candidate bleed", async () => {
  const { deriveBookingConflicts } = await import("@/server/bookings/conflict-facts");
  const jobInputs = [
    { jobId: JOB_A, requiredWorkRoleIds: [ROLE], accessWindows: null },
    { jobId: JOB_B, requiredWorkRoleIds: [MISSING_ROLE], accessWindows: [] },
  ];
  const row = await snapshot(jobInputs);
  // Drive the actual projection directly as well as the parser case above, so a
  // parser-only relaxation still fails on concrete missing persisted warnings.
  const derived = deriveBookingConflicts({ ...row, facts: facts(jobInputs) } as unknown as Parameters<typeof deriveBookingConflicts>[0]);
  const jobWarnings = derived.output.filter((warning) =>
    warning.conflict_type === "competence_missing" || warning.conflict_type === "outside_access_window");
  assert.deepEqual(jobWarnings.map((warning) => [warning.booking_id, warning.conflict_type]).sort(), [
    [BOOKING_B, "competence_missing"], [BOOKING_B, "outside_access_window"],
  ]);
  assert.ok(jobWarnings.every((warning) => warning.related_booking_id === null));
  const permuted = facts([...jobInputs].reverse());
  permuted.bookings.reverse();
  assert.deepEqual(deriveBookingConflicts({ ...row, facts: permuted } as unknown as Parameters<typeof deriveBookingConflicts>[0]).output,
    derived.output, "canonical evaluation is independent of row order");
});

test("[P0][16.1-U05] unavailable facts stay distinct from known-empty roles and restrictive empty windows", async () => {
  const { parseDetectionSnapshot, deriveBookingConflicts } = await import("@/server/bookings/conflict-facts");
  const unknownInputs = [{ jobId: JOB_A, requiredWorkRoleIds: null, accessWindows: null }];
  const emptyInputs = [{ jobId: JOB_A, requiredWorkRoleIds: [], accessWindows: [] }];
  const unknownRow = await snapshot(unknownInputs);
  const emptyRow = await snapshot(emptyInputs);
  const parsedUnknown = parseDetectionSnapshot(unknownRow);
  const parsedEmpty = parseDetectionSnapshot(emptyRow);
  assert.notEqual(unknownRow.factDigest, emptyRow.factDigest);
  assert.notDeepEqual(parsedUnknown, parsedEmpty);
  const unknownWarnings = deriveBookingConflicts(parsedUnknown as Parameters<typeof deriveBookingConflicts>[0]).output;
  const emptyWarnings = deriveBookingConflicts(parsedEmpty as Parameters<typeof deriveBookingConflicts>[0]).output;
  assert.deepEqual(unknownWarnings.filter((warning) =>
    warning.conflict_type === "outside_access_window" || warning.conflict_type === "competence_missing"), []);
  assert.deepEqual(emptyWarnings.filter((warning) => warning.conflict_type === "competence_missing"), []);
  assert.deepEqual(emptyWarnings.filter((warning) => warning.conflict_type === "outside_access_window")
    .map((warning) => [warning.booking_id, warning.starts_at, warning.ends_at]),
  [[BOOKING_A, "2026-10-12T08:00:00.000000Z", "2026-10-12T08:30:00.000000Z"]]);
});

test("[P0][16.1-U09] old engine and content insertion deletion or job rebinding cannot reuse canonical claims", async () => {
  const { parseDetectionSnapshot } = await import("@/server/bookings/conflict-facts");
  const inputs = [{ jobId: JOB_A, requiredWorkRoleIds: [ROLE], accessWindows: null }];
  const row = await snapshot(inputs);
  assert.throws(() => parseDetectionSnapshot({ ...row, engineVersion: "booking-conflicts-v2" }),
    /booking snapshot invalid/, "the pre-job-input engine cannot attest the new fact contract");
  const inserted = facts([{ ...inputs[0]!, requiredWorkRoleIds: [ROLE, MISSING_ROLE] }]);
  const deleted = facts([]);
  const rebound = facts(inputs);
  rebound.bookings[0]!.jobId = JOB_B;
  for (const changed of [inserted, deleted, rebound]) {
    const canonicalFacts = JSON.stringify(changed);
    assert.notEqual(digest(canonicalFacts), row.factDigest);
    assert.throws(() => parseDetectionSnapshot({ ...row, canonicalFacts }), /booking snapshot invalid/,
      "changed canonical content must not retain the original digest");
  }
});
