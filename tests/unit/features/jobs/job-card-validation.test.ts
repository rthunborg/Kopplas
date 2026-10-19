import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createJobCardDraft,
  transitionJobCardDraft as transition,
  validateJobCard,
} from "@/features/jobs/job-card-domain";

function valid(input: unknown) {
  const result = validateJobCard(input);
  assert.equal(result.valid, true);
  if (!result.valid) assert.fail("Expected valid card");
  return result.value;
}
function invalid(input: unknown, field: string) {
  const result = validateJobCard(input);
  assert.equal(result.valid, false);
  if (result.valid) assert.fail("Expected field issues");
  assert.ok(result.issues.some((issue) => issue.field === field));
}

test("priority defaults once; optional omission and explicit null remain distinct", () => {
  assert.deepEqual(valid({}), { priority: "normal" });
  const explicit = { durationMinutes: null, travelMinutes: null, crewSize: null,
    earliestDate: null, desiredDate: null, latestDate: null };
  assert.deepEqual(valid(Object.freeze(explicit)), { priority: "normal", ...explicit });
  assert.deepEqual(createJobCardDraft().input, { priority: "normal" });
  invalid({ priority: undefined }, "priority");
  invalid({ durationMinutes: undefined }, "durationMinutes");
});

test("every actual priority is accepted without coercion", () => {
  for (const priority of ["low", "normal", "high", "urgent"]) assert.equal(valid({ priority }).priority, priority);
  for (const priority of [null, "HIGH", "", 1, false]) invalid({ priority }, "priority");
});

for (const field of ["durationMinutes", "travelMinutes", "crewSize"] as const) {
  test(`${field} enforces its integer lower bound, with no invented maximum`, () => {
    assert.equal(valid({ [field]: 1 })[field], 1);
    assert.equal(valid({ [field]: 1000000000 })[field], 1000000000);
    if (field === "travelMinutes") assert.equal(valid({ [field]: 0 })[field], 0);
    else invalid({ [field]: 0 }, field);
    for (const value of [-1, 0.5, NaN, Infinity, -Infinity, "1", "", true, {}, []]) invalid({ [field]: value }, field);
  });
}

test("closed core rejects unknown/source/actor/tenant/money keys", () => {
  for (const key of ["unknown", "sourceId", "actorId", "tenantId", "budget", "constructor", "__proto__"]) {
    invalid({ [key]: "sentinel" }, key);
  }
  invalid({ [Symbol("unknown")]: 1 }, "Symbol(unknown)");
  for (const input of [null, [], "", 12, false]) invalid(input, "$");
});

for (const date of ["2024-02-29", "2000-02-29", "2026-01-31", "2026-04-30", "0001-01-01", "9999-12-31"]) {
  test(`accepts actual calendar date ${date} in all independent fields`, () => {
    assert.deepEqual(valid({ earliestDate: date, desiredDate: date, latestDate: date }), {
      priority: "normal", earliestDate: date, desiredDate: date, latestDate: date,
    });
  });
}

test("invalid Gregorian dates and timestamp/locale representations fail", () => {
  for (const date of ["1900-02-29", "2026-02-29", "2024-02-30", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "0000-01-01", "2026-1-01", "2026-01-1", "2026-01-01T00:00:00Z", " 2026-01-01", "2026-01-01\n", "01/01/2026", ""]) {
    for (const field of ["earliestDate", "desiredDate", "latestDate"]) invalid({ [field]: date }, field);
  }
});

test("earliest/latest order crosses month/year boundaries; desired stays a soft target", () => {
  invalid({ earliestDate: "2027-01-01", latestDate: "2026-12-31" }, "latestDate");
  invalid({ earliestDate: "2026-03-01", latestDate: "2026-02-28" }, "latestDate");
  for (const desiredDate of ["2020-01-01", "2030-01-01"]) {
    assert.equal(valid({ earliestDate: "2026-12-31", latestDate: "2027-01-01", desiredDate }).desiredDate, desiredDate);
  }
  assert.deepEqual(valid({ earliestDate: "2026-01-01" }), { priority: "normal", earliestDate: "2026-01-01" });
  assert.deepEqual(valid({ latestDate: "2026-01-01", earliestDate: null }), { priority: "normal", latestDate: "2026-01-01", earliestDate: null });
});

