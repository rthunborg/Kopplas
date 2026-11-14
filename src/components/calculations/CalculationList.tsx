"use client";

/**
 * Calculation list (Story 5.2, Task 1.3 / AC1) — the thin `/calculations` index island.
 *
 * Renders the tenant's ACTIVE calculations (title + status + customer + updated), each row
 * linking to the editor at `/calculations/[id]`, and a `Ny kalkyl` create affordance (a calc
 * always needs a customer, so create requires selecting one). The create form wires to the
 * `createCalculationAction` server action → the 5.1 `createCalculation` command; on success
 * it navigates to the new calc's editor. Validation errors preserve input (AC2) and are
 * field-associated (aria-invalid/aria-describedby).
 *
 * The list is a thin index — the EDITOR is the heart of this story. No deferred-workflow
 * label appears; no new nav item (Kalkyler already exists in the seven-item shell).
 */
import { useActionState, useEffect, useState, useRef, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormErrorSummary, SelectField, TextField } from "@/components/crm/FormField";
import { calculationEditorScopeAction, reconcileCalculationEditorOperationAction, createCalculationAction } from "@/features/calculations/actions";
import { editorHandle, readEditorHandle, retainEditorIntent, editorRequestFingerprint } from "@/features/calculations/editor-operation";
import {
  CALC_ACTION_INITIAL,
  isRetryableCalcError,
} from "@/features/calculations/action-state";
import { preflightEditorForm } from "@/features/calculations/form-parsing";
import type { CalculationListRow } from "@/features/calculations/read";

/** Swedish labels for the calc lifecycle status (presentational only). */
const STATUS_LABELS: Record<string, string> = {
  draft: "Utkast",
  ready: "Klar",
  archived: "Arkiverad",
};

export interface CustomerOption {
  readonly id: string;
  readonly label: string;
}

