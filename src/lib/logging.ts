export type LogFields = Record<string, unknown>

export function createLogger(base: LogFields = {}) {
  function withFields(fields?: LogFields) {
    return { ...base, ...(fields || {}), timestamp: new Date().toISOString() }
  }
  return {
    info(message: string, fields?: LogFields) {
      console.log(JSON.stringify({ level: 'info', message, ...withFields(fields) }))
    },
    warn(message: string, fields?: LogFields) {
      console.warn(JSON.stringify({ level: 'warn', message, ...withFields(fields) }))
    },
    error(message: string, fields?: LogFields) {
      console.error(JSON.stringify({ level: 'error', message, ...withFields(fields) }))
    },
  }
}

