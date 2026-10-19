import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * Story 16.2 RED scaffolds: AC03/05/06/08.
 * Proposed headless adapter contract only: export names, DTO spelling and state
 * representation may change at implementation. Preserve assertions when adapting.
 * No client input or pure state is evidence of server eligibility/authority.
 * SQL eligibility, atomic audit and replay authority belong to integration tests.
 */
type Result = { readonly valid: boolean; readonly value?: Readonly<Record<string, unknown>> };
type AssignInput = { commandId: string; jobId: string; expectedState: string; personProfileId: string };
type RemoveInput = { commandId: string; jobId: string; expectedState: string; personProfileId: string };
type LeadInput = { commandId: string; jobId: string; personProfileId: string | null; expectedState: string };
type DatesInput = { commandId: string; jobId: string; expectedState: string; planned_start_date: string | null; planned_end_date: string | null };
type DraftInput = Readonly<Record<string, unknown>>;
type State = {
  readonly input: DraftInput;
  readonly status: "editing" | "submitting" | "uncertain" | "refetch-required" | "persisted";
  readonly current: DraftInput | null;
  readonly submission: { readonly commandId: string; readonly input: DraftInput } | null;
};
type Event =
  | { type: "submit"; commandId: string }
  | { type: "edit"; input: DraftInput }
  | { type: "uncertain"; commandId: string }
  | { type: "retry" }
  | { type: "stale"; commandId: string }
  | { type: "refetched"; current: DraftInput };
type ProposedDomain = {
  validateAssignMemberInput(input: unknown): Result;
  validateRemoveMemberInput(input: unknown): Result;
  validateSetLeadInput(input: unknown): Result;
  validatePlannedDatesInput(input: unknown): Result;
  createJobMembersDraft(operation: "assign" | "remove" | "set-lead" | "planned-dates", input: DraftInput): State;
  transitionJobMembersDraft(state: State, event: Event): State;
};

// Variable import is lazy inside skipped bodies; no missing-module resolution at
// registration/typecheck time and no duplicate test-side implementation.
async function domain(): Promise<ProposedDomain> {
  const moduleName = "@/features/jobs/job-members-domain";
  return await import(moduleName) as ProposedDomain;
}

const ids = {
  command: "16200000-0000-4000-8000-000000000001",
  job: "16200000-0000-4000-8000-000000000002",
  profile: "16200000-0000-4000-8000-000000000003",
  member: "16200000-0000-4000-8000-000000000004",
  replacement: "16200000-0000-4000-8000-000000000005",
};

test("[P0] 16.2-UNIT-001 separate operations reject invalid identities and cross-operation field smuggling", async () => {
  const api = await domain();
  const assign: AssignInput = { commandId: ids.command, jobId: ids.job, expectedState: "a".repeat(64), personProfileId: ids.profile };
  const remove: RemoveInput = { commandId: ids.command, jobId: ids.job, expectedState: "a".repeat(64), personProfileId: ids.member };
  const lead: LeadInput = { commandId: ids.command, jobId: ids.job, expectedState: "a".repeat(64), personProfileId: ids.profile };
  const dates: DatesInput = { commandId: ids.command, jobId: ids.job, expectedState: "a".repeat(64), planned_start_date: null, planned_end_date: null };
  const operations = [
    { validate: api.validateAssignMemberInput, input: assign, target: "personProfileId" },
    { validate: api.validateRemoveMemberInput, input: remove, target: "personProfileId" },
    { validate: api.validateSetLeadInput, input: lead, target: "personProfileId" },
    { validate: api.validatePlannedDatesInput, input: dates, target: "jobId" },
  ];
  for (const { validate, input, target } of operations) {
    assert.deepEqual(validate(input), { valid: true, value: input });
    for (const key of ["commandId", "jobId", target]) {
      for (const bad of ["", "not-a-uuid", 1, undefined]) {
        assert.equal(validate({ ...input, [key]: bad }).valid, false, key);
      }
    }
    for (const key of ["unknown", "actorId", "tenantId", "role", "priority", "budget", "responsible_project_manager_id"]) {
      assert.equal(validate({ ...input, [key]: ids.profile }).valid, false, key);
    }
    assert.equal(validate({ ...input, [Symbol("extra")]: true }).valid, false);
  }
  assert.equal(api.validateAssignMemberInput({ ...assign, designation: "arbetsledare" }).valid, false);
  assert.equal(api.validateRemoveMemberInput({ ...remove, memberId: ids.profile }).valid, false);
  assert.equal(api.validateSetLeadInput({ ...lead, planned_start_date: null }).valid, false);
  assert.equal(api.validatePlannedDatesInput({ ...dates, personProfileId: ids.profile }).valid, false);
  assert.deepEqual(api.validateSetLeadInput({ ...lead, personProfileId: null }), {
    valid: true, value: { ...lead, personProfileId: null },
  });
});

