import { test } from "node:test";
import assert from "node:assert/strict";

/** Story 16.3 AC01–04/07 RED. Activate after the real headless module exists.
 * Export names, DTO spelling and state representation below are a replaceable
 * adapter, not product policy. Reconcile bindings without weakening assertions.
 * Pure validators never prove current eligibility, parent coherence or authority;
 * those checks must also execute under locked current SQL facts in integration.
 */
type Input = Readonly<Record<string, unknown>>;
type Validation = { valid: boolean; value?: Input };
type Status = "created" | "in_progress" | "done" | "cancelled";
type Endpoint = { jobId: string; workOrderId: string | null };
type Timing = Endpoint & { readable: boolean; plannedStartDate: string | null; plannedEndDate: string | null };
type Warning = { state: "delay" | "clear" | "unknown"; prerequisiteEndDate?: string; dependentStartDate?: string };
type Draft = { input: Input; current: Input | null; status: string;
  submission: { commandId: string; input: Input } | null };
type Event = { type: "submit" | "uncertain" | "stale" | "persisted"; commandId: string }
  | { type: "edit"; input: Input } | { type: "retry" }
  | { type: "refetched"; current: Input };
type Field = { value: Input; baseline: Input; expectedState: string };
type ProposedDomain = {
  validateCreateWorkOrderInput(input: unknown): Validation;
  validateUpdateWorkOrderInput(input: unknown): Validation;
  validateWorkOrderAssigneesInput(input: unknown): Validation;
  validateWorkOrderStatusInput(input: unknown): Validation;
  validateWorkOrderDependenciesInput(input: unknown): Validation;
  validateJobWorkOrderDependenciesInput(input: unknown): Validation;
  canTransitionWorkOrderStatus(from: Status, to: Status, authority: { canReopen: boolean }): boolean;
  evaluateWorkOrderDependency(input: { dependent: Timing; prerequisite: Timing }): Warning;
  createWorkOrderDraft(operation: "update", input: Input): Draft;
  transitionWorkOrderDraft(state: Draft, event: Event): Draft;
  createWorkOrderField(value: Input, expectedState: string): Field;
  editWorkOrderField(field: Field, value: Input): Field;
  receiveWorkOrderField(field: Field, value: Input, expectedState: string): Field;
  consentWorkOrderField(field: Field, value: Input, expectedState: string): Field;
  confirmWorkOrderField(field: Field, submitted: Input, empty: Input, expectedState: string): Field;
};
async function domain(): Promise<ProposedDomain> {
  // Lazy variable import keeps absent future modules out of collection/typecheck.
  const path = "@/features/jobs/work-orders-domain";
  return await import(path) as ProposedDomain;
}
const ids = {
  command: "16300000-0000-4000-8000-000000000001",
  job: "16300000-0000-4000-8000-000000000002",
  order: "16300000-0000-4000-8000-000000000003",
  prerequisite: "16300000-0000-4000-8000-000000000004",
  person: "16300000-0000-4000-8000-000000000005",
  otherPerson: "16300000-0000-4000-8000-000000000006",
  otherJob: "16300000-0000-4000-8000-000000000007",
};
const identity = { commandId: ids.command, jobId: ids.job, expectedState: "a".repeat(64) };
const fields = { title: "Install board", description: null, planned_start_date: null, planned_end_date: null };

test("[P0] 16.3-UNIT-001 create/update are closed and normalize bounded title/plain description", async () => {
  const api = await domain();
  for (const [validate, input] of [
    [api.validateCreateWorkOrderInput, { ...identity, ...fields }],
    [api.validateUpdateWorkOrderInput, { ...identity, workOrderId: ids.order, ...fields }],
  ] as const) {
    assert.deepEqual(validate({ ...input, title: "  Install board  " }), { valid: true, value: input });
    assert.equal(validate({ ...input, title: "x" }).valid, true);
    assert.equal(validate({ ...input, title: "x".repeat(256), description: "d".repeat(10000) }).valid, true);
    for (const title of ["", " \t ", "x".repeat(257), null, 42]) {
      assert.equal(validate({ ...input, title }).valid, false);
    }
    for (const description of ["d".repeat(10001), {}, 42]) {
      assert.equal(validate({ ...input, description }).valid, false);
    }
    for (const key of ["status", "tenantId", "tenant_id", "actorId", "role", "parentJobId", "personProfileIds", "prerequisites", "unknown"]) {
      assert.equal(validate({ ...input, [key]: key === "status" ? "done" : ids.otherJob }).valid, false, key);
    }
    assert.equal(validate({ ...input, [Symbol("extra")]: true }).valid, false);
    for (const key of ["commandId", "jobId"]) assert.equal(validate({ ...input, [key]: "invalid" }).valid, false);
  }
  assert.equal(api.validateCreateWorkOrderInput({ ...identity, ...fields, workOrderId: ids.order }).valid, false);
  assert.equal(api.validateUpdateWorkOrderInput({ ...identity, ...fields, workOrderId: "invalid" }).valid, false);
  // Terminal records may still receive independently authorized field edits;
  // validation must not smuggle a status or impose completed-record immutability.
  assert.equal(api.validateUpdateWorkOrderInput({ ...identity, workOrderId: ids.order, ...fields, title: "Correct label" }).valid, true);
});

