import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Collections — GlowGlitch',
  description: 'Explore every GlowGlitch collection from one place.',
}

export default function CatalogRedirectPage() {
  redirect('/collections')
}
