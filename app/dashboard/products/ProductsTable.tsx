'use client';
import { useState, useRef } from 'react';
import { PreviewPanel } from './PreviewPanel';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { BulkProgressModal } from './BulkProgressModal';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface IdempotencyEntry {
  key: string;
  expiresAt: number;
}

interface BulkOperationResult {
  sku: string;
  success: boolean;
  error?: string;
}

interface BulkProgressState {
  show: boolean;
  action: string;
  total: number;
  successful: number;
  failed: number;
  results: BulkOperationResult[];
  inProgress: boolean;
}

export default function ProductsTable({ items }: { items: any[] }) {
  const [stagedChanges, setStagedChanges] = useState<Record<string, any>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [bulkProgress, setBulkProgress] = useState<BulkProgressState>({
    show: false,
    action: '',
    total: 0,
    successful: 0,
    failed: 0,
    results: [],
    inProgress: false,
  });

  // Track idempotency keys per SKU with TTL (60s)
  const idempotencyKeysRef = useRef<Map<string, IdempotencyEntry>>(new Map());

  const handleStageChange = (sku: string, changes: any) => {
    setStagedChanges(prev => ({
      ...prev,
      [sku]: { ...(prev[sku] || {}), ...changes }
    }));
  };

  const clearStaged = (sku: string) => {
    setStagedChanges(prev => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
  };

  const getOrGenerateIdempotencyKey = (sku: string): string => {
    const now = Date.now();
    const existing = idempotencyKeysRef.current.get(sku);

    // Reuse key if still valid (within 60s)
    if (existing && existing.expiresAt > now) {
      return existing.key;
    }

    // Generate new key
    const newKey = generateUUID();
    idempotencyKeysRef.current.set(sku, {
      key: newKey,
      expiresAt: now + 60_000, // 60s TTL
    });

    return newKey;
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSkus(new Set(items.map(p => p.sku)));
    } else {
      setSelectedSkus(new Set());
    }
  };

  const handleSelectRow = (sku: string, checked: boolean) => {
    setSelectedSkus(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(sku);
      } else {
        next.delete(sku);
      }
      return next;
    });
  };

  const allSelected = items.length > 0 && selectedSkus.size === items.length;
  const someSelected = selectedSkus.size > 0 && selectedSkus.size < items.length;

  // Bulk operation handlers
  const handleBulkOperation = async (
    action: 'setFeatured' | 'setReady' | 'addTags' | 'removeTags',
    value: boolean | string[]
  ) => {
    if (selectedSkus.size === 0) return;

    // Generate idempotency key for this bulk operation
    const bulkIdempotencyKey = generateUUID();

    // Build updates array
    const updates = Array.from(selectedSkus).map(sku => {
      const operations: any = {};

      switch (action) {
        case 'setFeatured':
          operations.setFeaturedInWidget = value as boolean;
          break;
        case 'setReady':
          operations.setReadyToShip = value as boolean;
          break;
        case 'addTags':
          operations.addTags = value as string[];
          break;
        case 'removeTags':
          operations.removeTags = value as string[];
          break;
      }

      return { sku, operations };
    });

    // Show progress modal
    setBulkProgress({
      show: true,
      action,
      total: updates.length,
      successful: 0,
      failed: 0,
      results: [],
      inProgress: true,
    });

    try {
      const res = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': bulkIdempotencyKey,
        },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();

      if (res.ok || res.status === 207) {
        // Success or partial success
        setBulkProgress(prev => ({
          ...prev,
          successful: data.summary.successful,
          failed: data.summary.failed,
          results: data.results,
          inProgress: false,
        }));

        // Clear selection if all succeeded
        if (data.summary.failed === 0) {
          setSelectedSkus(new Set());
        }
      } else if (res.status === 429) {
        // Rate limit
        setBulkProgress(prev => ({
          ...prev,
          inProgress: false,
          results: [{
            sku: 'RATE_LIMIT',
            success: false,
            error: `Rate limit exceeded. ${data.error}`,
          }],
          failed: updates.length,
        }));
      } else {
        // Error
        setBulkProgress(prev => ({
          ...prev,
          inProgress: false,
          results: [{
            sku: 'ERROR',
            success: false,
            error: data.error || 'Unknown error',
          }],
          failed: updates.length,
        }));
      }
    } catch (error) {
      setBulkProgress(prev => ({
        ...prev,
        inProgress: false,
        results: [{
          sku: 'NETWORK_ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        }],
        failed: updates.length,
      }));
    }
  };

  const closeBulkProgress = () => {
    setBulkProgress(prev => ({ ...prev, show: false }));
    // Reload page to see updated values
    window.location.reload();
  };

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {selectedSkus.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedSkus.size}
          onSetFeatured={(value) => handleBulkOperation('setFeatured', value)}
          onSetReady={(value) => handleBulkOperation('setReady', value)}
          onAddTags={(tags) => handleBulkOperation('addTags', tags)}
          onRemoveTags={(tags) => handleBulkOperation('removeTags', tags)}
          onClearSelection={() => setSelectedSkus(new Set())}
          disabled={bulkProgress.inProgress}
        />
      )}

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setPreviewOpen(true)}
          className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-surface-base transition hover:bg-accent-primary/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
        >
          Open Preview Panel {Object.keys(stagedChanges).length > 0 && `(${Object.keys(stagedChanges).length} staged)`}
        </button>

        {selectedSkus.size > 0 && (
          <div className="text-sm text-text-secondary">
            {selectedSkus.size} of {items.length} selected
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="cursor-pointer"
                  title={allSelected ? 'Deselect all' : 'Select all on page'}
                />
              </th>
              <th className="p-2">SKU</th>
              <th className="p-2">Title</th>
              <th className="p-2">Price</th>
              <th className="p-2">Desc</th>
              <th className="p-2">Ready?</th>
              <th className="p-2">Featured?</th>
              <th className="p-2">Tags</th>
              <th className="p-2">Promise</th>
              <th className="p-2">Save</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <Row
                key={p.sku || p._id}
                p={p}
                onStageChange={handleStageChange}
                onClearStaged={clearStaged}
                isStaged={!!stagedChanges[p.sku]}
                getIdempotencyKey={getOrGenerateIdempotencyKey}
                isSelected={selectedSkus.has(p.sku)}
                onSelectChange={(checked) => handleSelectRow(p.sku, checked)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <PreviewPanel
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        stagedChanges={stagedChanges}
      />

      <BulkProgressModal
        isOpen={bulkProgress.show}
        action={bulkProgress.action}
        total={bulkProgress.total}
        successful={bulkProgress.successful}
        failed={bulkProgress.failed}
        results={bulkProgress.results}
        inProgress={bulkProgress.inProgress}
        onClose={closeBulkProgress}
      />
    </>
  );
}

interface RowProps {
  p: any;
  onStageChange: (sku: string, changes: any) => void;
  onClearStaged: (sku: string) => void;
  isStaged: boolean;
  getIdempotencyKey: (sku: string) => string;
  isSelected: boolean;
  onSelectChange: (checked: boolean) => void;
}

function Row({ p, onStageChange, onClearStaged, isStaged, getIdempotencyKey, isSelected, onSelectChange }: RowProps) {
  const [ready, setReady] = useState(!!p.readyToShip);
  const [feat, setFeat] = useState(!!p.featuredInWidget);
  const [tags, setTags] = useState<string>((p.tags || []).join(','));
  const [promise, setPromise] = useState<string>(p.shippingPromise || '');
  const [price, setPrice] = useState<string>(p.basePrice?.toString() || p.pricing?.basePrice?.toString() || '0');
  const [desc, setDesc] = useState<string>(p.description || '');
  const [saving, setSaving] = useState(false);

  // Track changes for staging
  const handleReadyChange = (checked: boolean) => {
    setReady(checked);
    onStageChange(p.sku, { readyToShip: checked });
  };

  const handleFeatChange = (checked: boolean) => {
    setFeat(checked);
    onStageChange(p.sku, { featuredInWidget: checked });
  };

  const handleTagsChange = (value: string) => {
    setTags(value);
    onStageChange(p.sku, { tags: value.split(',').map(t => t.trim()).filter(Boolean) });
  };

  const onSave = async () => {
    setSaving(true);

    // Generate idempotency key for this save operation
    const idempotencyKey = getIdempotencyKey(p.sku);

    const res = await fetch(`/api/admin/products/${encodeURIComponent(p.sku)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        readyToShip: ready,
        featuredInWidget: feat,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        shippingPromise: promise || undefined,
        basePrice: parseFloat(price) || 0,
        description: desc,
      })
    });
    setSaving(false);

    // Check if this was an idempotency replay
    const isReplay = res.headers.get('X-Idempotency-Replay') === 'true';

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '1';
        alert(`Rate limit exceeded. Please wait ${retryAfter}s before retrying.`);
      } else {
        alert('Save failed');
      }
    } else {
      alert(isReplay ? 'Saved (cached response)' : 'Saved');
      onClearStaged(p.sku);
    }
  };

  return (
    <tr className={`align-top border-b ${isStaged ? 'bg-warning/60' : isSelected ? 'bg-neutral-50' : ''}`}>
      <td className="p-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(e.target.checked)}
          className="cursor-pointer"
        />
      </td>
      <td className="p-2">{p.sku}</td>
      <td className="p-2">
        <div className="font-medium">{p.title || p.name}</div>
        <div className="text-xs text-text-secondary w-32 truncate" title={p.title || p.name}>{p._id}</div>
      </td>
      <td className="p-2">
        <input
          className="w-20 rounded border border-border-subtle px-2 py-1 text-sm text-text-primary placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
          type="number"
          value={price}
          onChange={e => {
            setPrice(e.target.value);
            onStageChange(p.sku, { basePrice: parseFloat(e.target.value) });
          }}
        />
      </td>
      <td className="p-2">
        <textarea
          className="w-40 h-8 rounded border border-border-subtle px-2 py-1 text-sm text-text-primary placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary resize-none focus:h-24 focus:absolute focus:z-10 focus:shadow-md transition-all"
          value={desc}
          onChange={e => {
            setDesc(e.target.value);
            onStageChange(p.sku, { description: e.target.value });
          }}
          placeholder="Description..."
        />
      </td>
      <td className="p-2"><input type="checkbox" checked={ready} onChange={e => handleReadyChange(e.target.checked)} /></td>
      <td className="p-2"><input type="checkbox" checked={feat} onChange={e => handleFeatChange(e.target.checked)} /></td>
      <td className="p-2">
        <input
          className="w-56 rounded border border-border-subtle px-2 py-1 text-sm text-text-primary placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          value={tags}
          onChange={e => handleTagsChange(e.target.value)}
          placeholder="comma,separated"
        />
      </td>
      <td className="p-2">
        <input
          className="w-56 rounded border border-border-subtle px-2 py-1 text-sm text-text-primary placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          value={promise}
          onChange={e => setPromise(e.target.value)}
          placeholder="e.g., Ships in 24h"
        />
      </td>
      <td className="p-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-full border border-border-subtle px-3 py-1 text-sm font-semibold text-text-primary transition hover:border-border-strong hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : isStaged ? 'Save*' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
