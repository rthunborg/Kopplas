import test from "node:test";
import assert from "node:assert/strict";
import { sameFocusIdentity, focusFirstEligible, eligibleFocusTarget, focusIdentity, restoreWorkspaceFocus, type FocusIdentity } from "../../../../src/components/scheduling/focus-restoration";
const identity: FocusIdentity = { tag: "article", testId: "booking", start: null, person: null,
  booking: "booking", row: null, instance: "schema:day", text: "" };
test("host/date and source row distinguish duplicate booking instances", () => {
  assert.equal(sameFocusIdentity(identity, { ...identity, instance: "schema-agenda" }), false);
  assert.equal(sameFocusIdentity(identity, { ...identity, instance: "schema:other-day" }), false);
  assert.equal(sameFocusIdentity(identity, { ...identity, instance: "schema:other-day" }, true), true);
  assert.equal(sameFocusIdentity({ ...identity, row: "source" }, { ...identity, row: "destination" }, true), false);
  assert.equal(sameFocusIdentity(identity, { ...identity, tag: "button", testId: "resize" }), false);
});
test("hidden duplicate and failed focus do not resolve restoration", () => {
  let active: string | null = null;
  const visited: string[] = [];
  const actual = focusFirstEligible(["hidden-agenda", "failed", "visible-source", "fallback"],
    node => node !== "hidden-agenda", node => { visited.push(node); if (node !== "failed") active = node; }, () => active);
  assert.equal(actual, "visible-source"); assert.deepEqual(visited, ["failed", "visible-source"]);
});
test("no successful candidate returns unresolved; successful fallback stops further focus", () => {
  assert.equal(focusFirstEligible(["failed"], () => true, () => {}, () => null), null);
  let active: string | null = null; const visited: string[] = [];
  assert.equal(focusFirstEligible(["retry", "tab", "heading"], () => true,
    node => { visited.push(node); active = node; }, () => active), "retry");
  assert.deepEqual(visited, ["retry"]);
});
function target(patch: { connected?: boolean; hidden?: boolean; disabled?: boolean; rects?: boolean; visibility?: string; display?: string; focusable?: boolean } = {}): HTMLElement {
  return { isConnected: patch.connected ?? true, parentElement: null,
    closest: () => patch.hidden ? {} : null,
    matches: (selector: string) => selector.startsWith(":disabled") ? patch.disabled ?? false : patch.focusable ?? true,
    getClientRects: () => patch.rects === false ? [] : [{}],
    ownerDocument: { defaultView: { getComputedStyle: () => ({ display: patch.display ?? "block", visibility: patch.visibility ?? "visible" }) } },
  } as unknown as HTMLElement;
}
test("eligibility applies equally to connected originals and remapped candidates", () => {
  assert.equal(eligibleFocusTarget(target()), true);
  for (const patch of [{ connected: false }, { hidden: true }, { disabled: true }, { rects: false },
    { visibility: "hidden" }, { display: "none" }, { focusable: false }]) assert.equal(eligibleFocusTarget(target(patch)), false);
});

// Minimal DOM adapter tests the production remap/fallback orchestration without a browser dependency.
function workspaceFixture() {
  const doc = { activeElement: null as HTMLElement | null,
    defaultView: { getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" }) } };
  const nodes: HTMLElement[] = [];
  function node(tag: string, instance: string, options: { hidden?: boolean; connected?: boolean; succeeds?: boolean } = {}) {
    const attrs: Record<string, string> = tag === "article" ? { "data-testid": "scheduling-booking-one" } : {};
    const element = { tagName: tag.toUpperCase(), textContent: tag, isConnected: options.connected ?? true, parentElement: null,
      ownerDocument: doc, getAttribute: (key: string) => attrs[key] ?? null,
      closest: (selector: string) => selector.startsWith("[hidden]") ? options.hidden ? {} : null :
        selector === "[data-focus-instance]" ? { getAttribute: () => instance } :
        selector.includes("scheduling-booking") && tag === "article" ? { getAttribute: () => attrs["data-testid"] } : null,
      getClientRects: () => options.hidden ? [] : [{}],
      matches: (selector: string) => !selector.startsWith(":disabled"),
      focus: () => { if (options.succeeds !== false) doc.activeElement = element as unknown as HTMLElement; },
    } as unknown as HTMLElement;
    nodes.push(element); return element;
  }
  const root = { ownerDocument: doc, contains: (element: HTMLElement) => nodes.includes(element),
    querySelectorAll: (selector: string) => selector === "article" ? nodes.filter(n => n.tagName === "ARTICLE") :
      selector.includes('role="alert"') ? nodes.filter(n => n.tagName === "RETRY") : nodes.filter(n => n.tagName === "TAB"),
    querySelector: () => nodes.find(n => n.tagName === "H1") ?? null,
  } as unknown as HTMLElement;
  return { root, node, doc };
}
test("real remap skips hidden agenda after host replacement and focuses intended day", () => {
  const { root, node, doc } = workspaceFixture();
  const original = node("article", "schema:day", { connected: false });
  node("article", "schema-agenda", { hidden: true });
  node("article", "schema:other-day");
  const expected = node("article", "schema:day");
  assert.equal(restoreWorkspaceFocus(root, { element: original, identity: focusIdentity(original), attempted: false }), true);
  assert.equal(doc.activeElement, expected);
});
test("disappeared source uses retry then selected tab; failed eligible focus still falls through", () => {
  const { root, node, doc } = workspaceFixture();
  const original = node("article", "schema:day", { connected: false });
  node("retry", "", { succeeds: false }); const tab = node("tab", ""); node("h1", "");
  assert.equal(restoreWorkspaceFocus(root, { element: original, identity: focusIdentity(original), attempted: false }), true);
  assert.equal(doc.activeElement, tab);
});
test("named heading is final programmatic fallback", () => {
  const { root, node, doc } = workspaceFixture();
  const original = node("article", "schema:day", { connected: false }); const heading = node("h1", "");
  assert.equal(restoreWorkspaceFocus(root, { element: original, identity: focusIdentity(original), attempted: false }), true);
  assert.equal(doc.activeElement, heading); assert.equal(heading.tabIndex, -1);
});
