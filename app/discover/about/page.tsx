import type { Metadata } from 'next'

import { MarketingPage } from '@/components/page-templates/MarketingPage'
import { discoverAboutContent } from '@/content/discoverAbout'

export const metadata: Metadata = {
  title: 'About GlowGlitch',
  description: 'Story, team, and press highlights for GlowGlitch.',
}

export default function DiscoverAboutPage() {
  return <MarketingPage content={discoverAboutContent} />
}
