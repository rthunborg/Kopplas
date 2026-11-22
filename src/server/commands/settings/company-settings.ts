import { defineCommand } from "../envelope";
import type { OperationReceipt } from "@/features/settings/mutation-attempt";
import { asSettingsAuditRpcClient, companyPayload, operationRpcArguments, readOperationReceipt, throwMappedWriteError } from "./settings-db";
import { validateUpdateCompanySettings, type UpdateCompanySettingsInput } from "./validation";
export type SettingsCommandResult = OperationReceipt;
export const updateCompanySettings = defineCommand<UpdateCompanySettingsInput, SettingsCommandResult>({
    command: "company_settings.update", auditable: false, eventType: "company_settings.updated", targetType: "company_settings", validateInput: validateUpdateCompanySettings,
    // SQL checks ownership after authority locks. No precheck may hide a historical
    // receipt after privileged target deletion.
    execute: async (ctx) => {
        const args = operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, companyPayload(ctx.input));
        const { data, error } = await asSettingsAuditRpcClient(ctx.db).rpc("upsert_company_settings_with_audit_v2", args);
        if (error)
            throwMappedWriteError(error);
        return readOperationReceipt(data, ctx.input);
    }, auditFields: (_ctx, result) => ({ targetId: result.targetId })
});
