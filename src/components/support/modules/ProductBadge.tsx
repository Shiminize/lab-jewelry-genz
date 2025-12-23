'use client';
export function ReadyBadge({ product }: { product: { readyToShip?: boolean; tags?: string[] }}) {
  const ready = product.readyToShip || product.tags?.includes('ready-to-ship');
  if (!ready) return null;
  return (
    <span aria-label="Ready to ship" className="inline-block text-xs px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
      Ready to ship
    </span>
  );
}
