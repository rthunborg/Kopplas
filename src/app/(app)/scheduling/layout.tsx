import { RouteAccessBoundary } from "@/components/app-shell/RouteAccessBoundary";
export default function SchedulingLayout({children}:{readonly children:React.ReactNode}){return <RouteAccessBoundary route="/scheduling">{children}</RouteAccessBoundary>;}
