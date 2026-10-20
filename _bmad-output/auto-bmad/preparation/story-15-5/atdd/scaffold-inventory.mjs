import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";
const files = [
  "tests/integration/commands/calendar-feed.int.test.ts",
  "tests/integration/calendar-feed/public-feed.int.test.ts",
  "tests/integration/rls/calendar-feed.rls.test.ts",
  "tests/e2e/calendar-feed.e2e.spec.ts",
  "tests/integration/components/calendar-feed.test.ts",
  "tests/unit/features/calendar-feed/icalendar.test.ts",
  "tests/unit/features/calendar-feed/validation.test.ts",
  "tests/unit/features/calendar-feed/action-state.test.ts",
  "tests/unit/server/calendar-feed/attestation.test.ts",
  "tests/unit/server/calendar-feed/trusted-ip.test.ts",
  "tests/unit/server/calendar-feed/public-shell.test.ts",
];
const reports = [];
for (const path of files) {
  const source = await readFile(path, "utf8");
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  const declarations = [], violations = [];
  function walk(node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression.getText(ast);
      if (["test", "it", "test.only", "it.only", "test.todo", "it.todo"].includes(expression)) violations.push(expression);
      if (["test.skip", "it.skip"].includes(expression)) {
        const text = node.arguments[0]?.getText(ast) ?? "";
        declarations.push({ nameExpression: text, acs: [...new Set(text.match(/AC[1-9]/g) ?? [])],
          priority: text.match(/\[P[0-3]\]/)?.[0], parameterized: ts.isTemplateExpression(node.arguments[0]) });
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(ast);
  const kind = path.includes("/unit/") ? "unit" : path.includes("/components/") ? "component"
    : path.includes("/e2e/") ? "e2e" : path.includes("/rls/") ? "rls" : "serial-db-http";
  reports.push({ path, kind, lines: source.split("\n").length, declarations, violations });
}
const acMapping = Object.fromEntries(Array.from({ length: 9 }, (_, index) => {
  const ac = `AC${index + 1}`;
  return [ac, reports.flatMap(report => report.declarations.filter(item => item.acs.includes(ac)).map(item => ({ path: report.path, name: item.nameExpression })))];
}));
const byClass = Object.fromEntries([...new Set(reports.map(report => report.kind))].map(kind => [kind,
  reports.filter(report => report.kind === kind).reduce((sum, report) => sum + report.declarations.length, 0)]));
const result = { mode: "AST declaration inventory; parameterized cases are not inferred or credited as execution",
  reports, acMapping, declarationsByClass: byClass,
  totalDeclarations: reports.reduce((sum, report) => sum + report.declarations.length, 0),
  acceptanceAssertionsExecuted: 0, allAcceptanceUnproven: true,
  passed: reports.every(report => report.declarations.length && report.violations.length === 0) && Object.values(acMapping).every(rows => rows.length > 0) };
await writeFile("_bmad-output/auto-bmad/preparation/story-15-5/atdd/scaffold-inventory.json", JSON.stringify(result, null, 2) + "\n");
process.stdout.write(JSON.stringify({ declarationsByClass: byClass, totalDeclarations: result.totalDeclarations,
  mappedACs: Object.keys(acMapping).filter(ac => acMapping[ac].length), passed: result.passed }) + "\n");
if (!result.passed) process.exitCode = 1;
