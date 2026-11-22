import { defineCommand } from "../envelope";
import type { OperationReceipt } from "@/features/settings/mutation-attempt";
import { asPricingAuditRpcClient, operationRpcArguments, readOperationReceipt, throwMappedWriteError } from "./pricing-db";
import { validateArchive, validateUpsertWorkRole, type ArchiveInput, type UpsertWorkRoleInput } from "./validation";
export type PricingCommandResult = OperationReceipt;
export const upsertWorkRole = defineCommand<UpsertWorkRoleInput, PricingCommandResult>({
    command: "work_role.upsert", auditable: false, eventType: "work_role.upserted", targetType: "work_role", validateInput: validateUpsertWorkRole,
    execute: async (ctx) => { const { data, error } = await asPricingAuditRpcClient(ctx.db).rpc("upsert_work_role_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { display_name: ctx.input.display_name, cost_rate_ore: ctx.input.cost_rate_ore, sell_rate_ore: ctx.input.sell_rate_ore })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
export const archiveWorkRole = defineCommand<ArchiveInput, PricingCommandResult>({
    command: "work_role.archive", auditable: false, eventType: "work_role.archived", targetType: "work_role", validateInput: validateArchive,
    execute: async (ctx) => { const { data, error } = await asPricingAuditRpcClient(ctx.db).rpc("set_work_role_active_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { is_active: false })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
export const reactivateWorkRole = defineCommand<ArchiveInput, PricingCommandResult>({
    command: "work_role.reactivate", auditable: false, eventType: "work_role.reactivated", targetType: "work_role", validateInput: validateArchive,
    execute: async (ctx) => { const { data, error } = await asPricingAuditRpcClient(ctx.db).rpc("set_work_role_active_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { is_active: true })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
