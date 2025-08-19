'use client'

import React, { useState, useEffect } from 'react'
import { 
  X,
  Edit3,
  Save,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  FileText,
  Calendar,
  Eye,
  Copy,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Extended order interface for admin modal
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
  isGuest: boolean
  
  // Customer information
  userId?: {
    _id: string
    name: string
    email: string
    phone?: string
    createdAt: string
  }
  guestDetails?: {
    firstName: string
    lastName: string
    email: string
    marketingOptIn: boolean
  }
  
  // Address information
  shippingAddress: Address
  billingAddress: Address
  
  // Items
  items: OrderItem[]
  
  // Shipping details
  shipping: ShippingDetails
  
  // Payment details
  payment: PaymentDetails
  
  // Timeline and notes
  timeline: TimelineEvent[]
  adminNotes?: AdminNote[]
  
  // Admin metadata
  adminMetadata: {
    canBeCancelled: boolean
    canBeRefunded: boolean
    canBeShipped: boolean
    requiresAction: boolean
    riskLevel: 'low' | 'medium' | 'high'
    profitMargin: number
    fulfillmentPriority: 'low' | 'medium' | 'high' | 'urgent'
  }
  
  // Customer metrics
  customerMetrics: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    firstOrderDate: string
    lastOrderDate: string
  }
  
  customerOrderHistory: Array<{
    orderNumber: string
    status: string
    total: number
    createdAt: string
  }>
}

