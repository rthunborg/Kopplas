/** Attempt identity survives an unknown response. A different proposal needs a new command. */
export type ResolverAttempt<T> = { request: T; status: "ready" | "pending" | "unknown" | "confirmed" };
export function resolverAttemptAfter<T>(attempt: ResolverAttempt<T>, result: "success" | "failure" | "unknown"): ResolverAttempt<T> {
  return { request: attempt.request, status: result === "success" ? "confirmed" : result === "unknown" ? "unknown" : "ready" };
}
export function currentResolverResponse(current: number, response: number): boolean { return current === response; }
