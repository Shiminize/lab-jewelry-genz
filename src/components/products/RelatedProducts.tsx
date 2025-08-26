'use client'

/**
 * Related Products Component
 * Displays recommended products based on category, price, or user behavior
 */

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  price: {
    current: number
    base: number
    currency: string
  }
  media: {
    hero: string
    gallery: string[]
  }
  rating: number
  reviewCount: number
  category: string
  tags: string[]
}

interface RelatedProductsProps {
  products: Product[]
  title?: string
}

export default function RelatedProducts({ products, title = "You Might Also Like" }: RelatedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

  if (!products || products.length === 0) {
    return null
  }

  // Calculate visible products (responsive)
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 4  // lg
      if (window.innerWidth >= 768) return 3   // md
      if (window.innerWidth >= 640) return 2   // sm
    }
    return 1 // default
  }

  const visibleCount = getVisibleCount()
  const maxIndex = Math.max(0, products.length - visibleCount)

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        {products.length > visibleCount && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full border ${
                currentIndex === 0
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              } transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={`p-2 rounded-full border ${
                currentIndex >= maxIndex
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              } transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex-shrink-0 px-3 ${
                visibleCount === 1 ? 'w-full' :
                visibleCount === 2 ? 'w-1/2' :
                visibleCount === 3 ? 'w-1/3' :
                'w-1/4'
              }`}
            >
              <div
                className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link href={`/products/${product.slug}`}>
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={hoveredProduct === product.id && product.media.gallery[1] 
                        ? product.media.gallery[1] 
                        : product.media.hero
                      }
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    
                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-x-2">
                        <button className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {product.price.current < product.price.base && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                          Sale
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    {/* Category */}
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {product.category}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-500">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price.current.toFixed(2)}
                      </span>
                      {product.price.current < product.price.base && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.price.base.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Quick Add to Cart */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        // Add to cart logic here
                        console.log('Quick add to cart:', product.id)
                      }}
                      className="w-full py-2 px-4 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors opacity-0 group-hover:opacity-100 duration-300"
                    >
                      Quick Add
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {products.length > visibleCount && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-amber-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="text-center mt-8">
        <Link
          href="/products"
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          View All Products
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}