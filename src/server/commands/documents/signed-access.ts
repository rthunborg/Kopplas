import { defineCommand } from "../envelope";
import { CommandError } from "../command-errors";
import type { ValidationResult } from "../envelope-core";
import { requireCapability } from "@/server/authz/require-capability";
import { resolveDocumentSource } from "@/server/read-models/document-sources";
import {
  createSignedFileUrl,
  type StorageSigningClient,
} from "@/server/storage/signed-access";
import { validateSignedStorageUrl } from "@/server/storage/signed-access-attestation";
import {
  documentSignedAccessAttestorFromEnv,
  parseDocumentSignedAccessAuditChallenge,
} from "@/server/storage/document-signed-access-attestation";
import {
  loadDocumentAccessSelection,
  prepareDocumentSignedAccessAuditAttestation,
  recordDocumentSignedAccessAuditAttested,
  documentAttestationRpcArgs,
} from "./db";

export interface DocumentSignedAccessInput {
  readonly link_id: string;
  readonly file_id: string;
}
export interface DocumentSignedAccessResult {
  readonly targetId: string;
  readonly linkId: string;
  readonly signedUrl: string;
  readonly expiresAt: string;
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Only the selected link/file pair crosses the client trust boundary. */
export function validateDocumentSignedAccessInput(
  raw: unknown,
): ValidationResult<DocumentSignedAccessInput> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, code: "VALIDATION_FAILED" };
  }
  const input = raw as Record<string, unknown>;
  if (
    Object.keys(input).length !== 2 ||
    !Object.hasOwn(input, "link_id") ||
    !Object.hasOwn(input, "file_id") ||
    typeof input.link_id !== "string" ||
    typeof input.file_id !== "string" ||
    !UUID_RE.test(input.link_id) ||
    !UUID_RE.test(input.file_id)
  ) {
    return { ok: false, code: "VALIDATION_FAILED" };
  }
  return { ok: true, data: { link_id: input.link_id, file_id: input.file_id } };
}

export const createDocumentSignedAccess = defineCommand<
  DocumentSignedAccessInput,
  DocumentSignedAccessResult
>({
  command: "document.signedAccess.create",
  eventType: "document.signed_access.created",
  targetType: "file",
  // Only the checked post-sign finalizer records the fixed success event.
  auditable: false,
  validateInput: validateDocumentSignedAccessInput,
  ownership: input => ({ table: "file_links", id: input.link_id }),
  execute: async ctx => {
    const { tenantId, userId: actorUserId } = ctx.tenantContext;
    const roles = ctx.tenantContext.roles ?? [];
    if (!requireCapability({ roles, module: "files", capability: "Files.View" }).ok) {
      throw new CommandError("PERMISSION_DENIED");
    }
    const selection = await loadDocumentAccessSelection(
      ctx.db, tenantId, ctx.input.link_id, ctx.input.file_id,
    );
    if (!selection) throw new CommandError("TENANT_ACCESS_DENIED");
    const { link, file } = selection;
    const source = await resolveDocumentSource(ctx.db, { tenantId, roles }, link, file);
    if (!source) throw new CommandError("TENANT_ACCESS_DENIED");

    const attestor = documentSignedAccessAttestorFromEnv();
    const challengeData = await prepareDocumentSignedAccessAuditAttestation(ctx.db, {
      p_tenant_id: tenantId,
      p_actor_user_id: actorUserId,
      p_link_id: link.id,
      p_file_id: file.id,
      p_correlation_id: ctx.correlationId,
      p_attestation_key_id: attestor.keyId,
    });
    const challenge = parseDocumentSignedAccessAuditChallenge(challengeData, {
      tenantId,
      linkId: link.id,
      fileId: file.id,
      ownerType: link.owner_type,
      ownerId: link.owner_id,
      linkPurpose: link.purpose,
      bucketId: file.bucket_id,
      objectPath: file.object_path,
      keyId: attestor.keyId,
      nowMs: ctx.clock.now().getTime(),
    });
    const signed = await createSignedFileUrl({
      client: ctx.db as unknown as StorageSigningClient,
      bucket: challenge.bucketId,
      objectPath: challenge.objectPath,
      nowIso: challenge.issuedAt,
    });
    if (!signed) throw new CommandError("FILE_ACCESS_DENIED");
    const validated = validateSignedStorageUrl(signed.signedUrl, {
      bucketId: challenge.bucketId,
      objectPath: challenge.objectPath,
      challengeIssuedAt: challenge.issuedAt,
      computedExpiresAt: signed.expiresAt,
      nowMs: ctx.clock.now().getTime(),
    });
    const proof = {
      tenantId,
      actorUserId,
      ...challenge,
      correlationId: ctx.correlationId,
      signedUrlSha256: validated.signedUrlSha256,
      signedUrlExpiresAt: validated.expiresAt,
    };
    // Remote issuance precedes the locked authority point. Withhold on finalizer failure.
    await recordDocumentSignedAccessAuditAttested(
      ctx.db, documentAttestationRpcArgs(proof, attestor.sign(proof)),
    );
    return {
      targetId: file.id,
      linkId: link.id,
      signedUrl: signed.signedUrl,
      expiresAt: validated.expiresAt,
    };
  },
});
