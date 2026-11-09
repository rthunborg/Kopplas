"use client";
/**
 * Quote-terms editor + SIGN-OFF status/warning region (Story 3.3, Task 4.3 / AC2 —
 * the HARD STOP-CONDITION). Customer-facing terms wording must NEVER be silently/auto
 * approved by the implementation; the UI ALWAYS shows the sign-off STATUS or a clear
 * WARNING.
 *
 * - A NOT-approved record (approved_at IS NULL, incl. the no-row-yet case) renders a
 *   PROMINENT, non-color-only WARNING ("kräver godkännande av ägare/juridik …"). The
 *   warning carries TEXT, not color alone (a11y / UX §9).
 * - Editing/saving the terms TEXT (`saveQuoteTermsAction` → updateQuoteTerms) NEVER
 *   approves — the warning persists after a text save (the command resets approval).
 * - The deliberate "Markera som godkänd" action (`approveTermsAction` → approveQuoteTerms)
 *   is the ONLY path to approval; on success the APPROVED status ("Godkänd av … <när>")
 *   shows and the warning is gone.
 *
 * Two SEPARATE forms (one per action) so the text-save submit can never carry the
 * approve action and vice-versa — the separation is structural, not just intent.
 */
import { sameDraftBaseline, canonicalTermsEqual, type EditorOperationContext } from "@/features/settings/mutation-attempt";
import { useState } from "react";
import { AttemptRecovery, useMountedSettingsPricingAttempt } from "./CompanySettingsForm";
import { FormErrorSummary } from "@/components/crm/FormField";
import { approveTermsAction, saveQuoteTermsAction, } from "@/features/settings/actions";
import { SETTINGS_ACTION_INITIAL, } from "@/features/settings/action-state";
/** The current terms the editor hydrates from (null = no row yet → not approved). */
export interface QuoteTermsDefaults {
    readonly write_revision: string | null;
    readonly readError: boolean;
    readonly operationContext: EditorOperationContext | null;
    readonly readToken: string;
    readonly id: string | null;
    readonly terms_text: string;
    /** NULL = not approved (the absence of a sign-off — the STOP-CONDITION). */
    readonly approved_at: string | null;
    readonly approved_by: string | null;
}
/** Format the approval instant for display (e.g. "2026-06-30 12:00"). */
function formatApprovedAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    // Stable, locale-independent rendering (yyyy-MM-dd HH:mm) — no Intl locale drift.
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}
export function QuoteTermsEditor({ defaults, }: {
    readonly defaults: QuoteTermsDefaults;
}) {
    const operation = useMountedSettingsPricingAttempt(SETTINGS_ACTION_INITIAL, defaults.operationContext, defaults.readToken);
    const [baseline, setBaseline] = useState(defaults);
    const [draft, setDraft] = useState(defaults.terms_text);
    // Only our exact saved wording plus its exact committed reread may advance the
    // draft automatically. Other refreshes require deliberate review/adoption.
    const confirmsOwnWrite = (operation.kind === "terms.save" || operation.kind === "terms.approve") && operation.phase === "committed" && operation.hasCurrentRead && !defaults.readError && defaults.id === operation.state.targetId && defaults.write_revision === operation.state.committedRevision && canonicalTermsEqual(draft, defaults.terms_text);
    if (confirmsOwnWrite && !sameDraftBaseline(baseline, defaults)) setBaseline(defaults);
    const baselineChanged = !defaults.readError && (baseline.readError || !sameDraftBaseline(baseline, defaults)) && !confirmsOwnWrite;
    const reviewed = confirmsOwnWrite ? defaults : baseline;
    const dirty = !canonicalTermsEqual(draft, reviewed.terms_text);
    const saveState = operation.kind === "terms.save" ? operation.state : SETTINGS_ACTION_INITIAL;
    const approveState = operation.kind === "terms.approve" ? operation.state : SETTINGS_ACTION_INITIAL;
    const savePending = operation.pending && operation.kind === "terms.save";
    const approvePending = operation.pending && operation.kind === "terms.approve";
    const termsId = reviewed.id;
    // A receipt proves historical completion only; current approval comes from an
    // independent authorized reread, never a lingering justApproved action flag.
    const isApproved = !dirty && !baselineChanged && !defaults.readError && !operation.blocked && (operation.phase !== "committed" || operation.hasCurrentRead) && defaults.approved_at !== null;
    const justSavedText = saveState.status === "success";
    const justApproved = false;
    const saveAction = (form: FormData) => operation.submit(saveQuoteTermsAction, "terms.save", form, reviewed.id, reviewed.write_revision, defaults.readError || baselineChanged);
    const approveAction = (form: FormData) => operation.submit(approveTermsAction, "terms.approve", form, reviewed.id, reviewed.write_revision, defaults.readError || dirty || baselineChanged || defaults.approved_at !== null);
    return (<div className="flex max-w-3xl flex-col gap-6">
      <AttemptRecovery operation={operation}/>
      {baselineChanged && <div data-testid="terms-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-sm text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade villkor:</p>
        <p className="whitespace-pre-wrap">{defaults.id ? defaults.terms_text : "Ingen aktuell post finns."}</p>
        <p>{defaults.approved_at ? "Aktuella villkor är godkända." : "Aktuella villkor är inte godkända."}</p>
        <button type="button" disabled={operation.blocked} onClick={() => { if (operation.blocked) return; operation.reset(); setBaseline(defaults); setDraft(defaults.terms_text); }} className="min-h-control-lg self-start rounded-control border border-border-default px-3 py-2">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || defaults.readError} className="contents">
      {/* SIGN-OFF STATUS / WARNING — always present, sourced from approval state. */}
      {isApproved ? (<div data-testid="quote-terms-approved-status" role="status" className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          <strong>Godkänd</strong> av ägare/juridik
          {defaults.approved_at && !justApproved
                ? ` (${formatApprovedAt(defaults.approved_at)})`
                : ""}
          .
          <span className="mt-1 block text-green-800">
            Obs: om du redigerar texten måste villkoren godkännas på nytt.
          </span>
        </div>) : (<div data-testid="quote-terms-signoff-warning" role="alert" className="rounded-md border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Ej godkänt:</strong> Offertvillkoren kräver godkännande av
          ägare/juridik innan de används i skarpa offerter.
        </div>)}

      {/* TERMS TEXT form — saving NEVER approves. */}
      <form onSubmit={event => { event.preventDefault(); void saveAction(new FormData(event.currentTarget)); }} className="flex flex-col gap-3" noValidate>
        <FormErrorSummary message={saveState.formError}/>
        {justSavedText && (<p data-testid="settings-saved" role="status" className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            Försöket att spara offertvillkoren slutfördes; sparande godkänner inte villkoren.
            {operation.hasCurrentRead && !defaults.readError && defaults.write_revision !== saveState.committedRevision ? " Nyare aktuella uppgifter finns. Granska dem innan du sparar igen." : " Aktuella uppgifter läses separat."}
          </p>)}
        <TermsTextField defaultValue={draft} onChange={setDraft} error={saveState.fieldErrors.terms_text}/>
        <div className="flex justify-end">
          <button type="submit" disabled={savePending || baselineChanged} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
            {savePending ? "Sparar…" : "Spara villkor"}
          </button>
        </div>
      </form>

      {/* APPROVE form — the deliberate human sign-off (the ONLY path to approval). */}
      {!isApproved && termsId && (<form onSubmit={event => { event.preventDefault(); void approveAction(new FormData(event.currentTarget)); }} className="flex flex-col gap-2" noValidate>
          <FormErrorSummary message={approveState.formError}/>
          <input type="hidden" name="id" value={termsId}/>
          <input type="hidden" name="terms_text" value={reviewed.terms_text}/>
          <div className="flex justify-end">
            <button type="submit" disabled={approvePending || dirty || baselineChanged || defaults.approved_at !== null} className="rounded-md border border-amber-500 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:opacity-60">
              {approvePending ? "Godkänner…" : "Markera som godkänd"}
            </button>
          </div>
        </form>)}
      </fieldset>
    </div>);
}
/**
 * The terms textarea field — accessible label + programmatic error association
 * (aria-invalid/aria-describedby). The label text "Offertvillkor" is the e2e contract.
 */
function TermsTextField({ defaultValue, error, onChange, }: {
    readonly onChange: (value: string) => void;
    readonly defaultValue: string;
    readonly error?: string | null;
}) {
    const id = "quote-terms-text";
    const errorId = `${id}-error`;
    const hasError = Boolean(error);
    return (<div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800">
        Offertvillkor
        <span aria-hidden="true" className="ml-0.5 text-red-700">
          *
        </span>
      </label>
      <textarea id={id} name="terms_text" required rows={10} value={defaultValue} onChange={event => onChange(event.target.value)} aria-invalid={hasError ? "true" : undefined} aria-describedby={hasError ? errorId : undefined} className={[
            "rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
            hasError ? "border-red-500" : "border-zinc-300",
        ].join(" ")}/>
      {hasError && (<p id={errorId} className="text-sm text-red-700">
          {error}
        </p>)}
      <p className="text-xs text-zinc-500">
        Platshållartext är acceptabel för piloten. Den slutgiltiga texten kräver
        godkännande av ägare/juridik.
      </p>
    </div>);
}
