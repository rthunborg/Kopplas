import { NoTenantAccess } from "@/components/app-shell/NoTenantAccess";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { TENANT_CONTEXT_MESSAGES } from "@/server/auth/tenant-context";

/** Direct route access repeats both capabilities before rendering its destination. */
export default async function FilesLayout({ children }: { readonly children: React.ReactNode }) {
  const context = await resolveTenantContext();
  if (!context.ok && context.code === "SERVER_ERROR") {
    return <section className="flex flex-col gap-6 p-6"><h1 className="text-2xl font-semibold text-zinc-900">Dokument</h1><p role="alert">{context.message} <a href="/files" className="underline focus-visible:ring-2">Försök igen</a></p></section>;
  }
  if (!context.ok || !resolveCapability({ roles: context.data.roles, module: "documents", capability: "Documents.View" }).granted ||
    !resolveCapability({ roles: context.data.roles, module: "files", capability: "Files.View" }).granted) {
    return <NoTenantAccess message={TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED} />;
  }
  return children;
}
