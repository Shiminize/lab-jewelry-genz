import type { HelpPageContent } from '@/components/page-templates/HelpPage'

export const supportHelpContent: HelpPageContent = {
  hero: {
    eyebrow: 'Sizing & Care Guide',
    heading: 'Fit, upkeep, and concierge-ready references',
    body: 'Use these quick charts when you need necklace spacing, bracelet drape, or polishing cadence before looping in the care team.',
    primaryCta: { label: 'Request sizing help', href: 'mailto:concierge@glowglitch.com?subject=Sizing%20Consult' },
  },
  checklist: [
    { title: 'Necklace guide', description: 'Collar (14") through layering (22") in one chart.' },
    { title: 'Bracelet drape', description: 'Measure above the wrist bone, add 0.25–0.5".' },
    { title: 'Care cadence', description: 'Weekly wipe-down, monthly soak, studio refresh twice a year.' },
  ],
  faqs: [
    {
      question: 'How do I layer necklaces cleanly?',
      answer: 'Aim for 1.5–2" between lengths. Start with a 14" collar, add 16–18" everyday chains, finish with a 20–22" charm.',
    },
    {
      question: 'What if my ring needs a resize?',
      answer: 'You receive one complimentary resize within 60 days. Email the concierge and we’ll send an insured label plus timeline.',
    },
    {
      question: 'Which cleaners are safe?',
      answer: 'Stick with mild soap and water. Avoid harsh chemicals or ultrasonic cleaners unless handled by our studio team.',
    },
  ],
  contact: {
    title: 'Talk to the care team',
    body: 'Share photos or measurements and we’ll confirm fits, polishing tips, or next appointment dates.',
    ctas: [
      { label: 'Email care team', href: 'mailto:concierge@glowglitch.com' },
      { label: 'Book a care consult', href: 'https://cal.com/glowglitch/care', variant: 'secondary' },
    ],
  },
}
