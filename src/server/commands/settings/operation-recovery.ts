import { defineCommand, type CommandDbClient } from "../envelope";
import type { ValidationResult } from "../envelope-core";
import { OPERATION_KINDS, type OperationKind, type OperationPreconditions, type OperationReceipt } from "@/features/settings/mutation-attempt";
import { validateUpdateCompanySettings, validateUpdateQuoteTerms, validateApproveQuoteTerms } from "./validation";
import { validateUpsertWorkRole, validateUpsertArticle, validateArchive } from "../pricing/validation";
import { companyPayload, operationRpcArguments, readOperationReceipt, throwMappedWriteError, type OperationRpcArguments, type OperationRpcResult } from "./settings-db";
interface RecoveryInput extends OperationPreconditions {
    readonly kind: OperationKind;
    readonly payload: Readonly<Record<string, unknown>>;
}
export type RecoveryResult = OperationReceipt | {
    readonly operationId: string;
    readonly targetId: string;
    readonly unconfirmed: true;
};
function validateRecovery(raw: unknown, pricing: boolean): ValidationResult<RecoveryInput> {
    const fail = { ok: false as const, code: "VALIDATION_FAILED" as const };
    if (!raw || typeof raw !== "object")
        return fail;
    const r = raw as Record<string, unknown>;
    const kind = r.kind;
    if (typeof kind !== "string" || !(OPERATION_KINDS as readonly string[]).includes(kind) || /^(work_role|article)\./.test(kind) !== pricing)
        return fail;
    if (kind === "company.save") {
        const v = validateUpdateCompanySettings(raw);
        return v.ok ? { ok: true, data: { ...v.data, kind, payload: companyPayload(v.data) } } : fail;
    }
    if (kind === "terms.save" || kind === "terms.approve") {
        const v = kind === "terms.save" ? validateUpdateQuoteTerms(raw) : validateApproveQuoteTerms(raw);
        return v.ok ? { ok: true, data: { ...v.data, kind, payload: { terms_text: v.data.terms_text } } } : fail;
    }
    if (kind === "work_role.create" || kind === "work_role.update") {
        const v = validateUpsertWorkRole(raw);
        return v.ok && (kind.endsWith("create") ? !v.data.id : !!v.data.id) ? { ok: true, data: { ...v.data, kind, payload: { display_name: v.data.display_name, cost_rate_ore: v.data.cost_rate_ore, sell_rate_ore: v.data.sell_rate_ore } } } : fail;
    }
    if (kind === "article.create" || kind === "article.update") {
        const v = validateUpsertArticle(raw);
        return v.ok && (kind.endsWith("create") ? !v.data.id : !!v.data.id) ? { ok: true, data: { ...v.data, kind, payload: { name: v.data.name, sku: v.data.sku ?? null, unit: v.data.unit ?? null, unit_price_ore: v.data.unit_price_ore } } } : fail;
    }
    const v = validateArchive(raw);
    return v.ok ? { ok: true, data: { ...v.data, kind: kind as OperationKind, payload: { is_active: kind.endsWith("reactivate") } } } : fail;
}
function rpc(db: CommandDbClient) { return db as unknown as {
    rpc(fn: "reconcile_settings_pricing_operation", args: OperationRpcArguments & {
        p_operation_kind: OperationKind;
    }): Promise<OperationRpcResult>;
}; }
export const reconcileSettingsOperation = defineCommand<RecoveryInput, RecoveryResult>({ command: "settings.operation.reconcile", auditable: false, eventType: "settings_pricing.reconciled", targetType: "settings_pricing_operation", validateInput: raw => validateRecovery(raw, false), execute: async (ctx) => {
        const { data, error } = await rpc(ctx.db).rpc("reconcile_settings_pricing_operation", { ...operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, ctx.input.payload), p_operation_kind: ctx.input.kind });
        if (error)
            throwMappedWriteError(error);
        if (data && typeof data === "object" && (data as {
            unconfirmed?: unknown;
        }).unconfirmed === true)
            return { operationId: ctx.input.operationId, targetId: ctx.input.targetId, unconfirmed: true };
        return readOperationReceipt(data, ctx.input);
    } });
export const reconcilePricingOperation = defineCommand<RecoveryInput, RecoveryResult>({ command: "pricing.operation.reconcile", auditable: false, eventType: "settings_pricing.reconciled", targetType: "settings_pricing_operation", validateInput: raw => validateRecovery(raw, true), execute: async (ctx) => {
        const { data, error } = await rpc(ctx.db).rpc("reconcile_settings_pricing_operation", { ...operationRpcArguments(ctx.input, ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.correlationId, ctx.input.payload), p_operation_kind: ctx.input.kind });
        if (error)
            throwMappedWriteError(error);
        if (data && typeof data === "object" && (data as {
            unconfirmed?: unknown;
        }).unconfirmed === true)
            return { operationId: ctx.input.operationId, targetId: ctx.input.targetId, unconfirmed: true };
        return readOperationReceipt(data, ctx.input);
    } });
