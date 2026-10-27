// Portable regression: export only public tracked files, apply the patch, then
// execute the actual patched harness methods with a reload-to-today scenario.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const base = "40c2cfd53561171882ef9faf440a4a19b53f21e0";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const support = "tests/e2e/support/scheduling-views-atdd.ts";
const spec = "tests/e2e/scheduling-views.atdd.e2e.spec.ts";
const fixture = mkdtempSync(path.join(tmpdir(), "kopplas-e15-reload-"));
let original, repaired;
try {
  for (const relative of [support, spec]) {
    const source = execFileSync("git", ["show", `${base}:${relative}`], { cwd: root, encoding: "utf8" });
    const target = path.join(fixture, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
    if (relative === support) original = source;
  }
  // Git objects export LF, while a Windows checkout may materialize this patch
  // as CRLF. Normalize only the temporary patch text to that export boundary.
  const fixturePatch = path.join(fixture, "reload-context.patch");
  writeFileSync(fixturePatch, readFileSync(path.join(here, "e15-reload-context.patch"), "utf8").replace(/\r\n/g, "\n"));
  execFileSync("git", ["apply", "--check", fixturePatch], { cwd: fixture });
  execFileSync("git", ["apply", fixturePatch], { cwd: fixture });
  repaired = readFileSync(path.join(fixture, support), "utf8");
  // Compile both patched spec call sites too; this does not execute Playwright.
  for (const relative of [support, spec]) {
    const result = ts.transpileModule(readFileSync(path.join(fixture, relative), "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }, reportDiagnostics: true,
    });
    assert.equal(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
  }
} finally {
  // This exact directory was created above; never remove an inferred checkout.
  assert.equal(path.dirname(fixture), path.resolve(tmpdir()));
  assert.ok(path.basename(fixture).startsWith("kopplas-e15-reload-"));
  rmSync(fixture, { recursive: true });
}

function harnessFrom(source, host, startsLocal) {
  const ast = ts.createSourceFile(support, source, ts.ScriptTarget.Latest, true);
  const declaration = ast.statements.find(n => ts.isClassDeclaration(n) && n.name?.text === "SchedulingViewsHarness");
  assert.ok(declaration);
  const methods = ["open", "reloadAndOpen"].map(name => {
    const method = declaration.members.find(n => ts.isMethodDeclaration(n) && n.name.getText(ast) === name);
    assert.ok(method, name);
    return method.getText(ast);
  }).join("\n");
  const js = ts.transpileModule(`class Harness { ${methods} }`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  const Harness = new Function("expect", "DATE", "views", `${js}; return Harness;`)(
    () => ({ toBeVisible: async () => {} }), "2026-10-12", { Schema: "schema", Resurser: "resources" },
  );
  const events = [], state = { host, date: startsLocal.slice(0, 10), mode: "day" };
  const harness = new Harness();
  harness.settle = async () => { events.push("settle"); };
  harness.page = {
    url: () => "http://localhost/scheduling",
    reload: async () => {
      events.push("reload"); Object.assign(state, { host: "Schema", date: "2026-10-19", mode: "week" });
    },
    getByTestId: id => ({ click: async () => {
      events.push(id); state.host = id.endsWith("resources") ? "Resurser" : "Schema";
    } }),
    getByLabel: label => ({
      fill: async value => { assert.equal(label, "Datum"); events.push(`date:${value}`); state.date = value; },
      selectOption: async value => { assert.equal(label, "Period"); events.push(`mode:${value}`); state.mode = value; },
    }),
  };
  harness.block = id => {
    events.push(`block:${id}`);
    assert.deepEqual(state, { host, date: startsLocal.slice(0, 10), mode: "day" }, "booking hidden after reload-to-today");
    return { getByRole: (role, options) => ({ click: async () => {
      assert.equal(role, "button"); assert.equal(options.name, "Redigera / flytta"); events.push("edit");
    } }) };
  };
  return { harness, events, state };
}

test("pre-repair helper reproduces hidden booking after reload to another week", async () => {
  const { harness } = harnessFrom(original, "Resurser", "2026-10-12T14:30");
  await assert.rejects(harness.reloadAndOpen("booking"), /booking hidden after reload-to-today/);
});

for (const host of ["Schema", "Resurser"]) for (const startsLocal of ["2026-10-12T14:30", "2026-09-30T23:30"]) {
  test(`patched helper restores ${host} and interval date ${startsLocal} before edit`, async () => {
    const { harness, events } = harnessFrom(repaired, host, startsLocal);
    await harness.reloadAndOpen("booking", host, { startsLocal });
    assert.equal(events[0], "reload");
    assert.ok(events.indexOf(`date:${startsLocal.slice(0, 10)}`) < events.indexOf("block:booking"));
    assert.ok(events.indexOf("mode:day") < events.indexOf("block:booking"));
    assert.equal(events.at(-1), "edit");
  });
}

test("reload errors propagate without lookup, retries or fabricated success", async () => {
  const { harness, events } = harnessFrom(repaired, "Resurser", "2026-10-12T14:30");
  const failure = new Error("reload failed");
  harness.page.reload = async () => { throw failure; };
  await assert.rejects(harness.reloadAndOpen("booking", "Resurser", { startsLocal: "2026-10-12T14:30" }), error => error === failure);
  assert.deepEqual(events, []);
});

test("toolbar failure propagates before booking lookup", async () => {
  const { harness, events } = harnessFrom(repaired, "Resurser", "2026-10-12T14:30");
  const failure = new Error("toolbar unavailable");
  harness.page.getByTestId = () => ({ click: async () => { throw failure; } });
  await assert.rejects(harness.reloadAndOpen("booking", "Resurser", { startsLocal: "2026-10-12T14:30" }), error => error === failure);
  assert.ok(!events.some(event => event.startsWith("block:")));
});
