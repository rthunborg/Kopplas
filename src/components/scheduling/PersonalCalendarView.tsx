"use client";
import Link from "next/link";
import { BookingBlock } from "./BookingBlock";
import { SchemaView,type CalendarViewProps } from "./SchemaView";
export function PersonalCalendarView(props:CalendarViewProps){return <section aria-label="Min kalender">
  <Link href="/settings/calendar" className="mb-3 inline-flex min-h-11 items-center text-blue-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Kalenderprenumeration</Link>
  <div aria-label="Egen agenda" className={props.input.mode==="day"?"space-y-3":"space-y-3 sm:hidden"}>
    {props.bookings.map(b=><BookingBlock key={b.id} booking={b} data={props.data} onEdit={props.onEdit}/>)}
  </div>
  {props.input.mode==="week"&&<div aria-label="Egen veckokalender" className="hidden sm:block"><SchemaView {...props}/></div>}
  {!props.bookings.length&&<p>Inga egna bokningar i perioden.</p>}
</section>;}
