/** Executed SSR assertions only; interaction, focus and persistence require the separate essential browser lane. */
import { describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TimeReportForm } from "@/components/time-reports/TimeReportForm";
import { PersonalTimesheet } from "@/components/time-reports/PersonalTimesheet";
import { TimeReportReview } from "@/components/time-reports/TimeReportReview";

describe("15.4-COMP-001 honest accessible report states (SSR only)", () => {
  test("confirmed filing exposes the exact persisted-success browser seam", () => {
    const html = renderToStaticMarkup(createElement(TimeReportForm, {
      draft: { date: "2026-10-20", hours: "1", note: "", bookingId: null, jobId: null },
      state: { status: "confirmed" }, onSubmit: () => {}, onRetry: () => {},
    }));
    expect(html).toContain('data-testid="time-report-submit-status">Rapporterad</span>');
    expect(html).toContain("sparad i systemet");
  });

  test("[P1] 15.4-COMP-001A AC1 AC2 unsent failure retains labelled values and explicit retry", async () => {
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

  test("[P1] 15.4-COMP-001B AC2 pending is announced without submitted success", async () => {
    const html = renderToStaticMarkup(createElement(TimeReportForm, {
      draft: { date: "2026-10-20", hours: "1", note: "", bookingId: null, jobId: null },
      state: { status: "pending" }, onSubmit: () => {}, onRetry: () => {},
    }));
    expect(html).toContain("Sparar");
    expect(html).toMatch(/role="status"|aria-live=/);
    expect(html).not.toContain("Rapporterad");
  });

  test("[P1] 15.4-COMP-001C AC3 failed week read is connection error with retry rather than zero total", async () => {
    const html = renderToStaticMarkup(createElement(PersonalTimesheet, {
      result: { ok: false, code: "READ_FAILED" }, weekStart: "2026-10-19", onRetry: () => {},
    }));
    expect(html).toContain("Anslutning krävs");
    expect(html).toContain("Försök igen");
    expect(html).not.toMatch(/0(?:[,.]0+)?\s*(?:h|timmar)/);
    expect(html).not.toContain("Inga tidrapporter");
  });

  test("[P1] 15.4-COMP-001D AC4 AC9 standalone comparison remains absent and review cannot approve", async () => {
    const html = renderToStaticMarkup(createElement(TimeReportReview, {
      report: { id: "standalone", date: "2026-10-20", minutes: 75, bookedMinutesAtFiling: null,
        bookingId: null, jobId: null, status: "submitted", note: "Fältarbete", reviewNote: null, reviewRevision: 0 },
      canReview: true, onAnnotate: () => {},
    }));
    expect(html).toContain("Fältarbete");
    expect(html).not.toMatch(/Bokat[^<]*0|Godkänn|Avvisa|Fakturera|kr\/h/);
    expect(html).toMatch(/Anteckning|Granskningsnotering|Granskningsanteckning/);
  });
});

describe("fractional booked-minute provenance", () => {
  test("unavailable exact prefill is honest and requires explicit reported hours", () => {
    const html=renderToStaticMarkup(createElement(TimeReportForm, {
      draft:{date:"2026-10-20",hours:"",note:"",bookingId:"booking",jobId:null,mode:"hours",exactPrefillUnavailable:true},
      state:{status:"draft"},onSubmit:()=>{},onRetry:()=>{},
    }));
    expect(html).toContain("Bokningens exakta intervall kan inte förifyllas som hela minuter. Ange rapporterad tid.");
    expect(html).toMatch(/aria-label="Timmar"[^>]*value=""/);
    expect(html).toContain("Osänd");
    expect(html).not.toContain("time-report-submit-status");
  });
  test("review preserves fractional booked provenance and comparison without rounding", () => {
    const html=renderToStaticMarkup(createElement(TimeReportReview, {
      report:{id:"fractional",date:"2026-10-20",minutes:75,bookedMinutesAtFiling:90.5,bookingId:"booking",jobId:null,status:"submitted",note:null,reviewNote:null,reviewRevision:0},
      canReview:true,onAnnotate:()=>{},
    }));
    expect(html).toContain('data-testid="time-report-booked-at-filing">1 h 30,5 min');
    expect(html).toContain('data-testid="time-report-booked-delta">−0 h 15,5 min');
  });
});
