// Request-bound source context, independent of file presence; no Storage capability is produced.
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { normalizeRoles } from "@/server/authz/roles";
import { resolveCapability } from "@/server/authz/permission-matrix";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { DOCUMENT_SOURCE_REGISTRY } from "./document-sources";
import { buildDocumentsContextHref, isDocumentContextRef, isDocumentContextUuid, type DocumentContextRef } from "@/features/documents/context-navigation";
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Row = Record<string, unknown>;
export type DocumentContextResult = { readonly state: "available"; readonly data: { readonly ref: DocumentContextRef; readonly ownerLabel: string; readonly contextReturnHref: string; readonly href?: string }; readonly entitlements: { readonly canOpenDocuments: true } }
  | { readonly state: "unavailable" | "error"; readonly data: null; readonly entitlements: { readonly canOpenDocuments: false } };
export interface DocumentContextDeps {
  readonly client?: object;
  readonly resolveContext?: (options?: { client?: object }) => Promise<{ ok: true; data: { userId: string; tenantId: string; roles: readonly string[]; status?: string } } | { ok: false; code: string; message: string }>;
  readonly loadRow?: (table: string, id: string, tenantId: string, client: object) => Promise<Row | null>;
}
const unavailable = (state: "unavailable" | "error" = "unavailable"): DocumentContextResult => ({ data: null, entitlements: { canOpenDocuments: false }, state });
const label = (value: unknown, fallback: string): string => typeof value === "string" && value.trim() ? value : fallback;
/** Registry capability and the same live-source ancestry used by the Documents link adapter. */
export async function readDocumentContext(ref: unknown, deps: DocumentContextDeps = {}): Promise<DocumentContextResult> {
  if (!isDocumentContextRef(ref)) return unavailable();
  const ownerId = ref.ownerId.toLowerCase();
  try {
    const client = deps.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const authority = await (deps.resolveContext ?? (options => resolveTenantContext({ client: options?.client as Client })))({ client });
    if (!authority.ok) return unavailable(authority.code === "SERVER_ERROR" ? "error" : "unavailable");
    const { tenantId } = authority.data, roles = normalizeRoles(authority.data.roles);
    const entry = DOCUMENT_SOURCE_REGISTRY[ref.ownerType];
    if ((authority.data.status !== undefined && authority.data.status !== "active") ||
      !resolveCapability({ roles, module: "documents", capability: "Documents.View" }).granted ||
      !resolveCapability({ roles, module: "files", capability: "Files.View" }).granted ||
      !resolveCapability({ roles, module: entry.module, capability: entry.capability }).granted) return unavailable();
    const load = deps.loadRow ?? (async (table: string, id: string): Promise<Row | null> => {
      const columns = table === "quotes" ? "id,tenant_id,archived_at" : Object.values(DOCUMENT_SOURCE_REGISTRY).find(source => source.table === table)?.columns;
      if (!columns) throw new Error("Unknown source table");
      const { data, error } = await (client as Client).from(table).select(columns).eq("tenant_id", tenantId).eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Row | null;
    });
    const get = (table: string, id: unknown) => isDocumentContextUuid(id) ? load(table, id, tenantId, client) : Promise.resolve(null);
    const live = (row: Row | null): row is Row => !!row && row.tenant_id === tenantId && row.archived_at === null && isDocumentContextUuid(row.id);
    const source = await get(entry.table, ownerId);
    if (!live(source) || source.id !== ownerId) return unavailable();
    let ownerLabel = "", contextReturnHref = "";
    if (ref.ownerType === "customer") { ownerLabel = label(source.display_name, "Kund"); contextReturnHref = `/customers/${source.id}`; }
    if (ref.ownerType === "facility" || ref.ownerType === "contact") {
      const customer = await get("customers", source.customer_id);
      if (!live(customer)) return unavailable();
      if (ref.ownerType === "contact" && source.facility_id !== null && source.facility_id !== undefined) {
        const facility = await get("facilities", source.facility_id);
        if (!live(facility) || !live(await get("customers", facility.customer_id))) return unavailable();
      }
      ownerLabel = label(source.name, ref.ownerType === "facility" ? "Anläggning" : "Kontakt"); contextReturnHref = `/customers/${customer.id}`;
    }
    if (ref.ownerType === "calculation") {
      if (source.status === "archived") return unavailable();
      ownerLabel = label(source.title, "Kalkyl"); contextReturnHref = `/calculations/${source.id}`;
    }
    if (ref.ownerType === "work_order") {
      const parent = await get("jobs", source.job_id);
      if (!live(parent) || parent.id !== source.job_id) return unavailable();
      ownerLabel = label(source.title, "Arbetsorder");
      contextReturnHref = `/jobs/${parent.id}?workOrder=${source.id}`;
    }
    if (ref.ownerType === "job") { ownerLabel = label(source.title, "Jobb"); contextReturnHref = `/jobs/${source.id}`; }
    if (ref.ownerType === "quote_version" || ref.ownerType === "quote_acceptance") {
      const version = ref.ownerType === "quote_version" ? source : await get("quote_versions", source.quote_version_id);
      if (!live(version) || (ref.ownerType === "quote_acceptance" && source.quote_id !== version.quote_id)) return unavailable();
      const quote = await get("quotes", version.quote_id);
      if (!live(quote)) return unavailable();
      ownerLabel = `${ref.ownerType === "quote_acceptance" ? "Acceptans" : "Offert"} ${label(version.quote_number_display, "")} · version ${Number.isSafeInteger(version.version_number) ? version.version_number : 1}`;
      contextReturnHref = `/quotes/${quote.id}/versions/${version.id}`;
    }
    return { state: "available", data: { ref: { module: entry.module, ownerType: ref.ownerType, ownerId: source.id as string }, ownerLabel, contextReturnHref }, entitlements: { canOpenDocuments: true } };
  } catch { return unavailable("error"); }
}
export async function readEntityDocumentsLink(ref: unknown, deps: DocumentContextDeps = {}): Promise<DocumentContextResult> {
  const result = await readDocumentContext(ref, deps);
  return result.state === "available" ? { ...result, data: { ...result.data, href: buildDocumentsContextHref(result.data.ref) } } : result;
}
