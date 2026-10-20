import type { CalendarFeedIntent } from "./types";
export type CalendarFeedActionState = Readonly<{ status: string; request: CalendarFeedIntent; rawUrl?: string; confirmedRevision?: number; canMutate: boolean; requiresRotation?: boolean }>;
export function pendingCalendarFeed(request: CalendarFeedIntent): CalendarFeedActionState { return { status: "pending", request, canMutate: false }; }
export function transitionCalendarFeed(state: CalendarFeedActionState, event: string, response: Record<string, unknown> = {}): CalendarFeedActionState {
  const base = { request: state.request, canMutate: false };
  if (event === "unknown" || event === "retry" || (event === "denied" && ["unknown", "retry"].includes(state.status))) return { ...base, status: "unknown" };
  if (event === "reconciled-committed") return { ...base, status: "reconciled-committed-url-lost", canMutate: true, requiresRotation: state.request.action !== "revoke" };
  if (event === "confirmed-fresh" && response.attemptId === state.request.attemptId && typeof response.revision === "number" && response.revision > state.request.revision && typeof response.rawUrl === "string") return { ...base, status: "fresh-issued", canMutate: true, rawUrl: response.rawUrl, confirmedRevision: response.revision };
  if (event === "reconciled-not-found") return { ...base, status: "retry", canMutate: false };
  return { ...base, status: event === "revoked" ? "revoked" : "error", canMutate: true };
}
