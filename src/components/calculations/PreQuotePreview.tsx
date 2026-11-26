"use client";

/**
 * Pre-quote snapshot PREVIEW + the gated create-quote affordance + the new-version-after-send
 * message (Story 5.4, Task 3.2 / 3.3 — AC2 / AC3).
 *
 * This is the gated preview/confirmation surface. The first affordance opens the reconciled
 * preview; the explicit confirmation submits through Epic 6's shared create-version command.
 * Both remain disabled by the centralized readiness blockers.
 *
 * The preview shows the AC2 content: customer/facility/contact, sections (respecting each
 * `display_mode`: detailed / summary / text_only), VISIBLE vs HIDDEN row handling, options/tillval
 * (selected vs unselected), totals (net/VAT/gross from `totals.ts` via the resolved posture), VAT
 * display (the resolved posture), tax assumptions (unapproved + sign-off framing — from the warnings
 * captured at snapshot time), terms (from the tenant quote-terms read), selected attachments (a
 * DOCUMENTED deferral — Story 8.1/8.2 file foundation has not landed, R-513), and the WARNINGS
 * captured at snapshot time. It is a faithful, non-lossy view of the calc so Epic 6 can freeze it
 * forward (the preview shape aligns with Epic 6's quote-version snapshot).
 *
 * [Source: epics.md#Story 5.4 AC2/AC3 + Technical Notes (prepares inputs, does not create versions);
 *  test-design-epic-5.md#5.4-E2E-01/02/03, R-513/R-514; ux-design-specification.md#Calculation
 *  readiness review (pre-quote checkpoint) + #Readiness and safety; src/features/calculations/
 *  totals.ts]
 */
import { useEffect, useRef, useState } from "react";
import { useEditorOperation } from "./CalculationList";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { oreToKronorString } from "@/features/calculations/money-input";
import type { ReadinessReport } from "@/features/calculations/readiness";
import type { CalculationDetail } from "@/features/calculations/read";
import type { SectionTotal } from "@/features/calculations/totals";
import type { VatDisplayView } from "@/lib/money";
import type { TaxAnswerSnapshotV2 } from "@/lib/money";
import { createReviewedQuoteVersionFromCalculationAction } from "@/features/quotes/actions";
import {
  isQuoteCaptureDateExpired,
  isReviewedQuoteProofStale,
  type ReviewedQuoteProof,
} from "@/features/calculations/pre-quote-review";
import {
  CREATE_QUOTE_ACTION_INITIAL,
  isRetryableCreateQuoteError,
} from "@/features/quotes/create-quote-action-state";
import { BuyerVatNumberFact } from "@/components/quotes/BuyerVatNumberFact";

/** The tenant quote-terms slice the preview surfaces (never any approval enforcement — Epic 6). */
export interface PreQuoteTerms {
  readonly termsText: string;
  readonly approved: boolean;
}

const SECTION_MODE_LABELS: Record<string, string> = {
  detailed: "detaljerad",
  summary: "sammanfattning",
  text_only: "endast text",
};

const ROW_TYPE_LABELS: Record<string, string> = {
  labor: "Arbete",
  material: "Material",
  subcontractor: "Underentreprenör",
  machinery: "Maskin",
  other: "Övrigt",
};

