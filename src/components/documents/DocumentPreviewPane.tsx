"use client";
import { useEffect, useRef, useState } from "react";
import type { DocumentPreviewState } from "@/features/documents/filters";
export function DocumentPreviewPane({ state, file, onRefresh, onBack }: { readonly state: DocumentPreviewState; readonly file: { displayName: string; mimeType: string | null } | null; readonly onRefresh: () => void; readonly onBack: () => void }) {
  const back = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (file) { back.current?.focus(); back.current?.scrollIntoView({ block: "start" }); } }, [file]);
  const signedUrl = state.status === "ready" ? state.signedUrl : null;
  const image = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file?.mimeType ?? "");
  const pdf = file?.mimeType === "application/pdf";
  const inlineOpen = image || pdf || file?.mimeType?.startsWith("text/");
  const href = signedUrl && !inlineOpen ? signedUrl + (signedUrl.includes("?") ? "&" : "?") + "download=" + encodeURIComponent(file?.displayName ?? "document") : signedUrl;
  return <aside data-testid="documents-preview-pane" aria-label="Förhandsvisning" className="min-w-0 rounded-md border border-zinc-200 bg-white p-3">
    {file ? <>
      <button ref={back} data-testid="documents-preview-back" type="button" onClick={onBack} className="rounded border border-zinc-300 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600">Tillbaka till listan</button>
      <h2 className="my-3 break-words text-lg font-semibold text-zinc-900">{file.displayName}</h2>
      {state.status === "loading" ? <p role="status" data-testid="documents-preview-loading">Öppnar…</p> : null}
      {state.error ? <p role={state.status === "expired" ? "status" : "alert"} className="my-2 text-sm text-zinc-700">{state.error}</p> : null}
      {signedUrl && (image || pdf) ? <DocumentMedia key={signedUrl} url={signedUrl} name={file.displayName} pdf={pdf} onRetry={onRefresh} /> : null}
      {href ? <a href={href} download={!inlineOpen ? file.displayName : undefined} target={!inlineOpen ? undefined : "_blank"} rel="noopener noreferrer" className="my-3 block w-fit text-blue-700 underline focus-visible:ring-2">Ladda ned</a> : null}
      {state.selection?.mode === "active" ? <button type="button" disabled={state.status === "loading"} onClick={onRefresh} className="my-2 rounded border border-zinc-300 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">{state.retryable ? "Försök igen" : "Förnya åtkomst"}</button> : <p className="text-sm text-zinc-600">Arkiverade dokument visas utan filåtkomst.</p>}
    </> : <p className="text-sm text-zinc-600">Välj ett dokument för att förhandsvisa.</p>}
  </aside>;
}
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
        const bytes = await response.blob(); if (!bytes.size) throw new Error("PDF unavailable");
        const blob = new Blob([bytes], { type: "application/pdf" });
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob); setMedia({ status: "ready", objectUrl });
      } catch { if (!controller.signal.aborted) setMedia({ status: "error" }); }
    })();
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [pdf, url]);
  return <>
    {media.status === "loading" ? <p role="status" data-testid="documents-media-loading">Läser in förhandsvisning…</p> : null}
    {media.status === "error" ? <div data-testid="documents-media-error"><p role="alert">Förhandsvisningen kunde inte läsas in. Försök igen eller ladda ned dokumentet.</p><button type="button" onClick={onRetry} className="rounded border px-3 py-2 text-sm">Försök igen</button></div> : pdf ? media.objectUrl && <iframe title={name} src={media.objectUrl} onError={() => setMedia({ status: "error" })} className="h-96 w-full border-0" /> : <img src={url} alt={name} onLoad={() => setMedia({ status: "ready" })} onError={() => setMedia({ status: "error" })} className="max-h-96 max-w-full object-contain" />}
  </>;
}
