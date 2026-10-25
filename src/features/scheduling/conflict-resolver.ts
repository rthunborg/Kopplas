import type { ConflictScope, ResolverBooking, ResolverGroup } from "./conflict-resolver-types";
import { localDateForInstant, parseUtcInstant } from "./time-zone";
export const CONFLICT_RULE_LABELS: Record<string, string> = { double_booking: "Dubbelbokning", over_capacity: "Över kapacitet",
  outside_work_hours: "Utanför arbetstid", outside_access_window: "Utanför tillträdestid", competence_missing: "Kompetens saknas" };
/** Scope chooses complete groups, never trims their participants or windows. */
export function scopedConflictGroups(groups: readonly ResolverGroup[], bookings: readonly ResolverBooking[], scope: ConflictScope): ResolverGroup[] {
  const ids = new Set(bookings.filter(b => (!scope.bookingId || b.id === scope.bookingId) && (!scope.jobId || b.payload.jobId === scope.jobId) &&
    (!scope.customerId || b.payload.customerId === scope.customerId) && (!scope.start || parseUtcInstant(b.payload.endsAt) > parseUtcInstant(scope.start)) &&
    (!scope.end || parseUtcInstant(b.payload.startsAt) < parseUtcInstant(scope.end))).map(b => b.id));
  return [...new Map(groups.filter(g => g.bookingIds.some(id => ids.has(id))).map(g => [g.logicalId, g])).values()];
}
export function groupConflictQueue(groups: readonly ResolverGroup[]) {
  const grouped = new Map<string, { personId: string; date: string; groups: ResolverGroup[] }>();
  for (const group of groups) {
    const date = localDateForInstant(parseUtcInstant(group.startsAt)); const key = `${group.personId}:${date}`;
    const row = grouped.get(key) ?? { personId: group.personId, date, groups: [] };
    row.groups.push(group); grouped.set(key, row);
  }
  return [...grouped.values()].sort((a,b) => a.personId.localeCompare(b.personId) || a.date.localeCompare(b.date));
}
export function conflictScopeLabel(scope: ConflictScope): string {
  return scope.bookingId ? "Vald bokning" : scope.jobId ? "Valt jobb" : scope.customerId ? "Vald kund" : scope.start ? "Hela planeringsperioden" : "Alla konflikter";
}
export function conflictResolverHref(scope: ConflictScope = {}): string {
  const params = new URLSearchParams(Object.entries(scope).filter((entry): entry is [string,string] => typeof entry[1] === "string"));
  return `/scheduling/conflicts${params.size ? `?${params}` : ""}`;
}
