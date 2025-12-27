import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/ui/Header'
import Footer from '@/components/footer/Footer'
import { SupportWidget } from '@/components/support/SupportWidget'
import { WidgetPrefetch } from '@/components/support/WidgetPrefetch'
import { Providers } from './Providers'

export const metadata: Metadata = {
  title: 'GlowGlitch | Neon Dream Jewelry Customization',
  description:
    'Design lab-grown diamond jewelry with our Neon Dream 3D customizer. Ethical, brilliant, and tailored to your style.',
  icons: {
    icon: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766813032/icon_pk18hv.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative flex min-h-screen flex-col bg-app text-body">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <WidgetPrefetch />
          <SupportWidget />
        </Providers>
      </body>
    </html>
  )
}
