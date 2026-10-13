/**
 * Story20.3 RED. New server component prop 'link' is provisional and must be
 * reconciled with the author's readEntityDocumentsLink success projection.
 * Installed TypeScript renders actual TSX with the existing dashboard hook pattern.
 * Actual rendered React output is tested; source text is not behavioral proof.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createRequire, register } from "node:module";
import { pathToFileURL } from "node:url";
import { isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Matches tests/unit/components/dashboard/widget-state.test.ts; no shared edits.
let tsxReady = false;
function registerTsx(): void {
  if (tsxReady) return;
  const require = createRequire(import.meta.url);
  const compilerUrl = pathToFileURL(require.resolve("typescript")).href;
  const loader = [
    'import { readFile } from "node:fs/promises";',
    'import ts from ' + JSON.stringify(compilerUrl) + ';',
    'export async function load(url, context, nextLoad) {',
    ' if (!url.endsWith(".tsx")) return nextLoad(url, context);',
    ' const source = await readFile(new URL(url), "utf8");',
    ' const result = ts.transpileModule(source, { fileName: new URL(url).pathname,',
    ' compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } });',
    ' return { format: "module", source: result.outputText, shortCircuit: true };',
    '}',
  ].join("\n");
  register("data:text/javascript," + encodeURIComponent(loader), import.meta.url);
  tsxReady = true;
}

const OWNER = "00000000-0000-4000-8000-000000000001";
const href = "/files?module=crm&ownerType=customer&ownerId=" + OWNER;
const available = () => ({ state: "available", entitlements: { canOpenDocuments: true },
  data: { href, ref: { module: "crm", ownerType: "customer", ownerId: OWNER },
    ownerLabel: "Synthetic authorized customer", contextReturnHref: "/customers/" + OWNER } });

test.skip("[P1][AC1,4] successful server projection is a normal accessible local anchor", async () => {
  registerTsx();
  const path = "@/components/documents/EntityDocumentsLink";
  const { EntityDocumentsLink } = await import(path);
  const output = await EntityDocumentsLink({ link: available() });
  assert.ok(isValidElement(output));
  const element = output as ReactElement<{ href: string; children: string; target?: string; onClick?: unknown }>;
  assert.equal(element.type, "a");
  assert.equal(element.props.href, href);
  assert.equal(element.props.children, "Visa i Dokument");
  assert.equal(element.props.target, undefined);
  assert.equal(element.props.onClick, undefined);
  assert.match(renderToStaticMarkup(element), /^<a\b[^>]*>Visa i Dokument<\/a>$/);
});

for (const state of ["unavailable", "error"]) {
  test.skip("[P0][AC1,2] " + state + " renders no link label route or hidden projection", async () => {
    registerTsx();
  const path = "@/components/documents/EntityDocumentsLink";
    const { EntityDocumentsLink } = await import(path);
    const output = await EntityDocumentsLink({ link: { data: null, state,
      entitlements: { canOpenDocuments: false } } });
    assert.equal(output, null);
  });
}

test.skip("[P0][AC1,5] render only approved projection fields and no upload or storage capability", async () => {
  registerTsx();
  const path = "@/components/documents/EntityDocumentsLink";
  const { EntityDocumentsLink } = await import(path);
  const link = { ...available(), data: { ...available().data, signedUrl: "https://storage.example.test/private",
    bucket_id: "tenant-files", object_path: "private-object", rawSnapshot: { cost_ore: 765432109 },
    roles: ["tenant_admin"], uploadOwner: { ownerType: "quote_version", ownerId: OWNER } } };
  const output = await EntityDocumentsLink({ link });
  assert.ok(isValidElement(output));
  const html = renderToStaticMarkup(output);
  assert.doesNotMatch(html, /storage|private-object|tenant-files|765432109|tenant_admin|uploadOwner|rawSnapshot|Synthetic authorized/);
  assert.equal((output as ReactElement<{ href: string }>).props.href, href);
});
