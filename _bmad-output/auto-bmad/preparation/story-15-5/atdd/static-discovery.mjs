/** Uses installed Vitest configuration with glob+staticParse only.
 * Unlike collectTests, this does not initialize globalSetup or execute suites.
 * Playwright --list is run separately and never starts its webServer/setup. */
import { createVitest } from "vitest/node";
import { relative } from "node:path";
import { writeFile } from "node:fs/promises";
const paths = ["tests/integration/commands/calendar-feed.int.test.ts",
  "tests/integration/calendar-feed/public-feed.int.test.ts",
  "tests/integration/rls/calendar-feed.rls.test.ts",
  "tests/integration/components/calendar-feed.test.ts"];
const runner = await createVitest("test", { root: process.cwd(), config: "vitest.config.ts", watch: false });
try {
  const specs = await runner.globTestSpecifications(paths);
  const normalize = value => relative(process.cwd(), value).replaceAll("\\", "/");
  const partitions = specs.map(spec => ({ path: normalize(spec.moduleId), project: spec.project.name }));
  const result = await runner.collect(paths, { staticParse: true });
  function summarize(node) {
    const children = node.children ? [...node.children].map(summarize) : [];
    return { name: node.name, type: node.type, children };
  }
  const summary = { mode: "STATIC glob and AST only; no globalSetup/runtime evidence", partitions,
    modules: result.testModules.map(summarize), errors: result.unhandledErrors.map(error => String(error)),
    serialEnrollment: "DEFERRED P5; current config still puts both new serial-intended files in parallel; all new tests remain skipped" };
  await writeFile("_bmad-output/auto-bmad/preparation/story-15-5/atdd/static-discovery.json", JSON.stringify(summary, null, 2) + "\n");
  process.stdout.write(JSON.stringify({ partitions, modules: summary.modules.length, errors: summary.errors }) + "\n");
  if (summary.errors.length || partitions.length !== 4) process.exitCode = 1;
} finally {
  await runner.close();
}
