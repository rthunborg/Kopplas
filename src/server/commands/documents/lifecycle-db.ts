import { CommandError } from "../command-errors";
import type { CommandDbClient } from "../envelope";
export interface DocumentLifecycleArgs { readonly p_tenant_id: string; readonly p_actor_user_id: string; readonly p_link_id: string; readonly p_file_id: string; readonly p_correlation_id: string; }
export interface DocumentLifecycleResult { readonly targetId: string; readonly changed: boolean; readonly lifecycleState: string; }
/** The checked transaction alone derives graph authority, origin and the success audit. */
export async function executeDocumentLifecycle(db: CommandDbClient, operation: "archive" | "restore", args: DocumentLifecycleArgs): Promise<DocumentLifecycleResult> {
  const rpc = db as unknown as { rpc(name: string, input: object): Promise<{ data: unknown; error: { code?: string } | null }> };
  const { data, error } = await rpc.rpc(operation === "archive" ? "archive_document_with_audit" : "restore_document_with_audit", { ...args, ...(operation === "archive" ? { p_reason: null } : {}) });
  if (error) { if (error.code === "DLC20") throw new CommandError("COMMAND_CONFLICT"); if (error.code === "42501" || error.code === "FSA10") throw new CommandError("TENANT_ACCESS_DENIED"); throw new Error("Document lifecycle unavailable"); }
  const row = Array.isArray(data) && data.length === 1 ? data[0] as Record<string, unknown> : null;
  if (!row || row.file_id !== args.p_file_id || typeof row.changed !== "boolean" || (operation === "archive" ? row.lifecycle_state !== "archived" : !["linked", "locked"].includes(String(row.lifecycle_state)))) throw new Error("Invalid lifecycle response");
  return { targetId: args.p_file_id, changed: row.changed, lifecycleState: String(row.lifecycle_state) };
}
