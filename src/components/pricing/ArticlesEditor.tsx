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
import { useState } from "react";
import { AttemptRecovery, useMountedSettingsPricingAttempt } from "@/components/settings/CompanySettingsForm";
import { FormErrorSummary, TextField } from "@/components/crm/FormField";
import { saveArticleAction, archiveArticleAction, reactivateArticleAction, } from "@/features/pricing/actions";
import { PRICING_ACTION_INITIAL } from "@/features/pricing/action-state";
import { oreToKronorString } from "@/features/pricing/money-display";
import type { RevisionedArticleRow } from "@/features/pricing/read";
export function ArticlesEditor({ operationContext, readToken, readError, articles, archivedArticles = [], }: {
    readonly operationContext: EditorOperationContext | null;
    readonly readToken: string;
    readonly readError: boolean;
    readonly articles: readonly RevisionedArticleRow[];
    readonly archivedArticles?: readonly RevisionedArticleRow[];
}) {
    const operation = useMountedSettingsPricingAttempt(PRICING_ACTION_INITIAL, operationContext, readToken);
    const { state, pending } = operation;
    const [selected, setSelected] = useState<RevisionedArticleRow | null>(null);
    const currentSelected = [...articles, ...archivedArticles].find(row => row.id === selected?.id);
    const baselineChanged = !readError && selected !== null && (!currentSelected || !sameDraftBaseline(selected, currentSelected));
    const currentStatus = currentTargetStatus(operation.hasCurrentRead, readError, [...articles, ...archivedArticles], state.targetId, state.committedRevision);
    const archiveState = operation.kind === "article.archive" ? state : PRICING_ACTION_INITIAL;
    const reactivateState = operation.kind === "article.reactivate" ? state : PRICING_ACTION_INITIAL;
    const formAction = (form: FormData) => operation.submit(saveArticleAction, selected ? "article.update" : "article.create", form, selected?.id ?? null, selected?.write_revision ?? null, readError || baselineChanged);
    const archiveAction = (form: FormData) => operation.submit(archiveArticleAction, "article.archive", form, String(form.get("id")), String(form.get("write_revision")), readError);
    const reactivateAction = (form: FormData) => operation.submit(reactivateArticleAction, "article.reactivate", form, String(form.get("id")), String(form.get("write_revision")), readError);
    const [showArchived, setShowArchived] = useState(false);
    const mine = state.form === "article";
    const lifecycleError = archiveState.status === "error" && archiveState.form === "article"
        ? archiveState.formError
        : reactivateState.status === "error" && reactivateState.form === "article"
            ? reactivateState.formError
            : null;
    const lifecycleRetryable = (archiveState.status === "error" &&
        archiveState.form === "article" &&
        archiveState.code === "SERVER_ERROR") ||
        (reactivateState.status === "error" &&
            reactivateState.form === "article" &&
            reactivateState.code === "SERVER_ERROR");
    const v = (field: string, fallback: string): string => (mine && state.values[field]) || fallback;
    const err = (field: string): string | undefined => mine ? state.fieldErrors[field] : undefined;
    return (<section data-testid="articles-editor" aria-labelledby="articles-heading" className="flex flex-col gap-4">
      <h2 id="articles-heading" className="text-lg font-semibold text-zinc-900">
        Artiklar / material
      </h2>

      <AttemptRecovery operation={operation}/>
      {readError && <p data-testid="pricing-current-unavailable" role="alert" className="text-sm text-risk-text">Aktuella uppgifter är inte tillgängliga. Uppdatera innan du sparar.</p>}
      {baselineChanged && <div data-testid="pricing-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-sm text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade uppgifter:</p>
        <p>{currentSelected ? `${currentSelected.name}: ${oreToKronorString(currentSelected.unit_price_ore)} kr; artikelnummer ${currentSelected.sku ?? "—"}; enhet ${currentSelected.unit ?? "—"}` : "Ingen aktuell post finns."}</p>
        <button type="button" disabled={operation.blocked} onClick={() => { if (operation.blocked) return; operation.reset(); setSelected(currentSelected ?? null); }} className="min-h-control-lg self-start rounded-control border border-border-default px-3 py-2">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || readError} className="contents">
      {lifecycleError && (<p data-testid="article-archive-error" role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {lifecycleError}
          {lifecycleRetryable ? " Försök igen." : ""}
        </p>)}

      {readError ? null : articles.length === 0 ? (<p className="text-sm text-zinc-600">
          Inga artiklar ännu. Lägg till din första artikel nedan.
        </p>) : (<ul className="flex flex-col gap-2">
          {articles.map((article) => (<li key={article.id} className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-900">
                  {article.name}
                  {article.unit ? ` (${article.unit})` : ""}
                </span>
                <span className="text-xs text-zinc-600">
                  {oreToKronorString(article.unit_price_ore)} kr
                </span>
              </div>
              <button type="button" disabled={operation.blocked} onClick={() => { operation.reset(); setSelected(article); }} className="rounded-control border border-border-default px-2 py-1 text-sm">Redigera</button>
              <form onSubmit={event => { event.preventDefault(); void archiveAction(new FormData(event.currentTarget)); }}>
                <input type="hidden" name="id" value={article.id}/>
                <input type="hidden" name="write_revision" value={article.write_revision}/>
                <button type="submit" className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  Arkivera
                </button>
              </form>
            </li>))}
        </ul>)}

      <form key={`${selected?.id ?? "new"}:${selected?.write_revision ?? "absent"}`} onSubmit={event => { event.preventDefault(); void formAction(new FormData(event.currentTarget)); }} className="flex max-w-xl flex-col gap-4" noValidate>
        {selected && <input type="hidden" name="id" value={selected.id}/>}
        <FormErrorSummary message={mine ? state.formError : null}/>

        {mine && state.status === "success" && (<p data-testid="settings-saved" role="status" className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            Det tidigare försöket slutfördes.
            {currentStatus === "unavailable" ? " Aktuella uppgifter är inte tillgängliga." : currentStatus === "missing" ? " Posten finns inte längre i aktuella uppgifter." : currentStatus === "newer" ? " Nyare ändringar finns. Granska aktuella uppgifter." : currentStatus === "confirmed" ? " Aktuella uppgifter är bekräftade." : " Aktuella uppgifter hämtas separat."}
          </p>)}

        <TextField name="name" label="Artikelnamn" required defaultValue={v("name", selected?.name ?? "")} error={err("name")}/>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="sku" label="Artikelnummer" defaultValue={v("sku", selected?.sku ?? "")}/>
          <TextField name="unit" label="Enhet" defaultValue={v("unit", selected?.unit ?? "")}/>
        </div>
        <TextField name="unit_price_kronor" label="Enhetspris (kr)" required defaultValue={v("unit_price_kronor", selected ? oreToKronorString(selected.unit_price_ore) : "")} error={err("unit_price_kronor")}/>
        <p className="text-xs text-zinc-500">
          Anges i kronor (t.ex. 12,50). Lagras som heltal i öre. Manuella material –
          ingen leverantörsintegration.
        </p>

        <div className="mt-2 flex justify-end">
          <button type="submit" disabled={pending || baselineChanged} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
            {pending ? "Sparar…" : "Spara artikel"}
          </button>
        </div>
      </form>

      <button type="button" disabled={operation.blocked} onClick={() => { operation.reset(); setSelected(null); }} className="self-start rounded-control border border-border-default px-3 py-2">Ny post</button>
      {/* Archived articles — hidden behind a toggle so archive is a REVERSIBLE door: an
            admin can VIEW archived rows and REACTIVATE them (Story 3.4 AC3). */}
      {!readError && archivedArticles.length > 0 && (<div className="flex flex-col gap-2">
          <button type="button" aria-expanded={showArchived} onClick={() => setShowArchived((s) => !s)} className="self-start text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
            {showArchived
                ? "Dölj arkiverade"
                : `Visa arkiverade (${archivedArticles.length})`}
          </button>

          {showArchived && (<section data-testid="articles-archived" aria-label="Arkiverade artiklar" className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700">Arkiverade</h3>
              <ul className="flex flex-col gap-2">
                {archivedArticles.map((article) => (<li key={article.id} className="flex items-center justify-between gap-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-700">
                        {article.name}
                        {article.unit ? ` (${article.unit})` : ""}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {oreToKronorString(article.unit_price_ore)} kr
                      </span>
                    </div>
                    <form onSubmit={event => { event.preventDefault(); void reactivateAction(new FormData(event.currentTarget)); }}>
                      <input type="hidden" name="id" value={article.id}/>
                <input type="hidden" name="write_revision" value={article.write_revision}/>
                      <button type="submit" className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                        Återaktivera
                      </button>
                    </form>
                  </li>))}
              </ul>
            </section>)}
        </div>)}
      </fieldset>
    </section>);
}
