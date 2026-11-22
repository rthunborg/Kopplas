import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Execute the actual inline workflow program without network or credentials.
const workflow = readFileSync(new URL('../../.github/workflows/merged-main-preview.yml', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const script = workflow.split('          script: |\n')[1].split('\n').map((line) => line.slice(12)).join('\n');
const execute = new (Object.getPrototypeOf(async function () {}).constructor)('github', 'context', 'core', script);
const newest = 'a'.repeat(40);
const older = 'b'.repeat(40);

function fixture({ mirror, main = newest, context = {}, readError, updateError, readback } = {}) {
  const writes = [];
  let destinationReads = 0;
  let summaryWrites = 0;
  const summary = Object.fromEntries(['addHeading', 'addTable', 'addRaw'].map((key) => [key, () => summary]));
  summary.write = async () => { summaryWrites++; };
  const github = { rest: { git: {
    getRef: async ({ ref }) => {
      if (ref === 'heads/main') return { data: { object: { type: 'commit', sha: main } } };
      assert.equal(ref, 'heads/codex/merged-main-preview');
      destinationReads++;
      if (readError) throw readError;
      if (destinationReads > 1 && readback) return { data: { object: { type: 'commit', sha: readback } } };
      if (!mirror) throw Object.assign(new Error('not found'), { status: 404 });
      return { data: { object: { type: 'commit', sha: mirror } } };
    },
    createRef: async (args) => { writes.push(['create', args]); mirror = args.sha; },
    updateRef: async (args) => {
      writes.push(['update', args]);
      if (updateError) throw updateError;
      mirror = args.sha;
    },
  } } };
  return {
    writes,
    summaries: () => summaryWrites,
    run: () => execute(github, {
      repo: { owner: 'rthunborg', repo: 'Kopplas' }, ref: 'refs/heads/main', eventName: 'push', sha: older, ...context,
    }, { summary }),
  };
}

test('first synchronization creates only the dedicated ref at live main, not stale event SHA', async () => {
  const f = fixture();
  await f.run();
  assert.deepEqual(f.writes, [['create', { owner: 'rthunborg', repo: 'Kopplas', ref: 'refs/heads/codex/merged-main-preview', sha: newest }]]);
  assert.equal(f.summaries(), 1);
});

test('existing mirror advances with force false and verified main SHA', async () => {
  const f = fixture({ mirror: older });
  await f.run();
  assert.deepEqual(f.writes, [['update', { owner: 'rthunborg', repo: 'Kopplas', ref: 'heads/codex/merged-main-preview', sha: newest, force: false }]]);
});

test('already synchronized mirror makes no write', async () => {
  const f = fixture({ mirror: newest });
  await f.run();
  assert.deepEqual(f.writes, []);
});

test('foreign repository, non-main ref and unauthorized event all refuse before writes', async () => {
  for (const context of [
    { repo: { owner: 'other', repo: 'Kopplas' } },
    { ref: 'refs/heads/feature' },
    { eventName: 'pull_request_target' },
  ]) {
    const f = fixture({ context });
    await assert.rejects(f.run(), /Only the trusted repository/);
    assert.deepEqual(f.writes, []);
  }
});

test('malformed main commit refuses before writes', async () => {
  const f = fixture({ main: 'main' });
  await assert.rejects(f.run(), /canonical commit SHA/);
  assert.deepEqual(f.writes, []);
});

test('permission errors do not become branch creation', async () => {
  const f = fixture({ readError: Object.assign(new Error('forbidden'), { status: 403 }) });
  await assert.rejects(f.run(), /forbidden/);
  assert.deepEqual(f.writes, []);
});

test('divergence fails without retry, force or create fallback', async () => {
  const f = fixture({ mirror: older, updateError: Object.assign(new Error('not a fast forward'), { status: 422 }) });
  await assert.rejects(f.run(), /not a fast forward/);
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0][1].force, false);
  assert.equal(f.summaries(), 0);
});

test('mismatched write readback cannot report synchronization success', async () => {
  const f = fixture({ mirror: older, readback: older });
  await assert.rejects(f.run(), /readback did not match/);
  assert.equal(f.summaries(), 0);
});
