import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createApi } from '../pr-feedback/runtime.mjs';
import { DEFAULT_ALLOWED_USER_IDS } from '../pr-feedback/policy.mjs';
import { CHECK_NAME, EVIDENCE_MARKER, evaluateFrontend, isFrontend, hash } from './frontend-gate.mjs';
import { presentationFeedback } from './frontend-presentation.mjs';

const SHA = /^[0-9a-f]{40}$/;
export const defaultPolicy = JSON.parse(readFileSync(new URL('./frontend-policy.json', import.meta.url), 'utf8'));
const SOURCE_PATHS = Object.freeze({
  'DESIGN.md': '_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md',
  'EXPERIENCE.md': '_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/EXPERIENCE.md',
  'v1/inventory.sha256.json': 'docs/design/claude-design/v1/inventory.sha256.json',
});
const TRUSTED_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
function committedSource(path) {
  // HEAD belongs to the trusted controller checkout, never the candidate. Git
  // blob bytes avoid OS checkout/CRLF normalization changing the source hash.
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', '-c', 'credential.helper=', 'show', `HEAD:${path}`], { cwd: TRUSTED_ROOT, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
}
export function verifyTrustedSources(policy, readSource = committedSource) {
  if (!policy?.source?.hashes || !Object.keys(policy.source.hashes).length) throw new Error('Approved canonical source inventory missing.');
  for (const [name, expected] of Object.entries(policy.source.hashes)) {
    if (!SOURCE_PATHS[name] || hash(readSource(SOURCE_PATHS[name])) !== expected) throw new Error(`Approved canonical source bytes unavailable or mismatched: ${name}.`);
  }
  return true;
}
export async function all(api, path) {
  const records = [];
  for (let page = 1; page <= 30; page++) {
    const items = await api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    if (!Array.isArray(items)) throw new Error('Incomplete visual gate API inventory.');
    records.push(...items);
    if (items.length < 100) return records;
  }
  throw new Error('Visual gate pagination bound exceeded.');
}

/** Read-only Git storage proof. URLs are generated, never fetched from author input. */
export function publishedImages(api, repo, prNumber) {
  const retained = new Map();
  async function verify(commit, ref) {
    if (!SHA.test(commit ?? '') || ref !== `codex/visual-evidence/pr-${prNumber}`) throw new Error('Invalid retained screenshot publication identity.');
    const branch = await api(`/repos/${repo}/git/ref/heads/${ref}`);
    if (branch.ref !== `refs/heads/${ref}` || branch.object?.type !== 'commit' || !SHA.test(branch.object?.sha ?? '')) throw new Error('Durable screenshot evidence ref is unavailable.');
    if (branch.object.sha !== commit) {
      const comparison = await api(`/repos/${repo}/compare/${commit}...${branch.object.sha}`);
      if (!['ahead', 'identical'].includes(comparison.status) || comparison.merge_base_commit?.sha !== commit) throw new Error('Screenshot commit is not retained by the evidence branch.');
    }
  }
  return {
    read: async ({ commit, ref, path }) => {
      if (!/^screenshots\/[0-9a-f]{40}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,79}\.png$/.test(path ?? '')) throw new Error('Invalid screenshot publication path.');
      const identity = `${commit}:${ref}`;
      if (!retained.has(identity)) { await verify(commit, ref); retained.set(identity, { commit, ref }); }
      const content = await api(`/repos/${repo}/contents/${path}?ref=${commit}`);
      if (content.type !== 'file' || content.path !== path || !SHA.test(content.sha ?? '') || !Number.isSafeInteger(content.size) || content.size < 1 || content.size > 8 * 1024 * 1024) throw new Error('Published PNG path is unavailable or oversized.');
      return { retained: true, gitBlob: content.sha };
    },
    recheck: async () => { for (const { commit, ref } of retained.values()) await verify(commit, ref); },
  };
}

