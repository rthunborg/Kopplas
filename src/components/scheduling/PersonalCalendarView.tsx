"use client";
import { BookingBlock } from "./BookingBlock";
import { SchemaView,type CalendarViewProps } from "./SchemaView";
export function PersonalCalendarView(props:CalendarViewProps){return <section aria-label="Min kalender">
  <div aria-label="Egen agenda" className={props.input.mode==="day"?"space-y-3":"space-y-3 sm:hidden"}>
    {props.bookings.map(b=><BookingBlock key={b.id} booking={b} data={props.data} onEdit={props.onEdit}/>)}
  </div>
  {props.input.mode==="week"&&<div aria-label="Egen veckokalender" className="hidden sm:block"><SchemaView {...props} data={{...props.data,canManage:false}}/></div>}
  {!props.bookings.length&&<p>Inga egna bokningar i perioden.</p>}
</section>;}
