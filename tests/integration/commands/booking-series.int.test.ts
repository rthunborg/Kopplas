import { describe, expect, test } from "vitest";
import { CONFLICT_CLAIM_FIELDS } from "@/server/bookings/conflict-attestation";
import { loadBookingSeriesBindings, reviewed, type Attempt, type DurableSnapshot,
  type Fixture, type Plan, type Result, type SeriesBindings } from "../../support/booking-series-atdd";

/* Provider source: envelope.ts; bookings/{create-booking,update-booking,booking-db}.ts;
 * bookings/{conflict-facts,conflict-attestation,editor-preview,save-with-conflicts}.ts;
 * E16 20261019133200 job facts/finalizer; 20261007121034 whole-group validation.
 * Real boundary is normal authenticated runCommand + checked RPC, never HTTP.
 * Existing Results use ok/data or ok:false/code/message. Existing SQL maps BK409,
 * BR428, BR409,42501,23503,23514; no new series error codes/signatures are assumed.
 * All new names below are TEST-OWNED normalized projections; bind to actual source.
 * All cases are UNEXECUTED future coverage; intentional RED = unimplemented series
 * commands/SQL/adapter. Utils flags true but packages absent; Vitest mandate scope
 * is closed. Pact relevance/install gates closed (no consumer/provider boundary);
 * broker was probed once by parent, unavailable; provider source is the basis.
 */
type Run = (b: SeriesBindings, fx: Fixture, plan: Plan) => Promise<void>;
async function scenario(kind: Parameters<SeriesBindings["seed"]>[1], run: Run) {
  const b = await loadBookingSeriesBindings();
  await b.withFixture(async (fx) => run(b, fx, await b.seed(fx, kind)));
}
async function input(b: SeriesBindings, fx: Fixture, plan: Plan): Promise<Attempt> {
  const preview = await b.preview(fx.clients.planner, plan.attempt);
  expect(preview.groups).toEqual(plan.groups);
  return reviewed(plan.attempt, preview, plan.groups.length ? [plan.selected] : []);
}
function outcome(result: Result) {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(`Expected real committed series result, received ${result.code}`);
  return result.data;
}
const tenantRows = (snapshot: DurableSnapshot, tenantId: string) =>
  Object.fromEntries(Object.entries(snapshot).map(([table, rows]) =>
    [table, rows.filter((row) => row.tenant_id === tenantId)]));
const sorted = (values: string[]) => [...values].sort();

