export type NavLink = {
  label: string
  href: string
  description?: string
}

export type NavColumn = {
  title: string
  description?: string
  links: NavLink[]
}

export type NavBanner = {
  image?: string
  title: string
  subtitle?: string
  cta?: { label: string; href: string }
}

export type NavSection = {
  id: 'discover' | 'shop' | 'custom' | 'journal' | 'support'
  label: string
  description?: string
  columns: NavColumn[]
  banner?: NavBanner
}

export const megaNavSections: NavSection[] = [
  {
    id: 'discover',
    label: 'Discover',
    description: 'The studio, the process, and the impact.',
    columns: [
      {
        title: 'The Studio',
        links: [
          { label: 'Our Story', href: '/discover/about#story', description: 'Origins and philosophy' },
          { label: 'The Team', href: '/discover/about#team', description: 'Designers & gemologists' },
          { label: 'Press', href: '/discover/about#press', description: 'As seen in Vogue & Elle' },
        ],
      },
      {
        title: 'Impact',
        links: [
          { label: 'Materials', href: '/discover/impact#materials', description: '100% recycled metals' },
          { label: 'Carbon Footprint', href: '/discover/impact#footprint', description: 'Climate neutral since day one' },
          { label: 'Partnerships', href: '/discover/impact#partners', description: 'Ethical supply chain' },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'Creators', href: '/creators', description: 'Join the collective' },
          { label: 'Apply', href: '/creators#apply', description: 'Become an ambassador' },
        ],
      },
    ],
    banner: {
      image: '/hero_banner.png',
      title: 'Behind the Design',
      subtitle: 'Where precision meets organic beauty.',
      cta: { label: 'Explore the Studio', href: '/discover' },
    },
  },
  {
    id: 'shop',
    label: 'Shop',
    description: 'Curated capsules for your collection.',
    columns: [
      {
        title: 'Collections',
        links: [
          { label: 'New Arrivals', href: '/collections?sort=new' },
          { label: 'Best Sellers', href: '/collections?sort=featured' },
          { label: 'Restocked', href: '/collections?tag=back-in-stock' },
        ],
      },
      {
        title: 'Rings',
        links: [
          { label: 'Engagement', href: '/collections?category=engagement-rings' },
          { label: 'Stacking Sets', href: '/collections?category=stacking-rings' },
          { label: 'Statement Pieces', href: '/collections?category=statement-rings' },
        ],
      },
      {
        title: 'Necklaces',
        links: [
          { label: 'All Necklaces', href: '/collections?category=necklaces' },
          { label: 'Pendants', href: '/collections?category=pendants' },
          { label: 'Chains', href: '/collections?category=chains' },
        ],
      },
      {
        title: 'Earrings',
        links: [
          { label: 'All Earrings', href: '/collections?category=earrings' },
          { label: 'Studs', href: '/collections?category=studs' },
          { label: 'Hoops & Drops', href: '/collections?category=hoops' },
        ],
      },
    ],
    banner: {
      image: '/hero_fallback.jpg',
      title: 'The Holiday Edit',
      subtitle: 'Light-catching pieces for the season.',
      cta: { label: 'Shop the Edit', href: '/collections' },
    },
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Design a piece that is uniquely yours.',
    columns: [
      {
        title: 'Create',
        links: [
          { label: 'Launch Studio', href: '/customizer', description: 'Start from scratch in 3D' },
          { label: 'Customize a Base', href: '/custom#preset-bases', description: 'Modify an existing design' },
        ],
      },
      {
        title: 'Process',
        links: [
          { label: 'How it Works', href: '/custom#workflow', description: 'From sketch to shipment' },
          { label: 'Virtual Try-On', href: '/custom#ar', description: 'See it on your hand' },
          { label: 'Gem Guide', href: '/discover/impact#materials', description: 'Clarity, cut, and color' },
        ],
      },
      {
        title: 'Guidance',
        links: [
          { label: 'Concierge', href: '/support', description: 'Expert design advice' },
          { label: 'Book Consultation', href: 'https://cal.com/glowglitch/support', description: 'Video call with a jeweler' },
        ],
      },
    ],
    banner: {
      image: '/3Dpreview-image.png',
      title: 'Your Vision, Realized',
      subtitle: 'Complete creative control in our 3D studio.',
      cta: { label: 'Start Designing', href: '/custom' },
    },
  },
  {
    id: 'journal',
    label: 'Journal',
    description: 'Notes on style, culture, and craft.',
    columns: [
      {
        title: 'Read',
        links: [
          { label: 'Style Notes', href: '/journal/trends/style-notes-linear-layers' },
          { label: 'Trend Radar', href: '/journal/trends/trend-radar-neon-elevation' },
          { label: 'Lab Reports', href: '/journal/tech-and-materials/lab-insights-spectrum-clarity' },
        ],
      },
      {
        title: 'Guides',
        links: [
          { label: 'Layering 101', href: '/journal/styling/layering-field-guide' },
          { label: 'Gift Guide', href: '/journal/styling/gift-guides-lunar-celebrations' },
          { label: 'Care & Keeping', href: '/support/help' },
        ],
      },
      {
        title: 'Spotlights',
        links: [
          { label: 'Featured Creators', href: '/journal/creators/spotlight-tonal-drop' },
          { label: 'Capsule Drops', href: '/journal/creators/capsule-drop-prism-night' },
        ],
      },
    ],
    banner: {
      image: '/hero_banner.png',
      title: 'Linear Layers',
      subtitle: 'Mastering the art of the stack.',
      cta: { label: 'Read the Story', href: '/journal/trends/style-notes-linear-layers' },
    },
  },
  {
    id: 'support',
    label: 'Support',
    description: 'We are here to help.',
    columns: [
      {
        title: 'Assistance',
        links: [
          { label: 'Help Center', href: '/support', description: 'Search our FAQs' },
          { label: 'Order Status', href: '/cart' },
          { label: 'Returns', href: '/account' },
        ],
      },
      {
        title: 'Contact',
        links: [
          { label: 'Email Us', href: 'mailto:concierge@glowglitch.com' },
          { label: 'Live Chat', href: '/support' },
        ],
      },
    ],
    banner: {
      image: '/hero_fallback.jpg',
      title: 'Client Services',
      subtitle: 'Concierge available Mon-Fri, 9am-7pm.',
      cta: { label: 'Contact Us', href: 'mailto:concierge@glowglitch.com' },
    },
  },
]
