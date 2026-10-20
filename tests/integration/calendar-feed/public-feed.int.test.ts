import { randomUUID } from "node:crypto";
import { describe, test } from "vitest";
import { expectCalendar as expect } from "../../support/calendar-feed-atdd";
import { withCalendarFeedFixture, lifecycle, issuedUrl, tokenFromUrl, bookingSeed, calendarEvents,
  inactiveContract, type FeedResponse } from "../../support/calendar-feed-atdd";

// Provider endpoint: TODO — GET /calendar/feed/[token] and checked fetch RPC are new.
// Seven-point provider scrutiny from frozen AC3–9: successful UTF-8 text/calendar
// body, generic invalid404, limited429 + Retry-After, unavailable503; no cookie,
// redirect, cache reuse or tenant/subject override. RFC5545 properties have string
// values and exact date/time encodings. Generic failure wording and final SQL/
// internal DTO field names are deliberately not invented; compare equal histories.
// SERIAL OWNER with commands/calendar-feed.int.test.ts only. P5 must add both
// files to serial audit-DDL include AND parallel exclude, preserving existing files.
// Trusted-axis cases call REAL orchestration+SQL through private dependency seams;
// http() cases call real production HTTP without retries. These are distinct lanes.

describe("15.5 public capability HTTP, projection and independent abuse budgets", () => {
  test("[P0] 15.5-API001 AC3 AC4 AC9 own minimal projection rejects tenant subject and date overrides", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const own = bookingSeed({ additionalAssignees: ["peer"] }), peer = bookingSeed({ subject: "peer" });
      const foreign = bookingSeed({ subject: "foreign" });
      await fx.seedBookings([own, peer, foreign]);
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      const response = await fx.http(url, { query: { tenantId: fx.subjects.foreign.tenantId,
        membershipId: fx.subjects.peer.membershipId, userId: fx.subjects.peer.userId, from: "1900-01-01", to: "1900-01-02" } });
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/^text\/calendar\b.*charset=utf-8/i);
      const events = calendarEvents(response.body);
      expect(events).toHaveLength(1);
      expect(events[0].uid).toContain(own.id);
      expect(events[0].start).toBe("20261021T060000Z");
      expect(events[0].end).toBe("20261021T140000Z");
      expect(events[0].summary).toContain("Installation");
      expect(events[0].location).toBe("Testgatan 15\\, Uppsala");
      for (const denied of [peer.id, foreign.id, own.description, fx.subjects.own.tenantId,
        fx.subjects.peer.userId, fx.subjects.peer.profileId!, fx.subjects.own.membershipId])
        expect(response.body).not.toContain(denied);
      const allowed = ["UID", "DTSTAMP", "LAST-MODIFIED", "DTSTART", "DTEND", "SUMMARY", "LOCATION"];
      expect(Object.keys(events[0].properties).every(key => allowed.includes(key))).toBe(true);
      expect(events[0].properties).not.toHaveProperty("DESCRIPTION");
      expect(events[0].properties).not.toHaveProperty("ATTENDEE");
      expect(events[0].properties).not.toHaveProperty("ORGANIZER");
      expect(events[0].properties).not.toHaveProperty("URL");
      let revision = 2031;
      for (const source of ["work_roles", "jobs", "customers", "facilities"] as const) {
        const updatedAt = `${revision}-01-01T12:00:00Z`, label = `Changed ${source}`;
        await fx.editProjectedSource(own.id, source, label, updatedAt);
        const edited = calendarEvents((await fx.http(url)).body)[0];
        expect(edited.uid).toBe(events[0].uid);
        expect(source === "facilities" ? edited.location : edited.summary).toContain(label);
        expect(edited.properties["DTSTAMP"]).toEqual([`${revision}0101T120000Z`]);
        expect(edited.properties["LAST-MODIFIED"]).toEqual([`${revision}0101T120000Z`]);
        revision++;
      }
    });
  });

  test("[P0] 15.5-API002 AC4 AC7 revoked rotated unknown and malformed have equal-history generic HTTP404", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const created = await fx.manage("own", lifecycle("create", 0)), rotatedUrl = issuedUrl(created);
      const rotated = await fx.manage("own", lifecycle("rotate", created.revision!)), revokedUrl = issuedUrl(rotated);
      await fx.manage("own", lifecycle("revoke", rotated.revision!));
      const origin = new URL(rotatedUrl).origin;
      const urls = [rotatedUrl, revokedUrl, `${origin}/calendar/feed/${Buffer.alloc(32, 7).toString("base64url")}`,
        `${origin}/calendar/feed/short`, `${origin}/calendar/feed/not_a_valid_token!`];
      const contracts = [];
      for (const url of urls) {
        await fx.serial.resetOwnedUnknownIpWindow(); // equal IP history, not an incidental token oracle
        const response = await fx.http(url);
        expect(response.status).toBe(404);
        expect(response.headers["set-cookie"]).toBeUndefined();
        expect(response.headers.location).toBeUndefined();
        expect(response.headers["cache-control"]).toContain("no-store");
        expect(response.body).not.toContain("BEGIN:VCALENDAR");
        expect(response.body).not.toContain(fx.subjects.own.tenantId);
        contracts.push(inactiveContract(response));
      }
      for (const contract of contracts) expect(contract).toEqual(contracts[0]);
    });
  });

  test("[P0] 15.5-API003 AC5 sixty per token across independent IPs then61 is limited", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      await fx.serial.withDatabaseTime("2026-10-20T12:05:00Z", async () => {
        const accepted = await Promise.all(Array.from({ length: 60 }, (_, i) => fx.trustedFetch(url, `2001:db8::${i + 1}`)));
        expect(accepted.map(response => response.status)).toEqual(Array(60).fill(200));
        const limited = await fx.trustedFetch(url, "2001:db8::99");
        expect(limited.status).toBe(429);
        expect(Number(limited.headers["retry-after"])).toBe(600);
        const counters = await fx.serial.counters(url, "2001:db8::99");
        expect(counters).toMatchObject({ token: 61, ip: 1, windowStart: "2026-10-20T12:00:00.000Z" });
        expect(counters.spikeCount).toBeGreaterThan(0);
      });
    });
  });

  test("[P0] 15.5-API004 AC5 one IP across multiple tokens reaches120 independently of token budgets", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const urls = await Promise.all((["own", "peer", "planner"] as const)
        .map(async subject => issuedUrl(await fx.manage(subject, lifecycle("create", 0)))));
      const ip = "2001:db8:1::1";
      await fx.serial.withDatabaseTime("2026-10-20T12:05:00Z", async () => {
        for (const url of urls) {
          const responses = await Promise.all(Array.from({ length: 40 }, () => fx.trustedFetch(url, ip)));
          expect(responses.every(response => response.status === 200)).toBe(true);
        }
        const limited = await fx.trustedFetch(urls[0], ip);
        expect(limited.status).toBe(429);
        expect(Number(limited.headers["retry-after"])).toBe(600);
        expect(await fx.serial.counters(urls[0], ip)).toMatchObject({ token: 41, ip: 121 });
      });
    });
  });

  test("[P0] 15.5-API005 AC5 token boundary under65 concurrent requests admits exactly60 without lost increments", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      await fx.serial.withDatabaseTime("2026-10-20T12:05:00Z", async () => {
        const results = await Promise.all(Array.from({ length: 65 }, (_, i) => fx.trustedFetch(url, `2001:db8:2::${i + 1}`)));
        expect(results.filter(response => response.status === 200)).toHaveLength(60);
        expect(results.filter(response => response.status === 429)).toHaveLength(5);
        expect((await fx.serial.counters(url, "2001:db8:2::1")).token).toBe(65);
        expect((await fx.status("own")).usageCount).toBe(60);
      });
    });
  });

  test("[P0] 15.5-API006 AC5 IP boundary under125 concurrent cross-token requests admits exactly120", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const urls = await Promise.all((["own", "peer", "planner"] as const)
        .map(async subject => issuedUrl(await fx.manage(subject, lifecycle("create", 0)))));
      const ip = "2001:db8:3::1";
      await fx.serial.withDatabaseTime("2026-10-20T12:05:00Z", async () => {
        const responses = await Promise.all(Array.from({ length: 125 }, (_, i) => fx.trustedFetch(urls[i % 3], ip)));
        expect(responses.filter(response => response.status === 200)).toHaveLength(120);
        expect(responses.filter(response => response.status === 429)).toHaveLength(5);
        expect((await fx.serial.counters(urls[0], ip)).ip).toBe(125);
        for (const url of urls) expect((await fx.serial.counters(url, ip)).token).toBeLessThan(60);
      });
    });
  });

  test("[P0] 15.5-API007 AC5 DB clock owns fixed window and rollover restores both independent budgets", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0))), ip = "2001:db8:4::1";
      await fx.serial.withDatabaseTime("2026-10-20T12:14:59Z", async () => {
        for (let i = 0; i < 60; i++) expect((await fx.trustedFetch(url, ip)).status).toBe(200);
        const limited = await fx.trustedFetch(url, ip);
        expect(limited.status).toBe(429);
        expect(limited.headers["retry-after"]).toBe("1");
        const beforeForgery = await fx.serial.counters(url, ip);
        await fx.rawFetch(url, "valid", { callerWindow: 0, callerLimit: 999_999 });
        const afterForgery = await fx.serial.counters(url, ip);
        expect(afterForgery.windowStart).toBe(beforeForgery.windowStart);
        expect(afterForgery.token).toBeGreaterThanOrEqual(beforeForgery.token);
      });
      await fx.serial.withDatabaseTime("2026-10-20T12:15:00Z", async () => {
        expect((await fx.trustedFetch(url, ip)).status).toBe(200);
        expect(await fx.serial.counters(url, ip)).toMatchObject({ token: 1, ip: 1,
          windowStart: "2026-10-20T12:15:00.000Z", databaseNow: "2026-10-20T12:15:00.000Z" });
      });
    });
  });

  test("[P0] 15.5-API008 AC4 AC5 unknown malformed rotated and revoked consume common IP budget and limited failures persist", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), rotatedUrl = issuedUrl(first);
      const rotated = await fx.manage("own", lifecycle("rotate", first.revision!)), revokedUrl = issuedUrl(rotated);
      await fx.manage("own", lifecycle("revoke", rotated.revision!));
      const validUrl = issuedUrl(await fx.manage("peer", lifecycle("create", 0))), origin = new URL(validUrl).origin;
      const invalid = [rotatedUrl, revokedUrl, `${origin}/calendar/feed/${Buffer.alloc(32, 9).toString("base64url")}`,
        `${origin}/calendar/feed/malformed`];
      await fx.serial.resetOwnedUnknownIpWindow();
      await fx.serial.withDatabaseTime("2026-10-20T12:05:00Z", async () => {
        for (let i = 0; i < 120; i++) expect((await fx.http(invalid[i % invalid.length])).status).toBe(404);
        const limitedInvalid = await fx.http(invalid[0]), limitedValid = await fx.http(validUrl);
        expect(limitedInvalid.status).toBe(429);
        expect(limitedValid.status).toBe(429);
        expect(inactiveContract(limitedInvalid)).toEqual(inactiveContract(limitedValid));
        expect(limitedValid.headers["retry-after"]).toBe("600");
        const abuse = await fx.readAbuse("admin");
        expect(abuse.denied).toBe(false);
        expect(abuse.rows.length).toBeGreaterThan(0);
        expect(JSON.stringify(abuse.rows)).not.toContain(tokenFromUrl(validUrl));
        const counts = await fx.serial.boundedInfrastructureCounts();
        expect(counts.liveWindows + counts.expiredWindows).toBeLessThanOrEqual(counts.documentedBound);
      });
    });
  });

  test("[P0] 15.5-API009 AC4 AC5 AC7 arbitrary forwarded headers cannot escape shared unknown-IP enforcement", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0))), origin = new URL(url).origin;
      const unknown = `${origin}/calendar/feed/${Buffer.alloc(32, 11).toString("base64url")}`;
      await fx.serial.resetOwnedUnknownIpWindow();
      for (let i = 0; i < 120; i++) {
        const response = await fx.http(unknown, { headers: { "x-forwarded-for": `198.51.100.${i + 1}`,
          "x-real-ip": `203.0.113.${i + 1}`, "x-vercel-forwarded-for": `198.51.100.${i + 1}`,
          forwarded: `for=198.51.100.${i + 1}`, "x-vercel-id": `user-controlled-${i}` } });
        expect(response.status).toBe(404);
      }
      expect((await fx.http(url, { headers: { "x-forwarded-for": "192.0.2.250, 127.0.0.1" } })).status).toBe(429);
    });
  });

  test("[P0] 15.5-API010 AC4 AC5 raw RPC proof forgery cannot choose hash IP domain key or time; replay is counted", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      await fx.seedBookings([bookingSeed()]);
      for (const attack of ["missing", "wrong-key", "wrong-domain", "expired", "future", "over-60-seconds",
        "tampered-token-hash", "tampered-ip-hash", "tampered-request-id"] as const) {
        const forged = await fx.rawFetch(url, attack, { changedIpHash: "attacker-controlled-ip-hash" });
        expect(forged.denied, attack).toBe(true);
        expect(forged.rows).toEqual([]);
        expect(JSON.stringify(forged.sanitizedResult)).not.toContain("Installation");
      }
      expect((await fx.rawFetch(url, "valid")).denied).toBe(false);
      const beforeReplay = await fx.serial.counters(url, fx.isolatedTrustedIp);
      const replay = await fx.rawFetch(url, "replay");
      const afterReplay = await fx.serial.counters(url, fx.isolatedTrustedIp);
      if (replay.denied) {
        expect(replay.rows).toEqual([]);
      } else {
        // A replay may be rejected; any accepted replay is a new counted read.
        expect(afterReplay.token).toBe(beforeReplay.token + 1);
        expect(afterReplay.ip).toBe(beforeReplay.ip + 1);
      }
    });
  });

  test("[P0] 15.5-API011 AC1 AC4 raw lifecycle proof binds every authority action revision attempt and new hash", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const before = await fx.physical();
      for (const attack of ["missing", "wrong-key", "wrong-domain", "expired", "future", "over-60-seconds",
        "tampered-actor", "tampered-tenant", "tampered-membership", "tampered-action",
        "tampered-revision", "tampered-attempt", "weak-chosen-new-hash"] as const) {
        const result = await fx.rawManage("own", lifecycle("create", 0), {}, attack);
        expect(result.denied, attack).toBe(true);
        expect(result.rows).toEqual([]);
      }
      expect(await fx.physical()).toEqual(before);
    });
  });

  test("[P0] 15.5-API012 AC4 AC8 missing or mismatched dedicated key never borrows another Vault secret", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      const failures: FeedResponse[] = [];
      for (const state of ["missing", "wrong-runtime-key", "wrong-vault-key", "unrelated-vault-key-only"] as const) {
        await fx.serial.withKeyState(state, async () => {
          const response = await fx.http(url); failures.push(response);
          expect(response.status).toBe(503);
          expect(response.body).not.toContain("BEGIN:VCALENDAR");
          expect(response.body).not.toContain("vault");
          expect(response.headers["set-cookie"]).toBeUndefined();
        });
      }
      for (const response of failures) expect(inactiveContract(response)).toEqual(inactiveContract(failures[0]));
      expect((await fx.trustedFetch(url, fx.isolatedTrustedIp)).status).toBe(200);
    });
  });

  test("[P0] 15.5-API013 AC3 AC7 AC8 complete materialized feed exceeds PostgREST row cap with no arbitrary horizon", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const rows = Array.from({ length: 1_007 }, (_, i) => bookingSeed({
        startsAt: new Date(Date.UTC(2024, 0, 1, i * 24)).toISOString(),
        endsAt: new Date(Date.UTC(2024, 0, 1, i * 24 + 1)).toISOString(),
      }));
      rows.push(bookingSeed({ startsAt: "2035-12-01T08:00:00Z", endsAt: "2035-12-01T09:00:00Z" }));
      await fx.seedBookings(rows);
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0))), response = await fx.http(url);
      expect(response.status).toBe(200);
      const events = calendarEvents(response.body);
      expect(events).toHaveLength(rows.length);
      expect(new Set(events.map(event => event.uid)).size).toBe(rows.length);
      expect(rows.every(row => events.some(event => event.uid.includes(row.id)))).toBe(true);
      expect(response.headers["cache-control"]).toContain("no-store");
      expect(response.headers.etag).toBeUndefined();
    });
  });

  test("[P0] 15.5-API014 AC3 AC8 independent parser sees escaped labels and no injected properties or UTF8 splits", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const label = `Åäö 🔌,\\;${"Lång etikett ".repeat(20)}\r\nATTENDEE:mailto:private@example.invalid`;
      const row = bookingSeed({ workRoleLabel: label, facilityAddress: "Port A; plan 2, Uppsala\nBEGIN:VEVENT" });
      await fx.seedBookings([row, bookingSeed({ workRoleLabel: null, jobLabel: null, customerLabel: null, facilityAddress: null })]);
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0))), response = await fx.http(url);
      expect(response.status).toBe(200);
      expect(response.body.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
      for (const line of response.body.split("\r\n")) expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
      expect(response.body).not.toContain("\r\nATTENDEE:");
      expect(response.body).not.toContain("\uFFFD");
      const events = calendarEvents(response.body);
      expect(events).toHaveLength(2);
      expect(events.some(event => event.summary === "Bokning")).toBe(true);
      const malicious = events.find(event => event.uid.includes(row.id))!;
      expect(malicious.summary).toContain("Åäö 🔌\\,\\\\\\;");
      expect(malicious.summary).toContain("\\nATTENDEE:");
      expect(malicious.properties).not.toHaveProperty("ATTENDEE");
      expect(malicious.location).toContain("\\nBEGIN:VEVENT");
      expect(response.body).not.toContain(row.description);
    });
  });

  test("[P1] 15.5-API015 AC3 AC8 Stockholm DST all-day exclusive dates and overnight UTC instants are independent", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const spring = bookingSeed({ allDay: true, startsAt: "2026-03-28T23:00:00Z", endsAt: "2026-03-29T22:00:00Z" });
      const autumn = bookingSeed({ allDay: true, startsAt: "2026-10-24T22:00:00Z", endsAt: "2026-10-25T23:00:00Z" });
      const timed = bookingSeed({ startsAt: "2026-10-24T23:30:00Z", endsAt: "2026-10-25T02:30:00Z" });
      await fx.seedBookings([spring, autumn, timed]);
      const response = await fx.http(issuedUrl(await fx.manage("own", lifecycle("create", 0))));
      const events = calendarEvents(response.body);
      expect(response.status).toBe(200);
      expect(events.find(event => event.uid.includes(spring.id))).toMatchObject({ start: "20260329", end: "20260330" });
      expect(events.find(event => event.uid.includes(autumn.id))).toMatchObject({ start: "20261025", end: "20261026" });
      expect(events.find(event => event.uid.includes(timed.id))).toMatchObject({ start: "20261024T233000Z", end: "20261025T023000Z" });
      expect(events.find(event => event.uid.includes(spring.id))!.properties).toHaveProperty("DTSTART;VALUE=DATE");
    });
  });

  test("[P0] 15.5-API016 AC3 AC9 live edit exception cancel and series split preserve surviving booking UIDs", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const series = await fx.seedSeries("own"), url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      const before = calendarEvents((await fx.http(url)).body);
      const stable = before.find(event => event.uid.includes(series.unchangedId))!.uid;
      const splitStable = before.find(event => event.uid.includes(series.splitSurvivingId))!.uid;
      await fx.changeSeries("edit", series.unchangedId);
      await fx.changeSeries("exception", series.movedExceptionId);
      await fx.changeSeries("cancel", series.cancelledId);
      await fx.changeSeries("split", series.splitSurvivingId);
      const after = calendarEvents((await fx.http(url)).body);
      expect(after.find(event => event.uid.includes(series.unchangedId))!.uid).toBe(stable);
      expect(after.find(event => event.uid.includes(series.splitSurvivingId))!.uid).toBe(splitStable);
      expect(after.some(event => event.uid.includes(series.cancelledId))).toBe(false);
      expect(after.find(event => event.uid.includes(series.movedExceptionId))!.start)
        .not.toBe(before.find(event => event.uid.includes(series.movedExceptionId))!.start);
      expect(new Set(after.map(event => event.uid)).size).toBe(after.length);
      expect(after.every(event => !Object.keys(event.properties).some(key => key.startsWith("RRULE")))).toBe(true);
    });
  });

  test("[P0] 15.5-API017 AC7 hostile cookies auth headers validators never authenticate cache or redirect public feed", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      const bare = await fx.http(url);
      const hostile = await fx.http(url, { headers: { cookie: "sb-access-token=forged; sb-refresh-token=expired",
        authorization: "Bearer attacker-invalid", "if-none-match": "*", "if-modified-since": "Wed, 01 Jan 2031 00:00:00 GMT" } });
      expect(bare.status).toBe(200); expect(hostile.status).toBe(200);
      expect(calendarEvents(hostile.body)).toEqual(calendarEvents(bare.body));
      for (const response of [bare, hostile]) {
        expect(response.headers["set-cookie"]).toBeUndefined(); expect(response.headers.location).toBeUndefined();
        expect(response.headers["cache-control"]).toContain("no-store");
        expect(response.headers.etag).toBeUndefined();
        expect(response.body).not.toContain("AppShell");
      }
      const status = await fx.status("own");
      await fx.manage("own", lifecycle("revoke", status.revision));
      expect((await fx.http(url, { headers: { "if-none-match": "*" } })).status).toBe(404);
    });
  });

  test("[P0] 15.5-API018 AC5 AC8 projection and counter failures return503 before any partial or false empty feed", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      await fx.seedBookings(Array.from({ length: 1_001 }, () => bookingSeed()));
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      for (const stage of ["projection-after-first-page", "projection-query-canceled", "counter-write"] as const) {
        const before = await fx.serial.counters(url, null);
        const receipt = await fx.serial.withFault({ tenantId: fx.subjects.own.tenantId,
          attemptId: randomUUID(), correlationId: randomUUID(), stage }, () => fx.http(url));
        expect(receipt.stageObserved).toBe(true); expect(receipt.ownedObjectsRemaining).toBe(0);
        expect(receipt.result.status).toBe(503);
        expect(receipt.result.body).not.toContain("BEGIN:VCALENDAR");
        expect(receipt.result.body).not.toContain("BEGIN:VEVENT");
        expect(receipt.result.body).not.toContain("SQL");
        expect(receipt.result.headers["cache-control"]).toContain("no-store");
        if (stage !== "counter-write") {
          expect(receipt.sqlstate).toBe(stage === "projection-query-canceled" ? "57014" : "PT555");
          expect((await fx.serial.counters(url, null)).ip).toBe(before.ip + 1);
          expect((await fx.serial.counters(url, null)).token).toBe(before.token + 1);
          expect((await fx.status("own")).usageCount).toBe(0);
          expect((await fx.status("own")).lastUsedAt).toBeNull();
        }
      }
    });
  });

  test("[P0] 15.5-API019 AC1 AC4 AC5 AC9 logs audit and public errors disclose no raw token hash proof key or IP", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      await fx.trustedFetch(url, fx.isolatedTrustedIp);
      expect((await fx.http(url)).status).toBe(200); // actual server telemetry, independently of the in-process seam
      const error = await fx.rawFetch(url, "tampered-token-hash");
      const physical = await fx.physical(), monitoring = await fx.readAbuse("admin");
      const observable = [await fx.telemetry(), JSON.stringify(physical.audits),
        JSON.stringify(error.sanitizedResult), JSON.stringify(monitoring.rows), JSON.stringify((await fx.status("own")).publicDto)].join("\n");
      for (const secret of [url, tokenFromUrl(url), fx.isolatedTrustedIp,
        ...physical.tokens.map(row => row.hash), ...await fx.sensitiveTestValues()]) {
        expect(secret.length).toBeGreaterThan(0);
        expect(observable.includes(secret)).toBe(false);
      }
    });
  });

  test("[P0] 15.5-API020 AC3 AC9 feed reads preserve existing booking series resolver reports and job facts", async () => {
    await withCalendarFeedFixture("serial-public", async fx => {
      const baseline = await fx.seedSchedulingRegressionState();
      const url = issuedUrl(await fx.manage("own", lifecycle("create", 0)));
      expect((await fx.http(url)).status).toBe(200);
      expect((await fx.physical()).schedulingIntegrity).toEqual(baseline);
      const status = await fx.status("own");
      await fx.manage("own", lifecycle("rotate", status.revision));
      expect((await fx.physical()).schedulingIntegrity).toEqual(baseline);
    });
  });
});
