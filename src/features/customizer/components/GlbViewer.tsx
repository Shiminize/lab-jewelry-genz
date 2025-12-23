'use client'

import { useEffect, useRef, useState } from 'react'
import type { ModelViewerElement } from '@google/model-viewer'
import { cn } from '@/lib/utils'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
        src?: string
        poster?: string
        'environment-image'?: string
        'camera-controls'?: boolean
        'auto-rotate'?: boolean
        alt?: string
        ar?: boolean
        exposure?: number
        style?: React.CSSProperties
      }
    }
  }
}

export interface GlbViewerProps {
  src: string
  poster?: string
  environmentImage?: string
  autoRotate?: boolean
  cameraControls?: boolean
  ar?: boolean
  exposure?: number
  alt?: string
  className?: string
}

export function GlbViewer({
  src,
  poster,
  environmentImage,
  autoRotate = true,
  cameraControls = true,
  ar = false,
  exposure = 1,
  alt = '3D preview',
  className,
}: GlbViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isModelViewerReady, setIsModelViewerReady] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return typeof customElements !== 'undefined' && !!customElements.get('model-viewer')
  })

  useEffect(() => {
    if (isModelViewerReady) {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    let cancelled = false

    async function ensureModelViewer() {
      try {
        if (!customElements.get('model-viewer')) {
          await import('@google/model-viewer')
        }
        if (!cancelled) {
          setIsModelViewerReady(true)
        }
      } catch (error) {
        console.error('Failed to load <model-viewer> component', error)
      }
    }

    void ensureModelViewer()

    return () => {
      cancelled = true
    }
  }, [isModelViewerReady])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const handleLoad = () => setIsLoaded(true)
    const handleError = (event: Event) => {
      console.error('GLB viewer error', event)
    }

    viewer.addEventListener('load', handleLoad)
    viewer.addEventListener('error', handleError)

    return () => {
      viewer.removeEventListener('load', handleLoad)
      viewer.removeEventListener('error', handleError)
    }
  }, [src])

  return (
    <div className={cn('relative overflow-hidden rounded-none border border-brand-ink/10 bg-surface-base shadow-soft', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-base/70">
          <div className="h-8 w-8 animate-spin rounded-none border-2 border-brand-sky/40 border-t-transparent" />
        </div>
      )}
      {isModelViewerReady ? (
        <model-viewer
          ref={viewerRef}
          src={src}
          poster={poster}
          alt={alt}
          ar={ar}
          exposure={exposure}
          camera-controls={cameraControls}
          auto-rotate={autoRotate}
          environment-image={environmentImage}
          style={{ width: '100%', height: '100%', minHeight: '20rem' }}
        />
      ) : (
        <div className="flex min-h-[20rem] items-center justify-center text-sm text-body">
          Initializing viewer…
        </div>
      )}
    </div>
  )
}
