import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evidenceDigest } from '../../../scripts/quality/frontend-gate.mjs';
import { publishedImages } from '../../../scripts/quality/frontend-controller.mjs';
import { presentationFeedback, feedbackScopeDigest, renderPrScreenshots, renderScreenshotReply, validatePresentation } from '../../../scripts/quality/frontend-presentation.mjs';
import { selectFeedback } from '../../../scripts/pr-feedback/policy.mjs';

const head = 'a'.repeat(40), commit = 'b'.repeat(40), file = 'src/components/Widget.tsx';
const owner = { id: 53317458, login: 'owner', type: 'User' }, author = { id: 123, login: 'author', type: 'User' };
type Feedback = { kind: string; id: number; rootId: number; sourceFingerprint: string; disposition: string; reason?: string; replyId?: number; captureIds?: string[]; explanation?: string };
type Comment = { id: number; body: string; user: typeof owner; created_at: string; in_reply_to_id?: number };
function fixture(inline = false) {
  const e = { captures: [{ id: 'desktop', surface: 'widget', state: 'finished', viewport: { width: 1280, height: 720 }, actual: { gitBlob: 'c'.repeat(40) } },
    { id: 'mobile', surface: 'widget', state: 'finished', viewport: { width: 360, height: 640 }, actual: { gitBlob: 'd'.repeat(40) } }],
    surfaces: [{ id: 'widget', route: '/dashboard', files: [file] }], presentation: { schemaVersion: 1, dataPolicy: 'synthetic-no-pii', evidenceCommit: commit, evidenceRef: 'codex/visual-evidence/pr-1',
      feedback: [] as Feedback[], exceptions: [] as { id: string; scope: string; targets: string[]; rationale: string }[] } };
  const source = { id: 10, user: owner, body: 'Please fix widget spacing.', created_at: '2026-10-26T10:00:00Z', ...(inline ? { path: file, in_reply_to_id: 9 } : {}) };
  const comments: Comment[] = inline ? [] : [source], reviewComments: Comment[] = inline ? [source] : [];
  const input = { e, head, digest: '', repo: 'o/r', prNumber: 1, prBody: '', feedback: presentationFeedback({ comments, reviewComments, permissions: { owner: 'admin' } }),
    comments, reviewComments, permissions: { owner: 'admin', author: 'write' }, authorIds: [author.id],
    loadPublication: async ({ path }: { path: string }) => ({ retained: true, gitBlob: e.captures.find(c => path.endsWith(`/${c.id}.png`))!.actual.gitBlob }),
    ownerWaiver: (() => false) as (id: string, rationale: string) => boolean };
  e.presentation.feedback = input.feedback.map(f => ({ ...f, disposition: 'visual-change', replyId: 20, captureIds: ['desktop', 'mobile'], explanation: 'Aligned the spacing using the approved token.' }));
  function sync(history: Comment[] = []) {
    input.digest = evidenceDigest(e); input.prBody = renderPrScreenshots(e, head, input.digest);
    const f = e.presentation.feedback[0];
    const pool = inline ? reviewComments : comments;
    const previous = pool.findIndex(c => c.id === 20); if (previous >= 0) pool.splice(previous, 1);
    if (f && f.disposition !== 'not-change-feedback') pool.push({ id: 20, user: author, created_at: '2026-10-26T11:00:00Z', ...(inline ? { in_reply_to_id: 9 } : {}),
      body: renderScreenshotReply({ e, head, digest: input.digest, repo: input.repo, prNumber: 1, feedback: f, history }) });
  }
  sync(); return { e, input, source, sync, reply: () => (inline ? reviewComments : comments).find(c => c.id === 20)! };
}

test('durable PR body and corresponding visual reply expose current desktop/mobile labels', async () => {
  const f = fixture(); const result = await validatePresentation(f.input);
  assert.equal(result.status, 'published'); assert.equal(result.scopeDigest, feedbackScopeDigest(f.e.presentation.feedback));
  assert.match(f.input.prBody, /viewport 360x640/); assert.match(f.input.prBody, /screen widget; route \/dashboard; state finished/);
  assert.match(f.input.prBody, new RegExp(`\.\./blob/${commit}/screenshots/${head}/desktop.png\\?raw=true`));
});

