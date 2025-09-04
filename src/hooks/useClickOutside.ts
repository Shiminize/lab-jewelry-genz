import { useEffect, useCallback, RefObject } from 'react'

interface UseClickOutsideOptions {
  enabled?: boolean
  onClickOutside: () => void
}

/**
 * Custom hook for handling clicks outside of specified elements
 * CLAUDE_RULES compliant: Clean separation of UI logic
 * 
 * @param refs Array of refs or single ref to elements that should not trigger the callback
 * @param options Configuration including the callback to execute on outside click
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T> | RefObject<T>[],
  { enabled = true, onClickOutside }: UseClickOutsideOptions
): void {
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!enabled) return

    const target = event.target as Element
    const refArray = Array.isArray(refs) ? refs : [refs]
    
    // Check if click is outside all specified elements
    const isOutside = refArray.every(ref => {
      return ref.current && !ref.current.contains(target)
    })

    if (isOutside) {
      onClickOutside()
    }
  }, [refs, enabled, onClickOutside])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    if (event.key === 'Escape') {
      onClickOutside()
    }
  }, [enabled, onClickOutside])

  useEffect(() => {
    if (enabled) {
      // Add event listeners
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        // Clean up event listeners
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [enabled, handleClickOutside, handleKeyDown])
}

export type { UseClickOutsideOptions }