"use client";
/**
 * Company settings form (Story 3.3, Task 4.2 / AC1/AC4/AC5) — accessible form wired to
 * the 3.3 `updateCompanySettings` envelope command via the `saveCompanySettingsAction`
 * server action.
 *
 * - Company identity fields (company_name required; org_nr/address/contact optional).
 * - A `default_vat_display` select encoding the owner VAT rule (private always
 *   incl-VAT not togglable / company togglable) as the TENANT DEFAULT — NOT a
 *   per-customer toggle and NOT any VAT CALCULATION (Epic 4).
 * - A VAT-rate input shown as a PERCENT ("Momssats") but STORED as basis points
 *   (converted at the boundary in form-parsing). An out-of-range rate is rejected with
 *   a FIELD-ASSOCIATED error (aria-invalid + aria-describedby) and input is preserved.
 *
 * Validation feedback is programmatically associated (aria-invalid/aria-describedby +
 * an aria-live blocking summary); input is preserved on a failed submit; no color-only
 * signalling (the message text carries the meaning). Mirrors the Story 3.2 CRM form a11y.
 */
import { parseCompanySettingsForm, parseQuoteTermsForm, parseApproveTermsForm } from "@/features/settings/form-parsing";
import { parseWorkRoleForm, parseArticleForm, parseArchiveForm } from "@/features/pricing/form-parsing";
import { validateUpdateCompanySettings, validateUpdateQuoteTerms, validateApproveQuoteTerms } from "@/server/commands/settings/validation";
import { validateUpsertWorkRole, validateUpsertArticle, validateArchive } from "@/server/commands/pricing/validation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { attemptBlocksReplacement, attemptForm, captureAttempt, settleAttempt, type MutationAttempt, type OperationKind, type EditorOperationContext, sameDraftBaseline } from "@/features/settings/mutation-attempt";
import type { SettingsActionState } from "@/features/settings/action-state";
import { FormErrorSummary, SelectField, TextField, } from "@/components/crm/FormField";
import { saveCompanySettingsAction } from "@/features/settings/actions";
import { SETTINGS_ACTION_INITIAL } from "@/features/settings/action-state";
import { confirmSettingsDraftDiscard, hasChangedSettingsFields, installSettingsFormNavigationGuard } from "./SettingsFormNavigationGuard";
import { VAT_DISPLAY_OPTIONS } from "@/features/settings/vat-display";
/** The current company settings the form hydrates from (null = no row yet). */
export interface CompanySettingsDefaults {
    readonly id: string | null;
    readonly write_revision: string | null;
    readonly readError: boolean;
    readonly operationContext: EditorOperationContext | null;
    readonly readToken: string;
    readonly company_name: string | null;
    readonly org_nr: string | null;
    readonly address_line1: string | null;
    readonly address_line2: string | null;
    readonly postal_code: string | null;
    readonly city: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly default_vat_display: string;
    /** The VAT rate seeded into the percent input (already converted from basis points). */
    readonly vat_rate_percent: string;
}
export function CompanySettingsForm({ defaults, }: {
    readonly defaults: CompanySettingsDefaults;
}) {
    const operation = useMountedSettingsPricingAttempt(SETTINGS_ACTION_INITIAL, defaults.operationContext, defaults.readToken);
    const { state, pending } = operation;
    const [baseline, setBaseline] = useState(defaults);
    const confirmsOwnWrite = operation.hasCurrentRead && !defaults.readError && defaults.id === state.targetId
        && defaults.write_revision === state.committedRevision;
    if (!defaults.readError && (baseline.readError || (confirmsOwnWrite && !operation.dirty && !sameDraftBaseline(baseline, defaults)))) {
        setBaseline(defaults);
    }
    const baselineChanged = !defaults.readError && !(confirmsOwnWrite && !operation.dirty) && (baseline.readError || !sameDraftBaseline(baseline, defaults));
    const formAction = (form: HTMLFormElement) => operation.submit(saveCompanySettingsAction, "company.save", new FormData(form),
        baseline.id, baseline.write_revision, defaults.readError || baselineChanged, form);
    return (<form onChange={event => operation.trackDraft(event.currentTarget)}
      onSubmit={event => { event.preventDefault(); void formAction(event.currentTarget); }}
      className="flex min-w-0 max-w-2xl flex-col gap-4" noValidate>
      <AttemptRecovery operation={operation}/>
      {defaults.readError && <button type="button" disabled={operation.blocked} onClick={operation.refreshRead} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Försök läsa igen</button>}
      {baselineChanged && !operation.accessLost && <div data-testid="company-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-label text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade uppgifter:</p>
        <dl className="wrap-anywhere">{Object.entries(defaults).filter(([key]) => ["company_name", "org_nr", "address_line1", "address_line2", "postal_code", "city", "email", "phone", "default_vat_display", "vat_rate_percent"].includes(key)).map(([key, value]) => <div key={key}><dt className="font-medium">{({company_name:"Företagsnamn",org_nr:"Organisationsnummer",address_line1:"Adress",address_line2:"Adressrad 2",postal_code:"Postnummer",city:"Ort",email:"E-post",phone:"Telefon",default_vat_display:"Standardvisning av moms",vat_rate_percent:"Momssats"} as Record<string,string>)[key]}</dt><dd>{key === "default_vat_display" ? VAT_DISPLAY_OPTIONS.find(option => option.value === value)?.label ?? "—" : String(value ?? "—")}</dd></div>)}</dl>
        {!defaults.id && <p>Ingen aktuell post finns.</p>}
        <button type="button" disabled={operation.blocked} onClick={() => { if (operation.blocked) return; operation.reset(); setBaseline(defaults); }} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || operation.awaitingCurrentRead || defaults.readError || operation.accessLost}
        className={operation.accessLost || baseline.readError ? "hidden" : "contents"}>
      <FormErrorSummary message={state.formError} fieldErrors={state.fieldErrors}/>

      {state.status === "success" && !operation.dirty && (<p data-testid="settings-saved" role="status" className="rounded-control border border-ok-text bg-ok-surface px-3 py-2 text-label text-ok-text">
          Försöket att spara företagsinställningarna slutfördes.
          {operation.hasCurrentRead && !defaults.readError ? !defaults.id ? " Posten finns inte längre i aktuella uppgifter." : defaults.write_revision !== state.committedRevision ? " Nyare ändringar finns. Granska aktuella uppgifter före nästa sparande." : " Aktuella uppgifter är bekräftade." : " Aktuella uppgifter hämtas separat."}
        </p>)}

      {!defaults.id && !defaults.readError && !operation.blocked && state.status !== "success" && (
        <p data-testid="company-empty-defaults" className="text-label text-text-secondary">Företagsinställningar har ännu inte sparats. Momssatsen visar ett förslag på 25 %.</p>
      )}
      {operation.dirty && !operation.blocked && <p role="status" className="text-label text-text-secondary">Osparade ändringar.</p>}
      <div key={`${baseline.id ?? "absent"}:${baseline.write_revision ?? "absent"}`} className="contents [&_:is(input[type=text],input[type=email],select)]:border [&_:is(input[type=text],input[type=email],select)]:border-n-600">
      <TextField name="company_name" label="Företagsnamn" required defaultValue={baseline.company_name ?? ""} error={state.fieldErrors.company_name}/>
      <TextField name="org_nr" label="Organisationsnummer" defaultValue={baseline.org_nr ?? ""}/>
      <TextField name="address_line1" label="Adress" defaultValue={baseline.address_line1 ?? ""}/>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name="postal_code" label="Postnummer" defaultValue={baseline.postal_code ?? ""}/>
        <TextField name="city" label="Ort" defaultValue={baseline.city ?? ""}/>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name="email" label="E-post" type="email" defaultValue={baseline.email ?? ""} error={state.fieldErrors.email}/>
        <TextField name="phone" label="Telefon" defaultValue={baseline.phone ?? ""} error={state.fieldErrors.phone}/>
      </div>

      <SelectField name="default_vat_display" label="Standardvisning av moms" options={VAT_DISPLAY_OPTIONS} defaultValue={baseline.default_vat_display ?? ""} error={state.fieldErrors.default_vat_display}/>

      <div className="flex flex-col gap-1">
        <TextField name="vat_rate_percent" label="Momssats" defaultValue={baseline.vat_rate_percent ?? ""} error={state.fieldErrors.vat_rate_percent}/>
        <p className="text-label text-text-tertiary">
          Anges i procent (t.ex. 25 för 25 %). Lagras som heltal i baspunkter. Ingen
          momsberäkning görs här – endast standardvärdet sparas.
        </p>
      </div>

      </div>
      <div className="flex">
        <button type="submit" disabled={pending || baselineChanged || operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control bg-ink px-4 py-2 text-label font-medium text-white hover:bg-n-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-sunken disabled:text-text-disabled">
          {pending ? "Sparar…" : "Spara"}
        </button>
      </div>
      </fieldset>
    </form>);
}
interface InitialSettingsDispatch<S extends SettingsActionState> {
    readonly attempt: MutationAttempt;
    readonly action: (state: S, form: FormData) => Promise<S>;
    readonly onStart?: () => void;
}

interface SettingsSubmissionOptions {
    readonly confirm?: () => boolean;
    readonly onStart?: () => void;
}

/** Shared only by the four ADR-B014 editors; no durable browser storage or polling. */
export function useMountedSettingsPricingAttempt<S extends SettingsActionState>(initial: S, context: EditorOperationContext | null, readToken: string) {
    const router = useRouter();
    const attempt = useRef<MutationAttempt | null>(null);
    const savedAction = useRef<((state: S, form: FormData) => Promise<S>) | null>(null);
    const [capturedReadToken, setCapturedReadToken] = useState(readToken);
    const latestReadToken = useRef(readToken);
    useEffect(() => { latestReadToken.current = readToken; }, [readToken]);
    const [attemptKind, setAttemptKind] = useState<OperationKind | undefined>(undefined);
    const serial = useRef(0);
    const busy = useRef(false);
    const mounted = useRef(true);
    const [state, setState] = useState(initial);
    const [pending, setPending] = useState(false);
    const [phase, setPhase] = useState<MutationAttempt["phase"] | "idle">("idle");
    const [notice, setNotice] = useState<string | null>(null);
    const [needsRefresh, setNeedsRefresh] = useState(false);
    const [requestedReadToken, setRequestedReadToken] = useState<string | null>(null);
    const awaitingCurrentRead = phase === "committed" && readToken === capturedReadToken;
    const reviewBlocked = needsRefresh || requestedReadToken === readToken;
    const originForm = useRef<HTMLFormElement | null>(null);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const protectedAttempt = useCallback(() => busy.current || attemptBlocksReplacement(attempt.current), []);
    const draftDirty = useRef(false);
    const [dirty, setDirtyState] = useState(false);
    const [navigationNotice, setNavigationNotice] = useState<string | null>(null);
    const setDirty = useCallback((next: boolean) => {
        draftDirty.current = next;
        setDirtyState(next);
    }, []);
    const trackDraft = (form: HTMLFormElement) => setDirty(hasChangedSettingsFields(form));
    const reportBlocked = useCallback(() => {
        setNavigationNotice("Behåll sidan öppen tills försöket är bekräftat. En omladdning kan förlora försöket.");
    }, []);
    const allowReplacement = () => {
        if (protectedAttempt()) {
            reportBlocked();
            return false;
        }
        return !draftDirty.current || confirmSettingsDraftDiscard();
    };
    useEffect(() => installSettingsFormNavigationGuard({
        hasProtectedAttempt: protectedAttempt,
        hasDirtyDraft: () => draftDirty.current,
        reportBlocked,
    }), [protectedAttempt, reportBlocked]);
    const blocked = pending || phase === "pending" || phase === "unknown";
    const [accessLost, setAccessLost] = useState(false);
    useEffect(() => {
        if (state.status !== "error" || accessLost) return;
        const form = originForm.current;
        if (!form || (document.activeElement !== document.body && !form.contains(document.activeElement))) return;
        const field = form.querySelector<HTMLElement>('[aria-invalid="true"]');
        const summary = form.querySelector<HTMLElement>('[data-testid="form-error-summary"] [role="alert"], [data-settings-lifecycle-feedback][role="alert"]');
        if (summary && !field) summary.tabIndex = -1;
        (field ?? summary)?.focus();
    }, [state, accessLost]);

    const invoke = useCallback(async (reconcile: boolean, dispatch?: InitialSettingsDispatch<S>) => {
        const current = dispatch?.attempt ?? attempt.current;
        const action = dispatch?.action ?? savedAction.current;
        if (!current || !action || busy.current)
            return;
        if (!navigator.onLine) {
            setNotice(dispatch
                ? "Du är offline. Ingen begäran skickades. Utkastet är inte sparat."
                : "Du är offline. Ingen begäran skickades. Anslut och försök igen.");
            return;
        }
        busy.current = true;
        if (dispatch) {
            attempt.current = current;
            savedAction.current = action;
            setAttemptKind(current.kind);
            setState({ ...initial, targetId: current.targetId });
            setPhase("pending");
            dispatch.onStart?.();
        }
        setPending(true);
        setNotice(null);
        const form = attemptForm(current);
        if (reconcile)
            form.set("reconcile", "1");
        const accept = (result: S) => {
            if (!mounted.current || attempt.current?.operationId !== current.operationId || attempt.current?.generation !== current.generation)
                return;
            if (attempt.current.phase === "committed") return;
            if (result.operationId !== current.operationId || result.targetId !== current.targetId) {
                result = { ...initial, status: "unconfirmed", operationId: current.operationId, targetId: current.targetId };
            }
            const denied = result.code === "PERMISSION_DENIED" || result.code === "TENANT_ACCESS_DENIED"
                || result.code === "UNAUTHENTICATED" || result.code === "TENANT_MEMBERSHIP_REQUIRED";
            if (denied || result.status === "success") setAccessLost(denied);
            const next = settleAttempt(attempt.current, result);
            attempt.current = next;
            setPhase(next.phase);
            setState(next.phase === "unknown" ? { ...result, status: "unconfirmed", formError: "Resultatet är inte bekräftat. Behåll samma försök; en tidigare begäran kan fortfarande slutföras." } : result);
            if (next.phase === "committed") {
                // A neighboring form may have refreshed while this was unknown.
                // Require another authorized read after this receipt is observed.
                if (current.kind !== "terms.approve") setDirty(false);
                setCapturedReadToken(latestReadToken.current);
                router.refresh();
                setNeedsRefresh(false);
            }
            else if (next.phase === "rejected" && result.code === "COMMAND_CONFLICT") {
                setNeedsRefresh(true);
                router.refresh();
            }
        };
        const request = action(initial, form).then(accept, () => accept({ ...initial, status: "error", code: "SERVER_ERROR", operationId: current.operationId, targetId: current.targetId }));
        let timer: ReturnType<typeof setTimeout> | undefined;
        await Promise.race([request, new Promise<void>(resolve => { timer = setTimeout(() => { accept({ ...initial, status: "unconfirmed", operationId: current.operationId, targetId: current.targetId }); resolve(); }, 12000); })]);
        if (timer)
            clearTimeout(timer);
        busy.current = false;
        if (mounted.current)
            setPending(false);
    }, [initial, router, setDirty]);
    const submit = async (action: (s: S, f: FormData) => Promise<S>, kind: OperationKind, form: FormData, targetId: string | null, revision: string | null, readError = false, origin?: HTMLFormElement, options?: SettingsSubmissionOptions) => {
        if (busy.current || attemptBlocksReplacement(attempt.current) || reviewBlocked || awaitingCurrentRead || accessLost)
            return;
        if (readError || !context) {
            setNotice("Aktuella uppgifter kunde inte läsas. Uppdatera innan du sparar.");
            return;
        }
        if (!navigator.onLine) {
            setNotice("Du är offline. Ingen begäran skickades. Utkastet är inte sparat.");
            return;
        }
        originForm.current = origin ?? null;
        form.set("contextTenantId", context.tenantId);
        form.set("contextActorId", context.actorId);
        const operationId = crypto.randomUUID(), proposedTarget = targetId ?? crypto.randomUUID();
        form.set("operationId", operationId);
        form.set("targetId", proposedTarget);
        form.set("expectedRevision", revision ?? "absent");
        const parsed = kind === "company.save" ? parseCompanySettingsForm(form) : kind === "terms.save" ? parseQuoteTermsForm(form) : kind === "terms.approve" ? parseApproveTermsForm(form) : kind === "work_role.create" || kind === "work_role.update" ? parseWorkRoleForm(form) : kind === "article.create" || kind === "article.update" ? parseArticleForm(form) : parseArchiveForm(form);
        const checked = kind === "company.save" ? validateUpdateCompanySettings(parsed.input) : kind === "terms.save" ? validateUpdateQuoteTerms(parsed.input) : kind === "terms.approve" ? validateApproveQuoteTerms(parsed.input) : kind === "work_role.create" || kind === "work_role.update" ? validateUpsertWorkRole(parsed.input) : kind === "article.create" || kind === "article.update" ? validateUpsertArticle(parsed.input) : validateArchive(parsed.input);
        if (!checked.ok || Object.keys(parsed.fieldErrors).length) {
            // Local validation belongs to this form even though no attempt is dispatched.
            setAttemptKind(kind);
            setPhase("idle");
            setNotice(null);
            setState({ ...initial, ...("form" in initial ? { form: kind.startsWith("work_role") ? "work_role" : "article" } : {}), status: "error", code: "VALIDATION_FAILED", formError: "Kontrollera uppgifterna innan du sparar.", fieldErrors: parsed.fieldErrors, values: parsed.values });
            return;
        }
        if (options?.confirm && !options.confirm()) return;
        const captured = captureAttempt({ operationId, kind, generation: ++serial.current, context: context.tenantId + ":" + context.actorId + ":" + window.location.pathname, targetId: proposedTarget, expectedRevision: revision, form, candidate: { ...checked.data } });
        await invoke(false, { attempt: captured, action, onStart: options?.onStart });
    };
    const refresh = () => {
        setRequestedReadToken(readToken);
        setNeedsRefresh(false);
        setNotice("Aktuella uppgifter hämtas. Granska dem innan ett nytt medvetet försök.");
        router.refresh();
    };
    const reset = () => {
        if (protectedAttempt()) return;
        attempt.current = null;
        savedAction.current = null;
        setAttemptKind(undefined);
        setState(initial);
        setPhase("idle");
        setNeedsRefresh(false);
        setRequestedReadToken(null);
        setNotice(null);
        setDirty(false);
    };
    const refreshRead = () => router.refresh();
    return { state, pending, phase, notice, needsRefresh: reviewBlocked, reviewBlocked, awaitingCurrentRead, reset, hasCurrentRead: phase === "committed" && readToken !== capturedReadToken,
        kind: attemptKind, blocked, submit, retry: () => invoke(false), reconcile: () => invoke(true), refresh, refreshRead,
        dirty, setDirty, trackDraft, allowReplacement, navigationNotice, accessLost };
}
export function AttemptRecovery({ operation }: {
    readonly operation: {
        pending: boolean;
        phase: string;
        notice: string | null;
        needsRefresh: boolean;
        navigationNotice: string | null;
        accessLost: boolean;
        retry: () => Promise<void>;
        reconcile: () => Promise<void>;
        refresh: () => void;
    };
}) {
    return <div aria-live="polite" className="flex flex-wrap gap-2 empty:hidden">
  {operation.accessLost && <p role="alert" className="w-full rounded-control bg-risk-surface p-3 text-label text-risk-text">Du har inte behörighet att utföra åtgärden.</p>}
  {operation.navigationNotice && operation.phase === "pending" && <p role="status" className="w-full text-label text-text-secondary">{operation.navigationNotice}</p>}
  {operation.notice && <p role="status" className="w-full text-label text-text-secondary">{operation.notice}</p>}
  {operation.phase === "unknown" && <><p role="alert" data-testid="operation-unconfirmed" className="w-full text-label text-warn-text">Resultatet är inte bekräftat. Samma försök behålls. Omladdning eller stängning kan förlora möjligheten att kontrollera det.</p><button type="button" disabled={operation.pending} onClick={() => void operation.reconcile()} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Kontrollera resultat</button><button type="button" disabled={operation.pending} onClick={() => void operation.retry()} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Försök igen med samma uppgifter</button></>}
  {operation.needsRefresh && <button type="button" onClick={operation.refresh} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Uppdatera och granska</button>}
 </div>;
}