describe("Story 15.2 checked series transaction ATDD (unexecuted RED)", () => {
  test.skip("[P0] 15.2-INT-001 atomic series, all occurrences, assignees, selected acceptance, outcome and audit (AC3/6)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const before = await b.snapshot(fx);
      const beforeConflicts = await b.conflicts(fx);
      const data = outcome(await b.command(fx.clients.planner, attempt, fx.correlationId));
      const after = await b.snapshot(fx);
      const rows = await b.occurrences(fx);
      expect(rows.filter((row) => data.occurrenceIds.includes(row.id))).toEqual(plan.planned);
      expect(sorted(data.occurrenceIds)).toEqual(sorted(plan.planned.map((row) => row.id)));
      expect(after.series).toHaveLength(before.series.length + 1);
      expect(after.bookings).toHaveLength(before.bookings.length + plan.planned.length);
      expect(after.assignees).toHaveLength(before.assignees.length + plan.planned.reduce((n, row) => n + row.assigneeIds.length, 0));
      const conflicts = await b.conflicts(fx);
      expect(sorted(conflicts.filter((row) => row.status === "accepted").map((row) => row.key)))
        .toEqual(sorted(plan.selected.keys));
      for (const key of plan.selected.keys) expect(conflicts.find((row) => row.key === key)).toMatchObject({
        status: "accepted", reason: attempt.decision?.reason, acceptedBy: fx.membershipIds.planner,
        acceptedAt: expect.any(String),
      });
      expect(conflicts.filter((row) => plan.unrelatedKeys.includes(row.key)))
        .toEqual(beforeConflicts.filter((row) => plan.unrelatedKeys.includes(row.key)));
      expect(await b.outcomeRows(fx, data.addressedSeriesId, attempt.commandId)).toHaveLength(1);
      expect(await b.auditFor(fx, fx.correlationId)).toEqual([{ actorId: fx.actorIds.planner,
        event: expect.any(String), at: expect.any(String) }]);
      expect(tenantRows(after, fx.tenantIds[1])).toEqual(tenantRows(before, fx.tenantIds[1]));
    });
  });

  test.skip("[P0] 15.2-INT-002 racing identical identity returns one durable result and writes once (AC3)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const raced = await b.race(fx, [attempt, structuredClone(attempt)]);
      expect(raced.observedBlocked).toBe(true);
      const data = outcome(raced.results[0]);
      expect(raced.results[1]).toEqual(raced.results[0]);
      expect(await b.outcomeRows(fx, data.addressedSeriesId, attempt.commandId)).toHaveLength(1);
      expect(await b.auditFor(fx, fx.correlationId)).toHaveLength(1);
      expect((await b.occurrences(fx)).filter((row) => data.occurrenceIds.includes(row.id))).toEqual(plan.planned);
      expect(new Set((await b.occurrences(fx)).map((row) => `${row.seriesId}/${row.nominalSlot}`)).size)
        .toBe((await b.occurrences(fx)).length);
    });
  });

  test.skip("[P0] 15.2-INT-003 lost committed response retry preserves exact attempt and causes no delta (AC3)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const retry = await b.loseResponseThenRetry(fx, attempt);
      expect(retry.firstCommitted).toBe(true);
      expect(retry.deliveredResponse).toBe(false);
      expect(retry.retryInput).toEqual(attempt);
      const data = outcome(retry.retry);
      expect(retry.afterRetry).toEqual(retry.afterFirst);
      expect(await b.outcomeRows(fx, data.addressedSeriesId, attempt.commandId)).toHaveLength(1);
      expect(await b.auditFor(fx, fx.correlationId)).toHaveLength(1);
    });
  });

  test.skip("[P0] 15.2-INT-004 same key changed rule rejected without overwriting outcome (AC3)", async () => {
    await scenario("clear", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      outcome(await b.command(fx.clients.planner, attempt, fx.correlationId));
      const changed = await b.changed(fx, attempt, "rule");
      expect(changed.commandId).toBe(attempt.commandId);
      expect(changed.rule).not.toEqual(attempt.rule);
      const before = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, changed, crypto.randomUUID())).toMatchObject({ ok: false, kind: "key-conflict" });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-005 same key changed selected acceptance or reason rejected (AC3/6)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      outcome(await b.command(fx.clients.planner, attempt, fx.correlationId));
      const changed = await b.changed(fx, attempt, "decision");
      expect(changed.commandId).toBe(attempt.commandId);
      expect(changed.decision).not.toEqual(attempt.decision);
      const before = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, changed, crypto.randomUUID())).toMatchObject({ ok: false, kind: "key-conflict" });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-006 authorized replay ignores expired transport and changed historical references (AC3/7)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const committed = await b.command(fx.clients.planner, attempt, fx.correlationId);
      outcome(committed);
      await b.changeCurrent(fx, "job-child");
      const expired = await b.replayWithExpiredTransport(fx, attempt);
      expect(expired.commandId).toBe(attempt.commandId);
      const before = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, expired, crypto.randomUUID())).toEqual(committed);
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-007 audit fault rolls back all durable state including outcome and acceptance (AC3/6)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const before = await b.snapshot(fx);
      const fault = await b.withFault(fx, "before-audit", () => b.command(fx.clients.planner, attempt, fx.correlationId));
      expect(fault.reached).toBe(true);
      expect(sorted(fault.acceptedKeysObserved)).toEqual(sorted(plan.selected.keys));
      expect(fault.outcomeObserved).toBe(true);
      expect(fault.result).toMatchObject({ ok: false, kind: "fault" });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-008 fault after acceptance proves acceptance UPDATE then whole rollback (AC3/6)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const before = await b.snapshot(fx);
      const fault = await b.withFault(fx, "after-acceptance", () => b.command(fx.clients.planner, attempt, fx.correlationId));
      expect(fault.reached).toBe(true);
      expect(sorted(fault.acceptedKeysObserved)).toEqual(sorted(plan.selected.keys));
      expect(fault.result).toMatchObject({ ok: false, kind: "fault" });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-009 fault after durable outcome rolls back the entire batch (AC3)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const before = await b.snapshot(fx);
      const fault = await b.withFault(fx, "after-outcome", () => b.command(fx.clients.planner, attempt, fx.correlationId));
      expect(fault.reached).toBe(true);
      expect(fault.outcomeObserved).toBe(true);
      expect(fault.result).toMatchObject({ ok: false, kind: "fault" });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-010 current v3/v1 facts retain each booking job and ordered independent null/empty inputs (AC6)", async () => {
    await scenario("jobs", async (b, fx, plan) => {
      const facts = await b.facts(fx, plan.attempt);
      expect(facts.engine).toBe("booking-conflicts-v3");
      expect(facts.config).toBe("stockholm-capacity-v1");
      expect(facts.digest).toBe(facts.sqlDigest);
      expect(facts.canonicalSqlText.length).toBeGreaterThan(0);
      expect(facts.jobInputs).toEqual([
        { jobId: fx.jobIds[0], requiredWorkRoleIds: null, accessWindows: [] },
        { jobId: fx.jobIds[1], requiredWorkRoleIds: [], accessWindows: null },
        { jobId: fx.jobIds[2], requiredWorkRoleIds: sorted(fx.workRoleIds), accessWindows: [
          { startsAt: "2026-10-20T06:00:00.000000Z", endsAt: "2026-10-20T08:00:00.000000Z" },
          { startsAt: "2026-10-20T12:00:00.000000Z", endsAt: "2026-10-20T14:00:00.000000Z" },
        ] },
      ]);
      expect(facts.jobInputs.map((job) => job.jobId)).toEqual(sorted(fx.jobIds));
      for (const row of plan.planned) expect(facts.bookings.find((booking) => booking.id === row.id))
        .toMatchObject({ jobId: row.jobId });
      expect(facts.bookings).toContainEqual(expect.objectContaining({ jobId: null }));
    });
  });

  test.skip("[P0] 15.2-INT-011 empty windows prohibit whole interval; unbound and null facts inherit no other job (AC6)", async () => {
    await scenario("jobs", async (b, fx, plan) => {
      const p = await b.preview(fx.clients.planner, plan.attempt);
      expect(p.groups).toEqual(plan.groups);
      const emptyWindowIds = plan.planned.filter((row) => row.jobId === fx.jobIds[0]).map((row) => row.id);
      const unavailableWindowIds = plan.planned.filter((row) => row.jobId === fx.jobIds[1] || row.jobId === null).map((row) => row.id);
      for (const id of emptyWindowIds) expect(p.groups).toContainEqual(expect.objectContaining({
        type: "outside_access_window", bookingIds: expect.arrayContaining([id]),
        startsAt: plan.planned.find((row) => row.id === id)!.startsAt,
        endsAt: plan.planned.find((row) => row.id === id)!.endsAt,
      }));
      expect(p.groups.filter((group) => group.type === "outside_access_window")
        .flatMap((group) => group.bookingIds).filter((id) => unavailableWindowIds.includes(id))).toEqual([]);
      expect(p.groups.filter((group) => group.type === "competence_missing")
        .flatMap((group) => group.bookingIds).filter((id) => unavailableWindowIds.includes(id))).toEqual([]);
    });
  });

  test.skip("[P0] 15.2-INT-012 genuine proof becomes stale after recorded job child change (AC6)", async () => {
    await scenario("jobs", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const proof = await b.proof(fx, attempt);
      await b.changeCurrent(fx, "job-child");
      expect((await b.proof(fx, plan.attempt)).factDigest).not.toBe(proof.factDigest);
      const before = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, attempt, fx.correlationId)).toMatchObject({ ok: false, kind: "stale" });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-013 genuine proof becomes stale after booking job rebinding (AC6)", async () => {
    await scenario("jobs", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const proof = await b.proof(fx, attempt);
      await b.changeCurrent(fx, "job-rebinding");
      expect((await b.proof(fx, plan.attempt)).factDigest).not.toBe(proof.factDigest);
      const before = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, attempt, fx.correlationId)).toMatchObject({ ok: false, kind: "stale" });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-014 series proof domain separates without changing 13 legacy claims and SQL bytes agree (AC6)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      expect([...CONFLICT_CLAIM_FIELDS]).toEqual(["tenantId", "actorId", "operation", "commandId", "bookingId",
        "candidateDigest", "factDigest", "engineVersion", "configVersion", "correlationId", "keyId", "issuedAt", "expiresAt"]);
      const proof = await b.proof(fx, plan.attempt);
      expect(proof.attestationDomain).not.toBe("elpro.booking-conflicts.attestation.v1");
      expect(proof.attestationDomain).not.toBe("kopplas.job-card.attestation.v1");
      expect(proof.reviewDomain).not.toBe("elpro.booking-editor.review.v1");
      expect(proof.reviewDomain).not.toBe(proof.attestationDomain);
      expect(proof.attestationDomain.length).toBeGreaterThan(0);
      expect(proof.reviewDomain.length).toBeGreaterThan(0);
      expect(proof.canonicalBytes).toEqual(proof.sqlCanonicalBytes);
      expect(proof.orderedClaims.length).toBeGreaterThan(0);
      expect(proof).toMatchObject({ tenantId: fx.tenantIds[0], actorId: fx.actorIds.planner,
        commandId: plan.attempt.commandId, rule: plan.attempt.rule, groups: plan.groups });
      expect(sorted(proof.proposedIds)).toEqual(sorted(plan.planned.map((row) => row.id)));
    });
  });

  test.skip("[P0] 15.2-INT-015 metadata-only revision/slot/exception/tombstone/lineage changes invalidate genuine baseline (AC6)", async () => {
    for (const change of ["series-revision", "nominal-slot", "exception", "tombstone", "lineage"] as const) {
      await scenario("existing", async (b, fx, plan) => {
        const attempt = await input(b, fx, plan);
        const proof = await b.proof(fx, attempt);
        await b.changeCurrent(fx, change);
        const changedProof = await b.proof(fx, plan.attempt);
        expect(changedProof.metadataDigest).not.toBe(proof.metadataDigest);
        expect(changedProof.factDigest).toBe(proof.factDigest);
        const before = await b.snapshot(fx);
        expect(await b.command(fx.clients.planner, attempt, fx.correlationId)).toMatchObject({ ok: false, kind: "stale" });
        expect(await b.snapshot(fx)).toEqual(before);
      });
    }
  });

  test.skip("[P0] 15.2-INT-016 genuine single-booking receipt cannot authorize a batch (AC6/7)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const donor = await b.crossProtocol(fx, await input(b, fx, plan), "single");
      expect(donor.donorVerified).toBe(true);
      expect(donor.donorDomain).toBe("elpro.booking-editor.review.v1");
      const before = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, donor.input, fx.correlationId)).toMatchObject({ ok: false });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-017 genuine job-card receipt cannot authorize a batch (AC6/7)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const donor = await b.crossProtocol(fx, await input(b, fx, plan), "job-card");
      expect(donor.donorVerified).toBe(true);
      expect(donor.donorDomain).toBe("kopplas.job-card.attestation.v1");
      const before = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, donor.input, fx.correlationId)).toMatchObject({ ok: false });
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-INT-018 real signed wrong claim/output/payload and unsigned reviewed list fail closed (AC6/7)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      for (const attack of ["tenant", "actor", "operation", "command", "source-revision", "successor", "rule",
        "nominal-pivot", "proposed-id", "payload", "facts", "output", "unsigned-list"] as const) {
        const malicious = await b.attack(fx, attempt, attack);
        const before = await b.snapshot(fx);
        expect(await b.command(fx.clients.planner, malicious, fx.correlationId)).toMatchObject({ ok: false });
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-INT-019 full affected-ID review includes sibling aggregate, retained exception and occurrence beyond tenth (AC6)", async () => {
    await scenario("aggregate", async (b, fx, plan) => {
      const p = await b.preview(fx.clients.planner, plan.attempt);
      expect(p.total).toBeGreaterThan(10);
      expect(p.displayedIds).toHaveLength(10);
      expect(p.displayedIds).not.toContain(plan.afterTenthId);
      expect(p.groups).toEqual(plan.groups);
      expect(p.groups.flatMap((group) => group.bookingIds)).toContain(plan.afterTenthId);
      expect(p.groups.flatMap((group) => group.bookingIds)).toContain(plan.retainedExceptionId);
      expect(p.groups).toContainEqual(expect.objectContaining({ bookingIds: expect.arrayContaining(plan.suffixIds.slice(0, 3)) }));
      expect(p.groups.every((group) => group.bookingIds.some((id) => p.affectedIds.includes(id)))).toBe(true);
      expect(sorted(p.groups.flatMap((group) => group.keys))).toEqual(sorted(plan.groups.flatMap((group) => group.keys)));
      const data = outcome(await b.command(fx.clients.planner, reviewed(plan.attempt, p, [plan.selected]), fx.correlationId));
      expect(data.occurrenceIds).toContain(plan.afterTenthId);
      expect(sorted((await b.conflicts(fx)).filter((row) => row.status === "accepted").map((row) => row.key)))
        .toEqual(sorted(plan.selected.keys));
    });
  });

  test.skip("[P0] 15.2-INT-020 partial association group or unrelated group rejection leaves no writes (AC6)", async () => {
    await scenario("aggregate", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      expect(plan.selected.keys.length).toBeGreaterThan(1);
      for (const attack of ["partial-group", "unrelated-group"] as const) {
        const malicious = await b.attack(fx, attempt, attack);
        const before = await b.snapshot(fx);
        expect(await b.command(fx.clients.planner, malicious, fx.correlationId)).toMatchObject({ ok: false });
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-INT-021 each warning requires current acknowledgment and nonblank reason (AC6)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      const decision = attempt.decision!;
      const before = await b.snapshot(fx);
      for (const invalid of [{ ...decision, acknowledged: false }, { ...decision, reason: " \n\t " },
        { ...decision, reviewedIds: decision.reviewedIds.slice(1) }]) {
        expect(await b.command(fx.clients.planner, { ...attempt, decision: invalid }, fx.correlationId))
          .toMatchObject({ ok: false, kind: "review-required" });
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-INT-022 unchanged natural-key acceptance survives and changed key reopens (AC6)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      const changes = await b.acceptedKeyChange(fx, plan);
      const acceptedBefore = (await b.conflicts(fx)).filter((row) => changes.unchangedKeys.includes(row.key));
      expect(acceptedBefore.length).toBeGreaterThan(0);
      outcome(await b.command(fx.clients.planner, changes.unchanged, fx.correlationId));
      expect((await b.conflicts(fx)).filter((row) => changes.unchangedKeys.includes(row.key))).toEqual(acceptedBefore);
      outcome(await b.command(fx.clients.planner, changes.changed, crypto.randomUUID()));
      const after = await b.conflicts(fx);
      expect(after.filter((row) => changes.newKeys.includes(row.key))).toEqual(changes.newKeys.map((key) => ({
        id: expect.any(String), key, bookingIds: expect.any(Array), status: "open", reason: null,
        acceptedBy: null, acceptedAt: null,
      })));
      expect(after.filter((row) => changes.oldKeys.includes(row.key))).toEqual([]);
    });
  });

  test.skip("[P0] 15.2-INT-023 one sole-engine overlay and one batch finalizer, no committed single save loop (AC3/6)", async () => {
    await scenario("aggregate", async (b, fx, plan) => {
      const observed = await b.observeCommand(fx, await input(b, fx, plan));
      outcome(observed.result);
      expect(observed.trace.detectorCalls).toBe(1);
      expect(observed.trace.batchFinalizers).toBe(1);
      expect(observed.trace.singleBookingCommits).toBe(0);
      expect(observed.trace.overlayIds).toEqual(expect.arrayContaining(plan.planned.map((row) => row.id)));
      expect(observed.trace.overlayIds).toContain(plan.retainedExceptionId);
      expect(sorted(observed.trace.finalizedKeys)).toEqual(sorted(observed.trace.outputKeys));
      expect(observed.trace.events.indexOf("tenant-gate-acquired")).toBeLessThan(observed.trace.events.indexOf("current-role-checked"));
      expect(observed.trace.events.indexOf("current-role-checked")).toBeLessThan(observed.trace.events.indexOf("batch-finalized"));
      expect(observed.trace.events).toEqual(expect.arrayContaining(["tenant-gate-acquired", "current-role-checked", "batch-finalized"]));
    });
  });

  test.skip("[P0] 15.2-INT-024 current role rechecked after gate wait before new mutation (AC3/7)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const waiting = await b.revokedWhileWaiting(fx, await input(b, fx, plan), false);
      expect(waiting.observedBlocked).toBe(true);
      expect(waiting.events).toEqual(["tenant-gate-held", "command-blocked", "role-revocation-committed", "tenant-gate-released", "current-role-denied"]);
      expect(waiting.result).toMatchObject({ ok: false, kind: "denied" });
      expect(waiting.after).toEqual(waiting.before);
    });
  });

  test.skip("[P0] 15.2-INT-025 current role rechecked before returning durable replay after gate wait (AC3/7)", async () => {
    await scenario("mixed", async (b, fx, plan) => {
      const attempt = await input(b, fx, plan);
      outcome(await b.command(fx.clients.planner, attempt, fx.correlationId));
      const waiting = await b.revokedWhileWaiting(fx, attempt, true);
      expect(waiting.observedBlocked).toBe(true);
      expect(waiting.events).toEqual(["tenant-gate-held", "command-blocked", "role-revocation-committed", "tenant-gate-released", "current-role-denied"]);
      expect(waiting.result).toMatchObject({ ok: false, kind: "denied" });
      expect(waiting.after).toEqual(waiting.before);
    });
  });

  test.skip("[P0] 15.2-INT-026 inactive assignee retention belongs only to its persisted occurrence (AC7)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      const result = await b.assigneeRetention(fx, plan);
      outcome(result.retained);
      expect((await b.occurrences(fx)).find((row) => row.id === result.retainedId)?.assigneeIds).toContain(result.inactivePersonId);
      expect(result.newSibling).toMatchObject({ ok: false });
      expect(result.afterSibling).toEqual(result.beforeSibling);
    });
  });

  test.skip("[P0] 15.2-INT-027 one-occurrence move survives full series edit with same UUID and nominal slot (AC4)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      const original = (await b.occurrences(fx)).find((row) => row.id === plan.retainedExceptionId)!;
      outcome(await b.occurrenceEdit(fx, original.id, "move"));
      const moved = (await b.occurrences(fx)).find((row) => row.id === original.id)!;
      expect(moved.startsAt).not.toBe(original.startsAt);
      expect(moved.nominalSlot).toBe(original.nominalSlot);
      expect(moved.isException).toBe(true);
      outcome(await b.command(fx.clients.planner, await b.updatePlan(fx, plan), fx.correlationId));
      expect((await b.occurrences(fx)).find((row) => row.id === original.id)).toEqual(moved);
      expect((await b.occurrences(fx)).filter((row) => row.nominalSlot === original.nominalSlot)).toHaveLength(1);
    });
  });

  test.skip("[P0] 15.2-INT-028 cancelled and removed ordinary slots persist exceptional tombstones without regeneration (AC4/5)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      outcome(await b.occurrenceEdit(fx, plan.tombstoneId, "cancel"));
      const cancelled = (await b.occurrences(fx)).find((row) => row.id === plan.tombstoneId)!;
      expect(cancelled).toMatchObject({ status: "cancelled", isException: true });
      const removedSlot = await b.changed(fx, await b.updatePlan(fx, plan), "omit-slot");
      outcome(await b.command(fx.clients.planner, removedSlot, fx.correlationId));
      const afterRemoval = await b.occurrences(fx);
      expect(afterRemoval.find((row) => row.id === cancelled.id)).toEqual(cancelled);
      const removedOrdinary = plan.planned.find((row) => !row.isException && row.nominalSlot !== cancelled.nominalSlot)!;
      expect(afterRemoval.find((row) => row.id === removedOrdinary.id)).toMatchObject({ status: "cancelled", isException: true });
      outcome(await b.command(fx.clients.planner, await b.updatePlan(fx, plan), crypto.randomUUID()));
      const after = await b.occurrences(fx);
      for (const id of [cancelled.id, removedOrdinary.id]) expect(after.find((row) => row.id === id))
        .toMatchObject({ status: "cancelled", isException: true });
      expect(after.filter((row) => row.nominalSlot === cancelled.nominalSlot)).toHaveLength(1);
      expect(after.filter((row) => row.nominalSlot === removedOrdinary.nominalSlot)).toHaveLength(1);
    });
  });

  test.skip("[P0] 15.2-INT-029 split uses edited pivot's nominal slot, retains exception/tombstone UUIDs and lineage (AC5)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      outcome(await b.occurrenceEdit(fx, plan.pivotId, "move"));
      const before = await b.occurrences(fx);
      const pivot = before.find((row) => row.id === plan.pivotId)!;
      expect(pivot.nominalSlot).toBe(plan.pivotNominalSlot);
      const attempt = await b.splitPlan(fx, plan);
      const data = outcome(await b.command(fx.clients.planner, attempt, fx.correlationId));
      expect(data.addressedSeriesId).toBe(attempt.sourceSeriesId);
      expect(data.successorSeriesId).not.toBe(data.addressedSeriesId);
      const series = await b.series(fx);
      expect(series.find((row) => row.id === data.addressedSeriesId)).toMatchObject({ successorId: data.successorSeriesId });
      expect(series.find((row) => row.id === data.addressedSeriesId)!.lastNominalSlot! < plan.pivotNominalSlot).toBe(true);
      expect(series.find((row) => row.id === data.successorSeriesId)).toMatchObject({ predecessorId: data.addressedSeriesId });
      const after = await b.occurrences(fx);
      for (const id of plan.prefixIds) expect(after.find((row) => row.id === id)).toEqual(before.find((row) => row.id === id));
      for (const id of plan.suffixIds) expect(after.find((row) => row.id === id)).toMatchObject({
        ...before.find((row) => row.id === id), seriesId: data.successorSeriesId, index: expect.any(Number),
      });
      expect(after.find((row) => row.id === plan.retainedExceptionId)?.id).toBe(plan.retainedExceptionId);
      expect(after.find((row) => row.id === plan.tombstoneId)?.status).toBe("cancelled");
      expect(await b.outcomeRows(fx, data.addressedSeriesId, attempt.commandId)).toHaveLength(1);
    });
  });

  test.skip("[P0] 15.2-INT-030 two distinct concurrent split identities yield one successor and stale loser (AC5)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      const a = await b.splitPlan(fx, plan);
      const c = await b.splitPlan(fx, plan);
      expect(c.commandId).not.toBe(a.commandId);
      const before = await b.snapshot(fx);
      const raced = await b.race(fx, [a, c]);
      expect(raced.observedBlocked).toBe(true);
      expect(raced.results.filter((result) => result.ok)).toHaveLength(1);
      expect(raced.results.filter((result) => !result.ok)).toEqual([expect.objectContaining({ kind: "stale" })]);
      expect((await b.snapshot(fx)).series).toHaveLength(before.series.length + 1);
      const after = await b.occurrences(fx);
      expect(new Set(after.map((row) => row.id)).size).toBe(after.length);
      expect(after.filter((row) => plan.suffixIds.includes(row.id))).toHaveLength(plan.suffixIds.length);
      const stable = await b.snapshot(fx);
      expect(await b.command(fx.clients.planner, a, crypto.randomUUID())).toEqual(raced.results[0]);
      expect(await b.snapshot(fx)).toEqual(stable);
    });
  });

  test.skip("[P1] 15.2-INT-031 unchanged rule preserves original remaining end, explicit count applies from pivot (AC1/5)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      const original = await b.occurrences(fx);
      const data = outcome(await b.command(fx.clients.planner, await b.splitPlan(fx, plan), fx.correlationId));
      expect((await b.occurrences(fx)).filter((row) => row.seriesId === data.successorSeriesId).map((row) => row.nominalSlot))
        .toEqual(original.filter((row) => plan.suffixIds.includes(row.id)).map((row) => row.nominalSlot));
    });
    await scenario("existing", async (b, fx, plan) => {
      const data = outcome(await b.command(fx.clients.planner, await b.splitPlan(fx, plan, 3), fx.correlationId));
      expect((await b.occurrences(fx)).filter((row) => row.seriesId === data.successorSeriesId && !row.isException)).toHaveLength(3);
    });
  });

  test.skip("[P0] 15.2-INT-032 job-card interleaving serializes current complete facts or rejects stale series (AC6)", async () => {
    await scenario("jobs", async (b, fx, plan) => {
      const interleaved = await b.jobCardInterleave(fx, await input(b, fx, plan));
      expect(interleaved.observedBlocked).toBe(true);
      expect(interleaved.cardCommitted).toBe(true);
      expect(interleaved.seriesResult).toMatchObject({ ok: false, kind: "stale" });
      expect(interleaved.conflictsMatchSoleDetector).toBe(true);
      expect(interleaved.committedFactDigest).toBe(interleaved.currentFactDigest);
    });
  });

  test.skip("[P0] 15.2-INT-033 exception omitted by new rule retains all values and immutable slot (AC4/5)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      const before = (await b.occurrences(fx)).find((row) => row.id === plan.retainedExceptionId)!;
      expect(before.isException).toBe(true);
      const attempt = await b.changed(fx, await b.updatePlan(fx, plan), "omit-slot");
      outcome(await b.command(fx.clients.planner, attempt, fx.correlationId));
      expect((await b.occurrences(fx)).find((row) => row.id === before.id)).toEqual(before);
      expect((await b.occurrences(fx)).filter((row) => row.nominalSlot === before.nominalSlot)).toHaveLength(1);
    });
  });

  test.skip("[P0] 15.2-INT-034 moved exception colliding with introduced nominal slot keeps both IDs and detects collision (AC4/6)", async () => {
    await scenario("existing", async (b, fx, plan) => {
      const collision = await b.slotCollisionPlan(fx, plan);
      expect(collision.newNominalSlot).not.toBe(collision.exceptionNominalSlot);
      const p = await b.preview(fx.clients.planner, collision.attempt);
      expect(p.groups).toContainEqual(expect.objectContaining({
        bookingIds: expect.arrayContaining([collision.exceptionId, collision.newSlotId]),
      }));
      outcome(await b.command(fx.clients.planner, reviewed(collision.attempt, p), fx.correlationId));
      const rows = await b.occurrences(fx);
      expect(rows.find((row) => row.id === collision.exceptionId)).toMatchObject({
        nominalSlot: collision.exceptionNominalSlot, isException: true,
      });
      expect(rows.find((row) => row.id === collision.newSlotId)).toMatchObject({ nominalSlot: collision.newNominalSlot });
      expect(rows.filter((row) => [collision.exceptionId, collision.newSlotId].includes(row.id))).toHaveLength(2);
    });
  });

  test.skip("[P0] 15.2-INT-035 actual action JSON admission checks exact 3 MiB and byte+1 before expensive work (AC1/3)", async () => {
    await scenario("clear", async (b, fx) => {
      const at = await b.admissionProbe(fx, "action-json", 0);
      expect(at.ceiling).toBe(3 * 1024 * 1024);
      expect(at.measured).toBe(at.ceiling);
      expect(at.admitted).toBe(true);
      const over = await b.admissionProbe(fx, "action-json", 1);
      expect(over.measured).toBe(over.ceiling + 1);
      expect(over.admitted).toBe(false);
      expect(over.rejectedResult).toMatchObject({ ok: false, kind: "validation" });
      expect(over.expansionCalls).toBe(0);
      expect(over.mutationCalls).toBe(0);
      expect(over.after).toEqual(over.before);
    });
  });

  test.skip("[P0] 15.2-INT-036 encrypted review receipt includes 28-byte overhead at 750000 ceiling and rejects byte+1 (AC1/3/6)", async () => {
    await scenario("clear", async (b, fx) => {
      const at = await b.admissionProbe(fx, "encrypted-receipt", 0);
      expect(at.ceiling).toBe(750_000);
      expect(at.measured).toBe(at.ceiling);
      expect(at.includesEncryptionOverhead).toBe(28);
      expect(at.admitted).toBe(true);
      const over = await b.admissionProbe(fx, "encrypted-receipt", 1);
      expect(over.measured).toBe(750_001);
      expect(over.admitted).toBe(false);
      expect(over.rejectedResult).toMatchObject({ ok: false, kind: "validation" });
      expect(over.expansionCalls).toBe(0);
      expect(over.mutationCalls).toBe(0);
      expect(over.after).toEqual(over.before);
    });
  });

  test.skip("[P0] 15.2-INT-037 documented occurrence bound materializes all at boundary and rejects +1 without truncation (AC1/3)", async () => {
    await scenario("clear", async (b, fx) => {
      const at = await b.admissionProbe(fx, "occurrences", 0);
      expect(at.ceiling).toBeGreaterThan(0);
      expect(at.admitted).toBe(true);
      expect(at.requestedCount).toBe(at.ceiling);
      expect(at.materializedCount).toBe(at.requestedCount);
      const over = await b.admissionProbe(fx, "occurrences", 1);
      expect(over.requestedCount).toBe(over.ceiling + 1);
      expect(over.admitted).toBe(false);
      expect(over.rejectedResult).toMatchObject({ ok: false, kind: "validation" });
      expect(over.expansionCalls).toBe(0);
      expect(over.mutationCalls).toBe(0);
      expect(over.materializedCount).toBe(0);
      expect(over.after).toEqual(over.before);
    });
  });
});
import { beforeAll } from "vitest";
import { withBookingFixture, bookingSnapshot } from "../../support/bookings-atdd";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { waitForBlocked } from "../../support/booking-conflicts-atdd";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { runCommand } from "@/server/commands/envelope";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
import { seriesCommandPayload, type BookingSeriesInput } from "@/server/commands/bookings/series-validation";
import { previewBookingSeries, snapshotBookingSeries, planBookingSeries } from "@/server/bookings/series-conflicts";
import { realSeriesInput, reviewRealSeries, realSeriesSnapshot } from "../../support/booking-series-atdd";
import { updateBookingSeries } from "@/server/commands/bookings/update-booking-series";
import { bookingCommand } from "../../support/bookings-atdd";
import { seriesProofBytes, signSeries, openSeriesReceipt, sealSeriesReceipt, SERIES_ATTESTATION_DOMAIN, SERIES_REVIEW_DOMAIN } from "@/server/bookings/series-attestation";
import { bookingConflictKeyFromEnv } from "@/server/bookings/conflict-attestation";
import { previewBookingEditor, openEditorReceipt } from "@/server/bookings/editor-preview";
import { createJobCard } from "@/server/commands/jobs/save-job-card";
import { seedBookingParents } from "../../support/bookings-atdd";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";
let realStackUp = false;
beforeAll(async () => { realStackUp = await isLocalStackReachable(); });

