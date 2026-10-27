import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ENTRIES = ['delivery_gate.py', 'state_update.py', 'state_plan.py', 'story_plan.py'];
/** Project-owned pre-transition wrapper. No installed state/result schema change. */
export function guardedCompletion({ baseline, entry, args = [], run = spawnSync, root = ROOT }) {
  if (!/^[0-9a-f]{40}$/.test(baseline ?? '') || !ENTRIES.includes(entry) || !Array.isArray(args) || args.some((arg) => typeof arg !== 'string')) throw new Error('Recorded full baseline and supported completion entry required.');
  const gate = run(process.execPath, [resolve(root, 'scripts/quality/frontend-controller.mjs'), 'local', '--base', baseline], { cwd: root, stdio: 'inherit', windowsHide: true });
  if (gate.status !== 0 || gate.error || gate.signal) return gate.status || 1;
  const result = run('python', [resolve(root, '.agents/skills/auto-bmad/scripts', entry), ...args], { cwd: root, stdio: 'inherit', windowsHide: true });
  return result.status === 0 && !result.error && !result.signal ? 0 : result.status || 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [baseline, entry, ...args] = process.argv.slice(2);
  try { process.exitCode = guardedCompletion({ baseline, entry, args }); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
