'use client'

import React, { useState, useEffect } from 'react'
import { Eye, Package, User, Clock, Settings } from 'lucide-react'
import { OrderDetailsHeader } from './OrderDetailsHeader'
import { OrderDetailsItems } from './OrderDetailsItems'
import { OrderDetailsShipping } from './OrderDetailsShipping'
import { OrderDetailsPayment } from './OrderDetailsPayment'
import { OrderDetailsActions } from './OrderDetailsActions'

// Core interfaces (consolidated from original)
interface Address {
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface OrderItem {
  productName: string
  productImage: string
  productSKU: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: {
    material?: string
    gemstone?: string
    size?: string
    engraving?: { text: string; position: string }
  }
  creator?: {
    commissionRate: number
    commissionAmount: number
  }
}

interface ShippingDetails {
  method: string
  carrier?: string
  service?: string
  cost: number
  estimatedDelivery?: string
  trackingNumber?: string
  trackingUrl?: string
  shippedAt?: string
  deliveredAt?: string
}

interface PaymentDetails {
  method: string
  transactionId: string
  stripePaymentIntentId?: string
  last4?: string
  brand?: string
  amount: number
  currency: string
  fees?: { processing: number; platform: number }
  refunds?: Array<{ id: string; amount: number; reason: string; createdAt: string }>
}

interface AdminNote {
  id: string
  message: string
  isInternal: boolean
  createdAt: string
  createdBy: { name: string; role: string }
}

interface AdminMetadata {
  canBeCancelled: boolean
  canBeRefunded: boolean
  canBeShipped: boolean
  requiresAction: boolean
  riskLevel: 'low' | 'medium' | 'high'
  profitMargin: number
  fulfillmentPriority: 'low' | 'medium' | 'high' | 'urgent'
}

interface OrderDetailData {
  _id: string
  orderNumber: string
  email: string
  status: string
  paymentStatus: string
  shippingStatus: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  currency: string
  createdAt: string
  shippingAddress: Address
  billingAddress: Address
  items: OrderItem[]
  shipping: ShippingDetails
  payment: PaymentDetails
  adminNotes?: AdminNote[]
  adminMetadata: AdminMetadata
}

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
  onStatusUpdate?: (orderId: string, newStatus: string) => void
  onShippingUpdate?: (orderId: string, shippingData: any) => void
  onAddNote?: (orderId: string, note: string, isInternal: boolean) => void
}

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'customer', label: 'Customer', icon: User },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'actions', label: 'Actions', icon: Settings }
]

export function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
  onStatusUpdate,
  onShippingUpdate,
  onAddNote
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'customer' | 'timeline' | 'actions'>('overview')

  // Edit states
  const [editingStatus, setEditingStatus] = useState(false)
  const [editingShipping, setEditingShipping] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)

  // Form states
  const [statusForm, setStatusForm] = useState({
    status: '',
    message: '',
    notifyCustomer: true
  })

  const [shippingForm, setShippingForm] = useState({
    trackingNumber: '',
    carrier: '',
    service: '',
    estimatedDelivery: ''
  })

  const [noteForm, setNoteForm] = useState({
    note: '',
    isInternal: true
  })

  // Fetch order details
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    if (!orderId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const result = await response.json()

      if (result.success) {
        setOrder(result.data.order)
        // Initialize forms with current values
        setStatusForm({
          status: result.data.order.status,
          message: '',
          notifyCustomer: true
        })

        setShippingForm({
          trackingNumber: result.data.order.shipping?.trackingNumber || '',
          carrier: result.data.order.shipping?.carrier || '',
          service: result.data.order.shipping?.service || '',
          estimatedDelivery: result.data.order.shipping?.estimatedDelivery ?
            new Date(result.data.order.shipping.estimatedDelivery).toISOString().split('T')[0] : ''
        })
      } else {
        setError(result.error.message || 'Failed to fetch order details')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to fetch order:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order || !statusForm.status) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          status: statusForm.status,
          message: statusForm.message,
          notifyCustomer: statusForm.notifyCustomer
        })
      })

      const result = await response.json()
      if (result.success) {
        setOrder(result.data.order)
        setEditingStatus(false)
        setStatusForm({ ...statusForm, message: '' })
        onStatusUpdate?.(order._id, statusForm.status)
      } else {
        setError(result.error.message || 'Failed to update status')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleShippingUpdate = async () => {
    if (!order) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-shipping',
          ...shippingForm
        })
      })

      const result = await response.json()
      if (result.success) {
        setOrder(result.data.order)
        setEditingShipping(false)
        onShippingUpdate?.(order._id, shippingForm)
      } else {
        setError(result.error.message || 'Failed to update shipping')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!order || !noteForm.note.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-note',
          note: noteForm.note,
          isInternal: noteForm.isInternal
        })
      })

      const result = await response.json()
      if (result.success) {
        setOrder(result.data.order)
        setNoteForm({ note: '', isInternal: true })
        setEditingNotes(false)
        onAddNote?.(order._id, noteForm.note, noteForm.isInternal)
      } else {
        setError(result.error.message || 'Failed to add note')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-error/10 border-l-4 border-error/40">
            <p className="text-error">{error}</p>
          </div>
        )}

        {order && (
          <>
            {/* Header */}
            <OrderDetailsHeader
              orderNumber={order.orderNumber}
              email={order.email}
              status={order.status}
              createdAt={order.createdAt}
              onClose={onClose}
            />

            {/* Tab Navigation */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <OrderDetailsShipping
                    shippingAddress={order.shippingAddress}
                    shipping={order.shipping}
                    shippingStatus={order.shippingStatus}
                    shippingForm={shippingForm}
                    setShippingForm={setShippingForm}
                    editingShipping={editingShipping}
                    setEditingShipping={setEditingShipping}
                    onShippingUpdate={handleShippingUpdate}
                    saving={saving}
                  />
                  <OrderDetailsPayment
                    billingAddress={order.billingAddress}
                    payment={order.payment}
                    paymentStatus={order.paymentStatus}
                    total={order.total}
                    subtotal={order.subtotal}
                    shipping={order.shipping}
                    tax={order.tax}
                    discount={order.discount}
                    currency={order.currency}
                  />
                </div>
              )}

              {activeTab === 'items' && (
                <OrderDetailsItems items={order.items} />
              )}

              {activeTab === 'actions' && (
                <OrderDetailsActions
                  orderNumber={order.orderNumber}
                  status={order.status}
                  adminNotes={order.adminNotes}
                  adminMetadata={order.adminMetadata}
                  statusForm={statusForm}
                  setStatusForm={setStatusForm}
                  noteForm={noteForm}
                  setNoteForm={setNoteForm}
                  editingStatus={editingStatus}
                  setEditingStatus={setEditingStatus}
                  editingNotes={editingNotes}
                  setEditingNotes={setEditingNotes}
                  onStatusUpdate={handleStatusUpdate}
                  onAddNote={handleAddNote}
                  saving={saving}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}