import { defineCommand } from "../envelope";
import { validateCreateWorkOrderInput, validateUpdateWorkOrderInput, validateWorkOrderAssigneesInput,
  validateWorkOrderStatusInput, validateWorkOrderDependenciesInput, validateJobWorkOrderDependenciesInput,
  type WorkOrderInput } from "@/features/jobs/work-orders-domain";
import { workOrderMutation } from "./work-orders-db";
export const createWorkOrder = defineCommand<WorkOrderInput, {jobId: string; workOrderId?: string}>({
 command: "work_order.create", auditable: false, eventType: "work_order.create", targetType: "work_order",
 validateInput: raw => { const result = validateCreateWorkOrderInput(raw); return result.valid ? {ok: true, data: result.value} : {ok: false, code: "VALIDATION_FAILED"}; },
 ownership: input => ({table: "jobs", id: input.jobId}), execute: ctx => workOrderMutation(ctx, "create_work_order_with_audit"),
});
export const updateWorkOrder = defineCommand<WorkOrderInput, {jobId: string; workOrderId?: string}>({
 command: "work_order.update", auditable: false, eventType: "work_order.update", targetType: "work_order",
 validateInput: raw => { const result = validateUpdateWorkOrderInput(raw); return result.valid ? {ok: true, data: result.value} : {ok: false, code: "VALIDATION_FAILED"}; },
 ownership: input => ({table: "jobs", id: input.jobId}), execute: ctx => workOrderMutation(ctx, "update_work_order_with_audit"),
});
export const setWorkOrderAssignees = defineCommand<WorkOrderInput, {jobId: string; workOrderId?: string}>({
 command: "work_order.assignees.set", auditable: false, eventType: "work_order.assignees.set", targetType: "work_order",
 validateInput: raw => { const result = validateWorkOrderAssigneesInput(raw); return result.valid ? {ok: true, data: result.value} : {ok: false, code: "VALIDATION_FAILED"}; },
 ownership: input => ({table: "jobs", id: input.jobId}), execute: ctx => workOrderMutation(ctx, "set_work_order_assignees_with_audit"),
});
export const setWorkOrderStatus = defineCommand<WorkOrderInput, {jobId: string; workOrderId?: string}>({
 command: "work_order.status.set", auditable: false, eventType: "work_order.status.set", targetType: "work_order",
 validateInput: raw => { const result = validateWorkOrderStatusInput(raw); return result.valid ? {ok: true, data: result.value} : {ok: false, code: "VALIDATION_FAILED"}; },
 ownership: input => ({table: "jobs", id: input.jobId}), execute: ctx => workOrderMutation(ctx, "set_work_order_status_with_audit"),
});
export const setWorkOrderDependencies = defineCommand<WorkOrderInput, {jobId: string; workOrderId?: string}>({
 command: "work_order.dependencies.set", auditable: false, eventType: "work_order.dependencies.set", targetType: "work_order",
 validateInput: raw => { const result = validateWorkOrderDependenciesInput(raw); return result.valid ? {ok: true, data: result.value} : {ok: false, code: "VALIDATION_FAILED"}; },
 ownership: input => ({table: "jobs", id: input.jobId}), execute: ctx => workOrderMutation(ctx, "set_work_order_dependencies_with_audit"),
});
export const setJobWorkOrderDependencies = defineCommand<WorkOrderInput, {jobId: string; workOrderId?: string}>({
 command: "job.work_order_dependencies.set", auditable: false, eventType: "job.work_order_dependencies.set", targetType: "work_order",
 validateInput: raw => { const result = validateJobWorkOrderDependenciesInput(raw); return result.valid ? {ok: true, data: result.value} : {ok: false, code: "VALIDATION_FAILED"}; },
 ownership: input => ({table: "jobs", id: input.jobId}), execute: ctx => workOrderMutation(ctx, "set_job_work_order_dependencies_with_audit"),
});
