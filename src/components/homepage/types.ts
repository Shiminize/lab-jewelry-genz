import type { ComponentType, SVGProps } from 'react'

export type NeonIcon = ComponentType<SVGProps<SVGSVGElement>>

export type HeroStat = {
  label: string
  value: string
  detail: string
}

export type HeroPreview = {
  modelSrc: string
  uncompressedSrc?: string
  initialSrc?: string
  initialReveal?: 'auto' | 'interaction'
  initialLoading?: 'auto' | 'eager'
  isE2E?: boolean
  posterSrc: string
  imageSrc: string
  imageAlt: string
  environmentImage?: string
  arTitle?: string
  icons: ComponentType<{ className?: string }>[]
}

export type HeroLayout = 'withPreview' | 'simple'

type BaseHeroSection = {
  badge: string
  headline: string
  subheadline: string
  stats: HeroStat[]
  primaryCtaLabel: string
  secondaryCtaLabel: string
}

export type HeroSectionData =
  | (BaseHeroSection & { layout: 'simple'; preview?: HeroPreview })
  | (BaseHeroSection & { layout: 'withPreview'; preview: HeroPreview })

export type FeatureTile = {
  title: string
  description: string
  icon: NeonIcon
  glow: 'volt' | 'cyber' | 'holo' | 'digital' | 'acid'
}

export type CreatorMoment = {
  title: string
  caption: string
  bullets: string[]
  glow: 'volt' | 'cyber' | 'holo' | 'digital' | 'acid'
}

export type ClosingCallToAction = {
  headline: string
  description: string
  primaryLabel: string
  secondaryLabel: string
}

export type ShopCollectionFilter = {
  label: string
  isPrimary?: boolean
}

export type ShopCollectionSectionData = {
  heading: string
  description: string
  filters: ShopCollectionFilter[]
  ctaLabel: string
}

export type ShopCollectionProductCard = {
  id: string
  name: string
  href: string
  price: string
  imageSrc: string
  imageAlt: string
  glow: 'volt' | 'cyber' | 'digital' | 'acid' | 'holo'
  meta?: string
  category?: string
}

export type DesignStudioHighlight = {
  title: string
  description: string
  icon: NeonIcon
  glow: 'volt' | 'cyber' | 'digital' | 'acid' | 'holo'
}

export type DesignStudioToolbarAction = {
  label: string
  icon: NeonIcon
}

export type DesignStudioControlItem = {
  label: string
  helper?: string
  price?: string
  active?: boolean
}

export type DesignStudioControlGroup = {
  title: string
  layout: 'grid' | 'list'
  items: DesignStudioControlItem[]
  span?: 'full'
}

export type DesignStudioViewer = HeroPreview & {
  title: string
  subtitle: string
  footnote: string
  primaryOptionLabel: string
  secondaryOptionLabel: string
}

export type DesignStudioSectionData = {
  eyebrow: string
  heading: string
  description: string
  highlights: DesignStudioHighlight[]
  toolbar: DesignStudioToolbarAction[]
  viewerBadge: { label: string; helper: string }
  viewer: DesignStudioViewer
  controlGroups: DesignStudioControlGroup[]
}

export type FaqItem = {
  question: string
  answer: string
}

export type SupportQuickAction = {
  title: string
  description: string
  icon: 'message-square' | 'mail' | 'phone' | 'book-open'
  accent: 'volt' | 'cyber' | 'digital' | 'acid'
  ctaLabel: string
  href?: string
}

export type SupportSectionData = {
  eyebrow: string
  heading: string
  description: string
  quickActions: SupportQuickAction[]
  faq: {
    title: string
    items: FaqItem[]
  }
  form: {
    heading: string
    description: string
    nameLabel: string
    emailLabel: string
    messageLabel: string
    submitLabel: string
    successMessage: string
  }
}