test("[P0] 16.2-UNIT-002 dates-only values preserve explicit null and canonical calendar/range policy", async () => {
  const { validatePlannedDatesInput: validate } = await domain();
  const base = { commandId: ids.command, jobId: ids.job, expectedState: "a".repeat(64) };
  // Same policy as existing validateJobCardInput: nullable dates, real Gregorian
  // calendar dates and start <= end. No timezone, booking or new duration rule.
  for (const dates of [
    { planned_start_date: null, planned_end_date: null },
    { planned_start_date: "2024-02-29", planned_end_date: null },
    { planned_start_date: null, planned_end_date: "2026-10-19" },
    { planned_start_date: "2026-10-19", planned_end_date: "2026-10-19" },
    { planned_start_date: "2026-12-31", planned_end_date: "2027-01-01" },
  ]) {
    assert.deepEqual(validate({ ...base, ...dates }), { valid: true, value: { ...base, ...dates } });
  }
  for (const dates of [
    { planned_start_date: "2026-02-29", planned_end_date: null },
    { planned_start_date: null, planned_end_date: "2026-04-31" },
    { planned_start_date: "2026-10-19T00:00:00Z", planned_end_date: null },
    { planned_start_date: "2027-01-01", planned_end_date: "2026-12-31" },
    { planned_start_date: undefined, planned_end_date: null },
  ]) assert.equal(validate({ ...base, ...dates }).valid, false);
});

test("[P1] 16.2-UNIT-003 uncertain crew retry keeps original identity and snapshot while newer draft stays unsent", async () => {
  const api = await domain();
  const original = { jobId: ids.job, personProfileId: ids.profile };
  const newer = { jobId: ids.job, personProfileId: ids.replacement };
  const pending = api.transitionJobMembersDraft(api.createJobMembersDraft("assign", original), {
    type: "submit", commandId: ids.command,
  });
  const edited = api.transitionJobMembersDraft(pending, { type: "edit", input: newer });
  const uncertain = api.transitionJobMembersDraft(edited, { type: "uncertain", commandId: ids.command });
  const retry = api.transitionJobMembersDraft(uncertain, { type: "retry" });
  assert.deepEqual(retry.input, newer);
  assert.equal(retry.submission?.commandId, ids.command);
  assert.deepEqual(retry.submission?.input, original);
  assert.notEqual(retry.status, "persisted");
});

test("[P1] 16.2-UNIT-004 stale lead selection requires refetch and preserves user draft without silent resubmit", async () => {
  const api = await domain();
  const draft = { jobId: ids.job, personProfileId: ids.replacement, expectedLeadProfileId: ids.profile };
  const pending = api.transitionJobMembersDraft(api.createJobMembersDraft("set-lead", draft), {
    type: "submit", commandId: ids.command,
  });
  const stale = api.transitionJobMembersDraft(pending, { type: "stale", commandId: ids.command });
  assert.equal(stale.status, "refetch-required");
  assert.deepEqual(stale.input, draft);
  const refusedRetry = api.transitionJobMembersDraft(stale, { type: "retry" });
  assert.equal(refusedRetry.status, "refetch-required");
  const current = { jobId: ids.job, personProfileId: null };
  const refetched = api.transitionJobMembersDraft(refusedRetry, { type: "refetched", current });
  assert.deepEqual(refetched.current, current);
  assert.deepEqual(refetched.input, draft);
  assert.notEqual(refetched.status, "submitting");
  assert.notEqual(refetched.status, "persisted");
});


import {createJobMemberField, editJobMemberField, receiveJobMemberField, consentJobMemberField, confirmJobMemberField} from "@/features/jobs/job-members-domain";

test("[P0] 16.2-UNIT-005 cross-lane refresh updates pristine values but cannot authorize dirty controls", () => {
  const pristineLead = createJobMemberField("lead-A", "state-A");
  const dirtyDates = editJobMemberField(createJobMemberField({start: "", end: ""}, "state-A"), {start: "2026-10-20", end: "2026-10-21"});
  const nextLead = receiveJobMemberField(pristineLead, "lead-B", "state-B");
  const nextDates = receiveJobMemberField(dirtyDates, {start: "", end: ""}, "state-B");
  assert.deepEqual(nextLead, {value: "lead-B", baseline: "lead-B", expectedState: "state-B"});
  assert.equal(nextDates.expectedState, "state-A");
  assert.deepEqual(nextDates.value, dirtyDates.value);
  const consentedDates = consentJobMemberField(nextDates, {start: "", end: ""}, "state-B");
  assert.deepEqual(consentedDates.value, dirtyDates.value);
  assert.equal(consentedDates.expectedState, "state-B");
  const dirtyLead = editJobMemberField(nextLead, "lead-C");
  const refreshedLead = receiveJobMemberField(dirtyLead, "lead-B", "state-after-dates");
  assert.equal(refreshedLead.value, "lead-C");
  assert.equal(refreshedLead.expectedState, "state-B");
});

test("[P0] 16.2-UNIT-006 confirming an older assignment retains newer visible selection and its stale baseline", () => {
  const submitted = editJobMemberField(createJobMemberField("", "old"), "person-A");
  const visible = editJobMemberField(submitted, "person-B");
  const confirmed = confirmJobMemberField(visible, "person-A", "", "committed");
  assert.equal(confirmed.value, "person-B");
  assert.equal(confirmed.expectedState, "old");
  const consented = consentJobMemberField(confirmed, "", "current");
  assert.equal(consented.value, "person-B");
  assert.equal(consented.expectedState, "current");
  const complete = confirmJobMemberField(consented, "person-B", "", "after-B");
  assert.deepEqual(complete, {value: "", baseline: "", expectedState: "after-B"});
});
