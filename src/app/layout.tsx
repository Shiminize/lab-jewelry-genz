import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Header, Footer } from '@/components/layout'

export const metadata: Metadata = {
  title: 'GlowGlitch | Custom Lab-Grown Diamond Jewelry',
  description: 'Create unique lab-grown diamond jewelry with our 3D customizer. Ethical, beautiful, and personalized just for you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}