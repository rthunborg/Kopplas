// Node-only import prevents this current-authority registry entering a client bundle.
import assert from "node:assert/strict";
import { SCOPE_MANIFEST } from "@/scope/manifest";
import type { ScopeManifest } from "@/scope/manifest-schema";
import { resolveCapability } from "@/server/authz/permission-matrix";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { isPermanentStorageDenial } from "@/server/storage/signed-access";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Row = Record<string, unknown>;
export interface DocumentFile {
  readonly id: string; readonly tenant_id: string; readonly lifecycle_state: string;
  readonly archived_at: string | null; readonly artifact_kind: string | null; readonly archive_previous_state?: string | null;
  readonly bucket_id: string; readonly object_path: string;
  readonly display_name?: string | null; readonly mime_type?: string | null; readonly size_bytes?: number | null;
}
export interface DocumentCandidate {
  readonly id: string; readonly tenant_id: string; readonly file_id: string;
  readonly owner_type: string; readonly owner_id: string; readonly purpose: string;
  readonly archived_at: string | null; readonly created_at?: string; readonly is_locked?: boolean; readonly locked_at?: string | null;
  readonly file: DocumentFile;
}
export interface DocumentSourceData {
  readonly module: string; readonly ownerType: string; readonly ownerId: string; readonly ownerLabel: string;
}
export type DocumentSourceResult = { readonly ok: true; readonly data: DocumentSourceData }
  | { readonly ok: false; readonly code: "TENANT_ACCESS_DENIED" | "SERVER_ERROR"; readonly message: string };
export const DOCUMENT_SOURCE_REGISTRY = {
  customer: { module: "crm", capability: "Customers.View", table: "customers", purposes: ["crm_document"], columns: "id,tenant_id,archived_at,display_name" },
  facility: { module: "crm", capability: "Customers.View", table: "facilities", purposes: ["crm_document"], columns: "id,tenant_id,archived_at,customer_id,name" },
  contact: { module: "crm", capability: "Customers.View", table: "contacts", purposes: ["crm_document"], columns: "id,tenant_id,archived_at,customer_id,facility_id,name" },
  calculation: { module: "calculations", capability: "Calculations.View", table: "calculations", purposes: ["calculation_attachment"], columns: "id,tenant_id,archived_at,status,title" },
  quote_version: { module: "quotes", capability: "Quotes.View", table: "quote_versions", purposes: ["quote_attachment_snapshot", "quote_pdf"], columns: "id,tenant_id,archived_at,quote_id,version_number,quote_number_display,pdf_file_id,pdf_status" },
  quote_acceptance: { module: "quotes", capability: "Quotes.View", table: "quote_acceptances", purposes: ["acceptance_evidence"], columns: "id,tenant_id,archived_at,quote_id,quote_version_id" },
  job: { module: "jobs", capability: "Jobs.ViewAll", table: "jobs", purposes: ["job_evidence"], columns: "id,tenant_id,archived_at,title" },
  work_order: { module: "jobs", capability: "Jobs.ViewAll", table: "work_orders", purposes: ["job_evidence"], columns: "id,tenant_id,job_id,archived_at,title" },
} as const;
type Owner = keyof typeof DOCUMENT_SOURCE_REGISTRY;

/** Active-owner availability is exhaustive; it never substitutes for request authority. */
export function assertDocumentSourceRegistryCoherence(manifest: ScopeManifest = SCOPE_MANIFEST): void {
  const active = manifest.modules.filter(m => m.status === "active");
  const enrolled = active.flatMap(m => m.fileOwnerTypes.map(owner => [owner, m.id] as const));
  const actual = Object.entries(DOCUMENT_SOURCE_REGISTRY);
  if (actual.length !== enrolled.length || enrolled.some(([owner, module]) =>
    !actual.some(([key, entry]) => key === owner && entry.module === module))) {
    assert.fail("Documents active-source registry is incomplete");
  }
}
assertDocumentSourceRegistryCoherence();

export interface DocumentSourceDeps {
  readonly client: object; readonly tenantId: string; readonly roles: readonly string[];
  readonly mode?: "active" | "archived" | "all";
  /** Internal all-context traversal may omit bytes only for lifecycle-excluded PDF candidates. */
  readonly checkQuotePdfBytes?: boolean;
  readonly loadRow?: (table: string, id: string, tenantId: string, client: object) => Promise<Row | null>;
}
const denied = (): DocumentSourceResult => ({ ok: false, code: "TENANT_ACCESS_DENIED", message: "Dokumentet är inte tillgängligt." });
const unavailable = (): DocumentSourceResult => ({ ok: false, code: "SERVER_ERROR", message: "Dokumentet kunde inte läsas. Försök igen." });
const live = (row: Row | null, tenant: string): row is Row => !!row && row.tenant_id === tenant && row.archived_at === null;
const label = (value: unknown, fallback: string): string => typeof value === "string" && value.trim() ? value : fallback;

