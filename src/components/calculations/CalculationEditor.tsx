"use client";

/**
 * Calculation editor island (Story 5.2, Task 4.2 / AC1-AC6) — the heart of this story.
 *
 * Desktop layout (UX §5): a record header (title + status), a customer-context block, a
 * section/row workspace, and a persistent totals/readiness summary panel on the right. On a
 * narrow viewport the summary becomes an INLINE block BELOW the editor and controls stack
 * without overlap (responsive via Tailwind `lg:` breakpoints — NO horizontal-precision
 * dragging for core work).
 *
 * Every displayed total comes from the pure `totals.ts` (engine-backed) — NEVER inline math
 * in this island. Section/row create/edit/archive/reorder wire to the Task 3 server actions
 * via `useActionState` on the child forms. NO deferred-workflow label/control. The Story 5.4
 * readiness classifier + the gated create-quote affordance + the pre-quote snapshot PREVIEW +
 * the "new version after send" message are rendered here (from the PURE `classifyReadiness` /
 * `resolveVatDisplayPosture` helpers — the classification lives in fast-gate-protected `.ts`,
 * never inline). Kronor/percent at the input boundary; öre/rounding wording only in the totals
 * summary (AC6).
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useEditorOperation, useRetainedEditorHost } from "./CalculationList";
import { projectEditorFacts, HEADER_FACTS, SECTION_FACTS, ROW_FACTS } from "@/features/calculations/editor-operation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormErrorSummary, TextField } from "@/components/crm/FormField";
import { SectionEditor } from "./SectionEditor";
import { TotalsSummary } from "./TotalsSummary";
import { ReadinessSummary } from "./ReadinessSummary";
import { PreQuotePreview, type PreQuoteTerms } from "./PreQuotePreview";
import { TaxSettingsPanel } from "./TaxSettingsPanel";
import {
  archiveCalculationAction,
  createSectionAction,
  reorderSectionsAction,
  updateCalculationAction,
} from "@/features/calculations/actions";
import {
  CALC_ACTION_INITIAL,
  isRetryableCalcError,
} from "@/features/calculations/action-state";
import { moveDown, moveUp, toOrderedIds } from "@/features/calculations/ordering";
import {
  computeCalcTotal,
  computeLineTotal,
  resolveTotalDisplay,
} from "@/features/calculations/totals";
import { classifyReadiness } from "@/features/calculations/readiness";
import { canAddCalculationRow, MAX_CALCULATION_ROWS } from "@/features/calculations/limits";
import { resolveTaxReadiness } from "@/features/calculations/tax-readiness";
import { resolveVatDisplayPosture } from "@/features/calculations/vat-posture";
import type { CalculationDetail } from "@/features/calculations/read";
import type { RowSourceLists } from "@/features/calculations/source-options";
import type {
  DeductionClassification,
  VatDisplayMode,
  VatDisplayPosture,
} from "@/lib/money";

const STATUS_LABELS: Record<string, string> = {
  draft: "Utkast",
  ready: "Klar",
  archived: "Arkiverad",
};

const GREEN_SCOPE_CLASSIFICATION_LABELS: Partial<
  Record<DeductionClassification, string>
> = {
  GREEN_SOLAR_LABOR: "Sol – arbete",
  GREEN_SOLAR_MATERIAL: "Sol – material",
  GREEN_STORAGE_LABOR: "Lagring – arbete",
  GREEN_STORAGE_MATERIAL: "Lagring – material",
  GREEN_CHARGING_LABOR: "Laddning – arbete",
  GREEN_CHARGING_MATERIAL: "Laddning – material",
};

export function CalculationEditor({
  detail,
  sources,
  defaultVatDisplay,
  vatPostureResolved,
  quoteTerms,
  previewQuoteCaptureDate,
  reviewedSnapshotDigest,
  filesPanel,
}: {
  readonly detail: CalculationDetail;
  /** The ACTIVE pricing-source lists for the row-editor selection affordance (Story 5.3). */
  readonly sources: RowSourceLists;
  /** The tenant's configured `default_vat_display` (Story 5.4 — the resolved posture input). */
  readonly defaultVatDisplay: VatDisplayMode;
  /** False when the settings read faulted / no row → surfaces a "VAT posture unresolved" warning. */
  readonly vatPostureResolved: boolean;
  /** The tenant's quote-terms for the pre-quote preview (null when none/unread). */
  readonly quoteTerms: PreQuoteTerms | null;
  /** Server-rendered quote-capture date used by both preview policy and review token. */
  readonly previewQuoteCaptureDate: string;
  /** Server-generated digest of all customer-visible source semantics. */
  readonly reviewedSnapshotDigest: string;
  /** The Story 8.2 entity file panel (calculation_attachment upload + list), when provided. */
  readonly filesPanel?: ReactNode;
}) {
  const { header, sections, customer } = detail;
  const headerFacts = projectEditorFacts(header, HEADER_FACTS);
  const sectionTrees = sections.map(s => ({ section: projectEditorFacts(s, SECTION_FACTS), rows: s.rows.map(r => projectEditorFacts(r, ROW_FACTS)) }));

  const titleOperation = useEditorOperation(updateCalculationAction, CALC_ACTION_INITIAL, `${header.id}/title`, () => ({ version: 1, form: "calculation", header: headerFacts }));
  const [titleState, titleAction, titlePending] = [titleOperation.state, titleOperation.action, titleOperation.pending];
  const sectionOperation = useEditorOperation(createSectionAction, CALC_ACTION_INITIAL, `${header.id}/new-section`, () => ({ version: 1, form: "section", header: headerFacts }));
  const [sectionState, sectionAction, sectionPending] = [sectionOperation.state, sectionOperation.action, sectionOperation.pending];
  const archiveOperation = useEditorOperation(archiveCalculationAction, CALC_ACTION_INITIAL, `${header.id}/archive`, () => ({ version: 1, form: "archive_calculation", header: headerFacts, sections: sectionTrees }));
  const [archiveState, archiveAction] = [archiveOperation.state, archiveOperation.action];
  const reorderOperation = useEditorOperation(reorderSectionsAction, CALC_ACTION_INITIAL, `${header.id}/section-order`, () => ({ version: 1, form: "reorder_sections", header: headerFacts, siblings: sections.map(s => ({ id: s.id, sort_order: s.sort_order })) }));
  const [sectionReorderState, sectionReorderAction] = [reorderOperation.state, reorderOperation.action];
  const [showAddSection, setShowAddSection] = useState(false);
  const restoreSectionHost = useRetainedEditorHost(`${header.id}/new-section`);
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const confirmDeparture = useCallback(() => {
    const protectedDraft = root.current?.querySelector('[data-editor-dirty="true"], [data-editor-protected="true"]');
    return !protectedDraft || window.confirm("Du har osparade ändringar eller ett obekräftat resultat. Vill du lämna formuläret?");
  }, []);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!root.current?.querySelector('[data-editor-dirty="true"], [data-editor-protected="true"]')) return;
      event.preventDefault(); event.returnValue = "";
    };
    const navigation = (window as Window & { navigation?: EventTarget }).navigation;
    const traverse = (event: Event) => {
      const movement = event as Event & { navigationType: string; destination: { sameDocument: boolean; url: string } };
      if (event.defaultPrevented || !event.cancelable || movement.navigationType !== "traverse" || !movement.destination.sameDocument) return;
      const destination = new URL(movement.destination.url);
      if (destination.origin === location.origin && destination.pathname === location.pathname && destination.search === location.search) return;
      if (!confirmDeparture()) event.preventDefault();
    };
    const mountedRoot = root.current;
    const shellDeparture = (event: Event) => {
      if (event.target !== mountedRoot || event.defaultPrevented || !event.cancelable) return;
      if (!confirmDeparture()) event.preventDefault();
    };
    mountedRoot?.addEventListener("kopplas:calculation-departure-request", shellDeparture);
    window.addEventListener("beforeunload", beforeUnload);
    navigation?.addEventListener("navigate", traverse);
    return () => {
      mountedRoot?.removeEventListener("kopplas:calculation-departure-request", shellDeparture);
      window.removeEventListener("beforeunload", beforeUnload);
      navigation?.removeEventListener("navigate", traverse);
    };
  }, [confirmDeparture]);

  const titleMine = titleState.form === "calculation";
  useEffect(() => {
    if (
      titleState.status === "success" ||
      sectionState.status === "success" ||
      archiveState.status === "success" ||
      sectionReorderState.status === "success"
    ) {
      router.refresh();
    }
  }, [
    archiveState.status,
    router,
    sectionReorderState.status,
    sectionState.status,
    titleState.status,
  ]);

  // Story 5.4 — RESOLVE the VAT display posture from the tenant setting (the inherited 5.2
  // Med deferral) via the PURE helper: a `private` customer → the always-incl invariant; a
  // NON-private customer (company/brf/public) → the tenant's `default_vat_display` AS-IS
  // (NOT hard-coded togglable). The öre were always correct; only the default VIEW label
  // could contradict a `company_excl` tenant.
  const posture: VatDisplayPosture = resolveVatDisplayPosture(
    customer.customer_type,
    defaultVatDisplay,
  );
  const calcTotal = computeCalcTotal(
    sections.map((s) => ({
      rows: s.rows.map((r) => ({
        row_type: r.row_type,
        quantity: r.quantity,
        unit_sell_ore: r.unit_sell_ore,
        vat_rate_bp: r.vat_rate_bp,
        vat_type: r.vat_type,
        included_in_invoice_total: r.included_in_invoice_total,
        deduction_classification: r.deduction_classification,
        is_hidden: r.is_hidden,
        is_optional: r.is_optional,
        is_selected: r.is_selected,
      })),
    })),
    previewQuoteCaptureDate,
  );
  // NEVER fabricate a plausible-looking zero when the engine fails (the AC4 money-display
  // risk): surface a failed-total state instead. `TotalsSummary` renders only when the
  // total resolved OK; otherwise a distinct error placeholder is shown.
  const view = calcTotal.ok
    ? resolveTotalDisplay(calcTotal.value, posture)
    : null;

  const taxRows = sections.flatMap((section) =>
    section.rows.map((row) => {
      const line = computeLineTotal({
        row_type: row.row_type,
        quantity: row.quantity,
        unit_sell_ore: row.unit_sell_ore,
        vat_rate_bp: row.vat_rate_bp,
        vat_type: row.vat_type,
        included_in_invoice_total: row.included_in_invoice_total,
        deduction_classification: row.deduction_classification,
        is_hidden: row.is_hidden,
        is_optional: row.is_optional,
        is_selected: row.is_selected,
      }, previewQuoteCaptureDate);
      return {
        id: row.id,
        computationFailed: !line.ok,
        netOre: line.ok ? line.value.netOre : 0,
        vatType: row.vat_type,
        rateBp: row.vat_rate_bp,
        includedInInvoiceTotal: row.included_in_invoice_total,
        deductionClassification: row.deduction_classification,
        summaryCategory:
          row.row_type === "labor"
            ? "labor" as const
            : row.row_type === "material"
              ? "material" as const
              : "other" as const,
      };
    }),
  );
  const taxResolution = resolveTaxReadiness({
    taxInput: header.tax_input_snapshot,
    rows: taxRows,
    // Header revision is the server-projected calculation capture fact used for
    // this preview. Payment dates resolve only ROT/green policy, never VAT.
    quoteCaptureDate: previewQuoteCaptureDate,
    customerEligibilityPosture:
      customer.customer_type === "private" ||
      customer.customer_type === "company" ||
      customer.customer_type === "brf" ||
      customer.customer_type === "public"
        ? customer.customer_type
        : "public",
    hasInvalidRow: taxRows.some((row) => row.computationFailed),
  });
  const deductionChoice = header.tax_input_snapshot?.deductionChoice ?? "NONE";
  const activeRowCount = sections.reduce(
    (count, section) => count + section.rows.length,
    0,
  );
  const canAddRow = canAddCalculationRow(activeRowCount);
  const fixedPriceScopeRows = sections.flatMap((section) =>
    section.rows
      .filter(
        (row) =>
          row.included_in_invoice_total &&
          GREEN_SCOPE_CLASSIFICATION_LABELS[row.deduction_classification] !== undefined,
      )
      .map((row) => ({
        id: row.id,
        label: [
          section.title ?? "Namnlös sektion",
          row.label ?? row.description ?? (row.row_type === "labor" ? "Arbetsrad" : "Materialrad"),
          GREEN_SCOPE_CLASSIFICATION_LABELS[row.deduction_classification],
        ].join(" · "),
      })),
  );

  // Story 5.4 — the PURE readiness report (blockers vs warnings). The classification lives in
  // fast-gate-protected `readiness.ts`; this island only DISPLAYS it and GATES the create-quote
  // affordance on it. The tax context is a forward-seam: no ROT/grön assumption is persisted on a
  // calc today (Epic 6 owns quote-version tax assumptions), so `hasDeductionAssumption` is false
  // here — the classifier's tax path is unit-pinned so Epic 6 can feed it a real assumption.
  const readinessReport = classifyReadiness({
    customer: {
      customer_id: customer.customer_id,
      customer_display_name: customer.customer_display_name,
      customer_type: customer.customer_type,
      facility_name: customer.facility_name,
      contact_name: customer.contact_name,
    },
    sections: sections.map((s) => ({
      rows: s.rows.map((r) => ({
        quantity: r.quantity,
        unit_sell_ore: r.unit_sell_ore,
        unit_cost_ore: r.unit_cost_ore,
        vat_rate_bp: r.vat_rate_bp,
        vat_type: r.vat_type,
        included_in_invoice_total: r.included_in_invoice_total,
        deduction_classification: r.deduction_classification,
        is_hidden: r.is_hidden,
        is_optional: r.is_optional,
        is_selected: r.is_selected,
        row_type: r.row_type,
        source_kind: r.source_kind,
      })),
    })),
    vatPostureResolved,
    tax: {
      hasDeductionAssumption: deductionChoice !== "NONE",
      deductionType:
        deductionChoice === "ROT"
          ? "rot"
          : deductionChoice === "GREEN"
            ? "gron_teknik"
            : deductionChoice === "ROT_AND_GREEN"
              ? "rot_and_gron_teknik"
              : undefined,
      eligibilityPosture:
        customer.customer_type === "private" ||
        customer.customer_type === "company" ||
        customer.customer_type === "brf" ||
        customer.customer_type === "public"
          ? customer.customer_type
          : undefined,
      blockingCodes: taxResolution.blockingCodes,
    },
  });

  // Server-owned section ordering (R-503): move-up/down computes the new ordered-id array
  // via the pure `ordering.ts` and hands it to the atomic `reorderSections` command — never
  // a client loop of single UPDATEs. Mirrors the row-move pattern in `SectionEditor`.
  const orderedSectionIds = toOrderedIds(sections);
  const sectionReorderError =
    sectionReorderState.status === "error"
      ? sectionReorderState.formError
      : null;
  const sectionReorderRetryable = isRetryableCalcError(sectionReorderState);

  return (
    <div ref={root} data-testid="calculation-editor" data-calculation-departure-root="true"
      onClickCapture={event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
        if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
        const destination = new URL(link.href);
        if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.search === location.search)) return;
        if (!confirmDeparture()) { event.preventDefault(); event.stopPropagation(); }
      }}
      className="flex min-w-0 flex-col gap-6 break-words p-4 sm:p-6 [&_input]:min-w-0 [&_select]:min-w-0 [&_select]:max-w-full">
      {[titleOperation, sectionOperation, archiveOperation, reorderOperation].map((operation, index) => (
        <span key={index} hidden data-editor-dirty={operation.hasDraftChanges} data-editor-protected={operation.hasProtectedOperation} />
      ))}
      <Link
        href="/calculations"
        className="inline-flex min-h-control-lg min-w-control-lg self-start items-center text-label text-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        ← Kalkyler
      </Link>

      {/* Record header (title + status) + customer context. */}
      <header
        data-testid="calculation-header"
        className="flex flex-col gap-4 rounded-card border border-border-default bg-card p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="break-words text-title font-medium text-text-primary">{header.title}</h1>
          <span
            data-testid="calculation-status"
            className="rounded-full border border-border-strong px-3 py-1 text-caption font-medium text-text-secondary"
          >
            {STATUS_LABELS[header.status] ?? header.status}
          </span>
        </div>

        <dl
          data-testid="customer-context"
          className="grid grid-cols-1 gap-2 text-label sm:grid-cols-3"
        >
          <div>
            <dt className="text-text-tertiary">Kund</dt>
            <dd className="font-medium text-text-primary">
              {customer.customer_display_name ?? "—"}
            </dd>
          </div>
          {customer.facility_name && (
            <div>
              <dt className="text-text-tertiary">Anläggning</dt>
              <dd className="font-medium text-text-primary">{customer.facility_name}</dd>
            </div>
          )}
          {customer.contact_name && (
            <div>
              <dt className="text-text-tertiary">Kontakt</dt>
              <dd className="font-medium text-text-primary">{customer.contact_name}</dd>
            </div>
          )}
        </dl>

        {/* Rename the calc + change status. */}
        <form key={titleOperation.hydrationKey} {...titleOperation.formProps} action={titleAction} className="flex flex-col gap-3" noValidate>{titleOperation.recovery}
        <fieldset disabled={!titleOperation.ready} className="contents">
          <input type="hidden" name="id" value={header.id} />
          <FormErrorSummary message={titleMine ? titleState.formError : null} fieldErrors={titleMine ? titleState.fieldErrors : undefined} />
          {titleMine && titleState.status === "success" && (
            <p role="status" className="text-label text-ok-text">
              Kalkylen har sparats.
            </p>
          )}
          {titleMine && isRetryableCalcError(titleState) && (
            <p role="status" className="text-label text-warn-text">
              Ett tillfälligt fel inträffade. Försök igen.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 sm:flex-1">
              <TextField
                name="title"
                label="Titel"
                defaultValue={
                  titleOperation.draftValue("title", (titleMine && titleState.values.title) || header.title)
                }
                error={titleMine ? titleState.fieldErrors.title : undefined}
              />
            </div>
            <button
              type="submit"
              disabled={titlePending}
              className="min-h-control-lg min-w-control-lg rounded-control border border-border-strong px-3 py-2 text-body text-text-secondary hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:bg-inset disabled:text-text-disabled"
            >
              Spara titel
            </button>
          </div>

        </fieldset>
      </form>
      </header>

      <TaxSettingsPanel
        headerFacts={headerFacts}
        calculationId={header.id}
        value={header.tax_input_snapshot}
        fixedPriceScopeRows={fixedPriceScopeRows}
      />

      {/* Workspace: sections (left/center) + totals summary (right on desktop). */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {sectionReorderError && (
            <p
              role="alert"
              data-testid="section-reorder-error"
              className="rounded-control border border-risk-text bg-risk-surface px-3 py-2 text-label text-risk-text"
            >
              {sectionReorderError}
              {sectionReorderRetryable ? " Försök igen." : ""}
            </p>
          )}

          {!canAddRow ? (
            <p
              role="status"
              data-testid="calculation-row-limit"
              className="rounded-control border border-warn-text bg-warn-surface px-3 py-2 text-label text-warn-text"
            >
              Kalkylen har nått gränsen på {MAX_CALCULATION_ROWS} aktiva rader. Ta bort en rad
              innan du lägger till en ny.
            </p>
          ) : null}

          {sections.length === 0 ? (
            <p data-testid="sections-empty" className="text-label text-text-secondary">
              Inga sektioner ännu. Lägg till din första sektion nedan.
            </p>
          ) : (
            sections.map((section, index) => (
              <div key={section.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <form {...reorderOperation.formProps} action={sectionReorderAction}>{reorderOperation.recovery}
                    <input
                      type="hidden"
                      name="calculation_id"
                      value={header.id}
                    />
                    <input
                      type="hidden"
                      name="ordered_section_ids"
                      value={moveUp(orderedSectionIds, index).join(",")}
                    />
                    <button
                      type="submit"
                      aria-label="Flytta sektion upp"
                      data-testid="section-move-up"
                      disabled={index === 0}
                      className="min-h-control-lg min-w-control-lg rounded-control border border-border-strong px-2 py-1 text-caption text-text-secondary hover:bg-sunken disabled:bg-inset disabled:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    >
                      ↑
                    </button>
                  </form>
                  <form {...reorderOperation.formProps} action={sectionReorderAction}>{reorderOperation.recovery}
                    <input
                      type="hidden"
                      name="calculation_id"
                      value={header.id}
                    />
                    <input
                      type="hidden"
                      name="ordered_section_ids"
                      value={moveDown(orderedSectionIds, index).join(",")}
                    />
                    <button
                      type="submit"
                      aria-label="Flytta sektion ned"
                      data-testid="section-move-down"
                      disabled={index === sections.length - 1}
                      className="min-h-control-lg min-w-control-lg rounded-control border border-border-strong px-2 py-1 text-caption text-text-secondary hover:bg-sunken disabled:bg-inset disabled:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    >
                      ↓
                    </button>
                  </form>
                </div>
                <SectionEditor
                  headerFacts={headerFacts}
                  section={section}
                  calculationId={header.id}
                  sources={sources}
                  posture={posture}
                  policyEffectiveDate={previewQuoteCaptureDate}
                  canAddRow={canAddRow}
                />
              </div>
            ))
          )}

          {(showAddSection || restoreSectionHost) ? (
            <form key={sectionOperation.hydrationKey} {...sectionOperation.formProps}
              action={sectionAction}
              data-testid="add-section-form"
              className="flex max-w-xl flex-col gap-3 rounded-card border border-dashed border-border-strong bg-card p-4"
              noValidate
            >{sectionOperation.recovery}
        <fieldset disabled={!sectionOperation.ready} className="contents">
              <input type="hidden" name="calculation_id" value={header.id} />
              <FormErrorSummary
                message={sectionState.form === "section" ? sectionState.formError : null}
                fieldErrors={sectionState.form === "section" ? sectionState.fieldErrors : undefined}
              />
              <TextField
                name="title"
                label="Sektionstitel (valfritt)"
                defaultValue={
                  sectionOperation.draftValue("title", (sectionState.form === "section" && sectionState.values.title) || "")
                }
                error={
                  sectionState.form === "section"
                    ? sectionState.fieldErrors.title
                    : undefined
                }
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sectionPending}
                  className="min-h-control-lg min-w-control-lg rounded-control bg-ink px-4 py-2 text-body font-medium text-white hover:bg-n-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:bg-inset disabled:text-text-disabled"
                >
                  {sectionPending ? "Skapar…" : "Skapa sektion"}
                </button>
              </div>

        </fieldset>
      </form>
          ) : (
            <button
              type="button"
              data-testid="add-section"
              onClick={() => setShowAddSection(true)}
              className="min-h-control-lg min-w-control-lg self-start rounded-control border border-dashed border-border-strong px-4 py-2 text-body text-text-secondary hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              Lägg till sektion
            </button>
          )}
        </div>

        {/* One mounted quote owner; only the stateless summaries have viewport variants. */}
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-80 lg:shrink-0">
          <div className="hidden flex-col gap-4 lg:flex">
            {calcTotal.ok && view ? (
              <TotalsSummary total={calcTotal.value} view={view} />
            ) : (
              <TotalsFailure />
            )}
            <ReadinessSummary report={readinessReport} />
          </div>
          <div className="flex flex-col gap-4 lg:hidden">
            {calcTotal.ok && view ? (
              <TotalsSummary total={calcTotal.value} view={view} inline />
            ) : (
              <TotalsFailure inline />
            )}
            <ReadinessSummary report={readinessReport} inline />
          </div>
          <PreQuotePreview
            confirmDeparture={confirmDeparture}
            detail={detail}
            report={readinessReport}
            total={calcTotal.ok ? calcTotal.value : null}
            view={view}
            quoteTerms={quoteTerms}
            taxAnswer={taxResolution.answer}
            quoteCaptureDate={previewQuoteCaptureDate}
            reviewedSnapshotDigest={reviewedSnapshotDigest}
          />
        </div>
      </div>

      {/* File upload panel (Story 8.2 — calculation_attachment upload + own-tenant list). */}
      {filesPanel ? <div>{filesPanel}</div> : null}

      {/* Archive the whole calculation (soft-archive via the command). */}
      <div className="flex justify-end border-t border-border-default pt-4">
        <form {...archiveOperation.formProps} action={archiveAction}>{archiveOperation.recovery}
          <input type="hidden" name="id" value={header.id} />
          <button
            type="submit"
            data-testid="archive-calculation"
            className="min-h-control-lg min-w-control-lg rounded-control border border-risk-text px-3 py-2 text-body text-risk-text hover:bg-risk-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Arkivera kalkyl
          </button>
        </form>
        {archiveState.status === "error" && (
          <p role="alert" className="ml-3 self-center text-label text-risk-text">
            {archiveState.formError}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Failed-total placeholder (AC4 money-display safety). When `computeCalcTotal` returns
 * `{ ok: false }` (e.g. an `ORE_OVERFLOW`) the editor must NOT render a fabricated
 * `0,00 kr` headline — it surfaces this distinct error state instead, so a wrong money
 * figure never reaches the admin. Mirrors the `.ok`-gated render of `TotalsSummary` and
 * `SectionEditor`'s section-total.
 */
function TotalsFailure({ inline = false }: { readonly inline?: boolean }) {
  return (
    <aside
      role="alert"
      data-testid="totals-summary-error"
      data-inline={inline ? "true" : "false"}
      aria-label="Summering kunde inte beräknas"
      className={[
        "flex flex-col gap-2 rounded-card border border-risk-text bg-risk-surface p-4",
        inline ? "" : "lg:sticky lg:top-6",
      ].join(" ")}
    >
      <h2 className="text-section font-medium text-risk-text">Summering</h2>
      <p className="text-label text-risk-text">
        Totalsumman kunde inte beräknas. Kontrollera raderna och försök igen.
      </p>
    </aside>
  );
}
