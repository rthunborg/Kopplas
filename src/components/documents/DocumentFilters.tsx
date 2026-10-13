"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileIndexUpload, type UploadOwnerOptions } from "@/components/files/FileIndexUpload";
import { ownerCategoryLabel, OWNER_CATEGORY_ORDER } from "@/features/files/file-index";
import { DOCUMENT_PREVIEW_INITIAL, documentPreviewReducer, documentFilterIdentity, documentFilterParams, type DocumentFilters as Filters } from "@/features/documents/filters";
import { createDocumentSignedAccessAction } from "@/features/documents/actions";
import type { DocumentRow, DocumentFacets } from "@/server/read-models/documents";
import { DocumentPreviewPane } from "./DocumentPreviewPane";
import { DocumentLifecycleActions } from "./DocumentLifecycleActions";
import { Dialog } from "@/components/crm/Dialog";
const moduleLabels: Record<string, string> = { crm: "Kunder", calculations: "Kalkyler", quotes: "Offerter", jobs: "Jobb" };
const purposeLabels: Record<string, string> = { crm_document: "Kunddokument", calculation_attachment: "Kalkylbilaga", quote_attachment_snapshot: "Offertbilaga", quote_pdf: "Offert-PDF", acceptance_evidence: "Acceptansunderlag", job_evidence: "Jobbunderlag" };
const control = "min-w-0 rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600";
export function DocumentFilters({ filters, facets, showCounts = true, onChange }: { readonly filters: Filters; readonly facets: DocumentFacets; readonly showCounts?: boolean; readonly onChange: (patch: Partial<Filters>) => void }) {
  return <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
    <label className="col-span-2 flex min-w-0 flex-col gap-1 text-sm lg:col-span-1">Sök dokument<input data-testid="file-index-search" type="search" value={filters.q ?? ""} onChange={e => onChange({ q: e.target.value })} className={control} /></label>
    {(["module", "ownerType", "purpose"] as const).map(facet => <label key={facet} className="flex min-w-0 flex-col gap-1 text-sm">{facet === "module" ? "Modul" : facet === "ownerType" ? "Typ" : "Syfte"}<select aria-label={facet === "module" ? "Modul" : facet === "ownerType" ? "Typ" : "Syfte"} data-testid={facet === "ownerType" ? "file-index-category-filter" : undefined} value={filters[facet] ?? ""} onChange={e => onChange({ [facet]: e.target.value || undefined })} className={control}>
      <option value="">{facet === "ownerType" ? "Alla kategorier" : "Alla"}</option>{(facet === "ownerType" ? [...facets[facet]].sort((a, b) => OWNER_CATEGORY_ORDER.indexOf(a.value) - OWNER_CATEGORY_ORDER.indexOf(b.value)) : facets[facet]).map(({ value, count }) => <option key={value} value={value}>{facet === "module" ? moduleLabels[value] : facet === "ownerType" ? ownerCategoryLabel(value) : purposeLabels[value]}{showCounts && facet !== "ownerType" ? ` (${count})` : ""}</option>)}
    </select></label>)}
    <label className="flex min-w-0 flex-col gap-1 text-sm">Från<input type="date" value={filters.from ?? ""} onChange={e => onChange({ from: e.target.value || undefined })} className={control} /></label>
    <label className="flex min-w-0 flex-col gap-1 text-sm">Till<input type="date" value={filters.to ?? ""} onChange={e => onChange({ to: e.target.value || undefined })} className={control} /></label>
    <div className="col-span-2 flex gap-2 lg:col-span-6">{(["active", "archived"] as const).map(mode => <button key={mode} type="button" aria-pressed={filters.mode === mode} onClick={() => onChange({ mode })} className={control}>{mode === "active" ? "Aktiva" : "Arkiverade"}</button>)}</div>
  </div>;
}
type LifecycleAction = (input: { link_id: string; file_id: string }) => Promise<import("@/lib/result/result").Result<import("@/server/commands/documents/lifecycle-db").DocumentLifecycleResult, import("@/server/commands/command-errors").CommandErrorCode>>;
type PendingOperation = { row: DocumentRow; operation: "archive" | "restore"; action: LifecycleAction; phase: "uncertain" | "refreshing"; readRows?: readonly DocumentRow[] };
interface Props { readonly authorityIdentity: string; readonly actions: readonly { linkId: string; archiveDocumentAction: LifecycleAction; restoreDocumentAction: LifecycleAction }[]; readonly rows: readonly DocumentRow[]; readonly undoRows: readonly DocumentRow[]; readonly initialFilters: Filters; readonly facets: DocumentFacets; readonly total: number; readonly nextCursor: string | null; readonly loadError: string | null; readonly uploadOwnerOptions: UploadOwnerOptions; readonly uploadOptionsLoadError: boolean; }
/** Server projection owns rows/counts; only transient drafts, selection and feedback live here. */
export function DocumentsWorkspace({ authorityIdentity, actions, rows, undoRows, initialFilters, facets, total, nextCursor, loadError, uploadOwnerOptions, uploadOptionsLoadError }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const serverBinding = documentFilterIdentity(initialFilters), draftBinding = documentFilterIdentity(filters);
  const observed = useRef(serverBinding), pendingBindings = useRef<string[]>([]);
  const [preview, dispatch] = useReducer(documentPreviewReducer, DOCUMENT_PREVIEW_INITIAL);
  const sequence = useRef(0), focusedRow = useRef<HTMLButtonElement | null>(null);
  const [selectedRow, setSelectedRow] = useState<DocumentRow | null>(null);
  const activeMutation = useRef<{ action: LifecycleAction; attempt: number } | null>(null);
  const mutationSequence = useRef(0);
  const [recentArchive, setRecentArchive] = useState<{ row: DocumentRow; until: number } | null>(null);
  const [undoConfirmation, setUndoConfirmation] = useState(false);
  const [undoExpired, setUndoExpired] = useState(false);
  const [confirmationOperation, setConfirmationOperation] = useState<"archive" | "restore">("archive");
  const [confirmation, setConfirmation] = useState<DocumentRow | null>(null);
  const [retainedOperations, setRetainedOperations] = useState<PendingOperation[]>([]);
  const [retryConfirmation, setRetryConfirmation] = useState<PendingOperation | null>(null);
  const [lifecycle, setLifecycle] = useState<{ status: "idle" | "pending" | "success" | "error"; message?: string; binding?: string }>({ status: "idle" });
  const resetPreview = useCallback(() => { sequence.current++; dispatch({ type: "clear" }); setSelectedRow(null); }, []);
  useEffect(() => {
    if (observed.current === serverBinding) return;
    observed.current = serverBinding;
    resetPreview(); if (!activeMutation.current) setConfirmation(null);
    const own = pendingBindings.current.indexOf(serverBinding);
    if (own >= 0) { pendingBindings.current.splice(0, own + 1); return; }
    pendingBindings.current = []; setFilters(initialFilters);
  }, [serverBinding, initialFilters, resetPreview]);
  useEffect(() => {
    if (draftBinding === serverBinding) return;
    const timer = setTimeout(() => {
      if (pendingBindings.current.at(-1) === draftBinding) return;
      pendingBindings.current.push(draftBinding);
      const params = documentFilterParams({ ...filters, q: filters.q?.trim(), cursor: undefined });
      router.replace(`/files${params.size ? `?${params}` : ""}`, { scroll: false });
    }, 200);
    return () => clearTimeout(timer);
  }, [draftBinding, serverBinding, filters, router]);
  useEffect(() => {
    if (!preview.expiresAt || !preview.signedUrl) return;
    const expire = () => dispatch({ type: "expire", nowIso: new Date().toISOString() });
    const timer = setTimeout(expire, Math.max(0, Date.parse(preview.expiresAt) - currentDocumentTime())); return () => clearTimeout(timer);
  }, [preview.expiresAt, preview.signedUrl]);
  const changeFilters = (patch: Partial<Filters>) => { resetPreview(); if (!activeMutation.current) setConfirmation(null); setFilters(current => ({ ...current, ...patch, cursor: undefined })); };
  const uploadSuccess = useCallback(() => {
    const reset: Filters = { q: "", mode: "active" };
    const binding = documentFilterIdentity(reset); pendingBindings.current = observed.current === binding ? [] : [binding];
    if (!activeMutation.current) setRetryConfirmation(null);
    setFilters(reset); resetPreview(); if (window.location.search) router.replace("/files", { scroll: false }); else router.refresh();
  }, [router, resetPreview, setRetryConfirmation]);
  async function open(row: DocumentRow, button?: HTMLButtonElement) {
    if (draftBinding !== serverBinding || initialFilters.mode !== "active" || row.archived) return;
    if (button) focusedRow.current = button;
    const requestId = ++sequence.current;
    setSelectedRow(row); dispatch({ type: "select", tenantId: authorityIdentity, filterIdentity: serverBinding, mode: initialFilters.mode, linkId: row.linkId, fileId: row.fileId, requestId });
    let result;
    try { result = await createDocumentSignedAccessAction({ link_id: row.linkId, file_id: row.fileId }); }
    catch { result = { ok: false as const, code: "SERVER_ERROR", message: "Försök igen" }; }
    dispatch({ type: "response", requestId, linkId: row.linkId, fileId: row.fileId, receivedAt: new Date().toISOString(), result });
  }

  async function mutate(row: DocumentRow, operation: "archive" | "restore", retained?: PendingOperation, confirmed = false) {
    if (activeMutation.current || draftBinding !== serverBinding || loadError) return;
    if (retained) { if (!confirmed || retryConfirmation?.action !== retained.action || !mayRetry(retained)) return; }
    else {
      if (retainedOperations.length && (!retainedOperations.every(currentReadCompleted) || !confirmed)) return;
      const current = [...rows, ...undoRows].find(current => current.linkId === row.linkId && current.fileId === row.fileId);
      if (!rows.some(current => current.linkId === row.linkId) && (!recentArchive || currentDocumentTime() >= recentArchive.until)) return;
      if (!current || !(operation === "archive" ? current.canArchive : current.canRestore)) return;
    }
    const binding = actions.find(action => action.linkId === row.linkId);
    const action = retained?.action ?? (operation === "archive" ? binding?.archiveDocumentAction : binding?.restoreDocumentAction);
    if (!action) { setLifecycle({ status: "error", message: "Åtkomsten till åtgärden har gått ut. Läs in aktuella dokument." }); return; }
    const pending: PendingOperation = retained ?? { row, operation, action, phase: "uncertain" };
    // Keep THIS callable before POST. A later RSC refresh issues different handles.
    const attempt = ++mutationSequence.current; activeMutation.current = { action, attempt };
    setRetainedOperations(current => current.some(operation => operation.action === pending.action) ? current.map(operation => operation.action === pending.action ? { ...pending, phase: "uncertain", readRows: undefined } : operation) : [...current, pending]); resetPreview(); setLifecycle({ status: "pending" });
    try {
      const result = await action({ link_id: row.linkId, file_id: row.fileId });
      if (activeMutation.current?.attempt !== attempt) return;
      if (!result.ok) {
        // A checked conflict/denial is terminal for this handle, never silently replaced.
        if (result.code !== "SERVER_ERROR") setRetainedOperations(current => current.filter(operation => operation.action !== action));
        setLifecycle({ status: "error", binding: serverBinding, message: result.code === "COMMAND_CONFLICT" ? "Åtgärden har redan hanterats och dokumentets tillstånd har ändrats. Läs in aktuella dokument." : "Åtgärden kunde inte bekräftas. Läs in aktuella dokument och försök igen." }); return;
      }
      setRetainedOperations(current => current.filter(operation => operation.action !== action));
      setLifecycle({ status: "success", binding: serverBinding, message: operation === "archive" ? "Arkiverad" : "Återställd" });
      setUndoExpired(false); setRecentArchive(operation === "archive" && result.data.changed ? { row, until: currentDocumentTime() + 10_000 } : null); router.refresh();
    } catch { if (activeMutation.current?.attempt === attempt) setLifecycle({ status: "error", binding: serverBinding, message: "Åtgärden kunde inte bekräftas. Läs in aktuella dokument och försök igen." }); }
    finally { if (activeMutation.current?.attempt === attempt) { activeMutation.current = null; setUndoConfirmation(false); setConfirmation(null); setRetryConfirmation(null); } }
  }
  function retryRead() {
    if (activeMutation.current) return;
    resetPreview(); setUndoConfirmation(false); setConfirmation(null); setRetryConfirmation(null); setLifecycle({ status: "idle" });
    setRetainedOperations(current => current.map(operation => ({ ...operation, phase: "refreshing", readRows: rows })));
    if (loadError && initialFilters.cursor) {
      const params = documentFilterParams({ ...initialFilters, cursor: undefined });
      router.replace(`/files${params.size ? `?${params}` : ""}`, { scroll: false });
    } else router.refresh();
  }
  // Only a new server projection after explicit refresh enables confirmation; local renders do not.
  const currentReadCompleted = (operation: PendingOperation): boolean => operation.phase === "refreshing" && operation.readRows !== rows && !loadError && draftBinding === serverBinding;
  const mayRetry = (operation: PendingOperation): boolean => {
    const row = rows.find(row => row.linkId === operation.row.linkId && row.fileId === operation.row.fileId);
    return !!row && currentReadCompleted(operation) && (operation.operation === "archive" ? row.canArchive === true : row.canRestore === true);
  };
  const unresolvedRead = retainedOperations.some(operation => !currentReadCompleted(operation));
  const lifecycleBlocked = lifecycle.status === "pending" || unresolvedRead || draftBinding !== serverBinding;
  const retryDialogOpen = !!retryConfirmation && (lifecycle.status === "pending" || mayRetry(retryConfirmation));
  const modalOpen = !!confirmation || retryDialogOpen;
  // Eligibility can change without an action reply. Drop only a closed, nonbusy confirmation, never its retained callable.
  if (retryConfirmation && !retryDialogOpen) setRetryConfirmation(null);
  const undoRow = recentArchive ? undoRows.find(row => row.fileId === recentArchive.row.fileId && row.linkId === recentArchive.row.linkId && row.canRestore) : undefined;
  useEffect(() => {
    if (!recentArchive) return;
    const timer = setTimeout(() => {
      setRecentArchive(null);
      // Toast expiry never cancels a started request or discards its retained identity.
      if (undoConfirmation && !activeMutation.current) { setUndoConfirmation(false); setConfirmation(null); setUndoExpired(true); }
    }, Math.max(0, recentArchive.until - currentDocumentTime())); return () => clearTimeout(timer);
  }, [recentArchive, undoConfirmation]);
  const nextParams = documentFilterParams({ ...initialFilters, cursor: nextCursor ?? undefined });
  return <section data-testid="file-index" aria-labelledby="documents-heading" className="flex max-h-[calc(100dvh-12rem)] flex-col [&>*]:shrink-0 gap-3 overflow-y-auto p-3 md:p-6 lg:max-h-none lg:overflow-visible">
    <div inert={modalOpen} className="flex flex-col gap-3 [&>*]:shrink-0">
    <div className="sticky top-0 z-10 [&:has([aria-expanded=true])]:static flex flex-wrap items-center justify-between gap-2 bg-white py-2"><h1 id="documents-heading" className="text-2xl font-semibold text-zinc-900">Dokument</h1><FileIndexUpload ownerOptions={uploadOwnerOptions} optionsLoadError={uploadOptionsLoadError} onUploadSuccess={uploadSuccess} /></div>
    {loadError ? <p role="alert" data-testid="file-index-error" className="text-red-800">{loadError} <button type="button" onClick={retryRead} className="underline">Försök igen</button></p> : <>
      <DocumentFilters filters={filters} facets={facets} showCounts={draftBinding === serverBinding} onChange={changeFilters} />
      {draftBinding !== serverBinding ? <p role="status" data-testid="documents-projection-loading">Läser in dokument…</p> : null}
      <div hidden={draftBinding !== serverBinding}>
      <p className="text-sm text-zinc-600">Dokument: <span data-testid="documents-result-count">{total}</span></p>
      <div className="flex flex-wrap gap-2 text-xs text-zinc-600" aria-label="Antal per filter">{(["module", "ownerType", "purpose"] as const).flatMap(f => facets[f].map(item => <span key={`${f}:${item.value}`}>{f === "module" ? moduleLabels[item.value] : f === "ownerType" ? ownerCategoryLabel(item.value) : purposeLabels[item.value]}: <span data-testid={`documents-facet-count-${f}-${item.value}`}>{item.count}</span></span>))}</div>
      </div>
      {lifecycle.status === "pending" ? <p role="status" data-testid="documents-lifecycle-pending">Sparar…</p> : null}
      {lifecycle.status === "success" && lifecycle.binding === serverBinding && draftBinding === serverBinding ? <p role="status" data-testid="documents-lifecycle-success">{lifecycle.message}</p> : null}
      {lifecycle.status === "error" && lifecycle.binding === serverBinding && draftBinding === serverBinding ? <div data-testid="documents-lifecycle-error"><p role="alert">{lifecycle.message}</p><button type="button" onClick={retryRead} className={control}>Försök igen</button></div> : null}
      {unresolvedRead && lifecycle.status !== "pending" ? <div data-testid="documents-operation-refresh-required" className="rounded border border-amber-300 p-3 text-sm">
        <p role="alert">Den tidigare åtgärdens svar kunde inte bekräftas. Läs in aktuella dokument före nästa åtgärd.</p>
        <button type="button" onClick={retryRead} className={control}>Läs in aktuella dokument</button>
      </div> : null}
      {retainedOperations.filter(operation => currentReadCompleted(operation)).map((operation, index) => <div key={index} data-testid="documents-operation-uncertain" className="rounded border border-amber-300 p-3 text-sm">
        <p>Den tidigare åtgärdens svar kunde inte bekräftas. Aktuella dokument har lästs in.</p>
        {mayRetry(operation) ? <button type="button" disabled={lifecycle.status === "pending"} onClick={() => { if (!activeMutation.current && mayRetry(operation)) setRetryConfirmation(operation); }} className={control}>Bekräfta tidigare åtgärd</button> : <p>Den tidigare åtgärden är inte tillgänglig i detta tillstånd.</p>}
        <button type="button" disabled={lifecycle.status === "pending"} onClick={() => { if (activeMutation.current) return; setRetainedOperations(current => current.filter(candidate => candidate.action !== operation.action)); setRetryConfirmation(null); }} className={control}>Avsluta tidigare åtgärd</button>
      </div>)}
      {undoExpired ? <p role="status" data-testid="documents-undo-expired">Tiden för att ångra har gått ut. Läs in aktuella dokument.</p> : null}
      {undoRow && !lifecycleBlocked ? <button data-testid="documents-archive-undo" type="button" className={control} onClick={() => { setUndoConfirmation(true); setUndoExpired(false); setConfirmationOperation("restore"); setConfirmation(undoRow); }}>Ångra arkivering</button> : null}
      <div className={draftBinding !== serverBinding ? "hidden" : "grid items-start gap-3 lg:grid-cols-2"}>
        <div className="min-w-0">{rows.length === 0 ? <p data-testid="file-index-empty" className="text-sm text-zinc-600">{total === 0 && draftBinding === documentFilterIdentity({ mode: filters.mode }) ? "Inga tillgängliga dokument." : "Inga dokument matchar filtren."}</p> : <ul className="flex flex-col gap-2">{rows.map(row => <li key={row.linkId} data-testid="file-index-row" className="flex min-w-0 flex-col gap-1 rounded-md border border-zinc-200 p-3">
          <input type="hidden" name="file_id" value={row.fileId} /><input type="hidden" name="link_id" value={row.linkId} /><div className="flex items-start justify-between gap-2"><span className="break-words text-sm font-medium text-zinc-900">{row.displayName}</span><span data-testid="file-index-row-category" className="shrink-0 text-xs text-zinc-600">{ownerCategoryLabel(row.ownerType)}</span></div>
          <p className="text-xs text-zinc-600">{row.mimeType ?? "Okänd typ"} · <span data-testid="file-index-size">{formatDocumentSize(row.sizeBytes)}</span> · {new Date(row.createdAt).toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" })}</p><p className="text-sm text-zinc-600">{row.ownerLabel}</p>
          {row.locked ? <p role="note" className="text-xs text-amber-800">Dokumentet är låst som underlag och kan inte ersättas.</p> : null}
          <div className="flex flex-wrap gap-2">{initialFilters.mode === "active" && !row.archived ? <button type="button" data-testid="file-index-preview-button" onClick={e => void open(row, e.currentTarget)} className={control}>Förhandsvisa</button> : null}<DocumentLifecycleActions archived={initialFilters.mode === "archived"} canArchive={row.canArchive === true} canRestore={row.canRestore === true} pending={lifecycleBlocked} onArchive={() => { if (!lifecycleBlocked && !activeMutation.current) { setConfirmationOperation("archive"); setConfirmation(row); } }} onRestore={() => { if (lifecycleBlocked || activeMutation.current) return; if (retainedOperations.length) { setConfirmationOperation("restore"); setConfirmation(row); } else void mutate(row, "restore"); }} /></div>
        </li>)}</ul>}{nextCursor && draftBinding === serverBinding ? <a href={`/files?${nextParams}`} data-testid="documents-next-page" className="my-3 block text-blue-700 underline">Visa fler dokument</a> : null}</div>
        <div className={selectedRow ? "order-first lg:order-last" : "lg:order-last"}><DocumentPreviewPane state={preview} file={selectedRow} onRefresh={() => { if (selectedRow) void open(selectedRow); }} onBack={() => { resetPreview(); focusedRow.current?.focus(); focusedRow.current?.scrollIntoView({ block: "center" }); }} /></div>
      </div>
    </>}
    </div>
    <Dialog open={retryDialogOpen} title="Bekräfta tidigare åtgärd" busy={lifecycle.status === "pending"} onClose={() => setRetryConfirmation(null)}>
      <p className="my-3">{retryConfirmation?.operation === "archive" ? "Filen arkiveras för alla sina kopplingar" : "Återställ filen enligt aktuellt tillstånd"}</p>
      <button type="button" disabled={lifecycle.status === "pending"} onClick={() => { if (retryConfirmation) void mutate(retryConfirmation.row, retryConfirmation.operation, retryConfirmation, true); }} className={control}>{retryConfirmation?.operation === "archive" ? "Arkivera" : "Återställ"}</button>
      <button type="button" disabled={lifecycle.status === "pending"} onClick={() => setRetryConfirmation(null)} className={control}>Avbryt</button>
    </Dialog>
    <Dialog open={!!confirmation} title={confirmationOperation === "archive" ? "Arkivera dokument" : "Bekräfta ny återställning"} busy={lifecycle.status === "pending"} onClose={() => { setUndoConfirmation(false); setConfirmation(null); }}>
      <p className="my-3">{confirmationOperation === "archive" ? "Filen arkiveras för alla sina kopplingar" : "Återställ filen enligt aktuellt tillstånd"}</p>
      <button type="button" disabled={lifecycle.status === "pending"} onClick={() => { if (confirmation) void mutate(confirmation, confirmationOperation, undefined, true); }} className={control}>{confirmationOperation === "archive" ? "Arkivera" : "Återställ"}</button>
      <button type="button" disabled={lifecycle.status === "pending"} onClick={() => { setUndoConfirmation(false); setConfirmation(null); }} className={control}>Avbryt</button>
    </Dialog>
  </section>;
}
function formatDocumentSize(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return Math.round(bytes / (1024 * 1024)) + " MB";
}

/** Wall-clock reads occur only in operation handlers and timer effects, outside render derivation. */
function currentDocumentTime(): number { return Date.now(); }
