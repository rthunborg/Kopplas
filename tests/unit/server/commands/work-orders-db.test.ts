import {test} from "node:test";
import assert from "node:assert/strict";
import {workOrderMutation} from "@/server/commands/jobs/work-orders-db";
import {CommandError} from "@/server/commands/command-errors";
type Reply = {data: unknown; error: {code: string} | null};
function context(rpc: (name: string, args: Record<string, unknown>) => Promise<Reply>) {
  return {tenantContext: {tenantId: "tenant", userId: "actor"}, correlationId: "original-correlation", input: {
    commandId: "original-command", jobId: "job", expectedState: "a".repeat(64), title: "Original draft",
    description: null, planned_start_date: null, planned_end_date: null,
  }, db: {rpc}} as unknown as Parameters<typeof workOrderMutation>[0];
}

test("16.3 stale create recovers only the original identity with identical canonical request arguments", async () => {
  const calls: {name: string; args: Record<string, unknown>}[] = [];
  const result = await workOrderMutation(context(async (name, args) => {
    calls.push({name,args: structuredClone(args)});
    return name === "create_work_order_with_audit" ? {data: null,error: {code: "BK409"}} : {data: {jobId: "job",workOrderId: "original-child"},error: null};
  }), "create_work_order_with_audit");
  assert.deepEqual(result, {jobId: "job",workOrderId: "original-child"});
  assert.deepEqual(calls.map(c => c.name), ["create_work_order_with_audit","reconcile_work_order_create"]);
  assert.deepEqual(calls[1].args,calls[0].args);
  assert.equal(calls[1].args.p_command_id,"original-command"); assert.equal(calls[1].args.p_correlation_id,"original-correlation");
});

test("16.3 failed reconciliation remains stale/denied; other mutation replay never uses create recovery", async () => {
  for (const code of ["BK409","42501"]) {
    const calls: string[] = [];
    await assert.rejects(workOrderMutation(context(async name => {
      calls.push(name); return {data: null,error: {code: name === "create_work_order_with_audit" ? "BK409" : code}};
    }),"create_work_order_with_audit"), (error: unknown) => error instanceof CommandError && error.code === (code === "BK409" ? "PREVIEW_STALE" : "TENANT_ACCESS_DENIED"));
    assert.deepEqual(calls,["create_work_order_with_audit","reconcile_work_order_create"]);
  }
  const calls: string[] = [];
  await assert.rejects(workOrderMutation(context(async name => {calls.push(name);return {data: null,error: {code:"BK409"}};}),"update_work_order_with_audit"),
    (error: unknown) => error instanceof CommandError && error.code === "PREVIEW_STALE");
  assert.deepEqual(calls,["update_work_order_with_audit"]);
});

test("16.3 stale never-committed create is a definite conflict rather than unresolved transport uncertainty", async () => {
  const calls: string[] = [];
  await assert.rejects(workOrderMutation(context(async name => {
    calls.push(name); return {data: null,error: {code: name === "create_work_order_with_audit" ? "BK409" : "BK404"}};
  }),"create_work_order_with_audit"), (error: unknown) => error instanceof CommandError && error.code === "COMMAND_CONFLICT");
  assert.deepEqual(calls,["create_work_order_with_audit","reconcile_work_order_create"]);
});
