/** Bounded no-resource native RED probe. Activates ONLY the source-presence
 * scenario in memory; tracked scaffolds remain skipped. No app is imported. */
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { spawnSync } from "node:child_process";
const file = "tests/unit/server/calendar-feed/public-shell.test.ts";
const source = await readFile(file, "utf8");
const activated = source.replace("test.skip(", "test(");
if (source === activated) throw new Error("Expected source-presence scaffold missing");
const javascript = stripTypeScriptTypes(activated, { mode: "strip" });
const result = spawnSync(process.execPath, ["--input-type=module", "--eval", javascript],
  { cwd: process.cwd(), timeout: 30_000, windowsHide: true, encoding: "utf8" });
if (result.error) throw result.error;
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exitCode = result.status ?? 2;
