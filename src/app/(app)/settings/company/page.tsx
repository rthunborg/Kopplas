import { Suspense } from "react";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
/**
 * `/settings/company` (Företagsinställningar) — company identity + VAT display/rate
 * defaults (Story 3.3, Task 4.1).
 *
 * A SERVER component over the RLS-scoped settings read: it reads the tenant's
 * company_settings on the per-request cookie-bound RLS client (anon key — NEVER
 * service-role) and hands the values to the client `CompanySettingsForm` island. A
 * tenant with no settings row yet renders sensible defaults (an empty form with the
 * legacy 25% VAT default).
 *
 * `force-dynamic` because this route reads per-request auth/data (the `(app)` layout is
 * the auth boundary; only the `build` gate catches a missing one). This page adds NO
 * auth mechanism.
 */
import Link from "next/link";
import { CompanySettingsForm } from "@/components/settings/CompanySettingsForm";
import {
  COMPANY_SETTINGS_DEFAULT_VAT_RATE_BP,
  readCompanySettings,
} from "@/features/settings/read";
import { bpToPercentString } from "@/features/settings/vat-display";

export const dynamic = "force-dynamic";

export default function CompanySettingsPage() {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-gutter-field sm:p-gutter">
      <div className="flex flex-col gap-2">
        <Link
          href="/settings"
          className="inline-flex min-h-control-lg items-center self-start rounded-control text-label text-text-secondary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          ← Inställningar
        </Link>
        <h1 className="text-title font-semibold text-text-primary wrap-anywhere">
          Företagsinställningar
        </h1>
        <p className="text-label text-text-secondary">
          Företagsidentitet för offerter och PDF, samt standardvärden för
          momsvisning och momssats.
        </p>
      </div>

      <Suspense fallback={<p role="status" className="text-body text-text-secondary">Hämtar företagsinställningar…</p>}>
        <CompanySettingsContent />
      </Suspense>
    </div>
  );
}

async function CompanySettingsContent() {
  const contextResult = await resolveTenantContext();
  const operationContext = contextResult.ok ? { tenantId: contextResult.data.tenantId, actorId: contextResult.data.userId } : null;
  const { settings, error } = await readCompanySettings();

  const defaults = {
    operationContext,
    readToken: crypto.randomUUID(),
    write_revision: settings?.write_revision ?? null,
    readError: error !== null,
    id: settings?.id ?? null,
    company_name: settings?.company_name ?? null,
    org_nr: settings?.org_nr ?? null,
    address_line1: settings?.address_line1 ?? null,
    address_line2: settings?.address_line2 ?? null,
    postal_code: settings?.postal_code ?? null,
    city: settings?.city ?? null,
    email: settings?.email ?? null,
    phone: settings?.phone ?? null,
    default_vat_display: settings?.default_vat_display ?? "company_togglable",
    vat_rate_percent: bpToPercentString(
      settings?.vat_rate_bp ?? COMPANY_SETTINGS_DEFAULT_VAT_RATE_BP,
    ),
  };

  return (
    <>
      {error && (
        <p
          role="alert"
          className="max-w-2xl rounded-control border border-risk-text bg-risk-surface px-3 py-2 text-label text-risk-text"
        >
          {error}
        </p>
      )}

      <CompanySettingsForm defaults={defaults} />
    </>
  );
}
