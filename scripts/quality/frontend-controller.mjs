import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createApi } from '../pr-feedback/runtime.mjs';
import { DEFAULT_ALLOWED_USER_IDS } from '../pr-feedback/policy.mjs';
import { CHECK_NAME, evaluateFrontend, isFrontend, hash } from './frontend-gate.mjs';

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
  const authorIds = new Set([pr.user?.id]);
  let authorsComplete = true;
  if (changed.some((f) => isFrontend(f.filename) || f.previous_filename && isFrontend(f.previous_filename))) {
    const commits = await all(api, `/repos/${repo}/pulls/${prNumber}/commits`);
    if (!Number.isInteger(pr.commits) || pr.commits > 250 || commits.length !== pr.commits) throw new Error('Candidate commit author inventory incomplete.');
    for (const commit of commits) for (const actor of [commit.author, commit.committer]) {
      if (Number.isSafeInteger(actor?.id)) authorIds.add(actor.id);
      else authorsComplete = false;
    }
  }
  const permissions = {};
  for (const login of new Set(evidence.filter((c) => c.user?.type === 'User' && DEFAULT_ALLOWED_USER_IDS.includes(c.user.id)).map((c) => c.user.login))) {
    permissions[login] = (await api(`/repos/${repo}/collaborators/${encodeURIComponent(login)}/permission`)).permission;
  }
  const result = await evaluateFrontend({ headSha: pr.head.sha, files: changed.flatMap((f) => f.previous_filename ? [f.filename, f.previous_filename] : [f.filename]), comments: evidence, permissions, policy, authorId: pr.user?.id, authorIds: [...authorIds], authorsComplete, labels: (pr.labels ?? []).map((l) => l.name), loadBlob: async (oid) => {
    const blob = await api(`/repos/${repo}/git/blobs/${oid}`);
    if (blob.sha !== oid || blob.encoding !== 'base64' || !Number.isInteger(blob.size) || blob.size > 8 * 1024 * 1024 || typeof blob.content !== 'string' || blob.content.length > 12 * 1024 * 1024) throw new Error('Missing/oversized actual image input.');
    const bytes = Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
    if (bytes.length !== blob.size) throw new Error('Image bytes truncated.');
    return bytes;
  } });
  if (result.status === 'accepted') verifyTrustedSources(policy, readSource);
  const fresh = await api(`/repos/${repo}/pulls/${prNumber}`);
  if (fresh.head.sha !== pr.head.sha || fresh.state !== 'open') throw new Error('Visual candidate changed during assessment.');
  return result;
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
    // Check is always attached to the actual current PR head, never merge/base.
    const check = await api(`/repos/${repo}/check-runs`, { method: 'POST', body: { name: CHECK_NAME, head_sha: pr.head.sha, status: 'in_progress', external_id: `visual-v1:${process.env.GITHUB_RUN_ID}:${item.number}:${pr.head.sha}` } });
    let result, failure;
    try { result = await assessPr({ api, repo, prNumber: item.number, expectedHead: pr.head.sha }); }
    catch (error) { failure = error.message; failed = true; }
    const summary = result ? JSON.stringify(result, null, 2) : `BLOCKED: ${failure}`;
    await api(`/repos/${repo}/check-runs/${check.id}`, { method: 'PATCH', body: { status: 'completed', conclusion: failure ? 'failure' : 'success', output: { title: failure ? 'Visual acceptance blocked' : result.status === 'accepted' ? 'Visual acceptance recorded' : 'Visual evidence not applicable', summary: summary.slice(0, 60000) } } });
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
