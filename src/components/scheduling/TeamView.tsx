"use client";
import { schedulingWorkRoleLabel } from "@/features/scheduling/view-types";
import { schedulingPeriod } from "@/features/scheduling/view-model";
import { bookingRange } from "@/features/scheduling/capacity";
import { intersectRanges,localDayRange } from "@/features/scheduling/time-zone";
import { BookingBlock } from "./BookingBlock";
import type { CalendarViewProps } from "./SchemaView";
export function TeamView(props:CalendarViewProps){const groups=[...new Set(props.bookings.map(b=>b.workRoleId??"unassigned"))];return <section aria-label="Team" className="space-y-4">{groups.map(role=><section key={role}><h2 className="mb-2 font-medium">{schedulingWorkRoleLabel(role==="unassigned"?null:role,props.data.workRoles)}</h2><div className="grid gap-3 sm:grid-cols-7">{schedulingPeriod(props.input.date,"week").dates.map(date=><section key={date} className="min-w-0 space-y-2 rounded-md border border-zinc-200 p-2"><h3>{date}</h3>{props.bookings.filter(b=>(b.workRoleId??"unassigned")===role&&intersectRanges(bookingRange(b),localDayRange(date))).map(b=><BookingBlock key={b.id} booking={b} data={props.data} onEdit={props.onEdit}/>)}</section>)}</div></section>)}</section>;}

