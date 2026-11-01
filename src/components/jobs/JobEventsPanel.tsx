"use client";
import {useRouter} from "next/navigation";
import type {JobEventsReadResult} from "@/server/read-models/job-events";
const LABELS: Record<string, string> = {created: "Skapad", in_progress: "Pågår", done: "Klar", cancelled: "Avbruten", upgraded_to_projekt: "Uppgraderad till projekt"};
/** Only the dedicated safe projection crosses this presentation boundary. */
export function JobEventsPanel({events, compact = false}: {events: JobEventsReadResult; compact?: boolean}) {
  const router = useRouter();
  const rows = compact ? events.rows.slice(-3) : events.rows;
  return <section data-testid={compact ? "job-recent-events" : "job-event-history"} className="space-y-4 rounded-card border border-border-default bg-card p-4 text-label text-text-primary sm:p-6">
    <h2 className="text-section font-medium">{compact ? "Senaste händelser" : "Händelser"}</h2>
    {events.error ? <div className="rounded-control bg-risk-surface px-4 py-3 text-risk-text"><p role="alert">{events.error}</p><button type="button" onClick={() => router.refresh()} className="min-h-11 rounded-control px-3 text-label underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Försök igen</button></div>
      : rows.length === 0 ? <p className="py-6 text-text-secondary">Inga händelser.</p>
      : <ol>{rows.map(event => <li key={event.id} data-testid={compact ? undefined : `job-event-${event.id}`} className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 pb-4 last:pb-0 sm:grid-cols-[92px_1rem_minmax(0,1fr)]">
        <time dateTime={event.occurredAt} className="col-start-2 row-start-2 break-words text-caption text-text-secondary sm:col-start-1 sm:row-start-1">{new Date(event.occurredAt).toLocaleString("sv-SE", {timeZone: "Europe/Stockholm"})}</time>
        <span aria-hidden="true" className="relative col-start-1 row-span-2 row-start-1 flex justify-center sm:col-start-2"><span className="absolute inset-y-0 w-px bg-border-default" /><span className="relative mt-1.5 size-[7px] rounded-full bg-text-tertiary" /></span>
        <span className="col-start-2 row-start-1 min-w-0 break-words font-medium sm:col-start-3">{LABELS[event.eventType] ?? "Jobbet uppdaterades"}</span>
      </li>)}</ol>}
  </section>;
}