describe("15.2 real checked series command", () => {
  test("15.2-INT-REAL-019 real job-card finalizer ahead of series gate invalidates old complete review",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const parents=await seedBookingParents(fx.base.tenantA.id);const ready=await reviewRealSeries(fx,realSeriesInput(fx));
      let allow!:()=>void,staged!:()=>void;const allowed=new Promise<void>(resolve=>{allow=resolve;}),prepared=new Promise<void>(resolve=>{staged=resolve;});
      const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{if(name==="finalize_job_card"){staged();await allowed;}return target.rpc(name,args);};return Reflect.get(target,key);}});
      const card=runCommand(createJobCard,{client:client as never,input:{commandId:crypto.randomUUID(),type:"order",title:"Serialized complete job facts",customer_id:parents.customerId,facility_id:parents.facilityId,contact_id:parents.contactId,
        priority:"normal",estimated_duration_minutes:null,planned_travel_minutes:null,crew_size:null,earliest_date:null,desired_date:null,latest_date:null,planned_start_date:null,planned_end_date:null,
        customer_presence_required:false,responsible_project_manager_id:null,locationOverride:null,requiredWorkRoleIds:[],accessWindows:[],dependencyJobIds:[]}});
      await Promise.race([prepared,card.then(()=>{throw new Error("Card failed before real finalizer barrier");})]);
      let series:Promise<unknown>|null=null;
      try{await adminSession(async({query})=>{await query("begin");try{
        const [blocker]=await query<{pid:number}>("select pg_backend_pid() pid,pg_advisory_xact_lock(hashtextextended($1,0))",[fx.base.tenantA.id]);
        allow();await waitForBlocked(blocker.pid,1);series=runCommand(createBookingSeries,{client:fx.adminClient as never,input:ready.input});await waitForBlocked(blocker.pid,2);await query("commit");
      }catch(error){await query("rollback");await Promise.allSettled([card,...(series?[series]:[])]);throw error;}});
      }finally{allow();await Promise.allSettled([card,...(series?[series]:[])]);}
      expect(await card).toMatchObject({ok:true});expect(await series).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect(await adminQuery("select id from public.booking_series where tenant_id=$1",[fx.base.tenantA.id])).toEqual([]);
      const snapshot=await realSeriesSnapshot(fx);expect(snapshot.bookings).toEqual([]);expect(snapshot.assignees).toEqual([]);expect(snapshot.conflicts).toEqual([]);
      expect(snapshot.audit.filter(row=>row.command==="createBookingSeries")).toEqual([]);expect(snapshot.audit.some(row=>row.command==="job.card.create")).toBe(true);
    });
  });
  test("15.2-INT-REAL-016 moved exception colliding with a new nominal date keeps both IDs and exact edited facts",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const base=realSeriesInput(fx);const original={...base,rule:{...base.rule,count:1}};
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,original)).input})).toMatchObject({ok:true});
      const [{id}]=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1",[original.seriesId]);
      expect(await bookingCommand("update",fx.adminClient,{...original.template,assigneeIds:[...original.template.assigneeIds],commandId:crypto.randomUUID(),bookingId:id,startsAt:"2026-10-13T05:00:00.123456Z",endsAt:"2026-10-13T06:00:00.654321Z",description:"Moved exact exception"})).toMatchObject({ok:true});
      const preciseRow=`select id,nominal_date::text,to_char(starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') starts_at,to_char(ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') ends_at,description,is_exception from public.bookings where id=$1`;
      const [moved]=await adminQuery(preciseRow,[id]);
      expect(moved).toMatchObject({starts_at:"2026-10-13T05:00:00.123456Z",ends_at:"2026-10-13T06:00:00.654321Z"});
      const [{version}]=await adminQuery<{version:number}>("select version from public.booking_series where id=$1",[original.seriesId]);
      const changed=realSeriesInput(fx,{seriesId:original.seriesId,sourceSeriesId:original.seriesId,expectedVersion:version,rule:{...original.rule,startDate:"2026-10-13"}});
      const ready=await reviewRealSeries(fx,changed);expect(ready.preview.total).toBe(2);
      const fresh=ready.preview.occurrences.find(row=>row.id!==id)!;expect(fresh.nominalDate).toBe("2026-10-13");
      expect(ready.preview.warnings).toContainEqual(expect.objectContaining({rule:"double_booking",bookingIds:expect.arrayContaining([id,fresh.id])}));
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:ready.input})).toMatchObject({ok:true});
      expect(await adminQuery(preciseRow,[id])).toEqual([moved]);
      expect(await adminQuery("select id,nominal_date::text from public.bookings where series_id=$1 order by nominal_date",[original.seriesId])).toEqual([{id,nominal_date:"2026-10-12"},{id:fresh.id,nominal_date:"2026-10-13"}]);
    });
  });
  test("15.2-INT-REAL-017 explicitly changed split count starts at stored pivot and preserves omitted suffix tombstones",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:5}});
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,original)).input})).toMatchObject({ok:true});
      const rows=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      const split=realSeriesInput(fx,{sourceSeriesId:original.seriesId,expectedVersion:1,pivotOccurrenceId:rows[2]!.id,rule:{...original.rule,startDate:"2026-10-14",count:1}});
      const ready=await reviewRealSeries(fx,split);expect(ready.preview.total).toBe(3);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:ready.input})).toMatchObject({ok:true});
      expect(await adminQuery("select id,nominal_date::text,status,is_exception from public.bookings where series_id=$1 order by nominal_date",[split.seriesId])).toEqual([
        {id:rows[2]!.id,nominal_date:"2026-10-14",status:"planned",is_exception:false},
        {id:rows[3]!.id,nominal_date:"2026-10-15",status:"cancelled",is_exception:true},
        {id:rows[4]!.id,nominal_date:"2026-10-16",status:"cancelled",is_exception:true},
      ]);
    });
  });
  test("15.2-INT-REAL-018 metadata-only exception change invalidates series review while detector facts stay equal",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx);expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,original)).input})).toMatchObject({ok:true});
      const edit=realSeriesInput(fx,{seriesId:original.seriesId,sourceSeriesId:original.seriesId,expectedVersion:1});const ready=await reviewRealSeries(fx,edit);
      const [{facts:beforeFacts}]=await adminQuery<{facts:unknown}>("select public.booking_detection_facts_internal($1) facts",[fx.base.tenantA.id]);
      const [{id}]=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date limit 1",[original.seriesId]);
      expect(await bookingCommand("update",fx.adminClient,{...original.template,assigneeIds:[...original.template.assigneeIds],commandId:crypto.randomUUID(),bookingId:id})).toMatchObject({ok:true});
      const [{facts:afterFacts}]=await adminQuery<{facts:unknown}>("select public.booking_detection_facts_internal($1) facts",[fx.base.tenantA.id]);expect(afterFacts).toEqual(beforeFacts);
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:ready.input})).toMatchObject({ok:false,code:"PREVIEW_STALE"});expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-015 occurrence boundary materializes all 128 and rejects 129 before RPC",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const base=realSeriesInput(fx);const at={...base,rule:{...base.rule,count:128}};
      const ready=await reviewRealSeries(fx,at);expect(ready.preview.total).toBe(128);expect(ready.preview.occurrences).toHaveLength(10);
      const result=await runCommand(createBookingSeries,{client:fx.adminClient as never,input:ready.input});expect(result).toMatchObject({ok:true});
      if(!result.ok)throw new Error("Expected full boundary commit");expect(result.data.occurrenceIds).toHaveLength(128);
      expect(await adminQuery("select count(*)::int total,count(distinct nominal_date)::int slots from public.bookings where series_id=$1",[at.seriesId])).toEqual([{total:128,slots:128}]);
      let rpcCalls=0;const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{rpcCalls++;return target.rpc(name,args);};return Reflect.get(target,key);}});
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(createBookingSeries,{client:client as never,input:{...at,commandId:crypto.randomUUID(),seriesId:crypto.randomUUID(),rule:{...at.rule,count:129}}})).toMatchObject({ok:false,code:"VALIDATION_FAILED"});
      expect(rpcCalls).toBe(0);expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-012 intra-series aggregate associations are complete and unchanged acceptance survives while changed keys reopen",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const base=realSeriesInput(fx);
      const input={...base,rule:{...base.rule,startTime:"07:00:00",endTime:"08:00:00",endDayOffset:2,count:12},template:{...base.template,endsAt:"2026-10-14T06:00:00.000000Z"}};
      const ready=await reviewRealSeries(fx,input);const key=bookingConflictKeyFromEnv();
      const receipt=openSeriesReceipt(ready.preview.receipt,key.secret);
      const ids=ready.preview.occurrences.map(row=>row.id);
      expect(ready.preview.total).toBe(12);expect(ids).toHaveLength(10);
      expect(ready.preview.warnings.some(w=>w.rule==="double_booking"&&w.bookingIds.includes(ids[0]!)&&w.bookingIds.includes(ids[1]!))).toBe(true);
      const group=receipt.groups.find(g=>g.rule==="over_capacity"&&g.bookingIds.includes(ids[0]!)&&g.bookingIds.includes(ids[1]!)&&g.bookingIds.includes(ids[2]!));
      expect(group).toBeDefined();expect(group!.keys.length).toBeGreaterThan(1);
      expect(ready.preview.warnings.some(w=>w.bookingIds.some(id=>!ids.includes(id)))).toBe(true);
      const before=await realSeriesSnapshot(fx);
      const unrelated={...ready.input,editorReview:{...ready.input.editorReview,decision:{...ready.input.editorReview.decision,selectedLogicalIds:["unrelated-group"]}}};
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:unrelated})).toMatchObject({ok:false});
      expect(await realSeriesSnapshot(fx)).toEqual(before);
      const args={p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:input.commandId,p_input:seriesCommandPayload(input)};
      const snapshot=await snapshotBookingSeries(fx.adminClient,args);if(snapshot.kind!=="snapshot")throw new Error("Expected actual snapshot");
      const plan=planBookingSeries(snapshot,input);const partial=receipt.groups.map(g=>g.logicalId===group!.logicalId?{...g,keys:g.keys.slice(0,1)}:g);const groups=JSON.stringify(partial),body=JSON.stringify({...plan,groups:partial});
      const denied=await fx.adminClient.rpc("finalize_booking_series",{...args,p_claims:snapshot.claims,p_plan:body,p_signature:signSeries(SERIES_ATTESTATION_DOMAIN,snapshot.claims,body,key.secret),p_review_claims:snapshot.claims,p_review_groups:groups,p_review_signature:signSeries(SERIES_REVIEW_DOMAIN,snapshot.claims,groups,key.secret),p_decision:{...ready.input.editorReview.decision,selectedLogicalIds:[group!.logicalId]}});
      expect(denied.error?.code).toBe("42501");expect(await realSeriesSnapshot(fx)).toEqual(before);
      const selected={...ready.input,editorReview:{...ready.input.editorReview,decision:{...ready.input.editorReview.decision,selectedLogicalIds:[group!.logicalId]}}};
      const calls:string[]=[];const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{calls.push(name);return target.rpc(name,args);};return Reflect.get(target,key);}});
      expect(await runCommand(createBookingSeries,{client:client as never,input:selected})).toMatchObject({ok:true});
      expect(calls.filter(n=>n==="finalize_booking_series")).toHaveLength(1);expect(calls.some(n=>["create_booking","update_booking","finalize_booking_editor","finalize_booking_conflicts"].includes(n))).toBe(false);
      const accepted=await adminQuery("select * from public.booking_conflicts where tenant_id=$1 and natural_key=any($2::text[]) order by natural_key",[fx.base.tenantA.id,group!.keys]);
      expect(accepted).toHaveLength(group!.keys.length);expect(accepted.every(r=>r.status==="accepted"&&r.acceptance_reason===selected.editorReview.decision.reason&&r.accepted_by_membership_id===fx.adminProfile.membershipId&&r.accepted_at!==null)).toBe(true);
      expect(await adminQuery("select natural_key from public.booking_conflicts where tenant_id=$1 and status='accepted' order by natural_key",[fx.base.tenantA.id])).toEqual([...group!.keys].sort().map(natural_key=>({natural_key})));
      const same={...input,commandId:crypto.randomUUID(),sourceSeriesId:input.seriesId,expectedVersion:1,template:{...input.template,description:"Description only"}};
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,same)).input})).toMatchObject({ok:true});
      expect(await adminQuery("select * from public.booking_conflicts where tenant_id=$1 and natural_key=any($2::text[]) order by natural_key",[fx.base.tenantA.id,group!.keys])).toEqual(accepted);
      const changed={...same,commandId:crypto.randomUUID(),expectedVersion:2,rule:{...same.rule,startTime:"09:00:00",endTime:"10:00:00"}};
      const next=await reviewRealSeries(fx,changed);const changedGroup=openSeriesReceipt(next.preview.receipt,key.secret).groups.find(g=>g.rule===group!.rule&&g.bookingIds.join()===group!.bookingIds.join()&&g.startsAt===group!.startsAt);
      // Capacity's full-local-day identity is unchanged by same-day clock movement;
      // change demand participants by shortening the finite rule instead.
      expect(changedGroup?.keys).toEqual(group!.keys);
      const shortened={...changed,rule:{...changed.rule,count:1}};const reviewShort=await reviewRealSeries(fx,shortened);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:reviewShort.input})).toMatchObject({ok:true});
      expect(await adminQuery("select natural_key from public.booking_conflicts where tenant_id=$1 and natural_key=any($2::text[])",[fx.base.tenantA.id,group!.keys])).toEqual([]);
      expect((await adminQuery<{status:string}>("select status from public.booking_conflicts where tenant_id=$1 and status!='resolved'",[fx.base.tenantA.id])).every(r=>r.status==="open")).toBe(true);
      const committedBefore=await realSeriesSnapshot(fx);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:{...selected,editorReview:{...selected.editorReview,decision:{...selected.editorReview.decision,reason:"Changed same command"}}}})).toMatchObject({ok:false,code:"COMMAND_CONFLICT"});
      expect(await realSeriesSnapshot(fx)).toEqual(committedBefore);
    });
  });
  test("15.2-INT-REAL-013 incompatible split commands serialize with one successor and unchanged UUIDs",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:5}});
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,original)).input})).toMatchObject({ok:true});
      const ids=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      const attempts=await Promise.all([1,3].map(async index=>(await reviewRealSeries(fx,realSeriesInput(fx,{sourceSeriesId:original.seriesId,expectedVersion:1,pivotOccurrenceId:ids[index]!.id,rule:{...original.rule,startDate:`2026-10-${12+index}`}}))).input));
      let pending:Promise<unknown>[]=[];
      await adminSession(async({query})=>{await query("begin");try{
        const [blocker]=await query<{pid:number}>("select pg_backend_pid() pid,pg_advisory_xact_lock(hashtextextended($1,0))",[fx.base.tenantA.id]);
        pending=attempts.map(input=>runCommand(updateBookingSeries,{client:fx.adminClient as never,input}));await waitForBlocked(blocker.pid,2);await query("commit");
      }catch(error){await query("rollback");await Promise.allSettled(pending);throw error;}});
      const results=await Promise.all(pending) as {ok:boolean;code?:string;data?:{successorSeriesId:string}}[];
      expect(results.filter(r=>r.ok)).toHaveLength(1);expect(results.filter(r=>!r.ok)).toEqual([{ok:false,code:"PREVIEW_STALE",message:expect.any(String)}]);
      const winner=results.find(r=>r.ok)!.data!.successorSeriesId;
      expect(await adminQuery("select id from public.bookings where tenant_id=$1 order by nominal_date",[fx.base.tenantA.id])).toEqual(ids);
      const chain=await adminQuery("select id,predecessor_id,successor_id from public.booking_series where tenant_id=$1 order by id",[fx.base.tenantA.id]);
      expect(chain).toHaveLength(2);expect(chain.find(s=>s.id===original.seriesId)).toMatchObject({successor_id:winner});expect(chain.find(s=>s.id===winner)).toMatchObject({predecessor_id:original.seriesId});
    });
  });
  test("15.2-INT-REAL-014 exact replay ignores expired receipt and changed historical metadata",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const ready=await reviewRealSeries(fx,realSeriesInput(fx));const result=await runCommand(createBookingSeries,{client:fx.adminClient as never,input:ready.input});expect(result).toMatchObject({ok:true});
      const key=bookingConflictKeyFromEnv(),receipt=openSeriesReceipt(ready.preview.receipt,key.secret);
      const expired=sealSeriesReceipt({...receipt,claims:{...receipt.claims,issuedAt:"2020-01-01T00:00:00Z",expiresAt:"2020-01-01T00:01:00Z"}},key.secret);
      await adminQuery("update public.person_profiles set employment_percentage=75 where id=$1",[fx.ownProfile.id]);
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:{...ready.input,editorReview:{...ready.input.editorReview,receipt:expired}}})).toEqual(result);
      expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-011 complete per-job facts preserve independent null/empty semantics and invalidate current review",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const parents=await seedBookingParents(fx.base.tenantA.id);const ids=Array.from({length:3},()=>crypto.randomUUID()).sort();
      for(let index=0;index<3;index++)await adminQuery("insert into public.jobs(id,tenant_id,customer_id,title,required_roles_recorded,access_windows_recorded) values($1,$2,$3,$4,$5,$6)",[ids[index],fx.base.tenantA.id,parents.customerId,`Job facts ${index}`,index!==0,index!==1]);
      await adminQuery("insert into public.job_required_work_roles(tenant_id,job_id,work_role_id) values($1,$2,$3)",[fx.base.tenantA.id,ids[2],parents.workRoleId]);
      await adminQuery("insert into public.job_access_windows(tenant_id,job_id,starts_at,ends_at) values($1,$2,'2026-10-20T06:00:00Z','2026-10-20T08:00:00Z')",[fx.base.tenantA.id,ids[2]]);
      const base=realSeriesInput(fx);
      expect(await bookingCommand("create",fx.adminClient,{...base.template,assigneeIds:[...base.template.assigneeIds],commandId:crypto.randomUUID(),jobId:ids[0]!})).toMatchObject({ok:true});
      expect(await bookingCommand("create",fx.adminClient,{...base.template,assigneeIds:[...base.template.assigneeIds],commandId:crypto.randomUUID(),startsAt:"2026-10-16T05:00:00Z",endsAt:"2026-10-16T06:00:00Z",jobId:null})).toMatchObject({ok:true});
      const args={p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:base.commandId,p_input:seriesCommandPayload(base)};
      const snapshot=await snapshotBookingSeries(fx.adminClient,args);if(snapshot.kind!=="snapshot")throw new Error("Expected full production facts");
      expect(snapshot.claims).toMatchObject({engineVersion:"booking-conflicts-v3",configVersion:"stockholm-capacity-v1"});
      expect(snapshot.facts.detection.jobInputs).toEqual([
        {jobId:ids[0],requiredWorkRoleIds:null,accessWindows:[]},
        {jobId:ids[1],requiredWorkRoleIds:[],accessWindows:null},
        {jobId:ids[2],requiredWorkRoleIds:[parents.workRoleId],accessWindows:[{startsAt:"2026-10-20T06:00:00.000000Z",endsAt:"2026-10-20T08:00:00.000000Z"}]},
      ]);
      expect(snapshot.facts.detection.bookings.some(b=>b.jobId===ids[0])).toBe(true);expect(snapshot.facts.detection.bookings.some(b=>b.jobId===null)).toBe(true);
      const [{digest}]=await adminQuery<{digest:string}>("select encode(extensions.digest(public.booking_series_facts_internal($1)::text,'sha256'),'hex') digest",[fx.base.tenantA.id]);
      expect(snapshot.claims.factDigest).toBe(digest);
      for(const [jobId,expected] of [[ids[0],true],[ids[1],false],[null,false]] as const){
        const input={...base,commandId:crypto.randomUUID(),seriesId:crypto.randomUUID(),template:{...base.template,jobId}};
        const ready=await reviewRealSeries(fx,input);
        expect(ready.preview.warnings.some(w=>w.rule==="outside_access_window")).toBe(expected);
      }
      const ready=await reviewRealSeries(fx,base);
      await adminQuery("insert into public.job_access_windows(tenant_id,job_id,starts_at,ends_at) values($1,$2,'2026-10-12T05:00:00Z','2026-10-12T06:00:00Z')",[fx.base.tenantA.id,ids[0]]);
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:ready.input})).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-010 genuine verified single/card proofs cannot authorize a series batch",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const parents=await seedBookingParents(fx.base.tenantA.id);let donor:Record<string,unknown>|null=null;
      const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{
        const result=await target.rpc(name,args);if(name==="finalize_job_card"&&!result.error&&result.data?.kind==="committed")donor=args;return result;
      };return Reflect.get(target,key);}});
      expect(await runCommand(createJobCard,{client:client as never,input:{commandId:crypto.randomUUID(),type:"order",title:"Genuine card proof donor",customer_id:parents.customerId,facility_id:parents.facilityId,contact_id:parents.contactId,
        priority:"normal",estimated_duration_minutes:null,planned_travel_minutes:null,crew_size:null,earliest_date:null,desired_date:null,latest_date:null,planned_start_date:null,planned_end_date:null,
        customer_presence_required:false,responsible_project_manager_id:null,locationOverride:null,requiredWorkRoleIds:null,accessWindows:null,dependencyJobIds:[]}})).toMatchObject({ok:true});
      expect(donor).not.toBeNull();
      const input=realSeriesInput(fx);const ready=await reviewRealSeries(fx,input);const key=bookingConflictKeyFromEnv();
      const singleId=crypto.randomUUID();const single=await previewBookingEditor(fx.adminClient,{p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:crypto.randomUUID(),p_proposed_id:singleId,p_payload:input.template});
      expect(openEditorReceipt(single.receipt,key.secret).bookingId).toBe(singleId);
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:{...ready.input,editorReview:{...ready.input.editorReview,receipt:single.receipt}}})).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});
      expect(await realSeriesSnapshot(fx)).toEqual(before);
      const args={p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:input.commandId,p_input:seriesCommandPayload(input)};
      const snapshot=await snapshotBookingSeries(fx.adminClient,args);if(snapshot.kind!=="snapshot")throw new Error("Expected current batch snapshot");
      const plan=planBookingSeries(snapshot,input),groups=JSON.stringify(plan.groups);
      const borrowed=donor as unknown as Record<string,unknown>;
      const result=await fx.adminClient.rpc("finalize_booking_series",{...args,p_claims:borrowed.p_claims,p_plan:borrowed.p_output,p_signature:borrowed.p_signature,
        p_review_claims:snapshot.claims,p_review_groups:groups,p_review_signature:signSeries(SERIES_REVIEW_DOMAIN,snapshot.claims,groups,key.secret),p_decision:ready.input.editorReview.decision});
      expect(result.error?.code).toBe("42501");expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-007 reached audit failure rolls back series, every row, derived conflicts, selected acceptance and outcome",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const input=realSeriesInput(fx);const ready=await reviewRealSeries(fx,input);
      const selected={...ready.input,editorReview:{...ready.input.editorReview,decision:{...ready.input.editorReview.decision,selectedLogicalIds:[ready.preview.warnings[0]!.logicalId]}}};
      const correlationId=crypto.randomUUID();let reached=false;
      const client=new Proxy(fx.adminClient,{get(target,key){if(key==="rpc")return async(name:string,args:Record<string,unknown>)=>{
        const result=await target.rpc(name,args);if(name==="finalize_booking_series"&&result.error?.code==="P0001"&&result.error.message==="test-only forced audit failure")reached=true;return result;
      };return Reflect.get(target,key);}});
      const before=await realSeriesSnapshot(fx);
      await adminQuery("insert into test_support.forced_audit_failures(correlation_id) values($1)",[correlationId]);
      try{expect(await runCommand(createBookingSeries,{client:client as never,input:selected,correlationId})).toMatchObject({ok:false,code:"SERVER_ERROR"});
        expect(reached).toBe(true);expect(await realSeriesSnapshot(fx)).toEqual(before);
      }finally{await adminQuery("delete from test_support.forced_audit_failures where correlation_id=$1",[correlationId]);}
    });
  });
  test("15.2-INT-REAL-008 identical concurrent commands reach real tenant gate and write one outcome/audit",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const ready=await reviewRealSeries(fx,realSeriesInput(fx));let pending:Promise<unknown>[]=[];
      await adminSession(async({query})=>{
        await query("begin");try{
          const [blocker]=await query<{pid:number}>("select pg_backend_pid() pid,pg_advisory_xact_lock(hashtextextended($1,0))",[fx.base.tenantA.id]);
          pending=[runCommand(createBookingSeries,{client:fx.adminClient as never,input:ready.input}),runCommand(createBookingSeries,{client:fx.adminClient as never,input:ready.input})];
          await waitForBlocked(blocker.pid,2);await query("commit");
        }catch(error){await query("rollback");await Promise.allSettled(pending);throw error;}
      });
      const results=await Promise.all(pending);expect(results[0]).toMatchObject({ok:true});expect(results[1]).toEqual(results[0]);
      const [count]=await adminQuery<{series:number;bookings:number;audit:number;outcomes:number}>(`select
        (select count(*)::int from public.booking_series where tenant_id=$1) series,
        (select count(*)::int from public.bookings where tenant_id=$1) bookings,
        (select count(*)::int from public.audit_events where tenant_id=$1 and command='createBookingSeries') audit,
        (select count(*)::int from public.booking_series s,jsonb_object_keys(s.outcomes) k where tenant_id=$1) outcomes`,[fx.base.tenantA.id]);
      expect(count).toEqual({series:1,bookings:3,audit:1,outcomes:1});
    });
  });
  test("15.2-INT-REAL-009 manager revoked while waiting on tenant gate loses fresh-write and replay authority",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    for(const replay of [false,true])await withBookingFixture(async fx=>{
      const ready=await reviewRealSeries(fx,realSeriesInput(fx),{client:fx.plannerClient,actorId:fx.users.projektledare.id});let pending:Promise<unknown>|null=null;
      if(replay)expect(await runCommand(createBookingSeries,{client:fx.plannerClient as never,input:ready.input})).toMatchObject({ok:true});
      const before=await realSeriesSnapshot(fx);
      await adminSession(async({query})=>{
        await query("begin");try{
          const [blocker]=await query<{pid:number}>("select pg_backend_pid() pid,pg_advisory_xact_lock(hashtextextended($1,0))",[fx.base.tenantA.id]);
          pending=runCommand(createBookingSeries,{client:fx.plannerClient as never,input:ready.input});await waitForBlocked(blocker.pid,1);
          await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",[fx.base.tenantA.id,fx.users.projektledare.id]);
          await query("commit");
        }catch(error){await query("rollback");if(pending)await pending;throw error;}
      });
      expect(await pending).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-006 repeated prefix split inserts bounded lineage and invalidates prior successor review",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:5}});
      const first=await reviewRealSeries(fx,original);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:first.input})).toMatchObject({ok:true});
      const ids=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      const split=realSeriesInput(fx,{sourceSeriesId:original.seriesId,expectedVersion:1,pivotOccurrenceId:ids[3]!.id,rule:{...original.rule,startDate:"2026-10-15"}});
      const next=await reviewRealSeries(fx,split);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:next.input})).toMatchObject({ok:true});
      const priorRows=await adminQuery("select * from public.bookings where series_id=$1 order by id",[split.seriesId]);
      const successorEdit=await reviewRealSeries(fx,realSeriesInput(fx,{seriesId:split.seriesId,sourceSeriesId:split.seriesId,expectedVersion:1,rule:{...original.rule,startDate:"2026-10-15",count:2}}));
      const repeated=realSeriesInput(fx,{sourceSeriesId:original.seriesId,expectedVersion:2,pivotOccurrenceId:ids[1]!.id,rule:{...original.rule,startDate:"2026-10-13"}});
      const ready=await reviewRealSeries(fx,repeated);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:ready.input})).toMatchObject({ok:true,data:{occurrenceIds:ids.slice(1,3).map(r=>r.id)}});
      const chain=await adminQuery<{id:string;predecessor_id:string|null;successor_id:string|null;ends_before:string|null;version:number}>("select id,predecessor_id,successor_id,ends_before::text,version from public.booking_series where tenant_id=$1",[fx.base.tenantA.id]);
      expect(chain.find(s=>s.id===original.seriesId)).toMatchObject({ends_before:"2026-10-13",successor_id:repeated.seriesId});
      expect(chain.find(s=>s.id===repeated.seriesId)).toMatchObject({predecessor_id:original.seriesId,ends_before:"2026-10-15",successor_id:split.seriesId});
      expect(chain.find(s=>s.id===split.seriesId)).toMatchObject({predecessor_id:repeated.seriesId,version:2});
      expect(await adminQuery("select * from public.bookings where series_id=$1 order by id",[split.seriesId])).toEqual(priorRows);
      expect(await adminQuery("select id from public.bookings where tenant_id=$1 order by nominal_date",[fx.base.tenantA.id])).toEqual(ids);
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:successorEdit.input})).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-002 exception, tombstone and split use nominal pivot and preserve UUIDs",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const initial=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:5}});
      const first=await reviewRealSeries(fx,initial);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:first.input})).toMatchObject({ok:true});
      const rows=await adminQuery<{id:string;nominal_date:string}>("select id,nominal_date::text from public.bookings where series_id=$1 order by nominal_date",[initial.seriesId]);
      for(const [index,status] of [[0,"planned"],[3,"cancelled"]] as const){
        const result=await bookingCommand("update",fx.adminClient,{...initial.template,assigneeIds:[...initial.template.assigneeIds],commandId:crypto.randomUUID(),bookingId:rows[index]!.id,
          description:`Protected ${index}`,status});
        expect(result).toMatchObject({ok:true});
      }
      const [{version}]=await adminQuery<{version:number}>("select version from public.booking_series where id=$1",[initial.seriesId]);
      const split=realSeriesInput(fx,{sourceSeriesId:initial.seriesId,expectedVersion:version,pivotOccurrenceId:rows[2]!.id,
        rule:{...initial.rule,startDate:"2026-10-14"},template:{...initial.template,description:"Successor default"}});
      const reviewed=await reviewRealSeries(fx,split);
      const committed=await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:reviewed.input});
      expect(committed,JSON.stringify(committed)).toMatchObject({ok:true,data:{seriesId:initial.seriesId,successorSeriesId:split.seriesId,occurrenceIds:rows.slice(2).map(r=>r.id)}});
      const after=await adminQuery<{id:string;series_id:string;nominal_date:string;is_exception:boolean;status:string;description:string}>("select id,series_id,nominal_date::text,is_exception,status,description from public.bookings where tenant_id=$1 order by nominal_date",[fx.base.tenantA.id]);
      expect(after.map(r=>r.id)).toEqual(rows.map(r=>r.id));
      expect(after.slice(0,2).every(r=>r.series_id===initial.seriesId)).toBe(true);
      expect(after.slice(2).every(r=>r.series_id===split.seriesId)).toBe(true);
      expect(after[0]).toMatchObject({description:"Protected 0",is_exception:true,status:"planned"});
      expect(after[3]).toMatchObject({description:"Protected 3",is_exception:true,status:"cancelled"});
      const before=await realSeriesSnapshot(fx);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:reviewed.input})).toEqual(committed);
      expect(await realSeriesSnapshot(fx)).toEqual(before);
      const stale=realSeriesInput(fx,{sourceSeriesId:initial.seriesId,expectedVersion:version,pivotOccurrenceId:rows[2]!.id});
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:stale})).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-003 omitted ordinary slots become permanent tombstones and omitted exceptions survive",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx);const first=await reviewRealSeries(fx,original);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:first.input})).toMatchObject({ok:true});
      const rows=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      expect(await bookingCommand("update",fx.adminClient,{...original.template,assigneeIds:[...original.template.assigneeIds],commandId:crypto.randomUUID(),bookingId:rows[1]!.id,description:"Retained omitted exception"})).toMatchObject({ok:true});
      const [{version}]=await adminQuery<{version:number}>("select version from public.booking_series where id=$1",[original.seriesId]);
      const change=realSeriesInput(fx,{seriesId:original.seriesId,sourceSeriesId:original.seriesId,expectedVersion:version,rule:{...original.rule,count:1}});
      const reviewed=await reviewRealSeries(fx,change);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:reviewed.input})).toMatchObject({ok:true});
      const after=await adminQuery<{id:string;status:string;is_exception:boolean;description:string}>("select id,status,is_exception,description from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      expect(after.map(r=>r.id)).toEqual(rows.map(r=>r.id));
      expect(after[1]).toMatchObject({description:"Retained omitted exception",is_exception:true,status:"planned"});
      expect(after[2]).toMatchObject({is_exception:true,status:"cancelled"});
      const [{version:nextVersion}]=await adminQuery<{version:number}>("select version from public.booking_series where id=$1",[original.seriesId]);
      const restore=await reviewRealSeries(fx,{...change,commandId:crypto.randomUUID(),expectedVersion:nextVersion,rule:original.rule});
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:restore.input})).toMatchObject({ok:true});
      expect(await adminQuery("select id,status,is_exception,description from public.bookings where series_id=$1 order by nominal_date",[original.seriesId])).toEqual(after);
    });
  });
  test("15.2-INT-REAL-004 real batch proof bytes match SQL and signed cross-binding mutations roll back",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      expect([...CONFLICT_CLAIM_FIELDS]).toEqual(["tenantId","actorId","operation","commandId","bookingId","candidateDigest","factDigest","engineVersion","configVersion","correlationId","keyId","issuedAt","expiresAt"]);
      const input=realSeriesInput(fx);const correlationId=crypto.randomUUID();
      const standalone=await bookingCommand("create",fx.adminClient,{...input.template,assigneeIds:[...input.template.assigneeIds],commandId:crypto.randomUUID(),description:"Existing standalone ID cannot be rebound"});
      expect(standalone).toMatchObject({ok:true});if(!standalone.ok)throw new Error("Expected actual standalone fixture");
      const args={p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:correlationId,p_command_id:input.commandId,p_input:seriesCommandPayload(input)};
      const snapshot=await snapshotBookingSeries(fx.adminClient as unknown as BookingRpcClient,args);
      if(snapshot.kind!=="snapshot")throw new Error("Expected fresh production snapshot");
      const plan=planBookingSeries(snapshot,input);const key=bookingConflictKeyFromEnv();
      const body=JSON.stringify(plan);
      const [{bytes}]=await adminQuery<{bytes:Buffer}>("select public.booking_series_proof_bytes_internal($1,$2,$3) bytes",[SERIES_ATTESTATION_DOMAIN,snapshot.claims,body]);
      expect(Buffer.from(seriesProofBytes(SERIES_ATTESTATION_DOMAIN,snapshot.claims,body))).toEqual(Buffer.from(bytes));
      expect(SERIES_ATTESTATION_DOMAIN).not.toBe("elpro.booking-conflicts.attestation.v1");expect(SERIES_REVIEW_DOMAIN).not.toBe("elpro.booking-editor.review.v1");
      const decision={acknowledged:true,reviewedLogicalIds:plan.groups.map(g=>g.logicalId),selectedLogicalIds:[],reason:"Reviewed complete groups"};
      const before=await realSeriesSnapshot(fx);
      for(const review of [{p_review_claims:null,p_review_groups:null,p_review_signature:null},{p_review_claims:snapshot.claims,p_review_groups:JSON.stringify(plan.groups),p_review_signature:null}]){
        const missing=await fx.adminClient.rpc("finalize_booking_series",{...args,p_claims:snapshot.claims,p_plan:body,p_signature:signSeries(SERIES_ATTESTATION_DOMAIN,snapshot.claims,body,key.secret),...review,p_decision:decision});
        expect(missing.error?.code).toBe("BR428");expect(await realSeriesSnapshot(fx)).toEqual(before);
      }
      for(const field of ["tenantId","actorId","operation","commandId","seriesId","candidateDigest","factDigest","engineVersion","configVersion"] as const){
        const claims={...snapshot.claims,[field]:"incorrect-binding"};const groups=JSON.stringify(plan.groups);
        const result=await fx.adminClient.rpc("finalize_booking_series",{...args,p_claims:claims,p_plan:body,p_signature:signSeries(SERIES_ATTESTATION_DOMAIN,claims,body,key.secret),p_review_claims:claims,p_review_groups:groups,p_review_signature:signSeries(SERIES_REVIEW_DOMAIN,claims,groups,key.secret),p_decision:decision});
        expect(result.error!==null||result.data?.kind==="stale").toBe(true);
        expect(await realSeriesSnapshot(fx)).toEqual(before);
      }
      const broken={...plan,output:plan.output.map((row,index)=>index?row:{...row,related_booking_id:crypto.randomUUID()})};
      const brokenBody=JSON.stringify(broken),groups=JSON.stringify(plan.groups);
      const bad=await fx.adminClient.rpc("finalize_booking_series",{...args,p_claims:snapshot.claims,p_plan:brokenBody,p_signature:signSeries(SERIES_ATTESTATION_DOMAIN,snapshot.claims,brokenBody,key.secret),p_review_claims:snapshot.claims,p_review_groups:groups,p_review_signature:signSeries(SERIES_REVIEW_DOMAIN,snapshot.claims,groups,key.secret),p_decision:decision});
      expect(bad.error).not.toBeNull();expect(await realSeriesSnapshot(fx)).toEqual(before);
      const rebound={...plan,rows:plan.rows.map((row,index)=>index?row:{...row,id:standalone.data.bookingId})};const reboundBody=JSON.stringify(rebound);
      const reboundResult=await fx.adminClient.rpc("finalize_booking_series",{...args,p_claims:snapshot.claims,p_plan:reboundBody,p_signature:signSeries(SERIES_ATTESTATION_DOMAIN,snapshot.claims,reboundBody,key.secret),p_review_claims:snapshot.claims,p_review_groups:groups,p_review_signature:signSeries(SERIES_REVIEW_DOMAIN,snapshot.claims,groups,key.secret),p_decision:decision});
      expect(reboundResult.error).toMatchObject({code:"42501",message:"booking denied"});expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-005 complete warnings beyond ten and current metadata invalidation prevent stale save",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const input=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:12}});const reviewed=await reviewRealSeries(fx,input);
      expect(reviewed.preview.total).toBe(12);expect(reviewed.preview.occurrences).toHaveLength(10);
      expect(reviewed.preview.warnings.some(w=>!reviewed.preview.occurrences.some(row=>w.bookingIds.includes(row.id)))).toBe(true);
      const before=await realSeriesSnapshot(fx);
      for(const decision of [{...reviewed.input.editorReview!.decision,acknowledged:false},{...reviewed.input.editorReview!.decision,reason:" "},{...reviewed.input.editorReview!.decision,reviewedLogicalIds:reviewed.input.editorReview!.decision.reviewedLogicalIds.slice(0,10)}]){
        expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:{...reviewed.input,editorReview:{receipt:reviewed.preview.receipt,decision}}})).toMatchObject({ok:false});
        expect(await realSeriesSnapshot(fx)).toEqual(before);
      }
      await adminQuery("update public.person_profiles set employment_percentage=50 where id=$1",[fx.ownProfile.id]);
      const changed=await realSeriesSnapshot(fx);
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:reviewed.input})).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect(await realSeriesSnapshot(fx)).toEqual(changed);
    });
  });
  test("15.2-INT-REAL-001 full materialization and authorized exact replay preserve every durable row", async ctx => {
    if (skipUnlessStack(ctx, realStackUp)) return;
    await withBookingFixture(async fx => {
      const input: BookingSeriesInput = { commandId: crypto.randomUUID(), seriesId: crypto.randomUUID(), sourceSeriesId: null,
        expectedVersion: null, pivotOccurrenceId: null,
        rule: { preset: "daily", startDate: "2026-10-12", startTime: "07:00:00", endTime: "08:00:00", endDayOffset: 0, allDay: false, timeZone: "Europe/Stockholm", count: 3 },
        template: { startsAt: "2026-10-12T05:00:00.000000Z", endsAt: "2026-10-12T06:00:00.000000Z", allDay: false,
          workRoleId: null, jobId: null, customerId: null, facilityId: null, contactId: null, description: "Real recurring lighting",
          status: "planned", assigneeIds: [fx.ownProfile.id], seriesId: null, occurrenceIndex: null, isException: false } };
      const preview = await previewBookingSeries(fx.adminClient as unknown as BookingRpcClient, { p_tenant_id: fx.base.tenantA.id,
        p_actor_id: fx.base.adminA.id, p_correlation_id: crypto.randomUUID(), p_command_id: input.commandId, p_input: seriesCommandPayload(input) }, input);
      expect(preview.total).toBe(3);
      const reviewed = { ...input, editorReview: { receipt: preview.receipt, decision: { acknowledged: preview.warnings.length > 0,
        reviewedLogicalIds: preview.warnings.map(w => w.logicalId), selectedLogicalIds: [], reason: preview.warnings.length ? "Reviewed all actual warnings" : "" } } };
      const correlationId = crypto.randomUUID();
      const result = await runCommand(createBookingSeries, { client: fx.adminClient as never, input: reviewed, correlationId });
      expect(result, JSON.stringify(result)).toMatchObject({ ok: true });
      const rows = await adminQuery<{ id: string; nominal_date: string; series_id: string }>("select id,nominal_date::text,series_id from public.bookings where tenant_id=$1 order by nominal_date", [fx.base.tenantA.id]);
      expect(rows.map(r => r.nominal_date)).toEqual(["2026-10-12", "2026-10-13", "2026-10-14"]);
      expect(rows.every(r => r.series_id === input.seriesId)).toBe(true);
      expect(await adminQuery("select count(*)::int total from public.booking_assignees where tenant_id=$1",[fx.base.tenantA.id])).toEqual([{total:3}]);
      const before = await bookingSnapshot(fx.tenantIds);
      const seriesBefore = await adminQuery("select * from public.booking_series where tenant_id=$1", [fx.base.tenantA.id]);
      expect(await runCommand(createBookingSeries, { client: fx.adminClient as never, input: reviewed, correlationId: crypto.randomUUID() })).toEqual(result);
      expect(await bookingSnapshot(fx.tenantIds)).toEqual(before);
      expect(await adminQuery("select * from public.booking_series where tenant_id=$1", [fx.base.tenantA.id])).toEqual(seriesBefore);
      expect(await runCommand(createBookingSeries, { client: fx.adminClient as never, input: { ...reviewed, template: { ...reviewed.template, description: "Changed under same command" } } })).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
      expect(await runCommand(createBookingSeries, { client: fx.adminClient as never, input: { ...reviewed, rule: { ...reviewed.rule, count: 4 } } })).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
      expect(await bookingSnapshot(fx.tenantIds)).toEqual(before);
    });
  });
});

