"use client";

/**
 * Archive affordance (Story 3.2, Task 4.3) — soft-delete via the 3.1 archive commands.
 *
 * The UI offers "Arkivera", NEVER "Radera/Delete" (no hard delete exists or is granted —
 * the migration withholds DELETE; archive sets `archived_at`). It confirms the action
 * (it removes the row from the default active list), submits the id-only form to the
 * matching archive server action, and on success calls `onArchived` so the caller can
 * refresh/navigate (the row then leaves the active list).
 *
 * Customer transport/server errors remain unconfirmed and block replay. Inherited
 * facility/contact errors retain their existing action contract. Authority stays server-side.
 */
import { useActionState,useEffect,useRef,useState } from "react";
import { flushSync } from "react-dom";
import {
  archiveContactAction,
  archiveCustomerAction,
  archiveFacilityAction,
} from "@/features/crm/actions";
import { beginCustomerSubmission,customerSubmissionSafety,finishCustomerSubmission } from "./customer-presentation";
import { CRM_ACTION_INITIAL,type CrmActionState } from "@/features/crm/action-state";

/** Owned by the detail view, so revalidation may remove this child without ending its attempt. */
export interface CustomerArchiveView {
  capture(): {isCurrent(): boolean;canContinue(): boolean;setPending(pending: boolean): void};
}

type ArchiveKind="customer"|"facility"|"contact";

const ACTION_BY_KIND={
  customer: archiveCustomerAction,
  facility: archiveFacilityAction,
  contact: archiveContactAction,
} as const;

export function ArchiveButton({
  kind,
  id,
  customerId,
  label,
  confirmMessage,
  onArchived,
  compact=false,
  customerView,
}: {
  readonly kind: ArchiveKind;
  readonly id: string;
  /** The parent customer id (facility/contact) for revalidation targeting. */
  readonly customerId?: string;
  /** Accessible name for the control (icon-only when compact). */
  readonly label: string;
  readonly confirmMessage: string;
  readonly onArchived: () => void;
  readonly compact?: boolean;
  readonly customerView?: CustomerArchiveView;
}) {
  const owner=useRef({ kind,id });
  const flight=useRef(false);
  const alive=useRef(true);
  useEffect(() => { alive.current=true; owner.current={ kind,id }; return () => { alive.current=false; }; },[kind,id]);
  const [blocked,setBlocked]=useState(kind==="customer");
  const [unknown,setUnknown]=useState(false);
  useEffect(() => {
    if(kind!=="customer") return;
    queueMicrotask(() => {
      if(!alive.current) return;
      try { setBlocked(customerSubmissionSafety(window.sessionStorage)!=="clear"); }
      catch { setBlocked(true); }
    });
  },[kind]);
  const [state,formAction,pending]=useActionState(async (previous: CrmActionState,data: FormData): Promise<CrmActionState> => {
    if(flight.current||unknown||kind==="customer"&&["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","TENANT_ACCESS_DENIED","PERMISSION_DENIED"].includes(previous.code??"")) return previous;
    let ownsHint=false;
    if(kind==="customer") {
      try { ownsHint=beginCustomerSubmission(window.sessionStorage); } catch { /* Block unsafe dispatch. */ }
      if(!ownsHint) { setBlocked(true); return previous; }
    }
    flight.current=true;
    const originatingView=customerView?.capture();
    if(kind==="customer") flushSync(() => originatingView?.setPending(true));
    let result: CrmActionState|undefined;
    try { result=await ACTION_BY_KIND[kind](previous,data); } catch { /* Unknown transport. */ }
    flight.current=false;
    const stillCurrent=kind==="customer"&&originatingView? originatingView.isCurrent():alive.current;
    if(!stillCurrent||owner.current.kind!==kind||owner.current.id!==id) return previous;
    const continueNavigation=originatingView?.canContinue()??true;
    // Keep edit admission closed while the confirmed archive continues to the list.
    if(kind==="customer"&&(!(result?.status==="success"&&result.targetId===id)||!continueNavigation)) originatingView?.setPending(false);
    if(kind==="customer") {
      if(!result||result.code==="SERVER_ERROR"||result.status==="success"&&result.targetId!==id) {
        setUnknown(true); setBlocked(true);
        return { ...CRM_ACTION_INITIAL,status: "error",formError: "Arkiveringens resultat är obekräftat. Försök inte igen innan utfallet har bekräftats." };
      }
      let cleared=false;
      if(ownsHint) { try { cleared=finishCustomerSubmission(window.sessionStorage); } catch { /* Retain block. */ } }
      setBlocked(!cleared);
    }
    if(kind==="customer"&&result?.status==="success"&&result.targetId===id&&continueNavigation) onArchived();
    return result??{ ...CRM_ACTION_INITIAL,status: "error",code: "SERVER_ERROR",formError: "Åtgärden kunde inte bekräftas." };
  },CRM_ACTION_INITIAL);
  const [confirming,setConfirming]=useState(false);

  // On a successful archive, hand control back to the caller (which refreshes/navigates,
  // unmounting or re-rendering this control). Only the parent callback runs here — no
  // local setState in the effect body (the row leaves the active list on revalidation).
  useEffect(() => {
    if(kind!=="customer"&&state.status==="success"&&state.targetId===id&&owner.current.kind===kind&&owner.current.id===id) onArchived();
  },[state.status,state.targetId,id,kind,onArchived]);

  if(!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={label}
        className={
          compact
            ? "min-h-control-lg px-2 text-label text-risk-text hover:underline focus-visible:outline-2 focus-visible:outline-ink"
            :"min-h-control-lg rounded-control border border-border-default px-3 py-2 text-label text-risk-text hover:bg-risk-surface focus-visible:outline-2 focus-visible:outline-ink"
        }
      >
        Arkivera
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      {customerId&&<input type="hidden" name="customer_id" value={customerId} />}
      {kind==="customer"&&blocked&&<p role="alert" className="text-caption text-warn-text">Resultatet är obekräftat eller det går inte att säkert spara i den här fliken.</p>}
      <p role="status" className="text-caption text-text-secondary">
        {confirmMessage}
      </p>
      {state.status==="error"&&(
        <p role="alert" className="text-caption text-risk-text">
          {state.formError}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="min-h-control-lg rounded-control border border-border-default px-3 py-2 text-label text-text-secondary hover:bg-hover focus-visible:outline-2 focus-visible:outline-ink"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={pending||blocked||kind==="customer"&&["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","TENANT_ACCESS_DENIED","PERMISSION_DENIED"].includes(state.code??"")}
          aria-label={label}
          className="min-h-control-lg rounded-control bg-risk-text px-3 py-2 text-label text-white focus-visible:outline-2 focus-visible:outline-ink disabled:bg-sunken disabled:text-text-disabled"
        >
          {pending? "Arkiverar…":"Arkivera"}
        </button>
      </div>
    </form>
  );
}
