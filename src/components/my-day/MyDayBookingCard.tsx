import Link from "next/link";
import { myDayMapUrl } from "@/features/my-day/domain";
import type { MyDayData } from "@/features/my-day/types";
import type { TimeReportBookingPrefill } from "@/features/time-reports/types";

export const myDayControlClass = "inline-flex min-h-12 items-center justify-center rounded-lg border border-zinc-400 bg-white px-4 py-2 text-sm font-medium text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-600";
const allDayFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "short", day: "numeric" });
const instantFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function MyDayBookingCard({ booking, canReportOwn, onReport }: {
  readonly booking: MyDayData["bookings"][number];
  readonly canReportOwn: boolean;
  readonly onReport: (prefill: TimeReportBookingPrefill) => void;
}) {
  const mapUrl = myDayMapUrl(booking.address);
  const prefill = booking.timeReportPrefill;
  const firstDay = allDayFormat.format(new Date(booking.startsAt));
  const lastDay = allDayFormat.format(new Date(Date.parse(booking.endsAt) - 1));
  return <article data-testid={`my-day-booking-${booking.id}`} className="min-w-0 space-y-3 rounded-lg border border-zinc-200 bg-white p-4 text-zinc-950">
    <p className="text-sm font-medium tabular-nums">{booking.allDay ? `Heldag · ${firstDay}${firstDay !== lastDay ? ` – ${lastDay}` : ""}` : <><time dateTime={booking.startsAt}>{instantFormat.format(new Date(booking.startsAt))}</time> – <time dateTime={booking.endsAt}>{instantFormat.format(new Date(booking.endsAt))}</time></>}</p>
    <h3 className="break-words text-xl font-medium">{booking.jobLabel ?? "Bokning"}</h3>
    <p className="break-words text-sm text-zinc-700">{booking.customerLabel ?? "Kund saknas"}</p>
    {booking.description ? <p className="whitespace-pre-wrap break-words">{booking.description}</p> : null}
    {booking.ownAssignment ? <p className="break-words text-sm text-zinc-700">Din tilldelning: {booking.ownAssignment}</p> : null}
    {mapUrl ? <a className="inline-flex min-h-11 items-center break-words text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" href={mapUrl} target="_blank" rel="noopener noreferrer">{booking.address}<span className="sr-only"> (öppnas i en ny flik)</span></a> : <p className="text-sm text-zinc-600">Adress saknas</p>}
    <div className="flex flex-wrap gap-3">
      {booking.jobId ? <Link className={`${myDayControlClass} underline underline-offset-4`} href={`/jobs/${booking.jobId}`}>Öppna jobbet</Link> : null}
      {canReportOwn && prefill ? <button className={myDayControlClass} type="button" onClick={() => onReport(prefill)}>Rapportera tid</button> : null}
    </div>
  </article>;
}
