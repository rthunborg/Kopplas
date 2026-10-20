import { createHash } from "node:crypto";
import { describe, test } from "vitest";
import { expectCalendar as expect } from "../../support/calendar-feed-atdd";
import { withCalendarFeedFixture, lifecycle, issuedUrl, tokenFromUrl, bookingSeed,
  type ManagementObservation, type FeedResponse } from "../../support/calendar-feed-atdd";

// Provider endpoint: TODO — authenticated calendar-feed commands/RPCs are new.
// Frozen provider contract: spec-15-5 AC1/2/4/6/9 and current-contracts-and-design.
// Seven-point scrutiny: sanitized lifecycle metadata + fresh URL once; outcomes
// and wire statuses/field names bind to real P5 source (not invented here).
// Required domain fields: action/revision/UUID attempt/current self; no escrow.
// Enums/types/nesting here are TEST observation types, not provider response JSON.
// SERIAL OWNER: later Vitest audit-DDL partition must include ONLY this file and
// calendar-feed/public-feed.int.test.ts in addition to the existing serial files.
// P4: every declaration skipped; no fixture, key, SQL, HTTP or resource executes.

describe("15.5 authenticated lifecycle, atomic audit and commit-order RED", () => {
  test.skip("[P0] 15.5-INT001 AC1 AC6 own issuance stores only SHA256 and publishes a fresh URL once", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0);
      const result = await fx.manage("own", intent), url = issuedUrl(result), raw = tokenFromUrl(url);
      expect(/^[A-Za-z0-9_-]{43}$/.test(raw)).toBe(true);
      expect(Buffer.from(raw, "base64url").length).toBe(32);
      const physical = await fx.physical(), active = physical.tokens.filter(row => row.revokedAt === null);
      expect(active).toHaveLength(1);
      expect(active[0]).toMatchObject({ tenantId: fx.subjects.own.tenantId,
        membershipId: fx.subjects.own.membershipId, hash: createHash("sha256").update(raw, "utf8").digest("hex"),
        attemptId: intent.attemptId, usageCount: 0, lastUsedAt: null });
      expect(physical.audits).toHaveLength(1);
      expect(physical.audits[0]).toMatchObject({ action: "calendar_feed.create",
        actorId: fx.subjects.own.userId, tenantId: fx.subjects.own.tenantId, attemptId: intent.attemptId });
      expect(JSON.stringify(physical.persistedRows).includes(raw)).toBe(false);
      expect(JSON.stringify(physical.persistedRows).includes(url)).toBe(false);
      const status = await fx.status("own");
      expect(status).toMatchObject({ active: true, usageCount: 0, lastUsedAt: null });
      expect(JSON.stringify(status.publicDto).includes(raw)).toBe(false);
      expect(JSON.stringify(status.publicDto).includes(active[0].hash)).toBe(false);
    });
  });

  test.skip("[P0] 15.5-INT002 AC1 AC2 rotate revokes old generation and revoke is audited once", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), oldUrl = issuedUrl(first);
      const rotated = await fx.manage("own", lifecycle("rotate", first.revision!)), newUrl = issuedUrl(rotated);
      expect(newUrl !== oldUrl).toBe(true);
      expect((await fx.trustedFetch(oldUrl, "192.0.2.10")).status).toBe(404);
      expect((await fx.trustedFetch(newUrl, "192.0.2.10")).status).toBe(200);
      const revoke = lifecycle("revoke", rotated.revision!);
      expect((await fx.manage("own", revoke)).outcome).toBe("committed");
      expect((await fx.manage("own", revoke)).issuedUrl).toBeNull();
      expect((await fx.trustedFetch(newUrl, "192.0.2.10")).status).toBe(404);
      const state = await fx.physical();
      expect(state.tokens.filter(row => row.revokedAt === null)).toHaveLength(0);
      expect(state.audits.map(row => row.action)).toEqual([
        "calendar_feed.create", "calendar_feed.rotate", "calendar_feed.revoke",
      ]);
    });
  });

  test.skip("[P0] 15.5-INT003 AC2 concurrent CAS rotations cannot overwrite or create two active generations", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0));
      const results = await Promise.all([fx.manage("own", lifecycle("rotate", first.revision!)),
        fx.manage("own", lifecycle("rotate", first.revision!))]);
      expect(results.map(result => result.outcome).sort()).toEqual(["committed", "conflict"]);
      const state = await fx.physical();
      expect(state.tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      expect(state.audits.filter(row => row.action === "calendar_feed.rotate")).toHaveLength(1);
      expect((await fx.manage("own", lifecycle("revoke", first.revision!))).outcome).toBe("conflict");
      expect((await fx.physical()).tokens).toEqual(state.tokens);
    });
  });

  test.skip("[P0] 15.5-INT004 AC2 exact attempt replay is sanitized and old attempt cannot accept a different new hash", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const create = lifecycle("create", 0), first = await fx.manage("own", create);
      const before = await fx.physical(), replay = await fx.manage("own", create);
      expect(replay).toMatchObject({ outcome: "replayed", issuedUrl: null, revision: first.revision });
      const changed = await fx.rawManage("own", create, {}, "changed-new-hash");
      expect(changed.denied).toBe(true);
      expect(changed.rows).toEqual([]);
      const after = await fx.physical();
      expect(after.tokens).toEqual(before.tokens);
      expect(after.audits).toEqual(before.audits);
      expect(JSON.stringify(replay)).not.toContain(tokenFromUrl(issuedUrl(first)));
    });
  });

  test.skip("[P0] 15.5-INT005 AC2 lost committed response reconciles metadata and needs a separate explicit rotation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0);
      await fx.serial.loseCommittedResponse("own", intent);
      const committed = await fx.physical();
      expect(committed.tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      expect(committed.audits).toHaveLength(1);
      const status = await fx.status("own", intent.attemptId);
      expect(status).toMatchObject({ active: true, attemptOutcome: "committed", usageCount: 0 });
      expect(status.publicDto).not.toHaveProperty("url");
      expect(status.publicDto).not.toHaveProperty("token");
      const retry = await fx.manage("own", intent);
      expect(retry).toMatchObject({ outcome: "replayed", issuedUrl: null });
      expect((await fx.physical()).tokens).toEqual(committed.tokens);
      const replacement = await fx.manage("own", lifecycle("rotate", status.revision));
      expect(issuedUrl(replacement)).toMatch(/\/calendar\/feed\/[A-Za-z0-9_-]{43}$/);
      const final = await fx.physical();
      expect(final.tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      expect(final.audits.map(row => row.action)).toEqual(["calendar_feed.create", "calendar_feed.rotate"]);
      expect(JSON.stringify(final.persistedRows)).not.toContain(tokenFromUrl(issuedUrl(replacement)));
    });
  });

  test.skip("[P0] 15.5-INT006 AC1 AC2 create audit fault proves intended stage then rolls back generation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0), before = await fx.physical();
      const receipt = await fx.serial.withFault({ tenantId: fx.subjects.own.tenantId,
        attemptId: intent.attemptId, correlationId: intent.correlationId, stage: "create-audit" },
      () => fx.manage("own", intent));
      expect(receipt.stageObserved).toBe(true);
      expect(receipt.sqlstate).toMatch(/^P[0-9A-Z]{4}$/);
      expect(receipt.result.outcome).toBe("unavailable");
      expect(receipt.result.issuedUrl).toBeNull();
      expect(receipt.ownedObjectsRemaining).toBe(0);
      expect(await fx.physical()).toEqual(before);
    });
  });

  test.skip("[P0] 15.5-INT007 AC2 failed rotation audit leaves old usable and installs no new generation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), oldUrl = issuedUrl(first);
      const intent = lifecycle("rotate", first.revision!), before = await fx.physical();
      const receipt = await fx.serial.withFault({ tenantId: fx.subjects.own.tenantId,
        attemptId: intent.attemptId, correlationId: intent.correlationId, stage: "rotate-audit" },
      () => fx.manage("own", intent));
      expect(receipt.stageObserved).toBe(true);
      expect(receipt.result).toMatchObject({ outcome: "unavailable", issuedUrl: null });
      expect(receipt.ownedObjectsRemaining).toBe(0);
      expect(await fx.physical()).toEqual(before);
      expect((await fx.trustedFetch(oldUrl, "192.0.2.11")).status).toBe(200);
    });
  });

  test.skip("[P0] 15.5-INT008 AC2 failed revoke audit leaves token usable with no false revocation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      const intent = lifecycle("revoke", first.revision!), before = await fx.physical();
      const receipt = await fx.serial.withFault({ tenantId: fx.subjects.own.tenantId,
        attemptId: intent.attemptId, correlationId: intent.correlationId, stage: "revoke-audit" },
      () => fx.manage("own", intent));
      expect(receipt.stageObserved).toBe(true);
      expect(receipt.result.outcome).toBe("unavailable");
      expect(receipt.ownedObjectsRemaining).toBe(0);
      expect(await fx.physical()).toEqual(before);
      expect((await fx.trustedFetch(url, "192.0.2.12")).status).toBe(200);
    });
  });

  test.skip("[P0] 15.5-INT009 AC2 AC4 AC9 current role loss committed before authority blocks queued management", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0), subject = fx.subjects.own;
      const barrier = await fx.serial.barrier({ ...subject, attemptId: intent.attemptId, stage: "management-before-authority" });
      const pending: Promise<ManagementObservation>[] = [];
      try {
        pending.push(fx.manage("own", intent));
        await barrier.waitUntilEntered(5_000);
        await fx.setAuthority("own", { primary: "saljare", additional: [] });
        await barrier.release();
        expect((await pending[0]).outcome).toBe("denied");
        expect((await fx.physical()).tokens).toHaveLength(0);
        expect((await fx.physical()).audits).toHaveLength(0);
      } finally {
        await barrier.release(); // release BEFORE settling all promises, even after an assertion failure
        await Promise.allSettled(pending);
        await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test.skip("[P0] 15.5-INT010 AC2 AC9 admitted fetch may finish before revoke while later fetch is denied", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      await fx.seedBookings([bookingSeed()]);
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      const intent = lifecycle("revoke", first.revision!);
      const barrier = await fx.serial.barrier({ ...fx.subjects.own, attemptId: intent.attemptId,
        stage: "fetch-authority-admitted" });
      const pending: Promise<FeedResponse | ManagementObservation>[] = [];
      try {
        const fetch = fx.trustedFetch(url, "192.0.2.13"); pending.push(fetch);
        await barrier.waitUntilEntered(5_000);
        const revoke = fx.manage("own", intent); pending.push(revoke);
        await barrier.release();
        expect((await fetch).status).toBe(200);
        expect((await revoke).outcome).toBe("committed");
        expect((await fx.trustedFetch(url, "192.0.2.13")).status).toBe(404);
      } finally {
        await barrier.release(); await Promise.allSettled(pending); await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test.skip("[P0] 15.5-INT011 AC2 AC9 revoke commits before a waiting fetch and prevents its disclosure", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      const intent = lifecycle("revoke", first.revision!);
      const barrier = await fx.serial.barrier({ ...fx.subjects.own, attemptId: intent.attemptId, stage: "revoke-before-commit" });
      const pending: Promise<FeedResponse | ManagementObservation>[] = [];
      try {
        const revoke = fx.manage("own", intent); pending.push(revoke);
        await barrier.waitUntilEntered(5_000);
        const fetch = fx.trustedFetch(url, "192.0.2.14"); pending.push(fetch);
        await barrier.release();
        expect((await revoke).outcome).toBe("committed");
        const response = await fetch;
        expect(response.status).toBe(404);
        expect(response.body).not.toContain("BEGIN:VCALENDAR");
      } finally {
        await barrier.release(); await Promise.allSettled(pending); await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test.skip("[P0] 15.5-INT012 AC1 AC2 AC9 committed rotation rejects waiting old fetch and preserves new token", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), oldUrl = issuedUrl(first);
      const intent = lifecycle("rotate", first.revision!);
      const barrier = await fx.serial.barrier({ ...fx.subjects.own, attemptId: intent.attemptId, stage: "rotate-before-commit" });
      const pending: Promise<FeedResponse | ManagementObservation>[] = [];
      try {
        const rotate = fx.manage("own", intent); pending.push(rotate);
        await barrier.waitUntilEntered(5_000);
        const oldFetch = fx.trustedFetch(oldUrl, "192.0.2.15"); pending.push(oldFetch);
        await barrier.release();
        const rotated = await rotate;
        expect((await oldFetch).status).toBe(404);
        expect((await fx.trustedFetch(issuedUrl(rotated), "192.0.2.15")).status).toBe(200);
        expect((await fx.physical()).tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      } finally {
        await barrier.release(); await Promise.allSettled(pending); await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test.skip("[P0] 15.5-INT013 AC2 simultaneous initial create and later revoke/rotate never resurrect stale intent", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const initial = await Promise.all([fx.manage("own", lifecycle("create", 0)), fx.manage("own", lifecycle("create", 0))]);
      expect(initial.map(row => row.outcome).sort()).toEqual(["committed", "conflict"]);
      const revision = (await fx.status("own")).revision;
      const revoke = lifecycle("revoke", revision), rotate = lifecycle("rotate", revision);
      const concurrent = await Promise.all([fx.manage("own", revoke), fx.manage("own", rotate)]);
      expect(concurrent.map(row => row.outcome).sort()).toEqual(["committed", "conflict"]);
      const after = await fx.physical();
      expect(after.tokens.filter(row => row.revokedAt === null).length).toBeLessThanOrEqual(1);
      expect(after.audits).toHaveLength(2);
      const rejected = concurrent[0].outcome === "conflict" ? revoke : rotate;
      expect((await fx.manage("own", rejected)).outcome).toBe("conflict");
      expect(await fx.physical()).toEqual(after);
    });
  });

  test.skip("[P1] 15.5-INT014 AC6 last-used is database admitted fetch time and lifecycle alone never increments usage", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      expect(await fx.status("own")).toMatchObject({ lastUsedAt: null, usageCount: 0 });
      await fx.serial.withDatabaseTime("2026-10-20T12:07:00Z", async () => {
        expect((await fx.trustedFetch(url, "192.0.2.16")).status).toBe(200);
        expect(await fx.status("own")).toMatchObject({ lastUsedAt: "2026-10-20T12:07:00.000Z", usageCount: 1 });
      });
      const status = await fx.status("own"), physical = await fx.physical();
      expect(physical.tokens.find(row => row.revokedAt === null)?.lastUsedAt).toBe(status.lastUsedAt);
      expect(JSON.stringify(status.publicDto)).not.toContain(tokenFromUrl(url));
      expect(JSON.stringify(status.publicDto)).not.toContain(physical.tokens[0].hash);
    });
  });
});
