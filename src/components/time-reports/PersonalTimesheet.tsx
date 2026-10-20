"use client";
import Link from "next/link";
import { formatReportMinutes, personalWeek } from "@/features/time-reports/domain";
import type { TimeReport, TimeReportReadResult } from "@/features/time-reports/types";
import { timeReportButtonClass } from "./TimeReportForm";

export function TimeReportLinks({report,onNavigate}:{readonly onNavigate?:(event:React.MouseEvent<HTMLAnchorElement>)=>void;readonly report:Pick<TimeReport,"bookingId"|"jobId"|"jobLabel">}) {return <div className="flex flex-wrap gap-2 text-sm">{report.bookingId&&<Link onClick={onNavigate} onAuxClick={onNavigate} href="/scheduling" className="inline-flex min-h-11 items-center rounded-md border border-zinc-200 px-3 underline">Bokning</Link>}{report.jobId&&<Link onClick={onNavigate} onAuxClick={onNavigate} href={`/jobs/${report.jobId}`} className="inline-flex min-h-11 items-center rounded-md border border-zinc-200 px-3 underline">{report.jobLabel??"Jobb"}</Link>}{!report.jobId&&<span className="py-3">Utan jobb</span>}</div>;}

export function PersonalTimesheet({result,weekStart,onRetry,onReport}:{readonly result:TimeReportReadResult|{ok:false;code:string};readonly weekStart:string;readonly onRetry:()=>void;readonly onReport?:(report:TimeReport)=>void}) {

 if(!result.ok)return <div role="alert" className="space-y-3 rounded-md border border-red-300 p-4"><p>Anslutning krävs. Veckan kunde inte läsas.</p><button type="button" className={timeReportButtonClass} onClick={onRetry}>Försök igen</button></div>;

 const week=personalWeek({weekStart,userId:result.data.userId,reports:result.data.reports,bookedDates:result.data.bookedDates});

 return <section aria-label="Min vecka" className="space-y-4"><p className="text-lg font-medium">Rapporterat: <span data-testid="time-report-week-total">{formatReportMinutes(week.totalMinutes)}</span></p><div className="grid gap-3 lg:grid-cols-2">{week.days.map(day=><article key={day.date} className="space-y-2 rounded-md border border-zinc-200 p-4"><h2 className="font-medium"><time dateTime={day.date}>{new Intl.DateTimeFormat("sv-SE",{weekday:"long",day:"numeric",month:"short",timeZone:"UTC"}).format(new Date(`${day.date}T12:00:00Z`))}</time> · {formatReportMinutes(day.minutes)}</h2>{day.missing&&<p data-testid={`time-report-missing-${day.date}`} className="text-sm font-medium text-amber-900">Tid saknas · planerad bokning, ingen tidrapport för dagen</p>}{day.reports.length===0?<p className="text-sm text-zinc-600">Inga tidrapporter</p>:<ul className="space-y-3">{day.reports.map(report=><li key={report.id} data-testid={`time-report-row-${report.id}`} className="space-y-1 border-t border-zinc-200 pt-2"><p>Rapporterad · {formatReportMinutes(report.minutes)}</p>{report.note&&<p className="break-words whitespace-pre-wrap text-sm">{report.note}</p>}<TimeReportLinks report={report}/>{report.reviewedAt&&<p className="text-sm">Granskningsnotering: {report.reviewNote??"Ingen notering"}</p>}{onReport&&<button type="button" className={timeReportButtonClass} onClick={()=>onReport(report)}>Visa tidrapport</button>}</li>)}</ul>}</article>)}</div></section>;

}

