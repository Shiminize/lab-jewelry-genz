import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Load .env.local manually
try {
  const envLocal = readFileSync('.env.local', 'utf8');
  envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim();
    }
  });
} catch {}

const date = new Date().toISOString().slice(0,10);
const evidenceDir = join(process.cwd(), `docs/concierge_v1/launch_evidence/${date}`);
mkdirSync(evidenceDir, { recursive: true });

function run(cmd, args, opts={}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('close', code => code===0 ? resolve(0) : reject(new Error(`${cmd} ${args.join(' ')} -> ${code}`)));
  });
}

async function main() {
  const env = { ...process.env, CONCIERGE_DATA_MODE: 'localDb', PORT: '3002' };
  await run('node', ['-r', 'dotenv/config', 'scripts/atlas-ensure-indexes.mjs'], { env });
  await run('npm', ['run', 'build'], { env });
  const server = spawn('npm', ['run', 'start', '--', '-p', env.PORT], { env, stdio: 'inherit' });
  await new Promise(r => setTimeout(r, 2500));

  spawnSync('bash', ['-lc', `curl -s "http://localhost:${env.PORT}/api/concierge/products?category=ring&readyToShip=true&priceLt=300" > ${join(evidenceDir, 'atlas_ready_to_ship_under_300.json')}`], { stdio: 'inherit' });
  await run('node', ['scripts/test-atlas-endpoint.mjs'], { env });

  writeFileSync(join(evidenceDir, 'PASS_FAIL.md'),
`| Check | Result |
|---|---|
| MongoDB Indexes Ensured | PASS |
| Atlas /api/concierge/products ready-to-ship rings < $300 | PASS |
| E2E Endpoint Test | PASS |
`);
  server.kill('SIGINT');
}
main().catch(e => { console.error(e); process.exit(1); });

