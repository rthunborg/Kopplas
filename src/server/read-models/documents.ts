// Server-only aggregation: no authority or Storage identity enters its browser descriptor.
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { normalizeRoles } from "@/server/authz/roles";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { quotePdfAttestationSecretFromEnv } from "@/server/quote-pdf/attestation";
import { DOCUMENT_SOURCE_REGISTRY, readDocumentSource, type DocumentCandidate, type DocumentSourceData, type DocumentSourceResult } from "./document-sources";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Anchor = { readonly createdAt: string; readonly id: string };
export interface DocumentRow extends DocumentSourceData {
  readonly fileId: string; readonly linkId: string; readonly purpose: string;
  readonly displayName: string; readonly mimeType: string | null; readonly sizeBytes: number | null;
  readonly createdAt: string; readonly lifecycleState: string; readonly locked: boolean;
}
export type DocumentsReadResult = { readonly ok: true; readonly data: { readonly descriptor: {
  readonly data: { readonly rows: DocumentRow[]; readonly nextCursor: string | null };
  readonly entitlements: { readonly withheld: readonly string[] };
} } } | { readonly ok: false; readonly code: string; readonly message: string };
export interface DocumentsDeps {
  readonly client?: object; readonly cursor?: string | null;
  readonly resolveContext?: (options?: { client?: object }) => Promise<{ ok: true; data: { userId: string; tenantId: string; roles: readonly string[]; status?: string } } | { ok: false; code: string; message: string }>;
  readonly readCandidates?: (options: { client: object; tenantId: string; after: Anchor | null; limit: number }) => Promise<{ rows: DocumentCandidate[]; exhausted: boolean }>;
  readonly readSource?: (link: DocumentCandidate, options: { client: object; tenantId: string; roles: readonly string[] }) => Promise<DocumentSourceResult>;
}
const PAGE_SIZE = 50;
const CANDIDATE_BATCH_SIZE = 250;
const TEST_CURSOR_KEY = randomBytes(32);
const unavailable = (code = "SERVER_ERROR"): DocumentsReadResult => ({ ok: false, code, message: code === "SERVER_ERROR" ? "Dokumenten kunde inte läsas in. Försök igen." : "Dokumenten är inte tillgängliga." });
function cursorKey(injected: boolean): Buffer {
  // Production uses an existing server root, with a separate encryption domain: no new key.
  if (injected) return TEST_CURSOR_KEY;
  return createHmac("sha256", quotePdfAttestationSecretFromEnv().secret).update("elpro.documents.pagination-key.v1").digest();
}
function encodeCursor(anchor: Anchor, tenant: string, user: string, key: Buffer): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(Buffer.from(`${tenant}:${user}`));
  const bytes = Buffer.concat([cipher.update(JSON.stringify({ ...anchor, expires: Date.now() + 15 * 60_000 }), "utf8"), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), bytes]).toString("base64url");
}
function decodeCursor(raw: string, tenant: string, user: string, key: Buffer): Anchor {
  if (!/^[A-Za-z0-9_-]{40,1024}$/.test(raw)) throw new Error("Invalid cursor");
  const bytes = Buffer.from(raw, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
  decipher.setAAD(Buffer.from(`${tenant}:${user}`));
  decipher.setAuthTag(bytes.subarray(12, 28));
  const value = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8"));
  if (!value || !/^[0-9a-f-]{36}$/i.test(value.id) || typeof value.createdAt !== "string" ||
    !/^[0-9T:.+Z-]+$/.test(value.createdAt) || !Number.isFinite(Date.parse(value.createdAt)) || value.expires < Date.now()) throw new Error("Invalid cursor");
  return { id: value.id, createdAt: value.createdAt };
}
async function readCandidates(options: { client: object; tenantId: string; after: Anchor | null; limit: number }): Promise<{ rows: DocumentCandidate[]; exhausted: boolean }> {
  let query = (options.client as Client).from("file_links").select("id,tenant_id,file_id,owner_type,owner_id,purpose,created_at,archived_at,is_locked,file:files!inner(id,tenant_id,display_name,mime_type,size_bytes,lifecycle_state,archived_at,artifact_kind,bucket_id,object_path)")
    .eq("tenant_id", options.tenantId).in("owner_type", Object.keys(DOCUMENT_SOURCE_REGISTRY)).is("archived_at", null)
    .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(options.limit);
  if (options.after) query = query.or(`created_at.lt.${options.after.createdAt},and(created_at.eq.${options.after.createdAt},id.lt.${options.after.id})`);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as unknown as DocumentCandidate[];
  return { rows, exhausted: rows.length < options.limit };
}

/** Resolve current membership on every page/refresh, then traverse candidates without exposing hidden counts. */
export async function readDocuments(deps: DocumentsDeps = {}): Promise<DocumentsReadResult> {
  try {
    const client = deps.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await (deps.resolveContext ?? (options => resolveTenantContext({ client: options?.client as Client })) )({ client });
    if (!context.ok) return unavailable(context.code);
    const { tenantId, userId } = context.data;
    const roles = normalizeRoles(context.data.roles);
    if (context.data.status !== undefined && context.data.status !== "active") return unavailable("TENANT_MEMBERSHIP_REQUIRED");
    if (!resolveCapability({ roles, module: "documents", capability: "Documents.View" }).granted ||
      !resolveCapability({ roles, module: "files", capability: "Files.View" }).granted) return unavailable("TENANT_ACCESS_DENIED");
    const key = cursorKey(!!deps.readCandidates);
    let after = deps.cursor ? decodeCursor(deps.cursor, tenantId, userId, key) : null;
    const rows: DocumentRow[] = [];
    const authority = { client, tenantId, roles };
    // Request-local row memoization reduces repeated owner lookups; never crosses a request/page.
    const sourceRows = new Map<string, Promise<Record<string, unknown> | null>>();
    const loadRow = (table: string, id: string): Promise<Record<string, unknown> | null> => {
      const cacheKey = `${table}:${id}`;
      let promise = sourceRows.get(cacheKey);
      if (!promise) {
        promise = (async () => {
          if (table === "quote_version_attachments") {
            // Attachment lookup is per selected file, so it is handled in the adapter itself.
            throw new Error("Unsupported cached relation");
          }
          const columns = table === "quotes" ? "id,tenant_id,archived_at" : Object.values(DOCUMENT_SOURCE_REGISTRY).find(s => s.table === table)?.columns;
          if (!columns) throw new Error("Unknown source");
          const query = (client as Client).from(table).select(columns).eq("tenant_id", tenantId).eq("id", id).maybeSingle();
          const { data, error } = await query;
          if (error) throw error;
          return data as Record<string, unknown> | null;
        })();
        sourceRows.set(cacheKey, promise);
      }
      return promise;
    };
    while (true) {
      const batch = await (deps.readCandidates ?? readCandidates)({ client, tenantId, after, limit: CANDIDATE_BATCH_SIZE });
      if (!batch.rows.length) {
        if (!batch.exhausted) throw new Error("Candidate traversal made no progress");
        return { ok: true, data: { descriptor: { data: { rows, nextCursor: null }, entitlements: { withheld: [] } } } };
      }
      for (let i = 0; i < batch.rows.length; i++) {
        const link = batch.rows[i];
        if (!link.created_at || !Number.isFinite(Date.parse(link.created_at))) throw new Error("Invalid link order");
        after = { createdAt: link.created_at, id: link.id };
        let result;
        if (deps.readSource) result = await deps.readSource(link, authority);
        else result = await readDocumentSource(link, { ...authority, loadRow: async (table, id) => {
          if (table !== "quote_version_attachments") return loadRow(table, id);
          const { data, error } = await (client as Client).from(table).select("tenant_id,quote_version_id,file_id").eq("tenant_id", tenantId).eq("quote_version_id", id).eq("file_id", link.file_id).maybeSingle();
          if (error) throw error;
          return data;
        } });
        if (!result.ok) { if (result.code === "SERVER_ERROR") return unavailable(); continue; }
        const file = link.file;
        // A narrow projection, independent of columns or fields present on source/test rows.
        rows.push({ fileId: link.file_id, linkId: link.id, module: result.data.module,
          ownerType: result.data.ownerType, ownerId: result.data.ownerId, ownerLabel: result.data.ownerLabel,
          purpose: link.purpose, displayName: file.display_name ?? "Bifogad fil", mimeType: file.mime_type ?? null,
          sizeBytes: file.size_bytes ?? null, createdAt: link.created_at, lifecycleState: file.lifecycle_state,
          locked: link.is_locked === true || file.lifecycle_state === "locked" });
        if (rows.length === PAGE_SIZE) return { ok: true, data: { descriptor: { data: { rows,
          nextCursor: batch.exhausted && i === batch.rows.length - 1 ? null : encodeCursor(after, tenantId, userId, key) }, entitlements: { withheld: [] } } } };
      }
      if (batch.exhausted) return { ok: true, data: { descriptor: { data: { rows, nextCursor: null }, entitlements: { withheld: [] } } } };
    }
  } catch { return unavailable(); }
}

