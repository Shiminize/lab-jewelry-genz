'use client'

import React from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <AdminHeader />
      
      <div className="flex">
        {/* Admin Sidebar Navigation */}
        <AdminSidebar />
        
        {/* Main Content Area - Mobile Optimized */}
        <main className="flex-1 p-3 sm:p-6 text-foreground bg-background" role="main">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}