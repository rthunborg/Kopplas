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
    const baselineChanged = !defaults.readError && (baseline.readError || !sameDraftBaseline(baseline, defaults));
    const formAction = (form: FormData) => operation.submit(saveCompanySettingsAction, "company.save", form, baseline.id, baseline.write_revision, defaults.readError || baselineChanged);
    // Echo-back values from a failed submit take precedence over the initial defaults.
    const v = (field: string, fallback: string | null | undefined): string => state.values[field] ?? fallback ?? "";
    return (<form key={`${baseline.id ?? "absent"}:${baseline.write_revision ?? "absent"}`} onSubmit={event => { event.preventDefault(); void formAction(new FormData(event.currentTarget)); }} className="flex max-w-2xl flex-col gap-4" noValidate>
      <AttemptRecovery operation={operation}/>
      {baselineChanged && <div data-testid="company-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-sm text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade uppgifter:</p>
        <dl>{Object.entries(defaults).filter(([key]) => ["company_name", "org_nr", "address_line1", "address_line2", "postal_code", "city", "email", "phone", "default_vat_display", "vat_rate_percent"].includes(key)).map(([key, value]) => <div key={key}><dt className="font-medium">{({company_name:"Företagsnamn",org_nr:"Organisationsnummer",address_line1:"Adress",address_line2:"Adressrad 2",postal_code:"Postnummer",city:"Ort",email:"E-post",phone:"Telefon",default_vat_display:"Standardvisning av moms",vat_rate_percent:"Momssats"} as Record<string,string>)[key]}</dt><dd>{key === "default_vat_display" ? VAT_DISPLAY_OPTIONS.find(option => option.value === value)?.label ?? "—" : String(value ?? "—")}</dd></div>)}</dl>
        {!defaults.id && <p>Ingen aktuell post finns.</p>}
        <button type="button" disabled={operation.blocked} onClick={() => { if (operation.blocked) return; operation.reset(); setBaseline(defaults); }} className="self-start rounded-control border border-border-default px-3 py-2">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || defaults.readError} className="contents">
      <FormErrorSummary message={state.formError}/>

      {state.status === "success" && (<p data-testid="settings-saved" role="status" className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
          Försöket att spara företagsinställningarna slutfördes.
          {operation.hasCurrentRead && !defaults.readError ? !defaults.id ? " Posten finns inte längre i aktuella uppgifter." : defaults.write_revision !== state.committedRevision ? " Nyare ändringar finns. Granska aktuella uppgifter före nästa sparande." : " Aktuella uppgifter är bekräftade." : " Aktuella uppgifter hämtas separat."}
        </p>)}

      <TextField name="company_name" label="Företagsnamn" required defaultValue={v("company_name", baseline.company_name)} error={state.fieldErrors.company_name}/>
      <TextField name="org_nr" label="Organisationsnummer" defaultValue={v("org_nr", baseline.org_nr)}/>
      <TextField name="address_line1" label="Adress" defaultValue={v("address_line1", baseline.address_line1)}/>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name="postal_code" label="Postnummer" defaultValue={v("postal_code", baseline.postal_code)}/>
        <TextField name="city" label="Ort" defaultValue={v("city", baseline.city)}/>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name="email" label="E-post" type="email" defaultValue={v("email", baseline.email)} error={state.fieldErrors.email}/>
        <TextField name="phone" label="Telefon" defaultValue={v("phone", baseline.phone)} error={state.fieldErrors.phone}/>
      </div>

      <SelectField name="default_vat_display" label="Standardvisning av moms" options={VAT_DISPLAY_OPTIONS} defaultValue={v("default_vat_display", baseline.default_vat_display)} error={state.fieldErrors.default_vat_display}/>

      <div className="flex flex-col gap-1">
        <TextField name="vat_rate_percent" label="Momssats" defaultValue={v("vat_rate_percent", baseline.vat_rate_percent)} error={state.fieldErrors.vat_rate_percent}/>
        <p className="text-xs text-zinc-500">
          Anges i procent (t.ex. 25 för 25 %). Lagras som heltal i baspunkter. Ingen
          momsberäkning görs här – endast standardvärdet sparas.
        </p>
      </div>

      <div className="mt-2 flex justify-end">
        <button type="submit" disabled={pending || baselineChanged} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
          {pending ? "Sparar…" : "Spara"}
        </button>
      </div>
      </fieldset>
    </form>);
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
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    useEffect(() => {
        const before = (e: BeforeUnloadEvent) => { if (attemptBlocksReplacement(attempt.current)) {
            e.preventDefault();
            e.returnValue = "";
        } };
        const click = (e: MouseEvent) => { const a = (e.target as Element).closest?.("a[href]"); if (a && attemptBlocksReplacement(attempt.current)) {
            e.preventDefault();
            e.stopPropagation();
            setNotice("Behåll sidan öppen tills försöket är bekräftat. En omladdning kan förlora försöket.");
        } };
        window.addEventListener("beforeunload", before);
        document.addEventListener("click", click, true);
        return () => { window.removeEventListener("beforeunload", before); document.removeEventListener("click", click, true); };
    }, []);
    const blocked = phase === "pending" || phase === "unknown";
    useEffect(() => {
        if (!blocked)
            return;
        let ownsEntry = true;
        const push = () => history.pushState({ ...history.state, settingsPricingAttempt: true }, "", location.href);
        push();
        const back = () => { if (attemptBlocksReplacement(attempt.current))
            push();
        else
            ownsEntry = false; };
        window.addEventListener("popstate", back);
        return () => { window.removeEventListener("popstate", back); if (ownsEntry && history.state?.settingsPricingAttempt)
            history.back(); };
    }, [blocked]);
    const invoke = useCallback(async (reconcile: boolean) => {
        const current = attempt.current;
        const action = savedAction.current;
        if (!current || !action || busy.current)
            return;
        if (!navigator.onLine) {
            setNotice("Du är offline. Ingen begäran skickades. Anslut och försök igen.");
            return;
        }
        busy.current = true;
        setPending(true);
        setNotice(null);
        const form = attemptForm(current);
        if (reconcile)
            form.set("reconcile", "1");
        const accept = (result: S) => {
            if (!mounted.current || attempt.current?.operationId !== current.operationId || attempt.current?.generation !== current.generation)
                return;
            if (result.operationId !== current.operationId || result.targetId !== current.targetId || attempt.current.phase === "committed")
                return;
            const next = settleAttempt(attempt.current, result);
            attempt.current = next;
            setPhase(next.phase);
            setState(next.phase === "unknown" ? { ...result, status: "unconfirmed", formError: "Resultatet är inte bekräftat. Behåll samma försök; en tidigare begäran kan fortfarande slutföras." } : result);
            if (next.phase === "committed") {
                // A neighboring form may have refreshed while this was unknown.
                // Require another authorized read after this receipt is observed.
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
    }, [initial, router]);
    const submit = async (action: (s: S, f: FormData) => Promise<S>, kind: OperationKind, form: FormData, targetId: string | null, revision: string | null, readError = false) => {
        if (busy.current || attemptBlocksReplacement(attempt.current) || needsRefresh)
            return;
        if (readError || !context) {
            setNotice("Aktuella uppgifter kunde inte läsas. Uppdatera innan du sparar.");
            return;
        }
        if (!navigator.onLine) {
            setNotice("Du är offline. Ingen begäran skickades. Utkastet är inte sparat.");
            return;
        }
        form.set("contextTenantId", context.tenantId);
        form.set("contextActorId", context.actorId);
        const operationId = crypto.randomUUID(), proposedTarget = targetId ?? crypto.randomUUID();
        form.set("operationId", operationId);
        form.set("targetId", proposedTarget);
        form.set("expectedRevision", revision ?? "absent");
        const parsed = kind === "company.save" ? parseCompanySettingsForm(form) : kind === "terms.save" ? parseQuoteTermsForm(form) : kind === "terms.approve" ? parseApproveTermsForm(form) : kind === "work_role.create" || kind === "work_role.update" ? parseWorkRoleForm(form) : kind === "article.create" || kind === "article.update" ? parseArticleForm(form) : parseArchiveForm(form);
        const checked = kind === "company.save" ? validateUpdateCompanySettings(parsed.input) : kind === "terms.save" ? validateUpdateQuoteTerms(parsed.input) : kind === "terms.approve" ? validateApproveQuoteTerms(parsed.input) : kind === "work_role.create" || kind === "work_role.update" ? validateUpsertWorkRole(parsed.input) : kind === "article.create" || kind === "article.update" ? validateUpsertArticle(parsed.input) : validateArchive(parsed.input);
        if (!checked.ok || Object.keys(parsed.fieldErrors).length) {
            setState({ ...initial, ...("form" in initial ? { form: kind.startsWith("work_role") ? "work_role" : "article" } : {}), status: "error", code: "VALIDATION_FAILED", formError: "Kontrollera uppgifterna innan du sparar.", fieldErrors: parsed.fieldErrors, values: parsed.values });
            return;
        }
        setCapturedReadToken(readToken);
        setAttemptKind(kind);
        attempt.current = captureAttempt({ operationId, kind, generation: ++serial.current, context: context.tenantId + ":" + context.actorId + ":" + window.location.pathname, targetId: proposedTarget, expectedRevision: revision, form, candidate: { ...checked.data } });
        savedAction.current = action;
        setPhase("pending");
        await invoke(false);
    };
    const refresh = () => { router.refresh(); setNeedsRefresh(false); setNotice("Aktuella uppgifter hämtas. Granska dem innan ett nytt medvetet försök."); };
    const reset = () => { if (attemptBlocksReplacement(attempt.current))
        return; attempt.current = null; savedAction.current = null; setAttemptKind(undefined); setState(initial); setPhase("idle"); setNeedsRefresh(false); setNotice(null); };
    return { state, pending, phase, notice, needsRefresh, reset, hasCurrentRead: phase === "committed" && readToken !== capturedReadToken, kind: attemptKind, blocked, submit, retry: () => invoke(false), reconcile: () => invoke(true), refresh };
}
export function AttemptRecovery({ operation }: {
    readonly operation: {
        pending: boolean;
        phase: string;
        notice: string | null;
        needsRefresh: boolean;
        retry: () => Promise<void>;
        reconcile: () => Promise<void>;
        refresh: () => void;
    };
}) {
    return <div aria-live="polite" className="flex flex-wrap gap-2">
  {operation.notice && <p role="status" className="w-full text-sm text-text-secondary">{operation.notice}</p>}
  {operation.phase === "unknown" && <><p role="alert" data-testid="operation-unconfirmed" className="w-full text-sm text-warn-text">Resultatet är inte bekräftat. Samma försök behålls. Omladdning eller stängning kan förlora möjligheten att kontrollera det.</p><button type="button" disabled={operation.pending} onClick={() => void operation.reconcile()} className="rounded-control border border-border-default px-3 py-2">Kontrollera resultat</button><button type="button" disabled={operation.pending} onClick={() => void operation.retry()} className="rounded-control border border-border-default px-3 py-2">Försök igen med samma uppgifter</button></>}
  {operation.needsRefresh && <button type="button" onClick={operation.refresh} className="rounded-control border border-border-default px-3 py-2">Uppdatera och granska</button>}
 </div>;
}
