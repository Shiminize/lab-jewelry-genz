'use client'

import React from 'react'
import { X, Copy, Mail, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H2, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface OrderDetailsHeaderProps {
  orderNumber: string
  email: string
  status: string
  createdAt: string
  onClose: () => void
  className?: string
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'processing': 'bg-purple-100 text-purple-800',
    'shipped': 'bg-green-100 text-green-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'
    )}>
      {status}
    </span>
  )
}

export function OrderDetailsHeader({ 
  orderNumber, 
  email, 
  status, 
  createdAt, 
  onClose,
  className 
}: OrderDetailsHeaderProps) {
  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
  }

  const handleEmailCustomer = () => {
    window.open(`mailto:${email}?subject=Regarding Order ${orderNumber}`, '_blank')
  }

  const handleViewExternal = () => {
    window.open(`/admin/orders/${orderNumber}`, '_blank')
  }

  return (
    <div className={cn('flex items-center justify-between p-6 border-b', className)}>
      {/* Left side - Order info */}
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <H2 className="text-xl font-semibold text-foreground">
            Order #{orderNumber}
          </H2>
          <StatusBadge status={status} />
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <BodyText size="sm" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {email}
          </BodyText>
          <BodyText size="sm">
            Created: {new Date(createdAt).toLocaleDateString()}
          </BodyText>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyOrderNumber}
          className="text-muted-foreground hover:text-foreground"
        >
          <Copy className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEmailCustomer}
          className="text-muted-foreground hover:text-foreground"
        >
          <Mail className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewExternal}
          className="text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground ml-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}