/** Story 16.4 AC04/06/07. Replaceable pure adapter bindings, never caller authority.
 * Existing/edit/explicit intervals and unsent newer input must survive hint refresh.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

const JOB_A = "16400000-0000-4000-8000-000000000011";
const JOB_B = "16400000-0000-4000-8000-000000000012";
type Hint = { jobId: string; durationMinutes: number | null; crewSize: number | null;
  travelMinutes: number | null; earliestDate: string | null; desiredDate: string | null;
  latestDate: string | null; customerPresenceRequired: boolean | null };
type Interval = { startsAt: string; endsAt: string | null;
  provenance: "derived" | "explicit" | "existing" | "user"; sourceJobId?: string | null };
type Draft = { interval: Interval; revision: number; input: Record<string, unknown>;
  submission: null | { revision: number; input: Record<string, unknown>; commandId: string } };
type ConsumerContract = {
  deriveJobBookingInterval(input: { mode: "create" | "edit"; interval: Interval; job: Hint | null }): Interval;
  jobSchedulingContext(input: { selectedJobId: string; jobs: readonly Hint[]; suggestedDate: string }): {
    suggestedDate: string; customerPresenceRequired: boolean | null;
    warnings: readonly { code: string; advisory: boolean }[]; canSave: boolean };
  refreshJobSchedulingDraft(state: Draft, input: { job: Hint; responseRevision: number }): Draft;
};
const hint = (patch: Partial<Hint> = {}): Hint => ({ jobId: JOB_A, durationMinutes: 120, crewSize: 2,
  travelMinutes: 30, earliestDate: "2026-10-20", desiredDate: "2026-10-22", latestDate: "2026-10-24",
  customerPresenceRequired: true, ...patch });
const start = "2026-10-20T08:00:00Z";

// Provider: future src/features/jobs/job-scheduling-consumers.ts. D alone is elapsed time.
test.skip("[P0][16.4-U03] new derived default uses selected D at effective start and unknown uses honest 60 minutes", async () => {
  const modulePath = new URL("../../../../src/features/jobs/job-scheduling-consumers.ts", import.meta.url).href;
  const domain = await import(modulePath) as ConsumerContract;
  const interval: Interval = { startsAt: start, endsAt: null, provenance: "derived", sourceJobId: null };
  assert.deepEqual(domain.deriveJobBookingInterval({ mode: "create", interval, job: hint() }),
    { startsAt: start, endsAt: "2026-10-20T10:00:00Z", provenance: "derived", sourceJobId: JOB_A });
  const unknown = domain.deriveJobBookingInterval({ mode: "create", interval, job: hint({ durationMinutes: null }) });
  assert.equal(unknown.endsAt, "2026-10-20T09:00:00Z");
  assert.equal(unknown.provenance, "derived");
  assert.equal(domain.deriveJobBookingInterval({ mode: "create", interval: { ...interval,
    startsAt: "2026-10-20T11:15:00Z" }, job: hint() }).endsAt, "2026-10-20T13:15:00Z");
});

test.skip("[P0][16.4-U04] explicit/edit/user intervals survive job changes while untouched derived interval rederives", async () => {
  const modulePath = new URL("../../../../src/features/jobs/job-scheduling-consumers.ts", import.meta.url).href;
  const domain = await import(modulePath) as ConsumerContract;
  const nextJob = hint({ jobId: JOB_B, durationMinutes: 45 });
  for (const provenance of ["explicit", "existing", "user"] as const) {
    const interval: Interval = { startsAt: start, endsAt: "2026-10-20T08:35:00Z", provenance, sourceJobId: JOB_A };
    assert.deepEqual(domain.deriveJobBookingInterval({ mode: "create", interval, job: nextJob }), interval);
    assert.deepEqual(domain.deriveJobBookingInterval({ mode: "edit", interval, job: nextJob }), interval);
  }
  const derived: Interval = { startsAt: start, endsAt: "2026-10-20T10:00:00Z", provenance: "derived", sourceJobId: JOB_A };
  assert.equal(domain.deriveJobBookingInterval({ mode: "create", interval: derived, job: nextJob }).endsAt,
    "2026-10-20T08:45:00Z");
  assert.deepEqual(domain.deriveJobBookingInterval({ mode: "edit", interval: derived, job: nextJob }), derived);
});

test.skip("[P0][16.4-U05] earliest bounds suggestions and desired/latest/presence remain distinct per selected job", async () => {
  const modulePath = new URL("../../../../src/features/jobs/job-scheduling-consumers.ts", import.meta.url).href;
  const domain = await import(modulePath) as ConsumerContract;
  const jobs = [hint(), hint({ jobId: JOB_B, customerPresenceRequired: false,
    earliestDate: "2026-10-10", desiredDate: "2026-10-11", latestDate: "2026-10-12" })];
  const early = domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs, suggestedDate: "2026-10-19" });
  assert.equal(early.suggestedDate, "2026-10-20");
  assert.equal(early.customerPresenceRequired, true);
  const desired = domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs, suggestedDate: "2026-10-23" });
  assert.deepEqual(desired.warnings, [{ code: "desired_date_missed", advisory: true }]);
  const late = domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs, suggestedDate: "2026-10-25" });
  assert.deepEqual(late.warnings, [{ code: "desired_date_missed", advisory: true }, { code: "latest_date_breached", advisory: true }]);
  assert.equal(late.canSave, true, "date advice adds no hard save block");
  assert.equal(domain.jobSchedulingContext({ selectedJobId: JOB_B, jobs, suggestedDate: "2026-10-10" })
    .customerPresenceRequired, false);
  assert.equal(domain.jobSchedulingContext({ selectedJobId: JOB_A,
    jobs: [hint({ customerPresenceRequired: null }), jobs[1]!], suggestedDate: "2026-10-20" })
    .customerPresenceRequired, null);
  assert.equal(domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs: [jobs[1]!], suggestedDate: "2026-10-20" })
    .customerPresenceRequired, null, "missing selected job cannot borrow another job's false");
});

test.skip("[P0][16.4-U06] stale hint response retains dirty newer draft and immutable uncertain submission", async () => {
  const modulePath = new URL("../../../../src/features/jobs/job-scheduling-consumers.ts", import.meta.url).href;
  const domain = await import(modulePath) as ConsumerContract;
  const state: Draft = { revision: 2, input: { jobId: JOB_B, description: "newer unsent text" },
    interval: { startsAt: start, endsAt: "2026-10-20T08:35:00Z", provenance: "user", sourceJobId: JOB_B },
    submission: { revision: 1, input: { jobId: JOB_A, description: "submitted text" },
      commandId: "16400000-0000-4000-8000-000000000013" } };
  const before = structuredClone(state);
  const refreshed = domain.refreshJobSchedulingDraft(state, { job: hint(), responseRevision: 1 });
  assert.deepEqual(refreshed.input, before.input);
  assert.deepEqual(refreshed.interval, before.interval);
  assert.deepEqual(refreshed.submission, before.submission);
  assert.equal(refreshed.revision, 2);
  assert.deepEqual(state, before, "refresh does not mutate the held draft");
});
