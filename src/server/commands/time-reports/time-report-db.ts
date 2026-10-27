import type { CommandDbClient } from "../envelope";
import { CommandError } from "../command-errors";

/** SQL owns the business write and audit; this adapter exposes only a stable ID. */
export async function executeTimeReport(db: CommandDbClient, operation: "file_time_report" | "annotate_time_report", args: Record<string, unknown>): Promise<{ reportId: string }> {
  const rpc = db as unknown as { rpc(name: string, input: Record<string, unknown>): PromiseLike<{ data: unknown; error: { code?: string } | null }> };
  const { data, error } = await rpc.rpc(operation, args);
  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "TR409") throw new CommandError("COMMAND_CONFLICT");
    if (code === "42501" || code === "23503") throw new CommandError("TENANT_ACCESS_DENIED");
    if (["23514", "22P02", "22007", "22008", "22003"].includes(code ?? "")) throw new CommandError("VALIDATION_FAILED");
    throw new Error("Time report write failed");
  }
  const result = data as { reportId?: unknown } | null;
  if (!result || typeof result.reportId !== "string" || !/^[0-9a-f-]{36}$/i.test(result.reportId)) throw new Error("Time report response invalid");
  return { reportId: result.reportId };
}
