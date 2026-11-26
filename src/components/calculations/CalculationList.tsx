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
import { createContext, useContext, useLayoutEffect, useActionState, useCallback, useEffect, useState, useRef, startTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormErrorSummary, SelectField, TextField } from "@/components/crm/FormField";
import { reconcileCalculationEditorOperationAction, createCalculationAction } from "@/features/calculations/actions";
import { editorHandle, readEditorHandle, retainEditorIntent, editorRequestFingerprint } from "@/features/calculations/editor-operation";
import {
  CALC_ACTION_INITIAL,
  isRetryableCalcError,
} from "@/features/calculations/action-state";
import { preflightEditorForm } from "@/features/calculations/form-parsing";
import { createSupabaseBrowserClient } from "@/server/db/supabase-browser-client";
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
  const [showCreate, setShowCreate] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("sv-SE");
  const visibleRows = rows.filter(row =>
    `${row.title} ${row.customer_display_name ?? ""}`.toLocaleLowerCase("sv-SE").includes(normalizedQuery),
  );
  const createOperation = useEditorOperation(createCalculationAction, CALC_ACTION_INITIAL, "new/calculation", form => ({ version: 1, form: "calculation", customer_id: form.get("customer_id"), facility_id: form.get("facility_id") || null, contact_id: form.get("contact_id") || null }));
  const createHostRestored = useRetainedEditorHost("new/calculation");
  const createVisible = showCreate ?? createHostRestored;
  const [state, formAction, pending] = [createOperation.state, createOperation.action, createOperation.pending];
  const root = useRef<HTMLElement>(null);
  const attemptedDestination = useRef<string | null>(null);
  const confirmDeparture = useCallback(() => {
    const protectedDraft = root.current?.querySelector('[data-editor-dirty="true"], [data-editor-protected="true"]');
    return !protectedDraft || window.confirm("Du har osparade ändringar eller ett obekräftat resultat. Vill du lämna formuläret?");
  }, []);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!root.current?.querySelector('[data-editor-dirty="true"], [data-editor-protected="true"]')) return;
      event.preventDefault(); event.returnValue = "";
    };
    const navigation = (window as Window & { navigation?: EventTarget }).navigation;
    const traverse = (event: Event) => {
      const movement = event as Event & { navigationType: string; destination: { sameDocument: boolean; url: string } };
      if (event.defaultPrevented || !event.cancelable || movement.navigationType !== "traverse" || !movement.destination.sameDocument) return;
      const destination = new URL(movement.destination.url);
      if (destination.origin === location.origin && destination.pathname === location.pathname && destination.search === location.search) return;
      if (!confirmDeparture()) event.preventDefault();
    };
    const mountedRoot = root.current;
    const shellDeparture = (event: Event) => {
      if (event.target !== mountedRoot || event.defaultPrevented || !event.cancelable) return;
      if (!confirmDeparture()) event.preventDefault();
    };
    mountedRoot?.addEventListener("kopplas:calculation-departure-request", shellDeparture);
    window.addEventListener("beforeunload", beforeUnload);
    navigation?.addEventListener("navigate", traverse);
    return () => {
      mountedRoot?.removeEventListener("kopplas:calculation-departure-request", shellDeparture);
      window.removeEventListener("beforeunload", beforeUnload);
      navigation?.removeEventListener("navigate", traverse);
    };
  }, [confirmDeparture]);

  // On a successful create, navigate to the new calc's editor.
  useEffect(() => {
    if (state.status === "success" && state.targetId) {
      const destination = `/calculations/${state.targetId}`;
      if (attemptedDestination.current === destination) return;
      attemptedDestination.current = destination;
      if (confirmDeparture()) router.push(destination);
    }
  }, [state.status, state.targetId, router, confirmDeparture]);

  const isMine = state.form === "calculation";
  const v = (field: string, fallback: string): string =>
    createOperation.draftValue(field, (isMine && state.values[field]) || fallback);
  const err = (field: string): string | undefined =>
    isMine ? state.fieldErrors[field] : undefined;
  const retryable = isMine && isRetryableCalcError(state);

  return (
    <section
      ref={root}
      data-calculation-departure-root="true"
      onClickCapture={event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
        if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
        const destination = new URL(link.href);
        if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.search === location.search)) return;
        if (!confirmDeparture()) { event.preventDefault(); event.stopPropagation(); }
      }}
      data-testid="calculation-list"
      aria-labelledby="calculations-heading"
      className="flex min-w-0 flex-col gap-6 break-words p-4 sm:p-6 [&_input]:min-w-0 [&_select]:min-w-0 [&_select]:max-w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="calculations-heading" className="break-words text-title font-medium text-text-primary">
          Kalkyler
        </h1>
        <button
          type="button"
          data-testid="new-calculation"
          onClick={() => { if (!createVisible || confirmDeparture()) setShowCreate(!createVisible); }}
          aria-expanded={createVisible}
          className="min-h-control-lg min-w-control-lg rounded-control bg-ink px-4 py-2 text-body font-medium text-white hover:bg-n-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          Ny kalkyl
        </button>
      </div>

      {state.status === "success" && state.targetId && (
        <Link href={`/calculations/${state.targetId}`} className="min-h-control-lg text-text-primary underline">Öppna skapad kalkyl</Link>
      )}
      <span hidden data-editor-dirty={createVisible && createOperation.hasDraftChanges} data-editor-protected={createOperation.hasProtectedOperation} />

      {loadError && (
        <p
          role="alert"
          data-testid="calculation-list-error"
          className="rounded-control border border-risk-text bg-risk-surface px-3 py-2 text-label text-risk-text"
        >
          {loadError}
        </p>
      )}

      {createVisible && (
        <form key={createOperation.hydrationKey} {...createOperation.formProps}
          action={formAction}
          data-testid="new-calculation-form"
          className="flex max-w-xl flex-col gap-4 rounded-card border border-border-default bg-card p-4"
          noValidate
        >{createOperation.recovery}
        <fieldset disabled={!createOperation.ready} className="contents">
          <FormErrorSummary message={isMine ? state.formError : null} fieldErrors={isMine ? state.fieldErrors : undefined} />
          {retryable && (
            <p role="status" className="text-label text-warn-text">
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
            <p className="text-label text-text-secondary">
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
              className="min-h-control-lg min-w-control-lg rounded-control bg-ink px-4 py-2 text-body font-medium text-white hover:bg-n-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:bg-inset disabled:text-text-disabled"
            >
              {pending ? "Skapar…" : "Skapa kalkyl"}
            </button>
          </div>

        </fieldset>
      </form>
      )}

      <label className="flex max-w-xl flex-col gap-1 text-label font-medium text-text-secondary">
        Sök kalkyler
        <input type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder="Sök på titel eller kund"
          className="min-h-control-lg min-w-0 rounded-control border-0 bg-sunken px-3 py-2 text-body text-text-primary focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink" />
      </label>

      {!loadError && rows.length === 0 ? (
        <p data-testid="calculation-list-empty" className="rounded-card border border-border-default px-4 py-6 text-label text-text-secondary">
          Inga kalkyler ännu. Skapa din första kalkyl med “Ny kalkyl”.
        </p>
      ) : !loadError && visibleRows.length === 0 ? (
        <div role="status" className="rounded-card border border-border-default px-4 py-6">
          <p className="text-section font-medium text-text-primary">Inga träffar</p>
          <p className="mt-2 text-label text-text-secondary">Prova en annan titel eller kund.</p>
          <button type="button" onClick={() => setQuery("")} className="mt-3 min-h-control-lg rounded-control border border-border-strong px-4 text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Rensa sökning</button>
        </div>
      ) : !loadError ? (
        <ul className="flex flex-col gap-2">
          {visibleRows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/calculations/${row.id}`}
                data-testid="calculation-list-row"
                className="flex min-h-control-lg items-center justify-between gap-4 rounded-control border border-border-default px-4 py-row-block hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <div className="flex min-w-0 flex-col break-words">
                  <span className="text-label font-medium text-text-primary">
                    {row.title}
                  </span>
                  <span className="text-caption text-text-secondary">
                    {row.customer_display_name ?? "—"}
                  </span>
                </div>
                <span className="text-caption font-medium text-text-tertiary">
                  {STATUS_LABELS[row.status] ?? row.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}


export type EditorAuthority = { readonly status: "allowed"; readonly scope: string; readonly epoch: string } | { readonly status: "denied" | "unavailable" };
export type EditorValues = readonly (readonly [string, string])[];
export type EditorReentryCheck = { readonly formKey: string; readonly requests: readonly EditorValues[] };
const AuthorityContext = createContext<{ authority: EditorAuthority; authorize: (check: EditorReentryCheck) => Promise<EditorAuthority> } | null>(null);
export function CalculationAuthorityProvider({ authority, authorize, children }: {
  readonly authority: EditorAuthority; readonly authorize: (check: EditorReentryCheck) => Promise<EditorAuthority>; readonly children: ReactNode;
}) {
  const identity = authority.status === "allowed" ? identityOf(authority) : null;
  useEffect(() => {
    const registry = documentRegistry();
    if (authority.status === "denied" || (identity && registry.identity && registry.identity !== identity)) {
      registry.entries.clear(); registry.identity = null; registry.nextGeneration++;
      window.dispatchEvent(new Event("kopplas:calculation-identity-invalidated"));
    } else if (authority.status === "unavailable") {
      for (const entry of registry.entries.values()) entry.quarantined = true;
    }
  }, [authority.status, identity]);
  return <AuthorityContext.Provider value={{ authority, authorize }}>{children}</AuthorityContext.Provider>;
}

/** Open only the host; its controller still authorizes before exposing any retained values. */
export function useRetainedEditorHost(formKey: string): boolean {
  const context = useContext(AuthorityContext);
  const authority = context?.authority;
  const identity = authority?.status === "allowed" ? identityOf(authority) : null;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!identity) return;
    const registry = documentRegistry();
    let active = true;
    queueMicrotask(() => { if (active && registry.identity === identity && registry.entries.get(`${identity}/${formKey}`)?.retained) setOpen(true); });
    return () => { active = false; };
  }, [identity, formKey]);
  return open;
}

type DocumentDraft = {
  generation: number; retained: boolean; detached: boolean; quarantined: boolean;
  values: EditorValues; expected: Record<string, unknown> | null; revision: number; dirty: boolean;
  operation: { id: string; values: EditorValues; revision: number; replay: { requestFingerprint: string } | null } | null;
};
type DocumentRegistry = { identity: string | null; nextGeneration: number; entries: Map<string, DocumentDraft> };
type RegistryWindow = Window & { __kopplasCalculationDocument?: DocumentRegistry };
function identityOf(authority: Extract<EditorAuthority, { status: "allowed" }>) { return `${authority.scope}/${authority.epoch}`; }
function editorValues(form: FormData): EditorValues {
  return [...form.entries()].filter((entry): entry is [string, string] => !entry[0].startsWith("$ACTION_") && typeof entry[1] === "string");
}
function formFromValues(values: EditorValues): FormData {
  const form = new FormData(); for (const [name, value] of values) form.append(name, value); return form;
}
/** Browser-document values only: no SSR business state, DOM, or React callbacks. */
function documentRegistry(): DocumentRegistry {
  const host = window as RegistryWindow;
  if (host.__kopplasCalculationDocument) return host.__kopplasCalculationDocument;
  const registry: DocumentRegistry = { identity: null, nextGeneration: 0, entries: new Map() };
  host.__kopplasCalculationDocument = registry;
  const invalidate = () => { registry.entries.clear(); registry.identity = null; registry.nextGeneration++; window.dispatchEvent(new Event("kopplas:calculation-identity-invalidated")); };
  const navigation = (window as Window & { navigation?: EventTarget }).navigation;
  navigation?.addEventListener("navigate", event => {
    const movement = event as Event & { navigationType: string; destination: { sameDocument: boolean; url: string } };
    if (!event.isTrusted || event.cancelable || event.defaultPrevented || movement.navigationType !== "traverse" || !movement.destination.sameDocument) return;
    const destination = new URL(movement.destination.url);
    if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.search === location.search)) return;
    for (const entry of registry.entries.values()) { entry.retained = entry.dirty || entry.operation !== null; entry.detached = true; }
    window.dispatchEvent(new Event("kopplas:calculation-native-detached"));
  });
  // The subscription outlives calculation mounts. JWT decoding only INVALIDATES
  // memory; fresh server authority is the sole permission to restore it.
  createSupabaseBrowserClient().auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") { invalidate(); return; }
    if (!session || !registry.identity) return;
    try {
      const payload = session.access_token.split(".")[1]!;
      const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { session_id?: string };
      const [actor, , epoch] = registry.identity.split("/");
      if (session.user.id !== actor || claims.session_id !== epoch) invalidate();
    } catch { invalidate(); }
  });
  return registry;
}

type EditorActionState = { readonly status: "idle" | "success" | "error" | "unknown"; readonly targetId: string | null; readonly formError: string | null; readonly operationId?: string | null };
/** Six-host connected controller. Reentry is explicit and bound to original facts. */
export function useEditorOperation<S extends EditorActionState>(
  action: (previous: S, form: FormData) => Promise<S>, initial: S, formKey: string,
  expected: (form: FormData) => Record<string, unknown>,
) {
  const router = useRouter();
  const authorityContext = useContext(AuthorityContext);
  const mountAuthority = authorityContext?.authority;
  const mountIdentity = mountAuthority?.status === "allowed" ? identityOf(mountAuthority) : null;
  const authorize = authorityContext?.authorize;
  // Inline RSC actions can receive a new callable identity on an ordinary
  // sibling refresh. Update transport without ending this mounted writer.
  const authorizeRef = useRef(authorize);
  useLayoutEffect(() => { authorizeRef.current = authorize; }, [authorize]);
  const hasAuthorize = Boolean(authorize);
  const writer = useRef<{ registry: DocumentRegistry; key: string; entry: DocumentDraft; generation: number } | null>(null);
  const [authorization, setAuthorization] = useState<{ identity: string; formKey: string } | null>(null);
  const ready = Boolean(authorization && authorization.identity === mountIdentity && authorization.formKey === formKey);
  const [restored, setRestored] = useState<EditorValues | null>(null);
  const [hydrationGeneration, setHydrationGeneration] = useState(0);
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
  const validationFocus = useRef<{ form: HTMLFormElement; key: string | null; revision: number } | null>(null);
  const draftExpected = useRef<Record<string, unknown> | null>(null);
  const currentKey = useRef<string | null>(null);
  const originalRevision = useRef<number | null>(null);
  const [resultLink, setResultLink] = useState<string | null>(null);
  const key = scope ? `kopplas/editor/v1/${scope}/${formKey}` : null;
  function currentWriter() {
    const owned = writer.current;
    return owned && owned.registry.entries.get(owned.key) === owned.entry && owned.entry.generation === owned.generation && !owned.entry.detached && !owned.entry.quarantined ? owned : null;
  }
  function captureDraft(form?: FormData) {
    const owned = currentWriter(); if (!owned) return;
    if (form) owned.entry.values = editorValues(form);
    owned.entry.expected = draftExpected.current;
    owned.entry.revision = revision.current;
  }
  useEffect(() => {
    let active = true;
    const registry = documentRegistry();
    const authorizeCurrent = authorizeRef.current;
    currentKey.current = null; writer.current = null;
    if (!mountIdentity || !authorizeCurrent) {
      if (mountAuthority?.status === "denied") { registry.entries.clear(); registry.identity = null; }
      else for (const entry of registry.entries.values()) entry.quarantined = true;
      return;
    }
    if (registry.identity !== mountIdentity) { registry.entries.clear(); registry.identity = mountIdentity; }
    const registryKey = `${mountIdentity}/${formKey}`;
    const retained = registry.entries.get(registryKey);
    const generation = ++registry.nextGeneration;
    if (retained) { retained.generation = generation; retained.quarantined = true; }
    const requests = retained?.retained ? [retained.values, ...(retained.operation ? [retained.operation.values] : [])].filter(values => values.length) : [];
    authorizeCurrent({ formKey, requests: requests.map(values => values.filter(([field]) => ["id", "calculation_id", "section_id", "customer_id", "facility_id", "contact_id"].includes(field))) }).then(fresh => {
      if (!active || registry.identity !== mountIdentity || (retained && (registry.entries.get(registryKey) !== retained || retained.generation !== generation))) return;
      if (fresh.status !== "allowed" || identityOf(fresh) !== mountIdentity) {
        if (fresh.status === "allowed") { registry.entries.clear(); registry.identity = null; }
        else if (fresh.status === "denied") registry.entries.delete(registryKey);
        setNotice("Anslutning och aktuell behörighet krävs för att återställa formuläret."); return;
      }
      const entry: DocumentDraft = retained?.retained ? retained : { generation, retained: false, detached: false, quarantined: false, values: [], expected: null, revision: 0, dirty: false, operation: null };
      entry.generation = generation; entry.detached = false; entry.quarantined = false;
      registry.entries.set(registryKey, entry);
      writer.current = { registry, key: registryKey, entry, generation };
      const storageKey = `kopplas/editor/v1/${fresh.scope}/${formKey}`;
      currentKey.current = storageKey; setScope(fresh.scope);
      setAuthorization({ identity: mountIdentity, formKey });
      draftExpected.current = entry.expected; revision.current = entry.revision; setHasDraftChanges(entry.dirty);
      if (entry.retained) { setRestored(entry.values); setHydrationGeneration(generation); }
      try {
        const raw = sessionStorage.getItem(storageKey), saved = raw ? readEditorHandle(raw, `${fresh.scope}/${formKey}`) : null;
        handle.current = entry.operation?.id ?? saved?.operationId ?? null;
        replayContext.current = entry.operation?.replay ?? saved?.replay ?? null;
        original.current = entry.operation ? formFromValues(entry.operation.values) : null;
        originalRevision.current = entry.operation?.revision ?? null;
        setRecoverable(Boolean(handle.current)); setHasOriginalRequest(Boolean(original.current));
        if (handle.current) setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen.");
      } catch { setNotice("Sessionslagring krävs för att bevara åtgärdens identitet."); }
    }).catch(() => { if (active) setNotice("Anslutning krävs för att kontrollera åtgärder."); });
    return () => {
      active = false; currentKey.current = null;
      const owned = writer.current;
      if (owned?.generation === generation) {
        owned.entry.detached = true;
        if (!owned.entry.retained && owned.registry.entries.get(owned.key) === owned.entry) owned.registry.entries.delete(owned.key);
        writer.current = null;
      }
    };
  }, [mountIdentity, mountAuthority?.status, hasAuthorize, formKey]);
  useEffect(() => {
    const invalidate = () => {
      writer.current = null; currentKey.current = null; draftExpected.current = null;
      original.current = null; originalRevision.current = null; replayContext.current = null; handle.current = null;
      setAuthorization(null); setScope(null); setRestored(null); setHasDraftChanges(false); setRecoverable(false); setHasOriginalRequest(false);
      setHydrationGeneration(value => value + 1);
    };
    window.addEventListener("kopplas:calculation-identity-invalidated", invalidate);
    return () => window.removeEventListener("kopplas:calculation-identity-invalidated", invalidate);
  }, []);
  useEffect(() => {
    const detach = () => setAuthorization(null);
    window.addEventListener("kopplas:calculation-native-detached", detach);
    return () => window.removeEventListener("kopplas:calculation-native-detached", detach);
  }, []);
  // Capture controlled/conditional controls after their React update, too.
  useLayoutEffect(() => { if (formElement.current && currentWriter()?.entry.dirty) captureDraft(new FormData(formElement.current)); });
  function clearOperation() { const owned = currentWriter(); if (owned) owned.entry.operation = null; originalRevision.current = null; handle.current = null; original.current = null; replayContext.current = null; setHasOriginalRequest(false); setRecoverable(false); setChecked(false); if (key) { try { sessionStorage.removeItem(key); } catch { /* A stale handle remains safely reconcilable. */ } } }
  function confirmMatchingDraft(submittedRevision: number | null) {
    // Operation A's proof cannot change unsent draft B's original facts.
    if (submittedRevision !== null && submittedRevision === revision.current) {
      draftExpected.current = null; setHasDraftChanges(false); const owned = currentWriter(); if (owned) { owned.entry.dirty = false; owned.entry.expected = null; }
    }
  }
  const [state, dispatch, actionPending] = useActionState<S, FormData>(async (previous: S, form: FormData): Promise<S> => {
    if (busy.current) { submitting.current = false; return previous; }
    if (!navigator.onLine || !key || !scope || !currentWriter()) { setNotice("Anslutning krävs. Uppgifterna är inte skickade."); submitting.current = false; return { ...previous, status: "error", targetId: null }; }
    try {
      const raw = sessionStorage.getItem(key), saved = raw ? readEditorHandle(raw, `${scope}/${formKey}`) : null;
      if (!handle.current && saved) { handle.current = saved.operationId; replayContext.current = saved.replay ?? null; setRecoverable(true); }
    } catch { setNotice("Åtgärden skickades inte. Identiteten kunde inte kontrolleras."); submitting.current = false; return { ...previous, status: "idle", targetId: null }; }
    captureDraft(form);
    const submitted = new FormData(); for (const [k,v] of form.entries()) if (!k.startsWith("$ACTION_")) submitted.append(k,v);
    if (handle.current) {
      try {
        if (checked && !original.current && replayContext.current) {
          submitted.set("operation_id", handle.current);
          submitted.set("expected", JSON.stringify((formKey === "new/calculation" ? null : draftExpected.current) ?? expected(form)));
          const reenteredRevision = revision.current;
          if (await editorRequestFingerprint(submitted) === replayContext.current.requestFingerprint) {
            original.current = submitted; originalRevision.current = reenteredRevision; setHasOriginalRequest(true);
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
    const submissionWriter = currentWriter();
    if (!submissionWriter) return initial;
    // Original identity and expected facts precede the first submission await.
    submissionWriter.entry.operation = { id: operationId, values: editorValues(submitted), revision: submittedRevision, replay: null };
    busy.current = true;
    try {
      const context = { requestFingerprint: await editorRequestFingerprint(submitted) };
      if (currentWriter() !== submissionWriter) return initial;
      submissionWriter.entry.operation!.replay = context;
      try { sessionStorage.setItem(key, editorHandle(intent, context)); }
      catch { submissionWriter.entry.operation = null; setNotice("Åtgärden skickades inte. Fliken kan inte bevara identiteten."); return { ...previous, status: "idle", targetId: null }; }
      handle.current = operationId; original.current = submitted; originalRevision.current = submittedRevision; replayContext.current = context;
      setHasOriginalRequest(true); setRecoverable(true); setChecked(false);
      const next = await action(previous, submitted);
      if (currentKey.current !== submittedKey || currentWriter() !== submissionWriter) return initial;
      if(next.status === "unknown") { setNotice("Resultatet är obekräftat. Kontrollera innan du försöker igen."); return next; }
      clearOperation();
      if(next.status === "success" && submittedRevision !== revision.current) { setNotice("Tidigare åtgärd bekräftad. Dina nya ändringar är inte sparade."); return { ...next, status: "idle", targetId: null }; }
      if (next.status === "success") confirmMatchingDraft(submittedRevision);
      setNotice(null); return next;
    } catch {
      if (currentKey.current !== submittedKey || currentWriter() !== submissionWriter) return initial;
      setNotice(handle.current ? "Resultatet är obekräftat. Kontrollera innan du försöker igen." : "Åtgärden skickades inte. Underlaget kunde inte bevaras.");
      return handle.current ? { ...previous, status: "unknown", operationId, targetId: null } : { ...previous, status: "idle", targetId: null };
    } finally { busy.current = false; submitting.current = false; }
  }, initial as Awaited<S>);
  // Validation focus belongs only to the submitted draft while focus stays with that form.
  useEffect(() => {
    const submittedFocus = validationFocus.current;
    validationFocus.current = null;
    if (state.status !== "error" || !submittedFocus || !submittedFocus.form.isConnected ||
      submittedFocus.key !== currentKey.current || submittedFocus.revision !== revision.current) return;
    const active = document.activeElement;
    if (active !== document.body && !submittedFocus.form.contains(active)) return;
    const invalid = submittedFocus.form.querySelector<HTMLElement>('[aria-invalid="true"]');
    invalid?.focus();
    invalid?.scrollIntoView({ block: "nearest" });
  }, [state]);
  async function reconcile() { if(!key || !handle.current || busy.current || !currentWriter()) return;
    const reconciliationWriter = currentWriter();
    const reconciledKey = key, operationId = handle.current;
    busy.current = true; setRecoveryPending(true);
    try { const proof = await reconcileCalculationEditorOperationAction(operationId);
      if (currentKey.current !== reconciledKey || handle.current !== operationId || currentWriter() !== reconciliationWriter) return;
      setChecked(true);
      if(proof.status === "unconfirmed") { setNotice(original.current ? "Resultatet är fortfarande obekräftat. Du kan försöka samma ursprungliga åtgärd igen." : replayContext.current ? "Resultatet är fortfarande obekräftat. Ange samma ursprungliga uppgifter och välj Spara för att kontrollera underlaget före samma åtgärd." : "Resultatet är fortfarande obekräftat. Det ursprungliga underlaget finns inte kvar i fliken."); return; }
      if (proof.status === "committed" && proof.targetAvailable !== false && proof.targetId) {
        setResultLink(proof.quoteId ? `/quotes/${proof.quoteId}/versions/${proof.targetId}` : formKey === "new/calculation" ? `/calculations/${proof.targetId}` : null);
      }
      setNotice(proof.status === "committed" ? "Den ursprungliga åtgärden är bekräftad. Kontrollera aktuella uppgifter före nya ändringar." : "Åtgärden avvisades. Uppdatera underlaget före en ny åtgärd."); if (proof.status === "committed") confirmMatchingDraft(originalRevision.current); clearOperation();
      // A read-only receipt carries no refreshed server projection. Preserve
      // later drafts and their expected facts while rereading committed data.
      if (proof.status === "committed") router.refresh();
    } catch { if (currentKey.current === reconciledKey && handle.current === operationId && currentWriter() === reconciliationWriter) setNotice("Resultatet kunde inte kontrolleras. Försök kontrollera igen."); } finally { busy.current = false; setRecoveryPending(false); }
  }
  async function retry() { if(!checked || !original.current || busy.current || !currentWriter()) return; const retryWriter = currentWriter(); busy.current = true; setRecoveryPending(true);
    try { const next = await action(initial, original.current);
      if (currentWriter() !== retryWriter) return;
      if(next.status === "error") { setNotice(next.formError ?? "Resultatet kunde inte bekräftas. Kontrollera innan du fattar ett nytt beslut."); }
      else if(next.status !== "success") setNotice("Resultatet är fortfarande obekräftat. Kontrollera innan du fattar ett nytt beslut.");
      else { setNotice("Den ursprungliga åtgärden är bekräftad. Nya ändringar är inte sparade."); if(next.targetId) setResultLink("quoteId" in next && typeof next.quoteId === "string" ? `/quotes/${next.quoteId}/versions/${next.targetId}` : formKey === "new/calculation" ? `/calculations/${next.targetId}` : null); confirmMatchingDraft(originalRevision.current); clearOperation(); }
    } catch { setNotice("Resultatet är fortfarande obekräftat."); } finally { busy.current = false; setRecoveryPending(false); }
  }
  function markChanged() {
    if (!ready || !currentWriter()) return;
    revision.current++; setHasDraftChanges(true); const owned = currentWriter(); if (owned) owned.entry.dirty = true;
    if (formKey !== "new/calculation" && formElement.current) draftExpected.current ??= expected(new FormData(formElement.current));
    captureDraft(formElement.current ? new FormData(formElement.current) : undefined);
  }
  const hasProtectedOperation = actionPending || recoveryPending || recoverable;
  const restoredValues = ready ? restored : null;
  const hydrationKey = `${mountIdentity ?? "unavailable"}/${formKey}/${ready}/${hydrationGeneration}`;
  return { state: ready ? state : initial, ready, restored: restoredValues, hydrationGeneration, hydrationKey,
    forgetRestoredFields: (fields: readonly string[]) => setRestored(values => values?.filter(([name]) => !fields.includes(name)) ?? null),
    retainValues: (values: EditorValues) => { const owned = currentWriter(); if (owned) owned.entry.values = values; },
    draftValue: (name: string, fallback: string) => restoredValues ? [...restoredValues].reverse().find(([field]) => field === name)?.[1] ?? fallback : fallback,
    draftValues: (name: string) => restoredValues?.filter(([field]) => field === name).map(([, value]) => value) ?? [],
    action: dispatch, pending: actionPending || recoveryPending, hasDraftChanges, hasProtectedOperation, markChanged, formProps: {
      ref: formElement,
      "data-editor-ready": ready,
      "aria-busy": !ready,
      "data-editor-restored": hydrationGeneration > 0,
      "data-editor-dirty": hasDraftChanges,
      "data-editor-protected": hasProtectedOperation,
      // Explicit transition dispatch avoids React's action-form auto-reset on
      // refused submissions and late results. The live controls stay the draft.
      onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); if (!ready || !currentWriter() || submitting.current || busy.current) return;
        validationFocus.current = { form: event.currentTarget, key: currentKey.current, revision: revision.current };
        submitting.current = true; const form = new FormData(event.currentTarget); captureDraft(form);
        startTransition(() => { dispatch(form); });
      },
      onChange: markChanged,
      onBlurCapture: (event: React.FocusEvent<HTMLFormElement>) => {
        if (validationFocus.current?.form === event.currentTarget && event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)) validationFocus.current = null;
      },
    },
    recovery: <><span hidden data-editor-dirty={hasDraftChanges} data-editor-protected={hasProtectedOperation} />{notice && <p role="status">{notice}</p>}{resultLink && <Link href={resultLink} className="min-h-control-lg text-text-primary underline">Öppna bekräftat resultat</Link>}{recoverable && <div className="flex flex-wrap gap-2">
      <button type="button" disabled={recoveryPending} className="min-h-control-lg min-w-control-lg rounded-control border border-border-strong px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" onClick={() => { void reconcile(); }}>Kontrollera resultat</button>
      {checked && hasOriginalRequest && <button type="button" disabled={recoveryPending} className="min-h-control-lg min-w-control-lg rounded-control border border-border-strong px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" onClick={() => { void retry(); }}>Försök samma åtgärd igen</button>}
    </div>}</> };
}
