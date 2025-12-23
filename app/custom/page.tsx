import type { Metadata } from 'next'

import { CustomHubPage } from '@/components/page-templates/CustomHubPage'
import { customHubContent } from '@/content/customHub'

export const metadata: Metadata = {
  title: 'GlowGlitch Custom Studio',
  description: 'Launch the Aurora customizer, browse presets, and learn how the flow works.',
}

export default function CustomHubRoute() {
  return <CustomHubPage content={customHubContent} />
}
