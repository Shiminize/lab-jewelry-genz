import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/ui/Header'
import Footer from '@/components/footer/Footer'
import { SupportWidget } from '@/components/support/SupportWidget'
import { WidgetPrefetch } from '@/components/support/WidgetPrefetch'

export const metadata: Metadata = {
  title: 'GlowGlitch | Neon Dream Jewelry Customization',
  description:
    'Design lab-grown diamond jewelry with our Neon Dream 3D customizer. Ethical, brilliant, and tailored to your style.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative flex min-h-screen flex-col bg-app text-body">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WidgetPrefetch />
        <SupportWidget />
      </body>
    </html>
  )
}
