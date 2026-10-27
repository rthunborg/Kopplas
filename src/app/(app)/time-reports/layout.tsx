import { RouteAccessBoundary } from "@/components/app-shell/RouteAccessBoundary";
export default function TimeReportsLayout({children}:{readonly children:React.ReactNode}){return <RouteAccessBoundary route="/time-reports">{children}</RouteAccessBoundary>;}
