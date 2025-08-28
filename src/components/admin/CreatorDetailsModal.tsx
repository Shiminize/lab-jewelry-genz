'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Link, 
  MousePointer, 
  Target,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Save,
  MessageSquare,
  BarChart3,
  Activity,
  Eye,
  Settings
} from 'lucide-react'

interface CreatorDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  creatorId: string | null
}

interface CreatorDetails {
  creator: any
  metrics: any
  referralLinks: any[]
  recentClicks: any[]
  recentTransactions: any[]
  payoutHistory: any[]
}

export default function CreatorDetailsModal({ isOpen, onClose, creatorId }: CreatorDetailsModalProps) {
  const [details, setDetails] = useState<CreatorDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [editMode, setEditMode] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const fetchCreatorDetails = async () => {
    if (!creatorId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/creators/${creatorId}`)
      const data = await response.json()

      if (data.success) {
        setDetails(data.data)
      } else {
        console.error('Failed to fetch creator details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching creator details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && creatorId) {
      fetchCreatorDetails()
      setActiveTab('overview')
    } else {
      setDetails(null)
    }
  }, [isOpen, creatorId])

  const handleEdit = (field: string, currentValue: any) => {
    setEditMode(field)
    setEditData({ [field]: currentValue })
  }

  const handleSave = async (field: string) => {
    if (!creatorId) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-profile',
          updates: editData
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCreatorDetails()
        setEditMode(null)
        setEditData({})
      } else {
        console.error('Update failed:', data.error)
      }
    } catch (error) {
      console.error('Error updating creator:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!creatorId) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          updates: { status: newStatus, reason }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCreatorDetails()
      } else {
        console.error('Status update failed:', data.error)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleTriggerPayout = async () => {
    if (!creatorId) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger-payout'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCreatorDetails()
        alert(`Payout processed successfully: ${data.data.amount}`)
      } else {
        alert(`Payout failed: ${data.error.message}`)
      }
    } catch (error) {
      console.error('Error triggering payout:', error)
      alert('Payout processing failed')
    } finally {
      setSaving(false)
    }
  }

  const addNote = async () => {
    const note = prompt('Add admin note:')
    if (!note || !creatorId) return

    try {
      const response = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-note',
          updates: { note }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCreatorDetails()
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'suspended': return <XCircle className="h-5 w-5 text-red-500" />
      case 'inactive': return <AlertTriangle className="h-5 w-5 text-aurora-nav-muted" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      case 'inactive': return 'bg-muted text-foreground border-border'
      default: return 'bg-muted text-foreground border-border'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="creator-detail-modal">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-muted bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-background rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-background px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-coral-gold/10 flex items-center justify-center">
                <User className="h-6 w-6 text-coral-gold" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {details?.creator?.displayName || 'Loading...'}
                </h3>
                <p className="text-sm text-aurora-nav-muted">
                  {details?.creator?.email}
                </p>
              </div>
              {details?.creator && (
                <div className="flex items-center gap-2 ml-4">
                  {getStatusIcon(details.creator.status)}
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(details.creator.status)}`}>
                    {details.creator.status}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
                    {details.creator.tier}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-aurora-nav-muted hover:text-aurora-nav-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-gold"></div>
            </div>
          ) : details ? (
            <div className="flex">
              {/* Sidebar Navigation */}
              <div className="w-64 bg-muted border-r border-border">
                <nav className="p-4 space-y-2">
                  {[
                    { id: 'overview', name: 'Overview', icon: Eye },
                    { id: 'performance', name: 'Performance', icon: BarChart3 },
                    { id: 'links', name: 'Referral Links', icon: Link },
                    { id: 'transactions', name: 'Transactions', icon: CreditCard },
                    { id: 'payouts', name: 'Payouts', icon: DollarSign },
                    { id: 'activity', name: 'Activity', icon: Activity },
                    { id: 'settings', name: 'Settings', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-coral-gold text-white'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 max-h-[80vh] overflow-y-auto">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Total Clicks</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {details.metrics.totalClicks.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Conversions</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {details.metrics.totalConversions}
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Conversion Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatPercentage(details.metrics.conversionRate)}
                        </p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">Total Earnings</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">
                          {formatCurrency(details.metrics.totalEarnings)}
                        </p>
                      </div>
                    </div>

                    {/* Creator Information */}
                    <div className="bg-background border border-border rounded-lg p-6">
                      <h4 className="text-lg font-medium text-foreground mb-4">Creator Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-foreground">Display Name</label>
                              {editMode === 'displayName' ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="text"
                                    value={editData.displayName || ''}
                                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                    className="flex-1 px-3 py-1 border border-border rounded text-sm"
                                  />
                                  <button
                                    onClick={() => handleSave('displayName')}
                                    disabled={saving}
                                    className="p-1 text-green-600 hover:text-green-800"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-foreground">{details.creator.displayName}</p>
                                  <button
                                    onClick={() => handleEdit('displayName', details.creator.displayName)}
                                    className="p-1 text-aurora-nav-muted hover:text-aurora-nav-muted"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <p className="text-sm text-foreground mt-1">{details.creator.email}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Creator Code</label>
                            <p className="text-sm text-foreground mt-1 font-mono">{details.creator.creatorCode}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-foreground">Commission Rate</label>
                              {editMode === 'commissionRate' ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.1"
                                    value={editData.commissionRate || ''}
                                    onChange={(e) => setEditData({ ...editData, commissionRate: parseFloat(e.target.value) })}
                                    className="w-20 px-3 py-1 border border-border rounded text-sm"
                                  />
                                  <span className="text-sm text-aurora-nav-muted">%</span>
                                  <button
                                    onClick={() => handleSave('commissionRate')}
                                    disabled={saving}
                                    className="p-1 text-green-600 hover:text-green-800"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-foreground">{details.creator.commissionRate}%</p>
                                  <button
                                    onClick={() => handleEdit('commissionRate', details.creator.commissionRate)}
                                    className="p-1 text-aurora-nav-muted hover:text-aurora-nav-muted"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">Bio</label>
                            <p className="text-sm text-foreground mt-1">{details.creator.bio || 'No bio provided'}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Payment Method</label>
                            <p className="text-sm text-foreground mt-1 capitalize">{details.creator.paymentInfo.method}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Joined</label>
                            <p className="text-sm text-foreground mt-1">{formatDate(details.creator.createdAt)}</p>
                          </div>

                          {details.creator.approvedAt && (
                            <div>
                              <label className="text-sm font-medium text-foreground">Approved</label>
                              <p className="text-sm text-foreground mt-1">{formatDate(details.creator.approvedAt)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-background border border-border rounded-lg p-6">
                      <h4 className="text-lg font-medium text-foreground mb-4">Quick Actions</h4>
                      <div className="flex flex-wrap gap-3">
                        {details.creator.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange('approved', 'Approved by admin')}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            Approve Application
                          </button>
                        )}

                        {details.creator.status === 'approved' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for suspension:')
                              if (reason) handleStatusChange('suspended', reason)
                            }}
                            disabled={saving}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Suspend Creator
                          </button>
                        )}

                        {details.creator.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange('approved', 'Reactivated by admin')}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            Reactivate Creator
                          </button>
                        )}

                        {details.metrics.pendingEarnings > 0 && (
                          <button
                            onClick={handleTriggerPayout}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            Trigger Payout ({formatCurrency(details.metrics.pendingEarnings)})
                          </button>
                        )}

                        <button
                          onClick={addNote}
                          className="px-4 py-2 bg-muted text-white rounded-lg hover:bg-muted transition-colors"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {details.creator.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-yellow-800 mb-2">Admin Notes</h5>
                        <pre className="text-sm text-yellow-700 whitespace-pre-wrap font-mono">
                          {details.creator.notes}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'links' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground">Referral Links</h4>
                    <div className="space-y-3">
                      {details.referralLinks.map((link) => (
                        <div key={link._id} className="bg-background border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Link className="h-4 w-4 text-aurora-nav-muted" />
                                <span className="font-medium text-foreground">{link.title || 'Untitled Link'}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${link.isActive ? 'bg-green-100 text-green-800' : 'bg-muted text-foreground'}`}>
                                  {link.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-aurora-nav-muted mt-1">{link.shortUrl}</p>
                              {link.description && (
                                <p className="text-sm text-aurora-nav-muted mt-1">{link.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-foreground">
                                <div>Clicks: {link.clickCount}</div>
                                <div>Conversions: {link.conversionCount}</div>
                                <div>Rate: {((link.conversionCount / Math.max(link.clickCount, 1)) * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground">Recent Transactions</h4>
                    <div className="space-y-3">
                      {details.recentTransactions.map((transaction) => (
                        <div key={transaction._id} className="bg-background border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {transaction.orderId?.orderNumber || transaction.orderId}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  transaction.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  transaction.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                              <p className="text-sm text-aurora-nav-muted">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-foreground">
                                {formatCurrency(transaction.commissionAmount)}
                              </div>
                              <div className="text-sm text-aurora-nav-muted">
                                {transaction.commissionRate}% of {formatCurrency(transaction.orderAmount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'payouts' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground">Payout History</h4>
                    <div className="space-y-3">
                      {details.payoutHistory.map((payout) => (
                        <div key={payout._id} className="bg-background border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {formatCurrency(payout.amount)}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  payout.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {payout.status}
                                </span>
                              </div>
                              <p className="text-sm text-aurora-nav-muted">
                                {formatDate(payout.payoutDate)}
                              </p>
                              {payout.paymentReference && (
                                <p className="text-sm text-aurora-nav-muted font-mono">
                                  Ref: {payout.paymentReference}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-foreground capitalize">
                                {payout.paymentMethod}
                              </div>
                              {payout.completedAt && (
                                <div className="text-sm text-aurora-nav-muted">
                                  Completed: {formatDate(payout.completedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-aurora-nav-muted">Failed to load creator details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}