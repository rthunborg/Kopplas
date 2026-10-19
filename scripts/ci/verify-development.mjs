import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The same checked-in package commands as the ordinary verify job. Database,
// recovery integrity and auth smoke run separately against disposable local stacks.
export const DEVELOPMENT_STEPS = Object.freeze([
  "verify:lockfiles",
  "verify:service-role-containment",
  "typecheck",
  "lint",
  "test:unit",
  "test:bmad-focused",
  "test:auto-bmad-focused",
  "build",
  "verify:bundle-containment",
]);

/**
 * @param {{ run?: (command: string, args: string[], options: import("node:child_process").SpawnSyncOptions) => {status: number | null, error?: Error}, cwd?: string, env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform }} [options]
 */
export function verifyDevelopment({ run = spawnSync, cwd = resolve(dirname(fileURLToPath(import.meta.url)), "../.."), env = process.env, platform = process.platform } = {}) {
  for (const step of DEVELOPMENT_STEPS) {
    console.log(`Development verification: ${step}`);
    // Arguments are fixed repository script names, never user or network input.
    // Windows requires the package-manager shim to be launched through cmd.exe.
    const result = run(platform === "win32" ? "pnpm.cmd" : "pnpm", ["run", step], {
      cwd, env, stdio: "inherit", shell: platform === "win32", windowsHide: true,
    });
    if (result.error || result.status !== 0) {
      console.error(`Development verification failed at ${step}.`);
      return result.status || 1;
    }
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = verifyDevelopment();
}
