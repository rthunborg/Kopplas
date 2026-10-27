/** RLS001's independent fixture reads only: fixed concurrency, no retries. */
export async function runJobsDepthReadBatch<T>(
  operations: readonly (() => T | PromiseLike<T>)[],
): Promise<T[]> {
  const results: PromiseSettledResult<T>[] = new Array(operations.length);
  let next = 0;
  async function worker() {
    while (next < operations.length) {
      const index = next++;
      try { results[index] = { status: "fulfilled", value: await operations[index]() }; }
      catch (reason) { results[index] = { status: "rejected", reason }; }
    }
  }
  // Every queued and in-flight operation settles before failure can reach the
  // fixture's finally cleanup, even when an operation throws synchronously.
  const workers = await Promise.allSettled(
    Array.from({ length: Math.min(3, operations.length) }, () => worker()),
  );
  for (const result of results) if (result.status === "rejected") throw result.reason;
  for (const result of workers) if (result.status === "rejected") throw result.reason;
  return results.map(result => (result as PromiseFulfilledResult<T>).value);
}
