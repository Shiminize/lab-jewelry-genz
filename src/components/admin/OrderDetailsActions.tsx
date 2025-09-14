'use client'

import React from 'react'
import { Edit3, Save, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { H3, BodyText } from '../foundation/Typography'

interface AdminNote {
  id: string
  message: string
  isInternal: boolean
  createdAt: string
  createdBy: {
    name: string
    role: string
  }
}

interface AdminMetadata {
  canBeCancelled: boolean
  canBeRefunded: boolean
  canBeShipped: boolean
  requiresAction: boolean
  riskLevel: 'low' | 'medium' | 'high'
  profitMargin: number
  fulfillmentPriority: 'low' | 'medium' | 'high' | 'urgent'
}

interface OrderDetailsActionsProps {
  orderNumber: string
  status: string
  adminNotes?: AdminNote[]
  adminMetadata: AdminMetadata
  statusForm: {
    status: string
    message: string
    notifyCustomer: boolean
  }
  setStatusForm: (form: any) => void
  noteForm: {
    note: string
    isInternal: boolean
  }
  setNoteForm: (form: any) => void
  editingStatus: boolean
  setEditingStatus: (editing: boolean) => void
  editingNotes: boolean
  setEditingNotes: (editing: boolean) => void
  onStatusUpdate: () => void
  onAddNote: () => void
  saving: boolean
  className?: string
}

// Risk level badge
const RiskBadge = ({ level }: { level: string }) => {
  const riskConfig = {
    'low': 'bg-success/10 text-success',
    'medium': 'bg-warning/10 text-warning',
    'high': 'bg-error/10 text-error'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      riskConfig[level as keyof typeof riskConfig] || 'bg-gray-100 text-gray-800'
    }`}>
      <AlertTriangle className="w-3 h-3 mr-1" />
      {level} risk
    </span>
  )
}

// Priority badge
const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig = {
    'low': 'bg-muted text-foreground',
    'medium': 'bg-accent/10 text-accent',
    'high': 'bg-warning/10 text-warning',
    'urgent': 'bg-error/10 text-error'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      priorityConfig[priority as keyof typeof priorityConfig] || 'bg-gray-100 text-gray-800'
    }`}>
      {priority}
    </span>
  )
}

export function OrderDetailsActions({
  orderNumber,
  status,
  adminNotes = [],
  adminMetadata,
  statusForm,
  setStatusForm,
  noteForm,
  setNoteForm,
  editingStatus,
  setEditingStatus,
  editingNotes,
  setEditingNotes,
  onStatusUpdate,
  onAddNote,
  saving,
  className
}: OrderDetailsActionsProps) {
  const statusOptions = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ]

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Admin Metadata */}
      <div className="bg-background rounded-lg border p-4">
        <H3 className="text-foreground mb-4">Admin Information</H3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <BodyText className="text-muted-foreground">Risk Level:</BodyText>
            <RiskBadge level={adminMetadata.riskLevel} />
          </div>
          <div>
            <BodyText className="text-muted-foreground">Priority:</BodyText>
            <PriorityBadge priority={adminMetadata.fulfillmentPriority} />
          </div>
          <div>
            <BodyText className="text-muted-foreground">Profit Margin:</BodyText>
            <BodyText className="text-foreground">{adminMetadata.profitMargin.toFixed(2)}%</BodyText>
          </div>
          <div>
            <BodyText className="text-muted-foreground">Requires Action:</BodyText>
            <BodyText className={adminMetadata.requiresAction ? 'text-error' : 'text-success'}>
              {adminMetadata.requiresAction ? 'Yes' : 'No'}
            </BodyText>
          </div>
        </div>

        {/* Action Capabilities */}
        <div className="border-t pt-4">
          <BodyText className="font-medium text-foreground mb-2">Available Actions</BodyText>
          <div className="flex flex-wrap gap-2">
            {adminMetadata.canBeCancelled && (
              <BodyText size="sm" className="px-2 py-1 bg-error/10 text-error rounded">
                Can Cancel
              </BodyText>
            )}
            {adminMetadata.canBeRefunded && (
              <BodyText size="sm" className="px-2 py-1 bg-warning/10 text-warning rounded">
                Can Refund
              </BodyText>
            )}
            {adminMetadata.canBeShipped && (
              <BodyText size="sm" className="px-2 py-1 bg-success/10 text-success rounded">
                Can Ship
              </BodyText>
            )}
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-background rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <H3 className="text-foreground">Update Status</H3>
          <Button
            variant="ghost"
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
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="w-full p-2 border border-border rounded-token-md focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Message (optional)"
              placeholder="Add a message about this status change..."
              value={statusForm.message}
              onChange={(e) => setStatusForm({ ...statusForm, message: e.target.value })}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-customer"
                checked={statusForm.notifyCustomer}
                onChange={(e) => setStatusForm({ ...statusForm, notifyCustomer: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="notify-customer" className="text-sm text-foreground">
                Notify customer via email
              </label>
            </div>
            <Button
              onClick={onStatusUpdate}
              disabled={saving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </div>
        ) : (
          <BodyText className="text-foreground">
            Current status: <span className="font-medium">{status}</span>
          </BodyText>
        )}
      </div>

      {/* Admin Notes */}
      <div className="bg-background rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <H3 className="text-foreground">Admin Notes</H3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingNotes(!editingNotes)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        {editingNotes && (
          <div className="space-y-4 mb-4">
            <Input
              label="Note"
              placeholder="Add administrative note..."
              value={noteForm.note}
              onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="internal-note"
                checked={noteForm.isInternal}
                onChange={(e) => setNoteForm({ ...noteForm, isInternal: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="internal-note" className="text-sm text-foreground">
                Internal note (not visible to customer)
              </label>
            </div>
            <Button
              onClick={onAddNote}
              disabled={saving || !noteForm.note.trim()}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        )}

        {/* Display existing notes */}
        <div className="space-y-3">
          {adminNotes.length > 0 ? (
            adminNotes.map((note) => (
              <div key={note.id} className="border-l-4 border-info/30 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <BodyText size="sm" className="font-medium text-foreground">
                    {note.createdBy.name} ({note.createdBy.role})
                  </BodyText>
                  <BodyText size="sm" className="text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </BodyText>
                </div>
                <BodyText className="text-foreground">{note.message}</BodyText>
                {note.isInternal && (
                  <BodyText size="sm" className="text-warning mt-1">
                    Internal Note
                  </BodyText>
                )}
              </div>
            ))
          ) : (
            <BodyText className="text-muted-foreground">No admin notes yet</BodyText>
          )}
        </div>
      </div>
    </div>
  )
}