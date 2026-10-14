"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SchedulingReadInput, SchedulingReadResult, SchedulingReadData, SchedulingView } from "@/features/scheduling/view-types";
import { defaultSchedulingInput, restoreSchedulingPreferences, saveSchedulingPreferences, reconcileSchedulingPreferences } from "@/features/scheduling/view-preferences";
import { projectScheduling, normalizeSlotSelection, EMPTY_SCHEDULING_FILTERS } from "@/features/scheduling/view-model";
import { stockholmLocalToUtc } from "@/features/scheduling/time-zone";
import type { BookingFacts } from "@/features/resources/booking-types";
import { BookingEditor } from "../resources/BookingEditor";
import { bookingSummaryDraft } from "../resources/BookingEntry";
import { SchedulingToolbar } from "./SchedulingToolbar";
import { SchemaView, type SlotSelection } from "./SchemaView";
import { ResourcesView } from "./ResourcesView";
import { TeamView } from "./TeamView";
import { CapacityView } from "./CapacityView";
import { PersonalCalendarView } from "./PersonalCalendarView";
import { IntervalSelectionDialog } from "./IntervalSelectionDialog";
import type { BookingProposal } from "./BookingBlock";

const eligibleFor = (data: SchedulingReadData) => ({
  personIds: data.roster?.map(p => p.id) ?? [],
  workRoleIds: data.workRoles?.map(p => p.id) ?? [],
  jobIds: data.options?.jobs.map(p => p.id) ?? [],
  customerIds: data.options?.customers.map(p => p.id) ?? [],
});

