import type { MarketingPageContent } from '@/components/page-templates/MarketingPage'

export const discoverPageContent: MarketingPageContent = {
  hero: {
    eyebrow: 'GlowGlitch Studio',
    heading: 'Ethical luxury, shaped by you.',
    body:
      'Welcome to the Lumina Lab. Here, precision meets organic beauty. From carbon-neutral stones to our concierge service, every detail is designed to give you complete creative control.',
    image: {
      src: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/earrings/discover_hero_studio_3x2_folio.webp',
      alt: 'Minimalist studio workspace featuring jewelry tools and raw stones.',
    },
    primaryCta: { label: 'Our Story', href: '#creator-atlas' },
    secondaryCta: { label: 'View Collection', href: '/collections' },
    highlight: {
      eyebrow: 'Concierge',
      title: 'Here for you',
      body: 'Our studio team reviews renders, fittings, and provides personal guidance Monday–Friday.',
      cta: { label: 'Email Us', href: 'mailto:concierge@glowglitch.com' },
    },
  },
  modules: [
    {
      type: 'timeline',
      eyebrow: 'The Journey',
      items: [
        {
          eyebrow: '01',
          title: 'The Spark',
          body: 'We started with a simple idea: recycled metals and lab-grown stones, sourced responsibly.',
        },
        {
          eyebrow: '02',
          title: 'The Collective',
          body: 'A community of 500+ creators, bringing their unique visions to life with our support.',
        },
        {
          eyebrow: '03',
          title: 'The Aurora Hub',
          body: 'Real-time 3D customization and AR try-on, giving you the power to design from anywhere.',
        },
      ],
    },
    {
      type: 'stats',
      title: 'Our Impact',
      stats: [
        { label: 'Active Creators', value: '320+' },
        { label: 'Response Time', value: '< 2 hrs' },
        { label: 'Custom Pieces', value: '12K+' },
        { label: 'Carbon Neutral', value: '100%' },
      ],
    },
    {
      type: 'splitPanels',
      panels: [
        {
          eyebrow: 'Ethics',
          title: 'Conscious Creation',
          body: 'True luxury helps the planet. We use traceable lab stones, recycled gold, and renewable energy in our growth labs.',
          bullets: ['Traceable lab-grown stones', '100% Recycled Gold & Silver', 'Zero-waste water systems'],
        },
        {
          eyebrow: 'Community',
          title: 'Join the Program',
          body: 'Earn commissions, get exclusive access to concierge pods, and launch your own capsule collections.',
          cta: { label: 'Apply Now', href: '/creators#apply' },
        },
      ],
    },
    {
      type: 'faq',
      title: 'Questions?',
      items: [
        {
          question: 'How does the customizer work?',
          answer: 'Visit /custom to see the workflow, or launch the studio directly at /customizer for live editing.',
        },
        {
          question: 'Are your materials sustainable?',
          answer: 'Absolutely. View our full impact report on the Journal.',
        },
        {
          question: 'Can I get help with my design?',
          answer: 'Yes. Our concierge team is available via email or video call to assist with fittings and renders.',
        },
      ],
    },
  ],
}
