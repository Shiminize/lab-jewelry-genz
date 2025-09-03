/**
 * Navigation Component Exports
 * CLAUDE_RULES compliant: Clean architecture with Service → Hook → Component layers
 * Aurora Design System colors, no dark mode support
 */

// Desktop Components
export { NavigationBar, DesktopNavigationBar } from './desktop/NavigationBar'
export { default as AppleDropdown } from './desktop/AppleDropdown'

// Mobile Components  
export { default as MobileDrawerV2 } from './mobile/MobileDrawerV2'
export { default as AppleMobileDrawer } from './mobile/AppleMobileDrawer' // Legacy - will be removed

// Shared Components
export { default as HydrationSafeNavigation } from './shared/HydrationSafeNavigation'
export { default as NavigationErrorBoundary } from './shared/NavigationErrorBoundary'

// Main Navigation Component (currently active)
export { default as FullWidthNavigation } from './FullWidthNavigation'