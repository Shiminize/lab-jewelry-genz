import dynamic from 'next/dynamic'

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Typography,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { CustomizerPreviewProps } from './CustomizerPreview'
import type { DesignStudioSectionData } from './types'

const CustomizerPreview = dynamic<CustomizerPreviewProps>(
  () => import('./CustomizerPreview'),
  { ssr: false },
)

export function DesignStudioSection({
  eyebrow,
  heading,
  description,
  highlights,
  toolbar,
  viewerBadge,
  viewer,
  controlGroups,
}: DesignStudioSectionData) {
  const accentMap = {
    volt: 'bg-gradient-volt text-void-950 shadow-neon-volt',
    cyber: 'bg-gradient-cyber text-void-950 shadow-neon-cyber',
    digital: 'bg-gradient-digital text-void-950 shadow-neon-digital',
    holo: 'bg-gradient-holo animate-gradient-shift text-void-950 shadow-neon-holo',
    acid: 'bg-gradient-acid text-void-950 shadow-neon-acid',
  } as const

  return (
    <section data-testid="design-studio-section" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(80,255,173,0.12),_transparent_65%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-design-studio-shell" aria-hidden />
      <div className="container grid gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-10">
          <div className="space-y-4">
            <Typography variant="eyebrow">{eyebrow}</Typography>
            <Typography variant="headline">{heading}</Typography>
            <Typography variant="body-lg" tone="muted">
              {description}
            </Typography>
          </div>
          <ul className="space-y-4">
            {highlights.map((highlight) => {
              const accent = accentMap[highlight.glow]
              return (
                <li key={highlight.title} className="flex gap-4 rounded-ultra border border-white/10 bg-void-900/60 p-5">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-pill text-xl', accent)}>
                    <highlight.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="space-y-1 text-left">
                    <Typography variant="title" className="text-void-50">
                      {highlight.title}
                    </Typography>
                    <Typography variant="body" tone="muted">
                      {highlight.description}
                    </Typography>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="space-y-6">
          <Card variant="glass" glow="digital" className="relative overflow-hidden border border-white/10">
            <CardHeader className="flex items-center justify-between gap-4 p-6">
              <div className="space-y-1">
                <Typography variant="small" tone="muted">
                  {viewer.subtitle}
                </Typography>
                <Typography variant="heading">{viewer.title}</Typography>
              </div>
              <div className="flex items-center gap-3 text-void-200">
                {toolbar.map((action) => (
                  <Button
                    key={action.label}
                    size="icon"
                    variant="ghost"
                    glow="none"
                    aria-label={action.label}
                    className="h-10 w-10 rounded-pill border border-white/10 bg-white/5"
                  >
                    <action.icon className="h-5 w-5" aria-hidden />
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="relative overflow-hidden p-0">
              <div className="absolute inset-0 bg-design-studio-panel" aria-hidden />
              <CustomizerPreview
                src={viewer.modelSrc}
                uncompressedSrc={viewer.uncompressedSrc}
                initialSrc={viewer.initialSrc}
                initialReveal={viewer.initialReveal}
                initialLoading={viewer.initialLoading}
                isE2E={viewer.isE2E}
                posterSrc={viewer.posterSrc}
                fallbackSrc={viewer.imageSrc}
                alt={viewer.imageAlt}
                environmentImage={viewer.environmentImage}
                arTitle={viewer.arTitle}
              />
              <div className="absolute inset-x-6 bottom-6">
                <div className="flex items-center justify-between rounded-pill border border-white/10 bg-void-900/70 px-4 py-2 text-sm text-void-200">
                  <span>{viewerBadge.label}</span>
                  <span className="text-void-400">{viewerBadge.helper}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-3 p-6">
              <div className="flex w-full flex-wrap gap-3">
                <Button size="sm" variant="glass">
                  {viewer.primaryOptionLabel}
                </Button>
                <Button size="sm" variant="outline" glow="none">
                  {viewer.secondaryOptionLabel}
                </Button>
              </div>
              <Typography variant="small" tone="muted">
                {viewer.footnote}
              </Typography>
            </CardFooter>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            {controlGroups.map((group) => (
              <Card
                key={group.title}
                variant="glass"
                className={cn('border border-white/10', group.span === 'full' ? 'lg:col-span-2' : '')}
              >
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-base text-void-50">{group.title}</CardTitle>
                </CardHeader>
                <CardContent className={cn('p-6 pt-0', group.layout === 'list' && 'space-y-3')}>
                  {group.layout === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3">
                      {group.items.map((item) => (
                        <Button
                          key={item.label}
                          variant={item.active ? 'primary' : 'ghost'}
                          glow={item.active ? 'volt' : 'none'}
                          size="sm"
                          className={cn(
                            'justify-start rounded-round text-sm',
                            item.active ? 'text-void-950' : 'border border-white/10 bg-white/5 text-void-200 hover:text-volt-glow',
                          )}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <div
                            className={cn(
                              'flex items-center justify-between rounded-pill border border-white/10 px-4 py-3 transition-colors',
                              item.active
                                ? 'bg-gradient-to-r from-volt-glow via-digital-blue/80 to-cyber-pink/70 text-void-950'
                                : 'bg-void-900/50 text-void-100',
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{item.label}</span>
                              {item.helper && (
                                <span className="text-xs text-void-300">{item.helper}</span>
                              )}
                            </div>
                            {item.price && (
                              <span className={cn('text-sm font-semibold', item.active ? 'text-void-950' : 'text-volt-glow')}>
                                {item.price}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DesignStudioSection
