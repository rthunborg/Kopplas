"use client";
import {BookingEntry} from "@/components/resources/BookingEntry";
import type {JobWorkspace} from "@/server/read-models/job-workspace";
import {formatBookingTime} from "@/components/resources/BookingConflictPanel";
/** Mini-timeline uses exactly the current user's visible job intervals. */
export function JobWorkspaceSchedule({schedule, jobId, customerId}: {
  schedule: NonNullable<JobWorkspace["schedule"]>; jobId: string; customerId: string | null;
}) {
  return <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
    <h2 className="text-lg font-semibold text-zinc-900">Schema</h2>
    <BookingEntry {...schedule} options={schedule.options} jobId={jobId} customerId={customerId ?? undefined} host="job" />
    {!schedule.error && schedule.canView && schedule.bookings.length > 0 && <section data-testid="booking-mini-timeline" aria-label="Bokningarnas tidslinje" className="space-y-2 text-sm">
      <h3 className="font-semibold">Tidslinje</h3><ol className="space-y-3 border-l-2 border-blue-700 pl-3">{schedule.bookings.map(booking => <li key={booking.id} data-testid={`booking-interval-${booking.id}`}>
        <p className="font-medium">{booking.description || "Bokning"}</p><time dateTime={booking.startsAt}>{formatBookingTime(booking.startsAt)}</time> – <time dateTime={booking.endsAt}>{formatBookingTime(booking.endsAt)}</time>
      </li>)}</ol>
    </section>}
  </div>;
}
