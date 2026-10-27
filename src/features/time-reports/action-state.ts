import { reportLocalInput, reportMinutesBetween, reportToday } from "./domain";
import { stockholmLocalToUtc } from "@/features/scheduling/time-zone";
import { isReportDate, parseReportHours } from "./validation";
import type { TimeReportBookingPrefill, TimeReportDraft } from "./types";

export type TimeReportAttempt<T>={readonly status:"draft"|"pending"|"unknown"|"rejected"|"confirmed";readonly request:T;readonly hasUnknownOutcome?:boolean;readonly message?:string};
/** Once a response is lost, later denials cannot establish that the first write failed. */
export function timeReportAttemptAfter<T>(state:TimeReportAttempt<T>,event:"unknown"|"retry"|"success"|"rejected"):TimeReportAttempt<T>{
  if(state.status==="confirmed")return state;
  if(event==="retry")return state.status==="unknown"?{...state,status:"pending",hasUnknownOutcome:true}:state;
  if(state.status!=="pending")return state;
  if(event==="success")return {...state,status:"confirmed",hasUnknownOutcome:false};
  if(event==="unknown"||state.hasUnknownOutcome)return {...state,status:"unknown",hasUnknownOutcome:true};
  return {...state,status:"rejected"};
}
export function canEditTimeReportAttempt(state:{status:string}):boolean{return state.status==="draft"||state.status==="rejected";}
export function currentTimeReportResponse(current:number,response:number):boolean{return current===response;}
export function annotationOutcomeAfter<T extends {status:string;hasUnknownOutcome?:boolean}>(state:T,event:"pending"|"stale"|"success"|"unknown"|"rejected"){
  if(event==="stale")return {...state,status:"refresh-required",hasUnknownOutcome:false};
  if(event==="success")return {...state,status:"confirmed",hasUnknownOutcome:false};
  if(event==="pending")return {...state,status:"pending",hasUnknownOutcome:state.hasUnknownOutcome||state.status==="unknown"};
  if(event==="unknown"||state.hasUnknownOutcome)return {...state,status:"unknown",hasUnknownOutcome:true};
  return {...state,status:"error"};
}
export function timeReportDraftFromBooking(prefill?:TimeReportBookingPrefill):TimeReportDraft {
  return {date:prefill?.date??reportToday(),dateEdited:false,hours:prefill?(prefill.minutes===null?"":String(prefill.minutes/60)):"1",canonicalHoursMinutes:prefill?.minutes??null,note:"",bookingId:prefill?.bookingId??null,jobId:prefill?.jobId??null,mode:prefill&&prefill.minutes!==null?"interval":"hours",exactPrefillUnavailable:prefill?.minutes===null,startsAtLocal:prefill?reportLocalInput(prefill.startsAt):"",endsAtLocal:prefill?reportLocalInput(prefill.endsAt):""};
}
export function updateTimeReportDraft(draft:TimeReportDraft,patch:Partial<TimeReportDraft>):TimeReportDraft {
  const next={...draft,...patch};
  if(patch.hours!==undefined)next.canonicalHoursMinutes=null;
  if(patch.date!==undefined)next.dateEdited=true;
  if(patch.startsAtLocal!==undefined&&!next.dateEdited&&isReportDate(patch.startsAtLocal.slice(0,10)))next.date=patch.startsAtLocal.slice(0,10);
  return next;
}
/** Preserve each untouched authoritative endpoint separately, including fold offset and microseconds. */
export function timeReportDraftMinutes(draft:TimeReportDraft,source?:TimeReportBookingPrefill):number|null {
  if(draft.mode!=="interval")return draft.canonicalHoursMinutes??parseReportHours(draft.hours);
  try {
    const endpoint=(value:string|undefined,original:string|undefined)=>original&&value===reportLocalInput(original)?original:stockholmLocalToUtc(value?.length===16?`${value}:00`:value??"");
    return reportMinutesBetween(endpoint(draft.startsAtLocal,source?.startsAt),endpoint(draft.endsAtLocal,source?.endsAt));
  }catch{return null;}
}
export function timeReportNavigationAllowed(state:{status:string;dirty:boolean},confirmDiscard:()=>boolean):boolean {
  if(state.status==="pending"||state.status==="unknown")return false;
  return !state.dirty||confirmDiscard();
}
