import dynamic from 'next/dynamic'

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Typography,
} from '@/components/ui'
import { StackedGradientHeading } from '@/components/ui/StackedGradientHeading'
import type { HeroSectionData } from './types'
import type { CustomizerPreviewProps } from './CustomizerPreview'

const CustomizerPreview = dynamic<CustomizerPreviewProps>(
  () => import('./CustomizerPreview'),
  { ssr: false },
)

export function HeroSection({
  layout,
  badge,
  headline,
  subheadline,
  stats,
  primaryCtaLabel,
  secondaryCtaLabel,
  preview,
}: HeroSectionData) {
  const [topLine, bottomLine = ''] = headline.split('|')
  const isWithPreview = layout === 'withPreview' && Boolean(preview)

  const containerClass = isWithPreview
    ? 'container grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'
    : 'container mx-auto max-w-5xl'

  const contentWrapperClass = isWithPreview
    ? 'space-y-10 text-center lg:text-left'
    : 'mx-auto max-w-4xl space-y-12 text-center'
  const contentAlign: 'start' | 'center' = isWithPreview ? 'start' : 'center'

  const ctaWrapperClass = isWithPreview
    ? 'flex flex-wrap items-center justify-center gap-4 lg:justify-start'
    : 'mx-auto flex w-full flex-wrap items-center justify-center gap-4'

  const statsWrapperClass = isWithPreview
    ? 'grid gap-4 sm:grid-cols-3 text-left'
    : 'mx-auto grid max-w-4xl gap-6 text-center sm:grid-cols-3'

  return (
    <section data-testid="hero-section" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow opacity-70" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-20 radial-volt-orbit"
        aria-hidden
      />

      <div className={containerClass}>
        <div className={contentWrapperClass}>
          <Typography variant="eyebrow" align={contentAlign} className="text-digital-blue">
            {badge}
          </Typography>
          <div className={isWithPreview ? '' : 'mx-auto max-w-4xl'}>
            <StackedGradientHeading top={topLine} bottom={bottomLine} align={isWithPreview ? 'left' : 'center'} />
          </div>
          <Typography
            variant="body-lg"
            tone="muted"
            align={contentAlign}
            className={isWithPreview ? 'text-void-300' : 'mx-auto max-w-3xl text-void-300'}
          >
            {subheadline}
          </Typography>
          <div className={ctaWrapperClass}>
            <Button
              variant="primary"
              glow="volt"
              tone="volt"
              size="lg"
              className="px-10 text-lg font-semibold hover:scale-[1.03]"
            >
              {primaryCtaLabel}
            </Button>
            <Button
              variant="glass"
              size="lg"
              glow="none"
              className="px-10 text-lg font-semibold text-void-50"
            >
              {secondaryCtaLabel}
            </Button>
          </div>
          <dl className={statsWrapperClass}>
            {stats.map((stat) => (
              <Card
                key={stat.label}
                variant="glass"
                interactive={false}
                className={isWithPreview ? 'p-4' : 'p-4 text-center'}
              >
                <CardHeader className={isWithPreview ? 'p-0' : 'p-0 text-center'}>
                  <Typography
                    variant="body"
                    tone="muted"
                    align={isWithPreview ? 'start' : 'center'}
                    className="text-sm font-semibold text-void-200"
                  >
                    {stat.label}
                  </Typography>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  {stat.value && (
                    <Typography variant="title" tone="primary" align={isWithPreview ? 'start' : 'center'}>
                      {stat.value}
                    </Typography>
                  )}
                  <Typography
                    variant="small"
                    tone="muted"
                    align={isWithPreview ? 'start' : 'center'}
                    className="mt-1 normal-case tracking-normal"
                  >
                    {stat.detail}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </dl>
        </div>

        {isWithPreview && preview && (
          <Card variant="glass" glow="digital" className="flex h-full flex-col overflow-hidden border border-white/10">
            <CardHeader className="flex items-center justify-between p-6">
              <div>
                <Typography variant="small" tone="muted">
                  Live preview
                </Typography>
                <Typography variant="heading">Astral Prism Ring</Typography>
              </div>
              <div className="flex items-center gap-3 text-void-200">
                {preview.icons.map((Icon, index) => (
                  <Icon key={index} className="h-5 w-5" aria-hidden />
                ))}
              </div>
            </CardHeader>
            <CardContent className="relative flex-1 overflow-hidden p-0">
              <div className="absolute inset-0 bg-hero-preview-overlay" aria-hidden />
              <CustomizerPreview
                src={preview.modelSrc}
                uncompressedSrc={preview.uncompressedSrc}
                initialSrc={preview.initialSrc}
                initialReveal={preview.initialReveal}
                initialLoading={preview.initialLoading}
                isE2E={preview.isE2E}
                posterSrc={preview.posterSrc}
                fallbackSrc={preview.imageSrc}
                alt={preview.imageAlt}
                environmentImage={preview.environmentImage}
                arTitle={preview.arTitle}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-3 p-6">
              <div className="flex w-full flex-wrap gap-3">
                <Button size="sm" variant="glass">
                  Volt alloy · Active
                </Button>
                <Button size="sm" variant="outline" glow="none">
                  Switch gemstone
                </Button>
              </div>
              <Typography variant="small" tone="muted">
                Realtime render captured at 120fps · Powered by Neon Dream AssetCache
              </Typography>
            </CardFooter>
          </Card>
        )}
      </div>
    </section>
  )
}
