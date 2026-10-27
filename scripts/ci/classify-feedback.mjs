/** Selection is additive feedback only: required checks never consume this output. */
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function classifyFeedback(paths) {
  if (!Array.isArray(paths) || paths.length === 0 || paths.some(path => typeof path !== "string" || !path || /[\0\r\n\\]/.test(path) || path.startsWith("/") || path.split("/").includes("..")))
    return { scope: "broad", entryUi: true, reason: "missing-or-invalid-diff", requiredCoverage: "unchanged" };
  // No presentation surface currently has a focused data-free acceptance mapping.
  // Auth, shared styles/primitives, transitive dependencies, schema, configuration,
  // workflows and every unknown file therefore retain broad coverage. Even an
  // apparently leaf TSX file may acquire new callers in this same diff.
  const docsOnly = paths.every(path => /^(docs\/|_bmad-output\/)/.test(path) && /\.(md|json|csv)$/.test(path));
  return { scope: docsOnly ? "documentation-only" : "broad", entryUi: !docsOnly,
    reason: docsOnly ? "documentation-only" : "no-approved-narrow-surface", requiredCoverage: "unchanged" };
}

/** @param {string} base @param {string} head @param {(command: string, args: string[], options: {encoding: "utf8", timeout: number}) => string} [run] */
export function changedPaths(base, head, run = execFileSync) {
  if (!/^[a-f0-9]{40}$/.test(base ?? "") || !/^[a-f0-9]{40}$/.test(head ?? "")) throw new Error("Immutable diff revisions required");
  // Rename detection is disabled: BOTH the removed and added path must classify.
  const output = run("git", ["diff", "--no-renames", "--name-only", "-z", `${base}...${head}`], { encoding: "utf8", timeout: 15_000 });
  return output.split("\0").filter(Boolean);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  let classification;
  try {
    classification = event.pull_request
      ? classifyFeedback(changedPaths(event.pull_request.base.sha, event.pull_request.head.sha))
      : classifyFeedback([]);
  } catch { classification = classifyFeedback([]); }
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/feedback-classification.json", JSON.stringify(classification) + "\n");
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `entry_ui=${classification.entryUi}\n`);
  console.log(JSON.stringify(classification));
}
