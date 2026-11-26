"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useEditorOperation } from "./CalculationList";
import { useRouter } from "next/navigation";

import { FormErrorSummary, SelectField, TextField } from "@/components/crm/FormField";
import { CALC_ACTION_INITIAL, isRetryableCalcError, type CalcActionState } from "@/features/calculations/action-state";
import { updateTaxInputAction } from "@/features/calculations/actions";
import {
  type AllowanceEditorSlot,
  MAX_PERSON_ALLOWANCE_SLOTS,
  addAllowanceEditorSlot,
  initializeAllowanceEditorSlots,
  removeAllowanceEditorSlot,
} from "@/features/calculations/allowance-editor";
import { oreToKronorString } from "@/features/calculations/money-input";
import {
  REVERSE_CHARGE_DEDUCTION_CONFLICT_MESSAGE,
  hasReverseChargeDeductionConflict,
} from "@/features/calculations/tax-settings-ui";
import {
  GREEN_BASIS_METHODS,
  TAX_DEDUCTION_CHOICES,
  type GreenBasisMethod,
  type TaxDeductionChoice,
  type TaxInputSnapshotV2,
  type VatType,
} from "@/lib/money";

const VAT_LABELS: Record<VatType, string> = {
  STANDARD_VAT_25: "Standardmoms",
  REDUCED_VAT: "Reducerad moms",
  ZERO_RATED: "Momsfri (0 %)",
  REVERSE_CHARGE_CONSTRUCTION: "Omvänd betalningsskyldighet, bygg",
};
// The document field is an explicit reverse-charge applicability choice, not a
// second per-row VAT category. Standard and reverse may coexist in one document.
const VAT_OPTIONS = (["STANDARD_VAT_25", "REVERSE_CHARGE_CONSTRUCTION"] as const).map((value) => ({
  value,
  label: VAT_LABELS[value],
}));

const DEDUCTION_LABELS: Record<TaxDeductionChoice, string> = {
  NONE: "Inget avdrag",
  ROT: "ROT",
  GREEN: "Grön teknik",
  ROT_AND_GREEN: "ROT och grön teknik (separata arbeten)",
};
const DEDUCTION_OPTIONS = TAX_DEDUCTION_CHOICES.map((value) => ({
  value,
  label: DEDUCTION_LABELS[value],
}));

const BASIS_LABELS: Record<GreenBasisMethod, string> = {
  ACTUAL_ELIGIBLE_COSTS: "Faktiska stödberättigade kostnader",
  FIXED_PRICE_97_PERCENT: "97 % av äkta fastprisavtal",
};
const BASIS_OPTIONS = GREEN_BASIS_METHODS.map((value) => ({
  value,
  label: BASIS_LABELS[value],
}));

const EMPTY_TAX_INPUT: TaxInputSnapshotV2 = {
  schemaVersion: 2,
  documentVatType: "STANDARD_VAT_25",
  buyerVatNumber: null,
  deductionChoice: "NONE",
  paymentDate: null,
  finalPaymentDate: null,
  personAllowanceSlots: [],
  greenBasisMethod: "ACTUAL_ELIGIBLE_COSTS",
  genuineFixedPrice: false,
  fixedPriceOre: null,
  fixedPriceCategorySplitOre: null,
  fixedPriceRowIds: null,
};

function oreValue(value: number | undefined | null): string {
  return value === undefined || value === null ? "" : oreToKronorString(value);
}

export interface FixedPriceScopeRowOption {
  readonly id: string;
  readonly label: string;
}

export function TaxSettingsPanel({
  calculationId,
  headerFacts,
  value,
  fixedPriceScopeRows,
}: {
  readonly calculationId: string;
  readonly headerFacts?: Record<string, unknown>;
  readonly value: TaxInputSnapshotV2 | null;
  readonly fixedPriceScopeRows: readonly FixedPriceScopeRowOption[];
}) {
  const input = value ?? EMPTY_TAX_INPUT;
  // The controller outlives canonical field resets. A refreshed snapshot may
  // reset a clean form, but never remount a pending or later unsent tax draft.
  const taxOperation = useEditorOperation(updateTaxInputAction, CALC_ACTION_INITIAL, `${calculationId}/tax`, () => ({ version: 1, form: "tax_input", header: headerFacts ?? null }));
  const canonicalRevision = JSON.stringify(input);
  const [displayedRevision, setDisplayedRevision] = useState(canonicalRevision);
  if (!taxOperation.hasDraftChanges && !taxOperation.pending && displayedRevision !== canonicalRevision) setDisplayedRevision(canonicalRevision);
  return (
    <TaxSettingsForm
      key={`${displayedRevision}/${taxOperation.hydrationKey}`}
      taxOperation={taxOperation}
      calculationId={calculationId}
      input={input}
      fixedPriceScopeRows={fixedPriceScopeRows}
    />
  );
}

