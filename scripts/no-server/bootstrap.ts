process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.CONCIERGE_FAKE_PROVIDER = process.env.CONCIERGE_FAKE_PROVIDER || '1';

import 'tsconfig-paths/register';

console.info('[no-server] bootstrap active; FAKE_PROVIDER=%s', process.env.CONCIERGE_FAKE_PROVIDER);
