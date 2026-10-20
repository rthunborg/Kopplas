import assert from "node:assert/strict";
import { test } from "node:test";

type Request = Readonly<{ attemptId: string; revision: number; action: "create" | "rotate" | "revoke" }>;
type State = { status: string; request: Request; rawUrl?: string; canMutate: boolean; requiresRotation?: boolean };
type StateDriver = { pending(request: Request): State; after(state: State, event: string, response?: Record<string, unknown>): State };
async function driver(): Promise<StateDriver> { throw new Error("15.5 RED: bind actual headless lifecycle state transitions"); }
const request = (): Request => Object.freeze({ attemptId: "b859aeee-90ec-4d6c-b6a3-a439c725a241", revision: 3, action: "rotate" });
// P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test.skip("[P0] 15.5-UNIT-009 AC2 lost response freezes same attempt/revision; no success or automatic new generation", async () => {
  const subject = await driver(), original = request();
  const uncertain = subject.after(subject.pending(original), "unknown");
  assert.equal(uncertain.status, "unknown"); assert.equal(uncertain.request, original);
  assert.equal(uncertain.canMutate, false); assert.equal(uncertain.rawUrl, undefined);
  const retry = subject.after(uncertain, "retry");
  assert.equal(retry.request, original); assert.equal(retry.canMutate, false);
  const deniedRetry = subject.after(retry, "denied");
  assert.equal(deniedRetry.status, "unknown"); assert.equal(deniedRetry.rawUrl, undefined);
});
// P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test.skip("[P0] 15.5-UNIT-010 AC1 AC2 reconciliation never recovers raw URL and requires explicit fresh rotation", async () => {
  const subject = await driver(), original = request();
  const unknown = subject.after(subject.pending(original), "unknown");
  const reconciled = subject.after(unknown, "reconciled-committed", { revision: 4, attemptId: original.attemptId });
  assert.equal(reconciled.rawUrl, undefined); assert.equal(reconciled.requiresRotation, true);
  assert.notEqual(reconciled.status, "fresh-issued");
  assert.equal(reconciled.request.attemptId, original.attemptId);
});
// P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test.skip("[P0] 15.5-UNIT-011 AC1 AC2 only confirmed current issuance exposes one-time URL; stale/revisit/revoke clears it", async () => {
  const subject = await driver(), pending = subject.pending(request());
  const url = "https://calendar.invalid/calendar/feed/" + Buffer.alloc(32, 7).toString("base64url");
  const issued = subject.after(pending, "confirmed-fresh", { revision: 4, attemptId: pending.request.attemptId, rawUrl: url });
  assert.equal(issued.rawUrl, url);
  for (const event of ["revisit", "revoked", "superseded-response"]) {
    assert.equal(subject.after(issued, event).rawUrl, undefined);
  }
  assert.equal(subject.after(pending, "stale-response", { revision: 2, rawUrl: url }).rawUrl, undefined);
});
