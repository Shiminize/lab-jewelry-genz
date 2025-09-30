import { Camera, Layers, Link2, Palette, RefreshCw, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react'

import type {
  ClosingCallToAction,
  CreatorMoment,
  FeatureTile,
  HeroSectionData,
  DesignStudioSectionData,
  ShopCollectionSectionData,
  SupportSectionData,
} from '@/components/homepage/types'

type HomepageContent = {
  hero: HeroSectionData
  designStudio: DesignStudioSectionData
  shopCollection: ShopCollectionSectionData
  experience: { eyebrow: string; heading: string; subheading: string; features: FeatureTile[] }
  workflow: { eyebrow: string; heading: string; description: string; moments: CreatorMoment[] }
  support: SupportSectionData
  closing: ClosingCallToAction
}

const HERO_PREVIEW = {
  modelSrc: '/models/ring_web.glb',
  uncompressedSrc: '/models/ring_fallback.glb',
  posterSrc: '/images/3d/ring_poster.jpg',
  imageSrc: '/images/3d/ring_poster.jpg',
  imageAlt: 'Astral Prism Ring rendered from the Neon Dream 3D studio',
  arTitle: 'Preview the Astral Prism Ring in augmented reality',
  environmentImage: undefined,
  icons: [Palette, Sparkles, ShieldCheck],
}

export const HOMEPAGE: HomepageContent = {
  hero: {
    layout: 'simple',
    badge: 'NEON DREAM STUDIO',
    headline: 'DESIGN YOUR|FUTURE GEMS',
    subheadline:
      'Lab-grown diamonds and moissanite. Sustainable luxury. Unmatched customization. This is jewelry for the digital generation.',
    stats: [
      {
        label: 'Live Refresh',
        value: '73ms',
        detail: 'Average material swap latency',
      },
      {
        label: 'Creator Drops',
        value: '18K+',
        detail: 'Unique rings launched this quarter',
      },
      {
        label: 'Conversion Lift',
        value: '4.8x',
        detail: 'Versus static product pages',
      },
    ],
    primaryCtaLabel: 'Start Creating',
    secondaryCtaLabel: 'Watch Demo',
  },
  designStudio: {
    eyebrow: '3D DESIGN STUDIO',
    heading: 'Launch photoreal previews without leaving the browser.',
    description:
      'Swap gemstones, capture AR try-ons, and export campaign-ready shots in real time. Every change reflects instantly across channels.',
    highlights: [
      {
        title: 'Realtime render pipeline',
        description: 'GLB variants stream instantly with mesh compression and lossless lighting.',
        icon: Sparkles,
        glow: 'digital',
      },
      {
        title: 'Creator-ready exports',
        description: 'Generate social-ready clips and AR links for collaborators in one step.',
        icon: ShieldCheck,
        glow: 'volt',
      },
    ],
    toolbar: [
      { label: 'Reset view', icon: RefreshCw },
      { label: 'Inspect', icon: Search },
      { label: 'Capture', icon: Camera },
    ],
    viewerBadge: {
      label: '360° View',
      helper: 'Drag to rotate',
    },
    viewer: {
      ...HERO_PREVIEW,
      title: 'Astral Prism Ring',
      subtitle: 'Volt alloy · Active',
      primaryOptionLabel: 'Volt alloy · Active',
      secondaryOptionLabel: 'Switch gemstone',
      footnote: 'Realtime render captured at 120fps · Powered by Neon Dream AssetCache',
    },
    controlGroups: [
      {
        title: 'Choose style',
        layout: 'grid',
        items: [
          { label: 'Solitaire', active: true },
          { label: 'Halo' },
          { label: 'Three Stone' },
          { label: 'Vintage' },
        ],
      },
      {
        title: 'Select metal',
        layout: 'list',
        items: [
          { label: 'Sterling Silver', price: '$399' },
          { label: '14k Gold', price: '$1,199', active: true },
          { label: 'Platinum', price: '$1,599', helper: 'Ships in 7 days' },
        ],
      },
      {
        title: 'Stone settings',
        layout: 'list',
        span: 'full',
        items: [
          { label: '1.5ct lab diamond', helper: 'VVS1 clarity' },
          { label: 'Neon moissanite', helper: 'Iridescent cut' },
        ],
      },
    ],
  },
  shopCollection: {
    heading: 'Shop Collection',
    description: 'Every piece is engineered for realtime customization, adaptive pricing, and AR-ready storytelling.',
    filters: [
      { label: 'All', isPrimary: true },
      { label: 'Rings' },
      { label: 'Necklaces' },
      { label: 'Earrings' },
      { label: 'Bracelets' },
    ],
    ctaLabel: 'Customize',
  },
  experience: {
    eyebrow: 'CREATOR EXPERIENCE',
    heading: 'Build jewelry people actually want to wear.',
    subheading:
      'Live customizers, photoreal previews, and checkout flows tuned for creator-led drops. Every touchpoint keeps shoppers in the glow.',
    features: [
      {
        title: 'Live Configurator',
        description: 'Realtime 3D with AR try-on baked in.',
        icon: Zap,
        glow: 'volt',
      },
      {
        title: 'AssetCache',
        description: 'Prebaked variants stream from the edge CDN.',
        icon: Layers,
        glow: 'digital',
      },
      {
        title: 'Commerce Hooks',
        description: 'Drops, waitlists, and UTM funnels that convert.',
        icon: Link2,
        glow: 'cyber',
      },
    ],
  },
  workflow: {
    eyebrow: 'CREATOR WORKFLOW',
    heading: 'Built with the creators who define the next wave of luxury.',
    description:
      'Empower your collective with zero-friction drops, analytics that read like a group chat, and pipelines tuned for bespoke production.',
    moments: [
      {
        title: 'Campaign Command Center',
        caption: 'Schedule drops, monitor revenue, and ship ready-to-post kits in one dashboard.',
        bullets: ['Stripe Connect payouts', 'Affiliate + creator funnels', 'Realtime campaign heatmaps'],
        glow: 'digital',
      },
      {
        title: 'Boutique QA Pipeline',
        caption: 'Every design clears clarity, metal tolerance, and gemstone safety checks before production.',
        bullets: ['AI gemstone inspection', 'Configurable production gates', 'PDF-ready atelier specs'],
        glow: 'acid',
      },
    ],
  },
  support: {
    eyebrow: 'SUPPORT GUILD',
    heading: 'How can we help?',
    description:
      'Reach our specialists instantly, browse top answers, or drop the guild a note—everything routes through the Neon Dream help desk.',
    quickActions: [
      {
        title: 'Live Chat',
        description: 'Chat with a strategist in under two minutes.',
        icon: 'message-square',
        accent: 'volt',
        ctaLabel: 'Start chat',
      },
      {
        title: 'Email Support',
        description: 'Detailed replies within one business hour.',
        icon: 'mail',
        accent: 'digital',
        ctaLabel: 'Send email',
      },
      {
        title: 'Call Us',
        description: 'Mon–Fri, 9AM–6PM EST for production escalations.',
        icon: 'phone',
        accent: 'cyber',
        ctaLabel: 'Schedule call',
      },
      {
        title: 'Help Center',
        description: 'Playbooks, API docs, and launch checklists.',
        icon: 'book-open',
        accent: 'acid',
        ctaLabel: 'Browse docs',
      },
    ],
    faq: {
      title: 'Top questions',
      items: [
        {
          question: 'How long does it take to spin up a customizer?',
          answer:
            'Most teams launch within 7 business days. We handle asset optimization, CDN wiring, and storefront integration while your creators polish the drop narrative.',
        },
        {
          question: 'Can we import our existing 3D models?',
          answer:
            'Absolutely. Upload GLB or USDZ files and we will run them through our compression and lighting pipeline so they glow like native Neon Dream assets.',
        },
        {
          question: 'What platforms does the AR experience support?',
          answer:
            'We ship WebXR experiences for modern browsers and Quick Look + Scene Viewer links for iOS and Android shoppers. No app install required.',
        },
      ],
    },
    form: {
      heading: 'Need a deeper dive?',
      description: 'Tell us what you’re building and we’ll follow up with tailored docs and a walkthrough invite.',
      nameLabel: 'Full name',
      emailLabel: 'Work email',
      messageLabel: 'How can we help?',
      submitLabel: 'Request follow-up',
      successMessage: 'Thanks for reaching out—expect a Neon Dream strategist in your inbox shortly.',
    },
  },
  closing: {
    headline: 'Ready to light up your storefront?',
    description: 'Book a Neon Dream lab session and prototype a custom journey in under 48 hours.',
    primaryLabel: 'Book a Lab Sprint',
    secondaryLabel: 'Download system spec',
  },
}

export type HomepageContentKeys = keyof typeof HOMEPAGE
