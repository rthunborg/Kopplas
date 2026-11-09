import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

type HandshakeServer = {
  url: string;
  reuseExistingServer: boolean;
  env: Record<string, string>;
};
type SetupConfig = {
  webServer: HandshakeServer | null;
  metadata?: { jobEventsFaultServer: HandshakeServer };
};

const runnerPid = 41;
const serverPid = 42;
const now = 100_000;
const cwd = process.cwd();
const controlFile = path.resolve(cwd, "test-results/private/job-events-fetch-fault.json");
const handshakeFile = controlFile + ".startup.json";
const runId = "e5044f76-5bf2-4df4-8de1-6043f277bddd";
const proxyOrigin = "http://127.0.0.1:37922";
const applicationUrl = "http://127.0.0.1:3101";

function mockRequire(modules: Record<string, unknown>) {
  return (name: string) => {
    assert.ok(Object.hasOwn(modules, name), "Unexpected VM import " + name);
    return modules[name];
  };
}

function loadConfig() {
  const source = readFileSync("playwright.config.ts", "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = { default: undefined as {
    webServer: HandshakeServer[];
    metadata: NonNullable<SetupConfig["metadata"]>;
  } | undefined };
  runInNewContext(outputText, {
    exports,
    require: mockRequire({
      "@playwright/test": { defineConfig: (value: unknown) => value, devices: { "Desktop Chrome": {} } },
      "./tests/support/test-env": new Proxy({}, {
        get: (_, key) => key === "assertLocalStack" ? () => undefined : "fixture-" + String(key),
      }),
    }),
    process: { pid: runnerPid, env: { E2E_PORT: "3101", DASHBOARD_PROXY_PORT: "37922" } },
  });
  assert.ok(exports.default);
  return exports.default;
}

function fixture() {
  const boot = {
    schemaVersion: 1, runId, controlFile, ownerPid: runnerPid, serverPid,
    startedAt: now - 1000, origin: proxyOrigin, applicationUrl,
  };
  const env: Record<string, string> = {};
  const pidChecks: [number, number][] = [];
  const vmModule = { exports: undefined as ((config: SetupConfig) => Promise<void>) | undefined };
  runInNewContext(readFileSync("tests/support/job-events-fetch-fault.cjs", "utf8"), {
    module: vmModule,
    require: mockRequire({
      "node:fs": {
        lstatSync: (file: string) => {
          assert.equal(file, handshakeFile);
          return { isFile: () => true, isSymbolicLink: () => false, size: 256 };
        },
        readFileSync: (file: string) => {
          assert.equal(file, handshakeFile);
          return JSON.stringify(boot);
        },
      },
      "node:path": path,
      "node:crypto": {},
    }),
    Date: { now: () => now },
    URL,
    process: {
      pid: runnerPid, env, cwd: () => cwd, uptime: () => 30,
      kill: (pid: number, signal: number) => { pidChecks.push([pid, signal]); },
    },
  });
  assert.ok(vmModule.exports);
  return { boot, env, pidChecks, setup: vmModule.exports };
}

const configured = loadConfig();
function multiServerPublicConfig() {
  // Playwright retains metadata and sets the public webServer field to null
  // for a configured webServer array.
  return { webServer: null, metadata: structuredClone(configured.metadata) };
}

test("the setup hook binds the fresh Next boot through public multi-server metadata", async () => {
  assert.equal(configured.webServer.length, 2);
  const next = configured.webServer[1]!;
  const config = multiServerPublicConfig();
  assert.deepEqual(config.metadata, {
    jobEventsFaultServer: {
      url: next.url,
      reuseExistingServer: next.reuseExistingServer,
      env: {
        E2E_JOB_EVENTS_FETCH_FAULT_STARTUP: next.env.E2E_JOB_EVENTS_FETCH_FAULT_STARTUP,
        E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID: next.env.E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID,
        NEXT_PUBLIC_SUPABASE_URL: next.env.NEXT_PUBLIC_SUPABASE_URL,
      },
    },
  });

  const { env, pidChecks, setup } = fixture();
  await setup(config);
  assert.deepEqual(pidChecks, [[serverPid, 0]]);
  assert.deepEqual(env, {
    E2E_JOB_EVENTS_FETCH_FAULT_CONTROL: controlFile,
    E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID: runId,
  });
});

test("the setup hook still uses a singular webServer directly", async () => {
  const { env, pidChecks, setup } = fixture();
  const next = configured.webServer[1]!;
  await assert.rejects(setup({
    webServer: { ...next, reuseExistingServer: true },
    metadata: configured.metadata,
  }), /requires this runner's fresh server handshake/);
  assert.deepEqual(pidChecks, []);
  assert.deepEqual(env, {});
  await setup({ webServer: next });
  assert.deepEqual(pidChecks, [[serverPid, 0]]);
  assert.equal(env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID, runId);
});

type Mutation = (server: HandshakeServer, boot: ReturnType<typeof fixture>["boot"]) => void;
const invalidBoots: [string, Mutation][] = [
  ["metadata owner mismatch", server => { server.env.E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID = "99"; }],
  ["boot owner mismatch", (_, boot) => { boot.ownerPid = 99; }],
  ["stale boot", (_, boot) => { boot.startedAt = now - 30_001; }],
  ["proxy origin mismatch", (_, boot) => { boot.origin = "http://127.0.0.1:37923"; }],
  ["application URL mismatch", (_, boot) => { boot.applicationUrl = "http://127.0.0.1:3102"; }],
  ["server reuse", server => { server.reuseExistingServer = true; }],
];

for (const [name, mutate] of invalidBoots) {
  test("multi-server setup rejects " + name, async () => {
    const config = multiServerPublicConfig();
    const { boot, env, pidChecks, setup } = fixture();
    mutate(config.metadata.jobEventsFaultServer, boot);
    await assert.rejects(setup(config), /requires this runner's fresh server handshake/);
    assert.deepEqual(pidChecks, []);
    assert.deepEqual(env, {});
  });
}
