// Server-only aggregation: current source authority precedes search/counts/facets.
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { normalizeRoles } from "@/server/authz/roles";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { quotePdfAttestationSecretFromEnv } from "@/server/quote-pdf/attestation";
import type { FileIndexFilter } from "@/features/files/file-index";
import { parseDocumentFilters, documentFilterIdentity, filterDocumentRows, type DocumentFilters } from "@/features/documents/filters";
import { DOCUMENT_SOURCE_REGISTRY, readDocumentSource, type DocumentCandidate, type DocumentSourceData, type DocumentSourceResult } from "./document-sources";
import { isPermanentStorageDenial } from "@/server/storage/signed-access";
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Anchor = { readonly createdAt: string; readonly id: string };
export interface DocumentRow extends DocumentSourceData {
  readonly fileId: string; readonly linkId: string; readonly purpose: string;
  readonly displayName: string; readonly mimeType: string | null; readonly sizeBytes: number | null;
  readonly createdAt: string; readonly lifecycleState: string; readonly locked: boolean;
  readonly archived?: boolean; readonly canArchive?: boolean; readonly canRestore?: boolean;
}
export type DocumentFacets = Record<"module" | "ownerType" | "purpose", { value: string; count: number }[]>;
export type DocumentsReadResult = { readonly ok: true; readonly data: { readonly descriptor: {
  readonly data: { readonly rows: DocumentRow[]; readonly nextCursor: string | null; readonly ownerTypes: readonly string[]; readonly total: number; readonly facets: DocumentFacets };
  readonly entitlements: { readonly withheld: readonly string[] };
} } } | { readonly ok: false; readonly code: string; readonly message: string };
export interface DocumentsDeps {
  readonly client?: object; readonly cursor?: string | null; readonly filter?: FileIndexFilter; readonly filters?: Partial<DocumentFilters>;
  readonly resolveContext?: (options?: { client?: object }) => Promise<{ ok: true; data: { userId: string; tenantId: string; roles: readonly string[]; status?: string } } | { ok: false; code: string; message: string }>;
  readonly readCandidates?: (options: { client: object; tenantId: string; after: Anchor | null; limit: number }) => Promise<{ rows: DocumentCandidate[]; exhausted: boolean }>;
  readonly readSource?: (link: DocumentCandidate, options: { client: object; tenantId: string; roles: readonly string[] }) => Promise<DocumentSourceResult>;
}
const PAGE_SIZE = 50, CANDIDATE_BATCH_SIZE = 250;
const TEST_CURSOR_KEY = randomBytes(32);
const unavailable = (code = "SERVER_ERROR"): DocumentsReadResult => ({ ok: false, code, message: code === "VALIDATION_FAILED" ? "Kontrollera dokumentfiltren." : code === "SERVER_ERROR" ? "Dokumenten kunde inte läsas in. Försök igen." : "Dokumenten är inte tillgängliga." });
function cursorKey(injected: boolean): Buffer {
  return injected ? TEST_CURSOR_KEY : createHmac("sha256", quotePdfAttestationSecretFromEnv().secret).update("elpro.documents.pagination-key.v1").digest();
}
function encodeCursor(anchor: Anchor, tenant: string, user: string, key: Buffer, binding: string): string {
  const nonce = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(Buffer.from(`${tenant}:${user}:${binding}`));
  const bytes = Buffer.concat([cipher.update(JSON.stringify({ ...anchor, expires: Date.now() + 15 * 60_000 }), "utf8"), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), bytes]).toString("base64url");
}
function decodeCursor(raw: string, tenant: string, user: string, key: Buffer, binding: string): Anchor {
  if (!/^[A-Za-z0-9_-]{40,1024}$/.test(raw)) throw new Error("Invalid cursor");
  const bytes = Buffer.from(raw, "base64url"), decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
  decipher.setAAD(Buffer.from(`${tenant}:${user}:${binding}`)); decipher.setAuthTag(bytes.subarray(12, 28));
  const value = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8"));
  if (!value || Object.keys(value).sort().join() !== "createdAt,expires,id" || !/^[0-9a-f-]{36}$/i.test(value.id) || typeof value.createdAt !== "string" || !/^[0-9T:.+Z-]+$/.test(value.createdAt) || !Number.isFinite(Date.parse(value.createdAt)) || typeof value.expires !== "number" || value.expires < Date.now()) throw new Error("Invalid cursor");
  return { id: value.id, createdAt: value.createdAt };
}
async function readCandidates(options: { client: object; tenantId: string; after: Anchor | null; limit: number }): Promise<{ rows: DocumentCandidate[]; exhausted: boolean }> {
  // Include every persisted link: hidden/archived/unknown contexts must deny file-level hints.
  let query = (options.client as Client).from("file_links").select("id,tenant_id,file_id,owner_type,owner_id,purpose,created_at,archived_at,is_locked,locked_at,file:files!inner(id,tenant_id,display_name,mime_type,size_bytes,lifecycle_state,archived_at,artifact_kind,archive_previous_state,bucket_id,object_path)")
    .eq("tenant_id", options.tenantId).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(options.limit);
  if (options.after) query = query.or(`created_at.lt.${options.after.createdAt},and(created_at.eq.${options.after.createdAt},id.lt.${options.after.id})`);
  const { data, error } = await query; if (error) throw error;
  const rows = (data ?? []) as unknown as DocumentCandidate[];
  return { rows, exhausted: rows.length < options.limit };
}
/** Complete bounded traversal and one request-local authorized projection back every page/facet/count. */
export async function readDocuments(deps: DocumentsDeps = {}): Promise<DocumentsReadResult> {
  try {
    const client = deps.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await (deps.resolveContext ?? (options => resolveTenantContext({ client: options?.client as Client })))({ client });
    if (!context.ok) return unavailable(context.code);
    const { tenantId, userId } = context.data, roles = normalizeRoles(context.data.roles);
    if (context.data.status !== undefined && context.data.status !== "active") return unavailable("TENANT_MEMBERSHIP_REQUIRED");
    if (!resolveCapability({ roles, module: "documents", capability: "Documents.View" }).granted || !resolveCapability({ roles, module: "files", capability: "Files.View" }).granted) return unavailable("TENANT_ACCESS_DENIED");
    const raw = deps.filters ?? { q: deps.filter?.search, ownerType: deps.filter?.ownerCategory };
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(raw)) { if (value !== undefined && value !== null) { if (typeof value !== "string") return unavailable("VALIDATION_FAILED"); params.set(name, value); } }
    const parsed = parseDocumentFilters(params); if (!parsed.ok) return unavailable(parsed.code);
    const filters = parsed.data;
    if (!Object.entries(DOCUMENT_SOURCE_REGISTRY).some(([type, entry]) => (!filters.module || entry.module === filters.module) && (!filters.ownerType || type === filters.ownerType) && (!filters.purpose || (entry.purposes as readonly string[]).includes(filters.purpose)) && resolveCapability({ roles, module: entry.module, capability: entry.capability }).granted)) return unavailable("VALIDATION_FAILED");
    const key = cursorKey(!!deps.readCandidates), binding = documentFilterIdentity(filters);
    const cursor = deps.cursor ?? filters.cursor;
    const anchor = cursor ? decodeCursor(cursor, tenantId, userId, key, binding) : null;
    const authority = { client, tenantId, roles, mode: "all" as const };
    const sourceRows = new Map<string, Promise<Record<string, unknown> | null>>();
    const loadRow = (table: string, id: string): Promise<Record<string, unknown> | null> => {
      const cacheKey = `${table}:${id}`; let promise = sourceRows.get(cacheKey);
      if (!promise) { promise = (async () => {
        const columns = table === "quotes" ? "id,tenant_id,archived_at" : Object.values(DOCUMENT_SOURCE_REGISTRY).find(s => s.table === table)?.columns;
        if (!columns) throw new Error("Unknown source");
        const { data, error } = await (client as Client).from(table).select(columns).eq("tenant_id", tenantId).eq("id", id).maybeSingle();
        if (error) throw error; return data as Record<string, unknown> | null;
      })(); sourceRows.set(cacheKey, promise); } return promise;
    };
    const candidates: { link: DocumentCandidate; result: DocumentSourceResult }[] = [];
    let after: Anchor | null = null;
    while (true) {
      const batch = await (deps.readCandidates ?? readCandidates)({ client, tenantId, after, limit: CANDIDATE_BATCH_SIZE });
      if (!batch.rows.length && !batch.exhausted) throw new Error("Candidate traversal made no progress");
      for (const link of batch.rows) {
        if (!link.created_at || !Number.isFinite(Date.parse(link.created_at)) || (after && link.id === after.id && link.created_at === after.createdAt)) throw new Error("Invalid link order");
        after = { createdAt: link.created_at, id: link.id };
        const result = deps.readSource ? await deps.readSource(link, authority) : await readDocumentSource(link, { ...authority, loadRow: async (table, id) => {
          if (table !== "quote_version_attachments") return loadRow(table, id);
          const { data, error } = await (client as Client).from(table).select("tenant_id,quote_version_id,file_id").eq("tenant_id", tenantId).eq("quote_version_id", id).eq("file_id", link.file_id).maybeSingle();
          if (error) throw error; return data;
        } });
        if (!result.ok && result.code === "SERVER_ERROR") return unavailable();
        candidates.push({ link, result });
      }
      if (batch.exhausted) break;
    }
    const groups = new Map<string, typeof candidates>();
    for (const candidate of candidates) { const group = groups.get(candidate.link.file_id) ?? []; group.push(candidate); groups.set(candidate.link.file_id, group); }
    const objectChecks = new Map<string, Promise<boolean>>();
    const objectExists = (link: DocumentCandidate): Promise<boolean> => {
      let check = objectChecks.get(link.file_id);
      if (!check) { check = (async () => { const { data, error } = await (client as Client).storage.from(link.file.bucket_id).info(link.file.object_path); if (error) { if (isPermanentStorageDenial(error)) return false; throw error; } return !!data; })(); objectChecks.set(link.file_id, check); } return check;
    };
    const eligibility = new Map<string, { link: DocumentCandidate; archive: boolean; restore: boolean }>();
    const projected: DocumentRow[] = [];
    for (const { link, result } of candidates) {
      if (!result.ok) continue;
      const file = link.file, archived = link.archived_at !== null || file.lifecycle_state === "archived";
      if (filters.mode === "active" ? archived : !archived) continue;
      const group = groups.get(link.file_id)!;
      const lockHistory = group.some(c => c.link.is_locked || c.link.locked_at);
      const graphEligible = !!deps.filters && link.archived_at === null && group.every(c => c.result.ok) && resolveCapability({ roles, module: "files", capability: "Files.Edit" }).granted;
      const archiveCandidate = graphEligible && file.lifecycle_state !== "archived" && (file.artifact_kind === null || file.artifact_kind === "quote_pdf" && file.lifecycle_state === "locked" && group.every(c => c.link.is_locked && c.link.locked_at));
      const restoreCandidate = graphEligible && file.lifecycle_state === "archived" && file.artifact_kind === null && (lockHistory || file.archive_previous_state === "linked");
      eligibility.set(link.id, { link, archive: archiveCandidate, restore: restoreCandidate });
      projected.push({ fileId: link.file_id, linkId: link.id, module: result.data.module, ownerType: result.data.ownerType, ownerId: result.data.ownerId, ownerLabel: result.data.ownerLabel,
        purpose: link.purpose, displayName: file.display_name ?? "Bifogad fil", mimeType: file.mime_type ?? null, sizeBytes: file.size_bytes ?? null, createdAt: link.created_at!, lifecycleState: file.lifecycle_state, locked: link.is_locked === true || file.lifecycle_state === "locked",
        ...(deps.filters ? { archived, canArchive: false, canRestore: false } : {}) });
    }
    const matched = filterDocumentRows(projected, filters);
    let start = 0;
    if (anchor) { const index = matched.findIndex(r => r.linkId === anchor.id && r.createdAt === anchor.createdAt); if (index < 0) return unavailable(); start = index + 1; }
    const rows = matched.slice(start, start + PAGE_SIZE), hasMore = start + rows.length < matched.length;
    const facets = {} as DocumentFacets;
    for (const facet of ["module", "ownerType", "purpose"] as const) {
      const counts = new Map<string, number>();
      for (const row of filterDocumentRows(projected, { ...filters, [facet]: undefined })) counts.set(row[facet], (counts.get(row[facet]) ?? 0) + 1);
      const selected = filters[facet]; if (selected && !counts.has(selected)) counts.set(selected, 0);
      facets[facet] = [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, count }));
    }
    // Metadata projection, facets and cursor authority precede page-bound byte hints.
    for (let index = 0; index < rows.length; index++) {
      const candidate = eligibility.get(rows[index].linkId)!;
      if (!deps.filters || deps.readSource || (!candidate.archive && !candidate.restore)) continue;
      const bytes = await objectExists(candidate.link);
      rows[index] = { ...rows[index], canArchive: candidate.archive && bytes, canRestore: candidate.restore && bytes };
    }
    const last = rows.at(-1);
    return { ok: true, data: { descriptor: { data: { rows, nextCursor: hasMore && last ? encodeCursor({ id: last.linkId, createdAt: last.createdAt }, tenantId, userId, key, binding) : null,
      ownerTypes: [...new Set(projected.map(r => r.ownerType))], total: matched.length, facets }, entitlements: { withheld: [] } } } };
  } catch { return unavailable(); }
}
