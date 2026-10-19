import { resolveCapability } from "./permission-matrix";
export type TrustedJobFacts = {
  readonly tenantId: string; readonly jobId: string;
  readonly actorMembershipActive: boolean; readonly actorProfileActive: boolean;
  readonly currentLead: {readonly tenantId: string; readonly jobId: string} | null;
};
/** Presentation descriptor only. Facts originate on the server; SQL checks current scope again. */
export function jobAccess(roles: readonly unknown[] | undefined, facts?: TrustedJobFacts) {
  const capability = (name: string) => resolveCapability({roles, module: "jobs", capability: name}).granted;
  const currentLead = facts?.actorMembershipActive === true && facts.actorProfileActive === true
    && facts.currentLead?.tenantId === facts.tenantId && facts.currentLead?.jobId === facts.jobId;
  return {viewAll: capability("Jobs.ViewAll"), viewAssigned: capability("Jobs.ViewAssigned") || currentLead,
    create: capability("Jobs.Create"), edit: capability("Jobs.Edit"),
    canManageCrew: capability("Jobs.ManageCrew") || currentLead,
    canSetLead: capability("Jobs.SetLead"),
    canUpdatePlannedDates: capability("Jobs.UpdatePlannedDates") || currentLead};
}

/** A failed relational lookup is not proof of absence. Independent role grants stand. */
export function resolveJobRouteAdmission(roles: readonly unknown[] | undefined,
  admission: {readonly ok: true; readonly admitted: boolean} | {readonly ok: false}): "allowed" | "denied" | "unavailable" {
  const access = jobAccess(roles);
  if (access.viewAll || access.viewAssigned) return "allowed";
  return admission.ok ? admission.admitted ? "allowed" : "denied" : "unavailable";
}
