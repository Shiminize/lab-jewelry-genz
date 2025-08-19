import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lab-Grown Diamond Jewelry Catalog | GlowGlitch',
  description: 'Browse our collection of sustainable lab-grown diamond jewelry. Engagement rings, necklaces, earrings, and bracelets with 3D customization.',
  keywords: ['lab-grown diamonds', 'sustainable jewelry', 'engagement rings', 'diamond necklaces', 'custom jewelry'],
  openGraph: {
    title: 'Lab-Grown Diamond Jewelry Catalog | GlowGlitch',
    description: 'Browse our collection of sustainable lab-grown diamond jewelry with 3D customization.',
    images: ['/images/catalog-og.jpg'],
  }
}

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}