import type { CustomHubContent } from '@/components/page-templates/CustomHubPage'

export const customHubContent: CustomHubContent = {
  hero: {
    eyebrow: 'Aurora Custom Studio',
    heading: 'Your vision. Our studio.',
    body: 'Enter the Aurora workspace. Select a base, refine your materials, and collaborate with our concierge team to bring your unique design to life.',
    primaryCta: { label: 'Start Designing', href: '/customizer' },
    secondaryCta: { label: 'View Presets', href: '#preset-bases' },
    highlight: undefined,
  },
  modules: [
    {
      type: 'timeline',
      eyebrow: 'The Flow',
      items: [
        {
          eyebrow: 'Step 01',
          title: 'Select a Base',
          body: 'Begin with a curated canvas—rings, necklaces, or earrings—ready for your touch.',
        },
        {
          eyebrow: 'Step 02',
          title: 'Refine Details',
          body: 'Swap metals, choose stones, and adjust settings in real-time with studio-grade lighting.',
        },
        {
          eyebrow: 'Step 03',
          title: 'Consult & Create',
          body: 'Share your design with our concierge for fit checks and final approval before crafting begins.',
        },
      ],
    },
  ],
  launchCta: {
    heading: 'Enter the Studio',
    body: 'Begin your session now, or schedule a walkthrough with a specialist.',
    primary: { label: 'Launch Studio', href: '/customizer' },
    secondary: { label: 'Book Consultation', href: 'mailto:concierge@glowglitch.com' },
  },
  presetBases: [
    {
      title: 'Layering Trios',
      description: 'Calibrated chains designed to sit perfectly together. Customize each layer.',
      href: '/collections?tag=customizer-ready',
    },
    {
      title: 'Stacking Rings',
      description: 'Minimalist bands with shared prong settings. Perfect for daily wear.',
    },
    {
      title: 'Earscapes',
      description: 'Curated sets of studs and hoops, balanced for multiple piercings.',
    },
  ],
  workflow: {
    title: 'Studio Process',
    steps: [
      { title: 'Select Base', body: 'Choose from our architectural presets.' },
      { title: 'Customize', body: 'Experiment with recycled metals and lab-grown stones.' },
      { title: 'Review', body: 'Submit for concierge review and AR try-on.' },
    ],
  },
  arOverview: {
    title: 'Virtual Preview',
    body: 'See your design in your space before you commit.',
    bullets: [
      'Instant AR on iOS/Android.',
      'Studio-grade lighting environments.',
      'Shareable links for feedback.',
    ],
  },
  concierge: {
    title: 'Expert Guidance',
    body: 'Our team is here to refine your design and ensure the perfect fit.',
    ctas: [
      { label: 'Email Us', href: 'mailto:concierge@glowglitch.com' },
      { label: 'Book Video Call', href: 'https://cal.com/glowglitch/support' },
    ],
  },
  viewer: undefined,
}
