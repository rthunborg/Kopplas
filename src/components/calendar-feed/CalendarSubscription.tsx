"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Dialog } from "@/components/crm/Dialog";
import { manageCalendarFeedAction, readCalendarFeedSettingsAction } from "@/features/calendar-feed/actions";
import { pendingCalendarFeed, transitionCalendarFeed, reconcileCalendarFeedIssuance, type CalendarFeedActionState } from "@/features/calendar-feed/action-state";
import type { CalendarFeedAction, CalendarFeedStatus } from "@/features/calendar-feed/types";

const button = "min-h-11 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";
export function CalendarSubscription({ initial, initialState = null }: { readonly initial: CalendarFeedStatus | null; readonly initialState?: CalendarFeedActionState | null }) {
  const [status, setStatus] = useState(initial), [state, setState] = useState<CalendarFeedActionState | null>(initialState);
  const [confirm, setConfirm] = useState<CalendarFeedAction | null>(null), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const uncertain = state?.status === "unknown", blocked = busy || uncertain;
  async function refresh(attemptId?: string) {
    const read = await readCalendarFeedSettingsAction(attemptId);
    if (!read.ok) throw new Error("Calendar status unavailable");
    setStatus(read.status); return read.status;
  }
  async function mutate(action: CalendarFeedAction, retry = false) {
    if (!status || busy || (!retry && uncertain)) return;
    const request = retry && state ? state.request : { action, revision: status.revision, attemptId: crypto.randomUUID() };
    const pending = pendingCalendarFeed(request); setState(pending); setBusy(true); setMessage("");
    try {
      const result = await manageCalendarFeedAction(request);
      if (result.outcome === "unavailable") { setState(transitionCalendarFeed(pending, "unknown")); setMessage("Svaret saknas. Kontrollera resultatet innan du ändrar länken igen."); return; }
      if (result.outcome === "committed") {
        // Only a confirmed first issuance can expose the in-memory URL.
        setState(result.issuedPath ? transitionCalendarFeed(pending, "confirmed-fresh", { attemptId: request.attemptId, revision: result.revision, rawUrl: new URL(result.issuedPath, window.location.origin).href }) : transitionCalendarFeed(pending, "revoked"));
        setMessage(action === "revoke" ? "Prenumerationen är återkallad." : "Länken är skapad. Kopiera den nu; den visas bara den här gången.");
      } else if (result.outcome === "replayed") { setState(transitionCalendarFeed(pending, "reconciled-committed")); setMessage("Ändringen är sparad. Länken kan inte återhämtas. Rotera för att få en ny länk."); }
      else { setState(transitionCalendarFeed(pending, retry ? "unknown" : "denied")); setMessage("Ändringen kunde inte bekräftas. Kontrollera status och försök igen."); }
      try {
        const current = await refresh();
        if (result.outcome === "committed" && (!current.active && action !== "revoke" || current.revision !== result.revision)) {
          setState(previous => previous ? reconcileCalendarFeedIssuance(previous, current) : previous);
          setMessage("Statusen har ändrats. Välj en ny ändring utifrån aktuell status.");
        }
      } catch { setMessage(m => `${m} Statusen kunde inte uppdateras. Försök igen.`); }
    } catch { setState(transitionCalendarFeed(pending, "unknown")); setMessage("Anslutningen bröts. Kontrollera resultatet innan du försöker igen."); }
    finally { setBusy(false); setConfirm(null); }
  }
  async function reconcile() {
    setBusy(true); setMessage("");
    try {
      const current = await refresh(state?.request.attemptId);
      if (state?.status === "unknown") {
        if (current.attemptOutcome === "committed") { setState(transitionCalendarFeed(state, "reconciled-committed")); setMessage("Ändringen är sparad. Den utfärdade länken kan inte återhämtas. Rotera uttryckligen för en ny länk."); }
        else if (current.revision === state.request.revision) { setState(transitionCalendarFeed(state, "reconciled-not-found")); setMessage("Inget sparat resultat hittades. Försök igen med samma ändring."); }
        else { setState(transitionCalendarFeed(state, "superseded-response")); setMessage("Statusen har ändrats. Välj en ny ändring utifrån aktuell status."); }
      } else {
        if (state) setState(reconcileCalendarFeedIssuance(state, current));
        setMessage("Statusen är uppdaterad.");
      }
    } catch { setMessage("Statusen kunde inte hämtas. Försök igen."); }
    finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(state!.rawUrl!); setMessage("Länken är kopierad."); }
    catch { input.current?.focus(); input.current?.select(); setMessage("Markera och kopiera länken i fältet."); }
  }
  return <section aria-labelledby="calendar-subscription-title" className="mx-auto max-w-2xl space-y-5">
    <h1 id="calendar-subscription-title" className="text-2xl font-semibold text-zinc-900">Kalenderprenumeration</h1>
    <p className="text-sm text-zinc-700">Alla som har länken kan läsa dina bokningar och deras jobb, kundnamn och plats. Dela den varsamt. Kalenderleverantören kan behålla tidigare hämtade händelser även efter att länken har återkallats.</p>
    <Link href="/scheduling?view=personal" className="inline-flex min-h-11 items-center text-blue-700 underline focus-visible:ring-2 focus-visible:ring-blue-600">Till Min kalender</Link>
    {status ? <dl className="space-y-2 text-sm"><div><dt className="font-medium">Prenumeration</dt><dd>{status.active ? "Aktiv" : "Ingen aktiv länk"}</dd></div><div><dt className="font-medium">Senast hämtad</dt><dd>{status.lastUsedAt ? new Date(status.lastUsedAt).toLocaleString("sv-SE") : "Aldrig hämtad"}</dd></div><div><dt className="font-medium">Antal hämtningar</dt><dd>{status.usageCount}</dd></div></dl> : <p role="alert">Statusen kunde inte hämtas. Försök igen.</p>}
    {status?.active && !state?.rawUrl && <p className="text-sm">Den befintliga länken visas inte igen. Rotera för att skapa en ny länk om du har tappat den.</p>}
    {state?.rawUrl && <div className="space-y-2"><label htmlFor="calendar-feed-url" className="block text-sm font-medium">Din kalenderlänk (visas bara nu)</label><input id="calendar-feed-url" ref={input} type="text" readOnly value={state.rawUrl} onFocus={e => e.currentTarget.select()} className="min-h-11 w-full rounded-md border border-zinc-300 p-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600"/><button className={button} onClick={copy}>Kopiera länk</button></div>}
    <p role="status" aria-live="polite" className="text-sm text-zinc-700">{busy ? "Arbetar…" : message || (uncertain ? "Resultatet är osäkert. Kontrollera resultatet." : state?.requiresRotation ? "Länken kan inte återhämtas. Rotera för en ny länk." : state?.status === "error" ? "Ändringen kunde inte bekräftas. Kontrollera status och försök igen." : "")}</p>
    <div className="flex flex-wrap gap-3">
      {status && !status.active && <button className={button} disabled={blocked || state?.status === "retry"} onClick={() => mutate("create")}>Skapa kalenderlänk</button>}
      {status?.active && <><button className={button} disabled={blocked || state?.status === "retry"} onClick={() => setConfirm("rotate")}>Rotera länk</button><button className={button} disabled={blocked || state?.status === "retry"} onClick={() => setConfirm("revoke")}>Återkalla länk</button></>}
      <button className={button} disabled={busy} onClick={reconcile}>{uncertain ? "Kontrollera resultat" : "Uppdatera status"}</button>
      {state?.status === "retry" && <button className={button} disabled={busy} onClick={() => mutate(state.request.action, true)}>Försök igen med samma ändring</button>}
    </div>
    <Dialog open={confirm !== null} title={confirm === "revoke" ? "Återkalla kalenderlänk" : "Rotera kalenderlänk"} busy={busy} onClose={() => setConfirm(null)}>
      <p className="mb-4 text-sm">Den gamla länken slutar fungera. Tidigare hämtade händelser kan finnas kvar hos kalenderleverantören.</p><div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => confirm && mutate(confirm)}>{confirm === "revoke" ? "Bekräfta återkalla" : "Bekräfta rotera"}</button><button className={button} disabled={busy} onClick={() => setConfirm(null)}>Avbryt</button></div>
    </Dialog>
  </section>;
}
