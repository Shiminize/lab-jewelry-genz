'use client'

/**
 * Referral Links Management Component
 * Displays and manages all creator referral links with analytics
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  MousePointer,
  Target
} from 'lucide-react'

interface ReferralLink {
  id: string
  linkCode: string
  shortUrl: string
  originalUrl: string
  title?: string
  description?: string
  isActive: boolean
  clickCount: number
  uniqueClickCount: number
  conversionCount: number
  lastClickedAt?: string
  createdAt: string
  expiresAt?: string
}

export default function ReferralLinks() {
  const [links, setLinks] = useState<ReferralLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [copiedLink, setCopiedLink] = useState('')
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchLinks()
  }, [pagination.page, activeFilter, searchTerm])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(activeFilter !== 'all' && { active: (activeFilter === 'active').toString() }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/creators/links?${params}`)
      const result = await response.json()

      if (result.success) {
        setLinks(result.data.links)
        setPagination(prev => ({ ...prev, ...result.data.pagination }))
      }
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(linkId)
      setTimeout(() => setCopiedLink(''), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/creators/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchLinks()
      }
    } catch (error) {
      console.error('Error updating link status:', error)
    }
  }

  const deleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/creators/links/${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchLinks()
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getConversionRate = (clicks: number, conversions: number) => {
    if (clicks === 0) return '0.00'
    return ((conversions / clicks) * 100).toFixed(2)
  }

  if (loading && links.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner text="Loading referral links..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Referral Links</h2>
          <p className="text-sm text-gray-600">
            Manage and track your referral links performance
          </p>
        </div>
        <Button onClick={() => window.location.hash = '#generate'}>
          Create New Link
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search links by title, URL, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Links</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      {links.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">No referral links found</div>
            <p className="text-gray-500 mb-6">
              {searchTerm || activeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first referral link to start earning commissions'
              }
            </p>
            <Button onClick={() => window.location.hash = '#generate'}>
              Create Your First Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Link Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {link.title || 'Untitled Link'}
                        </h3>
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        )}
                      </div>
                      <Badge 
                        variant={link.isActive ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {link.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* URLs */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Short URL:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{link.shortUrl}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(link.shortUrl, link.id)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedLink === link.id ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Target:</span>
                        <span className="text-xs text-gray-700 truncate max-w-md">
                          {link.originalUrl}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(link.originalUrl, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="lg:w-64 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{link.clickCount}</div>
                        <div className="text-xs text-gray-500 flex items-center justify-center">
                          <MousePointer className="w-3 h-3 mr-1" />
                          Clicks
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{link.conversionCount}</div>
                        <div className="text-xs text-gray-500 flex items-center justify-center">
                          <Target className="w-3 h-3 mr-1" />
                          Sales
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {getConversionRate(link.clickCount, link.conversionCount)}%
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          CVR
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 text-center">
                      Created: {formatDate(link.createdAt)}
                      {link.lastClickedAt && (
                        <div>Last click: {formatDate(link.lastClickedAt)}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-32 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4">
                    <div className="flex lg:flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleLinkStatus(link.id, link.isActive)}
                        className="flex-1 lg:flex-none"
                      >
                        {link.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLink(link.id)}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteLink(link.id)}
                        className="flex-1 lg:flex-none text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} links
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}