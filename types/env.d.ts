declare namespace NodeJS {
  interface ProcessEnv {
    CONCIERGE_DATA_MODE?: 'stub' | 'localDb' | 'remoteApi'
    MONGODB_URI?: string
    MONGODB_DB?: string
    CONCIERGE_API_BASE?: string
    CONCIERGE_API_KEY?: string
  }
}