export function SchedulingWorkspace({ initial, initialInput, readAction }: {
  readonly initial: SchedulingReadResult;
  readonly initialInput: SchedulingReadInput;
  readonly readAction: (input: SchedulingReadInput) => Promise<SchedulingReadResult>;
}) {
  const [input, setInput] = useState(initialInput), [result, setResult] = useState(initial);
  const [loading, setLoading] = useState(false), [reset, setReset] = useState(false), [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ draft: BookingFacts; bookingId?: string } | null>(null);
  const [interval, setInterval] = useState<SlotSelection | null>(null);
  const sequence = useRef(0), restored = useRef(false), invoker = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<{ element: HTMLElement; testId: string | null; start: string | null; person: string | null; booking: string | null; row: string | null; text: string; tag: string } | null>(null);
  const workspace = useRef<HTMLElement | null>(null);
  const identity = useRef({ actorId: initial.data.actorId, tenantId: initial.data.tenantId });
  const data = result.data;
  const scope = useCallback((view: SchedulingView) => ({ actorId: data.actorId, tenantId: data.tenantId, view }), [data.actorId, data.tenantId]);
  const eligible = useMemo(() => eligibleFor(data), [data]);

  const read = useCallback(async (requested: SchedulingReadInput) => {
    const ticket = ++sequence.current;
    setLoading(true); setError(null);
    try {
      let current = requested;
      let value = await readAction(current);
      if (ticket !== sequence.current) return;
      if (!value.data.error && value.data.canView) {
        const identityChanged = value.data.actorId !== identity.current.actorId || value.data.tenantId !== identity.current.tenantId;
        const currentEligible = eligibleFor(value.data);
        const view = value.data.canManage ? current.view : "personal";
        const nextScope = { actorId: value.data.actorId, tenantId: value.data.tenantId, view };
        let checked = reconcileSchedulingPreferences(current, currentEligible);
        if (!value.data.canManage) checked = { value: defaultSchedulingInput("personal", current.date), reset: current.view !== "personal" || Object.values(current.filters).some(v => Array.isArray(v) && v.length > 0) };
        if (identityChanged) {
          checked = { value: defaultSchedulingInput(view, current.date), reset: true };
          try { checked.value = restoreSchedulingPreferences(nextScope, window.localStorage, currentEligible, current.date).value; } catch { /* Safe defaults remain usable. */ }
          setEditing(null); setInterval(null);
        }
        identity.current = { actorId: value.data.actorId, tenantId: value.data.tenantId };
        if (checked.reset || identityChanged) {
          current = checked.value; setInput(current); setReset(true);
          try { saveSchedulingPreferences({ ...nextScope, view: current.view }, current, window.localStorage); } catch { /* Storage is optional. */ }
          // Identity changes may restore a different period. Read that period before publication.
          value = await readAction(current);
          if (ticket !== sequence.current) return;
        }
      }
      setResult(value);
    } catch { if (ticket === sequence.current) setError("Planeringen kunde inte läsas. Försök igen."); }
    finally { if (ticket === sequence.current) setLoading(false); }
  }, [readAction]);

  function change(next: SchedulingReadInput) {
    setInput(next);
    try { saveSchedulingPreferences(scope(next.view), next, window.localStorage); } catch { /* Storage is optional. */ }
    void read(next);
  }
  useEffect(() => {
    if (restored.current) return;
    const frame = requestAnimationFrame(() => {
      restored.current = true;
      let next = initialInput;
      try {
        const value = restoreSchedulingPreferences(scope(initialInput.view), window.localStorage, eligible, initialInput.date);
        next = value.value; setReset(value.reset);
      } catch { /* Storage denial keeps connected defaults. */ }
      setInput(next); void read(next);
    });
    return () => cancelAnimationFrame(frame);
  }, [eligible, initialInput, read, scope]);

  // Refresh replaces calendar hosts. Restore to the corresponding current control
  // only after the read and React commit have settled, rather than the detached node.
  useEffect(() => {
    if (loading || editing || interval || !pendingFocus.current) return;
    const frame = requestAnimationFrame(() => {
      const target = pendingFocus.current;
      if (!target || !workspace.current) return;
      const candidates = [...workspace.current.querySelectorAll<HTMLElement>(target.tag)];
      const current = target.element.isConnected ? target.element : candidates.find(element =>
        element.getAttribute("data-testid") === target.testId &&
        element.getAttribute("data-start") === target.start &&
        element.getAttribute("data-person") === target.person &&
        element.closest('[data-testid^="scheduling-booking-"]')?.getAttribute("data-testid") === (target.booking ?? undefined) &&
        element.closest('[data-testid^="resource-row-"]')?.getAttribute("data-testid") === (target.row ?? undefined) &&
        (target.testId !== null || element.textContent === target.text));
      if (current) { current.focus(); pendingFocus.current = null; }
      else workspace.current.querySelector<HTMLElement>('[role="alert"] button')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [loading, result, editing, interval]);

  function restoreAfterRefresh() {
    const element = invoker.current;
    if (!element) return;
    pendingFocus.current = { element, testId: element.getAttribute("data-testid"), start: element.getAttribute("data-start"),
      person: element.getAttribute("data-person"), booking: element.closest('[data-testid^="scheduling-booking-"]')?.getAttribute("data-testid") ?? null,
      row: element.closest('[data-testid^="resource-row-"]')?.getAttribute("data-testid") ?? null,
      text: element.textContent ?? "", tag: element.tagName.toLowerCase() };
  }

  function select(slot: SlotSelection, preserveFocus = false) {
    if (!preserveFocus) invoker.current = document.activeElement as HTMLElement;
    setEditing({ draft: { startsAt: slot.startsAt, endsAt: slot.endsAt, allDay: false, workRoleId: null,
      jobId: null, customerId: null, facilityId: null, contactId: null, description: "", status: "planned",
      assigneeIds: slot.personId ? [slot.personId] : [], seriesId: null, occurrenceIndex: null, isException: false } });
  }
  function edit(proposal: BookingProposal) {
    invoker.current = document.activeElement as HTMLElement;
    setEditing({ bookingId: proposal.booking.id, draft: { ...bookingSummaryDraft(proposal.booking),
      ...(proposal.startsAt ? { startsAt: proposal.startsAt } : {}), ...(proposal.endsAt ? { endsAt: proposal.endsAt } : {}),
      ...(proposal.assigneeIds ? { assigneeIds: proposal.assigneeIds } : {}) } });
  }
  const projection = projectScheduling(data.bookings, input, data.ownSelfPersonIds);
  const props = { input, data, bookings: input.view === "personal" ? projection.personal : projection.schema,
    onSelect: select, onEdit: edit, onDay: (date: string) => change({ ...input, mode: "day", date }) };
  const failure = error ?? data.error;
  const newSlot = () => { const start = stockholmLocalToUtc(`${input.date}T08:00:00`); return normalizeSlotSelection(start, start); };
  return <main ref={workspace} className="min-w-0 space-y-4 p-3 sm:p-6" data-testid="scheduling-workspace">
    <h1 className="text-xl font-semibold">Planering</h1>
    <SchedulingToolbar input={input} data={loading || failure ? { ...data, openConflictCount: undefined } : data} onChange={change}
      onCreate={() => select(newSlot())}
      onInterval={() => { invoker.current = document.activeElement as HTMLElement; setInterval(newSlot()); }}
      onView={view => {
        let next = defaultSchedulingInput(view, input.date);
        try { const saved = restoreSchedulingPreferences(scope(view), window.localStorage, eligible, input.date); next = saved.value; setReset(saved.reset); } catch { /* Storage is optional. */ }
        change(next);
      }} />
    {reset && <p role="status" className="text-sm">Sparade inställningar återställdes eftersom de inte längre är tillgängliga.</p>}
    {loading ? <p role="status">Läser planering…</p> : failure ? <p role="alert">{failure}<button className="min-h-11 px-3 underline" onClick={() => void read(input)}>Försök igen</button></p> : !data.canView ? <p>Du saknar behörighet att visa planeringen.</p> : <>
      {input.view === "schema" && <SchemaView {...props} />}
      {input.view === "resources" && <ResourcesView {...props} />}
      {input.view === "team" && <TeamView {...props} />}
      {input.view === "capacity" && <CapacityView input={input} data={data} onRetry={() => void read(input)} onDrill={cell => change({ view: "resources", mode: "day", date: cell.date, filters: { ...EMPTY_SCHEDULING_FILTERS, personIds: [cell.personId] } })} />}
      {input.view === "personal" && <PersonalCalendarView {...props} />}
      {!projection.uniqueCount && input.view !== "capacity" && <p>Inga bokningar matchar perioden och filtren.</p>}
    </>}
    {interval && data.canManage && <IntervalSelectionDialog initial={interval} data={data}
      onClose={() => { setInterval(null); invoker.current?.focus(); }} onSelect={slot => { setInterval(null); select(slot, true); }} />}
    {editing && data.canManage && data.options && <BookingEditor key={`${editing.bookingId ?? "new"}:${editing.draft.startsAt}:${editing.draft.endsAt}`} open draft={editing.draft} bookingId={editing.bookingId} options={data.options}
      onClose={() => { restoreAfterRefresh(); setEditing(null); void read(input); }} />}
  </main>;
}

