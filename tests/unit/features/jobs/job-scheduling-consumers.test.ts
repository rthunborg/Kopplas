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
  jobSchedulingContext(input: { selectedJobId: string; jobs: readonly Hint[]; startsAt: string; endsAt: string }): {
    suggestedDate: string; customerPresenceRequired: boolean | null;
    warnings: readonly { code: string; advisory: boolean }[]; canSave: boolean };
  refreshJobSchedulingDraft(state: Draft, input: { job: Hint; responseRevision: number }): Draft;
};
const hint = (patch: Partial<Hint> = {}): Hint => ({ jobId: JOB_A, durationMinutes: 120, crewSize: 2,
  travelMinutes: 30, earliestDate: "2026-10-20", desiredDate: "2026-10-22", latestDate: "2026-10-24",
  customerPresenceRequired: true, ...patch });
const start = "2026-10-20T08:00:00Z";

// Provider: future src/features/jobs/job-scheduling-consumers.ts. D alone is elapsed time.
test("[P0][16.4-U03] new derived default uses selected D at effective start and unknown uses honest 60 minutes", async () => {
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

test("[P0][16.4-U04] explicit/edit/user intervals survive job changes while untouched derived interval rederives", async () => {
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

test("[P0][16.4-U05] earliest bounds suggestions and desired/latest/presence remain distinct per selected job", async () => {
  const modulePath = new URL("../../../../src/features/jobs/job-scheduling-consumers.ts", import.meta.url).href;
  const domain = await import(modulePath) as ConsumerContract;
  const jobs = [hint(), hint({ jobId: JOB_B, customerPresenceRequired: false,
    earliestDate: "2026-10-10", desiredDate: "2026-10-11", latestDate: "2026-10-12" })];
  const early = domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs, startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
  assert.equal(early.suggestedDate, "2026-10-20");
  assert.equal(early.customerPresenceRequired, true);
  const desired = domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs, startsAt: "2026-10-23T06:00:00Z", endsAt: "2026-10-23T07:00:00Z" });
  assert.deepEqual(desired.warnings, [{ code: "desired_date_missed", advisory: true }]);
  const late = domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs, startsAt: "2026-10-25T06:00:00Z", endsAt: "2026-10-25T07:00:00Z" });
  assert.deepEqual(late.warnings, [{ code: "desired_date_missed", advisory: true }, { code: "latest_date_breached", advisory: true }]);
  assert.equal(late.canSave, true, "date advice adds no hard save block");
  assert.equal(domain.jobSchedulingContext({ selectedJobId: JOB_B, jobs, startsAt: "2026-10-10T06:00:00Z", endsAt: "2026-10-10T07:00:00Z" })
    .customerPresenceRequired, false);
  assert.equal(domain.jobSchedulingContext({ selectedJobId: JOB_A,
    jobs: [hint({ customerPresenceRequired: null }), jobs[1]!], startsAt: "2026-10-20T06:00:00Z", endsAt: "2026-10-20T07:00:00Z" })
    .customerPresenceRequired, null);
  assert.equal(domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs: [jobs[1]!], startsAt: "2026-10-20T06:00:00Z", endsAt: "2026-10-20T07:00:00Z" })
    .customerPresenceRequired, null, "missing selected job cannot borrow another job's false");
});