test('missing, unavailable, stale or mismatched Git publication never passes', async () => {
  const f = fixture(); await assert.rejects(validatePresentation({ ...f.input, loadPublication: undefined }), /publication is unavailable/);
  await assert.rejects(validatePresentation({ ...f.input, loadPublication: async () => { throw Error('Owned publication unavailable'); } }), /unavailable/);
  for (const value of [{ retained: false, gitBlob: f.e.captures[0].actual.gitBlob }, { retained: true, gitBlob: 'e'.repeat(40) }])
    await assert.rejects(validatePresentation({ ...f.input, loadPublication: async () => value }), /path\/blob/);
  f.e.presentation.evidenceRef = 'main'; await assert.rejects(validatePresentation(f.input), /metadata missing/);
});

test('link-only, local, artifact, branch, fenced or hidden screenshots cannot satisfy body presentation', async () => {
  for (const mutate of [(s: string) => s.replaceAll('![', '['), (s: string) => s.replaceAll('../blob/', 'C:/captures/'),
    (s: string) => s.replaceAll(commit, 'main'), (s: string) => s.replaceAll('../blob/', 'https://example.com/artifacts/'),
    (s: string) => `\`\`\`md\n${s}\`\`\``, (s: string) => `<!--\n${s}\n-->`, (s: string) => s.replaceAll(head, 'f'.repeat(40)),
    (s: string) => s.replace('viewport 360x640', 'viewport 360x800')]) {
    const f = fixture(); f.input.prBody = mutate(f.input.prBody); await assert.rejects(validatePresentation(f.input), /PR description must start/);
  }
});

test('feedback intent has explicit complete scope; unrelated conversation needs reason but no reply', async () => {
  const f = fixture(); f.e.presentation.feedback[0] = { ...f.e.presentation.feedback[0], disposition: 'not-change-feedback', reason: 'This is a coordination comment and requests no implementation change.' };
  f.sync(); assert.equal(f.input.comments.length, 1); assert.equal((await validatePresentation(f.input)).feedbackCount, 1);
  delete f.e.presentation.feedback[0].reason; f.sync(); await assert.rejects(validatePresentation(f.input), /explicit representativeness/);
  const g = fixture(); g.e.presentation.feedback = []; g.sync(); await assert.rejects(validatePresentation(g.input), /scope missing/);
});

test('nonvisual fix requires explanatory reply and honest representativeness reason', async () => {
  const f = fixture(); const entry = f.e.presentation.feedback[0]; entry.disposition = 'nonvisual-change'; entry.captureIds = [];
  entry.reason = 'Only the deterministic test setup changed; the rendered widget output is unchanged.';
  f.sync(); assert.match(f.reply().body, /No new capture is claimed/); assert.equal((await validatePresentation(f.input)).status, 'published');
  entry.captureIds = ['desktop']; f.sync(); await assert.rejects(validatePresentation(f.input), /cannot claim refreshed/);
});

test('edited/new feedback and old candidate replies invalidate scope or corresponding reply', async () => {
  const f = fixture(); f.source.body += ' Also check the mobile state.';
  f.input.feedback = presentationFeedback({ comments: [f.source], permissions: f.input.permissions });
  await assert.rejects(validatePresentation(f.input), /scope is stale/);
  const g = fixture(); g.reply().body = g.reply().body.replaceAll(head, 'e'.repeat(40));
  await assert.rejects(validatePresentation(g.input), /Missing\/stale corresponding/);
  const h = fixture(); h.input.feedback.push({ ...h.input.feedback[0], id: 11 });
  await assert.rejects(validatePresentation(h.input), /scope missing/);
});

test('native inline correlation, publisher identity and paired screen/state captures are required', async () => {
  const f = fixture(true); assert.equal((await validatePresentation(f.input)).status, 'published');
  f.reply().in_reply_to_id = 500; await assert.rejects(validatePresentation(f.input), /wrong native review thread/);
  const g = fixture(); g.reply().user = { id: 999, login: 'stranger', type: 'User' }; await assert.rejects(validatePresentation(g.input), /publisher identity/);
  const h = fixture(); h.e.presentation.feedback[0].captureIds = ['desktop']; h.sync(); await assert.rejects(validatePresentation(h.input), /requires current published/);
  const i = fixture(true); i.input.feedback[0].path = 'src/components/Other.tsx'; await assert.rejects(validatePresentation(i.input), /does not represent/);
});

