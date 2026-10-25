"use client";
import { recurrenceLimits } from "@/features/scheduling/recurrence";
export type RecurrenceFieldValues = { enabled: boolean; preset: string; endMode: string; count: number; untilDate?: string; weekdays: number[] };
const field = "min-h-12 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600";
export function BookingRecurrenceFields(props: RecurrenceFieldValues & { disabled: boolean; onChange: (value: Partial<RecurrenceFieldValues>) => void }) {
  return <fieldset disabled={props.disabled} className="space-y-3"><legend className="font-semibold">Upprepning</legend>
    <label className="flex min-h-11 items-center gap-3"><input data-testid="booking-recurrence-enabled" type="checkbox" checked={props.enabled} onChange={e => props.onChange({ enabled: e.target.checked })} />Upprepa bokningen</label>
    {props.enabled && <><label className="block">Intervall<select className={field} data-testid="booking-recurrence-preset" value={props.preset} onChange={e => props.onChange({ preset: e.target.value })}>
      <option value="daily">Varje dag</option><option value="weekly">Varje vecka</option><option value="biweekly">Varannan vecka</option><option value="monthly">Varje månad</option></select></label>
    {(props.preset === "weekly" || props.preset === "biweekly") && <fieldset data-testid="booking-recurrence-weekdays" className="flex flex-wrap gap-3"><legend>Veckodagar</legend>{["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map((day, index) => <label key={day} className="flex min-h-11 items-center gap-1"><input type="checkbox" value={index + 1} checked={props.weekdays.includes(index + 1)} onChange={e => props.onChange({ weekdays: e.target.checked ? [...props.weekdays, index + 1] : props.weekdays.filter(n => n !== index + 1) })} />{day}</label>)}</fieldset>}
    <label className="block">Serien slutar<select className={field} data-testid="booking-recurrence-end-mode" value={props.endMode} onChange={e => props.onChange({ endMode: e.target.value })}><option value="count">Efter antal tillfällen</option><option value="until">På datum</option></select></label>
    {props.endMode === "count" ? <label className="block">Antal tillfällen<input className={field} data-testid="booking-recurrence-count" type="number" min={1} max={recurrenceLimits.maxOccurrences} required value={props.count} onChange={e => props.onChange({ count: Number(e.target.value) })} /></label> :
      <label className="block">Till och med<input className={field} data-testid="booking-recurrence-until" type="date" required value={props.untilDate ?? ""} onChange={e => props.onChange({ untilDate: e.target.value })} /></label>}
    <p className="text-xs text-zinc-600">Tid i Stockholm behålls. Varannan vecka räknas från startveckans måndag. Månadsdatum som saknas hoppas över. Slutdatum ingår. Högst {recurrenceLimits.maxOccurrences} tillfällen; en större serie avvisas helt.</p></>}
  </fieldset>;
}
