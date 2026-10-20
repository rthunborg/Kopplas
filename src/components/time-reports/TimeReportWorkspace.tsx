"use client";
import { useRef, useState } from "react";
import { Dialog } from "@/components/crm/Dialog";
import { readTimeReportsAction } from "@/features/time-reports/actions";
import { formatReportMinutes, reportWeekStart, shiftReportDate } from "@/features/time-reports/domain";
import { currentTimeReportResponse } from "@/features/time-reports/action-state";
import { isReportDate } from "@/features/time-reports/validation";
import type { TimeReport, TimeReportQuery, TimeReportReadResult } from "@/features/time-reports/types";
import { PersonalTimesheet, TimeReportLinks } from "./PersonalTimesheet";
import { TimeReportEntry } from "./TimeReportEntry";
import { TimeReportReview } from "./TimeReportReview";
import { timeReportButtonClass, timeReportFieldClass } from "./TimeReportForm";

export function TimeReportWorkspace({initial,initialQuery,readAction=readTimeReportsAction}:{readonly initial:TimeReportReadResult;readonly initialQuery:TimeReportQuery;readonly readAction?:(query:TimeReportQuery)=>Promise<TimeReportReadResult>}) {

 const [result,setResult]=useState(initial),[query,setQuery]=useState(initialQuery),[loading,setLoading]=useState(false),[selected,setSelected]=useState<TimeReport|null>(null),[reviewBusy,setReviewBusy]=useState(false),[reviewDirty,setReviewDirty]=useState(false),sequence=useRef(0);

 const [authority,setAuthority]=useState(initial.ok?initial.data:null);
 const week=query.weekStart??query.week??(initial.ok?initial.data.weekStart:""),review=query.mode==="review";

 async function load(next:TimeReportQuery=query){const current=++sequence.current;setQuery(next);setLoading(true);try{const read=await readAction(next);if(currentTimeReportResponse(sequence.current,current)){setResult(read);if(read.ok)setAuthority(read.data);}}catch{if(currentTimeReportResponse(sequence.current,current))setResult({ok:false,status:"error",code:"READ_FAILED"});}finally{if(currentTimeReportResponse(sequence.current,current))setLoading(false);}}

 function refresh(){setSelected(null);setReviewDirty(false);setReviewBusy(false);void load();}

 return <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold">Tidrapporter</h1>{authority?.canReportOwn&&<TimeReportEntry jobs={result.ok?result.data.jobs:[]} bookings={result.ok?result.data.bookings:[]} onSaved={()=>void load()}/>}</div>

  <div className="flex flex-wrap items-end gap-3"><label className="space-y-1"><span className="block text-sm">Vecka</span><input type="date" className={timeReportFieldClass} value={week} onChange={event=>{if(isReportDate(event.target.value))return load({...query,week:undefined,weekStart:reportWeekStart(event.target.value)});}}/></label><button type="button" disabled={!week} className={timeReportButtonClass} onClick={()=>void load({...query,week:undefined,weekStart:shiftReportDate(week,-7)})}>Föregående vecka</button><button type="button" disabled={!week} className={timeReportButtonClass} onClick={()=>void load({...query,week:undefined,weekStart:shiftReportDate(week,7)})}>Nästa vecka</button><button type="button" className={timeReportButtonClass} onClick={()=>void load()}>Uppdatera</button></div>

  {authority?.canReview&&<nav role="tablist" aria-label="Tidrapportläge" className="flex flex-wrap gap-3"><button type="button" role="tab" aria-selected={!review} className={timeReportButtonClass} onClick={()=>void load({weekStart:week,mode:"own"})}>Min vecka</button><button type="button" role="tab" aria-selected={review} className={timeReportButtonClass} onClick={()=>void load({weekStart:week,mode:"review"})}>Granska</button></nav>}

  {review&&authority?.canReview&&<div className="flex flex-wrap gap-3"><label className="min-w-0 flex-1 space-y-1"><span>Person</span><select className={timeReportFieldClass} value={query.personId??""} onChange={event=>void load({...query,personId:event.target.value||undefined})}><option value="">Alla personer</option>{(result.ok?result.data.people:authority.people).map(person=><option key={person.id} value={person.id}>{person.label}</option>)}</select></label><label className="min-w-0 flex-1 space-y-1"><span>Jobb</span><select className={timeReportFieldClass} value={query.jobId??""} onChange={event=>void load({...query,jobId:event.target.value||undefined})}><option value="">Alla jobb och utan jobb</option>{(result.ok?result.data.jobs:authority.jobs).map(job=><option key={job.id} value={job.id}>{job.label}</option>)}</select></label></div>}

  {loading?<p role="status">Läser tidrapporter…</p>:review?(result.ok?<section aria-label="Granska tidrapporter" className="space-y-4"><p className="text-lg font-medium">Rapporterat i urvalet: <span data-testid="time-report-review-total">{formatReportMinutes(result.data.totalMinutes)}</span></p><div className="grid gap-4 sm:grid-cols-2"><div><h2 className="font-medium">Per person</h2><ul>{result.data.byPerson.map(row=><li key={row.userId}>{result.data.people.find(person=>person.id===row.userId)?.label??`Person ${row.userId.slice(0,8)}`}: <span data-testid={`time-report-person-total-${row.userId}`}>{formatReportMinutes(row.minutes)}</span></li>)}</ul></div><div><h2 className="font-medium">Per jobb</h2><ul>{result.data.byJob.map(row=><li key={row.jobId??"unlinked"}>{row.jobId?result.data.jobs.find(job=>job.id===row.jobId)?.label??"Jobb":"Utan jobb"}: <span data-testid={row.jobId?`time-report-job-total-${row.jobId}`:"time-report-unlinked-total"}>{formatReportMinutes(row.minutes)}</span></li>)}</ul></div></div>{result.data.reports.length===0?<p>Inga tidrapporter i urvalet.</p>:<ul className="space-y-3">{result.data.reports.map(report=><li key={report.id} data-testid={`time-report-row-${report.id}`} className="space-y-2 rounded-md border border-zinc-200 p-4"><p>{report.personLabel??result.data.people.find(person=>person.id===report.userId)?.label??"Person"} · {report.date} · {formatReportMinutes(report.minutes)}</p><TimeReportLinks report={report}/><button type="button" className={timeReportButtonClass} onClick={()=>setSelected(report)}>Granska</button></li>)}</ul>}</section>:<PersonalTimesheet result={result} weekStart={week} onRetry={()=>void load()}/>):<PersonalTimesheet result={result} weekStart={week} onRetry={()=>void load()} onReport={setSelected}/>}

  <Dialog open={selected!==null} title={review?"Granska tidrapport":"Tidrapport"} variant="sheet" busy={reviewBusy} onClose={()=>{if(!reviewBusy&&(!reviewDirty||window.confirm("Du har osparade ändringar. Lämna utan att spara?"))){setSelected(null);setReviewDirty(false);}}}>{selected&&<TimeReportReview key={selected.id} report={selected} canReview={review&&!!authority?.canReview} onSaved={()=>void load()} onRefresh={refresh} onBusyChange={setReviewBusy} onDirtyChange={setReviewDirty}/>}</Dialog>

 </main>;

}

