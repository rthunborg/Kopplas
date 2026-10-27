import { defineCommand } from "../envelope";
import { commitConflictResolution } from "@/server/bookings/conflict-resolution";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";
import type { ResolutionInput,ResolutionResult } from "@/features/scheduling/conflict-resolver-types";
import { validateConflictResolution } from "./conflict-resolution-validation";
export const resolveBookingConflict=defineCommand<ResolutionInput,ResolutionResult>({command:"resolveBookingConflict",auditable:false,
  eventType:"booking_conflict_resolved",targetType:"booking",validateInput:validateConflictResolution,
  execute:ctx=>commitConflictResolution(ctx.db as unknown as BookingRpcClient,{p_tenant_id:ctx.tenantContext.tenantId,p_actor_id:ctx.tenantContext.userId,
    p_correlation_id:ctx.correlationId,p_command_id:ctx.input.commandId},ctx.input)});
