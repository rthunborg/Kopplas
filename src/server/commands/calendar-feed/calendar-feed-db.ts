import type { CommandDbClient } from "../envelope";
import { CommandError } from "../command-errors";
export async function executeCalendarFeed(db: CommandDbClient, args: Record<string, unknown>): Promise<{ outcome: "committed" | "replayed"; revision: number }> {
  const { data, error } = await (db as unknown as { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { code?: string } | null }> }).rpc("manage_calendar_feed", args);
  if (error) {
    if (error.code === "CF409") throw new CommandError("COMMAND_CONFLICT");
    if (error.code === "42501") throw new CommandError("TENANT_ACCESS_DENIED");
    throw new Error("Calendar write unavailable");
  }
  const result = data as Record<string, unknown> | null;
  if (!result || !["committed", "replayed"].includes(String(result.outcome)) || !Number.isSafeInteger(result.revision) || Number(result.revision) < 0) throw new Error("Calendar write unavailable");
  return { outcome: result.outcome as "committed" | "replayed", revision: result.revision as number };
}
