import type { Metadata } from 'next'

import { MarketingPage } from '@/components/page-templates/MarketingPage'
import { discoverPageContent } from '@/content/discover'

export const metadata: Metadata = {
  title: 'Discover GlowGlitch',
  description: 'Story, ethics, and creator community overview for GlowGlitch.',
}

export default function DiscoverPage() {
  return <MarketingPage content={discoverPageContent} />
}
