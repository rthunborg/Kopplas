import { resolveCapability } from "./permission-matrix";
/** Presentation descriptor only. SQL rechecks active roles and row scope on every read/write. */
export function jobAccess(roles: readonly unknown[] | undefined) {
  const capability = (name: string) => resolveCapability({ roles, module: "jobs", capability: name }).granted;
  return { viewAll: capability("Jobs.ViewAll"), viewAssigned: capability("Jobs.ViewAssigned"),
    create: capability("Jobs.Create"), edit: capability("Jobs.Edit") };
}
