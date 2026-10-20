import { randomUUID } from "node:crypto";
import { describe, test } from "vitest";
import { expectCalendar as expect } from "../../support/calendar-feed-atdd";
import { withCalendarFeedFixture, lifecycle, issuedUrl, bookingSeed, calendarEvents, calendarFixtureAssertionAt } from "../../support/calendar-feed-atdd";

// Provider endpoint: TODO — checked management/status/fetch/abuse RPCs await real
// P5 identifiers/signatures; normalized receipt purposes below are not SQL names.
// Source scrutinized: frozen 15.5 AC1–9, permission-matrix.ts Bookings.View union,
// time-reports.rls.test.ts ordinary-JWT/direct-SQL conventions and inherited ACL
// checks in approved-public-acl-repair.int.test.ts. No provider response invented.
// PARALLEL ROW-ISOLATED ONLY: no serial controls, key mutation, fault DDL,
// unknown-IP HTTP requests or resets. P5 consumes allocated key read-only; direct
// proof probes use fixture-owned IP hashes and row-owned subjects exclusively.

describe("15.5 exact self authority, raw SQL boundary and least privilege", () => {
  test("[P0] 15.5-RLS001 AC1 AC4 AC9 ordinary SQL current role union authorizes own management only", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      await fx.setAuthority("mixed", { primary: "saljare", additional: ["montor"] });
      const allowedSites = { own: "scenario-rls001-own", admin: "scenario-rls001-admin", planner: "scenario-rls001-planner", mixed: "scenario-rls001-mixed" } as const;
      const allowed: Array<keyof typeof allowedSites> = ["own", "admin", "planner", "mixed"];
      for (const subject of allowed) {
        const result = await fx.rawManage(subject, lifecycle("create", 0));
        calendarFixtureAssertionAt(allowedSites[subject], () => expect(result.denied, subject).toBe(false));
      }
      for (const subject of ["seller", "economy", "invited", "disabled", "platformOnly", "anon"] as const) {
        const before = await fx.physical();
        const result = await fx.rawManage(subject, lifecycle("create", 0));
        expect(result.denied, subject).toBe(true);
        expect(result.rows).toEqual([]);
        expect(await fx.physical()).toEqual(before);
      }
      const tokens = (await fx.physical()).tokens;
      expect(tokens.filter(row => row.revokedAt === null)).toHaveLength(allowed.length);
      expect(tokens.map(row => row.membershipId).sort()).toEqual(allowed.map(key => fx.subjects[key].membershipId).sort());
    });
  });

  test("[P0] 15.5-RLS002 AC1 AC4 AC9 admin manager peer foreign and platform cannot act on behalf of a subject", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const before = await fx.physical();
      for (const caller of ["admin", "planner", "peer", "foreign", "platformOnly"] as const) {
        for (const override of [fx.subjects.own, { membershipId: fx.subjects.own.membershipId },
          { userId: fx.subjects.own.userId }, { tenantId: fx.subjects.foreign.tenantId }]) {
          expect((await fx.rawManage(caller, lifecycle("create", 0), override)).denied).toBe(true);
        }
      }
      expect((await fx.rawManage("own", lifecycle("create", 0), { tenantId: randomUUID() })).denied).toBe(true);
      expect(await fx.physical()).toEqual(before);
    });
  });

  test("[P0] 15.5-RLS003 AC4 AC9 legacy NULL and non-ready provisioning state preserve active membership access", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      await fx.setProvisioningState("own", null);
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(200);
      // Provisioning workflow metadata is never a tenant availability switch.
      await fx.setProvisioningState("own", "pending_first_admin_invite");
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(200);
      await fx.setAuthority("own", { status: "disabled" });
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(404);
      expect((await fx.rawManage("own", lifecycle("rotate", first.revision!))).denied).toBe(true);
    });
  });

  test("[P0] 15.5-RLS004 AC4 AC9 current role removal and inactive invited missing exact membership fail despite an old JWT", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      await fx.setAuthority("own", { primary: "saljare", additional: [] });
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(404);
      await fx.setAuthority("own", { additional: ["montor"] });
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(200);
      for (const status of ["disabled", "invited"] as const) {
        await fx.setAuthority("own", { status });
        expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(404);
        expect((await fx.rawManage("own", lifecycle("rotate", first.revision!))).denied).toBe(true);
      }
      await fx.setAuthority("own", { membershipPresent: false });
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(404);
    });
  });

  test("[P0] 15.5-RLS005 AC1 AC4 AC9 membership replacement invalidates an active old capability", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      const originalMembership = fx.subjects.own.membershipId;
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(200);
      await fx.replaceMembership("own");
      expect(fx.subjects.own.membershipId).not.toBe(originalMembership);
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(404);
      expect((await fx.rawManage("own", lifecycle("rotate", first.revision!), { membershipId: originalMembership })).denied).toBe(true);
    });
  });

  test("[P0] 15.5-RLS006 AC3 AC9 manager feed contains only exact assigned planned bookings once", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const own = bookingSeed({ subject: "planner", additionalAssignees: ["peer", "own"] });
      const peer = bookingSeed({ subject: "peer" }), foreign = bookingSeed({ subject: "foreign" });
      const cancelled = bookingSeed({ subject: "planner", status: "cancelled" });
      await fx.seedBookings([own, peer, foreign, cancelled]);
      const url = issuedUrl(await fx.manage("planner", lifecycle("create", 0)));
      const response = await fx.trustedFetch(url, fx.isolatedTrustedIp), events = calendarEvents(response.body);
      expect(response.status).toBe(200);
      expect(events).toHaveLength(1);
      expect(events[0].uid).toContain(own.id);
      for (const excluded of [peer.id, foreign.id, cancelled.id, fx.subjects.peer.userId,
        fx.subjects.peer.profileId!, fx.subjects.planner.tenantId, own.description]) expect(response.body).not.toContain(excluded);
      await fx.setAssignments(own.id, ["peer"]);
      expect(calendarEvents((await fx.trustedFetch(url, fx.isolatedTrustedIp)).body)).toEqual([]);
    });
  });

  test("[P0] 15.5-RLS007 AC3 AC4 AC9 no profile and archived profile yield a valid empty calendar without team fallback", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      await fx.seedBookings([bookingSeed({ subject: "peer" }), bookingSeed({ subject: "own" })]);
      const emptyUrl = issuedUrl(await fx.manage("noProfile", lifecycle("create", 0)));
      const empty = await fx.trustedFetch(emptyUrl, fx.isolatedTrustedIp);
      expect(empty.status).toBe(200);
      expect(empty.body).toContain("BEGIN:VCALENDAR\r\n");
      expect(calendarEvents(empty.body)).toEqual([]);
      const ownUrl = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      await fx.setAuthority("own", { profileArchived: true });
      const archived = await fx.trustedFetch(ownUrl, fx.isolatedTrustedIp);
      expect(archived.status).toBe(200);
      expect(calendarEvents(archived.body)).toEqual([]);
    });
  });

  test("[P0] 15.5-RLS008 AC1 AC4 AC9 direct token DML and sensitive column reads are denied to all JWT roles", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      await fx.manage("own", lifecycle("create", 0));
      const before = await fx.physical();
      for (const caller of ["anon", "own", "peer", "admin", "planner", "mixed", "foreign"] as const) {
        for (const operation of ["insert", "update", "delete"] as const) {
          expect((await fx.directTable(caller, "calendar_feed_tokens", operation,
            { targetMembershipId: fx.subjects.own.membershipId })).denied).toBe(true);
        }
        expect((await fx.directTable(caller, "calendar_feed_tokens", "select", { sensitiveColumns: true })).denied).toBe(true);
      }
      expect(await fx.physical()).toEqual(before);
      for (const caller of ["own", "admin", "planner"] as const) {
        const status = await fx.status(caller);
        const serialized = JSON.stringify(status.publicDto);
        expect(Object.keys(status.publicDto).sort()).toEqual(["membershipId", "active", "revision", "lastUsedAt", "usageCount", "attemptOutcome", "attemptAction", "attemptRevision"].sort());
        expect(serialized).not.toContain(before.tokens[0].hash);
        expect(serialized).not.toContain(fx.subjects.peer.membershipId);
      }
    });
  });

  test("[P0] 15.5-RLS009 AC4 AC5 AC9 global IP table has RLS and no effective JWT SELECT DML or subject linkage", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const facts = await fx.acl();
      expect(facts.tables.map(table => table.name).sort()).toEqual(["calendar_feed_ip_windows", "calendar_feed_tokens"]);
      for (const table of facts.tables) expect(table).toMatchObject({ rlsEnabled: true, anonSelect: false,
        anonDml: false, authenticatedDml: false, publicInheritedDml: false, authenticatedSensitiveColumns: false });
      for (const caller of ["anon", "own", "admin", "foreign"] as const) {
        for (const operation of ["select", "insert", "update", "delete"] as const) {
          expect((await fx.directTable(caller, "calendar_feed_ip_windows", operation,
            { ownedCanonicalIp: fx.isolatedTrustedIp, ownedFixedWindowOnly: true })).denied).toBe(true);
        }
      }
      for (const forbidden of ["tenant_id", "user_id", "membership_id", "token_id", "raw_ip", "ip_address"])
        expect(facts.ipColumns).not.toContain(forbidden);
    });
  });

  test("[P0] 15.5-RLS010 AC4 AC9 dedicated owner and filtered Vault helper retain strict effective inherited ACLs", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const facts = await fx.acl();
      expect(facts.owner).toMatchObject({ login: false, inherit: false, superuser: false, bypassRls: false, publicSchemaCreate: false,
        assumableByJwtRoles: false, unrelatedTableRead: false, generalVaultRead: false,
        effectiveReadOutsideAllowedColumns: false, filteredHelperOnly: true });
      expect(facts.functions.map(fn => fn.purpose).sort()).toEqual(["abuse", "fetch", "manage", "status"]);
      for (const fn of facts.functions) {
        expect(fn.emptySearchPath).toBe(true);
        expect(fn.publicExecute).toBe(false);
        expect(fn.owner).toBe(facts.owner.name);
        expect(fn.anonExecute).toBe(fn.purpose === "fetch");
        expect(fn.authenticatedExecute).toBe(fn.purpose !== "fetch");
      }
      expect(facts.helpers.map(helper => helper.purpose).sort()).toEqual(["canonical", "filtered-secret", "verifier"]);
      for (const helper of facts.helpers) expect(helper).toMatchObject({ jwtExecute: false, publicExecute: false,
        otherRoleInheritedExecute: false });
      expect(facts.helpers.find(helper => helper.purpose === "filtered-secret"))
        .toMatchObject({ feedOwnerExecute: true, exactConfiguredKeyFilter: true });
    });
  });

  test("[P0] 15.5-RLS011 AC4 AC5 AC6 Admin monitoring is sanitized tenant-only and ordinary roles cannot read it", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const ownUrl = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      const foreignUrl = issuedUrl(await fx.manage("foreign", lifecycle("create", 0)));
      await fx.trustedFetch(ownUrl, fx.isolatedTrustedIp);
      await fx.trustedFetch(foreignUrl, fx.isolatedTrustedIp);
      for (const caller of ["own", "planner", "mixed", "seller", "economy", "platformOnly"] as const)
        expect((await fx.readAbuse(caller)).denied).toBe(true);
      const admin = await fx.readAbuse("admin");
      expect(admin.denied).toBe(false);
      expect(admin.rows.length).toBeGreaterThan(0);
      const override = await fx.readAbuse("admin", { tenantId: fx.subjects.foreign.tenantId });
      // A foreign filter may be rejected or safely ignored, never widen scope.
      expect(JSON.stringify(override.rows).includes(fx.subjects.foreign.tenantId)).toBe(false);
      expect(JSON.stringify(override.rows).includes(fx.subjects.foreign.membershipId)).toBe(false);
      const text = JSON.stringify(admin.rows), physical = await fx.physical();
      expect(text).not.toContain(fx.subjects.foreign.tenantId);
      expect(text).not.toContain(fx.subjects.foreign.membershipId);
      expect(text).not.toContain(fx.isolatedTrustedIp);
      for (const row of physical.tokens) expect(text).not.toContain(row.hash);
      for (const row of admin.rows) {
        expect(Object.keys(row).every(key => /count|spike|window|timestamp|at$/i.test(key))).toBe(true);
      }
    });
  });

  test("[P0] 15.5-RLS012 AC4 AC9 missing own tenant invalidates an issued capability through SQL authority and constraints", async () => {
    await withCalendarFeedFixture("row-isolated", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(200);
      // Delete ONLY this fixture's tenant. FK cascade is an enforced downstream
      // guard and may remove the token; never bypass constraints to fake an orphan.
      await fx.setAuthority("own", { tenantPresent: false });
      const absent = await fx.trustedFetch(url, fx.isolatedTrustedIp);
      expect(absent.status).toBe(404);
      expect(absent.body.includes("BEGIN:VCALENDAR")).toBe(false);
      expect((await fx.rawManage("own", lifecycle("rotate", first.revision!))).denied).toBe(true);
    });
  });
});
