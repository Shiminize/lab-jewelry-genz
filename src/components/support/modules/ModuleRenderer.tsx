'use client'

import type { ModulePayload } from '@/lib/concierge/types'
import { ProductFilterForm } from './ProductFilterForm'
import { ProductCarousel } from './ProductCarousel'
import { OrderLookupForm } from './OrderLookupForm'
import { OrderTimeline } from './OrderTimeline'
import { ReturnOptions } from './ReturnOptions'
import { EscalationForm } from './EscalationForm'
import { CsatPrompt } from './CsatPrompt'
import { QuickFilters } from './QuickFilters'
import { ShortlistPanel } from './ShortlistPanel'
import { IntentChooser } from './IntentChooser'

export interface ModuleRendererProps {
  module: ModulePayload
  isProcessing?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

export function ModuleRenderer({ module, onAction, isProcessing }: ModuleRendererProps) {
  switch (module.type) {
    case 'product-filter':
      return <ProductFilterForm payload={module} onAction={onAction} disabled={isProcessing} />
    case 'product-carousel':
      return <ProductCarousel payload={module} onAction={onAction} disabled={isProcessing} />
    case 'order-lookup':
      return <OrderLookupForm payload={module} onAction={onAction} disabled={isProcessing} />
    case 'order-timeline':
      return <OrderTimeline payload={module} onAction={onAction} />
    case 'return-options':
      return <ReturnOptions payload={module} onAction={onAction} disabled={isProcessing} />
    case 'escalation-form':
      return <EscalationForm payload={module} onAction={onAction} disabled={isProcessing} />
    case 'csat-prompt':
      return <CsatPrompt payload={module} onAction={onAction} disabled={isProcessing} />
    case 'quick-filters':
      return <QuickFilters payload={module} onAction={onAction} />
    case 'shortlist-panel':
      return <ShortlistPanel payload={module} onAction={onAction} disabled={isProcessing} />
    case 'intent-chooser':
      return <IntentChooser payload={module} onAction={onAction} disabled={isProcessing} />
    default:
      return null
  }
}
