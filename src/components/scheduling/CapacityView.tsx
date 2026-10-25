"use client";
import type { SchedulingReadData, SchedulingReadInput, SchedulingCapacityCell } from "@/features/scheduling/view-types";
import { schedulingPeriod } from "@/features/scheduling/view-model";

export function CapacityView({ data, input, onDrill, onRetry }: {
  readonly data: SchedulingReadData;
  readonly input: SchedulingReadInput;
  readonly onDrill: (cell: SchedulingCapacityCell) => void;
  readonly onRetry?: () => void;
}) {
  const dates = schedulingPeriod(input.date, input.mode).dates;
  const people = (data.roster ?? []).filter(p => !input.filters.personIds.length || input.filters.personIds.includes(p.id));
  const cellButton = (cell: SchedulingCapacityCell) => <button type="button"
    key={`${cell.personId}:${cell.date}`} data-testid="capacity-cell" data-date={cell.date} data-person={cell.personId}
    data-state={cell.state} data-budget={cell.budget ?? ""} data-demand={cell.demand ?? ""}
    data-balance={cell.balance ?? ""} data-occupancy={cell.occupancy ?? ""}
    onClick={() => cell.state === "unavailable" ? onRetry?.() : onDrill(cell)}
    className={`min-h-11 w-full space-y-1 rounded-md border p-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-blue-600 ${cell.state.startsWith("overbooked") ? "border-red-300 bg-red-50" : "border-zinc-300 bg-white"}`}>
    <span className="block font-medium">{data.roster?.find(p => p.id === cell.personId)?.label} · {cell.date}</span>
    {cell.state === "unavailable" ? <span>Kapacitet ej tillgänglig. Försök igen.</span> : <>
      <span className="block">Bokat {cell.demand} min / budget {cell.budget} min</span>
      <span className="block">Balans {cell.balance} min · {cell.occupancy === null ? "Ingen kapacitet" : `${Math.round(cell.occupancy)} %`}</span>
      {cell.occupancy !== null && <progress className="w-full" aria-label={`Beläggning ${Math.round(cell.occupancy)} procent`} max={100} value={Math.max(0, Math.min(100, cell.occupancy))} />}
      <span className="block underline">Visa bokningar</span>
    </>}
  </button>;
  return <section aria-label="Beläggning" className="space-y-3">
    <p className="text-sm">Kapacitet omfattar alla planerade bokningar för valda personer, även utanför jobb-, kund- och arbetsrollsfilter.</p>
    <div aria-label="Kapacitetssammanfattning" className="space-y-3 sm:hidden">
      {data.capacity?.filter(c => !input.filters.personIds.length || input.filters.personIds.includes(c.personId)).map(cellButton)}
    </div>
    <div className="hidden overflow-x-auto sm:block">
      <table aria-label="Kapacitet per person och dag" className="w-full border-separate border-spacing-2 text-sm">
        <thead><tr><th scope="col" className="text-left">Person</th>{dates.map(date => <th key={date} scope="col" className="min-w-48 text-left">{date}</th>)}</tr></thead>
        <tbody>{people.map(person => <tr key={person.id}><th scope="row" className="min-w-40 text-left">{person.label}</th>{dates.map(date => {
          const cell = data.capacity?.find(c => c.personId === person.id && c.date === date);
          return <td key={date} className="align-top">{cell ? cellButton(cell) : <p>Kapacitet ej tillgänglig.</p>}</td>;
        })}</tr>)}</tbody>
      </table>
    </div>
  </section>;
}
