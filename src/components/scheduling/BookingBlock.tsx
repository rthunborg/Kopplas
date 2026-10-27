"use client";
import { TimeReportEntry } from "@/components/time-reports/TimeReportEntry";
import { reportLocalInput, reportMinutesBetween } from "@/features/time-reports/domain";
import type { SchedulingBookingSummary, SchedulingReadData } from "@/features/scheduling/view-types";
import { schedulingWorkRoleLabel } from "@/features/scheduling/view-types";
import { BookingConflictChip } from "../resources/BookingConflictChip";
import { formatBookingTime } from "../resources/BookingConflictPanel";
export type BookingProposal = {booking:SchedulingBookingSummary; startsAt?:string;endsAt?:string;assigneeIds?:readonly string[]};
export function BookingBlock({booking,data,onEdit,personId,displayInterval}:{readonly booking:SchedulingBookingSummary;readonly data:SchedulingReadData;readonly onEdit:(proposal:BookingProposal,origin?:HTMLElement)=>void;readonly personId?:string;readonly displayInterval?:{startsAt:string;endsAt:string}}) {
  const reportMinutes=reportMinutesBetween(booking.startsAt,booking.endsAt);
  const ownPlanned=booking.status==="planned"&&booking.assigneeIds.some(id=>data.ownSelfPersonIds.includes(id));
  const role=schedulingWorkRoleLabel(booking.workRoleId,data.workRoles);
  return <article data-testid={`scheduling-booking-${booking.id}`} tabIndex={data.canManage?0:undefined} draggable={data.canManage} onDragStart={event=>{event.currentTarget.focus();event.dataTransfer.setData("application/kopplas-booking",booking.id);event.dataTransfer.setData("application/kopplas-person",personId??"");event.dataTransfer.effectAllowed="move";}} className="min-w-0 space-y-1 rounded-md border border-zinc-300 bg-blue-50 p-3 text-sm">
    <p className="break-words font-medium">{booking.description||"Bokning"}</p><p><time dateTime={displayInterval?.startsAt??booking.startsAt}>{formatBookingTime(displayInterval?.startsAt??booking.startsAt)}</time> – <time dateTime={displayInterval?.endsAt??booking.endsAt}>{formatBookingTime(displayInterval?.endsAt??booking.endsAt)}</time></p>
    <p data-testid="scheduling-booking-status">{booking.status==="planned"?"Planerad":"Avbruten"}</p>
    {booking.isException && <p data-testid="booking-series-exception">avviker från serien{booking.status==="cancelled"?" · Avbrutet tillfälle":""}</p>}
    <p className="break-words">{booking.assigneeIds.map(id=>data.roster?.find(p=>p.id===id)?.label??(data.ownSelfPersonIds.includes(id)?"Du":`Resursperson ${id.slice(0,8)}`)).join(", ")}</p>
    {data.canManage&&<><p><span aria-hidden="true">◇ </span>{role}</p><p>{data.options?.jobs.find(j=>j.id===booking.jobId)?.label} {data.options?.customers.find(c=>c.id===booking.customerId)?.label}</p>{booking.needsReassignment&&<p>Behöver omfördelas</p>}{booking.openConflictCount>0&&<BookingConflictChip count={booking.openConflictCount} canManage scope={{bookingId:booking.id}} />}<div className="flex flex-wrap gap-1"><button type="button" onClick={event=>onEdit({booking},event.currentTarget)} className="min-h-11 px-2 underline focus-visible:ring-2 focus-visible:ring-blue-600">Redigera / flytta</button><button type="button" data-testid="scheduling-resize" draggable onDragStart={event=>{event.stopPropagation();event.currentTarget.focus();event.dataTransfer.setData("application/kopplas-resize",booking.id);}} onClick={event=>onEdit({booking},event.currentTarget)} className="min-h-11 px-2 underline focus-visible:ring-2 focus-visible:ring-blue-600">Ändra längd</button></div></>}
    {ownPlanned&&<TimeReportEntry prefill={{bookingId:booking.id,startsAt:booking.startsAt,endsAt:booking.endsAt,minutes:reportMinutes,jobId:booking.jobId,date:reportLocalInput(booking.startsAt).slice(0,10)}}/>}
  </article>;
}


