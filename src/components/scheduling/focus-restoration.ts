/** UI-only focus identity; never part of a booking command. */
export type FocusIdentity = {
  tag: string; testId: string | null; start: string | null; person: string | null;
  booking: string | null; row: string | null; instance: string | null; text: string;
};
export type FocusIntent = { element: HTMLElement; identity: FocusIdentity; attempted: boolean };

export function focusIdentity(element: HTMLElement): FocusIdentity {
  return { tag: element.tagName.toLowerCase(), testId: element.getAttribute("data-testid"),
    start: element.getAttribute("data-start"), person: element.getAttribute("data-person"),
    booking: element.closest('[data-testid^="scheduling-booking-"]')?.getAttribute("data-testid") ?? null,
    row: element.closest('[data-testid^="resource-row-"]')?.getAttribute("data-testid") ?? null,
    instance: element.closest("[data-focus-instance]")?.getAttribute("data-focus-instance") ?? null,
    text: element.textContent ?? "" };
}
export function sameFocusIdentity(a: FocusIdentity, b: FocusIdentity, equivalent = false): boolean {
  return a.tag === b.tag && a.testId === b.testId && a.start === b.start && a.person === b.person &&
    a.booking === b.booking && a.row === b.row && (equivalent || a.instance === b.instance) &&
    (a.testId !== null || a.text === b.text);
}
export function eligibleFocusTarget(element: HTMLElement): boolean {
  if (!element.isConnected || element.closest('[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]') ||
      element.matches(':disabled, [aria-disabled="true"]') || !element.getClientRects().length) return false;
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = view.getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || style.opacity === "0") return false;
  }
  return element.matches('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]');
}
/** A failed focus is not success. Try the next eligible candidate, without polling. */
export function focusFirstEligible<T>(candidates: readonly T[], eligible: (target: T) => boolean,
  focus: (target: T) => void, active: () => T | null): T | null {
  for (const candidate of new Set(candidates)) {
    if (!eligible(candidate)) continue;
    focus(candidate);
    if (active() === candidate) return candidate;
  }
  return null;
}
export function restoreWorkspaceFocus(root: HTMLElement, intent: FocusIntent): boolean {
  const candidates = [...root.querySelectorAll<HTMLElement>(intent.identity.tag)];
  const exact = candidates.filter(node => sameFocusIdentity(intent.identity, focusIdentity(node)));
  // Equivalent source controls keep the source row/control, never the drop destination row.
  const equivalent = candidates.filter(node => sameFocusIdentity(intent.identity, focusIdentity(node), true));
  const fallback = [...root.querySelectorAll<HTMLElement>('[role="alert"] button'),
    ...root.querySelectorAll<HTMLElement>('[role="tab"][aria-selected="true"]')];
  const heading = root.querySelector<HTMLElement>("h1");
  const attempt = (nodes: HTMLElement[]) => focusFirstEligible(nodes,
    node => root.contains(node) && eligibleFocusTarget(node), node => node.focus(),
    () => root.ownerDocument.activeElement as HTMLElement | null) !== null;
  if (attempt([intent.element, ...exact, ...equivalent, ...fallback])) return true;
  if (heading) { heading.tabIndex = -1; return attempt([heading]); }
  return false;
}
