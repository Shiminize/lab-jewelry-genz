'use client';

import { useState } from 'react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onSetFeatured: (value: boolean) => void;
  onSetReady: (value: boolean) => void;
  onAddTags: (tags: string[]) => void;
  onRemoveTags: (tags: string[]) => void;
  onClearSelection: () => void;
  disabled: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  onSetFeatured,
  onSetReady,
  onAddTags,
  onRemoveTags,
  onClearSelection,
  disabled,
}: BulkActionsToolbarProps) {
  const [showTagsInput, setShowTagsInput] = useState<'add' | 'remove' | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  const handleAddTags = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      onAddTags(tags);
      setTagsInput('');
      setShowTagsInput(null);
    }
  };

  const handleRemoveTags = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      onRemoveTags(tags);
      setTagsInput('');
      setShowTagsInput(null);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-border-subtle bg-accent-secondary/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold text-text-primary">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </div>
        <button
          onClick={onClearSelection}
          disabled={disabled}
          className="text-sm font-medium text-accent-primary transition hover:text-accent-primary/80 disabled:opacity-50"
        >
          Clear selection
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Set Featured */}
        <button
          onClick={() => onSetFeatured(true)}
          disabled={disabled}
          className="rounded-full bg-accent-primary px-3 py-2 text-sm font-semibold text-surface-base transition hover:bg-accent-primary/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✓ Set Featured
        </button>
        <button
          onClick={() => onSetFeatured(false)}
          disabled={disabled}
          className="rounded-full border border-border-subtle bg-neutral-50 px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✗ Unset Featured
        </button>

        {/* Set Ready */}
        <button
          onClick={() => onSetReady(true)}
          disabled={disabled}
          className="rounded-full bg-accent-primary px-3 py-2 text-sm font-semibold text-surface-base transition hover:bg-accent-primary/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          📦 Set Ready to Ship
        </button>
        <button
          onClick={() => onSetReady(false)}
          disabled={disabled}
          className="rounded-full border border-border-subtle bg-neutral-50 px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          📦 Unset Ready to Ship
        </button>

        {/* Tags */}
        <button
          onClick={() => setShowTagsInput('add')}
          disabled={disabled}
          className="rounded-full bg-accent-secondary px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-accent-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          🏷️ Add Tags
        </button>
        <button
          onClick={() => setShowTagsInput('remove')}
          disabled={disabled}
          className="rounded-full bg-warning px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-warning/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          🏷️ Remove Tags
        </button>
      </div>

      {/* Tags Input */}
      {showTagsInput && (
        <div className="mt-3 rounded border border-border-subtle bg-surface-base p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Enter tags (comma-separated)"
              className="flex-1 rounded border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
              disabled={disabled}
            />
            <button
              onClick={showTagsInput === 'add' ? handleAddTags : handleRemoveTags}
              disabled={disabled || !tagsInput.trim()}
              className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-surface-base transition hover:bg-accent-primary/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showTagsInput === 'add' ? 'Add' : 'Remove'}
            </button>
            <button
              onClick={() => {
                setShowTagsInput(null);
                setTagsInput('');
              }}
              disabled={disabled}
              className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-neutral-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          <div className="mt-2 text-xs text-text-secondary">
            Example: gift, ready-to-ship, bestseller
          </div>
        </div>
      )}
    </div>
  );
}
