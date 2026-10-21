"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  createWorkOrderAction, updateWorkOrderAction, setWorkOrderAssigneesAction, setWorkOrderStatusAction,
  setWorkOrderDependenciesAction, setJobWorkOrderDependenciesAction, refetchJobWorkOrdersAction,
} from "@/features/jobs/actions";
import { canTransitionWorkOrderStatus, createWorkOrderDraft, transitionWorkOrderDraft, selectWorkOrderDependencyWarnings, workOrderCreateRecovery,
  createWorkOrderField, editWorkOrderField, receiveWorkOrderField, consentWorkOrderField, confirmWorkOrderField,
} from "@/features/jobs/work-orders-domain";
import type { JobWorkOrdersProjection, WorkOrderEndpoint, WorkOrderRow, WorkOrderStatus } from "@/server/read-models/job-work-orders";

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  created: "Skapad", in_progress: "Pågår", done: "Klar", cancelled: "Avbruten",
};
const control = "min-h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";
const primary = "min-h-11 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";
type Field<T> = ReturnType<typeof createWorkOrderField<T>>;
type Details = {title: string; description: string; start: string; end: string};
type Fields = {details: Field<Details>; assignees: Field<string[]>; status: Field<WorkOrderStatus>; dependencies: Field<WorkOrderEndpoint[]>};
type Operation = "create" | "update" | "assignees" | "status" | "dependencies" | "jobDependencies";
type Input = Record<string, unknown> & {commandId: string; jobId: string; expectedState: string; workOrderId?: string};
type Attempt = {operation: Operation; input: Input; draft: ReturnType<typeof createWorkOrderDraft>; createOutcomeUnresolved?: boolean};
type Lane = {pending: boolean; error: string | null; saved: boolean; attempt: Attempt | null; recovery: "uncertain" | "stale" | "ready" | null};
const emptyLane: Lane = {pending: false, error: null, saved: false, attempt: null, recovery: null};
const actions = {create: createWorkOrderAction, update: updateWorkOrderAction, assignees: setWorkOrderAssigneesAction,
  status: setWorkOrderStatusAction, dependencies: setWorkOrderDependenciesAction, jobDependencies: setJobWorkOrderDependenciesAction};
const key = (endpoint: WorkOrderEndpoint) => `${endpoint.jobId}:${endpoint.workOrderId ?? "job"}`;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function values(projection: JobWorkOrdersProjection, jobId: string, id: string | null) {
  const row = projection.rows.find((candidate) => candidate.id === id);
  return {details: {title: row?.title ?? "", description: row?.description ?? "", start: row?.plannedStartDate ?? "", end: row?.plannedEndDate ?? ""},
    assignees: row?.assignees.map((person) => person.id).sort() ?? [], status: row?.status ?? "created" as WorkOrderStatus,
    dependencies: projection.dependencies.filter((edge) => edge.dependent.jobId === jobId && edge.dependent.workOrderId === id).map((edge) => edge.prerequisite)};
}
function initialFields(projection: JobWorkOrdersProjection, jobId: string, id: string | null): Fields {
  const v = values(projection, jobId, id), token = projection.expectedState;
  return {details: createWorkOrderField(v.details, token), assignees: createWorkOrderField(v.assignees, token),
    status: createWorkOrderField(v.status, token), dependencies: createWorkOrderField(v.dependencies, token)};
}
function fieldKey(operation: Operation): keyof Fields {
  return operation === "create" || operation === "update" ? "details"
    : operation === "jobDependencies" ? "dependencies" : operation;
}
function reconcile(fields: Fields, projection: JobWorkOrdersProjection, jobId: string, id: string | null, attempt?: Attempt, consent?: Operation): Fields {
  const v = values(projection, jobId, id), token = projection.expectedState;
  const next: Fields = {details: receiveWorkOrderField(fields.details, v.details, token),
    assignees: receiveWorkOrderField(fields.assignees, v.assignees, token), status: receiveWorkOrderField(fields.status, v.status, token),
    dependencies: receiveWorkOrderField(fields.dependencies, v.dependencies, token)};
  if (attempt) {
    const input = attempt.input;
    switch (fieldKey(attempt.operation)) {
      case "details": next.details = confirmWorkOrderField(fields.details,
        {title: input.title as string, description: input.description as string ?? "", start: input.planned_start_date as string ?? "", end: input.planned_end_date as string ?? ""}, v.details, token); break;
      case "assignees": next.assignees = confirmWorkOrderField(fields.assignees, input.personProfileIds as string[], v.assignees, token); break;
      case "status": next.status = confirmWorkOrderField(fields.status, input.status as WorkOrderStatus, v.status, token); break;
      case "dependencies": next.dependencies = confirmWorkOrderField(fields.dependencies, input.prerequisites as WorkOrderEndpoint[], v.dependencies, token); break;
    }
  }
  if (consent) {
    switch (fieldKey(consent)) {
      case "details": next.details = consentWorkOrderField(next.details, v.details, token); break;
      case "assignees": next.assignees = consentWorkOrderField(next.assignees, v.assignees, token); break;
      case "status": next.status = consentWorkOrderField(next.status, v.status, token); break;
      case "dependencies": next.dependencies = consentWorkOrderField(next.dependencies, v.dependencies, token); break;
    }
  }
  return next;
}

