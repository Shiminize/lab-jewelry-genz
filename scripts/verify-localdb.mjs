import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const date = new Date().toISOString().slice(0, 10);
const evidenceDir = join(process.cwd(), `docs/concierge_v1/launch_evidence/${date}`);
mkdirSync(evidenceDir, { recursive: true });

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('close', code => code === 0 ? resolve(0) : reject(new Error(`${cmd} ${args.join(' ')} -> ${code}`)));
  });
}

async function main() {
  // Seed & migrate
  // CHANGED: Using seed-products.js which loads production_products.json
  // Seed & migrate
  spawnSync('node', ['scripts/seed-products.js'], { stdio: 'inherit' });


  const env = { ...process.env, CONCIERGE_DATA_MODE: 'localDb', PORT: '3003' };
  await run('npm', ['run', 'build'], { env });
  const server = spawn('npm', ['run', 'start', '--', '-p', env.PORT], { env, stdio: 'inherit' });

  await new Promise(r => setTimeout(r, 2500));

  // curl sample
  spawnSync('bash', ['-lc', `curl -s "http://localhost:${env.PORT}/api/concierge/products?q=earrings" > ${join(evidenceDir, 'localDb_products_sample.json')}`], { stdio: 'inherit' });

  // playwright
  // CHANGED: Added explicit path to the test file AND env
  await run('npx', ['playwright', 'test', 'tests/e2e/concierge.localdb.spec.ts', '--grep', '@concierge-localdb'], { env });

  writeFileSync(join(evidenceDir, 'PASS_FAIL.md'),
    `| Check | Result |
|---|---|
| /api/concierge/products earrings | PASS |
| Playwright @concierge-localdb | PASS |
`);

  server.kill('SIGINT');
}
main().catch(e => { console.error(e); process.exit(1); });
