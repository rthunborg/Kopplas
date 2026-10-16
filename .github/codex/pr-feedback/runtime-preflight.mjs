import { spawn, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Only initialize/initialized are sent: no thread, turn, prompt, or model request.
// Empty child environment and fresh fixture home contain no inference credentials.
const expectDenied = process.argv[2] === '--expect-denied';
const executable = execFileSync('which', ['codex'], { encoding: 'utf8' }).trim();
const child = spawn('sudo', ['-u', 'prfix-codex', '--', 'env', '-i',
  'HOME=/home/prfix-codex', 'PATH=/usr/local/bin:/usr/bin:/bin',
  'bash', '--noprofile', '--norc', '-c',
  'cd /home/prfix-codex/workspace && exec "$1" app-server --listen stdio://',
  'runtime-preflight', executable], {
  cwd: '/home/prfix-codex', stdio: ['pipe', 'pipe', 'pipe'],
});
let initialized = false;
let output = '';
let errorOutput = '';
let overflow = false;
child.stderr.on('data', (chunk) => {
  if (errorOutput.length < 65536) errorOutput += chunk.toString().slice(0, 65536 - errorOutput.length);
});
child.stdout.on('data', (chunk) => {
  output += chunk.toString();
  if (output.length > 65536) { overflow = true; output = ''; child.stdout.pause(); child.stdin.end(); return; }
  let end;
  while ((end = output.indexOf('\n')) !== -1) {
    const line = output.slice(0, end);
    output = output.slice(end + 1);
    let response;
    try { response = JSON.parse(line); } catch { continue; }
    if (response.id === 1 && response.result && !response.error) {
      initialized = true;
      child.stdin.end(JSON.stringify({ jsonrpc: '2.0', method: 'initialized' }) + '\n');
    }
  }
});
child.stdin.on('error', () => { /* Startup refusal may close stdin before initialize. */ });
const timer = setTimeout(() => {
  // This account was created only for this disposable hosted test job.
  try { execFileSync('sudo', ['pkill', '-KILL', '-u', 'prfix-codex'], { stdio: 'ignore' }); } catch { /* Exit checked below. */ }
}, 30000);
try {
  const code = await new Promise((resolve, reject) => {
    child.once('error', () => reject(new Error('Codex runtime preflight could not start.')));
    child.once('close', resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { clientInfo: { name: 'pr-feedback-runtime-preflight', version: '1.0.0' } } }) + '\n');
  });
  if (overflow || (expectDenied ? initialized || code === 0 || !/Permission denied/i.test(errorOutput) : !initialized || code !== 0)) throw new Error('Codex runtime preflight did not produce the expected initialization outcome.');
  if (!expectDenied && !/^[0-9a-f-]{36}$/.test(readFileSync('/home/prfix-codex/.codex/installation_id', 'utf8').trim())) throw new Error('Codex did not persist its runtime installation identifier.');
  console.log(expectDenied ? 'Original immutable layout reproduces permission refusal.' : 'Pinned Codex initialization and EOF shutdown passed without inference.');
} finally {
  clearTimeout(timer);
}
