"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, SelectField } from "@/components/crm/FormField";
import { saveJobCardAction } from "@/features/jobs/actions";
import { prepareJobCardAccessWindow } from "@/features/jobs/job-card-domain";

function utcToStockholmLocal(value: string): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value)).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export interface JobCardOptions {
  customers: readonly { id: string; label: string }[];
  facilities: readonly { id: string; label: string; customerId: string }[];
  contacts: readonly { id: string; label: string; customerId: string; facilityId?: string | null }[];
  projectManagers: readonly { id: string; label: string }[];
  workRoles: readonly { id: string; label: string }[];
  jobs: readonly { id: string; label: string }[];
  error: string | null;
}
export type JobCardInitial = Readonly<Record<string, unknown>>;
const control = "min-h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

/** Presentation retains one immutable attempt until a transport failure is resolved. */
export function JobCardForm({ jobId, initial = {}, options }: {
  jobId?: string; initial?: JobCardInitial; options: JobCardOptions;
}) {
  const router = useRouter();
  const leaveRequired = useRef(false);
  const [leaveArmed, setLeaveArmed] = useState(false);
  function requireLeave() {leaveRequired.current = true; setLeaveArmed(true);}
  const search = useSearchParams();
  const currentLocation = useRef<{href: string; state: unknown} | null>(null);
  useEffect(() => {currentLocation.current = {href: window.location.href, state: window.history.state};}, [search]);
  useEffect(() => {
    if (!leaveArmed) return;
    const unload = (event: BeforeUnloadEvent) => {
      if (!leaveRequired.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const leave = (event: MouseEvent) => {
      if (!leaveRequired.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.download || (target.target && target.target !== "_self")) return;
      const destination = new URL(target.href, window.location.href);
      // Same-job query/tab navigation retains this island and must not warn.
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      if (!window.confirm("Det finns osparade eller pågående ändringar i jobbkortet. Vill du lämna utkastet?")) {
        event.preventDefault(); event.stopImmediatePropagation();
      }
    };
    const back = (event: PopStateEvent) => {
      const previous = currentLocation.current;
      if (!leaveRequired.current || !previous || new URL(previous.href).pathname === window.location.pathname) return;
      if (!window.confirm("Det finns osparade eller pågående ändringar i jobbkortet. Vill du lämna utkastet?")) {
        // Capture before Next handles the pop: keep the current mounted draft and its router tree.
        event.stopImmediatePropagation();
        window.history.pushState(previous.state, "", previous.href);
      }
    };
    window.addEventListener("popstate", back, true);
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", leave, true);
    return () => {window.removeEventListener("popstate", back, true); window.removeEventListener("beforeunload", unload); document.removeEventListener("click", leave, true);};
  }, [leaveArmed]);
  const attempt = useRef<Record<string, unknown> | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unresolved, setUnresolved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customer, setCustomer] = useState(String(initial.customer_id ?? ""));
  const [facility, setFacility] = useState(String(initial.facility_id ?? ""));
  const [rolesKnown, setRolesKnown] = useState(initial.requiredWorkRoleIds != null);
  const [selectedRoles, setSelectedRoles] = useState<readonly string[]>(() => (initial.requiredWorkRoleIds as readonly string[] | null | undefined) ?? []);
  const [windowsKnown, setWindowsKnown] = useState(initial.accessWindows != null);
  const [override, setOverride] = useState(initial.locationOverride != null);
  const [windows, setWindows] = useState<{ startsAt: string; endsAt: string; originalStartsAt?: string; originalEndsAt?: string; originalStartLocal?: string; originalEndLocal?: string }[]>(() => (initial.accessWindows as { startsAt: string; endsAt: string }[] | undefined | null)?.map((w) => ({ startsAt: utcToStockholmLocal(w.startsAt), endsAt: utcToStockholmLocal(w.endsAt), originalStartsAt: w.startsAt, originalEndsAt: w.endsAt, originalStartLocal: utcToStockholmLocal(w.startsAt), originalEndLocal: utcToStockholmLocal(w.endsAt) })) ?? []);
  const value = (name: string) => String(initial[name] ?? "");
  const choices = (items: readonly {id: string; label: string}[]) => [{ value: "", label: "Välj…" }, ...items.map((item) => ({ value: item.id, label: item.label }))];
  async function send(input: Record<string, unknown>) {
    requireLeave();
    setPending(true); setError(null);
    try {
      const result = await saveJobCardAction(input);
      if (result.ok) {
        leaveRequired.current = false; setLeaveArmed(false);
        setSaved(true); setUnresolved(false); attempt.current = null;
        router.push(`/jobs/${result.jobId}`); router.refresh();
      } else {
        setError(result.message);
        const uncertain = result.code === "SERVER_ERROR" || unresolved;
        setUnresolved(uncertain);
        if (!uncertain) attempt.current = null;
      }
    } catch { setError("Sparandet kunde inte bekräftas. Dina uppgifter finns kvar."); setUnresolved(true); }
    finally { setPending(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || saved || unresolved) return;
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim() || null;
    const number = (key: string) => text(key) === null ? null : Number(text(key));
    try {
      const input: Record<string, unknown> = {
        commandId: crypto.randomUUID(), ...(jobId ? { id: jobId, type: initial.type === "projekt" ? "projekt" : "order" } : { candidateId: crypto.randomUUID(), type: "order" }),
        title: text("title"), customer_id: customer, facility_id: facility, contact_id: text("contact_id"),
        priority: text("priority"), estimated_duration_minutes: number("estimated_duration_minutes"),
        planned_travel_minutes: number("planned_travel_minutes"), crew_size: number("crew_size"),
        earliest_date: text("earliest_date"), desired_date: text("desired_date"), latest_date: text("latest_date"),
        planned_start_date: text("planned_start_date"), planned_end_date: text("planned_end_date"),
        customer_presence_required: text("customer_presence_required") === null ? null : text("customer_presence_required") === "yes",
        responsible_project_manager_id: text("responsible_project_manager_id"),
        locationOverride: override ? { street: text("street"), postalCode: text("postalCode"), city: text("city"), countryCode: text("countryCode") } : null,
        requiredWorkRoleIds: rolesKnown ? [...selectedRoles] : null,
        accessWindows: windowsKnown ? windows.map(prepareJobCardAccessWindow) : null,
        dependencyJobIds: form.getAll("dependency").map(String),
      };
      attempt.current = input; void send(input);
    } catch { setError("Kontrollera tillträdestiderna. Ogiltiga eller tvetydiga lokala tider kan inte sparas."); }
  }
  const address = initial.locationOverride as Record<string, string> | undefined | null;
  // A confirmed save is locked against duplicate submit until the user changes a
  // field. Same-route refresh preserves this island, so the edit event starts the
  // next draft explicitly; unresolved attempts remain disabled and untouched.
  return <form onSubmit={submit} onChangeCapture={requireLeave} onChange={() => { if (saved) setSaved(false); }} data-testid="job-card-form" className="flex w-full min-w-0 max-w-2xl flex-col gap-4">
    {options.error && <p role="alert">Valen kunde inte läsas. Ladda om sidan för att försöka igen.</p>}
    {error && <p role="alert" data-testid="job-card-unsent" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">Inte bekräftat sparat. {error} Dina uppgifter finns kvar.</p>}
    {unresolved && <button data-testid="job-card-retry" type="button" disabled={pending} onClick={() => attempt.current && void send(attempt.current)} className={control}>Försök spara igen</button>}
    {saved && <p role="status" data-testid="job-card-save-status">Jobbet är sparat.</p>}
    <fieldset disabled={pending || unresolved || Boolean(options.error)} className="flex min-w-0 flex-col gap-4 disabled:opacity-60">
      <legend className="mb-3 text-lg font-semibold">{jobId ? "Jobbkort" : "Nytt jobb"}</legend>
      <TextField name="title" label="Titel" defaultValue={value("title")} required />
      <label className="flex flex-col gap-1 text-sm">Kund<select required disabled={Boolean(jobId)} name="customer_id" className={control} value={customer} onChange={(e) => {setCustomer(e.target.value); setFacility("");}}>{choices(options.customers).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm">Anläggning<select required name="facility_id" className={control} value={facility} onChange={(e) => setFacility(e.target.value)}>{choices(options.facilities.filter((f) => f.customerId === customer)).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
      <SelectField key={`${customer}:${facility}`} name="contact_id" label="Kontakt" required defaultValue={value("contact_id")} options={choices(options.contacts.filter((c) => c.customerId === customer && (!c.facilityId || c.facilityId === facility)))} />
      <details><summary data-testid="job-card-planning-toggle" className="cursor-pointer py-2 font-medium">Planering och förutsättningar</summary><div className="flex flex-col gap-4 pt-3">
        <SelectField name="priority" label="Prioritet" defaultValue={value("priority") || "normal"} options={[{value:"low",label:"Låg"},{value:"normal",label:"Normal"},{value:"high",label:"Hög"},{value:"urgent",label:"Brådskande"}]} />
        {[["estimated_duration_minutes","Uppskattad tid (minuter)"],["planned_travel_minutes","Planerad restid (minuter)"],["crew_size","Antal personer"]].map(([name,label]) => <TextField key={name} name={name} label={label} type="number" defaultValue={value(name)} />)}
        {[["earliest_date","Tidigast"],["desired_date","Önskat datum"],["latest_date","Senast"],["planned_start_date","Planerad start"],["planned_end_date","Planerat slut"]].map(([name,label]) => <TextField key={name} name={name} label={label} type="date" defaultValue={value(name)} />)}
        <SelectField name="customer_presence_required" label="Kundens närvaro" defaultValue={initial.customer_presence_required == null ? "" : initial.customer_presence_required ? "yes" : "no"} options={[{value:"",label:"Okänt"},{value:"yes",label:"Krävs"},{value:"no",label:"Krävs inte"}]} />
        <SelectField name="responsible_project_manager_id" label="Ansvarig projektledare" defaultValue={value("responsible_project_manager_id")} options={choices(initial.responsible_project_manager_id && !options.projectManagers.some((p) => p.id === initial.responsible_project_manager_id) ? [...options.projectManagers, {id: String(initial.responsible_project_manager_id), label:"Tidigare ansvarig (kontrollera behörighet)"}] : options.projectManagers)} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />Annan adress än anläggningen</label>
        {override && [["street","Gatuadress"],["postalCode","Postnummer"],["city","Ort"],["countryCode","Landskod (två bokstäver)"]].map(([name,label]) => <TextField key={name} name={name} label={label} defaultValue={address?.[name] ?? ""} required={name !== "postalCode"} />)}
        <fieldset className="flex flex-col gap-2"><legend>Yrkesroller</legend><label><input type="checkbox" checked={rolesKnown} onChange={(e) => setRolesKnown(e.target.checked)} /> Kraven är kända</label>{rolesKnown ? <><p className="text-sm">Inget val betyder att inga yrkesroller krävs.</p>{[...options.workRoles, ...((initial.requiredWorkRoleIds as string[] | null | undefined) ?? []).filter((id) => !options.workRoles.some((r) => r.id === id)).map((id) => ({id,label:"Tidigare vald yrkesroll (kontrollera valet)"}))].map((r) => <label key={r.id}><input type="checkbox" name="work_role" data-testid={`job-required-role-${r.id}`} value={r.id} checked={selectedRoles.includes(r.id)} onChange={(e) => setSelectedRoles((current) => e.target.checked ? [...current, r.id] : current.filter((id) => id !== r.id))} /> {r.label}</label>)}</> : <p className="text-sm">Kraven är okända.</p>}</fieldset>
        <fieldset className="flex min-w-0 flex-col gap-2"><legend>Tillträdestider (Europe/Stockholm)</legend><label><input type="checkbox" checked={windowsKnown} onChange={(e) => setWindowsKnown(e.target.checked)} /> Tillträdestiderna är kända</label>{windowsKnown ? <>{windows.length === 0 && <p role="note" className="text-sm">Inga tillträdestider: inget tidsintervall är tillåtet. Lägg till tider eller välj okänt.</p>}{windows.map((w,i) => <div key={i} data-testid="job-access-window-row" className="flex min-w-0 flex-col gap-2 rounded-md border border-zinc-300 p-3"><label className="flex min-w-0 flex-col">Från<input type="datetime-local" required className={`${control} w-full min-w-0`} value={w.startsAt} onChange={(e) => setWindows(windows.map((old,n) => n === i ? {...old, startsAt:e.target.value} : old))} /></label><label className="flex min-w-0 flex-col">Till<input type="datetime-local" required className={`${control} w-full min-w-0`} value={w.endsAt} onChange={(e) => setWindows(windows.map((old,n) => n === i ? {...old, endsAt:e.target.value} : old))} /></label><button type="button" onClick={() => { requireLeave(); setSaved(false); setWindows(windows.filter((_,n) => n !== i)); }} className={control}>Ta bort tidsintervall {i+1}</button></div>)}<button type="button" className={control} onClick={() => { requireLeave(); setSaved(false); setWindows([...windows,{startsAt:"",endsAt:""}]); }}>Lägg till tidsintervall</button></> : <p className="text-sm">Tillträdet är okänt.</p>}</fieldset>
        <fieldset className="flex flex-col gap-2"><legend>Jobb som ska vara klara först</legend>{[...options.jobs, ...((initial.dependencyJobIds as string[] | null | undefined) ?? []).filter((id) => !options.jobs.some((j) => j.id === id)).map((id) => ({id,label:"Tidigare valt föregående jobb"}))].filter((j) => j.id !== jobId).map((j) => <label key={j.id}><input type="checkbox" name="dependency" data-testid={`job-dependency-${j.id}`} value={j.id} defaultChecked={(initial.dependencyJobIds as string[] | undefined)?.includes(j.id)} /> {j.label}</label>)}</fieldset>
      </div></details>
      <button type="submit" data-testid="job-card-save" disabled={pending || saved || !customer || !facility} className="min-h-11 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">{pending ? "Sparar…" : "Spara jobb"}</button>
    </fieldset>
  </form>;
}
