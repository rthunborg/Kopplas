"use client";

/**
 * Customer create/edit dialog (Story 3.2, Task 3) — accessible form wired to the 3.1
 * `createCustomer` / `updateCustomer` envelope commands via a server action.
 *
 * CREATE: `customer_type` (one of four) drives the identifier field (private ⇒
 * personnummer; non-private ⇒ org_nr). EDIT: NO type switch (the 3.1 update validator
 * edits within-type fields only) — the type is shown read-only and the identifier stays
 * consistent with it. A non-blocking duplicate-like warning surfaces when the typed name
 * matches an existing active customer (advisory only — never blocks submit).
 *
 * Validation feedback is programmatically associated (aria-invalid/aria-describedby +
 * an aria-live blocking summary), input is preserved on failure, and focus returns to
 * the invoking control on close (the shared `Dialog`).
 */
import { useCallback,useEffect,useLayoutEffect,useRef,useState,useTransition } from "react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { Dialog } from "./Dialog";
import {
  FormErrorSummary,
  FormWarning,
  SelectField,
  TextField,
} from "./FormField";
import {
  beginCustomerSubmission,customerSubmissionSafety,finishCustomerSubmission,
  CUSTOMER_TYPE_LABELS,
  findDuplicateLikeNames,
  type CustomerListItem,
} from "./customer-presentation";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/features/crm/actions";
import { CRM_ACTION_INITIAL,type CrmActionState } from "@/features/crm/action-state";
import type { CustomerType } from "@/server/commands/crm/validation";

/** The editable customer fields the edit dialog hydrates from (detail-fetched). */
export interface CustomerEditDefaults {
  readonly id: string;
  readonly customer_type: CustomerType;
  readonly display_name: string;
  readonly org_nr: string|null;
  readonly personnummer: string|null;
  readonly contact_name: string|null;
  readonly email: string|null;
  readonly phone: string|null;
  readonly address_line1: string|null;
  readonly address_line2: string|null;
  readonly postal_code: string|null;
  readonly city: string|null;
  readonly archived_at: string|null;
}

const TYPE_OPTIONS=(
  Object.entries(CUSTOMER_TYPE_LABELS) as [CustomerType,string][]
).map(([value,label]) => ({ value,label }));

export function CustomerDialog({
  open,
  onClose,
  mode,
  defaults,
  existingCustomers,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly mode: "create"|"edit";
  readonly defaults?: CustomerEditDefaults;
  /** Active customers in the tenant — used for the non-blocking duplicate-like check. */
  readonly existingCustomers: readonly CustomerListItem[];
}) {
  // Session and attempt ownership outlive the body reopen key. No private value is stored.
  const [session,setSession]=useState<Session|null>(null);
  const liveAttemptRef=useRef<symbol|null>(null);
  const [busy,setBusy]=useState(false);
  const [closeRequest,setCloseRequest]=useState(0);
  const key=`${mode}:${defaults?.id??"new"}`;
  return (
    <Dialog open={open} onClose={() => setCloseRequest((n) => n+1)} busy={busy}
      title={mode==="create"? "Ny kund":"Redigera kund"}>
      <CustomerDialogBody key={`${open}:${key}`} sessionKey={key} savedSession={session} onSessionChange={setSession} liveAttemptRef={liveAttemptRef}
        closeRequest={closeRequest} onBusy={setBusy} onClose={onClose} mode={mode}
        defaults={defaults} existingCustomers={existingCustomers} />
    </Dialog>
  );
}

type Session={ key: string; baseline?: CustomerEditDefaults; values: Record<string,string>; };
type NavigationEvent=Event&{ canIntercept: boolean; destination: { url: string; key: string ;}; navigationType: string; };
type NavigationSurface=EventTarget&{ entries(): { key: string ;}[]; traverseTo(key: string): unknown; };

