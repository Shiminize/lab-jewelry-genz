import './no-server/bootstrap';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function importRoute() {
  const routePath = resolve(process.cwd(), 'src/app/api/concierge/products/route.ts');
  const mod = await import(pathToFileURL(routePath).href);
  if (!mod.GET) throw new Error('GET handler not found at ' + routePath);
  return mod.GET as (req: Request) => Promise<Response>;
}

async function getJSON(GET: (req: Request) => Promise<Response>, qs: string) {
  const url = 'http://localhost/api/concierge/products' + (qs ? `?${qs}` : '');
  const req = new Request(url, { method: 'GET' });
  const res = await GET(req);
  if (!res) throw new Error('No Response returned');
  if (!('ok' in res) || !(res as any).ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Route error ${res.status}: ${text}`);
  }
  return res.json();
}

(async () => {
  console.error('[no-server] Provider=%s', process.env.CONCIERGE_FAKE_PROVIDER === '1' ? 'FAKE' : (process.env.CONCIERGE_DATA_MODE || 'default'));
  const GET = await importRoute();
  const a = await getJSON(GET, 'featured=true&readyToShip=true&limit=10');
  const b = await getJSON(GET, 'category=ring&readyToShip=true&priceLt=300');
  console.log(JSON.stringify({ aCount: a.length, bCount: b.length, a, b }, null, 2));
  if (!Array.isArray(a) || a.length === 0) throw new Error('A empty (featured+readyToShip)');
  if (!Array.isArray(b) || b.some((x: any) => x.price >= 300)) throw new Error('B contains price >= 300');
  console.error('SMOKE OK');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
