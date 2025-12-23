import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'GlowGlitch Support',
  description: 'Concierge contact options, FAQs, and creator program guidance.',
}

export default function SupportPage() {
  redirect('/support/help')
}
