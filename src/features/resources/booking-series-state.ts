/** Headless recurrence request/review and immutable retry state. */
export type SeriesAttempt = { readonly commandId: string; readonly seriesId: string; readonly proposedIds: readonly string[]; readonly input: Record<string, unknown> };
export type SeriesPreviewState = { readonly requestId: number; readonly candidateKey: string; readonly receipt: string; readonly seriesVersion: number; readonly warnings: readonly string[] };
export type BookingSeriesState = {
  readonly candidateKey: string; readonly latestRequestId: number; readonly seriesVersion: number;
  readonly preview: SeriesPreviewState | null; readonly selected: readonly string[]; readonly reason: string;
  readonly previewStatus: "idle" | "pending" | "ready" | "failed";
  readonly attempt: SeriesAttempt | null; readonly persistence: "unsent" | "saving" | "unknown" | "confirmed";
  readonly acknowledged?: boolean; readonly reviewedLogicalIds?: readonly string[];
};
export function applySeriesEvent(state: BookingSeriesState, event: Record<string, unknown>): BookingSeriesState {
  switch (event.type) {
    case "candidate-changed":
      if (state.persistence === "unknown" || state.persistence === "saving") return state;
      return { ...state, candidateKey: String(event.candidateKey), seriesVersion: typeof event.seriesVersion === "number" ? event.seriesVersion : state.seriesVersion,
        latestRequestId: state.latestRequestId + 1, preview: null, selected: [], reason: "", acknowledged: false, reviewedLogicalIds: [], previewStatus: "idle", attempt: null };
    case "preview-started": return { ...state, previewStatus: "pending", preview: null, selected: [], reason: "", acknowledged: false, reviewedLogicalIds: [] };
    case "preview-failed": return event.requestId !== state.latestRequestId ? state : { ...state, previewStatus: "failed", preview: null };
    case "preview-succeeded": {
      const preview = event.preview as SeriesPreviewState;
      if (!preview || preview.requestId !== state.latestRequestId || preview.candidateKey !== state.candidateKey || preview.seriesVersion !== state.seriesVersion) return state;
      return { ...state, preview, previewStatus: "ready", selected: [], reason: "", acknowledged: false, reviewedLogicalIds: [] };
    }
    case "review-changed": return { ...state, acknowledged: event.acknowledged === true,
      reviewedLogicalIds: Array.isArray(event.reviewedLogicalIds) ? event.reviewedLogicalIds as string[] : [],
      ...(Array.isArray(event.selected) ? { selected: event.selected as string[] } : {}), ...(typeof event.reason === "string" ? { reason: event.reason } : {}) };
    case "save-started": return canSaveSeries(state) && event.attempt ? { ...state, attempt: event.attempt as SeriesAttempt, persistence: "saving" } : state;
    case "response-lost": return state.attempt ? { ...state, persistence: "unknown" } : state;
    case "save-failed": return { ...state, persistence: state.persistence === "unknown" ? "unknown" : "unsent" };
    case "save-confirmed": return state.attempt?.commandId === event.commandId ? { ...state, persistence: "confirmed" } : state;
    default: return state;
  }
}
export function canSaveSeries(state: BookingSeriesState): boolean {
  const p = state.preview;
  if (state.persistence !== "unsent" || state.previewStatus !== "ready" || !p?.receipt || p.requestId !== state.latestRequestId ||
    p.candidateKey !== state.candidateKey || p.seriesVersion !== state.seriesVersion) return false;
  if (!p.warnings.length) return state.selected.length === 0;
  return state.acknowledged === true && !!state.reason.trim() && state.reviewedLogicalIds?.length === p.warnings.length &&
    new Set(state.reviewedLogicalIds).size === p.warnings.length && p.warnings.every(id => state.reviewedLogicalIds!.includes(id)) &&
    state.selected.every(id => p.warnings.includes(id));
}
export function seriesRetryAttempt(state: BookingSeriesState): SeriesAttempt {
  if (!state.attempt || !["unknown", "unsent"].includes(state.persistence)) throw new Error("No unresolved series attempt");
  return state.attempt;
}
