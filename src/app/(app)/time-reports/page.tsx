import { TimeReportWorkspace } from "@/components/time-reports/TimeReportWorkspace";
import { reportToday, reportWeekStart } from "@/features/time-reports/domain";
import { readTimeReports } from "@/server/read-models/time-reports";
export const dynamic="force-dynamic";
export default async function TimeReportsPage(){const initialQuery={weekStart:reportWeekStart(reportToday()),mode:"own" as const};return <TimeReportWorkspace initial={await readTimeReports(initialQuery)} initialQuery={initialQuery}/>;}