/** Reads API data only; executes no candidate code or capture commands. */
export async function assessPr({ api, repo, prNumber, expectedHead, policy = defaultPolicy, readSource }) {
  const pr = await api(`/repos/${repo}/pulls/${prNumber}`);
  if (pr.state !== 'open' || !SHA.test(pr.head?.sha ?? '') || expectedHead && pr.head.sha !== expectedHead) throw new Error('Visual candidate head changed or PR is closed.');
  const [changed, comments, reviews] = await Promise.all([
    all(api, `/repos/${repo}/pulls/${prNumber}/files`),
    all(api, `/repos/${repo}/issues/${prNumber}/comments`),
    all(api, `/repos/${repo}/pulls/${prNumber}/reviews`),
  ]);
  if (pr.changed_files !== changed.length) throw new Error('Truncated visual surface file inventory.');
  const evidence = [...comments, ...reviews.filter((r) => r.commit_id === pr.head.sha && r.state !== 'DISMISSED')];
  const frontend = changed.some((f) => isFrontend(f.filename) || f.previous_filename && isFrontend(f.previous_filename));
  const inline = frontend ? await all(api, `/repos/${repo}/pulls/${prNumber}/comments`) : [];
  const authorIds = new Set([pr.user?.id]);
  let authorsComplete = true;
  if (frontend) {
    const commits = await all(api, `/repos/${repo}/pulls/${prNumber}/commits`);
    if (!Number.isInteger(pr.commits) || pr.commits > 250 || commits.length !== pr.commits) throw new Error('Candidate commit author inventory incomplete.');
    for (const commit of commits) for (const actor of [commit.author, commit.committer]) {
      if (Number.isSafeInteger(actor?.id)) authorIds.add(actor.id);
      else authorsComplete = false;
    }
  }
  const permissions = {};
  const permissionUsers = new Set([...comments, ...reviews, ...inline].filter((c) => c.user?.type === 'User'
    && (DEFAULT_ALLOWED_USER_IDS.includes(c.user.id) || c.body?.startsWith(EVIDENCE_MARKER + '\n'))).map((c) => c.user.login));
  if (permissionUsers.size > 120) throw new Error('Screenshot publisher permission inventory exceeds bounds.');
  for (const login of permissionUsers) {
    permissions[login] = (await api(`/repos/${repo}/collaborators/${encodeURIComponent(login)}/permission`)).permission;
  }
  const feedback = frontend ? presentationFeedback({ comments, reviews, reviewComments: inline, permissions }) : [];
  const publication = publishedImages(api, repo, prNumber);
  const result = await evaluateFrontend({ headSha: pr.head.sha, repo, prNumber, prBody: pr.body, reviewComments: inline, feedback, loadPublication: publication.read,
    files: changed.flatMap((f) => f.previous_filename ? [f.filename, f.previous_filename] : [f.filename]), comments: evidence, permissions, policy, authorId: pr.user?.id, authorIds: [...authorIds], authorsComplete, labels: (pr.labels ?? []).map((l) => l.name), loadBlob: async (oid) => {
    const blob = await api(`/repos/${repo}/git/blobs/${oid}`);
    if (blob.sha !== oid || blob.encoding !== 'base64' || !Number.isInteger(blob.size) || blob.size > 8 * 1024 * 1024 || typeof blob.content !== 'string' || blob.content.length > 12 * 1024 * 1024) throw new Error('Missing/oversized actual image input.');
    const bytes = Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
    if (bytes.length !== blob.size) throw new Error('Image bytes truncated.');
    return bytes;
  } });
  if (result.status === 'accepted') verifyTrustedSources(policy, readSource);
  const fresh = await api(`/repos/${repo}/pulls/${prNumber}`);
  if (fresh.head.sha !== pr.head.sha || fresh.state !== 'open') throw new Error('Visual candidate changed during assessment.');
  if (result.status === 'accepted') {
    const latest = await Promise.all([all(api, `/repos/${repo}/issues/${prNumber}/comments`), all(api, `/repos/${repo}/pulls/${prNumber}/reviews`), all(api, `/repos/${repo}/pulls/${prNumber}/comments`)]);
    if (fresh.body !== pr.body || hash(Buffer.from(JSON.stringify(latest))) !== hash(Buffer.from(JSON.stringify([comments, reviews, inline])))) throw new Error('PR body or feedback/replies changed during screenshot assessment.');
    await publication.recheck();
  }
  return result;
}