test("[P0][16.4-U06] stale hint response retains dirty newer draft and immutable uncertain submission", async () => {
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

test("current hint refresh updates only the matching untouched unsent interval", async () => {
  const domain = await import("../../../../src/features/jobs/job-scheduling-consumers");
  const interval: Interval = { startsAt: start, endsAt: "2026-10-20T10:00:00Z", provenance: "derived", sourceJobId: JOB_A };
  const state: Draft = { interval, revision: 3, input: { jobId: JOB_A, startsAt: start,
    endsAt: interval.endsAt, description: "retained" }, submission: null };
  const refreshed = domain.refreshJobSchedulingDraft(state, { job: hint({ durationMinutes: 45 }), responseRevision: 3 });
  assert.equal(refreshed.interval.endsAt, "2026-10-20T08:45:00Z");
  assert.equal(refreshed.input.endsAt, refreshed.interval.endsAt);
  assert.equal(refreshed.input.description, "retained");
  assert.equal(state.interval.endsAt, "2026-10-20T10:00:00Z");
  assert.equal(domain.refreshJobSchedulingDraft(state, { job: hint({ jobId: JOB_B }), responseRevision: 3 }), state);
  assert.equal(domain.refreshJobSchedulingDraft(state, { job: hint(), responseRevision: 4 }), state);
  const submitting = { ...state, submission: { revision: 3, input: state.input, commandId: "held" } };
  assert.equal(domain.refreshJobSchedulingDraft(submitting, { job: hint({ durationMinutes: 45 }), responseRevision: 3 }), submitting);
});

test("unavailable selected job keeps date and honest fallback; defaults preserve fractional instants", async () => {
  const domain = await import("../../../../src/features/jobs/job-scheduling-consumers");
  assert.deepEqual(domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs: [], startsAt: "2026-10-20T06:00:00Z", endsAt: "2026-10-20T07:00:00Z" }),
    { suggestedDate: "2026-10-20", customerPresenceRequired: null, warnings: [], canSave: true });
  assert.deepEqual(domain.deriveJobBookingInterval({ mode: "create", job: null,
    interval: { startsAt: "2026-10-20T08:00:00.123456Z", endsAt: null, provenance: "derived" } }),
    { startsAt: "2026-10-20T08:00:00.123456Z", endsAt: "2026-10-20T09:00:00.123456Z", provenance: "derived", sourceJobId: null });
  assert.throws(() => domain.deriveJobBookingInterval({ mode: "create", job: hint({ durationMinutes: 0 }),
    interval: { startsAt: start, endsAt: null, provenance: "derived" } }), /Invalid booking duration/);
  assert.throws(() => domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs: [], startsAt: "2026-02-30T06:00:00Z", endsAt: "2026-02-30T07:00:00Z" }));
});

test("[P0][16.4-F02] actual default composition clamps only derived starts and preserves canonical DST fold instants",async()=>{
 const d=await import("@/features/jobs/job-scheduling-consumers");
 const derived={startsAt:"2026-10-19T06:00:00Z",endsAt:null,provenance:"derived" as const,startProvenance:"derived" as const};
 const bounded=d.deriveJobBookingInterval({mode:"create",interval:derived,job:hint()});
 assert.equal(bounded.startsAt,"2026-10-20T06:00:00.000000Z");
 assert.equal(Date.parse(bounded.endsAt!)-Date.parse(bounded.startsAt),120*60000);
 const explicit=d.deriveJobBookingInterval({mode:"create",interval:{...derived,startProvenance:"explicit"},job:hint()});
 assert.equal(explicit.startsAt,derived.startsAt);
 const fold={startsAt:"2026-10-25T01:30:00Z",endsAt:null,provenance:"derived" as const,startProvenance:"derived" as const};
 const actual=d.deriveJobBookingInterval({mode:"create",interval:fold,job:hint({durationMinutes:60,earliestDate:null})});
 assert.equal(actual.startsAt,fold.startsAt);assert.equal(actual.endsAt,"2026-10-25T02:30:00Z");
 const fallback=d.deriveJobBookingInterval({mode:"create",interval:fold,job:null});
 assert.equal(fallback.endsAt,"2026-10-25T02:30:00Z");
 assert.notEqual(Date.parse("2026-10-25T00:30:00Z"),Date.parse(fold.startsAt));
 const edited=d.deriveJobBookingInterval({mode:"create",interval:{...fold,endsAt:"2026-10-25T02:15:00Z",provenance:"user"},job:hint()});
 assert.equal(edited.endsAt,"2026-10-25T02:15:00Z");
});


