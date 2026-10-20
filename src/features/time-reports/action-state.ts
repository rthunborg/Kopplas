export type TimeReportAttempt<T>={readonly status:"draft"|"pending"|"unknown"|"rejected"|"confirmed";readonly request:T;readonly message?:string};

export function timeReportAttemptAfter<T>(state:TimeReportAttempt<T>,event:"unknown"|"retry"|"success"|"rejected"):TimeReportAttempt<T>{

  if(state.status==="confirmed")return state;

  if(event==="retry")return state.status==="unknown"?{...state,status:"pending"}:state;

  if(state.status!=="pending")return state;

  return {...state,status:event==="success"?"confirmed":event};

}

export function canEditTimeReportAttempt(state:{status:string}):boolean{return state.status==="draft"||state.status==="rejected";}

export function currentTimeReportResponse(current:number,response:number):boolean{return current===response;}

export function annotationOutcomeAfter<T extends {status:string}>(state:T,event:"stale"|"success"|"unknown"){return {...state,status:event==="stale"?"refresh-required":event==="success"?"confirmed":"unknown"};}

