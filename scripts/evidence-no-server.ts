import './no-server/bootstrap';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const date = new Date().toISOString().slice(0, 10);
const dir = resolve(process.cwd(), `docs/concierge_v1/launch_evidence/${date}`);
mkdirSync(dir, { recursive: true });

const run = spawnSync('npm', ['run', '-s', 'test:routes'], {
  env: { ...process.env, CONCIERGE_FAKE_PROVIDER: '1' },
});

writeFileSync(resolve(dir, 'no_server_route_sample.json'), run.stdout ?? Buffer.from(''));
writeFileSync(resolve(dir, 'no_server_route_stderr.txt'), run.stderr ?? Buffer.from(''));
console.log('Evidence written to', dir);
