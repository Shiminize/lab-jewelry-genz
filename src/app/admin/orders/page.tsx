'use client'

import React, { useState } from 'react'
import OrderManagementDashboard from '@/components/admin/OrderManagementDashboard'
import { OrderDetailModal } from '@/components/admin/OrderDetailModal'

export default function AdminOrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsModalOpen(true)
  }

  const closeOrderDetail = () => {
    setSelectedOrderId(null)
    setIsModalOpen(false)
  }

  return (
    <>
      <OrderManagementDashboard onOrderSelect={openOrderDetail} />
      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={closeOrderDetail}
        orderId={selectedOrderId}
      />
    </>
  )
}