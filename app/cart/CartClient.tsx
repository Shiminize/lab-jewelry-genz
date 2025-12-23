'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Minus, Plus, ShoppingBag, Undo2, X } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, Button, Typography } from '@/components/ui'
import { ProductCard } from '@/components/ui/ProductCard'
import { Section, SectionContainer } from '@/components/layout/Section'
import { GalleryRail } from '@/components/layout/GalleryRail'
import type { CatalogPreviewProduct } from '@/config/catalogDefaults'
import type { CartSummary } from '@/services/neon/cartService'
import { cn } from '@/lib/utils'

interface CartClientProps {
  initialCart: CartSummary
  sampleProducts: CatalogPreviewProduct[]
}

interface ApiCartResponse {
  success: boolean
  data: CartSummary
}

type ToastTone = 'success' | 'info' | 'error'

interface ToastMessage {
  tone: ToastTone
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface RecommendedStackConfig {
  id: string
  title: string
  description: string
  items: {
    slug: string
    quantity: number
  }[]
}

interface EnrichedStack extends RecommendedStackConfig {
  items: (RecommendedStackConfig['items'][number] & { product: CatalogPreviewProduct })[]
  total: number
}

type CartSummaryItem = CartSummary['items'][number]

const RECOMMENDED_STACKS: RecommendedStackConfig[] = [
  {
    id: 'flux-series-set',
    title: 'Flux Series Set',
    description: 'Layer our signature bar studs with the floating bubble necklace for a complete Flux energy.',
    items: [
      { slug: 'array-8-bar-studs', quantity: 1 },
      { slug: 'orbital-flux-necklace-set', quantity: 1 },
    ],
  },
  {
    id: 'everyday-texture',
    title: 'Everyday Texture',
    description: 'The essential link necklace paired with standard issue hoops. Your daily uniform.',
    items: [
      { slug: 'layering-link-stream', quantity: 1 },
      { slug: 'standard-issue-hoops', quantity: 1 },
    ],
  },
  {
    id: 'statement-chaos',
    title: 'Statement Chaos',
    description: 'Embrace entropy with the mixed-metal Chaos Ring and the disrupted flow of the Cascade Chain.',
    items: [
      { slug: 'chaos-ring', quantity: 1 },
      { slug: 'cascade-chain', quantity: 1 },
    ],
  },
]

const BEST_SELLERS = new Set(['standard-issue-hoops', 'orbital-flux-necklace-set', 'chaos-ring'])

export function CartClient({ initialCart, sampleProducts }: CartClientProps) {
  const [cart, setCart] = useState<CartSummary>(initialCart)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  const itemCount = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart],
  )

  const subtotal = useMemo(
    () => cart.items.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  )

  const recommendedStacks = useMemo<EnrichedStack[]>(() => {
    if (!sampleProducts?.length) return []
    return RECOMMENDED_STACKS.map((stack) => {
      const enrichedItems = stack.items
        .map((stackItem) => {
          const product = sampleProducts.find((product) => product.slug === stackItem.slug)
          if (!product) return null
          return { ...stackItem, product }
        })
        .filter((value): value is EnrichedStack['items'][number] => Boolean(value))

      const total = enrichedItems.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0)

      return {
        ...stack,
        items: enrichedItems,
        total,
      }
    }).filter((stack) => stack.items.length > 0)
  }, [sampleProducts])

  useEffect(() => {
    if (!cart.cartId) {
      void ensureCart().then((summary) => {
        if (summary) {
          setCart(summary)
        }
      })
    } else {
      persistCartId(cart.cartId)
    }
  }, [cart.cartId])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const mutateCart = useCallback(
    (mutation: (cartId: string) => Promise<ApiCartResponse | null>, afterSuccess?: (summary: CartSummary) => void) => {
      startTransition(async () => {
        const current = await ensureCart()
        if (!current?.cartId) {
          setErrorMessage('We couldn\'t reach the Neon cart service. Please refresh and try again.')
          return
        }

        const payload = await mutation(current.cartId)
        if (!payload) {
          setErrorMessage('We couldn\'t update your cart. Try again in a moment.')
          return
        }

        if (payload.success) {
          setCart(payload.data)
          setErrorMessage(null)
          afterSuccess?.(payload.data)
        } else {
          setErrorMessage('We couldn\'t update your cart. Try again in a moment.')
        }
      })
    },
    [startTransition],
  )

  const handleAdd = useCallback(
    (slug: string, quantity = 1) => {
      const product = sampleProducts.find((item) => item.slug === slug)
      mutateCart(
        async (cartId) => {
          const response = await fetch(`/api/neon/cart/${cartId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, quantity }),
            credentials: 'include',
          })

          if (!response.ok) {
            return null
          }

          return (await response.json()) as ApiCartResponse
        },
        () => {
          if (product) {
            setToast({
              tone: 'success',
              title: `${product.name} added`,
              description: 'We saved this capsule to your cart.',
            })
          } else {
            setToast({ tone: 'success', title: 'Cart updated' })
          }
        },
      )
    },
    [mutateCart, sampleProducts],
  )

  const handleRemove = useCallback(
    (item: CartSummaryItem) => {
      mutateCart(
        async (cartId) => {
          const response = await fetch(`/api/neon/cart/${cartId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: item.slug }),
            credentials: 'include',
          })

          if (!response.ok) {
            return null
          }

          return (await response.json()) as ApiCartResponse
        },
        () => {
          setToast({
            tone: 'info',
            title: `${item.name} removed`,
            description: 'Undo in the next few seconds if that was accidental.',
            action: {
              label: 'Undo',
              onClick: () => handleAdd(item.slug, item.quantity),
            },
          })
        },
      )
    },
    [mutateCart, handleAdd],
  )

  const handleQuantityChange = useCallback(
    (item: CartSummaryItem, nextQuantity: number) => {
      if (nextQuantity <= 0) {
        handleRemove(item)
        return
      }

      const previousQuantity = item.quantity
      const previousSnapshot: CartSummaryItem = { ...item }

      mutateCart(
        async (cartId) => {
          const response = await fetch(`/api/neon/cart/${cartId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: item.slug, quantity: nextQuantity }),
            credentials: 'include',
          })

          if (!response.ok) {
            return null
          }

          return (await response.json()) as ApiCartResponse
        },
        () => {
          setToast({
            tone: 'info',
            title: `${item.name} updated`,
            description: `Quantity set to ${nextQuantity}.`,
            action: {
              label: 'Undo',
              onClick: () => handleQuantityChange(previousSnapshot, previousQuantity),
            },
          })
        },
      )
    },
    [mutateCart, handleRemove],
  )

  const handleClear = useCallback(() => {
    mutateCart(
      async (cartId) => {
        const response = await fetch(`/api/neon/cart/${cartId}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          return null
        }

        return (await response.json()) as ApiCartResponse
      },
      () => {
        setToast({ tone: 'info', title: 'Cart cleared' })
      },
    )
  }, [mutateCart])

  const handleAddStack = useCallback(
    (stack: EnrichedStack, multiplier = 1) => {
      mutateCart(
        async (cartId) => {
          let latest: ApiCartResponse | null = null
          const itemsToAdd = stack.items.map((item) => ({ slug: item.slug, quantity: item.quantity * multiplier }))

          for (const entry of itemsToAdd) {
            const response = await fetch(`/api/neon/cart/${cartId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
              credentials: 'include',
            })

            if (!response.ok) {
              return null
            }

            const payload = (await response.json()) as ApiCartResponse
            if (!payload.success) {
              return payload
            }

            latest = payload
          }

          return latest
        },
        () => {
          const stackLabel = multiplier > 1 ? `${multiplier} × ${stack.title}` : stack.title
          setToast({ tone: 'success', title: `${stackLabel} added`, description: 'We queued the full stack inside your lineup.' })
        },
      )
    },
    [mutateCart],
  )

  const hasItems = cart.items.length > 0

  return (
    <>
      <div className="relative bg-app pb-32">
        <Section variant="transparent" spacing="compact" className="pb-0">
          <SectionContainer size="max" className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-12">
            <div className="w-full lg:flex-1 lg:min-w-0 space-y-14">
              <div className="mx-auto w-full max-w-[var(--ja-layout-content)] space-y-12">
                <header className="space-y-5 max-w-[min(48rem,100%)]">
                  <div className="space-y-2">
                    <Typography variant="eyebrow" className="uppercase tracking-[0.28em] text-body-muted">
                      Neon cart
                    </Typography>
                    <Typography variant="heading" className="text-brand-ink">
                      Your custom capsule lineup
                    </Typography>
                  </div>
                  <Typography variant="body" className="max-w-2xl text-body" data-testid="cart-hero-body">
                    Pick a capsule to start curating your GlowGlitch stack. Add, remix, or remove pieces while totals update instantly for concierge checkout.
                  </Typography>
                  {errorMessage && (
                    <div className="flex items-start gap-3 border border-accent-primary/30 bg-accent-muted/40 px-4 py-3 text-sm text-brand-ink">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center bg-accent-primary/20 font-semibold text-[0.625rem] uppercase tracking-wide text-accent-primary">
                        !
                      </span>
                      <p>{errorMessage}</p>
                    </div>
                  )}
                </header>

                <div className="space-y-6">
                  {hasItems ? (
                    cart.items.map((item) => (
                      <CartItemCard
                        key={item.slug}
                        item={item}
                        onRemove={() => handleRemove(item)}
                        onIncrease={() => handleQuantityChange(item, item.quantity + 1)}
                        onDecrease={() => handleQuantityChange(item, item.quantity - 1)}
                        isPending={isPending}
                      />
                    ))
                  ) : (
                    <EmptyCartCard isPending={isPending} />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="mx-auto w-full max-w-[var(--ja-layout-content)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Typography variant="eyebrow" className="text-body-muted">
                    Sample capsules
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" tone="ink" leftIcon={<Undo2 size={16} />} onClick={handleClear} disabled={!hasItems || isPending}>
                      Clear cart
                    </Button>
                    <Button variant="ghost" tone="ink" href="/collections" rightIcon={<ArrowRight size={16} />}>
                      Continue shopping
                    </Button>
                  </div>
                </div>

                <SampleCapsuleGrid products={sampleProducts} onAdd={handleAdd} isPending={isPending} />
              </div>

              {hasItems && recommendedStacks.length > 0 && (
                <div className="mx-auto w-full max-w-[var(--ja-layout-content)] space-y-6">
                  <Typography variant="title" className="text-brand-ink">
                    Recommended stacks
                  </Typography>
                  <div className="-mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                    {recommendedStacks.map((stack) => (
                      <RecommendedStackCard key={stack.id} stack={stack} isPending={isPending} onAdd={handleAddStack} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="hidden space-y-6 lg:flex lg:flex-col lg:sticky lg:top-24 lg:ml-auto lg:pl-8 xl:pl-12 w-full max-w-[360px] xl:max-w-[420px] lg:flex-none">
              <CartSummaryCard itemCount={itemCount} subtotal={subtotal} isPending={isPending} hasItems={hasItems} />
            </aside>
          </SectionContainer>
        </Section>
      </div>

      <div className="lg:hidden">
        <MobileSummaryBar
          itemCount={itemCount}
          subtotal={subtotal}
          isPending={isPending}
          hasItems={hasItems}
          isOpen={isMobileSummaryOpen}
          onToggle={() => setMobileSummaryOpen((prev) => !prev)}
        />
      </div>

      {toast && <CartToast toast={toast} onDismiss={() => setToast(null)} />}
    </>
  )
}

async function ensureCart(): Promise<CartSummary | null> {
  const existing = readCartIdFromDocument()
  if (existing) {
    return { cartId: existing, items: [], createdAt: new Date(), updatedAt: new Date() }
  }

  const response = await fetch('/api/neon/cart', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as { success: boolean; data: { cartId: string } }
  if (!payload.success) {
    return null
  }

  persistCartId(payload.data.cartId)
  return {
    cartId: payload.data.cartId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function readCartIdFromDocument(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }
  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('neon_cart_id='))
  return match ? match.split('=')[1] : undefined
}

function persistCartId(cartId: string) {
  if (typeof document === 'undefined') {
    return
  }
  document.cookie = `neon_cart_id=${cartId}; Path=/; Max-Age=${60 * 60 * 24 * 30}`
}

function ToneBadge({ tone }: { tone: CartSummaryItem['tone'] }) {
  const toneCopy: Record<CartSummaryItem['tone'], string> = {
    volt: 'Volt',
    cyan: 'Cyan',
    magenta: 'Magenta',
    lime: 'Lime',
  }
  const toneClasses: Record<CartSummaryItem['tone'], string> = {
    volt: 'border-accent-primary/40 text-accent-primary',
    cyan: 'border-accent-secondary/40 text-accent-secondary',
    magenta: 'border-accent-primary/50 text-accent-primary',
    lime: 'border-accent-secondary/50 text-accent-secondary',
  }

  return (
    <span className={cn('border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]', toneClasses[tone])}>
      {toneCopy[tone]}
    </span>
  )
}

function CartItemCard({
  item,
  onRemove,
  onIncrease,
  onDecrease,
  isPending,
}: {
  item: CartSummaryItem
  onRemove: () => void
  onIncrease: () => void
  onDecrease: () => void
  isPending: boolean
}) {
  return (
    <Card className="surface-panel overflow-hidden border-border-subtle/50">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className={cn('relative h-28 w-full overflow-hidden border border-border-subtle bg-surface-base shadow-soft sm:h-28 sm:w-28', !item.heroImage && 'bg-surface-panel')}>
          {item.heroImage ? (
            <Image
              src={item.heroImage}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 7rem, 40vw"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[0.625rem] uppercase tracking-[0.3em] text-body-muted">
              Preview soon
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Typography variant="title" className="text-brand-ink">
              {item.name}
            </Typography>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-body-muted">
              <ToneBadge tone={item.tone} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Typography variant="title" className="text-brand-ink">
              ${item.price.toLocaleString()}
            </Typography>
            <QuantityStepper value={item.quantity} onIncrease={onIncrease} onDecrease={onDecrease} disabled={isPending} />
          </div>
        </div>
        <Button type="button" variant="outline" tone="ink" onClick={onRemove} disabled={isPending}>
          Remove
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyCartCard({ isPending }: { isPending: boolean }) {
  return (
    <Card className="relative overflow-hidden border-border-subtle/40 bg-surface-panel">
      <div className="pointer-events-none absolute inset-0 bg-accent-muted/60" aria-hidden />
      <CardContent className="relative flex flex-col items-center gap-5 px-8 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center bg-accent-primary/10 text-xs font-semibold uppercase tracking-[0.4em] text-text-primary">
          GG
        </div>
        <Typography variant="title" className="text-brand-ink">
          Your cart is empty
        </Typography>
        <Typography variant="body" className="max-w-sm text-body">
          Browse a sample capsule below to see how Neon totals appear. We&apos;ll hang on to your picks across sessions.
        </Typography>
        <Button href="/collections" variant="outline" tone="sky" rightIcon={<ArrowRight size={16} />} disabled={isPending}>
          Browse capsules
        </Button>
      </CardContent>
    </Card>
  )
}

function SampleCapsuleGrid({
  products,
  onAdd,
  isPending,
}: {
  products: CatalogPreviewProduct[]
  onAdd: (slug: string, quantity?: number) => void
  isPending: boolean
}) {
  if (!products?.length) {
    return (
      <Card className="surface-panel">
        <CardContent className="p-6 text-sm text-body-muted">
          Sample capsules coming soon. Reach out to concierge for early access.
        </CardContent>
      </Card>
    )
  }

  return (
    <SectionContainer size="gallery" className="px-0">
      <GalleryRail ariaLabel="Sample capsule gallery">
        {products.map((product) => (
          <div
            key={product.slug}
            className="rail-gallery-item"
            style={{ flex: '0 0 min(22rem, 90vw)', maxWidth: '24rem' }}
          >
            <ProductCard
              slug={product.slug}
              name={product.name}
              category={product.category}
              price={product.price}
              tone={product.tone}
              surfaceTone="canvas"
              heroImage={product.heroImage}
              tagline={product.tagline}
              customizeHref={null}
              detailsHref={`/products/${product.slug}`}
              badges={BEST_SELLERS.has(product.slug) ? [{ label: 'Best seller', tone: 'ink' }] : undefined}
              className="h-full"
              actions={
                <div className="flex items-center gap-3">
                  <Button variant="link" tone="ink" href={`/products/${product.slug}`} className="tracking-[0.12em] uppercase">
                    View details
                  </Button>
                  <Button
                    type="button"
                    tone={product.tone}
                    size="sm"
                    className="ml-auto"
                    leftIcon={<Plus size={16} />}
                    data-testid={`add-to-cart-${product.slug}`}
                    onClick={() => onAdd(product.slug)}
                    disabled={isPending}
                  >
                    Add to cart
                  </Button>
                </div>
              }
            />
          </div>
        ))}
      </GalleryRail>
    </SectionContainer>
  )
}

function RecommendedStackCard({
  stack,
  isPending,
  onAdd,
}: {
  stack: EnrichedStack
  isPending: boolean
  onAdd: (stack: EnrichedStack, multiplier: number) => void
}) {
  const [multiplier, setMultiplier] = useState(1)

  const increase = () => setMultiplier((prev) => Math.min(prev + 1, 4))
  const decrease = () => setMultiplier((prev) => Math.max(prev - 1, 1))

  return (
    <Card className="surface-panel flex w-[min(20rem,80vw)] shrink-0 flex-col justify-between border-border-subtle/50 px-6 py-6">
      <div className="space-y-3">
        <Typography variant="title" className="text-brand-ink">
          {stack.title}
        </Typography>
        <Typography variant="body" className="text-body-muted">
          {stack.description}
        </Typography>
        <div className="space-y-2 text-sm text-body">
          {stack.items.map((item) => (
            <div key={item.slug} className="flex items-center justify-between">
              <span>{item.product.name}</span>
              <span className="text-body-muted">× {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="body" className="text-body-muted">
            Stack total
          </Typography>
          <Typography variant="title" className="text-brand-ink">
            ${(stack.total * multiplier).toLocaleString()}
          </Typography>
        </div>
        <div className="flex items-center justify-between border border-border-subtle bg-surface-base px-3 py-2">
          <button type="button" onClick={decrease} className="inline-flex h-8 w-8 items-center justify-center border border-border-subtle bg-surface-panel text-sm" aria-label="Decrease set" disabled={multiplier === 1}>
            <Minus size={16} />
          </button>
          <span className="text-sm font-semibold tracking-[0.2em] text-brand-ink">{multiplier} set{multiplier > 1 ? 's' : ''}</span>
          <button type="button" onClick={increase} className="inline-flex h-8 w-8 items-center justify-center border border-border-subtle bg-surface-panel text-sm" aria-label="Increase set" disabled={multiplier === 4}>
            <Plus size={16} />
          </button>
        </div>
        <Button type="button" className="w-full justify-center" leftIcon={<ShoppingBag size={16} />} onClick={() => onAdd(stack, multiplier)} disabled={isPending}>
          Add stack
        </Button>
      </div>
    </Card>
  )
}

function QuantityStepper({
  value,
  onIncrease,
  onDecrease,
  disabled,
}: {
  value: number
  onIncrease: () => void
  onDecrease: () => void
  disabled?: boolean
}) {
  const decreaseDisabled = disabled || value <= 1

  return (
    <div className="flex items-center gap-3 border border-border-subtle bg-surface-base px-3 py-1.5">
      <button
        type="button"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label="Decrease quantity"
        className="inline-flex h-8 w-8 items-center justify-center border border-transparent bg-surface-panel text-body transition hover:bg-surface-panel/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Minus size={16} />
      </button>
      <span className="min-w-[2ch] text-center text-sm font-semibold tracking-[0.16em] text-brand-ink">{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
        className="inline-flex h-8 w-8 items-center justify-center border border-transparent bg-surface-panel text-body transition hover:bg-surface-panel/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

function CartSummaryCard({ itemCount, subtotal, isPending, hasItems }: { itemCount: number; subtotal: number; isPending: boolean; hasItems: boolean }) {
  const ctaDisabled = !hasItems || isPending
  const formattedSubtotal = `$${subtotal.toLocaleString()}`

  return (
    <Card className="surface-panel border-border-subtle/50 bg-surface-panel/90 shadow-soft">
      <CardHeader className="space-y-3 pb-0 px-[var(--space-fluid-md)] pt-[var(--space-fluid-md)]">
        <Typography variant="eyebrow" className="uppercase tracking-[0.28em] text-body-muted">
          Cart snapshot
        </Typography>
        <div className="space-y-1">
          <Typography variant="title" className="text-brand-ink">
            Ready for checkout
          </Typography>
          <Typography variant="body" className="text-sm text-body-muted">
            Taxes and shipping are calculated securely on the next step.
          </Typography>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-[var(--space-fluid-md)] px-[var(--space-fluid-md)] text-body">
        <div className="space-y-3 border border-border-subtle/60 bg-surface-base px-[var(--space-fluid-sm)] py-[var(--space-fluid-sm)]">
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-body-muted">
            <span>Items</span>
            <span data-testid="cart-summary-count">{itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold text-brand-ink">
            <span>Subtotal</span>
            <span data-testid="cart-summary-subtotal">{formattedSubtotal}</span>
          </div>
        </div>
        <div className="space-y-2 text-sm text-body-muted">
          <p>GlowGlitch checkout supports card, bank transfer, and concierge-assisted payment.</p>
          <p className="text-xs uppercase tracking-[0.2em] text-body">All payments are encrypted & backed by concierge support.</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-[var(--space-fluid-sm)] px-[var(--space-fluid-md)] pb-[var(--space-fluid-md)] pt-[var(--space-fluid-md)]">
        <Button
          tone="ink"
          variant="accent"
          className="w-full justify-center text-base"
          href="/checkout"
          disabled={ctaDisabled}
        >
          Proceed to checkout
        </Button>
        <Button
          tone="ink"
          variant="outline"
          className="w-full justify-center"
          href="/collections"
          disabled={isPending}
        >
          Continue shopping
        </Button>
        <Link href="/checkout" className="text-xs uppercase tracking-[0.28em] text-body hover:text-brand-ink">
          View secure payment guide →
        </Link>
      </CardFooter>
    </Card>
  )
}

function MobileSummaryBar({
  itemCount,
  subtotal,
  isPending,
  hasItems,
  isOpen,
  onToggle,
}: {
  itemCount: number
  subtotal: number
  isPending: boolean
  hasItems: boolean
  isOpen: boolean
  onToggle: () => void
}) {
  if (!hasItems) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-base/95 backdrop-blur-xl">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={onToggle}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-body-muted">Cart snapshot</p>
          <p className="text-sm font-semibold text-brand-ink">{itemCount} item{itemCount === 1 ? '' : 's'} · ${subtotal.toLocaleString()}</p>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>
      {isOpen && (
        <div className="space-y-4 border-t border-border-subtle/60 px-5 pb-6 pt-4 text-sm text-body">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-brand-ink">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <Button tone="coral" variant="accent" className="w-full justify-center" href="mailto:concierge@glowglitch.com?subject=GlowGlitch%20Cart%20Checkout" disabled={isPending}>
            Email concierge
          </Button>
          <Button tone="sky" variant="outline" className="w-full justify-center" href="https://cal.com/glowglitch/checkout" disabled={isPending}>
            Book a call
          </Button>
        </div>
      )}
    </div>
  )
}

function CartToast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const toneStyles: Record<ToastTone, string> = {
    success: 'border-accent-secondary/40 bg-surface-base/95 text-brand-ink shadow-accent-glow',
    info: 'border-border-subtle bg-surface-base/95 text-brand-ink shadow-soft',
    error: 'border-red-300 bg-red-50 text-red-700 shadow-soft',
  }

  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'info' ? ShoppingBag : X

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 max-w-sm border px-5 py-4', toneStyles[toast.tone])}>
      <div className="flex items-start gap-3">
        <Icon size={20} className="mt-0.5" aria-hidden />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && <p className="mt-1 text-sm text-body-muted">{toast.description}</p>}
          </div>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick()
                onDismiss()
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-secondary hover:text-accent-secondary/80"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-body-muted hover:text-brand-ink">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
