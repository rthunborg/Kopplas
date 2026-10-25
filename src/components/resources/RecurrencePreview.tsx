import { formatBookingTime } from "./BookingConflictPanel";
export type RecurrencePreviewItem = { nominalDate: string; startsAt: string; endsAt: string; conflictCount: number; isException?: boolean; status?: string };
export function RecurrencePreview({ status, items, total, warningCount, error, onRetry, candidateDescription }: { status: "ready" | "pending" | "failed";
  items: readonly RecurrencePreviewItem[]; total: number; warningCount: number; error?: string; onRetry?:()=>void; candidateDescription?:string }) {
  return <section data-testid="booking-recurrence-preview" data-state={status} data-total={total} data-candidate-description={candidateDescription} aria-label="Förhandsgranska bokningsserien" className="space-y-2" aria-live="polite">
    {status !== "ready" ? <div><p role={status === "failed" ? "alert" : "status"}>{status === "failed" ? error ?? "Kunde inte förhandsgranska serien." : "Kontrollerar hela serien…"}</p>{status === "failed" && <button type="button" data-testid="booking-series-preview-retry" className="min-h-11 rounded-md border border-zinc-300 px-3" onClick={onRetry}>Försök igen</button>}</div> : <>
      <p>Visar {Math.min(10, items.length)} av {total} tillfällen.</p><ol className="space-y-2">{items.slice(0, 10).map((item, index) => <li key={`${item.nominalDate}:${index}`} data-testid="booking-recurrence-preview-row" data-nominal-date={item.nominalDate} className="rounded-md border border-zinc-200 p-2 text-sm">
        {item.nominalDate} · {formatBookingTime(item.startsAt)} – {formatBookingTime(item.endsAt)} <span data-testid="booking-series-conflict-glyph" aria-label={item.conflictCount ? `Konflikter: ${item.conflictCount}` : "Inga konflikter"}>{item.conflictCount ? "⚠" : "✓"}</span>
        {item.isException && <span> · avviker från serien</span>}{item.status === "cancelled" && <span> · Avbruten</span>}</li>)}</ol>
      <p data-testid="booking-recurrence-all-warnings">Hela serien har {warningCount} varningar, även tillfällen efter de första tio. Granska samtliga nedan.</p></>}
  </section>;
}
