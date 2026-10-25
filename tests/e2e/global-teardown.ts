/**
 * Playwright globalTeardown — remove the seeded two-tenant fixture.
 *
 * Reads the fixture serialized by globalSetup and runs `cleanupFixture` (which purges
 * audit-bearing tenants via the TEST-ONLY privileged path). Best-effort: a teardown
 * failure must not fail the run (CI uses a fresh `supabase db reset` per run anyway).
 * Ordinary runs remove `.auth`. Owned application runs retain the verified
 * zero-length original file and directory; interruption erasure is UNKNOWN.
 */
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { cleanupFixture, type TwoTenantFixture } from "../factories/tenants";
import { adminSession } from "../factories/admin-sql";
import { FIXTURE_FILE, finishOwnedAuthCleanup, hasOwnedAuthRoute } from "./global-setup";

type OriginalFixture = TwoTenantFixture & {
  readonly operatorConsole?: { readonly provisioningOrganisationNumber?: string };
};

export async function cleanupOriginalFixture(fixture: OriginalFixture) {
    const provisionedOrganisationNumber = fixture.operatorConsole?.provisioningOrganisationNumber;
    if (provisionedOrganisationNumber) {
      // The approval E2E creates one uniquely-named tenant through the public
      // command. Remove only that test identity through the existing local
      // fixture teardown capability; no reset or broad cleanup is involved.
      await adminSession(async ({ query }) => {
        await query("begin");
        try {
          await query("set local session_replication_role = replica");
          await query(
            `delete from public.audit_events where tenant_id in
               (select id from public.tenants where country_code='SE' and normalized_organization_number=$1)`,
            [provisionedOrganisationNumber],
          );
          // The protocol request deliberately has no tenant-delete cascade in
          // production. Restore normal FK behaviour after the immutable-audit
          // exception, remove only this generated request, then let cascades
          // clear the remaining synthetic tenant graph.
          await query("set local session_replication_role = origin");
          await query(
            `delete from public.tenant_provisioning_requests where tenant_id in
               (select id from public.tenants where country_code='SE' and normalized_organization_number=$1)`,
            [provisionedOrganisationNumber],
          );
          await query("delete from public.tenants where country_code='SE' and normalized_organization_number=$1", [provisionedOrganisationNumber]);
          await query("commit");
        } catch (error) {
          await query("rollback");
          throw error;
        }
      });
    }
    await cleanupFixture(fixture);
}

export default async function globalTeardown() {
  // Mode routes refusal; only the authentic setup closure grants FD authority.
  if (hasOwnedAuthRoute() || process.env.KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE === "verify-application") {
    const result = await finishOwnedAuthCleanup();
    if (result.erasure !== "verified-original-zero" || !result.retained || !result.closed)
      throw new Error("e2e owned auth cleanup unverified");
    return;
  }
  try {
    const fixture = JSON.parse(readFileSync(FIXTURE_FILE, "utf8")) as TwoTenantFixture & {
      readonly operatorConsole?: { readonly provisioningOrganisationNumber?: string };
    };
    await cleanupOriginalFixture(fixture);
  } catch (e) {
    console.warn(
      `e2e teardown: ${e instanceof Error ? e.message : String(e)}`,
    );
  } finally {
    rmSync(path.dirname(FIXTURE_FILE), { recursive: true, force: true });
  }
}
