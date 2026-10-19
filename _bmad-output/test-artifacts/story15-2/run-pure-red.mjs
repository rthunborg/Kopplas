/**
 * Bounded, pure Story15.2 RED probe. Never edits canonical skipped tests.
 * Usage: node <this file> scaffolds | activate
 * API/RLS/browser tests are deliberately never loaded by this probe.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, resolve, relative } from "node:path";
import { createHash } from "node:crypto";
const root = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
const output = fileURLToPath(new URL("./", import.meta.url));
const git = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", windowsHide: true });
if (git.status !== 0) throw new Error("Cannot record source revision");
const mode = process.argv[2];
if (!["scaffolds", "activate"].includes(mode)) throw new Error("Expected scaffolds or activate");
const sources = [
  "tests/unit/features/scheduling/recurrence.test.ts",
  "tests/unit/features/resources/booking-series-state.test.ts",
];
await mkdir(join(output, "red-activation"), { recursive: true });
const runnable = []; const provenance = [];
for (const source of sources) {
  const original = await readFile(join(root, source), "utf8");
  provenance.push({ source, sha256: createHash("sha256").update(original).digest("hex") });
  if (mode === "scaffolds") { runnable.push(source); continue; }
  const activated = original.replaceAll("test.skip(", "test(")
    .replaceAll('"../../../support/booking-series-unit-atdd"', '"../../../../tests/support/booking-series-unit-atdd"')
    .replaceAll('"../../../fixtures/golden/scheduling/recurrence.json"', '"../../../../tests/fixtures/golden/scheduling/recurrence.json"');
  const target = join(output, "red-activation", source.split("/").at(-1));
  await writeFile(target, activated, "utf8"); runnable.push(relative(root, target));
}
const args = ["--experimental-strip-types", "--import", "./tests/support/register.mjs", "--test",
  "--test-reporter=tap", ...runnable];
const child = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8", timeout: 30_000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
const text = (child.stdout ?? "") + (child.stderr ?? "");
await writeFile(join(output, mode + ".tap"), text, "utf8");
const count = (key) => Number(text.match(new RegExp("^# " + key + " (\\d+)$", "m"))?.[1] ?? -1);
const receipt = {
  mode, sourceHead: git.stdout.trim(),
  executable: process.execPath, args, nativeExitCode: child.status,
  signal: child.signal, launchError: child.error?.message ?? null,
  tests: count("tests"), pass: count("pass"), fail: count("fail"), skipped: count("skipped"),
  provenance, errorCodes: [...new Set([...text.matchAll(/code: '(.*?)'/g)].map(match => match[1]))],
  coverageClaim: mode === "activate"
    ? "Pure cases executed and failed at missing production module binding. No behavioral assertions reached; no acceptance pass."
    : "Pure scaffold collection only; skipped bodies earn zero acceptance coverage.",
};
await writeFile(join(output, mode + "-receipt.json"), JSON.stringify(receipt, null, 2) + "\n", "utf8");
process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
process.exitCode = child.status ?? 1;

