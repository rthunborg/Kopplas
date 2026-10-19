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
