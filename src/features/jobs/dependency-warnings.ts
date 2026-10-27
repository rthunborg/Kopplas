/**
 * Pure job-to-job planned-date warning (16.1 P8 / U08).
 * Callers supply resolved job IDs and already validated, zero-padded Gregorian
 * calendar dates (YYYY-MM-DD, years 0001–9999), or null for missing dates.
 * This helper neither validates input nor resolves links or schedules jobs.
 */
export interface JobDependencyDates {
  readonly prerequisiteJobId: string;
  readonly dependentJobId: string;
  readonly prerequisitePlannedEnd: string | null;
  readonly dependentPlannedStart: string | null;
}

export type MissingDependencyDate =
  | "prerequisitePlannedEnd"
  | "dependentPlannedStart";

export type JobDependencyWarning = {
  readonly prerequisiteJobId: string;
  readonly dependentJobId: string;
} & (
  | { readonly status: "warning" }
  | { readonly status: "clear" }
  | {
      readonly status: "unknown";
      readonly missingDates: readonly MissingDependencyDate[];
    }
);

export function evaluateJobDependency(
  dates: JobDependencyDates,
): JobDependencyWarning {
  const identity = {
    prerequisiteJobId: dates.prerequisiteJobId,
    dependentJobId: dates.dependentJobId,
  };
  const missingDates: MissingDependencyDate[] = [];
  if (dates.prerequisitePlannedEnd === null) {
    missingDates.push("prerequisitePlannedEnd");
  }
  if (dates.dependentPlannedStart === null) {
    missingDates.push("dependentPlannedStart");
  }
  if (
    dates.prerequisitePlannedEnd === null ||
    dates.dependentPlannedStart === null
  ) {
    return { ...identity, status: "unknown", missingDates };
  }
  // Canonical calendar dates sort chronologically without timezone conversion.
  return {
    ...identity,
    status:
      dates.prerequisitePlannedEnd > dates.dependentPlannedStart
        ? "warning"
        : "clear",
  };
}
