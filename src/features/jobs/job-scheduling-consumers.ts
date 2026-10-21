import { formatUtcInstant, parseUtcInstant, validateLocalDate, localDateForInstant, stockholmLocalToUtc } from "../scheduling/time-zone";

/** Checked selected-job hints are presentation inputs, never write authority. */
export type JobSchedulingHint = {
  readonly jobId: string;
  readonly durationMinutes: number | null;
  readonly crewSize: number | null;
  readonly travelMinutes: number | null;
  readonly earliestDate: string | null;
  readonly desiredDate: string | null;
  readonly latestDate: string | null;
  readonly customerPresenceRequired: boolean | null;
};
export type JobBookingInterval = {
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly provenance: "derived" | "explicit" | "existing" | "user";
  readonly sourceJobId?: string | null;
  readonly startProvenance?: "derived" | "explicit" | "existing" | "user";
};
export type JobSchedulingWarning = {
  readonly code: "desired_date_missed" | "latest_date_breached";
  readonly advisory: true;
};
export type JobSchedulingContext = {
  readonly suggestedDate: string;
  readonly customerPresenceRequired: boolean | null;
  readonly warnings: readonly JobSchedulingWarning[];
  readonly canSave: true;
};
export type JobSchedulingDraft = {
  readonly interval: JobBookingInterval;
  readonly revision: number;
  readonly input: Readonly<Record<string, unknown>>;
  readonly submission: unknown | null;
};

/** D is elapsed on-site time. Crew and travel never lengthen a booking default.
 * Only untouched create defaults may be rederived after a selected-job change.
 */
export function deriveJobBookingInterval(input: {
  readonly mode: "create" | "edit";
  readonly interval: JobBookingInterval;
  readonly job: JobSchedulingHint | null;
}): JobBookingInterval {
  if (input.mode === "edit" || input.interval.provenance !== "derived") return input.interval;
  let startsAt=input.interval.startsAt;
  if(input.interval.startProvenance === "derived" && input.job?.earliestDate) {
    validateLocalDate(input.job.earliestDate);
    if(localDateForInstant(parseUtcInstant(startsAt)) < input.job.earliestDate)
      startsAt=stockholmLocalToUtc(`${input.job.earliestDate}T08:00:00`);
  }
  const duration = input.job?.durationMinutes;
  const minutes = duration == null ? 60 : duration;
  if (!Number.isSafeInteger(minutes) || minutes < 1) throw new Error("Invalid booking duration hint");
  const endsAt = formatUtcInstant(parseUtcInstant(startsAt) + BigInt(minutes) * BigInt(60000000))
    .replace(/\.000000Z$/, "Z");
  return { ...input.interval, startsAt, endsAt, sourceJobId: input.job?.jobId ?? null };
}

/** Earliest bounds the start suggestion; desired/latest advise on the actual end.
 * Calendar occupancy is half open (datesForRange): an exclusive local-midnight
 * end belongs to the previous occupied day, for timed and all-day bookings alike.
 * Project the last occupied microsecond only; never rewrite either boundary.
 */
export function jobSchedulingContext(input: {
  readonly selectedJobId: string;
  readonly jobs: readonly JobSchedulingHint[];
  readonly startsAt: string;
  readonly endsAt: string;
}): JobSchedulingContext {
  const start = parseUtcInstant(input.startsAt);
  const end = parseUtcInstant(input.endsAt);
  if (end <= start) throw new Error("Invalid booking interval");
  const startDate = localDateForInstant(start);
  const endDate = localDateForInstant(end - BigInt(1));
  const job = input.jobs.find((entry) => entry.jobId === input.selectedJobId);
  for (const date of [job?.earliestDate, job?.desiredDate, job?.latestDate]) {
    if (date != null) validateLocalDate(date);
  }
  const suggestedDate = job?.earliestDate && startDate < job.earliestDate
    ? job.earliestDate : startDate;
  const warnings: JobSchedulingWarning[] = [];
  if (job?.desiredDate && endDate > job.desiredDate) warnings.push({ code: "desired_date_missed", advisory: true });
  if (job?.latestDate && endDate > job.latestDate) warnings.push({ code: "latest_date_breached", advisory: true });
  return { suggestedDate, customerPresenceRequired: job?.customerPresenceRequired ?? null, warnings, canSave: true };
}

/** A refresh must match the current revision AND selected job. An unresolved
 * submission keeps its exact interval/input for retry, including after failure.
 */
export function refreshJobSchedulingDraft<T extends JobSchedulingDraft>(state: T, input: {
  readonly job: JobSchedulingHint;
  readonly responseRevision: number;
}): T {
  if (input.responseRevision !== state.revision || state.input.jobId !== input.job.jobId || state.submission != null
    || state.interval.provenance !== "derived") return state;
  const interval = deriveJobBookingInterval({ mode: "create", interval: state.interval, job: input.job });
  return { ...state, interval, input: { ...state.input,
    ...(Object.hasOwn(state.input, "startsAt") ? { startsAt: interval.startsAt } : {}),
    ...(Object.hasOwn(state.input, "endsAt") ? { endsAt: interval.endsAt } : {}),
  } };
}