export function CalculationList({
  rows,
  loadError,
  customerOptions,
}: {
  readonly rows: readonly CalculationListRow[];
  readonly loadError: string | null;
  readonly customerOptions: readonly CustomerOption[];
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const createOperation = useEditorOperation(createCalculationAction, CALC_ACTION_INITIAL, "new/calculation", form => ({ version: 1, form: "calculation", customer_id: form.get("customer_id"), facility_id: form.get("facility_id") || null, contact_id: form.get("contact_id") || null }));
  const [state, formAction, pending] = [createOperation.state, createOperation.action, createOperation.pending];

  // On a successful create, navigate to the new calc's editor.
  useEffect(() => {
    if (state.status === "success" && state.targetId) {
      router.push(`/calculations/${state.targetId}`);
    }
  }, [state.status, state.targetId, router]);

  const isMine = state.form === "calculation";
  const v = (field: string, fallback: string): string =>
    (isMine && state.values[field]) || fallback;
  const err = (field: string): string | undefined =>
    isMine ? state.fieldErrors[field] : undefined;
  const retryable = isMine && isRetryableCalcError(state);

  return (
    <section
      data-testid="calculation-list"
      aria-labelledby="calculations-heading"
      className="flex flex-col gap-6 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 id="calculations-heading" className="text-2xl font-semibold text-zinc-900">
          Kalkyler
        </h1>
        <button
          type="button"
          data-testid="new-calculation"
          onClick={() => setShowCreate((s) => !s)}
          aria-expanded={showCreate}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Ny kalkyl
        </button>
      </div>

      {loadError && (
        <p
          role="alert"
          data-testid="calculation-list-error"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {loadError}
        </p>
      )}

      {showCreate && (
        <form {...createOperation.formProps}
          action={formAction}
          data-testid="new-calculation-form"
          className="flex max-w-xl flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4"
          noValidate
        >{createOperation.recovery}
          <FormErrorSummary message={isMine ? state.formError : null} />
          {retryable && (
            <p role="status" className="text-sm text-amber-800">
              Försök igen.
            </p>
          )}
          <TextField
            name="title"
            label="Titel"
            required
            defaultValue={v("title", "")}
            error={err("title")}
          />
          {customerOptions.length === 0 ? (
            <p className="text-sm text-zinc-600">
              Lägg till en kund först under Kunder för att skapa en kalkyl.
            </p>
          ) : (
            <SelectField
              name="customer_id"
              label="Kund"
              required
              defaultValue={v("customer_id", "")}
              error={err("customer_id")}
              options={[
                { value: "", label: "Välj kund…" },
                ...customerOptions.map((c) => ({ value: c.id, label: c.label })),
              ]}
            />
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending || customerOptions.length === 0}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60"
            >
              {pending ? "Skapar…" : "Skapa kalkyl"}
            </button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <p data-testid="calculation-list-empty" className="text-sm text-zinc-600">
          Inga kalkyler ännu. Skapa din första kalkyl med “Ny kalkyl”.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/calculations/${row.id}`}
                data-testid="calculation-list-row"
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 px-4 py-3 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">
                    {row.title}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {row.customer_display_name ?? "—"}
                  </span>
                </div>
                <span className="text-xs font-medium text-zinc-500">
                  {STATUS_LABELS[row.status] ?? row.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


type EditorActionState = { readonly status: "idle" | "success" | "error" | "unknown"; readonly targetId: string | null; readonly formError: string | null; readonly operationId?: string | null };
/** Six-host connected controller. Reentry is explicit and bound to original facts. */
export function useEditorOperation<S extends EditorActionState>(
  action: (previous: S, form: FormData) => Promise<S>, initial: S, formKey: string,
  expected: (form: FormData) => Record<string, unknown>,
) {
  const [scope, setScope] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recoverable, setRecoverable] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hasOriginalRequest, setHasOriginalRequest] = useState(false);
  const [recoveryPending, setRecoveryPending] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const handle = useRef<string | null>(null), original = useRef<FormData | null>(null);
  const replayContext = useRef<{ requestFingerprint: string } | null>(null);
  const busy = useRef(false), revision = useRef(0), submitting = useRef(false);
  const formElement = useRef<HTMLFormElement | null>(null);
  const draftExpected = useRef<Record<string, unknown> | null>(null);
  const currentKey = useRef<string | null>(null);
  const originalRevision = useRef<number | null>(null);
  const [resultLink, setResultLink] = useState<string | null>(null);
  const key = scope ? `kopplas/editor/v1/${scope}/${formKey}` : null;
  useEffect(() => { let active = true;
    calculationEditorScopeAction().then(s => { if(active) setScope(s); }).catch(() => { if(active) setNotice("Anslutning krävs för att kontrollera åtgärder."); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    currentKey.current = key;
    if (!key || !scope) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { const raw = sessionStorage.getItem(key), saved = raw ? readEditorHandle(raw, `${scope}/${formKey}`) : null;
        handle.current = saved?.operationId ?? null; setRecoverable(Boolean(saved));
        replayContext.current = saved?.replay ?? null;
        setHasOriginalRequest(false); original.current = null; originalRevision.current = null;
        if (saved) setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen.");
      } catch { setNotice("Sessionslagring krävs för att bevara åtgärdens identitet."); }
    });
    return () => { active = false; };
  }, [key, scope, formKey]);
  function clearOperation() { originalRevision.current = null; handle.current = null; original.current = null; replayContext.current = null; setHasOriginalRequest(false); setRecoverable(false); setChecked(false); if (key) { try { sessionStorage.removeItem(key); } catch { /* A stale handle remains safely reconcilable. */ } } }
  function confirmMatchingDraft(submittedRevision: number | null) {
    // Operation A's proof cannot change unsent draft B's original facts.
    if (submittedRevision !== null && submittedRevision === revision.current) {
      draftExpected.current = null; setHasDraftChanges(false);
    }
  }
  const [state, dispatch, actionPending] = useActionState<S, FormData>(async (previous: S, form: FormData): Promise<S> => {
    if (busy.current) { submitting.current = false; return previous; }
    if (!navigator.onLine || !key || !scope) { setNotice("Anslutning krävs. Uppgifterna är inte skickade."); submitting.current = false; return { ...previous, status: "error", targetId: null }; }
    try {
      const raw = sessionStorage.getItem(key), saved = raw ? readEditorHandle(raw, `${scope}/${formKey}`) : null;
      if (!handle.current && saved) { handle.current = saved.operationId; replayContext.current = saved.replay ?? null; setRecoverable(true); }
    } catch { setNotice("Åtgärden skickades inte. Identiteten kunde inte kontrolleras."); submitting.current = false; return { ...previous, status: "idle", targetId: null }; }
    const submitted = new FormData(); for (const [k,v] of form.entries()) if (!k.startsWith("$ACTION_")) submitted.append(k,v);
    if (handle.current) {
      try {
        if (checked && !original.current && replayContext.current) {
          submitted.set("operation_id", handle.current);
          submitted.set("expected", JSON.stringify((formKey === "new/calculation" ? null : draftExpected.current) ?? expected(form)));
          if (await editorRequestFingerprint(submitted) === replayContext.current.requestFingerprint) {
            original.current = submitted; originalRevision.current = revision.current; setHasOriginalRequest(true);
            setNotice("Underlaget matchar den ursprungliga åtgärden. Välj Försök samma åtgärd igen för att skicka det.");
          } else setNotice("Underlaget matchar inte den ursprungliga åtgärden. Behåll samma ursprungliga uppgifter och kontrollera igen.");
        } else setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen.");
      } catch { setNotice("Det ursprungliga underlaget kunde inte kontrolleras. Ingen åtgärd skickades."); }
      submitting.current = false; return { ...previous, status: "unknown", targetId: null };
    }
    // A NEW calculation's selections are editable until this actual submission.
    // Existing entities retain the server-projected facts from the first edit.
    const operationId = crypto.randomUUID();
    submitted.set("operation_id", operationId);
    submitted.set("expected", JSON.stringify((formKey === "new/calculation" ? null : draftExpected.current) ?? expected(form)));
    const preflight = preflightEditorForm(submitted);
    if (!preflight.ok) {
      setNotice("Kontrollera uppgifterna. Åtgärden har inte skickats."); submitting.current = false;
      return { ...initial, status: "error", targetId: null, code: "VALIDATION_FAILED", form: preflight.form, formError: "Kontrollera uppgifterna. Åtgärden har inte skickats.", fieldErrors: preflight.fieldErrors, values: preflight.values };
    }
    const intent = retainEditorIntent(`${scope}/${formKey}`, [...submitted.entries()], operationId);
    const submittedRevision = revision.current, submittedKey = key;
    busy.current = true;
    try {
      const context = { requestFingerprint: await editorRequestFingerprint(submitted) };
      try { sessionStorage.setItem(key, editorHandle(intent, context)); }
      catch { setNotice("Åtgärden skickades inte. Fliken kan inte bevara identiteten."); return { ...previous, status: "idle", targetId: null }; }
      handle.current = operationId; original.current = submitted; originalRevision.current = submittedRevision; replayContext.current = context;
      setHasOriginalRequest(true); setRecoverable(true); setChecked(false);
      const next = await action(previous, submitted);
      if (currentKey.current !== submittedKey) return initial;
      if(next.status === "unknown") { setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen."); return next; }
      clearOperation();
      if(next.status === "success" && submittedRevision !== revision.current) { setNotice("Tidigare åtgärd bekräftad. Dina nya ändringar är inte sparade."); return { ...next, status: "idle", targetId: null }; }
      if (next.status === "success") confirmMatchingDraft(submittedRevision);
      setNotice(null); return next;
    } catch {
      if (currentKey.current !== submittedKey) return initial;
      setNotice(handle.current ? "Resultatet är obekräftat. Kontrollera innan du försöker igen." : "Åtgärden skickades inte. Underlaget kunde inte bevaras.");
      return handle.current ? { ...previous, status: "unknown", operationId, targetId: null } : { ...previous, status: "idle", targetId: null };
    } finally { busy.current = false; submitting.current = false; }
  }, initial as Awaited<S>);
  async function reconcile() { if(!handle.current || busy.current) return; busy.current = true; setRecoveryPending(true);
    try { const proof = await reconcileCalculationEditorOperationAction(handle.current); setChecked(true);
      if(proof.status === "unconfirmed") { setNotice(original.current ? "Resultatet är fortfarande obekräftat. Du kan försöka samma ursprungliga åtgärd igen." : replayContext.current ? "Resultatet är fortfarande obekräftat. Ange samma ursprungliga uppgifter och välj Spara för att kontrollera underlaget före samma åtgärd." : "Resultatet är fortfarande obekräftat. Det ursprungliga underlaget finns inte kvar i fliken."); return; }
      if (proof.status === "committed" && proof.targetAvailable !== false && proof.targetId) {
        setResultLink(proof.quoteId ? `/quotes/${proof.quoteId}/versions/${proof.targetId}` : formKey === "new/calculation" ? `/calculations/${proof.targetId}` : null);
      }
      setNotice(proof.status === "committed" ? "Den ursprungliga åtgärden är bekräftad. Kontrollera aktuella uppgifter före nya ändringar." : "Åtgärden avvisades. Uppdatera underlaget före en ny åtgärd."); if (proof.status === "committed") confirmMatchingDraft(originalRevision.current); clearOperation();
    } catch { setNotice("Resultatet kunde inte kontrolleras. Försök kontrollera igen."); } finally { busy.current = false; setRecoveryPending(false); }
  }
  async function retry() { if(!checked || !original.current || busy.current) return; busy.current = true; setRecoveryPending(true);
    try { const next = await action(initial, original.current);
      if(next.status === "error") { setNotice(next.formError ?? "Resultatet kunde inte bekräftas. Kontrollera innan du fattar ett nytt beslut."); }
      else if(next.status !== "success") setNotice("Resultatet är fortfarande obekräftat. Kontrollera innan du fattar ett nytt beslut.");
      else { setNotice("Den ursprungliga åtgärden är bekräftad. Nya ändringar är inte sparade."); if(next.targetId) setResultLink("quoteId" in next && typeof next.quoteId === "string" ? `/quotes/${next.quoteId}/versions/${next.targetId}` : formKey === "new/calculation" ? `/calculations/${next.targetId}` : null); confirmMatchingDraft(originalRevision.current); clearOperation(); }
    } catch { setNotice("Resultatet är fortfarande obekräftat."); } finally { busy.current = false; setRecoveryPending(false); }
  }
  function markChanged() {
    revision.current++; setHasDraftChanges(true);
    if (formKey !== "new/calculation" && formElement.current) draftExpected.current ??= expected(new FormData(formElement.current));
  }
  return { state, action: dispatch, pending: actionPending || recoveryPending, hasDraftChanges, markChanged, formProps: {
      ref: formElement,
      "data-editor-ready": Boolean(scope),
      // Explicit transition dispatch avoids React's action-form auto-reset on
      // refused submissions and late results. The live controls stay the draft.
      onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); if (submitting.current || busy.current) return;
        submitting.current = true; const form = new FormData(event.currentTarget);
        startTransition(() => { dispatch(form); });
      },
      onChange: markChanged,
    },
    recovery: <>{notice && <p role="status">{notice}</p>}{resultLink && <Link href={resultLink} className="min-h-control-lg text-text-primary underline">Öppna bekräftat resultat</Link>}{recoverable && <div className="flex flex-wrap gap-2">
      <button type="button" disabled={recoveryPending} className="min-h-control-lg rounded-control border border-border-strong px-4" onClick={() => { void reconcile(); }}>Kontrollera resultat</button>
      {checked && hasOriginalRequest && <button type="button" disabled={recoveryPending} className="min-h-control-lg rounded-control border border-border-strong px-4" onClick={() => { void retry(); }}>Försök samma åtgärd igen</button>}
    </div>}</> };
}
