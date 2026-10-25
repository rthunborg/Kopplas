"use client";

import { useEffect, useRef, useState } from "react";
import { deriveJobBookingInterval, jobSchedulingContext, type JobSchedulingHint } from "@/features/jobs/job-scheduling-consumers";
import type { BookingSemanticsDisplay } from "@/server/bookings/job-semantics";
import { parseUtcInstant } from "@/features/scheduling/time-zone";
import { Dialog } from "@/components/crm/Dialog";
import type { BookingFacts } from "@/features/resources/booking-types";
import type { BookingEditorOptions } from "@/features/resources/booking-action-state";
import { previewBookingAction, saveBookingAction, reloadBookingEditorOptionsAction } from "@/features/resources/booking-actions";
import { prepareBookingTimes, retainUnresolvedBookingAttempt, recurrenceRuleFromEditor, followingBookingDraft, recurrenceEndpointWithClock, type BookingEditProposal } from "@/features/resources/booking-editor-input";
import { bookingActionFitsTransport } from "@/features/resources/booking-transport";
import { BookingConflictPanel, advanceBookingPreview, type BookingPreviewDisplay } from "./BookingConflictPanel";
import { BookingRecurrenceFields, type RecurrenceFieldValues } from "./BookingRecurrenceFields";
import { RecurrencePreview, type RecurrencePreviewItem } from "./RecurrencePreview";
import { previewBookingSeriesAction, saveBookingSeriesAction, readBookingSeriesAction } from "@/features/resources/booking-series-actions";
import { canSaveSeries } from "@/features/resources/booking-series-state";

