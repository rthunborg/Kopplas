import type { CommandDbClient } from "../envelope";
import type { CommandExecuteContext } from "../envelope-core";
import { CommandError } from "../command-errors";
import { throwMappedWriteError } from "./calc-db";
import type { EditorKind, EditorSafetyInput } from "@/features/calculations/editor-operation";

export interface EditorOperationProof {
  readonly operationId: string;
  readonly status: "committed" | "closed" | "unconfirmed";
  readonly targetId?: string | null;
  readonly targetAvailable?: boolean;
  readonly quoteId?: string;
  readonly quoteNumber?: number;
  readonly code?: "COMMAND_CONFLICT";
}
type RpcClient = { rpc(name: string, args: Record<string, unknown>): Promise<{ data: unknown; error: { code?: string; message?: string } | null }> };
/** Same request-bound client; there is no privileged credential or direct proof-table read. */
export async function editorOperationRpc(db: CommandDbClient, name: string, args: Record<string, unknown>): Promise<EditorOperationProof> {
  const { data, error } = await (db as unknown as RpcClient).rpc(name, args);
  if (error) {
    if (error.code === "CE409") throw new CommandError("COMMAND_CONFLICT");
    throwMappedWriteError(error);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid editor operation response");
  const p = data as EditorOperationProof;
  if (typeof p.operationId !== "string" || !["committed", "closed", "unconfirmed"].includes(p.status)) throw new Error("Invalid editor proof");
  return p;
}
export async function mutateEditor<I extends EditorSafetyInput>(ctx: CommandExecuteContext<I, CommandDbClient>, kind: EditorKind): Promise<{ targetId: string; operationId: string; targetAvailable: boolean }> {
  if (ctx.correlationId !== ctx.input.operation_id) throw new CommandError("VALIDATION_FAILED");
  const proof = await editorOperationRpc(ctx.db, "mutate_calculation_editor", {
    p_tenant_id: ctx.tenantContext.tenantId,
    p_actor_user_id: ctx.tenantContext.userId,
    p_operation_id: ctx.input.operation_id,
    p_kind: kind,
    p_input: ctx.input,
    p_captured_at: ctx.clock.now().toISOString(),
  });
  if (proof.status === "closed") throw new CommandError("COMMAND_CONFLICT");
  if (proof.status !== "committed") throw new Error("Editor operation remains unconfirmed");
  return { targetId: proof.targetId ?? "", operationId: proof.operationId, targetAvailable: proof.targetAvailable !== false };
}