function CustomerDialogBody({ onClose,onBusy,mode,defaults: incoming,existingCustomers,sessionKey,savedSession,onSessionChange,liveAttemptRef,closeRequest }: {
  readonly onClose: () => void; readonly onBusy: (busy: boolean) => void;
  readonly mode: "create"|"edit"; readonly defaults?: CustomerEditDefaults;
  readonly existingCustomers: readonly CustomerListItem[]; readonly sessionKey: string;
  readonly savedSession: Session|null; readonly onSessionChange: (value: Session|null) => void; readonly liveAttemptRef: React.RefObject<symbol|null>;
  readonly closeRequest: number;
}) {
  const router=useRouter();
  const [defaults,setDefaults]=useState(() => savedSession?.key===sessionKey? savedSession.baseline:incoming);
  const [state,setState]=useState<CrmActionState>(CRM_ACTION_INITIAL);
  const [pending,setPending]=useState(false);
  const authorityDenied=["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","TENANT_ACCESS_DENIED","PERMISSION_DENIED"].includes(state.code??"");
  const [safety,setSafety]=useState<"clear"|"unconfirmed"|"unavailable">("unavailable");
  const [unknown,setUnknown]=useState(false);
  const [decision,setDecision]=useState<null|(() => void)>(null);
  const [refreshing,setRefreshing]=useState(false);
  const [refreshConsent,setRefreshConsent]=useState(false);
  const [reviewRequired,setReviewRequired]=useState(false);
  const [refreshPending,startRefresh]=useTransition();
  const refreshOrigin=useRef<CustomerEditDefaults|undefined>(undefined);
  const refreshStarted=useRef(false);
  const refreshReset=useRef(false);
  const refreshDiscarded=useRef(false);
  const [type,setType]=useState<CustomerType>((savedSession?.key===sessionKey? savedSession.values.customer_type as CustomerType:undefined)??defaults?.customer_type??"private");
  const [name,setName]=useState(savedSession?.key===sessionKey? savedSession.values.display_name??defaults?.display_name??"":defaults?.display_name??"");
  const formRef=useRef<HTMLFormElement>(null);
  const mounted=useRef(true);
  const inFlight=useRef(false);
  const dirty=useRef(false);
  const initialValues=useRef<Record<string,string>>({});
  const allowReset=useRef(false);
  const decisionReturnRef=useRef<HTMLElement|null>(null);
  const allowedDeparture=useRef(false);
  const lastCloseRequest=useRef(closeRequest);
  const action=mode==="create"? createCustomerAction:updateCustomerAction;
  const checkSafety=useCallback(() => {
    try { setSafety(customerSubmissionSafety(window.sessionStorage)); }
    catch { setSafety("unavailable"); }
  },[]);
  useEffect(() => {
    mounted.current=true;
    if(formRef.current) initialValues.current=Object.fromEntries([...formRef.current.elements]
      .filter((control): control is HTMLInputElement|HTMLSelectElement => control instanceof HTMLInputElement||control instanceof HTMLSelectElement)
      .filter((control) => control.name&&control.name!=="expected_customer").map((control) => [control.name,control.value]));
    queueMicrotask(() => { if(mounted.current) checkSafety(); });
    return () => { mounted.current=false; };
  },[checkSafety]);
  useEffect(() => {
    if(refreshPending) refreshStarted.current=true;
    if(!refreshing||refreshPending||!refreshStarted.current||refreshReset.current) return;
    if(!incoming||incoming===refreshOrigin.current) {
      inFlight.current=false; setRefreshing(false); onBusy(false);
      setState((previous) => ({...previous,formError:"Inga aktuella uppgifter bekräftades. Utkastet är kastat. Försök hämta igen eller använd sidans eller webbläsarens försök igen."}));
      return;
    }
    // Transition completion plus a new checked-read identity permits explicit abandonment.
    refreshReset.current=true;
    setDefaults(incoming); setType(incoming.customer_type); setName(incoming.display_name); setState(CRM_ACTION_INITIAL);
    onSessionChange({key:sessionKey,baseline:incoming,values:{}});
  },[incoming,refreshPending,refreshing,onBusy,onSessionChange,sessionKey]);
  useLayoutEffect(() => {
    if(!refreshReset.current) return;
    allowReset.current=true;
    try { formRef.current?.reset(); } finally { allowReset.current=false; }
    if(formRef.current) initialValues.current=Object.fromEntries([...formRef.current.elements]
      .filter((control): control is HTMLInputElement|HTMLSelectElement => control instanceof HTMLInputElement||control instanceof HTMLSelectElement)
      .filter((control) => control.name&&control.name!=="expected_customer").map((control) => [control.name,control.value]));
    refreshReset.current=false; refreshDiscarded.current=false; dirty.current=false; inFlight.current=false;
    setRefreshing(false); setReviewRequired(false); onBusy(false);
  },[defaults,onBusy]);
  const refreshCheckedFacts=() => {
    if(inFlight.current||unknown||safety!=="clear"||authorityDenied) return;
    if(!navigator.onLine) {
      setRefreshConsent(false);
      setState((previous) => ({...previous,formError:"Anslutning krävs. Ditt utkast är kvar och inga aktuella uppgifter har hämtats. Försök igen när du är ansluten."}));
      return;
    }
    setRefreshConsent(false); dirty.current=false; onSessionChange(null); refreshDiscarded.current=true; setReviewRequired(true);
    refreshOrigin.current=incoming; refreshStarted.current=false; inFlight.current=true;
    setRefreshing(true); onBusy(true);
    startRefresh(() => router.refresh());
  };
  const remember=() => {
    if(!formRef.current) return;
    const values: Record<string,string>={};
    for(const [key,value] of new FormData(formRef.current)) {
      if(typeof value==="string"&&key!=="expected_customer"&&key!=="id") values[key]=value;
    }
    onSessionChange({ key: sessionKey,baseline: defaults,values });
    dirty.current=[...new FormData(formRef.current)].some(([key,value]) => key!=="expected_customer"&&typeof value==="string"&&value!==initialValues.current[key]);
  };
  const abandon=useCallback((leave: () => void) => {
    if(inFlight.current) return;
    if(dirty.current||unknown) { decisionReturnRef.current=document.activeElement as HTMLElement|null; setDecision(() => leave); }
    else leave();
  },[unknown]);
  useEffect(() => {
    if(lastCloseRequest.current===closeRequest) return;
    lastCloseRequest.current=closeRequest;
    queueMicrotask(() => { if(mounted.current) abandon(onClose); });
  },[closeRequest,abandon,onClose]);
  useEffect(() => {
    const beforeUnload=(event: BeforeUnloadEvent) => {
      if(dirty.current||inFlight.current&&!refreshDiscarded.current||unknown) { event.preventDefault(); event.returnValue=""; }
    };
    const click=(event: MouseEvent) => {
      const anchor=(event.target as Element)?.closest?.("a[href]") as HTMLAnchorElement|null;
      if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey
        ||anchor.target&&anchor.target!=="_self"||anchor.origin!==location.origin||anchor.hasAttribute("download")) return;
      if(anchor.pathname===location.pathname&&anchor.search===location.search) return;
      if(!dirty.current&&!unknown&&!inFlight.current) return;
      event.preventDefault(); event.stopPropagation();
      abandon(() => { allowedDeparture.current=true; router.push(anchor.href); });
    };
    const navigation=(window as unknown as { navigation?: NavigationSurface ;}).navigation;
    const navigate=(raw: Event) => {
      const event=raw as NavigationEvent;
      if(allowedDeparture.current) { allowedDeparture.current=false; return; }
      if(event.navigationType!=="traverse"||!event.cancelable||!event.canIntercept
        ||(!dirty.current&&!unknown&&!inFlight.current)) return;
      event.preventDefault();
      abandon(() => { allowedDeparture.current=true; navigation?.traverseTo(event.destination.key); });
    };
    window.addEventListener("beforeunload",beforeUnload);
    document.addEventListener("click",click,true);
    navigation?.addEventListener("navigate",navigate);
    return () => { window.removeEventListener("beforeunload",beforeUnload); document.removeEventListener("click",click,true); navigation?.removeEventListener("navigate",navigate); };
  },[abandon,router,unknown]);
  const formAction=async (data: FormData) => {
    if(inFlight.current||unknown||authorityDenied) return;
    remember();
    const invalidEmail=formRef.current?.querySelector<HTMLInputElement>('input[type="email"]');
    if(invalidEmail?.validity.typeMismatch) {
      setState({ ...CRM_ACTION_INITIAL,status: "error",code: "VALIDATION_FAILED",formError: "Kontrollera de markerade uppgifterna.",fieldErrors: { email: "Ange en giltig e-postadress." } });
      invalidEmail.focus(); return;
    }
    if(!navigator.onLine) {
      setState({ ...CRM_ACTION_INITIAL,status: "error",formError: "Anslutning krävs. Uppgifterna är oskickade. Försök igen när du är ansluten." }); return;
    }
    let admitted=false;
    try { admitted=beginCustomerSubmission(window.sessionStorage); } catch { /* No safe storage, no dispatch. */ }
    if(!admitted) { checkSafety(); return; }
    const attempt=Symbol("customer attempt"); liveAttemptRef.current=attempt;
    inFlight.current=true;
    flushSync(() => { setPending(true); onBusy(true); setSafety("unconfirmed"); });
    let result: CrmActionState|undefined;
    try { result=await action(state,data); } catch { /* A transport exception does not prove rollback. */ }
    const current=mounted.current&&liveAttemptRef.current===attempt;
    if(!current) return;
    inFlight.current=false; setPending(false); onBusy(false);
    const matchingSuccess=result?.status==="success"&&typeof result.targetId==="string"
      &&(mode==="create"||result.targetId===defaults?.id);
    if(!result||result.code==="SERVER_ERROR"||result.status==="success"&&!matchingSuccess) {
      setUnknown(true); setState({ ...CRM_ACTION_INITIAL,status: "error",formError: "Resultatet är obekräftat. Ditt utkast är inte bekräftat sparat. Spara inte igen innan utfallet har kunnat bekräftas." });
      return;
    }
    let cleared=false;
    try { cleared=finishCustomerSubmission(window.sessionStorage); } catch { /* Keep safe blocking. */ }
    liveAttemptRef.current=null; checkSafety();
    if(!cleared) { setUnknown(true); return; }
    if(matchingSuccess) {
      dirty.current=false; onSessionChange(null);
      const destination=decision; setDecision(null); onClose(); destination?.(); return;
    }
    setState(result!);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  };
  const dupNames=
    mode==="create"? findDuplicateLikeNames(name,existingCustomers):[];
  const duplicateWarning=
    dupNames.length>0
      ? `En aktiv kund med namnet "${dupNames[0]}" finns redan. Du kan ändå spara om detta är en annan kund.`
      :null;

  // Echo-back values from a failed submit take precedence over the initial defaults.
  const v=(field: string,fallback: string|null|undefined): string =>
    state.values[field]??(savedSession?.key===sessionKey? savedSession.values[field]:undefined)??fallback??"";

  return (
    <form ref={formRef} action={formAction} onReset={(event) => { if(!allowReset.current) event.preventDefault(); }} onInput={remember} onChange={remember} className="flex flex-col gap-4" noValidate>
      <FormErrorSummary message={state.formError} fieldErrors={state.fieldErrors} />
      {(safety!=="clear"&&!pending||unknown)&&<p role="alert" className="rounded-control bg-warn-surface p-3 text-body text-warn-text">Ett resultat är obekräftat eller säker lagring är inte tillgänglig. Det går inte att säkert spara en ny kundåtgärd i den här fliken.</p>}
      {state.code==="COMMAND_CONFLICT"&&<div className="rounded-control bg-warn-surface p-3 text-body text-warn-text"><p>Kundens uppgifter har ändrats. {reviewRequired?"Utkastet är kastat. Inga nya uppgifter är bekräftade.":"Ditt utkast är oskickat."} Hämta aktuella uppgifter och granska dem innan du redigerar igen.</p><button type="button" disabled={refreshing||pending||unknown||safety!=="clear"} className="min-h-control-lg underline" onClick={() => {decisionReturnRef.current=document.activeElement as HTMLElement|null;setRefreshConsent(true);}}>Hämta aktuella uppgifter och granska</button></div>}
      {refreshConsent&&<DirtyDecision pending={false} blocked={false} refresh
        onCancel={() => {setRefreshConsent(false);requestAnimationFrame(() => decisionReturnRef.current?.focus());}}
        onDiscard={refreshCheckedFacts} />}
      {decision&&<DirtyDecision pending={pending} blocked={safety!=="clear"||unknown||authorityDenied}
        onCancel={() => { setDecision(null); requestAnimationFrame(() => decisionReturnRef.current?.focus()); }}
        onDiscard={() => { dirty.current=false; onSessionChange(null); const leave=decision; setDecision(null); onClose(); leave(); }} />}
      {pending&&<p role="status" className="text-body text-text-secondary">Sparar kunden…</p>}
      {refreshing&&<p role="status" className="text-body text-text-secondary">Utkastet är kastat. Hämtar aktuella uppgifter… Om hämtningen misslyckas kan du behöva använda sidans eller webbläsarens försök igen. Inga nya uppgifter är sparade.</p>}
      <fieldset disabled={pending||refreshing||reviewRequired} inert={Boolean(decision)||refreshConsent} className="flex min-w-0 flex-col gap-4 border-0 p-0">

      {mode==="edit"&&defaults&&(
        <><input type="hidden" name="id" value={defaults.id} /><input type="hidden" name="expected_customer" value={JSON.stringify(defaults)} /></>
      )}

      {mode==="create"? (
        <SelectField
          name="customer_type"
          label="Kundtyp"
          required
          options={TYPE_OPTIONS}
          defaultValue={type}
          onChange={(val) => setType(val as CustomerType)}
          error={state.fieldErrors.customer_type}
        />
      ):(
        <div className="flex flex-col gap-1">
          <span className="text-label text-text-primary">Kundtyp</span>
          <p className="text-body text-text-secondary">
            {CUSTOMER_TYPE_LABELS[type]}
            <span className="ml-2 text-caption text-text-tertiary">
              (kundtyp kan inte ändras)
            </span>
          </p>
        </div>
      )}

      <DisplayNameField
        defaultValue={v("display_name",defaults?.display_name)}
        error={state.fieldErrors.display_name}
        // Watch the value live (create only) so the duplicate-like advisory updates.
        onChange={mode==="create"? setName:undefined}
      />

      {duplicateWarning&&<FormWarning message={duplicateWarning} />}

      {type==="private"? (
        <TextField
          name="personnummer"
          label="Personnummer"
          required={mode==="create"}
          defaultValue={v("personnummer",defaults?.personnummer)}
          error={state.fieldErrors.personnummer}
          autoComplete="off"
        />
      ):(
        <TextField
          name="org_nr"
          label="Organisationsnummer"
          required={mode==="create"}
          defaultValue={v("org_nr",defaults?.org_nr)}
          error={state.fieldErrors.org_nr}
        />
      )}

      <TextField
        name="contact_name"
        label="Kontaktperson"
        defaultValue={v("contact_name",defaults?.contact_name)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name="email"
          label="E-post"
          type="email"
          defaultValue={v("email",defaults?.email)}
          error={state.fieldErrors.email}
        />
        <TextField
          name="phone"
          label="Telefon"
          defaultValue={v("phone",defaults?.phone)}
          error={state.fieldErrors.phone}
        />
      </div>
      <TextField
        name="address_line1"
        label="Adress"
        defaultValue={v("address_line1",defaults?.address_line1)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name="postal_code"
          label="Postnummer"
          defaultValue={v("postal_code",defaults?.postal_code)}
        />
        <TextField
          name="city"
          label="Ort"
          defaultValue={v("city",defaults?.city)}
        />
      </div>

      <DialogActions onClose={() => abandon(onClose)} pending={pending} blocked={safety!=="clear"||unknown||refreshing||authorityDenied} />
      </fieldset>
    </form>
  );
}

/**
 * The display-name field, with an optional live `onChange` so the parent can run the
 * duplicate-like advisory as the user types. It is `defaultValue`-seeded (uncontrolled
 * for form submission / input preservation), but emits its value on each input event.
 */
function DisplayNameField({
  defaultValue,
  error,
  onChange,
}: {
  readonly defaultValue: string;
  readonly error?: string|null;
  readonly onChange?: (value: string) => void;
}) {
  return (
    <div onInput={(e) => onChange?.((e.target as HTMLInputElement).value)}>
      <TextField
        name="display_name"
        label="Visningsnamn"
        required
        defaultValue={defaultValue}
        error={error}
      />
    </div>
  );
}

/** Focus stays in the pending abandonment decision until a named choice. */
function DirtyDecision({pending,blocked,onCancel,onDiscard,refresh=false}: {
  readonly pending:boolean; readonly blocked:boolean; readonly onCancel:()=>void; readonly onDiscard:()=>void;
  readonly refresh?:boolean;
}) {
  const panelRef=useRef<HTMLDivElement>(null);
  useEffect(() => { if(pending) panelRef.current?.focus(); else panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); },[pending]);
  return <div ref={panelRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-label="Osparade ändringar"
    className="rounded-card border border-border-strong bg-sunken p-4" onKeyDown={(event) => {
      if(event.key==="Escape") { event.preventDefault(); event.stopPropagation(); if(!pending) onCancel(); return; }
      if(event.key!=="Tab") return;
      const controls=[...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
      if(controls.length===0) { event.preventDefault(); event.stopPropagation(); return; }
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first) { event.preventDefault(); last?.focus(); }
      else if(!event.shiftKey&&document.activeElement===last) { event.preventDefault(); first?.focus(); }
      event.stopPropagation();
    }}>
    <p>{refresh?"Vill du kasta det osparade utkastet och hämta aktuella kunduppgifter? Utkastet kastas. Om hämtningen misslyckas kan sidans eller webbläsarens försök igen behövas. Inga uppgifter sparas av hämtningen.":"Du har osparade eller obekräftade uppgifter. Vill du fortsätta?"}</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="min-h-control-lg rounded-control border border-border-default px-3" disabled={pending} onClick={onCancel}>Fortsätt redigera</button>
      <button type="button" className="min-h-control-lg rounded-control border border-border-default px-3" disabled={pending} onClick={onDiscard}>{refresh?"Kasta utkast och hämta aktuella uppgifter":"Kasta ändringar"}</button>
      {!refresh&&<button type="submit" className="min-h-control-lg rounded-control bg-ink px-3 text-white disabled:bg-sunken disabled:text-text-disabled" disabled={pending||blocked}>Spara och fortsätt</button>}
    </div>
  </div>;
}

export function DialogActions({
  onClose,
  pending,
  blocked=false,
}: {
  readonly onClose: () => void;
  readonly pending: boolean;
  readonly blocked?: boolean;
}) {
  return (
    <div className="mt-2 flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={pending}
        className="min-h-control-lg rounded-control border border-border-default px-4 py-2 text-label text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-ink"
      >
        Avbryt
      </button>
      <button
        type="submit"
        disabled={pending||blocked}
        className="min-h-control-lg rounded-control bg-ink px-4 py-2 text-label text-white hover:bg-n-800 focus-visible:outline-2 focus-visible:outline-ink disabled:bg-sunken disabled:text-text-disabled"
      >
        {pending? "Sparar…":"Spara"}
      </button>
    </div>
  );
}
