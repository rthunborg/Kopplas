import { createHash } from "node:crypto";
import { describe, test } from "vitest";
import { writeFile } from "node:fs/promises";
import { createCalendarInt009Capture, runCalendarFeedCauseProof } from "../../support/calendar-feed-atdd";
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

// Explicit diagnostic inventory only: no declaration/skip/mutation in normal95.
if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE === "1") {
  test("15.5-DIAG001", async () => {
    const observation = await runCalendarFeedCauseProof();
    await writeFile("test-results/calendar-feed-cause-proof/observation.json", JSON.stringify(observation) + "\n", { mode: 0o600 });
    if (!observation.cleanupVerified || !observation.ordinarySettled || !observation.queriesSettled) throw new Error("Cause proof stopped with unverified custody; values redacted");
  }, 180_000);
}

if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE !== "1") describe("15.5 authenticated lifecycle, atomic audit and commit-order", () => {
  test("[P0] 15.5-INT001 AC1 AC6 own issuance stores only SHA256 and publishes a fresh URL once", async () => {
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

  test("[P0] 15.5-INT002 AC1 AC2 rotate revokes old generation and revoke is audited once", async () => {
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

  test("[P0] 15.5-INT003 AC2 concurrent CAS rotations cannot overwrite or create two active generations", async () => {
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

  test("[P0] 15.5-INT004 AC2 exact attempt replay is sanitized and old attempt cannot accept a different new hash", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const create = lifecycle("create", 0), first = await fx.manage("own", create);
      const before = await fx.physical(), replay = await fx.manage("own", create);
      expect(replay).toMatchObject({ outcome: "replayed", issuedUrl: null, revision: first.revision });
      const changed = await fx.rawManage("own", create, {}, "changed-new-hash");
      expect(changed.denied).toBe(true);
      expect(changed.rows).toEqual([]);
      expect((await fx.manage("own", { ...create, action: "rotate" })).outcome).toBe("conflict");
      expect((await fx.manage("own", { ...create, expectedRevision: 99 })).outcome).toBe("conflict");
      const after = await fx.physical();
      expect(after.tokens).toEqual(before.tokens);
      expect(after.audits).toEqual(before.audits);
      expect(JSON.stringify(replay)).not.toContain(tokenFromUrl(issuedUrl(first)));
    });
  });

  test("[P0] 15.5-INT005 AC2 lost committed response reconciles metadata and needs a separate explicit rotation", async () => {
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

  test("[P0] 15.5-INT006 AC1 AC2 create audit fault proves intended stage then rolls back generation", async () => {
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

  test("[P0] 15.5-INT007 AC2 failed rotation audit leaves old usable and installs no new generation", async () => {
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

  test("[P0] 15.5-INT008 AC2 failed revoke audit leaves token usable with no false revocation", async () => {
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

  test("[P0] 15.5-INT009 AC2 AC4 AC9 current role loss committed before authority blocks queued management", async ({task}) => {
    const capture=createCalendarInt009Capture(()=>task.meta);
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
    },capture);
  });

  test("[P0] 15.5-INT010 AC2 AC9 admitted fetch may finish before revoke while later fetch is denied", async () => {
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

  test("[P0] 15.5-INT011 AC2 AC9 revoke commits before a waiting fetch and prevents its disclosure", async () => {
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

  test("[P0] 15.5-INT012 AC1 AC2 AC9 committed rotation rejects waiting old fetch and preserves new token", async () => {
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

  test("[P0] 15.5-INT013 AC2 simultaneous initial create and later revoke/rotate never resurrect stale intent", async () => {
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

  test("[P1] 15.5-INT014 AC6 last-used is database admitted fetch time and lifecycle alone never increments usage", async () => {
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


  test("[P0] 15.5-INT015 AC4 AC9 native PG17 restricted creator executes the exact owner bootstrap and SET ownership", async context => {
    // This case has its own disposable direct connections: an unverified session
    // is closed, never returned to an application/test pool. No resource startup.
    const { randomUUID } = await import("node:crypto");
    const { readFile, readdir, realpath, stat } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const { assertLocalStack, LOCAL_SUPABASE_DB_URL } = await import("../../support/test-env");
    const { validateAdmission, validateStackIdentity, FEED_FUNCTIONS, createCalendarFeedDatabaseClient,
      readCalendarFeedSetupAuthority, readCalendarFeedPrivacyPreflight } = await import("../../../scripts/ci/with-calendar-feed-runtime.mjs");
    const suffix = randomUUID().replaceAll("-", "");
    const migrator = `cf_m_${suffix}`, owner = `cf_o_${suffix}`, schema = `cf_s_${suffix}`, fn = `cf_f_${suffix}`;
    const root = fileURLToPath(new URL("../../../", import.meta.url));
    const failures: Error[] = [];
    let stage = "qualification", connected = false, original: string | undefined, transportFailed = false, cleaning = false;
    const primaryDeadline = Date.now() + 80_000;
    let nativeVersion: { serverVersion: string; serverVersionNum: number } | undefined;
    let stack: Parameters<typeof createCalendarFeedDatabaseClient>[0] | undefined;
    let client: ReturnType<typeof createCalendarFeedDatabaseClient> | undefined;
    function directClient(readOnly = false) {
      try {
        if (!stack) throw new Error("Qualified setup unavailable");
        return createCalendarFeedDatabaseClient(stack, readOnly ? "absence" : "proof");
      }
      catch { throw new Error("PG17 proof connection configuration refused; details redacted"); }
    }
    async function setupQualified(connection: ReturnType<typeof createCalendarFeedDatabaseClient>) {
      await readCalendarFeedSetupAuthority(connection);
      const privacy = await readCalendarFeedPrivacyPreflight(connection);
      if (!privacy.controls.every(control => control.matchesRequired)) throw new Error("PG17 setup privacy refused");
    }
    const pending = new Set<Promise<unknown>>();
    async function sql<Row extends import("pg").QueryResultRow = import("pg").QueryResultRow>(text: string, values: unknown[] = []) {
      if (!cleaning && Date.now() > primaryDeadline) throw new Error("PG17 proof primary deadline exceeded");
      if (!client) throw new Error("PG17 proof client unavailable");
      const request = client.query<Row>(text, values); pending.add(request);
      try { return await request; } finally { pending.delete(request); }
    }
    // Every credited source/SET/ownership operation follows this immediate check.
    async function restricted() {
      const { rows: [identity] } = await sql<{ session: string; current: string; rolcanlogin: boolean; rolinherit: boolean; rolsuper: boolean;
        rolcreatedb: boolean; rolcreaterole: boolean; rolreplication: boolean; rolbypassrls: boolean; self_grant: string }>(
        "select session_user::text session,current_user::text current,r.rolcanlogin,r.rolinherit,r.rolsuper,r.rolcreatedb,r.rolcreaterole,r.rolreplication,r.rolbypassrls,current_setting('createrole_self_grant') self_grant from pg_roles r where r.rolname=current_user");
      expect(identity).toMatchObject({ session: migrator, current: migrator, rolcanlogin: false, rolinherit: false,
        rolsuper: false, rolcreatedb: false, rolcreaterole: true, rolreplication: false, rolbypassrls: false, self_grant: "" });
    }
    async function originalIdentity() {
      const { rows: [identity] } = await sql<{ session: string; current: string; super: boolean }>(
        "select session_user::text session,current_user::text current,r.rolsuper super from pg_roles r where r.rolname=current_user");
      if (!original || identity.session !== original || identity.current !== original || !identity.super) throw new Error("Original isolated identity not restored");
      if (!client) throw new Error("PG17 proof original client unavailable");
      await setupQualified(client);
    }
    function redacted(error: unknown, label: string): Error {
      return error instanceof AggregateError ? new AggregateError(error.errors.map(item => redacted(item, label)), label) : new Error(label);
    }
    async function expectedFailure(name: string, operation: () => Promise<unknown>, code: string, message?: string) {
      await sql(`savepoint ${name}`);
      let observed: { code?: string; message?: string } | undefined;
      try { await operation(); } catch (error) { observed = error as typeof observed; }
      const cleanup: Error[] = []; let restored = false;
      try { await sql(`rollback to savepoint ${name}`); restored = true; }
      catch { cleanup.push(new Error("Expected-error savepoint rollback failed")); }
      if (restored) try { await sql(`release savepoint ${name}`); }
      catch { cleanup.push(new Error("Expected-error savepoint release failed")); }
      if (cleanup.length) throw new AggregateError([...(observed ? [new Error("Guard operation outcome retained; details redacted")] : []), ...cleanup], "Expected-error primary and cleanup failures");
      // Always restore the savepoint before making assertions after an error.
      expect(observed?.code).toBe(code);
      if (message !== undefined) expect(observed?.message).toBe(message);
    }
    async function absent(connection: ReturnType<typeof createCalendarFeedDatabaseClient>) {
      // Both same and fresh connections observe committed catalogs read-only.
      const errors: Error[] = []; let opened = false;
      try {
        await connection.query("begin read only"); opened = true;
        const { rows: [counts] } = await connection.query<{ roles: number; schemas: number; functions: number }>(
          "select (select count(*)::integer from pg_roles where rolname=any($1::text[])) roles,(select count(*)::integer from pg_namespace where nspname=$2) schemas,(select count(*)::integer from pg_proc where proname=$3) functions", [[migrator, owner], schema, fn]);
        expect(counts).toEqual({ roles: 0, schemas: 0, functions: 0 });
      } catch { errors.push(new Error("Owned catalog absence not proven")); }
      if (opened) try { await connection.query("rollback"); }
      catch { errors.push(new Error("Read-only catalog transaction rollback failed")); }
      if (errors.length) throw new AggregateError(errors, "Catalog proof and cleanup outcomes retained");
    }
    try {
      assertLocalStack();
      validateAdmission("db", process.env, process.platform);
      expect(process.env.SUPABASE_TEST_REQUIRED).toBe("1");
      const endpoint = new URL(LOCAL_SUPABASE_DB_URL);
      expect(["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname)).toBe(true);
      expect(await realpath(root)).toBe(await realpath(process.env.GITHUB_WORKSPACE ?? ""));
      const git = await stat(join(root, ".git")); expect(git.isDirectory()).toBe(true);
      // Fixed read-only commands reuse the existing wrapper's actual admission.
      // Captured Docker/status JSON and errors remain in memory, never in evidence.
      const capture = promisify(execFile);
      const containers = JSON.parse((await capture("docker", ["inspect", "supabase_db_kopplas", "supabase_kong_kopplas"],
        { cwd: root, shell: false, timeout: 15_000, maxBuffer: 2_000_000 })).stdout);
      const status = JSON.parse((await capture("supabase", ["status", "--output", "json"],
        { cwd: root, shell: false, timeout: 15_000, maxBuffer: 2_000_000 })).stdout);
      stack = { db: containers[0], gateway: containers[1], checkoutTime: git.birthtimeMs, now: Date.now(), status };
      validateStackIdentity(stack);
      expect(status.DB_URL === LOCAL_SUPABASE_DB_URL).toBe(true);
      const migrations = (await readdir(join(root, "supabase/migrations"))).filter(name => /^\d{14}_.+\.sql$/.test(name)).sort()
        .map(name => ({ version: name.slice(0, 14), name: name.slice(15, -4) }));
      const source = await readFile(join(root, "supabase/migrations/20261020220000_personal_calendar_feed.sql"), "utf8");
      const leading = /^-- Story[^\n]*\r?\n(do \$\$[\s\S]*?\r?\n\$\$;)/.exec(source)?.[1];
      if (!leading || source.split(leading).length !== 2 || !source.slice(source.indexOf(leading) + leading.length).trimStart().startsWith("grant usage,create on schema public")) throw new Error("Unique leading source bootstrap unavailable");
      const bootstrap = leading.replace(/\bcalendar_feed_owner\b/g, owner).replace(/\bpostgres\b/g, migrator);
      if (bootstrap.replaceAll(owner, "calendar_feed_owner").replaceAll(migrator, "postgres") !== leading) throw new Error("Non-reversible source bootstrap substitution");
      client = directClient(); client.on("error", () => { transportFailed = true; });
      stage = "setup-connect";
      await client.connect(); connected = true;
      stage = "setup-authority-privacy";
      await setupQualified(client);
      const { rows: [identity] } = await sql<{ session: string; current: string; super: boolean; session_super: boolean; server_version: string; server_version_num: string }>(
        "select session_user::text session,current_user::text current,r.rolsuper super,s.rolsuper session_super,current_setting('server_version') server_version,current_setting('server_version_num') server_version_num from pg_roles r join pg_roles s on s.rolname=session_user where r.rolname=current_user");
      original = identity.session;
      if (identity.current !== original || !identity.super || !identity.session_super || Math.floor(Number(identity.server_version_num) / 10000) !== 17) throw new Error("Isolated native PG17 superuser qualification failed");
      nativeVersion = { serverVersion: identity.server_version, serverVersionNum: Number(identity.server_version_num) };
      const { rows: ledger } = await sql("select version,name from supabase_migrations.schema_migrations order by version");
      expect(JSON.stringify(ledger.map(row => ({ version: String(row.version), name: row.name }))) === JSON.stringify(migrations)).toBe(true);
      const { rows: functions } = await sql("select p.oid::regprocedure::text identity,pg_get_userbyid(p.proowner) owner,p.prosecdef definer from pg_proc p where p.oid=any(array[" + FEED_FUNCTIONS.map((_: string, i: number) => `to_regprocedure($${i + 1})`).join(",") + "])", [...FEED_FUNCTIONS]);
      expect(functions.length).toBe(FEED_FUNCTIONS.length);
      expect(functions.every(row => row.owner === "calendar_feed_owner" && row.definer === true)).toBe(true);
      await absent(client);
      await context.annotate(JSON.stringify({ ...nativeVersion, isolatedStackQualified: true }), "calendar-feed-pg17-observed");
      stage = "transaction-setup";
      await sql("begin");
      await sql(`create role ${migrator} nologin noinherit nosuperuser nocreatedb createrole noreplication nobypassrls`);
      await sql(`create schema ${schema} authorization ${migrator}`);
      await sql(`set local session authorization ${migrator}`);
      await restricted();
      stage = "native-engine-baseline";
      await sql("savepoint native_baseline");
      await restricted();
      await sql(`create role ${owner} nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls`);
      const { rows: baseline } = await sql<{ admin_option: boolean; set_option: boolean; inherit_option: boolean }>(
        "select m.admin_option,m.set_option,m.inherit_option from pg_auth_members m join pg_roles r on r.oid=m.roleid join pg_roles u on u.oid=m.member where r.rolname=$1 and u.rolname=$2", [owner, migrator]);
      expect(baseline).toEqual([{ admin_option: true, set_option: false, inherit_option: false }]);
      await expectedFailure("native_set_denied", async () => {
        await restricted(); await sql(`set local role ${owner}`);
      }, "42501");
      await sql("rollback to savepoint native_baseline");
      await sql("release savepoint native_baseline");
      expect((await sql("select 1 from pg_roles where rolname=$1", [owner])).rows).toHaveLength(0);
      stage = "restricted-fresh-source";
      await restricted(); await sql(bootstrap); // exact source statements, genuinely absent target
      const assertOwner = async () => {
        const { rows: [role] } = await sql("select rolcanlogin,rolinherit,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls from pg_roles where rolname=$1", [owner]);
        expect(role).toEqual({ rolcanlogin: false, rolinherit: false, rolsuper: false, rolcreatedb: false,
          rolcreaterole: false, rolreplication: false, rolbypassrls: false });
        const { rows: [authority] } = await sql("select pg_has_role(current_user,$1,'SET') can_set,pg_has_role(current_user,$1,'USAGE') can_use,exists(select 1 from pg_auth_members m join pg_roles r on r.oid=m.roleid where r.rolname=$1 and m.admin_option) creator_admin", [owner]);
        expect(authority).toEqual({ can_set: true, can_use: false, creator_admin: true });
        const { rows: memberships } = await sql<{ inherit_option: boolean }>(
          "select m.inherit_option from pg_auth_members m join pg_roles r on r.oid=m.roleid join pg_roles u on u.oid=m.member where r.rolname=$1 and u.rolname=$2", [owner, migrator]);
        expect(memberships.length).toBeGreaterThan(0);
        expect(memberships.every(row => row.inherit_option === false)).toBe(true);
      };
      await assertOwner();
      stage = "restricted-source-replay";
      await restricted(); await sql(bootstrap); await assertOwner();
      expect((await sql("select 1 from pg_roles where rolname=any($1::text[])", [[migrator, owner]])).rows).toHaveLength(2);
      stage = "restricted-object-ownership";
      // UUID-schema CREATE is a transaction-only fixture prerequisite. It does
      // not qualify real public-schema source/recovery ownership privileges.
      await restricted(); await sql(`grant usage,create on schema ${schema} to ${owner}`);
      await restricted(); await sql(`create function ${schema}.${fn}() returns integer language sql security invoker set search_path='' as $$ select 1 $$`);
      await restricted(); await sql(`revoke all on function ${schema}.${fn}() from public`);
      await restricted(); await sql(`grant execute on function ${schema}.${fn}() to ${owner}`);
      await restricted(); await sql(`set local role ${owner}`);
      const { rows: [switched] } = await sql("select session_user::text session,current_user::text current,r.rolsuper,r.rolcanlogin,r.rolinherit,r.rolcreatedb,r.rolcreaterole,r.rolreplication,r.rolbypassrls from pg_roles r where r.rolname=current_user");
      expect(switched).toEqual({ session: migrator, current: owner, rolsuper: false, rolcanlogin: false, rolinherit: false,
        rolcreatedb: false, rolcreaterole: false, rolreplication: false, rolbypassrls: false });
      expect((await sql(`select ${schema}.${fn}() value`)).rows[0].value).toBe(1);
      await sql("reset role");
      await restricted(); await sql(`alter function ${schema}.${fn}() owner to ${owner}`);
      expect((await sql("select pg_get_userbyid(p.proowner) owner,p.prosecdef definer from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname=$1 and p.proname=$2", [schema, fn])).rows).toEqual([{ owner, definer: false }]);
      stage = "unsafe-retained-attributes";
      await expectedFailure("unsafe_attributes", async () => {
        await restricted(); await sql(`alter role ${owner} inherit`); // only owned role, still NOLOGIN
        await restricted(); await sql(bootstrap);
      }, "P0001", `${owner} is not hardened`);
      await assertOwner();
      stage = "unsafe-retained-membership";
      await expectedFailure("unsafe_membership", async () => {
        await sql("reset session authorization"); await sql("reset role"); await originalIdentity();
        // Setup affects only the two owned roles. Remove forward grants and
        // their dependent self-grants before adding the inverse: no engine-cycle
        // refusal can stand in for the exact source guard's exception.
        await sql(`revoke ${owner} from ${migrator} cascade`);
        await sql(`grant ${migrator} to ${owner} with admin false`);
        await sql(`set local session authorization ${migrator}`);
        await restricted(); await sql(bootstrap);
      }, "P0001", `${owner} has unexpected membership`);
      await restricted(); await assertOwner();
    } catch (error) { failures.push(redacted(error, `PG17 owner proof failed at ${stage}; details redacted`)); }
    cleaning = true;
    // FULL rollback comes first even after an unexpected aborted transaction.
    // Reset inside an aborted transaction would fail and cannot qualify cleanup.
    for (const result of await Promise.allSettled([...pending])) if (result.status === "rejected") failures.push(new Error("Pending PG17 proof query failed"));
    if (connected && client) {
      let rolledBack = false;
      try { await sql("rollback"); rolledBack = true; } catch { failures.push(new Error("PG17 proof full rollback failed")); }
      if (rolledBack) {
        try { await sql("reset session authorization"); } catch { failures.push(new Error("PG17 proof session identity reset failed")); }
        try { await sql("reset role"); } catch { failures.push(new Error("PG17 proof role reset failed")); }
        try { await originalIdentity(); } catch { failures.push(new Error("PG17 proof original identity unverified")); }
        try { await absent(client); } catch (error) { failures.push(redacted(error, "PG17 proof same-connection absence unverified")); }
      }
    }
    if (client) try { await client.end(); } catch { failures.push(new Error("PG17 proof direct connection close failed")); }
    if (transportFailed) failures.push(new Error("PG17 proof direct connection transport failed"));
    // Fresh connection independently observes committed catalogs; no unverified
    // connection is ever pooled or left with a modified session authorization.
    if (connected) {
      let fresh: ReturnType<typeof createCalendarFeedDatabaseClient> | undefined;
      let freshTransportFailed = false;
      try {
        fresh = directClient(true); fresh.on("error", () => { freshTransportFailed = true; });
        await fresh.connect(); await setupQualified(fresh); await absent(fresh);
      } catch (error) { failures.push(redacted(error, "PG17 proof fresh read-only absence unverified")); }
      if (fresh) try { await fresh.end(); } catch { failures.push(new Error("PG17 proof fresh connection close failed")); }
      if (freshTransportFailed) failures.push(new Error("PG17 proof fresh connection transport failed"));
    }
    if (failures.length) throw new AggregateError(failures, "PG17 owner proof/cleanup failed; sensitive details redacted");
    await context.annotate(JSON.stringify({ ...nativeVersion, restrictedFreshReplay: true, engineAdmin: true, engineSet: false,
      restrictedSetAndOwnership: true, unsafeAttributeAndMembershipGuards: true, sameAndFreshAbsent: true }), "calendar-feed-pg17-qualified");
  }, 180_000);
});
