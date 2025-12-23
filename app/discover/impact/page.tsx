import type { Metadata } from 'next'

import { MarketingPage } from '@/components/page-templates/MarketingPage'
import { discoverImpactContent } from '@/content/discoverImpact'

export const metadata: Metadata = {
  title: 'Ethics & Impact | GlowGlitch',
  description: 'Materials, footprint, and partner transparency for GlowGlitch.',
}

export default function DiscoverImpactPage() {
  return <MarketingPage content={discoverImpactContent} />
}
