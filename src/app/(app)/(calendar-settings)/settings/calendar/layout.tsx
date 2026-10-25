import { RouteAccessBoundary } from "@/components/app-shell/RouteAccessBoundary";
/** Personal settings use Bookings.View rather than the company-settings grant. */
export default function CalendarSettingsLayout({ children }: { readonly children: React.ReactNode }) { return <RouteAccessBoundary route="/scheduling">{children}</RouteAccessBoundary>; }
