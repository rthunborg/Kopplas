"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { runCommand, type CommandDbClient } from "@/server/commands/envelope";
import { CommandError, COMMAND_MESSAGES, type CommandErrorCode } from "@/server/commands/command-errors";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
import { updateBookingSeries } from "@/server/commands/bookings/update-booking-series";
import { validateBookingSeries, seriesCommandPayload } from "@/server/commands/bookings/series-validation";
import { previewBookingSeries, type SeriesRpcArgs } from "@/server/bookings/series-conflicts";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";
import type { RecurrenceRule } from "@/features/scheduling/recurrence-types";
import { expandRecurrence } from "@/features/scheduling/recurrence";
import type { BookingFacts } from "./booking-types";
import { validateBookingCandidateReferences } from "@/server/bookings/candidate-references";
import { bookingActionFitsTransport } from "./booking-transport";
const failure = (code: CommandErrorCode, message = COMMAND_MESSAGES[code]) => ({ status: "error" as const, code, message });
function errorCode(error: unknown): CommandErrorCode {
  if (error instanceof CommandError) return error.code;
  const code = (error as { code?: string })?.code;
  if (["42501", "23503"].includes(code ?? "")) return "TENANT_ACCESS_DENIED";
  if (code === "BR409") return "PREVIEW_STALE";
  if (code === "BK409") return "COMMAND_CONFLICT";
  return "SERVER_ERROR";
}
const isUpdate = (input: unknown) => !!input && typeof input === "object" && !!(input as { sourceSeriesId?: string }).sourceSeriesId;
export async function previewBookingSeriesAction(input: unknown) {
  try {
    if (!bookingActionFitsTransport(input)) return failure("VALIDATION_FAILED");
    const client = await createSupabaseServerClient(); const context = await resolveTenantContext({ client });
    if (!context.ok) return failure(context.code);
    if (!resolveCapability({ roles: context.data.roles ?? [context.data.role], module: "resources", capability: "Bookings.Manage" }).granted) return failure("PERMISSION_DENIED");
    const validated = validateBookingSeries(input, isUpdate(input));
    if (!validated.ok) {
      const expansion = expandRecurrence(input && typeof input === "object" ? (input as {rule?:unknown}).rule : null);
      if (!expansion.ok && expansion.localDate) return { ...failure(validated.code), message: `Tillfället ${expansion.localDate} får ingen positiv tidslängd efter Stockholms tidsomställning. Ändra tiderna och försök igen.` };
      return failure(validated.code);
    }
    await validateBookingCandidateReferences(client, context.data.tenantId, validated.data.template);
    const args: SeriesRpcArgs = { p_tenant_id: context.data.tenantId, p_actor_id: context.data.userId, p_correlation_id: randomUUID(),
      p_command_id: validated.data.commandId, p_input: seriesCommandPayload(validated.data) };
    return { status: "success" as const, preview: await previewBookingSeries(client as unknown as BookingRpcClient, args, validated.data) };
  } catch (error) { return failure(errorCode(error), error instanceof CommandError ? error.userMessage : undefined); }
}
export async function saveBookingSeriesAction(input: unknown) {
  try {
    if (!bookingActionFitsTransport(input)) return failure("VALIDATION_FAILED");
    const client = await createSupabaseServerClient();
    const result = await runCommand(isUpdate(input) ? updateBookingSeries : createBookingSeries, { client: client as unknown as CommandDbClient, input });
    if (!result.ok) return failure(result.code);
    revalidatePath("/scheduling"); revalidatePath("/jobs"); revalidatePath("/jobs/[jobId]", "page"); revalidatePath("/customers/[customerId]", "page");
    return { status: "success" as const, ...result.data, message: "Bokningsserien har sparats." };
  } catch (error) { return failure(errorCode(error)); }
}
/** Only managers can read the template; own-assigned occurrence reads remain minimal. */
export async function readBookingSeriesAction(bookingId: string) {
  try {
    const client = await createSupabaseServerClient(); const context = await resolveTenantContext({ client });
    if (!context.ok) return failure(context.code);
    if (!resolveCapability({ roles: context.data.roles ?? [context.data.role], module: "resources", capability: "Bookings.Manage" }).granted) return failure("PERMISSION_DENIED");
    const occurrence = await client.from("bookings").select("series_id,nominal_date").eq("tenant_id", context.data.tenantId).eq("id", bookingId).maybeSingle();
    if (occurrence.error || !occurrence.data?.series_id) return failure("TENANT_ACCESS_DENIED");
    const series = await client.from("booking_series").select("id,rule,defaults,version").eq("tenant_id", context.data.tenantId).eq("id", occurrence.data.series_id).maybeSingle();
    if (series.error || !series.data) return failure("TENANT_ACCESS_DENIED");
    return { status: "success" as const, series: { id: String(series.data.id), rule: series.data.rule as RecurrenceRule,
      template: series.data.defaults as BookingFacts, version: Number(series.data.version), nominalDate: String(occurrence.data.nominal_date) } };
  } catch (error) { return failure(errorCode(error)); }
}
