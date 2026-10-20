import { describe, expect, test } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { runCommand, type Command } from "@/server/commands/envelope";
import { adminQuery } from "../../factories/admin-sql";
import { bookingSnapshot, withBookingFixture } from "../../support/bookings-atdd";
import { loadBookingEditorBindings } from "../../support/booking-editor-atdd";
import { LOCAL_SUPABASE_ANON_KEY, LOCAL_SUPABASE_URL } from "../../support/test-env";

/* Provider source: real envelope, tenant factories, manager/own booking RLS and
 * notification_preferences persistence. New resolver/history RPC signatures and
 * ledger safe columns are not implemented. Resume after binding actual signatures,
 * SQL migration and isolated REQUIRED DB lane; every test is unexecuted RED.
 * Vitest/backend suite; utils installation/runner and Pact relevance gates closed.
 */
describe("Story15.3 resolver authority and persistence (ATDD)", () => {
  test.skip("[P0] 15.3-RLS-001 manager minimal projection, own/foreign/anon denials and immutable private ledger (AC2/6/8)", async () => {
    await withBookingFixture(async fx => {
      const editor = await loadBookingEditorBindings(), plan = await editor.seedMixed(fx, "update");
      const preview = await editor.preview(fx.plannerClient, "update", plan.input);
      if (!preview.ok) throw new Error(preview.code);
      expect(await editor.save(fx.plannerClient, "update", { ...plan.input, decision: {
        receipt: preview.data.receipt, acknowledged: true, reviewedLogicalIds: preview.data.warnings.map(w => w.naturalKey),
        selectedLogicalIds: [], reason: "Seed current complete warnings" } }, crypto.randomUUID())).toMatchObject({ ok: true });
      const commandPath = "@/server/commands/bookings/resolve-booking-conflict";
      const previewPath = "@/server/bookings/conflict-resolution";
      const command = await import(commandPath), production = await import(previewPath);
      expect(command.resolveBookingConflict).toBeDefined();
      expect(production.previewBookingConflictResolution).toBeTypeOf("function");
      // TEST-OWNED candidate normalization only; reconcile these signatures/DTOs.
      const draft = { commandId: crypto.randomUUID(), bookingId: plan.input.bookingId,
        action: "accept", targetLogicalIds: [plan.selected.naturalKey] };
      const p = await production.previewBookingConflictResolution(fx.plannerClient, draft);
      expect(await runCommand(command.resolveBookingConflict as Command<unknown, unknown>, {
        client: fx.plannerClient as never, input: { ...draft, review: { receipt: p.receipt,
          reviewedLogicalIds: p.groups.map((g: {logicalId:string}) => g.logicalId),
          selectedLogicalIds: [plan.selected.naturalKey], reason: "Retained conflict" } } })).toMatchObject({ ok: true });
      const [security] = await adminQuery<{ relrowsecurity:boolean; relforcerowsecurity:boolean }>(
        "select relrowsecurity,relforcerowsecurity from pg_class where oid='public.booking_conflict_resolutions'::regclass");
      expect(security).toEqual({ relrowsecurity: true, relforcerowsecurity: true });
      const manager = await fx.plannerClient.from("booking_conflict_resolutions").select("id,tenant_id").eq("tenant_id", fx.base.tenantA.id);
      expect(manager.error).toBeNull(); expect(manager.data).toHaveLength(1);
      const id = manager.data![0]!.id;
      const anon = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      const before = await bookingSnapshot(fx.tenantIds);
      const durable = await adminQuery("select * from public.booking_conflict_resolutions where tenant_id=any($1::uuid[]) order by id", [fx.tenantIds]);
      for (const client of [fx.montorClient, fx.foreignClient, anon]) {
        const denied = await client.from("booking_conflict_resolutions").select("id,tenant_id").eq("tenant_id", fx.base.tenantA.id);
        expect(denied.data ?? []).toEqual([]); // SQL may deny grant or filter; neither may expose tenant A.
      }
      for (const client of [fx.plannerClient, fx.montorClient, fx.foreignClient, anon]) {
        expect((await client.from("booking_conflict_resolutions").select("*").eq("id", id)).error).not.toBeNull();
        expect((await client.from("booking_conflict_resolutions").insert({ id: crypto.randomUUID(), tenant_id: fx.base.tenantA.id })).error).not.toBeNull();
        const update = await client.from("booking_conflict_resolutions").update({ id: crypto.randomUUID() }).eq("id", id).select("id");
        const remove = await client.from("booking_conflict_resolutions").delete().eq("id", id).select("id");
        expect(update.data ?? []).toEqual([]); expect(remove.data ?? []).toEqual([]);
      }
      expect(await adminQuery("select * from public.booking_conflict_resolutions where tenant_id=any($1::uuid[]) order by id", [fx.tenantIds])).toEqual(durable);
      expect(await bookingSnapshot(fx.tenantIds)).toEqual(before);
      // Required activation expansion: checked history/preview/suggestion/finalizer RPC
      // inventory + inactive/multirole/revoked-after-wait cases using actual signatures.
    });
  });

  test.skip("[P0] 15.3-RLS-002 booking.changed preference SQL rejects email while preserving self-only preferences (AC6/8)", async () => {
    await withBookingFixture(async fx => {
      const preference = { tenant_id: fx.base.tenantA.id, user_id: fx.users.montor.id,
        category: "booking.changed", channel: "in_app", enabled: false };
      expect((await fx.montorClient.from("notification_preferences").upsert(preference)).error).toBeNull();
      const before = await adminQuery("select * from public.notification_preferences where tenant_id=$1 order by id", [fx.base.tenantA.id]);
      const email = await fx.montorClient.from("notification_preferences").upsert({ ...preference, channel: "email" });
      expect(email.error?.code).toBe("23514");
      // The identical in_app control above succeeded; only channel changes here.
      // Name the actual CHECK that binds BOTH category and channel, so a generic
      // invalid category/shape/other23514 rejection cannot count as pair enforcement.
      const pairChecks = await adminQuery<{ conname: string; definition: string }>(`select conname,pg_get_constraintdef(oid) definition
        from pg_constraint where conrelid='public.notification_preferences'::regclass and contype='c'
        and pg_get_constraintdef(oid) like '%booking.changed%'
        and pg_get_constraintdef(oid) like '%category%'
        and pg_get_constraintdef(oid) like '%channel%'`);
      expect(pairChecks.length, "Bind actual SQL category/channel CHECK; a category allow-list alone is insufficient").toBeGreaterThan(0);
      expect(pairChecks.some(c => email.error?.message.includes(c.conname))).toBe(true);
      expect((await fx.foreignClient.from("notification_preferences").upsert(preference)).error).not.toBeNull();
      expect(await adminQuery("select * from public.notification_preferences where tenant_id=$1 order by id", [fx.base.tenantA.id])).toEqual(before);
      // REQUIRED DEVELOPMENT ACTIVATION GAP (AC6/8): actual email_outbox SQL
      // category rejection is not asserted yet. Current migrations constrain category,
      // subject_type/template_key by length, add nullable quote-snapshot consistency
      // and delivery_sequence/state checks; no booking.changed category guard exists.
      // After implementation, use an independently valid control row and change ONLY
      // category; assert the exact new category/channel constraint identity, plus no
      // outbox row delta. Generic23514 cannot substitute for that named rejection.
      // Required development expansion: API route rejection and quote email regression.
    });
  });
});
