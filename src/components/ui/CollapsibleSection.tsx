/**
 * CollapsibleSection - Reusable collapsible section wrapper
 * CLAUDE_RULES compliant: Generic, reusable UI pattern for any collapsible content
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCollapsibleSection } from '@/hooks/useCollapsibleSection'

import { MutedText } from '@/components/foundation/Typography'
interface CollapsibleSectionProps<T> {
  title: string
  items: T[]
  initialCount?: number
  renderItem: (item: T, index: number) => React.ReactNode
  renderGrid?: (children: React.ReactNode) => React.ReactNode
  className?: string
  expandButtonText?: string
  collapseButtonText?: string
  'data-testid'?: string
}

const defaultRenderGrid = (children: React.ReactNode) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {children}
  </div>
)

export function CollapsibleSection<T>({
  title,
  items,
  initialCount = 1,
  renderItem,
  renderGrid = defaultRenderGrid,
  className = '',
  expandButtonText = 'Show More',
  collapseButtonText = 'Show Less',
  'data-testid': dataTestId
}: CollapsibleSectionProps<T>) {
  const { isExpanded, toggle } = useCollapsibleSection({ initialCount })
  
  const visibleItems = items.slice(0, initialCount)
  const hiddenItems = items.slice(initialCount)
  const hasHiddenItems = hiddenItems.length > 0

  return (
    <section className={className} data-testid={dataTestId}>
      <Collapsible open={isExpanded} onOpenChange={toggle}>
        {/* Header with toggle button */}
        <div className="flex items-center justify-between mb-token-xl">
          <GradientAnimatedHeading size="h2" as="h2">
            {title}
          </GradientAnimatedHeading>
          {hasHiddenItems && (
            <CollapsibleTrigger asChild>
              <Button variant="default" size="md">
        
                <span className="text-sm">
                  {isExpanded ? collapseButtonText : expandButtonText}
                </span>
                <Icon
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  className="transition-transform duration-200"
                />
              
      </Button>
            </CollapsibleTrigger>
          )}
        </div>

        {/* Always visible items */}
        {visibleItems.length > 0 && (
          <div className="mb-token-lg">
            {renderGrid(
              visibleItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  {renderItem(item, index)}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Collapsible content - additional items */}
        {hasHiddenItems && (
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  {renderGrid(
                    hiddenItems.map((item, index) => (
                      <motion.div
                        key={initialCount + index}
                        variants={{
                          hidden: { opacity: 0, y: 20, scale: 0.95 },
                          visible: { 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            transition: { duration: 0.3 }
                          }
                        }}
                      >
                        {renderItem(item, initialCount + index)}
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        )}
      </Collapsible>
    </section>
  )
}

export default CollapsibleSection