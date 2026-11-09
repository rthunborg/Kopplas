import { defineCommand } from "../envelope";
import type { SettingsCommandResult } from "./company-settings";
import { asSettingsAuditRpcClient, operationRpcArguments, readOperationReceipt, throwMappedWriteError } from "./settings-db";
import { validateUpdateQuoteTerms, validateApproveQuoteTerms, type UpdateQuoteTermsInput, type ApproveQuoteTermsInput } from "./validation";
export const updateQuoteTerms = defineCommand<UpdateQuoteTermsInput, SettingsCommandResult>({
    command: "quote_terms.update", auditable: false, eventType: "quote_terms.updated", targetType: "quote_terms", validateInput: validateUpdateQuoteTerms,
    execute: async (ctx) => { const { data, error } = await asSettingsAuditRpcClient(ctx.db).rpc("upsert_quote_terms_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { terms_text: ctx.input.terms_text })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
export const approveQuoteTerms = defineCommand<ApproveQuoteTermsInput, SettingsCommandResult>({
    command: "quote_terms.approve", auditable: false, eventType: "quote_terms.approved", targetType: "quote_terms", validateInput: validateApproveQuoteTerms,
    execute: async (ctx) => { const { data, error } = await asSettingsAuditRpcClient(ctx.db).rpc("approve_quote_terms_with_audit_v2", operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, { terms_text: ctx.input.terms_text })); if (error)
        throwMappedWriteError(error); return readOperationReceipt(data, ctx.input); }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
