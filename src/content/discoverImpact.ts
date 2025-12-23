import type { MarketingPageContent } from '@/components/page-templates/MarketingPage'

export const discoverImpactContent: MarketingPageContent = {
  hero: {
    eyebrow: 'Ethics & Impact',
    heading: 'Proof-first materials, documented footprint, open partners',
    body:
      'Every capsule starts with lab-grown stones and recycled metals. We publish the footprint, energy mix, and partner audits so you know exactly what you’re wearing.',
    primaryCta: { label: 'Explore materials', href: '#materials' },
    secondaryCta: { label: 'See partners', href: '#partners' },
    image: {
      src: '/images/catalog/Sora/discover/discover_hero_studio_3x2_folio.webp',
      alt: 'Close-up of lab-grown stones and recycled metal samples.',
    },
  },
  modules: [
    {
      type: 'cardGrid',
      title: 'Materials',
      cards: [
        {
          eyebrow: 'Lab-grown stones',
          title: 'Traceable by design',
          body: 'Each stone includes growth-lab certificates, water recapture, and renewable energy stats you can verify.',
        },
        {
          eyebrow: 'Recycled metals',
          title: 'Closed-loop metals',
          body: 'Recycled gold and silver form every capsule base to avoid new mining and keep sourcing clean.',
        },
        {
          eyebrow: 'Finishes & QA',
          title: 'Tested to wear well',
          body: 'Finishes are QA’d for durability and nickel-safe wear before a piece enters production.',
        },
      ],
    },
    {
      type: 'stats',
      title: 'Footprint',
      stats: [
        { label: 'Water recapture', value: '95%' },
        { label: 'Renewable energy', value: '90%' },
        { label: 'Carbon-neutral runs', value: '100%' },
        { label: 'Traceable stones', value: '100%' },
      ],
    },
    {
      type: 'richText',
      eyebrow: 'Partners',
      title: 'Studios & sustainability allies',
      body: [
        'Growth labs: Renewable-powered labs with water recapture and carbon reporting published to customers.',
        'Metal suppliers: Closed-loop refiners providing recycled gold and silver with third-party audits.',
        'Logistics: Carbon-offset carriers with transparent routing and low-waste packaging standards.',
      ],
    },
    {
      type: 'faq',
      title: 'FAQ',
      items: [
        {
          question: 'Where can I see material credentials?',
          answer: 'Product pages link to lab-grown stone certificates and recycled metal audits for each capsule.',
        },
        {
          question: 'How do you measure footprint?',
          answer: 'We track water recapture, renewable energy mix, and carbon-neutral runs and publish quarterly updates in Journal.',
        },
        {
          question: 'Do partners change?',
          answer: 'Yes—partner updates and audits are announced in Journal Tech & Materials so sourcing stays transparent.',
        },
      ],
    },
  ],
}
