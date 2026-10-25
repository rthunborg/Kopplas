import type { ReportInput } from "@/features/time-reports/types";
import { validateReportInput } from "@/features/time-reports/validation";
import { defineCommand } from "../envelope";
import { executeTimeReport } from "./time-report-db";

export const fileTimeReport = defineCommand<ReportInput, { reportId: string }>({
  command: "time_report.file", auditable: false, eventType: "time_report_filed", targetType: "time_report",
  validateInput: validateReportInput,
  execute: ctx => executeTimeReport(ctx.db, "file_time_report", {
    p_tenant_id: ctx.tenantContext.tenantId, p_actor_id: ctx.tenantContext.userId,
    p_attempt_id: ctx.input.attemptId, p_payload: ctx.input, p_correlation_id: ctx.correlationId,
  }),
});
