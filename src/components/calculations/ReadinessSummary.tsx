"use client";

/**
 * Readiness summary (Story 5.4, Task 3.1 / AC1) — renders the PURE `classifyReadiness` report as
 * two VISUALLY SEPARATE groups: BLOCKING issues distinct from WARNINGS (UX-DR15 / ux-design
 * §Readiness and safety). Presentation-only — the classification is the pure `readiness.ts`
 * classifier (protected by the fast unit gate); this island only DISPLAYS it.
 *
 * A11y: the blockers group is a `role="alert"` region (an unsafe commitment must be announced);
 * the warnings group is a `role="status"` region; both are keyboard-reachable and labelled.
 * Generic Swedish messages only — NO öre/basis-point jargon in the warning copy (kronor/percent at
 * the boundary; the totals summary keeps the öre/rounding wording where an admin needs it).
 *
 * [Source: ux-design-specification.md#Readiness and safety (blocking separated from warnings);
 *  test-design-epic-5.md#5.4-E2E-01; src/features/calculations/readiness.ts (the pure report);
 *  src/components/crm/FormField.tsx (the a11y pattern)]
 */
import type { ReadinessReport } from "@/features/calculations/readiness";

export function ReadinessSummary({
  report,
  inline = false,
}: {
  readonly report: ReadinessReport;
  /** True → render as an inline block (narrow viewport) rather than a side panel. */
  readonly inline?: boolean;
}) {
  const { blockers, warnings } = report;

  return (
    <section
      data-testid="readiness-summary"
      data-inline={inline ? "true" : "false"}
      data-can-create-quote={report.canCreateQuote ? "true" : "false"}
      aria-label="Kontroll inför offert"
      className="flex flex-col gap-3 rounded-card border border-border-default bg-card p-4"
    >
      <h2 className="text-section font-medium text-text-primary">Kontroll inför offert</h2>

      {/* BLOCKERS — a distinct alert region. Present ONLY when there is at least one blocker. */}
      {blockers.length > 0 && (
        <div
          role="alert"
          data-testid="readiness-blockers"
          className="flex flex-col gap-2 rounded-control border border-risk-text bg-risk-surface p-3"
        >
          <h3 className="text-section font-medium text-risk-text">
            Blockerande problem — måste åtgärdas
          </h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-label text-risk-text">
            {blockers.map((issue, i) => (
              <li
                key={`${issue.code}-${i}`}
                data-testid={`readiness-blocker-${issue.code}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* WARNINGS — a distinct status region, VISUALLY separate from the blockers. */}
      {warnings.length > 0 && (
        <div
          role="status"
          data-testid="readiness-warnings"
          className="flex flex-col gap-2 rounded-control border border-warn-text bg-warn-surface p-3"
        >
          <h3 className="text-section font-medium text-warn-text">
            Varningar — kontrollera innan du skapar en offert
          </h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-label text-warn-text">
            {warnings.map((issue, i) => (
              <li
                key={`${issue.code}-${i}`}
                data-testid={`readiness-warning-${issue.code}-${i}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {blockers.length === 0 && warnings.length === 0 && (
        <p role="status" className="text-label text-ok-text">
          Inga anmärkningar. Kalkylen är redo för nästa steg.
        </p>
      )}
    </section>
  );
}
