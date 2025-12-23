'use client'

import { useState } from 'react'

interface PreviewPanelProps {
  isOpen: boolean
  onClose: () => void
  stagedChanges: Record<string, any>
}

export function PreviewPanel({ isOpen, onClose, stagedChanges }: PreviewPanelProps) {
  const [previewResults, setPreviewResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runPreview = async (query: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Call the same public concierge endpoint with staged changes
      // This shows what end-users will see before saving
      const res = await fetch(`/api/concierge/products?${query}`)
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      
      const data = await res.json()
      
      // Apply staged changes to preview (simulate what will happen after save)
      const previewData = data.map((product: any) => {
        const staged = stagedChanges[product.id]
        if (staged) {
          return {
            ...product,
            ...staged,
            _staged: true, // Mark as having staged changes
          }
        }
        return product
      })
      
      setPreviewResults(previewData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col overflow-hidden border-l border-border-subtle bg-surface-base shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle p-4">
        <h2 className="text-lg font-semibold text-text-primary">Preview Panel</h2>
        <button
          onClick={onClose}
          className="text-text-muted transition hover:text-text-secondary"
          aria-label="Close preview"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="border-b border-border-subtle bg-accent-secondary/20 p-4">
        <p className="text-sm text-text-primary">
          This preview shows what end-users will see in the widget with your staged changes (not yet saved).
        </p>
      </div>

      {/* Quick queries */}
      <div className="border-b border-border-subtle p-4">
        <p className="mb-2 text-xs font-medium text-text-secondary">Quick Preview Queries:</p>
        <div className="space-y-2">
          <button
            onClick={() => runPreview('readyToShip=true&category=ring')}
            disabled={loading}
            className="w-full rounded border border-border-subtle px-3 py-2 text-left text-sm transition hover:border-border-strong hover:bg-neutral-50 disabled:opacity-50"
          >
            Ready-to-ship rings
          </button>
          <button
            onClick={() => runPreview('readyToShip=true&priceLt=300')}
            disabled={loading}
            className="w-full rounded border border-border-subtle px-3 py-2 text-left text-sm transition hover:border-border-strong hover:bg-neutral-50 disabled:opacity-50"
          >
            Gifts under $300
          </button>
          <button
            onClick={() => runPreview('readyToShip=true')}
            disabled={loading}
            className="w-full rounded border border-border-subtle px-3 py-2 text-left text-sm transition hover:border-border-strong hover:bg-neutral-50 disabled:opacity-50"
          >
            All ready-to-ship
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent-primary"></div>
          </div>
        )}

        {error && (
          <div className="rounded border border-border-subtle bg-error/15 p-4 text-sm text-text-primary">
            {error}
          </div>
        )}

        {!loading && !error && previewResults.length === 0 && (
          <div className="py-8 text-center text-sm text-text-muted">
            Click a query above to preview results
          </div>
        )}

        {!loading && previewResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-text-secondary">
              Found {previewResults.length} product(s)
            </p>
            {previewResults.map((product) => (
              <div
                key={product.id}
                className={`p-3 rounded border ${
                  product._staged
                    ? 'border-border-subtle bg-warning/60'
                    : 'border-border-subtle bg-neutral-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  {product._staged && (
                    <span className="inline-block rounded bg-warning px-2 py-0.5 text-xs font-medium text-text-primary">
                      STAGED
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-text-primary">{product.title}</p>
                <p className="text-xs text-text-secondary">${product.price}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.readyToShip && (
                    <span className="inline-block rounded bg-success/80 px-2 py-0.5 text-xs text-text-primary">
                      Ready to ship
                    </span>
                  )}
                  {product.featuredInWidget && (
                    <span className="inline-block rounded bg-accent-secondary/70 px-2 py-0.5 text-xs text-text-primary">
                      Featured
                    </span>
                  )}
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block rounded bg-neutral-200 px-2 py-0.5 text-xs text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="text-xs text-text-muted">
                        +{product.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staged changes summary */}
      {Object.keys(stagedChanges).length > 0 && (
        <div className="border-t border-border-subtle bg-warning/60 p-4">
          <p className="text-xs font-medium text-text-primary">
            {Object.keys(stagedChanges).length} product(s) have unsaved changes
          </p>
        </div>
      )}
    </div>
  )
}
