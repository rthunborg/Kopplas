import { describe, expect, test } from "vitest";

/** 16.5 RED: production composition and real normal-JWT readers. No setup on import.
 * New adapter/export/DTO names are replaceable bindings; never replace a reader with
 * canned authorized data or test-side redaction. Existing fixtures are reused lazily.
 */
describe("16.5 current-job workspace composition", () => {
  test("[P0] 16.5-INT-01 real Order/Projekt identity and enriched header survive checked composition", async () => {
    const h = await import("../../../support/job-workspace-atdd");
    const depth = await import("../../../support/jobs-depth-atdd");
    await h.withWorkspaceFixture(async (f) => {
      expect((await depth.invokeJobCard(f.fx.adminClient, "update", await depth.loadCardInput(f))).ok).toBe(true);
      const order = await h.readWorkspace(f.fx.adminClient, f.jobs.editable.id);
      expect(order.error).toBeNull();
      expect(order.workspace?.header).toMatchObject({ id: f.jobs.editable.id, type: "order", title: "Workshop rewiring",
        customer: "Workshop customer", site: "Workshop", contact: "Workshop contact" });
      for (const job of [f.jobs.editable, f.jobs.assigneeProject]) {
        const result = await h.readWorkspace(f.fx.adminClient, job.id);
        expect(result.error).toBeNull();
        expect(result.workspace?.jobId).toBe(job.id);
        expect(result.workspace?.header.id).toBe(job.id);
        expect(result.workspace?.header.type).toBe(job === f.jobs.assigneeProject ? "projekt" : "order");
      }
    });
  });

  test("[P0] 16.5-INT-02 worker forbidden Filer URL falls back without file/picker/directory reads or protected serialization", async () => {
    const h = await import("../../../support/job-workspace-atdd");
    const { protectedPaths } = await import("../../../support/jobs-depth-atdd");
    await h.withWorkspaceFixture(async (f) => {
      const forbiddenCalls: string[] = [];
      const client = new Proxy(f.fx.montorClient, { get(target, key) {
        if (key === "from") return (table: string) => {
          if (["files", "file_links", "quote_acceptances", "quote_versions", "users", "auth.users"].includes(table)) {
            forbiddenCalls.push(table); throw new Error("forbidden consumer invoked");
          }
          return target.from(table);
        };
        if (key === "rpc") return (name: string, args: Record<string, unknown>) => {
          if (["read_job_card_options", "booking_editor_people"].includes(name) || /directory|auth_user/.test(name)) {
            forbiddenCalls.push(name); throw new Error("forbidden picker invoked");
          }
          return target.rpc(name, args);
        };
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      } });
      const result = await h.readWorkspace(client, f.jobs.acceptedAssigned.id, { tab: "files" });
      expect(result.error).toBeNull();
      expect(result.workspace?.jobId).toBe(f.jobs.acceptedAssigned.id);
      expect(result.workspace?.selectedTab).toBe("overview");
      expect(forbiddenCalls).toEqual([]);
      expect(protectedPaths(result.workspace)).toEqual([]);
      expect(result.workspace).not.toHaveProperty("cardOptions");
      const serialized = JSON.stringify(result.workspace);
      for (const key of ["acceptedPriceOre", "sourceSentTotalOre", "supplier", "actor_email", "raw_metadata"]) {
        expect(serialized.includes(`"${key}"`), key).toBe(false);
      }
    });
  });

  test("[P0] 16.5-INT-03 active resources Schema serves actual own-joined bookings without manager options", async () => {
    const h = await import("../../../support/job-workspace-atdd");
    const booking = await import("../../../support/bookings-atdd");
    const { adminQuery } = await import("../../../factories/admin-sql");
    await h.withWorkspaceFixture(async (f) => {
      const saved = await booking.bookingCommand("create", f.fx.adminClient, booking.bookingInput([f.fx.coworkerProfile.id],
        { jobId: f.jobs.both.id, startsAt: "2026-10-24T06:00:00.000Z", endsAt: "2026-10-24T07:00:00.000Z" }));
      expect(saved.ok).toBe(true);
      const expected = await f.fx.montorClient.from("bookings").select("id").eq("job_id", f.jobs.both.id);
      expect(expected.error).toBeNull();
      expect(expected.data?.length).toBeGreaterThan(0);
      const {readBookingHost, readBookingEditorOptions} = await import("@/features/resources/bookings-read");
      const directWorkerHost = await readBookingHost({jobId: f.jobs.both.id}, f.fx.montorClient);
      expect(directWorkerHost.canView).toBe(true);
      expect(directWorkerHost.canManage).toBe(false);
      expect((await readBookingEditorOptions(f.fx.montorClient)).people).toEqual([]);
      const worker = await h.readWorkspace(f.fx.montorClient, f.jobs.both.id, { tab: "schedule" });
      expect(worker.workspace?.schedule).toEqual(directWorkerHost);
      expect(worker.error).toBeNull();
      expect(worker.workspace?.selectedTab).toBe("schedule");
      expect(worker.workspace?.schedule?.error).toBeNull();
      expect(worker.workspace?.schedule?.canManage).toBe(false);
      expect(worker.workspace?.schedule).not.toHaveProperty("options");
      expect(worker.workspace?.schedule?.bookings.map((row) => row.id).sort()).toEqual(expected.data?.map((row) => row.id).sort());
      expect(worker.workspace?.schedule?.bookings.every((row) => row.jobId === f.jobs.both.id && row.startsAt < row.endsAt)).toBe(true);
      const manager = await h.readWorkspace(f.fx.adminClient, f.jobs.both.id, { tab: "schedule" });
      expect(manager.workspace?.schedule?.canManage).toBe(true);
      expect(manager.workspace?.schedule?.options).toBeDefined();
      const [{ count }] = await adminQuery<{ count: number }>("select count(*)::int count from public.bookings where tenant_id=$1 and job_id=$2", [f.fx.base.tenantA.id, f.jobs.both.id]);
      expect(manager.workspace?.schedule?.bookings).toHaveLength(count);
      expect(count).toBeGreaterThan(expected.data?.length ?? 0);
    });
  });

  test("[P1] 16.5-INT-04 root read failure stays retryable and invokes no subordinate consumer", async () => {
    const h = await import("../../../support/job-workspace-atdd");
    await h.withWorkspaceFixture(async (f) => {
      const unexpected: string[] = [];
      const client = new Proxy(f.fx.montorClient, { get(target, key) {
        if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
          if (name === "read_job_cards") return { data: null, error: { message: "synthetic-private-error" } };
          // Tenant resolution may precede root admission; it is not a panel read.
          if (/tenant_context|tenant_membership/.test(name)) return target.rpc(name, args);
          unexpected.push(name); throw new Error("consumer before root admission");
        };
        if (key === "from") return (table: string) => {
          if (["tenant_memberships", "membership_roles"].includes(table)) return target.from(table);
          unexpected.push(table); throw new Error("consumer before root admission");
        };
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      } });
      const result = await h.readWorkspace(client, f.jobs.memberOrder.id, { tab: "events" });
      expect(result.workspace).toBeNull();
      expect(result.error).toEqual(expect.any(String));
      expect(result.error).toBeTruthy();
      expect(JSON.stringify(result).includes("synthetic-private-error")).toBe(false);
      expect(unexpected).toEqual([]);
    });
  });
});
