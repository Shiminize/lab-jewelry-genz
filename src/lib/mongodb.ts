/**
 * MongoDB Connection Management - Legacy Compatibility
 * Re-exports mongoose connection utilities for backward compatibility
 */

export {
  connectToDatabase,
  checkDatabaseHealth,
  DatabaseMonitor,
  disconnectFromDatabase,
  withTransaction
} from './mongoose'

export { default } from './mongoose'