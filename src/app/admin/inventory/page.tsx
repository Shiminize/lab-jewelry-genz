import { Metadata } from 'next'
import InventoryDashboard from '@/components/admin/InventoryDashboard'

export const metadata: Metadata = {
  title: 'Inventory Management | GenZ Jewelry Admin',
  description: 'Monitor stock levels, manage inventory alerts, and track product performance',
}

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryDashboard />
    </div>
  )
}