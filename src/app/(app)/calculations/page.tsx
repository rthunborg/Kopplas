/**
 * `/calculations` (Kalkyler) — the calculation list (Story 5.2, Task 1.3; architecture §4).
 *
 * A SERVER component over the RLS-scoped list read: it reads the tenant's ACTIVE
 * calculations on the per-request cookie-bound RLS client (anon key — NEVER service-role)
 * and hands the rows to the client `CalculationList` island (which owns the `Ny kalkyl`
 * create affordance). Each row links to `/calculations/[calculationId]` — the editor is the
 * heart of this story; this list is a thin index.
 *
 * `force-dynamic` because this route reads per-request auth/data (the `(app)` layout is the
 * auth boundary; only the `build` gate catches a missing one). This page adds NO auth
 * mechanism and NO new nav item — Kalkyler already exists in the seven-item shell nav.
 */
import { CalculationAuthorityProvider, type EditorAuthority, type EditorReentryCheck, CalculationList } from "@/components/calculations/CalculationList";
import { readCalculationList } from "@/features/calculations/read";
import { readCustomerList } from "@/features/crm/read";

import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { requireCapability } from "@/server/authz/require-capability";

/** Read-only reentry: the opaque scope action alone cannot authorize a draft. */
async function readCreateAuthority(check: EditorReentryCheck): Promise<EditorAuthority> {
  try {
    const client = await createSupabaseServerClient();
    const context = await resolveTenantContext({ client });
    if (!context.ok) return { status: context.code === "SERVER_ERROR" ? "unavailable" : "denied" };
    const { data, error } = await client.auth.getClaims();
    if (error) return { status: "unavailable" };
    const epoch = data?.claims.session_id;
    if (typeof epoch !== "string" || data?.claims.sub !== context.data.userId) return { status: "denied" };
    const { userId, tenantId, role, roles } = context.data;
    if (check.formKey !== "new/calculation" || !requireCapability({ roles: roles ?? [role], module: "calculations", capability: "Calculations.Create" }).ok) return { status: "denied" };
    const list = await readCalculationList();
    if (list.error) return { status: "unavailable" };
    for (const values of check.requests) {
      const form = new Map(values);
      const customerId = form.get("customer_id");
      if (!customerId) { if (form.get("facility_id") || form.get("contact_id")) return { status: "denied" }; continue; }
      const customer = await client.from("customers").select("id").eq("id", customerId).eq("tenant_id", tenantId).is("archived_at", null).maybeSingle();
      if (customer.error) return { status: "unavailable" };
      if (!customer.data) return { status: "denied" };
      for (const [field, table] of [["facility_id", "facilities"], ["contact_id", "contacts"]] as const) {
        const id = form.get(field);
        if (!id) continue;
        const target = await client.from(table).select("id").eq("id", id).eq("tenant_id", tenantId).eq("customer_id", customerId).is("archived_at", null).maybeSingle();
        if (target.error) return { status: "unavailable" };
        if (!target.data) return { status: "denied" };
      }
    }
    return { status: "allowed", scope: `${userId}/${tenantId}`, epoch };
  } catch { return { status: "unavailable" }; }
}

export const dynamic = "force-dynamic";

export default async function CalculationsPage() {
  // The list + the active-customer options for the `Ny kalkyl` create affordance (a calc
  // always needs a customer). Both reads run on the per-request RLS client.
  const [{ rows, error }, { rows: customers }] = await Promise.all([
    readCalculationList(),
    readCustomerList(),
  ]);
  const customerOptions = customers.map((c) => ({
    id: c.id,
    label: c.display_name,
  }));
  const authority = await readCreateAuthority({ formKey: "new/calculation", requests: [] });
  async function authorizeReentry(check: EditorReentryCheck): Promise<EditorAuthority> {
    "use server";
    return readCreateAuthority(check);
  }
  return (
    <CalculationAuthorityProvider authority={authority} authorize={authorizeReentry}>
    <CalculationList
      key={authority.status === "allowed" ? `${authority.scope}/${authority.epoch}` : authority.status}
      rows={rows}
      loadError={error}
      customerOptions={customerOptions}
    />
    </CalculationAuthorityProvider>
  );
}
