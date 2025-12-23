import type { MarketingPageContent } from '@/components/page-templates/MarketingPage'

export const discoverAboutContent: MarketingPageContent = {
  hero: {
    eyebrow: 'About GlowGlitch',
    heading: 'The studio shaping ethical, luminous jewelry',
    body:
      'We began with lab-grown stones, recycled metals, and a concierge who answers fast. Today, the same crew powers creator capsules, custom fittings, and Coral & Sky renders that feel alive.',
    primaryCta: { label: 'Meet the team', href: '#team' },
    secondaryCta: { label: 'Read our story', href: '#story' },
    image: {
      src: '/images/catalog/Sora/discover/discover_hero_studio_3x2_folio.webp',
      alt: 'Team members arranging jewelry pieces on a studio table.',
    },
  },
  modules: [
    {
      type: 'timeline',
      eyebrow: 'Story',
      items: [
        {
          eyebrow: 'Phase 01',
          title: 'Built on traceability',
          body: 'Lab-grown stones and recycled metals set our baseline so every piece starts clean and documented.',
        },
        {
          eyebrow: 'Phase 02',
          title: 'Concierge at the core',
          body: 'We made concierge the default: fittings, renders, and answers in under two hours on weekdays.',
        },
        {
          eyebrow: 'Phase 03',
          title: 'Creator capsules',
          body: 'Hundreds of creators launch with us, using our 3D customizer, preset lighting, and shared royalties.',
        },
      ],
    },
    {
      type: 'cardGrid',
      title: 'Team',
      cards: [
        { eyebrow: 'Design', title: 'Mara — Creative Lead', body: 'Guides capsule aesthetics and Coral & Sky lighting direction.' },
        { eyebrow: 'Ops', title: 'Dev — Supply & QA', body: 'Keeps recycled metals, lab QA, and traceability in lockstep.' },
        { eyebrow: 'Concierge', title: 'Rin — Client Care', body: 'Stewards every custom order with fast replies and fittings.' },
      ],
    },
    {
      type: 'richText',
      eyebrow: 'Press',
      title: 'Highlights & mentions',
      body: [
        'Coral & Sky Quarterly: “Traceability-first lab stones with concierge speed.”',
        'Retail Tech Week: “Top-tier 3D customization for jewelry, no plug-ins required.”',
        'Creator Commerce Daily: “Revenue sharing meets premium lighting and renders.”',
      ],
    },
  ],
}
