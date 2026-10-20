"use client";

import {useRef, useState, type KeyboardEvent, type ReactNode} from "react";
import {useSearchParams} from "next/navigation";
import {jobWorkspaceHref, selectJobWorkspaceTab, type JobWorkspaceTab, type JobWorkspaceTabDescriptor} from "@/features/jobs/job-workspace-domain";
import {JOB_STATUS_LABELS, type JobStatus} from "@/features/jobs/types";
import type {AssignmentLabel, JobWorkspaceHeader} from "@/server/read-models/job-workspace";
const control = "min-h-11 rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";
function assignmentText(value: AssignmentLabel): string {
  return value.state === "named" ? value.label! : value.state === "unassigned" ? "Ingen tilldelad"
    : value.state === "unavailable" ? "Uppgiften kunde inte hämtas" : "Tilldelad – namn inte tillgängligt";
}
/** URL selection changes visibility only: authorized panel islands keep their unsent state. */
export function JobWorkspaceShell({header, tabs, panels, actions, canBook}: {
  header: JobWorkspaceHeader; tabs: readonly JobWorkspaceTabDescriptor[];
  panels: Partial<Record<JobWorkspaceTab, ReactNode>>; actions?: ReactNode; canBook: boolean;
}) {
  const search = useSearchParams();
  const selected = selectJobWorkspaceTab({availableTabs: tabs.map(tab => tab.id), tab: search.get("tab"), workOrder: search.get("workOrder")});
  const [more, setMore] = useState(false);
  const tabRefs = useRef<Partial<Record<JobWorkspaceTab, HTMLButtonElement | null>>>({});
  const priority = tabs.slice(0, 3).map(tab => tab.id);
  function choose(id: JobWorkspaceTab) {
    window.history.pushState(null, "", jobWorkspaceHref({jobId: header.id, tab: id, query: new URLSearchParams(search.toString())}));
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, id: JobWorkspaceTab) {
    const index = tabs.findIndex(tab => tab.id === id);
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
      : event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : null;
    if (next === null) return;
    event.preventDefault();
    const target = tabs[next].id;
    // Overflow opens before focusing its existing tab; no duplicate accessible tab set.
    if (!priority.includes(target)) { setMore(true); requestAnimationFrame(() => tabRefs.current[target]?.focus()); }
    else tabRefs.current[target]?.focus();
  }
  const overflow = more;
  return <section data-testid="job-workspace" className="flex min-w-0 flex-col gap-4 p-4 pb-28 sm:p-6 sm:pb-6">
    <header data-testid="job-workspace-header" className="sticky top-0 z-10 space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 id="job-detail-heading" className="min-w-0 flex-1 break-words text-2xl font-semibold text-zinc-900">{header.title ?? header.customer ?? "Jobb"}</h1>
        <span data-testid="job-workspace-type" className="rounded-md border border-zinc-300 px-2 py-1 text-sm">{header.type === "projekt" ? "Projekt" : "Order"}</span>
        <span data-testid="job-status" className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-sm font-medium text-zinc-800">{JOB_STATUS_LABELS[header.status as JobStatus] ?? "Okänd status"}</span>
      </div>
      <dl className="grid min-w-0 grid-cols-2 gap-2 text-sm lg:grid-cols-3">
        {([["Kund", "job-customer", header.customer], ["Anläggning", "job-site", header.site], ["Kontakt", "job-contact", header.contact]] as const).map(([label, id, value]) => <div key={id} className="min-w-0"><dt className="text-zinc-600">{label}</dt><dd data-testid={id} className="break-words font-medium text-zinc-900">{value ?? "Saknas"}</dd></div>)}
        <div className="min-w-0"><dt className="text-zinc-600">Projektledare</dt><dd data-testid="job-responsible-pl" data-state={header.responsibleProjectManager.state} className="break-words">{assignmentText(header.responsibleProjectManager)}</dd></div>
        <div className="min-w-0"><dt className="text-zinc-600">Arbetsledare</dt><dd data-testid="job-lead" data-state={header.lead.state} className="break-words">{assignmentText(header.lead)}</dd></div>
        <div><dt className="text-zinc-600">Planerat</dt><dd data-testid="job-planned-dates">{header.plannedStartDate ?? "Okänd start"} – {header.plannedEndDate ?? "Okänt slut"}</dd></div>
      </dl>
      {(canBook || actions) && <div className="flex flex-wrap gap-3">{canBook && <button type="button" className={`${control} border border-blue-700 text-blue-700`} onClick={() => {
        choose("schedule");
        requestAnimationFrame(() => { document.querySelector<HTMLButtonElement>('[data-testid="booking-entry-job"]')?.click(); });
      }}>Boka</button>}{actions}</div>}
    </header>
    <nav aria-label="Jobbets vyer" className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white p-2 sm:static sm:rounded-lg sm:border sm:p-2">
      <div role="tablist" aria-label="Jobbets vyer" className="flex flex-wrap gap-1">
        {tabs.map(tab => <button key={tab.id} type="button" role="tab" id={`job-tab-${tab.id}`} aria-controls={`job-panel-${tab.id}`} aria-selected={selected === tab.id}
          tabIndex={selected === tab.id ? 0 : -1} ref={element => {tabRefs.current[tab.id] = element;}}
          onClick={() => choose(tab.id)} onKeyDown={event => keyboard(event, tab.id)}
          className={`${control} ${selected === tab.id ? "bg-blue-700 text-white" : "text-zinc-800 hover:bg-zinc-100"} ${!priority.includes(tab.id) && !overflow && selected !== tab.id ? "hidden sm:inline-flex" : "inline-flex"}`}>
          {tab.label}
        </button>)}
        {tabs.length > 3 && <button type="button" aria-expanded={overflow} aria-label="Mer" onClick={() => setMore(!overflow)} className={`${control} text-blue-700 sm:hidden`}>Mer</button>}
      </div>
    </nav>
    {tabs.map(tab => <div key={tab.id} id={`job-panel-${tab.id}`} role="tabpanel" aria-labelledby={`job-tab-${tab.id}`} tabIndex={0}
      hidden={selected !== tab.id} className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">{panels[tab.id]}</div>)}
  </section>;
}