/** All source rows come from the supplied anon-key client; SQL failures remain retryable. */
export async function readDocumentSource(link: DocumentCandidate, deps: DocumentSourceDeps): Promise<DocumentSourceResult> {
  try {
    const owner = link.owner_type as Owner;
    if (!Object.hasOwn(DOCUMENT_SOURCE_REGISTRY, owner)) return denied();
    const entry = DOCUMENT_SOURCE_REGISTRY[owner];
    if (!SCOPE_MANIFEST.modules.some(m => m.id === entry.module && m.status === "active" && m.fileOwnerTypes.includes(owner)) ||
      !resolveCapability({ roles: deps.roles, module: "documents", capability: "Documents.View" }).granted ||
      !resolveCapability({ roles: deps.roles, module: "files", capability: "Files.View" }).granted ||
      !resolveCapability({ roles: deps.roles, module: entry.module, capability: entry.capability }).granted ||
      !(entry.purposes as readonly string[]).includes(link.purpose)) return denied();
    const file = link.file;
    if (link.tenant_id !== deps.tenantId || file.tenant_id !== deps.tenantId || link.file_id !== file.id ||
      (deps.mode === "archived" ? !(link.archived_at !== null || file.lifecycle_state === "archived") : deps.mode === "all" ? false : link.archived_at !== null || file.archived_at !== null || file.lifecycle_state === "archived") || !["linked", "locked", ...(deps.mode === "archived" || deps.mode === "all" ? ["archived"] : [])].includes(file.lifecycle_state)) return denied();
    if (file.artifact_kind !== null && file.artifact_kind !== "quote_pdf") return denied();
    if (file.artifact_kind === "quote_pdf" && (owner !== "quote_version" || link.purpose !== "quote_pdf")) return denied();
    if (link.purpose === "quote_pdf" && file.artifact_kind !== "quote_pdf") return denied();
    const load = deps.loadRow ?? (async (table: string, id: string): Promise<Row | null> => {
      const columns = table === "quotes" ? "id,tenant_id,archived_at" : Object.values(DOCUMENT_SOURCE_REGISTRY).find(source => source.table === table)?.columns;
      if (!columns) throw new Error("Unknown source table");
      const { data, error } = await (deps.client as Client).from(table).select(columns).eq("tenant_id", deps.tenantId).eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Row | null;
    });
    const get = (table: string, id: unknown) => typeof id === "string" ? load(table, id, deps.tenantId, deps.client) : Promise.resolve(null);
    const source = await get(entry.table, link.owner_id);
    if (!live(source, deps.tenantId)) return denied();
    let ownerLabel = "";
    if (owner === "customer") ownerLabel = label(source.display_name, "Kund");
    if (owner === "facility" || owner === "contact") {
      if (!live(await get("customers", source.customer_id), deps.tenantId)) return denied();
      if (owner === "contact" && source.facility_id !== null && source.facility_id !== undefined) {
        const facility = await get("facilities", source.facility_id);
        if (!live(facility, deps.tenantId) || !live(await get("customers", facility.customer_id), deps.tenantId)) return denied();
      }
      ownerLabel = label(source.name, owner === "facility" ? "Anläggning" : "Kontakt");
    }
    if (owner === "calculation") {
      if (source.status === "archived") return denied();
      ownerLabel = label(source.title, "Kalkyl");
    }
    if (owner === "work_order") {
      const parent = await get("jobs", source.job_id);
      if (source.id !== link.owner_id || !live(parent, deps.tenantId) || parent.id !== source.job_id) return denied();
      ownerLabel = label(source.title, "Arbetsorder");
    }
    if (owner === "job") ownerLabel = label(source.title, `Jobb (${link.owner_id.slice(0, 8)})`);
    if (owner === "quote_version" || owner === "quote_acceptance") {
      const version = owner === "quote_version" ? source : await get("quote_versions", source.quote_version_id);
      if (!live(version, deps.tenantId) || (owner === "quote_acceptance" && source.quote_id !== version.quote_id) ||
        !live(await get("quotes", version.quote_id), deps.tenantId)) return denied();
      ownerLabel = `${owner === "quote_acceptance" ? "Acceptans" : "Offert"} ${label(version.quote_number_display, "")} · version ${Number.isSafeInteger(version.version_number) ? version.version_number : 1}`;
      if (owner === "quote_version" && link.purpose === "quote_attachment_snapshot") {
        let attachment: Row | null;
        if (deps.loadRow) attachment = await load("quote_version_attachments", link.owner_id, deps.tenantId, deps.client);
        else {
          const { data, error } = await (deps.client as Client).from("quote_version_attachments").select("tenant_id,quote_version_id,file_id").eq("tenant_id", deps.tenantId).eq("quote_version_id", link.owner_id).eq("file_id", file.id).maybeSingle();
          if (error) throw error;
          attachment = data;
        }
        if (!attachment || attachment.tenant_id !== deps.tenantId || attachment.quote_version_id !== link.owner_id || attachment.file_id !== file.id) return denied();
      }
      if (file.artifact_kind === "quote_pdf") {
        if (version.pdf_file_id !== file.id || version.pdf_status !== "generated" || file.bucket_id !== "tenant-files" ||
          !file.object_path.startsWith(`${deps.tenantId}/${file.id}/`)) return denied();
        // Current association and provenance remain mandatory even when this PDF cannot contribute to the requested lifecycle.
        // All normal readers/signers retain strict artifact bytes by default.
        if (deps.checkQuotePdfBytes !== false) {
          const { data, error } = await (deps.client as Client).storage.from(file.bucket_id).info(file.object_path);
          if (error) { if (isPermanentStorageDenial(error)) return denied(); throw error; }
          if (!data) return denied();
        }
      }
    }
    return { ok: true, data: { module: entry.module, ownerType: owner, ownerId: link.owner_id, ownerLabel } };
  } catch { return unavailable(); }
}

/** Command adapter: exact link/file fields are derived server-side before this call. */
export async function resolveDocumentSource(client: object, authority: { readonly tenantId: string; readonly roles: readonly string[] },
  link: Omit<DocumentCandidate, "file">, file: DocumentFile): Promise<DocumentSourceData | null> {
  const result = await readDocumentSource({ ...link, file }, { client, ...authority });
  if (!result.ok) { if (result.code === "SERVER_ERROR") throw new Error("Documents source read failed"); return null; }
  return result.data;
}

