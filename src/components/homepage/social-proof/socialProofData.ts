// Social Proof Data - Extracted for CLAUDE_RULES compliance
import { Users, Shield, Heart, Truck, Award, TrendingUp } from 'lucide-react'

export interface Testimonial {
  id: string
  name: string
  age: number
  location: string
  rating: number
  content: string
  productType: string
  occasion: string
  image?: string
  verified: boolean
  social?: string
}

export interface CreatorStats {
  totalCreators: number
  averageEarnings: string
  topCreatorEarnings: string
  commissionRate: number
}

export interface TrustSignal {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  stat?: string
}

// Sample testimonial data with authentic Gen Z/Millennial content
export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    name: 'Maya Chen',
    age: 24,
    location: 'Seattle, WA',
    rating: 5,
    content: "Finally found a jewelry brand that gets it! My custom nose ring is literally perfection and knowing it's conflict-free makes me feel even better about wearing it. The whole experience was so transparent and the quality is unmatched.",
    productType: 'Custom Nose Ring',
    occasion: 'Self-expression',
    verified: true,
    social: '@mayavibes'
  },
  {
    id: '2',
    name: 'Jordan Martinez',
    age: 26,
    location: 'Austin, TX',
    rating: 5,
    content: "Proposed with a GlowGlitch ring and it was absolutely magical! The customization process was so easy and my partner was obsessed with the ethical sourcing story. Worth every penny and the lifetime warranty gives us peace of mind.",
    productType: 'Engagement Ring',
    occasion: 'Proposal',
    verified: true,
    social: '@jordan_creates'
  },
  {
    id: '3',
    name: 'Zara Okafor',
    age: 22,
    location: 'Brooklyn, NY',
    rating: 5,
    content: "Been wearing my septum clicker for 6 months and still obsessed! Love that the company is carbon neutral - it aligns with my values. Customer service is also incredible, they actually care about getting it right.",
    productType: 'Septum Clicker',
    occasion: 'Everyday wear',
    verified: true,
    social: '@zarastyle'
  },
  {
    id: '4',
    name: 'Alex Thompson',
    age: 28,
    location: 'Portland, OR',
    rating: 4,
    content: "The ear stack I designed is everything! Process was super intuitive and I love how they show exactly where materials come from. Shipping was fast and packaging was minimal but protective - no unnecessary waste!",
    productType: 'Ear Stack Set',
    occasion: 'Personal style',
    verified: true,
    social: '@alexpiercings'
  },
  {
    id: '5',
    name: 'Riley Park',
    age: 25,
    location: 'Los Angeles, CA',
    rating: 5,
    content: "As someone with sensitive skin, finding body jewelry that doesn't irritate is crucial. These pieces are hypoallergenic AND gorgeous. The fact that 30% goes to creators is amazing - supporting the community!",
    productType: 'Body Jewelry Set',
    occasion: 'Sensitive skin',
    verified: true,
    social: '@rileysstyle'
  },
  {
    id: '6',
    name: 'Sam Rodriguez',
    age: 23,
    location: 'Chicago, IL',
    rating: 5,
    content: "My industrial piercing jewelry is chef's kiss! Love that I could see 3D previews before ordering. The sustainability report they sent with my order really shows they're not just greenwashing - they're the real deal.",
    productType: 'Industrial Barbell',
    occasion: 'New piercing',
    verified: true,
    social: '@sammypierce'
  }
]

// Creator program stats
export const CREATOR_STATS: CreatorStats = {
  totalCreators: 1200,
  averageEarnings: '$850',
  topCreatorEarnings: '$12K',
  commissionRate: 30
}

// Trust signals data
export const TRUST_SIGNALS: TrustSignal[] = [
  {
    icon: Users,
    title: '10,000+ Happy Customers',
    description: 'Join our growing community',
    stat: '4.8/5 avg rating'
  },
  {
    icon: Shield,
    title: 'Lifetime Warranty',
    description: 'Free repairs & replacements',
    stat: 'Forever protected'
  },
  {
    icon: Heart,
    title: 'Conflict-Free Certified',
    description: 'Ethically sourced materials',
    stat: '100% traceable'
  },
  {
    icon: Truck,
    title: 'Carbon Neutral Shipping',
    description: 'Eco-friendly delivery',
    stat: 'Zero emissions'
  },
  {
    icon: Award,
    title: '30-Day Returns',
    description: 'No questions asked',
    stat: '98% satisfaction'
  },
  {
    icon: TrendingUp,
    title: '30% Creator Commission',
    description: 'Industry-leading rates',
    stat: 'Avg $850/month'
  }
]