export function PreQuotePreview({
  detail,
  report,
  total,
  view,
  quoteTerms,
  taxAnswer,
  quoteCaptureDate,
  reviewedSnapshotDigest,
  confirmDeparture,
}: {
  readonly detail: CalculationDetail;
  readonly report: ReadinessReport;
  /** The whole-calc total (present only when the engine resolved it OK). */
  readonly total: SectionTotal | null;
  /** The resolved display view (present only when the total resolved OK). */
  readonly view: VatDisplayView | null;
  /** The tenant's quote-terms (or null when none/unread — the preview shows the not-approved note). */
  readonly quoteTerms: PreQuoteTerms | null;
  /** Canonical reconciled preview; null exactly when readiness carries a tax blocker. */
  readonly taxAnswer: TaxAnswerSnapshotV2 | null;
  readonly quoteCaptureDate: string;
  readonly reviewedSnapshotDigest: string;
  readonly confirmDeparture: () => boolean;
}) {
  const { customer, sections } = detail;
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [reviewedProof, setReviewedProof] = useState<ReviewedQuoteProof | null>(null);
  const refreshedExpiredCaptureDate = useRef<string | null>(null);
  const router = useRouter();
  const attemptedDestination = useRef<string | null>(null);
  const quoteOperation = useEditorOperation(createReviewedQuoteVersionFromCalculationAction, CREATE_QUOTE_ACTION_INITIAL, `${detail.header.id}/reviewed-initial-quote`, form => ({ version: 1, form: "reviewed-initial-quote", reviewed_snapshot_digest: form.get("reviewed_snapshot_digest"), reviewed_quote_capture_date: form.get("reviewed_quote_capture_date"), attachment_file_ids: form.getAll("attachment_file_ids") }));
  const [hydratedGeneration, setHydratedGeneration] = useState("");
  if (quoteOperation.hydrationKey !== hydratedGeneration) {
    setHydratedGeneration(quoteOperation.hydrationKey);
    setOpen(Boolean(quoteOperation.restored));
    setReviewedProof(quoteOperation.restored ? { digest: quoteOperation.draftValue("reviewed_snapshot_digest", ""), quoteCaptureDate: quoteOperation.draftValue("reviewed_quote_capture_date", "") } : null);
  }
  const [createState, createAction, createPending] = [quoteOperation.state, quoteOperation.action, quoteOperation.pending];
  useEffect(() => {
    if (
      createState.status === "success" &&
      createState.quoteId &&
      createState.targetId
    ) {
      const destination = `/quotes/${createState.quoteId}/versions/${createState.targetId}`;
      if (attemptedDestination.current === destination) return;
      attemptedDestination.current = destination;
      if (confirmDeparture()) router.push(destination);
    }
  }, [createState.status, createState.quoteId, createState.targetId, router, confirmDeparture]);
  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);
  const previewStale = isReviewedQuoteProofStale(
    reviewedProof,
    reviewedSnapshotDigest,
    quoteCaptureDate,
  );
  const previewNotReviewed = reviewedProof === null;
  const captureDateExpired = isQuoteCaptureDateExpired(quoteCaptureDate, now);
  useEffect(() => {
    if (!captureDateExpired) {
      refreshedExpiredCaptureDate.current = null;
      return;
    }
    if (refreshedExpiredCaptureDate.current === quoteCaptureDate) return;
    refreshedExpiredCaptureDate.current = quoteCaptureDate;
    router.refresh();
  }, [captureDateExpired, quoteCaptureDate, router]);
  const gated = !report.canCreateQuote || taxAnswer === null;
  const confirmationDisabled =
    gated ||
    previewNotReviewed ||
    previewStale ||
    captureDateExpired ||
    createPending ||
    createState.status === "success";
  // Compute the tax sign-off warning ONCE and branch on truthiness (never a `.some(...)` +
  // `.find(...)!` double-scan whose non-null assertion would crash the whole preview if the two
  // predicate strings ever drifted).
  const taxSignOffWarning = report.warnings.find(
    (w) => w.code === "TAX_SIGN_OFF_REQUIRED",
  );

  const vatPostureLabel =
    view === null
      ? "kunde inte fastställas"
      : view.posture === "company_excl"
        ? "exkl. moms"
        : view.togglable
          ? "kan visas in-/exkl. moms"
          : "inkl. moms";

  return (
    <section
      data-testid="pre-quote"
      data-editor-dirty={quoteOperation.hasDraftChanges}
      data-editor-protected={quoteOperation.hasProtectedOperation}
      aria-label="Skapa offertversion"
      className="flex flex-col gap-3 rounded-card border border-border-default bg-card p-4"
    >
      <h2 className="text-section font-medium text-text-primary">Skapa offert</h2>

      {createState.status === "success" && createState.quoteId && createState.targetId && (
        <Link href={`/quotes/${createState.quoteId}/versions/${createState.targetId}`} className="min-h-control-lg text-text-primary underline">Öppna skapad offertversion</Link>
      )}

      {/* AC3 — the "a new version is required after send" forward-seam message. Rendered where
          the create-quote affordance lives; a PRESENT static explanatory affordance (Epic 6 owns
          the actual sent-state detection + immutability enforcement). Owner-pending final copy. */}
      <p
        role="note"
        data-testid="new-version-after-send-message"
        className="rounded-control border border-info-text bg-info-surface px-3 py-2 text-caption text-info-text"
      >
        Obs: När en offert har skickats till kund kräver ändringar som påverkar det kunden ser en
        ny offertversion — den skickade versionen ändras inte.
      </p>

      {gated ? (
        <p
          role="status"
          data-testid="create-quote-gated-note"
          className="text-label text-risk-text"
        >
          Åtgärda de blockerande problemen ovan innan du kan skapa en offertversion.
        </p>
      ) : null}

      <button
        type="button"
        data-testid="create-quote"
        disabled={gated}
        aria-disabled={gated ? "true" : "false"}
        onClick={() => {
          if (captureDateExpired) {
            router.refresh();
            return;
          }
          const closing = open && !previewNotReviewed && !previewStale;
          if (closing && (quoteOperation.hasDraftChanges || quoteOperation.hasProtectedOperation) &&
            !window.confirm("Du har osparade ändringar eller ett obekräftat resultat. Vill du lämna formuläret?")) return;
          if (!closing && reviewedProof && (reviewedProof.digest !== reviewedSnapshotDigest || reviewedProof.quoteCaptureDate !== quoteCaptureDate)) quoteOperation.markChanged();
          quoteOperation.retainValues([["calculation_id", detail.header.id], ["reviewed_snapshot_digest", reviewedSnapshotDigest], ["reviewed_quote_capture_date", quoteCaptureDate]]);
          setReviewedProof({ digest: reviewedSnapshotDigest, quoteCaptureDate });
          setOpen((current) =>
            previewNotReviewed || previewStale ? true : !current,
          );
        }}
        className="min-h-control-lg min-w-control-lg self-start rounded-control bg-ink px-4 py-2 text-body font-medium text-white hover:bg-n-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:bg-inset disabled:text-text-disabled"
      >
        {captureDateExpired
          ? "Hämta dagens förhandsvisning"
          : open && (previewNotReviewed || previewStale)
            ? "Granska uppdaterad förhandsvisning"
            : open
              ? "Dölj förhandsvisning"
              : "Skapa offertversion"}
      </button>

      {open && !gated && (
        <div
          data-testid="pre-quote-preview"
          className="flex flex-col gap-4 rounded-control border border-border-default bg-sunken p-4"
        >
          {/* Customer / facility / contact. */}
          <div data-testid="preview-customer" className="text-label tabular-nums">
            <h3 className="font-medium text-text-primary">Kund</h3>
            <p className="text-text-primary">{customer.customer_display_name ?? "—"}</p>
            <p className="text-text-secondary">
              Anläggning: {customer.facility_name ?? "—"} · Kontakt:{" "}
              {customer.contact_name ?? "—"}
            </p>
          </div>

          {/* Sections — respecting each display_mode; visible vs hidden + options/tillval. */}
          <div data-testid="preview-sections" className="flex flex-col gap-3">
            <h3 className="text-section font-medium text-text-primary">Sektioner</h3>
            {sections.length === 0 ? (
              <p className="text-label text-text-secondary">Inga sektioner.</p>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  data-testid="preview-section"
                  data-display-mode={section.display_mode}
                  className="rounded-control border border-border-default bg-card p-3 text-label"
                >
                  <p className="font-medium text-text-primary">
                    {section.title ?? "(namnlös sektion)"}{" "}
                    <span className="text-caption font-normal text-text-tertiary">
                      ({SECTION_MODE_LABELS[section.display_mode] ?? section.display_mode})
                    </span>
                  </p>
                  {section.display_mode === "text_only" ? (
                    <p className="text-text-secondary">Endast text — rader visas inte i offerten.</p>
                  ) : section.display_mode === "summary" ? (
                    <p className="text-text-secondary">
                      Sammanfattning — raderna summeras utan radvis specifikation.
                    </p>
                  ) : (
                    <ul className="mt-1 flex flex-col gap-1">
                      {section.rows.map((row) => {
                        const unselectedOption = row.is_optional && row.is_selected !== true;
                        return (
                          <li
                            key={row.id}
                            data-testid="preview-row"
                            data-hidden={row.is_hidden ? "true" : "false"}
                            data-optional={row.is_optional ? "true" : "false"}
                            data-selected={row.is_selected === true ? "true" : "false"}
                            data-included={row.included_in_invoice_total ? "true" : "false"}
                            className="flex items-center justify-between gap-2 text-text-secondary"
                          >
                            <span>
                              {ROW_TYPE_LABELS[row.row_type] ?? row.row_type}
                              {row.label ? ` · ${row.label}` : ""}
                              {row.is_hidden ? (
                                <span
                                  data-testid="preview-row-hidden-badge"
                                  className="ml-2 rounded-control bg-active px-1 text-caption text-text-secondary"
                                >
                                  dold i offert
                                </span>
                              ) : null}
                              {row.is_optional ? (
                                <span
                                  data-testid="preview-row-option-badge"
                                  className="ml-2 rounded-control bg-active px-1 text-caption text-text-secondary"
                                >
                                  tillval ({unselectedOption ? "ej vald" : "vald"})
                                </span>
                              ) : null}
                              <span
                                data-testid="preview-row-inclusion-badge"
                                className={[
                                  "ml-2 rounded-control px-1 text-caption",
                                  row.included_in_invoice_total
                                    ? "bg-ok-surface text-ok-text"
                                    : "bg-warn-surface text-warn-text",
                                ].join(" ")}
                              >
                                {row.included_in_invoice_total
                                  ? "ingår i fakturasumman"
                                  : "ingår inte i fakturasumman"}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Totals + VAT display (from totals.ts / the resolved posture). Which figure is the
              PRIMARY (emphasized) one mirrors the resolved posture — the same posture-aware
              treatment shipped for the per-row line-total label (Task 2.3, RowEditor): a resolved
              `company_excl` tenant foregrounds NET (exkl. moms); every other posture (private /
              company_togglable) foregrounds GROSS (inkl. moms). All three engine-derived amounts
              stay visible so the preview never drops a figure — only the emphasis follows posture,
              so a `company_excl` preview stops contradicting the resolved posture. */}
          {(() => {
            const netPrimary = view?.posture === "company_excl";
            const netEmphasis = netPrimary ? "flex justify-between font-medium" : "flex justify-between";
            const netDt = netPrimary ? "text-text-primary" : "text-text-secondary";
            const grossEmphasis = netPrimary ? "flex justify-between" : "flex justify-between font-medium";
            const grossDt = netPrimary ? "text-text-secondary" : "text-text-primary";
            return (
          <div data-testid="preview-totals" className="text-label tabular-nums">
            <h3 className="font-medium text-text-primary">Summering</h3>
            {total && taxAnswer ? (
              <dl className="flex flex-col gap-1">
                {(["labor", "material", "other"] as const).map((summaryKey) => {
                  const summary = taxAnswer.summaries[summaryKey];
                  const label = summaryKey === "labor"
                    ? "Arbete"
                    : summaryKey === "material"
                      ? "Material"
                      : "Övrigt";
                  return (
                    <div key={summaryKey} className="flex justify-between gap-3">
                      <dt className="text-text-secondary">{label}</dt>
                      <dd data-testid={`preview-summary-${summaryKey}`} className="text-right">
                        {oreToKronorString(summary.netOre)} + {oreToKronorString(summary.vatOre)} moms
                        = {oreToKronorString(summary.grossOre)} kr
                      </dd>
                    </div>
                  );
                })}
                <div className={netEmphasis}>
                  <dt className={netDt}>Netto (exkl. moms)</dt>
                  <dd data-testid="preview-net">{oreToKronorString(taxAnswer.netOre)} kr</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Moms</dt>
                  <dd data-testid="preview-vat">{oreToKronorString(taxAnswer.vatOre)} kr</dd>
                </div>
                <div className={grossEmphasis}>
                  <dt className={grossDt}>Totalt (inkl. moms)</dt>
                  <dd data-testid="preview-gross">{oreToKronorString(taxAnswer.grossOre)} kr</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Skatteavdrag</dt>
                  <dd data-testid="preview-deduction">
                    −{oreToKronorString(taxAnswer.deductionOre)} kr
                  </dd>
                </div>
                <div className="flex justify-between font-medium">
                  <dt>Att betala</dt>
                  <dd data-testid="preview-payable">{oreToKronorString(taxAnswer.payableOre)} kr</dd>
                </div>
              </dl>
            ) : (
              <p className="text-risk-text">Totalsumman kunde inte beräknas.</p>
            )}
            <p data-testid="preview-vat-display" className="mt-1 text-caption text-text-tertiary">
              Momsvisning: {vatPostureLabel}.
            </p>
            {taxAnswer ? (
              <>
                <ul className="mt-2 flex flex-col gap-1 text-caption text-text-secondary">
                  {taxAnswer.categories.map((category) => {
                    const suffix =
                      category.vatType === "STANDARD_VAT_25"
                        ? "standard"
                        : category.vatType === "REVERSE_CHARGE_CONSTRUCTION"
                          ? "reverse-charge"
                          : category.vatType === "REDUCED_VAT"
                            ? "reduced"
                            : "zero";
                    return (
                      <li
                        key={`${category.vatType}-${category.rateBp}`}
                        data-testid={`preview-vat-category-${suffix}`}
                      >
                        {category.vatType === "REVERSE_CHARGE_CONSTRUCTION"
                          ? `Omvänd betalningsskyldighet · ${oreToKronorString(category.netOre)} kr`
                          : `${category.rateBp / 100} % moms · ${oreToKronorString(category.vatOre)} kr`}
                      </li>
                    );
                  })}
                </ul>
                <BuyerVatNumberFact
                  value={taxAnswer.buyerVatNumber}
                  testId="preview-buyer-vat-number"
                  className="mt-2 text-caption text-text-secondary"
                />
              </>
            ) : null}
          </div>
            );
          })()}

          {/* Tax assumptions — surfaced from the warnings captured at snapshot time (unapproved +
              sign-off framing; never rendered final). */}
          <div data-testid="preview-tax-assumptions" className="text-label tabular-nums">
            <h3 className="font-medium text-text-primary">Skatteantaganden</h3>
            {taxSignOffWarning ? (
              <p className="text-warn-text">{taxSignOffWarning.message}</p>
            ) : (
              <p className="text-text-secondary">Inga ROT-/grön teknik-antaganden på kalkylen.</p>
            )}
          </div>

          {/* Terms (from the tenant quote-terms read; approval enforcement is Epic 6). */}
          <div data-testid="preview-terms" className="text-label tabular-nums">
            <h3 className="font-medium text-text-primary">Offertvillkor</h3>
            {quoteTerms ? (
              <>
                <p className="whitespace-pre-wrap text-text-secondary">{quoteTerms.termsText}</p>
                {!quoteTerms.approved && (
                  <p
                    role="status"
                    data-testid="preview-terms-unapproved"
                    className="mt-1 text-warn-text"
                  >
                    Villkoren är inte godkända ännu och kräver godkännande innan de skickas.
                  </p>
                )}
              </>
            ) : (
              <p className="text-text-secondary">
                Inga offertvillkor angivna ännu. Lägg till villkor i Inställningar.
              </p>
            )}
          </div>

          {/* Selected attachments — a DOCUMENTED deferral (Story 8.1/8.2 file foundation
              has not landed, R-513). Surfaced, never silently omitted. */}
          <div data-testid="preview-attachments" className="text-label tabular-nums">
            <h3 className="font-medium text-text-primary">Bifogade filer</h3>
            <p className="text-text-secondary">
              Bilagor är ännu inte tillgängliga — funktionen för filer är inte på plats än.
            </p>
          </div>

          {/* Warnings captured at snapshot time. */}
          <div data-testid="preview-warnings" className="text-label tabular-nums">
            <h3 className="font-medium text-text-primary">Anmärkningar vid tidpunkten</h3>
            {report.warnings.length === 0 ? (
              <p className="text-text-secondary">Inga anmärkningar.</p>
            ) : (
              <ul className="flex list-disc flex-col gap-1 pl-5 text-warn-text">
                {report.warnings.map((w, i) => (
                  <li
                    key={`${w.code}-${i}`}
                    data-testid={`preview-warning-${w.code}-${i}`}
                  >
                    {w.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form key={quoteOperation.hydrationKey} {...quoteOperation.formProps} action={createAction} className="flex flex-col gap-2">{quoteOperation.recovery}
        <fieldset disabled={!quoteOperation.ready} className="contents">
            <input type="hidden" name="calculation_id" value={detail.header.id} />
            <input
              type="hidden"
              name="reviewed_snapshot_digest"
              value={reviewedProof?.digest ?? ""}
            />
            <input
              type="hidden"
              name="reviewed_quote_capture_date"
              value={reviewedProof?.quoteCaptureDate ?? ""}
            />
            {previewNotReviewed ? (
              <p role="alert" className="text-label text-risk-text">
                Öppna och granska förhandsvisningen innan offertversionen skapas.
              </p>
            ) : null}
            {previewStale ? (
              <p role="alert" className="text-label text-risk-text">
                Kalkylen har ändrats – öppna och granska en ny förhandsvisning.
              </p>
            ) : null}
            {captureDateExpired ? (
              <p role="alert" className="text-label text-risk-text">
                Förhandsvisningen gäller en tidigare svensk affärsdag. Dagens underlag hämtas;
                granska sedan den uppdaterade förhandsvisningen.
              </p>
            ) : null}
            {createState.status === "error" ? (
              <p role="alert" className="text-label text-risk-text">
                {createState.formError}
                {isRetryableCreateQuoteError(createState) ? " Försök igen." : ""}
              </p>
            ) : null}
            <button
              type="submit"
              data-testid="confirm-create-quote-version"
              disabled={confirmationDisabled}
              className="min-h-control-lg min-w-control-lg self-start rounded-control bg-ink px-4 py-2 text-body font-medium text-white disabled:bg-inset disabled:text-text-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {createPending
                ? "Skapar…"
                : createState.status === "success"
                  ? "Offertversion skapad"
                  : previewStale || captureDateExpired
                    ? "Förhandsvisningen är inaktuell"
                    : previewNotReviewed
                      ? "Granska förhandsvisningen först"
                      : "Bekräfta och skapa offertversion"}
            </button>

        </fieldset>
      </form>
        </div>
      )}
    </section>
  );
}
