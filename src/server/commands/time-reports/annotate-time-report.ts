import type { AnnotationInput } from "@/features/time-reports/types";
import { validateAnnotationInput } from "@/features/time-reports/validation";
import { defineCommand } from "../envelope";
import { executeTimeReport } from "./time-report-db";

export const annotateTimeReport = defineCommand<AnnotationInput, { reportId: string }>({
  command: "time_report.annotate", auditable: false, eventType: "time_report_annotated", targetType: "time_report",
  validateInput: validateAnnotationInput,
  execute: ctx => executeTimeReport(ctx.db, "annotate_time_report", {
    p_tenant_id: ctx.tenantContext.tenantId, p_actor_id: ctx.tenantContext.userId,
    p_attempt_id: ctx.input.attemptId, p_payload: ctx.input, p_correlation_id: ctx.correlationId,
  }),
});
