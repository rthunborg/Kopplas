"use client";

/** Documents destination: authorized per-link contexts, existing flat narrowing and contextual upload. */
import { useMemo, useState } from "react";
import { useActionState } from "react";
import {
  FileIndexUpload,
  type UploadOwnerOptions,
} from "@/components/files/FileIndexUpload";
import { createDocumentSignedAccessAction } from "@/features/documents/actions";
import {
  filterFileIndexRows,
  OWNER_CATEGORY_ORDER,
  ownerCategoryLabel,
  type FileIndexRow,
} from "@/features/files/file-index";
import {
  SIGNED_ACCESS_INITIAL,
  type SignedAccessState,
} from "@/features/files/signed-access-state";
import { useSignedLinkExpiry } from "@/features/files/use-signed-link-expiry";

/** Format a byte count as a compact human size for the list. */
function formatSize(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleDateString("sv-SE");
}

export function FileIndexList({
  rows,
  loadError,
  uploadOwnerOptions,
  uploadOptionsLoadError = false,
  nextCursor = null,
}: {
  readonly rows: readonly FileIndexRow[];
  readonly loadError: string | null;
  readonly nextCursor?: string | null;
  /** The owner option lists for the "Ladda upp fil" affordance (owner decision 2026-07-14). */
  readonly uploadOwnerOptions: UploadOwnerOptions;
  /** True when any owner-options read FAILED (threaded to the upload form's neutral message). */
  readonly uploadOptionsLoadError?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [ownerCategory, setOwnerCategory] = useState("");

  // Client-side in-memory narrowing over the already-tenant-scoped rows (the thin Phase-A pattern).
  const filtered = useMemo(
    () => filterFileIndexRows(rows, { search, ownerCategory }),
    [rows, search, ownerCategory],
  );

  return (
    <section
      data-testid="file-index"
      aria-labelledby="file-index-heading"
      className="flex flex-col gap-6 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="file-index-heading" className="text-2xl font-semibold text-zinc-900">
          Dokument
        </h1>
        {/* The list-page upload entry point (reuses uploadFileAction — no new upload path). */}
        <FileIndexUpload
          ownerOptions={uploadOwnerOptions}
          optionsLoadError={uploadOptionsLoadError}
        />
      </div>
      <p className="text-sm text-zinc-600">
        Dokument kopplade till dina tillgängliga kunder, kalkyler, offerter och jobb.
      </p>

      {loadError ? (
        <p
          role="alert"
          data-testid="file-index-error"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {loadError} <a href="/files" className="underline focus-visible:ring-2">Försök igen</a>
        </p>
      ) : (
        <>
          {/* Search + owner-category filter (the fixed Phase A category set ONLY — R-816). */}
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-600">Sök (namn eller typ)</span>
              <input
                type="search"
                data-testid="file-index-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök filnamn eller filtyp"
                className="rounded-md border border-zinc-300 px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-600">Kategori</span>
              <select
                data-testid="file-index-category-filter"
                value={ownerCategory}
                onChange={(e) => setOwnerCategory(e.target.value)}
                className="rounded-md border border-zinc-300 px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="">Alla kategorier</option>
                {OWNER_CATEGORY_ORDER.filter(ot => rows.some(row => row.ownerType === ot)).map((ot) => (
                  <option key={ot} value={ot}>
                    {ownerCategoryLabel(ot)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p data-testid="file-index-empty" className="text-sm text-zinc-600">
              Inga filer matchar. Ladda upp en fil med “Ladda upp fil” och koppla den
              till en kund, kalkyl eller ett jobb — filer kopplade till offerter (t.ex.
              offert-PDF:er och acceptansunderlag) visas här när de skapas.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((r) => (
                <FileIndexRowItem key={r.linkId} row={r} />
              ))}
            </ul>
          )}
          {nextCursor ? <a href={`/files?cursor=${encodeURIComponent(nextCursor)}`} data-testid="documents-next-page" className="w-fit text-sm text-blue-700 underline focus-visible:ring-2">Visa fler dokument</a> : null}
        </>
      )}
    </section>
  );
}

/** Each row reauthorizes its exact link/file pair for initial open and expiry refresh. */
function FileIndexRowItem({ row }: { readonly row: FileIndexRow }) {
  const [state, formAction, pending] = useActionState<SignedAccessState, FormData>(
    async (_previous, form) => {
      const result = await createDocumentSignedAccessAction({ link_id: form.get("link_id"), file_id: form.get("file_id") });
      return result.ok ? { ...SIGNED_ACCESS_INITIAL, status: "success", signedUrl: result.data.signedUrl, expiresAt: result.data.expiresAt }
        : { ...SIGNED_ACCESS_INITIAL, status: "error", code: result.code, formError: result.message };
    },
    SIGNED_ACCESS_INITIAL,
  );

  const { hasFreshLink, linkExpired } = useSignedLinkExpiry(state);
  const inline = row.mimeType === "application/pdf" || row.mimeType?.startsWith("text/") || row.mimeType?.startsWith("image/");

  return (
    <li
      data-testid="file-index-row"
      className="flex flex-col gap-1 rounded-md border border-zinc-200 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="truncate text-sm font-medium text-zinc-900">
          {row.displayName}
        </span>
        <span
          data-testid="file-index-row-category"
          className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
        >
          {row.ownerCategory}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
        <span>{row.mimeType ?? "Okänd typ"}</span>
        <span>·</span>
        <span>{formatSize(row.sizeBytes) || "—"}</span>
        <span>·</span>
        <span>Uppladdad: {formatDate(row.createdAt)}</span>
      </div>
      {row.ownerLabel ? <p className="text-sm text-zinc-600">{row.ownerLabel}</p> : null}
      {row.locked ? <p role="note" className="text-xs text-amber-800">Dokumentet är låst som underlag och kan inte ersättas.</p> : null}
      <form action={formAction} className="mt-1 flex flex-col gap-1">
        {/* Only exact selected link/file IDs reach the action; source and Storage identity stay server-derived. */}
        <input type="hidden" name="file_id" value={row.fileId} />
        <input type="hidden" name="link_id" value={row.linkId} />
        {!linkExpired ? (
          <button
            type="submit"
            disabled={pending}
            data-testid="file-index-preview-button"
            className="inline-flex w-fit items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-zinc-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {pending ? "Öppnar…" : state.status === "success" ? "Öppna igen" : inline ? "Förhandsgranska" : "Ladda ned"}
          </button>
        ) : (
          <>
            {/* EXPIRY → REFRESH (AC2): the stale URL is NOT reused. A generic text status (not
                color-only) + a re-open submit that RE-INVOKES the command (a fresh full auth). */}
            <p
              role="status"
              data-testid="file-index-preview-expired"
              className="text-xs text-amber-800"
            >
              Länken har gått ut.
            </p>
            <button
              type="submit"
              disabled={pending}
              data-testid="file-index-preview-reopen"
              className="inline-flex w-fit items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-zinc-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {pending ? "Öppnar…" : "Länken har gått ut — öppna igen"}
            </button>
          </>
        )}
      </form>
      {hasFreshLink && state.signedUrl ? (
        <a
          href={inline ? state.signedUrl : `${state.signedUrl}${state.signedUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(row.displayName)}`}
          download={inline ? undefined : row.displayName}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="file-index-preview-link"
          className="w-fit text-sm text-blue-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {inline ? "Öppna fil (tidsbegränsad länk)" : "Ladda ned fil (tidsbegränsad länk)"}
        </a>
      ) : null}
      {state.status === "error" && state.formError ? (
        <p
          role="alert"
          data-testid="file-index-preview-error"
          className="text-sm text-red-800"
        >
          {state.formError}
        </p>
      ) : null}
    </li>
  );
}
