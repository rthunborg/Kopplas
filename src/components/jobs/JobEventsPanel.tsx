"use client";
import {useRouter} from "next/navigation";
import type {JobEventsReadResult} from "@/server/read-models/job-events";
const LABELS: Record<string, string> = {created: "Skapad", in_progress: "Pågår", done: "Klar", cancelled: "Avbruten", upgraded_to_projekt: "Uppgraderad till projekt"};
/** Only the dedicated safe projection crosses this presentation boundary. */
export function JobEventsPanel({events, compact = false}: {events: JobEventsReadResult; compact?: boolean}) {
  const router = useRouter();
  const rows = compact ? events.rows.slice(-3) : events.rows;
  return <section data-testid={compact ? "job-recent-events" : "job-event-history"} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm">
    <h2 className="font-semibold text-zinc-900">{compact ? "Senaste händelser" : "Händelser"}</h2>
    {events.error ? <p role="alert" className="text-red-800">{events.error} <button type="button" onClick={() => router.refresh()} className="min-h-11 px-3 underline focus-visible:ring-2 focus-visible:ring-blue-600">Försök igen</button></p>
      : rows.length === 0 ? <p className="text-zinc-600">Inga händelser.</p>
      : <ol className="space-y-3">{rows.map(event => <li key={event.id} data-testid={compact ? undefined : `job-event-${event.id}`} className="flex flex-wrap justify-between gap-2 border-l-2 border-zinc-300 pl-3">
        <span>{LABELS[event.eventType] ?? "Jobbet uppdaterades"}</span><time dateTime={event.occurredAt} className="text-zinc-600">{new Date(event.occurredAt).toLocaleString("sv-SE", {timeZone: "Europe/Stockholm"})}</time>
      </li>)}</ol>}
  </section>;
}
