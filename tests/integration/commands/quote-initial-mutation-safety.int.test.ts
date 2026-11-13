/** 35.8-P P-4: initial quote retries retain original review authority/capture.
 * Local-only real commands. Wire-key spelling may follow the implementation helper;
 * no assertion permits recapture, new correlation, or renewed review authority.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminQuery } from "../../factories/admin-sql";
import { adminSelectAuditEvents } from "../../factories/audit-events";
import {
  createTwoTenantFixture, cleanupFixture, makeAuthedServerClient,
  adminInsertCustomer, adminInsertCalculation, adminInsertSection, adminInsertRow,
  type TwoTenantFixture, type TestServerClient,
} from "../../factories/tenants";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";
import { buildQuoteReviewProof } from "../../support/quote-review-proof";
import { runCommand } from "@/server/commands/envelope";
import { createQuoteVersionFromCalculation } from "@/server/commands/quotes";

let up = false;
let fixture: TwoTenantFixture;
let actor: TestServerClient;
const capturedAt = "2026-11-13T10:00:00.000Z";
beforeAll(async () => {
  up = await isLocalStackReachable();
  if (!up) return;
  fixture = await createTwoTenantFixture();
  actor = await makeAuthedServerClient(fixture.adminA);
});
afterAll(async () => { if (up && fixture) await cleanupFixture(fixture); });

async function originalIntent() {
  const tenant = fixture.tenantA.id;
  const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: "Initial safety source" });
  const calc = await adminInsertCalculation({ tenant_id: tenant, customer_id: customer, title: "Reviewed original" });
  const section = await adminInsertSection({ tenant_id: tenant, calculation_id: calc, title: "Arbete" });
  await adminInsertRow({ tenant_id: tenant, section_id: section, unit_cost_ore: 2000, unit_sell_ore: 10000, quantity: 1, vat_rate_bp: 2500 });
  const reviewed = await buildQuoteReviewProof(actor, { calculationId: calc, capturedAt });
  const operation = crypto.randomUUID();
  return { operation, calc, input: {
    calculation_id: calc, attachment_file_ids: [], ...reviewed,
    operation_id: operation,
    expected: { version: 1, form: "reviewed-initial-quote", ...reviewed, attachment_file_ids: [] },
  } };
}
function interruptedClient(mode: "before-create" | "after-create") {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  let interrupted = false;
  const client = new Proxy(actor, { get(target, key) {
    if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      if (name === "create_calculation_editor_quote" && mode === "before-create" && !interrupted) {
        interrupted = true;
        throw new Error("synthetic transport loss before create dispatch");
      }
      const response = await target.rpc(name, args);
      if (name === "create_calculation_editor_quote" && mode === "after-create" && !response.error && !interrupted) {
        interrupted = true;
        throw new Error("synthetic transport loss after database commit");
      }
      return response;
    };
    const value = Reflect.get(target, key);
    return typeof value === "function" ? value.bind(target) : value;
  } });
  return { client, calls, wasInterrupted: () => interrupted };
}

describe("35.8-P initial quote original review operation", () => {
  it("P-4 prepared retry uses original authorization/capture/correlation and read-only reconciliation changes nothing", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await originalIntent();
    const fault = interruptedClient("before-create");
    const lost = await runCommand(createQuoteVersionFromCalculation, {
      client: fault.client as never, input: s.input, correlationId: s.operation, clock: { now: () => new Date(capturedAt) },
    });
    expect(fault.wasInterrupted()).toBe(true);
    expect(lost.ok).toBe(false);
    const original = await adminQuery("select * from public.quote_review_authorizations where correlation_id=$1", [s.operation]);
    expect(original).toHaveLength(1);
    expect(original[0].consumed_at).toBeNull();
    const before = await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation]);
    expect(before).toEqual([expect.objectContaining({ status: "prepared" })]);
    const observed = await actor.rpc("reconcile_calculation_editor_operation", { p_operation_id: s.operation });
    expect(observed.error).toBeNull();
    expect(observed.data).toMatchObject({ status: "unconfirmed" });
    expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation])).toEqual(before);

    // A different command clock cannot recapture the prepared quote or replace its
    // original review date. This is a replay of the original request, not a review.
    const replay = await runCommand(createQuoteVersionFromCalculation, {
      client: actor as never, input: s.input, correlationId: s.operation,
      clock: { now: () => new Date("2026-11-14T10:00:00.000Z") },
    });
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    const authorizations = await adminQuery("select id,captured_at,correlation_id,consumed_at from public.quote_review_authorizations where correlation_id=$1", [s.operation]);
    expect(authorizations).toHaveLength(1);
    expect(authorizations[0].id).toBe(original[0].id);
    expect(new Date(authorizations[0].captured_at as string).toISOString()).toBe(capturedAt);
    expect(authorizations[0].consumed_at).not.toBeNull();
    const versions = await adminQuery("select id,captured_at from public.quote_versions where calculation_id=$1", [s.calc]);
    expect(versions).toHaveLength(1);
    expect(versions[0].id).toBe(replay.data.targetId);
    expect(new Date(versions[0].captured_at as string).toISOString()).toBe(capturedAt);
    expect(await adminSelectAuditEvents({ correlationId: s.operation })).toHaveLength(1);
  });

  it("P-4 lost committed response replays exactly one quote/version/number with no fresh authority", async ctx => {
    if (skipUnlessStack(ctx, up)) return;
    const s = await originalIntent();
    const fault = interruptedClient("after-create");
    const lost = await runCommand(createQuoteVersionFromCalculation, {
      client: fault.client as never, input: s.input, correlationId: s.operation, clock: { now: () => new Date(capturedAt) },
    });
    expect(fault.wasInterrupted()).toBe(true);
    expect(lost.ok).toBe(false);
    const proof = await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation]);
    expect(proof).toEqual([expect.objectContaining({ status: "committed" })]);
    const replay = () => runCommand(createQuoteVersionFromCalculation, {
      client: actor as never, input: s.input, correlationId: s.operation, clock: { now: () => new Date("2026-11-14T10:00:00.000Z") },
    });
    const [one, two] = await Promise.all([replay(), replay()]);
    expect(one.ok).toBe(true);
    expect(two).toEqual(one);
    expect(await adminQuery("select id from public.quote_versions where calculation_id=$1", [s.calc])).toHaveLength(1);
    expect(await adminQuery("select id from public.quote_review_authorizations where correlation_id=$1", [s.operation])).toHaveLength(1);
    expect(await adminSelectAuditEvents({ correlationId: s.operation })).toHaveLength(1);
    expect(await adminQuery("select * from public.calculation_editor_operations where operation_id=$1", [s.operation])).toEqual(proof);
    const altered = await runCommand(createQuoteVersionFromCalculation, {
      client: actor as never, input: { ...s.input, reviewed_snapshot_digest: "0".repeat(64) }, correlationId: s.operation,
    });
    expect(altered.ok).toBe(false);
    expect(await adminQuery("select id from public.quote_versions where calculation_id=$1", [s.calc])).toHaveLength(1);
  });

  // These require the build's feature-local fixture / controlled SQL scheduling.
  // No weakening via transaction-start now(), fresh review, or skipped-as-pass.
  it.todo("P-4 two-connection authorization lock held across actual expiry: clock_timestamp after all locks refuses consume; no quote/event/audit");
  it.todo("P-4 checked terminal closure commits under operation lock before waiting creator wakes; creator rereads closed state and cannot consume");
  it.todo("P-4 expired/stale prepared reconcile is read-only unconfirmed; checked create alone commits closed no-domain-write proof");
  it.todo("P-4 revoked member/role/source and changed selected attachment deny prepared create/replay without recapture; committed historical proof grants no new authority");
  it.todo("P-4 current seller customer-visible projection excludes costs on prepare/reconcile/replay; existing Admin/PM authority and PDF provenance regressions remain unchanged");
});
