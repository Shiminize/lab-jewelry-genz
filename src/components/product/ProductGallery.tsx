'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface ProductGalleryProps {
  images: string[]
  productName: string
  tone?: 'volt' | 'cyan' | 'magenta' | 'lime'
  className?: string
}

export function ProductGallery({ images, productName, tone = 'cyan', className }: ProductGalleryProps) {
  const media = useMemo(() => images.filter(Boolean), [images])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const hasImages = media.length > 0
  const activeImage = hasImages ? media[Math.min(activeIndex, media.length - 1)] : undefined

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          'relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border border-border-subtle bg-surface-base',
          !activeImage && 'bg-surface-panel',
        )}
      >
        {activeImage ? (
          <Image
            key={activeImage}
            src={activeImage}
            alt={`${productName} preview`}
            fill
            className="object-cover"
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ) : (
          <span className="text-xs uppercase tracking-[0.35em] text-text-muted">Imagery coming soon</span>
        )}

        {/* Gallery Controls (if needed for main image slider on mobile in future) */}
      </div>

      {hasImages && media.length > 1 ? (
        <div className="grid grid-cols-4 gap-px bg-border-subtle border border-border-subtle">
          {media.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden border-none transition duration-300 focus-visible:outline-none',
                activeIndex === index
                  ? 'opacity-100 ring-1 ring-inset ring-text-primary'
                  : 'opacity-70 hover:opacity-100',
              )}
              aria-label={`View ${productName} image ${index + 1}`}
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(min-width: 1024px) 10vw, 25vw"
              />
            </button>
          ))}
        </div>
      ) : null}

      {hasImages ? (
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => setIsLightboxOpen(true)}>
            View full details
          </Button>
        </div>
      ) : null}

      {isLightboxOpen && activeImage
        ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-base/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative h-full w-full p-4 md:p-12 flex flex-col">
              <div className="relative flex-1 w-full h-full">
                <Image
                  src={activeImage}
                  alt={`${productName} full size`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="group flex items-center gap-2 px-4 py-2 bg-surface-base border border-border-subtle hover:border-text-primary transition-colors"
                >
                  <span className="text-xs uppercase tracking-widest text-text-primary">Close View</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}
    </div>
  )
}


