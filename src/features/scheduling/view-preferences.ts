import type { SchedulingReadInput, SchedulingView } from "./view-types";
import { EMPTY_SCHEDULING_FILTERS, validateSchedulingReadInput } from "./view-model";
import { localDateForInstant } from "./time-zone";
export type PreferenceScope = {readonly actorId: string; readonly tenantId: string; readonly view: SchedulingView};
export type PreferenceStorage = Pick<Storage,"getItem"|"setItem">;
export type SchedulingEligibleFilters = {readonly personIds:readonly string[];readonly workRoleIds:readonly string[];readonly jobIds:readonly string[];readonly customerIds:readonly string[]};
export function defaultSchedulingInput(view: SchedulingView = "schema", date = localDateForInstant(BigInt(Date.now())*BigInt(1000))): SchedulingReadInput {return {view,mode:"week",date,filters:{...EMPTY_SCHEDULING_FILTERS}};}
export function schedulingPreferenceKey(scope: PreferenceScope): string {return `kopplas:scheduling:v1:${encodeURIComponent(scope.actorId)}:${encodeURIComponent(scope.tenantId)}:${scope.view}`;}
export function reconcileSchedulingPreferences(value: SchedulingReadInput, eligible: SchedulingEligibleFilters): {value:SchedulingReadInput;reset:boolean} {
  try {validateSchedulingReadInput(value);if((Object.keys(eligible) as (keyof SchedulingEligibleFilters)[]).some(key=>value.filters[key].some(id=>!eligible[key].includes(id))))throw new Error("unavailable");return {value,reset:false};}catch{return {value:defaultSchedulingInput(value.view,value.date),reset:true};}
}
export function saveSchedulingPreferences(scope: PreferenceScope,value: SchedulingReadInput,storage: PreferenceStorage): void {try {validateSchedulingReadInput(value);if(value.view !== scope.view)return;const {view,mode,date,filters:{personIds,workRoleIds,jobIds,customerIds,status}}=value;storage.setItem(schedulingPreferenceKey(scope),JSON.stringify({version:1,input:{view,mode,date,filters:{personIds,workRoleIds,jobIds,customerIds,status}}}));}catch{/* Storage cannot block a connected read. */}}
export function restoreSchedulingPreferences(scope: PreferenceScope,storage: PreferenceStorage,eligible: SchedulingEligibleFilters,date?:string): {value:SchedulingReadInput;reset:boolean} {
  const fallback=defaultSchedulingInput(scope.view,date);
  try {const raw=storage.getItem(schedulingPreferenceKey(scope));if(!raw)return {value:fallback,reset:false};const parsed=JSON.parse(raw);if(parsed.version!==1)throw new Error("version");const value=validateSchedulingReadInput(parsed.input);if(value.view!==scope.view || (Object.keys(eligible) as (keyof typeof eligible)[]).some(key=>value.filters[key].some(id=>!eligible[key].includes(id))))throw new Error("unavailable");return {value,reset:false};}catch{return {value:fallback,reset:true};}
}
