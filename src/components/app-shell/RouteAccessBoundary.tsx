import { notFound } from "next/navigation";
import { readJobLeadAdmission } from "@/server/read-models/job-members";
import { resolveJobRouteAdmission } from "@/server/authz/job-access";
import { NoTenantAccess } from "@/components/app-shell/NoTenantAccess";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { canAccessPhaseARoute } from "@/server/authz/phase-a-surface";
import { TENANT_CONTEXT_MESSAGES } from "@/server/auth/tenant-context";

/**
 * Server-only route gate for an active Phase A module. Navigation is only a
 * presentation DTO; this boundary makes a crafted direct URL fail before its
 * page (and therefore its RLS-backed reads) is rendered.
 */
export async function RouteAccessBoundary({
  route,
  children,
}: {
  readonly route: string;
  readonly children: React.ReactNode;
}) {
  const context = await resolveTenantContext();
  if (context.ok && route === "/jobs") {
    const admission = await readJobLeadAdmission(context.data.tenantId);
    const decision = resolveJobRouteAdmission(context.data.roles, admission);
    if (decision === "unavailable") return <section role="alert" data-testid="job-access-failed" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
      <p>Behörigheten till jobb kunde inte kontrolleras. Försök igen.</p>
      <form action="/jobs" method="get"><button type="submit" className="mt-3 min-h-11 underline">Försök läsa jobb igen</button></form>
    </section>;
    if (decision === "denied") notFound();
    return children;
  }
  if (!context.ok || !canAccessPhaseARoute(context.data.roles, route)) {
    return <NoTenantAccess message={TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED} />;
  }

  return children;
}
