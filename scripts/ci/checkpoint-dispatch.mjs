import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const WORKFLOW = "ci.yml";
export const WORKFLOW_PATH = ".github/workflows/ci.yml";
const SHA = /^[a-f0-9]{40}$/;
const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const ACTOR = /^[A-Za-z0-9-]+(?:\[bot\])?$/;
export const checkpointTitle = (id, sha) => `checkpoint:${id}:${sha}`;

export function validateRequest({ repo, ref, sha }) {
  if (!REPO.test(repo ?? "") || repo.includes("..")) throw new Error("Use an explicit owner/repository.");
  if (!SHA.test(sha ?? "")) throw new Error("Use a full lowercase 40-character commit SHA.");
  if (typeof ref !== "string" || ref.length > 240 || ref.startsWith("-") || ref.startsWith("/") || ref.endsWith("/") || /[\s~^:?*[\\\x00-\x1f\x7f]/.test(ref) || ref.includes("..") || ref.includes("@{") || ref.split("/").some((part) => !part || part.startsWith(".") || part.endsWith(".") || part.endsWith(".lock"))) {
    throw new Error("Use a valid branch name, without refs/heads/.");
  }
  if (ref.startsWith("refs/")) throw new Error("Use the branch name without refs/heads/.");
}

// Arguments and JSON stdin never pass through a shell. CLI errors deliberately
// exclude response bodies and the inherited authentication environment.
export function githubApi(method, endpoint, body) {
  const result = spawnSync("gh", ["api", "--method", method, endpoint, ...(body === undefined ? [] : ["--input", "-"])], {
    input: body === undefined ? undefined : JSON.stringify(body),
    encoding: "utf8", timeout: 15_000, maxBuffer: 4 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) throw new Error(`GitHub ${method} request failed; response omitted.`);
  if (!result.stdout.trim()) return null;
  try { return JSON.parse(result.stdout); } catch { throw new Error("GitHub returned invalid JSON; response omitted."); }
}

function validateState(state) {
  if (state?.version !== 1) throw new Error("Unsupported checkpoint record.");
  validateRequest(state);
  if (!ID.test(state.checkpoint_id) || !ACTOR.test(state.actor) || !Number.isSafeInteger(state.workflow_id) || state.workflow_id < 1 || !Number.isFinite(Date.parse(state.created_at)) || !Number.isFinite(Date.parse(state.deadline_at))) {
    throw new Error("Invalid checkpoint ownership record.");
  }
  if (state.run_id != null && (!Number.isSafeInteger(state.run_id) || state.run_id < 1)) throw new Error("Invalid recorded run ID.");
}

function save(path, state) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  const fd = openSync(temporary, "wx", 0o600);
  try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(temporary, path);
}

function workflowMatches(run, state) {
  return run.repository?.full_name?.toLowerCase() === state.repo.toLowerCase()
    && run.workflow_id === state.workflow_id
    && (run.path === WORKFLOW_PATH || run.path?.startsWith(`${WORKFLOW_PATH}@`))
    && run.event === "workflow_dispatch"
    && run.head_branch === state.ref
    && run.head_sha === state.sha
    && run.display_title === checkpointTitle(state.checkpoint_id, state.sha)
    && run.actor?.login?.toLowerCase() === state.actor.toLowerCase()
    && run.triggering_actor?.login?.toLowerCase() === state.actor.toLowerCase()
    && run.run_attempt === 1;
}

export function assertOwnedRun(run, state) {
  if (!workflowMatches(run, state) || !Number.isSafeInteger(run.id) || run.id < 1 || (state.run_id != null && run.id !== state.run_id)) {
    throw new Error("Run ownership mismatch (repository/workflow/event/ref/SHA/checkpoint/actor/attempt); no mutation sent.");
  }
}

// Never select the latest run. Inspect a bounded listing for this exact immutable
// title; duplicates, truncation and reruns require human reconciliation.
function discover(api, state) {
  const matches = [];
  for (let page = 1; page <= 5; page += 1) {
    const result = api("GET", `repos/${state.repo}/actions/workflows/${state.workflow_id}/runs?event=workflow_dispatch&head_sha=${state.sha}&per_page=100&page=${page}`);
    if (!Array.isArray(result?.workflow_runs)) throw new Error("Invalid workflow run listing.");
    matches.push(...result.workflow_runs.filter((run) => run.display_title === checkpointTitle(state.checkpoint_id, state.sha)));
    if (matches.length > 1) throw new Error("Duplicate checkpoint runs; no mutation sent. Reconcile manually.");
    if (result.workflow_runs.length < 100) return matches[0] ?? null;
  }
  throw new Error("Run discovery exceeded its five-page bound; no mutation sent.");
}

export function checkpoint(command, options, { api = githubApi, now = () => new Date() } = {}) {
  if (!["dispatch", "status", "cancel"].includes(command)) throw new Error("Use dispatch, status or cancel.");
  if (!options.state) throw new Error("--state is required; use an ignored private local path.");
  const path = resolve(options.state);
  mkdirSync(dirname(path), { recursive: true });
  const lockPath = `${path}.lock`;
  let lock;
  try { lock = openSync(lockPath, "wx", 0o600); } catch { throw new Error("Checkpoint record is locked; inspect its owner before recovery."); }
  try {
    if (command === "dispatch") {
      if (existsSync(path)) throw new Error("Checkpoint record already exists. Use status; never retry dispatch from this record.");
      validateRequest(options);
      const actor = api("GET", "user").login;
      if (!ACTOR.test(actor ?? "")) throw new Error("Cannot establish authenticated actor.");
      const permission = api("GET", `repos/${options.repo}/collaborators/${encodeURIComponent(actor)}/permission`).permission;
      if (!["admin", "maintain", "write"].includes(permission)) throw new Error("Checkpoint dispatch requires repository write permission.");
      const branch = api("GET", `repos/${options.repo}/branches/${encodeURIComponent(options.ref)}`);
      if (branch.commit?.sha !== options.sha) throw new Error("Remote branch differs from the requested SHA; no dispatch sent.");
      const workflow = api("GET", `repos/${options.repo}/actions/workflows/${WORKFLOW}`);
      if (workflow.path !== WORKFLOW_PATH || workflow.state !== "active" || !Number.isSafeInteger(workflow.id) || workflow.id < 1) throw new Error("Expected active CI workflow is unavailable on the default branch.");
      const created = now();
      const state = {
        version: 1, repo: options.repo, ref: options.ref, sha: options.sha,
        actor, workflow_id: workflow.id, checkpoint_id: randomUUID(),
        created_at: created.toISOString(), deadline_at: new Date(created.getTime() + 60 * 60 * 1000).toISOString(),
        phase: "dispatch-uncertain", run_id: null,
      };
      // Exclusive durable intent precedes the only dispatch POST. The GitHub
      // checkpoint ID correlates requests; GitHub does not make it idempotent.
      const fd = openSync(path, "wx", 0o600);
      try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
      try {
        api("POST", `repos/${state.repo}/actions/workflows/${state.workflow_id}/dispatches`, {
          ref: state.ref, inputs: { expected_sha: state.sha, checkpoint_id: state.checkpoint_id },
        });
      } catch {
        throw new Error("Dispatch outcome uncertain. Ownership record retained; use status, never repeat dispatch.");
      }
      state.phase = "dispatched";
      save(path, state);
      return { phase: state.phase, checkpoint_id: state.checkpoint_id, sha: state.sha, next: "Use status with this same --state record." };
    }
    const state = JSON.parse(readFileSync(path, "utf8"));
    validateState(state);
    const actor = api("GET", "user").login;
    if (actor?.toLowerCase() !== state.actor.toLowerCase()) throw new Error("Authenticated actor differs from checkpoint owner; no mutation sent.");
    const listed = discover(api, state);
    if (!listed) {
      if (state.run_id != null) throw new Error("Recorded run is absent from discovery; reconcile manually.");
      return { phase: "dispatch-uncertain", checkpoint_id: state.checkpoint_id, attention: "No unique matching run visible. Do not redispatch. Reconcile manually.", deadline_exceeded: now().getTime() > Date.parse(state.deadline_at) };
    }
    const run = api("GET", `repos/${state.repo}/actions/runs/${listed.id}`);
    assertOwnedRun(run, state);
    state.run_id = run.id;
    state.phase = run.status === "completed" ? "completed" : run.status;
    state.conclusion = run.conclusion ?? null;
    save(path, state);
    if (command === "cancel" && run.status !== "completed") {
      // A timeout/failure may mean the cancellation was accepted. Persist that
      // uncertainty first, and require subsequent status instead of retrying.
      if (state.cancel_requested_at) throw new Error("Cancellation already requested; use status, do not repeat cancellation.");
      state.cancel_requested_at = now().toISOString();
      save(path, state);
      try { api("POST", `repos/${state.repo}/actions/runs/${run.id}/cancel`); } catch { throw new Error("Cancellation outcome uncertain; use status. No retry sent."); }
      return { phase: "cancel-requested", run_id: run.id, sha: state.sha };
    }
    return { phase: state.phase, conclusion: state.conclusion, run_id: run.id, sha: state.sha,
      deadline_exceeded: run.status !== "completed" && now().getTime() > Date.parse(state.deadline_at),
      url: `https://github.com/${state.repo}/actions/runs/${run.id}` };
  } finally {
    closeSync(lock);
    unlinkSync(lockPath);
  }
}

export function parseArgs(args) {
  const [command, ...rest] = args;
  const options = {};
  const allowed = command === "dispatch" ? ["repo", "ref", "sha", "state"] : ["state"];
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index]?.slice(2);
    if (!rest[index]?.startsWith("--") || !allowed.includes(key) || options[key] !== undefined || !rest[index + 1] || rest[index + 1].startsWith("--")) throw new Error("Invalid, duplicate or missing option. Dispatch: --repo --ref --sha --state; status/cancel: --state.");
    options[key] = rest[index + 1];
  }
  return { command, options };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { command, options } = parseArgs(process.argv.slice(2));
    const result = checkpoint(command, options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.phase === "completed" && result.conclusion !== "success") process.exitCode = 1;
    else if (result.deadline_exceeded) process.exitCode = 2;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : "Checkpoint operation failed."}\n`);
    process.exitCode = 1;
  }
}
