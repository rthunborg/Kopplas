/** Disposable GitHub-hosted runner only; local agents use resource-guard instead. */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { resolve, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";

export const PLAYWRIGHT_VERSION = "1.61.1";
export const PLAYWRIGHT_IMAGE = "mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48";
export const BROWSER_ENDPOINT = "ws://127.0.0.1:33171/";

/** @param {Record<string, string | undefined>} [env] @param {NodeJS.Platform} [platform] */
export function assertHostedRunner(env = process.env, platform = process.platform) {
  if (platform !== "linux" || env.CI !== "true" || env.GITHUB_ACTIONS !== "true" || env.RUNNER_ENVIRONMENT !== "github-hosted"
    || !/^\d+$/.test(env.GITHUB_RUN_ID ?? "") || !/^\d+$/.test(env.GITHUB_RUN_ATTEMPT ?? "") || !/^[a-zA-Z0-9_-]+$/.test(env.GITHUB_JOB ?? ""))
    throw new Error("Browser runtime requires a disposable GitHub-hosted Linux runner");
  return `${env.GITHUB_RUN_ID}:${env.GITHUB_RUN_ATTEMPT}:${env.GITHUB_JOB}`;
}

/** Explicit opt-in only; ordinary/local/fixed-executable configurations stay native. */
/** @param {Record<string, string | undefined>} [env] @param {NodeJS.Platform} [platform] */
export function ciBrowserConnectOptions(env = process.env, platform = process.platform) {
  if (!env.PW_TEST_CONNECT_WS_ENDPOINT) return undefined;
  assertHostedRunner(env, platform);
  if (env.PW_TEST_CONNECT_WS_ENDPOINT !== BROWSER_ENDPOINT) throw new Error("Browser endpoint must be the fixed CI loopback service");
  return { wsEndpoint: BROWSER_ENDPOINT, timeout: 15_000 };
}

export function browserContainerArgs(owner) {
  if (!/^\d+:\d+:[a-zA-Z0-9_-]+$/.test(owner)) throw new Error("Invalid browser owner");
  return ["create", "--init", "--network", "host", "--shm-size=1g", "--label", `kopplas.ci.browser-owner=${owner}`,
    "--name", `kopplas-browser-${owner.replaceAll(":", "-")}`, PLAYWRIGHT_IMAGE,
    "npx", "--yes", `playwright@${PLAYWRIGHT_VERSION}`, "run-server", "--host", "127.0.0.1", "--port", "33171"];
}

export function validateBrowserReceipt(receipt, owner, inspected) {
  if (receipt?.owner !== owner || !/^[a-f0-9]{64}$/.test(receipt?.containerId ?? "") || receipt.image !== PLAYWRIGHT_IMAGE
    || inspected?.Id !== receipt.containerId || inspected?.Config?.Labels?.["kopplas.ci.browser-owner"] !== owner
    || inspected?.Config?.Image !== PLAYWRIGHT_IMAGE) throw new Error("Browser resource ownership mismatch");
  return receipt.containerId;
}

async function main(mode) {
  const owner = assertHostedRunner();
  if (!process.env.RUNNER_TEMP || !isAbsolute(process.env.RUNNER_TEMP)) throw new Error("Missing runner temporary directory");
  // Playwright clears its outputDir before each run. Cleanup identity must live
  // outside that tree, including on test/build failure or multiple invocations.
  const receiptPath = join(process.env.RUNNER_TEMP, `browser-runtime-${process.env.GITHUB_JOB}.json`);
  const docker = (args, timeout = 30_000) => execFileSync("docker", args, { encoding: "utf8", timeout, stdio: ["ignore", "pipe", "pipe"] }).trim();
  if (mode === "stop") {
    // No resource was launched if setup failed before the durable identity receipt.
    let receipt;
    try { receipt = JSON.parse(readFileSync(receiptPath, "utf8")); } catch (error) { if (error.code === "ENOENT") return; throw error; }
    const inspected = JSON.parse(docker(["inspect", receipt.containerId]))[0];
    docker(["stop", "--time", "10", validateBrowserReceipt(receipt, owner, inspected)]);
    return;
  }
  if (mode !== "start") throw new Error("Use start or stop");
  const require = createRequire(import.meta.url);
  const installed = require("@playwright/test/package.json").version;
  if (installed !== PLAYWRIGHT_VERSION) throw new Error("Update the reviewed image/package pin when the Playwright lockfile changes");
  // Refuse an already-owned port; never connect to or stop its current owner.
  await new Promise((done, reject) => {
    const probe = createServer();
    probe.once("error", () => reject(new Error("Browser loopback port is already in use")));
    probe.listen(33171, "127.0.0.1", () => probe.close(error => error ? reject(error) : done()));
  });
  const started = Date.now();
  docker(["pull", PLAYWRIGHT_IMAGE], 240_000);
  const pulled = Date.now();
  const containerId = docker(browserContainerArgs(owner));
  if (!/^[a-f0-9]{64}$/.test(containerId)) throw new Error("Browser launch identity unavailable; inspect this runner before retrying");
  mkdirSync("test-results", { recursive: true });
  const receipt = { owner, containerId, image: PLAYWRIGHT_IMAGE, playwrightVersion: installed, pullMs: pulled - started, readyMs: null, browserVersion: null };
  writeFileSync(receiptPath, JSON.stringify(receipt) + "\n");
  // Persist exact identity before the container can run. A start timeout still
  // leaves the always-run stop step with authority over this exact container.
  validateBrowserReceipt(receipt, owner, JSON.parse(docker(["inspect", containerId]))[0]);
  docker(["start", containerId]);
  const { chromium } = await import("@playwright/test");
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    const inspected = JSON.parse(docker(["inspect", containerId]))[0];
    validateBrowserReceipt(receipt, owner, inspected);
    if (!inspected.State?.Running) throw new Error("Pinned browser service exited during startup");
    let browser;
    try {
      browser = await chromium.connect(BROWSER_ENDPOINT, { timeout: 1000 });
      receipt.browserVersion = browser.version();
      const page = await browser.newPage();
      await page.setContent("<title>CI browser readiness</title>");
      if (await page.title() !== "CI browser readiness") throw new Error("Browser readiness failed");
      ready = true;
      break;
    } catch { await new Promise(done => setTimeout(done, 1000)); }
    finally { await browser?.close(); }
  }
  if (!ready) throw new Error("Pinned browser service did not become ready within its bounded startup budget");
  receipt.readyMs = Date.now() - pulled;
  writeFileSync(receiptPath, JSON.stringify(receipt) + "\n");
  if (!process.env.GITHUB_ENV) throw new Error("Missing GitHub environment output");
  // Official Playwright Docker remote-connection interface. The ordinary and
  // fixed-browser configs keep their existing production server/test authority.
  const connect = ciBrowserConnectOptions({ ...process.env, PW_TEST_CONNECT_WS_ENDPOINT: BROWSER_ENDPOINT });
  appendFileSync(process.env.GITHUB_ENV, `PW_TEST_CONNECT_WS_ENDPOINT=${connect.wsEndpoint}\n`);
  console.log(JSON.stringify({ stage: "browser-runtime", image: PLAYWRIGHT_IMAGE, pullMs: receipt.pullMs, readyMs: receipt.readyMs }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