test('actual prior revision replies remain linked and cannot be replaced in place', async () => {
  const f = fixture(); const old: Comment = { id: 15, user: author, created_at: '2026-10-25T10:00:00Z',
    body: renderScreenshotReply({ e: f.e, head: 'e'.repeat(40), digest: 'f'.repeat(64), repo: 'o/r', prNumber: 1, feedback: f.e.presentation.feedback[0] }) };
  f.input.comments.push(old); await assert.rejects(validatePresentation(f.input), /retained revision history/);
  f.sync([old]); assert.equal((await validatePresentation(f.input)).status, 'published'); assert.match(f.reply().body, /issuecomment-15/);
  old.id = 25; f.sync([old]); await assert.rejects(validatePresentation(f.input), /Append a new revision reply/);
});

test('only authenticated exact named presentation exceptions apply and are reported explicitly', async () => {
  const f = fixture(); f.e.presentation.exceptions.push({ id: 'E1', scope: 'feedback', targets: ['issue-comment:10'], rationale: 'Owner postpones only this feedback reply until the named design input arrives.' });
  f.sync(); await assert.rejects(validatePresentation(f.input), /authenticated exact owner waiver/);
  f.input.ownerWaiver = (id, rationale) => id === 'screenshot:E1' && rationale === f.e.presentation.exceptions[0].rationale;
  assert.equal((await validatePresentation(f.input)).status, 'owner-scoped-exceptions');
  f.e.presentation.exceptions[0].scope = 'security'; f.sync(); await assert.rejects(validatePresentation(f.input), /exact named scope/);
});

test('protocol replies are not fixer feedback and ordinary human comments remain unchanged', () => {
  const f = fixture(); f.reply().user = owner;
  const selection = selectFeedback({ comments: f.input.comments, permissions: f.input.permissions, headSha: head, now: Date.parse('2026-10-26T12:00:00Z') });
  assert.deepEqual(selection.map(c => c.id), [10]);
  assert.equal(presentationFeedback({ comments: f.input.comments, permissions: f.input.permissions }).length, 1);
  const entry = f.e.presentation.feedback[0], before = feedbackScopeDigest([entry]);
  assert.notEqual(feedbackScopeDigest([{ ...entry, disposition: 'not-change-feedback', reason: 'Unrelated coordination only.' }]), before);
});

test('trusted Git reader proves retained ancestry and exact committed path without URL fetches or writes', async () => {
  const calls: string[] = [], ref = 'codex/visual-evidence/pr-1', path = `screenshots/${head}/desktop.png`, branchHead = 'c'.repeat(40);
  const api = async (url: string) => { calls.push(url);
    if (url.includes('/git/ref/')) return { ref: `refs/heads/${ref}`, object: { type: 'commit', sha: branchHead } };
    if (url.includes('/compare/')) return { status: 'ahead', merge_base_commit: { sha: commit } };
    if (url.includes('/contents/')) return { type: 'file', path, sha: 'd'.repeat(40), size: 100 };
    throw Error('Unexpected read'); };
  const reader = publishedImages(api, 'o/r', 1); assert.deepEqual(await reader.read({ commit, ref, path }), { retained: true, gitBlob: 'd'.repeat(40) }); await reader.recheck();
  assert.equal(calls.filter(c => c.includes('/git/ref/')).length, 2);
  for (const value of [{ status: 'diverged', merge_base_commit: { sha: commit } }, { status: 'ahead', merge_base_commit: { sha: head } }]) {
    const failed = publishedImages(async (url: string) => url.includes('/compare/') ? value : api(url), 'o/r', 1);
    await assert.rejects(failed.read({ commit, ref, path }), /not retained/);
  }
  await assert.rejects(reader.read({ commit, ref, path: '../../outside.png' }), /publication path/);
  await assert.rejects(publishedImages(async () => { throw Error('Retained ref deleted'); }, 'o/r', 1).read({ commit, ref, path }), /ref deleted/);
});
