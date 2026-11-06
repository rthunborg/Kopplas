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
import { useState } from "react";
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
    const currentSelected = [...workRoles, ...archivedWorkRoles].find(row => row.id === selected?.id);
    const baselineChanged = !readError && selected !== null && (!currentSelected || !sameDraftBaseline(selected, currentSelected));
    const currentStatus = currentTargetStatus(operation.hasCurrentRead, readError, [...workRoles, ...archivedWorkRoles], state.targetId, state.committedRevision);
    const archiveState = operation.kind === "work_role.archive" ? state : PRICING_ACTION_INITIAL;
    const reactivateState = operation.kind === "work_role.reactivate" ? state : PRICING_ACTION_INITIAL;
    const formAction = (form: FormData) => operation.submit(saveWorkRoleAction, selected ? "work_role.update" : "work_role.create", form, selected?.id ?? null, selected?.write_revision ?? null, readError || baselineChanged);
    const archiveAction = (form: FormData) => operation.submit(archiveWorkRoleAction, "work_role.archive", form, String(form.get("id")), String(form.get("write_revision")), readError);
    const reactivateAction = (form: FormData) => operation.submit(reactivateWorkRoleAction, "work_role.reactivate", form, String(form.get("id")), String(form.get("write_revision")), readError);
    const [showArchived, setShowArchived] = useState(false);
    // Only render this form's own success/error (the article form shares the state shape).
    const mine = state.form === "work_role";
    const lifecycleError = archiveState.status === "error" && archiveState.form === "work_role"
        ? archiveState.formError
        : reactivateState.status === "error" && reactivateState.form === "work_role"
            ? reactivateState.formError
            : null;
    const lifecycleRetryable = (archiveState.status === "error" &&
        archiveState.form === "work_role" &&
        archiveState.code === "SERVER_ERROR") ||
        (reactivateState.status === "error" &&
            reactivateState.form === "work_role" &&
            reactivateState.code === "SERVER_ERROR");
    const v = (field: string, fallback: string): string => (mine && state.values[field]) || fallback;
    const err = (field: string): string | undefined => mine ? state.fieldErrors[field] : undefined;
    return (<section data-testid="work-roles-editor" aria-labelledby="work-roles-heading" className="flex flex-col gap-4">
      <h2 id="work-roles-heading" className="text-lg font-semibold text-zinc-900">
        Arbetsroller
      </h2>

      <AttemptRecovery operation={operation}/>
      {readError && <p data-testid="pricing-current-unavailable" role="alert" className="text-sm text-risk-text">Aktuella uppgifter är inte tillgängliga. Uppdatera innan du sparar.</p>}
      {baselineChanged && <div data-testid="pricing-current-facts" role="status" className="flex flex-col gap-2 rounded-control border border-border-default p-4 text-sm text-text-secondary">
        <p>Utkastet behåller sina ursprungliga uppgifter. Aktuella sparade uppgifter:</p>
        <p>{currentSelected ? `${currentSelected.display_name}: ${oreToKronorString(currentSelected.sell_rate_ore)} kr/tim; kostnad ${oreToKronorString(currentSelected.cost_rate_ore)} kr/tim` : "Ingen aktuell post finns."}</p>
        <button type="button" disabled={operation.blocked} onClick={() => { if (operation.blocked) return; operation.reset(); setSelected(currentSelected ?? null); }} className="min-h-control-lg self-start rounded-control border border-border-default px-3 py-2">Använd aktuella uppgifter</button>
      </div>}
      <fieldset disabled={operation.blocked || readError} className="contents">
      {lifecycleError && (<p data-testid="work-role-archive-error" role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {lifecycleError}
          {lifecycleRetryable ? " Försök igen." : ""}
        </p>)}

      {readError ? null : workRoles.length === 0 ? (<p className="text-sm text-zinc-600">
          Inga arbetsroller ännu. Lägg till din första roll nedan.
        </p>) : (<ul className="flex flex-col gap-2">
          {workRoles.map((role) => (<li key={role.id} className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-900">
                  {role.display_name}
                </span>
                <span className="text-xs text-zinc-600">
                  {oreToKronorString(role.sell_rate_ore)} kr/tim
                </span>
              </div>
              <button type="button" disabled={operation.blocked} onClick={() => { operation.reset(); setSelected(role); }} className="rounded-control border border-border-default px-2 py-1 text-sm">Redigera</button>
              <form onSubmit={event => { event.preventDefault(); void archiveAction(new FormData(event.currentTarget)); }}>
                <input type="hidden" name="id" value={role.id}/>
                <input type="hidden" name="write_revision" value={role.write_revision}/>
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

        <TextField name="display_name" label="Benämning" required defaultValue={v("display_name", selected?.display_name ?? "")} error={err("display_name")}/>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="sell_rate_kronor" label="Pris (kr/tim)" required defaultValue={v("sell_rate_kronor", selected ? oreToKronorString(selected.sell_rate_ore) : "")} error={err("sell_rate_kronor")}/>
          <TextField name="cost_rate_kronor" label="Kostnad (kr/tim)" defaultValue={v("cost_rate_kronor", selected ? oreToKronorString(selected.cost_rate_ore) : "")} error={err("cost_rate_kronor")}/>
        </div>
        <p className="text-xs text-zinc-500">
          Anges i kronor (t.ex. 850,00). Lagras som heltal i öre. Ingen
          momsberäkning görs här – endast återanvändbara priser sparas.
        </p>

        <div className="mt-2 flex justify-end">
          <button type="submit" disabled={pending || baselineChanged} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
            {pending ? "Sparar…" : "Spara roll"}
          </button>
        </div>
      </form>

      <button type="button" disabled={operation.blocked} onClick={() => { operation.reset(); setSelected(null); }} className="self-start rounded-control border border-border-default px-3 py-2">Ny post</button>
      {/* Archived roles — hidden behind a toggle so archive is a REVERSIBLE door: an admin
            can VIEW archived rows and REACTIVATE them (Story 3.4 AC2). */}
      {!readError && archivedWorkRoles.length > 0 && (<div className="flex flex-col gap-2">
          <button type="button" aria-expanded={showArchived} onClick={() => setShowArchived((s) => !s)} className="self-start text-sm text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
            {showArchived
                ? "Dölj arkiverade"
                : `Visa arkiverade (${archivedWorkRoles.length})`}
          </button>

          {showArchived && (<section data-testid="work-roles-archived" aria-label="Arkiverade arbetsroller" className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700">Arkiverade</h3>
              <ul className="flex flex-col gap-2">
                {archivedWorkRoles.map((role) => (<li key={role.id} className="flex items-center justify-between gap-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-700">
                        {role.display_name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {oreToKronorString(role.sell_rate_ore)} kr/tim
                      </span>
                    </div>
                    <form onSubmit={event => { event.preventDefault(); void reactivateAction(new FormData(event.currentTarget)); }}>
                      <input type="hidden" name="id" value={role.id}/>
                <input type="hidden" name="write_revision" value={role.write_revision}/>
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
