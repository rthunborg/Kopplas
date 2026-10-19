import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { APP_TOKEN_PERMISSIONS, assertAppInstallationPermissions, collect } from "../../../scripts/pr-feedback/runtime.mjs";

test("installed write grants satisfy requested read scopes without broadening tokens", () => {
  assert.equal(assertAppInstallationPermissions({ permissions: APP_TOKEN_PERMISSIONS }), true);
  assert.equal(assertAppInstallationPermissions({ permissions: { ...APP_TOKEN_PERMISSIONS, actions: "write", actions_variables: "write", metadata: "read" } }), true);
  assert.equal(Object.isFrozen(APP_TOKEN_PERMISSIONS), true);
  assert.equal(APP_TOKEN_PERMISSIONS.actions, "read");
  assert.equal(APP_TOKEN_PERMISSIONS.actions_variables, "read");
  assert.equal(Object.hasOwn(APP_TOKEN_PERMISSIONS, "variables"), false);
  assert.equal(Object.hasOwn(APP_TOKEN_PERMISSIONS, "metadata"), false);
});

test("missing or weaker installation grants report only required scope names and levels", () => {
  assert.throws(() => assertAppInstallationPermissions({ permissions: { ...APP_TOKEN_PERMISSIONS, contents: "read", actions_variables: undefined } }), {
    message: "GitHub App installation lacks required permissions: contents:write, actions_variables:read",
  });
  for (const installation of [undefined, {}, { permissions: null }]) {
    assert.throws(() => assertAppInstallationPermissions(installation), {
      message: "GitHub App installation lacks required permissions: contents:write, pull_requests:write, issues:write, actions:read, actions_variables:read",
    });
  }
  const sentinel = "sensitive-response-must-not-appear";
  assert.throws(() => assertAppInstallationPermissions({ permissions: { ...APP_TOKEN_PERMISSIONS, actions_variables: sentinel, [sentinel]: sentinel }, token: sentinel, pem: sentinel }), {
    message: "GitHub App installation lacks required permissions: actions_variables:read",
  });
  assert.throws(() => assertAppInstallationPermissions({ permissions: { contents: "write", pull_requests: "write", issues: "write", actions: "read", variables: "write" } }), {
    message: "GitHub App installation lacks required permissions: actions_variables:read",
  });
});

test("hosted collector refuses missing scopes before requesting an installation token", async () => {
  const root = mkdtempSync(join(tmpdir(), "kopplas-pr-feedback-permissions-"));
  const previousEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  const sentinel = "credential-fixture-must-not-appear";
  try {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const eventPath = join(root, "event.json");
    writeFileSync(eventPath, "{}");
    Object.assign(process.env, {
      GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_REF: "refs/heads/main", GITHUB_SHA: "a".repeat(40),
      GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_EVENT_NAME: "schedule", GITHUB_EVENT_PATH: eventPath,
      GITHUB_TOKEN: sentinel, PR_FIX_ENABLED: "true", PR_FIX_PUBLISH: "false", PR_FIX_APP_ID: "600", PR_FIX_APP_USER_ID: "500",
      PR_FIX_APP_PRIVATE_KEY: privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
    });
    globalThis.fetch = async (input) => {
      const path = new URL(String(input)).pathname;
      calls.push(path);
      assert.equal(path, "/repos/rthunborg/Kopplas/installation");
      return new Response(JSON.stringify({ id: 700, permissions: { ...APP_TOKEN_PERMISSIONS, actions_variables: sentinel }, token: sentinel }), { status: 200 });
    };
    await assert.rejects(collect(join(root, "output")), { message: "GitHub App installation lacks required permissions: actions_variables:read" });
    assert.deepEqual(calls, ["/repos/rthunborg/Kopplas/installation"]);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in previousEnv)) delete process.env[key];
    Object.assign(process.env, previousEnv);
    rmSync(root, { recursive: true, force: true });
  }
});

test("representative installation permissions reach token mint using actions_variables only", async () => {
  const root = mkdtempSync(join(tmpdir(), "kopplas-pr-feedback-variable-scope-"));
  const previousEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  try {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const eventPath = join(root, "event.json");
    writeFileSync(eventPath, "{}");
    Object.assign(process.env, {
      GITHUB_REPOSITORY: "rthunborg/Kopplas", GITHUB_REF: "refs/heads/main", GITHUB_SHA: "a".repeat(40),
      GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_EVENT_NAME: "schedule", GITHUB_EVENT_PATH: eventPath,
      GITHUB_TOKEN: "read-token-fixture", PR_FIX_ENABLED: "true", PR_FIX_PUBLISH: "false", PR_FIX_APP_ID: "600", PR_FIX_APP_USER_ID: "500",
      PR_FIX_APP_PRIVATE_KEY: privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
    });
    globalThis.fetch = async (input, options) => {
      const path = new URL(String(input)).pathname;
      calls.push(path);
      if (path === "/repos/rthunborg/Kopplas/installation") {
        // Literal server-shaped fixture: deliberately independent of the request map.
        return new Response(JSON.stringify({ id: 700, permissions: { contents: "write", pull_requests: "write", issues: "write", actions: "read", actions_variables: "read", metadata: "read" } }), { status: 200 });
      }
      if (path === "/app/installations/700/access_tokens") {
        assert.equal(options?.method, "POST");
        assert.deepEqual(JSON.parse(String(options?.body)), {
          repositories: ["Kopplas"],
          permissions: { contents: "write", pull_requests: "write", issues: "write", actions: "read", actions_variables: "read" },
        });
        return new Response(JSON.stringify({ token: "installation-token-fixture" }), { status: 201 });
      }
      assert.equal(path, "/repos/rthunborg/Kopplas/pulls");
      return new Response("[]", { status: 200 });
    };
    assert.deepEqual(await collect(join(root, "output")), { eligible: false, dryRun: true });
    assert.deepEqual(calls, ["/repos/rthunborg/Kopplas/installation", "/app/installations/700/access_tokens", "/repos/rthunborg/Kopplas/pulls"]);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in previousEnv)) delete process.env[key];
    Object.assign(process.env, previousEnv);
    rmSync(root, { recursive: true, force: true });
  }
});
