'use client'

import type { ConciergeIntent } from '../types'
import type { IntentHandler } from './types'
import { handleFindProduct } from './findProduct'
import { handleTrackOrder } from './trackOrder'
import { handleReturnExchange } from './returnExchange'
import { handleSizingRepairs } from './sizingRepairs'
import { handleCareWarranty } from './careWarranty'
import { handleFinancing } from './financing'
import { handleStylistContact } from './stylistContact'
import { handleCsat } from './csat'

export const intentHandlers: Record<ConciergeIntent, IntentHandler> = {
  find_product: handleFindProduct,
  track_order: handleTrackOrder,
  return_exchange: handleReturnExchange,
  sizing_repairs: handleSizingRepairs,
  care_warranty: handleCareWarranty,
  financing: handleFinancing,
  stylist_contact: handleStylistContact,
  csat: handleCsat,
}

export * from './types'
