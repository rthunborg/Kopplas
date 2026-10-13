import type { CommandDbClient } from "../envelope";
import { CommandError } from "../command-errors";
import type { DocumentSignedAccessAttestationPayload } from "@/server/storage/document-signed-access-attestation";

export interface DocumentAccessSelection {
  readonly link: { id: string; tenant_id: string; file_id: string; owner_type: string; owner_id: string; purpose: string; archived_at: string | null };
  readonly file: { id: string; tenant_id: string; bucket_id: string; object_path: string; artifact_kind: string | null; lifecycle_state: string; archived_at: string | null; display_name: string; mime_type: string; size_bytes: number };
}

/** Exact request-RLS reads; disappearance is a denial, query failure is retryable. */
export async function loadDocumentAccessSelection(db: CommandDbClient, tenantId: string, linkId: string, fileId: string): Promise<DocumentAccessSelection | null> {
  const linkResult = await db.from("file_links").select("id, tenant_id, file_id, owner_type, owner_id, purpose, archived_at").eq("id", linkId).limit(1);
  if (linkResult.error) throw new Error("document link read failed");
  if (!linkResult.data || linkResult.data.length !== 1) return null;
  const link = linkResult.data[0] as Record<string, unknown>;
  if (!link || link.id !== linkId || link.tenant_id !== tenantId || link.file_id !== fileId || link.archived_at !== null || typeof link.owner_type !== "string" || typeof link.owner_id !== "string" || typeof link.purpose !== "string") return null;
  const fileResult = await db.from("files").select("id, tenant_id, bucket_id, object_path, artifact_kind, lifecycle_state, archived_at, display_name, mime_type, size_bytes").eq("id", fileId).limit(1);
  if (fileResult.error) throw new Error("document file read failed");
  if (!fileResult.data || fileResult.data.length !== 1) return null;
  const file = fileResult.data[0] as Record<string, unknown>;
  if (!file || file.id !== fileId || file.tenant_id !== tenantId || file.archived_at !== null || (file.lifecycle_state !== "linked" && file.lifecycle_state !== "locked") || file.bucket_id !== "tenant-files" || typeof file.object_path !== "string" || (file.artifact_kind !== null && file.artifact_kind !== "quote_pdf")) return null;
  // Durable provenance controls the branch even if an ordinary-purpose link exists.
  if (file.artifact_kind === "quote_pdf" ? link.owner_type !== "quote_version" || link.purpose !== "quote_pdf" : link.purpose === "quote_pdf") return null;
  return { link, file } as unknown as DocumentAccessSelection;
}

export interface PrepareDocumentSignedAccessArgs {
  readonly p_tenant_id: string; readonly p_actor_user_id: string;
  readonly p_link_id: string; readonly p_file_id: string;
  readonly p_correlation_id: string; readonly p_attestation_key_id: string;
}
export interface RecordDocumentSignedAccessArgs extends PrepareDocumentSignedAccessArgs {
  readonly p_owner_type: string; readonly p_owner_id: string; readonly p_purpose: string;
  readonly p_bucket_id: string; readonly p_object_path: string;
  readonly p_signed_url_sha256: string; readonly p_signed_url_expires_at: string;
  readonly p_attestation_issued_at: string; readonly p_attestation_expires_at: string;
  readonly p_attestation_signature: string;
}
type DocumentRpcClient = { rpc(name: "prepare_document_signed_access_audit_attestation" | "record_document_signed_access_audit_attested", args: PrepareDocumentSignedAccessArgs | RecordDocumentSignedAccessArgs): Promise<{ data: unknown; error: { code?: string } | null }> };
function throwRpcError(error: { code?: string }): never {
  if (error.code === "42501") throw new CommandError("TENANT_ACCESS_DENIED");
  if (error.code === "FSA10") throw new CommandError("FILE_ACCESS_DENIED");
  throw new Error("document checked access failed");
}
export async function prepareDocumentSignedAccessAuditAttestation(db: CommandDbClient, args: PrepareDocumentSignedAccessArgs): Promise<unknown> {
  const { data, error } = await (db as unknown as DocumentRpcClient).rpc("prepare_document_signed_access_audit_attestation", args);
  if (error) throwRpcError(error);
  return data;
}
export async function recordDocumentSignedAccessAuditAttested(db: CommandDbClient, args: RecordDocumentSignedAccessArgs): Promise<string> {
  const { data, error } = await (db as unknown as DocumentRpcClient).rpc("record_document_signed_access_audit_attested", args);
  if (error) throwRpcError(error);
  if (typeof data !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(data)) throw new Error("document checked audit returned no id");
  return data;
}
export function documentAttestationRpcArgs(p: DocumentSignedAccessAttestationPayload, signature: string): RecordDocumentSignedAccessArgs {
  return { p_tenant_id: p.tenantId, p_actor_user_id: p.actorUserId, p_link_id: p.linkId, p_file_id: p.fileId, p_owner_type: p.ownerType, p_owner_id: p.ownerId, p_purpose: p.linkPurpose, p_bucket_id: p.bucketId, p_object_path: p.objectPath, p_correlation_id: p.correlationId, p_signed_url_sha256: p.signedUrlSha256, p_signed_url_expires_at: p.signedUrlExpiresAt, p_attestation_key_id: p.keyId, p_attestation_issued_at: p.issuedAt, p_attestation_expires_at: p.expiresAt, p_attestation_signature: signature };
}
