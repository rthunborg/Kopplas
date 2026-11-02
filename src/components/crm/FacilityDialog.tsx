"use client";

/**
 * Facility create/edit dialog (Story 3.2, Task 2.3 / 3) — wired to the 3.1
 * `createFacility` / `updateFacility` envelope commands via a server action.
 *
 * Requires `customer_id` + `name` (mirrors the 3.1 contract). Same accessible-dialog
 * shape as the customer dialog: programmatic error association, input preserved on
 * failure, focus returned to the invoking control on close.
 */
import { useActionState, useEffect } from "react";
import { Dialog } from "./Dialog";
import { DialogActions } from "./CustomerDialog";
import { FormErrorSummary, TextField } from "./FormField";
import {
  createFacilityAction,
  updateFacilityAction,
} from "@/features/crm/actions";
import { CRM_ACTION_INITIAL } from "@/features/crm/action-state";

export interface FacilityEditDefaults {
  readonly id: string;
  readonly name: string;
  readonly address_line1: string | null;
  readonly address_line2: string | null;
  readonly postal_code: string | null;
  readonly city: string | null;
}

export function FacilityDialog({
  open,
  onClose,
  mode,
  customerId,
  defaults,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly mode: "create" | "edit";
  readonly customerId: string;
  readonly defaults?: FacilityEditDefaults;
}) {
  // Keyed remount on open gives a clean action state each time (no stale prior-submit
  // errors) without a reset-on-open effect.
  const bodyKey = `${open ? "open" : "closed"}:${defaults?.id ?? "new"}`;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Ny anläggning" : "Redigera anläggning"}
      variant="sheet"
    >
      <FacilityDialogBody
        key={bodyKey}
        onClose={onClose}
        mode={mode}
        customerId={customerId}
        defaults={defaults}
      />
    </Dialog>
  );
}

function FacilityDialogBody({
  onClose,
  mode,
  customerId,
  defaults,
}: {
  readonly onClose: () => void;
  readonly mode: "create" | "edit";
  readonly customerId: string;
  readonly defaults?: FacilityEditDefaults;
}) {
  const action = mode === "create" ? createFacilityAction : updateFacilityAction;
  const [state, formAction, pending] = useActionState(action, CRM_ACTION_INITIAL);

  // Initial focus is owned by the shared `Dialog` (it focuses the first CONTENT field
  // on open); the body must NOT also focus, which would race the parent effect.
  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  const v = (field: string, fallback: string | null | undefined): string =>
    state.values[field] ?? fallback ?? "";

  return (
    <form action={formAction} className="flex min-w-0 flex-col gap-6" aria-busy={pending} noValidate>
      <FormErrorSummary message={state.formError} fieldErrors={state.fieldErrors} />
      {/* customer_id is required by createFacility; on edit it is forwarded for
          revalidation targeting (the command keys off the facility id). */}
      <input type="hidden" name="customer_id" value={customerId} />
      {mode === "edit" && defaults && (
        <input type="hidden" name="id" value={defaults.id} />
      )}

      <fieldset className="min-w-0 space-y-4">
        <legend className="mb-3 text-section font-medium text-text-primary">Anläggningsuppgifter</legend>
        <TextField
          name="name"
          label="Namn"
          required
          defaultValue={v("name", defaults?.name)}
          error={state.fieldErrors.name}
        />
      </fieldset>
      <fieldset className="min-w-0 space-y-4 border-t border-border-subtle pt-4">
        <legend className="text-section font-medium text-text-primary">Adress</legend>
        <TextField
          name="address_line1"
          label="Adress"
          defaultValue={v("address_line1", defaults?.address_line1)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="postal_code"
            label="Postnummer"
            defaultValue={v("postal_code", defaults?.postal_code)}
          />
          <TextField
            name="city"
            label="Ort"
            defaultValue={v("city", defaults?.city)}
          />
        </div>
      </fieldset>

      <DialogActions onClose={onClose} pending={pending} />
    </form>
  );
}
