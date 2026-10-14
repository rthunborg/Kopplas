import type { BookingEditorOptions, BookingSummary } from "../resources/booking-action-state";
export const SCHEDULING_VIEWS = ["schema", "resources", "team", "capacity", "personal"] as const;
export type SchedulingView = typeof SCHEDULING_VIEWS[number];
export type SchedulingPeriodMode = "day" | "week" | "month";
export type SchedulingFilters = { readonly personIds: readonly string[]; readonly workRoleIds: readonly string[]; readonly jobIds: readonly string[]; readonly customerIds: readonly string[]; readonly status: "planned" | "cancelled" | "all" };
export type SchedulingReadInput = { readonly view: SchedulingView; readonly mode: SchedulingPeriodMode; readonly date: string; readonly filters: SchedulingFilters };
export type SchedulingBookingSummary = BookingSummary & { readonly needsReassignment?: boolean };
export type SchedulingRosterPerson = { readonly id: string; readonly label: string; readonly workRoleIds: readonly string[] };
export type SchedulingCapacityCell = { readonly personId: string; readonly date: string; readonly budget: number | null; readonly demand: number | null; readonly balance: number | null; readonly occupancy: number | null; readonly state: "available" | "overbooked" | "no-capacity" | "overbooked-no-capacity" | "unavailable"; readonly bookingIds: readonly string[] };
export type SchedulingReadData = { readonly canView: boolean; readonly canManage: boolean; readonly actorId: string; readonly tenantId: string; readonly bookings: readonly SchedulingBookingSummary[]; readonly ownSelfPersonIds: readonly string[]; readonly error: string | null; readonly workRoles?: readonly {readonly id:string;readonly label:string}[]; readonly options?: BookingEditorOptions; readonly roster?: readonly SchedulingRosterPerson[]; readonly capacity?: readonly SchedulingCapacityCell[]; readonly openConflictCount?: number };
export type SchedulingReadResult = { readonly data: SchedulingReadData; readonly entitlements: { readonly withheld: readonly string[] } };

/** Historical role display is independent of the active-only editor picker. */
export function schedulingWorkRoleLabel(roleId: string | null, workRoles: SchedulingReadData["workRoles"]): string {
  return roleId === null ? "Ingen arbetsroll" : workRoles?.find(role => role.id === roleId)?.label ?? `Arbetsroll ${roleId}`;
}
