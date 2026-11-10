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
    if (!defaults.readError && baseline.readError) {
        setBaseline(defaults);
        setDraft(defaults.terms_text);
    } else if (confirmsOwnWrite && !sameDraftBaseline(baseline, defaults)) {
        setBaseline(defaults);
    }
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
    const justSavedText = saveState.status === "success" && !operation.dirty;
    const saveAction = (form: HTMLFormElement) => operation.submit(saveQuoteTermsAction, "terms.save", new FormData(form),
        reviewed.id, reviewed.write_revision, defaults.readError || baselineChanged, form);
    const approveAction = (form: HTMLFormElement) => operation.submit(approveTermsAction, "terms.approve", new FormData(form),
        reviewed.id, reviewed.write_revision, defaults.readError || dirty || baselineChanged || defaults.approved_at !== null, form);
    return (<div className="flex min-w-0 max-w-3xl flex-col gap-6">
      <AttemptRecovery operation={operation}/>
      {defaults.readError && <button type="button" disabled={operation.blocked} onClick={operation.refreshRead} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Försök läsa igen</button>}
      {baselineChanged && !operation.accessLost && <div data-testid="terms-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-label text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade villkor:</p>
        <p className="whitespace-pre-wrap wrap-anywhere">{defaults.id ? defaults.terms_text : "Ingen aktuell post finns."}</p>
        <p>{defaults.approved_at ? "Aktuella villkor är godkända." : "Aktuella villkor är inte godkända."}</p>
        <button type="button" disabled={operation.blocked} onClick={() => { if (operation.blocked) return; operation.reset(); setBaseline(defaults); setDraft(defaults.terms_text); }} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || defaults.readError || operation.accessLost}
        className={operation.accessLost || baseline.readError ? "hidden" : "contents"}>
      {/* SIGN-OFF STATUS / WARNING — always present, sourced from approval state. */}
      {!defaults.readError && (isApproved ? (<div data-testid="quote-terms-approved-status" role="status" className="rounded-control border border-ok-text bg-ok-surface px-4 py-3 text-label text-ok-text">
          <strong>Godkänd</strong> av ägare/juridik
          {defaults.approved_at
                ? ` (${formatApprovedAt(defaults.approved_at)})`
                : ""}
          .
          <span className="mt-1 block text-ok-text">
            Obs: om du redigerar texten måste villkoren godkännas på nytt.
          </span>
        </div>) : (<div data-testid="quote-terms-signoff-warning" role="alert" className="rounded-control border border-warn-text bg-warn-surface px-4 py-3 text-label text-warn-text">
          <strong>Ej godkänt:</strong> Offertvillkoren kräver godkännande av
          ägare/juridik innan de används i skarpa offerter.
        </div>))}
      {dirty && !operation.blocked && <p role="status" className="text-label text-text-secondary">Texten har osparade ändringar. Spara villkoren innan de kan godkännas.</p>}

      {/* TERMS TEXT form — saving NEVER approves. */}
      <form onSubmit={event => { event.preventDefault(); void saveAction(event.currentTarget); }} className="flex flex-col gap-3" noValidate>
        <FormErrorSummary message={saveState.formError} fieldErrors={saveState.fieldErrors}/>
        {justSavedText && (<p data-testid="settings-saved" role="status" className="rounded-control border border-ok-text bg-ok-surface px-3 py-2 text-label text-ok-text">
            Försöket att spara offertvillkoren slutfördes; sparande godkänner inte villkoren.
            {operation.hasCurrentRead && !defaults.readError && defaults.write_revision !== saveState.committedRevision ? " Nyare aktuella uppgifter finns. Granska dem innan du sparar igen." : " Aktuella uppgifter läses separat."}
          </p>)}
        <TermsTextField value={draft} onChange={value => { operation.setDirty(!canonicalTermsEqual(value, reviewed.terms_text)); setDraft(value); }} error={saveState.fieldErrors.terms_text}/>
        <div className="flex">
          <button type="submit" disabled={savePending || baselineChanged || operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control bg-ink px-4 py-2 text-label font-medium text-white hover:bg-n-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-sunken disabled:text-text-disabled">
            {savePending ? "Sparar…" : "Spara villkor"}
          </button>
        </div>
      </form>

      {/* APPROVE form — the deliberate human sign-off (the ONLY path to approval). */}
      {!isApproved && termsId && (<form onSubmit={event => { event.preventDefault(); void approveAction(event.currentTarget); }} className="flex flex-col gap-2" noValidate>
          <FormErrorSummary message={approveState.formError}/>
          <input type="hidden" name="id" value={termsId}/>
          <input type="hidden" name="terms_text" value={reviewed.terms_text}/>
          <div className="flex">
            <button type="submit" disabled={approvePending || dirty || baselineChanged || operation.awaitingCurrentRead || operation.reviewBlocked || defaults.approved_at !== null} className="min-h-control-lg rounded-control border border-warn-text bg-warn-surface px-4 py-2 text-label font-medium text-warn-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:border-border-subtle disabled:bg-sunken disabled:text-text-disabled">
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
function TermsTextField({ value, error, onChange, }: {
    readonly onChange: (value: string) => void;
    readonly value: string;
    readonly error?: string | null;
}) {
    const id = "quote-terms-text";
    const errorId = `${id}-error`;
    const hasError = Boolean(error);
    return (<div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label font-medium text-text-primary">
        Offertvillkor
        <span aria-hidden="true" className="ml-0.5 text-risk-text">
          *
        </span>
      </label>
      <textarea id={id} name="terms_text" required rows={10} value={value} onChange={event => onChange(event.target.value)} aria-invalid={hasError ? "true" : undefined} aria-describedby={hasError ? errorId : undefined} className="min-h-control-lg w-full rounded-control bg-sunken px-3 py-2 text-body text-text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"/>
      {hasError && (<p id={errorId} className="text-label text-risk-text">
          {error}
        </p>)}
      <p className="text-label text-text-tertiary">
        Platshållartext är acceptabel för piloten. Den slutgiltiga texten kräver
        godkännande av ägare/juridik.
      </p>
    </div>);
}
