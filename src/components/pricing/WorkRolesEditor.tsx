"use client";
/**
 * Work-roles editor (Story 3.4, Task 4.2 / AC2/AC5) — an accessible list + create/edit
 * form wired to the 3.4 `upsertWorkRole` / `archiveWorkRole` envelope commands via the
 * `saveWorkRoleAction` / `archiveWorkRoleAction` server actions.
 *
 * - A list of the tenant's ACTIVE work roles (display name + the sell/cost rates shown
 *   as KRONOR — "850,00 kr/tim" — but STORED as integer öre).
 * - A create/edit form: `display_name` (required), a SELL rate "Pris (kr/tim)" (required)
 *   and an optional COST rate "Kostnad (kr/tim)". The kronor↔öre conversion happens at
 *   the boundary (form-parsing → command); a negative/float rate is rejected with a
 *   FIELD-ASSOCIATED error and the input is PRESERVED.
 * - An archive action per row (soft archive via is_active=false — never a hard delete).
 *
 * Validation feedback is programmatically associated (aria-invalid/aria-describedby + an
 * aria-live blocking summary); input is preserved on a failed submit; no color-only
 * signalling. Mirrors the Story 3.3 settings form a11y.
 */
import { sameDraftBaseline, currentTargetStatus, type EditorOperationContext } from "@/features/settings/mutation-attempt";
import { useRef, useState } from "react";
import { AttemptRecovery, useMountedSettingsPricingAttempt } from "@/components/settings/CompanySettingsForm";
import { FormErrorSummary, TextField } from "@/components/crm/FormField";
import { saveWorkRoleAction, archiveWorkRoleAction, reactivateWorkRoleAction, } from "@/features/pricing/actions";
import { PRICING_ACTION_INITIAL } from "@/features/pricing/action-state";
import { oreToKronorString } from "@/features/pricing/money-display";
import type { RevisionedWorkRoleRow } from "@/features/pricing/read";
export function WorkRolesEditor({ operationContext, readToken, readError, workRoles, archivedWorkRoles = [], }: {
    readonly operationContext: EditorOperationContext | null;
    readonly readToken: string;
    readonly readError: boolean;
    readonly workRoles: readonly RevisionedWorkRoleRow[];
    readonly archivedWorkRoles?: readonly RevisionedWorkRoleRow[];
}) {
    const operation = useMountedSettingsPricingAttempt(PRICING_ACTION_INITIAL, operationContext, readToken);
    const { state, pending } = operation;
    const [selected, setSelected] = useState<RevisionedWorkRoleRow | null>(null);
    const [query, setQuery] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [draftVersion, setDraftVersion] = useState(0);
    const [hadAuthorizedRead, setHadAuthorizedRead] = useState(!readError);
    if (!readError && !hadAuthorizedRead) setHadAuthorizedRead(true);
    const firstField = useRef<HTMLInputElement>(null);

    const currentSelected = [...workRoles, ...archivedWorkRoles].find(row => row.id === selected?.id);
    const confirmsSelectedWrite = !operation.dirty && operation.hasCurrentRead && !readError && currentSelected
        && currentSelected.id === state.targetId && currentSelected.write_revision === state.committedRevision
        && operation.kind === "work_role.update";
    if (confirmsSelectedWrite && selected && !sameDraftBaseline(selected, currentSelected)) {
        setSelected(currentSelected);
    }
    const baselineChanged = !readError && selected !== null && (!currentSelected || !sameDraftBaseline(selected, currentSelected));
    const currentStatus = currentTargetStatus(operation.hasCurrentRead, readError, [...workRoles, ...archivedWorkRoles], state.targetId, state.committedRevision);
    const search = query.trim().toLocaleLowerCase("sv-SE");
    const matches = (role: NonNullable<typeof selected>) => role.display_name.toLocaleLowerCase("sv-SE").includes(search);
    const visibleActive = workRoles.filter(matches);
    const visibleArchived = archivedWorkRoles.filter(matches);
    const isSave = operation.kind === "work_role.create" || operation.kind === "work_role.update";
    const lifecycleError = !isSave && state.status === "error" ? state.formError : null;
    const fieldErrors = isSave ? state.fieldErrors : {};

    function choose(next: typeof selected, adoptCurrent = false) {
        if (operation.blocked || (!adoptCurrent && !operation.allowReplacement())) return;
        operation.reset();
        setSelected(next);
        setDraftVersion(version => version + 1);
        if (!adoptCurrent) requestAnimationFrame(() => firstField.current?.focus());
    }

    function submitLifecycle(form: FormData, reactivate: boolean) {
        const id = String(form.get("id"));
        if (operation.dirty) {
            if (!operation.allowReplacement()) return;
            setSelected(null);
            setDraftVersion(version => version + 1);
            operation.setDirty(false);
        }
        const action = reactivate ? reactivateWorkRoleAction : archiveWorkRoleAction;
        const kind = reactivate ? "work_role.reactivate" : "work_role.archive";
        void operation.submit(action, kind, form, id, String(form.get("write_revision")), readError);
    }

    const formAction = (form: HTMLFormElement) => operation.submit(saveWorkRoleAction, selected ? "work_role.update" : "work_role.create",
        new FormData(form), selected?.id ?? null, selected?.write_revision ?? null, readError || baselineChanged, form);
    return (<section data-testid="work-roles-editor" aria-labelledby="work-roles-heading" className="flex flex-col gap-4">
      <h2 id="work-roles-heading" className="text-heading font-semibold text-text-primary">
        Arbetsroller
      </h2>

      <AttemptRecovery operation={operation}/>
      {readError && <p data-testid="pricing-current-unavailable" role="alert" className="text-label text-risk-text">Aktuella uppgifter är inte tillgängliga. Uppdatera innan du sparar.</p>}
      {readError && <button type="button" disabled={operation.blocked} onClick={operation.refreshRead} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Försök läsa igen</button>}
      {baselineChanged && !operation.accessLost && <div data-testid="pricing-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-label text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade uppgifter:</p>
        <p>{currentSelected ? `${currentSelected.display_name}: ${oreToKronorString(currentSelected.sell_rate_ore)} kr/tim; kostnad ${oreToKronorString(currentSelected.cost_rate_ore)} kr/tim` : "Ingen aktuell post finns."}</p>
        <button type="button" disabled={operation.blocked} onClick={() => choose(currentSelected ?? null, true)} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || readError || operation.accessLost}
        className={operation.accessLost || !hadAuthorizedRead ? "hidden" : "contents"}>
      {lifecycleError && (<p data-testid="work-role-archive-error" role="alert" className="rounded-control border border-risk-text bg-risk-surface px-3 py-2 text-label text-risk-text">
          {lifecycleError}
        </p>)}

        {state.status === "success" && !operation.dirty && (<p data-testid="settings-saved" role="status" className="rounded-control border border-ok-text bg-ok-surface px-3 py-2 text-label text-ok-text">
            Det tidigare försöket slutfördes.
            {currentStatus === "unavailable" ? " Aktuella uppgifter är inte tillgängliga." : currentStatus === "missing" ? " Posten finns inte längre i aktuella uppgifter." : currentStatus === "newer" ? " Nyare ändringar finns. Granska aktuella uppgifter." : currentStatus === "confirmed" ? " Aktuella uppgifter är bekräftade." : " Aktuella uppgifter hämtas separat."}
          </p>)}

      {!readError && (workRoles.length > 0 || archivedWorkRoles.length > 0) && (
        <div className="flex min-w-0 max-w-xl flex-col gap-1">
          <label htmlFor="work-roles-search" className="text-label font-medium text-text-secondary">Sök arbetsroller</label>
          <div className="flex flex-wrap gap-2">
            <input id="work-roles-search" value={query} onChange={event => setQuery(event.target.value)}
              className="min-h-control-lg min-w-0 grow rounded-control bg-sunken px-3 py-2 text-body text-text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"/>
            <button type="button" disabled={!query} onClick={() => setQuery("")} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Rensa sökning</button>
          </div>
        </div>
      )}

      {readError ? null : workRoles.length === 0 ? (<p className="text-label text-text-secondary">
          Inga arbetsroller ännu. Lägg till din första roll nedan.
        </p>) : visibleActive.length === 0 ? (
          <p role="status" className="text-label text-text-secondary">Inga matchningar bland aktiva arbetsroller.</p>
        ) : (<ul className="flex flex-col gap-2">
          {visibleActive.map((role) => (<li key={role.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border border-border-subtle bg-card px-3 py-2">
              <div className="flex min-w-0 grow basis-full flex-col wrap-anywhere sm:basis-0">
                <span className="text-label font-medium text-text-primary">
                  {role.display_name}
                </span>
                <span className="text-label tabular-nums text-text-secondary">
                  {oreToKronorString(role.sell_rate_ore)} kr/tim
                </span>
              </div>
              <button type="button" disabled={operation.blocked} aria-current={selected?.id === role.id ? "true" : undefined} onClick={() => choose(role)} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Redigera</button>
              <form onSubmit={event => { event.preventDefault(); submitLifecycle(new FormData(event.currentTarget), false); }}>
                <input type="hidden" name="id" value={role.id}/>
                <input type="hidden" name="write_revision" value={role.write_revision}/>
                <button type="submit" disabled={operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label text-text-secondary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">
                  {operation.pending && operation.kind === "work_role.archive" && state.targetId === role.id ? "Arkiverar…" : "Arkivera"}
                </button>
              </form>
            </li>))}
        </ul>)}

      <form onChange={event => operation.trackDraft(event.currentTarget)} onSubmit={event => { event.preventDefault(); void formAction(event.currentTarget); }} className="flex min-w-0 max-w-xl flex-col gap-4" noValidate>
        {selected && <input type="hidden" name="id" value={selected.id}/>}
        <h3 className="text-body font-medium text-text-primary wrap-anywhere">{selected ? "Redigera arbetsroll" : "Ny arbetsroll"}</h3>
        <FormErrorSummary message={isSave ? state.formError : null} fieldErrors={fieldErrors}/>
        {operation.dirty && !operation.blocked && <p role="status" className="text-label text-text-secondary">Osparade ändringar.</p>}



        <div key={`${selected?.id ?? "new"}:${selected?.write_revision ?? "absent"}:${draftVersion}`} className="contents">
        <TextField inputRef={firstField} name="display_name" label="Benämning" required defaultValue={selected?.display_name ?? ""} error={fieldErrors.display_name}/>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="sell_rate_kronor" label="Pris (kr/tim)" required defaultValue={selected ? oreToKronorString(selected.sell_rate_ore) : ""} error={fieldErrors.sell_rate_kronor}/>
          <TextField name="cost_rate_kronor" label="Kostnad (kr/tim)" defaultValue={selected ? oreToKronorString(selected.cost_rate_ore) : ""} error={fieldErrors.cost_rate_kronor}/>
        </div>
        <p className="text-label text-text-tertiary">
          Anges i kronor (t.ex. 850,00). Lagras som heltal i öre. Ingen
          momsberäkning görs här – endast återanvändbara priser sparas.
        </p>

        </div>
        <div className="flex">
          <button type="submit" disabled={pending || baselineChanged || operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control bg-ink px-4 py-2 text-label font-medium text-white hover:bg-n-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-sunken disabled:text-text-disabled">
            {pending && isSave ? "Sparar…" : "Spara roll"}
          </button>
        </div>
      </form>

      <button type="button" disabled={operation.blocked} onClick={() => choose(null)} className="min-h-control-lg self-start rounded-control border border-border-strong px-3 py-2 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">Ny post</button>
      {/* Archived roles — hidden behind a toggle so archive is a REVERSIBLE door: an admin
            can VIEW archived rows and REACTIVATE them (Story 3.4 AC2). */}
      {!readError && archivedWorkRoles.length > 0 && (<div className="flex flex-col gap-2">
          <button type="button" aria-expanded={showArchived} aria-controls={showArchived ? "work-roles-archived" : undefined} onClick={() => setShowArchived((s) => !s)} className="min-h-control-lg self-start rounded-control px-2 text-label text-text-secondary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">
            {showArchived
                ? "Dölj arkiverade"
                : `Visa arkiverade (${archivedWorkRoles.length})`}
          </button>

          {showArchived && (<section id="work-roles-archived" data-testid="work-roles-archived" aria-label="Arkiverade arbetsroller" className="flex flex-col gap-2">
              <h3 className="text-label font-medium text-text-secondary">Arkiverade</h3>
              {visibleArchived.length === 0 && <p role="status" className="text-label text-text-secondary">Inga matchningar bland arkiverade arbetsroller.</p>}
              <ul className="flex flex-col gap-2">
                {visibleArchived.map((role) => (<li key={role.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border border-dashed border-border-default bg-sunken px-3 py-2">
                    <div className="flex min-w-0 grow basis-full flex-col wrap-anywhere sm:basis-0">
                      <span className="text-label font-medium text-text-secondary">
                        {role.display_name}
                      </span>
                      <span className="text-label tabular-nums text-text-secondary">
                        {oreToKronorString(role.sell_rate_ore)} kr/tim
                      </span>
                    </div>
                    <form onSubmit={event => { event.preventDefault(); submitLifecycle(new FormData(event.currentTarget), true); }}>
                      <input type="hidden" name="id" value={role.id}/>
                <input type="hidden" name="write_revision" value={role.write_revision}/>
                      <button type="submit" disabled={operation.awaitingCurrentRead || operation.reviewBlocked} className="min-h-control-lg rounded-control border border-border-strong px-3 py-2 text-label text-text-secondary hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-text-disabled">
                        {operation.pending && operation.kind === "work_role.reactivate" && state.targetId === role.id ? "Återaktiverar…" : "Återaktivera"}
                      </button>
                    </form>
                  </li>))}
              </ul>
            </section>)}
        </div>)}
      </fieldset>
    </section>);
}