interface Address {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

interface OrderItem {
  productId: string
  productName: string
  productSKU: string
  productImage: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: {
    material?: string
    gemstone?: string
    size?: string
    engraving?: {
      text: string
      font: string
      position: string
    }
  }
  creator?: {
    creatorId: string
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
  fees?: {
    processing: number
    platform: number
  }
  refunds?: Array<{
    id: string
    amount: number
    reason: string
    createdAt: string
  }>
}

interface TimelineEvent {
  status: string
  message: string
  createdAt: string
  updatedBy?: string
}

interface AdminNote {
  note: string
  isInternal: boolean
  createdAt: string
  createdBy: string
}

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
}

export default function OrderDetailModal({ isOpen, onClose, orderId }: OrderDetailModalProps) {
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
        // Initialize form states with current values
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

  // Handle status update
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
      } else {
        setError(result.error.message || 'Failed to update status')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Handle shipping update
  const handleShippingUpdate = async () => {
    if (!order) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-tracking',
          ...shippingForm
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setOrder(result.data.order)
        setEditingShipping(false)
      } else {
        setError(result.error.message || 'Failed to update shipping')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Handle add note
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background max-w-4xl w-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div>
            <H2 className="text-foreground">
              {order ? `Order ${order.orderNumber}` : 'Loading Order...'}
            </H2>
            {order && (
              <BodyText className="text-gray-600 bg-white">
                Created {new Date(order.createdAt).toLocaleString()}
              </BodyText>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchOrderDetails} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && !order && (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <BodyText className="text-red-800">{error}</BodyText>
                <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order Content */}
        {order && (
          <>
            {/* Tabs */}
            <div className="flex border-b bg-white">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'items', label: 'Items', icon: Package },
                { id: 'customer', label: 'Customer', icon: User },
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'actions', label: 'Actions', icon: Edit3 }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-accent text-accent bg-accent/5"
                        : "border-transparent text-gray-600 hover:text-foreground hover:border-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && <OverviewTab order={order} />}
              {activeTab === 'items' && <ItemsTab order={order} />}
              {activeTab === 'customer' && <CustomerTab order={order} />}
              {activeTab === 'timeline' && <TimelineTab order={order} />}
              {activeTab === 'actions' && (
                <ActionsTab 
                  order={order}
                  statusForm={statusForm}
                  setStatusForm={setStatusForm}
                  shippingForm={shippingForm}
                  setShippingForm={setShippingForm}
                  noteForm={noteForm}
                  setNoteForm={setNoteForm}
                  editingStatus={editingStatus}
                  setEditingStatus={setEditingStatus}
                  editingShipping={editingShipping}
                  setEditingShipping={setEditingShipping}
                  editingNotes={editingNotes}
                  setEditingNotes={setEditingNotes}
                  onStatusUpdate={handleStatusUpdate}
                  onShippingUpdate={handleShippingUpdate}
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

// Tab Components
const OverviewTab = ({ order }: { order: OrderDetailData }) => (
  <div className="space-y-6">
    {/* Status Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatusCard
        title="Order Status"
        status={order.status}
        type="order"
        icon={Package}
        description="Current order processing status"
      />
      <StatusCard
        title="Payment Status"
        status={order.paymentStatus}
        type="payment"
        icon={CreditCard}
        description="Payment processing status"
      />
      <StatusCard
        title="Shipping Status"
        status={order.shippingStatus}
        type="shipping"
        icon={Truck}
        description="Fulfillment and delivery status"
      />
    </div>

    {/* Order Summary */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Financial Summary */}
      <div className="text-foreground bg-white rounded-lg border p-4">
        <H3 className="mb-4 text-foreground">Order Summary</H3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <BodyText className="text-gray-600 bg-white">Subtotal:</BodyText>
            <BodyText className="text-foreground">${order.subtotal.toFixed(2)}</BodyText>
          </div>
          <div className="flex justify-between">
            <BodyText className="text-gray-600 bg-white">Shipping:</BodyText>
            <BodyText className="text-foreground">${order.shipping.toFixed(2)}</BodyText>
          </div>
          <div className="flex justify-between">
            <BodyText className="text-gray-600 bg-white">Tax:</BodyText>
            <BodyText className="text-foreground">${order.tax.toFixed(2)}</BodyText>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <BodyText>Discount:</BodyText>
              <BodyText>-${order.discount.toFixed(2)}</BodyText>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <BodyText className="text-foreground">Total:</BodyText>
            <BodyText className="text-foreground">${order.total.toFixed(2)} {order.currency}</BodyText>
          </div>
        </div>
      </div>

      {/* Admin Metadata */}
      <div className="text-foreground bg-white rounded-lg border p-4">
        <H3 className="mb-4 text-foreground">Admin Information</H3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <BodyText className="text-gray-600 bg-white">Risk Level:</BodyText>
            <RiskBadge level={order.adminMetadata.riskLevel} />
          </div>
          <div className="flex justify-between">
            <BodyText className="text-gray-600 bg-white">Profit Margin:</BodyText>
            <BodyText className="text-foreground">${order.adminMetadata.profitMargin.toFixed(2)}</BodyText>
          </div>
          <div className="flex justify-between items-center">
            <BodyText className="text-gray-600 bg-white">Priority:</BodyText>
            <PriorityBadge priority={order.adminMetadata.fulfillmentPriority} />
          </div>
          <div className="flex justify-between items-center">
            <BodyText className="text-gray-600 bg-white">Actions Required:</BodyText>
            {order.adminMetadata.requiresAction ? (
              <span className="text-orange-600 font-medium">Yes</span>
            ) : (
              <span className="text-green-600 font-medium">None</span>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Addresses */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AddressCard title="Shipping Address" address={order.shippingAddress} />
      <AddressCard title="Billing Address" address={order.billingAddress} />
    </div>
  </div>
)

const ItemsTab = ({ order }: { order: OrderDetailData }) => (
  <div className="space-y-4">
    <H3 className="text-foreground">Order Items ({order.items.length})</H3>
    {order.items.map((item, index) => (
      <div key={index} className="text-foreground bg-white rounded-lg border p-4">
        <div className="flex items-start gap-4">
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <H3 className="text-foreground">{item.productName}</H3>
            <BodyText className="text-gray-600 bg-white">SKU: {item.productSKU}</BodyText>
            <BodyText className="text-gray-600 bg-white">
              Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
            </BodyText>
            
            {/* Customizations */}
            {item.customizations && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <BodyText size="sm" className="font-medium text-gray-700">Customizations:</BodyText>
                {item.customizations.material && (
                  <BodyText size="sm" className="text-gray-600">Material: {item.customizations.material}</BodyText>
                )}
                {item.customizations.gemstone && (
                  <BodyText size="sm" className="text-gray-600">Gemstone: {item.customizations.gemstone}</BodyText>
                )}
                {item.customizations.size && (
                  <BodyText size="sm" className="text-gray-600">Size: {item.customizations.size}</BodyText>
                )}
                {item.customizations.engraving && (
                  <BodyText size="sm" className="text-gray-600">
                    Engraving: "{item.customizations.engraving.text}"
                  </BodyText>
                )}
              </div>
            )}
            
            {/* Creator Commission */}
            {item.creator && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <BodyText size="sm" className="font-medium text-blue-700">Creator Commission:</BodyText>
                <BodyText size="sm" className="text-blue-600">
                  {item.creator.commissionRate}% - ${item.creator.commissionAmount.toFixed(2)}
                </BodyText>
              </div>
            )}
          </div>
          <div className="text-right">
            <BodyText className="font-semibold text-foreground">
              ${item.totalPrice.toFixed(2)}
            </BodyText>
          </div>
        </div>
      </div>
    ))}
  </div>
)

const CustomerTab = ({ order }: { order: OrderDetailData }) => (
  <div className="space-y-6">
    {/* Customer Information */}
    <div className="text-foreground bg-white rounded-lg border p-4">
      <H3 className="mb-4 text-foreground">Customer Information</H3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <BodyText size="sm" className="text-gray-600 bg-white">Name:</BodyText>
          <BodyText className="text-foreground">
            {order.userId?.name || `${order.guestDetails?.firstName} ${order.guestDetails?.lastName}`}
          </BodyText>
        </div>
        <div>
          <BodyText size="sm" className="text-gray-600 bg-white">Email:</BodyText>
          <BodyText className="text-foreground">{order.email}</BodyText>
        </div>
        <div>
          <BodyText size="sm" className="text-gray-600 bg-white">Customer Type:</BodyText>
          <BodyText className="text-foreground">
            {order.isGuest ? 'Guest Customer' : 'Registered Customer'}
          </BodyText>
        </div>
        {order.userId && (
          <div>
            <BodyText size="sm" className="text-gray-600 bg-white">Member Since:</BodyText>
            <BodyText className="text-foreground">
              {new Date(order.userId.createdAt).toLocaleDateString()}
            </BodyText>
          </div>
        )}
      </div>
    </div>

    {/* Customer Metrics */}
    <div className="text-foreground bg-white rounded-lg border p-4">
      <H3 className="mb-4 text-foreground">Customer Metrics</H3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <BodyText className="text-2xl font-bold text-accent">
            {order.customerMetrics.totalOrders}
          </BodyText>
          <BodyText size="sm" className="text-gray-600 bg-white">Total Orders</BodyText>
        </div>
        <div className="text-center">
          <BodyText className="text-2xl font-bold text-accent">
            ${order.customerMetrics.totalSpent.toFixed(0)}
          </BodyText>
          <BodyText size="sm" className="text-gray-600 bg-white">Total Spent</BodyText>
        </div>
        <div className="text-center">
          <BodyText className="text-2xl font-bold text-accent">
            ${order.customerMetrics.averageOrderValue.toFixed(0)}
          </BodyText>
          <BodyText size="sm" className="text-gray-600 bg-white">Avg Order Value</BodyText>
        </div>
        <div className="text-center">
          <BodyText className="text-2xl font-bold text-accent">
            {Math.floor((new Date().getTime() - new Date(order.customerMetrics.firstOrderDate).getTime()) / (1000 * 60 * 60 * 24))}
          </BodyText>
          <BodyText size="sm" className="text-gray-600 bg-white">Days as Customer</BodyText>
        </div>
      </div>
    </div>

    {/* Order History */}
    <div className="text-foreground bg-white rounded-lg border p-4">
      <H3 className="mb-4 text-foreground">Recent Order History</H3>
      <div className="space-y-2">
        {order.customerOrderHistory.map((historyOrder, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <div>
              <BodyText className="text-foreground">{historyOrder.orderNumber}</BodyText>
              <BodyText size="sm" className="text-gray-600 bg-white">
                {new Date(historyOrder.createdAt).toLocaleDateString()}
              </BodyText>
            </div>
            <div className="text-right">
              <BodyText className="text-foreground">${historyOrder.total.toFixed(2)}</BodyText>
              <StatusBadge status={historyOrder.status} type="order" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const TimelineTab = ({ order }: { order: OrderDetailData }) => (
  <div className="space-y-4">
    <H3 className="text-foreground">Order Timeline</H3>
    <div className="space-y-4">
      {order.timeline.map((event, index) => (
        <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BodyText className="font-medium text-foreground">{event.status}</BodyText>
              <BodyText size="sm" className="text-gray-600 bg-white">
                {new Date(event.createdAt).toLocaleString()}
              </BodyText>
            </div>
            <BodyText className="text-gray-600 bg-white">{event.message}</BodyText>
            {event.updatedBy && (
              <BodyText size="sm" className="text-gray-500">Updated by: {event.updatedBy}</BodyText>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Admin Notes */}
    {order.adminNotes && order.adminNotes.length > 0 && (
      <div className="mt-6">
        <H3 className="text-foreground mb-4">Admin Notes</H3>
        <div className="space-y-3">
          {order.adminNotes.map((note, index) => (
            <div key={index} className="text-foreground bg-white rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <BodyText size="sm" className="text-gray-600 bg-white">
                  {new Date(note.createdAt).toLocaleString()}
                </BodyText>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  note.isInternal ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                )}>
                  {note.isInternal ? 'Internal' : 'Customer'}
                </span>
              </div>
              <BodyText className="text-foreground">{note.note}</BodyText>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

const ActionsTab = ({ 
  order, 
  statusForm, 
  setStatusForm, 
  shippingForm, 
  setShippingForm,
  noteForm,
  setNoteForm,
  editingStatus,
  setEditingStatus,
  editingShipping,
  setEditingShipping,
  editingNotes,
  setEditingNotes,
  onStatusUpdate,
  onShippingUpdate,
  onAddNote,
  saving
}: {
  order: OrderDetailData
  statusForm: any
  setStatusForm: any
  shippingForm: any
  setShippingForm: any
  noteForm: any
  setNoteForm: any
  editingStatus: boolean
  setEditingStatus: any
  editingShipping: boolean
  setEditingShipping: any
  editingNotes: boolean
  setEditingNotes: any
  onStatusUpdate: () => void
  onShippingUpdate: () => void
  onAddNote: () => void
  saving: boolean
}) => (
  <div className="space-y-6">
    {/* Status Update */}
    <div className="text-foreground bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <H3 className="text-foreground">Update Order Status</H3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingStatus(!editingStatus)}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {editingStatus ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      
      {editingStatus ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">New Status</label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message (Optional)</label>
            <textarea
              value={statusForm.message}
              onChange={(e) => setStatusForm({ ...statusForm, message: e.target.value })}
              placeholder="Additional information about this status change..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              rows={3}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifyCustomer"
              checked={statusForm.notifyCustomer}
              onChange={(e) => setStatusForm({ ...statusForm, notifyCustomer: e.target.checked })}
              className="rounded border-gray-300 focus:ring-accent"
            />
            <label htmlFor="notifyCustomer" className="text-sm text-foreground">
              Notify customer via email
            </label>
          </div>
          
          <Button
            variant="primary"
            onClick={onStatusUpdate}
            disabled={saving || !statusForm.status}
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Update Status
          </Button>
        </div>
      ) : (
        <BodyText className="text-gray-600 bg-white">
          Current status: <span className="font-medium text-foreground">{order.status}</span>
        </BodyText>
      )}
    </div>

    {/* Shipping Information */}
    <div className="text-foreground bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <H3 className="text-foreground">Shipping Information</H3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingShipping(!editingShipping)}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {editingShipping ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      
      {editingShipping ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tracking Number</label>
              <input
                type="text"
                value={shippingForm.trackingNumber}
                onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Carrier</label>
              <select
                value={shippingForm.carrier}
                onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Carrier</option>
                <option value="UPS">UPS</option>
                <option value="FedEx">FedEx</option>
                <option value="USPS">USPS</option>
                <option value="DHL">DHL</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Estimated Delivery</label>
            <input
              type="date"
              value={shippingForm.estimatedDelivery}
              onChange={(e) => setShippingForm({ ...shippingForm, estimatedDelivery: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <Button
            variant="primary"
            onClick={onShippingUpdate}
            disabled={saving}
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Update Shipping
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {order.shipping?.trackingNumber ? (
            <>
              <BodyText className="text-foreground">
                <span className="font-medium">Tracking:</span> {order.shipping.trackingNumber}
              </BodyText>
              <BodyText className="text-foreground">
                <span className="font-medium">Carrier:</span> {order.shipping.carrier}
              </BodyText>
              {order.shipping.trackingUrl && (
                <a
                  href={order.shipping.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Track Package <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </>
          ) : (
            <BodyText className="text-gray-600 bg-white">No tracking information available</BodyText>
          )}
        </div>
      )}
    </div>

    {/* Add Note */}
    <div className="text-foreground bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <H3 className="text-foreground">Add Note</H3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingNotes(!editingNotes)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {editingNotes ? 'Cancel' : 'Add Note'}
        </Button>
      </div>
      
      {editingNotes && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Note</label>
            <textarea
              value={noteForm.note}
              onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
              placeholder="Add a note about this order..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              rows={4}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isInternal"
              checked={noteForm.isInternal}
              onChange={(e) => setNoteForm({ ...noteForm, isInternal: e.target.checked })}
              className="rounded border-gray-300 focus:ring-accent"
            />
            <label htmlFor="isInternal" className="text-sm text-foreground">
              Internal note (not visible to customer)
            </label>
          </div>
          
          <Button
            variant="primary"
            onClick={onAddNote}
            disabled={saving || !noteForm.note.trim()}
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Add Note
          </Button>
        </div>
      )}
    </div>
  </div>
)

// Helper Components
const StatusCard = ({ title, status, type, icon: Icon, description }: any) => (
  <div className="text-foreground bg-white rounded-lg border p-4">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-5 h-5 text-accent" />
      <H3 className="text-foreground">{title}</H3>
    </div>
    <StatusBadge status={status} type={type} />
    <BodyText size="sm" className="text-gray-600 bg-white mt-2">{description}</BodyText>
  </div>
)

const StatusBadge = ({ status, type }: { status: string; type: string }) => {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'order') {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200'
        case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
        case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
        case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
        case 'refunded': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    } else if (type === 'payment') {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200'
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'failed': return 'bg-red-100 text-red-800 border-red-200'
        case 'refunded': return 'bg-orange-100 text-orange-800 border-orange-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    } else {
      switch (status) {
        case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
        case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
      getStatusColor(status, type)
    )}>
      {status.replace('-', ' ')}
    </span>
  )
}

const RiskBadge = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  const colors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", colors[level])}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

const PriorityBadge = ({ priority }: { priority: 'low' | 'medium' | 'high' | 'urgent' }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800 border-gray-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", colors[priority])}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

const AddressCard = ({ title, address }: { title: string; address: Address }) => (
  <div className="text-foreground bg-white rounded-lg border p-4">
    <H3 className="mb-3 text-foreground">{title}</H3>
    <div className="space-y-1">
      <BodyText className="text-foreground">
        {address.firstName} {address.lastName}
      </BodyText>
      {address.company && (
        <BodyText className="text-foreground">{address.company}</BodyText>
      )}
      <BodyText className="text-foreground">{address.address1}</BodyText>
      {address.address2 && (
        <BodyText className="text-foreground">{address.address2}</BodyText>
      )}
      <BodyText className="text-foreground">
        {address.city}, {address.state} {address.postalCode}
      </BodyText>
      <BodyText className="text-foreground">{address.country}</BodyText>
      {address.phone && (
        <BodyText className="text-foreground">{address.phone}</BodyText>
      )}
    </div>
  </div>
)