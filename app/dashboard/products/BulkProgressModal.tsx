'use client';

import { useState } from 'react';

interface BulkOperationResult {
  sku: string;
  success: boolean;
  error?: string;
}

interface BulkProgressModalProps {
  isOpen: boolean;
  action: string;
  total: number;
  successful: number;
  failed: number;
  results: BulkOperationResult[];
  inProgress: boolean;
  onClose: () => void;
}

export function BulkProgressModal({
  isOpen,
  action,
  total,
  successful,
  failed,
  results,
  inProgress,
  onClose,
}: BulkProgressModalProps) {
  const [showErrors, setShowErrors] = useState(true);

  if (!isOpen) return null;

  const actionLabels: Record<string, string> = {
    setFeatured: 'Set Featured',
    setReady: 'Set Ready to Ship',
    addTags: 'Add Tags',
    removeTags: 'Remove Tags',
  };

  const errors = results.filter(r => !r.success);
  const hasErrors = errors.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-border-subtle bg-surface-base shadow-soft">
        {/* Header */}
        <div className="border-b border-border-subtle p-6">
          <h2 className="text-xl font-bold text-text-primary">
            {inProgress ? 'Processing...' : 'Bulk Operation Complete'}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {actionLabels[action] || action}
          </p>
        </div>

        {/* Progress/Summary */}
        <div className="border-b border-border-subtle p-6">
          {inProgress ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-primary border-t-transparent"></div>
              <div className="text-text-secondary">
                Processing {total} item{total !== 1 ? 's' : ''}...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-text-primary">{total}</div>
                <div className="text-sm text-text-secondary">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{successful}</div>
                <div className="text-sm text-text-secondary">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{failed}</div>
                <div className="text-sm text-text-secondary">Failed</div>
              </div>
            </div>
          )}
        </div>

        {/* Errors Section */}
        {!inProgress && hasErrors && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-subtle bg-error/15 p-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">
                  ⚠️ {errors.length} Error{errors.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="text-sm font-medium text-text-primary hover:text-text-secondary"
              >
                {showErrors ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {showErrors && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {errors.map((result, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-border-subtle bg-error/15 p-3 text-sm"
                    >
                      <div className="font-semibold text-text-primary">
                        SKU: {result.sku}
                      </div>
                      <div className="mt-1 text-text-secondary">
                        {result.error || 'Unknown error'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {!inProgress && !hasErrors && (
          <div className="p-6 text-center text-text-primary">
            <div className="text-5xl mb-2">✓</div>
            <div className="font-semibold">
              All {successful} item{successful !== 1 ? 's' : ''} updated successfully!
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border-subtle bg-neutral-50 p-6">
          {inProgress ? (
            <div className="text-center text-sm text-text-secondary">
              Please wait while we process your request...
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {failed > 0 ? (
                  <span>
                    Partial success: {successful} succeeded, {failed} failed
                  </span>
                ) : (
                  <span>All operations completed successfully</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-accent-primary px-6 py-2 text-sm font-semibold text-surface-base transition hover:bg-accent-primary/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
              >
                Close & Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
