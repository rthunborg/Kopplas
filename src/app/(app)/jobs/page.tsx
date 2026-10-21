import Link from "next/link";
import { JobList } from "@/components/jobs/JobList";
import { readJobList } from "@/features/jobs/read";
import { readMyJobs, readJobCardOptions } from "@/server/read-models/my-jobs";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { BookingEntry } from "@/components/resources/BookingEntry";
import { readBookingHost, readBookingEditorOptions } from "@/features/resources/bookings-read";

export const dynamic = "force-dynamic";
export default async function JobsPage({ searchParams }: { searchParams?: Promise<{ view?: string }> }) {
  const context = await resolveTenantContext();
  const roles = context.ok ? context.data.roles ?? [context.data.role] : [];
  const capability = (name: string) => resolveCapability({ roles, module: "jobs", capability: name }).granted;
  const canViewAll = capability("Jobs.ViewAll");
  const personal = !canViewAll || (await searchParams)?.view === "mine";
  const canCreate = capability("Jobs.Create");
  const { rows, error } = await (personal ? readMyJobs() : readJobList());
  const options = canCreate ? await readJobCardOptions() : undefined;
  const canBook = resolveCapability({ roles, module: "resources", capability: "Bookings.Manage" }).granted;
  const bookingPanel = canBook ? <BookingEntry {...await readBookingHost({})} options={await readBookingEditorOptions()} host="toolbar" /> : undefined;
  return <>
    {canViewAll && <nav aria-label="Urval av jobb" className="flex flex-wrap gap-4 px-4 pt-4 text-sm"><Link href="/jobs" aria-current={!personal ? "page" : undefined} className="underline">Alla jobb</Link><Link href="/jobs?view=mine" aria-current={personal ? "page" : undefined} className="underline">Mina jobb</Link></nav>}
    <JobList rows={rows} loadError={error} customerOptions={options?.customers ?? []} optionsLoadError={options?.error != null} cardOptions={options} canCreate={canCreate} personal={personal} bookingPanel={bookingPanel} />
  </>;
}