/** Both reporters describe one assessment; no reporter failure can grant success. */
export async function reportPrAssessment({ api, repo, prNumber, runId, assess = assessPr }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo ?? '') || !Number.isSafeInteger(prNumber) || prNumber < 1 || !/^[1-9][0-9]*$/.test(runId ?? '')) throw new Error('Invalid visual reporting identity.');
  const pr = await api(`/repos/${repo}/pulls/${prNumber}`);
  if (pr.state !== 'open' || pr.base?.ref !== 'main' || !SHA.test(pr.head?.sha ?? '')) throw new Error('Visual reporting requires a current open main-target PR.');
  const head = pr.head.sha;
  const target = `https://github.com/${repo}/actions/runs/${runId}`;
  const status = async (state) => {
    const response = await api(`/repos/${repo}/statuses/${head}`, { method: 'POST', body: { context: CHECK_NAME, state, target_url: target, description: state === 'pending' ? 'Verifying current visual evidence.' : state === 'success' ? 'Current visual evidence accepted or not applicable.' : 'Visual assessment or reporting failed.' } });
    if (!Number.isSafeInteger(response?.id) || response.id < 1 || response.context !== CHECK_NAME || response.state !== state) throw new Error('Commit status response did not confirm the requested result.');
  };
  const current = async () => {
    const fresh = await api(`/repos/${repo}/pulls/${prNumber}`);
    const labels = (value) => JSON.stringify((value ?? []).map((l) => l.name).sort());
    if (fresh.state !== 'open' || fresh.head?.sha !== head || fresh.base?.ref !== 'main' || fresh.body !== pr.body || labels(fresh.labels) !== labels(pr.labels)) throw new Error('Visual candidate metadata changed before reporting.');
  };
  let check;
  try {
    // A failing/unknown CheckRun operation must never leave a newly green status.
    await status('pending');
    const created = await api(`/repos/${repo}/check-runs`, { method: 'POST', body: { name: CHECK_NAME, head_sha: head, status: 'in_progress', external_id: `visual-v1:${runId}:${prNumber}:${head}` } });
    // Policy B pins this reporter to the actual GitHub Actions App, not a body field.
    if (!Number.isSafeInteger(created?.id) || created.id < 1 || created.name !== CHECK_NAME || created.head_sha !== head || created.app?.id !== 15368) throw new Error('Visual CheckRun source or identity mismatch.');
    check = created;
    const result = await assess({ api, repo, prNumber, expectedHead: head });
    if (!['accepted', 'not-applicable'].includes(result?.status) || result.headSha !== head) throw new Error('Visual assessment did not return current accepted/N/A evidence.');
    await current();
    const reported = await api(`/repos/${repo}/check-runs/${check.id}`, { method: 'PATCH', body: { status: 'completed', conclusion: 'success', output: { title: result.status === 'accepted' ? 'Visual acceptance recorded' : 'Visual evidence not applicable', summary: JSON.stringify(result, null, 2).slice(0, 60000) } } });
    if (reported?.id !== check.id || reported.head_sha !== head || reported.app?.id !== 15368 || reported.status !== 'completed' || reported.conclusion !== 'success') throw new Error('Visual CheckRun completion was not confirmed.');
    await current();
    await status('success');
    return result;
  } catch (error) {
    // These are terminal failure reports, never retries of an uncertain success.
    // If GitHub is unavailable, keep the known pending status and fail the job.
    if (Number.isSafeInteger(check?.id) && check.id > 0) {
      try { await api(`/repos/${repo}/check-runs/${check.id}`, { method: 'PATCH', body: { status: 'completed', conclusion: 'failure', output: { title: 'Visual acceptance blocked', summary: `BLOCKED: ${error.message}`.slice(0, 60000) } } }); } catch { /* The native failure remains authoritative about this operation. */ }
    }
    try { await status('failure'); } catch { /* No success is returned after an uncertain reporter operation. */ }
    throw error;
  }
}

