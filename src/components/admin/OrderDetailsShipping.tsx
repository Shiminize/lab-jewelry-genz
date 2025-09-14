'use client'

import React from 'react'
import { Edit3, Save, Truck, ExternalLink } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { H3, BodyText } from '../foundation/Typography'

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

interface OrderDetailsShippingProps {
  shippingAddress: Address
  shipping: ShippingDetails
  shippingStatus: string
  shippingForm: {
    trackingNumber: string
    carrier: string
    service: string
    estimatedDelivery: string
  }
  setShippingForm: (form: any) => void
  editingShipping: boolean
  setEditingShipping: (editing: boolean) => void
  onShippingUpdate: () => void
  saving: boolean
  className?: string
}

// Address display component
const AddressCard = ({ title, address }: { title: string; address: Address }) => (
  <div className="bg-muted rounded-lg p-4">
    <BodyText className="font-medium text-foreground mb-2">{title}</BodyText>
    <div className="space-y-1">
      <BodyText className="text-muted-foreground">
        {address.firstName} {address.lastName}
      </BodyText>
      {address.company && (
        <BodyText className="text-muted-foreground">{address.company}</BodyText>
      )}
      <BodyText className="text-muted-foreground">{address.addressLine1}</BodyText>
      {address.addressLine2 && (
        <BodyText className="text-muted-foreground">{address.addressLine2}</BodyText>
      )}
      <BodyText className="text-muted-foreground">
        {address.city}, {address.state} {address.postalCode}
      </BodyText>
      <BodyText className="text-muted-foreground">{address.country}</BodyText>
    </div>
  </div>
)

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'pending': 'bg-warning/10 text-warning',
    'processing': 'bg-info/10 text-info',
    'shipped': 'bg-success/10 text-success',
    'delivered': 'bg-success/10 text-success',
    'cancelled': 'bg-error/10 text-error'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'
    }`}>
      <Truck className="w-3 h-3 mr-1" />
      {status}
    </span>
  )
}

export function OrderDetailsShipping({
  shippingAddress,
  shipping,
  shippingStatus,
  shippingForm,
  setShippingForm,
  editingShipping,
  setEditingShipping,
  onShippingUpdate,
  saving,
  className
}: OrderDetailsShippingProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Shipping Address */}
      <AddressCard title="Shipping Address" address={shippingAddress} />
      
      {/* Shipping Status */}
      <div className="bg-background rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <H3 className="text-foreground">Shipping Status</H3>
          <StatusBadge status={shippingStatus} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <BodyText className="text-muted-foreground">Method:</BodyText>
            <BodyText className="text-foreground">{shipping.method}</BodyText>
          </div>
          <div>
            <BodyText className="text-muted-foreground">Cost:</BodyText>
            <BodyText className="text-foreground">${shipping.cost.toFixed(2)}</BodyText>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-background rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <H3 className="text-foreground">Shipping Information</H3>
          <Button
            variant="ghost"
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
              <Input
                label="Tracking Number"
                value={shippingForm.trackingNumber}
                onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
              />
              <Input
                label="Carrier"
                value={shippingForm.carrier}
                onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
              />
            </div>
            <Input
              label="Estimated Delivery"
              type="date"
              value={shippingForm.estimatedDelivery}
              onChange={(e) => setShippingForm({ ...shippingForm, estimatedDelivery: e.target.value })}
            />
            <Button
              onClick={onShippingUpdate}
              disabled={saving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Shipping
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {shipping?.trackingNumber ? (
              <div className="space-y-2">
                <BodyText className="text-muted-foreground">
                  <span className="font-medium">Tracking:</span> {shipping.trackingNumber}
                </BodyText>
                <BodyText className="text-muted-foreground">
                  <span className="font-medium">Carrier:</span> {shipping.carrier}
                </BodyText>
                {shipping.trackingUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(shipping.trackingUrl, '_blank')}
                    className="p-0 h-auto text-info hover:text-info"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Track Package
                  </Button>
                )}
              </div>
            ) : (
              <BodyText className="text-muted-foreground">
                No tracking information available
              </BodyText>
            )}
          </div>
        )}
      </div>
    </div>
  )
}