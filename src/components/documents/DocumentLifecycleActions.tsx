"use client";
export function DocumentLifecycleActions({ archived, canArchive, canRestore, pending, onArchive, onRestore }: { readonly archived: boolean; readonly canArchive: boolean; readonly canRestore: boolean; readonly pending: boolean; readonly onArchive: () => void; readonly onRestore: () => void }) {
  const available = archived ? canRestore : canArchive;
  return <div className="flex flex-wrap items-center gap-2">
    <button type="button" disabled={pending || !available} onClick={archived ? onRestore : onArchive} className="rounded border border-zinc-300 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">{archived ? "Återställ" : "Arkivera"}</button>
    {!available ? <span className="text-xs text-zinc-600">Åtgärden är inte tillgänglig.</span> : null}
  </div>;
}
