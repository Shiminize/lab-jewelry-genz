/**
 * Filter Analytics Event Tracking
 * 
 * Tracks user interactions with the filter system for UX optimization
 */

export type FilterEvent = 
  | 'filter_pill_clicked'
  | 'filter_applied'
  | 'filter_preset_used'
  | 'quick_chip_toggled'
  | 'filter_dropdown_abandoned'
  | 'filter_reset'
  | 'time_to_first_filter'

export interface FilterEventData {
  event: FilterEvent
  filterType?: string
  filterValue?: string
  isActive?: boolean
  timestamp: number
  sessionId?: string
  resultCount?: number
}

/**
 * Track a filter event
 */
export function trackFilterEvent(data: Omit<FilterEventData, 'timestamp'>): void {
  const eventData: FilterEventData = {
    ...data,
    timestamp: Date.now(),
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Filter Analytics]', eventData)
  }
  
  // Send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined') {
    // Example: Google Analytics
    if ('gtag' in window) {
      (window as any).gtag('event', data.event, {
        filter_type: data.filterType,
        filter_value: data.filterValue,
        is_active: data.isActive,
        result_count: data.resultCount,
      })
    }
    
    // Example: Custom analytics endpoint
    // fetch('/api/analytics/filter', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(eventData),
    // }).catch(console.error)
  }
}

/**
 * Track filter pill click
 */
export function trackFilterPillClick(filterType: string): void {
  trackFilterEvent({
    event: 'filter_pill_clicked',
    filterType,
  })
}

/**
 * Track filter application
 */
export function trackFilterApplied(filterType: string, filterValue: string, resultCount: number): void {
  trackFilterEvent({
    event: 'filter_applied',
    filterType,
    filterValue,
    resultCount,
  })
}

/**
 * Track filter preset usage
 */
export function trackFilterPresetUsed(presetName: string): void {
  trackFilterEvent({
    event: 'filter_preset_used',
    filterType: 'preset',
    filterValue: presetName,
  })
}

/**
 * Track quick chip toggle
 */
export function trackQuickChipToggle(chipName: string, isActive: boolean): void {
  trackFilterEvent({
    event: 'quick_chip_toggled',
    filterType: 'quick_chip',
    filterValue: chipName,
    isActive,
  })
}

/**
 * Track filter dropdown abandonment (opened but not applied)
 */
export function trackFilterDropdownAbandoned(filterType: string): void {
  trackFilterEvent({
    event: 'filter_dropdown_abandoned',
    filterType,
  })
}

/**
 * Track filter reset
 */
export function trackFilterReset(resetType: 'all' | 'single', filterType?: string): void {
  trackFilterEvent({
    event: 'filter_reset',
    filterType: resetType === 'single' ? filterType : 'all',
  })
}

/**
 * Get session ID for tracking user sessions
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const SESSION_KEY = 'filter_session_id'
  const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes
  
  const stored = sessionStorage.getItem(SESSION_KEY)
  const storedTimestamp = sessionStorage.getItem(`${SESSION_KEY}_timestamp`)
  
  if (stored && storedTimestamp) {
    const elapsed = Date.now() - parseInt(storedTimestamp, 10)
    if (elapsed < SESSION_DURATION) {
      return stored
    }
  }
  
  // Create new session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  sessionStorage.setItem(SESSION_KEY, sessionId)
  sessionStorage.setItem(`${SESSION_KEY}_timestamp`, Date.now().toString())
  
  return sessionId
}

