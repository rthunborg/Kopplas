import { DOCUMENT_FILTER_SOURCES, parseDocumentFilters, type DocumentFilters } from "./filters";
import type { Result } from "@/lib/result/result";

export type ActiveOwnerType = keyof typeof DOCUMENT_FILTER_SOURCES;
export type ActiveSourceModuleId = (typeof DOCUMENT_FILTER_SOURCES)[ActiveOwnerType]["module"];
export interface DocumentContextRef { readonly module: ActiveSourceModuleId; readonly ownerType: ActiveOwnerType; readonly ownerId: string; }
export const isDocumentContextUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function isDocumentContextRef(value: unknown): value is DocumentContextRef {
  if (!value || typeof value !== "object") return false;
  const ref = value as Record<string, unknown>;
  return typeof ref.ownerType === "string" && Object.hasOwn(DOCUMENT_FILTER_SOURCES, ref.ownerType) &&
    DOCUMENT_FILTER_SOURCES[ref.ownerType as ActiveOwnerType].module === ref.module && isDocumentContextUuid(ref.ownerId);
}
/** Fixed local navigation intent. Every receiver still checks current source authority. */
export function buildDocumentsContextHref(ref: DocumentContextRef, retainedFilters: Partial<DocumentFilters> = {}): string {
  if (!isDocumentContextRef(ref)) throw new Error("Invalid document context");
  const params = new URLSearchParams({ module: ref.module, ownerType: ref.ownerType, ownerId: ref.ownerId });
  for (const name of ["q", "purpose", "from", "to", "mode"] as const) {
    const value = retainedFilters[name]; if (value !== undefined && value !== "") params.set(name, value);
  }
  if (!parseDocumentFilters(params).ok) throw new Error("Invalid document context filters");
  return `/files?${params}`;
}
export function parseDocumentsContextQuery(params: URLSearchParams): Result<{ context: DocumentContextRef | null; filters: DocumentFilters }, "VALIDATION_FAILED"> {
  const parsed = parseDocumentFilters(params);
  if (!parsed.ok) return parsed;
  const filters = parsed.data;
  const context = filters.ownerId ? { module: filters.module!, ownerType: filters.ownerType!, ownerId: filters.ownerId } : null;
  if (context && !isDocumentContextRef(context)) return { ok: false, code: "VALIDATION_FAILED", message: "Kontrollera dokumentfiltren." };
  return { ok: true, data: { context: context as DocumentContextRef | null, filters } };
}
export function documentContextIdentity(ref: DocumentContextRef | null, filterIdentity: string): string {
  return JSON.stringify([ref?.module ?? "", ref?.ownerType ?? "", ref?.ownerId.toLowerCase() ?? "", filterIdentity]);
}
/** Optional presentation hint only; no authority and no CRM-parent substitution. */
export function documentsContextUploadOwner(ref: DocumentContextRef): { ownerType: "customer" | "calculation" | "job" | "work_order"; ownerId: string } | null {
  return isDocumentContextRef(ref) && (ref.ownerType === "customer" || ref.ownerType === "calculation" || ref.ownerType === "job" || ref.ownerType === "work_order") ? { ownerType: ref.ownerType, ownerId: ref.ownerId } : null;
}
