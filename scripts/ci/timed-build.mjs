/** Same production Next build, with a separate native timing receipt. */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function buildTiming(startMs, endMs, code, signal) {
  return { stage: "production-build", startedAt: new Date(startMs).toISOString(), durationMs: endMs - startMs, exitCode: code, signal: signal ?? null };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const start = Date.now();
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit", windowsHide: true });
  let done = false;
  for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => { if (!done) child.kill(signal); });
  const path = process.env.RUNNER_TEMP && /^[a-zA-Z0-9_-]+$/.test(process.env.GITHUB_JOB ?? "")
    ? join(process.env.RUNNER_TEMP, `build-timing-${process.env.GITHUB_JOB}.json`)
    : "playwright/.cache/build-timing.json";
  const finish = (code, signal) => {
    if (done) return;
    done = true;
    const receipt = buildTiming(start, Date.now(), code, signal);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(receipt) + "\n");
    console.log(JSON.stringify(receipt));
    process.exitCode = code === 0 && !signal ? 0 : code || 1;
  };
  child.once("error", () => finish(1, null));
  child.once("exit", finish);
}
