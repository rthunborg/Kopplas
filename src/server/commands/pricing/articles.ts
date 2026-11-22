import { defineCommand } from "../envelope";
import type { OperationReceipt } from "@/features/settings/mutation-attempt";
import { asPricingAuditRpcClient, operationRpcArguments, readOperationReceipt, throwMappedWriteError } from "./pricing-db";
import { validateArchive, validateUpsertArticle, type ArchiveInput, type UpsertArticleInput } from "./validation";
export type PricingCommandResult = OperationReceipt;
export const upsertArticle = defineCommand<UpsertArticleInput, PricingCommandResult>({
    command: "article.upsert", auditable: false, eventType: "article.upserted", targetType: "article", validateInput: validateUpsertArticle,
    execute: async (ctx) => { const { data, error } = await asPricingAuditRpcClient(ctx.db).rpc("upsert_article_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { name: ctx.input.name, sku: ctx.input.sku ?? null, unit: ctx.input.unit ?? null, unit_price_ore: ctx.input.unit_price_ore })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
export const archiveArticle = defineCommand<ArchiveInput, PricingCommandResult>({
    command: "article.archive", auditable: false, eventType: "article.archived", targetType: "article", validateInput: validateArchive,
    execute: async (ctx) => { const { data, error } = await asPricingAuditRpcClient(ctx.db).rpc("set_article_active_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { is_active: false })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
export const reactivateArticle = defineCommand<ArchiveInput, PricingCommandResult>({
    command: "article.reactivate", auditable: false, eventType: "article.reactivated", targetType: "article", validateInput: validateArchive,
    execute: async (ctx) => { const { data, error } = await asPricingAuditRpcClient(ctx.db).rpc("set_article_active_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { is_active: true })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
