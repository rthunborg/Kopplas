"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  assignJobMemberAction, removeJobMemberAction, setJobLeadAction,
  updateJobPlanDatesAction, refetchJobMembersAction,
} from "@/features/jobs/actions";
import { createJobMembersDraft, transitionJobMembersDraft, type JobMembersDraft,
  createJobMemberField, editJobMemberField, receiveJobMemberField, consentJobMemberField, confirmJobMemberField, type JobMemberField } from "@/features/jobs/job-members-domain";
import type { JobMembersProjection } from "@/server/read-models/job-members";

type Operation = "assign" | "remove" | "lead" | "dates";
type Input = {
  commandId: string; jobId: string; expectedState: string;
  personProfileId?: string | null;
  planned_start_date?: string | null; planned_end_date?: string | null;
};
type Fields = {person: JobMemberField<string>; lead: JobMemberField<string>; dates: JobMemberField<{start: string; end: string}>};
function initialFields(projection: JobMembersProjection): Fields {
  return {person: createJobMemberField("", projection.expectedState),
    lead: createJobMemberField(projection.leadPersonProfileId ?? "", projection.expectedState),
    dates: createJobMemberField({start: projection.plannedStartDate ?? "", end: projection.plannedEndDate ?? ""}, projection.expectedState)};
}
function receiveFields(fields: Fields, projection: JobMembersProjection, attempt?: Attempt, consent?: Operation): Fields {
  const token = projection.expectedState;
  const nextLead = projection.leadPersonProfileId ?? "";
  const nextDates = {start: projection.plannedStartDate ?? "", end: projection.plannedEndDate ?? ""};
  const next = {
    person: attempt?.operation === "assign" ? confirmJobMemberField(fields.person, attempt.input.personProfileId ?? "", "", token) : receiveJobMemberField(fields.person, "", token),
    lead: attempt?.operation === "lead" ? confirmJobMemberField(fields.lead, attempt.input.personProfileId ?? "", nextLead, token) : receiveJobMemberField(fields.lead, nextLead, token),
    dates: attempt?.operation === "dates" ? confirmJobMemberField(fields.dates, {start: attempt.input.planned_start_date ?? "", end: attempt.input.planned_end_date ?? ""}, nextDates, token) : receiveJobMemberField(fields.dates, nextDates, token),
  };
  if (consent === "assign") next.person = consentJobMemberField(next.person, "", token);
  if (consent === "lead") next.lead = consentJobMemberField(next.lead, nextLead, token);
  if (consent === "dates") next.dates = consentJobMemberField(next.dates, nextDates, token);
  return next;
}
type Attempt = { operation: Operation; input: Input; draft: JobMembersDraft };
type Lane = {
  pending: boolean; error: string | null; saved: boolean; notice?: string;
  recovery: "uncertain" | "stale" | "ready" | null;
  attempt: Attempt | null;
};
const emptyLane: Lane = { pending: false, error: null, saved: false, recovery: null, attempt: null };
const control = "min-h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";
const primary = "min-h-11 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";
const mutations = { assign: assignJobMemberAction, remove: removeJobMemberAction, lead: setJobLeadAction, dates: updateJobPlanDatesAction };

/** Server projections supply all authority. A lane retains its immutable submission
 * separately from editable fields until a confirmed response resolves the attempt. */
