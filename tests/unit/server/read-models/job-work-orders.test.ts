import {test} from "node:test";
import assert from "node:assert/strict";
import {readJobWorkOrders, readJobWorkOrdersForPage} from "@/server/read-models/job-work-orders";

const jobId = "job", workOrderId = "work-order";
const projection = () => ({
  expectedState: "a".repeat(64), canEditWorkOrders: true, canReopenWorkOrders: false, canEditJobDependencies: false,
  rows: [{id: workOrderId, jobId, title: "Installera central", description: null, status: "created",
    plannedStartDate: null, plannedEndDate: "2026-10-21", assignees: [{id: "person", label: "Montör", email: "private@example.com"}],
    tenant_id: "private-tenant", acceptedPriceOre: 100, auth_user_id: "private-auth", outcome: {private: true}}],
  eligiblePeople: [{id: "person", label: "Montör", hourly_cost: 300}],
  prerequisiteOptions: [{jobId, workOrderId: "prerequisite", label: "Mätning", privateNote: "private"}],
  dependencies: [{dependent: {jobId, workOrderId, private: true}, prerequisite: {jobId, workOrderId: "prerequisite", private: true}}],
  dependencyWarnings: [{state: "unknown", dependent: {jobId, workOrderId}, privatePrerequisiteId: "hidden"}],
  money: {private: true}, roles: ["admin"],
});

test("16.3 read DTO strips protected/raw metadata from every nested projection", async () => {
  const result = await readJobWorkOrders({rpc: async (name, args) => {
    assert.equal(name, "read_job_work_orders"); assert.deepEqual(args, {p_job_id: jobId});
    return {data: projection(), error: null};
  }}, jobId);
  assert.equal(result.rows[0].title, "Installera central");
  assert.equal(result.rows[0].plannedStartDate, null);
  assert.deepEqual(result.rows[0].assignees, [{id: "person", label: "Montör"}]);
  assert.deepEqual(result.eligiblePeople, [{id: "person", label: "Montör"}]);
  assert.deepEqual(result.prerequisiteOptions, [{jobId, workOrderId: "prerequisite", label: "Mätning"}]);
  assert.deepEqual(result.dependencies, [{dependent: {jobId, workOrderId}, prerequisite: {jobId, workOrderId: "prerequisite"}}]);
  assert.deepEqual(result.dependencyWarnings, [{state: "unknown", dependent: {jobId, workOrderId}}]);
  const serialized = JSON.stringify(result);
  for (const privateValue of ["private", "acceptedPriceOre", "auth_user_id", "hourly_cost", "roles", "hidden", "email"]) {
    assert.equal(serialized.includes(privateValue), false, privateValue);
  }
  assert.equal(result.canReopenWorkOrders, false);
  assert.equal(result.canEditJobDependencies, false);
});

test("16.3 parent mismatch, malformed state/status and failed reads remain actionable failures", async () => {
  for (const patch of [
    {expectedState: ""}, {rows: [{...projection().rows[0], jobId: "other-parent"}]},
    {rows: [{...projection().rows[0], status: "approved"}]}, {eligiblePeople: null},
  ]) {
    const reply = await readJobWorkOrdersForPage({rpc: async () => ({data: {...projection(), ...patch}, error: null})}, jobId);
    assert.equal(reply.ok, false);
  }
  const failed = await readJobWorkOrdersForPage({rpc: async () => ({data: null, error: "private database failure"})}, jobId);
  assert.deepEqual(failed, {ok: false, message: "Arbetsorder kunde inte hämtas. Försök igen."});
  const empty = await readJobWorkOrdersForPage({rpc: async () => ({data: {...projection(), rows: []}, error: null})}, jobId);
  assert.equal(empty.ok, true);
});