test("[P0] 16.3-UNIT-002 own nullable Gregorian dates preserve equality and reject noncanonical/out-of-range values", async () => {
  const { validateCreateWorkOrderInput: create, validateUpdateWorkOrderInput: update } = await domain();
  for (const [validate, base] of [[create, { ...identity, ...fields }], [update, { ...identity, workOrderId: ids.order, ...fields }]] as const) {
    for (const dates of [
      { planned_start_date: null, planned_end_date: null },
      { planned_start_date: "0001-01-01", planned_end_date: "9999-12-31" },
      { planned_start_date: "2000-02-29", planned_end_date: null },
      { planned_start_date: null, planned_end_date: "2026-10-20" },
      { planned_start_date: "2026-10-20", planned_end_date: "2026-10-20" },
    ]) assert.deepEqual(validate({ ...base, ...dates }), { valid: true, value: { ...base, ...dates } });
    for (const bad of ["0000-01-01", "10000-01-01", "1900-02-29", "2026-04-31", "2026-2-03", "2026-10-20T00:00:00Z", " 2026-10-20", undefined]) {
      assert.equal(validate({ ...base, planned_start_date: bad }).valid, false);
      assert.equal(validate({ ...base, planned_end_date: bad }).valid, false);
    }
    assert.equal(validate({ ...base, planned_start_date: "2026-10-21", planned_end_date: "2026-10-20" }).valid, false);
  }
});

test("[P0] 16.3-UNIT-003 status graph has four states and exactly two independently manager-only reopen edges", async () => {
  const api = await domain();
  const ordinary = new Set(["created:in_progress", "created:cancelled", "in_progress:done", "in_progress:cancelled"]);
  const reopen = new Set(["done:in_progress", "cancelled:created"]);
  const states: Status[] = ["created", "in_progress", "done", "cancelled"];
  for (const from of states) for (const to of states.filter(value => value !== from)) {
    assert.equal(api.canTransitionWorkOrderStatus(from, to, { canReopen: false }), ordinary.has(`${from}:${to}`), `${from}:${to} lead`);
    assert.equal(api.canTransitionWorkOrderStatus(from, to, { canReopen: true }), ordinary.has(`${from}:${to}`) || reopen.has(`${from}:${to}`), `${from}:${to} manager`);
  }
  const input = { ...identity, workOrderId: ids.order, status: "in_progress" };
  assert.deepEqual(api.validateWorkOrderStatusInput(input), { valid: true, value: input });
  for (const status of ["completed", "archived", "", null]) assert.equal(api.validateWorkOrderStatusInput({ ...input, status }).valid, false);
  for (const key of ["title", "canReopen", "actorId", "tenantId", "designation", "jobStatus"]) {
    assert.equal(api.validateWorkOrderStatusInput({ ...input, [key]: true }).valid, false);
  }
  // Same-state request replay and current manager authority are SQL obligations,
  // not extra graph edges or a client-supplied reopen capability.
});

test("[P0] 16.3-UNIT-004 plural assignment and typed dependency inputs reject smuggling/self/duplicates but admit distinct same-parent orders", async () => {
  const api = await domain();
  const base = { ...identity, workOrderId: ids.order };
  for (const personProfileIds of [[], [ids.person], [ids.person, ids.otherPerson]]) {
    const input = { ...base, personProfileIds };
    assert.deepEqual(api.validateWorkOrderAssigneesInput(input), { valid: true, value: input });
  }
  for (const personProfileIds of [[ids.person, ids.person], ["invalid"], null, ids.person]) {
    assert.equal(api.validateWorkOrderAssigneesInput({ ...base, personProfileIds }).valid, false);
  }
  assert.equal(api.validateWorkOrderAssigneesInput({ ...base, personProfileIds: [], role: "tenant_admin" }).valid, false);
  const sameParent = { jobId: ids.job, workOrderId: ids.prerequisite };
  const jobTarget = { jobId: ids.otherJob, workOrderId: null };
  const dependencies = { ...base, prerequisites: [sameParent, jobTarget] };
  assert.deepEqual(api.validateWorkOrderDependenciesInput(dependencies), { valid: true, value: dependencies });
  for (const prerequisites of [
    [{ jobId: ids.job, workOrderId: ids.order }], [sameParent, sameParent],
    [{ jobId: ids.job, workOrderId: "invalid" }],
    [{ ...sameParent, tenantId: ids.otherJob }], [ids.prerequisite],
  ]) assert.equal(api.validateWorkOrderDependenciesInput({ ...base, prerequisites }).valid, false);
  const jobDependencies = { ...identity, prerequisites: [sameParent] };
  assert.deepEqual(api.validateJobWorkOrderDependenciesInput(jobDependencies), { valid: true, value: jobDependencies });
  assert.equal(api.validateJobWorkOrderDependenciesInput({ ...identity, prerequisites: [jobTarget] }).valid, false, "both-null job→job remains in old job_dependencies");
  // No unapproved multi-node cycle rule. Valid UUIDs are not eligibility proof:
  // current person membership and endpoint parent coherence are checked in SQL.
});

