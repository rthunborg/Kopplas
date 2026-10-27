import { RouteAccessBoundary } from "@/components/app-shell/RouteAccessBoundary";

export default function MyDayLayout({ children }: { readonly children: React.ReactNode }) {
  return <RouteAccessBoundary route="/my-day">{children}</RouteAccessBoundary>;
}
