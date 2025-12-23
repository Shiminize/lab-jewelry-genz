import Link from 'next/link'
import { Card, CardHeader, CardContent, CardFooter, Button, Typography } from '@/components/ui'
import { getCartIdFromCookies } from '@/lib/cartSession'
import { getCart, calculateCartTotals } from '@/services/neon'
import { Section, SectionContainer } from '@/components/layout/Section'

export default async function CheckoutPage() {
  const existingCartId = getCartIdFromCookies()

  const cart = existingCartId
    ? await getCart(existingCartId)
    : {
      cartId: '',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  const totals = calculateCartTotals(cart)

  return (
    <div className="space-y-0">
      <Section spacing="compact" variant="surface">
        <SectionContainer className="max-w-4xl space-y-6">
          <Typography variant="eyebrow">Neon checkout</Typography>
          <Typography variant="heading">Secure your GlowGlitch capsule</Typography>
          <Typography variant="body">
            Our sales concierge will finalize payment and delivery details with you directly. Review your order summary below and share your preferred contact method to lock in production.
          </Typography>
        </SectionContainer>
      </Section>

      <Section spacing="compact" variant="transparent">
        <SectionContainer className="grid gap-8 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
          <Card className="glass-surface">
            <CardHeader>
              <Typography variant="title">How checkout works today</Typography>
            </CardHeader>
            <CardContent className="space-y-4">
              <Typography as="p" variant="body" className="text-text-secondary">
                • Share your preferred contact details and we&apos;ll send a secure invoice (Stripe or bank transfer) tailored to your region.
              </Typography>
              <Typography as="p" variant="body" className="text-text-secondary">
                • Once payment clears, your piece enters production. Expect a hand-finished turnaround of roughly two weeks plus shipping time.
              </Typography>
              <Typography as="p" variant="body" className="text-text-secondary">
                • We&apos;ll email tracking info, certification docs, and post-purchase care guidance as soon as the capsule ships.
              </Typography>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 md:flex-row">
              <Button
                tone="coral"
                variant="accent"
                className="flex-1 justify-center"
                href="mailto:concierge@glowglitch.com?subject=GlowGlitch%20Capsule%20Order"
              >
                Email concierge
              </Button>
              <Button
                tone="sky"
                variant="outline"
                className="flex-1 justify-center"
                href="https://cal.com/glowglitch/checkout"
              >
                Schedule a call
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass-surface h-fit">
            <CardHeader>
              <Typography variant="title">Order summary</Typography>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{totals.itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="border border-border-subtle bg-surface-panel px-4 py-3 text-xs text-text-muted">
                Taxes, shipping, and optional insurance are calculated with your concierge so we can honor regional pricing and creator commissions.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Link href="/cart" className="text-sm font-semibold uppercase tracking-[0.16em] text-text-secondary hover:text-text-primary">
                Review cart →
              </Link>
            </CardFooter>
          </Card>
        </SectionContainer>
      </Section>
    </div>
  )
}