test("[P0] 16.3-UNIT-005 warning compares actual typed endpoint dates; equality clears and unreadable timing stays anonymous unknown", async () => {
  const api = await domain();
  const order = { jobId: ids.job, workOrderId: ids.order, readable: true, plannedStartDate: "2026-10-20", plannedEndDate: "2026-10-21" };
  const prerequisite = { jobId: ids.job, workOrderId: ids.prerequisite, readable: true, plannedStartDate: "2026-10-01", plannedEndDate: "2026-10-22" };
  for (const pair of [
    { dependent: order, prerequisite },
    { dependent: { ...order, workOrderId: null }, prerequisite },
    { dependent: order, prerequisite: { ...prerequisite, jobId: ids.otherJob, workOrderId: null } },
    { dependent: order, prerequisite: { ...prerequisite, jobId: ids.otherJob } },
  ]) {
    assert.equal(api.evaluateWorkOrderDependency(pair).state, "delay");
    assert.equal(api.evaluateWorkOrderDependency({ ...pair, prerequisite: { ...pair.prerequisite, plannedEndDate: "2026-10-20" } }).state, "clear");
    assert.equal(api.evaluateWorkOrderDependency({ ...pair, prerequisite: { ...pair.prerequisite, plannedEndDate: "2026-10-19" } }).state, "clear");
  }
  assert.deepEqual(api.evaluateWorkOrderDependency({ dependent: { ...order, plannedStartDate: null }, prerequisite }), { state: "unknown" });
  assert.deepEqual(api.evaluateWorkOrderDependency({ dependent: order, prerequisite: { ...prerequisite, plannedEndDate: null } }), { state: "unknown" });
  assert.deepEqual(api.evaluateWorkOrderDependency({ dependent: order, prerequisite: { ...prerequisite, readable: false } }), { state: "unknown" });
  // Even with other parent timing available, missing own work-order timing must
  // never inherit a parent date. Only the actual resolved endpoint is supplied.
});

test("[P0] 16.3-UNIT-006 uncertain retry/late confirmation retain newer input and dirty fields keep their original consent baseline", async () => {
  const api = await domain();
  const original = { ...identity, workOrderId: ids.order, ...fields };
  const newer = { ...original, title: "Newer unsent label" };
  const pending = api.transitionWorkOrderDraft(api.createWorkOrderDraft("update", original), { type: "submit", commandId: ids.command });
  const edited = api.transitionWorkOrderDraft(pending, { type: "edit", input: newer });
  const uncertain = api.transitionWorkOrderDraft(edited, { type: "uncertain", commandId: ids.command });
  const retry = api.transitionWorkOrderDraft(uncertain, { type: "retry" });
  assert.deepEqual(retry.submission, { commandId: ids.command, input: original });
  assert.deepEqual(retry.input, newer);
  assert.notEqual(retry.status, "persisted");
  const confirmed = api.transitionWorkOrderDraft(retry, { type: "persisted", commandId: ids.command });
  assert.deepEqual(confirmed.input, newer);
  assert.notEqual(confirmed.status, "persisted");
  const stale = api.transitionWorkOrderDraft(edited, { type: "stale", commandId: ids.command });
  const refusedRetry = api.transitionWorkOrderDraft(stale, { type: "retry" });
  assert.equal(refusedRetry.status, "refetch-required");
  const current = { ...original, title: "Current server label", expectedState: "b".repeat(64) };
  const refetched = api.transitionWorkOrderDraft(refusedRetry, { type: "refetched", current });
  assert.deepEqual(refetched.input, newer);
  assert.deepEqual(refetched.current, current);
  assert.notEqual(refetched.status, "submitting");
  const baseline = { title: "Original" }, submitted = { title: "Submitted" }, visible = { title: "Newer" };
  const field = api.editWorkOrderField(api.createWorkOrderField(baseline, "state-A"), submitted);
  const dirty = api.editWorkOrderField(field, visible);
  const received = api.receiveWorkOrderField(dirty, { title: "Server" }, "state-B");
  assert.deepEqual(received, { value: visible, baseline, expectedState: "state-A" });
  const late = api.confirmWorkOrderField(received, submitted, { title: "" }, "committed");
  assert.deepEqual(late, received);
  const reverted = api.editWorkOrderField(field, baseline);
  const confirmedRevert = api.confirmWorkOrderField(reverted, submitted, {title: "Server"}, "committed");
  assert.deepEqual(confirmedRevert.value, baseline);
  assert.equal(confirmedRevert.expectedState, "state-A");
  assert.deepEqual(api.receiveWorkOrderField(confirmedRevert, {title: "Server"}, "state-C"), confirmedRevert);
  const consented = api.consentWorkOrderField(late, { title: "Server" }, "state-B");
  assert.deepEqual(consented.value, visible);
  assert.equal(consented.expectedState, "state-B");
});



