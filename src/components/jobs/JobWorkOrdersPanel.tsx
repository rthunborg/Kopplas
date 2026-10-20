"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { JobWorkOrdersProjection } from "@/server/read-models/job-work-orders";
import { resolveWorkOrderCreateSelection, selectWorkOrderDependencyWarnings, canReceiveWorkOrderPaneProjection, type WorkOrderPaneSelection } from "@/features/jobs/work-orders-domain";
import { WorkOrderPane, WORK_ORDER_STATUS_LABELS } from "./WorkOrderPane";

/** Cards and selection are presentation only; the projection supplies current capabilities. */
export function JobWorkOrdersPanel({jobId, initial, initialWorkOrderId, filesPanels = {}}: {
  jobId: string; initial: JobWorkOrdersProjection; initialWorkOrderId?: string;
  filesPanels?: Readonly<Record<string, ReactNode>>;
}) {
  const router = useRouter(), search = useSearchParams();
  const [projection, setProjection] = useState(initial);
  const [received, setReceived] = useState(initial);
  const [selected, setSelected] = useState<WorkOrderPaneSelection>(
    () => initialWorkOrderId ? {id: initialWorkOrderId, key: initialWorkOrderId} : null);
  const currentSelection = useRef<WorkOrderPaneSelection>(selected);
  const dirty = useRef(false);
  const rememberDirty = useCallback((value: boolean) => { dirty.current = value; }, []);
  if (received !== initial) { setReceived(initial); setProjection(initial); }
  function select(id: string | null, create = false) {
    if (dirty.current && !window.confirm("Det finns osparade ändringar. Vill du lämna utkastet?")) return;
    dirty.current = false;
    const next = id || create ? {id, key: id ?? crypto.randomUUID()} : null;
    currentSelection.current = next;
    setSelected(next);
    const query = new URLSearchParams(search.toString());
    query.set("tab", "work-orders");
    if (id) query.set("workOrder", id); else query.delete("workOrder");
    router.replace(`/jobs/${jobId}${query.size ? `?${query}` : ""}`, {scroll: false});
  }
  function receive(next: JobWorkOrdersProjection, createdId?: string, originKey?: string) {
    // A late abandoned result cannot remove a newer selected row and unmount its draft.
    if (!canReceiveWorkOrderPaneProjection(currentSelection.current, originKey)) return;
    const completion = createdId && originKey ? resolveWorkOrderCreateSelection(currentSelection.current, originKey, createdId) : null;
    if (createdId && !completion?.adopted) return;
    setProjection(next);
    if (!completion?.adopted || !createdId) return;
    currentSelection.current = completion.selection;
    setSelected(completion.selection);
    const query = new URLSearchParams(search.toString());
    query.set("tab", "work-orders");
    query.set("workOrder", createdId);
    router.replace(`/jobs/${jobId}?${query}`, {scroll: false});
  }
  const missing = selected?.id && !projection.rows.some((row) => row.id === selected.id);
  const jobEdges = projection.dependencies.some((edge) => edge.dependent.jobId === jobId && edge.dependent.workOrderId === null);
  const jobWarnings = selectWorkOrderDependencyWarnings(projection.dependencyWarnings, {jobId, workOrderId: null}).length > 0;
  return <section data-testid="job-work-orders-panel" aria-label="Arbetsorder" className="flex min-w-0 flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-zinc-900">Arbetsorder</h2>
      {projection.canEditWorkOrders && <button type="button" className="min-h-11 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" onClick={() => select(null, true)}>Ny arbetsorder</button>}
    </div>
    {projection.rows.length === 0 ? <p className="text-sm text-zinc-600">Inga arbetsorder ännu.</p> : <ul className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
      {projection.rows.map((row) => <li key={row.id} data-testid={`work-order-${row.id}`} className="min-w-0 rounded-md border border-zinc-200 p-3">
        <button type="button" aria-pressed={selected?.id === row.id} className="min-h-11 w-full break-words rounded-md text-left font-medium text-blue-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" onClick={() => select(row.id)}>{row.title}</button>
        <p className="mt-1 text-sm text-zinc-800">{WORK_ORDER_STATUS_LABELS[row.status]}</p>
        <p className="mt-1 break-words text-sm text-zinc-600">{row.assignees.map((person) => person.label).join(", ") || "Ingen tilldelad"}</p>
        <p className="mt-1 text-sm text-zinc-600">{row.plannedStartDate ?? "Okänd start"} – {row.plannedEndDate ?? "Okänt slut"}</p>
      </li>)}
    </ul>}
    {selected && <>
      <button type="button" className="min-h-11 self-start rounded-md px-3 text-sm text-blue-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" onClick={() => select(null)}>Stäng arbetsorder</button>
      {missing ? <p role="alert" className="text-sm text-red-800">Arbetsordern kunde inte öppnas. Välj en aktuell arbetsorder.</p>
        : <WorkOrderPane key={selected.key} jobId={jobId} workOrderId={selected.id} projection={projection} filesPanel={selected.id ? filesPanels[selected.id] : undefined} onReceive={(next, createdId) => receive(next, createdId, selected.key)} onDirtyChange={rememberDirty} />}
    </>}
    {(projection.canEditJobDependencies || jobEdges || jobWarnings) && <WorkOrderPane jobId={jobId} workOrderId={null} projection={projection} onReceive={receive} jobDependenciesOnly />}
  </section>;
}

