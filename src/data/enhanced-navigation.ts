import { MegaMenuContent } from '@/components/navigation/MegaMenu'

// Enhanced navigation data structure for PersonalGemstoneDNA redesign
export interface EnhancedNavigationItem {
  id: string
  label: string
  href: string
  icon: string // SVG string
  badge?: string
  megaMenuContent: MegaMenuContent
}

export const enhancedNavigationData: EnhancedNavigationItem[] = [
  {
    id: 'full-genome-scan',
    label: 'Find Your Match',
    href: '/genome-analysis',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 3C7.58 3 4 6.58 4 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>
      <path d="M12 7v10M8 12h8"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42"/>
    </svg>`,
    badge: '99.7%',
    megaMenuContent: {
      sections: [
        {
          title: "Advanced Genetic Analysis",
          links: [
            {
              name: "Genome Sequencing Dashboard",
              href: "/genome-sequencing",
              description: "Science-backed compatibility analysis (but make it fun)"
            },
            {
              name: "Molecular Diagnostics Lab",
              href: "/molecular-diagnostics", 
              description: "Advanced testing to find what actually works for you"
            },
            {
              name: "Precision Synthesis Lab",
              href: "/precision-synthesis",
              description: "Atomic-level customization and optimization"
            },
            {
              name: "Clinical Validation Center",
              href: "/clinical-validation",
              description: "Legit scientific validation (we're not making this up)"
            }
          ]
        },
        {
          title: "Hereditary Analysis",
          links: [
            {
              name: "Style DNA Mapping",
              href: "/hereditary-mapping",
              description: "4-generation family style analysis"
            },
            {
              name: "Genetic Compatibility Report",
              href: "/compatibility-report",
              description: "Detailed molecular affinity breakdown"
            },
            {
              name: "Rare Marker Detection",
              href: "/rare-markers",
              description: "Identify your unique genetic signatures"
            },
            {
              name: "Scientific Community",
              href: "/genetic-community",
              description: "Connect with similar DNA profiles"
            }
          ]
        }
      ],
      featuredProducts: [
        {
          id: "genetic-match-moissanite",
          name: "Genetically Matched Moissanite",
          image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center",
          href: "/products/genetic-match-moissanite",
          price: "From $1,899"
        },
        {
          id: "precision-silver-matrix",
          name: "Precision Silver Matrix",
          image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
          href: "/products/precision-silver-matrix",
          price: "From $899"
        }
      ],
      promotionalBanner: {
        title: "Genetic Elite Membership",
        description: "Join the exclusive 0.3% with verified rare genetic markers. Access premium genetic matching and scientific analysis.",
        href: "/genetic-elite-membership"
      }
    }
  },
  {
    id: 'moissanite',
    label: 'Moissanite',
    href: '/moissanite',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`,
    badge: 'Genetic Match',
    megaMenuContent: {
      sections: [
        {
          title: "By Cut & Shape",
          links: [
            {
              name: "Round Brilliant",
              href: "/moissanite/round",
              description: "Maximum brilliance and fire"
            },
            {
              name: "Princess Cut",
              href: "/moissanite/princess",
              description: "Modern square elegance"
            },
            {
              name: "Oval",
              href: "/moissanite/oval",
              description: "Elongated brilliance"
            },
            {
              name: "Emerald Cut",
              href: "/moissanite/emerald",
              description: "Sophisticated step cut"
            },
            {
              name: "Cushion Cut",
              href: "/moissanite/cushion",
              description: "Vintage-inspired pillow shape"
            }
          ]
        },
        {
          title: "By Setting Style",
          links: [
            {
              name: "Solitaire Settings",
              href: "/moissanite/solitaire",
              description: "Classic single stone elegance"
            },
            {
              name: "Halo Settings",
              href: "/moissanite/halo",
              description: "Enhanced brilliance with accent stones"
            },
            {
              name: "Three Stone",
              href: "/moissanite/three-stone",
              description: "Past, present, future symbolism"
            },
            {
              name: "Vintage Inspired",
              href: "/moissanite/vintage",
              description: "Timeless antique styling"
            },
            {
              name: "Modern Contemporary",
              href: "/moissanite/modern",
              description: "Clean lines and innovation"
            }
          ]
        }
      ],
      featuredProducts: [
        {
          id: "premium-moissanite-solitaire",
          name: "Premium Moissanite Solitaire",
          image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center",
          href: "/products/premium-moissanite-solitaire",
          price: "From $1,200"
        },
        {
          id: "moissanite-halo-ring",
          name: "Moissanite Halo Ring",
          image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
          href: "/products/moissanite-halo-ring",
          price: "From $1,800"
        }
      ],
      promotionalBanner: {
        title: "Why Moissanite Hits Different",
        description: "The science behind why moissanite might be your perfect match (spoiler: it's not just marketing).",
        href: "/moissanite-science"
      }
    }
  },
  {
    id: 'lab-diamonds',
    label: 'Lab Diamonds',
    href: '/lab-diamonds',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
      <path d="M11 3L8 9l4 13 4-13-3-6"/>
      <path d="M2 9h20"/>
    </svg>`,
    badge: 'Certified',
    megaMenuContent: {
      sections: [
        {
          title: "By Quality Grade",
          links: [
            {
              name: "Premium Grade (D-F, VVS)",
              href: "/lab-diamonds/premium",
              description: "Highest quality colorless diamonds"
            },
            {
              name: "Excellent Grade (G-H, VS)",
              href: "/lab-diamonds/excellent",
              description: "Near colorless with excellent value"
            },
            {
              name: "Good Grade (I-J, SI)",
              href: "/lab-diamonds/good",
              description: "Beautiful diamonds with smart value"
            },
            {
              name: "Custom Specifications",
              href: "/lab-diamonds/custom",
              description: "Build your perfect diamond"
            }
          ]
        },
        {
          title: "By Carat Weight",
          links: [
            {
              name: "Under 0.5 Carat",
              href: "/lab-diamonds/small",
              description: "Delicate and elegant"
            },
            {
              name: "0.5 - 1.0 Carat",
              href: "/lab-diamonds/medium",
              description: "Classic size range"
            },
            {
              name: "1.0 - 2.0 Carat",
              href: "/lab-diamonds/large",
              description: "Statement sizes"
            },
            {
              name: "2.0+ Carat",
              href: "/lab-diamonds/premium-size",
              description: "Luxury statement pieces"
            }
          ]
        }
      ],
      featuredProducts: [
        {
          id: "lab-diamond-solitaire",
          name: "Lab Diamond Solitaire",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&crop=center",
          href: "/products/lab-diamond-solitaire",
          price: "From $2,400"
        },
        {
          id: "lab-diamond-halo",
          name: "Lab Diamond Halo",
          image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&crop=center",
          href: "/products/lab-diamond-halo",
          price: "From $3,200"
        }
      ],
      promotionalBanner: {
        title: "Lab Diamond Deep Dive",
        description: "Same chemistry as mined diamonds, but better for the planet. See why they might be your match.",
        href: "/lab-diamond-analysis"
      }
    }
  },
  {
    id: 'lab-gems',
    label: 'Lab Gems',
    href: '/lab-gems',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6M12 17v6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M1 12h6M17 12h6M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24"/>
    </svg>`,
    badge: 'Colorful',
    megaMenuContent: {
      sections: [
        {
          title: "By Gemstone Type",
          links: [
            {
              name: "Lab Emerald",
              href: "/lab-gems/emerald",
              description: "Vibrant green beryl crystals"
            },
            {
              name: "Lab Ruby",
              href: "/lab-gems/ruby",
              description: "Passionate red corundum"
            },
            {
              name: "Lab Sapphire",
              href: "/lab-gems/sapphire",
              description: "Royal blue and fancy colors"
            },
            {
              name: "Lab Aquamarine",
              href: "/lab-gems/aquamarine",
              description: "Ocean-inspired blue beryl"
            },
            {
              name: "Lab Tanzanite",
              href: "/lab-gems/tanzanite",
              description: "Rare blue-purple zoisite"
            }
          ]
        },
        {
          title: "By Color Family",
          links: [
            {
              name: "Blue Gems",
              href: "/lab-gems/blue",
              description: "Sapphire, aquamarine, tanzanite"
            },
            {
              name: "Red & Pink Gems",
              href: "/lab-gems/red-pink",
              description: "Ruby, pink sapphire, spinel"
            },
            {
              name: "Green Gems",
              href: "/lab-gems/green",
              description: "Emerald, peridot, green garnet"
            },
            {
              name: "Purple Gems",
              href: "/lab-gems/purple",
              description: "Amethyst, purple sapphire"
            },
            {
              name: "Multi-Color Gems",
              href: "/lab-gems/multi-color",
              description: "Alexandrite, color-change gems"
            }
          ]
        }
      ],
      featuredProducts: [
        {
          id: "lab-emerald-ring",
          name: "Lab Emerald Ring",
          image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center",
          href: "/products/lab-emerald-ring",
          price: "From $800"
        },
        {
          id: "lab-sapphire-necklace",
          name: "Lab Sapphire Necklace",
          image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&h=400&fit=crop&crop=center",
          href: "/products/lab-sapphire-necklace",
          price: "From $1,200"
        }
      ],
      promotionalBanner: {
        title: "Your Perfect Colors",
        description: "Find out which gemstone colors actually work with your vibe (there's science behind it).",
        href: "/color-compatibility-analysis"
      }
    }
  },
  {
    id: 'jewelry-types',
    label: 'Jewelry Types',
    href: '/jewelry',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>`,
    megaMenuContent: {
      sections: [
        {
          title: "Rings",
          links: [
            {
              name: "Engagement Rings",
              href: "/rings/engagement",
              description: "Celebrate your forever love"
            },
            {
              name: "Wedding Bands",
              href: "/rings/wedding",
              description: "Perfect pairs for life"
            },
            {
              name: "Fashion Rings",
              href: "/rings/fashion", 
              description: "Express your unique style"
            },
            {
              name: "Men's Rings",
              href: "/rings/mens",
              description: "Bold masculine designs"
            },
            {
              name: "Custom Rings",
              href: "/rings/custom",
              description: "Design your perfect ring"
            }
          ]
        },
        {
          title: "Necklaces & Earrings",
          links: [
            {
              name: "Pendant Necklaces",
              href: "/necklaces/pendants",
              description: "Beautiful centerpiece jewelry"
            },
            {
              name: "Tennis Necklaces",
              href: "/necklaces/tennis",
              description: "Continuous sparkle"
            },
            {
              name: "Stud Earrings",
              href: "/earrings/studs",
              description: "Timeless everyday elegance"
            },
            {
              name: "Drop Earrings",
              href: "/earrings/drops",
              description: "Graceful movement"
            },
            {
              name: "Hoop Earrings",
              href: "/earrings/hoops",
              description: "Classic circular beauty"
            }
          ]
        }
      ],
      featuredProducts: [
        {
          id: "tennis-bracelet",
          name: "Diamond Tennis Bracelet",
          image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center",
          href: "/products/tennis-bracelet",
          price: "From $1,800"
        },
        {
          id: "pendant-necklace",
          name: "Solitaire Pendant",
          image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&crop=center",
          href: "/products/solitaire-pendant",
          price: "From $600"
        }
      ],
      promotionalBanner: {
        title: "Complete Your Look",
        description: "Build coordinated jewelry sets based on your genetic style preferences and compatibility analysis.",
        href: "/jewelry-set-builder"
      }
    }
  },
  {
    id: 'education',
    label: 'The Real Deal',
    href: '/education',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`,
    badge: 'Learn',
    megaMenuContent: {
      sections: [
        {
          title: "Gemstone Science",
          links: [
            {
              name: "Moissanite Properties",
              href: "/education/moissanite-science",
              description: "Silicon carbide crystal structure and properties"
            },
            {
              name: "Lab Diamond Formation",
              href: "/education/lab-diamond-science",
              description: "HPHT and CVD growth processes"
            },
            {
              name: "Gemstone Comparison",
              href: "/education/gemstone-comparison",
              description: "Side-by-side property analysis"
            },
            {
              name: "Genetic Compatibility",
              href: "/education/genetic-compatibility",
              description: "How genetics influence gemstone preference"
            }
          ]
        },
        {
          title: "Jewelry Knowledge",
          links: [
            {
              name: "Metal Types Guide",
              href: "/education/metals",
              description: "Platinum, gold, silver properties"
            },
            {
              name: "Setting Styles",
              href: "/education/settings",
              description: "Prong, bezel, pave, and more"
            },
            {
              name: "Sizing & Fit",
              href: "/education/sizing",
              description: "Perfect fit for every jewelry type"
            },
            {
              name: "Care & Maintenance",
              href: "/education/care",
              description: "Keep your jewelry beautiful forever"
            }
          ]
        }
      ],
      featuredProducts: [
        {
          id: "education-guide",
          name: "Complete Jewelry Guide",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
          href: "/education/complete-guide",
          price: "Free Download"
        },
        {
          id: "genetic-analysis-report",
          name: "Personal Genetic Analysis",
          image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center",
          href: "/education/genetic-analysis",
          price: "Complimentary"
        }
      ],
      promotionalBanner: {
        title: "The Real Deal Education",
        description: "Actually learn about jewelry science without the boring textbook stuff (we promise it's interesting).",
        href: "/education/academy"
      }
    }
  }
]

// Mobile navigation adaptation
export const enhancedMobileNavigation = enhancedNavigationData.map(item => ({
  name: item.label,
  href: item.href,
  icon: item.icon,
  badge: item.badge,
  subcategories: item.megaMenuContent.sections.flatMap(section => 
    section.links.map(link => ({
      name: link.name,
      href: link.href,
      description: link.description
    }))
  )
}))