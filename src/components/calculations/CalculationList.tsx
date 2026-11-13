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
import { useActionState, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormErrorSummary, SelectField, TextField } from "@/components/crm/FormField";
import { calculationEditorScopeAction, reconcileCalculationEditorOperationAction, createCalculationAction } from "@/features/calculations/actions";
import { editorHandle, readEditorHandle, retainEditorIntent } from "@/features/calculations/editor-operation";
import {
  CALC_ACTION_INITIAL,
  isRetryableCalcError,
} from "@/features/calculations/action-state";
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
/** Six-host connected editor plumbing. Only opaque scoped handles survive remount. */
export function useEditorOperation<S extends EditorActionState>(
  action: (previous: S, form: FormData) => Promise<S>, initial: S, formKey: string,
  expected: (form: FormData) => Record<string, unknown>,
) {
  const [scope, setScope] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recoverable, setRecoverable] = useState(false);
  const [checked, setChecked] = useState(false);
  const handle = useRef<string | null>(null), original = useRef<FormData | null>(null);
  const busy = useRef(false), revision = useRef(0);
  const key = scope ? `kopplas/editor/v1/${scope}/${formKey}` : null;
  useEffect(() => { let active = true;
    calculationEditorScopeAction().then(s => { if(active) setScope(s); }).catch(() => { if(active) setNotice("Anslutning krävs för att kontrollera åtgärder."); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (!key || !scope) return;
    try { const raw = sessionStorage.getItem(key), saved = raw ? readEditorHandle(raw, `${scope}/${formKey}`) : null;
      handle.current = saved?.operationId ?? null; setRecoverable(Boolean(saved));
      if (saved) setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen.");
    } catch { setNotice("Sessionslagring krävs för att bevara åtgärdens identitet."); }
  }, [key, scope, formKey]);
  function clear() { handle.current = null; original.current = null; setRecoverable(false); setChecked(false); if (key) sessionStorage.removeItem(key); }
  const [state, dispatch, pending] = useActionState<S, FormData>(async (previous: S, form: FormData): Promise<S> => {
    if (busy.current) return previous;
    if (!navigator.onLine || !key || !scope) { setNotice("Anslutning krävs. Uppgifterna är inte skickade."); return { ...initial, status: "error" }; }
    if (handle.current) { setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen."); return { ...previous, status: "unknown", targetId: null }; }
    const submitted = new FormData(); for (const [k,v] of form.entries()) submitted.append(k,v);
    const operationId = crypto.randomUUID(); submitted.set("operation_id", operationId); submitted.set("expected", JSON.stringify(expected(form)));
    const intent = retainEditorIntent(`${scope}/${formKey}`, [...submitted.entries()], operationId);
    try { sessionStorage.setItem(key, editorHandle(intent)); } catch { setNotice("Åtgärden skickades inte. Fliken kan inte bevara identiteten."); return { ...initial, status: "error" }; }
    handle.current = operationId; original.current = submitted; setRecoverable(true); setChecked(false); busy.current = true;
    const submittedRevision = revision.current;
    try { const next = await action(previous, submitted);
      if(next.status === "unknown") { setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen."); return next; }
      clear();
      if(next.status === "success" && submittedRevision !== revision.current) { setNotice("Tidigare åtgärd bekräftad. Dina nya ändringar är inte sparade."); return { ...next, status: "idle", targetId: null }; }
      setNotice(null); return next;
    } catch { setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen."); return { ...previous, status: "unknown", operationId, targetId: null }; }
    finally { busy.current = false; }
  }, initial as Awaited<S>);
  async function reconcile() { if(!handle.current || busy.current) return; busy.current = true;
    try { const proof = await reconcileCalculationEditorOperationAction(handle.current); setChecked(true);
      if(proof.status === "unconfirmed") { setNotice("Resultatet är fortfarande obekräftat."); return; }
      setNotice(proof.status === "committed" ? "Den ursprungliga åtgärden är bekräftad. Kontrollera aktuella uppgifter före nya ändringar." : "Åtgärden avvisades. Uppdatera underlaget före en ny åtgärd."); clear();
    } catch { setNotice("Resultatet kunde inte kontrolleras. Försök kontrollera igen."); } finally { busy.current = false; }
  }
  async function retry() { if(!checked || !original.current || busy.current) return; busy.current = true;
    try { const next = await action(initial, original.current);
      if(next.status !== "success") setNotice("Resultatet är fortfarande obekräftat. Kontrollera innan du fattar ett nytt beslut.");
      else { setNotice(next.status === "success" ? "Den ursprungliga åtgärden är bekräftad. Nya ändringar är inte sparade." : next.formError); clear(); }
    } catch { setNotice("Resultatet är fortfarande obekräftat."); } finally { busy.current = false; }
  }
  return { state, action: dispatch, pending, formProps: { onChange: () => { revision.current++; } },
    recovery: <>{notice && <p role="status">{notice}</p>}{recoverable && <div className="flex flex-wrap gap-2">
      <button type="button" className="min-h-11 rounded-control border border-border-strong px-4" onClick={() => { void reconcile(); }}>Kontrollera resultat</button>
      {checked && original.current && <button type="button" className="min-h-11 rounded-control border border-border-strong px-4" onClick={() => { void retry(); }}>Försök samma åtgärd igen</button>}
    </div>}</> };
}
