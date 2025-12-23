'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionProps {
  items: {
    value: string
    trigger: React.ReactNode
    content: React.ReactNode
  }[]
  defaultValue?: string
  className?: string
}

export function Accordion({ items, defaultValue, className }: AccordionProps) {
  const [openValue, setOpenValue] = React.useState<string | undefined>(defaultValue)

  const handleToggle = (value: string) => {
    setOpenValue(openValue === value ? undefined : value)
  }

  return (
    <div className={cn('w-full border-t border-border-strong', className)}>
      {items.map((item) => (
        <div key={item.value} className="border-b border-border-strong">
          <button
            type="button"
            onClick={() => handleToggle(item.value)}
            className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary focus:ring-inset"
            aria-expanded={openValue === item.value}
          >
            <span className="font-heading text-lg text-text-primary">{item.trigger}</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-text-secondary transition-transform duration-200',
                openValue === item.value ? 'rotate-180' : ''
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-in-out',
              openValue === item.value ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="pb-6 pt-2 text-base leading-relaxed text-text-secondary">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
