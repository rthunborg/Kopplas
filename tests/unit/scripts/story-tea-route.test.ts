import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test, type TestContext } from "node:test";
import { fileURLToPath } from "node:url";

const helper = fileURLToPath(new URL("../../../scripts/quality/story-tea-route.py", import.meta.url));
const plannerPath = ".agents/skills/auto-bmad/scripts/story_plan.py";
const planner = readFileSync(new URL(`../../../${plannerPath}`, import.meta.url), "utf8").replaceAll("\r\n", "\n");
const evidenceRoot = "_bmad-output/test-artifacts";
const branch = "codex/story-tea-fixture";
const specContent = "---\nstatus: ready-for-dev\n---\n# Approved fixture\n";
const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

function git(cwd: string, ...args: string[]) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return result.stdout.trim();
}

function put(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

type RouteResult = {
  ok: boolean;
  error?: string;
  story_key: string;
  output_path: string;
  output_absolute: string;
  evidence_header: string;
  artifact_sha256?: string;
  changed_test_sha256?: Record<string, string>;
};

function fixture(t: TestContext) {
  const temporary = realpathSync(mkdtempSync(join(tmpdir(), "kopplas-story-tea-")));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const root = join(temporary, "story checkout");
  mkdirSync(root);
  git(root, "init", "--initial-branch", branch);
  git(root, "config", "core.autocrlf", "false");
  put(join(root, plannerPath), planner);

  function commit() {
    git(root, "add", "--all");
    git(root, "-c", "user.name=TEA Fixture", "-c", "user.email=tea@example.test",
      "-c", "commit.gpgsign=false", "commit", "--no-verify", "-qm", "Fixture");
    return git(root, "rev-parse", "HEAD");
  }

  function stories(folderName: string, id: string) {
    const spec_folder = `_bmad-output/specs/${folderName}`;
    const spec_path = `${spec_folder}/stories/${id}-approved-fixture.md`;
    const story_key = `spec-${folderName.replace(/^spec-/, "")}-${id}`;
    const docs = {
      [`${spec_folder}/SPEC.md`]: "# Test evidence fixture\n",
      [`${spec_folder}/stories.yaml`]: `- id: "${id}"\n  title: Approved fixture\n  description: Synthetic acceptance test fixture\n  spec_checkpoint: false\n  done_checkpoint: true\n`,
    };
    for (const [path, content] of Object.entries(docs)) put(join(root, path), content);
    put(join(root, spec_path), specContent);
    return {
      spec_path, story_key,
      source: {
        spec_folder, story_id: id, story_key, position: 0, spec_checkpoint: false, done_checkpoint: true,
        files: Object.entries(docs).map(([path, content]) => ({ path, sha256: sha256(content) })),
      },
    };
  }

  function route(revision: string, story_key: string) {
    return {
      schema_version: 1, route: "sequential", checkout: root, branch, story_key,
      planner_revision: revision, planner_sha256: sha256(planner), phases: ["atdd", "automate"],
      phase_test_paths: { atdd: [], automate: [] },
    };
  }

  function execute(operation: "resolve" | "verify", descriptor: object, revision: string, options: {
    phase?: string; checkout?: string; receipt?: RouteResult; assignment?: string; routeHash?: string;
  } = {}) {
    const routePath = join(temporary, "route.json");
    const routeData = JSON.stringify(descriptor);
    put(routePath, routeData);
    const args = ["-I", "-B", helper, operation, "--route", routePath,
      "--route-sha256", options.routeHash ?? sha256(routeData), "--checkout", options.checkout ?? root,
      "--phase", options.phase ?? "atdd", "--revision", revision];
    if (options.receipt) {
      const receipt = join(temporary, "pre-phase.json");
      put(receipt, JSON.stringify(options.receipt));
      args.push("--receipt", receipt);
    }
    if (options.assignment) args.push("--assignment", options.assignment);
    const result = spawnSync("python", args, { cwd: temporary, encoding: "utf8" });
    assert.ifError(result.error);
    assert.ok(result.stdout, result.stderr);
    const record = JSON.parse(result.stdout) as RouteResult;
    assert.equal(result.status, record.ok ? 0 : 1, result.stderr);
    return record;
  }

  return { temporary, root, commit, stories, route, execute };
}

function refused(result: RouteResult, reason: RegExp) {
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", reason);
}

test("story planner resolves disjoint sequential phase paths and verifies a retained ATDD receipt", (t) => {
  const f = fixture(t);
  const alpha = f.stories("spec-alpha", "1-1");
  const beta = f.stories("spec-beta", "1-1");
  const revision = f.commit();
  const scaffold = "tests/unit/alpha.test.ts";
  const descriptor = (s: typeof alpha) => ({
    ...f.route(revision, s.story_key), ...s, source: { mode: "stories", ...s.source },
    write_paths: [`${evidenceRoot}/${s.story_key}/`, scaffold],
    phase_test_paths: { atdd: [scaffold], automate: [scaffold] },
  });
  const route = descriptor(alpha);
  const pre = f.execute("resolve", route, revision);
  const other = f.execute("resolve", descriptor(beta), revision, { phase: "automate" });
  assert.equal(pre.ok, true, pre.error);
  assert.equal(other.ok, true, other.error);
  assert.equal(pre.output_path, `${evidenceRoot}/spec-alpha-1-1/atdd-checklist.md`);
  assert.equal(other.output_path, `${evidenceRoot}/spec-beta-1-1/automation-summary.md`);
  assert.equal(existsSync(pre.output_absolute), false);
  const content = `${pre.evidence_header}\n# ATDD evidence\n`;
  const scaffoldContent = "// Acceptance scaffold\n";
  put(pre.output_absolute, content);
  put(join(f.root, scaffold), scaffoldContent);
  const post = f.execute("verify", route, revision, { receipt: pre });
  assert.equal(post.ok, true, post.error);
  assert.equal(post.artifact_sha256, sha256(content));
  assert.deepEqual(post.changed_test_sha256, { [scaffold]: sha256(scaffoldContent) });
  assert.equal(git(f.root, "status", "--porcelain", "--untracked-files=all"), `?? ${pre.output_path}\n?? ${scaffold}`);
  refused(f.execute("resolve", route, revision), /already exists|dirty/);
  put(join(f.root, plannerPath), "raise SystemExit('untrusted candidate planner')\n");
  const buildRevision = f.commit();
  const automate = f.execute("resolve", route, buildRevision, { phase: "automate" });
  assert.equal(automate.ok, true, automate.error);
  assert.equal(automate.output_path, `${evidenceRoot}/spec-alpha-1-1/automation-summary.md`);
  put(automate.output_absolute, `${automate.evidence_header}\n# Coverage review\n`);
  put(join(f.root, scaffold), "// Regression coverage\n");
  const verified = f.execute("verify", route, buildRevision, { receipt: automate, phase: "automate" });
  assert.equal(verified.ok, true, verified.error);
  refused(f.execute("verify", route, revision, { receipt: pre }), /revision is stale/);
});

test("schema-2 receipt matches the exact 35.7 exception and rejects stale or incorrect assignments", (t) => {
  const f = fixture(t);
  const story = f.stories("spec-design-35-7", "35-7");
  const revision = f.commit();
  const ownedTest = "tests/e2e/settings/settings.e2e.spec.ts";
  const assignment = {
    ok: true, schema_version: 2, story_source: "stories", publication_strategy: "story-pr",
    base_branch: "main", state: "claimed", branch, worktree: f.root, base_sha: revision,
    run_id: "fixture-run", owner: "fixture-owner", worker: "fixture-worker", generation: 1,
    source: story.source,
    story: {
      id: story.story_key, approved: true, spec_path: story.spec_path, spec_revision: sha256(specContent),
      source: story.source, write_paths: [`${evidenceRoot}/story-35-7/`, ownedTest, "src/app/[slug]/page.tsx"],
    },
  };
  const assignmentPath = join(f.temporary, "native-assignment.json");
  const data = JSON.stringify(assignment);
  put(assignmentPath, data);
  const descriptor = {
    ...f.route(revision, story.story_key), route: "schema-2", assignment_sha256: sha256(data),
    run_id: assignment.run_id, owner: assignment.owner, worker: assignment.worker, generation: 1,
    phase_test_paths: { atdd: [ownedTest], automate: [ownedTest] },
  };
  const options = { assignment: assignmentPath };
  refused(f.execute("resolve", {
    ...descriptor, phase_test_paths: { ...descriptor.phase_test_paths, atdd: ["tests/e2e/other.e2e.spec.ts"] },
  }, revision, options), /outside approved write paths/);
  const pre = f.execute("resolve", descriptor, revision, options);
  assert.equal(pre.ok, true, pre.error);
  assert.equal(pre.output_path, `${evidenceRoot}/story-35-7/atdd-checklist.md`);
  put(pre.output_absolute, `${pre.evidence_header}\n# Schema-2 evidence\n`);
  const verified = f.execute("verify", descriptor, revision, { ...options, receipt: pre });
  assert.equal(verified.ok, true, verified.error);
  rmSync(pre.output_absolute);
  refused(f.execute("resolve", descriptor, "a".repeat(40), options), /revision is stale/);
  refused(f.execute("resolve", { ...descriptor, generation: 2 }, revision, options), /generation mismatch/);
  refused(f.execute("resolve", { ...descriptor, worker: "wrong-worker" }, revision, options), /worker mismatch/);
  const stale = JSON.stringify({ ...assignment, state: "pr-ready" });
  put(assignmentPath, stale);
  refused(f.execute("resolve", descriptor, revision, options), /SHA-256 mismatch/);
  refused(f.execute("resolve", { ...descriptor, assignment_sha256: sha256(stale) }, revision, options), /active native/);
  const wrong = JSON.stringify({ ...assignment, worktree: f.temporary });
  put(assignmentPath, wrong);
  refused(f.execute("resolve", { ...descriptor, assignment_sha256: sha256(wrong) }, revision, options), /worktree mismatch/);
  put(assignmentPath, data);
  put(join(f.root, story.spec_path), specContent + "\nEdited after the phase revision.\n");
  refused(f.execute("resolve", descriptor, revision, options), /spec does not match/);
});

test("rejects shared outputs, unsafe names, mismatched receipts and wrong phase artifacts", (t) => {
  const f = fixture(t);
  const story = f.stories("spec-boundary", "1");
  const revision = f.commit();
  const own = `${evidenceRoot}/${story.story_key}/`;
  const route = {
    ...f.route(revision, story.story_key), ...story, source: { mode: "stories", ...story.source },
    write_paths: [own],
  };
  for (const path of [`${evidenceRoot}/`, "_bmad-output/", `${evidenceRoot}/other/`, `${evidenceRoot}/automation-summary.md`]) {
    refused(f.execute("resolve", { ...route, write_paths: [own, path] }, revision), /shared or another story/);
  }
  for (const story_key of ["../escape", "nested/path", "dir\\path", "COM1", "trail."]) {
    refused(f.execute("resolve", { ...route, story_key }, revision), /canonical story key/);
  }
  for (const writePath of ["/absolute", "../escape", "dir//file", "dir/../file", "dir\\file", "dir/CON.txt"]) {
    refused(f.execute("resolve", { ...route, write_paths: [own, writePath] }, revision), /Unsafe repository-relative path/);
  }
  refused(f.execute("resolve", { ...route, phases: ["automate"] }, revision), /Phase was not selected/);
  refused(f.execute("resolve", { ...route, branch: "codex/wrong-branch" }, revision), /branch mismatch/);
  refused(f.execute("resolve", route, revision, { checkout: join(f.root, "_bmad-output") }), /worktree root/);
  refused(f.execute("resolve", route, revision, { routeHash: "a".repeat(64) }), /SHA-256 mismatch/);
  refused(f.execute("resolve", { ...route, planner_sha256: "a".repeat(64) }, revision), /Trusted planner SHA-256 mismatch/);
  refused(f.execute("resolve", { ...route, write_paths: [`${own}automation-summary.md`] }, revision), /outside approved write paths/);
  const pre = f.execute("resolve", route, revision);
  assert.equal(pre.ok, true, pre.error);
  const wrongPath = join(f.root, evidenceRoot, "automation-summary.md");
  put(wrongPath, `${pre.evidence_header}\n# Wrong output\n`);
  refused(f.execute("verify", route, revision, { receipt: pre }), /only the new, unstaged/);
  put(pre.output_absolute, `${pre.evidence_header}\n# Correct output\n`);
  refused(f.execute("verify", route, revision, { receipt: pre }), /only the new, unstaged/);
  rmSync(wrongPath);
  refused(f.execute("verify", route, revision, { receipt: pre, phase: "automate" }), /receipt does not bind/);
  put(pre.output_absolute, "# Unbound evidence\n");
  refused(f.execute("verify", route, revision, { receipt: pre }), /evidence identity mismatch/);
  put(pre.output_absolute, `${pre.evidence_header}\n# Bound evidence\n`);
  git(f.root, "add", pre.output_path);
  refused(f.execute("verify", route, revision, { receipt: pre }), /only the new, unstaged/);
});

test("refuses an evidence directory redirected by a symlink or Windows junction", (t) => {
  const f = fixture(t);
  const story = f.stories("spec-linked", "1");
  const revision = f.commit();
  const directory = `${evidenceRoot}/${story.story_key}`;
  const target = join(f.temporary, "outside");
  mkdirSync(target);
  mkdirSync(join(f.root, evidenceRoot), { recursive: true });
  symlinkSync(target, join(f.root, directory), process.platform === "win32" ? "junction" : "dir");
  const route = {
    ...f.route(revision, story.story_key), ...story, source: { mode: "stories", ...story.source },
    write_paths: [directory + "/"],
  };
  refused(f.execute("resolve", route, revision), /Symlink or reparse point/);
  assert.equal(existsSync(join(target, "atdd-checklist.md")), false);
});

test("requires a clean phase baseline and refuses protected, unlisted or staged changes after dispatch", (t) => {
  const f = fixture(t);
  const story = f.stories("spec-baseline", "1");
  const product = "src/app/page.ts";
  const sharedFixture = "tests/fixtures/shared.ts";
  const migration = "supabase/migrations/123_fixture.sql";
  const allowed = "tests/unit/assigned.test.ts";
  const otherTest = "tests/unit/unlisted.test.ts";
  const unchanged = "// Committed baseline\n";
  for (const path of [product, sharedFixture, migration]) put(join(f.root, path), unchanged);
  put(join(f.root, ".gitignore"), "/node_modules/\n");
  const revision = f.commit();
  const route = {
    ...f.route(revision, story.story_key), ...story, source: { mode: "stories", ...story.source },
    write_paths: [`${evidenceRoot}/${story.story_key}/`, "tests/unit/", sharedFixture, migration],
    phase_test_paths: { atdd: [allowed], automate: [] },
  };
  put(join(f.root, "node_modules", "ignored.txt"), "Ordinary ignored dependency\n");
  put(join(f.root, product), "// Dirty product source\n");
  refused(f.execute("resolve", route, revision), /clean checkout/);
  put(join(f.root, product), unchanged);
  put(join(f.root, otherTest), "// Untracked test\n");
  refused(f.execute("resolve", route, revision), /clean checkout/);
  rmSync(join(f.root, otherTest));
  for (const invalid of ["tests/unit/", sharedFixture, migration]) {
    refused(f.execute("resolve", {
      ...route, phase_test_paths: { ...route.phase_test_paths, atdd: [invalid] },
    }, revision), /Unsafe repository-relative path|exact unit, integration or e2e test file/);
  }
  const pre = f.execute("resolve", route, revision);
  assert.equal(pre.ok, true, pre.error);
  put(pre.output_absolute, `${pre.evidence_header}\n# Phase result\n`);
  put(join(f.root, allowed), "// Approved test\n");
  for (const path of [product, sharedFixture, migration, otherTest]) {
    put(join(f.root, path), "// Unexpected phase change\n");
    refused(f.execute("verify", route, revision, { receipt: pre }), /outside the exact unstaged phase files/);
    if (path === otherTest) rmSync(join(f.root, path));
    else put(join(f.root, path), unchanged);
  }
  git(f.root, "add", allowed);
  refused(f.execute("verify", route, revision, { receipt: pre }), /outside the exact unstaged phase files/);
});

test("sprint alias resolves through the planner and leaves a legacy story on its pinned route", (t) => {
  const f = fixture(t);
  const impl_dir = "_bmad-output/implementation-artifacts";
  const sprint_status = `${impl_dir}/sprint-status.yaml`;
  const story_key = "35-2-sprint-fixture";
  const spec_path = `${impl_dir}/spec-${story_key}.md`;
  put(join(f.root, sprint_status), `development_status:\n  epic-35: in-progress\n  ${story_key}: ready-for-dev\n`);
  put(join(f.root, spec_path), specContent);
  const revision = f.commit();
  const route = {
    ...f.route(revision, story_key), spec_path,
    phases: ["atdd"], phase_test_paths: { atdd: [] },
    source: { mode: "sprint", sprint_status, impl_dir, story_ref: "35.2" },
    write_paths: [`${evidenceRoot}/${story_key}/atdd-checklist.md`],
  };
  const pre = f.execute("resolve", route, revision);
  assert.equal(pre.ok, true, pre.error);
  assert.equal(pre.output_path, `${evidenceRoot}/${story_key}/atdd-checklist.md`);
  rmSync(join(f.root, spec_path));
  const legacy = `${impl_dir}/${story_key}.md`;
  put(join(f.root, legacy), "# Legacy sprint story\n\nStatus: ready-for-dev\n");
  const legacyRevision = f.commit();
  refused(f.execute("resolve", { ...route, spec_path: legacy }, legacyRevision), /Legacy story retains/);
});
