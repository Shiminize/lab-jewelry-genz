'use client'

/**
 * Product Breadcrumbs Component
 * Navigation breadcrumbs for product pages
 */

import Link from 'next/link'

interface ProductBreadcrumbsProps {
  category: string
  subcategory?: string
  productName: string
}

export default function ProductBreadcrumbs({ category, subcategory, productName }: ProductBreadcrumbsProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: category, href: `/products?category=${encodeURIComponent(category)}` },
  ]

  if (subcategory) {
    breadcrumbs.push({
      label: subcategory,
      href: `/products?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`
    })
  }

  breadcrumbs.push({ label: productName, href: '#' })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-token-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 text-muted-foreground mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-aurora-nav-muted font-medium truncate max-w-[200px]">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-aurora-nav-muted hover:text-amber-600 transition-colors duration-200 font-medium"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}