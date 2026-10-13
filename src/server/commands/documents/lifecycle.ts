import { defineCommand } from "../envelope";
import { CommandError } from "../command-errors";
import { requireCapability } from "@/server/authz/require-capability";
import { validateDocumentSignedAccessInput, type DocumentSignedAccessInput } from "./signed-access";
import { executeDocumentLifecycle, type DocumentLifecycleResult } from "./lifecycle-db";
async function lifecycleBody(operation: "archive" | "restore", ctx: import("../envelope-core").CommandExecuteContext<DocumentSignedAccessInput, import("../envelope").CommandDbClient>) {
  const roles = ctx.tenantContext.roles ?? [];
  for (const [module, capability] of [["documents", "Documents.View"], ["files", "Files.View"]]) if (!requireCapability({ roles, module, capability }).ok) throw new CommandError("PERMISSION_DENIED");
  return executeDocumentLifecycle(ctx.db, operation, { p_tenant_id: ctx.tenantContext.tenantId, p_actor_user_id: ctx.tenantContext.userId, p_link_id: ctx.input.link_id, p_file_id: ctx.input.file_id, p_correlation_id: ctx.correlationId });
}
export const archiveDocument = defineCommand<DocumentSignedAccessInput, DocumentLifecycleResult>({
  command: "document.archive", eventType: "file.archived", targetType: "file", auditable: false,
  validateInput: validateDocumentSignedAccessInput, ownership: input => ({ table: "file_links", id: input.link_id }),
  execute: ctx => lifecycleBody("archive", ctx),
});
export const restoreDocument = defineCommand<DocumentSignedAccessInput, DocumentLifecycleResult>({
  command: "document.restore", eventType: "file.restored", targetType: "file", auditable: false,
  validateInput: validateDocumentSignedAccessInput, ownership: input => ({ table: "file_links", id: input.link_id }),
  execute: ctx => lifecycleBody("restore", ctx),
});
export interface DocumentOperationIdentity {
  readonly tenantId: string; readonly actorUserId: string; readonly linkId: string; readonly fileId: string;
  readonly operation: "archive" | "restore"; readonly correlationId: string;
}
/** Invoked only by an encrypted inline page action. Captured identity constrains a fresh request. */
export async function executeBoundDocumentLifecycle(input: unknown, identity: DocumentOperationIdentity, deps?: {
  createClient: () => Promise<import("../envelope").CommandDbClient>;
  resolveContext: (client: import("../envelope").CommandDbClient) => Promise<{ ok: boolean; data?: { tenantId: string; userId: string } }>;
  execute: (operation: "archive" | "restore", client: import("../envelope").CommandDbClient, input: DocumentSignedAccessInput, correlationId: string) => Promise<import("@/lib/result/result").Result<DocumentLifecycleResult, import("../command-errors").CommandErrorCode>>;
}): Promise<import("@/lib/result/result").Result<DocumentLifecycleResult, import("../command-errors").CommandErrorCode>> {
  const { err } = await import("@/lib/result/result");
  const { COMMAND_MESSAGES } = await import("../command-errors");
  const validated = validateDocumentSignedAccessInput(input);
  if (!validated.ok) return err("VALIDATION_FAILED", COMMAND_MESSAGES.VALIDATION_FAILED);
  if (validated.data.link_id !== identity.linkId || validated.data.file_id !== identity.fileId) return err("TENANT_ACCESS_DENIED", COMMAND_MESSAGES.TENANT_ACCESS_DENIED);
  try {
    const client = deps ? await deps.createClient() : await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient() as unknown as import("../envelope").CommandDbClient;
    const context = deps ? await deps.resolveContext(client) : await (await import("@/server/auth/resolve-tenant-context")).resolveTenantContext({ client: client as never });
    if (!context.ok || context.data?.tenantId !== identity.tenantId || context.data?.userId !== identity.actorUserId) return err("TENANT_ACCESS_DENIED", COMMAND_MESSAGES.TENANT_ACCESS_DENIED);
    if (deps) return await deps.execute(identity.operation, client, validated.data, identity.correlationId);
    const { runCommand } = await import("../envelope");
    return await runCommand(identity.operation === "archive" ? archiveDocument : restoreDocument, { client, input: validated.data, correlationId: identity.correlationId });
  } catch { return err("SERVER_ERROR", COMMAND_MESSAGES.SERVER_ERROR); }
}
