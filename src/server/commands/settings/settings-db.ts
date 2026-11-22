import type { CommandDbClient } from "../envelope";
import { CommandError } from "../command-errors";
import { throwMappedWriteError as mapExisting } from "../crm/crm-db";
import { isOperationUuid, type OperationPreconditions, type OperationReceipt } from "@/features/settings/mutation-attempt";
import type { UpdateCompanySettingsInput } from "./validation";
export interface OperationRpcArguments {
    readonly p_tenant_id: string;
    readonly p_actor_user_id: string;
    readonly p_correlation_id: string;
    readonly p_operation_id: string;
    readonly p_target_id: string;
    readonly p_expected_revision: string | null;
    readonly p_payload: Readonly<Record<string, unknown>>;
}
export type SettingsMutationRpc = "upsert_company_settings_with_audit_v2" | "upsert_quote_terms_with_audit_v2" | "approve_quote_terms_with_audit_v2";
export interface OperationRpcResult {
    readonly data: unknown;
    readonly error: {
        readonly code?: string;
        readonly message?: string;
    } | null;
}
export interface SettingsAuditRpcClient {
    rpc(fn: SettingsMutationRpc, args: OperationRpcArguments): Promise<OperationRpcResult>;
}
export function asSettingsAuditRpcClient(db: CommandDbClient): SettingsAuditRpcClient { return db as unknown as SettingsAuditRpcClient; }
export function operationRpcArguments(input: OperationPreconditions, tenantId: string, actorId: string, correlationId: string, payload: Readonly<Record<string, unknown>>): OperationRpcArguments {
    if ((input.contextTenantId !== undefined && input.contextTenantId !== tenantId) || (input.contextActorId !== undefined && input.contextActorId !== actorId))
        throw new CommandError("TENANT_ACCESS_DENIED");
    if (correlationId !== input.operationId)
        throw new CommandError("VALIDATION_FAILED");
    return { p_tenant_id: tenantId, p_actor_user_id: actorId, p_correlation_id: input.operationId, p_operation_id: input.operationId, p_target_id: input.targetId, p_expected_revision: input.expectedRevision, p_payload: payload };
}
export function companyPayload(input: UpdateCompanySettingsInput): Readonly<Record<string, unknown>> {
    return { company_name: input.company_name, org_nr: input.org_nr ?? null, address_line1: input.address_line1 ?? null, address_line2: input.address_line2 ?? null, postal_code: input.postal_code ?? null, city: input.city ?? null, email: input.email ?? null, phone: input.phone ?? null, logo_url: input.logo_url ?? null, logo_url_present: input.logo_url !== undefined, default_vat_display: input.default_vat_display, vat_rate_bp: input.vat_rate_bp };
}
export function readOperationReceipt(data: unknown, input: OperationPreconditions): OperationReceipt {
    if (!data || typeof data !== "object")
        throw new Error("Missing operation receipt");
    const r = data as Record<string, unknown>;
    if (r.operationId !== input.operationId || r.targetId !== input.targetId || !isOperationUuid(r.committedRevision) || typeof r.committedAt !== "string" || !(r.approvedAt === null || typeof r.approvedAt === "string"))
        throw new Error("Invalid operation receipt");
    return { operationId: input.operationId, targetId: input.targetId, committedRevision: r.committedRevision, committedAt: r.committedAt, approvedAt: r.approvedAt };
}
export function throwMappedWriteError(error: {
    readonly code?: string;
    readonly message?: string;
}): never {
    if (error.code === "PT409")
        throw new CommandError("COMMAND_CONFLICT", "Uppgifterna har ändrats eller begäran är inte längre giltig. Uppdatera och granska innan du sparar igen.");
    return mapExisting(error);
}
