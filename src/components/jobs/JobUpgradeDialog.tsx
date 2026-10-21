"use client";
import { useRef, useState } from "react";
import { Dialog } from "@/components/crm/Dialog";
import { refetchJobMembersAction, upgradeJobToProjektAction } from "@/features/jobs/actions";
import { canDismissJobUpgradeDraft, createJobUpgradeDraft, transitionJobUpgradeDraft } from "@/features/jobs/job-upgrade-domain";
const button="min-h-11 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";
export function JobUpgradeDialog({jobId,expectedState,type}:{readonly jobId:string;readonly expectedState:string;readonly type:"order"|"projekt"}) {
  const [open,setOpen]=useState(false),[consent,setConsent]=useState(false),[error,setError]=useState<string|null>(null);
  const [state,setState]=useState(()=>createJobUpgradeDraft(jobId));
  const [stale,setStale]=useState(false);
  const baseline=useRef(expectedState);
  const request=useRef<{jobId:string;commandId:string;expectedState:string}|null>(null);
  const operation=useRef<"save"|"refetch"|null>(null);
  const generation=useRef(0);
  const busy=state.status === "submitting" || state.status === "refetching";
  function close() {
    if(operation.current || !canDismissJobUpgradeDraft(state)) return;
    generation.current+=1;request.current=null;setState(createJobUpgradeDraft(jobId));setConsent(false);setError(null);setStale(false);setOpen(false);
  }
  async function refetch() {
    if(operation.current || !stale || state.unresolved || state.status === "persisted") return;
    operation.current="refetch";const currentGeneration=++generation.current;
    const next=transitionJobUpgradeDraft(state,{type:"begin-refetch"});setState(next);
    try {
      const current=await refetchJobMembersAction(jobId);
      if(generation.current !== currentGeneration) return;
      if(!current.ok) {setError(current.message);setState(value=>transitionJobUpgradeDraft(value,{type:"refetch-failed",revision:next.revision}));return;}
      baseline.current=current.projection.expectedState;request.current=null;setConsent(false);setStale(false);setError(null);
      setState(value=>transitionJobUpgradeDraft(value,{type:"refetched",revision:next.revision}));
    } catch {
      if(generation.current === currentGeneration) {setError("Uppgifterna kunde inte hämtas. Behåll bekräftelsen och försök igen.");setState(value=>transitionJobUpgradeDraft(value,{type:"refetch-failed",revision:next.revision}));}
    } finally {if(generation.current === currentGeneration)operation.current=null;}
  }
  async function save() {
    if(operation.current || !consent || busy || state.status === "persisted") return;
    operation.current="save";const currentGeneration=++generation.current;
    request.current ??= {jobId,commandId:crypto.randomUUID(),expectedState:baseline.current};
    const next=transitionJobUpgradeDraft(state,{type:state.status === "failed" ? "retry":"submit",commandId:request.current.commandId});
    setState(next);setError(null);
    const identity={commandId:request.current.commandId,jobId,revision:next.submission?.revision ?? next.revision};
    const submitted=request.current;
    try {const result=await upgradeJobToProjektAction(submitted);
      if(generation.current !== currentGeneration || request.current !== submitted) return;
      if(result.ok) setState(value=>transitionJobUpgradeDraft(value,{type:"confirmed",...identity}));
      else {setStale(result.code === "PREVIEW_STALE");setError(result.message);setState(value=>transitionJobUpgradeDraft(value,{type:"failed",...identity,code:result.code}));}
    } catch {if(generation.current === currentGeneration) {setError("Resultatet är okänt. Försök igen med samma bekräftelse.");setState(value=>transitionJobUpgradeDraft(value,{type:"failed",...identity,code:"SERVER_ERROR"}));}}
    finally {if(generation.current === currentGeneration)operation.current=null;}
  }
  return <>{type === "order" && <button type="button" data-testid="job-upgrade-open" className={button} onClick={()=>{if(!request.current)baseline.current=expectedState;setOpen(true);}}>Uppgradera till projekt</button>}
    <Dialog open={open} onClose={close} title="Uppgradera till projekt" busy={busy || !!state.unresolved}>
      <div data-testid="job-upgrade-dialog" className="space-y-4">
        <p>Ändringen är enkelriktad: ett projekt kan inte ändras tillbaka till order. Jobbets identitet, status och kopplingar behålls.</p>
        <p>Medlemmar och arbetsorder finns redan för både order och projekt. Betalningsplan är inte tillgänglig; ekonomi kräver separat behörighet och funktionalitet.</p>
        {state.status === "persisted" ? <p role="status" data-testid="job-upgrade-save-status">Sparad i systemet. Jobbet är nu ett projekt.</p> : <>
          <label className="flex min-h-11 items-center gap-3"><input type="checkbox" data-testid="job-upgrade-consent" checked={consent} disabled={busy || !!state.unresolved} onChange={e=>setConsent(e.target.checked)}/>Jag bekräftar uppgraderingen</label>
          {error && <p role="alert" data-testid="job-upgrade-error">{error}</p>}
          {stale && <button type="button" className={button} data-testid="job-upgrade-refetch" disabled={busy || !!state.unresolved} onClick={refetch}>Hämta aktuellt jobb och bekräfta igen</button>}
          <button type="button" className={button} data-testid={state.status === "failed" ? "job-upgrade-retry":"job-upgrade-confirm"} disabled={!consent || busy} onClick={save}>{state.status === "submitting" ? "Sparar…":state.status === "failed" ? "Försök igen":"Uppgradera"}</button>
        </>}
      </div>
    </Dialog></>;
}
