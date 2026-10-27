import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { PLAYWRIGHT_VERSION, PLAYWRIGHT_IMAGE, BROWSER_ENDPOINT, assertHostedRunner, ciBrowserConnectOptions, browserContainerArgs, validateBrowserReceipt } from "../../../../scripts/ci/browser-runtime.mjs";

const env = { CI: "true", GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_JOB: "e2e" };
const owner = "123:1:e2e";
test("image, server package and installed lockfile package match exactly", () => {
  assert.equal(createRequire(import.meta.url)("@playwright/test/package.json").version, PLAYWRIGHT_VERSION);
  assert.match(PLAYWRIGHT_IMAGE, new RegExp(`^mcr\\.microsoft\\.com/playwright:v${PLAYWRIGHT_VERSION.replaceAll(".", "\\.")}-noble@sha256:[a-f0-9]{64}$`));
  const args = browserContainerArgs(owner);
  assert.equal(args[args.indexOf("--host") + 1], "127.0.0.1");
  assert.ok(args.includes(`playwright@${PLAYWRIGHT_VERSION}`));
  assert.ok(args.includes(PLAYWRIGHT_IMAGE));
  assert.ok(!args.some(arg => /docker\.sock|--privileged|--volume|--rm|--ipc/.test(arg)));
});
test("remote browser configuration refuses local/foreign endpoints and leaves native runs unchanged", () => {
  assert.equal(ciBrowserConnectOptions({}, "win32"), undefined);
  assert.deepEqual(ciBrowserConnectOptions({ ...env, PW_TEST_CONNECT_WS_ENDPOINT: BROWSER_ENDPOINT }, "linux"), { wsEndpoint: BROWSER_ENDPOINT, timeout: 15_000 });
  for (const endpoint of ["ws://0.0.0.0:33171/", "ws://example.com/", "ws://127.0.0.1:33172/", "http://127.0.0.1:33171/"])
    assert.throws(() => ciBrowserConnectOptions({ ...env, PW_TEST_CONNECT_WS_ENDPOINT: endpoint }, "linux"));
  for (const key of Object.keys(env)) assert.throws(() => assertHostedRunner({ ...env, [key]: "" }, "linux"));
  assert.throws(() => ciBrowserConnectOptions({ ...env, PW_TEST_CONNECT_WS_ENDPOINT: BROWSER_ENDPOINT }, "win32"));
});
test("cleanup is restricted to this operation's exact container identity and image", () => {
  const receipt = { owner, containerId: "a".repeat(64), image: PLAYWRIGHT_IMAGE };
  const inspected = { Id: receipt.containerId, Config: { Image: PLAYWRIGHT_IMAGE, Labels: { "kopplas.ci.browser-owner": owner } } };
  assert.equal(validateBrowserReceipt(receipt, owner, inspected), receipt.containerId);
  assert.throws(() => validateBrowserReceipt(receipt, "124:1:e2e", inspected));
  assert.throws(() => validateBrowserReceipt(receipt, owner, { ...inspected, Id: "b".repeat(64) }));
  assert.throws(() => validateBrowserReceipt(receipt, owner, { ...inspected, Config: { ...inspected.Config, Image: "different" } }));
  assert.throws(() => validateBrowserReceipt(receipt, owner, { ...inspected, Config: { ...inspected.Config, Labels: {} } }));
});
