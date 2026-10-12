import { documentDateBounds } from "./date-bounds";
import type { Result } from "@/lib/result/result";

/** Browser-safe vocabulary; the server additionally intersects current registry/capabilities. */
export const DOCUMENT_FILTER_SOURCES = {
  customer: { module: "crm", purposes: ["crm_document"] }, facility: { module: "crm", purposes: ["crm_document"] }, contact: { module: "crm", purposes: ["crm_document"] },
  calculation: { module: "calculations", purposes: ["calculation_attachment"] }, quote_version: { module: "quotes", purposes: ["quote_attachment_snapshot", "quote_pdf"] },
  quote_acceptance: { module: "quotes", purposes: ["acceptance_evidence"] }, job: { module: "jobs", purposes: ["job_evidence"] },
} as const;
export interface DocumentFilters { readonly q?: string; readonly module?: string; readonly ownerType?: string; readonly purpose?: string; readonly from?: string; readonly to?: string; readonly mode: "active" | "archived"; readonly cursor?: string; }
const keys = ["q", "module", "ownerType", "purpose", "from", "to", "mode", "cursor"] as const;
export function parseDocumentFilters(params: URLSearchParams): Result<DocumentFilters, "VALIDATION_FAILED"> {
  const invalid = (): Result<never, "VALIDATION_FAILED"> => ({ ok: false, code: "VALIDATION_FAILED", message: "Kontrollera dokumentfiltren." });
  for (const key of params.keys()) if (!(keys as readonly string[]).includes(key) || params.getAll(key).length !== 1) return invalid();
  const input = Object.fromEntries(keys.map(k => [k, params.get(k)?.trim() || undefined]));
  const mode = input.mode ?? "active"; if (mode !== "active" && mode !== "archived") return invalid();
  if ((input.q?.length ?? 0) > 1024 || (input.cursor?.length ?? 0) > 1024 || !documentDateBounds(input).ok) return invalid();
  const entries = Object.entries(DOCUMENT_FILTER_SOURCES);
  if ((input.module && !entries.some(([, e]) => e.module === input.module)) ||
    (input.ownerType && !Object.hasOwn(DOCUMENT_FILTER_SOURCES, input.ownerType)) ||
    (input.purpose && !entries.some(([, e]) => (e.purposes as readonly string[]).includes(input.purpose!)))) return invalid();
  if (!entries.some(([type, e]) => (!input.module || e.module === input.module) && (!input.ownerType || type === input.ownerType) && (!input.purpose || (e.purposes as readonly string[]).includes(input.purpose)))) return invalid();
  return { ok: true, data: { q: input.q ?? "", module: input.module, ownerType: input.ownerType, purpose: input.purpose, from: input.from, to: input.to, mode, cursor: input.cursor } };
}
export function documentFilterIdentity(filters: DocumentFilters): string {
  return JSON.stringify([filters.q?.trim().toLowerCase() ?? "", filters.module ?? "", filters.ownerType ?? "", filters.purpose ?? "", filters.from ?? "", filters.to ?? "", filters.mode ?? "active"]);
}
export function documentFilterParams(filters: DocumentFilters): URLSearchParams {
  const result = new URLSearchParams(); for (const key of keys) { const value = filters[key]; if (value) result.set(key, value.trim()); } return result;
}
interface FilterRow { readonly displayName?: string; readonly mimeType?: string | null; readonly module?: string; readonly ownerType?: string; readonly purpose?: string; readonly createdAt?: string; readonly lifecycleState?: string; readonly archived?: boolean; }
/** Only already-authorized display metadata is searched, never owner labels or bytes. */
export function filterDocumentRows<T extends FilterRow>(rows: readonly T[], filters: DocumentFilters): T[] {
  const bounds = documentDateBounds(filters); if (!bounds.ok) return [];
  const q = filters.q?.trim().toLowerCase() ?? "";
  return rows.filter(r => (!q || r.displayName?.toLowerCase().includes(q) || r.mimeType?.toLowerCase().includes(q)) &&
    (!filters.module || filters.module === r.module) && (!filters.ownerType || filters.ownerType === r.ownerType) && (!filters.purpose || filters.purpose === r.purpose) &&
    (!bounds.data.fromUtc || !!r.createdAt && Date.parse(r.createdAt) >= Date.parse(bounds.data.fromUtc)) &&
    (!bounds.data.toUtc || !!r.createdAt && Date.parse(r.createdAt) < Date.parse(bounds.data.toUtc)) &&
    (r.lifecycleState === undefined || (filters.mode === "archived" ? r.archived === true || r.lifecycleState === "archived" : r.archived !== true && r.lifecycleState !== "archived")));
}
interface Selection { readonly tenantId: string; readonly filterIdentity: string; readonly mode: string; readonly linkId: string; readonly fileId: string; readonly requestId: number; }
export interface DocumentPreviewState { readonly selection: Selection | null; readonly signedUrl: string | null; readonly expiresAt: string | null; readonly error: string | null; readonly retryable: boolean; readonly status: "idle" | "loading" | "ready" | "expired" | "error"; }
export const DOCUMENT_PREVIEW_INITIAL: DocumentPreviewState = { selection: null, signedUrl: null, expiresAt: null, error: null, retryable: false, status: "idle" };
export type DocumentPreviewEvent = ({ type: "select" } & Selection) | { type: "clear" } | { type: "expire"; nowIso: string } | { type: "response"; requestId: number; linkId: string; fileId: string; receivedAt?: string; result: { ok: true; data: { targetId: string; linkId: string; signedUrl: string; expiresAt: string } } | { ok: false; code: string; message: string } };
export function documentPreviewReducer(state: DocumentPreviewState, event: DocumentPreviewEvent): DocumentPreviewState {
  if (event.type === "clear") return DOCUMENT_PREVIEW_INITIAL;
  if (event.type === "select") return { ...DOCUMENT_PREVIEW_INITIAL, selection: event, status: event.mode === "active" ? "loading" : "idle" };
  if (event.type === "expire") return state.expiresAt && Date.parse(event.nowIso) >= Date.parse(state.expiresAt) ? { ...state, signedUrl: null, status: "expired", error: "Åtkomsten har gått ut" } : state;
  const current = state.selection;
  if (!current || current.mode !== "active" || current.requestId !== event.requestId || current.linkId !== event.linkId || current.fileId !== event.fileId) return state;
  if (!event.result.ok) return { ...state, signedUrl: null, expiresAt: null, status: "error", error: event.result.code === "SERVER_ERROR" ? "Försök igen" : "Dokumentet är inte tillgängligt.", retryable: event.result.code === "SERVER_ERROR" };
  const data = event.result.data;
  if (data.linkId !== current.linkId || data.targetId !== current.fileId || !Number.isFinite(Date.parse(data.expiresAt))) return { ...state, signedUrl: null, status: "error", error: "Dokumentet är inte tillgängligt." };
  const receivedAt = event.receivedAt === undefined ? Date.now() : Date.parse(event.receivedAt);
  if (!Number.isFinite(receivedAt) || Date.parse(data.expiresAt) <= receivedAt) return { ...state, signedUrl: null, expiresAt: data.expiresAt, status: "expired", error: "Åtkomsten har gått ut", retryable: false };
  return { ...state, signedUrl: data.signedUrl, expiresAt: data.expiresAt, status: "ready", error: null };
}
