import { CommandError } from "../command-errors";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";
export async function jobCardRpc(client: BookingRpcClient, name: "snapshot_job_card" | "finalize_job_card", args: Record<string, unknown>) {
  const {data, error} = await client.rpc(name, args);
  if (error) {
    if (error.code === "JT409") throw new CommandError("JOB_TYPE_DOWNGRADE_FORBIDDEN");
    if (["42501", "23503"].includes(error.code ?? "")) throw new CommandError("TENANT_ACCESS_DENIED");
    if (["23514", "22P02", "22007", "22008", "22003"].includes(error.code ?? "")) throw new CommandError("VALIDATION_FAILED");
    if (error.code === "BK409") throw new CommandError("PREVIEW_STALE");
    throw new Error("job card save failed");
  }
  return data;
}
