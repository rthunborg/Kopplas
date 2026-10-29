"use client";

/**
 * Accessible form-field primitives for the CRM dialogs (Story 3.2, Task 3.2 / AC3).
 *
 * Each field:
 *   - has a `<label htmlFor>` bound to the control (icon-only controls get accessible
 *     names elsewhere — this is for labelled inputs);
 *   - on a validation failure sets `aria-invalid="true"` and `aria-describedby`
 *     pointing at the field's error node (programmatic error association — UX §10);
 *   - renders the error in plain Swedish next to the field (no color-only signalling:
 *     the message text carries the meaning, the red tint reinforces it).
 *
 * The `FormErrorSummary` is the top-of-form blocking-error summary in an
 * `aria-live="polite"` region (UX §9), kept SEPARATE from non-blocking warnings (the
 * duplicate-like advisory is a `FormWarning`, not a blocking error).
 */
import { useId } from "react";

export function TextField({
  name,
  label,
  type = "text",
  required = false,
  defaultValue = "",
  error,
  autoComplete,
  inputRef,
}: {
  readonly name: string;
  readonly label: string;
  readonly type?: string;
  readonly required?: boolean;
  readonly defaultValue?: string;
  readonly error?: string | null;
  readonly autoComplete?: string;
  readonly inputRef?: React.Ref<HTMLInputElement>;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = Boolean(error);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label font-medium text-text-secondary">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-risk-text">
            *
          </span>
        )}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={hasError ? "true" : undefined}
        aria-describedby={hasError ? errorId : undefined}
        className="min-h-control-lg rounded-control border-0 bg-sunken in-[.bg-sunken]:bg-card px-3 py-2 text-body text-text-primary focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink"
      />
      {hasError && (
        <p id={errorId} className="text-label text-risk-text">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  required = false,
  defaultValue = "",
  error,
  onChange,
  selectRef,
  testId,
}: {
  readonly name: string;
  readonly label: string;
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  readonly required?: boolean;
  readonly defaultValue?: string;
  readonly error?: string | null;
  readonly onChange?: (value: string) => void;
  readonly selectRef?: React.Ref<HTMLSelectElement>;
  /** Optional stable test hook placed on the `<select>` element (e.g. E2E getByTestId). */
  readonly testId?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = Boolean(error);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label font-medium text-text-secondary">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-risk-text">
            *
          </span>
        )}
      </label>
      <select
        ref={selectRef}
        id={id}
        name={name}
        data-testid={testId}
        required={required}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={hasError ? "true" : undefined}
        aria-describedby={hasError ? errorId : undefined}
        className="min-h-control-lg rounded-control border-0 bg-sunken in-[.bg-sunken]:bg-card px-3 py-2 text-body text-text-primary focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p id={errorId} className="text-label text-risk-text">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked = false,
}: {
  readonly name: string;
  readonly label: string;
  readonly defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex min-h-control-lg items-center gap-2">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-5 shrink-0 rounded border-border-strong accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
      <label htmlFor={id} className="flex min-h-control-lg flex-1 items-center text-body text-text-secondary">
        {label}
      </label>
    </div>
  );
}

/**
 * Top-of-form BLOCKING error summary (UX §9). Lives in an `aria-live="polite"` region
 * so a screen reader announces it when a submit fails. `role="alert"` makes it an
 * assertive landmark for the blocking case. Renders nothing when there is no error.
 */
export function FormErrorSummary({
  message,
  fieldErrors,
}: {
  message: string | null;
  readonly fieldErrors?: Readonly<Record<string, string | undefined>>;
}) {
  const entries = Object.entries(fieldErrors ?? {}).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );
  return (
    <div aria-live="polite" data-testid="form-error-summary">
      {(message || entries.length > 0) && (
        <div role="alert" className="rounded-control border border-risk-text bg-risk-surface px-3 py-2 text-label text-risk-text">
          {message && <p>{message}</p>}
          {entries.length > 0 && (
            <ul className="mt-1 list-inside list-disc">
              {entries.map(([name, error]) => (
                <li key={name}>
                  <a href="#" className="inline-flex min-h-control-lg items-center underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" onClick={(event) => {
                    event.preventDefault();
                    const control = event.currentTarget.closest("form")?.elements.namedItem(name);
                    if (control instanceof HTMLElement) {
                      control.focus();
                      control.scrollIntoView({ block: "nearest" });
                    }
                  }}>{error}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A NON-blocking advisory warning (UX §9 — separate from blocking errors). Used for
 * the duplicate-like advisory: it never blocks submit, it just informs. Visually and
 * semantically distinct from the blocking `FormErrorSummary` (amber, `role="status"`).
 */
export function FormWarning({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      data-testid="form-warning"
      className="rounded-control border border-warn-text bg-warn-surface px-3 py-2 text-label text-warn-text"
    >
      {message}
    </p>
  );
}
