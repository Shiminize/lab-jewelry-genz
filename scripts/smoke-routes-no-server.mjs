import Module, { createRequire } from 'module';
import { resolve } from 'node:path';
import fs from 'node:fs';
import tsModule from 'typescript';
import tsconfigPaths from 'tsconfig-paths';

const ts = (tsModule && typeof tsModule === 'object' && 'default' in tsModule ? tsModule.default : tsModule);

process.env.CONCIERGE_FAKE_PROVIDER = '1';

const tsconfigResult = tsconfigPaths.loadConfig(process.cwd());
if (tsconfigResult.resultType === 'success') {
  tsconfigPaths.register({
    baseUrl: tsconfigResult.absoluteBaseUrl,
    paths: tsconfigResult.paths,
  });
}

Module._extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      moduleResolution: ts.ModuleResolutionKind.Node16,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const require = createRequire(import.meta.url);
const modPath = resolve(process.cwd(), 'src/app/api/concierge/products/route.ts');
const { GET } = require(modPath);

async function getJSON(qs) {
  const url = 'http://localhost/api/concierge/products' + (qs ? `?${qs}` : '');
  const req = new Request(url, { method: 'GET' });
  const res = await GET(req);
  const out = await res.json();
  return out;
}

const a = await getJSON('featured=true&readyToShip=true&limit=10');
const b = await getJSON('category=ring&readyToShip=true&priceLt=300');
console.log(JSON.stringify({ aCount: a.length, bCount: b.length, a, b }, null, 2));

if (!Array.isArray(a) || a.length === 0) {
  console.error('A empty');
  process.exit(1);
}
if (!Array.isArray(b) || b.some((x) => x.price >= 300)) {
  console.error('B price >= 300');
  process.exit(1);
}
console.error('SMOKE OK');
