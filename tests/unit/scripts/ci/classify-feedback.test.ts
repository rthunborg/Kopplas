import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyFeedback, changedPaths } from "../../../../scripts/ci/classify-feedback.mjs";

test("documentation-only feedback omits the browser add-on without granting reduced required coverage", () => {
  assert.deepEqual(classifyFeedback(["docs/quality/test.md", "_bmad-output/report.json"]), { scope: "documentation-only", entryUi: false, reason: "documentation-only", requiredCoverage: "unchanged" });
});
for (const path of ["src/components/crm/CustomerTypeBadge.tsx", "src/app/(auth)/login/page.tsx", "src/app/globals.css", "src/components/app-shell/NavIcon.tsx", "src/server/db/supabase-browser-client.ts", "src/features/crm/types.ts", "src/scope/manifest.ts", "supabase/migrations/schema.sql", "package.json", "pnpm-lock.yaml", "next.config.ts", ".github/workflows/ci.yml", "tests/support/tenants/core.ts", "unknown", "docs/script.mjs"])
  test(`unknown, shared, sensitive or transitive path keeps broad coverage: ${path}`, () => {
    assert.equal(classifyFeedback([path]).scope, "broad");
    assert.equal(classifyFeedback(["docs/only.md", path]).entryUi, true);
    assert.equal(classifyFeedback([path]).requiredCoverage, "unchanged");
  });
test("missing, malformed and empty diffs fail toward broader feedback", () => {
  for (const paths of [[], [""], ["../secret"], ["/absolute"], ["docs/a.md\nsrc/code.ts"], ["docs\\a.md"]]) assert.equal(classifyFeedback(paths).scope, "broad");
});
test("immutable NUL-delimited diff retains both sides of rename/deletion and does not shell-evaluate paths", () => {
  const paths = changedPaths("a".repeat(40), "b".repeat(40), (command, args, options) => {
    assert.equal(command, "git");
    assert.deepEqual(args, ["diff", "--no-renames", "--name-only", "-z", `${"a".repeat(40)}...${"b".repeat(40)}`]);
    assert.equal(options.encoding, "utf8");
    return "src/removed.ts\0docs/renamed.md\0";
  });
  assert.equal(classifyFeedback(paths).scope, "broad");
  assert.throws(() => changedPaths("main", "b".repeat(40)));
});