export function JobMembersPanel({ jobId, initial }: { jobId: string; initial: JobMembersProjection }) {
  const [projection, setProjection] = useState(initial);
  const [receivedInitial, setReceivedInitial] = useState(initial);
  const [fields, setFields] = useState(() => initialFields(initial));
  const lock = useRef(false);
  const [crew, setCrew] = useState<Lane>(emptyLane);
  const [dates, setDates] = useState<Lane>(emptyLane);
  // React's guarded render adjustment keeps replacement server props from showing
  // stale pristine controls for a paint; dirty values retain their original token.
  if (receivedInitial !== initial) {
    setReceivedInitial(initial);
    setProjection(initial);
    setFields((current) => receiveFields(current, initial));
  }
  const person = fields.person.value, lead = fields.lead.value;
  const {start, end} = fields.dates.value;
  const busy = crew.pending || dates.pending;
  const canAssign = Boolean(person) && projection.eligiblePeople.some((p) => p.id === person)
    && !projection.members.some((m) => m.personProfileId === person);
  const receive = (next: JobMembersProjection, attempt?: Attempt, consent?: Operation) => {
    setProjection(next); setFields((current) => receiveFields(current, next, attempt, consent));
  };
  const baseline = (operation: Operation) => operation === "assign" ? fields.person.expectedState
    : operation === "lead" ? fields.lead.expectedState : operation === "dates" ? fields.dates.expectedState : projection.expectedState;

  async function send(attempt: Attempt, lane: "crew" | "dates") {
    if (lock.current) return;
    lock.current = true;
    const update = lane === "crew" ? setCrew : setDates;
    update((old) => ({ ...old, pending: true, error: null, saved: false, attempt }));
    try {
      const result = await mutations[attempt.operation](attempt.input);
      if (result.ok) {
        receive(result.projection, attempt);
        const newerDraft = attempt.operation === "dates"
          ? (start || null) !== attempt.input.planned_start_date || (end || null) !== attempt.input.planned_end_date
          : attempt.operation === "lead" ? (lead || null) !== attempt.input.personProfileId
          : attempt.operation === "assign" && person !== attempt.input.personProfileId;
        update({ ...emptyLane, saved: true, ...(newerDraft ? { notice: "Det tidigare försöket är bekräftat sparat. Dina nya ändringar finns kvar som osparat utkast." } : {}) });
      } else {
        const stale = result.code === "PREVIEW_STALE" || result.code === "STALE_STATE" || result.code === "STALE" || result.code === "CONFLICT";
        const uncertain = result.code === "SERVER_ERROR";
        update({ pending: false, saved: false, error: result.message,
          recovery: stale ? "stale" : uncertain ? "uncertain" : null,
          attempt: stale || uncertain ? { ...attempt, draft: transitionJobMembersDraft(attempt.draft, { type: stale ? "stale" : "uncertain", commandId: attempt.input.commandId }) } : null });
      }
    } catch {
      update({ pending: false, saved: false, error: "Sparandet kunde inte bekräftas. Dina uppgifter finns kvar.", recovery: "uncertain", attempt: { ...attempt, draft: transitionJobMembersDraft(attempt.draft, { type: "uncertain", commandId: attempt.input.commandId }) } });
    } finally { lock.current = false; }
  }

  function submit(operation: Operation, fields: Omit<Input, "commandId" | "jobId" | "expectedState">, lane: "crew" | "dates") {
    const state = lane === "crew" ? crew : dates;
    if (lock.current || state.recovery) return;
    const commandId = crypto.randomUUID();
    const input = { commandId, jobId, expectedState: baseline(operation), ...fields };
    const operationName = operation === "lead" ? "set-lead" : operation === "dates" ? "planned-dates" : operation;
    const draft = transitionJobMembersDraft(createJobMembersDraft(operationName, input), { type: "submit", commandId });
    void send({ operation, input: draft.submission!.input as Input, draft }, lane);
  }

  async function refetch(lane: "crew" | "dates") {
    if (lock.current) return;
    lock.current = true;
    const update = lane === "crew" ? setCrew : setDates;
    update((old) => ({ ...old, pending: true, saved: false }));
    try {
      const result = await refetchJobMembersAction(jobId);
      if (result.ok) {
        receive(result.projection, undefined, (lane === "crew" ? crew : dates).attempt?.operation);
        update((old) => ({ ...old, pending: false, recovery: "ready", error: "Aktuella uppgifter är hämtade. Kontrollera ändringen och försök igen." }));
      } else update((old) => ({ ...old, pending: false, error: result.message }));
    } catch { update((old) => ({ ...old, pending: false, error: "Aktuella uppgifter kunde inte hämtas. Försök igen." })); }
    finally { lock.current = false; }
  }

  function retry(lane: "crew" | "dates") {
    const state = lane === "crew" ? crew : dates;
    if (!state.attempt || busy || state.recovery === "stale" || (state.recovery === "ready" && state.attempt.operation === "assign" && !canAssign)) return;
    const previous = state.attempt;
    // An uncertain transport replays exactly the same command and payload.
    // A stale command can only become a new attempt after explicit server refetch.
    const next = state.recovery === "ready" ? { ...previous, input: {
      ...previous.input, commandId: crypto.randomUUID(), expectedState: baseline(previous.operation),
      ...(previous.operation === "dates" ? { planned_start_date: start || null, planned_end_date: end || null } : {}),
      ...(previous.operation === "lead" ? { personProfileId: lead || null } : {}),
      ...(previous.operation === "assign" ? { personProfileId: person } : {}),
    } } : previous;
    let draft = previous.draft;
    if (state.recovery === "ready") {
      draft = transitionJobMembersDraft(draft, { type: "refetched", current: { expectedState: baseline(previous.operation) } });
      draft = transitionJobMembersDraft(draft, { type: "edit", input: next.input });
      draft = transitionJobMembersDraft(draft, { type: "submit", commandId: next.input.commandId });
    } else draft = transitionJobMembersDraft(draft, { type: "retry" });
    void send({ ...next, draft, input: draft.submission!.input as Input }, lane);
  }

  function feedback(state: Lane, lane: "crew" | "dates") {
    const prefix = lane === "crew" ? "job-members" : "job-plan-dates";
    return <>
      {state.error && <div role="alert" data-testid={`${prefix}-error`} className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
        <p>Inte bekräftat sparat. {state.error}</p>
        {state.attempt && <p className="mt-2 break-words">Referens: {state.attempt.input.commandId}</p>}
      </div>}
      {state.recovery && <div className="flex flex-col gap-2">
        {(state.recovery === "stale" || state.recovery === "ready") && <button type="button" data-testid={`${prefix}-refetch`} disabled={busy} className={control} onClick={() => void refetch(lane)}>Hämta aktuella uppgifter</button>}
        <button type="button" data-testid={`${prefix}-retry`} disabled={busy || state.recovery === "stale" || (state.recovery === "ready" && state.attempt?.operation === "assign" && !canAssign)} className={control} onClick={() => retry(lane)}>Försök spara igen</button>
        {state.recovery === "uncertain" && <p className="text-sm text-zinc-600">Försöket skickar samma ändring igen. Nya fältändringar finns kvar som utkast.</p>}
        {state.recovery === "ready" && <p className="text-sm text-zinc-600">Aktuell arbetsledare: {projection.members.find((member) => member.personProfileId === projection.leadPersonProfileId)?.label ?? "Ingen"}. Aktuella datum: {projection.plannedStartDate ?? "—"} – {projection.plannedEndDate ?? "—"}.</p>}
      </div>}
      {state.saved && <p role="status" data-testid={`${prefix}-save-status`} className="text-sm text-zinc-800">{state.notice ?? (lane === "crew" ? "Medlemsändringen är sparad." : "Datumen är sparade.")}</p>}
    </>;
  }

  function editCrew() { setCrew((old) => ({ ...old, saved: false })); }
  function editDates() { setDates((old) => ({ ...old, saved: false })); }
  function saveDates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit("dates", { planned_start_date: start || null, planned_end_date: end || null }, "dates");
  }

  return <section data-testid="job-members-panel" aria-label="Jobbets medlemmar och planering" className="flex min-w-0 flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-4">
    <div className="flex min-w-0 flex-col gap-4" aria-busy={crew.pending}>
      <h2 className="text-lg font-semibold text-zinc-900">Medlemmar och arbetsledare</h2>
      {projection.members.length === 0 ? <p className="text-sm text-zinc-600">Inga medlemmar ännu.</p> : <ul className="flex min-w-0 flex-col gap-3">
        {projection.members.map((member) => <li key={member.id} data-testid={`job-member-${member.personProfileId}`} className="flex min-w-0 flex-col gap-2 rounded-md border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><p className="break-words font-medium text-zinc-900">{member.label}</p><p className="text-sm text-zinc-600">{member.designation === "arbetsledare" ? "Arbetsledare" : "Medlem"}</p></div>
          {projection.canManageCrew && (member.designation !== "arbetsledare" || projection.canSetLead) && <button type="button" className={control} disabled={busy || Boolean(crew.recovery)} onClick={() => submit("remove", { personProfileId: member.personProfileId }, "crew")}>Ta bort medlem</button>}
        </li>)}
      </ul>}
      {projection.canManageCrew && <div className="flex min-w-0 flex-col gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-sm">Lägg till person<select className={control} value={person} disabled={busy} onChange={(event) => { setFields((old) => ({...old, person: editJobMemberField(old.person, event.target.value)})); editCrew(); }}>
          <option value="">Välj person…</option>
          {person && !canAssign && <option value={person} disabled>Tidigare val (välj en aktuell person)</option>}
          {projection.eligiblePeople.filter((candidate) => !projection.members.some((member) => member.personProfileId === candidate.id)).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}
        </select></label>
        <button type="button" className={primary} disabled={busy || !canAssign || Boolean(crew.recovery)} onClick={() => submit("assign", { personProfileId: person }, "crew")}>Lägg till medlem</button>
      </div>}
      {projection.canSetLead && <div className="flex min-w-0 flex-col gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-sm">Ansvarig arbetsledare<select className={control} value={lead} disabled={busy} onChange={(event) => { setFields((old) => ({...old, lead: editJobMemberField(old.lead, event.target.value)})); editCrew(); }}>
          <option value="">Ingen arbetsledare</option>
          {projection.members.filter((member) => projection.eligiblePeople.some((candidate) => candidate.id === member.personProfileId)).map((member) => <option key={member.id} value={member.personProfileId}>{member.label}</option>)}
          {lead && !projection.members.some((member) => member.personProfileId === lead && projection.eligiblePeople.some((candidate) => candidate.id === lead)) && <option value={lead}>Tidigare val (kontrollera ändringen)</option>}
        </select></label>
        <button type="button" className={primary} disabled={busy || Boolean(crew.recovery)} onClick={() => submit("lead", { personProfileId: lead || null }, "crew")}>Spara arbetsledare</button>
      </div>}
      {feedback(crew, "crew")}
    </div>
    {projection.canUpdatePlannedDates && <form onSubmit={saveDates} data-testid="job-planned-dates-form" aria-busy={dates.pending} className="flex min-w-0 flex-col gap-3 border-t border-zinc-200 pt-4">
      <h3 className="font-semibold text-zinc-900">Planerade datum</h3>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Planerat startdatum<input type="date" className={control} value={start} disabled={busy} onChange={(event) => { setFields((old) => ({...old, dates: editJobMemberField(old.dates, {...old.dates.value, start: event.target.value})})); editDates(); }} /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Planerat slutdatum<input type="date" className={control} value={end} disabled={busy} onChange={(event) => { setFields((old) => ({...old, dates: editJobMemberField(old.dates, {...old.dates.value, end: event.target.value})})); editDates(); }} /></label>
      <button type="submit" className={primary} disabled={busy || Boolean(dates.recovery)}>Spara datum</button>
      {feedback(dates, "dates")}
    </form>}
  </section>;
}
