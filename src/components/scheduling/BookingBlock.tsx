"use client";
import type { SchedulingBookingSummary, SchedulingReadData } from "@/features/scheduling/view-types";
import { schedulingWorkRoleLabel } from "@/features/scheduling/view-types";
import { formatBookingTime } from "../resources/BookingConflictPanel";
export type BookingProposal = {booking:SchedulingBookingSummary; startsAt?:string;endsAt?:string;assigneeIds?:readonly string[]};
export function BookingBlock({booking,data,onEdit,personId}:{readonly booking:SchedulingBookingSummary;readonly data:SchedulingReadData;readonly onEdit:(proposal:BookingProposal)=>void;readonly personId?:string}) {
  const role=schedulingWorkRoleLabel(booking.workRoleId,data.workRoles);
  return <article data-testid={`scheduling-booking-${booking.id}`} tabIndex={data.canManage?0:undefined} draggable={data.canManage} onDragStart={event=>{event.currentTarget.focus();event.dataTransfer.setData("application/kopplas-booking",booking.id);event.dataTransfer.setData("application/kopplas-person",personId??"");event.dataTransfer.effectAllowed="move";}} className="min-w-0 space-y-1 rounded-md border border-zinc-300 bg-blue-50 p-3 text-sm">
    <p className="break-words font-medium">{booking.description||"Bokning"}</p><p>{formatBookingTime(booking.startsAt)} – {formatBookingTime(booking.endsAt)}</p>
    <p className="break-words">{booking.assigneeIds.map(id=>data.roster?.find(p=>p.id===id)?.label??(data.ownSelfPersonIds.includes(id)?"Du":`Resursperson ${id.slice(0,8)}`)).join(", ")}</p>
    {data.canManage&&<><p><span aria-hidden="true">◇ </span>{role}</p><p>{data.options?.jobs.find(j=>j.id===booking.jobId)?.label} {data.options?.customers.find(c=>c.id===booking.customerId)?.label}</p>{booking.needsReassignment&&<p>Behöver omfördelas</p>}{booking.openConflictCount>0&&<p>⚠ Konflikter ({booking.openConflictCount})</p>}<div className="flex flex-wrap gap-1"><button type="button" onClick={()=>onEdit({booking})} className="min-h-11 px-2 underline focus-visible:ring-2 focus-visible:ring-blue-600">Redigera / flytta</button><button type="button" data-testid="scheduling-resize" draggable onDragStart={event=>{event.stopPropagation();event.currentTarget.focus();event.dataTransfer.setData("application/kopplas-resize",booking.id);}} onClick={()=>onEdit({booking})} className="min-h-11 px-2 underline focus-visible:ring-2 focus-visible:ring-blue-600">Ändra längd</button></div></>}
  </article>;
}


