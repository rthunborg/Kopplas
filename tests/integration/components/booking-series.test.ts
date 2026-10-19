/**
 * SSR structure only. No interaction/focus/phone CSS/persistence credit.
 * Proposed data-testid bindings below are test contracts, not observed UI.
 * RED: T6 recurrence components absent. All cases intentionally skipped until T6.
 */
import { describe, expect, test } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type Item = { nominalDate: string; startsAt: string; endsAt: string; conflictCount: number };
type FieldsProps = { enabled: boolean; preset: string; endMode: string; count: number;
  weekdays: number[]; disabled: boolean; onChange: (value: unknown) => void };
type PreviewProps = { status: "ready" | "pending" | "failed"; items: Item[]; total: number;
  warningCount: number; error?: string };
async function bindings() {
  // Normalize only here if the implementation selects a different proportional props API.
  const fieldsPath = new URL("../../../src/components/resources/BookingRecurrenceFields.tsx", import.meta.url).href;
  const previewPath = new URL("../../../src/components/resources/RecurrencePreview.tsx", import.meta.url).href;
  const fields = await import(/* @vite-ignore */ fieldsPath);
  const preview = await import(/* @vite-ignore */ previewPath);
  return { Fields: fields.BookingRecurrenceFields as ComponentType<FieldsProps>,
    Preview: preview.RecurrencePreview as ComponentType<PreviewProps> };
}
const fields = (patch: Partial<FieldsProps> = {}): FieldsProps => ({
  enabled: false, preset: "daily", endMode: "count", count: 3, weekdays: [], disabled: false, onChange: () => {}, ...patch,
});
const item = (patch: Partial<Item> = {}): Item => ({ nominalDate: "2026-10-12",
  startsAt: "2026-10-12T05:00:00.000000Z", endsAt: "2026-10-12T06:00:00.000000Z", conflictCount: 0, ...patch });

describe("15.2 recurrence presentation structural semantics — AC2/AC8", () => {
  test.skip("[P1] TEA15.2-COMP-001 recurrence starts off with a labelled keyboard control", async () => {
    // Given standalone state, when real fields render, then off remains explicit.
    const b = await bindings(); const html = renderToStaticMarkup(createElement(b.Fields, fields()));
    expect(html).toContain('data-testid="booking-recurrence-enabled"');
    expect(html).toMatch(/<(?:input|button)[^>]*(?:type="checkbox"|role="switch")/);
    expect(html).not.toMatch(/(?:checked=""|aria-checked="true")/);
    expect(html).toMatch(/(?:<label|aria-label|aria-labelledby)/);
  });
  test.skip("[P1] TEA15.2-COMP-001 enabled preset/end controls expose approved finite choices", async () => {
    const b = await bindings(); const html = renderToStaticMarkup(createElement(b.Fields, fields({ enabled: true })));
    for (const id of ["booking-recurrence-preset", "booking-recurrence-end-mode", "booking-recurrence-count"])
      expect(html).toContain('data-testid="' + id + '"');
    for (const preset of ["daily", "weekly", "biweekly", "monthly"]) expect(html).toContain('value="' + preset + '"');
    expect(html).not.toMatch(/value="(?:unbounded|rrule)"/);
  });
  test.skip("[P1] TEA15.2-COMP-001 selected weekdays are explicit labelled controls", async () => {
    const b = await bindings(); const html = renderToStaticMarkup(createElement(b.Fields, fields({ enabled: true, preset: "weekly", weekdays: [1, 3] })));
    expect(html).toContain('data-testid="booking-recurrence-weekdays"');
    expect(html).toMatch(/<fieldset/);
    expect(html).toMatch(/<legend/);
    expect(html.match(/(?:type="checkbox"|aria-pressed=)/g)?.length).toBeGreaterThanOrEqual(7);
    expect(html.match(/(?:checked=""|aria-pressed="true")/g)?.length).toBeGreaterThanOrEqual(2);
  });
  test.skip("[P1] TEA15.2-COMP-001 preview entries expose local date and textual conflict meaning", async () => {
    const b = await bindings(); const html = renderToStaticMarkup(createElement(b.Preview, {
      status: "ready", items: [item({ conflictCount: 2 })], total: 1, warningCount: 2,
    }));
    expect(html).toContain('data-testid="booking-recurrence-preview"');
    expect(html).toContain('data-testid="booking-recurrence-preview-row"');
    expect(html).toContain('data-nominal-date="2026-10-12"');
    expect(html).toMatch(/(?:aria-label|title)="[^"]*(?:konflikt|Konflikt)/);
  });
  test.skip("[P1] TEA15.2-COMP-001 preview limit explains total while warning review includes hidden suffix", async () => {
    const b = await bindings();
    const html = renderToStaticMarkup(createElement(b.Preview, { status: "ready", items: Array.from({ length: 10 }, () => item()), total: 12, warningCount: 3 }));
    expect(html.match(/data-testid="booking-recurrence-preview-row"/g)).toHaveLength(10);
    expect(html).toMatch(/12/);
    expect(html).toContain('data-testid="booking-recurrence-all-warnings"');
  });
  for (const status of ["pending", "failed"] as const) {
    test.skip("[P1] TEA15.2-COMP-001 " + status + " preview is announced without success", async () => {
      const b = await bindings(); const html = renderToStaticMarkup(createElement(b.Preview, { status, items: [], total: 0, warningCount: 0, error: "Kunde inte förhandsgranska" }));
      expect(html).toMatch(/(?:role="(?:status|alert)"|aria-live=)/);
      expect(html).not.toContain('data-testid="booking-recurrence-preview-row"');
    });
  }
});