async function hosted() {
  const repo = process.env.GITHUB_REPOSITORY;
  const eventName = process.env.GITHUB_EVENT_NAME;
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo ?? '') || !SHA.test(process.env.GITHUB_SHA ?? '') || !['pull_request_target', 'issue_comment', 'schedule', 'workflow_dispatch'].includes(eventName)) throw new Error('Untrusted visual controller context.');
  if (eventName !== 'pull_request_target' && process.env.GITHUB_REF !== 'refs/heads/main') throw new Error('Visual controller requires main.');
  if (eventName === 'pull_request_target' && event.pull_request?.base?.ref !== 'main') throw new Error('Visual controller requires trusted main base.');
  const api = createApi(process.env.GITHUB_TOKEN);
  const target = event.pull_request?.number ?? (event.issue?.pull_request ? event.issue.number : undefined) ?? Number(event.inputs?.pr_number || 0);
  if (eventName === 'issue_comment' && !target) return;
  const prs = target ? [{ number: target }] : await all(api, `/repos/${repo}/pulls?state=open`);
  if (prs.length > 100) throw new Error('Visual monitor PR budget exceeded.');
  let failed = false;
  for (const item of prs) {
    const pr = await api(`/repos/${repo}/pulls/${item.number}`);
    if (pr.base.ref !== 'main' || pr.state !== 'open') continue;
    let result, failure;
    try { result = await reportPrAssessment({ api, repo, prNumber: item.number, runId: process.env.GITHUB_RUN_ID }); }
    catch (error) { failure = error.message; failed = true; }
    const summary = result ? JSON.stringify(result, null, 2) : `BLOCKED: ${failure}`;
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `PR #${item.number}, ${pr.head.sha}: ${summary}\n`);
  }
  if (failed) process.exitCode = 1;
}

async function local() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const base = process.argv[process.argv.indexOf('--base') + 1];
  if (!process.argv.includes('--base') || !SHA.test(base ?? '')) throw new Error('Local gate needs --base with the recorded full baseline revision.');
  const paths = execFileSync('git', ['diff', '--name-only', base, '--'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  if (![...paths, ...untracked].some(isFrontend)) {
    console.log(JSON.stringify({ status: 'not-applicable', headSha: head, reason: 'The complete recorded-baseline diff plus untracked inventory changes no frontend-bearing paths; documentation/backend/tooling has no rendered surface.', coverage: [...new Set([...paths, ...untracked])] }, null, 2));
    return;
  }
  const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim();
  if (dirty) throw new Error('Commit the bounded candidate before claiming revision-bound acceptance; working-tree changes invalidate acceptance.');
  const api = async (path) => JSON.parse(execFileSync('gh', ['api', path], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true }));
  const repo = execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
  const prs = await api(`/repos/${repo}/pulls?state=open&head=${encodeURIComponent(repo.split('/')[0])}:${encodeURIComponent(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim())}`);
  if (prs.length !== 1 || prs[0].head.sha !== head) throw new Error('One published PR at this exact candidate revision is required for authenticated visual acceptance.');
  console.log(JSON.stringify(await assessPr({ api, repo, prNumber: prs[0].number, expectedHead: head }), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const command = process.argv[2];
  (command === 'hosted' ? hosted() : command === 'local' ? local() : Promise.reject(new Error('Use hosted or local.'))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
