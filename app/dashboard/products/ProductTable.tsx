'use client';

import { useState } from 'react';

type ProductRow = {
  sku?: string;
  _id?: string;
  title?: string;
  readyToShip?: boolean;
  featuredInWidget?: boolean;
  tags?: string[];
  shippingPromise?: string;
};

export default function ProductTable({ items }: { items: ProductRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">SKU</th>
            <th className="p-2">Title</th>
            <th className="p-2">Ready?</th>
            <th className="p-2">Featured?</th>
            <th className="p-2">Tags</th>
            <th className="p-2">Promise</th>
            <th className="p-2">Save</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <Row key={p.sku || p._id} p={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ p }: { p: ProductRow }) {
  const [ready, setReady] = useState(Boolean(p.readyToShip));
  const [feat, setFeat] = useState(Boolean(p.featuredInWidget));
  const [tags, setTags] = useState<string>((p.tags || []).join(','));
  const [promise, setPromise] = useState<string>(p.shippingPromise || '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!p.sku) {
      alert('Missing SKU');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/products/${encodeURIComponent(p.sku)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readyToShip: ready,
        featuredInWidget: feat,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        shippingPromise: promise || undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      alert('Save failed');
    } else {
      alert('Saved');
    }
  };

  return (
    <tr className="border-b align-top">
      <td className="p-2 whitespace-nowrap">{p.sku}</td>
      <td className="p-2 w-64">{p.title}</td>
      <td className="p-2">
        <input
          type="checkbox"
          checked={ready}
          onChange={(e) => setReady(e.target.checked)}
        />
      </td>
      <td className="p-2">
        <input
          type="checkbox"
          checked={feat}
          onChange={(e) => setFeat(e.target.checked)}
        />
      </td>
      <td className="p-2">
        <input
          className="border px-2 py-1 w-56"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="comma,separated"
        />
      </td>
      <td className="p-2">
        <input
          className="border px-2 py-1 w-56"
          value={promise}
          onChange={(e) => setPromise(e.target.value)}
          placeholder="e.g., Ships in 24h"
        />
      </td>
      <td className="p-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="border px-3 py-1 rounded"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
