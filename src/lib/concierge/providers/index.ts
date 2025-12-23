import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { conciergeConfig } from '@/config/concierge';
import type { ConciergeDataProvider } from './types';
import { localDbProvider } from './localdb';

// TEST HOOK: allow route/unit tests to bypass live providers without a server/DB
const USE_FAKE = process.env.CONCIERGE_FAKE_PROVIDER === '1';

let fakeProviderPromise: Promise<ConciergeDataProvider> | null = null;

async function loadFakeProvider(): Promise<ConciergeDataProvider> {
  if (!fakeProviderPromise) {
    const abs = resolve(process.cwd(), 'tests/fakes/fakeProvider.ts');
    fakeProviderPromise = import(pathToFileURL(abs).href)
      .then((mod) => {
        if (!mod.fakeProvider) {
          throw new Error('fakeProvider export missing');
        }
        console.info('[providers] Using FAKE provider from', abs);
        return mod.fakeProvider as ConciergeDataProvider;
      })
      .catch((error) => {
        console.error('[providers] Failed to load FAKE provider at', abs, error);
        fakeProviderPromise = null;
        throw error;
      });
  }

  return fakeProviderPromise;
}

let stubProvider: ConciergeDataProvider | null = null;
let remoteApiProvider: ConciergeDataProvider | null = null;
try { stubProvider = require('./stub').stubProvider; } catch {}
try { remoteApiProvider = require('./remote').remoteApiProvider; } catch {}

export function getProvider(): ConciergeDataProvider {
  if (USE_FAKE) {
    const proxy: ConciergeDataProvider = {
      async listProducts(filter) {
        const provider = await loadFakeProvider();
        return provider.listProducts(filter);
      },
      async getProduct(id) {
        const provider = await loadFakeProvider();
        return provider.getProduct(id);
      },
    } as ConciergeDataProvider;

    return proxy;
  }

  switch (conciergeConfig.mode) {
    case 'localDb':
      return localDbProvider;
    case 'remoteApi':
      return remoteApiProvider ?? localDbProvider;
    default:
      return stubProvider ?? localDbProvider;
  }
}