describe("15.2 Round1 checked integrity regressions",()=>{
  test("15.2-INT-REAL-020 archived role retention belongs only to unchanged protected exceptions and tombstones",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const parents=await seedBookingParents(fx.base.tenantA.id),replacement=crypto.randomUUID();
      await adminQuery("insert into public.work_roles(id,tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,$2,'Replacement',20000,40000)",[replacement,fx.base.tenantA.id]);
      const original=realSeriesInput(fx,{template:{...realSeriesInput(fx).template,workRoleId:parents.workRoleId}});
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,original)).input})).toMatchObject({ok:true});
      const rows=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      for(const [index,status] of [[0,'planned'],[1,'cancelled']] as const)expect(await bookingCommand("update",fx.adminClient,{...original.template,assigneeIds:[...original.template.assigneeIds],commandId:crypto.randomUUID(),bookingId:rows[index]!.id,status,description:`Protected ${index}`})).toMatchObject({ok:true});
      await adminQuery("update public.work_roles set is_active=false where id=$1 and tenant_id=$2",[parents.workRoleId,fx.base.tenantA.id]);
      const projection="select id,work_role_id,description,status,is_exception,nominal_date::text from public.bookings where id=any($1::uuid[]) order by id";
      const protectedBefore=await adminQuery(projection,[rows.slice(0,2).map(r=>r.id)]);
      const [{version}]=await adminQuery<{version:number}>("select version from public.booking_series where id=$1",[original.seriesId]);
      const update=realSeriesInput(fx,{seriesId:original.seriesId,sourceSeriesId:original.seriesId,expectedVersion:version,rule:original.rule,template:{...original.template,workRoleId:replacement,description:'New active defaults'}});
      const ready=await reviewRealSeries(fx,update);
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:ready.input})).toMatchObject({ok:true});
      expect(await adminQuery(projection,[rows.slice(0,2).map(r=>r.id)])).toEqual(protectedBefore);
      expect(await adminQuery("select work_role_id from public.bookings where id=$1",[rows[2]!.id])).toEqual([{work_role_id:replacement}]);
      const before=await realSeriesSnapshot(fx),newInactive=await reviewRealSeries(fx,realSeriesInput(fx,{template:original.template}));
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:newInactive.input})).toMatchObject({ok:false,code:'TENANT_ACCESS_DENIED'});
      expect(await realSeriesSnapshot(fx)).toEqual(before);
    });
  });
  test("15.2-INT-REAL-021 successor lower bound rejects requested rules and signed extra rows without writes",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:4}});
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,original)).input})).toMatchObject({ok:true});
      const rows=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      const split=realSeriesInput(fx,{sourceSeriesId:original.seriesId,expectedVersion:1,pivotOccurrenceId:rows[2]!.id,rule:{...original.rule,startDate:'2026-10-14'}});
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,split)).input})).toMatchObject({ok:true});
      const valid=realSeriesInput(fx,{seriesId:split.seriesId,sourceSeriesId:split.seriesId,expectedVersion:1,rule:{...original.rule,startDate:'2026-10-14',count:2}});
      const before=await realSeriesSnapshot(fx),bad={...valid,rule:{...valid.rule,startDate:'2026-10-12'}};
      await expect(reviewRealSeries(fx,bad)).rejects.toMatchObject({code:'VALIDATION_FAILED'});expect(await realSeriesSnapshot(fx)).toEqual(before);
      const {deriveSeriesConflicts,seriesOccurrenceId}=await import('@/server/bookings/series-conflicts');
      for(const variant of ['requested-rule','complete-row'] as const){
        const input={...(variant==='requested-rule'?bad:valid),commandId:crypto.randomUUID()};
        const args={p_tenant_id:fx.base.tenantA.id,p_actor_id:fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:input.commandId,p_input:seriesCommandPayload(input)};
        const snapshot=await snapshotBookingSeries(fx.adminClient as unknown as BookingRpcClient,args);if(snapshot.kind!=='snapshot')throw new Error('Expected actual current snapshot');
        // Test-owned signer emulates an obsolete/incorrect server planner; actual JWT and SQL must still deny it.
        const legacy=structuredClone(snapshot);legacy.facts.series.find(s=>s.id===split.seriesId)!.predecessorId=null;
        let plan=planBookingSeries(legacy,input);
        if(variant==='complete-row'){
          const extra={id:seriesOccurrenceId(split.seriesId,'2026-10-13'),nominalDate:'2026-10-13',isException:false,payload:{...input.template,startsAt:'2026-10-13T05:00:00.000000Z',endsAt:'2026-10-13T06:00:00.000000Z'},seriesId:split.seriesId,index:2};
          const changed=[...plan.rows,extra];plan={...plan,rows:changed,...deriveSeriesConflicts(snapshot.facts.detection,changed)};
        }
        const body=JSON.stringify(plan),groups=JSON.stringify(plan.groups),key=bookingConflictKeyFromEnv();
        const decision={acknowledged:plan.groups.length>0,reviewedLogicalIds:plan.groups.map(g=>g.logicalId),selectedLogicalIds:[],reason:plan.groups.length?'Reviewed current groups':''};
        const result=await fx.adminClient.rpc('finalize_booking_series',{...args,p_claims:snapshot.claims,p_plan:body,p_signature:signSeries(SERIES_ATTESTATION_DOMAIN,snapshot.claims,body,key.secret),p_review_claims:snapshot.claims,p_review_groups:groups,p_review_signature:signSeries(SERIES_REVIEW_DOMAIN,snapshot.claims,groups,key.secret),p_decision:decision});
        expect(result.error).toMatchObject({code:'42501',message:'booking proof denied'});expect(await realSeriesSnapshot(fx)).toEqual(before);
      }
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,{...valid,commandId:crypto.randomUUID(),template:{...valid.template,description:'Valid bounded edit'}})).input})).toMatchObject({ok:true});
      expect(await adminQuery("select id from public.bookings where series_id=$1 and nominal_date<'2026-10-14'",[split.seriesId])).toEqual([]);
    });
  });
  test("15.2-INT-REAL-022 moved pivot checked split preserves nominal ownership and exact exception instants",async ctx=>{
    if(skipUnlessStack(ctx,realStackUp))return;
    await withBookingFixture(async fx=>{
      const original=realSeriesInput(fx,{rule:{...realSeriesInput(fx).rule,count:5}});
      expect(await runCommand(createBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,original)).input})).toMatchObject({ok:true});
      const rows=await adminQuery<{id:string}>("select id from public.bookings where series_id=$1 order by nominal_date",[original.seriesId]);
      expect(await bookingCommand('update',fx.adminClient,{...original.template,assigneeIds:[...original.template.assigneeIds],commandId:crypto.randomUUID(),bookingId:rows[2]!.id,startsAt:'2026-10-12T05:00:00.123456Z',endsAt:'2026-10-12T06:00:00.654321Z',description:'Moved pivot'})).toMatchObject({ok:true});
      const exact="select id,description,status,is_exception,nominal_date::text,to_char(starts_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') starts_at,to_char(ends_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') ends_at from public.bookings where id=$1";
      const before=await adminQuery(exact,[rows[2]!.id]);
      const split=realSeriesInput(fx,{sourceSeriesId:original.seriesId,expectedVersion:2,pivotOccurrenceId:rows[2]!.id,rule:{...original.rule,startDate:'2026-10-14'}});
      expect(await runCommand(updateBookingSeries,{client:fx.adminClient as never,input:(await reviewRealSeries(fx,split)).input})).toMatchObject({ok:true});
      expect(await adminQuery(exact,[rows[2]!.id])).toEqual(before);
      expect(await adminQuery("select id,series_id from public.bookings where tenant_id=$1 order by nominal_date",[fx.base.tenantA.id])).toEqual(rows.map((r,i)=>({id:r.id,series_id:i<2?original.seriesId:split.seriesId})));
    });
  });
});
