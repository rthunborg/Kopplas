import assert from "node:assert/strict";
import { test } from "node:test";
import type { SpawnSyncOptions } from "node:child_process";
import { DEVELOPMENT_STEPS, verifyDevelopment } from "../../../../scripts/ci/verify-development.mjs";

test("development verification preserves containment order and fixed commands on Windows and Linux", () => {
  for (const platform of ["win32", "linux"] as const) {
    const calls: {command: string; args: string[]; options: SpawnSyncOptions}[] = [];
    const exit = verifyDevelopment({ platform, cwd: "fixture-checkout", run(command: string, args: string[], options: SpawnSyncOptions) {
      calls.push({command, args, options}); return {status: 0};
    } });
    assert.equal(exit, 0);
    assert.deepEqual(calls.map(call => call.args), DEVELOPMENT_STEPS.map(step => ["run", step]));
    assert.ok(DEVELOPMENT_STEPS.indexOf("build") < DEVELOPMENT_STEPS.indexOf("verify:bundle-containment"));
    assert.ok(calls.every(call => call.options.cwd === "fixture-checkout" && call.options.shell === (platform === "win32")));
    assert.ok(calls.every(call => call.command === (platform === "win32" ? "pnpm.cmd" : "pnpm")));
    assert.ok(calls.every(call => !("timeout" in call.options)));
  }
});

test("a failed check stops progression and preserves the failure code", () => {
  const calls: string[] = [];
  const exit = verifyDevelopment({ run(_command: string, args: string[]) {
    calls.push(args[1]); return {status: args[1] === "typecheck" ? 17 : 0};
  } });
  assert.equal(exit, 17);
  assert.deepEqual(calls, ["verify:lockfiles", "verify:service-role-containment", "typecheck"]);
});

test("launch failure and interrupted check fail closed before later gates", () => {
  for (const result of [{error: new Error("unavailable"), status: null}, {status: null, signal: "SIGTERM"}]) {
    let calls = 0;
    assert.equal(verifyDevelopment({ run() { calls++; return result; } }), 1);
    assert.equal(calls, 1);
  }
});
