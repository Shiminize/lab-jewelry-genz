import Link from 'next/link'

import { listAdminProducts } from '@/services/admin/catalog'
import { Typography } from '@/components/ui'

interface CatalogDashboardPageProps {
  searchParams?: Record<string, string | string[]>
}

export default async function CatalogDashboardPage({ searchParams }: CatalogDashboardPageProps) {
  const statusFilter = getParam(searchParams, 'status')
  const products = await listAdminProducts(150)

  const filteredProducts =
    statusFilter && statusFilter !== 'all'
      ? products.filter((product) => product.status === statusFilter)
      : products

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Typography as="h1" variant="heading">
          Catalog management
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          Update pricing, feature status, or publish new capsules. Select any product to edit the details.
        </Typography>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-text-secondary">
        <FilterLink label="All" href="/dashboard/catalog" active={!statusFilter || statusFilter === 'all'} />
        <FilterLink
          label="Active"
          href="/dashboard/catalog?status=active"
          active={statusFilter === 'active'}
        />
        <FilterLink
          label="Draft"
          href="/dashboard/catalog?status=draft"
          active={statusFilter === 'draft'}
        />
        <FilterLink
          label="Archived"
          href="/dashboard/catalog?status=archived"
          active={statusFilter === 'archived'}
        />
        <span className="ml-auto text-[0.65rem]">
          Showing {filteredProducts.length} of {products.length} products
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle shadow-soft">
        <table className="min-w-full divide-y divide-border-subtle text-sm">
          <thead className="bg-surface-panel">
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-text-muted">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Featured</th>
              <th className="px-5 py-3 font-semibold">Bestseller</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-base text-text-secondary">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary">{product.name}</span>
                    {product.updatedAt ? (
                      <span className="text-xs text-text-muted">
                        Updated {product.updatedAt.toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4 text-text-secondary">{product.category}</td>
                <td className="px-5 py-4">${product.basePrice.toLocaleString()}</td>
                <td className="px-5 py-4">{product.featured ? 'Yes' : 'No'}</td>
                <td className="px-5 py-4">{product.bestseller ? 'Yes' : 'No'}</td>
                <td className="px-5 py-4 capitalize">{product.status}</td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/dashboard/catalog/${encodeURIComponent(product.id)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-text-muted">
                  No products found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getParam(params: CatalogDashboardPageProps['searchParams'], key: string) {
  const value = params?.[key]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 font-semibold transition ${
        active
          ? 'border-accent-primary bg-accent-primary/10 text-text-primary'
          : 'border-border-subtle text-text-secondary hover:border-accent-primary hover:text-text-primary'
      }`}
    >
      {label}
    </Link>
  )
}
