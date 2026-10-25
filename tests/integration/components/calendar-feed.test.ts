/** Parallel presentation/headless scaffold only. No DDL, key/environment mutation,
 * real HTTP counters or DB fixture. DOM/focus/persistence remain browser/DB work. */
import { describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalendarSubscription } from "@/components/calendar-feed/CalendarSubscription";
import { CalendarFeedAbuseQueue } from "@/components/calendar-feed/CalendarFeedAbuseQueue";

type RenderDriver = { own(state: Record<string, unknown>): string; abuse(admin: boolean): string };
async function driver(): Promise<RenderDriver> { return {
  own: state => renderToStaticMarkup(createElement(CalendarSubscription, {
    initial: {membershipId:"38f89e80-f5f5-494a-a63d-c433ed42b2f3",active:true,revision:1,lastUsedAt:null,usageCount:0,attemptOutcome:null},
    initialState: {status:String(state.status),request:{action:"create",revision:0,attemptId:"b859aeee-90ec-4d6c-b6a3-a439c725a241"},canMutate:false,
      ...(state.status==="fresh-issued"?{rawUrl:"https://calendar.invalid/calendar/feed/fixture-only"}:{})},
  })),
  abuse: admin => renderToStaticMarkup(createElement(CalendarFeedAbuseQueue,{data:admin?{requests:10,limited:1,lastSpikeAt:null}:null})),
}; }
describe("15.5 accessible calendar subscription presentation (SSR only)", () => {
  // P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test("[P1] 15.5-COMP-001 AC1 AC6 warning, never used and copy fallback are explicit", async () => {
    const html = (await driver()).own({ status: "fresh-issued", lastUsedAt: null, clipboardDenied: true });
    expect(html).toContain("Kalenderprenumeration"); expect(html).toMatch(/alla|alla som|den som/i);
    expect(html).toMatch(/länk/i); expect(html).toMatch(/aldrig|inte hämtad/i);
    expect(html).toMatch(/<label|aria-label=/); expect(html).toMatch(/readonly|readOnly/);
  });
  // P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test("[P0] 15.5-COMP-002 AC2 AC6 pending and uncertain cannot announce confirmed success or recover raw URL", async () => {
    const subject = await driver();
    for (const status of ["pending", "unknown", "reconciled-committed-url-lost"]) {
      const html = subject.own({ status, lastUsedAt: null });
      expect(html).toMatch(/role="status"|aria-live=/);
      expect(html).not.toContain("/calendar/feed/"); expect(html).not.toMatch(/skapad och sparad|klart/i);
    }
  });
  // P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test("[P1] 15.5-COMP-003 AC2 AC6 failure offers explicit retry and revisit requires new rotation", async () => {
    const subject = await driver();
    expect(subject.own({ status: "error" })).toMatch(/försök igen/i);
    const revisited = subject.own({ status: "active", freshUrl: null });
    expect(revisited).not.toContain("/calendar/feed/"); expect(revisited).toMatch(/rotera|ny länk/i);
  });
  // P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test("[P0] 15.5-COMP-004 AC5 AC6 separate nonAdmin presentation contains no abuse data", async () => {
    const subject = await driver(); expect(subject.abuse(false)).toBe("");
    const html = subject.abuse(true); expect(html).not.toMatch(/token_hash|ip_hash|secret|proof|calendar\/feed\//i);
    expect(html).toMatch(/antal|förfrågningar|begräns/i);
  });
});
