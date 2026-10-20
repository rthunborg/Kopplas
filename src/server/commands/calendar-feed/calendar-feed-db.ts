import type { CommandDbClient } from "../envelope";
import { CommandError } from "../command-errors";
import { AsyncLocalStorage } from "node:async_hooks";

// Explicit test-owned invocation scope only. No logger, environment switch,
// client/thenable observer, argument retention or change to command results.
export const calendarFeedTraceEvents = ["input-invalid", "execute-enter", "key-ready", "status-enter", "status-rpc42501", "status-rpc-error", "status-schema-invalid", "status-valid", "proof-enter", "manage-enter", "manage-rpc42501", "manage-rpcCF409", "manage-rpc-error", "manage-schema-invalid", "manage-valid", "envelope-success", "envelope-UNAUTHENTICATED", "envelope-TENANT_MEMBERSHIP_REQUIRED", "envelope-PERMISSION_DENIED", "envelope-VALIDATION_FAILED", "envelope-TENANT_ACCESS_DENIED", "envelope-COMMAND_CONFLICT", "envelope-SERVER_ERROR", "envelope-other", "context-match", "context-mismatch", "membership-match", "membership-mismatch", "truncated"] as const;
export type CalendarFeedTraceEvent = typeof calendarFeedTraceEvents[number];
type Expected = { tenantId: string; userId: string; membershipId: string; attemptId: string; revision: number; action: string };
const invocation = new AsyncLocalStorage<{ expected?: Expected; events: CalendarFeedTraceEvent[]; closed: boolean }>();
export function recordCalendarFeedTrace(event: CalendarFeedTraceEvent): void {
  const store = invocation.getStore();
  if (!store || store.closed || !calendarFeedTraceEvents.includes(event)) return;
  if (store.events.length < 15) store.events.push(event);
  else if (store.events.length === 15) store.events.push("truncated");
}
export function recordCalendarFeedContext(tenantId: string, userId: string, input: { action: string; revision: number; attemptId: string }): void {
  const expected = invocation.getStore()?.expected;
  if (expected) recordCalendarFeedTrace(tenantId === expected.tenantId && userId === expected.userId && input.action === expected.action && input.revision === expected.revision && input.attemptId === expected.attemptId ? "context-match" : "context-mismatch");
}
export function recordCalendarFeedMembership(id: string): void {
  const expected = invocation.getStore()?.expected;
  if (expected) recordCalendarFeedTrace(id === expected.membershipId ? "membership-match" : "membership-mismatch");
}
export async function captureCalendarFeedTrace<T>(expected: Expected, run: () => Promise<T>) {
  const events: CalendarFeedTraceEvent[] = [];
  const snapshot = {} as Expected;
  // A malformed opt-in fixture cannot introduce getter reads into production.
  try { for (const key of ["tenantId", "userId", "membershipId", "attemptId", "revision", "action"] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(expected, key);
    if (!descriptor || !("value" in descriptor) || (key === "revision" ? !Number.isSafeInteger(descriptor.value) : typeof descriptor.value !== "string")) throw new Error("Calendar trace expected-context refused");
    Object.defineProperty(snapshot, key, { value: descriptor.value, enumerable: true });
  } } catch { throw new Error("Calendar trace expected-context refused"); }
  const store = { expected: snapshot as Expected | undefined, events, closed: false };
  return invocation.run(store, async () => {
    try { const value = await run(); return { ok: true as const, value, events: [...events] }; }
    catch (error) { return { ok: false as const, error, events: [...events] }; }
    finally { store.closed = true; store.expected = undefined; }
  });
}
export async function executeCalendarFeed(db: CommandDbClient, args: Record<string, unknown>): Promise<{ outcome: "committed" | "replayed"; revision: number }> {
  const { data, error } = await (db as unknown as { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { code?: string } | null }> }).rpc("manage_calendar_feed", args);
  if (error) {
    if (error.code === "CF409") { recordCalendarFeedTrace("manage-rpcCF409"); throw new CommandError("COMMAND_CONFLICT"); }
    if (error.code === "42501") { recordCalendarFeedTrace("manage-rpc42501"); throw new CommandError("TENANT_ACCESS_DENIED"); }
    recordCalendarFeedTrace("manage-rpc-error");
    throw new Error("Calendar write unavailable");
  }
  const result = data as Record<string, unknown> | null;
  if (!result || !["committed", "replayed"].includes(String(result.outcome)) || !Number.isSafeInteger(result.revision) || Number(result.revision) < 0) { recordCalendarFeedTrace("manage-schema-invalid"); throw new Error("Calendar write unavailable"); }
  recordCalendarFeedTrace("manage-valid");
  return { outcome: result.outcome as "committed" | "replayed", revision: result.revision as number };
}
