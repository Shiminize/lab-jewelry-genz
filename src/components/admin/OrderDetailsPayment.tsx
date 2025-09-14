'use client'

import React from 'react'
import { CreditCard, DollarSign, RefreshCw } from 'lucide-react'
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

interface OrderDetailsPaymentProps {
  billingAddress: Address
  payment: PaymentDetails
  paymentStatus: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  currency: string
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

// Payment status badge
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'pending': 'bg-warning/10 text-warning',
    'paid': 'bg-success/10 text-success',
    'failed': 'bg-error/10 text-error',
    'refunded': 'bg-muted text-foreground',
    'partially_refunded': 'bg-warning/10 text-warning'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'
    }`}>
      <CreditCard className="w-3 h-3 mr-1" />
      {status.replace('_', ' ')}
    </span>
  )
}

export function OrderDetailsPayment({
  billingAddress,
  payment,
  paymentStatus,
  total,
  subtotal,
  shipping,
  tax,
  discount,
  currency,
  className
}: OrderDetailsPaymentProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Billing Address */}
      <AddressCard title="Billing Address" address={billingAddress} />
      
      {/* Payment Information */}
      <div className="bg-background rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <H3 className="text-foreground">Payment Information</H3>
          <PaymentStatusBadge status={paymentStatus} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <BodyText className="text-muted-foreground">Method:</BodyText>
            <BodyText className="text-foreground">{payment.method}</BodyText>
          </div>
          <div>
            <BodyText className="text-muted-foreground">Transaction ID:</BodyText>
            <BodyText className="text-foreground font-mono text-sm">{payment.transactionId}</BodyText>
          </div>
          {payment.last4 && payment.brand && (
            <div>
              <BodyText className="text-muted-foreground">Card:</BodyText>
              <BodyText className="text-foreground">{payment.brand} •••• {payment.last4}</BodyText>
            </div>
          )}
          <div>
            <BodyText className="text-muted-foreground">Amount:</BodyText>
            <BodyText className="text-foreground">{currency} {payment.amount.toFixed(2)}</BodyText>
          </div>
        </div>

        {/* Processing Fees */}
        {payment.fees && (
          <div className="border-t pt-4 mb-4">
            <BodyText className="font-medium text-foreground mb-2">Processing Fees</BodyText>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <BodyText className="text-muted-foreground">Processing Fee:</BodyText>
                <BodyText className="text-foreground">{currency} {payment.fees.processing.toFixed(2)}</BodyText>
              </div>
              <div>
                <BodyText className="text-muted-foreground">Platform Fee:</BodyText>
                <BodyText className="text-foreground">{currency} {payment.fees.platform.toFixed(2)}</BodyText>
              </div>
            </div>
          </div>
        )}

        {/* Refunds */}
        {payment.refunds && payment.refunds.length > 0 && (
          <div className="border-t pt-4">
            <BodyText className="font-medium text-foreground mb-2">Refunds</BodyText>
            <div className="space-y-2">
              {payment.refunds.map((refund) => (
                <div key={refund.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <BodyText className="text-foreground">{currency} {refund.amount.toFixed(2)}</BodyText>
                    <BodyText size="sm" className="text-muted-foreground">{refund.reason}</BodyText>
                  </div>
                  <BodyText size="sm" className="text-muted-foreground">
                    {new Date(refund.createdAt).toLocaleDateString()}
                  </BodyText>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-background rounded-lg border p-4">
        <H3 className="text-foreground mb-4">Order Summary</H3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <BodyText className="text-muted-foreground">Subtotal:</BodyText>
            <BodyText className="text-foreground">{currency} {subtotal.toFixed(2)}</BodyText>
          </div>
          <div className="flex justify-between">
            <BodyText className="text-muted-foreground">Shipping:</BodyText>
            <BodyText className="text-foreground">{currency} {shipping.toFixed(2)}</BodyText>
          </div>
          <div className="flex justify-between">
            <BodyText className="text-muted-foreground">Tax:</BodyText>
            <BodyText className="text-foreground">{currency} {tax.toFixed(2)}</BodyText>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <BodyText className="text-muted-foreground">Discount:</BodyText>
              <BodyText className="text-success">-{currency} {discount.toFixed(2)}</BodyText>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <BodyText className="font-semibold text-foreground">Total:</BodyText>
              <BodyText className="font-semibold text-foreground">{currency} {total.toFixed(2)}</BodyText>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}