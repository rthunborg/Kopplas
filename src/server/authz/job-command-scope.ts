/** Closed exception: only these dedicated commands may consult current job leadership.
 * Tenant-wide capabilities and every existing consumer remain unchanged. */
const scoped = {
  "job.member.assign": "Jobs.ManageCrew",
  "job.member.remove": "Jobs.ManageCrew",
  "job.plan_dates.update": "Jobs.UpdatePlannedDates",
} as const;
export function isJobScopedCommand(command: string, capability: {module: string; capability: string} | undefined): boolean {
  return Object.hasOwn(scoped, command) && capability?.module === "jobs"
    && capability.capability === scoped[command as keyof typeof scoped];
}
