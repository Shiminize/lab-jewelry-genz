'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterPillProps {
  label: string
  count?: number
  active?: boolean
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

/**
 * FilterPill Component
 * 
 * Horizontal pill-shaped button for filter controls.
 * Opens dropdown when clicked, shows count badge when filters are active.
 * 
 * @example
 * <FilterPill
 *   label="Category"
 *   count={1}
 *   active={true}
 *   onClick={() => setIsOpen(true)}
 *   aria-expanded={isOpen}
 *   aria-controls="category-dropdown"
 * />
 */
export function FilterPill({
  label,
  count,
  active = false,
  onClick,
  icon,
  className,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
}: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-label={`${label} filter${count ? `, ${count} selected` : ''}`}
      className={cn(
        // Base styles - sausage shape
        'inline-flex flex-shrink-0 min-h-[44px] items-center gap-2 rounded-full px-4 py-2',
        'border border-border-subtle/70 bg-surface-base',
        'text-[0.72rem] font-semibold uppercase tracking-[0.22em]',
        'transition-all duration-200',
        'whitespace-nowrap',
        
        // Hover state
        'hover:border-border-strong hover:shadow-sm',
        
        // Active state (has selections)
        active && [
          'border-accent-primary/40 bg-neutral-50 text-text-primary shadow-soft',
        ],
        
        // Default state
        !active && 'text-text-secondary hover:text-text-primary',
        
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent-primary focus-visible:ring-offset-2',
        'focus-visible:ring-offset-surface-base',
        
        className
      )}
    >
      {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span 
          className="rounded-full bg-surface-panel px-2 py-0.5 text-xs font-medium"
          aria-label={`${count} filter${count !== 1 ? 's' : ''} applied`}
        >
          {count}
        </span>
      )}
      <ChevronDown 
        className={cn(
          'h-3.5 w-3.5 opacity-60 transition-transform duration-200 flex-shrink-0',
          ariaExpanded && 'rotate-180'
        )} 
        aria-hidden="true"
      />
    </button>
  )
}
