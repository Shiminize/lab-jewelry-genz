'use client'

import React, { useState } from 'react'
import CreatorManagementDashboard from '@/components/admin/CreatorManagementDashboard'
import CreatorDetailsModal from '@/components/admin/CreatorDetailsModal'

export default function AdminCreatorsPage() {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openCreatorDetail = (creatorId: string) => {
    setSelectedCreatorId(creatorId)
    setIsModalOpen(true)
  }

  const closeCreatorDetail = () => {
    setIsModalOpen(false)
    setSelectedCreatorId(null)
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Creator Management</h1>
                <p className="mt-1 text-sm text-aurora-nav-muted">
                  Manage creator applications, commissions, and performance analytics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-aurora-nav-muted">Creator Program</div>
                  <div className="text-lg font-semibold text-coral-gold">Admin Dashboard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreatorManagementDashboard onCreatorSelect={openCreatorDetail} />
      </div>

      {/* Creator Details Modal */}
      <CreatorDetailsModal
        isOpen={isModalOpen}
        onClose={closeCreatorDetail}
        creatorId={selectedCreatorId}
      />
    </div>
  )
}