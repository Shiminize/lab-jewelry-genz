/**
 * Product Detail Page Component
 * Rich product experience with 3D customizer integration
 * Supports real-time customization and pricing updates
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import ProductDetailView from '@/components/products/ProductDetailView'
import ProductReviews from '@/components/products/ProductReviews'
import RelatedProducts from '@/components/products/RelatedProducts'
import ProductBreadcrumbs from '@/components/products/ProductBreadcrumbs'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProductPageProps {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/products/${params.slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (!response.ok) {
      return {
        title: 'Product Not Found - GlowGlitch',
        description: 'The requested product could not be found.'
      }
    }
    
    const data = await response.json()
    const product = data.data
    
    return {
      title: `${product.name} - GlowGlitch Lab-Grown Jewelry`,
      description: product.description,
      keywords: [
        product.name,
        'lab-grown jewelry',
        'sustainable jewelry',
        'custom jewelry',
        '3D jewelry customizer',
        ...(Array.isArray(product.tags) ? product.tags : [])
      ].join(', '),
      openGraph: {
        title: product.name,
        description: product.description,
        images: [
          {
            url: product.assets?.primary || '/images/default-product.jpg',
            width: 800,
            height: 600,
            alt: product.name,
          }
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: [product.assets?.primary || '/images/default-product.jpg'],
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'GlowGlitch - Lab-Grown Jewelry',
      description: 'Discover our collection of sustainable, lab-grown jewelry.'
    }
  }
}

// Fetch product data
async function getProduct(slug: string) {
  try {
    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Fetch related products
async function getRelatedProducts(productId: string, category: string) {
  try {
    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/products/related?productId=${productId}&category=${category}&limit=4`,
      {
        next: { revalidate: 1800 } // 30 minutes
      }
    )
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.success ? data.data.products : []
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const product = await getProduct(params.slug)
  
  if (!product) {
    notFound()
  }
  
  const relatedProducts = await getRelatedProducts(product._id, product.category)
  
  // Structure product data for ProductDetailView using ProductDTO format
  const productData = {
    id: product._id,
    name: product.name,
    slug: product.seo?.slug || product._id,
    description: product.description,
    price: {
      base: product.pricing?.basePrice || 0,
      current: product.pricing?.basePrice || 0,
      currency: product.pricing?.currency || 'USD'
    },
    media: {
      hero: product.assets?.primary || '/images/placeholder-product.jpg',
      gallery: product.assets?.gallery || [],
      video: product.assets?.videos?.[0] || null
    },
    inventory: {
      inStock: product.inventory?.available || 0,
      stockLevel: product.inventory?.quantity || 0
    },
    category: product.category,
    subcategory: product.subcategory,
    tags: product.metadata?.tags || [],
    rating: 4.5, // Placeholder - will be implemented in future phases
    reviewCount: 0 // Placeholder - will be implemented in future phases
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <ProductBreadcrumbs 
          category={product.category}
          subcategory={product.subcategory}
          productName={product.name}
        />
      </div>
      
      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          }>
            <ProductDetailView 
              product={productData}
            />
          </Suspense>
        </div>
      </div>
      
      {/* Product Specifications */}
      <section className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Product Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Category:</dt>
                    <dd className="text-gray-900 font-medium capitalize">{product.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Subcategory:</dt>
                    <dd className="text-gray-900 font-medium capitalize">{product.subcategory}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Price:</dt>
                    <dd className="text-gray-900 font-medium">${product.pricing?.basePrice || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Availability:</dt>
                    <dd className="text-gray-900 font-medium">
                      {(product.inventory?.available || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span>
                    <span className="text-gray-700">Lab-grown diamonds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span>
                    <span className="text-gray-700">Sustainable materials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span>
                    <span className="text-gray-700">Conflict-free sourcing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">✓</span>
                    <span className="text-gray-700">Customizable options</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Care Instructions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Instructions</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-gray-700">
                  Clean with mild soap and warm water. Store in provided jewelry box. 
                  Avoid exposure to harsh chemicals and extreme temperatures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Reviews */}
      <section className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={
            <div className="max-w-4xl mx-auto">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          }>
            <ProductReviews productId={product._id} />
          </Suspense>
        </div>
      </section>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-200 py-12">
          <div className="container mx-auto px-4">
            <Suspense fallback={
              <div className="max-w-6xl mx-auto">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            }>
              <RelatedProducts products={relatedProducts} />
            </Suspense>
          </div>
        </section>
      )}
      
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.assets?.primary,
            "brand": {
              "@type": "Brand",
              "name": "GlowGlitch"
            },
            "offers": {
              "@type": "Offer",
              "price": product.pricing?.basePrice,
              "priceCurrency": product.pricing?.currency,
              "availability": (product.inventory?.available || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "GlowGlitch"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": 4.5,
              "reviewCount": 1
            }
          })
        }}
      />
    </div>
  )
}