/** SSR assertions only; user interaction, focus and persistence belong to essential Playwright. */
import { describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const formSeam = "@/components/time-reports/TimeReportForm";
const sheetSeam = "@/components/time-reports/PersonalTimesheet";
const reviewSeam = "@/components/time-reports/TimeReportReview";

describe("15.4-COMP-001 honest accessible report states (RED, SSR only)", () => {
  test.skip("[P1] 15.4-COMP-001A AC1 AC2 unsent failure retains labelled values and explicit retry", async () => {
    const { TimeReportForm } = await import(formSeam);
    const html = renderToStaticMarkup(createElement(TimeReportForm, {
      draft: { date: "2026-10-20", hours: "1,25", note: "Behåll anteckningen", bookingId: null, jobId: null },
      state: { status: "unknown", message: "Anslutning krävs" }, onSubmit: () => {}, onRetry: () => {},
    }));
    expect(html).toContain("Osänd");
    expect(html).toContain("1,25");
    expect(html).toContain("Behåll anteckningen");
    expect(html).toContain("Försök igen");
    expect(html).not.toContain("Rapporterad");
    expect(html).toMatch(/<label|aria-label=/);
  });

  test.skip("[P1] 15.4-COMP-001B AC2 pending is announced without submitted success", async () => {
    const { TimeReportForm } = await import(formSeam);
    const html = renderToStaticMarkup(createElement(TimeReportForm, {
      draft: { date: "2026-10-20", hours: "1", note: "", bookingId: null, jobId: null },
      state: { status: "pending" }, onSubmit: () => {}, onRetry: () => {},
    }));
    expect(html).toContain("Sparar");
    expect(html).toMatch(/role="status"|aria-live=/);
    expect(html).not.toContain("Rapporterad");
  });

  test.skip("[P1] 15.4-COMP-001C AC3 failed week read is connection error with retry rather than zero total", async () => {
    const { PersonalTimesheet } = await import(sheetSeam);
    const html = renderToStaticMarkup(createElement(PersonalTimesheet, {
      result: { ok: false, code: "READ_FAILED" }, weekStart: "2026-10-19", onRetry: () => {},
    }));
    expect(html).toContain("Anslutning krävs");
    expect(html).toContain("Försök igen");
    expect(html).not.toMatch(/0(?:[,.]0+)?\s*(?:h|timmar)/);
    expect(html).not.toContain("Inga tidrapporter");
  });

  test.skip("[P1] 15.4-COMP-001D AC4 AC9 standalone comparison remains absent and review cannot approve", async () => {
    const { TimeReportReview } = await import(reviewSeam);
    const html = renderToStaticMarkup(createElement(TimeReportReview, {
      report: { id: "standalone", date: "2026-10-20", minutes: 75, bookedMinutesAtFiling: null,
        bookingId: null, jobId: null, status: "submitted", note: "Fältarbete", reviewNote: null, reviewRevision: 0 },
      canReview: true, onAnnotate: () => {},
    }));
    expect(html).toContain("Fältarbete");
    expect(html).not.toMatch(/Bokat[^<]*0|Godkänn|Avvisa|Fakturera|kr\/h/);
    expect(html).toMatch(/Anteckning|Granskningsnotering/);
  });
});
