/**
 * useCollapsibleSection - Reusable hook for collapsible section logic
 * CLAUDE_RULES compliant: Simple state management hook for reusability
 */

import { useState } from 'react'

interface UseCollapsibleSectionProps {
  initialCount?: number
  defaultExpanded?: boolean
}

export function useCollapsibleSection({ 
  initialCount = 1, 
  defaultExpanded = false 
}: UseCollapsibleSectionProps = {}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  const toggle = () => setIsExpanded(!isExpanded)
  const expand = () => setIsExpanded(true)
  const collapse = () => setIsExpanded(false)
  
  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    initialCount
  }
}

export default useCollapsibleSection