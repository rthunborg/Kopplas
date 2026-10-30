"use client";
import { useId, useState } from "react";
export function DocumentLifecycleActions({ archived, canArchive, canRestore, pending, onArchive, onRestore }: { readonly archived: boolean; readonly canArchive: boolean; readonly canRestore: boolean; readonly pending: boolean; readonly onArchive: () => void; readonly onRestore: () => void }) {
  const available = archived ? canRestore : canArchive;
  const hintId = useId();
  const [hintVisible, setHintVisible] = useState(false);
  return <div className="flex flex-wrap items-center gap-2">
    <span className="relative inline-flex" onMouseEnter={() => setHintVisible(true)} onMouseLeave={() => setHintVisible(false)} onFocus={() => setHintVisible(true)} onBlur={() => setHintVisible(false)} onKeyDown={event => { if (event.key === "Escape") setHintVisible(false); }}>
      <button type="button" aria-describedby={available && !archived ? hintId : undefined} disabled={pending || !available} onClick={archived ? onRestore : onArchive} className="min-h-11 rounded-control border border-border-strong bg-white px-3 py-2 text-label font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-inset disabled:text-text-disabled">{archived ? "Återställ" : "Arkivera"}</button>
      {available && !archived ? <span id={hintId} role="tooltip" hidden={!hintVisible} className="absolute bottom-full left-0 z-20 w-48 rounded-control bg-inverse-surface px-3 py-1.5 text-ds-11 text-inverse-text">Arkiverar filen för alla kopplingar. Du får bekräfta först.</span> : null}
    </span>
    {!available ? <span className="text-caption text-text-secondary">Åtgärden är inte tillgänglig.</span> : null}
  </div>;
}
