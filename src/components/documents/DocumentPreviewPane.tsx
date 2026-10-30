"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/crm/Dialog";
import type { DocumentPreviewState } from "@/features/documents/filters";
export function DocumentPreviewPane({ state, file, onRefresh, onBack }: { readonly state: DocumentPreviewState; readonly file: { displayName: string; mimeType: string | null } | null; readonly onRefresh: () => void; readonly onBack: () => void }) {
  const back = useRef<HTMLButtonElement>(null);
  const signedUrl = state.status === "ready" ? state.signedUrl : null;
  const image = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file?.mimeType ?? "");
  const pdf = file?.mimeType === "application/pdf";
  const inlineOpen = image || pdf || file?.mimeType?.startsWith("text/");
  const href = signedUrl && !inlineOpen ? signedUrl + (signedUrl.includes("?") ? "&" : "?") + "download=" + encodeURIComponent(file?.displayName ?? "document") : signedUrl;
  return <Dialog open={!!file} variant="sheet" title="Förhandsvisning" onClose={onBack} initialFocusRef={back}>
    <aside data-testid="documents-preview-pane" aria-label="Valt dokument" className="min-w-0 space-y-4 text-text-primary">
    {file ? <>
      <button ref={back} data-testid="documents-preview-back" type="button" onClick={onBack} className={previewControl}>Tillbaka till listan</button>
      <h3 className="break-words text-ds-17 font-medium">{file.displayName}</h3>
      {state.status === "loading" ? <p role="status" data-testid="documents-preview-loading">Öppnar…</p> : null}
      {state.error ? <p role={state.status === "expired" ? "status" : "alert"} className={`rounded-control px-4 py-3 text-label ${state.status === "expired" ? "bg-warn-surface text-warn-text" : "bg-risk-surface text-risk-text"}`}>{state.error}</p> : null}
      {signedUrl && (image || pdf) ? <DocumentMedia key={signedUrl} url={signedUrl} name={file.displayName} pdf={pdf} onRetry={onRefresh} /> : null}
      {href ? <a href={href} download={!inlineOpen ? file.displayName : undefined} target={!inlineOpen ? undefined : "_blank"} rel="noopener noreferrer" className="flex min-h-11 w-fit items-center rounded-control text-label underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Ladda ned</a> : null}
      {state.selection?.mode === "active" ? <button type="button" disabled={state.status === "loading"} onClick={onRefresh} className={previewControl}>{state.retryable ? "Försök igen" : "Förnya åtkomst"}</button> : <p className="text-label text-text-secondary">Arkiverade dokument visas utan filåtkomst.</p>}
    </> : <p className="text-sm text-zinc-600">Välj ett dokument för att förhandsvisa.</p>}
    </aside>
  </Dialog>;
}
const previewControl = "min-h-11 rounded-control border border-border-strong bg-white px-4 py-2 text-label font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-inset disabled:text-text-disabled";
function DocumentMedia({ url, name, pdf, onRetry }: { url: string; name: string; pdf: boolean; onRetry: () => void }) {
  const [media, setMedia] = useState<{ status: "loading" | "ready" | "error"; objectUrl?: string }>({ status: "loading" });
  useEffect(() => {
    if (!pdf) return;
    const controller = new AbortController(); let objectUrl: string | undefined;
    // Load the actual PDF bytes once. HTTP failure never becomes a ready native frame.
    void (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
        if (!response.ok || (contentType && !["application/pdf", "application/octet-stream"].includes(contentType))) throw new Error("PDF unavailable");
        // Authorized projected PDF metadata also covers legacy opaque Storage MIME.
        const bytes = await response.blob(); if (!bytes.size) throw new Error("PDF unavailable"); if (controller.signal.aborted) return;
        // Native iframe load events do not expose decoder failures. Validate the actual catalog/page tree first.
        const { PDFDocument } = await import("pdf-lib");
        if (controller.signal.aborted) return;
        const document = await PDFDocument.load(await bytes.arrayBuffer(), { throwOnInvalidObject: true, updateMetadata: false });
        if (document.getPages().length === 0) throw new Error("PDF unavailable");
        if (controller.signal.aborted) return;
        const blob = new Blob([bytes], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob); setMedia({ status: "ready", objectUrl });
      } catch { if (!controller.signal.aborted) setMedia({ status: "error" }); }
    })();
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [pdf, url]);
  return <>
    {media.status === "loading" ? <p role="status" data-testid="documents-media-loading">Läser in förhandsvisning…</p> : null}
    {media.status === "error" ? <div data-testid="documents-media-error" className="space-y-3 rounded-control bg-risk-surface px-4 py-3 text-label text-risk-text"><p role="alert">Förhandsvisningen kunde inte läsas in. Försök igen eller ladda ned dokumentet.</p><button type="button" onClick={onRetry} className={previewControl}>Försök igen</button></div> : pdf ? media.objectUrl && <iframe title={name} src={media.objectUrl} onError={() => setMedia({ status: "error" })} className="h-96 w-full border-0" /> : <img src={url} alt={name} onLoad={() => setMedia({ status: "ready" })} onError={() => setMedia({ status: "error" })} className="max-h-96 max-w-full object-contain" />}
  </>;
}
