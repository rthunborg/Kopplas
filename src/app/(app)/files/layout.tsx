import { NoTenantAccess } from "@/components/app-shell/NoTenantAccess";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { TENANT_CONTEXT_MESSAGES } from "@/server/auth/tenant-context";

/** Direct route access repeats both capabilities before rendering its destination. */
export default async function FilesLayout({ children }: { readonly children: React.ReactNode }) {
  const context = await resolveTenantContext();
  if (!context.ok || !resolveCapability({ roles: context.data.roles, module: "documents", capability: "Documents.View" }).granted ||
    !resolveCapability({ roles: context.data.roles, module: "files", capability: "Files.View" }).granted) {
    return <NoTenantAccess message={TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED} />;
  }
  return children;
}
