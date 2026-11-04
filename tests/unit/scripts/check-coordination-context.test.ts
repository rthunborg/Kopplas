import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = resolve('scripts/maintenance/check-coordination-context.mjs');
const monitor = 'Current packet: private/CURRENT.md\nAuthority: retained evidence\nHolds: both held\nGates: all existing gates\n';
const packet = ['Revision','Authority','Ownership','Holds','Candidate','Pins','Running','Dimensions','Blockers','Evidence','Next action'].map(key => `${key}: retained`).join('\n') + '\n';
type Fixture = { dir: string; m: string; p: string; r: string; invoke: (extra?: string[], args?: string[]) => ReturnType<typeof invokeCli> };
function invokeCli(args: string[]) { return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }); }
function fixture(run: (value: Omit<Fixture, 'invoke'> & { invoke: (extra?: string[], args?: string[]) => ReturnType<typeof invokeCli> & { data: { ok: boolean; reason: string; counts: Record<string, number> } } }) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'coordination-'));
  const m = join(dir, 'monitor.txt'), p = join(dir, 'packet.txt'), r = join(dir, 'readback.txt');
  writeFileSync(m, monitor); writeFileSync(p, packet); writeFileSync(r, monitor);
  const invoke = (extra: string[] = [], args: string[] = ['--monitor', m, '--packet', p]) => {
    const result = invokeCli([...args, ...extra]);
    assert.equal(result.stderr, '');
    return { ...result, data: JSON.parse(result.stdout) };
  };
  try { run({ dir, m, p, r, invoke }); } finally { rmSync(dir, { recursive: true, force: true }); }
}
for (const [kind, limit, base] of [['monitor',4000,monitor], ['packet',12000,packet]] as const) {
  for (const [suffix, expected] of [['at',0],['over',1]]) test(`${kind} ${suffix} scalar bound with astral Unicode`, () => fixture(({m,p,invoke}) => {
    const content = base + '😀'.repeat(limit - [...base].length + (suffix === 'over' ? 1 : 0));
    writeFileSync(kind === 'monitor' ? m : p, content);
    const result = invoke(); assert.equal(result.status, expected);
    assert.equal(result.data.counts[kind], limit + (suffix === 'over' ? 1 : 0));
  }));
}
test('exact readback succeeds and never modifies inputs', () => fixture(({m,p,r,invoke}) => {
  const before = [m,p,r].map(path => readFileSync(path));
  const result = invoke(['--readback',r]); assert.equal(result.status,0);
  [m,p,r].forEach((path,index) => assert.deepEqual(readFileSync(path),before[index]));
}));
test('different valid readback fails exact identity', () => fixture(({r,invoke}) => {
  writeFileSync(r,monitor+' '); const result=invoke(['--readback',r]);
  assert.equal(result.status,1);assert.equal(result.data.reason,'READBACK_MISMATCH');
}));
test('readback bounds and fields are checked', () => fixture(({r,invoke}) => {
  for (const value of ['x', monitor+'x'.repeat(4001)]) {
    writeFileSync(r,value);assert.equal(invoke(['--readback',r]).status,1);
  }
}));
test('strict argument validation', () => fixture(({m,p,invoke}) => {
  for (const args of [[], ['--monitor',m], ['--monitor',m,'--packet'], ['--monitor',m,'--packet',p,'--monitor',m], ['--unknown','secret'], ['--monitor','', '--packet',p]]) {
    const result=invoke([],args);assert.equal(result.status,1);assert.equal(result.data.reason,'INVALID_ARGUMENTS');
  }
}));
test('missing and directory inputs fail safely', () => fixture(({dir,m,invoke}) => {
  rmSync(m);assert.equal(invoke().status,1);mkdirSync(m);assert.equal(invoke().data.reason,'INVALID_FILE');
}));
test('invalid UTF8 including surrogate encoding is refused', () => fixture(({m,invoke}) => {
  for(const bytes of [[0xff],[0xed,0xa0,0x80],[0xf0,0x9f]]) {
    writeFileSync(m,Buffer.from(bytes));assert.equal(invoke().data.reason,'INVALID_UTF8');
  }
}));
test('empty, missing, blank and duplicate fields fail closed', () => fixture(({m,p,invoke}) => {
  for(const value of ['',monitor.replace('Authority: retained evidence',''),monitor.replace('Authority: retained evidence','Authority: '),monitor+'Authority: duplicate\n']) {
    writeFileSync(m,value);assert.equal(invoke().data.reason,'INVALID_FIELDS');
  }
  writeFileSync(m,monitor);writeFileSync(p,packet.replace('Pins: retained',''));assert.equal(invoke().data.reason,'INVALID_FIELDS');
}));
test('bounded byte read refuses huge inputs', () => fixture(({m,invoke}) => {
  writeFileSync(m,Buffer.alloc(16001,65));assert.equal(invoke().data.reason,'BYTE_LIMIT');
}));
test('sentinel content and paths are never echoed on success or failure', () => fixture(({dir,m,p,r,invoke}) => {
  const secret='SENTINEL_PRIVATE_NEVER_ECHO_123';
  const missing=join(dir,secret);const cases=[];
  writeFileSync(m,monitor+secret);cases.push(invoke());cases.push(invoke(['--readback',r]));
  cases.push(invoke([],['--monitor',missing,'--packet',p]));
  cases.push(invoke([],['--unknown',secret]));
  writeFileSync(m,monitor+secret+'x'.repeat(16001));cases.push(invoke());
  for(const result of cases) {assert.ok(!result.stdout.includes(secret));assert.ok(!result.stdout.includes(dir));assert.equal(result.stderr,'');}
}));