test("[P0][16.4-F03] desired/latest advice follows actual occupied end date, independently of allowed start", async () => {
  const domain = await import("../../../../src/features/jobs/job-scheduling-consumers");
  const jobs = [hint({ earliestDate: "2026-10-20", desiredDate: "2026-10-20", latestDate: "2026-10-21" })];
  const interval = { startsAt: "2026-10-20T20:00:00Z", endsAt: "2026-10-21T00:15:00Z" };
  const context = domain.jobSchedulingContext({ selectedJobId: JOB_A, jobs, ...interval });
  assert.equal(context.suggestedDate, "2026-10-20");
  assert.deepEqual(context.warnings, [{ code: "desired_date_missed", advisory: true }]);
  assert.equal(context.canSave, true);
});

const endDateCases = [
  { name: "timed exclusive Stockholm midnight", start: "2026-10-20T20:00:00Z", end: "2026-10-20T22:00:00Z", date: "2026-10-20", late: false },
  { name: "one microsecond into the next occupied day", start: "2026-10-20T20:00:00Z", end: "2026-10-20T22:00:00.000001Z", date: "2026-10-20", late: true },
  { name: "offset-form exclusive midnight", start: "2026-10-20T22:00:00+02:00", end: "2026-10-21T00:00:00+02:00", date: "2026-10-20", late: false },
  { name: "multi-day timed booking", start: "2026-10-20T06:00:00Z", end: "2026-10-22T07:00:00Z", date: "2026-10-21", late: true },
  { name: "multi-day all-day exclusive end", start: "2026-10-19T22:00:00Z", end: "2026-10-22T22:00:00Z", date: "2026-10-22", late: false },
  { name: "spring 23-hour all-day exclusive end", start: "2026-03-28T23:00:00Z", end: "2026-03-29T22:00:00Z", date: "2026-03-29", late: false },
  { name: "spring midnight plus one microsecond", start: "2026-03-28T23:00:00Z", end: "2026-03-29T22:00:00.000001Z", date: "2026-03-29", late: true },
  { name: "spring overnight ends after deadline", start: "2026-03-28T21:00:00Z", end: "2026-03-29T01:30:00Z", date: "2026-03-28", late: true },
  { name: "fall 25-hour all-day exclusive end", start: "2026-10-24T22:00:00Z", end: "2026-10-25T23:00:00Z", date: "2026-10-25", late: false },
  { name: "fall midnight plus one microsecond", start: "2026-10-24T22:00:00Z", end: "2026-10-25T23:00:00.000001Z", date: "2026-10-25", late: true },
  { name: "fall overnight first fold end", start: "2026-10-24T20:00:00Z", end: "2026-10-25T00:30:00Z", date: "2026-10-24", late: true },
  { name: "fall overnight second fold end", start: "2026-10-24T20:00:00Z", end: "2026-10-25T01:30:00Z", date: "2026-10-24", late: true },
] as const;
for (const row of endDateCases) test(`[P0][16.4-F03] end advice: ${row.name}`, async () => {
  const domain = await import("../../../../src/features/jobs/job-scheduling-consumers");
  const interval = { startsAt: row.start, endsAt: row.end };
  const before = structuredClone(interval);
  const context = domain.jobSchedulingContext({ selectedJobId: JOB_A, ...interval,
    jobs: [hint({ earliestDate: null, desiredDate: row.date, latestDate: row.date })] });
  assert.deepEqual(context.warnings.map(w => w.code), row.late ? ["desired_date_missed", "latest_date_breached"] : []);
  assert.equal(context.canSave, true);
  assert.deepEqual(interval, before, "advice never changes the native interval");
});

test("[P0][16.4-F03] earliest remains start-only and invalid intervals cannot produce misleading advice", async () => {
  const domain = await import("../../../../src/features/jobs/job-scheduling-consumers");
  const interval = { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-21T07:00:00Z" };
  const context = domain.jobSchedulingContext({selectedJobId:JOB_A,jobs:[hint()],...interval});
  assert.equal(context.suggestedDate,"2026-10-20");
  assert.deepEqual(context.warnings,[]);
  for (const endsAt of [interval.startsAt,"2026-10-18T06:00:00Z","invalid"]) {
    assert.throws(() => domain.jobSchedulingContext({selectedJobId:JOB_A,jobs:[hint()],...interval,endsAt}));
  }
});
