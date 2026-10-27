import assert from "node:assert/strict";
import { test } from "node:test";
import { runJobsDepthReadBatch } from "../../support/jobs-depth-read-batch";

const tick = () => new Promise<void>(resolve => setImmediate(resolve));
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}

test("five distinct role contexts run once, at most three at a time, and retain input-to-result mapping", async () => {
  const roles = ["tenant_admin", "projektledare", "montor", "saljare", "ekonomi"];
  const gates = roles.map(deferred), invoked: number[] = [];
  let active = 0, maximum = 0;
  const pending = runJobsDepthReadBatch(roles.map((role, index) => async () => {
    invoked.push(index); maximum = Math.max(maximum, ++active);
    await gates[index].promise; active--; return { role };
  }));
  await tick(); assert.deepEqual(invoked, [0, 1, 2]);
  gates[2].resolve(); await tick(); assert.deepEqual(invoked, [0, 1, 2, 3]);
  gates[0].resolve(); await tick(); assert.deepEqual(invoked, [0, 1, 2, 3, 4]);
  gates[4].resolve(); gates[3].resolve(); gates[1].resolve();
  assert.deepEqual((await pending).map(value => value.role), roles);
  assert.equal(maximum, 3); assert.equal(active, 0);
});

test("invited, disabled and orphan contexts all settle before assertions or later fixture mutation", async () => {
  const contexts = ["invited", "disabled", "orphan"], gates = contexts.map(deferred);
  const invoked: string[] = [], settled: string[] = [];
  const pending = runJobsDepthReadBatch(contexts.map((context, index) => async () => {
    invoked.push(context); await gates[index].promise; settled.push(context);
    return { context, data: [] };
  }));
  await tick(); assert.deepEqual(invoked, contexts);
  gates[2].resolve(); gates[0].resolve(); await tick();
  assert.deepEqual(settled, ["orphan", "invited"]);
  let returned = false; void pending.then(() => { returned = true; });
  await tick(); assert.equal(returned, false);
  gates[1].resolve(); const results = await pending;
  assert.deepEqual(results.map(value => value.context), contexts);
  for (const result of results) assert.deepEqual(result.data, []);
  assert.equal(settled.length, 3);
});

test("sync and async sign-in/read errors drain all eight queued contexts before original input-order failure reaches cleanup", async () => {
  const first = new Error("first input failure"), later = new Error("later input failure");
  const gates = Array.from({ length: 8 }, deferred), invoked: number[] = [];
  let active = 0, maximum = 0, cleanupActive: number | undefined;
  const operations = gates.map((gate, index) => () => {
    invoked.push(index);
    if (index === 0) throw first;
    if (index === 1) return Promise.reject(later);
    maximum = Math.max(maximum, ++active);
    return gate.promise.then(() => { active--; return index; });
  });
  let completed = false;
  const pending = runJobsDepthReadBatch(operations).finally(() => { cleanupActive = active; completed = true; });
  // Attach rejection handling immediately, but keep the fixture until every task settles.
  const outcome = pending.then(() => assert.fail("expected original failure"), reason => reason);
  await tick(); assert.equal(completed, false); assert.equal(active, 3);
  for (const gate of gates) gate.resolve();
  assert.equal(await outcome, first);
  assert.deepEqual(invoked, [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(maximum, 3); assert.equal(cleanupActive, 0);
});

test("client creation fully settles before the read batch starts, including non-Promise thenables", async () => {
  const created: number[] = [], reads: number[] = [];
  const clients = await runJobsDepthReadBatch(Array.from({ length: 5 }, (_, index) => () => ({
    then(resolve: (value: { read: () => number }) => unknown) {
      created.push(index); resolve({ read() { assert.equal(created.length, 5); reads.push(index); return index; } });
    },
  }) as PromiseLike<{ read: () => number }>));
  assert.deepEqual(reads, []);
  assert.deepEqual(await runJobsDepthReadBatch(clients.map(client => () => client.read())), [0, 1, 2, 3, 4]);
  assert.deepEqual(reads, [0, 1, 2, 3, 4]);
  assert.deepEqual(await runJobsDepthReadBatch([]), []);
});
