export type ConciergeDataMode = 'stub' | 'localDb' | 'remoteApi';

export const conciergeConfig = {
  mode: (process.env.CONCIERGE_DATA_MODE as ConciergeDataMode) || 'stub',
  remote: {
    baseUrl: process.env.CONCIERGE_API_BASE || '',
    apiKey: process.env.CONCIERGE_API_KEY || '',
    timeoutMs: 8000,
  },
} as const;
