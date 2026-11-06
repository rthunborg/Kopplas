import type { CommandDbClient } from "../envelope";
import type { OperationRpcArguments, OperationRpcResult } from "../settings/settings-db";
export { operationRpcArguments, readOperationReceipt, throwMappedWriteError } from "../settings/settings-db";
export type PricingMutationRpc = "upsert_work_role_with_audit_v2" | "set_work_role_active_with_audit_v2" | "upsert_article_with_audit_v2" | "set_article_active_with_audit_v2";
export interface PricingAuditRpcClient {
    rpc(fn: PricingMutationRpc, args: OperationRpcArguments): Promise<OperationRpcResult>;
}
export function asPricingAuditRpcClient(db: CommandDbClient): PricingAuditRpcClient { return db as unknown as PricingAuditRpcClient; }
