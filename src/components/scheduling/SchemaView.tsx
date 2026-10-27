"use client";

import { useEffect, useRef } from "react";
import type { SchedulingReadInput, SchedulingReadData, SchedulingBookingSummary } from "@/features/scheduling/view-types";
import { normalizeSlotSelection, schedulingPeriod, resourceMoveAssignees, calendarDropTimes } from "@/features/scheduling/view-model";
import { bookingRange } from "@/features/scheduling/capacity";
import { intersectRanges, localDayRange, parseUtcInstant, formatUtcInstant } from "@/features/scheduling/time-zone";
import { BookingBlock, type BookingProposal } from "./BookingBlock";

export type SlotSelection = { startsAt: string; endsAt: string; personId?: string };
export type CalendarViewProps = {
  readonly input: SchedulingReadInput;
  readonly data: SchedulingReadData;
  readonly bookings: readonly SchedulingBookingSummary[];
  readonly onSelect: (slot: SlotSelection) => void;
  readonly onEdit: (proposal: BookingProposal, origin?: HTMLElement) => void;
  readonly onDay?: (date: string) => void;
};

/** Pointer selection proposes exact instants; the editor retains all write authority. */
export function CalendarSlots({ date, personId, host, onSelect, onEdit, bookings, data }: {
  readonly date: string;
  readonly personId?: string;
  readonly host: string;
  readonly onSelect: CalendarViewProps["onSelect"];
  readonly onEdit: CalendarViewProps["onEdit"];
  readonly bookings: readonly SchedulingBookingSummary[];
  readonly data?: SchedulingReadData;
}) {
  const selection = useRef<string | null>(null);
  const moved = useRef(false);
  const suppressPointerClick = useRef(false);
  useEffect(() => {
    const cancel = () => { if (selection.current) { suppressPointerClick.current = true; moved.current = false; } selection.current = null; };
    // Pointerup outside the host cannot leave an armed selection behind.
    const release = () => { queueMicrotask(cancel); };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") cancel(); };
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  const day = localDayRange(date); const clock = new Intl.DateTimeFormat("sv-SE", {timeZone:"Europe/Stockholm", hour:"2-digit", minute:"2-digit", hourCycle:"h23", timeZoneName:"shortOffset"});
  return <div data-focus-instance={`${host}:${date}:${personId ?? ""}`} aria-label={`Tider ${date}`} className={host === "resources" ? "flex gap-1" : "space-y-1"}>
    {Array.from({ length: Number((day.end-day.start)/BigInt(1800000000)) }, (_, index) => {
      const start = formatUtcInstant(day.start + BigInt(index) * BigInt(1800000000));
      const timeLabel = clock.format(new Date(start));
      const end = formatUtcInstant(parseUtcInstant(start) + BigInt(1800000000));
      const range = { start: parseUtcInstant(start), end: parseUtcInstant(end) };
      const overlapping = bookings.filter(b => intersectRanges(bookingRange(b), range));
      const occupied = overlapping.some(b => b.status === "planned");
      const beginning = overlapping.filter(b => {
        const clipped = intersectRanges(bookingRange(b), localDayRange(date));
        return clipped && clipped.start >= range.start && clipped.start < range.end;
      });
      return <div key={index} className={host === "resources" ? "w-40 shrink-0 space-y-1" : "space-y-1"}>
        <button type="button" disabled={data?.canManage===false} aria-disabled={occupied}
          data-testid={`${host}-slot`} data-start={start} data-person={personId ?? ""}
          aria-label={`${date} ${timeLabel}${personId ? " för resurs" : ""}`}
          className={`min-h-11 w-full rounded border px-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-blue-600 ${occupied ? "border-blue-200 bg-blue-50" : "border-zinc-200 bg-white"}`}
          onPointerDown={event => {
            if (event.button !== 0 || occupied) return;
            selection.current = start; moved.current = false; suppressPointerClick.current = false; event.currentTarget.focus();
          }}
          onPointerEnter={() => { if (selection.current && selection.current !== start) moved.current = true; }}
          onPointerUp={() => {
            if (!selection.current) return;
            const first = selection.current; selection.current = null;
            if (moved.current) onSelect(normalizeSlotSelection(first, start, personId));
          }}
          onClick={event => {
            // Keyboard/assistive clicks (detail=0) are independent of a cancelled pointer sequence.
            if (!(suppressPointerClick.current && event.detail!==0) && !moved.current && !occupied) onSelect(normalizeSlotSelection(start, start, personId));
            suppressPointerClick.current = false;
            moved.current = false;
          }}
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();
            const resize = event.dataTransfer.getData("application/kopplas-resize");
            const id = resize || event.dataTransfer.getData("application/kopplas-booking");
            const booking = data?.bookings.find(b => b.id === id) ?? bookings.find(b => b.id === id);
            if (!booking || data?.canManage===false) return;
            const times = calendarDropTimes(booking,start,end,Boolean(resize));
            if (!times) return;
            if (resize) onEdit({booking,...times});
            else {
              const fromPerson = event.dataTransfer.getData("application/kopplas-person");
              onEdit({ booking, ...times,
                ...(personId && fromPerson ? { assigneeIds: resourceMoveAssignees(booking.assigneeIds, fromPerson, personId) } : {}) });
            }
          }}>{timeLabel}{occupied ? " · bokat" : ""}</button>
        {data && beginning.map(b => {
          const clipped = intersectRanges(bookingRange(b), localDayRange(date))!;
          return <div key={b.id} data-clipped-start={formatUtcInstant(clipped.start)} data-clipped-end={formatUtcInstant(clipped.end)}>
            <BookingBlock booking={b} data={data} personId={personId} onEdit={onEdit} displayInterval={{startsAt:formatUtcInstant(clipped.start),endsAt:formatUtcInstant(clipped.end)}} />
          </div>;
        })}
      </div>;
    })}
  </div>;
}

export function SchemaView(props: CalendarViewProps) {
  const dates = schedulingPeriod(props.input.date, props.input.mode).dates;
  return <section aria-label="Schema" className="space-y-4">
    <div data-focus-instance="schema-agenda" aria-label="Agenda" className="grid gap-3 sm:hidden">
      {props.bookings.map(b => <BookingBlock key={b.id} booking={b} data={props.data} onEdit={props.onEdit} />)}
    </div>
    <div className={props.input.mode === "month" ? "overflow-x-auto" : "hidden overflow-x-auto sm:block"}>
      <div className={`grid gap-3 ${props.input.mode === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
        {dates.map(date => {
          const bookings = props.bookings.filter(b => intersectRanges(bookingRange(b), localDayRange(date)));
          return <section key={date} className="min-w-40 rounded-md border border-zinc-200 p-2">
            <h2 className="mb-2 font-medium">{date}</h2>
            {props.input.mode === "month" ?
              <button type="button" data-testid="schema-density-day" data-date={date} className="min-h-11 px-2 underline" onClick={() => props.onDay?.(date)}>{bookings.length} bokningar · öppna dag</button> :
              <CalendarSlots date={date} host="schema" data={props.data} bookings={props.bookings}
                personId={props.input.filters.personIds.length === 1 ? props.input.filters.personIds[0] : undefined}
                onSelect={props.data.canManage ? props.onSelect : () => {}} onEdit={props.onEdit} />}
          </section>;
        })}
      </div>
    </div>
  </section>;
}



