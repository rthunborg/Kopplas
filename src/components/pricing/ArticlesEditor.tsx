"use client";
/**
 * Articles editor (Story 3.4, Task 4.3 / AC3/AC5) — an accessible list + create/edit
 * form wired to the 3.4 `upsertArticle` / `archiveArticle` envelope commands via the
 * `saveArticleAction` / `archiveArticleAction` server actions.
 *
 * - A list of the tenant's ACTIVE MANUAL articles (name + unit price shown as KRONOR but
 *   STORED as integer öre).
 * - A create/edit form: `name` (required), optional `sku`/`unit`, and a unit price
 *   "Enhetspris (kr)" (required). The kronor↔öre conversion happens at the boundary.
 *
 * HARD NON-NEGOTIABLE — NO SUPPLIER SCOPE IN THE UI: there is NO supplier / sync / import
 * / Fortnox / external-mapping control anywhere in this editor. Articles are manual,
 * minimal material rows only (name, optional sku/unit, integer-öre price, active flag).
 *
 * Validation feedback is programmatically associated (aria-invalid/aria-describedby + an
 * aria-live blocking summary); input is preserved on a failed submit; no color-only
 * signalling.
 */
import { sameDraftBaseline, currentTargetStatus, type EditorOperationContext } from "@/features/settings/mutation-attempt";
import { useCallback, useRef, useState } from "react";
import { AttemptRecovery, useMountedSettingsPricingAttempt } from "@/components/settings/CompanySettingsForm";
import { FormErrorSummary, TextField } from "@/components/crm/FormField";
import { saveArticleAction, archiveArticleAction, reactivateArticleAction, } from "@/features/pricing/actions";
import { PRICING_ACTION_INITIAL } from "@/features/pricing/action-state";
import { oreToKronorString } from "@/features/pricing/money-display";
import type { RevisionedArticleRow } from "@/features/pricing/read";

function articleFields(row: RevisionedArticleRow | null) {
    return {
        name: row?.name ?? "",
        sku: row?.sku ?? "",
        unit: row?.unit ?? "",
        unit_price_kronor: row ? oreToKronorString(row.unit_price_ore) : "",
    };
}

function seedArticleDraft(row: RevisionedArticleRow | null) {
    return { selected: row, fields: articleFields(row) };
}

