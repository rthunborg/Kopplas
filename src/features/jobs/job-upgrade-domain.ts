/** Closed confirmation input; authority and the atomic transition belong to checked SQL. */
export type JobUpgradeInput = { readonly jobId: string; readonly commandId: string; readonly expectedState?: string };
const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v);
export function validateJobUpgradeInput(raw: unknown): {valid: true; value: JobUpgradeInput} | {valid: false} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {valid: false};
  const r = raw as Record<string, unknown>;
  if (Reflect.ownKeys(r).some(k => typeof k !== "string" || !["jobId","commandId","expectedState"].includes(k))
    || !uuid(r.jobId) || !uuid(r.commandId) || (r.expectedState !== undefined && (typeof r.expectedState !== "string" || !/^[0-9a-f]{64}$/.test(r.expectedState)))) return {valid: false};
  return {valid: true, value: {...r} as JobUpgradeInput};
}
export function validateJobTypeTransition(from: string, to: string) {
  if (from === "projekt" && to === "order") return {allowed: false, code: "JOB_TYPE_DOWNGRADE_FORBIDDEN"};
  return {allowed: (from === "order" && to === "projekt") || (from === "projekt" && to === "projekt")};
}
export type JobUpgradeDraft = {jobId: string; revision: number; status: string; unresolved?: boolean;
  submission: null | {commandId: string; jobId: string; revision: number; status: string}};
export function createJobUpgradeDraft(jobId: string): JobUpgradeDraft { return {jobId,revision: 0,status: "editing",submission: null}; }
export function transitionJobUpgradeDraft(state: JobUpgradeDraft, event: Record<string, unknown>): JobUpgradeDraft {
  if(event.type === "begin-refetch") return state.status === "failed" && !state.unresolved ? {...state,status:"refetching",revision:state.revision+1}:state;
  if(event.type === "refetched" || event.type === "refetch-failed") {
    if(state.status !== "refetching" || event.revision !== state.revision) return state;
    return event.type === "refetched" ? {...state,status:"editing",submission:null,unresolved:false}:{...state,status:"failed"};
  }
  if (event.type === "retry") return state.status === "failed" && state.submission ? {...state,status:"submitting",submission:{...state.submission,status:"submitting"}} : state;
  if (event.type === "submit") return state.status !== "editing" || typeof event.commandId !== "string" ? state : {...state,status:"submitting",submission:{commandId:event.commandId,jobId:state.jobId,revision:state.revision,status:"submitting"}};
  if (!state.submission || event.commandId !== state.submission.commandId || event.jobId !== state.jobId || event.revision !== state.submission.revision) return state;
  if(state.status === "persisted") return state;
  if(event.type === "confirmed") return {...state,status:"persisted",unresolved:false};
  if(event.type !== "failed") return state;
  const code=event.code;
  const unresolved=code === undefined || code === "SERVER_ERROR" || (!!state.unresolved && ["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","PERMISSION_DENIED","TENANT_ACCESS_DENIED"].includes(String(code)));
  return {...state,status:"failed",unresolved};
}

export function canDismissJobUpgradeDraft(state: JobUpgradeDraft): boolean {
 return !["submitting","refetching"].includes(state.status) && !state.unresolved;
}
