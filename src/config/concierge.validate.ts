import { conciergeConfig } from './concierge';

let printed = false;

export function validateConciergeEnv() {
  if (printed || process.env.NODE_ENV === 'production') return;
  printed = true;
  const { mode, remote } = conciergeConfig;
  const problems: string[] = [];
  if (!['stub', 'localDb', 'remoteApi'].includes(mode)) {
    problems.push(`Invalid CONCIERGE_DATA_MODE=${String(mode)}`);
  }
  if (mode === 'remoteApi') {
    if (!remote.baseUrl) problems.push('CONCIERGE_API_BASE required');
    if (!remote.apiKey) problems.push('CONCIERGE_API_KEY required');
  }
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.warn('[concierge/env] Issues:', problems);
  }
}
