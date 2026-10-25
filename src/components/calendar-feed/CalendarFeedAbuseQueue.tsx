import type { CalendarFeedAbuse } from "@/features/calendar-feed/types";
/** Caller receives this separate aggregate only after the SQL Admin gate. */
export function CalendarFeedAbuseQueue({ data }: { readonly data: CalendarFeedAbuse | null }) {
  if (!data) return null;
  return <section aria-label="Kalenderprenumerationer – begränsningar" className="mx-auto mt-8 max-w-2xl space-y-3 rounded-lg border border-zinc-200 p-4"><h2 className="text-lg font-semibold">Förfrågningar och begränsningar</h2><p className="text-sm">Antal förfrågningar i registrerade tokenfönster: {data.requests}. Antal begränsade förfrågningar: {data.limited}.</p><p className="text-sm">Senaste begränsning: {data.lastSpikeAt ? new Date(data.lastSpikeAt).toLocaleString("sv-SE") : "Ingen registrerad"}.</p></section>;
}
