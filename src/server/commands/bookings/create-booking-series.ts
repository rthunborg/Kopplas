import { defineCommand } from "../envelope";
import { saveBookingSeries } from "@/server/bookings/series-conflicts";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";
import { seriesCommandPayload, validateBookingSeries, type BookingSeriesInput, type BookingSeriesResult } from "./series-validation";
export const createBookingSeries = defineCommand<BookingSeriesInput, BookingSeriesResult>({ command: "createBookingSeries", auditable: false,
  eventType: "booking_series_created", targetType: "booking_series", validateInput: raw => validateBookingSeries(raw),
  execute: ctx => saveBookingSeries(ctx.db as unknown as BookingRpcClient, { p_tenant_id: ctx.tenantContext.tenantId,
    p_actor_id: ctx.tenantContext.userId, p_correlation_id: ctx.correlationId, p_command_id: ctx.input.commandId, p_input: seriesCommandPayload(ctx.input) }, ctx.input) });