export function ArticlesEditor({ operationContext, readToken, readError, articles, archivedArticles = [], }: {
    readonly operationContext: EditorOperationContext | null;
    readonly readToken: string;
    readonly readError: boolean;
    readonly articles: readonly RevisionedArticleRow[];
    readonly archivedArticles?: readonly RevisionedArticleRow[];
}) {
    const operation = useMountedSettingsPricingAttempt(PRICING_ACTION_INITIAL, operationContext, readToken);
    const { state, pending, setDirty } = operation;
    const [draft, setDraft] = useState(() => seedArticleDraft(null));
    const { selected, fields } = draft;
    const [query, setQuery] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [hadAuthorizedRead, setHadAuthorizedRead] = useState(!readError);
    if (!readError && !hadAuthorizedRead) setHadAuthorizedRead(true);
    const firstField = useRef<HTMLInputElement>(null);
    const capturedInitialInput = useRef(false);
    const captureInitialInput = useCallback((form: HTMLFormElement | null) => {
        if (!form || capturedInitialInput.current) return;
        capturedInitialInput.current = true;
        // The browser can receive input before React attaches to the server-rendered form.
        const data = new FormData(form);
        const initialFields = {
            name: String(data.get("name") ?? ""),
            sku: String(data.get("sku") ?? ""),
            unit: String(data.get("unit") ?? ""),
            unit_price_kronor: String(data.get("unit_price_kronor") ?? ""),
        };
        if (Object.values(initialFields).some(Boolean)) {
            setDraft({ selected: null, fields: initialFields });
            setDirty(true);
        }
    }, [setDirty]);

    const currentSelected = [...articles, ...archivedArticles].find(row => row.id === selected?.id);
    const confirmsSelectedWrite = !operation.dirty && operation.hasCurrentRead && !readError && currentSelected
        && currentSelected.id === state.targetId && currentSelected.write_revision === state.committedRevision
        && operation.kind === "article.update";
    if (confirmsSelectedWrite && selected && !sameDraftBaseline(selected, currentSelected)) {
        setDraft(seedArticleDraft(currentSelected));
    }
    const baselineChanged = !readError && selected !== null && (!currentSelected || !sameDraftBaseline(selected, currentSelected));
    const currentStatus = currentTargetStatus(operation.hasCurrentRead, readError, [...articles, ...archivedArticles], state.targetId, state.committedRevision);
    const search = query.trim().toLocaleLowerCase("sv-SE");
    const matches = (article: NonNullable<typeof selected>) => [article.name, article.sku, article.unit].some(value => value?.toLocaleLowerCase("sv-SE").includes(search));
    const visibleActive = articles.filter(matches);
    const visibleArchived = archivedArticles.filter(matches);
    const isSave = operation.kind === "article.create" || operation.kind === "article.update";
    const lifecycleLabel = operation.kind === "article.archive" ? "Arkiverar…"
        : operation.kind === "article.reactivate" ? "Återaktiverar…" : null;
    const lifecycleError = lifecycleLabel && state.status === "error" ? state.formError : null;
    const lifecycleRows = operation.kind === "article.archive" ? visibleActive : showArchived ? visibleArchived : [];
    const lifecycleRowVisible = !readError && lifecycleRows.some(row => row.id === state.targetId);
    const lifecycleFeedbackId = "article-lifecycle-feedback";
    const fieldErrors = isSave ? state.fieldErrors : {};

    function changeField(name: keyof typeof fields, value: string) {
        const next = { ...fields, [name]: value };
        const baseline = articleFields(selected);
        setDraft({ selected, fields: next });
        operation.setDirty(next.name !== baseline.name || next.sku !== baseline.sku
            || next.unit !== baseline.unit || next.unit_price_kronor !== baseline.unit_price_kronor);
    }

    function choose(next: typeof selected, adoptCurrent = false) {
        if (operation.blocked || operation.awaitingCurrentRead || (!adoptCurrent && !operation.allowReplacement())) return;
        operation.reset();
        setDraft(seedArticleDraft(next));
        if (!adoptCurrent) firstField.current?.focus();
    }

    function submitLifecycle(origin: HTMLFormElement, reactivate: boolean) {
        const form = new FormData(origin);
        const action = reactivate ? reactivateArticleAction : archiveArticleAction;
        const kind = reactivate ? "article.reactivate" : "article.archive";
        void operation.submit(action, kind, form, String(form.get("id")), String(form.get("write_revision")), readError, origin, {
            confirm: operation.allowReplacement,
            onStart: () => {
                if (!operation.dirty) return;
                setDraft(seedArticleDraft(null));
                operation.setDirty(false);
            },
        });
    }

    function lifecycleFeedback(rowId: string, reactivate: boolean) {
        const kind = reactivate ? "article.reactivate" : "article.archive";
        if (operation.kind !== kind || state.targetId !== rowId) return null;
        if (pending) return <p id={lifecycleFeedbackId} role="status" className="mt-1 text-label text-text-secondary">{lifecycleLabel}</p>;
        if (!lifecycleError) return null;
        return <p id={lifecycleFeedbackId} data-settings-lifecycle-feedback role="alert" className="mt-1 wrap-anywhere text-label text-risk-text">{lifecycleError}</p>;
    }

    const formAction = (form: HTMLFormElement) => operation.submit(saveArticleAction, selected ? "article.update" : "article.create",
        new FormData(form), selected?.id ?? null, selected?.write_revision ?? null, readError || baselineChanged, form);
    return (<section data-testid="articles-editor" aria-labelledby="articles-heading" className="flex flex-col gap-4">
      <h2 id="articles-heading" className="text-heading font-semibold text-text-primary">
        Artiklar / material
      </h2>

      <AttemptRecovery operation={operation}/>
      {readError && <p data-testid="pricing-current-unavailable" role="alert" className="text-label text-risk-text">Aktuella uppgifter är inte tillgängliga. Uppdatera innan du sparar.</p>}
      {readError && <button type="button" disabled={operation.blocked} onClick={operation.refreshRead} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Försök läsa igen</button>}
      {baselineChanged && !operation.accessLost && <div data-testid="pricing-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-label text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade uppgifter:</p>
        <p className="wrap-anywhere">{currentSelected ? `${currentSelected.name}: ${oreToKronorString(currentSelected.unit_price_ore)} kr; artikelnummer ${currentSelected.sku ?? "—"}; enhet ${currentSelected.unit ?? "—"}` : "Ingen aktuell post finns."}</p>
        <button type="button" disabled={operation.blocked} onClick={() => choose(currentSelected ?? null, true)} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || operation.awaitingCurrentRead || readError || operation.accessLost}
        className={operation.accessLost || !hadAuthorizedRead ? "hidden" : "contents"}>
      {!lifecycleRowVisible && lifecycleLabel && pending && <p role="status" className="text-label text-text-secondary">{lifecycleLabel}</p>}
      {!lifecycleRowVisible && lifecycleError && <p data-testid="article-archive-error" role="alert" className="text-label text-risk-text">{lifecycleError}</p>}

        {state.status === "success" && !operation.dirty && (<p data-testid="settings-saved" role="status" className="rounded-control border border-ok-text bg-ok-surface px-3 py-2 text-label text-ok-text">
            Det tidigare försöket slutfördes.
            {currentStatus === "unavailable" ? " Aktuella uppgifter är inte tillgängliga." : currentStatus === "missing" ? " Posten finns inte längre i aktuella uppgifter." : currentStatus === "newer" ? " Nyare ändringar finns. Granska aktuella uppgifter." : currentStatus === "confirmed" ? " Aktuella uppgifter är bekräftade." : " Aktuella uppgifter hämtas separat."}
          </p>)}

      {!readError && (articles.length > 0 || archivedArticles.length > 0) && (
        <div className="flex min-w-0 max-w-xl flex-col gap-1">
          <label htmlFor="articles-search" className="text-label font-medium text-text-secondary">Sök artiklar</label>
          <div className="flex flex-wrap gap-2">
            <input id="articles-search" value={query} onChange={event => setQuery(event.target.value)}
              className="min-h-control-lg min-w-0 grow rounded-control border border-n-600 bg-sunken px-3 py-2 text-body text-text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"/>
            <button type="button" disabled={!query} onClick={() => setQuery("")} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Rensa sökning</button>
          </div>
        </div>
      )}

      {readError ? null : articles.length === 0 ? (<p className="text-label text-text-secondary">
          {archivedArticles.length ? "Inga aktiva artiklar. Arkiverade artiklar finns nedan." : "Inga artiklar ännu. Lägg till din första artikel nedan."}
        </p>) : visibleActive.length === 0 ? (
          <p role="status" className="text-label text-text-secondary">Inga matchningar bland aktiva artiklar.</p>
        ) : (<ul className="flex flex-col gap-2">
          {visibleActive.map((article) => {
              const feedback = lifecycleFeedback(article.id, false);
              return <li key={article.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border px-3 py-2 ${selected?.id === article.id ? "border-ink bg-selected" : "border-border-subtle bg-card"}`}>
                <div className="flex min-w-0 grow basis-full flex-col wrap-anywhere sm:basis-0">
                  <span className="text-label font-medium text-text-primary">
                    {article.name}
                    {article.unit ? ` (${article.unit})` : ""}
                  </span>
                  {article.sku && <span className="text-label text-text-secondary">Artikelnr {article.sku}</span>}
                  <span className="text-label tabular-nums text-text-secondary">
                    {oreToKronorString(article.unit_price_ore)} kr
                  </span>
                  {selected?.id === article.id && <span className="text-label font-medium text-text-primary">Vald för redigering</span>}
                </div>
                <button type="button" disabled={operation.blocked} aria-current={selected?.id === article.id ? "true" : undefined} onClick={() => choose(article)} className="min-h-control-lg rounded-control border border-n-600 px-3 py-2 text-label text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Redigera</button>
                <form onSubmit={event => { event.preventDefault(); submitLifecycle(event.currentTarget, false); }}>
                  <input type="hidden" name="id" value={article.id}/>
                  <input type="hidden" name="write_revision" value={article.write_revision}/>
                  <button type="submit" aria-describedby={feedback ? lifecycleFeedbackId : undefined} disabled={operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control border border-n-600 px-3 py-2 text-label text-text-secondary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">
                    {operation.pending && operation.kind === "article.archive" && state.targetId === article.id ? "Arkiverar…" : "Arkivera"}
                  </button>
                  {feedback}
                </form>
              </li>;
          })}
        </ul>)}

      <form ref={captureInitialInput} onSubmit={event => { event.preventDefault(); void formAction(event.currentTarget); }} className="flex min-w-0 max-w-xl flex-col gap-4" noValidate>
        {selected && <input type="hidden" name="id" value={selected.id}/>}
        <h3 className="text-body font-medium text-text-primary wrap-anywhere">{selected ? "Redigera artikel" : "Ny artikel"}</h3>
        <FormErrorSummary message={isSave ? state.formError : null} fieldErrors={fieldErrors}/>
        {operation.dirty && !operation.blocked && <p role="status" className="text-label text-text-secondary">Osparade ändringar.</p>}

        <div className="contents [&_input[type=text]]:border [&_input[type=text]]:border-n-600">
        <TextField inputRef={firstField} name="name" label="Artikelnamn" required value={fields.name} onChange={value => changeField("name", value)} error={fieldErrors.name}/>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="sku" label="Artikelnummer" value={fields.sku} onChange={value => changeField("sku", value)}/>
          <TextField name="unit" label="Enhet" value={fields.unit} onChange={value => changeField("unit", value)}/>
        </div>
        <TextField name="unit_price_kronor" label="Enhetspris (kr)" required value={fields.unit_price_kronor} onChange={value => changeField("unit_price_kronor", value)} error={fieldErrors.unit_price_kronor}/>
        <p className="text-label text-text-tertiary">
          Anges i kronor (t.ex. 12,50). Lagras som heltal i öre. Manuella material –
          ingen leverantörsintegration.
        </p>

        </div>
        <div className="flex">
          <button type="submit" disabled={pending || baselineChanged || operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control bg-ink px-4 py-2 text-label font-medium text-white hover:bg-n-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-sunken disabled:text-text-disabled">
            {pending && isSave ? "Sparar…" : "Spara artikel"}
          </button>
        </div>
      </form>

      <button type="button" disabled={operation.blocked} onClick={() => choose(null)} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Ny post</button>
      {/* Archived articles — hidden behind a toggle so archive is a REVERSIBLE door: an
            admin can VIEW archived rows and REACTIVATE them (Story 3.4 AC3). */}
      {!readError && archivedArticles.length > 0 && (<div className="flex flex-col gap-2">
          <button type="button" aria-expanded={showArchived} aria-controls={showArchived ? "articles-archived" : undefined} onClick={() => setShowArchived((s) => !s)} className="min-h-control-lg self-start rounded-control px-2 text-label text-text-secondary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">
            {showArchived
                ? "Dölj arkiverade"
                : `Visa arkiverade (${archivedArticles.length})`}
          </button>

          {showArchived && (<section id="articles-archived" data-testid="articles-archived" aria-label="Arkiverade artiklar" className="flex flex-col gap-2">
              <h3 className="text-label font-medium text-text-secondary">Arkiverade</h3>
              {visibleArchived.length === 0 && <p role="status" className="text-label text-text-secondary">Inga matchningar bland arkiverade artiklar.</p>}
              <ul className="flex flex-col gap-2">
                {visibleArchived.map((article) => {
                  const feedback = lifecycleFeedback(article.id, true);
                  return <li key={article.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border px-3 py-2 ${selected?.id === article.id ? "border-ink bg-selected" : "border-dashed border-border-default bg-sunken"}`}>
                    <div className="flex min-w-0 grow basis-full flex-col wrap-anywhere sm:basis-0">
                      <span className="text-label font-medium text-text-secondary">
                        {article.name}
                        {article.unit ? ` (${article.unit})` : ""}
                      </span>
                      {article.sku && <span className="text-label text-text-secondary">Artikelnr {article.sku}</span>}
                      <span className="text-label tabular-nums text-text-secondary">
                        {oreToKronorString(article.unit_price_ore)} kr
                      </span>
                      {selected?.id === article.id && <span className="text-label font-medium text-text-primary">Vald för redigering</span>}
                    </div>
                    <form onSubmit={event => { event.preventDefault(); submitLifecycle(event.currentTarget, true); }}>
                      <input type="hidden" name="id" value={article.id}/>
                      <input type="hidden" name="write_revision" value={article.write_revision}/>
                      <button type="submit" aria-describedby={feedback ? lifecycleFeedbackId : undefined} disabled={operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control border border-n-600 px-3 py-2 text-label text-text-secondary hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">
                        {operation.pending && operation.kind === "article.reactivate" && state.targetId === article.id ? "Återaktiverar…" : "Återaktivera"}
                      </button>
                      {feedback}
                    </form>
                  </li>;
                })}
              </ul>
            </section>)}
        </div>)}
      </fieldset>
    </section>);
}
