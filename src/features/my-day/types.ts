import type { TimeReportBookingPrefill } from "@/features/time-reports/types";

export type MyDayQuery = { readonly date?: string; readonly mode?: "day" | "week"; readonly noticePage?: number };
export type MyDayBooking = {
  readonly id: string; readonly startsAt: string; readonly endsAt: string;
  readonly allDay: boolean; readonly description: string | null; readonly ownAssignment: string | null;
  readonly jobId?: string | null; readonly jobLabel?: string | null;
  readonly customerLabel: string | null; readonly address: string | null;
  readonly timeReportPrefill: TimeReportBookingPrefill | null;
};
export type MyDayJob = { readonly id: string; readonly title: string; readonly customerLabel: string | null;
  readonly status: "created" | "in_progress"; readonly myRole: "arbetsledare" | "member" | "booking_assignee" };
export type MyDayNotice = { readonly id: string; readonly title: string; readonly body: string;
  readonly route: "/scheduling"; readonly createdAt: string };
export type MyDayData = { readonly date: string; readonly mode: "day" | "week"; readonly dates: readonly string[];
  readonly bookings: readonly MyDayBooking[]; readonly activeJobs?: readonly MyDayJob[]; readonly jobsActive: boolean;
  readonly canReportOwn: boolean; readonly notices: readonly MyDayNotice[]; readonly noticesHasMore: boolean;
  readonly noticesMoreHref: null; readonly noticePage: number; readonly noticesUnavailable: boolean };
export type MyDayReadResult = ({ readonly ok: true; readonly data: MyDayData } |
  { readonly ok: false; readonly code: "DENIED" | "UNAVAILABLE" | "INVALID_INPUT"; readonly message: string }) &
  { readonly renderContextKey?: string };