/** Replaceable presentation over operation-specific drafts and server-resolved authority. */
export function WorkOrderPane({jobId, workOrderId, projection, filesPanel, onReceive, onDirtyChange, jobDependenciesOnly = false}: {
  jobId: string; workOrderId: string | null; projection: JobWorkOrdersProjection; filesPanel?: ReactNode;
  onReceive: (next: JobWorkOrdersProjection, createdId?: string) => void;
  onDirtyChange?: (dirty: boolean) => void; jobDependenciesOnly?: boolean;
}) {
  const [received, setReceived] = useState(projection);
  const [fields, setFields] = useState(() => initialFields(projection, jobId, workOrderId));
  const [lane, setLane] = useState<Lane>(emptyLane);
  const lock = useRef(false);
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!jobDependenciesOnly) titleInput.current?.focus(); }, [jobDependenciesOnly]);
  if (received !== projection) {
    setReceived(projection);
    setFields((current) => reconcile(current, projection, jobId, workOrderId));
  }
  const row: WorkOrderRow | undefined = projection.rows.find((candidate) => candidate.id === workOrderId);
  const dirty = Object.values(fields).some((field) => !same(field.value, field.baseline));
  useEffect(() => { onDirtyChange?.(dirty || lane.pending || Boolean(lane.recovery)); }, [dirty, lane.pending, lane.recovery, onDirtyChange]);
  useEffect(() => {
    if (!dirty && !lane.recovery) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty, lane.recovery]);
  const editable = jobDependenciesOnly ? projection.canEditJobDependencies : projection.canEditWorkOrders;
  const blocked = lane.pending || Boolean(lane.recovery);
  const creating = !workOrderId && !jobDependenciesOnly;
  const {title, description, start, end} = fields.details.value;
  const warnings = selectWorkOrderDependencyWarnings(projection.dependencyWarnings, {jobId, workOrderId: workOrderId});
  const options = projection.prerequisiteOptions.filter((option) =>
    !(option.jobId === jobId && option.workOrderId === workOrderId) && (!jobDependenciesOnly || option.workOrderId !== null));
  function edit<K extends keyof Fields>(name: K, value: Fields[K]["value"]) {
    setFields((current) => ({...current, [name]: editWorkOrderField(current[name] as Field<Fields[K]["value"]>, value)}));
    setLane((current) => ({...current, saved: false}));
  }
  function payload(operation: Operation): Record<string, unknown> {
    if (operation === "create" || operation === "update") return {title, description: description || null, planned_start_date: start || null, planned_end_date: end || null};
    if (operation === "assignees") return {personProfileIds: fields.assignees.value};
    if (operation === "status") return {status: fields.status.value};
    return {prerequisites: fields.dependencies.value};
  }
  async function send(attempt: Attempt) {
    if (lock.current) return;
    lock.current = true;
    setLane((current) => ({...current, pending: true, saved: false, error: null, attempt}));
    try {
      const result = await actions[attempt.operation](attempt.input);
      if (result.ok) {
        const id = attempt.operation === "create" ? result.workOrderId ?? null : workOrderId;
        if (attempt.operation === "create" && !id) throw new Error("missing created ID");
        setFields((current) => reconcile(current, result.projection, jobId, id, attempt));
        onReceive(result.projection, attempt.operation === "create" ? id ?? undefined : undefined);
        setLane({...emptyLane, saved: true});
      } else {
        const staleResult = ["PREVIEW_STALE", "STALE_STATE", "STALE", "CONFLICT"].includes(result.code);
        // SQL distinguishes serialized absence from a mismatched/unresolved identity.
        // A prior transport-uncertain attempt still cannot manufacture a fresh creation.
        const createRecovery = attempt.operation === "create" ? workOrderCreateRecovery(result.code, attempt.createOutcomeUnresolved === true) : null;
        const unresolvedCreate = attempt.operation === "create" && createRecovery === "uncertain";
        const stale = attempt.operation === "create" ? createRecovery === "stale" : staleResult;
        const uncertain = attempt.operation === "create" ? unresolvedCreate : result.code === "SERVER_ERROR";
        setLane({pending: false, saved: false, error: result.message, recovery: stale ? "stale" : uncertain ? "uncertain" : null,
          attempt: stale || uncertain ? {...attempt, createOutcomeUnresolved: Boolean(unresolvedCreate), draft: transitionWorkOrderDraft(attempt.draft,
            {type: stale ? "stale" : "uncertain", commandId: attempt.input.commandId})} : null});
      }
    } catch {
      setLane({pending: false, saved: false, error: "Sparandet kunde inte bekräftas. Dina uppgifter finns kvar.", recovery: "uncertain",
        attempt: {...attempt, createOutcomeUnresolved: attempt.operation === "create", draft: transitionWorkOrderDraft(attempt.draft, {type: "uncertain", commandId: attempt.input.commandId})}});
    } finally { lock.current = false; }
  }
  function submit(operation: Operation, overrides: Record<string, unknown> = {}) {
    if (blocked || lock.current || !editable) return;
    const input: Input = {commandId: crypto.randomUUID(), jobId, expectedState: fields[fieldKey(operation)].expectedState,
      ...(workOrderId && operation !== "jobDependencies" ? {workOrderId} : {}), ...payload(operation), ...overrides};
    const draft = transitionWorkOrderDraft(createWorkOrderDraft(operation, input), {type: "submit", commandId: input.commandId});
    void send({operation, input: draft.submission!.input as Input, draft});
  }
  async function refetch() {
    if (lock.current || !lane.attempt || lane.attempt.createOutcomeUnresolved) return;
    lock.current = true;
    setLane((current) => ({...current, pending: true, saved: false}));
    try {
      const result = await refetchJobWorkOrdersAction(jobId);
      if (!result.ok) { setLane((current) => ({...current, pending: false, error: result.message})); return; }
      setFields((current) => reconcile(current, result.projection, jobId, workOrderId, undefined, lane.attempt!.operation));
      onReceive(result.projection);
      setLane((current) => ({...current, pending: false, recovery: "ready", error: "Aktuella uppgifter är hämtade. Kontrollera ändringen och försök igen."}));
    } catch { setLane((current) => ({...current, pending: false, error: "Aktuella uppgifter kunde inte hämtas. Försök igen."})); }
    finally { lock.current = false; }
  }
  function retry() {
    if (!lane.attempt || lane.pending || lane.recovery === "stale" || !editable) return;
    const previous = lane.attempt;
    if (lane.recovery === "uncertain") {
      // Replay immutable command identity, even while the visible fields contain newer input.
      void send({...previous, draft: transitionWorkOrderDraft(previous.draft, {type: "retry"})});
      return;
    }
    if (lane.recovery !== "ready" || previous.createOutcomeUnresolved) return;
    const input: Input = {...previous.input, commandId: crypto.randomUUID(), expectedState: fields[fieldKey(previous.operation)].expectedState,
      ...payload(previous.operation)};
    let draft = transitionWorkOrderDraft(previous.draft, {type: "refetched", current: {expectedState: input.expectedState}});
    draft = transitionWorkOrderDraft(draft, {type: "edit", input});
    draft = transitionWorkOrderDraft(draft, {type: "submit", commandId: input.commandId});
    void send({operation: previous.operation, input: draft.submission!.input as Input, draft});
  }
  const prefix = jobDependenciesOnly ? "job-work-order-dependencies" : "work-order";
  const feedback = <>
    {lane.pending && <p role="status" className="text-sm text-zinc-600">Sparar…</p>}
    {lane.error && <div role="alert" data-testid={`${prefix}-error`} className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      <p>Inte bekräftat sparat. {lane.error}</p>
      {lane.attempt && <p className="mt-2 break-words">Referens: {lane.attempt.input.commandId}</p>}
    </div>}
    {lane.recovery && <div className="flex flex-col gap-2">
      {!lane.attempt?.createOutcomeUnresolved && (lane.recovery === "stale" || lane.recovery === "ready") && <button type="button" data-testid={`${prefix}-refetch`} className={control} disabled={lane.pending} onClick={() => void refetch()}>Hämta aktuella uppgifter</button>}
      <button type="button" data-testid={`${prefix}-retry`} className={control} disabled={lane.pending || lane.recovery === "stale" || !editable} onClick={retry}>Försök spara igen</button>
      <p className="text-sm text-zinc-600">{lane.attempt?.createOutcomeUnresolved ? "Det ursprungliga skapandet kontrolleras med samma referens. Inget nytt skapande skickas och dina nya fältändringar finns kvar som utkast." : lane.recovery === "uncertain" ? "Samma försök skickas igen. Nya ändringar finns kvar som osparat utkast." : "Ditt utkast finns kvar. Kontrollera det mot de aktuella uppgifterna innan du sparar igen."}</p>
      {lane.recovery === "ready" && row && <p className="break-words text-sm text-zinc-700">Aktuell rubrik: {row.title}. Status: {WORK_ORDER_STATUS_LABELS[row.status]}. Aktuella datum: {row.plannedStartDate ?? "okänt"} – {row.plannedEndDate ?? "okänt"}.</p>}
    </div>}
    {lane.recovery === "ready" && row && (lane.attempt?.operation === "create" || lane.attempt?.operation === "update") && <p className="whitespace-pre-wrap break-words text-sm text-zinc-700">Aktuell beskrivning: {row.description ?? "Ingen beskrivning"}.</p>}
    {lane.recovery === "ready" && lane.attempt?.operation === "assignees" && <p className="break-words text-sm text-zinc-700">Aktuell tilldelning: {row?.assignees.map((person) => person.label).join(", ") || "Ingen tilldelad"}.</p>}
    {lane.recovery === "ready" && (lane.attempt?.operation === "dependencies" || lane.attempt?.operation === "jobDependencies") && <p className="break-words text-sm text-zinc-700">Aktuella synliga förutsättningar: {values(projection, jobId, workOrderId).dependencies.map((endpoint) => projection.prerequisiteOptions.find((option) => key(option) === key(endpoint))?.label ?? "Tidigare val").join(", ") || "Inga"}. Ditt urval ovan är utkastet som nästa försök sparar.</p>}
    {lane.saved && <p role="status" data-testid={`${prefix}-save-status`} className="text-sm text-zinc-800">Det skickade försöket är bekräftat sparat. {dirty && "Andra fältändringar är fortfarande osparade."}</p>}
  </>;
  const dependencies = <section aria-label={jobDependenciesOnly ? "Jobbets arbetsorderberoenden" : "Arbetsorderns beroenden"} className="flex min-w-0 flex-col gap-3 border-t border-zinc-200 pt-4">
    <h3 className="font-semibold text-zinc-900">{jobDependenciesOnly ? "Jobbets förutsättningar i arbetsorder" : "Förutsättningar"}</h3>
    {fields.dependencies.value.length > 0 && <ul className="flex min-w-0 flex-col gap-2">{fields.dependencies.value.map((endpoint) =>
      <li key={key(endpoint)} className="flex min-w-0 flex-col gap-2 rounded-md border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="break-words text-sm">{projection.prerequisiteOptions.find((option) => key(option) === key(endpoint))?.label ?? "Tidigare val (kontrollera aktuell åtkomst)"}</span>
        {editable && <button type="button" className={control} onClick={() => edit("dependencies", fields.dependencies.value.filter((other) => key(other) !== key(endpoint)))}>Ta bort förutsättning</button>}
      </li>)}</ul>}
    {editable && <>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Förutsättning<select className={control} value="" onChange={(event) => {
        const selected = options.find((option) => key(option) === event.target.value);
        if (selected && !fields.dependencies.value.some((endpoint) => key(endpoint) === key(selected))) edit("dependencies", [...fields.dependencies.value, {jobId: selected.jobId, workOrderId: selected.workOrderId}]);
      }}><option value="">Välj förutsättning…</option>{options.filter((option) => !fields.dependencies.value.some((endpoint) => key(endpoint) === key(option))).map((option) => <option key={key(option)} value={key(option)}>{option.label}</option>)}</select></label>
      <button type="button" className={primary} disabled={blocked} onClick={() => submit(jobDependenciesOnly ? "jobDependencies" : "dependencies")}>Spara beroenden</button>
    </>}
    {warnings.filter((warning) => warning.state !== "clear").map((warning, index) => <p key={index} role="note" data-testid={`${prefix}-dependency-warning`} className="rounded-md border border-zinc-300 p-3 text-sm">{warning.state === "delay" ? "Risk för försening: en förutsättning slutar efter planerad start." : "Tidpunkten är okänd. Datum saknas eller kan inte bedömas."} {warning.label ?? ""}</p>)}
  </section>;
  if (jobDependenciesOnly) return <div className="flex min-w-0 flex-col gap-3">{dependencies}{feedback}</div>;
  return <section data-testid="work-order-pane" aria-label={creating ? "Ny arbetsorder" : "Arbetsorderdetalj"} aria-busy={lane.pending} className="flex min-w-0 flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4">
    <h3 className="break-words text-lg font-semibold text-zinc-900">{creating ? "Ny arbetsorder" : row?.title ?? "Arbetsorder"}</h3>
    <form onSubmit={(event) => { event.preventDefault(); submit(creating ? "create" : "update"); }} className="flex min-w-0 flex-col gap-3">
      <label className="flex min-w-0 flex-col gap-1 text-sm">Rubrik<input ref={titleInput} className={control} value={title} required maxLength={256} readOnly={!editable} onChange={(event) => edit("details", {...fields.details.value, title: event.target.value})} /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Beskrivning<textarea className={control} rows={4} value={description} maxLength={10000} readOnly={!editable} onChange={(event) => edit("details", {...fields.details.value, description: event.target.value})} /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Planerat startdatum<input type="date" min="0001-01-01" max="9999-12-31" className={control} value={start} readOnly={!editable} onChange={(event) => edit("details", {...fields.details.value, start: event.target.value})} /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Planerat slutdatum<input type="date" min="0001-01-01" max="9999-12-31" className={control} value={end} readOnly={!editable} onChange={(event) => edit("details", {...fields.details.value, end: event.target.value})} /></label>
      {editable && <button type="submit" className={primary} disabled={blocked}>{creating ? "Skapa arbetsorder" : "Spara arbetsorder"}</button>}
    </form>
    {feedback}
    {!creating && <>
      <section aria-label="Tilldelning" className="flex min-w-0 flex-col gap-3 border-t border-zinc-200 pt-4">
        <h3 className="font-semibold text-zinc-900">Tilldelade personer</h3>
        {editable ? <><label className="flex min-w-0 flex-col gap-1 text-sm">Tilldelade personer<select multiple size={Math.min(6, Math.max(3, projection.eligiblePeople.length))} className={control} value={fields.assignees.value} onChange={(event) => edit("assignees", Array.from(event.target.selectedOptions, (option) => option.value).sort())}>
          {projection.eligiblePeople.map((person) => <option key={person.id} value={person.id}>{person.label}</option>)}
          {fields.assignees.value.filter((id) => !projection.eligiblePeople.some((person) => person.id === id)).map((id) => <option key={id} value={id}>{row?.assignees.find((person) => person.id === id)?.label ?? "Tidigare tilldelning"} (inte längre aktuell; avmarkera)</option>)}
        </select></label><button type="button" className={primary} disabled={blocked} onClick={() => submit("assignees")}>Spara tilldelning</button></>
        : <p className="break-words text-sm text-zinc-700">{row?.assignees.map((person) => person.label).join(", ") || "Ingen tilldelad"}</p>}
      </section>
      <section aria-label="Arbetsorderstatus" className="flex min-w-0 flex-col gap-3 border-t border-zinc-200 pt-4">
        <h3 className="font-semibold text-zinc-900">Status</h3>
        <p className="text-sm text-zinc-700">{row ? WORK_ORDER_STATUS_LABELS[row.status] : "Okänd"}</p>
        {editable && row && (row.status === "created" || row.status === "in_progress") && <>
          <label className="flex min-w-0 flex-col gap-1 text-sm">Arbetsorderstatus<select className={control} value={fields.status.value} onChange={(event) => edit("status", event.target.value as WorkOrderStatus)}>
            {(["created", "in_progress", "done", "cancelled"] as const).filter((status) => status === fields.status.value || status === row.status || canTransitionWorkOrderStatus(row.status, status, {canReopen: false})).map((status) => <option key={status} value={status}>{WORK_ORDER_STATUS_LABELS[status]}</option>)}
          </select></label><button type="button" className={primary} disabled={blocked || !canTransitionWorkOrderStatus(row.status, fields.status.value, {canReopen: false})} onClick={() => submit("status")}>Spara status</button>
        </>}
        {editable && projection.canReopenWorkOrders && row && (row.status === "done" || row.status === "cancelled") && <button type="button" className={control} disabled={blocked} onClick={() => { const status = row.status === "done" ? "in_progress" : "created"; edit("status", status); submit("status", {status}); }}>Återöppna arbetsorder</button>}
      </section>
      {dependencies}
      {filesPanel}
    </>}
  </section>;
}