function TaxSettingsForm({
  calculationId,
  taxOperation,
  input,
  fixedPriceScopeRows,
}: {
  readonly calculationId: string;
  readonly taxOperation: ReturnType<typeof useEditorOperation<CalcActionState>>;
  readonly input: TaxInputSnapshotV2;
  readonly fixedPriceScopeRows: readonly FixedPriceScopeRowOption[];
}) {
  const genuineFixedPriceControlId = useId();
  const genuineFixedPriceErrorId = `${genuineFixedPriceControlId}-error`;
  const [state, action, pending] = [taxOperation.state, taxOperation.action, taxOperation.pending];
  const router = useRouter();
  const mine = state.form === "tax_input";
  const v = (field: string, fallback: string): string =>
    (mine && state.status === "error" && state.values[field] !== undefined
      ? state.values[field]
      : taxOperation.draftValue(field, fallback)) ?? fallback;
  const err = (field: string): string | undefined =>
    mine ? state.fieldErrors[field] : undefined;
  useEffect(() => {
    if (mine && state.status === "success") router.refresh();
  }, [mine, router, state.status]);
  const [documentVatType, setDocumentVatType] = useState(() =>
    v("document_vat_type", input.documentVatType),
  );
  const [deductionChoice, setDeductionChoice] = useState<TaxDeductionChoice>(() =>
    v("deduction_choice", input.deductionChoice) as TaxDeductionChoice,
  );
  const [greenBasisMethod, setGreenBasisMethod] = useState<GreenBasisMethod>(() =>
    v("green_basis_method", input.greenBasisMethod) as GreenBasisMethod,
  );
  const [selectedFixedPriceRowIds, setSelectedFixedPriceRowIds] = useState(
    () => new Set(taxOperation.restored ? taxOperation.draftValues("fixed_price_row_ids") : input.fixedPriceRowIds ?? []),
  );
  const readsRot = deductionChoice === "ROT" || deductionChoice === "ROT_AND_GREEN";
  const readsGreen = deductionChoice === "GREEN" || deductionChoice === "ROT_AND_GREEN";
  const usesFixedPrice = readsGreen && greenBasisMethod === "FIXED_PRICE_97_PERCENT";
  const reverseChargeDeductionConflict = hasReverseChargeDeductionConflict(
    documentVatType,
    deductionChoice,
  );
  const selectedEligibleFixedPriceRows = fixedPriceScopeRows.filter((row) =>
    selectedFixedPriceRowIds.has(row.id),
  );
  const fixedPriceScopeMissing =
    usesFixedPrice && selectedEligibleFixedPriceRows.length === 0;
  // Persisted slot identifiers are intentionally ignored. Array order carries the compatibility
  // order; visible names and submitted ids are freshly canonical PERSON_1..PERSON_50 positions.
  const [allowanceSlots, setAllowanceSlots] = useState<readonly AllowanceEditorSlot[]>(() =>
    taxOperation.restored && (taxOperation.draftValue("deduction_choice", "NONE") !== "NONE")
      ? Array.from({ length: Math.max(2, ...taxOperation.restored.map(([field]) => Number(/^person_(\d+)_/.exec(field)?.[1] ?? 0))) }, (_, i) => ({ key: `restored-${i + 1}` }))
      : initializeAllowanceEditorSlots(input.personAllowanceSlots),
  );
  const nextAllowanceKey = useRef(allowanceSlots.length + 1);
  const canAddAllowanceSlot = allowanceSlots.length < MAX_PERSON_ALLOWANCE_SLOTS;

  return (
    <section
      data-testid="tax-document-settings"
      aria-labelledby="tax-document-settings-title"
      className="rounded-card border border-border-default bg-card p-4"
    >
      <h2 id="tax-document-settings-title" className="text-section font-medium text-text-primary">
        Skatteinställningar
      </h2>
      <p className="mt-1 text-label text-text-secondary">
        Ange explicita moms- och avdragsfakta. Uppgifterna fryses när en offertversion skapas.
      </p>

      <form {...taxOperation.formProps}
        action={action}
        className="mt-4 flex flex-col gap-4"
        noValidate
        onSubmit={(event) => {
          if (reverseChargeDeductionConflict || fixedPriceScopeMissing) {
            event.preventDefault();
          } else { taxOperation.formProps.onSubmit(event); }
        }}
      >
        {taxOperation.recovery}
        <fieldset disabled={!taxOperation.ready} className="contents">
        <input type="hidden" name="id" value={calculationId} />
        {/* namedItem resolves this unique control ID, avoiding the hidden/checkbox name pair. */}
        <FormErrorSummary message={mine ? state.formError : null} fieldErrors={mine ? {
          ...state.fieldErrors,
          genuine_fixed_price: undefined,
          [genuineFixedPriceControlId]: state.fieldErrors.genuine_fixed_price,
        } : undefined} />
        {mine && state.status === "success" ? (
          <p role="status" className="text-label text-ok-text">
            Skatte- och momsuppgifterna har sparats.
          </p>
        ) : null}
        {mine && isRetryableCalcError(state) ? (
          <p role="status" className="text-label text-warn-text">
            Ett tillfälligt fel inträffade. Försök igen.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField
            name="document_vat_type"
            label="Momshantering"
            options={[...VAT_OPTIONS]}
            defaultValue={documentVatType}
            error={
              err("document_vat_type") ??
              (reverseChargeDeductionConflict
                ? REVERSE_CHARGE_DEDUCTION_CONFLICT_MESSAGE
                : undefined)
            }
            onChange={setDocumentVatType}
          />
          {documentVatType === "REVERSE_CHARGE_CONSTRUCTION" ? (
            <TextField
              name="buyer_vat_number"
              label="Köparens momsregistreringsnummer"
              defaultValue={v("buyer_vat_number", input.buyerVatNumber ?? "")}
              error={err("buyer_vat_number")}
              autoComplete="off"
            />
          ) : (
            <input type="hidden" name="buyer_vat_number" value="" />
          )}
          <SelectField
            name="deduction_choice"
            label="Skatteavdrag"
            options={[...DEDUCTION_OPTIONS]}
            defaultValue={deductionChoice}
            error={
              err("deduction_choice") ??
              (reverseChargeDeductionConflict
                ? REVERSE_CHARGE_DEDUCTION_CONFLICT_MESSAGE
                : undefined)
            }
            onChange={(next) => setDeductionChoice(next as TaxDeductionChoice)}
          />
          {readsGreen ? (
            <SelectField
              name="green_basis_method"
              label="Beräkningsgrund för grön teknik"
              options={[...BASIS_OPTIONS]}
              defaultValue={greenBasisMethod}
              error={err("green_basis_method")}
              onChange={(next) => setGreenBasisMethod(next as GreenBasisMethod)}
            />
          ) : (
            <input type="hidden" name="green_basis_method" value="ACTUAL_ELIGIBLE_COSTS" />
          )}
          {readsRot ? (
            <TextField
              name="payment_date"
              label="Betalningsdatum för ROT"
              type="date"
              defaultValue={v("payment_date", input.paymentDate ?? "")}
              error={err("payment_date")}
            />
          ) : (
            <input type="hidden" name="payment_date" value="" />
          )}
          {readsGreen ? (
            <TextField
              name="final_payment_date"
              label="Slutbetalningsdatum för grön teknik"
              type="date"
              defaultValue={v("final_payment_date", input.finalPaymentDate ?? "")}
              error={err("final_payment_date")}
            />
          ) : (
            <input type="hidden" name="final_payment_date" value="" />
          )}
        </div>

        {reverseChargeDeductionConflict ? (
          <p
            id="tax-posture-conflict"
            role="alert"
            data-testid="tax-posture-conflict"
            className="rounded-control border border-risk-text bg-risk-surface px-3 py-2 text-label text-risk-text"
          >
            {REVERSE_CHARGE_DEDUCTION_CONFLICT_MESSAGE}
          </p>
        ) : null}

        {readsRot || readsGreen ? (
        <fieldset className="rounded-control border border-border-default p-3">
          <legend className="px-1 text-label font-medium text-text-primary">Återstående utrymme per person</legend>
          <p className="mb-3 text-caption text-text-secondary">
            Använd endast neutrala platser som PERSON_1, PERSON_2 osv.; personnummer och namn lagras inte här.
          </p>
          {allowanceSlots.map((editorSlot, index) => {
            const number = index + 1;
            const slot = editorSlot.source;
            const rotAliasFallback = input.deductionChoice === "ROT" ? slot?.remainingAllowanceOre : undefined;
            const greenAliasFallback = input.deductionChoice === "GREEN" ? slot?.remainingAllowanceOre : undefined;
            return (
              <div
                key={editorSlot.key}
                className={[
                  "mb-3 grid grid-cols-1 items-end gap-3",
                  readsRot && readsGreen
                    ? "sm:grid-cols-[1fr_1fr_1fr_auto]"
                    : readsRot
                      ? "sm:grid-cols-[1fr_1fr_auto]"
                      : "sm:grid-cols-[1fr_auto]",
                ].join(" ")}
              >
                {readsRot ? (
                  <>
                    <TextField
                      name={`person_${number}_rot_remaining_kronor`}
                      label={`Person ${number}: ROT kvar (kr)`}
                      defaultValue={v(
                        `person_${number}_rot_remaining_kronor`,
                        oreValue(slot?.remainingRotAllowanceOre ?? rotAliasFallback),
                      )}
                      error={err(`person_${number}_rot_remaining_kronor`)}
                    />
                    <TextField
                      name={`person_${number}_combined_rot_rut_remaining_kronor`}
                      label={`Person ${number}: ROT/RUT kvar (kr)`}
                      defaultValue={v(
                        `person_${number}_combined_rot_rut_remaining_kronor`,
                        oreValue(slot?.remainingCombinedRotRutAllowanceOre),
                      )}
                      error={err(`person_${number}_combined_rot_rut_remaining_kronor`)}
                    />
                  </>
                ) : null}
                {readsGreen ? (
                  <TextField
                    name={`person_${number}_green_remaining_kronor`}
                    label={`Person ${number}: grön teknik kvar (kr)`}
                    defaultValue={v(
                      `person_${number}_green_remaining_kronor`,
                      oreValue(slot?.remainingGreenAllowanceOre ?? greenAliasFallback),
                    )}
                    error={err(`person_${number}_green_remaining_kronor`)}
                  />
                ) : null}
                <button
                  type="button"
                  aria-label={`Ta bort person ${number}`}
                  disabled={allowanceSlots.length <= 2}
                  onClick={() => {
                    taxOperation.markChanged();
                    setAllowanceSlots((current) =>
                      removeAllowanceEditorSlot(current, editorSlot.key),
                    );
                  }}
                  className="min-h-control-lg min-w-control-lg rounded-control border border-border-strong px-3 py-2 text-body text-text-secondary hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:bg-inset disabled:text-text-disabled"
                >
                  Ta bort
                </button>
              </div>
            );
          })}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canAddAllowanceSlot}
              onClick={() => {
                taxOperation.markChanged();
                const key = `new-${nextAllowanceKey.current}`;
                nextAllowanceKey.current += 1;
                setAllowanceSlots((current) => addAllowanceEditorSlot(current, key));
              }}
              className="min-h-control-lg min-w-control-lg rounded-control border border-border-strong px-3 py-2 text-body text-text-secondary hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:bg-inset disabled:text-text-disabled"
            >
              Lägg till person
            </button>
            <span aria-live="polite" className="text-caption text-text-secondary">
              {allowanceSlots.length} av {MAX_PERSON_ALLOWANCE_SLOTS} personer
            </span>
          </div>
        </fieldset>
        ) : null}

        {readsGreen && usesFixedPrice ? (
        <fieldset className="rounded-control border border-border-default p-3">
          <legend className="px-1 text-label font-medium text-text-primary">Fastprisunderlag (endast vid 97 %)</legend>
          <label htmlFor={genuineFixedPriceControlId} className="mb-3 flex min-h-control-lg items-center gap-2 text-label text-text-primary">
            <input type="hidden" name="genuine_fixed_price" value="false" />
            <input
              id={genuineFixedPriceControlId}
              type="checkbox"
              name="genuine_fixed_price"
              aria-invalid={err("genuine_fixed_price") ? "true" : undefined}
              aria-describedby={err("genuine_fixed_price") ? genuineFixedPriceErrorId : undefined}
              value="true"
              defaultChecked={
                v("genuine_fixed_price", String(input.genuineFixedPrice)) === "true"
              }
              className="size-5 shrink-0 rounded-control border-border-strong"
            />
            Äkta fastprisavtal
          </label>
          {err("genuine_fixed_price") ? (
            <p id={genuineFixedPriceErrorId} role="alert" className="mb-3 text-label text-risk-text">
              {err("genuine_fixed_price")}
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              name="fixed_price_kronor"
              label="Fastpris totalt (kr, inkl. moms (brutto, före 97 %))"
              defaultValue={v("fixed_price_kronor", oreValue(input.fixedPriceOre))}
              error={err("fixed_price_kronor")}
            />
            <TextField
              name="fixed_solar_kronor"
              label="Sol (kr, inkl. moms (brutto, före 97 %))"
              defaultValue={v("fixed_solar_kronor", oreValue(input.fixedPriceCategorySplitOre?.SOLAR))}
              error={err("fixed_solar_kronor")}
            />
            <TextField
              name="fixed_storage_kronor"
              label="Lagring (kr, inkl. moms (brutto, före 97 %))"
              defaultValue={v("fixed_storage_kronor", oreValue(input.fixedPriceCategorySplitOre?.STORAGE))}
              error={err("fixed_storage_kronor")}
            />
            <TextField
              name="fixed_charging_kronor"
              label="Laddning (kr, inkl. moms (brutto, före 97 %))"
              defaultValue={v("fixed_charging_kronor", oreValue(input.fixedPriceCategorySplitOre?.CHARGING))}
              error={err("fixed_charging_kronor")}
            />
          </div>
          <fieldset className="mt-4 rounded-control border border-border-default p-3">
            <legend className="px-1 text-label font-medium text-text-primary">
              Rader som omfattas av fastprisavtalet
            </legend>
            <p className="mb-3 text-caption text-text-secondary">
              Välj endast de inkluderade raderna för grön teknik som ingår i det äkta
              fastprisavtalet. Eventuella ROT-rader och övriga rader ligger uttryckligen utanför
              detta avtal.
            </p>
            {fixedPriceScopeRows.length === 0 ? (
              <p className="text-label text-warn-text">
                Det finns inga inkluderade och grönklassificerade rader att välja.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {fixedPriceScopeRows.map((row) => {
                  const checkboxId = `fixed-price-row-${row.id}`;
                  return (
                    <label
                      key={row.id}
                      htmlFor={checkboxId}
                      className="flex min-h-control-lg items-center gap-2 text-label text-text-primary"
                    >
                      <input
                        id={checkboxId}
                        type="checkbox"
                        name="fixed_price_row_ids"
                        value={row.id}
                        checked={selectedFixedPriceRowIds.has(row.id)}
                        onChange={(event) => {
                          setSelectedFixedPriceRowIds((current) => {
                            const next = new Set(current);
                            if (event.target.checked) next.add(row.id);
                            else next.delete(row.id);
                            return next;
                          });
                        }}
                        className="mt-0.5 size-5 shrink-0 rounded-control border-border-strong"
                      />
                      <span>{row.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {err("fixed_price_row_ids") || fixedPriceScopeMissing ? (
              <p
                id="fixed-price-row-scope-error"
                role="alert"
                data-testid="fixed-price-row-scope-error"
                className="mt-3 text-label text-risk-text"
              >
                {err("fixed_price_row_ids") ??
                  "Välj minst en inkluderad rad för det äkta fastprisavtalet."}
              </p>
            ) : null}
          </fieldset>
        </fieldset>
        ) : (
          <input type="hidden" name="genuine_fixed_price" value="false" />
        )}

        <button
          type="submit"
          disabled={pending || reverseChargeDeductionConflict || fixedPriceScopeMissing}
          aria-describedby={
            reverseChargeDeductionConflict
              ? "tax-posture-conflict"
              : fixedPriceScopeMissing
                ? "fixed-price-row-scope-error"
                : undefined
          }
          className="min-h-control-lg min-w-control-lg self-start rounded-control bg-ink px-4 py-2 text-body font-medium text-white disabled:bg-inset disabled:text-text-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {pending ? "Sparar…" : "Spara skatte- och momsuppgifter"}
        </button>

        </fieldset>
      </form>
    </section>
  );
}