const fieldClass = "min-h-12 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";
const buttonClass = "min-h-12 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";
export type BookingPrefill = {readonly personId?: string; readonly startsAt?: string; readonly endsAt?: string};
export function bookingLocalInput(value: string): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).formatToParts(new Date(value)).map(p => [p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
export function BookingEditor({open, onClose, draft, options: initialOptions, bookingId, seriesId, prefill, initialPreview, proposal, resolverAdapter}: {
  readonly open: boolean; readonly onClose: () => void; readonly draft: BookingFacts;
  readonly options: BookingEditorOptions; readonly bookingId?: string; readonly seriesId?: string | null; readonly prefill?: BookingPrefill;
  readonly initialPreview?: BookingPreviewDisplay;
  readonly proposal?: BookingEditProposal;
  readonly resolverAdapter?: {preview:typeof previewBookingAction;save:typeof saveBookingAction;previewSeries:typeof previewBookingSeriesAction;saveSeries:typeof saveBookingSeriesAction;description?:string;commonSeries?:boolean};
}) {
  const [options, setOptions] = useState(initialOptions);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceFieldValues>({enabled:false,preset:"daily",endMode:"count",count:3,weekdays:[1]});
  const [scope, setScope] = useState<"one" | "following" | null>(seriesId ? null : "one");
  const [chosenScope,setChosenScope]=useState<"one"|"following">("one");
  const [seriesSource, setSeriesSource] = useState<Extract<Awaited<ReturnType<typeof readBookingSeriesAction>>, {status:"success"}>["series"] | null>(null);
  const [seriesItems, setSeriesItems] = useState<readonly RecurrencePreviewItem[]>([]);
  const [seriesTotal, setSeriesTotal] = useState(0);
  const [seriesLoadRetry, setSeriesLoadRetry] = useState(0);
  const [seriesMetadataLoading,setSeriesMetadataLoading]=useState(Boolean(bookingId && seriesId));
  const [facts, setFacts] = useState<BookingFacts>(() => ({...draft, startsAt: prefill?.startsAt ?? draft.startsAt, endsAt: prefill?.endsAt ?? draft.endsAt, assigneeIds: prefill?.personId ? [prefill.personId] : draft.assigneeIds}));
  const [start, setStart] = useState(() => bookingLocalInput(prefill?.startsAt ?? draft.startsAt));
  const [end, setEnd] = useState(() => bookingLocalInput(prefill?.endsAt ?? draft.endsAt));
  const [retainedClocks,setRetainedClocks]=useState<{start:string|null;end:string|null}>({start:null,end:null});
  const [startChanged, setStartChanged] = useState(false);
  const [endChanged, setEndChanged] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [pending, setPending] = useState(false);
  const [unresolved, setUnresolved] = useState(false);
  const attempted = useRef<Parameters<typeof saveBookingAction>[0] | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [preview, setPreview] = useState<BookingPreviewDisplay>(initialPreview ?? {requestId: "initial", status: "pending", warnings: [], availabilityLabel: "Okänd"});
  const [retry, setRetry] = useState(0);
  const [semantics,setSemantics]=useState<BookingSemanticsDisplay|null>(null);
  const [availability, setAvailability] = useState<readonly {personId: string; available: boolean}[]>([]);
  // Existing assignments remain visible/editable even if the person is no longer
  // offered for new bookings. SQL decides whether a fresh assignment is valid.
  const people = [...options.people, ...(bookingId ? facts.assigneeIds.filter(id => !options.people.some(person => person.id === id))
    .map(id => ({id, label: `Resursperson ${id.slice(0,8)} · nuvarande tilldelning`, defaultWorkRoleId: null, workRoleIds: [] as readonly string[]})) : [])];
  const receipt = useRef<string | null>(null);
  const sequence = useRef(0);
  const identity = useRef<{commandId: string; proposedBookingId: string} | null>(null);
  const proposedCreateId = useRef<string | null>(null);
  const keepEditing = useRef<HTMLButtonElement>(null);
  const initialField = useRef<HTMLSelectElement>(null);
  const discardReturnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!bookingId || !seriesId || (scope !== null && !(scope === "following" && seriesLoadRetry > 0))) return;
    let current = true;
    readBookingSeriesAction(bookingId).then(result => {if (!current) return; if (result.status === "success") setSeriesSource(result.series); else {setSeriesSource(null);setError(result.message);}}).catch(() => {if(current){setSeriesSource(null);setError("Serien kunde inte läsas. Försök igen.");}}).finally(()=>{if(current)setSeriesMetadataLoading(false);});
    return () => {current=false;};
  }, [bookingId,seriesId,scope,seriesLoadRetry]);
  const closeRef = useRef(onClose);
  const busyRef = useRef(pending);
  const dirtyRef = useRef(dirty && !success);
  useEffect(() => {closeRef.current = onClose; busyRef.current = pending || unresolved; dirtyRef.current = dirty && !success;}, [onClose, pending, unresolved, dirty, success]);
  useEffect(() => {
    if (!discard) return;
    discardReturnFocus.current = document.activeElement as HTMLElement | null;
    keepEditing.current?.focus();
    return () => {discardReturnFocus.current?.focus();};
  }, [discard]);
  function requestClose() { if (pending || unresolved) return; if (dirty && !success) setDiscard(true); else onClose(); }
  function change(patch: Partial<BookingFacts>) {
    if (pending || attempted.current) return;
    sequence.current += 1; receipt.current = null; setReviewed(false); setSelected([]); setReason("");
    setPreview(value => advanceBookingPreview({currentRequestId: value.requestId,preview: value,reviewed}, {kind: "candidateChanged",requestId: String(sequence.current)}).preview);
    setAvailability([]); setSemantics(null);
    setFacts(value => ({...value,...patch})); setDirty(true); setError(null);
    identity.current = null;
  }
  const invalidFollowingStart = scope === "following" && !!seriesSource && start.slice(0,10) < seriesSource.nominalDate;
  function defaultInterval(jobId: string | null, localStart=start, currentOptions=options, userStart=false, checkedHint?:JobSchedulingHint|null) {
    if(bookingId || seriesId || recurrence.enabled || resolverAdapter?.commonSeries || pending || endChanged || prefill?.endsAt || unresolved || attempted.current || facts.allDay) return {};
    try {
      // Untouched fold starts retain the exact original instant. Only actual input edits reparse wall time.
      const effective=prepareBookingTimes({original:facts,startChanged:startChanged || userStart,endChanged:false,allDay:false,startsAtLocal:localStart,endsAtLocal:end});
      const hint=checkedHint === undefined ? currentOptions.jobs.find(job=>job.id === jobId)?.schedulingHint ?? null:checkedHint;
      const interval=deriveJobBookingInterval({mode:"create",interval:{startsAt:effective.startsAt,endsAt:null,provenance:"derived",startProvenance:startChanged || userStart ? "user":prefill?.startsAt ? "explicit":"derived"},job:hint});
      setStart(bookingLocalInput(interval.startsAt));setEnd(bookingLocalInput(interval.endsAt!));
      return {startsAt:interval.startsAt,endsAt:interval.endsAt!};
    } catch {return {};}
  }
  function candidate() {
    if (scope === "following" && !seriesSource) throw new Error("Current series metadata required");
    if (invalidFollowingStart) throw new Error("Startdatum får inte vara före det valda nominella tillfället.");
    proposedCreateId.current ??= crypto.randomUUID();
    identity.current ??= {commandId: crypto.randomUUID(), proposedBookingId: proposedCreateId.current};
    const localStart=recurrenceEndpointWithClock(start,retainedClocks.start),localEnd=recurrenceEndpointWithClock(end,retainedClocks.end);
    const template = {...facts, ...prepareBookingTimes({original: facts, startChanged, endChanged, allDay: facts.allDay, startsAtLocal: localStart, endsAtLocal: localEnd})};
    if (recurrence.enabled) return {commandId:identity.current.commandId,seriesId:identity.current.proposedBookingId,
      sourceSeriesId:scope === "following" ? seriesSource?.id : null, expectedVersion:scope === "following" ? seriesSource?.version : null,
      pivotOccurrenceId:scope === "following" ? bookingId : null, template,
      rule:recurrenceRuleFromEditor({...recurrence,start:localStart,end:localEnd,allDay:facts.allDay})};
    return {...template, commandId: identity.current.commandId,
      ...(bookingId ? {bookingId} : {proposedBookingId: identity.current.proposedBookingId})};
  }
  function deliverPreview(current: number, value: BookingPreviewDisplay) {
    setPreview(previous => advanceBookingPreview({currentRequestId: String(sequence.current), preview: previous, reviewed: false},
      {kind: "response", requestId: String(current), preview: value}).preview);
  }
  function refreshStaleSeries() {
    sequence.current += 1;receipt.current=null;setReviewed(false);setSelected([]);setReason("");setAvailability([]);
    setSeriesItems([]);setSeriesTotal(0);setSeriesSource(null);setSeriesMetadataLoading(true);identity.current=null;
    setPreview({requestId:"stale",status:"pending",warnings:[],availabilityLabel:"Okänd"});setSeriesLoadRetry(n=>n+1);
  }
  function retryPreview() {
    if(pending || unresolved)return;
    // A concurrent split can invalidate ownership between the two metadata reads.
    // Explicit retry reloads it even when the previous denial was not PREVIEW_STALE.
    if(scope === "following")refreshStaleSeries();else setRetry(n=>n+1);
  }
  useEffect(() => {
    if (!open || success || unresolved || scope === null || (scope === "following" && (!seriesSource || seriesMetadataLoading))) return;
    const current = ++sequence.current;
    receipt.current = null;
    const timer = window.setTimeout(async () => {
      try {
        if (recurrence.enabled) {
          const result = await (resolverAdapter?.previewSeries ?? previewBookingSeriesAction)(candidate());
          if (sequence.current !== current) return;
          if(result.status === "error") {if(result.code === "PREVIEW_STALE" && scope === "following"){refreshStaleSeries();return;}setSeriesItems([]); setSeriesTotal(0); deliverPreview(current,{requestId:String(current),status:"error",warnings:[],availabilityLabel:"Okänd",errorMessage:result.message}); return;}
          receipt.current=result.preview.receipt;
          setSeriesTotal(result.preview.total);
          setSeriesItems(result.preview.occurrences.map(row => ({...row,conflictCount:result.preview.warnings.filter(w=>w.bookingIds.includes(row.id)).length})));
          deliverPreview(current,{requestId:String(current),status:"ready",availabilityLabel:result.preview.warnings.length ? "Upptagen":"Tillgänglig",
            warnings:result.preview.warnings.map(w=>({...w,ruleLabel:({double_booking:"Dubbelbokning",over_capacity:"Över kapacitet",outside_work_hours:"Utanför arbetstid",outside_access_window:"Utanför tillträdestid",competence_missing:"Kompetens saknas"} as Record<string,string>)[w.rule]??"Varning",
              personLabel:people.find(p=>p.id===w.personId)?.label??"Resursperson",bookingLabels:w.bookingIds.map(id=>`Bokning ${id}`)}))});
          return;
        }
        const result = await (resolverAdapter?.preview ?? previewBookingAction)(candidate());
        if (sequence.current !== current) return;
        if (result.status === "error") { deliverPreview(current, {requestId: String(current),status: "error", warnings: [], availabilityLabel: "Okänd", errorMessage: result.message}); return; }
        receipt.current = result.preview.receipt;
        setAvailability(result.preview.availability);
        if(result.preview.semantics) {
          setSemantics(result.preview.semantics);
          const hint=result.preview.semantics.hint;
          setOptions(value=>({...value,jobs:value.jobs.map(job=>job.id === facts.jobId ? {...job,schedulingHint:hint ?? undefined}:job)}));
          if(!bookingId && !seriesId && !recurrence.enabled && !resolverAdapter?.commonSeries && !pending && !endChanged && !prefill?.endsAt && !attempted.current && !facts.allDay) {
            const effective=prepareBookingTimes({original:facts,startChanged,endChanged,allDay:facts.allDay,startsAtLocal:recurrenceEndpointWithClock(start,retainedClocks.start),endsAtLocal:recurrenceEndpointWithClock(end,retainedClocks.end)});
            const derived=deriveJobBookingInterval({mode:"create",interval:{startsAt:effective.startsAt,endsAt:null,provenance:"derived",startProvenance:startChanged ? "user":prefill?.startsAt ? "explicit":"derived"},job:hint});
            if(parseUtcInstant(derived.startsAt) !== parseUtcInstant(effective.startsAt) || parseUtcInstant(derived.endsAt!) !== parseUtcInstant(effective.endsAt)) {
              setStart(bookingLocalInput(derived.startsAt));setEnd(bookingLocalInput(derived.endsAt!));change({startsAt:derived.startsAt,endsAt:derived.endsAt!});return;
            }
          }
        }
        deliverPreview(current, {requestId: String(current),status: "ready", warnings: result.preview.warnings, availabilityLabel: result.preview.availability.some(person => !person.available) ? "Upptagen" : "Tillgänglig"});
      } catch { if (sequence.current === current) deliverPreview(current, {requestId: String(current),status: "error",warnings: [],availabilityLabel: "Okänd",errorMessage: invalidFollowingStart ? "Startdatum får inte vara före det valda nominella tillfället." : "Konfliktkontrollen kunde inte slutföras."}); }
    }, 250);
    return () => {window.clearTimeout(timer); sequence.current += 1;};
    // Each candidate change gets a new request identity; receipt stays in memory only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facts, start, end, startChanged, endChanged, retry, success, unresolved,recurrence,scope,seriesSource,seriesMetadataLoading]);
  useEffect(() => {
    if (!open) return;
    const marker = crypto.randomUUID();
    history.pushState({...history.state, bookingEditor: marker}, "");
    const back = () => { history.pushState({...history.state, bookingEditor: marker}, ""); if (busyRef.current) return; if (dirtyRef.current) setDiscard(true); else closeRef.current(); };
    const unload = (event: BeforeUnloadEvent) => {if (dirtyRef.current || busyRef.current) {event.preventDefault(); event.returnValue = "";}};
    window.addEventListener("popstate", back); window.addEventListener("beforeunload", unload);
    return () => {window.removeEventListener("popstate", back); window.removeEventListener("beforeunload", unload); if (history.state?.bookingEditor === marker) history.back();};
  }, [open]);
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (pending || success || discard || (!attempted.current && (preview.status !== "ready" || !receipt.current))) return;
    if (!attempted.current && preview.warnings.length && (!reviewed || !reason.trim())) {setError("Granska aktuella varningar och ange en orsak."); return;}
    if (!attempted.current && !seriesSaveAllowed()) {setError("Förhandsgranska den aktuella serien igen innan du sparar.");return;}
    const wasUnresolved = unresolved;
    let input: unknown;
    try {input = attempted.current ?? {...candidate(), editorReview: {receipt: receipt.current, decision: {acknowledged: preview.warnings.length > 0 && reviewed, reviewedLogicalIds: preview.warnings.map(w => w.logicalId), selectedLogicalIds: selected, reason: preview.warnings.length ? reason.trim() : ""}}};}
    catch {setError("Kontrollera bokningens tider innan du försöker igen."); return;}
    if (!bookingActionFitsTransport(input)) {setError("Granskningen är för stor för att skickas. Inget sparförsök har gjorts."); return;}
    setPending(true); setError(null);
    try {
      attempted.current = input;
      const result = recurrence.enabled ? await (resolverAdapter?.saveSeries ?? saveBookingSeriesAction)(input) : await (resolverAdapter?.save ?? saveBookingAction)(input);
      if (result.status === "success") {attempted.current = null; setUnresolved(false); setSuccess(true); setDirty(false);} else {
        setError(result.message);
        if (retainUnresolvedBookingAttempt(result.code, wasUnresolved)) setUnresolved(true);
        else {attempted.current = null; setUnresolved(false);}
        if (result.code === "PREVIEW_STALE") {if(scope === "following")refreshStaleSeries();else{setReviewed(false); setSelected([]); setReason(""); receipt.current = null; setPreview({requestId: "stale",status: "pending",warnings: [],availabilityLabel: "Okänd"}); setRetry(n => n+1);}}
      }
    } catch {setUnresolved(true); setError("Bokningen kunde inte sparas. Behåll utkastet och försök igen.");} finally {setPending(false);}
  }
  function seriesSaveAllowed() { return !recurrence.enabled || canSaveSeries({candidateKey:preview.requestId,latestRequestId:sequence.current,
    seriesVersion:seriesSource?.version ?? 1,previewStatus:preview.status === "ready" ? "ready":preview.status === "error" ? "failed":"pending",
    preview:receipt.current?{requestId:Number(preview.requestId),candidateKey:preview.requestId,seriesVersion:seriesSource?.version ?? 1,receipt:receipt.current,warnings:preview.warnings.map(w=>w.logicalId)}:null,
    selected,reason,acknowledged:reviewed,reviewedLogicalIds:reviewed?preview.warnings.map(w=>w.logicalId):[],attempt:null,persistence:pending?"saving":unresolved?"unknown":"unsent"}); }
  async function retryOptions() {
    if (pending || unresolved || optionsLoading) return;
    const currentSequence=sequence.current;
    setOptionsLoading(true);
    try {
      const fresh = await reloadBookingEditorOptionsAction();
      if (fresh.error || !fresh.canManage) setOptions(value => ({...value,error: fresh.error ?? "Bokningsvalen kunde inte läsas. Försök igen."}));
      else {
        const durationPatch=sequence.current === currentSequence ? defaultInterval(facts.jobId,start,fresh):{}; setOptions(fresh); setFacts(value=>({...value,...durationPatch})); receipt.current = null; setReviewed(false); setSelected([]); setReason("");
        setPreview({requestId: "options",status: "pending",warnings: [],availabilityLabel: "Okänd"}); setRetry(n=>n+1);
      }
    } catch {setOptions(value => ({...value,error: "Bokningsvalen kunde inte läsas. Försök igen."}));}
    finally {setOptionsLoading(false);}
  }
  function connection(name: "jobId" | "customerId" | "facilityId" | "contactId", value: string) {
    if (name === "jobId") {
      const job = options.jobs.find(item => item.id === value);
      change(job ? {jobId: job.id,customerId: job.customerId,facilityId: job.facilityId,contactId: job.contactId,...defaultInterval(job.id)} : {jobId: null,...defaultInterval(null)});
    } else if (name === "customerId") {
      change({customerId: value || null,jobId: null,facilityId: null,contactId: null,...defaultInterval(null)});
    } else if (name === "facilityId") {
      const facility = options.facilities.find(item => item.id === value);
      const contact = options.contacts.find(item => item.id === facts.contactId);
      const customerId = facility?.customerId ?? facts.customerId;
      const compatibleContact = contact && contact.customerId === customerId && (!contact.facilityId || contact.facilityId === (value || null));
      change({facilityId: value || null,contactId: compatibleContact ? contact.id : null,jobId: null,...defaultInterval(null),...(facility ? {customerId: facility.customerId} : {})});
    } else {
      const contact = options.contacts.find(item => item.id === value);
      const currentCustomer = facts.customerId ?? options.facilities.find(item => item.id === facts.facilityId)?.customerId;
      change({contactId: value || null,jobId: null,...defaultInterval(null),...(contact ? {customerId: contact.customerId,
        facilityId: contact.facilityId ?? (contact.customerId === currentCustomer ? facts.facilityId : null)} : {})});
    }
  }
  const selectedHint=semantics?.jobId === facts.jobId ? semantics.hint : options.jobs.find(job=>job.id === facts.jobId)?.schedulingHint ?? null;
  const presence=selectedHint?.customerPresenceRequired ?? null;
  const planningContext = (() => {
    try {
      // Same candidate boundaries as preview/save, including untouched DST folds.
      const interval = prepareBookingTimes({original:facts,startChanged,endChanged,allDay:facts.allDay,startsAtLocal:recurrenceEndpointWithClock(start,retainedClocks.start),endsAtLocal:recurrenceEndpointWithClock(end,retainedClocks.end)});
      return jobSchedulingContext({selectedJobId:facts.jobId ?? "",jobs:selectedHint ? [selectedHint]:[],...interval});
    } catch { return null; } // Incomplete/invalid time inputs have no date advice yet.
  })();
  const desiredMiss=planningContext?.warnings.some(w=>w.code === "desired_date_missed");
  const latestBreach=planningContext?.warnings.some(w=>w.code === "latest_date_breached");
  const advisory=semantics?.jobId === facts.jobId ? semantics.advisory:null;
  const optional = (name: "jobId" | "customerId" | "facilityId" | "contactId", label: string, entries: readonly {id: string; label: string}[]) => <label className="space-y-1"><span className="text-sm font-medium">{label}</span><select name={name} disabled={resolverAdapter?.commonSeries} data-testid={`booking-${name.replace("Id", "")}`} value={facts[name] ?? ""} className={fieldClass} onChange={e => connection(name, e.target.value)}><option value="">Ingen koppling</option>{facts[name] && !entries.some(item => item.id === facts[name]) && <option value={facts[name]!} disabled>Nuvarande koppling (ej tillgänglig för nya val) · {facts[name]}</option>}{entries.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>;
  if (scope === null) return <Dialog open={open} onClose={onClose} title="Redigera återkommande bokning"><div data-testid="booking-series-scope-dialog" className="space-y-3"><p>Vilka tillfällen vill du ändra?</p>
    {error && <p role="alert">{error}<button type="button" className={buttonClass} onClick={()=>setSeriesLoadRetry(n=>n+1)}>Försök igen</button></p>}
    <fieldset className="space-y-3"><legend>Omfattning</legend>
      <label className="flex min-h-11 items-center gap-3"><input type="radio" name="booking-scope" checked={chosenScope==="one"} onChange={()=>setChosenScope("one")} />Endast detta tillfälle</label>
      <label className="flex min-h-11 items-center gap-3"><input type="radio" name="booking-scope" checked={chosenScope==="following"} disabled={!seriesSource} onChange={()=>setChosenScope("following")} />Detta och kommande</label>
    </fieldset>
    <button type="button" data-testid="booking-series-scope-confirm" className={buttonClass} disabled={chosenScope==="following"&&!seriesSource} onClick={()=>{
      if(chosenScope==="one"){setError(null);setScope("one");return;}
      if(!seriesSource)return;
      const r=seriesSource.rule; setRecurrence({enabled:true,preset:r.preset,endMode:r.count===undefined?"until":"count",count:r.count??3,untilDate:r.untilDate,weekdays:[...(r.weekdays??[1])]});
      const next=followingBookingDraft(seriesSource.template,r,seriesSource.nominalDate,proposal);
      setFacts(next.facts);setStart(next.start.slice(0,16));setEnd(next.end.slice(0,16));setRetainedClocks({start:next.start.slice(11),end:next.end.slice(11)});setStartChanged(true);setEndChanged(true);setError(null);setScope("following");
    }}>Fortsätt</button></div></Dialog>;
  return <Dialog open={open} onClose={requestClose} title={bookingId ? "Redigera bokning" : "Ny bokning"} busy={pending} variant="sheet" initialFocusRef={initialField}>
    <form onSubmit={save} data-testid="booking-editor" className="space-y-5" aria-busy={pending}>
      <div data-testid="booking-editor-sheet" className="space-y-5"><div data-testid="booking-editor-scroll-body" className="space-y-5">
      {success ? <p role="status" data-testid="booking-save-status" className="rounded-md bg-green-50 p-3 text-green-900">Sparad i systemet</p> : <>
      <p data-testid="booking-unsent" className="text-sm text-zinc-600">Utkast ej skickat</p>
      {resolverAdapter?.description && <p role="status">{resolverAdapter.description}</p>}
      {unresolved && <p role="status" data-testid="booking-unresolved-save">Sparresultatet är okänt. Försök igen med samma utkast innan du ändrar eller stänger bokningen.</p>}
      {options.error && <p role="alert" data-testid="booking-options-error">{options.error}</p>}
      <button type="button" data-testid="booking-options-retry" className={buttonClass} disabled={pending || unresolved || optionsLoading} onClick={retryOptions}>{optionsLoading ? "Läser bokningsval…" : options.error ? "Läs bokningsval igen" : "Uppdatera bokningsval"}</button>
      <fieldset disabled={pending || unresolved} className="space-y-4"><legend className="font-semibold">Tilldelade</legend>
      <label className="block space-y-1"><span className="text-sm">Filtrera arbetsroll</span><select ref={initialField} data-testid="booking-work-role-filter" className={fieldClass} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="">Alla arbetsroller</option>{options.workRoles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
      {people.filter(p => !roleFilter || p.defaultWorkRoleId === roleFilter || p.workRoleIds.includes(roleFilter) || facts.assigneeIds.includes(p.id)).map(p => <label key={p.id} className="flex min-h-11 items-center gap-3 text-sm"><input name="assigneeIds" type="checkbox" value={p.id} data-testid={`booking-assignee-option-${p.id}`} checked={facts.assigneeIds.includes(p.id)} onChange={e => change({assigneeIds: e.target.checked ? [...facts.assigneeIds,p.id] : facts.assigneeIds.filter(id => id !== p.id)})} /><span>{p.label} · {preview.status === "ready" && availability.find(a => a.personId === p.id) ? availability.find(a => a.personId === p.id)!.available ? "Tillgänglig" : "Upptagen" : "Okänd"}</span></label>)}
      <label className="block space-y-1"><span>Arbetsroll</span><select name="workRoleId" disabled={resolverAdapter?.commonSeries} data-testid="booking-work-role" className={fieldClass} value={facts.workRoleId ?? ""} onChange={e => change({workRoleId: e.target.value || null})}><option value="">Ingen arbetsroll</option>{facts.workRoleId && !options.workRoles.some(role => role.id === facts.workRoleId) && <option value={facts.workRoleId} disabled>Nuvarande arbetsroll (ej tillgänglig för nya val) · {facts.workRoleId}</option>}{options.workRoles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
      <label className="flex min-h-11 items-center gap-3"><input name="allDay" data-testid="booking-all-day" type="checkbox" checked={facts.allDay} onChange={e => {setRetainedClocks({start:null,end:null});if (!e.target.checked) {setStart(value => value.length === 10 ? `${value}T00:00` : value); setEnd(value => value.length === 10 ? `${value}T00:00` : value);} setStartChanged(true); setEndChanged(true); change({allDay: e.target.checked});}} />Heldag</label>
      <p className="text-xs text-zinc-600">Tid i Stockholm. För heldag är slutdatum den första dagen efter bokningen.</p>
      <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1"><span>Start</span><input name="startsAt" data-testid="booking-start" type={facts.allDay ? "date" : "datetime-local"} min={scope === "following" && seriesSource ? seriesSource.nominalDate + (facts.allDay ? "" : "T00:00") : undefined} className={fieldClass} value={facts.allDay ? start.slice(0,10) : start} onChange={e => {setStart(e.target.value);setRetainedClocks(value=>({...value,start:null})); setStartChanged(true); change(defaultInterval(facts.jobId,e.target.value,options,true));}} required /></label><label className="space-y-1"><span>Slut</span><input name="endsAt" data-testid="booking-end" type={facts.allDay ? "date" : "datetime-local"} className={fieldClass} value={facts.allDay ? end.slice(0,10) : end} onChange={e => {setEnd(e.target.value);setRetainedClocks(value=>({...value,end:null})); setEndChanged(true); change({});}} required /></label></div>
      <div className="grid gap-3 sm:grid-cols-2">{optional("jobId","Jobb",options.jobs)}{optional("customerId","Kund",options.customers)}{optional("facilityId","Anläggning",options.facilities.filter(f => !facts.customerId || f.customerId === facts.customerId))}{optional("contactId","Kontakt",options.contacts.filter(c => (!facts.customerId || c.customerId === facts.customerId) && (!facts.facilityId || !c.facilityId || c.facilityId === facts.facilityId)))}</div>
      {(!bookingId || scope === "following") && <BookingRecurrenceFields {...recurrence} disabled={pending || unresolved} onChange={patch=>{change({});setRecurrence(value=>({...value,...patch,...(scope === "following" ? {enabled:true}:{})}));}} />}
      {scope === "following" && <p className="text-sm text-zinc-600">Oförändrat antal behåller seriens ursprungliga slut. Ändrat antal räknas från det valda tillfället. Avvikelser och avbrutna tillfällen behålls.</p>}
      {scope === "following" && !seriesSource && !seriesMetadataLoading && <p role="alert">Serien kunde inte läsas. Behåll utkastet. <button type="button" className={buttonClass} onClick={retryPreview}>Försök igen</button></p>}
      {recurrence.enabled && <RecurrencePreview status={preview.status === "ready" ? "ready" : preview.status === "error" ? "failed":"pending"} items={seriesItems} total={seriesTotal} warningCount={preview.warnings.length} error={preview.errorMessage} candidateDescription={facts.description} onRetry={retryPreview} />}
      <div className="space-y-2 text-sm" aria-live="polite">
        <p data-testid="booking-job-presence" data-state={presence === null ? "unknown":presence ? "required":"not-required"}>Kundens närvaro: {presence === null ? "Okänd":presence ? "Krävs":"Krävs inte"}</p>
        {selectedHint?.earliestDate && <p data-testid="booking-job-earliest-hint">Tidigast föreslaget datum: {selectedHint.earliestDate}</p>}
        {desiredMiss && <p data-testid="booking-job-desired-warning">Önskat datum {selectedHint?.desiredDate} har passerats för den valda sluttiden.</p>}
        {latestBreach && <p data-testid="booking-job-latest-breach">Senaste datum {selectedHint?.latestDate} överskrids.</p>}
        <p>Efterfrågan jämförs med återstående kapacitet i jobbets planeringsperiod. Uppgifterna är rådgivande.</p>
        {advisory?.state === "known" ? <dl className="grid grid-cols-1 gap-1 sm:grid-cols-2">{([
          ["total","Total efterfrågan",advisory.totalDemand],["allocated","Redan planerat för jobbet",advisory.allocatedCurrentJob],
          ["residual","Återstående efterfrågan",advisory.remainingDemand],["capacity","Återstående kapacitet",advisory.remainingCapacity],
          ["shortfall","Kapacitetsunderskott",advisory.shortfall]] as const).map(([id,label,value])=><div key={id}><dt>{label}</dt><dd data-testid={`booking-demand-${id}`} data-person-minutes={value}>{value} personminuter</dd></div>)}</dl> : <p data-testid="booking-demand-unknown">Kapacitetsprognos: Okänd</p>}
      </div>
      <label className="block space-y-1"><span>Beskrivning</span><textarea name="description" disabled={resolverAdapter?.commonSeries} data-testid="booking-description" className={fieldClass} value={facts.description} onChange={e => change({description: e.target.value})} /></label>
      <label className="block space-y-1"><span>Status</span><select name="status" disabled={resolverAdapter?.commonSeries} data-testid="booking-status" className={fieldClass} value={facts.status} onChange={e => change({status: e.target.value as BookingFacts["status"]})}><option value="planned">Planerad</option><option value="cancelled">Avbruten</option></select></label>
      </fieldset>
      <BookingConflictPanel preview={preview} onRetry={retryPreview} selected={selected} onSelect={pending || unresolved || discard ? undefined : (id, checked) => {setSelected(values => checked ? [...values,id] : values.filter(value => value !== id)); setDirty(true);}} />
      {preview.status === "ready" && preview.warnings.length > 0 && <fieldset disabled={pending || unresolved} className="space-y-3"><label className="flex min-h-11 items-center gap-3"><input type="checkbox" data-testid="booking-review-current-warnings" checked={reviewed} onChange={e => {setReviewed(e.target.checked); setDirty(true);}} />Jag har granskat samtliga aktuella varningar</label><label className="block space-y-1"><span>Orsak för att boka ändå</span><textarea data-testid="booking-override-reason" className={fieldClass} maxLength={2000} value={reason} onChange={e => {setReason(e.target.value); setDirty(true);}} /></label><p className="text-sm text-zinc-600">Endast valda konflikter accepteras. Övriga granskade konflikter förblir öppna.</p></fieldset>}
      {error && <p role="alert" data-testid="booking-save-error" className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">{error}</p>}
      </>}
      </div></div>
      {discard && <div role="alertdialog" aria-label="Kasta utkast?" data-testid="booking-discard-confirmation" className="space-y-3 rounded-md border border-amber-300 p-3"><p>Kasta osparade ändringar?</p><div className="flex flex-wrap gap-2"><button type="button" data-testid="booking-keep-editing" ref={keepEditing} className={buttonClass} onClick={() => setDiscard(false)}>Fortsätt redigera</button><button type="button" data-testid="booking-discard" className={buttonClass} disabled={pending || unresolved} onClick={() => {if (!pending && !attempted.current) onClose();}}>Kasta utkast</button></div></div>}
      <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-zinc-200 bg-white py-3"><button type="button" data-testid="booking-close" className={buttonClass} disabled={pending || unresolved} onClick={requestClose}>{success ? "Stäng" : "Avbryt"}</button>{!success && <button type="submit" data-testid={error ? "booking-retry" : "booking-save"} disabled={pending || discard || (!unresolved && preview.status !== "ready") || !!options.error || optionsLoading} className={`${buttonClass} bg-blue-700 text-white`}>{pending ? "Sparar…" : error ? "Försök igen" : preview.warnings.length ? "Boka ändå" : "Spara bokning"}</button>}</div>
    </form>
  </Dialog>;
}