const submit = { type: "submit", candidateId: "candidate-A", commandId: "command-A" } as const;
const completion = { candidateId: "candidate-A", commandId: "command-A", revision: 0 } as const;

test("matching confirmed completion alone marks the current revision persisted", () => {
  const initial = createJobCardDraft({ durationMinutes: 30 });
  const pending = transition(initial, submit);
  assert.equal(initial.status, "editing");
  assert.equal(pending.status, "submitting");
  const failed = transition(pending, { type: "failed", ...completion });
  assert.equal(failed.status, "failed");
  assert.deepEqual(failed.input, { durationMinutes: 30 });
  const retried = transition(failed, { type: "retry" });
  assert.equal(retried.status, "submitting");
  assert.deepEqual(retried.submission?.value, { priority: "normal", durationMinutes: 30 });
  assert.equal(retried.submission?.commandId, submit.commandId);
  const persisted = transition(retried, { type: "confirmed", ...completion });
  assert.equal(persisted.status, "persisted");
  assert.equal(persisted.submission?.status, "confirmed");
  assert.strictEqual(transition(persisted, { type: "failed", ...completion }), persisted);
});

test("newer edits survive old failure, retry and success without rebinding payload or IDs", () => {
  const input = { durationMinutes: 30 };
  const initial = createJobCardDraft(input);
  input.durationMinutes = 99;
  const pending = transition(initial, submit);
  const editedInput = { durationMinutes: 60 };
  const edited = transition(pending, { type: "edit", input: editedInput });
  editedInput.durationMinutes = 90;
  const failed = transition(edited, { type: "failed", ...completion });
  assert.equal(failed.status, "editing");
  const retried = transition(failed, { type: "retry" });
  assert.equal(retried.status, "editing");
  assert.deepEqual(retried.input, { durationMinutes: 60 });
  assert.equal(retried.submission?.revision, 0);
  assert.equal(retried.submission?.candidateId, submit.candidateId);
  assert.equal(retried.submission?.commandId, submit.commandId);
  assert.deepEqual(retried.submission?.input, { durationMinutes: 30 });
  assert.deepEqual(retried.submission?.value, { priority: "normal", durationMinutes: 30 });
  assert.strictEqual(transition(retried, { ...submit, commandId: "new-command" }), retried);
  const completed = transition(retried, { type: "confirmed", ...completion });
  assert.equal(completed.status, "editing");
  assert.deepEqual(completed.input, { durationMinutes: 60 });
  const next = transition(completed, { ...submit, candidateId: "candidate-B", commandId: "command-B" });
  assert.equal(next.submission?.revision, 1);
  assert.deepEqual(next.submission?.input, { durationMinutes: 60 });
  assert.strictEqual(transition(next, { type: "confirmed", ...completion }), next);
});

test("wrong candidate, command, or revision cannot complete a submission", () => {
  const pending = transition(createJobCardDraft(), submit);
  for (const mismatch of [{ candidateId: "other" }, { commandId: "other" }, { revision: 1 }]) {
    for (const type of ["confirmed", "failed"] as const) {
      assert.strictEqual(transition(pending, { type, ...completion, ...mismatch }), pending);
    }
  }
});

test("invalid input is retained unsent and immutable transitions never mutate earlier states", () => {
  const initial = createJobCardDraft({ durationMinutes: "not-yet-a-number" });
  assert.strictEqual(transition(initial, submit), initial);
  assert.strictEqual(transition(initial, { type: "retry" }), initial);
  assert.strictEqual(transition(initial, { type: "confirmed", ...completion }), initial);
  const edited = transition(initial, { type: "edit", input: { durationMinutes: 10 } });
  assert.deepEqual(initial.input, { durationMinutes: "not-yet-a-number" });
  assert.equal(initial.revision, 0);
  assert.equal(edited.revision, 1);
  assert.ok(Object.isFrozen(edited));
  assert.ok(Object.isFrozen(edited.input));
  const pending = transition(edited, submit);
  assert.ok(Object.isFrozen(pending.submission));
  assert.ok(Object.isFrozen(pending.submission?.value));
  assert.equal(edited.submission, null);
});
