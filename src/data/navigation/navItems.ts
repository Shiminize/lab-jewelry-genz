export const navItems = [
  {
    id: 'necklaces',
    label: 'Necklaces', 
    href: '/catalog?category=necklaces',
    hasDropdown: true,
    categories: [
      {
        title: 'Delicate Chains',
        href: '/catalog?category=necklaces&style=delicate',
        items: ['Thin Gold', 'Minimalist', 'Everyday', 'Layering']
      },
      {
        title: 'Statement Pendants',
        href: '/catalog?category=necklaces&style=pendants', 
        items: ['Diamond', 'Gemstone', 'Custom', 'Vintage']
      },
      {
        title: 'Chokers',
        href: '/catalog?category=necklaces&style=chokers',
        items: ['Modern', 'Classic', 'Beaded', 'Metal']
      },
      {
        title: 'Layering Sets',
        href: '/catalog?category=necklaces&style=layering',
        items: ['Two-Piece', 'Three-Piece', 'Mix & Match', 'Graduated']
      }
    ]
  },
  {
    id: 'earrings', 
    label: 'Earrings',
    href: '/catalog?category=earrings',
    hasDropdown: true,
    categories: [
      {
        title: 'Classic Studs',
        href: '/catalog?category=earrings&style=studs',
        items: ['Diamond', 'Pearl', 'Gemstone', 'Gold']
      },
      {
        title: 'Modern Hoops', 
        href: '/catalog?category=earrings&style=hoops',
        items: ['Small', 'Medium', 'Large', 'Textured']
      },
      {
        title: 'Elegant Drops',
        href: '/catalog?category=earrings&style=drops',
        items: ['Chandelier', 'Threader', 'Dangle', 'Linear']
      },
      {
        title: 'Climbers',
        href: '/catalog?category=earrings&style=climbers',
        items: ['Ear Crawlers', 'Curved', 'Geometric', 'Floral']
      }
    ]
  },
  {
    id: 'bracelets',
    label: 'Bracelets',
    href: '/catalog?category=bracelets', 
    hasDropdown: true,
    categories: [
      {
        title: 'Tennis Classic',
        href: '/catalog?category=bracelets&style=tennis',
        items: ['Diamond', '2-Carat', '5-Carat', 'Colored Stones']
      },
      {
        title: 'Delicate Chains',
        href: '/catalog?category=bracelets&style=chains',
        items: ['Thin Gold', 'Adjustable', 'Layered', 'Charm Ready']
      },
      {
        title: 'Bold Cuffs', 
        href: '/catalog?category=bracelets&style=cuffs',
        items: ['Wide Band', 'Textured', 'Geometric', 'Statement']
      },
      {
        title: 'Charm Collections',
        href: '/catalog?category=bracelets&style=charms',
        items: ['Starter Sets', 'Individual', 'Custom', 'Birthstone']
      }
    ]
  },
  {
    id: 'rings',
    label: 'Rings',
    href: '/catalog?category=rings',
    hasDropdown: true,
    categories: [
      {
        title: 'Engagement',
        href: '/catalog?category=rings&style=engagement', 
        items: ['Solitaire', 'Halo', 'Three-Stone', 'Vintage']
      },
      {
        title: 'Wedding Bands',
        href: '/catalog?category=rings&style=wedding',
        items: ['Classic', 'Pavé', 'Eternity', 'Matching Sets']
      },
      {
        title: 'Fashion Rings',
        href: '/catalog?category=rings&style=fashion',
        items: ['Cocktail', 'Geometric', 'Nature', 'Abstract']
      },
      {
        title: 'Stackable Sets',
        href: '/catalog?category=rings&style=stackable',
        items: ['Thin Bands', 'Mixed Metal', 'Textured', 'Complete Sets']
      }
    ]
  },
  { id: 'customize', label: 'Customize', href: '/customizer', highlight: true },
  { id: 'about', label: 'About', href: '/about' }
]